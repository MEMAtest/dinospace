const dinoPark = new URL('../assets/puzzle-pop/dino-park.jpg', import.meta.url).href;
const dinoRiver = new URL('../assets/puzzle-pop/dino-river-3d.webp', import.meta.url).href;
const dinoMoon = new URL('../assets/puzzle-pop/dino-moon-3d.webp', import.meta.url).href;
const city = new URL('../assets/spot-difference/superhero-city.webp', import.meta.url).href;
const treehouse = new URL('../assets/puzzle-pop/treehouse-robots-3d.webp', import.meta.url).href;
const soundSafari = new URL('../assets/game-scenes/sound-safari.webp', import.meta.url).href;
const patternParade = new URL('../assets/game-scenes/pattern-parade.webp', import.meta.url).href;
const timeObservatory = new URL('../assets/game-scenes/time-observatory.webp', import.meta.url).href;
const robin = new URL('../assets/puzzle-pop/robin-tree-3d.webp', import.meta.url).href;
const geography = new URL('../assets/puzzle-pop/world-explorer-map-3d.webp', import.meta.url).href;
const history = new URL('../assets/curriculum/history-world.webp', import.meta.url).href;
const nature = new URL('../assets/puzzle-pop/nature-lab-leaves-3d.webp', import.meta.url).href;

export const PUZZLE_POP_CHAPTERS = Object.freeze([
  Object.freeze({
    id: 'starter', name: 'Picture Pioneers', band: 'starter', grid: 2,
    skill: 'Match big picture pieces and spot the main shapes.',
    visualTip: 'Compare a piece’s corner or edge with the same spot in the preview.',
    scenes: Object.freeze([
      { id: 'dino-park', title: 'Dino Park Picnic', image: dinoPark, alt: 'Friendly dinosaurs enjoying a sunny park', fact: 'Some dinosaurs ate plants, and some ate meat. Their teeth helped scientists learn what they ate.' },
      { id: 'river-valley', title: 'River Valley', image: dinoRiver, alt: 'A friendly dinosaur beside a sparkling river', fact: 'Rivers carry fresh water across the land and create homes for plants and animals.' },
      { id: 'moon-camp', title: 'Moon Camp', image: dinoMoon, alt: 'A friendly dinosaur exploring a moon camp', fact: 'The Moon shines because sunlight bounces off its rocky surface.' },
      { id: 'robin-tree', title: 'Robin’s Tree', image: robin, alt: 'A robin and woodland details in a green habitat', fact: 'Robins use their beaks to find small insects and worms in the soil.' },
    ]),
  }),
  Object.freeze({
    id: 'growing', name: 'Curious Constructors', band: 'growing', grid: 3,
    skill: 'Use edges, colours and smaller details to fit each piece.',
    visualTip: 'Match one clear edge or colour landmark, then fit its neighbours.',
    scenes: Object.freeze([
      { id: 'hero-city', title: 'Hero City Helpers', image: city, alt: 'A colourful superhero city with buildings and characters', fact: 'People in a community share places such as roads, parks, shops and homes.' },
      { id: 'treehouse-robots', title: 'Treehouse Robots', image: treehouse, alt: 'A young astronaut and robot following arrow steps inside a treehouse workshop', fact: 'A clear set of steps helps a robot know what to do next.' },
      { id: 'sound-safari', title: 'Sound Safari', image: soundSafari, alt: 'A tropical path beside flowing waterfall water, rocks and plants', fact: 'Listening carefully helps us tell the difference between sounds that are alike.' },
      { id: 'pattern-festival', title: 'Pattern Festival', image: patternParade, alt: 'A colourful parade with repeating patterns', fact: 'A pattern repeats a rule. Finding the rule helps you know what comes next.' },
    ]),
  }),
  Object.freeze({
    id: 'challenge', name: 'Detail Detectives', band: 'challenge', grid: 5,
    skill: 'Study small details and use the preview to solve a bigger board.',
    visualTip: 'Scan one row or column at a time. Check a small feature in the preview.',
    scenes: Object.freeze([
      { id: 'time-observatory', title: 'Time Observatory', image: timeObservatory, alt: 'An observatory with a telescope, Earth globe, stars and sunset', fact: 'Earth spins once each day. That spin gives us day and night.' },
      { id: 'world-explorer', title: 'World Explorer', image: geography, alt: 'An explorer workbench with a picture-symbol map and an Earth globe', fact: 'Maps use symbols and pictures to help us understand places.' },
      { id: 'history-hall', title: 'History Hall', image: history, alt: 'Ancient ruins with books, maps and a compass', fact: 'Historians use objects, pictures and stories as clues about the past.' },
      { id: 'nature-lab', title: 'Nature Lab', image: nature, alt: 'A sunny botanical workbench with differently shaped leaves, plants and seeds', fact: 'Leaves can have different shapes, but they all help plants use sunlight.' },
    ]),
  }),
]);

