import { useState, useEffect, useRef } from 'react';
import { Home } from 'lucide-react';
import { TRACE_LETTERS } from '../../data/index.js';
import { getPraise } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';
import { getTaughtGraphemes, makeLearningEvent } from '../../data/literacy.js';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';

// These are deliberately stroke paths rather than a font outline. A font tells
// a child what a letter looks like, but not where to start or which way to
// move. Coordinates are normalised so the same guide works on a phone, tablet
// and desktop canvas.
const UPPER_STROKES = {
  A: [[[.22,.86],[.5,.12],[.78,.86]], [[.34,.58],[.66,.58]]],
  B: [[[.28,.12],[.28,.88]], [[.28,.12],[.58,.12],[.72,.23],[.72,.38],[.58,.5],[.28,.5]], [[.28,.5],[.6,.5],[.76,.62],[.76,.78],[.6,.88],[.28,.88]]],
  C: [[[.76,.2],[.62,.12],[.4,.12],[.24,.26],[.2,.5],[.24,.74],[.4,.88],[.62,.88],[.76,.8]]],
  D: [[[.28,.12],[.28,.88]], [[.28,.12],[.56,.12],[.74,.26],[.78,.5],[.74,.74],[.56,.88],[.28,.88]]],
  E: [[[.74,.12],[.28,.12],[.28,.88],[.76,.88]], [[.28,.5],[.64,.5]]],
  F: [[[.72,.12],[.28,.12],[.28,.88]], [[.28,.5],[.62,.5]]],
  G: [[[.76,.23],[.62,.12],[.4,.12],[.24,.26],[.2,.5],[.24,.74],[.4,.88],[.64,.88],[.78,.72],[.78,.56],[.52,.56]]],
  H: [[[.25,.12],[.25,.88]], [[.75,.12],[.75,.88]], [[.25,.5],[.75,.5]]],
  I: [[[.25,.12],[.75,.12]], [[.5,.12],[.5,.88]], [[.25,.88],[.75,.88]]],
  J: [[[.72,.12],[.72,.7],[.64,.84],[.48,.88],[.32,.84],[.24,.72]], [[.25,.12],[.78,.12]]],
  K: [[[.28,.12],[.28,.88]], [[.72,.12],[.28,.5],[.76,.88]]],
  L: [[[.28,.12],[.28,.88],[.76,.88]]],
  M: [[[.2,.88],[.2,.12],[.5,.58],[.8,.12],[.8,.88]]],
  N: [[[.24,.88],[.24,.12],[.76,.88],[.76,.12]]],
  O: [[[.5,.12],[.3,.16],[.2,.34],[.2,.66],[.3,.84],[.5,.88],[.7,.84],[.8,.66],[.8,.34],[.7,.16],[.5,.12]]],
  P: [[[.28,.88],[.28,.12]], [[.28,.12],[.58,.12],[.74,.24],[.74,.4],[.58,.52],[.28,.52]]],
  Q: [[[.5,.12],[.3,.16],[.2,.34],[.2,.66],[.3,.84],[.5,.88],[.7,.84],[.8,.66],[.8,.34],[.7,.16],[.5,.12]], [[.58,.66],[.8,.9]]],
  R: [[[.28,.88],[.28,.12]], [[.28,.12],[.58,.12],[.74,.24],[.74,.4],[.58,.52],[.28,.52]], [[.52,.52],[.78,.88]]],
  S: [[[.74,.2],[.62,.12],[.4,.12],[.24,.24],[.24,.4],[.4,.5],[.62,.5],[.76,.62],[.76,.78],[.6,.88],[.38,.88],[.24,.78]]],
  T: [[[.2,.12],[.8,.12]], [[.5,.12],[.5,.88]]],
  U: [[[.24,.12],[.24,.68],[.34,.84],[.5,.88],[.66,.84],[.76,.68],[.76,.12]]],
  V: [[[.2,.12],[.5,.88],[.8,.12]]],
  W: [[[.16,.12],[.34,.88],[.5,.5],[.66,.88],[.84,.12]]],
  X: [[[.22,.12],[.78,.88]], [[.78,.12],[.22,.88]]],
  Y: [[[.2,.12],[.5,.5],[.8,.12]], [[.5,.5],[.5,.88]]],
  Z: [[[.22,.12],[.78,.12],[.22,.88],[.78,.88]]],
};

