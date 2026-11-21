import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { GERMAN_MATCH_MODES } from '../../data/index.js';
import { getGermanAudioPath } from '../../data/germanAudio.js';
import { buildSeededGermanRound, germanHistoryMode, germanTranslation, readGermanTargetHistory, rememberGermanTarget, saveGermanTargetHistory } from '../../data/germanLearning.js';
import { rewardClaimToken } from '../../data/playerRewards.js';
import { FocusMenu } from '../shared/FocusMenu.jsx';
import { commitGermanChapter, drainPendingGermanChapterRewards, markGermanChapterRewardClaimed, pendingGermanChapterRewards, readGermanChapterProgress } from '../../data/germanChapterProgress.js';
import { applyGermanDriveCommand, buildGermanDriveRouteOrder, createGermanDriveState, GERMAN_DRIVE_COMMANDS, GERMAN_DRIVE_GRID_SIZE } from '../../data/germanRouteFlow.js';
import emptyGarage from '../../assets/german-garage/empty-garage.png';
import friendlyCar from '../../assets/german-garage/friendly-car.png';
import garageScene from '../../assets/german-garage/scenes/garage.webp';
import numbersScene from '../../assets/german-garage/scenes/numbers.webp';
import animalsScene from '../../assets/german-garage/scenes/animals.webp';
import shapesScene from '../../assets/german-garage/scenes/shapes.webp';
import foodsScene from '../../assets/german-garage/scenes/foods.webp';
import vehiclesScene from '../../assets/german-garage/scenes/vehicles.webp';
import bodyScene from '../../assets/german-garage/scenes/body.webp';
import greetingsScene from '../../assets/german-garage/scenes/greetings.webp';

const CHAPTERS = [
  { id: 'colour-painter', title: 'Colour Painter', subtitle: 'Paint the car and find its garage', modes: ['paint', 'park'], goal: 5 },
  { id: 'vehicle-workshop', title: 'Vehicle Workshop', subtitle: 'Name vehicles and their parts', modes: ['vehicles', 'parts'], goal: 6 },
  { id: 'direction-driver', title: 'Direction Driver', subtitle: 'Hear commands, then drive a two-step route', modes: ['directions'], goal: 7 },
];
const PRACTICE_MODES = [
  { id: 'paint', label: 'Farben · paint' }, { id: 'park', label: 'Garage · park' },
  ...GERMAN_MATCH_MODES.map(({ id, label }) => ({ id, label: `${label} · practice` })),
  { id: 'parts', label: 'Autoteile · parts' }, { id: 'directions', label: 'Richtungen · directions' },
];
const commandFor = (id) => GERMAN_DRIVE_COMMANDS.find((command) => command.id === id);
const MODE_SCENES = { park: garageScene, numbers: numbersScene, animals: animalsScene, shapes: shapesScene, foods: foodsScene, vehicles: vehiclesScene, parts: vehiclesScene, directions: garageScene, body: bodyScene, greetings: greetingsScene };
const attemptId = (playerId, chapterIndex, seed) => `${playerId || 'amari'}_${chapterIndex}_${seed.toString(36)}`;

function makeSeed() {
  try { return globalThis.crypto?.getRandomValues(new Uint32Array(1))[0] ?? Math.floor(Math.random() * 0x100000000); }
  catch { return Math.floor(Math.random() * 0x100000000); }
}

