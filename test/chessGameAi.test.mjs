import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseComputerMove } from '../src/data/chessGameAi.js';
import { applyChessMove, createChessGame, listLegalMoves, replayChessHistory } from '../src/data/chessGameRules.js';

test('every difficulty returns a legal move within its bounded node budget', () => {
  const game = createChessGame();
  for (const [difficulty, budget] of [['beginner', 700], ['growing', 4200], ['challenge', 18000]]) {
    const result = chooseComputerMove({ history: [], difficulty, computerColor: 'white', seed: 2718 });
    assert.equal(result.ok, true);
    assert.ok(listLegalMoves(game).some((move) => move.from === result.move.from && move.to === result.move.to));
    assert.ok(result.nodes <= budget);
  }
});

test('AI resumes the actual saved side-to-move and seeded tie-breaking is repeatable', () => {
  const first = createChessGame();
  assert.equal(applyChessMove(first, { from: 'e2', to: 'e4' }).ok, true);
  const history = first.history({ verbose: true }).map(({ from, to, promotion }) => ({ from, to, ...(promotion ? { promotion } : {}) }));
  const a = chooseComputerMove({ history, difficulty: 'growing', computerColor: 'black', seed: 44 });
  const b = chooseComputerMove({ history, difficulty: 'growing', computerColor: 'black', seed: 44 });
  assert.deepEqual(a.move, b.move);
  assert.equal(replayChessHistory([...history, a.move]).ok, true);
  assert.equal(chooseComputerMove({ history, difficulty: 'growing', computerColor: 'white' }).ok, false);
});

test('unknown difficulty and malformed history return no move', () => {
  assert.equal(chooseComputerMove({ history: [], difficulty: 'expert', computerColor: 'white' }).ok, false);
  assert.equal(chooseComputerMove({ history: [{ from: 'e2', to: 'e5' }], difficulty: 'beginner', computerColor: 'white' }).ok, false);
});

test('a wall-clock timeout keeps the preselected legal fallback move', () => {
  let now = 0;
  const result = chooseComputerMove({
    history: [], difficulty: 'challenge', computerColor: 'white', seed: 41,
    clock: () => { now += 300; return now; },
  });
  assert.equal(result.ok, true);
  assert.equal(result.timedOut, true);
  assert.ok(result.elapsedMs >= 1150);
  assert.ok(result.elapsedMs < 2500);
  assert.ok(listLegalMoves(createChessGame()).some((move) => move.from === result.move.from && move.to === result.move.to));
});
