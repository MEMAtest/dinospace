import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const workerSource = await readFile('public/sw.js', 'utf8');
const origin = 'https://amari.test';
const shellAssets = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/amari-discovery-180.png',
  '/icons/amari-discovery-192.png',
  '/icons/amari-discovery-512.png',
];

const asBasicResponse = (body, options = {}) => {
  const response = new Response(body, options);
  Object.defineProperty(response, 'type', { value: 'basic' });
  return response;
};

const requestUrl = (key) => typeof key === 'string' ? key : key.url;
const listFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const filePath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(filePath) : [filePath];
  }));
  return nested.flat();
};

class MemoryCache {
  constructor(name, networkFetch, failingCacheWrites) {
    this.name = name;
    this.networkFetch = networkFetch;
    this.failingCacheWrites = failingCacheWrites;
    this.entries = new Map();
  }

  async match(key) {
    const response = this.entries.get(requestUrl(key));
    return response?.clone() || undefined;
  }

  async put(key, response) {
    if (this.failingCacheWrites.has(this.name)) throw new Error(`simulated cache failure: ${this.name}`);
    if (response.status === 206) throw new TypeError('Cache API cannot store a partial response');
    this.entries.set(requestUrl(key), response.clone());
  }

  async addAll(keys) {
    for (const key of keys) {
      const response = await this.networkFetch(key);
      if (!response.ok) throw new Error(`addAll failed for ${key}`);
      await this.put(key, response);
    }
  }

  async keys() {
    return [...this.entries.keys()].map((url) => ({ url }));
  }

  async delete(key) {
    return this.entries.delete(requestUrl(key));
  }
}

const createWorker = ({ precacheAssets = [], networkRoutes = new Map() } = {}) => {
  const cachesByName = new Map();
  const listeners = new Map();
  const fetched = [];
  const fetchedRequests = [];
  const failingCacheWrites = new Set();
  let online = true;
  let skipWaitingCalls = 0;
  let claimCalls = 0;

  const networkFetch = async (input) => {
    const url = input instanceof Request ? input.url : new URL(String(input), origin).href;
    fetched.push(url);
    fetchedRequests.push({ url, range: input instanceof Request ? input.headers.get('range') : null });
    if (!online) throw new TypeError('Network is offline');
    const route = networkRoutes.get(new URL(url).pathname);
    if (route instanceof Error) throw route;
    if (typeof route === 'function') return route(input);
    return asBasicResponse(route ?? `response:${new URL(url).pathname}`, {
      headers: { 'Content-Type': 'application/octet-stream' },
    });
  };

  const caches = {
    async open(name) {
      if (!cachesByName.has(name)) cachesByName.set(name, new MemoryCache(name, networkFetch, failingCacheWrites));
      return cachesByName.get(name);
    },
    async match(key) {
      for (const cache of [...cachesByName.values()].reverse()) {
        const response = await cache.match(key);
        if (response) return response;
      }
      return undefined;
    },
    async keys() { return [...cachesByName.keys()]; },
    async delete(name) { return cachesByName.delete(name); },
  };

  const self = {
    location: new URL(origin),
    clients: { async claim() { claimCalls += 1; } },
    async skipWaiting() { skipWaitingCalls += 1; },
    addEventListener(type, callback) { listeners.set(type, callback); },
  };
  const source = workerSource.replace(
    'const PRECACHE_ASSETS = []; // __PRECACHE_ASSETS__',
    `const PRECACHE_ASSETS = ${JSON.stringify(precacheAssets)};`,
  );
  assert.notEqual(source, workerSource, 'the worker fixture must replace its build placeholder');
  vm.runInNewContext(source, {
    self,
    caches,
    fetch: networkFetch,
    URL,
    Request,
    Response,
    Headers,
    Promise,
    TypeError,
    setTimeout(callback) { callback(); return 0; },
  });

  const dispatch = async (type, properties = {}) => {
    const waits = [];
    let responsePromise;
    let dispatchOpen = true;
    const event = {
      ...properties,
      waitUntil(promise) {
        if (!dispatchOpen) throw new Error('waitUntil was called after event dispatch');
        waits.push(Promise.resolve(promise));
      },
      respondWith(promise) { responsePromise = Promise.resolve(promise); },
    };
    listeners.get(type)?.(event);
    dispatchOpen = false;
    return {
      waits,
      responsePromise,
      async settle() { await Promise.all(waits); },
    };
  };

  return {
    cachesByName,
    dispatch,
    fetched,
    fetchedRequests,
    failingCacheWrites,
    setOnline(value) { online = value; },
    get skipWaitingCalls() { return skipWaitingCalls; },
    get claimCalls() { return claimCalls; },
    async seedCache(name, records) {
      const cache = await caches.open(name);
      for (const [url, body] of records) await cache.put(url, asBasicResponse(body));
      return cache;
    },
  };
};

