// Bump this whenever the app shell changes.  It prevents an installed tablet
// from continuing to serve an older JavaScript bundle after a production UI
// release (for example, the story-maker progress screen).
const CACHE_NAME = 'amari-discovery-v12';
const PRECACHE_ASSETS = []; // __PRECACHE_ASSETS__
const CORE_APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/amari-discovery-180.png',
  '/icons/amari-discovery-192.png',
  '/icons/amari-discovery-512.png',
];

// Thousands of narration files must not be requested in one cache.addAll()
// call: Android/Chrome can exhaust its concurrent request pool and reject the
// whole service-worker install. Small sequential batches keep the install
// reliable while still packaging the complete offline library.
const cacheAsset = async (cache, asset, maxAttempts = 3) => {
  if (await cache.match(asset)) return;

  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(asset);
      if (!response.ok) throw new Error(`Could not cache ${asset}: ${response.status}`);
      await cache.put(asset, response);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 300));
      }
    }
  }

  throw lastError;
};

const cacheInBatches = async (cache, assets, batchSize = 24) => {
  for (let index = 0; index < assets.length; index += batchSize) {
    const batch = assets.slice(index, index + batchSize);
    await Promise.all(batch.map((asset) => cacheAsset(cache, asset)));
  }
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        await cache.addAll(CORE_APP_SHELL);
        await cacheInBatches(cache, PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith('amari-discovery-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          return networkResponse;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html'))),
    );
    return;
  }

  const isAppAsset = url.pathname.startsWith('/assets/')
    || url.pathname.startsWith('/audio/')
    || url.pathname.startsWith('/storybooks/')
    || url.pathname.startsWith('/icons/')
    || url.pathname === '/manifest.webmanifest';
  if (!isAppAsset) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((networkResponse) => {
        if (networkResponse.ok && networkResponse.type === 'basic') {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return networkResponse;
      });
    }),
  );
});
