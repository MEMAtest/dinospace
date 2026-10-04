import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Lightbulb, Volume2 } from 'lucide-react';
import { SUBTRACTION_CHAPTERS, arithmeticNarrationSegments, createSubtractionRun, createArithmeticSeed, arithmeticRewardUnits, scoreArithmeticResults } from '../../data/arithmeticAdventure.js';
import { getArithmeticProgress, rememberStartedArithmeticRun, saveArithmeticRun } from '../../data/arithmeticProgress.js';
import { SoundToggle } from '../shared/index.jsx';

const tell = (speak, text, segments = arithmeticNarrationSegments(text)) => speak?.(text, { premium: false, segments });
const noopCancel = () => {};
const colorClass = { red: 'bg-rose-500', blue: 'bg-sky-500', gold: 'bg-amber-400', pink: 'bg-pink-400', violet: 'bg-violet-500', brown: 'bg-amber-800', teal: 'bg-teal-500' };
const colorHex = { red: '#f43f5e', blue: '#0ea5e9', gold: '#fbbf24', pink: '#f472b6', violet: '#8b5cf6', brown: '#92400e', teal: '#14b8a6', rose: '#e11d48' };
const ObjectToken = ({ object, color }) => {
  const fill = colorHex[color] || colorHex.teal;
  if (object === 'apple') return <><path d="M16 11c-5-5-12-1-11 6 1 7 6 12 11 8 5 4 10-1 11-8 1-7-6-11-11-6Z" fill={fill} stroke="#7f1d1d" strokeWidth="1.5"/><path d="M16 11c-1-4 1-6 4-7M16 9c-3-4-6-3-7-2 1 3 3 4 7 4Z" fill="#65a30d" stroke="#3f6212" strokeWidth="1.2"/></>;
  if (object === 'shell') return <><path d="M4 25a12 12 0 0 1 24 0Z" fill={fill} stroke="#075985" strokeWidth="1.5"/><path d="M16 14 7 24m9-10-3 10m3-10 3 10m-3-10 9 10" fill="none" stroke="#fff" strokeWidth="1.5"/></>;
  if (object === 'star') return <polygon points="16,2 20,11 30,12 23,19 25,29 16,24 7,29 9,19 2,12 12,11" fill={fill} stroke="#92400e" strokeWidth="1.5"/>;
  if (object === 'flower') return <><g fill={fill} stroke="#9d174d" strokeWidth="1"><circle cx="16" cy="6" r="5"/><circle cx="25" cy="12" r="5"/><circle cx="22" cy="23" r="5"/><circle cx="10" cy="23" r="5"/><circle cx="7" cy="12" r="5"/></g><circle cx="16" cy="15" r="5" fill="#facc15"/></>;
  if (object === 'gem') return <polygon points="8,3 24,3 31,11 16,30 1,11" fill={fill} stroke="#5b21b6" strokeWidth="1.5"/>;
  if (object === 'cookie') return <><circle cx="16" cy="16" r="13" fill={fill} stroke="#78350f" strokeWidth="1.5"/><g fill="#451a03"><circle cx="10" cy="11" r="1.7"/><circle cx="21" cy="9" r="1.6"/><circle cx="17" cy="18" r="1.8"/><circle cx="10" cy="22" r="1.5"/><circle cx="24" cy="22" r="1.5"/></g></>;
  return <circle cx="16" cy="16" r="11" fill={fill} stroke="#fff" strokeWidth="2"/>;
};
const group = (n, color, label, removed = 0, object = 'counter', moving = false) => <div role="group" aria-label={`${label}, ${n} ${n === 1 ? object : `${object}s`}${removed ? `, ${removed} marked for removal` : ''}`} className={`min-w-24 rounded-2xl border-2 border-slate-200 bg-white p-2 transition-all duration-700 motion-reduce:transition-none ${moving ? 'translate-x-4 translate-y-3 opacity-40' : ''}`}><p className="text-xs font-black text-slate-700">{label}: {n === 0 ? '0 (empty)' : n}</p><div className="mt-1 flex max-w-56 flex-wrap gap-1" aria-hidden="true">{Array.from({ length: n }, (_, i) => <svg key={i} viewBox="0 0 32 32" className={`h-7 w-7 ${i < removed ? 'opacity-45' : ''}`} focusable="false"><ObjectToken object={object} color={color}/>{i < removed && <path d="m5 5 22 22M27 5 5 27" stroke="#be123c" strokeWidth="3"/>}</svg>)}</div></div>;
const Chapter = ({ chapter, index, selected, done, locked, onClick }) => <button type="button" disabled={locked} onClick={onClick} aria-pressed={selected} className={`min-h-16 rounded-2xl border-2 p-3 text-left font-black disabled:opacity-50 ${selected ? 'border-violet-600 bg-violet-100' : 'border-white bg-white'}`}><span className="block text-xs uppercase tracking-wide">Chapter {index + 1}{done ? ' · Badge earned' : locked ? ' · Locked' : ''}</span>{chapter.title}</button>;

