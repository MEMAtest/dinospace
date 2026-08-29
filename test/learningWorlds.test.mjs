import test from 'node:test';
import assert from 'node:assert/strict';
import { BONUS_GAME_IDS, LEARNING_WORLDS, PRACTICE_GAME_IDS } from '../src/data/learningWorlds.js';

const EXPECTED_GAME_IDS = [
  'tictactoe', 'hangman', 'dino', 'jet', 'solar', 'german', 'math', 'letters',
  'memory', 'pattern', 'spot', 'puzzle', 'trace', 'phonics', 'addition', 'subtraction',
  'astronaut', 'counting', 'words', 'storybooks', 'colormix', 'oddoneout', 'timeteller', 'numberline', 'chess',
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
