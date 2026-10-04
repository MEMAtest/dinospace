const city = new URL('../assets/spot-difference/superhero-city.webp', import.meta.url).href;
const dinoPark = new URL('../assets/puzzle-pop/dino-park.jpg', import.meta.url).href;
const dinoRiver = new URL('../assets/puzzle-pop/dino-river-3d.webp', import.meta.url).href;
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

const makeScene = (chapterIndex, sceneIndex, title, image, alt, fact) => {
  const chapter = SPOT_DIFFERENCE_CHAPTERS[chapterIndex];
  return Object.freeze({
    id: `spot-${sceneIndex + 1}`,
    chapterId: chapter.id,
    chapterIndex,
    title,
    image,
    alt,
    fact,
    differences: Object.freeze(makeDifferences(sceneIndex, chapter.differenceCount)),
  });
};

export const SPOT_DIFFERENCE_SCENES = Object.freeze([
  makeScene(0, 0, 'Superhero City', city, 'A colourful city with friendly heroes', 'People help their community by sharing and caring for the places where they live.'),
  makeScene(0, 1, 'Dino Park', dinoPark, 'Friendly dinosaurs in a sunny park', 'Fossils are clues that help scientists learn about dinosaurs.'),
  makeScene(0, 2, 'River Valley', dinoRiver, 'A dinosaur beside a sparkling river', 'A clean river gives plants and animals a place to find fresh water.'),
  makeScene(0, 3, 'Moon Camp', dinoMoon, 'A dinosaur exploring a moon camp', 'The Moon is a rocky world that travels around Earth.'),
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
  const withinTolerance = (entry) => Math.hypot(x - entry.x, y - entry.y) <= entry.radius;
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
