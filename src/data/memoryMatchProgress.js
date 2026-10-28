import { getGameLevel, saveGameLevel } from './sessionLevels.js';

// Memory completion records contain only durable board results: best moves and stars.
export const getMemoryStorage = () => {
  try { return typeof window === 'undefined' ? null : window.localStorage; }
  catch { return null; }
};
const resumeKey = (playerId) => `${playerId || 'amari'}_memory_resume_v1`;
const completionKey = (playerId) => `${playerId || 'amari'}_memory_completion_v1`;

const validPassport = (value, levels) => Object.fromEntries(levels.flatMap((level) => {
  const saved = value?.[level.id];
  if (!Number.isInteger(saved?.bestMoves) || saved.bestMoves < level.emojis.length || ![1, 2, 3].includes(saved.stars)) return [];
  const lastMoves = Number.isInteger(saved.lastMoves) && saved.lastMoves >= level.emojis.length ? saved.lastMoves : undefined;
  return [[level.id, { bestMoves: saved.bestMoves, stars: saved.stars, ...(lastMoves ? { lastMoves } : {}) }]];
}));

const readCompletion = (playerId, totalLevels, storage) => {
  try {
    const value = JSON.parse(storage?.getItem(completionKey(playerId)) || 'null');
    if (value?.version !== 1) return null;
    return {
      resumeIndex: Number.isInteger(value.resumeIndex) ? Math.max(0, Math.min(totalLevels - 1, value.resumeIndex)) : 0,
      unlockedIndex: Number.isInteger(value.unlockedIndex) ? Math.max(0, Math.min(totalLevels - 1, value.unlockedIndex)) : 0,
      passport: value.passport && typeof value.passport === 'object' ? value.passport : {},
    };
  } catch { return null; }
};

const mergeMemoryRecords = (current, other, levels) => {
  const left = validPassport(current, levels);
  const right = validPassport(other, levels);
  return Object.fromEntries(levels.flatMap((level) => {
    const a = left[level.id], b = right[level.id];
    if (!a && !b) return [];
    const bestMoves = Math.min(a?.bestMoves ?? Infinity, b?.bestMoves ?? Infinity);
    const bestStars = Math.max(a?.stars || 0, b?.stars || 0);
    const newest = a?.lastMoves !== undefined ? a : b;
    return [[level.id, { bestMoves, stars: bestStars, ...(newest?.lastMoves !== undefined ? { lastMoves: newest.lastMoves } : {}) }]];
  }));
};

const readStoredObject = (storage, key) => {
  try {
    const raw = storage.getItem(key);
    if (raw === null || raw === undefined) return { ok: true, present: false, value: {} };
    const value = JSON.parse(raw);
    return value && typeof value === 'object' && !Array.isArray(value)
      ? { ok: true, present: true, value }
      : { ok: false, present: true, value: null };
  } catch { return { ok: false, present: true, value: null }; }
};

const isValidStoredPassport = (passport, levels) => Object.entries(passport).every(([id, result]) => {
  const level = levels.find((entry) => entry.id === id);
  return Boolean(level && result && typeof result === 'object' && !Array.isArray(result)
    && Number.isInteger(result.bestMoves) && result.bestMoves >= level.emojis.length
    && [1, 2, 3].includes(result.stars)
    && (result.lastMoves === undefined || (Number.isInteger(result.lastMoves) && result.lastMoves >= level.emojis.length)));
});

// Pair-local compatibility mirror for the retained little-mode boards. Do not
// replace the shared all-games map when its existing bytes cannot be read.
export function safeSaveMemoryGameLevel(playerId, current, unlocked, storage = getMemoryStorage()) {
  if (!storage || !Number.isInteger(current) || current < 0 || !Number.isInteger(unlocked) || unlocked < current) return false;
  const key = `${playerId || 'amari'}_game_levels_v1`;
  const existing = readStoredObject(storage, key);
  if (!existing.ok) return false;
  const memory = existing.value.memory;
  if (memory !== undefined && (!memory || typeof memory !== 'object' || Array.isArray(memory)
    || !Number.isInteger(memory.current) || memory.current < 0
    || !Number.isInteger(memory.unlocked) || memory.unlocked < memory.current)) return false;
  const serialized = JSON.stringify({ ...existing.value, memory: { current, unlocked } });
  try {
    storage.setItem(key, serialized);
    return storage.getItem(key) === serialized;
  } catch { return false; }
}

