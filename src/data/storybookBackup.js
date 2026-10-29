export const STORYBOOK_BACKUP_FORMAT = 'amari-storybooks';
export const STORYBOOK_BACKUP_VERSION = 1;
export const STORYBOOK_BACKUP_MAX_BYTES = 120 * 1024 * 1024;
const MAX_BOOKS = 20;
const MAX_ASSETS = MAX_BOOKS * 22; // cover + cover narration + ten images + ten narrations
const UNSAFE_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

const assetRefsFor = (book) => [
  [book.coverAssetKey, 'image'],
  [book.coverAudioAssetKey, 'audio'],
  ...book.pages.flatMap((page) => [[page.imageAssetKey, 'image'], [page.audioAssetKey, 'audio']]),
];
const safeJsonValue = (value, depth = 0) => {
  if (depth > 24) return undefined;
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (Array.isArray(value)) return value.map((item) => safeJsonValue(item, depth + 1) ?? null);
  if (!value || typeof value !== 'object') return undefined;
  const cleaned = {};
  for (const [key, item] of Object.entries(value)) {
    if (UNSAFE_KEYS.has(key)) continue;
    const safeValue = safeJsonValue(item, depth + 1);
    if (safeValue !== undefined) cleaned[key] = safeValue;
  }
  return cleaned;
};
const blobToBase64 = async (blob) => {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
};

const base64ToBlob = (base64, type) => {
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64)) {
    throw new Error('This story backup contains a damaged picture or narration file.');
  }
  const binary = atob(base64);
  if (!binary.length) throw new Error('This story backup contains an empty picture or narration file.');
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type });
};

const validAssetKey = (key, id, suffix) => typeof key === 'string'
  && key.startsWith(`${id}:`) && key.length <= 220 && key.endsWith(suffix);
const validBook = (book) => book && typeof book === 'object' && !Array.isArray(book)
  && book.custom === true
  && typeof book.id === 'string' && /^custom-[a-zA-Z0-9-]{1,140}$/.test(book.id)
  && book.slug === book.id
  && typeof book.title === 'string' && book.title.trim().length > 0 && book.title.length <= 120
  && ['3-4', '5-6', '7-8'].includes(book.ageBand)
  && Array.isArray(book.pages) && book.pages.length >= 1 && book.pages.length <= 10
  && validAssetKey(book.coverAssetKey, book.id, ':cover')
  && validAssetKey(book.coverAudioAssetKey, book.id, ':cover-audio')
  && book.pages.every((page, index) => page && typeof page === 'object' && !Array.isArray(page)
    && page.number === index + 1
    && typeof page.title === 'string' && page.title.trim().length > 0 && page.title.length <= 120
    && typeof page.text === 'string' && page.text.trim().length > 0 && page.text.length <= 3000
    && validAssetKey(page.imageAssetKey, book.id, `:page-${index + 1}:image`)
    && validAssetKey(page.audioAssetKey, book.id, `:page-${index + 1}:audio`));

const safeProgress = (progress) => {
  if (!progress || typeof progress !== 'object' || Array.isArray(progress)) return {};
  const source = safeJsonValue(progress) || {};
  const cleaned = {};
  for (const [childId, childItems] of Object.entries(source)) {
    if (UNSAFE_KEYS.has(childId) || !childId || childId.length > 120 || !childItems || typeof childItems !== 'object' || Array.isArray(childItems)) continue;
    const childProgress = {};
    for (const [slug, value] of Object.entries(childItems)) {
      if (UNSAFE_KEYS.has(slug) || slug.length > 160) continue;
      if (!value || typeof value !== 'object' || Array.isArray(value)) { childProgress[slug] = value; continue; }
      if (!['pageIndex', 'completed', 'favourite', 'lastReadAt'].some((key) => Object.hasOwn(value, key))) {
        childProgress[slug] = value;
        continue;
      }
      const pageIndex = Number.isInteger(value.pageIndex) ? Math.max(-1, Math.min(10, value.pageIndex)) : -1;
      const normalised = {
        ...value,
        pageIndex,
        completed: value.completed === true,
        favourite: value.favourite === true,
      };
      if (typeof value.lastReadAt === 'string') normalised.lastReadAt = value.lastReadAt.slice(0, 40);
      else delete normalised.lastReadAt;
      childProgress[slug] = normalised;
    }
    cleaned[childId] = childProgress;
  }
  return cleaned;
};

