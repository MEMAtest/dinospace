import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PATTERN_AUDIO_ASSET_INVENTORY, PATTERN_CHAPTERS, PATTERN_MISSIONS, PATTERN_NARRATION_STRINGS, PATTERN_RUN_LENGTH,
  PATTERN_SHAPES, createPatternRun, normalizePatternSeed, seededPatternRunSeed, validatePatternMissions,
} from '../src/data/patternAdventure.js';
import {
  completePatternChapter, isPatternChapterUnlocked, PATTERN_PROGRESS_KEY,
  readPatternProgress, rememberPatternRun,
} from '../src/data/patternAdventureProgress.js';

const store = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    values,
  };
};

test('Pattern Parade authoring has three chapters and globally unique, valid pattern signatures', () => {
  assert.equal(PATTERN_CHAPTERS.length, 3);
  assert.equal(PATTERN_CHAPTERS.every((chapter) => PATTERN_MISSIONS.filter((mission) => mission.chapterId === chapter.id).length >= PATTERN_RUN_LENGTH), true);
  assert.equal(PATTERN_MISSIONS.length, 24);
  assert.equal(validatePatternMissions(), true);
  assert.equal(new Set(PATTERN_MISSIONS.map(({ signature }) => signature)).size, PATTERN_MISSIONS.length);
  const repeatAnswerPositions = new Set(PATTERN_MISSIONS.filter(({ kind }) => kind === 'repeat').map(({ cycle, answer }) => cycle.indexOf(answer)));
  assert.equal(repeatAnswerPositions.size > 1, true, 'the missing repeat position varies instead of always being first');
  assert.deepEqual(new Set(PATTERN_MISSIONS.map(({ kind }) => kind)), new Set(['repeat', 'growing']));
  const cycleLengths = PATTERN_MISSIONS.filter((item) => item.kind === 'repeat').map(({ cycle }) => cycle.length);
  assert.equal(cycleLengths.includes(2), true, 'the full route includes AB patterns');
  assert.equal(cycleLengths.includes(3), true, 'the full route includes AAB, ABB and ABC patterns');
  assert.equal(cycleLengths.includes(4), true, 'the grand finale includes longer four-step patterns');
  assert.equal(PATTERN_MISSIONS.some(({ kind }) => kind === 'growing'), true);
  assert.deepEqual(Object.keys(PATTERN_SHAPES).length, 7);
});

test('seeded runs freeze six distinct questions and independently shuffle valid answer options', () => {
  for (const chapter of PATTERN_CHAPTERS) {
    const run = createPatternRun(chapter.id, 'pattern-seed-1');
    assert.equal(run.rounds.length, PATTERN_RUN_LENGTH);
    assert.equal(Number.isSafeInteger(run.seed) && run.seed >= 0 && run.seed <= 0xffffffff, true);
    assert.equal(new Set(run.rounds.map(({ id }) => id)).size, PATTERN_RUN_LENGTH);
    assert.deepEqual(createPatternRun(chapter.id, 'pattern-seed-1').rounds, run.rounds);
    assert.deepEqual(createPatternRun(chapter.id, run.seed).rounds, run.rounds, 'the numeric UI seed reproduces the same run');
    for (const round of run.rounds) {
      assert.equal(round.options.length, 3);
      assert.equal(new Set(round.options).size, 3);
      assert.equal(round.options.filter((option) => option === round.answer).length, 1);
      if (round.kind === 'repeat') assert.equal(round.sequence.length >= round.cycle.length * 2, true);
      else assert.equal(round.sequence.length, 3);
      if (round.kind === 'repeat') assert.equal(round.options.some((option) => option !== round.answer && round.cycle.includes(option)), true, 'choices test order rather than merely spotting a familiar shape');
    }
  }
  for (const seed of ['finale-one', 'finale-two', 'finale-three', 'finale-four']) {
    const finale = createPatternRun('grand-finale', seed);
    assert.equal(finale.rounds.some(({ kind }) => kind === 'growing'), true);
    const triples = finale.rounds.filter(({ kind, cycle }) => kind === 'repeat' && cycle.length === 3).map(({ cycle }) => cycle);
    assert.equal(triples.some(([a, b, c]) => a === b && b !== c), true, 'each finale has AAB');
    assert.equal(triples.some(([a, b, c]) => a !== b && b === c), true, 'each finale has ABB');
  }
  const one = createPatternRun('colour-courtyard', 'pattern-seed-1').rounds;
  const two = createPatternRun('colour-courtyard', 'pattern-seed-2').rounds;
  assert.notDeepEqual(one.map(({ id }) => id), two.map(({ id }) => id));
  assert.notDeepEqual(one.map(({ id, options }) => [id, options]), two.map(({ id, options }) => [id, options]));
  assert.equal(normalizePatternSeed('123'), 123);
  assert.equal(seededPatternRunSeed(() => 0.5), 0x80000000);
  assert.equal(Number.isSafeInteger(seededPatternRunSeed()) && seededPatternRunSeed() <= 0xffffffff, true);
});

