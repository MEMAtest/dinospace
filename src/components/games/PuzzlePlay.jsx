import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Eye, Home, Lightbulb, RotateCcw, Volume2 } from 'lucide-react';
import { getPraise } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';
import { puzzlePopNarration, speakPackagedBatch2Line } from '../../data/batch2Narration.js';
import {
  createPuzzlePopPieceTray,
  createPuzzlePopSceneQueue,
  getPuzzlePopProgress,
  PUZZLE_POP_CHAPTERS,
  puzzlePopTileImageStyle,
  savePuzzlePopQueue,
  completePuzzlePopScene,
} from '../../data/puzzlePopBatch2.js';

const createSeed = () => Math.floor(Math.random() * 0xffffffff) || 1;

// eslint-disable-next-line react-refresh/only-export-components -- exported for focused navigation regression coverage.
export const nextPuzzleChapterIndex = (currentIndex, chapterCount) => Math.min(Math.max(0, currentIndex + 1), chapterCount - 1);

const PuzzlePlay = ({ onBack, playSfx = () => {}, soundOn, onToggleSound, speak = () => {}, onCelebrate = () => {}, onGameEvent, playerId, onPhaseChange }) => {
  const [savedProgress, setSavedProgress] = useState(() => getPuzzlePopProgress(playerId));
  const [chapterIndex, setChapterIndex] = useState(() => getPuzzlePopProgress(playerId).unlockedChapter);
  const [phase, setPhase] = useState('intro');
  const [queue, setQueue] = useState([]);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [seed, setSeed] = useState(0);
  const [tray, setTray] = useState([]);
  const [previousTrayOrder, setPreviousTrayOrder] = useState([]);
  const [placed, setPlaced] = useState([]);
  const [selected, setSelected] = useState(null);
  const [moves, setMoves] = useState(0);
  const [message, setMessage] = useState('Start a chapter to build a picture.');
  const [hintSlot, setHintSlot] = useState(null);
  const [wrongSlot, setWrongSlot] = useState(null);
  const [hadMistake, setHadMistake] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const wrongTimeoutRef = useRef(null);

  const chapter = PUZZLE_POP_CHAPTERS[chapterIndex] || PUZZLE_POP_CHAPTERS[0];
  const scene = queue[sceneIndex] || null;
  const boardWidth = chapter.grid === 5
    ? 'min(100%, 380px, calc(100dvh - 420px))'
    : 'min(100%, 460px, calc(100dvh - 380px))';
  const solved = Boolean(scene && placed.length && placed.every(Boolean));
  const completedInChapter = useMemo(() => chapter.scenes.filter(({ id }) => savedProgress.completedSceneIds.includes(id)).length, [chapter, savedProgress.completedSceneIds]);

  useEffect(() => () => { if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current); }, []);
  useEffect(() => { onPhaseChange?.(phase === 'chapter-complete' ? 'finish' : phase === 'intro' ? 'intro' : 'play'); }, [phase, onPhaseChange]);

  const prepareScene = (nextScene, runSeed, layoutOrder = previousTrayOrder) => {
    const nextTray = createPuzzlePopPieceTray(chapter.grid, runSeed, layoutOrder);
    setTray(nextTray);
    setPreviousTrayOrder(nextTray.map(({ correctSlot }) => correctSlot));
    setPlaced(Array(chapter.grid ** 2).fill(null));
    setSelected(null);
    setMoves(0);
    setHintSlot(null);
    setWrongSlot(null);
    setHadMistake(false);
    setHintsUsed(0);
    setMessage(`Look at the ${nextScene.title} preview. Choose a piece to begin.`);
  };

  const startChapter = (nextChapterIndex = chapterIndex) => {
    const nextChapter = PUZZLE_POP_CHAPTERS[nextChapterIndex];
    if (!nextChapter || nextChapterIndex > savedProgress.unlockedChapter) return;
    const nextSeed = createSeed();
    const nextQueue = createPuzzlePopSceneQueue(nextChapterIndex, nextSeed, savedProgress.lastSceneQueue);
    setChapterIndex(nextChapterIndex);
    setSeed(nextSeed);
    setQueue(nextQueue);
    setSceneIndex(0);
    savePuzzlePopQueue(playerId, nextQueue);
    setPhase('play');
    prepareScene(nextQueue[0], nextSeed, []);
    onGameEvent?.('puzzle', 'start', { level: nextChapterIndex, round: 0, seed: nextSeed });
    onGameEvent?.('puzzle', 'scene', { level: nextChapterIndex, round: 1, seed: nextSeed });
    speakPackagedBatch2Line(speak, puzzlePopNarration.start(nextChapter, nextQueue[0]));
    playSfx('launch');
  };

  const hearPrompt = () => {
    if (!scene) return;
    speakPackagedBatch2Line(speak, puzzlePopNarration.prompt(scene));
  };

  const choosePiece = (piece) => {
    if (solved) return;
    setSelected(piece);
    setMessage('Piece selected. Compare its colours and edges with the preview.');
    playSfx('click');
  };

  const placePiece = (slotIndex) => {
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
      const nextProgress = completePuzzlePopScene(playerId, chapterIndex, scene.id);
      setSavedProgress(nextProgress);
      setMessage('Picture complete! Read the picture fact below.');
      setPhase('scene-complete');
      onGameEvent?.('puzzle', 'scene_complete', { level: chapterIndex, round: sceneIndex + 1, seed, firstAttempt: !hadMistake, hints: hintsUsed });
      playSfx('success');
      speakPackagedBatch2Line(speak, puzzlePopNarration.completed(scene));
      if (sceneIndex === queue.length - 1) {
        const praise = getPraise();
        setMessage(`${praise} ${chapter.name} complete! Read the picture fact below.`);
        setPhase('chapter-complete');
        onCelebrate(praise, 8, 80);
        onGameEvent?.('puzzle', 'level_completed', { level: chapterIndex, round: sceneIndex + 1, seed, firstAttempt: !hadMistake, hints: hintsUsed, difficulty: chapter.band });
      }
    } else {
      setMessage(`Great fit! ${nextPlaced.filter(Boolean).length} of ${nextPlaced.length} pieces are in place.`);
      playSfx('sparkle');
    }
  };

  const showHint = () => {
    if (!scene || solved || tray.length === 0) return;
    const nextPiece = selected || tray[0];
    setSelected(nextPiece);
    setHintSlot(nextPiece.correctSlot);
    setHintsUsed((value) => value + 1);
    setMessage(`Hint: piece ${nextPiece.correctSlot + 1} fits the glowing space. ${chapter.visualTip}`);
    onGameEvent?.('puzzle', 'hint', { level: chapterIndex, round: sceneIndex + 1, seed, hintType: 'next_piece' });
    speakPackagedBatch2Line(speak, puzzlePopNarration.hint(nextPiece.correctSlot + 1));
    playSfx('chime');
  };

  const advanceScene = () => {
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

  return (
    <div className="min-h-[100dvh] overflow-y-auto bg-gradient-to-br from-amber-100 via-yellow-50 to-emerald-100 text-slate-800">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-2 bg-amber-50/90 px-3 py-3 backdrop-blur sm:px-5">
        <button type="button" onClick={() => { onGameEvent?.('puzzle', 'leave', { level: chapterIndex, round: sceneIndex + 1, seed: seed || undefined }); onBack?.(); }} className="game-icon-button" aria-label="Back to learning world"><Home /></button>
        <div className="min-w-0 flex-1 text-center">
          <h1 className="text-2xl font-black text-orange-700 sm:text-3xl">Puzzle Pop</h1>
          {phase !== 'intro' && scene && <p className="text-sm font-bold leading-tight text-orange-800 sm:text-base"><span className="block sm:inline">{chapter.name}</span><span className="block sm:inline"><span className="hidden sm:inline"> · </span>Picture {sceneIndex + 1} of {queue.length}</span></p>}
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </header>

      {phase === 'intro' ? (
        <main className="mx-auto grid w-full max-w-3xl gap-4 px-4 pb-8 pt-4">
          <section className="rounded-3xl border-4 border-white bg-white/90 p-5 text-center shadow-xl sm:p-7">
            <p className="text-5xl" aria-hidden="true">🧩</p>
            <h2 className="mt-2 text-2xl font-black text-orange-800">Twelve pictures. Three puzzle chapters.</h2>
            <p className="mt-2 text-base font-bold text-slate-700">{chapter.skill}</p>
            <p className="mt-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-orange-900"><strong>Picture tip: </strong>{chapter.visualTip}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3" aria-label="Puzzle Pop chapters">
              {PUZZLE_POP_CHAPTERS.map((entry, index) => {
                const unlocked = index <= savedProgress.unlockedChapter;
                const count = entry.scenes.filter(({ id }) => savedProgress.completedSceneIds.includes(id)).length;
                return <button type="button" key={entry.id} disabled={!unlocked} onClick={() => setChapterIndex(index)} aria-pressed={index === chapterIndex} aria-label={`${entry.name}${unlocked ? '' : ', locked'}`} className={`min-h-12 rounded-2xl border-2 px-3 py-3 text-left font-black ${index === chapterIndex ? 'border-orange-600 bg-orange-100 text-orange-900' : unlocked ? 'border-amber-300 bg-white text-slate-800' : 'border-slate-200 bg-slate-100 text-slate-400'}`}>
                  <span className="block">{index + 1}. {entry.name}</span>
                  <span className="mt-1 block text-sm font-bold">{entry.grid}×{entry.grid} · {count}/4 pictures {unlocked ? '' : '· Locked'}</span>
                </button>;
              })}
            </div>
            <button type="button" onClick={() => startChapter()} className="mt-5 inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-3 text-lg font-black text-white shadow-lg"><Eye /> {completedInChapter ? 'Replay chapter' : 'Start chapter'}</button>
          </section>
        </main>
      ) : (
        <main className="mx-auto grid w-full max-w-6xl gap-4 px-3 pb-8 pt-4 lg:grid-cols-[minmax(250px,.65fr)_minmax(400px,1fr)] sm:px-5">
          {scene && (
            <>
              <aside className="grid grid-cols-[96px_minmax(0,1fr)] gap-2 rounded-3xl border-4 border-white bg-white/85 p-3 shadow-xl sm:block sm:p-4">
                <div className="col-span-2 mb-0 flex items-center justify-between gap-2 text-orange-800 sm:mb-2">
                  <span className="flex items-center gap-2 font-black"><Eye size={20} /> Picture preview</span>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black">{chapter.grid}×{chapter.grid}</span>
                </div>
                <h2 className="col-span-2 m-0 rounded-xl bg-orange-50 px-2 py-2 text-center text-sm font-black leading-tight text-orange-900 sm:mt-3 sm:rounded-2xl sm:px-3 sm:py-3 sm:text-lg">{scene.title}</h2>
                <img src={scene.image} alt={`Completed picture preview: ${scene.alt}`} className="row-span-2 aspect-square h-24 w-24 rounded-xl object-cover shadow-md sm:row-span-1 sm:aspect-square sm:h-auto sm:w-full sm:rounded-2xl" />
                <p className="m-0 rounded-xl bg-emerald-50 px-2 py-2 text-xs font-bold text-emerald-900 sm:mt-3 sm:rounded-2xl sm:px-3 sm:py-3 sm:text-sm">{chapter.skill}</p>
                <button type="button" onClick={hearPrompt} className="inline-flex min-h-12 w-full items-center justify-center gap-1 rounded-xl bg-sky-100 px-2 text-xs font-black text-sky-900 sm:mt-3 sm:gap-2 sm:px-3 sm:text-base"><Volume2 size={19} /> <span className="sm:hidden">Hear again</span><span className="hidden sm:inline">Hear instructions again</span></button>
                <div className="col-span-2 mt-0 flex flex-wrap justify-center gap-2 sm:mt-3" aria-label="Chapter progress">
                  {queue.map((entry, index) => <span key={entry.id} aria-label={`Picture ${index + 1}${savedProgress.completedSceneIds.includes(entry.id) ? ', completed before' : ''}`} className={`grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-black ${index === sceneIndex ? 'border-orange-700 bg-orange-500 text-white' : savedProgress.completedSceneIds.includes(entry.id) ? 'border-emerald-600 bg-emerald-100 text-emerald-800' : 'border-slate-300 bg-white text-slate-600'}`}>{index + 1}</span>)}
                </div>
              </aside>

              <section className="flex min-w-0 flex-col gap-3">
                <p className="min-h-12 rounded-2xl bg-white/95 px-4 py-3 text-center font-black text-orange-800 shadow" aria-live="polite">{message}</p>
                {phase === 'play' ? (
                  <>
                    <div className="grid aspect-square w-full max-w-[280px] grid-cols-1 gap-1 self-center overflow-hidden rounded-3xl border-4 border-white bg-amber-50 p-1.5 shadow-xl sm:max-w-[460px]" style={{ gridTemplateColumns: `repeat(${chapter.grid}, minmax(0, 1fr))`, width: boardWidth }} aria-label={`${chapter.grid} by ${chapter.grid} puzzle board`}>
                      {placed.map((piece, slotIndex) => (
                        <button type="button" key={`slot-${slotIndex}`} onClick={() => placePiece(slotIndex)} aria-label={`Puzzle space ${slotIndex + 1}${hintSlot === slotIndex ? ', hint space' : ''}`} className={`relative aspect-square min-h-[48px] min-w-[48px] overflow-hidden rounded-md border border-white/80 focus-visible:z-10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-400 ${wrongSlot === slotIndex ? 'animate-shake bg-rose-100' : piece ? 'bg-white' : hintSlot === slotIndex ? 'bg-yellow-200 ring-4 ring-yellow-400' : 'bg-emerald-50'}`}>
                          {piece && <span aria-hidden="true" className="absolute inset-0 overflow-hidden"><img src={scene.image} alt="" draggable="false" className="absolute max-w-none object-cover" style={puzzlePopTileImageStyle(slotIndex, chapter.grid)} /><span className="absolute inset-0 border border-white/15" /></span>}
                          {!piece && hintSlot === slotIndex && <Lightbulb className="absolute inset-0 m-auto text-orange-600" aria-hidden="true" />}
                          {piece && <Check className="absolute right-0.5 top-0.5 rounded-full bg-emerald-600 p-0.5 text-white" size={20} aria-hidden="true" />}
                        </button>
                      ))}
                    </div>

                    <div className="rounded-3xl border-4 border-white bg-white/90 p-3 shadow-lg sm:p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="font-black text-slate-800">Picture pieces <span className="text-slate-500">({tray.length} left · {moves} moves)</span></p>
                        <button type="button" onClick={showHint} disabled={!tray.length} className="inline-flex min-h-12 items-center gap-1.5 rounded-full bg-amber-100 px-4 font-black text-orange-800 disabled:opacity-50"><Lightbulb size={18} /> Hint</button>
                      </div>
                      <div className="grid gap-1.5 sm:gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))' }} aria-label="Picture piece tray">
                        {tray.map((piece) => <button type="button" key={piece.id} onClick={() => choosePiece(piece)} aria-pressed={selected?.id === piece.id} aria-label={`Choose piece ${piece.correctSlot + 1}`} className={`relative aspect-square min-h-[48px] min-w-[48px] overflow-hidden rounded-xl border-2 bg-white shadow-sm focus-visible:outline focus-visible:outline-4 focus-visible:outline-orange-400 ${selected?.id === piece.id ? 'border-orange-600 ring-4 ring-orange-200' : 'border-white'}`}><span aria-hidden="true" className="absolute inset-0 overflow-hidden"><img src={scene.image} alt="" draggable="false" className="absolute max-w-none object-cover" style={puzzlePopTileImageStyle(piece.correctSlot, chapter.grid)} /></span></button>)}
                      </div>
                    </div>
                  </>
                ) : (
                  <section className="rounded-3xl border-4 border-emerald-200 bg-white p-4 text-center shadow-xl sm:p-6" aria-live="polite">
                    <p className="text-4xl" aria-hidden="true">{phase === 'chapter-complete' ? '🏆' : '🎉'}</p>
                    <h2 className="mt-2 text-xl font-black text-emerald-900">{phase === 'chapter-complete' ? `${chapter.name} complete!` : `${scene.title} complete!`}</h2>
                    <p className="mt-2 rounded-2xl bg-emerald-50 p-4 text-left font-bold leading-relaxed text-emerald-950"><strong>Picture fact:</strong> {scene.fact}</p>
                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                      {sceneIndex + 1 < queue.length && <button type="button" onClick={advanceScene} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-black text-white">Next picture <ArrowRight size={19} /></button>}
                      {sceneIndex + 1 === queue.length && chapterIndex < PUZZLE_POP_CHAPTERS.length - 1 && <button type="button" onClick={advanceScene} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-black text-white">Next chapter <ArrowRight size={19} /></button>}
                      {sceneIndex + 1 === queue.length && chapterIndex === PUZZLE_POP_CHAPTERS.length - 1 && <button type="button" onClick={() => setPhase('chapter-complete')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-black text-white"><ArrowRight size={19} /> See chapter reward</button>}
                      {phase === 'chapter-complete' && <button type="button" onClick={replayChapter} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 font-black text-white"><RotateCcw size={19} /> Replay pictures</button>}
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
