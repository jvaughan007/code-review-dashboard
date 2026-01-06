import { getUserRepositories } from "@/lib/github/client";
import { GitFork, Star, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function RepositoriesPage() {
  let repositories;
  let error;

  try {
    repositories = await getUserRepositories();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to fetch repositories";
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Your Repositories</h1>
          <p className="mt-2 text-muted-foreground">
            Select a repository to view and review pull requests
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

        {repositories && repositories.length === 0 && (
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-muted-foreground">No repositories found</p>
          </div>
        )}

        {repositories && repositories.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {repositories.map((repo) => (
              <Link
                key={repo.id}
                href={`/repositories/${repo.owner.login}/${repo.name}`}
                className="group rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
              >
                <div className="mb-3 flex items-start justify-between">
                  <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {repo.name}
                  </h2>
                  {repo.private && (
                    <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
                      Private
                    </span>
                  )}
                </div>

                {repo.description && (
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                    {repo.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>{repo.stargazers_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="h-4 w-4" />
                    <span>{repo.open_issues_count} issues</span>
                  </div>
                </div>

                <div className="mt-4 text-xs text-muted-foreground">
                  Updated {new Date(repo.updated_at).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
