import { useLayoutEffect, useRef, useState } from 'react';
import ColouringPicture from './ColouringPicture.jsx';
import { drawMarks, drawStamps, inkPoint, makeInkSurface } from './creativeInk.js';
import { MAX_POINTS, MAX_STAMPS, MAX_STROKES } from '../../data/creativeCanvasState.js';

const positionIn = (event) => {
  const r = event.currentTarget.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(1, (event.clientX - r.left) / r.width)),
    y: Math.max(0, Math.min(1, (event.clientY - r.top) / r.height)),
  };
};
const paintFrame = (canvas, base, preview) => {
  if (!base) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  context.resetTransform();
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(base.bitmap, 0, 0);
  if (preview) drawMarks(context, base, [preview]);
};

export default function DrawingPaper({ sheet, picture, tool, colour, size, stamp, onChange, onRegion }) {
  const canvas = useRef(null);
  const stampCanvas = useRef(null);
  const active = useRef(null);
  const base = useRef(null);
  const [preview, setPreview] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const markTool = tool === 'brush' || tool === 'eraser';

  useLayoutEffect(() => {
    const element = canvas.current;
    const render = () => {
      const { width, height } = element.getBoundingClientRect();
      if (!width || !height) return;
      const density = Math.min(window.devicePixelRatio || 1, 2);
      const bitmap = base.current?.bitmap || document.createElement('canvas');
      bitmap.width = element.width = Math.round(width * density);
      bitmap.height = element.height = Math.round(height * density);
      const context = bitmap.getContext('2d');
      if (!context) return;
      base.current = { ...makeInkSurface(width, height, density, picture), bitmap };
      drawMarks(context, base.current, sheet.strokes);
      stampCanvas.current.width = element.width;
      stampCanvas.current.height = element.height;
      const stampContext = stampCanvas.current.getContext('2d');
      if (stampContext) drawStamps(stampContext, base.current, sheet.stamps);
      paintFrame(element, base.current, active.current);
    };
    render();
    const observer = new ResizeObserver(render);
    observer.observe(element);
    return () => observer.disconnect();
  }, [picture, sheet.strokes, sheet.stamps]);

  useLayoutEffect(() => {
    paintFrame(canvas.current, base.current, preview);
  }, [preview]);

  const start = (event) => {
    if (active.current || event.button !== 0 || !base.current) return;
    const position = positionIn(event);
    const region = event.target.closest?.('[data-canvas-region]')?.getAttribute('data-canvas-region');
    if (tool === 'stamp') {
      if (picture && !region) return;
      const placed = { kind: stamp, colour, point: inkPoint(base.current, position, Boolean(picture)), ...(region ? { region } : {}) };
      onChange({ ...sheet, stamps: [...sheet.stamps, placed].slice(-MAX_STAMPS) });
      return;
    }
    if (!markTool || (picture && tool === 'brush' && !region)) return;
    const artSpace = Boolean(picture && region);
    event.currentTarget.setPointerCapture(event.pointerId);
    const stroke = {
      pointerId: event.pointerId, pointerType: event.pointerType,
      startX: event.clientX, startY: event.clientY, moved: false,
      hitRegion: region, ...(tool === 'brush' && region ? { region } : {}),
      artSpace, colour, erasing: tool === 'eraser', size, points: [inkPoint(base.current, position, artSpace)],
    };
    active.current = stroke;
    setCursor(position);
    setPreview(stroke);
    setDrawing(true);
  };

  const move = (event) => {
    if (!markTool) return;
    const position = positionIn(event);
    if (event.pointerType === 'mouse' || active.current?.pointerId === event.pointerId) setCursor(position);
    const stroke = active.current;
    if (!stroke || stroke.pointerId !== event.pointerId) return;
    const point = inkPoint(base.current, position, stroke.artSpace);
    const last = stroke.points.at(-1);
    if (Math.hypot(event.clientX - stroke.startX, event.clientY - stroke.startY) > 5) stroke.moved = true;
    if (Math.hypot(point[0] - last[0], point[1] - last[1]) < 2) return;
    if (stroke.points.length >= MAX_POINTS) {
      stroke.points = stroke.points.filter((_, index, points) => index % 2 === 0 || index === points.length - 1);
    }
    stroke.points.push(point);
    setPreview({ ...stroke });
  };

  const finish = (event, cancelled = false) => {
    const stroke = active.current;
    if (!stroke || stroke.pointerId !== event.pointerId) return;
    active.current = null;
    setPreview(null);
    setDrawing(false);
    if (stroke.pointerType !== 'mouse' || cancelled) setCursor(null);
    if (cancelled) return;
    if (stroke.erasing && !stroke.moved && sheet.colours[stroke.hitRegion]) {
      onRegion(stroke.hitRegion, 'eraser');
      return;
    }
    const { colour, erasing, points, size, region, artSpace } = stroke;
    if (erasing && !sheet.strokes.some((mark) => !mark.erasing)) return;
    onChange({ ...sheet, strokes: [...sheet.strokes, { colour, erasing, points, size, ...(region ? { region } : {}), ...(artSpace ? { artSpace } : {}) }].slice(-MAX_STROKES) });
  };

  return <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-sm">
    <div role="group" aria-label={picture ? `${picture.label} canvas` : 'Blank drawing canvas'}
      className={`relative isolate block h-[max(350px,55dvh)] w-full touch-none select-none overflow-hidden sm:h-[min(65dvh,640px)] ${tool === 'eraser' ? 'cursor-none' : 'cursor-crosshair'}`}
      style={{ backgroundColor: sheet.fill }} onPointerDown={start} onPointerEnter={move} onPointerMove={move}
      onPointerUp={finish} onPointerCancel={(event) => finish(event, true)} onLostPointerCapture={(event) => finish(event, true)}
      onPointerLeave={() => { if (!active.current) setCursor(null); }}>
      {picture && <ColouringPicture picture={picture} colours={sheet.colours} textures={sheet.textures} tool={tool} onRegion={onRegion}/>}
      <canvas ref={stampCanvas} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full"/>
      <canvas ref={canvas} data-brush-ink aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full"/>
      {tool === 'eraser' && cursor && <span aria-hidden="true" data-eraser-cursor
        className={`pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-950 ring-2 ring-white ${drawing ? 'bg-white/30' : ''}`}
        style={{ width: size, height: size, left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%` }}/>}
    </div>
  </div>;
}
