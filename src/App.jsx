import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { THEME, ACHIEVEMENTS } from './data/index.js';
import { createBursts, createConfetti, getPraise, getRank, getNextRank, getTodaysChallenge, loadSaved, saveSafe } from './utils.js';
import { useSfx, useVoice, useAmbientMusic, useInstallPrompt } from './hooks.js';
import {
  SoundToggle, CelebrationOverlay, RewardsShelf,
  PauseOverlay, BreakReminder, DailyChallengeBanner, StreakBanner, MenuCard,
  DailyChallengeTracker, InstallAppPrompt, VoiceSettings,
} from './components/shared/index.jsx';
import DinoDetective from './components/games/DinoDetective.jsx';
import JetSkyShapes from './components/games/JetSkyShapes.jsx';
import GermanGarage from './components/games/GermanGarage.jsx';
import MonsterMath from './components/games/MonsterMath.jsx';
import LetterLaunch from './components/games/LetterLaunch.jsx';
import MemoryMatch from './components/games/MemoryMatch.jsx';
import PatternParade from './components/games/PatternParade.jsx';
import LetterTrace from './components/games/LetterTrace.jsx';
import SoundSafari from './components/games/SoundSafari.jsx';
import SpotDifference from './components/games/SpotDifference.jsx';
import PuzzlePlay from './components/games/PuzzlePlay.jsx';
import AdditionAdventure from './components/games/AdditionAdventure.jsx';
import SubtractionStation from './components/games/SubtractionStation.jsx';
import AstronautAcademy from './components/games/AstronautAcademy.jsx';
import CountTheStars from './components/games/CountTheStars.jsx';
import WordBuilder from './components/games/WordBuilder.jsx';
import ColorMixingLab from './components/games/ColorMixingLab.jsx';
import OddOneOut from './components/games/OddOneOut.jsx';
import TimeTeller from './components/games/TimeTeller.jsx';
import NumberLineJump from './components/games/NumberLineJump.jsx';
import ChessExplorers from './components/games/ChessExplorers.jsx';
import TicTacToe from './components/games/TicTacToe.jsx';
import DinoHangman from './components/games/Hangman.jsx';
import ProgressDashboard from './components/games/ProgressDashboard.jsx';
import IntroScreen from './components/games/IntroScreen.jsx';
import astronautCrew from './assets/landing/amari-astronaut-robot.png';
import titleTrex from './assets/dinos/title-trex.png';
import titleTrike from './assets/dinos/title-trike.png';
import { recordLegacyGameEvent } from './data/learningProgress.js';
import { BONUS_GAME_IDS as BONUS_GAME_ID_LIST, LEARNING_WORLDS, PRACTICE_GAME_IDS } from './data/learningWorlds.js';

const SolarSystem = lazy(() => import('./components/games/SolarSystem.jsx'));

