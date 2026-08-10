import { useState, useEffect, useRef } from 'react';
import { Home } from 'lucide-react';
import { ADDITION_LEVELS, VISUAL_EMOJIS } from '../../data/index.js';
import { pickRandom, shuffle, getPraise } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';

const makeAnswerOptions = (answer) => {
  const candidates = [answer];
  for (let offset = 1; candidates.length < 4; offset += 1) {
    if (answer - offset >= 0) candidates.push(answer - offset);
    if (candidates.length < 4) candidates.push(answer + offset);
  }
  return shuffle(candidates);
};

const makeAdditionRound = (level) => {
  const a = Math.ceil(Math.random() * level.maxNum);
  const b = Math.ceil(Math.random() * level.maxNum);
  return {
    a,
    b,
    visualEmoji: pickRandom(VISUAL_EMOJIS),
    options: makeAnswerOptions(a + b),
  };
};

const AdditionAdventure = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent }) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = ADDITION_LEVELS[levelIndex];
  const [round, setRound] = useState(0);
  const [problem, setProblem] = useState(() => makeAdditionRound(ADDITION_LEVELS[0]));
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [streak, setStreak] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [locked, setLocked] = useState(false);

  const newProblem = (nextLevel = level) => {
    setSuccess(false);
    setProblem(makeAdditionRound(nextLevel));
    setLocked(false);
  };

  useEffect(() => {
    speak(`What is ${problem.a} plus ${problem.b}?`);
  }, [problem.a, problem.b, speak]);

  const answer = problem.a + problem.b;
  const addTimeoutRef = useRef(null);
  useEffect(() => () => { if (addTimeoutRef.current) clearTimeout(addTimeoutRef.current); }, []);
  const check = (pick) => {
    if (locked) return;
    if (pick === answer) {
      const praise = getPraise();
      setSuccessMessage(praise);
      setSuccess(true);
      setLocked(true);
      const newStreak = streak + 1;
      setStreak(newStreak);
      playSfx('success');
      if (newStreak >= 3) playSfx('combo');
      onCelebrate(praise, 6, 250);
      onGameEvent?.('addition', 'answer_correct');
      const nextRound = round + 1;
      if (nextRound >= level.rounds && levelIndex < ADDITION_LEVELS.length - 1) {
        const nextLevelIndex = levelIndex + 1;
        addTimeoutRef.current = setTimeout(() => {
          setLevelIndex(nextLevelIndex);
          setRound(0);
          newProblem(ADDITION_LEVELS[nextLevelIndex]);
        }, 1100);
      } else {
        setRound(nextRound);
        addTimeoutRef.current = setTimeout(newProblem, 1100);
      }
    } else {
      setShake(true);
      setStreak(0);
      playSfx('wrong');
      addTimeoutRef.current = setTimeout(() => setShake(false), 450);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-100 via-emerald-100 to-teal-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-green-300/40 rounded-full blur-3xl" />
      </div>
      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg z-20 hover:scale-110 transition-transform" aria-label="Go back to menu"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-emerald-700">Addition Adventure</h2>
          <p className="text-emerald-700/70 font-semibold">{level.emoji} {level.name} · Streak: {streak}</p>
          <p className="text-emerald-700/50 text-sm font-semibold">Level {levelIndex + 1}/{ADDITION_LEVELS.length}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>
      {streak >= 2 && (
        <div className="text-center z-20 animate-count-up">
          <span className="text-2xl font-black text-emerald-600">
            {streak >= 4 ? '🔥'.repeat(streak) : '⚡'.repeat(streak)} {streak}!
          </span>
        </div>
      )}
      <main className={`z-10 mx-auto mt-4 w-[calc(100%-2rem)] max-w-5xl rounded-[2.5rem] border-4 border-white/80 bg-white/60 px-6 py-6 text-center shadow-2xl backdrop-blur-sm ${streak >= 3 ? 'shadow-[0_0_40px_rgba(234,179,8,0.2)]' : ''}`}>
        {level.maxNum <= 10 && (
          <div className="flex justify-center items-center gap-3 mb-4 flex-wrap">
            <div className="flex min-h-20 min-w-48 flex-wrap items-center justify-center gap-2 rounded-2xl bg-white/90 px-5 py-3 shadow">
              {Array.from({ length: problem.a }, (_, i) => <span key={`a-${i}`} className="text-3xl">{problem.visualEmoji}</span>)}
            </div>
            <span className="text-3xl font-black text-emerald-500">+</span>
            <div className="flex min-h-20 min-w-48 flex-wrap items-center justify-center gap-2 rounded-2xl bg-white/90 px-5 py-3 shadow">
              {Array.from({ length: problem.b }, (_, i) => <span key={`b-${i}`} className="text-3xl">{problem.visualEmoji}</span>)}
            </div>
          </div>
        )}
        <div className={`inline-flex items-center gap-4 text-6xl font-black text-slate-800 mb-8 ${shake ? 'animate-shake' : ''}`}>
          <div className="bg-white p-4 rounded-2xl shadow-lg border-b-8 border-slate-200">{problem.a}</div>
          <div className="text-emerald-500">+</div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border-b-8 border-slate-200">{problem.b}</div>
          <div>=</div>
          <div className="w-24 h-24 border-4 border-dashed border-slate-400 rounded-2xl flex items-center justify-center text-slate-400">?</div>
        </div>
        <div className="flex justify-center gap-4 flex-wrap">
          {problem.options.map((option) => (
            <button key={option} disabled={locked} onClick={() => check(option)} className="h-20 w-28 bg-emerald-500 text-white text-3xl font-bold rounded-2xl shadow-[0_6px_0_rgb(5,150,105)] active:shadow-none active:translate-y-2 transition-all hover:bg-emerald-600 disabled:opacity-60">{option}</button>
          ))}
        </div>
      </main>
      <div className={`absolute bottom-14 left-10 text-[80px] transition-transform duration-1000 ${success ? 'translate-x-[500px] -translate-y-[200px] rotate-[360deg]' : 'translate-x-0'}`}>🚀</div>
      <div className="absolute bottom-0 w-full h-14 bg-emerald-900/20" />
      {success && <div className="absolute top-1/2 left-0 right-0 text-center text-5xl font-black text-green-500 animate-bounce">{successMessage}</div>}
    </div>
  );
};

export default AdditionAdventure;
