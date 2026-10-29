import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ChevronDown, RotateCcw, Swords, Undo2 } from 'lucide-react';
import {
  CHESS_DIFFICULTIES, CHESS_PIECE_NAMES, colorCode, colorName, createChessGame,
  applyChessMove, getChessBoardSquares, getChessStatus, legalMovesFrom, restoreChessGame, serializeChessGame,
} from '../../data/chessGameRules.js';
import {
  completeChessGameMatch, markChessGameRewardClaimed, pendingChessGameRewards,
  readChessGameProgress, saveChessGameMatch,
} from '../../data/chessGameProgress.js';
import './chessGame.css';

const DIFFICULTY_LABELS = { beginner: 'Beginner', growing: 'Growing', challenge: 'Challenge' };
const PIECE_LETTERS = { k: 'K', q: 'Q', r: 'R', b: 'B', n: 'N', p: 'P' };
const newMatchId = () => {
  try { return globalThis.crypto?.randomUUID?.().replaceAll('-', '') || `game_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`; }
  catch { return `game_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`; }
};

function PieceMark({ piece }) {
  if (!piece) return null;
  const white = piece.color === 'w';
  const ink = white ? '#302319' : '#fff3d1';
  const fill = white ? '#fffdf3' : '#182338';
  const shapes = {
    p: <><circle cx="22.5" cy="12" r="6" /><path d="M19 18h7l2 12H17z" /><path d="M15 30h15l3 6H12z" /></>,
    n: <><path d="M12 35c0-7 5-10 6-15l-5 4-5-3 6-10 7-5 3 4c8 0 12 8 11 16l-2 9z" /><path d="m15 13 3 1m6-4-1 6" fill="none" /><circle cx="19" cy="15" r="1.2" fill={ink} stroke="none" /></>,
    b: <><path d="M22.5 5c-5 5-10 10-8 15 1 3 4 5 8 5s7-2 8-5c2-5-3-10-8-15z" /><path d="m26 10-7 9" fill="none" strokeWidth="2.5" /><path d="M19 25h7l3 9H16z" /></>,
    r: <><path d="M10 8h6v5h4V8h5v5h4V8h6v11l-5 3 1 12H14l1-12-5-3z" /><path d="M15 21h15" fill="none" /></>,
    q: <><path d="m11 12 6 6 5.5-11 5.5 11 6-6-4 14H15z" /><circle cx="11" cy="10" r="2.5" /><circle cx="22.5" cy="6" r="2.5" /><circle cx="34" cy="10" r="2.5" /><path d="M17 26h11l3 8H14z" /></>,
    k: <><path d="M22.5 4v11m-4-7h8" fill="none" strokeWidth="3.2" /><path d="M16 15h13l3 6-6 7 3 6H16l3-6-6-7z" /><path d="M16 24h13" fill="none" /></>,
  };
  return <svg className={`chess-play-piece ${white ? 'chess-play-piece--white' : 'chess-play-piece--black'}`} viewBox="0 0 45 45" aria-hidden="true" focusable="false">
    <g fill={fill} stroke={ink} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
      {shapes[piece.type]}
      <path d="M12 34h21l3 5H9z" />
      <path d="M9 39h27v3H9z" />
    </g>
  </svg>;
}

function formatMove(move, index) {
  return `${Math.floor(index / 2) + 1}${index % 2 ? '…' : '.'} ${move.from}–${move.to}${move.promotion ? `=${PIECE_LETTERS[move.promotion]}` : ''}`;
}

