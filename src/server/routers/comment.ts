import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { commentService } from "@/modules/comments";
import { auditService } from "@/modules/audit/audit.service";

export const commentRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        decisionId: z.string().uuid(),
        content: z.string().min(1).max(5000),
        isInternal: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const comment = await commentService.create({
        decisionId: input.decisionId,
        userId: ctx.user.id,
        content: input.content,
        isInternal: input.isInternal,
      });

      await auditService.log({
        decisionId: input.decisionId,
        userId: ctx.user.id,
        action: "comment.created",
        detail: {
          commentId: comment.id,
          isInternal: input.isInternal,
        },
        ipAddress: ctx.ip,
      });

      return comment;
    }),

  list: protectedProcedure
    .input(z.object({ decisionId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const includeInternal = ctx.user.role !== "public";
      return commentService.getByDecision(input.decisionId, includeInternal);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const comment = await commentService.getById(input.id);

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found.",
        });
      }

      if (
        comment.userId !== ctx.user.id &&
        ctx.user.role !== "permanent_secretary"
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Only the comment author or a permanent secretary can delete comments.",
        });
      }

      await commentService.delete(input.id);

      await auditService.log({
        decisionId: comment.decisionId,
        userId: ctx.user.id,
        action: "comment.deleted",
        detail: { commentId: input.id },
        ipAddress: ctx.ip,
      });

      return { success: true };
    }),

  count: protectedProcedure
    .input(z.object({ decisionId: z.string().uuid() }))
    .query(async ({ input }) => {
      return commentService.count(input.decisionId);
    }),
});
