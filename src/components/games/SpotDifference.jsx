import { useEffect, useId, useRef, useState } from 'react';
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
  const gradientId = useId().replaceAll(':', '');
  if (type.startsWith('prop:')) {
    const [kind, variant] = type.slice(5).split(':');
    const quantity = Number(variant.match(/\d+/)?.[0] || 1);
    const gradient = `gloss-${gradientId}`;
    const glossy = `url(#${gradient})`;
    const leafPath = variant === 'heart'
      ? 'M24 40 C18 32 7 25 9 16 C11 7 22 11 24 18 C28 8 39 8 40 17 C42 26 30 34 24 40 Z'
      : variant === 'oak'
        ? 'M24 42 L21 31 L13 33 L16 26 L8 23 L17 20 L13 12 L22 17 L24 7 L29 17 L38 12 L34 22 L42 25 L32 29 L35 36 L27 32 Z'
        : 'M24 42 C18 31 8 23 11 14 C14 7 21 10 24 17 C28 9 36 8 39 15 C42 24 30 32 24 42 Z';
    const icon = (() => {
      if (kind === 'sun') return <g stroke="#f59e0b" strokeWidth="3" strokeLinecap="round">{Array.from({ length: quantity }, (_, i) => { const angle = (i / quantity) * Math.PI * 2; return <line key={i} x1={24 + Math.cos(angle) * 14} y1={24 + Math.sin(angle) * 14} x2={24 + Math.cos(angle) * 19} y2={24 + Math.sin(angle) * 19} />; })}<circle cx="24" cy="24" r="11" fill={glossy} stroke="#d97706" /></g>;
      if (kind === 'leaf') return <g transform={`rotate(${variant === 'point-left' ? -32 : variant === 'point-right' ? 32 : variant === 'sideways' ? 90 : 0} 24 24)`}><path d={leafPath} fill={glossy} stroke="#287a42" strokeWidth="2.2" strokeLinejoin="round" /><path d="M24 39 Q24 25 24 12" fill="none" stroke="#f0fdf4" strokeWidth="1.8" />{variant.startsWith('veins') && Array.from({ length: quantity }, (_, i) => { const y = 16 + (i * 20) / Math.max(1, quantity - 1); return <path key={i} d={`M24 ${y} Q${17 - (i % 2) * 2} ${y - 3} 14 ${y - 5}`} fill="none" stroke="#d1fae5" strokeWidth="1.2" />; })}</g>;
      if (kind === 'flower') return <g>{Array.from({ length: quantity }, (_, i) => <ellipse key={i} cx="24" cy="14" rx="5.5" ry="9" transform={`rotate(${(i * 360) / quantity} 24 24)`} fill={glossy} stroke="#d97706" strokeWidth="1.5" />)}<circle cx="24" cy="24" r="6" fill="#fbbf24" stroke="#92400e" strokeWidth="1.5" /></g>;
      if (kind === 'worm') return <g fill="none" stroke="#c56b42" strokeWidth="7" strokeLinecap="round"><path d={variant === 'curve-left' ? 'M8 30 Q16 12 25 26 T40 18' : 'M8 18 Q16 36 25 22 T40 30'} /><circle cx={variant === 'curve-left' ? '40' : '8'} cy={variant === 'curve-left' ? '18' : '18'} r="4" fill="#d97706" stroke="#92400e" strokeWidth="1.5" /></g>;
      if (kind === 'ladybug') return <g><ellipse cx="24" cy="26" rx="15" ry="12" fill={`url(#bug-${gradientId})`} stroke="#7f1d1d" strokeWidth="2" /><path d="M24 15 V37" stroke="#7f1d1d" strokeWidth="2" />{Array.from({ length: quantity }, (_, i) => <circle key={i} cx={i % 2 ? 29 : 19} cy={20 + Math.floor(i / 2) * 8} r="2.3" fill="#1f2937" />)}<circle cx="24" cy="12" r="5" fill="#292524" /><circle cx="22" cy="10" r="1.4" fill="white" /></g>;
      if (kind === 'compass') return <g><circle cx="24" cy="24" r="19" fill="#fef3c7" stroke="#7c4a1d" strokeWidth="3" /><circle cx="24" cy="24" r="14" fill="none" stroke="#d6a84f" strokeWidth="1.5" /><path d="M24 8 L29 26 L24 23 L19 26 Z" fill={glossy} stroke="#7c2d12" strokeWidth="1.5" transform={`rotate(${variant === 'east' ? 90 : variant === 'west' ? -90 : 0} 24 24)`} /><circle cx="24" cy="24" r="3" fill="#78350f" /></g>;
      if (kind === 'route') return <g><path d={variant === 'bend1' ? 'M7 35 L18 25 L29 25 L40 12' : variant === 'bend2' ? 'M7 35 L17 35 L24 22 L33 22 L41 10' : 'M7 35 L14 24 L22 30 L30 17 L40 11'} fill="none" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="7" cy="35" r="3" fill="#16a34a" /><path d="M37 9 L42 10 L40 15" fill="none" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round" /></g>;
      if (kind === 'trees') return <g>{Array.from({ length: quantity }, (_, i) => <g key={i} transform={`translate(${8 + (i * 28) / Math.max(1, quantity - 1)} 0)`}><path d="M8 31 L14 17 L20 31 Z" fill={glossy} stroke="#166534" strokeWidth="1.5" /><path d="M14 29 V38" stroke="#854d0e" strokeWidth="3" /></g>)}</g>;
      if (kind === 'mountains') return <g>{Array.from({ length: quantity }, (_, i) => <path key={i} d={`M${3 + (i * 42) / quantity} 37 L${15 + (i * 42) / quantity} ${i % 2 ? 11 : 5} L${29 + (i * 42) / quantity} 37 Z`} fill={i % 2 ? '#60a5fa' : '#94a3b8'} stroke="#475569" strokeWidth="1.7" strokeLinejoin="round" />)}</g>;
      if (kind === 'marker') return variant === 'flag' ? <g><path d="M12 41 V7" stroke="#854d0e" strokeWidth="3" /><path d="M14 8 H38 L31 17 L38 25 H14 Z" fill={glossy} stroke="#92400e" strokeWidth="2" /><path d="M14 8 H26 V16 H14 Z M26 16 H38 V24 H26 Z" fill="#fff" opacity=".9" /></g> : <g><path d="M24 42 C20 34 8 25 8 18 A16 16 0 1 1 40 18 C40 25 28 34 24 42 Z" fill={glossy} stroke="#b91c1c" strokeWidth="2" /><circle cx="24" cy="18" r="5" fill="#fff7ed" /></g>;
      if (kind === 'binoculars') return <g transform={variant === 'tilted' ? 'rotate(-22 24 24)' : ''}><path d="M11 15 L8 31 Q8 36 14 37 L21 35 L24 20 L21 14 Z M37 15 L40 31 Q40 36 34 37 L27 35 L24 20 L27 14 Z" fill={glossy} stroke="#334155" strokeWidth="2.4" /><circle cx="15" cy="29" r="5" fill="#93c5fd" stroke="#334155" strokeWidth="2" /><circle cx="33" cy="29" r="5" fill="#93c5fd" stroke="#334155" strokeWidth="2" /><path d="M21 18 H27" stroke="#334155" strokeWidth="4" /></g>;
      if (kind === 'book') return variant === 'open' ? <g><path d="M5 13 Q15 9 24 16 V39 Q15 32 5 35 Z M43 13 Q33 9 24 16 V39 Q33 32 43 35 Z" fill={glossy} stroke="#713f12" strokeWidth="2" /><path d="M9 19 Q16 17 20 20 M28 20 Q34 17 39 19" stroke="#fef3c7" strokeWidth="2" /></g> : <g><path d="M9 9 H39 V39 H9 Q6 38 6 35 V13 Q6 9 9 9 Z" fill={glossy} stroke="#713f12" strokeWidth="2" /><path d="M14 15 V33 M18 15 H34" stroke="#fef3c7" strokeWidth="2" /></g>;
      if (kind === 'arches') return <g>{Array.from({ length: quantity }, (_, i) => { const width = 34 / quantity; const x = 7 + (i * 34) / quantity; return <path key={i} d={`M${x} 40 V21 A${width / 2} 12 0 0 1 ${x + width} 21 V40 Z`} fill={glossy} stroke="#9a6338" strokeWidth="2" />; })}<path d="M4 40 H44" stroke="#704b2b" strokeWidth="4" /></g>;
      if (kind === 'stone') return variant === 'square' ? <path d="M8 13 L35 8 L41 34 L13 40 L6 30 Z" fill={glossy} stroke="#64748b" strokeWidth="2.5" /> : <path d="M7 30 Q8 18 19 14 Q28 7 38 16 Q44 28 36 37 Q18 42 7 30 Z" fill={glossy} stroke="#64748b" strokeWidth="2.5" />;
      if (kind === 'lantern') return <g><path d="M15 14 H33 L36 36 H12 Z" fill={glossy} stroke="#78350f" strokeWidth="2.5" /><path d="M18 14 Q18 5 24 5 Q30 5 30 14" fill="none" stroke="#78350f" strokeWidth="2.5" />{Array.from({ length: quantity }, (_, i) => <path key={i} d={`M${18 + i * 12} 29 Q${14 + i * 12} 22 ${18 + i * 12} 18 Q${22 + i * 12} 22 ${18 + i * 12} 29 Z`} fill="#facc15" stroke="#ea580c" strokeWidth="1" />)}</g>;
      if (kind === 'scroll') return variant === 'rolled' ? <g><path d="M10 9 H36 Q42 9 42 15 V36 H14 Q8 36 8 30 V13 Q8 9 10 9 Z" fill={glossy} stroke="#92400e" strokeWidth="2.5" /><circle cx="13" cy="14" r="4" fill="#fef3c7" stroke="#92400e" strokeWidth="2" /><path d="M20 17 H35 M20 23 H34 M20 29 H36" stroke="#92400e" strokeWidth="1.6" /></g> : <g><path d="M8 11 Q8 7 13 7 H36 Q41 7 41 12 V36 H12 Q8 36 8 32 Z" fill={glossy} stroke="#92400e" strokeWidth="2.5" /><path d="M16 17 H34 M16 23 H32 M16 29 H35" stroke="#92400e" strokeWidth="1.6" /><path d="M8 12 Q3 12 4 18 Q4 22 8 22 M41 30 Q46 30 45 24 Q45 20 41 20" fill="#fde68a" stroke="#92400e" strokeWidth="2" /></g>;
      if (kind === 'column') return <g><path d="M10 9 H38 V14 H35 V36 H38 V41 H10 V36 H13 V14 H10 Z" fill={glossy} stroke="#854d0e" strokeWidth="2" />{Array.from({ length: quantity }, (_, i) => <path key={i} d={`M${17 + i * 14 / Math.max(1, quantity - 1)} 16 V34`} stroke="#fef3c7" strokeWidth="1.5" />)}</g>;
      if (kind === 'sprout') return <g><path d="M24 39 Q24 27 24 15" fill="none" stroke="#166534" strokeWidth="3" />{Array.from({ length: quantity }, (_, i) => { const side = i % 2 ? 1 : -1; const y = 18 + Math.floor(i / 2) * 7; return <ellipse key={i} cx={24 + side * 7} cy={y} rx="8" ry="4.5" transform={`rotate(${side * -28} ${24 + side * 7} ${y})`} fill={glossy} stroke="#166534" strokeWidth="1.5" />; })}<path d="M15 40 H33" stroke="#854d0e" strokeWidth="3" /></g>;
      if (kind === 'drops') return <g>{Array.from({ length: quantity }, (_, i) => <path key={i} d={`M${24 + (i - (quantity - 1) / 2) * 15} ${9 + (i % 2) * 4} C${21 + (i - (quantity - 1) / 2) * 15} 19 ${18 + (i - (quantity - 1) / 2) * 15} 22 ${24 + (i - (quantity - 1) / 2) * 15} 23 C${30 + (i - (quantity - 1) / 2) * 15} 22 ${27 + (i - (quantity - 1) / 2) * 15} 19 ${24 + (i - (quantity - 1) / 2) * 15} ${9 + (i % 2) * 4} Z`} fill="#38bdf8" stroke="#0369a1" strokeWidth="1.5" />)}</g>;
      return <circle cx="24" cy="24" r="16" fill={glossy} stroke="#334155" strokeWidth="2" />;
    })();
    return <svg viewBox="0 0 48 48" className="h-9 w-9 drop-shadow-[0_2px_2px_rgba(15,23,42,.65)]" aria-hidden="true"><defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff7cc" /><stop offset="48%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#ea580c" /></linearGradient><radialGradient id={`bug-${gradientId}`}><stop offset="0%" stopColor="#fca5a5" /><stop offset="100%" stopColor="#dc2626" /></radialGradient></defs>{icon}</svg>;
  }
  const cls = 'text-2xl leading-none drop-shadow sm:text-3xl';
  const icons = {
    moon: '🌙', sun: '☀️', star: '⭐', heart: '❤️', flag: '🚩', 'flag-normal': '🏳️',
    bolt: '⚡', 'mask-normal': '🥷', mask: '🎭', flower: '🌼', cloud: '☁️',
  };
  return <span className={cls} aria-hidden="true">{icons[type] || '✨'}</span>;
};

