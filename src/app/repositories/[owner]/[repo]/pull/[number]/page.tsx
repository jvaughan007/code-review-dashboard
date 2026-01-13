import {
  getPullRequest,
  getPullRequestFiles,
} from "@/lib/github/client";
import { GitPullRequest, FileCode, AlertCircle } from "lucide-react";
import Link from "next/link";
import { PresenceIndicator } from "@/components/presence-indicator";
import { PRDetailClient } from "@/components/pr-detail-client";
import { DiffViewer } from "@/components/diff-viewer";
import { CommentThread } from "@/components/comment-thread";
import { ActivityFeedContainer } from "@/components/activity-feed/activity-feed-container";

interface PageProps {
  params: Promise<{
    owner: string;
    repo: string;
    number: string;
  }>;
}

export default async function PullRequestDetailPage({ params }: PageProps) {
  const { owner, repo, number } = await params;
  const prNumber = parseInt(number, 10);

  let pullRequest;
  let files: Awaited<ReturnType<typeof getPullRequestFiles>> | undefined;
  let error;

  try {
    [pullRequest, files] = await Promise.all([
      getPullRequest(owner, repo, prNumber),
      getPullRequestFiles(owner, repo, prNumber),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to fetch pull request";
  }

  return (
    <>
      {/* Live cursor tracking - wraps entire viewport */}
      <PRDetailClient prId={`${owner}/${repo}/${number}`} />

      {/* Activity Feed - floating sidebar */}
      <ActivityFeedContainer prId={`${owner}/${repo}/${number}`} />

      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Link
            href={`/repositories/${owner}/${repo}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to {owner}/{repo}
          </Link>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          </div>
        )}

        {pullRequest && (
          <>
            {/* PR Header */}
            <div className="mb-6 rounded-lg border bg-card p-6">
              <div className="mb-4 flex items-start gap-4">
                <GitPullRequest className="mt-1 h-6 w-6 text-green-600" />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">
                    {pullRequest.title}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="rounded-full bg-green-600/10 px-2 py-1 text-xs font-medium text-green-600">
                      {pullRequest.state}
                    </span>
                    <span>
                      #{pullRequest.number} opened by @{pullRequest.user.login}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(pullRequest.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Real-time Presence Indicator */}
                  <div className="mt-3">
                    <PresenceIndicator prId={`${owner}/${repo}/${number}`} />
                  </div>
                </div>
                <img
                  src={pullRequest.user.avatar_url}
                  alt={pullRequest.user.login}
                  className="h-12 w-12 rounded-full"
                />
              </div>

              {pullRequest.body && (
                <div className="mt-4 rounded-md bg-muted p-4">
                  <p className="whitespace-pre-wrap text-sm">
                    {pullRequest.body}
                  </p>
                </div>
              )}

              <div className="mt-4 flex items-center gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">Base: </span>
                  <span className="font-mono font-medium">
                    {pullRequest.base.ref}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Compare: </span>
                  <span className="font-mono font-medium">
                    {pullRequest.head.ref}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-4">
                  <span className="text-green-600">
                    +{pullRequest.additions}
                  </span>
                  <span className="text-red-600">
                    -{pullRequest.deletions}
                  </span>
                  <span className="text-muted-foreground">
                    {pullRequest.changed_files} files
                  </span>
                </div>
              </div>
            </div>

            {/* Files Changed */}
            <div className="rounded-lg border bg-card">
              <div className="border-b p-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <FileCode className="h-5 w-5" />
                  Files Changed ({files?.length || 0})
                </h2>
              </div>

              <div className="divide-y">
                {files?.map((file, index) => (
                  <div key={index} className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="font-mono text-sm">{file.filename}</div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-green-600">+{file.additions}</span>
                        <span className="text-red-600">-{file.deletions}</span>
                        <span className="rounded-full bg-muted px-2 py-1 text-xs">
                          {file.status}
                        </span>
                      </div>
                    </div>

                    {file.patch && (
                      <div className="mt-3">
                        <DiffViewer
                          patch={file.patch}
                          filename={file.filename}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-6">
              <CommentThread prId={`${owner}/${repo}/${number}`} />
            </div>

            {/* Week 2: Real-time Collaboration Features */}
            <div className="mt-6 rounded-lg border border-green-600/50 bg-green-600/5 p-6">
              <h3 className="text-lg font-semibold mb-2">
                ✅ Week 2: Real-time Collaboration (Complete)
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Presence indicators - See who's viewing this PR</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Live cursors - See where teammates are in the code</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Real-time comments - Synchronized comment threads with optimistic UI</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
}
