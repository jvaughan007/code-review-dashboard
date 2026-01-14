import { RepositoryListSkeleton } from "@/components/skeletons/repository-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for repositories list page
 * Automatically used by Next.js Suspense boundaries
 */
export default function RepositoriesLoading() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-80 mt-2" />
        </div>

        {/* Repository grid */}
        <RepositoryListSkeleton count={6} />
      </div>
    </div>
  );
}
