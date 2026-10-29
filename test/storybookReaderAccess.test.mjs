import test from 'node:test';
import assert from 'node:assert/strict';
import { canWriteStoryForReader, getStoryReaderAccess, readActiveStoryReader, resolveVerifiedStoryReader } from '../src/data/storybookReaderAccess.js';

const profiles = [
  { id: 'amari', displayName: 'Amari' },
  { id: 'askia', displayName: 'Askia' },
];

test('reader access stays read-only until inventory is available and exact id is confirmed', () => {
  for (const status of ['loading', 'unavailable', 'unreadable']) {
    assert.equal(getStoryReaderAccess(status, profiles, 'askia').verified, false);
    assert.equal(canWriteStoryForReader(status, profiles, 'askia'), false);
  }
  assert.equal(getStoryReaderAccess('available', profiles, 'askia').profile.displayName, 'Askia');
  assert.equal(canWriteStoryForReader('available', profiles, 'askia'), true);
});

test('confirmed missing id offers a verified fallback but never treats it as the requested reader', () => {
  const access = getStoryReaderAccess('available', profiles, 'deleted-reader');
  assert.equal(access.verified, false);
  assert.equal(access.reason, 'missing');
  assert.equal(access.fallbackProfile.id, 'amari');
  assert.equal(canWriteStoryForReader('available', profiles, 'deleted-reader'), false);
  assert.equal(canWriteStoryForReader('available', profiles, 'amari'), true);
});

test('a stale async action cannot write after the active reader changes', () => {
  assert.equal(canWriteStoryForReader('available', profiles, 'amari', 'askia'), false);
  assert.equal(canWriteStoryForReader('available', profiles, 'askia', 'askia'), true);
});

test('a blocked active-reader key never silently falls back to Amari even when profiles are available', () => {
  const unreadable = readActiveStoryReader({ getItem() { throw new Error('blocked'); } });
  assert.equal(unreadable.ok, false);
  assert.equal(unreadable.status, 'unreadable');
  assert.equal(unreadable.id, null);
  assert.equal(getStoryReaderAccess('available', profiles, 'amari', unreadable.ok).verified, false);
  assert.equal(canWriteStoryForReader('available', profiles, 'amari', 'amari', unreadable.ok), false);
  assert.equal(canWriteStoryForReader('available', profiles, 'askia', 'askia', true), true);
});

test('only an actually absent reader preference defaults to Amari', () => {
  assert.deepEqual(readActiveStoryReader({ getItem: () => null }), { ok: true, status: 'fresh', id: 'amari' });
  assert.equal(readActiveStoryReader({ getItem: () => 'bad id' }).ok, false);
});

test('fallback is chosen only after a readable active id is confirmed missing from available profiles', () => {
  assert.deepEqual(resolveVerifiedStoryReader({ ok: false, id: null }, profiles), {
    ok: false, profile: null, shouldPersist: false, reason: 'preference-unavailable',
  });
  assert.deepEqual(resolveVerifiedStoryReader({ ok: true, id: 'askia' }, profiles), {
    ok: true, profile: profiles[1], shouldPersist: false, reason: 'matched',
  });
  assert.deepEqual(resolveVerifiedStoryReader({ ok: true, id: 'removed' }, profiles), {
    ok: true, profile: profiles[0], shouldPersist: true, reason: 'confirmed-missing',
  });
});
