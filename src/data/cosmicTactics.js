export const COSMIC_CHAPTERS = Object.freeze([
  { id: 'make-a-line', title: 'Make a line', rival: 'Comet', tactic: 'win', instruction: 'Two Dino marks are waiting. Find the square that makes three in a row.' },
  { id: 'block-the-rocket', title: 'Block the Rocket', rival: 'Nova', tactic: 'block', instruction: 'Rocket is nearly at three. Put a Dino mark in the square that stops the line.' },
  { id: 'find-a-fork', title: 'Find a fork', rival: 'Meteor', tactic: 'fork', instruction: 'Place one mark that makes two winning paths for your next turn.' },
]);
export const COSMIC_BOARDS_PER_CHAPTER = 3;
export const COSMIC_PROGRESS_KEY = 'amari_cosmic_tactics_v1';

export const WIN_LINES = Object.freeze([
  [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6],
]);

export const getBoardResult = (board) => {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return { winner: board[a], line, draw: false };
  }
  return board.every(Boolean) ? { winner: null, line: [], draw: true } : { winner: null, line: [], draw: false };
};

export const legalTicMoves = (board) => getBoardResult(board).winner || getBoardResult(board).draw
  ? []
  : board.flatMap((mark, index) => mark === null ? [index] : []);

export const applyTicMove = (board, index, mark) => {
  if (!Array.isArray(board) || board.length !== 9 || !Number.isInteger(index) || index < 0 || index > 8 || !['X', 'O'].includes(mark)) return null;
  if (board[index] !== null || getBoardResult(board).winner || getBoardResult(board).draw) return null;
  const next = [...board];
  next[index] = mark;
  return next;
};

export const findImmediateMoves = (board, mark) => legalTicMoves(board).filter((index) => {
  const next = [...board]; next[index] = mark;
  return getBoardResult(next).winner === mark;
});

export const findForkMoves = (board, mark) => legalTicMoves(board).filter((index) => {
  const next = [...board]; next[index] = mark;
  return findImmediateMoves(next, mark).length >= 2;
});

