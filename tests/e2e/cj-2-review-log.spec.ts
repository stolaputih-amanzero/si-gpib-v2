import { test, expect } from './fixtures';

test.describe('CJ-2: KMJ Review Log Pastoral', () => {
  test('KMJ meninjau daftar log pastoral dan melihat detail catatan', async ({ authenticatedMobilePage: page }) => {
    // 1. Navigasi ke Daftar Log Pastoral
    await page.goto('/laporan/pastoral');
    await expect(page.getByTestId('mobile-header-title')).toBeVisible();

    // 2. Verifikasi Halaman Log Pastoral Tampil
    const pageContainer = page.locator('main').first();
    await expect(pageContainer).toBeVisible();
  });
});
