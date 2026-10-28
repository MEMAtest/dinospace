import { Check, Code2, LockKeyhole, NotebookPen } from 'lucide-react';
import { CHAPTERS } from '../../rehearsal/rover.js';
import { readCodeProgress } from '../../rehearsal/codeProgress.js';
import { WRITING_PROJECTS } from '../../rehearsal/writingProjects.js';
import { readWritingProgress } from '../../rehearsal/writingProgress.js';

export default function CreativeProjectCollections({ playerId }) {
  const collections = [
    { title: 'Coding mission badges', items: CHAPTERS, earned: readCodeProgress(playerId).completedChapterIds, icon: <Code2 size={28} aria-hidden="true" /> },
    { title: 'Writing project keepsakes', items: WRITING_PROJECTS, earned: readWritingProgress(playerId).completedProjectIds, icon: <NotebookPen size={28} aria-hidden="true" /> },
  ];
  return <div className="grid w-full max-w-4xl gap-3 sm:grid-cols-2">{collections.map(({ title, items, earned, icon }) => <section key={title} aria-label={title} className="min-w-0 rounded-3xl border-2 border-sky-100 bg-white/95 p-4 shadow-sm">
    <header className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="font-black text-slate-900">{title}</h2><span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-950">{items.filter(({ id }) => earned.includes(id)).length} / {items.length} collected</span></header>
    <ul className="grid gap-2">{items.map((item, index) => {
      const collected = earned.includes(item.id);
      return <li key={item.id} aria-label={`${item.title}: ${collected ? 'collected' : 'finish to collect'}`} className={`flex min-h-20 items-center gap-3 rounded-2xl border-2 p-3 ${collected ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
        <span className={`relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${collected ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-400'}`}>{icon}<span className="absolute bottom-0 right-1 text-xs font-black">{index + 1}</span></span>
        <span className="min-w-0 text-sm font-bold text-slate-800"><strong className="block">{item.title}</strong><span className="mt-1 flex items-center gap-1 text-xs text-slate-600">{collected ? <Check size={13} aria-hidden="true" /> : <LockKeyhole size={13} aria-hidden="true" />}{collected ? 'Collected' : 'Finish to collect'}</span></span>
      </li>;
    })}</ul>
  </section>)}</div>;
}
