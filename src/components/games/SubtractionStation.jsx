import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Lightbulb, RotateCcw, Volume2 } from 'lucide-react';
import { SUBTRACTION_CHAPTERS, arithmeticNarrationSegments, createSubtractionRun, createArithmeticSeed, arithmeticRewardUnits, scoreArithmeticResults } from '../../data/arithmeticAdventure.js';
import {
  readArithmeticProgressStrict, rememberStartedArithmeticRunStrict, recordArithmeticRunCompletionStrict,
  getPendingArithmeticRewardReceiptsStrict, pendingArithmeticRewardReceipts, markArithmeticRewardReceiptClaimedStrict,
} from '../../data/arithmeticProgress.js';
import { rewardClaimToken } from '../../data/playerRewards.js';
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
const ObjectIcon = ({ object, color }) => <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true" focusable="false"><ObjectToken object={object} color={color}/></svg>;
const Chapter = ({ chapter, index, selected, done, locked, onClick }) => <button type="button" disabled={locked} onClick={onClick} aria-pressed={selected} className={`min-h-16 rounded-2xl border-2 p-3 text-left font-black disabled:opacity-50 ${selected ? 'border-violet-600 bg-violet-100' : 'border-white bg-white'}`}><span className="block text-xs uppercase tracking-wide">Chapter {index + 1}{done ? ' · Badge earned' : locked ? ' · Locked' : ''}</span>{chapter.title}</button>;

