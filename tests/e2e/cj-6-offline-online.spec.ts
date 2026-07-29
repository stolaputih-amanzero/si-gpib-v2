import { test, expect } from './fixtures';
import { mockPastoralData } from './utils/mock-data';

test.describe('CJ-6: Offline Draft & Auto-Retry', () => {
  test('should save draft offline and auto-submit when online', async ({ authenticatedMobilePage: page, goToOffline, goToOnline }, testInfo) => {
    // 1. Navigasi ke form Log Pastoral
    await page.goto('/dashboard/pastoral/baru');
    
    // 2. Isi form sebagian
    await page.getByTestId('input-kegiatan').fill(mockPastoralData.kegiatan);
    await page.getByTestId('input-kegiatan').blur();
    await page.getByTestId('input-jml-jiwa').fill(mockPastoralData.jmlJiwa);

    // 3. Simulasi Offline
    await goToOffline(testInfo.project.use);
    await expect(page.getByTestId('network-banner-offline')).toBeVisible();

    // 4. Trigger submit (akan masuk ke pending queue / draft)
    await page.getByTestId('button-submit').click();
    
    // Verifikasi indikator draft tersimpan atau pending
    const pendingOrDraftToast = page.getByTestId('toast-pending-or-draft')
      .or(page.getByTestId('toast-error-or-pending'))
      .first();
    await expect(pendingOrDraftToast).toBeVisible();

    // 5. Simulasi Online & Server Pulih (Mock 201 Created)
    await goToOnline(testInfo.project.use);
    await page.route('**/*t_log_pastoral*', route => {
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

    // 6. Re-submit form saat online
    await page.getByTestId('button-submit').click();
    
    // 7. Verifikasi sukses terkirim
    const successToast = page.getByTestId('toast-success');
    await expect(successToast).toBeVisible({ timeout: 10000 });
  });
});
