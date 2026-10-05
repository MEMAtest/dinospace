// Bump the app shell cache when compiled application assets change. Media has
// its own stable cache so an app upgrade does not discard clips already used.
const CACHE_NAME = 'amari-discovery-v17';
const MEDIA_CACHE_NAME = 'amari-discovery-media-v1';
const PRECACHE_ASSETS = []; // __PRECACHE_ASSETS__
const CORE_APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/amari-discovery-180.png',
  '/icons/amari-discovery-192.png',
  '/icons/amari-discovery-512.png',
];

const isMediaPath = (pathname) => pathname.startsWith('/audio/') || pathname.startsWith('/storybooks/');

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

const pruneOldShellAssets = async (sourceCache) => {
  for (const request of await sourceCache.keys()) {
    const url = new URL(request.url);
    if (isMediaPath(url.pathname)) continue;
    await sourceCache.delete(request);
  }
  return (await sourceCache.keys()).length > 0;
};

const cachedMedia = async (url) => {
  const mediaCache = await caches.open(MEDIA_CACHE_NAME);
  const cached = await mediaCache.match(url.href);
  if (cached) return { response: cached, migrate: null };

  // A migration failure must not destroy media that was already available
  // offline under an older app-shell cache.
  const oldCaches = (await caches.keys()).filter((name) => (
    name.startsWith('amari-discovery-') && name !== CACHE_NAME && name !== MEDIA_CACHE_NAME
  ));
  for (const name of oldCaches) {
    const oldCache = await caches.open(name);
    const oldResponse = await oldCache.match(url.href);
    if (oldResponse?.status === 200) {
      const migrationCopy = oldResponse.clone();
      return {
        response: oldResponse,
        migrate: async () => {
          if (!await mediaCache.match(url.href)) await mediaCache.put(url.href, migrationCopy);
          await oldCache.delete(url.href);
        },
      };
    }
  }
  return null;
};

const rangeResponse = async (response, rangeHeader) => {
  const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader || '');
  if (!match || (!match[1] && !match[2])) return null;

  const body = await response.arrayBuffer();
  const size = body.byteLength;
  let start = match[1] ? Number(match[1]) : null;
  let end = match[2] ? Number(match[2]) : null;

  if (start === null) {
    const suffixLength = end;
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return null;
    start = Math.max(size - suffixLength, 0);
    end = size - 1;
  } else {
    if (!Number.isSafeInteger(start) || start < 0) return null;
    if (end === null) end = size - 1;
    if (!Number.isSafeInteger(end) || end < start) return null;
    end = Math.min(end, size - 1);
  }

  if (start >= size) {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': `bytes */${size}`, 'Accept-Ranges': 'bytes' },
    });
  }

  const headers = new Headers(response.headers);
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  headers.set('Content-Length', String(end - start + 1));
  return new Response(body.slice(start, end + 1), { status: 206, headers });
};

const extendFetchLifetime = (event) => {
  let resolveLifetime;
  let resolved = false;
  event.waitUntil(new Promise((resolve) => { resolveLifetime = resolve; }));
  return () => {
    if (resolved) return;
    resolved = true;
    resolveLifetime();
  };
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
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const oldCaches = keys.filter((key) => (
      key.startsWith('amari-discovery-') && key !== CACHE_NAME && key !== MEDIA_CACHE_NAME
    ));

    for (const key of oldCaches) {
      const previousCache = await caches.open(key);
      try {
        const hasPreservedMedia = await pruneOldShellAssets(previousCache);
        if (!hasPreservedMedia) await caches.delete(key);
      } catch {
        // Keep the previous cache if it cannot safely be pruned.
      }
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    const finishLifetime = extendFetchLifetime(event);
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const copy = networkResponse.clone();
          const cacheWrite = caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          cacheWrite.then(finishLifetime, finishLifetime);
          return networkResponse;
        })
        .catch(async () => {
          try {
            const appCache = await caches.open(CACHE_NAME);
            return await appCache.match(request) || await appCache.match('/index.html');
          } finally {
            finishLifetime();
          }
        }),
    );
    return;
  }

  const isMedia = isMediaPath(url.pathname);
  const isAppAsset = url.pathname.startsWith('/assets/')
    || isMedia
    || url.pathname.startsWith('/icons/')
    || url.pathname === '/manifest.webmanifest';
  if (!isAppAsset) return;

  if (isMedia) {
    const finishLifetime = extendFetchLifetime(event);
    event.respondWith((async () => {
      let cacheWriteScheduled = false;
      try {
        const cached = await cachedMedia(url);
        const rangeHeader = request.headers.get('range');
        const conditionalRange = Boolean(rangeHeader && request.headers.has('if-range'));
        if (cached && !conditionalRange) {
          if (!rangeHeader) {
            if (cached.migrate) cached.migrate().then(finishLifetime, finishLifetime);
            else finishLifetime();
            return cached.response;
          }
          const partial = await rangeResponse(cached.response, rangeHeader);
          if (partial) {
            if (cached.migrate) cached.migrate().then(finishLifetime, finishLifetime);
            else finishLifetime();
            return partial;
          }
        }

        const isSingleRange = /^bytes=(?:\d+-\d*|-\d+)$/i.test(rangeHeader || '');
        if (rangeHeader && isSingleRange && !request.headers.has('if-range')) {
          const headers = new Headers(request.headers);
          headers.delete('range');
          const fullRequest = new Request(request, { headers });
          const fullResponse = await fetch(fullRequest);
          if (fullResponse.status === 200 && fullResponse.type === 'basic') {
            const copy = fullResponse.clone();
            const cacheWrite = caches.open(MEDIA_CACHE_NAME).then((cache) => cache.put(url.href, copy));
            cacheWrite.then(finishLifetime, finishLifetime);
            cacheWriteScheduled = true;
            const partial = await rangeResponse(fullResponse, rangeHeader);
            if (partial) return partial;
          }
        }

        const networkResponse = await fetch(request);
        if (networkResponse.status === 200 && networkResponse.type === 'basic') {
          const copy = networkResponse.clone();
          const cacheWrite = caches.open(MEDIA_CACHE_NAME).then((cache) => cache.put(url.href, copy));
          cacheWrite.then(finishLifetime, finishLifetime);
        } else if (!cacheWriteScheduled) {
          finishLifetime();
        }
        return networkResponse;
      } catch (error) {
        if (!cacheWriteScheduled) finishLifetime();
        throw error;
      }
    })());
    return;
  }

  const finishLifetime = extendFetchLifetime(event);
  event.respondWith((async () => {
    const appCache = await caches.open(CACHE_NAME);
    const cached = await appCache.match(request);
    if (cached) {
      finishLifetime();
      return cached;
    }
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok && networkResponse.type === 'basic') {
        const copy = networkResponse.clone();
        const cacheWrite = appCache.put(request, copy);
        cacheWrite.then(finishLifetime, finishLifetime);
      } else {
        finishLifetime();
      }
      return networkResponse;
    } catch (error) {
      finishLifetime();
      throw error;
    }
  })());
});
