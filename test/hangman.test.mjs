import test from 'node:test';
import assert from 'node:assert/strict';
import { PHASE_SOUNDS } from '../src/data/learningProgress.js';
import { HANGMAN_LEVELS, HANGMAN_REGULAR_WORDS, HANGMAN_WORD_GRAPHEMES, hangmanLettersForLevel, hangmanWordsForLevel, makeHangmanQueue, markHangmanWordRescued, nextHangmanWordIndex } from '../src/data/hangmanLevels.js';
import { DEFAULT_TAUGHT_GRAPHEMES } from '../src/data/literacy.js';
import { commitHangmanLevel, hangmanPointsForRun, hangmanProgressStorageKey, isHangmanLevelUnlocked, legacyHangmanProgressKey, positiveHangmanRewardTransactions, readHangmanProgress, rememberHangmanWord } from '../src/data/hangmanProgress.js';

const memoryStorage = () => {
  const values = new Map();
  return { values, getItem: (key) => values.has(key) ? values.get(key) : null, setItem: (key, value) => values.set(key, value) };
};

test('four Hangman levels keep increasing word lengths, existing targets and enough varied taught words', () => {
  assert.deepEqual(HANGMAN_LEVELS.map(({ target }) => target), [3, 3, 6, 4]);
  assert.deepEqual(HANGMAN_LEVELS.map(({ lengthLabel }) => lengthLabel), ['3 letters', '4 letters', '5 letters', '6–7 letters']);
  for (const sounds of [new Set(DEFAULT_TAUGHT_GRAPHEMES), new Set([...PHASE_SOUNDS[2], ...PHASE_SOUNDS[3]])]) {
    for (const [levelIndex, level] of HANGMAN_LEVELS.entries()) {
      const words = hangmanWordsForLevel(levelIndex, sounds);
      assert.ok(words.length >= level.target, `${level.name} needs at least ${level.target} decodable choices`);
      assert.equal(new Set(words.map(({ word }) => word)).size, words.length);
      for (const word of words) {
        assert.ok(word.word.length >= level.minimumLength && word.word.length <= level.maximumLength, word.word);
        assert.ok(word.clue && word.emoji, `${word.word} needs a visible clue and image cue`);
        assert.ok(word.graphemes.every((grapheme) => sounds.has(grapheme)), `${word.word} contains an untaught sound`);
      }
    }
  }
  const defaultFourLetterWords = hangmanWordsForLevel(1, new Set(DEFAULT_TAUGHT_GRAPHEMES));
  assert.ok(defaultFourLetterWords.length >= 10, 'default level needs a useful regular-cluster word variety');
  assert.ok(HANGMAN_REGULAR_WORDS.filter(({ word }) => ['DRUM', 'NEST', 'MILK', 'HELP', 'SAND', 'DESK', 'TENT', 'MASK'].includes(word)).every(({ word }) => defaultFourLetterWords.some((entry) => entry.word === word)));
  assert.ok(defaultFourLetterWords.every((entry) => entry.graphemes.every((sound) => DEFAULT_TAUGHT_GRAPHEMES.includes(sound))));
  const prematureIrregulars = ['DINO', 'PIRATE', 'CASTLE', 'TIGER', 'ZEBRA', 'PIZZA'];
  assert.ok(prematureIrregulars.every((word) => !defaultFourLetterWords.some((entry) => entry.word === word)));
  assert.ok(!Object.hasOwn(HANGMAN_WORD_GRAPHEMES, 'DINO') && !Object.hasOwn(HANGMAN_WORD_GRAPHEMES, 'CASTLE'));
  assert.ok(!hangmanWordsForLevel(1, new Set(PHASE_SOUNDS[2])).some(({ word }) => word === 'SWIM'), 'the /w/ sound must stay gated before it is taught');
  assert.ok(hangmanWordsForLevel(1, new Set([...PHASE_SOUNDS[2], ...PHASE_SOUNDS[3]])).some(({ word }) => word === 'SWIM'));
  assert.ok(hangmanWordsForLevel(2, new Set(PHASE_SOUNDS[2])).some(({ word }) => word.length === 5));
});

