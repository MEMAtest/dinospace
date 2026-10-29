import { STORYBOOK_PROFILE_KEY } from './storybookProfiles.js';

const defaultStorage = () => { try { return globalThis.localStorage || null; } catch { return null; } };
const validReaderId = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value);

export const readActiveStoryReader = (storage = defaultStorage()) => {
  if (!storage || typeof storage.getItem !== 'function') {
    return { ok: false, status: 'unavailable', id: null };
  }
  try {
    const stored = storage.getItem(STORYBOOK_PROFILE_KEY);
    if (stored === null) return { ok: true, status: 'fresh', id: 'amari' };
    if (!validReaderId(stored)) return { ok: false, status: 'invalid', id: null };
    return { ok: true, status: 'saved', id: stored };
  } catch {
    return { ok: false, status: 'unreadable', id: null };
  }
};

export const resolveVerifiedStoryReader = (preference, profiles) => {
  if (!preference?.ok) return { ok: false, profile: null, shouldPersist: false, reason: 'preference-unavailable' };
  const savedProfiles = Array.isArray(profiles) ? profiles : [];
  if (!savedProfiles.length) return { ok: false, profile: null, shouldPersist: false, reason: 'no-saved-profiles' };
  const existing = savedProfiles.find((profile) => profile?.id === preference.id);
  return existing
    ? { ok: true, profile: existing, shouldPersist: false, reason: 'matched' }
    : { ok: true, profile: savedProfiles[0], shouldPersist: true, reason: 'confirmed-missing' };
};

/** Reader-specific writes require a readable inventory and an exact saved id. */
export const getStoryReaderAccess = (status, profiles, requestedId, activePreferenceOk = true) => {
  if (!activePreferenceOk) return { verified: false, reason: 'active-reader-unreadable', profile: null };
  if (status !== 'available') {
    return { verified: false, reason: status === 'loading' ? 'checking' : 'unavailable', profile: null };
  }
  const savedProfiles = Array.isArray(profiles) ? profiles : [];
  const profile = savedProfiles.find((item) => item?.id === requestedId) || null;
  if (profile) return { verified: true, reason: 'verified', profile };
  return { verified: false, reason: 'missing', profile: null, fallbackProfile: savedProfiles[0] || null };
};

export const canWriteStoryForReader = (status, profiles, requestedId, activeId = requestedId, activePreferenceOk = true) => (
  requestedId === activeId && getStoryReaderAccess(status, profiles, requestedId, activePreferenceOk).verified
);
