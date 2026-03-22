import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { documentService } from "@/modules/documents/document.service";
import { auditService } from "@/modules/audit/audit.service";

export const documentRouter = router({
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        decisionId: z.string().uuid(),
        filename: z.string().min(1),
        contentType: z.string().min(1),
        classification: z.enum([
          "evidence",
          "legal_opinion",
          "correspondence",
          "public_notice",
          "internal_memo",
        ]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const result = await documentService.getUploadUrl(
        input.decisionId,
        input.filename,
        input.contentType,
        input.classification,
        ctx.user.id,
      );

      await auditService.log({
        decisionId: input.decisionId,
        userId: ctx.user.id,
        action: "document.upload_initiated",
        detail: {
          filename: input.filename,
          classification: input.classification,
          documentId: result.documentId,
        },
        ipAddress: ctx.ip,
      });

      return result;
    }),

  confirmUpload: protectedProcedure
    .input(
      z.object({
        documentId: z.string().uuid(),
        sizeBytes: z.number().int().positive(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const doc = await documentService.getById(input.documentId);
      if (!doc) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found.",
        });
      }

      const updated = await documentService.confirmUpload(
        input.documentId,
        input.sizeBytes,
      );

      await auditService.log({
        decisionId: doc.decisionId,
        userId: ctx.user.id,
        action: "document.upload_confirmed",
        detail: {
          documentId: input.documentId,
          sizeBytes: input.sizeBytes,
        },
        ipAddress: ctx.ip,
      });

      return updated;
    }),

  list: protectedProcedure
    .input(z.object({ decisionId: z.string().uuid() }))
    .query(async ({ input }) => {
      return documentService.getByDecision(input.decisionId);
    }),

  getDownloadUrl: protectedProcedure
    .input(z.object({ documentId: z.string().uuid() }))
    .query(async ({ input }) => {
      const doc = await documentService.getById(input.documentId);
      if (!doc) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found.",
        });
      }

      const url = await documentService.getDownloadUrl(doc.storageKey);
      return { url, filename: doc.originalFilename };
    }),

  delete: protectedProcedure
    .input(z.object({ documentId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const doc = await documentService.getById(input.documentId);
      if (!doc) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found.",
        });
      }

      await documentService.delete(input.documentId);

      await auditService.log({
        decisionId: doc.decisionId,
        userId: ctx.user.id,
        action: "document.deleted",
        detail: {
          documentId: input.documentId,
          filename: doc.originalFilename,
        },
        ipAddress: ctx.ip,
      });

      return { success: true };
    }),
});
