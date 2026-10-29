// Helpers for the owner's already-leased Storybook tab. This module never
// launches a browser, context, profile, tab, or origin.
const INCLUDED_TITLES = new Set([
  'Rex and the Missing Moon Map', 'Luna and the Whispering Forest', 'Nia’s Great River Journey',
  'Bo and the Busy Bee Garden', 'Sami and the Night-Light Parade', 'Mina’s Mountain Seed', 'Kai and the Lost Library Book',
]);
module.exports = async (page, { origin, expectedEntry, viewport, screenshotPath } = {}) => {
  const pageErrors = [];
  const consoleErrors = [];
  const failedResponses = [];
  const failedRequests = [];
  const providerRequests = [];
  const mediaRequests = [];
  const mediaEvents = [];
  const rows = [];
  const startedAt = new Date().toISOString();
  const wait = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));
  const sha256 = async (value) => page.evaluate(async (input) => {
    const bytes = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }, String(value));
  const onPageError = (error) => pageErrors.push(String(error.message || error));
  const onConsole = (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); };
  const onResponse = (response) => { if (response.status() >= 400) failedResponses.push({ status: response.status(), url: response.url() }); };
  const onFailed = (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText || 'unknown', atMs: Date.now() });
  const onRequest = (request) => {
    const url = request.url();
    if (/\/api\//i.test(url)) providerRequests.push(url);
    if (/\.(?:mp3|m4a|wav|ogg)(?:\?|$)/i.test(url)) mediaRequests.push(url);
  };
  page.on('pageerror', onPageError);
  page.on('console', onConsole);
  page.on('response', onResponse);
  page.on('requestfailed', onFailed);
  page.on('request', onRequest);

  const assertOwnerPage = async () => {
    const url = new URL(page.url());
    if (origin && url.origin !== new URL(origin).origin) throw new Error(`Unexpected origin ${url.origin}`);
    const actualViewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }));
    if (viewport && (actualViewport.width !== viewport.width || actualViewport.height !== viewport.height)) {
      throw new Error(`Actual viewport ${actualViewport.width}x${actualViewport.height} does not match requested ${viewport.width}x${viewport.height}`);
    }
    const namespace = await page.evaluate(() => window.__amariQaNamespaced === true);
    if (!namespace) throw new Error('Retained-profile namespace guard is not active');
    const entry = await page.locator('script[type="module"][src]').first().getAttribute('src');
    if (!entry || (expectedEntry && !entry.includes(expectedEntry))) throw new Error(`Compiled entry mismatch: ${entry}; expected ${expectedEntry || '(not supplied)'}`);
    return { url: page.url(), entry, namespace, actualViewport };
  };

  const dismissBreakTimeIfPresent = async () => {
    const overlay = page.locator('.fixed.inset-0.z-50').filter({ hasText: 'Break Time!' }).first();
    if (!await overlay.count() || !await overlay.isVisible().catch(() => false)) return false;
    const button = overlay.getByRole('button', { name: '5 More Minutes', exact: true });
    const geometry = await button.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const hit = x >= 0 && x < innerWidth && y >= 0 && y < innerHeight ? document.elementFromPoint(x, y) : null;
      return {
        rect: { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height },
        viewport: { width: innerWidth, height: innerHeight },
        wholeRectVisible: rect.width > 0 && rect.height > 0 && rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight,
        centerHit: Boolean(hit && (hit === element || element.contains(hit))),
      };
    });
    if (!geometry.wholeRectVisible || !geometry.centerHit) throw new Error(`Break Time continuation control is clipped or covered: ${JSON.stringify(geometry)}`);
    await button.click();
    await wait();
    rows.push({ kind: 'break-time-modal', action: '5 More Minutes', geometry, normalControlUsed: true });
    return true;
  };

  const assertControl = async (locator, label, minSize = 44) => {
    await dismissBreakTimeIfPresent();
    const geometry = await locator.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const hit = x >= 0 && x < innerWidth && y >= 0 && y < innerHeight ? document.elementFromPoint(x, y) : null;
      return {
        rect: { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height },
        viewport: { width: innerWidth, height: innerHeight },
        wholeRectVisible: rect.width > 0 && rect.height > 0 && rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight,
        centerHit: Boolean(hit && (hit === element || element.contains(hit))),
      };
    });
    const row = { kind: 'control-geometry', label, ...geometry };
    rows.push(row);
    if (!geometry.wholeRectVisible || !geometry.centerHit || geometry.rect.width < minSize || geometry.rect.height < minSize) {
      throw new Error(`${label} is clipped, covered, or undersized: ${JSON.stringify(row)}`);
    }
    return geometry;
  };

  const click = async (locator, label, minSize = 44) => {
    await assertControl(locator, label, minSize);
    await locator.click();
    await wait();
  };

  const libraryInventory = async () => {
    const inventory = page.getByRole('status', { name: 'Story library inventory' });
    const text = (await inventory.innerText()).replace(/\s+/g, ' ').trim();
    const cards = await page.getByRole('region', { name: 'Storybook library' }).locator('article').evaluateAll((articles) => articles.map((article) => ({
      title: article.querySelector('h3')?.innerText?.trim() || '',
      cover: [...article.querySelectorAll('img')].map((image) => ({
        src: image.currentSrc || image.src,
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      })),
      buttons: [...article.querySelectorAll('button')].map((button) => button.getAttribute('aria-label') || button.innerText.trim()),
    })));
    const report = {
      kind: 'library-inventory', text, visibleCardCount: cards.length,
      cards: await Promise.all(cards.map(async (card) => ({
        title: INCLUDED_TITLES.has(card.title) ? card.title : null,
        titleHash: await sha256(card.title),
        cover: card.cover,
        buttons: INCLUDED_TITLES.has(card.title) ? card.buttons : undefined,
        buttonCount: card.buttons.length,
      }))),
    };
    rows.push(report);
    return report;
  };

  const visibleReaderScreen = async () => {
    const main = page.locator('main.storybook-reader');
    const report = await main.evaluate((element) => {
      const image = [...element.querySelectorAll('img')].find((item) => item.getBoundingClientRect().width > 0);
      const audio = element.querySelector('audio');
      const labels = [...element.querySelectorAll('button')].map((button) => button.getAttribute('aria-label') || button.innerText.trim()).filter(Boolean);
      const pageLabel = [...element.querySelectorAll('[aria-label]')].map((item) => item.getAttribute('aria-label')).find((value) => /^Page \d+ of \d+$/.test(value || '')) || '';
      return {
        heading: element.querySelector('h1, h2')?.innerText?.trim() || '',
        text: element.innerText.replace(/\s+/g, ' ').trim(),
        pageLabel,
        image: image ? { src: image.currentSrc || image.src, complete: image.complete, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight } : null,
        audio: audio ? { src: audio.currentSrc || audio.src || '', readyState: audio.readyState, duration: Number.isFinite(audio.duration) ? audio.duration : null, paused: audio.paused, currentTime: audio.currentTime, error: audio.error?.code || null } : null,
        buttons: labels,
      };
    });
    if (!report.heading) throw new Error('Reader screen has no visible title');
    rows.push({ kind: 'reader-screen', ...report });
    return report;
  };

  const startVisibleAudio = async (button) => {
    const before = await page.evaluate(() => window.__storybookMediaEventsV1?.length || 0);
    await click(button, 'narration control');
    await page.waitForFunction((index) => (window.__storybookMediaEventsV1 || []).slice(index).some((event) => event.type === 'playing' || event.type === 'timeupdate'), before, { timeout: 10000 });
    const events = await page.evaluate((index) => (window.__storybookMediaEventsV1 || []).slice(index), before);
    mediaEvents.push(...events);
    return events;
  };

  const installMediaAndURLProbe = async () => {
    await page.evaluate(() => {
      if (!window.__storybookMediaEventsV1) {
        window.__storybookMediaEventsV1 = [];
        document.addEventListener('play', (event) => {
          const media = event.target;
          if (!(media instanceof HTMLMediaElement)) return;
          for (const type of ['playing', 'timeupdate', 'pause', 'ended', 'error']) media.addEventListener(type, () => {
            window.__storybookMediaEventsV1.push({ type, src: media.currentSrc || media.src || '', time: media.currentTime, duration: Number.isFinite(media.duration) ? media.duration : null, muted: media.muted, volume: media.volume });
          }, { once: type === 'playing' || type === 'error' });
        }, true);
      }
      if (!window.__storybookURLProbeV1) {
        window.__storybookURLProbeV1 = true;
        window.__storybookObjectURLsV1 = { created: [], revoked: [] };
        const create = URL.createObjectURL.bind(URL);
        const revoke = URL.revokeObjectURL.bind(URL);
        URL.createObjectURL = (blob) => { const value = create(blob); window.__storybookObjectURLsV1.created.push({ url: value, type: blob?.type || '', bytes: blob?.size || 0 }); return value; };
        URL.revokeObjectURL = (value) => { window.__storybookObjectURLsV1.revoked.push(value); return revoke(value); };
      }
      if (!window.__storybookURLTimelineV1) {
        const state = { created: [], revoked: [] };
        const create = URL.createObjectURL.bind(URL);
        const revoke = URL.revokeObjectURL.bind(URL);
        URL.createObjectURL = (blob) => {
          const url = create(blob);
          state.created.push({ url, type: blob?.type || '', bytes: blob?.size || 0, atMs: Date.now() });
          return url;
        };
        URL.revokeObjectURL = (url) => {
          state.revoked.push({ url, atMs: Date.now() });
          return revoke(url);
        };
        window.__storybookURLTimelineV1 = state;
      }
    });
  };

  const storageInventory = async () => page.evaluate(async () => {
    const digest = async (text) => {
      const bytes = new TextEncoder().encode(text);
      const hash = await crypto.subtle.digest('SHA-256', bytes);
      return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
    };
    const localKeys = [];
    try {
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (key && /storybook|rewards_v2/i.test(key)) {
          const value = localStorage.getItem(key);
          localKeys.push({ key, bytes: value?.length || 0, sha256: await digest(value || '') });
        }
      }
    } catch (error) { return { available: false, error: error.name, localKeys }; }
    // indexedDB.open() would create a new database when absent, so guard with
    // the existing-database inventory first. This probe is strictly read-only.
    const databases = await indexedDB.databases?.().catch(() => null);
    if (!Array.isArray(databases)) return { available: false, error: 'Read-only database inventory unavailable', localKeys, stores: null };
    if (!databases.some((item) => item.name === 'amari-storybooks')) return { available: true, localKeys, stores: null };
    const db = await new Promise((resolve) => {
      const request = indexedDB.open('amari-storybooks');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    });
    if (!db) return { available: false, error: 'IndexedDB unavailable', localKeys };
    try {
      const stores = ['books', 'assets', 'profiles', 'series'].filter((name) => db.objectStoreNames.contains(name));
      const snapshot = await new Promise((resolve) => {
        const tx = db.transaction(stores, 'readonly');
        const output = {};
        for (const name of stores) {
          const request = tx.objectStore(name).getAllKeys();
          request.onsuccess = () => { output[name] = request.result.length; };
          request.onerror = () => { output[name] = null; };
        }
        tx.oncomplete = () => resolve(output);
        tx.onerror = () => resolve(null);
        tx.onabort = () => resolve(null);
      });
      return { available: Boolean(snapshot), localKeys, stores: snapshot };
    } finally { db.close(); }
  });

  const withStorageFault = async (key, mode, action) => {
    if (!key || !['write', 'readback'].includes(mode) || typeof action !== 'function') throw new Error('Use an exact key, write/readback mode, and bounded UI action callback');
    await page.evaluate(({ faultKey, faultMode }) => {
      const proto = Storage.prototype;
      if (window.__storybookStorageFaultV1) throw new Error('A storage fault is already active');
      const get = proto.getItem;
      const set = proto.setItem;
      const state = { key: faultKey, mode: faultMode, active: true, writes: 0, calls: 0, get, set };
      proto.getItem = function (name) {
        if (state.active && name === state.key && state.mode === 'readback' && state.writes > 0) {
          state.active = false; state.calls += 1;
          throw new DOMException('Bounded Storybook QA readback fault', 'QuotaExceededError');
        }
        return get.call(this, name);
      };
      proto.setItem = function (name, value) {
        if (state.active && name === state.key && state.mode === 'write') {
          state.active = false; state.calls += 1;
          throw new DOMException('Bounded Storybook QA write fault', 'QuotaExceededError');
        }
        const result = set.call(this, name, value);
        if (name === state.key) state.writes += 1;
        return result;
      };
      window.__storybookStorageFaultV1 = state;
    }, { faultKey: key, faultMode: mode });
    try { return await action(); }
    finally {
      await page.evaluate(() => {
        const state = window.__storybookStorageFaultV1;
        if (!state) return;
        Storage.prototype.getItem = state.get;
        Storage.prototype.setItem = state.set;
        window.__storybookStorageFaultReportV1 = { key: state.key, mode: state.mode, calls: state.calls, writes: state.writes };
        delete window.__storybookStorageFaultV1;
      });
    }
  };

  const errorAudit = async () => {
    const browserState = await page.evaluate(() => {
      const activeMedia = [...document.querySelectorAll('img, audio, video')].map((element) => ({
        tag: element.tagName.toLowerCase(),
        url: element.currentSrc || element.src || '',
        complete: element.tagName === 'IMG' ? element.complete : undefined,
        naturalWidth: element.tagName === 'IMG' ? element.naturalWidth : undefined,
        readyState: element instanceof HTMLMediaElement ? element.readyState : undefined,
        mediaError: element instanceof HTMLMediaElement ? element.error?.code || null : undefined,
      })).filter((item) => item.url);
      return { activeMedia, currentURLTimeline: window.__storybookURLTimelineV1 || { created: [], revoked: [] }, objectURLs: window.__storybookObjectURLsV1 || { created: [], revoked: [] } };
    });
    const activeUrls = new Set(browserState.activeMedia.map((item) => item.url));
    const created = new Set(browserState.objectURLs.created.map((item) => item.url));
    const revokedAt = new Map();
    for (const event of browserState.currentURLTimeline.revoked) {
      const prior = revokedAt.get(event.url);
      if (prior === undefined || event.atMs < prior) revokedAt.set(event.url, event.atMs);
    }
    const intentionalRevocationAborts = [];
    const unclassifiedFailedRequests = [];
    for (const failure of failedRequests) {
      const revocationTime = revokedAt.get(failure.url);
      const isExpectedAbort = failure.error === 'net::ERR_ABORTED'
        && failure.url.startsWith('blob:')
        && created.has(failure.url)
        && revocationTime !== undefined
        && revocationTime <= failure.atMs
        && !activeUrls.has(failure.url);
      (isExpectedAbort ? intentionalRevocationAborts : unclassifiedFailedRequests).push({ ...failure, revocationAtMs: revocationTime ?? null });
    }
    const brokenImages = browserState.activeMedia.filter((item) => item.tag === 'img' && (!item.complete || item.naturalWidth < 1));
    const brokenMedia = browserState.activeMedia.filter((item) => item.tag !== 'img' && item.mediaError !== null);
    return {
      errors: { pageErrors, consoleErrors, failedResponses, failedRequests, intentionalRevocationAborts, unclassifiedFailedRequests, providerRequests },
      mediaHealth: { activeMedia: browserState.activeMedia, brokenImages, brokenMedia },
      urlTimeline: browserState.currentURLTimeline,
    };
  };
  const assertNoErrors = async () => {
    const audit = await errorAudit();
    if (pageErrors.length || consoleErrors.length || failedResponses.length || audit.errors.unclassifiedFailedRequests.length
      || providerRequests.length || audit.mediaHealth.brokenImages.length || audit.mediaHealth.brokenMedia.length) {
      throw new Error(`Runtime/network errors: ${JSON.stringify(audit)}`);
    }
    return audit;
  };

  await installMediaAndURLProbe();
  const identity = await assertOwnerPage();
  const initialStorage = await storageInventory();
  const initialLibrary = await libraryInventory();
  return {
    startedAt,
    viewport,
    identity,
    rows,
    pageErrors,
    consoleErrors,
    failedResponses,
    failedRequests,
    providerRequests,
    mediaRequests,
    mediaEvents,
    initialStorage,
    initialLibrary,
    assertControl,
    click,
    assertOwnerPage,
    libraryInventory,
    visibleReaderScreen,
    startVisibleAudio,
    storageInventory,
    withStorageFault,
    storageFaultReport: () => page.evaluate(() => window.__storybookStorageFaultReportV1 || null),
    assertNoErrors,
    objectURLState: () => page.evaluate(() => window.__storybookObjectURLsV1 || { created: [], revoked: [] }),
    capture: async (target = screenshotPath) => { if (target) await page.screenshot({ path: target, fullPage: false }); },
    finish: async () => {
      const audit = await errorAudit();
      return { endedAt: new Date().toISOString(), finalStorage: await storageInventory(), errors: audit.errors, mediaHealth: audit.mediaHealth, mediaRequests, mediaEvents, objectURLs: await page.evaluate(() => window.__storybookObjectURLsV1 || { created: [], revoked: [] }), objectURLTimeline: audit.urlTimeline, rows };
    },
    detach: () => {
      page.off('pageerror', onPageError);
      page.off('console', onConsole);
      page.off('response', onResponse);
      page.off('requestfailed', onFailed);
      page.off('request', onRequest);
    },
  };
};
