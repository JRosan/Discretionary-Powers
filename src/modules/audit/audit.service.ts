import { db } from "@/db";
import { auditEntries } from "@/db/schema";
import { computeAuditHash } from "@/lib/crypto";
import { desc, eq } from "drizzle-orm";

export interface AuditLogInput {
  decisionId?: string | null;
  userId: string;
  action: string;
  stepNumber?: number | null;
  detail?: Record<string, unknown>;
  ipAddress?: string | null;
}

/**
 * Append-only audit trail service with cryptographic chaining.
 *
 * Each entry includes a SHA-256 hash of its contents combined with
 * the previous entry's hash, creating an immutable chain that can
 * be verified for tamper detection.
 */
export const auditService = {
  /**
   * Log an audit event. Automatically chains to the previous entry.
   */
  async log(input: AuditLogInput) {
    const previousEntry = await db
      .select({ entryHash: auditEntries.entryHash })
      .from(auditEntries)
      .orderBy(desc(auditEntries.id))
      .limit(1);

    const previousHash =
      previousEntry.length > 0 ? previousEntry[0].entryHash : null;

    const now = new Date();

    // Insert with a placeholder hash first to get the real serial ID
    const [inserted] = await db
      .insert(auditEntries)
      .values({
        decisionId: input.decisionId ?? null,
        userId: input.userId,
        action: input.action,
        stepNumber: input.stepNumber ?? null,
        detail: input.detail ?? {},
        ipAddress: input.ipAddress ?? null,
        previousHash,
        entryHash: "pending",
        createdAt: now,
      })
      .returning();

    // Compute the hash with the real database ID
    const entryHash = computeAuditHash({
      id: inserted.id,
      decisionId: input.decisionId ?? null,
      userId: input.userId,
      action: input.action,
      detail: input.detail ?? {},
      previousHash,
      createdAt: now,
    });

    // Update the entry with the correct hash
    const [entry] = await db
      .update(auditEntries)
      .set({ entryHash })
      .where(eq(auditEntries.id, inserted.id))
      .returning();

    return entry;
  },

  /**
   * Get audit trail for a specific decision.
   */
  async getByDecision(decisionId: string, limit = 50, offset = 0) {
    return db
      .select()
      .from(auditEntries)
      .where(eq(auditEntries.decisionId, decisionId))
      .orderBy(desc(auditEntries.createdAt))
      .limit(limit)
      .offset(offset);
  },

  /**
   * Get audit trail for a specific user.
   */
  async getByUser(userId: string, limit = 50, offset = 0) {
    return db
      .select()
      .from(auditEntries)
      .where(eq(auditEntries.userId, userId))
      .orderBy(desc(auditEntries.createdAt))
      .limit(limit)
      .offset(offset);
  },

  /**
   * Get all audit entries (paginated) for system-wide audit.
   */
  async getAll(limit = 50, offset = 0) {
    return db
      .select()
      .from(auditEntries)
      .orderBy(desc(auditEntries.createdAt))
      .limit(limit)
      .offset(offset);
  },
};
