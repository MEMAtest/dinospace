import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import CreativeCanvas from './CreativeCanvas.jsx';
import { FocusMenu } from '../shared/FocusMenu.jsx';
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

const JetSkyShapes = ({ onBack, playSfx = () => {}, soundOn, onToggleSound, speak = () => {}, onCelebrate = () => {}, onGameEvent, onPhaseChange, playerId = 'amari' }) => {
  const [freeDraw, setFreeDraw] = useState(true);
  const [optionsOpen, setOptionsOpen] = useState(false);
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

  const stopPointer = (event, cancelled = false) => {
    if (event && pointerRef.current.id !== event.pointerId) return;
    if (event && !cancelled && pointerRef.current.drawing) {
      const point = viewPoint(event);
      if (point) guidePointMove(point);
    }
    if (event && svgRef.current?.hasPointerCapture?.(event.pointerId)) svgRef.current.releasePointerCapture(event.pointerId);
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
    setFeedback(pathIndex === 0 && cursorIndex === 0 ? 'Begin at green 1, then follow the dots in order.' : `Continue at green dot ${pathIndex + 1}. Trace close to the bright line.`);
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

  const closeOptions = () => setOptionsOpen(false);
  const openOptions = () => setOptionsOpen(true);
  const canStart = progressState.ok && !rewardBusy && !pendingSkyShapesRewards(progressState.progress).length && !rewardError;
  const startLabel = pendingStartRef.current?.episodeIndex === episodeIndex ? 'Retry saving this sky' : `${confirmedEpisodeIds.includes(episode.id) ? 'Replay' : 'Start'}: ${episode.title}`;
  const nextEpisode = SKY_SHAPE_EPISODES[episodeIndex + 1];
  const options = [
    ...(phase === 'start' ? SKY_SHAPE_EPISODES.map((item, index) => ({
      label: item.title,
      description: `${item.subtitle} · ${item.missions.filter(flight => progress.completedMissionIds.includes(flight.id)).length} of ${item.missions.length} flights saved.`,
      button: 'Start this sky',
      disabled: !canStart || index > progress.unlockedEpisode,
      action: () => { closeOptions(); startSky(index); },
    })) : []),
    ...(phase === 'play' && !traceReady ? [
      { label: 'Show a tracing hint', action: () => { closeOptions(); showHint(); } },
      { label: 'Restart flight', action: () => { closeOptions(); resetMission(); } },
      { label: 'Keyboard help', description: 'Focus the tracing board. Press Enter, then Space or an arrow key to guide the jet.', button: 'Back to tracing', action: closeOptions },
    ] : []),
    ...(phase === 'play' && soundOn ? [{ label: 'Hear mission again', action: () => { closeOptions(); speakPrompt(); } }] : []),
    ...(phase === 'done' ? [
      { label: 'Replay this sky', action: () => { closeOptions(); startSky(episodeIndex); } },
      { label: 'Choose a sky', action: () => { closeOptions(); setPhase('start'); } },
    ] : []),
    { label: soundOn ? 'Turn sound off' : 'Turn sound on', action: () => { onToggleSound?.(); closeOptions(); } },
    { label: 'Back to Creative Lab', action: leaveGame },
  ];

  if (freeDraw) return <CreativeCanvas playerId={playerId} onBack={leaveGame} onLessons={() => setFreeDraw(false)} />;

  if (optionsOpen || phase === 'start' || phase === 'done') return <div className="focus-game sky-focused" data-board-focus="">
    <main className="focus-game-body is-menu">
      <header className="focus-game-heading"><h1>{phase === 'done' && !optionsOpen ? `${episode.title} complete!` : 'Sky Shapes'}</h1></header>
      {optionsOpen ? <FocusMenu key={phase} choices={options} onBack={closeOptions} /> : phase === 'start' ? <>
        <p className="focus-game-message">Trace the dotted outline from the green circle to the flag.</p>
        {(!progressState.ok || rewardError || startError) && <p className="focus-game-message" role="alert">{progressState.error || rewardError || startError}</p>}
        <div className="focus-game-actions">
          {!progressState.ok || rewardError
            ? <button type="button" className="focus-game-button is-primary" disabled={rewardBusy} onClick={retrySavedProgress}>Retry saved progress</button>
            : <button type="button" className="focus-game-button is-primary" disabled={!canStart} onClick={() => startSky()}>{startLabel}</button>}
          <button type="button" className="focus-game-button" onClick={() => setFreeDraw(true)}>Free draw</button>
          <button type="button" className="focus-game-button" onClick={openOptions}>Options</button>
        </div>
      </> : <>
        <p className="focus-game-message">{episodeBadge ? 'Your Aviator badge and flight stars are saved.' : 'Your best flight results are saved.'}</p>
        <div className="focus-game-actions">
          {nextEpisode && progress.unlockedEpisode > episodeIndex && <button type="button" className="focus-game-button is-primary" onClick={() => startSky(episodeIndex + 1)}>Next: {nextEpisode.title}</button>}
          <button type="button" className="focus-game-button" onClick={openOptions}>Options</button>
          <button type="button" className="focus-game-button" onClick={leaveGame}>Finish</button>
        </div>
      </>}
    </main>
  </div>;

  const totalPathCount = mission?.paths.length || 0;
  const activePath = guidePaths[pathIndex] || [];
  const hotPoint = activePath[cursorIndex] || activePath[0] || [500, 330];
  const canContinue = flightSaveState === 'saved' && !rewardBusy && !rewardError && progressState.ok && pendingSkyShapesRewards(progressState.progress).length === 0;

  return <div className="focus-game sky-focused" data-board-focus="">
    <main className="focus-game-body" data-sky-mission={mission?.id}>
      <header className="focus-game-heading">
        <p>Sky Shapes · Flight {roundIndex + 1} of {queue.length}{totalPathCount > 1 && !traceReady ? ` · Part ${pathIndex + 1} of ${totalPathCount}` : ''}</p>
        <h1>{traceReady ? `${mission?.name} finished!` : `Trace the ${mission?.name.toLowerCase()}`}</h1>
      </header>
      {!traceReady && <p className="focus-game-message">Start at the green dot. Follow the line to the flag.</p>}
      <div className={`sky-focus-paper${traceReady ? ' is-finished' : ''}`}>
            <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="relative z-10 block h-auto w-full touch-none focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300"
            style={{ aspectRatio: `${VIEW_WIDTH}/${VIEW_HEIGHT}` }}
            role={traceReady ? 'img' : 'application'}
            tabIndex={traceReady ? -1 : 0}
            aria-label={traceReady ? `Completed route preview for ${mission?.name}.` : `Tracing board for ${mission?.name}. Start at the numbered circle and follow the dots to the checkered flag. Press Enter, then Space or an arrow key to trace.`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopPointer}
            onPointerCancel={event => stopPointer(event, true)}
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
                  <polyline points={pathString} fill="none" stroke={complete ? '#078458' : active ? '#657387' : '#aeb9c8'} strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 18" />
                  <polyline points={pathString} fill="none" stroke={active ? '#dce7f5' : '#f2f5fa'} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 21" />
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

      {!traceReady && <>
        <progress className="sky-focus-progress" aria-label="Tracing progress" value={overallProgress} max={100} />
        <p className="focus-game-message" role="status">{feedback}</p>
      </>}
      {traceReady && <>
        <p className="focus-game-message" role="status">{keyboardCompletion ? 'Keyboard-guided completion · 1 participation star.' : `${missionAccuracy}% accuracy · ${missionStars} of 3 stars.`}</p>
        {!keyboardCompletion && (hadMiss || hadHint) && <p className="text-sm">Completed with a hint or retry.</p>}
        <p className="pattern-focus-explanation">{SKY_SHAPE_TEACHING[mission?.id]?.explanation}</p>
        {flightSaveState === 'saving' && <p role="status">Saving flight and stars…</p>}
        {flightSaveState === 'failed' && <p role="alert" className="focus-game-message">{flightSaveError || rewardError || 'This flight is held until it can be saved.'}</p>}
        {flightSaveState === 'saved' && <p className="focus-game-message">{chapterBonusStars ? 'Aviator badge saved.' : newMissionStars ? `${newMissionStars} new ${newMissionStars === 1 ? 'star' : 'stars'} saved.` : 'Your best result is saved.'}</p>}
      </>}
      <div className="focus-game-actions mt-3">
        {traceReady && (flightSaveState === 'failed'
          ? <button type="button" className="focus-game-button is-primary" disabled={rewardBusy} onClick={retrySavedProgress}>{flightSaveError.startsWith('Your flight is saved') ? 'Retry saved stars' : 'Retry saving flight'}</button>
          : canContinue && <button type="button" className="focus-game-button is-primary" onClick={continueMission}>{roundIndex + 1 < queue.length ? 'Next mission' : 'Complete this sky'}</button>)}
        <button type="button" className="focus-game-button" onClick={openOptions}>Options</button>
      </div>
    </main>
  </div>;
};

export default JetSkyShapes;
