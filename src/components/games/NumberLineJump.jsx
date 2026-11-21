import { createArithmeticSeed } from '../../data/arithmeticAdventure.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { NUMBER_LINE_CHAPTERS, createNumberLineRun } from '../../data/timeLineAdventure.js';
import { numberLineNarrationSegments, numberLineNarrationText } from '../../data/batch4Narration.js';
import {
  readTimeLineProgressStrict, rememberTimeLineRunStrict, recordTimeLineRunCompletionStrict,
  getPendingTimeLineRewardReceiptsStrict, pendingTimeLineRewardReceipts, markTimeLineRewardReceiptClaimedStrict,
} from '../../data/timeLineProgress.js';
import { rewardClaimToken } from '../../data/playerRewards.js';
import { FocusMenu } from '../shared/FocusMenu.jsx';
import NumberLineJourney from './NumberLineJourney.jsx';
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
  const [optionsOpen, setOptionsOpen] = useState(false);
  const headingRef = useRef(null);
  const nextRef = useRef(null);
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
  useEffect(() => { if (!optionsOpen) headingRef.current?.focus({ preventScroll: true }); }, [phase, ri, optionsOpen]);
  useEffect(() => { if (locked) nextRef.current?.focus({ preventScroll: true }); }, [locked, completionError]);

  const start = (index = chapterIndex, retry = false) => {
    setOptionsOpen(false);
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

  const closeOptions = () => setOptionsOpen(false);
  const menu = phase !== 'play';
  const nextIndex = pendingStart?.chapterIndex ?? progress.unlockedChapter;
  const nextChapter = NUMBER_LINE_CHAPTERS[nextIndex];
  const nextLabel = pendingStart ? 'Retry saving this run' : progress.completedChapterIds.includes(nextChapter.id) ? `Replay: ${nextChapter.title}`
    : phase === 'done' ? `Next: ${nextChapter.title}` : `Start: ${nextChapter.title}`;
  const startBlocked = !progressState.ok || rewardClaimError;
  const soundChoice = { label: soundOn ? 'Turn sound off' : 'Turn sound on', action: () => { closeOptions(); onToggleSound?.(); } };
  const chapterChoices = NUMBER_LINE_CHAPTERS.map((item,index) => {
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
    soundChoice,
    { label: 'Back to Maths Missions', action: leave },
  ];
  const limit = chapter.max;
  const missingStart = q?.type === 'missing' && q.missing === 0 && !locked && !hintUsed;
  const missingEnd = q?.type === 'missing' && q.missing === 2 && !locked && !hintUsed;
  return <div data-board-focus="" className="focus-game" data-numberline-phase={phase} data-numberline-question={menu ? undefined : q.id} data-run-seed={menu ? undefined : seed} data-chapter={menu ? undefined : chapter.id} data-mission-index={menu ? undefined : ri + 1}>
    <main className={`focus-game-body ${menu || optionsOpen ? 'is-menu' : ''}`} data-mission-type={menu ? undefined : q.type}>
      <header className="focus-game-heading">
        {!menu && <p>Number Line Jump · {chapter.title} · {ri + 1} of 6</p>}
        <h1 ref={headingRef} tabIndex={-1}>{ phase === 'done' ? 'Progress saved!' : menu ? 'Number Line Jump' : q.prompt}</h1>
      </header>
      {optionsOpen ? <FocusMenu choices={menu ? [...chapterChoices, soundChoice] : playChoices} onBack={closeOptions} /> : menu ? <>
        {phase === 'done' && <p role="status" className="focus-game-message">{feedback}</p>}
        {startBlocked || startError ? <p role="alert" className="focus-game-message">{startError || (!progressState.ok ? 'Saved progress could not be checked.' : 'Confirm the saved reward before starting.')}</p> : <p className="focus-game-message">{nextChapter.skill} · six missions</p>}
        <div className="focus-game-actions">
          {startBlocked ? <button type="button" className="focus-game-button is-primary" disabled={progressRetryBusy || rewardDrainBusy} onClick={!progressState.ok ? retryProgressRead : () => void drainPendingRewards()}>{!progressState.ok ? 'Retry saved progress' : 'Retry reward confirmation'}</button>
            : <button type="button" data-numberline-start className="focus-game-button is-primary" disabled={!canStart} onClick={() => start(nextIndex, Boolean(pendingStart))}>{rewardDrainBusy ? 'Checking saved progress…' : nextLabel}</button>}
          <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
          <button type="button" className="focus-game-button" onClick={leave}>Back to Maths Missions</button>
        </div>
      </> : <>
        {q.type === 'compare' ? <div className="my-3 grid gap-2">
          <NumberLineJourney compact limit={limit} start={q.start1} end={q.end1} position={q.end1} showRoute label={`Frog A · ${q.hops1} hops`} />
          <NumberLineJourney compact limit={limit} start={q.start2} end={q.end2} position={q.end2} showRoute label={`Frog B · ${q.hops2} hops`} />
        </div> : <div className="my-3"><NumberLineJourney compact limit={limit} label={q.type === 'hop' ? `${trail.length} of ${q.b} hops made` : q.missing === 0 ? 'Find the start' : q.missing === 1 ? 'Count the spaces' : 'Find the landing number'}
          start={q.type === 'hop' ? q.a : missingStart ? undefined : q.start} end={q.type === 'hop' || missingEnd ? undefined : q.end} position={q.type === 'hop' ? position : missingEnd ? q.start : q.end}
          trail={trail} showRoute={q.type === 'missing' && (hintUsed || locked)} onSwipe={q.type === 'hop' ? direction => hopTo(position + direction) : undefined} disabled={locked} /></div>}
        {!locked && q.type === 'hop' && <div className="focus-game-actions my-3" role="group" aria-label="Hop controls">
          <button type="button" className="focus-game-button" disabled={position <= 0} onClick={() => hopTo(position - 1)} onKeyDown={event => { if (event.key === 'ArrowLeft') { event.preventDefault(); hopTo(position - 1); } }}>Hop back</button>
          <button type="button" className="focus-game-button" disabled={position >= 10} onClick={() => hopTo(position + 1)} onKeyDown={event => { if (event.key === 'ArrowRight') { event.preventDefault(); hopTo(position + 1); } }}>Hop forward</button>
          <p className="sr-only" aria-live="polite">Frog at {position}. Accepted hops: {trail.join(', ') || 'none'}.</p>
        </div>}
        {!locked && q.type !== 'hop' && <div className="my-3 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Choose the answer">
          {q.options.map(value => <button key={value} type="button" onClick={() => answer(value)} className="focus-game-button text-xl">{value === 'same' ? 'Same' : q.type === 'compare' ? `Frog ${value}` : value}</button>)}
        </div>}
        {feedback && <p className="focus-game-message" role="status">{feedback}</p>}
        {completionError && <p className="focus-game-message" role="alert">{completionError}</p>}
        <div className="focus-game-actions">
          {completionError ? <button ref={nextRef} type="button" data-numberline-result-retry onClick={() => void finishChapter(completionRef.current)} disabled={completionBusy} className="focus-game-button is-primary">{completionBusy ? 'Saving…' : 'Retry saving this result'}</button>
            : locked && <button ref={nextRef} type="button" onClick={next} disabled={completionBusy} className="focus-game-button is-primary">{completionBusy ? 'Saving…' : ri === 5 ? 'Finish world' : 'Next mission'}</button>}
          {!completionError && !completionBusy && <>

            {soundOn && <button type="button" className="focus-game-button" onClick={() => tell(speak, locked ? q.explanation : numberLineNarrationText(q), numberLineNarrationSegments(q, locked ? 'explanation' : undefined))}>{locked ? 'Hear explanation' : 'Hear mission'}</button>}
            <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
          </>}
        </div>
      </>}
    </main>
  </div>;
}
