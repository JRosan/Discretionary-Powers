import { test, expect } from '@playwright/test';

test.describe('Public portal', () => {
  test('landing page loads with hero and search', async ({ page }) => {
    await page.goto('/');

    // Hero section
    await expect(page.locator('h1')).toContainText('Discretionary Powers Transparency Portal');

    // Search input
    await expect(
      page.getByPlaceholder(/search published decisions/i)
    ).toBeVisible();

    // Search button
    await expect(page.getByRole('button', { name: /search/i })).toBeVisible();
  });

  test('published decisions page loads with search and filters', async ({ page }) => {
    await page.goto('/decisions');

    // Search input should be present
    await expect(
      page.getByPlaceholder(/search/i).first()
    ).toBeVisible();

    // Filter controls (type select, sort)
    await expect(page.locator('select').first()).toBeVisible();
  });

  test('about page loads with 10-step framework section', async ({ page }) => {
    await page.goto('/about');

    await expect(page.locator('h1')).toContainText('About the Discretionary Powers Management System');

    // 10-Step Framework section
    await expect(page.getByText('The 10-Step Framework')).toBeVisible();

    // Verify individual steps are rendered (check a few)
    await expect(page.getByText('Identify the Source of Power')).toBeVisible();
  });
});
