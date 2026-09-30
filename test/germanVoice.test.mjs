import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { GERMAN_MODE_ITEMS } from '../src/data/germanLearning.js';
import { GERMAN_AUDIO_SLUGS, getGermanAudioPath } from '../src/data/germanAudio.js';

const allGermanTerms = Object.values(GERMAN_MODE_ITEMS).flat();

test('every German Garage term has one local audio asset', () => {
  const terms = [...new Set(allGermanTerms.map(({ name }) => name))];
  assert.equal(terms.length, 72);
  for (const term of terms) {
    const path = getGermanAudioPath(term);
    assert.ok(path, `Missing German audio mapping for ${term}`);
    assert.equal(existsSync(`public${path}`), true, `Missing German audio file for ${term}`);
  }
  assert.equal(Object.keys(GERMAN_AUDIO_SLUGS).length, terms.length);
});