test('service worker source keeps its shell and media caches separate', () => {
  assert.match(workerSource, /const CACHE_NAME = 'amari-discovery-v17'/);
  assert.match(workerSource, /const MEDIA_CACHE_NAME = 'amari-discovery-media-v1'/);
  assert.match(workerSource, /await cache\.addAll\(CORE_APP_SHELL\)/);
  assert.match(workerSource, /cacheInBatches\(cache, PRECACHE_ASSETS\)/);
  assert.match(workerSource, /batchSize = 24/);
  assert.match(workerSource, /maxAttempts = 3/);
  assert.match(workerSource, /await pruneOldShellAssets\(previousCache\)/);
  assert.match(workerSource, /const extendFetchLifetime = \(event\)/);
  assert.match(workerSource, /event\.waitUntil\(new Promise\(/);
});

test('the installed worker contains only compiled assets and stays under the eager budget', async (context) => {
  const buildDirectory = process.env.PWA_BUILD_DIR;
  if (!buildDirectory) {
    context.skip('set PWA_BUILD_DIR to a configured build output to audit emitted precache bytes');
    return;
  }

  const sw = await readFile(path.join(buildDirectory, 'sw.js'), 'utf8');
  const match = sw.match(/const PRECACHE_ASSETS = (\[.*?\]);/s);
  assert.ok(match, 'configured service worker contains an injected asset list');
  const assets = JSON.parse(match[1]);
  assert.ok(assets.length > 0);
  assert.equal(new Set(assets).size, assets.length, 'precache paths are unique');
  assert.ok(assets.every((asset) => asset.startsWith('/assets/')), 'audio and story media are excluded from install');
  assert.ok(assets.length <= 100, `compiled asset count ${assets.length} exceeds 100`);
  const emittedAssetFiles = (await readdir(path.join(buildDirectory, 'assets')))
    .filter((file) => /\.(?:css|js|mjs|png|jpg|jpeg|webp|svg|woff2?)$/i.test(file))
    .map((file) => `/assets/${file}`)
    .sort();
  assert.deepEqual([...assets].sort(), emittedAssetFiles, 'every compiled asset is eagerly cached');

  let bytes = 0;
  for (const asset of assets) {
    const filePath = path.join(buildDirectory, asset.slice(1));
    assert.ok((await stat(filePath)).isFile(), `precache target exists: ${asset}`);
    bytes += (await stat(filePath)).size;
  }
  assert.ok(bytes <= 40 * 1024 * 1024, `eager compiled assets use ${bytes} bytes, above 40 MiB`);

  const shippedEnglishAudio = await readdir(path.join(buildDirectory, 'audio', 'en'));
  const sourceEnglishAudio = await readdir('public/audio/en');
  assert.equal(
    shippedEnglishAudio.filter((file) => file.endsWith('.mp3')).sort().join('\n'),
    sourceEnglishAudio.filter((file) => file.endsWith('.mp3')).sort().join('\n'),
    'complete English narration remains in the build for online/on-demand use',
  );
  const shippedStoryFiles = await listFiles(path.join(buildDirectory, 'storybooks'));
  const sourceStoryFiles = await listFiles('public/storybooks');
  const relativeStoryFiles = (files, root) => files.map((file) => path.relative(root, file)).sort();
  assert.deepEqual(relativeStoryFiles(shippedStoryFiles, path.join(buildDirectory, 'storybooks')), relativeStoryFiles(sourceStoryFiles, 'public/storybooks'), 'all storybook media remains in the build');
});

test('install fetches the shell and compiled assets but never requests narration or story media', async () => {
  const worker = createWorker({
    precacheAssets: ['/assets/index.js', '/assets/index.css'],
    networkRoutes: new Map([
      ['/audio/missing.mp3', new Error('media unavailable')],
      ['/storybooks/book/audio-cover.mp3', new Error('story media unavailable')],
    ]),
  });
  const install = await worker.dispatch('install');
  await install.settle();

  assert.deepEqual(worker.fetched.map((url) => new URL(url).pathname), [...shellAssets, '/assets/index.js', '/assets/index.css']);
  assert.equal(worker.fetched.some((url) => /\/(audio|storybooks)\//.test(url)), false);
  assert.equal(worker.skipWaitingCalls, 1);

  const missingMedia = await worker.dispatch('fetch', { request: new Request(`${origin}/audio/missing.mp3`) });
  await assert.rejects(missingMedia.responsePromise, /media unavailable/);
  await missingMedia.settle();
  assert.equal(worker.skipWaitingCalls, 1, 'missing media affects its request, not installed app shell');

  const requestsBeforeApi = worker.fetched.length;
  const apiEvent = await worker.dispatch('fetch', { request: new Request(`${origin}/api/voice/story`) });
  assert.equal(apiEvent.responsePromise, undefined);
  assert.equal(worker.fetched.length, requestsBeforeApi, 'API routes bypass worker fetch/cache');
});

test('audio and story media cache on demand, survive offline reuse, and do not gate install', async () => {
  const worker = createWorker({
    networkRoutes: new Map([
      ['/audio/clip.mp3', 'sound-bytes'],
      ['/storybooks/book/audio-cover.mp3', 'story-sound'],
      ['/audio/missing.mp3', new Error('clip is not available')],
    ]),
  });
  const install = await worker.dispatch('install');
  await install.settle();
  assert.equal(worker.skipWaitingCalls, 1);

  const audioEvent = await worker.dispatch('fetch', { request: new Request(`${origin}/audio/clip.mp3`) });
  assert.equal(await (await audioEvent.responsePromise).text(), 'sound-bytes');
  assert.ok(audioEvent.waits.length > 0, 'full media cache write extends the fetch event lifetime');
  await audioEvent.settle();

  const storyEvent = await worker.dispatch('fetch', { request: new Request(`${origin}/storybooks/book/audio-cover.mp3`) });
  assert.equal(await (await storyEvent.responsePromise).text(), 'story-sound');
  await storyEvent.settle();

  worker.setOnline(false);
  const fetchesBeforeOfflineHits = worker.fetched.length;
  const cachedAudio = await worker.dispatch('fetch', { request: new Request(`${origin}/audio/clip.mp3`) });
  assert.equal(await (await cachedAudio.responsePromise).text(), 'sound-bytes');
  const cachedStory = await worker.dispatch('fetch', { request: new Request(`${origin}/storybooks/book/audio-cover.mp3`) });
  assert.equal(await (await cachedStory.responsePromise).text(), 'story-sound');
  assert.equal(worker.fetched.length, fetchesBeforeOfflineHits);

  const apiEvent = await worker.dispatch('fetch', { request: new Request(`${origin}/api/voice/story`) });
  assert.equal(apiEvent.responsePromise, undefined, 'API requests bypass the worker cache');
});

test('a cached full audio response satisfies byte ranges and partial responses are never cached', async () => {
  const worker = createWorker({
    networkRoutes: new Map([
      ['/audio/full.mp3', '0123456789'],
      ['/audio/partial.mp3', () => asBasicResponse('234', { status: 206, headers: { 'Content-Range': 'bytes 2-4/10' } })],
    ]),
  });
  const fullEvent = await worker.dispatch('fetch', { request: new Request(`${origin}/audio/full.mp3`) });
  assert.equal(await (await fullEvent.responsePromise).text(), '0123456789');
  await fullEvent.settle();

  const fetchCount = worker.fetched.length;
  const rangeEvent = await worker.dispatch('fetch', {
    request: new Request(`${origin}/audio/full.mp3`, { headers: { Range: 'bytes=2-4' } }),
  });
  const rangeResponse = await rangeEvent.responsePromise;
  assert.equal(rangeResponse.status, 206);
  assert.equal(rangeResponse.headers.get('Content-Range'), 'bytes 2-4/10');
  assert.equal(rangeResponse.headers.get('Content-Length'), '3');
  assert.equal(await rangeResponse.text(), '234');
  assert.equal(worker.fetched.length, fetchCount, 'cached range does not need a network request');

  const outOfBounds = await worker.dispatch('fetch', {
    request: new Request(`${origin}/audio/full.mp3`, { headers: { Range: 'bytes=20-30' } }),
  });
  const unsatisfiable = await outOfBounds.responsePromise;
  assert.equal(unsatisfiable.status, 416);
  assert.equal(unsatisfiable.headers.get('Content-Range'), 'bytes */10');

  const partialEvent = await worker.dispatch('fetch', {
    request: new Request(`${origin}/audio/partial.mp3`, { headers: { Range: 'bytes=2-4' } }),
  });
  assert.equal((await partialEvent.responsePromise).status, 206);
  await partialEvent.settle();
  const mediaCache = worker.cachesByName.get('amari-discovery-media-v1');
  assert.equal(mediaCache.entries.has(`${origin}/audio/partial.mp3`), false);
});

test('activation prunes old app assets but keeps offline media and migrates each used file lazily', async () => {
  const worker = createWorker();
  await worker.seedCache('amari-discovery-v16', [
    [`${origin}/audio/previously-used.mp3`, 'old-audio'],
    [`${origin}/storybooks/book/audio-page-01.mp3`, 'old-story'],
    [`${origin}/assets/old-app.js`, 'old-app'],
  ]);
  const activate = await worker.dispatch('activate');
  await activate.settle();

  const names = [...worker.cachesByName.keys()];
  assert.equal(names.includes('amari-discovery-v16'), true, 'legacy cache remains while it contains offline media');
  assert.equal(worker.cachesByName.get('amari-discovery-v16').entries.has(`${origin}/assets/old-app.js`), false);
  assert.equal(worker.claimCalls, 1);

  worker.failingCacheWrites.add('amari-discovery-media-v1');
  worker.setOnline(false);
  const failedMigration = await worker.dispatch('fetch', { request: new Request(`${origin}/audio/previously-used.mp3`) });
  assert.equal(await (await failedMigration.responsePromise).text(), 'old-audio', 'old media still serves if migration write fails');
  await failedMigration.settle();
  assert.equal(worker.cachesByName.get('amari-discovery-v16').entries.has(`${origin}/audio/previously-used.mp3`), true);
  assert.equal(worker.cachesByName.get('amari-discovery-media-v1').entries.has(`${origin}/audio/previously-used.mp3`), false);

  worker.failingCacheWrites.delete('amari-discovery-media-v1');
  const migrated = await worker.dispatch('fetch', { request: new Request(`${origin}/storybooks/book/audio-page-01.mp3`) });
  assert.equal(await (await migrated.responsePromise).text(), 'old-story');
  await migrated.settle();
  assert.equal(worker.cachesByName.get('amari-discovery-media-v1').entries.has(`${origin}/storybooks/book/audio-page-01.mp3`), true);
  assert.equal(worker.cachesByName.get('amari-discovery-v16').entries.has(`${origin}/storybooks/book/audio-page-01.mp3`), false);
});

test('the first byte-range request fetches the full clip and enables offline range and full replay', async () => {
  const worker = createWorker({ networkRoutes: new Map([['/audio/range-first.mp3', 'abcdefghij']]) });
  const range = await worker.dispatch('fetch', {
    request: new Request(`${origin}/audio/range-first.mp3`, { headers: { Range: 'bytes=0-3' } }),
  });
  const firstResponse = await range.responsePromise;
  assert.equal(firstResponse.status, 206);
  assert.equal(firstResponse.headers.get('Content-Range'), 'bytes 0-3/10');
  assert.equal(await firstResponse.text(), 'abcd');
  assert.deepEqual(worker.fetchedRequests.map((item) => item.range), [null], 'worker fetches the full same-origin clip');
  await range.settle();

  worker.setOnline(false);
  const offlineRange = await worker.dispatch('fetch', {
    request: new Request(`${origin}/audio/range-first.mp3`, { headers: { Range: 'bytes=6-9' } }),
  });
  const offlineResponse = await offlineRange.responsePromise;
  assert.equal(offlineResponse.status, 206);
  assert.equal(offlineResponse.headers.get('Content-Range'), 'bytes 6-9/10');
  assert.equal(await offlineResponse.text(), 'ghij');
  await offlineRange.settle();

  const fullReplay = await worker.dispatch('fetch', { request: new Request(`${origin}/audio/range-first.mp3`) });
  assert.equal(await (await fullReplay.responsePromise).text(), 'abcdefghij');
  assert.equal(worker.fetchedRequests.length, 1, 'offline range and full replay use the cached clip');
  await fullReplay.settle();
});
