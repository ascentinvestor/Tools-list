import { test, expect } from '@playwright/test';

test.describe('FD Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fd-calc');
  });

  test('page has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/FD Calculator/i);
  });

  test('shows SSR-pre-rendered default maturity amount', async ({ page }) => {
    // Default: ₹1L at 7.5% for 3 years quarterly — maturity ~₹1,24,972
    const maturity = page.locator('#maturityValue');
    await expect(maturity).toBeVisible();
    const text = await maturity.textContent();
    // en-IN formatting: 1,24,972 or similar
    expect(text).toMatch(/1,2[0-9],/);
  });

  test('principal input is pre-filled with default value', async ({ page }) => {
    await expect(page.locator('#investmentValue')).toHaveValue('100000');
  });

  test('interest rate input is pre-filled', async ({ page }) => {
    await expect(page.locator('#interestRateValue')).toHaveValue('7.5');
  });

  test('changing principal updates maturity amount', async ({ page }) => {
    const principal = page.locator('#investmentValue');
    const maturity = page.locator('#maturityValue');

    await principal.fill('200000');
    await principal.dispatchEvent('input');

    // Wait for JS recalculation — maturity should roughly double
    await page.waitForFunction(() => {
      const el = document.querySelector('#maturityValue');
      return el && el.textContent && el.textContent.includes('2,4');
    }, { timeout: 5000 });

    const text = await maturity.textContent();
    expect(text).toMatch(/2,[0-9]/);
  });

  test('FD rates table is rendered with bank data', async ({ page }) => {
    const fdRatesTable = page.locator('.fd-rates-section table');
    await expect(fdRatesTable).toBeVisible();
    await expect(fdRatesTable).toContainText('SBI');
  });

  test('year-wise breakdown table shows correct number of rows', async ({ page }) => {
    // Default 3 years → 3 rows in the yearly breakdown table
    // The yearly table is the second table on the page
    const yearlyTable = page.locator('table').nth(1);
    const yearRows = yearlyTable.locator('tbody tr');
    await expect(yearRows).toHaveCount(3);
  });

  test('has accessible skip link', async ({ page }) => {
    await expect(page.locator('a.skip-link')).toHaveAttribute('href', '#main-content');
  });
});
