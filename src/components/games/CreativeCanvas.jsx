import { useRef, useState } from 'react';
import { Box, Eraser, Layers, PaintBucket, Pencil, RotateCcw, Stamp } from 'lucide-react';
import { STAMPS, TEXTURES } from '../../data/colouringEffects.js';
import { COLOURING_GROUPS, COLOURING_PICTURES } from '../../data/colouringPictures.js';
import { BLANK_SHEET, newSheet, packCanvas, readCanvas } from '../../data/creativeCanvasState.js';
import { mixPaintScoops } from '../../data/paintMix.js';
import { playerStorageKey } from '../../data/players.js';
import ColouringPicture from './ColouringPicture.jsx';
import ColouringRelief from './ColouringRelief.jsx';
import DrawingPaper from './DrawingPaper.jsx';
import PaintMixer from './PaintMixer.jsx';

const control = 'inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-2.5 text-sm font-bold text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-45 sm:px-3';
const toggle = control + ' aria-pressed:border-indigo-700 aria-pressed:bg-indigo-700 aria-pressed:text-white';
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
  const [texture, setTexture] = useState('fur');
  const [stamp, setStamp] = useState('star');
  const [relief, setRelief] = useState(null);
  const [undo, setUndo] = useState({});
  const [saveError, setSaveError] = useState(false);
  const [scoops, setScoops] = useState([]);
  const [useMix, setUseMix] = useState(false);
  const [manualColour, setManualColour] = useState(swatches[0]);
  const canvasSection = useRef(null);
  const mixture = scoops.reduce((counts, paint) => ({ ...counts, [paint]: (counts[paint] || 0) + 1 }), {});
  const mixed = mixPaintScoops(mixture);
  const colour = (useMix && mixed) || manualColour;
  const [notice, setNotice] = useState('');
  const sheet = art.sheets[art.template] || newSheet();
  const picture = COLOURING_PICTURES[art.template];

  const persist = (next) => {
    setArt(next);
    try { localStorage.setItem(key, JSON.stringify(packCanvas(next))); setSaveError(false); }
    catch { setSaveError(true); }
  };
  const updateSheet = (next) => {
    setRelief(null);
    setUndo((history) => ({ ...history, [art.template]: [...(history[art.template] || []), sheet].slice(-12) }));
    persist({ ...art, sheets: { ...art.sheets, [art.template]: next } });
  };
  const undoEdit = () => {
    const history = undo[art.template] || [];
    if (!history.length) return;
    setUndo({ ...undo, [art.template]: history.slice(0, -1) });
    persist({ ...art, sheets: { ...art.sheets, [art.template]: history.at(-1) } });
    setRelief(null);
    setNotice('Last change undone.');
  };
  const selectSheet = (template) => {
    setRelief(null);
    if (template !== art.template) persist({ ...art, template });
    setTool(template === BLANK_SHEET ? 'brush' : 'fill');
    setNotice('');
  };
  const selectColour = (value) => {
    setManualColour(value);
    setUseMix(false);
    if (tool === 'eraser' || tool === 'texture') setTool(picture ? 'fill' : 'brush');
    setNotice('');
  };
  const changeRegion = (id, action) => {
    const region = picture?.regions.find((region) => region.id === id);
    if (!region) return;
    if (action === 'texture') {
      const textures = { ...sheet.textures };
      if (texture === 'smooth') delete textures[id];
      else textures[id] = texture;
      updateSheet({ ...sheet, textures });
      setNotice(`${region.name} texture updated.`);
      return;
    }
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
  const activateMix = () => {
    setUseMix(true);
    if (tool === 'eraser' || tool === 'texture') setTool(picture ? 'fill' : 'brush');
    setNotice('');
  };
  const addPaint = (name) => {
    setScoops((current) => current.length < 24 ? [...current, name] : current);
    activateMix();
  };
  const goToCanvas = () => {
    canvasSection.current.scrollIntoView({ block: 'start' });
    canvasSection.current.focus({ preventScroll: true });
  };
  const fillBackground = () => {
    updateSheet({ ...sheet, fill: mixed });
    setNotice('Background filled with your mix.');
    goToCanvas();
  };

  const showRelief = () => {
    const svg = canvasSection.current.querySelector('[data-colouring-source]');
    if (!svg) return;
    const clone = svg.cloneNode(true);
    const [,, width, height] = clone.getAttribute('viewBox').split(' ');
    clone.setAttribute('width', width);
    clone.setAttribute('height', height);
    clone.removeAttribute('class');
    setRelief(new XMLSerializer().serializeToString(clone));
  };

  const activeSize = tool === 'eraser' ? size.eraser : size.brush;
  const hasArt = sheet.strokes.length || sheet.stamps.length || sheet.fill !== '#ffffff' || Object.keys(sheet.colours).length || Object.keys(sheet.textures).length;
  const currentTexture = TEXTURES.find(({ id }) => id === texture);
  const currentStamp = STAMPS.find(({ id }) => id === stamp);
  const selectedGroup = COLOURING_GROUPS.find(({ label }) => label === gallery);

  return <div className="mx-auto grid w-full max-w-6xl gap-3">
    {mixing && <PaintMixer scoops={scoops} mixed={mixed} active={useMix}
      useText={tool === 'fill' ? 'Tap part of the picture to paint it.' : tool === 'brush' ? 'Draw on the canvas with your mix.' : tool === 'stamp' ? 'Tap the sheet to place a stamp in your colour.' : 'Select a painting tool to use your mix.'}
      onAdd={addPaint} onUndo={() => setScoops((current) => current.slice(0, -1))} onClear={() => setScoops([])}
      onUse={activateMix} onFill={fillBackground} onCanvas={goToCanvas}/>}
    <section aria-label="Choose a colouring picture" className="rounded-2xl border border-slate-200 bg-white p-2 sm:p-3">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Picture categories">
        <button type="button" className={toggle} aria-pressed={!gallery && !picture} onClick={() => { setGallery(''); selectSheet(BLANK_SHEET); }}>Blank sheet</button>
        {COLOURING_GROUPS.map(({ label }) => <button key={label} type="button" className={toggle} aria-pressed={label === gallery}
          onClick={() => setGallery(gallery === label ? '' : label)}>{label}</button>)}
      </div>
      {selectedGroup && <div className="mt-2 flex flex-wrap gap-2">
        {selectedGroup.pictures.map((id) => <button key={id} type="button" className={toggle + ' min-w-[8.25rem]'}
          aria-pressed={art.template === id} onClick={() => selectSheet(id)}>
          <span className="relative h-9 w-12 shrink-0 overflow-hidden rounded-md bg-white"><ColouringPicture picture={COLOURING_PICTURES[id]} colours={art.sheets[id]?.colours} textures={art.sheets[id]?.textures}/></span>
          {COLOURING_PICTURES[id].label}
        </button>)}
      </div>}
    </section>

    <section hidden={Boolean(relief)} aria-label="Canvas tools" className="rounded-2xl border border-slate-200 bg-white p-2 sm:p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {picture && <button type="button" className={toggle} onClick={() => setTool('fill')} aria-pressed={tool === 'fill'}><PaintBucket size={17}/> Colour areas</button>}
        {picture && <button type="button" className={toggle} onClick={() => setTool('texture')} aria-pressed={tool === 'texture'}><Layers size={17}/> Textures</button>}
        <button type="button" className={toggle} onClick={() => setTool('stamp')} aria-pressed={tool === 'stamp'}><Stamp size={17}/> Stamps</button>
        <button type="button" className={toggle} onClick={() => setTool('brush')} aria-pressed={tool === 'brush'}><Pencil size={17}/> Brush</button>
        <button type="button" className={toggle} onClick={() => setTool('eraser')} aria-pressed={tool === 'eraser'}><Eraser size={17}/> Eraser</button>
        <button type="button" className={control} onClick={undoEdit} disabled={!undo[art.template]?.length}><RotateCcw size={17}/> Undo</button>
        <button type="button" className={control} disabled={!hasArt} onClick={() => { updateSheet(newSheet()); setNotice('Sheet cleared. You can undo that.'); }}>Clear sheet</button>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        {tool !== 'eraser' && tool !== 'texture' && <div className="flex flex-wrap items-center gap-0.5" role="group" aria-label="Paint colours">
          {swatches.map((swatch, i) => <button key={swatch} type="button" onClick={() => selectColour(swatch)}
            aria-label={['Ink black', 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Paper white'][i]}
            aria-pressed={swatch === colour} className="grid h-11 w-10 place-items-center rounded-xl aria-pressed:bg-indigo-100">
            <span className="h-6 w-6 rounded-full border border-slate-400" style={{ backgroundColor: swatch }} />
          </button>)}
          <label className="grid h-11 w-11 place-items-center" title="Custom paint colour"><input type="color" aria-label="Custom paint colour" className="h-8 w-8 cursor-pointer" value={colour} onChange={(event) => selectColour(event.target.value)}/></label>
        </div>}
        {(tool === 'brush' || tool === 'eraser') && <div className="flex flex-wrap items-center gap-1" role="group" aria-label={tool === 'eraser' ? 'Eraser size' : 'Brush size'}>
          {sizes.map((choice) => <button key={choice.label} type="button" className={toggle}
            aria-pressed={size === choice} onClick={() => setSize(choice)}>{choice.label}</button>)}
        </div>}
      </div>
      {tool === 'texture' && <div role="group" aria-label="Texture choices" className="mt-2 flex flex-wrap gap-1.5">
        {TEXTURES.map(({ id, label, dark, light, width, height }) => <button type="button" key={id} className={toggle} aria-pressed={id === texture} onClick={() => setTexture(id)}>
          {dark && <svg viewBox={`0 0 ${width} ${height}`} width="23" height="20" aria-hidden="true"><path d={dark} stroke="currentColor" strokeWidth="1.7" fill="none"/><path d={light} opacity=".45" stroke="currentColor" fill="none"/></svg>}
          {label}
        </button>)}
      </div>}
      {tool === 'stamp' && <div role="group" aria-label="Stamp choices" className="mt-2 flex flex-wrap gap-1.5">
        {STAMPS.map(({ id, label, path }) => <button type="button" key={id} className={toggle} aria-pressed={id === stamp} onClick={() => setStamp(id)}>
          <svg viewBox="-34 -34 68 68" width="21" height="21" aria-hidden="true"><path d={path} fill="currentColor"/></svg>{label}
        </button>)}
      </div>}
      <p className="mt-1 text-sm font-semibold text-slate-700" aria-live="polite">
        {tool === 'eraser' ? `${size.label} eraser. Drag the ring over brush marks.${picture ? ' Tap a coloured area to reset it.' : ''}`
          : tool === 'texture' ? `Tap a section to apply ${currentTexture.label.toLowerCase()}.`
            : tool === 'stamp' ? `Tap ${picture ? 'inside a section' : 'the sheet'} to place a ${currentStamp.label.toLowerCase()}.`
              : tool === 'fill' ? `Tap a section of the ${picture.label.toLowerCase()} to colour it.`
                : picture ? 'Start inside a section. Your brush stays within its outline.' : `${size.label} brush. Draw directly on the sheet.`}
      </p>
    </section>
    <div ref={canvasSection} tabIndex={-1} role="group" aria-label="Painting area" className="scroll-mt-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600">
      {picture && <button type="button" className={control + ' mb-2'} onClick={relief ? () => setRelief(null) : showRelief}>
        <Box size={18}/> {relief ? 'Back to colouring' : 'View in 3D'}
      </button>}
      {relief && <ColouringRelief key={relief} picture={picture} sheet={sheet} source={relief}/>}
      {!relief && mixing && useMix && mixed && tool !== 'eraser' && tool !== 'texture' && <p className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-800">
        <span className="h-5 w-5 rounded-full border border-slate-500/45" style={{ backgroundColor: mixed }} aria-hidden="true"/>
        {tool === 'fill' ? 'Tap the picture to use your mix.' : tool === 'stamp' ? 'Place a stamp in your new colour.' : 'Draw here with your mix.'}
      </p>}
      {!relief && <DrawingPaper key={art.template} sheet={sheet} picture={picture} tool={tool} colour={colour} size={activeSize} stamp={stamp} onChange={updateSheet} onRegion={changeRegion}/>}
    </div>
    {notice && <p className="sr-only" role="status">{notice}</p>}
    {saveError && <p role="status" className="text-sm font-bold text-amber-900">This device could not save the sheet. You can keep drawing here.</p>}
  </div>;
}
