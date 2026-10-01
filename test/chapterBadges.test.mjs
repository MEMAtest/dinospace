import assert from 'node:assert/strict';
import test from 'node:test';
import {
  awardChapterBadge,
  CHAPTER_BADGE_STORAGE_KEY,
  getChapterBadgesForGame,
  getEarnedChapterBadgeIds,
  LETTER_LAUNCH_CHAPTER_BADGES,
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
