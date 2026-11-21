import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Bot, Lightbulb, RotateCcw, Users, Volume2 } from 'lucide-react';
import rocketMark from '../../assets/little/fuel-rocket.webp';
import { SoundToggle } from '../shared/index.jsx';
import {
  applyTicMove,
  chooseCosmicBotMove,
  completeCosmicTactic,
  cosmicTacticPaths,
  isCosmicTacticMove,
  getCosmicFreeProgress,
  recordCosmicFreeResult,
  COSMIC_BOARDS_PER_CHAPTER,
  COSMIC_CHAPTERS,
  COSMIC_TACTIC_NARRATION,
  getBoardResult,
  getCosmicProgress,
  getCosmicRunMissionIds,
  getNextCosmicRunStep,
  makeTacticScenario,
} from '../../data/cosmicTactics.js';
export { COSMIC_TACTIC_NARRATION } from '../../data/cosmicTactics.js';


const MARK = Object.freeze({ X: { name: 'Dino', src: '/art/shadow-match-v1/trex.webp', color: 'text-lime-300' }, O: { name: 'Rocket', src: rocketMark, color: 'text-cyan-300' } });
const PLAYER_MARK = 'X';
const otherMark = (mark) => mark === 'X' ? 'O' : 'X';
const phaseName = (phase) => ({ map: 'intro', play: 'play', complete: 'complete' })[phase] || phase;
const noopCancel = () => {};
const getSeed = () => {
  if (globalThis.crypto?.getRandomValues) {
    const value = new Uint32Array(1);
    globalThis.crypto.getRandomValues(value);
    return value[0];
  }
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
};

