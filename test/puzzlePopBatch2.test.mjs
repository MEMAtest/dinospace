import assert from 'node:assert/strict';
import test from 'node:test';
import {
  completePuzzlePopScene,
  createPuzzlePopPieceTray,
  createPuzzlePopSceneQueue,
  getPuzzlePopProgress,
  PUZZLE_POP_CHAPTERS,
  PUZZLE_POP_SCENE_COUNT,
  PUZZLE_POP_PROGRESS_KEY,
} from '../src/data/puzzlePopBatch2.js';

const memoryStorage = () => {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
};

test('Puzzle Pop has twelve unique scenes across three progressively larger boards', () => {
  assert.equal(PUZZLE_POP_SCENE_COUNT, 12);
  assert.deepEqual(PUZZLE_POP_CHAPTERS.map(({ grid, scenes }) => [grid, scenes.length]), [[2, 4], [3, 4], [5, 4]]);
  const ids = PUZZLE_POP_CHAPTERS.flatMap(({ scenes }) => scenes.map(({ id }) => id));
  assert.equal(new Set(ids).size, 12);
  assert.ok(PUZZLE_POP_CHAPTERS.flatMap(({ scenes }) => scenes).every(({ image, fact, alt }) => image && fact.length > 25 && alt));
});

test('seeded chapter queues and piece trays are stable, shuffled, complete and replay-varied', () => {
  for (let chapter = 0; chapter < 3; chapter += 1) {
    const first = createPuzzlePopSceneQueue(chapter, 311);
    assert.deepEqual(first, createPuzzlePopSceneQueue(chapter, 311));
    assert.equal(first.length, 4);
    assert.equal(new Set(first.map(({ id }) => id)).size, 4);
    const replay = createPuzzlePopSceneQueue(chapter, 311, first.map(({ id }) => id));
    assert.notDeepEqual(replay.map(({ id }) => id), first.map(({ id }) => id));
    const tray = createPuzzlePopPieceTray(PUZZLE_POP_CHAPTERS[chapter].grid, 900 + chapter);
    const pieceCount = PUZZLE_POP_CHAPTERS[chapter].grid ** 2;
    assert.deepEqual(tray, createPuzzlePopPieceTray(PUZZLE_POP_CHAPTERS[chapter].grid, 900 + chapter));
    assert.deepEqual([...tray.map(({ correctSlot }) => correctSlot)].sort((a, b) => a - b), Array.from({ length: pieceCount }, (_, index) => index));
  }
});

test('progress persists per child and unlocks only after every scene in a chapter is completed', () => {
  const storage = memoryStorage();
  assert.equal(getPuzzlePopProgress('Amari', storage).unlockedChapter, 0);
  for (const scene of PUZZLE_POP_CHAPTERS[0].scenes.slice(0, 3)) {
    assert.equal(completePuzzlePopScene('Amari', 0, scene.id, storage).unlockedChapter, 0);
  }
  const last = completePuzzlePopScene('Amari', 0, PUZZLE_POP_CHAPTERS[0].scenes[3].id, storage);
  assert.equal(last.unlockedChapter, 1);
  assert.equal(last.newlyUnlocked, true);
  assert.equal(getPuzzlePopProgress('Askia', storage).unlockedChapter, 0);
  const malformed = memoryStorage();
  malformed.setItem(PUZZLE_POP_PROGRESS_KEY, '{broken');
  assert.equal(getPuzzlePopProgress('Amari', malformed).unlockedChapter, 0);
});
