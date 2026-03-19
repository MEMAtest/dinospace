import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Home } from 'lucide-react';
import { THEME, GAME_LABELS, ACHIEVEMENTS } from './data/index.js';
import { pickRandom, createBursts, createConfetti, getPraise, getRank, getNextRank, getTodaysChallenge, loadSaved, saveSafe } from './utils.js';
import { useSfx, useVoice, useAmbientMusic } from './hooks.js';
import {
  SoundToggle, CelebrationOverlay, RewardsShelf, PointsSummaryScreen,
  PauseOverlay, BreakReminder, DailyChallengeBanner, StreakBanner, MenuCard,
} from './components/shared/index.jsx';
import SolarSystem from './components/games/SolarSystem.jsx';
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
import ProgressDashboard from './components/games/ProgressDashboard.jsx';
import IntroScreen from './components/games/IntroScreen.jsx';

export default function App() {
  const [screen, setScreen] = useState('intro');
  const [soundOn, setSoundOn] = useState(true);
  const [points, setPoints] = useState(() => loadSaved('amari_points', 0));
  const [celebration, setCelebration] = useState(null);
  const [sessionPoints, setSessionPoints] = useState({});
  const [summary, setSummary] = useState(null);
  const [paused, setPaused] = useState(false);
  const [showBreak, setShowBreak] = useState(false);
  const [streak, setStreak] = useState(() => loadSaved('amari_streak', 0));
  const [lastPlayDate, setLastPlayDate] = useState(() => loadSaved('amari_lastplay', ''));
  const [challengeProgress, setChallengeProgress] = useState(() => loadSaved('amari_challenge_progress', 0));
  const [challengeCompleted, setChallengeCompleted] = useState(() => loadSaved('amari_challenge_done', false));
  const [gamesPlayed, setGamesPlayed] = useState(() => loadSaved('amari_games_played', {}));
  const sessionStartRef = useRef(Date.now());
  const breakTimerRef = useRef(null);
  const screenRef = useRef(screen);
  const playSfx = useSfx(soundOn);
  const speak = useVoice(soundOn);
  useAmbientMusic(soundOn);

  const todaysChallenge = useMemo(() => getTodaysChallenge(), []);
  const today = new Date().toISOString().slice(0, 10);

  // Persist to localStorage safely
  useEffect(() => { saveSafe('amari_points', points); }, [points]);
  useEffect(() => { saveSafe('amari_streak', streak); }, [streak]);
  useEffect(() => { saveSafe('amari_lastplay', lastPlayDate); }, [lastPlayDate]);
  useEffect(() => { saveSafe('amari_challenge_progress', challengeProgress); }, [challengeProgress]);
  useEffect(() => { saveSafe('amari_challenge_done', challengeCompleted); }, [challengeCompleted]);
  useEffect(() => { saveSafe('amari_games_played', gamesPlayed); }, [gamesPlayed]);

  const unlockedAchievements = useMemo(
    () => ACHIEVEMENTS.filter((a) => a.check(gamesPlayed, points, streak)).map((a) => a.id),
    [gamesPlayed, points, streak],
  );

  // Daily streak check on start (runs once)
  const hasCheckedTodayRef = useRef(false);
  useEffect(() => {
    if (hasCheckedTodayRef.current || lastPlayDate === today) return;
    hasCheckedTodayRef.current = true;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (lastPlayDate === yesterday) {
      setStreak((s) => s + 1);
    } else {
      setStreak(1);
    }
    setLastPlayDate(today);
    setChallengeProgress(0);
    setChallengeCompleted(false);
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

  const celebrate = useCallback((message, pointsEarned = 5, delayMs = 0, gameIdOverride) => {
    const finalMessage = message || getPraise();
    const gameIdAtCall = gameIdOverride || screenRef.current;
    const run = () => {
      setPoints((prev) => {
        const total = prev + pointsEarned;
        if (gameIdAtCall && !['menu', 'intro', 'summary'].includes(gameIdAtCall)) {
          setSessionPoints((prevSessions) => ({
            ...prevSessions,
            [gameIdAtCall]: (prevSessions[gameIdAtCall] || 0) + pointsEarned,
          }));
          // Track daily challenge progress
          setChallengeProgress((cp) => {
            const next = cp + 1;
            if (next >= todaysChallenge.target && !challengeCompleted) {
              setChallengeCompleted(true);
            }
            return next;
          });
          // Track total games played per game
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
        return total;
      });
    };
    if (delayMs > 0) {
      setTimeout(run, delayMs);
    } else {
      run();
    }
  }, [challengeCompleted, todaysChallenge]);

  useEffect(() => {
    if (!celebration) return;
    const timer = setTimeout(() => setCelebration(null), 1600);
    return () => clearTimeout(timer);
  }, [celebration]);

  const handleBack = (gameId) => {
    const earned = sessionPoints[gameId] || 0;
    if (earned > 0) {
      setSummary({ gameId, points: earned });
      setScreen('summary');
    } else {
      setScreen('menu');
    }
  };

  const handleSummaryDone = () => {
    if (summary?.gameId) {
      setSessionPoints((prev) => ({ ...prev, [summary.gameId]: 0 }));
    }
    setSummary(null);
    setScreen('menu');
  };

  let content = null;

  if (screen === 'intro') {
    content = (
      <IntroScreen
        onStart={() => setScreen('menu')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
      />
    );
  } else if (screen === 'menu') {
    content = (
      <div
        className={`min-h-screen w-full ${THEME.bg} ${THEME.font} flex flex-col items-center p-6 relative overflow-hidden`}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/50 blur-3xl" />
          <div className="absolute top-32 right-8 h-40 w-40 rounded-full bg-orange-200/60 blur-2xl" />
          <div className="absolute bottom-16 left-10 h-52 w-52 rounded-full bg-green-200/60 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-blue-200/70 blur-3xl" />
        </div>

        <div className="absolute top-6 right-6 z-20">
          <SoundToggle soundOn={soundOn} onToggle={() => setSoundOn((prev) => !prev)} />
        </div>

        <div className="text-center mt-8 mb-6 animate-fade-in-down relative z-10">
          <div className="flex justify-center gap-4 text-5xl mb-4 animate-bounce-slow">
            <span>🐯</span>
            <span>🚀</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-800 tracking-tight drop-shadow-sm">
            Amari <span className="text-blue-500">Discovery</span>
          </h1>
          <p className="text-slate-600 font-bold text-xl mt-2 bg-white/60 inline-block px-6 py-2 rounded-full">
            Academy for Kids
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="text-slate-600 font-semibold">⭐ {points} Stars</span>
            <span className="bg-indigo-100 text-indigo-700 font-black text-sm px-3 py-1 rounded-full">
              {getRank(points).emoji} {getRank(points).title}
            </span>
            {getNextRank(points) && (
              <span className="text-slate-400 text-sm font-semibold">
                {getNextRank(points).minPoints - points}⭐ to {getNextRank(points).title}
              </span>
            )}
          </div>
        </div>

        <StreakBanner streak={streak} bonusStars={streak * 2} />
        <DailyChallengeBanner
          challenge={todaysChallenge}
          progress={challengeProgress}
          completed={challengeCompleted}
          onGo={() => { playSfx('launch'); setScreen(todaysChallenge.game); }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl relative z-10">
          <MenuCard
            icon="🦕"
            title="Dino Detective"
            desc="Find hidden dinosaurs!"
            color="bg-green-400"
            onClick={() => {
              playSfx('click');
              setScreen('dino');
            }}
          />

          <MenuCard
            icon="✈️"
            title="Sky Shapes"
            desc="Draw with a Jet!"
            color="bg-sky-400"
            onClick={() => {
              playSfx('click');
              setScreen('jet');
            }}
          />

          <MenuCard
            icon="🪐"
            title="Solar System"
            desc="Visit the planets"
            color="bg-indigo-400"
            onClick={() => {
              playSfx('click');
              setScreen('solar');
            }}
          />

          <MenuCard
            icon="🎨"
            title="German Garage"
            desc="Learn colors in German"
            color="bg-red-400"
            onClick={() => {
              playSfx('click');
              setScreen('german');
            }}
          />

          <MenuCard
            icon="🛻"
            title="Monster Math"
            desc="Stunt Jump Counting"
            color="bg-orange-400"
            onClick={() => {
              playSfx('click');
              setScreen('math');
            }}
          />

          <MenuCard
            icon="🚀"
            title="Letter Launch"
            desc="Letters and sounds"
            color="bg-teal-400"
            onClick={() => {
              playSfx('click');
              setScreen('letters');
            }}
          />

          <MenuCard
            icon="🧩"
            title="Memory Match"
            desc="Find the pairs"
            color="bg-rose-400"
            onClick={() => {
              playSfx('click');
              setScreen('memory');
            }}
          />

          <MenuCard
            icon="🔷"
            title="Pattern Parade"
            desc="Finish the pattern"
            color="bg-amber-400"
            onClick={() => {
              playSfx('click');
              setScreen('pattern');
            }}
          />

          <MenuCard
            icon="🦸‍♂️"
            title="Spot the Difference"
            desc="Find what changed"
            color="bg-indigo-400"
            onClick={() => {
              playSfx('click');
              setScreen('spot');
            }}
          />

          <MenuCard
            icon="🧩"
            title="Puzzle Pop"
            desc="Drag pieces to build!"
            color="bg-yellow-400"
            onClick={() => {
              playSfx('click');
              setScreen('puzzle');
            }}
          />

          <MenuCard
            icon="🖍️"
            title="Letter Trace"
            desc="Trace big & small letters"
            color="bg-blue-400"
            onClick={() => {
              playSfx('click');
              setScreen('trace');
            }}
          />

          <MenuCard
            icon="🦁"
            title="Sound Safari"
            desc="Match the sounds"
            color="bg-emerald-400"
            onClick={() => {
              playSfx('click');
              setScreen('phonics');
            }}
          />

          <MenuCard
            icon="➕"
            title="Addition Adventure"
            desc="Add it up!"
            color="bg-teal-500"
            onClick={() => {
              playSfx('click');
              setScreen('addition');
            }}
          />

          <MenuCard
            icon="➖"
            title="Subtraction Station"
            desc="Take it away!"
            color="bg-violet-500"
            onClick={() => {
              playSfx('click');
              setScreen('subtraction');
            }}
          />

          <MenuCard
            icon="👨‍🚀"
            title="Astronaut Academy"
            desc="Learn cool facts!"
            color="bg-gradient-to-br from-purple-600 to-indigo-700"
            onClick={() => {
              playSfx('click');
              setScreen('astronaut');
            }}
          />

          <MenuCard
            icon="🔢"
            title="Count the Stars"
            desc="Tap and count!"
            color="bg-indigo-600"
            onClick={() => {
              playSfx('click');
              setScreen('counting');
            }}
          />

          <MenuCard
            icon="🔤"
            title="Word Builder"
            desc="Spell CVC words!"
            color="bg-pink-500"
            onClick={() => {
              playSfx('click');
              setScreen('words');
            }}
          />

          <MenuCard
            icon="🎨"
            title="Color Mixing Lab"
            desc="Mix colors together!"
            color="bg-fuchsia-500"
            onClick={() => {
              playSfx('click');
              setScreen('colormix');
            }}
          />

          <MenuCard
            icon="🤔"
            title="Odd One Out"
            desc="Which one doesn't belong?"
            color="bg-cyan-500"
            onClick={() => {
              playSfx('click');
              setScreen('oddoneout');
            }}
          />

          <MenuCard
            icon="🕐"
            title="Time Teller"
            desc="Read the clock!"
            color="bg-lime-500"
            onClick={() => {
              playSfx('click');
              setScreen('timeteller');
            }}
          />

          <MenuCard
            icon="🐸"
            title="Number Line Jump"
            desc="Hop to the answer!"
            color="bg-emerald-600"
            onClick={() => {
              playSfx('click');
              setScreen('numberline');
            }}
          />

          <MenuCard
            icon="♟️"
            title="Chess Explorers"
            desc="Learn chess pieces!"
            color="bg-gradient-to-br from-amber-600 to-yellow-700"
            onClick={() => {
              playSfx('click');
              setScreen('chess');
            }}
          />
        </div>

        <button
          onClick={() => { playSfx('click'); setScreen('progress'); }}
          className="mt-8 relative z-10 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg px-8 py-4 rounded-full shadow-[0_6px_0_rgba(0,0,0,0.15)] active:shadow-none active:translate-y-1 transition-all flex items-center gap-3"
        >
          📊 My Progress & Achievements
        </button>

        <div className="mt-6 text-slate-500 font-medium text-sm flex gap-2 items-center relative z-10">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          Playful Learning Active
        </div>

        <RewardsShelf points={points} />
      </div>
    );
  } else if (screen === 'summary' && summary) {
    content = (
      <PointsSummaryScreen summary={summary} totalPoints={points} onDone={handleSummaryDone} />
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
      {content}
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
