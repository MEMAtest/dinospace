const DB_NAME = 'amari-storybooks';
const DB_VERSION = 1;
const BOOKS_STORE = 'books';
const ASSETS_STORE = 'assets';

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
