import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Lightbulb, Volume2 } from 'lucide-react';
import { ARITHMETIC_CHAPTERS, arithmeticNarrationSegments, createAdditionRun, createArithmeticSeed, arithmeticRewardUnits, scoreArithmeticResults } from '../../data/arithmeticAdventure.js';
import { getArithmeticProgress, rememberStartedArithmeticRun, saveArithmeticRun } from '../../data/arithmeticProgress.js';
import { SoundToggle } from '../shared/index.jsx';

const tell = (speak, text, segments = arithmeticNarrationSegments(text)) => speak?.(text, { premium: false, segments });
const noopCancel = () => {};
const colorHex = { red: '#f43f5e', blue: '#0ea5e9', gold: '#fbbf24', pink: '#f472b6', violet: '#8b5cf6', brown: '#92400e', teal: '#14b8a6' };
const ObjectToken = ({ object, color }) => {
  const fill = colorHex[color] || colorHex.teal;
  if (object === 'counter') return <circle cx="16" cy="16" r="11" fill={fill} stroke="#fff" strokeWidth="2" />;
  if (object === 'apple') return <><path d="M16 11c-5-5-12-1-11 6 1 7 6 12 11 8 5 4 10-1 11-8 1-7-6-11-11-6Z" fill={fill} stroke="#7f1d1d" strokeWidth="1.5"/><path d="M16 11c-1-4 1-6 4-7M16 9c-3-4-6-3-7-2 1 3 3 4 7 4Z" fill="#65a30d" stroke="#3f6212" strokeWidth="1.2"/></>;
  if (object === 'shell') return <><path d="M4 25a12 12 0 0 1 24 0Z" fill={fill} stroke="#075985" strokeWidth="1.5"/><path d="M16 14 7 24m9-10-3 10m3-10 3 10m-3-10 9 10" fill="none" stroke="#fff" strokeWidth="1.5"/></>;
  if (object === 'star') return <polygon points="16,2 20,11 30,12 23,19 25,29 16,24 7,29 9,19 2,12 12,11" fill={fill} stroke="#92400e" strokeWidth="1.5"/>;
  if (object === 'flower') return <><g fill={fill} stroke="#9d174d" strokeWidth="1"><circle cx="16" cy="6" r="5"/><circle cx="25" cy="12" r="5"/><circle cx="22" cy="23" r="5"/><circle cx="10" cy="23" r="5"/><circle cx="7" cy="12" r="5"/></g><circle cx="16" cy="15" r="5" fill="#facc15"/></>;
  if (object === 'gem') return <polygon points="8,3 24,3 31,11 16,30 1,11" fill={fill} stroke="#5b21b6" strokeWidth="1.5"/>;
  if (object === 'cookie') return <><circle cx="16" cy="16" r="13" fill={fill} stroke="#78350f" strokeWidth="1.5"/><g fill="#451a03"><circle cx="10" cy="11" r="1.7"/><circle cx="21" cy="9" r="1.6"/><circle cx="17" cy="18" r="1.8"/><circle cx="10" cy="22" r="1.5"/><circle cx="24" cy="22" r="1.5"/></g></>;
  return <circle cx="16" cy="16" r="11" fill={fill} stroke="#fff" strokeWidth="2"/>;
};
const Chapter = ({ chapter, index, selected, done, locked, onClick }) => <button type="button" disabled={locked} onClick={onClick} aria-pressed={selected} className={`min-h-16 rounded-2xl border-2 p-3 text-left font-black disabled:opacity-50 ${selected ? 'border-emerald-600 bg-emerald-100' : 'border-white bg-white'}`}><span className="block text-xs uppercase tracking-wide">Chapter {index + 1}{done ? ' · Badge earned' : locked ? ' · Locked' : ''}</span>{chapter.title}</button>;

