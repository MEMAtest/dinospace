import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Home, RotateCcw, Volume2 } from 'lucide-react';
import { getPraise } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';
import {
  MULTIPLICATION_FACTS_BY_DIFFICULTY,
  TABLE_PRACTICE_FACTORS,
  TABLE_PRACTICE_TABLES,
} from '../../data/gameDifficulty.js';

// The packaged fact clips are about two seconds long. Leave a small gap so
// the next fact never cancels the previous one on Android/WebView playback.
const TABLE_LISTEN_INTERVAL_MS = 2700;
const TABLE_CLIP_BUFFER_MS = 2300;

const makeProblem = (difficulty = 'starter') => {
  const facts = MULTIPLICATION_FACTS_BY_DIFFICULTY[difficulty]
    || MULTIPLICATION_FACTS_BY_DIFFICULTY.starter;
  return facts[Math.floor(Math.random() * facts.length)];
};

const makeOptions = (answer, groups, inEachGroup, difficulty = 'starter') => {
  const challengeDistractors = difficulty === 'challenge'
    ? [answer - groups, answer - inEachGroup, answer + inEachGroup, answer + groups]
    : [answer - 1, answer + 1, answer - groups, answer + groups];
  const candidates = [
    answer,
    ...challengeDistractors.map((value) => Math.max(1, value)),
  ];
  const unique = [...new Set(candidates)];
  for (let offset = 1; unique.length < 4; offset += 1) {
    if (!unique.includes(answer - offset) && answer - offset > 0) unique.push(answer - offset);
    if (unique.length < 4 && !unique.includes(answer + offset)) unique.push(answer + offset);
  }
  return unique
    .slice(0, 4)
    .map((value, index) => ({ value, order: (value * 7 + index * 3) % 11 }))
    .sort((left, right) => left.order - right.order)
    .map(({ value }) => value);
};

