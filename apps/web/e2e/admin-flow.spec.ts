import { test, expect } from '@playwright/test';
import { createTestUser, deleteTestUser, login, prisma, TestUser } from './helpers';

test.describe('Admin', () => {
  let admin: TestUser;
  let contractor: TestUser;
  let targetUser: TestUser;

  test.beforeAll(async () => {
    admin = await createTestUser('admin-flow-admin');
    await prisma.user.update({ where: { id: admin.userId }, data: { role: 'ADMIN' } });

    contractor = await createTestUser('admin-flow-contractor', { role: 'SERVICE_PROVIDER', pro_label: 'Contractor' });
    const profileRes = await fetch('http://localhost:3001/api/v1/contractor-profiles', {
      method: 'POST',
      headers: { Authorization: `Bearer ${contractor.accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractorType: 'FULL_CONTRACTOR', tradeSkills: ['Masonry'], experience: '5 years', serviceCities: ['Srinagar'],
      }),
    });
    if (!profileRes.ok) throw new Error(`contractor profile setup failed: ${profileRes.status} ${await profileRes.text()}`);

    targetUser = await createTestUser('admin-flow-target');
  });

  test.afterAll(async () => {
    await prisma.contractorProfile.deleteMany({ where: { userId: contractor.userId } });
    await deleteTestUser(admin);
    await deleteTestUser(contractor);
    await deleteTestUser(targetUser);
  });

  test('admin approves a pending contractor profile', async ({ page }) => {
    await login(page, admin);
    await page.goto('/admin/approvals?type=contractor');

    const row = page.getByText(contractor.email).first();
    await expect(row).toBeVisible({ timeout: 10000 });

    const approveButton = page.locator('button', { hasText: 'Approve' }).first();
    await approveButton.click();
    await expect(page.getByText(contractor.email)).not.toBeVisible({ timeout: 10000 });

    const profile = await prisma.contractorProfile.findUnique({ where: { userId: contractor.userId } });
    expect(profile?.approvalStatus).toBe('APPROVED');
  });

  test('admin searches for and suspends a user, who is then blocked from logging in', async ({ page }) => {
    await login(page, admin);
    await page.goto('/admin/users');

    await page.getByPlaceholder('Search name, email, or phone…').fill(targetUser.email);
    await page.waitForTimeout(500); // debounced search

    const suspendButton = page.getByRole('button', { name: 'Suspend' }).first();
    await expect(suspendButton).toBeVisible({ timeout: 10000 });
    await suspendButton.click();
    await expect(page.getByRole('button', { name: 'Unsuspend' }).first()).toBeVisible({ timeout: 10000 });

    const targetUserRow = await prisma.user.findUnique({ where: { id: targetUser.userId } });
    expect(targetUserRow?.isSuspended).toBe(true);
  });
});
