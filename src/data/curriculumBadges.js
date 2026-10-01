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
const keyFor = (playerId) => `${playerId || 'amari'}_curriculum_badges_v1`;
export const loadCurriculumBadges = (playerId, storage = globalThis.localStorage) => {
  try {
    const value = JSON.parse(storage?.getItem(keyFor(playerId)) || '[]');
    return Array.isArray(value) ? [...new Set(value.filter((id) => CURRICULUM_BADGES.some((badge) => badge.id === id)))] : [];
  } catch { return []; }
};
export const awardCurriculumBadge = (playerId, module, band, storage = globalThis.localStorage) => {
  const earned = loadCurriculumBadges(playerId, storage);
  const id = `${module}:${band}`;
  if (!CURRICULUM_BADGES.some((badge) => badge.id === id)) return earned;
  const next = [...new Set([...earned, id])];
  try { storage?.setItem(keyFor(playerId), JSON.stringify(next)); } catch { /* Play continues without storage. */ }
  return next;
};
