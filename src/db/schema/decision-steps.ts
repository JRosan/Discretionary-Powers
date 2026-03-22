import {
  pgTable,
  uuid,
  integer,
  timestamp,
  jsonb,
  text,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { stepStatusEnum } from "./enums";
import { decisions } from "./decisions";
import { users } from "./users";

export const decisionSteps = pgTable(
  "decision_steps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    decisionId: uuid("decision_id")
      .references(() => decisions.id)
      .notNull(),
    stepNumber: integer("step_number").notNull(),
    status: stepStatusEnum("status").notNull().default("not_started"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    completedBy: uuid("completed_by").references(() => users.id),
    data: jsonb("data"),
    notes: text("notes"),
    evidence: jsonb("evidence"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("decision_steps_decision_step_unique").on(
      table.decisionId,
      table.stepNumber
    ),
  ]
);

export const decisionStepsRelations = relations(decisionSteps, ({ one }) => ({
  decision: one(decisions, {
    fields: [decisionSteps.decisionId],
    references: [decisions.id],
  }),
  completedByUser: one(users, {
    fields: [decisionSteps.completedBy],
    references: [users.id],
  }),
}));
