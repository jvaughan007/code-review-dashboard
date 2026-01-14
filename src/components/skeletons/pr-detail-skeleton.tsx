"use client";

import { Skeleton, SkeletonAvatar } from "@/components/ui/skeleton";
import { DiffListSkeleton } from "./diff-skeleton";
import { CommentThreadSkeleton } from "./comment-skeleton";

/**
 * PRHeaderSkeleton - PR header loading state
 */
export function PRHeaderSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      {/* Title and icon */}
      <div className="flex items-start gap-4">
        <Skeleton className="h-6 w-6 rounded-full mt-1" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-48" />
          </div>
          {/* Presence skeleton */}
          <div className="flex items-center gap-2 mt-3">
            <Skeleton className="h-4 w-20" />
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <SkeletonAvatar key={i} className="h-6 w-6 border-2 border-card" />
              ))}
            </div>
          </div>
        </div>
        <SkeletonAvatar className="h-12 w-12" />
      </div>

      {/* PR body */}
      <div className="rounded-md bg-muted p-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

/**
 * FilesSectionSkeleton - Files changed section loading state
 */
export function FilesSectionSkeleton() {
  return (
    <div className="rounded-lg border bg-card">
      {/* Header */}
      <div className="border-b p-4 space-y-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-3 w-48" />
      </div>

      {/* Diff content */}
      <div className="p-4">
        <DiffListSkeleton count={2} />
      </div>
    </div>
  );
}

/**
 * PRDetailPageSkeleton - Full PR detail page loading state
 */
export function PRDetailPageSkeleton() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Back link */}
        <Skeleton className="h-4 w-32" />

        {/* PR Header */}
        <PRHeaderSkeleton />

        {/* Files Section */}
        <FilesSectionSkeleton />

        {/* Comments Section */}
        <div className="mt-6">
          <CommentThreadSkeleton count={2} />
        </div>
      </div>
    </div>
  );
}