test('seeded queues are distinct within a level and move a recently seen word away from the boundary', () => {
  const taught = new Set([...PHASE_SOUNDS[2], ...PHASE_SOUNDS[3]]);
  const plain = makeHangmanQueue(3, taught, { seed: 41 });
  const recent = makeHangmanQueue(3, taught, { seed: 41, recent: [plain[0].word] });
  assert.equal(new Set(plain.map(({ word }) => word)).size, plain.length);
  assert.notEqual(recent[0].word, plain[0].word);
  assert.equal(recent.length, plain.length);
});

test('skip wraps past already-rescued words and a word only advances the rescue count once', () => {
  const queue = [{ id: 'word-a' }, { id: 'word-b' }, { id: 'word-c' }, { id: 'word-d' }];
  const rescued = new Set(['word-a', 'word-c', 'word-d']);
  assert.equal(nextHangmanWordIndex(queue, 2, rescued), 1, 'skip from the queue end should wrap to the only unrescued word');
  const first = markHangmanWordRescued(rescued, 'word-b');
  assert.equal(first.alreadyRescued, false);
  assert.equal(first.rescuedWordIds.size, 4);
  const repeat = markHangmanWordRescued(first.rescuedWordIds, 'word-b');
  assert.equal(repeat.alreadyRescued, true);
  assert.equal(repeat.rescuedWordIds.size, 4, 'the repeated word cannot advance the run target');
  assert.equal(nextHangmanWordIndex(queue, 1, repeat.rescuedWordIds), 2, 'an exhausted route still cycles without inventing another distinct rescue');
});

test('letter choices retain every answer letter and scale from 12 to 26 unique keys', () => {
  for (const [level, word, count] of [[0, 'CAT', 12], [1, 'DINO', 12], [2, 'TIGER', 18], [3, 'PLASTIC', 26]]) {
    const letters = hangmanLettersForLevel(word, level, () => 0.37);
    assert.equal(letters.length, count);
    assert.equal(new Set(letters).size, count);
    for (const letter of new Set(word.split(''))) assert.ok(letters.includes(letter));
  }
});

test('child progress reads legacy high-water without modifying old bytes, and completion unlocks in order', () => {
  const storage = memoryStorage();
  const key = legacyHangmanProgressKey('amari');
  const legacyBytes = '{"hangman":{"current":2,"unlocked":2},"other":{"current":1,"unlocked":1}}';
  storage.setItem(key, legacyBytes);
  const migrated = readHangmanProgress('amari', storage);
  assert.equal(migrated.currentLevel, 2);
  assert.equal(migrated.unlockedLevel, 2);
  assert.deepEqual(migrated.completedLevels, [0, 1]);
  assert.equal(migrated.bestPointsByLevel[0], 6);
  assert.equal(isHangmanLevelUnlocked(migrated, 2), true);
  assert.equal(isHangmanLevelUnlocked(migrated, 3), false);

  const result = commitHangmanLevel('amari', 2, 4, storage, 'level-two-first-run');
  assert.equal(result.persisted, true);
  assert.equal(result.newlyCompleted, true);
  assert.equal(result.rewardDelta, 0, 'the legacy highest unlocked level has no receipt, so it is capped against replay farming');
  assert.deepEqual(result.completedLevels, [0, 1, 2]);
  assert.equal(result.unlockedLevel, 3);
  assert.equal(storage.getItem(key), legacyBytes, 'legacy object and unrelated entries must remain byte-for-byte unchanged');
  assert.ok(storage.values.has(hangmanProgressStorageKey('amari')));
  assert.deepEqual(readHangmanProgress('another-child', storage).completedLevels, []);
});

