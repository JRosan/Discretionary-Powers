import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { notificationService } from "@/modules/notifications/notification.service";

export const notificationRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }).default({})
    )
    .query(async ({ input, ctx }) => {
      return notificationService.getByUser(ctx.user.id, input.limit, input.offset);
    }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    return notificationService.getUnreadCount(ctx.user.id);
  }),

  markRead: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await notificationService.markRead(input.id);
    }),

  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    await notificationService.markAllRead(ctx.user.id);
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await notificationService.delete(input.id);
    }),
});
