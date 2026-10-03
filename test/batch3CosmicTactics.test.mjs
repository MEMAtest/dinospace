import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyTicMove,
  chooseCosmicBotMove,
  completeCosmicTactic,
  COSMIC_PROGRESS_KEY,
  findForkMoves,
  findImmediateMoves,
  getCosmicRunMissionIds,
  getNextCosmicRunStep,
  getBoardResult,
  getCosmicProgress,
  legalTicMoves,
  makeTacticScenario,
} from '../src/data/cosmicTactics.js';

const memoryStorage = () => {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), values };
};

test('the three seeded tutorial layouts present a legal, attainable tactic', () => {
  const expected = ['win', 'block', 'fork'];
  expected.forEach((tactic, level) => {
    const scenario = makeTacticScenario({ level, seed: 42 });
    assert.equal(scenario.tactic, tactic);
    assert.equal(scenario.board.length, 9);
    assert.equal(scenario.board[scenario.target], null);
    assert.equal(scenario.board.filter(Boolean).filter((mark) => mark === 'X').length, scenario.board.filter(Boolean).filter((mark) => mark === 'O').length);
    if (tactic === 'win') assert.ok(findImmediateMoves(scenario.board, 'X').includes(scenario.target));
    if (tactic === 'block') {
      assert.ok(findImmediateMoves(scenario.board, 'O').includes(scenario.target));
      const blocked = applyTicMove(scenario.board, scenario.target, 'X');
      assert.equal(findImmediateMoves(blocked, 'O').length, 0);
    }
    if (tactic === 'fork') {
      const fork = applyTicMove(scenario.board, scenario.target, 'X');
      assert.ok(findForkMoves(scenario.board, 'X').includes(scenario.target));
      assert.ok(findImmediateMoves(fork, 'X').length >= 2);
      assert.equal(findImmediateMoves(scenario.board, 'O').length, 0);
    }
  });
});

test('seeded scenario transformations are reproducible and diversify target geometry', () => {
  const first = makeTacticScenario({ level: 2, seed: 789, round: 0 });
  assert.deepEqual(first, makeTacticScenario({ level: 2, seed: 789, round: 0 }));
  const orientations = new Set(Array.from({ length: 8 }, (_, round) => makeTacticScenario({ level: 2, seed: 789, round }).board.map((mark) => mark || '-').join('')));
  assert.ok(orientations.size > 1);
  for (const level of [0, 1, 2]) {
    const threeMissionLayouts = [0, 1, 2].map((round) => makeTacticScenario({ level, seed: 789, round }).board.map((mark) => mark || '-').join(''));
    assert.equal(new Set(threeMissionLayouts).size, 3);
  }
});

test('board transitions reject occupied cells and every move after terminal state', () => {
  const board = Array(9).fill(null);
  let current = board;
  for (const [index, mark] of [[0, 'X'], [3, 'O'], [1, 'X'], [4, 'O'], [2, 'X']]) {
    current = applyTicMove(current, index, mark);
    assert.ok(current);
  }
  assert.equal(getBoardResult(current).winner, 'X');
  assert.equal(applyTicMove(current, 5, 'O'), null);
  assert.equal(applyTicMove(current, 0, 'O'), null);
  assert.equal(applyTicMove(['X', null, null, null, null, null, null, null, null], 0, 'O'), null);
  assert.deepEqual(legalTicMoves(current), []);
});

test('bot always chooses a legal deterministic move and blocks an immediate line on its stronger setting', () => {
  const board = ['X', 'X', null, 'O', null, null, null, null, null];
  const first = chooseCosmicBotMove(board, { seed: 99, difficulty: 'captain' });
  assert.equal(first, 2);
  assert.equal(chooseCosmicBotMove(board, { seed: 99, difficulty: 'captain' }), first);
  assert.ok(legalTicMoves(board).includes(first));
  assert.equal(chooseCosmicBotMove(['X', 'X', 'X', 'O', 'O', null, null, null, null], { seed: 1 }), null);
});

test('chapter completion-only progress is isolated by player and bounded to three boards', () => {
  const storage = memoryStorage();
  assert.equal(getCosmicProgress('amari', storage).unlocked, 0);
  completeCosmicTactic({ playerId: 'amari', level: 0, missionId: 0, storage });
  completeCosmicTactic({ playerId: 'amari', level: 0, missionId: 0, storage });
  assert.equal(getCosmicProgress('amari', storage).unlocked, 0);
  completeCosmicTactic({ playerId: 'amari', level: 0, missionId: 1, storage });
  const finished = completeCosmicTactic({ playerId: 'amari', level: 0, missionId: 2, storage });
  assert.equal(finished.unlocked, 1);
  assert.equal(finished.newlyAwardedBadge, true);
  assert.equal(completeCosmicTactic({ playerId: 'amari', level: 0, missionId: 2, storage }).newlyAwardedBadge, false);
  assert.equal(completeCosmicTactic({ playerId: 'amari', level: 2, missionId: 0, storage }).invalid, true);
  assert.equal(getCosmicProgress('askia', storage).completedByChapter[0], 0);
  assert.ok(storage.values.has(COSMIC_PROGRESS_KEY));
});

test('chapter replay runs all three distinct boards with one seed; resumed runs select only missing boards', () => {
  assert.deepEqual(getCosmicRunMissionIds([0], false), [1, 2]);
  assert.deepEqual(getCosmicRunMissionIds([0, 1, 2], false), [0, 1, 2]);
  assert.deepEqual(getCosmicRunMissionIds([0, 1, 2], true), [0, 1, 2]);
  const runIds = getCosmicRunMissionIds([0, 1, 2], true);
  assert.equal(getNextCosmicRunStep(runIds, 0), 1);
  assert.equal(getNextCosmicRunStep(runIds, 1), 2);
  assert.equal(getNextCosmicRunStep(runIds, 2), null);
  const layouts = runIds.map((round) => makeTacticScenario({ level: 0, seed: 2468, round }).board.map((mark) => mark || '-').join(''));
  assert.equal(new Set(layouts).size, 3);
});

test('orphan future chapter missions and badges are removed until prior chapter completion', () => {
  const storage = memoryStorage();
  storage.setItem(COSMIC_PROGRESS_KEY, JSON.stringify({ amari: {
    completedMissionIds: [[0, 1], [0, 1, 2], [0, 1, 2]],
    badges: ['make-a-line', 'block-the-rocket', 'find-a-fork'],
  } }));
  const progress = getCosmicProgress('amari', storage);
  assert.deepEqual(progress.completedMissionIds, [[0, 1], [], []]);
  assert.deepEqual(progress.completedByChapter, [2, 0, 0]);
  assert.deepEqual(progress.badges, []);
  assert.equal(progress.unlocked, 0);
});
