export const DECISION_STEPS = [
  { number: 1, name: "Confirm Authority", description: "Verify the legal basis and scope of the discretionary power being exercised." },
  { number: 2, name: "Follow Procedures", description: "Identify and follow all required statutory and administrative procedures." },
  { number: 3, name: "Gather Information", description: "Collect all relevant facts, data, and evidence needed for the decision." },
  { number: 4, name: "Evaluate Evidence", description: "Assess the quality, reliability, and relevance of all gathered evidence." },
  { number: 5, name: "Apply Standard of Proof", description: "Apply the correct standard of proof appropriate to the type of decision." },
  { number: 6, name: "Act Fairly Without Bias", description: "Ensure the decision-maker has no conflict of interest and acts impartially." },
  { number: 7, name: "Ensure Procedural Fairness", description: "Give affected parties the right to be heard and to respond to evidence." },
  { number: 8, name: "Consider Merits", description: "Weigh all relevant factors and consider the merits of each case individually." },
  { number: 9, name: "Communicate Outcome", description: "Clearly communicate the decision and provide reasons to affected parties." },
  { number: 10, name: "Record and Maintain", description: "Document the decision, reasons, and all supporting materials for the record." },
] as const;

export const USER_ROLES = {
  MINISTER: "minister",
  PERMANENT_SECRETARY: "permanent_secretary",
  LEGAL_ADVISOR: "legal_advisor",
  AUDITOR: "auditor",
  PUBLIC: "public",
} as const;

export const DECISION_STATUSES = {
  DRAFT: "draft",
  IN_PROGRESS: "in_progress",
  UNDER_REVIEW: "under_review",
  APPROVED: "approved",
  PUBLISHED: "published",
  CHALLENGED: "challenged",
  WITHDRAWN: "withdrawn",
} as const;

export const DECISION_TYPES = {
  REGULATORY: "regulatory",
  LICENSING: "licensing",
  PLANNING: "planning",
  FINANCIAL: "financial",
  APPOINTMENT: "appointment",
  POLICY: "policy",
  ENFORCEMENT: "enforcement",
  OTHER: "other",
} as const;

export const JUDICIAL_REVIEW_GROUNDS = {
  ILLEGALITY: "illegality",
  IRRATIONALITY: "irrationality",
  PROCEDURAL_IMPROPRIETY: "procedural_impropriety",
  PROPORTIONALITY: "proportionality",
} as const;

export const DOCUMENT_CLASSIFICATIONS = {
  EVIDENCE: "evidence",
  LEGAL_OPINION: "legal_opinion",
  CORRESPONDENCE: "correspondence",
  PUBLIC_NOTICE: "public_notice",
  INTERNAL_MEMO: "internal_memo",
} as const;
