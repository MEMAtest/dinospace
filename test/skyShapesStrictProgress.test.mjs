import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SKY_SHAPE_EPISODES,
  SKY_SHAPE_MISSION_BY_ID,
} from '../src/data/skyShapes.js';
import {
  SKY_SHAPES_PROGRESS_KEY,
  skyShapesProgressKey,
  readSkyShapesProgressStrict,
  rememberSkyMissionQueueStrict,
  recordSkyFlightCompletionStrict,
  pendingSkyShapesRewards,
  markSkyShapesRewardClaimedStrict,
} from '../src/data/skyShapesProgress.js';

const memoryStorage = (initial = {}) => {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, value); },
  };
};

const completeEpisode = (storage, playerId = 'amari', episodeIndex = 0, seedBase = 100) => {
  const episode = SKY_SHAPE_EPISODES[episodeIndex];
  return episode.missions.map((mission, index) => recordSkyFlightCompletionStrict(
    playerId, mission.id, 90, 2, seedBase + index, storage,
  ));
};

test('strict read treats only a missing key as fresh and fails closed on unavailable or malformed storage', () => {
  assert.deepEqual(readSkyShapesProgressStrict('amari', memoryStorage()).status, 'fresh');
  assert.equal(readSkyShapesProgressStrict('amari', null).ok, false);
  assert.equal(readSkyShapesProgressStrict('amari', { getItem: () => undefined }).ok, false);
  assert.equal(readSkyShapesProgressStrict('amari', { getItem: () => '' }).ok, false);
  assert.equal(readSkyShapesProgressStrict('amari', { getItem: () => '{bad' }).ok, false);
  assert.equal(readSkyShapesProgressStrict('amari', { getItem: () => JSON.stringify({ version: 9 }) }).ok, false);
  assert.equal(readSkyShapesProgressStrict('amari', { getItem: () => { throw new Error('denied'); } }).ok, false);
});

test('strict helper keeps the established child key, schema, and unknown metadata through writes', () => {
  const playerId = 'askia';
  const storage = memoryStorage({
    [skyShapesProgressKey(playerId)]: JSON.stringify({ version: 1, unlockedEpisode: 0, completedMissionIds: [], completedEpisodeIds: [], bestAccuracy: {}, bestMissionStars: {}, bestStars: {}, recentMissionIds: [], rewardReceipts: [], familyNote: { keep: true } }),
  });
  const mission = SKY_SHAPE_EPISODES[0].missions[0];
  const result = recordSkyFlightCompletionStrict(playerId, mission.id, 90, 2, 101, storage);
  assert.equal(result.ok, true);
  assert.equal(skyShapesProgressKey(playerId), `askia_${SKY_SHAPES_PROGRESS_KEY}`);
  assert.deepEqual(JSON.parse(storage.getItem(skyShapesProgressKey(playerId))).familyNote, { keep: true });
  assert.equal(JSON.parse(storage.getItem(skyShapesProgressKey(playerId))).version, 1);
});

test('queue and completion writes fail closed for null/read-only storage', () => {
  const mission = SKY_SHAPE_EPISODES[0].missions[0];
  const readOnly = { getItem: () => null };
  assert.equal(rememberSkyMissionQueueStrict('amari', [mission.id], null).ok, false);
  assert.equal(rememberSkyMissionQueueStrict('amari', [mission.id], readOnly).ok, false);
  assert.equal(recordSkyFlightCompletionStrict('amari', mission.id, 90, 2, 102, null).ok, false);
  assert.equal(recordSkyFlightCompletionStrict('amari', mission.id, 90, 2, 102, readOnly).ok, false);
});

