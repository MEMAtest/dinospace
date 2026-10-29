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

const claim = (player, current, amount, game, storage, token) => commitPlayerReward(player, current, amount, game, storage, { rewardToken: token });

test('Pair7 reward claims pay once across remounts, stale tabs and later ordinary game rewards', () => {
  const storage = store();
  const stale = readPlayerRewards('amari', storage);
  const first = claim('amari', stale, 3, 'dino', storage, 'dino:jungle-run-1');
  assert.equal(first.persisted, true);
  assert.equal(first.awardedPoints, 3);
  const repeated = claim('amari', stale, 3, 'dino', storage, 'dino:jungle-run-1');
  assert.equal(repeated.points, 3);
  assert.equal(repeated.recovered, true);
  assert.equal(repeated.awardedPoints, 0);
  assert.equal(repeated.gamesPlayed.dino, 1);
  const ordinary = commitPlayerReward('amari', stale, 2, 'addition', storage);
  assert.equal(ordinary.rewardClaims['dino:jungle-run-1'], 3);
  const reopened = claim('amari', {}, 3, 'dino', storage, 'dino:jungle-run-1');
  assert.equal(reopened.points, 5);
  assert.deepEqual(reopened.gamesPlayed, { dino: 1, addition: 1 });
  const next = claim('amari', reopened, 6, 'hangman', storage, 'hangman:first-words-2');
  assert.equal(next.points, 11);
  assert.equal(readPlayerRewards('askia', storage).points, 0);
});

test('words stage claims recover quietly once and preserve Dino, Hangman and ordinary game rewards', () => {
  const storage = store();
  const stale = readPlayerRewards('amari', storage);
  const first = claim('amari', stale, 4, 'words', storage, 'words:stage-2-run');
  assert.equal(first.persisted, true);
  assert.equal(first.awardedPoints, 4);
  assert.equal(first.gamesPlayed.words, 1);
  const repeated = claim('amari', stale, 4, 'words', storage, 'words:stage-2-run');
  assert.equal(repeated.persisted, true);
  assert.equal(repeated.recovered, true);
  assert.equal(repeated.awardedPoints, 0);
  assert.equal(repeated.gamesPlayed.words, 1);
  const dino = claim('amari', repeated, 3, 'dino', storage, 'dino:already-earned');
  const hangman = claim('amari', dino, 2, 'hangman', storage, 'hangman:already-earned');
  const ordinary = commitPlayerReward('amari', stale, 1, 'addition', storage);
  assert.equal(ordinary.points, 10);
  assert.deepEqual(ordinary.gamesPlayed, { words: 1, dino: 1, hangman: 1, addition: 1 });
  assert.equal(ordinary.rewardClaims['words:stage-2-run'], 4);
  assert.equal(ordinary.rewardClaims['dino:already-earned'], 3);
  assert.equal(ordinary.rewardClaims['hangman:already-earned'], 2);
  assert.equal(readPlayerRewards('askia', storage).points, 0);
  assert.equal(hangman.points, 9);
});

test('storybook completion claims accept only storybooks tokens and stay idempotent alongside existing claims', () => {
  const storage = store();
  const dino = claim('amari', readPlayerRewards('amari', storage), 3, 'dino', storage, 'dino:world-1');
  const story = claim('amari', dino, 1, 'storybooks', storage, 'storybooks:storybook-child-1-moon-map');
  assert.equal(story.persisted, true);
  assert.equal(story.points, 4);
  assert.equal(story.gamesPlayed.storybooks, 1);
  const replay = claim('amari', story, 1, 'storybooks', storage, 'storybooks:storybook-child-1-moon-map');
  assert.equal(replay.persisted, true);
  assert.equal(replay.recovered, true);
  assert.equal(replay.awardedPoints, 0);
  assert.equal(replay.gamesPlayed.storybooks, 1);
  assert.equal(replay.rewardClaims['dino:world-1'], 3);
  assert.equal(replay.rewardClaims['storybooks:storybook-child-1-moon-map'], 1);
  assert.equal(claim('amari', replay, 1, 'storybooks', storage, 'words:wrong-scope').persisted, false);
  assert.equal(readPlayerRewards('askia', storage).points, 0);
});

