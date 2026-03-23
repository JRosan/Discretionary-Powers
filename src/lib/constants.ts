export const DECISION_STEPS = [
  { number: 1, name: "Confirm Authority", description: "Ensure you have legal power to act. Identify the specific legislation, regulation, or constitutional provision that grants the discretionary power. If the power is delegated, confirm the chain of delegation." },
  { number: 2, name: "Follow Procedures", description: "Comply with all statutory and administrative requirements. Identify every procedural step mandated by law and confirm each has been followed before proceeding." },
  { number: 3, name: "Gather Information", description: "Collect all relevant facts and supporting documents. Consult all available sources of information and identify any gaps that need to be addressed." },
  { number: 4, name: "Evaluate Evidence", description: "Assess key facts carefully and objectively. Consider the quality, reliability, and relevance of all evidence. Document any contradictory evidence and how it was weighed." },
  { number: 5, name: "Apply Correct Standard", description: "Decide on the balance of probabilities unless a higher standard is required by law. Document which standard was applied and why it is appropriate for this type of decision." },
  { number: 6, name: "Act Fairly", description: "Avoid conflicts of interest or improper influence. Declare any personal interest in the matter. Ensure no bias, predetermination, or external pressure has influenced the decision." },
  { number: 7, name: "Ensure Procedural Fairness", description: "Allow affected persons the right to be heard. Notify all affected parties, provide them opportunity to make representations, and consider all responses received before deciding." },
  { number: 8, name: "Consider Individual Merits", description: "Base decisions on evidence, not precedent alone. Weigh all relevant factors for this specific case. Consider alternatives and document the reasoning for the chosen course of action." },
  { number: 9, name: "Communicate Outcome", description: "Inform all parties and explain reasons for the decision. Provide clear written communication including the decision reached, the reasons for it, and any right of appeal." },
  { number: 10, name: "Record Decisions", description: "Document reasons and deviations from policy. Create a complete record of the decision including all supporting materials, the reasoning process, and any departures from standard policy with justification." },
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
  CROWN_LAND: "crown_land",
  BELONGERSHIP: "belongership",
  IMMIGRATION: "immigration",
  TRADE_LICENSE: "trade_license",
  WORK_PERMIT: "work_permit",
  CUSTOMS_EXEMPTION: "customs_exemption",
  ENVIRONMENTAL: "environmental",
  MARITIME: "maritime",
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
