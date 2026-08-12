import { test, expect } from '@playwright/test';

test.describe('Fase 3 — Person Directory Projection Surface E2E Suite (/people)', () => {
  test.use({ storageState: 'e2e/.auth/pj-storage.json' });

  test('01. /people renders SDM Directory title, search bar, and Projection Filter Chips', async ({ page }) => {
    await page.goto('/people');
    await page.waitForLoadState('networkidle');

    // Title & Search
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('input[name="q"]')).toBeVisible();

    // Projection Filter Chips inside filter container
    await expect(page.locator('.no-scrollbar a[href="/people"]')).toBeVisible();
    await expect(page.locator('.no-scrollbar a[href*="type=pendeta"]')).toBeVisible();
    await expect(page.locator('.no-scrollbar a[href*="type=pelayan"]')).toBeVisible();
    await expect(page.locator('.no-scrollbar a[href*="type=relawan"]')).toBeVisible();
  });

  test('02. Clicking Pendeta filter chip updates URL query parameter', async ({ page }) => {
    await page.goto('/people');
    await page.waitForLoadState('networkidle');

    const pendetaChip = page.locator('.no-scrollbar a[href*="type=pendeta"]');
    await pendetaChip.click();

    await expect(page).toHaveURL(/type=pendeta/);
  });

  test('03. Clicking SemanticRow item navigates to canonical F2 Person Workspace', async ({ page }) => {
    await page.goto('/people');
    await page.waitForLoadState('networkidle');

    const firstRow = page.locator('a[href*="/people/"]').first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await page.waitForURL(/\/people\/.+/);

      // Verify F2 Person Workspace #overview section is visible
      const overview = page.locator('#overview');
      await expect(overview).toBeVisible();
    }
  });
});
