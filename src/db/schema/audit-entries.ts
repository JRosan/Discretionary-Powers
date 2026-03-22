import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
  bigserial,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { decisions } from "./decisions";
import { users } from "./users";

export const auditEntries = pgTable(
  "audit_entries",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    decisionId: uuid("decision_id").references(() => decisions.id),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    action: text("action").notNull(),
    stepNumber: integer("step_number"),
    detail: jsonb("detail"),
    ipAddress: text("ip_address"),
    previousHash: text("previous_hash"),
    entryHash: text("entry_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_entries_decision_id_idx").on(table.decisionId),
    index("audit_entries_user_id_idx").on(table.userId),
    index("audit_entries_created_at_idx").on(table.createdAt),
  ]
);

export const auditEntriesRelations = relations(auditEntries, ({ one }) => ({
  decision: one(decisions, {
    fields: [auditEntries.decisionId],
    references: [decisions.id],
  }),
  user: one(users, {
    fields: [auditEntries.userId],
    references: [users.id],
  }),
}));
