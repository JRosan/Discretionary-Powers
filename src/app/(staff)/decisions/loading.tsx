import { SkeletonSearchBar, SkeletonTable } from "@/components/common/loading-skeleton";

export default function DecisionsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-32 animate-pulse rounded bg-surface-hover" />
          <div className="mt-1 h-4 w-72 animate-pulse rounded bg-surface-hover" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded-lg bg-surface-hover" />
      </div>
      <div className="flex flex-wrap gap-3">
        <SkeletonSearchBar />
        <div className="h-10 w-36 animate-pulse rounded-lg bg-surface-hover" />
        <div className="h-10 w-36 animate-pulse rounded-lg bg-surface-hover" />
      </div>
      <SkeletonTable rows={8} />
    </div>
  );
}
