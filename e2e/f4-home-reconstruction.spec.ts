import { test, expect } from '@playwright/test';

test.describe('Fase 4 — Home Reconstruction Attention-First E2E Suite (/dashboard)', () => {
  test.use({ storageState: 'e2e/.auth/pj-storage.json' });

  test('01. /dashboard renders Attention-First 4-Layer Structure', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Layer 1: Context Layer
    await expect(page.locator('text=Sinode GPIB').first()).toBeVisible();

    // Layer 2: Attention Layer
    await expect(page.locator('text=Perlu Perhatian').first()).toBeVisible();

    // Layer 3: Action Layer Shortcuts
    await expect(page.locator('text=Aksi Informasi Ringkas').first()).toBeVisible();
    await expect(page.locator('main a[href="/dashboard/aktivitas"]')).toBeVisible();
    await expect(page.locator('main a[href="/dashboard/aid-requests"]')).toBeVisible();
    await expect(page.locator('main a[href="/people"]')).toBeVisible();

    // Layer 4: Insight Layer Statistics
    await expect(page.locator('text=Ringkasan Statistik & Demografi').first()).toBeVisible();
  });
});
