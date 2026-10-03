import { createArithmeticSeed } from '../../data/arithmeticAdventure.js';
import { useEffect, useState } from 'react';
import { ArrowLeft, Lightbulb, Volume2 } from 'lucide-react';
import { NUMBER_LINE_CHAPTERS, createNumberLineRun } from '../../data/timeLineAdventure.js';
import { getTimeLineProgress, rememberTimeLineRun, saveTimeLineRun } from '../../data/timeLineProgress.js';
import { SoundToggle } from '../shared/index.jsx';
const Frog = () => <svg viewBox="0 0 80 64" aria-hidden="true" className="h-12 w-14 drop-shadow-sm">
  <ellipse cx="40" cy="45" rx="30" ry="16" fill="#15803d" />
  <ellipse cx="40" cy="34" rx="27" ry="22" fill="#4ade80" />
  <ellipse cx="40" cy="45" rx="18" ry="12" fill="#d9f99d" />
  <circle cx="24" cy="17" r="13" fill="#4ade80" /><circle cx="56" cy="17" r="13" fill="#4ade80" />
  <circle cx="24" cy="16" r="8" fill="white" /><circle cx="56" cy="16" r="8" fill="white" />
  <circle cx="26" cy="17" r="4" fill="#173b37" /><circle cx="54" cy="17" r="4" fill="#173b37" />
  <path d="M27 34 Q40 44 53 34" fill="none" stroke="#166534" strokeWidth="3" strokeLinecap="round" />
  <ellipse cx="16" cy="55" rx="13" ry="6" fill="#22c55e" /><ellipse cx="64" cy="55" rx="13" ry="6" fill="#22c55e" />
</svg>;

