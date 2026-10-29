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
    id: 'starter', name: 'Picture Pioneers', band: 'starter', grid: 3,
    skill: 'Match big picture pieces and spot the main shapes.',
    visualTip: 'Compare a piece’s corner or edge with the same spot in the preview.',
    scenes: Object.freeze([
      { id: 'dino-park', title: 'Dino Park', image: dinoPark, alt: 'Friendly dinosaurs enjoying a sunny park', fact: 'Some dinosaurs ate plants, and some ate meat. Their teeth helped scientists learn what they ate.' },
      { id: 'river-valley', title: 'River Valley', image: dinoRiver, alt: 'A friendly dinosaur beside a sparkling river', fact: 'Rivers carry fresh water across the land and create homes for plants and animals.' },
      { id: 'moon-camp', title: 'Moon Camp', image: dinoMoon, alt: 'A friendly dinosaur exploring a moon camp', fact: 'The Moon shines because sunlight bounces off its rocky surface.' },
      { id: 'robin-tree', title: 'Robin’s Tree', image: robin, alt: 'A robin and woodland details in a green habitat', fact: 'Robins use their beaks to find small insects and worms in the soil.' },
    ]),
  }),
  Object.freeze({
    id: 'growing', name: 'Curious Constructors', band: 'growing', grid: 4,
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

export const movePuzzlePopBoardFocus = (slot, key, grid) => {
  const row = Math.floor(slot / grid);
  const column = slot % grid;
  if (key === 'ArrowLeft' && column > 0) return slot - 1;
  if (key === 'ArrowRight' && column < grid - 1) return slot + 1;
  if (key === 'ArrowUp' && row > 0) return slot - grid;
  if (key === 'ArrowDown' && row < grid - 1) return slot + grid;
  return slot;
};

export const PUZZLE_POP_PROGRESS_KEY = 'amari_puzzle_pop_batch2_v1';
const defaultPuzzleStorage = () => { try { return globalThis.localStorage; } catch { return null; } };

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

export const createPuzzlePopSceneQueue = (chapterIndex, seed, previousQueue = [], lastCompletedSceneId = previousQueue.at(-1)) => {
  const chapter = PUZZLE_POP_CHAPTERS[chapterIndex] || PUZZLE_POP_CHAPTERS[0];
  let queue = shufflePuzzlePop(chapter.scenes, seed);
  // Rotate the frozen shuffle only at Start: keep each scene once, avoid the
  // picture just completed, and avoid replaying the identical full order.
  for (let attempt = 0; attempt < queue.length && queue.length > 1; attempt += 1) {
    const repeatedOrder = queue.map(({ id }) => id).join('|') === previousQueue.join('|');
    if (queue[0].id !== lastCompletedSceneId && !repeatedOrder) break;
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

const freshPuzzleProgress = () => ({ version: 1, children: {} });
const knownPuzzleScenes = new Set(PUZZLE_POP_CHAPTERS.flatMap(({ scenes }) => scenes.map(({ id }) => id)));
const validPuzzleChild = (child) => child && typeof child === 'object' && !Array.isArray(child)
  && (child.unlockedChapter === undefined || (Number.isInteger(child.unlockedChapter) && child.unlockedChapter >= 0 && child.unlockedChapter <= 2))
  && (child.completedSceneIds === undefined || (Array.isArray(child.completedSceneIds) && child.completedSceneIds.every((id) => knownPuzzleScenes.has(id)) && new Set(child.completedSceneIds).size === child.completedSceneIds.length))
  && (child.lastCompletedSceneId === undefined || knownPuzzleScenes.has(child.lastCompletedSceneId))
  && (child.lastSceneQueue === undefined || (Array.isArray(child.lastSceneQueue) && (child.lastSceneQueue.length === 0 || child.lastSceneQueue.length === 4) && child.lastSceneQueue.every((id) => knownPuzzleScenes.has(id)) && new Set(child.lastSceneQueue).size === child.lastSceneQueue.length
    && PUZZLE_POP_CHAPTERS.some(({ scenes }) => child.lastSceneQueue.every((id) => scenes.some((scene) => scene.id === id)))));
const validPuzzleRoot = (root) => root && typeof root === 'object' && !Array.isArray(root) && root.version === 1
  && root.children && typeof root.children === 'object' && !Array.isArray(root.children)
  && Object.values(root.children).every((child) => validPuzzleChild(child) && validPuzzleReceipts(child.chapterReceipts, child.completedSceneIds || []));
const readPuzzleRootStrict = (storage) => {
  try {
    if (!storage || typeof storage.getItem !== 'function') return { ok: false, error: 'unavailable' };
    const raw = storage.getItem(PUZZLE_POP_PROGRESS_KEY);
    if (raw === null) return { ok: true, root: freshPuzzleProgress() };
    if (typeof raw !== 'string') return { ok: false, error: 'invalid' };
    const root = JSON.parse(raw);
    return validPuzzleRoot(root) ? { ok: true, root } : { ok: false, error: 'invalid' };
  } catch { return { ok: false, error: 'unavailable' }; }
};

const childProgress = (root, playerId) => {
  const child = root.children[playerId || 'amari'];
  return {
    ...(child || {}),
    unlockedChapter: Number.isInteger(child?.unlockedChapter) ? Math.min(2, Math.max(0, child.unlockedChapter)) : 0,
    completedSceneIds: Array.isArray(child?.completedSceneIds) ? [...new Set(child.completedSceneIds.filter((id) => typeof id === 'string'))] : [],
    lastCompletedSceneId: typeof child?.lastCompletedSceneId === 'string' ? child.lastCompletedSceneId : undefined,
    lastSceneQueue: Array.isArray(child?.lastSceneQueue) ? child.lastSceneQueue.filter((id) => typeof id === 'string') : [],
  };
};

const writePuzzleRootStrict = (root, storage) => {
  let serialized;
  try {
    if (!storage || typeof storage.setItem !== 'function' || typeof storage.getItem !== 'function') return { ok: false, error: 'unavailable' };
    serialized = JSON.stringify(root);
    storage.setItem(PUZZLE_POP_PROGRESS_KEY, serialized);
    return storage.getItem(PUZZLE_POP_PROGRESS_KEY) === serialized ? { ok: true } : { ok: false, error: 'readback' };
  } catch {
    try { return storage?.getItem(PUZZLE_POP_PROGRESS_KEY) === serialized ? { ok: true } : { ok: false, error: 'write' }; }
    catch { return { ok: false, error: 'write' }; }
  }
};

const puzzleChapterReceipt = (chapterIndex) => ({ id: `${PUZZLE_POP_CHAPTERS[chapterIndex].id}:complete`, rewardDelta: 2, claimed: false });
const validPuzzleReceipts = (receipts, completedIds) => receipts === undefined || (receipts && typeof receipts === 'object' && !Array.isArray(receipts)
  && Object.entries(receipts).every(([chapterId, receipt]) => {
    const chapterIndex = PUZZLE_POP_CHAPTERS.findIndex(({ id }) => id === chapterId);
    return chapterIndex >= 0 && receipt && typeof receipt === 'object' && !Array.isArray(receipt)
      && receipt.id === `${chapterId}:complete` && receipt.rewardDelta === 2 && typeof receipt.claimed === 'boolean'
      && (completedIds === undefined || PUZZLE_POP_CHAPTERS[chapterIndex].scenes.every(({ id }) => completedIds.includes(id)));
  }));
const readPuzzleProgress = (root, playerId) => childProgress(root, playerId);
const commitPuzzleChild = (root, playerId, nextChild, storage) => {
  const nextRoot = { ...root, children: { ...root.children, [playerId || 'amari']: nextChild } };
  const saved = writePuzzleRootStrict(nextRoot, storage);
  return saved.ok ? { ok: true, progress: childProgress(nextRoot, playerId) } : saved;
};

export const getPuzzlePopProgressStrict = (playerId, storage = defaultPuzzleStorage()) => {
  const loaded = readPuzzleRootStrict(storage);
  return loaded.ok ? { ok: true, progress: readPuzzleProgress(loaded.root, playerId) } : loaded;
};

export const getPuzzlePopProgress = (playerId, storage = defaultPuzzleStorage()) => {
  const loaded = readPuzzleRootStrict(storage);
  return childProgress(loaded.ok ? loaded.root : freshPuzzleProgress(), playerId);
};

export const savePuzzlePopQueue = (playerId, queue, storage = defaultPuzzleStorage()) => {
  const result = savePuzzlePopQueueStrict(playerId, queue, storage);
  if (!result.ok) throw new Error(`Puzzle Pop progress save failed: ${result.error}`);
  return result.progress;
};

export const completePuzzlePopScene = (playerId, chapterIndex, sceneId, storage = defaultPuzzleStorage()) => {
  const result = completePuzzlePopSceneStrict(playerId, chapterIndex, sceneId, storage);
  if (!result.ok) throw new Error(`Puzzle Pop progress save failed: ${result.error}`);
  return { ...result.progress, chapterComplete: result.chapterComplete, newlyUnlocked: result.newlyUnlocked };
};

export const savePuzzlePopQueueStrict = (playerId, queue, storage = defaultPuzzleStorage()) => {
  const ids = Array.isArray(queue) ? queue.map((scene) => scene?.id) : [];
  const chapterIndex = ids.length ? PUZZLE_POP_CHAPTERS.findIndex(({ scenes }) => ids.every((id) => scenes.some((scene) => scene.id === id))) : -1;
  if (chapterIndex < 0 || ids.length !== 4 || new Set(ids).size !== 4) return { ok: false, error: 'invalid' };
  const loaded = readPuzzleRootStrict(storage);
  if (!loaded.ok) return loaded;
  const root = loaded.root;
  const existing = root.children[playerId || 'amari'] || {};
  if (chapterIndex > (existing.unlockedChapter || 0)) return { ok: false, error: 'locked' };
  const result = commitPuzzleChild(root, playerId, { ...childProgress(root, playerId), lastSceneQueue: ids, ...Object.fromEntries(Object.entries(existing).filter(([key]) => !['unlockedChapter', 'completedSceneIds', 'lastCompletedSceneId', 'lastSceneQueue'].includes(key))) }, storage);
  return result;
};

export const completePuzzlePopSceneStrict = (playerId, chapterIndex, sceneId, storage = defaultPuzzleStorage()) => {
  const chapter = PUZZLE_POP_CHAPTERS[chapterIndex];
  if (!chapter || !chapter.scenes.some(({ id }) => id === sceneId)) return { ok: false, error: 'invalid' };
  const loaded = readPuzzleRootStrict(storage);
  if (!loaded.ok) return loaded;
  const child = loaded.root.children[playerId || 'amari'] || {};
  if (chapterIndex > (child.unlockedChapter || 0)) return { ok: false, error: 'locked' };
  if (!validPuzzleReceipts(child.chapterReceipts)) return { ok: false, error: 'invalid' };
  const priorIds = Array.isArray(child.completedSceneIds) ? child.completedSceneIds : [];
  const wasComplete = chapter.scenes.every(({ id }) => priorIds.includes(id));
  const completedSceneIds = [...new Set([...priorIds, sceneId])];
  const chapterComplete = chapter.scenes.every(({ id }) => completedSceneIds.includes(id));
  const chapterReceipts = { ...(child.chapterReceipts || {}) };
  if (!wasComplete && chapterComplete && !chapterReceipts[chapter.id]) chapterReceipts[chapter.id] = puzzleChapterReceipt(chapterIndex);
  const before = Number.isInteger(child.unlockedChapter) ? child.unlockedChapter : 0;
  const unlockedChapter = chapterComplete ? Math.min(2, Math.max(before, chapterIndex + 1)) : before;
  const nextChild = { ...child, unlockedChapter, completedSceneIds, lastCompletedSceneId: sceneId, ...(Object.keys(chapterReceipts).length ? { chapterReceipts } : {}) };
  const saved = commitPuzzleChild(loaded.root, playerId, nextChild, storage);
  return saved.ok ? { ...saved, chapterComplete, newlyUnlocked: unlockedChapter > before, receipt: chapterReceipts[chapter.id] || null } : saved;
};

export const getPuzzlePopPendingChapterReceiptsStrict = (playerId, storage = defaultPuzzleStorage()) => {
  const loaded = readPuzzleRootStrict(storage);
  if (!loaded.ok) return loaded;
  const receipts = loaded.root.children[playerId || 'amari']?.chapterReceipts || {};
  if (!validPuzzleReceipts(receipts)) return { ok: false, error: 'invalid' };
  return { ok: true, receipts: Object.values(receipts).filter(({ claimed }) => !claimed) };
};

export const markPuzzlePopChapterReceiptClaimedStrict = (playerId, receiptId, storage = defaultPuzzleStorage()) => {
  const loaded = readPuzzleRootStrict(storage);
  if (!loaded.ok) return loaded;
  const key = playerId || 'amari';
  const child = loaded.root.children[key] || {};
  if (!validPuzzleReceipts(child.chapterReceipts)) return { ok: false, error: 'invalid' };
  const chapterId = Object.keys(child.chapterReceipts || {}).find((id) => child.chapterReceipts[id].id === receiptId);
  if (!chapterId) return { ok: false, error: 'missing' };
  const chapterReceipts = { ...child.chapterReceipts, [chapterId]: { ...child.chapterReceipts[chapterId], claimed: true } };
  return commitPuzzleChild(loaded.root, playerId, { ...child, chapterReceipts }, storage);
};
