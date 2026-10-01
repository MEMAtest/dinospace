import { GERMAN_COLORS, GERMAN_MATCH_MODES } from './index.js';

export const GERMAN_MODE_ITEMS = Object.freeze({
  paint: GERMAN_COLORS,
  park: GERMAN_COLORS,
  ...Object.fromEntries(GERMAN_MATCH_MODES.map(({ id, items }) => [id, items])),
  parts: [
    { name: 'Rad', emoji: '🛞' }, { name: 'Tür', emoji: '🚪' }, { name: 'Lenkrad', emoji: '🛞' },
    { name: 'Licht', emoji: '💡' }, { name: 'Sitz', emoji: '💺' }, { name: 'Reifen', emoji: '🚗' },
  ],
  directions: [
    { name: 'Links', emoji: '⬅️' }, { name: 'Rechts', emoji: '➡️' }, { name: 'Geradeaus', emoji: '⬆️' },
    { name: 'Halt', emoji: '🛑' }, { name: 'Langsam', emoji: '🐢' }, { name: 'Zurück', emoji: '⬇️' },
  ],
});

const TRANSLATIONS = Object.freeze({
  paint: { Rot: 'red', Blau: 'blue', Grün: 'green', Gelb: 'yellow', Orange: 'orange', Lila: 'purple', Rosa: 'pink', Braun: 'brown', Schwarz: 'black', 'Weiß': 'white' },
  park: { Rot: 'red', Blau: 'blue', Grün: 'green', Gelb: 'yellow', Orange: 'orange', Lila: 'purple', Rosa: 'pink', Braun: 'brown', Schwarz: 'black', 'Weiß': 'white' },
  numbers: { Eins: 'one', Zwei: 'two', Drei: 'three', Vier: 'four', Fünf: 'five', Sechs: 'six', Sieben: 'seven', Acht: 'eight', Neun: 'nine', Zehn: 'ten' },
  animals: { Hund: 'dog', Katze: 'cat', Vogel: 'bird', Fisch: 'fish', Löwe: 'lion', Pferd: 'horse', Kuh: 'cow', Hase: 'rabbit' },
  shapes: { Kreis: 'circle', Quadrat: 'square', Dreieck: 'triangle', Stern: 'star', Herz: 'heart', Diamant: 'diamond' },
  foods: { Apfel: 'apple', Banane: 'banana', Brot: 'bread', Käse: 'cheese', Pizza: 'pizza', Eis: 'ice cream' },
  vehicles: { Auto: 'car', Bus: 'bus', Zug: 'train', Flugzeug: 'aeroplane', Fahrrad: 'bicycle', Rakete: 'rocket' },
  body: { Kopf: 'head', Hand: 'hand', Fuß: 'foot', Auge: 'eye', Nase: 'nose', Ohr: 'ear', Mund: 'mouth', Arm: 'arm' },
  greetings: { Hallo: 'hello', 'Tschüss': 'goodbye', Danke: 'thank you', Bitte: 'please / you are welcome', Ja: 'yes', Nein: 'no' },
  parts: { Rad: 'wheel', Tür: 'door', Lenkrad: 'steering wheel', Licht: 'light', Sitz: 'seat', Reifen: 'tyre' },
  directions: { Links: 'left', Rechts: 'right', Geradeaus: 'straight ahead', Halt: 'stop', Langsam: 'slowly', Zurück: 'back' },
});

export const germanTranslation = (mode, name) => TRANSLATIONS[mode]?.[name] || '';

const shuffleWith = (items, random) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
};

export const buildGermanModeRound = (mode, recentTargets = [], optionCount = 4, random = Math.random) => {
  const items = GERMAN_MODE_ITEMS[mode] || GERMAN_COLORS;
  const recent = new Set(recentTargets.filter((name) => items.some((item) => item.name === name)));
  const fresh = items.filter((item) => !recent.has(item.name));
  const targetPool = fresh.length ? fresh : items;
  const target = targetPool[Math.floor(random() * targetPool.length)];
  const distractors = shuffleWith(items.filter((item) => item.name !== target.name), random)
    .slice(0, Math.max(0, Math.min(items.length - 1, optionCount - 1)));
  return {
    target,
    options: shuffleWith([target, ...distractors], random),
    translation: germanTranslation(mode, target.name),
  };
};

// Each question has its own seed so retries and React renders cannot change it.
export const germanRandomFor = (seed) => {
  let state = Number(seed) >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

export const buildSeededGermanRound = (mode, recent, count, runSeed, cursor) => {
  const modeHash = [...mode].reduce((hash, letter) => Math.imul(hash, 31) + letter.charCodeAt(0), 0);
  const seed = (Number(runSeed) + modeHash + Math.imul(cursor + 1, 0x9e3779b9)) >>> 0;
  return { ...buildGermanModeRound(mode, recent, count, germanRandomFor(seed)), seed };
};

// Paint and parking practise the same colour vocabulary, so they share a rotation.
export const germanHistoryMode = (mode) => ['paint', 'park'].includes(mode) ? 'colours' : mode;
export const rememberGermanTarget = (history, mode, name) => {
  const key = germanHistoryMode(mode);
  const limit = (GERMAN_MODE_ITEMS[mode]?.length || 1) - 1;
  return { ...history, [key]: [...(history[key] || []).filter((word) => word !== name), name].slice(-limit) };
};

const historyKey = (playerId) => `${playerId || 'amari'}_german_recent_targets_v1`;
export const loadGermanTargetHistory = (playerId, storage = globalThis.localStorage) => {
  try {
    const saved = JSON.parse(storage?.getItem(historyKey(playerId)) || '{}');
    const result = Object.fromEntries(Object.entries(GERMAN_MODE_ITEMS).map(([mode, items]) => [
      mode, Array.isArray(saved?.[mode])
        ? saved[mode].filter((name) => items.some((item) => item.name === name)).slice(-(items.length - 1))
        : [],
    ]));
    const colours = Array.isArray(saved?.colours) ? saved.colours : [...(result.paint || []), ...(result.park || [])];
    result.colours = [...new Set(colours.filter((name) => GERMAN_MODE_ITEMS.paint.some((item) => item.name === name)))].slice(-(GERMAN_MODE_ITEMS.paint.length - 1));
    delete result.paint;
    delete result.park;
    return result;
  } catch { return {}; }
};
export const saveGermanTargetHistory = (playerId, history, storage = globalThis.localStorage) => {
  try { storage?.setItem(historyKey(playerId), JSON.stringify(history)); } catch { /* Storage is optional. */ }
};
