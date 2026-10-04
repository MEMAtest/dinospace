const city = new URL('../assets/spot-difference/superhero-city.webp', import.meta.url).href;
const dinoPark = new URL('../assets/puzzle-pop/dino-park.jpg', import.meta.url).href;
const dinoRiver = new URL('../assets/puzzle-pop/dino-river-3d.webp', import.meta.url).href;
const dinoRiverB = new URL('../assets/spot-difference/river-valley-pair-b-v1.webp', import.meta.url).href;
const dinoMoon = new URL('../assets/puzzle-pop/dino-moon-3d.webp', import.meta.url).href;
const treehouse = new URL('../assets/puzzle-pop/treehouse-robots-3d.webp', import.meta.url).href;
const soundSafari = new URL('../assets/spot-difference/sound-safari-animals-3d.webp', import.meta.url).href;
const patternParade = new URL('../assets/game-scenes/pattern-parade.webp', import.meta.url).href;
const timeObservatory = new URL('../assets/game-scenes/time-observatory.webp', import.meta.url).href;
const robin = new URL('../assets/puzzle-pop/robin-tree-3d.webp', import.meta.url).href;
const geography = new URL('../assets/puzzle-pop/world-explorer-map-3d.webp', import.meta.url).href;
const history = new URL('../assets/curriculum/history-world.webp', import.meta.url).href;
const nature = new URL('../assets/puzzle-pop/nature-lab-leaves-3d.webp', import.meta.url).href;

export const SPOT_DIFFERENCE_CHAPTERS = Object.freeze([
  Object.freeze({ id: 'starter', name: 'Bright-Eyed Beginners', band: 'starter', differenceCount: 3, hintTokens: 2, skill: 'Compare the big shapes and colours in both pictures.' }),
  Object.freeze({ id: 'growing', name: 'Curious Comparers', band: 'growing', differenceCount: 5, hintTokens: 2, skill: 'Look carefully at the middle and edges of each picture.' }),
  Object.freeze({ id: 'challenge', name: 'Super Spotters', band: 'challenge', differenceCount: 7, hintTokens: 2, skill: 'Check small details across the whole scene.' }),
]);

const CHANGE_TEMPLATES = Object.freeze([
  { id: 'moon-sun', label: 'the moon became a sun', normalVisual: 'moon', visual: 'sun' },
  { id: 'star-heart', label: 'the star became a heart', normalVisual: 'star', visual: 'heart' },
  { id: 'flag', label: 'the flag changed', normalVisual: 'flag-normal', visual: 'flag' },
  { id: 'mask', label: 'the mask changed colour', normalVisual: 'mask-normal', visual: 'mask' },
  { id: 'bolt-star', label: 'the lightning bolt became a star', normalVisual: 'bolt', visual: 'star' },
  { id: 'flower', label: 'the flower became a sun', normalVisual: 'flower', visual: 'sun' },
  { id: 'cloud-moon', label: 'the cloud became a moon', normalVisual: 'cloud', visual: 'moon' },
]);

const CHANGE_POSITIONS = Object.freeze([
  { x: 17, y: 18 }, { x: 50, y: 17 }, { x: 82, y: 19 },
  { x: 22, y: 50 }, { x: 77, y: 51 }, { x: 20, y: 82 }, { x: 79, y: 81 },
]);

