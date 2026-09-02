import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import {
  GERMAN_ANIMALS, GERMAN_BODY_PARTS, GERMAN_COLORS, GERMAN_FOODS, GERMAN_GREETINGS,
  GERMAN_NUMBERS, GERMAN_SHAPES, GERMAN_VEHICLES,
} from '../src/data/index.js';
import { GERMAN_AUDIO_SLUGS, getGermanAudioPath } from '../src/data/germanAudio.js';

const allGermanTerms = [
  ...GERMAN_COLORS, ...GERMAN_NUMBERS, ...GERMAN_ANIMALS, ...GERMAN_SHAPES,
  ...GERMAN_FOODS, ...GERMAN_VEHICLES, ...GERMAN_BODY_PARTS, ...GERMAN_GREETINGS,
];

test('every German Garage term has one local audio asset', () => {
  const terms = [...new Set(allGermanTerms.map(({ name }) => name))];
  assert.equal(terms.length, 60);
  for (const term of terms) {
    const path = getGermanAudioPath(term);
    assert.ok(path, `Missing German audio mapping for ${term}`);
    assert.equal(existsSync(`public${path}`), true, `Missing German audio file for ${term}`);
  }
  assert.equal(Object.keys(GERMAN_AUDIO_SLUGS).length, terms.length);
});
