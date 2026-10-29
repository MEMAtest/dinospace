import { assertValidStorybookRecords } from './storybookBackup.js';

const DB_NAME = 'amari-storybooks';
const DB_VERSION = 2;
const BOOKS_STORE = 'books';
const ASSETS_STORE = 'assets';
const PROFILES_STORE = 'profiles';
const SERIES_STORE = 'series';

let databasePromise;

const hasIndexedDb = () => typeof window !== 'undefined' && Boolean(window.indexedDB);

const openDatabase = () => {
  if (!hasIndexedDb()) return Promise.resolve(null);
  if (databasePromise) return databasePromise;
  let opening;
  opening = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    let openEventSettled = false;
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(BOOKS_STORE)) database.createObjectStore(BOOKS_STORE, { keyPath: 'id' });
      if (!database.objectStoreNames.contains(ASSETS_STORE)) database.createObjectStore(ASSETS_STORE, { keyPath: 'key' });
      if (!database.objectStoreNames.contains(PROFILES_STORE)) database.createObjectStore(PROFILES_STORE, { keyPath: 'id' });
      if (!database.objectStoreNames.contains(SERIES_STORE)) database.createObjectStore(SERIES_STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => {
      const database = request.result;
      if (openEventSettled) { database.close(); return; }
      openEventSettled = true;
      const invalidate = () => {
        try { database.close(); } catch { /* connection may already be closed */ }
        if (databasePromise === opening) databasePromise = null;
      };
      database.onversionchange = invalidate;
      database.onclose = invalidate;
      resolve(database);
    };
    request.onerror = () => {
      if (openEventSettled) return;
      openEventSettled = true;
      reject(request.error || new Error('Could not open storybook storage'));
    };
    request.onblocked = () => {
      if (openEventSettled) return;
      openEventSettled = true;
      reject(new Error('Storybook storage upgrade is blocked by another open tab.'));
    };
  }).catch((error) => {
    if (databasePromise === opening) databasePromise = null;
    throw error;
  });
  databasePromise = opening;
  return opening;
};

const requestResult = (request) => new Promise((resolve, reject) => {
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error || new Error('Storybook storage request failed'));
});

const transaction = async (storeNames, mode, action) => {
  const database = await openDatabase();
  if (!database) return null;
  const names = Array.isArray(storeNames) ? storeNames : [storeNames];
  const tx = database.transaction(storeNames, mode);
  return new Promise((resolve, reject) => {
    let result;
    let actionError;
    let actionSettled = false;
    tx.oncomplete = () => {
      if (actionError) reject(actionError);
      else if (!actionSettled) reject(new Error('Storybook storage transaction completed before its request finished.'));
      else resolve(result);
    };
    tx.onabort = () => reject(actionError || tx.error || new Error('Storybook storage transaction was aborted.'));
    try {
      const stores = names.length === 1
        ? tx.objectStore(names[0])
        : Object.fromEntries(names.map((name) => [name, tx.objectStore(name)]));
      Promise.resolve(action(stores, tx)).then((value) => { result = value; actionSettled = true; }, (error) => {
        actionError = error;
        actionSettled = true;
        try { tx.abort(); } catch { reject(error); }
      });
    } catch (error) {
      actionError = error;
      try { tx.abort(); } catch { reject(error); }
    }
  });
};

export const saveStoryBook = async (book) => {
  if (!book?.id) return false;
  const result = await transaction(BOOKS_STORE, 'readwrite', (store) => requestResult(store.put(book))).catch(() => null);
  return result !== null;
};

export const getStoryBooks = async () => {
  const result = await transaction(BOOKS_STORE, 'readonly', (store) => requestResult(store.getAll())).catch(() => null);
  return Array.isArray(result) ? result : [];
};

// An unreadable database is not evidence that a family's stories are gone.
// Keep that distinction visible when inventorying the library.
export const getStoryLibraryInventory = async () => {
  try {
    const books = await transaction(BOOKS_STORE, 'readonly', (store) => requestResult(store.getAll()));
    return Array.isArray(books) ? { available: true, books } : { available: false, books: [] };
  } catch {
    return { available: false, books: [] };
  }
};

export const getStoryBookRecord = async (id) => transaction(BOOKS_STORE, 'readonly', (store) => requestResult(store.get(id))).catch(() => null);

export const saveStoryAsset = async (key, blob) => {
  if (!key || !blob) return false;
  const result = await transaction(ASSETS_STORE, 'readwrite', (store) => requestResult(store.put({ key, blob, type: blob.type || 'application/octet-stream' }))).catch(() => null);
  return result !== null;
};

