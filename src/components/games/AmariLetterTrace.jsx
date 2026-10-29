import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, Lightbulb, Volume2 } from 'lucide-react';
import { makeLearningEvent } from '../../data/literacy.js';
import {
  completeLetterTraceLevel,
  AMARI_TRACE_NARRATION,
  advanceTraceSegment,
  getLetterTraceProgress,
  interpolateGuidePoint,
  LETTER_TRACE_LEVELS,
  LETTER_TRACE_ROUNDS_PER_LEVEL,
  makeLetterTraceRun,
  makeTraceWordChoices,
  recordLetterTraceMastery,
  recordLetterTracePractice,
  resetUnfinishedTraceStroke,
  isTraceDotStroke,
  traceToleranceForSize,
} from '../../data/letterTraceLearning.js';
import { getLetterStrokes } from './LetterTrace.jsx';
import { SPELLING_WORD_ART } from '../../data/spellingStudio.js';
import './AmariLetterTrace.css';
export { AMARI_TRACE_NARRATION } from '../../data/letterTraceLearning.js';

const getSeed = () => {
  if (globalThis.crypto?.getRandomValues) {
    const value = new Uint32Array(1);
    globalThis.crypto.getRandomValues(value);
    return value[0];
  }
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
};

const phaseName = (phase) => ({ map: 'intro', play: 'play', complete: 'complete' })[phase] || phase;
const noopCancel = () => {};

