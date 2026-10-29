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
const safeDefaultStorage = () => { try { return globalThis.localStorage || null; } catch { return null; } };
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const blankHistory = () => ({ ...Object.fromEntries(Object.keys(GERMAN_MODE_ITEMS).filter((mode) => !['paint', 'park'].includes(mode)).map((mode) => [mode, []])), colours: [] });

function validateHistory(value) {
  if (!isRecord(value)) return null;
  const knownModes = [...Object.keys(GERMAN_MODE_ITEMS), 'colours'];
  for (const mode of knownModes) {
    if (value[mode] !== undefined && (!Array.isArray(value[mode]) || value[mode].some((word) => typeof word !== 'string'))) return null;
  }
  const result = { ...value };
  for (const [mode, items] of Object.entries(GERMAN_MODE_ITEMS)) {
    if (['paint', 'park'].includes(mode) && value[mode] === undefined) continue;
    result[mode] = Array.isArray(value[mode])
      ? [...new Set(value[mode].filter((word) => items.some((item) => item.name === word)))].slice(-(items.length - 1))
      : [];
  }
  const legacyColours = [...(result.paint || []), ...(result.park || [])];
  const savedColours = Array.isArray(value.colours) && value.colours.length ? value.colours : legacyColours;
  result.colours = [...new Set(savedColours.filter((word) => GERMAN_MODE_ITEMS.paint.some((item) => item.name === word)))].slice(-(GERMAN_MODE_ITEMS.paint.length - 1));
  return result;
}

export function readGermanTargetHistory(playerId, storage = safeDefaultStorage()) {
  if (!storage || typeof storage.getItem !== 'function') return { ok: false, status: 'unavailable', history: blankHistory(), error: 'German word rotation could not be read.' };
  let raw;
  try { raw = storage.getItem(historyKey(playerId)); }
  catch { return { ok: false, status: 'unavailable', history: blankHistory(), error: 'German word rotation could not be read.' }; }
  if (raw === null) return { ok: true, status: 'fresh', history: blankHistory(), error: null };
  if (typeof raw !== 'string' || !raw.length) return { ok: false, status: 'invalid', history: blankHistory(), error: 'German word rotation is invalid; this session can continue without saving rotation.' };
  let parsed;
  try { parsed = JSON.parse(raw); } catch { return { ok: false, status: 'invalid', history: blankHistory(), error: 'German word rotation is invalid; this session can continue without saving rotation.' }; }
  const history = validateHistory(parsed);
  return history
    ? { ok: true, status: 'ready', history, error: null }
    : { ok: false, status: 'invalid', history: blankHistory(), error: 'German word rotation is invalid; this session can continue without saving rotation.' };
}

export const loadGermanTargetHistory = (playerId, storage = safeDefaultStorage()) => {
  const read = readGermanTargetHistory(playerId, storage);
  return read.ok ? read.history : {};
};

export const saveGermanTargetHistory = (playerId, history, storage = safeDefaultStorage()) => {
  if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') return false;
  const current = readGermanTargetHistory(playerId, storage);
  if (!current.ok || !isRecord(history)) return false;
  const merged = validateHistory({ ...current.history, ...history });
  if (!merged) return false;
  try {
    const encoded = JSON.stringify(merged);
    storage.setItem(historyKey(playerId), encoded);
    if (storage.getItem(historyKey(playerId)) !== encoded) return false;
    return Boolean(validateHistory(JSON.parse(encoded)));
  } catch { return false; }
};
