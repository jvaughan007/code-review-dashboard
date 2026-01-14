"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * RepositoryCardSkeleton - Single repository card loading state
 */
export function RepositoryCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-3">
      {/* Header: Name and badge */}
      <div className="flex items-start justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Updated date */}
      <Skeleton className="h-3 w-28" />
    </div>
  );
}

/**
 * RepositoryListSkeleton - Repository grid loading state
 */
export function RepositoryListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <RepositoryCardSkeleton key={i} />
      ))}
    </div>
  );
}
