const CACHE_NAME = 'pwa-digital-signage-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://placehold.co/1080x1920/1a73e8/ffffff?text=OFERTA+DEL+DIA+(8s)+-+PWA',
  'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4',
  'https://placehold.co/1080x1920/f9aa00/000000?text=PRODUCTO+NUEVO+(6s)+-+PWA',
  'https://placehold.co/1080x1920/34a853/ffffff?text=HORARIO+DE+APERTURA+(10s)+-+PWA',
  'https://placehold.co/1080x1920/800080/ffffff?text=FINAL+DE+BUCLE',
  'https://placehold.co/192x192/1a73e8/ffffff?text=PWA',
  'https://placehold.co/512x512/1a73e8/ffffff?text=PWA'
];

// Install service worker
self.addEventListener('install', event => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        const promises = urlsToCache.map(url => {
          // Create a new request with no-cors mode to handle opaque responses from CDNs
          const request = new Request(url, { mode: 'no-cors' });
          return fetch(request).then(response => {
            return cache.put(request, response);
          }).catch(err => {
            console.warn(`Failed to cache ${url}:`, err);
          });
        });
        return Promise.all(promises);
      })
  );
});

// Fetch content from cache first, then network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If request is in cache, return it.
        if (response) {
          return response;
        }
        // Otherwise, fetch from the network.
        return fetch(event.request);
      })
  );
});

// Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});