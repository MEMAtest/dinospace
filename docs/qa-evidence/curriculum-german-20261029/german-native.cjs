async page => {
  const ORIGIN = __ORIGIN__;
  const EXPECTED_ENTRY = __EXPECTED_ENTRY__;
  const WIDTH = __WIDTH__;
  const HEIGHT = __HEIGHT__;
  const STAGE = __STAGE__;
  const OUT = __OUT__;
  const PLAN = __PLAN__;
  const armStorageFault = __FAULT_HELPER__;
  const PREFIX = 'qa_rewards_20261024_';
  const diagnostics = { providerAttempts: [], pageErrors: [], consoleErrors: [], requestErrors: [], responseErrors: [] };
  const rows = [];
  const faults = [];
  const coverage = { wrongRetry: 0, chapters: [], practiceModes: [], routeIds: [], audio: [], cancellation: [] };
  let entryIdentity = null;
  let namespaced = false;
  let failureScreenshot = null;
  let finalRender = null;
  let initialStorage = null;
  let startupReconciliation = { pendingBeforeMount: 0, recovered: 0, retriedFromMenu: false };
  let originalSoundOn = null;
  let soundPreferenceRestored = false;

  const onPageError = (error) => diagnostics.pageErrors.push(String(error?.message || error));
  const onConsole = (message) => { if (message.type() === 'error') diagnostics.consoleErrors.push(message.text()); };
  const onRequestFailed = (request) => diagnostics.requestErrors.push({ url: request.url(), error: request.failure()?.errorText || 'request failed' });
  const onResponse = (response) => { if (response.status() >= 400) diagnostics.responseErrors.push({ url: response.url(), status: response.status() }); };
  const providerGuard = async (route) => {
    const url = route.request().url();
    if (/(?:\/api\/|elevenlabs|openai|text-to-speech|story-provider)/i.test(url)) {
      diagnostics.providerAttempts.push(url);
      await route.fulfill({ status: 403, contentType: 'text/plain', body: 'Blocked by Pair10 retained-page QA guard' });
      return;
    }
    await route.continue();
  };
  page.on('pageerror', onPageError);
  page.on('console', onConsole);
  page.on('requestfailed', onRequestFailed);
  page.on('response', onResponse);

  const installMediaObserver = async () => page.evaluate(() => {
    if (window.__pair10GermanMediaInstalledV1) return;
    const prototype = HTMLMediaElement.prototype;
    const originalPlay = prototype.play;
    const byElement = new WeakMap();
    const rows = [];
    let nextMediaId = 0;
    window.__pair10GermanMediaRowsV1 = [];
    const observe = (element) => {
      let record = byElement.get(element);
      if (record) return record;
      record = { id: ++nextMediaId, element, src: element.currentSrc || element.src || '', events: [], totalEvents: 0, listeners: [] };
      byElement.set(element, record);
      const listen = (type) => {
        const listener = () => {
          record.src = element.currentSrc || element.src || record.src;
          record.events.push({ type, currentTime: Number(element.currentTime) || 0, at: performance.now() });
          record.totalEvents += 1;
          if (record.events.length > 32) record.events.shift();
        };
        element.addEventListener(type, listener);
        record.listeners.push([type, listener]);
      };
      ['play', 'playing', 'timeupdate', 'pause', 'ended', 'error'].forEach(listen);
      rows.push(record);
      window.__pair10GermanMediaRowsV1.push(record);
      while (rows.length > 48) {
        const old = rows.shift();
        old.listeners.forEach(([type, listener]) => old.element.removeEventListener(type, listener));
        const index = window.__pair10GermanMediaRowsV1.indexOf(old);
        if (index >= 0) window.__pair10GermanMediaRowsV1.splice(index, 1);
      }
      return record;
    };
    prototype.play = function (...args) {
      const record = observe(this);
      record.src = this.currentSrc || this.src || record.src;
      record.events.push({ type: 'play-call', currentTime: Number(this.currentTime) || 0, at: performance.now() });
      record.totalEvents += 1;
      if (record.events.length > 32) record.events.shift();
      return originalPlay.apply(this, args);
    };
    const wrapper = prototype.play;
    window.__pair10GermanMediaInstalledV1 = true;
    window.__pair10GermanMediaDisposeV1 = () => {
      rows.forEach((record) => record.listeners.forEach(([type, listener]) => record.element.removeEventListener(type, listener)));
      if (prototype.play === wrapper) prototype.play = originalPlay;
      delete window.__pair10GermanMediaInstalledV1;
      delete window.__pair10GermanMediaDisposeV1;
      delete window.__pair10GermanMediaRowsV1;
    };
  });
  const mediaSnapshot = async () => page.evaluate(() => (window.__pair10GermanMediaRowsV1 || []).map((record) => ({
    id: record.id,
    totalEvents: record.totalEvents,
    src: record.element.currentSrc || record.element.src || record.src,
    currentTime: Number(record.element.currentTime) || 0,
    duration: Number.isFinite(record.element.duration) ? record.element.duration : null,
    paused: record.element.paused,
    ended: record.element.ended,
    events: record.events.slice(),
  })));

  const assertRuntime = async () => {
    const identity = await page.evaluate(() => ({
      origin: location.origin,
      namespaced: window.__amariQaNamespaced === true,
      entry: document.querySelector('script[type="module"][src]')?.getAttribute('src') || null,
      width: innerWidth,
      height: innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    if (identity.origin !== new URL(ORIGIN).origin) throw new Error(`Unexpected origin ${identity.origin}`);
    if (!identity.namespaced) throw new Error('The retained QA namespace guard is missing.');
    if (identity.entry !== EXPECTED_ENTRY) throw new Error(`Compiled-entry mismatch: ${identity.entry}`);
    if (identity.width !== WIDTH || identity.height !== HEIGHT) throw new Error(`Viewport mismatch: ${JSON.stringify(identity)}`);
    if (identity.scrollWidth > WIDTH) throw new Error(`Horizontal overflow: ${JSON.stringify(identity)}`);
    entryIdentity = identity.entry;
    namespaced = identity.namespaced;
    return identity;
  };
  const measure = async (locator, label, minimum = 44) => {
    if (await locator.count() !== 1 || !await locator.isVisible()) throw new Error(`${label} is not uniquely visible`);
    const measured = await locator.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return { text: (element.getAttribute('aria-label') || element.innerText || element.textContent || '').trim(), rect: rect.toJSON(), viewport: { width: innerWidth, height: innerHeight }, centerHit: Boolean(hit && (hit === element || element.contains(hit))) };
    });
    const { x, y, width, height, right, bottom } = measured.rect;
    if (width < minimum || height < minimum) throw new Error(`${label} is smaller than ${minimum}px: ${JSON.stringify(measured)}`);
    if (x < 0 || y < 0 || right > WIDTH || bottom > HEIGHT || !measured.centerHit) throw new Error(`${label} is clipped, occluded, or outside viewport: ${JSON.stringify(measured)}`);
    return measured;
  };
  const clickTask = async (locator, label, minimum = 44) => {
    const geometry = await measure(locator, label, minimum);
    await locator.click();
    return geometry;
  };
  const clickNavigation = async (locator, label) => {
    await locator.evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
    const geometry = await measure(locator, label);
    await locator.click();
    return geometry;
  };
  const snapshot = async () => page.evaluate(async () => {
    const prefix = 'qa_rewards_20261024_';
    const hashes = {};
    const raw = {};
    const relevant = new Set([
      'amari_german_chapter_progress_v1', 'amari_game_levels_v1', 'amari_german_recent_targets_v1',
      'amari_game_diagnostics_v1',
      'amari_recent_games',
      'askia_german_chapter_progress_v1', 'askia_game_levels_v1', 'askia_german_recent_targets_v1',
      'amari_rewards_v2', 'amari_points', 'amari_games_played', 'amari_earned_sticker_ids_v1',
      'askia_rewards_v2', 'askia_points', 'askia_games_played', 'askia_earned_sticker_ids_v1',
    ]);
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key || !key.startsWith(prefix)) continue;
      const value = localStorage.getItem(key) ?? '';
      const bytes = new TextEncoder().encode(value);
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      hashes[key] = { sha256: [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join(''), bytes: bytes.length };
      const logical = key.slice(prefix.length);
      if (relevant.has(logical)) raw[logical] = value;
    }
    return { hashes, raw };
  });
  const parse = (raw, fallback = null) => {
    if (raw === null || raw === undefined) return fallback;
    try { return JSON.parse(raw); } catch { throw new Error('A protected JSON storage record is malformed.'); }
  };
  const rewards = (snap) => {
    const record = parse(snap.raw.amari_rewards_v2, {});
    return {
      points: Number(record.points ?? parse(snap.raw.amari_points, 0)) || 0,
      gamesPlayed: record.gamesPlayed || parse(snap.raw.amari_games_played, {}),
      rewardClaims: record.rewardClaims || {},
    };
  };
  const changedKeys = (before, after) => [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key])).sort();
  const allowedChange = (physicalKey) => {
    if (!physicalKey.startsWith(PREFIX)) return false;
    const key = physicalKey.slice(PREFIX.length);
    return ['amari_german_chapter_progress_v1', 'amari_german_recent_targets_v1', 'amari_game_diagnostics_v1', 'amari_recent_games', 'amari_rewards_v2',
      'amari_points', 'amari_games_played', 'amari_earned_sticker_ids_v1'].includes(key);
  };
  const assertGermanDiagnostics = (beforeRaw, afterRaw) => {
    const parseRows = (raw, label) => {
      if (raw === null || raw === undefined) return [];
      if (typeof raw !== 'string' || raw.length === 0) throw new Error(`${label} game diagnostics are unreadable.`);
      let parsed;
      try { parsed = JSON.parse(raw); } catch { throw new Error(`${label} game diagnostics are malformed.`); }
      if (!Array.isArray(parsed)) throw new Error(`${label} game diagnostics have an invalid shape.`);
      return parsed;
    };
    const before = parseRows(beforeRaw, 'Prior');
    const after = parseRows(afterRaw, 'Current');
    let overlap = Math.min(before.length, after.length);
    while (overlap > 0 && JSON.stringify(before.slice(-overlap)) !== JSON.stringify(after.slice(0, overlap))) overlap -= 1;
    const added = after.slice(overlap);
    const allowedEvents = new Set(['chapter_start', 'answer_attempt', 'answer_correct', 'route_assistance', 'route_attempt', 'route_step', 'practice_start', 'practice_correct']);
    const unexpected = added.filter((entry) => entry?.game !== 'german' || !allowedEvents.has(entry?.event));
    if (!added.length || unexpected.length) throw new Error(`German diagnostics changed beyond source-authored German events: ${JSON.stringify(unexpected.slice(0, 4))}`);
    return { priorEventsRetained: overlap, newGermanEvents: added.length, eventKinds: [...new Set(added.map(({ event }) => event))].sort(), noOtherGameEventsAdded: true };
  };
  const assertRecentGameNavigation = (beforeRaw, afterRaw) => {
    const parseList = (raw, label) => {
      if (raw === null || raw === undefined) return [];
      if (typeof raw !== 'string' || raw.length === 0) throw new Error(`${label} recent-game record is unreadable.`);
      let value;
      try { value = JSON.parse(raw); } catch { throw new Error(`${label} recent-game record is malformed.`); }
      if (!Array.isArray(value) || value.some((id) => typeof id !== 'string')) throw new Error(`${label} recent-game record has an invalid shape.`);
      return value;
    };
    const before = parseList(beforeRaw, 'Prior');
    const after = parseList(afterRaw, 'Current');
    const expected = ['german', ...before.filter((id) => id !== 'german')].slice(0, 4);
    if (JSON.stringify(after) !== JSON.stringify(expected)) throw new Error(`German launch changed the recent-game list beyond its normal exact-game MRU update: ${JSON.stringify({ before, expected, after })}`);
    return { priorGamesRetained: before.filter((id) => id !== 'german').filter((id) => after.includes(id)).length, exactExpectedCurrentList: true };
  };
  const assertStorageBoundaries = (before, after, label) => {
    const changed = changedKeys(before.hashes, after.hashes);
    const unexpected = changed.filter((key) => !allowedChange(key));
    if (unexpected.length) throw new Error(`${label} changed storage outside the German/reward allowlist: ${JSON.stringify(unexpected)}`);
    for (const key of ['amari_game_levels_v1', 'askia_german_chapter_progress_v1', 'askia_game_levels_v1', 'askia_german_recent_targets_v1']) {
      if (before.raw[key] !== after.raw[key]) throw new Error(`${label} changed protected ${key}`);
    }
    const askiaChanged = changed.filter((key) => key.startsWith(`${PREFIX}askia_`));
    if (askiaChanged.length) throw new Error(`${label} changed Askia profile keys: ${JSON.stringify(askiaChanged)}`);
    return { changed, unexpected, protectedLegacyGameLevelsUnchanged: true, askiaProfileUnchanged: true };
  };
  const assertRewardPreservation = (before, after) => {
    const prior = rewards(before);
    const current = rewards(after);
    for (const [token, points] of Object.entries(prior.rewardClaims)) {
      if (current.rewardClaims[token] !== points) throw new Error(`German removed or changed a prior reward claim: ${token}`);
    }
    const added = Object.keys(current.rewardClaims).filter((token) => prior.rewardClaims[token] === undefined);
    const unexpected = added.filter((token) => !token.startsWith('dino:german:'));
    if (unexpected.length) throw new Error(`German caused unrelated reward claims: ${JSON.stringify(unexpected)}`);
    for (const [game, count] of Object.entries(prior.gamesPlayed)) {
      if (game !== 'german' && Number(current.gamesPlayed[game] || 0) !== Number(count || 0)) throw new Error(`German changed the existing ${game} game count.`);
    }
    const priorStickers = parse(before.raw.amari_earned_sticker_ids_v1, []);
    const currentStickers = parse(after.raw.amari_earned_sticker_ids_v1, []);
    if (Array.isArray(priorStickers) && Array.isArray(currentStickers)) {
      const missing = priorStickers.filter((sticker) => !currentStickers.includes(sticker));
      if (missing.length) throw new Error(`German removed existing sticker IDs: ${JSON.stringify(missing)}`);
    }
    return { priorClaimsRetained: Object.keys(prior.rewardClaims).length, unrelatedGameCountsUnchanged: true, priorStickersRetained: true, addedTokens: added };
  };
  const getLogical = async (key) => page.evaluate((name) => {
    try { return localStorage.getItem(name); } catch (error) { return { readError: String(error?.name || error) }; }
  }, key);
  const parseProgress = (raw) => {
    const progress = parse(raw, { version: 1, completedChapterIds: [], chapterReceipts: [] });
    if (!progress || !Array.isArray(progress.completedChapterIds) || !Array.isArray(progress.chapterReceipts)) throw new Error('German progress record is unreadable or malformed; refusing to continue or inject state.');
    return progress;
  };
  const checkHistoryPreservation = (beforeRaw, afterRaw) => {
    if (beforeRaw === null) return { priorRecord: 'absent', preservedUnknownFields: true };
    if (typeof beforeRaw !== 'string' || !beforeRaw.length) {
      if (afterRaw !== beforeRaw) throw new Error('German replaced an unreadable recent-target record.');
      return { priorRecord: 'unreadable-bytes', preservedRawBytes: true };
    }
    let before;
    try { before = JSON.parse(beforeRaw); } catch {
      if (afterRaw !== beforeRaw) throw new Error('German replaced malformed recent-target bytes.');
      return { priorRecord: 'malformed-json', preservedRawBytes: true };
    }
    if (!before || typeof before !== 'object' || Array.isArray(before)) {
      if (afterRaw !== beforeRaw) throw new Error('German replaced an invalid recent-target record.');
      return { priorRecord: 'invalid-shape', preservedRawBytes: true };
    }
    const known = new Set([...Object.keys(PLAN.modes), 'paint', 'park', 'colours']);
    const unknownBefore = Object.fromEntries(Object.entries(before).filter(([key]) => !known.has(key)));
    if (!Object.keys(unknownBefore).length) return { priorRecord: 'valid', preservedUnknownFields: true };
    if (typeof afterRaw !== 'string' || !afterRaw.length) throw new Error('German removed valid unknown recent-target metadata.');
    let after;
    try { after = JSON.parse(afterRaw); } catch { throw new Error('German corrupted the recent-target metadata while playing.'); }
    for (const [key, value] of Object.entries(unknownBefore)) {
      if (JSON.stringify(after?.[key]) !== JSON.stringify(value)) throw new Error(`German changed unknown recent-target metadata ${key}.`);
    }
    return { priorRecord: 'valid', preservedUnknownFields: true, unknownFieldCount: Object.keys(unknownBefore).length };
  };
  const eligibility = async (chapter) => {
    const canonicalRaw = await getLogical('amari_german_chapter_progress_v1');
    const legacyRaw = await getLogical('amari_game_levels_v1');
    if (canonicalRaw && typeof canonicalRaw === 'object') throw new Error('German progress read was unavailable.');
    if (legacyRaw && typeof legacyRaw === 'object') throw new Error('Legacy German progress read was unavailable.');
    const progress = parseProgress(canonicalRaw);
    let legacyCeiling = -1;
    if (legacyRaw !== null) {
      if (typeof legacyRaw !== 'string' || legacyRaw.length === 0) throw new Error('Legacy game_levels contains unreadable bytes; no German reward eligibility can be inferred.');
      const old = parse(legacyRaw, null);
      if (!old || typeof old !== 'object' || Array.isArray(old)) throw new Error('Legacy game_levels is malformed; refusing to infer eligibility.');
      const german = old.german;
      if (german !== undefined) {
        if (!german || !Number.isInteger(german.current) || !Number.isInteger(german.unlocked) || german.current < 0 || german.current > german.unlocked || german.unlocked >= PLAN.chapters.length) throw new Error('Legacy German row is malformed; refusing to infer eligibility.');
        legacyCeiling = Math.max(german.current, german.unlocked);
      }
    }
    const receipt = progress.chapterReceipts.find((item) => item.chapterId === chapter.id) || null;
    return {
      progress,
      receipt,
      completed: progress.completedChapterIds.includes(chapter.id),
      legacyCeiling,
      rewardEligible: !receipt && !progress.completedChapterIds.includes(chapter.id) && chapterIndexFor(chapter.id) > legacyCeiling,
      canonicalRaw,
      legacyRaw,
    };
  };
  function chapterIndexFor(id) { return PLAN.chapters.findIndex((chapter) => chapter.id === id); }

  const chooseAmari = async () => {
    const card = page.locator('.discovery-intro-card--amari');
    await page.waitForFunction(() => {
      const cardNode = document.querySelector('.discovery-intro-card--amari');
      if (cardNode && cardNode.getBoundingClientRect().width > 0 && cardNode.getBoundingClientRect().height > 0) return 'chooser';
      const headings = [...document.querySelectorAll('h1')];
      if (headings.some((heading) => heading.textContent?.trim() === 'Choose a world' && heading.getBoundingClientRect().width > 0)) return 'home';
      return false;
    }, null, { timeout: 12000 });
    if (await card.count() && await card.isVisible()) {
      const age = (await card.locator('.discovery-intro-age').innerText()).trim();
      if (age !== 'Age 6+') throw new Error(`Expected Amari Age 6+, found ${age}`);
      await clickNavigation(card, 'Choose Amari after page reload');
    } else if (!await page.getByRole('heading', { name: 'Choose a world', exact: true }).isVisible()) {
      throw new Error('Expected the ordinary player chooser or Amari world home.');
    }
  };
  const waitAppHome = async () => {
    const heading = page.getByRole('heading', { name: 'Choose a world', exact: true });
    await heading.waitFor({ state: 'visible', timeout: 15000 });
  };
  const enterGarage = async ({ alreadyLoaded = false, reload = false } = {}) => {
    if (reload) await page.reload();
    else if (!alreadyLoaded) await page.goto(`${ORIGIN}/?qa_pair10_german=${Date.now()}`);
    await page.waitForLoadState('domcontentloaded', { timeout: 20000 });
    await assertRuntime();
    await installMediaObserver();
    await chooseAmari();
    await waitAppHome();
    const world = page.locator('.discovery-world-card').filter({ hasText: 'Explore & Languages' }).first();
    await clickNavigation(world, 'Open Explore & Languages');
    await page.getByRole('heading', { name: 'Explore & Languages', exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    const gameCard = page.locator('.catalogue-game-card').filter({ hasText: 'German Garage' }).first();
    await clickNavigation(gameCard, 'Open German Garage');
    await page.getByRole('heading', { name: 'German Garage', exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    await assertRuntime();
    return gameCard;
  };
  const waitMenu = async () => {
    await page.getByRole('heading', { name: 'German Garage', exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('.german-garage-page').waitFor({ state: 'visible', timeout: 10000 });
  };
  const readVisibleSoundState = async () => {
    const turnOff = page.getByRole('button', { name: 'Turn sound off', exact: true });
    const turnOn = page.getByRole('button', { name: 'Turn sound on', exact: true });
    if (await turnOff.count() && await turnOff.isVisible()) return true;
    if (await turnOn.count() && await turnOn.isVisible()) return false;
    return null;
  };
  const setVisibleSoundState = async (desiredOn, label) => {
    if (desiredOn === null) return false;
    const current = await readVisibleSoundState();
    if (current === null) return false;
    if (current !== desiredOn) {
      const action = page.getByRole('button', { name: current ? 'Turn sound off' : 'Turn sound on', exact: true });
      await clickTask(action, label);
    }
    const confirmed = await readVisibleSoundState();
    return confirmed === desiredOn;
  };
  const restoreOriginalSoundPreference = async () => {
    if (originalSoundOn === null) return false;
    const current = await readVisibleSoundState();
    if (current === originalSoundOn) return true;
    if (current === null) return false;
    const action = page.getByRole('button', { name: current ? 'Turn sound off' : 'Turn sound on', exact: true });
    if (!await action.isVisible()) return false;
    await action.click();
    return (await readVisibleSoundState()) === originalSoundOn;
  };
  const readHeaderRound = async () => (await page.locator('.german-garage-page header p').innerText()).replace(/\s+/g, ' ').trim();
  const readTarget = async () => (await page.locator('[aria-label="German word clue"]').innerText()).trim();
  const modeForChapterRound = (chapter, roundIndex) => chapter.modes[roundIndex % chapter.modes.length];
  const translationFor = (mode, german) => {
    const item = PLAN.modes[mode]?.find((row) => row.name === german);
    if (!item?.translation) throw new Error(`Missing source-authored translation for ${mode}:${german}`);
    return item.translation;
  };
  const visibleWordButton = (translation) => page.locator('.german-garage-page main button.min-h-16').filter({ has: page.getByText(translation, { exact: true }) }).filter({ visible: true }).first();
  const selectChapter = async (chapter, label) => {
    await waitMenu();
    const article = page.locator('.german-garage-page article').filter({ has: page.getByRole('heading', { level: 2, name: chapter.title, exact: true }) });
    if (await article.count() !== 1) throw new Error(`Expected one normal chapter card for ${chapter.title}`);
    const start = article.getByRole('button', { name: /^(Start chapter|Replay · no reward)$/ });
    const rect = await clickNavigation(start, `${label} ${chapter.title}`);
    await page.locator(`.german-garage-page[data-german-chapter="${chapter.id}"]`).waitFor({ state: 'visible', timeout: 10000 });
    return rect;
  };
  const mediaCheckpoint = async () => Object.fromEntries((await mediaSnapshot()).map(({ id, totalEvents }) => [id, totalEvents]));
  const waitForLocalMedia = async (checkpoint, timeout = 6000) => {
    await page.waitForFunction((afterEvents) => {
      const rows = window.__pair10GermanMediaRowsV1 || [];
      return rows.some((row) => row.totalEvents > (afterEvents[row.id] ?? 0) && (row.element.currentSrc || row.element.src || row.src).startsWith(location.origin + '/audio/de/')
        && row.events.some((event) => ['play-call', 'playing', 'timeupdate'].includes(event.type)));
    }, checkpoint, { timeout });
    const rows = await mediaSnapshot();
    const played = rows.find((row) => row.totalEvents > (checkpoint[row.id] ?? 0) && row.src && new URL(row.src, ORIGIN).origin === new URL(ORIGIN).origin && new URL(row.src, ORIGIN).pathname.startsWith('/audio/de/') && row.events.some((event) => ['play-call', 'playing', 'timeupdate'].includes(event.type)));
    if (!played) throw new Error('No exact packaged German audio clip played on this route.');
    return played;
  };
  const waitForClipAdvance = async (path, mediaId, timeout = 5000) => {
    await page.waitForFunction(({ expectedPath, id }) => (window.__pair10GermanMediaRowsV1 || []).some((row) => {
      const src = row.element.currentSrc || row.element.src || row.src;
      return row.id === id && new URL(src, location.href).pathname === expectedPath && !row.element.paused && !row.element.ended && Number(row.element.currentTime) > 0.02;
    }), { expectedPath: path, id: mediaId }, { timeout });
    const records = await mediaSnapshot();
    const active = records.find((record) => record.id === mediaId && new URL(record.src, ORIGIN).pathname === path && record.currentTime > 0.02);
    if (!active) throw new Error(`Packaged clip ${path} did not advance while playing.`);
    return active;
  };
  const assertClipStillActive = async (path, mediaId, label) => {
    const active = await page.evaluate(({ expectedPath, id }) => (window.__pair10GermanMediaRowsV1 || []).some((row) => {
      const src = row.element.currentSrc || row.element.src || row.src;
      return row.id === id && new URL(src, location.href).pathname === expectedPath && !row.element.paused && !row.element.ended && Number(row.element.currentTime) > 0.02;
    }), { expectedPath: path, id: mediaId });
    if (!active) throw new Error(`${label}: the measured German clip had already stopped before the cancellation action.`);
  };
  const waitForHeld = async () => {
    await page.getByRole('status').filter({ hasText: /means|command|destination|stopped/i }).waitFor({ state: 'visible', timeout: 8000 });
    return (await page.getByRole('status').filter({ hasText: /means|command|destination|stopped/i }).innerText()).replace(/\s+/g, ' ').trim();
  };
  const chapterReceipt = async (chapterId) => {
    const raw = await getLogical('amari_german_chapter_progress_v1');
    if (raw && typeof raw === 'object') return { error: String(raw.readError || 'unavailable'), receipt: null, raw: null };
    const progress = parseProgress(raw);
    return { receipt: progress.chapterReceipts.find((item) => item.chapterId === chapterId) || null, completed: progress.completedChapterIds.includes(chapterId), raw };
  };
  const verifyParentRecord = async (chapter, beforeReward, expectedNew) => {
    const snap = await snapshot();
    const current = rewards(snap);
    const germanClaims = Object.fromEntries(Object.entries(current.rewardClaims).filter(([key]) => key.startsWith('dino:german:')));
    const fresh = Object.entries(germanClaims).filter(([token]) => beforeReward.rewardClaims[token] === undefined);
    if (fresh.length !== expectedNew) throw new Error(`German parent token delta mismatch for ${chapter.id}: ${JSON.stringify(fresh)}`);
    if (fresh.some(([, points]) => points !== 1)) throw new Error(`German parent token must award one actual point: ${JSON.stringify(fresh)}`);
    return { snap, current, fresh };
  };

  const solveWordRound = async (chapter, roundIndex, { wrong = false, faultPlan = null } = {}) => {
    const mode = modeForChapterRound(chapter, roundIndex);
    const target = await readTarget();
    const correctTranslation = translationFor(mode, target);
    const progressBefore = await readHeaderRound();
    let rowPaintVisual = null;
    if (!progressBefore.includes(`${roundIndex + 1} of ${chapter.goal}`)) throw new Error(`Wrong visible round before answer: ${progressBefore}`);
    if (wrong) {
      const options = await page.locator('.german-garage-page main button.min-h-16').allInnerTexts();
      const visibleTranslations = options.map((text) => text.replace(/^[^\p{L}\p{N}]*/u, '').replace(/\s+/g, ' ').trim());
      const wrongTranslation = visibleTranslations.find((text) => text && !text.includes(correctTranslation));
      if (!wrongTranslation) throw new Error(`No visible wrong translation available for ${mode}:${target}`);
      const wrongButton = visibleWordButton(wrongTranslation);
      await clickTask(wrongButton, `Wrong ${mode} answer`);
      await page.waitForFunction(() => document.querySelector('.german-garage-page [aria-live="polite"]')?.textContent.includes('Try again'), null, { timeout: 5000 });
      const heldTarget = await readTarget();
      const progressAfterWrong = await readHeaderRound();
      if (heldTarget !== target || progressAfterWrong !== progressBefore) throw new Error(`Wrong ${mode} choice advanced or replaced the target: ${JSON.stringify({ target, heldTarget, progressBefore, progressAfterWrong })}`);
      coverage.wrongRetry += 1;
    }
    const correct = visibleWordButton(correctTranslation);
    if (faultPlan?.localMode) await armStorageFault(page, { key: 'amari_german_chapter_progress_v1', mode: faultPlan.localMode });
    const answerRect = await clickTask(correct, `Choose English meaning ${correctTranslation}`);
    if (mode === 'paint') {
      await page.getByText(`Painted ${target}`, { exact: true }).waitFor({ state: 'visible', timeout: 5000 });
      const expectedPaint = PLAN.modes.paint.find((item) => item.name === target);
      if (!expectedPaint?.hex) throw new Error(`Source plan has no authored paint hex for ${target}.`);
      const visual = await page.locator('.german-garage-page main section .absolute.inset-0.transition-all').evaluate((mask) => {
        const car = mask.parentElement?.querySelector('img[alt^="Car painted "]');
        const style = getComputedStyle(mask);
        return { backgroundColor: style.backgroundColor, mixBlendMode: style.mixBlendMode, maskImage: style.maskImage, opacity: style.opacity, carLoaded: Boolean(car?.complete && car.naturalWidth > 0), carAlt: car?.alt || '' };
      });
      const rgb = expectedPaint.hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)?.slice(1).map((channel) => Number.parseInt(channel, 16));
      const expectedRgb = rgb ? `rgb(${rgb.join(', ')})` : '';
      if (visual.backgroundColor !== expectedRgb || visual.mixBlendMode !== 'multiply' || !visual.maskImage.includes('url(') || visual.opacity !== '0.72' || !visual.carLoaded || visual.carAlt !== `Car painted ${target}`) {
        throw new Error(`Correct ${target} answer did not apply the authored car mask/colour: ${JSON.stringify({ expectedHex: expectedPaint.hex, visual })}`);
      }
      rowPaintVisual = { expectedHex: expectedPaint.hex, ...visual };
    }
    if (faultPlan?.localMode) {
      const retry = page.getByRole('button', { name: 'Retry save', exact: true });
      await retry.waitFor({ state: 'visible', timeout: 5000 });
      const heldCopy = (await page.getByRole('alert').innerText()).replace(/\s+/g, ' ').trim();
      if (!heldCopy.includes(target) || !heldCopy.includes(correctTranslation)) throw new Error(`Save failure dropped the exact held target/translation: ${heldCopy}`);
      const localFault = await page.evaluate(() => window.__pair10GermanLastFaultV1 || null);
      if (!localFault?.consumed || localFault.key !== 'amari_german_chapter_progress_v1' || localFault.mode !== faultPlan.localMode) throw new Error(`Expected bounded German local fault: ${JSON.stringify(localFault)}`);
      const afterFaultRaw = await getLogical('amari_german_chapter_progress_v1');
      if (faultPlan.localMode === 'throw-before-write' && afterFaultRaw !== faultPlan.rawBefore) throw new Error('German pre-write failure changed canonical progress bytes.');
      if (faultPlan.localMode === 'stale-readback' && (!localFault.committedWrite || afterFaultRaw === faultPlan.rawBefore)) throw new Error('Readback fault did not preserve the actual committed German record for Retry.');
      return { mode, target, translation: correctTranslation, progressBefore, answerRect: answerRect.rect, heldSaveError: true, localFault, faultRawUnchanged: faultPlan.localMode === 'throw-before-write' };
    }
    return { mode, target, translation: correctTranslation, progressBefore, answerRect: answerRect.rect, paintVisual: rowPaintVisual || null, heldSaveError: false };
  };

  const retryLocalSave = async ({ chapter, plannedParentFault = false, leaveForMenu = false, rewardBefore }) => {
    const retry = page.getByRole('button', { name: 'Retry save', exact: true });
    const retryRect = await measure(retry, 'Retry chapter save');
    if (plannedParentFault) await armStorageFault(page, { key: 'amari_rewards_v2', mode: 'throw-before-write' });
    await retry.click();
    if (plannedParentFault) {
      await retry.waitFor({ state: 'visible', timeout: 6000 });
      const afterParentFailure = await snapshot();
      const currentRewards = rewards(afterParentFailure);
      if (currentRewards.points !== rewardBefore.points
        || JSON.stringify(currentRewards.rewardClaims) !== JSON.stringify(rewardBefore.rewardClaims)
        || JSON.stringify(currentRewards.gamesPlayed) !== JSON.stringify(rewardBefore.gamesPlayed)) {
        throw new Error('Failed German parent claim changed points, claims, or game counts before retry.');
      }
      const receipt = await chapterReceipt(chapter.id);
      if (!receipt.receipt || receipt.receipt.parentClaimed !== false || !receipt.completed) throw new Error(`Local chapter receipt is not durably pending after parent failure: ${JSON.stringify(receipt.receipt)}`);
      const parentFault = await page.evaluate(() => window.__pair10GermanLastFaultV1 || null);
      if (!parentFault?.consumed || parentFault.key !== 'amari_rewards_v2' || parentFault.mode !== 'throw-before-write') throw new Error(`Expected German parent reward write fault: ${JSON.stringify(parentFault)}`);
      if (leaveForMenu) {
        await clickTask(page.getByRole('button', { name: 'Choose chapter', exact: true }), 'Leave pending German chapter result for the menu retry');
        await page.getByRole('heading', { name: 'German Garage', exact: true }).waitFor({ state: 'visible', timeout: 8000 });
        const menuRetry = page.getByRole('button', { name: 'Retry reward confirmation', exact: true });
        const menuRetryRect = await measure(menuRetry, 'Retry pending German reward from menu');
        await menuRetry.click();
        await menuRetry.waitFor({ state: 'hidden', timeout: 10000 });
        const recovered = await chapterReceipt(chapter.id);
        if (!recovered.receipt?.parentClaimed) throw new Error('Menu reward confirmation did not mark the pending German receipt claimed.');
        const after = await snapshot();
        if (rewards(after).points !== rewardBefore.points + 1) throw new Error('Menu reward confirmation did not award exactly one German point.');
        faults.push({ kind: 'parent-write-menu-retry', chapterId: chapter.id, transactionId: recovered.receipt.transactionId, pendingHeldBeforeBack: true, menuRetryRect: menuRetryRect.rect, recoveredOnce: true });
        return { retryRect: retryRect.rect, menuRetry: true, receipt: recovered.receipt };
      }
      await clickTask(retry, 'Retry saved German chapter and parent claim');
      await page.getByRole('status').filter({ hasText: /Chapter progress is saved/ }).waitFor({ state: 'visible', timeout: 10000 });
      const recovered = await chapterReceipt(chapter.id);
      if (!recovered.receipt?.parentClaimed) throw new Error('Retry did not confirm the same German chapter receipt.');
      const after = await snapshot();
      if (rewards(after).points !== rewardBefore.points + 1) throw new Error('Retry did not award exactly one German point.');
      faults.push({ kind: 'parent-write-held-retry', chapterId: chapter.id, transactionId: recovered.receipt.transactionId, retryRect: retryRect.rect, recoveredOnce: true });
      return { retryRect: retryRect.rect, menuRetry: false, receipt: recovered.receipt };
    }
    await page.getByRole('status').filter({ hasText: /Chapter progress is saved/ }).waitFor({ state: 'visible', timeout: 10000 });
    const recovered = await chapterReceipt(chapter.id);
    if (!recovered.receipt?.parentClaimed) throw new Error(`Local Retry did not finish the German receipt: ${JSON.stringify(recovered.receipt)}`);
    faults.push({ kind: 'local-save-retry', chapterId: chapter.id, localMode: 'stale-readback-recovered' });
    return { retryRect: retryRect.rect, receipt: recovered.receipt };
  };

  const completeWordChapter = async (chapter, opts = {}) => {
    const beforeProgress = await eligibility(chapter);
    const initialRewards = rewards(await snapshot());
    if (!await setVisibleSoundState(true, `Ensure sound is on before ${chapter.title}`)) throw new Error(`Could not enable German audio before ${chapter.title}.`);
    const chapterButtonRect = await selectChapter(chapter, beforeProgress.completed ? 'Replay chapter' : 'Start chapter');
    const actualDataChapter = await page.locator('.german-garage-page').getAttribute('data-german-chapter');
    if (actualDataChapter !== chapter.id) throw new Error(`Normal chapter action opened ${actualDataChapter}, expected ${chapter.id}`);
    const wrongSeen = false;
    const wordRows = [];
    let pendingLocalRetry = null;
    for (let index = 0; index < chapter.goal; index += 1) {
      await page.locator('[aria-label="German word clue"]').waitFor({ state: 'visible', timeout: 8000 });
      const target = await readTarget();
      const mode = modeForChapterRound(chapter, index);
      const expected = translationFor(mode, target);
      const first = index === 0;
      const isFreshEligible = beforeProgress.rewardEligible;
      const localMode = isFreshEligible && index === chapter.goal - 1 && chapter.id === 'colour-painter' ? 'throw-before-write'
        : isFreshEligible && index === chapter.goal - 1 && chapter.id === 'vehicle-workshop' ? 'stale-readback' : null;
      const preRaw = localMode ? await getLogical('amari_german_chapter_progress_v1') : null;
      const row = await solveWordRound(chapter, index, {
        wrong: first,
        faultPlan: localMode ? { localMode, rawBefore: preRaw } : null,
      });
      wordRows.push(row);
      if (row.heldSaveError) {
        const parentFault = chapter.id === 'colour-painter' && beforeProgress.rewardEligible;
        if (chapter.id === 'colour-painter') {
          pendingLocalRetry = await retryLocalSave({ chapter, plannedParentFault: true, rewardBefore: initialRewards });
        } else {
          pendingLocalRetry = await retryLocalSave({ chapter, rewardBefore: initialRewards });
        }
        break;
      }
      if (index < chapter.goal - 1) {
        const heldText = await waitForHeld();
        if (!heldText.includes(target) || !heldText.includes(expected)) throw new Error(`Held feedback is missing the exact bilingual word: ${heldText}`);
        await page.waitForTimeout(180);
        if (await readHeaderRound() !== row.progressBefore || await readTarget() !== target) throw new Error('The German word changed before the learner chose Next word.');
        const next = page.getByRole('button', { name: 'Next word', exact: true });
        await clickTask(next, 'Advance held German word');
      } else {
        const heldText = await waitForHeld();
        if (!heldText.includes(target) || !heldText.includes(expected)) throw new Error(`Final held feedback is missing the exact bilingual word: ${heldText}`);
      }
    }
    if (!pendingLocalRetry) {
      // The third chapter uses a separate route solver. Other word chapters
      // should finish on their last correct choice with the explicit action.
      const heldText = await waitForHeld();
      if (!heldText.includes('Chapter progress is saved')) throw new Error(`German chapter did not reach its saved held result: ${heldText}`);
    }
    const receipt = await chapterReceipt(chapter.id);
    const freshRewardCount = Object.entries(rewards(await snapshot()).rewardClaims)
      .filter(([key]) => key.startsWith('dino:german:') && initialRewards.rewardClaims[key] === undefined).length;
    if (beforeProgress.rewardEligible && !receipt.receipt && !pendingLocalRetry) throw new Error(`Eligible German chapter did not create a receipt: ${chapter.id}`);
    if (beforeProgress.rewardEligible && freshRewardCount !== 1) throw new Error(`Eligible German chapter must add exactly one new parent token, got ${freshRewardCount}: ${chapter.id}`);
    if (!beforeProgress.rewardEligible && freshRewardCount) throw new Error(`Legacy/completed German replay earned a new token: ${chapter.id}`);
    if (beforeProgress.rewardEligible && receipt.receipt?.parentClaimed !== true) throw new Error(`Eligible German chapter receipt is not confirmed after completion: ${JSON.stringify(receipt.receipt)}`);
    if (!pendingLocalRetry && receipt.receipt && receipt.receipt.parentClaimed !== true) throw new Error(`German receipt is not confirmed after completion: ${JSON.stringify(receipt.receipt)}`);
    if (!pendingLocalRetry && chapter.id !== 'direction-driver') {
      const finish = page.getByRole('button', { name: 'Finish chapter', exact: true });
      const finishRect = await measure(finish, 'Finish saved German chapter');
      if (!finalRender && chapter.id === 'vehicle-workshop') {
        finalRender = `${OUT}/${STAGE}-german-${WIDTH}x${HEIGHT}-${EXPECTED_ENTRY.split('/').pop().replace(/\.js$/, '')}-${Date.now()}.jpg`;
        await page.screenshot({ path: finalRender, type: 'jpeg', quality: 72, fullPage: false });
      }
      await finish.click();
      await waitMenu();
      rows.push({ kind: 'chapter', chapter: chapter.id, rounds: wordRows, roundCount: wordRows.length, wasReplay: beforeProgress.completed, rewardEligible: beforeProgress.rewardEligible, legacyRewardCeiling: beforeProgress.legacyCeiling, receipt: receipt.receipt, chapterButtonRect: chapterButtonRect.rect, finishRect: finishRect.rect, retry: pendingLocalRetry });
    } else if (pendingLocalRetry) {
      const finish = page.getByRole('button', { name: 'Finish chapter', exact: true });
      if (await finish.count() && await finish.isVisible()) {
        await clickTask(finish, 'Finish chapter after Retry');
        await waitMenu();
      }
      rows.push({ kind: 'chapter', chapter: chapter.id, rounds: wordRows, roundCount: wordRows.length, wasReplay: beforeProgress.completed, rewardEligible: beforeProgress.rewardEligible, legacyRewardCeiling: beforeProgress.legacyCeiling, receipt: (await chapterReceipt(chapter.id)).receipt, chapterButtonRect: chapterButtonRect.rect, retry: pendingLocalRetry });
    }
    return { beforeProgress, initialRewards, rows: wordRows, pendingRetry: pendingLocalRetry };
  };

  const completeDirectionChapter = async (chapter, opts = {}) => {
    const beforeProgress = await eligibility(chapter);
    const initialRewards = rewards(await snapshot());
    if (!await setVisibleSoundState(true, 'Ensure sound is on before Direction Driver playback')) throw new Error('Could not enable German audio before Direction Driver.');
    const chapterButtonRect = await selectChapter(chapter, beforeProgress.completed ? 'Replay chapter' : 'Start chapter');
    if (await page.locator('.german-garage-page').getAttribute('data-german-chapter') !== chapter.id) throw new Error('Direction Driver did not open from its normal chapter card.');
    await page.getByRole('button', { name: 'Start the driving routes', exact: true }).waitFor({ state: 'visible', timeout: 8000 });
    await page.getByText('Chapter complete!', { exact: true }).waitFor({ state: 'hidden', timeout: 5000 });
    const introCopy = (await page.locator('.german-garage-page main').innerText()).replace(/\s+/g, ' ').trim();
    if (!introCopy.toLowerCase().includes('learn six driving words')) throw new Error(`Direction Driver omitted its six-word teaching introduction: ${introCopy.slice(0, 250)}`);
    const introAudioBefore = await mediaCheckpoint();
    const soundOn = page.getByRole('button', { name: 'Turn sound on', exact: true });
    if (await soundOn.count() && await soundOn.isVisible()) await clickTask(soundOn, 'Enable packaged German route audio');
    const introButtons = page.getByRole('button', { name: /Tap to hear/ });
    if (await introButtons.count() !== 6) throw new Error(`Direction Driver intro must teach all six German commands, found ${await introButtons.count()}`);
    const firstCommand = PLAN.commands[0];
    await clickTask(page.getByRole('button', { name: new RegExp(`${firstCommand.id} · ${firstCommand.english}`) }).first(), `Hear the introductory ${firstCommand.id} command`);
    const introClip = await waitForLocalMedia(introAudioBefore);
    const expectedIntroPath = `/audio/de/${PLAN.audioSlugs[firstCommand.id]}.mp3`;
    if (new URL(introClip.src, ORIGIN).pathname !== expectedIntroPath) throw new Error(`Intro audio did not use its exact packaged clip: ${introClip.src}`);
    const introAdvanced = await waitForClipAdvance(expectedIntroPath, introClip.id);
    await assertClipStillActive(expectedIntroPath, introClip.id, 'Intro leave-cancel sample');
    await clickTask(page.getByRole('button', { name: 'Choose chapter', exact: true }), 'Leave the German word lesson while its clip is active');
    await waitMenu();
    await page.waitForTimeout(250);
    const introAfterLeave = (await mediaSnapshot()).find((clip) => clip.id === introClip.id);
    if (introAfterLeave && !introAfterLeave.paused && !introAfterLeave.ended) throw new Error('Leaving the direction lesson did not stop its active packaged clip.');
    coverage.audio.push({ path: expectedIntroPath, played: true, advanced: introAdvanced.currentTime > 0.02 });
    coverage.cancellation.push({ kind: 'intro-audio-leave-cancel', path: expectedIntroPath, activeStopped: !introAfterLeave || introAfterLeave.paused || introAfterLeave.ended });

    // Reopen the intro through the normal chapter card, then test queue cancel
    // on an actual two-command route board.
    await selectChapter(chapter, 'Restart Direction Driver after the intro audio cancellation check');
    await clickTask(page.getByRole('button', { name: 'Start the driving routes', exact: true }), 'Open a normal two-command route board for audio cancellation checks');
    const discloseRoute = page.getByRole('button', { name: 'Show words', exact: true });
    if (await discloseRoute.count() && await discloseRoute.isVisible()) await clickTask(discloseRoute, 'Read the visible two-command route before verifying its packaged audio');
    const audioRouteText = (await page.locator('.german-garage-page main').innerText()).replace(/\s+/g, ' ').trim();
    const audioRoute = PLAN.routes.find((route) => audioRouteText.includes(route.commands.join(' → ')));
    if (!audioRoute) throw new Error(`Could not read the current route words before audio verification: ${audioRouteText}`);
    const routeLessonAudioBefore = await mediaCheckpoint();
    const muteReplayStartAt = await page.evaluate(() => performance.now());
    await clickTask(page.getByRole('button', { name: 'Replay both German commands', exact: true }), 'Play both packaged route commands');
    const firstQueuedClip = await waitForLocalMedia(routeLessonAudioBefore);
    const firstReplayPath = new URL(firstQueuedClip.src, ORIGIN).pathname;
    const expectedRoutePath = `/audio/de/${PLAN.audioSlugs[audioRoute.commands[0]]}.mp3`;
    if (firstReplayPath !== expectedRoutePath) throw new Error(`Route playback did not begin with the first exact packaged command: ${firstReplayPath}, expected ${expectedRoutePath}`);
    const routeClipAdvanced = await waitForClipAdvance(expectedRoutePath, firstQueuedClip.id);
    await assertClipStillActive(expectedRoutePath, firstQueuedClip.id, 'Route mute-cancel sample');
    coverage.audio.push({ path: expectedRoutePath, played: true, routeCommand: audioRoute.commands[0], advanced: routeClipAdvanced.currentTime > 0.02 });
    await clickTask(page.getByRole('button', { name: 'Turn sound off', exact: true }), 'Mute queued German route audio');
    await page.waitForTimeout(250);
    const mutedQueue = await mediaSnapshot();
    const mutedFirstClip = mutedQueue.find((clip) => clip.id === firstQueuedClip.id && clip.events.some((event) => event.type === 'play-call' && event.at >= muteReplayStartAt));
    const mutedLaterStarts = mutedQueue.filter((clip) => clip.id !== firstQueuedClip.id && clip.totalEvents > (routeLessonAudioBefore[clip.id] ?? 0) && clip.events.some((event) => event.type === 'play-call' && event.at >= muteReplayStartAt));
    if (mutedFirstClip && !mutedFirstClip.paused && !mutedFirstClip.ended) throw new Error('Muting did not pause the active German route clip.');
    if (mutedLaterStarts.length) throw new Error(`Muting did not cancel queued German clips: ${JSON.stringify(mutedLaterStarts.map((clip) => clip.src))}`);
    coverage.cancellation.push({ kind: 'route-audio-mute-cancel', firstPath: firstReplayPath, activeStopped: !mutedFirstClip || mutedFirstClip.paused || mutedFirstClip.ended, laterClipStarts: mutedLaterStarts.length });
    await clickTask(page.getByRole('button', { name: 'Turn sound on', exact: true }), 'Restore German route audio after mute check');
    const replayAudioBefore = await mediaCheckpoint();
    const leaveReplayStartAt = await page.evaluate(() => performance.now());
    await clickTask(page.getByRole('button', { name: 'Replay both German commands', exact: true }), 'Replay packaged German route audio before leaving');
    const leaveQueuedClip = await waitForLocalMedia(replayAudioBefore);
    const leaveReplayPath = new URL(leaveQueuedClip.src, ORIGIN).pathname;
    await waitForClipAdvance(leaveReplayPath, leaveQueuedClip.id);
    await assertClipStillActive(leaveReplayPath, leaveQueuedClip.id, 'Route leave-cancel sample');
    await clickTask(page.getByRole('button', { name: 'Choose chapter', exact: true }), 'Leave German route board while audio is queued');
    await waitMenu();
    await page.waitForTimeout(900);
    const canceledQueue = await mediaSnapshot();
    const firstClip = canceledQueue.find((clip) => clip.id === leaveQueuedClip.id && clip.events.some((event) => event.type === 'play-call' && event.at >= leaveReplayStartAt));
    const laterStarts = canceledQueue.filter((clip) => clip.id !== leaveQueuedClip.id && clip.totalEvents > (replayAudioBefore[clip.id] ?? 0) && clip.events.some((event) => event.type === 'play-call' && event.at >= leaveReplayStartAt));
    if (firstClip && !firstClip.paused && !firstClip.ended) throw new Error('Leaving the German lesson did not cancel active audio.');
    if (laterStarts.length) throw new Error(`Leaving the lesson did not cancel queued German audio: ${JSON.stringify(laterStarts.map((clip) => clip.src))}`);
    coverage.cancellation.push({ kind: 'route-audio-leave-cancel', firstPath: leaveReplayPath, activeStopped: !firstClip || firstClip.paused || firstClip.ended, laterClipStarts: laterStarts.length });

    // Restart through the ordinary menu after the deliberate leave/cancel probe.
    await selectChapter(chapter, 'Restart Direction Driver after leaving its lesson');
    await page.getByRole('button', { name: 'Start the driving routes', exact: true }).waitFor({ state: 'visible', timeout: 8000 });
    await clickTask(page.getByRole('button', { name: 'Start the driving routes', exact: true }), 'Start the two-command driving route set');
    const routes = [];
    let pendingParentFailure = null;
    for (let routeIndex = 0; routeIndex < chapter.goal; routeIndex += 1) {
      const routeId = await page.locator('.german-garage-page').getAttribute('data-german-route');
      if (!routeId) throw new Error('Visible route board has no current route identity.');
      if (coverage.routeIds.includes(routeId)) throw new Error(`Direction Driver replay repeated route ${routeId} in one seven-route run.`);
      coverage.routeIds.push(routeId);
      const showWords = page.getByRole('button', { name: 'Show words', exact: true });
      if (await showWords.count() && await showWords.isVisible()) await clickTask(showWords, 'Reveal the optional German command list');
      const visibleRouteCopy = (await page.locator('.german-garage-page main').innerText()).replace(/\s+/g, ' ').trim();
      const routeCommands = PLAN.routes.find((route) => visibleRouteCopy.includes(route.commands.join(' → ')))?.commands || null;
      if (!routeCommands || routeCommands.length !== 2) throw new Error(`Visible route command list did not match an authored two-word route: ${visibleRouteCopy}`);
      const routeRow = { routeId, commands: routeCommands, assisted: true, steps: [] };
      for (let stepIndex = 0; stepIndex < 2; stepIndex += 1) {
        const expected = routeCommands[stepIndex];
        const expectedAction = PLAN.actionForCommand[expected];
        const correctCommand = PLAN.commands.find((command) => command.id === expected);
        const beforeStep = await page.locator('.german-garage-page').getAttribute('data-german-step');
        const beforeCar = await page.getByRole('gridcell').evaluateAll((cells) => cells.filter((cell) => cell.getAttribute('aria-label')?.includes(', car')).map((cell) => cell.getAttribute('aria-label')));
        let wrongAttempt = null;
        if (routeIndex === 0) {
          const wrongAction = Object.values(PLAN.actionForCommand).find((action) => action !== expectedAction);
          await clickTask(page.getByRole('button', { name: wrongAction, exact: true }), `Wrong first route action ${wrongAction}`);
          const wrongText = await page.locator('.german-garage-page [aria-live="polite"]').innerText();
          const afterWrongStep = await page.locator('.german-garage-page').getAttribute('data-german-step');
          const afterWrongCar = await page.getByRole('gridcell').evaluateAll((cells) => cells.filter((cell) => cell.getAttribute('aria-label')?.includes(', car')).map((cell) => cell.getAttribute('aria-label')));
          if (afterWrongStep !== beforeStep || JSON.stringify(afterWrongCar) !== JSON.stringify(beforeCar) || !wrongText.includes('The car stays here')) throw new Error(`Wrong route command changed position or step: ${JSON.stringify({ beforeStep, afterWrongStep, beforeCar, afterWrongCar, wrongText })}`);
          coverage.wrongRetry += 1;
          wrongAttempt = { action: wrongAction, feedback: wrongText, stepPreserved: true, positionPreserved: true };
        }
        const action = page.getByRole('button', { name: expectedAction, exact: true });
        const injectFinalParentFailure = beforeProgress.rewardEligible
          && routeIndex === chapter.goal - 1 && stepIndex === 1;
        if (injectFinalParentFailure) await armStorageFault(page, { key: 'amari_rewards_v2', mode: 'throw-before-write' });
        let actionRect;
        let keyboardAction = false;
        if (routeIndex === 0 && stepIndex === 0) {
          actionRect = await measure(action, `German route step ${stepIndex + 1}: ${expectedAction}`);
          await action.focus();
          const focusedName = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') || document.activeElement?.innerText?.trim() || '');
          if (focusedName !== expectedAction) throw new Error(`Keyboard route control did not expose its accessible action name: ${focusedName}`);
          await page.keyboard.press('Enter');
          keyboardAction = true;
        } else {
          actionRect = await clickTask(action, `German route step ${stepIndex + 1}: ${expectedAction}`);
        }
        if (injectFinalParentFailure) {
          const retrySave = page.getByRole('button', { name: 'Retry save', exact: true });
          await retrySave.waitFor({ state: 'visible', timeout: 8000 });
          const heldFailure = (await page.getByRole('alert').innerText()).replace(/\s+/g, ' ').trim();
          if (!heldFailure.includes(expected) || !heldFailure.includes(correctCommand?.english || '')) throw new Error(`Parent claim failure dropped the final German route facts: ${heldFailure}`);
          const routeFault = await page.evaluate(() => window.__pair10GermanLastFaultV1 || null);
          if (!routeFault?.consumed || routeFault.key !== 'amari_rewards_v2' || routeFault.mode !== 'throw-before-write') throw new Error(`Expected Direction Driver parent-reward fault: ${JSON.stringify(routeFault)}`);
          const pendingReceipt = await chapterReceipt(chapter.id);
          if (!pendingReceipt.completed || pendingReceipt.receipt?.parentClaimed !== false) throw new Error(`Direction Driver did not preserve a pending receipt after parent failure: ${JSON.stringify(pendingReceipt.receipt)}`);
          const failedRewardSnapshot = await snapshot();
          const failedRewards = rewards(failedRewardSnapshot);
          if (failedRewards.points !== initialRewards.points
            || JSON.stringify(failedRewards.rewardClaims) !== JSON.stringify(initialRewards.rewardClaims)
            || JSON.stringify(failedRewards.gamesPlayed) !== JSON.stringify(initialRewards.gamesPlayed)) {
            throw new Error('Failed Direction Driver parent claim changed points, claims, or game counts before Retry.');
          }
          pendingParentFailure = { retryRect: (await measure(retrySave, 'Retry Direction Driver reward save')).rect, heldFailure, receipt: pendingReceipt.receipt, fault: routeFault };
          routeRow.steps.push({ expected, english: correctCommand.english, action: expectedAction, actionRect: actionRect.rect, heldFailure, retryRect: pendingParentFailure.retryRect, parentWriteFailure: true, keyboardAction });
          break;
        }
        const heldText = await waitForHeld();
        if (!heldText.includes(expected) || !heldText.includes(correctCommand.english)) throw new Error(`Held route teaching copy did not explain ${expected}: ${heldText}`);
        const heldStep = await page.locator('.german-garage-page').getAttribute('data-german-step');
        await page.waitForTimeout(180);
        if (await page.locator('.german-garage-page').getAttribute('data-german-step') !== heldStep) throw new Error(`German route advanced before the explicit Next command: ${expected}`);
        const expectedNextName = stepIndex === 0 ? 'Next command' : routeIndex === chapter.goal - 1 ? null : 'Next route';
        const stepRect = expectedNextName ? await measure(page.getByRole('button', { name: expectedNextName, exact: true }), expectedNextName) : null;
        routeRow.steps.push({ expected, english: correctCommand.english, action: expectedAction, actionRect: actionRect.rect, wrongAttempt, heldText, nextRect: stepRect?.rect || null, resultingStep: await page.locator('.german-garage-page').getAttribute('data-german-step'), keyboardAction });
        if (stepIndex === 0) await clickTask(page.getByRole('button', { name: 'Next command', exact: true }), 'Continue from first held route command');
      }
      routes.push(routeRow);
      if (pendingParentFailure) break;
      if (routeIndex < chapter.goal - 1) await clickTask(page.getByRole('button', { name: 'Next route', exact: true }), 'Continue to next German route');
    }
    const routeReceipt = await chapterReceipt(chapter.id);
    const finish = page.getByRole('button', { name: 'Finish chapter', exact: true });
    let parentRetry = null;
    if (pendingParentFailure) {
      await clickTask(page.getByRole('button', { name: 'Choose chapter', exact: true }), 'Return to menu with a pending Direction Driver receipt');
      await waitMenu();
      const retry = page.getByRole('button', { name: 'Retry reward confirmation', exact: true });
      const retryRect = await measure(retry, 'Retry pending Direction Driver parent reward');
      await clickTask(retry, 'Confirm pending Direction Driver reward from the menu');
      await retry.waitFor({ state: 'hidden', timeout: 10000 });
      const claimed = await chapterReceipt(chapter.id);
      if (!claimed.receipt?.parentClaimed) throw new Error('Direction Driver menu Retry did not confirm the pending receipt.');
      const after = await snapshot();
      if (rewards(after).points !== initialRewards.points + 1) throw new Error('Direction Driver menu Retry did not award exactly one point.');
      parentRetry = { kind: 'menu', retryRect: retryRect.rect, transactionId: claimed.receipt.transactionId, recoveredOnce: true };
      faults.push({ kind: 'direction-parent-write-menu-retry', chapterId: chapter.id, transactionId: claimed.receipt.transactionId, heldFactsPreserved: true, retryRect: retryRect.rect, recoveredOnce: true });
    }
    if (!pendingParentFailure && beforeProgress.rewardEligible && !routeReceipt.receipt?.parentClaimed) {
      // The final route auto-saves. A pending claim can be exercised through
      // the menu Retry flow without changing the route, attempt, or receipt.
      const finalHeld = await waitForHeld();
      if (!finalHeld.includes('Chapter progress is saved')) throw new Error(`Direction Driver final held review is missing: ${finalHeld}`);
      if (await page.getByRole('button', { name: 'Retry save', exact: true }).count()) {
        await clickTask(page.getByRole('button', { name: 'Choose chapter', exact: true }), 'Return to menu with pending Direction Driver reward');
        await waitMenu();
        const retry = page.getByRole('button', { name: 'Retry reward confirmation', exact: true });
        const retryRect = await measure(retry, 'Retry pending Direction Driver reward');
        await clickTask(retry, 'Confirm pending Direction Driver reward from the menu');
        await retry.waitFor({ state: 'hidden', timeout: 10000 });
        const claimed = await chapterReceipt(chapter.id);
        if (!claimed.receipt?.parentClaimed) throw new Error('Direction Driver menu Retry did not confirm its receipt.');
        parentRetry = { kind: 'menu', rect: retryRect.rect, transactionId: claimed.receipt.transactionId };
      }
    }
    if (!parentRetry) {
      const finalHeld = await waitForHeld();
      if (!finalHeld.includes('Chapter progress is saved')) throw new Error(`Direction Driver completion not visibly saved: ${finalHeld}`);
      const rect = await measure(finish, 'Finish Direction Driver chapter');
      if (!finalRender) {
        finalRender = `${OUT}/${STAGE}-german-${WIDTH}x${HEIGHT}-${EXPECTED_ENTRY.split('/').pop().replace(/\.js$/, '')}-${Date.now()}.jpg`;
        await page.screenshot({ path: finalRender, type: 'jpeg', quality: 72, fullPage: false });
      }
      await finish.click();
      await waitMenu();
      rows.push({ kind: 'chapter', chapter: chapter.id, rounds: routes, roundCount: routes.length, wasReplay: beforeProgress.completed, rewardEligible: beforeProgress.rewardEligible, legacyRewardCeiling: beforeProgress.legacyCeiling, receipt: (await chapterReceipt(chapter.id)).receipt, chapterButtonRect: chapterButtonRect.rect, finishRect: rect.rect, parentRetry });
    } else {
      rows.push({ kind: 'chapter', chapter: chapter.id, rounds: routes, roundCount: routes.length, wasReplay: beforeProgress.completed, rewardEligible: beforeProgress.rewardEligible, legacyRewardCeiling: beforeProgress.legacyCeiling, receipt: (await chapterReceipt(chapter.id)).receipt, chapterButtonRect: chapterButtonRect.rect, parentRetry });
    }
    const rewardAfter = rewards(await snapshot());
    const newTokens = Object.entries(rewardAfter.rewardClaims).filter(([token]) => token.startsWith('dino:german:') && initialRewards.rewardClaims[token] === undefined);
    if (beforeProgress.rewardEligible && newTokens.length !== 1) throw new Error(`Fresh Direction Driver expected exactly one token claim, got ${newTokens.length}`);
    if (!beforeProgress.rewardEligible && newTokens.length) throw new Error('Direction Driver replay/legacy ceiling created a new claim.');
    return { beforeProgress, initialRewards, routes, parentRetry };
  };

  const playPracticeModes = async () => {
    if (!await setVisibleSoundState(true, 'Ensure sound is on before German practice playback')) throw new Error('Could not enable German audio before optional practice.');
    const before = await snapshot();
    const beforeRewards = rewards(before);
    const beforeProgress = await getLogical('amari_german_chapter_progress_v1');
    for (const [mode, menuLabel] of Object.entries(PLAN.practiceMenuLabels)) {
      await waitMenu();
      const button = page.getByRole('button', { name: menuLabel, exact: true });
      await clickNavigation(button, `Open optional practice mode ${mode}`);
      const currentChapter = await page.locator('.german-garage-page').getAttribute('data-german-chapter');
      if (currentChapter !== 'practice') throw new Error(`Practice ${mode} did not leave the chapter menu.`);
      const header = await page.locator('.german-garage-page header h1').innerText();
      if (!header.includes(menuLabel.replace(' · practice', '').replace(' · paint', '').replace(' · park', '').replace(' · parts', '').replace(' · directions', ''))) throw new Error(`Practice mode did not render its selected theme: ${header}`);
      await page.locator('[aria-label="German word clue"]').waitFor({ state: 'visible', timeout: 8000 });
      const target = await readTarget();
      const translation = translationFor(mode, target);
      const answer = visibleWordButton(translation);
      const answerRect = await clickTask(answer, `Answer optional ${mode} practice`);
      const held = await waitForHeld();
      if (!held.includes(target) || !held.includes(translation)) throw new Error(`Practice ${mode} lacks held bilingual feedback: ${held}`);
      const next = page.getByRole('button', { name: 'Next word', exact: true });
      const nextRect = await measure(next, `Practice ${mode} Next word`);
      await clickTask(page.getByRole('button', { name: 'Choose chapter', exact: true }), `Leave ${mode} practice without chapter completion`);
      await waitMenu();
      const afterMode = await snapshot();
      if (afterMode.raw.amari_german_chapter_progress_v1 !== beforeProgress) throw new Error(`Practice ${mode} changed chapter completion progress.`);
      const nowRewards = rewards(afterMode);
      if (nowRewards.points !== beforeRewards.points || JSON.stringify(nowRewards.rewardClaims) !== JSON.stringify(beforeRewards.rewardClaims)) throw new Error(`Practice ${mode} changed parent rewards.`);
      coverage.practiceModes.push({ mode, menuLabel, target, translation, answerRect: answerRect.rect, held, nextRect: nextRect.rect, noChapterReward: true });
    }
    const after = await snapshot();
    const nowRewards = rewards(after);
    if (nowRewards.points !== beforeRewards.points || JSON.stringify(nowRewards.rewardClaims) !== JSON.stringify(beforeRewards.rewardClaims)) throw new Error('Supplemental German practice created a parent reward.');
    return { modeCount: coverage.practiceModes.length, progressUnchanged: after.raw.amari_german_chapter_progress_v1 === beforeProgress };
  };

  try {
    await page.route('**/*', providerGuard);
    await page.setViewportSize({ width: WIDTH, height: HEIGHT });
    await page.goto(`${ORIGIN}/?qa_pair10_german=${Date.now()}`);
    await page.waitForLoadState('domcontentloaded', { timeout: 20000 });
    await assertRuntime();
    await installMediaObserver();
    initialStorage = await snapshot();
    const initialRewards = rewards(initialStorage);
    const initialLegacy = initialStorage.raw.amari_game_levels_v1 ?? null;
    const initialHistory = initialStorage.raw.amari_german_recent_targets_v1 ?? null;
    // Snapshot before opening German Garage: mounting the game can quietly
    // reconcile a previously saved positive receipt into parent rewards.
    await enterGarage({ alreadyLoaded: true });
    await waitMenu();
    originalSoundOn = await readVisibleSoundState();
    if (originalSoundOn === null) throw new Error('Could not read the original German sound preference from the visible toggle.');
    const soundEnabled = await setVisibleSoundState(true, 'Enable German audio through its visible sound control');
    if (!soundEnabled) throw new Error('Could not enable exact packaged German audio through the visible sound control.');
    await page.waitForTimeout(350);
    const startupProgressRaw = await getLogical('amari_german_chapter_progress_v1');
    if (startupProgressRaw && typeof startupProgressRaw === 'object') throw new Error('German startup progress could not be read for receipt reconciliation.');
    const startupProgress = parseProgress(startupProgressRaw);
    const pendingAtStartup = startupProgress.chapterReceipts.filter((receipt) => !receipt.parentClaimed);
    startupReconciliation.pendingBeforeMount = pendingAtStartup.length;
    if (pendingAtStartup.length) {
      const retry = page.getByRole('button', { name: 'Retry reward confirmation', exact: true });
      if (await retry.count() && await retry.isVisible()) {
        const retryRect = await measure(retry, 'Retry any saved German receipt remaining after automatic recovery');
        await clickTask(retry, 'Confirm remaining saved German reward receipts');
        await retry.waitFor({ state: 'hidden', timeout: 10000 });
        startupReconciliation.retriedFromMenu = true;
        startupReconciliation.retryRect = retryRect.rect;
      } else {
        await page.waitForTimeout(700);
      }
      const afterStartupRaw = await getLogical('amari_german_chapter_progress_v1');
      if (afterStartupRaw && typeof afterStartupRaw === 'object') throw new Error('German progress became unreadable during startup receipt recovery.');
      const afterStartup = parseProgress(afterStartupRaw);
      const stillPending = afterStartup.chapterReceipts.filter((receipt) => !receipt.parentClaimed);
      if (stillPending.length) throw new Error(`German startup did not confirm saved reward receipts: ${JSON.stringify(stillPending)}`);
      startupReconciliation.recovered = pendingAtStartup.length;
    }
    rows.push({ kind: 'normal-route', player: 'amari', world: 'Explore & Languages', entryIdentity });

    const firstChapterAudioBefore = await mediaCheckpoint();
    const first = await completeWordChapter(PLAN.chapters[0]);
    const audioClip = await waitForLocalMedia(firstChapterAudioBefore);
    coverage.audio.push({ path: new URL(audioClip.src, ORIGIN).pathname, played: true, advanced: audioClip.events.some((event) => ['timeupdate', 'ended'].includes(event.type)) });
    const firstProgress = await chapterReceipt(PLAN.chapters[0].id);
    if (firstProgress.receipt?.parentClaimed) {
      await page.reload();
      await page.waitForLoadState('domcontentloaded', { timeout: 20000 });
      await assertRuntime();
      await installMediaObserver();
      const restoredRoute = await waitAppHomeAfterReload();
      if (restoredRoute === 'german-garage') {
        await waitMenu();
        const restoredPlayer = page.locator('.discovery-profile strong');
        if (await restoredPlayer.innerText().catch(() => '') !== 'Amari') throw new Error('Reload restored German Garage under a different player profile.');
      } else {
        await enterGarage({ alreadyLoaded: true });
      }
      const firstCard = page.locator('.german-garage-page article').filter({ has: page.getByRole('heading', { level: 2, name: PLAN.chapters[0].title, exact: true }) });
      if (!(await firstCard.getByRole('button', { name: 'Replay · no reward', exact: true }).count())) throw new Error('Reload did not restore the completed first chapter as a replay with no reward.');
      rows.push({ kind: 'completion-reload', chapter: PLAN.chapters[0].id, receipt: firstProgress.receipt, cardRestored: true });
    }

    const second = await completeWordChapter(PLAN.chapters[1]);
    const third = await completeDirectionChapter(PLAN.chapters[2]);
    const practice = await playPracticeModes();

    soundPreferenceRestored = await setVisibleSoundState(originalSoundOn, 'Restore the original German sound preference through its visible control');
    if (!soundPreferenceRestored) throw new Error('German sound preference did not return to its original visible state.');

    const finalMenu = page.getByRole('button', { name: 'Back to learning world', exact: true });
    await clickTask(finalMenu, 'Return to Explore & Languages parent');
    await page.getByRole('heading', { name: 'Explore & Languages', exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    const finalStorage = await snapshot();
    const boundaries = assertStorageBoundaries(initialStorage, finalStorage, 'German Garage native run');
    const diagnosticsPreservation = assertGermanDiagnostics(initialStorage.raw.amari_game_diagnostics_v1, finalStorage.raw.amari_game_diagnostics_v1);
    const recentGameNavigation = assertRecentGameNavigation(initialStorage.raw.amari_recent_games, finalStorage.raw.amari_recent_games);
    const finalRewards = rewards(finalStorage);
    const rewardPreservation = assertRewardPreservation(initialStorage, finalStorage);
    const initialClaims = initialRewards.rewardClaims;
    const finalGermanClaims = Object.fromEntries(Object.entries(finalRewards.rewardClaims).filter(([token]) => token.startsWith('dino:german:')));
    const addedGermanClaims = Object.entries(finalGermanClaims).filter(([token]) => initialClaims[token] === undefined);
    const expectedNew = addedGermanClaims.length;
    if (addedGermanClaims.some(([, points]) => points !== 1)) throw new Error(`German claim delta was not one actual point: ${JSON.stringify(addedGermanClaims)}`);
    if (finalRewards.points - initialRewards.points !== expectedNew) throw new Error(`German point delta mismatch: ${finalRewards.points - initialRewards.points}, expected ${expectedNew}`);
    if (Number(finalRewards.gamesPlayed.german || 0) - Number(initialRewards.gamesPlayed.german || 0) !== expectedNew) throw new Error('German game-count delta does not match new parent claims.');
    if ((finalStorage.raw.amari_game_levels_v1 ?? null) !== initialLegacy) throw new Error('German wrote or altered the legacy game_levels map.');
    const currentHistory = finalStorage.raw.amari_german_recent_targets_v1 ?? null;
    if (currentHistory === null && initialHistory !== null) throw new Error('German removed existing recent-target history.');
    const historyPreservation = checkHistoryPreservation(initialHistory, currentHistory);
    if (!coverage.audio.length) throw new Error('No exact packaged German audio playback was recorded.');
    if (coverage.practiceModes.length !== Object.keys(PLAN.practiceMenuLabels).length) throw new Error('Not all supplemental practice themes were exercised through the menu.');
    if (coverage.routeIds.length && coverage.routeIds.length !== PLAN.routes.length) throw new Error(`Direction run did not cover all seven authored routes: ${JSON.stringify(coverage.routeIds)}`);
    if (coverage.wrongRetry < 4) throw new Error(`Expected a wrong-and-retry check for all three chapters plus a route; saw ${coverage.wrongRetry}`);
    if (diagnostics.providerAttempts.length || diagnostics.pageErrors.length || diagnostics.consoleErrors.length || diagnostics.requestErrors.length || diagnostics.responseErrors.length) throw new Error(`Unexpected page/provider/network diagnostics: ${JSON.stringify(diagnostics)}`);
    return {
      passed: true,
      stage: STAGE,
      origin: ORIGIN,
      viewport: `${WIDTH}x${HEIGHT}`,
      entryIdentity,
      namespaced,
      child: 'amari',
      chapters: rows.filter((row) => row.kind === 'chapter'),
      rows,
      chapterRoundCounts: { colourPainter: first.rows.length, vehicleWorkshop: second.rows.length, directionDriver: third.routes.length },
      totalChapterAnswers: first.rows.length + second.rows.length + third.routes.reduce((sum, route) => sum + route.steps.length, 0),
      routes: coverage.routeIds,
      practice,
      wrongRetryCount: coverage.wrongRetry,
      audio: coverage.audio,
      cancellation: coverage.cancellation,
      faults,
      startupReconciliation,
      originalSoundOn,
      soundPreferenceRestored,
      storageBoundaries: boundaries,
      diagnosticsPreservation,
      recentGameNavigation,
      rewardPreservation,
      historyPreservation,
      oldGameLevelsPreserved: true,
      rewardPointsDelta: finalRewards.points - initialRewards.points,
      newGermanClaims: addedGermanClaims,
      finalRender,
      failureScreenshot,
      diagnostics,
    };
  } catch (error) {
    try { soundPreferenceRestored = await restoreOriginalSoundPreference(); } catch {}
    try {
      failureScreenshot = `${OUT}/failure-german-${STAGE}-${WIDTH}x${HEIGHT}-${Date.now()}.jpg`;
      await page.screenshot({ path: failureScreenshot, type: 'jpeg', quality: 70, fullPage: false });
    } catch {}
    let current = null;
    try { current = await snapshot(); } catch {}
    return {
      passed: false,
      stage: STAGE,
      origin: ORIGIN,
      viewport: `${WIDTH}x${HEIGHT}`,
      entryIdentity,
      namespaced,
      rows,
      chapterRows: rows.filter((row) => row.kind === 'chapter').length,
      practiceModeCount: coverage.practiceModes.length,
      routeIds: coverage.routeIds,
      wrongRetryCount: coverage.wrongRetry,
      audio: coverage.audio,
      cancellation: coverage.cancellation,
      faults,
      startupReconciliation,
      originalSoundOn,
      soundPreferenceRestored,
      changedStorageKeys: initialStorage && current ? changedKeys(initialStorage.hashes, current.hashes) : [],
      finalRender,
      failureScreenshot,
      diagnostics,
      error: String(error?.stack || error).slice(-5000),
    };
  } finally {
    if (!soundPreferenceRestored && originalSoundOn !== null) {
      try { soundPreferenceRestored = await restoreOriginalSoundPreference(); } catch {}
    }
    try { await page.evaluate(() => window.__pair10GermanStorageFaultV1?.disarm?.()); } catch {}
    try { await page.evaluate(() => window.__pair10GermanMediaDisposeV1?.()); } catch {}
    try { await page.unroute('**/*', providerGuard); } catch {}
    page.off('pageerror', onPageError);
    page.off('console', onConsole);
    page.off('requestfailed', onRequestFailed);
    page.off('response', onResponse);
  }

  async function waitAppHomeAfterReload() {
    const restored = await page.waitForFunction(() => {
      const visible = (element) => !!element && element.getBoundingClientRect().width > 0 && element.getBoundingClientRect().height > 0;
      const garage = [...document.querySelectorAll('.german-garage-page h1')].some((heading) => heading.textContent?.trim() === 'German Garage' && visible(heading));
      const chooser = [...document.querySelectorAll('.discovery-intro-card--amari')].some(visible);
      const home = [...document.querySelectorAll('h1')].some((heading) => heading.textContent?.trim() === 'Choose a world' && visible(heading));
      return garage ? 'german-garage' : chooser ? 'player-chooser' : home ? 'world-home' : false;
    }, null, { timeout: 15000 });
    const route = await restored.jsonValue();
    await restored.dispose();
    return route;
  }
}
