import test from 'node:test';
import assert from 'node:assert/strict';
import { GAME_DIAGNOSTICS_KEY, recordGameDiagnostic } from '../src/data/gameDiagnostics.js';

test('diagnostics retain bounded outcomes without authored or personal content', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  for (let round = 0; round < 305; round += 1) {
    assert.equal(recordGameDiagnostic('letters', 'answer_correct', { round, firstAttempt: true, prompt: 'private text', childName: 'child', level: 2 }, storage), true);
  }
  const entries = JSON.parse(storage.getItem(GAME_DIAGNOSTICS_KEY));
  assert.equal(entries.length, 300);
  assert.equal(entries[0].round, 5);
  assert.equal(entries.at(-1).level, 2);
  assert.equal(entries.at(-1).firstAttempt, true);
  assert.equal('prompt' in entries[0], false);
  assert.equal('childName' in entries[0], false);
});

test('unavailable storage cannot break gameplay', () => {
  assert.equal(recordGameDiagnostic('letters', 'answer_correct', {}, { getItem: () => { throw Error('blocked'); } }), false);
});
