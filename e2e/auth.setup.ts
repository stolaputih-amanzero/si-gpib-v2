import { test as setup } from '@playwright/test';

setup('login sebagai PJ uji', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/email|telepon/i).fill(process.env.E2E_EMAIL!);
  await page.getByLabel(/password/i).fill(process.env.E2E_PASSWORD!);
  await page.getByRole('button', { name: /masuk/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20_000 });
  await page.context().storageState({ path: 'e2e/.auth/pj-storage.json' });
});
