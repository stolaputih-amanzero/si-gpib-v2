import { test as base, expect, Page, BrowserContext } from '@playwright/test';

const BASE_URL = process.env.UAT_BASE_URL || 'https://sigpib.amanzero.space';

// Kredensial dari GPIB.xlsx (sheet Users)
export const CREDENTIALS = {
  superUser: {
    phone: '+62 8111550543',
    password: 'sayur321',
    email: 'stolaputih@gmail.com',
    name: 'Bpk. Stolaputih',
  },
  adminMupel: {
    phone: '+628176588277',
    password: 'admin123',
    email: 'admin@gpib.org',
    name: 'Admin Mupel',
  },
  pjUser: {
    phone: '+62 815 4682 6865',
    password: 'Elsjo123',
    email: 'otnieljonatanpanji@gmail.com',
    name: 'Pdt. Otniel',
    idPendeta: 'PDT-41915346',
    idJemaat: '23-03-ET', // Efata Tenggarong
  },
} as const;

// Helper: Login via UI
async function loginViaUI(page: Page, phone: string, password: string) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');

  // Isi form login
  const phoneInput = page.getByTestId('input-phone').or(page.locator('input[name="phone"], input[type="tel"]').first());
  await phoneInput.fill(phone);

  const passwordInput = page.getByTestId('input-password').or(page.locator('input[name="password"], input[type="password"]').first());
  await passwordInput.fill(password);

  // Klik login
  const loginBtn = page.getByTestId('button-login').or(page.locator('button[type="submit"]').first());
  await loginBtn.click();

  // Tunggu redirect ke dashboard
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
  await expect(page.getByTestId('bottom-nav').or(page.locator('nav')).first()).toBeVisible({ timeout: 10000 });
}

// Extended test fixture
export const test = base.extend<{
  superUserPage: Page;
  adminMupelPage: Page;
  pjUserPage: Page;
  mobileContext: BrowserContext;
}>({
  // Mobile viewport (iPhone 14)
  mobileContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      permissions: ['geolocation'],
      geolocation: { longitude: 117.140012, latitude: -0.500729 }, // Samarinda (Pos Pdt. Otniel)
      locale: 'id-ID',
    });
    await use(context);
    await context.close();
  },

  // Super User authenticated page
  superUserPage: async ({ mobileContext }, use) => {
    const page = await mobileContext.newPage();
    await loginViaUI(page, CREDENTIALS.superUser.phone, CREDENTIALS.superUser.password);
    await use(page);
    await page.close();
  },

  // Admin Mupel authenticated page
  adminMupelPage: async ({ mobileContext }, use) => {
    const page = await mobileContext.newPage();
    await loginViaUI(page, CREDENTIALS.adminMupel.phone, CREDENTIALS.adminMupel.password);
    await use(page);
    await page.close();
  },

  // PJ/User authenticated page
  pjUserPage: async ({ mobileContext }, use) => {
    const page = await mobileContext.newPage();
    await loginViaUI(page, CREDENTIALS.pjUser.phone, CREDENTIALS.pjUser.password);
    await use(page);
    await page.close();
  },
});

export { expect, BASE_URL };
