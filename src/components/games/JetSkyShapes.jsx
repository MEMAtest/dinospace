import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { SoundToggle } from '../shared/index.jsx';
import { skyShapeNarration, speakPackagedBatch2Line } from '../../data/batch2Narration.js';
import { rewardClaimToken } from '../../data/playerRewards.js';
import {
  SKY_SHAPE_EPISODES, SKY_SHAPE_MISSION_BY_ID, SKY_SHAPE_TEACHING, createSkyRunSeed, skyAccuracyStars, skyFinishFlagPosition, skyMissionQueueForEpisode, tracePointsForOutline,
  skyLearningAttemptDetail, skyTraceAccuracy, skyTraceProgressPercent,
} from '../../data/skyShapes.js';
import {
  getSkyShapesProgress, readSkyShapesProgressStrict, recordSkyFlightCompletionStrict,
  rememberSkyMissionQueueStrict, pendingSkyShapesRewards, markSkyShapesRewardClaimedStrict,
  skyRewardCallbackUnits,
} from '../../data/skyShapesProgress.js';

const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 650;
const pointString = (point) => `${point[0]},${point[1]}`;
const percentFor = (done, all) => all ? Math.min(100, Math.round((done / all) * 100)) : 0;

const SkyShapeEpisodeCard = ({ episode, index, progress, confirmedEpisodeIds, selected, disabled, onSelect }) => {
  const episodeComplete = confirmedEpisodeIds.includes(episode.id);
  const missionsDone = episode.missions.filter((mission) => progress.completedMissionIds.includes(mission.id)).length;
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={`min-h-24 min-w-48 rounded-3xl border-4 p-4 text-left shadow-md transition ${selected ? 'border-yellow-300 bg-sky-800 text-white' : disabled ? 'border-white/40 bg-white/45 text-slate-500' : 'border-white bg-white/90 text-slate-800 hover:-translate-y-0.5'}`}
    >
      <span className="block text-xs font-black uppercase tracking-widest">Sky {index + 1} · {episode.band}</span>
      <strong className="mt-1 block text-lg">{episodeComplete ? '✓ ' : ''}{episode.title}</strong>
      <span className="mt-1 block text-sm font-bold">{missionsDone}/{episode.missions.length} flights complete</span>
    </button>
  );
};

