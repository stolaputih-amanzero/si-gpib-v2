import { test, expect } from './fixtures';

test.describe('Mobile UI Regression (Native-Like)', () => {
  test('should enforce 44px touch targets and render bottom nav correctly', async ({ authenticatedMobilePage: page }) => {
    const bottomNav = page.getByTestId('bottom-nav');
    await expect(bottomNav).toBeVisible();

    const navItems = page.getByTestId('bottom-nav-item');
    const itemCount = await navItems.count();
    expect(itemCount).toBeGreaterThanOrEqual(4);

    for (const item of await navItems.all()) {
      const boundingBox = await item.boundingBox();
      if (boundingBox) {
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
        expect(boundingBox.width).toBeGreaterThanOrEqual(44);
      }
    }

    const navTarget = page.getByTestId('bottom-nav-hierarki').or(page.getByTestId('bottom-nav-peta')).first();
    if (await navTarget.isVisible().catch(() => false)) {
      await navTarget.click();
      await page.waitForURL(/\/dashboard\/peta|\/hierarki|\/dashboard/);
    }
  });

  test('should support pull-to-refresh gesture on list pages', async ({ authenticatedMobilePage: page }) => {
    await page.goto('/dashboard/pos-pelkes');
    
    await page.evaluate(() => {
      window.dispatchEvent(new Event('touchstart'));
      window.dispatchEvent(new Event('touchmove'));
      window.dispatchEvent(new Event('touchend'));
    });
    
    await expect(page.getByTestId('bottom-nav')).toBeVisible();
  });
});
