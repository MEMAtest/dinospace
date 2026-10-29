const unavailableScreen = (stale = false) => ({ available: false, image: null, audio: null, missingKeys: [], ...(stale ? { stale: true } : {}) });

/**
 * Creates a bounded object-URL cache for Storybook cards and one open reader.
 * `readAsset` must return `{ available, blob }`, matching getStoryAssetInventory.
 */
export const createStorybookHydrator = ({
  readAsset,
  createObjectURL = (blob) => URL.createObjectURL(blob),
  revokeObjectURL = (url) => URL.revokeObjectURL(url),
} = {}) => {
  if (typeof readAsset !== 'function') throw new TypeError('Storybook hydration needs a readAsset function.');

  const assets = new Map();
  const coverKeys = new Set();
  const readerScreens = new Map();
  let coverPolicySet = false;
  let disposed = false;

  const isRetained = (key) => coverKeys.has(key)
    || [...readerScreens.values()].some((screen) => screen.keys.includes(key));

  const releaseUnused = () => {
    for (const [key, asset] of assets) {
      if (asset.state !== 'ready' || isRetained(key)) continue;
      try { revokeObjectURL(asset.url); } catch { /* best-effort URL cleanup */ }
      assets.delete(key);
    }
  };

  const read = (key) => {
    if (!key) return Promise.resolve({ available: true, missing: false, url: null, key: null });
    if (disposed) return Promise.resolve({ available: false, missing: false, url: null, key, stale: true });
    const cached = assets.get(key);
    if (cached?.state === 'ready') return Promise.resolve(cached);
    if (cached?.state === 'pending') return cached.promise;

    const pending = { state: 'pending', promise: null };
    pending.promise = Promise.resolve()
      .then(() => readAsset(key))
      .catch(() => ({ available: false, blob: null }))
      .then((result) => {
        if (disposed || assets.get(key) !== pending) {
          if (assets.get(key) === pending) assets.delete(key);
          return { available: false, missing: false, url: null, key, stale: true };
        }
        if (!result || result.available !== true) {
          assets.delete(key); // storage may recover; do not cache unavailable reads
          return { available: false, missing: false, url: null, key };
        }
        if (!result.blob) {
          assets.delete(key); // a missing asset may be repaired later
          return { available: true, missing: true, url: null, key };
        }
        if (!isRetained(key)) {
          assets.delete(key);
          return { available: true, missing: false, url: null, key, stale: true };
        }
        let url;
        try { url = createObjectURL(result.blob); } catch {
          assets.delete(key);
          return { available: true, missing: false, url: null, key, error: true };
        }
        const ready = { state: 'ready', available: true, missing: false, url, key };
        assets.set(key, ready);
        return ready;
      });
    assets.set(key, pending);
    return pending.promise;
  };

  const combine = (imageKey, audioKey, imageResult, audioResult, stale = false) => {
    const results = [imageResult, audioResult].filter(Boolean);
    const missingKeys = results.filter((result) => result.available && result.missing && result.key).map((result) => result.key);
    return {
      available: results.every((result) => result.available),
      image: imageKey ? imageResult?.url || null : null,
      audio: audioKey ? audioResult?.url || null : null,
      missingKeys,
      ...(stale ? { stale: true } : {}),
    };
  };

  const loadCover = async (book) => {
    if (disposed) return unavailableScreen(true);
    const imageKey = typeof book?.coverAssetKey === 'string' ? book.coverAssetKey : '';
    if (!imageKey) return { available: true, image: null, audio: null, missingKeys: [] };
    if (coverPolicySet && !coverKeys.has(imageKey)) return { available: true, image: null, audio: null, missingKeys: [], stale: true };
    coverKeys.add(imageKey);
    const result = await read(imageKey);
    const stale = disposed || !coverKeys.has(imageKey);
    return combine(imageKey, '', result, null, stale);
  };

  const loadScreen = async (book, index = -1) => {
    if (disposed) return unavailableScreen(true);
    if (!book || typeof book.id !== 'string' || !book.id) throw new TypeError('A Storybook screen needs a saved book record.');
    let imageKey;
    let audioKey;
    if (index === -1) {
      imageKey = book.coverAssetKey;
      audioKey = book.coverAudioAssetKey;
    } else {
      if (!Number.isInteger(index) || index < 0 || index >= (book.pages || []).length) throw new RangeError('The requested story page does not exist.');
      imageKey = book.pages[index]?.imageAssetKey;
      audioKey = book.pages[index]?.audioAssetKey;
    }
    imageKey = typeof imageKey === 'string' ? imageKey : '';
    audioKey = typeof audioKey === 'string' ? audioKey : '';
    const keys = [...new Set([imageKey, audioKey].filter(Boolean))];
    const screenKey = `${book.id}:${index}`;
    const prior = readerScreens.get(screenKey);
    if (prior && !prior.done) {
      readerScreens.delete(screenKey);
      readerScreens.set(screenKey, prior);
      return prior.promise;
    }

    const screen = { keys, done: false, promise: null };
    readerScreens.delete(screenKey);
    readerScreens.set(screenKey, screen);
    while (readerScreens.size > 2) readerScreens.delete(readerScreens.keys().next().value);
    releaseUnused();

    screen.promise = Promise.all([
      imageKey ? read(imageKey) : Promise.resolve(null),
      audioKey ? read(audioKey) : Promise.resolve(null),
    ]).then(([imageResult, audioResult]) => {
      screen.done = true;
      const stale = disposed || readerScreens.get(screenKey) !== screen;
      if (stale) return combine(imageKey, audioKey, imageResult, audioResult, true);
      return combine(imageKey, audioKey, imageResult, audioResult);
    });
    return screen.promise;
  };

  const retainCovers = (keys) => {
    coverPolicySet = true;
    coverKeys.clear();
    for (const key of (Array.isArray(keys) ? keys : [])) if (typeof key === 'string' && key) coverKeys.add(key);
    releaseUnused();
  };

  const releaseReader = () => {
    readerScreens.clear();
    releaseUnused();
  };

  const invalidateAsset = (key) => {
    const asset = assets.get(key);
    if (asset?.state === 'ready') {
      try { revokeObjectURL(asset.url); } catch { /* best-effort URL cleanup */ }
    }
    assets.delete(key);
    for (const [screenKey, screen] of readerScreens) {
      if (screen.keys.includes(key)) readerScreens.delete(screenKey);
    }
    releaseUnused();
  };

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    coverKeys.clear();
    readerScreens.clear();
    releaseUnused();
    // Pending entries have no URL yet; their completion observes `disposed`.
    for (const [key, asset] of assets) if (asset.state === 'pending') assets.delete(key);
  };

  return { loadCover, loadScreen, retainCovers, releaseReader, invalidateAsset, dispose };
};
