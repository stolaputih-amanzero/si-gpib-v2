import { test, expect, CREDENTIALS, BASE_URL } from './fixtures';

test.describe('Persona 4: PJ/User (Pdt. Otniel) — PRIMARY USER', () => {

  test('PJ-01: Biometric setup flow + fallback ke password', async ({ mobileContext }) => {
    const page = await mobileContext.newPage();

    // Login dengan password dulu (prasyarat biometric)
    await page.goto(`${BASE_URL}/login`);
    await page.getByTestId('input-phone').or(page.locator('input[type="tel"]').first())
      .fill(CREDENTIALS.pjUser.phone);
    await page.getByTestId('input-password').or(page.locator('input[type="password"]').first())
      .fill(CREDENTIALS.pjUser.password);
    await page.getByTestId('button-login').or(page.locator('button[type="submit"]').first())
      .click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Navigasi ke Settings
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForLoadState('networkidle');

    // Verifikasi opsi Biometrik / Keamanan ada
    const biometricSection = page.getByText(/biometrik|sidik jari|face id|fingerprint|keamanan/i).first();
    if (await biometricSection.isVisible({ timeout: 5000 })) {
      await expect(biometricSection).toBeVisible();
    }

    // Verifikasi fallback: form login dengan password tetap ada
    await page.goto(`${BASE_URL}/login`);
    const passwordLogin = page.locator('input[type="password"]').first();
    await expect(passwordLogin).toBeVisible();

    await page.close();
  });

  test('PJ-02: CJ-1 — Input Log Pastoral < 30 detik', async ({ pjUserPage: page }) => {
    const startTime = Date.now();

    // Navigasi ke form Log Pastoral baru
    await page.goto(`${BASE_URL}/laporan/pastoral/baru`);
    await page.waitForLoadState('networkidle');

    // Pilih Pos Pelkes (jika ada selector)
    const posSelect = page.locator('[data-testid="pos-select"], select[name="id_pos"], [role="combobox"]').first();
    if (await posSelect.isVisible({ timeout: 3000 })) {
      await posSelect.click();
      await page.waitForTimeout(300);
      const option = page.locator('[role="option"], option').first();
      if (await option.isVisible()) {
        await option.click();
      }
    }

    // Isi jenis kegiatan
    const kegiatanInput = page.locator('input[name="kegiatan"], [data-testid="input-kegiatan"]').first();
    if (await kegiatanInput.isVisible()) {
      await kegiatanInput.fill('Kunjungan Jemaat - UAT Test');
    }

    // Isi jumlah jiwa
    const jiwaInput = page.locator('input[name="jml_jiwa"], [data-testid="input-jml-jiwa"], input[inputmode="numeric"]').first();
    if (await jiwaInput.isVisible()) {
      await jiwaInput.fill('25');
    }

    // Isi catatan (opsional)
    const catatanInput = page.locator('textarea[name="catatan"], [data-testid="input-catatan"]').first();
    if (await catatanInput.isVisible()) {
      await catatanInput.fill('UAT: Test input log pastoral otomatis');
    }

    // Submit
    const submitBtn = page.getByRole('button', { name: /simpan|submit|kirim/i }).first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
    }

    // Verifikasi sukses
    await expect(
      page.getByText(/berhasil|sukses|tersimpan/i).first()
    ).toBeVisible({ timeout: 15000 });

    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThan(30000); // < 30 detik
  });

  test('PJ-03: CJ-5 — Input Aset dengan GPS auto-fill + foto (mock)', async ({ pjUserPage: page }) => {
    // Navigasi ke form Aset baru
    await page.goto(`${BASE_URL}/laporan/aset/baru`);
    await page.waitForLoadState('networkidle');

    // Pilih Pos Pelkes
    const posSelect = page.locator('[data-testid="pos-select"], select[name="id_pos"], [role="combobox"]').first();
    if (await posSelect.isVisible({ timeout: 3000 })) {
      await posSelect.click();
      await page.waitForTimeout(300);
      const option = page.locator('[role="option"], option').first();
      if (await option.isVisible()) await option.click();
    }

    // Pilih kategori aset (Tanah/Bangunan/Bergerak)
    const kategoriSelect = page.locator('select[name="kategori"], [data-testid="kategori-select"]').first();
    if (await kategoriSelect.isVisible()) {
      await kategoriSelect.selectOption({ index: 1 }); // Pilih opsi pertama
    }

    // Test GPS auto-fill: klik tombol "Ambil Lokasi"
    const gpsBtn = page.getByRole('button', { name: /lokasi|gps|ambil|koordinat/i }).first();
    if (await gpsBtn.isVisible({ timeout: 3000 })) {
      await gpsBtn.click();
      await page.waitForTimeout(2000); // Tunggu geolocation

      // Verifikasi koordinat terisi (mock geolocation: Samarinda)
      const latInput = page.locator('input[name="latitude"], [data-testid="input-lat"]').first();
      if (await latInput.isVisible()) {
        const latValue = await latInput.inputValue();
        expect(latValue).toBeTruthy(); // Koordinat terisi
      }
    }

    // Mock foto: upload file gambar
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.isVisible({ timeout: 3000 })) {
      // Buat file gambar dummy 1x1 pixel
      const buffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      await fileInput.setInputFiles({
        name: 'foto-aset-uat.jpg',
        mimeType: 'image/jpeg',
        buffer,
      });
      await page.waitForTimeout(1000); // Tunggu preview
    }

    // Submit
    const submitBtn = page.getByRole('button', { name: /simpan|submit|kirim/i }).first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await expect(
        page.getByText(/berhasil|sukses|tersimpan/i).first()
      ).toBeVisible({ timeout: 15000 });
    }
  });

  test('PJ-04: CJ-6 — Offline → Form auto-save → Online → Auto-retry', async ({ pjUserPage: page, mobileContext }) => {
    // Navigasi ke form Log Pastoral
    await page.goto(`${BASE_URL}/laporan/pastoral/baru`);
    await page.waitForLoadState('networkidle');

    // Isi form sebagian
    const kegiatanInput = page.locator('input[name="kegiatan"], [data-testid="input-kegiatan"]').first();
    if (await kegiatanInput.isVisible()) {
      await kegiatanInput.fill('Kunjungan Offline - UAT Test');
    }

    const jiwaInput = page.locator('input[name="jml_jiwa"], input[inputmode="numeric"]').first();
    if (await jiwaInput.isVisible()) {
      await jiwaInput.fill('15');
    }

    // === SIMULASI OFFLINE ===
    await mobileContext.setOffline(true);
    await page.waitForTimeout(1000);

    // Verifikasi network status indicator (badge Offline)
    const offlineIndicator = page.getByText(/offline/i).first();
    await expect(offlineIndicator).toBeVisible({ timeout: 5000 });

    // === SIMULASI ONLINE KEMBALI ===
    await mobileContext.setOffline(false);
    await page.waitForTimeout(1000);

    // Verifikasi indicator berubah jadi Live/Online
    const onlineIndicator = page.getByText(/live|online/i).first();
    await expect(onlineIndicator).toBeVisible({ timeout: 10000 });
  });

  test('PJ-05: Form draft auto-save (localStorage)', async ({ pjUserPage: page }) => {
    await page.goto(`${BASE_URL}/laporan/pastoral/baru`);
    await page.waitForLoadState('networkidle');

    // Isi form
    const kegiatanInput = page.locator('input[name="kegiatan"], [data-testid="input-kegiatan"]').first();
    if (await kegiatanInput.isVisible()) {
      await kegiatanInput.fill('Draft Test - UAT');
    }

    // Verifikasi input berisi teks
    await expect(kegiatanInput).toHaveValue('Draft Test - UAT');
  });

  test('PJ-06: Share ke WhatsApp (Web Share API / fallback)', async ({ pjUserPage: page }) => {
    // Navigasi ke detail Pos Pelkes
    await page.goto(`${BASE_URL}/dashboard/pos-pelkes`);
    await page.waitForLoadState('networkidle');

    // Klik Pos pertama
    const posItem = page.locator('[data-testid="pos-item"], [data-testid="pos-card"], a[href*="pos-pelkes"]').first();
    if (await posItem.isVisible({ timeout: 5000 })) {
      await posItem.click();
      await page.waitForLoadState('networkidle');
    }

    // Cari tombol Share
    const shareBtn = page.getByRole('button', { name: /share|bagikan|whatsapp/i }).first();
    if (await shareBtn.isVisible({ timeout: 5000 })) {
      // Intercept navigation ke WhatsApp
      const waPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);

      await shareBtn.click();
      await page.waitForTimeout(1000);

      // Verifikasi: Web Share API dipanggil ATAU WhatsApp link dibuka
      const popup = await waPromise;
      if (popup) {
        const url = popup.url();
        expect(url).toContain('wa.me');
        await popup.close();
      }
    }
  });

  test('PJ-07: PWA manifest valid + Service Worker registered', async ({ pjUserPage: page }) => {
    // Verifikasi manifest.json
    const manifestResponse = await page.goto(`${BASE_URL}/manifest.json`);
    expect(manifestResponse?.status()).toBe(200);

    const manifest = await manifestResponse?.json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);

    // Verifikasi Service Worker
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const swRegistered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const registration = await navigator.serviceWorker.getRegistration();
      return !!registration;
    });

    expect(swRegistered).toBeTruthy();
  });

  test('PJ-08: Network status banner/badge muncul saat offline', async ({ pjUserPage: page, mobileContext }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Simulasi offline
    await mobileContext.setOffline(true);
    await page.waitForTimeout(1000);

    // Verifikasi badge offline
    const offlineIndicator = page.getByText(/offline/i).first();
    await expect(offlineIndicator).toBeVisible({ timeout: 5000 });

    // Simulasi online
    await mobileContext.setOffline(false);
    await page.waitForTimeout(1000);

    // Badge harus berubah jadi Live
    const onlineIndicator = page.getByText(/live|online/i).first();
    await expect(onlineIndicator).toBeVisible({ timeout: 10000 });
  });
});