// Restore adds only stories whose ids are not already on this device. A single
// IndexedDB transaction keeps each imported story and all of its assets together.
export const importStorybookRecords = async ({ books = [], assets = [] }) => {
  assertValidStorybookRecords({ books, assets });
  const database = await openDatabase();
  if (!database) throw new Error('Story storage is unavailable in this browser.');
  return transaction([BOOKS_STORE, ASSETS_STORE], 'readwrite', ({ books: bookStore, assets: assetStore }, tx) => new Promise((resolve, reject) => {
    const existingRequest = bookStore.getAll();
    existingRequest.onsuccess = () => {
      try {
        const existingBooks = existingRequest.result || [];
        const existingIds = new Set(existingBooks.map((book) => book.id));
        let skipped = 0;
        const incoming = books.filter((book) => {
          if (existingIds.has(book.id)) { skipped += 1; return false; }
          existingIds.add(book.id);
          return true;
        });
        if (existingBooks.length + incoming.length > 20) {
          throw new Error(`This device can store up to 20 saved stories. There is room for ${Math.max(0, 20 - existingBooks.length)} more.`);
        }
        const acceptedIds = new Set(incoming.map((book) => book.id));
        incoming.forEach((book) => bookStore.add(book));
        assets.filter((asset) => acceptedIds.has(asset.key.slice(0, asset.key.indexOf(':'))))
          .forEach((asset) => assetStore.put({ key: asset.key, blob: asset.blob, type: asset.blob.type }));
        resolve({ added: incoming.length, skipped });
      } catch (error) {
        try { tx.abort(); } catch { /* transaction has already ended */ }
        reject(error);
      }
    };
    existingRequest.onerror = () => reject(existingRequest.error || new Error('Could not check the stories already saved on this device.'));
  })).catch((error) => {
    if (error?.message?.startsWith('This device can store up to 20 saved stories.')) throw error;
    throw new Error(error?.message || 'Could not restore the story backup.');
  });
};

export const getStoryAsset = async (key) => {
  if (!key) return null;
  const result = await transaction(ASSETS_STORE, 'readonly', (store) => requestResult(store.get(key))).catch(() => null);
  return result?.blob || null;
};

export const getStoryAssetInventory = async (key) => {
  if (!key) return { available: true, blob: null };
  try {
    const record = await transaction(ASSETS_STORE, 'readonly', (store) => requestResult(store.get(key)));
    if (record === null) return { available: false, blob: null };
    return { available: true, blob: record?.blob || null };
  } catch { return { available: false, blob: null }; }
};

export const deleteStoryBook = async (book) => {
  if (!book?.id) return false;
  try {
    const result = await transaction([BOOKS_STORE, ASSETS_STORE], 'readwrite', ({ books: bookStore, assets: assetStore }) => {
      bookStore.delete(book.id);
      [book.coverAssetKey, book.coverAudioAssetKey, ...(book.pages || []).flatMap((page) => [page.imageAssetKey, page.audioAssetKey])]
        .filter(Boolean)
        .forEach((key) => assetStore.delete(key));
    });
    return result !== null;
  } catch { return false; }
};

const DEFAULT_PROFILE = { id: 'amari', displayName: 'Amari', ageBand: '5-6', createdAt: new Date().toISOString() };
const validAgeBand = (value) => ['3-4', '5-6', '7-8'].includes(value) ? value : '5-6';
const unsafeMetadataKeys = new Set(['__proto__', 'prototype', 'constructor']);
const safeExtras = (record, knownKeys) => Object.fromEntries(Object.entries(record || {})
  .filter(([key]) => !knownKeys.has(key) && !unsafeMetadataKeys.has(key)));
const PROFILE_FIELDS = new Set(['id', 'displayName', 'ageBand', 'createdAt']);
const SERIES_FIELDS = new Set(['id', 'name', 'appearance', 'personality', 'visualStyle', 'friendsWorld', 'approved', 'updatedAt']);
const normaliseProfile = (profile, index = 0) => ({
  ...safeExtras(profile, PROFILE_FIELDS),
  id: typeof profile?.id === 'string' && profile.id ? profile.id : index === 0 ? 'amari' : `child-${Date.now()}-${index}`,
  displayName: typeof profile?.displayName === 'string' && profile.displayName.trim() ? profile.displayName.trim().slice(0, 40) : index === 0 ? 'Amari' : `Child ${index + 1}`,
  ageBand: validAgeBand(profile?.ageBand),
  createdAt: profile?.createdAt || new Date().toISOString(),
});

const readLegacyProfiles = () => {
  try {
    const storage = window.localStorage;
    if (!storage || typeof storage.getItem !== 'function') return { available: false, profiles: [] };
    const raw = storage.getItem('amari_storybook_profiles_v1');
    if (raw !== null) {
      if (typeof raw !== 'string' || !raw.trim()) return { available: false, profiles: [] };
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || !parsed.length || parsed.some((profile) => !profile || typeof profile !== 'object' || Array.isArray(profile)
        || (profile.id !== undefined && (typeof profile.id !== 'string' || !profile.id.trim()))
        || (profile.displayName !== undefined && typeof profile.displayName !== 'string')
        || (profile.ageBand !== undefined && !['3-4', '5-6', '7-8'].includes(profile.ageBand))
        || (profile.createdAt !== undefined && typeof profile.createdAt !== 'string'))) return { available: false, profiles: [] };
      const profiles = parsed.map(normaliseProfile);
      if (new Set(profiles.map((profile) => profile.id)).size !== profiles.length) return { available: false, profiles: [] };
      return { available: true, profiles };
    }
    const learningRaw = storage.getItem('amari_child_learning_profile_v1');
    const learning = learningRaw === null ? {} : JSON.parse(learningRaw);
    if (!learning || typeof learning !== 'object' || Array.isArray(learning)) return { available: false, profiles: [] };
    return { available: true, profiles: [normaliseProfile({ ...DEFAULT_PROFILE, ageBand: validAgeBand(learning.ageBand) })] };
  } catch { return { available: false, profiles: [] }; }
};

