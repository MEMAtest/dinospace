import { playerStorageKey } from './players.js';
import { COLOUR_TASKS, validateColourMission } from './batch5Colour.js';
import { ODD_RULES, validateOddMission } from './batch5Reasoning.js';

const KEY = 'batch5_reasoning_progress_v1';
const storageDefault = () => typeof window === 'undefined' ? null : window.localStorage;
const validGame = (game) => ['colormix', 'oddoneout'].includes(game);
const pool = (game, chapter) => (game === 'colormix' ? COLOUR_TASKS : ODD_RULES).filter((entry) => entry.chapter === chapter).map((entry) => entry.id);
const empty = () => ({ completed: [], bestStars: {}, recentIds: {}, palettes: [], unlocked: 0 });
const normalize = (raw, game) => {
  const clean = empty();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return clean;
  for (let chapter = 0; chapter < 3; chapter += 1) {
    if (!raw.completed?.includes(chapter)) break;
    const score = raw.bestStars?.[chapter];
    if (!Number.isInteger(score) || score < 1 || score > 3) break;
    clean.completed.push(chapter); clean.bestStars[chapter] = score;
  }
  clean.unlocked = Math.min(2, clean.completed.length);
  for (let chapter = 0; chapter < 3; chapter += 1) {
    if (Array.isArray(raw.recentIds?.[chapter])) clean.recentIds[chapter] = [...new Set(raw.recentIds[chapter].filter((id) => pool(game, chapter).includes(id)))];
  }
  if (game === 'colormix' && Array.isArray(raw.palettes)) clean.palettes = [...new Set(raw.palettes.filter((id) => COLOUR_TASKS.some((entry) => entry.target === id || entry.mixResult === id)))];
  return clean;
};
export const getReasoningProgress = (game, playerId = 'amari', storage = storageDefault()) => {
  if (!validGame(game) || playerId !== 'amari') return empty();
  try { return normalize(JSON.parse(storage?.getItem(playerStorageKey(playerId, KEY)) || 'null')?.[game], game); }
  catch { return empty(); }
};
export const completeReasoningRun = ({ game, run, results, playerId = 'amari' }, storage = storageDefault()) => {
  if (!validGame(game) || playerId !== 'amari' || !Number.isInteger(run?.chapter) || run.chapter < 0 || run.chapter > 2
    || !Array.isArray(run.missions) || run.missions.length !== 6 || !Array.isArray(results) || results.length !== 6) return null;
  const validator = game === 'colormix' ? validateColourMission : validateOddMission;
  const ids = run.missions.map((entry) => game === 'colormix' ? entry.id : entry.ruleId);
  if (new Set(ids).size !== 6 || run.missions.some((entry) => entry.chapter !== run.chapter || !validator(entry))
    || results.some((result, index) => !result || result.id !== run.missions[index].id || result.correct !== true
      || typeof result.firstTry !== 'boolean' || !Number.isInteger(result.hints) || result.hints < 0 || result.hints > 1)) return null;
  const progress = getReasoningProgress(game, playerId, storage);
  if (run.chapter > progress.unlocked) return null;
  const independent = results.filter((result) => result.firstTry && result.hints === 0).length;
  const stars = independent >= 5 ? 3 : independent >= 3 ? 2 : 1;
  const prior = progress.bestStars[run.chapter] || 0;
  progress.completed = [...new Set([...progress.completed, run.chapter])].sort();
  progress.bestStars[run.chapter] = Math.max(prior, stars);
  progress.unlocked = Math.min(2, progress.completed.length);
  const recent = [...new Set([...(progress.recentIds[run.chapter] || []), ...ids])];
  progress.recentIds[run.chapter] = recent.length >= pool(game, run.chapter).length ? ids : recent;
  if (game === 'colormix') progress.palettes = [...new Set([...progress.palettes, ...run.missions.map((entry) => entry.mixResult || entry.target).filter(Boolean)])];
  let root = {};
  try { const raw = JSON.parse(storage?.getItem(playerStorageKey(playerId, KEY)) || 'null'); if (raw && typeof raw === 'object' && !Array.isArray(raw)) root = raw; } catch { /* Replace an unreadable local checkpoint. */ }
  root[game] = progress;
  let persisted = false;
  try { if (storage) { storage.setItem(playerStorageKey(playerId, KEY), JSON.stringify(root)); persisted = true; } } catch { /* Return in-memory progress without claiming persistence. */ }
  return { progress, stars, awardedStars: Math.max(0, stars - prior), newlyCompleted: prior === 0, persisted };
};