test('a committed words claim with failed readback quietly recovers without a second play', () => {
  const backing = store();
  let throwNextRead = false;
  const storage = {
    getItem(key) { if (key === rewardKey('amari') && throwNextRead) { throwNextRead = false; throw Error('temporary readback failure'); } return backing.getItem(key); },
    setItem(key, value) { backing.setItem(key, value); if (key === rewardKey('amari')) throwNextRead = true; },
  };
  const failed = claim('amari', {}, 6, 'words', storage, 'words:stage-6-run');
  assert.equal(failed.persisted, false);
  assert.equal(failed.awardedPoints, 0);
  const recovered = claim('amari', readPlayerRewards('amari', backing), 6, 'words', backing, 'words:stage-6-run');
  assert.equal(recovered.persisted, true);
  assert.equal(recovered.recovered, true);
  assert.equal(recovered.awardedPoints, 0);
  assert.equal(recovered.gamesPlayed.words, 1);
  assert.equal(recovered.points, 6);
});

test('a committed reward with failed readback recovers after a fresh read without duplicate points or plays', () => {
  const backing = store();
  let throwNextRead = false;
  const storage = {
    getItem(key) { if (key === rewardKey('amari') && throwNextRead) { throwNextRead = false; throw Error('temporary readback failure'); } return backing.getItem(key); },
    setItem(key, value) { backing.setItem(key, value); if (key === rewardKey('amari')) throwNextRead = true; },
  };
  const failed = claim('amari', {}, 6, 'hangman', storage, 'hangman:committed-1');
  assert.equal(failed.persisted, false);
  assert.equal(failed.awardedPoints, 0);
  assert.equal(failed.points, 0);
  const reopened = readPlayerRewards('amari', backing);
  assert.equal(reopened.points, 6);
  const recovered = claim('amari', reopened, 6, 'hangman', backing, 'hangman:committed-1');
  assert.equal(recovered.persisted, true);
  assert.equal(recovered.recovered, true);
  assert.equal(recovered.awardedPoints, 0);
  assert.equal(recovered.points, 6);
  assert.deepEqual(recovered.gamesPlayed, { hangman: 1 });
  assert.equal(backing.getItem('amari_points'), '6');
});

test('blocked claim writes hold the old reward and retry the same claim exactly once', () => {
  const storage = store();
  const blocked = { getItem: storage.getItem, setItem() { throw Error('quota'); } };
  const failed = claim('askia', {}, 2, 'dino', blocked, 'dino:quota-run');
  assert.equal(failed.persisted, false);
  assert.equal(failed.points, 0);
  assert.equal(failed.rewardClaims, undefined);
  const retry = claim('askia', failed, 2, 'dino', storage, 'dino:quota-run');
  assert.equal(retry.awardedPoints, 2);
  assert.equal(claim('askia', retry, 2, 'dino', storage, 'dino:quota-run').points, 2);
});

test('claimed rewards preserve malformed or unreadable authoritative and legacy data without writes', () => {
  for (const [key, value] of [[rewardKey('amari'), ''], [rewardKey('amari'), '{bad'], [rewardKey('amari'), '{"version":2,"points":"8"}'], ['amari_games_played', '[]'], ['amari_points', '"8"']]) {
    const storage = store(); storage.setItem(key, value); let writes = 0;
    const guarded = { getItem: storage.getItem, setItem() { writes += 1; } };
    const result = claim('amari', {}, 3, 'dino', guarded, 'dino:invalid-storage');
    assert.equal(result.persisted, false, key);
    assert.equal(writes, 0, key);
    assert.equal(storage.getItem(key), value, key);
  }
  let writes = 0;
  const inaccessible = { getItem() { throw Error('blocked'); }, setItem() { writes += 1; } };
  assert.equal(claim('amari', {}, 3, 'dino', inaccessible, 'dino:unreadable').persisted, false);
  assert.equal(writes, 0);
});

