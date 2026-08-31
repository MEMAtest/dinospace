import { useEffect, useState } from 'react';
import { Check, Home } from 'lucide-react';
import { getPraise } from '../../utils.js';
import { PracticeProgress, SoundToggle } from '../shared/index.jsx';
import superheroCity from '../../assets/spot-difference/superhero-city.webp';
import { spotRoundForDifficulty } from '../../data/spotDifference.js';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';

const DifferenceVisual = ({ type }) => {
  if (type === 'mask' || type === 'mask-normal') {
    return <span className={`relative block h-4 w-11 rounded-[50%] shadow-[0_2px_0_rgba(15,23,42,.4)] sm:h-6 sm:w-16 ${type === 'mask' ? 'bg-blue-700' : 'bg-slate-950'}`}><span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 sm:h-3 sm:w-3" /></span>;
  }
  if (type === 'moon') return <span className="text-xl leading-none drop-shadow sm:text-3xl">🌙</span>;
  if (type === 'sun') return <span className="text-xl leading-none drop-shadow sm:text-3xl">☀️</span>;
  if (type === 'star') return <span className="text-xl leading-none drop-shadow sm:text-3xl">⭐</span>;
  if (type === 'heart') return <span className="text-xl leading-none drop-shadow sm:text-3xl">❤️</span>;
  if (type === 'flag') return <span className="text-xl leading-none drop-shadow sm:text-3xl">🚩</span>;
  if (type === 'flag-normal') return <span className="text-xl leading-none drop-shadow sm:text-3xl">🏳️</span>;
  return <span className="text-xl leading-none drop-shadow sm:text-3xl">⚡</span>;
};

const SpotDifference = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent }) => {
  const difficulty = useGameDifficulty('spot');
  const [round, setRound] = useState(() => spotRoundForDifficulty(difficulty));
  const [found, setFound] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [skillRun, setSkillRun] = useState(0);
  const [wrongTap, setWrongTap] = useState(false);
  const complete = found.length === round.differences.length;

  useEffect(() => {
    const nextRound = spotRoundForDifficulty(difficulty);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRound(nextRound);
    setFound([]);
    setFeedback('');
    setWrongTap(false);
  }, [difficulty]);

  useEffect(() => {
    speak(`Spot the difference. Compare the two ${round.title} pictures carefully. Find ${round.differences.length} changes.`);
  }, [round, speak]);

  const findDifference = (difference) => {
    if (found.includes(difference.id) || complete) return;
    const nextFound = [...found, difference.id];
    setFound(nextFound);
    setFeedback(`Found ${difference.label}!`);
    playSfx('sparkle');
    if (nextFound.length === round.differences.length) {
      const praise = getPraise();
      setSkillRun((current) => Math.min(current + 1, 5));
      onCelebrate(praise, 6, 80);
      onGameEvent?.('spot', 'level_completed');
      speak(`${praise} You found all ${round.differences.length} differences.`);
    }
  };

  const inspectPicture = (event) => {
    if (complete) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    const hit = round.differences.find((difference) => {
      const distance = Math.hypot(x - difference.x, y - difference.y);
      return distance <= difference.hitRadius;
    });
    if (hit) {
      findDifference(hit);
      return;
    }
    setFeedback('Not quite — compare that area with Picture A.');
    setWrongTap(true);
    playSfx('oops');
    window.setTimeout(() => setWrongTap(false), 400);
  };

  const restart = () => {
    setFound([]);
    setFeedback('');
    setWrongTap(false);
    playSfx('click');
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-b from-indigo-50 via-sky-50 to-indigo-100 text-slate-900">
      <header className="flex items-center justify-between px-4 pt-4">
        <button onClick={onBack} className="game-icon-button" aria-label="Back to all games"><Home /></button>
        <div className="text-center">
          <h2 className="text-2xl font-black text-indigo-700 sm:text-4xl">Spot the Difference</h2>
          <p className="font-bold text-indigo-500">{round.title} · Found {found.length}/{round.differences.length}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-8 pt-3">
        <PracticeProgress skill="Compare details carefully" completed={skillRun} accent="indigo" />
        <p className="mb-3 text-center text-lg font-black text-indigo-700">The pictures are aligned. Find exactly {round.differences.length} changes.</p>

        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
          {[false, true].map((changed) => (
            <section
              key={String(changed)}
              onClick={changed ? inspectPicture : undefined}
              className={`relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border-4 border-white bg-white shadow-[0_14px_35px_rgba(67,56,202,.18)] sm:rounded-[2rem] ${changed ? 'cursor-crosshair' : ''} ${changed && wrongTap ? 'animate-shake' : ''}`}
              aria-label={changed ? 'Picture B. Tap a place you think has changed.' : 'Picture A. Original superhero city picture.'}
            >
              <img src={superheroCity} alt={changed ? 'Changed superhero city picture' : 'Original superhero city picture'} className="h-full w-full object-cover" draggable="false" />
              {round.differences.map((difference) => {
                const isFound = found.includes(difference.id);
                return (
                  <div key={difference.id}>
                    <span
                      className="pointer-events-none absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center"
                      style={{ left: `${difference.x}%`, top: `${difference.y}%` }}
                      aria-hidden="true"
                    >
                      <DifferenceVisual type={changed ? difference.visual : difference.normalVisual} />
                    </span>
                    {changed && <button
                      onClick={(event) => { event.stopPropagation(); findDifference(difference); }}
                      className={`absolute h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent transition focus-visible:ring-4 focus-visible:ring-yellow-300 sm:h-20 sm:w-20 ${isFound ? 'ring-4 ring-emerald-400 ring-offset-2 ring-offset-white/80' : ''}`}
                      style={{ left: `${difference.x}%`, top: `${difference.y}%` }}
                      aria-label={`Check ${difference.label}`}
                    >
                      {isFound && <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white shadow"><Check size={15} strokeWidth={4} /></span>}
                    </button>}
                  </div>
                );
              })}
              <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-black text-white">{changed ? 'Picture B' : 'Picture A'}</span>
            </section>
          ))}
        </div>

        <div className="mt-4 min-h-12 text-center" aria-live="polite">
          <p className="text-lg font-black text-indigo-700">{complete ? `All ${round.differences.length} found — brilliant looking!` : feedback || 'Tap a change in Picture B.'}</p>
          {complete && <button onClick={restart} className="mt-2 rounded-full bg-indigo-600 px-6 py-2 font-black text-white shadow-lg">Play again</button>}
        </div>
      </main>
    </div>
  );
};

export default SpotDifference;