const CHALLENGE_DETAILS = Object.freeze({
  8: Object.freeze([
    { label: 'the sun has a different number of rays', before: 'sun:rays7', after: 'sun:rays9' },
    { label: 'the canopy leaf points in a different direction', before: 'leaf:point-left', after: 'leaf:point-right' },
    { label: 'the flower has a different number of petals', before: 'flower:petals5', after: 'flower:petals6' },
    { label: 'the small leaf has a different shape', before: 'leaf:round', after: 'leaf:pointed' },
    { label: 'the worm bends the other way', before: 'worm:curve-left', after: 'worm:curve-right' },
    { label: 'the ladybird has one more spot', before: 'ladybug:spots2', after: 'ladybug:spots3' },
    { label: 'the leaf has a different number of veins', before: 'leaf:veins3', after: 'leaf:veins5' },
  ]),
  9: Object.freeze([
    { label: 'the compass needle points in a different direction', before: 'compass:north', after: 'compass:east' },
    { label: 'the map river takes a different route', before: 'route:bend1', after: 'route:bend2' },
    { label: 'the map has one more tree symbol', before: 'trees:count2', after: 'trees:count3' },
    { label: 'the mountain range has a different number of peaks', before: 'mountains:peaks2', after: 'mountains:peaks3' },
    { label: 'the destination marker has a different shape', before: 'marker:circle', after: 'marker:flag' },
    { label: 'the binoculars point a different way', before: 'binoculars:upright', after: 'binoculars:tilted' },
    { label: 'the map has a different number of route bends', before: 'route:bend2', after: 'route:bend3' },
  ]),
  10: Object.freeze([
    { label: 'the book is open instead of closed', before: 'book:closed', after: 'book:open' },
    { label: 'the ruin has a different number of archways', before: 'arches:count2', after: 'arches:count3' },
    { label: 'the compass needle points in a different direction', before: 'compass:north', after: 'compass:west' },
    { label: 'the stone has a different shape', before: 'stone:round', after: 'stone:square' },
    { label: 'the lantern has a different number of flames', before: 'lantern:flame1', after: 'lantern:flame2' },
    { label: 'the scroll is rolled instead of open', before: 'scroll:open', after: 'scroll:rolled' },
    { label: 'the column has a different number of grooves', before: 'column:grooves2', after: 'column:grooves4' },
  ]),
  11: Object.freeze([
    { label: 'the leaf sample has a different shape', before: 'leaf:heart', after: 'leaf:oak' },
    { label: 'the leaf has a different number of veins', before: 'leaf:veins3', after: 'leaf:veins5' },
    { label: 'the seedling has a different number of leaves', before: 'sprout:leaves2', after: 'sprout:leaves3' },
    { label: 'the flower has a different number of petals', before: 'flower:petals5', after: 'flower:petals7' },
    { label: 'the watering can has a different number of drops', before: 'drops:count1', after: 'drops:count2' },
    { label: 'the potted plant has a different number of leaves', before: 'sprout:leaves2', after: 'sprout:leaves4' },
    { label: 'the leaf sample points a different way', before: 'leaf:upright', after: 'leaf:sideways' },
  ]),
});

const makeDifferences = (sceneIndex, count) => Array.from({ length: count }, (_, position) => {
  const templateIndex = (position + sceneIndex * 2) % CHANGE_TEMPLATES.length;
  const template = CHANGE_TEMPLATES[templateIndex];
  const challengeDetail = CHALLENGE_DETAILS[sceneIndex]?.[position];
  if (challengeDetail) return Object.freeze({
    id: `${sceneIndex}-${template.id}`,
    label: challengeDetail.label,
    normalVisual: `prop:${challengeDetail.before}`,
    visual: `prop:${challengeDetail.after}`,
    ...CHANGE_POSITIONS[(position + sceneIndex) % CHANGE_POSITIONS.length],
    radius: 8,
  });
  return Object.freeze({
    ...template,
    id: `${sceneIndex}-${template.id}`,
    ...CHANGE_POSITIONS[(position + sceneIndex) % CHANGE_POSITIONS.length],
    radius: 8,
  });
});

