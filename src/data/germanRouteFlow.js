import { germanRandomFor } from './germanLearning.js';

export const GERMAN_DRIVE_GRID_SIZE = 4;
export const GERMAN_DRIVE_STEP_SPEED_MS = 260;
export const GERMAN_DRIVE_SLOW_SPEED_MS = 760;

export const GERMAN_DRIVE_COMMANDS = Object.freeze([
  Object.freeze({ id: 'Links', english: 'left', icon: '⬅️', kind: 'move', dx: -1, dy: 0 }),
  Object.freeze({ id: 'Rechts', english: 'right', icon: '➡️', kind: 'move', dx: 1, dy: 0 }),
  Object.freeze({ id: 'Geradeaus', english: 'straight ahead', icon: '⬆️', kind: 'move', dx: 0, dy: -1 }),
  Object.freeze({ id: 'Zurück', english: 'back', icon: '⬇️', kind: 'move', dx: 0, dy: 1 }),
  Object.freeze({ id: 'Langsam', english: 'slowly', icon: '🐢', kind: 'slow' }),
  Object.freeze({ id: 'Halt', english: 'stop', icon: '🛑', kind: 'halt' }),
]);

const route = (id, start, goal, commands) => Object.freeze({
  id,
  start: Object.freeze(start),
  goal: Object.freeze(goal),
  commands: Object.freeze(commands),
});

// Each route contains exactly two spoken command words. Straight ahead moves
// toward the top of the board; Zurück moves toward the bottom. Slow affects
// the next movement, while Halt only completes after the car reaches its star.
export const GERMAN_DRIVE_ROUTES = Object.freeze([
  route('straight-stop', [1, 3], [1, 2], ['Geradeaus', 'Halt']),
  route('right-straight', [0, 2], [1, 1], ['Rechts', 'Geradeaus']),
  route('slow-straight', [2, 3], [2, 2], ['Langsam', 'Geradeaus']),
  route('left-stop', [3, 2], [2, 2], ['Links', 'Halt']),
  route('back-right', [1, 0], [2, 1], ['Zurück', 'Rechts']),
  route('forward-back', [0, 1], [0, 1], ['Geradeaus', 'Zurück']),
  route('slow-left', [3, 3], [2, 3], ['Langsam', 'Links']),
]);

const commandById = new Map(GERMAN_DRIVE_COMMANDS.map((command) => [command.id, command]));

export function buildGermanDriveRouteOrder(seed) {
  const random = germanRandomFor(seed);
  const routes = [...GERMAN_DRIVE_ROUTES];
  for (let index = routes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [routes[index], routes[swapIndex]] = [routes[swapIndex], routes[index]];
  }
  return routes;
}

export function createGermanDriveState(routeDefinition) {
  if (!GERMAN_DRIVE_ROUTES.some((candidate) => candidate.id === routeDefinition?.id)) return null;
  return {
    position: [...routeDefinition.start],
    step: 0,
    slowForNextMove: false,
    stopped: false,
    solved: false,
    moveDurationMs: 0,
  };
}

export function applyGermanDriveCommand(routeDefinition, state, commandId) {
  if (!routeDefinition || !state || state.solved || state.stopped || state.step >= routeDefinition.commands.length) {
    return { accepted: false, reason: 'route-finished', state };
  }
  const expected = routeDefinition.commands[state.step];
  if (commandId !== expected) return { accepted: false, reason: 'wrong-command', expected, state };
  const command = commandById.get(commandId);
  if (!command) return { accepted: false, reason: 'unknown-command', state };

  let position = [...state.position];
  let slowForNextMove = state.slowForNextMove;
  let stopped = false;
  let moveDurationMs = 0;
  if (command.kind === 'move') {
    position = [position[0] + command.dx, position[1] + command.dy];
    if (position.some((value) => !Number.isInteger(value) || value < 0 || value >= GERMAN_DRIVE_GRID_SIZE)) {
      return { accepted: false, reason: 'off-board', expected, state };
    }
    moveDurationMs = slowForNextMove ? GERMAN_DRIVE_SLOW_SPEED_MS : GERMAN_DRIVE_STEP_SPEED_MS;
    slowForNextMove = false;
  } else if (command.kind === 'slow') {
    slowForNextMove = true;
  } else if (command.kind === 'halt') {
    if (position[0] !== routeDefinition.goal[0] || position[1] !== routeDefinition.goal[1]) {
      return { accepted: false, reason: 'stop-before-goal', expected, state };
    }
    stopped = true;
  }

  const step = state.step + 1;
  const atGoal = position[0] === routeDefinition.goal[0] && position[1] === routeDefinition.goal[1];
  const solved = step === routeDefinition.commands.length && atGoal;
  if (step === routeDefinition.commands.length && !solved) return { accepted: false, reason: 'route-missed-goal', expected, state };
  return {
    accepted: true,
    command,
    state: { position, step, slowForNextMove, stopped: stopped || solved, solved, moveDurationMs },
  };
}

