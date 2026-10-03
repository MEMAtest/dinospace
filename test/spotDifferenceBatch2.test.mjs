import assert from 'node:assert/strict';
import test from 'node:test';
import {
  completeSpotDifferenceChapter,
  createSpotDifferenceRun,
  getNextSpotDifferenceHint,
  getSpotDifferenceProgress,
  resolveSpotDifferenceTap,
  SPOT_DIFFERENCE_CHAPTERS,
  SPOT_DIFFERENCE_PROGRESS_KEY,
  SPOT_DIFFERENCE_SCENES,
  spotAnswerAttemptDetail,
  spotDifferenceCompletionMessage,
} from '../src/data/spotDifferenceBatch2.js';
import { spotDifferenceNarration } from '../src/data/batch2Narration.js';

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

test('Spot challenge differences are bespoke shape or count variants across aligned scene art', () => {
  for (const scene of SPOT_DIFFERENCE_SCENES.filter(({ chapterIndex }) => chapterIndex === 2)) {
    assert.ok(scene.image.endsWith('.webp'), `${scene.title} uses aligned WebP art`);
    assert.equal(scene.differences.length, 7);
    assert.ok(scene.differences.every(({ normalVisual, visual, label }) => (
      normalVisual.startsWith('prop:') && visual.startsWith('prop:') && normalVisual !== visual && label
    )), `${scene.title} uses seven paired, named scene props`);
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

test('Spot attempt diagnostics distinguish a first wrong tap from a retry', () => {
  assert.deepEqual(spotAnswerAttemptDetail({ level: 1, round: 2, seed: 42, correct: false, hadMistake: false }), {
    level: 1, round: 2, seed: 42, correct: false, firstAttempt: true,
  });
  assert.deepEqual(spotAnswerAttemptDetail({ level: 1, round: 2, seed: 42, correct: false, hadMistake: true }), {
    level: 1, round: 2, seed: 42, correct: false, firstAttempt: false,
  });
});

test('Spot magnifier hints select distinct unfinished changes and stop when none remain', () => {
  const differences = [{ id: 'first' }, { id: 'second' }, { id: 'third' }];
  assert.equal(getNextSpotDifferenceHint(differences).id, 'first');
  assert.equal(getNextSpotDifferenceHint(differences, ['first'], ['second']).id, 'third');
  assert.equal(getNextSpotDifferenceHint(differences, ['first', 'third'], ['second']), null);
});

test('Spot completion status leaves the displayed fact singular while packaged narration retains it', () => {
  const scene = SPOT_DIFFERENCE_SCENES[0];
  const pairMessage = spotDifferenceCompletionMessage();
  const chapterMessage = spotDifferenceCompletionMessage({ chapterComplete: true, chapterName: 'Bright-Eyed Beginners', praise: 'Great spotting!' });
  assert.equal(pairMessage.includes(scene.fact), false);
  assert.equal(chapterMessage.includes(scene.fact), false);
  assert.equal(pairMessage, 'Picture pair complete! Your fact is below. Choose Next picture when you are ready.');
  assert.equal(chapterMessage, 'Great spotting! Bright-Eyed Beginners complete! Your picture fact is below.');
  assert.equal(spotDifferenceNarration.completed(scene), `You found every change. ${scene.fact}`);
});

test('tapping a found difference within its hit radius is neutral and keeps the same tolerance', () => {
  const [found, remaining] = SPOT_DIFFERENCE_SCENES[0].differences;
  const foundIds = [found.id];
  assert.deepEqual(resolveSpotDifferenceTap([found, remaining], foundIds, found.x + found.radius, found.y), {
    kind: 'already-found', difference: found,
  });
  assert.deepEqual(resolveSpotDifferenceTap([found, remaining], foundIds, found.x + found.radius + 0.01, found.y), {
    kind: 'miss', difference: null,
  });
  assert.deepEqual(resolveSpotDifferenceTap([found, remaining], foundIds, remaining.x, remaining.y), {
    kind: 'new', difference: remaining,
  });
});
