import { test, expect } from '@playwright/test';

test.describe('Tax Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tax-calc');
  });

  test('page has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Tax Calculator/i);
  });

  test('shows both Old Regime and New Regime result card titles', async ({ page }) => {
    // Target the specific result-title divs to avoid strict mode violations
    await expect(page.locator('.result-title').filter({ hasText: 'Old Regime' }).first()).toBeVisible();
    await expect(page.locator('.result-title').filter({ hasText: 'New Regime' }).first()).toBeVisible();
  });

  test('SSR renders default regime comparison summary', async ({ page }) => {
    const summary = page.locator('#summary');
    await expect(summary).toBeVisible();
    const text = await summary.textContent();
    expect(text).toMatch(/Regime/i);
  });

  test('financial year selector is present', async ({ page }) => {
    await expect(page.locator('#financial-year')).toBeVisible();
  });

  test('salary input accepts numeric values', async ({ page }) => {
    const salaryInput = page.locator('input[type="number"]').first();
    await salaryInput.fill('1200000');
    await expect(salaryInput).toHaveValue('1200000');
  });

  test('calculate button is present', async ({ page }) => {
    await expect(page.locator('.btn').first()).toBeVisible();
  });

  test('disclaimer section is visible', async ({ page }) => {
    await expect(page.locator('.disclaimer')).toBeVisible();
  });
});
