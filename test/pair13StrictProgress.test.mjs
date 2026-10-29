import assert from 'node:assert/strict';
import test from 'node:test';
import {
  completePuzzlePopSceneStrict,
  getPuzzlePopPendingChapterReceiptsStrict,
  getPuzzlePopProgressStrict,
  markPuzzlePopChapterReceiptClaimedStrict,
  PUZZLE_POP_CHAPTERS,
  PUZZLE_POP_PROGRESS_KEY,
  savePuzzlePopQueueStrict,
} from '../src/data/puzzlePopBatch2.js';
import {
  completeSpotDifferenceSceneStrict,
  getSpotDifferencePendingChapterReceiptsStrict,
  getSpotDifferenceProgressStrict,
  markSpotDifferenceChapterReceiptClaimedStrict,
  saveSpotDifferenceQueueStrict,
  SPOT_DIFFERENCE_CHAPTERS,
  SPOT_DIFFERENCE_PROGRESS_KEY,
  SPOT_DIFFERENCE_SCENES,
} from '../src/data/spotDifferenceBatch2.js';

const memoryStorage = (initial = {}) => {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    raw: (key) => values.get(key),
  };
};

const failingStorage = (key, raw, mode) => {
  let writes = 0;
  return {
    getItem: () => raw,
    setItem: (_key, value) => {
      writes += 1;
      if (mode === 'throw-before') throw new Error('blocked');
      raw = mode === 'mismatch' ? `${value} ` : String(value);
      if (mode === 'throw-after') throw new Error('committed then interrupted');
    },
    get writes() { return writes; },
    get raw() { return raw; },
    key,
  };
};

const scenesFor = (chapters, index, allScenes) => {
  const chapter = chapters[index];
  return allScenes.filter(({ chapterId, chapterIndex }) => chapterId === chapter?.id || chapterIndex === index);
};

test('Puzzle strict storage treats only null as fresh and preserves malformed bytes without writes', () => {
  const malformed = memoryStorage({ [PUZZLE_POP_PROGRESS_KEY]: '{bad' });
  assert.equal(getPuzzlePopProgressStrict('Amari', malformed).ok, false);
  assert.equal(malformed.raw(PUZZLE_POP_PROGRESS_KEY), '{bad');
  assert.equal(savePuzzlePopQueueStrict('Amari', PUZZLE_POP_CHAPTERS[0].scenes, { getItem: () => undefined, setItem: () => assert.fail('must not write') }).ok, false);
  assert.deepEqual(getPuzzlePopProgressStrict('Amari', memoryStorage()).progress.completedSceneIds, []);
});

test('Puzzle queue and scene writes preserve unknown metadata, siblings, and confirm exact readback', () => {
  const storage = memoryStorage({ [PUZZLE_POP_PROGRESS_KEY]: JSON.stringify({ version: 1, ownerNote: 'keep', children: { Amari: { custom: { keep: true } }, Askia: { unlockedChapter: 0, familyNote: 'keep' } } }) });
  const queue = PUZZLE_POP_CHAPTERS[0].scenes;
  assert.equal(savePuzzlePopQueueStrict('Amari', queue, storage).ok, true);
  const completed = completePuzzlePopSceneStrict('Amari', 0, queue[0].id, storage);
  assert.equal(completed.ok, true);
  const saved = JSON.parse(storage.raw(PUZZLE_POP_PROGRESS_KEY));
  assert.equal(saved.ownerNote, 'keep');
  assert.deepEqual(saved.children.Amari.custom, { keep: true });
  assert.equal(saved.children.Askia.familyNote, 'keep');
  assert.deepEqual(saved.children.Amari.lastSceneQueue, queue.map(({ id }) => id));
  const mismatch = failingStorage(PUZZLE_POP_PROGRESS_KEY, null, 'mismatch');
  assert.equal(savePuzzlePopQueueStrict('Amari', queue, mismatch).error, 'readback');
});

