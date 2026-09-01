import { useState, useEffect, useRef } from 'react';
import { Home } from 'lucide-react';
import { shuffle, getPraise } from '../../utils.js';
import { PracticeProgress, SoundToggle } from '../shared/index.jsx';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';

const timeLabel = ({ hour, minute }) => minute === 0 ? `${hour} o'clock` : minute === 30 ? `half past ${hour}` : minute === 15 ? `quarter past ${hour}` : `quarter to ${hour === 12 ? 1 : hour + 1}`;

const buildTimeOptions = (target) => {
  const wrap = (hour) => ((hour - 1 + 12) % 12) + 1;
  return shuffle([target, { ...target, hour: wrap(target.hour + 1) }, { ...target, hour: wrap(target.hour + 3) }, { ...target, hour: wrap(target.hour - 2) }]);
};

const TimeTeller = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent }) => {
  const difficulty = useGameDifficulty('timeteller');
  const [target, setTarget] = useState({ hour: 3, minute: 0 });
  const [feedback, setFeedback] = useState('');
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [skillRun, setSkillRun] = useState(0);
  const [locked, setLocked] = useState(false);
  const [options, setOptions] = useState(() => buildTimeOptions({ hour: 3, minute: 0 }));
  const [hadMistake, setHadMistake] = useState(false);
  const timeoutRef = useRef(null);

  const newRound = () => {
    const nextHour = target.hour === 12 ? 1 : target.hour + 1;
    const minutePool = difficulty === 'starter' ? [0] : difficulty === 'growing' ? [0, 30] : [0, 15, 30, 45];
    const nextTarget = { hour: nextHour, minute: minutePool[(nextHour + score) % minutePool.length] };
    setTarget(nextTarget);
    setOptions(buildTimeOptions(nextTarget));
    setFeedback('');
    setLocked(false);
    setHadMistake(false);
    setSkillRun((current) => current >= 5 ? 0 : current);
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  useEffect(() => {
    // Keep the answer hidden until the child has studied the hands.
    speak('Look carefully at the clock. What time is shown?');
  }, [target, speak]);

  const handlePick = (h) => {
    if (locked) return;
    if (h.hour === target.hour && h.minute === target.minute) {
      const praise = getPraise();
      setFeedback(praise);
      setScore((s) => s + 1);
      setSkillRun((current) => Math.min(current + 1, 5));
      setLocked(true);
      playSfx('success');
      speak(`The time is ${timeLabel(target)}.`);
      onCelebrate(praise, 4, 200);
      onGameEvent?.('timeteller', 'answer_correct', { skill: 'telling-time', item: timeLabel(target), response: timeLabel(h), expected: timeLabel(target), correct: true, firstAttempt: !hadMistake, independent: true, difficulty });
      timeoutRef.current = setTimeout(newRound, 1100);
    } else {
      setHadMistake(true);
      setShake(true);
      playSfx('wrong');
      setFeedback('Look at the short hand and the long hand.');
      timeoutRef.current = setTimeout(() => { setShake(false); setFeedback(''); }, 800);
    }
  };

  const hourAngle = (target.hour % 12) * 30 + target.minute * 0.5;
  const minuteAngle = target.minute * 6;

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
        <PracticeProgress skill={difficulty === 'starter' ? 'Read whole-hour clocks' : difficulty === 'growing' ? 'Read half-hour clocks' : 'Read quarter-hour clocks'} completed={skillRun} accent="indigo" />
        <p className="mb-1 text-3xl font-black text-slate-700">What time is this? 🕐</p>
        <p className="mb-3 text-sm font-bold text-indigo-700/70">Short hand = hour · long hand = minutes</p>
        <button
          type="button"
          onClick={() => speak(`The clock shows ${timeLabel(target)}.`)}
          aria-label="Hear a time clue"
          className={`relative mb-5 h-80 w-80 rounded-full border-[12px] border-indigo-300 bg-white shadow-[0_20px_45px_rgba(67,56,202,.25),inset_0_0_35px_rgba(99,102,241,.08)] ${shake ? 'animate-shake' : ''}`}
        >
          {[...Array(12)].map((_, i) => {
            const angle = ((i + 1) * 30 - 90) * (Math.PI / 180);
            const x = 50 + 38 * Math.cos(angle);
            const y = 50 + 38 * Math.sin(angle);
            return (
              <span key={i} className="absolute text-xl font-black text-indigo-800" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>{i + 1}</span>
            );
          })}
          <div className="absolute top-1/2 left-1/2 h-5 w-5 bg-indigo-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10" />
          <div className="absolute top-1/2 left-1/2 w-3 h-[92px] bg-indigo-600 rounded-full origin-bottom z-[5]"
            style={{ transform: `translate(-50%, -100%) rotate(${hourAngle}deg)` }} />
          <div className="absolute top-1/2 left-1/2 w-2 h-[120px] bg-indigo-400 rounded-full origin-bottom"
            style={{ transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)` }} />
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-600">Tap for a clue</span>
        </button>
        <div className="flex gap-4 flex-wrap justify-center">
          {options.map((h) => (
            <button key={`${h.hour}-${h.minute}`} onClick={() => handlePick(h)} disabled={locked}
              className="min-w-44 bg-white text-indigo-700 text-xl font-black px-7 py-4 rounded-2xl shadow-lg border-4 border-indigo-200 hover:-translate-y-1 transition">{timeLabel(h)}</button>
          ))}
        </div>
        {feedback && <div className="mt-4 text-2xl font-black text-indigo-600 animate-bounce">{feedback}</div>}
      </div>
    </div>
  );
};

export default TimeTeller;
