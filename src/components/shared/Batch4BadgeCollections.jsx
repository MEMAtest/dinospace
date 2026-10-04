import { getBatch4Collections } from '../../data/batch4Collections.js';

const BadgeArt = ({ game, variant }) => <svg viewBox="0 0 64 64" aria-hidden="true" className="h-14 w-14">
  <path d="m32 3 24 12v30L32 59 8 45V15Z" fill="#e0f2fe" stroke="#0284c7" strokeWidth="3" />
  {game === 'timeteller' ? <>
    <circle cx="32" cy="30" r="17" fill="#fff7d6" stroke="#eab308" strokeWidth="3" />
    <path d="M32 30V17" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
    <path d={variant === 0 ? 'M32 30h10' : variant === 1 ? 'M32 30l-9 5' : 'M32 30l7-8'} stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
    <circle cx="32" cy="30" r="2.5" fill="#eab308" />
  </> : game === 'numberline' ? <>
    <path d="M14 38h36M17 34v8m10-8v8m10-8v8m10-8v8" stroke="#0369a1" strokeWidth="3" />
    <path d="M17 32q5-18 10 0m0 0q5-18 10 0" fill="none" stroke="#f59e0b" strokeWidth="3" />
    <path d="m34 28 3 4 3-4" fill="none" stroke="#f59e0b" strokeWidth="3" />
  </> : <>
    <circle cx="20" cy="20" r="5" fill="#38bdf8" /><circle cx="44" cy="20" r="5" fill="#fbbf24" />
    <path d="M24 32h16" stroke="#0369a1" strokeWidth="4" strokeLinecap="round" />
    {game === 'addition' && <path d="M32 24v16" stroke="#0369a1" strokeWidth="4" strokeLinecap="round" />}
    <path d="M18 43h28" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" />
  </>}
  <path d="m32 46 2 4 4 .5-3 3 .7 4-3.7-2-3.7 2 .7-4-3-3 4-.5Z" fill="#fbbf24" stroke="#fff" />
</svg>;

const Batch4BadgeCollections = ({ playerId }) => <div className="grid w-full max-w-4xl gap-3 sm:grid-cols-2">
  {getBatch4Collections(playerId).map((collection) => <section key={collection.id} aria-label={collection.title} className="min-w-0 rounded-3xl border-2 border-sky-200 bg-white/95 p-4 shadow-sm">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 className="font-black text-slate-900">{collection.title}</h2>
      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-900">{collection.entries.filter(({ earned }) => earned).length} / 3 collected</span>
    </div>
    <ul className="grid gap-2">
      {collection.entries.map((entry) => <li key={entry.id} aria-label={`${entry.name}: ${entry.earned ? 'collected' : 'finish this chapter to collect'}`} className={`flex min-h-20 min-w-0 items-center gap-3 rounded-2xl border-2 p-2 ${entry.earned ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-sky-50' : 'border-slate-200 bg-slate-50'}`}>
        <span className={`shrink-0 ${entry.earned ? '' : 'grayscale opacity-40'}`}><BadgeArt game={collection.id} variant={entry.variant} /></span>
        <span className="min-w-0 text-sm font-bold text-slate-800"><strong className="block">{entry.name}</strong><span className="mt-1 block text-xs text-slate-600">{entry.earned ? 'Collected' : 'Finish to collect'}</span></span>
      </li>)}
    </ul>
  </section>)}
</div>;

export default Batch4BadgeCollections;
