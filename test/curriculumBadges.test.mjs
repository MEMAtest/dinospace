import test from 'node:test';
import assert from 'node:assert/strict';
import { CURRICULUM_BADGES, awardCurriculumBadge, loadCurriculumBadges } from '../src/data/curriculumBadges.js';

test('completed curriculum paths persist per child without duplicate or invented rewards', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  assert.equal(new Set(CURRICULUM_BADGES.map((badge) => badge.id)).size, 9);
  assert.deepEqual(loadCurriculumBadges('qa-a', storage), []);
  awardCurriculumBadge('qa-a', 'continents', 'starter', storage);
  awardCurriculumBadge('qa-a', 'continents', 'starter', storage);
  awardCurriculumBadge('qa-a', 'nature-lab', 'challenge', storage);
  assert.deepEqual(loadCurriculumBadges('qa-a', storage), ['continents:starter', 'nature-lab:challenge']);
  assert.deepEqual(loadCurriculumBadges('qa-b', storage), []);
  assert.deepEqual(awardCurriculumBadge('qa-a', 'not-a-module', 'starter', storage), ['continents:starter', 'nature-lab:challenge']);
  assert.deepEqual(loadCurriculumBadges('qa-a', { getItem: () => '["invented","continents:starter","continents:starter"]' }), ['continents:starter']);
  assert.deepEqual(loadCurriculumBadges('qa-a', { getItem: () => '{invalid' }), []);
  assert.doesNotThrow(() => awardCurriculumBadge('qa-a', 'continents', 'starter', { getItem: () => null, setItem: () => { throw Error('unavailable'); } }));
});
