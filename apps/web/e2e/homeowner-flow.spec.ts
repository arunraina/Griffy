import { test, expect } from '@playwright/test';
import { createTestUser, deleteTestUser, login, prisma, TestUser } from './helpers';

test.describe('Homeowner: browse -> request quote -> dashboard', () => {
  let homeowner: TestUser;
  let contractor: TestUser;

  test.beforeAll(async () => {
    homeowner = await createTestUser('homeowner-flow');
    contractor = await createTestUser('homeowner-flow-contractor', { role: 'SERVICE_PROVIDER', pro_label: 'Contractor' });

    const res = await fetch('http://localhost:3001/api/v1/contractor-profiles', {
      method: 'POST',
      headers: { Authorization: `Bearer ${contractor.accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractorType: 'FULL_CONTRACTOR', tradeSkills: ['Masonry'], experience: '5 years',
        serviceCities: ['Srinagar'], isAvailable: true,
      }),
    });
    if (!res.ok) throw new Error(`contractor profile setup failed: ${res.status} ${await res.text()}`);
    const profile = await res.json();
    await prisma.contractorProfile.update({ where: { id: profile.id }, data: { approvalStatus: 'APPROVED' } });
  });

  test.afterAll(async () => {
    await prisma.booking.deleteMany({ where: { customerId: homeowner.userId } });
    await prisma.contractorProfile.deleteMany({ where: { userId: contractor.userId } });
    await deleteTestUser(homeowner);
    await deleteTestUser(contractor);
  });

  test('homepage -> Find Contractors -> detail -> Request Quote -> dashboard shows PENDING booking', async ({ page }) => {
    await login(page, homeowner);

    await page.goto('/');
    await page.getByRole('link', { name: 'Find Contractors' }).first().click();
    await expect(page).toHaveURL(/\/contractors/);

    const detailLink = page.getByRole('link', { name: 'View Profile' }).first();
    await expect(detailLink).toBeVisible({ timeout: 15000 });
    await detailLink.click();
    await expect(page).toHaveURL(/\/contractors\/.+/);

    await page.getByRole('button', { name: 'Request Quote' }).first().click();
    await expect(page.getByText('Preferred Date')).toBeVisible({ timeout: 10000 });

    const dateInput = page.locator('input[type="date"]');
    await dateInput.fill(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    await page.getByPlaceholder(/Describe the work/).fill('Need a bathroom retiled, about 80 sq ft.');
    await page.getByRole('button', { name: 'Send Request' }).click();

    await expect(page.getByText(/Booking Requested!|Something went wrong|Please select a date/)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Booking Requested!')).toBeVisible();

    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'My Bookings' }).click();
    await expect(page.getByText('Pending').first()).toBeVisible({ timeout: 10000 });
  });
});
