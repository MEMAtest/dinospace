import { useState, useEffect } from 'react';
import { Home } from 'lucide-react';
import { COLOR_MIX_ROUNDS } from '../../data/index.js';
import { shuffle, getPraise } from '../../utils.js';
import { PracticeProgress, SoundToggle } from '../shared/index.jsx';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';
import { colourRoundIndexes } from '../../data/gameDifficulty.js';
import { SESSION_LEVELS } from '../../data/sessionLevels.js';

const makeOptions = (round) => shuffle(round.options);

const COLOUR_HEX = {
  Red: '#ef4444', Yellow: '#facc15', Blue: '#3b82f6', White: '#f8fafc',
  Black: '#0f172a', Orange: '#f97316', Purple: '#a855f7', Green: '#22c55e',
  Pink: '#f472b6', 'Light Blue': '#67e8f9', Brown: '#92400e', Grey: '#94a3b8',
  Silver: '#c0c0c0',
};

const FALLBACK_HEX = '#cbd5e1';

// Options must be exactly the current round's set; anything else is stale.
const optionsMatchRound = (options, round) => (
  options.length === round.options.length && round.options.every((option) => options.includes(option))
);

const ColourSwatch = ({ name, size = 'h-36 w-36' }) => (
  <div
    className={`relative flex ${size} items-center justify-center rounded-full border-4 border-white shadow-[inset_-10px_-12px_18px_rgba(15,23,42,.16),0_12px_20px_rgba(15,23,42,.16)]`}
    style={{ backgroundColor: COLOUR_HEX[name] || FALLBACK_HEX }}
    aria-label={`${name} paint`}
  >
    <span className="absolute left-[22%] top-[18%] h-5 w-10 rotate-[-25deg] rounded-full bg-white/45 blur-[1px]" aria-hidden="true" />
  </div>
);

