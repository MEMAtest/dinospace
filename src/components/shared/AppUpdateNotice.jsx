import { useEffect, useState } from 'react';
import { observeAppRelease } from '../../appUpdates.js';

export default function AppUpdateNotice() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!import.meta.env.PROD) return undefined;
    const currentEntry = document.querySelector('script[type="module"][src]')?.getAttribute('src');
    return observeAppRelease({ currentEntry, onUpdate: () => setReady(true) });
  }, []);
  if (!ready) return null;
  return <aside role="status" aria-label="Game update available" className="relative z-40 flex flex-wrap items-center justify-center gap-3 border-b-2 border-sky-300 bg-indigo-950 px-4 py-3 text-white">
    <div><p className="font-black">A new game update is ready</p><p className="text-sm text-sky-100">Save your work first, then refresh to see the latest games and pictures.</p></div>
    <button type="button" onClick={() => window.location.reload()} className="min-h-12 rounded-xl bg-white px-5 font-black text-indigo-950">Refresh games</button>
    <button type="button" onClick={() => setReady(false)} className="min-h-12 rounded-xl border border-white/60 px-4 font-bold">Later</button>
  </aside>;
}
