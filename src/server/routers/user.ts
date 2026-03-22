import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { hash } from "bcryptjs";
import { router, protectedProcedure, roleProcedure } from "../trpc";
import { db } from "../../db";
import { users, ministries } from "../../db/schema";

const userRoleValues = [
  "minister",
  "permanent_secretary",
  "legal_advisor",
  "auditor",
  "public",
] as const;

export const userRouter = router({
  list: roleProcedure("permanent_secretary", "auditor")
    .input(
      z
        .object({
          ministryId: z.string().uuid().optional(),
          role: z.enum(userRoleValues).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const conditions = [];
      if (input?.ministryId) {
        conditions.push(eq(users.ministryId, input.ministryId));
      }
      if (input?.role) {
        conditions.push(eq(users.role, input.role));
      }

      const rows = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          ministryId: users.ministryId,
          active: users.active,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          ministryName: ministries.name,
        })
        .from(users)
        .leftJoin(ministries, eq(users.ministryId, ministries.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(users.name);

      return rows;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          ministryId: users.ministryId,
          active: users.active,
          mfaEnabled: users.mfaEnabled,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          ministryName: ministries.name,
        })
        .from(users)
        .leftJoin(ministries, eq(users.ministryId, ministries.id))
        .where(eq(users.id, input.id));
      return user ?? null;
    }),

  create: roleProcedure("permanent_secretary")
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(1),
        role: z.enum(userRoleValues),
        ministryId: z.string().uuid(),
        password: z.string().min(8).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const passwordHash = input.password
        ? await hash(input.password, 12)
        : null;

      const [user] = await db
        .insert(users)
        .values({
          email: input.email,
          name: input.name,
          role: input.role,
          ministryId: input.ministryId,
          passwordHash,
        })
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          ministryId: users.ministryId,
          active: users.active,
          createdAt: users.createdAt,
        });
      return user;
    }),

  update: roleProcedure("permanent_secretary")
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        role: z.enum(userRoleValues).optional(),
        ministryId: z.string().uuid().optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const [user] = await db
        .update(users)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          ministryId: users.ministryId,
          active: users.active,
          updatedAt: users.updatedAt,
        });
      return user;
    }),

  deactivate: roleProcedure("permanent_secretary")
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const [user] = await db
        .update(users)
        .set({ active: false, updatedAt: new Date() })
        .where(eq(users.id, input.id))
        .returning({ id: users.id, active: users.active });
      return user;
    }),
});
