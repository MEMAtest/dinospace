import test from 'node:test';
import assert from 'node:assert/strict';
import { commitPlayerReward, readPlayerRewards, rewardKey } from '../src/data/playerRewards.js';

const store = () => { const data = new Map(); return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }; };

test('an older tab awards against the latest saved total instead of overwriting stars and stickers', () => {
  const storage = store();
  storage.setItem('amari_points', '8');
  const olderTab = readPlayerRewards('amari', storage);
  commitPlayerReward('amari', olderTab, 3, 'addition', storage);
  const latest = commitPlayerReward('amari', olderTab, 2, 'subtraction', storage);
  assert.equal(latest.points, 13);
  assert.ok(latest.earnedStickerIds.length > 0);
  assert.deepEqual(latest.gamesPlayed, { addition: 1, subtraction: 1 });
  assert.deepEqual(readPlayerRewards('amari', storage), { version: 2, points: 13, earnedStickerIds: latest.earnedStickerIds, gamesPlayed: latest.gamesPlayed });
  assert.equal(storage.getItem('amari_points'), '13');
});

test('the single record restores all reward fields if legacy mirror writes fail', () => {
  const backing = store();
  const storage = { getItem: backing.getItem, setItem: (key, value) => {
    if (key !== rewardKey('askia')) throw new Error('Quota exceeded');
    backing.setItem(key, value);
  } };
  const saved = commitPlayerReward('askia', {}, 30, 'shadowmatch', storage);
  assert.equal(saved.persisted, true);
  assert.equal(readPlayerRewards('askia', storage).points, 30);
  assert.equal(readPlayerRewards('askia', storage).earnedStickerIds.length, 2);
  assert.equal(readPlayerRewards('amari', storage).points, 0);
});

test('failed authoritative writes are reported and retry preserves the in-memory reward without awarding twice', () => {
  const storage = store();
  const blocked = { getItem: storage.getItem, setItem: () => { throw new Error('blocked'); } };
  const failed = commitPlayerReward('amari', {}, 10, 'addition', blocked);
  assert.equal(failed.persisted, false);
  assert.equal(readPlayerRewards('amari', storage).points, 0);
  const retried = commitPlayerReward('amari', failed, 0, undefined, storage);
  assert.equal(retried.persisted, true);
  assert.equal(retried.points, 10);
  assert.deepEqual(retried.gamesPlayed, { addition: 1 });
});

test('migration preserves higher legacy totals and valid previously earned stickers without copying another child', () => {
  const storage = store();
  const first = commitPlayerReward('amari', {}, 25, 'addition', storage);
  storage.setItem('amari_points', '40');
  storage.setItem('amari_games_played', JSON.stringify({ addition: 8 }));
  const migrated = readPlayerRewards('amari', storage);
  assert.equal(migrated.points, 40);
  assert.equal(migrated.gamesPlayed.addition, 8);
  assert.ok(first.earnedStickerIds.every((id) => migrated.earnedStickerIds.includes(id)));
  assert.equal(readPlayerRewards('askia', storage).points, 0);
});