test('every normal run covers its advertised chapter skills, including after recent runs', () => {
  for (const chapter of PATTERN_CHAPTERS) for (let seed = 1; seed <= 120; seed++) {
    const previous = createPatternRun(chapter.id, seed);
    const run = createPatternRun(chapter.id, seed + 200, previous.rounds.map(({ id }) => id));
    const rounds = run.rounds;
    if (chapter.id === 'colour-courtyard') {
      assert.ok(rounds.some((round) => round.kind === 'growing'));
      assert.ok(rounds.some((round) => round.cycle?.length === 2));
    } else {
      assert.ok(rounds.some((round) => round.cycle?.length === 3 && round.cycle[0] === round.cycle[1]));
      assert.ok(rounds.some((round) => round.cycle?.length === 3 && round.cycle[1] === round.cycle[2]));
      if (chapter.id === 'festival-friends') assert.ok(rounds.some((round) => round.cycle?.length === 3 && new Set(round.cycle).size === 3));
      else {
        assert.ok(rounds.some((round) => round.kind === 'growing'));
        assert.ok(rounds.some((round) => round.cycle?.length === 4));
      }
    }
    assert.equal(new Set([...previous.rounds, ...rounds].map(({ id }) => id)).size, 8, 'two runs cover the whole authored pool');
  }
});

test('run selection avoids recent missions when six fresh missions remain', () => {
  const pool = PATTERN_MISSIONS.filter(({ chapterId }) => chapterId === 'colour-courtyard').map(({ id }) => id);
  const recent = pool.slice(0, 2);
  const run = createPatternRun('colour-courtyard', 'recent-test', recent);
  assert.equal(run.rounds.length, 6);
  assert.equal(run.rounds.some(({ id }) => recent.includes(id)), false);
});

