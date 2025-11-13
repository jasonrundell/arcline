import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should display the main title", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("ARCline");
  });

  test("should display all hotline cards", async ({ page }) => {
    await page.goto("/");
    
    const hotlineCards = page.locator('[aria-label*="Access"]');
    await expect(hotlineCards).toHaveCount(5);
  });

  test("should navigate to hotline detail page", async ({ page }) => {
    await page.goto("/");
    
    const firstCard = page.locator('[aria-label*="Access"]').first();
    await firstCard.click();
    
    await expect(page).toHaveURL(/\/hotline\//);
  });

  test("should have PWA manifest", async ({ page }) => {
    await page.goto("/");
    
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute("href", "/manifest.json");
  });

  test("should be accessible", async ({ page }) => {
    await page.goto("/");
    
    // Check for proper heading structure
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    
    // Check for focusable elements
    const buttons = page.locator("button, a");
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });
});

