import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getStoryBook,
  loadStoryBookManifest,
  STORYBOOK_CATALOG,
  STORYBOOK_ASSET_PATHS,
} from '../src/data/storybooks.js';

test('acceptance batch contains three ten-page age 5-6 books with local assets', () => {
  assert.deepEqual(STORYBOOK_CATALOG.map((book) => book.slug), [
    'rex-missing-moon-map',
    'luna-whispering-forest',
    'nia-great-river-journey',
  ]);
  STORYBOOK_CATALOG.forEach((book) => {
    assert.equal(book.ageBand, '5-6');
    assert.equal(book.pages.length, 10);
    assert.ok(book.cover.startsWith(`/storybooks/${book.slug}/`));
    book.pages.forEach((page) => {
      const words = page.text.trim().split(/\s+/).length;
      assert.ok(words >= 20 && words <= 40, `${book.slug} page ${page.number} has ${words} words`);
      assert.match(page.image, new RegExp(`/storybooks/${book.slug}/page-${String(page.number).padStart(2, '0')}\\.webp$`));
      assert.match(page.audio, new RegExp(`/storybooks/${book.slug}/audio-page-${String(page.number).padStart(2, '0')}\\.mp3$`));
    });
  });
  assert.equal(STORYBOOK_ASSET_PATHS.length, 3 * (2 + (10 * 2)));
});

test('generated manifests can replace copy while rejecting external asset paths', async () => {
  const seed = getStoryBook('rex-missing-moon-map');
  const loaded = await loadStoryBookManifest(seed, async () => ({
    ok: true,
    json: async () => ({
      title: 'Rex and the Moon Map',
      cover: { image: 'cover.png', audio: 'audio-cover.mp3' },
      pages: [
        { title: 'New title', text: 'A safe local replacement page.', image: 'https://example.com/image.png', audio: 'audio-page-01.mp3' },
      ],
    }),
  }));
  assert.equal(loaded.title, 'Rex and the Moon Map');
  assert.equal(loaded.cover, `${seed.basePath}/cover.png`);
  assert.equal(loaded.coverAudio, `${seed.basePath}/audio-cover.mp3`);
  assert.equal(loaded.pages[0].title, 'New title');
  assert.equal(loaded.pages[0].text, 'A safe local replacement page.');
  assert.equal(loaded.pages[0].image, seed.pages[0].image);
  assert.equal(loaded.pages[0].audio, `${seed.basePath}/audio-page-01.mp3`);
  assert.equal(loaded.pages[1].text, seed.pages[1].text);
});

test('missing generated manifest preserves bundled acceptance copy', async () => {
  const seed = getStoryBook('luna-whispering-forest');
  const loaded = await loadStoryBookManifest(seed, async () => ({ ok: false, json: async () => ({}) }));
  assert.equal(loaded, seed);
});
