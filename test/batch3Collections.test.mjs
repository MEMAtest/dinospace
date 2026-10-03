import test from 'node:test';
import assert from 'node:assert/strict';
import { getBatch3Collections } from '../src/data/batch3Collections.js';
import { COUNT_CONSTELLATION_PAGES, COUNT_THE_STARS_EPISODES } from '../src/data/countTheStarsBatch3.js';
import { COUNT_STARS_PROGRESS_KEY } from '../src/data/countTheStarsProgress.js';
import { DINO_DETECTIVE_WORLDS } from '../src/data/dinoDetectiveBatch3.js';
import { DINO_DETECTIVE_PROGRESS_KEY } from '../src/data/dinoDetectiveProgress.js';
import { LETTER_TRACE_PROGRESS_KEY } from '../src/data/letterTraceLearning.js';
import { COSMIC_PROGRESS_KEY, COSMIC_CHAPTERS } from '../src/data/cosmicTactics.js';

test('one child sees earned game collections without awarding anything or affecting a sibling', () => {
  const world = DINO_DETECTIVE_WORLDS[0];
  const values = new Map([
    [`amari_${COUNT_STARS_PROGRESS_KEY}`, JSON.stringify({ version: 1, completedEpisodeIds: [COUNT_THE_STARS_EPISODES[0].id], earnedConstellationPageIds: [COUNT_CONSTELLATION_PAGES[0].id] })],
    [`amari_${DINO_DETECTIVE_PROGRESS_KEY}`, JSON.stringify({ version: 1, completedWorldIds: [world.id], earnedWorldStickerIds: [world.stickerId] })],
    [LETTER_TRACE_PROGRESS_KEY, JSON.stringify({ amari: { completedLevels: [0] } })],
    [COSMIC_PROGRESS_KEY, JSON.stringify({ amari: { completedMissionIds: [[0, 1, 2], [], []], badges: [COSMIC_CHAPTERS[0].id] } })],
  ]);
  const before = [...values];
  const storage = { getItem: (key) => values.get(key), setItem: () => assert.fail('The collection must be read-only') };
  const collections = getBatch3Collections('amari', storage);
  assert.deepEqual(collections.map(({ entries }) => entries.filter(({ earned }) => earned).length), [1, 1, 1, 1]);
  assert.deepEqual(collections.map(({ entries }) => entries.length), [3, 3, 3, 12]);
  assert.equal(getBatch3Collections('askia', storage).every(({ entries }) => entries.every(({ earned }) => !earned)), true);
  assert.deepEqual([...values], before);
});

test('orphaned rewards and unavailable storage cannot falsely label a collection earned', () => {
  const world = DINO_DETECTIVE_WORLDS[0];
  const values = new Map([
    [`amari_${COUNT_STARS_PROGRESS_KEY}`, JSON.stringify({ version: 1, earnedConstellationPageIds: [COUNT_CONSTELLATION_PAGES[0].id] })],
    [`amari_${DINO_DETECTIVE_PROGRESS_KEY}`, JSON.stringify({ version: 1, earnedWorldStickerIds: [world.stickerId] })],
    [COSMIC_PROGRESS_KEY, JSON.stringify({ amari: { completedMissionIds: [[], [], []], badges: [COSMIC_CHAPTERS[0].id, 'unknown'] } })],
  ]);
  for (const storage of [{ getItem: (key) => values.get(key) }, { getItem: () => { throw Error('unavailable'); } }]) {
    assert.equal(getBatch3Collections('amari', storage).every(({ entries }) => entries.every(({ earned }) => !earned)), true);
  }
});
