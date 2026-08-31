import { useState, useEffect, useRef, useCallback } from 'react';
import { Home, RotateCcw, Sparkles } from 'lucide-react';
import { SHAPES } from '../../data/index.js';
import { SoundToggle } from '../shared/index.jsx';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';

const SHAPE_ICONS = {
  Circle: '●',
  Square: '■',
  Triangle: '▲',
  Diamond: '◆',
  Star: '★',
  Heart: '♥',
};

const SKY_PRAISE = ['Brilliant flying!', 'Beautiful shape!', 'Fantastic tracing!', 'You nailed it!'];

const interpolatePolygon = (vertices, stepsPerEdge = 12) => vertices.flatMap((point, index) => {
  const next = vertices[(index + 1) % vertices.length];
  return Array.from({ length: stepsPerEdge }, (_, step) => {
    const amount = step / stepsPerEdge;
    return {
      x: point.x + ((next.x - point.x) * amount),
      y: point.y + ((next.y - point.y) * amount),
    };
  });
});

const buildGuidePoints = (shape, width, height) => {
  const cx = width / 2;
  const cy = height / 2 + 18;
  const radius = Math.max(74, Math.min(width, height) * 0.27);

  if (shape === 'Circle') {
    return Array.from({ length: 48 }, (_, index) => {
      const angle = ((index / 48) * Math.PI * 2) - (Math.PI / 2);
      return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
    });
  }

  if (shape === 'Square') {
    return interpolatePolygon([
      { x: cx - radius, y: cy - radius }, { x: cx + radius, y: cy - radius },
      { x: cx + radius, y: cy + radius }, { x: cx - radius, y: cy + radius },
    ]);
  }

  if (shape === 'Triangle') {
    return interpolatePolygon([
      { x: cx, y: cy - radius * 1.12 },
      { x: cx + radius, y: cy + radius * 0.78 },
      { x: cx - radius, y: cy + radius * 0.78 },
    ], 16);
  }

  if (shape === 'Diamond') {
    return interpolatePolygon([
      { x: cx, y: cy - radius * 1.15 }, { x: cx + radius, y: cy },
      { x: cx, y: cy + radius * 1.15 }, { x: cx - radius, y: cy },
    ]);
  }

  if (shape === 'Star') {
    const vertices = Array.from({ length: 10 }, (_, index) => {
      const angle = ((index / 10) * Math.PI * 2) - (Math.PI / 2);
      const pointRadius = index % 2 === 0 ? radius : radius * 0.43;
      return { x: cx + Math.cos(angle) * pointRadius, y: cy + Math.sin(angle) * pointRadius };
    });
    return interpolatePolygon(vertices, 5);
  }

  return Array.from({ length: 52 }, (_, index) => {
    const t = (index / 52) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return { x: cx + (x / 18) * radius, y: cy - (y / 18) * radius };
  });
};

