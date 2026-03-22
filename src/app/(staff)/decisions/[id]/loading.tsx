import { SkeletonText, SkeletonProgressBar } from "@/components/common/loading-skeleton";

export default function DecisionDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Back link */}
      <div className="h-4 w-32 animate-pulse rounded bg-surface-hover" />

      {/* Header */}
      <div>
        <div className="h-3 w-24 animate-pulse rounded bg-surface-hover mb-2" />
        <div className="h-7 w-80 animate-pulse rounded bg-surface-hover" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-surface-hover" />
      </div>

      {/* Metadata cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-white p-4">
            <div className="h-5 w-5 animate-pulse rounded bg-surface-hover" />
            <div className="space-y-1">
              <div className="h-3 w-16 animate-pulse rounded bg-surface-hover" />
              <div className="h-4 w-24 animate-pulse rounded bg-surface-hover" />
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <SkeletonProgressBar />

      {/* Steps */}
      <div className="rounded-lg border border-border bg-white p-6">
        <div className="h-6 w-56 animate-pulse rounded bg-surface-hover mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 rounded-lg p-3">
              <div className="h-6 w-6 animate-pulse rounded-full bg-surface-hover" />
              <div className="flex-1">
                <SkeletonText lines={2} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
