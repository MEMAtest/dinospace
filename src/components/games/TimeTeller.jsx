import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Home } from 'lucide-react';
import { pickRandom, shuffle, getPraise } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';

const TimeTeller = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [targetHour, setTargetHour] = useState(3);
  const [feedback, setFeedback] = useState('');
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);

  const newRound = useCallback(() => {
    setTargetHour(Math.ceil(Math.random() * 12));
    setFeedback('');
  }, []);

  useEffect(() => {
    speak(`Show me ${targetHour} o'clock on the clock!`);
  }, [targetHour, speak]);

  const options = useMemo(() => {
    const set = new Set([targetHour]);
    while (set.size < 4) {
      set.add(Math.ceil(Math.random() * 12));
    }
    return shuffle(Array.from(set));
  }, [targetHour]);

  const handlePick = (h) => {
    if (h === targetHour) {
      const praise = getPraise();
      setFeedback(praise);
      setScore((s) => s + 1);
      playSfx('success');
      speak(`${praise} That's ${targetHour} o'clock!`);
      onCelebrate(praise, 8, 200);
      setTimeout(newRound, 2000);
    } else {
      setShake(true);
      playSfx('wrong');
      setFeedback('Try again!');
      setTimeout(() => { setShake(false); setFeedback(''); }, 800);
    }
  };

  const hourAngle = (targetHour % 12) * 30;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-indigo-100 to-blue-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-8 w-48 h-48 bg-white/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-200/60 rounded-full blur-3xl" />
      </div>
      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform" aria-label="Go back to menu"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-indigo-700">Time Teller</h2>
          <p className="text-indigo-700/70 font-semibold">Score: {score}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10">
        <p className="text-2xl font-bold text-slate-700 mb-6">What time is this? 🕐</p>
        <div className={`relative w-52 h-52 rounded-full bg-white shadow-2xl border-8 border-indigo-200 mb-8 ${shake ? 'animate-shake' : ''}`}>
          {[...Array(12)].map((_, i) => {
            const angle = ((i + 1) * 30 - 90) * (Math.PI / 180);
            const x = 50 + 38 * Math.cos(angle);
            const y = 50 + 38 * Math.sin(angle);
            return (
              <span key={i} className="absolute text-sm font-black text-indigo-700" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>{i + 1}</span>
            );
          })}
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-indigo-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10" />
          <div className="absolute top-1/2 left-1/2 w-2 h-[60px] bg-indigo-600 rounded-full origin-bottom z-[5]"
            style={{ transform: `translate(-50%, -100%) rotate(${hourAngle}deg)` }} />
          <div className="absolute top-1/2 left-1/2 w-1 h-[80px] bg-indigo-400 rounded-full origin-bottom"
            style={{ transform: `translate(-50%, -100%) rotate(0deg)` }} />
        </div>
        <div className="flex gap-4 flex-wrap justify-center">
          {options.map((h) => (
            <button key={h} onClick={() => handlePick(h)}
              className="bg-white text-indigo-700 text-xl font-black px-6 py-4 rounded-2xl shadow-lg border-4 border-indigo-200 hover:-translate-y-1 transition">{h} o'clock</button>
          ))}
        </div>
        {feedback && <div className="mt-4 text-2xl font-black text-indigo-600 animate-bounce">{feedback}</div>}
      </div>
    </div>
  );
};

export default TimeTeller;
