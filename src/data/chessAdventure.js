export const BOARD_SIZE = 6;
export const CHESS_CHAPTERS = [
  { id: 'movement', title: 'Piece movement', intro: 'Learn movement, occupied squares, and paths blocked by a friendly piece.' },
  { id: 'safe-captures', title: 'Safe captures', intro: 'Capture one opposing piece safely. Check the other enemies before you choose.' },
  { id: 'mini-puzzles', title: 'Mini-puzzles', intro: 'Solve movement goals and help a king step out of a rook attack.' },
];

// All coordinates are [row, column] with [0,0] at A6. `pieces` are actual other pieces on the board.
const unit = (id, type, side, at) => ({ id, type, side, at });
const make = (id, chapterId, piece, from, goal, objective, explanation, pieces = [], kind = 'move', goalSquares = goal ? [goal] : []) => ({ id, chapterId, piece, from, goal, goalSquares, objective, explanation, pieces, kind });
export const CHESS_ADVENTURES = [
  make('move-rook', 'movement', 'rook', [3, 1], [3, 4], 'Move the rook to E3. A friendly pawn blocks its upward file.', 'The rook slides along the clear row. The friendly pawn blocks the upward file.', [unit('friend-rook-block', 'pawn', 'white', [1, 1]), unit('enemy-rook', 'knight', 'black', [3, 5])]),
  make('move-bishop', 'movement', 'bishop', [4, 1], [1, 4], 'Move the bishop to E5. A friendly pawn blocks a different diagonal.', 'The bishop slides diagonally to E5. It cannot pass through its friendly pawn.', [unit('friend-bishop-block', 'pawn', 'white', [3, 0]), unit('enemy-bishop', 'rook', 'black', [4, 5])]),
  make('move-knight', 'movement', 'knight', [4, 2], [2, 3], 'Move the knight to D4. It jumps over the friendly pawn.', 'Knights jump over pieces, so the pawn in the way does not stop this L-shaped move.', [unit('friend-knight-jump', 'pawn', 'white', [3, 2]), unit('enemy-knight', 'bishop', 'black', [0, 5])]),
  make('move-pawn', 'movement', 'pawn', [4, 2], [3, 2], 'Move the pawn forward to C3. Its forward square is empty.', 'A white pawn advances toward the top of the board. It cannot capture its friendly pawn diagonally.', [unit('friend-pawn-diagonal', 'pawn', 'white', [3, 1]), unit('enemy-pawn-diagonal', 'knight', 'black', [3, 3])]),
  make('move-queen', 'movement', 'queen', [4, 1], [1, 4], 'Move the queen to E5. A friendly rook blocks a different line.', 'The queen slides diagonally to E5. The rook blocks the queen from moving up its file.', [unit('friend-queen-block', 'rook', 'white', [3, 1]), unit('enemy-queen', 'bishop', 'black', [1, 5])]),
  make('capture-rook', 'safe-captures', 'rook', [3, 3], [3, 5], 'Capture one opposing piece safely. Check the other enemies before you choose.', 'The rook can safely capture F3. The opponent on D1 is defended by a black rook, so landing there would put your rook under attack.', [unit('safe-target', 'knight', 'black', [3, 5]), unit('unsafe-target', 'pawn', 'black', [5, 3]), unit('defender', 'rook', 'black', [5, 0]), unit('friendly-screen', 'pawn', 'white', [2, 3])], 'safe-capture'),
  make('capture-bishop', 'safe-captures', 'bishop', [4, 1], [2, 3], 'Capture one opposing piece safely. Check the other enemies before you choose.', 'The bishop safely captures D4. The black rook on F3 attacks A3 across that row, so capturing the opponent there is unsafe.', [unit('safe-target', 'knight', 'black', [2, 3]), unit('unsafe-target', 'bishop', 'black', [3, 0]), unit('defender', 'rook', 'black', [3, 5]), unit('friendly-blocker', 'pawn', 'white', [5, 2])], 'safe-capture'),
  make('capture-knight', 'safe-captures', 'knight', [4, 2], [2, 3], 'Capture one opposing piece safely. Check the other enemies before you choose.', 'The knight can jump to D4 and capture safely. The black rook protects A3, so taking that opponent would lose the knight next.', [unit('safe-target', 'queen', 'black', [2, 3]), unit('unsafe-target', 'pawn', 'black', [3, 0]), unit('defender', 'rook', 'black', [3, 5]), unit('friendly-piece', 'pawn', 'white', [5, 4])], 'safe-capture'),
  make('capture-pawn', 'safe-captures', 'pawn', [4, 2], [3, 3], 'Capture one opposing piece safely. Check the other enemies before you choose.', 'A white pawn captures one square diagonally forward. D3 is safe; the bishop attacks B3.', [unit('safe-target', 'rook', 'black', [3, 3]), unit('unsafe-target', 'knight', 'black', [3, 1]), unit('defender', 'bishop', 'black', [1, 3]), unit('friendly-blocker', 'pawn', 'white', [3, 2])], 'safe-capture'),
  make('capture-queen', 'safe-captures', 'queen', [4, 1], [2, 3], 'Capture one opposing piece safely. Check the other enemies before you choose.', 'The queen safely captures D4. A black rook guards E2 up the open file.', [unit('safe-target', 'knight', 'black', [2, 3]), unit('unsafe-target', 'bishop', 'black', [4, 4]), unit('defender', 'rook', 'black', [0, 4]), unit('friendly-blocker', 'pawn', 'white', [5, 1])], 'safe-capture'),
  make('king-safety', 'mini-puzzles', 'king', [3, 3], [3, 2], 'Your king is attacked by the black rook on D6. Move it to any safe neighboring square.', 'The king steps off the rook’s file. Choose any neighboring square not attacked by the rook.', [unit('attacking-rook', 'rook', 'black', [0, 3]), unit('friendly-pawn', 'pawn', 'white', [4, 2])], 'king-safety', [[2, 2], [2, 4], [3, 2], [3, 4], [4, 4]]),
  make('puzzle-rook', 'mini-puzzles', 'rook', [2, 0], [2, 5], 'Reach F4 with the rook along the open row.', 'The row is open, so the rook slides straight to F4. A friendly bishop blocks its lower file.', [unit('friendly-block', 'bishop', 'white', [4, 0]), unit('enemy-piece', 'knight', 'black', [0, 5])]),
  make('puzzle-bishop', 'mini-puzzles', 'bishop', [4, 4], [1, 1], 'Reach B5 with the bishop along the clear diagonal.', 'The bishop follows the clear diagonal to B5. A friendly pawn blocks its other diagonal.', [unit('friendly-block', 'pawn', 'white', [3, 5]), unit('enemy-piece', 'rook', 'black', [4, 0])]),
  make('puzzle-pawn', 'mini-puzzles', 'pawn', [4, 3], [3, 3], 'Move the pawn forward to D3. The opponent beside it can only be captured diagonally.', 'The pawn moves straight forward into an empty square. Its diagonal capture is a different legal move, but not the goal.', [unit('friendly-block', 'rook', 'white', [3, 2]), unit('enemy-piece', 'knight', 'black', [3, 4])]),
  make('puzzle-queen', 'mini-puzzles', 'queen', [5, 0], [2, 3], 'Reach D4 with the queen along the clear diagonal.', 'The queen follows the open diagonal to D4. A friendly rook blocks another route.', [unit('friendly-block', 'rook', 'white', [4, 0]), unit('enemy-piece', 'bishop', 'black', [1, 5])]),
];