export const assertValidStorybookRecords = ({ books, assets }) => {
  if (!Array.isArray(books) || !books.length || books.length > MAX_BOOKS || !Array.isArray(assets) || assets.length > MAX_ASSETS
    || !books.every(validBook) || new Set(books.map((book) => book.id)).size !== books.length) {
    throw new Error('This story backup contains an invalid saved story.');
  }
  const expected = new Map(books.flatMap((book) => assetRefsFor(book)));
  const seen = new Set();
  for (const asset of assets) {
    const type = asset?.blob?.type || '';
    if (!asset || typeof asset.key !== 'string' || !expected.has(asset.key) || seen.has(asset.key)
      || !(asset.blob instanceof Blob) || !asset.blob.size
      || typeof type !== 'string' || !type.startsWith(`${expected.get(asset.key)}/`)
      || (asset.blob.type && asset.type && asset.blob.type !== asset.type)) {
      throw new Error('This story backup contains a mismatched picture or narration file.');
    }
    seen.add(asset.key);
  }
  if (seen.size !== expected.size) throw new Error('This story backup is missing a picture or narration file.');
  return true;
};

export const createStorybookBackup = async ({ books = [], assets = [], progress = {} }) => {
  if (!Array.isArray(books) || !Array.isArray(assets)) throw new Error('A saved story is incomplete and cannot be backed up.');
  const customBooks = books.filter((book) => book?.custom === true);
  if (!customBooks.length) throw new Error('There are no saved custom stories to back up yet.');
  if (customBooks.length > MAX_BOOKS || !customBooks.every(validBook) || new Set(customBooks.map((book) => book.id)).size !== customBooks.length) throw new Error('A saved story is incomplete and cannot be backed up.');
  const needed = new Map(customBooks.flatMap((book) => assetRefsFor(book)));
  const assetMap = new Map(assets.map(({ key, blob }) => [key, blob]));
  if (assetMap.size !== assets.length) throw new Error('Saved stories contain duplicate picture or narration files.');
  const exportedAssets = [];
  for (const [key, expectedType] of needed) {
    const blob = assetMap.get(key);
    const type = blob?.type || (expectedType === 'image' ? 'image/png' : 'audio/mpeg');
    if (!(blob instanceof Blob) || !blob.size || !type.startsWith(`${expectedType}/`)) {
      throw new Error('A saved story is missing a picture or narration file and cannot be backed up.');
    }
    exportedAssets.push({ key, type, base64: await blobToBase64(blob) });
  }
  const payload = { format: STORYBOOK_BACKUP_FORMAT, version: STORYBOOK_BACKUP_VERSION, exportedAt: new Date().toISOString(), books: customBooks, assets: exportedAssets, progress: safeProgress(progress) };
  const result = JSON.stringify(payload);
  if (new Blob([result]).size > STORYBOOK_BACKUP_MAX_BYTES) throw new Error('This story collection is too large for one backup file.');
  return result;
};

export const readStorybookBackup = (serialized) => {
  if (typeof serialized !== 'string' || new Blob([serialized]).size > STORYBOOK_BACKUP_MAX_BYTES) {
    throw new Error('This story backup is too large or is not a valid backup file.');
  }
  let payload;
  try { payload = JSON.parse(serialized, (key, value) => UNSAFE_KEYS.has(key) ? undefined : value); } catch { throw new Error('This file is not a readable story backup.'); }
  if (!payload || typeof payload !== 'object' || payload.format !== STORYBOOK_BACKUP_FORMAT || payload.version !== STORYBOOK_BACKUP_VERSION
    || !Array.isArray(payload.books) || !payload.books.length || payload.books.length > MAX_BOOKS
    || !Array.isArray(payload.assets) || payload.assets.length > MAX_ASSETS) {
    throw new Error('This is not a supported Amari story backup.');
  }
  if (!payload.books.every(validBook) || new Set(payload.books.map((book) => book.id)).size !== payload.books.length) throw new Error('This story backup contains an invalid saved story.');
  const expected = new Map(payload.books.flatMap((book) => assetRefsFor(book)));
  const seen = new Set();
  const assets = payload.assets.map((asset) => {
    if (!asset || typeof asset.key !== 'string' || !expected.has(asset.key) || seen.has(asset.key)
      || typeof asset.type !== 'string' || !/^(image|audio)\/[a-z0-9.+-]+$/i.test(asset.type)
      || !asset.type.startsWith(`${expected.get(asset.key)}/`) || typeof asset.base64 !== 'string') {
      throw new Error('This story backup contains a mismatched picture or narration file.');
    }
    seen.add(asset.key);
    return { key: asset.key, blob: base64ToBlob(asset.base64, asset.type) };
  });
  if (seen.size !== expected.size) throw new Error('This story backup is missing a picture or narration file.');
  assertValidStorybookRecords({ books: payload.books, assets });
  return { books: payload.books, assets, progress: safeProgress(payload.progress) };
};
