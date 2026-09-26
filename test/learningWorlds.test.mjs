import test from 'node:test';
import assert from 'node:assert/strict';
import { BONUS_GAME_IDS, LEARNING_WORLDS, LITTLE_EXPLORER_GAME_IDS, PRACTICE_GAME_IDS } from '../src/data/learningWorlds.js';

const EXPECTED_GAME_IDS = [
  'tictactoe', 'hangman', 'dino', 'jet', 'solar', 'german', 'math', 'letters',
  'memory', 'pattern', 'spot', 'puzzle', 'trace', 'phonics', 'addition', 'subtraction',
  'astronaut', 'worldmap', 'counting', 'words', 'storybooks', 'colormix', 'oddoneout', 'timeteller', 'numberline', 'chess',
  'dinojigsaw', 'shadowmatch', 'rocketbuilder', 'fuelup', 'firerescue', 'ladder',
];

test('five worlds map every game exactly once', () => {
  assert.equal(LEARNING_WORLDS.length, 5);
  const mapped = LEARNING_WORLDS.flatMap((world) => world.gameIds);
  assert.equal(new Set(mapped).size, mapped.length);
  assert.deepEqual([...mapped].sort(), [...EXPECTED_GAME_IDS].sort());
});

test('recommended practice excludes bonus-only games', () => {
  assert.ok(PRACTICE_GAME_IDS.length >= 3);
  assert.equal(PRACTICE_GAME_IDS.some((id) => BONUS_GAME_IDS.includes(id)), false);
});

test('little explorer games all exist in a world and never include reading-heavy games', () => {
  const mapped = new Set(LEARNING_WORLDS.flatMap((world) => world.gameIds));
  LITTLE_EXPLORER_GAME_IDS.forEach((id) => assert.ok(mapped.has(id), id));
  ['words', 'hangman', 'trace', 'math', 'worldmap', 'chess'].forEach((id) => assert.equal(LITTLE_EXPLORER_GAME_IDS.includes(id), false, id));
});
