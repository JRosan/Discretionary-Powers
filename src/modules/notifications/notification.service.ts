import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export interface CreateNotificationInput {
  userId: string;
  decisionId?: string | null;
  type: "assignment" | "approval_needed" | "overdue" | "status_change" | "comment" | "judicial_review";
  title: string;
  message: string;
}

export const notificationService = {
  async create(input: CreateNotificationInput) {
    const [notification] = await db
      .insert(notifications)
      .values({
        userId: input.userId,
        decisionId: input.decisionId ?? null,
        type: input.type,
        title: input.title,
        message: input.message,
      })
      .returning();

    return notification;
  },

  async getByUser(userId: string, limit = 20, offset = 0) {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.sentAt))
      .limit(limit)
      .offset(offset);
  },

  async getUnreadCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));

    return result?.count ?? 0;
  },

  async markRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true, readAt: new Date() })
      .where(eq(notifications.id, id));
  },

  async markAllRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true, readAt: new Date() })
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
  },

  async delete(id: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  },
};
