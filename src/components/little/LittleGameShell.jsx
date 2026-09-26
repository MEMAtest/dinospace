import { useCallback, useEffect, useRef, useState } from 'react';
import { Home, Play, RotateCcw, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { getPraise } from '../../utils.js';

// One predictable flow for every little-explorer game:
//   start card (big ▶, instructions spoken)  →  N rounds with a rocket track
//   →  finish card (stars, then Play again / Next game / Home).
// Games only render a round and call `complete()` when it is solved; there
// is no failing and no timer.

export const BigRoundButton = ({ onClick, label, children, tone = 'bg-white text-slate-800', size = 'h-16 w-16', className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className={`grid ${size} shrink-0 place-items-center rounded-full border-4 border-white/80 shadow-[0_6px_0_rgba(15,23,42,.18)] transition hover:-translate-y-0.5 active:translate-y-1 active:shadow-none ${tone} ${className}`}
  >
    {children}
  </button>
);

const RoundTrack = ({ total, done }) => (
  <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 sm:gap-2.5" role="progressbar" aria-label="Rounds done" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
    {Array.from({ length: total }, (_, index) => (
      <span
        key={index}
        className={`grid h-7 w-7 place-items-center rounded-full border-2 text-sm transition-all duration-300 sm:h-9 sm:w-9 sm:text-lg ${
          index < done
            ? 'scale-100 border-amber-300 bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,.8)]'
            : index === done
              ? 'scale-110 border-white bg-white/90'
              : 'border-white/70 bg-white/25'
        }`}
        aria-hidden="true"
      >
        {index < done ? '⭐' : index === done ? '🚀' : ''}
      </span>
    ))}
  </div>
);

const RoundSlot = ({ render, ...roundProps }) => render(roundProps);

const LittleGameShell = ({
  gameId,
  title,
  intro,
  startArt,
  background = 'from-sky-300 via-sky-200 to-emerald-200',
  rounds = 5,
  playerName,
  speak,
  playSfx,
  soundOn,
  onToggleSound,
  onBack,
  onCelebrate,
  onGameEvent,
  onNextGame,
  finishLine = 'Hooray! You did it!',
  children,
}) => {
  const [phase, setPhase] = useState('start');
  const [round, setRound] = useState(0);
  const [playId, setPlayId] = useState(0);
  const advanceTimer = useRef(null);
  // Rounds may report completion more than once (re-renders, double taps);
  // only the first report for a round counts.
  const completedRoundRef = useRef(-1);

  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  useEffect(() => {
    if (phase === 'start' && intro) {
      const timer = setTimeout(() => speak?.(intro), 350);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [intro, phase, speak]);

  const start = () => {
    playSfx?.('launch');
    clearTimeout(advanceTimer.current);
    completedRoundRef.current = -1;
    setRound(0);
    setPlayId((id) => id + 1);
    setPhase('play');
  };

  const complete = useCallback(({ praise = true, delay = 1400 } = {}) => {
    if (completedRoundRef.current === round) return;
    completedRoundRef.current = round;
    playSfx?.('success');
    onGameEvent?.(gameId, 'answer_correct', { correct: true, firstAttempt: true, independent: true, skill: gameId, item: `round-${round + 1}`, difficulty: 'starter', masteryEligible: false });
    if (praise) speak?.(getPraise());
    advanceTimer.current = setTimeout(() => {
      if (round + 1 >= rounds) {
        playSfx?.('complete');
        onGameEvent?.(gameId, 'level_completed');
        onCelebrate?.(finishLine, 10, 0, gameId);
        speak?.(finishLine);
        setPhase('done');
      } else {
        onCelebrate?.(null, 2, 0, gameId, { quiet: true });
        setRound((value) => value + 1);
      }
    }, delay);
  }, [finishLine, gameId, onCelebrate, onGameEvent, playSfx, round, rounds, speak]);

  return (
    <div className={`relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-gradient-to-b ${background} font-sans text-slate-800 select-none`}>
      <header className="relative z-30 flex items-center gap-2 px-3 pb-2 pt-3 sm:gap-4 sm:px-6 sm:pt-4">
        <BigRoundButton onClick={onBack} label="Go home">
          <Home size={30} strokeWidth={2.6} />
        </BigRoundButton>
        {phase === 'play'
          ? <RoundTrack total={rounds} done={round} />
          : <h1 className="min-w-0 flex-1 truncate text-center text-2xl font-black text-white drop-shadow-[0_3px_0_rgba(15,23,42,.35)] sm:text-4xl">{title}</h1>}
        <BigRoundButton onClick={onToggleSound} label={soundOn ? 'Turn sound off' : 'Turn sound on'}>
          {soundOn ? <Volume2 size={28} strokeWidth={2.6} /> : <VolumeX size={28} strokeWidth={2.6} />}
        </BigRoundButton>
      </header>

      {phase === 'start' && (
        <main className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 px-4 pb-8 text-center">
          <div className="w-full max-w-md animate-bounce-slow">{startArt}</div>
          <button
            type="button"
            onClick={start}
            aria-label={`Play ${title}`}
            className="grid h-32 w-32 place-items-center rounded-full border-[6px] border-white bg-gradient-to-b from-lime-400 to-green-600 text-white shadow-[0_10px_0_#166534,0_20px_40px_rgba(22,101,52,.35)] transition hover:scale-105 active:translate-y-2 active:shadow-none animate-pulse-soft sm:h-40 sm:w-40"
          >
            <Play size={72} fill="currentColor" className="ml-2" />
          </button>
          <button type="button" onClick={() => speak?.(intro)} className="rounded-full bg-white/70 px-5 py-2 text-lg font-black text-slate-700 shadow">
            🔊 {title}
          </button>
        </main>
      )}

      {phase === 'play' && (
        <main key={playId} className="relative z-10 flex flex-1 flex-col">
          <RoundSlot render={children} round={round} rounds={rounds} complete={complete} playId={playId} />
        </main>
      )}

      {phase === 'done' && (
        <main className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-4 pb-10 text-center">
          <div className="flex gap-2 text-6xl sm:text-7xl" aria-hidden="true">
            {Array.from({ length: 3 }, (_, index) => <span key={index} className="animate-pop-in" style={{ animationDelay: `${index * 180}ms` }}>⭐</span>)}
          </div>
          <div className="w-full max-w-xs">{startArt}</div>
          <h2 className="text-4xl font-black text-white drop-shadow-[0_3px_0_rgba(15,23,42,.35)] sm:text-5xl">
            {playerName ? `Well done, ${playerName}!` : 'Well done!'}
          </h2>
          <div className="flex items-end gap-5">
            <div className="flex flex-col items-center gap-1">
              <BigRoundButton onClick={start} label="Play again" size="h-24 w-24" tone="bg-gradient-to-b from-sky-400 to-blue-600 text-white">
                <RotateCcw size={46} strokeWidth={2.8} />
              </BigRoundButton>
              <span className="text-sm font-black text-slate-700">Again</span>
            </div>
            {onNextGame && (
              <div className="flex flex-col items-center gap-1">
                <BigRoundButton onClick={onNextGame} label="Next game" size="h-28 w-28" tone="bg-gradient-to-b from-lime-400 to-green-600 text-white">
                  <SkipForward size={54} strokeWidth={2.8} fill="currentColor" />
                </BigRoundButton>
                <span className="text-sm font-black text-slate-700">Next game</span>
              </div>
            )}
            <div className="flex flex-col items-center gap-1">
              <BigRoundButton onClick={onBack} label="Go home" size="h-24 w-24" tone="bg-gradient-to-b from-amber-300 to-orange-500 text-white">
                <Home size={46} strokeWidth={2.8} />
              </BigRoundButton>
              <span className="text-sm font-black text-slate-700">Home</span>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default LittleGameShell;
