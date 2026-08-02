import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../../helpers/auth.helper';

test.describe('CJ-3: Workflow Approval Bantuan Berjenjang', () => {
  test('should navigate through assistance request creation and workflow indicators', async ({ page }) => {
    await loginAs(page, 'user', '+62 815 4682 6865');
    await page.goto('/bantuan/new');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByText(/Workflow|Approval|Draft/i)).toBeVisible();
  });
});
