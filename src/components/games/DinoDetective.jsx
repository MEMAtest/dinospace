import { useCallback, useEffect, useRef, useState } from 'react';
import { dinoFoundNarration } from '../../data/batch3Narration.js';
import { FocusMenu } from '../shared/FocusMenu.jsx';
import DinoIcon from '../shared/DinoIcon.jsx';
import { DinoSticker } from '../shared/StickerArt.jsx';
import dinoPark from '../../assets/puzzle-pop/dino-park.jpg';
import {
  DINO_DETECTIVE_NARRATION, DINO_DETECTIVE_WORLDS,
  DINO_SEARCH_SPOTS, createDinoDetectiveRun, createDinoRunSeed, getDinoCluePlan,
} from '../../data/dinoDetectiveBatch3.js';
import {
  readDinoDetectiveProgress, commitDinoDetectiveCompletion,
  rememberDinoDetectiveRun, recentDinoRunSignatures, createDinoDetectiveTransactionId,
  dinoRewardReceiptsToReconcile,
} from '../../data/dinoDetectiveProgress.js';

const ambientStyles = {
  jungle: 'from-emerald-950 via-green-900 to-lime-800', volcano: 'from-stone-950 via-red-950 to-orange-900',
  river: 'from-sky-950 via-blue-900 to-teal-800', moonlight: 'from-indigo-950 via-slate-900 to-blue-950',
  desert: 'from-amber-950 via-orange-900 to-yellow-800', rainbow: 'from-indigo-950 via-violet-900 to-rose-900',
  swamp: 'from-teal-950 via-emerald-950 to-lime-900', snow: 'from-slate-800 via-sky-900 to-indigo-950',
  cave: 'from-slate-950 via-indigo-950 to-violet-950', fern: 'from-green-950 via-emerald-900 to-teal-950',
  cliffs: 'from-stone-950 via-amber-950 to-orange-950', shore: 'from-sky-950 via-cyan-900 to-blue-800',
};
const isCompleted = (progress, world) => progress.completedWorldIds.includes(world.id);
const phaseName = (phase) => phase === 'active' ? 'play' : phase === 'collection' ? 'map' : phase;
const quadraticPoint = (from, control, to, t) => {
  const inverse = 1 - t;
  return { x: (inverse * inverse * from.x) + (2 * inverse * t * control.x) + (t * t * to.x), y: (inverse * inverse * from.y) + (2 * inverse * t * control.y) + (t * t * to.y) };
};