export default function SubtractionStation({ onBack, playSfx = () => {}, soundOn, onToggleSound, speak = () => {}, cancelNarration = noopCancel, onCelebrate = () => {}, onGameEvent, onPhaseChange, playerId = 'amari' }) {
  const [progress, setProgress] = useState(() => getArithmeticProgress('subtraction', playerId));
  const [chapterIndex, setChapterIndex] = useState(() => getArithmeticProgress('subtraction', playerId).unlockedChapter);
  const [phase, setPhase] = useState('start');
  const [seed, setSeed] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [mistake, setMistake] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [completedResults, setCompletedResults] = useState([]);
  const [motion, setMotion] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const chapter = SUBTRACTION_CHAPTERS[chapterIndex];
  const question = rounds[roundIndex];

  useEffect(() => {
    onPhaseChange?.(phase === 'done' ? 'finish' : phase === 'start' ? 'intro' : 'play');
  }, [phase, onPhaseChange]);
  useEffect(() => () => cancelNarration(), [cancelNarration]);
  useEffect(() => {
    if (phase !== 'play' || !question) return;
    onGameEvent?.('subtraction', 'question', { level: chapterIndex, round: roundIndex, seed, difficulty: chapter.id });
    tell(speak, question.prompt, arithmeticNarrationSegments(question));
  }, [phase, question, chapterIndex, chapter.id, roundIndex, seed, speak, onGameEvent]);

  const start = (index = chapterIndex) => {
    cancelNarration();
    const newSeed = createArithmeticSeed();
    const recent = getArithmeticProgress('subtraction', playerId).recentQuestionIds[index] || [];
    const queue = createSubtractionRun({ chapter: index, seed: newSeed, recentIds: recent });
    if (rememberStartedArithmeticRun('subtraction', playerId, index, queue)) {
      setProgress(getArithmeticProgress('subtraction', playerId));
    }
    setChapterIndex(index);
    setSeed(newSeed);
    setRounds(queue);
    setRoundIndex(0);
    setMistake(false);
    setHintUsed(false);
    setLocked(false);
    setFeedback('');
    setCompletedResults([]);
    setHintCount(0);
    setMotion(false);
    setPhase('play');
    onGameEvent?.('subtraction', 'start', { level: index, seed: newSeed, difficulty: SUBTRACTION_CHAPTERS[index].id });
    if (progress.completedChapterIds.includes(SUBTRACTION_CHAPTERS[index].id)) {
      onGameEvent?.('subtraction', 'replay', { level: index, seed: newSeed, difficulty: SUBTRACTION_CHAPTERS[index].id, hintCount: 0 });
    }
  };

  const attempt = (value) => {
    if (!question || locked) return;
    const firstAttempt = !mistake;
    const correct = value === question.answer;
    onGameEvent?.('subtraction', 'answer_attempt', {
      level: chapterIndex, round: roundIndex, seed, difficulty: chapter.id,
      skill: chapter.skill, item: question.id, response: value, correct, firstAttempt, diagnosticOnly: correct,
    });
    if (!correct) {
      setMistake(true);
      const guidance = question.type !== 'compare'
        ? question.b === 0 ? 'Nothing is taken away. The starting group stays the same.' : 'Look at the marked objects. Count the ones that remain.'
        : question.a === question.b
          ? 'Pair one counter from each group. They have the same number, so none are left unpaired.'
          : 'Pair one counter from each group. Count what is left unpaired.';
      setFeedback(guidance);
      tell(speak, question.clue, arithmeticNarrationSegments(question, 'clue'));
      playSfx('wrong');
      return;
    }
    setLocked(true);
    setFeedback(question.explanation);
    setMotion(true);
    setCompletedResults((previous) => [...previous, {
      correct: true,
      firstAttempt,
      priorWrong: mistake,
      hintCount: hintUsed ? 1 : 0,
    }]);
    playSfx('success');
    onGameEvent?.('subtraction', 'answer_correct', {
      level: chapterIndex, round: roundIndex, seed, difficulty: chapter.id,
      skill: chapter.skill, item: question.id, response: value, expected: question.answer,
      correct: true, firstAttempt, independent: firstAttempt && !hintUsed, priorWrong: mistake, hints: hintUsed ? 1 : 0,
    });
    tell(speak, question.explanation, arithmeticNarrationSegments(question, 'explanation'));
  };

  const hint = () => {
    if (!question || locked || hintUsed) return;
    setHintUsed(true);
    setHintCount((count) => count + 1);
    setFeedback(question.clue);
    onGameEvent?.('subtraction', 'hint', { level: chapterIndex, round: roundIndex, seed, difficulty: chapter.id, hintType: 'one_step' });
    tell(speak, question.clue, arithmeticNarrationSegments(question, 'clue'));
  };

  const next = () => {
    if (!locked) return;
    cancelNarration();
    if (roundIndex < 5) {
      setRoundIndex((index) => index + 1);
      setMistake(false);
      setHintUsed(false);
      setLocked(false);
      setFeedback('');
      setMotion(false);
      return;
    }
    const { stars } = scoreArithmeticResults(completedResults);
    const result = saveArithmeticRun('subtraction', playerId, chapterIndex, rounds, stars);
    if (!result) return;
    setProgress(result.progress);
    if (result.awardedStars > 0) {
      onCelebrate?.(`${chapter.title} complete!`, arithmeticRewardUnits(result.awardedStars), 0, 'subtraction');
    }
    onGameEvent?.('subtraction', 'level_complete', { level: chapterIndex, round: 5, seed, difficulty: chapter.id, hintCount });
    setFeedback(result.newlyCompleted
      ? `Chapter complete! You earned ${stars} ${stars === 1 ? 'star' : 'stars'}.`
      : `Replay complete! Your best is ${result.progress.bestStars[chapter.id]} ${result.progress.bestStars[chapter.id] === 1 ? 'star' : 'stars'}.`);
    setPhase('done');
    playSfx('complete');
  };

  const leave = () => {
    if (phase === 'play') onGameEvent?.('subtraction', 'leave', { level: chapterIndex, round: roundIndex, seed, difficulty: chapter.id });
    onBack?.();
  };
  const model = useMemo(() => {
    if (!question) return null;
    if (question.type === 'compare') {
      const paired = Math.min(question.a, question.b);
      const groupView = (count, label, color) => (
        <div role="group" aria-label={`${label}, ${count} counters`} className="rounded-xl border-2 border-slate-200 bg-white p-2">
          <p className="mb-1 text-center text-sm font-black">{label}: {count}</p>
          <div className="grid grid-cols-5 justify-items-center gap-1">
            {Array.from({ length: count }, (_, index) => (
              <span key={index} aria-label={`${label} counter ${index + 1}${locked ? (index >= paired ? ', unpaired' : ', paired') : ''}`} className={`h-6 w-6 rounded-full ${color} ${locked && index >= paired ? 'ring-4 ring-amber-300' : ''}`} />
            ))}
            {count === 0 && <span className="col-span-5 py-2 text-xs font-semibold text-slate-500">Empty group</span>}
          </div>
        </div>
      );
      return <div className="mx-auto max-w-md rounded-2xl border-2 border-violet-200 bg-white p-3">
        <p className="mb-2 text-sm font-black">Pair matching counters. After you choose, amber rings show any unpaired counters.</p>
        <div className="grid grid-cols-2 gap-2" aria-label={`Paired groups: Group A has ${question.a}, Group B has ${question.b}`}>
          {groupView(question.a, 'Group A', colorClass.blue)}
          {groupView(question.b, 'Group B', colorClass.gold)}
        </div>
        <p className="mt-2 rounded-xl bg-violet-50 p-2 text-sm font-bold">{question.a === question.b ? `The groups have the same number; choose how many are unpaired. ${locked ? '0 unpaired.' : ''}` : `Unpaired difference: ${locked ? question.answer : '?'}`}</p>
      </div>;
    }
    const removed = question.b;
    return <div className="flex flex-wrap items-center justify-center gap-3">
      {group(question.a, question.color, 'Starting group', removed, question.object, motion)}
      <span aria-hidden="true" className="text-2xl font-black">−</span>
      {group(question.b, 'rose', question.type === 'story' ? 'Given away' : 'Take away', 0, question.object, motion)}
      <span aria-hidden="true" className="text-2xl">→</span>
      <div role="group" aria-label={locked ? `Remaining tray, ${question.answer} ${question.answer === 1 ? question.one : question.many}` : 'Empty remaining tray'} className="min-w-24 rounded-2xl border-2 border-dashed border-violet-500 bg-violet-50 p-3">
        <b>Remaining</b>
        <div className="mt-1 flex max-w-56 flex-wrap gap-1" aria-hidden="true">{locked && Array.from({ length: question.answer }, (_, i) => <span key={i} className={`h-5 w-5 rounded-full ${colorClass[question.color] || colorClass.teal}`} />)}</div>
      </div>
    </div>;
  }, [question, locked, motion]);
  if (phase === 'start' || phase === 'done') return <div className="min-h-[100dvh] bg-gradient-to-b from-violet-100 to-purple-200 p-3 text-slate-900 sm:p-6"><header className="mx-auto flex max-w-4xl items-center justify-between rounded-3xl bg-white p-3 shadow"><button className="game-icon-button !min-h-12 !min-w-12" onClick={leave} aria-label="Back to Maths Missions"><ArrowLeft /></button><h1 className="text-xl font-black sm:text-3xl">Subtraction Station</h1><SoundToggle soundOn={soundOn} onToggle={onToggleSound} /></header>{phase === 'start' ? <main className="mx-auto mt-5 max-w-4xl"><p className="mb-4 rounded-2xl bg-white p-4 text-center font-bold">Take away, compare groups, and solve stories. Each chapter has six questions and a worked answer you control.</p><div className="grid gap-3 sm:grid-cols-3">{SUBTRACTION_CHAPTERS.map((c,i)=><Chapter key={c.id} chapter={c} index={i} selected={chapterIndex===i} done={progress.completedChapterIds.includes(c.id)} locked={i>progress.unlockedChapter} onClick={()=>setChapterIndex(i)} />)}</div><button onClick={()=>start()} className="mt-5 min-h-14 w-full rounded-2xl bg-violet-700 px-5 text-lg font-black text-white">Start {chapter.title}</button></main> : <main className="mx-auto mt-8 max-w-2xl rounded-3xl bg-white p-6 text-center shadow-xl"><p className="text-2xl font-black">{feedback}</p><p className="mt-3">Choose the next unlocked chapter or replay a completed chapter.</p><button className="mt-5 min-h-14 w-full rounded-2xl bg-violet-700 px-5 font-black text-white" onClick={()=>{cancelNarration();setPhase('start');setChapterIndex(progress.unlockedChapter);}}>Continue</button><button className="mt-3 min-h-14 w-full rounded-2xl bg-white px-5 font-black text-violet-800 ring-2 ring-violet-700" onClick={()=>start(chapterIndex)}>Replay {chapter.title}</button></main>}</div>;
  return <div className="min-h-[100dvh] overflow-y-auto bg-gradient-to-b from-violet-100 to-purple-200 p-3 text-slate-900 sm:p-6"><header className="mx-auto flex max-w-4xl items-center justify-between rounded-3xl bg-white p-3 shadow"><button className="game-icon-button !min-h-12 !min-w-12" onClick={leave} aria-label="Back to Maths Missions"><ArrowLeft /></button><div className="text-center"><p className="text-xs font-black uppercase">Chapter {chapterIndex+1} of 3 · Question {roundIndex+1} of 6</p><h1 className="text-xl font-black sm:text-3xl">Subtraction Station</h1></div><SoundToggle soundOn={soundOn} onToggle={onToggleSound} /></header><main className="mx-auto mt-4 max-w-4xl rounded-3xl bg-white/90 p-4 text-center shadow-xl sm:p-6"><p className="mb-3 text-lg font-bold" aria-live="polite">{question?.prompt}</p><button className="mb-4 inline-flex min-h-12 items-center gap-2 rounded-xl bg-violet-100 px-4 font-black" onClick={()=>tell(speak, question.prompt, arithmeticNarrationSegments(question))}><Volume2 size={20}/> Hear question</button>{model}<div className="my-4 flex flex-wrap justify-center gap-3" role="group" aria-label="Choose the answer">{question?.options.map(option=><button key={option} disabled={locked} onClick={()=>attempt(option)} className="min-h-14 min-w-16 rounded-2xl bg-violet-700 px-5 text-2xl font-black text-white shadow disabled:opacity-60" aria-label={`Answer ${option}`}>{option}</button>)}</div>{feedback&&<p role="status" className="mx-auto mb-3 max-w-2xl rounded-xl bg-violet-50 p-3 font-bold">{feedback}</p>}{!locked&&<button disabled={hintUsed} onClick={hint} className="inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-amber-500 bg-amber-50 px-4 font-black disabled:opacity-50"><Lightbulb size={20}/>{hintUsed?'Hint used':'Use one hint'}</button>}{locked&&<button onClick={next} className="mt-3 min-h-14 w-full rounded-2xl bg-violet-700 px-5 text-lg font-black text-white">{roundIndex===5?'Finish chapter':'Next question'}</button>}</main></div>;
}
