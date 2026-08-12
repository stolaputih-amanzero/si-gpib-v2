import { test, expect } from '@playwright/test';

test.describe('F20 — Offline Sync Utility E2E Suite (/offline-sync)', () => {
  test.use({ storageState: 'e2e/.auth/pj-storage.json' });

  test('01. /offline-sync renders System Utility Header and draft buffer queue status', async ({ page }) => {
    await page.goto('/offline-sync');
    await page.waitForLoadState('domcontentloaded');

    // System Utility Title (U-2)
    await expect(page.locator('h1:has-text("Utilitas Sistem: Sinkronisasi Offline")').first()).toBeVisible();
    await expect(page.locator('text=Utilitas Sistem Internal').first()).toBeVisible();

    // Draft Buffer Queue Status
    await expect(page.locator('text=Semua data tersinkronisasi').first()).toBeVisible();
  });

  test('02. Back button in Utility Header returns to dashboard', async ({ page }) => {
    await page.goto('/offline-sync');
    await page.waitForLoadState('domcontentloaded');

    const backBtn = page.locator('a[aria-label="Kembali ke Dashboard"]').first();
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('03. Settings Hub Manajer Sinkronisasi Offline link navigates to /offline-sync', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');

    const offlineSyncLink = page.locator('a[aria-label="Buka Manajer Sinkronisasi Offline"]').first();
    await expect(offlineSyncLink).toBeVisible();
    await offlineSyncLink.click();

    await expect(page).toHaveURL(/\/offline-sync/);
  });
});
