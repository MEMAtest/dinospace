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
      normalVisual.startsWith(scene.pairedArt ? 'scene:' : 'prop:') && visual.startsWith(scene.pairedArt ? 'scene:' : 'prop:') && normalVisual !== visual && label
    )), `${scene.title} uses seven paired, named scene props`);
  }
});

test('History Hall edits seven physical artifact regions with separated reachable targets', () => {
  const scene = SPOT_DIFFERENCE_SCENES.find(({ title }) => title === 'History Hall');
  assert.ok(scene.pairedArt && scene.imageB && scene.image !== scene.imageB);
  assert.equal(scene.editRegions.length, 7);
  scene.editRegions.forEach((region, index) => {
    const target = scene.differences[index];
    assert.ok(target.x >= region.x && target.x <= region.x + region.width);
    assert.ok(target.y >= region.y && target.y <= region.y + region.height);
    assert.ok(region.x >= 0 && region.y >= 0 && region.x + region.width <= 100 && region.y + region.height <= 100);
  });
});

test('Spot Challenge 56px hit targets stay inside and do not overlap in each authored minimum phone frame', () => {
  for (const scene of SPOT_DIFFERENCE_SCENES.filter(({ chapterIndex }) => chapterIndex === 2)) {
    const frame = { width: 280, height: 280 / (scene.aspectRatio || 4 / 3), target: 56 };
    const centers = scene.differences.map(({ x, y }) => ({ x: (x / 100) * frame.width, y: (y / 100) * frame.height }));
    for (const [index, center] of centers.entries()) {
      assert.ok(center.x >= frame.target / 2 && center.x <= frame.width - frame.target / 2, `${scene.title} target ${index + 1} fits horizontally`);
      assert.ok(center.y >= frame.target / 2 && center.y <= frame.height - frame.target / 2, `${scene.title} target ${index + 1} fits vertically`);
      for (const [otherIndex, other] of centers.entries()) {
        if (otherIndex <= index) continue;
        const overlapsHorizontally = Math.abs(center.x - other.x) < frame.target;
        const overlapsVertically = Math.abs(center.y - other.y) < frame.target;
        assert.equal(overlapsHorizontally && overlapsVertically, false, `${scene.title} targets ${index + 1} and ${otherIndex + 1} do not overlap`);
      }
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


test('Spot completed-pair replay avoids an immediate boundary repeat while keeping every target', () => {
  for (let chapter = 0; chapter < 3; chapter += 1) {
    for (let priorSeed = 1; priorSeed <= 30; priorSeed += 1) {
      const previous = createSpotDifferenceRun(chapter, priorSeed).map(({ id }) => id);
      for (let seed = 1; seed <= 100; seed += 1) {
        const next = createSpotDifferenceRun(chapter, seed, previous);
        const ids = next.map(({ id }) => id);
        assert.notEqual(ids[0], previous.at(-1));
        assert.notDeepEqual(ids, previous);
        assert.deepEqual([...ids].sort(), [...previous].sort());
        for (const scene of next) {
          const authored = SPOT_DIFFERENCE_SCENES.find(({ id }) => id === scene.id);
          assert.deepEqual(scene.differences.map(({ id }) => id).sort(), authored.differences.map(({ id }) => id).sort());
        }
      }
    }
  }
});

test('Spot records each actual completed pair independently for the child during a partial run', () => {
  const storage = memoryStorage();
  const first = SPOT_DIFFERENCE_SCENES.find(({ chapterIndex }) => chapterIndex === 0);
  completeSpotDifferenceChapter('Amari', 0, [first.id], storage);
  assert.equal(getSpotDifferenceProgress('Amari', storage).lastCompletedSceneId, first.id);
  assert.equal(getSpotDifferenceProgress('Askia', storage).lastCompletedSceneId, undefined);
  for (let seed = 1; seed <= 100; seed += 1) {
    assert.notEqual(createSpotDifferenceRun(0, seed, [], first.id)[0].id, first.id);
  }
});

// Real paired art must keep every actual object target reachable after the mobile crop.
test('River Valley authored pair has distinct scene art and three separated in-frame touch targets', () => {
  const scene = SPOT_DIFFERENCE_SCENES.find(({ id }) => id === 'spot-3');
  assert.equal(scene.pairedArt, true);
  assert.ok(scene.imageB && scene.imageB !== scene.image);
  assert.equal(scene.differences.length, 3);
  const centers = scene.differences.map(({ x, y }) => ({ x: x * 2.8, y: y * 2.1 }));
  for (const [index, center] of centers.entries()) {
    assert.ok(center.x >= 28 && center.x <= 252);
    assert.ok(center.y >= 28 && center.y <= 182);
    for (const other of centers.slice(index + 1)) {
      assert.equal(Math.abs(center.x - other.x) < 56 && Math.abs(center.y - other.y) < 56, false);
    }
  }
});

test('River edits are limited to three bounded regions containing their own targets', () => {
  const scene = SPOT_DIFFERENCE_SCENES.find(({ id }) => id === 'spot-3');
  assert.equal(scene.editRegions.length, scene.differences.length);
  scene.editRegions.forEach(({ x, y, width, height }, index) => {
    assert.ok(x >= 0 && y >= 0 && width > 0 && height > 0 && x + width <= 100 && y + height <= 100);
    const target = scene.differences[index];
    assert.ok(target.x >= x && target.x <= x + width && target.y >= y && target.y <= y + height);
  });
});

// Colour changes must preserve the source image and remain reachable on a small phone.
test('Moon Camp edits original object surfaces with three nonoverlapping reachable targets', () => {
  const scene = SPOT_DIFFERENCE_SCENES.find(({ id }) => id === 'spot-4');
  assert.equal(scene.pairedArt, true);
  assert.equal(scene.imageB, undefined);
  assert.equal(scene.colorEdits.length, 3);
  assert.deepEqual(scene.colorEdits.map(({ shape }) => shape), ['ellipse', 'path', 'rect']);
  const centers = scene.differences.map(({ x, y }) => ({ x: x * 2.8, y: y * 2.1 }));
  for (const [index, center] of centers.entries()) {
    assert.ok(center.x >= 28 && center.x <= 252 && center.y >= 28 && center.y <= 182);
    for (const other of centers.slice(index + 1)) assert.equal(Math.abs(center.x - other.x) < 56 && Math.abs(center.y - other.y) < 56, false);
  }
});

test('City original-surface changes retain three separated in-frame targets', () => {
  const scene = SPOT_DIFFERENCE_SCENES.find(({ id }) => id === 'spot-1');
  assert.equal(scene.pairedArt, true);
  assert.equal(scene.imageB, undefined);
  assert.equal(scene.colorEdits.length, 3);
  const centers = scene.differences.map(({ x, y }) => ({ x: x * 2.8, y: y * 2.1 }));
  for (const [index, center] of centers.entries()) {
    assert.ok(center.x >= 28 && center.x <= 252 && center.y >= 28 && center.y <= 182);
    for (const other of centers.slice(index + 1)) assert.equal(Math.abs(center.x - other.x) < 56 && Math.abs(center.y - other.y) < 56, false);
  }
});

test('Dino Park accepts the pictured dinosaur head and body but keeps adjacent sky and ground as misses', () => {
  const scene = SPOT_DIFFERENCE_SCENES.find(({ id }) => id === 'spot-2');
  assert.equal(scene.pairedArt, true);
  assert.equal(scene.imageB, undefined);
  assert.equal(scene.colorEdits.length, 3);
  for (const [x, y] of [[12, 29], [18, 49], [28, 65], [35, 77]]) {
    assert.equal(resolveSpotDifferenceTap(scene.differences, [], x, y).difference?.id, 'park-dinosaur');
    assert.equal(resolveSpotDifferenceTap(scene.differences, ['park-dinosaur'], x, y).kind, 'already-found');
  }
  for (const [x, y] of [[5, 20], [40, 45], [28, 94], [55, 80]]) assert.equal(resolveSpotDifferenceTap(scene.differences, [], x, y).kind, 'miss');
  for (const { x, y } of scene.differences) assert.ok(x * 2.8 >= 28 && x * 2.8 <= 252 && y * 2.1 >= 28 && y * 2.1 <= 182);
});

test('Treehouse real-object changes remain five separate reachable targets after the centered crop', () => {
  const scene = SPOT_DIFFERENCE_SCENES.find(({ id }) => id === 'spot-5');
  assert.equal(scene.pairedArt, true);
  assert.equal(scene.differences.length, 5);
  assert.equal(scene.colorEdits.length, 5);
  const centers = scene.differences.map(({ x, y }) => ({ x: x * 2.8, y: y * 2.1 }));
  for (const [index, center] of centers.entries()) {
    assert.ok(center.x >= 28 && center.x <= 252 && center.y >= 28 && center.y <= 182);
    for (const other of centers.slice(index + 1)) assert.equal(Math.abs(center.x - other.x) < 56 && Math.abs(center.y - other.y) < 56, false);
  }
});


test('Sound Safari five depicted-object targets stay separated and inside the minimum phone frame', () => {
  const scene = SPOT_DIFFERENCE_SCENES.find(({ id }) => id === 'spot-6');
  assert.equal(scene.pairedArt, true);
  assert.equal(scene.differences.length, 5);
  assert.equal(scene.aspectRatio, 1);
  const centers = scene.differences.map(({ x, y }) => ({ x: x * 2.8, y: y * 2.8 }));
  for (const [index, center] of centers.entries()) {
    assert.ok(center.x >= 28 && center.x <= 252 && center.y >= 28 && center.y <= 252);
    for (const other of centers.slice(index + 1)) assert.equal(Math.abs(center.x - other.x) < 56 && Math.abs(center.y - other.y) < 56, false);
  }
});


test('Pattern Parade landscape has five separated in-frame depicted-object targets', () => {
  const scene = SPOT_DIFFERENCE_SCENES.find(({ id }) => id === 'spot-7');
  assert.equal(scene.pairedArt, true);
  assert.equal(scene.differences.length, 5);
  const centers = scene.differences.map(({ x, y }) => ({ x: x * 2.8, y: y * 2.1 }));
  for (const [index, center] of centers.entries()) {
    assert.ok(center.x >= 28 && center.x <= 252 && center.y >= 28 && center.y <= 182);
    for (const other of centers.slice(index + 1)) assert.equal(Math.abs(center.x - other.x) < 56 && Math.abs(center.y - other.y) < 56, false);
  }
});


test('Time Observatory landscape has five reachable nonoverlapping depicted-object targets', () => {
  const scene = SPOT_DIFFERENCE_SCENES.find(({ id }) => id === 'spot-8');
  assert.equal(scene.pairedArt, true);
  assert.equal(scene.differences.length, 5);
  const centers = scene.differences.map(({ x, y }) => ({ x: x * 2.8, y: y * 2.1 }));
  for (const [index, center] of centers.entries()) {
    assert.ok(center.x >= 28 && center.x <= 252 && center.y >= 28 && center.y <= 182);
    for (const other of centers.slice(index + 1)) assert.equal(Math.abs(center.x - other.x) < 56 && Math.abs(center.y - other.y) < 56, false);
  }
});

test('World Explorer accepts taps on the pictured objects while keeping blank sky neutral', () => {
  const scene = SPOT_DIFFERENCE_SCENES.find(({ title }) => title === 'World Explorer');
  assert.equal(scene.aspectRatio, 1);
  assert.equal(scene.pairedArt, true);
  assert.equal(scene.editRegions.length + scene.colorEdits.length, 7);
  for (const [id, x, y] of [
    ['world-globe', 36, 27], ['world-telescope', 80, 44],
    ['world-binoculars', 88, 59], ['world-bridge', 46, 64],
    ['world-marker', 76, 71], ['world-magnifier', 23, 72],
    ['world-compass', 69, 85],
  ]) assert.equal(resolveSpotDifferenceTap(scene.differences, [], x, y).difference?.id, id);
  assert.equal(resolveSpotDifferenceTap(scene.differences, [], 65, 15).kind, 'miss');
});
