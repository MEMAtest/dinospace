import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { shuffle, getPraise } from '../../utils.js';
import { PracticeProgress, SoundToggle } from '../shared/index.jsx';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';
import observatoryScene from '../../assets/game-scenes/time-observatory.webp';
import './amariScenes.css';

const timeLabel = ({ hour, minute }) => minute === 0 ? `${hour} o'clock` : minute === 30 ? `half past ${hour}` : minute === 15 ? `quarter past ${hour}` : `quarter to ${hour === 12 ? 1 : hour + 1}`;

const minutePoolFor = (difficulty) => difficulty === 'starter' ? [0] : difficulty === 'growing' ? [0, 30] : [0, 15, 30, 45];

// Distractors vary the hour and, when the band has more than one minute value,
// the minute too, so the child has to read both hands.
const buildTimeOptions = (target, minutePool = [target.minute], count = 4) => {
  const wrap = (hour) => ((hour - 1 + 12) % 12) + 1;
  const options = [target];
  const seen = new Set([timeLabel(target)]);
  const add = (option) => {
    if (options.length >= count || seen.has(timeLabel(option))) return;
    seen.add(timeLabel(option));
    options.push(option);
  };
  const otherMinutes = shuffle(minutePool.filter((minute) => minute !== target.minute));
  if (otherMinutes.length) add({ hour: target.hour, minute: otherMinutes[0] });
  [1, 3, -2, 2, -1, 4, -3, 5].forEach((offset) => {
    add({ hour: wrap(target.hour + offset), minute: shuffle(minutePool)[0] });
  });
  return shuffle(options);
};

const pickNextTarget = (previous, minutePool) => {
  let next = previous;
  for (let attempt = 0; attempt < 20 && next.hour === previous.hour; attempt += 1) {
    next = { hour: 1 + Math.floor(Math.random() * 12), minute: shuffle(minutePool)[0] };
  }
  return next;
};

// SVG hands rotate around one shared centre. CSS translate-before-rotate put
// the previous hands in the wrong position on some viewport sizes.
const ClockFace = ({ hour, minute }) => {
  const hourAngle = (hour % 12) * 30 + minute * 0.5;
  const minuteAngle = minute * 6;
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label="Analogue clock" className="h-full w-full drop-shadow-[0_10px_10px_rgba(4,22,82,.3)]">
      <circle cx="100" cy="100" r="96" fill="#ffcc54" stroke="#f09420" strokeWidth="5" />
      <circle cx="100" cy="100" r="87" fill="#fffefa" stroke="#fff" strokeWidth="5" />
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index + 1) * Math.PI / 6 - Math.PI / 2;
        return <text key={index} x={100 + 68 * Math.cos(angle)} y={100 + 68 * Math.sin(angle)} textAnchor="middle" dominantBaseline="central" fill="#0b2d86" fontWeight="900" fontSize="17">{index + 1}</text>;
      })}
      <line x1="100" y1="100" x2="100" y2="56" stroke="#f14937" strokeWidth="11" strokeLinecap="round" transform={`rotate(${hourAngle} 100 100)`} />
      <line x1="100" y1="100" x2="100" y2="31" stroke="#0878ec" strokeWidth="7" strokeLinecap="round" transform={`rotate(${minuteAngle} 100 100)`} />
      <circle cx="100" cy="100" r="9" fill="#ffc331" stroke="#f09019" strokeWidth="3" />
    </svg>
  );
};

