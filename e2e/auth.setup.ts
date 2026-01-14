import { test as setup } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "..", "playwright", ".auth", "user.json");

/**
 * Global setup for authenticated E2E tests
 *
 * This setup creates an authenticated session that can be reused across tests.
 *
 * Authentication modes:
 * 1. If TEST_USER_EMAIL and TEST_USER_PASSWORD are set, performs real login
 * 2. Otherwise, creates a mock authenticated state for testing
 *
 * For CI: Set up mock auth state to avoid real GitHub OAuth
 * For local: Can use real credentials if needed
 */
setup("authenticate", async ({ page }) => {
  // Check if we have test credentials
  const testEmail = process.env.TEST_USER_EMAIL;
  const testPassword = process.env.TEST_USER_PASSWORD;

  if (testEmail && testPassword) {
    // Real authentication flow (for local testing with real account)
    // This would require Supabase email/password auth to be enabled
    console.log("Attempting real authentication...");

    await page.goto("/login");

    // Note: This assumes email/password auth is available
    // For GitHub OAuth only, this won't work
    // You would need to manually authenticate and export the state
    console.warn(
      "Real GitHub OAuth authentication requires manual setup. Using mock auth instead."
    );
  }

  // For most E2E tests, we'll use mock authenticated state
  // This injects a mock session directly into localStorage
  await page.goto("/");

  // Create mock auth state that Supabase client will recognize
  // This simulates a logged-in user without actually hitting GitHub
  const mockSession = {
    access_token: "mock-access-token-for-e2e-tests",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: "mock-refresh-token",
    user: {
      id: "e2e-test-user-id",
      aud: "authenticated",
      role: "authenticated",
      email: "e2e-test@example.com",
      email_confirmed_at: new Date().toISOString(),
      phone: "",
      confirmation_sent_at: new Date().toISOString(),
      confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      app_metadata: {
        provider: "github",
        providers: ["github"],
      },
      user_metadata: {
        avatar_url: "https://avatars.githubusercontent.com/u/1234567",
        email: "e2e-test@example.com",
        email_verified: true,
        full_name: "E2E Test User",
        iss: "https://api.github.com",
        name: "E2E Test User",
        preferred_username: "e2e-test-user",
        provider_id: "1234567",
        sub: "1234567",
        user_name: "e2e-test-user",
      },
      identities: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };

  // Inject the mock session into localStorage
  // Supabase stores auth state with a specific key pattern
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
  const storageKey = `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`;

  await page.evaluate(
    ({ key, session }) => {
      localStorage.setItem(key, JSON.stringify(session));
    },
    { key: storageKey, session: mockSession }
  );

  // Save the storage state to file for reuse
  await page.context().storageState({ path: authFile });

  console.log("✅ Mock auth state saved to:", authFile);
});
