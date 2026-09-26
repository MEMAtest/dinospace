import { useCallback, useEffect, useRef, useState } from 'react';
import { Home, Play, RotateCcw, SkipForward } from 'lucide-react';
import { STICKERS } from '../../data/index.js';
import { sessionStars, sessionTarget } from '../../data/gameSessions.js';
import { RewardSticker } from './StickerArt.jsx';

const RoundButton = ({ onClick, label, tone, size = 'h-24 w-24', children }) => (
  <div className="flex flex-col items-center gap-1">
    <button type="button" onClick={onClick} aria-label={label} className={`grid ${size} place-items-center rounded-full border-4 border-white/80 text-white shadow-[0_6px_0_rgba(15,23,42,.2)] transition active:translate-y-1 active:shadow-none ${tone}`}>
      {children}
    </button>
    <span className="text-sm font-black text-slate-700">{label}</span>
  </div>
);

const SessionSlot = ({ render, ...props }) => render(props);

// Wraps an older game in a short session: start card → the game with a
// progress bar → results screen with Again / Next game / Home. The game is
// untouched apart from its events being counted on the way through.
const GameSession = ({
  game, rule, little, playerName, points = 0, onGameEvent, onCelebrate, onBack, onNextGame, onPhaseChange, playSfx, children,
}) => {
  const target = sessionTarget(rule, little);
  const [phase, setPhase] = useState('start');
  const [run, setRun] = useState(0);
  const [progress, setProgress] = useState({ done: 0, firstTries: 0 });
  const [startPoints, setStartPoints] = useState(points);
  const [stars, setStars] = useState(3);
  const progressRef = useRef({ done: 0, firstTries: 0 });
  const finishTimer = useRef(null);

  useEffect(() => () => clearTimeout(finishTimer.current), []);
  useEffect(() => { onPhaseChange?.(phase); }, [onPhaseChange, phase]);

  const start = () => {
    playSfx?.('launch');
    clearTimeout(finishTimer.current);
    progressRef.current = { done: 0, firstTries: 0 };
    setProgress(progressRef.current);
    setStartPoints(points);
    setRun((value) => value + 1);
    setPhase('play');
  };

  const handleEvent = useCallback((gameId, event, payload) => {
    onGameEvent?.(gameId, event, payload);
    if (event !== rule.event || progressRef.current.done >= target) return;
    const firstTry = !(payload && typeof payload === 'object' && payload.firstAttempt === false);
    const next = { done: progressRef.current.done + 1, firstTries: progressRef.current.firstTries + (firstTry ? 1 : 0) };
    progressRef.current = next;
    setProgress(next);
    if (next.done >= target) {
      // Let the game's own celebration play before the results screen.
      finishTimer.current = setTimeout(() => {
        const earned = sessionStars(next.firstTries, next.done);
        setStars(earned);
        playSfx?.('complete');
        onCelebrate?.('Session complete!', earned * 2, 0, game.id);
        setPhase('done');
      }, rule.event === 'level_completed' ? 2600 : 1500);
    }
  }, [game.id, onCelebrate, onGameEvent, playSfx, rule.event, target]);

  if (phase === 'play') {
    return (
      <>
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[45] h-2 bg-black/10" role="progressbar" aria-label="Session progress" aria-valuemin={0} aria-valuemax={target} aria-valuenow={progress.done}>
          <div className="h-full rounded-r-full bg-gradient-to-r from-amber-300 to-orange-500 transition-all duration-500" style={{ width: `${(progress.done / target) * 100}%` }} />
        </div>
        <SessionSlot render={children} run={run} onGameEvent={handleEvent} />
      </>
    );
  }

  // Show only the newest sticker earned in this session.
  const newStickers = phase === 'done' ? STICKERS.filter((sticker) => sticker.points > startPoints && sticker.points <= points).slice(-1) : [];

  return (
    <div className={`relative flex min-h-[100dvh] w-full flex-col items-center justify-center gap-5 p-4 text-center ${game.color}`}>
      <div className="absolute left-4 top-4">
        <button type="button" onClick={onBack} aria-label="Back to home" className="grid h-14 w-14 place-items-center rounded-full border-4 border-white/80 bg-white text-slate-800 shadow-lg">
          <Home size={28} />
        </button>
      </div>
      <div className="grid w-full max-w-md place-items-center gap-4 rounded-[2.4rem] border-4 border-white/70 bg-white/90 p-6 shadow-2xl">
        {phase === 'start' ? (
          <>
            <div className="grid h-32 place-items-center [&_.kid-pop-icon]:h-32 [&_.kid-pop-icon]:w-40">{game.icon}</div>
            <h1 className="text-3xl font-black text-slate-900">{game.title}</h1>
            {!little && <p className="font-bold text-slate-600">{rule.how}</p>}
            <div className="flex items-center gap-1.5" aria-label={`${target} to finish`}>
              {Array.from({ length: target }, (_, index) => <span key={index} className="h-3 w-3 rounded-full bg-amber-300" />)}
            </div>
            <button type="button" onClick={start} aria-label={`Play ${game.title}`} className="mt-2 grid h-28 w-28 place-items-center rounded-full border-[6px] border-white bg-gradient-to-b from-lime-400 to-green-600 text-white shadow-[0_8px_0_#166534] animate-pulse-soft active:translate-y-2 active:shadow-none">
              <Play size={60} fill="currentColor" className="ml-1.5" />
            </button>
          </>
        ) : (
          <>
            <div className="flex gap-2 text-6xl" aria-label={`${stars} of 3 stars`}>
              {Array.from({ length: 3 }, (_, index) => <span key={index} className={`animate-pop-in ${index < stars ? '' : 'opacity-25 grayscale'}`} style={{ animationDelay: `${index * 200}ms` }} aria-hidden="true">⭐</span>)}
            </div>
            <h1 className="text-3xl font-black text-slate-900">{playerName ? `Well done, ${playerName}!` : 'Well done!'}</h1>
            {!little && rule.event !== 'level_completed' && (
              <p className="text-lg font-bold text-slate-600">{progress.firstTries} of {progress.done} right first time</p>
            )}
            {newStickers.map((sticker) => (
              <div key={sticker.id} className="flex items-center gap-3 rounded-2xl border-4 border-fuchsia-200 bg-fuchsia-50 px-4 py-2 animate-pop-in">
                <RewardSticker rewardId={sticker.id} size={64} />
                <span className="text-lg font-black text-fuchsia-700">New sticker!</span>
              </div>
            ))}
            <div className="mt-2 flex items-end gap-4">
              <RoundButton onClick={start} label="Again" tone="bg-gradient-to-b from-sky-400 to-blue-600"><RotateCcw size={42} strokeWidth={2.8} /></RoundButton>
              {onNextGame && <RoundButton onClick={onNextGame} label="Next game" size="h-28 w-28" tone="bg-gradient-to-b from-lime-400 to-green-600"><SkipForward size={50} strokeWidth={2.8} fill="currentColor" /></RoundButton>}
              <RoundButton onClick={onBack} label="Home" tone="bg-gradient-to-b from-amber-300 to-orange-500"><Home size={42} strokeWidth={2.8} /></RoundButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GameSession;
