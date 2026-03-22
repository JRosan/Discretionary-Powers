import { test, expect } from '@playwright/test';
import { setMockAuth } from './helpers';

test.describe('Navigation', () => {
  test('sidebar navigation links are present', async ({ page }) => {
    await setMockAuth(page);
    await page.goto('/dashboard');

    const sidebar = page.locator('aside');

    await expect(sidebar.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /decisions/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /reports/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /judicial reviews/i })).toBeVisible();

    // Admin is a collapsible section with a button
    await expect(sidebar.getByRole('button', { name: /admin/i })).toBeVisible();
  });

  test('public portal navigation links work', async ({ page }) => {
    await page.goto('/');

    const nav = page.locator('nav');

    // Check all public nav links
    const homeLink = nav.getByRole('link', { name: /^home$/i });
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute('href', '/');

    const decisionsLink = nav.getByRole('link', { name: /^decisions$/i });
    await expect(decisionsLink).toBeVisible();
    await expect(decisionsLink).toHaveAttribute('href', '/decisions');

    const ministriesLink = nav.getByRole('link', { name: /^ministries$/i });
    await expect(ministriesLink).toBeVisible();
    await expect(ministriesLink).toHaveAttribute('href', '/ministries');

    const aboutLink = nav.getByRole('link', { name: /^about$/i });
    await expect(aboutLink).toBeVisible();
    await expect(aboutLink).toHaveAttribute('href', '/about');
  });
});
