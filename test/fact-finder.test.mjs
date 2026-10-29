import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  FACT_FINDER_CATEGORIES, FACT_FINDER_ENTRIES, filterFactFinderEntries,
  getFactFinderAudio, getFactFinderEntry, normalizeFactFinderQuery,
} from '../src/data/factFinder.js';
import { getOfflineVoiceClip } from '../src/data/offlineVoice.js';

test('Fact Finder has the planned curated coverage and unique IDs', () => {
  assert.equal(FACT_FINDER_ENTRIES.length, 34);
  assert.deepEqual(Object.fromEntries(['animals', 'dinosaurs', 'space', 'nature'].map((category) => [
    category, filterFactFinderEntries({ category }).length,
  ])), { animals: 16, dinosaurs: 5, space: 9, nature: 4 });
  assert.equal(new Set(FACT_FINDER_ENTRIES.map(({ id }) => id)).size, FACT_FINDER_ENTRIES.length);
  assert.deepEqual(FACT_FINDER_CATEGORIES.map(({ id }) => id), ['all', 'animals', 'dinosaurs', 'space', 'nature']);
});

test('every entry has child-readable authored facts, a direct HTTPS source, and actual reusable art', () => {
  for (const record of FACT_FINDER_ENTRIES) {
    assert.ok(record.name.trim());
    assert.ok(record.facts.length > 0);
    assert.ok(record.facts.every(({ text }) => text.length >= 20 && text.length <= 220));
    assert.match(record.source.url, /^https:\/\//);
    assert.ok(record.source.publisher);
    assert.ok(record.image.src || record.artKind, `${record.id} needs a real illustration`);
    if (record.image.src?.startsWith('file:')) assert.ok(existsSync(fileURLToPath(record.image.src)), record.id);
    if (record.image.src?.startsWith('/models/')) assert.ok(existsSync(path.join(process.cwd(), 'public', record.image.src.slice(1))), record.id);
    if (record.image.src?.startsWith('/art/')) assert.ok(existsSync(path.join(process.cwd(), 'public', record.image.src.slice(1))), record.id);
    assert.ok(['worldmap', 'dino', 'solar'].includes(record.exploreGameId), record.id);
  }
  for (const record of filterFactFinderEntries({ category: 'animals' })) {
    assert.ok(record.facts.some(({ text }) => /\b(is|are|an|a)\b/i.test(text)), `${record.id} needs an identifying sentence`);
    assert.ok(record.facts.some(({ text }) => text.split(/[.!?]/).filter(Boolean).length >= 2), `${record.id} needs an interesting detail`);
  }
});

test('search is normalized, matches aliases and fact text, and respects category filters', () => {
  assert.equal(normalizeFactFinderQuery('  ÁNTS  '), 'ants');
  assert.deepEqual(filterFactFinderEntries({ query: 'LADYBUG' }).map(({ id }) => id), ['ladybird']);
  assert.deepEqual(filterFactFinderEntries({ query: 'cartilage' }).map(({ id }) => id), ['shark']);
  assert.deepEqual(filterFactFinderEntries({ query: 'planet', category: 'animals' }), []);
  assert.deepEqual(filterFactFinderEntries({ query: 'T. rex' }).map(({ id }) => id), ['dino-trex']);
  assert.deepEqual(filterFactFinderEntries({ query: 'nothing matches' }), []);
});

test('only exact packaged fact or name lines can return audio clips', () => {
  for (const record of FACT_FINDER_ENTRIES) {
    const audio = getFactFinderAudio(record);
    if (audio) assert.equal(audio.src, getOfflineVoiceClip(audio.text, 'en-US'));
  }
  for (const record of filterFactFinderEntries({ category: 'space' })) assert.ok(getFactFinderAudio(record), record.name);
  for (const record of filterFactFinderEntries({ category: 'dinosaurs' })) assert.ok(getFactFinderAudio(record), record.name);
  for (const record of [...filterFactFinderEntries({ category: 'space' }), ...filterFactFinderEntries({ category: 'dinosaurs' })]) {
    const exactFactLines = record.facts.filter(({ text }) => getOfflineVoiceClip(text, 'en-US'));
    assert.ok(exactFactLines.length >= (record.category === 'space' ? 2 : 1), `${record.name} has exact packaged fact audio`);
    if (record.category === 'dinosaurs') assert.ok(record.facts[0].text !== exactFactLines[0].text, `${record.name} keeps a sourced introduction separate from its recorded feature`);
  }
  assert.equal(getFactFinderAudio(getFactFinderEntry('bee')), null);
  assert.equal(getFactFinderEntry('fern'), null);
  assert.equal(getFactFinderEntry('autumn-leaf'), null);
  assert.equal(getFactFinderEntry('seedling').image.alt.includes('seedling'), true);
  assert.equal(getFactFinderEntry('tree').image.alt.includes('tree'), true);
  assert.equal(getFactFinderEntry('earthworm').image.src, '/art/fact-finder-v1/earthworm.webp');
  assert.equal(getFactFinderEntry('tulip').image.src.endsWith('tulip-v1-card.webp'), true);
  assert.equal(getFactFinderEntry('tulip').exploreModule, 'nature-lab');
  for (const record of FACT_FINDER_ENTRIES) {
    const nameClip = getFactFinderAudio(record, record.name);
    if (nameClip) assert.equal(nameClip.text, record.name, `${record.id} name fallback is exact`);
  }
});
