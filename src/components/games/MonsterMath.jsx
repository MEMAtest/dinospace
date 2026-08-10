import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Home, RotateCcw, Volume2 } from 'lucide-react';
import { getPraise } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';

const makeProblem = () => {
  const groups = Math.ceil(Math.random() * 4) + 1;
  const inEachGroup = Math.ceil(Math.random() * 3) + 1;
  return { a: groups, b: inEachGroup, ans: groups * inEachGroup };
};

const makeOptions = (answer, groups) => {
  const candidates = [
    answer,
    Math.max(1, answer - 1),
    answer + 1,
    Math.max(1, answer - groups),
    answer + groups,
  ];
  const unique = [...new Set(candidates)].slice(0, 4);
  return unique
    .map((value, index) => ({ value, order: (value * 7 + index * 3) % 11 }))
    .sort((left, right) => left.order - right.order)
    .map(({ value }) => value);
};

const MonsterMath = ({
  onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent,
}) => {
  const [problem, setProblem] = useState({ a: 3, b: 2, ans: 6 });
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [countStep, setCountStep] = useState(0);
  const [locked, setLocked] = useState(false);
  const timersRef = useRef([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => {
      clearTimeout(timer);
      clearInterval(timer);
    });
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const newProblem = useCallback(() => {
    clearTimers();
    setProblem(makeProblem());
    setSuccess(false);
    setShake(false);
    setFeedback('');
    setCountStep(0);
    setLocked(false);
  }, [clearTimers]);

  useEffect(() => {
    speak(`What is ${problem.a} groups of ${problem.b}? Count every obstacle.`);
  }, [problem.a, problem.b, speak]);

  const options = useMemo(
    () => makeOptions(problem.ans, problem.a),
    [problem.a, problem.ans],
  );

  const stepAnimationMs = 520;
  const totalAnimationMs = problem.ans * stepAnimationMs;

  const check = (answer) => {
    if (locked) return;
    if (answer !== problem.ans) {
      setShake(true);
      setStreak(0);
      setFeedback(`Look carefully: ${problem.a} groups with ${problem.b} in each group.`);
      playSfx('wrong');
      speak(`Try again. Count ${problem.a} groups of ${problem.b}.`);
      const timer = setTimeout(() => setShake(false), 450);
      timersRef.current.push(timer);
      return;
    }

    const praise = getPraise();
    setLocked(true);
    setSuccess(true);
    setFeedback(`${problem.a} groups of ${problem.b} make ${problem.ans}!`);
    setStreak((current) => current + 1);
    playSfx('success');
    speak(`${problem.a} groups of ${problem.b}. Let us jump and count to ${problem.ans}.`);
    onCelebrate(praise, 6, 50);
    onGameEvent?.('math', 'answer_correct');

    let count = 0;
    const countTimer = setInterval(() => {
      count += 1;
      setCountStep(count);
      playSfx('tap');
      if (count >= problem.ans) {
        clearInterval(countTimer);
        speak(`${problem.a} times ${problem.b} equals ${problem.ans}.`);
      }
    }, stepAnimationMs);
    timersRef.current.push(countTimer);

    const nextTimer = setTimeout(newProblem, totalAnimationMs + 1100);
    timersRef.current.push(nextTimer);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-orange-100 via-amber-100 to-orange-200 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 h-40 w-40 rounded-full bg-white/60 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-orange-300/40 blur-3xl" />
      </div>

      <header className="relative z-20 flex items-center justify-between px-4 pt-4">
        <button onClick={onBack} className="game-icon-button" aria-label="Back to all games"><Home /></button>
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">See the maths happen</p>
          <h2 className="text-2xl sm:text-3xl font-black text-orange-800">Stunt Jump Math</h2>
          <p className="font-bold text-orange-700/65">🔥 Streak {streak}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </header>

      <main className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 pb-6 pt-2">
        <section className={`w-full rounded-[2rem] border-4 border-white/70 bg-white/75 p-3 sm:p-4 text-center shadow-xl backdrop-blur ${shake ? 'animate-shake' : ''}`}>
          <div className="flex flex-wrap items-center justify-center gap-2 text-4xl sm:text-5xl font-black text-slate-800">
            <span className="math-number-card">{problem.a}</span>
            <span className="text-orange-500">×</span>
            <span className="math-number-card">{problem.b}</span>
            <span>=</span>
            <span className={`math-answer-card ${success ? 'border-emerald-400 text-emerald-600' : ''}`}>
              {countStep === problem.ans ? problem.ans : '?'}
            </span>
          </div>
          <p className="mt-2 text-base font-black text-slate-600">
            {problem.a} groups · {problem.b} obstacles in each group
          </p>
        </section>

        <section className="mt-3 w-full rounded-[2rem] border-4 border-orange-200 bg-[#764326] p-3 shadow-[inset_0_8px_20px_rgba(0,0,0,0.28)]">
          <div className="relative min-h-[225px] overflow-hidden rounded-[1.5rem] bg-gradient-to-b from-sky-300 via-sky-200 to-amber-100">
            <div className="absolute left-8 top-8 h-14 w-14 rounded-full bg-yellow-300 shadow-[0_0_35px_rgba(253,224,71,0.9)]" />
            <div className="absolute bottom-0 left-0 right-0 h-[42%] bg-gradient-to-b from-stone-600 to-stone-800" />
            <div className="absolute bottom-[37%] left-0 right-0 border-t-4 border-dashed border-yellow-300/80" />

            <div className="absolute bottom-[20%] left-[14%] right-[7%] flex items-end justify-around gap-2">
              {Array.from({ length: problem.a }, (_, groupIndex) => (
                <div key={groupIndex} className="flex flex-col items-center gap-1">
                  <div className="rounded-xl border border-white/40 bg-black/20 px-2 py-1 text-xs font-black text-white">
                    Group {groupIndex + 1}
                  </div>
                  <div className="flex gap-1 rounded-xl border-2 border-orange-200/50 bg-orange-950/20 px-2 py-2">
                    {Array.from({ length: problem.b }, (_, itemIndex) => {
                      const obstacleIndex = groupIndex * problem.b + itemIndex + 1;
                      const cleared = countStep >= obstacleIndex;
                      return (
                        <div
                          key={itemIndex}
                          className={`relative text-2xl sm:text-3xl transition-all duration-200 ${
                            cleared ? 'scale-75 opacity-35' : 'scale-100'
                          }`}
                        >
                          🚧
                          {cleared && (
                            <span className="absolute -right-1 -top-3 grid h-5 w-5 place-items-center rounded-full bg-emerald-400 text-[10px] font-black text-white">
                              {obstacleIndex}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="absolute bottom-[31%] z-10 transition-[left] ease-linear"
              style={{
                left: success ? `calc(${2 + (countStep / problem.ans) * 86}% - 1.5rem)` : '0.5rem',
                transitionDuration: success ? `${stepAnimationMs}ms` : '0ms',
              }}
            >
              <div
                key={success ? countStep : 'waiting'}
                className={success && countStep > 0 ? 'math-truck-step-jump' : ''}
                style={success ? { '--step-duration': `${stepAnimationMs}ms` } : undefined}
              >
                <span className="block text-6xl drop-shadow-xl" aria-label="monster truck">🛻</span>
              </div>
            </div>

            {success && (
              <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-white/90 px-5 py-2 text-center shadow-lg">
                <span key={countStep} className="text-2xl font-black text-orange-600 animate-count-up">
                  {countStep || 'GO!'}
                </span>
                <span className="ml-2 font-bold text-slate-500">of {problem.ans}</span>
              </div>
            )}
          </div>
        </section>

        <div className="mt-2 min-h-7 text-center">
          <p className={`font-black ${success ? 'text-emerald-700' : 'text-orange-800'}`} aria-live="polite">
            {feedback || 'Choose the total, then watch the truck prove it.'}
          </p>
        </div>

        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => check(option)}
              disabled={locked}
              className="h-14 w-16 rounded-2xl bg-blue-500 text-2xl font-black text-white shadow-[0_6px_0_rgb(29,78,216)] transition hover:bg-blue-600 active:translate-y-2 active:shadow-none disabled:opacity-45 sm:h-16 sm:w-20 sm:text-3xl"
            >
              {option}
            </button>
          ))}
          <button
            onClick={newProblem}
            className="grid h-14 w-16 place-items-center rounded-2xl bg-white text-orange-600 shadow-[0_6px_0_rgba(0,0,0,0.1)] active:translate-y-2 active:shadow-none sm:h-16 sm:w-20"
            aria-label="Try a different multiplication problem"
          >
            <RotateCcw />
          </button>
        </div>

        <button
          onClick={() => speak(`${problem.a} groups of ${problem.b}. Count all ${problem.ans} obstacles.`)}
          className="mt-3 flex items-center gap-2 rounded-full bg-orange-800/10 px-4 py-2 font-bold text-orange-800"
        >
          <Volume2 size={18} /> Hear the maths
        </button>
      </main>
    </div>
  );
};

export default MonsterMath;