const migrateProfilesIfEmpty = async (legacyProfiles) => {
  const migrated = await transaction(PROFILES_STORE, 'readwrite', (store) => new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const existing = Array.isArray(request.result) ? request.result : [];
      if (existing.length) { resolve({ profiles: existing.map(normaliseProfile), migrated: false }); return; }
      legacyProfiles.forEach((profile) => store.add(profile));
      resolve({ profiles: legacyProfiles, migrated: true });
    };
    request.onerror = () => reject(request.error || new Error('Could not check saved reader profiles before migration.'));
  }));
  if (!migrated) return null;
  if (!migrated.migrated) return { available: true, profiles: migrated.profiles };
  const verified = await transaction(PROFILES_STORE, 'readonly', (store) => requestResult(store.getAll()));
  if (!Array.isArray(verified) || verified.length !== legacyProfiles.length) return null;
  const byId = new Map(verified.map((profile) => [profile.id, normaliseProfile(profile)]));
  const allVerified = legacyProfiles.every((profile) => JSON.stringify(byId.get(profile.id)) === JSON.stringify(profile));
  return allVerified ? { available: true, profiles: verified.map(normaliseProfile) } : null;
};

export const getChildProfiles = async () => {
  const inventory = await getChildProfilesInventory();
  return inventory.available ? inventory.profiles : [];
};

export const getChildProfilesInventory = async () => {
  let profiles;
  try {
    profiles = await transaction(PROFILES_STORE, 'readonly', (store) => requestResult(store.getAll()));
  } catch { return { available: false, profiles: [] }; }
  if (!Array.isArray(profiles)) return { available: false, profiles: [] };
  if (profiles.length) return { available: true, profiles: profiles.map(normaliseProfile) };
  const legacy = readLegacyProfiles();
  if (!legacy.available) return { available: false, profiles: [] };
  try { return await migrateProfilesIfEmpty(legacy.profiles) || { available: false, profiles: [] }; }
  catch { return { available: false, profiles: [] }; }
};

export const saveChildProfile = async (profile) => {
  const normalised = normaliseProfile(profile);
  const result = await transaction(PROFILES_STORE, 'readwrite', (store) => requestResult(store.put(normalised))).catch(() => null);
  if (result === null) return false;
  try {
    const profiles = JSON.parse(window.localStorage.getItem('amari_storybook_profiles_v1') || '[]');
    const next = Array.isArray(profiles) ? profiles.filter((item) => item.id !== normalised.id) : [];
    next.push(normalised);
    window.localStorage.setItem('amari_storybook_profiles_v1', JSON.stringify(next));
  } catch { /* IndexedDB remains the primary store */ }
  return true;
};

export const deleteChildProfile = async (profile) => {
  if (!profile?.id) return false;
  const result = await transaction(PROFILES_STORE, 'readwrite', (store) => requestResult(store.delete(profile.id))).catch(() => null);
  if (result === null) return false;
  try {
    const profiles = JSON.parse(window.localStorage.getItem('amari_storybook_profiles_v1') || '[]');
    if (Array.isArray(profiles)) window.localStorage.setItem('amari_storybook_profiles_v1', JSON.stringify(profiles.filter((item) => item.id !== profile.id)));
  } catch { /* IndexedDB remains the primary store */ }
  return true;
};

export const getStorySeries = async () => {
  const result = await transaction(SERIES_STORE, 'readonly', (store) => requestResult(store.getAll())).catch(() => null);
  return Array.isArray(result) ? result : [];
};

export const getStorySeriesInventory = async () => {
  try {
    const series = await transaction(SERIES_STORE, 'readonly', (store) => requestResult(store.getAll()));
    return Array.isArray(series) ? { available: true, series } : { available: false, series: [] };
  } catch { return { available: false, series: [] }; }
};

export const saveStorySeries = async (series) => {
  if (!series?.id || !series?.name) return false;
  const result = await transaction(SERIES_STORE, 'readwrite', (store) => requestResult(store.put({
    ...safeExtras(series, SERIES_FIELDS),
    id: series.id,
    name: String(series.name).trim().slice(0, 80),
    appearance: String(series.appearance || '').trim().slice(0, 600),
    personality: String(series.personality || '').trim().slice(0, 400),
    visualStyle: String(series.visualStyle || '3d'),
    friendsWorld: String(series.friendsWorld || '').trim().slice(0, 600),
    approved: Boolean(series.approved),
    updatedAt: new Date().toISOString(),
  }))).catch(() => null);
  return result !== null;
};
