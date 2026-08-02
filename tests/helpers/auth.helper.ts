import { Page } from '@playwright/test';

export async function loginAs(page: Page, role: string, identifier: string) {
  await page.goto('/login');

  if (role === 'super_user') {
    await page.fill('input[name="email"], input[type="email"]', identifier);
    await page.fill('input[name="password"], input[type="password"]', 'password123');
  } else if (role === 'admin_mupel') {
    await page.fill('input[name="email"], input[type="email"]', identifier.includes('@') ? identifier : `${identifier}@gpib.org`);
    await page.fill('input[name="password"], input[type="password"]', 'password123');
  } else {
    await page.fill('input[name="phone"], input[type="tel"], input[type="text"]', identifier);
    await page.fill('input[name="password"], input[type="password"]', 'password123');
  }

  await page.getByRole('button', { name: /Login|Masuk/i }).click();
  await page.waitForURL('**/dashboard**', { timeout: 15000 });
}

export async function loginAsPendeta(page: Page, idPendeta: string) {
  const phoneMap: Record<string, string> = {
    'PDT-41915346': '+62 815 4682 6865',
    'PDT-19060024': '+62 878 5513 7387',
  };

  const phone = phoneMap[idPendeta] || '+62 815 4682 6865';
  await loginAs(page, 'user', phone);
}

export async function logout(page: Page) {
  await page.goto('/settings');
  const logoutBtn = page.getByRole('button', { name: /Logout|Keluar/i });
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
    await page.waitForURL('**/login**', { timeout: 15000 });
  }
}