const JetSkyShapes = ({ onBack, playSfx = () => {}, soundOn, onToggleSound, speak = () => {}, onCelebrate = () => {}, onGameEvent, onPhaseChange, playerId = 'amari' }) => {
  const svgRef = useRef(null);
  const pointerRef = useRef({ id: null, drawing: false });
  const pathIndexRef = useRef(0);
  const cursorRef = useRef(0);
  const routeStartedRef = useRef(false);
  const routeFinishedRef = useRef(false);
  const keyboardUsedRef = useRef(false);
  const precisionTotalRef = useRef(0);
  const currentTrailRef = useRef([]);
  const attemptedMovesRef = useRef(0);
  const missesRef = useRef(0);
  const missLoggedRef = useRef(false);
  const [progressState, setProgressState] = useState(() => readSkyShapesProgressStrict(playerId));
  const progress = progressState.ok ? progressState.progress : getSkyShapesProgress(playerId);
  const [episodeIndex, setEpisodeIndex] = useState(() => readSkyShapesProgressStrict(playerId).progress?.unlockedEpisode || 0);
  const [phase, setPhase] = useState('start');
  const [queue, setQueue] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [runSeed, setRunSeed] = useState(null);
  const [pathIndex, setPathIndex] = useState(0);
  const [cursorIndex, setCursorIndex] = useState(0);
  const [completedPaths, setCompletedPaths] = useState([]);
  const [routeStarted, setRouteStarted] = useState(false);
  const [trails, setTrails] = useState([]);
  const [visitedByPath, setVisitedByPath] = useState([]);
  const [, setAttemptedMoves] = useState(0);
  const [traceReady, setTraceReady] = useState(false);
  const [missionAccuracy, setMissionAccuracy] = useState(0);
  const [keyboardCompletion, setKeyboardCompletion] = useState(false);
  const [missionStars, setMissionStars] = useState(1);
  const [feedback, setFeedback] = useState('Choose a sky, then follow each glowing outline.');
  const [hadHint, setHadHint] = useState(false);
  const [hadMiss, setHadMiss] = useState(false);
  const [episodeBadge, setEpisodeBadge] = useState(false);
  const [chapterBonusStars, setChapterBonusStars] = useState(0);
  const [newMissionStars, setNewMissionStars] = useState(0);
  const [flightSaveState, setFlightSaveState] = useState('idle');
  const [flightSaveError, setFlightSaveError] = useState('');
  const [rewardBusy, setRewardBusy] = useState(false);
  const [rewardError, setRewardError] = useState('');
  const [startError, setStartError] = useState('');
  const pendingFlightRef = useRef(null);
  const pendingStartRef = useRef(null);
  const rewardBusyRef = useRef(false);
  const completionBusyRef = useRef(false);
  const claimedFlightEventsRef = useRef(new Set());

  const episode = SKY_SHAPE_EPISODES[episodeIndex] || SKY_SHAPE_EPISODES[0];
  const pendingEpisodeIds = progressState.ok
    ? pendingSkyShapesRewards(progressState.progress).filter((receipt) => receipt.kind === 'episode').map((receipt) => receipt.episodeId)
    : [];
  const confirmedEpisodeIds = progress.completedEpisodeIds.filter((id) => !pendingEpisodeIds.includes(id));
  const mission = queue[roundIndex] || null;
  const guidePaths = useMemo(() => mission?.paths.map((path) => tracePointsForOutline(path)) || [], [mission]);
  const guideTolerance = episodeIndex === 0 ? 82 : episodeIndex === 1 ? 68 : 56;
  const overallProgress = skyTraceProgressPercent(guidePaths, pathIndex, cursorIndex, traceReady);

  const drainPendingRewards = useCallback(async (startingState = null) => {
    if (rewardBusyRef.current) return false;
    rewardBusyRef.current = true;
    setRewardBusy(true);
    setRewardError('');
    try {
      let current = startingState?.ok ? startingState : readSkyShapesProgressStrict(playerId);
      if (!current.ok) {
        setProgressState(current);
        setRewardError(current.error || 'Saved Sky Shapes rewards could not be checked.');
        return false;
      }
      setProgressState(current);
      for (const receipt of pendingSkyShapesRewards(current.progress)) {
        let parent;
        try {
          parent = await onCelebrate?.(
            receipt.kind === 'episode' ? 'Aviator badge earned!' : 'Flight stars earned!',
            skyRewardCallbackUnits(receipt.rewardDelta), 0, 'jet',
            { quiet: true, rewardToken: rewardClaimToken('jet', receipt.id) },
          );
        } catch { parent = null; }
        if (parent?.persisted !== true) {
          setRewardError('Your saved stars are waiting for confirmation. Retry to finish this result.');
          return false;
        }
        const marked = markSkyShapesRewardClaimedStrict(playerId, receipt.id);
        if (!marked.ok) {
          setProgressState(readSkyShapesProgressStrict(playerId));
          setRewardError(marked.error || 'The saved reward could not be confirmed. Retry this result.');
          return false;
        }
        current = { ok: true, status: 'ready', progress: marked.progress };
        setProgressState(current);
      }
      setRewardError('');
      return true;
    } finally {
      rewardBusyRef.current = false;
      setRewardBusy(false);
    }
  }, [onCelebrate, playerId]);

  const saveFlightCompletion = useCallback(async (pending) => {
    if (!pending || completionBusyRef.current) return false;
    completionBusyRef.current = true;
    setFlightSaveState('saving');
    setFlightSaveError('');
    const result = recordSkyFlightCompletionStrict(playerId, pending.missionId, pending.accuracy, pending.stars, pending.seed);
    if (!result.ok) {
      setFlightSaveState('failed');
      setFlightSaveError(result.error || 'This flight could not be saved. Retry this same result.');
      completionBusyRef.current = false;
      return false;
    }
    setProgressState({ ok: true, status: 'ready', progress: result.progress });
    setMissionStars(pending.stars);
    setMissionAccuracy(pending.accuracy ?? 0);
    setNewMissionStars(result.awardedStars);
    setChapterBonusStars(result.chapterBonusStars);
    const rewardsConfirmed = await drainPendingRewards({ ok: true, status: 'ready', progress: result.progress });
    if (!rewardsConfirmed) {
      setFlightSaveState('failed');
      setFlightSaveError('Your flight is saved, but its stars or sky badge are still being confirmed. Retry this same result.');
      completionBusyRef.current = false;
      return false;
    }
    const latest = readSkyShapesProgressStrict(playerId);
    if (!latest.ok) {
      setProgressState(latest);
      setFlightSaveState('failed');
      setFlightSaveError(latest.error || 'Saved Sky Shapes progress could not be confirmed. Retry this same result.');
      completionBusyRef.current = false;
      return false;
    }
    setProgressState(latest);
    setEpisodeBadge(result.newlyCompletedEpisode);
    setFeedback(pending.keyboardGuided
      ? 'Keyboard-guided route complete. Completion saved; pen-trace accuracy is not measured with keyboard controls.'
      : `${pending.accuracy}% route accuracy. ${pending.firstAttempt ? 'Independent trace.' : 'Supported practice: a hint or retry was used.'} You earned ${pending.stars} ${pending.stars === 1 ? 'star' : 'stars'}!`);
    const eventKey = `${pending.missionId}:${pending.seed}`;
    if (!claimedFlightEventsRef.current.has(eventKey)) {
      claimedFlightEventsRef.current.add(eventKey);
      onGameEvent?.('jet', 'answer_correct', {
        level: pending.episodeIndex, round: pending.roundIndex, seed: pending.seed,
        firstAttempt: pending.firstAttempt, independent: pending.firstAttempt,
        masteryEligible: !pending.keyboardGuided, keyboardAlternative: pending.keyboardGuided,
        difficulty: pending.difficulty,
      });
      onGameEvent?.('jet', 'learning_attempt', skyLearningAttemptDetail({
        level: pending.episodeIndex, round: pending.roundIndex, seed: pending.seed, difficulty: pending.difficulty,
        missionId: pending.missionId, accuracy: pending.accuracy, firstAttempt: pending.firstAttempt,
        keyboardAlternative: pending.keyboardGuided, hints: pending.hadHint ? 1 : 0,
      }));
      if (pending.isFinalMission && result.episodeComplete) onGameEvent?.('jet', 'level_complete', {
        level: pending.episodeIndex, round: pending.roundIndex, seed: pending.seed, difficulty: pending.difficulty,
      });
    }
    setFlightSaveState('saved');
    setFlightSaveError('');
    completionBusyRef.current = false;
    return true;
  }, [drainPendingRewards, onGameEvent, playerId]);

  const retrySavedProgress = useCallback(async () => {
    const current = readSkyShapesProgressStrict(playerId);
    if (!current.ok) {
      setProgressState(current);
      setRewardError(current.error || 'Saved Sky Shapes progress could not be read.');
      return false;
    }
    setProgressState(current);
    if (pendingFlightRef.current && flightSaveState !== 'saved') return saveFlightCompletion(pendingFlightRef.current);
    return drainPendingRewards(current);
  }, [drainPendingRewards, flightSaveState, playerId, saveFlightCompletion]);

  useEffect(() => { onPhaseChange?.(phase); }, [onPhaseChange, phase]);

  useEffect(() => {
    if (phase !== 'start') return;
    const current = readSkyShapesProgressStrict(playerId);
    setProgressState(current);
    if (!current.ok) {
      setRewardError(current.error || 'Saved Sky Shapes progress could not be checked.');
      return;
    }
    if (pendingSkyShapesRewards(current.progress).length) void drainPendingRewards(current);
  }, [drainPendingRewards, phase, playerId]);

  useLayoutEffect(() => {
    if (phase === 'play') window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [mission?.id, phase, roundIndex]);

  useEffect(() => {
    speakPackagedBatch2Line(speak, skyShapeNarration.choose);
  }, [speak]);

  useEffect(() => {
    if (phase !== 'play' || !mission || !Number.isSafeInteger(runSeed)) return;
    onGameEvent?.('jet', 'scene', { level: episodeIndex, round: roundIndex, seed: runSeed, difficulty: episode.band });
    onGameEvent?.('jet', 'question', { level: episodeIndex, round: roundIndex, seed: runSeed, difficulty: episode.band });
    speakPackagedBatch2Line(speak, skyShapeNarration.prompt(episodeIndex + 1, mission));
  }, [episode.band, episodeIndex, mission, onGameEvent, phase, roundIndex, runSeed, speak]);

  useEffect(() => {
    if (phase !== 'play' || !mission) return;
    pathIndexRef.current = 0;
    cursorRef.current = 0;
    routeStartedRef.current = false;
    routeFinishedRef.current = false;
    pointerRef.current = { id: null, drawing: false };
    currentTrailRef.current = [];
    attemptedMovesRef.current = 0;
    missesRef.current = 0;
    missLoggedRef.current = false;
    keyboardUsedRef.current = false;
    precisionTotalRef.current = 0;
    setPathIndex(0);
    setCursorIndex(0);
    setCompletedPaths([]);
    setTrails(mission.paths.map(() => []));
    setVisitedByPath(mission.paths.map(() => 0));
    setAttemptedMoves(0);
    setTraceReady(false);
    setMissionAccuracy(0);
    setMissionStars(1);
    setChapterBonusStars(0);
    setNewMissionStars(0);
    setHadHint(false);
    setHadMiss(false);
    setFeedback(`Start at the green 1. Trace the ${mission.shape} outline.`);
  }, [mission?.id, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const startSky = (selectedEpisode = episodeIndex) => {
    const latestState = readSkyShapesProgressStrict(playerId);
    setProgressState(latestState);
    if (!latestState.ok) {
      setStartError(latestState.error || 'Saved progress could not be checked. Retry before starting.');
      return false;
    }
    if (pendingSkyShapesRewards(latestState.progress).length || rewardBusyRef.current) {
      setRewardError('Confirm your saved stars before starting another flight.');
      void drainPendingRewards(latestState);
      return false;
    }
    if (selectedEpisode > latestState.progress.unlockedEpisode) return false;
    const selected = SKY_SHAPE_EPISODES[selectedEpisode];
    if (!selected) return false;
    let attempt = pendingStartRef.current?.episodeIndex === selectedEpisode ? pendingStartRef.current : null;
    if (!attempt) {
      const latest = latestState.progress;
      const completed = latest.completedMissionIds;
      const allDone = selected.missions.every((item) => completed.includes(item.id));
      const available = allDone ? selected.missions : selected.missions.filter((item) => !completed.includes(item.id));
      const seed = createSkyRunSeed();
      const planned = skyMissionQueueForEpisode(selectedEpisode, seed, latest.recentMissionIds).filter((item) => available.some((remaining) => remaining.id === item.id));
      const queue = planned.length ? planned : skyMissionQueueForEpisode(selectedEpisode, seed, []);
      attempt = { episodeIndex: selectedEpisode, seed, queue };
    }
    const queueSaved = rememberSkyMissionQueueStrict(playerId, attempt.queue.map((item) => item.id));
    if (!queueSaved.ok) {
      pendingStartRef.current = attempt;
      setStartError(queueSaved.error || 'The flight list could not be saved. Retry to start this same sky.');
      return false;
    }
    pendingStartRef.current = null;
    setStartError('');
    setProgressState({ ok: true, status: 'ready', progress: queueSaved.progress });
    const seed = attempt.seed;
    const finalQueue = attempt.queue;
    setEpisodeIndex(selectedEpisode);
    setQueue(finalQueue);
    setRoundIndex(0);
    setRunSeed(seed);
    setRouteStarted(false);
    setEpisodeBadge(false);
    setFlightSaveState('idle');
    setFlightSaveError('');
    pendingFlightRef.current = null;
    setPhase('play');
    playSfx('launch');
    if (queueSaved.progress.completedEpisodeIds.includes(selected.id)) {
      onGameEvent?.('jet', 'replay', { level: selectedEpisode, round: 0, seed, difficulty: selected.band });
    }
    onGameEvent?.('jet', 'start', { level: selectedEpisode, round: 0, seed, difficulty: selected.band });
    return true;
  };

  const registerMiss = (message) => {
    attemptedMovesRef.current += 1;
    missesRef.current += 1;
    setAttemptedMoves(attemptedMovesRef.current);
    setHadMiss(true);
    if (!missLoggedRef.current) {
      missLoggedRef.current = true;
      onGameEvent?.('jet', 'answer_attempt', { level: episodeIndex, round: roundIndex, seed: runSeed, firstAttempt: true, difficulty: episode.band });
    }
    setFeedback(message);
    playSfx('oops');
  };

  const viewPoint = (event) => {
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds?.width || !bounds?.height) return null;
    return [((event.clientX - bounds.left) / bounds.width) * VIEW_WIDTH, ((event.clientY - bounds.top) / bounds.height) * VIEW_HEIGHT];
  };

  const appendTrail = (index, points) => {
    if (!points.length) return;
    setTrails((previous) => previous.map((trail, path) => path === index ? [...trail, ...points] : trail));
  };

  const setGuidedProgress = (index, nextCursor) => {
    if (routeFinishedRef.current) return;
    const points = guidePaths[index];
    if (!points?.length) return;
    const bounded = Math.max(0, Math.min(points.length - 1, nextCursor));
    const previousCursor = cursorRef.current;
    const added = points.slice(previousCursor + (routeStartedRef.current ? 1 : 0), bounded + 1);
    routeStartedRef.current = true;
    setRouteStarted(true);
    cursorRef.current = bounded;
    pathIndexRef.current = index;
    currentTrailRef.current = points.slice(0, bounded + 1);
    appendTrail(index, added);
    const nextVisited = Math.max(visitedByPath[index] || 0, bounded + 1);
    setVisitedByPath((previous) => previous.map((value, path) => path === index ? nextVisited : value));
    setCursorIndex(bounded);
    const donePoints = guidePaths.slice(0, index).reduce((total, path) => total + path.length, 0) + bounded;
    const totalPoints = guidePaths.reduce((total, path) => total + path.length, 0);
    if (bounded >= points.length - 1) {
      setCompletedPaths((previous) => previous.includes(index) ? previous : [...previous, index]);
      if (index >= guidePaths.length - 1) {
        routeFinishedRef.current = true;
        setTraceReady(true);
        setPathIndex(index);
        setCursorIndex(bounded);
        const keyboardGuided = keyboardUsedRef.current;
        const sampleCount = attemptedMovesRef.current || 1;
        const accuracy = keyboardGuided ? null : skyTraceAccuracy(precisionTotalRef.current, sampleCount);
        const stars = keyboardGuided ? 1 : skyAccuracyStars(accuracy);
        setKeyboardCompletion(keyboardGuided);
        setMissionAccuracy(accuracy ?? 0);
        setMissionStars(stars);
        const firstAttempt = missesRef.current === 0 && !hadHint && !keyboardGuided;
        const pending = {
          missionId: mission.id, accuracy, stars, seed: runSeed, episodeIndex, roundIndex,
          difficulty: episode.band, keyboardGuided, firstAttempt, hadHint,
          isFinalMission: roundIndex === queue.length - 1,
        };
        pendingFlightRef.current = pending;
        setFlightSaveState('saving');
        setFlightSaveError('');
        setRewardError('');
        setNewMissionStars(0);
        setChapterBonusStars(0);
        setEpisodeBadge(false);
        setFeedback('Flight complete. Checking the saved route and stars…');
        void saveFlightCompletion(pending);
        const completionSegments = skyShapeNarration.completionSegments(mission);
        speak(completionSegments.join(' '), { segments: completionSegments });
        playSfx('success');
      } else {
        const nextPath = index + 1;
        pathIndexRef.current = nextPath;
        cursorRef.current = 0;
        routeStartedRef.current = false;
        setRouteStarted(false);
        setPathIndex(nextPath);
        setCursorIndex(0);
        setFeedback(`Nice outline! Start at the next green dot, number ${nextPath + 1}.`);
      }
      return;
    }
    setFeedback((completedPaths.length > 0 || index > 0) ? `Good flying. ${percentFor(donePoints, totalPoints)}% of this outline is traced.` : `Follow the glowing route to the checkered finish flag. ${percentFor(donePoints, totalPoints)}% traced.`);
  };

  const guidePointMove = (point) => {
    if (!mission || routeFinishedRef.current) return;
    const index = pathIndexRef.current;
    const points = guidePaths[index];
    if (!points?.length) return;
    attemptedMovesRef.current += 1;
    setAttemptedMoves(attemptedMovesRef.current);
    const cursor = cursorRef.current;
    let nearest = { index: cursor, distance: Number.POSITIVE_INFINITY };
    for (let candidate = Math.max(0, cursor - 2); candidate <= Math.min(points.length - 1, cursor + 12); candidate += 1) {
      const distance = Math.hypot(points[candidate][0] - point[0], points[candidate][1] - point[1]);
      if (distance < nearest.distance) nearest = { index: candidate, distance };
    }
    if (nearest.distance > guideTolerance || nearest.index < cursor - 2) {
      missesRef.current += 1;
      setHadMiss(true);
      setFeedback('Almost. Bring your trail back close to the glowing dots.');
      if (!missLoggedRef.current) {
        missLoggedRef.current = true;
        onGameEvent?.('jet', 'answer_attempt', { level: episodeIndex, round: roundIndex, seed: runSeed, firstAttempt: true, difficulty: episode.band });
      }
      return;
    }
    // Keep each accepted sample in the 0–1 range. Completion converts the
    // average once to a percentage; multiplying here too inflated scores.
    precisionTotalRef.current += Math.max(0, 1 - (nearest.distance / guideTolerance));
    const next = Math.min(nearest.index, cursor + 12);
    setGuidedProgress(index, next);
  };

  const handlePointerDown = (event) => {
    if (routeFinishedRef.current || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const point = viewPoint(event);
    const outline = guidePaths[pathIndexRef.current];
    const anchor = outline?.[cursorRef.current];
    if (!point || !anchor) return;
    if (Math.hypot(point[0] - anchor[0], point[1] - anchor[1]) > guideTolerance * 1.35) {
      registerMiss(pathIndexRef.current === 0 && cursorRef.current === 0 ? 'Start at the green 1 dot. The route will guide your jet.' : 'Start close to the last green guide dot.');
      return;
    }
    event.preventDefault();
    // Preventing the pointer default also suppresses the browser's normal
    // focus transfer to this SVG. Keep keyboard tracing usable after a child
    // clicks the green start dot.
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture?.(event.pointerId);
    pointerRef.current = { id: event.pointerId, drawing: true };
    routeStartedRef.current = true;
    setRouteStarted(true);
    guidePointMove(point);
  };

  const handlePointerMove = (event) => {
    if (!pointerRef.current.drawing || pointerRef.current.id !== event.pointerId) return;
    event.preventDefault();
    const point = viewPoint(event);
    if (point) guidePointMove(point);
  };

  const stopPointer = (event) => {
    if (event && pointerRef.current.id !== event.pointerId) return;
    if (event) svgRef.current?.releasePointerCapture?.(event.pointerId);
    pointerRef.current = { id: null, drawing: false };
  };

  const handleKeyboardTrace = (event) => {
    if (!['ArrowRight', 'ArrowDown', 'Enter', ' '].includes(event.key) || routeFinishedRef.current) return;
    event.preventDefault();
    keyboardUsedRef.current = true;
    const index = pathIndexRef.current;
    const points = guidePaths[index];
    if (!points?.length) return;
    if (!routeStartedRef.current) {
      attemptedMovesRef.current += 1;
      setAttemptedMoves(attemptedMovesRef.current);
      setGuidedProgress(index, 0);
      setFeedback('Keyboard flight started. Press Space or an arrow key to follow each glowing dot.');
      return;
    }
    attemptedMovesRef.current += 1;
    setAttemptedMoves(attemptedMovesRef.current);
    setGuidedProgress(index, Math.min(points.length - 1, cursorRef.current + Math.max(2, Math.ceil(points.length / 18))));
  };

  const showHint = () => {
    if (!mission || traceReady) return;
    setHadHint(true);
    setFeedback(pathIndex === 0 && cursorIndex === 0 ? 'Begin at green 1, then follow the glowing dots in order.' : `Continue at green dot ${pathIndex + 1}. Trace close to the bright line.`);
    onGameEvent?.('jet', 'hint', { level: episodeIndex, round: roundIndex, seed: runSeed, difficulty: episode.band, hintType: 'instructions' });
    speakPackagedBatch2Line(speak, skyShapeNarration.hint(pathIndex, cursorIndex));
  };

  const speakPrompt = () => {
    if (!mission) return;
    onGameEvent?.('jet', 'hint', { level: episodeIndex, round: roundIndex, seed: runSeed, difficulty: episode.band, hintType: 'replay_clue' });
    speakPackagedBatch2Line(speak, skyShapeNarration.replay(mission));
  };

  const continueMission = () => {
    if (!mission || !traceReady || flightSaveState !== 'saved' || rewardBusy || rewardError
      || !progressState.ok || pendingSkyShapesRewards(progressState.progress).length > 0) return;
    if (roundIndex < queue.length - 1) {
      setRoundIndex((index) => index + 1);
      setRouteStarted(false);
      setHadHint(false);
      setHadMiss(false);
      setFlightSaveState('idle');
      setFlightSaveError('');
      pendingFlightRef.current = null;
      return;
    }
    const latestState = readSkyShapesProgressStrict(playerId);
    if (!latestState.ok || pendingSkyShapesRewards(latestState.progress).length > 0) {
      setProgressState(latestState);
      setRewardError(latestState.error || 'Confirm the saved stars before completing this sky.');
      return;
    }
    const latest = latestState.progress;
    setProgressState(latestState);
    setFeedback(`${episode.title} complete. Your best sky flight is ${latest.bestStars[episode.id] || missionStars} stars.`);
    setPhase('done');
    playSfx('complete');
  };

  const resetMission = () => {
    if (!mission || traceReady) return;
    if (routeStartedRef.current || attemptedMovesRef.current) {
      registerMiss('Fresh route ready. Start at the green dot and try the glowing path again.');
    }
    pathIndexRef.current = 0;
    cursorRef.current = 0;
    routeStartedRef.current = false;
    setRouteStarted(false);
    routeFinishedRef.current = false;
    setKeyboardCompletion(false);
    setPathIndex(0);
    setCursorIndex(0);
    setCompletedPaths([]);
    setTrails(mission.paths.map(() => []));
    setVisitedByPath(mission.paths.map(() => 0));
    setTraceReady(false);
    setMissionAccuracy(0);
    setFeedback('Start at the green dot and trace the route again. Earlier retries stay in your accuracy result.');
    playSfx('swish');
  };

  const leaveGame = () => {
    if (phase === 'play' && Number.isSafeInteger(runSeed)) {
      onGameEvent?.('jet', 'leave', { level: episodeIndex, round: roundIndex, seed: runSeed, difficulty: episode.band });
    }
    onBack?.();
  };

  if (phase === 'start') {
    return (
      <div className="min-h-[100dvh] overflow-y-auto bg-gradient-to-b from-sky-500 via-sky-200 to-lime-100 px-3 pb-8 pt-3 text-slate-900 sm:px-6">
        <header className="mx-auto flex max-w-6xl items-center justify-between rounded-3xl border-2 border-white/80 bg-white/90 p-3 shadow-xl">
          <button type="button" onClick={leaveGame} className="game-icon-button !bg-sky-700 !text-white" aria-label="Back to learning world"><ArrowLeft /></button>
          <div className="text-center"><p className="text-xs font-black uppercase tracking-[.18em] text-sky-700">12 guided flights · three skies</p><h1 className="text-2xl font-black text-slate-900 sm:text-4xl">Sky Shapes</h1></div>
          <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
        </header>
        <main className="mx-auto mt-2 max-w-6xl">
          <p className="mx-auto mb-2 max-w-2xl rounded-2xl bg-white/85 px-3 py-2 text-center text-sm font-bold text-sky-950 sm:mb-4 sm:px-4 sm:py-3 sm:text-lg">Trace the glowing path. You can also guide the jet with Enter, Space, or arrow keys.</p>
          {!progressState.ok && <div className="mb-2 rounded-xl bg-amber-100 p-3 text-sm font-bold text-amber-950" role="alert"><p>{progressState.error || 'Saved Sky Shapes progress could not be checked.'}</p><button type="button" onClick={retrySavedProgress} className="mt-2 min-h-12 rounded-lg bg-amber-800 px-4 font-black text-white">Retry saved progress</button></div>}
          {rewardError && <div className="mb-2 rounded-xl bg-amber-100 p-3 text-sm font-bold text-amber-950" role="status"><p>{rewardError}</p><button type="button" disabled={rewardBusy} onClick={retrySavedProgress} className="mt-2 min-h-12 rounded-lg bg-amber-800 px-4 font-black text-white disabled:opacity-60">{rewardBusy ? 'Checking saved stars…' : 'Retry saved stars'}</button></div>}
          {startError && <div className="mb-2 rounded-xl bg-amber-100 p-3 text-sm font-bold text-amber-950" role="status"><p>{startError}</p>{!progressState.ok && <button type="button" onClick={retrySavedProgress} className="mt-2 min-h-12 rounded-lg bg-amber-800 px-4 font-black text-white">Retry saved progress</button>}</div>}
          <section className="rounded-3xl border-4 border-white/80 bg-white/90 p-3 shadow-xl sm:rounded-[2rem] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0"><p className="text-xs font-black uppercase tracking-widest text-sky-700">Sky {episodeIndex + 1} · {episode.band}</p><h2 className="text-2xl font-black text-slate-900 sm:text-3xl">{episode.title}</h2><p className="mt-1 text-sm font-bold text-slate-600 sm:text-base">{episode.subtitle}</p><p className="mt-1 text-sm font-bold text-sky-900"><span className="font-black">Sky goal: </span>{episode.objective.replace(/^Learning goal: /, '')}</p></div>
              <div className="rounded-xl bg-sky-100 px-3 py-2 text-sm font-black text-sky-950">{episode.missions.filter((item) => progress.completedMissionIds.includes(item.id)).length} of 4 flights saved</div>
            </div>
            <button type="button" disabled={!progressState.ok || rewardBusy || pendingSkyShapesRewards(progressState.progress).length > 0 || Boolean(rewardError)} onClick={() => startSky(episodeIndex)} className="mt-3 min-h-14 w-full rounded-2xl bg-sky-700 px-5 py-3 text-lg font-black text-white shadow-[0_5px_0_#075985] hover:bg-sky-800 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50">{pendingStartRef.current?.episodeIndex === episodeIndex ? 'Retry saving this sky' : confirmedEpisodeIds.includes(episode.id) ? 'Replay this sky' : 'Start this sky'}</button>
            <details className="mt-2 rounded-2xl border-2 border-sky-200 bg-white text-left">
              <summary className="flex min-h-12 cursor-pointer items-center justify-center px-3 text-sm font-black text-sky-900">Choose another sky</summary>
              <div className="grid gap-2 p-2 sm:grid-cols-3">
                {SKY_SHAPE_EPISODES.map((entry, index) => (
                  <SkyShapeEpisodeCard key={entry.id} episode={entry} index={index} progress={progress} confirmedEpisodeIds={confirmedEpisodeIds} selected={episodeIndex === index} disabled={!progressState.ok || index > progress.unlockedEpisode || rewardBusy || pendingSkyShapesRewards(progressState.progress).length > 0} onSelect={(event) => { setEpisodeIndex(index); event.currentTarget.closest('details')?.removeAttribute('open'); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }} />
                ))}
              </div>
            </details>
            <details className="mt-2 rounded-2xl border border-sky-200 bg-white text-left">
              <summary className="flex min-h-12 cursor-pointer items-center justify-center px-3 text-sm font-black text-sky-900">See the four flights</summary>
              <div className="grid gap-2 p-2 sm:grid-cols-2 lg:grid-cols-4">
                {episode.missions.map((entry) => {
                  const done = progress.completedMissionIds.includes(entry.id);
                  return <div key={entry.id} className="flex min-h-12 items-center gap-2 rounded-xl bg-sky-50 px-3 py-2"><span className="text-xl">{done ? '✅' : entry.icon}</span><span className="text-sm font-black">{entry.name}</span>{done && <span className="ml-auto text-xs font-black text-amber-700">{progress.bestMissionStars[entry.id] || 1}★</span>}</div>;
                })}
              </div>
            </details>
          </section>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {confirmedEpisodeIds.map((id) => <div key={id} className="flex items-center gap-2 rounded-full border-2 border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-black text-amber-900"><Sparkles size={18} />{SKY_SHAPE_EPISODES.find((entry) => entry.id === id)?.title} Aviator</div>)}
          </div>
        </main>
      </div>
    );
  }

  if (phase === 'done') {
    const nextEpisode = Math.min(SKY_SHAPE_EPISODES.length - 1, episodeIndex + 1);
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-gradient-to-b from-indigo-950 via-sky-900 to-slate-950 p-4 text-center text-white">
        <section className="w-full max-w-xl rounded-[2.5rem] border-4 border-white/70 bg-white/95 p-6 text-slate-900 shadow-2xl sm:p-9">
          <div className="text-6xl" aria-hidden="true">{episodeBadge ? '🏅' : '✈️'}</div>
          <p className="mt-2 text-xs font-black uppercase tracking-widest text-sky-700">{episode.band} sky complete</p>
          <h1 className="mt-1 text-3xl font-black">{episode.title}</h1>
          <p className="mt-3 text-lg font-bold text-slate-700">Your saved sky badge and flight stars are ready. You can replay any unlocked sky.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => { setPhase('start'); setEpisodeIndex(episodeIndex); }} className="min-h-14 rounded-2xl bg-sky-700 px-5 font-black text-white">Sky map</button>
            <button type="button" onClick={() => startSky(episodeIndex)} className="min-h-14 rounded-2xl bg-indigo-600 px-5 font-black text-white">Replay this sky</button>
            {nextEpisode > episodeIndex && progress.unlockedEpisode >= nextEpisode && <button type="button" onClick={() => startSky(nextEpisode)} className="min-h-14 rounded-2xl bg-emerald-600 px-5 font-black text-white">Fly {SKY_SHAPE_EPISODES[nextEpisode].title}</button>}
            <button type="button" onClick={leaveGame} className="min-h-14 rounded-2xl bg-amber-400 px-5 font-black text-amber-950">Back to world</button>
          </div>
        </section>
      </div>
    );
  }

  const totalPathCount = mission?.paths.length || 0;
  const starsShown = traceReady ? missionStars : 0;
  const activePath = guidePaths[pathIndex] || [];
  const hotPoint = activePath[cursorIndex] || activePath[0] || [500, 330];

  return (
    <div className="min-h-[100dvh] overflow-y-auto bg-gradient-to-b from-sky-700 via-sky-300 to-emerald-100 px-2 pb-6 pt-2 text-slate-900 sm:px-5 sm:pt-4">
      <header className="mx-auto flex max-w-6xl items-center gap-2 rounded-3xl border-2 border-white/80 bg-white/90 p-2.5 shadow-xl sm:gap-4 sm:p-3">
        <button type="button" onClick={leaveGame} className="game-icon-button shrink-0 !bg-sky-700 !text-white" aria-label="Back to learning world"><ArrowLeft /></button>
        <div className="min-w-0 flex-1 text-center"><p className="truncate text-[10px] font-black uppercase tracking-widest text-sky-700 sm:text-xs">Sky {episodeIndex + 1} · {episode.title}</p><h1 className="truncate text-xl font-black sm:text-2xl">{mission?.name}</h1></div>
        <span className="shrink-0 rounded-full bg-sky-100 px-2 py-1 text-xs font-black sm:px-3 sm:text-sm">Flight {roundIndex + 1}/{queue.length}</span>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </header>

      <main className="mx-auto mt-3 grid max-w-6xl gap-2 rounded-[2rem] border-4 border-white/80 bg-sky-950/80 p-2.5 text-white shadow-2xl sm:mt-5 sm:gap-3 sm:p-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)]">
        <div className={`flex flex-wrap items-center justify-between gap-2 px-1 sm:px-3 lg:col-span-2 ${traceReady ? 'hidden sm:flex' : ''}`}>
          <div><p className="text-xs font-black uppercase tracking-widest text-sky-200">Mission {roundIndex + 1} · {episode.band}</p><p className="text-lg font-black sm:text-xl">{mission?.icon} {mission?.name} · {completedPaths.length}/{totalPathCount} parts</p></div>
          <p className="rounded-full bg-white/15 px-3 py-1 text-sm font-black">{progress.completedMissionIds.filter((id) => SKY_SHAPE_MISSION_BY_ID[id]?.episodeId === episode.id).length}/{episode.missions.length} saved</p>
        </div>
        <div className={`flex flex-wrap items-center gap-2 px-1 sm:px-3 lg:col-span-2 ${traceReady ? 'hidden sm:flex' : ''}`}>
          <div className="h-3 min-w-36 flex-1 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-emerald-400 transition-all" style={{ width: `${overallProgress}%` }} /></div>
          <span className="w-12 text-right text-sm font-black">{overallProgress}%</span>
          <span className="rounded-xl bg-amber-300 px-2 py-1 text-sm font-black text-amber-950">{starsShown ? `${'★'.repeat(starsShown)}${'☆'.repeat(3 - starsShown)}` : '☆☆☆'}</span>
        </div>
        <p className={`mx-1 rounded-xl bg-emerald-800 px-3 py-2 text-center text-xs font-black text-white sm:mx-3 sm:text-sm lg:col-span-2 ${traceReady ? 'hidden sm:block' : ''}`}>Start at green 1 → follow the dots and arrow → finish at the flag</p>
        <div className={`relative mx-auto overflow-hidden rounded-[1.6rem] border-2 border-sky-100/80 bg-gradient-to-b from-indigo-950 via-blue-900 to-sky-700 ${traceReady ? 'w-36 sm:w-full sm:max-w-[min(100%,76.9dvh)]' : 'w-full max-w-[min(100%,76.9dvh)]'} lg:mx-0 lg:max-w-full`}>
          <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden="true"><span className="absolute left-[12%] top-[18%] text-3xl">✦</span><span className="absolute right-[16%] top-[24%] text-2xl">✧</span><span className="absolute right-[28%] bottom-[16%] text-xl">✦</span></div>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="relative z-10 block h-auto w-full touch-none focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300"
            style={{ aspectRatio: `${VIEW_WIDTH}/${VIEW_HEIGHT}` }}
            role={traceReady ? 'img' : 'application'}
            tabIndex={traceReady ? -1 : 0}
            aria-label={traceReady ? `Completed route preview for ${mission?.name}.` : `Tracing board for ${mission?.name}. Start at the numbered circle and follow the glowing dots to the checkered flag. Press Enter, then Space or an arrow key to trace.`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopPointer}
            onPointerCancel={stopPointer}
            onKeyDown={handleKeyboardTrace}
          >
            <rect x="0" y="0" width={VIEW_WIDTH} height={VIEW_HEIGHT} fill="transparent" pointerEvents="all" aria-hidden="true" />
            {guidePaths.map((points, index) => {
              const pathString = points.map(pointString).join(' ');
              const complete = completedPaths.includes(index);
              const active = pathIndex === index && !traceReady;
              const trail = trails[index] || [];
              const visited = visitedByPath[index] || 0;
              const start = points[0] || [500, 330];
              const end = points[points.length - 1] || start;
              const arrowIndex = Math.min(points.length - 1, Math.max(1, Math.floor(points.length * 0.12)));
              const arrowPoint = points[arrowIndex] || start;
              const arrowNext = points[Math.min(points.length - 1, arrowIndex + 1)] || arrowPoint;
              const arrowAngle = Math.atan2(arrowNext[1] - arrowPoint[1], arrowNext[0] - arrowPoint[0]) * (180 / Math.PI);
              const flag = skyFinishFlagPosition(start, end);
              return (
                <g key={mission?.paths[index]?.id} aria-hidden="true">
                  <polyline points={pathString} fill="none" stroke={complete ? '#34d399' : 'rgba(255,255,255,.92)'} strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 18" />
                  <polyline points={pathString} fill="none" stroke={active ? '#fde68a' : 'rgba(147,197,253,.55)'} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 21" />
                  {visited > 1 && <polyline points={points.slice(0, visited).map(pointString).join(' ')} fill="none" stroke="#34d399" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />}
                  {trail.length > 1 && <polyline points={trail.map(pointString).join(' ')} fill="none" stroke="#f97316" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" opacity=".8" />}
                  {!complete && <path d="M -14 -10 L 14 0 L -14 10 Z" transform={`translate(${arrowPoint[0]} ${arrowPoint[1]}) rotate(${arrowAngle})`} fill="#fde047" stroke="#0f172a" strokeWidth="3" />}
                  <circle cx={start[0]} cy={start[1]} r={active ? 33 : 22} fill={complete ? '#059669' : active ? '#16a34a' : '#075985'} stroke="#fff" strokeWidth="8" />
                  <text x={start[0]} y={start[1] + 8} textAnchor="middle" fontSize="24" fontWeight="900" fill="#fff">{index + 1}</text>
                  <g transform={`translate(${flag.x} ${flag.y})`}>
                    <path d="M0 -34 V24" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
                    <path d="M3 -32 H44 V-4 H3 Z" fill="#fff" stroke="#0f172a" strokeWidth="3" />
                    <path d="M3 -32 H23.5 V-18 H3 Z M23.5 -18 H44 V-4 H23.5 Z" fill="#0f172a" />
                    {complete && <path d="M10 -17 l7 7 l14 -16" fill="none" stroke="#059669" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />}
                  </g>
                </g>
              );
            })}
            {routeStarted && <g transform={`translate(${hotPoint[0]} ${hotPoint[1]})`} aria-hidden="true"><circle r="40" fill="rgba(253,230,138,.3)" /><text textAnchor="middle" y="16" fontSize="58">✈️</text></g>}
          </svg>
        </div>

        <div className="rounded-2xl border-2 border-white/20 bg-white/10 p-3 text-center">
          {!traceReady && <p className="mx-auto mb-2 max-w-3xl rounded-xl bg-indigo-200/15 px-3 py-2 text-sm font-bold text-indigo-50"><span className="font-black text-yellow-200">Tracing tip: </span>{SKY_SHAPE_TEACHING[mission?.id]?.strategy}</p>}
          <p className="min-h-12 text-base font-black sm:text-lg" role="status" aria-live="polite">{traceReady ? keyboardCompletion ? 'Keyboard-guided completion · 1 participation star.' : `${missionAccuracy}% route accuracy · ${missionStars} of 3 accuracy stars.` : feedback}</p>
          {traceReady && <p className="mt-1 hidden text-sm font-bold text-sky-50 sm:block">{keyboardCompletion ? 'Supported keyboard route. You completed the ordered path.' : !hadMiss && !hadHint ? 'Independent tracing: no hints or retries used.' : 'Supported practice: a hint or retry helped you finish.'}</p>}
          {traceReady && <p className="mx-auto mt-2 max-w-3xl rounded-xl border border-emerald-200/50 bg-emerald-100/15 px-3 py-2 text-sm font-bold text-emerald-50" role="status">Shape idea: {SKY_SHAPE_TEACHING[mission?.id]?.explanation}</p>}
          {traceReady && flightSaveState === 'saving' && <p className="mt-1 rounded-xl bg-amber-200 px-3 py-2 text-sm font-black text-amber-950" role="status">Checking the saved flight and stars…</p>}
          {traceReady && flightSaveState === 'failed' && <div className="mt-1 rounded-xl bg-amber-100 px-3 py-2 text-sm font-bold text-amber-950" role="alert"><p>{flightSaveError || rewardError || 'This result is held until it can be saved.'}</p><button type="button" disabled={rewardBusy} onClick={retrySavedProgress} className="mt-2 min-h-12 rounded-lg bg-amber-800 px-4 font-black text-white disabled:opacity-60">{rewardBusy ? 'Checking saved stars…' : flightSaveError.startsWith('Your flight is saved') ? 'Retry saved stars' : 'Retry saving flight'}</button></div>}
          {traceReady && flightSaveState === 'saved' && <p className="mt-1 rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-sky-50">Your best flight rating is saved. {newMissionStars > 0 ? `${newMissionStars} new ${newMissionStars === 1 ? 'star' : 'stars'} added to your collection!` : 'Try a new mission to collect more stars.'}</p>}
          {traceReady && flightSaveState === 'saved' && chapterBonusStars > 0 && <p className="mt-1 font-black text-yellow-200">Aviator badge saved · {chapterBonusStars} bonus stars added!</p>}
          {traceReady && flightSaveState === 'saved' && <div className="mt-2 hidden justify-center gap-2 text-3xl sm:flex" aria-label={keyboardCompletion ? 'Keyboard-guided completion: 1 participation star' : `${missionStars} of 3 accuracy stars`}>{Array.from({ length: 3 }, (_, index) => <span key={index} aria-hidden="true" className={index < missionStars ? 'text-yellow-300' : 'text-white/35'}>★</span>)}</div>}
          <div className={`mt-3 grid justify-center gap-2 ${traceReady ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
            <button type="button" onClick={speakPrompt} className="min-h-12 rounded-xl bg-white px-3 py-2 font-black text-sky-900"><Volume2 size={18} className="mr-1 inline" />Hear mission again</button>
            {!traceReady && <button type="button" onClick={showHint} className="min-h-12 rounded-xl bg-amber-300 px-3 py-2 font-black text-amber-950">Show a tracing hint</button>}
            {!traceReady && <button type="button" onClick={resetMission} className="min-h-12 rounded-xl bg-white/20 px-3 py-2 font-black text-white" aria-label="Restart this flight"><RotateCcw size={18} className="mr-1 inline" />Restart flight</button>}
            {traceReady && <button type="button" disabled={flightSaveState !== 'saved' || rewardBusy || Boolean(rewardError) || !progressState.ok || pendingSkyShapesRewards(progressState.progress).length > 0} onClick={continueMission} className="min-h-12 rounded-xl bg-emerald-400 px-3 py-2 font-black text-emerald-950 shadow-lg disabled:cursor-not-allowed disabled:opacity-50">{roundIndex + 1 < queue.length ? 'Next mission' : 'Complete this sky'}</button>}
          </div>
          {!traceReady && <p className="mt-3 text-xs font-bold text-sky-50">Keyboard: focus the outline, press Enter to begin, then press Space, Enter, or an arrow key to guide the jet along the glowing dots.</p>}
        </div>
        <div className="sr-only" aria-live="polite">{traceReady ? flightSaveState === 'saved' ? 'Flight finished. Your stars are saved.' : flightSaveState === 'failed' ? 'Flight result is held. Retry saving before continuing.' : 'Flight finished. Checking saved progress.' : `Part ${pathIndex + 1} of ${totalPathCount}. Follow the glowing dots to the flag.`}</div>
      </main>
    </div>
  );
};

export default JetSkyShapes;
