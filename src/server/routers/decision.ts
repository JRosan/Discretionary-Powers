import { router, protectedProcedure, roleProcedure } from "../trpc";
import { z } from "zod";
import { db } from "@/db";
import { decisions, decisionSteps, judicialReviews } from "@/db/schema";
import { eq, desc, and, ilike, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { workflowMachine } from "@/modules/decisions/workflow.machine";
import {
  createDecisionSchema,
  advanceStepSchema,
  approveDecisionSchema,
  publishDecisionSchema,
  flagForReviewSchema,
  listDecisionsSchema,
  stepSchemas,
} from "@/modules/decisions/decision.schema";
import { auditService } from "@/modules/audit/audit.service";

function generateReferenceNumber(ministryCode: string): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `DP-${ministryCode}-${year}-${seq}`;
}

export const decisionRouter = router({
  /** Create a new decision */
  create: roleProcedure("minister", "permanent_secretary").input(createDecisionSchema).mutation(async ({ input, ctx }) => {
    const referenceNumber = generateReferenceNumber("GEN");

    const [decision] = await db
      .insert(decisions)
      .values({
        referenceNumber,
        title: input.title,
        description: input.description ?? null,
        ministryId: input.ministryId,
        decisionType: input.decisionType,
        status: "draft",
        currentStep: 1,
        createdBy: ctx.user.id,
        assignedTo: input.assignedTo ?? null,
        deadline: input.deadline ? new Date(input.deadline) : null,
      })
      .returning();

    // Create the 10 step records
    const stepValues = Array.from({ length: 10 }, (_, i) => ({
      decisionId: decision.id,
      stepNumber: i + 1,
      status: "not_started" as const,
    }));

    await db.insert(decisionSteps).values(stepValues);

    await auditService.log({
      decisionId: decision.id,
      userId: ctx.user.id,
      action: "decision.created",
      detail: { title: input.title, type: input.decisionType },
      ipAddress: ctx.ip,
    });

    return decision;
  }),

  /** Get a single decision by ID with its steps */
  getById: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input }) => {
    const [decision] = await db
      .select()
      .from(decisions)
      .where(eq(decisions.id, input.id))
      .limit(1);

    if (!decision) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Decision not found." });
    }

    const steps = await db
      .select()
      .from(decisionSteps)
      .where(eq(decisionSteps.decisionId, input.id))
      .orderBy(decisionSteps.stepNumber);

    return { ...decision, steps };
  }),

  /** List decisions with filtering and pagination */
  list: protectedProcedure.input(listDecisionsSchema).query(async ({ input }) => {
    const conditions = [];

    if (input.ministryId) {
      conditions.push(eq(decisions.ministryId, input.ministryId));
    }
    if (input.status) {
      conditions.push(eq(decisions.status, input.status));
    }
    if (input.decisionType) {
      conditions.push(eq(decisions.decisionType, input.decisionType));
    }
    if (input.assignedTo) {
      conditions.push(eq(decisions.assignedTo, input.assignedTo));
    }
    if (input.search) {
      conditions.push(ilike(decisions.title, `%${input.search}%`));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const items = await db
      .select()
      .from(decisions)
      .where(where)
      .orderBy(desc(decisions.createdAt))
      .limit(input.limit + 1);

    const hasMore = items.length > input.limit;
    if (hasMore) items.pop();

    return {
      items,
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]?.id : null,
    };
  }),

  /** Advance a decision through the 10-step workflow */
  advanceStep: protectedProcedure.input(advanceStepSchema).mutation(async ({ input, ctx }) => {
    const [decision] = await db
      .select()
      .from(decisions)
      .where(eq(decisions.id, input.decisionId))
      .limit(1);

    if (!decision) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Decision not found." });
    }

    // Build current workflow state from step records
    const steps = await db
      .select()
      .from(decisionSteps)
      .where(eq(decisionSteps.decisionId, input.decisionId))
      .orderBy(decisionSteps.stepNumber);

    const stepStatuses: Record<number, "not_started" | "in_progress" | "completed" | "skipped_with_reason"> = {};
    for (const step of steps) {
      stepStatuses[step.stepNumber] = step.status as "not_started" | "in_progress" | "completed" | "skipped_with_reason";
    }

    const currentState = {
      currentStep: decision.currentStep,
      decisionStatus: decision.status as "draft" | "in_progress" | "under_review" | "approved" | "published" | "challenged" | "withdrawn",
      stepStatuses,
    };

    // Validate step data if completing
    if (input.action === "complete" && input.data) {
      const schema = stepSchemas[input.stepNumber];
      if (schema) {
        const result = schema.safeParse(input.data);
        if (!result.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Step ${input.stepNumber} data validation failed.`,
            cause: result.error,
          });
        }
      }
    }

    // Apply transition
    const newState = workflowMachine.applyTransition(currentState, {
      stepNumber: input.stepNumber,
      action: input.action,
      skipReason: input.skipReason,
    });

    // Update the step record
    const now = new Date();
    const stepUpdate: Record<string, unknown> = {
      status: newState.stepStatuses[input.stepNumber],
      updatedAt: now,
    };

    if (input.action === "start") {
      stepUpdate.startedAt = now;
    }
    if (input.action === "complete") {
      stepUpdate.completedAt = now;
      stepUpdate.completedBy = ctx.user.id;
      if (input.data) stepUpdate.data = input.data;
    }
    if (input.notes) {
      stepUpdate.notes = input.notes;
    }

    await db
      .update(decisionSteps)
      .set(stepUpdate)
      .where(
        and(
          eq(decisionSteps.decisionId, input.decisionId),
          eq(decisionSteps.stepNumber, input.stepNumber)
        )
      );

    // Update the decision
    await db
      .update(decisions)
      .set({
        currentStep: newState.currentStep,
        status: newState.decisionStatus,
        updatedAt: now,
      })
      .where(eq(decisions.id, input.decisionId));

    await auditService.log({
      decisionId: input.decisionId,
      userId: ctx.user.id,
      action: `step.${input.action}`,
      stepNumber: input.stepNumber,
      detail: {
        action: input.action,
        stepNumber: input.stepNumber,
        skipReason: input.skipReason,
        newStatus: newState.decisionStatus,
      },
      ipAddress: ctx.ip,
    });

    return { ...decision, ...newState };
  }),

  /** Approve a decision (minister only) */
  approve: roleProcedure("minister").input(approveDecisionSchema).mutation(async ({ input, ctx }) => {
    const [decision] = await db
      .select()
      .from(decisions)
      .where(eq(decisions.id, input.decisionId))
      .limit(1);

    if (!decision) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Decision not found." });
    }

    if (decision.status !== "under_review") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Only decisions under review can be approved.",
      });
    }

    await db
      .update(decisions)
      .set({ status: "approved", updatedAt: new Date() })
      .where(eq(decisions.id, input.decisionId));

    await auditService.log({
      decisionId: input.decisionId,
      userId: ctx.user.id,
      action: "decision.approved",
      detail: { notes: input.notes },
      ipAddress: ctx.ip,
    });

    return { success: true };
  }),

  /** Publish a decision (makes it visible on the public portal) */
  publish: roleProcedure("minister").input(publishDecisionSchema).mutation(async ({ input, ctx }) => {
    const [decision] = await db
      .select()
      .from(decisions)
      .where(eq(decisions.id, input.decisionId))
      .limit(1);

    if (!decision) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Decision not found." });
    }

    if (decision.status !== "approved") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Only approved decisions can be published.",
      });
    }

    await db
      .update(decisions)
      .set({
        status: "published",
        isPublic: true,
        updatedAt: new Date(),
      })
      .where(eq(decisions.id, input.decisionId));

    await auditService.log({
      decisionId: input.decisionId,
      userId: ctx.user.id,
      action: "decision.published",
      ipAddress: ctx.ip,
    });

    return { success: true };
  }),

  /** Flag a decision for judicial review */
  flagForReview: roleProcedure("legal_advisor", "auditor").input(flagForReviewSchema).mutation(async ({ input, ctx }) => {
    const [decision] = await db
      .select()
      .from(decisions)
      .where(eq(decisions.id, input.decisionId))
      .limit(1);

    if (!decision) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Decision not found." });
    }

    const [review] = await db
      .insert(judicialReviews)
      .values({
        decisionId: input.decisionId,
        ground: input.ground,
        status: "filed",
        filedDate: new Date().toISOString().split("T")[0],
        notes: input.notes ?? null,
        createdBy: ctx.user.id,
      })
      .returning();

    await db
      .update(decisions)
      .set({
        judicialReviewFlag: true,
        status: "challenged",
        updatedAt: new Date(),
      })
      .where(eq(decisions.id, input.decisionId));

    await auditService.log({
      decisionId: input.decisionId,
      userId: ctx.user.id,
      action: "decision.flagged_for_review",
      detail: { ground: input.ground, notes: input.notes },
      ipAddress: ctx.ip,
    });

    return review;
  }),

  /** Get decision statistics for dashboard */
  stats: protectedProcedure.query(async () => {
    const result = await db
      .select({
        status: decisions.status,
        count: sql<number>`count(*)::int`,
      })
      .from(decisions)
      .groupBy(decisions.status);

    const total = result.reduce((sum, r) => sum + r.count, 0);

    return {
      total,
      byStatus: Object.fromEntries(result.map((r) => [r.status, r.count])),
    };
  }),
});
