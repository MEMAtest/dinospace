async (page, { key, mode }) => page.evaluate(({ key, mode }) => {
  if (window.__amariQaNamespaced !== true) throw new Error('Refusing German fault injection without the retained QA namespace');
  if (!['amari_german_chapter_progress_v1', 'amari_rewards_v2'].includes(key)) throw new Error(`German fault key is outside the exact pair allowlist: ${key}`);
  if (!['throw-before-write', 'stale-readback'].includes(mode)) throw new Error(`Unknown bounded German fault mode: ${mode}`);
  if (window.__pair10GermanStorageFaultV1) throw new Error('A Pair10 German storage fault is already armed');

  const proto = Storage.prototype;
  const originalSet = proto.setItem;
  const originalGet = proto.getItem;
  const storage = window.localStorage;
  const beforeRaw = originalGet.call(storage, key);
  const fault = { key, mode, beforeRaw, consumed: false, committedWrite: false };
  let setWrapper;
  let getWrapper;
  const restore = () => {
    if (proto.setItem === setWrapper) proto.setItem = originalSet;
    if (proto.getItem === getWrapper) proto.getItem = originalGet;
    window.__pair10GermanLastFaultV1 = {
      key, mode, beforeRaw, consumed: fault.consumed, committedWrite: fault.committedWrite,
    };
    delete window.__pair10GermanStorageFaultV1;
  };
  fault.disarm = restore;
  window.__pair10GermanStorageFaultV1 = fault;
  setWrapper = function (candidateKey, value) {
    if (candidateKey !== key || fault.consumed) return originalSet.call(this, candidateKey, value);
    fault.consumed = true;
    if (mode === 'throw-before-write') {
      restore();
      throw new DOMException('Bounded German QA write fault', 'QuotaExceededError');
    }
    originalSet.call(this, candidateKey, value);
    fault.committedWrite = true;
    getWrapper = function (readKey) {
      if (readKey !== key) return originalGet.call(this, readKey);
      restore();
      return beforeRaw;
    };
    proto.getItem = getWrapper;
    return undefined;
  };
  proto.setItem = setWrapper;
  return { armed: true, key, mode, beforeRaw };
}, { key, mode });