test('Puzzle chapter receipt is created once, survives retry/reopen, and is claimed only after parent confirmation', () => {
  const storage = memoryStorage();
  const scenes = PUZZLE_POP_CHAPTERS[0].scenes;
  scenes.slice(0, 3).forEach(({ id }) => assert.equal(completePuzzlePopSceneStrict('Amari', 0, id, storage).receipt, null));
  const final = completePuzzlePopSceneStrict('Amari', 0, scenes[3].id, storage);
  assert.deepEqual(final.receipt, { id: 'starter:complete', rewardDelta: 2, claimed: false });
  assert.deepEqual(getPuzzlePopPendingChapterReceiptsStrict('Amari', storage).receipts, [final.receipt]);
  assert.deepEqual(completePuzzlePopSceneStrict('Amari', 0, scenes[3].id, storage).receipt, final.receipt);
  assert.equal(markPuzzlePopChapterReceiptClaimedStrict('Amari', final.receipt.id, storage).ok, true);
  assert.deepEqual(getPuzzlePopPendingChapterReceiptsStrict('Amari', storage).receipts, []);
  assert.deepEqual(getPuzzlePopPendingChapterReceiptsStrict('Askia', storage).receipts, []);
});

test('Puzzle legacy-complete chapters do not receive backpay and failed writes retain a stable retriable completion', () => {
  const chapter = PUZZLE_POP_CHAPTERS[0];
  const storage = memoryStorage({ [PUZZLE_POP_PROGRESS_KEY]: JSON.stringify({ version: 1, children: { Amari: { completedSceneIds: chapter.scenes.map(({ id }) => id), unlockedChapter: 1 } } }) });
  assert.equal(completePuzzlePopSceneStrict('Amari', 0, chapter.scenes[0].id, storage).receipt, null);
  const failing = failingStorage(PUZZLE_POP_PROGRESS_KEY, null, 'throw-before');
  assert.equal(completePuzzlePopSceneStrict('Amari', 0, chapter.scenes[0].id, failing).ok, false);
  const committed = failingStorage(PUZZLE_POP_PROGRESS_KEY, null, 'throw-after');
  const saved = completePuzzlePopSceneStrict('Amari', 0, chapter.scenes[0].id, committed);
  assert.equal(saved.ok, true);
});

test('Spot strict storage preserves the original malformed record and blocks writes on non-string reads', () => {
  const malformed = memoryStorage({ [SPOT_DIFFERENCE_PROGRESS_KEY]: '{bad' });
  assert.equal(getSpotDifferenceProgressStrict('Amari', malformed).ok, false);
  assert.equal(malformed.raw(SPOT_DIFFERENCE_PROGRESS_KEY), '{bad');
  const invalid = { getItem: () => undefined, setItem: () => assert.fail('must not write') };
  assert.equal(saveSpotDifferenceQueueStrict('Amari', [], invalid).ok, false);
  assert.deepEqual(getSpotDifferenceProgressStrict('Amari', memoryStorage()).progress.completedSceneIds, []);
});

test('Spot queue and scene saves preserve unknown and sibling records and reject mismatched readback', () => {
  const storage = memoryStorage({ [SPOT_DIFFERENCE_PROGRESS_KEY]: JSON.stringify({ version: 1, note: 'keep', children: { Amari: { custom: 9 }, Askia: { unlockedChapter: 0, custom: 10 } } }) });
  const scenes = scenesFor(SPOT_DIFFERENCE_CHAPTERS, 0, SPOT_DIFFERENCE_SCENES);
  assert.equal(saveSpotDifferenceQueueStrict('Amari', scenes, storage).ok, true);
  assert.equal(completeSpotDifferenceSceneStrict('Amari', 0, scenes[0].id, storage).ok, true);
  const saved = JSON.parse(storage.raw(SPOT_DIFFERENCE_PROGRESS_KEY));
  assert.equal(saved.note, 'keep');
  assert.equal(saved.children.Amari.custom, 9);
  assert.equal(saved.children.Askia.custom, 10);
  assert.deepEqual(saved.children.Amari.lastQueue, scenes.map(({ id }) => id));
  const mismatch = failingStorage(SPOT_DIFFERENCE_PROGRESS_KEY, null, 'mismatch');
  assert.equal(saveSpotDifferenceQueueStrict('Amari', scenes, mismatch).error, 'readback');
});

