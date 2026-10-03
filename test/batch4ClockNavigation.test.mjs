import test from 'node:test';
import assert from 'node:assert/strict';
import { gameReturnRoute, nextRouteHistoryState } from '../src/navigation.js';

test('related clock lessons retain their curriculum origin across reload and same-game replacement', () => {
  const curriculum = { name: 'game', id: 'worldmap' };
  const clock = { name: 'game', id: 'timeteller' };
  const state = nextRouteHistoryState(curriculum, clock, { depth: 2 }, 3);
  assert.deepEqual(gameReturnRoute(clock, JSON.parse(JSON.stringify(state))), curriculum);
  const replaced = nextRouteHistoryState(clock, clock, state, 3);
  assert.deepEqual(gameReturnRoute(clock, replaced), curriculum);
  assert.equal(replaced.depth, 3);
});

test('ordinary Maths entry and unrelated games do not inherit a curriculum return', () => {
  const clock = { name: 'game', id: 'timeteller' };
  const maths = { name: 'world', id: 'maths' };
  const state = nextRouteHistoryState(maths, clock, { clockLessonOrigin: 'worldmap' }, 3);
  assert.equal(state.clockLessonOrigin, undefined);
  assert.equal(gameReturnRoute(clock, state).name, 'world');
  const addition = { name: 'game', id: 'addition' };
  assert.equal(nextRouteHistoryState(clock, addition, { clockLessonOrigin: 'worldmap' }, 4).clockLessonOrigin, undefined);
  assert.equal(gameReturnRoute(addition, { clockLessonOrigin: 'worldmap' }).name, 'world');
  assert.equal(gameReturnRoute(clock, { clockLessonOrigin: 'arbitrary' }).name, 'world');
});
