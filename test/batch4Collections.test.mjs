import test from 'node:test';
import assert from 'node:assert/strict';
import { getBatch4Collections } from '../src/data/batch4Collections.js';

const fixture = () => {
  const data = new Map();
  let writes = 0;
  return {
    getItem: (key) => data.get(key) || null,
    setItem: (key, value) => { data.set(key, value); writes += 1; },
    get writes() { return writes; },
  };
};

test('four chapter collections read the matching child and never grant rewards when opened', () => {
  const storage = fixture();
  const definitions = getBatch4Collections('amari', storage);
  assert.equal(definitions.length, 4);
  assert.equal(definitions.flatMap(({ entries }) => entries).length, 12);
  for (const collection of definitions) {
    const ids = collection.entries.map(({ id }) => id.slice(collection.id.length + 1));
    storage.setItem(`amari_${collection.id}_progress_v1`, JSON.stringify({
      version: 1, completedChapterIds: ids,
      bestStars: Object.fromEntries(ids.map((id) => [id, 2])),
    }));
  }
  const before = storage.writes;
  assert.equal(getBatch4Collections('amari', storage).flatMap(({ entries }) => entries).filter(({ earned }) => earned).length, 12);
  assert.equal(getBatch4Collections('askia', storage).flatMap(({ entries }) => entries).filter(({ earned }) => earned).length, 0);
  assert.equal(storage.writes, before);
});

test('orphan future chapter records cannot appear as earned collection badges', () => {
  const storage = fixture();
  for (const collection of getBatch4Collections('amari', storage)) {
    const lastId = collection.entries[2].id.slice(collection.id.length + 1);
    storage.setItem(`amari_${collection.id}_progress_v1`, JSON.stringify({
      version: 1, completedChapterIds: [lastId], bestStars: { [lastId]: 3 }, unlockedChapter: 2,
    }));
  }
  assert.equal(getBatch4Collections('amari', storage).flatMap(({ entries }) => entries).some(({ earned }) => earned), false);
});
