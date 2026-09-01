import { useState, useEffect } from 'react';
import { Home } from 'lucide-react';
import { COLOR_MIX_ROUNDS } from '../../data/index.js';
import { shuffle, getPraise } from '../../utils.js';
import { PracticeProgress, SoundToggle } from '../shared/index.jsx';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';
import { colourRoundIndexes } from '../../data/gameDifficulty.js';

const makeOptions = (round) => shuffle(round.options);

const COLOUR_HEX = {
  Red: '#ef4444', Yellow: '#facc15', Blue: '#3b82f6', White: '#f8fafc',
  Black: '#0f172a', Orange: '#f97316', Purple: '#a855f7', Green: '#22c55e',
  Pink: '#f472b6', 'Light Blue': '#67e8f9', Brown: '#92400e', Grey: '#94a3b8',
};

const ColourSwatch = ({ name, size = 'h-36 w-36' }) => (
  <div
    className={`relative flex ${size} items-center justify-center rounded-full border-4 border-white shadow-[inset_-10px_-12px_18px_rgba(15,23,42,.16),0_12px_20px_rgba(15,23,42,.16)]`}
    style={{ backgroundColor: COLOUR_HEX[name] || '#cbd5e1' }}
    aria-label={`${name} paint`}
  >
    <span className="absolute left-[22%] top-[18%] h-5 w-10 rotate-[-25deg] rounded-full bg-white/45 blur-[1px]" aria-hidden="true" />
  </div>
);

const ColorMixingLab = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent }) => {
  const difficulty = useGameDifficulty('colormix');
  const [roundIndex, setRoundIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [mixed, setMixed] = useState(false);
  const bandIndexes = colourRoundIndexes(difficulty);
  const round = COLOR_MIX_ROUNDS[bandIndexes[roundIndex % bandIndexes.length]];
  const [options, setOptions] = useState(() => makeOptions(COLOR_MIX_ROUNDS[0]));
  const [skillRun, setSkillRun] = useState(0);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    speak(`What color do ${round.name1} and ${round.name2} make when mixed together?`);
  }, [roundIndex, round.name1, round.name2, speak]);

  const nextRound = () => {
    const nextIndex = (roundIndex + 1) % bandIndexes.length;
    setRoundIndex(nextIndex);
    setMixed(false);
    setFeedback('');
    setLocked(false);
    setOptions(makeOptions(COLOR_MIX_ROUNDS[bandIndexes[nextIndex]]));
    setSkillRun((current) => current >= 5 ? 0 : current);
  };

  const handleMix = () => {
    setMixed(true);
    playSfx('sparkle');
    speak('Mix!');
  };

  const handlePick = (answer) => {
    if (locked) return;
    if (answer === round.answer) {
      const praise = getPraise();
      setFeedback(praise);
      setScore((s) => s + 1);
      setSkillRun((current) => Math.min(current + 1, 5));
      setLocked(true);
      playSfx('success');
      speak(`It makes ${round.answer}.`);
      onCelebrate(praise, 4, 200);
      onGameEvent?.('colormix', 'answer_correct');
      setTimeout(nextRound, 1100);
    } else {
      setShake(true);
      playSfx('wrong');
      setFeedback(`Not quite! ${round.name1} + ${round.name2} = ${round.answer}`);
      speak(`It makes ${round.answer}`);
      setTimeout(() => { setShake(false); setFeedback(''); }, 1200);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-100 via-fuchsia-100 to-purple-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-8 w-48 h-48 bg-white/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-200/60 rounded-full blur-3xl" />
      </div>
      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform" aria-label="Go back to menu"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-fuchsia-700">Color Mixing Lab</h2>
          <p className="text-fuchsia-700/70 font-semibold">Mixed: {score}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10">
        <PracticeProgress skill="Predict what two colours make" completed={skillRun} accent="fuchsia" />
        <div className="mb-6 flex flex-wrap items-center justify-center gap-4 rounded-[2.5rem] border-4 border-white/80 bg-white/45 px-5 py-8 shadow-xl sm:gap-6 sm:px-10">
          <ColourSwatch name={round.name1} />
          <span className="text-4xl font-black text-fuchsia-500">+</span>
          <ColourSwatch name={round.name2} />
          <span className="text-4xl font-black text-fuchsia-500">=</span>
          <div className={`relative transition-all duration-700 ${mixed ? 'scale-110 rotate-3' : ''}`}>
            {mixed ? <ColourSwatch name={round.answer} /> : <div className="flex h-36 w-36 items-center justify-center rounded-full border-4 border-dashed border-fuchsia-300 bg-white text-6xl text-fuchsia-300 shadow-xl">?</div>}
            {mixed && <span className="pointer-events-none absolute -right-2 -top-2 animate-ping text-2xl" aria-hidden="true">✨</span>}
          </div>
        </div>
        {!mixed && (
          <button onClick={handleMix} className="bg-fuchsia-500 text-white text-xl font-black px-8 py-4 rounded-full shadow-lg hover:bg-fuchsia-600 active:translate-y-1 transition-all mb-6">
            🧪 Mix Colors!
          </button>
        )}
        {mixed && (
          <div className={`${shake ? 'animate-shake' : ''}`}>
            <p className="text-xl font-bold text-fuchsia-700 mb-4">What color did it make?</p>
            <div className="flex gap-4 flex-wrap justify-center">
              {options.map((opt) => (
                <button key={opt} disabled={locked} onClick={() => handlePick(opt)}
                  className="bg-white text-fuchsia-700 text-xl font-bold px-6 py-4 rounded-2xl shadow-lg border-4 border-fuchsia-200 hover:-translate-y-1 transition">{opt}</button>
              ))}
            </div>
          </div>
        )}
        {feedback && <div className="mt-6 text-2xl font-black text-fuchsia-600 animate-bounce">{feedback}</div>}
      </div>
    </div>
  );
};

export default ColorMixingLab;
