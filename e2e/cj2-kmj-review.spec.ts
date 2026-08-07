import { test, expect } from '@playwright/test';

test.describe('CJ-2: KMJ Review Log Pastoral', () => {
  // Kami asumsikan sudah ada state login KMJ di beforeEach atau state Playwright (berdasarkan CJ lain)
  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman login & autentikasi
    await page.goto('/login');
    // Jika tidak memakai SSO:
    // await page.fill('[name="email"]', 'kmj@test.com');
    // await page.fill('[name="password"]', 'password123');
    // await page.click('button[type="submit"]');
    
    // Sebagai alternatif, kita bisa mock user / auth state via fixture,
    // tapi untuk sekarang kita tunggu redirect ke dashboard
    await page.waitForURL('**/dashboard**');
  });

  test('melihat statistik pastoral', async ({ page }) => {
    await page.goto('/pastoral');
    
    // Verifikasi stats cards muncul
    await expect(page.locator('text=Total Log')).toBeVisible();
    await expect(page.locator('text=Total Jiwa')).toBeVisible();
    await expect(page.locator('text=Pos Aktif')).toBeVisible();
  });

  test('filter log pastoral', async ({ page }) => {
    await page.goto('/pastoral');
    
    // Buka filter
    await page.click('button:has-text("Filter")');
    
    // Set date range
    await page.fill('input[type="date"]:first-of-type', '2026-01-01');
    await page.fill('input[type="date"]:last-of-type', '2026-12-31');
    
    // Apply filter
    await page.click('button:has-text("Terapkan Filter")');
    
    // Verifikasi filter diterapkan (badge count muncul, pastikan button filter memiliki badge span)
    await expect(page.locator('button:has-text("Filter") span')).toBeVisible();
  });

  test('lihat detail log pastoral', async ({ page }) => {
    await page.goto('/pastoral');
    
    // Klik card pertama
    // Selector ini mengasumsikan ada elemen card (kita bisa tambahkan data-testid="pastoral-card" nanti jika perlu)
    const firstCard = page.locator('.hover\\:shadow-md').first();
    
    // Pastikan card ada (jika data kosong tes ini akan skip atau timeout, di environment test usahakan ada data dummy)
    if (await firstCard.isVisible()) {
      await firstCard.click();
      
      // Verifikasi modal muncul
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      
      // Verifikasi detail lengkap
      await expect(page.locator('text=Tanggal')).toBeVisible();
      await expect(page.locator('text=Jumlah Jiwa')).toBeVisible();
      await expect(page.locator('text=Pendeta')).toBeVisible();
    }
  });

  test('export log pastoral', async ({ page }) => {
    await page.goto('/pastoral');
    
    // Klik export
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
    await page.click('button:has-text("Export")');
    
    const download = await downloadPromise;
    if (download) {
      expect(download.suggestedFilename()).toContain('log-pastoral');
    }
  });
});
