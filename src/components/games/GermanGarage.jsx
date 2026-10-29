import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { GERMAN_MATCH_MODES } from '../../data/index.js';
import { getGermanAudioPath } from '../../data/germanAudio.js';
import { buildSeededGermanRound, germanHistoryMode, germanTranslation, readGermanTargetHistory, rememberGermanTarget, saveGermanTargetHistory } from '../../data/germanLearning.js';
import { rewardClaimToken } from '../../data/playerRewards.js';
import { SoundToggle } from '../shared/index.jsx';
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
  { id: 'colour-painter', title: 'Colour Painter', subtitle: 'Paint the car and find its garage', modes: ['paint', 'park'], goal: 5, image: emptyGarage },
  { id: 'vehicle-workshop', title: 'Vehicle Workshop', subtitle: 'Name vehicles and their parts', modes: ['vehicles', 'parts'], goal: 6, image: vehiclesScene },
  { id: 'direction-driver', title: 'Direction Driver', subtitle: 'Hear commands, then drive a two-step route', modes: ['directions'], goal: 7, image: garageScene },
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

  if (chapterIndex === null && practiceMode === null) {
    const available = progress.ok && progressPlayerId === playerId;
    return <div className="german-garage-page min-h-screen bg-[#fff5dc] px-3 pb-6 pt-3 text-slate-900 sm:px-6">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-3"><button onClick={() => { stopAudio(); onBack?.(); }} className="min-h-12 min-w-12 rounded-full bg-amber-400 p-3 text-white" aria-label="Back to learning world"><ArrowLeft /></button><h1 className="text-xl font-black sm:text-3xl">German Garage</h1><SoundToggle soundOn={soundOn} onToggle={onToggleSound} /></header>
      <main className="mx-auto mt-5 max-w-5xl">
        <p className="mb-3 text-center text-sm font-bold text-slate-700">Three garage chapters · 11 extra word themes stay open for practice.</p>
        {claimError && progress.ok && pendingGermanChapterRewards(progress.storedProgress).length > 0 && <div className="mb-3 rounded-2xl border-2 border-amber-300 bg-white p-3 text-center" role="alert"><p className="font-bold">A saved chapter reward still needs confirmation.</p><button className="mt-2 min-h-12 rounded-xl bg-amber-700 px-4 font-bold text-white" onClick={retryPendingClaims}>Retry reward confirmation</button></div>}
        {!available && <div className="mb-3 rounded-2xl border-2 border-amber-300 bg-white p-3 text-center" role="alert"><p>{progress.error || 'Saved progress is unavailable. You can practise, but chapter progress cannot be confirmed.'}</p><button className="mt-2 min-h-12 rounded-xl bg-amber-600 px-4 font-bold text-white" onClick={refreshProgress}>Retry progress</button></div>}
        <div className="grid gap-3 md:grid-cols-3">{CHAPTERS.map((chapter, index) => {
          const unlocked = available && index <= (progress.progress?.unlockedChapterIndex ?? -1);
          const completed = chapterIds.has(chapter.id);
          return <article key={chapter.id} className="overflow-hidden rounded-3xl border-2 border-amber-100 bg-white shadow-lg">
            <img className="h-28 w-full object-cover" src={chapter.image} alt="" />
            <div className="p-3"><p className="text-xs font-black uppercase text-blue-600">Chapter {index + 1} {completed ? '· Complete' : ''}</p><h2 className="text-lg font-black">{chapter.title}</h2><p className="min-h-10 text-sm text-slate-700">{chapter.subtitle}</p>
              <button disabled={!unlocked} onClick={() => startVocabulary(index)} className="mt-2 min-h-12 w-full rounded-xl bg-blue-700 px-3 font-black text-white disabled:bg-slate-300 disabled:text-slate-600">{completed ? 'Replay · no reward' : unlocked ? 'Start chapter' : 'Finish earlier chapter'}</button></div>
          </article>;
        })}</div>
        <section className="mt-4 rounded-3xl border-2 border-amber-100 bg-white p-3 shadow-lg"><div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-lg font-black">More practice · no chapter rewards</h2><p className="text-sm text-slate-700">All 11 vocabulary modes, any time.</p></div></div><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{PRACTICE_MODES.map((item) => <button key={item.id} className="min-h-12 rounded-xl border-2 border-amber-200 px-2 text-sm font-bold" onClick={() => startVocabulary(null, item.id)}>{item.label}</button>)}</div></section>
      </main>
    </div>;
  }

  const directionLesson = chapterIndex === 2 && !isPractice && !directionReady;
  const currentRoute = chapterIndex === 2 && !isPractice && directionReady ? driveRoutes[roundIndex] : null;
  const heldRoute = held?.kind === 'route' ? driveRoutes.find(({ id }) => id === held.route) : null;
  const target = activeRound?.target;
  return <div className="german-garage-page min-h-screen bg-[#fff5dc] text-slate-900" data-german-chapter={activeChapter?.id || 'practice'} data-german-route={currentRoute?.id || ''} data-german-step={driveState?.step ?? ''} data-run-seed={seed}>
    <header className="mx-auto flex max-w-5xl items-center gap-2 px-3 pt-3"><button onClick={goMenu} className="min-h-12 min-w-12 rounded-full bg-amber-400 p-3 text-white" aria-label="Choose chapter"><ArrowLeft /></button><div className="min-w-0 flex-1"><p className="text-xs font-bold text-blue-700">{isPractice ? 'Practice · no rewards' : `${activeChapter.title} · ${roundIndex + 1} of ${activeChapter.goal}`}</p><h1 className="truncate text-lg font-black sm:text-2xl">{isPractice ? PRACTICE_MODES.find(({ id }) => id === practiceMode)?.label : activeChapter.subtitle}</h1></div><SoundToggle soundOn={soundOn} onToggle={onToggleSound} /></header>
    <main className="mx-auto flex max-w-5xl flex-col gap-3 px-3 pb-5 pt-3">
      {directionLesson ? <section className="rounded-3xl border-2 border-white bg-white/95 p-3 text-center shadow-lg"><p className="text-xs font-black uppercase tracking-widest text-blue-600">Learn six driving words</p><p className="text-sm font-bold">Forward is up · Zurück is down · Langsam slows a move · Halt stops the car.</p><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{GERMAN_DRIVE_COMMANDS.map((command) => <button key={command.id} onClick={() => playTerms([command.id])} className="min-h-12 rounded-xl border-2 border-amber-200 bg-amber-50 px-2 font-black"><span className="block">{command.id} · {command.english}</span><span className="text-xs font-semibold">Tap to hear</span></button>)}</div>{soundError && <p className="mt-1 text-sm font-bold text-amber-800">Sound is unavailable. Read each German word and meaning above.</p>}<button onClick={beginDirectionDrive} className="mt-3 min-h-12 w-full rounded-xl bg-blue-700 px-5 font-black text-white">Start the driving routes</button></section> : currentRoute ? <>
        <section className="rounded-2xl border-2 border-white bg-white/95 p-2 text-center shadow-lg"><p className="text-xs font-black uppercase tracking-widest text-blue-600">Route {roundIndex + 1} of 7 · hear two commands</p><p className="text-xs font-bold">Forward ↑ · Back ↓ · Slow changes speed · Stop at the star</p><div className="mt-1 grid grid-cols-3 gap-1"><button aria-label="Replay both German commands" onClick={() => playTerms(currentRoute.commands)} className="min-h-11 rounded-lg bg-blue-700 px-1 text-xs font-black text-white"><Volume2 className="mr-1 inline" size={15} /> Replay</button><button aria-label="Pause German audio" onClick={stopAudio} className="min-h-11 rounded-lg border-2 border-slate-300 px-1 text-xs font-bold">Pause</button><button aria-expanded={routeWordsShown} onClick={() => { if (!routeWordsShown) onGameEvent?.('german', 'route_assistance', { chapter: 'direction-driver', route: currentRoute.id, step: driveState?.step || 0, helpType: 'german-word-list' }); setRouteWordsShown((shown) => !shown); }} className="min-h-11 rounded-lg border-2 border-amber-300 bg-amber-50 px-1 text-xs font-bold">{routeWordsShown ? 'Hide words' : 'Show words'}</button></div>{routeWordsShown && <p className="mt-1 text-sm font-black text-blue-800">{currentRoute.commands.join(' → ')}</p>}{soundError && <p className="mt-1 text-xs font-bold text-amber-800">Sound is unavailable. Use the lesson or word help.</p>}</section>
        <div className="flex w-full items-start justify-center gap-2 sm:gap-3">
        <div className="relative grid aspect-square w-[220px] shrink-0 grid-cols-4 gap-1 rounded-3xl border-4 border-amber-300 bg-emerald-100 p-2 sm:w-[300px]" role="grid" aria-label="Four by four garage driving grid">
          {Array.from({ length: GERMAN_DRIVE_GRID_SIZE * GERMAN_DRIVE_GRID_SIZE }, (_, i) => {
            const x = i % GERMAN_DRIVE_GRID_SIZE; const y = Math.floor(i / GERMAN_DRIVE_GRID_SIZE);
            const isCar = driveState?.position[0] === x && driveState?.position[1] === y;
            const isGoal = currentRoute.goal[0] === x && currentRoute.goal[1] === y;
            return <div key={`${x}-${y}`} role="gridcell" aria-label={`Column ${x + 1}, row ${y + 1}${isCar ? ', car' : ''}${isGoal ? ', star destination' : ''}`} className={`grid aspect-square place-items-center rounded-xl border-2 text-3xl ${isGoal ? 'border-yellow-500 bg-yellow-100' : 'border-white bg-white/70'}`}>{isGoal ? '⭐' : ''}</div>;
          })}
          {driveState && <span aria-hidden="true" className="pointer-events-none absolute z-10 grid aspect-square w-[calc((100%-1.5rem)/4)] place-items-center rounded-full bg-blue-700 text-3xl text-white shadow transition-[left,top] ease-linear" style={{ left: `calc(0.5rem + (100% - 1rem) * ${(driveState.position[0] + 0.5) / 4})`, top: `calc(0.5rem + (100% - 1rem) * ${(driveState.position[1] + 0.5) / 4})`, transform: 'translate(-50%, -50%)', transitionDuration: `${driveState.moveDurationMs}ms` }}>↑</span>}
        </div>
        <div className="grid w-[calc(100%-228px)] max-w-[140px] grid-cols-2 gap-1.5 sm:w-[300px] sm:max-w-none sm:grid-cols-3 sm:gap-2">{GERMAN_DRIVE_COMMANDS.map((command) => {
          const label = command.id === 'Geradeaus' ? 'Move forward' : command.id === 'Zurück' ? 'Move back' : command.kind === 'move' ? `Move ${command.english}` : command.id === 'Langsam' ? 'Slow' : 'Stop';
          return <button key={command.id} disabled={Boolean(held) || Boolean(driveState?.solved)} aria-label={label} onClick={() => moveDrive(command.id)} className="min-h-11 rounded-xl border-2 border-white bg-blue-700 px-0.5 text-xs font-black text-white shadow sm:min-h-12 sm:px-1 sm:text-sm">{command.icon}<span className="block text-[10px] font-semibold leading-tight sm:text-xs">{label}</span></button>;
        })}</div>
        </div>
      </> : <>
        <section className="rounded-3xl border-2 border-white bg-white/95 p-3 text-center shadow-lg"><p className="text-xs font-black uppercase tracking-widest text-blue-600">{activeMode === 'paint' ? 'Paint the car' : activeMode === 'park' ? 'Choose the garage' : `${activeMode} word`}</p><div className="flex items-center justify-center gap-2"><p className="text-xl font-black">Listen to the German word</p><button onClick={() => playTerms([target?.name])} className="min-h-12 min-w-12 rounded-full bg-blue-700 p-3 text-white" aria-label="Replay German word"><Volume2 /></button></div><p className="text-2xl font-black text-blue-800" aria-label="German word clue">{target?.name}</p>{soundError && <p className="text-sm font-bold text-amber-800">Sound could not play. Read the German word and use the picture clues.</p>}{!historyStatus.ok && <p className="text-xs font-bold text-amber-800">Recent-word rotation is not saved. You can continue; words may repeat.</p>}</section>
        <section className="relative h-36 overflow-hidden rounded-3xl border-4 border-white shadow-lg sm:h-48">{activeMode === 'paint' ? <><img src={emptyGarage} alt="An empty garage ready for the car" className="h-full w-full object-cover" /><div className="absolute inset-0 flex items-center justify-center pt-2"><div className="relative h-[92%] w-[62%] max-w-[620px]"><img src={friendlyCar} alt={painted ? `Car painted ${painted.name}` : 'Car ready to paint'} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_18px_18px_rgba(15,23,42,.32)]" />{painted && <div className="absolute inset-0 transition-all duration-300" style={{ backgroundColor: painted.hex, WebkitMaskImage: `url(${friendlyCar})`, maskImage: `url(${friendlyCar})`, WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center', WebkitMaskSize: 'contain', maskSize: 'contain', mixBlendMode: 'multiply', opacity: 0.72 }} />}</div>{painted && <span className="absolute right-2 top-2 rounded-full border-2 border-white bg-slate-900/75 px-3 py-1 text-sm font-black text-white">Painted {painted.name}</span>}</div></> : <img src={MODE_SCENES[activeMode] || garageScene} alt={`${activeMode} German learning scene`} className="h-full w-full object-cover" />}</section>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{activeRound?.options.map((option) => <button key={option.name} disabled={Boolean(held)} onClick={() => chooseVocabulary(option)} className="flex min-h-16 items-center justify-center gap-2 rounded-2xl border-4 border-white bg-white px-2 py-2 text-center font-black shadow"><span className="text-3xl" aria-hidden="true">{option.emoji || '🎨'}</span><span>{germanTranslation(activeMode, option.name)}</span>{activeMode === 'paint' && <i className="h-7 w-7 rounded-full border" style={{ backgroundColor: option.hex }} />}</button>)}</div>
      </>}
      {!held && <div className="min-h-8 text-center text-sm font-black text-slate-800" aria-live="polite">{feedback}</div>}
      {saveError && <div className="rounded-xl border-2 border-rose-300 bg-white p-3 text-center" role="alert"><p className="font-bold">{saveError}</p>{held?.kind === 'word' && <p className="mt-1">Your answer: {held.target} · {germanTranslation(held.mode, held.target)}.</p>}{held?.kind === 'route' && heldRoute && <p className="mt-1">Route reached: {heldRoute.commands.map((id) => `${id} · ${commandFor(id).english}`).join(' → ')}.</p>}<button disabled={saving} className="mt-2 min-h-12 rounded-xl bg-rose-700 px-5 font-black text-white" onClick={submitCompletion}>Retry save</button></div>}
      {held && !saveError && !saving && <section className="rounded-2xl border-2 border-emerald-200 bg-white p-3 text-center shadow" role="status" tabIndex={-1} ref={(node) => { if (node) node.focus({ preventScroll: true }); }}><p className="font-bold">{held.kind === 'word' ? `${held.target} means ${germanTranslation(held.mode, held.target)}.` : held.kind === 'route-step' ? `${held.command} means ${held.english}.` : heldRoute ? `You reached the destination and stopped the car. ${heldRoute.commands.map((id) => `${id} means ${commandFor(id).english}`).join(' · ')}.` : 'You reached the destination and stopped the car.'}</p>{held.final && !isPractice && <p className="mt-1 text-sm">Chapter progress is saved. Finish returns to the garage; mid-round answers are not saved.</p>}<button disabled={saving} onClick={advanceHeld} className="mt-2 min-h-12 rounded-xl bg-emerald-700 px-6 font-black text-white">{held.final ? 'Finish chapter' : held.kind === 'route-step' ? 'Next command' : held.kind === 'route' ? 'Next route' : 'Next word'}</button></section>}
    </main>
  </div>;
}
