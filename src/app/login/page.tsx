import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Github } from "lucide-react";
import { headers } from "next/headers";

export default async function LoginPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is already logged in, redirect to home
  if (user) {
    redirect("/");
  }

  async function signInWithGitHub() {
    "use server";

    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get("origin") || "http://localhost:3000";

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${origin}/auth/callback`,
        scopes: "read:user repo",
      },
    });

    if (error) {
      console.error("OAuth error:", error);
      redirect("/login?error=oauth_failed");
    }

    if (data.url) {
      redirect(data.url);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Code Review Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Real-time collaborative code reviews
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <form action={signInWithGitHub} className="space-y-4">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-md bg-foreground px-4 py-3 text-background font-semibold hover:bg-foreground/90 transition-colors"
            >
              <Github className="h-5 w-5" />
              Sign in with GitHub
            </button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              By signing in, you agree to access your GitHub repositories for
              code review purposes
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-2">Features</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Review pull requests in real-time with your team</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Live cursors and presence indicators</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Synchronized comments and discussions</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