export default function GermanGarage({ onBack, playSfx, soundOn, onToggleSound, onCelebrate, onGameEvent, onPhaseChange, playerId = 'amari', cancelNarration }) {
  const [seed, setSeed] = useState(makeSeed);
  const [progress, setProgress] = useState(() => readGermanChapterProgress(playerId));
  const [progressPlayerId, setProgressPlayerId] = useState(playerId);
  const [historyStatus, setHistoryStatus] = useState(() => readGermanTargetHistory(playerId));
  const [chapterIndex, setChapterIndex] = useState(null);
  const [mode, setMode] = useState('paint');
  const [roundIndex, setRoundIndex] = useState(0);
  const [round, setRound] = useState(null);
  const [driveRoutes, setDriveRoutes] = useState([]);
  const [driveState, setDriveState] = useState(null);
  const [directionReady, setDirectionReady] = useState(false);
  const [routeWordsShown, setRouteWordsShown] = useState(false);
  const [practiceMode, setPracticeMode] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [held, setHeld] = useState(null);
  const [painted, setPainted] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [claimError, setClaimError] = useState(false);
  const [soundError, setSoundError] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const audioRef = useRef(null);
  const audioGenerationRef = useRef(0);
  const recentRef = useRef(historyStatus.history);
  const claimedAttemptRef = useRef(new Set());
  const attemptRef = useRef(null);
  const playerIdRef = useRef(playerId);
  const mistakeRef = useRef(false);
  const answeredRef = useRef(false);
  const activeChapter = chapterIndex === null ? null : CHAPTERS[chapterIndex];
  const isPractice = practiceMode !== null;
  const activeMode = isPractice ? practiceMode : mode;
  const activeRound = activeMode === 'directions' && !isPractice ? null : round;
  const chapterIds = useMemo(() => new Set(progress.progress?.completedChapterIds || []), [progress]);

  const stopAudio = useCallback(() => {
    audioGenerationRef.current += 1;
    const audio = audioRef.current;
    audioRef.current = null;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      try { audio.pause(); audio.currentTime = 0; } catch { /* detached media */ }
    }
    cancelNarration?.();
  }, [cancelNarration]);

  const playTerms = useCallback((terms) => {
    stopAudio();
    setSoundError(false);
    if (!soundOn || !Array.isArray(terms) || !terms.length) return;
    const generation = audioGenerationRef.current;
    let index = 0;
    const playNext = () => {
      if (audioGenerationRef.current !== generation || !soundOn || index >= terms.length) return;
      const path = getGermanAudioPath(terms[index]);
      index += 1;
      if (!path) { setSoundError(true); return; }
      const audio = new Audio(path);
      audioRef.current = audio;
      const isCurrentPlayback = () => audioGenerationRef.current === generation && audioRef.current === audio;
      audio.onended = () => {
        if (audioRef.current === audio) audioRef.current = null;
        playNext();
      };
      audio.onerror = () => {
        if (!isCurrentPlayback()) return;
        if (audioRef.current === audio) audioRef.current = null;
        setSoundError(true);
      };
      audio.play().catch(() => {
        if (!isCurrentPlayback()) return;
        audioRef.current = null;
        setSoundError(true);
      });
    };
    playNext();
  }, [soundOn, stopAudio]);

  useEffect(() => { if (!soundOn) stopAudio(); }, [soundOn, stopAudio]);
  useEffect(() => () => stopAudio(), [stopAudio]);
  useEffect(() => { onPhaseChange?.(chapterIndex === null && practiceMode === null ? 'intro' : held?.final && !saving && !saveError ? 'finish' : 'play'); }, [chapterIndex, held?.final, onPhaseChange, practiceMode, saveError, saving]);

  const refreshProgress = useCallback(() => {
    const next = readGermanChapterProgress(playerId);
    setProgress(next);
    setProgressPlayerId(playerId);
    return next;
  }, [playerId]);

  const claimReceipt = useCallback(async (receipt, quiet = true) => {
    if (!receipt || claimedAttemptRef.current.has(receipt.transactionId)) return true;
    const token = rewardClaimToken('german', receipt.transactionId);
    try {
      const result = await onCelebrate?.(quiet ? 'German chapter saved.' : 'Chapter complete!', 4, 0, 'german', { quiet, rewardToken: token });
      if (result?.persisted !== true) { setClaimError(true); return false; }
      const saved = markGermanChapterRewardClaimed(playerId, receipt.transactionId);
      if (!saved.ok) { setClaimError(true); return false; }
      claimedAttemptRef.current.add(receipt.transactionId);
      setClaimError(false);
      refreshProgress();
      return true;
    } catch { setClaimError(true); return false; }
  }, [onCelebrate, playerId, refreshProgress]);

  useEffect(() => {
    let live = true;
    const timer = setTimeout(async () => {
      if (!live) return;
      const current = readGermanChapterProgress(playerId);
      setProgress(current);
      setProgressPlayerId(playerId);
      if (current.ok) {
        const result = await drainPendingGermanChapterRewards(current.storedProgress, (receipt) => claimReceipt(receipt, true));
        if (live) setClaimError(!result.ok);
      }
    }, 0);
    return () => { live = false; clearTimeout(timer); };
  }, [playerId, claimReceipt]);

  const startVocabulary = (index, practice = null) => {
    if (index !== null && (progressPlayerId !== playerId || !progress.ok || index > progress.progress.unlockedChapterIndex)) return;
    stopAudio();
    const nextSeed = makeSeed();
    setSeed(nextSeed);
    setChapterIndex(index);
    setPracticeMode(practice);
    const chapter = index === null ? null : CHAPTERS[index];
    const initialMode = practice || chapter?.modes[0] || 'numbers';
    setMode(initialMode);
    setDirectionReady(false);
    setRouteWordsShown(false);
    setRoundIndex(0);
    setFeedback(''); setHeld(null); setPainted(null); setSaveError(''); setSaving(false);
    attemptRef.current = index === null ? null : attemptId(playerId, index, nextSeed);
    mistakeRef.current = false; answeredRef.current = false;
    if (index === 2 && !practice) {
      const routes = buildGermanDriveRouteOrder(nextSeed);
      setDriveRoutes(routes);
      setDriveState(null);
      onGameEvent?.('german', 'chapter_start', { chapter: 'direction-driver', seed: nextSeed, difficulty: 'challenge' });
      return;
    }
    const history = recentRef.current[germanHistoryMode(initialMode)] || [];
    const firstRound = buildSeededGermanRound(initialMode, history, 4, nextSeed, 0);
    setRound(firstRound);
    recentRef.current = rememberGermanTarget(recentRef.current, initialMode, firstRound.target.name);
    onGameEvent?.('german', practice ? 'practice_start' : 'chapter_start', { chapter: chapter?.id || 'practice', seed: nextSeed, difficulty: practice ? 'practice' : index === 0 ? 'starter' : 'growing' });
    playTerms([firstRound.target.name]);
  };

  useEffect(() => {
    if (playerId === playerIdRef.current) return;
    playerIdRef.current = playerId;
    const timer = setTimeout(() => {
      stopAudio(); setChapterIndex(null); setHeld(null); setRound(null); setDriveState(null); setSaving(false); setSaveError('');
      const history = readGermanTargetHistory(playerId);
      recentRef.current = history.history;
      setHistoryStatus(history);
      attemptRef.current = null; answeredRef.current = false; mistakeRef.current = false;
      refreshProgress();
    }, 0);
    return () => clearTimeout(timer);
  }, [playerId, refreshProgress, stopAudio]);

  const goMenu = () => {
    stopAudio(); setChapterIndex(null); setPracticeMode(null); setHeld(null); setRound(null); setDriveState(null); setSaveError(''); setSaving(false);
  };

  const retryPendingClaims = async () => {
    const current = refreshProgress();
    if (!current.ok) { setClaimError(true); return; }
    const result = await drainPendingGermanChapterRewards(current.storedProgress, (receipt) => claimReceipt(receipt, true));
    setClaimError(!result.ok);
  };

  const beginNextVocabularyRound = (nextMode) => {
    const nextIndex = roundIndex + 1;
    const chapter = CHAPTERS[chapterIndex];
    const selectedMode = nextMode || practiceMode || chapter.modes[nextIndex % chapter.modes.length];
    const cursor = nextIndex + (practiceMode ? 50 : 0);
    const history = recentRef.current[germanHistoryMode(selectedMode)] || [];
    const nextRound = buildSeededGermanRound(selectedMode, history, 4, seed, cursor);
    recentRef.current = rememberGermanTarget(recentRef.current, selectedMode, nextRound.target.name);
    saveGermanTargetHistory(playerId, recentRef.current);
    setHistoryStatus(readGermanTargetHistory(playerId));
    setRoundIndex(nextIndex); setMode(selectedMode); setRound(nextRound); setHeld(null); setFeedback(''); setPainted(null);
    answeredRef.current = false; mistakeRef.current = false;
    playTerms([nextRound.target.name]);
  };

  const beginDirectionDrive = () => {
    if (!driveRoutes.length) return;
    setDriveState(createGermanDriveState(driveRoutes[0]));
    setDirectionReady(true);
    setFeedback('Listen for two commands, then use the English movement buttons.');
    playTerms(driveRoutes[0].commands);
  };

  const submitCompletion = async () => {
    if (chapterIndex === null || practiceMode || saving || progressPlayerId !== playerId) return false;
    setSaving(true); setSaveError('');
    const committed = commitGermanChapter(playerId, chapterIndex, attemptRef.current);
    if (!committed.ok) {
      setSaving(false); setSaveError(committed.error || 'Progress could not be saved. Retry.'); return false;
    }
    setProgress(readGermanChapterProgress(playerId));
    if (committed.receipt && committed.rewardDelta > 0) {
      const claimed = await claimReceipt(committed.receipt, false);
      if (!claimed) {
        setSaving(false); setSaveError('Your chapter is saved. Retry to confirm its garage badge.'); return false;
      }
    }
    setSaving(false);
    setHeld((current) => current ? { ...current, saved: true } : current);
    setFeedback('');
    return true;
  };

  const chooseVocabulary = (option) => {
    if (!isPractice && progressPlayerId !== playerId) return;
    if (answeredRef.current || held || !activeRound) return;
    if (option.name !== activeRound.target.name) {
      mistakeRef.current = true;
      setFeedback('Noch einmal · Try again. Hear the German word and choose its matching picture.');
      playSfx?.('oops'); playTerms([activeRound.target.name]);
      onGameEvent?.('german', 'answer_attempt', { chapter: activeChapter?.id || 'practice', round: roundIndex, seed: activeRound.seed, firstAttempt: false, assisted: false });
      return;
    }
    answeredRef.current = true;
    const chapter = CHAPTERS[chapterIndex];
    const finalRound = !isPractice && roundIndex + 1 >= chapter.goal;
    const explanation = `Richtig! ${activeRound.target.name} means ${germanTranslation(activeMode, activeRound.target.name)}.`;
    setFeedback(finalRound ? 'Saving chapter progress…' : explanation); setHeld({ kind: 'word', final: finalRound, saved: !finalRound, mode: activeMode, target: activeRound.target.name });
    if (activeMode === 'paint') setPainted(option);
    saveGermanTargetHistory(playerId, rememberGermanTarget(recentRef.current, activeMode, activeRound.target.name));
    setHistoryStatus(readGermanTargetHistory(playerId));
    playSfx?.('success'); playTerms([activeRound.target.name]);
    onGameEvent?.('german', isPractice ? 'practice_correct' : 'answer_correct', { chapter: activeChapter?.id || 'practice', round: roundIndex, seed: activeRound.seed, firstAttempt: !mistakeRef.current, assisted: false, finalRound });
    if (finalRound) submitCompletion();
  };

  const moveDrive = (commandId) => {
    if (progressPlayerId !== playerId) return;
    if (!driveState || held) return;
    const route = driveRoutes[roundIndex];
    const result = applyGermanDriveCommand(route, driveState, commandId);
    const command = commandFor(commandId);
    if (!result.accepted) {
      const expected = result.expected || route.commands[driveState.step];
      const firstAttempt = !mistakeRef.current;
      mistakeRef.current = true;
      setFeedback(result.reason === 'wrong-command'
        ? `Nicht ganz · Not that one. The car stays here. Replay the current German command and try again.`
        : `That move would leave the garage grid. The car stays here.`);
      playSfx?.('oops'); playTerms([expected]);
      onGameEvent?.('german', 'route_attempt', { chapter: 'direction-driver', route: route.id, step: driveState.step, firstAttempt, assisted: routeWordsShown, reason: result.reason });
      return;
    }
    const firstAttempt = !mistakeRef.current;
    setDriveState(result.state);
    if (result.state.solved) {
      setHeld({ kind: 'route', final: roundIndex + 1 >= driveRoutes.length, saved: false, route: route.id });
      const finalRoute = roundIndex + 1 >= driveRoutes.length;
      setFeedback(finalRoute ? 'Saving chapter progress…' : `Route complete! ${route.commands.map((id) => `${id} means ${commandFor(id).english}`).join(' · ')}.`);
      if (finalRoute) submitCompletion();
    } else {
      setHeld({ kind: 'route-step', final: false, saved: true, route: route.id, command: commandId, english: command.english });
      setFeedback(`${commandId} means ${command.english}.${result.state.slowForNextMove ? ' The next move will be slow.' : ''}`);
    }
    playSfx?.('click'); playTerms([commandId]);
    onGameEvent?.('german', 'route_step', { chapter: 'direction-driver', route: route.id, step: driveState.step, commandIndex: GERMAN_DRIVE_COMMANDS.findIndex(({ id }) => id === commandId), slow: result.state.moveDurationMs > 260, solved: result.state.solved, firstAttempt, assisted: routeWordsShown });
  };

  const advanceHeld = () => {
    if (!isPractice && progressPlayerId !== playerId) return;
    if (!held || saving) return;
    stopAudio(); playSfx?.('click');
    if (held.final) { goMenu(); refreshProgress(); return; }
    if (held.kind === 'route-step') {
      const route = driveRoutes[roundIndex];
      mistakeRef.current = false;
      setFeedback('Listen for the next command and choose its movement.'); setHeld(null);
      playTerms([route.commands[driveState.step]]);
      return;
    }
    setFeedback(''); setHeld(null); mistakeRef.current = false; answeredRef.current = false;
    if (held.kind === 'route') {
      const nextIndex = roundIndex + 1;
      const route = driveRoutes[nextIndex];
      setRoundIndex(nextIndex); setDriveState(createGermanDriveState(route)); setRouteWordsShown(false); mistakeRef.current = false; setFeedback('Listen to two German commands, then choose each movement.'); playTerms(route.commands);
      return;
    }
    beginNextVocabularyRound();
  };

  const atGarage = chapterIndex === null && !isPractice;
  const available = progress.ok && progressPlayerId === playerId;
  const latestChapter = Math.min(progress.progress?.unlockedChapterIndex ?? 0, CHAPTERS.length - 1);
  const nextChapter = CHAPTERS[latestChapter];
  const pendingReward = claimError && progress.ok && pendingGermanChapterRewards(progress.storedProgress).length > 0;
  const closeOptions = () => setOptionsOpen(false);
  const leaveGarage = () => { stopAudio(); onBack?.(); };
  const chooseChapter = (index, practice) => { closeOptions(); startVocabulary(index, practice); };
  const handleSound = () => {
    if (soundOn) stopAudio();
    onToggleSound?.();
    closeOptions();
  };
  const toggleRouteWords = () => {
    if (!routeWordsShown) onGameEvent?.('german', 'route_assistance', { chapter: 'direction-driver', route: currentRoute.id, step: driveState?.step || 0, helpType: 'german-word-list' });
    setRouteWordsShown(shown => !shown);
    closeOptions();
  };
  const directionLesson = chapterIndex === 2 && !isPractice && !directionReady;
  const currentRoute = chapterIndex === 2 && !isPractice && directionReady ? driveRoutes[roundIndex] : null;
  const heldRoute = held?.kind === 'route' ? driveRoutes.find(({ id }) => id === held.route) : null;
  const target = activeRound?.target;
  const options = [
    ...(atGarage ? [
      ...CHAPTERS.map((chapter, index) => ({
        label: chapter.title, description: chapter.subtitle, disabled: !available || index > latestChapter,
        button: chapterIds.has(chapter.id) ? 'Replay chapter' : 'Start chapter', action: () => chooseChapter(index),
      })),
      ...PRACTICE_MODES.map(item => ({ label: item.label, action: () => chooseChapter(null, item.id) })),
    ] : [
      ...(currentRoute ? [
        { label: routeWordsShown ? 'Hide words' : 'Show words', action: toggleRouteWords },
        ...(soundOn ? [{ label: 'Pause German audio', action: () => { stopAudio(); closeOptions(); } }] : []),
      ] : []),
      { label: 'Back to the garage', action: () => { closeOptions(); goMenu(); } },
    ]),
    { label: soundOn ? 'Turn sound off' : 'Turn sound on', action: handleSound },
    { label: 'Back to Explore & Languages', action: leaveGarage },
  ];
  if (atGarage || optionsOpen) return <div className="focus-game german-focus" data-board-focus="">
    <main className="focus-game-body is-menu">
      <header className="focus-game-heading"><h1>German Garage</h1></header>
      {optionsOpen ? <FocusMenu choices={options} onBack={closeOptions} /> : <>
        <p className="focus-game-message">{!available ? progress.error || 'Saved progress is unavailable. Practice is available in Options.' : nextChapter.subtitle}</p>
        {pendingReward && available && <p className="focus-game-message" role="alert">Your saved chapter reward needs confirmation.</p>}
        <div className="focus-game-actions">
          {!available
            ? <button className="focus-game-button is-primary" onClick={refreshProgress}>Retry progress</button>
            : pendingReward
              ? <button className="focus-game-button is-primary" onClick={retryPendingClaims}>Retry reward confirmation</button>
              : <button className="focus-game-button is-primary" onClick={() => chooseChapter(latestChapter)}>{chapterIds.has(nextChapter.id) ? 'Replay' : 'Start'}: {nextChapter.title}</button>}
          <button className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
          <button className="focus-game-button" onClick={leaveGarage}>Back</button>
        </div>
      </>}
    </main>
  </div>;

  return <div className="focus-game german-focus" data-board-focus="" data-german-chapter={activeChapter?.id || 'practice'} data-german-route={currentRoute?.id || ''} data-german-step={driveState?.step ?? ''} data-run-seed={seed}>
    <main className="focus-game-body">
      <header className="focus-game-heading">
        <p>German Garage · {isPractice ? 'Practice' : `${activeChapter.title} · ${roundIndex + 1} of ${activeChapter.goal}`}</p>
        <h1>{directionLesson ? 'Learn the driving words' : currentRoute ? 'Drive to the star' : activeMode === 'paint' ? 'Paint the car' : activeMode === 'park' ? 'Choose the garage' : PRACTICE_MODES.find(({ id }) => id === activeMode)?.label.split(' · ')[0] || 'Choose the picture'}</h1>
      </header>
      <div className="german-focus-play">
      {directionLesson ? <section className="rounded-3xl border-2 border-white bg-white/95 p-3 text-center shadow-lg"><p className="text-sm font-bold">Forward is up · Zurück is down · Langsam slows a move · Halt stops the car.</p><div aria-label="German driving words" className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{GERMAN_DRIVE_COMMANDS.map((command) => <button key={command.id} onClick={() => playTerms([command.id])} className="min-h-12 rounded-xl border-2 border-amber-200 bg-amber-50 px-2 font-black"><span className="block">{command.id} · {command.english}</span><span className="text-xs font-semibold">Tap to hear</span></button>)}</div>{soundError && <p className="mt-1 text-sm font-bold text-amber-800">Sound is unavailable. Read each German word and meaning above.</p>}<button onClick={beginDirectionDrive} className="mt-3 min-h-12 w-full rounded-xl bg-blue-700 px-5 font-black text-white">Start the driving routes</button></section> : currentRoute ? <>
        <p className="focus-game-message">{routeWordsShown || !soundOn ? currentRoute.commands.join(' → ') : 'Listen, then choose a driving command.'}</p>
        {soundError && <p className="focus-game-message">Sound is unavailable. Use Show words in Options.</p>}
        <div className="german-focus-drive">
        <div className="relative grid aspect-square w-full grid-cols-4 gap-1 rounded-2xl border-2 border-amber-300 bg-emerald-100 p-2" role="grid" aria-label="Four by four garage driving grid">
          {Array.from({ length: GERMAN_DRIVE_GRID_SIZE * GERMAN_DRIVE_GRID_SIZE }, (_, i) => {
            const x = i % GERMAN_DRIVE_GRID_SIZE; const y = Math.floor(i / GERMAN_DRIVE_GRID_SIZE);
            const isCar = driveState?.position[0] === x && driveState?.position[1] === y;
            const isGoal = currentRoute.goal[0] === x && currentRoute.goal[1] === y;
            return <div key={`${x}-${y}`} role="gridcell" aria-label={`Column ${x + 1}, row ${y + 1}${isCar ? ', car' : ''}${isGoal ? ', star destination' : ''}`} className={`grid aspect-square place-items-center rounded-xl border-2 text-3xl ${isGoal ? 'border-yellow-500 bg-yellow-100' : 'border-white bg-white/70'}`}>{isGoal ? '⭐' : ''}</div>;
          })}
          {driveState && <span aria-hidden="true" className="pointer-events-none absolute z-10 grid aspect-square w-[calc((100%-1.5rem)/4)] place-items-center rounded-full bg-blue-700 text-3xl text-white shadow transition-[left,top] ease-linear" style={{ left: `calc(0.5rem + (100% - 1rem) * ${(driveState.position[0] + 0.5) / 4})`, top: `calc(0.5rem + (100% - 1rem) * ${(driveState.position[1] + 0.5) / 4})`, transform: 'translate(-50%, -50%)', transitionDuration: `${driveState.moveDurationMs}ms` }}>↑</span>}
        </div>
        <div aria-label="Driving controls" className="grid grid-cols-3 gap-2">{GERMAN_DRIVE_COMMANDS.map((command) => {
          const label = command.id === 'Geradeaus' ? 'Move forward' : command.id === 'Zurück' ? 'Move back' : command.kind === 'move' ? `Move ${command.english}` : command.id === 'Langsam' ? 'Slow' : 'Stop';
          return <button key={command.id} disabled={Boolean(held) || Boolean(driveState?.solved)} aria-label={label} onClick={() => moveDrive(command.id)} className="min-h-11 rounded-xl border-2 border-white bg-blue-700 px-0.5 text-xs font-black text-white shadow sm:min-h-12 sm:px-1 sm:text-sm">{command.icon}<span className="block text-[10px] font-semibold leading-tight sm:text-xs">{label}</span></button>;
        })}</div>
        </div>
      </> : <>
        <p className="german-focus-word" aria-label="German word clue">{target?.name}</p>
        {soundError && <p className="focus-game-message">Sound could not play. Read the word and use the pictures.</p>}
        {!historyStatus.ok && <p className="focus-game-message">Recent words could not be saved. Some may repeat.</p>}
        <section className="german-focus-scene">{activeMode === 'paint' ? <><img src={emptyGarage} alt="An empty garage ready for the car" className="h-full w-full object-cover" /><div className="absolute inset-0 flex items-center justify-center pt-2"><div className="relative h-[92%] w-[62%] max-w-[620px]"><img src={friendlyCar} alt={painted ? `Car painted ${painted.name}` : 'Car ready to paint'} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_18px_18px_rgba(15,23,42,.32)]" />{painted && <div className="absolute inset-0 transition-all duration-300" style={{ backgroundColor: painted.hex, WebkitMaskImage: `url(${friendlyCar})`, maskImage: `url(${friendlyCar})`, WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center', WebkitMaskSize: 'contain', maskSize: 'contain', mixBlendMode: 'multiply', opacity: 0.72 }} />}</div>{painted && <span className="absolute right-2 top-2 rounded-full border-2 border-white bg-slate-900/75 px-3 py-1 text-sm font-black text-white">Painted {painted.name}</span>}</div></> : <img src={MODE_SCENES[activeMode] || garageScene} alt={`${activeMode} German learning scene`} className="h-full w-full object-cover" />}</section>
        <div aria-label="Choose the matching picture" className="grid grid-cols-2 gap-2 sm:grid-cols-4">{activeRound?.options.map((option) => <button key={option.name} disabled={Boolean(held)} onClick={() => chooseVocabulary(option)} className="flex min-h-16 items-center justify-center gap-2 rounded-2xl border-4 border-white bg-white px-2 py-2 text-center font-black shadow"><span className="text-3xl" aria-hidden="true">{option.emoji || '🎨'}</span><span>{germanTranslation(activeMode, option.name)}</span>{activeMode === 'paint' && <i className="h-7 w-7 rounded-full border" style={{ backgroundColor: option.hex }} />}</button>)}</div>
      </>}
      {!held && <div className="min-h-8 text-center text-sm font-black text-slate-800" aria-live="polite">{feedback}</div>}
      {saveError && <div className="rounded-xl border-2 border-rose-300 bg-white p-3 text-center" role="alert"><p className="font-bold">{saveError}</p>{held?.kind === 'word' && <p className="mt-1">Your answer: {held.target} · {germanTranslation(held.mode, held.target)}.</p>}{held?.kind === 'route' && heldRoute && <p className="mt-1">Route reached: {heldRoute.commands.map((id) => `${id} · ${commandFor(id).english}`).join(' → ')}.</p>}<button disabled={saving} className="mt-2 min-h-12 rounded-xl bg-rose-700 px-5 font-black text-white" onClick={submitCompletion}>Retry save</button></div>}
      {held && !saveError && !saving && <section className="rounded-2xl border-2 border-emerald-200 bg-white p-3 text-center shadow" role="status" tabIndex={-1} ref={(node) => { if (node) node.focus({ preventScroll: true }); }}><p className="font-bold">{held.kind === 'word' ? `${held.target} means ${germanTranslation(held.mode, held.target)}.` : held.kind === 'route-step' ? `${held.command} means ${held.english}.` : heldRoute ? `You reached the destination and stopped the car. ${heldRoute.commands.map((id) => `${id} means ${commandFor(id).english}`).join(' · ')}.` : 'You reached the destination and stopped the car.'}</p>{held.final && !isPractice && <p className="mt-1 text-sm">Your chapter is saved.</p>}<button disabled={saving} onClick={advanceHeld} className="mt-2 min-h-12 rounded-xl bg-emerald-700 px-6 font-black text-white">{held.final ? 'Finish chapter' : held.kind === 'route-step' ? 'Next command' : held.kind === 'route' ? 'Next route' : 'Next word'}</button></section>}
      <div className="focus-game-actions">
        {soundOn && !held && !directionLesson && (currentRoute || target) && (
          <button type="button" className="focus-game-button" onClick={() => playTerms(currentRoute?.commands || [target.name])}>
            <Volume2 className="mr-1 inline" size={18} aria-hidden="true" /> {currentRoute ? 'Hear the commands' : 'Hear the word'}
          </button>
        )}
        <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
      </div>
      </div>
    </main>
  </div>;
}