export const seededRandom = (seed) => {
  let state = Number(seed) >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const ROTATE = Object.freeze([0, 3, 6, 1, 4, 7, 2, 5, 8]);
const REFLECT = Object.freeze([2, 1, 0, 5, 4, 3, 8, 7, 6]);
const TRANSFORMS = Object.freeze(Array.from({ length: 8 }, (_, transform) => {
  const map = [];
  for (let cell = 0; cell < 9; cell += 1) {
    let position = transform >= 4 ? REFLECT[cell] : cell;
    for (let turn = 0; turn < transform % 4; turn += 1) position = ROTATE[position];
    map[cell] = position;
  }
  return map;
}));

const BASE_SCENARIOS = Object.freeze({
  win: { board: ['X', 'X', null, 'O', 'O', null, null, null, null], target: 2 },
  block: { board: ['O', 'O', null, null, 'X', 'X', null, null, null], target: 2 },
  fork: { board: ['X', 'O', 'X', 'O', null, null, null, null, null], target: 4 },
});

export const makeTacticScenario = ({ level = 0, seed = 1, round = 0 } = {}) => {
  const chapter = COSMIC_CHAPTERS[Math.max(0, Math.min(COSMIC_CHAPTERS.length - 1, level))];
  const base = BASE_SCENARIOS[chapter.tactic];
  const random = seededRandom(Number(seed) >>> 0);
  const layouts = TRANSFORMS.map((map) => {
    const board = Array(9).fill(null);
    base.board.forEach((mark, cell) => { if (mark) board[map[cell]] = mark; });
    return { board, target: map[base.target] };
  });
  const seen = new Set();
  const uniqueLayouts = layouts.filter((layout) => {
    const signature = layout.board.map((mark) => mark || '-').join('');
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
  const start = Math.floor(random() * uniqueLayouts.length);
  const selected = uniqueLayouts[(start + Math.max(0, round)) % uniqueLayouts.length];
  return { level, round, tactic: chapter.tactic, board: selected.board, target: selected.target };
};

const pickSeeded = (values, random) => values[Math.floor(random() * values.length)] ?? null;

export const chooseCosmicBotMove = (board, { seed = 0, difficulty = 'scout' } = {}) => {
  const moves = legalTicMoves(board);
  if (!moves.length || getBoardResult(board).winner || getBoardResult(board).draw) return null;
  const random = seededRandom(seed);
  const winning = findImmediateMoves(board, 'O');
  if (winning.length) return pickSeeded(winning, random);
  const threats = findImmediateMoves(board, 'X');
  const blocks = threats.filter((move) => {
    const next = [...board]; next[move] = 'O';
    return findImmediateMoves(next, 'X').length === 0;
  });
  const forks = findForkMoves(board, 'O');
  const forkBlocks = findForkMoves(board, 'X').filter((move) => {
    const next = [...board]; next[move] = 'O';
    return findForkMoves(next, 'X').length === 0;
  });
  const preferred = difficulty === 'scout'
    ? (blocks.length ? blocks : moves)
    : (blocks.length ? blocks : forkBlocks.length ? forkBlocks : forks.length ? forks : moves);
  return pickSeeded(preferred, random);
};

const parseProgress = (storage) => {
  try {
    const value = JSON.parse(storage?.getItem(COSMIC_PROGRESS_KEY) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
};

export const getCosmicProgress = (playerId = 'amari', storage = globalThis.localStorage) => {
  const saved = parseProgress(storage)[playerId] || {};
  const rawMissions = Array.isArray(saved.completedMissionIds) ? saved.completedMissionIds : [];
  const completedMissionIds = COSMIC_CHAPTERS.map((_, index) => [...new Set((Array.isArray(rawMissions[index]) ? rawMissions[index] : []).filter((mission) => Number.isInteger(mission) && mission >= 0 && mission < COSMIC_BOARDS_PER_CHAPTER))]);
  const completedByChapter = completedMissionIds.map((missions) => missions.length);
  let unlocked = 0;
  for (let level = 0; level < COSMIC_CHAPTERS.length - 1; level += 1) {
    if (completedByChapter[level] < COSMIC_BOARDS_PER_CHAPTER) break;
    unlocked = level + 1;
  }
  const badges = COSMIC_CHAPTERS.filter((_, index) => completedByChapter[index] >= COSMIC_BOARDS_PER_CHAPTER).map((chapter) => chapter.id);
  return { unlocked, completedByChapter, completedMissionIds, badges };
};

export const completeCosmicTactic = ({ playerId = 'amari', level, missionId, storage = globalThis.localStorage }) => {
  if (!Number.isInteger(level) || level < 0 || level >= COSMIC_CHAPTERS.length || !Number.isInteger(missionId) || missionId < 0 || missionId >= COSMIC_BOARDS_PER_CHAPTER) return { ...getCosmicProgress(playerId, storage), newlyCompleted: false, newlyAwardedBadge: false, invalid: true };
  const all = parseProgress(storage);
  const previous = getCosmicProgress(playerId, storage);
  if (level > previous.unlocked) return { ...previous, newlyCompleted: false, newlyAwardedBadge: false, invalid: true };
  const completedMissionIds = [...previous.completedMissionIds.map((missions) => [...missions])];
  const before = completedMissionIds[level].length;
  if (!completedMissionIds[level].includes(missionId)) completedMissionIds[level].push(missionId);
  const completedByChapter = completedMissionIds.map((missions) => missions.length);
  const chapterComplete = completedByChapter[level] === COSMIC_BOARDS_PER_CHAPTER;
  const badges = chapterComplete ? [...new Set([...previous.badges, COSMIC_CHAPTERS[level].id])] : previous.badges;
  const next = { completedMissionIds, unlocked: chapterComplete ? Math.max(previous.unlocked, Math.min(2, level + 1)) : previous.unlocked, badges };
  try { storage?.setItem(COSMIC_PROGRESS_KEY, JSON.stringify({ ...all, [playerId]: next })); } catch { /* device storage may be unavailable */ }
  return { ...next, completedByChapter, newlyCompleted: completedMissionIds[level].length > before, newlyAwardedBadge: chapterComplete && !previous.badges.includes(COSMIC_CHAPTERS[level].id) };
};
