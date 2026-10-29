import { useRef } from 'react';
export const Frog = ({ compact = false }) => <svg viewBox="0 0 80 64" aria-hidden="true" className={`${compact ? 'h-8 w-10 sm:h-10 sm:w-12' : 'h-12 w-14'} drop-shadow-md`}>
  <ellipse cx="40" cy="45" rx="30" ry="16" fill="#15803d" /><ellipse cx="40" cy="34" rx="27" ry="22" fill="#4ade80" /><ellipse cx="40" cy="45" rx="18" ry="12" fill="#d9f99d" />
  <circle cx="24" cy="17" r="13" fill="#4ade80" /><circle cx="56" cy="17" r="13" fill="#4ade80" /><circle cx="24" cy="16" r="8" fill="white" /><circle cx="56" cy="16" r="8" fill="white" /><circle cx="26" cy="17" r="4" fill="#173b37" /><circle cx="54" cy="17" r="4" fill="#173b37" /><path d="M27 34 Q40 44 53 34" fill="none" stroke="#166534" strokeWidth="3" strokeLinecap="round" /><ellipse cx="16" cy="55" rx="13" ry="6" fill="#22c55e" /><ellipse cx="64" cy="55" rx="13" ry="6" fill="#22c55e" />
</svg>;

// A display scale, not 21 tiny tap targets. Large hop controls remain below it.
export default function NumberLineJourney({ limit, start, end, position, trail = [], label, showRoute = false, onSwipe, disabled = false, compact = false }) {
  const pointer = useRef(null);
  const pct = n => 10 + n / limit * 80;
  const x = n => 60 + n / limit * 480;
  const path = trail.length ? [start, ...trail] : showRoute && Number.isInteger(start) && Number.isInteger(end) ? Array.from({ length: Math.abs(end - start) + 1 }, (_, i) => start + i * Math.sign(end - start)) : [];
  return <figure aria-label={label} className={`min-w-0 rounded-2xl border-2 border-teal-200 bg-gradient-to-b from-sky-50 to-lime-50 ${compact ? 'p-1 sm:p-3' : 'p-2 sm:p-4'}`}>
    <figcaption className={`flex flex-wrap justify-center gap-x-3 gap-y-0.5 font-black text-teal-950 ${compact ? 'text-[11px] leading-tight sm:text-sm' : 'text-sm'}`}><span>{label}</span>{Number.isInteger(start) && <span>Start: {start}</span>}{Number.isInteger(end) && <span>Land: {end}</span>}</figcaption>
    <div className={`relative select-none ${compact ? 'mt-1 h-24 sm:h-32' : 'mt-2 h-40'}`} role="group" aria-label={`Number line from 0 to ${limit}`}>
      <svg viewBox="0 0 600 160" preserveAspectRatio="none" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full">
        <line x1="60" y1="104" x2="540" y2="104" stroke="#64748b" strokeWidth="3" />
        {path.slice(1).map((n, i) => <path key={`${i}:${n}`} data-hop-arc d={`M ${x(path[i])} 98 Q ${(x(path[i]) + x(n)) / 2} 48 ${x(n)} 98`} fill="none" stroke="#0f766e" strokeWidth="4" />)}
      </svg>
      {Array.from({ length: limit + 1 }, (_, n) => <div key={n} className={`absolute -translate-x-1/2 text-center ${compact ? 'top-[59px] sm:top-[78px]' : 'top-[98px]'}`} style={{ left: `${pct(n)}%` }}><span className={`mx-auto block w-0.5 ${compact ? 'h-[7px] sm:h-3' : 'h-3'} ${path.includes(n) ? 'bg-teal-700' : 'bg-slate-400'}`} /><span className={`mt-1 block font-black text-slate-800 ${compact ? 'text-[9px] leading-none sm:text-sm' : 'text-xs sm:text-sm'} ${limit > 10 && n % 2 ? 'invisible sm:visible' : ''}`}>{n}</span></div>)}
      {Number.isInteger(position) && <div className={`absolute -translate-x-1/2 transition-[left] duration-300 motion-reduce:transition-none ${compact ? 'top-[16px] sm:top-[21px] flex min-h-11 min-w-11 flex-col items-center' : 'top-[26px]'} ${onSwipe && !disabled ? 'touch-pan-y cursor-grab' : ''}`} style={{ left: `${pct(position)}%` }}
        onPointerDown={e => { if (!onSwipe || disabled) return; pointer.current = { x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerUp={e => { const p = pointer.current; pointer.current = null; if (!p || disabled) return; const dx = e.clientX - p.x, dy = e.clientY - p.y; if (Math.abs(dx) >= 18 && Math.abs(dx) > Math.abs(dy)) onSwipe?.(dx > 0 ? 1 : -1); }}
        onPointerCancel={() => { pointer.current = null; }}><Frog compact={compact} /><span className="mx-auto block w-fit rounded-full bg-teal-800 px-2 text-xs font-black text-white">{position}</span></div>}
    </div>
  </figure>;
}
