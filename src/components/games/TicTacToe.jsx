import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Bot, Lightbulb, RotateCcw, Sparkles, Users } from 'lucide-react';
import { SoundToggle } from '../shared/index.jsx';
import {
  applyTicMove,
  chooseCosmicBotMove,
  completeCosmicTactic,
  COSMIC_BOARDS_PER_CHAPTER,
  COSMIC_CHAPTERS,
  getBoardResult,
  getCosmicProgress,
  makeTacticScenario,
} from '../../data/cosmicTactics.js';

export const COSMIC_TACTIC_NARRATION = Object.freeze([
  'Two in a row can make a line. Find the empty square that finishes it.',
  'Rocket has two in a row. Put your mark in the last square to block the line.',
  'A fork makes two ways to win on the next turn. Look for a square that starts both paths.',
  'That move shows the tactic. Look at the line or paths you made.',
  'Not that square yet. Look for the glowing lesson clue or reset and try again.',
  'Your turn. Make a line across, down, or diagonally.',
  'The board is full. That is a draw. Try a new board.',
  'A row needs three marks. You can reset and try another plan.',
  'Dino made a line of three!',
  'Rocket made a line of three. Try a new plan.',
  'Three Dino marks now make a line.',
  'Your Dino mark fills the square Rocket needed to complete the line.',
  'That mark opens two different winning squares for your next turn.',
]);