const GAME_MENU_ITEMS = [
  { id: 'tictactoe', icon: <span className="flex items-center gap-2 text-5xl" aria-label="Noughts, crosses and a rocket"><span>⭕</span><span>✕</span><span>🚀</span></span>, title: 'Cosmic Tic-Tac-Toe', desc: 'Dinos vs rockets!', color: 'bg-gradient-to-br from-slate-800 via-indigo-800 to-cyan-700', category: 'Quick Think', badge: 'NEW' },
  { id: 'hangman', icon: <img src={titleTrex} alt="Rex the complete T-Rex" className="h-full w-full object-contain" />, title: 'Dino Hangman', desc: 'Rescue dinosaur words!', color: 'bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-700', category: 'Words', badge: 'NEW' },
  { id: 'dino', icon: <img src={titleTrike} alt="Trix the complete Triceratops" className="h-full w-full object-contain" />, title: 'Dino Detective', desc: 'Find hidden dinosaurs!', color: 'bg-gradient-to-br from-green-400 to-emerald-500', category: 'Discover' },
  { id: 'jet', icon: '✈️', title: 'Sky Shapes', desc: 'Draw with a jet!', color: 'bg-gradient-to-br from-sky-400 to-blue-500', category: 'Create' },
  { id: 'solar', icon: '🪐', title: 'Solar System', desc: 'Visit the planets', color: 'bg-gradient-to-br from-indigo-500 to-violet-600', category: 'Discover' },
  { id: 'german', icon: '🎨', title: 'German Garage', desc: 'Learn colours in German', color: 'bg-gradient-to-br from-red-400 to-rose-500', category: 'Words' },
  { id: 'math', icon: '🛻', title: 'Monster Math', desc: 'Stunt-jump counting', color: 'bg-gradient-to-br from-orange-400 to-red-500', category: 'Maths' },
  { id: 'letters', icon: '🚀', title: 'Letter Launch', desc: 'Letters and sounds', color: 'bg-gradient-to-br from-teal-400 to-cyan-500', category: 'Words' },
  { id: 'memory', icon: '🧩', title: 'Memory Match', desc: 'Find the pairs', color: 'bg-gradient-to-br from-rose-400 to-pink-500', category: 'Quick Think' },
  { id: 'pattern', icon: '🔷', title: 'Pattern Parade', desc: 'Finish the pattern', color: 'bg-gradient-to-br from-amber-400 to-orange-500', category: 'Quick Think' },
  { id: 'spot', icon: '🦸‍♂️', title: 'Spot the Difference', desc: 'Find what changed', color: 'bg-gradient-to-br from-indigo-400 to-blue-600', category: 'Quick Think' },
  { id: 'puzzle', icon: '🧩', title: 'Puzzle Pop', desc: 'Build the picture!', color: 'bg-gradient-to-br from-yellow-400 to-amber-500', category: 'Quick Think' },
  { id: 'trace', icon: '🖍️', title: 'Letter Trace', desc: 'Trace big and small letters', color: 'bg-gradient-to-br from-blue-400 to-indigo-500', category: 'Words' },
  { id: 'phonics', icon: '🦁', title: 'Sound Safari', desc: 'Match the sounds', color: 'bg-gradient-to-br from-emerald-400 to-green-600', category: 'Words' },
  { id: 'addition', icon: '➕', title: 'Addition Adventure', desc: 'Add it up!', color: 'bg-gradient-to-br from-teal-500 to-emerald-600', category: 'Maths' },
  { id: 'subtraction', icon: '➖', title: 'Subtraction Station', desc: 'Take it away!', color: 'bg-gradient-to-br from-violet-500 to-purple-700', category: 'Maths' },
  { id: 'astronaut', icon: '👨‍🚀', title: 'Astronaut Academy', desc: 'Explore space heroes', color: 'bg-gradient-to-br from-purple-600 to-indigo-800', category: 'Discover' },
  { id: 'counting', icon: '🔢', title: 'Count the Stars', desc: 'Tap and count!', color: 'bg-gradient-to-br from-indigo-600 to-blue-800', category: 'Maths' },
  { id: 'words', icon: '🔤', title: 'Spelling Studio', desc: 'Learn sounds and spell!', color: 'bg-gradient-to-br from-pink-500 to-rose-600', category: 'Words' },
  { id: 'colormix', icon: '🎨', title: 'Colour Mixing Lab', desc: 'Mix colours together!', color: 'bg-gradient-to-br from-fuchsia-500 to-purple-600', category: 'Create' },
  { id: 'oddoneout', icon: '🤔', title: 'Odd One Out', desc: 'Which one does not belong?', color: 'bg-gradient-to-br from-cyan-500 to-blue-600', category: 'Quick Think' },
  { id: 'timeteller', icon: '🕐', title: 'Time Teller', desc: 'Read the clock!', color: 'bg-gradient-to-br from-lime-500 to-green-600', category: 'Maths' },
  { id: 'numberline', icon: '🐸', title: 'Number Line Jump', desc: 'Hop to the answer!', color: 'bg-gradient-to-br from-emerald-600 to-teal-700', category: 'Maths' },
  { id: 'chess', icon: '♟️', title: 'Chess Explorers', desc: 'Learn chess pieces!', color: 'bg-gradient-to-br from-amber-600 to-yellow-800', category: 'Quick Think' },
];

const BONUS_GAME_IDS = new Set(BONUS_GAME_ID_LIST);
const MAX_RECENT_GAMES = 4;

