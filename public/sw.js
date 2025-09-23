/* eslint-disable no-restricted-globals */
// Service Worker for PWA push notifications and basic offline caching

const CACHE_NAME = 'studentapp-static-v1';
const APP_SHELL = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
            return undefined;
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Network-first for navigation, cache-first for others
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/')));
    return;
  }

  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});

// Push event handler
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: '새 알림', body: event.data?.text?.() || '' };
  }

  const title = data.title || '새 공지사항';
  const body = data.body || '새로운 공지가 등록되었습니다.';
  const url = data.url || '/notices';
  const tag = data.tag || 'notice';
  const icon = '/icons/icon-192.png';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      tag,
      data: { url },
      badge: icon,
      renotify: true,
    }),
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/notices';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        const url = new URL(client.url);
        if (url.pathname === targetUrl) {
          client.focus();
          return undefined;
        }
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});

// Optional: Background sync (placeholder)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-push-subscriptions') {
    // Implement if needed
  }
});
