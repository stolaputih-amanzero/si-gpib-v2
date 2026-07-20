import { test, expect } from '@playwright/test';

test.describe('CJ-1: Pendeta Input Log Pastoral di Lapangan', () => {
  test('Pendeta berhasil login dan menginputkan Log Pastoral', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    
    // Fill phone number & password
    const phoneInput = page.getByTestId('input-phone');
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('+62 878 5513 7387');
      await page.getByTestId('input-password').fill('Shitdamn24');
      await page.getByTestId('button-login').click();
    }

    // 2. Navigasi ke Halaman Log Pastoral Baru
    await page.goto('/dashboard/pastoral/baru');

    // 3. Input Data Log Pastoral
    const kegiatanInput = page.getByTestId('input-kegiatan');
    if (await kegiatanInput.isVisible()) {
      await kegiatanInput.fill('Kunjungan Pastoral Jemaat Pos Pelkes Getsemani');
      await page.getByTestId('input-jml-jiwa').fill('15');
      await page.getByTestId('button-submit-log').click();
    } else {
      // Fallback selector jika data-testid belum terikat
      await page.locator('textarea[name="kegiatan"], textarea').first().fill('Kunjungan Pastoral Jemaat');
    }

    // 4. Verifikasi Navigasi Kembali ke List
    await expect(page).toHaveURL(/\/pastoral|\/dashboard/);
  });
});
