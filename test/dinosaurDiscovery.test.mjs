import assert from 'node:assert/strict';
import test from 'node:test';
import { collectDiscoverySticker, DISCOVERY_CREATURES, DISCOVERY_HABITATS, readDiscoveryStickers } from '../src/data/dinosaurDiscovery.js';

test('the preschool roster includes the requested creatures across distinct habitats', () => {
  assert.equal(DISCOVERY_CREATURES.length, 24);
  assert.equal(new Set(DISCOVERY_CREATURES.map(item => item.id)).size, 24);
  assert.deepEqual(DISCOVERY_HABITATS.map(item => [item.id, item.creatures.length]), [['land', 19], ['sea', 3], ['sky', 2]]);
  for (const name of ['T-Rex', 'Triceratops', 'Spinosaurus', 'Elasmosaurus']) {
    assert.ok(DISCOVERY_CREATURES.some(item => item.name === name), name);
  }
});

test('sticker collection merges saved data, deduplicates and keeps players separate', () => {
  const storage = new Map();
  const adapter = { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) };
  assert.deepEqual(collectDiscoverySticker(adapter, 'askia', 'spino'), ['spino']);
  assert.deepEqual(collectDiscoverySticker(adapter, 'amari', 'trike'), ['trike']);
  assert.deepEqual(collectDiscoverySticker(adapter, 'askia', 'elasmo'), ['spino', 'elasmo']);
  assert.deepEqual(collectDiscoverySticker(adapter, 'askia', 'spino'), ['spino', 'elasmo']);
  assert.deepEqual(readDiscoveryStickers(adapter, 'amari'), ['trike']);
  const savedKey = 'askia_dinosaur_discovery_v1';
  storage.set(savedKey, '{"unreadable":true}');
  assert.throws(() => collectDiscoverySticker(adapter, 'askia', 'trex'));
  assert.equal(storage.get(savedKey), '{"unreadable":true}');
  assert.throws(() => collectDiscoverySticker(adapter, 'amari', 'unknown'));
  assert.deepEqual(readDiscoveryStickers(adapter, 'amari'), ['trike']);
});
