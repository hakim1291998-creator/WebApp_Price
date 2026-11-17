const CACHE_NAME = 'sahel-sales-pwa-v3'; // ڤێرژنەکە کرا بە v3 بۆ سڕینەوەی کۆنەکە
const STATIC_PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_PRECACHE).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => key !== CACHE_NAME ? caches.delete(key) : null)
    )).then(() => self.clients.claim())
  );
});

// ستراتیژیی Network-First بۆ ئەوەی هەرگیز فایلی index.htmlـی کۆن گیر نەخوات
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin.includes('supabase.co') || event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request) || caches.match('./index.html'))
  );
});

// کردنەوەی ئەپەکە کاتێک مەندووب لەسەر شاشی مۆبایل کرتە لە نۆتیفیکەیشنەکە دەکات
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./index.html');
    })
  );
});
