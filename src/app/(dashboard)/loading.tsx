import { Skeleton, SkeletonCard, SkeletonStat } from "@/components/ui/Skeleton";

/**
 * Dashboard loading skeleton - shows while the dashboard page is loading.
 * This enables route streaming for better perceived performance.
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Grid skeleton */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <SkeletonStat />
        <SkeletonStat />
        <SkeletonStat />
        <SkeletonStat />
      </div>

      {/* Main Content Grid skeleton */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <SkeletonCard className="h-80" />
        <SkeletonCard className="h-80" />
      </div>

      {/* Quick Actions skeleton */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
