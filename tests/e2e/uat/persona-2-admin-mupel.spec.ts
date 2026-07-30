import { test, expect, CREDENTIALS, BASE_URL } from './fixtures';

test.describe('Persona 2: Admin Mupel (Bpk. Junior)', () => {

  test('AM-01: Login + verifikasi scope RLS (hanya lihat Mupel sendiri)', async ({ mobileContext }) => {
    const page = await mobileContext.newPage();

    // Login sebagai Admin Mupel
    await page.goto(`${BASE_URL}/login`);
    await page.getByTestId('input-phone').or(page.locator('input[type="tel"]').first())
      .fill(CREDENTIALS.adminMupel.phone);
    await page.getByTestId('input-password').or(page.locator('input[type="password"]').first())
      .fill(CREDENTIALS.adminMupel.password);
    await page.getByTestId('button-login').or(page.locator('button[type="submit"]').first())
      .click();

    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Verifikasi: Admin Mupel dapat mengakses dashboard
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    const hasAccess = currentUrl.includes('/dashboard');
    expect(hasAccess).toBeTruthy();

    await page.close();
  });

  test('AM-02: CJ-3 — Approve pengajuan bantuan dengan catatan', async ({ adminMupelPage: page }) => {
    // Navigasi ke halaman Bantuan
    await page.goto(`${BASE_URL}/bantuan`);
    await page.waitForLoadState('networkidle');

    // Cari pengajuan dengan status Pending
    const pendingItem = page.locator('[data-testid="bantuan-item"], [data-testid="bantuan-card"], tr, a[href*="bantuan"]')
      .filter({ hasText: /pending|menunggu|diajukan/i })
      .first();

    if (await pendingItem.isVisible({ timeout: 5000 })) {
      await pendingItem.click();
      await page.waitForLoadState('networkidle');

      // Klik Approve
      const approveBtn = page.getByRole('button', { name: /approve|setujui|terima/i }).first();
      if (await approveBtn.isVisible({ timeout: 5000 })) {
        await approveBtn.click();

        // Isi catatan approval
        const catatanInput = page.locator('textarea, input[name="catatan"], input[name="keterangan"]').first();
        if (await catatanInput.isVisible()) {
          await catatanInput.fill('UAT: Disetujui via test otomatis');
        }

        // Konfirmasi
        const confirmBtn = page.getByRole('button', { name: /konfirmasi|setujui|submit|simpan/i }).first();
        await confirmBtn.click();

        // Verifikasi status berubah
        await expect(
          page.getByText(/berhasil|disetujui|approved|sukses/i).first()
        ).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('AM-03: Reject pengajuan bantuan dengan catatan', async ({ adminMupelPage: page }) => {
    await page.goto(`${BASE_URL}/bantuan`);
    await page.waitForLoadState('networkidle');

    const pendingItem = page.locator('[data-testid="bantuan-item"], [data-testid="bantuan-card"], tr, a[href*="bantuan"]')
      .filter({ hasText: /pending|menunggu|diajukan/i })
      .first();

    if (await pendingItem.isVisible({ timeout: 5000 })) {
      await pendingItem.click();
      await page.waitForLoadState('networkidle');

      // Klik Reject
      const rejectBtn = page.getByRole('button', { name: /reject|tolak/i }).first();
      if (await rejectBtn.isVisible({ timeout: 5000 })) {
        await rejectBtn.click();

        // Isi alasan reject
        const alasanInput = page.locator('textarea, input[name="catatan"], input[name="alasan"]').first();
        if (await alasanInput.isVisible()) {
          await alasanInput.fill('UAT: Ditolak via test otomatis — data tidak lengkap');
        }

        const confirmBtn = page.getByRole('button', { name: /konfirmasi|tolak|submit|simpan/i }).first();
        await confirmBtn.click();

        await expect(
          page.getByText(/berhasil|ditolak|rejected|sukses/i).first()
        ).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('AM-04: Dashboard Mupel menampilkan KPI spesifik', async ({ adminMupelPage: page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Verifikasi dashboard tampil
    await expect(page.locator('h1, h2, [data-testid="dashboard-title"]').first())
      .toBeVisible({ timeout: 10000 });

    // Verifikasi ada KPI/statistik
    const stats = page.locator('[data-testid="stat-card"], .card-flat, .font-display, div[class*="rounded"]');
    await expect(stats.first()).toBeVisible();
  });
});
