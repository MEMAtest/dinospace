import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import rocketMark from '../../assets/little/fuel-rocket.webp';
import { FocusMenu } from '../shared/FocusMenu.jsx';
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
  const [optionsOpen, setOptionsOpen] = useState(false);
  const headingRef = useRef(null);
  const nextRef = useRef(null);
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
  const botThinking = phase === 'play' && activity === 'free' && opponent === 'bot' && turn === 'O' && !terminal && !confirmLeaveBoard && !optionsOpen;
  const requestLeaveBoard = () => { setOptionsOpen(false); setConfirmLeaveBoard(true); };
  const keepPlaying = () => setConfirmLeaveBoard(false);
  const leaveBoard = () => {
    cancelNarration();
    setConfirmLeaveBoard(false);
    clearTimeout(botTimerRef.current);
    setPhase('map');
  };

  useEffect(() => { onPhaseChange?.(phaseName(phase)); }, [onPhaseChange, phase]);
  useEffect(() => { if (!optionsOpen) headingRef.current?.focus({ preventScroll: true }); }, [phase, optionsOpen, confirmLeaveBoard]);
  useEffect(() => { if (missionSolved || terminal) nextRef.current?.focus({ preventScroll: true }); }, [missionSolved, terminal]);
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
    setOptionsOpen(false);
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
    setOptionsOpen(false);
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
          return <button key={index} type="button" ref={node => { cellRefs.current[index] = node; }} onClick={() => onCellClick(index)} onKeyDown={event => moveFocus(event, index)} disabled={Boolean(mark) || activity === 'free' && (terminal || botThinking || opponent === 'bot' && turn === 'O') || activity === 'mission' && missionSolved} role="gridcell" aria-label={`Row ${Math.floor(index / 3) + 1}, column ${index % 3 + 1}, square ${index + 1}${mark ? `, ${MARK[mark].name}` : ', empty'}${clue ? ', hint' : ''}${pathIndex >= 0 ? ', explained path' : ''}`} className={`relative z-10 grid min-h-0 min-w-0 aspect-square place-items-center rounded-2xl border-2 font-black transition focus-visible:z-20 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-300 ${winning ? pathColour : clue ? 'border-amber-300 bg-amber-300/20' : 'border-white/40 bg-white/15'} disabled:cursor-default`}>
            {mark ? <img src={MARK[mark].src} alt="" aria-hidden="true" className="h-[72%] w-[72%] object-contain drop-shadow-md" /> : clue ? <Lightbulb className="text-amber-200" size={30} /> : ''}
          </button>;
        })}</div>)}
      </div>
      {paths.length > 0 && <svg viewBox="0 0 300 300" role="img" aria-label={pathLabel} className="pointer-events-none absolute inset-3 z-20 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)]">
        {paths.map((line, i) => { const center = cell => ({ x: 50 + cell % 3 * 100, y: 50 + Math.floor(cell / 3) * 100 }); const from = center(line[0]), to = center(line[2]); return <line key={line.join('-')} data-tactic-path x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={rocketWin ? '#fdba74' : i ? '#67e8f9' : '#bef264'} strokeWidth="6" strokeDasharray={blocked ? '9 7' : undefined} opacity=".9" strokeLinecap="round" />; })}
      </svg>}
    </div>;
  };

  const closeOptions = () => setOptionsOpen(false);
  const openOptions = () => setOptionsOpen(true);
  const playing = phase === 'play';
  const free = playing && activity === 'free';
  const finished = phase === 'complete';
  const nextLessonIndex = finished ? Math.min(chapterIndex + 1, progress.unlocked) : progress.unlocked;
  const nextLesson = COSMIC_CHAPTERS[nextLessonIndex];
  const nextLessonComplete = progress.completedByChapter[nextLessonIndex] === COSMIC_BOARDS_PER_CHAPTER;
  const nextLessonLabel = `${nextLessonComplete ? 'Replay' : finished ? 'Next' : 'Start'}: ${nextLesson.title}`;
  const soundChoice = { label: soundOn ? 'Turn sound off' : 'Turn sound on', action: () => { closeOptions(); onToggleSound?.(); } };
  const lessons = COSMIC_CHAPTERS.map((item, index) => {
    const complete = progress.completedByChapter[index] === COSMIC_BOARDS_PER_CHAPTER;
    return {
      label: `${item.title}${index > progress.unlocked ? ' · Locked' : complete ? ' · Complete' : ''}`,
      description: item.instruction,
      button: `${complete ? 'Replay' : 'Start'}: ${item.title}`,
      disabled: index > progress.unlocked,
      action: () => startMission(index, complete),
    };
  });
  const matches = [
    { label: 'Play Scout bot', action: () => startFreePlay('bot', 'scout') },
    { label: 'Play Captain bot', action: () => startFreePlay('bot', 'captain') },
    { label: 'Two players', action: () => startFreePlay('buddy', difficulty) },
  ];
  const playChoices = free ? [
    ...(!terminal ? [{ label: 'Reset board', action: () => { closeOptions(); resetFreeBoard(); } }] : []),
    ...matches,
  ] : [
    ...(!missionSolved ? [
      ...(!hintUsed ? [{ label: 'Show hint', action: () => { closeOptions(); showHint(); } }] : []),
      { label: 'Retry this board', action: () => { closeOptions(); retryMission(); } },
    ] : []),
  ];
  const turnLabel = terminal ? result.draw ? 'Cosmic draw' : `${winnerName} wins`
    : botThinking ? 'Nova Bot is thinking…' : `${MARK[turn].name}’s turn`;
  const tacticTip = chapter.tactic === 'fork' ? 'Rocket can block only one of the highlighted paths.'
    : chapter.tactic === 'block' ? 'The dashed path shows the line you stopped.' : 'Follow the bright line through all three Dino marks.';

  return <div data-board-focus="" className="focus-game" data-cosmic-phase={phase}>
    {confirmLeaveBoard ? <main className="focus-game-body is-menu">
      <header className="focus-game-heading"><h1 ref={headingRef} tabIndex={-1}>Leave this board?</h1></header>
      <p className="focus-game-message">Your saved badges and totals stay available.</p>
      <div className="focus-game-actions">
        <button type="button" className="focus-game-button is-primary" onClick={keepPlaying}>Keep playing</button>
        <button type="button" className="focus-game-button" onClick={leaveBoard}>Leave board</button>
      </div>
    </main> : optionsOpen ? <main className="focus-game-body is-menu">
      <header className="focus-game-heading"><h1>Cosmic Tic-Tac-Toe</h1></header>
      <FocusMenu choices={playing
        ? [...playChoices, soundChoice, { label: 'Back to chapters', action: requestLeaveBoard }]
        : [...lessons, ...matches, soundChoice, { label: 'Back to Thinking & Play', action: onBack }]} onBack={closeOptions} />
    </main> : !playing ? <main className="focus-game-body is-menu">
      <header className="focus-game-heading"><h1 ref={headingRef} tabIndex={-1}>{finished ? 'Lesson saved!' : 'Cosmic Tic-Tac-Toe'}</h1></header>
      <p className="focus-game-message">{finished ? `${chapter.title} badge saved.` : nextLesson.instruction}</p>
      <div className="focus-game-actions">
        <button type="button" className="focus-game-button is-primary" onClick={() => startMission(nextLessonIndex, nextLessonComplete)}>{nextLessonLabel}</button>
        <button type="button" className="focus-game-button" onClick={() => startFreePlay('bot', difficulty)}>Play Nova Bot</button>
        <button type="button" className="focus-game-button" onClick={openOptions}>Options</button>
      </div>
    </main> : <main className="cosmic-focused-play">
      <header className="focus-game-heading">
        <p>Cosmic Tic-Tac-Toe · {free ? `${opponent === 'bot' ? 'vs Nova Bot' : 'Two players'} · Round ${freeRound}` : `Board ${missionRunStep + 1} of ${missionRunIds.length}`}</p>
        <h1 ref={headingRef} tabIndex={-1} aria-live="polite">{free ? turnLabel : chapter.title}</h1>
        {!free && !missionSolved && <p>{chapter.instruction}</p>}
      </header>
      {renderBoard()}
      <section className="cosmic-focused-tools" aria-label={!free && missionSolved ? 'Tactic explained' : 'What to do next'}>
        {(free || missionWrong || missionSolved || hintUsed) && <p className="focus-game-message" role="status">{feedback}</p>}
        {!free && missionSolved && <p className="mb-3">{tacticTip}</p>}
        <div className="focus-game-actions">
          {free && terminal && <button ref={nextRef} type="button" className="focus-game-button is-primary" onClick={resetFreeBoard}>Play again</button>}
          {!free && missionSolved && <button ref={nextRef} type="button" className="focus-game-button is-primary" onClick={nextMission}>{missionRunStep >= missionRunIds.length - 1 ? 'Finish chapter' : 'Next tactic board'}</button>}
          {!free && soundOn && <button type="button" className="focus-game-button" onClick={() => say(missionSolved ? feedback : chapter.instruction)}>{missionSolved ? 'Hear explanation' : 'Hear mission'}</button>}
          <button type="button" className="focus-game-button" onClick={openOptions}>Options</button>
        </div>
        {free && <p className="mt-3 text-sm font-semibold">Saved totals · Dino {scores.X} · Rocket {scores.O} · draws {scores.draws}</p>}
      </section>
    </main>}
  </div>;
};

export default TicTacToe;
