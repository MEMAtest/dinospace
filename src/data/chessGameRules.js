import { Chess } from 'chess.js';

export const CHESS_START_FEN = new Chess().fen();
export const CHESS_PROMOTIONS = Object.freeze(['q', 'r', 'b', 'n']);
export const CHESS_DIFFICULTIES = Object.freeze(['beginner', 'growing', 'challenge']);
export const CHESS_COLORS = Object.freeze(['white', 'black']);
export const CHESS_PIECE_NAMES = Object.freeze({ p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' });
export const CHESS_PIECE_GLYPHS = Object.freeze({
  w: Object.freeze({ p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' }),
  b: Object.freeze({ p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' }),
});

export const colorCode = (color) => color === 'white' || color === 'w' ? 'w' : color === 'black' || color === 'b' ? 'b' : null;
export const colorName = (color) => color === 'w' ? 'White' : color === 'b' ? 'Black' : 'Unknown';
export const isChessCoordinate = (square) => typeof square === 'string' && /^[a-h][1-8]$/.test(square);

export function createChessGame() {
  return new Chess();
}

export function normalizeChessMove(input) {
  if (!input || typeof input !== 'object') return null;
  const { from, to } = input;
  const promotion = input.promotion === undefined || input.promotion === null || input.promotion === ''
    ? undefined
    : String(input.promotion).toLowerCase();
  if (!isChessCoordinate(from) || !isChessCoordinate(to)) return null;
  if (promotion !== undefined && !CHESS_PROMOTIONS.includes(promotion)) return null;
  return { from, to, ...(promotion ? { promotion } : {}) };
}

export function legalMovesFrom(game, square) {
  if (!game || !isChessCoordinate(square) || game.isGameOver()) return [];
  return game.moves({ square, verbose: true }).map((move) => ({
    from: move.from,
    to: move.to,
    ...(move.promotion ? { promotion: move.promotion } : {}),
    san: move.san,
    flags: move.flags,
    captured: move.captured || null,
  }));
}

export function listLegalMoves(game) {
  if (!game || game.isGameOver()) return [];
  return game.moves({ verbose: true }).map((move) => ({
    from: move.from,
    to: move.to,
    ...(move.promotion ? { promotion: move.promotion } : {}),
    san: move.san,
    flags: move.flags,
    captured: move.captured || null,
  }));
}

export function applyChessMove(game, input) {
  const move = normalizeChessMove(input);
  if (!game || !move || game.isGameOver()) return { ok: false, move: null, error: 'Choose a valid move in the current game.' };
  const candidates = legalMovesFrom(game, move.from).filter((candidate) => candidate.to === move.to);
  if (move.promotion) {
    if (!candidates.some((candidate) => candidate.promotion === move.promotion)) {
      return { ok: false, move: null, error: 'That promotion is not legal here.' };
    }
  } else if (candidates.some((candidate) => candidate.promotion)) {
    return { ok: false, move: null, error: 'Choose what your pawn becomes.' };
  } else if (!candidates.length) {
    return { ok: false, move: null, error: 'That move is not legal. The board is ready for another try.' };
  }
  try {
    const applied = game.move(move);
    if (!applied) return { ok: false, move: null, error: 'That move is not legal. The board is ready for another try.' };
    return { ok: true, move: toMoveRecord(applied), error: null };
  } catch {
    return { ok: false, move: null, error: 'That move is not legal. The board is ready for another try.' };
  }
}

export function toMoveRecord(move) {
  return {
    from: move.from,
    to: move.to,
    ...(move.promotion ? { promotion: move.promotion } : {}),
  };
}

export function replayChessHistory(history) {
  if (!Array.isArray(history) || history.length > 600) return { ok: false, game: null, error: 'Saved move history is invalid.' };
  const game = createChessGame();
  const moves = [];
  for (const raw of history) {
    const move = normalizeChessMove(raw);
    if (!move) return { ok: false, game: null, error: 'Saved move history contains an invalid move.' };
    const result = applyChessMove(game, move);
    if (!result.ok) return { ok: false, game: null, error: 'Saved move history is not legal from the standard starting position.' };
    moves.push(result.move);
  }
  return { ok: true, game, moves, error: null };
}

export function serializeChessGame(game) {
  const history = game.history({ verbose: true }).map(toMoveRecord);
  const status = getChessStatus(game);
  return {
    fen: game.fen(),
    turn: game.turn(),
    history,
    status,
    lastMove: history.at(-1) || null,
  };
}

export function restoreChessGame(saved) {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) {
    return { ok: false, game: null, error: 'Saved chess match is invalid.' };
  }
  const replayed = replayChessHistory(saved.history);
  if (!replayed.ok) return replayed;
  if (typeof saved.fen !== 'string' || saved.fen !== replayed.game.fen()) {
    return { ok: false, game: null, error: 'Saved board does not match its move history.' };
  }
  if (saved.turn !== replayed.game.turn()) return { ok: false, game: null, error: 'Saved turn does not match its move history.' };
  const status = getChessStatus(replayed.game);
  if (saved.status && (saved.status.gameOver !== status.gameOver || saved.status.result !== status.result || saved.status.reason !== status.reason)) {
    return { ok: false, game: null, error: 'Saved result does not match its move history.' };
  }
  return { ok: true, game: replayed.game, error: null };
}

export function getChessStatus(game) {
  const turn = game.turn();
  if (game.isCheckmate()) return {
    gameOver: true,
    result: turn === 'w' ? 'black' : 'white',
    reason: 'checkmate',
    turn,
    inCheck: true,
    message: `${colorName(turn)} is checkmated. ${colorName(turn === 'w' ? 'b' : 'w')} wins.`,
  };
  if (game.isStalemate()) return { gameOver: true, result: 'draw', reason: 'stalemate', turn, inCheck: false, message: 'Stalemate. The game is a draw.' };
  if (game.isThreefoldRepetition()) return { gameOver: true, result: 'draw', reason: 'threefold-repetition', turn, inCheck: game.isCheck(), message: 'The same position occurred three times. The game is a draw.' };
  if (game.isDrawByFiftyMoves()) return { gameOver: true, result: 'draw', reason: 'fifty-move-rule', turn, inCheck: game.isCheck(), message: 'Fifty moves passed without a pawn move or capture. The game is a draw.' };
  if (game.isInsufficientMaterial()) return { gameOver: true, result: 'draw', reason: 'insufficient-material', turn, inCheck: game.isCheck(), message: 'There is not enough material to checkmate. The game is a draw.' };
  const inCheck = game.isCheck();
  return {
    gameOver: false,
    result: null,
    reason: inCheck ? 'check' : 'playing',
    turn,
    inCheck,
    message: inCheck ? `${colorName(turn)} is in check.` : `${colorName(turn)} to move.`,
  };
}

export function getChessBoardSquares(game) {
  return game.board().flatMap((rank, row) => rank.map((piece, column) => {
    const square = `${String.fromCharCode(97 + column)}${8 - row}`;
    return {
      square,
      piece: piece ? { color: piece.color, type: piece.type, name: CHESS_PIECE_NAMES[piece.type], glyph: CHESS_PIECE_GLYPHS[piece.color][piece.type] } : null,
    };
  }));
}

export function getComputerResult(game, humanColor) {
  const status = getChessStatus(game);
  if (!status.gameOver || status.result === 'draw') return status.result;
  const human = colorCode(humanColor);
  return status.result === (human === 'w' ? 'white' : 'black') ? 'win' : 'loss';
}
