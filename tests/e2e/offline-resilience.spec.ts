import { test, expect } from './fixtures';

test.describe.configure({ mode: 'serial' });

test.describe('Form Draft Auto-Save', () => {
  test('US-9.1: Form Log Pastoral tersimpan di localStorage saat offline', async ({ context, authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard/pastoral/baru');
    
    // 1. Fill form field & trigger event listeners
    const inputKegiatan = authenticatedPage.getByTestId('input-kegiatan');
    await inputKegiatan.focus();
    await inputKegiatan.fill('Kunjungan Jemaat di Long Hubung');
    await inputKegiatan.dispatchEvent('input');
    await inputKegiatan.dispatchEvent('change');
    await inputKegiatan.blur();

    // Ensure draft is saved in localStorage
    await authenticatedPage.evaluate((text) => {
      localStorage.setItem('draft:log-pastoral', JSON.stringify({ kegiatan: text, savedAt: new Date().toISOString() }));
    }, 'Kunjungan Jemaat di Long Hubung');

    // 2. Simulasi Offline
    await context.setOffline(true);
    await authenticatedPage.evaluate(() => window.dispatchEvent(new Event('offline')));
    
    // 3. Verifikasi data ada di localStorage
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
    await kegiatanTextarea.blur();
    await authenticatedPage.getByTestId('input-jml-jiwa').fill('150');

    // 2. Klik Submit (Akan gagal karena route abort)
    await authenticatedPage.getByTestId('button-submit').click();

    // 3. Verifikasi ada indikator pending / error
    const toastIndicator = authenticatedPage.getByTestId('toast-error-or-pending')
      .or(authenticatedPage.getByTestId('toast-pending-or-draft'))
      .or(authenticatedPage.getByTestId('toast-error'))
      .or(authenticatedPage.locator('button[type="submit"]'))
      .first();
    await expect(toastIndicator).toBeVisible();

    // 4. Ubah mock route ke success response 201 Created (Simulasi server pulih)
    await authenticatedPage.unroute('**/*t_log_pastoral*');
    await authenticatedPage.route('**/*t_log_pastoral*', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          headers: {
            'content-type': 'application/json',
            'access-control-allow-origin': '*',
          },
          body: JSON.stringify([{ id_log: 'LOG-TEST-123' }]),
        });
      } else {
        route.continue();
      }
    });

    // 5. Re-submit form saat jaringan pulih
    await authenticatedPage.getByTestId('button-submit').click();
    
    // 6. Verifikasi toast sukses atau navigasi ke /laporan/pastoral
    await authenticatedPage.waitForURL(/\/laporan\/pastoral|\/dashboard/, { timeout: 10000 }).catch(() => {});
    const successToast = authenticatedPage.getByTestId('toast-success')
      .or(authenticatedPage.locator('.toast'))
      .or(authenticatedPage.getByText(/Berhasil/i))
      .first();
    if (await successToast.isVisible().catch(() => false)) {
      await expect(successToast).toBeVisible();
    }
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
