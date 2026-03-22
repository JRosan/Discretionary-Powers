import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { decisionStatusEnum, decisionTypeEnum } from "./enums";
import { ministries } from "./ministries";
import { users } from "./users";
import { decisionSteps } from "./decision-steps";
import { documents } from "./documents";
import { auditEntries } from "./audit-entries";
import { judicialReviews } from "./judicial-reviews";
import { comments } from "./comments";
import { notifications } from "./notifications";

export const decisions = pgTable(
  "decisions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    referenceNumber: text("reference_number").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    ministryId: uuid("ministry_id")
      .references(() => ministries.id)
      .notNull(),
    decisionType: decisionTypeEnum("decision_type").notNull(),
    status: decisionStatusEnum("status").notNull().default("draft"),
    currentStep: integer("current_step").notNull().default(1),
    createdBy: uuid("created_by")
      .references(() => users.id)
      .notNull(),
    assignedTo: uuid("assigned_to").references(() => users.id),
    isPublic: boolean("is_public").default(false),
    judicialReviewFlag: boolean("judicial_review_flag").default(false),
    deadline: timestamp("deadline", { withTimezone: true }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("decisions_ministry_id_idx").on(table.ministryId),
    index("decisions_status_idx").on(table.status),
    index("decisions_created_by_idx").on(table.createdBy),
    index("decisions_assigned_to_idx").on(table.assignedTo),
    index("decisions_reference_number_idx").on(table.referenceNumber),
  ]
);

export const decisionsRelations = relations(decisions, ({ one, many }) => ({
  ministry: one(ministries, {
    fields: [decisions.ministryId],
    references: [ministries.id],
  }),
  creator: one(users, {
    fields: [decisions.createdBy],
    references: [users.id],
    relationName: "createdBy",
  }),
  assignee: one(users, {
    fields: [decisions.assignedTo],
    references: [users.id],
    relationName: "assignedTo",
  }),
  steps: many(decisionSteps),
  documents: many(documents),
  auditEntries: many(auditEntries),
  judicialReviews: many(judicialReviews),
  comments: many(comments),
  notifications: many(notifications),
}));
