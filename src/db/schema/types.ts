import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { ministries } from "./ministries";
import type { users } from "./users";
import type { decisions } from "./decisions";
import type { decisionSteps } from "./decision-steps";
import type { documents } from "./documents";
import type { auditEntries } from "./audit-entries";
import type { judicialReviews } from "./judicial-reviews";
import type { notifications } from "./notifications";
import type { comments } from "./comments";

export type Ministry = InferSelectModel<typeof ministries>;
export type NewMinistry = InferInsertModel<typeof ministries>;

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Decision = InferSelectModel<typeof decisions>;
export type NewDecision = InferInsertModel<typeof decisions>;

export type DecisionStep = InferSelectModel<typeof decisionSteps>;
export type NewDecisionStep = InferInsertModel<typeof decisionSteps>;

export type Document = InferSelectModel<typeof documents>;
export type NewDocument = InferInsertModel<typeof documents>;

export type AuditEntry = InferSelectModel<typeof auditEntries>;
export type NewAuditEntry = InferInsertModel<typeof auditEntries>;

export type JudicialReview = InferSelectModel<typeof judicialReviews>;
export type NewJudicialReview = InferInsertModel<typeof judicialReviews>;

export type Notification = InferSelectModel<typeof notifications>;
export type NewNotification = InferInsertModel<typeof notifications>;

export type Comment = InferSelectModel<typeof comments>;
export type NewComment = InferInsertModel<typeof comments>;