const SceneAmbience = ({ id }) => <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full opacity-55">
  {id === 'jungle' && <g fill="none" stroke="#bbf7d0" strokeWidth="2"><path d="M8 100Q18 52 7 9M8 55Q26 47 27 29M10 72Q29 71 36 54M91 100Q78 57 94 14M88 62Q70 52 68 34M90 79Q73 78 65 61"/><path d="M9 48Q24 43 27 29Q15 30 9 48M11 68Q28 67 36 54Q21 53 11 68M90 52Q75 46 68 34Q84 35 90 52M87 76Q70 73 65 61Q80 60 87 76" fill="#65a30d"/></g>}
  {id === 'volcano' && <g><path d="M22 91 46 24l9 0 25 67Z" fill="#57534e" stroke="#fed7aa" strokeWidth="2"/><path d="M43 32 49 43l8-11 6 20-9 15-8-15Z" fill="#fb923c"/><path d="M42 20Q36 10 45 4M54 18Q65 10 59 2" fill="none" stroke="#e7e5e4" strokeWidth="3" strokeLinecap="round"/></g>}
  {id === 'river' && <g fill="none" stroke="#bae6fd" strokeWidth="3"><path d="M-5 23Q15 10 35 23T75 23T115 23M-5 44Q15 31 35 44T75 44T115 44M-5 66Q15 53 35 66T75 66T115 66M-5 88Q15 75 35 88T75 88T115 88"/></g>}
  {id === 'moonlight' && <g fill="#fef3c7"><path d="M77 12a16 16 0 1 0 12 25A18 18 0 0 1 77 12Z"/><path d="m18 16 2 5 5 2-5 2-2 5-2-5-5-2 5-2Zm24 19 1.5 3.5L47 40l-3.5 1.5L42 45l-1.5-3.5L37 40l3.5-1.5Z"/></g>}
  {id === 'desert' && <g><circle cx="80" cy="22" r="9" fill="#fde68a"/><path d="M0 75Q20 46 42 72T84 65T110 68V100H0Z" fill="#d97706"/><path d="M0 88Q24 65 49 89T100 81V100H0Z" fill="#fbbf24"/></g>}
  {id === 'rainbow' && <g fill="none" strokeWidth="3"><path d="M19 66a31 31 0 0 1 62 0" stroke="#fda4af"/><path d="M25 66a25 25 0 0 1 50 0" stroke="#fde68a"/><path d="M31 66a19 19 0 0 1 38 0" stroke="#86efac"/><path d="M37 66a13 13 0 0 1 26 0" stroke="#93c5fd"/></g>}
  {id === 'swamp' && <g fill="none" stroke="#bbf7d0" strokeWidth="2.2"><path d="M7 100Q15 64 13 35M14 78Q28 69 30 52M86 100Q79 61 82 29M83 76Q69 68 68 49"/><path d="M-3 85Q12 78 27 85T57 85T87 85T117 85M-3 94Q12 87 27 94T57 94T87 94T117 94"/><ellipse cx="51" cy="74" rx="11" ry="4" fill="#4ade80"/></g>}
  {id === 'snow' && <g fill="none" stroke="#e0f2fe" strokeWidth="2.5"><path d="m0 80 27-34 20 20 20-38 33 52v20H0Z" fill="#64748b"/><path d="m24 49 4 8 8 4-8 4-4 8-4-8-8-4 8-4Zm42-18 3 6 6 3-6 3-3 6-3-6-6-3 6-3Z"/></g>}
  {id === 'cave' && <g fill="none" stroke="#c4b5fd" strokeWidth="2"><path d="M0 0h100v22L88 17 78 33 67 16 57 34 47 11 34 32 22 14 12 28 0 18Z" fill="#475569"/><path d="M0 100 14 80 25 88 37 74 51 91 62 78 74 89 87 70 100 82v18Z" fill="#475569"/><path d="m58 42 8 9-7 16-7-16Z" fill="#67e8f9"/></g>}
  {id === 'fern' && <g fill="none" stroke="#bbf7d0" strokeWidth="1.7"><path d="M14 100Q27 60 13 10M14 73Q31 70 36 57M18 60Q3 53 3 40M21 47Q38 44 42 30M24 34Q9 27 10 16M80 100Q67 58 83 8M80 72Q64 65 59 51M76 58Q90 51 93 37M73 45Q58 39 55 25"/><path d="M14 73q15 3 22-16M18 60Q5 55 3 40m18 7q15-3 21-17M24 34Q10 30 10 16M80 72Q64 67 59 51m17 7q13-4 17-21M73 45q-13-4-18-20" fill="#4d7c0f"/></g>}
  {id === 'cliffs' && <g fill="#78716c" stroke="#e7e5e4" strokeWidth="1.5"><path d="M0 74 15 59l8 8 12-28 13 25 8-12 14 21 13-33 17 26v34H0Z"/><path d="M20 87q7-7 14 0t14 0t14 0" fill="none" stroke="#fef3c7" strokeWidth="3"/></g>}
  {id === 'shore' && <g fill="none" stroke="#bae6fd" strokeWidth="2.8"><path d="M-5 59Q10 48 25 59T55 59T85 59T115 59M-5 72Q10 61 25 72T55 72T85 72T115 72M-5 85Q10 74 25 85T55 85T85 85T115 85"/><path d="M76 35q-13 0-13 10t13 10q13 0 13-10t-13-10Zm0 0v20m-8-17 16 14m0-14L68 52" stroke="#fef3c7"/></g>}
</svg>;

