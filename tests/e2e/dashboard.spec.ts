import { test, expect } from '@playwright/test';
import { setMockAuth } from './helpers';

test.describe('Dashboard page', () => {
  test.beforeEach(async ({ page }) => {
    await setMockAuth(page);
  });

  test('loads with stats cards', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.locator('h1', { hasText: /dashboard/i })).toBeVisible();

    // Verify the four stats cards are present
    await expect(page.getByText('Total Decisions')).toBeVisible();
    await expect(page.getByText('In Progress')).toBeVisible();
    await expect(page.getByText('Completed')).toBeVisible();
    await expect(page.getByText('Challenged')).toBeVisible();
  });

  test('shows recent decisions section', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByText('Recent Decisions')).toBeVisible();
    // Either shows a list of decisions or the empty state
    await expect(
      page.getByText('No decisions yet').or(page.getByText('View all'))
    ).toBeVisible({ timeout: 10000 });
  });

  test('has New Decision button linking to /decisions/new', async ({ page }) => {
    await page.goto('/dashboard');

    const newDecisionLink = page.getByRole('link', { name: /new decision/i });
    await expect(newDecisionLink).toBeVisible();
    await expect(newDecisionLink).toHaveAttribute('href', '/decisions/new');
  });
});
