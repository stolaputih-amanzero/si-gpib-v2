import { Page } from '@playwright/test';

export async function mockBiometricLogin(page: Page, userId: string) {
  await page.addInitScript((uid) => {
    // @ts-ignore
    window.navigator.credentials = {
      // @ts-ignore
      get: async () => ({
        id: 'mock-credential-id',
        rawId: new ArrayBuffer(16),
        response: {
          clientDataJSON: new ArrayBuffer(32),
          authenticatorData: new ArrayBuffer(32),
          signature: new ArrayBuffer(32),
          userHandle: new TextEncoder().encode(uid),
        },
        type: 'public-key',
      }),
      // @ts-ignore
      create: async () => ({
        id: 'mock-credential-id',
        rawId: new ArrayBuffer(16),
        response: {
          clientDataJSON: new ArrayBuffer(32),
          attestationObject: new ArrayBuffer(64),
        },
        type: 'public-key',
      }),
    };
  }, userId);
}