const HidingCover = ({ bandIndex }) => <svg aria-hidden="true" viewBox="0 0 64 64" className="h-11 w-11">
  {bandIndex === 0 ? <g fill="#65a30d" stroke="#ecfccb" strokeWidth="1.8"><path d="M31 56Q31 31 15 10M31 49Q42 26 52 9" fill="none"/><ellipse cx="18" cy="15" rx="8" ry="4" transform="rotate(38 18 15)"/><ellipse cx="24" cy="26" rx="8" ry="4" transform="rotate(33 24 26)"/><ellipse cx="28" cy="39" rx="8" ry="4" transform="rotate(20 28 39)"/><ellipse cx="48" cy="15" rx="8" ry="4" transform="rotate(-42 48 15)"/><ellipse cx="41" cy="28" rx="8" ry="4" transform="rotate(-36 41 28)"/><ellipse cx="35" cy="42" rx="8" ry="4" transform="rotate(-27 35 42)"/></g>
    : bandIndex === 1 ? <g fill="#a8a29e" stroke="#f5f5f4" strokeWidth="2"><path d="M7 49 13 28l13-9 12 7 6 14 13 9-5 8H12Z"/><path d="m13 29 9-2 4-8m12 7 8 4 4 12" fill="none" stroke="#78716c" strokeWidth="2"/><circle cx="22" cy="38" r="3" fill="#78716c"/><circle cx="43" cy="48" r="2.5" fill="#78716c"/></g>
      : <g stroke="#e2e8f0" strokeWidth="1.8"><path d="M8 53 13 35l12-7 9 5 3 12 8-7 12 4 2 11Z" fill="#64748b"/><path d="M20 41q8-8 16 0m-12 4q8-8 16 0" fill="none" stroke="#bbf7d0" strokeWidth="3"/><circle cx="21" cy="46" r="2" fill="#f8fafc"/><circle cx="45" cy="43" r="2" fill="#f8fafc"/></g>}
</svg>;