const makeScene = (chapterIndex, sceneIndex, title, image, alt, fact, pair = null) => {
  const chapter = SPOT_DIFFERENCE_CHAPTERS[chapterIndex];
  return Object.freeze({
    id: `spot-${sceneIndex + 1}`,
    chapterId: chapter.id,
    chapterIndex,
    title,
    image,
    alt,
    fact,
    ...(pair ? { ...(pair.imageB ? { imageB: pair.imageB } : {}), pairedArt: true, ...(pair.colorEdits ? { colorEdits: Object.freeze(pair.colorEdits.map((edit) => Object.freeze(edit))) } : {}), ...(pair.editRegions ? { editRegions: Object.freeze(pair.editRegions.map((region) => Object.freeze(region))) } : {}) } : {}),
    differences: Object.freeze(pair?.differences || makeDifferences(sceneIndex, chapter.differenceCount)),
  });
};

const DINO_PARK_OUTLINE = Object.freeze([
  [9.6, 24.4], [8.6, 24.7], [8.6, 26.5], [6.9, 27.6], [6.3, 29.4], [6.4, 31.4], [7.2, 32.3], [8.8, 32.6],
  [13.2, 35.1], [14.2, 44.8], [15.9, 54.3], [16, 65.8], [16, 72.6], [14.5, 78.1], [14.3, 81.4], [15.3, 82.7],
  [19.3, 82.9], [21.6, 82], [22.7, 80], [22.9, 78.7], [25.5, 77.6], [28, 77.8], [29.2, 80.5], [32.9, 81.4],
  [36.3, 81.4], [37.9, 80.3], [38.3, 77.5], [37.5, 72], [37.3, 67.2], [40, 70], [43.2, 72.7], [48.4, 73.7],
  [51.4, 72.8], [52.3, 71.4], [51.9, 71], [50.8, 71.9], [48.6, 72.1], [45.8, 70.7], [41.6, 67.9], [38.7, 63.8],
  [35.2, 60.2], [31, 56.5], [27.8, 55], [21.8, 55], [20.3, 53.3], [19.6, 46.6], [17.3, 34.7], [16.4, 31.9],
  [15.7, 28.1], [14.3, 25.1], [12.4, 24.1],
].map((point) => Object.freeze(point)));

