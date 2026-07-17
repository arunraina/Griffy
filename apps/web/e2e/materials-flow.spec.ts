import { test, expect } from '@playwright/test';
import { createTestUser, deleteTestUser, login, TestUser } from './helpers';

test.describe('Materials -> Cart -> Checkout (COD)', () => {
  let homeowner: TestUser;

  test.beforeAll(async () => {
    homeowner = await createTestUser('materials-flow');
  });

  test.afterAll(async () => {
    await deleteTestUser(homeowner);
  });

  test('browse materials, add to cart, adjust quantity, and place a COD order', async ({ page }) => {
    await login(page, homeowner);

    await page.goto('/materials');

    const firstCard = page.locator('a[href^="/materials/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 15000 });
    await firstCard.click();
    await expect(page).toHaveURL(/\/materials\/.+/);

    const addToCart = page.getByRole('button', { name: /Add to Cart/i }).first();
    await expect(addToCart).toBeVisible({ timeout: 15000 });
    await addToCart.click();

    await page.goto('/cart');
    await expect(page.getByText('Proceed to Checkout')).toBeVisible({ timeout: 10000 });

    await page.getByRole('link', { name: 'Proceed to Checkout' }).click();
    await expect(page).toHaveURL(/\/checkout/);

    await page.getByPlaceholder('Full name').fill('Test Buyer');
    await page.getByPlaceholder('Phone number').fill('9876543210');
    await page.getByPlaceholder('Address line 1').fill('221B Test Street');
    await page.getByPlaceholder('City').fill('Srinagar');
    await page.locator('select').selectOption({ index: 1 });
    await page.getByPlaceholder('Pincode').fill('190001');

    await page.getByRole('button', { name: 'Continue to Payment' }).click();
    await page.getByText('Cash on Delivery').click();
    await page.getByRole('button', { name: 'Place Order' }).click();

    await expect(page.getByText('Order Placed!')).toBeVisible({ timeout: 15000 });
  });
});
