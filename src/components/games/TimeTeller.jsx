import { createArithmeticSeed } from '../../data/arithmeticAdventure.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TIME_CHAPTERS, createTimeRun, formatClock, timeLabel } from '../../data/timeLineAdventure.js';
import { TIME_TELLER_NARRATION, timeNarrationSegments } from '../../data/batch4Narration.js';
import {
  readTimeLineProgressStrict, rememberTimeLineRunStrict, recordTimeLineRunCompletionStrict,
  getPendingTimeLineRewardReceiptsStrict, pendingTimeLineRewardReceipts, markTimeLineRewardReceiptClaimedStrict,
} from '../../data/timeLineProgress.js';
import { rewardClaimToken } from '../../data/playerRewards.js';
import { FocusMenu } from '../shared/FocusMenu.jsx';
import { LearningClock } from './TimeLineLearningUI.jsx';
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
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [practice, setPractice] = useState(false);
  const [practiceTime, setPracticeTime] = useState({hour:3, minute:0});
  const headingRef = useRef(null);
  const nextRef = useRef(null);
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
  useEffect(() => { if (!optionsOpen) headingRef.current?.focus({ preventScroll: true }); }, [phase, ri, optionsOpen, practice]);
  useEffect(() => { if (locked) nextRef.current?.focus({ preventScroll: true }); }, [locked, completionError]);

  const start = (index = chapterIndex, retry = false) => {
    setOptionsOpen(false);
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

  const closeOptions = () => setOptionsOpen(false);
  const menu = phase !== 'play';
  const nextIndex = pendingStart?.chapterIndex ?? progress.unlockedChapter;
  const nextChapter = TIME_CHAPTERS[nextIndex];
  const nextLabel = pendingStart ? 'Retry saving this run' : progress.completedChapterIds.includes(nextChapter.id) ? `Replay: ${nextChapter.title}`
    : phase === 'done' ? `Next: ${nextChapter.title}` : `Start: ${nextChapter.title}`;
  const startBlocked = !progressState.ok || rewardClaimError;
  const soundChoice = { label: soundOn ? 'Turn sound off' : 'Turn sound on', action: () => { closeOptions(); onToggleSound?.(); } };
  const chapterChoices = TIME_CHAPTERS.map((item,index) => {
    const completed = progress.completedChapterIds.includes(item.id);
    return {
      label: `${item.title}${index > progress.unlockedChapter ? ' · Locked' : completed ? ' · Complete' : ''}`,
      description: item.skill,
      button: `${completed ? 'Replay' : 'Start'}: ${item.title}`,
      disabled: !canStart || Boolean(pendingStart) || index > progress.unlockedChapter,
      action: () => start(index),
    };
  });
  const playChoices = [
    ...(!locked && !hintUsed ? [{ label: 'Use one hint', action: () => { closeOptions(); hint(); } }] : []),
    ...(!locked ? [{ label: 'How the two hands work', description: TIME_TELLER_NARRATION.lesson, action: () => { closeOptions(); setFeedback(TIME_TELLER_NARRATION.lesson); if (soundOn) tell(speak, TIME_TELLER_NARRATION.lesson, timeNarrationSegments(TIME_TELLER_NARRATION.lesson)); } }] : []),
    soundChoice,
    { label: 'Back to Maths Missions', action: leave },
  ];
  return <div data-board-focus="" className="focus-game" data-timeteller-phase={phase} data-timeteller-question={menu ? undefined : q.id} data-run-seed={menu ? undefined : seed} data-chapter={menu ? undefined : chapter.id} data-mission-index={menu ? undefined : ri + 1}>
    <main className={`focus-game-body ${menu || optionsOpen ? 'is-menu' : ''}`} data-mission-type={menu ? undefined : q.type}>
      <header className="focus-game-heading">
        {!menu && <p>Time Teller · {chapter.title} · {ri + 1} of 6</p>}
        <h1 ref={headingRef} tabIndex={-1}>{practice ? 'Practise the clock' : phase === 'done' ? 'Progress saved!' : menu ? 'Time Teller' : q.prompt}</h1>
      </header>
      {practice ? <>
        <div className="mb-3 text-center"><LearningClock time={practiceTime} onChange={setPracticeTime} label="Practice clock" /></div>
        <button type="button" className="focus-game-button" onClick={() => setPractice(false)}>Back to chapters</button>
      </> : optionsOpen ? <FocusMenu choices={menu ? [...chapterChoices, { label: 'Try moving the clock hands', action: () => { closeOptions(); setPractice(true); } }, soundChoice] : playChoices} onBack={closeOptions} /> : menu ? <>
        {phase === 'done' && <p role="status" className="focus-game-message">{feedback}</p>}
        {startBlocked || startError ? <p role="alert" className="focus-game-message">{startError || (!progressState.ok ? 'Saved progress could not be checked.' : 'Confirm the saved reward before starting.')}</p> : <p className="focus-game-message">{nextChapter.skill} · six missions</p>}
        <div className="focus-game-actions">
          {startBlocked ? <button type="button" className="focus-game-button is-primary" disabled={progressRetryBusy || rewardDrainBusy} onClick={!progressState.ok ? retryProgressRead : () => void drainPendingRewards()}>{!progressState.ok ? 'Retry saved progress' : 'Retry reward confirmation'}</button>
            : <button type="button" data-timeteller-start className="focus-game-button is-primary" disabled={!canStart} onClick={() => start(nextIndex, Boolean(pendingStart))}>{rewardDrainBusy ? 'Checking saved progress…' : nextLabel}</button>}
          <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
          <button type="button" className="focus-game-button" onClick={leave}>Back to Maths Missions</button>
        </div>
      </> : <>
        <div className="my-3 text-center"><LearningClock compact time={q.type === 'set' ? setTime : q.target} onChange={q.type === 'set' && !locked ? setSetTime : undefined} label={q.type === 'set' ? 'Clock setting controls' : locked ? `Clock showing ${timeLabel(q.target)}` : 'Clock face with short red hour hand and long blue minute hand'} /></div>
        {!locked && q.type !== 'set' && <div className="my-3 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Choose the time">
          {q.options.map(time => <button key={formatClock(time)} type="button" onClick={() => attempt(time)} className="focus-game-button">{timeLabel(time)}</button>)}
        </div>}
        {feedback && <p className="focus-game-message" role="status">{feedback}</p>}
        {completionError && <p className="focus-game-message" role="alert">{completionError}</p>}
        <div className="focus-game-actions">
          {completionError ? <button ref={nextRef} type="button" data-timeteller-result-retry onClick={() => void finishChapter(completionRef.current)} disabled={completionBusy} className="focus-game-button is-primary">{completionBusy ? 'Saving…' : 'Retry saving this result'}</button>
            : locked && <button ref={nextRef} type="button" onClick={next} disabled={completionBusy} className="focus-game-button is-primary">{completionBusy ? 'Saving…' : ri === 5 ? 'Finish chapter' : 'Next mission'}</button>}
          {!completionError && !completionBusy && <>
            {!locked && q.type === 'set' && <button type="button" onClick={() => attempt(setTime)} className="focus-game-button is-primary">Check clock</button>}
            {soundOn && <button type="button" className="focus-game-button" onClick={() => tell(speak, locked ? q.explanation : q.prompt, timeNarrationSegments(q, locked ? 'explanation' : undefined))}>{locked ? 'Hear explanation' : 'Hear mission'}</button>}
            <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
          </>}
        </div>
      </>}
    </main>
  </div>;
}
