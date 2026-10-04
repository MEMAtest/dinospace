const freeze = (value) => Object.freeze(value);
const pluralOf = (noun) => noun.endsWith('y') ? `${noun.slice(0, -1)}ies` : `${noun}s`;

export const COUNT_THE_STARS_EPISODES = freeze([
  freeze({
    id: 'star-garden', name: 'Star Garden', band: 'starter', min: 1, max: 5, skill: 'Touch each object once, then choose how many you counted.',
    strategy: 'Count each glowing object once. A number badge keeps your place.', pageId: 'constellation-star-garden', pageMark: '✨',
    scenes: freeze([
      freeze({ id: 'fireflies', motif: 'firefly', title: 'Firefly Meadow', noun: 'firefly', emoji: '✨', accent: '#fbbf24', backdrop: 'from-emerald-950 via-green-900 to-indigo-950', decoration: '🌿' }),
      freeze({ id: 'moon-berries', motif: 'berry', title: 'Moon Berries', noun: 'moon berry', emoji: '🫐', accent: '#c4b5fd', backdrop: 'from-indigo-950 via-violet-900 to-slate-950', decoration: '🌙' }),
      freeze({ id: 'comet-seeds', motif: 'comet-seed', title: 'Comet Seeds', noun: 'comet seed', emoji: '☄️', accent: '#fb923c', backdrop: 'from-slate-950 via-orange-950 to-indigo-950', decoration: '🌠' }),
      freeze({ id: 'tiny-planets', motif: 'planet', title: 'Tiny Planets', noun: 'planet', emoji: '🪐', accent: '#7dd3fc', backdrop: 'from-sky-950 via-blue-900 to-slate-950', decoration: '🌌' }),
      freeze({ id: 'rocket-lights', motif: 'rocket-light', title: 'Rocket Lights', noun: 'rocket light', emoji: '🚀', accent: '#fda4af', backdrop: 'from-rose-950 via-purple-950 to-slate-950', decoration: '⭐' }),
    ]),
  }),
  freeze({
    id: 'constellation-workshop', name: 'Constellation Workshop', band: 'growing', min: 1, max: 10, skill: 'Count an organised group, then check each marked object once.',
    strategy: 'Use the rows or visible groups to keep track. Count each object once.', pageId: 'constellation-workshop', pageMark: '🌟',
    scenes: freeze([
      freeze({ id: 'star-clusters', motif: 'star-cluster', title: 'Star Clusters', noun: 'star', emoji: '⭐', accent: '#fde68a', backdrop: 'from-indigo-950 via-blue-950 to-violet-950', decoration: '🔭' }),
      freeze({ id: 'satellite-bolts', motif: 'satellite-bolt', title: 'Satellite Bolts', noun: 'satellite bolt', emoji: '🔩', accent: '#93c5fd', backdrop: 'from-slate-950 via-sky-950 to-indigo-950', decoration: '🛰️' }),
      freeze({ id: 'moon-rocks', motif: 'moon-rock', title: 'Moon Rocks', noun: 'moon rock', emoji: '🪨', accent: '#cbd5e1', backdrop: 'from-slate-900 via-slate-800 to-indigo-950', decoration: '🌙' }),
      freeze({ id: 'observatory-windows', motif: 'observatory-window', title: 'Observatory Windows', noun: 'lit window', emoji: '🟨', accent: '#facc15', backdrop: 'from-blue-950 via-indigo-900 to-slate-950', decoration: '🔭' }),
      freeze({ id: 'meteor-trails', motif: 'meteor', title: 'Meteor Trails', noun: 'meteor', emoji: '☄️', accent: '#fca5a5', backdrop: 'from-fuchsia-950 via-slate-950 to-orange-950', decoration: '🌠' }),
    ]),
  }),
  freeze({
    id: 'galaxy-survey', name: 'Galaxy Survey', band: 'challenge', min: 1, max: 20, skill: 'Count a full array or combine two visible groups.',
    strategy: 'Count along a row, or count each group and put the totals together.', pageId: 'galaxy-survey', pageMark: '🌌',
    scenes: freeze([
      freeze({ id: 'planet-rings', motif: 'ring-stone', title: 'Planet Rings', noun: 'ring stone', emoji: '💍', accent: '#f0abfc', backdrop: 'from-violet-950 via-fuchsia-950 to-slate-950', decoration: '🪐' }),
      freeze({ id: 'satellite-panels', motif: 'solar-panel', title: 'Satellite Panels', noun: 'solar panel', emoji: '🔷', accent: '#7dd3fc', backdrop: 'from-sky-950 via-blue-950 to-slate-950', decoration: '🛰️' }),
      freeze({ id: 'nebula-dots', motif: 'nebula', title: 'Nebula Dots', noun: 'nebula light', emoji: '🟣', accent: '#e879f9', backdrop: 'from-fuchsia-950 via-purple-950 to-indigo-950', decoration: '✨' }),
      freeze({ id: 'crater-gems', motif: 'crater-gem', title: 'Crater Gems', noun: 'crater gem', emoji: '💎', accent: '#67e8f9', backdrop: 'from-cyan-950 via-slate-900 to-indigo-950', decoration: '🌑' }),
      freeze({ id: 'constellation-maps', motif: 'map-star', title: 'Constellation Maps', noun: 'map star', emoji: '🌟', accent: '#fde68a', backdrop: 'from-slate-950 via-indigo-950 to-blue-950', decoration: '🗺️' }),
    ]),
  }),
]);

