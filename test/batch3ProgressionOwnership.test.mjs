import test from 'node:test';
import assert from 'node:assert/strict';
import { GAME_SESSIONS, ownsGameProgression } from '../src/data/gameSessions.js';
import { levelsForSession } from '../src/data/sessionLevels.js';

test('Amari chapter games bypass the answer-count wrapper while Askia counting keeps his exact bounds', () => {
  for (const game of ['counting', 'trace', 'tictactoe', 'dino']) {
    assert.equal(ownsGameProgression(game, false), true, game);
  }
  assert.equal(ownsGameProgression('counting', true), false);
  assert.equal(ownsGameProgression('trace', true), false);
  assert.ok(GAME_SESSIONS.counting);
  assert.deepEqual(levelsForSession('counting', true).map(({ target, countMax }) => ({ target, countMax })), [
    { target: 4, countMax: 3 }, { target: 5, countMax: 5 }, { target: 5, countMax: 7 },
  ]);
  assert.equal(ownsGameProgression('dino', true), true);
});

test('unmodified sessions retain their wrapper and existing board games keep their owner', () => {
  for (const game of ['addition', 'subtraction', 'timeteller', 'letters', 'german', 'pattern']) {
    assert.equal(ownsGameProgression(game), false, game);
    assert.ok(GAME_SESSIONS[game]);
  }
  for (const game of ['memory', 'puzzle', 'jet', 'math', 'spot']) {
    assert.equal(ownsGameProgression(game), true, game);
  }
});
