/* ==================================================================
   Service Worker — پشتیبانی از PWA
   استراتژی: Cache-First برای منابع استاتیک، Network-Fallback برای بقیه
   ================================================================== */
'use strict';

const CACHE = 'viana-cache-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './favicon.png',
  './me.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

/* نصب: پیش‌بارگذاری هسته‌ی سایت */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

/* فعال‌سازی: پاک‌سازی کش‌های قدیمی */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Fetch: کش اول، در صورت نبود، شبکه و سپس ذخیره */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  /* منابع خارجی (فونت/CDN) را فقط با شبکه‌ی ساده پاسخ می‌دهیم تا کش باد نکند */
  if (request.url.startsWith('http') && !request.url.includes(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          /* Offline fallback: برای ناوبری، صفحه‌ی اصلی کش‌شده را برمی‌گردانیم */
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('', { status: 408, statusText: 'Offline' });
        });
    })
  );
});