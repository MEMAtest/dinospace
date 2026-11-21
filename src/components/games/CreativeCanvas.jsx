import { useState } from 'react';
import { Eraser, PaintBucket, Pencil, RotateCcw } from 'lucide-react';
import { COLOUR_PAINTS } from '../../data/colourLabAdventure.js';
import { COLOURING_GROUPS, COLOURING_PICTURES } from '../../data/colouringPictures.js';
import { BLANK_SHEET, newSheet, packCanvas, readCanvas } from '../../data/creativeCanvasState.js';
import { mixPaintScoops } from '../../data/paintMix.js';
import { playerStorageKey } from '../../data/players.js';
import ColouringPicture from './ColouringPicture.jsx';
import DrawingPaper from './DrawingPaper.jsx';

const control = 'inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-2.5 text-sm font-bold text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-45 sm:px-3';
const toggle = control + ' aria-pressed:border-indigo-700 aria-pressed:bg-indigo-700 aria-pressed:text-white';
const paintNames = ['Red', 'Yellow', 'Blue', 'White', 'Black'];
const swatches = ['#293343', '#e45152', '#ed833c', '#f2c94c', '#3b9e64', '#4386cf', '#8658b8', '#fffdf7'];
const sizes = [
  { label: 'Small', brush: 3, eraser: 12 },
  { label: 'Medium', brush: 7, eraser: 24 },
  { label: 'Large', brush: 15, eraser: 44 },
];
const groupFor = (id) => COLOURING_GROUPS.find(({ pictures }) => pictures.includes(id))?.label || '';

