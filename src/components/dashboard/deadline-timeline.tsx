"use client";

import { type ApiDecision } from "@/lib/api";

interface DeadlineTimelineProps {
  decisions: ApiDecision[];
}

export function DeadlineTimeline({ decisions }: DeadlineTimelineProps) {
  const now = new Date();

  const withDeadlines = decisions
    .filter((d) => d.deadline && d.status !== "published" && d.status !== "withdrawn")
    .map((d) => {
      const deadline = new Date(d.deadline!);
      const diffMs = deadline.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return { ...d, deadlineDate: deadline, daysRemaining: diffDays };
    })
    .sort((a, b) => a.deadlineDate.getTime() - b.deadlineDate.getTime())
    .slice(0, 5);

  if (withDeadlines.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-text-muted">
        No upcoming deadlines
      </p>
    );
  }

  return (
    <div className="relative space-y-0">
      {withDeadlines.map((d, i) => {
        const isOverdue = d.daysRemaining < 0;
        const isUrgent = !isOverdue && d.daysRemaining <= 3;
        const dotColor = isOverdue
          ? "bg-error"
          : isUrgent
          ? "bg-warning"
          : "bg-accent";

        return (
          <div key={d.id} className="flex gap-4 py-3">
            {/* Date column */}
            <div className="w-20 shrink-0 text-right">
              <p className="text-xs font-medium text-text-secondary">
                {d.deadlineDate.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
              <p className="text-[10px] text-text-muted">
                {d.deadlineDate.getFullYear()}
              </p>
            </div>

            {/* Timeline line + dot */}
            <div className="relative flex flex-col items-center">
              <div
                className={`h-3 w-3 rounded-full ${dotColor} shrink-0 mt-0.5 z-10`}
              />
              {i < withDeadlines.length - 1 && (
                <div className="w-px flex-1 bg-border" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-1">
              <a
                href={`/decisions/${d.id}`}
                className="text-sm font-medium text-text hover:text-accent transition-colors truncate block"
              >
                {d.title}
              </a>
              <p className="text-xs text-text-muted font-mono">
                {d.referenceNumber}
              </p>
              {d.ministryName && (
                <p className="text-xs text-text-muted mt-0.5">
                  {d.ministryName}
                </p>
              )}
              <span
                className={`inline-block mt-1 text-xs font-medium ${
                  isOverdue
                    ? "text-error"
                    : isUrgent
                    ? "text-warning-dark"
                    : "text-accent"
                }`}
              >
                {isOverdue
                  ? `${Math.abs(d.daysRemaining)} day${Math.abs(d.daysRemaining) !== 1 ? "s" : ""} overdue`
                  : `${d.daysRemaining} day${d.daysRemaining !== 1 ? "s" : ""} remaining`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
