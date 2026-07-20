import { test, expect } from '@playwright/test';

test.describe('CJ-6: Offline Network Simulation & Auto-Drafting', () => {
  test('Form draft tersimpan saat offline dan dapat dipulihkan saat online', async ({ page, context }) => {
    // 1. Akses Halaman Input Log Pastoral
    await page.goto('/dashboard/pastoral/baru');

    // 2. Isi sebagian form
    const kegiatanTextarea = page.locator('textarea[name="kegiatan"], textarea').first();
    await kegiatanTextarea.fill('Drafting kegiatan pastoral saat jaringan tidak stabil');

    // 3. Simulasi Offline (Network Disconnected)
    await context.setOffline(true);

    // 4. Verifikasi bahwa data tersimpan di LocalStorage
    const draftContent = await page.evaluate(() => localStorage.getItem('draft:log-pastoral'));
    expect(draftContent).toBeTruthy();
    expect(draftContent).toContain('Drafting kegiatan pastoral');

    // 5. Simulasi Online Kembali (Network Reconnected)
    await context.setOffline(false);

    // 6. Reload halaman & pastikan draft terisi kembali
    await page.reload();
    await expect(kegiatanTextarea).toHaveValue(/Drafting kegiatan pastoral/);
  });
});
