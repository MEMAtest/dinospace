import assert from 'node:assert/strict';
import test from 'node:test';
import {
  completeSpotDifferenceChapter,
  createSpotDifferenceRun,
  getSpotDifferenceProgress,
  SPOT_DIFFERENCE_CHAPTERS,
  SPOT_DIFFERENCE_PROGRESS_KEY,
  SPOT_DIFFERENCE_SCENES,
} from '../src/data/spotDifferenceBatch2.js';

const memoryStorage = () => {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
};

test('Spot has twelve paired scenes with 3, 5 and 7 visual changes by chapter', () => {
  assert.equal(SPOT_DIFFERENCE_SCENES.length, 12);
  assert.equal(new Set(SPOT_DIFFERENCE_SCENES.map(({ id }) => id)).size, 12);
  assert.deepEqual(SPOT_DIFFERENCE_CHAPTERS.map(({ differenceCount }) => differenceCount), [3, 5, 7]);
  for (let chapter = 0; chapter < 3; chapter += 1) {
    const scenes = SPOT_DIFFERENCE_SCENES.filter((scene) => scene.chapterIndex === chapter);
    assert.equal(scenes.length, 4);
    for (const scene of scenes) {
      assert.equal(scene.differences.length, SPOT_DIFFERENCE_CHAPTERS[chapter].differenceCount);
      assert.equal(new Set(scene.differences.map(({ id }) => id)).size, scene.differences.length);
      assert.ok(scene.differences.every(({ x, y, radius, normalVisual, visual }) => x >= 0 && x <= 100 && y >= 0 && y <= 100 && radius >= 8 && normalVisual && visual && normalVisual !== visual));
      assert.ok(scene.image && scene.fact && scene.alt);
    }
  }
});

test('Spot run order and visual pair placement are seeded, complete and replay-varied', () => {
  for (let chapter = 0; chapter < 3; chapter += 1) {
    const run = createSpotDifferenceRun(chapter, 721);
    assert.deepEqual(run, createSpotDifferenceRun(chapter, 721));
    assert.equal(run.length, 4);
    assert.equal(new Set(run.map(({ id }) => id)).size, 4);
    const replay = createSpotDifferenceRun(chapter, 721, run.map(({ id }) => id));
    assert.notDeepEqual(replay.map(({ id }) => id), run.map(({ id }) => id));
    assert.ok(run.every(({ differences, chapter: attached }) => differences.length === attached.differenceCount));
  }
});

test('Spot chapter progress is child-scoped and only advances after four completed pairs', () => {
  const storage = memoryStorage();
  const scenes = SPOT_DIFFERENCE_SCENES.filter((scene) => scene.chapterIndex === 0);
  for (const scene of scenes.slice(0, 3)) {
    assert.equal(completeSpotDifferenceChapter('Amari', 0, [scene.id], storage).unlockedChapter, 0);
  }
  const final = completeSpotDifferenceChapter('Amari', 0, [scenes[3].id], storage);
  assert.equal(final.chapterComplete, true);
  assert.equal(final.unlockedChapter, 1);
  assert.equal(getSpotDifferenceProgress('Askia', storage).unlockedChapter, 0);
  const corrupt = memoryStorage();
  corrupt.setItem(SPOT_DIFFERENCE_PROGRESS_KEY, 'bad json');
  assert.equal(getSpotDifferenceProgress('Amari', corrupt).unlockedChapter, 0);
});
