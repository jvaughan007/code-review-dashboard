import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton - Animated loading placeholder
 *
 * Use for content that is loading to show users where content will appear.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  );
}

/**
 * SkeletonText - Text line placeholder
 */
export function SkeletonText({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-4 w-full", className)} />;
}

/**
 * SkeletonAvatar - Circular avatar placeholder
 */
export function SkeletonAvatar({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-10 w-10 rounded-full", className)} />;
}

/**
 * SkeletonButton - Button placeholder
 */
export function SkeletonButton({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-9 w-24 rounded-md", className)} />;
}

/**
 * SkeletonCard - Card placeholder with padding
 */
export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <div className="space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}
