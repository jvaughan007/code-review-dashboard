"use client";

import { Skeleton, SkeletonAvatar } from "@/components/ui/skeleton";

/**
 * CommentItemSkeleton - Single comment loading state
 */
export function CommentItemSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      {/* Header: Avatar and username */}
      <div className="flex items-center gap-3">
        <SkeletonAvatar className="h-8 w-8" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      {/* Body: Comment text */}
      <div className="space-y-2 pl-11">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

/**
 * CommentThreadSkeleton - Full comment thread loading state
 */
export function CommentThreadSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Comment input skeleton */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <Skeleton className="h-[100px] w-full rounded-md" />
        <div className="flex justify-end">
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>

      {/* Comments */}
      {Array.from({ length: count }).map((_, i) => (
        <CommentItemSkeleton key={i} />
      ))}
    </div>
  );
}
