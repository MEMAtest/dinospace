import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, Lightbulb, RotateCcw, Volume2 } from 'lucide-react';
import { TRACE_LETTERS } from '../../data/index.js';
import { makeLearningEvent } from '../../data/literacy.js';
import {
  completeLetterTraceLevel,
  AMARI_TRACE_NARRATION,
  findForwardGuidePoint,
  getLetterTraceProgress,
  LETTER_TRACE_LEVELS,
  LETTER_TRACE_ROUNDS_PER_LEVEL,
  makeLetterTraceRun,
  makeTraceWordChoices,
  recordLetterTraceMastery,
  resetUnfinishedTraceStroke,
  traceToleranceForSize,
} from '../../data/letterTraceLearning.js';
import { getLetterStrokes } from './LetterTrace.jsx';
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
const letterMetadata = (lower) => TRACE_LETTERS.find((item) => item.lower === lower) || TRACE_LETTERS[0];

const AmariLetterTrace = ({
  onBack,
  playSfx = () => {},
  soundOn = false,
  onToggleSound,
  speak = () => {},
  onCelebrate = () => {},
  onGameEvent,
  onPhaseChange,
  playerId = 'amari',
  sessionLevel = 0,
}) => {
  const [activeLevel, setActiveLevel] = useState(Math.max(0, Math.min(2, sessionLevel)));
  const level = activeLevel;
  const canvasRef = useRef(null);
  const guideRef = useRef([]);
  const strokeStateRef = useRef({ cursors: [], completed: 0, on: 0, off: 0, paths: [] });
  const pointerRef = useRef({ active: false, id: null, last: null });
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

  const chapter = LETTER_TRACE_LEVELS[level];
  const currentMeta = letterMetadata(letter.lower);
  const traceLetter = letter.requested || (level === 2 ? letter.lower : letter.upper);
  const storyChoices = useMemo(() => wordChoices, [wordChoices]);
  // The drawing effect updates guideRef after render. Derive the announced
  // count from this letter so a new round never announces the previous guide.
  const currentStrokeCount = getLetterStrokes(traceLetter, 100, 100).length || 1;
  const strokeAnnouncement = traceReady || roundPassed
    ? `Trace ${traceLetter}. All ${currentStrokeCount} strokes complete.`
    : `Trace ${traceLetter}. Stroke ${Math.min(strokeStateRef.current.completed + 1, currentStrokeCount)} of ${currentStrokeCount}.`;

  useEffect(() => { onPhaseChange?.(phaseName(phase)); }, [onPhaseChange, phase]);
  useEffect(() => { setActiveLevel(Math.max(0, Math.min(2, sessionLevel))); }, [sessionLevel]);
  useEffect(() => {
    setMastery(getLetterTraceProgress(playerId));
  }, [playerId]);
  useEffect(() => () => {
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel?.();
  }, []);

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
    setSelectedWord(null);
    setError('');
    setShowGuide(false);
    setFeedback(AMARI_TRACE_NARRATION[0]);
  }, []);

  const beginChapter = useCallback((retry = false) => {
    const saved = getLetterTraceProgress(playerId);
    const nextRun = makeLetterTraceRun({
      seed: getSeed(),
      level,
      recentLetters: retry ? [] : saved.recentByLevel[level] || [],
    });
    if (nextRun.error) {
      setError('Choose at least eight taught letter sounds in the grown-ups learning settings before starting this chapter.');
      return;
    }
    setRun(nextRun);
    setRoundIndex(0);
    resetRoundState(nextRun.rounds[0]);
    progressAtStartRef.current = saved;
    lastCompletionRef.current = null;
    onGameEvent?.('trace', 'start', { level, round: 0, seed: nextRun.seed, difficulty: ['starter', 'growing', 'challenge'][level] });
    setPhase('play');
    playSfx('launch');
    say(AMARI_TRACE_NARRATION[0]);
  }, [level, onGameEvent, playerId, playSfx, resetRoundState, say]);

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
    ctx.font = `900 ${Math.round(Math.min(rect.width, rect.height) * 0.57)}px "Avenir Next", "Trebuchet MS", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(191,219,254,.38)';
    ctx.fillText(traceLetter, rect.width / 2, rect.height / 2);
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
      const cursor = strokeStateRef.current.cursors[index] ?? 0;
      ctx.beginPath();
      ctx.arc(start.x, start.y, 19, 0, Math.PI * 2);
      ctx.fillStyle = index <= strokeStateRef.current.completed ? '#15803d' : '#64748b';
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = '900 17px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(index + 1), start.x, start.y);
      if (index === activeStroke && keyboardMode && keyboardRef.current.active && stroke[cursor]) {
        ctx.beginPath();
        ctx.arc(stroke[cursor].x, stroke[cursor].y, 13, 0, Math.PI * 2);
        ctx.fillStyle = '#f97316';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      });
    }

  }, [keyboardMode, showGuide, traceLetter]);

  useEffect(() => {
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
  }, [drawGuide, roundPassed]);

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
    const nearest = findForwardGuidePoint(stroke, point, cursor, 0, 3);
    const nearestIndex = nearest.index;
    const nearestDistance = nearest.distance;
    const bounds = canvas.getBoundingClientRect();
    const tolerance = traceToleranceForSize(bounds.width, bounds.height, level);
    const last = pointerRef.current.last;
    if (!last) return;
    const distance = Math.hypot(point.x - last.x, point.y - last.y);
    if (nearestDistance <= tolerance) {
      strokeStateRef.current.cursors[strokeIndex] = Math.max(cursor, nearestIndex);
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
    const point = pointFromEvent(event);
    const index = strokeStateRef.current.completed;
    const stroke = guideRef.current[index];
    if (!stroke) return;
    const cursor = strokeStateRef.current.cursors[index] ?? 0;
    const anchor = cursor > 0 ? stroke[cursor] : stroke[0];
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
    if (stroke.length < 2 || stroke.every((item) => Math.hypot(item.x - stroke[0].x, item.y - stroke[0].y) < 3)) {
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
    setFeedback(`Touch stopped. Restart this stroke at green ${activeIndex + 1}.`);
    updateReady();
    drawGuide();
  };

  const restartTrace = () => {
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
        keyboardRef.current.cursor = strokeStateRef.current.cursors[index] || 0;
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
      drawGuide();
    }
  };

  const completeRound = (word = null) => {
    if (roundPassed) return;
    setRoundPassed(true);
    setSelectedWord(word);
    const firstAttempt = !hadIncorrectResponse;
    const nowFirstTry = firstAttempt && firstTry && !hintUsed && !keyboardMode;
    const resultText = level === 2 ? AMARI_TRACE_NARRATION[5] : AMARI_TRACE_NARRATION[4];
    setFeedback(resultText);
    say(resultText);
    playSfx('complete');
    const award = nowFirstTry
      ? recordLetterTraceMastery({ playerId, level, letter: letter.lower })
      : { newlyMastered: false };
    setMastery(getLetterTraceProgress(playerId));
    if (award.newlyMastered && nowFirstTry) onCelebrate('New letter mastered!', 4, 250, 'trace');
    onGameEvent?.('trace', 'learning_attempt', makeLearningEvent({
      skill: level === 2 ? 'letter-sound-and-word' : 'letter-formation',
      item: level === 2 ? word?.word : traceLetter,
      response: keyboardMode ? 'keyboard-guide' : hintUsed ? 'guided-pointer-trace' : 'pointer-trace',
      correct: true,
      firstTry: firstAttempt,
      hints: hintCount,
      difficulty: ['starter', 'growing', 'challenge'][level],
      extra: { level, round: roundIndex, seed: run.seed, unassistedFirstTry: nowFirstTry, handwritingMastery: Boolean(award.newlyMastered && nowFirstTry), keyboardAlternative: keyboardMode },
    }));
    onGameEvent?.('trace', 'answer_correct', { firstAttempt, hints: hintCount, keyboardAlternative: keyboardMode, level, round: roundIndex, seed: run.seed, difficulty: ['starter', 'growing', 'challenge'][level] });
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
    setFeedback(AMARI_TRACE_NARRATION[2]);
    onGameEvent?.('trace', 'hint', { level, round: roundIndex, seed: run.seed, hintType: 'next_piece', hints: hintCount + 1 });
    say(AMARI_TRACE_NARRATION[2]);
    playSfx('sparkle');
    drawGuide();
  };

  const advance = () => {
    if (!roundPassed) return;
    const nextIndex = roundIndex + 1;
    if (nextIndex < LETTER_TRACE_ROUNDS_PER_LEVEL) {
      setRoundIndex(nextIndex);
      resetRoundState(currentRound(run, nextIndex));
      onGameEvent?.('trace', 'question', { level, round: nextIndex, seed: run.seed });
      say(AMARI_TRACE_NARRATION[0]);
      return;
    }
    const result = completeLetterTraceLevel({ playerId, level, completedRounds: LETTER_TRACE_ROUNDS_PER_LEVEL });
    lastCompletionRef.current = run.seed;
    setMastery(getLetterTraceProgress(playerId));
    if (result.newlyCompleted) onCelebrate(`${chapter.title} badge earned!`, 4, 250, 'trace');
    onGameEvent?.('trace', 'level_completed', { level, round: roundIndex, seed: run.seed, badge: chapter.id });
    setPhase('complete');
    playSfx('complete');
  };

  const chooseLevel = (nextLevel) => {
    if (nextLevel > mastery.unlocked) return;
    if (nextLevel === level) return;
    setActiveLevel(nextLevel);
    setError('');
    playSfx('click');
  };

  const renderIntro = () => (
    <main className="mx-auto grid min-h-[70vh] w-full max-w-3xl content-center gap-5 px-4 py-8 text-center">
      <div className="text-7xl" aria-hidden="true">✍️</div>
      <p className="mx-auto rounded-full bg-blue-100 px-5 py-2 font-black text-blue-900">Chapter {level + 1} of 3</p>
      <h1 className="text-4xl font-black text-blue-950">{chapter.title}</h1>
      <p className="mx-auto max-w-xl text-xl font-bold text-slate-700">{chapter.prompt}</p>
      <p className="text-sm font-semibold text-slate-600">{mastery.completedLevels.length} chapters earned · {mastery.masteredLetters.length} letters independently mastered</p>
      <div className="flex flex-wrap justify-center gap-2" aria-label="Trace chapters">
        {LETTER_TRACE_LEVELS.map((item, index) => <button key={item.id} type="button" onClick={() => chooseLevel(index)} disabled={index > mastery.unlocked} aria-pressed={index === level} aria-label={`${item.title}${index > mastery.unlocked ? ', locked' : ''}`} className={`min-h-12 rounded-2xl px-4 font-black ${index === level ? 'bg-blue-700 text-white' : index > mastery.unlocked ? 'bg-slate-200 text-slate-500' : 'bg-white text-blue-800 shadow'}`}>{item.title}</button>)}
      </div>
      <button type="button" onClick={() => beginChapter()} className="mx-auto min-h-14 rounded-2xl bg-emerald-600 px-8 text-xl font-black text-white shadow-lg">Start chapter</button>
      {error && <p className="rounded-xl bg-amber-50 p-3 font-bold text-amber-950" role="alert">{error}</p>}
    </main>
  );

  const renderComplete = () => (
    <main className="mx-auto grid min-h-[70vh] w-full max-w-2xl content-center justify-items-center gap-5 px-4 py-8 text-center">
      <div className="text-7xl" aria-hidden="true">🏅</div>
      <h1 className="text-4xl font-black text-blue-950">Chapter complete!</h1>
      <p className="max-w-xl text-lg font-bold text-slate-700">You finished all eight {level === 2 ? 'letter-and-word' : 'letter-tracing'} rounds. Your {chapter.title.toLowerCase()} badge is saved.</p>
      <p className="font-semibold text-slate-600">{mastery.completedLevels.length} chapters earned · {mastery.masteredLetters.length} letters independently mastered</p>
      <div className="flex flex-wrap justify-center gap-3"><button type="button" className="min-h-12 rounded-xl bg-blue-700 px-5 font-black text-white" onClick={() => beginChapter(true)}><RotateCcw className="mr-2 inline" size={18} />Replay chapter</button><button type="button" className="min-h-12 rounded-xl bg-white px-5 font-black text-blue-800 shadow" onClick={onBack}><ArrowLeft className="mr-2 inline" size={18} />Back to world</button></div>
    </main>
  );

  const renderRound = () => (
    <main className="mx-auto grid w-full max-w-5xl flex-1 content-start gap-4 px-3 py-4 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/90 p-3 shadow">
        <div><p className="font-black text-blue-900">{chapter.title} · round {roundIndex + 1} of {LETTER_TRACE_ROUNDS_PER_LEVEL}</p><h1 className="text-2xl font-black text-slate-900">Trace <span className="text-blue-700">{traceLetter}</span> {letter.word ? roundPassed ? `→ ${selectedWord?.word || letter.word.word}` : '· then find its starting word' : `· ${currentMeta.word}`}</h1></div>
        <div className="flex items-center gap-2"><button type="button" onClick={() => say(AMARI_TRACE_NARRATION[0])} className="grid min-h-12 min-w-12 place-items-center rounded-xl bg-blue-100 text-blue-900" aria-label="Hear the tracing instruction again"><Volume2 size={22} /></button><button type="button" onClick={onToggleSound} aria-pressed={soundOn} className="min-h-12 rounded-xl bg-slate-100 px-3 font-black text-slate-800">Sound {soundOn ? 'on' : 'off'}</button></div>
      </div>
      <section className="rounded-2xl border border-blue-100 bg-white/90 p-3 shadow" aria-label="Letter tracing exercise">
        {level === 1 && <div className="mb-3 rounded-2xl bg-indigo-50 p-3 text-center" aria-label={`Same letter pair: capital ${letter.upper} and lowercase ${letter.lower}`}>
          <div className="flex justify-center gap-4">
            {[['Capital', letter.upper], ['Lowercase', letter.lower]].map(([label, form]) => <div key={label} className={`min-w-24 rounded-xl border-2 px-4 py-2 ${form === traceLetter ? 'border-blue-600 bg-white' : 'border-indigo-100 bg-indigo-100/50'}`}>
              <p className="text-xs font-bold text-indigo-900">{label}</p><p className="text-4xl font-black text-blue-900">{form}</p>
            </div>)}
          </div>
          <p className="mt-2 text-sm font-bold text-indigo-950">Both forms are the same letter. Compare their shapes, then trace {traceLetter === letter.upper ? 'the capital' : 'the lowercase'} form.</p>
        </div>}
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><p className="font-bold text-slate-800">{roundPassed ? 'Letter complete. Choose Next when you are ready.' : traceReady ? level === 2 ? 'All strokes traced. Find the matching word.' : 'All strokes traced. Check your shape.' : `Start at green ${strokeStateRef.current.completed + 1}; follow the arrows.`}</p><p className="font-black text-blue-800" aria-live="polite">{traceProgress}% traced</p></div>
        <div className="h-3 overflow-hidden rounded-full bg-blue-100" role="progressbar" aria-label="Letter path progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={traceProgress}><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-700" style={{ width: `${traceProgress}%` }} /></div>
        <div className="relative mt-3 min-h-[280px] h-[min(48vh,440px)] w-full overflow-hidden rounded-2xl border-4 border-blue-200 bg-sky-50 sm:min-h-[340px]">
          <canvas ref={canvasRef} aria-label={`${traceLetter} letter guide. ${strokeAnnouncement}`} role="img" onPointerDown={startPointer} onPointerMove={movePointer} onPointerUp={endPointer} onPointerCancel={cancelPointer} onKeyDown={handleKeyDown} tabIndex={keyboardMode ? 0 : -1} className={`absolute inset-0 block h-full w-full min-h-0 min-w-0 touch-none ${keyboardMode ? 'focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-500' : 'cursor-crosshair'}`} />
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={showHint} disabled={roundPassed} className="min-h-12 rounded-xl bg-amber-100 px-4 font-black text-amber-950"><Lightbulb className="mr-2 inline" size={18} />Show this stroke</button>
          <button type="button" onClick={restartTrace} disabled={roundPassed} className="min-h-12 rounded-xl bg-slate-100 px-4 font-black text-slate-900"><RotateCcw className="mr-2 inline" size={18} />Retry trace</button>
          <button type="button" onClick={() => { setKeyboardMode((value) => !value); keyboardRef.current = { cursor: 0, active: false }; setFeedback(keyboardMode ? 'Pointer tracing is ready.' : 'Focus the guide. Press Space to start, use arrow keys along the stroke, then Space at the end.'); }} disabled={roundPassed} aria-pressed={keyboardMode} className="min-h-12 rounded-xl bg-violet-100 px-4 font-black text-violet-950">{keyboardMode ? 'Use touch or mouse' : 'Use keyboard'}</button>
          <button type="button" onClick={checkTrace} disabled={!traceReady || roundPassed} className="min-h-12 rounded-xl bg-emerald-700 px-5 font-black text-white disabled:opacity-40"><Check className="mr-2 inline" size={20} />{level === 2 ? 'Find the word' : 'Check shape'}</button>
        </div>
      </section>
      {level === 2 && traceReady && !roundPassed && wordChoices.length > 0 && <section className="grid gap-3 rounded-2xl bg-white p-4 shadow" aria-label="Choose the word that starts with this sound"><h2 className="text-center text-xl font-black">Which word starts with {letter.lower}?</h2><div className="flex flex-wrap justify-center gap-3">{storyChoices.map((word) => <button type="button" key={word.word} onClick={() => answerWord(word)} className="min-h-14 min-w-28 rounded-xl border-2 border-blue-200 bg-sky-50 px-5 text-lg font-black text-slate-900">{word.emoji} {word.word}</button>)}</div></section>}
      {roundPassed && <section className="grid gap-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-center" aria-live="polite"><h2 className="text-xl font-black text-emerald-950">{feedback}</h2><p className="font-semibold text-slate-800">The explanation stays here until you are ready.</p><button type="button" onClick={advance} className="min-h-14 rounded-xl bg-emerald-700 px-6 text-lg font-black text-white">{roundIndex + 1 === LETTER_TRACE_ROUNDS_PER_LEVEL ? 'Finish chapter' : 'Next letter'}</button></section>}
      {!roundPassed && <p className="min-h-8 text-center font-bold text-slate-700" aria-live="polite">{feedback}</p>}
    </main>
  );

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-blue-100 via-sky-100 to-indigo-100 text-slate-900">
      <header className="sticky top-0 z-10 flex min-h-[68px] items-center justify-between gap-2 bg-white/95 px-3 py-2 shadow sm:px-5">
        <button type="button" onClick={onBack} aria-label="Back to learning world" className="grid min-h-12 min-w-12 place-items-center rounded-full bg-blue-100 text-blue-950"><ArrowLeft /></button>
        <div className="text-center"><p className="text-xs font-black uppercase tracking-wide text-blue-900">Words · age-six practice</p><p className="text-xl font-black">Letter Trace</p></div>
        <button type="button" onClick={onToggleSound} aria-label={`Sound ${soundOn ? 'on' : 'off'}`} aria-pressed={soundOn} className="grid min-h-12 min-w-12 place-items-center rounded-xl bg-slate-100 text-slate-900"><Volume2 /></button>
      </header>
      {phase === 'map' && renderIntro()}
      {phase === 'play' && renderRound()}
      {phase === 'complete' && renderComplete()}
      <footer className="px-4 pb-3 text-center text-xs font-semibold text-slate-600">Pointer completion records letter mastery only after an unhinted, first-try hand trace. Keyboard practice can complete the chapter without recording handwriting mastery.</footer>
    </div>
  );
};

export default AmariLetterTrace;