export const SPOT_DIFFERENCE_SCENES = Object.freeze([
  makeScene(0, 0, 'Superhero City', city, 'A colourful city with friendly heroes', 'People help their community by sharing and caring for the places where they live.', {
    colorEdits: [
      { shape: 'path', d: 'M65.4 19.0 C66.5 17.8 67.3 15.5 70.3 14.5 C72.1 13.8 73.8 14.5 74.3 15.8 C72.0 16.0 71.5 17.4 71.5 19.3 C71.6 21.5 70.9 22.6 68.3 23.3 L65.3 22.2 Z', hue: 45 },
      { shape: 'path', d: 'M18.0 23.4 C18.5 20.0 20.1 18.2 22.2 18.2 C24.6 18.2 26.1 20.2 26.5 23.4 L24.0 22.8 L22.5 21.9 L20.4 22.7 Z', hue: 210 },
      { shape: 'path', d: 'M66.8 73.6 L75.3 73.6 L76.1 78.3 L66.1 78.3 L66.1 75.2 Z', hue: 125 },
    ],
    differences: [
      Object.freeze({ id: 'city-cape', label: 'the flying hero cape changed colour', normalVisual: 'scene:red-cape', visual: 'scene:gold-cape', x: 70, y: 18, radius: 8 }),
      Object.freeze({ id: 'city-dome', label: 'the tower dome changed colour', normalVisual: 'scene:red-dome', visual: 'scene:blue-dome', x: 22, y: 21, radius: 8 }),
      Object.freeze({ id: 'city-awning', label: 'the shop awning changed colour', normalVisual: 'scene:red-awning', visual: 'scene:green-awning', x: 71, y: 76, radius: 8 }),
    ],
  }),
  makeScene(0, 1, 'Dino Park', dinoPark, 'Friendly dinosaurs in a sunny park', 'Fossils are clues that help scientists learn about dinosaurs.', {
    colorEdits: [
      // Colour selection protects the pale underside, eyes and neighbouring plants.
      { shape: 'path', d: `M${DINO_PARK_OUTLINE.map((point) => point.join(' ')).join(' L')} Z`, hue: 70, alphaMatrix: '0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 -2 -3 5 0 -0.4' },
      { shape: 'ellipse', cx: 86.5, cy: 14.4, rx: 4.2, ry: 5.7, hue: -30 },
      { shape: 'rect', x: 12.2, y: 87.5, width: 8.8, height: 10.5, hue: 150, alphaMatrix: '0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 4 -8 4 0 -0.8' },
    ],
    differences: [
      Object.freeze({ id: 'park-dinosaur', label: 'the long-neck dinosaur changed colour', normalVisual: 'scene:blue-dinosaur', visual: 'scene:purple-dinosaur', x: 28, y: 65, radius: 8, hitPolygon: DINO_PARK_OUTLINE }),
      Object.freeze({ id: 'park-sun', label: 'the sun changed colour', normalVisual: 'scene:yellow-sun', visual: 'scene:orange-sun', x: 86, y: 14, radius: 8 }),
      Object.freeze({ id: 'park-flower', label: 'the flower petals changed colour', normalVisual: 'scene:pink-flower', visual: 'scene:blue-flower', x: 16, y: 86, radius: 8 }),
    ],
  }),
  makeScene(0, 2, 'River Valley', dinoRiver, 'A dinosaur beside a sparkling river', 'A clean river gives plants and animals a place to find fresh water.', {
    imageB: dinoRiverB,
    // Render only these authored edits over the unchanged original scene.
    // Generated full-image redraws must never move unrelated background objects.
    editRegions: [
      { x: 75, y: 0, width: 25, height: 28, feather: 2 },
      { x: 4, y: 80, width: 17, height: 18, feather: 1 },
      { x: 39, y: 44, width: 5, height: 9, feather: 0.3 },
    ],
    differences: [
      Object.freeze({ id: 'river-sky', label: 'the sun became a crescent moon', normalVisual: 'scene:sun', visual: 'scene:crescent', x: 87, y: 14, radius: 8 }),
      Object.freeze({ id: 'river-flower', label: 'the flower petals changed from pink to yellow', normalVisual: 'scene:pink-flower', visual: 'scene:yellow-flower', x: 13, y: 86, radius: 8 }),
      Object.freeze({ id: 'river-bridge', label: 'one upright bridge railing post is missing', normalVisual: 'scene:bridge-post', visual: 'scene:no-post', x: 41, y: 49, radius: 8 }),
    ],
  }),
  makeScene(0, 3, 'Moon Camp', dinoMoon, 'A dinosaur exploring a moon camp', 'The Moon is a rocky world that travels around Earth.', {
    // Change only original object surfaces. Preserve silhouettes, highlights and surroundings.
    colorEdits: [
      { shape: 'ellipse', cx: 15.8, cy: 20.8, rx: 3.6, ry: 5.0, hue: 220 },
      { shape: 'path', d: 'M54.4 63.5 L60.8 63.3 L62.1 67.1 L55.8 67.4 Z', hue: 150 },
      { shape: 'rect', x: 85.6, y: 53.7, width: 2.7, height: 4.3, rx: 0.4, hue: 60 },
    ],
    differences: [
      Object.freeze({ id: 'moon-porthole', label: 'the rocket window glass changed colour', normalVisual: 'scene:blue-glass', visual: 'scene:green-glass', x: 16, y: 21, radius: 8 }),
      Object.freeze({ id: 'moon-panel', label: 'the rover solar panel changed colour', normalVisual: 'scene:blue-panel', visual: 'scene:orange-panel', x: 58, y: 65, radius: 8 }),
      Object.freeze({ id: 'moon-window', label: 'the habitat window changed colour', normalVisual: 'scene:yellow-window', visual: 'scene:green-window', x: 87, y: 56, radius: 8 }),
    ],
  }),
  makeScene(1, 4, 'Treehouse Team', treehouse, 'A young astronaut and robot sharing arrow blocks in a treehouse workshop', 'Taking turns helps everyone share a game or a job.'),
  makeScene(1, 5, 'Sound Safari', soundSafari, 'An elephant, monkey, bird and frog making sounds beside a waterfall', 'Animals use different sounds to communicate with one another.'),
  makeScene(1, 6, 'Pattern Parade', patternParade, 'A colourful parade with repeating shapes', 'Repeating patterns follow a rule that we can describe.'),
  makeScene(1, 7, 'Time Observatory', timeObservatory, 'An observatory with a telescope, Earth globe, stars and sunset', 'Earth turns once each day, bringing daylight and darkness.'),
  makeScene(2, 8, 'Robin’s Woodland', robin, 'A robin pecking at soil beneath a tree among flowers and woodland plants', 'Robins use their beaks to find food and build safe nests.'),
  makeScene(2, 9, 'World Explorer', geography, 'An explorer workbench with a picture-symbol map and an Earth globe', 'Maps use symbols and labels to show useful information about places.'),
  makeScene(2, 10, 'History Hall', history, 'Ancient ruins with books, maps and a compass', 'Old objects can be clues about how people lived long ago.'),
  makeScene(2, 11, 'Nature Lab', nature, 'A sunny plant workbench with differently shaped leaves, seedlings and roots', 'Plants need light and water to grow.'),
]);

