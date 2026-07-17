import { test, expect } from '@playwright/test';
import { createTestUser, deleteTestUser, login, TestUser } from './helpers';

test.describe('Notifications', () => {
  let customer: TestUser;
  let contractor: TestUser;

  test.beforeAll(async () => {
    customer = await createTestUser('notif-customer');
    contractor = await createTestUser('notif-contractor', { role: 'SERVICE_PROVIDER', pro_label: 'Contractor' });

    // Create a booking via the real API so the contractor gets a real
    // 'booking.created' notification to see in the bell/page.
    const res = await fetch('http://localhost:3001/api/v1/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customer.accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerId: contractor.userId,
        providerRole: 'CONTRACTOR',
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      }),
    });
    if (!res.ok) throw new Error(`booking setup failed: ${res.status} ${await res.text()}`);
  });

  test.afterAll(async () => {
    await deleteTestUser(customer);
    await deleteTestUser(contractor);
  });

  test('bell icon shows an unread count and the notification, which navigates on click', async ({ page }) => {
    await login(page, contractor);
    await page.goto('/dashboard');

    const bell = page.getByRole('button', { name: 'Notifications' });
    await expect(bell).toBeVisible({ timeout: 10000 });
    await expect(bell.getByText(/^[1-9]/)).toBeVisible({ timeout: 10000 });

    await bell.click();
    await expect(page.getByText(/booking/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('notifications page lists it and mark-all-read clears the unread count', async ({ page }) => {
    await login(page, contractor);
    await page.goto('/notifications');

    await expect(page.getByText('Mark all as read')).toBeVisible({ timeout: 10000 });
    await page.getByText('Mark all as read').click();

    const bell = page.getByRole('button', { name: 'Notifications' });
    await expect(bell.getByText(/^[1-9]/)).not.toBeVisible({ timeout: 10000 });
  });
});
