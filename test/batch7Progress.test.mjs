import test from 'node:test';
import assert from 'node:assert/strict';
import { MEMORY_LEVELS, PLANETS } from '../src/data/index.js';
import { buildSeededMemoryDeck, readDiscoveryPassport, saveDiscoveryPassport, completeMemoryBoard, readMemoryPassport } from '../src/data/batch7Progress.js';
test('Memory retains rising pair counts and ten distinct valid seeded decks per board', () => {
  assert.deepEqual(MEMORY_LEVELS.slice(0, 5).map((level) => level.emojis.length), [4, 8, 10, 12, 13]);
  for (const level of MEMORY_LEVELS) {
    const signatures = new Set();
    for (let seed = 1; seed <= 10; seed++) {
      const deck = buildSeededMemoryDeck(level, seed);
      assert.equal(new Set(deck.map((card) => card.id)).size, level.emojis.length * 2);
      for (const picture of level.emojis) assert.equal(deck.filter((card) => card.emoji === picture).length, 2);
      assert.ok(deck.every((card) => !card.flipped && !card.matched));
      signatures.add(deck.map((card) => card.id).join('|'));
    }
    assert.equal(signatures.size, 10);
  }
});
test('Memory awards completed boards and best-star improvements once, preserving reload and sibling isolation', () => {
  const values = new Map(); const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  assert.equal(completeMemoryBoard('amari', MEMORY_LEVELS, 'forest', 3, storage).persisted, false);
  assert.equal(completeMemoryBoard('amari', MEMORY_LEVELS, 'forest', 16, storage).awardedStars, 1);
  assert.equal(completeMemoryBoard('amari', MEMORY_LEVELS, 'forest', 8, storage).awardedStars, 2);
  assert.equal(completeMemoryBoard('amari', MEMORY_LEVELS, 'forest', 7, storage).awardedStars, 0);
  assert.deepEqual(readMemoryPassport('amari', MEMORY_LEVELS, storage).forest, { bestMoves: 7, stars: 3 });
  assert.deepEqual(readMemoryPassport('askia', MEMORY_LEVELS, storage), {});
});
test('Discovery passport survives reload, filters forged facts and isolates siblings', () => {
  const map = new Map(); const storage = { getItem: (key) => map.get(key), setItem: (key, value) => map.set(key, value) };
  const value = { facts: { 'Earth-0': true, 'Earth-99': true, 'MadeUp-0': true }, quizzes: { Earth: true, MadeUp: true } };
  assert.equal(saveDiscoveryPassport('amari', PLANETS, value, storage), true);
  assert.deepEqual(readDiscoveryPassport('amari', PLANETS, storage), { facts: { 'Earth-0': true }, quizzes: { Earth: true } });
  assert.deepEqual(readDiscoveryPassport('askia', PLANETS, storage), { facts: {}, quizzes: {} });
  assert.equal(saveDiscoveryPassport('askia', PLANETS, value, storage), false);
  assert.equal(saveDiscoveryPassport('amari', PLANETS, value, { setItem: () => { throw Error('Full'); } }), false);
});
