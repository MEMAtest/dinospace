import { useEffect, useState } from 'react';
import { Check, Home } from 'lucide-react';
import { getPraise } from '../../utils.js';
import { PracticeProgress, SoundToggle } from '../shared/index.jsx';
import superheroCity from '../../assets/spot-difference/superhero-city.webp';

const DIFFERENCES = [
  { id: 'tower', label: 'the tower ornament', x: 22.4, y: 8.2, mark: 'bolt' },
  { id: 'badge', label: 'the standing hero badge', x: 36.6, y: 52.2, mark: 'star' },
  { id: 'mask', label: 'the flying hero mask', x: 59.6, y: 17.2, mark: 'mask' },
];

const DifferenceMark = ({ type }) => {
  if (type === 'mask') return <span className="block h-2.5 w-7 rounded-[50%] bg-blue-700 sm:h-3.5 sm:w-9" />;
  if (type === 'star') return <span className="text-[12px] leading-none sm:text-base">⭐</span>;
  return <span className="text-[12px] leading-none sm:text-base">⚡</span>;
};

const SpotDifference = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent }) => {
  const [found, setFound] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [skillRun, setSkillRun] = useState(0);
  const complete = found.length === DIFFERENCES.length;

  useEffect(() => {
    speak('Spot the difference. Compare the two superhero city pictures carefully.');
  }, [speak]);

  const findDifference = (difference) => {
    if (found.includes(difference.id) || complete) return;
    const nextFound = [...found, difference.id];
    setFound(nextFound);
    setFeedback(`Found ${difference.label}!`);
    playSfx('sparkle');
    if (nextFound.length === DIFFERENCES.length) {
      const praise = getPraise();
      setSkillRun((current) => Math.min(current + 1, 5));
      onCelebrate(praise, 6, 80);
      onGameEvent?.('spot', 'level_completed');
      speak(`${praise} You found all three differences.`);
    }
  };

  const restart = () => {
    setFound([]);
    setFeedback('');
    playSfx('click');
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-b from-indigo-50 via-sky-50 to-indigo-100 text-slate-900">
      <header className="flex items-center justify-between px-4 pt-4">
        <button onClick={onBack} className="game-icon-button" aria-label="Back to all games"><Home /></button>
        <div className="text-center">
          <h2 className="text-2xl font-black text-indigo-700 sm:text-4xl">Spot the Difference</h2>
          <p className="font-bold text-indigo-500">Superhero City · Found {found.length}/3</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-8 pt-3">
        <PracticeProgress skill="Compare details carefully" completed={skillRun} accent="indigo" />
        <p className="mb-3 text-center text-lg font-black text-indigo-700">The pictures are aligned. Find exactly three changes.</p>

        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
          {[false, true].map((changed) => (
            <section key={String(changed)} className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border-4 border-white bg-white shadow-[0_14px_35px_rgba(67,56,202,.18)] sm:rounded-[2rem]">
              <img src={superheroCity} alt={changed ? 'Changed superhero city picture' : 'Original superhero city picture'} className="h-full w-full object-cover" draggable="false" />
              {changed && DIFFERENCES.map((difference) => {
                const isFound = found.includes(difference.id);
                return (
                  <div key={difference.id}>
                    <span
                      className="pointer-events-none absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center"
                      style={{ left: `${difference.x}%`, top: `${difference.y}%` }}
                      aria-hidden="true"
                    >
                      <DifferenceMark type={difference.mark} />
                    </span>
                    <button
                      onClick={() => findDifference(difference)}
                      className={`absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent transition focus-visible:ring-4 focus-visible:ring-yellow-300 ${isFound ? 'ring-4 ring-emerald-400 ring-offset-2 ring-offset-white/80' : ''}`}
                      style={{ left: `${difference.x}%`, top: `${difference.y}%` }}
                      aria-label={`Check ${difference.label}`}
                    >
                      {isFound && <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white shadow"><Check size={15} strokeWidth={4} /></span>}
                    </button>
                  </div>
                );
              })}
              <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-black text-white">{changed ? 'Picture B' : 'Picture A'}</span>
            </section>
          ))}
        </div>

        <div className="mt-4 min-h-12 text-center" aria-live="polite">
          <p className="text-lg font-black text-indigo-700">{complete ? 'All three found — brilliant looking!' : feedback || 'Tap a change in Picture B.'}</p>
          {complete && <button onClick={restart} className="mt-2 rounded-full bg-indigo-600 px-6 py-2 font-black text-white shadow-lg">Play again</button>}
        </div>
      </main>
    </div>
  );
};

export default SpotDifference;
