import test from 'node:test';
import assert from 'node:assert/strict';
import { COLOUR_LAB_MISSIONS } from '../src/data/colourLabAdventure.js';
import {
  COLOUR_LAB_PROGRESS_KEY, colourLabProgressKey, completeColourMissionStrict,
  getColourLabPendingRewardsStrict, markColourMissionReceiptClaimedStrict, readColourLabProgressStrict,
} from '../src/data/colourLabProgress.js';

const memory = (initial = null) => {
  const values = new Map(initial ? [[`${COLOUR_LAB_PROGRESS_KEY}:player`, initial]] : []);
  return {
    values,
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, value); },
  };
};
const paint = (lab) => COLOUR_LAB_MISSIONS.filter((mission) => mission.lab === lab);

test('strict progress distinguishes a missing record from unavailable, malformed and explicit-null known data', () => {
  assert.equal(readColourLabProgressStrict('player', memory()).status, 'fresh');
  assert.equal(readColourLabProgressStrict('player', null).ok, false);
  const invalid = [
    '{bad json',
    JSON.stringify({ version: 2, completed: [] }),
    JSON.stringify({ version: 1, completed: null }),
    JSON.stringify({ version: 1, chapters: ['mix'], completed: [] }),
    JSON.stringify({ version: 1, completed: ['not-a-mission'] }),
    JSON.stringify({ version: 1, completed: ['make-sun'] }),
    JSON.stringify({ version: 1, completed: ['mix-orange'], rewardReceipts: { 'mix-orange:complete': { id: 'mix-orange:complete', missionId: 'mix-orange', chapterId: 'mix', rewardDelta: 2, claimed: false } } }),
  ];
  for (const raw of invalid) assert.equal(readColourLabProgressStrict('player', memory(raw)).ok, false, raw);
  const readOnly = { getItem: () => null };
  assert.equal(completeColourMissionStrict('player', 'mix-orange', 'mix', paint('mix').map(({ id }) => id), readOnly).ok, false);
});

test('strict completion retains unknown metadata and uses the existing child-scoped key', () => {
  const storage = memory(JSON.stringify({ version: 1, completed: [], chapters: [], recentMissionIds: [], favoritePaint: 'Blue', nested: { kept: true } }));
  const result = completeColourMissionStrict('player', 'mix-orange', 'mix', paint('mix').map(({ id }) => id), storage);
  assert.equal(result.ok, true);
  assert.equal(storage.values.has('amari_colour_lab_adventure_v1:player'), true);
  assert.equal(colourLabProgressKey('player'), 'amari_colour_lab_adventure_v1:player');
  const raw = JSON.parse(storage.getItem(colourLabProgressKey('player')));
  assert.equal(raw.favoritePaint, 'Blue');
  assert.deepEqual(raw.nested, { kept: true });
  assert.deepEqual(raw.completed, ['mix-orange']);
});

test('locked labs and mismatched mission lists are rejected without changing saved bytes', () => {
  const storage = memory();
  const key = colourLabProgressKey('player');
  const locked = completeColourMissionStrict('player', 'light-pink', 'light', paint('light').map(({ id }) => id), storage);
  assert.equal(locked.status, 'locked');
  assert.equal(storage.getItem(key), null);
  const mismatched = completeColourMissionStrict('player', 'mix-orange', 'mix', ['mix-orange'], storage);
  assert.equal(mismatched.ok, false);
  assert.equal(storage.getItem(key), null);
});

test('storage throw and silent write/readback mismatch do not report a saved answer', () => {
  const queue = paint('mix').map(({ id }) => id);
  const throwing = { getItem: () => null, setItem: () => { throw new Error('blocked'); } };
  assert.equal(completeColourMissionStrict('player', 'mix-orange', 'mix', queue, throwing).ok, false);
  const silent = { getItem: () => null, setItem: () => {} };
  assert.equal(completeColourMissionStrict('player', 'mix-orange', 'mix', queue, silent).ok, false);
  const oneShotReadback = memory();
  const originalGet = oneShotReadback.getItem.bind(oneShotReadback);
  let writes = 0;
  oneShotReadback.setItem = (key, value) => { writes += 1; originalGet(key); oneShotReadback.values.set(key, value); };
  oneShotReadback.getItem = (key) => writes === 1 ? 'not-the-write' : originalGet(key);
  assert.equal(completeColourMissionStrict('player', 'mix-orange', 'mix', queue, oneShotReadback).ok, false);
});

