async (page, { key, mode, count = 1 }) => page.evaluate(({ key, mode, count }) => {
  if (window.__amariQaNamespaced !== true) throw new Error('Refusing fault injection without the retained QA namespace');
  if (!/^amari_(?:curriculum_|rewards_v2$)/.test(key)) throw new Error(`Storage fault key is outside the Amari Pair10 allowlist: ${key}`);
  if (!['throw-before-write', 'stale-readback', 'throw-on-read'].includes(mode)) throw new Error(`Unknown bounded storage fault mode: ${mode}`);
  if (!Number.isInteger(count) || count < 1 || count > 3) throw new Error(`Invalid bounded storage-fault count: ${count}`);
  if (window.__pair10CurriculumStorageFaultV1) throw new Error('A Pair10 storage fault is already armed');

  const proto = Storage.prototype;
  const originalSet = proto.setItem;
  const originalGet = proto.getItem;
  const storage = window.localStorage;
  const beforeRaw = originalGet.call(storage, key);
  const fault = { key, mode, beforeRaw, attemptedValue: null, consumed: false, committedWrite: false, readFaultRemaining: count };
  let setWrapper;
  let getWrapper;
  const restore = () => {
    if (proto.setItem === setWrapper) proto.setItem = originalSet;
    if (proto.getItem === getWrapper) proto.getItem = originalGet;
    window.__pair10CurriculumLastFaultV1 = {
      key, mode, consumed: fault.consumed, committedWrite: fault.committedWrite,
      beforeRaw: fault.beforeRaw, attemptedValue: fault.attemptedValue,
    };
    delete window.__pair10CurriculumStorageFaultV1;
  };
  fault.disarm = restore;
  window.__pair10CurriculumStorageFaultV1 = fault;

  if (mode === 'throw-on-read') {
    getWrapper = function (readKey) {
      if (readKey !== key || fault.readFaultRemaining <= 0) return originalGet.call(this, readKey);
      fault.consumed = true;
      fault.readFaultRemaining -= 1;
      if (fault.readFaultRemaining <= 0) restore();
      throw new DOMException('Bounded Pair10 QA read fault', 'SecurityError');
    };
    proto.getItem = getWrapper;
    return { armed: true, key, mode, count };
  }

  setWrapper = function (candidateKey, value) {
    if (candidateKey !== key || fault.consumed) return originalSet.call(this, candidateKey, value);
    fault.consumed = true;
    fault.attemptedValue = String(value);
    if (mode === 'throw-before-write') {
      restore();
      throw new DOMException('Bounded Pair10 QA write fault', 'QuotaExceededError');
    }
    originalSet.call(this, candidateKey, value);
    fault.committedWrite = true;
    getWrapper = function (readKey) {
      if (readKey !== key) return originalGet.call(this, readKey);
      const staleValue = beforeRaw;
      restore();
      return staleValue;
    };
    proto.getItem = getWrapper;
    return undefined;
  };
  proto.setItem = setWrapper;
  return { armed: true, key, mode, beforeRaw };
}, { key, mode, count });
