import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { SHADOW_DINO_ART } from '../src/data/shadowMatchArt.js';
import { SHADOW_DINO_KINDS } from '../src/data/shadowMatchProgression.js';

test('every playable shadow dinosaur has a distinct small transparent WebP asset', async () => {
  assert.deepEqual(Object.keys(SHADOW_DINO_ART).sort(), [...SHADOW_DINO_KINDS].sort());
  assert.equal(new Set(Object.values(SHADOW_DINO_ART)).size, 12);
  let total = 0;
  for (const [kind, url] of Object.entries(SHADOW_DINO_ART)) {
    const path = 'public' + url;
    const bytes = await readFile(path);
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', kind);
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', kind);
    assert.equal(bytes.toString('ascii', 12, 16), 'VP8X', kind);
    assert.ok(bytes[20] & 0x10, kind + ' needs real alpha for its silhouette');
    total += (await stat(path)).size;
  }
  assert.ok(total < 1500 * 1024, 'twelve illustrations stay below 1500 KiB combined');
});