export const resolveSpotDifferenceTap = (differences, foundIds, x, y) => {
  const found = new Set(foundIds);
  const withinTolerance = (entry) => {
    if (Math.hypot(x - entry.x, y - entry.y) <= entry.radius) return true;
    if (!entry.hitPolygon) return false;
    let inside = false;
    for (let index = 0, previous = entry.hitPolygon.length - 1; index < entry.hitPolygon.length; previous = index++) {
      const [ax, ay] = entry.hitPolygon[index];
      const [bx, by] = entry.hitPolygon[previous];
      if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside;
    }
    return inside;
  };
  const alreadyFound = differences.find((entry) => found.has(entry.id) && withinTolerance(entry));
  if (alreadyFound) return { kind: 'already-found', difference: alreadyFound };
  const difference = differences.find((entry) => !found.has(entry.id) && withinTolerance(entry));
  return difference ? { kind: 'new', difference } : { kind: 'miss', difference: null };
};

export const SPOT_DIFFERENCE_PROGRESS_KEY = 'amari_spot_difference_batch2_v1';

export const spotAnswerAttemptDetail = ({ level, round, seed, correct, hadMistake }) => ({
  level,
  round,
  seed,
  correct,
  firstAttempt: !hadMistake,
});

export const spotDifferenceCompletionMessage = ({ chapterComplete = false, chapterName, praise } = {}) => (
  chapterComplete
    ? `${praise} ${chapterName} complete! Your picture fact is below.`
    : 'Picture pair complete! Your fact is below. Choose Next picture when you are ready.'
);

export const getNextSpotDifferenceHint = (differences, foundIds = [], hintedIds = []) => {
  const unavailable = new Set([...foundIds, ...hintedIds]);
  return differences.find(({ id }) => !unavailable.has(id)) || null;
};