export default function CreativeCanvas({ playerId, mixing = false }) {
  const key = playerStorageKey(playerId, mixing ? 'mixing_canvas_v1' : 'shape_canvas_v1');
  const [art, setArt] = useState(() => readCanvas(key));
  const [gallery, setGallery] = useState(() => groupFor(art.template));
  const [tool, setTool] = useState(() => art.template === BLANK_SHEET ? 'brush' : 'fill');
  const [size, setSize] = useState(sizes[1]);
  const [undo, setUndo] = useState({});
  const [saveError, setSaveError] = useState(false);
  const [scoops, setScoops] = useState({});
  const [mixed, setMixed] = useState(null);
  const [colour, setColour] = useState(swatches[0]);
  const [notice, setNotice] = useState('');
  const total = Object.values(scoops).reduce((sum, value) => sum + value, 0);
  const sheet = art.sheets[art.template] || newSheet();
  const picture = COLOURING_PICTURES[art.template];

  const persist = (next) => {
    setArt(next);
    try { localStorage.setItem(key, JSON.stringify(packCanvas(next))); setSaveError(false); }
    catch { setSaveError(true); }
  };
  const updateSheet = (next) => {
    setUndo((history) => ({ ...history, [art.template]: [...(history[art.template] || []), sheet].slice(-12) }));
    persist({ ...art, sheets: { ...art.sheets, [art.template]: next } });
  };
  const undoEdit = () => {
    const history = undo[art.template] || [];
    if (!history.length) return;
    setUndo({ ...undo, [art.template]: history.slice(0, -1) });
    persist({ ...art, sheets: { ...art.sheets, [art.template]: history.at(-1) } });
    setNotice('Last change undone.');
  };
  const selectSheet = (template) => {
    if (template !== art.template) persist({ ...art, template });
    setTool(template === BLANK_SHEET ? 'brush' : 'fill');
    setNotice('');
  };
  const selectColour = (value) => {
    setColour(value);
    if (tool === 'eraser') setTool(picture ? 'fill' : 'brush');
    setNotice('');
  };
  const changeRegion = (id, action) => {
    const region = picture?.regions.find((region) => region.id === id);
    if (!region) return;
    const colours = { ...sheet.colours };
    if (action === 'eraser') {
      if (!colours[id]) return;
      delete colours[id];
      setNotice(`${region.name} reset.`);
    } else {
      if (colours[id] === colour) return;
      colours[id] = colour;
      setNotice(`${region.name} coloured.`);
    }
    updateSheet({ ...sheet, colours });
  };
  const addPaint = (name) => {
    setScoops((current) => ({ ...current, [name]: (current[name] || 0) + 1 }));
    setMixed(null);
  };

  const activeSize = tool === 'eraser' ? size.eraser : size.brush;
  const hasArt = sheet.strokes.length || sheet.fill !== '#ffffff' || Object.keys(sheet.colours).length;
  const selectedGroup = COLOURING_GROUPS.find(({ label }) => label === gallery);

  return <div className="mx-auto grid w-full max-w-6xl gap-3">
    <section aria-label="Choose a colouring picture" className="rounded-2xl border border-slate-200 bg-white p-2 sm:p-3">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Picture categories">
        <button type="button" className={toggle} aria-pressed={!gallery && !picture} onClick={() => { setGallery(''); selectSheet(BLANK_SHEET); }}>Blank sheet</button>
        {COLOURING_GROUPS.map(({ label }) => <button key={label} type="button" className={toggle} aria-pressed={label === gallery}
          onClick={() => setGallery(gallery === label ? '' : label)}>{label}</button>)}
      </div>
      {selectedGroup && <div className="mt-2 flex flex-wrap gap-2">
        {selectedGroup.pictures.map((id) => <button key={id} type="button" className={toggle + ' min-w-28'}
          aria-pressed={art.template === id} onClick={() => selectSheet(id)}>
          <span className="relative h-9 w-12 shrink-0 overflow-hidden rounded-md bg-white"><ColouringPicture picture={COLOURING_PICTURES[id]} colours={art.sheets[id]?.colours}/></span>
          {COLOURING_PICTURES[id].label}
        </button>)}
      </div>}
    </section>

    {mixing && <details className="rounded-2xl border border-[#dbcfd9] bg-[#fdf7fc] px-3" aria-label="Mixing bucket">
      <summary className="min-h-12 cursor-pointer py-3 font-black text-[#53264b]">Paint bucket{total ? ` · ${total} ${total === 1 ? 'scoop' : 'scoops'}` : ''}</summary>
      <div className="pb-3">
        <div className="grid grid-cols-5 gap-1.5">
          {paintNames.map((name) => <button type="button" key={name} onClick={() => addPaint(name)} disabled={total >= 24} aria-label={`Add ${name} to bucket`}
            className="grid min-h-14 min-w-0 place-items-center rounded-xl border border-[#dbcfd9] bg-white px-0.5 py-1 text-xs font-bold text-[#53264b] disabled:opacity-50">
            <span className="h-5 w-5 rounded-full border border-slate-500/50 sm:h-7 sm:w-7" style={{ backgroundColor: COLOUR_PAINTS[name] }}/>{name}{scoops[name] ? ` ×${scoops[name]}` : ''}
          </button>)}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <button type="button" className={control} disabled={!total || !!mixed} onClick={() => setMixed(mixPaintScoops(scoops))}>Mix paint</button>
          <button type="button" className={control} disabled={!total} onClick={() => { setScoops({}); setMixed(null); }}>Empty bucket</button>
          {mixed && <>
            <span aria-label="Mixed paint sample" role="img" className="h-9 w-9 rounded-full border border-slate-600/40" style={{ backgroundColor: mixed }}/>
            <button type="button" className={control} onClick={() => { selectColour(mixed); setNotice('Mixed paint selected.'); }}>Use mixed paint</button>
            <button type="button" className={control} onClick={() => { updateSheet({ ...sheet, fill: mixed }); setNotice('Mixed paint filled the background.'); }}>Pour onto canvas</button>
          </>}
        </div>
      </div>
    </details>}

    <section aria-label="Canvas tools" className="rounded-2xl border border-slate-200 bg-white p-2 sm:p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {picture && <button type="button" className={toggle} onClick={() => setTool('fill')} aria-pressed={tool === 'fill'}><PaintBucket size={17}/> Colour areas</button>}
        <button type="button" className={toggle} onClick={() => setTool('brush')} aria-pressed={tool === 'brush'}><Pencil size={17}/> Brush</button>
        <button type="button" className={toggle} onClick={() => setTool('eraser')} aria-pressed={tool === 'eraser'}><Eraser size={17}/> Eraser</button>
        <button type="button" className={control} onClick={undoEdit} disabled={!undo[art.template]?.length}><RotateCcw size={17}/> Undo</button>
        <button type="button" className={control} disabled={!hasArt} onClick={() => { updateSheet(newSheet()); setNotice('Sheet cleared. You can undo that.'); }}>Clear sheet</button>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        {tool !== 'eraser' && <div className="flex flex-wrap items-center gap-0.5" role="group" aria-label="Paint colours">
          {swatches.map((swatch, i) => <button key={swatch} type="button" onClick={() => selectColour(swatch)}
            aria-label={['Ink black', 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Paper white'][i]}
            aria-pressed={swatch === colour} className="grid h-11 w-10 place-items-center rounded-xl aria-pressed:bg-indigo-100">
            <span className="h-6 w-6 rounded-full border border-slate-400" style={{ backgroundColor: swatch }} />
          </button>)}
          <label className="grid h-11 w-11 place-items-center" title="Custom paint colour"><input type="color" aria-label="Custom paint colour" className="h-8 w-8 cursor-pointer" value={colour} onChange={(event) => selectColour(event.target.value)}/></label>
        </div>}
        {tool !== 'fill' && <div className="flex flex-wrap items-center gap-1" role="group" aria-label={tool === 'eraser' ? 'Eraser size' : 'Brush size'}>
          {sizes.map((choice) => <button key={choice.label} type="button" className={toggle}
            aria-pressed={size === choice} onClick={() => setSize(choice)}>{choice.label}</button>)}
        </div>}
      </div>
      <p className="mt-1 text-sm font-semibold text-slate-700" aria-live="polite">
        {tool === 'eraser' ? `${size.label} eraser. Drag the ring over brush marks.${picture ? ' Tap a coloured area to reset it.' : ''}`
          : tool === 'fill' ? `Tap a section of the ${picture.label.toLowerCase()} to colour it.`
            : `${size.label} brush. Draw directly on the sheet.`}
      </p>
    </section>
    <DrawingPaper key={art.template} sheet={sheet} picture={picture} tool={tool} colour={colour} size={activeSize} onChange={updateSheet} onRegion={changeRegion}/>
    {notice && <p className="sr-only" role="status">{notice}</p>}
    {saveError && <p role="status" className="text-sm font-bold text-amber-900">This device could not save the sheet. You can keep drawing here.</p>}
  </div>;
}
