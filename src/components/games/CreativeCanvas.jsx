import { useRef, useState } from 'react';
import { Eraser, PaintBucket, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { COLOUR_PAINTS } from '../../data/colourLabAdventure.js';
import { mixPaintScoops } from '../../data/paintMix.js';
import { playerStorageKey } from '../../data/players.js';

const paper = () => ({ fill: '#ffffff', strokes: [] });
const MAX_STROKES = 100;
const MAX_POINTS = 600;
const isPaint = (value) => typeof value === 'string' && /^#[a-f0-9]{6}$/i.test(value);
const isPoint = (point) => Array.isArray(point) && point.length === 2 && point.every(Number.isFinite);

const readPaper = (key) => {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (!saved || !isPaint(saved.fill) || !Array.isArray(saved.strokes)) return paper();
    return { fill: saved.fill, strokes: saved.strokes.slice(-MAX_STROKES).filter((stroke) =>
      isPaint(stroke?.colour) && Array.isArray(stroke.points) && stroke.points.length > 0
      && stroke.points.length <= MAX_POINTS && stroke.points.every(isPoint)) };
  } catch { return paper(); }
};

const control = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 font-bold text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:opacity-45';
const canvasWidth = 1000;
const canvasHeight = 700;
const paintNames = ['Red', 'Yellow', 'Blue', 'White', 'Black'];

const Ink = ({ stroke }) => {
  const points = stroke.points.length === 1 ? [...stroke.points, [stroke.points[0][0] + 0.01, stroke.points[0][1]]] : stroke.points;
  return <polyline points={points.map(([x, y]) => `${x},${y}`).join(' ')} fill="none" stroke={stroke.colour}
    strokeWidth={stroke.erasing ? 22 : 6} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />;
};

const DrawingPaper = ({ art, onChange, colour, label, controls }) => {
  const [tool, setTool] = useState('brush');
  const [preview, setPreview] = useState(null);
  const active = useRef(null);

  const pointFrom = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return [Math.round(Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)) * canvasWidth),
      Math.round(Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)) * canvasHeight)];
  };
  const start = (event) => {
    if (active.current || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const stroke = { pointerId: event.pointerId, colour, erasing: tool === 'eraser', points: [pointFrom(event)] };
    active.current = stroke;
    setPreview(stroke);
  };
  const move = (event) => {
    const stroke = active.current;
    if (!stroke || stroke.pointerId !== event.pointerId) return;
    const point = pointFrom(event);
    const previous = stroke.points.at(-1);
    if (Math.hypot(point[0] - previous[0], point[1] - previous[1]) < 2) return;
    if (stroke.points.length >= MAX_POINTS) {
      stroke.points = stroke.points.filter((_, index, points) => index % 2 === 0 || index === points.length - 1);
    }
    stroke.points.push(point);
    setPreview({ ...stroke });
  };
  const finish = (event) => {
    const stroke = active.current;
    if (!stroke || stroke.pointerId !== event.pointerId) return;
    active.current = null;
    setPreview(null);
    onChange({ ...art, strokes: [...art.strokes, { colour: stroke.colour, erasing: stroke.erasing, points: stroke.points }].slice(-MAX_STROKES) });
  };

  return <section aria-label={label} className="min-w-0">
    <div className="mb-2 flex flex-wrap items-center gap-1.5">
      {controls}
      <button type="button" className={control} aria-pressed={tool === 'brush'} onClick={() => setTool('brush')}><Pencil size={17}/> Brush</button>
      <button type="button" className={control} aria-pressed={tool === 'eraser'} onClick={() => setTool('eraser')}><Eraser size={17}/> Eraser</button>
      <button type="button" className={control} disabled={!art.strokes.length} onClick={() => onChange({ ...art, strokes: art.strokes.slice(0, -1) })}><RotateCcw size={17}/> Undo mark</button>
      <button type="button" className={control} disabled={!art.strokes.length && art.fill === '#ffffff'} onClick={() => onChange(paper())}><Trash2 size={17}/> New sheet</button>
    </div>
    <svg aria-label={label + ' whiteboard'} role="img" viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} preserveAspectRatio="none"
      className="block h-[max(350px,55dvh)] w-full touch-none select-none rounded-2xl border-2 border-slate-300 bg-white shadow-sm sm:h-[min(65dvh,640px)]"
      style={{ backgroundColor: art.fill }} onPointerDown={start} onPointerMove={move} onPointerUp={finish}
      onPointerCancel={finish} onLostPointerCapture={finish}>
      {art.strokes.map((stroke, index) => <Ink key={index} stroke={stroke.erasing ? { ...stroke, colour: art.fill } : stroke} />)}
      {preview && <Ink stroke={preview.erasing ? { ...preview, colour: art.fill } : preview}/>}
    </svg>
  </section>;
};

