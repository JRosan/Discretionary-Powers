import { z } from "zod";
import { eq } from "drizzle-orm";
import { router, protectedProcedure, roleProcedure } from "../trpc";
import { db } from "../../db";
import { ministries } from "../../db/schema";

export const ministryRouter = router({
  list: protectedProcedure.query(async () => {
    return db
      .select()
      .from(ministries)
      .where(eq(ministries.active, true))
      .orderBy(ministries.name);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const [ministry] = await db
        .select()
        .from(ministries)
        .where(eq(ministries.id, input.id));
      return ministry ?? null;
    }),

  create: roleProcedure("permanent_secretary")
    .input(
      z.object({
        name: z.string().min(1),
        code: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const [ministry] = await db
        .insert(ministries)
        .values({ name: input.name, code: input.code })
        .returning();
      return ministry;
    }),

  update: roleProcedure("permanent_secretary")
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        code: z.string().min(1).optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const [ministry] = await db
        .update(ministries)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(ministries.id, id))
        .returning();
      return ministry;
    }),
});
