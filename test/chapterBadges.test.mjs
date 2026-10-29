import assert from 'node:assert/strict';
import test from 'node:test';
import {
  awardChapterBadge,
  CHAPTER_BADGE_STORAGE_KEY,
  getChapterBadgesForGame,
  getEarnedChapterBadgeIds,
  LETTER_LAUNCH_CHAPTER_BADGES,
  inspectChapterBadges,
  saveChapterBadgeStrict,
} from '../src/data/chapterBadges.js';

const memoryStorage = () => {
  const values = new Map();
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
};

test('Letter Launch has one named badge for each of its four chapters', () => {
  assert.deepEqual(getChapterBadgesForGame('letters'), LETTER_LAUNCH_CHAPTER_BADGES);
  assert.equal(LETTER_LAUNCH_CHAPTER_BADGES.length, 4);
  assert.deepEqual(LETTER_LAUNCH_CHAPTER_BADGES.map(({ levelIndex }) => levelIndex), [0, 1, 2, 3]);
  assert.equal(new Set(LETTER_LAUNCH_CHAPTER_BADGES.map(({ id }) => id)).size, 4);
  assert.ok(LETTER_LAUNCH_CHAPTER_BADGES.every(({ name, description, mark, accent }) => name && description && mark && accent));
});

test('badges are granted only by an explicit chapter award and persist all four chapters', () => {
  const storage = memoryStorage();
  assert.deepEqual(getEarnedChapterBadgeIds('child-a', 'letters', storage), []);
  assert.equal(storage.getItem(CHAPTER_BADGE_STORAGE_KEY), null);

  const results = [0, 1, 2, 3].map((levelIndex) => awardChapterBadge('child-a', 'letters', levelIndex, storage));
  assert.deepEqual(results.map((result) => result.badge.id), LETTER_LAUNCH_CHAPTER_BADGES.map((badge) => badge.id));
  assert.ok(results.every((result) => result.newlyEarned));

  // A fresh reader of storage sees the complete earned collection, including chapter four.
  assert.deepEqual(getEarnedChapterBadgeIds('child-a', 'letters', storage), LETTER_LAUNCH_CHAPTER_BADGES.map((badge) => badge.id));
  assert.equal(awardChapterBadge('child-a', 'letters', 3, storage).newlyEarned, false);
  assert.deepEqual(getEarnedChapterBadgeIds('child-a', 'letters', storage), LETTER_LAUNCH_CHAPTER_BADGES.map((badge) => badge.id));
});

test('chapter badges are scoped to both the child and game', () => {
  const storage = memoryStorage();
  awardChapterBadge('child-a', 'letters', 0, storage);

  assert.deepEqual(getEarnedChapterBadgeIds('child-b', 'letters', storage), []);
  assert.deepEqual(getEarnedChapterBadgeIds('child-a', 'german', storage), []);
  assert.deepEqual(getEarnedChapterBadgeIds('child-a', 'letters', storage), [LETTER_LAUNCH_CHAPTER_BADGES[0].id]);
});

test('unlocks, invalid games and invalid levels never fabricate a chapter badge', () => {
  const storage = memoryStorage();
  // Existing unlocked/current level data is not a completed chapter record and is not migrated.
  storage.setItem('child-a_game_levels_v1', JSON.stringify({ letters: { current: 3, unlocked: 3 } }));
  assert.deepEqual(getEarnedChapterBadgeIds('child-a', 'letters', storage), []);
  assert.equal(awardChapterBadge('child-a', 'letters', 4, storage), null);
  assert.equal(awardChapterBadge('child-a', 'unknown-game', 0, storage), null);
  assert.deepEqual(getEarnedChapterBadgeIds('child-a', 'letters', storage), []);
});

test('malformed storage and unknown stored badge IDs are ignored safely', () => {
  const storage = memoryStorage();
  storage.setItem(CHAPTER_BADGE_STORAGE_KEY, '{broken');
  assert.deepEqual(getEarnedChapterBadgeIds('child-a', 'letters', storage), []);
  assert.doesNotThrow(() => awardChapterBadge('child-a', 'letters', 0, storage));

  storage.setItem(CHAPTER_BADGE_STORAGE_KEY, JSON.stringify({
    version: 1,
    players: { 'child-a': { games: { letters: { earnedChapterIds: ['letters-sound-scout', 'made-up-badge', 7] } } } },
  }));
  assert.deepEqual(getEarnedChapterBadgeIds('child-a', 'letters', storage), ['letters-sound-scout']);
});

test('blocked browser storage still returns the chapter reward for this result screen', () => {
  const blockedStorage = {
    getItem: () => { throw new Error('storage blocked'); },
    setItem: () => { throw new Error('storage blocked'); },
  };
  const result = awardChapterBadge('child-a', 'letters', 2, blockedStorage);
  assert.equal(result.badge.id, LETTER_LAUNCH_CHAPTER_BADGES[2].id);
  assert.equal(result.newlyEarned, true);
  assert.deepEqual(result.earnedChapterIds, [LETTER_LAUNCH_CHAPTER_BADGES[2].id]);
});

test('strict chapter awards distinguish fresh storage and confirm all four badges', () => {
  const storage = memoryStorage();
  assert.deepEqual(inspectChapterBadges('amari', 'letters', storage), { status: 'empty', earnedChapterIds: [] });
  for (let level = 0; level < 4; level += 1) {
    const result = saveChapterBadgeStrict('amari', 'letters', level, storage);
    assert.equal(result.status, 'saved');
    assert.equal(result.newlyEarned, true);
    assert.equal(result.earnedChapterIds.length, level + 1);
  }
  const before = storage.getItem(CHAPTER_BADGE_STORAGE_KEY);
  assert.equal(saveChapterBadgeStrict('amari', 'letters', 3, storage).newlyEarned, false);
  assert.equal(storage.getItem(CHAPTER_BADGE_STORAGE_KEY), before);
  assert.deepEqual(inspectChapterBadges('askia', 'letters', storage).earnedChapterIds, []);
});

