import { Page } from '@playwright/test';

/**
 * Sets a mock JWT token in localStorage to simulate an authenticated session.
 * Must be called before navigating to staff pages.
 */
export async function setMockAuth(page: Page) {
  // Navigate to a page first so we can set localStorage on the correct origin
  await page.goto('/login', { waitUntil: 'commit' });

  await page.evaluate(() => {
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItaWQiLCJlbWFpbCI6InRlc3RAZ292LnZnIiwibmFtZSI6IlRlc3QgVXNlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6OTk5OTk5OTk5OSwiZXhwIjo5OTk5OTk5OTk5fQ.mock-signature';
    localStorage.setItem('auth_token', mockToken);
  });
}
