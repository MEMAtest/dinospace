import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Lightbulb } from 'lucide-react';
import { FocusMenu } from '../shared/FocusMenu.jsx';
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

const DRAG_THRESHOLD = 8;

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
  const [dragPreview, setDragPreview] = useState(null);
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
  const completionHeadingRef = useRef(null);
  const pointerRef = useRef(null);
  const suppressPieceClickRef = useRef(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const headingRef = useRef(null);
  const claimedReceiptsRef = useRef(new Set());
  const claimingReceiptsRef = useRef(new Set());
  const drainingReceiptsRef = useRef(false);

  const chapter = PUZZLE_POP_CHAPTERS[chapterIndex] || PUZZLE_POP_CHAPTERS[0];
  const scene = queue[sceneIndex] || null;
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

  const prepareScene = (runSeed, grid, layoutOrder = previousTrayOrder) => {
    const nextTray = createPuzzlePopPieceTray(grid, runSeed, layoutOrder);
    clearTimeout(wrongTimeoutRef.current);
    pointerRef.current = null;
    setDragPreview(null);
    setTray(nextTray);
    setPreviousTrayOrder(nextTray.map(({ correctSlot }) => correctSlot));
    setPlaced(Array(grid ** 2).fill(null));
    setSelected(null);
    setFocusedSlot(0);
    setMoves(0);
    setHintSlot(null);
    setWrongSlot(null);
    setHadMistake(false);
    setHintsUsed(0);
    setMessage('Drag a piece into place, or tap a piece and then a space.');
  };

  const beginChapterRun = (nextChapterIndex, nextSeed, nextQueue, queueProgress) => {
    setOptionsOpen(false);
    const nextChapter = PUZZLE_POP_CHAPTERS[nextChapterIndex];
    setProgressState({ ready: true, progress: queueProgress, error: null });
    scrollToIntroTop();
    setChapterIndex(nextChapterIndex);
    setSeed(nextSeed);
    setQueue(nextQueue);
    setSceneIndex(0);
    setPhase('play');
    prepareScene(nextSeed, nextChapter.grid, []);
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

  const confirmSceneSave = (focusCompletion) => {
    if (!scene) return;
    if (focusCompletion) window.requestAnimationFrame(() => completionHeadingRef.current?.focus());
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
    const contextOffscreen = board.top < 0 || board.bottom > window.innerHeight
      || feedback.top < 0 || feedback.bottom > window.innerHeight;
    if (contextOffscreen) boardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  };

  const scrollTrayIntoViewIfNeeded = (remainingPieces) => {
    if (!window.matchMedia('(max-width: 639px)').matches) return;
    const offscreenPiece = remainingPieces.find(({ id }) => {
      const bounds = trayPieceRefs.current[id]?.getBoundingClientRect();
      return bounds && (bounds.top < 0 || bounds.bottom > window.innerHeight);
    });
    if (offscreenPiece) trayPieceRefs.current[offscreenPiece.id]?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  };

  const choosePiece = (piece, event) => {
    if (event.detail > 0 && suppressPieceClickRef.current) {
      suppressPieceClickRef.current = false;
      return;
    }
    if (solved) return;
    setSelected(piece);
    if (hintSlot !== piece.correctSlot) setHintSlot(null);
    setMessage('Piece selected. Compare its colours and edges with the preview.');
    if (event.detail === 0) window.requestAnimationFrame(() => boardSlotRefs.current[focusedSlot]?.focus());
    else window.requestAnimationFrame(scrollBoardContextIntoViewIfNeeded);
    playSfx('click');
  };

  const placePiece = (slotIndex, piece, withKeyboard) => {
    if (!scene || solved || placed[slotIndex]) return;
    if (!piece) {
      setMessage('Choose one picture piece first.');
      return;
    }
    setMoves((value) => value + 1);
    if (piece.correctSlot !== slotIndex) {
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
    nextPlaced[slotIndex] = piece;
    const nextTray = tray.filter(({ id }) => id !== piece.id);
    setPlaced(nextPlaced);
    setTray(nextTray);
    setSelected(null);
    setHintSlot(null);
    onGameEvent?.('puzzle', 'answer_attempt', { level: chapterIndex, round: sceneIndex + 1, seed, correct: true, firstAttempt: !hadMistake });
    onGameEvent?.('puzzle', 'answer_correct', { level: chapterIndex, round: sceneIndex + 1, seed, firstAttempt: !hadMistake });

    if (nextPlaced.every(Boolean)) {
      confirmSceneSave(withKeyboard);
    } else {
      setMessage(`Great fit! ${nextPlaced.filter(Boolean).length} of ${nextPlaced.length} pieces are in place.`);
      if (withKeyboard && nextTray.length) window.requestAnimationFrame(() => trayPieceRefs.current[nextTray[0].id]?.focus());
      else if (nextTray.length) window.requestAnimationFrame(() => scrollTrayIntoViewIfNeeded(nextTray));
      playSfx('sparkle');
    }
  };

  const beginPiecePointer = (event, piece) => {
    if (event.button !== 0 || event.isPrimary === false || pointerRef.current) return;
    suppressPieceClickRef.current = false;
    pointerRef.current = {
      id: event.pointerId,
      piece,
      x: event.clientX,
      y: event.clientY,
      moved: false,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const movePiecePointer = (event) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    if (!pointer.moved && Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) < DRAG_THRESHOLD) return;
    pointer.moved = true;
    setDragPreview({ piece: pointer.piece, x: event.clientX, y: event.clientY });
  };

  const finishPiecePointer = (event, cancelled = false) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    pointerRef.current = null;
    setDragPreview(null);
    if (!pointer.moved || cancelled) return;
    suppressPieceClickRef.current = true;

    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-puzzle-slot]');
    if (!target || !boardRef.current?.contains(target) || placed[Number(target.dataset.puzzleSlot)]) {
      setMessage('Drop on an empty puzzle space or tap a piece and then a space.');
      return;
    }

    setSelected(pointer.piece);
    if (hintSlot !== pointer.piece.correctSlot) setHintSlot(null);
    placePiece(Number(target.dataset.puzzleSlot), pointer.piece, false);
  };

  const showHint = (event) => {
    if (!scene || solved || tray.length === 0) return;
    const nextPiece = selected || tray[0];
    setSelected(nextPiece);
    setHintSlot(nextPiece.correctSlot);
    setHintsUsed((value) => value + 1);
    setMessage(`Hint: piece ${nextPiece.correctSlot + 1} fits the glowing space. ${chapter.visualTip}`);
    if (event.detail === 0) window.requestAnimationFrame(() => focusBoardSlot(nextPiece.correctSlot));
    else window.requestAnimationFrame(scrollBoardContextIntoViewIfNeeded);
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
      prepareScene(seed + nextIndex + 1, chapter.grid);
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
  const canAdvanceSavedScene = !pendingStart && !pendingSceneSave && !pendingRewardReceipt && !rewardClaimError && !rewardDrainBusy && claimingReceiptsRef.current.size === 0;

  const intro = phase === 'intro';
  const playing = phase === 'play';
  const closeOptions = () => setOptionsOpen(false);
  const leaveGame = () => { onGameEvent?.('puzzle', 'leave', { level: chapterIndex, round: sceneIndex + 1, seed: seed || undefined }); onBack?.(); };
  const sound = { label: soundOn ? 'Turn sound off' : 'Turn sound on', action: () => { closeOptions(); onToggleSound?.(); } };
  const back = { label: 'Back to Creative Lab', action: leaveGame };
  const chapters = PUZZLE_POP_CHAPTERS.map((item, index) => {
    const complete = item.scenes.every(({ id }) => savedProgress.completedSceneIds.includes(id));
    return {
      label: `${item.name}${index > savedProgress.unlockedChapter ? ' · Locked' : complete ? ' · Complete' : ''}`,
      description: `${item.grid}×${item.grid} · ${item.skill}`,
      button: `${complete ? 'Replay' : 'Start'}: ${item.name}`,
      disabled: !progressState.ready || !canAdvanceSavedScene || index > savedProgress.unlockedChapter,
      action: () => startChapter(index),
    };
  });
  const playOptions = [
    ...(playing && soundOn ? [{ label: 'Hear puzzle instructions again', action: () => { closeOptions(); hearPrompt(); } }] : []),
    ...(!playing && phase === 'chapter-complete' && canAdvanceSavedScene ? [{ label: 'Replay pictures', action: replayChapter }] : []),
    sound,
    back,
  ];
  const saveNeedsRetry = pendingSceneSave || pendingStart || rewardClaimError || progressState.error === 'read';
  const retryLabel = pendingSceneSave ? 'Retry saving this picture' : pendingStart ? 'Retry saving to start' : rewardClaimError ? 'Retry saving stars' : 'Retry saved progress';
  const retryMessage = pendingSceneSave ? 'Your picture is complete. Retry saving to continue.' : pendingStart ? 'Retry saving the chapter to begin.' : rewardClaimError ? 'Your stars could not be confirmed yet.' : 'Saved progress could not be checked.';
  const retry = event => {
    if (pendingSceneSave) confirmSceneSave(event.detail === 0);
    else if (pendingStart) retryStartSave();
    else if (rewardClaimError) retryPendingReward();
    else retryProgressRead();
  };
  const nextPicture = sceneIndex + 1 < queue.length;
  const nextChapter = PUZZLE_POP_CHAPTERS[chapterIndex + 1];
  const nextResult = nextPicture ? { label: 'Next picture', handler: advanceScene }
    : nextChapter ? { label: `Next: ${nextChapter.name}`, handler: advanceScene }
      : phase === 'chapter-complete' ? { label: 'Replay pictures', handler: replayChapter }
        : { label: 'See chapter reward', handler: () => setPhase('chapter-complete') };

  useEffect(() => {
    if (!optionsOpen && (intro || playing)) headingRef.current?.focus({ preventScroll: true });
  }, [intro, playing, optionsOpen, sceneIndex]);

  return <div ref={rootRef} data-board-focus="" className="puzzle-pop-root focus-game" data-puzzle-phase={phase}>
    <main className={`focus-game-body ${intro || optionsOpen || !playing ? 'is-menu' : ''} ${playing && !optionsOpen ? 'puzzle-focus-main' : ''}`}>
      <header className="focus-game-heading puzzle-focus-title">
        {!intro && scene && <p>Puzzle Pop · {chapter.name} · Picture {sceneIndex + 1} of {queue.length}</p>}
        <h1 ref={intro || playing ? headingRef : completionHeadingRef} tabIndex={-1}>{intro ? 'Puzzle Pop' : playing ? scene?.title : pendingSceneSave ? 'Picture ready to save' : phase === 'chapter-complete' ? `${chapter.name} saved!` : 'Picture complete!'}</h1>
      </header>
      {optionsOpen ? <FocusMenu choices={intro ? [...chapters, sound] : playOptions} onBack={closeOptions} /> : intro ? <>
        {saveNeedsRetry ? <p role="alert" className="focus-game-message">{retryMessage}</p> : <p className="focus-game-message">{chapter.grid}×{chapter.grid} puzzles · {chapter.skill}</p>}
        <div className="focus-game-actions">
          {saveNeedsRetry ? <button type="button" className="focus-game-button is-primary" disabled={rewardDrainBusy} onClick={retry}>{retryLabel}</button>
            : <button type="button" className="focus-game-button is-primary" disabled={!progressState.ready || !canAdvanceSavedScene} onClick={() => startChapter()}>{rewardDrainBusy ? 'Checking saved stars…' : `${completedInChapter === chapter.scenes.length ? 'Replay' : 'Start'}: ${chapter.name}`}</button>}
          <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
          <button type="button" className="focus-game-button" onClick={leaveGame}>Back to Creative Lab</button>
        </div>
      </> : playing && scene ? <>
        <aside className="puzzle-focus-preview">
          <div className="puzzle-focus-picture relative aspect-square overflow-hidden rounded-lg">
            <img src={scene.image} alt={`Completed picture preview: ${scene.alt}`} className="absolute inset-0 h-full w-full object-cover" />
            {hintSlot !== null && <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${chapter.grid}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${chapter.grid}, minmax(0, 1fr))` }}>
              {Array.from({ length: chapter.grid ** 2 }, (_, slot) => <span key={slot} className={`border border-white/60 ${slot === hintSlot ? 'z-10 bg-amber-300/35 ring-2 ring-inset ring-amber-500' : ''}`} />)}
            </div>}
          </div>
          <div className="focus-game-actions">
            <button type="button" className="focus-game-button" onClick={showHint} disabled={!tray.length}>{showMappingDemo ? 'Show a piece mapping' : 'Hint'}</button>
            <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
          </div>
        </aside>
        <section className="puzzle-focus-play">
          <div ref={feedbackRef} className="puzzle-play-feedback">
            <p aria-live="polite">{message}</p>
            {selected && <span role="img" aria-label="Selected picture piece preview" className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-orange-500"><img src={scene.image} alt="" draggable="false" className="absolute max-w-none object-cover" style={puzzlePopTileImageStyle(selected.correctSlot, chapter.grid)} /></span>}
          </div>
          <div ref={boardRef} role="grid" aria-label={`${chapter.grid} by ${chapter.grid} puzzle board`} className="puzzle-board order-first grid aspect-square w-full grid-cols-1 gap-1 self-center overflow-hidden rounded-2xl border-4 border-slate-200 bg-white p-1.5" style={{ gridTemplateColumns: `repeat(${chapter.grid}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${chapter.grid}, minmax(0, 1fr))`, minWidth: `${chapter.grid * 48 + (chapter.grid - 1) * 4 + 20}px` }}>
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
                    }} data-puzzle-slot={slotIndex} onClick={(event) => placePiece(slotIndex, selected, event.detail === 0)} aria-label={`Puzzle space ${slotIndex + 1}, ${piece ? 'piece in place' : 'empty'}${hintSlot === slotIndex ? ', hint space' : ''}`} className={`relative h-full w-full min-h-12 min-w-12 overflow-hidden rounded-md border border-white/80 focus-visible:z-10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-400 ${wrongSlot === slotIndex ? 'animate-shake bg-rose-100' : piece ? 'bg-white' : hintSlot === slotIndex ? 'bg-yellow-200 ring-4 ring-yellow-400' : 'bg-emerald-50'}`}>
                      {piece && <span aria-hidden="true" className="absolute inset-0 overflow-hidden"><img src={scene.image} alt="" draggable="false" className="absolute max-w-none object-cover" style={puzzlePopTileImageStyle(slotIndex, chapter.grid)} /><span className="absolute inset-0 border border-white/15" /></span>}
                      {!piece && hintSlot === slotIndex && <Lightbulb className="absolute inset-0 m-auto text-orange-600" aria-hidden="true" />}
                      {piece && <Check className="absolute right-0.5 top-0.5 rounded-full bg-emerald-600 p-0.5 text-white" size={20} aria-hidden="true" />}
                    </button>
                  </div>;
                })}
              </div>
            ))}
          </div>
          <div className="puzzle-focus-tray">
            <p className="font-bold">Pieces · {tray.length} left {tray.length > 10 && <span className="text-sm font-semibold sm:hidden">· swipe for more</span>}</p>
            <div className="puzzle-piece-tray grid gap-1.5 sm:gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))' }} role="group" aria-label="Picture piece tray">
              {tray.map((piece, trayIndex) => <button type="button" key={piece.id} ref={(element) => { trayPieceRefs.current[piece.id] = element; }} onPointerDown={(event) => beginPiecePointer(event, piece)} onPointerMove={movePiecePointer} onPointerUp={finishPiecePointer} onPointerCancel={(event) => finishPiecePointer(event, true)} onLostPointerCapture={(event) => finishPiecePointer(event, true)} onClick={(event) => choosePiece(piece, event)} aria-pressed={selected?.id === piece.id} aria-label={`Choose loose piece ${trayIndex + 1}`} className={`puzzle-tray-piece relative aspect-square min-h-[48px] min-w-[48px] overflow-hidden rounded-xl border-2 bg-white shadow-sm focus-visible:outline focus-visible:outline-4 focus-visible:outline-orange-400 ${selected?.id === piece.id ? 'border-orange-600 ring-4 ring-orange-200' : 'border-white'}`}><span aria-hidden="true" className="absolute inset-0 overflow-hidden"><img src={scene.image} alt="" draggable="false" className="absolute max-w-none object-cover" style={puzzlePopTileImageStyle(piece.correctSlot, chapter.grid)} /></span></button>)}
            </div>
          </div>
        </section>
      </> : scene && <>
        <img src={scene.image} alt={`Completed puzzle: ${scene.alt}`} className="mx-auto mb-3 aspect-square w-[min(68vw,19rem)] rounded-xl object-cover" />
        <p role="status" className="focus-game-message">{scene.fact}</p>
        {saveNeedsRetry && <p role="alert" className="focus-game-message">{retryMessage}</p>}
        {!canAdvanceSavedScene && !saveNeedsRetry && <p role="status">Saving your stars…</p>}
        <div className="focus-game-actions">
          {saveNeedsRetry ? <button type="button" className="focus-game-button is-primary" disabled={rewardDrainBusy} onClick={retry}>{retryLabel}</button>
            : <button type="button" className="focus-game-button is-primary" disabled={!canAdvanceSavedScene} onClick={nextResult.handler}>{nextResult.label}</button>}
          {canAdvanceSavedScene && soundOn && <button type="button" className="focus-game-button" onClick={() => speakPackagedBatch2Line(speak, puzzlePopNarration.completed(scene))}>Hear fact again</button>}
          {canAdvanceSavedScene && <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>}
        </div>
      </>}
    </main>
    {dragPreview && scene && (
      <span aria-hidden="true" className="puzzle-drag-preview" style={{ left: dragPreview.x, top: dragPreview.y }}>
        <img src={scene.image} alt="" draggable="false" className="absolute max-w-none object-cover" style={puzzlePopTileImageStyle(dragPreview.piece.correctSlot, chapter.grid)} />
      </span>
    )}
  </div>;
};

export default PuzzlePlay;
