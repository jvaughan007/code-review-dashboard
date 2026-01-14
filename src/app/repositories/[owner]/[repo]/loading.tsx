import { PRListSkeleton } from "@/components/skeletons/pr-list-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for repository PR list page
 * Automatically used by Next.js Suspense boundaries
 */
export default function RepositoryPRListLoading() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl">
        {/* Back link */}
        <div className="mb-8">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-64 mt-4" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>

        {/* Tab bar */}
        <div className="mb-6 flex gap-4 border-b pb-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>

        {/* PR List */}
        <PRListSkeleton />
      </div>
    </div>
  );
}