export default function ChessGame({
  playerId = 'amari', onBack = () => {}, onPhaseChange, onCelebrate = () => {}, playSfx = () => {},
}) {
  const [progress, setProgress] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [mode, setMode] = useState('setup');
  const [difficulty, setDifficulty] = useState('beginner');
  const [humanColor, setHumanColor] = useState('white');
  const [, setBoardVersion] = useState(0);
  const [selected, setSelected] = useState(null);
  const [promotionFrom, setPromotionFrom] = useState(null);
  const [message, setMessage] = useState('Choose a side and difficulty, then start a game.');
  const [saving, setSaving] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [computerError, setComputerError] = useState(false);
  const [conflictError, setConflictError] = useState(false);
  const [moveListOpen, setMoveListOpen] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const [finished, setFinished] = useState(false);
  const gameRef = useRef(createChessGame());
  const matchRef = useRef(null);
  const expectedRef = useRef(null);
  const pendingRef = useRef(null);
  const workerRef = useRef(null);
  const workerRequestRef = useRef(null);
  const generationRef = useRef(0);
  const busyRef = useRef(false);
  const claimInFlightRef = useRef(new Set());
  const recoveredPlayerRef = useRef(null);
  const squareRefs = useRef(new Map());
  const [renderedMatch, setRenderedMatch] = useState(null);
  const currentGame = gameRef.current;
  const currentSnapshot = useMemo(() => serializeChessGame(currentGame), [currentGame]);
  const status = currentSnapshot.status;
  const match = renderedMatch || matchRef.current;
  const phase = finished ? 'finish' : mode === 'setup' ? 'intro' : 'play';

  useEffect(() => { onPhaseChange?.(phase); }, [phase, onPhaseChange]);

  const stopComputer = useCallback((updateState = true) => {
    generationRef.current += 1;
    if (workerRef.current) workerRef.current.terminate();
    workerRef.current = null;
    workerRequestRef.current = null;
    if (updateState) setThinking(false);
  }, []);

  const load = useCallback(() => {
    stopComputer();
    pendingRef.current = null;
    setConflictError(false); setComputerError(false);
    recoveredPlayerRef.current = null;
    const result = readChessGameProgress(playerId);
    if (!result.ok) {
      setLoadError(result.error || 'Saved chess data could not be read.');
      setProgress(null);
      return false;
    }
    setLoadError('');
    setProgress(result.progress);
    matchRef.current = result.progress.match;
    expectedRef.current = result.progress.match;
    setRenderedMatch(result.progress.match);
    if (result.progress.match) {
      const restored = restoreChessGame(result.progress.match);
      if (!restored.ok) {
        setLoadError(restored.error);
        return false;
      }
      gameRef.current = restored.game;
      setBoardVersion((v) => v + 1);
      setDifficulty(result.progress.match.difficulty);
      setHumanColor(result.progress.match.humanColor);
      setFinished(Boolean(result.progress.match.result));
      setMode(result.progress.match.result ? 'complete' : 'setup');
      setMessage(result.progress.match.result ? result.progress.match.status.message : 'A saved game is ready to resume.');
    } else {
      gameRef.current = createChessGame();
      setBoardVersion((v) => v + 1);
      setFinished(false);
      setMode('setup');
    }
    return true;
  }, [playerId, stopComputer]);

  useEffect(() => { load(); return () => stopComputer(false); }, [load, stopComputer]);

  const claimReceipt = useCallback(async (receipt, quiet = false) => {
    if (!receipt || receipt.rewardDelta <= 0 || claimInFlightRef.current.has(receipt.id)) return true;
    claimInFlightRef.current.add(receipt.id);
    try {
      let claim;
      try {
        claim = onCelebrate(
          quiet ? 'Chess game reward recovered.' : 'Chess game complete!',
          4, 0, 'chess', { quiet, rewardToken: `chess:${receipt.id}` },
        );
      } catch { return false; }
      if (!claim || claim.persisted !== true) return false;
      const saved = markChessGameRewardClaimed(playerId, receipt.id);
      if (!saved.ok) return false;
      setProgress(saved.progress);
      matchRef.current = saved.progress.match;
      setRenderedMatch(saved.progress.match);
      return true;
    } finally {
      claimInFlightRef.current.delete(receipt.id);
    }
  }, [onCelebrate, playerId]);

  useEffect(() => {
    if (!progress || recoveredPlayerRef.current === playerId) return;
    recoveredPlayerRef.current = playerId;
    let cancelled = false;
    const recover = async () => {
      for (const receipt of pendingChessGameRewards(progress)) {
        if (cancelled) return;
        const ok = await claimReceipt(receipt, true);
        if (!ok && !cancelled) {
          pendingRef.current = { kind: 'parent', receipt, input: null };
          setFinished(true); setMode('complete');
          setMessage('A saved game reward still needs to be confirmed. Retry it on the result screen.');
        }
      }
    };
    recover();
    return () => { cancelled = true; };
  }, [claimReceipt, progress, playerId]);

  const publishGame = (game, nextMatch = matchRef.current) => {
    gameRef.current = game;
    matchRef.current = nextMatch;
    setRenderedMatch(nextMatch);
    setBoardVersion((v) => v + 1);
    setSelected(null);
    setPromotionFrom(null);
  };

  const baseMatch = (game, template = matchRef.current) => ({
    id: template?.id || newMatchId(),
    humanColor: template?.humanColor || humanColor,
    difficulty: template?.difficulty || difficulty,
    ...serializeChessGame(game),
    result: null,
    updatedAt: Date.now(),
  });

  const claimFinished = async (input) => {
    const result = completeChessGameMatch(playerId, input);
    if (!result.ok) {
      pendingRef.current = { kind: 'finish', input, expected: expectedRef.current };
      setMessage(result.error || 'The result could not be saved. Retry to keep this game.');
      setSaving(false);
      setMode('playing');
      setFinished(false);
      return false;
    }
    setProgress(result.progress);
    matchRef.current = result.progress.match;
    expectedRef.current = result.progress.match;
    setRenderedMatch(result.progress.match);
    pendingRef.current = null;
    setFinished(true);
    setSaving(false);
    setMode('complete');
    setMessage(result.progress.match.status.message);
    if (result.receipt) {
      const claimed = await claimReceipt(result.receipt, false);
      if (!claimed) {
        pendingRef.current = { kind: 'parent', input, receipt: result.receipt };
        setMessage('Your game is saved. The reward could not be confirmed yet; retry it below.');
      }
    }
    return true;
  };

  const persistBoard = async (candidate, intent, expected, continuation = null, template = matchRef.current) => {
    if (busyRef.current) return false;
    busyRef.current = true;
    setSaving(true);
    const input = { id: template?.id || newMatchId(), humanColor: template?.humanColor || humanColor, difficulty: template?.difficulty || difficulty, ...serializeChessGame(candidate), result: null, updatedAt: Date.now() };
    publishGame(candidate, matchRef.current);
    if (getChessStatus(candidate).gameOver) {
      busyRef.current = false;
      setSaving(false);
      return claimFinished(input);
    }
    pendingRef.current = { kind: 'board', input, intent, expected, continuation };
    const result = saveChessGameMatch(playerId, input, undefined, { intent, expected, replace: intent === 'start' });
    if (!result.ok) {
      setConflictError(/saved match changed|reload before saving/i.test(result.error || ''));
      setMessage(result.error || 'This board could not be saved. Retry keeps the same position.');
      setSaving(false);
      busyRef.current = false;
      return false;
    }
    matchRef.current = result.progress.match;
    expectedRef.current = result.progress.match;
    setProgress(result.progress);
    setRenderedMatch(result.progress.match);
    pendingRef.current = null;
    setSaving(false);
    busyRef.current = false;
    if (getChessStatus(candidate).gameOver) return claimFinished(input);
    setMessage(getChessStatus(candidate).message);
    if (continuation === 'computer') requestComputer(candidate, result.progress.match);
    return true;
  };

  const retryPending = async () => {
    const pending = pendingRef.current;
    if (!pending || busyRef.current) return;
    busyRef.current = true; setSaving(true);
    try {
      if (pending.kind === 'finish') { await claimFinished(pending.input); return; }
      if (pending.kind === 'parent') {
        const ok = await claimReceipt(pending.receipt, false);
        if (ok) { pendingRef.current = null; setMessage(matchRef.current?.status.message || 'Reward confirmed.'); }
        else setMessage('The reward is still waiting to be confirmed. Retry when ready.');
        return;
      }
      if (pending.kind === 'board') {
        const result = saveChessGameMatch(playerId, pending.input, undefined, { intent: pending.intent, expected: pending.expected, replace: pending.intent === 'start' });
        if (!result.ok) { setConflictError(/saved match changed|reload before saving/i.test(result.error || '')); setMessage(result.error || 'The board is still not saved.'); return; }
        pendingRef.current = null;
        matchRef.current = result.progress.match;
        expectedRef.current = result.progress.match;
        setProgress(result.progress);
        setRenderedMatch(result.progress.match);
        if (getChessStatus(gameRef.current).gameOver) { await claimFinished(pending.input); return; }
        setMessage(getChessStatus(gameRef.current).message);
        if (pending.continuation === 'computer') requestComputer(gameRef.current, result.progress.match);
      }
    } finally { busyRef.current = false; setSaving(false); }
  };

  function requestComputer(position, savedMatch) {
    stopComputer();
    setComputerError(false);
    const requestGeneration = generationRef.current;
    const requestId = `${savedMatch.id}_${requestGeneration}_${Date.now()}`;
    let worker;
    try { worker = new Worker(new URL('../../workers/chessAi.worker.js', import.meta.url), { type: 'module' }); }
    catch {
      setThinking(false); setComputerError(true); setMessage('The computer turn could not start. Retry this turn.'); return;
    }
    workerRef.current = worker;
    workerRequestRef.current = requestId;
    setThinking(true);
    setMode('playing');
    setMessage('The computer is thinking…');
    worker.onmessage = (event) => {
      const data = event.data;
      if (requestGeneration !== generationRef.current || data?.requestId !== workerRequestRef.current || matchRef.current?.id !== savedMatch.id) return;
      worker.terminate(); workerRef.current = null; workerRequestRef.current = null; setThinking(false);
      if (!data.ok || !data.move) { setComputerError(true); setMessage(data.error || 'The computer could not find a move. Retry its turn.'); return; }
      const latest = restoreChessGame(savedMatch);
      if (!latest.ok || latest.game.fen() !== position.fen()) { setConflictError(true); setMessage('The saved board changed. Load it before continuing.'); return; }
      const applied = applyChessMove(latest.game, data.move);
      if (!applied.ok) { setComputerError(true); setMessage('The computer response was not a legal move. Retry this turn.'); return; }
      const computerNext = baseMatch(latest.game, savedMatch);
      if (getChessStatus(latest.game).gameOver) {
        publishGame(latest.game, savedMatch);
        claimFinished(computerNext);
        return;
      }
      busyRef.current = true;
      setSaving(true);
      const result = saveChessGameMatch(playerId, computerNext, undefined, { intent: 'advance', expected: savedMatch });
      publishGame(latest.game, result.progress?.match || savedMatch);
      busyRef.current = false;
      setSaving(false);
      if (!result.ok) {
        setConflictError(/saved match changed|reload before saving/i.test(result.error || ''));
        pendingRef.current = { kind: 'board', input: computerNext, intent: 'advance', expected: savedMatch, continuation: null };
        setMessage(result.error || 'The computer move could not be saved. Retry to keep this turn.');
        setMode('playing');
        return;
      }
      expectedRef.current = result.progress.match;
      matchRef.current = result.progress.match;
      setProgress(result.progress); setRenderedMatch(result.progress.match);
      setComputerError(false); setMode('playing'); setMessage(getChessStatus(latest.game).message);
    };
    worker.onerror = () => {
      if (requestGeneration !== generationRef.current) return;
      worker.terminate(); workerRef.current = null; workerRequestRef.current = null; setThinking(false);
      setComputerError(true); setMessage('The computer turn paused. Choose Retry computer turn to continue.');
    };
    try {
      worker.postMessage({ requestId, history: position.history({ verbose: true }).map(({ from, to, promotion }) => ({ from, to, ...(promotion ? { promotion } : {}) })), difficulty: savedMatch.difficulty, computerColor: savedMatch.humanColor === 'white' ? 'black' : 'white', seed: savedMatch.history.length + savedMatch.difficulty.length });
    } catch {
      worker.terminate(); workerRef.current = null; workerRequestRef.current = null;
      setThinking(false); setComputerError(true); setMessage('The computer turn could not be sent. Retry this turn.');
    }
  }

  const startNew = async (confirmed = false) => {
    if (loadError) return;
    const old = matchRef.current;
    if (old && !confirmed) { setConfirmNew(true); return; }
    stopComputer();
    const nextGame = createChessGame();
    const nextMatch = { id: newMatchId(), humanColor, difficulty, ...serializeChessGame(nextGame), result: null, updatedAt: Date.now() };
    const expected = expectedRef.current;
    setConfirmNew(false); setFinished(false); setMode('playing');
    const saved = await persistBoard(nextGame, 'start', expected, humanColor === 'black' ? 'computer' : null, nextMatch);
    if (!saved) return;
    if (humanColor !== 'black') setMessage('Your turn. Choose a piece, then a highlighted legal square.');
  };

  const resume = () => {
    if (!matchRef.current || matchRef.current.result) return;
    const restored = restoreChessGame(matchRef.current);
    if (!restored.ok) { setLoadError(restored.error); return; }
    publishGame(restored.game, matchRef.current);
    setMode('playing'); setFinished(false);
    if (restored.game.turn() !== colorCode(matchRef.current.humanColor)) requestComputer(restored.game, matchRef.current);
    else setMessage('Your turn. Choose a piece, then a highlighted legal square.');
  };

  const humanTurn = mode === 'playing' && !finished && !thinking && !saving && !pendingRef.current && !loadError && currentSnapshot.turn === colorCode(humanColor) && !status.gameOver;
  const legalFromSelected = selected ? legalMovesFrom(currentGame, selected) : [];
  const squares = getChessBoardSquares(currentGame);
  const legalTargets = new Map(legalFromSelected.map((move) => [move.to, move]));
  const isHumanPiece = (piece) => piece && piece.color === colorCode(humanColor);

  const chooseSquare = (square) => {
    if (!humanTurn || busyRef.current) return;
    const piece = currentGame.get(square);
    if (!selected) {
      if (isHumanPiece(piece)) setSelected(square);
      else setMessage('Choose one of your own pieces first.');
      return;
    }
    if (square === selected) { setSelected(null); return; }
    const moves = legalMovesFrom(currentGame, selected).filter((move) => move.to === square);
    if (moves.length && moves.some((move) => move.promotion)) { setPromotionFrom({ from: selected, to: square }); return; }
    if (moves.length) {
      const candidate = restoreChessGame(serializeChessGame(currentGame)).game;
      candidate.move({ from: selected, to: square });
      const continuation = candidate.isGameOver() ? null : 'computer';
      persistBoard(candidate, 'advance', expectedRef.current, continuation);
      playSfx('chess-move');
      return;
    }
    if (isHumanPiece(piece)) setSelected(square);
    else setMessage('That move is not legal. The board stays ready for another try.');
  };

  const promote = (promotion) => {
    if (!promotionFrom) return;
    const candidate = restoreChessGame(serializeChessGame(currentGame)).game;
    candidate.move({ ...promotionFrom, promotion });
    setPromotionFrom(null);
    persistBoard(candidate, 'advance', expectedRef.current, candidate.isGameOver() ? null : 'computer');
    playSfx('chess-move');
  };

  const undoTurn = () => {
    if (!matchRef.current || status.gameOver || thinking || saving || pendingRef.current || matchRef.current.history.length < 2) return;
    stopComputer();
    const history = matchRef.current.history;
    const cut = Math.max(0, history.length - 2);
    const restored = restoreChessGame({ ...matchRef.current, history: history.slice(0, cut), ...(() => {
      const temp = createChessGame(); history.slice(0, cut).forEach((move) => temp.move(move));
      const serialized = serializeChessGame(temp); return { fen: serialized.fen, turn: serialized.turn, status: serialized.status };
    })() });
    if (!restored.ok) { setMessage('Undo could not restore this game safely.'); return; }
    persistBoard(restored.game, 'undo', expectedRef.current, null);
  };

  const leaveGame = () => { stopComputer(); setSelected(null); setPromotionFrom(null); onBack(); };
  const squareOrder = humanColor === 'white' ? squares : [...squares].reverse();
  const lastMove = currentSnapshot.history.at(-1);
  const checkSquare = status.inCheck ? currentGame.board().flatMap((rank, row) => rank.map((piece, col) => piece?.type === 'k' && piece.color === currentGame.turn() ? `${String.fromCharCode(97 + col)}${8 - row}` : null)).find(Boolean) : null;
  const pendingError = Boolean(pendingRef.current);

  if (loadError || !progress) return <main className="chess-full-game"><header className="chess-full-header"><button type="button" className="chess-full-button" onClick={leaveGame}><ArrowLeft size={18} /> Lessons</button><h1>Chess vs computer</h1></header><section className="chess-full-card" role="alert"><p>{loadError || 'Reading saved chess data…'}</p><button type="button" className="chess-full-button" onClick={load}>Retry reading saved game</button></section></main>;

  if (mode === 'setup' || mode === 'complete') return <main className="chess-full-game">
    <header className="chess-full-header"><button type="button" className="chess-full-button" onClick={leaveGame}><ArrowLeft size={18} /> Lessons</button><h1>Chess vs computer</h1></header>
    <section className="chess-full-card chess-setup-card">
      <div className="chess-full-badge"><Swords size={21} /> Full 8×8 game</div>
      {matchRef.current?.result && <div className="chess-full-result" role="status"><h2>{matchRef.current.status.message}</h2><p>{matchRef.current.result.outcome === 'win' ? 'You won.' : matchRef.current.result.outcome === 'loss' ? 'The computer won this game.' : 'This game was a draw.'}</p>{pendingError && <><p role="alert">{message}</p><button className="chess-full-primary" onClick={retryPending} disabled={saving}>Retry reward confirmation</button></>}</div>}
      {matchRef.current && !matchRef.current.result && <div className="chess-full-result"><h2>Saved game ready</h2><p>{DIFFICULTY_LABELS[matchRef.current.difficulty]} · You play {colorName(colorCode(matchRef.current.humanColor))} · {matchRef.current.history.length} moves played</p><button className="chess-full-primary" onClick={resume}>Resume saved game</button></div>}
      <fieldset className="chess-choice-group"><legend>Computer difficulty</legend>{CHESS_DIFFICULTIES.map((choice) => <button key={choice} type="button" aria-pressed={difficulty === choice} className={`chess-choice ${difficulty === choice ? 'is-selected' : ''}`} onClick={() => setDifficulty(choice)}>{DIFFICULTY_LABELS[choice]}</button>)}</fieldset>
      <fieldset className="chess-choice-group"><legend>Your side</legend>{['white', 'black'].map((side) => <button key={side} type="button" aria-pressed={humanColor === side} className={`chess-choice ${humanColor === side ? 'is-selected' : ''}`} onClick={() => setHumanColor(side)}>Play {side}</button>)}</fieldset>
      {confirmNew && <div className="chess-confirm" role="alertdialog" aria-labelledby="chess-new-title"><h2 id="chess-new-title">Start a new game?</h2><p>This replaces the currently saved board. Its completed rewards stay saved.</p><div><button className="chess-full-button" onClick={() => setConfirmNew(false)}>Keep saved game</button><button className="chess-full-primary" onClick={() => startNew(true)}>Start new game</button></div></div>}
      <button className="chess-full-primary" disabled={saving || Boolean(loadError)} onClick={() => startNew(false)}>{matchRef.current ? 'New game' : 'Start game'}</button>
      {pendingError && <div role="alert" className="chess-save-error"><p>{message}</p><button className="chess-full-primary" disabled={saving} onClick={retryPending}>Retry save</button></div>}
      <details className="chess-howto"><summary><ChevronDown size={18} /> How to play</summary><p>Tap one of your pieces, then choose a highlighted square. The board marks your last move, checks, legal moves and captures. Castling, en passant, promotion, checkmate and draws follow standard chess rules.</p></details>
    </section>
  </main>;

  return <main className="chess-full-game">
    <header className="chess-full-header"><button type="button" className="chess-full-button" onClick={leaveGame}><ArrowLeft size={18} /> Lessons</button><h1>Chess vs computer</h1><span className="chess-header-level">{DIFFICULTY_LABELS[match?.difficulty || difficulty]}</span></header>
    <section className="chess-match-layout" aria-label="Chess match">
      <div className="chess-match-status"><strong>{status.gameOver ? status.message : thinking ? 'Computer thinking…' : `${colorName(currentSnapshot.turn)} to move${status.inCheck ? ' · Check!' : ''}`}</strong><span>You are {colorName(colorCode(humanColor))} · Computer is {colorName(humanColor === 'white' ? 'b' : 'w')}</span></div>
      <div className="chess-board-frame">
        <div className="chess-play-board" role="grid" aria-label={`Chess board. ${colorName(colorCode(humanColor))} at bottom`}>
          {squareOrder.map(({ square, piece }, index) => {
            const legalMove = legalTargets.get(square);
            const isSelected = selected === square;
            const isLast = lastMove?.from === square || lastMove?.to === square;
            const isCheck = checkSquare === square;
            const isLight = ((square.charCodeAt(0) - 97) + Number(square[1])) % 2 === 0;
            const label = `${square}, ${piece ? `${colorName(piece.color)} ${piece.name}` : 'empty square'}${legalMove ? legalMove.captured ? ', legal capture' : ', legal move' : ''}${isSelected ? ', selected' : ''}${isLast ? ', last move' : ''}${isCheck ? ', king in check' : ''}`;
            return <button key={square} ref={(node) => node ? squareRefs.current.set(square, node) : squareRefs.current.delete(square)} type="button" role="gridcell" tabIndex={index === 0 ? 0 : undefined} aria-label={label} aria-selected={isSelected} disabled={!humanTurn} onClick={() => chooseSquare(square)} onKeyDown={(event) => {
              const whiteBottom = humanColor === 'white';
              const deltas = { ArrowUp: [0, whiteBottom ? 1 : -1], ArrowDown: [0, whiteBottom ? -1 : 1], ArrowLeft: [whiteBottom ? -1 : 1, 0], ArrowRight: [whiteBottom ? 1 : -1, 0] };
              const delta = deltas[event.key]; if (!delta) return;
              event.preventDefault();
              const file = square.charCodeAt(0) - 97 + delta[0], rank = Number(square[1]) + delta[1];
              if (file >= 0 && file < 8 && rank >= 1 && rank <= 8) squareRefs.current.get(`${String.fromCharCode(97 + file)}${rank}`)?.focus();
            }} className={`chess-play-square ${isLight ? 'chess-play-square--light' : 'chess-play-square--dark'} ${isLast ? 'chess-play-square--last' : ''} ${isSelected ? 'chess-play-square--selected' : ''} ${isCheck ? 'chess-play-square--check' : ''} ${legalMove ? legalMove.captured ? 'chess-play-square--capture' : 'chess-play-square--legal' : ''}`}>
              {(square[0] === (humanColor === 'white' ? 'a' : 'h') || square[1] === (humanColor === 'white' ? '1' : '8')) && <span className="chess-play-coordinate">{square}</span>}
              {legalMove && <span className={`chess-play-target ${legalMove.captured ? 'chess-play-target--capture' : ''}`} aria-hidden="true" />}
              <PieceMark piece={piece} />
            </button>;
          })}
        </div>
      </div>
      <div className="chess-control-card">
        <p className="chess-live-message" role="status" aria-live="polite">{pendingError ? message : thinking ? 'The computer is choosing a legal move.' : message}</p>
        {(pendingError || computerError) && <button className="chess-full-primary" onClick={pendingError ? retryPending : () => requestComputer(currentGame, matchRef.current)} disabled={saving}>{pendingError ? 'Retry save' : 'Retry computer turn'}</button>}
        {conflictError && <div className="chess-save-error" role="alert"><p>This board no longer matches the saved game. Loading it will replace the board shown here.</p><button className="chess-full-button" onClick={load}>Load saved game</button></div>}
        {status.gameOver && !pendingError && <div className="chess-completion-note"><strong>{status.message}</strong><p>Completed games earn once per difficulty.</p><button className="chess-full-primary" onClick={() => { setMode('complete'); setFinished(true); }}>Finish game</button></div>}
        <div className="chess-actions"><button type="button" className="chess-full-button" onClick={undoTurn} disabled={(match?.history?.length || 0) < 2 || status.gameOver || thinking || saving || pendingError}><Undo2 size={17} /> Undo turn</button><button type="button" className="chess-full-button" onClick={() => setMoveListOpen((open) => !open)} aria-expanded={moveListOpen}><ChevronDown size={17} /> Moves</button><button type="button" className="chess-full-button" onClick={() => { stopComputer(); setMode('setup'); setConfirmNew(true); }} disabled={saving || pendingError}><RotateCcw size={17} /> New game</button></div>
        {moveListOpen && <ol className="chess-move-list" aria-label="Saved move history">{currentSnapshot.history.map((move, index) => <li key={`${move.from}-${move.to}-${index}`}>{formatMove(move, index)}</li>)}</ol>}
      </div>
    </section>
    {promotionFrom && <div className="chess-promotion-backdrop"><section className="chess-promotion-dialog" role="dialog" aria-modal="true" aria-labelledby="chess-promote-title"><h2 id="chess-promote-title">Choose your promotion</h2><p>Your pawn reached the last rank. Pick what it becomes.</p><div className="chess-promotion-options">{['q', 'r', 'b', 'n'].map((piece) => <button key={piece} className="chess-promotion-choice" onClick={() => promote(piece)} aria-label={`Promote to ${CHESS_PIECE_NAMES[piece]}`}><PieceMark piece={{ color: colorCode(humanColor), type: piece }} /><span>{CHESS_PIECE_NAMES[piece]}</span></button>)}</div><button className="chess-full-button" onClick={() => setPromotionFrom(null)}>Cancel</button></section></div>}
  </main>;
}
