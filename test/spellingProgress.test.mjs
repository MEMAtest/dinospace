import assert from 'node:assert/strict';
import test from 'node:test';
import { WRITING_SAMPLES_KEY } from '../src/data/literacy.js';
import { commitSpellingAttempt, commitSpellingWritingSample, readSpellingProgress, SPELLING_PROGRESS_KEY } from '../src/data/spellingProgress.js';

const attempt = {
  word: 'CAT',
  transactionId: 'attempt-1',
  independent: true,
  hadMistake: false,
  mode: 'spell',
  today: '2026-10-29',
};

function makeStorage(initial = null) {
  const values = new Map(initial === null ? [] : [[SPELLING_PROGRESS_KEY, initial]]);
  return {
    values,
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, value); },
  };
}

test('spelling progress commit preserves legacy rows and unknown metadata, and duplicate retry is idempotent', () => {
  const storage = makeStorage(JSON.stringify({
    customMetadata: { source: 'legacy' },
    SAT: { attempts: 4, independentFirstTry: 2, independentDays: ['2026-10-01'], needsPractice: 1, customRow: 'keep' },
  }));
  const first = commitSpellingAttempt(storage, attempt);
  assert.equal(first.ok, true);
  assert.equal(first.duplicate, false);
  assert.equal(first.progress.customMetadata.source, 'legacy');
  assert.equal(first.progress.SAT.customRow, 'keep');
  assert.equal(first.progress.SAT.attempts, 4);
  assert.equal(first.progress.CAT.attempts, 1);
  assert.equal(first.progress.CAT.independentFirstTry, 1);
  assert.deepEqual(first.progress.CAT.independentDays, ['2026-10-29']);
  const duplicate = commitSpellingAttempt(storage, attempt);
  assert.equal(duplicate.ok, true);
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.progress.CAT.attempts, 1);
  assert.equal(JSON.parse(storage.getItem(SPELLING_PROGRESS_KEY)).CAT.attempts, 1);
});

test('unreadable storage getter fails closed before any spelling write', () => {
  let writes = 0;
  const storage = {
    getItem() { throw new Error('SecurityError'); },
    setItem() { writes += 1; },
  };
  assert.equal(readSpellingProgress(storage).ok, false);
  const result = commitSpellingAttempt(storage, attempt);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'unreadable');
  assert.equal(writes, 0);
});

test('empty, malformed and structurally invalid legacy data are preserved without writes', () => {
  for (const raw of ['', '{broken', '[]', JSON.stringify({ CAT: null })]) {
    const storage = makeStorage(raw);
    const result = commitSpellingAttempt(storage, attempt);
    assert.equal(result.ok, false);
    assert.equal(storage.getItem(SPELLING_PROGRESS_KEY), raw);
  }
});

test('write and readback failures hold the attempt until retry verifies the same transaction', () => {
  const values = new Map();
  let reads = 0;
  const storage = {
    getItem(key) {
      reads += 1;
      if (reads === 2) throw new Error('readback unavailable');
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) { values.set(key, value); },
  };
  const first = commitSpellingAttempt(storage, attempt);
  assert.equal(first.ok, false);
  assert.equal(first.reason, 'readback-failed');
  const retry = commitSpellingAttempt(storage, attempt);
  assert.equal(retry.ok, true);
  assert.equal(retry.duplicate, true);
  assert.equal(retry.progress.CAT.attempts, 1);

  const writeBlocked = {
    getItem() { return null; },
    setItem() { throw new Error('quota'); },
  };
  const blocked = commitSpellingAttempt(writeBlocked, { ...attempt, transactionId: 'attempt-2' });
  assert.equal(blocked.ok, false);
  assert.equal(blocked.reason, 'write-failed');
});

test('readback mismatch is not presented as a completed save', () => {
  const storage = { getItem() { return null; }, setItem() {} };
  const result = commitSpellingAttempt(storage, attempt);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'readback-mismatch');
});

test('caption draft save preserves earlier samples and retry after readback failure is idempotent', () => {
  const prior = [{ id: 'older', prompt: 'A CAT SAT.', response: 'A cat sat.' }];
  const storage = makeStorage();
  storage.values.set(WRITING_SAMPLES_KEY, JSON.stringify(prior));
  let reads = 0;
  const wrapped = {
    getItem(key) {
      reads += 1;
      if (key === WRITING_SAMPLES_KEY && reads === 2) throw new Error('readback unavailable');
      return storage.getItem(key);
    },
    setItem: (key, value) => storage.setItem(key, value),
  };
  const sample = { id: 'draft-1', prompt: 'A CAT SAT.', response: 'A cat sat.', savedAt: '2026-10-29T00:00:00.000Z', reviewed: false };
  assert.equal(commitSpellingWritingSample(wrapped, sample).ok, false);
  const retry = commitSpellingWritingSample(wrapped, sample);
  assert.equal(retry.ok, true);
  assert.equal(retry.duplicate, true);
  assert.deepEqual(retry.samples.map(({ id }) => id), ['older', 'draft-1']);
});

test('caption draft malformed storage fails closed without replacing prior bytes', () => {
  const storage = makeStorage();
  storage.values.set(WRITING_SAMPLES_KEY, '{broken');
  const original = storage.getItem(WRITING_SAMPLES_KEY);
  const result = commitSpellingWritingSample(storage, { id: 'draft-2', prompt: 'A CAT SAT.', response: 'A cat sat.' });
  assert.equal(result.ok, false);
  assert.equal(storage.getItem(WRITING_SAMPLES_KEY), original);
});
