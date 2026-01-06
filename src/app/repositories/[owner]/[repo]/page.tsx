import { getRepositoryPullRequests } from "@/lib/github/client";
import { GitPullRequest, Clock, MessageSquare, AlertCircle } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
}

export default async function RepositoryPullRequestsPage({ params }: PageProps) {
  const { owner, repo } = await params;
  let pullRequests;
  let error;

  try {
    pullRequests = await getRepositoryPullRequests(owner, repo, "all");
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to fetch pull requests";
  }

  const openPRs = pullRequests?.filter((pr) => pr.state === "open") || [];
  const closedPRs = pullRequests?.filter((pr) => pr.state === "closed") || [];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Link
            href="/repositories"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to repositories
          </Link>
          <h1 className="mt-4 text-3xl font-bold">
            {owner}/{repo}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Pull requests for this repository
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          </div>
        )}

        <div className="mb-6 flex gap-4 border-b">
          <button className="border-b-2 border-primary px-4 py-2 font-medium">
            Open ({openPRs.length})
          </button>
          <button className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors">
            Closed ({closedPRs.length})
          </button>
        </div>

        {pullRequests && pullRequests.length === 0 && (
          <div className="rounded-lg border bg-card p-8 text-center">
            <GitPullRequest className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No pull requests found</p>
          </div>
        )}

        {openPRs.length > 0 && (
          <div className="space-y-3">
            {openPRs.map((pr) => (
              <Link
                key={pr.id}
                href={`/repositories/${owner}/${repo}/pull/${pr.number}`}
                className="group block rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <GitPullRequest className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {pr.title}
                      </h3>
                      {pr.draft && (
                        <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
                          Draft
                        </span>
                      )}
                    </div>

                    <p className="mb-3 text-sm text-muted-foreground">
                      #{pr.number} opened by @{pr.user.login} •{" "}
                      {new Date(pr.created_at).toLocaleDateString()}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span className="text-green-600">+{pr.additions}</span>
                        <span className="text-red-600">-{pr.deletions}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{pr.changed_files} files</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          Updated {new Date(pr.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <img
                    src={pr.user.avatar_url}
                    alt={pr.user.login}
                    className="h-10 w-10 rounded-full"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
