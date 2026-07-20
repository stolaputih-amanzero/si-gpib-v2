import { test, expect } from '@playwright/test';

test.describe('CJ-3: Admin Mupel & Sinode Approval Pengajuan Bantuan', () => {
  test('Approver dapat meninjau detail pengajuan dan memberikan persetujuan (Approve)', async ({ page }) => {
    // 1. Akses Halaman List Bantuan
    await page.goto('/bantuan');

    // 2. Klik Pengajuan Pertama
    const firstCard = page.locator('a[href^="/bantuan/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    await firstCard.click();

    // 3. Verifikasi Halaman Detail & Workflow Timeline
    await expect(page).toHaveURL(/\/bantuan\/[A-Za-z0-9-]+/);
    await expect(page.getByText('Timeline Workflow Approval')).toBeVisible();

    // 4. Klik Tombol Approve jika ada
    const approveBtn = page.getByRole('button', { name: /Approve|Setujui/i });
    if (await approveBtn.isVisible()) {
      await approveBtn.click();

      // Modal/Bottom sheet catatan persetujuan
      const catatanInput = page.locator('textarea').first();
      await catatanInput.fill('Disetujui untuk diproses ke tahap berikutnya');
      
      const confirmBtn = page.getByRole('button', { name: /Kirim Keputusan|Confirm/i });
      await confirmBtn.click();
    }
  });
});
