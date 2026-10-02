// Bounded device-local diagnostics. Keep identifiers and outcomes only; never
// save names, story text, prompts, audio or other child-authored content.
export const GAME_DIAGNOSTICS_KEY = 'amari_game_diagnostics_v1';
export const GAME_LIFECYCLE_DIAGNOSTICS_KEY = 'amari_game_lifecycle_diagnostics_v1';
const LIMIT = 300;
const LIFECYCLE_LIMIT = 100;
const LIFECYCLE_EVENTS = new Set(['start', 'level_complete', 'replay', 'leave']);
const identifier = (value) => typeof value === 'string' && /^[a-zA-Z0-9:_-]{1,100}$/.test(value) ? value : undefined;
const HINT_TYPES = new Set(['prompt', 'question', 'clue', 'explanation', 'lesson', 'instructions', 'feedback', 'observation', 'vocabulary', 'word_help', 'audio_help', 'replay_clue']);

const sanitizedEntry = (game, event, data, at) => {
  if (!identifier(game) || !identifier(event)) return null;
  const entry = { game, event };
  if (typeof at === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(at)) entry.at = at;
  for (const key of ['level', 'round', 'seed']) {
    if (Number.isSafeInteger(data[key]) && data[key] >= 0) entry[key] = data[key];
  }
  if (Number.isSafeInteger(data.pageIndex) && data.pageIndex >= -1) entry.pageIndex = data.pageIndex;
  if (identifier(data.difficulty)) entry.difficulty = data.difficulty;
  if (typeof data.firstAttempt === 'boolean') entry.firstAttempt = data.firstAttempt;
  if (HINT_TYPES.has(data.hintType)) entry.hintType = data.hintType;
  return entry;
};

export const recordGameDiagnostic = (game, event, detail = {}, storage) => {
  if (!identifier(game) || !identifier(event)) return false;
  try {
    storage ??= globalThis.localStorage;
    if (!storage) return false;
    let entries;
    try { entries = JSON.parse(storage.getItem(GAME_DIAGNOSTICS_KEY) || '[]'); } catch { entries = []; }
    if (!Array.isArray(entries)) entries = [];
    const data = detail && typeof detail === 'object' ? detail : {};
    const entry = sanitizedEntry(game, event, data, new Date().toISOString());
    storage.setItem(GAME_DIAGNOSTICS_KEY, JSON.stringify([...entries.slice(-(LIMIT - 1)), entry]));
    if (LIFECYCLE_EVENTS.has(event)) {
      // Frequent scene/answer events must not evict all retained run seeds.
      // This is bounded milestone history, not a complete play transcript.
      let milestones;
      try { milestones = JSON.parse(storage.getItem(GAME_LIFECYCLE_DIAGNOSTICS_KEY) || '[]'); } catch { milestones = []; }
      if (!Array.isArray(milestones)) milestones = [];
      storage.setItem(GAME_LIFECYCLE_DIAGNOSTICS_KEY, JSON.stringify([...milestones.slice(-(LIFECYCLE_LIMIT - 1)), entry]));
    }
    return true;
  } catch { return false; }
};

export const readGameDiagnostics = (storage) => {
  const read = (key) => {
    try {
      storage ??= globalThis.localStorage;
      const value = JSON.parse(storage?.getItem(key) || '[]');
      return Array.isArray(value) ? value.filter((entry) => entry && typeof entry === 'object')
        .map((entry) => sanitizedEntry(entry.game, entry.event, entry, entry.at)).filter(Boolean) : [];
    } catch { return []; }
  };
  return {
    version: 2,
    retention: { recentEvents: LIMIT, runMilestones: LIFECYCLE_LIMIT },
    events: read(GAME_DIAGNOSTICS_KEY).slice(-LIMIT),
    runMilestones: read(GAME_LIFECYCLE_DIAGNOSTICS_KEY).filter((entry) => LIFECYCLE_EVENTS.has(entry.event)).slice(-LIFECYCLE_LIMIT),
  };
};
