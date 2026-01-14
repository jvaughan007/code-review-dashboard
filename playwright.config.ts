import { defineConfig, devices } from "@playwright/test";
import path from "path";

/**
 * Playwright E2E Test Configuration
 *
 * Features:
 * - Auth setup project for authenticated tests
 * - Separate projects for unauthenticated and authenticated flows
 * - Automatic dev server startup
 */

const authFile = path.join(__dirname, "playwright", ".auth", "user.json");

export default defineConfig({
  testDir: "./e2e",

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use */
  reporter: "html",

  /* Shared settings for all projects */
  use: {
    /* Base URL for tests */
    baseURL: "http://localhost:3000",

    /* Collect trace when retrying the failed test */
    trace: "on-first-retry",

    /* Screenshot on failure */
    screenshot: "only-on-failure",
  },

  /* Configure projects */
  projects: [
    // Setup project - runs auth setup before authenticated tests
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },

    // Unauthenticated tests - public pages, login flow
    {
      name: "unauthenticated",
      testMatch: /.*\.unauthenticated\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    // Authenticated tests - require login
    {
      name: "authenticated",
      testMatch: /.*\.authenticated\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        // Use saved auth state
        storageState: authFile,
      },
    },

    // Default project - legacy tests and general tests
    {
      name: "chromium",
      testMatch: /.*\.spec\.ts/,
      testIgnore: [/.*\.(setup|authenticated|unauthenticated)\.spec\.ts/],
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
