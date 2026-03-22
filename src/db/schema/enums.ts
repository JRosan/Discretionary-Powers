import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "minister",
  "permanent_secretary",
  "legal_advisor",
  "auditor",
  "public",
]);

export const decisionStatusEnum = pgEnum("decision_status", [
  "draft",
  "in_progress",
  "under_review",
  "approved",
  "published",
  "challenged",
  "withdrawn",
]);

export const stepStatusEnum = pgEnum("step_status", [
  "not_started",
  "in_progress",
  "completed",
  "skipped_with_reason",
]);

export const decisionTypeEnum = pgEnum("decision_type", [
  "regulatory",
  "licensing",
  "planning",
  "financial",
  "appointment",
  "policy",
  "enforcement",
  "other",
]);

export const judicialReviewGroundEnum = pgEnum("judicial_review_ground", [
  "illegality",
  "irrationality",
  "procedural_impropriety",
  "proportionality",
]);

export const documentClassificationEnum = pgEnum("document_classification", [
  "evidence",
  "legal_opinion",
  "correspondence",
  "public_notice",
  "internal_memo",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "assignment",
  "approval_needed",
  "overdue",
  "status_change",
  "comment",
  "judicial_review",
]);
