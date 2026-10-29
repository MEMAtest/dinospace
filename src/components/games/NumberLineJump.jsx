import { createArithmeticSeed } from '../../data/arithmeticAdventure.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Lightbulb, Volume2 } from 'lucide-react';
import { NUMBER_LINE_CHAPTERS, createNumberLineRun } from '../../data/timeLineAdventure.js';
import { numberLineNarrationSegments, numberLineNarrationText } from '../../data/batch4Narration.js';
import {
  readTimeLineProgressStrict, rememberTimeLineRunStrict, recordTimeLineRunCompletionStrict,
  getPendingTimeLineRewardReceiptsStrict, pendingTimeLineRewardReceipts, markTimeLineRewardReceiptClaimedStrict,
} from '../../data/timeLineProgress.js';
import { rewardClaimToken } from '../../data/playerRewards.js';
import { LearningHeader } from './TimeLineLearningUI.jsx';
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
  const [progressState, setProgressState] = useState(() => readTimeLineProgressStrict('numberline', playerId));
  const progress = progressState.ok ? progressState.progress : { completedChapterIds: [], bestStars: {}, recentQuestionIds: {}, unlockedChapter: 0 };
  const [chapterIndex, setChapterIndex] = useState(() => readTimeLineProgressStrict('numberline', playerId).progress?.unlockedChapter || 0);
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
  const [startError, setStartError] = useState('');
  const [completionError, setCompletionError] = useState('');
  const [completionBusy, setCompletionBusy] = useState(false);
  const [rewardDrainBusy, setRewardDrainBusy] = useState(true);
  const [rewardClaimError, setRewardClaimError] = useState(false);
  const [pendingRewardReceipt, setPendingRewardReceipt] = useState(null);
  const [progressRetryBusy, setProgressRetryBusy] = useState(false);
  const [pendingStart, setPendingStart] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const startRef = useRef(null);
  const completionRef = useRef(null);
  const completionBusyRef = useRef(false);
  const receiptClaimsRef = useRef(new Map());
  const receiptDrainRef = useRef(null);
  const reconciledReceiptsRef = useRef(new Set());
  const chapter = NUMBER_LINE_CHAPTERS[chapterIndex],
    q = run[ri];
  const canStart = progressState.ok && !rewardDrainBusy && !pendingRewardReceipt && !rewardClaimError;
  const refreshProgress = useCallback(() => {
    const loaded = readTimeLineProgressStrict('numberline', playerId);
    setProgressState(loaded);
    return loaded;
  }, [playerId]);

  const claimRewardReceipt = useCallback(async (receipt) => {
    if (!receipt?.id || !Number.isInteger(receipt.rewardDelta) || receipt.rewardDelta <= 0 || receipt.claimed) return true;
    const claimId = `${playerId || 'amari'}:${receipt.id}`;
    if (reconciledReceiptsRef.current.has(claimId)) return true;
    const existing = receiptClaimsRef.current.get(claimId);
    if (existing) return existing;
    const operation = Promise.resolve().then(async () => {
      setPendingRewardReceipt(receipt);
      let parent;
      try {
        parent = await onCelebrate(`${NUMBER_LINE_CHAPTERS.find(({ id }) => id === receipt.chapterId)?.title || 'Number Line'} complete!`, receipt.rewardDelta * 4, 0, 'numberline', { quiet: true, rewardToken: rewardClaimToken('numberline', receipt.id) });
      } catch { parent = null; }
      if (parent?.persisted !== true) { setRewardClaimError(true); return false; }
      const marked = markTimeLineRewardReceiptClaimedStrict('numberline', playerId, receipt.id);
      if (!marked.ok) { setRewardClaimError(true); return false; }
      reconciledReceiptsRef.current.add(claimId);
      setProgressState({ ok: true, progress: marked.progress });
      setPendingRewardReceipt(null);
      setRewardClaimError(false);
      return true;
    });
    receiptClaimsRef.current.set(claimId, operation);
    try { return await operation; }
    finally { if (receiptClaimsRef.current.get(claimId) === operation) receiptClaimsRef.current.delete(claimId); }
  }, [onCelebrate, playerId]);

  const drainPendingRewards = useCallback(async () => {
    if (receiptDrainRef.current) return receiptDrainRef.current;
    const operation = (async () => {
      setRewardDrainBusy(true);
      setRewardClaimError(false);
      const loaded = getPendingTimeLineRewardReceiptsStrict('numberline', playerId);
      if (!loaded.ok) { setProgressState(loaded); setRewardClaimError(true); return false; }
      setProgressState(loaded);
      let failed = false;
      for (const receipt of loaded.receipts) if (!await claimRewardReceipt(receipt)) failed = true;
      if (failed) { setRewardClaimError(true); return false; }
      setPendingRewardReceipt(null);
      setRewardClaimError(false);
      refreshProgress();
      return true;
    })();
    receiptDrainRef.current = operation;
    try { return await operation; }
    finally { if (receiptDrainRef.current === operation) receiptDrainRef.current = null; setRewardDrainBusy(false); }
  }, [claimRewardReceipt, playerId, refreshProgress]);
  useEffect(() => () => cancelNarration(), [cancelNarration]);
  useEffect(() => {
    onPhaseChange?.(phase === 'done' ? 'finish' : phase === 'start' ? 'intro' : 'play');
  }, [phase, onPhaseChange]);
  useEffect(() => {
    if (phase !== 'start') return undefined;
    const timer = window.setTimeout(() => { void drainPendingRewards(); }, 0);
    return () => window.clearTimeout(timer);
  }, [drainPendingRewards, phase]);
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
  const start = (index = chapterIndex, retry = false) => {
    cancelNarration();
    const loaded = refreshProgress();
    if (!loaded.ok) { setStartError('Saved progress is unavailable. Try again before starting.'); return; }
    const pending = getPendingTimeLineRewardReceiptsStrict('numberline', playerId);
    if (!pending.ok || pending.receipts.length || rewardDrainBusy || pendingRewardReceipt || rewardClaimError) {
      setStartError('Finish syncing your saved reward before you start.');
      void drainPendingRewards();
      return;
    }
    if (!Number.isInteger(index) || index < 0 || index >= NUMBER_LINE_CHAPTERS.length || index > loaded.progress.unlockedChapter) return;
    let attempt = retry && startRef.current?.chapterIndex === index ? startRef.current : null;
    if (!attempt) {
      const s = createArithmeticSeed();
      const recent = loaded.progress.recentQuestionIds[index] || [];
      const queue = createNumberLineRun({ chapter: index, seed: s, recentIds: recent });
      attempt = { chapterIndex: index, seed: s, run: queue };
    }
    startRef.current = attempt;
    const remembered = rememberTimeLineRunStrict('numberline', playerId, index, attempt.run);
    if (!remembered.ok) {
      setProgressState(loaded);
      setChapterIndex(index);
      setPendingStart(attempt);
      setStartError('This run is ready. Save it to begin.');
      return;
    }
    startRef.current = null;
    setPendingStart(null);
    setProgressState({ ok: true, progress: remembered.progress });
    setStartError('');
    setChapterIndex(index);
    setSeed(attempt.seed);
    setRun(attempt.run);
    setRi(0);
    setMistake(false);
    setHintUsed(false);
    setLocked(false);
    setFirst(0);
    setFeedback('');
    setCompletion(null);
    setCompletionError('');
    completionRef.current = null;
    setTrail([]);
    setPosition(attempt.run[0]?.a ?? attempt.run[0]?.start ?? 0);
    setPhase('play');
    onGameEvent?.('numberline', 'start', {
      level: index,
      seed: attempt.seed,
      difficulty: NUMBER_LINE_CHAPTERS[index].id
    });
    if (loaded.progress.completedChapterIds.includes(NUMBER_LINE_CHAPTERS[index].id)) onGameEvent?.('numberline', 'replay', { level: index, seed: attempt.seed, difficulty: NUMBER_LINE_CHAPTERS[index].id });
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
    if (ri === run.length - 1) {
      const stars = newFirst >= 5 ? 3 : newFirst >= 3 ? 2 : 1;
      completionRef.current = { chapterIndex, run, stars, seed, earnedFirst: newFirst, newlyCompleted: undefined, completionEventSent: false };
      setCompletionError('');
    }
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
      setPosition(run[index].a ?? run[index].start ?? 0);
      return;
    }
    void finishChapter(completionRef.current);
  };
  const finishChapter = async (draft = completionRef.current) => {
    if (!draft || completionBusyRef.current) return false;
    completionBusyRef.current = true;
    setCompletionBusy(true);
    setCompletionError('');
    completionRef.current = draft;
    if (draft.newlyCompleted === undefined) {
      const before = readTimeLineProgressStrict('numberline', playerId);
      if (!before.ok) {
        setProgressState(before);
        setCompletionError('Progress needs a check before you finish. Try again.');
        setCompletionBusy(false);
        completionBusyRef.current = false;
        return false;
      }
      const chapterId = NUMBER_LINE_CHAPTERS[draft.chapterIndex]?.id;
      draft.newlyCompleted = !before.progress.completedChapterIds.includes(chapterId)
        && (before.progress.bestStars[chapterId] || 0) === 0
        && before.progress.completedChapterIds.length === draft.chapterIndex;
    }
    const result = recordTimeLineRunCompletionStrict('numberline', playerId, draft.chapterIndex, draft.run, draft.stars);
    if (!result.ok) {
      setCompletionError('This result is ready. Try saving again.');
      setCompletionBusy(false);
      completionBusyRef.current = false;
      return false;
    }
    draft.newlyCompleted = Boolean(draft.newlyCompleted || result.newlyCompleted);
    setProgressState({ ok: true, progress: result.progress });
    if (!draft.completionEventSent) {
      draft.completionEventSent = true;
      onGameEvent?.('numberline', 'level_complete', { level: draft.chapterIndex, round: 5, seed: draft.seed, difficulty: NUMBER_LINE_CHAPTERS[draft.chapterIndex].id });
    }
    const drained = await drainPendingRewards();
    if (!drained) {
      setCompletionError('Your result is saved. Retry the reward.');
      setCompletionBusy(false);
      completionBusyRef.current = false;
      return false;
    }
    const latest = readTimeLineProgressStrict('numberline', playerId);
    if (!latest.ok || pendingTimeLineRewardReceipts(latest.progress).length) {
      if (!latest.ok) setProgressState(latest);
      setCompletionError('Saved rewards need a check. Retry to finish.');
      setCompletionBusy(false);
      completionBusyRef.current = false;
      return false;
    }
    const currentChapter = NUMBER_LINE_CHAPTERS[draft.chapterIndex];
    setProgressState(latest);
    setCompletion({ stars: draft.stars, newlyCompleted: draft.newlyCompleted, best: latest.progress.bestStars[currentChapter.id] });
    setFeedback(draft.newlyCompleted ? `World complete! You earned ${draft.stars} ${draft.stars === 1 ? 'star' : 'stars'}.` : `Replay complete! Your best is ${latest.progress.bestStars[currentChapter.id]} stars.`);
    setCompletionError('');
    setPhase('done');
    playSfx('complete');
    completionBusyRef.current = false;
    setCompletionBusy(false);
    completionRef.current = null;
    return true;
  };

  const retryProgressRead = () => {
    setProgressRetryBusy(true);
    const loaded = readTimeLineProgressStrict('numberline', playerId);
    setProgressState(loaded);
    if (loaded.ok) setChapterIndex((current) => Math.min(current, loaded.progress.unlockedChapter));
    setProgressRetryBusy(false);
    if (loaded.ok) void drainPendingRewards();
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
    {phase === 'start' ? <main className="mx-auto mt-3 max-w-4xl" data-numberline-menu>
      {!progressState.ok && <section role="alert" className="mb-2 rounded-2xl border-2 border-rose-600 bg-white p-3 text-center font-bold"><p>Saved world progress could not be checked. Worlds stay locked until it can be read.</p><button type="button" onClick={retryProgressRead} disabled={progressRetryBusy} className="mt-2 min-h-12 rounded-xl bg-rose-700 px-4 text-white">{progressRetryBusy ? 'Checking progress…' : 'Retry saved progress'}</button></section>}
      {rewardDrainBusy && <p role="status" className="mb-2 rounded-xl bg-white p-2 text-center text-sm font-semibold">Checking saved world rewards…</p>}
      {rewardClaimError && <section role="alert" className="mb-2 rounded-2xl border-2 border-amber-600 bg-white p-3 text-center font-bold"><p>A saved world reward still needs confirmation.</p><button type="button" onClick={() => void drainPendingRewards()} disabled={rewardDrainBusy} className="mt-2 min-h-12 rounded-xl bg-amber-700 px-4 text-white">Retry reward confirmation</button></section>}
      {startError && <p role="alert" className="mb-2 rounded-xl border-2 border-rose-500 bg-white p-3 text-center font-bold">{startError}</p>}
      <section className="rounded-3xl border-2 border-teal-200 bg-white p-4 text-center shadow-md sm:p-6" aria-label="Selected number line world">
        <div className="flex items-center justify-center gap-3"><Frog /><div className="text-left"><p className="text-xs font-black uppercase tracking-wide text-teal-800">Selected · World {chapterIndex + 1} of 3</p><h2 className="text-xl font-black text-teal-950">{chapter.title}</h2><p className="text-sm font-semibold text-slate-600">{chapter.skill} · 6 missions</p></div></div>
        <button type="button" data-numberline-start disabled={!canStart || chapterIndex > progress.unlockedChapter} onClick={() => start(chapterIndex, Boolean(pendingStart))} className="mt-3 min-h-14 w-full rounded-2xl bg-teal-800 px-5 text-lg font-black text-white shadow-md disabled:opacity-50">
          {pendingStart ? 'Retry saving this same six-mission run' : progress.completedChapterIds.includes(chapter.id) ? `Replay ${chapter.title}` : `Start ${chapter.title} →`}
        </button>
      </section>
      <details className="mt-3 rounded-2xl border border-sky-100 bg-white p-3 shadow" open={pickerOpen} onToggle={(event) => setPickerOpen(event.currentTarget.open)}>
        <summary className="min-h-12 cursor-pointer content-center font-black">Choose another world</summary>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">{NUMBER_LINE_CHAPTERS.map((item, index) => {
          const complete = progress.completedChapterIds.includes(item.id); const isLocked = !progressState.ok || index > progress.unlockedChapter;
          return <button type="button" key={item.id} disabled={isLocked || Boolean(pendingStart)} aria-pressed={chapterIndex === index} onClick={() => { setChapterIndex(index); setStartError(''); setPickerOpen(false); }} className={`min-h-14 rounded-xl border-2 p-2 text-left font-bold disabled:opacity-50 ${chapterIndex === index ? 'border-teal-700 bg-teal-50' : 'border-slate-200 bg-white'}`}>
            <span className="block text-xs font-black uppercase text-teal-800">World {index + 1}{complete ? ' · Badge earned' : isLocked ? ' · Locked' : ' · Ready'}</span>{item.title}{complete && <span className="block text-sm">{'★'.repeat(progress.bestStars[item.id] || 1)} · Best stars</span>}
          </button>;
        })}</div>
      </details>
    </main> : <main className="mx-auto mt-6 max-w-2xl rounded-3xl border-2 border-white bg-white p-6 text-center shadow-xl"><p className="text-4xl text-amber-500" aria-label={`${completion?.best || 1} best stars`}>{'★'.repeat(completion?.best || 1)}</p><h2 className="mt-3 text-2xl font-black">{chapter.title} complete!</h2><p className="mt-2 font-semibold">{completion?.newlyCompleted ? 'Your journey badge and best stars are saved.' : 'Your best stars and unlocked worlds are safe.'}</p>
      <button className="mt-5 min-h-14 w-full rounded-2xl bg-teal-800 px-3 font-black text-white" onClick={() => { cancelNarration(); setChapterIndex(progress.unlockedChapter); setPhase('start'); }}>Choose next world →</button><button className="mt-3 min-h-12 w-full rounded-2xl border-2 border-teal-700 bg-white px-3 font-black text-teal-900" onClick={() => start(chapterIndex)}>Replay {chapter.title}</button></main>}
  </div>;
  const limit = chapter.max;
  const missingStart = q.type === 'missing' && q.missing === 0 && !locked && !hintUsed;
  const missingEnd = q.type === 'missing' && q.missing === 2 && !locked && !hintUsed;
  return <div className="min-h-[100dvh] bg-gradient-to-b from-sky-100 via-lime-50 to-amber-100 p-2 text-slate-900 sm:p-6 [&>header]:p-2 [&>header_h1]:text-lg [&>header_p]:text-[10px] sm:[&>header_h1]:text-3xl sm:[&>header_p]:text-[11px]" data-numberline-phase="play" data-numberline-question={q.id} data-run-seed={seed} data-chapter={chapter.id} data-mission-index={ri + 1}>
    {header}
    <main className="mx-auto mt-2 max-w-4xl rounded-3xl border-2 border-white bg-white/95 p-2 text-center shadow-xl sm:mt-4 sm:p-6" data-mission-type={q.type}>
      <p className="mb-0.5 text-[10px] font-black uppercase tracking-wide text-teal-800 sm:text-xs">{q.type === 'hop' ? 'Make the journey' : q.type === 'missing' ? 'Find the missing part' : q.compare === 'farther' ? 'Compare the distance' : 'Compare the landing numbers'}</p>
      <h2 className="mx-auto max-w-2xl text-lg font-black leading-tight sm:text-xl" aria-live="polite">{locked ? 'Your journey, explained' : q.prompt}</h2>
      {q.type === 'compare' ? <div className="mt-1 grid gap-1.5 sm:mt-3 sm:gap-3">
        <NumberLineJourney compact limit={limit} start={q.start1} end={q.end1} position={q.end1} showRoute label={`Frog A · ${q.hops1} hops`} />
        <NumberLineJourney compact limit={limit} start={q.start2} end={q.end2} position={q.end2} showRoute label={`Frog B · ${q.hops2} hops`} />
      </div> : <div className="mt-1 sm:mt-3"><NumberLineJourney compact limit={limit} label={q.type === 'hop' ? `${trail.length} of ${q.b} hops made` : q.missing === 0 ? 'Find the start' : q.missing === 1 ? 'Count the spaces' : 'Find the landing number'}
        start={q.type === 'hop' ? q.a : missingStart ? undefined : q.start} end={q.type === 'hop' || missingEnd ? undefined : q.end} position={q.type === 'hop' ? position : missingEnd ? q.start : q.end}
        trail={trail} showRoute={q.type === 'missing' && (hintUsed || locked)} onSwipe={q.type === 'hop' ? dir => hopTo(position + dir) : undefined} disabled={locked} /></div>}
      {!locked && <div className="mx-auto mt-1 flex max-w-md gap-2 sm:mt-3">
        <button type="button" onClick={() => tell(speak, numberLineNarrationText(q), numberLineNarrationSegments(q))} className="inline-flex min-h-12 flex-1 items-center justify-center gap-1 rounded-xl bg-teal-50 px-2 text-sm font-black text-teal-900 sm:gap-2 sm:px-4 sm:text-base"><Volume2 size={18} />Hear mission</button>
        <button type="button" disabled={hintUsed} onClick={hint} className="inline-flex min-h-12 flex-1 items-center justify-center gap-1 rounded-xl border-2 border-amber-400 bg-amber-50 px-2 text-sm font-black disabled:opacity-50 sm:gap-2 sm:px-4 sm:text-base"><Lightbulb size={18} />{hintUsed ? 'Hint used' : 'Use one hint'}</button>
      </div>}
      {!locked && (q.type === 'hop' ? <>
        <div className="mt-1 grid grid-cols-2 gap-2 sm:mt-3">
          <button disabled={position <= 0 || trail.length >= q.b} onClick={() => hopTo(position - 1)} onKeyDown={e => { if (e.key === 'ArrowLeft') { e.preventDefault(); hopTo(position - 1); } }} className="min-h-14 rounded-2xl border-2 border-teal-700 bg-white px-2 font-black text-teal-900 disabled:opacity-50">← Hop back</button>
          <button disabled={position >= 10 || trail.length >= q.b} onClick={() => hopTo(position + 1)} onKeyDown={e => { if (e.key === 'ArrowRight') { e.preventDefault(); hopTo(position + 1); } }} className="min-h-14 rounded-2xl bg-teal-800 px-2 font-black text-white disabled:opacity-50">Hop forward →</button>
        </div><p className="sr-only" aria-live="polite">Frog at {position}. Accepted hops: {trail.join(', ') || 'none'}.</p>
      </> : <div className="my-1 grid grid-cols-2 gap-2 sm:my-4 sm:grid-cols-3" role="group" aria-label="Choose the answer">{q.options.map(o => <button key={o} onClick={() => answer(o)} className="min-h-14 rounded-2xl bg-teal-800 px-3 text-xl font-black text-white">{o === 'same' ? 'Same' : q.type === 'compare' ? `Frog ${o}` : o}</button>)}</div>)}
      {locked ? <section aria-label="Worked answer" className="mt-1 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-2 sm:mt-4 sm:p-4">
        <p className="mb-1 text-xs font-black uppercase tracking-wide text-emerald-800">You worked it out!</p>
        <p role="status" className="font-bold text-slate-800">{feedback}</p>
        {ri === 5 && completionError && <section role="alert" className="mt-2 rounded-xl border-2 border-rose-600 bg-white p-3 text-left font-bold"><p>{completionError}</p><button type="button" data-numberline-result-retry onClick={() => void finishChapter(completionRef.current)} disabled={completionBusy} className="mt-2 min-h-12 w-full rounded-xl bg-rose-700 px-4 text-white disabled:opacity-50">{completionBusy ? 'Saving…' : completionError.toLowerCase().includes('reward') ? 'Retry reward confirmation' : 'Retry saving this result'}</button></section>}
        <div className="mt-2 grid gap-2 sm:mt-3 sm:grid-cols-[1fr_1fr]">
          <button type="button" onClick={() => tell(speak, q.explanation, numberLineNarrationSegments(q, 'explanation'))} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-emerald-600 bg-white px-4 font-black text-emerald-900"><Volume2 size={20} />Hear explanation</button>
          {ri < 5 ? <button type="button" onClick={next} className="min-h-14 rounded-xl bg-emerald-800 px-6 text-lg font-black text-white">Next mission →</button>
            : !completionError && <button type="button" onClick={next} disabled={completionBusy} className="min-h-14 rounded-xl bg-emerald-800 px-6 text-lg font-black text-white disabled:opacity-50">Finish world →</button>}
        </div>
      </section> : <>
        {feedback && <p role="status" className="my-3 rounded-xl bg-amber-50 p-3 font-bold">{feedback}</p>}
      </>}
    </main>
  </div>;
}
