import { useLayoutEffect, useRef, useState } from 'react';
import ColouringPicture from './ColouringPicture.jsx';
import { MAX_POINTS, MAX_STROKES, PAPER_HEIGHT, PAPER_WIDTH } from '../../data/creativeCanvasState.js';

const positionIn = (event) => {
  const r = event.currentTarget.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(1, (event.clientX - r.left) / r.width)),
    y: Math.max(0, Math.min(1, (event.clientY - r.top) / r.height)),
  };
};
const paperPoint = ({ x, y }) => [Math.round(x * PAPER_WIDTH), Math.round(y * PAPER_HEIGHT)];

const drawMarks = (context, { width, height, density }, strokes) => {
  context.setTransform(density, 0, 0, density, 0, 0);
  context.lineCap = 'round';
  context.lineJoin = 'round';

  for (const { colour, points, erasing, size } of strokes) {
    if (!points.length) continue;
    const toPixel = ([x, y]) => [x * width / PAPER_WIDTH, y * height / PAPER_HEIGHT];
    context.globalCompositeOperation = erasing ? 'destination-out' : 'source-over';
    context.strokeStyle = colour;
    context.fillStyle = colour;
    context.lineWidth = size;
    const start = toPixel(points[0]);
    context.beginPath();
    if (points.length === 1) {
      context.arc(...start, size / 2, 0, 2 * Math.PI);
      context.fill();
      continue;
    }
    context.moveTo(...start);
    for (let i = 1; i < points.length - 1; i += 1) {
      const [x, y] = toPixel(points[i]);
      const [nextX, nextY] = toPixel(points[i + 1]);
      context.quadraticCurveTo(x, y, (x + nextX) / 2, (y + nextY) / 2);
    }
    context.lineTo(...toPixel(points.at(-1)));
    context.stroke();
  }
  context.globalCompositeOperation = 'source-over';
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

export default function DrawingPaper({ sheet, picture, tool, colour, size, onChange, onRegion }) {
  const canvas = useRef(null);
  const active = useRef(null);
  const base = useRef(null);
  const [preview, setPreview] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const markTool = tool !== 'fill';

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
      base.current = { bitmap, width, height, density };
      drawMarks(context, base.current, sheet.strokes);
      paintFrame(element, base.current, active.current);
    };
    render();
    const observer = new ResizeObserver(render);
    observer.observe(element);
    return () => observer.disconnect();
  }, [sheet.strokes]);

  useLayoutEffect(() => {
    paintFrame(canvas.current, base.current, preview);
  }, [preview]);

  const start = (event) => {
    if (!markTool || active.current || event.button !== 0) return;
    const position = positionIn(event);
    event.currentTarget.setPointerCapture(event.pointerId);
    const stroke = {
      pointerId: event.pointerId, pointerType: event.pointerType,
      startX: event.clientX, startY: event.clientY, moved: false,
      region: event.target.closest?.('[data-canvas-region]')?.getAttribute('data-canvas-region'),
      colour, erasing: tool === 'eraser', size, points: [paperPoint(position)],
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
    const point = paperPoint(position);
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
    if (stroke.erasing && !stroke.moved && sheet.colours[stroke.region]) {
      onRegion(stroke.region, 'eraser');
      return;
    }
    const { colour, erasing, points, size } = stroke;
    if (erasing && !sheet.strokes.some((mark) => !mark.erasing)) return;
    onChange({ ...sheet, strokes: [...sheet.strokes, { colour, erasing, points, size }].slice(-MAX_STROKES) });
  };

  return <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-sm">
    <div role="group" aria-label={picture ? `${picture.label} canvas` : 'Blank drawing canvas'}
      className={`relative isolate block h-[max(350px,55dvh)] w-full touch-none select-none overflow-hidden sm:h-[min(65dvh,640px)] ${tool === 'eraser' ? 'cursor-none' : 'cursor-crosshair'}`}
      style={{ backgroundColor: sheet.fill }} onPointerDown={start} onPointerEnter={move} onPointerMove={move}
      onPointerUp={finish} onPointerCancel={(event) => finish(event, true)} onLostPointerCapture={(event) => finish(event, true)}
      onPointerLeave={() => { if (!active.current) setCursor(null); }}>
      {picture && <ColouringPicture picture={picture} colours={sheet.colours} tool={tool} onRegion={onRegion}/>}
      <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full"/>
      {tool === 'eraser' && cursor && <span aria-hidden="true" data-eraser-cursor
        className={`pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-950 ring-2 ring-white ${drawing ? 'bg-white/30' : ''}`}
        style={{ width: size, height: size, left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%` }}/>}
    </div>
  </div>;
}
