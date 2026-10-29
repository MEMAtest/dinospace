import assert from 'node:assert/strict';
import test from 'node:test';
import {
  commitCurriculumHistory, curriculumCompletionStorageKey, curriculumHistoryStorageKey, curriculumHistoryTransactionKey,
  finishCurriculumPath, inspectCurriculumCompletions, inspectCurriculumHistory, loadCurriculumHistory, saveCurriculumCompletion,
} from '../src/data/curriculumProgress.js';
import { inspectCurriculumBadges, saveCurriculumBadge } from '../src/data/curriculumBadges.js';
import {
  curriculumPreferenceStorageKey, curriculumSessionStorageKey, inspectCurriculumPreferences,
  inspectCurriculumSession, saveCurriculumPreferences, saveCurriculumSession,
} from '../src/data/curriculumSession.js';
import { CURRICULUM_MODULES } from '../src/data/curriculumModules.js';

const memoryStorage = () => {
  const values = new Map();
  let writes = 0;
  return {
    values,
    get writes() { return writes; },
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { writes += 1; values.set(key, String(value)); },
  };
};

test('history advance is bounded, write/readback confirmed, and idempotent for the held transaction', () => {
  const storage = memoryStorage();
  for (let index = 0; index < 10; index += 1) {
    const result = commitCurriculumHistory(storage, 'askia', 'continents', 'starter', `tx-${index}`, `round-${index}`);
    assert.equal(result.status, 'saved');
  }
  assert.deepEqual(loadCurriculumHistory(storage, 'askia', 'continents', 'starter'), ['round-2', 'round-3', 'round-4', 'round-5', 'round-6', 'round-7', 'round-8', 'round-9']);
  const duplicate = commitCurriculumHistory(storage, 'askia', 'continents', 'starter', 'tx-9', 'round-9');
  assert.equal(duplicate.status, 'saved');
  assert.equal(duplicate.alreadyApplied, true);
  assert.equal(loadCurriculumHistory(storage, 'askia', 'continents', 'starter').length, 8);
});

test('history retry resumes its exact transaction after a failed write or readback', () => {
  const base = memoryStorage();
  const historyKey = curriculumHistoryStorageKey('amari', 'continents', 'growing');
  let failHistory = true;
  const flaky = {
    getItem: base.getItem,
    setItem(key, value) {
      if (key === historyKey && failHistory) { failHistory = false; throw Error('storage full once'); }
      base.setItem(key, value);
    },
  };
  assert.equal(commitCurriculumHistory(flaky, 'amari', 'continents', 'growing', 'same-tx', 'continent-asia').status, 'unconfirmed');
  assert.deepEqual(loadCurriculumHistory(base, 'amari', 'continents', 'growing'), []);
  assert.deepEqual(commitCurriculumHistory(flaky, 'amari', 'continents', 'growing', 'same-tx', 'continent-asia').history, ['continent-asia']);
  assert.deepEqual(commitCurriculumHistory(flaky, 'amari', 'continents', 'growing', 'same-tx', 'continent-asia').history, ['continent-asia']);

  const readbackBase = memoryStorage();
  const readbackKey = curriculumHistoryStorageKey('amari', 'nature-lab', 'starter');
  let lieOnce = true;
  let historyWasWritten = false;
  const readbackFlaky = {
    setItem(key, value) { readbackBase.setItem(key, value); if (key === readbackKey) historyWasWritten = true; },
    getItem(key) {
      if (key === readbackKey && historyWasWritten && lieOnce) { lieOnce = false; return null; }
      return readbackBase.getItem(key);
    },
  };
  assert.equal(commitCurriculumHistory(readbackFlaky, 'amari', 'nature-lab', 'starter', 'readback-tx', 'science-seasons').status, 'unconfirmed');
  const readbackRetry = commitCurriculumHistory(readbackFlaky, 'amari', 'nature-lab', 'starter', 'readback-tx', 'science-seasons');
  assert.equal(readbackRetry.status, 'saved');
  assert.deepEqual(readbackRetry.history, ['science-seasons']);
});

