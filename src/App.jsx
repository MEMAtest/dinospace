import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { recordLegacyGameEvent } from './data/learningProgress.js';
import {
  BONUS_GAME_IDS as BONUS_GAME_ID_LIST, LEARNING_WORLDS, LITTLE_EXPLORER_GAME_IDS, PRACTICE_GAME_IDS,
} from './data/learningWorlds.js';
import { ACTIVE_PLAYER_KEY, getPlayer, isLittleExplorer, playerStorageKey } from './data/players.js';
import { getGame } from './gameCatalog.jsx';

const BONUS_GAME_IDS = new Set(BONUS_GAME_ID_LIST);
const MAX_RECENT_GAMES = 4;
// Leaving a game straight after opening it (a mis-tap) needs no confirmation;
// after this long, a "leave the game?" check protects the child's progress.
const CONFIRM_LEAVE_AFTER_MS = 10000;
const NO_CHALLENGE_TRACKER = new Set(['jet', 'spot', 'storybooks', 'worldmap']);

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
  const [favouriteGames, setFavouriteGames] = useState(() => loadPlayerValue(player.id, 'favourite_games', []));
  const [recentGames, setRecentGames] = useState(() => loadPlayerValue(player.id, 'recent_games', []));
  const [points, setPoints] = useState(() => Math.max(0, loadPlayerValue(player.id, 'points', 0)));
  const [celebration, setCelebration] = useState(null);
  const [streak, setStreak] = useState(() => Math.max(0, loadPlayerValue(player.id, 'streak', 0)));
  const [lastPlayDate, setLastPlayDate] = useState(() => loadPlayerValue(player.id, 'lastplay', ''));
  const [challengeProgress, setChallengeProgress] = useState(() => Math.max(0, loadPlayerValue(player.id, 'challenge_progress', 0)));
  const [challengeCompleted, setChallengeCompleted] = useState(() => loadPlayerValue(player.id, 'challenge_done', false));
  const [gamesPlayed, setGamesPlayed] = useState(() => loadPlayerValue(player.id, 'games_played', {}));
  const [leaveDialog, setLeaveDialog] = useState(false);
  const pointsRef = useRef(points);
  const challengeProgressRef = useRef(challengeProgress);
  const challengeCompletedRef = useRef(challengeCompleted);
  const gameOpenedAtRef = useRef(0);
  const currentGameIdRef = useRef(null);

  const todaysChallenge = useMemo(() => getTodaysChallenge(), []);
  const today = new Date().toISOString().slice(0, 10);
  const currentGame = route.name === 'game' ? getGame(route.id) : null;

  const save = useCallback((key, value) => saveSafe(playerStorageKey(player.id, key), value), [player.id]);
  useEffect(() => { pointsRef.current = points; save('points', points); }, [points, save]);
  useEffect(() => { save('streak', streak); }, [save, streak]);
  useEffect(() => { save('lastplay', lastPlayDate); }, [lastPlayDate, save]);
  useEffect(() => { challengeProgressRef.current = challengeProgress; save('challenge_progress', challengeProgress); }, [challengeProgress, save]);
  useEffect(() => { challengeCompletedRef.current = challengeCompleted; save('challenge_done', challengeCompleted); }, [challengeCompleted, save]);
  useEffect(() => { save('games_played', gamesPlayed); }, [gamesPlayed, save]);
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
      if (Date.now() - gameOpenedAtRef.current < CONFIRM_LEAVE_AFTER_MS) return false;
      setLeaveDialog(true);
      return true;
    });
    return () => setLeaveGuard(null);
  }, [setLeaveGuard]);

  const leaveGame = useCallback(() => {
    setLeaveDialog(false);
    back({ force: true });
  }, [back]);

  const unlockedAchievements = useMemo(
    () => ACHIEVEMENTS.filter((a) => a.check(gamesPlayed, points, streak)).map((a) => a.id),
    [gamesPlayed, points, streak],
  );

  const recordGameEvent = useCallback((gameId, event, amount = 1) => {
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

  const launchGame = useCallback((gameId, sfx = 'click', { replace = false } = {}) => {
    playSfx(sfx);
    setRecentGames((current) => [gameId, ...current.filter((id) => id !== gameId)].slice(0, MAX_RECENT_GAMES));
    navigate({ name: 'game', id: gameId }, { replace });
  }, [navigate, playSfx]);

  const toggleFavourite = useCallback((gameId) => {
    playSfx('click');
    setFavouriteGames((current) => (current.includes(gameId) ? current.filter((id) => id !== gameId) : [gameId, ...current]));
  }, [playSfx]);

  const celebrate = useCallback((message, pointsEarned = 5, delayMs = 0, gameIdOverride, { quiet = false } = {}) => {
    const finalMessage = message || getPraise();
    const gameIdAtCall = gameIdOverride || currentGameIdRef.current;
    const run = () => {
      const total = pointsRef.current + pointsEarned;
      pointsRef.current = total;
      setPoints(total);
      if (gameIdAtCall) setGamesPlayed((prev) => ({ ...prev, [gameIdAtCall]: (prev[gameIdAtCall] || 0) + 1 }));
      if (quiet) return;
      setCelebration({
        id: Date.now(), message: finalMessage, points: pointsEarned, total, bursts: createBursts(), confetti: createConfetti(),
      });
    };
    if (delayMs > 0) setTimeout(run, Math.min(delayMs, 100));
    else run();
  }, []);

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
    const GameComponent = currentGame.component;
    const nextId = nextGameAfter(currentGame.id);
    content = (
      <ForcedDifficultyContext.Provider value={little ? 'starter' : null}>
        <Suspense fallback={<GameLoading />}>
          <GameComponent
            key={currentGame.id}
            onBack={() => back()}
            playSfx={playSfx}
            speak={speak}
            onCelebrate={celebrate}
            onGameEvent={recordGameEvent}
            playerName={player.name}
            bigKid={!little}
            onNextGame={nextId && nextId !== currentGame.id ? () => launchGame(nextId, 'launch', { replace: true }) : undefined}
            {...soundProps}
          />
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
        onBack={() => back()}
        {...soundProps}
      />
    );
  } else if (route.name === 'stickers') {
    content = (
      <div className={`flex min-h-[100dvh] w-full flex-col items-center gap-2 bg-gradient-to-b p-3 sm:p-6 ${little ? 'from-amber-200 to-sky-200' : 'from-amber-100 via-white to-sky-100'}`}>
        <PageHeader title={`${player.name}’s stickers`} subtitle={`⭐ ${points} stars`} onBack={() => back()} backLabel="Back to home" {...soundProps} />
        <RewardsShelf points={points} />
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
        onBack={() => back()}
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
      {content}
      {currentGame && !little && !currentGame.little && !NO_CHALLENGE_TRACKER.has(currentGame.id) && (
        <DailyChallengeTracker
          challenge={todaysChallenge}
          progress={challengeProgress}
          completed={challengeCompleted}
          active={currentGame.id === todaysChallenge.game}
          onGo={() => launchGame(todaysChallenge.game, 'launch', { replace: true })}
          placement={currentGame.id === 'solar' ? 'top-center' : 'bottom-right'}
        />
      )}
      <CelebrationOverlay celebration={celebration} />
      {leaveDialog && <LeaveGameDialog onStay={() => setLeaveDialog(false)} onLeave={leaveGame} />}
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
  const [soundOn, setSoundOn] = useState(true);
  const [playerId, setPlayerId] = useState(() => loadSaved(ACTIVE_PLAYER_KEY, null));
  const [grownUpsUnlocked, setGrownUpsUnlocked] = useState(false);
  const playSfx = useSfx(soundOn);
  const voice = useVoice(soundOn);
  const installPrompt = useInstallPrompt();
  const player = getPlayer(playerId);
  const toggleSound = useCallback(() => setSoundOn((prev) => !prev), []);
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
    navigate({ name: 'home' });
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

