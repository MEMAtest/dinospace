export const BOARD_SIZE = 5;
export const MAX_PROGRAM_BLOCKS = 24;
export const MAX_EXPANDED_INSTRUCTIONS = 72;

const wall = (x, y) => ({ x, y });
const mission = (id, chapterId, title, skill, prompt, tip, start, goal, options = {}) => ({
  id, chapterId, title, skill, prompt, tip, start, goal,
  walls: [], initial: [], allowedBlocks: ['forward', 'left', 'right'], ...options,
});

// Preserve the first three authored ids and the old numeric save-slot order.
const firstRoute = mission('first-route', 'sequence', '1 · Reach the flag', 'Sequence', 'Build a program to move Pip to the flag.', 'Add one Forward block for each square to the flag.', { x: 0, y: 2, direction: 1 }, { x: 3, y: 2 }, { allowedBlocks: ['forward'], guidedBlocks: ['forward', 'forward', 'forward'] });
const debugTurn = mission('debug-turn', 'debug', '5 · Fix the wrong turn', 'Debug', 'This saved program turns too soon. Run it, find the mistake, and edit the code.', 'Pip must go north two squares, then turn east and move two squares.', { x: 0, y: 4, direction: 0 }, { x: 2, y: 2 }, { initial: ['forward', 'right', 'forward', 'forward'], allowedBlocks: ['forward', 'left', 'right'], debugLesson: 'The first turn happens before Pip reaches the corner.' });
const repeatRescue = mission('repeat-rescue', 'repeat', '9 · Collect the sample', 'Repeat', 'Guide Pip to the sample, collect it, then shorten the route with Repeat.', 'Three Forward blocks can become one Repeat 3 × Forward block.', { x: 0, y: 4, direction: 0 }, { x: 3, y: 1 }, { sample: { x: 3, y: 1 }, requiredRepeats: 2, maxProgramBlocks: 4, allowedBlocks: ['forward', 'left', 'right', 'collect', 'repeat3'], guidedBlocks: ['repeat3', 'right', 'repeat3', 'collect'] });

// Additional authored missions deepen each skill; each has a distinct board and goal.
export const MISSIONS = [
  firstRoute,
  debugTurn,
  repeatRescue,
  mission('sequence-detour', 'sequence', '2 · Find a way around the wall', 'Sequence', 'Reach the flag by routing around the rock wall.', 'Pip can turn, move around the wall, and turn toward the flag.', { x: 0, y: 2, direction: 1 }, { x: 4, y: 2 }, { walls: [wall(2, 2)], guidedBlocks: ['left', 'forward', 'right', 'forward', 'forward', 'forward', 'forward', 'right', 'forward'], allowedBlocks: ['forward', 'left', 'right'] }),
  mission('sequence-sample', 'sequence', '3 · Stop for the sample', 'Sequence', 'Visit the sample, collect it, and finish at the flag.', 'Collect works only when Pip is standing on the diamond.', { x: 0, y: 4, direction: 1 }, { x: 4, y: 4 }, { sample: { x: 2, y: 4 }, guidedBlocks: ['forward', 'forward', 'collect', 'forward', 'forward'], allowedBlocks: ['forward', 'collect'] }),
  mission('sequence-independent', 'sequence', '4 · Build your own route', 'Independent build', 'Build a route around the wall and reach the flag. Several programs can work.', 'Plan a route around the wall. Run or Step to test your own code.', { x: 0, y: 4, direction: 1 }, { x: 4, y: 0 }, { walls: [wall(2, 4)], allowedBlocks: ['forward', 'left', 'right'] }),
  mission('debug-wall', 'debug', '6 · Debug the blocked route', 'Debug', 'This program runs into a wall. Edit it so Pip reaches the flag.', 'A turn lets Pip travel around the wall before turning back toward the goal.', { x: 0, y: 2, direction: 1 }, { x: 4, y: 2 }, { walls: [wall(2, 2)], initial: ['forward', 'forward', 'forward', 'forward'], allowedBlocks: ['forward', 'left', 'right'] }),
  mission('debug-collect', 'debug', '7 · Move Collect to the sample', 'Debug', 'The Collect block is too early. Move it after Pip reaches the sample.', 'Pip must stand on the diamond when Collect runs.', { x: 0, y: 4, direction: 1 }, { x: 4, y: 4 }, { sample: { x: 2, y: 4 }, initial: ['forward', 'collect', 'forward', 'forward'], allowedBlocks: ['forward', 'left', 'right', 'collect'] }),
  mission('debug-independent', 'debug', '8 · Debug your own map', 'Independent debug', 'The direct path is blocked. Change the program until Pip reaches the flag.', 'Use the map, not a guessed route: test a change, then keep or undo it.', { x: 4, y: 4, direction: 3 }, { x: 0, y: 1 }, { walls: [wall(2, 4)], initial: ['forward', 'forward', 'forward', 'forward'], allowedBlocks: ['forward', 'left', 'right'] }),
  mission('repeat-wall', 'repeat', '10 · Repeat around a wall', 'Repeat', 'Go around the wall, reach the diamond, collect it, and use Repeat.', 'Move to the open row, then Repeat 3 × Forward to reach the sample.', { x: 0, y: 4, direction: 0 }, { x: 3, y: 3 }, { walls: [wall(0, 2)], sample: { x: 3, y: 3 }, requiredRepeats: 1, maxProgramBlocks: 5, allowedBlocks: ['forward', 'left', 'right', 'collect', 'repeat3'] }),
  mission('repeat-compress', 'repeat', '11 · Compress two long runs', 'Compression', 'Reach and collect the sample using two Repeat blocks and at most four blocks.', 'Compress each run of three Forward moves into Repeat 3 × Forward.', { x: 4, y: 4, direction: 3 }, { x: 1, y: 1 }, { sample: { x: 1, y: 1 }, requiredRepeats: 2, maxProgramBlocks: 4, allowedBlocks: ['forward', 'left', 'right', 'collect', 'repeat3'] }),
  mission('repeat-independent', 'repeat', '12 · Build and compress your route', 'Independent compression', 'Build your own route to the sample. Collect it, use at least two Repeat blocks, and keep the code to four blocks.', 'Choose a route, test it, and compress repeated Forward moves.', { x: 0, y: 0, direction: 1 }, { x: 3, y: 3 }, { sample: { x: 3, y: 3 }, requiredRepeats: 2, maxProgramBlocks: 4, allowedBlocks: ['forward', 'left', 'right', 'collect', 'repeat3'] }),
];