export const COUNT_CONSTELLATION_PAGES = freeze(COUNT_THE_STARS_EPISODES.map((episode) => freeze({
  id: episode.pageId, episodeId: episode.id, name: `${episode.name} Constellation`, mark: episode.pageMark,
})));

export const COUNT_THE_STARS_NARRATION = freeze({
  instruction: 'Tap each object once to count it.',
  countQuestion: 'How many did you count?',
  recountClue: 'Check your count badges once more.',
  correct: 'That is the right total. Each object was counted once.',
  next: 'Choose Next when you are ready.',
  episodeComplete: 'You finished this star survey and earned its constellation page.',
  hints: freeze([
    'Count one visible group, then the other group. Add the two totals.',
    'Point to each shape once. The numbered badges keep your place.',
    'Read one row at a time, and use each badge to keep your place.',
  ]),
  counts: freeze(Array.from({ length: 20 }, (_, index) => String(index + 1))),
  praises: freeze(['Brilliant counting!', 'Great counting!']),
  answerNounSegment: 'objects',
  explanations: freeze(COUNT_THE_STARS_EPISODES.flatMap((episode) => episode.scenes.flatMap((scene) => Array.from({ length: episode.max - episode.min + 1 }, (_, index) => {
    const count = episode.min + index;
    return `There ${count === 1 ? 'is' : 'are'} ${count} ${count === 1 ? scene.noun : pluralOf(scene.noun)}. You counted each one once.`;
  })))),
});

export const createCountRunSeed = () => {
  if (globalThis.crypto?.getRandomValues) {
    const words = new Uint32Array(1);
    globalThis.crypto.getRandomValues(words);
    return words[0] || 1;
  }
  return (Math.floor(Math.random() * 0xffffffff) >>> 0) || 1;
};

const makeRandom = (seed) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffleWith = (input, random) => {
  const list = [...input];
  for (let index = list.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [list[index], list[other]] = [list[other], list[index]];
  }
  return list;
};

const seedForQuestion = (seed, id) => {
  let hash = seed >>> 0;
  for (const character of id) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
  return hash || 1;
};

const regularArrayCenters = (count) => {
  const columns = Math.min(5, count);
  const rows = Math.ceil(count / columns);
  const centers = [];
  for (let row = 0; row < rows; row += 1) {
    const onRow = Math.min(columns, count - (row * columns));
    for (let column = 0; column < onRow; column += 1) {
      centers.push({
        x: onRow === 1 ? 50 : 12 + ((column * 76) / (onRow - 1)),
        y: rows === 1 ? 50 : 14 + ((row * 72) / (rows - 1)),
      });
    }
  }
  return centers;
};

const groupedCenters = (count) => {
  if (count <= 10) {
    if (count === 1) return [{ x: 50, y: 50 }];
    const rows = Math.ceil(count / 2);
    return Array.from({ length: count }, (_, index) => ({
      x: index % 2 === 0 ? 30 : 70,
      y: rows === 1 ? 50 : 15 + ((Math.floor(index / 2) * 70) / (rows - 1)),
    }));
  }
  const leftCount = Math.ceil(count / 2);
  const rightCount = count - leftCount;
  return [
    ...Array.from({ length: leftCount }, (_, index) => ({ x: index % 2 === 0 ? 10 : 30, y: 11 + ((Math.floor(index / 2) * 78) / 4) })),
    ...Array.from({ length: rightCount }, (_, index) => ({ x: index % 2 === 0 ? 70 : 90, y: 11 + ((Math.floor(index / 2) * 78) / 4) })),
  ];
};

const scatteredCenters = (count) => {
  if (count === 1) return [{ x: 50, y: 50 }];
  if (count <= 5) return Array.from({ length: count }, (_, index) => {
    const angle = (-Math.PI / 2) + ((index * 2 * Math.PI) / count);
    return { x: 50 + (29 * Math.cos(angle)), y: 50 + (28 * Math.sin(angle)) };
  });
  return regularArrayCenters(count);
};

