import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyTicMove,
  cosmicTacticPaths,
  isCosmicTacticMove,
  recordCosmicFreeResult,
  getCosmicFreeProgress,
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


test('Captain cannot lose against any legal sequence of human moves from an empty board', () => {
  for (const seed of [0, 19, 92]) {
    const seen = new Set();
    const visit = board => {
      const signature = board.map(mark => mark || '-').join('');
      if (seen.has(signature)) return;
      seen.add(signature);
      const result = getBoardResult(board);
      assert.notEqual(result.winner, 'X', signature);
      if (result.winner || result.draw) return;
      for (const human of legalTicMoves(board)) {
        const afterHuman = applyTicMove(board, human, 'X');
        assert.notEqual(getBoardResult(afterHuman).winner, 'X', afterHuman.join(''));
        if (getBoardResult(afterHuman).draw) continue;
        const bot = chooseCosmicBotMove(afterHuman, { seed, difficulty: 'captain' });
        assert.ok(legalTicMoves(afterHuman).includes(bot));
        visit(applyTicMove(afterHuman, bot, 'O'));
      }
    };
    visit(Array(9).fill(null));
    assert.ok(seen.size > 100);
  }
});

test('solved explanations follow actual winning, blocking and both fork paths in every orientation', () => {
  for (let level = 0; level < 3; level++) for (let round = 0; round < 8; round++) {
    const scenario = makeTacticScenario({ level, round, seed: 7 });
    const solved = applyTicMove(scenario.board, scenario.target, 'X');
    const paths = cosmicTacticPaths(solved, scenario.target, scenario.tactic);
    assert.equal(paths.length, level === 2 ? 2 : 1);
    assert.ok(paths.every(line => line.includes(scenario.target)));
  }
});

test('free-game totals save terminal outcomes once per board and isolate players', () => {
  const storage = memoryStorage();
  const win = ['X','X','X','O','O',null,null,null,null];
  const loss = ['X','X',null,'O','O','O',null,null,'X'];
  const draw = ['X','O','X','X','O','O','O','X','X'];
  recordCosmicFreeResult({ playerId:'amari',board:win,boardId:'win',storage });
  recordCosmicFreeResult({ playerId:'amari',board:win,boardId:'win',storage });
  recordCosmicFreeResult({ playerId:'amari',board:loss,boardId:'loss',storage });
  recordCosmicFreeResult({ playerId:'amari',board:draw,boardId:'draw',storage });
  const before = getCosmicFreeProgress('amari',storage);
  assert.deepEqual([before.X,before.O,before.draws],[1,1,1]);
  for (const board of [Array(9).fill(null), ['X','X','X','O','O','O',null,null,null]]) recordCosmicFreeResult({playerId:'amari',board,boardId:'invalid',storage});
  assert.deepEqual(getCosmicFreeProgress('amari',storage),before);
  assert.equal(getCosmicFreeProgress('askia',storage).X,0);
});


test('fork lessons accept every valid alternate fork rather than only the authored hint square', () => {
 for(let round=0;round<8;round++) {
  const scenario=makeTacticScenario({level:2,round,seed:7});
  const valid=findForkMoves(scenario.board,'X');
  assert.ok(valid.length>1);
  for(const cell of valid) {
   assert.equal(isCosmicTacticMove(scenario.board,cell,'fork'),true);
   assert.equal(cosmicTacticPaths(applyTicMove(scenario.board,cell,'X'),cell,'fork').length,2);
  }
 }
});
