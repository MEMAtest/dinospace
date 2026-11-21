import { PAPER_HEIGHT, PAPER_WIDTH } from '../../data/creativeCanvasState.js';
import { STAMPS } from '../../data/colouringEffects.js';

export const artworkFrame = (width, height) => {
  const scale = Math.min(width / PAPER_WIDTH, height / PAPER_HEIGHT);
  return { scale, left: (width - PAPER_WIDTH * scale) / 2, top: (height - PAPER_HEIGHT * scale) / 2 };
};

export const makeInkSurface = (width, height, density, picture) => {
  const { scale, left, top } = artworkFrame(width, height);
  const matrix = new DOMMatrix([scale, 0, 0, scale, left, top]);
  const regions = (picture?.regions || []).map(({ id, d }) => {
    const outline = new Path2D();
    outline.addPath(new Path2D(d), matrix);
    const outside = new Path2D();
    outside.rect(-2, -2, width + 4, height + 4);
    outside.addPath(outline);
    return { id, outline, outside };
  });
  return { width, height, density, scale, left, top, regions };
};

const clipToRegion = (context, surface, region) => {
  const index = surface.regions.findIndex(({ id }) => id === region);
  if (index === -1) return;
  context.clip(surface.regions[index].outline);
  // Later SVG parts cover earlier ones. Clip against each overlay separately,
  // since holes from overlapping overlays must not open the earlier colour.
  for (const overlay of surface.regions.slice(index + 1)) context.clip(overlay.outside, 'evenodd');
};

const pixelPoint = (surface, [x, y], artwork) => artwork
  ? [surface.left + x * surface.scale, surface.top + y * surface.scale]
  : [x * surface.width / PAPER_WIDTH, y * surface.height / PAPER_HEIGHT];

const clamp = (value, limit) => Math.max(0, Math.min(Math.round(value), limit));

export const inkPoint = (surface, position, artwork) => artwork
  ? [clamp((position.x * surface.width - surface.left) / surface.scale, PAPER_WIDTH), clamp((position.y * surface.height - surface.top) / surface.scale, PAPER_HEIGHT)]
  : [Math.round(position.x * PAPER_WIDTH), Math.round(position.y * PAPER_HEIGHT)];

export const drawStamps = (context, surface, stamps) => {
  context.setTransform(surface.density, 0, 0, surface.density, 0, 0);
  for (const { kind, colour, point, region } of stamps) {
    const stamp = STAMPS.find(({ id }) => id === kind);
    if (!stamp) continue;
    context.save();
    if (region) clipToRegion(context, surface, region);
    context.translate(...pixelPoint(surface, point, Boolean(region)));
    const scale = region ? surface.scale * 1.5 : 0.55;
    context.scale(scale, scale);
    const path = new Path2D(stamp.path);
    context.fillStyle = colour;
    context.strokeStyle = '#263044';
    context.lineWidth = 2.5;
    context.fill(path);
    context.stroke(path);
    context.restore();
  }
};

export const drawMarks = (context, surface, strokes) => {
  context.setTransform(surface.density, 0, 0, surface.density, 0, 0);
  for (const { colour, points, erasing, size, region, artSpace } of strokes) {
    if (!points.length) continue;
    context.save();
    if (region) clipToRegion(context, surface, region);
    const toPixel = (point) => pixelPoint(surface, point, Boolean(region || artSpace));
    context.globalCompositeOperation = erasing ? 'destination-out' : 'source-over';
    context.strokeStyle = colour;
    context.fillStyle = colour;
    context.lineWidth = size;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    const start = toPixel(points[0]);
    context.beginPath();
    if (points.length === 1) {
      context.arc(...start, size / 2, 0, 2 * Math.PI);
      context.fill();
    } else {
      context.moveTo(...start);
      for (let i = 1; i < points.length - 1; i += 1) {
        const [x, y] = toPixel(points[i]);
        const [nextX, nextY] = toPixel(points[i + 1]);
        context.quadraticCurveTo(x, y, (x + nextX) / 2, (y + nextY) / 2);
      }
      context.lineTo(...toPixel(points.at(-1)));
      context.stroke();
    }
    context.restore();
  }
};
