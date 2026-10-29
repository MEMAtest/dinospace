import test from 'node:test';
import assert from 'node:assert/strict';
import { createStorybookHydrator } from '../src/data/storybookHydration.js';

const makeBook = () => ({
  id: 'custom-hydration',
  coverAssetKey: 'custom-hydration:cover',
  coverAudioAssetKey: 'custom-hydration:cover-audio',
  pages: Array.from({ length: 3 }, (_, index) => ({
    number: index + 1,
    imageAssetKey: `custom-hydration:page-${index + 1}:image`,
    audioAssetKey: `custom-hydration:page-${index + 1}:audio`,
  })),
});

const fakeUrls = () => {
  let next = 0;
  const created = [];
  const revoked = [];
  return {
    created,
    revoked,
    createObjectURL: (blob) => { const url = `blob:storybook-${++next}`; created.push({ url, blob }); return url; },
    revokeObjectURL: (url) => revoked.push(url),
  };
};

test('cover hydration reads only the cover picture and reuses it in the reader', async () => {
  const calls = [];
  const urls = fakeUrls();
  const book = makeBook();
  const hydrator = createStorybookHydrator({
    readAsset: async (key) => { calls.push(key); return { available: true, blob: new Blob([key], { type: key.includes('audio') ? 'audio/mpeg' : 'image/png' }) }; },
    ...urls,
  });
  hydrator.retainCovers([book.coverAssetKey]);
  const cover = await hydrator.loadCover(book);
  assert.equal(cover.available, true);
  assert.equal(cover.image, 'blob:storybook-1');
  assert.equal(cover.audio, null);
  assert.deepEqual(calls, [book.coverAssetKey]);

  const screen = await hydrator.loadScreen(book, -1);
  assert.equal(screen.image, cover.image);
  assert.equal(screen.audio, 'blob:storybook-2');
  assert.equal(urls.created.length, 2);
  assert.equal(calls.includes(book.coverAudioAssetKey), true);
  hydrator.retainCovers([]);
  assert.equal(urls.revoked.includes(cover.image), false, 'the reader still retains the shared cover URL');
  hydrator.releaseReader();
  assert.equal(urls.revoked.includes(cover.image), true);
  assert.equal(urls.revoked.includes(screen.audio), true);
  hydrator.dispose();
});

test('reader keeps only current and previous screens, reuses URLs, and releases reader media', async () => {
  const calls = new Map();
  const urls = fakeUrls();
  const book = makeBook();
  const hydrator = createStorybookHydrator({
    readAsset: async (key) => {
      calls.set(key, (calls.get(key) || 0) + 1);
      return { available: true, blob: new Blob([key], { type: key.includes('audio') ? 'audio/mpeg' : 'image/png' }) };
    },
    ...urls,
  });
  const screens = [];
  for (let index = 0; index < 3; index += 1) screens.push(await hydrator.loadScreen(book, index));
  assert.equal(urls.created.length, 6);
  assert.equal(urls.revoked.length, 2, 'the first page is evicted when page three becomes current');
  assert.equal(urls.revoked.includes(screens[0].image), true);
  assert.equal(urls.revoked.includes(screens[0].audio), true);

  const rereadPrevious = await hydrator.loadScreen(book, 1);
  assert.equal(rereadPrevious.image, screens[1].image);
  assert.equal(urls.created.length, 6, 'the retained previous page is reused');
  assert.equal(calls.get(book.pages[1].imageAssetKey), 1);
  hydrator.releaseReader();
  assert.equal(urls.revoked.length, 6);
  hydrator.dispose();
});

test('concurrent requests for one reader screen coalesce each asset read', async () => {
  const pendingReads = new Map();
  const calls = new Map();
  const urls = fakeUrls();
  const book = makeBook();
  const hydrator = createStorybookHydrator({
    readAsset: (key) => {
      calls.set(key, (calls.get(key) || 0) + 1);
      return new Promise((resolve) => pendingReads.set(key, resolve));
    },
    ...urls,
  });
  const firstPromise = hydrator.loadScreen(book, 0);
  const secondPromise = hydrator.loadScreen(book, 0);
  await new Promise((resolve) => setImmediate(resolve));
  const page = book.pages[0];
  pendingReads.get(page.imageAssetKey)({ available: true, blob: new Blob(['image'], { type: 'image/png' }) });
  pendingReads.get(page.audioAssetKey)({ available: true, blob: new Blob(['audio'], { type: 'audio/mpeg' }) });
  const [first, second] = await Promise.all([firstPromise, secondPromise]);
  assert.equal(calls.get(page.imageAssetKey), 1);
  assert.equal(calls.get(page.audioAssetKey), 1);
  assert.equal(first.image, second.image);
  assert.equal(first.audio, second.audio);
  hydrator.releaseReader();
  hydrator.dispose();
});