export const CHESS_PIECES = [
  { id: 'king', name: 'King', glyph: '♔', rule: 'The king moves one square in any direction.' },
  { id: 'queen', name: 'Queen', glyph: '♕', rule: 'The queen slides any distance in a straight or diagonal line.' },
  { id: 'rook', name: 'Rook', glyph: '♖', rule: 'The rook slides horizontally or vertically.' },
  { id: 'bishop', name: 'Bishop', glyph: '♗', rule: 'The bishop slides diagonally.' },
  { id: 'knight', name: 'Knight', glyph: '♘', rule: 'The knight jumps in an L shape.' },
  { id: 'pawn', name: 'Pawn', glyph: '♙', rule: 'The pawn moves forward, and captures one square diagonally forward.' },
];
export const CHESS_AUDIO_LINES = {
  king: { prompt: 'King! Where can the King go?', rule: 'The King. The most important piece! It moves One step any direction.' },
  queen: { prompt: 'Queen! Where can the Queen go?', rule: 'The Queen. The most powerful piece! It moves Any direction, any distance.' },
  rook: { prompt: 'Rook! Where can the Rook go?', rule: 'The Rook. Looks like a castle tower! It moves Straight lines only.' },
  bishop: { prompt: 'Bishop! Where can the Bishop go?', rule: 'The Bishop. Wears a pointy hat! It moves Diagonal lines only.' },
  knight: { prompt: 'Knight! Where can the Knight jump?', rule: 'The Knight. A brave horse! It moves L-shape jump.' },
  pawn: { prompt: 'Pawn! Where can the Pawn go?', rule: 'The Pawn. The little soldier! It moves One step forward.' },
};