test('unreadable history is preserved instead of silently replaced', () => {
  const storage = memoryStorage();
  const key = curriculumHistoryStorageKey('askia', 'continents', 'starter');
  storage.setItem(key, '{bad');
  assert.equal(inspectCurriculumHistory(storage, 'askia', 'continents', 'starter').status, 'invalid');
  assert.notEqual(commitCurriculumHistory(storage, 'askia', 'continents', 'starter', 'tx', 'x').status, 'saved');
  assert.equal(storage.getItem(key), '{bad');
});

test('an invalid old history transaction preserves both its bytes and the history list', () => {
  const storage = memoryStorage();
  const txKey = curriculumHistoryTransactionKey('amari', 'continents', 'starter');
  const historyKey = curriculumHistoryStorageKey('amari', 'continents', 'starter');
  storage.setItem(txKey, 'not-json');
  storage.setItem(historyKey, JSON.stringify(['keep-this-history']));
  const beforeWrites = storage.writes;
  assert.equal(commitCurriculumHistory(storage, 'amari', 'continents', 'starter', 'new-tx', 'new-round').status, 'invalid');
  assert.equal(storage.getItem(txKey), 'not-json');
  assert.deepEqual(JSON.parse(storage.getItem(historyKey)), ['keep-this-history']);
  assert.equal(storage.writes, beforeWrites);
});

test('completion receipts preserve unknown fields and transition pending to confirmed', () => {
  const storage = memoryStorage();
  const key = curriculumCompletionStorageKey('amari');
  storage.setItem(key, JSON.stringify({ version: 1, extra: { keep: true }, completions: [] }));
  const pending = saveCurriculumCompletion(storage, 'amari', 'continents', 'starter', {
    status: 'pending', token: 'dino:curriculum:continents:starter', praise: 'Well done!',
  });
  assert.equal(pending.status, 'saved');
  const confirmed = saveCurriculumCompletion(storage, 'amari', 'continents', 'starter', {
    ...pending.receipt, status: 'confirmed',
  });
  assert.equal(confirmed.status, 'saved');
  assert.deepEqual(JSON.parse(storage.getItem(key)).extra, { keep: true });
  assert.equal(inspectCurriculumCompletions(storage, 'amari').value.completions[0].status, 'confirmed');
  assert.equal(saveCurriculumCompletion(storage, 'amari', 'continents', 'starter', {
    ...confirmed.receipt, token: 'different-token',
  }).status, 'invalid');
  assert.equal(saveCurriculumCompletion(storage, 'amari', 'continents', 'starter', {
    ...confirmed.receipt, praise: 'Different praise',
  }).status, 'conflict');
});

test('completion receipts are child scoped and never replace malformed records', () => {
  const storage = memoryStorage();
  storage.setItem('askia_curriculum_completion_receipts_v1', '{broken');
  assert.equal(inspectCurriculumCompletions(storage, 'askia').status, 'invalid');
  assert.notEqual(saveCurriculumCompletion(storage, 'askia', 'nature-lab', 'challenge', {
    status: 'pending', token: 'x', praise: 'Good work',
  }).status, 'saved');
  assert.equal(storage.getItem('askia_curriculum_completion_receipts_v1'), '{broken');
  assert.equal(inspectCurriculumCompletions(storage, 'amari').status, 'empty');
});

test('completion token must match its module and band before any write or parent callback', () => {
  const storage = memoryStorage();
  const key = curriculumCompletionStorageKey('amari');
  const badToken = 'dino:curriculum:nature-lab:starter';
  storage.setItem(key, JSON.stringify({ version: 1, completions: [{
    moduleId: 'continents', difficulty: 'starter', status: 'pending', token: badToken, praise: 'Nice work',
  }] }));
  const before = storage.getItem(key);
  assert.equal(inspectCurriculumCompletions(storage, 'amari').status, 'invalid');
  let parentCalls = 0;
  assert.equal(finishCurriculumPath(storage, 'amari', 'continents', 'starter', 'Praise', () => { parentCalls += 1; }).status, 'receipt-read-failed');
  assert.equal(saveCurriculumCompletion(storage, 'amari', 'continents', 'starter', {
    status: 'pending', token: badToken, praise: 'Nice work',
  }).status, 'invalid');
  assert.equal(parentCalls, 0);
  assert.equal(storage.getItem(key), before);
});

