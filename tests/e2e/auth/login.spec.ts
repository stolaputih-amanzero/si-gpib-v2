import { test, expect } from '@playwright/test';
import { loginAsPendeta } from '../../helpers/auth.helper';

test.describe('Auth - Login & Logout Flows', () => {
  test('should login successfully with Pendeta phone credentials', async ({ page }) => {
    await loginAsPendeta(page, 'PDT-41915346');
    await expect(page).toHaveURL(/.*dashboard.*/);
    await expect(page.getByText(/Dashboard|Pos Pelkes/i)).toBeVisible();
  });
});
