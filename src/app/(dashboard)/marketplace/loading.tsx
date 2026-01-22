import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

/**
 * Marketplace page loading skeleton - enables route streaming.
 */
export default function MarketplaceLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Filters */}
      <Skeleton className="h-16 w-full rounded-lg" />

      {/* Results count */}
      <Skeleton className="h-4 w-32" />

      {/* Card Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} className="h-64" />
        ))}
      </div>
    </div>
  );
}
