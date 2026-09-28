import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Home, Lock, Play } from 'lucide-react';
import { SoundToggle } from './index.jsx';

// One header for every non-game page: a big back button, a title and an
// optional right-hand slot. Keeps back in the same place on every screen.
export const PageHeader = ({ title, subtitle, onBack, backLabel = 'Back', right, soundOn, onToggleSound, tone = 'light' }) => (
  <header className={`relative z-20 flex w-full max-w-7xl items-center gap-3 rounded-[1.7rem] border px-3 py-3 shadow-[0_12px_34px_rgba(30,105,175,.12)] backdrop-blur-xl sm:px-5 ${tone === 'dark' ? 'border-white/15 bg-slate-950/40 text-white' : 'border-white/80 bg-white/80 text-slate-900'}`}>
    {onBack && (
      <button
        type="button"
        onClick={onBack}
        aria-label={backLabel}
        className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-b from-sky-400 to-blue-600 text-white shadow-[0_5px_0_#1e3a8a] transition hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
      >
        <ArrowLeft size={28} strokeWidth={3} />
      </button>
    )}
    <div className="min-w-0 flex-1">
      <h1 className="truncate text-2xl font-black leading-tight sm:text-3xl">{title}</h1>
      {subtitle && <p className={`truncate text-sm font-bold ${tone === 'dark' ? 'text-white/70' : 'text-slate-500'}`}>{subtitle}</p>}
    </div>
    {right}
    {onToggleSound && <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />}
  </header>
);

// Shows a game's icon at a fixed small size without the oversized sticker
// frame spilling over neighbouring text.
export const MiniIcon = ({ icon, className = 'h-14 w-14 bg-sky-50' }) => (
  <span className={`relative shrink-0 overflow-hidden rounded-2xl ${className}`} aria-hidden="true">
    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-[.52]">{icon}</span>
  </span>
);

export const LeaveGameDialog = ({ onStay, onLeave, destination = 'Home' }) => (
  <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="leave-title">
    <section className="w-full max-w-sm rounded-[2rem] border-4 border-white bg-gradient-to-b from-sky-50 to-white p-6 text-center shadow-2xl animate-scale-in">
      <h2 id="leave-title" className="text-3xl font-black text-slate-800">Leave the game?</h2>
      <div className="mt-6 flex items-end justify-center gap-6">
        <div className="flex flex-col items-center gap-1">
          <button type="button" onClick={onStay} autoFocus aria-label="Keep playing" className="grid h-24 w-24 place-items-center rounded-full border-4 border-white bg-gradient-to-b from-lime-400 to-green-600 text-white shadow-[0_6px_0_#166534] active:translate-y-1 active:shadow-none">
            <Play size={48} fill="currentColor" className="ml-1" />
          </button>
          <span className="text-sm font-black text-slate-600">Keep playing</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <button type="button" onClick={onLeave} aria-label={`Back to ${destination.toLowerCase()}`} className="grid h-20 w-20 place-items-center rounded-full border-4 border-white bg-gradient-to-b from-amber-300 to-orange-500 text-white shadow-[0_6px_0_#9a3412] active:translate-y-1 active:shadow-none">
            {destination === 'Home' ? <Home size={38} strokeWidth={2.8} /> : <ArrowLeft size={38} strokeWidth={2.8} />}
          </button>
          <span className="text-sm font-black text-slate-600">{destination}</span>
        </div>
      </div>
    </section>
  </div>
);

const HOLD_MS = 3000;

// Grown-up gate: a young child is unlikely to read the instruction and hold
// a button for three seconds, but a parent finds it easy.
export const ParentGate = ({ onUnlock, onBack }) => {
  const [progress, setProgress] = useState(0);
  const frameRef = useRef(null);
  const startRef = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const tick = (now) => {
    const value = Math.min(1, (now - startRef.current) / HOLD_MS);
    setProgress(value);
    if (value >= 1) {
      onUnlock();
      return;
    }
    frameRef.current = requestAnimationFrame(tick);
  };

  const begin = (event) => {
    event.preventDefault();
    startRef.current = performance.now();
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(tick);
  };

  const cancel = () => {
    cancelAnimationFrame(frameRef.current);
    setProgress(0);
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center bg-gradient-to-b from-slate-100 to-indigo-100 p-4 sm:p-6">
      <PageHeader title="Grown-ups" subtitle="Progress and settings" onBack={onBack} />
      <section className="mt-10 w-full max-w-md rounded-[2rem] border-4 border-white bg-white/90 p-8 text-center shadow-xl">
        <Lock className="mx-auto text-indigo-500" size={42} />
        <h2 className="mt-3 text-2xl font-black text-slate-800">For grown-ups</h2>
        <p className="mt-2 font-semibold text-slate-600">Press and hold the button for 3 seconds to open progress and settings.</p>
        <button
          type="button"
          onPointerDown={begin}
          onPointerUp={cancel}
          onPointerLeave={cancel}
          onPointerCancel={cancel}
          onContextMenu={(event) => event.preventDefault()}
          className="relative mt-6 h-16 w-full touch-none select-none overflow-hidden rounded-2xl bg-slate-800 font-black text-white shadow-lg"
        >
          <span className="absolute inset-y-0 left-0 bg-indigo-500 transition-none" style={{ width: `${progress * 100}%` }} aria-hidden="true" />
          <span className="relative">{progress > 0 ? 'Keep holding…' : 'Press and hold'}</span>
        </button>
      </section>
    </div>
  );
};
