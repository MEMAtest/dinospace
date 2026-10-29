import test from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import { applyChessMove, legalMovesFrom, restoreChessGame, serializeChessGame } from '../src/data/chessGameRules.js';

test('bishop and queen paths stay blocked by friendly pieces, while knights jump without capturing their own side', () => {
  const bishop = new Chess('4k3/8/8/8/8/8/3P4/2B1K3 w - - 0 1');
  assert.ok(legalMovesFrom(bishop, 'c1').some(move => move.to === 'a3'));
  assert.equal(legalMovesFrom(bishop, 'c1').some(move => move.to === 'd2' || move.to === 'e3'), false);
  const queen = new Chess('4k3/8/8/8/3QP3/8/8/4K3 w - - 0 1');
  assert.ok(legalMovesFrom(queen, 'd4').some(move => move.to === 'd8'));
  assert.ok(legalMovesFrom(queen, 'd4').some(move => move.to === 'h8'));
  assert.equal(legalMovesFrom(queen, 'd4').some(move => move.to === 'e4' || move.to === 'f4'), false);
  const starting = new Chess();
  assert.ok(legalMovesFrom(starting, 'b1').some(move => move.to === 'c3'));
  assert.equal(legalMovesFrom(starting, 'b1').some(move => move.to === 'd2'), false);
});

test('pawns capture diagonally and kings cannot move adjacent to the other king', () => {
  const pawn = new Chess('4k3/8/8/2pp4/3P4/8/8/4K3 w - - 0 1');
  assert.ok(legalMovesFrom(pawn, 'd4').some(move => move.to === 'c5'));
  assert.equal(legalMovesFrom(pawn, 'd4').some(move => move.to === 'd5' || move.to === 'e5'), false);
  const kings = new Chess('8/8/8/8/8/4k3/8/4K2R w - - 0 1');
  assert.equal(legalMovesFrom(kings, 'e1').some(move => move.to === 'e2' || move.to === 'f2'), false);
  assert.ok(legalMovesFrom(kings, 'e1').some(move => move.to === 'f1'));
});

test('en passant is rejected when removing the two pawns would expose the king to a rook', () => {
  const game = new Chess('4k3/8/8/4KPpr/8/8/8/8 w - g6 0 1');
  const before = game.fen();
  assert.equal(legalMovesFrom(game, 'f5').some(move => move.to === 'g6'), false);
  assert.equal(applyChessMove(game, { from:'f5', to:'g6' }).ok, false);
  assert.equal(game.fen(), before);
});

test('Black has all four promotions too, and a mismatched saved board is rejected', () => {
  for (const promotion of ['q','r','b','n']) {
    const game = new Chess('7k/8/8/8/8/8/p7/7K b - - 0 1');
    assert.equal(applyChessMove(game,{from:'a2',to:'a1',promotion}).ok,true);
    assert.equal(game.get('a1').type,promotion);
    assert.equal(game.get('a1').color,'b');
  }
  const game = new Chess();
  applyChessMove(game,{from:'e2',to:'e4'});
  const saved=serializeChessGame(game);
  assert.equal(restoreChessGame(saved).ok,true);
  assert.equal(restoreChessGame({...saved,fen:new Chess().fen()}).ok,false);
});
