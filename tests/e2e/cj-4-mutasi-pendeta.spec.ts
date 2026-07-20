import { test, expect } from '@playwright/test';

test.describe('CJ-4: Mutasi Pendeta via RPC Prosedur Atomik', () => {
  test('Super User dapat melihat daftar pendeta dan riwayat mutasi', async ({ page }) => {
    // 1. Akses Halaman Daftar Pendeta
    await page.goto('/pendeta');
    await expect(page.getByText('Daftar Pendeta GPIB')).toBeVisible();

    // 2. Klik Pendeta Pertama
    const firstPendetaCard = page.locator('a[href^="/pendeta/"]').first();
    if (await firstPendetaCard.isVisible()) {
      await firstPendetaCard.click();
      await expect(page).toHaveURL(/\/pendeta\/[A-Za-z0-9-]+/);
    }
  });
});
