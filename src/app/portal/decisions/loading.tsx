import { SkeletonSearchBar } from "@/components/common/loading-skeleton";

export default function PublicDecisionsLoading() {
  return (
    <div>
      <div className="h-8 w-56 animate-pulse rounded bg-surface-hover mb-2" />
      <div className="h-4 w-96 animate-pulse rounded bg-surface-hover mb-6" />

      <SkeletonSearchBar />

      <div className="mt-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-white p-6">
            <div className="flex items-start justify-between mb-2">
              <div className="h-3 w-24 animate-pulse rounded bg-surface-hover" />
              <div className="h-5 w-20 animate-pulse rounded bg-surface-hover" />
            </div>
            <div className="h-5 w-72 animate-pulse rounded bg-surface-hover mb-2" />
            <div className="h-4 w-full animate-pulse rounded bg-surface-hover mb-1" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-surface-hover mb-3" />
            <div className="flex gap-4">
              <div className="h-3 w-32 animate-pulse rounded bg-surface-hover" />
              <div className="h-3 w-40 animate-pulse rounded bg-surface-hover" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