const LOWER_STROKES = {
  a: [[[.68,.48],[.56,.38],[.4,.4],[.3,.54],[.3,.7],[.4,.82],[.56,.82],[.68,.7],[.68,.38]], [[.68,.38],[.68,.86]]],
  c: [[[.7,.48],[.58,.4],[.42,.4],[.3,.54],[.3,.7],[.42,.82],[.58,.82],[.7,.74]]],
  d: [[[.68,.38],[.56,.4],[.4,.4],[.3,.54],[.3,.7],[.4,.82],[.56,.82],[.68,.7],[.68,.12]],],
  e: [[[.3,.62],[.7,.62],[.66,.48],[.54,.4],[.4,.4],[.3,.54],[.3,.7],[.42,.82],[.6,.82],[.7,.74]]],
  f: [[[.62,.24],[.52,.14],[.4,.2],[.4,.86]], [[.26,.42],[.62,.42]]],
  g: [[[.68,.48],[.56,.4],[.4,.4],[.3,.54],[.3,.7],[.4,.82],[.56,.82],[.68,.7],[.68,.4]], [[.68,.68],[.68,.9],[.56,.98],[.4,.96],[.32,.88]]],
  h: [[[.3,.88],[.3,.12]], [[.3,.54],[.42,.4],[.58,.4],[.68,.52],[.68,.88]]],
  i: [[[.5,.4],[.5,.86]], [[.5,.2],[.5,.2]]],
  j: [[[.58,.4],[.58,.88],[.48,.98],[.34,.94]], [[.58,.2],[.58,.2]]],
  k: [[[.3,.88],[.3,.12]], [[.7,.4],[.3,.62]], [[.5,.54],[.72,.88]]],
  l: [[[.5,.12],[.5,.88]]],
  m: [[[.22,.86],[.22,.4]], [[.22,.54],[.34,.4],[.46,.4],[.54,.54],[.54,.86]], [[.54,.54],[.66,.4],[.78,.4],[.84,.54],[.84,.86]]],
  n: [[[.28,.86],[.28,.4]], [[.28,.54],[.4,.4],[.56,.4],[.68,.54],[.68,.86]]],
  o: [[[.5,.4],[.36,.42],[.28,.56],[.3,.72],[.42,.82],[.58,.82],[.7,.7],[.7,.54],[.6,.42],[.5,.4]]],
  p: [[[.3,.98],[.3,.4]], [[.3,.54],[.42,.4],[.58,.4],[.7,.54],[.7,.7],[.58,.82],[.42,.82],[.3,.7]]],
  q: [[[.68,.4],[.56,.4],[.4,.4],[.3,.54],[.3,.7],[.4,.82],[.56,.82],[.68,.7],[.68,.4]], [[.68,.7],[.68,.98]]],
  r: [[[.3,.86],[.3,.4]], [[.3,.54],[.42,.4],[.58,.4]]],
  s: [[[.68,.48],[.58,.4],[.42,.4],[.3,.5],[.34,.62],[.56,.66],[.68,.74],[.58,.82],[.4,.82],[.3,.74]]],
  t: [[[.5,.2],[.5,.78],[.58,.84],[.68,.8]], [[.3,.42],[.68,.42]]],
  u: [[[.3,.4],[.3,.7],[.4,.82],[.56,.82],[.68,.7],[.68,.4]], [[.68,.7],[.68,.86]]],
  v: [[[.28,.4],[.5,.86],[.72,.4]]],
  w: [[[.2,.4],[.34,.86],[.5,.58],[.66,.86],[.8,.4]]],
  x: [[[.28,.4],[.7,.86]], [[.7,.4],[.28,.86]]],
  y: [[[.28,.4],[.5,.7],[.72,.4]], [[.5,.7],[.5,.96],[.4,.99],[.3,.94]]],
  z: [[[.28,.4],[.72,.4],[.28,.86],[.72,.86]]],
};

