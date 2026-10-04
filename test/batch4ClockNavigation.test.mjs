import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { gameReturnRoute, nextRouteHistoryState, parseRoute, routeHash, startupNavigation } from '../src/navigation.js';

test('related clock lessons retain their curriculum origin across reload and same-game replacement', () => {
  const curriculum = { name: 'game', id: 'worldmap', module: 'time-detectives' };
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

test('the specific time lesson survives URL reload without accepting unknown modules', () => {
  const lesson = { name: 'game', id: 'worldmap', module: 'time-detectives' };
  assert.deepEqual(parseRoute(routeHash(lesson)), lesson);
  assert.deepEqual(parseRoute('#/play/worldmap/arbitrary'), { name: 'game', id: 'worldmap' });
  assert.equal(routeHash({ name: 'game', id: 'addition', module: 'time-detectives' }), '#/play/addition');
});

test('application startup preserves reload routes and known origin while fresh visits reset safely', () => {
  const state = { depth: 4, clockLessonOrigin: 'worldmap', arbitrary: 'ignored' };
  const restored = startupNavigation('#/play/timeteller', state, 'reload');
  assert.deepEqual(restored, { hash: '#/play/timeteller', state: { depth: 4, clockLessonOrigin: 'worldmap' } });
  assert.deepEqual(gameReturnRoute(parseRoute(restored.hash), restored.state), { name: 'game', id: 'worldmap', module: 'time-detectives' });
  assert.deepEqual(startupNavigation('#/play/timeteller', state, 'navigate'), { hash: '#/', state: { depth: 0 } });
  assert.deepEqual(startupNavigation('#/play/worldmap/time-detectives', { depth: 2 }, 'back_forward'), { hash: '#/play/worldmap/time-detectives', state: { depth: 2 } });
  assert.deepEqual(startupNavigation('#/invalid', state, 'reload'), { hash: '#/', state: { depth: 0 } });
  assert.deepEqual(startupNavigation('#/play/addition', { depth: -5, clockLessonOrigin: 'worldmap' }, 'reload'), { hash: '#/play/addition', state: { depth: 0 } });
});

test('hash router binds related-clock history state to navigate, popstate restoration, and Back', async () => {
  const hook = await readFile(new URL('../src/hooks/useHashRouter.js', import.meta.url), 'utf8');
  assert.match(hook, /import \{ gameReturnRoute, nextRouteHistoryState, parseRoute, routeHash \}/);
  assert.match(hook, /useRef\(window\.history\.state\)/);
  assert.match(hook, /nextRouteHistoryState\(routeRef\.current, next, routeStateRef\.current, depth\)/);
  assert.match(hook, /window\.history\[replace \? 'replaceState' : 'pushState'\]\(nextState/);
  assert.match(hook, /routeStateRef\.current = window\.history\.state/);
  assert.match(hook, /gameReturnRoute\(from, routeStateRef\.current\)/);
});
