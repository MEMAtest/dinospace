import { COLOURING_PICTURES } from './colouringPictures.js';

export const MAX_STROKES = 100;
export const MAX_POINTS = 600;
export const PAPER_WIDTH = 1000;
export const PAPER_HEIGHT = 700;
export const BLANK_SHEET = 'blank';
const isPaint = (value) => typeof value === 'string' && /^#[a-f0-9]{6}$/i.test(value);
const isPoint = (point) => Array.isArray(point) && point.length === 2 && point.every(Number.isFinite);

export const newSheet = () => ({ fill: '#ffffff', strokes: [], colours: {} });

const readSheet = (saved, picture) => {
  if (!saved || !isPaint(saved.fill) || !Array.isArray(saved.strokes)) return newSheet();
  const strokes = saved.strokes.slice(-MAX_STROKES).filter((stroke) =>
    isPaint(stroke?.colour) && Array.isArray(stroke.points) && stroke.points.length > 0
    && stroke.points.length <= MAX_POINTS && stroke.points.every(isPoint)).map(({ colour, erasing, points, size }) => ({
    colour, erasing: erasing === true, points: points.map(([x, y]) => [Math.max(0, Math.min(x, PAPER_WIDTH)), Math.max(0, Math.min(y, PAPER_HEIGHT))]),
    size: Number.isFinite(size) ? Math.max(2, Math.min(size, 60)) : erasing ? 22 : 6,
  }));
  const colours = Object.fromEntries((picture?.regions || []).flatMap(({ id }) => (
    isPaint(saved.colours?.[id]) ? [[id, saved.colours[id]]] : []
  )));
  return { fill: saved.fill, strokes, colours };
};

export const readCanvas = (key, storage) => {
  try {
    const saved = JSON.parse((storage || globalThis.localStorage).getItem(key));
    return {
      template: Object.hasOwn(COLOURING_PICTURES, saved?.template) ? saved.template : BLANK_SHEET,
      sheets: {
        [BLANK_SHEET]: readSheet(saved),
        ...Object.fromEntries(Object.entries(COLOURING_PICTURES).flatMap(([id, picture]) => (
          saved?.pictures?.[id] ? [[id, readSheet(saved.pictures[id], picture)]] : []
        ))),
      },
    };
  } catch { return { template: BLANK_SHEET, sheets: { [BLANK_SHEET]: newSheet() } }; }
};

export const packCanvas = ({ template, sheets }) => {
  const { [BLANK_SHEET]: blank, ...pictures } = sheets;
  // Keep the original blank sheet fields at the root for v1 drafts.
  return { ...blank, template, pictures };
};
