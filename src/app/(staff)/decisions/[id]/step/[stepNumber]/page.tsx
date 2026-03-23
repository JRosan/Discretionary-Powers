"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, SkipForward } from "lucide-react";
import { DECISION_STEPS } from "@/lib/constants";
import { api } from "@/lib/api";
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
    { name: "standardApplied", label: "Standard of Proof Applied", type: "text", required: true, placeholder: "e.g., Balance of probabilities, Beyond reasonable doubt" },
    { name: "justification", label: "Justification", type: "textarea", required: true, placeholder: "Explain why this standard was applied..." },
    { name: "thresholdMet", label: "The threshold has been met based on the evidence", type: "checkbox" },
  ],
  6: [
    { name: "biasAssessment", label: "Bias Assessment", type: "textarea", required: true, placeholder: "Document the assessment of potential bias or conflicts..." },
    { name: "conflictsOfInterest", label: "Conflicts of Interest", type: "textarea", placeholder: "Declare any conflicts of interest..." },
    { name: "declarationSigned", label: "I declare that I have no conflict of interest and will act impartially", type: "checkbox", required: true },
  ],
  7: [
    { name: "rightToBeHeard", label: "Right to Be Heard", type: "textarea", required: true, placeholder: "Document how affected parties were given opportunity to be heard..." },
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

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          href={`/decisions/${decisionId}`}
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-accent mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Decision
        </Link>

        {/* Step progress bar */}
        <div className="flex items-center gap-1 mb-4">
          {DECISION_STEPS.map((s) => (
            <Link
              key={s.number}
              href={`/decisions/${decisionId}/step/${s.number}`}
              className={`h-2 flex-1 rounded-full transition-colors ${
                s.number === stepNumber
                  ? "bg-accent"
                  : s.number < stepNumber
                  ? "bg-accent/40"
                  : "bg-border"
              }`}
              title={`Step ${s.number}: ${s.name}`}
            />
          ))}
        </div>

        <p className="text-xs text-text-muted mb-1">Step {stepNumber} of 10</p>
        <h1 className="text-2xl font-semibold text-text">{step.name}</h1>
        <p className="mt-1 text-sm text-text-secondary">{step.description}</p>
      </div>

      {/* Success banner */}
      {successMessage && (
        <div className="rounded-lg bg-accent/10 border border-accent/20 p-4 text-sm text-accent flex items-center gap-2 transition-opacity duration-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMessage}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-error/10 border border-error/20 p-4 text-sm text-error transition-opacity duration-300">
          {error}
        </div>
      )}

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
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name={field.name}
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
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {stepNumber > 1 && (
              <Link
                href={`/decisions/${decisionId}/step/${stepNumber - 1}`}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Link>
            )}
            <button
              type="button"
              onClick={() => setShowSkipDialog(true)}
              disabled={isPending}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-muted hover:bg-surface transition-colors disabled:opacity-50"
            >
              <SkipForward className="h-4 w-4" />
              Skip
            </button>
          </div>
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
        </div>
      </form>

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