test('unavailable storage is not reported as a missing asset', async () => {
  const urls = fakeUrls();
  const book = makeBook();
  const hydrator = createStorybookHydrator({
    readAsset: async (key) => key.endsWith('image')
      ? { available: true, blob: null }
      : { available: false, blob: null },
    ...urls,
  });
  const result = await hydrator.loadScreen(book, 0);
  assert.equal(result.available, false);
  assert.equal(result.image, null);
  assert.equal(result.audio, null);
  assert.deepEqual(result.missingKeys, [book.pages[0].imageAssetKey]);
  const unavailableCover = await hydrator.loadCover({ ...book, coverAssetKey: 'blocked-cover' });
  assert.equal(unavailableCover.available, false);
  assert.deepEqual(unavailableCover.missingKeys, []);
  hydrator.dispose();
});

test('release and disposal make pending loads stale without creating leaked URLs', async () => {
  const pendingReads = new Map();
  const urls = fakeUrls();
  const book = makeBook();
  const hydrator = createStorybookHydrator({
    readAsset: (key) => new Promise((resolve) => pendingReads.set(key, resolve)),
    ...urls,
  });
  const pending = hydrator.loadScreen(book, 0);
  await new Promise((resolve) => setImmediate(resolve));
  hydrator.releaseReader();
  const page = book.pages[0];
  pendingReads.get(page.imageAssetKey)({ available: true, blob: new Blob(['image'], { type: 'image/png' }) });
  pendingReads.get(page.audioAssetKey)({ available: true, blob: new Blob(['audio'], { type: 'audio/mpeg' }) });
  const stale = await pending;
  assert.equal(stale.stale, true);
  assert.equal(urls.created.length, 0);

  const coverRead = hydrator.loadCover(book);
  await new Promise((resolve) => setImmediate(resolve));
  hydrator.dispose();
  pendingReads.get(book.coverAssetKey)({ available: true, blob: new Blob(['cover'], { type: 'image/png' }) });
  const disposed = await coverRead;
  assert.equal(disposed.stale, true);
  assert.equal(urls.created.length, 0);
  assert.deepEqual(urls.revoked, []);
});

test('retaining visible cover keys revokes covers from cards no longer visible', async () => {
  const urls = fakeUrls();
  const first = makeBook();
  const second = { ...makeBook(), id: 'custom-second', coverAssetKey: 'custom-second:cover' };
  const hydrator = createStorybookHydrator({
    readAsset: async (key) => ({ available: true, blob: new Blob([key], { type: 'image/png' }) }),
    ...urls,
  });
  hydrator.retainCovers([first.coverAssetKey, second.coverAssetKey]);
  const firstCover = await hydrator.loadCover(first);
  const secondCover = await hydrator.loadCover(second);
  hydrator.retainCovers([second.coverAssetKey]);
  assert.equal(urls.revoked.includes(firstCover.image), true);
  assert.equal(urls.revoked.includes(secondCover.image), false);
  const rejectedOffscreen = await hydrator.loadCover(first);
  assert.equal(rejectedOffscreen.stale, true);
  hydrator.dispose();
  assert.equal(urls.revoked.includes(secondCover.image), true);
});

test('invalidating a repaired asset revokes its old URL and rereads stored media', async () => {
  const urls = fakeUrls();
  const book = makeBook();
  let revision = 1;
  const hydrator = createStorybookHydrator({
    readAsset: async () => ({ available: true, blob: new Blob([String(revision)], { type: 'image/png' }) }),
    ...urls,
  });
  hydrator.retainCovers([book.coverAssetKey]);
  const first = await hydrator.loadCover(book);
  revision = 2;
  hydrator.invalidateAsset(book.coverAssetKey);
  const repaired = await hydrator.loadCover(book);
  assert.notEqual(first.image, repaired.image);
  assert.equal(urls.revoked.includes(first.image), true);
  assert.equal(urls.created.length, 2);
  hydrator.dispose();
  assert.equal(urls.revoked.includes(repaired.image), true);
});
