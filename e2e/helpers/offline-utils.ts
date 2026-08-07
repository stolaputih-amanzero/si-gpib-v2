import { Page } from '@playwright/test';

/**
 * Mensimulasikan mode offline pada halaman.
 * Playwright browser context bisa menggunakan `context.setOffline(true)`,
 * atau kita menggunakan `route.abort()` untuk simulasi network drop.
 */
export async function simulateOffline(page: Page) {
  await page.context().setOffline(true);
  await page.evaluate(() => {
    window.dispatchEvent(new Event('offline'));
  });
}

/**
 * Mengembalikan halaman ke mode online.
 */
export async function simulateOnline(page: Page) {
  await page.context().setOffline(false);
  await page.waitForTimeout(1000);
  await page.evaluate(async () => {
    window.dispatchEvent(new Event('online'));
    if ((window as any).__SYNC_MANAGER__) {
      await (window as any).__SYNC_MANAGER__.processQueue();
    }
  });
}

/**
 * Menunggu antrean Dexie kosong yang menandakan sync selesai.
 */
export async function waitForQueueEmpty(page: Page, timeout: number = 15000) {
  await page.waitForFunction(
    async () => {
      try {
        // @ts-ignore
        const db = window.__TEST_DB__;
        // @ts-ignore
        const sm = window.__SYNC_MANAGER__;
        if (!db) return false;
        const count = await db.pendingSubmissions.count();
        const isProcessing = sm ? sm.isProcessing : false;
        console.log(`[WAIT_QUEUE_DEBUG] count=${count}, isProcessing=${isProcessing}`);
        return count === 0 && !isProcessing;
      } catch (e) {
        return false;
      }
    },
    null,
    { timeout, polling: 300 }
  );
}

export async function getQueueCount(page: Page) {
  return await page.evaluate(async () => {
    // @ts-ignore
    const db = window.__TEST_DB__;
    if (db) {
      return await db.pendingSubmissions.count();
    }
    return 0;
  });
}

/**
 * Mengecek apakah queue di-pause
 */
export async function isSyncPaused(page: Page) {
  return await page.evaluate(() => {
    return window.localStorage.getItem('gp_sync_paused') === 'true';
  });
}

/**
 * Mensimulasikan Network Flapping
 */
export async function flapNetwork(page: Page, times: number, interval: number) {
  for (let i = 0; i < times; i++) {
    await simulateOffline(page);
    await page.waitForTimeout(interval);
    await simulateOnline(page);
    await page.waitForTimeout(interval);
  }
}
