import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { getPraise } from '../../utils.js';
import { FocusMenu } from '../shared/FocusMenu.jsx';
import { spotDifferenceNarration, speakPackagedBatch2Line } from '../../data/batch2Narration.js';
import { rewardClaimToken } from '../../data/playerRewards.js';
import {
  getNextSpotDifferenceHint,
  getSpotDifferencePendingChapterReceiptsStrict,
  getSpotDifferenceProgress,
  getSpotDifferenceProgressStrict,
  completeSpotDifferenceSceneStrict,
  markSpotDifferenceChapterReceiptClaimedStrict,
  planSpotDifferenceChapter,
  resolveSpotDifferenceTap,
  resolveSpotDifferenceHotspotTap,
  saveSpotDifferenceQueueStrict,
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
    const leafPath = variant === 'round'
      ? 'M24 10 C44 10 44 38 24 38 C4 38 4 10 24 10 Z'
      : variant === 'pointed'
        ? 'M24 6 C36 16 39 30 24 42 C9 30 12 16 24 6 Z'
        : variant === 'heart'
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
  // Match the base image's object-cover crop, including square/portrait sources.
  const viewHeight = 100 / (scene.aspectRatio || 4 / 3);
  const layerId = `scene-colour-${useId().replaceAll(':', '')}`;
  return <svg aria-hidden="true" viewBox={`0 0 100 ${viewHeight}`} preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
    <defs>{scene.colorEdits.map(({ shape, hue, alphaMatrix, ...geometry }, index) => {
      const id = `${layerId}-${index}`;
      const Shape = shape;
      return <g key={id}>
        <clipPath id={`${id}-clip`} transform={`scale(1 ${viewHeight / 100})`}><Shape {...geometry} /></clipPath>
        <filter id={`${id}-colour`} colorInterpolationFilters="sRGB"><feColorMatrix type="hueRotate" values={hue} /></filter>
        {alphaMatrix && <>
          <filter id={`${id}-selection`} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={alphaMatrix} /></filter>
          <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height={viewHeight}><image href={scene.image} x="0" y="0" width="100" height={viewHeight} preserveAspectRatio="xMidYMid slice" filter={`url(#${id}-selection)`} /></mask>
        </>}
      </g>;
    })}</defs>
    {scene.colorEdits.map((edit, index) => <image key={index} href={scene.image} x="0" y="0" width="100" height={viewHeight} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${layerId}-${index}-clip)`} filter={`url(#${layerId}-${index}-colour)`} mask={edit.alphaMatrix ? `url(#${layerId}-${index}-mask)` : undefined} />)}
  </svg>;
};

const SceneEditLayer = ({ scene }) => {
  const layerId = `scene-edit-${useId().replaceAll(':', '')}`;
  return <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
    <defs>{scene.editRegions.map(({ x, y, width, height, feather = 0 }, index) => {
      const id = `${layerId}-${index}`;
      // Canvas edges have no neighbouring A pixels to blend into. Extend the
      // mask beyond them so original details cannot leak back at the frame edge.
      const leftInset = x === 0 ? -feather * 2 : feather;
      const topInset = y === 0 ? -feather * 2 : feather;
      const rightInset = x + width === 100 ? -feather * 2 : feather;
      const bottomInset = y + height === 100 ? -feather * 2 : feather;
      return <g key={id}>
        <clipPath id={`${id}-clip`}><rect x={x} y={y} width={width} height={height} /></clipPath>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB"><feGaussianBlur stdDeviation={feather / 2} /></filter>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x={x} y={y} width={width} height={height}>
          <rect x={x + leftInset} y={y + topInset} width={width - leftInset - rightInset} height={height - topInset - bottomInset} fill="white" filter={feather ? `url(#${id}-blur)` : undefined} />
        </mask>
      </g>;
    })}</defs>
    {scene.editRegions.map((region, index) => <image key={index} href={scene.imageB} x="0" y="0" width="100" height="100" preserveAspectRatio="none" clipPath={`url(#${layerId}-${index}-clip)`} mask={`url(#${layerId}-${index}-mask)`} />)}
  </svg>;
};

const SpotDifference = ({ onBack, playSfx = () => {}, soundOn, onToggleSound, speak = () => {}, onCelebrate = () => {}, onGameEvent, playerId, onPhaseChange }) => {
  const [progressState, setProgressState] = useState(() => getSpotDifferenceProgressStrict(playerId));
  const progress = progressState.ok ? progressState.progress : getSpotDifferenceProgress(playerId);
  const [chapterIndex, setChapterIndex] = useState(() => progress.unlockedChapter);
  const [phase, setPhase] = useState('intro');
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [seed, setSeed] = useState(0);
  const [queue, setQueue] = useState([]);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [mobilePicture, setMobilePicture] = useState('B');
  const [found, setFound] = useState([]);
  const [feedback, setFeedback] = useState('Choose a chapter, then compare the two pictures.');
  const [hintCount, setHintCount] = useState(0);
  const [hintTarget, setHintTarget] = useState(null);
  const [hintedTargets, setHintedTargets] = useState([]);
  const [showingAnswer, setShowingAnswer] = useState(false);
  const [wrongTap, setWrongTap] = useState(false);
  const [hadMistake, setHadMistake] = useState(false);
  const [wrongTapCount, setWrongTapCount] = useState(0);
  const [completionSaveState, setCompletionSaveState] = useState('idle');
  const [saveError, setSaveError] = useState('');
  const [claimError, setClaimError] = useState('');
  const [claimBusy, setClaimBusy] = useState(false);
  const pendingSceneRef = useRef(null);
  const completionBusyRef = useRef(false);
  const claimDrainRef = useRef(null);
  const claimInFlightRef = useRef(new Map());
  const reconciledReceiptsRef = useRef(new Set());
  const wrongTimer = useRef(null);
  const pictureBRef = useRef(null);
  const resultHeadingRef = useRef(null);
  const chapter = SPOT_DIFFERENCE_CHAPTERS[chapterIndex] || SPOT_DIFFERENCE_CHAPTERS[0];
  const scene = queue[sceneIndex];
  const complete = Boolean(scene && found.length === scene.differences.length);
  const answer = showingAnswer ? scene?.differences.find(({ id }) => id === hintTarget) : null;
  const atLastPair = sceneIndex === queue.length - 1;
  const completedCount = SPOT_DIFFERENCE_SCENES.filter((entry) => entry.chapterIndex === chapterIndex && progress.completedSceneIds.includes(entry.id)).length;

  useEffect(() => { onPhaseChange?.(phase === 'chapter-complete' && completionSaveState === 'saved' ? 'finish' : phase === 'intro' ? 'intro' : 'play'); }, [completionSaveState, phase, onPhaseChange]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }); }, [phase, chapterIndex, sceneIndex]);
  useEffect(() => () => { if (wrongTimer.current) clearTimeout(wrongTimer.current); }, []);
  useEffect(() => {
    if (phase === 'scene-complete' || phase === 'chapter-complete') resultHeadingRef.current?.focus({ preventScroll: true });
  }, [phase]);

  const refreshProgress = useCallback(() => {
    const current = getSpotDifferenceProgressStrict(playerId);
    setProgressState(current);
    return current;
  }, [playerId]);

  const claimReceipt = useCallback(async (receipt) => {
    if (!receipt?.id || !Number.isInteger(receipt.rewardDelta) || receipt.rewardDelta <= 0 || receipt.claimed || reconciledReceiptsRef.current.has(receipt.id)) return true;
    const existing = claimInFlightRef.current.get(receipt.id);
    if (existing) return existing;
    const operation = Promise.resolve().then(async () => {
      let parent;
      try {
        parent = await onCelebrate('Chapter complete!', receipt.rewardDelta * 4, 0, 'spot', {
          quiet: true,
          rewardToken: rewardClaimToken('spot', receipt.id),
        });
      } catch { parent = null; }
      if (parent?.persisted !== true) {
        setClaimError('Your chapter and picture facts are saved, but the reward is not confirmed yet. Retry this same result.');
        return false;
      }
      const marked = markSpotDifferenceChapterReceiptClaimedStrict(playerId, receipt.id);
      if (!marked.ok) {
        setClaimError('The reward was confirmed, but its saved receipt could not be updated. Retry to confirm this same reward.');
        return false;
      }
      reconciledReceiptsRef.current.add(receipt.id);
      setClaimError('');
      refreshProgress();
      return true;
    });
    claimInFlightRef.current.set(receipt.id, operation);
    try { return await operation; }
    finally { if (claimInFlightRef.current.get(receipt.id) === operation) claimInFlightRef.current.delete(receipt.id); }
  }, [onCelebrate, playerId, refreshProgress]);

  const retryPendingClaims = useCallback(async () => {
    if (claimDrainRef.current) return claimDrainRef.current;
    const operation = (async () => {
      const pending = getSpotDifferencePendingChapterReceiptsStrict(playerId);
      if (!pending.ok) {
        setClaimError('Saved chapter rewards cannot be checked yet. Retry when storage is available.');
        return false;
      }
      setClaimBusy(true);
      setClaimError('');
      let failed = false;
      for (const receipt of pending.receipts) {
        if (!await claimReceipt(receipt)) failed = true;
      }
      refreshProgress();
      if (failed) {
        setClaimError('One or more saved chapter rewards still need confirmation. Retry to finish the same saved rewards.');
        return false;
      }
      return true;
    })();
    claimDrainRef.current = operation;
    try { return await operation; }
    finally {
      if (claimDrainRef.current === operation) claimDrainRef.current = null;
      setClaimBusy(false);
    }
  }, [claimReceipt, playerId, refreshProgress]);

  useEffect(() => {
    if (phase !== 'intro') return undefined;
    const timer = window.setTimeout(async () => {
      await retryPendingClaims();
    }, 0);
    return () => { window.clearTimeout(timer); };
  }, [phase, retryPendingClaims]);

  const saveCompletedScene = (pending) => {
    if (!pending || completionBusyRef.current) return false;
    completionBusyRef.current = true;
    setCompletionSaveState('saving');
    setSaveError('');
    const saved = completeSpotDifferenceSceneStrict(playerId, pending.chapterIndex, pending.sceneId);
    if (!saved.ok) {
      setCompletionSaveState('failed');
      setSaveError('This pair could not be saved. Retry now, or keep playing and come back to this pair later.');
      completionBusyRef.current = false;
      return false;
    }
    setProgressState({ ok: true, progress: saved.progress });
    onGameEvent?.('spot', 'scene_complete', { level: pending.chapterIndex, round: pending.sceneIndex + 1, seed: pending.seed, firstAttempt: !pending.hadMistake, hints: pending.hintCount });
    if (pending.isLastScene && saved.chapterComplete) {
      setPhase('chapter-complete');
      const praise = getPraise();
      setFeedback(spotDifferenceCompletionMessage({ chapterComplete: true, chapterName: SPOT_DIFFERENCE_CHAPTERS[pending.chapterIndex].name, praise }));
      onGameEvent?.('spot', 'level_completed', { level: pending.chapterIndex, round: pending.sceneIndex + 1, seed: pending.seed, firstAttempt: !pending.hadMistake, hints: pending.hintCount, wrongTaps: pending.wrongTapCount, difficulty: SPOT_DIFFERENCE_CHAPTERS[pending.chapterIndex].band });
    }
    setCompletionSaveState('saved');
    completionBusyRef.current = false;
    if (saved.receipt && !saved.receipt.claimed) void retryPendingClaims();
    return true;
  };

  const startChapter = (targetIndex = chapterIndex) => {
    const latest = refreshProgress();
    const available = latest.ok ? latest.progress : progress;
    if (targetIndex > available.unlockedChapter) return;
    setOptionsOpen(false);
    const nextSeed = seedNow();
    const { queue: nextQueue, startIndex } = planSpotDifferenceChapter(targetIndex, nextSeed, available);
    setChapterIndex(targetIndex);
    setSeed(nextSeed);
    setQueue(nextQueue);
    setSceneIndex(startIndex);
    setMobilePicture('B');
    clearScene();
    setFeedback('Look at both pictures. Tap a changed detail in Picture B.');
    const queueSaved = saveSpotDifferenceQueueStrict(playerId, nextQueue);
    if (queueSaved.ok) {
      setProgressState({ ok: true, progress: queueSaved.progress });
      setSaveError('');
    } else setSaveError('This run can be practised, but its scene order could not be saved yet.');
    setPhase('play');
    onGameEvent?.('spot', 'start', { level: targetIndex, round: 0, seed: nextSeed });
    onGameEvent?.('spot', 'scene', { level: targetIndex, round: startIndex + 1, seed: nextSeed });
    speakPackagedBatch2Line(speak, spotDifferenceNarration.start(SPOT_DIFFERENCE_CHAPTERS[targetIndex], nextQueue[startIndex]));
    playSfx('launch');
  };

  const clearScene = () => {
    setFound([]);
    setHintCount(0);
    setHintTarget(null);
    setHintedTargets([]);
    setShowingAnswer(false);
    setHadMistake(false);
    setWrongTapCount(0);
    setWrongTap(false);
    if (wrongTimer.current) clearTimeout(wrongTimer.current);
    setCompletionSaveState('idle');
    setSaveError('');
    pendingSceneRef.current = null;
  };

  const handleFind = (difference) => {
    if (!scene || found.includes(difference.id) || complete || phase !== 'play') return;
    const nextFound = [...found, difference.id];
    setFound(nextFound);
    if (hintTarget === difference.id) {
      setHintTarget(null);
      setShowingAnswer(false);
    }
    setFeedback(`You found a change! ${nextFound.length} of ${scene.differences.length}.`);
    onGameEvent?.('spot', 'answer_attempt', { level: chapterIndex, round: sceneIndex + 1, seed, correct: true, firstAttempt: !hadMistake });
    onGameEvent?.('spot', 'answer_correct', { level: chapterIndex, round: sceneIndex + 1, seed, firstAttempt: !hadMistake });
    playSfx('sparkle');
    if (nextFound.length === scene.differences.length) {
      setFeedback(spotDifferenceCompletionMessage());
      setPhase('scene-complete');
      const pending = { sceneId: scene.id, chapterIndex, sceneIndex, isLastScene: sceneIndex === queue.length - 1, seed, hadMistake, hintCount, wrongTapCount };
      pendingSceneRef.current = pending;
      setCompletionSaveState('saving');
      speakPackagedBatch2Line(speak, spotDifferenceNarration.completed(scene));
      playSfx('success');
      saveCompletedScene(pending);
    }
  };

  const inspectPicture = (event) => {
    if (!scene || complete || phase !== 'play') return;
    const bounds = pictureBRef.current?.getBoundingClientRect();
    if (!bounds) return;
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

  const inspectHotspot = (event, difference) => {
    if (event.detail === 0) { handleFind(difference); return; }
    const bounds = pictureBRef.current?.getBoundingClientRect();
    if (!bounds) { handleFind(difference); return; }
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    const hit = resolveSpotDifferenceHotspotTap(scene.differences, found, x, y, difference.id);
    if (hit.kind === 'new') handleFind(hit.difference);
  };

  const showHint = () => {
    if (!scene || complete || phase !== 'play') return;
    const reveal = hintCount >= chapter.hintTokens;
    const target = getNextSpotDifferenceHint(scene.differences, found, hintedTargets)
      || getNextSpotDifferenceHint(scene.differences, found);
    if (!target) return;
    setMobilePicture('B');
    setHintCount((value) => value + 1);
    setHintTarget(target.id);
    setShowingAnswer(reveal);
    if (!hintedTargets.includes(target.id)) setHintedTargets((value) => [...value, target.id]);
    setFeedback(`Magnifier hint: look near ${target.x < 35 ? 'the left' : target.x > 65 ? 'the right' : 'the middle'} ${target.y < 35 ? 'top' : target.y > 65 ? 'bottom' : 'area'} of Picture B.`);
    onGameEvent?.('spot', 'hint', { level: chapterIndex, round: sceneIndex + 1, seed, hintType: reveal ? 'reveal' : 'magnifier' });
    speakPackagedBatch2Line(speak, spotDifferenceNarration.hint(target.x, target.y));
    playSfx('chime');
  };

  const nextScene = () => {
    if (completionSaveState !== 'saved' && completionSaveState !== 'failed') return;
    if (!atLastPair) {
      const nextIndex = sceneIndex + 1;
      setSceneIndex(nextIndex);
      setMobilePicture('B');
      clearScene();
      setFeedback(`Picture ${nextIndex + 1} of ${queue.length}. Find ${queue[nextIndex].differences.length} changes.`);
      setPhase('play');
      onGameEvent?.('spot', 'scene', { level: chapterIndex, round: nextIndex + 1, seed });
      speakPackagedBatch2Line(speak, spotDifferenceNarration.next(queue[nextIndex]));
      playSfx('click');
      return;
    }
    setPhase('intro');
  };

  const leave = () => {
    onGameEvent?.('spot', 'leave', { level: chapterIndex, round: sceneIndex + 1, seed: seed || undefined });
    onBack?.();
  };

  const inPlay = phase === 'play' && scene;
  const nextIndex = nextSpotChapterIndex(chapterIndex, SPOT_DIFFERENCE_CHAPTERS.length);
  const hintLabel = hintCount < chapter.hintTokens ? 'Show a hint' : 'Show me a change';
  const closeOptions = () => setOptionsOpen(false);
  const options = [
    ...(phase === 'intro' ? SPOT_DIFFERENCE_CHAPTERS.map((entry, index) => ({
      label: entry.name,
      description: `Find ${entry.differenceCount} changes in each picture pair.`,
      button: 'Play chapter',
      disabled: index > progress.unlockedChapter,
      action: () => startChapter(index),
    })) : []),
    ...(inPlay ? [
      { label: hintLabel, description: hintCount < chapter.hintTokens ? `${chapter.hintTokens - hintCount} hints left before the game can show you a change.` : 'See a marked change and choose whether to count it.', action: () => { closeOptions(); showHint(); } },
      ...(soundOn ? [{ label: 'Hear the clue', action: () => { closeOptions(); speakPackagedBatch2Line(speak, spotDifferenceNarration.prompt(scene)); } }] : []),
    ] : []),
    ...(phase === 'chapter-complete' ? [{ label: 'Replay chapter', action: () => startChapter() }] : []),
    ...(scene && !inPlay && phase !== 'intro' && soundOn ? [{ label: 'Hear the fact', action: () => { closeOptions(); speakPackagedBatch2Line(speak, spotDifferenceNarration.completed(scene)); } }] : []),
    ...(claimError ? [{ label: 'Retry saved chapter reward', disabled: claimBusy, action: () => { closeOptions(); void retryPendingClaims(); } }] : []),
    { label: soundOn ? 'Turn sound off' : 'Turn sound on', action: () => { closeOptions(); onToggleSound?.(); } },
    { label: 'Back to Thinking & Play', action: leave },
  ];

  return <div className="focus-game spot-focused" data-board-focus="">
    <main className={`focus-game-body${inPlay && !optionsOpen ? '' : ' is-menu'}`}>
      <header className="focus-game-heading">
        {inPlay && !optionsOpen && <p data-spot-progress>{chapter.name} · Pair {sceneIndex + 1} of 4 · {found.length}/{scene.differences.length} changes</p>}
        <h1>{inPlay && !optionsOpen ? scene.title : 'Spot the Difference'}</h1>
      </header>
      {optionsOpen ? <FocusMenu key={phase} choices={options} onBack={closeOptions} /> : <>
      {phase === 'intro' ? <>
        <p className="focus-game-message">Compare the pictures. Tap a change in Picture B.</p>
        {!progressState.ok && <p role="status" className="focus-game-message">Saved progress is unavailable. You can still practise.</p>}
        {claimError && <p role="alert" className="focus-game-message">{claimError}</p>}
        <div className="focus-game-actions">
          <button type="button" className="focus-game-button is-primary" onClick={() => startChapter()}>{completedCount === 4 ? `Replay: ${chapter.name}` : completedCount ? `Continue: ${chapter.name}` : `Start: ${chapter.name}`}</button>
          <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
          <button type="button" className="focus-game-button" onClick={leave}>Back</button>
        </div>
      </> : scene && (inPlay ? <>
          <div className="spot-focus-pictures grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
            {[false, true].map((changed) => <section key={String(changed)} role="tabpanel" aria-label={`Picture ${changed ? 'B' : 'A'}${changed ? ' · Find changes here' : ' · Compare'}`} className={`${(changed ? 'B' : 'A') === mobilePicture ? '' : 'hidden'} min-w-0 rounded-xl border border-indigo-200 bg-white p-1.5 sm:block`}><h2 className="mb-1 text-center text-sm font-black leading-tight text-indigo-800">Picture {changed ? 'B · Find changes here' : 'A · Compare'}</h2><div ref={changed ? pictureBRef : undefined} className="relative w-full overflow-hidden rounded-xl bg-sky-100 sm:rounded-2xl" style={{ aspectRatio: scene.aspectRatio || 4 / 3 }}><img src={changed && scene.imageB && !scene.editRegions ? scene.imageB : scene.image} alt={`${scene.alt}, picture ${changed ? 'B' : 'A'}`} className="absolute inset-0 h-full w-full object-cover" />
              {changed && scene.editRegions && <SceneEditLayer scene={scene} />}
              {changed && scene.colorEdits && <SceneColorEditLayer scene={scene} />}
              {scene.differences.map((difference) => { const visible = changed ? difference.visual : difference.normalVisual; const done = found.includes(difference.id); const bespoke = visible.startsWith('prop:'); if (changed && done) return <span key={difference.id} aria-label="Found difference" className="pointer-events-none absolute z-10 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-emerald-100/95 ring-4 ring-emerald-500" style={{ left: `${difference.x}%`, top: `${difference.y}%` }}><Check className="text-emerald-800" /></span>; if (scene.pairedArt) return null; return <span key={difference.id} aria-hidden="true" className={`pointer-events-none absolute z-[1] grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full ${bespoke ? '' : 'bg-white/90 shadow'}`} style={{ left: `${difference.x}%`, top: `${difference.y}%` }}><DifferenceVisual type={visible} /></span>; })}
              {changed && <button type="button" onClick={inspectPicture} aria-label="Search Picture B for a change" className={`absolute inset-0 z-10 h-full w-full cursor-crosshair bg-transparent ${wrongTap ? 'ring-4 ring-inset ring-rose-400' : ''}`} />}
              {changed && scene.differences.map((difference) => !found.includes(difference.id) && <button key={`hot-${difference.id}`} type="button" onClick={(event) => inspectHotspot(event, difference)} aria-label={`Check ${difference.x < 35 ? 'left' : difference.x > 65 ? 'right' : 'middle'} ${difference.y < 35 ? 'top' : difference.y > 65 ? 'bottom' : 'middle'} detail`} className={`absolute z-20 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 focus-visible:border-indigo-600 focus-visible:bg-indigo-200/40 focus-visible:outline-none ${hintTarget === difference.id ? 'rounded-full border-amber-700 bg-amber-200/40 ring-4 ring-inset ring-yellow-300' : 'border-transparent bg-transparent'}`} style={{ left: `${difference.x}%`, top: `${difference.y}%` }} />)}
            </div></section>)}
          </div>
          <p className="focus-game-message" aria-live="polite">{feedback}</p>
          {saveError && completionSaveState === 'idle' && <p role="status" className="focus-game-message">{saveError}</p>}
          {answer && <p aria-live="polite" className="focus-game-message">Look for the yellow circle. You can see that {answer.label}.</p>}
          <div className="focus-game-actions">
            {answer && <button type="button" className="focus-game-button is-primary" onClick={() => handleFind(answer)}>Mark this change</button>}
            <button type="button" className="focus-game-button sm:hidden" onClick={() => setMobilePicture(picture => picture === 'B' ? 'A' : 'B')}>{mobilePicture === 'B' ? 'Compare Picture A' : 'Find changes in Picture B'}</button>
            <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
          </div>
      </> : <>
        <h2 ref={resultHeadingRef} tabIndex={-1} className="text-xl font-black text-emerald-900">{phase === 'chapter-complete' ? `${chapter.name} complete!` : `${scene.title} pair complete!`}</h2>
        <p className="pattern-focus-explanation">{scene.fact}</p>
        {completionSaveState === 'saving' && <p role="status" className="focus-game-message">Saving this picture pair…</p>}
        {saveError && <p role="alert" className="focus-game-message">{saveError}</p>}
        {claimError && <p role="alert" className="focus-game-message">{claimError}</p>}
        <div className="focus-game-actions">
          {saveError ? <>
            <button type="button" className="focus-game-button is-primary" onClick={() => saveCompletedScene(pendingSceneRef.current)}>Retry save</button>
            <button type="button" className="focus-game-button" onClick={nextScene}>{atLastPair ? 'Back to chapter' : 'Keep playing without saving'}</button>
          </> : <>
            {phase === 'scene-complete' && completionSaveState === 'saved' && <button type="button" className="focus-game-button is-primary" onClick={nextScene}>{atLastPair ? 'Finish remaining pairs' : 'Next picture'}</button>}
            {phase === 'chapter-complete' && (chapterIndex < SPOT_DIFFERENCE_CHAPTERS.length - 1
              ? <button type="button" className="focus-game-button is-primary" onClick={() => startChapter(nextIndex)}>Next: {SPOT_DIFFERENCE_CHAPTERS[nextIndex].name}</button>
              : <button type="button" className="focus-game-button is-primary" onClick={leave}>Finish</button>)}
          </>}
          <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
        </div>
      </>)}
      </>}
    </main>
  </div>;
};

export default SpotDifference;
