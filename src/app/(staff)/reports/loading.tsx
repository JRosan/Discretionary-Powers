import { SkeletonCard, SkeletonChart } from "@/components/common/loading-skeleton";

export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-48 animate-pulse rounded bg-surface-hover" />
          <div className="mt-1 h-4 w-72 animate-pulse rounded bg-surface-hover" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 animate-pulse rounded-lg bg-surface-hover" />
          <div className="h-9 w-16 animate-pulse rounded-lg bg-surface-hover" />
          <div className="h-9 w-16 animate-pulse rounded-lg bg-surface-hover" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-white p-5">
          <div className="h-5 w-40 animate-pulse rounded bg-surface-hover mb-4" />
          <SkeletonChart />
        </div>
        <div className="rounded-lg border border-border bg-white p-5">
          <div className="h-5 w-40 animate-pulse rounded bg-surface-hover mb-4" />
          <SkeletonChart />
        </div>
      </div>
    </div>
  );
}
