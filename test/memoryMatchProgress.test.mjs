import test from 'node:test';
import assert from 'node:assert/strict';
import { MEMORY_LEVELS } from '../src/data/index.js';
import { buildSeededMemoryDeck, completeMemoryBoard, completeMemoryProgress, completeMemoryRun, getMemoryStorage, memoryStrategy, readMemoryPassport, readMemoryResume, safeSaveMemoryGameLevel, saveMemoryResume } from '../src/data/memoryMatchProgress.js';
import { getGameLevel, saveGameLevel } from '../src/data/sessionLevels.js';
import { readGameDiagnostics, recordGameDiagnostic } from '../src/data/gameDiagnostics.js';

test('Memory boards preserve rising pair counts, unique seeded layouts, and themed facts', () => {
  assert.deepEqual(MEMORY_LEVELS.map((level) => level.emojis.length), [4, 8, 10, 12, 13, 14, 15, 16, 17, 18]);
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
  assert.match(memoryStrategy(4), /Scan one row/);
  assert.match(memoryStrategy(8), /Group the board into small areas/);
  assert.match(memoryStrategy(13), /This board is busy/);
  assert.match(memoryStrategy(13, { bestMoves: 26, lastMoves: 26 }), /Try recalling both places/);
  assert.match(memoryStrategy(18, { bestMoves: 34, lastMoves: 52 }), /Pause after each pair/);
  assert.match(memoryStrategy(10, { bestMoves: 22, lastMoves: 40 }), /a small group at a time/);
  assert.notEqual(memoryStrategy(8), memoryStrategy(13));
  const values = new Map();
  const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  const levels = MEMORY_LEVELS;
  assert.equal(completeMemoryBoard('amari', levels, 'forest', 3, storage).persisted, false);
  assert.equal(completeMemoryBoard('amari', levels, 'forest', 16, storage).awardedStars, 1);
  assert.equal(completeMemoryBoard('amari', levels, 'forest', 8, storage).awardedStars, 2);
  assert.equal(completeMemoryBoard('amari', levels, 'forest', 7, storage).awardedStars, 0);
  assert.deepEqual(readMemoryPassport('amari', levels, storage).forest, { bestMoves: 7, stars: 3, lastMoves: 7 });
  assert.deepEqual(readMemoryPassport('askia', levels, storage), {});
  const levelValues = new Map();
  const levelStorage = { getItem: (key) => levelValues.get(key), setItem: (key, value) => levelValues.set(key, value) };
  saveGameLevel('amari', 'memory', 4, 4, levelStorage);
  assert.deepEqual(getGameLevel('amari', 'memory', levels.length, levelStorage), { current: 4, unlocked: 4 });
  assert.deepEqual(getGameLevel('amari', 'memory', levels.length, levelStorage), { current: 4, unlocked: 4 });
});

test('Memory commits board sticker and resume together, offers retry after a blocked write, and does not duplicate rewards', () => {
  const values = new Map();
  let blocked = true;
  const storage = {
    getItem: (key) => values.get(key),
    setItem: (key, value) => {
      if (blocked && key === 'amari_memory_completion_v1') throw new Error('storage quota blocked');
      values.set(key, value);
    },
  };
  saveGameLevel('amari', 'memory', 1, 1, storage);
  const failed = completeMemoryRun('amari', MEMORY_LEVELS, 1, 1, 'ocean', 20, storage);
  assert.equal(failed.persisted, false);
  assert.deepEqual(readMemoryPassport('amari', MEMORY_LEVELS, storage), {});
  assert.equal(readMemoryResume('amari', MEMORY_LEVELS.length, 1, storage), 1);
  assert.equal(values.has('amari_memory_completion_v1'), false);

  blocked = false;
  const retried = completeMemoryRun('amari', MEMORY_LEVELS, 1, 1, 'ocean', 20, storage);
  assert.equal(retried.persisted, true);
  assert.equal(retried.resumeIndex, 2);
  assert.equal(retried.awardedStars, 2);
  assert.deepEqual(readMemoryPassport('amari', MEMORY_LEVELS, storage).ocean, { bestMoves: 20, stars: 2, lastMoves: 20 });
  assert.equal(readMemoryResume('amari', MEMORY_LEVELS.length, 0, storage), 2);

  const replay = completeMemoryRun('amari', MEMORY_LEVELS, 1, 2, 'ocean', 25, storage);
  assert.equal(replay.persisted, true);
  assert.equal(replay.awardedStars, 0);
  assert.deepEqual(readMemoryPassport('amari', MEMORY_LEVELS, storage).ocean, { bestMoves: 20, stars: 2, lastMoves: 25 });
  assert.equal(readMemoryResume('amari', MEMORY_LEVELS.length, 0, storage), 2);
});