test('completion is idempotent; equal/lower replay earns zero and only a better score earns the delta', () => {
  const storage = memoryStorage();
  const initial = commitHangmanLevel('child', 0, 2, storage, 'level-zero-run-one');
  assert.equal(initial.persisted, true);
  assert.equal(initial.rewardDelta, 2);
  const equal = commitHangmanLevel('child', 0, 2, storage, 'level-zero-replay-equal');
  assert.equal(equal.persisted, true);
  assert.equal(equal.newlyCompleted, false);
  assert.equal(equal.rewardDelta, 0);
  const lower = commitHangmanLevel('child', 0, 0, storage, 'level-zero-replay-low');
  assert.equal(lower.rewardDelta, 0);
  const improved = commitHangmanLevel('child', 0, 6, storage, 'level-zero-replay-better');
  assert.equal(improved.persisted, true);
  assert.equal(improved.rewardDelta, 4);
  assert.equal(commitHangmanLevel('child', 0, 6, storage, 'level-zero-replay-again').rewardDelta, 0);
  assert.deepEqual(readHangmanProgress('child', storage).completedLevels, [0]);
});

test('failed writes and locked level attempts return no reward; valid retry is durable', () => {
  const storage = memoryStorage();
  const locked = commitHangmanLevel('child', 1, 6, storage);
  assert.equal(locked.valid, false);
  assert.equal(locked.rewardDelta, 0);
  assert.equal(storage.values.size, 0);

  const broken = { getItem: () => null, setItem() { throw new Error('quota'); } };
  const failed = commitHangmanLevel('child', 0, 6, broken, 'level-zero-retry-id');
  assert.equal(failed.persisted, false);
  assert.equal(failed.rewardDelta, 0);
  assert.equal(failed.newlyCompleted, false);
  assert.equal(readHangmanProgress('child', storage).completedLevels.length, 0);

  const retry = commitHangmanLevel('child', 0, 6, storage, 'level-zero-retry-id');
  assert.equal(retry.persisted, true);
  assert.equal(retry.rewardDelta, 6);
});

test('malformed legacy state fails closed for saved completion while preserving visit-only play', () => {
  const storage = memoryStorage();
  storage.setItem(legacyHangmanProgressKey('child'), '{not json');
  const state = readHangmanProgress('child', storage);
  assert.equal(state.persistenceSafe, false);
  assert.equal(isHangmanLevelUnlocked(state, 0), true);
  const result = commitHangmanLevel('child', 0, 6, storage, 'unreadable-state-run');
  assert.equal(result.persisted, false);
  assert.equal(result.rewardDelta, 0);
  assert.equal(storage.values.has(hangmanProgressStorageKey('child')), false);
});

test('invalid known Hangman fields fail closed while valid unknown canonical metadata survives writes', () => {
  const malformedLegacy = memoryStorage();
  const legacyKey = legacyHangmanProgressKey('child');
  const legacyBytes = '{"hangman":{"current":0,"unlocked":"3"},"other":{"keep":true}}';
  malformedLegacy.setItem(legacyKey, legacyBytes);
  const blocked = readHangmanProgress('child', malformedLegacy);
  assert.equal(blocked.persistenceSafe, false);
  assert.equal(blocked.unlockedLevel, 0);
  assert.equal(commitHangmanLevel('child', 0, 6, malformedLegacy, 'bad-legacy').rewardDelta, 0);
  assert.equal(malformedLegacy.getItem(legacyKey), legacyBytes);
  malformedLegacy.setItem(legacyKey, JSON.stringify({ hangman: { current: 0, unlocked: 4 } }));
  assert.equal(readHangmanProgress('child', malformedLegacy).persistenceSafe, false);

  const storage = memoryStorage();
  const canonical = hangmanProgressStorageKey('child');
  storage.setItem(canonical, JSON.stringify({ version: 1, completedLevels: [], bestPointsByLevel: { 0: 0, 1: 0, 2: 0, 3: 0 }, recentWordsByLevel: { 0: [], 1: [], 2: [], 3: [] }, transactions: {}, currentLevel: 0, unlockedLevel: 0, futureField: { keep: 'me' } }));
  assert.equal(commitHangmanLevel('child', 0, 4, storage, 'metadata-preserve').persisted, true);
  assert.deepEqual(JSON.parse(storage.getItem(canonical)).futureField, { keep: 'me' });
  rememberHangmanWord('child', 0, 'CAT', storage);
  assert.deepEqual(JSON.parse(storage.getItem(canonical)).futureField, { keep: 'me' });
  storage.setItem(canonical, JSON.stringify({ version: 1, completedLevels: [], bestPointsByLevel: {}, recentWordsByLevel: {}, transactions: {}, currentLevel: '0', unlockedLevel: 0 }));
  assert.equal(readHangmanProgress('child', storage).persistenceSafe, false);
  assert.equal(commitHangmanLevel('child', 0, 6, storage, 'bad-canonical').rewardDelta, 0);
});

