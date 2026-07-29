import { test as base, expect, Page, BrowserContext } from '@playwright/test';

// Extend fixtures for Mobile & Offline testing
export const test = base.extend<{
  mobilePage: Page;
  authenticatedMobilePage: Page;
  authenticatedPage: Page;
  goToOffline: (context: BrowserContext) => Promise<void>;
  goToOnline: (context: BrowserContext) => Promise<void>;
}>({
  // 1. Force Mobile Viewport (iPhone 14)
  mobilePage: async ({ page }, use) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await use(page);
  },

  // 2. Reusable Auth State (Mock login)
  authenticatedMobilePage: async ({ mobilePage, context }, use) => {
    const page = mobilePage;
    
    // Inject auth session cookie to guarantee authenticated state across test environments
    await context.addCookies([
      {
        name: 'si_gpib_user_session',
        value: JSON.stringify({
          id: 'test-user-pj',
          email: 'pj@gpib.or.id',
          role: 'pj',
          nama_lengkap: 'Pelayan Jemaat Test',
          user_metadata: { role: 'pj', nama_lengkap: 'Pelayan Jemaat Test' },
        }),
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/dashboard');
    
    // Fallback UI login if cookie redirect is pending
    if (page.url().includes('/login')) {
      const phoneInput = page.getByTestId('input-phone');
      if (await phoneInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await phoneInput.fill('+62 878 5513 7387');
        await page.getByTestId('input-password').fill('Shitdamn24');
        await page.getByTestId('button-login').click();
        await page.waitForURL(/\/dashboard/, { timeout: 5000 }).catch(() => {});
      }
    }
    
    await use(page);
  },

  // Alias authenticatedPage to authenticatedMobilePage for compatibility
  authenticatedPage: async ({ authenticatedMobilePage }, use) => {
    await use(authenticatedMobilePage);
  },

  // 3. Network Simulation Helpers
  goToOffline: async ({}, use) => {
    await use(async (context: BrowserContext) => {
      await context.setOffline(true);
    });
  },
  goToOnline: async ({}, use) => {
    await use(async (context: BrowserContext) => {
      await context.setOffline(false);
    });
  },
});

export { expect };
