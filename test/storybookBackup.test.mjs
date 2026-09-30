import assert from 'node:assert/strict';
import test from 'node:test';
import { createStorybookBackup, readStorybookBackup } from '../src/data/storybookBackup.js';

const makeBook = () => ({
  id: 'custom-test-book', slug: 'custom-test-book', custom: true, title: 'The Little Comet', ageBand: '5-6',
  coverAssetKey: 'custom-test-book:cover', coverAudioAssetKey: 'custom-test-book:cover-audio',
  pages: [{ number: 1, title: 'A new friend', text: 'The comet waved hello.', imageAssetKey: 'custom-test-book:page-1:image', audioAssetKey: 'custom-test-book:page-1:audio' }],
});

test('story backup round-trips book text, picture/narration blobs and page progress', async () => {
  const book = makeBook();
  const serialized = await createStorybookBackup({
    books: [book],
    assets: [
      { key: book.coverAssetKey, blob: new Blob(['cover'], { type: 'image/webp' }) },
      { key: book.coverAudioAssetKey, blob: new Blob(['cover voice'], { type: 'audio/mpeg' }) },
      { key: book.pages[0].imageAssetKey, blob: new Blob(['page'], { type: 'image/webp' }) },
      { key: book.pages[0].audioAssetKey, blob: new Blob(['page voice'], { type: 'audio/mpeg' }) },
    ],
    progress: { amari: { [book.slug]: { pageIndex: 4, favourite: true, completed: false } } },
  });
  const restored = readStorybookBackup(serialized);
  assert.equal(restored.books[0].title, 'The Little Comet');
  assert.equal(restored.assets.length, 4);
  assert.equal(restored.assets[0].blob.type, 'image/webp');
  assert.equal(await restored.assets[0].blob.text(), 'cover');
  assert.equal(restored.progress.amari[book.slug].pageIndex, 4);
  assert.equal(restored.progress.amari[book.slug].favourite, true);
});

test('story restore rejects unrelated files, non-custom books and mismatched assets', () => {
  assert.throws(() => readStorybookBackup('{"format":"nope"}'), /not a supported/);
  const badBook = makeBook();
  badBook.custom = false;
  assert.throws(() => readStorybookBackup(JSON.stringify({ format: 'amari-storybooks', version: 1, books: [badBook], assets: [] })), /invalid saved story/);
  const book = makeBook();
  assert.throws(() => readStorybookBackup(JSON.stringify({ format: 'amari-storybooks', version: 1, books: [book], assets: [{ key: 'elsewhere:cover', type: 'image/png', base64: 'YQ==' }] })), /mismatched/);
});

test('backup rejects incomplete page records and missing referenced assets', async () => {
  const book = makeBook();
  book.pages[0].text = '';
  assert.throws(() => readStorybookBackup(JSON.stringify({ format: 'amari-storybooks', version: 1, books: [book], assets: [] })), /invalid saved story/);
  book.pages[0].text = 'The comet waved hello.';
  await assert.rejects(() => createStorybookBackup({ books: [book], assets: [] }), /missing a picture or narration/);
  const assets = Object.entries({
    [book.coverAssetKey]: new Blob(['cover'], { type: 'image/png' }),
    [book.coverAudioAssetKey]: new Blob(['cover voice']),
    [book.pages[0].imageAssetKey]: new Blob(['page'], { type: 'image/png' }),
  }).map(([key, blob]) => ({ key, blob }));
  await assert.rejects(() => createStorybookBackup({ books: [book], assets }), /missing a picture or narration/);
});

test('restore rejects missing, damaged and incorrectly typed assets', () => {
  const book = makeBook();
  const payload = { format: 'amari-storybooks', version: 1, books: [book], assets: [
    { key: book.coverAssetKey, type: 'image/png', base64: 'YQ==' },
  ] };
  assert.throws(() => readStorybookBackup(JSON.stringify(payload)), /missing a picture or narration/);
  payload.assets = [
    ...[book.coverAssetKey, book.coverAudioAssetKey, book.pages[0].imageAssetKey, book.pages[0].audioAssetKey].map((key) => ({ key, type: key.includes('audio') ? 'audio/mpeg' : 'image/png', base64: 'YQ==' })),
  ];
  payload.assets[1].type = 'image/png';
  assert.throws(() => readStorybookBackup(JSON.stringify(payload)), /mismatched/);
  payload.assets[1].type = 'audio/mpeg'; payload.assets[2].base64 = '%%%';
  assert.throws(() => readStorybookBackup(JSON.stringify(payload)), /damaged/);
});

test('restore filters prototype pollution keys from progress data', () => {
  const book = makeBook();
  const assets = [book.coverAssetKey, book.coverAudioAssetKey, book.pages[0].imageAssetKey, book.pages[0].audioAssetKey]
    .map((key) => ({ key, type: key.includes('audio') ? 'audio/mpeg' : 'image/png', base64: 'YQ==' }));
  const payload = JSON.stringify({ format: 'amari-storybooks', version: 1, books: [book], assets, progress: JSON.parse('{"__proto__":{"polluted":{"completed":true}},"amari":{"safe":{"pageIndex":1},"constructor":{"completed":true}}}') });
  const restored = readStorybookBackup(payload);
  assert.equal(Object.prototype.polluted, undefined);
  assert.equal(Object.hasOwn(restored.progress, '__proto__'), false);
  assert.equal(Object.hasOwn(restored.progress.amari, 'constructor'), false);
});
