import { test, expect } from "@playwright/test";

test.describe("Storeffice E2E", () => {
  test("homepage loads and has expected title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Storeffice/);
  });

  test("navigation menu contains Office Spaces link", async ({ page }) => {
    await page.goto("/");
    const navLink = page.locator('text="Office Spaces"');
    await expect(navLink).toBeVisible();
  });

  test("can visit spaces page and see filters", async ({ page }) => {
    await page.goto("/spaces");
    const filterHeader = page.locator("text=Filters");
    await expect(filterHeader).toBeVisible();
  });
});