test('write exceptions and committed-but-unconfirmed readback do not claim saved progress; retry recovers same receipt', () => {
  const mission = SKY_SHAPE_EPISODES[0].missions[0];
  const key = skyShapesProgressKey('amari');
  const denied = memoryStorage();
  denied.setItem = () => { throw new Error('quota'); };
  assert.equal(recordSkyFlightCompletionStrict('amari', mission.id, 90, 2, 103, denied).ok, false);

  const storage = memoryStorage();
  let hideNextReadback = true;
  let faultReadback = false;
  const setItem = storage.setItem.bind(storage);
  storage.getItem = (requestedKey) => {
    if (requestedKey === key && faultReadback && hideNextReadback) {
      hideNextReadback = false;
      faultReadback = false;
      return null;
    }
    return storage.values.has(requestedKey) ? storage.values.get(requestedKey) : null;
  };
  storage.setItem = (requestedKey, value) => {
    setItem(requestedKey, value);
    if (requestedKey === key && hideNextReadback) faultReadback = true;
  };
  const first = recordSkyFlightCompletionStrict('amari', mission.id, 90, 2, 104, storage);
  assert.equal(first.ok, false);
  assert.equal(storage.values.has(key), true, 'the simulated storage committed despite failed confirmation');
  const retry = recordSkyFlightCompletionStrict('amari', mission.id, 90, 2, 104, storage);
  assert.equal(retry.ok, true);
  assert.equal(retry.status, 'recovered');
  assert.equal(retry.receipt.id, `mission:${mission.id}:104`);
  assert.equal(retry.awardedStars, 2);
  assert.equal(storage.getItem(key), storage.values.get(key));
  assert.equal(typeof setItem, 'function');
});

test('a receipt already parent-confirmed does not appear as a new star award on same-seed recovery', () => {
  const storage = memoryStorage();
  const mission = SKY_SHAPE_EPISODES[0].missions[0];
  const first = recordSkyFlightCompletionStrict('amari', mission.id, 90, 2, 105, storage);
  assert.equal(first.ok, true);
  assert.equal(markSkyShapesRewardClaimedStrict('amari', first.receipt.id, storage).ok, true);
  const replay = recordSkyFlightCompletionStrict('amari', mission.id, 90, 2, 105, storage);
  assert.equal(replay.status, 'recovered');
  assert.equal(replay.awardedStars, 0);
  assert.deepEqual(replay.receipts, []);
});

test('mission and episode receipts are durable, deterministic, and parent marker readback gates unlock', () => {
  const storage = memoryStorage();
  const results = completeEpisode(storage);
  assert.ok(results.every((result) => result.ok));
  const latest = readSkyShapesProgressStrict('amari', storage);
  assert.equal(latest.ok, true);
  assert.deepEqual(latest.progress.completedEpisodeIds, [SKY_SHAPE_EPISODES[0].id]);
  assert.equal(latest.progress.unlockedEpisode, 0, 'episode unlock waits for the badge receipt marker');
  const pending = pendingSkyShapesRewards(latest.progress);
  assert.equal(pending.length, 5, 'four mission star receipts and one episode badge receipt');
  const episodeReceipt = pending.find(({ kind }) => kind === 'episode');
  assert.equal(episodeReceipt.id, 'episode:cloud-meadow:complete');
  assert.equal(episodeReceipt.rewardDelta, 2);
  const nextSkyMission = SKY_SHAPE_EPISODES[1].missions[0];
  assert.equal(recordSkyFlightCompletionStrict('amari', nextSkyMission.id, 90, 2, 500, storage).status, 'locked');
  assert.equal(rememberSkyMissionQueueStrict('amari', [nextSkyMission.id], storage).status, 'locked');
  const blockedMarker = markSkyShapesRewardClaimedStrict('amari', episodeReceipt.id, null);
  assert.equal(blockedMarker.ok, false);
  const marked = markSkyShapesRewardClaimedStrict('amari', episodeReceipt.id, storage);
  assert.equal(marked.ok, true);
  assert.equal(marked.progress.unlockedEpisode, 1);
  assert.equal(pendingSkyShapesRewards(marked.progress).some(({ id }) => id === episodeReceipt.id), false);
  const repeat = markSkyShapesRewardClaimedStrict('amari', episodeReceipt.id, storage);
  assert.equal(repeat.ok, true);
  assert.equal(repeat.status, 'already-claimed');
});

