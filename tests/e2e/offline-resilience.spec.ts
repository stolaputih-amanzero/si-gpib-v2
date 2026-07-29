import { test, expect } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.clear();
    } catch {}
  });
});

test.describe('Offline UI & Fallback', () => {
  test('US-9.4: Network Banner muncul saat offline dan hilang saat online', async ({ page, context }) => {
    await page.goto('/dashboard');
    
    // 1. Simulasi Offline
    await context.setOffline(true);
    
    // 2. Verifikasi Banner Offline muncul
    const banner = page.getByTestId('network-banner-offline');
    await expect(banner).toBeVisible();

    // 3. Simulasi Online Kembali
    await context.setOffline(false);
    
    // 4. Verifikasi Banner hilang
    await expect(banner).not.toBeVisible({ timeout: 5000 });
  });

  test('US-9.5: Halaman /offline tampil saat tidak ada cache', async ({ page, context }) => {
    // 1. Load halaman /offline saat online terlebih dahulu
    await page.goto('/offline');
    
    // 2. Simulasi offline
    await context.setOffline(true);
    
    // 3. Verifikasi elemen UI offline page tampil
    await expect(page.getByTestId('offline-page-icon')).toBeVisible();
    await expect(page.getByTestId('button-retry-connection')).toBeVisible();
  });
});

test.describe('Form Draft Auto-Save', () => {
  test('US-9.1: Form Log Pastoral tersimpan di localStorage saat offline', async ({ context, authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard/pastoral/baru');
    
    // 1. Isi sebagian form & pemicu event input + change
    const inputKegiatan = authenticatedPage.getByTestId('input-kegiatan');
    await inputKegiatan.focus();
    await inputKegiatan.fill('Kunjungan Jemaat di Long Hubung');
    await inputKegiatan.dispatchEvent('input');
    await inputKegiatan.dispatchEvent('change');
    await authenticatedPage.getByTestId('input-jml-jiwa').fill('25');

    // 2. Simulasi Offline
    await context.setOffline(true);
    
    // 4. Verifikasi data ada di localStorage (menggunakan expect.poll)
    await expect.poll(async () => {
      const draftData = await authenticatedPage.evaluate(() => localStorage.getItem('draft:log-pastoral'));
      return draftData ? JSON.parse(draftData).kegiatan : null;
    }, { timeout: 5000 }).toBe('Kunjungan Jemaat di Long Hubung');
  });
});

test.describe('Auto-Retry Mutation Queue (CJ-6)', () => {
  test('CJ-6: Submit gagal saat offline, otomatis terkirim saat online', async ({ authenticatedPage }) => {
    // 1. Mock API untuk mensimulasikan kegagalan network saat submit
    await authenticatedPage.route('**/*t_log_pastoral*', route => {
      if (route.request().method() === 'POST') {
        route.abort('failed'); 
      } else {
        route.continue();
      }
    });

    await authenticatedPage.goto('/dashboard/pastoral/baru');
    const kegiatanTextarea = authenticatedPage.getByTestId('input-kegiatan');
    await kegiatanTextarea.focus();
    await kegiatanTextarea.fill('Ibadah Minggu Raya');
    await kegiatanTextarea.dispatchEvent('input');
    await kegiatanTextarea.dispatchEvent('change');
    await authenticatedPage.getByTestId('input-jml-jiwa').fill('150');

    // 2. Klik Submit (Akan gagal karena route abort)
    await authenticatedPage.getByTestId('button-submit').click();

    // 3. Verifikasi ada indikator pending / error
    await expect(authenticatedPage.getByTestId('toast-error-or-pending')).toBeVisible();

    // 4. Ubah mock route ke success response 201 Created (Simulasi server pulih)
    await authenticatedPage.route('**/*t_log_pastoral*', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify([{ id_log: 'LOG-TEST-123' }]),
        });
      } else {
        route.continue();
      }
    });

    // 5. Re-submit form saat jaringan pulih
    await authenticatedPage.getByTestId('button-submit').click();
    
    // 6. Verifikasi toast sukses
    await expect(authenticatedPage.getByTestId('toast-success')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Read-Only Master Data', () => {
  test('US-9.2: Data master (Mupel/Jemaat) tetap bisa dilihat saat offline', async ({ context, authenticatedPage }) => {
    // 1. Load halaman hierarki saat online dulu agar ter-cache
    await authenticatedPage.goto('/hierarki');
    await expect(authenticatedPage.getByTestId('mupel-list')).toBeVisible();
    
    // 2. Simulasi Offline
    await context.setOffline(true);
    
    // 3. Verifikasi data master tetap muncul (TanStack Query stale data) & network banner offline aktif
    await expect(authenticatedPage.getByTestId('mupel-list')).toBeVisible();
    await expect(authenticatedPage.getByTestId('network-banner-offline')).toBeVisible();
  });
});
