import { test, expect } from '@playwright/test';

test.describe('Comprehensive All-Pages Design & Documentation Audit', () => {
  test.use({ storageState: 'e2e/.auth/pj-storage.json' });

  const PAGES_TO_AUDIT = [
    { name: 'Dashboard Home', url: '/dashboard' },
    { name: 'Organization Directory', url: '/org' },
    { name: 'Organization Workspace Canonical', url: '/org/POS-43938' },
    { name: 'Organization Smart Entry', url: '/org/me' },
    { name: 'Person Directory', url: '/people' },
    { name: 'Person Workspace Canonical', url: '/people/82e47866-ddf2-4e11-9146-76dd5abb8155' },
    { name: 'Settings Profile', url: '/settings/profile' },
    { name: 'Aid Requests Directory', url: '/aid-requests' },
    { name: 'Transfers / Mutasi Directory', url: '/transfers' },
    { name: 'Wilayah / Territory Map', url: '/wilayah' },
  ];

  PAGES_TO_AUDIT.forEach(({ name, url }) => {
    test(`Desktop View (1280px): ${name} (${url})`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      // 1. Page must render without error page (500/Crash)
      const errorHeading = page.locator('text="Application error"').or(page.locator('text="Internal Server Error"'));
      await expect(errorHeading).not.toBeVisible();

      // 2. Check no horizontal scroll overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });

    test(`Mobile View (390px): ${name} (${url})`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      // 1. Page must render without crash
      const errorHeading = page.locator('text="Application error"').or(page.locator('text="Internal Server Error"'));
      await expect(errorHeading).not.toBeVisible();

      // 2. Mobile Bottom Clearance Check: bottom element or main container has pb-36/pb-16
      const mainContainer = page.locator('main').first();
      if (await mainContainer.isVisible()) {
        const paddingBottom = await mainContainer.evaluate((el) => {
          return window.getComputedStyle(el).paddingBottom;
        });
        // Padding bottom must be > 0 (compensating for bottom bar)
        expect(parseInt(paddingBottom, 10)).toBeGreaterThan(0);
      }

      // 3. No horizontal scroll overflow on mobile
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });
  });
});
