import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Clock,
  User,
  Building2,
  Calendar,
  Shield,
  CheckCircle2,
  Circle,
  AlertTriangle,
} from "lucide-react";
import { DECISION_STEPS } from "@/lib/constants";

// Mock data — will be replaced with tRPC query
const mockDecision = {
  id: "1",
  reference: "DP-FIN-2026-0042",
  title: "Financial Services Licensing Amendment",
  description:
    "Amendment to the licensing requirements for financial services providers operating within the British Virgin Islands, in response to updated international regulatory standards.",
  status: "in_progress",
  decisionType: "licensing",
  currentStep: 4,
  ministry: "Ministry of Finance",
  assignedTo: "John Smith",
  createdBy: "Minister of Finance",
  deadline: "2026-04-15",
  createdAt: "2026-03-01",
  updatedAt: "2026-03-20",
};

const stepStatuses: Record<number, string> = {
  1: "completed",
  2: "completed",
  3: "completed",
  4: "in_progress",
  5: "not_started",
  6: "not_started",
  7: "not_started",
  8: "not_started",
  9: "not_started",
  10: "not_started",
};

const statusColors: Record<string, string> = {
  draft: "bg-surface text-text-secondary",
  in_progress: "bg-accent/10 text-accent-dark",
  under_review: "bg-warning/20 text-warning-dark",
  approved: "bg-accent/10 text-accent",
  published: "bg-primary/10 text-primary",
  challenged: "bg-error/10 text-error",
};

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function StepIcon({ status }: { status: string }) {
  if (status === "completed") {
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
  const progress = (Object.values(stepStatuses).filter((s) => s === "completed").length / 10) * 100;

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
              {mockDecision.reference}
            </p>
            <h1 className="text-2xl font-semibold text-text">
              {mockDecision.title}
            </h1>
            <p className="mt-2 text-sm text-text-secondary max-w-2xl">
              {mockDecision.description}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              statusColors[mockDecision.status] ?? ""
            }`}
          >
            {formatStatus(mockDecision.status)}
          </span>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-4">
          <Building2 className="h-5 w-5 text-text-muted" />
          <div>
            <p className="text-xs text-text-muted">Ministry</p>
            <p className="text-sm font-medium text-text">
              {mockDecision.ministry}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-4">
          <User className="h-5 w-5 text-text-muted" />
          <div>
            <p className="text-xs text-text-muted">Assigned To</p>
            <p className="text-sm font-medium text-text">
              {mockDecision.assignedTo}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-4">
          <FileText className="h-5 w-5 text-text-muted" />
          <div>
            <p className="text-xs text-text-muted">Type</p>
            <p className="text-sm font-medium text-text">
              {formatStatus(mockDecision.decisionType)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-4">
          <Calendar className="h-5 w-5 text-text-muted" />
          <div>
            <p className="text-xs text-text-muted">Deadline</p>
            <p className="text-sm font-medium text-text">
              {mockDecision.deadline}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="rounded-lg border border-border bg-white p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-text">Workflow Progress</h2>
          <span className="text-sm text-text-secondary">
            {Math.round(progress)}% complete
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
          {DECISION_STEPS.map((step) => {
            const status = stepStatuses[step.number] ?? "not_started";
            const isCurrent = status === "in_progress";

            return (
              <Link
                key={step.number}
                href={`/decisions/${mockDecision.id}/step/${step.number}`}
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
                        status === "completed"
                          ? "text-text-secondary"
                          : isCurrent
                          ? "text-accent-dark"
                          : "text-text"
                      }`}
                    >
                      Step {step.number}: {step.name}
                    </p>
                    {isCurrent && (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    {step.description}
                  </p>
                </div>
                <div className="text-xs text-text-muted whitespace-nowrap">
                  {status === "completed" && "Completed"}
                  {status === "in_progress" && "In Progress"}
                  {status === "not_started" && "Pending"}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
