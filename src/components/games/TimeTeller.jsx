import { createArithmeticSeed } from '../../data/arithmeticAdventure.js';
import { useEffect, useState } from 'react';
import { Lightbulb, Volume2 } from 'lucide-react';
import { TIME_CHAPTERS, createTimeRun, formatClock, timeLabel } from '../../data/timeLineAdventure.js';
import { TIME_TELLER_NARRATION, timeNarrationSegments } from '../../data/batch4Narration.js';
import { getTimeLineProgress, rememberTimeLineRun, saveTimeLineRun } from '../../data/timeLineProgress.js';
import { LearningHeader, LearningChapters, LearningClock, ClockPractice, Explanation } from './TimeLineLearningUI.jsx';
const tell = (speak, line, segments) => speak?.(line, { premium: false, segments });
const noopCancel = () => {};
export default function TimeTeller({
  onBack,
  playSfx = () => {},
  soundOn,
  onToggleSound,
  speak = () => {},
  cancelNarration = noopCancel,
  onCelebrate = () => {},
  onGameEvent,
  onPhaseChange,
  playerId = 'amari'
}) {
  const [progress, setProgress] = useState(() => getTimeLineProgress('timeteller', playerId));
  const [chapterIndex, setChapterIndex] = useState(() => getTimeLineProgress('timeteller', playerId).unlockedChapter);
  const [phase, setPhase] = useState('start');
  const [seed, setSeed] = useState(null);
  const [run, setRun] = useState([]);
  const [ri, setRi] = useState(0);
  const [mistake, setMistake] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [locked, setLocked] = useState(false);
  const [first, setFirst] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [completion, setCompletion] = useState(null);
  const [setTime, setSetTime] = useState({
    hour: 12,
    minute: 0
  });
  const chapter = TIME_CHAPTERS[chapterIndex],
    q = run[ri];
  useEffect(() => () => cancelNarration(), [cancelNarration]);
  useEffect(() => {
    onPhaseChange?.(phase === 'done' ? 'finish' : phase === 'start' ? 'intro' : 'play');
  }, [phase, onPhaseChange]);
  useEffect(() => {
    if (phase === 'play' && q) {
      onGameEvent?.('timeteller', 'question', {
        level: chapterIndex,
        round: ri,
        seed,
        difficulty: chapter.id
      });
      tell(speak, q.prompt, timeNarrationSegments(q));
    }
  }, [phase, q, chapterIndex, ri, seed, chapter.id, speak, onGameEvent]);
  const start = (index = chapterIndex) => {
    cancelNarration();
    const s = createArithmeticSeed();
    const recent = getTimeLineProgress('timeteller', playerId).recentQuestionIds[index] || [];
    const next = createTimeRun({
      chapter: index,
      seed: s,
      recentIds: recent
    });
    rememberTimeLineRun('timeteller', playerId, index, next);
    setChapterIndex(index);
    setSeed(s);
    setRun(next);
    setRi(0);
    setMistake(false);
    setHintUsed(false);
    setLocked(false);
    setFirst(0);
    setFeedback('');
    setCompletion(null);
    setSetTime({
      hour: 12,
      minute: 0
    });
    setPhase('play');
    onGameEvent?.('timeteller', 'start', {
      level: index,
      seed: s,
      difficulty: TIME_CHAPTERS[index].id
    });
  };
  const attempt = time => {
    if (!q || locked) return;
    const ok = time.hour === q.target.hour && time.minute === q.target.minute;
    onGameEvent?.('timeteller', 'answer_attempt', {
      level: chapterIndex,
      round: ri,
      seed,
      difficulty: chapter.id,
      item: q.id,
      response: formatClock(time),
      correct: ok,
      diagnosticOnly: ok,
      skill: q.type === 'set' ? 'set-hands' : 'read-clock',
      firstAttempt: !mistake
    });
    if (!ok) {
      setMistake(true);
      setFeedback(q.clue);
      tell(speak, q.clue, timeNarrationSegments(q, 'clue'));
      playSfx('wrong');
      return;
    }
    setLocked(true);
    setFeedback(q.explanation);
    const newFirst = first + (!mistake && !hintUsed ? 1 : 0);
    setFirst(newFirst);
    if (ri === run.length - 1) finishChapter(newFirst);
    playSfx('success');
    onGameEvent?.('timeteller', 'answer_correct', {
      level: chapterIndex,
      round: ri,
      seed,
      difficulty: chapter.id,
      skill: q.type === 'set' ? 'set-hands' : 'read-clock',
      item: q.id,
      response: formatClock(time),
      expected: formatClock(q.target),
      correct: true,
      firstAttempt: !mistake,
      independent: !mistake && !hintUsed,
      hints: hintUsed ? 1 : 0
    });
    tell(speak, q.explanation, timeNarrationSegments(q, 'explanation'));
  };
  const hint = () => {
    if (!q || locked || hintUsed) return;
    setHintUsed(true);
    setFeedback(q.clue);
    tell(speak, q.clue, timeNarrationSegments(q, 'clue'));
    onGameEvent?.('timeteller', 'hint', {
      level: chapterIndex,
      round: ri,
      seed,
      difficulty: chapter.id,
      hintType: 'hand-clue'
    });
  };
  const next = () => {
    if (!locked) return;
    cancelNarration();
    if (ri < 5) {
      setRi(ri + 1);
      setMistake(false);
      setHintUsed(false);
      setLocked(false);
      setFeedback('');
      setSetTime({
        hour: 12,
        minute: 0
      });
      return;
    }
    setPhase('done');
    playSfx('complete');
  };
  const finishChapter = earnedFirst => {
    const stars = earnedFirst >= 5 ? 3 : earnedFirst >= 3 ? 2 : 1;
    const result = saveTimeLineRun('timeteller', playerId, chapterIndex, run, stars);
    if (!result) return;
    setProgress(result.progress);
    if (result.awardedStars > 0) onCelebrate(`${chapter.title} complete!`, result.awardedStars * 4, 0, 'timeteller');
    onGameEvent?.('timeteller', 'level_complete', {
      level: chapterIndex,
      round: 5,
      seed,
      difficulty: chapter.id
    });
    setCompletion({ stars, newlyCompleted: result.newlyCompleted, best: result.progress.bestStars[chapter.id] });
  };
  const leave = () => {
    if (phase === 'play') onGameEvent?.('timeteller', 'leave', {
      level: chapterIndex,
      round: ri,
      seed,
      difficulty: chapter.id
    });
    onBack?.();
  };
  const header = <LearningHeader title="Time Teller" subtitle={phase === 'play' ? `Chapter ${chapterIndex + 1} · Mission ${ri + 1} of 6` : 'Look · Move · Tell the time'} onBack={leave} soundOn={soundOn} onToggleSound={onToggleSound} />;
  if (phase === 'start' || phase === 'done') return <div className="min-h-[100dvh] bg-gradient-to-b from-sky-100 via-emerald-50 to-amber-100 p-3 text-slate-900 sm:p-6">{header}
    {phase === 'start' ? <main className="mx-auto mt-5 max-w-4xl">
      <section className="mb-4 rounded-3xl border-2 border-white bg-white/95 p-5 text-center shadow-md"><p className="text-2xl font-black text-sky-950">What time is it?</p><p className="mt-2 font-semibold text-slate-600">Read the hands, then set a clock for your day. Six missions in each chapter.</p></section>
      <LearningChapters chapters={TIME_CHAPTERS} selected={chapterIndex} progress={progress} onSelect={setChapterIndex} />
      <button type="button" onClick={() => start()} className="mt-5 min-h-14 w-full rounded-2xl bg-emerald-800 px-5 text-lg font-black text-white shadow-md">Start {chapter.title} →</button>
      <ClockPractice />
    </main> : <main className="mx-auto mt-6 max-w-2xl rounded-3xl border-2 border-white bg-white p-6 text-center shadow-xl">
      <p className="text-4xl text-amber-500" aria-label={`${completion?.best || 1} best stars`}>{'★'.repeat(completion?.best || 1)}</p><h2 className="mt-3 text-2xl font-black">{chapter.title} complete!</h2><p className="mt-2 font-semibold">{completion?.newlyCompleted ? 'Your clock badge and best stars are saved.' : 'Your best stars and unlocked chapters are safe.'}</p>
      <button className="mt-5 min-h-14 w-full rounded-2xl bg-emerald-800 px-3 font-black text-white" onClick={() => { cancelNarration(); setChapterIndex(progress.unlockedChapter); setPhase('start'); }}>Choose next chapter →</button><button className="mt-3 min-h-12 w-full rounded-2xl border-2 border-emerald-700 bg-white px-3 font-black text-emerald-900" onClick={() => start(chapterIndex)}>Replay {chapter.title}</button>
    </main>}
  </div>;
  return <div className="min-h-[100dvh] bg-gradient-to-b from-sky-100 via-emerald-50 to-amber-100 p-3 text-slate-900 sm:p-6">{header}
    <main className="mx-auto mt-4 max-w-4xl rounded-3xl border-2 border-white bg-white/95 p-4 text-center shadow-xl sm:p-6" data-mission-type={q.type}>
      <p className="mb-1 text-xs font-black uppercase tracking-wide text-sky-800">{q.type === 'set' ? 'Move the hands' : 'Read the clock'}</p>
      <h2 className="mx-auto max-w-2xl text-xl font-black" aria-live="polite">{locked ? timeLabel(q.target) : q.prompt}</h2>
      {!locked && <button className="my-3 inline-flex min-h-12 items-center gap-2 rounded-xl bg-sky-50 px-4 font-black text-sky-900" onClick={() => tell(speak, q.prompt, timeNarrationSegments(q))}><Volume2 size={20} />Hear mission</button>}
      <div className="mt-3"><LearningClock time={q.type === 'set' ? setTime : q.target} onChange={q.type === 'set' && !locked ? setSetTime : undefined} label={q.type === 'set' ? 'Clock setting controls' : locked ? `Clock showing ${timeLabel(q.target)}` : 'Clock face with short red hour hand and long blue minute hand'} /></div>
      {!locked && (q.type === 'set' ? <button onClick={() => attempt(setTime)} className="mx-auto mt-4 min-h-14 w-full max-w-sm rounded-2xl bg-emerald-800 px-4 text-lg font-black text-white">Check clock</button> : <div className="my-4 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Choose the time">{q.options.map(t => <button key={formatClock(t)} onClick={() => attempt(t)} className="min-h-14 rounded-2xl bg-emerald-800 px-3 text-lg font-black text-white">{timeLabel(t)}</button>)}</div>)}
      {locked ? <Explanation text={feedback} onHear={() => tell(speak, q.explanation, timeNarrationSegments(q, 'explanation'))} onNext={next} nextLabel={ri === 5 ? 'Finish chapter' : 'Next mission'} /> : <>
        {feedback && <p role="status" className="my-3 rounded-xl bg-amber-50 p-3 font-bold">{feedback}</p>}
        <button disabled={hintUsed} onClick={hint} className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-amber-400 bg-amber-50 px-4 font-black disabled:opacity-50"><Lightbulb size={20} />{hintUsed ? 'Hint used' : 'Use one hint'}</button>
        <details className="mx-auto mt-3 max-w-xl rounded-xl bg-sky-50 p-3 text-left"><summary className="min-h-12 cursor-pointer p-3 font-bold text-sky-900">How the two hands work</summary><p className="p-3 text-sm font-semibold">The short hand shows the hour. The long hand shows minutes. As minutes pass, the hour hand moves between numbers.</p><button className="inline-flex min-h-12 items-center gap-2 rounded-xl px-4 font-bold" onClick={() => tell(speak, TIME_TELLER_NARRATION.lesson, timeNarrationSegments(TIME_TELLER_NARRATION.lesson))}><Volume2 size={20} />Hear hand lesson</button></details>
      </>}
    </main>
  </div>;
}
