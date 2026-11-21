import { PaintBucket, Undo2 } from 'lucide-react';
import { COLOUR_PAINTS } from '../../data/colourLabAdventure.js';

const button = 'inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 disabled:opacity-40';

export default function PaintMixer({ scoops, mixed, active, useText, onAdd, onUndo, onClear, onUse, onFill, onCanvas }) {
  return <section className="rounded-2xl border border-violet-200 bg-white p-2.5 sm:p-4" aria-label="Paint mixer">
    <div className="flex flex-wrap items-center justify-between gap-x-3">
      <h2 className="text-lg font-black text-indigo-950">Mix your paint</h2>
      <p className="text-sm font-semibold text-slate-700">Tap colours to add scoops.</p>
    </div>
    <div className="mt-2 grid grid-cols-5 gap-1 sm:gap-2" role="group" aria-label="Paint pots">
      {Object.entries(COLOUR_PAINTS).map(([name, paint]) => {
        const count = scoops.filter((scoop) => scoop === name).length;
        return <button type="button" key={name} onClick={() => onAdd(name)} disabled={scoops.length >= 24}
          aria-label={`Add ${name}`} className="relative grid min-h-16 min-w-0 justify-items-center gap-1 rounded-xl border border-slate-200 px-0.5 py-1.5 text-xs font-bold text-slate-900 hover:border-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-700 disabled:opacity-60">
          <span className="h-6 w-6 rounded-lg border border-slate-500/45 shadow-inner sm:h-7 sm:w-9" style={{ backgroundColor: paint }}/>
          <span>{name}{count > 0 && <span className="ml-0.5 text-indigo-700"> ×{count}</span>}</span>
        </button>;
      })}
    </div>
    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-indigo-50 p-2">
      <div className="flex min-w-0 items-center gap-2" aria-live="polite">
        <span role="img" aria-label={mixed ? 'Your mixed paint' : 'Empty paint bucket'} data-mix-swatch
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-slate-500/45 ${mixed ? 'shadow-inner' : 'border-dashed bg-white'}`}
          style={mixed ? { backgroundColor: mixed } : undefined}>
          {!mixed && <PaintBucket size={22} aria-hidden="true" className="text-slate-500" />}
        </span>
        <div>
          <p className="text-sm font-black text-indigo-950">{mixed ? (active ? 'Mix ready to paint' : 'Bucket colour') : 'Empty bucket'}</p>
          {mixed && <p className="text-xs font-semibold text-slate-700">
            {scoops.length} {scoops.length === 1 ? 'scoop' : 'scoops'}{active ? `. ${useText}` : '.'}
          </p>}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {mixed && !active && <button type="button" className={button + ' bg-white text-indigo-900'} onClick={onUse}>Use this mix</button>}
        {mixed && active && <button type="button" className={button + ' bg-white text-indigo-900'} onClick={onCanvas}>Go to canvas</button>}
        <button type="button" className={button + ' bg-indigo-700 text-white'} disabled={!mixed} onClick={onFill}>Fill background</button>
      </div>
    </div>
    {mixed && <div className="mt-1 flex flex-wrap items-center gap-x-1.5">
      <button type="button" onClick={onUndo} className={button + ' text-indigo-900'}><Undo2 size={16} aria-hidden="true"/> Undo scoop</button>
      <button type="button" onClick={onClear} className={button + ' text-indigo-900'}>Empty bucket</button>
    </div>}
  </section>;
}