const ColorMixingLab = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent, onReviewComplete, sessionLevel = 0, sessionTarget: providedSessionTarget }) => {
  // GameSession remounts the game for each replay or level, so this snapshot
  // keeps both the question pool and its answer choices steady for that run.
  const currentDifficulty = useGameDifficulty('colormix');
  const [difficulty] = useState(currentDifficulty);
  const sessionTarget = providedSessionTarget || SESSION_LEVELS.colormix[sessionLevel]?.target || 6;
  const [roundIndex, setRoundIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const bandIndexes = colourRoundIndexes(difficulty);
  const round = COLOR_MIX_ROUNDS[bandIndexes[roundIndex % bandIndexes.length]];
  const [options, setOptions] = useState(() => makeOptions(COLOR_MIX_ROUNDS[colourRoundIndexes(difficulty)[0]]));
  const visibleOptions = optionsMatchRound(options, round) ? options : round.options;
  const [skillRun, setSkillRun] = useState(0);
  const [locked, setLocked] = useState(false);
  const [hadMistake, setHadMistake] = useState(false);
  const progressTarget = sessionTarget || 5;
  const progressCompleted = sessionTarget > 0 ? score : skillRun;

  useEffect(() => {
    speak(`What colour do ${round.name1} and ${round.name2} make when mixed together?`);
  }, [roundIndex, round.name1, round.name2, speak]);

  const nextRound = () => {
    const nextIndex = (roundIndex + 1) % bandIndexes.length;
    setRoundIndex(nextIndex);
    setFeedback('');
    setLocked(false);
    setHadMistake(false);
    setOptions(makeOptions(COLOR_MIX_ROUNDS[bandIndexes[nextIndex]]));
    setSkillRun((current) => current >= 5 ? 0 : current);
  };

  const handlePick = (answer) => {
    if (locked) return;
    const attempt = { skill: 'colormix', item: `${round.name1}+${round.name2}`, response: answer, expected: round.answer, firstAttempt: !hadMistake, independent: !hadMistake, hints: 0, difficulty };
    if (answer === round.answer) {
      const praise = getPraise();
      const explanation = round.name1 === 'Black' && round.name2 === 'White'
          ? 'Black and white paint blend together to make grey.'
          : round.name2 === 'White'
          ? `White makes ${round.answer.toLowerCase()} paint lighter.`
          : `Mixing ${round.name1.toLowerCase()} and ${round.name2.toLowerCase()} paint makes ${round.answer.toLowerCase()}.`;
      setFeedback(`${praise} ${explanation}`);
      setScore((s) => s + 1);
      setSkillRun((current) => Math.min(current + 1, 5));
      setLocked(true);
      playSfx('success');
      speak(`${round.answer}. ${explanation}`);
      onCelebrate(praise, 4, 200);
      onGameEvent?.('colormix', 'answer_correct', { ...attempt, correct: true, deferFinish: sessionTarget > 0 && score + 1 >= sessionTarget });
    } else {
      onGameEvent?.('colormix', 'answer_wrong', { ...attempt, correct: false });
      setHadMistake(true);
      playSfx('wrong');
      setFeedback('Have another try. Think about what these paint colours make when they blend.');
      speak('Have another try. Think about what these paint colours make when they blend.');
    }
  };

  const handleNext = () => {
    if (sessionTarget > 0 && score >= sessionTarget) onReviewComplete?.();
    else nextRound();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-100 via-fuchsia-100 to-purple-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-8 w-48 h-48 bg-white/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-200/60 rounded-full blur-3xl" />
      </div>
      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="game-icon-button" aria-label="Back to home"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-fuchsia-700">Colour Mixing Lab</h2>
          <p className="text-fuchsia-700/70 font-semibold">Mixed: {score}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10">
        {sessionTarget > 0
          ? <p className="mb-4 rounded-full bg-white/80 px-4 py-2 text-sm font-black text-fuchsia-800" aria-live="polite">Answers completed: {score} of {sessionTarget}</p>
          : <PracticeProgress skill="Predict what two colours make" completed={progressCompleted} target={progressTarget} accent="fuchsia" />}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-4 rounded-[2.5rem] border-4 border-white/80 bg-white/45 px-5 py-8 shadow-xl sm:gap-6 sm:px-10">
          <ColourSwatch name={round.name1} />
          <span className="text-4xl font-black text-fuchsia-500">+</span>
          <ColourSwatch name={round.name2} />
          <span className="text-4xl font-black text-fuchsia-500">=</span>
          <div className={`relative transition-all duration-700 ${locked ? 'scale-110 rotate-3' : ''}`}>
            {locked ? <ColourSwatch name={round.answer} /> : <div className="flex h-36 w-36 items-center justify-center rounded-full border-4 border-dashed border-fuchsia-300 bg-white text-6xl text-fuchsia-300 shadow-xl">?</div>}
            {locked && <span className="pointer-events-none absolute -right-2 -top-2 animate-ping text-2xl" aria-hidden="true">✨</span>}
          </div>
        </div>
        <div>
          <p className="text-xl font-bold text-fuchsia-700 mb-4">{locked ? 'Result: here is what the paints made.' : 'Predict first: which colour will these paints make?'}</p>
          <div className="flex gap-4 flex-wrap justify-center">
            {visibleOptions.map((opt) => (
              <button key={opt} disabled={locked} onClick={() => handlePick(opt)} aria-label={`Predict ${opt}`}
                className="flex items-center gap-3 bg-white text-fuchsia-700 text-xl font-bold px-6 py-4 rounded-2xl shadow-lg border-4 border-fuchsia-200 hover:-translate-y-1 transition disabled:cursor-default disabled:hover:translate-y-0">
                <span className="h-8 w-8 shrink-0 rounded-full border-2 border-slate-200 shadow-inner" style={{ backgroundColor: COLOUR_HEX[opt] || FALLBACK_HEX }} aria-hidden="true" />
                {opt}
              </button>
            ))}
          </div>
        </div>
        {feedback && <div className="mt-6 max-w-2xl rounded-2xl bg-white/80 px-5 py-3 text-xl font-black text-fuchsia-700" aria-live="polite">{feedback}</div>}
        {locked && <button type="button" onClick={handleNext} className="mt-5 rounded-full bg-fuchsia-600 px-10 py-4 text-xl font-black text-white shadow-lg hover:bg-fuchsia-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-indigo-700">Next</button>}
      </div>
    </div>
  );
};

export default ColorMixingLab;
