import { test as setup } from '@playwright/test';

setup('login sebagai PJ uji', async ({ page }) => {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill(process.env.E2E_EMAIL!);
  await page.locator('input[name="password"]').fill(process.env.E2E_PASSWORD!);
  await page.getByRole('button', { name: /masuk/i }).click();
  await page.waitForTimeout(3000);
  await page.context().storageState({ path: 'e2e/.auth/pj-storage.json' });
});
