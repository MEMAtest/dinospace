import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SUBTRACTION_CHAPTERS, arithmeticNarrationSegments, createSubtractionRun, createArithmeticSeed, arithmeticRewardUnits, scoreArithmeticResults } from '../../data/arithmeticAdventure.js';
import {
  readArithmeticProgressStrict, rememberStartedArithmeticRunStrict, recordArithmeticRunCompletionStrict,
  getPendingArithmeticRewardReceiptsStrict, pendingArithmeticRewardReceipts, markArithmeticRewardReceiptClaimedStrict,
} from '../../data/arithmeticProgress.js';
import { rewardClaimToken } from '../../data/playerRewards.js';
import { FocusMenu } from '../shared/FocusMenu.jsx';

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
const ObjectIcon = ({ object, color }) => <svg viewBox="0 0 32 32" className="h-8 w-8 sm:h-11 sm:w-11" aria-hidden="true" focusable="false"><ObjectToken object={object} color={color}/></svg>;

export default function SubtractionStation({ onBack, playSfx = () => {}, soundOn, onToggleSound, speak = () => {}, cancelNarration = noopCancel, onCelebrate = () => {}, onGameEvent, onPhaseChange, playerId = 'amari' }) {
  const [progressState, setProgressState] = useState(() => readArithmeticProgressStrict('subtraction', playerId));
  const progress = progressState.ok ? progressState.progress : { completedChapterIds: [], bestStars: {}, recentQuestionIds: {} };
  const unlockedChapter = Math.min(progress.completedChapterIds.length, SUBTRACTION_CHAPTERS.length - 1);
  const [chapterIndex, setChapterIndex] = useState(() => Math.min(readArithmeticProgressStrict('subtraction', playerId).progress?.completedChapterIds.length || 0, SUBTRACTION_CHAPTERS.length - 1));
  const [phase, setPhase] = useState('start');
  const [optionsOpen, setOptionsOpen] = useState(false);
  const headingRef = useRef(null);
  const nextRef = useRef(null);
  const [seed, setSeed] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [mistake, setMistake] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [completedResults, setCompletedResults] = useState([]);
  const [removedTokens, setRemovedTokens] = useState([]);
  const [hintCount, setHintCount] = useState(0);
  const [completionPending, setCompletionPending] = useState(false);
  const [completionError, setCompletionError] = useState('');
  const [startError, setStartError] = useState('');
  const [rewardDrainBusy, setRewardDrainBusy] = useState(true);
  const [rewardClaimError, setRewardClaimError] = useState(false);
  const [pendingRewardReceipt, setPendingRewardReceipt] = useState(null);
  const [progressRetryBusy, setProgressRetryBusy] = useState(false);
  const pendingStartRef = useRef(null);
  const pendingCompletionRef = useRef(null);
  const completionBusyRef = useRef(false);
  const receiptClaimsRef = useRef(new Map());
  const receiptDrainRef = useRef(null);
  const reconciledReceiptsRef = useRef(new Set());
  const chapter = SUBTRACTION_CHAPTERS[chapterIndex];
  const question = rounds[roundIndex];
  const canStart = progressState.ok && !rewardDrainBusy && !pendingRewardReceipt && !rewardClaimError;

  const refreshProgress = useCallback(() => {
    const loaded = readArithmeticProgressStrict('subtraction', playerId);
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
        parent = await onCelebrate(`${SUBTRACTION_CHAPTERS.find(({ id }) => id === receipt.chapterId)?.title || 'Subtraction'} complete!`, arithmeticRewardUnits(receipt.rewardDelta), 0, 'subtraction', {
          quiet: true,
          rewardToken: rewardClaimToken('subtraction', receipt.id),
        });
      } catch { parent = null; }
      if (parent?.persisted !== true) {
        setRewardClaimError(true);
        return false;
      }
      const marked = markArithmeticRewardReceiptClaimedStrict('subtraction', playerId, receipt.id);
      if (!marked.ok) {
        setRewardClaimError(true);
        return false;
      }
      reconciledReceiptsRef.current.add(claimId);
      setProgressState({ ok: true, status: 'ready', progress: marked.progress });
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
      const loaded = getPendingArithmeticRewardReceiptsStrict('subtraction', playerId);
      if (!loaded.ok) {
        setProgressState(loaded);
        setRewardClaimError(true);
        return false;
      }
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
    finally {
      if (receiptDrainRef.current === operation) receiptDrainRef.current = null;
      setRewardDrainBusy(false);
    }
  }, [claimRewardReceipt, playerId, refreshProgress]);

  useEffect(() => {
    onPhaseChange?.(phase === 'done' ? 'finish' : phase === 'start' ? 'intro' : 'play');
  }, [phase, onPhaseChange]);
  useEffect(() => {
    if (phase !== 'start') return undefined;
    const timer = window.setTimeout(() => { void drainPendingRewards(); }, 0);
    return () => window.clearTimeout(timer);
  }, [drainPendingRewards, phase]);
  useEffect(() => () => cancelNarration(), [cancelNarration]);
  useEffect(() => {
    if (phase !== 'play' || !question) return;
    onGameEvent?.('subtraction', 'question', { level: chapterIndex, round: roundIndex, seed, difficulty: chapter.id });
    tell(speak, question.prompt, arithmeticNarrationSegments(question));
  }, [phase, question, chapterIndex, chapter.id, roundIndex, seed, speak, onGameEvent]);

  useEffect(() => { if (!optionsOpen) headingRef.current?.focus({ preventScroll: true }); }, [phase, roundIndex, optionsOpen]);
  useEffect(() => { if (locked) nextRef.current?.focus({ preventScroll: true }); }, [locked, completionError]);

  const start = (index = chapterIndex) => {
    setOptionsOpen(false);
    cancelNarration();
    const loaded = readArithmeticProgressStrict('subtraction', playerId);
    if (!loaded.ok) {
      setProgressState(loaded);
      setStartError(loaded.error || 'Saved progress could not be checked. Retry before starting.');
      return;
    }
    if (rewardDrainBusy || pendingRewardReceipt || rewardClaimError || pendingArithmeticRewardReceipts(loaded.progress).length) {
      setStartError('Confirm saved chapter rewards before starting another run.');
      void drainPendingRewards();
      return;
    }
    if (!Number.isInteger(index) || index < 0 || index >= SUBTRACTION_CHAPTERS.length || index > Math.min(loaded.progress.completedChapterIds.length, SUBTRACTION_CHAPTERS.length - 1)) return;
    let attempt = pendingStartRef.current?.chapterIndex === index ? pendingStartRef.current : null;
    if (!attempt) {
      const newSeed = createArithmeticSeed();
      const recent = loaded.progress.recentQuestionIds[index] || [];
      const queue = createSubtractionRun({ chapter: index, seed: newSeed, recentIds: recent });
      attempt = { chapterIndex: index, seed: newSeed, queue };
    }
    pendingStartRef.current = attempt;
    const { seed: newSeed, queue } = attempt;
    const saved = rememberStartedArithmeticRunStrict('subtraction', playerId, index, queue);
    if (!saved.ok) {
      setProgressState(loaded);
      setChapterIndex(index);
      setStartError('Question history could not be saved. Retry to start this same six-question run.');
      return;
    }
    pendingStartRef.current = null;
    setProgressState({ ok: true, status: 'ready', progress: saved.progress });
    setStartError('');
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
    setRemovedTokens([]);
    setCompletionPending(false);
    setCompletionError('');
    pendingCompletionRef.current = null;
    setPhase('play');
    onGameEvent?.('subtraction', 'start', { level: index, seed: newSeed, difficulty: SUBTRACTION_CHAPTERS[index].id });
    if (loaded.progress.completedChapterIds.includes(SUBTRACTION_CHAPTERS[index].id)) {
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
        ? question.b === 0 ? 'Nothing is taken away. The starting group stays the same.' : `Tap ${question.b} ${question.b === 1 ? question.one : question.many} to mark them as taken away. Count the ones left.`
        : question.a === question.b
          ? 'Pair one counter from each group. They have the same number, so none are left unpaired.'
          : 'Pair one counter from each group. Count what is left unpaired.';
      setFeedback(guidance);
      tell(speak, question.clue, arithmeticNarrationSegments(question, 'clue'));
      playSfx('wrong');
      return;
    }
    if (question.type !== 'compare') setRemovedTokens(Array.from({ length: question.b }, (_, index) => index));
    setLocked(true);
    setFeedback(question.explanation);
    const results = [...completedResults, { correct: true, firstAttempt, priorWrong: mistake, hintCount: hintUsed ? 1 : 0 }];
    setCompletedResults(results);
    if (roundIndex === rounds.length - 1) {
      const stars = scoreArithmeticResults(results).stars;
      pendingCompletionRef.current = { chapterIndex, rounds, stars, seed, hintCount: hintCount + (hintUsed ? 1 : 0), completionEventSent: false };
      setCompletionError('');
    }
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

  const finishChapter = async (draft = pendingCompletionRef.current) => {
    if (!draft || completionBusyRef.current) return false;
    completionBusyRef.current = true;
    pendingCompletionRef.current = draft;
    setCompletionPending(true);
    setCompletionError('');
    if (draft.newlyCompleted === undefined) {
      const before = readArithmeticProgressStrict('subtraction', playerId);
      if (!before.ok) {
        setProgressState(before);
        setCompletionError('Saved progress needs checking. Retry this result.');
        setCompletionPending(false);
        completionBusyRef.current = false;
        return false;
      }
      const chapterId = SUBTRACTION_CHAPTERS[draft.chapterIndex]?.id;
      const wasAlreadyEarned = before.progress.completedChapterIds.includes(chapterId)
        || (before.progress.bestStars[chapterId] || 0) > 0
        || before.progress.completedChapterIds.length > draft.chapterIndex;
      draft.newlyCompleted = !wasAlreadyEarned;
    }
    const result = recordArithmeticRunCompletionStrict('subtraction', playerId, draft.chapterIndex, draft.rounds, draft.stars);
    if (!result.ok) {
      setCompletionError('Result ready. Save failed. Retry this result.');
      setCompletionPending(false);
      completionBusyRef.current = false;
      return false;
    }
    draft.newlyCompleted = Boolean(draft.newlyCompleted || result.newlyCompleted);
    setProgressState({ ok: true, status: 'ready', progress: result.progress });
    if (!draft.completionEventSent) {
      draft.completionEventSent = true;
      onGameEvent?.('subtraction', 'level_complete', { level: draft.chapterIndex, round: 5, seed: draft.seed, difficulty: SUBTRACTION_CHAPTERS[draft.chapterIndex].id, hintCount: draft.hintCount });
    }
    const drained = await drainPendingRewards();
    if (!drained) {
      setCompletionError('Result saved. Reward needs sync. Retry.');
      setCompletionPending(false);
      completionBusyRef.current = false;
      return false;
    }
    const latest = readArithmeticProgressStrict('subtraction', playerId);
    if (!latest.ok || pendingArithmeticRewardReceipts(latest.progress).length) {
      if (!latest.ok) setProgressState(latest);
      setCompletionError('Saved rewards need confirmation. Retry.');
      setCompletionPending(false);
      completionBusyRef.current = false;
      return false;
    }
    setProgressState(latest);
    setCompletionPending(false);
    setCompletionError('');
    setFeedback(draft.newlyCompleted
      ? `Chapter complete! You earned ${draft.stars} ${draft.stars === 1 ? 'star' : 'stars'}.`
      : `Replay complete! Your best is ${latest.progress.bestStars[SUBTRACTION_CHAPTERS[draft.chapterIndex].id]} ${latest.progress.bestStars[SUBTRACTION_CHAPTERS[draft.chapterIndex].id] === 1 ? 'star' : 'stars'}.`);
    setPhase('done');
    playSfx('complete');
    completionBusyRef.current = false;
    pendingCompletionRef.current = null;
    return true;
  };

  const retryProgressRead = () => {
    setProgressRetryBusy(true);
    const loaded = readArithmeticProgressStrict('subtraction', playerId);
    setProgressState(loaded);
    if (loaded.ok) setChapterIndex((current) => Math.min(current, loaded.progress.completedChapterIds.length, SUBTRACTION_CHAPTERS.length - 1));
    setProgressRetryBusy(false);
    if (loaded.ok) void drainPendingRewards();
  };

  const next = () => {
    if (!locked || completionPending) return;
    cancelNarration();
    if (roundIndex < 5) {
      setRoundIndex((index) => index + 1);
      setMistake(false);
      setHintUsed(false);
      setLocked(false);
      setFeedback('');
      setRemovedTokens([]);
      return;
    }
    if (!pendingCompletionRef.current) return;
    void finishChapter(pendingCompletionRef.current);
  };

  const leave = () => {
    if (phase === 'play') onGameEvent?.('subtraction', 'leave', { level: chapterIndex, round: roundIndex, seed, difficulty: chapter.id });
    onBack?.();
  };
  const model = useMemo(() => {
    if (!question) return null;
    if (question.type === 'compare') {
      const paired = Math.min(question.a, question.b);
      const pairCount = Math.max(question.a, question.b);
      return <div className="mx-auto max-w-md rounded-2xl border-2 border-violet-200 bg-white p-1.5 sm:p-3">
        <p className="mb-0.5 whitespace-nowrap text-[11px] font-black sm:mb-1 sm:text-sm">Blue = Group A · Gold = Group B · outlined = unpaired</p>
        <div className="mx-auto grid max-w-[380px] grid-cols-4 gap-1 sm:max-w-sm sm:gap-2" role="group" aria-label={`Aligned pairs: Group A has ${question.a}; Group B has ${question.b}`}>
          {pairCount === 0 ? <p className="col-span-4 rounded-xl bg-slate-50 p-2 text-center text-sm font-bold">Both groups are empty. There are 0 unpaired.</p> : Array.from({ length: pairCount }, (_, index) => <div key={index} aria-label={`Pair position ${index + 1}`} className="flex min-h-10 items-center justify-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-1 sm:min-h-12 sm:gap-1 sm:rounded-xl sm:p-2">
            <span aria-label={index < question.a ? `Group A counter ${index + 1}${index < paired ? ', paired' : ', unpaired'}` : 'No Group A counter'} className={`flex h-7 w-7 items-center justify-center rounded-md ${index < question.a ? 'bg-sky-100' : 'bg-white'} ${index >= paired && index < question.a ? 'ring-2 ring-amber-500' : ''}`}>{index < question.a ? <span className={`h-5 w-5 rounded-full ${colorClass.blue}`} /> : <span aria-hidden="true" className="text-slate-300">·</span>}</span>
            <span aria-hidden="true" className={`text-sm font-black ${index < paired ? 'text-violet-700' : 'text-slate-300'}`}>{index < paired ? '↔' : ' '}</span>
            <span aria-label={index < question.b ? `Group B counter ${index + 1}${index < paired ? ', paired' : ', unpaired'}` : 'No Group B counter'} className={`flex h-7 w-7 items-center justify-center rounded-md ${index < question.b ? 'bg-amber-100' : 'bg-white'} ${index >= paired && index < question.b ? 'ring-2 ring-amber-500' : ''}`}>{index < question.b ? <span className={`h-5 w-5 rounded-full ${colorClass.gold}`} /> : <span aria-hidden="true" className="text-slate-300">·</span>}</span>
          </div>)}
        </div>
      </div>;
    }
    const selected = new Set(removedTokens);
    return <section className="mx-auto max-w-xl rounded-2xl border-2 border-violet-200 bg-white p-2 sm:p-3" aria-label="Take-away model">
      <p className="hidden text-xs font-black uppercase tracking-wide text-violet-800 sm:block">{question.type === 'story' ? 'Story · Give away the second amount' : 'Take away · Remove the second amount'}</p>
      {!locked && <p className="mt-1 hidden text-xs font-bold sm:block">{question.b === 0 ? 'Nothing is taken away.' : 'Tap the objects being taken away.'}</p>}
        <p className="flex-1 text-center text-2xl font-black" aria-label={`Equation: ${question.a} minus ${question.b} equals ${locked ? question.answer : 'unknown'}`}>{question.a} − {question.b} = {locked ? question.answer : '?'}</p>
      <div role="group" aria-label={`Starting group: ${question.a} ${question.a === 1 ? question.one : question.many}. ${removedTokens.length} marked to take away.`} className="rounded-xl border-2 border-slate-200 bg-slate-50 p-2 sm:p-3">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-1 text-sm"><b>Starting group · {question.a}</b><span className="font-bold text-rose-700">Take away · {question.b}</span></div>
        <div className="flex flex-wrap justify-center gap-1 sm:gap-2" aria-label="Tap objects to mark them for taking away">
          {Array.from({ length: question.a }, (_, index) => <button key={index} type="button" disabled={locked || (!selected.has(index) && removedTokens.length >= question.b)} onClick={() => setRemovedTokens((previous) => previous.includes(index) ? previous.filter((item) => item !== index) : [...previous, index])} aria-pressed={selected.has(index)} aria-label={`${question.object} ${index + 1}${selected.has(index) ? ', marked to take away' : ', remains'}`} className={`relative flex min-h-11 min-w-11 items-center justify-center rounded-lg border-2 ${selected.has(index) ? 'border-rose-500 bg-rose-100 opacity-70' : 'border-transparent bg-white'} disabled:cursor-default`}><ObjectIcon object={question.object} color={selected.has(index) ? 'rose' : question.color}/>{selected.has(index) && <><span aria-hidden="true" className="absolute inset-x-1/4 top-1/2 h-0.5 -rotate-45 bg-slate-950"/><span aria-hidden="true" className="sr-only">Marked to take away</span></>}</button>)}
          {question.a === 0 && <span className="py-2 text-sm font-bold text-slate-500">Empty starting group</span>}
        </div>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-1 text-sm font-bold"><span>Marked: {removedTokens.length} of {question.b}</span><span>Left: {question.a - removedTokens.length}</span></div>
      </div>
    </section>;
  }, [question, locked, removedTokens]);

  const closeOptions = () => setOptionsOpen(false);
  const menu = phase !== 'play';
  const nextIndex = pendingStartRef.current?.chapterIndex ?? unlockedChapter;
  const recommended = SUBTRACTION_CHAPTERS[nextIndex];
  const retryStart = pendingStartRef.current?.chapterIndex === nextIndex;
  const recommendedLabel = retryStart ? 'Retry saving this chapter' : progress.completedChapterIds.includes(recommended.id)
    ? `Replay: ${recommended.title}` : phase === 'done' ? `Next: ${recommended.title}` : `Start: ${recommended.title}`;
  const soundChoice = { label: soundOn ? 'Turn sound off' : 'Turn sound on', action: () => { closeOptions(); onToggleSound?.(); } };
  const chapterChoices = SUBTRACTION_CHAPTERS.map((item, index) => {
    const completed = progress.completedChapterIds.includes(item.id);
    return {
      label: `${item.title}${index > unlockedChapter ? ' · Locked' : completed ? ' · Complete' : ''}`,
      button: `${completed ? 'Replay' : 'Start'}: ${item.title}`,
      description: item.skill,
      disabled: !canStart || index > unlockedChapter,
      action: () => start(index),
    };
  });
  const playChoices = [
    ...(!locked && !hintUsed ? [{ label: 'Use one hint', action: () => { closeOptions(); hint(); } }] : []),
    ...(question?.type !== 'compare' && removedTokens.length ? [
      { label: 'Undo marked object', action: () => { closeOptions(); setRemovedTokens(previous => previous.slice(0, -1)); } },
      { label: 'Reset marked objects', action: () => { closeOptions(); setRemovedTokens([]); } },
    ] : []),
    soundChoice,
    { label: 'Back to Maths Missions', action: leave },
  ];
  const startBlocked = !progressState.ok || rewardClaimError;
  const equation = question?.type === 'compare'
    ? `${question.a} and ${question.b} → ${locked ? question.answer : '?'} unpaired`
    : null;
  return <div data-board-focus="" className="focus-game" data-subtraction-phase={phase} data-subtraction-question={menu ? undefined : question?.id} data-subtraction-run-seed={menu ? undefined : seed}>
    <main className={`focus-game-body ${menu || optionsOpen ? 'is-menu' : ''}`}>
      <header className="focus-game-heading">
        {!menu && <p>Subtraction Station · {chapter.title} · {roundIndex + 1} of 6</p>}
        <h1 ref={headingRef} tabIndex={-1}>{phase === 'done' ? 'Chapter saved!' : menu ? 'Subtraction Station' : question?.prompt}</h1>
      </header>
      {optionsOpen ? <FocusMenu choices={menu ? [...chapterChoices, soundChoice] : playChoices} onBack={closeOptions} /> : menu ? <>
        {phase === 'done' && <p role="status" className="focus-game-message">{feedback}</p>}
        {startBlocked || startError
          ? <p role="alert" className="focus-game-message">{startError || (!progressState.ok ? 'Saved chapter progress could not be checked.' : 'Confirm the saved reward before starting.')}</p>
          : <p className="focus-game-message">{recommended.skill} · six questions</p>}
        <div className="focus-game-actions">
          {startBlocked ? <button type="button" className="focus-game-button is-primary" disabled={progressRetryBusy || rewardDrainBusy} onClick={!progressState.ok ? retryProgressRead : () => void drainPendingRewards()}>{!progressState.ok ? 'Retry saved progress' : 'Retry reward confirmation'}</button>
            : <button type="button" data-subtraction-start className="focus-game-button is-primary" disabled={!canStart} onClick={() => start(nextIndex)}>{rewardDrainBusy ? 'Checking saved progress…' : recommendedLabel}</button>}
          <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
          <button type="button" className="focus-game-button" onClick={leave}>Back to Maths Missions</button>
        </div>
      </> : <>
        {equation && <p className="mb-3 text-center text-2xl font-black" aria-label={`Equation: ${equation}`}>{equation}</p>}
        <div className="my-3" data-subtraction-model>{model}</div>
        {!locked && <div className="my-3 grid grid-cols-3 gap-2" role="group" aria-label="Choose the answer">
          {question?.options.map(option => <button key={option} type="button" onClick={() => attempt(option)} className="focus-game-button text-xl" aria-label={`Answer ${option}`}>{option}</button>)}
        </div>}
        {feedback && <p role="status" className="focus-game-message">{feedback}</p>}
        {completionError && <p role="alert" className="focus-game-message">{completionError}</p>}
        <div className="focus-game-actions">
          {completionError ? <button ref={nextRef} type="button" data-subtraction-result-retry onClick={() => void finishChapter(pendingCompletionRef.current)} disabled={completionPending} className="focus-game-button is-primary">{completionPending ? 'Saving…' : 'Retry saving this result'}</button>
            : locked && <button ref={nextRef} type="button" onClick={next} disabled={completionPending} className="focus-game-button is-primary">{completionPending ? 'Saving…' : roundIndex === 5 ? 'Finish chapter' : 'Next question'}</button>}
          {!completionError && !completionPending && <>
            {soundOn && <button type="button" className="focus-game-button" onClick={() => tell(speak, locked ? question.explanation : question.prompt, arithmeticNarrationSegments(question, locked ? 'explanation' : undefined))}>{locked ? 'Hear explanation' : 'Hear question'}</button>}

            <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
          </>}
        </div>
      </>}
    </main>
  </div>;
}
