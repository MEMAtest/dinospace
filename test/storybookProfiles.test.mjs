import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STORYBOOK_PROGRESS_KEY,
  commitStoryCompletion,
  commitStoryProgress,
  getBookProgress,
  readActiveChildId,
  readStoryProgress,
  readStoryProgressState,
  saveActiveChildId,
  updateStoryProgress,
} from '../src/data/storybookProfiles.js';

const storage = () => {
  const values = new Map();
  return { values, getItem: (key) => values.has(key) ? values.get(key) : null, setItem: (key, value) => values.set(key, value) };
};

test('child story progress is isolated by child and contains no birth date', () => {
  const store = storage();
  saveActiveChildId('child-2', store);
  assert.equal(readActiveChildId(store), 'child-2');
  updateStoryProgress('child-1', 'book-a', { completed: true, favourite: true }, store);
  updateStoryProgress('child-2', 'book-a', { pageIndex: 4 }, store);
  const all = readStoryProgress(store);
  assert.deepEqual(getBookProgress(all, 'child-1', 'book-a').completed, true);
  assert.deepEqual(getBookProgress(all, 'child-2', 'book-a').pageIndex, 4);
  assert.equal(Object.keys(getBookProgress(all, 'child-1', 'book-a')).includes('birthDate'), false);
});

test('strict story progress commits preserve unknown book metadata and sibling readers', () => {
  const store = storage();
  const initial = {
    amari: { 'book-a': { pageIndex: 4, favourite: true, customNote: { 'future.note': 'keep', 'provider:flag': { 'x/y': true }, colour: 'blue' } } },
    'child-2': { 'book-b': { pageIndex: 2, completed: false, futureField: [1, 'two'] } },
  };
  store.setItem(STORYBOOK_PROGRESS_KEY, JSON.stringify(initial));
  const saved = commitStoryProgress('amari', 'book-a', { pageIndex: 5 }, store);
  assert.equal(saved.ok, true);
  assert.equal(saved.entry.pageIndex, 5);
  assert.deepEqual(saved.entry.customNote, { 'future.note': 'keep', 'provider:flag': { 'x/y': true }, colour: 'blue' });
  assert.equal(saved.progress['child-2']['book-b'].futureField[1], 'two');
  assert.deepEqual(saved.progress['child-2'], initial['child-2']);
});

test('malformed known fields and incomplete receipts fail closed and cannot create a completion reward', () => {
  const malformed = [
    { completed: 'yes' },
    { favourite: 1 },
    { pageIndex: -2 },
    { completed: false, completionReceipt: { id: 'old', points: 1, version: 1 } },
  ];
  for (const entry of malformed) {
    const store = storage();
    const raw = JSON.stringify({ amari: { 'book-a': entry } });
    store.setItem(STORYBOOK_PROGRESS_KEY, raw);
    const read = readStoryProgressState(store);
    assert.equal(read.ok, false);
    const result = commitStoryCompletion('amari', 'book-a', store);
    assert.equal(result.ok, false);
    assert.equal(result.receipt, null);
    assert.equal(store.getItem(STORYBOOK_PROGRESS_KEY), raw);
    assert.equal(store.getItem('amari_storybook_complete_book-a'), null);
  }
});

test('strict reads and writes fail closed on unavailable, blocked, empty, malformed and unverified storage', () => {
  assert.equal(readStoryProgressState(null).status, 'unavailable');
  const blockedRead = { getItem() { throw Error('denied'); }, setItem() { throw Error('must not write'); } };
  assert.equal(commitStoryProgress('amari', 'book-a', { pageIndex: 1 }, blockedRead).status, 'unreadable');

  for (const raw of ['', '{bad', '[]', '{"amari":{"book-a":false}}']) {
    const store = storage();
    store.setItem(STORYBOOK_PROGRESS_KEY, raw);
    const before = store.getItem(STORYBOOK_PROGRESS_KEY);
    const result = commitStoryProgress('amari', 'book-a', { pageIndex: 1 }, store);
    assert.equal(result.ok, false);
    assert.equal(store.getItem(STORYBOOK_PROGRESS_KEY), before);
  }

  const deniedWrite = { getItem() { return null; }, setItem() { throw Error('quota'); } };
  assert.equal(commitStoryProgress('amari', 'book-a', { pageIndex: 1 }, deniedWrite).status, 'write-failed');
  const noOpWrite = { getItem() { return null; }, setItem() {} };
  assert.equal(commitStoryProgress('amari', 'book-a', { pageIndex: 1 }, noOpWrite).status, 'readback-failed');
});

