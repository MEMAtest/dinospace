import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Home, Play, RotateCcw, SkipForward } from 'lucide-react';
import { STICKERS } from '../../data/index.js';
import { sessionStars, sessionTarget } from '../../data/gameSessions.js';
import { getGameLevel, levelsForSession, saveGameLevel } from '../../data/sessionLevels.js';
import { getLearningProfile } from '../../data/learningProgress.js';
import { ForcedDifficultyContext } from '../../hooks/useGameDifficulty.js';
import { RewardSticker } from './StickerArt.jsx';
import { recordGameDiagnostic } from '../../data/gameDiagnostics.js';
import { awardChapterBadge, getEarnedChapterBadgeIds } from '../../data/chapterBadges.js';
import LetterLaunchBadgeCollection from './LetterLaunchBadgeCollection.jsx';

const RoundButton = ({ onClick, label, tone, size = 'h-24 w-24', children }) => (
  <div className="flex flex-col items-center gap-1">
    <button type="button" onClick={onClick} aria-label={label} className={`grid ${size} place-items-center rounded-full border-4 border-white/80 text-white shadow-[0_6px_0_rgba(15,23,42,.2)] transition active:translate-y-1 active:shadow-none ${tone}`}>
      {children}
    </button>
    <span className="text-sm font-black text-slate-700">{label}</span>
  </div>
);

const SessionSlot = ({ render, ...props }) => render(props);