test('Memory storage getter failures return a retryable result without escaping', () => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: Object.defineProperty({}, 'localStorage', { get() { throw new Error('storage access denied'); } }),
  });
  try {
    assert.equal(getMemoryStorage(), null);
    assert.deepEqual(getGameLevel('amari', 'memory', MEMORY_LEVELS.length, getMemoryStorage()), { current: 0, unlocked: 0 });
    const result = completeMemoryRun('amari', MEMORY_LEVELS, 0, 0, 'forest', 4);
    assert.equal(result.persisted, false);
    assert.deepEqual(readMemoryPassport('amari', MEMORY_LEVELS), {});
    assert.equal(readMemoryResume('amari', MEMORY_LEVELS.length, 0), 0);
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
    else delete globalThis.window;
  }
});

test('Memory canonical completion survives failed legacy mirrors and cannot award twice after reload', () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key),
    setItem: (key, value) => {
      if (key !== 'amari_memory_completion_v1') throw new Error(`legacy mirror unavailable: ${key}`);
      values.set(key, value);
    },
  };
  const first = completeMemoryRun('amari', MEMORY_LEVELS, 0, 0, 'forest', 4, storage);
  assert.equal(first.persisted, true);
  assert.equal(first.awardedStars, 3);
  assert.deepEqual(readMemoryPassport('amari', MEMORY_LEVELS, storage).forest, { bestMoves: 4, stars: 3, lastMoves: 4 });
  assert.equal(readMemoryResume('amari', MEMORY_LEVELS.length, 0, storage), 1);

  const retryAfterReload = completeMemoryRun('amari', MEMORY_LEVELS, 0, 1, 'forest', 4, storage);
  assert.equal(retryAfterReload.persisted, true);
  assert.equal(retryAfterReload.awardedStars, 0);
  assert.deepEqual(readMemoryPassport('amari', MEMORY_LEVELS, storage).forest, { bestMoves: 4, stars: 3, lastMoves: 4 });
  assert.equal(readMemoryResume('amari', MEMORY_LEVELS.length, 0, storage), 1);
});

test('Memory completion fails closed when reads fail and never calls the writer', () => {
  let writes = 0;
  const storage = {
    getItem: () => { throw new Error('read denied'); },
    setItem: () => { writes += 1; },
  };
  const result = completeMemoryRun('amari', MEMORY_LEVELS, 0, 0, 'forest', 4, storage);
  assert.equal(result.persisted, false);
  assert.equal(result.awardedStars, 0);
  assert.equal(writes, 0);
});

test('Memory completion preserves malformed canonical and legacy records without writing over them', () => {
  const malformed = [
    ['amari_memory_completion_v1', '{'],
    ['amari_memory_passport_v1', '{"forest":{"bestMoves":4,"stars":9}}'],
    ['amari_memory_resume_v1', '{"resumeIndex":99}'],
    ['amari_game_levels_v1', '{'],
  ];
  for (const [corruptKey, corruptBytes] of malformed) {
    const values = new Map([[corruptKey, corruptBytes]]);
    let writes = 0;
    const storage = {
      getItem: (key) => values.has(key) ? values.get(key) : null,
      setItem: (key, value) => { writes += 1; values.set(key, value); },
    };
    const result = completeMemoryRun('amari', MEMORY_LEVELS, 0, 0, 'forest', 4, storage);
    assert.equal(result.persisted, false, corruptKey);
    assert.equal(result.awardedStars, 0, corruptKey);
    assert.equal(writes, 0, corruptKey);
    assert.equal(values.get(corruptKey), corruptBytes, corruptKey);
    assert.equal(values.size, 1, corruptKey);
  }
});