export default function CreativeCanvas({ playerId, mixing = false }) {
  const key = playerStorageKey(playerId, mixing ? 'mixing_canvas_v1' : 'shape_canvas_v1');
  const [art, setArt] = useState(() => readPaper(key));
  const [saveError, setSaveError] = useState(false);
  const [scoops, setScoops] = useState({});
  const [mixed, setMixed] = useState(null);
  const [colour, setColour] = useState('#25324b');
  const [notice, setNotice] = useState('');
  const total = Object.values(scoops).reduce((sum, value) => sum + value, 0);

  const updateArt = (next) => {
    setArt(next);
    try { localStorage.setItem(key, JSON.stringify(next)); setSaveError(false); }
    catch { setSaveError(true); }
  };
  const addPaint = (name) => {
    setScoops((current) => ({ ...current, [name]: (current[name] || 0) + 1 }));
    setMixed(null);
    setNotice('');
  };
  const stir = () => {
    const result = mixPaintScoops(scoops);
    setMixed(result);
    setNotice('Mixed paint is ready. Pour it onto the sheet or use the brush.');
  };

  return <div className="mx-auto grid w-full max-w-6xl gap-3">
    {mixing && <section className="rounded-2xl border border-[#dbcfd9] bg-[#fdf7fc] p-3" aria-label="Mixing bucket">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-black text-[#53264b]"><PaintBucket size={23}/> Paint bucket</h2>
        <p aria-live="polite" className="text-sm font-semibold text-[#64495e]">{total ? `${total} ${total === 1 ? 'scoop' : 'scoops'} in the bucket` : 'Choose a paint to add a scoop.'}</p>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {paintNames.map((name) => <button type="button" key={name} onClick={() => addPaint(name)} disabled={total >= 24} aria-label={`Add ${name} to bucket`}
          className="grid min-h-14 min-w-0 place-items-center rounded-xl border border-[#dbcfd9] bg-white px-0.5 py-1 text-xs font-bold text-[#53264b] disabled:opacity-50">
          <span className="h-5 w-5 rounded-full border border-slate-500/50 sm:h-7 sm:w-7" style={{ backgroundColor: COLOUR_PAINTS[name] }}/>{name}{scoops[name] ? ` ×${scoops[name]}` : ''}
        </button>)}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <button type="button" className={control} onClick={stir} disabled={!total || !!mixed}>Mix paint</button>
        <button type="button" className={control} onClick={() => { setScoops({}); setMixed(null); setNotice(''); }} disabled={!total}>Empty bucket</button>
        {mixed && <>
          <span aria-label="Mixed paint sample" role="img" className="h-9 w-9 rounded-full border border-slate-600/40" style={{ backgroundColor: mixed }}/>
          <button type="button" className={control} onClick={() => { setColour(mixed); setNotice('The brush now uses your mixed paint.'); }}>Use on brush</button>
          <button type="button" className={control} onClick={() => { updateArt({ ...art, fill: mixed }); setNotice('Your mixed paint filled the sheet.'); }}>Pour onto canvas</button>
        </>}
      </div>
      {notice && <p className="mt-2 text-sm font-semibold text-[#64495e]" role="status">{notice}</p>}
    </section>}
    <DrawingPaper art={art} onChange={updateArt} colour={colour} label={mixing ? 'Paint canvas' : 'Drawing canvas'}
      controls={<label className={control}>Brush colour <input aria-label="Brush colour" type="color" value={colour} onChange={(event) => setColour(event.target.value)} className="h-8 w-8 cursor-pointer" /></label>} />
    {saveError && <p role="status" className="text-sm font-bold text-amber-900">This device could not save the sheet. You can keep drawing here.</p>}
  </div>;
}