const JetSkyShapes = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent }) => {
  const difficulty = useGameDifficulty('jet');
  const canvasRef = useRef(null);
  const jetRef = useRef(null);
  const guidePointsRef = useRef([]);
  const visitedPointsRef = useRef(new Set());
  const guideCursorRef = useRef(-1);
  const routeStartedRef = useRef(false);
  const routeFinishedRef = useRef(false);
  const [shape, setShape] = useState(SHAPES[0]);
  const [resetKey, setResetKey] = useState(0);
  const [completedShapes, setCompletedShapes] = useState([]);
  const [traceProgress, setTraceProgress] = useState(0);
  const [flightFeedback, setFlightFeedback] = useState('Start at the green dot and follow the arrows.');
  const [routeFinished, setRouteFinished] = useState(false);
  const allCompleteRef = useRef(false);
  const requiredCoverage = difficulty === 'starter' ? 62 : difficulty === 'growing' ? 74 : 86;
  const traceReady = routeFinished && traceProgress >= requiredCoverage;
  const alreadyComplete = completedShapes.includes(shape);

  useEffect(() => {
    speak(`Trace the ${shape}. Follow the glowing flight path.`);
  }, [shape, speak]);

  const markComplete = useCallback(() => {
    setCompletedShapes((previous) => {
      if (previous.includes(shape)) return previous;
      const next = [...previous, shape];
      const praise = SKY_PRAISE[next.length % SKY_PRAISE.length];
      onCelebrate(praise, 4, 200);
      onGameEvent?.('jet', 'answer_correct');
      onGameEvent?.('jet', 'learning_attempt', {
        skill: 'shape-formation', item: shape, response: `${Math.round(traceProgress)}% guide coverage`,
        correct: true, firstAttempt: true, independent: true, hints: 0, difficulty,
      });
      playSfx('sparkle');
      speak(`${praise} You traced the ${shape}.`);
      return next;
    });
  }, [difficulty, onCelebrate, onGameEvent, playSfx, shape, speak, traceProgress]);

  useEffect(() => {
    visitedPointsRef.current = new Set();
    guideCursorRef.current = -1;
    routeStartedRef.current = false;
    routeFinishedRef.current = false;
    if (jetRef.current) {
      jetRef.current.style.opacity = '0';
    }
  }, [shape, resetKey]);

  useEffect(() => {
    if (completedShapes.length !== SHAPES.length || allCompleteRef.current) return;
    allCompleteRef.current = true;
    playSfx('whoosh');
    speak('All six shapes are complete. You are a sky shape superstar!');
    onCelebrate('Sky Shape Superstar!', 12, 300);
  }, [completedShapes, onCelebrate, playSfx, speak]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext('2d');
    if (!context) return undefined;

    let drawing = false;
    let activePointerId = null;
    let lastPoint = null;
    let hue = 205;

    const drawArrow = (from, to) => {
      const angle = Math.atan2(to.y - from.y, to.x - from.x);
      const size = 12;
      context.save();
      context.translate(to.x, to.y);
      context.rotate(angle);
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(-size, -size * 0.6);
      context.lineTo(-size, size * 0.6);
      context.closePath();
      context.fillStyle = '#f59e0b';
      context.fill();
      context.restore();
    };

    const paintScene = () => {
      const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#60a5fa');
      gradient.addColorStop(0.58, '#bae6fd');
      gradient.addColorStop(1, '#ecfccb');
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = 'rgba(255,255,255,.82)';
      [[0.16, 0.2, 36], [0.8, 0.25, 44], [0.67, 0.11, 24]].forEach(([x, y, size]) => {
        context.beginPath();
        context.arc(canvas.width * x, canvas.height * y, size, 0, Math.PI * 2);
        context.arc((canvas.width * x) + size * 0.8, (canvas.height * y) + 5, size * 0.72, 0, Math.PI * 2);
        context.arc((canvas.width * x) - size * 0.75, (canvas.height * y) + 9, size * 0.62, 0, Math.PI * 2);
        context.fill();
      });

      const points = buildGuidePoints(shape, canvas.width, canvas.height);
      guidePointsRef.current = points;
      context.beginPath();
      points.forEach((point, index) => {
        if (index === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      });
      context.closePath();
      context.strokeStyle = 'rgba(255,255,255,.94)';
      context.lineWidth = 18;
      context.setLineDash([4, 14]);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.shadowColor = 'rgba(14,165,233,.7)';
      context.shadowBlur = 18;
      context.stroke();
      context.setLineDash([]);
      context.shadowBlur = 0;

      points.filter((_, index) => index % 8 === 0).forEach((point, markerIndex) => {
        context.beginPath();
        context.arc(point.x, point.y, 7, 0, Math.PI * 2);
        context.fillStyle = '#fef08a';
        context.fill();
        context.strokeStyle = '#f59e0b';
        context.lineWidth = 3;
        context.stroke();
        if (markerIndex < points.length / 8 - 1) drawArrow(point, points[Math.min(points.length - 1, (markerIndex * 8) + 3)]);
      });

      const start = points[0];
      const finish = points[points.length - 1];
      context.beginPath();
      context.arc(start.x, start.y, 18, 0, Math.PI * 2);
      context.fillStyle = '#16a34a';
      context.fill();
      context.lineWidth = 4;
      context.strokeStyle = '#ffffff';
      context.stroke();
      context.fillStyle = '#ffffff';
      context.font = 'bold 14px sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('1', start.x, start.y + 1);
      context.beginPath();
      context.arc(finish.x, finish.y, 11, 0, Math.PI * 2);
      context.fillStyle = '#ef4444';
      context.fill();
      context.strokeStyle = '#ffffff';
      context.stroke();
    };

    // Keep one CSS pixel equal to one drawing coordinate. The game favours
    // dependable touch behaviour over a needlessly large high-DPI buffer.
    const sizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent?.clientWidth || window.innerWidth;
      canvas.height = parent?.clientHeight || 520;
      canvas.style.width = `${canvas.width}px`;
      canvas.style.height = `${canvas.height}px`;
      paintScene();
      const start = guidePointsRef.current[0];
      if (start) moveJet(start);
    };

    const eventPoint = (event) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const moveJet = ({ x, y }) => {
      if (!jetRef.current) return;
      jetRef.current.style.opacity = '1';
      jetRef.current.style.transform = `translate3d(${x - 22}px, ${y - 22}px, 0) rotate(-14deg)`;
    };

    const nearestGuidePoint = (point) => {
      const points = guidePointsRef.current;
      const cursor = guideCursorRef.current;
      let nearest = { index: Math.max(0, cursor), distance: Number.POSITIVE_INFINITY };
      for (let index = Math.max(0, cursor - 3); index < points.length; index += 1) {
        const distance = Math.hypot(point.x - points[index].x, point.y - points[index].y);
        if (distance < nearest.distance) nearest = { index, distance };
      }
      return nearest;
    };

    const recordGuideProgress = (point) => {
      const points = guidePointsRef.current;
      if (!points.length) return false;
      const nearest = nearestGuidePoint(point);
      const cursor = guideCursorRef.current;
      if (nearest.distance > 52 || nearest.index < cursor - 3) return false;

      // Cap the amount of route covered by one pointer event. This prevents a
      // tap-and-jump from completing an entire shape without actually tracing
      // it, while still tolerating less frequent touch events on tablets.
      const nextIndex = Math.min(nearest.index, Math.max(0, cursor) + 10);
      for (let index = Math.max(0, cursor + 1); index <= nextIndex; index += 1) visitedPointsRef.current.add(index);
      guideCursorRef.current = Math.max(cursor, nextIndex);
      const progress = Math.round((visitedPointsRef.current.size / points.length) * 100);
      setTraceProgress((previous) => (progress > previous ? progress : previous));
      if (guideCursorRef.current >= points.length - 1 && nearest.distance <= 54) {
        routeFinishedRef.current = true;
        setRouteFinished(true);
        setFlightFeedback('You reached the red finish dot! Tap Finish flight.');
      } else if (progress >= 25) {
        setFlightFeedback('Great flying! Keep following the arrows to the red dot.');
      }
      return true;
    };

    const startDrawing = (event) => {
      if ((event.pointerType === 'mouse' && event.button !== 0) || routeFinishedRef.current) return;
      event.preventDefault();
      const point = eventPoint(event);
      const points = guidePointsRef.current;
      const cursor = guideCursorRef.current;
      const anchor = points[Math.max(0, cursor)];
      const requiredDistance = cursor < 1 ? Math.hypot(point.x - points[0].x, point.y - points[0].y) : Math.hypot(point.x - anchor.x, point.y - anchor.y);
      if (requiredDistance > 60) {
        setFlightFeedback(cursor < 1 ? 'Start at the green 1, then follow the arrows.' : 'Continue near the last glowing dot.');
        return;
      }
      activePointerId = event.pointerId;
      canvas.setPointerCapture?.(event.pointerId);
      drawing = true;
      routeStartedRef.current = true;
      lastPoint = point;
      moveJet(lastPoint);
      recordGuideProgress(lastPoint);
    };

    const draw = (event) => {
      if (!drawing || event.pointerId !== activePointerId || !lastPoint) return;
      event.preventDefault();
      const point = eventPoint(event);
      const onRoute = recordGuideProgress(point);
      context.beginPath();
      context.moveTo(lastPoint.x, lastPoint.y);
      context.lineTo(point.x, point.y);
      context.strokeStyle = onRoute ? `hsl(${hue}, 92%, 55%)` : '#f97316';
      context.lineWidth = 18;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.shadowColor = 'rgba(255,255,255,.9)';
      context.shadowBlur = 5;
      context.stroke();
      context.shadowBlur = 0;
      lastPoint = point;
      hue = (hue + 2) % 360;
      moveJet(point);
    };

    const stopDrawing = (event) => {
      if (event && event.pointerId !== activePointerId) return;
      drawing = false;
      if (event) canvas.releasePointerCapture?.(event.pointerId);
      activePointerId = null;
      lastPoint = null;
      if (routeFinishedRef.current) setFlightFeedback('You reached the red finish dot! Tap Finish flight.');
      else if (routeStartedRef.current) setFlightFeedback('Nice start. Pick up near the last glowing dot and continue.');
    };

    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);
    canvas.addEventListener('pointerdown', startDrawing);
    canvas.addEventListener('pointermove', draw);
    canvas.addEventListener('pointerup', stopDrawing);
    canvas.addEventListener('pointercancel', stopDrawing);

    return () => {
      window.removeEventListener('resize', sizeCanvas);
      canvas.removeEventListener('pointerdown', startDrawing);
      canvas.removeEventListener('pointermove', draw);
      canvas.removeEventListener('pointerup', stopDrawing);
      canvas.removeEventListener('pointercancel', stopDrawing);
    };
  }, [shape, resetKey]);

  const chooseShape = (option) => {
    setTraceProgress(0);
    setFlightFeedback('Start at the green dot and follow the arrows.');
    setRouteFinished(false);
    setShape(option);
    setResetKey((value) => value + 1);
    playSfx('swish');
  };

  const resetFlight = () => {
    setTraceProgress(0);
    setFlightFeedback('Start at the green dot and follow the arrows.');
    setRouteFinished(false);
    setResetKey((value) => value + 1);
    playSfx('swish');
  };

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-sky-500 via-sky-200 to-lime-100 text-slate-900">
      <header className="relative z-20 px-3 pt-3 sm:px-5 sm:pt-4">
        <div className="flex items-center gap-3 rounded-[1.7rem] border-2 border-white/70 bg-white/90 p-2.5 shadow-xl backdrop-blur sm:p-3">
          <button onClick={onBack} className="game-icon-button shrink-0 !bg-sky-600 !text-white" aria-label="Back to all games"><Home /></button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-600 sm:text-xs">Pilot mission</p>
            <h1 className="truncate text-lg font-black text-slate-800 sm:text-2xl">Sky Shapes</h1>
          </div>
          <div className="hidden min-w-44 sm:block">
            <div className="mb-1 flex justify-between text-xs font-black text-slate-600"><span>Shape flight</span><span>{completedShapes.length}/{SHAPES.length}</span></div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500 transition-all" style={{ width: `${(completedShapes.length / SHAPES.length) * 100}%` }} /></div>
          </div>
          <button onClick={resetFlight} className="game-icon-button shrink-0 !bg-rose-100 !text-rose-600" aria-label="Clear flight path"><RotateCcw /></button>
          <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
        </div>

        <nav className="mt-2 flex gap-2 overflow-x-auto rounded-2xl bg-sky-950/20 p-2 no-scrollbar" aria-label="Choose a shape to trace">
          {SHAPES.map((option) => {
            const complete = completedShapes.includes(option);
            return (
              <button
                key={option}
                onClick={() => chooseShape(option)}
                aria-pressed={shape === option}
                className={`flex min-w-[92px] shrink-0 items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-black shadow-sm transition ${shape === option ? 'border-yellow-300 bg-sky-700 text-white' : 'border-white/70 bg-white/90 text-slate-700'}`}
              >
                <span className={complete ? 'text-emerald-400' : 'text-amber-400'}>{complete ? '✓' : SHAPE_ICONS[option]}</span>{option}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="relative z-10 m-3 mt-2 min-h-[430px] flex-1 overflow-hidden rounded-[2rem] border-4 border-white/80 bg-sky-300 shadow-2xl sm:mx-5 sm:mb-5">
        <canvas ref={canvasRef} className="absolute inset-0 touch-none cursor-crosshair" aria-label={`Trace the ${shape} on the glowing flight path`} />
        <div ref={jetRef} className="pointer-events-none absolute left-0 top-0 z-20 text-4xl opacity-0 drop-shadow-lg transition-opacity" aria-hidden="true">✈️</div>

        <div className="pointer-events-none absolute left-1/2 top-3 z-10 w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 rounded-2xl border-2 border-white/80 bg-slate-950/72 px-4 py-2 text-center text-white shadow-xl backdrop-blur">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl text-amber-300">{SHAPE_ICONS[shape]}</span>
            <strong>Start at green 1. Fly the {shape.toLowerCase()} to red.</strong>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-emerald-400 transition-all" style={{ width: `${traceProgress}%` }} /></div>
            <span className="w-10 text-right text-xs font-black">{traceProgress}%</span>
          </div>
          <p className="mt-1 text-xs font-bold text-sky-100" aria-live="polite">{flightFeedback}</p>
        </div>

        <button
          type="button"
          onClick={markComplete}
          disabled={!traceReady || alreadyComplete}
          className="absolute bottom-4 left-1/2 z-20 flex min-w-44 -translate-x-1/2 items-center justify-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 font-black text-white shadow-[0_7px_0_#075985] transition active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:bg-slate-500 disabled:shadow-none"
        >
          <Sparkles size={18} /> {alreadyComplete ? 'Shape complete!' : traceReady ? 'Finish flight!' : `Follow ${requiredCoverage}% of the path`}
        </button>
      </main>
    </div>
  );
};

export default JetSkyShapes;
