import DiscoveryHeader from './components/shared/DiscoveryHeader.jsx';
import LetterLaunchBadgeCollection from './components/shared/LetterLaunchBadgeCollection.jsx';
import Batch3BadgeCollections from './components/shared/Batch3BadgeCollections.jsx';
import Batch4BadgeCollections from './components/shared/Batch4BadgeCollections.jsx';
import SafariColourCollections from './components/shared/SafariColourCollections.jsx';
import ReasoningCollections from './components/shared/ReasoningCollections.jsx';
import SpaceStrategyCollections from './components/shared/SpaceStrategyCollections.jsx';
import CreativeProjectCollections from './components/shared/CreativeProjectCollections.jsx';
import MemoryBadgeCollection from './components/shared/MemoryBadgeCollection.jsx';
import { CurriculumBadgeCollection } from './components/shared/CurriculumBadges.jsx';
import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { ACHIEVEMENTS } from './data/index.js';
import { createBursts, createConfetti, getPraise, getTodaysChallenge, loadSaved, saveSafe } from './utils.js';
import { useSfx, useVoice, useInstallPrompt } from './hooks.js';
import { useHashRouter } from './hooks/useHashRouter.js';
import { ForcedDifficultyContext } from './hooks/useGameDifficulty.js';
import {
  CelebrationOverlay, RewardsShelf, BreakReminder, DailyChallengeTracker, InstallAppPrompt, VoiceSettings,
} from './components/shared/index.jsx';
import { LeaveGameDialog, PageHeader, ParentGate } from './components/shared/Navigation.jsx';
import ProgressDashboard from './components/games/ProgressDashboard.jsx';
import IntroScreen from './components/games/IntroScreen.jsx';
import ExplorerHome from './components/home/ExplorerHome.jsx';
import LittleHome from './components/home/LittleHome.jsx';
import WorldPage from './components/home/WorldPage.jsx';
import LittleStickerAlbum from './components/home/LittleStickerAlbum.jsx';
import GameSession from './components/shared/GameSession.jsx';
import LittleDinoDetective from './components/little/games/LittleDinoDetective.jsx';
import { GAME_SESSIONS, ownsGameProgression } from './data/gameSessions.js';
import { recordLegacyGameEvent } from './data/learningProgress.js';
import { recordGameDiagnostic } from './data/gameDiagnostics.js';
import {
  BONUS_GAME_IDS as BONUS_GAME_ID_LIST, LEARNING_WORLDS, LITTLE_EXPLORER_GAME_IDS, PRACTICE_GAME_IDS,
} from './data/learningWorlds.js';
import { ACTIVE_PLAYER_KEY, getPlayer, isLittleExplorer, playerStorageKey } from './data/players.js';
import { commitPlayerReward, mergeRewards, readPlayerRewards, rewardKey } from './data/playerRewards.js';
import { getGame } from './gameCatalog.jsx';

const BONUS_GAME_IDS = new Set(BONUS_GAME_ID_LIST);
const MAX_RECENT_GAMES = 4;
const SOUND_PREFERENCE_KEY = 'amari-sound-on';
// Leaving a game straight after opening it (a mis-tap) needs no confirmation;
// after this long, a "leave the game?" check protects the child's progress.
const CONFIRM_LEAVE_AFTER_MS = 10000;
const NO_CHALLENGE_TRACKER = new Set(['factfinder', 'memory', 'words', 'jet', 'letters', 'math', 'puzzle', 'spot', 'solar', 'storybooks', 'worldmap', 'counting', 'trace', 'tictactoe', 'dino', 'addition', 'subtraction', 'timeteller', 'numberline', 'codecadets', 'writingdesk', 'astronaut', 'chess', 'colormix', 'oddoneout', 'pattern', 'phonics', 'hangman']);
const AmariCountTheStars = lazy(() => import('./components/games/AmariCountTheStars.jsx'));
const AmariLetterTrace = lazy(() => import('./components/games/AmariLetterTrace.jsx'));

const byIds = (ids) => ids.map(getGame).filter(Boolean);

