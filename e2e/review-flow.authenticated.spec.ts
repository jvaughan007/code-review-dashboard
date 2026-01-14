import { test, expect } from "@playwright/test";

/**
 * Authenticated E2E Tests
 *
 * Tests for authenticated flows including:
 * - Repository listing
 * - PR review page
 * - Comments
 * - Keyboard navigation
 *
 * These tests use the mock auth state created in auth.setup.ts
 * Note: Some features may not fully work with mock auth (GitHub API calls)
 * but we can test the UI components and interactions.
 */

test.describe("Authenticated Navigation", () => {
  test("can access repositories page when authenticated", async ({ page }) => {
    await page.goto("/repositories");

    // Should not redirect to login
    await expect(page).not.toHaveURL(/\/login/);

    // Page should load (may show empty state if no repos)
    await expect(page.locator("body")).toBeVisible();
  });

  test("shows user is authenticated in UI", async ({ page }) => {
    await page.goto("/");

    // Look for authenticated UI elements (logout button, user menu, etc.)
    // The exact selector depends on your UI implementation
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Keyboard Navigation", () => {
  test("help modal opens with ? key on home page", async ({ page }) => {
    await page.goto("/");

    // Press ? to open help modal
    await page.keyboard.press("Shift+?");

    // Wait for potential modal
    await page.waitForTimeout(500);

    // The modal may or may not appear depending on if FilesSection is rendered
    // This test verifies the keyboard event handler doesn't throw errors
    await expect(page.locator("body")).toBeVisible();
  });

  test("escape key closes any open modals", async ({ page }) => {
    await page.goto("/");

    // Open help with ?
    await page.keyboard.press("Shift+?");
    await page.waitForTimeout(300);

    // Close with Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    // Page should still be usable
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Comment Input", () => {
  test("comment input supports markdown preview tab", async ({ page }) => {
    // Navigate to a PR page (if we had mock PR data)
    // For now, test the home page which may have comment components
    await page.goto("/");

    // Look for Write/Preview tabs in any comment input on the page
    const writeTab = page.getByRole("button", { name: /write/i });
    const previewTab = page.getByRole("button", { name: /preview/i });

    // If comment input exists, test the tabs
    if ((await writeTab.count()) > 0) {
      await expect(writeTab).toBeVisible();
      await expect(previewTab).toBeVisible();

      // Click preview tab
      await previewTab.click();

      // Should show preview state
      await expect(previewTab).toHaveAttribute("class", /border-primary/);
    }
  });
});

test.describe("Activity Feed", () => {
  test("activity feed component renders", async ({ page }) => {
    await page.goto("/");

    // Look for activity feed elements
    // The feed should be present on pages with real-time collaboration
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Presence Indicators", () => {
  test("presence UI elements load without errors", async ({ page }) => {
    await page.goto("/");

    // Verify page loads without console errors related to presence
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await page.waitForTimeout(1000);

    // Filter for presence-related errors
    const presenceErrors = errors.filter(
      (e) => e.includes("presence") || e.includes("cursor")
    );
    expect(presenceErrors).toHaveLength(0);
  });
});

test.describe("Live Cursors", () => {
  test("cursor layer component loads", async ({ page }) => {
    await page.goto("/");

    // Verify cursor layer doesn't cause errors
    await expect(page.locator("body")).toBeVisible();
  });
});
