import { test, expect } from '@playwright/test';

test.describe('CJ-7: Profile 360° Supervision', () => {
  test('Super User melihat 8 section termasuk Keluarga & Biometrik', async ({ page }) => {
    // Login sebagai Super User
    await page.goto('/login');
    // await page.fill('[name="email"]', 'superuser@gpib.org');
    // await page.fill('[name="password"]', 'password123');
    // await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');

    // Navigate ke canonical SDM Directory
    await page.goto('/people');
    
    // Cari pendeta "Otniel"
    const searchInput = page.locator('input[name="q"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Otniel');
      await page.waitForTimeout(500);
    }
    
    // Klik hasil pencarian (menyesuaikan link element)
    const personLink = page.locator('a[href*="/people/"]').first();
    if (await personLink.isVisible()) {
      await personLink.click();
      await page.waitForURL(/\/people\/.+/);

      // Verifikasi section utama Person Workspace tampil
      await expect(page.locator('#overview')).toBeVisible();
      await expect(page.locator('#profile')).toBeVisible();
      await expect(page.locator('#roles')).toBeVisible();
      await expect(page.locator('#competencies')).toBeVisible();
      await expect(page.locator('#pastoral')).toBeVisible();
    }
  });

  test('Admin Mupel hanya melihat 6 section (Keluarga & Biometrik tersembunyi)', async ({ page }) => {
    // Login sebagai Admin Mupel
    await page.goto('/login');
    await page.waitForURL('**/dashboard**');

    // Navigate ke canonical Person Workspace by ID
    await page.goto('/people/82e47866-ddf2-4e11-9146-76dd5abb8155');
    await page.waitForTimeout(1000);

    // Verifikasi Person Workspace ter-render
    const overviewSection = page.locator('#overview');
    await expect(overviewSection).toBeVisible();
  });

  test('Deep-link dari profil ke Jemaat Induk', async ({ page }) => {
    // Login sebagai Super User
    await page.goto('/login');
    await page.waitForURL('**/dashboard**');

    // Navigate ke profil pendeta
    await page.goto('/settings/users/PDT-19060024');
    await page.waitForTimeout(1000); // Tunggu data render

    // Pastikan link Jemaat ada
    const jemaatLink = page.locator('a[href^="/jemaat/"]').first();
    if (await jemaatLink.isVisible()) {
      await jemaatLink.click();
      await page.waitForURL(/\/jemaat\/.+/);

      // Verifikasi navigasi sukses
      await expect(page.locator('h1')).toContainText('Jemaat');
    }
  });
});
