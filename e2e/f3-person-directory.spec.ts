import { test, expect } from '@playwright/test';

test.describe('Fase 3 — Person Directory Projection Surface E2E Suite (/people)', () => {
  test.use({ storageState: 'e2e/.auth/pj-storage.json' });

  test('01. /people renders SDM Directory title, search bar, and Projection Filter Chips', async ({ page }) => {
    await page.goto('/people');
    await page.waitForLoadState('networkidle');

    // Title & Search
    await expect(page.locator('h1:has-text("Direktori SDM Pelayanan")')).toBeVisible();
    await expect(page.locator('input[name="q"]')).toBeVisible();

    // Projection Filter Chips
    await expect(page.locator('a:has-text("Semua")')).toBeVisible();
    await expect(page.locator('a:has-text("Pendeta")')).toBeVisible();
    await expect(page.locator('a:has-text("Pelayan")')).toBeVisible();
    await expect(page.locator('a:has-text("Relawan")')).toBeVisible();
  });

  test('02. Clicking Pendeta filter chip updates URL query parameter', async ({ page }) => {
    await page.goto('/people');
    await page.waitForLoadState('networkidle');

    const pendetaChip = page.locator('a:has-text("Pendeta")').first();
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
