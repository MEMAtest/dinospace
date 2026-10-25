import { AudioLines, Paintbrush, LockKeyhole, Check } from 'lucide-react';
import { SOUND_SAFARI_CHAPTERS } from '../../data/soundSafariAdventure.js';
import { getSoundSafariProgress } from '../../data/soundSafariProgress.js';
import { COLOUR_LABS } from '../../data/colourLabAdventure.js';
import { readColourLabProgress } from '../../data/colourLabProgress.js';

// Collections read the saved child records. Visiting the shelf grants no reward.
export default function SafariColourCollections({ playerId }) {
  const safari = getSoundSafariProgress(playerId);
  const colour = readColourLabProgress(playerId);
  const collections = [
    { title: 'Sound Safari discoveries', chapters: SOUND_SAFARI_CHAPTERS, earned: safari.earnedChapterIds },
    { title: 'Colour studio palette', chapters: COLOUR_LABS, earned: colour.chapters },
  ];
  return <div className="grid w-full max-w-4xl gap-3 sm:grid-cols-2">{collections.map(({ title, chapters, earned = [] }) => <section key={title} aria-label={title} className="min-w-0 rounded-3xl border-2 border-emerald-200 bg-white/95 p-4 shadow-sm">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="font-black text-slate-900">{title}</h2><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-900">{chapters.filter(c => earned.includes(c.id)).length} / {chapters.length} collected</span></div>
    <ul className="grid gap-2">{chapters.map((chapter, i) => {
      const collected = earned.includes(chapter.id);
      return <li key={chapter.id} aria-label={`${chapter.title}: ${collected ? 'collected' : 'finish this chapter to collect'}`} className={`flex min-h-20 items-center gap-3 rounded-2xl border-2 p-3 ${collected ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
        <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 ${collected ? ['border-sky-200 bg-sky-100 text-sky-800', 'border-violet-200 bg-violet-100 text-violet-800', 'border-emerald-200 bg-emerald-100 text-emerald-800'][i] : 'border-slate-200 bg-slate-100 text-slate-400'}`}>{title === 'Sound Safari discoveries' ? <AudioLines size={28} aria-hidden="true" /> : <Paintbrush size={28} aria-hidden="true" />}</span>
        <span className="min-w-0 text-sm font-bold text-slate-800"><strong className="block">{chapter.title}</strong><span className="mt-1 flex items-center gap-1 text-xs text-slate-600">{collected ? <Check size={13} aria-hidden="true" /> : <LockKeyhole size={13} aria-hidden="true" />}{collected ? 'Collected' : 'Finish to collect'}</span></span>
      </li>;
    })}</ul>
  </section>)}</div>;
}
