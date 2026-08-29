import { useState } from 'react';
import { ArrowLeft, BookOpen, Check, ImagePlus, LockKeyhole, Plus, X } from 'lucide-react';

const styles = [
  ['3d', 'Colourful 3D'],
  ['painted-2d', 'Painted 2D'],
  ['realistic', 'Warm realistic'],
];

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const newId = () => `series-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;

const StorybookSeriesLibrary = ({ series = [], onSave, onClose, onUse, onGenerateReference, onUnlock, parentUnlocked = false }) => {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', appearance: '', personality: '', visualStyle: '3d', friendsWorld: '', referenceImage: '', approved: true });
  const [error, setError] = useState('');
  const [referenceBusy, setReferenceBusy] = useState(false);
  const [gateOpen, setGateOpen] = useState(!parentUnlocked);
  const [gateAnswer, setGateAnswer] = useState('');
  const [gateError, setGateError] = useState('');
  const [gateBusy, setGateBusy] = useState(false);

  const save = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.appearance.trim()) { setError('Add a series name and character appearance.'); return; }
    if (!form.referenceImage) { setError('Upload or generate one approved reference image first.'); return; }
    if (!form.approved) { setError('Please approve the reference before saving it.'); return; }
    await onSave({ ...form, id: newId(), name: form.name.trim(), appearance: form.appearance.trim() });
    setForm({ name: '', appearance: '', personality: '', visualStyle: '3d', friendsWorld: '', referenceImage: '', approved: true });
    setCreating(false);
  };

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const generateReference = async () => {
    if (!form.appearance.trim() || referenceBusy) return;
    setReferenceBusy(true);
    setError('');
    try {
      const image = await onGenerateReference?.(form);
      if (!image) throw new Error('The character reference could not be created.');
      update('referenceImage', image);
    } catch (generationError) {
      setError(generationError?.message || 'The character reference could not be created.');
    } finally { setReferenceBusy(false); }
  };
  const unlock = async (event) => {
    event.preventDefault();
    if (!gateAnswer.trim() || gateBusy) return;
    setGateBusy(true); setGateError('');
    try { await onUnlock?.(gateAnswer.trim()); setGateOpen(false); } catch (error) { setGateError(error?.message || 'Please ask a grown-up to try again.'); } finally { setGateBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-[61] grid place-items-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-labelledby="series-library-title">
      <section className="relative max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border-4 border-white bg-gradient-to-br from-amber-50 via-white to-indigo-50 p-5 text-slate-900 shadow-2xl sm:p-8">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-slate-100" aria-label="Close character and series library"><X size={20} /></button>
        {gateOpen ? <form onSubmit={unlock} className="pt-5 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-100 text-amber-700"><LockKeyhole size={30} /></div><h2 id="series-library-title" className="mt-4 text-2xl font-black">Grown-up library</h2><p className="mx-auto mt-2 max-w-sm font-semibold text-slate-600">Character references and series are managed by a grown-up.</p><label htmlFor="series-parent-pin" className="mt-6 block text-left text-sm font-black">Parent PIN</label><input id="series-parent-pin" type="password" inputMode="numeric" autoComplete="off" value={gateAnswer} onChange={(event) => setGateAnswer(event.target.value)} className="mt-2 w-full rounded-2xl border-2 border-amber-200 px-4 py-3 text-xl font-black" autoFocus />{gateError && <p className="mt-2 text-sm font-bold text-rose-600" role="alert">{gateError}</p>}<button type="submit" disabled={gateBusy} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-4 font-black text-white disabled:opacity-50">{gateBusy ? 'Checking…' : 'Continue'} {!gateBusy && <ArrowLeft className="rotate-180" size={18} />}</button></form> : <>
        <div className="flex items-center gap-3"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-amber-700"><BookOpen size={28} /></div><div><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Grown-up library</p><h2 id="series-library-title" className="text-2xl font-black">Characters &amp; series</h2></div></div>
        {!creating && <>
          <p className="mt-4 text-sm font-semibold text-slate-600">Save a character reference and a simple series bible. New stories can reuse the same look and friends.</p>
          <div className="mt-5 grid gap-3">{series.length ? series.map((item) => <article key={item.id} className="rounded-2xl border-2 border-amber-100 bg-white p-4"><div className="flex items-start gap-3">{item.referenceImage ? <img src={item.referenceImage} alt="" className="h-16 w-16 rounded-xl object-cover" /> : <div className="grid h-16 w-16 place-items-center rounded-xl bg-amber-100 text-2xl">✨</div>}<div className="min-w-0 flex-1"><h3 className="font-black">{item.name}</h3><p className="mt-1 text-xs font-semibold text-slate-600">{item.appearance}</p><p className="mt-1 text-xs font-bold text-slate-500">{item.visualStyle} · {item.friendsWorld || 'A new world'}</p></div><button type="button" onClick={() => onUse(item)} className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-black text-white">New story</button></div></article>) : <p className="rounded-2xl bg-slate-100 p-4 text-sm font-bold text-slate-600">No saved series yet.</p>}</div>
          <button type="button" onClick={() => { setError(''); setCreating(true); }} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 font-black text-white shadow-lg"><Plus size={18} /> Create character &amp; series</button>
        </>}
        {creating && <form onSubmit={save} className="mt-5 grid gap-4"><label className="text-sm font-black">Series name<input value={form.name} onChange={(event) => update('name', event.target.value)} maxLength={80} className="mt-1 w-full rounded-xl border-2 border-amber-100 px-3 py-3" placeholder="The Moon Explorers" required /></label><label className="text-sm font-black">Character appearance<textarea value={form.appearance} onChange={(event) => update('appearance', event.target.value)} maxLength={600} rows={3} className="mt-1 w-full rounded-xl border-2 border-amber-100 px-3 py-3" placeholder="Rex is a small green dinosaur with a silver helmet…" required /></label><label className="text-sm font-black">Personality<textarea value={form.personality} onChange={(event) => update('personality', event.target.value)} maxLength={400} rows={2} className="mt-1 w-full rounded-xl border-2 border-amber-100 px-3 py-3" placeholder="Curious, kind and brave" /></label><label className="text-sm font-black">Friends and world<textarea value={form.friendsWorld} onChange={(event) => update('friendsWorld', event.target.value)} maxLength={600} rows={2} className="mt-1 w-full rounded-xl border-2 border-amber-100 px-3 py-3" placeholder="Tilly the robot; Moon Base Echo" /></label><label className="text-sm font-black">Visual style<select value={form.visualStyle} onChange={(event) => update('visualStyle', event.target.value)} className="mt-1 w-full rounded-xl border-2 border-amber-100 px-3 py-3">{styles.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><label className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50 p-4 text-sm font-black"><span className="flex items-center gap-2"><ImagePlus size={18} /> Optional uploaded reference image</span><input type="file" accept="image/png,image/jpeg,image/webp" className="mt-2 w-full text-xs" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; if (file.size > 8 * 1024 * 1024) { setError('Please choose an image smaller than 8 MB.'); return; } update('referenceImage', await fileToDataUrl(file)); }} /></label><button type="button" onClick={generateReference} disabled={referenceBusy || !form.appearance.trim()} className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-indigo-200 px-4 py-3 font-black text-indigo-700 disabled:opacity-50">{referenceBusy ? 'Generating reference…' : 'Generate character reference'}</button>{form.referenceImage && <img src={form.referenceImage} alt="Reference preview" className="max-h-48 w-full rounded-2xl object-contain" />}<label className="flex items-start gap-2 text-sm font-bold"><input type="checkbox" checked={form.approved} onChange={(event) => update('approved', event.target.checked)} className="mt-1" /> I approve this as the reference for future stories.</label>{error && <p className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700" role="alert">{error}</p>}<div className="flex gap-3"><button type="button" onClick={() => setCreating(false)} className="flex-1 rounded-2xl border-2 border-slate-200 px-4 py-3 font-black">Cancel</button><button type="submit" className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 font-black text-white"><Check size={18} /> Save series</button></div></form>}
        </>}
      </section>
    </div>
  );
};

export default StorybookSeriesLibrary;
