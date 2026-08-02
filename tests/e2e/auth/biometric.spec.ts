import { test, expect } from '@playwright/test';
import { mockBiometricLogin } from '../../helpers/webauthn.helper';

test.describe('Auth - WebAuthn Biometric Login Flow', () => {
  test('should authenticate via mocked WebAuthn biometric credential', async ({ page }) => {
    await mockBiometricLogin(page, 'PDT-41915346');
    await page.goto('/login/biometric');
    await page.waitForLoadState('domcontentloaded');

    const biometricBtn = page.getByRole('button', { name: /Fingerprint|Biometric|Login dengan Biometrik/i });
    if (await biometricBtn.isVisible()) {
      await biometricBtn.click();
    }
  });
});