export default function AdditionAdventure({ onBack, playSfx = () => {}, soundOn, onToggleSound, speak = () => {}, cancelNarration = noopCancel, onCelebrate = () => {}, onGameEvent, onPhaseChange, playerId = 'amari' }) {
  const [progress, setProgress] = useState(() => getArithmeticProgress('addition', playerId));
  const [chapterIndex, setChapterIndex] = useState(() => getArithmeticProgress('addition', playerId).unlockedChapter);
  const [phase, setPhase] = useState('start');
  const [seed, setSeed] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [mistake, setMistake] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [completedResults, setCompletedResults] = useState([]);
  const [travel, setTravel] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const chapter = ARITHMETIC_CHAPTERS[chapterIndex];
  const question = rounds[roundIndex];

  useEffect(() => {
    onPhaseChange?.(phase === 'done' ? 'finish' : phase === 'start' ? 'intro' : 'play');
  }, [phase, onPhaseChange]);
  useEffect(() => () => cancelNarration(), [cancelNarration]);
  useEffect(() => {
    if (phase !== 'play' || !question) return;
    onGameEvent?.('addition', 'question', { level: chapterIndex, round: roundIndex, seed, difficulty: chapter.id });
    tell(speak, question.prompt, arithmeticNarrationSegments(question));
  }, [phase, question, chapterIndex, chapter.id, roundIndex, seed, speak, onGameEvent]);

  const start = (index = chapterIndex) => {
    cancelNarration();
    const newSeed = createArithmeticSeed();
    const recent = getArithmeticProgress('addition', playerId).recentQuestionIds[index] || [];
    const queue = createAdditionRun({ chapter: index, seed: newSeed, recentIds: recent });
    if (rememberStartedArithmeticRun('addition', playerId, index, queue)) {
      setProgress(getArithmeticProgress('addition', playerId));
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
    setTravel(false);
    setPhase('play');
    onGameEvent?.('addition', 'start', { level: index, seed: newSeed, difficulty: ARITHMETIC_CHAPTERS[index].id });
    if (progress.completedChapterIds.includes(ARITHMETIC_CHAPTERS[index].id)) {
      onGameEvent?.('addition', 'replay', { level: index, seed: newSeed, difficulty: ARITHMETIC_CHAPTERS[index].id, hintCount: 0 });
    }
  };

  const attempt = (value) => {
    if (!question || locked) return;
    const firstAttempt = !mistake;
    const correct = value === question.answer;
    onGameEvent?.('addition', 'answer_attempt', {
      level: chapterIndex, round: roundIndex, seed, difficulty: chapter.id,
      skill: chapter.skill, item: question.id, response: value, correct, firstAttempt, diagnosticOnly: correct,
    });
    if (!correct) {
      setMistake(true);
      setFeedback(question.type === 'bond' ? 'Check how the two parts fit the whole.' : 'Count both groups, then count on.');
      tell(speak, question.clue, arithmeticNarrationSegments(question, 'clue'));
      playSfx('wrong');
      return;
    }
    setLocked(true);
    setFeedback(question.explanation);
    setTravel(true);
    const result = { correct: true, firstAttempt, priorWrong: mistake, hintCount: hintUsed ? 1 : 0 };
    setCompletedResults((previous) => [...previous, result]);
    playSfx('success');
    onGameEvent?.('addition', 'answer_correct', {
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
    onGameEvent?.('addition', 'hint', { level: chapterIndex, round: roundIndex, seed, difficulty: chapter.id, hintType: 'one_step' });
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
      setTravel(false);
      return;
    }
    const { stars } = scoreArithmeticResults(completedResults);
    const result = saveArithmeticRun('addition', playerId, chapterIndex, rounds, stars);
    if (!result) return;
    setProgress(result.progress);
    if (result.awardedStars > 0) {
      onCelebrate?.(`${chapter.title} complete!`, arithmeticRewardUnits(result.awardedStars), 0, 'addition');
    }
    onGameEvent?.('addition', 'level_complete', { level: chapterIndex, round: 5, seed, difficulty: chapter.id, hintCount });
    setFeedback(result.newlyCompleted
      ? `Chapter complete! You earned ${stars} ${stars === 1 ? 'star' : 'stars'}.`
      : `Replay complete! Your best is ${result.progress.bestStars[chapter.id]} ${result.progress.bestStars[chapter.id] === 1 ? 'star' : 'stars'}.`);
    setPhase('done');
    playSfx('complete');
  };

  const leave = () => {
    if (phase === 'play') onGameEvent?.('addition', 'leave', { level: chapterIndex, round: roundIndex, seed, difficulty: chapter.id });
    onBack?.();
  };
  const model = useMemo(() => {
    if (!question) return null;
    if (question.type === 'groups' || question.type === 'story') {
      const objectGroup = (count, label, moving) => (
        <div
          role="group"
          aria-label={`${label}, ${count} ${count === 1 ? question.one : question.many}`}
          className={`min-w-24 rounded-2xl border-2 border-slate-200 bg-white p-2 transition-all duration-700 motion-reduce:transition-none ${moving ? 'translate-x-6 translate-y-4' : ''}`}
        >
          <p className="text-xs font-black">{label}: {count === 0 ? '0 (empty)' : count}</p>
          <div className="mt-1 flex max-w-56 flex-wrap gap-1" aria-hidden="true">
            {Array.from({ length: count }, (_, index) => (
              <svg key={index} viewBox="0 0 32 32" className="h-7 w-7" focusable="false">
                <ObjectToken object={question.object} color={question.color} />
              </svg>
            ))}
          </div>
        </div>
      );
      return (
        <div className="flex flex-wrap items-center justify-center gap-2" aria-label="Two groups shown separately before adding">
          {objectGroup(question.a, 'First group', travel)}
          <span aria-hidden="true" className="text-2xl font-black">+</span>
          {objectGroup(question.b, 'Second group', travel)}
          <span aria-hidden="true" className="text-2xl">→</span>
          <div
            className="min-w-24 rounded-2xl border-2 border-dashed border-emerald-500 bg-emerald-50 p-3"
            role="group"
            aria-label={locked ? `Result tray, ${question.answer} ${question.answer === 1 ? question.one : question.many}` : 'Empty result tray'}
          >
            <b>Result tray</b>
            <div className="mt-1 flex max-w-56 flex-wrap gap-1" aria-hidden="true">
              {locked && Array.from({ length: question.answer }, (_, index) => (
                <svg key={index} viewBox="0 0 32 32" className="h-7 w-7" focusable="false">
                  <ObjectToken object={question.object} color={question.color} />
                </svg>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-3" role="group" aria-label="Whole and two parts diagram">
        <div className="rounded-2xl border-2 border-emerald-400 bg-white px-6 py-3 font-black">Whole: {question.total}</div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white px-4 py-3 font-bold">Part: {question.a}</div>
          <div className={`rounded-xl border-2 border-dashed px-4 py-3 font-bold ${locked ? 'border-emerald-500 bg-emerald-50' : 'border-slate-400'}`} aria-label={locked ? `Missing part ${question.b}` : 'Missing part'}>
            Part: {locked ? question.b : '?'}
          </div>
        </div>
        <p className="text-sm font-semibold">Both parts make the whole.</p>
      </div>
    );
  }, [question, locked, travel]);
  if (phase === 'start' || phase === 'done') return <div className="min-h-[100dvh] bg-gradient-to-b from-emerald-100 to-teal-200 p-3 text-slate-900 sm:p-6"><header className="mx-auto flex max-w-4xl items-center justify-between rounded-3xl bg-white p-3 shadow"><button className="game-icon-button !min-h-12 !min-w-12" onClick={leave} aria-label="Back to Maths Missions"><ArrowLeft /></button><h1 className="text-xl font-black sm:text-3xl">Addition Adventure</h1><SoundToggle soundOn={soundOn} onToggle={onToggleSound} /></header>{phase === 'start' ? <main className="mx-auto mt-5 max-w-4xl"><p className="mb-4 rounded-2xl bg-white p-4 text-center font-bold">Three ways to think about addition. Each chapter has six questions; your worked answer stays here until Next.</p><div className="grid gap-3 sm:grid-cols-3">{ARITHMETIC_CHAPTERS.map((c,i)=><Chapter key={c.id} chapter={c} index={i} selected={chapterIndex===i} done={progress.completedChapterIds.includes(c.id)} locked={i>progress.unlockedChapter} onClick={()=>setChapterIndex(i)} />)}</div><button onClick={()=>start()} className="mt-5 min-h-14 w-full rounded-2xl bg-emerald-700 px-5 text-lg font-black text-white">Start {chapter.title}</button></main> : <main className="mx-auto mt-8 max-w-2xl rounded-3xl bg-white p-6 text-center shadow-xl"><p className="text-2xl font-black">{feedback}</p><p className="mt-3">{progress.completedChapterIds.length < 3 ? 'Choose the next unlocked chapter or replay this one.' : 'All three chapters are complete. Replay any chapter.'}</p><button className="mt-5 min-h-14 w-full rounded-2xl bg-emerald-700 px-5 font-black text-white" onClick={()=>{cancelNarration();setPhase('start');setChapterIndex(progress.unlockedChapter);}}>Continue</button><button className="mt-3 min-h-14 w-full rounded-2xl bg-white px-5 font-black text-emerald-800 ring-2 ring-emerald-700" onClick={()=>start(chapterIndex)}>Replay {chapter.title}</button></main>}</div>;
  return <div className="min-h-[100dvh] overflow-y-auto bg-gradient-to-b from-emerald-100 to-teal-200 p-3 text-slate-900 sm:p-6"><header className="mx-auto flex max-w-4xl items-center justify-between rounded-3xl bg-white p-3 shadow"><button className="game-icon-button !min-h-12 !min-w-12" onClick={leave} aria-label="Back to Maths Missions"><ArrowLeft /></button><div className="text-center"><p className="text-xs font-black uppercase">Chapter {chapterIndex+1} of 3 · Question {roundIndex+1} of 6</p><h1 className="text-xl font-black sm:text-3xl">Addition Adventure</h1></div><SoundToggle soundOn={soundOn} onToggle={onToggleSound} /></header><main className="mx-auto mt-4 max-w-4xl rounded-3xl bg-white/90 p-4 text-center shadow-xl sm:p-6"><p className="mb-3 text-lg font-bold" aria-live="polite">{question?.prompt}</p><button className="mb-4 inline-flex min-h-12 items-center gap-2 rounded-xl bg-emerald-100 px-4 font-black" onClick={()=>tell(speak, question.prompt, arithmeticNarrationSegments(question))}><Volume2 size={20}/> Hear question</button>{model}<div className="my-4 flex flex-wrap justify-center gap-3" role="group" aria-label="Choose the answer">{question?.options.map(option=><button key={option} disabled={locked} onClick={()=>attempt(option)} className="min-h-14 min-w-16 rounded-2xl bg-emerald-700 px-5 text-2xl font-black text-white shadow disabled:opacity-60" aria-label={`Answer ${option}`}>{option}</button>)}</div>{feedback&&<p role="status" className="mx-auto mb-3 max-w-2xl rounded-xl bg-emerald-50 p-3 font-bold">{feedback}</p>}{!locked&&<button disabled={hintUsed} onClick={hint} className="inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-amber-500 bg-amber-50 px-4 font-black disabled:opacity-50"><Lightbulb size={20}/>{hintUsed?'Hint used':'Use one hint'}</button>}{locked&&<button onClick={next} className="mt-3 min-h-14 w-full rounded-2xl bg-emerald-700 px-5 text-lg font-black text-white">{roundIndex===5?'Finish chapter':'Next question'}</button>}</main></div>;
}
