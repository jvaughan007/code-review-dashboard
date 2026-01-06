import { createClient } from "@/lib/supabase/server";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function signOut() {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-sans text-sm">
        {user && (
          <div className="mb-8 flex items-center justify-between rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3">
              {user.user_metadata.avatar_url && (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  className="h-10 w-10 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold">
                  {user.user_metadata.full_name || user.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  @{user.user_metadata.user_name}
                </p>
              </div>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </form>
          </div>
        )}

        <h1 className="text-4xl font-bold text-center mb-4">
          Code Review Dashboard
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Real-time collaborative code reviews for GitHub pull requests
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-2">Real-time Collaboration</h2>
            <p className="text-muted-foreground">
              See teammates&apos; cursors and review PRs together in real-time
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-2">GitHub Integration</h2>
            <p className="text-muted-foreground">
              Seamlessly connect with your GitHub repositories and pull requests
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-2">Performance First</h2>
            <p className="text-muted-foreground">
              Built for speed with Next.js 15 and React Server Components
            </p>
          </div>
        </div>

        {user && (
          <div className="mt-8">
            <Link
              href="/repositories"
              className="flex items-center justify-between rounded-lg border bg-card p-6 transition-colors hover:bg-accent group"
            >
              <div>
                <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  Browse Your Repositories
                </h2>
                <p className="text-muted-foreground">
                  View repositories and review pull requests in real-time
                </p>
              </div>
              <div className="text-4xl">→</div>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
