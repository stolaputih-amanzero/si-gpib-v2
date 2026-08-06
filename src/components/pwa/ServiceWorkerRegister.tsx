'use client';

import { useEffect } from 'react';
import { migrateLocalStorageToDexie } from '@/lib/offline/migrate-localstorage';
import { cleanupOldDrafts } from '@/lib/offline/cleanup';
import { setupSyncListener } from '@/lib/offline/sync-manager';

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Jalankan migrasi & cleanup offline data
    migrateLocalStorageToDexie().then(() => cleanupOldDrafts());
    
    // Setup listener untuk Sinkronisasi Latar Belakang (Online/Visibility)
    setupSyncListener();

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker when page finishes loading
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            // Check for updates on page focus
            registration.update().catch(() => {});
          })
          .catch((err) => {
            console.error('Service worker registration failed:', err);
          });
      });
    }
  }, []);

  return null;
}
