import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCountObjects, countCentersAreSafe } from '../src/data/countTheStarsBatch3.js';

test('all phone and desktop count layouts fit their touch targets without overlap', () => {
  for (let count = 1; count <= 20; count += 1) {
    for (const layout of ['grouped', 'orbit']) {
      const objects = buildCountObjects(count, 20261023, `count-uplift-${count}-${layout}`, layout);
      assert.equal(objects.length, count, `${layout} count ${count} has the right number of objects`);
      assert.ok(
        countCentersAreSafe(objects, 308, 308, 48),
        `${layout} count ${count} fits 48px phone targets on the 308px board`,
      );
      assert.ok(
        countCentersAreSafe(objects, 440, 440, 56),
        `${layout} count ${count} fits 56px desktop targets on the 440px board`,
      );
    }
  }
});
