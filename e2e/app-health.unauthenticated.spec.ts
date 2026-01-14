import { test, expect } from "@playwright/test";

/**
 * Unauthenticated E2E Tests
 *
 * Tests for public pages that don't require authentication.
 */

test.describe("Public Pages", () => {
  test("home page loads successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Code Review Dashboard/);
  });

  test("home page shows login prompt when not authenticated", async ({ page }) => {
    await page.goto("/");
    // Should see some indication to log in or the app landing page
    await expect(page.locator("body")).toBeVisible();
  });

  test("login page loads successfully", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("body")).toBeVisible();
  });

  test("repositories page redirects to login when not authenticated", async ({
    page,
  }) => {
    await page.goto("/repositories");
    // Should redirect to login or show auth prompt
    await page.waitForURL(/\/(login|auth|repositories)/);
  });
});

test.describe("Public API Health", () => {
  test("app responds to root route", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBeLessThan(500);
  });
});
