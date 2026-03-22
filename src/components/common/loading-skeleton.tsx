"use client";

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-surface-hover" />
          <div className="h-7 w-16 animate-pulse rounded bg-surface-hover" />
        </div>
        <div className="h-10 w-10 animate-pulse rounded-lg bg-surface-hover" />
      </div>
      <div className="mt-2 h-3 w-20 animate-pulse rounded bg-surface-hover" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-border bg-white overflow-hidden">
      <div className="border-b border-border bg-surface px-4 py-3 flex gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-4 w-24 animate-pulse rounded bg-surface-hover" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-border last:border-0 px-4 py-3 flex gap-4">
          {Array.from({ length: 5 }).map((_, j) => (
            <div key={j} className="h-4 w-20 animate-pulse rounded bg-surface-hover" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded bg-surface-hover"
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="h-64 w-full animate-pulse rounded-lg bg-surface-hover" />
  );
}

export function SkeletonSearchBar() {
  return (
    <div className="h-10 w-full max-w-md animate-pulse rounded-lg bg-surface-hover" />
  );
}

export function SkeletonProgressBar() {
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 w-32 animate-pulse rounded bg-surface-hover" />
        <div className="h-4 w-24 animate-pulse rounded bg-surface-hover" />
      </div>
      <div className="h-2 w-full animate-pulse rounded-full bg-surface-hover" />
    </div>
  );
}