// Each older game plays one named level at a time. Its saved level changes the
// actual question pool or play mechanic through the difficulty context.
const GameSession = ({
  game, rule, little, playerId, playerName, points = 0, onGameEvent, onCelebrate, onBack, onNextGame, onPhaseChange, playSfx, children,
}) => {
  const levels = levelsForSession(game.id, little);
  const [levelState, setLevelState] = useState(() => getGameLevel(playerId, game.id, levels.length));
  const [levelIndex, setLevelIndex] = useState(levelState.current);
  const level = levels[levelIndex];
  const target = level?.target || sessionTarget(rule, little);
  const manualBand = !little && getLearningProfile().difficultyOverrides[game.id];
  const levelBand = little ? 'starter' : manualBand || level?.band || null;
  const [phase, setPhase] = useState('start');
  const [run, setRun] = useState(0);
  const [progress, setProgress] = useState({ done: 0, firstTries: 0 });
  const [startPoints, setStartPoints] = useState(points);
  const [stars, setStars] = useState(3);
  const [earnedChapterBadgeIds, setEarnedChapterBadgeIds] = useState(() => getEarnedChapterBadgeIds(playerId, game.id));
  const [completionChapterBadgeId, setCompletionChapterBadgeId] = useState(null);
  const [completionBadgeIsNew, setCompletionBadgeIsNew] = useState(false);
  const progressRef = useRef({ done: 0, firstTries: 0 });
  const finishTimer = useRef(null);
  const pendingFinishRef = useRef(null);

  useEffect(() => () => clearTimeout(finishTimer.current), []);
  useEffect(() => { onPhaseChange?.(phase); }, [onPhaseChange, phase]);

  const start = (nextLevel = levelIndex) => {
    recordGameDiagnostic(game.id, run ? 'replay' : 'level_start', { level: nextLevel, difficulty: levels[nextLevel]?.band });
    playSfx?.('launch');
    clearTimeout(finishTimer.current);
    pendingFinishRef.current = null;
    progressRef.current = { done: 0, firstTries: 0 };
    setProgress(progressRef.current);
    setStartPoints(points);
    setLevelIndex(nextLevel);
    setCompletionChapterBadgeId(null);
    setCompletionBadgeIsNew(false);
    saveGameLevel(playerId, game.id, nextLevel, levelState.unlocked);
    setRun((value) => value + 1);
    setPhase('play');
  };

  const finishLevel = useCallback(({ next, completedLevel, unlockedBefore }) => {
    recordGameDiagnostic(game.id, 'level_complete', { level: completedLevel });
    if (game.id === 'letters') {
      const reward = awardChapterBadge(playerId, game.id, completedLevel);
      if (reward) {
        setEarnedChapterBadgeIds(reward.earnedChapterIds);
        setCompletionChapterBadgeId(reward.badge.id);
        setCompletionBadgeIsNew(reward.newlyEarned);
      }
    }
    const earned = sessionStars(next.firstTries, next.done);
    setStars(earned);
    const unlocked = Math.max(unlockedBefore, Math.min(levels.length - 1, completedLevel + 1));
    const saved = { current: Math.min(completedLevel + 1, levels.length - 1), unlocked };
    saveGameLevel(playerId, game.id, saved.current, saved.unlocked);
    setLevelState(saved);
    playSfx?.('complete');
    onCelebrate?.('Level complete!', earned * 2, 0, game.id);
    setPhase('done');
  }, [game.id, levels.length, onCelebrate, playSfx, playerId]);

  const acknowledgeFinalAnswer = useCallback(() => {
    const pending = pendingFinishRef.current;
    if (!pending) return;
    pendingFinishRef.current = null;
    finishTimer.current = setTimeout(() => finishLevel(pending), 300);
  }, [finishLevel]);

  const handleEvent = useCallback((gameId, event, payload) => {
    onGameEvent?.(gameId, event, payload);
    if (event !== rule.event || progressRef.current.done >= target) return;
    const firstTry = !(payload && typeof payload === 'object' && payload.firstAttempt === false);
    const next = { done: progressRef.current.done + 1, firstTries: progressRef.current.firstTries + (firstTry ? 1 : 0) };
    progressRef.current = next;
    setProgress(next);
    if (next.done >= target) {
      const completion = { next, completedLevel: levelIndex, unlockedBefore: levelState.unlocked };
      if (payload?.deferFinish === true) {
        // Some games show an explanation after the last answer. Keep that
        // explanation available until the child confirms they are ready.
        pendingFinishRef.current = completion;
        return;
      }
      // Let the game's own celebration play before the results screen.
      finishTimer.current = setTimeout(() => finishLevel(completion), rule.event === 'level_completed' ? 2600 : 1500);
    }
  }, [finishLevel, levelIndex, levelState.unlocked, onGameEvent, rule.event, target]);

  if (phase === 'play') {
    return (
      <>
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[45] h-2 bg-black/10" role="progressbar" aria-label="Session progress" aria-valuemin={0} aria-valuemax={target} aria-valuenow={progress.done}>
          <div className="h-full rounded-r-full bg-gradient-to-r from-amber-300 to-orange-500 transition-all duration-500" style={{ width: `${(progress.done / target) * 100}%` }} />
        </div>
        <ForcedDifficultyContext.Provider value={levelBand}>
          <SessionSlot render={children} run={run} onGameEvent={handleEvent} onReviewComplete={acknowledgeFinalAnswer} sessionLevel={levelIndex} />
        </ForcedDifficultyContext.Provider>
      </>
    );
  }

  // Show only the newest sticker earned in this session.
  const newStickers = phase === 'done' ? STICKERS.filter((sticker) => sticker.points > startPoints && sticker.points <= points).slice(-1) : [];

  return (
    <div className={`relative flex min-h-[100dvh] w-full flex-col items-center justify-center gap-5 p-4 text-center ${game.color}`}>
      <div className="absolute left-4 top-4">
        <button type="button" onClick={onBack} aria-label={little ? 'Back to home' : 'Back to learning world'} className="grid h-14 w-14 place-items-center rounded-full border-4 border-white/80 bg-white text-slate-800 shadow-lg">
          {little ? <Home size={28} /> : <ArrowLeft size={28} />}
        </button>
      </div>
      <div className="grid w-full max-w-md place-items-center gap-4 rounded-[2.4rem] border-4 border-white/70 bg-white/90 p-6 shadow-2xl">
        {phase === 'start' ? (
          <>
            <div className="grid h-32 place-items-center [&_.kid-pop-icon]:h-32 [&_.kid-pop-icon]:w-40">{game.icon}</div>
            <h1 className="text-3xl font-black text-slate-900">{game.title}</h1>
            <p className="rounded-full bg-sky-100 px-4 py-1 font-black text-sky-900">Level {levelIndex + 1} of {levels.length}: {level?.name}</p>
            <p className="font-bold text-slate-600">{level?.description || rule.how}</p>
            {game.id === 'letters' && <LetterLaunchBadgeCollection earnedBadgeIds={earnedChapterBadgeIds} />}
            {levelState.unlocked > 0 && (
              <div className="flex flex-wrap justify-center gap-2" aria-label="Unlocked levels">
                {levels.map((entry, index) => (
                  <button key={entry.name} type="button" disabled={index > levelState.unlocked} onClick={() => { setLevelIndex(index); saveGameLevel(playerId, game.id, index, levelState.unlocked); }}
                    aria-label={`Level ${index + 1}: ${entry.name}${index > levelState.unlocked ? ', locked' : ''}`}
                    className={`grid h-12 w-12 place-items-center rounded-full border-2 font-black ${index === levelIndex ? 'border-blue-700 bg-blue-500 text-white' : index > levelState.unlocked ? 'border-slate-200 bg-slate-100 text-slate-400' : 'border-amber-300 bg-amber-100 text-amber-900'}`}>{index + 1}</button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-1.5" aria-label={`${target} to finish`}>
              {Array.from({ length: target }, (_, index) => <span key={index} className="h-3 w-3 rounded-full bg-amber-300" />)}
            </div>
            <button type="button" onClick={() => start()} aria-label={`Play ${game.title} level ${levelIndex + 1}`} className="mt-2 grid h-28 w-28 place-items-center rounded-full border-[6px] border-white bg-gradient-to-b from-lime-400 to-green-600 text-white shadow-[0_8px_0_#166534] transition-transform hover:scale-105 active:translate-y-2 active:shadow-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-indigo-700">
              <Play size={60} fill="currentColor" className="ml-1.5" />
            </button>
          </>
        ) : (
          <>
            <div className="flex gap-2 text-6xl" aria-label={`${stars} of 3 stars`}>
              {Array.from({ length: 3 }, (_, index) => <span key={index} className={`animate-pop-in ${index < stars ? '' : 'opacity-25 grayscale'}`} style={{ animationDelay: `${index * 200}ms` }} aria-hidden="true">⭐</span>)}
            </div>
            <h1 className="text-3xl font-black text-slate-900">{playerName ? `Well done, ${playerName}!` : 'Well done!'}</h1>
            <p className="text-lg font-black text-sky-800">Level {levelIndex + 1} complete: {level?.name}</p>
            {!little && rule.event !== 'level_completed' && (
              <p className="text-lg font-bold text-slate-600">{progress.firstTries} of {progress.done} right first time</p>
            )}
            {newStickers.map((sticker) => (
              <div key={sticker.id} className="flex items-center gap-3 rounded-2xl border-4 border-fuchsia-200 bg-fuchsia-50 px-4 py-2 animate-pop-in">
                <RewardSticker rewardId={sticker.id} size={64} />
                <span className="text-lg font-black text-fuchsia-700">New sticker!</span>
              </div>
            ))}
            {game.id === 'letters' && (
              <LetterLaunchBadgeCollection
                earnedBadgeIds={earnedChapterBadgeIds}
                rewardBadgeId={completionChapterBadgeId}
                rewardIsNew={completionBadgeIsNew}
              />
            )}
            <div className="mt-2 flex items-end gap-4">
              <RoundButton onClick={() => start(levelIndex)} label="Replay level" tone="bg-gradient-to-b from-sky-400 to-blue-600"><RotateCcw size={42} strokeWidth={2.8} /></RoundButton>
              {levelIndex < levels.length - 1
                ? <RoundButton onClick={() => start(levelIndex + 1)} label="Next level" size="h-28 w-28" tone="bg-gradient-to-b from-lime-400 to-green-600"><SkipForward size={50} strokeWidth={2.8} fill="currentColor" /></RoundButton>
                : onNextGame && <RoundButton onClick={onNextGame} label="Next game" size="h-28 w-28" tone="bg-gradient-to-b from-lime-400 to-green-600"><SkipForward size={50} strokeWidth={2.8} fill="currentColor" /></RoundButton>}
              <RoundButton onClick={onBack} label={little ? 'Home' : 'World'} tone="bg-gradient-to-b from-amber-300 to-orange-500">{little ? <Home size={42} strokeWidth={2.8} /> : <ArrowLeft size={42} strokeWidth={2.8} />}</RoundButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GameSession;
