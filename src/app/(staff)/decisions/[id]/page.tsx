"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  User,
  Building2,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  Download,
  MessageSquare,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { DECISION_STEPS, JUDICIAL_REVIEW_GROUNDS } from "@/lib/constants";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { CommentThread } from "@/components/decisions/comment-thread";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const statusColors: Record<string, string> = {
  draft: "bg-surface text-text-secondary",
  in_progress: "bg-accent/10 text-accent-dark",
  under_review: "bg-warning/20 text-warning-dark",
  approved: "bg-accent/10 text-accent",
  published: "bg-primary/10 text-primary",
  challenged: "bg-error/10 text-error",
};

function formatLabel(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function StepIcon({ status, isCurrent }: { status: string; isCurrent?: boolean }) {
  if (status === "completed" || status === "skipped_with_reason") {
    return <CheckCircle2 className="h-6 w-6 text-accent" />;
  }
  if (status === "in_progress" || isCurrent) {
    return (
      <div className="h-6 w-6 rounded-full border-2 border-accent bg-accent/10 flex items-center justify-center">
        <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
      </div>
    );
  }
  return <Circle className="h-6 w-6 text-border" />;
}

export default function DecisionDetailPage() {
  const params = useParams();
  const decisionId = params.id as string;
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [flagGround, setFlagGround] = useState("");
  const [flagNotes, setFlagNotes] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["decision", decisionId],
    queryFn: () => api.decisions.getById(decisionId),
    enabled: !!decisionId,
  });

  const approveMutation = useMutation({
    mutationFn: () => api.decisions.approve(decisionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decision", decisionId] });
      setActionMessage({ type: "success", text: "Decision approved successfully." });
    },
    onError: (err: Error) => setActionMessage({ type: "error", text: err.message }),
  });

  const publishMutation = useMutation({
    mutationFn: () => api.decisions.publish(decisionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decision", decisionId] });
      setActionMessage({ type: "success", text: "Decision published successfully." });
    },
    onError: (err: Error) => setActionMessage({ type: "error", text: err.message }),
  });

  const flagMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.decisions.flagForReview(decisionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decision", decisionId] });
      setActionMessage({ type: "success", text: "Decision flagged for judicial review." });
    },
    onError: (err: Error) => setActionMessage({ type: "error", text: err.message }),
  });

  const isActioning = approveMutation.isPending || publishMutation.isPending || flagMutation.isPending;
  const canFlagForReview = user?.role === "legal_advisor" || user?.role === "auditor";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-text-muted" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-24">
        <FileText className="h-12 w-12 mx-auto mb-3 text-text-muted" />
        <p className="text-lg font-medium text-text">Decision not found</p>
        <p className="text-sm text-text-secondary mt-1">
          {error instanceof Error ? error.message : "This decision may have been removed."}
        </p>
        <Link href="/decisions" className="text-sm text-accent hover:underline mt-4 inline-block">
          Back to Decisions
        </Link>
      </div>
    );
  }

  const decision = data;
  const steps = decision.steps ?? [];
  const completedCount = steps.filter(
    (s) => s.status === "completed" || s.status === "skipped_with_reason"
  ).length;
  const progress = (completedCount / 10) * 100;

  // Determine the next action for the user
  const currentStepDef = DECISION_STEPS.find((s) => s.number === decision.currentStep);
  const currentStepData = steps.find((s) => s.stepNumber === decision.currentStep);
  const currentStepStatus = currentStepData?.status ?? "not_started";

  function getNextAction(): { label: string; description: string; href?: string; status: "action" | "waiting" | "done" } | null {
    if (decision.status === "published") return { label: "Published", description: "This decision has been published to the public transparency portal.", status: "done" };
    if (decision.status === "withdrawn") return { label: "Withdrawn", description: "This decision has been withdrawn.", status: "done" };
    if (decision.status === "challenged") return { label: "Under Judicial Review", description: "This decision has been flagged for judicial review.", status: "waiting" };
    if (decision.status === "approved") return { label: "Ready to Publish", description: "All steps are complete and the decision is approved. It can now be published to the public portal.", status: "waiting" };
    if (decision.status === "under_review") return { label: "Awaiting Approval", description: `All 10 steps are complete. This decision is awaiting ministerial approval.`, status: "waiting" };
    if (currentStepDef) {
      const stepAction = currentStepStatus === "in_progress" ? "Continue" : "Begin";
      return {
        label: `${stepAction} Step ${decision.currentStep}: ${currentStepDef.name}`,
        description: currentStepDef.description,
        href: `/decisions/${decision.id}/step/${decision.currentStep}`,
        status: "action",
      };
    }
    return null;
  }

  const nextAction = getNextAction();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/decisions"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-accent mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Decisions
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs text-text-muted mb-1">
              {decision.referenceNumber}
            </p>
            <h1 className="text-2xl font-semibold text-text">
              {decision.title}
            </h1>
            {decision.description && (
              <p className="mt-2 text-sm text-text-secondary max-w-2xl">
                {decision.description}
              </p>
            )}
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              statusColors[decision.status] ?? ""
            }`}
          >
            {formatLabel(decision.status)}
          </span>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-4">
          <Building2 className="h-5 w-5 text-text-muted" />
          <div>
            <p className="text-xs text-text-muted">Ministry</p>
            <p className="text-sm font-medium text-text">{decision.ministryName ?? decision.ministryId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-4">
          <User className="h-5 w-5 text-text-muted" />
          <div>
            <p className="text-xs text-text-muted">Created By</p>
            <p className="text-sm font-medium text-text">{decision.createdByName ?? decision.createdBy}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-4">
          <FileText className="h-5 w-5 text-text-muted" />
          <div>
            <p className="text-xs text-text-muted">Type</p>
            <p className="text-sm font-medium text-text">{formatLabel(decision.decisionType)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-4">
          <Calendar className="h-5 w-5 text-text-muted" />
          <div>
            <p className="text-xs text-text-muted">Deadline</p>
            <p className="text-sm font-medium text-text">
              {decision.deadline
                ? new Date(decision.deadline).toLocaleDateString()
                : "No deadline set"}
            </p>
          </div>
        </div>
      </div>

      {/* Decision Actions */}
      {actionMessage && (
        <div className={`rounded-lg border p-4 text-sm ${
          actionMessage.type === "success"
            ? "bg-accent/10 border-accent/20 text-accent-dark"
            : "bg-error/10 border-error/20 text-error"
        }`}>
          {actionMessage.text}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {decision.status === "under_review" && (
          <button
            onClick={() => approveMutation.mutate()}
            disabled={isActioning}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-dark transition-colors disabled:opacity-50"
          >
            {approveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Approve Decision
          </button>
        )}

        {decision.status === "approved" && (
          <button
            onClick={() => publishMutation.mutate()}
            disabled={isActioning}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {publishMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
            Publish Decision
          </button>
        )}

        {decision.status === "published" && (
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <CheckCircle2 className="h-4 w-4" />
            Published
          </span>
        )}

        {canFlagForReview && (decision.status === "approved" || decision.status === "published") && (
          <button
            onClick={() => setShowFlagDialog(true)}
            disabled={isActioning}
            className="inline-flex items-center gap-2 rounded-lg border border-warning bg-warning/10 px-4 py-2 text-sm font-medium text-warning-dark hover:bg-warning/20 transition-colors disabled:opacity-50"
          >
            {flagMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            Flag for Judicial Review
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link
          href={`/decisions/${decision.id}/documents`}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface transition-colors"
        >
          <Download className="h-4 w-4" />
          Documents
        </Link>
        <Link
          href={`/decisions/${decision.id}/audit`}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface transition-colors"
        >
          <FileText className="h-4 w-4" />
          Audit Trail
        </Link>
        <button
          onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          Comments
        </button>
      </div>

      {/* Progress Bar */}
      <div className="rounded-lg border border-border bg-white p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-text">Workflow Progress</h2>
          <span className="text-sm text-text-secondary">
            {Math.round(progress)}% complete ({completedCount}/10 steps)
          </span>
        </div>
        <div className="h-2 rounded-full bg-surface overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Next Action Banner */}
      {nextAction && (
        <div className={`rounded-lg border p-5 ${
          nextAction.status === "action"
            ? "border-accent bg-accent/5"
            : nextAction.status === "waiting"
            ? "border-warning bg-warning/5"
            : "border-primary/20 bg-primary/5"
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {nextAction.status === "action" && <ArrowRight className="h-4 w-4 text-accent" />}
                {nextAction.status === "waiting" && <Clock className="h-4 w-4 text-warning-dark" />}
                {nextAction.status === "done" && <CheckCircle2 className="h-4 w-4 text-primary" />}
                <p className="text-sm font-semibold text-text">{nextAction.label}</p>
              </div>
              <p className="text-sm text-text-secondary">{nextAction.description}</p>
            </div>
            {nextAction.href && (
              <Link
                href={nextAction.href}
                className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-dark transition-colors"
              >
                {currentStepStatus === "in_progress" ? "Continue" : "Start"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 10-Step Workflow */}
      <div className="rounded-lg border border-border bg-white p-6">
        <h2 className="text-lg font-semibold text-text mb-6">
          10-Step Decision Framework
        </h2>
        <div className="space-y-1">
          {DECISION_STEPS.map((stepDef) => {
            const stepData = steps.find((s) => s.stepNumber === stepDef.number);
            const status = stepData?.status ?? "not_started";
            const isCurrent = status === "in_progress" || (stepDef.number === decision.currentStep && status === "not_started" && decision.status !== "published" && decision.status !== "withdrawn");

            return (
              <Link
                key={stepDef.number}
                href={`/decisions/${decision.id}/step/${stepDef.number}`}
                className={`flex items-start gap-4 rounded-lg p-3 transition-colors ${
                  isCurrent
                    ? "bg-accent/5 border border-accent/20"
                    : "hover:bg-surface"
                }`}
              >
                <div className="mt-0.5">
                  <StepIcon status={status} isCurrent={isCurrent} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-medium ${
                        status === "completed" || status === "skipped_with_reason"
                          ? "text-text-secondary"
                          : isCurrent
                          ? "text-accent-dark"
                          : "text-text"
                      }`}
                    >
                      Step {stepDef.number}: {stepDef.name}
                    </p>
                    {isCurrent && (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    {stepDef.description}
                  </p>
                </div>
                <div className="text-xs text-text-muted whitespace-nowrap">
                  {status === "completed" && stepData?.completedAt
                    ? `Completed ${new Date(stepData.completedAt).toLocaleDateString()}`
                    : status === "in_progress"
                    ? "In Progress"
                    : status === "skipped_with_reason"
                    ? "Skipped"
                    : isCurrent
                    ? "Ready to Start"
                    : "Pending"}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Comments */}
      <div id="comments" className="rounded-lg border border-border bg-white p-6">
        <h2 className="text-lg font-semibold text-text mb-4">
          <MessageSquare className="inline h-5 w-5 mr-2 -mt-0.5" />
          Comments
        </h2>
        <CommentsSection decisionId={decisionId} user={user} />
      </div>

      {/* Flag for Judicial Review Dialog */}
      <Dialog open={showFlagDialog} onOpenChange={(open) => { if (!open) { setShowFlagDialog(false); setFlagGround(""); setFlagNotes(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag for Judicial Review</DialogTitle>
            <DialogDescription>
              Select the ground for judicial review and provide any additional notes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label htmlFor="flag-ground" className="block text-sm font-medium text-text mb-1.5">
                Ground <span className="text-error">*</span>
              </label>
              <select
                id="flag-ground"
                value={flagGround}
                onChange={(e) => setFlagGround(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">Select a ground</option>
                {Object.values(JUDICIAL_REVIEW_GROUNDS).map((ground) => (
                  <option key={ground} value={ground}>
                    {ground.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="flag-notes" className="block text-sm font-medium text-text mb-1.5">
                Notes
              </label>
              <textarea
                id="flag-notes"
                value={flagNotes}
                onChange={(e) => setFlagNotes(e.target.value)}
                rows={3}
                placeholder="Additional notes (optional)..."
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => { setShowFlagDialog(false); setFlagGround(""); setFlagNotes(""); }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!flagGround) return;
                flagMutation.mutate({ ground: flagGround, notes: flagNotes || undefined });
                setShowFlagDialog(false);
                setFlagGround("");
                setFlagNotes("");
              }}
              disabled={!flagGround || flagMutation.isPending}
              className="rounded-lg bg-warning/80 px-4 py-2 text-sm font-medium text-white hover:bg-warning transition-colors disabled:opacity-50"
            >
              {flagMutation.isPending ? "Submitting..." : "Flag for Review"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CommentsSection({ decisionId, user }: { decisionId: string; user: { id: string; role: string } | null }) {
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", decisionId],
    queryFn: () => api.comments.list(decisionId),
  });

  const createMutation = useMutation({
    mutationFn: (input: { content: string; isInternal: boolean }) =>
      api.comments.create({ decisionId, ...input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", decisionId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.comments.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", decisionId] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  return (
    <CommentThread
      decisionId={decisionId}
      comments={comments}
      onSubmit={async (input) => { await createMutation.mutateAsync(input); }}
      onDelete={async (id) => { await deleteMutation.mutateAsync(id); }}
      currentUserId={user?.id}
      currentUserRole={user?.role}
      isSubmitting={createMutation.isPending}
    />
  );
}
