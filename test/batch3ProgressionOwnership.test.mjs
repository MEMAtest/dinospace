import test from 'node:test';
import assert from 'node:assert/strict';
import { GAME_SESSIONS, ownsGameProgression } from '../src/data/gameSessions.js';
import { levelsForSession } from '../src/data/sessionLevels.js';

test('Amari chapter games bypass the answer-count wrapper while Askia counting keeps his exact bounds', () => {
  for (const game of ['counting', 'trace', 'tictactoe', 'dino', 'addition', 'subtraction', 'timeteller', 'numberline']) {
    assert.equal(ownsGameProgression(game, false), true, game);
  }
  assert.equal(ownsGameProgression('counting', true), false);
  assert.equal(ownsGameProgression('trace', true), false);
  for (const game of ['addition', 'subtraction', 'timeteller', 'numberline']) {
    assert.equal(ownsGameProgression(game, true), false, `Askia ${game} keeps the legacy session`);
    assert.ok(GAME_SESSIONS[game]);
  }
  assert.ok(GAME_SESSIONS.counting);
  assert.deepEqual(levelsForSession('counting', true).map(({ target, countMax }) => ({ target, countMax })), [
    { target: 4, countMax: 3 }, { target: 5, countMax: 5 }, { target: 5, countMax: 7 },
  ]);
  assert.equal(ownsGameProgression('dino', true), true);
});

test('existing board and chapter games keep their progression owner', () => {
  for (const game of ['addition', 'subtraction', 'timeteller', 'numberline']) {
    assert.equal(ownsGameProgression(game), true, game);
  }
  for (const game of ['memory', 'puzzle', 'jet', 'math', 'spot']) {
    assert.equal(ownsGameProgression(game), true, game);
  }
});


test('Safari and Colour own their held chapter flow for both profiles', () => {
  for (const little of [true, false]) for (const game of ['phonics', 'colormix']) {
    assert.equal(ownsGameProgression(game, little), true, game);
  }
});

test('Classification and pattern chapters avoid premature wrapper completion', () => {
  for (const game of ['oddoneout', 'pattern']) {
    assert.equal(ownsGameProgression(game, false), true);
    assert.equal(ownsGameProgression(game, true), game === 'pattern');
  }
});

test('Hangman owns its held four-mission save and replay flow', () => {
  assert.equal(ownsGameProgression('hangman', false), true);
  assert.equal(ownsGameProgression('hangman', true), true);
  assert.equal(ownsGameProgression('letters', false), true);
  assert.equal(ownsGameProgression('german', false), true);
});


test('German owns its saved finite chapter flow instead of the old answer-count wrapper', () => {
  assert.equal(ownsGameProgression('german', false),true);
  assert.equal(ownsGameProgression('german', true),true);
  assert.ok(GAME_SESSIONS.german);
  assert.equal(ownsGameProgression('letters',false),true);
});

test('Letter Launch owns its saved four-chapter flow for both profiles', () => {
  assert.equal(ownsGameProgression('letters', false), true);
  assert.equal(ownsGameProgression('letters', true), true);
  assert.ok(GAME_SESSIONS.letters);
});
