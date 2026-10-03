import { Pencil, Sparkles } from 'lucide-react';
import { getBatch3Collections } from '../../data/batch3Collections.js';
import { DinoSticker } from './StickerArt.jsx';

const patterns = [
  [[12, 40], [26, 18], [39, 40], [53, 18]],
  [[12, 15], [48, 15], [48, 47], [12, 47], [30, 30]],
  [[10, 47], [22, 26], [33, 12], [45, 27], [56, 46]],
];
const CollectionArt = ({ entry }) => {
  if (entry.art === 'dino') return <DinoSticker species={entry.species} size={54} />;
  if (entry.art === 'trace') return <Pencil size={34} aria-hidden="true" />;
  if (entry.art === 'tactic') return <svg viewBox="0 0 60 60" className="h-12 w-12" aria-hidden="true">
    <path d="M20 5v50M40 5v50M5 20h50M5 40h50" stroke="currentColor" strokeWidth="3" opacity=".45" />
    {(entry.variant === 0 ? [10, 30, 50] : entry.variant === 1 ? [10, 30] : [10, 50]).map((x) => <circle key={x} cx={x} cy="10" r="6" fill="currentColor" />)}
    {entry.variant > 0 && <path d="M23 23l14 14M37 23L23 37" stroke="currentColor" strokeWidth="4" />}
  </svg>;
  const points = patterns[entry.variant] || patterns[0];
  return <svg viewBox="0 0 64 60" className="h-12 w-12" aria-hidden="true">
    <polyline points={points.map((point) => point.join(',')).join(' ')} fill="none" stroke="currentColor" strokeWidth="2" opacity=".65" />
    {points.map(([x, y], index) => <circle key={index} cx={x} cy={y} r="4.5" fill="currentColor" />)}
  </svg>;
};

const Batch3BadgeCollections = ({ playerId }) => <div className="grid w-full max-w-4xl gap-3 sm:grid-cols-2">
  {getBatch3Collections(playerId).map((collection) => <section key={collection.id} aria-label={collection.title} className="min-w-0 rounded-3xl border-2 border-sky-200 bg-white/95 p-4 shadow-sm">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 className="font-black text-slate-900">{collection.title}</h2>
      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-900">{collection.entries.filter((entry) => entry.earned).length} / {collection.entries.length} collected</span>
    </div>
    <ul className="grid grid-cols-2 gap-2">
      {collection.entries.map((entry) => <li key={entry.id} aria-label={`${entry.name}: ${entry.earned ? 'collected' : 'finish this chapter or world to collect'}`} className={`flex min-h-24 min-w-0 items-center gap-2 rounded-2xl border-2 p-2 ${entry.earned ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-sky-50' : 'border-slate-200 bg-slate-50'}`}>
        <span aria-hidden="true" className={`grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-white shadow-inner ${entry.earned ? 'bg-gradient-to-br from-sky-200 to-violet-200 text-blue-700' : 'bg-slate-200 text-slate-500 grayscale opacity-50'}`}><CollectionArt entry={entry} /></span>
        <span className="min-w-0 text-xs font-bold text-slate-800"><strong className="block">{entry.name}</strong><span className="mt-1 block text-[11px] text-slate-600">{entry.earned ? <><Sparkles size={12} className="mr-1 inline" />Collected</> : 'Finish to collect'}</span></span>
      </li>)}
    </ul>
  </section>)}
</div>;

export default Batch3BadgeCollections;
