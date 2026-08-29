import { useState } from 'react';
import { Plus, Save, Trash2, X } from 'lucide-react';

const AGE_BANDS = ['3-4', '5-6', '7-8'];
const newId = () => `child-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;

const StorybookProfiles = ({ profiles, activeId, onSelect, onSave, onDelete, onClose }) => {
  const [drafts, setDrafts] = useState(profiles.map((profile) => ({ ...profile })));
  const update = (id, key, value) => setDrafts((items) => items.map((item) => item.id === id ? { ...item, [key]: value } : item));
  const add = () => setDrafts((items) => [...items, { id: newId(), displayName: `Child ${items.length + 1}`, ageBand: '5-6' }]);
  const save = async () => { await Promise.all(drafts.filter((item) => item.displayName?.trim()).map(onSave)); onClose(); };
  const select = async (profile) => {
    if (!profile.displayName?.trim()) return;
    await onSave(profile);
    onSelect(profile.id, profile.ageBand);
  };
  const remove = (profile) => { setDrafts((items) => items.filter((item) => item.id !== profile.id)); onDelete(profile); };
  return (
    <div className="fixed inset-0 z-[61] grid place-items-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-labelledby="storybook-profiles-title">
      <section className="relative max-h-[95vh] w-full max-w-xl overflow-y-auto rounded-[2rem] border-4 border-white bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-5 text-slate-900 shadow-2xl sm:p-8">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-slate-100" aria-label="Close reader profiles"><X size={20} /></button>
        <h2 id="storybook-profiles-title" className="text-2xl font-black">Who is reading?</h2><p className="mt-1 text-sm font-semibold text-slate-600">Use a display name and age band only. No birthday is stored.</p>
        <div className="mt-5 grid gap-3">{drafts.map((profile) => <div key={profile.id} className={`rounded-2xl border-2 p-4 ${profile.id === activeId ? 'border-indigo-400 bg-indigo-50' : 'border-slate-100 bg-white'}`}><div className="flex items-center gap-2"><input value={profile.displayName} onChange={(event) => update(profile.id, 'displayName', event.target.value.slice(0, 40))} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 font-black" aria-label={`${profile.displayName} display name`} /><select value={profile.ageBand} onChange={(event) => update(profile.id, 'ageBand', event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 font-black" aria-label={`${profile.displayName} age band`}>{AGE_BANDS.map((band) => <option key={band} value={band}>Ages {band}</option>)}</select>{drafts.length > 1 && <button type="button" onClick={() => remove(profile)} className="rounded-xl p-2 text-rose-600" aria-label={`Delete ${profile.displayName}`}><Trash2 size={18} /></button>}</div><button type="button" onClick={() => select(profile)} className="mt-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-black text-white">{profile.id === activeId ? 'Save changes' : 'Save and read as this child'}</button></div>)}</div>
        <div className="mt-5 flex gap-3"><button type="button" onClick={add} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-indigo-200 px-4 py-3 font-black text-indigo-700"><Plus size={18} /> Add child</button><button type="button" onClick={save} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 font-black text-white"><Save size={18} /> Save profiles</button></div>
      </section>
    </div>
  );
};

export default StorybookProfiles;