test('receipt marker write failure stays pending and committed-but-unconfirmed readback recovers idempotently', () => {
  const storage = memoryStorage();
  const [first] = completeEpisode(storage);
  const receipt = pendingSkyShapesRewards(first.progress)[0];
  const key = skyShapesProgressKey('amari');
  const noWrite = { getItem: storage.getItem.bind(storage), setItem: () => { throw new Error('denied'); } };
  assert.equal(markSkyShapesRewardClaimedStrict('amari', receipt.id, noWrite).ok, false);

  let mismatch = true;
  let faultReadback = false;
  const mismatchStorage = {
    setItem(requestedKey, value) {
      storage.setItem(requestedKey, value);
      if (requestedKey === key && mismatch) faultReadback = true;
    },
    getItem(requestedKey) {
      if (requestedKey === key && faultReadback) {
        faultReadback = false;
        mismatch = false;
        return null;
      }
      return storage.getItem(requestedKey);
    },
  };
  assert.equal(markSkyShapesRewardClaimedStrict('amari', receipt.id, mismatchStorage).ok, false);
  const persisted = readSkyShapesProgressStrict('amari', storage);
  assert.equal(persisted.progress.rewardReceipts.find(({ id }) => id === receipt.id).parentClaimed, true, 'storage committed but its immediate readback was withheld');
  assert.equal(markSkyShapesRewardClaimedStrict('amari', receipt.id, storage).status, 'already-claimed');
});

test('locked future episode queue and flight cannot change saved progress', () => {
  const storage = memoryStorage();
  const before = storage.getItem(skyShapesProgressKey('amari'));
  const locked = SKY_SHAPE_EPISODES[1].missions[0];
  assert.equal(rememberSkyMissionQueueStrict('amari', [locked.id], storage).status, 'locked');
  assert.equal(recordSkyFlightCompletionStrict('amari', locked.id, 95, 3, 777, storage).status, 'locked');
  assert.equal(storage.getItem(skyShapesProgressKey('amari')), before);
});

test('legacy high-water mission ratings earn no replay backpay, while a fully earned legacy sky unlocks without a new badge', () => {
  const episode = SKY_SHAPE_EPISODES[0];
  const key = skyShapesProgressKey('amari');
  const legacy = {
    version: 1, unlockedEpisode: 0,
    completedMissionIds: episode.missions.map(({ id }) => id),
    completedEpisodeIds: [], bestAccuracy: {}, bestMissionStars: {}, bestStars: {}, recentMissionIds: [], rewardReceipts: [],
    retained: 'keep',
  };
  const storage = memoryStorage({ [key]: JSON.stringify(legacy) });
  const replay = recordSkyFlightCompletionStrict('amari', episode.missions[0].id, 100, 3, 901, storage);
  assert.equal(replay.ok, true);
  assert.equal(replay.awardedStars, 0);
  assert.equal(replay.chapterBonusStars, 0);
  assert.equal(replay.progress.unlockedEpisode, 1);
  assert.equal(replay.progress.rewardReceipts.length, 0);
  assert.equal(replay.progress.retained, 'keep');
});

test('keyboard completion has null accuracy and cannot lower measured best accuracy or mission stars', () => {
  const storage = memoryStorage();
  const mission = SKY_SHAPE_EPISODES[0].missions[0];
  assert.equal(recordSkyFlightCompletionStrict('amari', mission.id, 97, 3, 200, storage).ok, true);
  const keyboard = recordSkyFlightCompletionStrict('amari', mission.id, null, 1, 201, storage);
  assert.equal(keyboard.ok, true);
  assert.equal(keyboard.attemptStars, 1);
  assert.equal(keyboard.progress.bestAccuracy[mission.id], 97);
  assert.equal(keyboard.progress.bestMissionStars[mission.id], 3);
  assert.equal(keyboard.awardedStars, 0);
});

test('invalid mission, seed, accuracy, or unsupported keyboard star values are rejected', () => {
  const mission = SKY_SHAPE_EPISODES[0].missions[0];
  for (const args of [
    ['no-such-mission', 90, 2, 1], [mission.id, 101, 2, 1], [mission.id, null, 2, 1],
    [mission.id, 90, 0, 1], [mission.id, null, 2, 1], [mission.id, 90, 2, 0], [mission.id, 90, 3, 2],
  ]) {
    assert.equal(recordSkyFlightCompletionStrict('amari', args[0], args[1], args[2], args[3], memoryStorage()).ok, false);
  }
  assert.equal(SKY_SHAPE_MISSION_BY_ID[mission.id].episodeId, SKY_SHAPE_EPISODES[0].id);
});
