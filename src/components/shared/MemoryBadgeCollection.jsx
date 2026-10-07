import { Brain, Star } from 'lucide-react';
import { MEMORY_LEVELS } from '../../data/index.js';
import { readMemoryPassport } from '../../data/memoryMatchProgress.js';

export default function MemoryBadgeCollection({ playerId }) {
  if (playerId !== 'amari') return null;
  const memory = readMemoryPassport(playerId, MEMORY_LEVELS);
  return <section aria-label="Memory board stickers" className="w-full max-w-4xl rounded-3xl border-2 border-sky-200 bg-white/95 p-4 shadow-sm">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="font-black text-slate-900">Memory board stickers</h2><span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-900">{Object.keys(memory).length} / {MEMORY_LEVELS.length} collected</span></div>
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">{MEMORY_LEVELS.map((level) => {
      const result = memory[level.id];
      return <li key={level.id} aria-label={`${level.name}: ${result ? 'collected' : 'not collected'}`} className={`flex min-h-24 min-w-0 items-center gap-2 rounded-2xl border-2 p-2 ${result ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-sky-50' : 'border-slate-200 bg-slate-50'}`}>
        <span aria-hidden="true" className={`relative grid h-14 w-14 shrink-0 place-items-center rounded-full border-2 border-white shadow-inner ${result ? 'bg-gradient-to-br from-sky-200 to-violet-200 text-blue-700' : 'bg-slate-200 text-slate-500 grayscale opacity-50'}`}><Brain size={30} />{result && <Star size={18} fill="currentColor" className="absolute -bottom-1 -right-1 text-amber-500" />}</span>
        <span className="min-w-0 text-xs font-bold text-slate-800"><strong className="block">{level.name}</strong><span className="mt-1 block text-[11px] text-slate-600">{result ? `${result.stars} stars · best ${result.bestMoves} moves` : 'Find every pair to collect'}</span></span>
      </li>;
    })}</ul>
  </section>;
}
