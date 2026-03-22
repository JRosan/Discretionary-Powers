"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  User,
  Building2,
  Calendar,
  CheckCircle2,
  Circle,
  Loader2,
  Download,
  MessageSquare,
} from "lucide-react";
import { DECISION_STEPS } from "@/lib/constants";
import { trpc } from "@/lib/trpc";

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

function StepIcon({ status }: { status: string }) {
  if (status === "completed" || status === "skipped_with_reason") {
    return <CheckCircle2 className="h-6 w-6 text-accent" />;
  }
  if (status === "in_progress") {
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

  const { data, isLoading, error } = trpc.decision.getById.useQuery(
    { id: decisionId },
    { enabled: !!decisionId }
  );

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
          {error?.message ?? "This decision may have been removed."}
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
            <p className="text-sm font-medium text-text">{decision.ministryId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-4">
          <User className="h-5 w-5 text-text-muted" />
          <div>
            <p className="text-xs text-text-muted">Created By</p>
            <p className="text-sm font-medium text-text">{decision.createdBy}</p>
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
        <Link
          href="#comments"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          Comments
        </Link>
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

      {/* 10-Step Workflow */}
      <div className="rounded-lg border border-border bg-white p-6">
        <h2 className="text-lg font-semibold text-text mb-6">
          10-Step Decision Framework
        </h2>
        <div className="space-y-1">
          {DECISION_STEPS.map((stepDef) => {
            const stepData = steps.find((s) => s.stepNumber === stepDef.number);
            const status = stepData?.status ?? "not_started";
            const isCurrent = status === "in_progress";

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
                  <StepIcon status={status} />
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
                    : "Pending"}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
