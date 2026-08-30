import { useEffect, useState } from 'react';
import { BookOpen, Check, Circle, LoaderCircle, Sparkles, WandSparkles, X } from 'lucide-react';
import { STORYBOOK_AGE_BANDS, STORYBOOK_STYLES, MAX_STORY_TOPIC_LENGTH } from '../../data/storybookValidation.js';

const styleLabels = { '3d': 'Colourful 3D animation', 'painted-2d': 'Hand-painted 2D', realistic: 'Warm realistic' };

const stageCopy = {
  connecting: { title: 'Getting the story maker ready', detail: 'Connecting to the story studio…' },
  planning: { title: 'Writing your ten-page adventure', detail: 'Choosing a beginning, middle and happy ending…' },
  cover: { title: 'Painting the cover', detail: 'Making the first picture for your book…' },
  image: { title: 'Illustrating each page', detail: 'Creating a new picture for this part of the adventure…' },
  narration: { title: 'Recording the narration', detail: 'Adding a warm ElevenLabs voice for each page…' },
  complete: { title: 'Your story is ready!', detail: 'Saving it for reading offline…' },
};

const StorybookCreator = ({ onClose, onCreate, seriesOptions = [], selectedChild, initialSeriesId = '', busy = false, progress = null, error = '', dailyLimitReached = false }) => {
  const [topic, setTopic] = useState('');
  const [ageBand, setAgeBand] = useState(selectedChild?.ageBand || '5-6');
  const [style, setStyle] = useState('3d');
  const [seriesId, setSeriesId] = useState(initialSeriesId);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!busy) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [busy]);

  const submit = (event) => {
    event.preventDefault();
    if (!topic.trim() || dailyLimitReached || busy) return;
    onCreate({ topic: topic.trim(), ageBand, style, seriesId, childId: selectedChild?.id || 'amari' });
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-labelledby="storybook-creator-title">
      <section className="relative max-h-[95vh] w-full max-w-xl overflow-y-auto rounded-[2rem] border-4 border-white bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 p-5 text-slate-900 shadow-2xl sm:p-8">
        {!busy && <button type="button" onClick={onClose} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700" aria-label="Close story creator"><X size={20} /></button>}
        {busy ? (() => {
          const current = stageCopy[progress?.stage] || stageCopy.connecting;
          const completed = Number(progress?.completed || 0);
          const total = Number(progress?.total || 22);
          const percent = Math.min(100, Math.round((completed / total) * 100));
          const page = Number(progress?.currentPage || 0);
          const elapsedSeconds = progress?.startedAt ? Math.max(0, Math.round((now - progress.startedAt) / 1000)) : 0;
          const estimatedTotalSeconds = 510;
          const estimatedRemaining = completed > 0
            ? Math.max(20, Math.round(((elapsedSeconds / completed) * (total - completed))))
            : estimatedTotalSeconds;
          const asMinutes = (seconds) => seconds < 60 ? 'under a minute' : `${Math.max(1, Math.round(seconds / 60))} minute${seconds >= 90 ? 's' : ''}`;
          const done = (stage) => ['cover', 'image', 'narration', 'complete'].indexOf(progress?.stage) > ['cover', 'image', 'narration', 'complete'].indexOf(stage);
          const active = (stage) => progress?.stage === stage;
          const Step = ({ stage, children }) => <li className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${active(stage) ? 'bg-indigo-50 text-indigo-800' : done(stage) ? 'text-emerald-700' : 'text-slate-500'}`}>{done(stage) ? <Check size={19} aria-label="Complete" /> : active(stage) ? <LoaderCircle className="animate-spin" size={19} aria-label="In progress" /> : <Circle size={19} />}<span>{children}</span></li>;
          return <div className="pt-5" aria-live="polite" aria-atomic="true">
            <div className="flex items-center gap-3"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white"><WandSparkles size={28} /></div><div><p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Story maker</p><h2 id="storybook-creator-title" className="text-2xl font-black">Making your story</h2></div></div>
            <div className="mt-6 rounded-3xl border-2 border-indigo-100 bg-white p-5 shadow-sm"><p className="text-lg font-black text-slate-900">{current.title}</p><p className="mt-1 text-sm font-bold leading-relaxed text-slate-600">{current.detail}</p><div className="mt-5 h-4 overflow-hidden rounded-full bg-indigo-100" aria-label={`${percent}% complete`}><div className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-500 transition-all duration-500" style={{ width: `${Math.max(3, percent)}%` }} /></div><p className="mt-2 text-right text-xs font-black text-indigo-700">{completed} of {total} story pieces ready</p></div>
            <div className="mt-4 grid gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold leading-relaxed text-amber-900 sm:grid-cols-2"><p><strong>Usually:</strong> 7–10 minutes</p><p><strong>Time left:</strong> about {asMinutes(estimatedRemaining)}</p><p className="sm:col-span-2 text-xs text-amber-800">Ten different pictures and eleven ElevenLabs recordings are made one at a time. Keep this screen open; completed pages are saved as they finish, and a retry continues where it stopped.</p></div>
            <ol className="mt-4 space-y-1 text-sm font-black"><Step stage="planning">Plan the adventure</Step><Step stage="cover">Create the cover picture</Step><Step stage="image">Illustrate {page ? `page ${page} of 10` : 'all ten pages'}</Step><Step stage="narration">Record each page with ElevenLabs</Step><Step stage="complete">Save the book for offline reading</Step></ol>
          </div>;
        })() : <form onSubmit={submit} className="pt-5">
            <div className="flex items-center gap-3"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white"><WandSparkles size={28} /></div><div><p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Story maker</p><h2 id="storybook-creator-title" className="text-2xl font-black">Create a new story</h2></div></div>
            <label htmlFor="storybook-topic" className="mt-6 block text-sm font-black text-slate-700">What should the story be about?</label>
            <textarea id="storybook-topic" value={topic} onChange={(event) => setTopic(event.target.value.slice(0, MAX_STORY_TOPIC_LENGTH))} maxLength={MAX_STORY_TOPIC_LENGTH} rows={4} placeholder="For example: a kind dinosaur who learns to share a telescope" className="mt-2 w-full resize-none rounded-2xl border-2 border-indigo-200 bg-white px-4 py-3 font-semibold outline-none focus:border-indigo-500" required />
            <div className="mt-1 text-right text-xs font-bold text-slate-500">{topic.length}/{MAX_STORY_TOPIC_LENGTH}</div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-black text-slate-700">Reading age<select value={ageBand} onChange={(event) => setAgeBand(event.target.value)} className="mt-2 w-full rounded-xl border-2 border-indigo-100 bg-white px-3 py-3 font-black">{STORYBOOK_AGE_BANDS.map((band) => <option key={band} value={band}>Ages {band.replace('-', '–')}</option>)}</select><span className="mt-1 block text-xs font-bold text-slate-500">Suggested for {selectedChild?.displayName || 'this reader'}: {selectedChild?.ageBand || '5-6'}</span></label><label className="text-sm font-black text-slate-700">Picture style<select value={style} onChange={(event) => setStyle(event.target.value)} className="mt-2 w-full rounded-xl border-2 border-indigo-100 bg-white px-3 py-3 font-black">{STORYBOOK_STYLES.map((value) => <option key={value} value={value}>{styleLabels[value]}</option>)}</select></label></div>
            {seriesOptions.length > 0 && <label className="mt-4 block text-sm font-black text-slate-700">Series continuity<select value={seriesId} onChange={(event) => { const next = event.target.value; setSeriesId(next); const selected = seriesOptions.find((item) => item.id === next); if (selected?.visualStyle) setStyle(selected.visualStyle); }} className="mt-2 w-full rounded-xl border-2 border-indigo-100 bg-white px-3 py-3 font-black"><option value="">A brand-new story</option>{seriesOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><span className="mt-1 block text-xs font-bold text-slate-500">A selected series keeps its approved character look and world.</span></label>}
            <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800"><BookOpen className="mr-1 inline" size={15} /> Ten pages, one illustration and one ElevenLabs narration per page. Generation needs internet.</p>
            {(error || dailyLimitReached) && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700" role="alert">{dailyLimitReached ? 'Today’s story-making limit has been reached. Please try again tomorrow.' : error}</p>}
            <div className="mt-5 flex gap-3"><button type="button" onClick={onClose} className="flex-1 rounded-2xl border-2 border-slate-200 px-4 py-3 font-black text-slate-600">Cancel</button><button type="submit" disabled={!topic.trim() || busy || dailyLimitReached} className="flex-[1.5] inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-3 font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Creating…' : <><Sparkles size={18} /> Create story</>}</button></div>
        </form>}
      </section>
    </div>
  );
};

export default StorybookCreator;
