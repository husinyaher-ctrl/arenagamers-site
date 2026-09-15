const CACHE_NAME = 'arenagamers-v2';
const ASSETS = [
  './index.html',
  './play.html',
  './privacy.html',
  './terms.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './assets/js/games-feed.js'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Jangan cache request ke feed GameMonetize - selalu ambil data terbaru dari jaringan.
  if (e.request.url.includes('gamemonetize')) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
