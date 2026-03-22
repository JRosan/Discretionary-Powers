import { createHash } from "crypto";

/**
 * Compute SHA-256 hash for an audit entry, creating a cryptographic chain.
 * Each entry's hash includes the previous entry's hash, making the chain
 * tamper-evident.
 */
export function computeAuditHash(entry: {
  id: string | number;
  decisionId: string | null;
  userId: string;
  action: string;
  detail: unknown;
  previousHash: string | null;
  createdAt: Date | string;
}): string {
  const payload = [
    String(entry.id),
    entry.decisionId ?? "",
    entry.userId,
    entry.action,
    JSON.stringify(entry.detail ?? {}),
    entry.previousHash ?? "GENESIS",
    new Date(entry.createdAt).toISOString(),
  ].join("|");

  return createHash("sha256").update(payload).digest("hex");
}

/**
 * Verify that an audit entry's hash matches the expected computation.
 */
export function verifyAuditHash(entry: {
  id: string | number;
  decisionId: string | null;
  userId: string;
  action: string;
  detail: unknown;
  previousHash: string | null;
  entryHash: string;
  createdAt: Date | string;
}): boolean {
  const computed = computeAuditHash(entry);
  return computed === entry.entryHash;
}
