import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Home } from 'lucide-react';
import { pickRandom, shuffle } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';

const MonsterMath = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [problem, setProblem] = useState({ a: 2, b: 2, ans: 4 });
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [streak, setStreak] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  const newProblem = () => {
    setSuccess(false);
    const a = Math.ceil(Math.random() * 5);
    const b = Math.ceil(Math.random() * 3);
    setProblem({ a, b, ans: a * b });
  };

  useEffect(() => {
    speak(`What is ${problem.a} times ${problem.b}?`);
  }, [problem.a, problem.b, speak]);

  const options = useMemo(() => {
    const optionsSet = new Set([problem.ans]);
    while (optionsSet.size < 3) {
      const delta = Math.ceil(Math.random() * 3);
      const sign = Math.random() > 0.5 ? 1 : -1;
      const candidate = Math.max(1, problem.ans + sign * delta);
      optionsSet.add(candidate);
    }
    return shuffle(Array.from(optionsSet));
  }, [problem.ans]);

  const check = (answer) => {
    if (answer === problem.ans) {
      const praise = getPraise();
      setSuccessMessage(praise);
      setSuccess(true);
      const newStreak = streak + 1;
      setStreak(newStreak);
      playSfx('success');
      if (newStreak >= 3) playSfx('combo');
      onCelebrate(praise, 6, 250);
      setTimeout(newProblem, 2000);
    } else {
      setShake(true);
      setStreak(0);
      playSfx('oops');
      setTimeout(() => setShake(false), 450);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-100 via-amber-100 to-orange-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-300/40 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button
          onClick={onBack}
          className="bg-white p-3 rounded-full shadow-lg z-20 hover:scale-110 transition-transform"
        >
          <Home />
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-orange-700">Stunt Jump Math</h2>
          <p className="text-orange-700/70 font-semibold">Streak: {streak}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      {streak >= 2 && (
        <div className="text-center z-20 animate-count-up">
          <span className="text-2xl font-black text-orange-600">
            {streak >= 4 ? '🔥'.repeat(streak) : '⚡'.repeat(streak)} {streak}!
          </span>
        </div>
      )}

      <div className={`mt-12 text-center z-10 px-4 ${streak >= 3 ? 'shadow-[0_0_40px_rgba(234,179,8,0.2)]' : ''}`}>
        <div
          className={`inline-flex items-center gap-4 text-6xl font-black text-slate-800 mb-10 ${
            shake ? 'animate-shake' : ''
          }`}
        >
          <div className="bg-white p-4 rounded-2xl shadow-lg border-b-8 border-slate-200">
            {problem.a}
          </div>
          <div className="text-orange-400">×</div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border-b-8 border-slate-200">
            {problem.b}
          </div>
          <div>=</div>
          <div className="w-24 h-24 border-4 border-dashed border-slate-400 rounded-2xl flex items-center justify-center text-slate-400">
            ?
          </div>
        </div>

        <div className="flex justify-center gap-6 flex-wrap">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => check(option)}
              className="w-20 h-20 bg-blue-500 text-white text-3xl font-bold rounded-2xl shadow-[0_6px_0_rgb(29,78,216)] active:shadow-none active:translate-y-2 transition-all hover:bg-blue-600"
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`absolute bottom-14 left-10 text-[80px] transition-transform duration-1000 ${
          success ? 'translate-x-[500px] -translate-y-[200px] rotate-[360deg]' : 'translate-x-0'
        }`}
      >
        🛻
      </div>
      <div className="absolute bottom-0 w-full h-14 bg-orange-900/20" />

      {success && (
        <div className="absolute top-1/2 left-0 right-0 text-center text-5xl font-black text-green-500 animate-bounce">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default MonsterMath;