const tell = (speak, line) => speak?.(line, {
  premium: false,
  segments: [line]
});
const VOICE = Object.freeze({
  mission: 'Listen to the number line mission.',
  hint: 'Use the number line to check one step at a time.',
  correct: 'That is right. The number line shows each hop and landing.'
});
const ChapterButton = ({
  c,
  i,
  selected,
  complete,
  locked,
  onClick
}) => <button type="button" disabled={locked} onClick={onClick} aria-pressed={selected} className={`min-h-16 rounded-2xl border-2 p-3 text-left font-black disabled:opacity-50 ${selected ? 'border-orange-700 bg-orange-100' : 'border-white bg-white'}`}><span className="block text-xs uppercase">World {i + 1}{complete ? ' · Badge earned' : locked ? ' · Locked' : ''}</span>{c.title}</button>;
export default function NumberLineJump({
  onBack,
  playSfx = () => {},
  soundOn,
  onToggleSound,
  speak = () => {},
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
  const [position, setPosition] = useState(0);
  const [trail, setTrail] = useState([]);
  const chapter = NUMBER_LINE_CHAPTERS[chapterIndex],
    q = run[ri];
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
      tell(speak, VOICE.mission);
    }
  }, [phase, q, chapterIndex, ri, seed, chapter.id, speak, onGameEvent]);
  const start = (index = chapterIndex) => {
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
      playSfx('wrong');
      return;
    }
    setLocked(true);
    setFeedback(q.explanation);
    setFirst(n => n + (!mistake && !hintUsed ? 1 : 0));
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
    tell(speak, VOICE.correct);
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
    tell(speak, VOICE.hint);
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
    const stars = first >= 5 ? 3 : first >= 3 ? 2 : 1;
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
    setFeedback(result.newlyCompleted
      ? `${chapter.title} complete. You earned ${stars} ${stars === 1 ? 'star' : 'stars'}.`
      : `Replay complete. Your best is ${result.progress.bestStars[chapter.id]} ${result.progress.bestStars[chapter.id] === 1 ? 'star' : 'stars'}.`);
    setPhase('done');
    playSfx('complete');
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
  const line = (limit, markers = {}) => <div className="relative h-36 px-6" style={{
    minWidth: Math.max(760, (limit + 1) * 54)
  }} role="group" aria-label={`Number line from 0 to ${limit}`}><div className="absolute bottom-7 left-6 right-6 h-1 rounded-full bg-orange-400" />
    {q?.type === 'hop' && <div key={q.id} className="absolute top-4 -translate-x-1/2 transition-[left] duration-300 motion-reduce:transition-none" style={{left: `${4 + (position / limit) * 92}%`}}><Frog /></div>}{Array.from({
      length: limit + 1
    }, (_, n) => <div key={n} className="absolute bottom-2 flex -translate-x-1/2 flex-col items-center" style={{
      left: `${4 + n / limit * 92}%`
    }}><span className={`mb-1 grid h-11 min-w-11 place-items-center rounded-full border-2 text-sm font-black ${q?.type === 'hop' && (trail.includes(n) || position === n) ? 'border-orange-600 bg-orange-500 text-white' : 'border-orange-200 bg-white text-slate-800'}`}>{n}{markers[n] && <span className="ml-0.5 text-[9px]">{markers[n]}</span>}</span><span className="h-4 w-0.5 bg-orange-400" /></div>)}</div>;
  const markers = {};
  const mark = (value, label) => { markers[value] = markers[value] ? `${markers[value]}/${label}` : label; };
  if (q?.type === 'hop') mark(position, 'F');
  if (q?.type === 'missing') {
    if (q.missing !== 0) mark(q.start, 'S');
    if (q.missing !== 2) mark(q.end, 'L');
  }
  if (q?.type === 'compare') {
    mark(q.start1, 'A'); mark(q.end1, 'A');
    mark(q.start2, 'B'); mark(q.end2, 'B');
  }

  if (phase === 'start' || phase === 'done') return <div className="min-h-[100dvh] bg-gradient-to-b from-orange-100 via-amber-50 to-teal-100 p-3 text-slate-900 sm:p-6"><header className="mx-auto flex max-w-4xl items-center justify-between rounded-3xl bg-white p-3 shadow"><button className="game-icon-button !min-h-12 !min-w-12" onClick={leave} aria-label="Back"><ArrowLeft /></button><h1 className="text-xl font-black sm:text-3xl">Number Line Jump</h1><SoundToggle soundOn={soundOn} onToggle={onToggleSound} /></header>{phase === 'start' ? <main className="mx-auto mt-5 max-w-4xl"><p className="mb-4 rounded-2xl bg-white p-4 text-center font-bold">Make each hop, find missing numbers, and compare number line journeys. Each world has six missions; explanations stay until Next.</p><div className="grid gap-3 sm:grid-cols-3">{NUMBER_LINE_CHAPTERS.map((c, i) => <ChapterButton key={c.id} c={c} i={i} selected={i === chapterIndex} complete={progress.completedChapterIds.includes(c.id)} locked={i > progress.unlockedChapter} onClick={() => setChapterIndex(i)} />)}</div><button onClick={() => start()} className="mt-5 min-h-14 w-full rounded-2xl bg-orange-700 px-5 text-lg font-black text-white">Start {chapter.title}</button></main> : <main className="mx-auto mt-8 max-w-2xl rounded-3xl bg-white p-6 text-center shadow-xl"><p className="text-2xl font-black">{feedback}</p><p className="mt-3">{progress.completedChapterIds.length < 3 ? 'Choose the next unlocked world or replay this one.' : 'All three worlds are complete. Replay any world.'}</p><button className="mt-5 min-h-14 w-full rounded-2xl bg-orange-700 font-black text-white" onClick={() => {
        setChapterIndex(progress.unlockedChapter);
        setPhase('start');
      }}>Continue</button><button className="mt-3 min-h-14 w-full rounded-2xl bg-white font-black text-orange-900 ring-2 ring-orange-700" onClick={() => start(chapterIndex)}>Replay {chapter.title}</button></main>}</div>;
  const limit = chapter.max;
  return <div className="min-h-[100dvh] overflow-y-auto bg-gradient-to-b from-orange-100 via-amber-50 to-teal-100 p-3 text-slate-900 sm:p-6"><header className="mx-auto flex max-w-4xl items-center justify-between rounded-3xl bg-white p-3 shadow"><button className="game-icon-button !min-h-12 !min-w-12" onClick={leave} aria-label="Back"><ArrowLeft /></button><div className="text-center"><p className="text-xs font-black uppercase">World {chapterIndex + 1} of 3 · Mission {ri + 1} of 6</p><h1 className="text-xl font-black sm:text-3xl">Number Line Jump</h1></div><SoundToggle soundOn={soundOn} onToggle={onToggleSound} /></header><main className="mx-auto mt-4 max-w-4xl rounded-3xl bg-white/90 p-4 text-center shadow-xl sm:p-6"><p className="mb-2 text-lg font-bold" aria-live="polite">{q.prompt}</p><button className="mb-4 inline-flex min-h-12 items-center gap-2 rounded-xl bg-orange-100 px-4 font-black" onClick={() => tell(speak, VOICE.mission)}><Volume2 size={20} /> Hear mission</button>{q.type === 'hop' && <p className="mb-3 font-black text-orange-800">Start at {q.a}. Make {q.b} hop{q.b === 1 ? '' : 's'} {q.direction > 0 ? 'forward →' : 'back ←'}.</p>}{q.type === 'missing' && <p className="mb-3 font-black text-orange-800">The line shows 0 to 20. Find the missing part of the equation.</p>}{q.type === 'compare' && <div className="mb-3 grid gap-2 sm:grid-cols-2"><p className="rounded-xl bg-orange-50 p-3 font-bold">A: {q.start1} → {q.end1} ({q.hops1} hops)</p><p className="rounded-xl bg-teal-50 p-3 font-bold">B: {q.start2} → {q.end2} ({q.hops2} hops)</p></div>}<p className="mb-1 text-xs font-bold text-slate-600">Scroll along the number line. Use Enter, Space, or the arrow keys on the hop buttons.</p><div className="mb-3 overflow-x-auto rounded-2xl border-2 border-orange-200 bg-orange-50" tabIndex="0" aria-label="Scrollable number line from zero to the chapter limit">{line(limit, markers)}</div>{q.type === 'hop' ? <><p className="mb-2 font-bold" aria-live="polite">Frog at {position} · {trail.length} of {q.b} hops made</p><div className="grid grid-cols-2 gap-2"><button disabled={locked || position >= 10 || trail.length >= q.b} onClick={() => hopTo(position + 1)} onKeyDown={e => {
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              hopTo(position + 1);
            }
          }} className="min-h-14 rounded-2xl bg-orange-600 font-black text-white disabled:opacity-50">Hop forward →</button><button disabled={locked || position <= 0 || trail.length >= q.b} onClick={() => hopTo(position - 1)} onKeyDown={e => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              hopTo(position - 1);
            }
          }} className="min-h-14 rounded-2xl bg-teal-700 font-black text-white disabled:opacity-50">← Hop back</button></div><div className="sr-only" aria-live="polite">Accepted hops: {trail.join(', ') || 'none'}</div></> : <div className="my-4 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Choose the answer">{q.options.map(o => <button key={o} disabled={locked} onClick={() => answer(o)} className="min-h-14 rounded-2xl bg-orange-700 px-3 text-xl font-black text-white disabled:opacity-60">{o === 'same' ? 'Same' : o}</button>)}</div>}{feedback && <p role="status" className="mx-auto mb-3 max-w-2xl rounded-xl bg-orange-50 p-3 font-bold">{feedback}</p>}{!locked && <button disabled={hintUsed} onClick={hint} className="inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-amber-500 bg-amber-50 px-4 font-black disabled:opacity-50"><Lightbulb size={20} />{hintUsed ? 'Hint used' : 'Use one hint'}</button>}{locked && <button onClick={next} className="mt-3 min-h-14 w-full rounded-2xl bg-orange-800 text-lg font-black text-white">{ri === 5 ? 'Finish world' : 'Next mission'}</button>}</main></div>;
}
