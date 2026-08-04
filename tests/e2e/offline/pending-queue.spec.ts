import { test, expect } from '../fixtures';

test.describe('Offline Pending Submissions Queue', () => {
  test('should queue submission when offline and persist payload in localStorage', async ({ authenticatedMobilePage: page, context }) => {
    await page.goto('/dashboard/pastoral/baru');
    await page.waitForLoadState('networkidle');

    // Select scope & chip
    await page.getByTestId('target-scope-jemaat').click();
    const chip = page.getByTestId('chip-kunjungan-jemaat');
    if (await chip.isVisible().catch(() => false)) {
      await chip.click();
    }

    // Fill form fields
    await page.getByTestId('input-catatan').fill('Pelayanan pastoral khusus lokasi terpencil');
    await page.getByTestId('input-catatan').blur();

    // Switch to offline & submit form
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));
    await page.waitForTimeout(300);

    await page.getByTestId('button-submit').click();

    // Verify payload queued in localStorage under si_gpib_pending_submissions
    await expect.poll(async () => {
      const rawQueue = await page.evaluate(() => localStorage.getItem('si_gpib_pending_submissions'));
      if (!rawQueue) return 0;
      try {
        const parsed = JSON.parse(rawQueue);
        return parsed.length;
      } catch {
        return 0;
      }
    }, { timeout: 5000 }).toBeGreaterThan(0);

    // Restore online connection
    await context.setOffline(false);
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
  });
});
