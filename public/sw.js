/* VibeAudio Progressive Web App Service Worker */
const CACHE_VERSION = 'v1.0.2';
const STATIC_CACHE = `vibeaudio-static-${CACHE_VERSION}`;
const IMAGE_CACHE = `vibeaudio-images-${CACHE_VERSION}`;
const AUDIO_CACHE = `vibeaudio-audio-${CACHE_VERSION}`;
const DATA_CACHE = `vibeaudio-data-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-caching static assets warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Cache Cleanup
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, IMAGE_CACHE, AUDIO_CACHE, DATA_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log('[SW] Deleting obsolete cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Message Listener (e.g., skip waiting)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET or chrome-extension schemes
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Navigation requests -> NetworkFirst with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return caches.match('/');
          });
        })
    );
    return;
  }

  // 2. Audio Streams & Files -> CacheFirst for offline downloaded audio or NetworkFirst
  if (
    url.pathname.endsWith('.mp3') ||
    url.pathname.endsWith('.m4a') ||
    url.pathname.includes('/audio/') ||
    request.headers.get('accept')?.includes('audio/')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            if (response && (response.status === 200 || response.status === 206)) {
              const responseClone = response.clone();
              caches.open(AUDIO_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch((err) => {
            console.warn('[SW] Offline audio fetch failed:', err);
            return new Response('Audio unavailable offline', { status: 503 });
          });
      })
    );
    return;
  }

  // 3. Image assets -> StaleWhileRevalidate
  if (
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif)$/i) ||
    url.hostname.includes('picsum.photos')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(IMAGE_CACHE).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // 4. API & Data JSON requests -> NetworkFirst with cache fallback
  if (url.pathname.startsWith('/api/') || url.pathname.endsWith('.json')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(DATA_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // 5. Default static files -> CacheFirst with Network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
