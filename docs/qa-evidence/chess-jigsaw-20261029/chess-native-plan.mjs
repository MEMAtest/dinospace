import { createChessGame, applyChessMove, serializeChessGame } from '../../../src/data/chessGameRules.js';
import { chooseComputerMove } from '../../../src/data/chessGameAi.js';

const difficulties = ['beginner', 'growing', 'challenge'];
const apply = (game, move, side) => {
  const result = applyChessMove(game, move);
  if (!result.ok) throw new Error(`${side} plan move is illegal: ${JSON.stringify(move)} (${result.error})`);
  return { side, move: result.move, fen: game.fen(), status: serializeChessGame(game).status };
};
const askComputer = (game, difficulty, color) => {
  const history = game.history({ verbose: true }).map(({ from, to, promotion }) => ({ from, to, ...(promotion ? { promotion } : {}) }));
  const result = chooseComputerMove({ history, difficulty, computerColor: color, seed: history.length + difficulty.length });
  if (!result.ok) throw new Error(`AI plan failed: ${JSON.stringify(result)}`);
  return { ...apply(game, result.move, 'computer'), search: { nodes: result.nodes, maxNodes: result.maxNodes, maxMs: result.maxMs, elapsedMs: result.elapsedMs, timedOut: result.timedOut, completedDepth: result.completedDepth } };
};
const openings = [];
for (const difficulty of difficulties) for (const humanColor of ['white', 'black']) {
  const game = createChessGame();
  const sequence = [];
  if (humanColor === 'black') {
    sequence.push(askComputer(game, difficulty, 'white'));
    sequence.push(apply(game, { from: 'e7', to: 'e5' }, 'human'));
    sequence.push(askComputer(game, difficulty, 'white'));
  } else {
    sequence.push(apply(game, { from: 'e2', to: 'e4' }, 'human'));
    sequence.push(askComputer(game, difficulty, 'black'));
  }
  openings.push({ difficulty, humanColor, sequence, finalFen: game.fen() });
}

const game = createChessGame();
const scholarMate = [];
for (const move of [
  { from: 'e2', to: 'e4' },
  null,
  { from: 'd1', to: 'h5' },
  null,
  { from: 'f1', to: 'c4' },
  null,
  { from: 'h5', to: 'f7' },
]) {
  if (move) scholarMate.push(apply(game, move, 'human'));
  else scholarMate.push(askComputer(game, 'beginner', 'black'));
}
if (!game.isCheckmate()) throw new Error('Deterministic beginner Scholar’s Mate line no longer reaches checkmate.');

process.stdout.write(`${JSON.stringify({ version: 1, openings, scholarMate, terminal: serializeChessGame(game) })}\n`);
