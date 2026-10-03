import test from 'node:test';
import assert from 'node:assert/strict';
import {
  completeLetterTraceLevel,
  AMARI_TRACE_NARRATION,
  findForwardGuidePoint,
  getLetterTraceProgress,
  getLetterTraceShelfBadgeIds,
  getTraceEligibleItems,
  LETTER_TRACE_PROGRESS_KEY,
  makeLetterTraceRun,
  makeTraceWordChoices,
  recordLetterTraceMastery,
  traceToleranceForSize,
} from '../src/data/letterTraceLearning.js';

const memoryStorage = () => {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), values };
};

test('each chapter builds eight deterministic unique taught-letter rounds', () => {
  assert.ok(AMARI_TRACE_NARRATION.length >= 1);
  const taught = new Set(['a', 's', 't', 'p', 'i', 'n', 'm', 'd', 'g', 'o', 'c', 'k']);
  for (const level of [0, 1, 2]) {
    const run = makeLetterTraceRun({ seed: 9041, level, taught });
    assert.equal(run.rounds.length, 8);
    assert.equal(new Set(run.rounds.map((round) => round.lower)).size, 8);
    assert.deepEqual(makeLetterTraceRun({ seed: 9041, level, taught }), run);
    if (level === 1) assert.ok(run.rounds.some((round) => round.requested === round.lower));
    if (level === 2) {
      assert.ok(run.rounds.every((round) => round.requested === round.lower));
      assert.ok(run.rounds.every((round) => round.word.graphemes.every((sound) => taught.has(sound))));
    }
  }
});

test('word chapter only uses a taught decodable set and fails explicitly if too small', () => {
  const taught = new Set(['a', 's', 't', 'p', 'i', 'n', 'm', 'd', 'g', 'o', 'c', 'k']);
  assert.equal(getTraceEligibleItems(2, taught).length, 8);
  assert.match(makeLetterTraceRun({ seed: 1, level: 2, taught: new Set(['a', 't']) }).error, /Need eight/);
  const round = makeLetterTraceRun({ seed: 81, level: 2, taught }).rounds[0];
  const choicesA = makeTraceWordChoices(round, undefined, 12);
  assert.deepEqual(makeTraceWordChoices(round, undefined, 12), choicesA);
  assert.equal(choicesA.length, 3);
  assert.equal(new Set(choicesA.map((word) => word.word)).size, 3);
  assert.ok(choicesA.some((word) => word.word === round.word.word));
  assert.notDeepEqual(makeTraceWordChoices(round, undefined, 13), choicesA);
});

test('forward guide progress does not jump backwards and hit size scales with the viewport', () => {
  const line = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 0 }];
  assert.deepEqual(findForwardGuidePoint(line, { x: 10, y: 0 }, 2), { index: 2, distance: 10 });
  assert.equal(traceToleranceForSize(390, 844, 0), 54);
  assert.equal(traceToleranceForSize(1280, 800, 2), 54);
  assert.equal(traceToleranceForSize(180, 240, 2), 26);
});

test('mastery is per player and chapter unlock waits for an explicit level completion', () => {
  const storage = memoryStorage();
  assert.equal(recordLetterTraceMastery({ playerId: 'amari', level: 0, letter: 'A', storage }).newlyMastered, true);
  assert.equal(recordLetterTraceMastery({ playerId: 'amari', level: 0, letter: 'A', storage }).newlyMastered, false);
  assert.equal(getLetterTraceProgress('amari', storage).unlocked, 0);
  assert.equal(completeLetterTraceLevel({ playerId: 'amari', level: 0, completedRounds: 7, storage }).invalid, true);
  assert.deepEqual(completeLetterTraceLevel({ playerId: 'amari', level: 0, completedRounds: 8, storage }).completedLevels, [0]);
  assert.deepEqual(getLetterTraceShelfBadgeIds('amari', storage), ['trace-follow-path']);
  assert.equal(completeLetterTraceLevel({ playerId: 'amari', level: 99, storage }).invalid, true);
  assert.equal(recordLetterTraceMastery({ playerId: 'amari', level: 0, letter: 'z', storage }).invalid, true);
  assert.equal(recordLetterTraceMastery({ playerId: 'amari', level: 2, letter: 's', storage }).invalid, true);
  assert.equal(completeLetterTraceLevel({ playerId: 'amari', level: 2, completedRounds: 8, storage }).invalid, true);
  assert.equal(getLetterTraceProgress('askia', storage).masteredLetters.length, 0);
  assert.ok(storage.values.has(LETTER_TRACE_PROGRESS_KEY));
});

test('malformed saved completion does not grant a noncontiguous unlock', () => {
  const storage = memoryStorage();
  storage.setItem(LETTER_TRACE_PROGRESS_KEY, JSON.stringify({ amari: { unlocked: 2, completedLevels: [2, 0, 99], masteredLetters: ['a', 'z', 7] } }));
  assert.deepEqual(getLetterTraceProgress('amari', storage).completedLevels, [0]);
  assert.equal(getLetterTraceProgress('amari', storage).unlocked, 1);
  assert.deepEqual(getLetterTraceShelfBadgeIds('amari', storage), ['trace-follow-path']);
  assert.deepEqual(getLetterTraceProgress('amari', storage).masteredLetters, ['a']);
});