test('legacy highest unlocked result is reward-capped without falsely completing it; absent legacy permits a new first level', () => {
  const storage = memoryStorage();
  storage.setItem(legacyHangmanProgressKey('child'), JSON.stringify({ hangman: { current: 3, unlocked: 3 }, letters: { unlocked: 1 } }));
  const legacy = readHangmanProgress('child', storage);
  assert.deepEqual(legacy.completedLevels, [0, 1, 2]);
  assert.equal(legacy.bestPointsByLevel[3], 6);
  assert.equal(commitHangmanLevel('child', 3, 6, storage, 'legacy-final').rewardDelta, 0);

  const fresh = commitHangmanLevel('fresh', 0, 6, storage, 'fresh-first-level');
  assert.equal(fresh.persisted, true);
  assert.equal(fresh.rewardDelta, 6);
});

test('readback failure Retry recovers the same transaction and original reward delta', () => {
  const storage = memoryStorage();
  const canonical = hangmanProgressStorageKey('child');
  let failReadback = false;
  const flaky = {
    getItem(key) {
      if (failReadback && key === canonical) { failReadback = false; return null; }
      return storage.getItem(key);
    },
    setItem(key, value) { storage.setItem(key, value); if (key === canonical) failReadback = true; },
  };
  const first = commitHangmanLevel('child', 0, 4, flaky, 'stable-attempt-1');
  assert.equal(first.persisted, false);
  assert.equal(first.rewardDelta, 0);
  const retried = commitHangmanLevel('child', 0, 4, flaky, 'stable-attempt-1');
  assert.equal(retried.persisted, true);
  assert.equal(retried.transactionRecovered, true);
  assert.equal(retried.rewardDelta, 4);
  assert.equal(commitHangmanLevel('child', 0, 4, flaky, 'another-replay').rewardDelta, 0);
});

test('recent words persist per child and score bands follow first-try accuracy', () => {
  const storage = memoryStorage();
  assert.equal(rememberHangmanWord('child-a', 2, 'TIGER', storage).persisted, true);
  rememberHangmanWord('child-a', 2, 'ROCKET', storage);
  rememberHangmanWord('child-a', 2, 'TIGER', storage);
  assert.deepEqual(readHangmanProgress('child-a', storage).recentWordsByLevel[2], ['ROCKET', 'TIGER']);
  assert.deepEqual(readHangmanProgress('child-b', storage).recentWordsByLevel[2], []);
  assert.equal(hangmanPointsForRun(3, 3), 6);
  assert.equal(hangmanPointsForRun(2, 3), 4);
  assert.equal(hangmanPointsForRun(0, 4), 2);
  assert.equal(hangmanPointsForRun(0, 0), 0);
});

test('only positive canonical new transactions are exposed for reward receipt reconciliation', () => {
  const storage = memoryStorage();
  commitHangmanLevel('child', 0, 4, storage, 'first-claimable');
  commitHangmanLevel('child', 0, 2, storage, 'zero-replay');
  const txs = positiveHangmanRewardTransactions(readHangmanProgress('child', storage));
  assert.deepEqual(txs.map(({ transactionId, rewardDelta }) => [transactionId, rewardDelta]), [['first-claimable', 4]]);
});
