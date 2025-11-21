const CACHE_NAME = 'liceu-timetable-v3';

// Install Event: Activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch Event: Network First, Fallback to Cache (Best for development + reliability)
// For a strict offline-first prod build, we often use Cache First, but Runtime caching is safer here.
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache the new response
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Network failed, return cached response if available
        if (cachedResponse) return cachedResponse;
        // If both fail (offline and not cached), simple fallback could go here
      });

      // Return cached response immediately if available, while updating in background (Stale-while-revalidate logic)
      // OR return network response if available.
      // Here we implement: Return Cache if offline, otherwise fetch and cache.
      
      if (cachedResponse) {
        return cachedResponse; 
      }
      
      return fetchPromise;
    })
  );
});