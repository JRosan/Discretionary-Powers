"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, SkipForward, AlertTriangle, Clock } from "lucide-react";
import { DECISION_STEPS } from "@/lib/constants";
import { api } from "@/lib/api";
import { DocumentUpload } from "@/components/documents/document-upload";
import { DocumentList } from "@/components/documents/document-list";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const stepFields: Record<
  number,
  Array<{
    name: string;
    label: string;
    type: "text" | "textarea" | "checkbox" | "select";
    required?: boolean;
    placeholder?: string;
    options?: string[];
  }>
> = {
  1: [
    { name: "legalBasis", label: "Legal Basis", type: "textarea", required: true, placeholder: "Cite the specific legislation, regulation, or constitutional provision..." },
    { name: "legislativeReference", label: "Legislative Reference", type: "text", placeholder: "e.g., Section 47(3) of the Constitution" },
    { name: "scopeDescription", label: "Scope of Authority", type: "textarea", required: true, placeholder: "Describe the scope and limits of the discretionary power..." },
    { name: "delegationChain", label: "Chain of Delegation", type: "textarea", placeholder: "If authority is delegated, document the delegation chain and legal basis..." },
    { name: "authorityConfirmed", label: "I confirm that the authority to make this decision has been verified", type: "checkbox", required: true },
  ],
  2: [
    { name: "proceduresIdentified", label: "Procedures Identified", type: "textarea", required: true, placeholder: "List all statutory and administrative procedures that must be followed..." },
    { name: "statutoryRequirements", label: "Statutory Requirements", type: "textarea", placeholder: "Detail any specific statutory requirements..." },
  ],
  3: [
    { name: "informationSources", label: "Information Sources", type: "textarea", required: true, placeholder: "List all sources of information consulted..." },
    { name: "keyFacts", label: "Key Facts", type: "textarea", required: true, placeholder: "Summarise the key facts relevant to this decision..." },
    { name: "gapsIdentified", label: "Information Gaps", type: "textarea", placeholder: "Note any gaps in information and how they were addressed..." },
  ],
  4: [
    { name: "evidenceSummary", label: "Evidence Summary", type: "textarea", required: true, placeholder: "Provide a summary of all evidence considered..." },
    { name: "evidenceQuality", label: "Evidence Quality Assessment", type: "select", required: true, options: ["strong", "moderate", "weak"] },
    { name: "contradictoryEvidence", label: "Contradictory Evidence", type: "textarea", placeholder: "Document any contradictory or conflicting evidence..." },
  ],
  5: [
    { name: "standardApplied", label: "Standard of Proof Applied", type: "text", required: true, placeholder: "Balance of probabilities (default for most decisions)" },
    { name: "justification", label: "Justification", type: "textarea", required: true, placeholder: "Explain why this standard was applied..." },
    { name: "thresholdMet", label: "The threshold has been met based on the evidence", type: "checkbox" },
  ],
  6: [
    { name: "biasAssessment", label: "Bias Assessment", type: "textarea", required: true, placeholder: "Document the assessment of potential bias or conflicts..." },
    { name: "conflictsOfInterest", label: "Conflicts of Interest", type: "textarea", placeholder: "Declare any conflicts of interest..." },
    { name: "conflictDeclared", label: "I declare that a conflict of interest assessment has been conducted", type: "checkbox", required: true },
    { name: "conflictMitigationSteps", label: "Conflict Mitigation Steps", type: "textarea", placeholder: "If conflicts identified, describe mitigation steps taken..." },
    { name: "declarationSigned", label: "I declare that I have no conflict of interest and will act impartially", type: "checkbox", required: true },
  ],
  7: [
    { name: "rightToBeHeard", label: "Right to Be Heard", type: "textarea", required: true, placeholder: "Document how affected parties were given opportunity to be heard..." },
    { name: "notificationDate", label: "Date Parties Notified", type: "text", placeholder: "YYYY-MM-DD" },
    { name: "notificationMethod", label: "Notification Method", type: "text", required: true, placeholder: "e.g., Official letter, Email, Gazette notice" },
    { name: "responseDeadline", label: "Response Deadline Given", type: "text", placeholder: "YYYY-MM-DD" },
    { name: "partiesNotified", label: "All affected parties have been notified", type: "checkbox" },
    { name: "representationsReceived", label: "Representations Received", type: "textarea", placeholder: "Summarise any representations received..." },
    { name: "responsesToRepresentations", label: "Responses to Representations", type: "textarea", placeholder: "Document how representations were addressed..." },
  ],
  8: [
    { name: "factorsConsidered", label: "Factors Considered", type: "textarea", required: true, placeholder: "List all relevant factors that were considered..." },
    { name: "alternativesConsidered", label: "Alternatives Considered", type: "textarea", placeholder: "Document alternative courses of action that were considered..." },
    { name: "weightingApplied", label: "Weighting Applied", type: "textarea", placeholder: "Explain how different factors were weighted..." },
    { name: "reasonsForDecision", label: "Reasons for Decision", type: "textarea", required: true, placeholder: "Provide clear reasons for the decision reached..." },
  ],
  9: [
    { name: "communicationMethod", label: "Communication Method", type: "text", required: true, placeholder: "e.g., Official letter, Gazette notice, Email" },
    { name: "dateOfCommunication", label: "Date of Communication", type: "text", required: true, placeholder: "YYYY-MM-DD" },
    { name: "reasonsProvided", label: "Reasons were provided to affected parties", type: "checkbox" },
    { name: "decisionCommunicated", label: "The decision has been formally communicated", type: "checkbox", required: true },
  ],
  10: [
    { name: "filingReference", label: "Filing Reference", type: "text", placeholder: "Internal filing reference number" },
    { name: "retentionPeriod", label: "Retention Period", type: "text", placeholder: "e.g., 7 years" },
    { name: "policyDeviations", label: "Policy Deviations", type: "textarea", placeholder: "Document any deviations from established policy and justification..." },
    { name: "documentsAttached", label: "All supporting documents have been attached", type: "checkbox" },
    { name: "recordCreated", label: "A complete record of this decision has been created and filed", type: "checkbox", required: true },
  ],
};

