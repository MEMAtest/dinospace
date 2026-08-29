export const STORYBOOK_PROFILE_KEY = 'amari_storybook_active_child_v1';
export const STORYBOOK_PROGRESS_KEY = 'amari_storybook_progress_v1';

const canUseStorage = (storage) => storage && typeof storage.getItem === 'function';

export const readActiveChildId = (storage = globalThis.localStorage) => {
  try { return storage?.getItem(STORYBOOK_PROFILE_KEY) || 'amari'; } catch { return 'amari'; }
};

export const saveActiveChildId = (id, storage = globalThis.localStorage) => {
  try { storage?.setItem(STORYBOOK_PROFILE_KEY, id); } catch { /* optional storage */ }
};

export const readStoryProgress = (storage = globalThis.localStorage) => {
  if (!canUseStorage(storage)) return {};
  try {
    const parsed = JSON.parse(storage.getItem(STORYBOOK_PROGRESS_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch { return {}; }
};

export const updateStoryProgress = (childId, slug, patch, storage = globalThis.localStorage) => {
  const all = readStoryProgress(storage);
  const current = all[childId]?.[slug] || {};
  const next = { ...all, [childId]: { ...(all[childId] || {}), [slug]: { ...current, ...patch, updatedAt: new Date().toISOString() } } };
  try { storage?.setItem(STORYBOOK_PROGRESS_KEY, JSON.stringify(next)); } catch { /* optional storage */ }
  return next[childId][slug];
};

export const getBookProgress = (all, childId, slug) => all?.[childId]?.[slug] || {};
