import { test, expect } from './fixtures';

test.describe('Mobile Navigation Regression', () => {
  test('should render bottom nav with 44px touch targets and navigate correctly', async ({ authenticatedMobilePage: page }) => {
    const navItems = page.getByTestId('bottom-nav-item');
    const itemCount = await navItems.count();
    expect(itemCount).toBeGreaterThanOrEqual(4);

    // Validate touch target 44px minimum for accessibility
    for (const item of await navItems.all()) {
      const boundingBox = await item.boundingBox();
      if (boundingBox) {
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
        expect(boundingBox.width).toBeGreaterThanOrEqual(44);
      }
    }

    // Validate navigation to Peta / Map page
    const petaNav = page.getByTestId('bottom-nav-peta').or(page.locator('#bottom-nav-peta')).first();
    await petaNav.click();
    await page.waitForURL(/\/dashboard\/peta|\/pos-pelkes|\/peta/);
    await expect(page.getByTestId('mobile-header-title')).toBeVisible();
  });
});
