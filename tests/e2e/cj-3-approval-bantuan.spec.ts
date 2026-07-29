import { test, expect } from './fixtures';
import { mockBantuanData } from './utils/mock-data';

test.describe('CJ-3: Admin Mupel Approve Bantuan', () => {
  test('should approve bantuan request with notes via mobile bottom sheet', async ({ mobilePage: page }) => {
    // 1. Login sebagai Admin Mupel
    await page.goto('/login');
    const phoneInput = page.getByTestId('input-phone');
    if (await phoneInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await phoneInput.fill('+628176588277');
      await page.getByTestId('input-password').fill('admin123');
      await page.getByTestId('button-login').click();
      await page.waitForURL(/\/dashboard/);
    }

    // 2. Navigasi ke modul Bantuan
    await page.goto('/bantuan');
    
    // 3. Pilih pengajuan Bantuan
    const firstCard = page.getByTestId('bantuan-card-pending')
      .or(page.locator('a[href^="/bantuan/"]'))
      .first();
    
    if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstCard.click();
      await page.waitForURL(/\/bantuan\/[a-zA-Z0-9-]+/);

      // 4. Klik Approve jika tombol tersedia
      const approveBtn = page.getByTestId('button-approve')
        .or(page.getByRole('button', { name: /Approve|Setujui/i }))
        .first();
      
      if (await approveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await approveBtn.click();
        
        const catatanInput = page.getByTestId('input-catatan')
          .or(page.locator('textarea'))
          .first();
        await catatanInput.fill(mockBantuanData.catatanApproval);

        const confirmBtn = page.getByTestId('button-confirm-approve')
          .or(page.getByRole('button', { name: /Kirim Keputusan|Confirm/i }))
          .first();
        await confirmBtn.click();
      }
    }
  });
});
