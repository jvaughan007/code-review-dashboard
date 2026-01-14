"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * DiffSkeleton - Loading state for diff viewer
 */
export function DiffSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* File header */}
      <div className="px-4 py-2 border-b bg-muted/50">
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Diff content */}
      <div className="p-4 space-y-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <DiffLineSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * DiffLineSkeleton - Single diff line loading state
 */
function DiffLineSkeleton() {
  // Randomize widths for more natural look
  const widths = ["w-1/2", "w-3/4", "w-2/3", "w-5/6", "w-1/3"];
  const width = widths[Math.floor(Math.random() * widths.length)];

  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-8 flex-shrink-0" />
      <Skeleton className={`h-4 ${width}`} />
    </div>
  );
}

/**
 * DiffListSkeleton - Multiple diff files loading state
 */
export function DiffListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <DiffSkeleton key={i} />
      ))}
    </div>
  );
}