test('claim scope and amount mismatches are rejected, while valid unknown metadata and other children survive', () => {
  const storage = store();
  storage.setItem(rewardKey('amari'), JSON.stringify({ version: 2, points: 8, gamesPlayed: { memory: 2 }, earnedStickerIds: [], futureMetadata: { keep: true } }));
  storage.setItem(rewardKey('askia'), '{"untouched":true}');
  const before = storage.getItem(rewardKey('amari'));
  assert.equal(claim('amari', {}, 3, 'addition', storage, 'dino:wrong-game').persisted, false);
  assert.equal(claim('amari', {}, 3, 'words', storage, 'dino:wrong-game').persisted, false);
  assert.equal(claim('amari', {}, 3, 'words', storage, 'hangman:wrong-prefix').persisted, false);
  assert.equal(storage.getItem(rewardKey('amari')), before);
  const first = claim('amari', {}, 3, 'dino', storage, 'dino:valid-run');
  assert.equal(first.points, 11);
  assert.deepEqual(JSON.parse(storage.getItem(rewardKey('amari'))).futureMetadata, { keep: true });
  const committed = storage.getItem(rewardKey('amari'));
  assert.equal(claim('amari', {}, 2, 'dino', storage, 'dino:valid-run').persisted, false);
  assert.equal(storage.getItem(rewardKey('amari')), committed);
  assert.equal(storage.getItem(rewardKey('askia')), '{"untouched":true}');
});

test('retained historical claims do not strand a new saved result at an arbitrary capacity boundary', () => {
  const storage = store();
  const rewardClaims = Object.fromEntries(Array.from({ length: 300 }, (_, index) => [`dino:retained-${index}`, 1]));
  storage.setItem(rewardKey('amari'), JSON.stringify({ version: 2, points: 300, gamesPlayed: { dino: 300 }, earnedStickerIds: [], rewardClaims }));
  const saved = claim('amari', {}, 3, 'dino', storage, 'dino:next-result');
  assert.equal(saved.persisted, true);
  assert.equal(saved.points, 303);
  assert.equal(Object.keys(saved.rewardClaims).length, 301);
  assert.equal(claim('amari', {}, 3, 'dino', storage, 'dino:next-result').points, 303);
  assert.equal(saved.rewardClaims['dino:retained-0'], 1);
});


test('full Chess and Dino Jigsaw claims retry committed writes without replay or sibling loss', () => {
  for (const [game, amount] of [['chess', 1], ['dinojigsaw', 8]]) {
    const backing = store();
    const prior = claim('amari', {}, 6, 'words', backing, 'words:previous-proof');
    backing.setItem('askia_rewards_v2', JSON.stringify({ version:2, points:19, gamesPlayed:{shadowmatch:2}, earnedStickerIds:['rocket'], familyTag:'untouched' }));
    const sibling = backing.getItem('askia_rewards_v2');
    const previous = JSON.parse(backing.getItem(rewardKey('amari')));
    backing.setItem(rewardKey('amari'), JSON.stringify({ ...previous, parentNote: 'keep me' }));
    let committed = false;
    let failReadback = true;
    const flaky = {
      getItem(key) { if (key === rewardKey('amari') && committed && failReadback) { failReadback = false; throw Error('readback blocked'); } return backing.getItem(key); },
      setItem(key, value) { backing.setItem(key, value); if (key === rewardKey('amari')) committed = true; },
    };
    const token = `${game}:stable-completion-1`;
    const failed = claim('amari', prior, amount, game, flaky, token);
    assert.equal(failed.persisted, false);
    assert.equal(JSON.parse(backing.getItem(rewardKey('amari'))).rewardClaims[token], amount);
    const recovered = claim('amari', readPlayerRewards('amari', backing), amount, game, backing, token);
    assert.equal(recovered.persisted, true);
    assert.equal(recovered.awardedPoints, 0);
    assert.equal(recovered.points, 6 + amount);
    assert.equal(recovered.gamesPlayed[game], 1);
    assert.equal(recovered.gamesPlayed.words, 1);
    assert.equal(recovered.rewardClaims['words:previous-proof'], 6);
    assert.equal(JSON.parse(backing.getItem(rewardKey('amari'))).parentNote, 'keep me');
    assert.equal(backing.getItem('askia_rewards_v2'), sibling);
    assert.equal(claim('amari', recovered, amount, game, backing, token).awardedPoints, 0);
    assert.equal(claim('amari', recovered, amount, game, backing, 'words:wrong-scope').persisted, false);
  }
});
