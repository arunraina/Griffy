import { test, expect } from '@playwright/test';

test.describe('Estimator', () => {
  test('hub page shows all 7 tools', async ({ page }) => {
    await page.goto('/estimate');
    const links = [
      '/estimate/cost', '/estimate/bricks', '/estimate/concrete',
      '/estimate/plaster', '/estimate/flooring', '/estimate/paint', '/estimate/steel',
    ];
    for (const href of links) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
    }
  });

  test('bricks calculator computes reactively and updates the URL', async ({ page }) => {
    await page.goto('/estimate/bricks');
    const inputs = page.locator('input[type="number"]');
    // Use values different from the component's own defaults (20/10) — a
    // fill() that lands on the same value React already has tracked as the
    // controlled input's value does not reliably fire onChange.
    await inputs.nth(0).fill('25'); // wall length
    await inputs.nth(1).fill('12'); // wall height

    await expect(page).toHaveURL(/l=25/);
    await expect(page).toHaveURL(/h=12/);

    // A result section should render some computed quantity.
    await expect(page.getByText(/bricks/i).first()).toBeVisible();
  });

  test('Buy These Materials button performs a real action (not a dead button)', async ({ page }) => {
    await page.goto('/estimate/bricks?l=20&h=10&t=9');
    const buyButton = page.getByRole('button', { name: /Buy These Materials/i });
    await expect(buyButton).toBeVisible({ timeout: 10000 });
    await buyButton.click();
    // Either outcome proves the button is wired to a real handler rather than
    // doing nothing; which one occurs depends on whether matching materials
    // exist in the dev DB right now.
    await expect(page.getByText(/Added .* items? to your cart|Could not match these to materials/i)).toBeVisible({ timeout: 10000 });
  });
});