const MARK = Object.freeze({ X: { name: 'Dino', emoji: '🦖', color: 'text-lime-300' }, O: { name: 'Rocket', emoji: '🚀', color: 'text-cyan-300' } });
const PLAYER_MARK = 'X';
const otherMark = (mark) => mark === 'X' ? 'O' : 'X';
const phaseName = (phase) => ({ map: 'intro', play: 'play', complete: 'complete' })[phase] || phase;
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
  onCelebrate = () => {},
  onGameEvent,
  onPhaseChange,
  playerId = 'amari',
  sessionLevel = 0,
}) => {
  const [progress, setProgress] = useState(() => getCosmicProgress(playerId));
  const [chapterIndex, setChapterIndex] = useState(Math.max(0, Math.min(2, sessionLevel)));
  const [phase, setPhase] = useState('map');
  const [activity, setActivity] = useState('mission');
  const [opponent, setOpponent] = useState('bot');
  const [difficulty, setDifficulty] = useState('scout');
  const [seed, setSeed] = useState(getSeed);
  const [missionIndex, setMissionIndex] = useState(0);
  const [board, setBoard] = useState(() => Array(9).fill(null));
  const [turn, setTurn] = useState(PLAYER_MARK);
  const [missionTarget, setMissionTarget] = useState(null);
  const [hintCell, setHintCell] = useState(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [hadMistake, setHadMistake] = useState(false);
  const [missionSolved, setMissionSolved] = useState(false);
  const [missionWrong, setMissionWrong] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [freeRound, setFreeRound] = useState(0);
  const botTimerRef = useRef(null);
  const completedResultRef = useRef('');
  const lastAwardRef = useRef('');
  const cellRefs = useRef([]);

  const chapter = COSMIC_CHAPTERS[chapterIndex];
  const result = useMemo(() => getBoardResult(board), [board]);
  const terminal = Boolean(result.winner || result.draw);
  const botThinking = phase === 'play' && activity === 'free' && opponent === 'bot' && turn === 'O' && !terminal;

  useEffect(() => { onPhaseChange?.(phaseName(phase)); }, [onPhaseChange, phase]);
  useEffect(() => { setProgress(getCosmicProgress(playerId)); }, [playerId]);
  useEffect(() => () => clearTimeout(botTimerRef.current), []);

  const say = useCallback((text) => {
    if (soundOn && text) speak(text, { premium: false });
  }, [soundOn, speak]);

  const startMission = (requestedChapter = chapterIndex, replay = false) => {
    const saved = getCosmicProgress(playerId);
    if (!replay && requestedChapter > saved.unlocked) return;
    const count = saved.completedByChapter[requestedChapter] || 0;
    const nextMissionIndex = replay ? 0 : Math.min(COSMIC_BOARDS_PER_CHAPTER - 1, count);
    const nextSeed = getSeed();
    const scenario = makeTacticScenario({ level: requestedChapter, seed: nextSeed, round: nextMissionIndex });
    clearTimeout(botTimerRef.current);
    completedResultRef.current = '';
    lastAwardRef.current = '';
    setChapterIndex(requestedChapter);
    setActivity('mission');
    setSeed(nextSeed);
    setMissionIndex(nextMissionIndex);
    setBoard(scenario.board);
    setMissionTarget(scenario.target);
    setTurn('X');
    setHintCell(null);
    setHintUsed(false);
    setHadMistake(false);
    setMissionSolved(false);
    setMissionWrong(false);
    setFeedback(chapterIndex === requestedChapter ? COSMIC_CHAPTERS[requestedChapter].instruction : COSMIC_CHAPTERS[requestedChapter].instruction);
    setPhase('play');
    onGameEvent?.('tictactoe', 'start', { level: requestedChapter, round: nextMissionIndex, seed: nextSeed, difficulty: ['starter', 'growing', 'challenge'][requestedChapter] });
    say(COSMIC_CHAPTERS[requestedChapter].instruction);
    playSfx('launch');
  };

  const startFreePlay = (nextOpponent = opponent, nextDifficulty = difficulty) => {
    const nextSeed = getSeed();
    clearTimeout(botTimerRef.current);
    completedResultRef.current = '';
    setActivity('free');
    setOpponent(nextOpponent);
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
    setPhase('play');
    onGameEvent?.('tictactoe', 'start', { level: chapterIndex, round: freeRound + 1, seed: nextSeed, difficulty: nextOpponent === 'bot' ? nextDifficulty : 'two-player' });
    say(COSMIC_TACTIC_NARRATION[5]);
    playSfx('launch');
  };

  const beginBoard = () => {
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
    setScores({ X: 0, O: 0, draws: 0 });
    setFreeRound((value) => value + 1);
    onGameEvent?.('tictactoe', 'start', { level: chapterIndex, round: freeRound + 1, seed: nextSeed, difficulty: opponent === 'bot' ? difficulty : 'two-player' });
  };

  const placeMissionMove = (index) => {
    if (missionSolved || missionWrong || board[index]) return;
    if (index !== missionTarget) {
      setMissionWrong(true);
      setHadMistake(true);
      setFeedback(COSMIC_TACTIC_NARRATION[4]);
      say(COSMIC_TACTIC_NARRATION[4]);
      onGameEvent?.('tictactoe', 'answer_attempt', { level: chapterIndex, round: missionIndex, seed, firstAttempt: false, tactic: chapter.tactic });
      playSfx('oops');
      return;
    }
    const next = applyTicMove(board, index, 'X');
    if (!next) return;
    setBoard(next);
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
      onGameEvent?.('tictactoe', 'tactic_completed', { level: chapterIndex, round: missionIndex, seed, tactic: chapter.tactic, firstAttempt: !hintUsed && !hadMistake });
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
    setHintUsed(true);
    setHadMistake(true);
    setHintCell(missionTarget);
    setFeedback(chapter.tactic === 'win'
      ? 'Look where two Dino marks already share a line.'
      : chapter.tactic === 'block'
        ? 'Follow Rocket’s two marks to the one empty square in their line.'
        : 'Look for a move that leaves two different places to win next.');
    say(chapter.instruction);
    onGameEvent?.('tictactoe', 'hint', { level: chapterIndex, round: missionIndex, seed, hintType: 'lesson' });
    playSfx('sparkle');
  };

  const retryMission = () => {
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
    const updated = getCosmicProgress(playerId);
    setProgress(updated);
    if (updated.completedByChapter[chapterIndex] >= COSMIC_BOARDS_PER_CHAPTER) {
      setPhase('complete');
      setFeedback('The chapter badge is saved. The explanation stays here until you choose what comes next.');
      return;
    }
    startMission(chapterIndex);
  };

  const resetFreeBoard = () => {
    beginBoard();
    setFeedback('New board. Try a different plan.');
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
      setScores((saved) => ({ ...saved, draws: saved.draws + 1 }));
      setFeedback(COSMIC_TACTIC_NARRATION[6]);
      say(COSMIC_TACTIC_NARRATION[6]);
      playSfx('chime');
    } else {
      const winner = result.winner;
      setScores((saved) => ({ ...saved, [winner]: saved[winner] + 1 }));
      setFeedback(winner === 'X' ? COSMIC_TACTIC_NARRATION[8] : `${opponent === 'bot' ? 'Nova Bot' : 'Rocket'} made a line of three. Try a new plan.`);
      say(winner === 'X' ? COSMIC_TACTIC_NARRATION[8] : COSMIC_TACTIC_NARRATION[9]);
      playSfx(winner === 'X' ? 'complete' : 'oops');
    }
  }, [activity, board, chapterIndex, freeRound, onGameEvent, opponent, phase, playSfx, result, seed, say, terminal]);

  const moveFocus = (event, index) => {
    const deltas = { ArrowUp: -3, ArrowDown: 3, ArrowLeft: -1, ArrowRight: 1 };
    if (!Object.hasOwn(deltas, event.key)) return;
    event.preventDefault();
    let next = (index + deltas[event.key] + 9) % 9;
    if (event.key === 'ArrowLeft' && Math.floor(next / 3) !== Math.floor(index / 3)) next = index;
    if (event.key === 'ArrowRight' && Math.floor(next / 3) !== Math.floor(index / 3)) next = index;
    cellRefs.current[next]?.focus();
  };

  const renderBoard = () => (
    <div className="mx-auto grid aspect-square w-full max-w-[min(88vw,28rem)] grid-cols-3 gap-2 rounded-3xl border-4 border-cyan-100 bg-slate-900/50 p-3 shadow-2xl" role="grid" aria-label="Cosmic three by three board">
      {board.map((mark, index) => {
        const winning = result.line.includes(index);
        const clue = hintCell === index && !mark;
        const target = activity === 'mission' && missionTarget === index && !missionSolved && !missionWrong;
        const targetShown = target && hintUsed;
        return <button key={index} type="button" ref={(node) => { cellRefs.current[index] = node; }} onClick={() => onCellClick(index)} onKeyDown={(event) => moveFocus(event, index)} disabled={Boolean(mark) || activity === 'free' && (terminal || botThinking || opponent === 'bot' && turn === 'O') || activity === 'mission' && (missionSolved || missionWrong)} role="gridcell" aria-label={`Row ${Math.floor(index / 3) + 1}, column ${index % 3 + 1}, square ${index + 1}${mark ? `, ${MARK[mark].name}` : ', empty'}${targetShown ? ', lesson target' : ''}${clue ? ', hint' : ''}`} className={`grid min-h-0 min-w-0 aspect-square place-items-center rounded-2xl border-2 text-5xl font-black transition focus-visible:z-10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-300 sm:text-6xl ${winning ? 'border-lime-300 bg-lime-300/20' : clue || targetShown ? 'border-amber-300 bg-amber-300/15' : 'border-white/20 bg-white/10'} ${mark ? MARK[mark].color : 'text-white'} disabled:cursor-default`}>
          {mark ? MARK[mark].emoji : clue ? <Lightbulb className="text-amber-200" size={30} /> : target && hintUsed ? <Sparkles className="text-amber-200" size={27} /> : ''}
        </button>;
      })}
    </div>
  );

  const renderMap = () => (
    <main className="mx-auto grid min-h-[70vh] w-full max-w-4xl content-center gap-5 px-4 py-8 text-center">
      <div className="text-7xl" aria-hidden="true">🌌</div>
      <p className="text-sm font-black uppercase tracking-[.22em] text-cyan-100">Dino Space Arena · age-six strategy</p>
      <h1 className="text-4xl font-black">Cosmic Tic-Tac-Toe</h1>
      <p className="mx-auto max-w-2xl text-lg font-bold text-white/80">Practice a winning line, block a threat, and make a fork. Each lesson board holds its explanation until you move on.</p>
      <section className="grid gap-3 text-left sm:grid-cols-3" aria-label="Tactic chapters">
        {COSMIC_CHAPTERS.map((item, index) => <button key={item.id} type="button" onClick={() => startMission(index)} disabled={index > progress.unlocked} aria-label={`${item.title}, ${progress.completedByChapter[index]} of ${COSMIC_BOARDS_PER_CHAPTER} boards complete${index > progress.unlocked ? ', locked' : ''}`} className={`min-h-28 rounded-2xl border-2 p-4 text-left ${index <= progress.unlocked ? 'border-cyan-100/30 bg-white/10 hover:bg-white/15' : 'border-white/10 bg-white/5 text-white/45'}`}><span className="block text-xl font-black">{item.title}</span><span className="mt-1 block text-sm font-semibold">Rival {item.rival}</span><span className="mt-2 block text-sm font-bold text-cyan-100">{progress.completedByChapter[index]} / 3 boards solved</span></button>)}
      </section>
      <section className="mx-auto grid w-full max-w-lg gap-2 rounded-2xl border border-white/15 bg-white/10 p-4 text-left">
        <p className="font-black">Free play</p>
        <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => startFreePlay('bot', difficulty)} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cyan-200 font-black text-slate-950"><Bot size={18} />Play Nova Bot</button><button type="button" onClick={() => startFreePlay('buddy', difficulty)} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white font-black text-slate-950"><Users size={18} />Two players</button></div>
      </section>
      <button type="button" onClick={onBack} className="mx-auto min-h-12 rounded-xl bg-white/10 px-5 font-black">Back to learning world</button>
    </main>
  );

  const renderMission = () => (
    <main className="mx-auto grid w-full max-w-5xl flex-1 content-start gap-4 px-3 py-4 sm:px-5">
      <section className="grid gap-2 rounded-2xl border border-white/15 bg-white/10 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-widest text-cyan-100">{chapter.title} · board {missionIndex + 1} of 3</p><h1 className="text-2xl font-black">Rival {chapter.rival}</h1></div><button type="button" onClick={showHint} disabled={missionSolved} className="flex min-h-12 items-center gap-2 rounded-xl bg-amber-200 px-4 font-black text-amber-950 disabled:opacity-50"><Lightbulb size={20} />Show hint</button></div>
        <p className="text-lg font-bold" aria-live="polite">{chapter.instruction}</p>
        <p className="text-sm font-semibold text-white/75">{progress.completedByChapter[chapterIndex]} of 3 tactic boards solved · the move stays yours to choose.</p>
      </section>
      {renderBoard()}
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-cyan-100/20 bg-white/10 p-4 text-center">
        <p className="min-h-14 text-lg font-bold" aria-live="polite">{feedback}</p>
        {missionWrong && <button type="button" onClick={retryMission} className="mt-2 min-h-12 rounded-xl bg-white px-5 font-black text-slate-950"><RotateCcw className="mr-2 inline" size={18} />Retry this board</button>}
        {missionSolved && <div className="mt-2 grid gap-3"><p className="font-black text-lime-100">Tactic solved. The explanation is held until you choose to continue.</p><button type="button" onClick={nextMission} className="min-h-12 rounded-xl bg-lime-300 px-5 font-black text-slate-950">{progress.completedByChapter[chapterIndex] >= COSMIC_BOARDS_PER_CHAPTER ? 'Finish chapter' : 'Next tactic board'}</button></div>}
      </div>
      <button type="button" onClick={() => setPhase('map')} className="mx-auto min-h-12 rounded-xl bg-white/10 px-5 font-black">Chapter map</button>
    </main>
  );

  const renderFreePlay = () => (
    <main className="mx-auto grid w-full max-w-5xl flex-1 content-start gap-4 px-3 py-4 sm:px-5">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
        <div><p className="text-xs font-black uppercase tracking-widest text-cyan-100">Free play · round {freeRound}</p><h1 className="text-2xl font-black">{opponent === 'bot' ? 'Play Nova Bot' : 'Two players'}</h1></div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setDifficulty('scout'); startFreePlay('bot', 'scout'); }} aria-pressed={difficulty === 'scout' && opponent === 'bot'} className="min-h-12 rounded-xl bg-white/15 px-3 font-black">Scout bot</button><button type="button" onClick={() => { setDifficulty('captain'); startFreePlay('bot', 'captain'); }} aria-pressed={difficulty === 'captain' && opponent === 'bot'} className="min-h-12 rounded-xl bg-white/15 px-3 font-black">Captain bot</button><button type="button" onClick={() => startFreePlay('buddy', difficulty)} aria-pressed={opponent === 'buddy'} className="min-h-12 rounded-xl bg-white/15 px-3 font-black">Two players</button></div>
      </section>
      <div className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-3"><p className="text-lg font-black" aria-live="polite">{terminal ? result.draw ? 'Cosmic draw' : `${MARK[result.winner].name} wins this board` : botThinking ? 'Nova Bot is thinking…' : `${MARK[turn].name}’s turn`}</p><button type="button" onClick={resetFreeBoard} className="flex min-h-12 items-center gap-2 rounded-xl bg-white/15 px-4 font-black"><RotateCcw size={18} />{terminal ? 'New board' : 'Reset board'}</button></div>
      {renderBoard()}
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-cyan-100/20 bg-white/10 p-4 text-center"><p className="min-h-8 font-bold" aria-live="polite">{feedback}</p><p className="mt-2 text-sm font-semibold text-white/70">Dino {scores.X} · {opponent === 'bot' ? 'Nova' : 'Rocket'} {scores.O} · draws {scores.draws}</p></div>
      <button type="button" onClick={() => setPhase('map')} className="mx-auto min-h-12 rounded-xl bg-white/10 px-5 font-black">Back to chapters</button>
    </main>
  );

  const renderComplete = () => (
    <main className="mx-auto grid min-h-[70vh] w-full max-w-3xl content-center justify-items-center gap-5 px-4 py-8 text-center">
      <div className="text-7xl" aria-hidden="true">🏅</div><h1 className="text-4xl font-black">{chapter.title} complete!</h1>
      <p className="max-w-2xl text-lg font-bold text-white/80">You solved three different {chapter.tactic === 'win' ? 'winning-line' : chapter.tactic === 'block' ? 'blocking' : 'fork'} boards. Your chapter badge and next chapter unlock are saved.</p>
      <p className="rounded-full bg-white/10 px-5 py-2 font-black">Saved badges: {progress.badges.length} · next chapter {chapterIndex < 2 ? progress.unlocked >= chapterIndex + 1 ? 'unlocked' : 'locked' : 'last chapter complete'}</p>
      <div className="flex flex-wrap justify-center gap-3"><button type="button" onClick={() => startMission(chapterIndex, true)} className="min-h-12 rounded-xl bg-cyan-200 px-5 font-black text-slate-950"><RotateCcw className="mr-2 inline" size={18} />Replay chapter</button><button type="button" onClick={() => { setProgress(getCosmicProgress(playerId)); setPhase('map'); }} className="min-h-12 rounded-xl bg-white/15 px-5 font-black">Choose another chapter</button><button type="button" onClick={onBack} className="min-h-12 rounded-xl bg-white/15 px-5 font-black"><ArrowLeft className="mr-2 inline" size={18} />Back to world</button></div>
    </main>
  );

  return <div className="relative flex min-h-[100dvh] flex-col overflow-x-hidden bg-[#07132f] text-white">
    <div className="ttt-starfield pointer-events-none absolute inset-0 opacity-80" />
    <header className="relative z-10 flex min-h-[68px] items-center justify-between gap-2 px-3 py-3 sm:px-6">
      <button type="button" onClick={phase === 'map' ? onBack : () => setPhase('map')} aria-label={phase === 'map' ? 'Back to learning world' : 'Back to game map'} className="grid min-h-12 min-w-12 place-items-center rounded-full bg-white/15"><ArrowLeft /></button>
      <div className="text-center"><p className="text-xs font-black uppercase tracking-[.2em] text-cyan-100">Dino Space Arena</p><p className="text-xl font-black sm:text-2xl">Cosmic Tic-Tac-Toe</p></div>
      <SoundToggle soundOn={soundOn} onToggle={onToggleSound} className="!bg-white/15 !text-white" />
    </header>
    <div className="relative z-10 flex flex-1 flex-col">
      {phase === 'map' && renderMap()}
      {phase === 'play' && (activity === 'mission' ? renderMission() : renderFreePlay())}
      {phase === 'complete' && renderComplete()}
    </div>
  </div>;
};

export default TicTacToe;
