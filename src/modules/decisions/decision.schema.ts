import { z } from "zod";

export const createDecisionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(500),
  description: z.string().max(5000).optional(),
  ministryId: z.string().uuid("Invalid ministry ID"),
  decisionType: z.enum([
    "regulatory",
    "licensing",
    "planning",
    "financial",
    "appointment",
    "policy",
    "enforcement",
    "other",
  ]),
  deadline: z.string().datetime().optional(),
  assignedTo: z.string().uuid().optional(),
});

export const updateDecisionSchema = createDecisionSchema.partial();

export const advanceStepSchema = z.object({
  decisionId: z.string().uuid(),
  stepNumber: z.number().int().min(1).max(10),
  action: z.enum(["start", "complete", "skip"]),
  skipReason: z.string().max(2000).optional(),
  data: z
    .record(z.unknown())
    .optional()
    .describe("Step-specific structured data"),
  notes: z.string().max(5000).optional(),
});

export const approveDecisionSchema = z.object({
  decisionId: z.string().uuid(),
  notes: z.string().max(2000).optional(),
});

export const publishDecisionSchema = z.object({
  decisionId: z.string().uuid(),
});

export const flagForReviewSchema = z.object({
  decisionId: z.string().uuid(),
  ground: z.enum([
    "illegality",
    "irrationality",
    "procedural_impropriety",
    "proportionality",
  ]),
  notes: z.string().max(5000).optional(),
});

export const listDecisionsSchema = z.object({
  ministryId: z.string().uuid().optional(),
  status: z
    .enum([
      "draft",
      "in_progress",
      "under_review",
      "approved",
      "published",
      "challenged",
      "withdrawn",
    ])
    .optional(),
  decisionType: z
    .enum([
      "regulatory",
      "licensing",
      "planning",
      "financial",
      "appointment",
      "policy",
      "enforcement",
      "other",
    ])
    .optional(),
  assignedTo: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
  cursor: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

/** Validation schemas for individual steps */
export const stepSchemas: Record<number, z.ZodObject<z.ZodRawShape>> = {
  1: z.object({
    legalBasis: z.string().min(1, "Legal basis is required"),
    legislativeReference: z.string().optional(),
    scopeDescription: z.string().min(1, "Scope description is required"),
    authorityConfirmed: z.boolean().refine((v) => v === true, "Authority must be confirmed"),
  }),
  2: z.object({
    proceduresIdentified: z.string().min(1, "Procedures must be identified"),
    statutoryRequirements: z.string().optional(),
    proceduralChecklist: z.array(z.string()).optional(),
  }),
  3: z.object({
    informationSources: z.string().min(1, "Information sources are required"),
    keyFacts: z.string().min(1, "Key facts must be documented"),
    gapsIdentified: z.string().optional(),
  }),
  4: z.object({
    evidenceSummary: z.string().min(1, "Evidence summary is required"),
    evidenceQuality: z.enum(["strong", "moderate", "weak"]),
    contradictoryEvidence: z.string().optional(),
  }),
  5: z.object({
    standardApplied: z.string().min(1, "Standard of proof must be specified"),
    justification: z.string().min(1, "Justification is required"),
    thresholdMet: z.boolean(),
  }),
  6: z.object({
    conflictsOfInterest: z.string().optional(),
    biasAssessment: z.string().min(1, "Bias assessment is required"),
    declarationSigned: z.boolean().refine((v) => v === true, "Declaration must be signed"),
  }),
  7: z.object({
    partiesNotified: z.boolean(),
    rightToBeHeard: z.string().min(1, "Right to be heard must be documented"),
    representationsReceived: z.string().optional(),
    responsesToRepresentations: z.string().optional(),
  }),
  8: z.object({
    factorsConsidered: z.string().min(1, "Factors considered must be documented"),
    weightingApplied: z.string().optional(),
    alternativesConsidered: z.string().optional(),
    reasonsForDecision: z.string().min(1, "Reasons must be documented"),
  }),
  9: z.object({
    decisionCommunicated: z.boolean().refine((v) => v === true, "Decision must be communicated"),
    communicationMethod: z.string().min(1, "Communication method is required"),
    reasonsProvided: z.boolean(),
    dateOfCommunication: z.string().datetime(),
  }),
  10: z.object({
    recordCreated: z.boolean().refine((v) => v === true, "Record must be created"),
    documentsAttached: z.boolean(),
    retentionPeriod: z.string().optional(),
    filingReference: z.string().optional(),
  }),
};
