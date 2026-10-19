import test from 'node:test';
import assert from 'node:assert/strict';
import { isUsableStoryBlob, storyAssetInventory, validateStoryMediaAssets } from '../src/data/storybookAssets.js';

test('ready inventory has exactly the cover and two assets for every page', () => {
  const book = {
    coverAssetKey: 'book:cover',
    coverAudioAssetKey: 'book:cover-audio',
    pages: [{ imageAssetKey: 'book:p1:image', audioAssetKey: 'book:p1:audio' }, { imageAssetKey: 'book:p2:image', audioAssetKey: 'book:p2:audio' }],
  };
  const inventory = storyAssetInventory(book);
  assert.equal(inventory.length, 2 + (2 * book.pages.length));
  assert.equal(new Set(inventory.map(({ key }) => key)).size, inventory.length);
  assert.deepEqual(inventory.map(({ kind }) => kind), ['image', 'audio', 'image', 'audio', 'image', 'audio']);
});

test('ready assets require non-empty blobs with matching media types', () => {
  assert.equal(isUsableStoryBlob(new Blob(['img'], { type: 'image/webp' }), 'image'), true);
  assert.equal(isUsableStoryBlob(new Blob(['mp3'], { type: 'audio/mpeg' }), 'audio'), true);
  assert.equal(isUsableStoryBlob(new Blob([], { type: 'image/webp' }), 'image'), false);
  assert.equal(isUsableStoryBlob(new Blob(['bytes'], { type: 'application/octet-stream' }), 'audio'), false);
});

test('backup media validation uses at most three workers and settles siblings after a decode failure', async () => {
  const assets = Array.from({ length: 8 }, (_, index) => ({ key: `book:${index}`, kind: 'image', blob: new Blob(['media']) }));
  let active = 0;
  let maximum = 0;
  await validateStoryMediaAssets(assets, {
    validator: async () => {
      active += 1;
      maximum = Math.max(maximum, active);
      await new Promise((resolve) => setTimeout(resolve, 4));
      active -= 1;
    },
  });
  assert.equal(maximum, 3);

  const invalidError = new Error('corrupt image');
  let started = 0;
  let settled = 0;
  let aborted = false;
  await assert.rejects(() => validateStoryMediaAssets(assets, {
    validator: async (_blob, _kind, signal) => {
      started += 1;
      if (started === 1) {
        await new Promise((resolve) => setTimeout(resolve, 2));
        throw invalidError;
      }
      return new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => { aborted = true; settled += 1; reject(signal.reason); }, { once: true });
      });
    },
  }), (error) => error === invalidError);
  assert.equal(started, 3);
  assert.equal(aborted, true);
  assert.equal(settled, 2);
});
