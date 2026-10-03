import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Eye, Home, Lightbulb, RotateCcw, Volume2 } from 'lucide-react';
import { getPraise } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';
import { spotDifferenceNarration, speakPackagedBatch2Line } from '../../data/batch2Narration.js';
import {
  completeSpotDifferenceChapter,
  createSpotDifferenceRun,
  getNextSpotDifferenceHint,
  getSpotDifferenceLastQueue,
  getSpotDifferenceProgress,
  resolveSpotDifferenceTap,
  saveSpotDifferenceQueue,
  spotAnswerAttemptDetail,
  spotDifferenceCompletionMessage,
  SPOT_DIFFERENCE_CHAPTERS,
  SPOT_DIFFERENCE_SCENES,
} from '../../data/spotDifferenceBatch2.js';

const seedNow = () => Math.floor(Math.random() * 0xffffffff) || 1;

// eslint-disable-next-line react-refresh/only-export-components -- exported for focused navigation regression coverage.
export const nextSpotChapterIndex = (currentIndex, chapterCount) => Math.min(Math.max(0, currentIndex + 1), chapterCount - 1);

const DifferenceVisual = ({ type }) => {
  const cls = 'text-2xl leading-none drop-shadow sm:text-3xl';
  const icons = {
    moon: '🌙', sun: '☀️', star: '⭐', heart: '❤️', flag: '🚩', 'flag-normal': '🏳️',
    bolt: '⚡', 'mask-normal': '🥷', mask: '🎭', flower: '🌼', cloud: '☁️',
  };
  return <span className={cls} aria-hidden="true">{icons[type] || '✨'}</span>;
};

