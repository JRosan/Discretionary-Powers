import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  generateStorageKey,
  getUploadUrl,
  getDownloadUrl,
  deleteObject,
} from "./storage.adapter";

export const documentService = {
  async create(input: {
    decisionId: string;
    filename: string;
    originalFilename: string;
    mimeType: string;
    sizeBytes: number;
    storageKey: string;
    classification: string;
    uploadedBy: string;
  }) {
    const [doc] = await db
      .insert(documents)
      .values({
        decisionId: input.decisionId,
        filename: input.filename,
        originalFilename: input.originalFilename,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        storageKey: input.storageKey,
        classification: input.classification as "evidence" | "legal_opinion" | "correspondence" | "public_notice" | "internal_memo",
        uploadedBy: input.uploadedBy,
      })
      .returning();

    return doc;
  },

  async getByDecision(decisionId: string) {
    return db
      .select()
      .from(documents)
      .where(eq(documents.decisionId, decisionId));
  },

  async getById(id: string) {
    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);

    return doc ?? null;
  },

  async delete(id: string) {
    const doc = await this.getById(id);
    if (doc) {
      await deleteObject(doc.storageKey);
      await db.delete(documents).where(eq(documents.id, id));
    }
  },

  async getUploadUrl(
    decisionId: string,
    filename: string,
    contentType: string,
    classification: string,
    uploadedBy: string,
  ) {
    const storageKey = generateStorageKey(decisionId, filename);

    const doc = await this.create({
      decisionId,
      filename,
      originalFilename: filename,
      mimeType: contentType,
      sizeBytes: 0,
      storageKey,
      classification,
      uploadedBy,
    });

    const uploadUrl = await getUploadUrl(storageKey, contentType);

    return {
      uploadUrl,
      storageKey,
      documentId: doc.id,
    };
  },

  async confirmUpload(documentId: string, sizeBytes: number) {
    const [doc] = await db
      .update(documents)
      .set({ sizeBytes })
      .where(eq(documents.id, documentId))
      .returning();

    return doc;
  },

  async getDownloadUrl(storageKey: string) {
    return getDownloadUrl(storageKey);
  },
};
