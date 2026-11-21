import { useId, useRef, useState } from 'react';
import { clockAngles, formatClock, advanceClock } from '../../data/timeLineAdventure.js';
import { clockTimeAtPoint } from '../../data/timeLineInteraction.js';

export function LearningClock({ time, label = 'Learning clock', onChange, disabled = false, compact = false }) {
  const [hand, setHand] = useState('minute');
  const dragging = useRef(false);
  const handId = useId();
  const angles = clockAngles(time);
  const point = e => {
    const r = e.currentTarget.getBoundingClientRect();
    onChange?.(clockTimeAtPoint(time, hand, (e.clientX - r.left) / r.width * 200, (e.clientY - r.top) / r.height * 200));
  };
  const editable = !!onChange && !disabled;
  return <div className="mx-auto max-w-sm">
    {editable && <div className="mx-auto mb-3 flex w-fit flex-wrap items-center justify-center gap-2">
      <label htmlFor={handId} className="font-bold">Move</label>
      <select id={handId} value={hand} onChange={event => setHand(event.target.value)} className="min-h-12 rounded-lg border border-slate-300 bg-white px-2 font-bold">
        <option value="hour">Short hand · hours</option>
        <option value="minute">Long hand · minutes</option>
      </select>
    </div>}
    <svg viewBox="0 0 200 200" role="img" aria-label={label} data-hour-angle={angles.hour} data-minute-angle={angles.minute} className={`mx-auto max-w-full drop-shadow-lg ${compact ? 'h-auto w-[min(58vw,17rem)] sm:w-[min(45vw,22rem)]' : 'h-auto w-[min(64vw,19rem)]'} ${editable ? 'touch-none cursor-grab' : ''}`}
      onPointerDown={e => { if (!editable) return; dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); point(e); }}
      onPointerMove={e => { if (editable && dragging.current) point(e); }}
      onPointerUp={() => { dragging.current = false; }} onPointerCancel={() => { dragging.current = false; }}>
      <circle cx="100" cy="100" r="96" fill="#0c4a6e" /><circle cx="100" cy="100" r="89" fill="#fffbeb" stroke="#fbbf24" strokeWidth="4" />
      {Array.from({ length: 60 }, (_, i) => <line key={i} x1="100" y1={i % 5 ? 16 : 14} x2="100" y2={i % 5 ? 19 : 23} stroke={i % 5 ? '#cbd5e1' : '#0c4a6e'} strokeWidth={i % 5 ? 1 : 2} transform={`rotate(${i * 6} 100 100)`} />)}
      {Array.from({ length: 12 }, (_, i) => { const a = (i + 1) * Math.PI / 6 - Math.PI / 2; return <text key={i} x={100 + 64 * Math.cos(a)} y={100 + 64 * Math.sin(a)} textAnchor="middle" dominantBaseline="central" fill="#173b77" fontSize="16" fontWeight="900">{i + 1}</text>; })}
      <line x1="100" y1="108" x2="100" y2="61" stroke="#be123c" strokeWidth="10" strokeLinecap="round" transform={`rotate(${angles.hour} 100 100)`} />
      <line x1="100" y1="111" x2="100" y2="32" stroke="#0369a1" strokeWidth="6" strokeLinecap="round" transform={`rotate(${angles.minute} 100 100)`} /><circle cx="100" cy="100" r="7" fill="#fbbf24" stroke="#78350f" strokeWidth="2" />
    </svg>
    {editable ? <>
      <p className={`font-bold text-sky-900 ${compact ? 'hidden sm:block sm:mt-2 sm:text-sm' : 'mt-3 text-sm'}`}>{compact ? `Tap or drag the ${hand === 'hour' ? 'short hour' : 'long minute'} hand.` : `Tap or drag the ${hand === 'hour' ? 'short hour' : 'long minute'} hand around the clock.`}</p>
      <p className={`text-slate-600 ${compact ? 'hidden sm:block sm:text-sm' : 'mt-1 text-sm'}`}>{compact ? 'Or use the buttons to move the selected hand.' : 'Or use the buttons to move the selected hand.'}</p>
      <p aria-live="polite" className={`font-black ${compact ? 'my-0.5 text-base sm:my-3 sm:text-xl' : 'my-3 text-xl'}`}>Set time: {formatClock(time)}</p>
      <div className="focus-game-actions" role="group" aria-label="Clock movement">
        <button type="button" className="focus-game-button" aria-label={hand === 'hour' ? 'Hour earlier' : 'Minute hand back 15 minutes'} onClick={() => onChange(advanceClock(time, hand === 'hour' ? -60 : -15))}>{hand === 'hour' ? '−1 hour' : '−15 minutes'}</button>
        <button type="button" className="focus-game-button" aria-label={hand === 'hour' ? 'Hour later' : 'Minute hand forward 15 minutes'} onClick={() => onChange(advanceClock(time, hand === 'hour' ? 60 : 15))}>{hand === 'hour' ? '+1 hour' : '+15 minutes'}</button>
      </div>
    </> : <div className={`mt-2 flex flex-wrap justify-center gap-2 text-sm font-bold sm:mt-3 ${compact ? 'text-xs sm:text-sm' : ''}`}><span className="rounded-full bg-rose-50 px-3 py-2 text-rose-900">Short hand · hour</span><span className="rounded-full bg-sky-50 px-3 py-2 text-sky-900">Long hand · minutes</span></div>}
  </div>;
}
