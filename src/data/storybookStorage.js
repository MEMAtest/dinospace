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
  databasePromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(BOOKS_STORE)) database.createObjectStore(BOOKS_STORE, { keyPath: 'id' });
      if (!database.objectStoreNames.contains(ASSETS_STORE)) database.createObjectStore(ASSETS_STORE, { keyPath: 'key' });
      if (!database.objectStoreNames.contains(PROFILES_STORE)) database.createObjectStore(PROFILES_STORE, { keyPath: 'id' });
      if (!database.objectStoreNames.contains(SERIES_STORE)) database.createObjectStore(SERIES_STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open storybook storage'));
  }).catch(() => null);
  return databasePromise;
};

const requestResult = (request) => new Promise((resolve, reject) => {
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error || new Error('Storybook storage request failed'));
});

const transaction = async (storeName, mode, action) => {
  const database = await openDatabase();
  if (!database) return null;
  const store = database.transaction(storeName, mode).objectStore(storeName);
  return action(store);
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

export const getStoryBookRecord = async (id) => transaction(BOOKS_STORE, 'readonly', (store) => requestResult(store.get(id))).catch(() => null);

export const saveStoryAsset = async (key, blob) => {
  if (!key || !blob) return false;
  const result = await transaction(ASSETS_STORE, 'readwrite', (store) => requestResult(store.put({ key, blob, type: blob.type || 'application/octet-stream' }))).catch(() => null);
  return result !== null;
};

export const getStoryAsset = async (key) => {
  if (!key) return null;
  const result = await transaction(ASSETS_STORE, 'readonly', (store) => requestResult(store.get(key))).catch(() => null);
  return result?.blob || null;
};

export const deleteStoryBook = async (book) => {
  if (!book?.id) return false;
  const database = await openDatabase();
  if (!database) return false;
  return new Promise((resolve) => {
    const tx = database.transaction([BOOKS_STORE, ASSETS_STORE], 'readwrite');
    tx.objectStore(BOOKS_STORE).delete(book.id);
    [book.coverAssetKey, book.coverAudioAssetKey, ...(book.pages || []).flatMap((page) => [page.imageAssetKey, page.audioAssetKey])]
      .filter(Boolean)
      .forEach((key) => tx.objectStore(ASSETS_STORE).delete(key));
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => resolve(false);
  });
};

const DEFAULT_PROFILE = { id: 'amari', displayName: 'Amari', ageBand: '5-6', createdAt: new Date().toISOString() };
const validAgeBand = (value) => ['3-4', '5-6', '7-8'].includes(value) ? value : '5-6';
const normaliseProfile = (profile, index = 0) => ({
  id: typeof profile?.id === 'string' && profile.id ? profile.id : index === 0 ? 'amari' : `child-${Date.now()}-${index}`,
  displayName: typeof profile?.displayName === 'string' && profile.displayName.trim() ? profile.displayName.trim().slice(0, 40) : index === 0 ? 'Amari' : `Child ${index + 1}`,
  ageBand: validAgeBand(profile?.ageBand),
  createdAt: profile?.createdAt || new Date().toISOString(),
});

const migrateProfiles = () => {
  try {
    const raw = window.localStorage.getItem('amari_storybook_profiles_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed.map(normaliseProfile);
    }
    const learning = JSON.parse(window.localStorage.getItem('amari_child_learning_profile_v1') || '{}');
    return [normaliseProfile({ ...DEFAULT_PROFILE, ageBand: learning.ageBand === '3-4' ? '3-4' : learning.ageBand === '7-8' ? '7-8' : '5-6' })];
  } catch { return [DEFAULT_PROFILE]; }
};

export const getChildProfiles = async () => {
  const result = await transaction(PROFILES_STORE, 'readonly', (store) => requestResult(store.getAll())).catch(() => null);
  if (Array.isArray(result) && result.length) return result.map(normaliseProfile);
  const migrated = migrateProfiles();
  await Promise.all(migrated.map((profile) => saveChildProfile(profile)));
  return migrated;
};

export const saveChildProfile = async (profile) => {
  const normalised = normaliseProfile(profile);
  const result = await transaction(PROFILES_STORE, 'readwrite', (store) => requestResult(store.put(normalised))).catch(() => null);
  try {
    const profiles = JSON.parse(window.localStorage.getItem('amari_storybook_profiles_v1') || '[]');
    const next = Array.isArray(profiles) ? profiles.filter((item) => item.id !== normalised.id) : [];
    next.push(normalised);
    window.localStorage.setItem('amari_storybook_profiles_v1', JSON.stringify(next));
  } catch { /* IndexedDB remains the primary store */ }
  return result !== null || normalised;
};

export const deleteChildProfile = async (profile) => {
  if (!profile?.id) return false;
  const result = await transaction(PROFILES_STORE, 'readwrite', (store) => requestResult(store.delete(profile.id))).catch(() => null);
  try {
    const profiles = JSON.parse(window.localStorage.getItem('amari_storybook_profiles_v1') || '[]');
    if (Array.isArray(profiles)) window.localStorage.setItem('amari_storybook_profiles_v1', JSON.stringify(profiles.filter((item) => item.id !== profile.id)));
  } catch { /* IndexedDB remains the primary store */ }
  return result === undefined || result !== null;
};

export const getStorySeries = async () => {
  const result = await transaction(SERIES_STORE, 'readonly', (store) => requestResult(store.getAll())).catch(() => null);
  return Array.isArray(result) ? result : [];
};

export const saveStorySeries = async (series) => {
  if (!series?.id || !series?.name) return false;
  const result = await transaction(SERIES_STORE, 'readwrite', (store) => requestResult(store.put({
    ...series,
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
