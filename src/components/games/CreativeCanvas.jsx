import { useRef, useState } from 'react';
import { STAMPS, TEXTURES } from '../../data/colouringEffects.js';
import { COLOURING_GROUPS, COLOURING_PICTURES } from '../../data/colouringPictures.js';
import { BLANK_SHEET, newSheet, packCanvas, readCanvas } from '../../data/creativeCanvasState.js';
import { mixPaintScoops } from '../../data/paintMix.js';
import { playerStorageKey } from '../../data/players.js';
import ColouringRelief from './ColouringRelief.jsx';
import DrawingPaper from './DrawingPaper.jsx';
import PaintMixer from './PaintMixer.jsx';
import { FocusMenu } from '../shared/FocusMenu.jsx';

const swatches = ['#293343', '#e45152', '#ed833c', '#f2c94c', '#3b9e64', '#4386cf', '#8658b8', '#fffdf7'];
const sizes = [
  { label: 'Small', brush: 3, eraser: 12 },
  { label: 'Medium', brush: 7, eraser: 24 },
  { label: 'Large', brush: 15, eraser: 44 },
];

export default function CreativeCanvas({ playerId, mixing = false, onLessons, onBack }) {
  const key = playerStorageKey(playerId, mixing ? 'mixing_canvas_v1' : 'shape_canvas_v1');
  const [art, setArt] = useState(() => readCanvas(key));
  const [view, setView] = useState('canvas');
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
  const goToCanvas = () => setView('canvas');
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
  const title = mixing ? 'Colour Mixing Lab' : 'Sky Shapes';
  const instructions = tool === 'eraser'
    ? 'Drag the ring to erase marks. Tap a filled area to reset it.'
    : tool === 'texture' ? `Tap a section to add ${currentTexture.label.toLowerCase()}.`
      : tool === 'stamp' ? `Tap to place a ${currentStamp.label.toLowerCase()}.`
        : tool === 'fill' ? `Tap an area of the ${picture.label.toLowerCase()} to colour it.`
          : picture ? 'Draw inside an outline.' : 'Draw on the paper.';
  const options = [
    ...(undo[art.template]?.length ? [{ label: 'Undo last edit', action: () => { undoEdit(); goToCanvas(); } }] : []),
    ...(picture ? [{ label: 'View in 3D', action: () => setView('relief') }] : []),
    ...(mixing && scoops.length ? [
      { label: 'Undo scoop', action: () => { setScoops(current => current.slice(0, -1)); setView('mix'); } },
      { label: 'Empty bucket', action: () => { setScoops([]); setView('mix'); } },
    ] : []),
    ...(hasArt ? [{ label: 'Clear sheet', description: 'Undo can bring this sheet back while you are here.', action: () => { updateSheet(newSheet()); setNotice('Sheet cleared. You can undo that.'); goToCanvas(); } }] : []),
    { label: mixing ? 'Paint lessons' : 'Shape lessons', action: onLessons },
    { label: 'Back to Creative Lab', action: onBack },
  ];
  const openMore = () => {
    if (picture) showRelief();
    setView('options');
  };
  const backFromOptions = () => { setRelief(null); goToCanvas(); };

  return <div className="focus-game creative-canvas-focus" data-board-focus="">
    <main className={`focus-game-body${view === 'canvas' || view === 'relief' ? '' : ' is-menu'}`}>
      <header className="focus-game-heading"><h1>{view === 'tools' ? 'Drawing tools' : view === 'mix' ? 'Mix paint' : title}</h1></header>
      {view === 'options' && <FocusMenu choices={options} onBack={backFromOptions} />}
      {view === 'mix' && <PaintMixer scoops={scoops} mixed={mixed} onAdd={addPaint}
        onUse={() => { activateMix(); goToCanvas(); }} onFill={fillBackground} onBack={goToCanvas} />}
      {view === 'tools' && <div className="focus-game-menu">
        <label htmlFor="creative-sheet">Paper or picture</label>
        <select id="creative-sheet" value={art.template} onChange={event => selectSheet(event.target.value)}>
          <option value={BLANK_SHEET}>Blank paper</option>
          {COLOURING_GROUPS.map(group => <optgroup key={group.label} label={group.label}>{group.pictures.map(id => <option key={id} value={id}>{COLOURING_PICTURES[id].label}</option>)}</optgroup>)}
        </select>
        <label htmlFor="creative-tool">Tool</label>
        <select id="creative-tool" value={tool} onChange={event => setTool(event.target.value)}>
          {picture && <><option value="fill">Colour areas</option><option value="texture">Textures</option></>}
          <option value="brush">Brush</option><option value="eraser">Eraser</option><option value="stamp">Stamps</option>
        </select>
        {(tool === 'brush' || tool === 'eraser') && <label>Size
          <select value={size.label} onChange={event => setSize(sizes.find(item => item.label === event.target.value))}>
            {sizes.map(item => <option key={item.label}>{item.label}</option>)}
          </select>
        </label>}
        {tool === 'texture' && <label>Texture
          <select value={texture} onChange={event => setTexture(event.target.value)}>{TEXTURES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
        </label>}
        {tool === 'stamp' && <label>Stamp
          <select value={stamp} onChange={event => setStamp(event.target.value)}>{STAMPS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
        </label>}
        {tool !== 'texture' && tool !== 'eraser' && <label className="creative-colour-control">Paint colour
          <input type="color" value={colour} list="creative-swatches" onChange={event => selectColour(event.target.value)} />
          <datalist id="creative-swatches">{swatches.map(swatch => <option key={swatch} value={swatch} />)}</datalist>
        </label>}
        <p>{instructions}</p>
        <button type="button" className="focus-game-button is-primary" onClick={goToCanvas}>Back to paper</button>
      </div>}
      {view === 'relief' && relief && <>
        <ColouringRelief key={relief} picture={picture} sheet={sheet} source={relief}/>
        <button type="button" className="focus-game-button mt-2 w-full" onClick={backFromOptions}>Back to colouring</button>
      </>}
      {view === 'canvas' && <>
        <p className="focus-game-message creative-paper-instructions">
          {tool !== 'texture' && tool !== 'eraser' && <span className="creative-current-paint" style={{ backgroundColor: colour }} aria-hidden="true" />}
          {instructions}
        </p>
        <div ref={canvasSection} role="group" aria-label="Painting area">
          <DrawingPaper key={art.template} sheet={sheet} picture={picture} tool={tool} colour={colour} size={activeSize} stamp={stamp} onChange={updateSheet} onRegion={changeRegion}/>
        </div>
        <div className="focus-game-actions mt-3">
          {mixing && <button type="button" className="focus-game-button" onClick={() => setView('mix')}>Mix paint</button>}
          <button type="button" className="focus-game-button" onClick={() => setView('tools')}>Tools</button>
          <button type="button" className="focus-game-button" onClick={openMore}>Options</button>
        </div>
      </>}
      {notice && <p className="sr-only" role="status">{notice}</p>}
      {saveError && <p role="status" className="focus-game-message">This device could not save the sheet. You can keep drawing here.</p>}
    </main>
  </div>;
}
