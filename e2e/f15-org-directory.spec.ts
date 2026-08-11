import { test, expect } from '@playwright/test';

test.describe('F15 — Organization Directory Workspace (/org)', () => {
  test('resolves 404 and displays Organization Directory Workspace layout', async ({ page }) => {
    await page.goto('/org');

    await expect(page.locator('text=404')).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'Direktori Organisasi GPIB' })).toBeVisible();

    const searchInput = page.locator('input[placeholder*="Cari nama organisasi"]');
    await expect(searchInput).toBeVisible();

    await expect(page.locator('button:has-text("Semua Level")')).toBeVisible();
    await expect(page.locator('button:has-text("Mupel")')).toBeVisible();
    await expect(page.locator('button:has-text("Jemaat Induk")')).toBeVisible();
    await expect(page.locator('button:has-text("Pos Pelkes")')).toBeVisible();
  });
});