test('new mission creates one deterministic positive receipt; replay and legacy completion earn no backpay', () => {
  const storage = memory();
  const ids = paint('mix').map(({ id }) => id);
  const first = completeColourMissionStrict('player', 'mix-orange', 'mix', ids, storage);
  assert.equal(first.newlyCompleted, true);
  assert.deepEqual(first.receipt, { id: 'mix-orange:complete', missionId: 'mix-orange', chapterId: 'mix', rewardDelta: 1, claimed: false });
  const replay = completeColourMissionStrict('player', 'mix-orange', 'mix', ids, storage);
  assert.equal(replay.newlyCompleted, false);
  assert.equal(replay.receipt.id, first.receipt.id);
  const legacy = memory(JSON.stringify({ version: 1, completed: ['mix-green'], chapters: [], recentMissionIds: [] }));
  const legacyReplay = completeColourMissionStrict('player', 'mix-green', 'mix', ids, legacy);
  assert.equal(legacyReplay.newlyCompleted, false);
  assert.equal(legacyReplay.receipt, null);
  assert.deepEqual(getColourLabPendingRewardsStrict('player', storage).receipts.map(({ id }) => [id]), [['mix-orange:complete']]);
});

test('pending parent claim survives marker failure and retries the same receipt exactly once', () => {
  const storage = memory();
  const ids = paint('mix').map(({ id }) => id);
  const completed = completeColourMissionStrict('player', 'mix-orange', 'mix', ids, storage);
  assert.equal(completed.ok, true);
  const pending = getColourLabPendingRewardsStrict('player', storage);
  assert.equal(pending.receipts[0].id, 'mix-orange:complete');
  const set = storage.setItem.bind(storage);
  let failMarker = true;
  storage.setItem = (key, value) => {
    if (failMarker && JSON.parse(value).rewardReceipts?.['mix-orange:complete']?.claimed) throw new Error('marker blocked');
    set(key, value);
  };
  assert.equal(markColourMissionReceiptClaimedStrict('player', 'mix-orange:complete', storage).ok, false);
  assert.equal(getColourLabPendingRewardsStrict('player', storage).receipts.length, 1);
  failMarker = false;
  assert.equal(markColourMissionReceiptClaimedStrict('player', 'mix-orange:complete', storage).ok, true);
  assert.equal(getColourLabPendingRewardsStrict('player', storage).receipts.length, 0);
  assert.equal(markColourMissionReceiptClaimedStrict('player', 'mix-orange:complete', storage).status, 'already-claimed');
});

test('each lab has six missions and only contiguous completed labs unlock the next lab', () => {
  const storage = memory();
  const key = colourLabProgressKey('player');
  for (const mission of paint('mix')) assert.equal(completeColourMissionStrict('player', mission.id, 'mix', paint('mix').map(({ id }) => id), storage).ok, true);
  assert.deepEqual(readColourLabProgressStrict('player', storage).progress.chapters, ['mix']);
  assert.equal(completeColourMissionStrict('player', 'light-pink', 'light', paint('light').map(({ id }) => id), storage).ok, true);
  for (const mission of paint('light').slice(1)) assert.equal(completeColourMissionStrict('player', mission.id, 'light', paint('light').map(({ id }) => id), storage).ok, true);
  assert.deepEqual(readColourLabProgressStrict('player', storage).progress.chapters, ['mix', 'light']);
  for (const lab of ['mix', 'light', 'make']) assert.equal(paint(lab).length, 6);
});
