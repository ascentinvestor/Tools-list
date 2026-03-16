import { test, expect } from '@playwright/test';

test.describe('Retirement Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/retirement-calc');
  });

  test('page has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Retirement Calculator/i);
  });

  test('shows heading', async ({ page }) => {
    await expect(page.locator('main h1').first()).toContainText(/Retirement/i);
  });

  test('current age input is pre-filled to 30', async ({ page }) => {
    await expect(page.locator('#currentAgeValue')).toHaveValue('30');
  });

  test('retirement age input is pre-filled to 60', async ({ page }) => {
    await expect(page.locator('#retirementAgeValue')).toHaveValue('60');
  });

  test('SSR renders corpus needed result', async ({ page }) => {
    const result = page.locator('#retirementCorpus');
    await expect(result).toBeVisible();
    const text = await result.textContent();
    // Should contain a formatted rupee amount
    expect(text).toMatch(/[₹\d,. L Cr]/);
  });

  test('SSR renders projected corpus result', async ({ page }) => {
    const result = page.locator('#projectedCorpus');
    await expect(result).toBeVisible();
    const text = await result.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('has canvas charts', async ({ page }) => {
    await expect(page.locator('main canvas').first()).toBeVisible();
  });
});
