import { PRDetailPageSkeleton } from "@/components/skeletons/pr-detail-skeleton";

/**
 * Loading state for PR detail page
 * Automatically used by Next.js Suspense boundaries
 */
export default function PullRequestDetailLoading() {
  return <PRDetailPageSkeleton />;
}
