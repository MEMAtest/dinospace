import { createArithmeticSeed } from '../../data/arithmeticAdventure.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Lightbulb, Volume2 } from 'lucide-react';
import { TIME_CHAPTERS, createTimeRun, formatClock, timeLabel } from '../../data/timeLineAdventure.js';
import { TIME_TELLER_NARRATION, timeNarrationSegments } from '../../data/batch4Narration.js';
import {
  readTimeLineProgressStrict, rememberTimeLineRunStrict, recordTimeLineRunCompletionStrict,
  getPendingTimeLineRewardReceiptsStrict, pendingTimeLineRewardReceipts, markTimeLineRewardReceiptClaimedStrict,
} from '../../data/timeLineProgress.js';
import { rewardClaimToken } from '../../data/playerRewards.js';
import { LearningHeader, LearningChapters, LearningClock, ClockPractice } from './TimeLineLearningUI.jsx';
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
  const [progressState, setProgressState] = useState(() => readTimeLineProgressStrict('timeteller', playerId));
  const progress = progressState.ok ? progressState.progress : { completedChapterIds: [], bestStars: {}, recentQuestionIds: {}, unlockedChapter: 0 };
  const [chapterIndex, setChapterIndex] = useState(() => readTimeLineProgressStrict('timeteller', playerId).progress?.unlockedChapter || 0);
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
  const chapter = TIME_CHAPTERS[chapterIndex],
    q = run[ri];
  const canStart = progressState.ok && !rewardDrainBusy && !pendingRewardReceipt && !rewardClaimError;
  const refreshProgress = useCallback(() => {
    const loaded = readTimeLineProgressStrict('timeteller', playerId);
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
        parent = await onCelebrate(`${TIME_CHAPTERS.find(({ id }) => id === receipt.chapterId)?.title || 'Time Teller'} complete!`, receipt.rewardDelta * 4, 0, 'timeteller', { quiet: true, rewardToken: rewardClaimToken('timeteller', receipt.id) });
      } catch { parent = null; }
      if (parent?.persisted !== true) { setRewardClaimError(true); return false; }
      const marked = markTimeLineRewardReceiptClaimedStrict('timeteller', playerId, receipt.id);
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
      const loaded = getPendingTimeLineRewardReceiptsStrict('timeteller', playerId);
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
      onGameEvent?.('timeteller', 'question', {
        level: chapterIndex,
        round: ri,
        seed,
        difficulty: chapter.id
      });
      tell(speak, q.prompt, timeNarrationSegments(q));
    }
  }, [phase, q, chapterIndex, ri, seed, chapter.id, speak, onGameEvent]);
  const start = (index = chapterIndex, retry = false) => {
    cancelNarration();
    const loaded = refreshProgress();
    if (!loaded.ok) { setStartError('Saved progress is unavailable. Try again before starting.'); return; }
    const pending = getPendingTimeLineRewardReceiptsStrict('timeteller', playerId);
    if (!pending.ok || pending.receipts.length || rewardDrainBusy || pendingRewardReceipt || rewardClaimError) {
      setStartError('Finish syncing your saved reward before you start.');
      void drainPendingRewards();
      return;
    }
    if (!Number.isInteger(index) || index < 0 || index >= TIME_CHAPTERS.length || index > loaded.progress.unlockedChapter) return;
    let attempt = retry && startRef.current?.chapterIndex === index ? startRef.current : null;
    if (!attempt) {
      const s = createArithmeticSeed();
      const recent = loaded.progress.recentQuestionIds[index] || [];
      const queue = createTimeRun({ chapter: index, seed: s, recentIds: recent });
      attempt = { chapterIndex: index, seed: s, run: queue };
    }
    startRef.current = attempt;
    const remembered = rememberTimeLineRunStrict('timeteller', playerId, index, attempt.run);
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
    setSetTime({
      hour: 12,
      minute: 0
    });
    setPhase('play');
    onGameEvent?.('timeteller', 'start', {
      level: index,
      seed: attempt.seed,
      difficulty: TIME_CHAPTERS[index].id
    });
    if (loaded.progress.completedChapterIds.includes(TIME_CHAPTERS[index].id)) onGameEvent?.('timeteller', 'replay', { level: index, seed: attempt.seed, difficulty: TIME_CHAPTERS[index].id });
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
    if (ri === run.length - 1) {
      const stars = newFirst >= 5 ? 3 : newFirst >= 3 ? 2 : 1;
      completionRef.current = { chapterIndex, run, stars, seed, earnedFirst: newFirst, newlyCompleted: undefined, completionEventSent: false };
      setCompletionError('');
    }
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
    void finishChapter(completionRef.current);
  };
  const finishChapter = async (draft = completionRef.current) => {
    if (!draft || completionBusyRef.current) return false;
    completionBusyRef.current = true;
    setCompletionBusy(true);
    setCompletionError('');
    completionRef.current = draft;
    if (draft.newlyCompleted === undefined) {
      const before = readTimeLineProgressStrict('timeteller', playerId);
      if (!before.ok) {
        setProgressState(before);
        setCompletionError('Progress needs a check before you finish. Try again.');
        setCompletionBusy(false);
        completionBusyRef.current = false;
        return false;
      }
      const chapterId = TIME_CHAPTERS[draft.chapterIndex]?.id;
      draft.newlyCompleted = !before.progress.completedChapterIds.includes(chapterId)
        && (before.progress.bestStars[chapterId] || 0) === 0
        && before.progress.completedChapterIds.length === draft.chapterIndex;
    }
    const result = recordTimeLineRunCompletionStrict('timeteller', playerId, draft.chapterIndex, draft.run, draft.stars);
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
      onGameEvent?.('timeteller', 'level_complete', { level: draft.chapterIndex, round: 5, seed: draft.seed, difficulty: TIME_CHAPTERS[draft.chapterIndex].id });
    }
    const drained = await drainPendingRewards();
    if (!drained) {
      setCompletionError('Your result is saved. Retry the reward.');
      setCompletionBusy(false);
      completionBusyRef.current = false;
      return false;
    }
    const latest = readTimeLineProgressStrict('timeteller', playerId);
    if (!latest.ok || pendingTimeLineRewardReceipts(latest.progress).length) {
      if (!latest.ok) setProgressState(latest);
      setCompletionError('Saved rewards need a check. Retry to finish.');
      setCompletionBusy(false);
      completionBusyRef.current = false;
      return false;
    }
    const currentChapter = TIME_CHAPTERS[draft.chapterIndex];
    setProgressState(latest);
    setCompletion({ stars: draft.stars, newlyCompleted: draft.newlyCompleted, best: latest.progress.bestStars[currentChapter.id] });
    setFeedback(draft.newlyCompleted ? `Chapter complete! You earned ${draft.stars} ${draft.stars === 1 ? 'star' : 'stars'}.` : `Replay complete! Your best is ${latest.progress.bestStars[currentChapter.id]} stars.`);
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
    const loaded = readTimeLineProgressStrict('timeteller', playerId);
    setProgressState(loaded);
    if (loaded.ok) setChapterIndex((current) => Math.min(current, loaded.progress.unlockedChapter));
    setProgressRetryBusy(false);
    if (loaded.ok) void drainPendingRewards();
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
  const header = <LearningHeader title="Time Teller" subtitle={phase === 'play' ? `Chapter ${chapterIndex + 1} · Mission ${ri + 1} of 6` : 'Look · Move · Tell the time'} onBack={leave} soundOn={soundOn} onToggleSound={onToggleSound} compact={phase === 'start' || phase === 'play'} />;
  if (phase === 'start' || phase === 'done') return <div className="min-h-[100dvh] bg-gradient-to-b from-sky-100 via-emerald-50 to-amber-100 p-2 text-slate-900 sm:p-6">{header}
    {phase === 'start' ? <main className="mx-auto mt-2 max-w-4xl" data-timeteller-menu>
      {!progressState.ok && <section role="alert" className="mb-2 rounded-2xl border-2 border-rose-600 bg-white p-3 text-center font-bold"><p>Saved chapter progress could not be checked. Chapters stay locked until it can be read.</p><button type="button" onClick={retryProgressRead} disabled={progressRetryBusy} className="mt-2 min-h-12 rounded-xl bg-rose-700 px-4 text-white">{progressRetryBusy ? 'Checking progress…' : 'Retry saved progress'}</button></section>}
      {rewardDrainBusy && <p role="status" className="mb-2 rounded-xl bg-white p-2 text-center text-sm font-semibold">Checking saved chapter rewards…</p>}
      {rewardClaimError && <section role="alert" className="mb-2 rounded-2xl border-2 border-amber-600 bg-white p-3 text-center font-bold"><p>A saved chapter reward still needs confirmation.</p><button type="button" onClick={() => void drainPendingRewards()} disabled={rewardDrainBusy} className="mt-2 min-h-12 rounded-xl bg-amber-700 px-4 text-white">Retry reward confirmation</button></section>}
      {startError && <p role="alert" className="mb-2 rounded-xl border-2 border-rose-500 bg-white p-3 text-center font-bold">{startError}</p>}
      <section className="rounded-3xl border-2 border-sky-200 bg-white p-3 text-center shadow-md sm:p-5" aria-label="Selected clock chapter">
        <p className="text-xs font-black uppercase tracking-wide text-sky-800">Selected · Chapter {chapterIndex + 1} of 3</p>
        <h2 className="mt-1 text-xl font-black text-sky-950">{chapter.title}</h2>
        <p className="text-sm font-semibold text-slate-600">{chapter.skill} · six missions</p>
        <button type="button" data-timeteller-start disabled={!canStart || chapterIndex > progress.unlockedChapter} onClick={() => start(chapterIndex, Boolean(pendingStart))} className="mt-3 min-h-14 w-full rounded-2xl bg-emerald-800 px-5 text-lg font-black text-white shadow-md disabled:opacity-50">
          {pendingStart ? 'Retry saving this same six-mission run' : progress.completedChapterIds.includes(chapter.id) ? `Replay ${chapter.title}` : `Start ${chapter.title} →`}
        </button>
      </section>
      <details className="mt-2 rounded-2xl border border-sky-100 bg-white p-3 shadow" open={pickerOpen} onToggle={(event) => setPickerOpen(event.currentTarget.open)}>
        <summary className="min-h-12 cursor-pointer content-center font-black">Choose another chapter</summary>
        <div className="mt-2"><LearningChapters chapters={TIME_CHAPTERS} selected={chapterIndex} progress={progress} selectionDisabled={Boolean(pendingStart)} onSelect={(index) => { setChapterIndex(index); setStartError(''); setPickerOpen(false); }} /></div>
      </details>
      <ClockPractice />
    </main> : <main className="mx-auto mt-6 max-w-2xl rounded-3xl border-2 border-white bg-white p-6 text-center shadow-xl">
      <p className="text-4xl text-amber-500" aria-label={`${completion?.best || 1} best stars`}>{'★'.repeat(completion?.best || 1)}</p><h2 className="mt-3 text-2xl font-black">{chapter.title} complete!</h2><p className="mt-2 font-semibold">{completion?.newlyCompleted ? 'Your clock badge and best stars are saved.' : 'Your best stars and unlocked chapters are safe.'}</p>
      <button className="mt-5 min-h-14 w-full rounded-2xl bg-emerald-800 px-3 font-black text-white" onClick={() => { cancelNarration(); setChapterIndex(progress.unlockedChapter); setPhase('start'); }}>Choose next chapter →</button><button className="mt-3 min-h-12 w-full rounded-2xl border-2 border-emerald-700 bg-white px-3 font-black text-emerald-900" onClick={() => start(chapterIndex)}>Replay {chapter.title}</button>
    </main>}
  </div>;
  return <div className="min-h-[100dvh] bg-gradient-to-b from-sky-100 via-emerald-50 to-amber-100 p-2 text-slate-900 sm:p-6">{header}
    <main className="mx-auto mt-2 max-w-4xl rounded-3xl border-2 border-white bg-white/95 p-2 text-center shadow-xl sm:mt-4 sm:p-6" data-mission-type={q.type} data-timeteller-question={q.id} data-run-seed={seed} data-chapter={chapter.id} data-mission-index={ri + 1}>
      <p className="mb-0.5 text-[10px] font-black uppercase tracking-wide text-sky-800 sm:text-xs">{q.type === 'set' ? 'Move the hands' : 'Read the clock'}</p>
      <h2 className="mx-auto max-w-2xl text-lg font-black leading-tight sm:text-xl" aria-live="polite">{locked ? timeLabel(q.target) : q.prompt}</h2>
      {!locked && <div className="mx-auto my-1 flex max-w-sm gap-2 sm:my-3">
        <button className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-sky-50 px-3 font-black text-sky-900" onClick={() => tell(speak, q.prompt, timeNarrationSegments(q))}><Volume2 size={18} />Hear mission</button>
        <button disabled={hintUsed} onClick={hint} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-amber-400 bg-amber-50 px-3 font-black disabled:opacity-50"><Lightbulb size={18} />{hintUsed ? 'Hint used' : 'Use hint'}</button>
      </div>}
      <div className="mt-1 sm:mt-3"><LearningClock compact time={q.type === 'set' ? setTime : q.target} onChange={q.type === 'set' && !locked ? setSetTime : undefined} label={q.type === 'set' ? 'Clock setting controls' : locked ? `Clock showing ${timeLabel(q.target)}` : 'Clock face with short red hour hand and long blue minute hand'} /></div>
      {!locked && (q.type === 'set' ? <button onClick={() => attempt(setTime)} className="mx-auto mt-2 min-h-14 w-full max-w-sm rounded-2xl bg-emerald-800 px-4 text-lg font-black text-white sm:mt-4">Check clock</button> : <div className="my-2 grid grid-cols-2 gap-2 sm:my-4 sm:grid-cols-4" role="group" aria-label="Choose the time">{q.options.map(t => <button key={formatClock(t)} onClick={() => attempt(t)} className="min-h-14 rounded-2xl bg-emerald-800 px-3 text-lg font-black text-white">{timeLabel(t)}</button>)}</div>)}
      {locked ? <section aria-label="Worked answer" className="mt-1 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-1.5 text-left sm:mt-4 sm:p-4">
        <p className="mb-1 text-xs font-black uppercase tracking-wide text-emerald-800">You worked it out!</p><p role="status" className="font-bold text-slate-800">{feedback}</p>
        {ri === 5 && completionError && <section role="alert" className="mt-1 rounded-xl border-2 border-rose-600 bg-white p-1.5 font-bold sm:mt-2 sm:p-3"><p className="text-sm">{completionError}</p><button type="button" data-timeteller-result-retry onClick={() => void finishChapter(completionRef.current)} disabled={completionBusy} className="mt-1 min-h-12 w-full rounded-xl bg-rose-700 px-3 text-sm text-white disabled:opacity-50">{completionBusy ? 'Saving…' : completionError.toLowerCase().includes('reward') ? 'Retry reward confirmation' : 'Retry saving this result'}</button></section>}
        <div className="mt-2 grid gap-2 sm:mt-3 sm:grid-cols-2"><button type="button" onClick={() => tell(speak, q.explanation, timeNarrationSegments(q, 'explanation'))} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-emerald-700 bg-white px-4 font-black text-emerald-900"><Volume2 size={18} />Hear explanation</button>
          {ri < 5 ? <button type="button" onClick={next} className="min-h-14 rounded-xl bg-emerald-800 px-6 text-lg font-black text-white">Next mission →</button> : !completionError && <button type="button" onClick={next} disabled={completionBusy} className="min-h-14 rounded-xl bg-emerald-800 px-6 text-lg font-black text-white disabled:opacity-50">Finish chapter →</button>}</div>
      </section> : <>
        {feedback && <p role="status" className="my-2 rounded-xl bg-amber-50 p-2 font-bold">{feedback}</p>}
        <details className="mx-auto mt-2 max-w-xl rounded-xl bg-sky-50 p-2 text-left sm:mt-3 sm:p-3"><summary className="min-h-12 cursor-pointer p-3 font-bold text-sky-900">How the two hands work</summary><p className="p-3 text-sm font-semibold">The short hand shows the hour. The long hand shows minutes. As minutes pass, the hour hand moves between numbers.</p><button className="inline-flex min-h-12 items-center gap-2 rounded-xl px-4 font-bold" onClick={() => tell(speak, TIME_TELLER_NARRATION.lesson, timeNarrationSegments(TIME_TELLER_NARRATION.lesson))}><Volume2 size={20} />Hear hand lesson</button></details>
      </>}
    </main>
  </div>;
}
