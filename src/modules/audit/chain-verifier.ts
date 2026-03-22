import { db } from "@/db";
import { auditEntries } from "@/db/schema";
import { verifyAuditHash } from "@/lib/crypto";
import { asc } from "drizzle-orm";

export interface VerificationResult {
  totalEntries: number;
  verifiedEntries: number;
  failedEntries: number;
  failures: Array<{
    id: number | string;
    expectedHash: string;
    actualHash: string;
    createdAt: Date | string;
  }>;
  isIntact: boolean;
  verifiedAt: Date;
}

/**
 * Verify the integrity of the entire audit chain.
 *
 * Walks through all entries in order and verifies:
 * 1. Each entry's hash matches its content
 * 2. Each entry's previousHash matches the prior entry's entryHash
 *
 * Any break in the chain indicates tampering.
 */
export async function verifyAuditChain(): Promise<VerificationResult> {
  const entries = await db
    .select()
    .from(auditEntries)
    .orderBy(asc(auditEntries.id));

  const result: VerificationResult = {
    totalEntries: entries.length,
    verifiedEntries: 0,
    failedEntries: 0,
    failures: [],
    isIntact: true,
    verifiedAt: new Date(),
  };

  let lastHash: string | null = null;

  for (const entry of entries) {
    // Verify chain linkage
    if (entry.previousHash !== lastHash) {
      result.failures.push({
        id: entry.id,
        expectedHash: lastHash ?? "null",
        actualHash: entry.previousHash ?? "null",
        createdAt: entry.createdAt,
      });
      result.failedEntries++;
      result.isIntact = false;
    }

    // Verify entry hash integrity
    const hashValid = verifyAuditHash({
      id: entry.id,
      decisionId: entry.decisionId,
      userId: entry.userId,
      action: entry.action,
      detail: entry.detail,
      previousHash: entry.previousHash,
      entryHash: entry.entryHash,
      createdAt: entry.createdAt,
    });

    if (!hashValid) {
      result.failures.push({
        id: entry.id,
        expectedHash: "computed hash mismatch",
        actualHash: entry.entryHash,
        createdAt: entry.createdAt,
      });
      result.failedEntries++;
      result.isIntact = false;
    } else {
      result.verifiedEntries++;
    }

    lastHash = entry.entryHash;
  }

  return result;
}
