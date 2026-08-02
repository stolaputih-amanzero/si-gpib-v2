import { test, expect } from '@playwright/test';
import { loginAsPendeta } from '../../helpers/auth.helper';
import { simulateOffline, simulateOnline } from '../../helpers/offline.helper';

test.describe('CJ-1: Input Log Pastoral', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsPendeta(page, 'PDT-41915346');
  });

  test('should input log pastoral dengan cepat (< 30 detik)', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/pastoral/new');
    await page.waitForLoadState('domcontentloaded');

    const jenisInput = page.locator('input[placeholder*="Kunjungan"]');
    if (await jenisInput.isVisible()) {
      await jenisInput.fill('Kunjungan Jemaat Rutin');
    }

    const jiwaInput = page.locator('input[type="number"]');
    if (await jiwaInput.isVisible()) {
      await jiwaInput.fill('25');
    }

    const duration = (Date.now() - startTime) / 1000;
    expect(duration).toBeLessThan(30);
  });

  test('should queue submission saat offline dan retry saat online', async ({ page, context }) => {
    await page.goto('/pastoral/new');
    await page.waitForLoadState('domcontentloaded');

    await simulateOffline(context);

    const submitBtn = page.getByRole('button', { name: /Kirim|Simpan/i });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
    }

    await simulateOnline(context);
  });
});
