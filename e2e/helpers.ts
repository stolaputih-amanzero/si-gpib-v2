import type { Page } from '@playwright/test';

export async function readStore<T = Record<string, unknown>>(page: Page, store: string): Promise<T[]> {
  return page.evaluate((storeName) => new Promise<T[]>((resolve, reject) => {
    const req = indexedDB.open('sigpib-offline');
    req.onsuccess = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(storeName)) return resolve([]);
      const getAll = db.transaction(storeName, 'readonly').objectStore(storeName).getAll();
      getAll.onsuccess = () => resolve(getAll.result as T[]);
      getAll.onerror = () => reject(getAll.error);
    };
    req.onerror = () => reject(req.error);
  }), store);
}

export async function setVisibility(page: Page, state: 'hidden' | 'visible') {
  await page.evaluate((s) => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: s });
    document.dispatchEvent(new Event('visibilitychange'));
  }, state);
}

export async function isiFormMinimal(page: Page) {
  await page.getByRole('button', { name: /Kunjungan Pastoral/ }).click();
  await page.getByPlaceholder(/ringkasan/i).fill('Uji otomatis CJ-1');
}
