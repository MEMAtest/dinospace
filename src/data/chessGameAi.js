import { CHESS_DIFFICULTIES, colorCode, normalizeChessMove, replayChessHistory, toMoveRecord } from './chessGameRules.js';

export const AI_LIMITS = Object.freeze({
  beginner: Object.freeze({ maxDepth: 1, maxNodes: 700, maxMs: 250 }),
  growing: Object.freeze({ maxDepth: 2, maxNodes: 4200, maxMs: 800 }),
  challenge: Object.freeze({ maxDepth: 3, maxNodes: 18000, maxMs: 1150 }),
});

const PIECE_VALUE = Object.freeze({ p: 100, n: 320, b: 335, r: 500, q: 900, k: 0 });
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

function moveOrderValue(move) {
  return (move.captured ? PIECE_VALUE[move.captured] * 10 - PIECE_VALUE[move.piece] : 0)
    + (move.promotion ? PIECE_VALUE[move.promotion] : 0)
    + (move.san?.includes('+') ? 20 : 0)
    + (move.san?.includes('#') ? 100000 : 0);
}

function evaluate(game, aiColor, ply = 0) {
  if (game.isCheckmate()) return game.turn() === aiColor ? -100000 + ply : 100000 - ply;
  if (game.isDraw()) return 0;
  let score = 0;
  for (const [rowIndex, row] of game.board().entries()) for (const [column, piece] of row.entries()) {
    if (!piece) continue;
    const sign = piece.color === aiColor ? 1 : -1;
    score += sign * PIECE_VALUE[piece.type];
    const fileDistance = Math.abs(column - 3.5);
    const rank = 8 - rowIndex;
    const rankDistance = Math.abs(rank - 4.5);
    const center = Math.max(0, 7 - fileDistance - rankDistance);
    if (piece.type !== 'k') score += sign * center * 2;
    if (piece.type === 'p') score += sign * (piece.color === 'w' ? rank - 2 : 7 - rank) * 3;
  }
  return score;
}

function searchPosition(game, depth, alpha, beta, aiColor, budget, ply) {
  budget.nodes += 1;
  if (budget.nodes >= budget.maxNodes || budget.clock() - budget.startedAt >= budget.maxMs) budget.expired = true;
  if (game.isGameOver() || depth === 0 || budget.expired) return evaluate(game, aiColor, ply);
  const maximizing = game.turn() === aiColor;
  const moves = game.moves({ verbose: true }).sort((a, b) => moveOrderValue(b) - moveOrderValue(a));
  let best = maximizing ? -Infinity : Infinity;
  for (const move of moves) {
    if (budget.nodes >= budget.maxNodes || budget.clock() - budget.startedAt >= budget.maxMs) {
      budget.expired = true;
      break;
    }
    game.move(toMoveRecord(move));
    const value = searchPosition(game, depth - 1, alpha, beta, aiColor, budget, ply + 1);
    game.undo();
    if (maximizing) { best = Math.max(best, value); alpha = Math.max(alpha, best); }
    else { best = Math.min(best, value); beta = Math.min(beta, best); }
    if (beta <= alpha) break;
  }
  return Number.isFinite(best) ? best : evaluate(game, aiColor, ply);
}

function seededIndex(seed, length) {
  let state = Number(seed) >>> 0;
  state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
  return length ? state % length : 0;
}

export function chooseComputerMove({ history, difficulty = 'beginner', computerColor, seed = 0, maxNodes, clock } = {}) {
  if (!CHESS_DIFFICULTIES.includes(difficulty)) return { ok: false, move: null, nodes: 0, error: 'Unknown computer difficulty.' };
  const color = colorCode(computerColor);
  if (!color) return { ok: false, move: null, nodes: 0, error: 'Unknown computer side.' };
  const replayed = replayChessHistory(history);
  if (!replayed.ok) return { ok: false, move: null, nodes: 0, error: replayed.error };
  const game = replayed.game;
  if (game.turn() !== color || game.isGameOver()) return { ok: false, move: null, nodes: 0, error: 'The computer does not have a legal turn.' };
  const legal = game.moves({ verbose: true });
  if (!legal.length) return { ok: false, move: null, nodes: 0, error: 'No legal computer move is available.' };

  const limits = AI_LIMITS[difficulty];
  const readClock = typeof clock === 'function' ? clock : () => globalThis.performance?.now?.() ?? Date.now();
  const startedAt = readClock();
  const budget = {
    nodes: 0,
    maxNodes: clamp(Number(maxNodes) || limits.maxNodes, 1, limits.maxNodes),
    maxMs: limits.maxMs,
    clock: readClock,
    startedAt,
    expired: false,
  };
  const indexed = legal.map((move) => ({ move, score: moveOrderValue(move), key: `${move.from}${move.to}${move.promotion || ''}` }));
  indexed.sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));
  const easyChoices = indexed.slice(0, Math.min(4, indexed.length));
  let bestMove = easyChoices[seededIndex(seed, easyChoices.length)].move;
  let completedDepth = 0;

  if (difficulty !== 'beginner') {
    const maxDepth = difficulty === 'growing' ? 2 : 3;
    for (let depth = 1; depth <= maxDepth; depth += 1) {
      let iterationBest = null;
      let iterationScore = -Infinity;
      let iterationComplete = true;
      const candidates = [...legal].sort((a, b) => moveOrderValue(b) - moveOrderValue(a));
      for (const move of candidates) {
        if (budget.nodes >= budget.maxNodes || budget.clock() - budget.startedAt >= budget.maxMs) {
          budget.expired = true;
          iterationComplete = false;
          break;
        }
        budget.nodes += 1;
        game.move(toMoveRecord(move));
        const score = searchPosition(game, depth - 1, -Infinity, Infinity, color, budget, 1);
        game.undo();
        if (budget.expired) { iterationComplete = false; break; }
        if (score > iterationScore) { iterationScore = score; iterationBest = move; }
      }
      if (iterationComplete && iterationBest) { bestMove = iterationBest; completedDepth = depth; }
      if (!iterationComplete) break;
    }
  } else {
    budget.nodes = 0;
  }

  const normalized = normalizeChessMove(bestMove);
  if (!normalized) return { ok: false, move: null, nodes: budget.nodes, error: 'The computer could not select a legal move.' };
  return {
    ok: true,
    move: normalized,
    nodes: budget.nodes,
    maxNodes: budget.maxNodes,
    maxMs: budget.maxMs,
    elapsedMs: Math.max(0, budget.clock() - budget.startedAt),
    timedOut: budget.expired,
    completedDepth,
  };
}

export function applyAiMoveForTest(history, input) {
  const replayed = replayChessHistory(history);
  if (!replayed.ok) return replayed;
  const result = replayed.game.move(input);
  return { ok: true, game: replayed.game, move: toMoveRecord(result) };
}