const SceneColorEditLayer = ({ scene }) => {
  const layerId = `scene-colour-${useId().replaceAll(':', '')}`;
  return <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
    <defs>{scene.colorEdits.map(({ shape, hue, ...geometry }, index) => {
      const id = `${layerId}-${index}`;
      const Shape = shape;
      return <g key={id}>
        <clipPath id={`${id}-clip`}><Shape {...geometry} /></clipPath>
        <filter id={`${id}-colour`} colorInterpolationFilters="sRGB"><feColorMatrix type="hueRotate" values={hue} /></filter>
      </g>;
    })}</defs>
    {scene.colorEdits.map((edit, index) => <image key={index} href={scene.image} x="0" y="0" width="100" height="100" preserveAspectRatio="none" clipPath={`url(#${layerId}-${index}-clip)`} filter={`url(#${layerId}-${index}-colour)`} />)}
  </svg>;
};

const SceneEditLayer = ({ scene }) => {
  const layerId = `scene-edit-${useId().replaceAll(':', '')}`;
  return <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
    <defs>{scene.editRegions.map(({ x, y, width, height, feather = 0 }, index) => {
      const id = `${layerId}-${index}`;
      return <g key={id}>
        <clipPath id={`${id}-clip`}><rect x={x} y={y} width={width} height={height} /></clipPath>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB"><feGaussianBlur stdDeviation={feather / 2} /></filter>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x={x} y={y} width={width} height={height}>
          <rect x={x + feather} y={y + feather} width={width - feather * 2} height={height - feather * 2} fill="white" filter={feather ? `url(#${id}-blur)` : undefined} />
        </mask>
      </g>;
    })}</defs>
    {scene.editRegions.map((region, index) => <image key={index} href={scene.imageB} x="0" y="0" width="100" height="100" preserveAspectRatio="none" clipPath={`url(#${layerId}-${index}-clip)`} mask={`url(#${layerId}-${index}-mask)`} />)}
  </svg>;
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
    const nextQueue = createSpotDifferenceRun(targetIndex, nextSeed, previousQueue, progress.lastCompletedSceneId);
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
            {[false, true].map((changed) => <section key={String(changed)} className="min-w-0 rounded-3xl border-4 border-white bg-white p-3 shadow-xl"><h2 className="mb-2 text-center text-lg font-black text-indigo-800">Picture {changed ? 'B · Find changes here' : 'A · Look carefully'}</h2><div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-sky-100"><img src={changed && scene.imageB && !scene.editRegions ? scene.imageB : scene.image} alt={`${scene.alt}, picture ${changed ? 'B' : 'A'}`} className="absolute inset-0 h-full w-full object-cover" />
              {changed && scene.editRegions && <SceneEditLayer scene={scene} />}
              {changed && scene.colorEdits && <SceneColorEditLayer scene={scene} />}
              {scene.differences.map((difference) => { const visible = changed ? difference.visual : difference.normalVisual; const done = found.includes(difference.id); const bespoke = visible.startsWith('prop:'); if (changed && done) return <span key={difference.id} aria-label="Found difference" className="pointer-events-none absolute z-10 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-emerald-100/95 ring-4 ring-emerald-500" style={{ left: `${difference.x}%`, top: `${difference.y}%` }}><Check className="text-emerald-800" /></span>; if (scene.pairedArt) return null; return <span key={difference.id} aria-hidden="true" className={`pointer-events-none absolute z-[1] grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full ${bespoke ? '' : 'bg-white/90 shadow'}`} style={{ left: `${difference.x}%`, top: `${difference.y}%` }}><DifferenceVisual type={visible} /></span>; })}
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