export default function SubtractionStation({ onBack, playSfx = () => {}, soundOn, onToggleSound, speak = () => {}, cancelNarration = noopCancel, onCelebrate = () => {}, onGameEvent, onPhaseChange, playerId = 'amari' }) {
  const [progressState, setProgressState] = useState(() => readArithmeticProgressStrict('subtraction', playerId));
  const progress = progressState.ok ? progressState.progress : { completedChapterIds: [], bestStars: {}, recentQuestionIds: {} };
  const unlockedChapter = Math.min(progress.completedChapterIds.length, SUBTRACTION_CHAPTERS.length - 1);
  const [chapterIndex, setChapterIndex] = useState(() => Math.min(readArithmeticProgressStrict('subtraction', playerId).progress?.completedChapterIds.length || 0, SUBTRACTION_CHAPTERS.length - 1));
  const [phase, setPhase] = useState('start');
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

  const start = (index = chapterIndex) => {
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
      return <div className="mx-auto max-w-md rounded-2xl border-2 border-violet-200 bg-white p-3">
        <p className="mb-2 text-sm font-black">Match one from each group. Blue is Group A, gold is Group B; outlined counters are unpaired.</p>
        <div className="mx-auto grid max-w-sm grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label={`Aligned pairs: Group A has ${question.a}; Group B has ${question.b}`}>
          {pairCount === 0 ? <p className="col-span-2 rounded-xl bg-slate-50 p-3 text-center text-sm font-bold sm:col-span-4">Both groups are empty. There are 0 unpaired.</p> : Array.from({ length: pairCount }, (_, index) => <div key={index} aria-label={`Pair position ${index + 1}`} className="flex min-h-14 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-2">
            <span aria-label={index < question.a ? `Group A counter ${index + 1}${index < paired ? ', paired' : ', unpaired'}` : 'No Group A counter'} className={`flex h-9 w-9 items-center justify-center rounded-lg ${index < question.a ? 'bg-sky-100' : 'bg-white'} ${index >= paired && index < question.a ? 'ring-2 ring-amber-500' : ''}`}>{index < question.a ? <span className={`h-6 w-6 rounded-full ${colorClass.blue}`} /> : <span aria-hidden="true" className="text-slate-300">·</span>}</span>
            <span aria-hidden="true" className={`text-sm font-black ${index < paired ? 'text-violet-700' : 'text-slate-300'}`}>{index < paired ? '↔' : ' '}</span>
            <span aria-label={index < question.b ? `Group B counter ${index + 1}${index < paired ? ', paired' : ', unpaired'}` : 'No Group B counter'} className={`flex h-9 w-9 items-center justify-center rounded-lg ${index < question.b ? 'bg-amber-100' : 'bg-white'} ${index >= paired && index < question.b ? 'ring-2 ring-amber-500' : ''}`}>{index < question.b ? <span className={`h-6 w-6 rounded-full ${colorClass.gold}`} /> : <span aria-hidden="true" className="text-slate-300">·</span>}</span>
          </div>)}
        </div>
        <p className="mt-2 rounded-xl bg-violet-50 p-2 text-sm font-bold">{question.a === question.b ? `Same number: ${locked ? '0 unpaired.' : 'How many are unpaired?'}` : `Unpaired difference: ${locked ? question.answer : '?'}`}</p>
      </div>;
    }
    const selected = new Set(removedTokens);
    const instruction = question.type === 'story' ? 'STORY · Give away the second amount' : 'TAKE AWAY · Remove the second amount';
    const description = `Start with ${question.a} ${question.a === 1 ? question.one : question.many}.`;
    const action = question.b === 0 ? 'Nothing is taken away. Every object in the starting group remains.' : `Tap ${question.b} ${question.b === 1 ? question.one : question.many} in the same group to show what is taken away.`;
    return <section className="mx-auto max-w-xl rounded-2xl border-2 border-violet-200 bg-white p-3" aria-label="Take-away model">
      <p className="text-xs font-black uppercase tracking-wide text-violet-800">{instruction}</p>
        {!locked && <p className="mt-1 text-sm font-bold">{description} {action}</p>}
      <p className="my-2 text-2xl font-black" aria-label={`Equation: ${question.a} minus ${question.b} equals ${locked ? question.answer : 'unknown'}`}>{question.a} − {question.b} = {locked ? question.answer : '?'}</p>
      <div role="group" aria-label={`Starting group: ${question.a} ${question.a === 1 ? question.one : question.many}. ${removedTokens.length} marked to take away.`} className="rounded-xl border-2 border-slate-200 bg-slate-50 p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><b>Starting group · {question.a}</b><span className="text-sm font-bold text-rose-700">Take away · {question.b}</span></div>
        <div className="flex flex-wrap justify-center gap-1" aria-label="Tap objects to mark them for taking away">
          {Array.from({ length: question.a }, (_, index) => <button key={index} type="button" disabled={locked || (!selected.has(index) && removedTokens.length >= question.b)} onClick={() => setRemovedTokens((previous) => previous.includes(index) ? previous.filter((item) => item !== index) : [...previous, index])} aria-pressed={selected.has(index)} aria-label={`${question.object} ${index + 1}${selected.has(index) ? ', marked to take away' : ', remains'}`} className={`relative flex min-h-12 min-w-12 items-center justify-center rounded-xl border-2 ${selected.has(index) ? 'border-rose-500 bg-rose-100 opacity-70' : 'border-transparent bg-white'} disabled:cursor-default`}><ObjectIcon object={question.object} color={selected.has(index) ? 'rose' : question.color}/>{selected.has(index) && <><span aria-hidden="true" className="absolute inset-x-1/4 top-1/2 h-0.5 -rotate-45 bg-slate-950"/><span aria-hidden="true" className="sr-only">Marked to take away</span></>}</button>)}
          {question.a === 0 && <span className="py-2 text-sm font-bold text-slate-500">Empty starting group</span>}
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm font-bold"><span>Marked: {removedTokens.length} of {question.b}</span><span>Left: {question.a - removedTokens.length}</span></div>
      </div>
      {!locked && <div className="mt-2 flex justify-center gap-2"><button type="button" onClick={() => setRemovedTokens((previous) => previous.slice(0, -1))} disabled={!removedTokens.length} className="inline-flex min-h-12 items-center gap-1 rounded-xl border-2 border-slate-300 px-3 font-bold disabled:opacity-50"><RotateCcw size={18}/> Undo</button><button type="button" onClick={() => setRemovedTokens([])} disabled={!removedTokens.length} className="min-h-12 rounded-xl border-2 border-slate-300 px-3 font-bold disabled:opacity-50">Reset</button></div>}
    </section>;
  }, [question, locked, removedTokens]);
  if (phase === 'start' || phase === 'done') return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-violet-100 to-purple-200 p-3 text-slate-900 sm:p-6" data-subtraction-phase={phase}>
      <header className="mx-auto flex max-w-4xl items-center justify-between rounded-3xl bg-white p-3 shadow"><button className="game-icon-button !min-h-12 !min-w-12" onClick={leave} aria-label="Back to Maths Missions"><ArrowLeft /></button><h1 className="text-xl font-black sm:text-3xl">Subtraction Station</h1><SoundToggle soundOn={soundOn} onToggle={onToggleSound} /></header>
      {phase === 'start' ? <main className="mx-auto mt-3 max-w-4xl" data-subtraction-menu>
        <p className="mb-3 rounded-2xl bg-white p-3 text-center font-bold">Take away, compare groups, and solve stories. Each chapter has six questions. Your worked answer stays until Finish chapter, and chapter progress saves then.</p>
        {!progressState.ok && <section role="alert" className="mb-3 rounded-2xl border-2 border-rose-600 bg-white p-3 text-center font-bold"><p>Saved chapter progress is unavailable, so chapters stay locked until it can be checked.</p><button onClick={retryProgressRead} disabled={progressRetryBusy} className="mt-2 min-h-12 rounded-xl bg-rose-700 px-4 text-white">{progressRetryBusy ? 'Checking saved progress…' : 'Retry saved progress'}</button></section>}
        {rewardDrainBusy && <p role="status" className="mb-3 rounded-xl bg-white p-3 text-center font-semibold">Checking saved chapter rewards…</p>}
        {rewardClaimError && <section role="alert" className="mb-3 rounded-2xl border-2 border-amber-600 bg-white p-3 text-center font-bold"><p>A saved chapter reward still needs confirmation.</p><button onClick={()=>void drainPendingRewards()} disabled={rewardDrainBusy} className="mt-2 min-h-12 rounded-xl bg-amber-700 px-4 text-white">Retry reward confirmation</button></section>}
        {startError && <p role="alert" className="mb-3 rounded-xl border-2 border-rose-500 bg-white p-3 text-center font-bold">{startError}</p>}
        <section className="rounded-2xl bg-white p-3 shadow" aria-label="Selected subtraction chapter">
          <p className="text-xs font-black uppercase tracking-wide">Selected · Chapter {chapterIndex + 1} of 3</p><h2 className="mt-1 text-lg font-black">{chapter.title}</h2><p className="text-sm">{chapter.skill[0].toUpperCase() + chapter.skill.slice(1)} · up to {chapter.max}</p>
          <button type="button" data-subtraction-start disabled={!canStart || chapterIndex > unlockedChapter} onClick={()=>start(chapterIndex)} className="mt-3 min-h-14 w-full rounded-2xl bg-violet-700 px-5 text-lg font-black text-white disabled:opacity-50">
            {pendingStartRef.current?.chapterIndex === chapterIndex ? 'Retry saving this chapter' : progress.completedChapterIds.includes(chapter.id) ? `Replay ${chapter.title}` : `Start ${chapter.title}`}
          </button>
        </section>
        <details className="mt-3 rounded-2xl bg-white p-3 shadow" aria-label="Chapter choices"><summary className="min-h-12 cursor-pointer content-center font-black">Choose another chapter</summary><div className="mt-2 grid gap-2 sm:grid-cols-3">{SUBTRACTION_CHAPTERS.map((item,index)=><Chapter key={item.id} chapter={item} index={index} selected={chapterIndex===index} done={progress.completedChapterIds.includes(item.id)} locked={!progressState.ok || index>unlockedChapter} onClick={()=>{setChapterIndex(index);setStartError('');}} />)}</div></details>
      </main> : <main className="mx-auto mt-5 max-w-2xl rounded-3xl bg-white p-5 text-center shadow-xl" data-subtraction-result><p className="text-xl font-black">{feedback}</p><p className="mt-2">Choose the next unlocked chapter or replay a completed chapter.</p><button className="mt-4 min-h-14 w-full rounded-2xl bg-violet-700 px-5 font-black text-white" onClick={()=>{cancelNarration();setPhase('start');setChapterIndex(unlockedChapter);}}>Continue</button><button className="mt-3 min-h-14 w-full rounded-2xl bg-white px-5 font-black text-violet-800 ring-2 ring-violet-700" onClick={()=>start(chapterIndex)}>Replay {chapter.title}</button></main>}
    </div>
  );
  const equation = question?.type === 'compare'
    ? `${question.a} and ${question.b} → ${locked ? question.answer : '?'} unpaired`
    : `${question?.a} − ${question?.b} = ${locked ? question?.answer : '?'}`;
  return <div className="min-h-[100dvh] overflow-y-auto bg-gradient-to-b from-violet-100 to-purple-200 p-3 text-slate-900 sm:p-6" data-subtraction-phase="play" data-subtraction-question={question?.id} data-subtraction-run-seed={seed}>
    <header className="mx-auto flex max-w-4xl items-center justify-between rounded-3xl bg-white p-3 shadow"><button className="game-icon-button !min-h-12 !min-w-12" onClick={leave} aria-label="Back to Maths Missions"><ArrowLeft /></button><div className="text-center"><p className="text-xs font-black uppercase">Chapter {chapterIndex+1} of 3 · Question {roundIndex+1} of 6</p><h1 className="text-xl font-black sm:text-3xl">Subtraction Station</h1></div><SoundToggle soundOn={soundOn} onToggle={onToggleSound} /></header>
    <main className="mx-auto mt-3 max-w-4xl rounded-3xl bg-white/90 p-3 text-center shadow-xl sm:mt-4 sm:p-6">
      <p className="mb-2 text-lg font-bold" aria-live="polite">{question?.prompt}</p>
      {question?.type === 'compare' && <p className="mb-2 text-xl font-black" aria-label={`Difference model: ${equation}`}>{equation}</p>}
      {!locked && <button className="mb-2 inline-flex min-h-12 items-center gap-2 rounded-xl bg-violet-100 px-4 font-black" onClick={()=>tell(speak, question.prompt, arithmeticNarrationSegments(question))}><Volume2 size={20}/> Hear question</button>}
      {model}
      {feedback&&<p role="status" className="mx-auto my-2 max-w-2xl rounded-xl bg-violet-50 p-2 font-bold">{feedback}</p>}
      {locked&&<button onClick={()=>tell(speak, question.explanation, arithmeticNarrationSegments(question, 'explanation'))} className="mx-auto inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-violet-700 bg-white px-4 font-black"><Volume2 size={20}/> Hear explanation</button>}
      {!locked && <div className="my-3 flex flex-wrap justify-center gap-3" role="group" aria-label="Choose the answer">{question?.options.map(option=><button key={option} disabled={locked} onClick={()=>attempt(option)} className="min-h-14 min-w-16 rounded-2xl bg-violet-700 px-5 text-2xl font-black text-white shadow disabled:opacity-60" aria-label={`Answer ${option}`}>{option}</button>)}</div>}
      {!locked&&<button disabled={hintUsed} onClick={hint} className="inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-amber-500 bg-amber-50 px-4 font-black disabled:opacity-50"><Lightbulb size={20}/>{hintUsed?'Hint used':'Use one hint'}</button>}
      {completionError&&<section role="alert" className="mx-auto mt-2 max-w-2xl rounded-2xl border-2 border-rose-600 bg-white p-2 text-sm font-bold"><p>{completionError}</p><button data-subtraction-result-retry onClick={()=>void finishChapter(pendingCompletionRef.current)} disabled={completionPending} className="mt-1 min-h-12 rounded-xl bg-rose-700 px-4 text-white">{completionPending?'Saving…':completionError.includes('reward') || completionError.includes('rewards') ? 'Retry reward confirmation' : 'Retry saving this result'}</button></section>}
      {locked&&!completionError&&<button onClick={next} disabled={completionPending} className="mt-3 min-h-14 w-full rounded-2xl bg-violet-700 px-5 text-lg font-black text-white disabled:opacity-60">{roundIndex===5?'Finish chapter':'Next question'}</button>}
    </main>
  </div>;
}
