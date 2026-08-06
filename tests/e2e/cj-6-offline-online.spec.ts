import { test, expect } from './fixtures';
import { mockPastoralData } from './utils/mock-data';

test.describe('CJ-6: Offline Sync Engine (Phase 4)', () => {
  test('should queue in Dexie when offline and auto-sync when online', async ({ authenticatedMobilePage: page, context, goToOffline, goToOnline }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

    // 1. Navigasi ke form Log Pastoral
    await page.goto('/dashboard/pastoral/baru');
    
    // 2. Isi form kegiatan pastoral
    // Menghindari penggunaan data-testid yang tidak ada, kita targetkan dengan placeholder atau name jika memungkinkan
    // Berdasarkan file PastoralFormClient, ada data-testid="input-jml-jiwa" dan "input-catatan"
    await page.getByTestId('target-scope-jemaat').click();
    
    // Asumsi: 'kegiatan' field bisa diisi. Jika menggunakan quick select, klik salah satu
    const kegiatanLabel = page.getByText('Pelayanan Kunjungan Khusus').first();
    if (await kegiatanLabel.isVisible()) {
      await kegiatanLabel.click();
    } else {
      // Fallback
      await page.keyboard.press('Tab');
    }
    
    await page.getByTestId('input-jml-jiwa').fill(mockPastoralData.jmlJiwa);
    await page.getByTestId('input-catatan').fill('Testing Offline Sync Engine dari Playwright');

    // 3. Simulasi Offline
    await goToOffline(context);
    
    // Kita tunggu indikator offline agar hook useNetworkStatus() menyadari status offline
    await expect(page.getByTestId('network-banner-offline')).toBeVisible({ timeout: 5000 });

    // 4. Trigger submit saat Offline (Masuk Antrean)
    await page.getByTestId('button-submit').click();
    
    // Verifikasi Toast masuk antrean
    const pendingToast = page.getByText(/tersimpan di memori perangkat|Antrean/i).first();
    await expect(pendingToast).toBeVisible({ timeout: 5000 });

    // 5. Verifikasi IndexedDB (sigpib_offline_db -> pending_submissions)
    const queueCount = await page.evaluate(async () => {
      return new Promise<number>((resolve, reject) => {
        const request = indexedDB.open('sios-offline-db');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('pendingSubmissions')) {
            resolve(0);
            return;
          }
          const tx = db.transaction('pendingSubmissions', 'readonly');
          const store = tx.objectStore('pendingSubmissions');
          const countReq = store.count();
          countReq.onsuccess = () => resolve(countReq.result);
          countReq.onerror = () => reject(countReq.error);
        };
      });
    });
    
    expect(queueCount).toBeGreaterThan(0); // Harusnya ada minimal 1 data di antrean

    const corsHeaders = {
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'apikey, X-Client-Info, Authorization, Content-Type, Prefer',
      'Access-Control-Expose-Headers': 'Content-Range, Location, Prefer',
      'Access-Control-Allow-Credentials': 'true'
    };

    let syncApiCalled = false;
    await page.route('**/*', async (route, request) => {
      const url = request.url();
      const method = request.method();
      
      if (url.includes('/rest/v1/')) {
        console.log(`[MOCK] Intercepted Supabase REST: ${method} ${url}`);
        if (method === 'POST' || method === 'PATCH') {
          syncApiCalled = true;
        }
        if (method === 'OPTIONS') {
          await route.fulfill({ status: 204, headers: corsHeaders });
        } else {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify([{ id_log: 'LOG-SYNC-TEST-123' }]),
          });
        }
      } else if (url.includes('supabase.co')) {
        console.log(`[MOCK] Intercepted other Supabase: ${method} ${url}`);
        await route.fulfill({ status: 200, headers: corsHeaders, body: '{}' });
      } else {
        // Let it continue but log if it's a POST/PATCH that might be the 400 error
        if (method !== 'GET' && method !== 'OPTIONS') {
           console.log(`[MOCK] Passing through: ${method} ${url}`);
        }
        await route.continue();
      }
    });

    // 7. Simulasi Sinyal Kembali (Auto-Sync harusnya berjalan)
    await goToOnline(context);

    // Tunggu sebentar sebelum trigger event manual
    await page.waitForTimeout(1000);

    // Di aplikasi aslinya, event 'online' akan memicu `sync-manager.ts` untuk bekerja.
    // Kita bantu trigger eventnya agar Playwright tidak flaky
    try {
      await page.evaluate(() => {
        window.dispatchEvent(new Event('online'));
        document.dispatchEvent(new Event('visibilitychange'));
      });
    } catch (e) {
      console.warn('Playwright evaluate failed (ignored):', e);
    }

    // Kita tunggu sebentar agar sync-manager memproses antrean ke mock Supabase
    await page.waitForTimeout(5000);
    // Verifikasi bahwa rute mock benar-benar terpanggil
    expect(syncApiCalled).toBeTruthy();

    // 8. Verifikasi antrean IndexedDB sudah kosong
    const newQueueCount = await page.evaluate(async () => {
      return new Promise<number>((resolve, reject) => {
        const request = indexedDB.open('sios-offline-db');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('pendingSubmissions', 'readonly');
          const store = tx.objectStore('pendingSubmissions');
          const countReq = store.count();
          countReq.onsuccess = () => resolve(countReq.result);
          countReq.onerror = () => reject(countReq.error);
        };
      });
    });

    expect(newQueueCount).toBe(0); // Antrean harusnya sudah dihapus oleh Sync Engine
  });
});