const MonsterMath = ({
  onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent,
}) => {
  const difficulty = useGameDifficulty('math');
  const [problem, setProblem] = useState({ a: 3, b: 2, ans: 6 });
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [countStep, setCountStep] = useState(0);
  const [locked, setLocked] = useState(false);
  const [hadMistake, setHadMistake] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [tableFactor, setTableFactor] = useState(2);
  const [tableQuizIndex, setTableQuizIndex] = useState(null);
  const [tablePhase, setTablePhase] = useState('idle');
  const [tableHadMistake, setTableHadMistake] = useState(false);
  const [tableQuizFeedback, setTableQuizFeedback] = useState('');
  const timersRef = useRef([]);
  const tableTimersRef = useRef([]);

  const tableFacts = useMemo(() => TABLE_PRACTICE_FACTORS.map((multiple) => ({
    multiple,
    answer: tableFactor * multiple,
    prompt: `${tableFactor} times ${multiple} equals ${tableFactor * multiple}.`,
  })), [tableFactor]);

  const tableQuizOptions = useMemo(() => {
    if (tableQuizIndex === null) return [];
    const answer = tableFacts[tableQuizIndex]?.answer;
    if (!Number.isFinite(answer)) return [];
    return [...new Set([answer, Math.max(1, answer - tableFactor), answer + tableFactor, answer + 1])]
      .slice(0, 4)
      .sort((left, right) => ((left * 13) % 17) - ((right * 13) % 17));
  }, [tableFacts, tableFactor, tableQuizIndex]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => {
      clearTimeout(timer);
      clearInterval(timer);
    });
    timersRef.current = [];
  }, []);

  const clearTableTimers = useCallback(() => {
    tableTimersRef.current.forEach((timer) => clearTimeout(timer));
    tableTimersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);
  useEffect(() => () => clearTableTimers(), [clearTableTimers]);

  const newProblem = useCallback(() => {
    clearTimers();
    setProblem(makeProblem(difficulty));
    setSuccess(false);
    setShake(false);
    setFeedback('');
    setCountStep(0);
    setLocked(false);
    setHadMistake(false);
  }, [clearTimers, difficulty]);

  const startTableRecall = () => {
    clearTableTimers();
    setShowTable(true);
    setTablePhase('listening');
    setTableQuizIndex(null);
    setTableHadMistake(false);
    setTableQuizFeedback('Listen to each fact. The answers will hide when the recall round starts.');
    tableFacts.forEach((fact, index) => {
      const timer = setTimeout(() => {
        setTableQuizIndex(index);
        speak(fact.prompt);
      }, index * TABLE_LISTEN_INTERVAL_MS);
      tableTimersRef.current.push(timer);
    });
    const finishListeningTimer = setTimeout(() => {
      setTableQuizIndex(0);
      setTablePhase('recall');
      setTableQuizFeedback('Now recall the answer without looking.');
    }, (tableFacts.length - 1) * TABLE_LISTEN_INTERVAL_MS + TABLE_CLIP_BUFFER_MS + 350);
    tableTimersRef.current.push(finishListeningTimer);
  };

  const chooseTable = (factor) => {
    clearTableTimers();
    setTableFactor(factor);
    setTablePhase('idle');
    setTableQuizIndex(null);
    setTableHadMistake(false);
    setTableQuizFeedback('Choose Hear the table to listen first, then recall each fact.');
  };

  const toggleTable = () => {
    if (showTable) {
      clearTableTimers();
      setTablePhase('idle');
      setTableQuizIndex(null);
      setTableHadMistake(false);
    }
    setShowTable((value) => !value);
  };

  const answerTableRecall = (answer) => {
    if (tablePhase !== 'recall' || tableQuizIndex === null) return;
    const fact = tableFacts[tableQuizIndex];
    if (!fact) return;
    if (answer !== fact.answer) {
      setTableHadMistake(true);
      setTableQuizFeedback('Not yet. Hear the fact once, then try it again.');
      speak(fact.prompt);
      return;
    }
    const nextIndex = tableQuizIndex + 1;
    playSfx('sparkle');
    onGameEvent?.('math', 'table_recall_correct', {
      skill: 'multiplication-recall',
      item: `${tableFactor}x${fact.multiple}`,
      response: answer,
      expected: fact.answer,
      correct: true,
      firstAttempt: !tableHadMistake,
      independent: !tableHadMistake,
      difficulty,
    });
    if (nextIndex >= tableFacts.length) {
      setTableQuizIndex(null);
      setTablePhase('complete');
      setTableQuizFeedback(`Great recall — you practised the ${tableFactor}s ×2, ×3 and ×4 facts.`);
      onCelebrate(`${tableFactor}s recall complete!`, 6, 200);
    } else {
      setTableQuizIndex(nextIndex);
      setTableHadMistake(false);
      setTableQuizFeedback('Nice. Try the next fact from memory.');
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    newProblem();
  }, [difficulty]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!showTable) speak(`What is ${problem.a} groups of ${problem.b}? Count every obstacle.`);
  }, [problem.a, problem.b, showTable, speak]);

  const options = useMemo(
    () => makeOptions(problem.ans, problem.a, problem.b, difficulty),
    [problem.a, problem.ans, problem.b, difficulty],
  );

  // Keep every obstacle visible while the truck proves the multiplication,
  // but avoid the old 500ms-per-item pause that made a small problem linger
  // for 15+ seconds on a tablet.
  const stepAnimationMs = 240;
  const totalAnimationMs = problem.ans * stepAnimationMs;

  const check = (answer) => {
    if (locked) return;
    if (answer !== problem.ans) {
      setHadMistake(true);
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
    const nextStreak = streak + 1;
    setStreak(nextStreak);
    playSfx('success');
    speak(`${problem.a} groups of ${problem.b}. Let us jump and count to ${problem.ans}.`);
    onCelebrate(nextStreak === 5 ? 'Five in a row — Super Star bonus!' : praise, nextStreak === 5 ? 16 : 6, 50);
    onGameEvent?.('math', 'answer_correct', { skill: 'multiplication', item: `${problem.a}x${problem.b}`, response: answer, expected: problem.ans, correct: true, firstAttempt: !hadMistake, independent: true, difficulty });

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
        <section className="mb-3 w-full rounded-[1.7rem] border-4 border-white/80 bg-white/75 p-3 shadow-lg backdrop-blur" aria-labelledby="table-practice-heading">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 id="table-practice-heading" className="text-base font-black text-orange-900 sm:text-lg">Practise a table</h3>
              <p className="text-xs font-bold text-orange-900/65">Hear each fact, then try it from memory.</p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button type="button" onClick={startTableRecall} className="rounded-xl border-2 border-orange-300 bg-white px-3 py-2 text-sm font-black text-orange-800 shadow-sm active:translate-y-0.5">
                Hear then recall
              </button>
              <button type="button" onClick={toggleTable} className="rounded-xl bg-orange-500 px-3 py-2 text-sm font-black text-white shadow-md active:translate-y-0.5" aria-expanded={showTable}>
              {showTable ? 'Hide table' : 'Show table'}
              </button>
            </div>
          </div>
          {showTable && (
            <div className="mt-3 rounded-2xl bg-orange-50 p-3">
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Choose a multiplication table">
                {TABLE_PRACTICE_TABLES.map((factor) => <button type="button" key={factor} onClick={() => chooseTable(factor)} className={`rounded-full px-3 py-1.5 text-sm font-black ${tableFactor === factor ? 'bg-orange-600 text-white' : 'bg-white text-orange-800'}`} aria-pressed={tableFactor === factor}>{factor}s</button>)}
              </div>
              {tablePhase === 'listening' ? (
                <div className="mt-3 rounded-2xl border-2 border-orange-200 bg-white p-3 text-center" role="status" aria-live="polite">
                  <p className="text-xs font-black uppercase tracking-wide text-orange-500">Listen {tableQuizIndex === null ? 'starting soon' : `${tableQuizIndex + 1} of ${tableFacts.length}`}</p>
                  <p className="mt-1 text-2xl font-black text-slate-800">
                    {tableQuizIndex === null ? `${tableFactor} times…` : `${tableFactor} × ${tableFacts[tableQuizIndex].multiple} = ${tableFacts[tableQuizIndex].answer}`}
                  </p>
                  <p className="mt-1 text-sm font-bold text-orange-900/70">Watch the facts, then the answer will hide.</p>
                </div>
              ) : tablePhase === 'recall' && tableQuizIndex !== null ? (
                <div className="mt-3 rounded-2xl border-2 border-orange-200 bg-white p-3 text-center">
                  <p className="text-xs font-black uppercase tracking-wide text-orange-500">Recall {tableQuizIndex + 1} of {tableFacts.length}</p>
                  <p className="mt-1 text-2xl font-black text-slate-800">{tableFactor} × {tableFacts[tableQuizIndex].multiple} = ?</p>
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    {tableQuizOptions.map((answer) => <button type="button" key={answer} onClick={() => answerTableRecall(answer)} className="min-w-16 rounded-xl border-2 border-orange-200 bg-orange-50 px-3 py-2 text-lg font-black text-orange-900 active:translate-y-0.5">{answer}</button>)}
                  </div>
                  <button type="button" onClick={() => speak(tableFacts[tableQuizIndex].prompt)} className="mt-2 text-sm font-black text-orange-700 underline">Hear this fact again</button>
                </div>
              ) : tablePhase === 'complete' ? (
                <div className="mt-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-3 text-center">
                  <p className="text-lg font-black text-emerald-700">{tableQuizFeedback}</p>
                  <button type="button" onClick={startTableRecall} className="mt-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white">Hear it again</button>
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {tableFacts.map((fact) => <button type="button" key={fact.multiple} onClick={() => speak(fact.prompt)} className="rounded-xl border-2 border-orange-200 bg-white px-2 py-2 text-left shadow-sm transition hover:-translate-y-0.5 active:translate-y-0" aria-label={`Hear ${tableFactor} times ${fact.multiple}`}><span className="block text-xs font-black text-orange-500">Tap to hear</span><strong className="text-base text-slate-800">{tableFactor} × {fact.multiple} = {fact.answer}</strong></button>)}
                </div>
              )}
              {tableQuizFeedback && <p className="mt-2 text-xs font-bold text-orange-900/70" role="status">{tableQuizFeedback}</p>}
              <p className="mt-2 text-xs font-bold text-orange-900/65">This offline strip covers ×2, ×3 and ×4. Listen once, hide the answer, recall it, then check. More factors will only appear after their ElevenLabs clips are packaged.</p>
            </div>
          )}
        </section>
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
            {difficulty === 'challenge'
              ? 'Mixed-table challenge · remember the fact before the truck jumps'
              : `${problem.a} groups · ${problem.b} obstacles in each group`}
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
                  {difficulty !== 'challenge' && (
                    <div className="rounded-xl border border-white/40 bg-black/20 px-2 py-1 text-xs font-black text-white">
                      Group {groupIndex + 1}
                    </div>
                  )}
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
