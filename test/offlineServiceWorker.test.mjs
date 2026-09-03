import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('the offline library installs in bounded batches', async () => {
  const worker = await readFile('public/sw.js', 'utf8');

  assert.match(worker, /const CACHE_NAME = 'amari-discovery-v12'/);
  assert.match(worker, /cacheInBatches\(cache, PRECACHE_ASSETS\)/);
  assert.match(worker, /batchSize = 24/);
  assert.match(worker, /cache\.match\(asset\)/);
  assert.match(worker, /maxAttempts = 3/);
  assert.match(worker, /cacheAsset\(cache, asset\)/);
  assert.doesNotMatch(worker, /cache\.addAll\(APP_SHELL\)/);
});
