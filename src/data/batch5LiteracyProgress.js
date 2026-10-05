import { playerStorageKey } from './players.js';
import { isCanonicalBatch5QuestionId } from './batch5LiteracyPools.js';

export const BATCH5_LITERACY_PROGRESS_KEY = 'batch5_literacy_progress_v1';
export const BATCH5_LITERACY_PROGRESS_VERSION = 1;
const empty = () => ({ version: BATCH5_LITERACY_PROGRESS_VERSION, games: {} });
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const safeStorage = () => typeof window === 'undefined' ? null : window.localStorage;
const keyFor = (playerId) => playerStorageKey(playerId, BATCH5_LITERACY_PROGRESS_KEY);
const validGame = (game) => game === 'soundSafari' || game === 'spelling';
const normalizeGame = (value, game) => {
  const state = isRecord(value) ? value : {};
  const completed = [];
  for (let index = 0; index < 3; index += 1) {
    if (!Array.isArray(state.completedChapterIds) || !state.completedChapterIds.includes(index)) break;
    completed.push(index);
  }
  const bestStars = {};
  for (let index = 0; index < 3; index += 1) {
    const score = state.bestStars?.[index];
    if (completed.includes(index) && Number.isInteger(score) && score >= 1 && score <= 3) bestStars[index] = score;
  }
  const recentQuestionIds = {};
  if (isRecord(state.recentQuestionIds)) for (let index = 0; index < 3; index += 1) {
        if (Array.isArray(state.recentQuestionIds[index])) {
          const validRecent = [...new Set(state.recentQuestionIds[index].filter((id) => isCanonicalBatch5QuestionId(game, index, id)))].slice(-512);
          if (validRecent.length) recentQuestionIds[index] = validRecent;
        }
  }
  return {
    unlockedChapter: completed.length ? Math.min(2, completed.at(-1) + 1) : 0,
    completedChapterIds: completed,
    bestStars,
    recentQuestionIds,
  };
};
const normalize = (value) => {
  const clean = empty();
  if (!isRecord(value) || value.version !== BATCH5_LITERACY_PROGRESS_VERSION || !isRecord(value.games)) return clean;
  for (const game of ['soundSafari', 'spelling']) clean.games[game] = normalizeGame(value.games[game], game);
  return clean;
};
export const getBatch5LiteracyProgress = (game, playerId = 'amari', storage = safeStorage()) => {
  if (!validGame(game)) return normalizeGame(null, game);
  if (playerId !== 'amari') return normalizeGame(null, game);
  try { return normalize(JSON.parse(storage?.getItem(keyFor(playerId)) || 'null')).games[game] || normalizeGame(null, game); }
  catch { return normalizeGame(null, game); }
};
const writeState = (playerId, state, storage) => { try { storage?.setItem(keyFor(playerId), JSON.stringify(state)); } catch { /* Play continues without persistent progress. */ } };
export const rememberBatch5LiteracyRun = (game, chapterIndex, questionIds, poolIds, playerId = 'amari', storage = safeStorage()) => {
  if (!validGame(game) || playerId !== 'amari' || !Number.isInteger(chapterIndex) || chapterIndex < 0 || chapterIndex > 2 || !Array.isArray(poolIds) || poolIds.length < 20 || new Set(poolIds).size !== poolIds.length || poolIds.some((id) => !isCanonicalBatch5QuestionId(game, chapterIndex, id)) || !Array.isArray(questionIds) || questionIds.length !== 6 || new Set(questionIds).size !== 6 || questionIds.some((id) => !poolIds.includes(id) || !isCanonicalBatch5QuestionId(game, chapterIndex, id))) return null;
  const state = (() => { try { return normalize(JSON.parse(storage?.getItem(keyFor(playerId)) || 'null')); } catch { return normalize(null); } })();
  const chapter = normalizeGame(state.games[game], game);
  if (chapterIndex > chapter.unlockedChapter) return null;
  const activeIds = new Set(poolIds || []);
  const previous = (chapter.recentQuestionIds[chapterIndex] || []).filter((id) => activeIds.has(id));
  const fresh = questionIds.filter((id) => !previous.includes(id));
  const cycle = [...previous, ...fresh];
  chapter.recentQuestionIds[chapterIndex] = Array.isArray(poolIds) && poolIds.length > 0 && cycle.length >= poolIds.length ? [...questionIds] : cycle.slice(-512);
  state.games[game] = chapter;
  writeState(playerId, state, storage);
  return chapter;
};
export const recordBatch5LiteracyCompletion = (game, chapterIndex, stars, questionIds, poolIds, playerId = 'amari', storage = safeStorage()) => {
  if (!validGame(game) || playerId !== 'amari' || !Number.isInteger(chapterIndex) || chapterIndex < 0 || chapterIndex > 2 || !Number.isInteger(stars) || stars < 1 || stars > 3 || !Array.isArray(poolIds) || poolIds.length < 20 || new Set(poolIds).size !== poolIds.length || poolIds.some((id) => !isCanonicalBatch5QuestionId(game, chapterIndex, id)) || !Array.isArray(questionIds) || questionIds.length !== 6 || new Set(questionIds).size !== 6 || questionIds.some((id) => !poolIds.includes(id) || !isCanonicalBatch5QuestionId(game, chapterIndex, id))) return null;
  const state = (() => { try { return normalize(JSON.parse(storage?.getItem(keyFor(playerId)) || 'null')); } catch { return normalize(null); } })();
  const chapter = normalizeGame(state.games[game], game);
  if (chapterIndex > chapter.unlockedChapter) return null;
  const previousBest = chapter.bestStars[chapterIndex] || 0;
  const completedBefore = chapter.completedChapterIds.includes(chapterIndex);
  chapter.completedChapterIds = [...new Set([...chapter.completedChapterIds, chapterIndex])].sort();
  chapter.bestStars[chapterIndex] = Math.max(previousBest, stars);
  chapter.unlockedChapter = Math.max(chapter.unlockedChapter, Math.min(2, chapterIndex + 1));
  const activeIds = new Set(poolIds || []);
  const previous = (chapter.recentQuestionIds[chapterIndex] || []).filter((id) => activeIds.has(id));
  const cycle = [...previous, ...questionIds.filter((id) => !previous.includes(id))];
  chapter.recentQuestionIds[chapterIndex] = Array.isArray(poolIds) && poolIds.length > 0 && cycle.length >= poolIds.length ? [...questionIds] : cycle.slice(-512);
  state.games[game] = chapter;
  writeState(playerId, state, storage);
  return { progress: chapter, awardedStars: Math.max(0, stars - previousBest), newlyCompleted: !completedBefore, improved: stars > previousBest };
};
