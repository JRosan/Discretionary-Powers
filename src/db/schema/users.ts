import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userRoleEnum } from "./enums";
import { ministries } from "./ministries";
import { decisions } from "./decisions";
import { auditEntries } from "./audit-entries";
import { comments } from "./comments";
import { notifications } from "./notifications";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").notNull(),
  ministryId: uuid("ministry_id").references(() => ministries.id),
  mfaEnabled: boolean("mfa_enabled").default(false),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  ministry: one(ministries, {
    fields: [users.ministryId],
    references: [ministries.id],
  }),
  createdDecisions: many(decisions, { relationName: "createdBy" }),
  assignedDecisions: many(decisions, { relationName: "assignedTo" }),
  auditEntries: many(auditEntries),
  comments: many(comments),
  notifications: many(notifications),
}));