test('Memory final board commits within the ten-board resume range and remains replayable', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const final = completeMemoryRun('amari', MEMORY_LEVELS, 9, 9, 'cosmic-challenge', 36, storage);
  assert.equal(final.persisted, true);
  assert.equal(final.resumeIndex, 9);
  assert.deepEqual(readMemoryResume('amari', MEMORY_LEVELS.length, 0, storage), 9);
  const replay = completeMemoryRun('amari', MEMORY_LEVELS, 9, 9, 'cosmic-challenge', 40, storage);
  assert.equal(replay.persisted, true);
  assert.equal(replay.resumeIndex, 9);
  assert.equal(replay.awardedStars, 0);
});

test('Memory little-mode mirror preserves unreadable or malformed shared game-level bytes', () => {
  let writes = 0;
  const blocked = { getItem: () => { throw new Error('shared map unreadable'); }, setItem: () => { writes += 1; } };
  assert.equal(safeSaveMemoryGameLevel('amari', 1, 1, blocked), false);
  assert.equal(writes, 0);

  for (const bytes of ['{', 'null', '{"memory":{"current":8,"unlocked":2}}']) {
    const values = new Map([['amari_game_levels_v1', bytes]]);
    const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { writes += 1; values.set(key, value); } };
    assert.equal(safeSaveMemoryGameLevel('amari', 1, 1, storage), false);
    assert.equal(values.get('amari_game_levels_v1'), bytes);
  }
  assert.equal(writes, 0);

  const values = new Map([['amari_game_levels_v1', JSON.stringify({ addition: { current: 1, unlocked: 2 } })]]);
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  assert.equal(safeSaveMemoryGameLevel('amari', 2, 2, storage), true);
  assert.deepEqual(JSON.parse(values.get('amari_game_levels_v1')), { addition: { current: 1, unlocked: 2 }, memory: { current: 2, unlocked: 2 } });
});

test('Memory legacy resume writes preserve unreadable or malformed existing bytes', () => {
  let writes = 0;
  const blocked = { getItem: () => { throw new Error('resume unreadable'); }, setItem: () => { writes += 1; } };
  assert.equal(saveMemoryResume('amari', 4, blocked), false);
  const values = new Map([['amari_memory_resume_v1', '{']]);
  const malformed = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { writes += 1; values.set(key, value); } };
  assert.equal(saveMemoryResume('amari', 4, malformed), false);
  assert.equal(values.get('amari_memory_resume_v1'), '{');
  assert.equal(writes, 0);
});

test('replaying an earlier Memory board preserves the highest resume point and legacy unlocks', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  saveGameLevel('amari', 'memory', 4, 4, storage);
  assert.equal(readMemoryResume('amari', MEMORY_LEVELS.length, getGameLevel('amari', 'memory', MEMORY_LEVELS.length, storage).unlocked, storage), 4);

  const replayed = completeMemoryProgress('amari', MEMORY_LEVELS.length, 1, 4, storage);
  assert.deepEqual(replayed, { resumeIndex: 4, unlocked: 4, persisted: true });
  assert.deepEqual(getGameLevel('amari', 'memory', MEMORY_LEVELS.length, storage), { current: 4, unlocked: 4 });

  const advancedFromLevelFive = completeMemoryProgress('amari', MEMORY_LEVELS.length, 4, replayed.resumeIndex, storage);
  assert.deepEqual(advancedFromLevelFive, { resumeIndex: 5, unlocked: 5, persisted: true });
  assert.equal(readMemoryResume('amari', MEMORY_LEVELS.length, 0, storage), 5);

  const finalReplay = completeMemoryProgress('amari', MEMORY_LEVELS.length, 0, advancedFromLevelFive.resumeIndex, storage);
  assert.equal(finalReplay.resumeIndex, 5);
  assert.equal(finalReplay.unlocked, 5);
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
