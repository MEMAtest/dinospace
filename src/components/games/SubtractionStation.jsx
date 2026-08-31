import { useState, useEffect, useRef } from 'react';
import { Home } from 'lucide-react';
import { SUBTRACTION_LEVELS, VISUAL_EMOJIS } from '../../data/index.js';
import { pickRandom, shuffle, getPraise } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';
import { getDifficultyIndex, useGameDifficulty } from '../../hooks/useGameDifficulty.js';

const makeAnswerOptions = (answer) => {
  const candidates = [answer];
  for (let offset = 1; candidates.length < 4; offset += 1) {
    if (answer - offset >= 0) candidates.push(answer - offset);
    if (candidates.length < 4) candidates.push(answer + offset);
  }
  return shuffle(candidates);
};

const makeSubtractionRound = (level) => {
  const a = Math.ceil(Math.random() * level.maxNum) + Math.ceil(Math.random() * 3);
  const b = Math.ceil(Math.random() * Math.min(a, level.maxNum));
  return {
    a,
    b,
    visualEmoji: pickRandom(VISUAL_EMOJIS),
    options: makeAnswerOptions(a - b),
  };
};

const CounterFrame = ({ count, removed, emoji }) => (
  <div role="group" aria-label={`${count} counters, ${removed} taken away`} className="rounded-2xl bg-white/90 px-3 py-2 shadow">
    <p className="mb-1 text-xs font-black uppercase tracking-wide text-purple-700">Count what is left</p>
    <div className="grid grid-cols-5 gap-1" aria-hidden="true">
      {Array.from({ length: Math.max(10, count) }, (_, index) => {
        const taken = index >= count - removed && index < count;
        return (
          <span key={index} className={`relative flex h-8 w-8 items-center justify-center rounded-md border text-lg ${taken ? 'border-rose-200 bg-rose-50 opacity-60' : index < count ? 'border-purple-200 bg-purple-50' : 'border-dashed border-slate-200 bg-slate-50'}`}>
            {index < count ? emoji : ''}
            {taken && <span className="absolute inset-0 flex items-center justify-center text-base font-black text-rose-600">×</span>}
          </span>
        );
      })}
    </div>
  </div>
);

