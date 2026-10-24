import { createArithmeticSeed } from '../../data/arithmeticAdventure.js';
import { useEffect, useState } from 'react';
import { Lightbulb, Volume2 } from 'lucide-react';
import { NUMBER_LINE_CHAPTERS, createNumberLineRun } from '../../data/timeLineAdventure.js';
import { numberLineNarrationSegments, numberLineNarrationText } from '../../data/batch4Narration.js';
import { getTimeLineProgress, rememberTimeLineRun, saveTimeLineRun } from '../../data/timeLineProgress.js';
import { LearningHeader, LearningChapters, Explanation } from './TimeLineLearningUI.jsx';
import NumberLineJourney, { Frog } from './NumberLineJourney.jsx';
const tell = (speak, line, segments) => speak?.(line, { premium: false, segments });
const noopCancel = () => {};
export default function NumberLineJump({
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
  const [progress, setProgress] = useState(() => getTimeLineProgress('numberline', playerId));
  const [chapterIndex, setChapterIndex] = useState(() => getTimeLineProgress('numberline', playerId).unlockedChapter);
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
  const [position, setPosition] = useState(0);
  const [trail, setTrail] = useState([]);
  const chapter = NUMBER_LINE_CHAPTERS[chapterIndex],
    q = run[ri];
  useEffect(() => () => cancelNarration(), [cancelNarration]);
  useEffect(() => {
    onPhaseChange?.(phase === 'done' ? 'finish' : phase === 'start' ? 'intro' : 'play');
  }, [phase, onPhaseChange]);
  useEffect(() => {
    if (phase === 'play' && q) {
      onGameEvent?.('numberline', 'question', {
        level: chapterIndex,
        round: ri,
        seed,
        difficulty: chapter.id
      });
      tell(speak, numberLineNarrationText(q), numberLineNarrationSegments(q));
    }
  }, [phase, q, chapterIndex, ri, seed, chapter.id, speak, onGameEvent]);
  const start = (index = chapterIndex) => {
    cancelNarration();
    const s = createArithmeticSeed();
    const recent = getTimeLineProgress('numberline', playerId).recentQuestionIds[index] || [];
    const next = createNumberLineRun({
      chapter: index,
      seed: s,
      recentIds: recent
    });
    rememberTimeLineRun('numberline', playerId, index, next);
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
    setTrail([]);
    setPosition(next[0]?.a || next[0]?.start || 0);
    setPhase('play');
    onGameEvent?.('numberline', 'start', {
      level: index,
      seed: s,
      difficulty: NUMBER_LINE_CHAPTERS[index].id
    });
  };
  const answer = value => {
    if (!q || locked) return;
    const ok = value === q.answer;
    onGameEvent?.('numberline', 'answer_attempt', {
      level: chapterIndex,
      round: ri,
      seed,
      difficulty: chapter.id,
      item: q.id,
      response: value,
      correct: ok,
      diagnosticOnly: ok,
      skill: q.type,
      firstAttempt: !mistake
    });
    if (!ok) {
      setMistake(true);
      setFeedback(q.clue);
      tell(speak, q.clue, numberLineNarrationSegments(q, 'clue'));
      playSfx('wrong');
      return;
    }
    setLocked(true);
    setFeedback(q.explanation);
    const newFirst = first + (!mistake && !hintUsed ? 1 : 0);
    setFirst(newFirst);
    if (ri === run.length - 1) finishChapter(newFirst);
    playSfx('success');
    onGameEvent?.('numberline', 'answer_correct', {
      level: chapterIndex,
      round: ri,
      seed,
      difficulty: chapter.id,
      skill: q.type,
      item: q.id,
      response: value,
      expected: q.answer,
      correct: true,
      firstAttempt: !mistake,
      independent: !mistake && !hintUsed,
      hints: hintUsed ? 1 : 0
    });
    tell(speak, q.explanation, numberLineNarrationSegments(q, 'explanation'));
  };
  const hopTo = value => {
    if (!q || locked || q.type !== 'hop') return;
    const dir = q.direction;
    const next = position + dir;
    if (next < 0 || next > 10 || trail.length >= q.b) return;
    if (value !== next) {
      onGameEvent?.('numberline', 'answer_attempt', {
        level: chapterIndex, round: ri, seed, difficulty: chapter.id,
        skill: 'hop', item: q.id, response: value, correct: false, firstAttempt: !mistake,
      });
      setMistake(true);
      setFeedback('Take one number at a time in the direction shown.');
      tell(speak, q.clue, numberLineNarrationSegments(q, 'clue'));
      playSfx('wrong');
      return;
    }
    const nextTrail = [...trail, next];
    setTrail(nextTrail);
    setPosition(next);
    onGameEvent?.('numberline', 'hop', {
      level: chapterIndex,
      round: ri,
      seed,
      difficulty: chapter.id,
      step: nextTrail.length
    });
    if (nextTrail.length === q.b) answer(next);
  };
  const hint = () => {
    if (!q || locked || hintUsed) return;
    setHintUsed(true);
    setFeedback(q.clue);
    tell(speak, q.clue, numberLineNarrationSegments(q, 'clue'));
    onGameEvent?.('numberline', 'hint', {
      level: chapterIndex,
      round: ri,
      seed,
      difficulty: chapter.id,
      hintType: 'hop-clue'
    });
  };
  const next = () => {
    if (!locked) return;
    cancelNarration();
    if (ri < 5) {
      const index = ri + 1;
      setRi(index);
      setMistake(false);
      setHintUsed(false);
      setLocked(false);
      setFeedback('');
      setTrail([]);
      setPosition(run[index].a || run[index].start || 0);
      return;
    }
    setPhase('done');
    playSfx('complete');
  };
  const finishChapter = earnedFirst => {
    const stars = earnedFirst >= 5 ? 3 : earnedFirst >= 3 ? 2 : 1;
    const result = saveTimeLineRun('numberline', playerId, chapterIndex, run, stars);
    if (!result) return;
    setProgress(result.progress);
    if (result.awardedStars > 0) onCelebrate(`${chapter.title} complete!`, result.awardedStars * 4, 0, 'numberline');
    onGameEvent?.('numberline', 'level_complete', {
      level: chapterIndex,
      round: 5,
      seed,
      difficulty: chapter.id
    });
    setCompletion({ stars, newlyCompleted: result.newlyCompleted, best: result.progress.bestStars[chapter.id] });
  };
  const leave = () => {
    if (phase === 'play') onGameEvent?.('numberline', 'leave', {
      level: chapterIndex,
      round: ri,
      seed,
      difficulty: chapter.id
    });
    onBack?.();
  };
  const header = <LearningHeader title="Number Line Jump" subtitle={phase === 'play' ? `World ${chapterIndex + 1} · Mission ${ri + 1} of 6` : 'One hop · One space'} onBack={leave} soundOn={soundOn} onToggleSound={onToggleSound} />;
  if (phase === 'start' || phase === 'done') return <div className="min-h-[100dvh] bg-gradient-to-b from-sky-100 via-lime-50 to-amber-100 p-3 text-slate-900 sm:p-6">{header}
    {phase === 'start' ? <main className="mx-auto mt-5 max-w-4xl"><section className="mb-4 flex items-center justify-center gap-4 rounded-3xl border-2 border-white bg-white/95 p-5 shadow-md"><Frog /><div><p className="text-2xl font-black text-teal-950">Where will your frog land?</p><p className="mt-2 font-semibold text-slate-600">Make one hop at a time. Six missions in each world.</p></div></section>
      <LearningChapters chapters={NUMBER_LINE_CHAPTERS} selected={chapterIndex} progress={progress} onSelect={setChapterIndex} noun="World" />
      <button onClick={() => start()} className="mt-5 min-h-14 w-full rounded-2xl bg-teal-800 px-5 text-lg font-black text-white shadow-md">Start {chapter.title} →</button>
    </main> : <main className="mx-auto mt-6 max-w-2xl rounded-3xl border-2 border-white bg-white p-6 text-center shadow-xl"><p className="text-4xl text-amber-500" aria-label={`${completion?.best || 1} best stars`}>{'★'.repeat(completion?.best || 1)}</p><h2 className="mt-3 text-2xl font-black">{chapter.title} complete!</h2><p className="mt-2 font-semibold">{completion?.newlyCompleted ? 'Your journey badge and best stars are saved.' : 'Your best stars and unlocked worlds are safe.'}</p>
      <button className="mt-5 min-h-14 w-full rounded-2xl bg-teal-800 px-3 font-black text-white" onClick={() => { cancelNarration(); setChapterIndex(progress.unlockedChapter); setPhase('start'); }}>Choose next world →</button><button className="mt-3 min-h-12 w-full rounded-2xl border-2 border-teal-700 bg-white px-3 font-black text-teal-900" onClick={() => start(chapterIndex)}>Replay {chapter.title}</button></main>}
  </div>;
  const limit = chapter.max;
  const missingStart = q.type === 'missing' && q.missing === 0 && !locked && !hintUsed;
  const missingEnd = q.type === 'missing' && q.missing === 2 && !locked && !hintUsed;
  return <div className="min-h-[100dvh] bg-gradient-to-b from-sky-100 via-lime-50 to-amber-100 p-3 text-slate-900 sm:p-6">{header}
    <main className="mx-auto mt-4 max-w-4xl rounded-3xl border-2 border-white bg-white/95 p-4 text-center shadow-xl sm:p-6" data-mission-type={q.type}>
      <p className="mb-1 text-xs font-black uppercase tracking-wide text-teal-800">{q.type === 'hop' ? 'Make the journey' : q.type === 'missing' ? 'Find the missing part' : q.compare === 'farther' ? 'Compare the distance' : 'Compare the landing numbers'}</p>
      <h2 className="mx-auto max-w-2xl text-xl font-black" aria-live="polite">{locked ? 'Your journey, explained' : q.prompt}</h2>
      {!locked && <button className="my-3 inline-flex min-h-12 items-center gap-2 rounded-xl bg-teal-50 px-4 font-black text-teal-900" onClick={() => tell(speak, numberLineNarrationText(q), numberLineNarrationSegments(q))}><Volume2 size={20} />Hear mission</button>}
      {q.type === 'compare' ? <div className="mt-3 grid gap-3">
        <NumberLineJourney limit={limit} start={q.start1} end={q.end1} position={q.end1} showRoute label={`Frog A · ${q.hops1} hops`} />
        <NumberLineJourney limit={limit} start={q.start2} end={q.end2} position={q.end2} showRoute label={`Frog B · ${q.hops2} hops`} />
      </div> : <div className="mt-3"><NumberLineJourney limit={limit} label={q.type === 'hop' ? `${trail.length} of ${q.b} hops made` : q.missing === 0 ? 'Find the start' : q.missing === 1 ? 'Count the spaces' : 'Find the landing number'}
        start={q.type === 'hop' ? q.a : missingStart ? undefined : q.start} end={q.type === 'hop' || missingEnd ? undefined : q.end} position={q.type === 'hop' ? position : missingEnd ? q.start : q.end}
        trail={trail} showRoute={q.type === 'missing' && (hintUsed || locked)} onSwipe={q.type === 'hop' ? dir => hopTo(position + dir) : undefined} disabled={locked} /></div>}
      {!locked && (q.type === 'hop' ? <>
        <p className="mt-3 rounded-xl bg-teal-50 p-3 font-black text-teal-900">Start {q.a} · {q.b} {q.b === 1 ? 'hop' : 'hops'} {q.direction > 0 ? 'forward →' : 'back ←'}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button disabled={position <= 0 || trail.length >= q.b} onClick={() => hopTo(position - 1)} onKeyDown={e => { if (e.key === 'ArrowLeft') { e.preventDefault(); hopTo(position - 1); } }} className="min-h-14 rounded-2xl border-2 border-teal-700 bg-white px-2 font-black text-teal-900 disabled:opacity-50">← Hop back</button>
          <button disabled={position >= 10 || trail.length >= q.b} onClick={() => hopTo(position + 1)} onKeyDown={e => { if (e.key === 'ArrowRight') { e.preventDefault(); hopTo(position + 1); } }} className="min-h-14 rounded-2xl bg-teal-800 px-2 font-black text-white disabled:opacity-50">Hop forward →</button>
        </div><p className="mt-2 text-sm font-semibold text-slate-600">Tap a hop button, use its arrow key, or swipe the frog.</p><p className="sr-only" aria-live="polite">Frog at {position}. Accepted hops: {trail.join(', ') || 'none'}.</p>
      </> : <div className="my-4 grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="Choose the answer">{q.options.map(o => <button key={o} onClick={() => answer(o)} className="min-h-14 rounded-2xl bg-teal-800 px-3 text-xl font-black text-white">{o === 'same' ? 'Same' : q.type === 'compare' ? `Frog ${o}` : o}</button>)}</div>)}
      {locked ? <Explanation text={feedback} onHear={() => tell(speak, q.explanation, numberLineNarrationSegments(q, 'explanation'))} onNext={next} nextLabel={ri === 5 ? 'Finish world' : 'Next mission'} /> : <>
        {feedback && <p role="status" className="my-3 rounded-xl bg-amber-50 p-3 font-bold">{feedback}</p>}
        <button disabled={hintUsed} onClick={hint} className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-amber-400 bg-amber-50 px-4 font-black disabled:opacity-50"><Lightbulb size={20} />{hintUsed ? 'Hint used' : 'Use one hint'}</button>
      </>}
    </main>
  </div>;
}
