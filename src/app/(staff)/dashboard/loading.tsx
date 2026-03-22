import { SkeletonCard, SkeletonTable } from "@/components/common/loading-skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-36 animate-pulse rounded bg-surface-hover" />
          <div className="mt-1 h-4 w-64 animate-pulse rounded bg-surface-hover" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded-lg bg-surface-hover" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonTable rows={5} />
    </div>
  );
}
