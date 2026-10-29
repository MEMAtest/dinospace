import test from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import {
  applyChessMove,
  createChessGame,
  getChessStatus,
  legalMovesFrom,
  replayChessHistory,
  serializeChessGame,
} from '../src/data/chessGameRules.js';

const play = (game, from, to, promotion) => {
  const move = applyChessMove(game, { from, to, ...(promotion ? { promotion } : {}) });
  assert.equal(move.ok, true, `${from}-${to} should be legal`);
  return move.move;
};

test('full standard board supports piece movement, blockers, and self-check rejection', () => {
  const game = createChessGame();
  assert.equal(game.board().length, 8);
  assert.ok(legalMovesFrom(game, 'e2').some((move) => move.to === 'e4'));
  play(game, 'e2', 'e4');
  assert.equal(game.turn(), 'b');
  assert.equal(applyChessMove(game, { from: 'e7', to: 'e4' }).ok, false);
  const pinned = new Chess('k3r3/8/8/8/8/8/4R3/4K3 w - - 0 1');
  assert.equal(legalMovesFrom(pinned, 'e2').some((move) => move.to === 'f2'), false);
});

test('castling requires rights, empty path, and safe king transit squares', () => {
  const open = new Chess('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
  const castleMoves = legalMovesFrom(open, 'e1').filter((move) => move.flags.includes('k') || move.flags.includes('q'));
  assert.deepEqual(new Set(castleMoves.map((move) => move.to)), new Set(['g1', 'c1']));
  play(open, 'e1', 'g1');
  assert.equal(open.get('f1').type, 'r');
  assert.equal(open.get('g1').type, 'k');
  assert.equal(open.get('h1'), undefined);
  const attackedTransit = new Chess('r3k2r/8/8/8/8/8/5r2/R3K2R w KQkq - 0 1');
  assert.equal(legalMovesFrom(attackedTransit, 'e1').some((move) => move.to === 'g1'), false);
  const blocked = new Chess('r3k2r/8/8/8/8/8/8/R3KB1R w KQkq - 0 1');
  assert.equal(legalMovesFrom(blocked, 'e1').some((move) => move.to === 'g1'), false);
  const lostRight = new Chess('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
  play(lostRight, 'h1', 'h2'); play(lostRight, 'e8', 'e7'); play(lostRight, 'h2', 'h1');
  assert.equal(legalMovesFrom(lostRight, 'e1').some((move) => move.to === 'g1'), false);
});

test('en passant is available only on the immediately following move', () => {
  const game = createChessGame();
  for (const [from, to] of [['e2', 'e4'], ['a7', 'a6'], ['e4', 'e5'], ['d7', 'd5']]) play(game, from, to);
  const ep = legalMovesFrom(game, 'e5').find((move) => move.to === 'd6');
  assert.ok(ep?.flags.includes('e'));
  play(game, 'e5', 'd6');
  assert.equal(game.get('d5'), undefined);
  assert.equal(game.get('d6').type, 'p');

  const expired = createChessGame();
  for (const [from, to] of [['e2', 'e4'], ['a7', 'a6'], ['e4', 'e5'], ['d7', 'd5'], ['g1', 'f3']]) play(expired, from, to);
  play(expired, 'a6', 'a5');
  assert.equal(legalMovesFrom(expired, 'e5').some((move) => move.to === 'd6'), false);
});

test('promotion explicitly supports all four pieces and rejects missing or invalid choices', () => {
  for (const promotion of ['q', 'r', 'b', 'n']) {
    const game = new Chess('7k/P7/8/8/8/8/8/7K w - - 0 1');
    assert.deepEqual(new Set(legalMovesFrom(game, 'a7').filter((move) => move.to === 'a8').map((move) => move.promotion)), new Set(['q', 'r', 'b', 'n']));
    assert.equal(applyChessMove(game, { from: 'a7', to: 'a8' }).ok, false);
    assert.equal(applyChessMove(game, { from: 'a7', to: 'a8', promotion: 'x' }).ok, false);
    play(game, 'a7', 'a8', promotion);
    assert.equal(game.get('a8').type, promotion);
  }
});

test('checkmate and stalemate produce distinct terminal results', () => {
  const mate = createChessGame();
  for (const [from, to] of [['f2', 'f3'], ['e7', 'e5'], ['g2', 'g4'], ['d8', 'h4']]) play(mate, from, to);
  assert.deepEqual(
    { gameOver: getChessStatus(mate).gameOver, result: getChessStatus(mate).result, reason: getChessStatus(mate).reason },
    { gameOver: true, result: 'black', reason: 'checkmate' },
  );
  const stalemate = new Chess('7k/5K2/6Q1/8/8/8/8/8 b - - 0 1');
  assert.equal(stalemate.isStalemate(), true);
  assert.equal(getChessStatus(stalemate).reason, 'stalemate');
  assert.equal(getChessStatus(stalemate).result, 'draw');
});

test('threefold repetition, fifty-move rule and insufficient material are draws', () => {
  const repetition = createChessGame();
  for (const [from, to] of [
    ['g1', 'f3'], ['g8', 'f6'], ['f3', 'g1'], ['f6', 'g8'],
    ['g1', 'f3'], ['g8', 'f6'], ['f3', 'g1'], ['f6', 'g8'],
  ]) play(repetition, from, to);
  assert.equal(getChessStatus(repetition).reason, 'threefold-repetition');
  assert.equal(getChessStatus(repetition).result, 'draw');

  const fifty = new Chess('7k/8/8/8/8/8/8/R3K3 w - - 99 51');
  play(fifty, 'a1', 'a2');
  assert.equal(getChessStatus(fifty).reason, 'fifty-move-rule');

  const bareKings = new Chess('7k/8/8/8/8/8/8/K7 w - - 0 1');
  assert.equal(getChessStatus(bareKings).reason, 'insufficient-material');
  assert.equal(getChessStatus(bareKings).result, 'draw');
});

test('replay validates every move and the saved FEN instead of trusting it', () => {
  const game = createChessGame();
  play(game, 'g1', 'f3'); play(game, 'g8', 'f6'); play(game, 'f3', 'g1'); play(game, 'f6', 'g8');
  const saved = serializeChessGame(game);
  assert.equal(replayChessHistory(saved.history).ok, true);
  const replayed = replayChessHistory(saved.history);
  assert.equal(replayed.game.fen(), saved.fen);
  assert.equal(replayChessHistory([{ from: 'e2', to: 'e5' }]).ok, false);
});
