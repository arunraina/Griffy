import { test, expect } from '@playwright/test';
import { createTestUser, deleteTestUser, login, TestUser } from './helpers';

test.describe('Auth', () => {
  const created: TestUser[] = [];

  test.afterAll(async () => {
    for (const u of created) await deleteTestUser(u);
  });

  test('homepage loads for a logged-out visitor', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Get Started Free')).toBeVisible();
  });

  test('the "Join as Professional" CTA leads to /signup', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Join as Professional →' }).click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('dashboard without auth redirects to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('logging in with real credentials reaches the dashboard', async ({ page }) => {
    const user = await createTestUser('login-flow');
    created.push(user);
    await login(page, user);
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
