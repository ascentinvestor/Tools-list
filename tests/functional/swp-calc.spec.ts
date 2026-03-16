import { test, expect } from '@playwright/test';

test.describe('SWP Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/swp-calc');
  });

  test('page has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/SWP Calculator/i);
  });

  test('shows heading', async ({ page }) => {
    await expect(page.locator('main h1').first()).toContainText(/SWP/i);
  });

  test('investment input is pre-filled', async ({ page }) => {
    await expect(page.locator('#investmentValue')).toHaveValue('1000000');
  });

  test('monthly withdrawal input is pre-filled', async ({ page }) => {
    await expect(page.locator('#withdrawalValue')).toHaveValue('8000');
  });

  test('annual return slider is present', async ({ page }) => {
    await expect(page.locator('#returnSlider')).toBeVisible();
  });

  test('SSR renders initial result values', async ({ page }) => {
    const results = page.locator('main .result-value').first();
    await expect(results).toBeVisible();
    const text = await results.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('chart canvas element is present', async ({ page }) => {
    await expect(page.locator('main canvas').first()).toBeVisible();
  });
});