export const PUZZLE_POP_SCENE_COUNT = PUZZLE_POP_CHAPTERS.reduce((count, chapter) => count + chapter.scenes.length, 0);

export const puzzlePopTileImageStyle = (slot, grid) => ({
  width: `${grid * 100}%`,
  height: `${grid * 100}%`,
  left: `${-(slot % grid) * 100}%`,
  top: `${-Math.floor(slot / grid) * 100}%`,
  objectFit: 'cover',
});
export const PUZZLE_POP_PROGRESS_KEY = 'amari_puzzle_pop_batch2_v1';

export const puzzlePopRandomFor = (seed) => {
  let state = (Number(seed) >>> 0) || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

export const shufflePuzzlePop = (items, seed) => {
  const random = puzzlePopRandomFor(seed);
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
};

export const createPuzzlePopSceneQueue = (chapterIndex, seed, previousQueue = []) => {
  const chapter = PUZZLE_POP_CHAPTERS[chapterIndex] || PUZZLE_POP_CHAPTERS[0];
  let queue = shufflePuzzlePop(chapter.scenes, seed);
  if (queue.length > 1 && queue.map(({ id }) => id).join('|') === previousQueue.join('|')) {
    queue = [...queue.slice(1), queue[0]];
  }
  return queue;
};

export const createPuzzlePopPieceTray = (grid, seed, previousOrder = []) => {
  const target = Array.from({ length: grid * grid }, (_, correctSlot) => ({ id: `piece-${correctSlot}`, correctSlot }));
  let tray = shufflePuzzlePop(target, seed);
  if (tray.length > 1 && tray.map(({ correctSlot }) => correctSlot).join(',') === previousOrder.join(',')) {
    tray = [...tray.slice(1), tray[0]];
  }
  return tray;
};

const readProgress = (storage) => {
  try {
    const saved = JSON.parse(storage?.getItem(PUZZLE_POP_PROGRESS_KEY) || '{}');
    return {
      version: 1,
      children: saved?.version === 1 && saved.children && typeof saved.children === 'object' ? saved.children : {},
    };
  } catch {
    return { version: 1, children: {} };
  }
};

const childProgress = (root, playerId) => {
  const child = root.children[playerId || 'amari'];
  return {
    unlockedChapter: Number.isInteger(child?.unlockedChapter) ? Math.min(2, Math.max(0, child.unlockedChapter)) : 0,
    completedSceneIds: Array.isArray(child?.completedSceneIds) ? [...new Set(child.completedSceneIds.filter((id) => typeof id === 'string'))] : [],
    lastSceneQueue: Array.isArray(child?.lastSceneQueue) ? child.lastSceneQueue.filter((id) => typeof id === 'string') : [],
  };
};

const writeProgress = (root, playerId, nextChild, storage) => {
  root.children[playerId || 'amari'] = nextChild;
  try { storage?.setItem(PUZZLE_POP_PROGRESS_KEY, JSON.stringify(root)); } catch { /* Gameplay remains available if storage is full. */ }
  return nextChild;
};

export const getPuzzlePopProgress = (playerId, storage = globalThis.localStorage) => childProgress(readProgress(storage), playerId);

export const savePuzzlePopQueue = (playerId, queue, storage = globalThis.localStorage) => {
  const root = readProgress(storage);
  const child = childProgress(root, playerId);
  return writeProgress(root, playerId, { ...child, lastSceneQueue: queue.map(({ id }) => id) }, storage);
};

export const completePuzzlePopScene = (playerId, chapterIndex, sceneId, storage = globalThis.localStorage) => {
  const root = readProgress(storage);
  const child = childProgress(root, playerId);
  const before = child.unlockedChapter;
  const completedSceneIds = [...new Set([...child.completedSceneIds, sceneId])];
  const chapterSceneIds = (PUZZLE_POP_CHAPTERS[chapterIndex]?.scenes || []).map(({ id }) => id);
  const chapterComplete = chapterSceneIds.length > 0 && chapterSceneIds.every((id) => completedSceneIds.includes(id));
  const unlockedChapter = chapterComplete ? Math.min(2, Math.max(before, chapterIndex + 1)) : before;
  return {
    ...writeProgress(root, playerId, { ...child, completedSceneIds, unlockedChapter }, storage),
    chapterComplete,
    newlyUnlocked: unlockedChapter > before,
  };
};
