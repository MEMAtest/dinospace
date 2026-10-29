import test from 'node:test';
import assert from 'node:assert/strict';
import { CURRICULUM_BADGES, awardCurriculumBadge, inspectCurriculumBadges, loadCurriculumBadges, saveCurriculumBadge } from '../src/data/curriculumBadges.js';

const memoryStorage = () => {
  const values = new Map();
  return { values, getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
};

test('completed curriculum paths persist per child without duplicate or invented rewards', () => {
  const storage = memoryStorage();
  assert.equal(new Set(CURRICULUM_BADGES.map((badge) => badge.id)).size, 9);
  assert.deepEqual(loadCurriculumBadges('amari', storage), []);
  assert.equal(saveCurriculumBadge('amari', 'continents', 'starter', storage).status, 'saved');
  assert.equal(awardCurriculumBadge('amari', 'continents', 'starter', storage).length, 1);
  assert.equal(saveCurriculumBadge('amari', 'nature-lab', 'challenge', storage).status, 'saved');
  assert.deepEqual(loadCurriculumBadges('amari', storage), ['continents:starter', 'nature-lab:challenge']);
  assert.deepEqual(loadCurriculumBadges('askia', storage), []);
  assert.equal(saveCurriculumBadge('amari', 'not-a-module', 'starter', storage).status, 'invalid');
});

test('unknown valid legacy badge values survive a confirmed award', () => {
  const storage = memoryStorage();
  storage.setItem('amari_curriculum_badges_v1', JSON.stringify(['invented-old-badge', 'continents:starter']));
  const result = saveCurriculumBadge('amari', 'nature-lab', 'challenge', storage);
  assert.equal(result.status, 'saved');
  assert.deepEqual(JSON.parse(storage.getItem('amari_curriculum_badges_v1')), ['invented-old-badge', 'continents:starter', 'nature-lab:challenge']);
  assert.deepEqual(loadCurriculumBadges('amari', storage), ['continents:starter', 'nature-lab:challenge']);
});

test('malformed badges are never replaced with a default empty list', () => {
  const storage = memoryStorage();
  storage.setItem('amari_curriculum_badges_v1', '{broken');
  assert.equal(inspectCurriculumBadges('amari', storage).status, 'invalid');
  assert.equal(saveCurriculumBadge('amari', 'continents', 'starter', storage).status, 'invalid');
  assert.equal(storage.getItem('amari_curriculum_badges_v1'), '{broken');
});

test('write or readback failure is returned, never reported as saved', () => {
  assert.equal(saveCurriculumBadge('amari', 'continents', 'starter', { getItem: () => null, setItem() { throw Error('blocked'); } }).status, 'unconfirmed');
  assert.equal(saveCurriculumBadge('amari', 'continents', 'starter', { getItem: () => null, setItem() {} }).status, 'unconfirmed');
});