const inspectMemoryCompletionStorage = (playerId, levels, storage) => {
  if (!storage || playerId !== 'amari') return null;
  const total = levels.length;
  const completion = readStoredObject(storage, completionKey(playerId));
  const legacyPassport = readStoredObject(storage, 'amari_memory_passport_v1');
  const legacyResume = readStoredObject(storage, resumeKey(playerId));
  const allGameLevels = readStoredObject(storage, `${playerId}_game_levels_v1`);
  if (![completion, legacyPassport, legacyResume, allGameLevels].every((item) => item.ok)) return null;
  if (!isValidStoredPassport(legacyPassport.value, levels)) return null;
  if (legacyResume.present && (!Number.isInteger(legacyResume.value.resumeIndex) || legacyResume.value.resumeIndex < 0 || legacyResume.value.resumeIndex >= total)) return null;
  if (completion.present) {
    const saved = completion.value;
    if (saved.version !== 1 || !Number.isInteger(saved.resumeIndex) || saved.resumeIndex < 0 || saved.resumeIndex >= total
      || !Number.isInteger(saved.unlockedIndex) || saved.unlockedIndex < 0 || saved.unlockedIndex >= total
      || !saved.passport || typeof saved.passport !== 'object' || Array.isArray(saved.passport)
      || !isValidStoredPassport(saved.passport, levels)) return null;
  }
  const memoryLevel = allGameLevels.value.memory;
  if (memoryLevel !== undefined && (!memoryLevel || typeof memoryLevel !== 'object' || Array.isArray(memoryLevel)
    || !Number.isInteger(memoryLevel.current) || memoryLevel.current < 0 || memoryLevel.current >= total
    || !Number.isInteger(memoryLevel.unlocked) || memoryLevel.unlocked < 0 || memoryLevel.unlocked >= total
    || memoryLevel.current > memoryLevel.unlocked)) return null;
  return { completion, legacyPassport, legacyResume, allGameLevels };
};

export function readMemoryResume(playerId, totalLevels, fallbackIndex = 0, storage = getMemoryStorage()) {
  const last = Math.max(0, totalLevels - 1);
  const fallback = Math.min(last, Math.max(0, Number.isInteger(fallbackIndex) ? fallbackIndex : 0));
  try {
    const completion = readCompletion(playerId, totalLevels, storage);
    const saved = JSON.parse(storage?.getItem(resumeKey(playerId)) || 'null');
    return Math.max(fallback, completion?.resumeIndex || 0, completion?.unlockedIndex || 0,
      Number.isInteger(saved?.resumeIndex) ? Math.min(last, Math.max(0, saved.resumeIndex)) : 0);
  } catch { /* use the established unlocked level as the migration fallback */ }
  return fallback;
}

export function saveMemoryResume(playerId, resumeIndex, storage = getMemoryStorage()) {
  try {
    if (!storage || !Number.isInteger(resumeIndex) || resumeIndex < 0) throw Error('Invalid memory resume');
    const key = resumeKey(playerId);
    const existing = readStoredObject(storage, key);
    if (!existing.ok || (existing.present && (!Number.isInteger(existing.value.resumeIndex) || existing.value.resumeIndex < 0))) return false;
    const serialized = JSON.stringify({ resumeIndex });
    storage.setItem(key, serialized);
    return storage.getItem(key) === serialized;
  } catch { return false; }
}

export function completeMemoryProgress(playerId, totalLevels, completedIndex, fallbackIndex = 0, storage = getMemoryStorage()) {
  const last = Math.max(0, totalLevels - 1);
  const completed = Math.min(last, Math.max(0, Number.isInteger(completedIndex) ? completedIndex : 0));
  const nextIndex = Math.min(last, completed + 1);
  const resumeIndex = Math.max(readMemoryResume(playerId, totalLevels, fallbackIndex, storage), nextIndex);
  const saved = getGameLevel(playerId, 'memory', totalLevels, storage);
  const unlocked = Math.max(saved.unlocked, resumeIndex);
  const persisted = saveMemoryResume(playerId, resumeIndex, storage);
  saveGameLevel(playerId, 'memory', resumeIndex, unlocked, storage);
  return { resumeIndex, unlocked, persisted };
}

export function buildSeededMemoryDeck(level, seed) {
  let state = (Number(seed) >>> 0) || 1;
  const cards = level.emojis.flatMap((emoji, index) => ['a', 'b'].map((copy) => ({ id: `${level.id}-${index}-${copy}`, emoji, flipped: false, matched: false })));
  for (let index = cards.length - 1; index > 0; index--) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    const other = (state >>> 0) % (index + 1);
    [cards[index], cards[other]] = [cards[other], cards[index]];
  }
  return cards;
}

export function memoryStrategy(pairCount, prior = null) {
  const efficient = prior ? prior.bestMoves <= pairCount * 2 : false;
  const neededMoreTime = prior?.lastMoves !== undefined && prior.lastMoves >= Math.max(pairCount * 2, prior.bestMoves * 1.5);
  if (pairCount < 8) {
    return neededMoreTime
      ? 'Last time, a few pairs were tricky. Turn two cards, then pause and picture where each one belongs.'
      : 'Scan one row at a time. Say the picture and remember its place before turning another card.';
  }
  if (pairCount < 13) {
    return neededMoreTime
      ? 'Try a small group at a time. After two cards, pause and remember their row before you search again.'
      : 'Group the board into small areas. Finish scanning one area before you move to the next.';
  }
  if (neededMoreTime) return 'This board is busy. Pause after each pair and picture its row and place before you search again.';
  if (efficient) return 'Try recalling both places before you turn the second card. Keep the same board until every pair is found.';
  return 'This board is busy. Remember each picture with its row and place. When a picture returns, find where its partner appeared.';
}

