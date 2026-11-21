import { COLOUR_PAINTS } from './colourLabAdventure.js';

const rgb = (hex) => hex.match(/[a-f\d]{2}/gi).map((channel) => Number.parseInt(channel, 16));
const blend = (a, b, fraction) => a.map((channel, index) => channel * (1 - fraction) + b[index] * fraction);
const paints = Object.fromEntries(Object.entries(COLOUR_PAINTS).map(([name, hex]) => [name, rgb(hex)]));
const brown = rgb('#89603e');
const pairs = [
  ['Red', 'Yellow', '#f28b35'],
  ['Yellow', 'Blue', '#55a762'],
  ['Red', 'Blue', '#8c58b6'],
];

// A scoop-weighted classroom model based on red, yellow and blue paint.
// Pair midpoints reflect familiar paint recipes instead of screen-light mixing.
export const mixPaintScoops = (scoops) => {
  const count = (name) => Math.max(0, Number(scoops[name]) || 0);
  const common = Math.min(count('Red'), count('Yellow'), count('Blue'));
  const primary = count('Red') + count('Yellow') + count('Blue');
  const remaining = primary - 3 * common;
  let mixed = brown;
  if (remaining > 0) {
    const [a, b, midpoint] = pairs.find(([first, second]) => (
      count(first) + count(second) - 2 * common === remaining
    ));
    const fraction = (count(b) - common) / remaining;
    const middle = rgb(midpoint);
    const duo = fraction <= 0.5 ? blend(paints[a], middle, fraction * 2) : blend(middle, paints[b], fraction * 2 - 1);
    mixed = blend(brown, duo, remaining / primary);
  }

  const white = count('White');
  const black = count('Black');
  const total = primary + white + black;
  if (!total) return null;
  const channels = mixed.map((channel, index) => Math.round((channel * primary + paints.White[index] * white + paints.Black[index] * black) / total));
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
};