test('completion receipt survives a committed write with failed readback and retry returns the same receipt', () => {
  const backing = storage();
  let failReadback = false;
  const wrapper = {
    getItem(key) {
      if (key === STORYBOOK_PROGRESS_KEY && failReadback) { failReadback = false; throw Error('readback unavailable'); }
      return backing.getItem(key);
    },
    setItem(key, value) {
      backing.setItem(key, value);
      if (key === STORYBOOK_PROGRESS_KEY) failReadback = true;
    },
  };
  const failed = commitStoryCompletion('amari', 'moon-map', wrapper);
  assert.equal(failed.ok, false);
  assert.equal(failed.status, 'readback-failed');
  assert.equal(backing.getItem('amari_storybook_complete_moon-map'), null);

  const recovered = commitStoryCompletion('amari', 'moon-map', backing);
  assert.equal(recovered.ok, true);
  assert.equal(recovered.status, 'recovered');
  assert.equal(recovered.receipt.points, 1);
  assert.match(recovered.receipt.id, /^[a-zA-Z0-9:_-]{1,120}$/);
  assert.equal(backing.getItem('amari_storybook_complete_moon-map'), '1');
  assert.equal(commitStoryCompletion('amari', 'moon-map', backing).receipt.id, recovered.receipt.id);
});

test('completion receipt keeps its original outer reward player when reopened under another player', () => {
  const store = storage();
  const first = commitStoryCompletion('reader-profile-x', 'moon-map', store, { rewardPlayerId: 'amari' });
  assert.equal(first.ok, true);
  assert.equal(first.receipt.rewardPlayerId, 'amari');
  const reopened = commitStoryCompletion('reader-profile-x', 'moon-map', store, { rewardPlayerId: 'askia' });
  assert.equal(reopened.ok, true);
  assert.equal(reopened.status, 'recovered');
  assert.equal(reopened.receipt.id, first.receipt.id);
  assert.equal(reopened.receipt.rewardPlayerId, 'amari');
  assert.equal(Object.keys(reopened.progress).length, 1);

  const oldReceiptStore = storage();
  oldReceiptStore.setItem(STORYBOOK_PROGRESS_KEY, JSON.stringify({
    'reader-profile-x': { 'moon-map': { completed: true, completionReceipt: { id: 'old-receipt', points: 1, version: 1 } } },
  }));
  const oldReceipt = commitStoryCompletion('reader-profile-x', 'moon-map', oldReceiptStore, { rewardPlayerId: 'askia' });
  assert.equal(oldReceipt.ok, true);
  assert.equal(oldReceipt.receipt.rewardPlayerId, undefined);
  assert.equal(oldReceiptStore.getItem(STORYBOOK_PROGRESS_KEY).includes('"rewardPlayerId"'), false);
});

test('legacy story completion never creates a new reward receipt, and marker read failure never awards', () => {
  const legacyEntry = storage();
  legacyEntry.setItem(STORYBOOK_PROGRESS_KEY, JSON.stringify({ amari: { 'old-book': { completed: true, pageIndex: 10 } } }));
  const fromEntry = commitStoryCompletion('amari', 'old-book', legacyEntry);
  assert.equal(fromEntry.ok, true);
  assert.equal(fromEntry.status, 'legacy-complete');
  assert.equal(fromEntry.receipt, null);
  assert.equal(legacyEntry.getItem(STORYBOOK_PROGRESS_KEY).includes('completionReceipt'), false);

  const legacyMarker = storage();
  legacyMarker.setItem('amari_storybook_complete_old-book', '1');
  const fromMarker = commitStoryCompletion('amari', 'old-book', legacyMarker);
  assert.equal(fromMarker.status, 'legacy-complete');
  assert.equal(fromMarker.receipt, null);
  assert.equal(legacyMarker.getItem(STORYBOOK_PROGRESS_KEY), null);

  const failedMarkerRead = {
    getItem(key) { if (key === 'amari_storybook_complete_new-book') throw Error('marker unavailable'); return null; },
    setItem() { throw Error('must not write'); },
  };
  const failed = commitStoryCompletion('amari', 'new-book', failedMarkerRead);
  assert.equal(failed.ok, false);
  assert.equal(failed.receipt, null);
});
