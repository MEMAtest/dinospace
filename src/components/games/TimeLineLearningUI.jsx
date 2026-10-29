import { useRef, useState } from 'react';
import { ArrowLeft, Check, Clock3, Volume2 } from 'lucide-react';
import { SoundToggle } from '../shared/index.jsx';
import { clockAngles, formatClock, advanceClock, timeLabel } from '../../data/timeLineAdventure.js';
import { clockTimeAtPoint } from '../../data/timeLineInteraction.js';

export function LearningHeader({ title, subtitle, onBack, soundOn, onToggleSound, compact = false }) {
  return <header className={`mx-auto flex max-w-4xl items-center justify-between gap-2 rounded-3xl border-2 border-white bg-white/95 shadow-md ${compact ? 'p-2' : 'p-3'}`}>
    <button type="button" className="game-icon-button !min-h-12 !min-w-12 shrink-0" onClick={onBack} aria-label="Back"><ArrowLeft /></button>
    <div className="text-center"><p className={`font-black uppercase tracking-wide text-sky-800 ${compact ? 'text-[9px] sm:text-[11px]' : 'text-[11px]'}`}>{subtitle}</p><h1 className={`font-black ${compact ? 'text-lg sm:text-3xl' : 'text-xl sm:text-3xl'}`}>{title}</h1></div>
    <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
  </header>;
}
export function LearningChapters({ chapters, selected, progress, onSelect, noun = 'Chapter', selectionDisabled = false }) {
  return <div className="grid gap-3 sm:grid-cols-3">{chapters.map((c, i) => {
    const complete = progress.completedChapterIds.includes(c.id), locked = i > progress.unlockedChapter;
    return <button type="button" key={c.id} disabled={locked || selectionDisabled} onClick={() => onSelect(i)} aria-pressed={selected === i} className={`min-h-20 rounded-2xl border-2 p-4 text-left disabled:opacity-50 ${selected === i ? 'border-sky-600 bg-sky-50 shadow-md' : 'border-slate-200 bg-white'}`}>
      <span className="mb-1 flex items-center justify-between text-xs font-black uppercase text-sky-800">{noun} {i + 1}{complete ? <Check size={20} aria-label="Badge earned" /> : locked ? 'Locked' : 'Ready'}</span>
      <strong className="block text-lg">{c.title}</strong><span className="mt-1 block text-sm font-semibold text-slate-600">{c.skill}</span>
      {complete && <span className="mt-2 block text-sm font-bold text-amber-800">{'★'.repeat(progress.bestStars[c.id] || 1)} · Badge earned</span>}
    </button>;
  })}</div>;
}
export function Explanation({ text, onHear, onNext, nextLabel }) {
  return <section aria-label="Worked answer" className="mt-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4">
    <p className="mb-2 text-xs font-black uppercase tracking-wide text-emerald-800">You worked it out!</p>
    <p role="status" className="font-bold text-slate-800">{text}</p>
    <div className="mt-3 flex flex-wrap justify-center gap-2"><button type="button" onClick={onHear} className="inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-emerald-600 bg-white px-4 font-black text-emerald-900"><Volume2 size={20} />Hear explanation</button><button type="button" onClick={onNext} className="min-h-14 grow rounded-xl bg-emerald-800 px-6 text-lg font-black text-white">{nextLabel} →</button></div>
  </section>;
}
export function LearningClock({ time, label = 'Learning clock', onChange, disabled = false, compact = false }) {
  const [hand, setHand] = useState('minute');
  const dragging = useRef(false);
  const angles = clockAngles(time);
  const point = e => {
    const r = e.currentTarget.getBoundingClientRect();
    onChange?.(clockTimeAtPoint(time, hand, (e.clientX - r.left) / r.width * 200, (e.clientY - r.top) / r.height * 200));
  };
  const editable = !!onChange && !disabled;
  return <div className="mx-auto max-w-sm">
    {editable && <div className={`flex justify-center gap-2 ${compact ? 'mb-2 sm:mb-3' : 'mb-3'}`} role="group" aria-label="Choose a clock hand">
      <button type="button" aria-pressed={hand === 'hour'} onClick={() => setHand('hour')} className={`min-h-12 rounded-xl border-2 px-3 font-black ${compact ? 'text-sm sm:text-base' : ''} ${hand === 'hour' ? 'border-rose-700 bg-rose-100' : 'border-slate-200 bg-white'}`}>Short · hour</button>
      <button type="button" aria-pressed={hand === 'minute'} onClick={() => setHand('minute')} className={`min-h-12 rounded-xl border-2 px-3 font-black ${compact ? 'text-sm sm:text-base' : ''} ${hand === 'minute' ? 'border-sky-700 bg-sky-100' : 'border-slate-200 bg-white'}`}>Long · minute</button>
    </div>}
    <svg viewBox="0 0 200 200" role="img" aria-label={label} data-hour-angle={angles.hour} data-minute-angle={angles.minute} className={`mx-auto max-w-full drop-shadow-lg ${compact ? 'h-40 w-40 sm:h-56 sm:w-56' : 'h-64 w-64 sm:h-72 sm:w-72'} ${editable ? 'touch-none cursor-grab' : ''}`}
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
      <p className={`text-slate-600 ${compact ? 'hidden sm:block sm:text-sm' : 'mt-1 text-sm'}`}>{compact ? 'Or use the buttons; minutes move in quarters.' : 'Or use these buttons. Minutes move in quarters.'}</p>
      <p aria-live="polite" className={`font-black ${compact ? 'my-0.5 text-base sm:my-3 sm:text-xl' : 'my-3 text-xl'}`}>Set time: {formatClock(time)}</p>
      <div className={`grid ${compact ? 'grid-cols-4 gap-1 sm:gap-2' : 'grid-cols-2 gap-2'} ${compact ? 'mx-auto max-w-sm' : ''}`}>
        {[['Hour earlier', 'Hour −', -60], ['Hour later', 'Hour +', 60], ['Minute hand back 15 minutes', compact ? 'Min −15' : 'Minutes −15', -15], ['Minute hand forward 15 minutes', compact ? 'Min +15' : 'Minutes +15', 15]].map(([label, text, delta]) => <button type="button" key={label} aria-label={label} onClick={() => onChange(advanceClock(time, delta))} className={`min-h-12 min-w-0 rounded-xl border-2 px-0.5 text-xs font-black sm:px-2 sm:text-sm ${Math.abs(delta) === 60 ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-sky-200 bg-sky-50 text-sky-900'}`}>{text}</button>)}
      </div>
    </> : <div className={`mt-2 flex flex-wrap justify-center gap-2 text-sm font-bold sm:mt-3 ${compact ? 'text-xs sm:text-sm' : ''}`}><span className="rounded-full bg-rose-50 px-3 py-2 text-rose-900">Short hand · hour</span><span className="rounded-full bg-sky-50 px-3 py-2 text-sky-900">Long hand · minutes</span></div>}
  </div>;
}
export function ClockPractice() {
  const [open, setOpen] = useState(false), [time, setTime] = useState({ hour: 3, minute: 0 });
  return <section className="mt-4 rounded-3xl border-2 border-sky-100 bg-white p-4 text-center">
    <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="inline-flex min-h-12 items-center gap-2 rounded-xl px-4 font-black text-sky-900"><Clock3 />{open ? 'Close clock practice' : 'Try moving the clock hands'}</button>
    {open && <div className="mt-3"><p className="mb-3 font-bold">Explore first. This practice does not change your stars.</p><LearningClock time={time} onChange={setTime} label="Practice clock" /><p className="mt-3 rounded-xl bg-amber-50 p-3 font-black">{formatClock(time)} · {timeLabel(time)}</p></div>}
  </section>;
}
