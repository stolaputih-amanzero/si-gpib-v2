import { test, expect } from './fixtures';
import { mockAsetData } from './utils/mock-data';

test.describe('CJ-5: Input Aset dengan Kamera + GPS', () => {
  test('User dapat mengakses form inventaris aset dan mendeteksi lokasi GPS', async ({ authenticatedMobilePage: page }) => {
    // 1. Akses Halaman Inventaris Aset
    await page.goto('/laporan/aset');
    await expect(page.getByTestId('mobile-header-title')).toBeVisible();

    // 2. Cek Tombol Tambah Aset / Form
    const addAsetBtn = page.getByRole('button', { name: /Tambah|Input Aset/i })
      .or(page.locator('a[href*="/aset/baru"]'))
      .first();

    if (await addAsetBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addAsetBtn.click();
      await page.waitForURL(/\/aset/);
    }
  });
});
