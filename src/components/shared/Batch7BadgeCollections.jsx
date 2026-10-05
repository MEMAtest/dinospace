import { Brain, Orbit, Star } from 'lucide-react';
import { MEMORY_LEVELS, PLANETS } from '../../data/index.js';
import { discoveredPlanetBadges, readDiscoveryPassport, readMemoryPassport } from '../../data/batch7Progress.js';

const Batch7BadgeCollections = ({ playerId }) => {
  if (playerId !== 'amari') return null;
  const memory = readMemoryPassport(playerId, MEMORY_LEVELS);
  const discoveries = readDiscoveryPassport(playerId, PLANETS);
  const planets = new Set(discoveredPlanetBadges(PLANETS, discoveries.facts));
  const collections = [
    { title: 'Memory board stickers', art: <Brain size={30} />, entries: MEMORY_LEVELS.map((level) => ({ id: level.id, name: level.name, earned: Boolean(memory[level.id]), detail: memory[level.id] ? `${memory[level.id].stars} stars · best ${memory[level.id].bestMoves} moves` : 'Find every pair to collect' })) },
    { title: 'Solar discovery stickers', art: <Orbit size={30} />, entries: PLANETS.map((planet) => ({ id: planet.name, name: planet.name, earned: planets.has(planet.name), detail: planets.has(planet.name) ? (discoveries.quizzes[planet.name] ? 'Three discoveries and challenge complete' : 'Three discoveries collected') : 'Explore three different facts to collect' })) },
  ];
  return <div className="grid w-full max-w-4xl gap-3 sm:grid-cols-2">
    {collections.map(({ title, art, entries }) => <section key={title} aria-label={title} className="min-w-0 rounded-3xl border-2 border-sky-200 bg-white/95 p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="font-black text-slate-900">{title}</h2><span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-900">{entries.filter((entry) => entry.earned).length} / {entries.length} collected</span></div>
      <ul className="grid grid-cols-2 gap-2">{entries.map((entry) => <li key={entry.id} aria-label={`${entry.name}: ${entry.earned ? 'collected' : 'not collected'}`} className={`flex min-h-24 min-w-0 items-center gap-2 rounded-2xl border-2 p-2 ${entry.earned ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-sky-50' : 'border-slate-200 bg-slate-50'}`}>
        <span aria-hidden="true" className={`relative grid h-14 w-14 shrink-0 place-items-center rounded-full border-2 border-white shadow-inner ${entry.earned ? 'bg-gradient-to-br from-sky-200 to-violet-200 text-blue-700' : 'bg-slate-200 text-slate-500 grayscale opacity-50'}`}>{art}{entry.earned && <Star size={18} fill="currentColor" className="absolute -bottom-1 -right-1 text-amber-500" />}</span>
        <span className="min-w-0 text-xs font-bold text-slate-800"><strong className="block">{entry.name}</strong><span className="mt-1 block text-[11px] text-slate-600">{entry.detail}</span></span>
      </li>)}</ul>
    </section>)}
  </div>;
};

export default Batch7BadgeCollections;