const AmariLetterTrace = ({
  onBack,
  playSfx = () => {},
  soundOn = false,
  onToggleSound,
  speak = () => {},
  cancelNarration = noopCancel,
  onCelebrate = () => {},
  onGameEvent,
  onPhaseChange,
  playerId = 'amari',
}) => {
  const [activeLevel, setActiveLevel] = useState(() => getLetterTraceProgress(playerId).unlocked);
  const level = activeLevel;
  const canvasRef = useRef(null);
  const guideRef = useRef([]);
  const strokeStateRef = useRef({ cursors: [], completed: 0, on: 0, off: 0, paths: [] });
  const pointerRef = useRef({ active: false, id: null, last: null });
  const chapterPickerRef = useRef(null);
  const keyboardRef = useRef({ cursor: 0, active: false });
  const progressAtStartRef = useRef(null);
  const lastCompletionRef = useRef(null);
  const [phase, setPhase] = useState('map');
  const [run, setRun] = useState(() => makeLetterTraceRun({ seed: getSeed(), level }));
  const [roundIndex, setRoundIndex] = useState(0);
  const [letter, setLetter] = useState(() => run.rounds[0] || { lower: 'a', upper: 'A', requested: 'A' });
  const [traceProgress, setTraceProgress] = useState(0);
  const [traceReady, setTraceReady] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [hadIncorrectResponse, setHadIncorrectResponse] = useState(false);
  const [feedback, setFeedback] = useState(AMARI_TRACE_NARRATION[0]);
  const [roundPassed, setRoundPassed] = useState(false);
  const [wordChoices, setWordChoices] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [mastery, setMastery] = useState(() => getLetterTraceProgress(playerId));
  const [showGuide, setShowGuide] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState(false);
  const [error, setError] = useState('');
  const [demoVersion, setDemoVersion] = useState(0);
  const demoRef = useRef(null);
  const usedKeyboardRef = useRef(false);

  const chapter = LETTER_TRACE_LEVELS[level];
  const traceLetter = letter.requested || (level === 2 ? letter.lower : letter.upper);
  const storyChoices = useMemo(() => wordChoices, [wordChoices]);
  // The drawing effect updates guideRef after render. Derive the announced
  // count from this letter so a new round never announces the previous guide.
  const currentStrokeCount = getLetterStrokes(traceLetter, 100, 100).length || 1;
  const strokeAnnouncement = traceReady || roundPassed
    ? `Trace ${traceLetter}. All ${currentStrokeCount} strokes complete.`
    : `Trace ${traceLetter}. Stroke ${Math.min(strokeStateRef.current.completed + 1, currentStrokeCount)} of ${currentStrokeCount}.`;

  useEffect(() => { onPhaseChange?.(phaseName(phase)); }, [onPhaseChange, phase]);
  useEffect(() => { if (keyboardMode && phase === 'play') canvasRef.current?.focus(); }, [keyboardMode, phase]);
  useEffect(() => {
    setMastery(getLetterTraceProgress(playerId));
  }, [playerId]);
  useEffect(() => () => cancelNarration(), [cancelNarration]);

  const say = useCallback((text) => {
    if (soundOn && text) speak(text, { premium: false });
  }, [soundOn, speak]);

  const currentRound = useCallback((nextRun, index) => nextRun.rounds[index] || null, []);
  const resetRoundState = useCallback((nextLetter) => {
    guideRef.current = [];
    strokeStateRef.current = { cursors: [], completed: 0, on: 0, off: 0, paths: [] };
    pointerRef.current = { active: false, id: null, last: null };
    keyboardRef.current = { cursor: 0, active: false };
    setLetter(nextLetter);
    setTraceProgress(0);
    setTraceReady(false);
    setHintUsed(false);
    setHintCount(0);
    setFirstTry(true);
    setHadIncorrectResponse(false);
    setRoundPassed(false);
    setWordChoices([]);
    setSelectedWord(null);
    setError('');
    setShowGuide(false);
    demoRef.current = null;
    usedKeyboardRef.current = false;
    setKeyboardMode(false);
    setFeedback(AMARI_TRACE_NARRATION[0]);
  }, []);

  const beginChapter = useCallback((retry = false, requestedLevel = level) => {
    const saved = getLetterTraceProgress(playerId);
    const nextRun = makeLetterTraceRun({
      seed: getSeed(),
      level: requestedLevel,
      recentLetters: saved.recentByLevel[requestedLevel] || [],
    });
    if (nextRun.error) {
      setError('Choose at least eight taught letter sounds in the grown-ups learning settings before starting this chapter.');
      return;
    }
    if (requestedLevel > saved.unlocked) return;
    cancelNarration();
    setActiveLevel(requestedLevel);
    setRun(nextRun);
    setRoundIndex(0);
    resetRoundState(nextRun.rounds[0]);
    progressAtStartRef.current = saved;
    lastCompletionRef.current = null;
    onGameEvent?.('trace', retry ? 'replay' : 'start', { level: requestedLevel, round: 0, seed: nextRun.seed, difficulty: ['starter', 'growing', 'challenge'][requestedLevel] });
    window.scrollTo({top:0,left:0,behavior:'instant'});
    setPhase('play');
    playSfx('launch');
    say(AMARI_TRACE_NARRATION[0]);
  }, [cancelNarration, level, onGameEvent, playerId, playSfx, resetRoundState, say]);

  const drawGuide = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const ratio = Math.min(globalThis.devicePixelRatio || 1, 2);
    const width = Math.round(rect.width * ratio);
    const height = Math.round(rect.height * ratio);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const strokes = getLetterStrokes(traceLetter, rect.width, rect.height);
    guideRef.current = strokes;
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = '#f8fcff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    const activeStroke = Math.min(strokeStateRef.current.completed, strokes.length - 1);
    strokes.forEach((stroke, index) => {
      ctx.beginPath();
      stroke.forEach((point, pointIndex) => pointIndex === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y));
      ctx.strokeStyle = index < strokeStateRef.current.completed ? 'rgba(22,163,74,.35)' : index === activeStroke && showGuide ? 'rgba(245,158,11,.92)' : 'rgba(37,99,235,.35)';
      ctx.lineWidth = index === activeStroke && showGuide ? 34 : 25;
      ctx.setLineDash(index < strokeStateRef.current.completed ? [] : [4, 11]);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.setLineDash([]);
      // Show the direction on the visible path, including curved strokes.
      // Start numbers remain on top of these arrows below.
      if (stroke.length > 2 && strokeStateRef.current.completed < strokes.length) {
        const arrowIndexes = [...new Set([Math.floor((stroke.length - 1) / 3), Math.floor(2 * (stroke.length - 1) / 3)])].filter((pointIndex) => pointIndex > 0);
        arrowIndexes.forEach((pointIndex) => {
          const from = stroke[pointIndex - 1];
          const to = stroke[pointIndex];
          const angle = Math.atan2(to.y - from.y, to.x - from.x);
          ctx.save();
          ctx.translate(to.x, to.y);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.moveTo(9, 0);
          ctx.lineTo(-6, -6);
          ctx.lineTo(-6, 6);
          ctx.closePath();
          ctx.fillStyle = index < strokeStateRef.current.completed ? '#15803d' : index === activeStroke ? '#1d4ed8' : '#64748b';
          ctx.fill();
          ctx.restore();
        });
      }
    });
    strokeStateRef.current.paths.forEach((path, index) => {
      if (path.length < 2) return;
      ctx.beginPath();
      path.forEach((point, pointIndex) => pointIndex === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y));
      ctx.strokeStyle = index < strokeStateRef.current.completed ? '#16a34a' : '#2563eb';
      ctx.lineWidth = 13;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });
    // Letter strokes can share a start point (for example D). Draw the
    // current start last so a future gray number cannot cover its green cue.
    if (strokeStateRef.current.completed < strokes.length) {
      const markerOrder = strokes.map((_, index) => index).filter((index) => index !== activeStroke);
      markerOrder.push(activeStroke);
      markerOrder.forEach((index) => {
        const stroke = strokes[index];
      const start = stroke[0];
      // Coverage is a high-water mark; the keyboard cursor may move back.
      // Paint its actual current position so rewind remains visible.
      const cursor = keyboardRef.current.cursor;
      const keyboardPoint = interpolateGuidePoint(stroke, cursor);
      ctx.beginPath();
      ctx.arc(start.x, start.y, 19, 0, Math.PI * 2);
      ctx.fillStyle = index <= strokeStateRef.current.completed ? '#15803d' : '#64748b';
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = '900 17px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(index + 1), start.x, start.y);
      if (index === activeStroke && keyboardMode && keyboardRef.current.active && keyboardPoint) {
        ctx.beginPath();
        ctx.arc(keyboardPoint.x, keyboardPoint.y, 13, 0, Math.PI * 2);
        ctx.fillStyle = '#f97316';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      });
    }

    if (demoRef.current && !pointerRef.current.active) {
      const stroke = strokes[activeStroke];
      const point = interpolateGuidePoint(stroke, demoRef.current.cursor * (stroke.length - 1));
      if (point) {
        ctx.beginPath(); ctx.arc(point.x, point.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#f97316'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.stroke();
      }
    }
  }, [keyboardMode, showGuide, traceLetter]);

  useEffect(() => {
    if (phase !== 'play') return undefined;
    drawGuide();
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(drawGuide) : null;
    observer?.observe(canvas);
    window.addEventListener('resize', drawGuide);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', drawGuide);
    };
  }, [drawGuide, phase, roundPassed]);

  useEffect(() => {
    if (!showGuide || traceReady || roundPassed || phase !== 'play') { demoRef.current = null; return undefined; }
    let frame;
    const started = performance.now();
    const animate = now => {
      const cursor = Math.min(1, (now - started) / 1800);
      demoRef.current = { cursor };
      drawGuide();
      if (cursor < 1) frame = requestAnimationFrame(animate);
      else { demoRef.current = null; drawGuide(); }
    };
    frame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frame); demoRef.current = null; };
  }, [showGuide, demoVersion, traceReady, roundPassed, phase, drawGuide]);

  const updateReady = useCallback(() => {
    const strokes = guideRef.current;
    const progress = strokes.reduce((total, stroke, index) => total + Math.max(0, Math.min(stroke.length - 1, strokeStateRef.current.cursors[index] ?? 0)), 0);
    const max = strokes.reduce((total, stroke) => total + Math.max(1, stroke.length - 1), 0);
    const percent = max ? Math.floor((progress / max) * 100) : 0;
    const all = strokes.length > 0 && strokeStateRef.current.completed >= strokes.length;
    setTraceProgress(all ? 100 : percent);
    setTraceReady(all);
    return all;
  }, []);

  const movePoint = useCallback((point) => {
    const canvas = canvasRef.current;
    if (!canvas || !pointerRef.current.active) return;
    const strokeIndex = strokeStateRef.current.completed;
    const stroke = guideRef.current[strokeIndex];
    if (!stroke) return;
    const cursor = strokeStateRef.current.cursors[strokeIndex] ?? 0;
    const bounds = canvas.getBoundingClientRect();
    const tolerance = traceToleranceForSize(bounds.width, bounds.height, level);
    const last = pointerRef.current.last;
    if (!last) return;
    const distance = Math.hypot(point.x - last.x, point.y - last.y);
    const traceStep = advanceTraceSegment(stroke, last, point, cursor, tolerance);
    if (traceStep.accepted) {
      strokeStateRef.current.cursors[strokeIndex] = Math.max(cursor, traceStep.cursor);
      strokeStateRef.current.on += distance;
    } else {
      strokeStateRef.current.off += distance;
      setFirstTry(false);
      setHadIncorrectResponse(true);
      setFeedback('That bit wandered off the path. Try the same stroke again.');
    }
    strokeStateRef.current.paths[strokeIndex] ||= [last];
    strokeStateRef.current.paths[strokeIndex].push(point);
    pointerRef.current.last = point;
    updateReady();
    drawGuide();
  }, [drawGuide, level, updateReady]);

  const pointFromEvent = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const startPointer = (event) => {
    if (roundPassed || keyboardMode || event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    setShowGuide(false);
    demoRef.current = null;
    const point = pointFromEvent(event);
    const index = strokeStateRef.current.completed;
    const stroke = guideRef.current[index];
    if (!stroke) return;
    const cursor = strokeStateRef.current.cursors[index] ?? 0;
    const anchor = interpolateGuidePoint(stroke, cursor);
    const rect = canvasRef.current.getBoundingClientRect();
    if (Math.hypot(point.x - anchor.x, point.y - anchor.y) > traceToleranceForSize(rect.width, rect.height, level)) {
      setFirstTry(false);
      setHadIncorrectResponse(true);
      setFeedback(`Begin this stroke at the green ${index + 1}.`);
      return;
    }
    pointerRef.current = { active: true, id: event.pointerId, last: point };
    canvasRef.current.setPointerCapture?.(event.pointerId);
    strokeStateRef.current.paths[index] = [point];
    if (isTraceDotStroke(stroke, 3)) {
      strokeStateRef.current.completed += 1;
      pointerRef.current.active = false;
      setFeedback(strokeStateRef.current.completed < guideRef.current.length ? 'Good dot. Lift, then start the next numbered stroke.' : 'All strokes are ready. Check your shape.');
      updateReady();
      drawGuide();
    }
  };
  const movePointer = (event) => {
    if (pointerRef.current.active && event.pointerId === pointerRef.current.id) {
      event.preventDefault();
      movePoint(pointFromEvent(event));
    }
  };
  const endPointer = (event) => {
    if (!pointerRef.current.active || event.pointerId !== pointerRef.current.id) return;
    const activeIndex = strokeStateRef.current.completed;
    const stroke = guideRef.current[activeIndex];
    const cursor = strokeStateRef.current.cursors[activeIndex] ?? 0;
    if (stroke && cursor >= stroke.length - 1) {
      strokeStateRef.current.completed += 1;
      setFeedback(strokeStateRef.current.completed < guideRef.current.length ? 'Stroke done. Lift, then start at the next green number.' : 'All strokes are ready. Check your shape.');
    } else if (stroke) {
      strokeStateRef.current = resetUnfinishedTraceStroke(strokeStateRef.current);
      setFirstTry(false);
      setHadIncorrectResponse(true);
      setFeedback(`Nice try. Start this stroke again at green ${activeIndex + 1}.`);
    }
    pointerRef.current = { active: false, id: null, last: null };
    updateReady();
    drawGuide();
    try { canvasRef.current.releasePointerCapture?.(event.pointerId); } catch { /* capture may already be released */ }
  };

  const cancelPointer = (event) => {
    if (!pointerRef.current.active || event.pointerId !== pointerRef.current.id) return;
    const activeIndex = strokeStateRef.current.completed;
    strokeStateRef.current = resetUnfinishedTraceStroke(strokeStateRef.current);
    pointerRef.current = { active: false, id: null, last: null };
    setFirstTry(false);
    setHadIncorrectResponse(true);
    setFeedback(`Touch stopped. Restart this stroke at green ${activeIndex + 1}.`);
    updateReady();
    drawGuide();
  };

  const restartTrace = () => {
    cancelNarration();
    strokeStateRef.current = { cursors: guideRef.current.map(() => 0), completed: 0, on: 0, off: 0, paths: [] };
    pointerRef.current = { active: false, id: null, last: null };
    keyboardRef.current = { cursor: 0, active: false };
    setTraceProgress(0);
    setTraceReady(false);
    setFirstTry(false);
    setFeedback(AMARI_TRACE_NARRATION[3]);
    setRoundPassed(false);
    drawGuide();
  };

  const handleKeyDown = (event) => {
    if (!keyboardMode || roundPassed) return;
    const index = strokeStateRef.current.completed;
    const stroke = guideRef.current[index];
    if (!stroke) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!keyboardRef.current.active) {
        keyboardRef.current.active = true;
        keyboardRef.current.cursor = Math.round(strokeStateRef.current.cursors[index] || 0);
        strokeStateRef.current.cursors[index] = keyboardRef.current.cursor;
        setFeedback(`Keyboard trace started at stroke ${index + 1}. Use an arrow key to follow each dot, then Space at the end.`);
      } else if (keyboardRef.current.cursor >= stroke.length - 1) {
        strokeStateRef.current.completed += 1;
        keyboardRef.current.active = false;
        setFeedback(strokeStateRef.current.completed < guideRef.current.length ? 'Stroke done. Focus the board and start the next number.' : 'All strokes are ready. Check your shape.');
        updateReady();
      }
      drawGuide();
      return;
    }
    if (event.key.startsWith('Arrow')) {
      event.preventDefault();
      if (!keyboardRef.current.active) {
        keyboardRef.current.active = true;
        keyboardRef.current.cursor = 0;
      }
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') keyboardRef.current.cursor = Math.min(stroke.length - 1, keyboardRef.current.cursor + 1);
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') keyboardRef.current.cursor = Math.max(0, keyboardRef.current.cursor - 1);
      strokeStateRef.current.cursors[index] = Math.max(strokeStateRef.current.cursors[index] || 0, keyboardRef.current.cursor);
      updateReady();
      drawGuide();
    }
  };

  const completeRound = (word = null) => {
    if (roundPassed) return;
    setRoundPassed(true);
    setSelectedWord(word);
    const firstAttempt = !hadIncorrectResponse;
    const nowFirstTry = firstAttempt && firstTry && !hintUsed && !usedKeyboardRef.current;
    const resultText = level === 2 ? AMARI_TRACE_NARRATION[5] : AMARI_TRACE_NARRATION[4];
    setFeedback(resultText);
    say(resultText);
    playSfx('complete');
    const award = nowFirstTry
      ? recordLetterTraceMastery({ playerId, level, letter: letter.lower })
      : { newlyMastered: false };
    if (!nowFirstTry) recordLetterTracePractice({ playerId, level, letter: letter.lower });
    if (roundIndex + 1 === LETTER_TRACE_ROUNDS_PER_LEVEL && lastCompletionRef.current !== run.seed) {
      lastCompletionRef.current = run.seed;
      const result = completeLetterTraceLevel({ playerId, level, completedRounds: LETTER_TRACE_ROUNDS_PER_LEVEL });
      if (result.newlyCompleted) onCelebrate(`${chapter.title} badge earned!`, 4, 250, 'trace');
      onGameEvent?.('trace', 'level_completed', { level, round: roundIndex, seed: run.seed, badge: chapter.id });
    }
    setMastery(getLetterTraceProgress(playerId));
    if (award.newlyMastered && nowFirstTry) onCelebrate('New letter mastered!', 4, 250, 'trace');
    onGameEvent?.('trace', 'learning_attempt', makeLearningEvent({
      skill: level === 2 ? 'letter-sound-and-word' : 'letter-formation',
      item: level === 2 ? word?.word : traceLetter,
      response: usedKeyboardRef.current ? 'keyboard-guide' : hintUsed ? 'guided-pointer-trace' : 'pointer-trace',
      correct: true,
      firstTry: firstAttempt,
      hints: hintCount,
      difficulty: ['starter', 'growing', 'challenge'][level],
      extra: { level, round: roundIndex, seed: run.seed, independent: nowFirstTry, masteryEligible: !usedKeyboardRef.current, unassistedFirstTry: nowFirstTry, handwritingMastery: Boolean(award.newlyMastered && nowFirstTry), keyboardAlternative: usedKeyboardRef.current },
    }));
    onGameEvent?.('trace', 'answer_correct', { firstAttempt, hints: hintCount, keyboardAlternative: usedKeyboardRef.current, level, round: roundIndex, seed: run.seed, difficulty: ['starter', 'growing', 'challenge'][level] });
  };

  const checkTrace = () => {
    if (!traceReady || roundPassed) return;
    setShowGuide(false);
    if (level === 2) {
      setWordChoices(makeTraceWordChoices(letter, undefined, (run.seed + roundIndex) >>> 0));
      setFeedback(AMARI_TRACE_NARRATION[6]);
      say(AMARI_TRACE_NARRATION[6]);
      return;
    }
    completeRound();
  };

  const answerWord = (word) => {
    const correct = word.word === letter.word?.word;
    if (!correct) {
      setFirstTry(false);
      setHadIncorrectResponse(true);
      setFeedback('That word starts with a different sound. Look at the first letter and try again.');
      playSfx('oops');
      onGameEvent?.('trace', 'answer_attempt', { firstAttempt: false, level, round: roundIndex, seed: run.seed });
      return;
    }
    completeRound(word);
  };

  const showHint = () => {
    if (roundPassed) return;
    setHintUsed(true);
    setHintCount((count) => count + 1);
    setFirstTry(false);
    setShowGuide(true);
    setDemoVersion(value => value + 1);
    setFeedback(AMARI_TRACE_NARRATION[2]);
    onGameEvent?.('trace', 'hint', { level, round: roundIndex, seed: run.seed, hintType: 'next_piece', hints: hintCount + 1 });
    say(AMARI_TRACE_NARRATION[2]);
    playSfx('sparkle');
    drawGuide();
  };

  const advance = () => {
    if (!roundPassed) return;
    cancelNarration();
    const nextIndex = roundIndex + 1;
    if (nextIndex < LETTER_TRACE_ROUNDS_PER_LEVEL) {
      setRoundIndex(nextIndex);
      resetRoundState(currentRound(run, nextIndex));
      onGameEvent?.('trace', 'question', { level, round: nextIndex, seed: run.seed });
      say(AMARI_TRACE_NARRATION[0]);
      return;
    }
    setPhase('complete');
    playSfx('complete');
  };

  const chooseLevel = (nextLevel) => {
    if (nextLevel > mastery.unlocked) return;
    if (nextLevel === level) return;
    cancelNarration();
    setActiveLevel(nextLevel);
    setError('');
    playSfx('click');
  };

  const chooseIntroLevel = (nextLevel) => {
    chooseLevel(nextLevel);
    if (nextLevel !== level && chapterPickerRef.current) chapterPickerRef.current.open = false;
  };

  const toggleKeyboard = () => {
    if (!keyboardMode) { usedKeyboardRef.current = true; setFirstTry(false); }
    setKeyboardMode(value => !value);
    keyboardRef.current = { cursor: 0, active: false };
    setFeedback(keyboardMode ? 'Pointer tracing is ready.' : 'Press Space to start. Right or Down follows the dots. Left or Up goes back. Space finishes the stroke.');
  };
  const renderIntro = () => (
    <main className="trace-intro-main mx-auto w-full max-w-4xl">
      <section className="trace-intro-hero rounded-3xl border-2 border-white bg-white/95 text-center shadow-md">
        <span aria-hidden="true" className="trace-intro-mark grid place-items-center rounded-2xl border-2 border-sky-200 bg-sky-50 text-5xl font-black text-sky-800">Aa</span>
        <div><h1 className="font-black text-blue-950">Make letters come to life</h1>
        <p className="font-semibold text-slate-600">Start at the green number. Follow one stroke, then lift.</p></div>
      </section>
      <section className="trace-selected-chapter rounded-3xl border-2 border-sky-200 bg-white/95 shadow-md" aria-labelledby="trace-selected-title">
        <div className="trace-selected-copy">
          <p className="trace-selected-kicker">Chapter {level + 1} · {mastery.completedLevels.includes(level) ? 'Badge earned' : 'Ready'}</p>
          <h2 id="trace-selected-title">{chapter.title}</h2>
          <p className="trace-selected-prompt">{chapter.prompt}</p>
        </div>
        <button type="button" onClick={() => beginChapter()} className="trace-start-button min-h-14 w-full rounded-2xl bg-emerald-800 px-5 text-xl font-black text-white shadow-md">Start {chapter.title} →</button>
      </section>
      <p className="trace-mastery-summary text-center text-sm font-semibold text-slate-600">{mastery.completedLevels.length} of 3 chapter badges · {mastery.masteredLetters.length} letters mastered</p>
      <details ref={chapterPickerRef} className="trace-chapter-picker rounded-2xl bg-white/85 text-sm text-slate-700">
        <summary className="min-h-12 cursor-pointer p-3 font-bold">Choose another chapter</summary>
        <div className="trace-chapter-options" role="group" aria-label="Other trace chapters">{LETTER_TRACE_LEVELS.map((item, index) => index === level ? null : <button key={item.id} type="button" onClick={() => chooseIntroLevel(index)} disabled={index > mastery.unlocked} aria-pressed={index === level} aria-label={`${item.title}${index > mastery.unlocked ? ', locked' : ''}`} className="trace-chapter-option rounded-2xl border-2 border-white bg-white/90 text-left disabled:opacity-50">
          <span><span className="trace-chapter-status">Chapter {index + 1} · {mastery.completedLevels.includes(index) ? 'Badge earned' : index > mastery.unlocked ? 'Locked' : 'Ready'}</span><strong>{item.title}</strong><small>{item.prompt}</small></span>
          {index > mastery.unlocked && <span aria-hidden="true">🔒</span>}
        </button>)}</div>
      </details>
      {error && <p className="rounded-xl bg-amber-50 p-3 font-bold text-amber-950" role="alert">{error}</p>}
      <details className="trace-grownup-details rounded-2xl bg-white/75 p-3 text-sm text-slate-600"><summary className="min-h-12 cursor-pointer p-3 font-bold">For grown-ups: practice and mastery</summary><p className="p-3">Guided and keyboard practice can earn chapter badges. Letter mastery records unaided, first-try hand tracing.</p></details>
    </main>
  );
  const renderComplete = () => (
    <main className="mx-auto my-6 w-full max-w-2xl rounded-3xl border-2 border-white bg-white p-6 text-center shadow-xl">
      <p aria-hidden="true" className="text-5xl text-amber-500">★</p><h1 className="mt-3 text-3xl font-black text-blue-950">{chapter.title} complete!</h1>
      <p className="mt-3 font-semibold text-slate-700">Eight letters practised. Your chapter badge is saved.</p>
      {level < 2 ? <button type="button" onClick={() => beginChapter(false, level + 1)} className="mt-5 min-h-14 w-full rounded-2xl bg-emerald-800 px-5 font-black text-white">Next chapter: {LETTER_TRACE_LEVELS[level + 1].title} →</button> : <button type="button" onClick={() => { setActiveLevel(mastery.unlocked); setPhase('map'); }} className="mt-5 min-h-14 w-full rounded-2xl bg-emerald-800 px-5 font-black text-white">Choose a chapter</button>}
      <button type="button" onClick={() => beginChapter(true)} className="mt-3 min-h-12 w-full rounded-xl border-2 border-sky-300 bg-white px-5 font-black text-sky-900">Replay chapter</button>
      <button type="button" onClick={onBack} className="mt-3 min-h-12 w-full rounded-xl px-5 font-black text-slate-700">Back to world</button>
    </main>
  );
  const renderRound = () => {
    const wordStep = level === 2 && wordChoices.length > 0 && !roundPassed;
    return <main className="trace-round-main mx-auto w-full max-w-4xl space-y-4" data-trace-letter={traceLetter}>
      <section className="trace-round-card rounded-3xl border-2 border-white bg-white/95 p-4 shadow-md">
        <p className="trace-round-kicker text-center text-xs font-black uppercase text-blue-800">{chapter.title} · Letter {roundIndex + 1} of 8</p>
        <h1 className="trace-round-title mt-1 text-center text-2xl font-black text-blue-950">{roundPassed ? 'You did it!' : wordStep ? `Find a word for ${letter.lower}` : `Trace ${traceLetter}`}</h1>
        {!roundPassed && !wordStep && <>
          <p className="trace-round-instruction mt-2 text-center font-bold text-slate-700">{traceReady ? 'All strokes traced. Check your shape.' : `Start at green ${strokeStateRef.current.completed + 1}. Follow the arrows, then lift.`}</p>
          {level === 1 && <p className="trace-same-letter mt-2 text-center font-bold text-indigo-800" aria-label={`Same letter pair: capital ${letter.upper} and lowercase ${letter.lower}`}>Same letter: <span className="px-2 text-3xl">{letter.upper} {letter.lower}</span> · trace {traceLetter}</p>}
          <div className="trace-progress-track mt-3 h-3 overflow-hidden rounded-full bg-sky-100" role="progressbar" aria-label="Letter path progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={traceProgress}><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-700" style={{ width: `${traceProgress}%` }} /></div>
          <div className="trace-canvas-wrap relative mt-3 h-[min(46vh,400px)] min-h-[280px] w-full overflow-hidden rounded-2xl border-2 border-sky-200 bg-sky-50 sm:min-h-[340px]">
            <canvas ref={canvasRef} aria-label={`${traceLetter} letter guide. ${strokeAnnouncement}`} role="img" onPointerDown={startPointer} onPointerMove={movePointer} onPointerUp={endPointer} onPointerCancel={cancelPointer} onKeyDown={handleKeyDown} tabIndex={keyboardMode ? 0 : -1} className={`absolute inset-0 block h-full w-full touch-none ${keyboardMode ? 'focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-500' : 'cursor-crosshair'}`} />
          </div>
          <p className="trace-progress-copy mt-2 text-center text-sm font-bold text-blue-800" aria-live="polite">{traceProgress}% traced · {Math.min(strokeStateRef.current.completed, currentStrokeCount)} of {currentStrokeCount} strokes done</p>
          <button type="button" onClick={checkTrace} disabled={!traceReady} className="trace-check-button mt-3 min-h-14 w-full rounded-2xl bg-emerald-800 px-5 text-lg font-black text-white disabled:bg-slate-200 disabled:text-slate-500"><Check className="mr-2 inline" size={20} />{level === 2 ? 'Find the word →' : 'Check shape'}</button>
          <button type="button" onClick={showHint} className="trace-hint-button mt-3 min-h-12 w-full rounded-xl bg-amber-50 px-4 font-black text-amber-950"><Lightbulb className="mr-2 inline" size={18} />{showGuide ? 'Watch stroke again' : 'Watch this stroke'}</button>
          <details className="trace-tools mt-3 rounded-xl bg-slate-50 p-2"><summary className="min-h-12 cursor-pointer p-3 font-bold text-slate-700">More tracing tools</summary><div className="grid gap-2 sm:grid-cols-2"><button type="button" onClick={restartTrace} className="min-h-12 rounded-xl bg-white px-4 font-black text-slate-800">Retry trace</button><button type="button" onClick={toggleKeyboard} aria-pressed={keyboardMode} className="min-h-12 rounded-xl bg-violet-100 px-4 font-black text-violet-950">{keyboardMode ? 'Use touch or mouse' : 'Use keyboard'}</button></div></details>
          {keyboardMode && <p className="trace-keyboard-help mt-2 text-sm font-bold text-violet-900">Focus the guide. Space starts/finishes a stroke. Right/Down follows the dots; Left/Up goes back.</p>}
        </>}
        {wordStep && <section aria-label="Choose the word that starts with this sound" className="mt-4 text-center"><span className="mx-auto block text-7xl font-black text-sky-700">{letter.lower}</span><p className="mt-2 font-bold">Which word starts with {letter.lower}?</p><div className="mt-4 grid gap-3 sm:grid-cols-3">{storyChoices.map(word => {
          const art = SPELLING_WORD_ART[word.word];
          return <button type="button" key={word.word} onClick={() => answerWord(word)} aria-label={word.word} className="flex min-h-24 items-center justify-center gap-3 rounded-2xl border-2 border-sky-200 bg-sky-50 p-3 text-xl font-black text-sky-950">{art ? <img src={art.src} alt={art.alt} className="h-16 w-16 object-contain" /> : <span aria-hidden="true" className="text-4xl">{word.emoji}</span>}<span>{word.word}</span></button>;
        })}</div></section>}
        {roundPassed && <section aria-label="Completed letter" aria-live="polite" className="trace-completed-letter-section mt-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 text-center"><p className="trace-completed-letter text-7xl font-black text-emerald-800">{traceLetter}</p>{selectedWord && <p className="trace-completed-word mt-3 text-2xl font-black text-emerald-900">{selectedWord.word}</p>}<p className="trace-held-explanation mt-3 text-lg font-bold text-slate-800">{feedback}</p><button type="button" onClick={() => say(level === 2 ? AMARI_TRACE_NARRATION[5] : AMARI_TRACE_NARRATION[4])} className="trace-explanation-audio mt-3 min-h-12 w-full rounded-xl border-2 border-emerald-600 bg-white px-4 font-black text-emerald-900"><Volume2 className="mr-2 inline" size={20} />Hear explanation</button><button type="button" onClick={advance} className="trace-next-button mt-3 min-h-14 w-full rounded-xl bg-emerald-800 px-5 text-lg font-black text-white">{roundIndex + 1 === LETTER_TRACE_ROUNDS_PER_LEVEL ? 'Finish chapter' : 'Next letter'} →</button></section>}
        {!roundPassed && <p className="trace-feedback-live mt-3 min-h-8 text-center font-bold text-slate-700" aria-live="polite">{feedback}</p>}
      </section>
    </main>;
  };

  return (
    <div className="trace-root flex min-h-[100dvh] flex-col bg-gradient-to-b from-blue-100 via-sky-100 to-indigo-100 text-slate-900">
      <header className="trace-header sticky top-0 z-10 flex min-h-[68px] items-center justify-between gap-2 bg-white/95 px-3 py-2 shadow sm:px-5">
        <button type="button" onClick={onBack} aria-label="Back to learning world" className="grid min-h-12 min-w-12 place-items-center rounded-full bg-blue-100 text-blue-950"><ArrowLeft /></button>
        <div className="text-center"><p className="text-xs font-black uppercase tracking-wide text-blue-900">One stroke at a time</p><p className="text-xl font-black">Letter Trace</p></div>
        <button type="button" onClick={onToggleSound} aria-label={`Sound ${soundOn ? 'on' : 'off'}`} aria-pressed={soundOn} className="grid min-h-12 min-w-12 place-items-center rounded-xl bg-slate-100 text-slate-900"><Volume2 /></button>
      </header>
      {phase === 'map' && renderIntro()}
      {phase === 'play' && renderRound()}
      {phase === 'complete' && renderComplete()}

    </div>
  );
};

export default AmariLetterTrace;
