import { Check, LockKeyhole, ScanSearch, Shapes } from 'lucide-react';
import { ODD_ONE_OUT_CHAPTERS } from '../../data/oddOneOutAdventure.js';
import { readOddOneOutProgress } from '../../data/oddOneOutProgress.js';
import { PATTERN_CHAPTERS } from '../../data/patternAdventure.js';
import { readPatternProgress } from '../../data/patternAdventureProgress.js';

export default function ReasoningCollections({ playerId }) {
  const collections = [
    { id: 'classification', title: 'Sorting discoveries', chapters: ODD_ONE_OUT_CHAPTERS, earned: readOddOneOutProgress(playerId).completedChapterIds },
    { id: 'patterns', title: 'Pattern festival badges', chapters: PATTERN_CHAPTERS, earned: readPatternProgress(playerId).completedChapterIds },
  ];
  return <div className="grid w-full max-w-4xl gap-3 sm:grid-cols-2">{collections.map(({ id, title, chapters, earned = [] }) => <section key={id} aria-label={title} className="min-w-0 rounded-3xl border-2 border-indigo-100 bg-white/95 p-4 shadow-sm">
    <header className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="font-black text-slate-900">{title}</h2><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-900">{chapters.filter(c => earned.includes(c.id)).length} / {chapters.length} collected</span></header>
    <ul className="grid gap-2">{chapters.map((chapter) => {
      const collected = earned.includes(chapter.id);
      return <li key={chapter.id} aria-label={`${chapter.title}: ${collected ? 'collected' : 'finish this chapter to collect'}`} className={`flex min-h-20 items-center gap-3 rounded-2xl border-2 p-3 ${collected ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
        <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${collected ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-400'}`}>{id === 'classification' ? <ScanSearch size={28} aria-hidden="true" /> : <Shapes size={28} aria-hidden="true" />}</span>
        <span className="min-w-0 text-sm font-bold text-slate-800"><strong className="block">{chapter.title}</strong><span className="mt-1 flex items-center gap-1 text-xs text-slate-600">{collected ? <Check size={13} aria-hidden="true" /> : <LockKeyhole size={13} aria-hidden="true" />}{collected ? 'Collected' : 'Finish to collect'}</span></span>
      </li>;
    })}</ul>
  </section>)}</div>;
}
