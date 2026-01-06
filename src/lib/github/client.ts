import { createClient } from "@/lib/supabase/server";
import type {
  GitHubRepository,
  GitHubPullRequest,
  GitHubUser,
} from "./types";

const GITHUB_API_BASE = "https://api.github.com";

async function getAccessToken(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.provider_token ?? null;
}

async function githubFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = await getAccessToken();

  if (!token) {
    throw new Error("No GitHub access token available");
  }

  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function getCurrentUser(): Promise<GitHubUser> {
  return githubFetch<GitHubUser>("/user");
}

export async function getUserRepositories(
  username?: string
): Promise<GitHubRepository[]> {
  if (username) {
    return githubFetch<GitHubRepository[]>(`/users/${username}/repos`);
  }
  // Get authenticated user's repos (includes private repos)
  return githubFetch<GitHubRepository[]>("/user/repos?sort=updated&per_page=100");
}

export async function getRepositoryPullRequests(
  owner: string,
  repo: string,
  state: "open" | "closed" | "all" = "open"
): Promise<GitHubPullRequest[]> {
  return githubFetch<GitHubPullRequest[]>(
    `/repos/${owner}/${repo}/pulls?state=${state}&per_page=100`
  );
}

export async function getPullRequest(
  owner: string,
  repo: string,
  pullNumber: number
): Promise<GitHubPullRequest> {
  return githubFetch<GitHubPullRequest>(
    `/repos/${owner}/${repo}/pulls/${pullNumber}`
  );
}

export async function getPullRequestFiles(
  owner: string,
  repo: string,
  pullNumber: number
): Promise<
  Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    changes: number;
    patch?: string;
  }>
> {
  return githubFetch(
    `/repos/${owner}/${repo}/pulls/${pullNumber}/files?per_page=100`
  );
}
