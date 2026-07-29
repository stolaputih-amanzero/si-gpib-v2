import { test, expect } from './fixtures';
import { mockPastoralData } from './utils/mock-data';

test.describe('CJ-1: Pendeta Input Log Pastoral di Lapangan', () => {
  test('Pendeta berhasil login dan menginputkan Log Pastoral', async ({ authenticatedMobilePage: page }) => {
    // 1. Navigasi ke Halaman Log Pastoral Baru
    await page.goto('/dashboard/pastoral/baru');

    // 2. Input Data Log Pastoral
    await page.getByTestId('input-kegiatan').fill(mockPastoralData.kegiatan);
    await page.getByTestId('input-jml-jiwa').fill(mockPastoralData.jmlJiwa);
    await page.getByTestId('button-submit').click();

    // 3. Verifikasi Toast Sukses atau Navigasi Kembali
    await expect(page.getByTestId('toast-success')).toBeVisible({ timeout: 10000 });
  });
});
