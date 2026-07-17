import { test, expect } from '@playwright/test';
import { createTestUser, deleteTestUser, login, prisma, TestUser } from './helpers';

test.describe('Contractor dashboard: incoming booking confirm flow', () => {
  let homeowner: TestUser;
  let contractor: TestUser;

  test.beforeAll(async () => {
    homeowner = await createTestUser('supply-homeowner');
    contractor = await createTestUser('supply-contractor', { role: 'SERVICE_PROVIDER', pro_label: 'Contractor' });

    // Seed a real PENDING booking directly via Prisma so the dashboard has
    // something to show without needing a second browser context.
    await prisma.booking.create({
      data: {
        customerId: homeowner.userId,
        providerId: contractor.userId,
        providerRole: 'CONTRACTOR',
        scheduledAt: new Date(Date.now() + 86400000),
        amount: 0,
      },
    });
  });

  test.afterAll(async () => {
    await prisma.booking.deleteMany({ where: { providerId: contractor.userId } });
    await deleteTestUser(homeowner);
    await deleteTestUser(contractor);
  });

  test('contractor sees the pending booking and can confirm it', async ({ page }) => {
    await login(page, contractor);
    await page.goto('/dashboard');

    await page.getByRole('button', { name: 'Bookings' }).click();
    const confirmButton = page.getByRole('button', { name: '✓ Confirm' });
    await expect(confirmButton).toBeVisible({ timeout: 10000 });
    await confirmButton.click();
    await expect(confirmButton).not.toBeVisible({ timeout: 10000 });
  });

  test('homeowner sees the booking as Confirmed after the provider confirms it', async ({ page }) => {
    await login(page, homeowner);
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'My Bookings' }).click();
    await expect(page.getByText('Confirmed').first()).toBeVisible({ timeout: 10000 });
  });
});
