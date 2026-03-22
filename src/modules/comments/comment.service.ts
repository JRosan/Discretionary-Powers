import { db } from "@/db";
import { comments, users } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export interface CommentWithUser {
  id: string;
  decisionId: string;
  userId: string;
  content: string;
  isInternal: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  userName: string;
  userRole: string;
}

export const commentService = {
  async create(input: {
    decisionId: string;
    userId: string;
    content: string;
    isInternal: boolean;
  }) {
    const [comment] = await db
      .insert(comments)
      .values({
        decisionId: input.decisionId,
        userId: input.userId,
        content: input.content,
        isInternal: input.isInternal,
      })
      .returning();

    return comment;
  },

  async getByDecision(
    decisionId: string,
    includeInternal: boolean
  ): Promise<CommentWithUser[]> {
    const conditions = [eq(comments.decisionId, decisionId)];

    if (!includeInternal) {
      conditions.push(eq(comments.isInternal, false));
    }

    const rows = await db
      .select({
        id: comments.id,
        decisionId: comments.decisionId,
        userId: comments.userId,
        content: comments.content,
        isInternal: comments.isInternal,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        userName: users.name,
        userRole: users.role,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(and(...conditions))
      .orderBy(comments.createdAt);

    return rows;
  },

  async delete(id: string): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  },

  async count(decisionId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(comments)
      .where(eq(comments.decisionId, decisionId));

    return result?.count ?? 0;
  },

  async getById(id: string) {
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id))
      .limit(1);

    return comment ?? null;
  },
};
