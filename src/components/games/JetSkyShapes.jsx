import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { SoundToggle } from '../shared/index.jsx';
import {
  SKY_SHAPE_EPISODES, SKY_SHAPE_MISSION_BY_ID, createSkyRunSeed, skyAccuracyStars, skyMissionQueueForEpisode, tracePointsForOutline,
  skyLearningAttemptDetail, skyTraceProgressPercent,
} from '../../data/skyShapes.js';
import {
  getSkyShapesProgress, recordSkyEpisodeReward, recordSkyMissionCompletion, rememberSkyMissionQueue,
  skyRewardCallbackUnits, SKY_CHAPTER_BONUS_STARS,
} from '../../data/skyShapesProgress.js';

const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 650;
const PRAISE = ['Brilliant flying!', 'Beautiful outline!', 'Fantastic tracing!', 'You guided the jet!'];
const pointString = (point) => `${point[0]},${point[1]}`;
const percentFor = (done, all) => all ? Math.min(100, Math.round((done / all) * 100)) : 0;

const SkyShapeEpisodeCard = ({ episode, index, progress, selected, disabled, onSelect }) => {
  const episodeComplete = progress.completedEpisodeIds.includes(episode.id);
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
  const currentTrailRef = useRef([]);
  const attemptedMovesRef = useRef(0);
  const onRouteMovesRef = useRef(0);
  const missesRef = useRef(0);
  const missLoggedRef = useRef(false);
  const [progress, setProgress] = useState(() => getSkyShapesProgress(playerId));
  const [episodeIndex, setEpisodeIndex] = useState(() => getSkyShapesProgress(playerId).unlockedEpisode);
  const [phase, setPhase] = useState('start');
  const [queue, setQueue] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [runSeed, setRunSeed] = useState(null);
  const [pathIndex, setPathIndex] = useState(0);
  const [cursorIndex, setCursorIndex] = useState(0);
  const [completedPaths, setCompletedPaths] = useState([]);
  const [trails, setTrails] = useState([]);
  const [visitedByPath, setVisitedByPath] = useState([]);
  const [attemptedMoves, setAttemptedMoves] = useState(0);
  const [onRouteMoves, setOnRouteMoves] = useState(0);
  const [traceReady, setTraceReady] = useState(false);
  const [missionAccuracy, setMissionAccuracy] = useState(0);
  const [missionStars, setMissionStars] = useState(1);
  const [feedback, setFeedback] = useState('Choose a sky, then follow each glowing outline.');
  const [hadHint, setHadHint] = useState(false);
  const [hadMiss, setHadMiss] = useState(false);
  const [episodeBadge, setEpisodeBadge] = useState(false);

  const episode = SKY_SHAPE_EPISODES[episodeIndex] || SKY_SHAPE_EPISODES[0];
  const mission = queue[roundIndex] || null;
  const guidePaths = useMemo(() => mission?.paths.map((path) => tracePointsForOutline(path)) || [], [mission]);
  const guideTolerance = episodeIndex === 0 ? 82 : episodeIndex === 1 ? 68 : 56;
  const overallProgress = skyTraceProgressPercent(guidePaths, pathIndex, cursorIndex, traceReady);

  useEffect(() => { onPhaseChange?.(phase); }, [onPhaseChange, phase]);

  useEffect(() => {
    speak('Choose a sky. Start each outline at its green dot and follow the glowing route.');
  }, [speak]);

  useEffect(() => {
    if (phase !== 'play' || !mission || !Number.isSafeInteger(runSeed)) return;
    onGameEvent?.('jet', 'scene', { level: episodeIndex, round: roundIndex, seed: runSeed, difficulty: episode.band });
    onGameEvent?.('jet', 'question', { level: episodeIndex, round: roundIndex, seed: runSeed, difficulty: episode.band });
    speak(`Sky ${episodeIndex + 1}. Trace the ${mission.name}. Start at the green dot.`);
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
    onRouteMovesRef.current = 0;
    missesRef.current = 0;
    missLoggedRef.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPathIndex(0);
    setCursorIndex(0);
    setCompletedPaths([]);
    setTrails(mission.paths.map(() => []));
    setVisitedByPath(mission.paths.map(() => 0));
    setAttemptedMoves(0);
    setOnRouteMoves(0);
    setTraceReady(false);
    setMissionAccuracy(0);
    setMissionStars(1);
    setHadHint(false);
    setHadMiss(false);
    setFeedback(`Start at the green 1. Trace the ${mission.shape} outline.`);
  }, [mission?.id, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const startSky = (selectedEpisode = episodeIndex) => {
    const selected = SKY_SHAPE_EPISODES[selectedEpisode];
    const latest = getSkyShapesProgress(playerId);
    const completed = latest.completedMissionIds;
    const allDone = selected.missions.every((item) => completed.includes(item.id));
    const available = allDone ? selected.missions : selected.missions.filter((item) => !completed.includes(item.id));
    const seed = createSkyRunSeed();
    const planned = skyMissionQueueForEpisode(selectedEpisode, seed, latest.recentMissionIds).filter((item) => available.some((remaining) => remaining.id === item.id));
    const finalQueue = planned.length ? planned : skyMissionQueueForEpisode(selectedEpisode, seed, []);
    rememberSkyMissionQueue(playerId, finalQueue.map((item) => item.id));
    setProgress(getSkyShapesProgress(playerId));
    setEpisodeIndex(selectedEpisode);
    setQueue(finalQueue);
    setRoundIndex(0);
    setRunSeed(seed);
    setEpisodeBadge(false);
    setPhase('play');
    playSfx('launch');
    if (latest.completedEpisodeIds.includes(selected.id)) {
      onGameEvent?.('jet', 'replay', { level: selectedEpisode, round: 0, seed, difficulty: selected.band });
    }
    onGameEvent?.('jet', 'start', { level: selectedEpisode, round: 0, seed, difficulty: selected.band });
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
    const points = guidePaths[index];
    if (!points?.length) return;
    const bounded = Math.max(0, Math.min(points.length - 1, nextCursor));
    const previousCursor = cursorRef.current;
    const added = points.slice(previousCursor + (routeStartedRef.current ? 1 : 0), bounded + 1);
    routeStartedRef.current = true;
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
        const sampleCount = attemptedMovesRef.current || 1;
        const accuracy = Math.round((onRouteMovesRef.current / sampleCount) * 100);
        const stars = skyAccuracyStars(accuracy);
        setMissionAccuracy(accuracy);
        setMissionStars(stars);
        setFeedback(`${accuracy}% on the glowing route. You earned ${stars} ${stars === 1 ? 'star' : 'stars'}!`);
        onGameEvent?.('jet', 'answer_correct', { level: episodeIndex, round: roundIndex, seed: runSeed, firstAttempt: !hadMiss && !hadHint, difficulty: episode.band });
        onGameEvent?.('jet', 'learning_attempt', skyLearningAttemptDetail({
          level: episodeIndex, round: roundIndex, seed: runSeed, difficulty: episode.band,
          missionId: mission.id, accuracy, firstAttempt: !hadMiss && !hadHint, hints: hadHint ? 1 : 0,
        }));
        speak(`${mission.name} traced. Your trail stayed on the path ${accuracy} percent of the time.`);
        playSfx('success');
      } else {
        const nextPath = index + 1;
        pathIndexRef.current = nextPath;
        cursorRef.current = 0;
        routeStartedRef.current = false;
        setPathIndex(nextPath);
        setCursorIndex(0);
        setFeedback(`Nice outline! Start at the next green dot, number ${nextPath + 1}.`);
      }
      return;
    }
    setFeedback((completedPaths.length > 0 || index > 0) ? `Good flying. ${percentFor(donePoints, totalPoints)}% of this outline is traced.` : `Follow the glowing route to the red finish dot. ${percentFor(donePoints, totalPoints)}% traced.`);
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
    onRouteMovesRef.current += 1;
    setOnRouteMoves(onRouteMovesRef.current);
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
    const index = pathIndexRef.current;
    const points = guidePaths[index];
    if (!points?.length) return;
    if (!routeStartedRef.current) {
      attemptedMovesRef.current += 1;
      onRouteMovesRef.current += 1;
      setAttemptedMoves(attemptedMovesRef.current);
      setOnRouteMoves(onRouteMovesRef.current);
      setGuidedProgress(index, 0);
      setFeedback('Keyboard flight started. Press Space or an arrow key to follow each glowing dot.');
      return;
    }
    attemptedMovesRef.current += 1;
    onRouteMovesRef.current += 1;
    setAttemptedMoves(attemptedMovesRef.current);
    setOnRouteMoves(onRouteMovesRef.current);
    setGuidedProgress(index, Math.min(points.length - 1, cursorRef.current + Math.max(2, Math.ceil(points.length / 18))));
  };

  const showHint = () => {
    if (!mission || traceReady) return;
    setHadHint(true);
    setFeedback(pathIndex === 0 && cursorIndex === 0 ? 'Begin at green 1, then follow the glowing dots in order.' : `Continue at green dot ${pathIndex + 1}. Trace close to the bright line.`);
    onGameEvent?.('jet', 'hint', { level: episodeIndex, round: roundIndex, seed: runSeed, difficulty: episode.band, hintType: 'instructions' });
    speak(pathIndex === 0 && cursorIndex === 0 ? 'Begin at green one, then follow the glowing dots in order.' : `Continue at the next green dot. Stay close to the bright line.`);
  };

  const speakPrompt = () => {
    if (!mission) return;
    onGameEvent?.('jet', 'hint', { level: episodeIndex, round: roundIndex, seed: runSeed, difficulty: episode.band, hintType: 'replay_clue' });
    speak(`Trace the ${mission.name}. Start at the green dot and follow the glowing route.`);
  };

  const continueMission = () => {
    if (!mission || !traceReady) return;
    const result = recordSkyMissionCompletion(playerId, mission.id, missionAccuracy, missionStars);
    if (!result) return;
    setProgress(result.progress);
    if (result.awardedStars > 0) onCelebrate(`${mission.name} complete!`, skyRewardCallbackUnits(result.awardedStars), 0, 'jet');
    if (roundIndex < queue.length - 1) {
      setRoundIndex((index) => index + 1);
      setHadHint(false);
      setHadMiss(false);
      return;
    }
    const allMissionStars = episode.missions.map((item) => result.progress.bestMissionStars[item.id] || (item.id === mission.id ? missionStars : 1));
    const chapterStars = Math.max(1, Math.min(3, Math.round(allMissionStars.reduce((sum, value) => sum + value, 0) / allMissionStars.length)));
    const reward = recordSkyEpisodeReward(playerId, episode.id, chapterStars);
    setEpisodeBadge(true);
    setProgress(reward?.progress || result.progress);
    onGameEvent?.('jet', 'level_complete', { level: episodeIndex, round: roundIndex, seed: runSeed, difficulty: episode.band });
    if (result.newlyCompletedEpisode) {
      onCelebrate(`${episode.title} Aviator badge earned!`, skyRewardCallbackUnits(SKY_CHAPTER_BONUS_STARS), 0, 'jet');
    }
    setFeedback(`${episode.title} complete. Your best sky flight is ${reward?.bestStars || chapterStars} stars.`);
    setPhase('done');
    playSfx('complete');
  };

  const resetMission = () => {
    if (!mission || traceReady) return;
    if (routeStartedRef.current || attemptedMovesRef.current) registerMiss('Fresh route ready. Start at the green dot and try the glowing path again.');
    pathIndexRef.current = 0;
    cursorRef.current = 0;
    routeStartedRef.current = false;
    routeFinishedRef.current = false;
    attemptedMovesRef.current = 0;
    onRouteMovesRef.current = 0;
    missesRef.current = 0;
    missLoggedRef.current = false;
    setPathIndex(0);
    setCursorIndex(0);
    setCompletedPaths([]);
    setTrails(mission.paths.map(() => []));
    setVisitedByPath(mission.paths.map(() => 0));
    setAttemptedMoves(0);
    setOnRouteMoves(0);
    setTraceReady(false);
    setMissionAccuracy(0);
    setHadMiss(false);
    setFeedback('Start at the green dot and trace the route again.');
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
        <main className="mx-auto mt-5 max-w-6xl">
          <p className="mx-auto mb-4 max-w-2xl rounded-2xl bg-white/85 px-4 py-3 text-center text-base font-bold text-sky-950 sm:text-lg">Trace a glowing outline with your finger or mouse. Use Enter and Space to guide the jet from a keyboard.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {SKY_SHAPE_EPISODES.map((entry, index) => (
              <SkyShapeEpisodeCard key={entry.id} episode={entry} index={index} progress={progress} selected={episodeIndex === index} disabled={index > progress.unlockedEpisode} onSelect={() => setEpisodeIndex(index)} />
            ))}
          </div>
          <section className="mt-5 rounded-[2rem] border-4 border-white/80 bg-white/85 p-4 shadow-xl sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div><p className="text-xs font-black uppercase tracking-widest text-sky-700">{episode.band} sky</p><h2 className="text-2xl font-black text-slate-900 sm:text-3xl">{episode.title}</h2><p className="mt-1 max-w-xl text-sm font-bold text-slate-600 sm:text-base">{episode.subtitle}</p></div>
              <div className="rounded-2xl bg-sky-100 px-4 py-2 text-sm font-black text-sky-950">{episode.missions.filter((item) => progress.completedMissionIds.includes(item.id)).length} of {episode.missions.length} missions earned</div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {episode.missions.map((entry) => {
                const done = progress.completedMissionIds.includes(entry.id);
                return <div key={entry.id} className="flex min-h-14 items-center gap-3 rounded-xl bg-sky-50 px-3 py-2"><span className="text-2xl">{done ? '✅' : entry.icon}</span><span className="font-black">{entry.name}</span>{done && <span className="ml-auto text-sm font-black text-amber-700">{progress.bestMissionStars[entry.id] || 1}★</span>}</div>;
              })}
            </div>
            <button type="button" onClick={() => startSky(episodeIndex)} className="mt-5 min-h-16 w-full rounded-2xl bg-sky-700 px-6 py-3 text-lg font-black text-white shadow-[0_6px_0_#075985] hover:bg-sky-800 active:translate-y-1 active:shadow-none">{progress.completedEpisodeIds.includes(episode.id) ? 'Replay this sky' : 'Start this sky'}</button>
          </section>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {progress.completedEpisodeIds.map((id) => <div key={id} className="flex items-center gap-2 rounded-full border-2 border-amber-300 bg-amber-50 px-4 py-2 font-black text-amber-900"><Sparkles size={18} />{SKY_SHAPE_EPISODES.find((entry) => entry.id === id)?.title} Aviator</div>)}
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
  const roundedAccuracy = attemptedMoves ? Math.round((onRouteMoves / attemptedMoves) * 100) : 0;
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

      <main className="mx-auto mt-3 max-w-6xl rounded-[2rem] border-4 border-white/80 bg-sky-950/80 p-2.5 text-white shadow-2xl sm:mt-5 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 sm:px-3">
          <div><p className="text-xs font-black uppercase tracking-widest text-sky-200">Mission {roundIndex + 1} · {episode.band}</p><p className="text-lg font-black sm:text-xl">{mission?.icon} Trace each outline part in order · {completedPaths.length}/{totalPathCount}</p></div>
          <p className="rounded-full bg-white/15 px-3 py-1 text-sm font-black">{progress.completedMissionIds.filter((id) => SKY_SHAPE_MISSION_BY_ID[id]?.episodeId === episode.id).length}/{episode.missions.length} saved</p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 px-1 sm:px-3">
          <div className="h-3 min-w-36 flex-1 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-emerald-400 transition-all" style={{ width: `${overallProgress}%` }} /></div>
          <span className="w-12 text-right text-sm font-black">{overallProgress}%</span>
          <span className="rounded-xl bg-amber-300 px-2 py-1 text-sm font-black text-amber-950">{starsShown ? `${'★'.repeat(starsShown)}${'☆'.repeat(3 - starsShown)}` : '☆☆☆'}</span>
        </div>
        <div className="relative mt-3 overflow-hidden rounded-[1.6rem] border-2 border-sky-100/80 bg-gradient-to-b from-indigo-950 via-blue-900 to-sky-700">
          <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden="true"><span className="absolute left-[12%] top-[18%] text-3xl">✦</span><span className="absolute right-[16%] top-[24%] text-2xl">✧</span><span className="absolute right-[28%] bottom-[16%] text-xl">✦</span></div>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="relative z-10 block h-auto w-full touch-none focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300"
            style={{ aspectRatio: `${VIEW_WIDTH}/${VIEW_HEIGHT}` }}
            role="application"
            tabIndex={0}
            aria-label={`Tracing board for ${mission?.name}. Start at the green numbered dot. Press Enter, then Space or an arrow key to follow the glowing dots.`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopPointer}
            onPointerCancel={stopPointer}
            onKeyDown={handleKeyboardTrace}
          >
            {guidePaths.map((points, index) => {
              const pathString = points.map(pointString).join(' ');
              const complete = completedPaths.includes(index);
              const active = pathIndex === index && !traceReady;
              const trail = trails[index] || [];
              const visited = visitedByPath[index] || 0;
              const start = points[0] || [500, 330];
              const end = points[points.length - 1] || start;
              return (
                <g key={mission?.paths[index]?.id} aria-hidden="true">
                  <polyline points={pathString} fill="none" stroke={complete ? '#34d399' : 'rgba(255,255,255,.92)'} strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 18" />
                  <polyline points={pathString} fill="none" stroke={active ? '#fde68a' : 'rgba(147,197,253,.55)'} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 21" />
                  {visited > 1 && <polyline points={points.slice(0, visited).map(pointString).join(' ')} fill="none" stroke="#34d399" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />}
                  {trail.length > 1 && <polyline points={trail.map(pointString).join(' ')} fill="none" stroke="#f97316" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" opacity=".8" />}
                  <circle cx={start[0]} cy={start[1]} r={active ? 33 : 22} fill={complete ? '#059669' : active ? '#16a34a' : '#075985'} stroke="#fff" strokeWidth="8" />
                  <text x={start[0]} y={start[1] + 8} textAnchor="middle" fontSize="24" fontWeight="900" fill="#fff">{index + 1}</text>
                  <circle cx={end[0]} cy={end[1]} r="22" fill={complete ? '#10b981' : '#ef4444'} stroke="#fff" strokeWidth="7" />
                  {complete && <path d={`M${end[0] - 10} ${end[1]} l8 9 l16 -20`} fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />}
                </g>
              );
            })}
            <g transform={`translate(${hotPoint[0]} ${hotPoint[1]})`} aria-hidden="true"><circle r="40" fill="rgba(253,230,138,.3)" /><text textAnchor="middle" y="16" fontSize="58">✈️</text></g>
          </svg>
          <div className="absolute left-2 top-2 z-20 rounded-full bg-emerald-700/90 px-3 py-1 text-xs font-black text-white sm:left-4 sm:top-4">Green = start · Red = finish</div>
        </div>

        <div className="mt-3 rounded-2xl border-2 border-white/20 bg-white/10 p-3 text-center">
          <p className="min-h-12 text-base font-black sm:text-lg" role="status" aria-live="polite">{traceReady ? `${missionAccuracy}% accurate · ${missionStars} ${missionStars === 1 ? 'star' : 'stars'} earned.` : feedback}</p>
          {traceReady && <p className="mt-1 rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-sky-50">You followed {Math.round((missionAccuracy / 100) * 100)}% of your trail near the outline. Your sky-stars are saved with this mission.</p>}
          {traceReady && <div className="mt-2 flex justify-center gap-2 text-3xl" aria-label={`${missionStars} of 3 accuracy stars`}>{Array.from({ length: 3 }, (_, index) => <span key={index} aria-hidden="true" className={index < missionStars ? 'text-yellow-300' : 'text-white/35'}>★</span>)}</div>}
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={speakPrompt} className="min-h-12 rounded-xl bg-white px-4 py-2 font-black text-sky-900"><Volume2 size={18} className="mr-1 inline" />Hear mission again</button>
            <button type="button" onClick={showHint} disabled={traceReady} className="min-h-12 rounded-xl bg-amber-300 px-4 py-2 font-black text-amber-950 disabled:opacity-50">Show a tracing hint</button>
            <button type="button" onClick={resetMission} disabled={traceReady} className="min-h-12 rounded-xl bg-white/20 px-4 py-2 font-black text-white disabled:opacity-50" aria-label="Restart this flight"><RotateCcw size={18} className="mr-1 inline" />Restart flight</button>
            {traceReady && <button type="button" onClick={continueMission} className="min-h-12 rounded-xl bg-emerald-400 px-5 py-2 font-black text-emerald-950 shadow-lg">{roundIndex + 1 < queue.length ? 'Next mission' : 'Complete this sky'}</button>}
          </div>
          <p className="mt-3 text-xs font-bold text-sky-50">Keyboard: focus the outline, press Enter to begin, then press Space, Enter, or an arrow key to guide the jet along the glowing dots.</p>
        </div>
        <div className="sr-only" aria-live="polite">{`Guide ${pathIndex + 1} of ${totalPathCount}; ${roundedAccuracy}% of sampled moves are on the guide.`}</div>
      </main>
    </div>
  );
};

export default JetSkyShapes;
