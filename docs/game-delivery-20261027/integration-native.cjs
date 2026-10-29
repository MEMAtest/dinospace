// Small helpers for bounded cross-game native smoke checks.
// The caller supplies the already-leased Playwright page. This module never
// creates a browser/context/tab, opens an origin, seeds answers, or writes app
// storage. Navigation must happen through a visible UI control.
const PROVIDER_URL = /(?:\/api\/|elevenlabs|openai|text-to-speech|story-provider)/i;

module.exports = function createIntegrationNative(page, {
  origin,
  expectedEntry,
  namespaceFlag = '__amariQaNamespaced',
  minimumTargetSize = 44,
  packagedAudioPaths = ['/audio/'],
  isPackagedAudioUrl = null,
} = {}) {
  if (!page || typeof page.goto !== 'function' || typeof page.evaluate !== 'function') {
    throw new TypeError('Pass the already-leased Playwright page');
  }
  if (!origin || !expectedEntry) throw new TypeError('origin and expectedEntry are required');

  const expectedOrigin = new URL(origin).origin;
  const state = { pageErrors: [], consoleErrors: [], providerAttempts: [], requestErrors: [], responseErrors: [] };
  let installed = false;

  const providerGuard = async route => {
    const url = route.request().url();
    if (PROVIDER_URL.test(url)) {
      state.providerAttempts.push(url);
      await route.fulfill({ status: 403, contentType: 'text/plain', body: 'Blocked by retained-game QA guard' });
      return;
    }
    await route.continue();
  };
  const onPageError = error => state.pageErrors.push(String(error?.message || error));
  const onConsole = message => {
    if (message.type() === 'error') state.consoleErrors.push(message.text());
  };
  const onRequestFailed = request => state.requestErrors.push({ url: request.url(), error: request.failure()?.errorText || 'request failed' });
  const onResponse = response => {
    if (response.status() >= 400) state.responseErrors.push({ url: response.url(), status: response.status() });
  };
  const observeMedia = () => {
    if (window.__retainedIntegrationMediaInstalledV1) return;
    const originalPlay = HTMLMediaElement.prototype.play;
    const records = [];
    const byElement = new WeakMap();
    const state = { originalPlay, records, byElement, wrapper: null };
    window.__retainedIntegrationMediaStateV1 = state;
    window.__retainedIntegrationMediaInstalledV1 = true;
    window.__retainedIntegrationMediaRowsV1 = [];
    const detach = record => {
      for (const [type, listener] of record.listeners) record.element.removeEventListener(type, listener);
      byElement.delete(record.element);
    };
    HTMLMediaElement.prototype.play = function (...args) {
      const media = this;
      let record = byElement.get(media);
      if (!record) {
        const row = { src: media.currentSrc || media.src || '', events: [], element: media };
        const listeners = [];
        record = { row, element: media, listeners };
        const recordEvent = type => {
          row.src = media.currentSrc || media.src || row.src;
          row.events.push({ type, time: Number(media.currentTime) || 0, at: performance.now() });
          if (row.events.length > 64) row.events.shift();
        };
        for (const type of ['play', 'playing', 'timeupdate', 'pause', 'ended', 'error']) {
          const listener = () => recordEvent(type);
          media.addEventListener(type, listener);
          listeners.push([type, listener]);
        }
        byElement.set(media, record);
        records.push(record);
        window.__retainedIntegrationMediaRowsV1.push(row);
        while (records.length > 128) {
          const evicted = records.shift();
          detach(evicted);
          const rows = window.__retainedIntegrationMediaRowsV1;
          const index = rows.indexOf(evicted.row);
          if (index >= 0) rows.splice(index, 1);
        }
      }
      record.row.src = media.currentSrc || media.src || record.row.src;
      record.row.events.push({ type: 'play-call', time: Number(media.currentTime) || 0, at: performance.now() });
      if (record.row.events.length > 64) record.row.events.shift();
      return originalPlay.apply(media, args);
    };
    state.wrapper = HTMLMediaElement.prototype.play;
    state.dispose = () => {
      for (const record of records) detach(record);
      if (HTMLMediaElement.prototype.play === state.wrapper) HTMLMediaElement.prototype.play = originalPlay;
      delete window.__retainedIntegrationMediaRowsV1;
      delete window.__retainedIntegrationMediaStateV1;
      delete window.__retainedIntegrationMediaInstalledV1;
    };
  };

  async function installGuards() {
    if (!installed) {
      installed = true;
      await page.route('**/*', providerGuard);
      page.on('pageerror', onPageError);
      page.on('console', onConsole);
      page.on('requestfailed', onRequestFailed);
      page.on('response', onResponse);
    }
    // Call again after a full reload; no persistent init script is installed.
    // Instrument the currently-open document only.
    await page.evaluate(observeMedia);
  }

  async function assertRuntime() {
    const actual = await page.evaluate(flag => ({
      origin: location.origin,
      namespaced: window[flag] === true,
      entry: document.querySelector('script[type="module"][src]')?.getAttribute('src') || null,
    }), namespaceFlag);
    if (actual.origin !== expectedOrigin) throw new Error(`Unexpected page origin ${actual.origin}`);
    if (!actual.namespaced) throw new Error(`Required storage namespace flag ${namespaceFlag} is missing`);
    if (actual.entry !== expectedEntry) throw new Error(`Compiled entry mismatch: ${actual.entry}`);
    return actual;
  }

  async function measureControl(locator, label = 'control') {
    if (await locator.count() !== 1 || !await locator.isVisible()) {
      throw new Error(`${label} is missing or not uniquely visible`);
    }
    const measured = await locator.evaluate(element => {
      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const hit = document.elementFromPoint(x, y);
      const style = getComputedStyle(element);
      return {
        text: (element.getAttribute('aria-label') || element.innerText || element.textContent || '').trim(),
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom },
        viewport: { width: innerWidth, height: innerHeight },
        centerHit: Boolean(hit && (hit === element || element.contains(hit))),
        pointerEvents: style.pointerEvents,
      };
    });
    const { rect, viewport } = measured;
    if (rect.width < minimumTargetSize || rect.height < minimumTargetSize) throw new Error(`${label} is below ${minimumTargetSize}px: ${JSON.stringify(measured)}`);
    if (rect.x < 0 || rect.y < 0 || rect.right > viewport.width || rect.bottom > viewport.height) {
      throw new Error(`${label} is not wholly inside the viewport: ${JSON.stringify(measured)}`);
    }
    if (!measured.centerHit || measured.pointerEvents === 'none') {
      throw new Error(`${label} center is covered or not hit-testable: ${JSON.stringify(measured)}`);
    }
    return measured;
  }

  async function clickControl(locator, { label = 'control', heading, url, timeout = 10000 } = {}) {
    const geometry = await measureControl(locator, label);
    await locator.click();
    if (heading) await page.getByRole('heading', { name: heading, exact: true }).waitFor({ timeout });
    if (url) await page.waitForURL(url, { timeout });
    return { geometry, heading: heading || null, url: page.url() };
  }

  async function snapshotStorage() {
    const rows = await page.evaluate(async () => {
      const values = [];
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (key !== null) {
          const raw = localStorage.getItem(key) ?? '';
          const bytes = new TextEncoder().encode(raw);
          const digest = await crypto.subtle.digest('SHA-256', bytes);
          const sha256 = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
          values.push([key, { sha256, bytes: bytes.length }]);
        }
      }
      return values;
    });
    return Object.fromEntries(rows);
  }

  function compareStorage(before, after, { allowedKeys = [], allowedPrefixes = [] } = {}) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    const changed = [...keys].filter(key => before[key]?.sha256 !== after[key]?.sha256 || before[key]?.bytes !== after[key]?.bytes).sort();
    const allowed = key => allowedKeys.includes(key) || allowedPrefixes.some(prefix => key.startsWith(prefix));
    return { changed, unexpected: changed.filter(key => !allowed(key)), unchanged: [...keys].filter(key => !changed.includes(key)).sort() };
  }

  function assertStorageChanges(before, after, scope = {}) {
    const result = compareStorage(before, after, scope);
    if (result.unexpected.length) throw new Error(`Unexpected saved-key changes: ${JSON.stringify(result.unexpected)}`);
    return result;
  }

  async function audioEvents() {
    const rows = await page.evaluate(() => {
      const rows = window.__retainedIntegrationMediaRowsV1 || [];
      return rows.map(row => {
        const element = row.element;
        return {
          src: row.src,
          origin: (() => { try { return new URL(row.src, location.href).origin; } catch { return ''; } })(),
          pathname: (() => { try { return new URL(row.src, location.href).pathname; } catch { return ''; } })(),
          currentTime: Number(element?.currentTime) || 0,
          duration: Number.isFinite(element?.duration) ? element.duration : null,
          paused: element?.paused ?? true,
          ended: element?.ended ?? false,
          events: row.events.slice(),
        };
      });
    });
    return rows.map(row => ({
      ...row,
      packaged: row.origin === expectedOrigin && (
        (typeof isPackagedAudioUrl === 'function' && isPackagedAudioUrl(row.src, row))
        || packagedAudioPaths.some(prefix => row.pathname.startsWith(prefix))
      ),
    }));
  }

  async function clickLeave(locator, { label = 'leave control', heading, url, timeout = 10000 } = {}) {
    const result = await clickControl(locator, { label, heading, url, timeout });
    const deadline = Date.now() + 5000;
    let media = await audioEvents();
    while (media.some(row => !row.paused && !row.ended) && Date.now() < deadline) {
      await page.waitForTimeout(100);
      media = await audioEvents();
    }
    const stillPlaying = media.filter(row => !row.paused && !row.ended);
    if (stillPlaying.length) throw new Error(`Audio continued after leaving the activity: ${JSON.stringify(stillPlaying.map(({ src, currentTime }) => ({ src, currentTime })))}`);
    return { ...result, audioStopped: true, media };
  }

  function assertNoProviderAttempts() {
    if (state.providerAttempts.length) throw new Error(`Provider/API requests were blocked: ${JSON.stringify(state.providerAttempts)}`);
    return true;
  }

  function assertNoRuntimeErrors() {
    if (state.pageErrors.length || state.consoleErrors.length || state.requestErrors.length || state.responseErrors.length) {
      throw new Error(`Runtime/network errors: ${JSON.stringify(state)}`);
    }
    return { pageErrors: [], consoleErrors: [], requestErrors: [], responseErrors: [] };
  }

  async function dispose() {
    if (!installed) return;
    await page.unroute('**/*', providerGuard);
    page.off('pageerror', onPageError);
    page.off('console', onConsole);
    page.off('requestfailed', onRequestFailed);
    page.off('response', onResponse);
    await page.evaluate(() => window.__retainedIntegrationMediaStateV1?.dispose?.());
    installed = false;
  }

  return {
    installGuards,
    assertRuntime,
    measureControl,
    clickControl,
    clickLeave,
    snapshotStorage,
    compareStorage,
    assertStorageChanges,
    audioEvents,
    assertNoProviderAttempts,
    assertNoRuntimeErrors,
    dispose,
    diagnostics: state,
  };
};
