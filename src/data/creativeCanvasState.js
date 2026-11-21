import { COLOURING_PICTURES } from './colouringPictures.js';
import { STAMPS, TEXTURES } from './colouringEffects.js';

export const MAX_STROKES = 100;
export const MAX_POINTS = 600;
export const MAX_STAMPS = 72;
export const PAPER_WIDTH = 1000;
export const PAPER_HEIGHT = 700;
export const BLANK_SHEET = 'blank';
const isPaint = (value) => typeof value === 'string' && /^#[a-f0-9]{6}$/i.test(value);
const isPoint = (point) => Array.isArray(point) && point.length === 2 && point.every(Number.isFinite);

export const newSheet = () => ({ fill: '#ffffff', strokes: [], colours: {}, textures: {}, stamps: [] });

const readSheet = (saved, picture) => {
  if (!saved || !isPaint(saved.fill) || !Array.isArray(saved.strokes)) return newSheet();
  const knownRegions = new Set((picture?.regions || []).map(({ id }) => id));
  const strokes = saved.strokes.slice(-MAX_STROKES).filter((stroke) =>
    isPaint(stroke?.colour) && Array.isArray(stroke.points) && stroke.points.length > 0
    && stroke.points.length <= MAX_POINTS && stroke.points.every(isPoint)).map(({ colour, erasing, points, size, region, artSpace }) => ({
    colour, erasing: erasing === true,
    ...(knownRegions.has(region) ? { region } : {}),
    ...(picture && artSpace ? { artSpace: true } : {}), points: points.map(([x, y]) => [Math.max(0, Math.min(x, PAPER_WIDTH)), Math.max(0, Math.min(y, PAPER_HEIGHT))]),
    size: Number.isFinite(size) ? Math.max(2, Math.min(size, 60)) : erasing ? 22 : 6,
  }));
  const colours = Object.fromEntries((picture?.regions || []).flatMap(({ id }) => (
    isPaint(saved.colours?.[id]) ? [[id, saved.colours[id]]] : []
  )));
  const textures = Object.fromEntries([...knownRegions].flatMap((id) => (
    TEXTURES.some((texture) => texture.id === saved.textures?.[id] && texture.id !== 'smooth') ? [[id, saved.textures[id]]] : []
  )));
  const stamps = Array.isArray(saved.stamps) ? saved.stamps.slice(-MAX_STAMPS).flatMap((stamp) => (
    STAMPS.some(({ id }) => id === stamp?.kind) && isPaint(stamp.colour) && isPoint(stamp.point) && (!picture || knownRegions.has(stamp.region))
      ? [{ kind: stamp.kind, colour: stamp.colour, point: stamp.point, ...(picture ? { region: stamp.region } : {}) }]
      : []
  )) : [];
  return { fill: saved.fill, strokes, colours, textures, stamps };
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