const loadPlayerValue = (playerId, key, fallback) => loadSaved(playerStorageKey(playerId, key), fallback);

const GameLoading = () => (
  <div className="grid min-h-screen place-items-center bg-slate-950 text-white">
    <div className="text-center">
      <div className="text-5xl animate-bounce-slow">🪐</div>
      <p className="mt-3 font-black">Getting ready…</p>
    </div>
  </div>
);

// Everything that belongs to one child: stars, streak, favourites, recent
// games and the daily challenge. It is keyed by player, so switching child
// reloads that child's saved progress.
const PlayerSession = ({
  player, route, navigate, back, setLeaveGuard, soundOn, onToggleSound, playSfx, speak, voice, installPrompt,
  grownUpsUnlocked, onUnlockGrownUps, onSwitchPlayer, onBreakRequested,
}) => {
  const little = isLittleExplorer(player);
  const draftDirtyRef=useRef(null);
  const [pendingPage,setPendingPage]=useState(null);
  const registerDraftDirty=useCallback(fn=>{draftDirtyRef.current=fn;},[]);
  const [favouriteGames, setFavouriteGames] = useState(() => loadPlayerValue(player.id, 'favourite_games', []));
  const [recentGames, setRecentGames] = useState(() => loadPlayerValue(player.id, 'recent_games', []));
  const [rewards, setRewards] = useState(() => readPlayerRewards(player.id));
  const { points, earnedStickerIds, gamesPlayed } = rewards;
  const rewardsRef = useRef(rewards);
  const [rewardSaveFailed, setRewardSaveFailed] = useState(false);
  const [celebration, setCelebration] = useState(null);
  const [streak, setStreak] = useState(() => Math.max(0, loadPlayerValue(player.id, 'streak', 0)));
  const [lastPlayDate, setLastPlayDate] = useState(() => loadPlayerValue(player.id, 'lastplay', ''));
  const [challengeProgress, setChallengeProgress] = useState(() => Math.max(0, loadPlayerValue(player.id, 'challenge_progress', 0)));
  const [challengeCompleted, setChallengeCompleted] = useState(() => loadPlayerValue(player.id, 'challenge_done', false));
  const [leaveDialog, setLeaveDialog] = useState(false);
  const [sessionPhase, setSessionPhase] = useState('play');
  // Games with a start/finish flow report their phase; leaving from the start
  // or finish screen needs no "are you sure?".
  const gamePhaseRef = useRef(null);
  const handlePhaseChange = useCallback((phase) => {
    gamePhaseRef.current = phase;
    setSessionPhase(phase);
  }, []);
  const challengeProgressRef = useRef(challengeProgress);
  const challengeCompletedRef = useRef(challengeCompleted);
  const gameOpenedAtRef = useRef(0);
  const currentGameIdRef = useRef(null);

  const todaysChallenge = useMemo(() => getTodaysChallenge(), []);
  const today = new Date().toISOString().slice(0, 10);
  const currentGame = route.name === 'game' ? getGame(route.id) : null;

  const save = useCallback((key, value) => saveSafe(playerStorageKey(player.id, key), value), [player.id]);
  useEffect(() => {
    const refresh = () => {
      const next = mergeRewards(rewardsRef.current, readPlayerRewards(player.id));
      rewardsRef.current = next;
      setRewards(next);
    };
    const onStorage = (event) => {
      if (event.key === rewardKey(player.id) || ["points", "earned_sticker_ids_v1", "games_played"].some((key) => event.key === playerStorageKey(player.id, key))) refresh();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', refresh);
    return () => { window.removeEventListener('storage', onStorage); window.removeEventListener('focus', refresh); };
  }, [player.id]);
  useEffect(() => { save('streak', streak); }, [save, streak]);
  useEffect(() => { save('lastplay', lastPlayDate); }, [lastPlayDate, save]);
  useEffect(() => { challengeProgressRef.current = challengeProgress; save('challenge_progress', challengeProgress); }, [challengeProgress, save]);
  useEffect(() => { challengeCompletedRef.current = challengeCompleted; save('challenge_done', challengeCompleted); }, [challengeCompleted, save]);
  useEffect(() => { save('favourite_games', favouriteGames); }, [favouriteGames, save]);
  useEffect(() => { save('recent_games', recentGames); }, [recentGames, save]);

  // Daily streak check (once per day per player).
  const hasCheckedTodayRef = useRef(false);
  useEffect(() => {
    if (hasCheckedTodayRef.current || lastPlayDate === today) return undefined;
    hasCheckedTodayRef.current = true;
    const timer = setTimeout(() => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      setStreak((s) => (lastPlayDate === yesterday ? s + 1 : 1));
      setLastPlayDate(today);
      challengeProgressRef.current = 0;
      challengeCompletedRef.current = false;
      setChallengeProgress(0);
      setChallengeCompleted(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [lastPlayDate, today]);

  useEffect(() => {
    currentGameIdRef.current = currentGame?.id || null;
    if (currentGame) gameOpenedAtRef.current = Date.now();
  }, [currentGame]);

  useEffect(() => { window.scrollTo(0, 0); }, [route]);

  // Ask before a back step leaves a game the child has been playing for a while.
  useEffect(() => {
    setLeaveGuard((from) => {
      if (from.name !== 'game') return false;
      if (draftDirtyRef.current?.()) { setLeaveDialog(true);return true; }
      if (gamePhaseRef.current && gamePhaseRef.current !== 'play') return false;
      if (Date.now() - gameOpenedAtRef.current < CONFIRM_LEAVE_AFTER_MS) return false;
      setLeaveDialog(true);
      return true;
    });
    return () => setLeaveGuard(null);
  }, [setLeaveGuard]);

  const openDiscoveryPage=(name)=>{
    if(draftDirtyRef.current?.() || ((!gamePhaseRef.current||gamePhaseRef.current==='play') && Date.now()-gameOpenedAtRef.current>=CONFIRM_LEAVE_AFTER_MS)){setPendingPage(name);setLeaveDialog(true);return;}
    navigate({name});
  };
  const leaveGame = useCallback(() => {
    setLeaveDialog(false);
    if(pendingPage){const name=pendingPage;setPendingPage(null);navigate({name});return;}
    back({ force: true, toParent: !little });
  }, [back, little, navigate, pendingPage]);

  const unlockedAchievements = useMemo(
    () => ACHIEVEMENTS.filter((a) => a.check(gamesPlayed, points, streak)).map((a) => a.id),
    [gamesPlayed, points, streak],
  );

  const recordGameEvent = useCallback((gameId, event, amount = 1) => {
    recordGameDiagnostic(gameId, event, amount);
    // Learning evidence drives Amari's adaptive difficulty; Askia's games all
    // run at the starter level, so his play is not mixed into that record.
    if (!little) recordLegacyGameEvent(gameId, event, amount);
    if (little || challengeCompletedRef.current || gameId !== todaysChallenge.game || event !== todaysChallenge.event) return;
    const challengeAmount = typeof amount === 'number' && Number.isFinite(amount) ? amount : 1;
    const next = Math.min(todaysChallenge.target, challengeProgressRef.current + challengeAmount);
    challengeProgressRef.current = next;
    setChallengeProgress(next);
    if (next >= todaysChallenge.target) {
      challengeCompletedRef.current = true;
      setChallengeCompleted(true);
    }
  }, [little, todaysChallenge]);

  const launchGame = useCallback((gameId, sfx = 'click', { replace = false, module } = {}) => {
    playSfx(sfx);
    // Reset before the next game mounts; games with a start screen report
    // their own phase as they appear.
    gamePhaseRef.current = null;
    if (gameId !== 'factfinder') setRecentGames((current) => [gameId, ...current.filter((id) => id !== gameId)].slice(0, MAX_RECENT_GAMES));
    const curriculumModule = gameId === 'worldmap' && ['continents', 'time-detectives', 'nature-lab'].includes(module) ? module : undefined;
    navigate({ name: 'game', id: gameId, ...(curriculumModule ? { module: curriculumModule } : {}) }, { replace });
  }, [navigate, playSfx]);

  const toggleFavourite = useCallback((gameId) => {
    playSfx('click');
    setFavouriteGames((current) => (current.includes(gameId) ? current.filter((id) => id !== gameId) : [gameId, ...current]));
  }, [playSfx]);

  const celebrate = useCallback((message, pointsEarned = 5, delayMs = 0, gameIdOverride, { quiet = false, rewardToken } = {}) => {
    const finalMessage = message || getPraise();
    const gameIdAtCall = gameIdOverride || currentGameIdRef.current;
    const run = () => {
      const next = commitPlayerReward(player.id, rewardsRef.current, pointsEarned, gameIdAtCall, undefined, { rewardToken });
      rewardsRef.current = next;
      setRewards(next);
      // These lessons hold their own receipt and Retry action beside the result.
      const lessonOwnsRetry = Boolean(rewardToken && ['dino', 'hangman', 'words', 'storybooks', 'chess', 'dinojigsaw', 'german', 'worldmap', 'letters', 'puzzle', 'spot', 'jet', 'math'].includes(gameIdAtCall));
      setRewardSaveFailed(!next.persisted && !lessonOwnsRetry);
      const total = next.points;
      if (quiet || (rewardToken && (!next.persisted || next.awardedPoints === 0))) return next;
      setCelebration({
        id: Date.now(), message: finalMessage, points: pointsEarned, total, bursts: createBursts(), confetti: createConfetti(),
      });
      return next;
    };
    if (delayMs > 0) { setTimeout(run, Math.min(delayMs, 100)); return null; }
    return run();
  }, [player.id]);

  const scaledCelebrate = useCallback(
    (message, pointsEarned = 5, ...rest) => celebrate(message, Math.max(1, Math.round(pointsEarned / 4)), ...rest),
    [celebrate],
  );

  useEffect(() => {
    if (!celebration) return undefined;
    const timer = setTimeout(() => setCelebration(null), celebration.points >= 8 ? 850 : 560);
    return () => clearTimeout(timer);
  }, [celebration]);

  const homeGames = useMemo(() => byIds(LITTLE_EXPLORER_GAME_IDS), []);
  const quickGames = useMemo(
    () => byIds([...favouriteGames, ...recentGames].filter((id, index, all) => all.indexOf(id) === index)).slice(0, 6),
    [favouriteGames, recentGames],
  );
  const practiceGames = useMemo(() => {
    const seed = Math.floor(new Date().setHours(0, 0, 0, 0) / 86400000);
    return byIds(Array.from({ length: 3 }, (_, offset) => PRACTICE_GAME_IDS[(seed + offset * 3) % PRACTICE_GAME_IDS.length]));
  }, []);

  const nextGameAfter = (gameId) => {
    const list = little ? LITTLE_EXPLORER_GAME_IDS : (LEARNING_WORLDS.find((world) => world.gameIds.includes(gameId))?.gameIds || []);
    const index = list.indexOf(gameId);
    return index >= 0 ? list[(index + 1) % list.length] : null;
  };

  const soundProps = { soundOn, onToggleSound };
  let content;

  if (route.name === 'game' && currentGame) {
    const GameComponent = little && currentGame.id === 'dino' ? LittleDinoDetective
      : !little && currentGame.id === 'counting' ? AmariCountTheStars
        : !little && currentGame.id === 'trace' ? AmariLetterTrace
          : currentGame.component;
    const nextId = nextGameAfter(currentGame.id);
    const onNextGame = nextId && nextId !== currentGame.id ? () => launchGame(nextId, 'launch', { replace: true }) : undefined;
    const sessionRule = currentGame.little || ownsGameProgression(currentGame.id, little) ? null : GAME_SESSIONS[currentGame.id];
    const gameProps = {
      registerDirty: registerDraftDirty,
      onBack: () => back({ toParent: !little }),
      onLaunchGame: (gameId, options = {}) => launchGame(gameId, 'click', options),
      initialModule: route.id === 'worldmap' ? route.module : undefined,
      playSfx,
      speak,
      cancelNarration: voice.cancel,
      // The older games award 4–14 stars per answer, which emptied the
      // sticker shelf within days; scale them to match the newer games.
      onCelebrate: currentGame.little || (little && currentGame.id === 'dino') ? celebrate : scaledCelebrate,
      onGameEvent: recordGameEvent,
      playerName: player.name,
      playerId: player.id,
      points,
      bigKid: !little,
      littleMode: little,
      onNextGame,
      onPhaseChange: handlePhaseChange,
      ...soundProps,
    };
    content = (
      <ForcedDifficultyContext.Provider value={little ? 'starter' : null}>
        <Suspense fallback={<GameLoading />}>
          {sessionRule ? (
            <GameSession
              key={currentGame.id}
              game={currentGame}
              rule={sessionRule}
              little={little}
              playerId={player.id}
              playerName={player.name}
              points={points}
              onGameEvent={recordGameEvent}
              onCelebrate={celebrate}
              onBack={() => back({ toParent: !little })}
              onNextGame={onNextGame}
              onPhaseChange={handlePhaseChange}
              playSfx={playSfx}
            >
              {({ run, onGameEvent, onReviewComplete, sessionLevel, sessionTarget, sessionSaveError, sessionSaving }) => <GameComponent key={`${currentGame.id}-${run}`} {...gameProps} sessionLevel={sessionLevel} sessionTarget={sessionTarget} onGameEvent={onGameEvent} onReviewComplete={onReviewComplete} {...(currentGame.id === 'words' ? { sessionSaveError, sessionSaving } : {})} />}
            </GameSession>
          ) : (
            <GameComponent key={currentGame.id} {...gameProps} />
          )}
        </Suspense>
      </ForcedDifficultyContext.Provider>
    );
  } else if (route.name === 'world' && !little && LEARNING_WORLDS.some((world) => world.id === route.id)) {
    const world = LEARNING_WORLDS.find((item) => item.id === route.id);
    content = (
      <WorldPage
        world={world}
        games={byIds(world.gameIds)}
        bonusGameIds={BONUS_GAME_IDS}
        favouriteGames={favouriteGames}
        gamesPlayed={gamesPlayed}
        onLaunch={launchGame}
        onToggleFavourite={toggleFavourite}
        onBack={() => back({ toParent: true })}
        {...soundProps}
      />
    );
  } else if (route.name === 'stickers' && little) {
    content = <LittleStickerAlbum playerId={player.id} points={points} earnedStickerIds={earnedStickerIds} onBack={() => back()} playSfx={playSfx} />;
  } else if (route.name === 'stickers') {
    content = (
      <div className={`flex min-h-[100dvh] w-full flex-col items-center gap-2 bg-gradient-to-b p-3 sm:p-6 ${little ? 'from-amber-200 to-sky-200' : 'from-amber-100 via-white to-sky-100'}`}>
        <PageHeader title={`${player.name}’s stickers`} subtitle={`⭐ ${points} stars`} onBack={() => back()} backLabel="Back to home" {...soundProps} />
        <p className="max-w-2xl rounded-2xl bg-white px-4 py-3 text-center text-sm font-bold text-slate-700">Stars and collected badges are kept in this browser on this device. Finish a chapter to earn its badge. Other browsers and devices have separate collections.</p>
        <LetterLaunchBadgeCollection playerId={player.id} />
        <CurriculumBadgeCollection playerId={player.id} />
        <Batch3BadgeCollections playerId={player.id} />
        <Batch4BadgeCollections playerId={player.id} />
        <SafariColourCollections playerId={player.id} />
        <ReasoningCollections playerId={player.id} />
        <SpaceStrategyCollections playerId={player.id} />
        <CreativeProjectCollections playerId={player.id} />
        <MemoryBadgeCollection playerId={player.id} />
        <RewardsShelf points={points} earnedStickerIds={earnedStickerIds} />
      </div>
    );
  } else if (route.name === 'grownups') {
    content = grownUpsUnlocked ? (
      <ProgressDashboard
        points={points}
        gamesPlayed={gamesPlayed}
        streak={streak}
        achievements={unlockedAchievements}
        playerName={player.name}
        showLearningSettings={!little}
        onBack={() => navigate({ name: 'home' })}
      >
        <VoiceSettings
          voiceMode={voice.voiceMode}
          onVoiceModeChange={voice.setVoiceMode}
          premiumEnabled={voice.premiumEnabled}
          premiumStatus={voice.premiumStatus}
          onPreview={() => speak('Hello explorer! Your next learning adventure is ready.')}
        />
        <InstallAppPrompt {...installPrompt} onInstall={installPrompt.install} />
        <button type="button" onClick={onSwitchPlayer} className="mt-6 rounded-2xl bg-white px-6 py-3 font-black text-indigo-700 shadow-lg">
          Switch player
        </button>
      </ProgressDashboard>
    ) : <ParentGate onUnlock={onUnlockGrownUps} onBack={() => back()} />;
  } else if (little) {
    content = (
      <LittleHome
        player={player}
        points={points}
        games={homeGames}
        onLaunch={launchGame}
        onOpenPage={(name) => navigate({ name })}
        onSwitchPlayer={onSwitchPlayer}
        {...soundProps}
      />
    );
  } else {
    content = (
      <ExplorerHome
        player={player}
        points={points}
        streak={streak}
        challenge={todaysChallenge}
        challengeProgress={challengeProgress}
        challengeCompleted={challengeCompleted}
        practiceGames={practiceGames}
        quickGames={quickGames}
        favouriteGames={favouriteGames}
        onLaunch={launchGame}
        onOpenWorld={(id) => { playSfx('click'); navigate({ name: 'world', id }); }}
        onOpenPage={(name) => { playSfx('click'); navigate({ name }); }}
        onSwitchPlayer={onSwitchPlayer}
        {...soundProps}
      />
    );
  }

  return (
    <>
      {rewardSaveFailed && <aside role="alert" className="relative z-40 border-b-2 border-amber-400 bg-amber-50 p-4 text-center font-bold text-amber-950">Your reward is here, but this browser could not save it. Keep this page open and free some browser storage, then <button type="button" className="min-h-12 rounded-xl border-2 border-amber-700 px-4 underline" onClick={() => { const next = commitPlayerReward(player.id, rewardsRef.current, 0); rewardsRef.current = next; setRewards(next); setRewardSaveFailed(!next.persisted); }}>Try saving again</button></aside>}
      {route.name==='game'&&!little?<div className="discovery-game-surface" data-discovery-game={currentGame?.id}><DiscoveryHeader playerName={player.name} points={points} onHome={()=>openDiscoveryPage('home')} onWorlds={()=>back({toParent:true})} onStickers={()=>openDiscoveryPage('stickers')} onGrownups={()=>openDiscoveryPage('grownups')}/><div className="discovery-game-content">{content}</div></div>:content}
      {currentGame && !little && !currentGame.little && !NO_CHALLENGE_TRACKER.has(currentGame.id) && (!GAME_SESSIONS[currentGame.id] || sessionPhase === 'play') && (
        <DailyChallengeTracker
          challenge={todaysChallenge}
          progress={challengeProgress}
          completed={challengeCompleted}
          active={currentGame.id === todaysChallenge.game}
          onGo={() => launchGame(todaysChallenge.game, 'launch', { replace: true })}
          placement={currentGame.id === 'memory' ? 'inline' : currentGame.id === 'solar' ? 'top-center' : 'bottom-right'}
        />
      )}
      <CelebrationOverlay celebration={celebration} />
      {leaveDialog && <LeaveGameDialog onStay={() => {setPendingPage(null);setLeaveDialog(false);}} onLeave={leaveGame} destination={pendingPage ? ({home:'Home',stickers:'Stickers',grownups:'Grown-ups'}[pendingPage]) : little ? 'Home' : 'World'} />}
      <BreakWatcher onBreak={onBreakRequested} />
    </>
  );
};

// A 30-minute screen-time nudge, shared by both players.
const BreakWatcher = ({ onBreak }) => {
  const [showBreak, setShowBreak] = useState(false);
  const timerRef = useRef(null);
  useEffect(() => {
    timerRef.current = setTimeout(() => setShowBreak(true), 30 * 60 * 1000);
    return () => clearTimeout(timerRef.current);
  }, []);
  if (!showBreak) return null;
  return (
    <BreakReminder
      onDismiss={() => {
        setShowBreak(false);
        timerRef.current = setTimeout(() => setShowBreak(true), 5 * 60 * 1000);
      }}
      onTakeBreak={() => { setShowBreak(false); onBreak(); }}
    />
  );
};

export default function App() {
  const { route, navigate, back, backToStart, setLeaveGuard } = useHashRouter();
  const [soundOn, setSoundOn] = useState(() => loadSaved(SOUND_PREFERENCE_KEY, true) !== false);
  const [playerId, setPlayerId] = useState(() => loadSaved(ACTIVE_PLAYER_KEY, null));
  const [grownUpsUnlocked, setGrownUpsUnlocked] = useState(false);
  const playSfx = useSfx(soundOn);
  const voice = useVoice(soundOn);
  const cancelNarration = voice.cancel;
  // Stop the departing screen's narration before the next screen starts audio.
  // A cancelled leave dialog keeps the route unchanged and keeps its narration.
  useLayoutEffect(() => () => cancelNarration(), [cancelNarration, route.name, route.id, playerId]);
  const installPrompt = useInstallPrompt();
  const player = getPlayer(playerId);
  const toggleSound = useCallback(() => setSoundOn((prev) => !prev), []);
  useEffect(() => { saveSafe(SOUND_PREFERENCE_KEY, soundOn); }, [soundOn]);
  const routeRef = useRef(route);
  useEffect(() => { routeRef.current = route; }, [route]);

  useEffect(() => { document.title = 'Amari Discovery'; }, []);

  // Without a chosen player, every screen falls back to "who is playing?".
  useEffect(() => {
    if (!player && route.name !== 'welcome') navigate({ name: 'welcome' }, { replace: true });
  }, [navigate, player, route.name]);

  // Android hardware back: step back one screen; on the welcome screen, close.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;
    const listener = CapacitorApp.addListener('backButton', () => {
      if (routeRef.current.name === 'welcome') CapacitorApp.exitApp();
      else back();
    });
    return () => { listener.then((handle) => handle.remove()); };
  }, [back]);

  const choosePlayer = useCallback((id) => {
    setPlayerId(id);
    saveSafe(ACTIVE_PLAYER_KEY, id);
    setGrownUpsUnlocked(false);
    const rehearsal = id === 'amari' && new URLSearchParams(window.location.search).get('journey') === 'discovery';
    navigate(rehearsal ? { name: 'game', id: 'solar' } : { name: 'home' });
  }, [navigate]);

  const switchPlayer = useCallback(() => {
    playSfx('click');
    backToStart();
  }, [backToStart, playSfx]);

  if (route.name === 'welcome' || !player) {
    return (
      <IntroScreen
        onChoosePlayer={choosePlayer}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={toggleSound}
        speak={voice.speak}
        premiumStatus={voice.premiumStatus}
        lastPlayerId={playerId}
      />
    );
  }

  return (
    <PlayerSession
      key={player.id}
      player={player}
      route={route}
      navigate={navigate}
      back={back}
      setLeaveGuard={setLeaveGuard}
      soundOn={soundOn}
      onToggleSound={toggleSound}
      playSfx={playSfx}
      speak={voice.speak}
      voice={voice}
      installPrompt={installPrompt}
      grownUpsUnlocked={grownUpsUnlocked}
      onUnlockGrownUps={() => setGrownUpsUnlocked(true)}
      onSwitchPlayer={switchPlayer}
      onBreakRequested={backToStart}
    />
  );
}
