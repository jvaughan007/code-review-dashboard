"use client";

import { Skeleton, SkeletonAvatar } from "@/components/ui/skeleton";

/**
 * PRListSkeleton - Loading state for PR list
 */
export function PRListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <PRItemSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * PRItemSkeleton - Single PR card loading state
 */
export function PRItemSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      {/* Header: Title and status */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Author and date */}
      <div className="flex items-center gap-3">
        <SkeletonAvatar className="h-6 w-6" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}