export const spotDifferenceRandomFor = (seed) => {
  let state = (Number(seed) >>> 0) || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

export const shuffleSpotDifference = (items, seed) => {
  const random = spotDifferenceRandomFor(seed);
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
};

const readState = (storage) => {
  try {
    const value = JSON.parse(storage?.getItem(SPOT_DIFFERENCE_PROGRESS_KEY) || '{}');
    return value?.version === 1 && value.children && typeof value.children === 'object' ? value : { version: 1, children: {} };
  } catch {
    return { version: 1, children: {} };
  }
};

export const getSpotDifferenceLastQueue = (playerId, storage = globalThis.localStorage) => {
  const state = readState(storage);
  const queue = state.children[playerId || 'amari']?.lastQueue;
  return Array.isArray(queue) ? queue.filter((id) => typeof id === 'string') : [];
};

export const getSpotDifferenceProgress = (playerId, storage = globalThis.localStorage) => {
  const state = readState(storage);
  const child = state.children[playerId || 'amari'] || {};
  return {
    unlockedChapter: Number.isInteger(child.unlockedChapter) ? Math.min(2, Math.max(0, child.unlockedChapter)) : 0,
    completedSceneIds: Array.isArray(child.completedSceneIds) ? [...new Set(child.completedSceneIds.filter((id) => typeof id === 'string'))] : [],
    lastCompletedSceneId: typeof child.lastCompletedSceneId === 'string' ? child.lastCompletedSceneId : undefined,
    lastQueue: Array.isArray(child.lastQueue) ? child.lastQueue.filter((id) => typeof id === 'string') : [],
  };
};

export const saveSpotDifferenceQueue = (playerId, queue, storage = globalThis.localStorage) => {
  const state = readState(storage);
  const key = playerId || 'amari';
  const existing = state.children[key] && typeof state.children[key] === 'object' ? state.children[key] : {};
  state.children[key] = { ...existing, lastQueue: queue.map(({ id }) => id) };
  try { storage?.setItem(SPOT_DIFFERENCE_PROGRESS_KEY, JSON.stringify(state)); } catch { /* The scene queue still works without storage. */ }
};

export const completeSpotDifferenceChapter = (playerId, chapterIndex, completedSceneIds, storage = globalThis.localStorage) => {
  const state = readState(storage);
  const key = playerId || 'amari';
  const child = state.children[key] && typeof state.children[key] === 'object' ? state.children[key] : {};
  const before = Number.isInteger(child.unlockedChapter) ? Math.min(2, Math.max(0, child.unlockedChapter)) : 0;
  const sceneIds = SPOT_DIFFERENCE_SCENES.filter((scene) => scene.chapterIndex === chapterIndex).map(({ id }) => id);
  const newlyCompleted = [...new Set([...(Array.isArray(child.completedSceneIds) ? child.completedSceneIds : []), ...completedSceneIds])];
  const chapterComplete = sceneIds.length > 0 && sceneIds.every((id) => newlyCompleted.includes(id));
  const unlockedChapter = chapterComplete ? Math.min(2, Math.max(before, chapterIndex + 1)) : before;
  state.children[key] = { ...child, unlockedChapter, completedSceneIds: newlyCompleted, lastCompletedSceneId: completedSceneIds.at(-1) || child.lastCompletedSceneId };
  try { storage?.setItem(SPOT_DIFFERENCE_PROGRESS_KEY, JSON.stringify(state)); } catch { /* Keep the current run playable if storage is full. */ }
  return { ...getSpotDifferenceProgress(playerId, storage), chapterComplete, newlyUnlocked: unlockedChapter > before };
};

export const createSpotDifferenceRun = (chapterIndex, seed, previousQueue = [], lastCompletedSceneId = previousQueue.at(-1)) => {
  const chapter = SPOT_DIFFERENCE_CHAPTERS[chapterIndex] || SPOT_DIFFERENCE_CHAPTERS[0];
  const scenes = SPOT_DIFFERENCE_SCENES.filter((scene) => scene.chapterIndex === chapterIndex);
  let ordered = shuffleSpotDifference(scenes, seed);
  // Fix the new run at Start; never reorder the active scene or its targets.
  for (let attempt = 0; attempt < ordered.length && ordered.length > 1; attempt += 1) {
    const repeatedOrder = ordered.map(({ id }) => id).join('|') === previousQueue.join('|');
    if (ordered[0].id !== lastCompletedSceneId && !repeatedOrder) break;
    ordered = [...ordered.slice(1), ordered[0]];
  }
  return ordered.map((scene, index) => ({
    ...scene,
    differences: shuffleSpotDifference(scene.differences, (seed + (index + 1) * 997) >>> 0),
    chapter,
  }));
};