export function readMemoryPassport(playerId, levels, storage = getMemoryStorage()) {
  if (playerId !== 'amari') return {};
  try {
    const raw = JSON.parse(storage?.getItem('amari_memory_passport_v1') || '{}');
    const completion = readCompletion(playerId, levels.length, storage);
    return mergeMemoryRecords(completion?.passport, raw, levels);
  } catch { return {}; }
}

export function completeMemoryBoard(playerId, levels, levelId, moves, storage = getMemoryStorage()) {
  const previous = readMemoryPassport(playerId, levels, storage);
  const level = levels.find((entry) => entry.id === levelId);
  if (playerId !== 'amari' || !level || !Number.isInteger(moves) || moves < level.emojis.length) return { passport: previous, awardedStars: 0, persisted: false };
  const bestMoves = Math.min(previous[levelId]?.bestMoves || Infinity, moves);
  const stars = bestMoves <= level.emojis.length * 2 ? 3 : bestMoves <= level.emojis.length * 3 ? 2 : 1;
  const passport = { ...previous, [levelId]: { bestMoves, stars, lastMoves: moves } };
  try {
    if (!storage) throw Error('Unavailable storage');
    storage.setItem('amari_memory_passport_v1', JSON.stringify(passport));
    return { passport, awardedStars: Math.max(0, stars - (previous[levelId]?.stars || 0)), persisted: true };
  } catch { return { passport: previous, awardedStars: 0, persisted: false }; }
}

// Commit the resume point and earned sticker together before the UI awards a
// completed board. The one-key record is canonical; legacy keys are mirrored
// only after it commits so old progress can be migrated without being erased.
export function completeMemoryRun(playerId, levels, levelIndex, fallbackIndex, levelId, moves, storage = getMemoryStorage()) {
  const level = levels.find((entry) => entry.id === levelId);
  if (playerId !== 'amari' || !level || !Number.isInteger(levelIndex) || levelIndex < 0 || levelIndex >= levels.length || !Number.isInteger(moves) || moves < level.emojis.length) {
    return { passport: {}, resumeIndex: 0, awardedStars: 0, persisted: false };
  }

  const stored = inspectMemoryCompletionStorage(playerId, levels, storage);
  if (!stored) return { passport: {}, resumeIndex: 0, awardedStars: 0, persisted: false };
  const previousPassport = mergeMemoryRecords(stored.completion.value?.passport, stored.legacyPassport.value, levels);
  const last = levels.length - 1;
  const fallback = Number.isInteger(fallbackIndex) ? Math.min(last, Math.max(0, fallbackIndex)) : 0;
  const previousResume = Math.max(fallback,
    stored.completion.value?.resumeIndex || 0,
    stored.completion.value?.unlockedIndex || 0,
    stored.legacyResume.value?.resumeIndex || 0,
    stored.allGameLevels.value.memory?.unlocked || 0);
  const old = previousPassport[levelId];
  const bestMoves = Math.min(old?.bestMoves ?? Infinity, moves);
  const stars = bestMoves <= level.emojis.length * 2 ? 3 : bestMoves <= level.emojis.length * 3 ? 2 : 1;
  const passport = { ...previousPassport, [levelId]: { bestMoves, stars, lastMoves: moves } };
  const legacyUnlocked = stored.allGameLevels.value.memory?.unlocked || 0;
  const resumeIndex = Math.max(previousResume, legacyUnlocked, Math.min(last, levelIndex + 1));
  const unlockedIndex = Math.max(legacyUnlocked, resumeIndex);
  const record = { version: 1, resumeIndex, unlockedIndex, passport };
  try {
    const serialized = JSON.stringify(record);
    storage.setItem(completionKey(playerId), serialized);
    const written = JSON.parse(storage.getItem(completionKey(playerId)) || 'null');
    const verifiedPassport = mergeMemoryRecords({}, written?.passport, levels);
    if (written?.version !== 1 || written.resumeIndex !== resumeIndex || written.unlockedIndex !== unlockedIndex || JSON.stringify(verifiedPassport) !== JSON.stringify(validPassport(passport, levels))) throw Error('Memory completion write did not persist');
    // Compatibility mirrors are best effort: the canonical commit above is
    // authoritative and the legacy values remain readable if a mirror fails.
    try { storage.setItem(resumeKey(playerId), JSON.stringify({ resumeIndex })); } catch { /* canonical record remains complete */ }
    try {
      storage.setItem(`${playerId}_game_levels_v1`, JSON.stringify({
        ...stored.allGameLevels.value,
        memory: { current: resumeIndex, unlocked: unlockedIndex },
      }));
    } catch { /* canonical record remains complete */ }
    try { storage.setItem('amari_memory_passport_v1', JSON.stringify(passport)); } catch { /* canonical record remains complete */ }
    return { passport, resumeIndex, awardedStars: Math.max(0, stars - (old?.stars || 0)), persisted: true };
  } catch {
    return { passport: previousPassport, resumeIndex: previousResume, awardedStars: 0, persisted: false };
  }
}