test('undefined storage reads are invalid, not empty, across all Curriculum stores', () => {
  let writes = 0;
  const storage = { getItem: () => undefined, setItem() { writes += 1; }, removeItem() { writes += 1; } };
  const rounds = CURRICULUM_MODULES[0].rounds.starter;
  assert.equal(inspectCurriculumPreferences(storage, 'amari').status, 'invalid');
  assert.equal(inspectCurriculumSession(storage, 'amari', 'continents', rounds, 'starter').status, 'invalid');
  assert.equal(inspectCurriculumBadges('amari', storage).status, 'invalid');
  assert.equal(inspectCurriculumHistory(storage, 'amari', 'continents', 'starter').status, 'invalid');
  assert.equal(inspectCurriculumCompletions(storage, 'amari').status, 'invalid');
  assert.equal(saveCurriculumPreferences(storage, 'amari', 'continents', 'starter').status, 'invalid');
  assert.equal(saveCurriculumSession(storage, 'amari', 'continents', rounds, {
    difficulty: 'starter', seed: 1, order: [0, 1, 2, 3, 4], cursor: 0, complete: false,
    lessonOpen: true, locked: false, selected: '', feedback: '', feedbackVoice: '',
    mistakes: 0, sequence: [], routeStep: 0, prediction: '',
  }).status, 'invalid');
  assert.equal(saveCurriculumBadge('amari', 'continents', 'starter', storage).status, 'invalid');
  assert.equal(commitCurriculumHistory(storage, 'amari', 'continents', 'starter', 'tx', 'round').status, 'invalid');
  assert.equal(writes, 0);
  assert.equal(storage.getItem(curriculumPreferenceStorageKey('amari')), undefined);
  assert.equal(storage.getItem(curriculumSessionStorageKey('amari', 'continents', 'starter')), undefined);
});

test('new completion calls parent immediately once per module and band, then records confirmation', () => {
  const storage = memoryStorage();
  const calls = [];
  const celebrate = (...args) => { calls.push(args); return { persisted: true, awardedPoints: 1 }; };
  const first = finishCurriculumPath(storage, 'amari', 'continents', 'starter', 'Nice exploring!', celebrate);
  assert.equal(first.status, 'saved');
  assert.deepEqual(calls[0].slice(1, 4), [4, 0, 'worldmap']);
  assert.equal(calls[0][4].rewardToken, 'dino:curriculum:continents:starter');
  assert.equal(inspectCurriculumCompletions(storage, 'amari').value.completions[0].status, 'confirmed');
  assert.equal(finishCurriculumPath(storage, 'amari', 'continents', 'starter', 'Replay praise', celebrate).status, 'saved');
  assert.equal(calls.length, 1);
});

test('failed parent confirmation holds the stable receipt and retries it without minting another token', () => {
  const storage = memoryStorage();
  const calls = [];
  let fail = true;
  const celebrate = (...args) => {
    calls.push(args);
    if (fail) { fail = false; return { persisted: false, awardedPoints: 0 }; }
    return { persisted: true, awardedPoints: 1 };
  };
  const first = finishCurriculumPath(storage, 'askia', 'nature-lab', 'challenge', 'Well done', celebrate);
  assert.equal(first.status, 'parent-reward-failed');
  const retry = finishCurriculumPath(storage, 'askia', 'nature-lab', 'challenge', 'Different praise', celebrate);
  assert.equal(retry.status, 'saved');
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[1], calls[0]);
  assert.equal(inspectCurriculumCompletions(storage, 'askia').value.completions[0].status, 'confirmed');
});

test('a legacy earned badge is preserved and creates no parent reward', () => {
  const storage = memoryStorage();
  storage.setItem('amari_curriculum_badges_v1', JSON.stringify(['continents:starter', 'future-badge']));
  let calls = 0;
  const result = finishCurriculumPath(storage, 'amari', 'continents', 'starter', 'Praise', () => { calls += 1; return { persisted: true }; });
  assert.equal(result.status, 'saved');
  assert.equal(calls, 0);
  assert.equal(inspectCurriculumCompletions(storage, 'amari').value.completions[0].status, 'legacy');
  assert.deepEqual(JSON.parse(storage.getItem('amari_curriculum_badges_v1')), ['continents:starter', 'future-badge']);
});
