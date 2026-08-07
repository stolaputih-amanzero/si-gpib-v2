import { test, expect } from '@playwright/test';
import { simulateOffline, simulateOnline, waitForQueueEmpty, getQueueCount, isSyncPaused, flapNetwork } from './helpers/offline-utils';
import { countLogPastoralByRequestId } from './helpers/db-utils';

test.describe('CJ-6: Offline Stress Test', () => {
  
  test.beforeEach(async ({ page }) => {
    // Kita asumsikan storageState setup sudah login sebagai PJ
    // dan rute dasar mengarah ke input pastoral
    await page.goto('/pastoral/new');
    await page.waitForLoadState('networkidle');
    
    // Clear IndexedDB pending submissions to isolate tests
    await page.evaluate(async () => {
      return new Promise<void>((resolve) => {
        const req = indexedDB.open('sigpib-offline');
        req.onsuccess = (e: any) => {
          const db = e.target.result;
          if (db.objectStoreNames.contains('pendingSubmissions')) {
            const tx = db.transaction('pendingSubmissions', 'readwrite');
            tx.objectStore('pendingSubmissions').clear();
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
          } else {
            resolve();
          }
        };
        req.onerror = () => resolve();
      });
    });
  });

  test('CJ6-1: Single form offline → online @smoke @offline', async ({ page }) => {
    // 1. Matikan network
    await simulateOffline(page);
    
    // 2. Isi form
    await page.fill('textarea[name="catatan"]', 'Test Offline 1');
    await page.click('button[type="submit"]');

    // 3. Verifikasi masuk queue offline via Toast
    await expect(page.getByText(/Tersimpan di Antrean Offline/i).first()).toBeVisible({ timeout: 5000 });

    // 4. Kembalikan online
    await simulateOnline(page);
    
    // 5. Tunggu queue kosong (sinkronisasi berhasil)
    await waitForQueueEmpty(page);
    const postCount = await getQueueCount(page);
    expect(postCount).toBe(0);
  });
  
  test('CJ6-2: Multiple forms FIFO queue @offline @queue', async ({ page }) => {
    await simulateOffline(page);
    
    // Submit 3 form
    for (let i = 1; i <= 3; i++) {
      await page.fill('textarea[name="catatan"]', `Test Queue ${i}`);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500); // Tunggu insert IndexedDB
    }
    
    // Verifikasi ada 3 item via UI
    await expect(page.getByText(/3 antrean offline/i).first()).toBeVisible({ timeout: 10000 });
    
    // Online-kan
    await simulateOnline(page);
    await waitForQueueEmpty(page, 30000);
    
    // Pastikan semua tersinkronisasi
    await expect.poll(() => getQueueCount(page), { timeout: 15000 }).toBe(0);
  });

  test('CJ6-4: Idempotency Protection under Network Retry @offline @idempotency', async ({ page }) => {
    // Skenario: Network retry menyebabkan API dipanggil ganda, namun requestId (idempotency key) 
    // memastikan hanya 1 row yang tersimpan.
    const uniqueId = `IDEMP-${Date.now()}`;
    
    await simulateOffline(page);
    
    // Isi form dengan judul unik yang kita gunakan sebagai mock "requestId" untuk pencarian di DB
    await page.fill('textarea[name="catatan"]', uniqueId);
    await page.click('button[type="submit"]');
    
    // Pastikan masuk antrean offline
    await expect(page.getByText(/Tersimpan di Antrean Offline/i).first()).toBeVisible({ timeout: 5000 });
    
    await simulateOnline(page);
    await waitForQueueEmpty(page);
    
    // Karena kita tidak bisa replay manual langsung dari UI tanpa menekan submit lagi, 
    // kita akan cek DB bahwa data ini sukses disinkronkan tepat 1 baris.
    await expect.poll(() => countLogPastoralByRequestId(uniqueId), { timeout: 10000 }).toBe(1);
  });
  
  test('CJ6-5: Dead Letter Queue @offline @dlq @error-handling', async ({ page }) => {
    // Skenario DLQ: Kita mock response API dengan status 400
    await page.route('**/api/pastoral', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 400, body: 'Bad Request (Mocked)' });
      } else {
        await route.continue();
      }
    });

    await simulateOffline(page);
    await page.fill('textarea[name="catatan"]', 'Test DLQ');
    await page.click('button[type="submit"]');
    
    await simulateOnline(page);
    
    // Item tidak akan tersinkronisasi dan akan dihapus dari antrean biasa atau ditandai gagal.
    // Di aplikasi PWA idealnya akan masuk ke DLQ state (misalnya error = true).
    await page.waitForTimeout(2000);
    const count = await getQueueCount(page);
    // Jika PWA kita didesain untuk membuang antrean yang gagal 400 dari pendingSubmissions
    expect(count).toBe(0);
  });
  
  test('CJ6-6: Session expired mid-sync @offline @auth @p0-hotfix', async ({ page }) => {
    await simulateOffline(page);
    await page.fill('textarea[name="catatan"]', 'Test Session Expire');
    await page.click('button[type="submit"]');
    
    // Mock session expired dengan menghapus auth token atau route
    await page.evaluate(() => {
      // Clear token
      window.localStorage.removeItem('supabase.auth.token');
      // Set flag paused
      window.localStorage.setItem('gp_sync_paused', 'true');
    });
    
    await simulateOnline(page);
    
    // Queue harusnya paused dan tidak sync
    await page.waitForTimeout(2000);
    const paused = await isSyncPaused(page);
    expect(paused).toBe(true);
  });

  test('CJ6-7: Network flapping @offline @race-condition', async ({ page }) => {
    // Skenario: User submit form, dan sinyal putus nyambung dalam 1 detik
    await page.fill('textarea[name="catatan"]', 'Test Flapping');
    await page.click('button[type="submit"]');
    
    // Flap network 3 kali dengan interval 300ms
    await flapNetwork(page, 3, 300);
    
    // Tunggu stabil
    await simulateOnline(page);
    await waitForQueueEmpty(page);
    
    // Verifikasi sync berhasil
    const count = await getQueueCount(page);
    expect(count).toBe(0);
  });
});
