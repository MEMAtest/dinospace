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

test('Puzzle Pop chapter picture tips cover edge, landmark and row/column comparison without changing authored skills', () => {
  assert.deepEqual(PUZZLE_POP_CHAPTERS.map(({ skill, visualTip }) => [skill, visualTip]), [
    ['Match big picture pieces and spot the main shapes.', 'Compare a piece’s corner or edge with the same spot in the preview.'],
    ['Use edges, colours and smaller details to fit each piece.', 'Match one clear edge or colour landmark, then fit its neighbours.'],
    ['Study small details and use the preview to solve a bigger board.', 'Scan one row or column at a time. Check a small feature in the preview.'],
  ]);
  const starter = PUZZLE_POP_CHAPTERS[0].scenes;
  const river = starter.find(({ id }) => id === 'river-valley');
  const moon = starter.find(({ id }) => id === 'moon-camp');
  assert.match(river.image, /dino-river-3d\.webp$/);
  assert.match(moon.image, /dino-moon-3d\.webp$/);
  assert.equal(river.fact, 'Rivers carry fresh water across the land and create homes for plants and animals.');
  assert.equal(moon.fact, 'The Moon shines because sunlight bounces off its rocky surface.');
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


test('completed-picture replay never starts with the boundary picture, including repeated seeds', () => {
  for (let chapter = 0; chapter < 3; chapter += 1) {
    for (let priorSeed = 1; priorSeed <= 30; priorSeed += 1) {
      const previous = createPuzzlePopSceneQueue(chapter, priorSeed).map(({ id }) => id);
      for (let nextSeed = 1; nextSeed <= 100; nextSeed += 1) {
        const next = createPuzzlePopSceneQueue(chapter, nextSeed, previous).map(({ id }) => id);
        assert.notEqual(next[0], previous.at(-1));
        assert.notDeepEqual(next, previous);
        assert.deepEqual([...next].sort(), [...previous].sort());
      }
      // A different chapter must remain complete even when history belongs elsewhere.
      const other = createPuzzlePopSceneQueue((chapter + 1) % 3, priorSeed, previous);
      assert.equal(new Set(other.map(({ id }) => id)).size, 4);
    }
  }
});

test('completed-picture history is child-specific and supports partially finished chapter replay', () => {
  const storage = memoryStorage();
  const ids = PUZZLE_POP_CHAPTERS[0].scenes.map(({ id }) => id);
  completePuzzlePopScene('Amari', 0, ids[0], storage);
  assert.equal(getPuzzlePopProgress('Amari', storage).lastCompletedSceneId, ids[0]);
  assert.equal(getPuzzlePopProgress('Askia', storage).lastCompletedSceneId, undefined);
  for (let seed = 1; seed <= 100; seed += 1) {
    const next = createPuzzlePopSceneQueue(0, seed, [], ids[0]);
    assert.notEqual(next[0].id, ids[0]);
  }
});
