import test from 'node:test';
import assert from 'node:assert/strict';
import { clockTimeAtPoint } from '../src/data/timeLineInteraction.js';

test('pointer positions snap to quarter minutes and preserve elapsed time at twelve', () => {
  assert.deepEqual(clockTimeAtPoint({ hour: 12, minute: 45 }, 'minute', 100, 10), { hour: 1, minute: 0 });
  assert.deepEqual(clockTimeAtPoint({ hour: 1, minute: 0 }, 'minute', 10, 100), { hour: 12, minute: 45 });
  assert.deepEqual(clockTimeAtPoint({ hour: 3, minute: 0 }, 'minute', 190, 100), { hour: 3, minute: 15 });
  assert.deepEqual(clockTimeAtPoint({ hour: 3, minute: 15 }, 'minute', 100, 190), { hour: 3, minute: 30 });
  assert.deepEqual(clockTimeAtPoint({ hour: 3, minute: 30 }, 'minute', 10, 100), { hour: 3, minute: 45 });
  assert.deepEqual(clockTimeAtPoint({ hour: 3, minute: 45 }, 'minute', 100, 10), { hour: 4, minute: 0 });
});
test('hour setting preserves the minutes and all twelve dial targets are reachable', () => {
  for (let hour = 1; hour <= 12; hour++) {
    const angle = hour * Math.PI / 6;
    assert.deepEqual(clockTimeAtPoint({ hour: 12, minute: 30 }, 'hour', 100 + 65 * Math.sin(angle), 100 - 65 * Math.cos(angle)), { hour, minute: 30 });
  }
});
