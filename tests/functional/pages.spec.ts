import { test, expect } from '@playwright/test';

test.describe('Static pages', () => {
  test('/portfolio page loads', async ({ page }) => {
    await page.goto('/portfolio');
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('/blogs page loads and shows blog cards', async ({ page }) => {
    await page.goto('/blogs');
    await expect(page).toHaveTitle(/Blog/i);
    // Should have at least one article/card link
    await expect(page.locator('a[href*="blog-"]').first()).toBeVisible();
  });

  test('/fire-calc page loads', async ({ page }) => {
    await page.goto('/fire-calc');
    await expect(page.locator('main h1').first()).toBeVisible();
  });

  test('/privacy-policy page loads', async ({ page }) => {
    await page.goto('/privacy-policy');
    await expect(page.locator('body')).toBeVisible();
  });

  test('/terms-conditions page loads', async ({ page }) => {
    await page.goto('/terms-conditions');
    await expect(page.locator('body')).toBeVisible();
  });

  test('blog article page loads', async ({ page }) => {
    await page.goto('/blog-sip-guide');
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('shared CSS is loaded on tools page (element has computed style)', async ({ page }) => {
    await page.goto('/tools');
    const container = page.locator('main .container, .container').first();
    await expect(container).toBeVisible();
    const maxWidth = await container.evaluate(el => getComputedStyle(el).maxWidth);
    expect(maxWidth).not.toBe('none');
    expect(maxWidth).not.toBe('');
  });

  test('all calculator routes are reachable from tools page', async ({ page }) => {
    await page.goto('/tools');
    const calcLinks = ['/fd-calc', '/tax-calc', '/swp-calc', '/retirement-calc', '/fire-calc'];
    for (const href of calcLinks) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
    }
  });
});