const TicTacToe = ({
  onBack,
  playSfx = () => {},
  soundOn = false,
  onToggleSound,
  speak = () => {},
  cancelNarration = noopCancel,
  onCelebrate = () => {},
  onGameEvent,
  onPhaseChange,
  playerId = 'amari',
}) => {
  const [progress, setProgress] = useState(() => getCosmicProgress(playerId));
  const [chapterIndex, setChapterIndex] = useState(() => getCosmicProgress(playerId).unlocked);
  const [phase, setPhase] = useState('map');
  const [confirmLeaveBoard, setConfirmLeaveBoard] = useState(false);
  const [activity, setActivity] = useState('mission');
  const [opponent, setOpponent] = useState('bot');
  const [difficulty, setDifficulty] = useState('scout');
  const [seed, setSeed] = useState(getSeed);
  const [missionIndex, setMissionIndex] = useState(0);
  const [missionRunIds, setMissionRunIds] = useState([0, 1, 2]);
  const [missionRunStep, setMissionRunStep] = useState(0);
  const [board, setBoard] = useState(() => Array(9).fill(null));
  const [turn, setTurn] = useState(PLAYER_MARK);
  const [missionTarget, setMissionTarget] = useState(null);
  const [hintCell, setHintCell] = useState(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [hadMistake, setHadMistake] = useState(false);
  const [missionSolved, setMissionSolved] = useState(false);
  const [missionWrong, setMissionWrong] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [scores, setScores] = useState(() => getCosmicFreeProgress(playerId));
  const [freeRound, setFreeRound] = useState(0);
  const botTimerRef = useRef(null);
  const completedResultRef = useRef('');
  const lastAwardRef = useRef('');
  const cellRefs = useRef([]);
  const focusNewBoard = useRef(false);

  const chapter = COSMIC_CHAPTERS[chapterIndex];
  const result = useMemo(() => getBoardResult(board), [board]);
  const terminal = Boolean(result.winner || result.draw);
  const opponentName = opponent === 'bot' ? 'Nova Bot' : 'Rocket';
  const winnerName = result.winner === 'O' ? opponentName : MARK.X.name;
  const botThinking = phase === 'play' && activity === 'free' && opponent === 'bot' && turn === 'O' && !terminal && !confirmLeaveBoard;
  const requestLeaveBoard = () => setConfirmLeaveBoard(true);
  const keepPlaying = () => setConfirmLeaveBoard(false);
  const leaveBoard = () => {
    cancelNarration();
    setConfirmLeaveBoard(false);
    clearTimeout(botTimerRef.current);
    setPhase('map');
  };

  useEffect(() => { onPhaseChange?.(phaseName(phase)); }, [onPhaseChange, phase]);
  useEffect(() => {
    if (!focusNewBoard.current) return;
    focusNewBoard.current = false;
    cellRefs.current[0]?.focus({ preventScroll: true });
  }, [freeRound]);
  useEffect(() => { setProgress(getCosmicProgress(playerId)); setScores(getCosmicFreeProgress(playerId)); }, [playerId]);
  useEffect(() => () => {
    clearTimeout(botTimerRef.current);
    cancelNarration();
  }, [cancelNarration]);

  const say = useCallback((text) => {
    if (soundOn && text) speak(text, { premium: false });
  }, [soundOn, speak]);

  const startMission = (requestedChapter = chapterIndex, replay = false) => {
    const saved = getCosmicProgress(playerId);
    if (!replay && requestedChapter > saved.unlocked) return;
    cancelNarration();
    const runMissionIds = getCosmicRunMissionIds(saved.completedMissionIds[requestedChapter], replay);
    const nextMissionIndex = runMissionIds[0];
    const nextSeed = getSeed();
    const scenario = makeTacticScenario({ level: requestedChapter, seed: nextSeed, round: nextMissionIndex });
    clearTimeout(botTimerRef.current);
    completedResultRef.current = '';
    lastAwardRef.current = '';
    setChapterIndex(requestedChapter);
    setActivity('mission');
    setSeed(nextSeed);
    setMissionIndex(nextMissionIndex);
    setMissionRunIds(runMissionIds);
    setMissionRunStep(0);
    setBoard(scenario.board);
    setMissionTarget(scenario.target);
    setTurn('X');
    setHintCell(null);
    setHintUsed(false);
    setHintCount(0);
    setHadMistake(false);
    setMissionSolved(false);
    setMissionWrong(false);
    setFeedback(COSMIC_CHAPTERS[requestedChapter].instruction);
    window.scrollTo({top:0,left:0,behavior:'instant'});
    setPhase('play');
    onGameEvent?.('tictactoe', 'start', { level: requestedChapter, round: nextMissionIndex, seed: nextSeed, difficulty: ['starter', 'growing', 'challenge'][requestedChapter] });
    say(COSMIC_CHAPTERS[requestedChapter].instruction);
    playSfx('launch');
  };

  const startFreePlay = (nextOpponent = opponent, nextDifficulty = difficulty) => {
    cancelNarration();
    const nextSeed = getSeed();
    clearTimeout(botTimerRef.current);
    completedResultRef.current = '';
    setActivity('free');
    setOpponent(nextOpponent);
    setDifficulty(nextDifficulty);
    setSeed(nextSeed);
    setFreeRound((value) => value + 1);
    setBoard(Array(9).fill(null));
    setTurn('X');
    setHintCell(null);
    setMissionTarget(null);
    setHintUsed(false);
    setHadMistake(false);
    setMissionSolved(false);
    setMissionWrong(false);
    setFeedback(COSMIC_TACTIC_NARRATION[5]);
    window.scrollTo({top:0,left:0,behavior:'instant'});
    setPhase('play');
    onGameEvent?.('tictactoe', 'start', { level: chapterIndex, round: freeRound + 1, seed: nextSeed, difficulty: nextOpponent === 'bot' ? nextDifficulty : 'two-player' });
    say(COSMIC_TACTIC_NARRATION[5]);
    playSfx('launch');
  };

  const beginBoard = () => {
    cancelNarration();
    const nextSeed = getSeed();
    clearTimeout(botTimerRef.current);
    completedResultRef.current = '';
    setSeed(nextSeed);
    setBoard(Array(9).fill(null));
    setTurn('X');
    setHintCell(null);
    setMissionTarget(null);
    setMissionSolved(false);
    setMissionWrong(false);
    setFreeRound((value) => value + 1);
    onGameEvent?.('tictactoe', 'start', { level: chapterIndex, round: freeRound + 1, seed: nextSeed, difficulty: opponent === 'bot' ? difficulty : 'two-player' });
  };

  const placeMissionMove = (index) => {
    if (missionSolved || board[index]) return;
    if (!isCosmicTacticMove(board, index, chapter.tactic)) {
      setMissionWrong(true);
      setHadMistake(true);
      setFeedback('Try another empty square. Your board stays the same.');
      say(chapter.instruction);
      onGameEvent?.('tictactoe', 'answer_attempt', { level: chapterIndex, round: missionIndex, seed, firstAttempt: false, tactic: chapter.tactic });
      playSfx('oops');
      return;
    }
    const next = applyTicMove(board, index, 'X');
    if (!next) return;
    setBoard(next);
    setMissionTarget(index);
    setMissionSolved(true);
    setMissionWrong(false);
    setHintCell(null);
    const explanation = chapter.tactic === 'win'
      ? COSMIC_TACTIC_NARRATION[10]
      : chapter.tactic === 'block'
        ? COSMIC_TACTIC_NARRATION[11]
        : COSMIC_TACTIC_NARRATION[12];
    setFeedback(explanation);
    say(explanation);
    const id = `${chapterIndex}:${missionIndex}`;
    if (lastAwardRef.current !== id) {
      lastAwardRef.current = id;
      const awarded = completeCosmicTactic({ playerId, level: chapterIndex, missionId: missionIndex });
      setProgress(getCosmicProgress(playerId));
      onGameEvent?.('tictactoe', 'tactic_completed', { level: chapterIndex, round: missionIndex, seed, tactic: chapter.tactic, firstAttempt: !hadMistake, hints: hintCount });
      if (awarded.newlyCompleted) onCelebrate(`${chapter.title} tactic learned!`, 4, 250, 'tictactoe');
      if (awarded.newlyAwardedBadge) onCelebrate(`${chapter.title} badge earned!`, 4, 250, 'tictactoe');
    }
    const key = `lesson:${chapterIndex}:${missionIndex}:${seed}`;
    if (completedResultRef.current !== key) {
      completedResultRef.current = key;
      onGameEvent?.('tictactoe', 'round_completed', { level: chapterIndex, round: missionIndex, seed, result: 'tactic_solved', tactic: chapter.tactic });
    }
    playSfx('complete');
  };

  const placeFreeMove = (index) => {
    if (terminal || board[index] || botThinking || activity !== 'free' || opponent === 'bot' && turn === 'O') return;
    const next = applyTicMove(board, index, turn);
    if (!next) return;
    setBoard(next);
    setTurn(otherMark(turn));
    setHintCell(null);
    setFeedback(`${MARK[turn].name} placed a mark.`);
    playSfx(turn === 'X' ? 'pop' : 'launch');
  };

  const onCellClick = (index) => {
    if (phase !== 'play') return;
    if (activity === 'mission') placeMissionMove(index);
    else placeFreeMove(index);
  };

  const showHint = () => {
    if (phase !== 'play' || activity !== 'mission' || missionSolved) return;
    if (hintUsed) return;
    setHintUsed(true);
    setMissionWrong(false);
    setHintCount((count) => count + 1);
    setHintCell(missionTarget);
    setFeedback(chapter.tactic === 'win'
      ? 'Look where two Dino marks already share a line.'
      : chapter.tactic === 'block'
        ? 'Follow Rocket’s two marks to the one empty square in their line.'
        : 'Look for a move that leaves two different places to win next.');
    say(chapter.instruction);
    onGameEvent?.('tictactoe', 'hint', { level: chapterIndex, round: missionIndex, seed, hintType: 'lesson', hints: hintCount + 1 });
    playSfx('sparkle');
  };

  const retryMission = () => {
    cancelNarration();
    const scenario = makeTacticScenario({ level: chapterIndex, seed, round: missionIndex });
    setBoard(scenario.board);
    setMissionTarget(scenario.target);
    setHintCell(null);
    setHintUsed(false);
    setMissionSolved(false);
    setMissionWrong(false);
    setHadMistake(true);
    setFeedback(chapter.instruction);
    onGameEvent?.('tictactoe', 'replay', { level: chapterIndex, round: missionIndex, seed, difficulty: ['starter', 'growing', 'challenge'][chapterIndex] });
  };
  const nextMission = () => {
    cancelNarration();
    const updated = getCosmicProgress(playerId);
    setProgress(updated);
    const nextStep = getNextCosmicRunStep(missionRunIds, missionRunStep);
    if (nextStep === null) {
      setPhase('complete');
      setFeedback('The chapter badge is saved. The explanation stays here until you choose what comes next.');
      return;
    }
    const nextMissionIndex = missionRunIds[nextStep];
    const scenario = makeTacticScenario({ level: chapterIndex, seed, round: nextMissionIndex });
    clearTimeout(botTimerRef.current);
    completedResultRef.current = '';
    lastAwardRef.current = '';
    setMissionRunStep(nextStep);
    setMissionIndex(nextMissionIndex);
    setBoard(scenario.board);
    setMissionTarget(scenario.target);
    setTurn('X');
    setHintCell(null);
    setHintUsed(false);
    setHintCount(0);
    setHadMistake(false);
    setMissionSolved(false);
    setMissionWrong(false);
    setFeedback(chapter.instruction);
    onGameEvent?.('tictactoe', 'question', { level: chapterIndex, round: nextMissionIndex, seed, difficulty: ['starter', 'growing', 'challenge'][chapterIndex] });
    say(chapter.instruction);
    playSfx('launch');
  };

  const resetFreeBoard = () => {
    focusNewBoard.current = true;
    beginBoard();
    setFeedback(COSMIC_TACTIC_NARRATION[5]);
  };

  useEffect(() => {
    if (!botThinking) return undefined;
    clearTimeout(botTimerRef.current);
    botTimerRef.current = setTimeout(() => {
      setBoard((current) => {
        const move = chooseCosmicBotMove(current, { seed: (seed + freeRound) >>> 0, difficulty: difficulty === 'scout' ? 'scout' : 'captain' });
        return move === null ? current : applyTicMove(current, move, 'O') || current;
      });
      setTurn('X');
      setFeedback('Your turn. Look for a line or a square to block.');
      playSfx('launch');
    }, 520);
    return () => clearTimeout(botTimerRef.current);
  }, [botThinking, difficulty, freeRound, playSfx, seed]);

  useEffect(() => {
    if (!terminal || activity !== 'free' || phase !== 'play') return;
    const key = board.join('-');
    if (completedResultRef.current === key) return;
    completedResultRef.current = key;
    const outcome = result.draw ? 'draw' : result.winner === 'X' ? 'player_win' : 'opponent_win';
    onGameEvent?.('tictactoe', 'round_completed', { level: chapterIndex, round: freeRound, seed, result: outcome });
    if (result.draw) {
      setScores(recordCosmicFreeResult({ playerId, board, boardId: `${seed}:${freeRound}` }));
      setFeedback(COSMIC_TACTIC_NARRATION[6]);
      say(COSMIC_TACTIC_NARRATION[6]);
      playSfx('chime');
    } else {
      const winner = result.winner;
      setScores(recordCosmicFreeResult({ playerId, board, boardId: `${seed}:${freeRound}` }));
      const explanation = winner === 'X'
        ? COSMIC_TACTIC_NARRATION[8]
        : `${opponentName} made three in a row. Next round, if you see two rockets in a line, put a Dino in the empty square to block them.`;
      setFeedback(explanation);
      say(winner === 'X' ? explanation : COSMIC_TACTIC_NARRATION[1]);
      playSfx(winner === 'X' ? 'complete' : 'oops');
    }
  }, [activity, board, chapterIndex, freeRound, onGameEvent, opponentName, phase, playerId, playSfx, result, seed, say, terminal]);

  const moveFocus = (event, index) => {
    const deltas = { ArrowUp: -3, ArrowDown: 3, ArrowLeft: -1, ArrowRight: 1 };
    if (!Object.hasOwn(deltas, event.key)) return;
    event.preventDefault();
    const delta = deltas[event.key];
    for (let step = 1; step < 3; step += 1) {
      const next = index + delta * step;
      if (next < 0 || next > 8 || (Math.abs(delta) === 1 && Math.floor(next / 3) !== Math.floor(index / 3))) return;
      const cell = cellRefs.current[next];
      if (!cell?.disabled) {
        cell?.focus();
        return;
      }
    }
  };

  const renderBoard = () => {
    const paths = activity === 'mission' && missionSolved ? cosmicTacticPaths(board, missionTarget, chapter.tactic) : result.line.length ? [result.line] : [];
    const blocked = activity === 'mission' && chapter.tactic === 'block';
    const rocketWin = activity === 'free' && result.winner === 'O';
    const pathLabel = blocked ? 'Rocket line blocked by Dino' : paths.length > 1 ? 'Two different winning paths' : rocketWin ? `Winning line of three rockets for ${opponentName}` : 'A line of three Dino marks';
    return <div className="cosmic-board relative mx-auto w-full">
      <div className="grid aspect-square w-full grid-rows-3 gap-2 rounded-3xl border-4 border-cyan-100 bg-slate-900/50 p-3 shadow-xl" role="grid" aria-label="Cosmic three by three board">
        {[0, 3, 6].map(start => <div key={start} role="row" className="grid min-h-0 grid-cols-3 gap-2">{board.slice(start, start + 3).map((mark, offset) => {
          const index = start + offset;
          const winning = paths.some(line => line.includes(index));
          const clue = hintCell === index && !mark;
          const pathIndex = paths.findIndex(line => line.includes(index));
          const pathColour = rocketWin ? 'border-orange-300 bg-orange-300/20' : 'border-lime-300 bg-lime-300/10';
          return <button key={index} type="button" ref={node => { cellRefs.current[index] = node; }} onClick={() => onCellClick(index)} onKeyDown={event => moveFocus(event, index)} disabled={Boolean(mark) || activity === 'free' && (terminal || botThinking || opponent === 'bot' && turn === 'O') || activity === 'mission' && missionSolved} role="gridcell" aria-label={`Row ${Math.floor(index / 3) + 1}, column ${index % 3 + 1}, square ${index + 1}${mark ? `, ${MARK[mark].name}` : ', empty'}${clue ? ', hint' : ''}${pathIndex >= 0 ? ', explained path' : ''}`} className={`relative z-10 grid min-h-0 min-w-0 aspect-square place-items-center rounded-2xl border-2 font-black transition focus-visible:z-20 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-300 ${winning ? pathColour : clue ? 'border-amber-300 bg-amber-300/20' : 'border-white/20 bg-white/10'} disabled:cursor-default`}>
            {mark ? <img src={MARK[mark].src} alt="" aria-hidden="true" className="h-[72%] w-[72%] object-contain drop-shadow-md" /> : clue ? <Lightbulb className="text-amber-200" size={30} /> : ''}
          </button>;
        })}</div>)}
      </div>
      {paths.length > 0 && <svg viewBox="0 0 300 300" role="img" aria-label={pathLabel} className="pointer-events-none absolute inset-3 z-20 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)]">
        {paths.map((line, i) => { const center = cell => ({ x: 50 + cell % 3 * 100, y: 50 + Math.floor(cell / 3) * 100 }); const from = center(line[0]), to = center(line[2]); return <line key={line.join('-')} data-tactic-path x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={rocketWin ? '#fdba74' : i ? '#67e8f9' : '#bef264'} strokeWidth="6" strokeDasharray={blocked ? '9 7' : undefined} opacity=".9" strokeLinecap="round" />; })}
      </svg>}
    </div>;
  };

  const renderMap = () => (
    <main className="mx-auto w-full max-w-4xl space-y-2 p-2 sm:space-y-4 sm:p-6">
      <section className="flex items-center justify-center gap-2 rounded-3xl border-2 border-cyan-200/30 bg-white/10 p-2 text-center sm:block sm:p-5"><img src={MARK.X.src} alt="" className="h-10 w-10 shrink-0 object-contain sm:mx-auto sm:h-24 sm:w-24" /><div><h1 className="text-xl font-black sm:mt-2 sm:text-3xl">Think one move ahead</h1><p className="mt-0.5 text-xs font-semibold text-sky-100 sm:mt-2 sm:text-base">Learn three little tricks, then play a whole game.</p></div></section>
      <button type="button" onClick={() => startMission(progress.unlocked)} className="min-h-12 w-full rounded-2xl bg-lime-300 px-5 text-base font-black text-slate-950 sm:min-h-14 sm:text-lg">{progress.badges.length === 3 ? 'Practise' : 'Start'} {COSMIC_CHAPTERS[progress.unlocked].title} →</button>
      <section className="grid gap-1.5 sm:grid-cols-3 sm:gap-3" aria-label="Tactic chapters">{COSMIC_CHAPTERS.map((item, index) => <button key={item.id} type="button" onClick={() => startMission(index, progress.completedByChapter[index] === 3)} disabled={index > progress.unlocked} aria-label={`${item.title}, ${progress.completedByChapter[index]} of 3 boards complete${index > progress.unlocked ? ', locked' : ''}`} className="flex min-h-12 items-center gap-2 rounded-xl border border-cyan-100/30 bg-white/10 px-3 py-1.5 text-left disabled:opacity-45 sm:min-h-24 sm:items-start sm:gap-0 sm:rounded-2xl sm:border-2 sm:p-4"><span className="shrink-0 text-[10px] font-black uppercase text-cyan-100 sm:text-xs">{index + 1} ·</span><strong className="min-w-0 flex-1 text-sm sm:mt-1 sm:text-lg">{item.title}</strong><span className="shrink-0 text-[10px] font-semibold text-sky-100 sm:mt-2 sm:block sm:text-sm">{progress.completedByChapter[index]}/3</span><span className="sr-only">{index > progress.unlocked ? 'Locked' : progress.completedByChapter[index] === 3 ? 'Badge earned' : 'Ready'} boards solved</span></button>)}</section>
      <section className="rounded-2xl border border-white/20 bg-white/10 p-2 sm:p-3" aria-label="Play a whole game"><h2 className="px-2 pb-2 pt-1 font-black sm:p-3">Play a whole game</h2><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => startFreePlay('bot', difficulty)} className="min-h-12 rounded-xl bg-cyan-200 px-2 font-black text-slate-950 sm:min-h-14"><Bot className="mr-2 inline" size={20} />Play Nova Bot</button><button type="button" onClick={() => startFreePlay('buddy', difficulty)} className="min-h-12 rounded-xl bg-white px-2 font-black text-slate-950 sm:min-h-14"><Users className="mr-2 inline" size={20} />Two players</button></div></section>
    </main>
  );

  const renderMission = () => (
    <main className="cosmic-mission-layout mx-auto w-full">
      <section className={`rounded-3xl border border-cyan-100/25 bg-white/10 text-center ${missionSolved ? 'p-1.5 sm:p-4' : 'p-2 sm:p-4'}`}><p className="text-[10px] font-black uppercase tracking-wide text-cyan-100 sm:text-xs">Lesson {chapterIndex + 1} · Board {missionRunStep + 1} of {missionRunIds.length}</p><h1 className="text-lg font-black sm:mt-1 sm:text-2xl">{chapter.title}</h1><p className="mt-0.5 text-sm font-bold sm:mt-2 sm:text-lg">{missionSolved ? 'Your move worked. Look at the highlighted board.' : chapter.instruction}</p>
        {!missionSolved && <p className="mt-1 flex flex-wrap items-center justify-center gap-1 text-[11px] font-bold text-sky-100 sm:mt-3 sm:gap-2 sm:text-sm"><img src={MARK.X.src} alt="" className="h-5 w-5 object-contain sm:h-8 sm:w-8" />You are Dino<span className="px-1">·</span><img src={MARK.O.src} alt="" className="h-5 w-5 object-contain sm:h-8 sm:w-8" />Stop Rocket</p>}
        {!missionSolved && <div className="mt-2 flex flex-wrap justify-center gap-2"><button type="button" onClick={() => say(chapter.instruction)} className="min-h-12 rounded-xl bg-white/10 px-4 font-black"><Volume2 className="mr-2 inline" size={18} />Hear mission</button><button type="button" onClick={showHint} disabled={hintUsed} className="min-h-12 rounded-xl bg-amber-200 px-4 font-black text-amber-950 disabled:opacity-50"><Lightbulb className="mr-2 inline" size={18} />{hintUsed ? 'Hint used' : 'Show hint'}</button></div>}
      </section>
      {renderBoard()}
      {missionSolved ? <section aria-label="Tactic explained" className="rounded-2xl border-2 border-lime-200 bg-lime-50 p-3 text-center text-slate-950 sm:p-4"><p role="status" className="text-base font-black sm:text-lg">{feedback}</p><p className="mt-1 text-xs font-bold sm:mt-2 sm:text-sm">{chapter.tactic === 'fork' ? 'Follow both coloured paths. Rocket can block only one on its next move.' : chapter.tactic === 'block' ? 'The dashed path shows the line you stopped.' : 'Follow the bright line through all three Dino marks.'}</p><button type="button" onClick={() => say(feedback)} className="mt-2 min-h-12 w-full rounded-xl border-2 border-emerald-700 bg-white px-4 text-sm font-black text-emerald-900 sm:mt-3 sm:text-base"><Volume2 className="mr-2 inline" size={20} />Hear explanation</button><button type="button" onClick={nextMission} className="mt-2 min-h-12 w-full rounded-xl bg-emerald-800 px-5 text-base font-black text-white sm:mt-3 sm:min-h-14 sm:text-lg">{missionRunStep >= missionRunIds.length - 1 ? 'Finish chapter' : 'Next tactic board'} →</button></section> : <p role="status" className={`rounded-2xl p-3 text-center text-sm font-bold sm:p-4 sm:text-base ${missionWrong ? 'border-2 border-amber-300 bg-amber-50 text-amber-950' : 'hidden'}`}>{missionWrong ? feedback : 'Tap an empty square for Dino.'}</p>}
      <details className="rounded-2xl bg-white/5 p-1 sm:p-2"><summary className="min-h-11 cursor-pointer p-2 font-bold text-sky-100 sm:min-h-12 sm:p-3">Lesson options</summary><div className="grid gap-2 sm:grid-cols-2">{!missionSolved && <button type="button" onClick={retryMission} className="min-h-12 rounded-xl bg-white/10 px-4 font-black">Retry this board</button>}<button type="button" onClick={requestLeaveBoard} className="min-h-12 rounded-xl bg-white/10 px-4 font-black">Chapter map</button></div></details>
    </main>
  );

  const renderFreePlay = () => (
    <main className="cosmic-free-layout mx-auto w-full">
      <section className="cosmic-match-status grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2">
        <div>
          <p className="text-xs font-bold text-cyan-100">{opponent === 'bot' ? 'vs Nova Bot' : 'Two players'} · Round {freeRound}</p>
          <h1 className="text-lg font-black" aria-live="polite">{terminal ? result.draw ? 'Cosmic draw' : `${winnerName} wins` : botThinking ? 'Nova Bot is thinking…' : `${MARK[turn].name}’s turn`}</h1>
        </div>
        <button type="button" onClick={resetFreeBoard} className={`flex min-h-12 items-center gap-2 whitespace-nowrap rounded-xl px-3 font-black ${terminal ? 'bg-cyan-200 text-slate-950' : 'bg-white/15'}`}><RotateCcw size={18} />{terminal ? 'Play again' : 'Reset board'}</button>
      </section>
      {renderBoard()}
      <div className="cosmic-match-tools grid content-start gap-2">
        <div className="rounded-2xl border border-cyan-100/20 bg-white/10 p-3">
          <p className="font-bold" aria-live="polite">{feedback}</p>
          <p className="mt-2 text-sm font-semibold text-white/80">Saved totals · Dino {scores.X} · Rocket {scores.O} · draws {scores.draws}</p>
        </div>
        <details className="rounded-2xl bg-white/10 px-3">
          <summary className="min-h-12 cursor-pointer py-3 font-bold">Game options</summary>
          <div className="grid grid-cols-2 gap-2 pb-3">
            <button type="button" onClick={() => startFreePlay('bot', 'scout')} aria-pressed={difficulty === 'scout' && opponent === 'bot'} className="min-h-12 rounded-xl bg-white/15 px-2 font-black">Scout bot</button>
            <button type="button" onClick={() => startFreePlay('bot', 'captain')} aria-pressed={difficulty === 'captain' && opponent === 'bot'} className="min-h-12 rounded-xl bg-white/15 px-2 font-black">Captain bot</button>
            <button type="button" onClick={() => startFreePlay('buddy', difficulty)} aria-pressed={opponent === 'buddy'} className="min-h-12 rounded-xl bg-white/15 px-2 font-black">Two players</button>
            <button type="button" onClick={requestLeaveBoard} className="min-h-12 rounded-xl bg-white/15 px-2 font-black">Back to chapters</button>
          </div>
        </details>
      </div>
    </main>
  );

  const showChapterMap = () => {
    cancelNarration();
    setProgress(getCosmicProgress(playerId));
    setPhase('map');
  };

  const renderComplete = () => (
    <main className="mx-auto grid min-h-[70vh] w-full max-w-3xl content-center justify-items-center gap-5 px-4 py-8 text-center">
      <div className="text-7xl" aria-hidden="true">🏅</div><h1 className="text-4xl font-black">{chapter.title} complete!</h1>
      <p className="max-w-2xl text-lg font-bold text-white/80">You solved three different {chapter.tactic === 'win' ? 'winning-line' : chapter.tactic === 'block' ? 'blocking' : 'fork'} boards. Your chapter badge and next chapter unlock are saved.</p>
      <p className="rounded-full bg-white/10 px-5 py-2 font-black">Saved badges: {progress.badges.length} · next chapter {chapterIndex < 2 ? progress.unlocked >= chapterIndex + 1 ? 'unlocked' : 'locked' : 'last chapter complete'}</p>
      <button type="button" onClick={() => chapterIndex < 2 ? startMission(chapterIndex + 1) : showChapterMap()} className="min-h-14 w-full max-w-xl rounded-xl bg-lime-300 px-5 text-lg font-black text-slate-950">{chapterIndex < 2 ? `Next lesson: ${COSMIC_CHAPTERS[chapterIndex + 1].title}` : 'Choose what to play'} →</button><div className="flex flex-wrap justify-center gap-3"><button type="button" onClick={() => startMission(chapterIndex, true)} className="min-h-12 rounded-xl bg-cyan-200 px-5 font-black text-slate-950"><RotateCcw className="mr-2 inline" size={18} />Replay chapter</button><button type="button" onClick={showChapterMap} className="min-h-12 rounded-xl bg-white/15 px-5 font-black">Choose another chapter</button><button type="button" onClick={onBack} className="min-h-12 rounded-xl bg-white/15 px-5 font-black"><ArrowLeft className="mr-2 inline" size={18} />Back to world</button></div>
    </main>
  );

  return <div data-board-focus={phase === 'play' ? '' : undefined} className="relative flex min-h-[100dvh] flex-col overflow-x-hidden bg-[#07132f] text-white">
    <div className="ttt-starfield pointer-events-none absolute inset-0 opacity-80" />
    <header className={`relative z-10 flex items-center justify-between gap-2 px-3 sm:px-6 ${phase === 'play' ? 'py-1' : 'min-h-[68px] py-3'}`}>
      <button type="button" onClick={phase === 'map' ? onBack : phase === 'play' ? requestLeaveBoard : showChapterMap} aria-label={phase === 'map' ? 'Back to learning world' : phase === 'play' ? 'Leave game board' : 'Back to game map'} className="grid min-h-12 min-w-12 place-items-center rounded-full bg-white/15"><ArrowLeft /></button>
      <div className="text-center">{phase !== 'play' && <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-100">Dino Space Arena</p>}<p className="text-lg font-black sm:text-2xl">Cosmic Tic-Tac-Toe</p></div>
      <SoundToggle soundOn={soundOn} onToggle={onToggleSound} className="!bg-white/15 !text-white" />
    </header>
    <div className="relative z-10 flex flex-1 flex-col">
      {phase === 'map' && renderMap()}
      {phase === 'play' && (activity === 'mission' ? renderMission() : renderFreePlay())}
      {phase === 'complete' && renderComplete()}
      {confirmLeaveBoard && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4"><section role="alertdialog" aria-modal="true" aria-labelledby="leave-cosmic-title" aria-describedby="leave-cosmic-copy" className="w-full max-w-md rounded-3xl border-2 border-cyan-100 bg-slate-900 p-6 text-center text-white shadow-2xl"><h2 id="leave-cosmic-title" className="text-2xl font-black">Leave this board?</h2><p id="leave-cosmic-copy" className="mt-3 font-semibold text-white/80">Keep playing retains this board. Leaving creates no new board result or badge.</p><div className="mt-5 flex flex-wrap justify-center gap-3"><button type="button" onClick={keepPlaying} className="min-h-12 rounded-xl bg-cyan-200 px-5 font-black text-slate-950">Keep playing</button><button type="button" onClick={leaveBoard} className="min-h-12 rounded-xl bg-white/15 px-5 font-black">Leave board</button></div></section></div>}
    </div>
  </div>;
};

export default TicTacToe;
