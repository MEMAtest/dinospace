import test from 'node:test';
import assert from 'node:assert/strict';
import { MEMORY_LEVELS } from '../src/data/index.js';
import { buildSeededMemoryDeck, completeMemoryBoard, memoryStrategy, readMemoryPassport } from '../src/data/memoryMatchProgress.js';
import { getGameLevel, saveGameLevel } from '../src/data/sessionLevels.js';
import { readGameDiagnostics, recordGameDiagnostic } from '../src/data/gameDiagnostics.js';

test('Memory boards preserve rising pair counts, unique seeded layouts, and themed facts', () => {
  assert.deepEqual(MEMORY_LEVELS.slice(0, 5).map((level) => level.emojis.length), [4, 8, 10, 12, 13]);
  for (const level of MEMORY_LEVELS) {
    assert.ok(level.scene && level.cardMark && level.fact, `${level.id} has a theme, card mark and fact`);
    const layouts = new Set();
    for (let seed = 1; seed <= 10; seed++) {
      const deck = buildSeededMemoryDeck(level, seed);
      assert.equal(deck.length, level.emojis.length * 2);
      for (const emoji of level.emojis) assert.equal(deck.filter((card) => card.emoji === emoji).length, 2);
      assert.ok(deck.every((card) => !card.flipped && !card.matched));
      layouts.add(deck.map((card) => card.id).join('|'));
    }
    assert.equal(layouts.size, 10, `${level.id} layouts differ`);
  }
});

test('Memory adapts from a saved efficient board and keeps completion stickers across reloads', () => {
  assert.match(memoryStrategy(0, false), /Scan one row/);
  assert.match(memoryStrategy(3, false), /remember its row and place/);
  assert.match(memoryStrategy(3, true), /recalling both places/);
  const values = new Map();
  const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  const levels = MEMORY_LEVELS;
  assert.equal(completeMemoryBoard('amari', levels, 'forest', 3, storage).persisted, false);
  assert.equal(completeMemoryBoard('amari', levels, 'forest', 16, storage).awardedStars, 1);
  assert.equal(completeMemoryBoard('amari', levels, 'forest', 8, storage).awardedStars, 2);
  assert.equal(completeMemoryBoard('amari', levels, 'forest', 7, storage).awardedStars, 0);
  assert.deepEqual(readMemoryPassport('amari', levels, storage).forest, { bestMoves: 7, stars: 3 });
  assert.deepEqual(readMemoryPassport('askia', levels, storage), {});
  const levelValues = new Map();
  const levelStorage = { getItem: (key) => levelValues.get(key), setItem: (key, value) => levelValues.set(key, value) };
  saveGameLevel('amari', 'memory', 4, 4, levelStorage);
  assert.deepEqual(getGameLevel('amari', 'memory', levels.length, levelStorage), { current: 4, unlocked: 4 });
  assert.deepEqual(getGameLevel('amari', 'memory', levels.length, levelStorage), { current: 4, unlocked: 4 });
});

test('Memory diagnostics retain seeded lifecycle and answer events without prompt text', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  for (const event of ['start', 'scene', 'answer', 'hint', 'complete', 'replay', 'leave']) {
    recordGameDiagnostic('memory', event, { level: 2, seed: 4721, difficulty: 'growing', correct: event === 'answer', hintType: 'instructions', hints: 1, prompt: 'private spoken copy' }, storage);
  }
  const diagnostics = readGameDiagnostics(storage);
  assert.deepEqual(diagnostics.events.map(({ event }) => event), ['start', 'scene', 'answer', 'hint', 'complete', 'replay', 'leave']);
  assert.ok(diagnostics.events.every(({ level, seed }) => level === 2 && seed === 4721));
  assert.ok(diagnostics.events.every((entry) => !('prompt' in entry)));
});
