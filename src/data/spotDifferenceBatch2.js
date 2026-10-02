const city = new URL('../assets/spot-difference/superhero-city.webp', import.meta.url).href;
const dinoPark = new URL('../assets/puzzle-pop/dino-park.jpg', import.meta.url).href;
const dinoRiver = new URL('../assets/puzzle-pop/dino-river.svg', import.meta.url).href;
const dinoMoon = new URL('../assets/puzzle-pop/dino-moon.svg', import.meta.url).href;
const treehouse = new URL('../assets/game-scenes/askia-memory-treehouse.webp', import.meta.url).href;
const soundSafari = new URL('../assets/game-scenes/sound-safari.webp', import.meta.url).href;
const patternParade = new URL('../assets/game-scenes/pattern-parade.webp', import.meta.url).href;
const timeObservatory = new URL('../assets/game-scenes/time-observatory.webp', import.meta.url).href;
const robin = new URL('../assets/curriculum/robin.webp', import.meta.url).href;
const geography = new URL('../assets/curriculum/geography-world.webp', import.meta.url).href;
const history = new URL('../assets/curriculum/history-world.webp', import.meta.url).href;
const nature = new URL('../assets/curriculum/nature-specimens.webp', import.meta.url).href;

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

const makeDifferences = (sceneIndex, count) => Array.from({ length: count }, (_, position) => {
  const templateIndex = (position + sceneIndex * 2) % CHANGE_TEMPLATES.length;
  const template = CHANGE_TEMPLATES[templateIndex];
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
  makeScene(1, 4, 'Treehouse Team', treehouse, 'A young explorer in a leafy treehouse', 'Taking turns helps everyone share a game or a job.'),
  makeScene(1, 5, 'Sound Safari', soundSafari, 'Animals in a bright listening adventure', 'Animals use different sounds to communicate with one another.'),
  makeScene(1, 6, 'Pattern Parade', patternParade, 'A colourful parade with repeating shapes', 'Repeating patterns follow a rule that we can describe.'),
  makeScene(1, 7, 'Time Observatory', timeObservatory, 'A starry observatory with clocks', 'Earth turns once each day, bringing daylight and darkness.'),
  makeScene(2, 8, 'Robin’s Woodland', robin, 'A robin among leaves and woodland plants', 'Robins use their beaks to find food and build safe nests.'),
  makeScene(2, 9, 'World Explorer', geography, 'A map illustration showing land and water', 'Maps use symbols and labels to show useful information about places.'),
  makeScene(2, 10, 'History Hall', history, 'A museum scene with objects from the past', 'Old objects can be clues about how people lived long ago.'),
  makeScene(2, 11, 'Nature Lab', nature, 'Leaves and seeds in a nature collection', 'Plants need light and water to grow.'),
]);

export const SPOT_DIFFERENCE_PROGRESS_KEY = 'amari_spot_difference_batch2_v1';

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
  state.children[key] = { ...child, unlockedChapter, completedSceneIds: newlyCompleted };
  try { storage?.setItem(SPOT_DIFFERENCE_PROGRESS_KEY, JSON.stringify(state)); } catch { /* Keep the current run playable if storage is full. */ }
  return { ...getSpotDifferenceProgress(playerId, storage), chapterComplete, newlyUnlocked: unlockedChapter > before };
};

export const createSpotDifferenceRun = (chapterIndex, seed, previousQueue = []) => {
  const chapter = SPOT_DIFFERENCE_CHAPTERS[chapterIndex] || SPOT_DIFFERENCE_CHAPTERS[0];
  const scenes = SPOT_DIFFERENCE_SCENES.filter((scene) => scene.chapterIndex === chapterIndex);
  let ordered = shuffleSpotDifference(scenes, seed);
  if (ordered.length > 1 && ordered.map(({ id }) => id).join('|') === previousQueue.join('|')) {
    ordered = [...ordered.slice(1), ordered[0]];
  }
  return ordered.map((scene, index) => ({
    ...scene,
    differences: shuffleSpotDifference(scene.differences, (seed + (index + 1) * 997) >>> 0),
    chapter,
  }));
};
