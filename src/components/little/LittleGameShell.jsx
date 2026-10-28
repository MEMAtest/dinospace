import { useCallback, useEffect, useRef, useState } from 'react';
import { Home, Play, RotateCcw, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { getPraise } from '../../utils.js';
import { STICKERS } from '../../data/index.js';
import { LITTLE_LEVELS, LITTLE_LEVEL_GOALS, LITTLE_LINES, levelRounds, starsForMistakes } from '../../data/littleGames.js';
import { getLittleLevel, recordLittleResult, startLevelFor } from '../../data/littleProgress.js';
import {
  activePairLevelAfterResult, commitPairLittleResult, getPairLittleStorage, pairRunActionLabel, readPairLittleProgress,
} from '../../data/pairLittleProgress.js';
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

const PairLevelSelector = ({ enabled, level, highestLevel, minimumLevel, onSelect, compact = false }) => {
  if (!enabled) return null;
  return (
    <div role="group" aria-label="Unlocked practice levels" className={`w-full max-w-md rounded-2xl bg-white/80 shadow ${compact ? 'p-2' : 'p-3'}`}>
      <p className={`${compact ? 'mb-1 text-sm' : 'mb-2'} font-black text-slate-800`}>Choose an unlocked level to play or practise</p>
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: highestLevel - minimumLevel + 1 }, (_, offset) => {
          const index = minimumLevel + offset;
          return (
          <button
            key={index}
            type="button"
            aria-label={`Practice level ${index + 1}`}
            aria-pressed={level === index}
            onClick={() => onSelect(index)}
            className={`min-h-12 min-w-14 rounded-xl border-2 px-3 font-black shadow ${level === index ? 'border-indigo-700 bg-indigo-700 text-white' : 'border-indigo-300 bg-white text-indigo-950'}`}
          >
            {index + 1}
          </button>
          );
        })}
      </div>
      {!compact && <p className="mt-2 text-sm font-bold text-slate-700">Available through Level {highestLevel + 1}.</p>}
    </div>
  );
};

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
  registerDirty,
  pairSafeProgress = false,
  compactStart = false,
  compactDone = false,
  manualNext = false,
  manualNextPrompt = 'Great counting! Ready for the next rocket?',
  manualNextReviewLabel = 'Fuel count review',
  finishLine = LITTLE_LINES.finish,
  children,
}) => {
  const levels = LITTLE_LEVELS[gameId];
  const minimumPairLevel = pairSafeProgress ? startLevelFor(bigKid) : 0;
  const [initialPairProgress] = useState(() => (pairSafeProgress
    ? readPairLittleProgress(playerId, gameId, bigKid, getPairLittleStorage())
    : null));
  const [level, setLevel] = useState(() => (pairSafeProgress
    ? initialPairProgress.level
    : getLittleLevel(playerId, gameId, bigKid)));
  const [highestLevel, setHighestLevel] = useState(() => (pairSafeProgress ? initialPairProgress.level : 0));
  const [pairSaveWarning, setPairSaveWarning] = useState(() => (
    pairSafeProgress && !initialPairProgress.ok
      ? 'Saved progress could not be read safely. You can play, but this result will stay unsaved until Retry succeeds.'
      : ''
  ));
  const config = levels[level];
  const rounds = levelRounds(gameId, config);
  const [phase, setPhase] = useState('start');
  const [round, setRound] = useState(0);
  const [playId, setPlayId] = useState(0);
  const [playOrdinal, setPlayOrdinal] = useState(0);
  const [result, setResult] = useState(null);
  const [startPoints, setStartPoints] = useState(points);
  const [finishArt, setFinishArt] = useState(null);
  const [roundComplete, setRoundComplete] = useState(null);
  const [, setPendingResult] = useState(null);
  const advanceTimer = useRef(null);
  const speechTimers = useRef([]);
  const mistakesRef = useRef(0);
  // Rounds may report completion more than once (re-renders, double taps);
  // only the first report for a round counts.
  const completedRoundRef = useRef(-1);
  const pendingResultRef = useRef(null);
  const transactionRef = useRef(null);
  const transactionCounterRef = useRef(0);
  const completedPlaysRef = useRef(initialPairProgress?.gameRecord?.plays || 0);
  const runsSinceSaveRef = useRef(0);
  const rewardedTransactionsRef = useRef(new Set());

  useEffect(() => { onPhaseChange?.(phase === 'save-error' ? 'play' : phase); }, [onPhaseChange, phase]);

  useEffect(() => {
    if (!registerDirty) return undefined;
    registerDirty(() => Boolean(pendingResultRef.current));
    return () => registerDirty(null);
  }, [registerDirty]);

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
    setRoundComplete(null);
    if (pairSafeProgress) {
      setPlayOrdinal(completedPlaysRef.current + runsSinceSaveRef.current);
      runsSinceSaveRef.current += 1;
      transactionCounterRef.current += 1;
      transactionRef.current = globalThis.crypto?.randomUUID?.()
        || `${gameId}-${playerId || 'child'}-${Date.now()}-${transactionCounterRef.current}`;
      rewardedTransactionsRef.current.delete(transactionRef.current);
    }
    setRound(0);
    setPlayId((id) => id + 1);
    setPhase('play');
  };

  const mistake = useCallback(() => { mistakesRef.current += 1; }, []);

  const showSavedResult = useCallback((pending, saved) => {
    if (rewardedTransactionsRef.current.has(pending.transactionId)) return;
    rewardedTransactionsRef.current.add(pending.transactionId);
    pendingResultRef.current = null;
    setPendingResult(null);
    setPairSaveWarning('');
    setResult({ stars: pending.stars, ...saved });
    setHighestLevel(saved.level);
    setLevel(pairSafeProgress ? activePairLevelAfterResult(saved) : saved.level);
    completedPlaysRef.current = saved.plays;
    runsSinceSaveRef.current = 0;
    playSfx?.(saved.levelUp ? 'levelup-big' : 'complete');
    onGameEvent?.(gameId, 'level_completed');
    if (saved.rewardPoints > 0) onCelebrate?.(finishLine, saved.rewardPoints, 0, gameId);
    speak?.(finishLine);
    if (saved.levelUp) speechTimers.current.push(setTimeout(() => speak?.(LITTLE_LINES.levelUp), 2200));
    setPhase('done');
  }, [finishLine, gameId, onCelebrate, onGameEvent, pairSafeProgress, playSfx, setLevel, speak]);

  const commitPendingResult = useCallback((pending) => {
    const saved = commitPairLittleResult({
      playerId,
      gameId,
      bigKid,
      stars: pending.stars,
      expectedLevel: pending.highestLevel,
      playedLevel: pending.playedLevel,
      transactionId: pending.transactionId,
    });
    if (!saved.ok) {
      pendingResultRef.current = pending;
      setPendingResult(pending);
      setPairSaveWarning(saved.reason === 'record-invalid' || saved.reason === 'game-record-invalid' || saved.reason === 'record-unreadable'
        ? 'Saved progress could not be read safely, so it was left untouched. Try again after storage is available.'
        : 'Your result could not be saved yet. It is still here; try saving again.');
      setPhase('save-error');
      return false;
    }
    showSavedResult(pending, saved);
    return true;
  }, [bigKid, gameId, playerId, showSavedResult]);

  const finish = useCallback(() => {
    const stars = starsForMistakes(mistakesRef.current);
    if (pairSafeProgress) {
      const pending = pendingResultRef.current || {
        stars,
        level,
        playedLevel: level,
        highestLevel,
        transactionId: transactionRef.current || `${gameId}-${playerId || 'child'}-${Date.now()}-finish`,
      };
      commitPendingResult(pending);
      return;
    }
    const saved = recordLittleResult(playerId, gameId, bigKid, stars);
    setResult({ stars, ...saved });
    setLevel(saved.level);
    playSfx?.(saved.levelUp ? 'levelup-big' : 'complete');
    onGameEvent?.(gameId, 'level_completed');
    onCelebrate?.(finishLine, stars * 2 + 2, 0, gameId);
    speak?.(finishLine);
    if (saved.levelUp) speechTimers.current.push(setTimeout(() => speak?.(LITTLE_LINES.levelUp), 2200));
    setPhase('done');
  }, [bigKid, commitPendingResult, finishLine, gameId, highestLevel, level, onCelebrate, onGameEvent, pairSafeProgress, playSfx, playerId, speak]);

  const retrySavingResult = () => {
    if (pendingResultRef.current) commitPendingResult(pendingResultRef.current);
  };

  const advanceHeldRound = () => {
    if (!roundComplete) return;
    setRoundComplete(null);
    if (round + 1 >= rounds) {
      finish();
      return;
    }
    if (!pairSafeProgress) onCelebrate?.(null, 1, 0, gameId, { quiet: true });
    completedRoundRef.current = -1;
    setRound((value) => value + 1);
  };

  const complete = useCallback(({ praise = true, delay = 1400, art, review, firstAttempt = true, independent = true, hints = 0 } = {}) => {
    if (completedRoundRef.current === round) return;
    completedRoundRef.current = round;
    if (art) setFinishArt(art);
    playSfx?.('success');
    onGameEvent?.(gameId, 'answer_correct', { correct: true, firstAttempt, independent, hints, skill: gameId, item: `round-${round + 1}`, difficulty: 'starter', masteryEligible: false });
    if (praise) speak?.(getPraise());
    if (manualNext) {
      setRoundComplete({ art: art || null, review: review || null });
      return;
    }
    advanceTimer.current = setTimeout(() => {
      if (round + 1 >= rounds) {
        finish();
      } else {
        if (!pairSafeProgress) onCelebrate?.(null, 1, 0, gameId, { quiet: true });
        setRound((value) => value + 1);
      }
    }, delay);
  }, [finish, gameId, manualNext, onCelebrate, onGameEvent, pairSafeProgress, playSfx, round, rounds, speak]);

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
      data-pair-compact={compactStart || compactDone ? 'true' : undefined}
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
        <main className={`relative z-10 flex flex-1 flex-col items-center ${compactStart ? 'justify-start gap-2 px-4 pb-3 pt-2' : 'justify-center gap-5 px-4 pb-8'} text-center`}>
          {pairSaveWarning && <p role="alert" className="max-w-xl rounded-2xl border-2 border-amber-500 bg-amber-50 px-4 py-3 font-bold text-amber-950">{pairSaveWarning}</p>}
          <div className={`pair-compact-start-hero w-full animate-bounce-slow ${compactStart ? 'relative h-40 max-w-[18rem]' : 'max-w-md'}`}>{startArt}</div>
          <PairLevelSelector enabled={pairSafeProgress} level={level} highestLevel={highestLevel} minimumLevel={minimumPairLevel} onSelect={setLevel} />
          <LevelDots level={level} total={levels.length} />
          <p className="max-w-md rounded-2xl bg-white/90 px-5 py-2 text-lg font-black text-slate-800 shadow-lg">{level < highestLevel ? 'Practice ' : ''}Level {level + 1} of {levels.length}: {LITTLE_LEVEL_GOALS[gameId]?.[level]}{pairSafeProgress && !compactStart ? `. Available through Level ${highestLevel + 1}.` : ''}</p>
          <button
            type="button"
            onClick={start}
            aria-label={`Play ${title}`}
            className="pair-compact-start-play grid h-32 w-32 place-items-center rounded-full border-[6px] border-white bg-gradient-to-b from-lime-400 to-green-600 text-white shadow-[0_10px_0_#166534,0_20px_40px_rgba(22,101,52,.35)] transition hover:scale-105 active:translate-y-2 active:shadow-none sm:h-40 sm:w-40"
          >
            <Play size={72} fill="currentColor" className="ml-2" />
          </button>
          <button type="button" onClick={() => speak?.(intro)} className="rounded-full bg-white/70 px-5 py-2 text-lg font-black text-slate-700 shadow">
            🔊 {title}
          </button>
        </main>
      )}

      {phase === 'play' && (
        <main key={playId} className={playFullBleed && !roundComplete ? 'absolute inset-0 z-10' : 'relative z-10 flex flex-1 flex-col'}>
          {roundComplete && manualNext ? (
            <section aria-label="Round complete" className={`pair-compact-review relative z-30 mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-5 rounded-[2rem] bg-white/95 p-6 text-center shadow-2xl`}>
              {roundComplete.review && <div role="group" aria-label={manualNextReviewLabel} className="w-full">{roundComplete.review}</div>}
              {roundComplete.art && <div className="pair-compact-review-art max-h-64 w-full">{roundComplete.art}</div>}
              <h2 className="text-3xl font-black text-slate-900">{manualNextPrompt}</h2>
              <button type="button" onClick={advanceHeldRound} className="min-h-16 rounded-full border-4 border-white bg-gradient-to-b from-lime-400 to-green-600 px-8 text-xl font-black text-white shadow-[0_6px_0_#166534]">
                {round + 1 < rounds ? 'Next round' : 'Finish game'}
              </button>
            </section>
          ) : (
            <RoundSlot
              render={children}
              round={round}
              rounds={rounds}
              complete={complete}
              mistake={mistake}
              playId={playId}
              playOrdinal={playOrdinal}
              level={level}
              config={config}
              firstRound={round === 0}
            />
          )}
        </main>
      )}

      {phase === 'save-error' && (
        <main className="relative z-40 mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-5 pb-10 text-center">
          <div className="max-h-56 w-full">{finishArt || startArt}</div>
          <h2 className="text-3xl font-black text-white drop-shadow-[0_3px_0_rgba(15,23,42,.35)]">Your result is ready, but it is not saved yet.</h2>
          <p role="alert" className="rounded-2xl border-2 border-amber-500 bg-amber-50 px-4 py-3 font-bold text-amber-950">{pairSaveWarning || 'Your result could not be saved yet. It is still here; try saving again.'}</p>
          <button type="button" onClick={retrySavingResult} className="min-h-16 rounded-full border-4 border-white bg-gradient-to-b from-lime-400 to-green-600 px-8 text-xl font-black text-white shadow-[0_6px_0_#166534]">Retry saving this result</button>
          <button type="button" onClick={onBack} className="min-h-12 rounded-full bg-white/80 px-6 font-black text-slate-900">Go home</button>
        </main>
      )}

      {phase === 'done' && result && (
        <main className={`pair-compact-done relative z-10 flex flex-1 flex-col items-center ${compactDone ? 'justify-start gap-2 px-4 pb-2 pt-1' : 'justify-center gap-4 px-4 pb-10'} text-center`}>
          <div className={`pair-compact-done-stars flex gap-2 ${compactDone ? 'text-5xl' : 'text-6xl sm:text-7xl'}`} aria-label={`${result.stars} of 3 stars`}>
            {Array.from({ length: 3 }, (_, index) => (
              <span key={index} className={`animate-pop-in ${index < result.stars ? '' : 'opacity-25 grayscale'}`} style={{ animationDelay: `${index * 250}ms` }} aria-hidden="true">⭐</span>
            ))}
          </div>
          <div className={`pair-compact-done-art w-full ${compactDone ? 'max-w-[10rem]' : result.levelUp || newStickers.length ? 'max-w-[12rem]' : 'max-w-xs'}`}>{finishArt || startArt}</div>
          <h2 className={`${compactDone ? 'text-3xl' : 'text-4xl sm:text-5xl'} font-black text-white drop-shadow-[0_3px_0_rgba(15,23,42,.35)]`}>
            {playerName ? `Well done, ${playerName}!` : 'Well done!'}
          </h2>
          {pairSafeProgress && Number.isInteger(result.playedLevel) && (
            <p className={`max-w-lg rounded-xl bg-white/85 px-4 ${compactDone ? 'py-1 text-sm' : 'py-2'} font-bold text-slate-800`}>
              Completed Level {result.playedLevel + 1}. Progress saved; Level {result.level + 1} is available.
            </p>
          )}
          {(result.levelUp || newStickers.length > 0) && (
            <div className="flex flex-wrap items-stretch justify-center gap-3">
              {result.levelUp && (
                  <div className={`flex items-center ${compactDone ? 'gap-2 rounded-xl border-2 px-2 py-1' : 'gap-3 rounded-[1.6rem] border-4 px-4 py-3'} border-amber-300 bg-white/90 shadow-xl animate-pop-in`} style={{ animationDelay: '700ms' }}>
                  <div className="text-left">
                    <p className={`${compactDone ? 'text-lg' : 'text-2xl'} font-black text-amber-600`}>Level up!</p>
                    <p className={`max-w-48 ${compactDone ? 'text-xs' : 'text-sm'} font-bold text-slate-700`}>Level {result.level + 1}: {LITTLE_LEVEL_GOALS[gameId]?.[result.level]}</p>
                    <LevelDots level={result.level} total={levels.length} className="mt-1 !px-0 !py-0 !shadow-none" />
                  </div>
                  {renderUnlock && <div className={compactDone ? 'h-12 w-16' : 'h-20 w-24'}>{renderUnlock(levels[result.level], levels[result.previous])}</div>}
                </div>
              )}
              {newStickers.map((sticker) => (
                <div key={sticker.id} className={`flex items-center ${compactDone ? 'gap-2 rounded-xl border-2 px-2 py-1' : 'gap-3 rounded-[1.6rem] border-4 px-4 py-3'} border-fuchsia-300 bg-white/90 shadow-xl animate-pop-in`} style={{ animationDelay: '1100ms' }}>
                  <RewardSticker rewardId={sticker.id} size={compactDone ? 48 : 72} />
                  <p className={`${compactDone ? 'text-sm' : 'text-xl'} font-black text-fuchsia-600`}>New sticker!</p>
                </div>
              ))}
            </div>
          )}
          <PairLevelSelector enabled={pairSafeProgress} level={level} highestLevel={highestLevel} minimumLevel={minimumPairLevel} onSelect={setLevel} compact={compactDone} />
          <div className={`flex items-end ${compactDone ? 'gap-3' : 'mt-2 gap-5'}`}>
            <div className="flex flex-col items-center gap-1">
              <BigRoundButton
                onClick={start}
                label={pairSafeProgress ? pairRunActionLabel(level, result) : result.levelUp ? 'Next level' : 'Try level again'}
                size={compactDone ? 'h-20 w-20' : 'h-28 w-28'}
                tone="bg-gradient-to-b from-lime-400 to-green-600 text-white"
              >
                {result.levelUp && !(pairSafeProgress && level < highestLevel) ? <SkipForward size={50} strokeWidth={2.8} fill="currentColor" /> : <RotateCcw size={46} strokeWidth={2.8} />}
              </BigRoundButton>
              <span className="text-sm font-black text-slate-700">{pairSafeProgress ? pairRunActionLabel(level, result) : result.levelUp ? 'Next level' : 'Try again'}</span>
            </div>
            {onNextGame && (
              <div className="flex flex-col items-center gap-1">
                <BigRoundButton onClick={onNextGame} label="Next game" size={compactDone ? 'h-16 w-16' : 'h-24 w-24'} tone="bg-gradient-to-b from-sky-400 to-blue-600 text-white">
                  <SkipForward size={54} strokeWidth={2.8} fill="currentColor" />
                </BigRoundButton>
                <span className="text-sm font-black text-slate-700">Next game</span>
              </div>
            )}
            <div className="flex flex-col items-center gap-1">
              <BigRoundButton onClick={onBack} label="Go home" size={compactDone ? 'h-16 w-16' : 'h-24 w-24'} tone="bg-gradient-to-b from-amber-300 to-orange-500 text-white">
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
