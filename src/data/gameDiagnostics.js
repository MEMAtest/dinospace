// Bounded device-local diagnostics. Keep identifiers and outcomes only; never
// save names, story text, prompts, audio or other child-authored content.
export const GAME_DIAGNOSTICS_KEY = 'amari_game_diagnostics_v1';
const LIMIT = 300;
const identifier = (value) => typeof value === 'string' && /^[a-zA-Z0-9:_-]{1,100}$/.test(value) ? value : undefined;

export const recordGameDiagnostic = (game, event, detail = {}, storage) => {
  if (!identifier(game) || !identifier(event)) return false;
  try {
    storage ??= globalThis.localStorage;
    if (!storage) return false;
    let entries;
    try { entries = JSON.parse(storage.getItem(GAME_DIAGNOSTICS_KEY) || '[]'); } catch { entries = []; }
    if (!Array.isArray(entries)) entries = [];
    const data = detail && typeof detail === 'object' ? detail : {};
    const entry = { at: new Date().toISOString(), game, event };
    for (const key of ['level', 'round', 'seed']) {
      if (Number.isSafeInteger(data[key]) && data[key] >= 0) entry[key] = data[key];
    }
    if (identifier(data.difficulty)) entry.difficulty = data.difficulty;
    if (typeof data.firstAttempt === 'boolean') entry.firstAttempt = data.firstAttempt;
    storage.setItem(GAME_DIAGNOSTICS_KEY, JSON.stringify([...entries.slice(-(LIMIT - 1)), entry]));
    return true;
  } catch { return false; }
};
