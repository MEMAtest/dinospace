async (page) => {
  await page.route('**/api/voice**', route => route.fulfill({ status: 403, body: 'isolated QA block' }));
  await page.route('**/api/story/**', route => route.fulfill({ status: 403, body: 'isolated QA block' }));
  await page.addInitScript(() => {
    window.__skyMediaEvents = [];
    const record = (kind, el, extra = {}) => window.__skyMediaEvents.push({ at: new Date().toISOString(), kind, src: el.currentSrc || el.src || '', currentTime: Number.isFinite(el.currentTime) ? Number(el.currentTime.toFixed(3)) : null, duration: Number.isFinite(el.duration) ? Number(el.duration.toFixed(3)) : null, ...extra });
    const attach = el => {
      if (el.__skyObserved) return el;
      Object.defineProperty(el, '__skyObserved', { value: true });
      for (const kind of ['loadstart', 'loadedmetadata', 'play', 'playing', 'pause', 'ended', 'error', 'abort', 'stalled']) el.addEventListener(kind, () => record(kind, el, { error: el.error ? { code: el.error.code, message: el.error.message } : null }));
      return el;
    };
    const NativeAudio = window.Audio;
    window.Audio = new Proxy(NativeAudio, { construct(target, args) { return attach(Reflect.construct(target, args, target)); } });
    const nativePlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...args) { record('play-call', this); return nativePlay.apply(this, args); };
  });
  await page.goto('http://127.0.0.1:5196/');
}
