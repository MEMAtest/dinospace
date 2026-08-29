import test from 'node:test';
import assert from 'node:assert/strict';
import { getBookProgress, readActiveChildId, readStoryProgress, saveActiveChildId, updateStoryProgress } from '../src/data/storybookProfiles.js';

const storage = () => {
  const values = new Map();
  return { getItem: (key) => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
};

test('child story progress is isolated by child and contains no birth date', () => {
  const store = storage();
  saveActiveChildId('child-2', store);
  assert.equal(readActiveChildId(store), 'child-2');
  updateStoryProgress('child-1', 'book-a', { completed: true, favourite: true }, store);
  updateStoryProgress('child-2', 'book-a', { pageIndex: 4 }, store);
  const all = readStoryProgress(store);
  assert.deepEqual(getBookProgress(all, 'child-1', 'book-a').completed, true);
  assert.deepEqual(getBookProgress(all, 'child-2', 'book-a').pageIndex, 4);
  assert.equal(Object.keys(getBookProgress(all, 'child-1', 'book-a')).includes('birthDate'), false);
});