export const buildCountObjects = (count, seed, id, layoutVariant = 'grouped') => {
  if (!Number.isInteger(count) || count < 1 || count > 20 || !Number.isSafeInteger(seed)) return [];
  const centers = layoutVariant === 'orbit' ? scatteredCenters(count) : groupedCenters(count);
  return shuffleWith(centers, makeRandom(seedForQuestion(seed, id)))
    .map(({ x, y }, index) => freeze({ id: `${id}:object-${index + 1}`, x, y }));
};

export const makeCountAnswerOptions = (target, min, max, seed) => {
  if (![target, min, max, seed].every(Number.isSafeInteger) || target < min || target > max || max - min < 3) return [];
  const nearest = [];
  for (let distance = 1; nearest.length < 3; distance += 1) {
    if (target - distance >= min) nearest.push(target - distance);
    if (target + distance <= max && nearest.length < 3) nearest.push(target + distance);
  }
  return shuffleWith([target, ...nearest], makeRandom(seed ^ (target * 0x9e3779b1)));
};

const questionPool = (episode) => episode.scenes.flatMap((scene) => Array.from({ length: episode.max - episode.min + 1 }, (_, offset) => {
  const count = episode.min + offset;
  return ['orbit', 'grouped'].map((layoutVariant) => freeze({ id: `${scene.id}:${count}:${layoutVariant}`, scene, count, layoutVariant }));
}).flat());

export const countQuestionPool = (episodeIndex) => questionPool(COUNT_THE_STARS_EPISODES[episodeIndex] || COUNT_THE_STARS_EPISODES[0]);

export const createCountTheStarsRun = (episodeIndex, seed, recentQuestionIds = []) => {
  const episode = COUNT_THE_STARS_EPISODES[episodeIndex];
  if (!episode || !Number.isSafeInteger(seed) || seed < 0) return null;
  const random = makeRandom(seed);
  const pool = questionPool(episode);
  const recent = new Set(recentQuestionIds);
  let eligible = pool.filter(({ id }) => !recent.has(id));
  if (eligible.length < 6) eligible = pool;
  const shuffled = shuffleWith(eligible, random);
  const chosen = [];
  const choose = (predicate) => {
    const available = shuffled.filter((entry) => predicate(entry) && !chosen.some(({ id }) => id === entry.id));
    if (!available.length) return false;
    const usedScenes = new Set(chosen.map(({ scene }) => scene.id));
    const usedCounts = new Set(chosen.map(({ count }) => count));
    const freshSceneAndCount = available.find(({ scene, count }) => !usedScenes.has(scene.id) && !usedCounts.has(count));
    const freshScene = available.find(({ scene }) => !usedScenes.has(scene.id));
    const freshCount = available.find(({ count }) => !usedCounts.has(count));
    chosen.push(freshSceneAndCount || freshScene || freshCount || available[0]);
    return true;
  };
  if (episodeIndex > 0) {
    const threshold = episodeIndex === 1 ? 5 : 10;
    // A harder chapter must practise its new range every run, even when
    // random selection would otherwise draw only Starter-sized quantities.
    choose(({ count, layoutVariant }) => count > threshold && layoutVariant === 'grouped');
    choose(({ count, layoutVariant }) => count > threshold && layoutVariant === 'grouped');
    choose(({ count }) => count > threshold);
    choose(({ count }) => count <= threshold);
  }
  while (chosen.length < 6) choose(() => true);
  const selected = shuffleWith(chosen, random);
  const queue = selected.map((entry) => {
    const objects = buildCountObjects(entry.count, seed, entry.id, entry.layoutVariant);
    return freeze({
      ...entry,
      objects,
      options: freeze(makeCountAnswerOptions(entry.count, episode.min, episode.max, seedForQuestion(seed, entry.id))),
      explanation: `There ${entry.count === 1 ? 'is' : 'are'} ${entry.count} ${entry.count === 1 ? entry.scene.noun : pluralOf(entry.scene.noun)}. You counted each one once.`,
    });
  });
  return freeze({ episodeId: episode.id, episodeIndex, seed, rounds: freeze(queue) });
};

export const countCentersAreSafe = (objects, width = 330, height = 340, targetSize = 56) => {
  if (!Array.isArray(objects) || objects.length === 0) return false;
  const centers = objects.map(({ x, y }) => ({ x: (x / 100) * width, y: (y / 100) * height }));
  const half = targetSize / 2;
  return centers.every(({ x, y }) => x >= half && x <= width - half && y >= half && y <= height - half)
    && centers.every((center, index) => centers.slice(index + 1).every((other) => (
      Math.abs(center.x - other.x) >= targetSize || Math.abs(center.y - other.y) >= targetSize
    )));
};