const SubtractionStation = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent }) => {
  const difficulty = useGameDifficulty('subtraction');
  const [levelIndex, setLevelIndex] = useState(() => getDifficultyIndex(difficulty));
  const level = SUBTRACTION_LEVELS[levelIndex];
  const [round, setRound] = useState(0);
  const [problem, setProblem] = useState(() => makeSubtractionRound(SUBTRACTION_LEVELS[0]));
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [streak, setStreak] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [feedback, setFeedback] = useState('');
  const [locked, setLocked] = useState(false);
  const [hadMistake, setHadMistake] = useState(false);

  useEffect(() => {
    const nextLevelIndex = getDifficultyIndex(difficulty);
    // Difficulty changes are an external parent-setting subscription.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLevelIndex(nextLevelIndex);
    setRound(0);
    setProblem(makeSubtractionRound(SUBTRACTION_LEVELS[nextLevelIndex]));
    setLocked(false);
    setHadMistake(false);
  }, [difficulty]);

  const newProblem = (nextLevel = level) => {
    setSuccess(false);
    setFeedback('');
    setProblem(makeSubtractionRound(nextLevel));
    setLocked(false);
    setHadMistake(false);
  };

  useEffect(() => {
    speak(`What is ${problem.a} minus ${problem.b}?`);
  }, [problem.a, problem.b, speak]);

  const answer = problem.a - problem.b;
  const subTimeoutRef = useRef(null);
  useEffect(() => () => { if (subTimeoutRef.current) clearTimeout(subTimeoutRef.current); }, []);
  const check = (pick) => {
    if (locked) return;
    if (pick === answer) {
      const praise = getPraise();
      setSuccessMessage(praise);
      setFeedback('');
      setSuccess(true);
      setLocked(true);
      const newStreak = streak + 1;
      setStreak(newStreak);
      playSfx('success');
      if (newStreak >= 3) playSfx('combo');
      onCelebrate(newStreak === 5 ? 'Five in a row — Super Star bonus!' : praise, newStreak === 5 ? 16 : 6, 250);
      onGameEvent?.('subtraction', 'answer_correct', { skill: 'subtraction', item: `${problem.a}-${problem.b}`, response: pick, expected: answer, correct: true, firstAttempt: !hadMistake, independent: true, difficulty });
      const nextRound = round + 1;
      if (nextRound >= level.rounds && levelIndex < SUBTRACTION_LEVELS.length - 1) {
        const nextLevelIndex = levelIndex + 1;
        subTimeoutRef.current = setTimeout(() => {
          setLevelIndex(nextLevelIndex);
          setRound(0);
          newProblem(SUBTRACTION_LEVELS[nextLevelIndex]);
        }, 1100);
      } else {
        setRound(nextRound);
        subTimeoutRef.current = setTimeout(newProblem, 1100);
      }
    } else {
      setHadMistake(true);
      setShake(true);
      setStreak(0);
      playSfx('wrong');
      setFeedback('Try taking away the crossed-out counters.');
      subTimeoutRef.current = setTimeout(() => setShake(false), 450);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 via-violet-100 to-purple-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-300/40 rounded-full blur-3xl" />
      </div>
      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg z-20 hover:scale-110 transition-transform" aria-label="Go back to menu"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-purple-700">Subtraction Station</h2>
          <p className="text-purple-700/70 font-semibold">{level.emoji} {level.name} · Streak: {streak}</p>
          <p className="text-purple-700/50 text-sm font-semibold">Level {levelIndex + 1}/{SUBTRACTION_LEVELS.length}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>
      {streak >= 2 && (
        <div className="text-center z-20 animate-count-up">
          <span className="text-2xl font-black text-purple-600">
            {streak >= 4 ? '🔥'.repeat(streak) : '⚡'.repeat(streak)} {streak}!
          </span>
        </div>
      )}
      <main className={`z-10 mx-auto mt-4 w-[calc(100%-2rem)] max-w-5xl rounded-[2.5rem] border-4 border-white/80 bg-white/60 px-6 py-6 text-center shadow-2xl backdrop-blur-sm ${streak >= 3 ? 'shadow-[0_0_40px_rgba(234,179,8,0.2)]' : ''}`}>
        {level.maxNum <= 10 && (
          <div className="mb-4 flex justify-center">
            <CounterFrame count={problem.a} removed={problem.b} emoji={problem.visualEmoji} />
          </div>
        )}
        <div className={`inline-flex items-center gap-4 text-6xl font-black text-slate-800 mb-8 ${shake ? 'animate-shake' : ''}`}>
          <div className="bg-white p-4 rounded-2xl shadow-lg border-b-8 border-slate-200">{problem.a}</div>
          <div className="text-purple-500">−</div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border-b-8 border-slate-200">{problem.b}</div>
          <div>=</div>
          <div className="w-24 h-24 border-4 border-dashed border-slate-400 rounded-2xl flex items-center justify-center text-slate-400">?</div>
        </div>
        <div className="flex justify-center gap-4 flex-wrap">
          {problem.options.map((option) => (
            <button key={option} disabled={locked} onClick={() => check(option)} className="h-20 w-28 bg-purple-500 text-white text-3xl font-bold rounded-2xl shadow-[0_6px_0_rgb(126,34,206)] active:shadow-none active:translate-y-2 transition-all hover:bg-purple-600 disabled:opacity-60">{option}</button>
          ))}
        </div>
        {feedback && <p className="mt-4 text-lg font-black text-purple-700" role="status">{feedback}</p>}
      </main>
      <div className={`absolute bottom-14 left-10 text-[80px] transition-transform duration-1000 ${success ? 'translate-x-[500px] -translate-y-[200px] rotate-[360deg]' : 'translate-x-0'}`}>🛸</div>
      <div className="absolute bottom-0 w-full h-14 bg-purple-900/20" />
      {success && <div className="absolute top-1/2 left-0 right-0 text-center text-5xl font-black text-purple-500 animate-bounce">{successMessage}</div>}
    </div>
  );
};

export default SubtractionStation;
