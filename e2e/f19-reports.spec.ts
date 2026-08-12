import { test, expect } from '@playwright/test';

test.describe('F19 — Reports & Analytics Projection Surface E2E Suite (/projections/reports)', () => {
  test.use({ storageState: 'e2e/.auth/pj-storage.json' });

  test('01. /projections/reports renders Lens Boundary Header and metric cards', async ({ page }) => {
    await page.goto('/projections/reports');
    await page.waitForLoadState('domcontentloaded');

    // Title & Lens Boundary Header (U-1)
    await expect(page.locator('h1:has-text("Laporan & Analitik Pelayanan")').first()).toBeVisible();
    await expect(page.locator('text=Proyeksi Laporan').first()).toBeVisible();

    // Aggregated Metric Cards (U-4 tabular-nums)
    await expect(page.locator('text=Demografi SDM').first()).toBeVisible();
    await expect(page.locator('text=Ajuan Bantuan YTD').first()).toBeVisible();
    await expect(page.locator('text=Aset Terdaftar').first()).toBeVisible();

    // Bottom Nav stays exactly 5 slots (CR-3)
    const navItems = page.locator('nav[aria-label="Navigasi utama"] .grid > *');
    await expect(navItems).toHaveCount(5);
  });

  test('02. Exit projection affordance returns to origin dashboard', async ({ page }) => {
    await page.goto('/projections/reports');
    await page.waitForLoadState('domcontentloaded');

    const exitBtn = page.locator('[aria-label="Keluar dari Proyeksi"]').first();
    await expect(exitBtn).toBeVisible();
    await exitBtn.click();

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('03. Beranda Layer 4 Buka Laporan Full link navigates to /projections/reports', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    const reportsLink = page.locator('a[aria-label="Buka Laporan & Analitik Full"]').first();
    await expect(reportsLink).toBeVisible();
    await Promise.all([
      page.waitForURL(/\/projections\/reports/),
      reportsLink.click()
    ]);

    await expect(page).toHaveURL(/\/projections\/reports/);
  });
});
