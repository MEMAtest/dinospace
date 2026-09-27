import { useCallback, useEffect, useRef, useState } from 'react';
import { Home, Play, RotateCcw, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { getPraise } from '../../utils.js';
import { STICKERS } from '../../data/index.js';
import { LITTLE_LEVELS, LITTLE_LEVEL_GOALS, LITTLE_LINES, levelRounds, starsForMistakes } from '../../data/littleGames.js';
import { getLittleLevel, recordLittleResult } from '../../data/littleProgress.js';
import { RewardSticker } from '../shared/StickerArt.jsx';
import { artUrl } from './littleArt.js';

// One predictable flow for every little-explorer game:
//   start card (big ▶, level dots, instructions spoken)
//   → rounds on a star track (the game reports mistakes; there is no failing)
//   → finish card: 1–3 stars, level up with what it unlocked, any new
//     sticker, then Again / Next game / Home.
// The child's level is saved per game, so the games grow with them.

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

// Level shown as filled dots, so a non-reader can see it grow.
export const LevelDots = ({ level, total, className = '' }) => (
  <div className={`flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-2 shadow ${className}`} aria-label={`Level ${level + 1} of ${total}`}>
    {Array.from({ length: total }, (_, index) => (
      <span key={index} className={`h-4 w-4 rounded-full border-2 border-amber-500 ${index <= level ? 'bg-amber-400' : 'bg-white'}`} />
    ))}
  </div>
);

const RoundSlot = ({ render, ...roundProps }) => render(roundProps);

const LittleGameShell = ({
  gameId,
  title,
  intro,
  startArt,
  renderUnlock,
  backgroundArtName,
  backgroundArtPortrait,
  playFullBleed = false,
  background = 'from-sky-300 via-sky-200 to-emerald-200',
  playerId,
  playerName,
  bigKid,
  points = 0,
  speak,
  playSfx,
  soundOn,
  onToggleSound,
  onBack,
  onCelebrate,
  onGameEvent,
  onNextGame,
  onPhaseChange,
  finishLine = LITTLE_LINES.finish,
  children,
}) => {
  const levels = LITTLE_LEVELS[gameId];
  const [level, setLevel] = useState(() => getLittleLevel(playerId, gameId, bigKid));
  const config = levels[level];
  const rounds = levelRounds(gameId, config);
  const [phase, setPhase] = useState('start');
  const [round, setRound] = useState(0);
  const [playId, setPlayId] = useState(0);
  const [result, setResult] = useState(null);
  const [startPoints, setStartPoints] = useState(points);
  const [finishArt, setFinishArt] = useState(null);
  const advanceTimer = useRef(null);
  const speechTimers = useRef([]);
  const mistakesRef = useRef(0);
  // Rounds may report completion more than once (re-renders, double taps);
  // only the first report for a round counts.
  const completedRoundRef = useRef(-1);

  useEffect(() => { onPhaseChange?.(phase); }, [onPhaseChange, phase]);

  useEffect(() => () => {
    clearTimeout(advanceTimer.current);
    speechTimers.current.forEach(clearTimeout);
  }, []);

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
    speechTimers.current.forEach(clearTimeout);
    completedRoundRef.current = -1;
    mistakesRef.current = 0;
    setStartPoints(points);
    setResult(null);
    setFinishArt(null);
    setRound(0);
    setPlayId((id) => id + 1);
    setPhase('play');
  };

  const mistake = useCallback(() => { mistakesRef.current += 1; }, []);

  const finish = useCallback(() => {
    const stars = starsForMistakes(mistakesRef.current);
    const saved = recordLittleResult(playerId, gameId, bigKid, stars);
    setResult({ stars, ...saved });
    setLevel(saved.level);
    playSfx?.(saved.levelUp ? 'levelup-big' : 'complete');
    onGameEvent?.(gameId, 'level_completed');
    onCelebrate?.(finishLine, stars * 2 + 2, 0, gameId);
    speak?.(finishLine);
    if (saved.levelUp) speechTimers.current.push(setTimeout(() => speak?.(LITTLE_LINES.levelUp), 2200));
    setPhase('done');
  }, [bigKid, finishLine, gameId, onCelebrate, onGameEvent, playSfx, playerId, speak]);

  const complete = useCallback(({ praise = true, delay = 1400, art, firstAttempt = true, independent = true, hints = 0 } = {}) => {
    if (completedRoundRef.current === round) return;
    completedRoundRef.current = round;
    if (art) setFinishArt(art);
    playSfx?.('success');
    onGameEvent?.(gameId, 'answer_correct', { correct: true, firstAttempt, independent, hints, skill: gameId, item: `round-${round + 1}`, difficulty: 'starter', masteryEligible: false });
    if (praise) speak?.(getPraise());
    advanceTimer.current = setTimeout(() => {
      if (round + 1 >= rounds) {
        finish();
      } else {
        onCelebrate?.(null, 1, 0, gameId, { quiet: true });
        setRound((value) => value + 1);
      }
    }, delay);
  }, [finish, gameId, onCelebrate, onGameEvent, playSfx, round, rounds, speak]);

  const newStickers = phase === 'done'
    ? STICKERS.filter((sticker) => sticker.points > startPoints && sticker.points <= points).slice(-1)
    : [];

  useEffect(() => {
    if (!newStickers.length) return undefined;
    const timer = setTimeout(() => speak?.(LITTLE_LINES.newSticker), result?.levelUp ? 4600 : 2200);
    return () => clearTimeout(timer);
  }, [newStickers.length, result?.levelUp, speak]);

  const backgroundArt = artUrl(backgroundArtName || `bg-${gameId}`);

  return (
    <div
      className={`relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-gradient-to-b ${background} bg-cover bg-center font-sans text-slate-800 select-none`}
      style={backgroundArt && !backgroundArtPortrait ? { backgroundImage: `url(${backgroundArt})` } : undefined}
    >
      {backgroundArt && backgroundArtPortrait && (
        <picture className="pointer-events-none absolute inset-0">
          <source media="(max-aspect-ratio: 3/4)" srcSet={backgroundArtPortrait} />
          <img src={backgroundArt} alt="" className="h-full w-full object-cover" />
        </picture>
      )}
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
          <LevelDots level={level} total={levels.length} />
          <p className="max-w-md rounded-2xl bg-white/90 px-5 py-2 text-lg font-black text-slate-800 shadow-lg">Level {level + 1} of {levels.length}: {LITTLE_LEVEL_GOALS[gameId]?.[level]}</p>
          <button
            type="button"
            onClick={start}
            aria-label={`Play ${title}`}
            className="grid h-32 w-32 place-items-center rounded-full border-[6px] border-white bg-gradient-to-b from-lime-400 to-green-600 text-white shadow-[0_10px_0_#166534,0_20px_40px_rgba(22,101,52,.35)] transition hover:scale-105 active:translate-y-2 active:shadow-none sm:h-40 sm:w-40"
          >
            <Play size={72} fill="currentColor" className="ml-2" />
          </button>
          <button type="button" onClick={() => speak?.(intro)} className="rounded-full bg-white/70 px-5 py-2 text-lg font-black text-slate-700 shadow">
            🔊 {title}
          </button>
        </main>
      )}

      {phase === 'play' && (
        <main key={playId} className={playFullBleed ? 'absolute inset-0 z-10' : 'relative z-10 flex flex-1 flex-col'}>
          <RoundSlot
            render={children}
            round={round}
            rounds={rounds}
            complete={complete}
            mistake={mistake}
            playId={playId}
            level={level}
            config={config}
            firstRound={round === 0}
          />
        </main>
      )}

      {phase === 'done' && result && (
        <main className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4 px-4 pb-10 text-center">
          <div className="flex gap-2 text-6xl sm:text-7xl" aria-label={`${result.stars} of 3 stars`}>
            {Array.from({ length: 3 }, (_, index) => (
              <span key={index} className={`animate-pop-in ${index < result.stars ? '' : 'opacity-25 grayscale'}`} style={{ animationDelay: `${index * 250}ms` }} aria-hidden="true">⭐</span>
            ))}
          </div>
          <div className={`w-full ${result.levelUp || newStickers.length ? 'max-w-[12rem]' : 'max-w-xs'}`}>{finishArt || startArt}</div>
          <h2 className="text-4xl font-black text-white drop-shadow-[0_3px_0_rgba(15,23,42,.35)] sm:text-5xl">
            {playerName ? `Well done, ${playerName}!` : 'Well done!'}
          </h2>
          {(result.levelUp || newStickers.length > 0) && (
            <div className="flex flex-wrap items-stretch justify-center gap-3">
              {result.levelUp && (
                <div className="flex items-center gap-3 rounded-[1.6rem] border-4 border-amber-300 bg-white/90 px-4 py-3 shadow-xl animate-pop-in" style={{ animationDelay: '700ms' }}>
                  <div className="text-left">
                    <p className="text-2xl font-black text-amber-600">Level up!</p>
                    <p className="max-w-48 text-sm font-bold text-slate-700">Level {result.level + 1}: {LITTLE_LEVEL_GOALS[gameId]?.[result.level]}</p>
                    <LevelDots level={result.level} total={levels.length} className="mt-1 !px-0 !py-0 !shadow-none" />
                  </div>
                  {renderUnlock && <div className="h-20 w-24">{renderUnlock(levels[result.level], levels[result.previous])}</div>}
                </div>
              )}
              {newStickers.map((sticker) => (
                <div key={sticker.id} className="flex items-center gap-3 rounded-[1.6rem] border-4 border-fuchsia-300 bg-white/90 px-4 py-3 shadow-xl animate-pop-in" style={{ animationDelay: '1100ms' }}>
                  <RewardSticker rewardId={sticker.id} size={72} />
                  <p className="text-xl font-black text-fuchsia-600">New sticker!</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 flex items-end gap-5">
            <div className="flex flex-col items-center gap-1">
              <BigRoundButton onClick={start} label={result.levelUp ? 'Next level' : 'Try level again'} size="h-28 w-28" tone="bg-gradient-to-b from-lime-400 to-green-600 text-white">
                {result.levelUp ? <SkipForward size={50} strokeWidth={2.8} fill="currentColor" /> : <RotateCcw size={46} strokeWidth={2.8} />}
              </BigRoundButton>
              <span className="text-sm font-black text-slate-700">{result.levelUp ? 'Next level' : 'Try again'}</span>
            </div>
            {onNextGame && (
              <div className="flex flex-col items-center gap-1">
                <BigRoundButton onClick={onNextGame} label="Next game" size="h-24 w-24" tone="bg-gradient-to-b from-sky-400 to-blue-600 text-white">
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
