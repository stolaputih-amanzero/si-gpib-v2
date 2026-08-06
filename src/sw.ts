/// <reference lib="webworker" />

// src/sw.ts
// SI GPIB v2.3 — Custom Service Worker (Workbox langsung, build via Serwist)
// JANGAN gunakan next-pwa. File ini di-compile oleh @serwist/next saat build.

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import {
  CacheFirst,
  StaleWhileRevalidate,
  NetworkOnly,
  NetworkFirst,
} from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;

// ============================================
// 1. PRECACHING — otomatis di-inject Serwist
// ============================================
// self.__SW_MANIFEST berisi daftar semua asset hasil build Next.js
// (chunks JS, CSS, fonts, dll) — tidak perlu enumerate manual.
// @ts-expect-error Serwist injects this
precacheAndRoute(self.__SW_MANIFEST);
cleanupOutdatedCaches();

// ============================================
// 2. NAVIGATION — Network First + Offline Fallback
// ============================================
const navigationHandler = new NetworkFirst({
  cacheName: 'sios-pages-v2',
  networkTimeoutSeconds: 10,
  plugins: [
    new CacheableResponsePlugin({ statuses: [200] }),
    new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 }),
  ],
});

const navigationRoute = new NavigationRoute(navigationHandler, {
  // Jangan intercept API routes dan auth
  denylist: [/^\/api\//, /^\/auth\//, /^\/login/, /^\/register/],
});
registerRoute(navigationRoute);

// Fallback saat offline total
self.addEventListener('fetch', (event: any) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      navigationHandler.handle(event).catch(async () => {
        const cachedFallback = await caches.match('/offline');
        if (cachedFallback) return cachedFallback;
        return new Response(
          '<html><body><h1>Offline</h1><p>SI GPIB tidak dapat terhubung ke internet.</p></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      })
    );
  }
});

// ============================================
// 3. STATIC ASSETS — Cache First
// ============================================

// Next.js static assets (_next/static)
registerRoute(
  ({ url }) => url.pathname.startsWith('/_next/static'),
  new CacheFirst({
    cacheName: 'sios-next-static-v2',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 365 * 24 * 60 * 60 }),
    ],
  })
);

// Images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'sios-images-v2',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 300, maxAgeSeconds: 7 * 24 * 60 * 60 }),
    ],
  })
);

// Fonts
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'sios-fonts-v2',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 }),
    ],
  })
);

// ============================================
// 4. MASTER DATA API — Stale While Revalidate
// ============================================
registerRoute(
  ({ url }) =>
    url.pathname.startsWith('/api/mupel') ||
    url.pathname.startsWith('/api/jemaat') ||
    url.pathname.startsWith('/api/pos-pelkes') ||
    url.pathname.startsWith('/api/pendeta'),
  new StaleWhileRevalidate({
    cacheName: 'sios-master-data-v2',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxAgeSeconds: 24 * 60 * 60 }),
    ],
  })
);

// ============================================
// 5. MUTATIONS — Network Only + Background Sync
// ============================================
const mutationQueuePlugin = new BackgroundSyncPlugin('sios-mutation-queue', {
  maxRetentionTime: 24 * 60, // 24 jam
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request);
        console.log('[SW] Mutation synced:', entry.request.url);
      } catch (error) {
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
  },
});

registerRoute(
  ({ request }) => request.method !== 'GET',
  new NetworkOnly({
    plugins: [mutationQueuePlugin],
  }),
  'POST'
);

registerRoute(
  ({ request }) => request.method !== 'GET',
  new NetworkOnly({
    plugins: [mutationQueuePlugin],
  }),
  'PUT'
);

registerRoute(
  ({ request }) => request.method !== 'GET',
  new NetworkOnly({
    plugins: [mutationQueuePlugin],
  }),
  'DELETE'
);

// ============================================
// 6. SUPABASE STORAGE — Cache First (public assets)
// ============================================
registerRoute(
  ({ url }) => url.hostname.includes('supabase.co') && url.pathname.includes('/storage/'),
  new CacheFirst({
    cacheName: 'sios-supabase-storage-v2',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

// ============================================
// 7. INSTALL & ACTIVATE
// ============================================
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Cleanup cache lama dari versi sebelumnya
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => !name.startsWith('sios-'))
            .map((name) => caches.delete(name))
        )
      ),
    ])
  );
});
