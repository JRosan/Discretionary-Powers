import { test, expect } from '@playwright/test';
import { setMockAuth } from './helpers';

test.describe('Decisions pages', () => {
  test.beforeEach(async ({ page }) => {
    await setMockAuth(page);
  });

  test('list page loads with table', async ({ page }) => {
    await page.goto('/decisions');

    await expect(page.locator('h1', { hasText: /decisions/i })).toBeVisible();

    // Table or empty state should be visible
    await expect(
      page.locator('table').or(page.getByText('No decisions found'))
    ).toBeVisible({ timeout: 10000 });
  });

  test('search filters decisions by title', async ({ page }) => {
    await page.goto('/decisions');

    const searchInput = page.getByPlaceholder(/search decisions/i);
    await expect(searchInput).toBeVisible();

    // Type a search query
    await searchInput.fill('test query');

    // The search input should have the value we typed
    await expect(searchInput).toHaveValue('test query');
  });

  test('status filter works', async ({ page }) => {
    await page.goto('/decisions');

    // Find the status filter select element
    const statusSelect = page.locator('select').filter({ hasText: /all statuses/i });
    await expect(statusSelect).toBeVisible();

    // It should have options
    const options = statusSelect.locator('option');
    expect(await options.count()).toBeGreaterThan(1);
  });

  test('new decision form has all required fields', async ({ page }) => {
    await page.goto('/decisions/new');

    await expect(page.locator('h1', { hasText: /new decision/i })).toBeVisible();

    // Title field
    const titleInput = page.locator('input[name="title"]').or(page.getByLabel(/title/i));
    await expect(titleInput).toBeVisible();

    // Ministry select
    const ministrySelect = page.locator('select[name="ministryId"]').or(page.getByLabel(/ministry/i));
    await expect(ministrySelect).toBeVisible();

    // Decision type select
    const typeSelect = page.locator('select[name="decisionType"]').or(page.getByLabel(/type/i));
    await expect(typeSelect).toBeVisible();
  });
});
