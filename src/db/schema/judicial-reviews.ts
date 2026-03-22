import {
  pgTable,
  uuid,
  text,
  date,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { judicialReviewGroundEnum } from "./enums";
import { decisions } from "./decisions";
import { users } from "./users";

export const judicialReviews = pgTable("judicial_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  decisionId: uuid("decision_id")
    .references(() => decisions.id)
    .notNull(),
  ground: judicialReviewGroundEnum("ground").notNull(),
  status: text("status").notNull().default("filed"),
  filedDate: date("filed_date").notNull(),
  courtReference: text("court_reference"),
  outcome: text("outcome"),
  notes: text("notes"),
  createdBy: uuid("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const judicialReviewsRelations = relations(
  judicialReviews,
  ({ one }) => ({
    decision: one(decisions, {
      fields: [judicialReviews.decisionId],
      references: [decisions.id],
    }),
    creator: one(users, {
      fields: [judicialReviews.createdBy],
      references: [users.id],
    }),
  })
);
