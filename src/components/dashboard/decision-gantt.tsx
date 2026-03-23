"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

interface DecisionGanttProps {
  decisions: Array<{
    id: string;
    title: string;
    referenceNumber: string;
    status: string;
    currentStep: number;
    createdAt: string | null;
    deadline: string | null;
    ministryName: string | null;
  }>;
}

const STATUS_COLORS: Record<string, { bg: string; fill: string; label: string }> = {
  draft: { bg: "bg-gray-200", fill: "bg-gray-400", label: "Draft" },
  in_progress: { bg: "bg-accent/20", fill: "bg-accent", label: "In Progress" },
  under_review: { bg: "bg-warning/20", fill: "bg-warning", label: "Under Review" },
  approved: { bg: "bg-primary/20", fill: "bg-primary", label: "Approved" },
  challenged: { bg: "bg-error/20", fill: "bg-error", label: "Challenged" },
};

function daysBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24);
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function DecisionGantt({ decisions }: DecisionGanttProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const now = new Date();

  const activeDecisions = useMemo(() => {
    return decisions
      .filter(
        (d) =>
          d.status !== "published" &&
          d.status !== "withdrawn" &&
          d.createdAt
      )
      .sort((a, b) => {
        // Sort by deadline (nulls last)
        if (a.deadline && b.deadline) return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        if (a.deadline) return -1;
        if (b.deadline) return 1;
        return 0;
      })
      .slice(0, 10);
  }, [decisions]);

  // Calculate time range
  const { rangeStart, rangeEnd, totalDays } = useMemo(() => {
    if (activeDecisions.length === 0) {
      return { rangeStart: now, rangeEnd: now, totalDays: 1 };
    }

    let earliest = now;
    let latest = now;

    for (const d of activeDecisions) {
      if (d.createdAt) {
        const created = new Date(d.createdAt);
        if (created < earliest) earliest = created;
      }
      if (d.deadline) {
        const dl = new Date(d.deadline);
        if (dl > latest) latest = dl;
      }
    }

    // Add buffer: 5 days before and 10 days after
    const start = new Date(earliest);
    start.setDate(start.getDate() - 5);
    const end = new Date(latest);
    end.setDate(end.getDate() + 10);

    // Ensure "now" is in range
    if (now > end) end.setTime(now.getTime() + 10 * 86400000);

    const days = Math.max(daysBetween(start, end), 1);
    return { rangeStart: start, rangeEnd: end, totalDays: days };
  }, [activeDecisions, now.toDateString()]);

  function toPercent(date: Date): number {
    const days = daysBetween(rangeStart, date);
    return Math.max(0, Math.min(100, (days / totalDays) * 100));
  }

  const todayPercent = toPercent(now);

  // Generate month tick labels
  const monthTicks = useMemo(() => {
    const ticks: Array<{ label: string; percent: number }> = [];
    const d = new Date(rangeStart);
    d.setDate(1);
    if (d < rangeStart) d.setMonth(d.getMonth() + 1);

    while (d <= rangeEnd) {
      const pct = toPercent(d);
      if (pct >= 0 && pct <= 100) {
        ticks.push({
          label: d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
          percent: pct,
        });
      }
      d.setMonth(d.getMonth() + 1);
    }
    return ticks;
  }, [rangeStart, rangeEnd, totalDays]);

  if (activeDecisions.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-text-muted">
        No active decisions to display
      </p>
    );
  }

  return (
    <div className="space-y-1 text-xs">
      {/* Time axis labels */}
      <div className="relative h-5 ml-[140px]">
        {monthTicks.map((tick, i) => (
          <span
            key={i}
            className="absolute text-[10px] text-text-muted -translate-x-1/2"
            style={{ left: `${tick.percent}%` }}
          >
            {tick.label}
          </span>
        ))}
      </div>

      {/* Rows */}
      {activeDecisions.map((d) => {
        const created = d.createdAt ? new Date(d.createdAt) : now;
        const deadline = d.deadline ? new Date(d.deadline) : null;
        const colors = STATUS_COLORS[d.status] ?? STATUS_COLORS.draft;

        const barStart = toPercent(created);
        const barEnd = deadline ? toPercent(deadline) : toPercent(now);
        const barWidth = Math.max(barEnd - barStart, 1);

        const isOverdue = deadline && deadline < now;
        const overdueWidth = isOverdue ? toPercent(now) - toPercent(deadline) : 0;

        const progress = d.currentStep / 10;

        return (
          <div
            key={d.id}
            className="flex items-center group relative"
            onMouseEnter={() => setHoveredId(d.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Label */}
            <div className="w-[140px] shrink-0 pr-2 truncate text-right">
              <Link
                href={`/decisions/${d.id}`}
                className="text-[11px] font-medium text-text hover:text-accent transition-colors"
                title={d.title}
              >
                {d.title.length > 18 ? d.title.slice(0, 18) + "..." : d.title}
              </Link>
              <div className="text-[9px] font-mono text-text-muted">{d.referenceNumber}</div>
            </div>

            {/* Bar area */}
            <div className="flex-1 relative h-7">
              {/* Background bar */}
              <Link
                href={`/decisions/${d.id}`}
                className={`absolute top-1 h-5 rounded ${colors.bg} transition-opacity hover:opacity-80`}
                style={{ left: `${barStart}%`, width: `${barWidth}%` }}
              >
                {/* Filled progress portion */}
                <div
                  className={`h-full rounded ${colors.fill} opacity-70`}
                  style={{ width: `${progress * 100}%` }}
                />
              </Link>

              {/* Overdue extension with red stripes */}
              {isOverdue && overdueWidth > 0 && (
                <div
                  className="absolute top-1 h-5 rounded-r opacity-60"
                  style={{
                    left: `${barEnd}%`,
                    width: `${overdueWidth}%`,
                    backgroundImage:
                      "repeating-linear-gradient(135deg, transparent, transparent 2px, rgba(231,111,81,0.4) 2px, rgba(231,111,81,0.4) 4px)",
                    backgroundColor: "rgba(231,111,81,0.15)",
                  }}
                />
              )}

              {/* Today marker */}
              <div
                className="absolute top-0 h-7 w-px border-l border-dashed border-error/60"
                style={{ left: `${todayPercent}%` }}
              />

              {/* Tooltip */}
              {hoveredId === d.id && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 z-50 mb-1 w-56 rounded-md border border-border bg-white shadow-lg p-2.5 text-left pointer-events-none">
                  <p className="font-medium text-text text-[11px] truncate">{d.title}</p>
                  <p className="font-mono text-[10px] text-text-muted">{d.referenceNumber}</p>
                  {d.ministryName && (
                    <p className="text-[10px] text-text-muted mt-0.5">{d.ministryName}</p>
                  )}
                  <div className="mt-1.5 flex items-center gap-3 text-[10px] text-text-secondary">
                    <span>
                      <span className={`inline-block h-2 w-2 rounded-full mr-1 ${colors.fill}`} />
                      {colors.label}
                    </span>
                    <span>Step {d.currentStep}/10</span>
                  </div>
                  <div className="mt-1 text-[10px] text-text-muted">
                    {d.createdAt && <span>Started: {formatShortDate(new Date(d.createdAt))}</span>}
                    {deadline && (
                      <span className="ml-2">
                        Deadline: {formatShortDate(deadline)}
                        {isOverdue && <span className="text-error font-medium ml-1">(overdue)</span>}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-3 ml-[140px] border-t border-border mt-2">
        {Object.entries(STATUS_COLORS).map(([, val]) => (
          <div key={val.label} className="flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${val.fill}`} />
            <span className="text-[10px] text-text-muted">{val.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <span className="h-px w-3 border-t border-dashed border-error/60" />
          <span className="text-[10px] text-text-muted">Today</span>
        </div>
      </div>
    </div>
  );
}
