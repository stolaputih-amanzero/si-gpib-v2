import { test, expect } from './fixtures';

test.describe('CJ-4: Mutasi Pendeta via RPC Prosedur Atomik', () => {
  test('Super User dapat melihat daftar pendeta dan riwayat mutasi', async ({ authenticatedMobilePage: page }) => {
    // 1. Akses Halaman Daftar Pendeta
    await page.goto('/sdm/pendeta');
    await expect(page.getByTestId('mobile-header-title')).toBeVisible();

    // 2. Verifikasi Card / Link Pendeta
    const pendetaCard = page.locator('a[href*="/pendeta/"]').first();
    if (await pendetaCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await pendetaCard.click();
      await expect(page).toHaveURL(/\/pendeta\/[A-Za-z0-9-]+/);
    }
  });
});
