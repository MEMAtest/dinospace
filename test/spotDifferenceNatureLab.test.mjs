import assert from 'node:assert/strict';
import test from 'node:test';
import { SPOT_DIFFERENCE_SCENES, resolveSpotDifferenceTap } from '../src/data/spotDifferenceBatch2.js';

test('Nature Lab pairs the seven physical edits with bounded, reachable regions', () => {
  const scene = SPOT_DIFFERENCE_SCENES.find(({ title }) => title === 'Nature Lab');
  assert.ok(scene);
  assert.equal(scene.aspectRatio, 1);
  assert.equal(scene.pairedArt, true);
  assert.ok(scene.image.endsWith('/nature-lab-leaves-3d.webp'));
  assert.ok(scene.imageB.endsWith('/nature-lab-leaves-3d-variant-b.webp'));
  assert.equal(scene.editRegions.length, 7);
  assert.equal(scene.differences.length, 7);

  const labels = scene.differences.map(({ label }) => label);
  for (const fragment of ['oak-shaped', 'round', 'seedling', 'teal', 'red', 'tan', 'pointed']) {
    assert.ok(labels.some((label) => label.includes(fragment)), `missing authored label detail: ${fragment}`);
  }

  for (const [index, region] of scene.editRegions.entries()) {
    const target = scene.differences[index];
    assert.ok(region.x >= 0 && region.y >= 0 && region.width > 0 && region.height > 0);
    assert.ok(region.x + region.width <= 100 && region.y + region.height <= 100);
    assert.ok(target.x >= region.x && target.x <= region.x + region.width);
    assert.ok(target.y >= region.y && target.y <= region.y + region.height);
    assert.equal(target.radius, 10, 'radius 10 gives a 56px diameter on the 280px board');
    assert.ok(target.x >= 10 && target.x <= 90 && target.y >= 10 && target.y <= 90, '56px target stays fully inside the square board');
    assert.equal(resolveSpotDifferenceTap(scene.differences, [], target.x, target.y).difference.id, target.id);

    for (const other of scene.differences.slice(index + 1)) {
      const separatedByTargetSize = Math.abs(target.x - other.x) >= 20 || Math.abs(target.y - other.y) >= 20;
      assert.ok(separatedByTargetSize, `56px target boxes overlap: ${target.id} and ${other.id}`);
    }
  }
});