test('per-child progress rejects invalid IDs, unlocks in order, and rewards a chapter only once', () => {
  const storage = store();
  const firstChapter = PATTERN_CHAPTERS[0];
  const secondChapter = PATTERN_CHAPTERS[1];
  const firstRun = createPatternRun(firstChapter.id, 'progress-first');
  const secondRun = createPatternRun(secondChapter.id, 'progress-second');

  const badRun = rememberPatternRun('child-1', firstChapter.id, [...firstRun.rounds.slice(0, 5).map(({ id }) => id), 'not-a-mission'], storage);
  assert.equal(badRun.persisted, false);
  assert.equal(completePatternChapter('child-1', secondChapter.id, secondRun.rounds.map(({ id }) => id), storage).persisted, false);

  const remembered = rememberPatternRun('child-1', firstChapter.id, firstRun.rounds.map(({ id }) => id), storage);
  assert.equal(remembered.persisted, true);
  const completed = completePatternChapter('child-1', firstChapter.id, firstRun.rounds.map(({ id }) => id), storage);
  assert.equal(completed.persisted, true);
  assert.equal(completed.newlyCompleted, true);
  assert.equal(completed.unlockedChapterIndex, 1);
  assert.equal(isPatternChapterUnlocked(completed, 1), true);
  assert.equal(completePatternChapter('child-1', firstChapter.id, firstRun.rounds.map(({ id }) => id), storage).newlyCompleted, false);
  assert.equal(readPatternProgress('child-1', storage).completedChapterIds.includes(firstChapter.id), true);
  assert.equal(readPatternProgress('child-2', storage).completedChapterIds.length, 0);

  const key = `${PATTERN_PROGRESS_KEY}:child-1`;
  storage.setItem(key, JSON.stringify({ version: 2, completedChapterIds: ['not-real', secondChapter.id], recentMissionIds: ['not-a-mission', 'coral-blue'] }));
  const sanitized = readPatternProgress('child-1', storage);
  assert.deepEqual(sanitized.completedChapterIds, []);
  assert.deepEqual(sanitized.recentMissionIds, ['coral-blue']);
  assert.equal(sanitized.unlockedChapterIndex, 0);
});

test('storage errors are contained and exact missing packaged narration is surfaced', () => {
  const broken = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.equal(readPatternProgress('child', broken).persisted, false);
  assert.equal(rememberPatternRun('child', PATTERN_CHAPTERS[0].id, createPatternRun(PATTERN_CHAPTERS[0].id, 'x').rounds.map(({ id }) => id), broken).persisted, false);
  assert.deepEqual([...PATTERN_AUDIO_ASSET_INVENTORY.available, ...PATTERN_AUDIO_ASSET_INVENTORY.missing].sort(), [...PATTERN_NARRATION_STRINGS].sort());
  assert.equal([...PATTERN_AUDIO_ASSET_INVENTORY.available, ...PATTERN_AUDIO_ASSET_INVENTORY.missing].includes('What comes next? Look for the rule.'), true);
});

test('a failed final save can be retried and duplicate completion never awards twice', () => {
  const base = store();
  let failWrite = true;
  const flaky = {
    getItem: base.getItem,
    setItem(key, value) {
      if (failWrite) { failWrite = false; throw new Error('temporary storage failure'); }
      base.setItem(key, value);
    },
  };
  const chapter = PATTERN_CHAPTERS[0];
  const missionIds = createPatternRun(chapter.id, 'retry-save').rounds.map(({ id }) => id);
  const failed = completePatternChapter('retry-child', chapter.id, missionIds, flaky);
  assert.equal(failed.persisted, false);
  assert.deepEqual(failed.completedChapterIds, []);
  assert.equal(failed.unlockedChapterIndex, 0);
  const saved = completePatternChapter('retry-child', chapter.id, missionIds, flaky);
  assert.equal(saved.persisted, true);
  assert.equal(saved.newlyCompleted, true);
  const duplicate = completePatternChapter('retry-child', chapter.id, missionIds, flaky);
  assert.equal(duplicate.persisted, true);
  assert.equal(duplicate.newlyCompleted, false);
});

test('finite-pool repeats do not repeat the immediately preceding mission at a run boundary', () => {
  for (const chapter of PATTERN_CHAPTERS) for (let seed = 1; seed < 60; seed++) {
    const first = createPatternRun(chapter.id, seed);
    const recent = first.rounds.map(({ id }) => id);
    const next = createPatternRun(chapter.id, seed + 100, recent);
    assert.notEqual(next.rounds[0].id, recent.at(-1));
  }
});

test('invalid run sizes never produce an empty or partial-count run', () => {
  for (const length of [NaN, Infinity, -Infinity, 0, -1, 1.5, '6', null, 9]) assert.equal(createPatternRun('colour-courtyard', 1, [], length), null);
  for (const length of [1, 2, 6, 8]) assert.equal(createPatternRun('colour-courtyard', 1, [], length).rounds.length, length);
});
