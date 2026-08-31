import { useState, useEffect, useCallback, useRef } from 'react';
import { Home } from 'lucide-react';
import { getPraise } from '../../utils.js';
import { PracticeProgress, SoundToggle } from '../shared/index.jsx';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';
import { NUMBER_LINE_LIMITS } from '../../data/gameDifficulty.js';

const NumberLineJump = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent }) => {
  const difficulty = useGameDifficulty('numberline');
  const [problem, setProblem] = useState({ a: 3, b: 2, op: '+' });
  const [feedback, setFeedback] = useState('');
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [jumperPos, setJumperPos] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [jumpTrail, setJumpTrail] = useState([]);
  const [skillRun, setSkillRun] = useState(0);
  const [locked, setLocked] = useState(false);
  const [hadMistake, setHadMistake] = useState(false);
  const [animating, setAnimating] = useState(false);
  const animationTimerRef = useRef(null);
  const nextRoundTimerRef = useRef(null);

  const answer = problem.op === '+' ? problem.a + problem.b : problem.a - problem.b;
  const maxNum = NUMBER_LINE_LIMITS[difficulty] || 10;

  const newProblem = useCallback(() => {
    clearTimeout(animationTimerRef.current);
    clearTimeout(nextRoundTimerRef.current);
    const op = difficulty === 'starter' ? '+' : Math.random() > 0.5 ? '+' : '-';
    let a, b;
    if (op === '+') {
      a = Math.ceil(Math.random() * Math.max(2, Math.floor(maxNum * 0.55)));
      b = Math.ceil(Math.random() * (maxNum - a));
    } else {
      a = Math.ceil(Math.random() * (maxNum - 2)) + 2;
      b = Math.ceil(Math.random() * (a - 1)) + 1;
    }
    setProblem({ a, b, op });
    setJumperPos(op === '+' ? a : a);
    setShowAnswer(false);
    setFeedback('');
    setJumpTrail([]);
    setLocked(false);
    setHadMistake(false);
    setAnimating(false);
    setSkillRun((current) => current >= 5 ? 0 : current);
  }, [difficulty, maxNum]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    newProblem();
  }, [difficulty]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => {
    clearTimeout(animationTimerRef.current);
    clearTimeout(nextRoundTimerRef.current);
  }, []);

  useEffect(() => {
    speak(`What is ${problem.a} ${problem.op === '+' ? 'plus' : 'minus'} ${problem.b}?`);
  }, [problem, speak]);

  const handleTapNumber = (n) => {
    if (locked) return;
    if (n === answer) {
      const praise = getPraise();
      setFeedback(praise);
      setScore((s) => s + 1);
      setSkillRun((current) => Math.min(current + 1, 5));
      setLocked(true);
      const direction = problem.op === '+' ? 1 : -1;
      const trail = Array.from({ length: problem.b + 1 }, (_, index) => problem.a + index * direction);
      setJumpTrail(trail);
      setAnimating(true);
      playSfx('success');
      onCelebrate(praise, 4, 200);
      onGameEvent?.('numberline', 'answer_correct', { skill: 'number-line', item: `${problem.a}${problem.op}${problem.b}`, response: n, expected: answer, correct: true, firstAttempt: !hadMistake, independent: true, difficulty });
      const animateJump = (step) => {
        setJumperPos(trail[step]);
        if (step < trail.length - 1) {
          animationTimerRef.current = setTimeout(() => animateJump(step + 1), 260);
        } else {
          setShowAnswer(true);
          setAnimating(false);
          speak(`${praise} ${problem.a} ${problem.op === '+' ? 'plus' : 'minus'} ${problem.b} equals ${answer}!`);
          nextRoundTimerRef.current = setTimeout(newProblem, 900);
        }
      };
      animationTimerRef.current = setTimeout(() => animateJump(1), 220);
    } else {
      setHadMistake(true);
      setShake(true);
      playSfx('wrong');
      setFeedback('Try again!');
      setTimeout(() => { setShake(false); setFeedback(''); }, 800);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-100 via-amber-100 to-orange-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 right-8 w-40 h-40 bg-white/70 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-200/60 rounded-full blur-3xl" />
      </div>
      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform" aria-label="Go back to menu"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-orange-700">Number Line Jump</h2>
          <p className="text-orange-700/70 font-semibold">Score: {score}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10">
        <PracticeProgress skill="Use jumps to add and subtract" completed={skillRun} accent="orange" />
        <div className={`text-center mb-8 ${shake ? 'animate-shake' : ''}`}>
          <div className="inline-flex items-center gap-3 text-5xl font-black text-slate-800">
            <span className="bg-white px-4 py-2 rounded-2xl shadow-lg">{problem.a}</span>
            <span className="text-orange-500">{problem.op === '+' ? '+' : '−'}</span>
            <span className="bg-white px-4 py-2 rounded-2xl shadow-lg">{problem.b}</span>
            <span>=</span>
            <span className="bg-white px-4 py-2 rounded-2xl shadow-lg text-slate-400">{showAnswer ? answer : '?'}</span>
          </div>
        </div>
        <div className="relative mb-6 h-44 w-full max-w-5xl rounded-[2rem] border-4 border-white/80 bg-white/45 px-5 shadow-xl">
          <div className="absolute bottom-8 left-0 right-0 h-2 bg-orange-300 rounded-full" />
          {Array.from({ length: maxNum + 1 }, (_, i) => (
            <button key={i} disabled={locked} onClick={() => handleTapNumber(i)}
              className={`absolute bottom-7 h-10 w-10 rounded-full flex items-center justify-center text-sm font-black transition-all ${
                i === jumperPos ? 'bg-orange-500 text-white scale-125 shadow-lg' : 'bg-white text-slate-600 shadow border-2 border-orange-200'
              } ${i === answer && showAnswer ? 'ring-4 ring-green-400' : ''}`}
              style={{ left: `${(i / maxNum) * 92 + 4}%`, transform: 'translateX(-50%)' }}>{i}</button>
          ))}
          <div className="absolute text-5xl transition-all duration-[250ms] ease-in-out" aria-label={`Frog at ${jumperPos}`} style={{ left: `${(jumperPos / maxNum) * 92 + 4}%`, bottom: '76px', transform: 'translateX(-50%)' }}>🐸</div>
        </div>
        <p className="text-slate-500 font-semibold mb-2">{animating ? 'Watch the frog make each jump!' : 'Tap the number where the frog should land!'}</p>
        {jumpTrail.length > 0 && (
          <p className="mb-2 rounded-full bg-white/80 px-4 py-2 text-center font-black text-orange-700 shadow-sm" aria-live="polite">
            {problem.op === '+' ? 'Jump forward' : 'Jump back'} {problem.b} spaces: {jumpTrail.join(' → ')}
          </p>
        )}
        {feedback && <div className="mt-2 text-2xl font-black text-orange-600 animate-bounce">{feedback}</div>}
      </div>
    </div>
  );
};

export default NumberLineJump;
