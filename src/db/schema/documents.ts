import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { documentClassificationEnum } from "./enums";
import { decisions } from "./decisions";
import { users } from "./users";

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  decisionId: uuid("decision_id")
    .references(() => decisions.id)
    .notNull(),
  filename: text("filename").notNull(),
  originalFilename: text("original_filename").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  storageKey: text("storage_key").notNull(),
  classification: documentClassificationEnum("classification").notNull(),
  uploadedBy: uuid("uploaded_by")
    .references(() => users.id)
    .notNull(),
  version: integer("version").notNull().default(1),
  isRedacted: boolean("is_redacted").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const documentsRelations = relations(documents, ({ one }) => ({
  decision: one(decisions, {
    fields: [documents.decisionId],
    references: [decisions.id],
  }),
  uploader: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
}));
