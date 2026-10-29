import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { GERMAN_AUDIO_SLUGS, getGermanAudioPath } from '../src/data/germanAudio.js';
import {
  applyGermanDriveCommand,
  buildGermanDriveRouteOrder,
  createGermanDriveState,
  GERMAN_DRIVE_COMMANDS,
  GERMAN_DRIVE_GRID_SIZE,
  GERMAN_DRIVE_ROUTES,
  GERMAN_DRIVE_SLOW_SPEED_MS,
  GERMAN_DRIVE_STEP_SPEED_MS,
} from '../src/data/germanRouteFlow.js';

const solveRoute = (route) => {
  let state = createGermanDriveState(route);
  for (const command of route.commands) {
    const result = applyGermanDriveCommand(route, state, command);
    assert.equal(result.accepted, true, `${route.id}/${command} should be a valid authored step`);
    state = result.state;
  }
  return state;
};

test('seven deterministic two-command routes use only the six recorded directions', () => {
  const ids = new Set(GERMAN_DRIVE_ROUTES.map(({ id }) => id));
  assert.equal(ids.size, 7);
  assert.deepEqual(buildGermanDriveRouteOrder(8742), buildGermanDriveRouteOrder(8742));
  assert.deepEqual(new Set(buildGermanDriveRouteOrder(8742).map(({ id }) => id)), ids);
  const commands = new Set(GERMAN_DRIVE_COMMANDS.map(({ id }) => id));
  for (const route of GERMAN_DRIVE_ROUTES) {
    assert.equal(route.commands.length, 2, `${route.id} has two bounded steps`);
    assert.ok(route.commands.every((command) => commands.has(command)), `${route.id} uses authored controls`);
    for (const command of route.commands) {
      const path = getGermanAudioPath(command);
      assert.ok(path, `${command} has a packaged clip`);
      assert.equal(existsSync(`public${path}`), true, `${command} clip exists`);
      assert.ok(GERMAN_AUDIO_SLUGS[command]);
    }
    const solved = solveRoute(route);
    assert.equal(solved.solved, true, `${route.id} reaches its goal`);
    assert.deepEqual(solved.position, route.goal);
    assert.equal(solved.step, 2);
  }
});

test('wrong command stays on the same grid square and same command step', () => {
  const route = GERMAN_DRIVE_ROUTES.find(({ id }) => id === 'straight-stop');
  const initial = createGermanDriveState(route);
  const wrong = applyGermanDriveCommand(route, initial, 'Links');
  assert.equal(wrong.accepted, false);
  assert.equal(wrong.reason, 'wrong-command');
  assert.deepEqual(wrong.state, initial);
  assert.deepEqual(wrong.state.position, [1, 3]);
  assert.equal(wrong.state.step, 0);
  assert.equal(wrong.expected, 'Geradeaus');
});

test('slow changes the next movement duration, while Halt stops only at the goal', () => {
  const slowRoute = GERMAN_DRIVE_ROUTES.find(({ id }) => id === 'slow-straight');
  const initial = createGermanDriveState(slowRoute);
  const slow = applyGermanDriveCommand(slowRoute, initial, 'Langsam');
  assert.equal(slow.accepted, true);
  assert.equal(slow.state.slowForNextMove, true);
  const move = applyGermanDriveCommand(slowRoute, slow.state, 'Geradeaus');
  assert.equal(move.accepted, true);
  assert.equal(move.state.moveDurationMs, GERMAN_DRIVE_SLOW_SPEED_MS);
  assert.ok(move.state.moveDurationMs > GERMAN_DRIVE_STEP_SPEED_MS);
  assert.equal(move.state.solved, true);

  const haltRoute = GERMAN_DRIVE_ROUTES.find(({ id }) => id === 'straight-stop');
  const atStart = createGermanDriveState(haltRoute);
  const tooSoon = applyGermanDriveCommand(haltRoute, atStart, 'Halt');
  assert.equal(tooSoon.accepted, false);
  assert.equal(tooSoon.reason, 'wrong-command');
  const atGoal = applyGermanDriveCommand(haltRoute, atStart, 'Geradeaus');
  const stop = applyGermanDriveCommand(haltRoute, atGoal.state, 'Halt');
  assert.equal(stop.accepted, true);
  assert.equal(stop.state.stopped, true);
  assert.equal(stop.state.solved, true);
});

test('off-board movement is rejected without changing the board or command step', () => {
  const route = { id: 'edge-case', start: [0, 0], goal: [0, 0], commands: ['Links', 'Halt'] };
  const state = { position: [0, 0], step: 0, slowForNextMove: false, stopped: false, solved: false, moveDurationMs: 0 };
  const result = applyGermanDriveCommand(route, state, 'Links');
  assert.equal(result.accepted, false);
  assert.equal(result.reason, 'off-board');
  assert.deepEqual(result.state, state);
  assert.ok(GERMAN_DRIVE_GRID_SIZE >= 4);
});

