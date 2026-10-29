import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Eye, Home, Lightbulb, RotateCcw, Volume2 } from 'lucide-react';
import { SoundToggle } from '../shared/index.jsx';
import './PuzzlePlay.css';
import { puzzlePopNarration, speakPackagedBatch2Line } from '../../data/batch2Narration.js';
import { rewardClaimToken } from '../../data/playerRewards.js';
import {
  createPuzzlePopPieceTray,
  createPuzzlePopSceneQueue,
  getPuzzlePopProgress,
  getPuzzlePopProgressStrict,
  movePuzzlePopBoardFocus,
  PUZZLE_POP_CHAPTERS,
  puzzlePopTileImageStyle,
  savePuzzlePopQueueStrict,
  completePuzzlePopSceneStrict,
  getPuzzlePopPendingChapterReceiptsStrict,
  markPuzzlePopChapterReceiptClaimedStrict,
} from '../../data/puzzlePopBatch2.js';

const createSeed = () => Math.floor(Math.random() * 0xffffffff) || 1;

// eslint-disable-next-line react-refresh/only-export-components -- exported for focused navigation regression coverage.
export const nextPuzzleChapterIndex = (currentIndex, chapterCount) => Math.min(Math.max(0, currentIndex + 1), chapterCount - 1);

const PuzzlePlay = ({ onBack, playSfx = () => {}, soundOn, onToggleSound, speak = () => {}, onCelebrate = () => {}, onGameEvent, playerId, onPhaseChange }) => {
  const [progressState, setProgressState] = useState(() => {
    const loaded = getPuzzlePopProgressStrict(playerId);
    return loaded.ok
      ? { ready: true, progress: loaded.progress, error: null }
      : { ready: false, progress: getPuzzlePopProgress(playerId), error: 'read' };
  });
  const savedProgress = progressState.progress;
  const [chapterIndex, setChapterIndex] = useState(() => getPuzzlePopProgress(playerId).unlockedChapter);
  const [phase, setPhase] = useState('intro');
  const [queue, setQueue] = useState([]);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [seed, setSeed] = useState(0);
  const [tray, setTray] = useState([]);
  const [previousTrayOrder, setPreviousTrayOrder] = useState([]);
  const [placed, setPlaced] = useState([]);
  const [selected, setSelected] = useState(null);
  const [focusedSlot, setFocusedSlot] = useState(0);
  const [moves, setMoves] = useState(0);
  const [message, setMessage] = useState('Start a chapter to build a picture.');
  const [hintSlot, setHintSlot] = useState(null);
  const [wrongSlot, setWrongSlot] = useState(null);
  const [hadMistake, setHadMistake] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [pendingStart, setPendingStart] = useState(null);
  const [pendingSceneSave, setPendingSceneSave] = useState(false);
  const [pendingRewardReceipt, setPendingRewardReceipt] = useState(null);
  const [rewardClaimError, setRewardClaimError] = useState(false);
  const [rewardDrainBusy, setRewardDrainBusy] = useState(false);
  const wrongTimeoutRef = useRef(null);
  const rootRef = useRef(null);
  const boardSlotRefs = useRef([]);
  const trayPieceRefs = useRef({});
  const feedbackRef = useRef(null);
  const boardRef = useRef(null);
  const chapterPickerRef = useRef(null);
  const claimedReceiptsRef = useRef(new Set());
  const claimingReceiptsRef = useRef(new Set());
  const drainingReceiptsRef = useRef(false);

  const chapter = PUZZLE_POP_CHAPTERS[chapterIndex] || PUZZLE_POP_CHAPTERS[0];
  const scene = queue[sceneIndex] || null;
  const boardWidth = chapter.grid === 5
    ? 'min(100%, 380px, calc(100dvh - 420px))'
    : 'min(100%, 460px, calc(100dvh - 380px))';
  const solved = Boolean(scene && placed.length && placed.every(Boolean));
  const showMappingDemo = chapterIndex === 2 && moves === 0 && hintsUsed === 0;
  const completedInChapter = useMemo(() => chapter.scenes.filter(({ id }) => savedProgress.completedSceneIds.includes(id)).length, [chapter, savedProgress.completedSceneIds]);

  useEffect(() => () => { if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current); }, []);
  useEffect(() => {
    const settledFinish = phase === 'chapter-complete' && !pendingSceneSave && !pendingRewardReceipt && !rewardClaimError && !rewardDrainBusy;
    onPhaseChange?.(settledFinish ? 'finish' : phase === 'intro' ? 'intro' : 'play');
  }, [onPhaseChange, pendingRewardReceipt, pendingSceneSave, phase, rewardClaimError, rewardDrainBusy]);
  const scrollToIntroTop = () => {
    if (rootRef.current) rootRef.current.scrollTop = 0;
    window.scrollTo(0, 0);
  };

  useEffect(() => { if (phase === 'intro') scrollToIntroTop(); }, [phase]);

  const claimChapterReceipt = useCallback(async (receipt) => {
    if (!receipt) return true;
    const claimId = `${playerId || 'amari'}:${receipt.id}`;
    if (claimedReceiptsRef.current.has(claimId)) return true;
    if (claimingReceiptsRef.current.has(claimId)) return false;
    claimingReceiptsRef.current.add(claimId);
    setPendingRewardReceipt(receipt);
    try {
      const receiptChapter = PUZZLE_POP_CHAPTERS.find(({ id }) => receipt.id === `${id}:complete`);
      const parent = await onCelebrate?.(`${receiptChapter?.name || 'Puzzle'} badge earned!`, receipt.rewardDelta * 4, 0, 'puzzle', { quiet: true, rewardToken: rewardClaimToken('puzzle', receipt.id) });
      if (parent?.persisted !== true) {
        setPendingRewardReceipt(receipt);
        setRewardClaimError(true);
        return false;
      }
      const marked = markPuzzlePopChapterReceiptClaimedStrict(playerId, receipt.id);
      if (!marked.ok) {
        setPendingRewardReceipt(receipt);
        setRewardClaimError(true);
        return false;
      }
      claimedReceiptsRef.current.add(claimId);
      setPendingRewardReceipt(null);
      setRewardClaimError(false);
      return true;
    } catch {
      setPendingRewardReceipt(receipt);
      setRewardClaimError(true);
      return false;
    } finally {
      claimingReceiptsRef.current.delete(claimId);
    }
  }, [onCelebrate, playerId]);

  const drainPendingRewards = useCallback(async () => {
    if (drainingReceiptsRef.current) return false;
    drainingReceiptsRef.current = true;
    setRewardDrainBusy(true);
    setRewardClaimError(false);
    try {
      const loaded = getPuzzlePopPendingChapterReceiptsStrict(playerId);
      if (!loaded.ok) {
        setRewardClaimError(true);
        return false;
      }
      for (const receipt of loaded.receipts) {
        if (!(await claimChapterReceipt(receipt))) return false;
      }
      setPendingRewardReceipt(null);
      setRewardClaimError(false);
      return true;
    } catch {
      setRewardClaimError(true);
      return false;
    } finally {
      drainingReceiptsRef.current = false;
      setRewardDrainBusy(false);
    }
  }, [claimChapterReceipt, playerId]);

  const retryPendingReward = () => { void drainPendingRewards(); };

  useEffect(() => {
    if (!progressState.ready) return undefined;
    void drainPendingRewards();
    return undefined;
  }, [drainPendingRewards, progressState.ready]);

  const prepareScene = (nextScene, runSeed, layoutOrder = previousTrayOrder) => {
    const nextTray = createPuzzlePopPieceTray(chapter.grid, runSeed, layoutOrder);
    setTray(nextTray);
    setPreviousTrayOrder(nextTray.map(({ correctSlot }) => correctSlot));
    setPlaced(Array(chapter.grid ** 2).fill(null));
    setSelected(null);
    setFocusedSlot(0);
    setMoves(0);
    setHintSlot(null);
    setWrongSlot(null);
    setHadMistake(false);
    setHintsUsed(0);
    setMessage(`Look at the ${nextScene.title} preview. Choose a piece to begin.`);
  };

  const beginChapterRun = (nextChapterIndex, nextSeed, nextQueue, queueProgress) => {
    const nextChapter = PUZZLE_POP_CHAPTERS[nextChapterIndex];
    setProgressState({ ready: true, progress: queueProgress, error: null });
    scrollToIntroTop();
    setChapterIndex(nextChapterIndex);
    setSeed(nextSeed);
    setQueue(nextQueue);
    setSceneIndex(0);
    setPhase('play');
    prepareScene(nextQueue[0], nextSeed, []);
    onGameEvent?.('puzzle', 'start', { level: nextChapterIndex, round: 0, seed: nextSeed });
    onGameEvent?.('puzzle', 'scene', { level: nextChapterIndex, round: 1, seed: nextSeed });
    speakPackagedBatch2Line(speak, puzzlePopNarration.start(nextChapter, nextQueue[0]));
    playSfx('launch');
  };

  const saveQueueAndStart = (attempt) => {
    const result = savePuzzlePopQueueStrict(playerId, attempt.queue);
    if (!result.ok) {
      setPendingStart(attempt);
      setProgressState((current) => ({ ...current, ready: false, error: 'queue' }));
      setMessage('This chapter could not be saved yet. Retry saving to start.');
      return;
    }
    setPendingStart(null);
    beginChapterRun(attempt.chapterIndex, attempt.seed, attempt.queue, result.progress);
  };

  const startChapter = (nextChapterIndex = chapterIndex) => {
    const nextChapter = PUZZLE_POP_CHAPTERS[nextChapterIndex];
    if (!progressState.ready || pendingSceneSave || pendingRewardReceipt || rewardClaimError || rewardDrainBusy || claimingReceiptsRef.current.size > 0 || !nextChapter || nextChapterIndex > savedProgress.unlockedChapter) return;
    const nextSeed = createSeed();
    const nextQueue = createPuzzlePopSceneQueue(nextChapterIndex, nextSeed, savedProgress.lastSceneQueue, savedProgress.lastCompletedSceneId);
    saveQueueAndStart({ chapterIndex: nextChapterIndex, seed: nextSeed, queue: nextQueue });
  };

  const retryProgressRead = () => {
    const loaded = getPuzzlePopProgressStrict(playerId);
    if (!loaded.ok) {
      setProgressState((current) => ({ ...current, ready: false, error: 'read' }));
      return;
    }
    setProgressState({ ready: true, progress: loaded.progress, error: null });
    setChapterIndex((current) => Math.min(current, loaded.progress.unlockedChapter));
  };

  const retryStartSave = () => { if (pendingStart) saveQueueAndStart(pendingStart); };

  const confirmSceneSave = () => {
    if (!scene) return;
    const result = completePuzzlePopSceneStrict(playerId, chapterIndex, scene.id);
    if (!result.ok) {
      setPendingSceneSave(true);
      setMessage('Picture ready. Saving did not finish. Retry saving to continue.');
      setPhase('save-pending');
      return;
    }

    setPendingSceneSave(false);
    setProgressState({ ready: true, progress: result.progress, error: null });
    setMessage('Picture complete! Read the picture fact below.');
    setPhase('scene-complete');
    onGameEvent?.('puzzle', 'scene_complete', { level: chapterIndex, round: sceneIndex + 1, seed, firstAttempt: !hadMistake, hints: hintsUsed });
    playSfx('success');
    speakPackagedBatch2Line(speak, puzzlePopNarration.completed(scene));
    if (sceneIndex === queue.length - 1 && result.chapterComplete) {
      setMessage(`${chapter.name} complete! Read the picture fact below.`);
      setPhase('chapter-complete');
      onGameEvent?.('puzzle', 'level_completed', { level: chapterIndex, round: sceneIndex + 1, seed, firstAttempt: !hadMistake, hints: hintsUsed, difficulty: chapter.band });
    }
    if (result.receipt) {
      setPendingRewardReceipt(result.receipt);
      void drainPendingRewards();
    }
  };

  const hearPrompt = () => {
    if (!scene) return;
    speakPackagedBatch2Line(speak, puzzlePopNarration.prompt(scene));
  };

  const focusBoardSlot = (slot) => {
    setFocusedSlot(slot);
    boardSlotRefs.current[slot]?.focus();
  };

  const scrollBoardContextIntoViewIfNeeded = () => {
    if (!window.matchMedia('(max-width: 639px)').matches) return;
    const feedback = feedbackRef.current?.getBoundingClientRect();
    const board = boardRef.current?.getBoundingClientRect();
    if (!feedback || !board) return;
    const stickyHeaderClearance = 72;
    const contextOffscreen = board.top < stickyHeaderClearance || board.bottom > window.innerHeight
      || feedback.top < stickyHeaderClearance || feedback.bottom > window.innerHeight;
    if (contextOffscreen) boardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  };

  const scrollTrayIntoViewIfNeeded = (remainingPieces) => {
    if (!window.matchMedia('(max-width: 639px)').matches) return;
    const stickyHeaderClearance = 72;
    const offscreenPiece = remainingPieces.find(({ id }) => {
      const bounds = trayPieceRefs.current[id]?.getBoundingClientRect();
      return bounds && (bounds.top < stickyHeaderClearance || bounds.bottom > window.innerHeight);
    });
    if (offscreenPiece) trayPieceRefs.current[offscreenPiece.id]?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  };

  const choosePiece = (piece, event) => {
    if (solved) return;
    setSelected(piece);
    setMessage('Piece selected. Compare its colours and edges with the preview.');
    if (event.detail === 0) window.requestAnimationFrame(() => boardSlotRefs.current[focusedSlot]?.focus());
    else window.requestAnimationFrame(scrollBoardContextIntoViewIfNeeded);
    playSfx('click');
  };

  const placePiece = (slotIndex, event) => {
    if (!scene || solved) return;
    if (!selected) {
      setMessage('Choose one picture piece first.');
      return;
    }
    setMoves((value) => value + 1);
    if (selected.correctSlot !== slotIndex) {
      setWrongSlot(slotIndex);
      setHadMistake(true);
      setMessage(`Not there yet. Compare the ${scene.title} preview and the edges of your piece.`);
      onGameEvent?.('puzzle', 'answer_attempt', { level: chapterIndex, round: sceneIndex + 1, seed, correct: false, firstAttempt: !hadMistake });
      playSfx('oops');
      if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current);
      wrongTimeoutRef.current = window.setTimeout(() => { setWrongSlot(null); }, 850);
      return;
    }

    const nextPlaced = [...placed];
    nextPlaced[slotIndex] = selected;
    const nextTray = tray.filter((piece) => piece.id !== selected.id);
    setPlaced(nextPlaced);
    setTray(nextTray);
    setSelected(null);
    setHintSlot(null);
    onGameEvent?.('puzzle', 'answer_attempt', { level: chapterIndex, round: sceneIndex + 1, seed, correct: true, firstAttempt: !hadMistake });
    onGameEvent?.('puzzle', 'answer_correct', { level: chapterIndex, round: sceneIndex + 1, seed, firstAttempt: !hadMistake });

    if (nextPlaced.every(Boolean)) {
      confirmSceneSave();
    } else {
      setMessage(`Great fit! ${nextPlaced.filter(Boolean).length} of ${nextPlaced.length} pieces are in place.`);
      if (event.detail === 0 && nextTray.length) window.requestAnimationFrame(() => trayPieceRefs.current[nextTray[0].id]?.focus());
      else if (nextTray.length) window.requestAnimationFrame(() => scrollTrayIntoViewIfNeeded(nextTray));
      playSfx('sparkle');
    }
  };

  const showHint = (event) => {
    if (!scene || solved || tray.length === 0) return;
    const nextPiece = selected || tray[0];
    setSelected(nextPiece);
    setHintSlot(nextPiece.correctSlot);
    setHintsUsed((value) => value + 1);
    setMessage(`Hint: piece ${nextPiece.correctSlot + 1} fits the glowing space. ${chapter.visualTip}`);
    if (event.detail === 0) window.requestAnimationFrame(() => focusBoardSlot(nextPiece.correctSlot));
    onGameEvent?.('puzzle', 'hint', { level: chapterIndex, round: sceneIndex + 1, seed, hintType: 'next_piece' });
    speakPackagedBatch2Line(speak, puzzlePopNarration.hint(nextPiece.correctSlot + 1));
    playSfx('chime');
  };

  const advanceScene = () => {
    if (pendingSceneSave || pendingRewardReceipt || rewardClaimError || rewardDrainBusy || claimingReceiptsRef.current.size > 0) return;
    if (sceneIndex + 1 < queue.length) {
      const nextIndex = sceneIndex + 1;
      const nextScene = queue[nextIndex];
      setSceneIndex(nextIndex);
      setPhase('play');
      prepareScene(nextScene, seed + nextIndex + 1);
      setMessage(`Picture ${nextIndex + 1} of ${queue.length}. ${nextScene.title}.`);
      onGameEvent?.('puzzle', 'scene', { level: chapterIndex, round: nextIndex + 1, seed });
      speakPackagedBatch2Line(speak, puzzlePopNarration.next(nextScene));
      playSfx('click');
      return;
    }
    if (chapterIndex < PUZZLE_POP_CHAPTERS.length - 1) {
      const nextIndex = nextPuzzleChapterIndex(chapterIndex, PUZZLE_POP_CHAPTERS.length);
      setChapterIndex(nextIndex);
      setPhase('intro');
      playSfx('levelup');
    } else {
      setPhase('chapter-complete');
    }
  };

  const replayChapter = () => startChapter(chapterIndex);
  const canAdvanceSavedScene = !pendingSceneSave && !pendingRewardReceipt && !rewardClaimError && !rewardDrainBusy && claimingReceiptsRef.current.size === 0;

  return (
    <div ref={rootRef} className="puzzle-pop-root min-h-[100dvh] overflow-y-auto bg-gradient-to-br from-amber-100 via-yellow-50 to-emerald-100 text-slate-800">
      <header className="puzzle-pop-header sticky top-0 z-20 flex items-center justify-between gap-2 bg-amber-50/90 px-3 py-3 backdrop-blur sm:px-5">
        <button type="button" onClick={() => { onGameEvent?.('puzzle', 'leave', { level: chapterIndex, round: sceneIndex + 1, seed: seed || undefined }); onBack?.(); }} className="game-icon-button" aria-label="Back to learning world"><Home /></button>
        <div className="min-w-0 flex-1 text-center">
          <h1 className="text-2xl font-black text-orange-700 sm:text-3xl">Puzzle Pop</h1>
          {phase !== 'intro' && scene && <>
            <p className="break-words text-sm font-black leading-tight text-orange-950 sm:text-base">{scene.title}</p>
            <p className="text-xs font-bold leading-tight text-orange-800 sm:text-sm">{chapter.name} · Picture {sceneIndex + 1} of {queue.length}</p>
          </>}
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </header>

      {phase === 'intro' ? (
        <main className="puzzle-intro-main mx-auto grid w-full max-w-3xl gap-4 px-4 pb-8 pt-4">
          <section className="puzzle-intro-card rounded-3xl border-4 border-white bg-white/90 p-5 text-center shadow-xl sm:p-7" aria-labelledby="puzzle-intro-chapter">
            <div className="puzzle-intro-selected">
              <p className="puzzle-intro-kicker">Chapter {chapterIndex + 1} of {PUZZLE_POP_CHAPTERS.length} · {chapter.grid}×{chapter.grid} · {completedInChapter}/4 pictures</p>
              <h2 id="puzzle-intro-chapter" className="puzzle-intro-title font-black text-orange-800">{chapter.name}</h2>
              <p className="puzzle-intro-skill font-bold text-slate-700">{chapter.skill}</p>
            </div>
            <p className="puzzle-intro-tip rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-orange-900"><strong>Picture tip: </strong>{chapter.visualTip}</p>
            {(progressState.error || pendingStart) && <div className="puzzle-save-notice" role="status" aria-live="polite">
              <p>{progressState.error === 'read' ? 'Saved progress could not be checked yet.' : 'This chapter could not be saved yet.'}</p>
              <button type="button" onClick={progressState.error === 'read' ? retryProgressRead : retryStartSave}>{progressState.error === 'read' ? 'Retry saved progress' : 'Retry saving to start'}</button>
            </div>}
            {(rewardClaimError || pendingRewardReceipt || rewardDrainBusy) && <div className="puzzle-save-notice" role="status" aria-live="polite"><p>{rewardClaimError ? 'A chapter reward confirmation is still pending.' : 'Checking the saved chapter reward…'}</p>{rewardClaimError && <button type="button" onClick={retryPendingReward}>Retry reward confirmation</button>}</div>}
            <button type="button" disabled={!progressState.ready || Boolean(pendingStart) || !canAdvanceSavedScene} onClick={() => startChapter()} className="puzzle-start-button inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-3 text-lg font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50"><Eye /> {completedInChapter ? 'Replay chapter' : 'Start chapter'}</button>
          </section>
          <details ref={chapterPickerRef} className="puzzle-chapter-picker rounded-2xl border-2 border-amber-200 bg-white/85">
            <summary className="min-h-12 cursor-pointer px-4 py-3 font-black text-orange-900">Choose another chapter</summary>
            <div className="puzzle-chapter-options" role="group" aria-label="Other Puzzle Pop chapters">
              {PUZZLE_POP_CHAPTERS.map((entry, index) => {
                if (index === chapterIndex) return null;
                const unlocked = index <= savedProgress.unlockedChapter;
                const count = entry.scenes.filter(({ id }) => savedProgress.completedSceneIds.includes(id)).length;
                return <button type="button" key={entry.id} disabled={!unlocked} onClick={() => { setChapterIndex(index); if (chapterPickerRef.current) chapterPickerRef.current.open = false; }} aria-pressed={index === chapterIndex} aria-label={`${entry.name}${unlocked ? '' : ', locked'}`} className="puzzle-chapter-option min-h-12 rounded-2xl border-2 px-3 py-2 text-left font-black disabled:opacity-50">
                  <span className="block">Chapter {index + 1} · {entry.name}</span>
                  <span className="puzzle-chapter-meta mt-1 block text-sm font-bold">{entry.grid}×{entry.grid} · {count}/4 pictures {unlocked ? '' : '· Locked'}</span>
                </button>;
              })}
            </div>
          </details>
        </main>
      ) : (
        <main className="puzzle-play-main mx-auto grid w-full max-w-6xl gap-4 px-3 pb-8 pt-4 lg:grid-cols-[minmax(250px,.65fr)_minmax(400px,1fr)] sm:px-5">
          {scene && (
            <>
              <aside className="puzzle-preview-panel grid grid-cols-[96px_minmax(0,1fr)] gap-2 rounded-3xl border-4 border-white bg-white/85 p-3 shadow-xl sm:block sm:p-4">
                <div className="puzzle-preview-heading col-span-2 mb-0 flex items-center justify-between gap-2 text-orange-800 sm:mb-2">
                  <span className="flex items-center gap-2 font-black"><Eye size={20} /> Picture preview</span>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black">{chapter.grid}×{chapter.grid}</span>
                </div>
                <h2 className="puzzle-preview-title col-span-2 m-0 rounded-xl bg-orange-50 px-2 py-2 text-center text-sm font-black leading-tight text-orange-900 sm:mt-3 sm:rounded-2xl sm:px-3 sm:py-3 sm:text-lg">{scene.title}</h2>
                <div className="puzzle-preview-image relative row-span-2 aspect-square h-24 w-24 overflow-hidden rounded-xl shadow-md sm:row-span-1 sm:h-auto sm:w-full sm:rounded-2xl">
                  <img src={scene.image} alt={`Completed picture preview: ${scene.alt}`} className="absolute inset-0 h-full w-full object-cover" />
                  {hintSlot !== null && <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${chapter.grid}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${chapter.grid}, minmax(0, 1fr))` }}>
                    {Array.from({ length: chapter.grid ** 2 }, (_, slot) => <span key={slot} className={`border border-white/60 ${slot === hintSlot ? 'z-10 rounded-sm bg-amber-300/35 ring-2 ring-inset ring-amber-500' : ''}`} />)}
                  </div>}
                </div>
                <p className="puzzle-preview-skill m-0 rounded-xl bg-emerald-50 px-2 py-2 text-xs font-bold text-emerald-900 sm:mt-3 sm:rounded-2xl sm:px-3 sm:py-3 sm:text-sm">{chapter.skill}</p>
                <button type="button" onClick={hearPrompt} aria-label="Hear puzzle instructions again" className="puzzle-hear-button inline-flex min-h-12 w-full items-center justify-center gap-1 rounded-xl bg-sky-100 px-2 text-xs font-black text-sky-900 sm:mt-3 sm:gap-2 sm:px-3 sm:text-base"><Volume2 size={19} /> <span className="sm:hidden">Hear again</span><span className="hidden sm:inline">Hear instructions again</span></button>
                <div className="puzzle-picture-progress col-span-2 mt-0 flex flex-wrap justify-center gap-2 sm:mt-3" aria-label="Chapter progress">
                  {queue.map((entry, index) => <span key={entry.id} aria-label={`Picture ${index + 1}${savedProgress.completedSceneIds.includes(entry.id) ? ', completed before' : ''}`} className={`grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-black ${index === sceneIndex ? 'border-orange-700 bg-orange-500 text-white' : savedProgress.completedSceneIds.includes(entry.id) ? 'border-emerald-600 bg-emerald-100 text-emerald-800' : 'border-slate-300 bg-white text-slate-600'}`}>{index + 1}</span>)}
                </div>
              </aside>

              <section className="puzzle-play-panel flex min-w-0 flex-col gap-3">
                <div ref={feedbackRef} className="puzzle-play-feedback flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-white/95 px-3 py-2 shadow">
                  <p className="m-0 min-w-0 flex-1 text-center font-black text-orange-800" aria-live="polite">{message}</p>
                  {selected && <span role="img" aria-label="Selected picture piece preview" className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 border-orange-400 bg-white shadow-sm"><img src={scene.image} alt="" draggable="false" className="absolute max-w-none object-cover" style={puzzlePopTileImageStyle(selected.correctSlot, chapter.grid)} /></span>}
                </div>
                {phase === 'play' ? (
                  <>
                    <div className="puzzle-tray-panel rounded-3xl border-4 border-white bg-white/90 p-3 shadow-lg sm:p-4">
                      <div className="puzzle-tray-heading mb-3 flex items-center justify-between gap-2">
                        <p className="font-black text-slate-800">Picture pieces <span className="text-slate-500">({tray.length} left · {moves} moves)</span></p>
                        <button type="button" onClick={showHint} disabled={!tray.length} className="puzzle-hint-button inline-flex min-h-12 items-center gap-1.5 rounded-full bg-amber-100 px-4 font-black text-orange-800 disabled:opacity-50"><Lightbulb size={18} />{showMappingDemo ? 'Show a piece mapping' : 'Hint'}</button>
                      </div>
                      {tray.length > 10 && <p className="puzzle-tray-swipe-cue text-xs font-bold text-orange-900 sm:hidden">Swipe sideways for more pieces ↔</p>}
                      <div className="puzzle-piece-tray grid gap-1.5 sm:gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))' }} role="group" aria-label="Picture piece tray">
                        {tray.map((piece, trayIndex) => <button type="button" key={piece.id} ref={(element) => { trayPieceRefs.current[piece.id] = element; }} onClick={(event) => choosePiece(piece, event)} aria-pressed={selected?.id === piece.id} aria-label={`Choose loose piece ${trayIndex + 1}`} className={`relative aspect-square min-h-[48px] min-w-[48px] overflow-hidden rounded-xl border-2 bg-white shadow-sm focus-visible:outline focus-visible:outline-4 focus-visible:outline-orange-400 ${selected?.id === piece.id ? 'border-orange-600 ring-4 ring-orange-200' : 'border-white'}`}><span aria-hidden="true" className="absolute inset-0 overflow-hidden"><img src={scene.image} alt="" draggable="false" className="absolute max-w-none object-cover" style={puzzlePopTileImageStyle(piece.correctSlot, chapter.grid)} /></span></button>)}
                      </div>
                      {showMappingDemo && <p className="text-center text-sm font-bold text-orange-900">Try a piece mapping: compare its highlighted preview square with the glowing board space.</p>}
                    </div>

                    <div ref={boardRef} role="grid" aria-label={`${chapter.grid} by ${chapter.grid} puzzle board`} className="puzzle-board order-first grid aspect-square w-full max-w-[280px] grid-cols-1 gap-1 self-center overflow-hidden rounded-3xl border-4 border-white bg-amber-50 p-1.5 shadow-xl sm:max-w-[460px]" style={{ gridTemplateColumns: `repeat(${chapter.grid}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${chapter.grid}, minmax(0, 1fr))`, width: boardWidth, minWidth: `${chapter.grid * 48 + (chapter.grid - 1) * 4 + 20}px` }}>
                      {Array.from({ length: chapter.grid }, (_, row) => (
                        <div role="row" key={`row-${row}`} className="col-span-full grid min-h-0 min-w-0 gap-1" style={{ gridColumn: '1 / -1', gridTemplateColumns: `repeat(${chapter.grid}, minmax(0, 1fr))` }}>
                          {placed.slice(row * chapter.grid, (row + 1) * chapter.grid).map((piece, column) => {
                            const slotIndex = row * chapter.grid + column;
                            return <div role="gridcell" key={`cell-${slotIndex}`} className="min-h-0 min-w-0">
                              <button type="button" ref={(element) => { boardSlotRefs.current[slotIndex] = element; }} tabIndex={focusedSlot === slotIndex ? 0 : -1} onFocus={() => setFocusedSlot(slotIndex)} onKeyDown={(event) => {
                                if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
                                event.preventDefault();
                                const target = movePuzzlePopBoardFocus(slotIndex, event.key, chapter.grid);
                                if (target !== slotIndex) focusBoardSlot(target);
                              }} onClick={(event) => placePiece(slotIndex, event)} aria-label={`Puzzle space ${slotIndex + 1}, ${piece ? 'piece in place' : 'empty'}${hintSlot === slotIndex ? ', hint space' : ''}`} className={`relative h-full w-full min-h-12 min-w-12 overflow-hidden rounded-md border border-white/80 focus-visible:z-10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-400 ${wrongSlot === slotIndex ? 'animate-shake bg-rose-100' : piece ? 'bg-white' : hintSlot === slotIndex ? 'bg-yellow-200 ring-4 ring-yellow-400' : 'bg-emerald-50'}`}>
                                {piece && <span aria-hidden="true" className="absolute inset-0 overflow-hidden"><img src={scene.image} alt="" draggable="false" className="absolute max-w-none object-cover" style={puzzlePopTileImageStyle(slotIndex, chapter.grid)} /><span className="absolute inset-0 border border-white/15" /></span>}
                                {!piece && hintSlot === slotIndex && <Lightbulb className="absolute inset-0 m-auto text-orange-600" aria-hidden="true" />}
                                {piece && <Check className="absolute right-0.5 top-0.5 rounded-full bg-emerald-600 p-0.5 text-white" size={20} aria-hidden="true" />}
                              </button>
                            </div>;
                          })}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <section className="puzzle-completion-panel rounded-3xl border-4 border-emerald-200 bg-white p-4 text-center shadow-xl sm:p-6" aria-live="polite">
                    <p className="text-4xl" aria-hidden="true">{phase === 'chapter-complete' ? '🏆' : '🎉'}</p>
                    <h2 className="mt-2 text-xl font-black text-emerald-900">{pendingSceneSave ? `${scene.title} is ready to save` : phase === 'chapter-complete' ? `${chapter.name} complete!` : `${scene.title} complete!`}</h2>
                    <p className="puzzle-completion-fact mt-2 rounded-2xl bg-emerald-50 p-4 text-left font-bold leading-relaxed text-emerald-950"><strong>Picture fact:</strong> {scene.fact}</p>
                    {pendingSceneSave && <div className="puzzle-save-notice" role="status" aria-live="polite">
                      <p>The picture is complete, but its progress has not been saved yet.</p>
                      <button type="button" onClick={confirmSceneSave}>Retry saving this picture</button>
                    </div>}
                    {(rewardClaimError || pendingRewardReceipt || rewardDrainBusy) && <div className="puzzle-save-notice" role="status" aria-live="polite"><p>{rewardClaimError ? 'A chapter reward confirmation is still pending.' : 'Checking the saved chapter reward…'}</p>{rewardClaimError && <button type="button" onClick={retryPendingReward}>Retry reward confirmation</button>}</div>}
                    <button type="button" onClick={() => speakPackagedBatch2Line(speak, puzzlePopNarration.completed(scene))} className="mt-3 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-sky-100 px-4 font-black text-sky-900"><Volume2 size={19} /> Hear fact again</button>
                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                      {sceneIndex + 1 < queue.length && <button type="button" disabled={!canAdvanceSavedScene} onClick={advanceScene} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-50">Next picture <ArrowRight size={19} /></button>}
                      {sceneIndex + 1 === queue.length && chapterIndex < PUZZLE_POP_CHAPTERS.length - 1 && <button type="button" disabled={!canAdvanceSavedScene} onClick={advanceScene} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-50">Next chapter <ArrowRight size={19} /></button>}
                      {sceneIndex + 1 === queue.length && chapterIndex === PUZZLE_POP_CHAPTERS.length - 1 && <button type="button" disabled={!canAdvanceSavedScene} onClick={() => setPhase('chapter-complete')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-50"><ArrowRight size={19} /> See chapter reward</button>}
                      {phase === 'chapter-complete' && <button type="button" disabled={!canAdvanceSavedScene} onClick={replayChapter} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-50"><RotateCcw size={19} /> Replay pictures</button>}
                    </div>
                  </section>
                )}
              </section>
            </>
          )}
        </main>
      )}
    </div>
  );
};

export default PuzzlePlay;
