// Drop-in artwork. Any image saved as src/assets/little/<name>.png (or
// .webp/.jpg/.svg) replaces the built-in vector drawing with that name. See
// docs/image-brief.md for the list of names and sizes.
const files = import.meta.glob('../../assets/little/*.{png,webp,jpg,jpeg,svg}', { eager: true, import: 'default' });

const ART = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split('/').pop().replace(/\.[a-z0-9]+$/i, ''), url]),
);

export const artUrl = (name) => ART[name] || null;

// Raster rocket parts are drawn in red; other colours are hue-shifted.
const HUE_FROM_RED = { '#ef4444': 0, '#f97316': 25, '#22c55e': 125, '#3b82f6': 215, '#8b5cf6': 255 };
export const hueFilterFor = (hex) => `hue-rotate(${HUE_FROM_RED[hex] ?? 0}deg)`;
