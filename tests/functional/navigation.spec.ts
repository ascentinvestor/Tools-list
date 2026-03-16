import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('/ redirects to /tools', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/tools/);
  });

  test('/tools page loads with correct title', async ({ page }) => {
    await page.goto('/tools');
    await expect(page).toHaveTitle(/AscentInvestor/i);
  });

  test('tools page has nav links for Tools, Blogs, Portfolio', async ({ page }) => {
    await page.goto('/tools');
    await expect(page.locator('nav a[href="/tools"]')).toBeVisible();
    await expect(page.locator('nav a[href="/blogs"]')).toBeVisible();
    await expect(page.locator('nav a[href="/portfolio"]')).toBeVisible();
  });

  test('Tools nav link has aria-current=page on /tools', async ({ page }) => {
    await page.goto('/tools');
    await expect(page.locator('nav a[href="/tools"]')).toHaveAttribute('aria-current', 'page');
  });

  test('skip link is present for accessibility', async ({ page }) => {
    await page.goto('/tools');
    await expect(page.locator('a.skip-link')).toHaveAttribute('href', '#main-content');
  });

  test('logo on tools page links to /tools', async ({ page }) => {
    await page.goto('/tools');
    await expect(page.locator('header a.logo')).toHaveAttribute('href', '/tools');
  });

  test('blog article header logo links to YouTube', async ({ page }) => {
    await page.goto('/blog-sip-guide');
    // Blog articles use HeaderBlog — logo points to YouTube
    await expect(page.locator('header a.logo')).toHaveAttribute('href', /youtube/i);
  });

  test('Blogs nav link has aria-current=page on /blogs', async ({ page }) => {
    await page.goto('/blogs');
    await expect(page.locator('nav a[href="/blogs"]')).toHaveAttribute('aria-current', 'page');
  });

  test('navigating to /fd-calc shows FD calculator page', async ({ page }) => {
    await page.goto('/fd-calc');
    await expect(page.locator('main h1').first()).toContainText(/FD/i);
  });

  test('footer is present on tools page', async ({ page }) => {
    await page.goto('/tools');
    await expect(page.locator('footer')).toBeVisible();
  });
});