const DinoDetective = ({ onBack, playSfx = () => {}, speak = () => {}, cancelNarration = () => {}, soundOn, onToggleSound, onCelebrate = () => {}, onGameEvent, onPhaseChange, playerId = 'amari' }) => {
  const [progressState, setProgressState] = useState(() => readDinoDetectiveProgress(playerId));
  const progress = progressState.progress;
  const [phase, setPhase] = useState('map');
  const [worldIndex, setWorldIndex] = useState(0);
  const [run, setRun] = useState(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [found, setFound] = useState(false);
  const [hintStage, setHintStage] = useState(0);
  const [wrongSpot, setWrongSpot] = useState(null);
  const [result, setResult] = useState(null);
  const [saveError, setSaveError] = useState('');
  const [pendingRewardReceipt, setPendingRewardReceipt] = useState(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(0);
  const [roundHadMistake, setRoundHadMistake] = useState(false);
  const [feedback, setFeedback] = useState(DINO_DETECTIVE_NARRATION.instruction);
  const nextLockRef = useRef(false);
  const finishLockRef = useRef(false);
  const completionTransactionRef = useRef(null);
  const reconciledRewardTokensRef = useRef(new Set());
  const world = DINO_DETECTIVE_WORLDS[worldIndex];
  const round = run?.rounds[roundIndex];
  const targetSpot = round && DINO_SEARCH_SPOTS.find(({ id }) => id === round.targetSpotId);
  const trailControl = targetSpot && { x: Math.max(8, Math.min(92, ((50 + targetSpot.x) / 2) + (targetSpot.x < 50 ? -12 : 12))), y: (96 + targetSpot.y) / 2 };
  const trailPawCount = world.bandIndex === 1 ? 6 : world.bandIndex === 2 ? 3 : 4;
  const trailPaws = targetSpot && Array.from({ length: trailPawCount }, (_, index) => quadraticPoint({ x: 50, y: 96 }, trailControl, targetSpot, (index + 1) / (trailPawCount + 1)));
  const cluePlan = round && getDinoCluePlan(world.bandIndex, hintStage, round);
  const partialTrailControl = targetSpot && quadraticPoint({ x: 50, y: 96 }, trailControl, targetSpot, 0.35);
  const partialTrailEnd = targetSpot && quadraticPoint({ x: 50, y: 96 }, trailControl, targetSpot, 0.58);
  const visiblePaws = cluePlan?.trail === 'full' ? trailPaws : cluePlan?.trail === 'partial' ? trailPaws?.slice(0, Math.max(1, Math.ceil(trailPawCount / 2))) : [];

  useEffect(() => { onPhaseChange?.(phaseName(phase)); }, [onPhaseChange, phase]);
  useEffect(() => () => cancelNarration(), [cancelNarration]);
  useEffect(() => { nextLockRef.current = false; }, [roundIndex]);

  const claimRewardReceipt = useCallback((receipt, quiet = true) => {
    if (!receipt?.id || !Number.isInteger(receipt.awardedStars) || receipt.awardedStars <= 0) return true;
    const rewardToken = `dino:${receipt.id}`;
    if (reconciledRewardTokensRef.current.has(rewardToken)) return true;
    const claim = onCelebrate(
      'Dinosaur world reward earned!', receipt.awardedStars * 4, 0, 'dino', { quiet, rewardToken },
    );
    if (!claim?.persisted) {
      setPendingRewardReceipt(receipt);
      setSaveError('Your dinosaur facts are saved, but the reward is not confirmed yet. Retry before leaving this world.');
      return false;
    }
    reconciledRewardTokensRef.current.add(rewardToken);
    setPendingRewardReceipt((current) => current?.id === receipt.id ? null : current);
    setSaveError('');
    return true;
  }, [onCelebrate]);

  useEffect(() => {
    if (phase !== 'map' || !progressState.ok) return;
    for (const receipt of dinoRewardReceiptsToReconcile(progressState.progress)) {
      if (reconciledRewardTokensRef.current.has(`dino:${receipt.id}`)) continue;
      if (!claimRewardReceipt(receipt, true)) break;
    }
  }, [claimRewardReceipt, phase, progressState]);

  const startWorld = (index) => {
    const currentRead = readDinoDetectiveProgress(playerId);
    const currentProgress = currentRead.ok ? currentRead.progress : progress;
    if (index > currentProgress.unlockedWorldIndex) return;
    cancelNarration();
    const selected = DINO_DETECTIVE_WORLDS[index];
    const seed = createDinoRunSeed();
    const recent = currentRead.ok ? recentDinoRunSignatures(playerId, selected.id) : currentProgress.recentRunSignatures[selected.id] || [];
    const nextRun = createDinoDetectiveRun(index, seed, recent);
    if (!nextRun) return;
    const remembered = rememberDinoDetectiveRun(playerId, selected.id, nextRun.signature);
    if (remembered?.ok) {
      const verified = readDinoDetectiveProgress(playerId);
      if (verified.ok) setProgressState(verified);
      setSaveError('');
    } else if (!remembered?.ok) {
      setSaveError('Saved progress is unavailable. You can practise this world, but new progress will stay unsaved until it can be saved safely.');
    }
    setWorldIndex(index); setRun(nextRun); setRoundIndex(0); setFound(false);
    setHintStage(0); setWrongSpot(null); setResult(null); setMistakes(0); setHints(0);
    setRoundHadMistake(false);
    nextLockRef.current = false; finishLockRef.current = false; completionTransactionRef.current = null; setSavingProgress(false);
    setFeedback(DINO_DETECTIVE_NARRATION.instruction); setPhase('active');
    if (isCompleted(currentProgress, selected)) onGameEvent?.('dino', 'replay', { level: index, round: 0, seed, difficulty: selected.bandId });
    onGameEvent?.('dino', 'start', { level: index, round: 0, seed, difficulty: selected.bandId });
    onGameEvent?.('dino', 'question', { level: index, round: 1, seed, difficulty: selected.bandId });
    speak(DINO_DETECTIVE_NARRATION.instruction, { premium: false, segments: [DINO_DETECTIVE_NARRATION.instruction] });
    playSfx('launch');
  };

  const chooseSpot = (spotId) => {
    if (phase !== 'active' || found || !round) return;
    if (spotId !== round.targetSpotId) {
      setWrongSpot(spotId); setMistakes((value) => value + 1);
      setRoundHadMistake(true);
      setFeedback(DINO_DETECTIVE_NARRATION.wrong);
      speak(DINO_DETECTIVE_NARRATION.wrong, { premium: false, segments: [DINO_DETECTIVE_NARRATION.wrong] });
      onGameEvent?.('dino', 'answer_attempt', { level: worldIndex, round: roundIndex + 1, seed: run.seed, correct: false, firstAttempt: !roundHadMistake, independent: false, hints: hintStage, difficulty: world.bandId });
      playSfx('wrong');
      return;
    }
    setFound(true); setWrongSpot(null); setFeedback(DINO_DETECTIVE_NARRATION.found);
    const narration = dinoFoundNarration(world);
    speak(narration.text, { premium: false, segments: narration.segments });
    const independent = !roundHadMistake && hintStage === 0;
    onGameEvent?.('dino', 'answer_attempt', { level: worldIndex, round: roundIndex + 1, seed: run.seed, correct: true, firstAttempt: !roundHadMistake, independent, hints: hintStage, difficulty: world.bandId });
    onGameEvent?.('dino', 'answer_correct', { level: worldIndex, round: roundIndex + 1, seed: run.seed, firstAttempt: !roundHadMistake, independent, hints: hintStage, difficulty: world.bandId });
    playSfx('success');
  };

  const showClue = () => {
    if (phase !== 'active' || found || !cluePlan || cluePlan.step >= cluePlan.maxStep) return;
    const nextStep = cluePlan.step + 1;
    const nextPlan = getDinoCluePlan(world.bandIndex, nextStep, round);
    setHintStage(nextStep); setHints((value) => value + 1);
    setFeedback(nextPlan.exactText || nextPlan.regionText);
    if (nextPlan.exactText) speak(nextPlan.exactText, { premium: false, segments: [nextPlan.exactText] });
    onGameEvent?.('dino', 'hint', { level: worldIndex, round: roundIndex + 1, seed: run.seed, hints: nextStep, difficulty: world.bandId });
  };

  const next = () => {
    if (!found || !run || nextLockRef.current) return;
    nextLockRef.current = true;
    cancelNarration();
    if (roundIndex < run.rounds.length - 1) {
      const nextIndex = roundIndex + 1;
      setRoundIndex(nextIndex); setFound(false); setHintStage(0); setWrongSpot(null); setRoundHadMistake(false);
      setFeedback(DINO_DETECTIVE_NARRATION.instruction);
      speak(DINO_DETECTIVE_NARRATION.instruction, { premium: false, segments: [DINO_DETECTIVE_NARRATION.instruction] });
      onGameEvent?.('dino', 'question', { level: worldIndex, round: nextIndex + 1, seed: run.seed, difficulty: world.bandId });
      return;
    }
    if (finishLockRef.current) { nextLockRef.current = false; return; }
    finishLockRef.current = true;
    setSavingProgress(true);
    const stars = mistakes === 0 && hints === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    completionTransactionRef.current ||= createDinoDetectiveTransactionId();
    const completion = commitDinoDetectiveCompletion(
      playerId, world.id, stars, run.rounds.map(({ id }) => id), undefined, completionTransactionRef.current,
    );
    if (!completion.ok) {
      finishLockRef.current = false;
      nextLockRef.current = false;
      setSavingProgress(false);
      setSaveError('This world is not saved yet. Your facts are still here. Retry saving when storage is available.');
      setFeedback('Progress could not be saved. Your dinosaur facts are still here; retry saving this world.');
      return;
    }
    setProgressState({ ok: true, progress: completion.progress });
    setSavingProgress(false);
    if (completion.awardedStars > 0 && !claimRewardReceipt({
      id: completion.transactionId, worldId: world.id, awardedStars: completion.awardedStars,
    }, false)) {
      finishLockRef.current = false;
      nextLockRef.current = false;
      setSaveError('Your dinosaur facts are saved, but the reward is not confirmed yet. Retry this result.');
      setFeedback('The world is saved. Retry to confirm its reward; your dinosaur facts are still here.');
      return;
    }
    setSaveError('');
    setResult(completion);
    onGameEvent?.('dino', 'level_complete', { level: worldIndex, round: run.rounds.length, seed: run.seed, firstAttempt: mistakes === 0, independent: mistakes === 0 && hints === 0, hints, difficulty: world.bandId });
    onGameEvent?.('dino', 'level_completed', { level: worldIndex, round: run.rounds.length, seed: run.seed, firstAttempt: mistakes === 0, independent: mistakes === 0 && hints === 0, hints, difficulty: world.bandId });
    setPhase('complete'); setFeedback(DINO_DETECTIVE_NARRATION.complete);
    speak(DINO_DETECTIVE_NARRATION.complete, { premium: false, segments: [DINO_DETECTIVE_NARRATION.complete] });
  };

  const back = () => {
    cancelNarration();
    if (run && phase === 'active') onGameEvent?.('dino', 'leave', { level: worldIndex, round: roundIndex + 1, seed: run.seed, hints, difficulty: world.bandId });
    onBack?.();
  };

  const closeOptions = () => setOptionsOpen(false);
  const showMap = () => { cancelNarration(); closeOptions(); setPhase('map'); };
  const showCollection = () => { cancelNarration(); closeOptions(); setPhase('collection'); };
  const startSelected = index => { closeOptions(); startWorld(index); };
  const sayInstruction = () => speak(DINO_DETECTIVE_NARRATION.instruction, { premium: false, segments: [DINO_DETECTIVE_NARRATION.instruction] });
  const showWrittenClue = () => { setFeedback(world.hint); speak(world.hint, { premium: false, segments: [world.hint] }); };
  const readFoundFacts = () => { const narration = dinoFoundNarration(world); speak(narration.text, { premium: false, segments: narration.segments }); };
  const newestWorld = DINO_DETECTIVE_WORLDS[progress.unlockedWorldIndex];
  const firstAction = phase === 'complete' && DINO_DETECTIVE_WORLDS[worldIndex + 1]?.index <= progress.unlockedWorldIndex
    ? DINO_DETECTIVE_WORLDS[worldIndex + 1] : newestWorld;
  const options = [
    ...(phase === 'active' ? [
      ...(!found && soundOn ? [{ label: 'Hear instructions', action: () => { closeOptions(); sayInstruction(); } }] : []),
      ...(!found ? [{ label: 'Read a clue', action: () => { closeOptions(); showWrittenClue(); } }] : []),
      { label: 'Back to worlds', disabled: found && Boolean(saveError), action: showMap },
    ] : DINO_DETECTIVE_WORLDS.map(entry => ({
      label: entry.name, description: entry.targetName, disabled: entry.index > progress.unlockedWorldIndex,
      button: isCompleted(progress, entry) ? 'Replay world' : 'Explore world', action: () => startSelected(entry.index),
    }))),
    { label: 'World sticker book', disabled: found && phase === 'active' && Boolean(saveError), action: showCollection },
    { label: soundOn ? 'Turn sound off' : 'Turn sound on', action: () => { if (soundOn) cancelNarration(); onToggleSound?.(); closeOptions(); } },
    { label: 'Back to Explore & Languages', action: back },
  ];

  if (optionsOpen || phase !== 'active') return <div className="focus-game dino-focus" data-board-focus="">
    <main className={`focus-game-body${phase === 'collection' && !optionsOpen ? '' : ' is-menu'}`}>
      <header className="focus-game-heading"><h1>{optionsOpen ? 'Dino Detective' : phase === 'collection' ? 'World sticker book' : phase === 'complete' ? `${world.name} complete!` : 'Dino Detective'}</h1></header>
      {optionsOpen ? <FocusMenu choices={options} onBack={closeOptions} /> : phase === 'collection' ? <>
        <p className="focus-game-message">{progress.earnedWorldStickerIds.length} of {DINO_DETECTIVE_WORLDS.length} world stickers</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{DINO_DETECTIVE_WORLDS.map(entry => {
          const earned = progress.earnedWorldStickerIds.includes(entry.stickerId);
          return <div key={entry.stickerId} className="rounded-xl bg-white p-3 text-center">
            <div className="flex h-[60px] items-center justify-center">{earned ? <DinoSticker species={entry.targetSpecies} size={56} /> : <span aria-hidden="true">🔒</span>}</div>
            <p className="font-bold">{entry.stickerName}</p><p className="text-sm">{earned ? 'Earned' : 'Locked'}</p>
          </div>;
        })}</div>
        <button type="button" className="focus-game-button mt-3" onClick={showMap}>Back to worlds</button>
      </> : <>
        <div className="dino-focus-hero"><DinoSticker species={phase === 'complete' ? world.targetSpecies : firstAction.targetSpecies} size={160} /></div>
        <p className="focus-game-message">{phase === 'complete' ? result?.newlyEarnedSticker ? `Sticker earned: ${world.stickerName}.` : 'Your best result is saved.' : `Find ${firstAction.targetName} five times to earn a sticker.`}</p>
        {!progressState.ok && <p className="focus-game-message" role="alert">Saved progress could not be read. You can practise the first world.</p>}
        {pendingRewardReceipt && <p className="focus-game-message" role="alert">A saved world reward needs confirmation.</p>}
        <div className="focus-game-actions">
          {pendingRewardReceipt
            ? <button type="button" className="focus-game-button is-primary" onClick={() => claimRewardReceipt(pendingRewardReceipt, true)}>Retry reward</button>
            : <button type="button" className="focus-game-button is-primary" onClick={() => startSelected(firstAction.index)}>{isCompleted(progress, firstAction) ? 'Replay' : phase === 'complete' ? 'Next' : 'Explore'}: {firstAction.name}</button>}
          <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
          <button type="button" className="focus-game-button" onClick={phase === 'complete' ? showMap : back}>{phase === 'complete' ? 'Back to worlds' : 'Back'}</button>
        </div>
      </>}
    </main>
  </div>;

  return <div className="focus-game dino-focus" data-board-focus="" data-dino-world={world.id}>
    <main className="focus-game-body">
      <header className="focus-game-heading">
        <p>Dino Detective · {world.name} · Find {roundIndex + 1} of 5</p>
        <h1>{found ? `You found ${world.targetName}!` : `Find ${world.targetName}`}</h1>
      </header>
      <section className={`relative ${found ? 'flex min-h-0 flex-1 flex-col justify-center overflow-y-auto rounded-[2rem] border-4 border-white/80 bg-emerald-950 p-3 text-white shadow-2xl sm:p-5' : `flex-1 overflow-hidden rounded-xl border-2 border-white/80 bg-gradient-to-br ${ambientStyles[world.ambientId]} p-1.5 text-white sm:p-3`}`}>
        {!found && <>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50"><div className="absolute left-[8%] top-[17%] h-16 w-16 rounded-full bg-lime-200/35 blur-xl"/><div className="absolute right-[10%] top-[32%] h-24 w-24 rounded-full bg-cyan-200/25 blur-2xl"/><div className="absolute bottom-[8%] left-[42%] h-20 w-32 rounded-full bg-amber-100/20 blur-2xl"/></div>
        {cluePlan?.baselineText && <p className="relative z-10 font-black text-white" aria-label="Spatial clue">{cluePlan.baselineText}</p>}
        <div className={`dino-focus-search relative z-10 mt-2 overflow-hidden rounded-xl ${world.bandIndex === 2 ? 'bg-black/30' : 'bg-black/15'}`} role="group" aria-label={`${world.name} search area`} data-dino-search="">
          <img src={dinoPark} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-35" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/25 via-transparent to-slate-950/50" />
          <SceneAmbience id={world.ambientId} />
          {targetSpot && cluePlan?.trail !== 'none' && <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d={cluePlan.trail === 'full'
              ? `M 50 96 Q ${trailControl.x} ${trailControl.y} ${targetSpot.x} ${targetSpot.y}`
              : `M 50 96 Q ${partialTrailControl.x} ${partialTrailControl.y} ${partialTrailEnd.x} ${partialTrailEnd.y}`}
              fill="none" stroke="currentColor" strokeWidth={world.bandIndex === 0 ? 1.8 : world.bandIndex === 1 ? 1.2 : 0.8}
              strokeDasharray={world.bandIndex === 0 ? '0' : world.bandIndex === 1 ? '3 2' : '1 3'}
              opacity={world.bandIndex === 0 ? 0.86 : world.bandIndex === 1 ? 0.66 : 0.48} />
            <circle cx="50" cy="96" r="2.8" fill="white" stroke="currentColor" strokeWidth="0.8" />
            {visiblePaws.map((point, index) => <g key={`trail-${index}`} transform={`translate(${point.x} ${point.y}) rotate(${targetSpot.x > 50 ? 18 : -18})`} opacity={world.bandIndex === 2 ? 0.72 : 0.9}><ellipse cx="0" cy="0.5" rx="1.3" ry="1.8" fill="white"/><circle cx="-1.3" cy="-1.6" r="0.55" fill="white"/><circle cx="0" cy="-2" r="0.55" fill="white"/><circle cx="1.3" cy="-1.6" r="0.55" fill="white"/></g>)}
          </svg>}
          {DINO_SEARCH_SPOTS.map((spot, index) => {
            const isTarget = spot.id === round.targetSpotId;
            const shown = (found && isTarget) || (cluePlan?.revealTarget && isTarget);
            const clueSpot = cluePlan?.revealTarget && isTarget;
            return <button key={spot.id} type="button" disabled={found} onClick={() => chooseSpot(spot.id)} aria-label={`${shown ? world.targetName : `Search behind ${spot.label}`}, spot ${index + 1} of 5${wrongSpot === spot.id ? ', not here' : ''}${clueSpot ? ', clue points here' : ''}`} className={`absolute z-10 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border-2 text-2xl shadow-xl transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-200 sm:h-16 sm:w-16 ${shown ? 'border-amber-100 bg-white' : wrongSpot === spot.id ? 'animate-shake border-rose-200 bg-rose-800' : clueSpot ? 'border-yellow-200 bg-yellow-300 text-emerald-950 ring-4 ring-yellow-100/70' : 'border-white/70 bg-emerald-950/80 hover:bg-emerald-800'} ${world.bandIndex === 1 && !shown ? 'rotate-6' : ''} ${world.bandIndex === 2 && !shown ? 'opacity-85' : ''}`} style={{ left: `${spot.x}%`, top: `${spot.y}%` }}>
              {shown ? <DinoIcon species={world.targetSpecies} size={46} /> : <><HidingCover bandIndex={world.bandIndex} /><span aria-hidden="true" className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full border border-emerald-950 bg-amber-300 text-[11px] font-black text-emerald-950">{index + 1}</span></>}
            </button>;
          })}
          {cluePlan?.revealTarget && targetSpot && <div aria-hidden="true" className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-yellow-200/80" style={{ left: `${targetSpot.x}%`, top: `${targetSpot.y}%`, width: 78, height: 78 }} />}
        </div>
        <p aria-live="polite" role="status" className="relative z-10 mt-2 font-bold">{feedback}</p>
        {saveError && <p role="status" className="relative z-20 mt-2 rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2 text-sm font-black text-amber-950">{saveError}</p>}
        </>}
        {found && <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-2 rounded-2xl border-2 border-emerald-100 bg-emerald-950/95 p-3 shadow-xl sm:gap-3 sm:p-4" role="status" aria-live="polite">
          <div className="flex items-center justify-center gap-3"><DinoIcon species={world.targetSpecies} size={76} /><h3 className="text-xl font-black sm:text-2xl">{world.targetName}</h3></div>
          <p className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold sm:text-base">{world.targetFact}</p>
          <p className="rounded-xl border-t border-white/20 bg-white/10 px-3 py-2 text-sm font-bold sm:text-base">World fact: {world.sceneFact}</p>
          {saveError && <p className="rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2 text-sm font-black text-amber-950">{saveError}</p>}
        </div>}
      </section>
      <div className="focus-game-actions mt-3">
        {found
          ? <>
            <button type="button" onClick={next} disabled={savingProgress} className="focus-game-button is-primary">{savingProgress ? 'Saving world…' : pendingRewardReceipt ? 'Retry reward' : saveError ? 'Retry saving world' : roundIndex < 4 ? 'Next find' : 'Finish world'}</button>
            {soundOn && <button type="button" className="focus-game-button" onClick={readFoundFacts}>Hear the facts</button>}
          </>
          : <button type="button" className="focus-game-button is-primary" disabled={!cluePlan || cluePlan.step >= cluePlan.maxStep} onClick={showClue}>{cluePlan?.buttonLabel || 'Show a clue'}</button>}
        <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
      </div>
    </main>
  </div>;
};

export default DinoDetective;
