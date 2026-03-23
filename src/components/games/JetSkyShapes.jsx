import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Home, Cloud } from 'lucide-react';
import { SHAPES } from '../../data/index.js';
import { pickRandom, shuffle, getPraise } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';

const JetSkyShapes = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const canvasRef = useRef(null);
  const [shape, setShape] = useState(SHAPES[0]);
  const [cleared, setCleared] = useState(false);
  const [completedShapes, setCompletedShapes] = useState([]);
  const drawDistanceRef = useRef(0);
  const autoCompleteRef = useRef(false);
  const allCompleteRef = useRef(false);

  useEffect(() => {
    speak(`Trace the ${shape}.`);
  }, [shape, speak]);

  const markComplete = useCallback((praise) => {
    setCompletedShapes((prev) => {
      if (prev.includes(shape)) return prev;
      const next = [...prev, shape];
      const message = praise || getPraise();
      onCelebrate(message, 4, 200);
      return next;
    });
  }, [onCelebrate, shape]);

  useEffect(() => {
    drawDistanceRef.current = 0;
    autoCompleteRef.current = false;
  }, [shape, cleared, markComplete, playSfx, speak]);

  useEffect(() => {
    if (completedShapes.length !== SHAPES.length) return;
    if (allCompleteRef.current) return;
    allCompleteRef.current = true;
    playSfx('whoosh');
    speak('Alle Formen geschafft!', { lang: 'de-DE', rate: 0.9, pitch: 1.05 });
    onCelebrate(getPraise(), 12, 300);
  }, [completedShapes, onCelebrate, playSfx, speak]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let hue = 0;

    const drawStar = (cx, cy, spikes, outerRadius, innerRadius) => {
      let rotation = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i += 1) {
        x = cx + Math.cos(rotation) * outerRadius;
        y = cy + Math.sin(rotation) * outerRadius;
        ctx.lineTo(x, y);
        rotation += step;

        x = cx + Math.cos(rotation) * innerRadius;
        y = cy + Math.sin(rotation) * innerRadius;
        ctx.lineTo(x, y);
        rotation += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
    };

    const drawHeart = (cx, cy, size) => {
      const topCurveHeight = size * 0.3;
      ctx.beginPath();
      ctx.moveTo(cx, cy + size * 0.3);
      ctx.bezierCurveTo(cx, cy, cx - size / 2, cy, cx - size / 2, cy + topCurveHeight);
      ctx.bezierCurveTo(
        cx - size / 2,
        cy + size * 0.8,
        cx,
        cy + size,
        cx,
        cy + size,
      );
      ctx.bezierCurveTo(
        cx,
        cy + size,
        cx + size / 2,
        cy + size * 0.8,
        cx + size / 2,
        cy + topCurveHeight,
      );
      ctx.bezierCurveTo(cx + size / 2, cy, cx, cy, cx, cy + size * 0.3);
      ctx.closePath();
    };

    const drawGuide = () => {
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 10;
      ctx.setLineDash([20, 15]);
      ctx.beginPath();
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      if (shape === 'Circle') ctx.arc(cx, cy, 110, 0, Math.PI * 2);
      if (shape === 'Square') ctx.rect(cx - 110, cy - 110, 220, 220);
      if (shape === 'Triangle') {
        ctx.moveTo(cx, cy - 130);
        ctx.lineTo(cx + 130, cy + 90);
        ctx.lineTo(cx - 130, cy + 90);
        ctx.closePath();
      }
      if (shape === 'Diamond') {
        ctx.moveTo(cx, cy - 130);
        ctx.lineTo(cx + 130, cy);
        ctx.lineTo(cx, cy + 130);
        ctx.lineTo(cx - 130, cy);
        ctx.closePath();
      }
      if (shape === 'Star') {
        drawStar(cx, cy, 5, 130, 55);
      }
      if (shape === 'Heart') {
        drawHeart(cx, cy - 60, 180);
      }

      ctx.stroke();
      ctx.setLineDash([]);
    };

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : window.innerHeight - 100;
      drawGuide();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = (event) => {
      if (!isDrawing) return;
      event.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const distance = Math.hypot(x - lastX, y - lastY);
      drawDistanceRef.current += distance;

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = `hsl(${hue}, 100%, 55%)`;
      ctx.lineWidth = 22;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      [lastX, lastY] = [x, y];
      hue += 1;
    };

    const startDrawing = (event) => {
      isDrawing = true;
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      [lastX, lastY] = [clientX - rect.left, clientY - rect.top];
    };

    const stopDrawing = () => {
      isDrawing = false;
      if (drawDistanceRef.current > 520 && !autoCompleteRef.current) {
        autoCompleteRef.current = true;
        const praise = getPraise();
        markComplete(praise);
        playSfx('sparkle');
        speak(praise, { lang: 'de-DE', rate: 0.9, pitch: 1.05 });
      }
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [shape, cleared]);

  return (
    <div className="min-h-screen flex flex-col bg-sky-100">
      <div className="p-4 bg-sky-200 flex justify-between items-center shadow-md z-10">
        <button onClick={onBack} className="bg-white p-2 rounded-full hover:bg-white/80">
          <Home />
        </button>
        <div className="flex gap-2 flex-wrap">
          {SHAPES.map((option) => (
            <button
              key={option}
              onClick={() => {
                setShape(option);
                setCleared((prev) => !prev);
                playSfx('swish');
              }}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${
                shape === option ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
              }`}
            >
              {completedShapes.includes(option) ? `✓ ${option}` : option}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setCleared((prev) => !prev);
              playSfx('swish');
            }}
            className="bg-red-400 text-white p-2 rounded-full hover:bg-red-500"
          >
            <Cloud />
          </button>
          <button
            onClick={() => {
              const praise = getPraise();
              markComplete(praise);
              playSfx('sparkle');
              speak(praise, { lang: 'de-DE', rate: 0.9, pitch: 1.05 });
            }}
            className="bg-white text-sky-700 px-3 py-2 rounded-full font-bold shadow-lg"
          >
            Done!
          </button>
          <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute top-4 left-0 w-full text-center text-sky-700 font-bold opacity-70 pointer-events-none">
          Trace the shape with your finger! ({completedShapes.length}/{SHAPES.length} complete)
        </div>
        <div className="absolute top-16 left-4 w-32 h-16 bg-white/70 rounded-full blur-lg animate-drift-left" />
        <div className="absolute top-24 right-10 w-40 h-20 bg-white/70 rounded-full blur-lg animate-drift-right" />
        <div className="absolute bottom-10 left-12 text-4xl animate-bounce-slow">✈️</div>
        <canvas ref={canvasRef} className="touch-none cursor-crosshair" />
      </div>
    </div>
  );
};

export default JetSkyShapes;
