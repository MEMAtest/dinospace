import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FocusMenu } from '../shared/FocusMenu.jsx';
import { monsterMathNarration } from '../../data/batch2Narration.js';
import { rewardClaimToken } from '../../data/playerRewards.js';
import {
  createMonsterMathRun, createMonsterRunSeed, MONSTER_MATH_EPISODES,
  monsterCountResultText, monsterCountVisualLabels, monsterNumberLineStep, monsterNumberLineValues, numberLineInstruction, tenFrameAccessibleLabel, tenFrameCellModel, tenFrameModelTeaching,
} from '../../data/monsterMathEpisodes.js';
import {
  getMonsterMathProgressStrict, getMonsterMathPendingRewardReceiptsStrict,
  recordMonsterEpisodeCompletionStrict, rememberMonsterMathRunStrict, markMonsterMathRewardReceiptClaimedStrict,
  monsterMathRewardCallbackUnits,
} from '../../data/monsterMathProgress.js';

const STARS_FOR = (firstTryCount) => firstTryCount >= 5 ? 3 : firstTryCount >= 3 ? 2 : 1;
const tokenColors = ['bg-amber-500', 'bg-sky-500'];

const CounterModel = ({ question, locked, animationCount, showHint, clueShown, guidedSteps, onStep, onResetSteps }) => {
  const model = question.model;
  if (model.type === 'count') {
    const accessibleLabels = monsterCountVisualLabels(model);
    return (
      <div className="rounded-2xl border-2 border-amber-200 bg-white p-2.5 shadow-md sm:rounded-3xl sm:border-4 sm:p-4">
        <p className="mb-2 text-center text-xs font-black uppercase tracking-widest text-amber-700 sm:mb-3 sm:text-sm">Count each picture once</p>
        <div role="group" aria-label={accessibleLabels.group} className="mx-auto grid max-w-[22rem] grid-cols-5 justify-items-center gap-1.5 sm:gap-2">
          {Array.from({ length: model.count }, (_, index) => <span key={index} role="img" aria-label={accessibleLabels.picture} className={`grid h-11 w-11 place-items-center rounded-xl sm:h-12 sm:w-12 sm:rounded-2xl ${locked && animationCount > index ? 'bg-emerald-100' : 'bg-amber-50'} text-2xl sm:text-3xl shadow-sm`}>{model.emoji}</span>)}
        </div>
        {locked && <p className="mt-3 text-center text-lg font-black text-emerald-700" aria-live="polite">{monsterCountResultText(model.count)}</p>}
      </div>
    );
  }

  if (model.type === 'ten-frame') {
    const cells = tenFrameCellModel(question, { locked, animationCount });
    return (
      <div className="rounded-2xl border-2 border-orange-200 bg-white p-2 shadow-md sm:rounded-3xl sm:border-4 sm:p-4">
        <p className="mb-1.5 text-center text-xs font-black uppercase tracking-widest text-orange-700 sm:mb-2 sm:text-sm">Two ten frames · count the counters</p>
        <div role="img" className="mx-auto grid max-w-[34rem] grid-cols-2 gap-2" aria-label={tenFrameAccessibleLabel(model, locked)}>
          {[0, 1].map((frame) => <div key={frame} aria-hidden="true" className="grid grid-cols-5 gap-0.5 rounded-xl bg-orange-100 p-1.5 sm:gap-1 sm:p-2">
          {cells.slice(frame * 10, frame * 10 + 10).map((cell) => {
            const color = cell.group === 'more' ? tokenColors[1] : tokenColors[0];
            return <span key={cell.index} className={`grid aspect-square min-h-5 place-items-center rounded-full border-2 border-white ${cell.visible ? color : 'bg-white'} ${cell.removed ? 'scale-75 opacity-35' : ''} ${cell.counted && !cell.removed ? 'ring-2 ring-emerald-400' : ''}`} aria-hidden="true">{cell.removed ? <span className="text-xs font-black text-white">✓</span> : null}</span>;
          })}</div>)}
        </div>
        <p className="mt-1 text-center text-base font-black text-slate-800 sm:mt-2 sm:text-lg" aria-live="polite">{model.first} {model.operation === 'add' ? '+' : '−'} {model.second} = {locked ? model.answer : '?'}</p>
        {tenFrameModelTeaching(model, locked, clueShown) && <p className="text-center text-sm font-bold text-emerald-700">{tenFrameModelTeaching(model, locked, clueShown)}</p>}
      </div>
    );
  }

  const start = model.first;
  const end = locked ? model.answer : null;
  const guided = showHint && !locked ? monsterNumberLineStep(model, guidedSteps) : null;
  const values = monsterNumberLineValues(model);
  return (
    <div className="rounded-2xl border-2 border-indigo-200 bg-white p-2 shadow-md sm:rounded-3xl sm:border-4 sm:p-4">
      <p className="mb-1.5 text-center text-xs font-black uppercase tracking-widest text-indigo-700 sm:mb-3 sm:text-sm">Number line · follow each jump</p>
      <div className="relative mx-auto max-w-3xl overflow-hidden px-1 pb-2 pt-4">
        <div className="absolute left-2 right-2 top-8 h-1.5 rounded-full bg-indigo-200" />
        <div className="relative grid" style={{ gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))` }}>
          {values.map((value) => {
            const atStart = value === start;
            const atEnd = locked && value === end;
            const atGuidedPoint = guided && value === guided.position;
            const inJump = locked && (model.operation === 'add' ? value > start && value <= end : value < start && value >= end);
            return <div key={value} className="relative flex min-w-0 flex-col items-center gap-1 text-[10px] font-black sm:text-xs">
              {atStart && !atGuidedPoint && <span className="z-10 grid h-5 w-5 place-items-center rounded-full bg-sky-600 text-white" aria-label="Starting point">●</span>}
              {atGuidedPoint && <span className="z-10 grid h-6 w-6 place-items-center rounded-full bg-amber-500 text-white" aria-label={`Current position ${guided.position}`}>●</span>}
              {atEnd && <span className="z-10 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white" aria-label="Answer point">✓</span>}
              {inJump && !atEnd && !atGuidedPoint && <span className="z-10 grid h-5 w-5 place-items-center rounded-full bg-indigo-400 text-white" aria-hidden="true">{model.emoji}</span>}
              {!atStart && !atEnd && !inJump && !atGuidedPoint && <span className="h-5" />}
              <span className={`${atEnd ? 'rounded bg-emerald-100 px-1 text-emerald-800' : atStart ? 'text-sky-800' : 'text-slate-500'}`}>{value}</span>
            </div>;
          })}
        </div>
      </div>
      <p className="mt-1 text-center text-base font-black text-slate-800 sm:text-lg" aria-live="polite">{numberLineInstruction(model, locked)}</p>
      {guided && <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-3 sm:gap-3" role="group" aria-label="Jump practice controls">
        <button type="button" onClick={onStep} disabled={guided.remaining === 0} className="min-h-12 rounded-xl bg-amber-500 px-2 text-sm font-black leading-tight text-amber-950 disabled:cursor-not-allowed disabled:opacity-50">Jump one step {model.operation === 'add' ? 'forward' : 'back'}</button>
        <button type="button" onClick={onResetSteps} disabled={guided.completed === 0} className="min-h-12 rounded-xl bg-slate-200 px-2 text-sm font-black leading-tight text-slate-900 disabled:cursor-not-allowed disabled:opacity-50">Start again</button>
        <p className="col-span-2 text-center text-sm font-bold leading-tight text-amber-950" aria-live="polite">At {guided.position}. {guided.remaining ? `${guided.remaining} ${guided.remaining === 1 ? 'jump' : 'jumps'} to go.` : 'All jumps done.'}</p>
      </div>}
    </div>
  );
};

const MonsterMath = ({ onBack, playSfx = () => {}, soundOn, onToggleSound, speak = () => {}, onCelebrate = () => {}, onGameEvent, onPhaseChange, playerId = 'amari' }) => {
  const [progressState, setProgressState] = useState(() => getMonsterMathProgressStrict(playerId));
  const progress = progressState.ok ? progressState.progress : { unlockedEpisode: 0, completedEpisodeIds: [], bestStars: {} };
  const [episodeIndex, setEpisodeIndex] = useState(() => (getMonsterMathProgressStrict(playerId).progress?.unlockedEpisode || 0));
  const [phase, setPhase] = useState('start');
  const [optionsOpen, setOptionsOpen] = useState(false);
  const headingRef = useRef(null);
  const nextRef = useRef(null);
  const [runSeed, setRunSeed] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [locked, setLocked] = useState(false);
  const [hadMistake, setHadMistake] = useState(false);
  const [hadHint, setHadHint] = useState(false);
  const [guidedSteps, setGuidedSteps] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [animationCount, setAnimationCount] = useState(0);
  const [animationDone, setAnimationDone] = useState(false);
  const [feedback, setFeedback] = useState('Choose an episode, then start your six-question run.');
  const [showHint, setShowHint] = useState(false);
  const [newEpisodeBadge, setNewEpisodeBadge] = useState(false);
  const [runStars, setRunStars] = useState(1);
  const [startStorageError, setStartStorageError] = useState('');
  const pendingStartRef = useRef(null);
  const [completionPending, setCompletionPending] = useState(false);
  const [completionError, setCompletionError] = useState('');
  const [pendingRewardReceipt, setPendingRewardReceipt] = useState(null);
  const [rewardClaimError, setRewardClaimError] = useState(false);
  const [rewardDrainBusy, setRewardDrainBusy] = useState(true);
  const [progressRetryBusy, setProgressRetryBusy] = useState(false);
  const questionAnnouncementRef = useRef('');
  const animationTimerRef = useRef(null);
  const pendingCompletionRef = useRef(null);
  const completionBusyRef = useRef(false);
  const receiptClaimsRef = useRef(new Map());
  const receiptDrainRef = useRef(null);
  const reconciledReceiptsRef = useRef(new Set());

  const episode = MONSTER_MATH_EPISODES[episodeIndex] || MONSTER_MATH_EPISODES[0];
  const question = rounds[roundIndex] || null;
  const canStartEpisode = progressState.ok && !rewardDrainBusy && !pendingRewardReceipt && !rewardClaimError;

  const refreshProgress = useCallback(() => {
    const loaded = getMonsterMathProgressStrict(playerId);
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
        parent = await onCelebrate(`${MONSTER_MATH_EPISODES.find(({ id }) => id === receipt.episodeId)?.title || 'Monster Math'} complete!`, monsterMathRewardCallbackUnits(receipt.rewardDelta), 0, 'math', {
          quiet: true,
          rewardToken: rewardClaimToken('math', receipt.id),
        });
      } catch { parent = null; }
      if (parent?.persisted !== true) {
        setRewardClaimError(true);
        return false;
      }
      const marked = markMonsterMathRewardReceiptClaimedStrict(playerId, receipt.id);
      if (!marked.ok) {
        setRewardClaimError(true);
        return false;
      }
      reconciledReceiptsRef.current.add(claimId);
      setProgressState({ ok: true, progress: marked.progress });
      setRewardClaimError(false);
      setPendingRewardReceipt(null);
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
      const loaded = getMonsterMathPendingRewardReceiptsStrict(playerId);
      if (!loaded.ok) {
        setRewardClaimError(true);
        return false;
      }
      let failed = false;
      for (const receipt of loaded.receipts) {
        if (!await claimRewardReceipt(receipt)) failed = true;
      }
      if (failed) {
        setRewardClaimError(true);
        return false;
      }
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
    const timer = window.setTimeout(() => { void drainPendingRewards(); }, 0);
    return () => window.clearTimeout(timer);
  }, [drainPendingRewards]);

  const retryProgressRead = () => {
    setProgressRetryBusy(true);
    const loaded = getMonsterMathProgressStrict(playerId);
    setProgressState(loaded);
    if (loaded.ok) setEpisodeIndex((current) => Math.min(current, loaded.progress.unlockedEpisode));
    setProgressRetryBusy(false);
    if (loaded.ok) void drainPendingRewards();
  };

  useEffect(() => { onPhaseChange?.(phase === 'done' && !completionPending && !pendingRewardReceipt && !rewardClaimError && !rewardDrainBusy ? 'finish' : phase === 'start' ? 'intro' : 'play'); }, [completionPending, onPhaseChange, pendingRewardReceipt, phase, rewardClaimError, rewardDrainBusy]);

  useLayoutEffect(() => {
    if (phase === 'play') window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [phase]);

  useEffect(() => () => clearInterval(animationTimerRef.current), []);

  useEffect(() => {
    if (phase !== 'play' || !question || !Number.isSafeInteger(runSeed)) return;
    const key = `${runSeed}:${roundIndex}`;
    if (questionAnnouncementRef.current === key) return;
    questionAnnouncementRef.current = key;
    onGameEvent?.('math', 'question', { level: episodeIndex, round: roundIndex, seed: runSeed, difficulty: episode.band });
    speak(question.prompt, { segments: monsterMathNarration.promptSegments(question) });
  }, [episode.band, episodeIndex, onGameEvent, phase, question, roundIndex, runSeed, speak]);

  useEffect(() => { if (!optionsOpen) headingRef.current?.focus({ preventScroll: true }); }, [phase, roundIndex, optionsOpen]);
  useEffect(() => { if (locked && animationDone) nextRef.current?.focus({ preventScroll: true }); }, [locked, animationDone, completionError]);

  const startEpisode = (selectedIndex = episodeIndex) => {
    setOptionsOpen(false);
    const chosen = MONSTER_MATH_EPISODES[selectedIndex];
    const loaded = getMonsterMathProgressStrict(playerId);
    if (!loaded.ok || rewardDrainBusy || pendingRewardReceipt || rewardClaimError || selectedIndex > loaded.progress.unlockedEpisode || !chosen) {
      if (!loaded.ok) setProgressState(loaded);
      return;
    }
    let attempt = pendingStartRef.current?.episodeIndex === selectedIndex ? pendingStartRef.current : null;
    if (!attempt) {
      const seed = createMonsterRunSeed();
      const recent = loaded.progress.recentQuestionIds[selectedIndex] || [];
      const queue = createMonsterMathRun({ episodeIndex: selectedIndex, seed, recentQuestionIds: recent });
      attempt = { episodeIndex: selectedIndex, seed, queue };
    }
    pendingStartRef.current = attempt;
    const { seed, queue } = attempt;
    const remembered = rememberMonsterMathRunStrict(playerId, selectedIndex, queue.map((item) => item.id));
    if (!remembered.ok) {
      setProgressState(loaded);
      setEpisodeIndex(selectedIndex);
      setStartStorageError('Question history could not be saved. Retry to start this same six-question run.');
      return;
    }
    pendingStartRef.current = null;
    setStartStorageError('');
    questionAnnouncementRef.current = '';
    setProgressState({ ok: true, progress: remembered.progress });
    setEpisodeIndex(selectedIndex);
    setRunSeed(seed);
    setRounds(queue);
    setRoundIndex(0);
    setLocked(false);
    setHadMistake(false);
    setHadHint(false);
    setGuidedSteps(0);
    setFirstTryCount(0);
    setAnimationCount(0);
    setAnimationDone(false);
    setShowHint(false);
    setNewEpisodeBadge(false);
    setCompletionPending(false);
    setCompletionError('');
    pendingCompletionRef.current = null;
    setPhase('play');
    setFeedback('');
    playSfx('launch');
    if (loaded.progress.completedEpisodeIds.includes(chosen.id)) {
      onGameEvent?.('math', 'replay', { level: selectedIndex, round: 0, seed, difficulty: chosen.band });
    }
    onGameEvent?.('math', 'start', { level: selectedIndex, round: 0, seed, difficulty: chosen.band });
  };

  const finishEpisode = async (draft = pendingCompletionRef.current) => {
    if (!draft || completionBusyRef.current) return;
    completionBusyRef.current = true;
    pendingCompletionRef.current = draft;
    setCompletionPending(true);
    setCompletionError('');
    if (draft.newlyCompleted === undefined) {
      const before = getMonsterMathProgressStrict(playerId);
      if (before.ok) {
        const episodeId = MONSTER_MATH_EPISODES[draft.episodeIndex]?.id;
        const wasAlreadyEarned = before.progress.completedEpisodeIds.includes(episodeId)
          || (before.progress.bestStars[episodeId] || 0) > 0
          || before.progress.unlockedEpisode > draft.episodeIndex;
        draft.newlyCompleted = !wasAlreadyEarned;
      }
    }
    const completion = recordMonsterEpisodeCompletionStrict(playerId, draft.episodeIndex, draft.stars, draft.questionIds);
    if (!completion.ok) {
      setCompletionError('This six-question result is ready, but saved progress could not be confirmed. Retry to save this same result.');
      completionBusyRef.current = false;
      return;
    }
    draft.newlyCompleted = Boolean(draft.newlyCompleted || completion.newlyCompleted);
    setProgressState({ ok: true, progress: completion.progress });
    setRunStars(draft.stars);
    setNewEpisodeBadge(draft.newlyCompleted);
    if (!draft.completionEventSent) {
      draft.completionEventSent = true;
      onGameEvent?.('math', 'level_complete', { level: draft.episodeIndex, round: draft.questionIds.length - 1, seed: draft.seed, difficulty: MONSTER_MATH_EPISODES[draft.episodeIndex].band });
    }
    const drained = await drainPendingRewards();
    if (!drained) {
      setCompletionError('This result is saved, but its reward still needs confirmation. Retry this same saved result.');
      completionBusyRef.current = false;
      return;
    }
    pendingCompletionRef.current = null;
    setCompletionPending(false);
    setCompletionError('');
    setFeedback(`${MONSTER_MATH_EPISODES[draft.episodeIndex].title} complete. You got ${draft.stars} ${draft.stars === 1 ? 'star' : 'stars'} for this run.`);
    playSfx('complete');
    setPhase('done');
    completionBusyRef.current = false;
  };

  const animateAnswer = (target) => {
    clearInterval(animationTimerRef.current);
    setAnimationCount(0);
    setAnimationDone(false);
    let count = 0;
    const interval = window.setInterval(() => {
      count += 1;
      setAnimationCount(count);
      playSfx('tap');
      if (count >= target) {
        clearInterval(interval);
        animationTimerRef.current = null;
        setAnimationDone(true);
      }
    }, 130);
    animationTimerRef.current = interval;
  };

  const checkAnswer = (answer) => {
    if (!question || locked) return;
    if (answer !== question.answer) {
      setHadMistake(true);
      setShowHint(hadHint && question.model.type === 'number-line');
      setFeedback('Not yet. Try the clue, then count the model again.');
      onGameEvent?.('math', 'answer_attempt', { level: episodeIndex, round: roundIndex, seed: runSeed, firstAttempt: !hadMistake, difficulty: episode.band });
      playSfx('wrong');
      speak(monsterMathNarration.retry(question), { segments: monsterMathNarration.retrySegments(question) });
      return;
    }
    const independent = !hadMistake && !hadHint;
    setLocked(true);
    setGuidedSteps(0);
    setShowHint(false);
    setFeedback(question.explanation);
    setFirstTryCount((count) => count + (independent ? 1 : 0));
    setAnimationCount(0);
    setAnimationDone(false);
    onGameEvent?.('math', 'answer_correct', {
      level: episodeIndex, round: roundIndex, seed: runSeed, difficulty: episode.band,
      skill: episode.skill, item: question.id, response: answer, expected: question.answer,
      correct: true, firstAttempt: independent, independent, hints: hadHint ? 1 : 0,
    });
    playSfx('success');
    speak(question.explanation, { segments: monsterMathNarration.explanationSegments(question) });
    animateAnswer(question.answer);
  };

  const replayPrompt = () => {
    if (!question) return;
    onGameEvent?.('math', 'hint', { level: episodeIndex, round: roundIndex, seed: runSeed, difficulty: episode.band, hintType: 'replay_clue' });
    speak(question.prompt, { segments: monsterMathNarration.promptSegments(question) });
  };

  const requestHint = () => {
    if (!question || locked) return;
    setHadHint(true);
    setShowHint(true);
    setFeedback(question.clue);
    onGameEvent?.('math', 'hint', { level: episodeIndex, round: roundIndex, seed: runSeed, difficulty: episode.band, hintType: 'clue' });
    speak(question.clue, { segments: monsterMathNarration.clueSegments(question) });
  };

  const nextQuestion = () => {
    if (!locked || !animationDone || completionPending) return;
    if (roundIndex < rounds.length - 1) {
      setRoundIndex((index) => index + 1);
      setLocked(false);
      setHadMistake(false);
      setHadHint(false);
      setGuidedSteps(0);
      setAnimationCount(0);
      setAnimationDone(false);
      setShowHint(false);
      setFeedback('');
      return;
    }
    const stars = STARS_FOR(firstTryCount);
    void finishEpisode({ episodeIndex, stars, questionIds: rounds.map((item) => item.id), seed: runSeed, completionEventSent: false });
  };

  const leaveGame = () => {
    if (phase === 'play' && Number.isSafeInteger(runSeed)) onGameEvent?.('math', 'leave', { level: episodeIndex, round: roundIndex, seed: runSeed, difficulty: episode.band });
    onBack?.();
  };

  const closeOptions = () => setOptionsOpen(false);
  const menu = phase !== 'play';
  const nextIndex = pendingStartRef.current?.episodeIndex ?? progress.unlockedEpisode;
  const recommended = MONSTER_MATH_EPISODES[nextIndex];
  const nextLabel = pendingStartRef.current ? 'Retry saving this episode' : progress.completedEpisodeIds.includes(recommended.id)
    ? `Replay: ${recommended.title}` : phase === 'done' ? `Next: ${recommended.title}` : `Start: ${recommended.title}`;
  const soundChoice = { label: soundOn ? 'Turn sound off' : 'Turn sound on', action: () => { closeOptions(); onToggleSound?.(); } };
  const episodeChoices = MONSTER_MATH_EPISODES.map((item, index) => {
    const complete = progress.completedEpisodeIds.includes(item.id);
    return {
      label: `${item.title}${index > progress.unlockedEpisode ? ' · Locked' : complete ? ' · Complete' : ''}`,
      description: item.subtitle,
      button: `${complete ? 'Replay' : 'Start'}: ${item.title}`,
      disabled: !canStartEpisode || index > progress.unlockedEpisode || Boolean(pendingStartRef.current),
      action: () => startEpisode(index),
    };
  });
  const playChoices = [
    ...(!locked && !hadHint ? [{ label: question?.model.type === 'number-line' ? 'Try the jumps' : 'Show me a clue', action: () => { closeOptions(); requestHint(); } }] : []),
    soundChoice,
    { label: 'Back to Maths Missions', action: leaveGame },
  ];
  const menuError = !progressState.ok ? 'Saved progress could not be checked.' : rewardClaimError ? 'Confirm the saved reward before starting.' : startStorageError;

  return <div data-board-focus="" className="focus-game" data-monster-phase={phase} data-monster-question={menu ? undefined : question?.id}>
    <main className={`focus-game-body ${menu || optionsOpen ? 'is-menu' : ''}`}>
      <header className="focus-game-heading">
        {!menu && <p>Monster Math · {episode.title} · {roundIndex + 1} of {rounds.length}</p>}
        <h1 ref={headingRef} tabIndex={-1}>{phase === 'done' ? 'Episode saved!' : menu ? 'Monster Math' : question?.prompt}</h1>
      </header>
      {optionsOpen ? <FocusMenu choices={menu ? [...episodeChoices, soundChoice] : playChoices} onBack={closeOptions} /> : menu ? <>
        {phase === 'done' && <p className="focus-game-message" role="status">{episode.title} saved with {runStars} {runStars === 1 ? 'star' : 'stars'}. {newEpisodeBadge && 'New badge earned.'}</p>}
        {menuError ? <p role="alert" className="focus-game-message">{menuError}</p> : <p className="focus-game-message">{recommended.subtitle}</p>}
        <div className="focus-game-actions">
          {!progressState.ok || rewardClaimError
            ? <button type="button" className="focus-game-button is-primary" onClick={!progressState.ok ? retryProgressRead : () => void drainPendingRewards()} disabled={progressRetryBusy || rewardDrainBusy}>{!progressState.ok ? 'Retry saved progress' : 'Retry reward confirmation'}</button>
            : <button type="button" className="focus-game-button is-primary" disabled={!canStartEpisode} onClick={() => startEpisode(nextIndex)}>{rewardDrainBusy ? 'Checking saved progress…' : nextLabel}</button>}
          <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
          <button type="button" className="focus-game-button" onClick={leaveGame}>Back to Maths Missions</button>
        </div>
      </> : question && <>
        <div className="my-3" data-monster-model>
          <CounterModel question={question} locked={locked} animationCount={animationCount} showHint={showHint && question.model.type === 'number-line'} clueShown={hadHint} guidedSteps={guidedSteps}
            onStep={() => setGuidedSteps(steps => monsterNumberLineStep(question.model, steps).completed + 1)} onResetSteps={() => setGuidedSteps(0)} />
        </div>
        {!locked && <div role="group" aria-label="Choose the answer" className="my-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {question.options.map(option => <button key={option} type="button" className="focus-game-button text-xl" onClick={() => checkAnswer(option)}>{option}</button>)}
        </div>}
        {(feedback || showHint) && <p className="focus-game-message" role="status">{feedback || question.clue}</p>}
        {completionPending && <p className="focus-game-message" role={completionError ? 'alert' : 'status'}>{completionError || 'Saving your result…'}</p>}
        <div className="focus-game-actions">
          {completionError ? <button ref={nextRef} type="button" className="focus-game-button is-primary" onClick={() => void finishEpisode(pendingCompletionRef.current)} disabled={completionBusyRef.current || rewardDrainBusy}>Retry saving this result</button>
            : locked && !completionPending && <button ref={nextRef} type="button" className="focus-game-button is-primary" disabled={!animationDone} onClick={nextQuestion}>{!animationDone ? 'Watch the counters…' : roundIndex + 1 < rounds.length ? 'Next question' : 'Finish episode'}</button>}
          {!completionPending && <>
            {!locked && soundOn && <button type="button" className="focus-game-button" onClick={replayPrompt}>Hear the question again</button>}
            <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
          </>}
        </div>
      </>}
    </main>
  </div>;
};

export default MonsterMath;
