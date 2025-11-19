const CACHE_NAME = 'weather-app-v1';
const assets = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(res => {
        // Clone and cache the response from the network
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => {
            // Only cache valid responses
            if(!/^https?:$/i.test(new URL(event.request.url).protocol)) return;
            cache.put(event.request, resClone);
        });
        return res;
      })
      .catch(err => {
        // If network fails, serve from cache
        return caches.match(event.request).then(res => res);
      })
  );
});