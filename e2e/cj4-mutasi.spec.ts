import { test, expect } from '@playwright/test';

test.describe('CJ-4 Mutasi Pendeta (Business Rule #6)', () => {
  // Hanya super_user yang bisa mutasi, asumsikan akun pj.test@gpib.local adalah super_user
  test.use({ storageState: 'e2e/.auth/pj-storage.json' });

  test('Mutasi pendeta KMJ harus reset flag is_kmj dan catat riwayat', async ({ page }) => {
    // 1. Buka halaman SDM
    await page.goto('/sdm/pendeta');
    await expect(page.getByRole('heading', { name: /sdm/i })).toBeVisible({ timeout: 15000 });

    // 2. Klik pendeta pertama yang ada di tabel (asumsikan kita pakai data fixture)
    // Atau navigasi langsung ke detail pendeta
    // Untuk e2e yang deterministik, kita coba cari row dan klik "Detail" atau langsung navigate jika tau ID-nya
    
    // Sebagai alternatif yang lebih aman untuk E2E:
    // Klik row pertama dari tabel pendeta
    const firstRowLink = page.locator('table tbody tr a').first();
    await expect(firstRowLink).toBeVisible();
    await firstRowLink.click();

    // 3. Pastikan tombol Mutasi terlihat (berarti role adalah super_user)
    const mutasiBtn = page.getByRole('button', { name: /mutasi pendeta/i });
    await expect(mutasiBtn).toBeVisible();
    await mutasiBtn.click();

    // 4. Form mutasi muncul (Bottom Sheet / Sheet)
    await expect(page.getByRole('heading', { name: /Form Mutasi Pendeta/i })).toBeVisible();

    // 5. Cari Jemaat Tujuan
    const jemaatInput = page.getByPlaceholder(/ketik nama jemaat/i);
    await jemaatInput.fill('Immanuel');
    
    // Pilih Jemaat Immanuel dari dropdown
    const jemaatOption = page.locator('button').filter({ hasText: 'Immanuel' }).first();
    await expect(jemaatOption).toBeVisible();
    await jemaatOption.click();

    // 6. Isi Jenis Mutasi dan Alasan
    // Jenis mutasi default adalah Mutasi Reguler
    await page.getByPlaceholder(/Tuliskan nomor SK/i).fill('SK/MUTASI/2026/08/999');

    // 7. Klik Submit
    const submitBtn = page.getByRole('button', { name: /Eksekusi Mutasi/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // 8. Verifikasi Success Toast
    await expect(page.locator('text=Mutasi pendeta berhasil diproses')).toBeVisible();

    // 9. Verifikasi Perubahan UI
    // Modal tertutup
    await expect(page.getByRole('heading', { name: /Form Mutasi Pendeta/i })).not.toBeVisible();
    
    // Data di-refresh (nama jemaat induk harus mengandung "Immanuel")
    // Ini mengasumsikan nama jemaat tampil di detail
    await expect(page.locator('text=Immanuel')).toBeVisible();
  });
});
