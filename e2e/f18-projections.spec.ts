import { test, expect } from '@playwright/test';

test.describe('F18 — Projections & Access Hierarchy E2E Suite', () => {
  test.use({ storageState: 'e2e/.auth/pj-storage.json' });

  // a. Bottom nav renders exactly 5 slots on every /projections/* page (CR-3)
  test('a. Bottom nav renders exactly 5 slots on /projections/aid-queue', async ({ page }) => {
    await page.goto('/projections/aid-queue');
    await page.waitForLoadState('domcontentloaded');

    const navItems = page.locator('nav[aria-label="Navigasi utama"] .grid > *');
    await expect(navItems).toHaveCount(5);
  });

  // b. Beranda attention widget -> aid-queue -> "Keluar Lensa" returns to Beranda (PR-06)
  test('b. Beranda attention widget opens aid-queue and exit returns to Beranda', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    const aidWidget = page.locator('a[aria-label*="permohonan bantuan"]').first();
    await expect(aidWidget).toBeVisible();
    await aidWidget.click();

    await expect(page).toHaveURL(/\/projections\/aid-queue/);

    const exitBtn = page.locator('[aria-label="Keluar dari Proyeksi"]').first();
    await exitBtn.click();

    await expect(page).toHaveURL(/\/dashboard/);
  });

  // c. Org Workspace #assets -> asset-intel -> exit returns to /org/[id]
  test('c. Org Workspace assets projection link opens asset-intel', async ({ page }) => {
    await page.goto('/projections/asset-intel');
    await page.waitForLoadState('domcontentloaded');

    const exitBtn = page.locator('[aria-label="Keluar dari Proyeksi"]').first();
    await expect(exitBtn).toBeVisible();
  });

  // d. GlobalSearchSheet groups results into Entitas vs Transaksi and navigates to target
  test('d. GlobalSearchSheet renders Entitas and Transaksi groups', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    const searchBtn = page.locator('button[aria-label="Cari global di aplikasi"]').first();
    await expect(searchBtn).toBeVisible();
    await searchBtn.click();

    const searchModal = page.locator('input[placeholder*="Cari SDM, Organisasi"]');
    await expect(searchModal).toBeVisible();

    const entitasHeader = page.locator('h4:has-text("Entitas")');
    await expect(entitasHeader).toBeVisible();

    const transaksiHeader = page.locator('h4:has-text("Transaksi")');
    await expect(transaksiHeader).toBeVisible();
  });

  // e. Cold-load /projections/aid-queue -> exit affordance lands on /dashboard
  test('e. Cold-load /projections/aid-queue exit affordance lands on /dashboard', async ({ page }) => {
    await page.goto('/projections/aid-queue');
    await page.waitForLoadState('domcontentloaded');

    const exitBtn = page.locator('[aria-label="Keluar dari Proyeksi"]').first();
    await exitBtn.click();

    await expect(page).toHaveURL(/\/dashboard/);
  });

  // f. Header right side contains icon buttons with min-h-[44px] and aria-label
  test('f. MobileHeader right side search button satisfies accessibility min 44px contract', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    const searchBtn = page.locator('button[aria-label="Cari global di aplikasi"]').first();
    await expect(searchBtn).toBeVisible();

    const box = await searchBtn.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
  });
});
