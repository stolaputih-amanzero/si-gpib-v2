import { test, expect } from '../fixtures';

test.describe('Offline Fallback Page', () => {
  test('should render offline fallback page correctly with retry and navigation buttons', async ({ authenticatedMobilePage: page }) => {
    await page.goto('/offline');

    // Verify offline icon & title
    await expect(page.getByTestId('offline-page-icon')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Anda Sedang Offline/i })).toBeVisible();

    // Verify action buttons
    const retryBtn = page.getByTestId('button-retry-connection');
    await expect(retryBtn).toBeVisible();
    await expect(retryBtn).toContainText('Cek Koneksi Ulang');

    const dashboardBtn = page.getByTestId('button-dashboard');
    await expect(dashboardBtn).toBeVisible();

    // Verify security/reassurance notice
    await expect(page.getByText('Jaminan Keamanan Data Lapangan')).toBeVisible();
  });

  test('dashboard button on offline page navigates to /dashboard', async ({ authenticatedMobilePage: page }) => {
    await page.goto('/offline');

    const dashboardBtn = page.getByTestId('button-dashboard');
    await dashboardBtn.click();

    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    expect(page.url()).toContain('/dashboard');
  });
});
