export const withStoryRequestTimeout = async (operation, { signal, timeoutMs, label = 'Story request' } = {}) => {
  const controller = new AbortController();
  let timedOut = false;
  let timer;
  let rejectStop;
  const stopped = new Promise((_, reject) => { rejectStop = reject; });
  const abortFromCaller = () => {
    controller.abort(signal?.reason);
    rejectStop(signal?.reason || new DOMException('Story request cancelled.', 'AbortError'));
  };
  if (signal?.aborted) abortFromCaller();
  else signal?.addEventListener('abort', abortFromCaller, { once: true });
  const timed = timeoutMs > 0 ? new Promise((_, reject) => {
    timer = setTimeout(() => {
      timedOut = true;
      const error = new Error(`${label} took too long. Please try again.`);
      error.name = 'TimeoutError';
      controller.abort(error);
      reject(error);
    }, timeoutMs);
  }) : new Promise(() => {});
  try {
    return await Promise.race([Promise.resolve().then(() => operation(controller.signal)), stopped, timed]);
  } catch (error) {
    if (timedOut) {
      const timeoutError = new Error(`${label} took too long. Please try again.`);
      timeoutError.name = 'TimeoutError';
      throw timeoutError;
    }
    throw error;
  } finally {
    if (timer) clearTimeout(timer);
    signal?.removeEventListener('abort', abortFromCaller);
  }
};