export const MISSION_BY_ID = Object.fromEntries(MISSIONS.map((item) => [item.id, item]));
export const MISSION_ORDER = ['first-route', 'sequence-detour', 'sequence-sample', 'sequence-independent', 'debug-turn', 'debug-wall', 'debug-collect', 'debug-independent', 'repeat-rescue', 'repeat-wall', 'repeat-compress', 'repeat-independent'];
export const CHAPTERS = [
  { id: 'sequence', title: 'Sequence', missionIds: MISSION_ORDER.slice(0, 4) },
  { id: 'debug', title: 'Debug', missionIds: MISSION_ORDER.slice(4, 8) },
  { id: 'repeat', title: 'Repeat & compress', missionIds: MISSION_ORDER.slice(8, 12) },
];
export const BLOCKS = { forward: 'Forward', left: '↶ Turn left', right: '↷ Turn right', collect: '◆ Collect', repeat3: '3 × Forward' };

export function validateProgram(program) {
  if (!Array.isArray(program) || program.length > MAX_PROGRAM_BLOCKS || program.some((op) => !Object.hasOwn(BLOCKS, op))) return false;
  return true;
}

export function validateMissionProgram(missionId, program) {
  const item = MISSION_BY_ID[missionId];
  return Boolean(item && validateProgram(program) && program.every((op) => item.allowedBlocks.includes(op)));
}

export function expandProgram(program) {
  if (!validateProgram(program) || program.filter((op) => op === 'repeat3').length * 3 + program.filter((op) => op !== 'repeat3').length > MAX_EXPANDED_INSTRUCTIONS) throw new Error(`Choose up to ${MAX_PROGRAM_BLOCKS} instruction blocks.`);
  return program.flatMap((op, block) => op === 'repeat3' ? Array.from({ length: 3 }, () => ({ op: 'forward', block })) : [{ op, block }]);
}

export function startRover(item) { return { ...item.start, collected: false, trail: [`${item.start.x},${item.start.y}`] }; }

export function advanceRover(state, instruction, item) {
  const next = { ...state, trail: [...state.trail] };
  if (!instruction || !Object.hasOwn(BLOCKS, instruction.op)) return { state: next, error: 'That instruction is not part of this rover program.' };
  if (instruction.op === 'left') next.direction = (state.direction + 3) % 4;
  if (instruction.op === 'right') next.direction = (state.direction + 1) % 4;
  if (instruction.op === 'collect') {
    if (!item.sample || next.x !== item.sample.x || next.y !== item.sample.y) return { state: next, error: 'The sample is on the diamond square. Move there before Collect.' };
    if (next.collected) return { state: next, error: 'Pip already collected this sample. Continue to the flag.' };
    next.collected = true;
  }
  if (instruction.op === 'forward') {
    const [dx, dy] = [[0, -1], [1, 0], [0, 1], [-1, 0]][next.direction];
    const x = next.x + dx, y = next.y + dy;
    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return { state: next, error: `Block ${instruction.block + 1} would leave the ${BOARD_SIZE} by ${BOARD_SIZE} training area. Turn or change the route.` };
    if (item.walls?.some((obstacle) => obstacle.x === x && obstacle.y === y)) return { state: next, error: `Block ${instruction.block + 1} meets the rock wall at column ${x + 1}, row ${y + 1}. Pip stopped safely. Edit the route.` };
    next.x = x; next.y = y; next.trail.push(`${x},${y}`);
  }
  return { state: next };
}

export function judgeRover(state, item, program) {
  if (state.x !== item.goal.x || state.y !== item.goal.y) return { complete: false, message: 'Pip stopped before the flag. Step through the program and check the route.' };
  if (item.sample && !state.collected) return { complete: false, message: 'Pip reached the flag but has not collected the sample. Add Collect after reaching the diamond.' };
  const repeatCount = program.filter((op) => op === 'repeat3').length;
  if (repeatCount < (item.requiredRepeats || 0)) return { complete: false, message: `The route works. Compress it with at least ${item.requiredRepeats} Repeat block${item.requiredRepeats === 1 ? '' : 's'}.` };
  if (item.maxProgramBlocks && program.length > item.maxProgramBlocks) return { complete: false, message: `The route works, but uses ${program.length} blocks. Shorten it to ${item.maxProgramBlocks} or fewer blocks.` };
  return { complete: true, message: `Mission complete! ${item.skill} goal reached with your program.` };
}

/** Run through the same bounded interpreter used by Step and Run; persistence may only award judged solutions. */
export function simulateProgram(missionId, program) {
  const item = MISSION_BY_ID[missionId];
  if (!item || !validateMissionProgram(missionId, program)) return { complete: false, message: 'This program contains a block that is not available in the selected mission.' };
  let state = startRover(item);
  for (const instruction of expandProgram(program)) {
    const result = advanceRover(state, instruction, item);
    if (result.error) return { complete: false, message: result.error, state: result.state };
    state = result.state;
  }
  return { ...judgeRover(state, item, program), state };
}
