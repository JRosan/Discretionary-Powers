import { router, protectedProcedure, roleProcedure } from "../trpc";
import { z } from "zod";
import { auditService } from "@/modules/audit/audit.service";
import { verifyAuditChain } from "@/modules/audit/chain-verifier";

export const auditRouter = router({
  /** Get audit trail for a decision */
  getByDecision: roleProcedure("permanent_secretary", "legal_advisor", "auditor")
    .input(
      z.object({
        decisionId: z.string().uuid(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      return auditService.getByDecision(input.decisionId, input.limit, input.offset);
    }),

  /** Get all audit entries (auditors only) */
  getAll: roleProcedure("auditor")
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      return auditService.getAll(input.limit, input.offset);
    }),

  /** Verify audit chain integrity (auditors only) */
  verifyChain: roleProcedure("auditor").mutation(async () => {
    return verifyAuditChain();
  }),
});
