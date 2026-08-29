import { useState } from 'react';
import { BookOpen, Sparkles, WandSparkles, X } from 'lucide-react';
import { STORYBOOK_AGE_BANDS, STORYBOOK_STYLES, MAX_STORY_TOPIC_LENGTH } from '../../data/storybookValidation.js';

const styleLabels = { '3d': 'Colourful 3D animation', 'painted-2d': 'Hand-painted 2D', realistic: 'Warm realistic' };

const StorybookCreator = ({ onClose, onCreate, seriesOptions = [], selectedChild, initialSeriesId = '', busy = false, error = '', dailyLimitReached = false }) => {
  const [topic, setTopic] = useState('');
  const [ageBand, setAgeBand] = useState(selectedChild?.ageBand || '5-6');
  const [style, setStyle] = useState('3d');
  const [seriesId, setSeriesId] = useState(initialSeriesId);

  const submit = (event) => {
    event.preventDefault();
    if (!topic.trim() || dailyLimitReached || busy) return;
    onCreate({ topic: topic.trim(), ageBand, style, seriesId, childId: selectedChild?.id || 'amari' });
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-labelledby="storybook-creator-title">
      <section className="relative max-h-[95vh] w-full max-w-xl overflow-y-auto rounded-[2rem] border-4 border-white bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 p-5 text-slate-900 shadow-2xl sm:p-8">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700" aria-label="Close story creator"><X size={20} /></button>
        <form onSubmit={submit} className="pt-5">
            <div className="flex items-center gap-3"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white"><WandSparkles size={28} /></div><div><p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Story maker</p><h2 id="storybook-creator-title" className="text-2xl font-black">Create a new story</h2></div></div>
            <label htmlFor="storybook-topic" className="mt-6 block text-sm font-black text-slate-700">What should the story be about?</label>
            <textarea id="storybook-topic" value={topic} onChange={(event) => setTopic(event.target.value.slice(0, MAX_STORY_TOPIC_LENGTH))} maxLength={MAX_STORY_TOPIC_LENGTH} rows={4} placeholder="For example: a kind dinosaur who learns to share a telescope" className="mt-2 w-full resize-none rounded-2xl border-2 border-indigo-200 bg-white px-4 py-3 font-semibold outline-none focus:border-indigo-500" required />
            <div className="mt-1 text-right text-xs font-bold text-slate-500">{topic.length}/{MAX_STORY_TOPIC_LENGTH}</div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-black text-slate-700">Reading age<select value={ageBand} onChange={(event) => setAgeBand(event.target.value)} className="mt-2 w-full rounded-xl border-2 border-indigo-100 bg-white px-3 py-3 font-black">{STORYBOOK_AGE_BANDS.map((band) => <option key={band} value={band}>Ages {band.replace('-', '–')}</option>)}</select><span className="mt-1 block text-xs font-bold text-slate-500">Suggested for {selectedChild?.displayName || 'this reader'}: {selectedChild?.ageBand || '5-6'}</span></label><label className="text-sm font-black text-slate-700">Picture style<select value={style} onChange={(event) => setStyle(event.target.value)} className="mt-2 w-full rounded-xl border-2 border-indigo-100 bg-white px-3 py-3 font-black">{STORYBOOK_STYLES.map((value) => <option key={value} value={value}>{styleLabels[value]}</option>)}</select></label></div>
            {seriesOptions.length > 0 && <label className="mt-4 block text-sm font-black text-slate-700">Series continuity<select value={seriesId} onChange={(event) => { const next = event.target.value; setSeriesId(next); const selected = seriesOptions.find((item) => item.id === next); if (selected?.visualStyle) setStyle(selected.visualStyle); }} className="mt-2 w-full rounded-xl border-2 border-indigo-100 bg-white px-3 py-3 font-black"><option value="">A brand-new story</option>{seriesOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><span className="mt-1 block text-xs font-bold text-slate-500">A selected series keeps its approved character look and world.</span></label>}
            <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800"><BookOpen className="mr-1 inline" size={15} /> Ten pages, one illustration and one ElevenLabs narration per page. Generation needs internet.</p>
            {(error || dailyLimitReached) && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700" role="alert">{dailyLimitReached ? 'Today’s story-making limit has been reached. Please try again tomorrow.' : error}</p>}
            <div className="mt-5 flex gap-3"><button type="button" onClick={onClose} className="flex-1 rounded-2xl border-2 border-slate-200 px-4 py-3 font-black text-slate-600">Cancel</button><button type="submit" disabled={!topic.trim() || busy || dailyLimitReached} className="flex-[1.5] inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-3 font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Creating…' : <><Sparkles size={18} /> Create story</>}</button></div>
        </form>
      </section>
    </div>
  );
};

export default StorybookCreator;
