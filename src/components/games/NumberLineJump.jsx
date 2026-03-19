import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Home } from 'lucide-react';
import { pickRandom } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';

const NumberLineJump = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [problem, setProblem] = useState({ a: 3, b: 2, op: '+' });
  const [feedback, setFeedback] = useState('');
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [jumperPos, setJumperPos] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const answer = problem.op === '+' ? problem.a + problem.b : problem.a - problem.b;
  const maxNum = 15;

  const newProblem = useCallback(() => {
    const op = Math.random() > 0.5 ? '+' : '-';
    let a, b;
    if (op === '+') {
      a = Math.ceil(Math.random() * 8);
      b = Math.ceil(Math.random() * (maxNum - a));
    } else {
      a = Math.ceil(Math.random() * 10) + 2;
      b = Math.ceil(Math.random() * (a - 1)) + 1;
    }
    setProblem({ a, b, op });
    setJumperPos(op === '+' ? a : a);
    setShowAnswer(false);
    setFeedback('');
  }, []);

  useEffect(() => {
    setJumperPos(problem.a);
    speak(`What is ${problem.a} ${problem.op === '+' ? 'plus' : 'minus'} ${problem.b}?`);
  }, [problem, speak]);

  const handleTapNumber = (n) => {
    if (n === answer) {
      const praise = getPraise();
      setFeedback(praise);
      setScore((s) => s + 1);
      setShowAnswer(true);
      setJumperPos(answer);
      playSfx('success');
      speak(`${praise} ${problem.a} ${problem.op === '+' ? 'plus' : 'minus'} ${problem.b} equals ${answer}!`);
      onCelebrate(praise, 8, 200);
      setTimeout(newProblem, 2500);
    } else {
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
        <div className={`text-center mb-8 ${shake ? 'animate-shake' : ''}`}>
          <div className="inline-flex items-center gap-3 text-5xl font-black text-slate-800">
            <span className="bg-white px-4 py-2 rounded-2xl shadow-lg">{problem.a}</span>
            <span className="text-orange-500">{problem.op === '+' ? '+' : '−'}</span>
            <span className="bg-white px-4 py-2 rounded-2xl shadow-lg">{problem.b}</span>
            <span>=</span>
            <span className="bg-white px-4 py-2 rounded-2xl shadow-lg text-slate-400">{showAnswer ? answer : '?'}</span>
          </div>
        </div>
        <div className="relative w-full max-w-2xl h-32 mb-6">
          <div className="absolute bottom-8 left-0 right-0 h-2 bg-orange-300 rounded-full" />
          {Array.from({ length: maxNum + 1 }, (_, i) => (
            <button key={i} onClick={() => handleTapNumber(i)}
              className={`absolute bottom-4 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                i === jumperPos ? 'bg-orange-500 text-white scale-125 shadow-lg' : 'bg-white text-slate-600 shadow border-2 border-orange-200'
              } ${i === answer && showAnswer ? 'ring-4 ring-green-400' : ''}`}
              style={{ left: `${(i / maxNum) * 92 + 4}%`, transform: 'translateX(-50%)' }}>{i}</button>
          ))}
          <div className="absolute text-3xl transition-all duration-700 ease-in-out" style={{ left: `${(jumperPos / maxNum) * 92 + 4}%`, bottom: '48px', transform: 'translateX(-50%)' }}>🐸</div>
        </div>
        <p className="text-slate-500 font-semibold mb-4">Tap the number where the frog should land!</p>
        {feedback && <div className="mt-2 text-2xl font-black text-orange-600 animate-bounce">{feedback}</div>}
      </div>
    </div>
  );
};

export default NumberLineJump;
