import test from 'node:test';
import assert from 'node:assert/strict';
import { DINO_DETECTIVE_WORLDS, createDinoDetectiveRun } from '../src/data/dinoDetectiveBatch3.js';
import { getDinoDetectiveProgress, recordDinoDetectiveCompletion, rememberDinoDetectiveRun } from '../src/data/dinoDetectiveProgress.js';

const storage = () => { const values = new Map(); return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), values }; };

test('world rewards unlock sequentially and are scoped to completed worlds', () => {
  const store = storage();
  const run = createDinoDetectiveRun(0, 17);
  assert.equal(rememberDinoDetectiveRun('one', DINO_DETECTIVE_WORLDS[1].id, run.signature, store), null);
  assert.equal(recordDinoDetectiveCompletion('one', DINO_DETECTIVE_WORLDS[1].id, 3, Array.from({ length: 5 }, (_, i) => `${DINO_DETECTIVE_WORLDS[1].id}:round-${i + 1}`), store), null);
  const completion = recordDinoDetectiveCompletion('one', DINO_DETECTIVE_WORLDS[0].id, 3, Array.from({ length: 5 }, (_, i) => `${DINO_DETECTIVE_WORLDS[0].id}:round-${i + 1}`), store);
  assert.equal(completion.progress.unlockedWorldIndex, 1);
  assert.deepEqual(completion.progress.earnedWorldStickerIds, [DINO_DETECTIVE_WORLDS[0].stickerId]);
  const key = [...store.values.keys()][0];
  store.values.set(key, JSON.stringify({ version: 1, completedWorldIds: [], earnedWorldStickerIds: DINO_DETECTIVE_WORLDS.map(({ stickerId }) => stickerId) }));
  assert.deepEqual(getDinoDetectiveProgress('one', store).earnedWorldStickerIds, []);
});
