export const storyAssetInventory = (book) => [
  { key: book?.coverAssetKey, kind: 'image', label: 'cover picture' },
  { key: book?.coverAudioAssetKey, kind: 'audio', label: 'cover recording' },
  ...(book?.pages || []).flatMap((page, index) => [
    { key: page.imageAssetKey, kind: 'image', label: `page ${index + 1} picture` },
    { key: page.audioAssetKey, kind: 'audio', label: `page ${index + 1} recording` },
  ]),
];

export const isUsableStoryBlob = (blob, kind) => Boolean(
  blob && blob.size > 0 && (kind === 'image' ? /^image\//i : /^audio\//i).test(blob.type || ''),
);

export const validateStoryMediaBlob = async (blob, kind, signal, timeoutMs = 15000) => {
  if (!isUsableStoryBlob(blob, kind)) throw new Error(`A saved story ${kind} is missing or has an invalid file type.`);
  if (typeof document === 'undefined' || typeof URL.createObjectURL !== 'function') return true;
  const url = URL.createObjectURL(blob);
  try {
    await new Promise((resolve, reject) => {
      let done = false;
      const media = kind === 'image' ? new Image() : document.createElement('audio');
      const finish = (error) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        signal?.removeEventListener('abort', abort);
        media.onload = null;
        media.onerror = null;
        media.onloadedmetadata = null;
        media.oncanplay = null;
        if (error) reject(error); else resolve();
      };
      const abort = () => finish(signal.reason || new DOMException('Story creation was paused.', 'AbortError'));
      const timer = setTimeout(() => finish(new Error(`A saved story ${kind} could not be checked in time.`)), timeoutMs);
      if (signal?.aborted) { abort(); return; }
      signal?.addEventListener('abort', abort, { once: true });
      if (kind === 'image') {
        media.onload = () => media.naturalWidth > 0 && media.naturalHeight > 0 ? finish() : finish(new Error('A saved story picture could not be decoded.'));
        media.onerror = () => finish(new Error('A saved story picture could not be decoded.'));
        media.src = url;
      } else {
        media.preload = 'metadata';
        media.onloadedmetadata = () => Number.isFinite(media.duration) && media.duration > 0
          ? finish()
          : finish(new Error('A saved story recording has no playable audio.'));
        media.onerror = () => finish(new Error('A saved story recording could not be decoded.'));
        media.src = url;
        media.load();
      }
    });
    return true;
  } finally {
    URL.revokeObjectURL(url);
  }
};

// Validate every incoming backup asset before its caller starts a storage
// transaction. Workers are deliberately bounded, and a failed decode aborts
// and settles the remaining validators before the caller can continue.
export const validateStoryMediaAssets = async (
  assets,
  { signal, concurrency = 3, validator = validateStoryMediaBlob } = {},
) => {
  if (!Array.isArray(assets)) throw new Error('The story backup has an invalid media list.');
  if (!assets.length) return true;
  const limit = Math.max(1, Math.min(3, Math.floor(concurrency) || 1, assets.length));
  const controller = new AbortController();
  const forwardAbort = () => controller.abort(signal.reason || new DOMException('Story backup validation was cancelled.', 'AbortError'));
  if (signal?.aborted) forwardAbort();
  else signal?.addEventListener('abort', forwardAbort, { once: true });

  let nextIndex = 0;
  let failure = null;
  const worker = async () => {
    while (!controller.signal.aborted) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= assets.length) return;
      const asset = assets[index];
      try {
        if (!asset || !['image', 'audio'].includes(asset.kind)) throw new Error('The story backup contains an invalid picture or narration entry.');
        await validator(asset.blob, asset.kind, controller.signal);
      } catch (error) {
        if (!failure) {
          failure = error;
          controller.abort(error);
        }
        return;
      }
    }
  };

  try {
    await Promise.all(Array.from({ length: limit }, worker));
    if (failure) throw failure;
    if (signal?.aborted) throw signal.reason || new DOMException('Story backup validation was cancelled.', 'AbortError');
    return true;
  } finally {
    signal?.removeEventListener('abort', forwardAbort);
  }
};
