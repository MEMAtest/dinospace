import { useState, useEffect, useRef } from 'react';
import { Home } from 'lucide-react';
import { TRACE_LETTERS } from '../../data/index.js';
import { getPraise } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';
import { getTaughtGraphemes, makeLearningEvent } from '../../data/literacy.js';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';

const LetterTrace = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent }) => {
  const difficulty = useGameDifficulty('trace');
  const canvasRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [caseMode, setCaseMode] = useState('upper');
  const [cleared, setCleared] = useState(false);
  const [traceReady, setTraceReady] = useState(false);
  const [traceComplete, setTraceComplete] = useState(false);
  const [traceProgress, setTraceProgress] = useState(0);
  const [traceFeedback, setTraceFeedback] = useState('Start on the dotted letter and follow its shape.');
  const drawDistanceRef = useRef(0);
  const onGuideDistanceRef = useRef(0);
  const offGuideDistanceRef = useRef(0);
  const guideCoverageRef = useRef(new Set());
  const guideMaskRef = useRef(null);
  const autoCompleteRef = useRef(false);
  const startedOnGuideRef = useRef(false);
  const [taughtOnly, setTaughtOnly] = useState(true);
  const requiredGuideDistance = difficulty === 'starter' ? 150 : difficulty === 'challenge' ? 260 : 190;

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
    guideCoverageRef.current = new Set();
    setTraceProgress(0);
    setTraceReady(false);
    setTraceComplete(false);
    setTraceFeedback('Start on the dotted letter and follow its shape.');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    const drawGuide = () => {
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 220px "Arial Rounded MT Bold", "Avenir Next Rounded", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.45)';
      ctx.lineWidth = 12;
      ctx.setLineDash([24, 16]);
      ctx.strokeText(letterChar, canvas.width / 2, canvas.height / 2 + 20);
      ctx.setLineDash([]);
      guideMaskRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    };

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : window.innerHeight - 160;
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
      const mask = guideMaskRef.current;
      let nearGuide = false;
      if (mask) {
        const centerX = Math.round(x);
        const centerY = Math.round(y);
        for (let offsetY = -22; offsetY <= 22 && !nearGuide; offsetY += 6) {
          for (let offsetX = -22; offsetX <= 22; offsetX += 6) {
            const sampleX = centerX + offsetX;
            const sampleY = centerY + offsetY;
            if (sampleX < 0 || sampleY < 0 || sampleX >= canvas.width || sampleY >= canvas.height) continue;
            const red = mask[((sampleY * canvas.width) + sampleX) * 4];
            if (red < 210) { nearGuide = true; break; }
          }
        }
      }
      if (nearGuide) {
        onGuideDistanceRef.current += distance;
        // A trace must travel across the shape, not just scribble in one
        // small spot. Coarse cells make this robust on touch screens while
        // keeping the check forgiving for young learners.
        guideCoverageRef.current.add(`${Math.floor(x / 28)}:${Math.floor(y / 28)}`);
      }
      else offGuideDistanceRef.current += distance;
      const guideRatio = difficulty === 'starter' ? 1.2 : difficulty === 'challenge' ? 2 : 1.5;
      const requiredCoverage = difficulty === 'starter' ? 7 : difficulty === 'challenge' ? 14 : 10;
      const enoughGuide = onGuideDistanceRef.current >= requiredGuideDistance;
      const mostlyOnGuide = onGuideDistanceRef.current >= offGuideDistanceRef.current * guideRatio;
      const coverage = guideCoverageRef.current.size;
      const enoughCoverage = coverage >= requiredCoverage;
      setTraceProgress(Math.min(100, Math.round(Math.min(onGuideDistanceRef.current / requiredGuideDistance, coverage / requiredCoverage) * 100)));
      setTraceReady(enoughGuide && mostlyOnGuide && enoughCoverage);

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      [lastX, lastY] = [x, y];
    };

    const startDrawing = (event) => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      [lastX, lastY] = [clientX - rect.left, clientY - rect.top];
      const mask = guideMaskRef.current;
      const sampleX = Math.round(lastX);
      const sampleY = Math.round(lastY);
      let onGuide = false;
      if (mask) {
        for (let offsetY = -28; offsetY <= 28 && !onGuide; offsetY += 7) {
          for (let offsetX = -28; offsetX <= 28; offsetX += 7) {
            const x = sampleX + offsetX;
            const y = sampleY + offsetY;
            if (x >= 0 && y >= 0 && x < canvas.width && y < canvas.height && mask[((y * canvas.width) + x) * 4] < 210) { onGuide = true; break; }
          }
        }
      }
      startedOnGuideRef.current = onGuide;
      isDrawing = onGuide;
      if (!onGuide) setTraceFeedback('Start on the dotted letter.');
    };

    const stopDrawing = () => {
      isDrawing = false;
      if (drawDistanceRef.current > 80 && !autoCompleteRef.current) {
        const guideRatio = difficulty === 'starter' ? 1.2 : difficulty === 'challenge' ? 2 : 1.5;
        const mostlyOnGuide = startedOnGuideRef.current && onGuideDistanceRef.current >= offGuideDistanceRef.current * guideRatio;
        const requiredCoverage = difficulty === 'starter' ? 7 : difficulty === 'challenge' ? 14 : 10;
        const enoughCoverage = guideCoverageRef.current.size >= requiredCoverage;
        setTraceFeedback(mostlyOnGuide && enoughCoverage ? 'Good path. Keep following the dotted letter.' : 'Follow more of the dotted letter, from one end to the other.');
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
  }, [letterChar, cleared, difficulty, onCelebrate, playSfx, requiredGuideDistance, speak]);

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
                setCleared((prev) => !prev);
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
              setCleared((prev) => !prev);
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
              setCleared((prev) => !prev);
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
          <p className="mt-1 text-center text-xs font-bold text-blue-700/75">Start on any dotted stroke, then keep your pencil close.</p>
        </div>

        <div className="relative w-full max-w-3xl flex-1 bg-white/60 rounded-3xl shadow-inner border-4 border-blue-200 overflow-hidden">
          <canvas ref={canvasRef} className="touch-none cursor-crosshair w-full h-full" />
        </div>

        <div className="flex gap-3 mt-4 flex-wrap justify-center">
          <button
            onClick={() => {
              resetTrace();
              setCleared((prev) => !prev);
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
              onGameEvent?.('trace', 'learning_attempt', makeLearningEvent({ skill: 'letter-formation', item: letterChar, response: 'guide-trace', correct: true, firstTry: offGuideDistanceRef.current === 0, difficulty: caseMode === 'upper' ? 'starter' : 'growing', extra: { onGuideDistance: Math.round(onGuideDistanceRef.current), offGuideDistance: Math.round(offGuideDistanceRef.current) } }));
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
              setCleared((prev) => !prev);
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