export const chessSquare = ([r, c]) => `${String.fromCharCode(65 + c)}${BOARD_SIZE - r}`;
export const isChessSquare = (p) => Array.isArray(p) && p.length === 2 && p.every(Number.isInteger) && p.every((n) => n >= 0 && n < BOARD_SIZE);
const same = (a, b) => a[0] === b[0] && a[1] === b[1];
const at = (piece, pos) => same(piece.at, pos);
const occupied = (pieces, pos) => pieces.find((piece) => at(piece, pos));

function geometry(piece, from, to, side, attack = false) {
  if (!isChessSquare(from) || !isChessSquare(to) || same(from, to)) return false;
  const dr = to[0] - from[0], dc = to[1] - from[1], ar = Math.abs(dr), ac = Math.abs(dc);
  if (piece === 'knight') return (ar === 2 && ac === 1) || (ar === 1 && ac === 2);
  if (piece === 'pawn') return attack ? ar === 1 && ac === 1 && dr === (side === 'white' ? -1 : 1) : ac === 0 && dr === (side === 'white' ? -1 : 1);
  if (piece === 'king') return ar <= 1 && ac <= 1;
  const straight = dr === 0 || dc === 0, diagonal = ar === ac;
  return piece === 'queen' ? straight || diagonal : piece === 'rook' ? straight : piece === 'bishop' ? diagonal : false;
}

/** True when a piece attacks a square; pawn attacks are diagonal even when the square is empty. */
export function chessPieceAttacks(piece, target, boardPieces = []) {
  if (!piece || !isChessSquare(piece.at) || !isChessSquare(target) || !geometry(piece.type, piece.at, target, piece.side, true)) return false;
  if (['knight', 'king', 'pawn'].includes(piece.type)) return true;
  const dr = target[0] - piece.at[0], dc = target[1] - piece.at[1], steps = Math.max(Math.abs(dr), Math.abs(dc));
  for (let i = 1; i < steps; i += 1) {
    const square = [piece.at[0] + Math.sign(dr) * i, piece.at[1] + Math.sign(dc) * i];
    if (occupied(boardPieces, square)) return false;
  }
  return true;
}

/** Legal teaching move with occupancy, friendly-piece, board-edge and path checks. */
export function chessMoveIsLegal(piece, from, to, boardPieces = [], { side = 'white', capture = false } = {}) {
  if (!geometry(piece, from, to, side, piece === 'pawn' && capture)) return false;
  const destination = occupied(boardPieces, to);
  if (destination && (destination.side === side || !capture)) return false;
  if (!destination && capture) return false;
  if (piece === 'pawn') return capture ? Math.abs(to[1] - from[1]) === 1 : !destination;
  if (['knight', 'king'].includes(piece)) return true;
  const dr = to[0] - from[0], dc = to[1] - from[1], steps = Math.max(Math.abs(dr), Math.abs(dc));
  for (let i = 1; i < steps; i += 1) if (occupied(boardPieces, [from[0] + Math.sign(dr) * i, from[1] + Math.sign(dc) * i])) return false;
  return true;
}