export default function App() {
  const [screen, setScreen] = useState('intro');
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [favouriteGames, setFavouriteGames] = useState(() => loadSaved('amari_favourite_games', []));
  const [recentGames, setRecentGames] = useState(() => loadSaved('amari_recent_games', []));
  const [soundOn, setSoundOn] = useState(true);
  const [points, setPoints] = useState(() => Math.max(0, loadSaved('amari_points', 0)));
  const [celebration, setCelebration] = useState(null);
  const [, setSessionPoints] = useState({});
  const [paused, setPaused] = useState(false);
  const [showBreak, setShowBreak] = useState(false);
  const [streak, setStreak] = useState(() => Math.max(0, loadSaved('amari_streak', 0)));
  const [lastPlayDate, setLastPlayDate] = useState(() => loadSaved('amari_lastplay', ''));
  const [challengeProgress, setChallengeProgress] = useState(() => Math.max(0, loadSaved('amari_challenge_progress', 0)));
  const [challengeCompleted, setChallengeCompleted] = useState(() => loadSaved('amari_challenge_done', false));
  const [gamesPlayed, setGamesPlayed] = useState(() => loadSaved('amari_games_played', {}));
  const pointsRef = useRef(points);
  const challengeProgressRef = useRef(challengeProgress);
  const challengeCompletedRef = useRef(challengeCompleted);
  const breakTimerRef = useRef(null);
  const screenRef = useRef(screen);
  const playSfx = useSfx(soundOn);
  const { speak, voiceMode, setVoiceMode, premiumEnabled, premiumStatus } = useVoice(soundOn);
  const installPrompt = useInstallPrompt();
  useAmbientMusic(soundOn);

  const todaysChallenge = useMemo(() => getTodaysChallenge(), []);
  const activeWorld = useMemo(
    () => LEARNING_WORLDS.find((world) => world.id === selectedWorld) || null,
    [selectedWorld],
  );
  const activeWorldGames = useMemo(
    () => activeWorld
      ? activeWorld.gameIds.map((id) => GAME_MENU_ITEMS.find((game) => game.id === id)).filter(Boolean)
      : [],
    [activeWorld],
  );
  const quickGames = useMemo(() => {
    const ids = [...favouriteGames, ...recentGames].filter((id, index, all) => all.indexOf(id) === index);
    return ids.map((id) => GAME_MENU_ITEMS.find((game) => game.id === id)).filter(Boolean).slice(0, 6);
  }, [favouriteGames, recentGames]);
  const practiceGames = useMemo(() => {
    const seed = Math.floor(new Date().setHours(0, 0, 0, 0) / 86400000);
    return Array.from({ length: 3 }, (_, offset) => {
      const id = PRACTICE_GAME_IDS[(seed + offset * 3) % PRACTICE_GAME_IDS.length];
      return GAME_MENU_ITEMS.find((game) => game.id === id);
    }).filter(Boolean);
  }, []);
  const today = new Date().toISOString().slice(0, 10);

  // Persist to localStorage safely
  useEffect(() => { pointsRef.current = points; saveSafe('amari_points', points); }, [points]);
  useEffect(() => { saveSafe('amari_streak', streak); }, [streak]);
  useEffect(() => { saveSafe('amari_lastplay', lastPlayDate); }, [lastPlayDate]);
  useEffect(() => { challengeProgressRef.current = challengeProgress; saveSafe('amari_challenge_progress', challengeProgress); }, [challengeProgress]);
  useEffect(() => { challengeCompletedRef.current = challengeCompleted; saveSafe('amari_challenge_done', challengeCompleted); }, [challengeCompleted]);
  useEffect(() => { saveSafe('amari_games_played', gamesPlayed); }, [gamesPlayed]);
  useEffect(() => { saveSafe('amari_favourite_games', favouriteGames); }, [favouriteGames]);
  useEffect(() => { saveSafe('amari_recent_games', recentGames); }, [recentGames]);

  const unlockedAchievements = useMemo(
    () => ACHIEVEMENTS.filter((a) => a.check(gamesPlayed, points, streak)).map((a) => a.id),
    [gamesPlayed, points, streak],
  );

  // Daily streak check on start (runs once)
  const hasCheckedTodayRef = useRef(false);
  useEffect(() => {
    if (hasCheckedTodayRef.current || lastPlayDate === today) return;
    hasCheckedTodayRef.current = true;
    const timer = setTimeout(() => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (lastPlayDate === yesterday) {
        setStreak((s) => s + 1);
      } else {
        setStreak(1);
      }
      setLastPlayDate(today);
      challengeProgressRef.current = 0;
      challengeCompletedRef.current = false;
      setChallengeProgress(0);
      setChallengeCompleted(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [lastPlayDate, today]);

  // Screen time break reminder (30 min)
  useEffect(() => {
    breakTimerRef.current = setTimeout(() => {
      setShowBreak(true);
    }, 30 * 60 * 1000);
    return () => clearTimeout(breakTimerRef.current);
  }, []);

  useEffect(() => {
    document.title = 'Amari Discovery';
  }, []);

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  const recordGameEvent = useCallback((gameId, event, amount = 1) => {
    recordLegacyGameEvent(gameId, event, amount);
    if (
      challengeCompletedRef.current
      || gameId !== todaysChallenge.game
      || event !== todaysChallenge.event
    ) return;

    const challengeAmount = typeof amount === 'number' && Number.isFinite(amount) ? amount : 1;
    const next = Math.min(todaysChallenge.target, challengeProgressRef.current + challengeAmount);
    challengeProgressRef.current = next;
    setChallengeProgress(next);
    if (next >= todaysChallenge.target) {
      challengeCompletedRef.current = true;
      setChallengeCompleted(true);
    }
  }, [todaysChallenge]);

  const launchGame = useCallback((gameId, sfx = 'click') => {
    playSfx(sfx);
    setRecentGames((current) => [gameId, ...current.filter((id) => id !== gameId)].slice(0, MAX_RECENT_GAMES));
    setScreen(gameId);
  }, [playSfx]);

  const toggleFavourite = useCallback((gameId) => {
    playSfx('click');
    setFavouriteGames((current) => current.includes(gameId)
      ? current.filter((id) => id !== gameId)
      : [gameId, ...current]);
  }, [playSfx]);

  const goToTodaysChallenge = useCallback(() => {
    launchGame(todaysChallenge.game, 'launch');
  }, [launchGame, todaysChallenge]);

  const celebrate = useCallback((message, pointsEarned = 5, delayMs = 0, gameIdOverride) => {
    const finalMessage = message || getPraise();
    const gameIdAtCall = gameIdOverride || screenRef.current;
    const run = () => {
      const total = pointsRef.current + pointsEarned;
      pointsRef.current = total;
      setPoints(total);
      if (gameIdAtCall && !['menu', 'intro', 'summary'].includes(gameIdAtCall)) {
        setSessionPoints((prevSessions) => ({
          ...prevSessions,
          [gameIdAtCall]: (prevSessions[gameIdAtCall] || 0) + pointsEarned,
        }));
        setGamesPlayed((prev) => ({
          ...prev,
          [gameIdAtCall]: (prev[gameIdAtCall] || 0) + 1,
        }));
      }
      setCelebration({
        id: Date.now(),
        message: finalMessage,
        points: pointsEarned,
        total,
        bursts: createBursts(),
        confetti: createConfetti(),
      });
    };
    if (delayMs > 0) {
      setTimeout(run, Math.min(delayMs, 100));
    } else {
      run();
    }
  }, []);

  useEffect(() => {
    if (!celebration) return;
    const timer = setTimeout(
      () => setCelebration(null),
      celebration.points >= 8 ? 850 : 560,
    );
    return () => clearTimeout(timer);
  }, [celebration]);

  const handleBack = (gameId) => {
    setSessionPoints((prev) => ({ ...prev, [gameId]: 0 }));
    setScreen('menu');
  };

  const renderGameCard = (game) => (
    <div key={game.id} className="relative">
      <MenuCard
        icon={game.icon}
        title={game.title}
        desc={game.desc}
        color={game.color}
        badge={BONUS_GAME_IDS.has(game.id) ? 'PRACTICE' : game.badge}
        category={BONUS_GAME_IDS.has(game.id) ? 'Bonus play' : game.category}
        playedCount={gamesPlayed[game.id] || 0}
        onClick={() => launchGame(game.id)}
      />
      <button
        type="button"
        onClick={() => toggleFavourite(game.id)}
        className={`absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/50 text-xl shadow-md backdrop-blur transition hover:scale-105 active:scale-95 ${
          favouriteGames.includes(game.id) ? 'bg-amber-300 text-amber-900' : 'bg-white/25 text-white'
        }`}
        aria-label={`${favouriteGames.includes(game.id) ? 'Remove' : 'Add'} ${game.title} ${favouriteGames.includes(game.id) ? 'from' : 'to'} favourites`}
        aria-pressed={favouriteGames.includes(game.id)}
      >
        {favouriteGames.includes(game.id) ? '★' : '☆'}
      </button>
    </div>
  );

  let content = null;

  if (screen === 'intro') {
    content = (
      <IntroScreen
        onStart={() => setScreen('menu')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        premiumEnabled={premiumEnabled}
        premiumStatus={premiumStatus}
      />
    );
  } else if (screen === 'menu') {
    content = (
      <div
        className={`min-h-screen w-full bg-gradient-to-b from-[#dff3ff] via-[#eef8ff] to-[#f8fbff] ${THEME.font} flex flex-col items-center p-4 sm:p-6 relative overflow-hidden`}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/50 blur-3xl" />
          <div className="absolute top-32 right-8 h-40 w-40 rounded-full bg-orange-200/60 blur-2xl" />
          <div className="absolute bottom-16 left-10 h-52 w-52 rounded-full bg-green-200/60 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-blue-200/70 blur-3xl" />
        </div>

        <header className="relative z-20 flex w-full max-w-7xl items-center justify-between rounded-[1.7rem] border border-white/80 bg-white/75 px-4 py-3 shadow-[0_12px_34px_rgba(30,105,175,.12)] backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 p-2 text-2xl shadow-lg">🚀</div>
            <div><h1 className="text-xl font-black leading-tight text-slate-900 sm:text-3xl">Amari <span className="text-blue-600">Discovery</span></h1><p className="hidden text-xs font-bold text-slate-500 sm:block">Academy for Kids</p></div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden rounded-full bg-amber-50 px-4 py-2 text-sm font-black text-amber-700 sm:block">⭐ {points} Stars</span>
            <span className="hidden rounded-full bg-indigo-50 px-4 py-2 text-sm font-black text-indigo-700 md:block">{getRank(points).emoji} {getRank(points).title}</span>
            <SoundToggle soundOn={soundOn} onToggle={() => setSoundOn((prev) => !prev)} />
          </div>
        </header>

        <section className="relative z-10 mt-5 grid w-full max-w-7xl overflow-hidden rounded-[2.4rem] border-2 border-white/90 bg-gradient-to-br from-sky-100 via-white/80 to-indigo-100 shadow-[0_22px_60px_rgba(38,104,171,.17)] lg:grid-cols-[0.82fr_1.18fr]">
          <div className="relative flex min-h-64 items-end justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_65%,rgba(96,165,250,.34),transparent_52%)] px-4 pt-5 lg:min-h-[390px]">
            <div className="absolute left-7 top-8 text-5xl opacity-80">🪐</div><div className="absolute right-8 top-10 text-4xl">✨</div>
            <img src={astronautCrew} alt="Amari the astronaut with a friendly learning robot" className="max-h-[370px] w-auto max-w-full object-contain drop-shadow-[0_18px_22px_rgba(30,64,175,.22)]" />
          </div>
          <div className="flex flex-col justify-center p-6 text-center sm:p-9 lg:text-left">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-500">Today’s discovery deck</p>
            <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">Hi Amari!</h2>
            <p className="mt-2 text-lg font-bold text-slate-600 sm:text-xl">Ready for a new learning adventure?</p>
            <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl bg-white/85 p-3 shadow-sm"><div className="text-xl">⭐</div><strong className="block text-slate-900">{points}</strong><span className="text-xs font-bold text-slate-500">Total stars</span></div>
              <div className="rounded-2xl bg-white/85 p-3 shadow-sm"><div className="text-xl">🔥</div><strong className="block text-slate-900">{streak}</strong><span className="text-xs font-bold text-slate-500">Day streak</span></div>
              <div className="rounded-2xl bg-white/85 p-3 shadow-sm"><div className="text-xl">🛡️</div><strong className="block text-slate-900">{getRank(points).title}</strong><span className="text-xs font-bold text-slate-500">Current level</span></div>
            </div>
            {getNextRank(points) && <p className="mt-4 text-sm font-bold text-slate-500">Only {getNextRank(points).minPoints - points} more stars to become {getNextRank(points).title}.</p>}
          </div>
        </section>

        <StreakBanner streak={streak} bonusStars={streak * 2} />
        <DailyChallengeBanner
          challenge={todaysChallenge}
          progress={challengeProgress}
          completed={challengeCompleted}
          onGo={goToTodaysChallenge}
        />

        <section className="relative z-10 mb-6 w-full max-w-7xl rounded-[2rem] border border-white/90 bg-white/75 p-4 shadow-[0_14px_40px_rgba(30,105,175,.12)] backdrop-blur-xl sm:p-6" aria-labelledby="practice-heading">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">Optional • about 8 minutes</p>
              <h2 id="practice-heading" className="text-2xl font-black text-slate-900 sm:text-3xl">Today’s Practice</h2>
              <p className="text-sm font-bold text-slate-500">Try these three, or choose any world below.</p>
            </div>
            <button
              type="button"
              onClick={() => launchGame(practiceGames[0].id, 'launch')}
              className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-3 font-black text-white shadow-lg transition hover:-translate-y-0.5 active:translate-y-0"
            >
              ▶ Start practice
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {practiceGames.map((game, index) => (
              <button
                key={game.id}
                type="button"
                onClick={() => launchGame(game.id)}
                className="flex min-h-20 items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-sky-50 text-3xl">{game.icon}</span>
                <span><span className="block text-xs font-black uppercase tracking-wide text-orange-500">Step {index + 1}</span><strong className="text-base text-slate-900">{game.title}</strong></span>
              </button>
            ))}
          </div>
        </section>

        {quickGames.length > 0 && (
          <section className="relative z-10 mb-6 w-full max-w-7xl" aria-labelledby="quick-heading">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="quick-heading" className="text-left text-xl font-black text-slate-900">Quick re-entry</h2>
              <span className="text-xs font-bold text-slate-500">★ Favourites first</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {quickGames.map((game) => (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => launchGame(game.id)}
                  className="flex min-w-48 items-center gap-3 rounded-2xl border border-white bg-white/85 p-3 text-left shadow-md transition hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-indigo-50 text-3xl">{game.icon}</span>
                  <span><strong className="block text-sm text-slate-900">{game.title}</strong><span className="text-xs font-bold text-slate-500">{favouriteGames.includes(game.id) ? '★ Favourite' : '↺ Recent'}</span></span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="relative z-10 w-full max-w-7xl" aria-labelledby="worlds-heading">
          <div className="mb-4 text-left">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-500">Every game stays open</p>
            <h2 id="worlds-heading" className="text-3xl font-black text-slate-900 sm:text-4xl">Choose a learning world</h2>
            <p className="mt-1 font-bold text-slate-500">Pick a world, then choose the game you want.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {LEARNING_WORLDS.map((world) => (
              <button
                key={world.id}
                type="button"
                onClick={() => { playSfx('click'); setSelectedWorld(world.id); }}
                aria-pressed={selectedWorld === world.id}
                className={`group relative min-h-52 overflow-hidden rounded-[1.8rem] bg-gradient-to-br ${world.color} p-5 text-left text-white shadow-[0_8px_0_rgba(15,23,42,.13),0_16px_30px_rgba(30,64,175,.16)] transition hover:-translate-y-1 active:translate-y-1 active:shadow-none ${selectedWorld === world.id ? 'ring-4 ring-white ring-offset-4 ring-offset-sky-100' : ''}`}
              >
                <span className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20" />
                <span className="relative text-5xl transition group-hover:scale-110">{world.icon}</span>
                <strong className="relative mt-5 block text-xl font-black leading-tight">{world.title}</strong>
                <span className="relative mt-2 block text-sm font-bold text-white/90">{world.desc}</span>
                <span className="relative mt-4 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-black backdrop-blur">{world.gameIds.length} games →</span>
              </button>
            ))}
          </div>
        </section>

        {activeWorld && (
          <section className="relative z-10 mt-7 w-full max-w-7xl rounded-[2rem] border border-white/90 bg-white/65 p-4 shadow-[0_16px_45px_rgba(30,105,175,.13)] backdrop-blur-xl sm:p-6" aria-labelledby="world-games-heading">
            <div className="mb-5 flex flex-col gap-3 text-left sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-500">{activeWorld.icon} World open</p>
                <h2 id="world-games-heading" className="text-3xl font-black text-slate-900">{activeWorld.title}</h2>
                <p className="font-bold text-slate-500">Choose any game. Nothing is locked.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const game = activeWorldGames[Math.floor(Math.random() * activeWorldGames.length)];
                  launchGame(game.id, 'launch');
                }}
                className="rounded-2xl bg-slate-900 px-5 py-3 font-black text-white shadow-lg transition hover:-translate-y-0.5 active:translate-y-0"
              >
                🎲 Surprise me in this world
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {activeWorldGames.map(renderGameCard)}
            </div>
          </section>
        )}

        <button
          onClick={() => { playSfx('click'); setScreen('progress'); }}
          className="mt-8 relative z-10 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg px-8 py-4 rounded-full shadow-[0_6px_0_rgba(0,0,0,0.15)] active:shadow-none active:translate-y-1 transition-all flex items-center gap-3"
        >
          📊 My Progress & Achievements
        </button>

        <VoiceSettings
          voiceMode={voiceMode}
          onVoiceModeChange={setVoiceMode}
          premiumEnabled={premiumEnabled}
          premiumStatus={premiumStatus}
          onPreview={() => speak('Hello explorer! Your next learning adventure is ready.')}
        />
        <InstallAppPrompt {...installPrompt} onInstall={installPrompt.install} />

        <div className="mt-6 text-slate-500 font-medium text-sm flex gap-2 items-center relative z-10">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          Playful Learning Active
        </div>

        <RewardsShelf points={points} />
      </div>
    );
  } else if (screen === 'solar') {
    content = (
      <SolarSystem
        onBack={() => handleBack('solar')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
        onGameEvent={recordGameEvent}
      />
    );
  } else if (screen === 'dino') {
    content = (
      <DinoDetective
        onBack={() => handleBack('dino')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
        onGameEvent={recordGameEvent}
      />
    );
  } else if (screen === 'jet') {
    content = (
      <JetSkyShapes
        onBack={() => handleBack('jet')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
        onGameEvent={recordGameEvent}
      />
    );
  } else if (screen === 'german') {
    content = (
      <GermanGarage
        onBack={() => handleBack('german')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
        onGameEvent={recordGameEvent}
      />
    );
  } else if (screen === 'math') {
    content = (
      <MonsterMath
        onBack={() => handleBack('math')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
        onGameEvent={recordGameEvent}
      />
    );
  } else if (screen === 'letters') {
    content = (
      <LetterLaunch
        onBack={() => handleBack('letters')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
        onGameEvent={recordGameEvent}
      />
    );
  } else if (screen === 'memory') {
    content = (
      <MemoryMatch
        onBack={() => handleBack('memory')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
        onGameEvent={recordGameEvent}
      />
    );
  } else if (screen === 'pattern') {
    content = (
      <PatternParade
        onBack={() => handleBack('pattern')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
        onGameEvent={recordGameEvent}
      />
    );
  } else if (screen === 'spot') {
    content = (
      <SpotDifference
        onBack={() => handleBack('spot')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
        onGameEvent={recordGameEvent}
      />
    );
  } else if (screen === 'puzzle') {
    content = (
      <PuzzlePlay
        onBack={() => handleBack('puzzle')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
        onGameEvent={recordGameEvent}
      />
    );
  } else if (screen === 'trace') {
    content = (
      <LetterTrace
        onBack={() => handleBack('trace')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
        onGameEvent={recordGameEvent}
      />
    );
  } else if (screen === 'phonics') {
    content = (
      <SoundSafari
        onBack={() => handleBack('phonics')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
        onGameEvent={recordGameEvent}
      />
    );
  } else if (screen === 'addition') {
    content = (
      <AdditionAdventure
        onBack={() => handleBack('addition')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
        onGameEvent={recordGameEvent}
      />
    );
  } else if (screen === 'subtraction') {
    content = (
      <SubtractionStation
        onBack={() => handleBack('subtraction')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
        onGameEvent={recordGameEvent}
      />
    );
  } else if (screen === 'astronaut') {
    content = (
      <AstronautAcademy
        onBack={() => handleBack('astronaut')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
        onGameEvent={recordGameEvent}
      />
    );
  } else if (screen === 'counting') {
    content = (
      <CountTheStars
        onBack={() => handleBack('counting')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
        onGameEvent={recordGameEvent}
      />
    );
  } else if (screen === 'words') {
    content = (
      <WordBuilder
        onBack={() => handleBack('words')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
        onGameEvent={recordGameEvent}
      />
    );
  } else if (screen === 'colormix') {
    content = (
      <ColorMixingLab
        onBack={() => handleBack('colormix')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
        onGameEvent={recordGameEvent}
      />
    );
  } else if (screen === 'oddoneout') {
    content = (
      <OddOneOut
        onBack={() => handleBack('oddoneout')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
        onGameEvent={recordGameEvent}
      />
    );
  } else if (screen === 'timeteller') {
    content = (
      <TimeTeller
        onBack={() => handleBack('timeteller')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
        onGameEvent={recordGameEvent}
      />
    );
  } else if (screen === 'numberline') {
    content = (
      <NumberLineJump
        onBack={() => handleBack('numberline')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
        onGameEvent={recordGameEvent}
      />
    );
  } else if (screen === 'hangman') {
    content = (
      <DinoHangman
        onBack={() => handleBack('hangman')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
        onGameEvent={recordGameEvent}
      />
    );
  } else if (screen === 'tictactoe') {
    content = (
      <TicTacToe
        onBack={() => handleBack('tictactoe')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
        onGameEvent={recordGameEvent}
      />
    );
  } else if (screen === 'chess') {
    content = (
      <ChessExplorers
        onBack={() => handleBack('chess')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
        onGameEvent={recordGameEvent}
      />
    );
  } else if (screen === 'progress') {
    content = (
      <ProgressDashboard
        points={points}
        gamesPlayed={gamesPlayed}
        streak={streak}
        achievements={unlockedAchievements}
        onBack={() => setScreen('menu')}
        playSfx={playSfx}
      />
    );
  }

  return (
    <>
      <Suspense
        fallback={(
          <div className="grid min-h-screen place-items-center bg-slate-950 text-white">
            <div className="text-center">
              <div className="text-5xl animate-bounce-slow">🪐</div>
              <p className="mt-3 font-black">Preparing the 3D universe…</p>
            </div>
          </div>
        )}
      >
        {content}
      </Suspense>
      {GAME_MENU_ITEMS.some((game) => game.id === screen) && !['jet', 'spot'].includes(screen) && (
        <DailyChallengeTracker
          challenge={todaysChallenge}
          progress={challengeProgress}
          completed={challengeCompleted}
          active={screen === todaysChallenge.game}
          onGo={goToTodaysChallenge}
          placement={screen === 'solar' ? 'top-center' : screen === 'puzzle' ? 'top-right' : screen === 'spot' ? 'bottom-edge' : 'bottom-right'}
        />
      )}
      <CelebrationOverlay celebration={celebration} />
      {paused && <PauseOverlay onResume={() => setPaused(false)} />}
      {showBreak && (
        <BreakReminder
          onDismiss={() => {
            setShowBreak(false);
            breakTimerRef.current = setTimeout(() => setShowBreak(true), 5 * 60 * 1000);
          }}
          onTakeBreak={() => {
            setShowBreak(false);
            setScreen('intro');
          }}
        />
      )}
    </>
  );
}
