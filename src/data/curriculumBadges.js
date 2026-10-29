import { playerStorageKey } from './players.js';

const modules = [
  ['continents', 'Map explorer', 'sky'],
  ['time-detectives', 'Time detective', 'amber'],
  ['nature-lab', 'Nature observer', 'emerald'],
];
export const CURRICULUM_BADGES = modules.flatMap(([module, title, tone]) =>
  ['starter', 'growing', 'challenge'].map((band, index) => ({
    id: `${module}:${band}`, module, band, title, tone, tier: index + 1,
    label: `${band[0].toUpperCase()}${band.slice(1)} ${title.toLowerCase()}`,
  })));
const keyFor = (playerId) => playerStorageKey(playerId, 'curriculum_badges_v1');
const allowed = new Set(CURRICULUM_BADGES.map(({ id }) => id));
const defaultStorage = () => { try { return globalThis.localStorage || null; } catch { return null; } };

export const inspectCurriculumBadges = (playerId, storage = defaultStorage()) => {
  if (!storage || typeof storage.getItem !== 'function') return { status: 'unavailable' };
  let raw;
  try {
    raw = storage.getItem(keyFor(playerId));
  } catch { return { status: 'unavailable' }; }
  if (raw === null) return { status: 'empty', badges: [] };
  if (typeof raw !== 'string') return { status: 'invalid' };
  try {
    const badges = JSON.parse(raw);
    if (!Array.isArray(badges) || badges.some((id) => typeof id !== 'string')) return { status: 'invalid' };
    return { status: 'record', badges };
  } catch { return { status: 'invalid' }; }
};

export const loadCurriculumBadges = (playerId, storage = defaultStorage()) => {
  const result = inspectCurriculumBadges(playerId, storage);
  return ['record', 'empty'].includes(result.status) ? [...new Set(result.badges.filter((id) => allowed.has(id)))] : [];
};

export const saveCurriculumBadge = (playerId, module, band, storage = defaultStorage()) => {
  const id = `${module}:${band}`;
  if (!allowed.has(id)) return { status: 'invalid' };
  const current = inspectCurriculumBadges(playerId, storage);
  if (!['empty', 'record'].includes(current.status)) return { status: current.status };
  const badges = current.status === 'record' ? current.badges : [];
  const next = badges.includes(id) ? [...badges] : [...badges, id];
  if (!storage || typeof storage.setItem !== 'function') return { status: 'unavailable' };
  try {
    const encoded = JSON.stringify(next);
    storage.setItem(keyFor(playerId), encoded);
    if (storage.getItem(keyFor(playerId)) !== encoded) return { status: 'unconfirmed' };
    return { status: 'saved', badges: [...new Set(next.filter((item) => allowed.has(item)))], alreadyEarned: badges.includes(id) };
  } catch { return { status: 'unconfirmed' }; }
};

// Compatibility wrapper for the read-only collection and historical callers.
export const awardCurriculumBadge = (playerId, module, band, storage = defaultStorage()) => {
  const result = saveCurriculumBadge(playerId, module, band, storage);
  return result.status === 'saved' ? result.badges : loadCurriculumBadges(playerId, storage);
};
