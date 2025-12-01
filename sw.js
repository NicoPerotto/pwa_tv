const CACHE_NAME = 'pwa-digital-signage-cache-v3';
const urlsToCache = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
  // New media list
  'https://dotsignage.com/wp-content/uploads/2024/04/burger-digital-menu-boards-for-drive-thru.jpg',
  'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4',
  'https://placehold.co/1080x1920/f9aa00/000000?text=PRODUCTO+NUEVO+(6s)+-+PWA',
  'https://placehold.co/1080x1920/34a853/ffffff?text=HORARIO+DE+APERTURA+(10s)+-+PWA',
  'https://placehold.co/1080x1920/800080/ffffff?text=FINAL+DE+BUCLE',
  // Icons
  'https://placehold.co/192x192/1a73e8/ffffff?text=PWA',
  'https://placehold.co/512x512/1a73e8/ffffff?text=PWA'
];

// Install service worker
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        const promises = urlsToCache.map(url => {
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

// Activate event: clean up old caches
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

// Fetch event: Network falling back to cache
self.addEventListener('fetch', event => {
  // Strategy: Network falling back to cache for HTML navigation
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If the fetch is successful, clone the response, cache it, and return it.
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          // If the fetch fails (offline), retrieve the main index.html from the cache.
          return caches.match('./index.html'); // Explicitly ask for the app shell.
        })
    );
    return;
  }

  // Strategy: Cache first, falling back to network for other assets
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});