export default function StepPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);
  const stepNumber = Number(params.stepNumber);
  const decisionId = params.id as string;
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [skipReason, setSkipReason] = useState("");
  const [isFormComplete, setIsFormComplete] = useState(false);

  const step = DECISION_STEPS.find((s) => s.number === stepNumber);
  const fields = stepFields[stepNumber] ?? [];
  const requiredFields = fields.filter((f) => f.required);

  // Fetch the decision to get existing step data
  const { data: decision } = useQuery({
    queryKey: ["decision", decisionId],
    queryFn: () => api.decisions.getById(decisionId),
    enabled: !!decisionId,
  });

  const stepData = decision?.steps?.find((s: { stepNumber: number }) => s.stepNumber === stepNumber);
  const savedData = (stepData?.data ?? {}) as Record<string, unknown>;
  const savedNotes = stepData?.notes ?? "";
  const isCompleted = stepData?.status === "completed" || stepData?.status === "skipped_with_reason";

  const advanceStepMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.decisions.advanceStep(decisionId, stepNumber, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decision", decisionId] });
    },
  });

  // Auto-dismiss success message
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  // Reset state when step changes
  useEffect(() => {
    setFieldErrors({});
    setError(null);
    setSuccessMessage(null);
    setIsFormComplete(false);
  }, [stepNumber]);

  function checkFormCompleteness() {
    const form = formRef.current;
    if (!form) return;

    const allFilled = requiredFields.every((field) => {
      if (field.type === "checkbox") {
        const input = form.elements.namedItem(field.name) as HTMLInputElement | null;
        return input?.checked ?? false;
      }
      const input = form.elements.namedItem(field.name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
      return (input?.value ?? "").trim().length > 0;
    });

    setIsFormComplete(allFilled);
  }

  function clearFieldError(fieldName: string) {
    setFieldErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }

  function validateFields(form: HTMLFormElement): boolean {
    const errors: Record<string, string> = {};

    for (const field of requiredFields) {
      if (field.type === "checkbox") {
        const input = form.elements.namedItem(field.name) as HTMLInputElement | null;
        if (!input?.checked) {
          errors[field.name] = "This confirmation is required";
        }
      } else {
        const input = form.elements.namedItem(field.name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
        if (!(input?.value ?? "").trim()) {
          errors[field.name] = "This field is required";
        }
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  if (!step) {
    return (
      <div className="text-center py-16">
        <p className="text-text-secondary">Step not found.</p>
      </div>
    );
  }

  const isPending = advanceStepMutation.isPending;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    if (!validateFields(form)) return;

    const formData = new FormData(form);
    const data: Record<string, unknown> = {};
    const notes = formData.get("notes") as string;

    for (const field of fields) {
      if (field.type === "checkbox") {
        data[field.name] = formData.get(field.name) === "on";
      } else {
        const value = formData.get(field.name) as string;
        if (value) data[field.name] = value;
      }
    }

    try {
      // First start the step if needed
      await api.decisions
        .advanceStep(decisionId, stepNumber, { action: "start" })
        .catch(() => {});

      // Then complete
      await advanceStepMutation.mutateAsync({
        action: "complete",
        data,
        notes: notes || undefined,
      });

      setSuccessMessage(`Step ${stepNumber} completed successfully`);

      // Navigate after a brief delay to show the success message
      setTimeout(() => {
        if (stepNumber < 10) {
          router.push(`/decisions/${decisionId}/step/${stepNumber + 1}`);
        } else {
          router.push(`/decisions/${decisionId}`);
        }
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete step");
    }
  }

  async function handleSkipConfirm() {
    if (!skipReason.trim()) return;

    try {
      await advanceStepMutation.mutateAsync({
        action: "skip",
        skipReason: skipReason.trim(),
      });

      setShowSkipDialog(false);
      setSkipReason("");

      if (stepNumber < 10) {
        router.push(`/decisions/${decisionId}/step/${stepNumber + 1}`);
      } else {
        router.push(`/decisions/${decisionId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to skip step");
      setShowSkipDialog(false);
    }
  }

  const hasRequiredFields = requiredFields.length > 0;
  const errorBorderClass = "border-[#E76F51] focus:border-[#E76F51] focus:ring-[#E76F51]";

  // Step-specific guidance for the right sidebar
  const stepGuidance: Record<number, { tips: string[]; legalRef: string; checklist: string[] }> = {
    1: { tips: ["Check the specific Act or Regulation that grants this power", "Verify the power hasn't been repealed or amended", "If delegated, ensure the delegation instrument is valid", "For Crown Land decisions, cite the Crown Lands Ordinance", "For Belongership decisions, cite the Immigration and Passport Act", "For Work Permit decisions, cite the Labour Code"], legalRef: "Virgin Islands Constitution Order 2007, Section 56", checklist: ["Legal basis identified", "Scope of power confirmed", "Delegation chain documented (if applicable)"] },
    2: { tips: ["Review the relevant statute for procedural requirements", "Check if consultation periods are mandated", "Verify all pre-conditions have been met"], legalRef: "Applicable enabling legislation", checklist: ["Statutory procedures identified", "Administrative requirements listed", "All pre-conditions verified"] },
    3: { tips: ["Cast a wide net — consider all relevant sources", "Document where information came from", "Identify gaps and how they were addressed"], legalRef: "Natural justice principles", checklist: ["All relevant sources consulted", "Key facts documented", "Information gaps identified and addressed"] },
    4: { tips: ["Weigh evidence objectively — don't ignore contradictory facts", "Consider the source reliability", "Document your reasoning for each conclusion"], legalRef: "Administrative law — Wednesbury reasonableness", checklist: ["Evidence quality assessed", "Contradictory evidence considered", "Reasoning documented"] },
    5: { tips: ["Default standard is 'balance of probabilities'", "Higher standard only if statute requires it", "Document why this standard is appropriate"], legalRef: "Common law standards of proof", checklist: ["Standard identified", "Justification documented", "Threshold assessment completed"] },
    6: { tips: ["Declare any personal, financial, or family interests", "Recuse yourself if a real conflict exists", "Document the assessment even if no conflict found"], legalRef: "Ministerial Code of Conduct; Natural justice — nemo judex in causa sua", checklist: ["Conflict assessment conducted", "Interests declared (if any)", "Mitigation steps documented (if needed)"] },
    7: { tips: ["Notify ALL affected parties, not just the obvious ones", "Give reasonable time to respond", "Consider all representations before deciding"], legalRef: "Natural justice — audi alteram partem (hear the other side)", checklist: ["Parties identified and notified", "Adequate response time given", "All representations considered"] },
    8: { tips: ["Each case must be decided on its own facts", "Don't blindly follow precedent", "Consider and document alternatives rejected"], legalRef: "Administrative law — no fettering of discretion", checklist: ["Individual circumstances considered", "Alternatives evaluated", "Reasons for chosen approach documented"] },
    9: { tips: ["Provide written notice of the decision", "Include clear reasons", "Inform parties of any right of appeal"], legalRef: "Duty to give reasons", checklist: ["Decision communicated in writing", "Reasons provided", "Appeal rights explained"] },
    10: { tips: ["Create a complete file for the record", "Include all supporting documents", "Note any departures from standard policy"], legalRef: "Public Records Act; COI Recommendation A3", checklist: ["Complete record created", "All documents attached", "Policy deviations noted (if any)"] },
  };

  const guidance = stepGuidance[stepNumber];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/decisions/${decisionId}`}
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-accent mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Decision
        </Link>

        {/* Step progress stepper */}
        <div className="rounded-lg border border-border bg-white px-4 pt-4 pb-3 mb-6">
          {/* Circles and connectors row */}
          <div className="flex items-center">
            {DECISION_STEPS.map((s, i) => {
              const sd = decision?.steps?.find((st: { stepNumber: number }) => st.stepNumber === s.number);
              const st = sd?.status ?? "not_started";
              const isActive = s.number === stepNumber;
              const isDone = st === "completed" || st === "skipped_with_reason";
              const isPast = s.number < stepNumber;

              return (
                <div key={s.number} className="contents">
                  <Link
                    href={`/decisions/${decisionId}/step/${s.number}`}
                    title={`Step ${s.number}: ${s.name}`}
                    className="group shrink-0"
                  >
                    <div
                      className={`flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                        isDone
                          ? "h-8 w-8 bg-accent text-white"
                          : isActive
                          ? "h-9 w-9 border-2 border-accent bg-accent/10 text-accent ring-4 ring-accent/10"
                          : "h-8 w-8 border-2 border-border bg-white text-text-muted group-hover:border-accent/50 group-hover:text-accent"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        s.number
                      )}
                    </div>
                  </Link>
                  {i < DECISION_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 ${isDone || isPast ? "bg-accent/40" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
          {/* Labels row */}
          <div className="hidden sm:flex items-start mt-1.5">
            {DECISION_STEPS.map((s, i) => {
              const sd = decision?.steps?.find((st: { stepNumber: number }) => st.stepNumber === s.number);
              const st = sd?.status ?? "not_started";
              const isActive = s.number === stepNumber;
              const isDone = st === "completed" || st === "skipped_with_reason";

              return (
                <div key={s.number} className="contents">
                  <span
                    className={`shrink-0 w-8 text-[10px] leading-tight text-center truncate ${
                      isActive ? "w-9 text-accent-dark font-semibold" : isDone ? "text-accent" : "text-text-muted"
                    }`}
                  >
                    {s.name.split(" ")[0]}
                  </span>
                  {i < DECISION_STEPS.length - 1 && <div className="flex-1" />}
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-text-muted mb-1">Step {stepNumber} of 10</p>
        <h1 className="text-2xl font-semibold text-text">{step.name}</h1>
        <p className="mt-1 text-sm text-text-secondary">{step.description}</p>
      </div>

      {/* Deadline Warning Banner */}
      {(() => {
        const deadline = decision?.deadline ? new Date(decision.deadline) : null;
        const now = new Date();
        const daysUntilDeadline = deadline ? Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
        const isOverdue = deadline && daysUntilDeadline !== null && daysUntilDeadline < 0;
        const isApproaching = deadline && daysUntilDeadline !== null && daysUntilDeadline >= 0 && daysUntilDeadline <= 3;
        const isTerminal = decision?.status === "published" || decision?.status === "withdrawn";

        if (isOverdue && !isTerminal) {
          return (
            <div className="flex items-center gap-2 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              This decision is overdue. The deadline was {deadline!.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}.
            </div>
          );
        }
        if (isApproaching && !isTerminal) {
          return (
            <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning-dark">
              <Clock className="h-4 w-4 shrink-0" />
              Deadline approaching: {deadline!.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} ({daysUntilDeadline} {daysUntilDeadline === 1 ? "day" : "days"} remaining)
            </div>
          );
        }
        return null;
      })()}

      {/* Completed/Skipped banner */}
      {isCompleted && (
        <div className={`rounded-lg border p-4 text-sm flex items-center gap-2 ${
          stepData?.status === "skipped_with_reason"
            ? "bg-warning/10 border-warning/20 text-warning-dark"
            : "bg-accent/10 border-accent/20 text-accent-dark"
        }`}>
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {stepData?.status === "skipped_with_reason"
            ? "This step was skipped."
            : `This step was completed${stepData?.completedAt ? ` on ${new Date(stepData.completedAt).toLocaleDateString()}` : ""}.`}
          <span className="text-xs ml-auto text-text-muted">Read-only view</span>
        </div>
      )}

      {/* Success banner */}
      {successMessage && (
        <div role="alert" className="rounded-lg bg-accent/10 border border-accent/20 p-4 text-sm text-accent flex items-center gap-2 transition-opacity duration-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMessage}
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-lg bg-error/10 border border-error/20 p-4 text-sm text-error transition-opacity duration-300">
          {error}
        </div>
      )}

      {/* Two-column layout: Form + Guidance Sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

      {/* Left column: Form */}
      <form ref={formRef} onSubmit={handleSubmit} onChange={checkFormCompleteness} className="space-y-5">
        <div className="rounded-lg border border-border bg-white p-6 space-y-5">
          {hasRequiredFields && (
            <p className="text-xs text-text-muted">
              <span className="text-[#E76F51]">*</span> Required fields
            </p>
          )}

          {fields.map((field) => (
            <div key={field.name}>
              {field.type === "checkbox" ? (
                <div>
                  <label className={`flex items-start gap-3 ${isCompleted ? "" : "cursor-pointer"}`}>
                    <input
                      type="checkbox"
                      name={field.name}
                      defaultChecked={!!savedData[field.name]}
                      disabled={isCompleted}
                      onChange={() => {
                        clearFieldError(field.name);
                        // Defer completeness check to after state update
                        setTimeout(checkFormCompleteness, 0);
                      }}
                      className={`mt-0.5 h-4 w-4 rounded border-border text-accent focus:ring-accent ${
                        fieldErrors[field.name] ? "border-[#E76F51]" : ""
                      }`}
                    />
                    <span className="text-sm text-text">
                      {field.label}
                      {field.required && <span className="text-[#E76F51]"> *</span>}
                    </span>
                  </label>
                  {fieldErrors[field.name] && (
                    <p className="mt-1 ml-7 text-xs text-[#E76F51] transition-opacity duration-200">
                      {fieldErrors[field.name]}
                    </p>
                  )}
                </div>
              ) : field.type === "select" ? (
                <div>
                  <label htmlFor={field.name} className="block text-sm font-medium text-text mb-1.5">
                    {field.label}
                    {field.required && <span className="text-[#E76F51]"> *</span>}
                  </label>
                  <select
                    id={field.name}
                    name={field.name}
                    defaultValue={savedData[field.name] as string ?? ""}
                    disabled={isCompleted}
                    onChange={() => clearFieldError(field.name)}
                    className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 ${
                      fieldErrors[field.name]
                        ? errorBorderClass
                        : "border-border focus:border-accent focus:ring-accent"
                    }`}
                  >
                    <option value="">Select...</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </option>
                    ))}
                  </select>
                  {fieldErrors[field.name] && (
                    <p className="mt-1 text-xs text-[#E76F51] transition-opacity duration-200">
                      {fieldErrors[field.name]}
                    </p>
                  )}
                </div>
              ) : field.type === "textarea" ? (
                <div>
                  <label htmlFor={field.name} className="block text-sm font-medium text-text mb-1.5">
                    {field.label}
                    {field.required && <span className="text-[#E76F51]"> *</span>}
                  </label>
                  <textarea
                    id={field.name}
                    name={field.name}
                    rows={4}
                    placeholder={field.placeholder}
                    defaultValue={savedData[field.name] as string ?? ""}
                    readOnly={isCompleted}
                    onInput={() => clearFieldError(field.name)}
                    className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 resize-none ${
                      fieldErrors[field.name]
                        ? errorBorderClass
                        : "border-border focus:border-accent focus:ring-accent"
                    }`}
                  />
                  {fieldErrors[field.name] && (
                    <p className="mt-1 text-xs text-[#E76F51] transition-opacity duration-200">
                      {fieldErrors[field.name]}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label htmlFor={field.name} className="block text-sm font-medium text-text mb-1.5">
                    {field.label}
                    {field.required && <span className="text-[#E76F51]"> *</span>}
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="text"
                    placeholder={field.placeholder}
                    defaultValue={savedData[field.name] as string ?? ""}
                    readOnly={isCompleted}
                    onInput={() => clearFieldError(field.name)}
                    className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 ${
                      fieldErrors[field.name]
                        ? errorBorderClass
                        : "border-border focus:border-accent focus:ring-accent"
                    }`}
                  />
                  {fieldErrors[field.name] && (
                    <p className="mt-1 text-xs text-[#E76F51] transition-opacity duration-200">
                      {fieldErrors[field.name]}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Supporting Documents */}
        <div className="rounded-lg border border-border bg-white p-6">
          <h3 className="text-sm font-semibold text-text mb-3">Supporting Documents</h3>
          <p className="text-xs text-text-muted mb-4">
            Upload any supporting evidence, legal opinions, or correspondence for this step.
          </p>
          <DocumentList decisionId={decisionId} />
          {!isCompleted && (
            <div className="mt-4">
              <DocumentUpload decisionId={decisionId} onUploadComplete={() => {}} />
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="rounded-lg border border-border bg-white p-6">
          <label htmlFor="notes" className="block text-sm font-medium text-text mb-1.5">
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Any additional notes or observations for this step..."
            defaultValue={savedNotes}
            readOnly={isCompleted}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {stepNumber > 1 && !isCompleted && (
              <Link
                href={`/decisions/${decisionId}/step/${stepNumber - 1}`}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Link>
            )}
            {!isCompleted && (
              <button
                type="button"
                onClick={() => setShowSkipDialog(true)}
                disabled={isPending}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-muted hover:bg-surface transition-colors disabled:opacity-50"
              >
                <SkipForward className="h-4 w-4" />
                Skip
              </button>
            )}
          </div>
          {isCompleted ? (
            <Link
              href={stepNumber < 10 ? `/decisions/${decisionId}/step/${stepNumber + 1}` : `/decisions/${decisionId}`}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-dark transition-colors"
            >
              {stepNumber < 10 ? "Next Step" : "Back to Decision"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              type="submit"
              disabled={isPending || (hasRequiredFields && !isFormComplete)}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : stepNumber < 10 ? (
              <>
                Complete & Next
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Complete Final Step
              </>
            )}
          </button>
          )}
        </div>
      </form>

      {/* Right column: Guidance Sidebar */}
      <aside className="space-y-5 hidden lg:block">
        {/* Step Guidance */}
        <div className="rounded-lg border border-border bg-white p-5 sticky top-6">
          <h3 className="text-sm font-semibold text-primary mb-3">
            Step {stepNumber} Guidance
          </h3>
          <p className="text-xs text-text-secondary mb-4">
            {step.description}
          </p>

          {/* Checklist */}
          {guidance && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-text uppercase tracking-wide mb-2">Checklist</h4>
              <ul className="space-y-1.5">
                {guidance.checklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                    <span className="mt-0.5 h-4 w-4 rounded border border-border flex items-center justify-center shrink-0 text-[10px]">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Best Practice Tips */}
          {guidance && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-text uppercase tracking-wide mb-2">Best Practice</h4>
              <ul className="space-y-1.5">
                {guidance.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                    <span className="text-accent mt-0.5 shrink-0">&#8226;</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Legal Reference */}
          {guidance && (
            <div className="border-t border-border pt-3">
              <h4 className="text-xs font-semibold text-text uppercase tracking-wide mb-1">Legal Reference</h4>
              <p className="text-xs text-text-muted italic">{guidance.legalRef}</p>
            </div>
          )}
        </div>

        {/* Progress Overview */}
        {decision && (
          <div className="rounded-lg border border-border bg-white p-5">
            <h3 className="text-sm font-semibold text-text mb-3">Progress</h3>
            <div className="space-y-1.5">
              {DECISION_STEPS.map((s) => {
                const sd = decision.steps?.find((st: { stepNumber: number }) => st.stepNumber === s.number);
                const st = sd?.status ?? "not_started";
                const active = s.number === stepNumber;
                return (
                  <Link
                    key={s.number}
                    href={`/decisions/${decisionId}/step/${s.number}`}
                    className={`flex items-center gap-2 rounded px-2 py-1 text-xs transition-colors ${
                      active ? "bg-accent/10 text-accent-dark font-medium" : "text-text-secondary hover:bg-surface"
                    }`}
                  >
                    {st === "completed" || st === "skipped_with_reason" ? (
                      <CheckCircle2 className="h-3 w-3 text-accent shrink-0" />
                    ) : active ? (
                      <div className="h-3 w-3 rounded-full border border-accent bg-accent/20 shrink-0" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-border shrink-0" />
                    )}
                    <span className="truncate">{s.number}. {s.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </aside>

      </div>{/* End two-column grid */}

      {/* Skip confirmation dialog */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skip Step {stepNumber}: {step.name}</DialogTitle>
            <DialogDescription>
              Please provide a reason for skipping this step. This will be recorded for audit purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <label htmlFor="skipReason" className="block text-sm font-medium text-text mb-1.5">
              Reason for skipping <span className="text-[#E76F51]">*</span>
            </label>
            <textarea
              id="skipReason"
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              rows={3}
              placeholder="Explain why this step is being skipped..."
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            />
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setShowSkipDialog(false);
                setSkipReason("");
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSkipConfirm}
              disabled={!skipReason.trim() || isPending}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Skipping...
                </span>
              ) : (
                "Skip Step"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
