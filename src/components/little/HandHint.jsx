import { useEffect, useRef, useState } from 'react';
import { artUrl } from './littleArt.js';

const HandArt = () => {
  const raster = artUrl('hand-pointer');
  if (raster) return <img src={raster} alt="" className="h-20 w-20 object-contain drop-shadow-xl" draggable={false} />;
  return (
    <svg viewBox="0 0 80 90" className="h-20 w-20 drop-shadow-xl" aria-hidden="true">
      <path
        d="M24 8 Q24 2 30 2 Q36 2 36 8 L36 38 Q38 32 44 33 Q50 34 50 40 Q52 35 58 36 Q64 38 63 45 Q66 41 71 43 Q76 46 75 53 L73 70 Q70 86 52 88 L38 88 Q26 87 20 76 L8 56 Q5 50 10 47 Q15 45 19 50 L24 58 Z"
        fill="#fde2c4"
        stroke="#1e293b"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M36 40 L36 56 M50 42 L50 56 M63 47 L63 58" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" opacity=".5" />
    </svg>
  );
};

// A cartoon hand that shows the child what to do: drag from one thing to
// another, tap a thing, or press and hold it. `from`/`to` are functions that
// return DOM elements, measured once shown and re-measured while visible.
const HandHint = ({ show, from, to, mode = 'drag' }) => {
  const [pos, setPos] = useState(null);
  const targets = useRef({ from, to });
  useEffect(() => { targets.current = { from, to }; });

  useEffect(() => {
    if (!show) return undefined;
    const measure = () => {
      const a = targets.current.from?.();
      if (!a) { setPos(null); return; }
      const ra = a.getBoundingClientRect();
      const b = mode === 'drag' ? targets.current.to?.() : null;
      const rb = b?.getBoundingClientRect();
      const x = ra.left + ra.width / 2;
      const y = ra.top + ra.height / 2;
      const next = { x, y, dx: rb ? rb.left + rb.width / 2 - x : 0, dy: rb ? rb.top + rb.height / 2 - y : 0 };
      setPos((current) => (current && Math.abs(current.x - next.x) < 2 && Math.abs(current.y - next.y) < 2
        && Math.abs(current.dx - next.dx) < 2 && Math.abs(current.dy - next.dy) < 2 ? current : next));
    };
    const frame = requestAnimationFrame(measure);
    const interval = setInterval(measure, 600);
    return () => { cancelAnimationFrame(frame); clearInterval(interval); };
  }, [mode, show]);

  if (!show || !pos) return null;
  const animation = mode === 'drag' ? 'animate-hand-drag' : mode === 'hold' ? 'animate-hand-hold' : 'animate-hand-tap';
  return (
    <div
      className="pointer-events-none fixed z-[70]"
      style={{ left: pos.x, top: pos.y, '--dx': `${pos.dx}px`, '--dy': `${pos.dy}px` }}
      aria-hidden="true"
    >
      {/* The fingertip sits at the top-left of the hand art. */}
      <div className={`relative ${animation}`} style={{ marginLeft: -24, marginTop: -4 }}>
        {mode === 'hold' && <span className="absolute left-1 top-0 h-10 w-10 rounded-full border-4 border-white/90 animate-ring-expand" />}
        <HandArt />
      </div>
    </div>
  );
};

export default HandHint;
