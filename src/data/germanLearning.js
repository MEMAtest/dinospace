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
