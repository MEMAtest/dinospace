import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ARITHMETIC_CHAPTERS, arithmeticNarrationSegments, createAdditionRun, createArithmeticSeed, arithmeticRewardUnits, scoreArithmeticResults } from '../../data/arithmeticAdventure.js';
import {
  readArithmeticProgressStrict, rememberStartedArithmeticRunStrict, recordArithmeticRunCompletionStrict,
  getPendingArithmeticRewardReceiptsStrict, pendingArithmeticRewardReceipts, markArithmeticRewardReceiptClaimedStrict,
} from '../../data/arithmeticProgress.js';
import { rewardClaimToken } from '../../data/playerRewards.js';
import { FocusMenu } from '../shared/FocusMenu.jsx';

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

export default function AdditionAdventure({ onBack, playSfx = () => {}, soundOn, onToggleSound, speak = () => {}, cancelNarration = noopCancel, onCelebrate = () => {}, onGameEvent, onPhaseChange, playerId = 'amari' }) {
  const [progressState, setProgressState] = useState(() => readArithmeticProgressStrict('addition', playerId));
  const progress = progressState.ok ? progressState.progress : { completedChapterIds: [], bestStars: {}, recentQuestionIds: {} };
  const unlockedChapter = Math.min(progress.completedChapterIds.length, ARITHMETIC_CHAPTERS.length - 1);
  const [chapterIndex, setChapterIndex] = useState(() => Math.min(readArithmeticProgressStrict('addition', playerId).progress?.completedChapterIds.length || 0, ARITHMETIC_CHAPTERS.length - 1));
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
  const [modelJoined, setModelJoined] = useState(false);
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
  const chapter = ARITHMETIC_CHAPTERS[chapterIndex];
  const question = rounds[roundIndex];
  const canStart = progressState.ok && !rewardDrainBusy && !pendingRewardReceipt && !rewardClaimError;

  const refreshProgress = useCallback(() => {
    const loaded = readArithmeticProgressStrict('addition', playerId);
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
        parent = await onCelebrate(`${ARITHMETIC_CHAPTERS.find(({ id }) => id === receipt.chapterId)?.title || 'Addition'} complete!`, arithmeticRewardUnits(receipt.rewardDelta), 0, 'addition', {
          quiet: true,
          rewardToken: rewardClaimToken('addition', receipt.id),
        });
      } catch { parent = null; }
      if (parent?.persisted !== true) {
        setRewardClaimError(true);
        return false;
      }
      const marked = markArithmeticRewardReceiptClaimedStrict('addition', playerId, receipt.id);
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
      const loaded = getPendingArithmeticRewardReceiptsStrict('addition', playerId);
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
    onGameEvent?.('addition', 'question', { level: chapterIndex, round: roundIndex, seed, difficulty: chapter.id });
    tell(speak, question.prompt, arithmeticNarrationSegments(question));
  }, [phase, question, chapterIndex, chapter.id, roundIndex, seed, speak, onGameEvent]);

  useEffect(() => { if (!optionsOpen) headingRef.current?.focus({ preventScroll: true }); }, [phase, roundIndex, optionsOpen]);
  useEffect(() => { if (locked) nextRef.current?.focus({ preventScroll: true }); }, [locked, completionError]);

  const start = (index = chapterIndex) => {
    setOptionsOpen(false);
    cancelNarration();
    const loaded = readArithmeticProgressStrict('addition', playerId);
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
    if (!Number.isInteger(index) || index < 0 || index >= ARITHMETIC_CHAPTERS.length || index > Math.min(loaded.progress.completedChapterIds.length, ARITHMETIC_CHAPTERS.length - 1)) return;
    let attempt = pendingStartRef.current?.chapterIndex === index ? pendingStartRef.current : null;
    if (!attempt) {
      const newSeed = createArithmeticSeed();
      const recent = loaded.progress.recentQuestionIds[index] || [];
      const queue = createAdditionRun({ chapter: index, seed: newSeed, recentIds: recent });
      attempt = { chapterIndex: index, seed: newSeed, queue };
    }
    pendingStartRef.current = attempt;
    const { seed: newSeed, queue } = attempt;
    const remembered = rememberStartedArithmeticRunStrict('addition', playerId, index, queue);
    if (!remembered.ok) {
      setProgressState(loaded);
      setChapterIndex(index);
      setStartError('Question history could not be saved. Retry to start this same six-question run.');
      return;
    }
    pendingStartRef.current = null;
    setProgressState({ ok: true, status: 'ready', progress: remembered.progress });
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
    setModelJoined(false);
    setCompletionPending(false);
    setCompletionError('');
    pendingCompletionRef.current = null;
    setPhase('play');
    onGameEvent?.('addition', 'start', { level: index, seed: newSeed, difficulty: ARITHMETIC_CHAPTERS[index].id });
    if (loaded.progress.completedChapterIds.includes(ARITHMETIC_CHAPTERS[index].id)) {
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
    setModelJoined(true);
    const result = { correct: true, firstAttempt, priorWrong: mistake, hintCount: hintUsed ? 1 : 0 };
    const results = [...completedResults, result];
    setCompletedResults(results);
    if (roundIndex === rounds.length - 1) {
      const stars = scoreArithmeticResults(results).stars;
      pendingCompletionRef.current = { chapterIndex, rounds, stars, seed, hintCount: hintCount + (hintUsed ? 1 : 0), completionEventSent: false };
      setCompletionError('');
    }
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

  const finishChapter = async (draft = pendingCompletionRef.current) => {
    if (!draft || completionBusyRef.current) return false;
    completionBusyRef.current = true;
    pendingCompletionRef.current = draft;
    setCompletionPending(true);
    setCompletionError('');
    if (draft.newlyCompleted === undefined) {
      const before = readArithmeticProgressStrict('addition', playerId);
      if (!before.ok) {
        setProgressState(before);
        setCompletionError('Saved progress needs checking. Retry this result.');
        setCompletionPending(false);
        completionBusyRef.current = false;
        return false;
      }
      const chapterId = ARITHMETIC_CHAPTERS[draft.chapterIndex]?.id;
      const wasAlreadyEarned = before.progress.completedChapterIds.includes(chapterId)
        || (before.progress.bestStars[chapterId] || 0) > 0
        || before.progress.completedChapterIds.length > draft.chapterIndex;
      draft.newlyCompleted = !wasAlreadyEarned;
    }
    const result = recordArithmeticRunCompletionStrict('addition', playerId, draft.chapterIndex, draft.rounds, draft.stars);
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
      onGameEvent?.('addition', 'level_complete', { level: draft.chapterIndex, round: 5, seed: draft.seed, difficulty: ARITHMETIC_CHAPTERS[draft.chapterIndex].id, hintCount: draft.hintCount });
    }
    const drained = await drainPendingRewards();
    if (!drained) {
      setCompletionError('Result saved. Reward needs sync. Retry.');
      setCompletionPending(false);
      completionBusyRef.current = false;
      return false;
    }
    const latest = readArithmeticProgressStrict('addition', playerId);
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
      : `Replay complete! Your best is ${latest.progress.bestStars[ARITHMETIC_CHAPTERS[draft.chapterIndex].id]} ${latest.progress.bestStars[ARITHMETIC_CHAPTERS[draft.chapterIndex].id] === 1 ? 'star' : 'stars'}.`);
    setPhase('done');
    playSfx('complete');
    completionBusyRef.current = false;
    pendingCompletionRef.current = null;
    return true;
  };

  const retryProgressRead = () => {
    setProgressRetryBusy(true);
    const loaded = readArithmeticProgressStrict('addition', playerId);
    setProgressState(loaded);
    if (loaded.ok) setChapterIndex((current) => Math.min(current, loaded.progress.completedChapterIds.length, ARITHMETIC_CHAPTERS.length - 1));
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
      setModelJoined(false);
      return;
    }
    if (!pendingCompletionRef.current) return;
    void finishChapter(pendingCompletionRef.current);
  };

  const leave = () => {
    if (phase === 'play') onGameEvent?.('addition', 'leave', { level: chapterIndex, round: roundIndex, seed, difficulty: chapter.id });
    onBack?.();
  };
  const model = useMemo(() => {
    if (!question) return null;
    if (question.type === 'groups' || question.type === 'story') {
      const objectGroup = (count, label, joined) => (
        <div
          role="group"
          aria-label={joined ? `${label} moved into the joined group` : `${label}, ${count} ${count === 1 ? question.one : question.many}`}
          className={`min-w-24 rounded-2xl border-2 border-slate-200 bg-white p-2 transition-all duration-500 motion-reduce:transition-none ${joined ? 'opacity-45' : ''}`}
        >
          <p className="text-xs font-black">{joined ? `Moved from ${label.toLowerCase()}` : `${label}: ${count === 0 ? '0 (empty)' : count}`}</p>
          <div className="mt-1 flex max-w-full flex-wrap gap-1" aria-hidden="true">
            {Array.from({ length: joined ? 0 : count }, (_, index) => (
              <svg key={index} viewBox="0 0 32 32" className="h-8 w-8 sm:h-11 sm:w-11" focusable="false">
                <ObjectToken object={question.object} color={question.color} />
              </svg>
            ))}
          </div>
        </div>
      );
      const joinedGroup = (
        <div
          className="mx-auto min-w-36 rounded-2xl border-2 border-dashed border-emerald-500 bg-emerald-50 p-3"
          role="group"
          aria-label={`Joined group, ${question.answer} ${question.answer === 1 ? question.one : question.many}`}
        >
          <b>Joined group: {question.answer}</b>
          <div className="mt-1 flex max-w-full flex-wrap justify-center gap-1" aria-hidden="true">
            {Array.from({ length: question.answer }, (_, index) => (
              <svg key={index} viewBox="0 0 32 32" className="h-8 w-8 sm:h-11 sm:w-11" focusable="false">
                <ObjectToken object={question.object} color={question.color} />
              </svg>
            ))}
          </div>
        </div>
      );
      return (
        <div className="mx-auto w-full max-w-2xl" aria-label="Two groups shown separately before adding">
          {modelJoined ? joinedGroup : (
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
              {objectGroup(question.a, 'First group', false)}
              <span aria-hidden="true" className="text-2xl font-black">+</span>
              {objectGroup(question.b, 'Second group', false)}
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-3" role="group" aria-label="Whole and two parts diagram">
        <div className="rounded-2xl border-2 border-emerald-400 bg-white px-4 py-3 font-black" role="group" aria-label={`Whole, ${question.total} counters`}>
          <span>Whole: {question.total}</span><div className="mt-2 flex max-w-64 flex-wrap justify-center gap-1" aria-hidden="true">{Array.from({length: question.total},(_,i)=><span key={i} className="h-3 w-3 rounded-full border border-teal-800 bg-teal-500" />)}</div>
        </div>
        <div aria-hidden="true" className="h-5 w-px bg-emerald-700" />
        <div className="flex items-start gap-3">
          <div className="min-w-24 rounded-xl border-2 border-teal-300 bg-teal-50 px-3 py-3 font-bold" role="group" aria-label={`Known part, ${question.a} counters`}><span>Part: {question.a}</span><div className="mt-2 flex max-w-24 flex-wrap justify-center gap-1" aria-hidden="true">{Array.from({length:question.a},(_,i)=><span key={i} className="h-3 w-3 rounded-full border border-teal-800 bg-teal-500" />)}</div></div>
          <div className={`min-w-24 rounded-xl border-2 border-dashed px-3 py-3 font-bold ${locked ? 'border-emerald-500 bg-emerald-50' : 'border-slate-400'}`} role="group" aria-label={locked ? `Missing part, ${question.b} counters` : 'Missing part, unknown number of counters'}>
            <span>Part: {locked ? question.b : '?'}</span><div className="mt-2 flex max-w-24 flex-wrap justify-center gap-1" aria-hidden="true">{locked && Array.from({length:question.b},(_,i)=><span key={i} className="h-3 w-3 rounded-full border border-emerald-800 bg-emerald-500" />)}</div>
          </div>
        </div>
        {!locked && <p className="text-sm font-semibold">Both parts make the whole.</p>}
      </div>
    );
  }, [question, locked, modelJoined]);

  const closeOptions = () => setOptionsOpen(false);
  const menu = phase !== 'play';
  const nextIndex = pendingStartRef.current?.chapterIndex ?? unlockedChapter;
  const recommended = ARITHMETIC_CHAPTERS[nextIndex];
  const retryStart = pendingStartRef.current?.chapterIndex === nextIndex;
  const recommendedLabel = retryStart ? 'Retry saving this chapter' : progress.completedChapterIds.includes(recommended.id)
    ? `Replay: ${recommended.title}` : phase === 'done' ? `Next: ${recommended.title}` : `Start: ${recommended.title}`;
  const soundChoice = { label: soundOn ? 'Turn sound off' : 'Turn sound on', action: () => { closeOptions(); onToggleSound?.(); } };
  const chapterChoices = ARITHMETIC_CHAPTERS.map((item, index) => {
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

    soundChoice,
    { label: 'Back to Maths Missions', action: leave },
  ];
  const startBlocked = !progressState.ok || rewardClaimError;
  const equation = question?.type === 'bond'
    ? `${question.a} + ${locked ? question.b : '?'} = ${question.total}`
    : `${question?.a} + ${question?.b} = ${locked ? question?.answer : '?'}`;
  return <div data-board-focus="" className="focus-game" data-addition-phase={phase} data-addition-question={menu ? undefined : question?.id} data-addition-run-seed={menu ? undefined : seed}>
    <main className={`focus-game-body ${menu || optionsOpen ? 'is-menu' : ''}`}>
      <header className="focus-game-heading">
        {!menu && <p>Addition Adventure · {chapter.title} · {roundIndex + 1} of 6</p>}
        <h1 ref={headingRef} tabIndex={-1}>{phase === 'done' ? 'Chapter saved!' : menu ? 'Addition Adventure' : question?.prompt}</h1>
      </header>
      {optionsOpen ? <FocusMenu choices={menu ? [...chapterChoices, soundChoice] : playChoices} onBack={closeOptions} /> : menu ? <>
        {phase === 'done' && <p role="status" className="focus-game-message">{feedback}</p>}
        {startBlocked || startError
          ? <p role="alert" className="focus-game-message">{startError || (!progressState.ok ? 'Saved chapter progress could not be checked.' : 'Confirm the saved reward before starting.')}</p>
          : <p className="focus-game-message">{recommended.skill} · six questions</p>}
        <div className="focus-game-actions">
          {startBlocked ? <button type="button" className="focus-game-button is-primary" disabled={progressRetryBusy || rewardDrainBusy} onClick={!progressState.ok ? retryProgressRead : () => void drainPendingRewards()}>{!progressState.ok ? 'Retry saved progress' : 'Retry reward confirmation'}</button>
            : <button type="button" data-addition-start className="focus-game-button is-primary" disabled={!canStart} onClick={() => start(nextIndex)}>{rewardDrainBusy ? 'Checking saved progress…' : recommendedLabel}</button>}
          <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
          <button type="button" className="focus-game-button" onClick={leave}>Back to Maths Missions</button>
        </div>
      </> : <>
        {equation && <p className="mb-3 text-center text-2xl font-black" aria-label={`Equation: ${equation}`}>{equation}</p>}
        <div className="my-3" data-addition-model>{model}</div>
        {!locked && <div className="my-3 grid grid-cols-3 gap-2" role="group" aria-label="Choose the answer">
          {question?.options.map(option => <button key={option} type="button" onClick={() => attempt(option)} className="focus-game-button text-xl" aria-label={`Answer ${option}`}>{option}</button>)}
        </div>}
        {feedback && <p role="status" className="focus-game-message">{feedback}</p>}
        {completionError && <p role="alert" className="focus-game-message">{completionError}</p>}
        <div className="focus-game-actions">
          {completionError ? <button ref={nextRef} type="button" data-addition-result-retry onClick={() => void finishChapter(pendingCompletionRef.current)} disabled={completionPending} className="focus-game-button is-primary">{completionPending ? 'Saving…' : 'Retry saving this result'}</button>
            : locked && <button ref={nextRef} type="button" onClick={next} disabled={completionPending} className="focus-game-button is-primary">{completionPending ? 'Saving…' : roundIndex === 5 ? 'Finish chapter' : 'Next question'}</button>}
          {!completionError && !completionPending && <>
            {soundOn && <button type="button" className="focus-game-button" onClick={() => tell(speak, locked ? question.explanation : question.prompt, arithmeticNarrationSegments(question, locked ? 'explanation' : undefined))}>{locked ? 'Hear explanation' : 'Hear question'}</button>}
            {!locked && question?.type !== 'bond' && <button type="button" onClick={() => setModelJoined(joined => !joined)} className="focus-game-button">{modelJoined ? 'Split the groups apart' : 'Bring the groups together'}</button>}
            <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
          </>}
        </div>
      </>}
    </main>
  </div>;
}
