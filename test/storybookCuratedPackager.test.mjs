import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  buildCuratedBookManifest,
  curatedBookAssets,
  validateCuratedManuscripts,
  validateImageBytes,
  validateNarrationBytes,
  validatePackagedBook,
} from '../scripts/storybook-curated-packager-core.mjs';

const source = JSON.parse(await readFile(new URL('../docs/storybook-curated-manuscripts.json', import.meta.url), 'utf8'));
const books = validateCuratedManuscripts(source);

test('curated media plan is exactly 22 stable assets per ten-page book', () => {
  assert.equal(books.length, 4);
  for (const book of books) {
    const assets = curatedBookAssets(book);
    assert.equal(assets.length, 22);
    assert.equal(assets.filter((asset) => asset.kind === 'image').length, 11);
    assert.equal(assets.filter((asset) => asset.kind === 'audio').length, 11);
    assert.equal(new Set(assets.map((asset) => asset.file)).size, 22);
    assert.equal(assets.find((asset) => asset.file === 'audio-page-01.mp3').text, book.pages[0].text);
  }
});

test('generated manifest preserves reviewed copy exactly and references only local assets', () => {
  for (const book of books) {
    const manifest = buildCuratedBookManifest(book, 'source-hash');
    assert.equal(manifest.title, book.title);
    assert.equal(manifest.cover.image, 'cover.webp');
    assert.equal(manifest.cover.audio, 'audio-cover.mp3');
    assert.deepEqual(manifest.pages.map((page) => page.text), book.pages.map((page) => page.text));
    assert.equal(manifest.pages[9].audio, 'audio-page-10.mp3');
    assert.equal(manifest.generation.sourceHash, 'source-hash');
    assert.ok(manifest.pages.every((page) => !page.image.includes('..') && !page.audio.includes('..')));
  }
});

test('packaged output validation binds all 22 files and exact manifest to manuscript hash', async () => {
  const book = books[0];
  const root = await mkdtemp(path.join(os.tmpdir(), 'curated-storybook-test-'));
  try {
    for (const asset of curatedBookAssets(book)) {
      const bytes = asset.kind === 'image' ? (() => { const b = Buffer.alloc(100); b.write('RIFF'); b.write('WEBP', 8); return b; })() : (() => { const b = Buffer.alloc(1000); b.write('ID3'); return b; })();
      await writeFile(path.join(root, asset.file), bytes);
    }
    await writeFile(path.join(root, 'book.json'), `${JSON.stringify(buildCuratedBookManifest(book, 'source-hash'), null, 2)}\n`);
    assert.equal(await validatePackagedBook(root, book, 'source-hash'), true);
    await assert.rejects(() => validatePackagedBook(root, book, 'changed-source-hash'), /does not match/);
    await writeFile(path.join(root, 'audio-page-01.mp3'), Buffer.alloc(1000));
    await assert.rejects(() => validatePackagedBook(root, book, 'source-hash'), /MP3 header/);
    await mkdir(path.join(root, 'extra'), { recursive: true });
    await assert.rejects(() => validatePackagedBook(root, book, 'source-hash'), /exactly its manifest and 22 media files/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('manuscript validation rejects out-of-range copy and missing replay fields', () => {
  const badPage = structuredClone(source);
  badPage.books[0].pages[0].text = 'Too short.';
  assert.throws(() => validateCuratedManuscripts(badPage), /20–40 word range/);
  const badQuestion = structuredClone(source);
  badQuestion.books[0].comprehension[0].clue = '';
  assert.throws(() => validateCuratedManuscripts(badQuestion), /exact answer and replay copy/);
});

test('media validators require matching WebP and MP3 signatures plus usable sizes', () => {
  const webp = Buffer.alloc(100);
  webp.write('RIFF', 0, 'ascii');
  webp.write('WEBP', 8, 'ascii');
  validateImageBytes(webp, 'image/webp');
  assert.throws(() => validateImageBytes(webp, 'image/png'), /do not match/);
  const mp3 = Buffer.alloc(1000);
  mp3.write('ID3', 0, 'ascii');
  validateNarrationBytes(mp3, 'audio/mpeg');
  assert.throws(() => validateNarrationBytes(Buffer.alloc(999), 'audio/mpeg'), /at least 1 KB/);
});
