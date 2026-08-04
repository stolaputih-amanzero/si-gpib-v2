import { test, expect } from '../fixtures';

test.describe('Offline Network Status Banner', () => {
  test('should display offline banner when network connection is lost', async ({ authenticatedMobilePage: page, context }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Initially online, banner should not be visible
    await expect(page.getByTestId('network-banner-offline')).not.toBeVisible();

    // Trigger offline mode
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));

    // Offline banner must become visible
    const banner = page.getByTestId('network-banner-offline');
    await expect(banner).toBeVisible({ timeout: 5000 });
    await expect(banner).toContainText('Mode Offline');

    // Trigger online mode again
    await context.setOffline(false);
    await page.evaluate(() => window.dispatchEvent(new Event('online')));

    // Banner should hide when online with 0 pending submissions
    await expect(page.getByTestId('network-banner-offline')).not.toBeVisible({ timeout: 5000 });
  });

  test('should allow user to dismiss offline banner', async ({ authenticatedMobilePage: page, context }) => {
    await page.goto('/dashboard');

    // Set offline
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));

    const banner = page.getByTestId('network-banner-offline');
    await expect(banner).toBeVisible();

    // Click dismiss button
    const closeBtn = banner.locator('button[aria-label="Tutup Banner"]');
    await closeBtn.click();

    // Banner should be hidden after dismiss
    await expect(banner).not.toBeVisible();

    // Restore online
    await context.setOffline(false);
  });
});
