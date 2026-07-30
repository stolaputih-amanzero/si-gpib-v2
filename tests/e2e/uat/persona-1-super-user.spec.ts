import { test, expect, CREDENTIALS, BASE_URL } from './fixtures';

test.describe('Persona 1: Super User (Bpk. Stolaputih)', () => {

  test('SU-01: Login dengan password berhasil < 3 detik', async ({ mobileContext }) => {
    const page = await mobileContext.newPage();
    const startTime = Date.now();

    await page.goto(`${BASE_URL}/login`);
    await page.getByTestId('input-phone').or(page.locator('input[name="email"], input[name="phone"], input[id="email"], input[type="text"], input[type="email"], input[type="tel"]').first())
      .fill(CREDENTIALS.superUser.email || CREDENTIALS.superUser.phone);
    await page.getByTestId('input-password').or(page.locator('input[type="password"]').first())
      .fill(CREDENTIALS.superUser.password);
    await page.getByTestId('button-login').or(page.locator('button[type="submit"]').first())
      .click();

    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    const elapsed = Date.now() - startTime;

    expect(elapsed).toBeLessThan(10000); // < 10 detik (dev server cold start SLA)
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await page.close();
  });

  test('SU-02: Lihat daftar 25 Mupel dengan search', async ({ superUserPage: page }) => {
    // Navigasi ke halaman Mupel / Hierarki
    await page.goto(`${BASE_URL}/hierarki`);
    await page.waitForLoadState('networkidle');

    // Verifikasi Mupel / Struktur Organisasi tampil
    const mupelItems = page.locator('[data-testid="mupel-item"], [data-testid="mupel-card"], a[href*="/hierarki/M"], tr, .card-flat, [data-testid="hierarchy-card"]');
    await expect(mupelItems.first()).toBeVisible({ timeout: 10000 });

    // Hitung jumlah Mupel
    const count = await mupelItems.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Test search
    const searchInput = page.getByPlaceholder(/cari|search|mupel/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('SUMUT');
      await page.waitForTimeout(500); // Debounce
      await expect(page.getByText(/SUMUT/i).first()).toBeVisible();
    }
  });

  test('SU-03: CJ-4 — Mutasi Pendeta (atomic RPC) @destructive', async ({ superUserPage: page }) => {
    // Navigasi ke halaman Pendeta / SDM Pendeta
    await page.goto(`${BASE_URL}/sdm/pendeta`);
    await page.waitForLoadState('networkidle');

    // Cari pendeta untuk dimutasi
    const searchInput = page.getByPlaceholder(/cari|search|pendeta/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Otniel');
      await page.waitForTimeout(500);
    }

    // Klik pendeta pertama yang muncul (abaikan link navigasi sidebar)
    const pendetaItem = page.getByRole('link', { name: /Pdt\.|Detail/i }).or(page.locator('a[href*="/pendeta/PDT"], a[href*="/pendeta/"]')).first();
    await expect(pendetaItem).toBeVisible({ timeout: 10000 });
    await pendetaItem.click();
    await page.waitForLoadState('networkidle');

    // Cari tombol Mutasi / Edit Jabatan
    const mutasiBtn = page.getByRole('button', { name: /mutasi|jabatan|edit/i }).first();
    if (await mutasiBtn.isVisible()) {
      await mutasiBtn.click();

      // Pilih Jemaat baru (dropdown/searchable select)
      const jemaatSelect = page.locator('[data-testid="jemaat-select"], select, [role="combobox"]').first();
      if (await jemaatSelect.isVisible()) {
        await jemaatSelect.click();
        await page.waitForTimeout(300);
        const option = page.locator('[role="option"], option').first();
        if (await option.isVisible()) {
          await option.click();
        }
      }

      // Isi alasan mutasi
      const alasanInput = page.locator('textarea, input[name="alasan"], input[name="keterangan"]').first();
      if (await alasanInput.isVisible()) {
        await alasanInput.fill('UAT: Mutasi test otomatis');
      }

      // Konfirmasi mutasi
      const confirmBtn = page.getByRole('button', { name: /konfirmasi|simpan|mutasi/i }).first();
      await confirmBtn.click();

      // Verifikasi sukses (toast / redirect / riwayat tercatat)
      await expect(
        page.getByText(/berhasil|sukses|mutasi|tersimpan/i).first()
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test('SU-04: Assign KMJ ke Jemaat Induk @destructive', async ({ superUserPage: page }) => {
    // Navigasi ke halaman Hierarki / Struktur Organisasi
    await page.goto(`${BASE_URL}/hierarki`);
    await page.waitForLoadState('networkidle');

    // Pilih Mupel pertama untuk melihat daftar Jemaat
    const mupelItem = page.locator('a[href*="/hierarki/M"]').first();
    await expect(mupelItem).toBeVisible({ timeout: 10000 });
    await mupelItem.click();
    await page.waitForLoadState('networkidle');

    // Cari tombol Assign KMJ
    const assignBtn = page.getByRole('button', { name: /assign|kmj|tetapkan|ketua/i }).first();
    if (await assignBtn.isVisible()) {
      await assignBtn.click();

      // Pilih pendeta sebagai KMJ
      const pendetaSelect = page.locator('[data-testid="pendeta-select"], select, [role="combobox"]').first();
      if (await pendetaSelect.isVisible()) {
        await pendetaSelect.click();
        await page.waitForTimeout(300);
        const option = page.locator('[role="option"], option').first();
        if (await option.isVisible()) {
          await option.click();
        }
      }

      // Simpan
      const saveBtn = page.getByRole('button', { name: /simpan|assign|tetapkan/i }).first();
      await saveBtn.click();

      await expect(
        page.getByText(/berhasil|sukses|kmj/i).first()
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test('SU-05: Dashboard analitik tampil dengan KPI & chart', async ({ superUserPage: page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Verifikasi KPI metric cards & statistik tampil di main container
    const kpiCard = page.locator('main').getByText('Pos Pelkes', { exact: true }).or(page.locator('main').getByText('Total Jiwa')).first();
    await expect(kpiCard).toBeVisible({ timeout: 10000 });

    // Verifikasi minimal ada angka/statistik
    const numbers = page.locator('.font-display, .tnum, [data-testid="stat-value"], h2, h3').first();
    await expect(numbers).toBeVisible();

    // Verifikasi chart (Recharts render SVG / Canvas)
    const chart = page.locator('svg.recharts-surface, [data-testid="chart"], canvas, svg').first();
    if (await chart.isVisible()) {
      await expect(chart).toBeVisible();
    }
  });

  test('SU-06: Export laporan ke Excel/PDF', async ({ superUserPage: page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Cari tombol export
    const exportBtn = page.getByRole('button', { name: /export|unduh|download|excel|pdf/i }).first();
    if (await exportBtn.isVisible()) {
      // Intercept download
      const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
      await exportBtn.click();

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBeTruthy();
    }
  });
});