const getLetterStrokes = (letter, width, height) => {
  const source = (letter === letter.toUpperCase() ? UPPER_STROKES[letter] : LOWER_STROKES[letter]) || UPPER_STROKES[letter.toUpperCase()];
  const scale = Math.min(width, height) * 0.86;
  const left = (width - scale) / 2;
  const top = (height - scale) / 2 + 8;
  return source.map((stroke) => stroke.map(([x, y]) => ({ x: left + x * scale, y: top + y * scale })));
};

const LetterTrace = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent }) => {
  const difficulty = useGameDifficulty('trace');
  const canvasRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [caseMode, setCaseMode] = useState('upper');
  const [traceReady, setTraceReady] = useState(false);
  const [traceComplete, setTraceComplete] = useState(false);
  const [traceProgress, setTraceProgress] = useState(0);
  const [traceFeedback, setTraceFeedback] = useState('Start at the green 1 and follow each arrow.');
  const drawDistanceRef = useRef(0);
  const onGuideDistanceRef = useRef(0);
  const offGuideDistanceRef = useRef(0);
  const guideStrokesRef = useRef([]);
  const strokeCursorsRef = useRef([]);
  const completedStrokeRef = useRef(0);
  const autoCompleteRef = useRef(false);
  const firstAttemptRef = useRef(true);
  const [traceResetKey, setTraceResetKey] = useState(0);
  const [taughtOnly, setTaughtOnly] = useState(true);

  const visibleLetters = taughtOnly
    ? TRACE_LETTERS.filter((item) => getTaughtGraphemes().has(item.lower))
    : TRACE_LETTERS;

  const current = TRACE_LETTERS[currentIndex];
  const letterChar = caseMode === 'upper' ? current.upper : current.lower;

  useEffect(() => {
    speak(`Trace the ${caseMode === 'upper' ? 'big' : 'small'} ${letterChar}. ${current.word}.`);
  }, [caseMode, letterChar, current.word, speak]);

  const resetTrace = () => {
    drawDistanceRef.current = 0;
    autoCompleteRef.current = false;
    onGuideDistanceRef.current = 0;
    offGuideDistanceRef.current = 0;
    guideStrokesRef.current = [];
    strokeCursorsRef.current = [];
    completedStrokeRef.current = 0;
    firstAttemptRef.current = true;
    setTraceProgress(0);
    setTraceReady(false);
    setTraceComplete(false);
    setTraceFeedback('Start at the green 1 and follow each arrow.');
    setTraceResetKey((value) => value + 1);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let isDrawing = false;
    let activePointerId = null;
    let lastPoint = null;

    const drawArrow = (from, to) => {
      const angle = Math.atan2(to.y - from.y, to.x - from.x);
      const size = 13;
      ctx.save();
      ctx.translate(to.x, to.y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-size, -size * 0.62);
      ctx.lineTo(-size, size * 0.62);
      ctx.closePath();
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.restore();
    };

    const drawGuide = () => {
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const strokes = getLetterStrokes(letterChar, canvas.width, canvas.height);
      guideStrokesRef.current = strokes;
      strokeCursorsRef.current = strokes.map(() => -1);
      completedStrokeRef.current = 0;

      // A very soft letter silhouette helps recognition while the bright,
      // ordered routes teach formation. The child traces the routes, not the
      // arbitrary edge of a device font.
      ctx.font = `bold ${Math.round(Math.min(canvas.width, canvas.height) * 0.68)}px "Arial Rounded MT Bold", "Avenir Next Rounded", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,255,255,.34)';
      ctx.fillText(letterChar, canvas.width / 2, canvas.height / 2 + 12);

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.72)';
      ctx.lineWidth = 13;
      ctx.setLineDash([8, 16]);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      strokes.forEach((stroke) => {
        ctx.beginPath();
        stroke.forEach((point, index) => {
          if (index === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      });
      ctx.setLineDash([]);

      strokes.forEach((stroke, index) => {
        const start = stroke[0];
        const finish = stroke[stroke.length - 1];
        ctx.beginPath();
        ctx.arc(start.x, start.y, 17, 0, Math.PI * 2);
        ctx.fillStyle = '#16a34a';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(index + 1), start.x, start.y + 1);

        ctx.beginPath();
        ctx.arc(finish.x, finish.y, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        const arrowIndex = Math.max(1, Math.floor(stroke.length * 0.56));
        drawArrow(stroke[arrowIndex - 1], stroke[arrowIndex]);
      });
    };

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : window.innerHeight - 160;
      drawGuide();
    };

    const getPoint = (event) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const nearestPoint = (points, point, fromIndex) => {
      let nearest = { index: fromIndex, distance: Number.POSITIVE_INFINITY };
      for (let index = Math.max(0, fromIndex - 3); index < points.length; index += 1) {
        const distance = Math.hypot(point.x - points[index].x, point.y - points[index].y);
        if (distance < nearest.distance) nearest = { index, distance };
      }
      return nearest;
    };

    const updateProgress = () => {
      const strokes = guideStrokesRef.current;
      const totalPoints = strokes.reduce((sum, stroke) => sum + stroke.length, 0);
      const visitedPoints = strokes.reduce((sum, stroke, index) => sum + Math.max(0, Math.min(stroke.length - 1, strokeCursorsRef.current[index] ?? -1) + 1), 0);
      const progress = totalPoints ? Math.round((visitedPoints / totalPoints) * 100) : 0;
      setTraceProgress(progress);
      const allStrokes = strokes.length > 0 && completedStrokeRef.current >= strokes.length;
      const mostlyOnGuide = onGuideDistanceRef.current >= Math.max(1, offGuideDistanceRef.current * (difficulty === 'challenge' ? 2 : 1.35));
      setTraceReady(allStrokes && mostlyOnGuide);
      return { progress, allStrokes, mostlyOnGuide };
    };

    const draw = (event) => {
      if (!isDrawing || event.pointerId !== activePointerId || !lastPoint) return;
      event.preventDefault();
      const point = getPoint(event);
      const distance = Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y);
      drawDistanceRef.current += distance;

      const strokeIndex = completedStrokeRef.current;
      const stroke = guideStrokesRef.current[strokeIndex];
      const cursor = strokeCursorsRef.current[strokeIndex] ?? -1;
      const nearest = stroke ? nearestPoint(stroke, point, Math.max(0, cursor)) : { index: cursor, distance: Infinity };
      const onRoute = Boolean(stroke && nearest.distance <= 52 && nearest.index >= cursor - 3);
      if (onRoute) {
        onGuideDistanceRef.current += distance;
        strokeCursorsRef.current[strokeIndex] = Math.max(cursor, nearest.index);
        const atEnd = nearest.index >= stroke.length - 1 && nearest.distance <= 54;
        if (atEnd) {
          completedStrokeRef.current += 1;
          isDrawing = false;
          setTraceFeedback(completedStrokeRef.current < guideStrokesRef.current.length
            ? `Stroke ${completedStrokeRef.current} complete! Lift up, then start at green ${completedStrokeRef.current + 1}.`
            : 'Every stroke is covered. Check your trace!');
        } else if (nearest.index > cursor + 3) {
          setTraceFeedback('Great direction! Keep following the arrows.');
        }
      } else {
        offGuideDistanceRef.current += distance;
        firstAttemptRef.current = false;
        setTraceFeedback('Keep your pencil close to the blue dotted path.');
      }
      updateProgress();

      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.strokeStyle = onRoute ? '#2563eb' : '#f97316';
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      lastPoint = point;
    };

    const startDrawing = (event) => {
      if (autoCompleteRef.current || event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault();
      const point = getPoint(event);
      const strokeIndex = completedStrokeRef.current;
      const stroke = guideStrokesRef.current[strokeIndex];
      const cursor = strokeCursorsRef.current[strokeIndex] ?? -1;
      const startDistance = stroke ? Math.hypot(point.x - stroke[0].x, point.y - stroke[0].y) : Infinity;
      const resumeDistance = stroke && cursor >= 0 ? Math.hypot(point.x - stroke[cursor].x, point.y - stroke[cursor].y) : Infinity;
      if (!stroke || (cursor < 1 && startDistance > 56) || (cursor >= 1 && Math.min(startDistance, resumeDistance) > 56)) {
        firstAttemptRef.current = false;
        setTraceFeedback(cursor < 1 ? `Start at the green ${strokeIndex + 1}.` : 'Pick up and continue near the last blue dot.');
        return;
      }
      activePointerId = event.pointerId;
      canvas.setPointerCapture?.(event.pointerId);
      isDrawing = true;
      lastPoint = point;
      strokeCursorsRef.current[strokeIndex] = Math.max(cursor, 0);
      // A dot (for example the dot of i or j) is a deliberate one-tap stroke.
      // It has no length for pointermove to traverse, so complete it as soon
      // as the child starts on its green marker.
      if (stroke.length <= 1) {
        completedStrokeRef.current += 1;
        isDrawing = false;
        setTraceFeedback(completedStrokeRef.current < guideStrokesRef.current.length
          ? `Dot complete! Start at green ${completedStrokeRef.current + 1}.`
          : 'Every stroke is covered. Check your trace!');
        updateProgress();
      }
      updateProgress();
    };

    const stopDrawing = (event) => {
      if (event && event.pointerId !== activePointerId) return;
      isDrawing = false;
      if (event) canvas.releasePointerCapture?.(event.pointerId);
      activePointerId = null;
      lastPoint = null;
      const { allStrokes, mostlyOnGuide } = updateProgress();
      if (allStrokes && mostlyOnGuide) setTraceFeedback('Every stroke is covered. Check your trace!');
      else if (completedStrokeRef.current < guideStrokesRef.current.length) setTraceFeedback(`Nice start. Begin the next stroke at green ${completedStrokeRef.current + 1}.`);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('pointerdown', startDrawing);
    canvas.addEventListener('pointermove', draw);
    canvas.addEventListener('pointerup', stopDrawing);
    canvas.addEventListener('pointercancel', stopDrawing);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('pointerdown', startDrawing);
      canvas.removeEventListener('pointermove', draw);
      canvas.removeEventListener('pointerup', stopDrawing);
      canvas.removeEventListener('pointercancel', stopDrawing);
    };
  }, [letterChar, difficulty, traceResetKey]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-sky-100 to-indigo-100">
      <div className="p-4 bg-white/70 flex justify-between items-center shadow-md z-10">
        <button onClick={onBack} className="bg-white p-2 rounded-full hover:bg-white/80" aria-label="Back to all games">
          <Home />
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-blue-700">Letter Trace</h2>
          <p className="text-blue-700/70 font-semibold">
            {letterChar} is for {current.word}
          </p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {visibleLetters.map((item) => {
            const index = TRACE_LETTERS.findIndex((letter) => letter.upper === item.upper);
            return (
            <button
              key={item.upper}
              onClick={() => {
                resetTrace();
                setCurrentIndex(index);
                playSfx('swish');
              }}
              className={`w-12 h-12 rounded-2xl font-black text-xl shadow ${
                index === currentIndex ? 'bg-blue-500 text-white' : 'bg-white text-blue-600'
              }`}
            >
              {caseMode === 'upper' ? item.upper : item.lower}
            </button>
          )})}
        </div>

        <button onClick={() => setTaughtOnly((value) => !value)} className="mb-3 rounded-full bg-white px-4 py-2 text-sm font-black text-blue-700 shadow">
          {taughtOnly ? 'Showing school sounds · Show all' : 'Showing all letters · School sounds only'}
        </button>

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => {
              resetTrace();
              setCaseMode('upper');
            }}
            className={`px-4 py-2 rounded-full font-bold ${
              caseMode === 'upper' ? 'bg-blue-500 text-white' : 'bg-white text-blue-600'
            }`}
          >
            ABC
          </button>
          <button
            onClick={() => {
              resetTrace();
              setCaseMode('lower');
            }}
            className={`px-4 py-2 rounded-full font-bold ${
              caseMode === 'lower' ? 'bg-blue-500 text-white' : 'bg-white text-blue-600'
            }`}
          >
            abc
          </button>
        </div>

        <div className="mb-3 w-full max-w-3xl rounded-2xl border-2 border-white/80 bg-white/75 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-3 text-sm font-black text-blue-800">
            <span>Follow the dotted line</span>
            <span aria-live="polite">{traceProgress}% traced</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-blue-100" role="progressbar" aria-label="Letter trace progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={traceProgress}>
            <div className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 transition-all duration-200" style={{ width: `${traceProgress}%` }} />
          </div>
          <p className="mt-1 text-center text-xs font-bold text-blue-700/75">Start at green 1, follow the arrows, then lift for green 2.</p>
        </div>

        <div className="relative w-full max-w-3xl flex-1 bg-white/60 rounded-3xl shadow-inner border-4 border-blue-200 overflow-hidden">
          <canvas ref={canvasRef} className="touch-none cursor-crosshair w-full h-full" />
        </div>

        <div className="flex gap-3 mt-4 flex-wrap justify-center">
          <button
            onClick={() => {
              resetTrace();
              playSfx('swish');
            }}
            className="bg-white text-blue-600 font-bold px-5 py-2 rounded-full shadow"
          >
            Erase
          </button>
          <button
            onClick={() => {
              if (!traceReady || autoCompleteRef.current) return;
              autoCompleteRef.current = true;
              setTraceComplete(true);
              const praise = getPraise();
              onCelebrate(praise, 8, 250);
              playSfx('sparkle');
              setTraceFeedback(`${praise} You followed the letter.`);
              speak(praise);
              onGameEvent?.('trace', 'answer_correct');
              onGameEvent?.('trace', 'learning_attempt', makeLearningEvent({ skill: 'letter-formation', item: letterChar, response: 'ordered-guide-trace', correct: true, firstTry: firstAttemptRef.current, difficulty, extra: { onGuideDistance: Math.round(onGuideDistanceRef.current), offGuideDistance: Math.round(offGuideDistanceRef.current), strokes: guideStrokesRef.current.length } }));
            }}
            disabled={!traceReady || traceComplete}
            className="bg-blue-500 text-white font-bold px-6 py-2 rounded-full shadow disabled:cursor-not-allowed disabled:opacity-45"
          >
            {traceComplete ? 'Completed!' : traceReady ? 'Check trace!' : 'Trace first'}
          </button>
          <button
            onClick={() => {
              resetTrace();
              setCurrentIndex((prev) => (prev + 1) % TRACE_LETTERS.length);
              playSfx('click');
            }}
            className="bg-white text-blue-600 font-bold px-5 py-2 rounded-full shadow"
          >
            Next letter
          </button>
        </div>
        <p className={`mt-3 text-center text-sm font-bold ${traceReady ? 'text-emerald-700' : 'text-blue-700'}`} aria-live="polite">
          {traceComplete ? traceFeedback : traceReady ? 'The trace follows the letter. Tap Check trace!' : traceFeedback}
        </p>
      </div>
    </div>
  );
};

export default LetterTrace;
