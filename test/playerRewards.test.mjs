import test from 'node:test';
import assert from 'node:assert/strict';
import { commitPlayerReward, readPlayerRewards, rewardClaimToken, rewardKey } from '../src/data/playerRewards.js';

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


test('opted-in game claims retry committed writes without replay or sibling loss', () => {
  for (const [game, amount] of [['chess', 1], ['dinojigsaw', 8], ['german', 1], ['worldmap', 1], ['letters', 1], ['puzzle', 2], ['spot', 2], ['jet', 5], ['math', 3], ['counting', 3], ['addition', 3], ['subtraction', 3], ['numberline', 3], ['timeteller', 3], ['phonics', 2]]) {
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
    const token = rewardClaimToken(game, 'stable-completion-1');
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

test('new game claims survive the previous public decoder and an older open-tab reward write', () => {
  const storage = store();
  const chessToken = rewardClaimToken('chess', 'compat-game');
  const jigsawToken = rewardClaimToken('dinojigsaw', 'little:compat-puzzle');
  const chess = claim('amari', {}, 1, 'chess', storage, chessToken);
  const jigsaw = claim('amari', chess, 8, 'dinojigsaw', storage, jigsawToken);
  // Fixed compatibility contract from the retained c5 public decoder, rather
  // than this module's wider validator. An older ordinary reward write keeps
  // only these claim namespaces while advancing its own points/game count.
  const previousDecoder = /^(dino|hangman|words|storybooks):[a-z0-9:_-]{1,160}$/i;
  const olderWrite = {
    ...JSON.parse(storage.getItem(rewardKey('amari'))),
    points: jigsaw.points + 2,
    gamesPlayed: { ...jigsaw.gamesPlayed, addition: 1 },
    rewardClaims: Object.fromEntries(Object.entries(jigsaw.rewardClaims).filter(([key]) => previousDecoder.test(key))),
  };
  assert.deepEqual(Object.keys(olderWrite.rewardClaims).sort(), [chessToken, jigsawToken].sort());
  storage.setItem(rewardKey('amari'), JSON.stringify(olderWrite));
  const reopened = readPlayerRewards('amari', storage);
  const retryChess = claim('amari', reopened, 1, 'chess', storage, chessToken);
  assert.equal(retryChess.awardedPoints, 0);
  assert.equal(retryChess.points, 11);
  assert.equal(retryChess.gamesPlayed.chess, 1);
  assert.equal(retryChess.gamesPlayed.dinojigsaw, 1);
  assert.equal(retryChess.gamesPlayed.addition, 1);
  assert.equal(claim('amari', retryChess, 8, 'dinojigsaw', storage, jigsawToken).awardedPoints, 0);
  assert.equal(claim('amari', retryChess, 1, 'dino', storage, chessToken).persisted, false);
  assert.equal(claim('amari', retryChess, 8, 'chess', storage, jigsawToken).persisted, false);
  assert.equal(claim('amari', retryChess, 1, 'dino', storage, 'dino:CHESS:compat-game').persisted, false);
  assert.equal(claim('amari', retryChess, 8, 'dino', storage, 'dino:JIGSAW:little:compat-puzzle').persisted, false);
  assert.equal(claim('amari', retryChess, 1, 'chess', storage, 'DINO:CHESS:compat-game').awardedPoints, 0);
});

test('unpublished native claim aliases normalize without paying or counting a second completion', () => {
  const storage = store();
  storage.setItem(rewardKey('amari'), JSON.stringify({
    version: 2, points: 9, gamesPlayed: { chess: 1, dinojigsaw: 1 }, earnedStickerIds: [],
    rewardClaims: { 'chess:qa-game': 1, 'dinojigsaw:little:qa-puzzle': 8 }, parentNote: 'keep original metadata',
  }));
  const originalSibling = JSON.stringify({ version:2, points:10, gamesPlayed:{words:1}, earnedStickerIds:[] });
  storage.setItem(rewardKey('askia'), originalSibling);
  const result = claim('amari', {}, 1, 'chess', storage, rewardClaimToken('chess', 'qa-game'));
  assert.equal(result.persisted, true);
  assert.equal(result.awardedPoints, 0);
  assert.equal(result.points, 9);
  assert.deepEqual(result.gamesPlayed, { chess:1, dinojigsaw:1 });
  assert.deepEqual(result.rewardClaims, { 'dino:chess:qa-game':1, 'dino:jigsaw:little:qa-puzzle':8 });
  assert.equal(JSON.parse(storage.getItem(rewardKey('amari'))).parentNote, 'keep original metadata');
  assert.equal(storage.getItem(rewardKey('askia')), originalSibling);
});


test('German and Curriculum claims survive old-tab decoding and reject other game scopes', () => {
  const storage = store();
  const german = rewardClaimToken('german', 'chapter-route-proof');
  const curriculum = rewardClaimToken('worldmap', 'continents:challenge');
  const first = claim('amari', {}, 1, 'german', storage, german);
  const second = claim('amari', first, 1, 'worldmap', storage, curriculum);
  const oldDecoder = /^(dino|hangman|words|storybooks):[a-z0-9:_-]{1,160}$/i;
  const oldWrite = { ...JSON.parse(storage.getItem(rewardKey('amari'))), points: 4, rewardClaims: Object.fromEntries(Object.entries(second.rewardClaims).filter(([key]) => oldDecoder.test(key))) };
  assert.deepEqual(Object.keys(oldWrite.rewardClaims).sort(), [german,curriculum].sort());
  storage.setItem(rewardKey('amari'), JSON.stringify(oldWrite));
  const reopened = readPlayerRewards('amari', storage);
  for (const [game,token,upper] of [['german',german,'DINO:GERMAN:chapter-route-proof'],['worldmap',curriculum,'DINO:CURRICULUM:continents:challenge']]) {
    const retry = claim('amari', reopened, 1, game, storage, upper);
    assert.equal(retry.persisted,true);
    assert.equal(retry.awardedPoints,0);
    assert.equal(retry.points,4);
    assert.equal(retry.gamesPlayed[game],1);
    assert.equal(claim('amari',retry,1,'dino',storage,token).persisted,false);
    assert.equal(claim('amari',retry,1,game === 'german' ? 'worldmap' : 'german',storage,token).persisted,false);
  }
  const original=storage.getItem(rewardKey('amari'));
  assert.equal(claim('amari',reopened,1,'german',storage,'german:raw-new-claim').persisted,false);
  assert.equal(claim('amari',reopened,1,'worldmap',storage,'worldmap:raw-new-claim').persisted,false);
  assert.equal(storage.getItem(rewardKey('amari')),original);
});

test('Letter Launch claims survive the retained decoder, recover once and stay scoped', () => {
  const storage = store();
  const token = rewardClaimToken('letters', 'chapter-0-proof');
  assert.equal(token, 'dino:letters:chapter-0-proof');
  const first = claim('amari', {}, 1, 'letters', storage, token);
  assert.equal(first.persisted, true);
  assert.equal(first.points, 1);
  const oldDecoder = /^(dino|hangman|words|storybooks):[a-z0-9:_-]{1,160}$/i;
  const oldWrite = { ...JSON.parse(storage.getItem(rewardKey('amari'))), points: 3,
    rewardClaims: Object.fromEntries(Object.entries(first.rewardClaims).filter(([key]) => oldDecoder.test(key))) };
  storage.setItem(rewardKey('amari'), JSON.stringify(oldWrite));
  const recovered = claim('amari', {}, 1, 'letters', storage, 'DINO:LETTERS:chapter-0-proof');
  assert.equal(recovered.persisted, true);
  assert.equal(recovered.awardedPoints, 0);
  assert.equal(recovered.points, 3);
  assert.equal(recovered.gamesPlayed.letters, 1);
  const before = storage.getItem(rewardKey('amari'));
  for (const game of ['dino', 'german', 'worldmap']) assert.equal(claim('amari', {}, 1, game, storage, token).persisted, false);
  assert.equal(claim('amari', {}, 1, 'letters', storage, 'letters:raw-unshipped-token').persisted, false);
  assert.equal(storage.getItem(rewardKey('amari')), before);
});


test('Catalogue claims survive old tabs and reject replay or cross-game payment', () => {
  const storage = store();
  let current = {};
  for (const game of ['puzzle', 'spot', 'jet', 'math', 'counting', 'addition', 'subtraction', 'numberline', 'timeteller', 'phonics']) {
    const token = rewardClaimToken(game, 'starter:complete');
    assert.equal(token, `dino:${game}:starter:complete`);
    current = claim('amari', current, 2, game, storage, token);
    assert.equal(current.persisted, true);
    assert.equal(current.awardedPoints, 2);
    const saved = JSON.parse(storage.getItem(rewardKey('amari')));
    const oldDecoder = /^(dino|hangman|words|storybooks):[a-z0-9:_-]{1,160}$/i;
    saved.rewardClaims = Object.fromEntries(Object.entries(saved.rewardClaims).filter(([key]) => oldDecoder.test(key)));
    storage.setItem(rewardKey('amari'), JSON.stringify(saved));
    const retry = claim('amari', {}, 2, game, storage, `DINO:${game.toUpperCase()}:starter:complete`);
    assert.equal(retry.persisted, true); assert.equal(retry.awardedPoints, 0); assert.equal(retry.gamesPlayed[game], 1);
    assert.equal(claim('amari', retry, 2, 'dino', storage, token).persisted, false);
    assert.equal(claim('amari', retry, 2, game === 'spot' ? 'puzzle' : 'spot', storage, token).persisted, false);
    assert.equal(claim('amari', retry, 2, game, storage, `${game}:unshipped`).persisted, false);
  }
  assert.equal(readPlayerRewards('amari', storage).points, 20);
});
