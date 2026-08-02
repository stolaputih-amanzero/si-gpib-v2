import { BrowserContext, Page } from '@playwright/test';

export async function simulateOffline(context: BrowserContext) {
  await context.setOffline(true);
}

export async function simulateOnline(context: BrowserContext) {
  await context.setOffline(false);
}

export async function simulateSlowNetwork(context: BrowserContext) {
  const page = context.pages()[0];
  if (!page) return;
  const client = await context.newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: (1.5 * 1024 * 1024) / 8, // 1.5 Mbps (3G)
    uploadThroughput: (750 * 1024) / 8, // 750 Kbps
    latency: 100, // 100ms RTT
  });
}

export async function waitForServiceWorker(page: Page) {
  try {
    await page.waitForFunction(() => {
      return navigator.serviceWorker && navigator.serviceWorker.controller !== null;
    }, { timeout: 10000 });
  } catch {
    // Graceful fallback if Service Worker is not registered in dev server
  }
}