const TimeTeller = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent }) => {
  const difficulty = useGameDifficulty('timeteller');
  const [target, setTarget] = useState({ hour: 3, minute: 0 });
  const [feedback, setFeedback] = useState('');
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [skillRun, setSkillRun] = useState(0);
  const [locked, setLocked] = useState(false);
  const [options, setOptions] = useState(() => buildTimeOptions({ hour: 3, minute: 0 }, minutePoolFor(difficulty), difficulty === 'challenge' ? 4 : 3));
  const [hadMistake, setHadMistake] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const timeoutRef = useRef(null);

  const newRound = () => {
    const minutePool = minutePoolFor(difficulty);
    const nextTarget = pickNextTarget(target, minutePool);
    setTarget(nextTarget);
    setOptions(buildTimeOptions(nextTarget, minutePool, difficulty === 'challenge' ? 4 : 3));
    setFeedback('');
    setLocked(false);
    setHadMistake(false);
    setUsedHint(false);
    setSkillRun((current) => current >= 5 ? 0 : current);
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  useEffect(() => {
    // Keep the answer hidden until the child has studied the hands.
    speak('Look carefully at the clock. What time is shown?');
  }, [target, speak]);

  const giveHint = () => {
    setUsedHint(true);
    speak('The short red hand shows the hour. The long blue hand shows the minutes.');
  };

  const handlePick = (h) => {
    if (locked) return;
    clearTimeout(timeoutRef.current);
    if (h.hour === target.hour && h.minute === target.minute) {
      const praise = getPraise();
      setShake(false);
      setFeedback(praise);
      setScore((s) => s + 1);
      setSkillRun((current) => Math.min(current + 1, 5));
      setLocked(true);
      playSfx('success');
      speak(`The time is ${timeLabel(target)}.`);
      onCelebrate(praise, 4, 200);
      onGameEvent?.('timeteller', 'answer_correct', { skill: 'telling-time', item: timeLabel(target), response: timeLabel(h), expected: timeLabel(target), correct: true, firstAttempt: !hadMistake, independent: !hadMistake && !usedHint, hints: usedHint ? 1 : 0, difficulty });
      timeoutRef.current = setTimeout(newRound, 1100);
    } else {
      setHadMistake(true);
      setShake(true);
      playSfx('wrong');
      setFeedback(h.hour !== target.hour ? 'Look where the short red hand points.' : 'Look where the long blue hand points.');
      onGameEvent?.('timeteller', 'answer_wrong', { skill: 'telling-time', item: timeLabel(target), response: timeLabel(h), expected: timeLabel(target), correct: false, firstAttempt: !hadMistake, independent: false, difficulty });
      timeoutRef.current = setTimeout(() => { setShake(false); setFeedback(''); }, 800);
    }
  };

  return (
    <div className="amari-scene flex flex-col" style={{ '--scene-image': `url("${observatoryScene}")` }}>
      <header className="amari-scene-header relative z-20">
        <button onClick={onBack} className="game-icon-button" aria-label="Back to home"><ArrowLeft /></button>
        <div className="amari-scene-title">
          <h2 className="text-lg sm:text-2xl">🕒 Time Teller</h2>
          <p className="text-xs text-sky-100">⭐ {score} {score === 1 ? 'star' : 'stars'}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </header>
      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-3 px-3 pb-5 sm:gap-5">
        <div className="rounded-full bg-white/90 px-3 shadow-lg">
          <PracticeProgress skill={difficulty === 'starter' ? 'Read whole-hour clocks' : difficulty === 'growing' ? 'Read half-hour clocks' : 'Read quarter-hour clocks'} completed={skillRun} accent="indigo" />
        </div>
        <div className="amari-scene-prompt flex w-full max-w-md items-center justify-center gap-3 px-4 py-3 text-center text-xl sm:text-2xl">
          <button type="button" onClick={() => speak('Look carefully at the clock. What time is shown?')} aria-label="Hear the question" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-600 text-white shadow-[0_4px_0_#06449e]"><Volume2 /></button>
          What time is it?
        </div>
        <div className={`relative h-[min(37vh,285px)] min-h-[190px] w-[min(67vw,285px)] rounded-full ${shake ? 'animate-shake' : ''}`}>
          <ClockFace hour={target.hour} minute={target.minute} />
        </div>
        <button type="button" onClick={giveHint} className="rounded-full border-2 border-white/80 bg-blue-900/90 px-4 py-2 text-sm font-black text-white shadow-lg">
          🔊 Need a hand clue?
        </button>
        <div className={`grid w-full max-w-2xl gap-2 sm:gap-4 ${options.length === 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {options.map((h) => (
            <button key={`${h.hour}-${h.minute}`} onClick={() => handlePick(h)} disabled={locked}
              className="amari-choice flex min-h-20 items-center justify-center px-2 py-2 text-center text-sm leading-tight sm:min-h-24 sm:text-xl">{timeLabel(h)}</button>
          ))}
        </div>
        {feedback && <div className="amari-scene-card px-4 py-2 text-center text-base font-black text-blue-900" aria-live="polite">{feedback}</div>}
      </main>
    </div>
  );
};

export default TimeTeller;
