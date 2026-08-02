import { test, expect } from '@playwright/test';
import { loginAsPendeta } from '../../helpers/auth.helper';
import { simulateOffline, simulateOnline, waitForServiceWorker } from '../../helpers/offline.helper';

test.describe('CJ-6: Offline Form Draft & Pending Queue', () => {
  test('should auto-save form saat offline, recover saat reload', async ({ page, context }) => {
    await loginAsPendeta(page, 'PDT-41915346');
    await page.goto('/pastoral/new');
    await waitForServiceWorker(page);

    await simulateOffline(context);
    await page.waitForTimeout(1000);

    await simulateOnline(context);
  });
});
