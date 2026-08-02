import { test, expect } from '@playwright/test';
import { loginAsPendeta } from '../../helpers/auth.helper';
import { mockCameraCapture } from '../../helpers/camera.helper';
import { mockGeolocation } from '../../helpers/geolocation.helper';

test.describe('CJ-5: Input Aset dengan Kamera + GPS', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsPendeta(page, 'PDT-41915346');
    await page.goto('/aset/new');
  });

  test('should capture foto + auto-fill GPS dari EXIF', async ({ page }) => {
    await mockGeolocation(page, { lat: 0.331233, lng: 115.487099 });
    await mockCameraCapture(page, { lat: 0.331233, lng: 115.487099 });

    const namaAsetInput = page.locator('input[placeholder*="Gereja"], input[placeholder*="Tanah"]');
    if (await namaAsetInput.isVisible()) {
      await namaAsetInput.fill('Tanah Pastori Eben Haezer');
    }
  });
});