test('strict awards preserve unknown root, child, game and badge metadata', () => {
  const storage = memoryStorage();
  const original = {
    version: 1, familyNote: { keep: [1, 2] },
    players: {
      askia: { games: { other: { data: 'untouched' } }, privateNote: 'sibling' },
      amari: { future: true, games: {
        other: { score: 91 },
        letters: { teacherNote: { retain: true }, earnedChapterIds: ['future-badge', 'letters-sound-scout'] },
      } },
    },
  };
  storage.setItem(CHAPTER_BADGE_STORAGE_KEY, JSON.stringify(original));
  assert.equal(saveChapterBadgeStrict('amari', 'letters', 1, storage).status, 'saved');
  const saved = JSON.parse(storage.getItem(CHAPTER_BADGE_STORAGE_KEY));
  assert.deepEqual(saved.familyNote, original.familyNote);
  assert.deepEqual(saved.players.askia, original.players.askia);
  assert.deepEqual(saved.players.amari.games.other, original.players.amari.games.other);
  assert.deepEqual(saved.players.amari.games.letters.teacherNote, { retain: true });
  assert.deepEqual(saved.players.amari.games.letters.earnedChapterIds, ['future-badge', 'letters-sound-scout', 'letters-first-sound-finder']);
  assert.deepEqual(inspectChapterBadges('amari', 'letters', storage).earnedChapterIds, ['letters-sound-scout', 'letters-first-sound-finder']);
});

test('strict malformed and undefined reads never replace an existing shelf', () => {
  const invalid = [undefined, '', '{broken', 'null', '[]', '{}',
    JSON.stringify({ version: 2, players: {} }),
    JSON.stringify({ version: 1, players: [] }),
    JSON.stringify({ version: 1, players: { amari: [] } }),
    JSON.stringify({ version: 1, players: { amari: { games: [] } } }),
    JSON.stringify({ version: 1, players: { amari: { games: { letters: { earnedChapterIds: [7] } } } } }),
  ];
  for (const raw of invalid) {
    let writes = 0;
    const storage = { getItem: () => raw, setItem: () => { writes += 1; } };
    assert.equal(inspectChapterBadges('amari', 'letters', storage).status, 'invalid');
    assert.equal(saveChapterBadgeStrict('amari', 'letters', 0, storage).status, 'invalid');
    assert.equal(writes, 0);
  }
});

test('strict unavailable reads and invalid scopes do not fabricate earned badges', () => {
  let writes = 0;
  const blocked = { getItem() { throw Error('blocked'); }, setItem() { writes += 1; } };
  assert.equal(inspectChapterBadges('amari', 'letters', blocked).status, 'unavailable');
  assert.equal(saveChapterBadgeStrict('amari', 'letters', 0, blocked).status, 'unavailable');
  const storage = memoryStorage();
  for (const game of ['unknown', '__proto__', ['letters']]) {
    assert.equal(saveChapterBadgeStrict('amari', game, 0, storage).status, 'invalid');
    assert.equal(inspectChapterBadges('amari', game, storage).status, 'invalid');
  }
  assert.equal(saveChapterBadgeStrict('amari', 'letters', 4, storage).status, 'invalid');
  assert.equal(storage.getItem(CHAPTER_BADGE_STORAGE_KEY), null);
  assert.equal(writes, 0);
});

test('strict prewrite failure leaves the canonical badge record unchanged', () => {
  const backing = memoryStorage();
  saveChapterBadgeStrict('amari', 'letters', 0, backing);
  const before = backing.getItem(CHAPTER_BADGE_STORAGE_KEY);
  const blocked = { getItem: backing.getItem, setItem() { throw Error('quota'); } };
  const result = saveChapterBadgeStrict('amari', 'letters', 1, blocked);
  assert.equal(result.status, 'unconfirmed');
  assert.equal(result.newlyEarned, false);
  assert.deepEqual(result.earnedChapterIds, ['letters-sound-scout']);
  assert.equal(backing.getItem(CHAPTER_BADGE_STORAGE_KEY), before);
});

test('strict committed-but-unconfirmed awards recover without writing twice', () => {
  const backing = memoryStorage();
  let afterWrite = false, staleOnce = true, writes = 0;
  const flaky = {
    getItem(key) { if (afterWrite && staleOnce) { staleOnce = false; return null; } return backing.getItem(key); },
    setItem(key, value) { writes += 1; backing.setItem(key, value); afterWrite = true; },
  };
  assert.equal(saveChapterBadgeStrict('amari', 'letters', 2, flaky).status, 'unconfirmed');
  assert.deepEqual(inspectChapterBadges('amari', 'letters', backing).earnedChapterIds, ['letters-letter-match-maker']);
  const recovered = saveChapterBadgeStrict('amari', 'letters', 2, flaky);
  assert.equal(recovered.status, 'saved');
  assert.equal(recovered.newlyEarned, false);
  assert.equal(writes, 1);
});

test('strict confirmation of an old earned badge preserves original raw formatting', () => {
  const raw = '{ "version":1, "players": { "amari": {"games":{"letters":{"earnedChapterIds":["future-badge","letters-sound-scout"]}}}} }';
  let writes = 0;
  const storage = { getItem: () => raw, setItem: () => { writes += 1; } };
  const result = saveChapterBadgeStrict('amari', 'letters', 0, storage);
  assert.equal(result.status, 'saved');
  assert.equal(result.newlyEarned, false);
  assert.equal(writes, 0);
});