test('Spot receipt appears only on first complete chapter transition and survives parent-claim retry', () => {
  const storage = memoryStorage();
  const scenes = scenesFor(SPOT_DIFFERENCE_CHAPTERS, 0, SPOT_DIFFERENCE_SCENES);
  scenes.slice(0, 3).forEach(({ id }) => assert.equal(completeSpotDifferenceSceneStrict('Amari', 0, id, storage).receipt, null));
  const final = completeSpotDifferenceSceneStrict('Amari', 0, scenes[3].id, storage);
  assert.deepEqual(final.receipt, { id: 'starter:complete', rewardDelta: 2, claimed: false });
  assert.deepEqual(getSpotDifferencePendingChapterReceiptsStrict('Amari', storage).receipts, [final.receipt]);
  assert.deepEqual(completeSpotDifferenceSceneStrict('Amari', 0, scenes[3].id, storage).receipt, final.receipt);
  assert.equal(markSpotDifferenceChapterReceiptClaimedStrict('Amari', final.receipt.id, storage).ok, true);
  assert.deepEqual(getSpotDifferencePendingChapterReceiptsStrict('Amari', storage).receipts, []);
  assert.deepEqual(getSpotDifferencePendingChapterReceiptsStrict('Askia', storage).receipts, []);
});

test('Spot complete legacy chapter has no backpay and malformed receipt metadata cannot be overwritten', () => {
  const scenes = scenesFor(SPOT_DIFFERENCE_CHAPTERS, 0, SPOT_DIFFERENCE_SCENES);
  const legacy = memoryStorage({ [SPOT_DIFFERENCE_PROGRESS_KEY]: JSON.stringify({ version: 1, children: { Amari: { completedSceneIds: scenes.map(({ id }) => id), unlockedChapter: 1 } } }) });
  assert.equal(completeSpotDifferenceSceneStrict('Amari', 0, scenes[0].id, legacy).receipt, null);
  const bad = memoryStorage({ [SPOT_DIFFERENCE_PROGRESS_KEY]: JSON.stringify({ version: 1, children: { Amari: { chapterReceipts: { starter: { id: 'wrong', rewardDelta: 2, claimed: false } } } } }) });
  assert.equal(completeSpotDifferenceSceneStrict('Amari', 0, scenes[0].id, bad).ok, false);
  assert.equal(JSON.parse(bad.raw(SPOT_DIFFERENCE_PROGRESS_KEY)).children.Amari.chapterReceipts.starter.id, 'wrong');
});

test('Locked picture chapters cannot enqueue or commit scenes and leave storage untouched', () => {
  for (const game of ['puzzle', 'spot']) {
    const storage = memoryStorage();
    const scenes = game === 'puzzle' ? PUZZLE_POP_CHAPTERS[1].scenes : SPOT_DIFFERENCE_SCENES.filter(scene => scene.chapterIndex === 1);
    const queue = game === 'puzzle' ? savePuzzlePopQueueStrict('amari', scenes, storage) : saveSpotDifferenceQueueStrict('amari', scenes, storage);
    const commit = game === 'puzzle' ? completePuzzlePopSceneStrict('amari', 1, scenes[0].id, storage) : completeSpotDifferenceSceneStrict('amari', 1, scenes[0].id, storage);
    assert.equal(queue.ok, false); assert.equal(queue.error, 'locked');
    assert.equal(commit.ok, false); assert.equal(commit.error, 'locked');
    assert.equal(storage.raw(game === 'puzzle' ? PUZZLE_POP_PROGRESS_KEY : SPOT_DIFFERENCE_PROGRESS_KEY), undefined);
  }
});

test('A receipt without its completed picture set is unreadable and cannot award or replace original bytes', () => {
  for (const game of ['puzzle', 'spot']) {
    const key = game === 'puzzle' ? PUZZLE_POP_PROGRESS_KEY : SPOT_DIFFERENCE_PROGRESS_KEY;
    const raw = JSON.stringify({ version:1, children:{ amari:{ unlockedChapter:0, completedSceneIds:[], chapterReceipts:{starter:{id:'starter:complete',rewardDelta:2,claimed:false}} } } });
    const storage = memoryStorage({[key]:raw});
    const read = game === 'puzzle' ? getPuzzlePopProgressStrict('amari', storage) : getSpotDifferenceProgressStrict('amari', storage);
    const pending = game === 'puzzle' ? getPuzzlePopPendingChapterReceiptsStrict('amari', storage) : getSpotDifferencePendingChapterReceiptsStrict('amari', storage);
    assert.equal(read.ok,false); assert.equal(pending.ok,false); assert.equal(storage.raw(key),raw);
  }
});
