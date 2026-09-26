// Small helpers shared by the little-explorer games.

export const pointInRect = (point, rect, pad = 0) => Boolean(rect)
  && point.x >= rect.left - pad
  && point.x <= rect.right + pad
  && point.y >= rect.top - pad
  && point.y <= rect.bottom + pad;

export const rectCentre = (rect) => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });

export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export const shuffled = (list) => {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Shuffle, but never leave every item in its starting position — a puzzle
// tray that is already in order is no puzzle at all.
export const shuffledOutOfOrder = (list) => {
  if (list.length < 2) return list.slice();
  let copy = shuffled(list);
  for (let tries = 0; tries < 8 && copy.every((item, index) => item === list[index]); tries += 1) copy = shuffled(list);
  return copy;
};

export const NUMBER_WORDS = Object.freeze(['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']);

// Deterministic shuffle: the same seed always gives the same order, so a
// round's content can be derived during render without changing mid-round.
export const seededShuffle = (list, seed) => {
  const copy = list.slice();
  let state = (Math.abs(Math.floor(seed)) * 2654435761 + 1013904223) >>> 0;
  const next = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