export function attackedBySide(target, side, pieces) {
  return pieces.filter((piece) => piece.side === side && chessPieceAttacks(piece, target, pieces));
}

/** Test capture safety after removing the captured defender and moving the capturer onto its square. */
export function analyzeChessMove(puzzle, to) {
  const pieces = puzzle.pieces || [], target = occupied(pieces, to), isCapture = Boolean(target && target.side !== 'white');
  const legal = chessMoveIsLegal(puzzle.piece, puzzle.from, to, pieces, { side: 'white', capture: isCapture });
  if (!legal) return { legal: false, safe: false, attackedBy: [] };
  const moved = pieces.filter((piece) => piece !== target).map((piece) => piece);
  moved.push({ id: 'moving-piece', type: puzzle.piece, side: 'white', at: to });
  const attackedBy = attackedBySide(to, 'black', moved);
  return { legal: true, safe: attackedBy.length === 0, attackedBy, capture: isCapture };
}

export function isSquareAttackedAfterKingMove(puzzle, to) {
  const result = analyzeKingMove(puzzle, to);
  return result.legal && !result.safe;
}

export function analyzeKingMove(puzzle, to) {
  const pieces = puzzle.pieces || [], target = occupied(pieces, to), capture = Boolean(target && target.side !== 'white');
  if (!chessMoveIsLegal('king', puzzle.from, to, pieces, { side: 'white', capture })) return { legal: false, safe: false, attackedBy: [], capture };
  const moved = pieces.filter((piece) => piece !== target);
  moved.push({ id: 'moving-king', type: 'king', side: 'white', at: to });
  const attackedBy = attackedBySide(to, 'black', moved);
  return { legal: true, safe: attackedBy.length === 0, attackedBy, capture };
}

/** Enumerate board-click outcomes for independent QA; coordinates and occupants stay authored and inspectable. */
export function getChessPuzzleMoveAnalysis(puzzle) {
  return Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => [Math.floor(index / BOARD_SIZE), index % BOARD_SIZE]).map((square) => {
    const goal = puzzle.goalSquares.some((candidate) => same(candidate, square));
    if (puzzle.kind === 'safe-capture') {
      const analysis = analyzeChessMove(puzzle, square);
      return { square, goal, ...analysis, solvesGoal: analysis.legal && analysis.safe && analysis.capture };
    }
    if (puzzle.kind === 'king-safety') {
      const analysis = analyzeKingMove(puzzle, square);
      return { square, goal, ...analysis, solvesGoal: analysis.legal && analysis.safe };
    }
    const legal = chessMoveIsLegal(puzzle.piece, puzzle.from, square, puzzle.pieces, { side: 'white' });
    return { square, goal, legal, safe: true, attackedBy: [], solvesGoal: legal && goal };
  });
}

export function seededChessRun(chapterId, seed = Date.now(), recentIds = []) {
  const pool = CHESS_ADVENTURES.filter((p) => p.chapterId === chapterId);
  let state = Number(seed) >>> 0;
  const rand = () => { state = (1664525 * state + 1013904223) >>> 0; return state / 4294967296; };
  const fresh = pool.filter((p) => !recentIds.includes(p.id));
  const chosen = [...(fresh.length >= 5 ? fresh : pool)];
  for (let i = chosen.length - 1; i > 0; i -= 1) { const j = Math.floor(rand() * (i + 1)); [chosen[i], chosen[j]] = [chosen[j], chosen[i]]; }
  const lastPuzzleId = recentIds.at(-1);
  if (chosen.length > 1 && chosen[0]?.id === lastPuzzleId) chosen.push(chosen.shift());
  return chosen;
}