const SpotDifference = ({ onBack, playSfx = () => {}, soundOn, onToggleSound, speak = () => {}, onCelebrate = () => {}, onGameEvent, playerId, onPhaseChange }) => {
  const [progress, setProgress] = useState(() => getSpotDifferenceProgress(playerId));
  const [chapterIndex, setChapterIndex] = useState(0);
  const [phase, setPhase] = useState('intro');
  const [seed, setSeed] = useState(0);
  const [queue, setQueue] = useState([]);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [found, setFound] = useState([]);
  const [feedback, setFeedback] = useState('Choose a chapter, then compare the two pictures.');
  const [hintCount, setHintCount] = useState(0);
  const [hintTarget, setHintTarget] = useState(null);
  const [hintedTargets, setHintedTargets] = useState([]);
  const [wrongTap, setWrongTap] = useState(false);
  const [hadMistake, setHadMistake] = useState(false);
  const [wrongTapCount, setWrongTapCount] = useState(0);
  const wrongTimer = useRef(null);
  const chapter = SPOT_DIFFERENCE_CHAPTERS[chapterIndex] || SPOT_DIFFERENCE_CHAPTERS[0];
  const scene = queue[sceneIndex];
  const complete = Boolean(scene && found.length === scene.differences.length);
  const completedCount = SPOT_DIFFERENCE_SCENES.filter((entry) => entry.chapterIndex === chapterIndex && progress.completedSceneIds.includes(entry.id)).length;

  useEffect(() => { onPhaseChange?.(phase === 'chapter-complete' ? 'finish' : phase === 'intro' ? 'intro' : 'play'); }, [phase, onPhaseChange]);
  useEffect(() => () => { if (wrongTimer.current) clearTimeout(wrongTimer.current); }, []);

  const startChapter = (targetIndex = chapterIndex) => {
    if (targetIndex > progress.unlockedChapter) return;
    const nextSeed = seedNow();
    const previousQueue = getSpotDifferenceLastQueue(playerId);
    const nextQueue = createSpotDifferenceRun(targetIndex, nextSeed, previousQueue);
    setChapterIndex(targetIndex);
    setSeed(nextSeed);
    setQueue(nextQueue);
    setSceneIndex(0);
    setFound([]);
    setHintCount(0);
    setHintTarget(null);
    setHintedTargets([]);
    setHadMistake(false);
    setWrongTapCount(0);
    setFeedback('Look at both pictures. Tap a changed detail in Picture B.');
    saveSpotDifferenceQueue(playerId, nextQueue);
    setPhase('play');
    onGameEvent?.('spot', 'start', { level: targetIndex, round: 0, seed: nextSeed });
    onGameEvent?.('spot', 'scene', { level: targetIndex, round: 1, seed: nextSeed });
    speakPackagedBatch2Line(speak, spotDifferenceNarration.start(SPOT_DIFFERENCE_CHAPTERS[targetIndex], nextQueue[0]));
    playSfx('launch');
  };

  const clearScene = () => {
    setFound([]);
    setHintCount(0);
    setHintTarget(null);
    setHintedTargets([]);
    setHadMistake(false);
    setWrongTapCount(0);
    setWrongTap(false);
  };

  const handleFind = (difference) => {
    if (!scene || found.includes(difference.id) || complete || phase !== 'play') return;
    const nextFound = [...found, difference.id];
    setFound(nextFound);
    setHintTarget(null);
    setFeedback(`You found a change! ${nextFound.length} of ${scene.differences.length}.`);
    onGameEvent?.('spot', 'answer_attempt', { level: chapterIndex, round: sceneIndex + 1, seed, correct: true, firstAttempt: !hadMistake });
    onGameEvent?.('spot', 'answer_correct', { level: chapterIndex, round: sceneIndex + 1, seed, firstAttempt: !hadMistake });
    playSfx('sparkle');
    if (nextFound.length === scene.differences.length) {
      setFeedback(spotDifferenceCompletionMessage());
      setPhase('scene-complete');
      const nextProgress = completeSpotDifferenceChapter(playerId, chapterIndex, [scene.id]);
      setProgress(nextProgress);
      onGameEvent?.('spot', 'scene_complete', { level: chapterIndex, round: sceneIndex + 1, seed, firstAttempt: !hadMistake, hints: hintCount });
      speakPackagedBatch2Line(speak, spotDifferenceNarration.completed(scene));
      playSfx('success');
      if (sceneIndex === queue.length - 1) {
        const praise = getPraise();
        setFeedback(spotDifferenceCompletionMessage({ chapterComplete: true, chapterName: chapter.name, praise }));
        setPhase('chapter-complete');
        onCelebrate(praise, 8, 80);
        onGameEvent?.('spot', 'level_completed', { level: chapterIndex, round: sceneIndex + 1, seed, firstAttempt: !hadMistake, hints: hintCount, wrongTaps: wrongTapCount, difficulty: chapter.band });
      }
    }
  };

  const inspectPicture = (event) => {
    if (!scene || complete || phase !== 'play') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    const tap = resolveSpotDifferenceTap(scene.differences, found, x, y);
    if (tap.kind === 'already-found') return;
    if (tap.kind === 'new') { handleFind(tap.difference); return; }
    setHadMistake(true);
    setWrongTapCount((value) => value + 1);
    setWrongTap(true);
    setFeedback('Not that spot yet. Compare the same area in Picture A.');
    onGameEvent?.('spot', 'answer_attempt', spotAnswerAttemptDetail({ level: chapterIndex, round: sceneIndex + 1, seed, correct: false, hadMistake }));
    playSfx('oops');
    if (wrongTimer.current) clearTimeout(wrongTimer.current);
    wrongTimer.current = window.setTimeout(() => setWrongTap(false), 450);
  };

  const showHint = () => {
    if (!scene || hintCount >= chapter.hintTokens || complete || phase !== 'play') return;
    const target = getNextSpotDifferenceHint(scene.differences, found, hintedTargets);
    if (!target) return;
    setHintCount((value) => value + 1);
    setHintTarget(target.id);
    setHintedTargets((value) => [...value, target.id]);
    setFeedback(`Magnifier hint: look near ${target.x < 35 ? 'the left' : target.x > 65 ? 'the right' : 'the middle'} ${target.y < 35 ? 'top' : target.y > 65 ? 'bottom' : 'area'} of Picture B.`);
    onGameEvent?.('spot', 'hint', { level: chapterIndex, round: sceneIndex + 1, seed, hintType: 'magnifier' });
    speakPackagedBatch2Line(speak, spotDifferenceNarration.hint(target.x, target.y));
    playSfx('chime');
  };

  const nextScene = () => {
    if (sceneIndex + 1 < queue.length) {
      const nextIndex = sceneIndex + 1;
      setSceneIndex(nextIndex);
      clearScene();
      setFeedback(`Picture ${nextIndex + 1} of ${queue.length}. Find ${queue[nextIndex].differences.length} changes.`);
      setPhase('play');
      onGameEvent?.('spot', 'scene', { level: chapterIndex, round: nextIndex + 1, seed });
      speakPackagedBatch2Line(speak, spotDifferenceNarration.next(queue[nextIndex]));
      playSfx('click');
      return;
    }
    if (chapterIndex < SPOT_DIFFERENCE_CHAPTERS.length - 1) setChapterIndex(nextSpotChapterIndex(chapterIndex, SPOT_DIFFERENCE_CHAPTERS.length));
    setPhase('intro');
  };

  const leave = () => {
    onGameEvent?.('spot', 'leave', { level: chapterIndex, round: sceneIndex + 1, seed: seed || undefined });
    onBack?.();
  };

  return <div className="min-h-[100dvh] overflow-y-auto bg-gradient-to-b from-indigo-50 via-sky-50 to-indigo-100 text-slate-900">
    <header className="sticky top-0 z-20 flex items-center justify-between gap-2 bg-indigo-50/90 px-3 py-3 backdrop-blur sm:px-5">
      <button type="button" onClick={leave} className="game-icon-button" aria-label="Back to learning world"><Home /></button>
      <div className="min-w-0 text-center"><h1 className="text-xl font-black text-indigo-700 sm:text-3xl">Spot the Difference</h1>{scene && phase !== 'intro' && <p className="truncate text-sm font-bold text-indigo-600">{chapter.name} · Pair {sceneIndex + 1} of 4 · {found.length}/{scene.differences.length}</p>}</div>
      <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
    </header>

    {phase === 'intro' ? <main className="mx-auto max-w-3xl px-4 py-5"><section className="rounded-3xl border-4 border-white bg-white/90 p-5 text-center shadow-xl sm:p-7">
      <p className="text-5xl" aria-hidden="true">🔎</p><h2 className="mt-2 text-2xl font-black text-indigo-800">Twelve picture pairs. Three chapters.</h2><p className="mt-2 font-bold text-slate-700">Find the changes in four picture pairs. You can use two magnifier hints in each pair.</p><p className="mt-2 rounded-2xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-900"><strong>Compare: </strong>Look at the top, middle, then bottom of Picture A and Picture B.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">{SPOT_DIFFERENCE_CHAPTERS.map((entry, index) => { const unlocked = index <= progress.unlockedChapter; const count = SPOT_DIFFERENCE_SCENES.filter((item) => item.chapterIndex === index && progress.completedSceneIds.includes(item.id)).length; return <button type="button" key={entry.id} disabled={!unlocked} onClick={() => setChapterIndex(index)} aria-pressed={chapterIndex === index} className={`min-h-12 rounded-2xl border-2 p-3 text-left font-black ${chapterIndex === index ? 'border-indigo-600 bg-indigo-100 text-indigo-900' : unlocked ? 'border-sky-300 bg-white text-slate-800' : 'border-slate-200 bg-slate-100 text-slate-400'}`}><span className="block">{index + 1}. {entry.name}</span><span className="mt-1 block text-sm">Find {entry.differenceCount} changes · {count}/4 pairs {unlocked ? '' : '· Locked'}</span></button>; })}</div>
      <button type="button" onClick={() => startChapter()} className="mt-5 inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-7 py-3 text-lg font-black text-white"><Eye /> {completedCount ? 'Replay chapter' : 'Start chapter'}</button>
    </section></main> : <main className="mx-auto max-w-7xl px-3 pb-8 pt-3 sm:px-5">
      {scene && <>
        <p className="mb-3 min-h-12 rounded-2xl bg-white/95 px-4 py-3 text-center font-black text-indigo-800 shadow" aria-live="polite">{feedback}</p>
        {phase === 'play' ? <>
          <section className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/90 p-3 shadow"><p className="font-black">{scene.title} <span className="text-slate-600">· {found.length} of {scene.differences.length} changes</span></p><div className="flex gap-2"><button type="button" onClick={() => { speakPackagedBatch2Line(speak, spotDifferenceNarration.prompt(scene)); playSfx('click'); }} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-sky-100 px-4 font-black text-sky-900"><Volume2 size={18} /> Hear clue</button><button type="button" onClick={showHint} disabled={hintCount >= chapter.hintTokens || !getNextSpotDifferenceHint(scene.differences, found, hintedTargets)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-amber-100 px-4 font-black text-amber-900 disabled:opacity-50"><Lightbulb size={18} /> Magnifier {chapter.hintTokens - hintCount} left</button></div></section>
          <div className="grid gap-4 lg:grid-cols-2">
            {[false, true].map((changed) => <section key={String(changed)} className="min-w-0 rounded-3xl border-4 border-white bg-white p-3 shadow-xl"><h2 className="mb-2 text-center text-lg font-black text-indigo-800">Picture {changed ? 'B · Find changes here' : 'A · Look carefully'}</h2><div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-sky-100"><img src={scene.image} alt={`${scene.alt}, picture ${changed ? 'B' : 'A'}`} className="absolute inset-0 h-full w-full object-cover" />
              {scene.differences.map((difference) => { const visible = changed ? difference.visual : difference.normalVisual; const done = found.includes(difference.id); if (changed && done) return <span key={difference.id} aria-label="Found difference" className="pointer-events-none absolute z-10 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-emerald-100/95 ring-4 ring-emerald-500" style={{ left: `${difference.x}%`, top: `${difference.y}%` }}><Check className="text-emerald-800" /></span>; return <span key={difference.id} aria-hidden="true" className="pointer-events-none absolute z-[1] grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow" style={{ left: `${difference.x}%`, top: `${difference.y}%` }}><DifferenceVisual type={visible} /></span>; })}
              {changed && <button type="button" onClick={inspectPicture} aria-label="Search Picture B for a change" className={`absolute inset-0 z-10 h-full w-full cursor-crosshair bg-transparent ${wrongTap ? 'ring-4 ring-inset ring-rose-400' : ''}`} />}
              {changed && scene.differences.map((difference) => !found.includes(difference.id) && <button key={`hot-${difference.id}`} type="button" onClick={() => handleFind(difference)} aria-label={`Check ${difference.x < 35 ? 'left' : difference.x > 65 ? 'right' : 'middle'} ${difference.y < 35 ? 'top' : difference.y > 65 ? 'bottom' : 'middle'} detail`} className={`absolute z-20 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 focus-visible:border-indigo-600 focus-visible:bg-indigo-200/40 focus-visible:outline-none ${hintTarget === difference.id ? 'animate-pulse border-amber-500 bg-amber-200/40' : 'border-transparent bg-transparent'}`} style={{ left: `${difference.x}%`, top: `${difference.y}%` }} />)}
            </div></section>)}
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2" aria-label="Changes found">{scene.differences.map((entry, index) => <span key={entry.id} className={`grid h-11 w-11 place-items-center rounded-full border-2 font-black ${found.includes(entry.id) ? 'border-emerald-600 bg-emerald-100 text-emerald-800' : 'border-slate-300 bg-white text-slate-500'}`} aria-label={`Change ${index + 1}${found.includes(entry.id) ? ', found' : ', not found'}`}>{found.includes(entry.id) ? <Check size={19} /> : index + 1}</span>)}</div>
        </> : <section className="mx-auto max-w-3xl rounded-3xl border-4 border-emerald-200 bg-white p-5 text-center shadow-xl" aria-live="polite"><p className="text-5xl" aria-hidden="true">🏆</p><h2 className="mt-2 text-2xl font-black text-emerald-900">{phase === 'chapter-complete' ? `${chapter.name} complete!` : `${scene.title} pair complete!`}</h2><p className="mt-3 rounded-2xl bg-emerald-50 p-4 text-left font-bold leading-relaxed"><strong>Picture fact:</strong> {scene.fact}</p><div className="mt-4 flex flex-wrap justify-center gap-3">{phase === 'scene-complete' && <button type="button" onClick={nextScene} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-black text-white">Next picture <ArrowRight size={18} /></button>}{phase === 'chapter-complete' && chapterIndex < SPOT_DIFFERENCE_CHAPTERS.length - 1 && <button type="button" onClick={() => { setChapterIndex(nextSpotChapterIndex(chapterIndex, SPOT_DIFFERENCE_CHAPTERS.length)); setPhase('intro'); }} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-black text-white">Next chapter <ArrowRight size={18} /></button>}{phase === 'chapter-complete' && <button type="button" onClick={() => startChapter()} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-indigo-700 px-5 py-3 font-black text-white"><RotateCcw size={18} /> Replay chapter</button>}</div></section>}
      </>}
    </main>}
  </div>;
};

export default SpotDifference;
