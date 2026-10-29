async page => {
  const ORIGIN = __ORIGIN__;
  const EXPECTED_ENTRY = __EXPECTED_ENTRY__;
  const WIDTH = __WIDTH__;
  const HEIGHT = __HEIGHT__;
  const STAGE = __STAGE__;
  const OUT = __OUT__;
  const PLAN = __PLAN__;
  const armStorageFault = __FAULT_HELPER__;
  const MODULES = PLAN.modules;
  const BANDS = ['starter', 'growing', 'challenge'];
  const PROVIDER_URL = /(?:\/api\/|elevenlabs|openai|text-to-speech|story-provider)/i;
  const diagnostics = { providerAttempts: [], pageErrors: [], audioCancellationAbortErrors: [], consoleErrors: [], requestErrors: [], responseErrors: [], soundRestoreErrors: [] };
  const rows = [];
  const faultProofs = [];
  const coverage = { roundTypes: {}, restoredRoundTypes: {}, audio: [], wrongRetry: 0, reloads: [], nativeFaults: [] };
  let faultEligibilityObserved = false;
  let entryIdentity = null;
  let namespace = false;
  let screenshotPath = null;
  let finalRenderPath = null;
  let lastStorage = null;
  let audioCancellationInProgress = false;
  let soundPreferenceToRestore = null;

  const providerGuard = async (route) => {
    const url = route.request().url();
    if (PROVIDER_URL.test(url)) {
      diagnostics.providerAttempts.push(url);
      await route.fulfill({ status: 403, contentType: 'text/plain', body: 'Blocked by Pair10 retained-page QA guard' });
      return;
    }
    await route.continue();
  };
  const onPageError = (error) => {
    const message = String(error?.message || error);
    if (audioCancellationInProgress && (error?.name === 'AbortError' || /\bAbortError\b/i.test(message))) diagnostics.audioCancellationAbortErrors.push(message);
    else diagnostics.pageErrors.push(message);
  };
  const onConsole = (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (audioCancellationInProgress && /AbortError/i.test(text)) diagnostics.audioCancellationAbortErrors.push(text);
    else diagnostics.consoleErrors.push(text);
  };
  const onRequestFailed = (request) => diagnostics.requestErrors.push({ url: request.url(), error: request.failure()?.errorText || 'request failed' });
  const onResponse = (response) => { if (response.status() >= 400) diagnostics.responseErrors.push({ url: response.url(), status: response.status() }); };
  page.on('pageerror', onPageError);
  page.on('console', onConsole);
  page.on('requestfailed', onRequestFailed);
  page.on('response', onResponse);
  await page.route('**/*', providerGuard);

  const installMediaObserver = async () => page.evaluate(() => {
    if (window.__pair10CurriculumMediaInstalledV1) return;
    const prototype = HTMLMediaElement.prototype;
    const originalPlay = prototype.play;
    const records = [];
    const byElement = new WeakMap();
    let nextElementId = 0;
    const track = (element) => {
      let row = byElement.get(element);
      if (row) return row;
      row = { id: ++nextElementId, element, src: element.currentSrc || element.src || '', events: [] };
      byElement.set(element, row);
      const add = (type) => {
        const listener = () => {
          row.src = element.currentSrc || element.src || row.src;
          row.events.push({ type, currentTime: Number(element.currentTime) || 0, at: performance.now() });
          if (row.events.length > 32) row.events.shift();
        };
        element.addEventListener(type, listener);
        row.listeners.push([type, listener]);
      };
      row.listeners = [];
      ['play', 'playing', 'timeupdate', 'pause', 'ended', 'error'].forEach(add);
      records.push(row);
      window.__pair10CurriculumMediaRowsV1.push(row);
      while (records.length > 64) {
        const removed = records.shift();
        removed.listeners.forEach(([type, listener]) => removed.element.removeEventListener(type, listener));
        const index = window.__pair10CurriculumMediaRowsV1.indexOf(removed);
        if (index >= 0) window.__pair10CurriculumMediaRowsV1.splice(index, 1);
      }
      return row;
    };
    window.__pair10CurriculumMediaRowsV1 = [];
    prototype.play = function (...args) {
      const row = track(this);
      row.src = this.currentSrc || this.src || row.src;
      row.events.push({ type: 'play-call', currentTime: Number(this.currentTime) || 0, at: performance.now() });
      if (row.events.length > 32) row.events.shift();
      return originalPlay.apply(this, args);
    };
    const wrapper = prototype.play;
    window.__pair10CurriculumMediaInstalledV1 = true;
    window.__pair10CurriculumMediaDisposeV1 = () => {
      records.forEach((row) => row.listeners.forEach(([type, listener]) => row.element.removeEventListener(type, listener)));
      if (prototype.play === wrapper) prototype.play = originalPlay;
      delete window.__pair10CurriculumMediaRowsV1;
      delete window.__pair10CurriculumMediaInstalledV1;
      delete window.__pair10CurriculumMediaDisposeV1;
    };
  });
  const mediaSnapshot = async () => page.evaluate(() => (window.__pair10CurriculumMediaRowsV1 || []).map((row) => ({
    id: row.id,
    src: row.element.currentSrc || row.element.src || row.src,
    currentTime: Number(row.element.currentTime) || 0,
    duration: Number.isFinite(row.element.duration) ? row.element.duration : null,
    paused: row.element.paused,
    ended: row.element.ended,
    events: row.events.slice(),
  })));

  const assertRuntime = async () => {
    const actual = await page.evaluate(() => ({
      origin: location.origin,
      namespaced: window.__amariQaNamespaced === true,
      entry: document.querySelector('script[type="module"][src]')?.getAttribute('src') || null,
      scrollWidth: document.documentElement.scrollWidth,
      width: innerWidth,
      height: innerHeight,
    }));
    if (actual.origin !== new URL(ORIGIN).origin) throw new Error(`Unexpected app origin: ${actual.origin}`);
    if (!actual.namespaced) throw new Error('Retained storage namespace guard is missing.');
    if (actual.entry !== EXPECTED_ENTRY) throw new Error(`Compiled entry mismatch: ${actual.entry}`);
    if (actual.width !== WIDTH || actual.height !== HEIGHT) throw new Error(`Viewport mismatch: ${JSON.stringify(actual)}`);
    if (actual.scrollWidth > WIDTH) throw new Error(`Horizontal overflow: ${JSON.stringify(actual)}`);
    entryIdentity = actual.entry;
    namespace = actual.namespaced;
    return actual;
  };
  const measure = async (locator, label, minimum = 44) => {
    if (await locator.count() !== 1 || !await locator.isVisible()) throw new Error(`${label} is missing or not uniquely visible`);
    const actual = await locator.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return {
        name: (element.getAttribute('aria-label') || element.innerText || element.textContent || '').trim(),
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom },
        viewport: { width: innerWidth, height: innerHeight },
        centerHit: Boolean(hit && (hit === element || element.contains(hit))),
      };
    });
    if (actual.rect.width < minimum || actual.rect.height < minimum) throw new Error(`${label} is below ${minimum}px: ${JSON.stringify(actual)}`);
    if (actual.rect.x < 0 || actual.rect.y < 0 || actual.rect.right > WIDTH || actual.rect.bottom > HEIGHT || !actual.centerHit) {
      throw new Error(`${label} is clipped, covered, or outside the viewport: ${JSON.stringify(actual)}`);
    }
    return actual;
  };
  const clickTask = async (locator, label, minimum = 44) => {
    const geometry = await measure(locator, label, minimum);
    await locator.click();
    return geometry;
  };
  const restoreSoundPreference = async () => {
    if (soundPreferenceToRestore === null) return true;
    const turnSoundOn = page.getByRole('button', { name: 'Turn sound on', exact: true });
    let currentlyMuted = (await turnSoundOn.count()) > 0 && await turnSoundOn.isVisible();
    if (currentlyMuted !== soundPreferenceToRestore) {
      const toggleName = soundPreferenceToRestore ? 'Turn sound off' : 'Turn sound on';
      const toggle = page.getByRole('button', { name: toggleName, exact: true });
      if (!await toggle.count() || !await toggle.isVisible()) throw new Error(`Cannot restore original sound preference; visible ${toggleName} control is missing.`);
      await clickTask(toggle, `Restore original ${soundPreferenceToRestore ? 'muted' : 'sound-on'} preference`);
      currentlyMuted = (await turnSoundOn.count()) > 0 && await turnSoundOn.isVisible();
    }
    if (currentlyMuted !== soundPreferenceToRestore) throw new Error('Sound control did not restore the original preference.');
    soundPreferenceToRestore = null;
    return true;
  };
  const hashFaultRaw = async (value) => {
    if (typeof value !== 'string') return null;
    return page.evaluate(async (raw) => {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
      return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
    }, value);
  };
  const summarizeStorageFault = async (fault) => ({
    key: fault?.key || null,
    mode: fault?.mode || null,
    consumed: Boolean(fault?.consumed),
    committedWrite: Boolean(fault?.committedWrite),
    beforeRawSha256: await hashFaultRaw(fault?.beforeRaw),
    attemptedValueSha256: await hashFaultRaw(fault?.attemptedValue),
  });
  const retryCoverage = () => {
    const history = coverage.nativeFaults.some((fault) => fault.kind === 'history-write-retry');
    const completion = faultProofs.some((fault) => fault.kind === 'receipt-readback-and-parent-write-retry');
    const badgeRead = coverage.nativeFaults.some((fault) => fault.kind === 'badge-read-retry');
    const parentStickerRead = coverage.nativeFaults.some((fault) => fault.kind === 'parent-stickers-badge-read-retry');
    const status = (passed) => passed ? 'verified' : faultEligibilityObserved ? 'eligible-but-not-verified' : 'not-eligible-without-reset';
    return {
      historyWriteRetry: status(history),
      receiptReadbackAndParentWriteRetry: status(completion),
      badgeReadRetry: badgeRead ? 'verified' : 'not-run',
      parentStickersReadRetry: parentStickerRead ? 'verified' : 'not-run',
    };
  };
  const clickNavigation = async (locator, label) => {
    await locator.evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
    const geometry = await measure(locator, label);
    await locator.click();
    return geometry;
  };
  const returnTaskTop = async () => {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForFunction(() => window.scrollY === 0, null, { timeout: 3000 });
  };
  const getRaw = async (logicalKey) => page.evaluate((key) => {
    try { return localStorage.getItem(key); } catch { return null; }
  }, logicalKey);
  const storageSnapshot = async () => page.evaluate(async () => {
    const hashes = {};
    const raw = {};
    const rawNames = new Set([
      'amari_rewards_v2', 'amari_points', 'amari_games_played', 'amari_earned_sticker_ids_v1',
      'amari_curriculum_badges_v1', 'amari_curriculum_completion_receipts_v1',
      'amari_game_levels_v1', 'amari_german_recent_targets_v1',
    ]);
    for (let index = 0; index < localStorage.length; index += 1) {
      const physicalKey = localStorage.key(index);
      if (physicalKey === null) continue;
      const value = localStorage.getItem(physicalKey) ?? '';
      const bytes = new TextEncoder().encode(value);
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      hashes[physicalKey] = {
        sha256: [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join(''),
        bytes: bytes.length,
      };
      const logicalKey = physicalKey.startsWith('qa_rewards_20261024_') ? physicalKey.slice('qa_rewards_20261024_'.length) : physicalKey;
      if (rawNames.has(logicalKey)) raw[logicalKey] = value;
    }
    return { hashes, raw };
  });
  const allowedCurriculumKey = /^qa_rewards_20261024_amari_curriculum_(?:preferences_v1|badges_v1|completion_receipts_v1|(?:session_v1|recent_v1|history_transaction_v1)_(?:continents|time-detectives|nature-lab)_(?:starter|growing|challenge))$/;
  const allowedStoredKey = (key) => allowedCurriculumKey.test(key)
    // Exact event-sink keys updated by the visible Curriculum answer/replay actions.
    || ['qa_rewards_20261024_amari_rewards_v2', 'qa_rewards_20261024_amari_points',
      'qa_rewards_20261024_amari_games_played', 'qa_rewards_20261024_amari_earned_sticker_ids_v1',
      'qa_rewards_20261024_amari_game_diagnostics_v1', 'qa_rewards_20261024_amari_game_lifecycle_diagnostics_v1',
      'qa_rewards_20261024_amari_recent_games', 'qa_rewards_20261024_amari_learning_attempts_v1',
      'qa_rewards_20261024_amari_skill_mastery_v1'].includes(key);
  const changedKeys = (before, after) => [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key])).sort();
  const assertOnlyPairStorageChanged = (before, after, label) => {
    const changed = changedKeys(before.hashes, after.hashes);
    const unexpected = changed.filter((key) => !allowedStoredKey(key));
    if (unexpected.length) throw new Error(`${label} changed storage outside the Curriculum, Amari reward, and exact event-sink allowlist: ${JSON.stringify(unexpected)}`);
    const preservedRaw = ['amari_game_levels_v1', 'amari_german_recent_targets_v1'];
    for (const key of preservedRaw) if (before.raw[key] !== after.raw[key]) throw new Error(`${label} changed protected ${key}`);
    return { changed, unexpected, protectedLegacyUnchanged: preservedRaw };
  };
  const parse = (value, fallback) => {
    if (value === null || value === undefined) return fallback;
    try { return JSON.parse(value); } catch { throw new Error('A protected saved record became malformed.'); }
  };
  const rewardSummary = (snapshot) => {
    const record = parse(snapshot.raw.amari_rewards_v2, {});
    return {
      points: Number(record.points ?? parse(snapshot.raw.amari_points, 0)) || 0,
      gamesPlayed: record.gamesPlayed || parse(snapshot.raw.amari_games_played, {}),
      rewardClaims: record.rewardClaims || {},
      badges: parse(snapshot.raw.amari_earned_sticker_ids_v1, []),
    };
  };

  const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const waitReady = async (timeout = 10000) => {
    await page.locator('.quest-heading h1').waitFor({ state: 'visible', timeout });
    await page.waitForFunction(() => !document.body.innerText.includes('Getting your discovery run ready…'), null, { timeout });
  };
  const chooseAmariIfPrompted = async () => {
    const card = page.locator('.discovery-intro-card--amari');
    if (await card.count() && await card.isVisible()) {
      const age = (await card.locator('.discovery-intro-age').innerText()).trim();
      if (age !== 'Age 6+') throw new Error(`Expected the visible Amari Age 6+ profile, got ${age}`);
      await clickNavigation(card, 'Choose Amari Age 6+ after reload');
    }
  };
  const enterCurriculum = async ({ reload = false, alreadyLoaded = false } = {}) => {
    if (reload) await page.reload();
    else if (!alreadyLoaded) await page.goto(`${ORIGIN}/?qa_pair10_curriculum=${Date.now()}`);
    await page.waitForLoadState('domcontentloaded', { timeout: 20000 });
    await assertRuntime();
    await installMediaObserver();
    await chooseAmariIfPrompted();
    const worldTitle = page.getByRole('heading', { name: 'Choose a world', exact: true });
    if (await worldTitle.count() && await worldTitle.isVisible()) {
      const explore = page.locator('.discovery-world-card').filter({ hasText: 'Explore & Languages' }).first();
      await clickNavigation(explore, 'Open Explore & Languages world');
    }
    const exploreHeading = page.getByRole('heading', { name: 'Explore & Languages', exact: true });
    if (await exploreHeading.count() && await exploreHeading.isVisible()) {
      const gameCard = page.locator('.catalogue-game-card').filter({ hasText: 'Curriculum Quest' }).first();
      await clickNavigation(gameCard, 'Open Curriculum Quest card');
    }
    await waitReady();
    await assertRuntime();
    const heading = await page.locator('.quest-heading h1').innerText();
    if (!MODULES.some((module) => heading.includes(module.title))) throw new Error(`Unexpected active Curriculum module heading: ${heading}`);
    await returnTaskTop();
    return heading;
  };
  const caseReceipt = async (moduleId, band) => {
    const raw = await getRaw('amari_curriculum_completion_receipts_v1');
    const record = parse(raw, { completions: [] });
    const receipt = record.completions?.find((row) => row.moduleId === moduleId && row.difficulty === band) || null;
    const badges = parse(await getRaw('amari_curriculum_badges_v1'), []);
    return { receipt, badgePresent: Array.isArray(badges) && badges.includes(`${moduleId}:${band}`) };
  };
  const openPicker = async () => {
    const picker = page.locator('details.quest-stage-picker');
    if (await picker.getAttribute('open') === null) {
      await clickNavigation(picker.locator('summary'), 'Open topic and level picker');
    }
    return picker;
  };
  const selectModuleBand = async (module, band) => {
    await waitReady();
    const picker = await openPicker();
    const moduleButton = page.getByRole('navigation', { name: 'Curriculum modules' }).getByRole('button').filter({ hasText: module.title }).first();
    await clickNavigation(moduleButton, `Select module ${module.id}`);
    await waitReady();
    await openPicker();
    // The native select remains in the DOM but leaves the accessibility tree
    // when choosing a band closes its parent <details> element.
    const selector = page.locator('select[aria-label="Choose a level"]');
    await selector.evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
    const selectBounds = await measure(selector, `Select ${band} band`);
    await selector.selectOption(band);
    await waitReady();
    const actualTitle = (await page.locator('.quest-heading h1').innerText()).trim();
    if (!actualTitle.includes(module.title)) throw new Error(`Module did not settle on ${module.title}: ${actualTitle}`);
    const actualBand = await selector.inputValue();
    if (actualBand !== band) throw new Error(`Band selector returned ${actualBand}, expected ${band}`);
    await returnTaskTop();
    const prompt = page.locator('#quest-prompt');
    if (await prompt.count() && await prompt.isVisible()) {
      const text = (await prompt.innerText()).trim();
      if (module.id !== 'continents' && /^Find Africa on the map\.?$/i.test(text)) throw new Error(`Wrong-module Africa prompt flashed before ${module.id} was ready`);
    }
    return { selectBounds, picker };
  };
  const startOrResume = async () => {
    const complete = page.getByRole('heading', { name: 'You finished this discovery run!', exact: true });
    const completedOnEntry = await complete.count() > 0 && await complete.isVisible();
    if (completedOnEntry) {
      await clickTask(page.getByRole('button', { name: 'Restart this level', exact: true }), 'Restart this curriculum band');
      await complete.waitFor({ state: 'detached', timeout: 5000 });
    }
    const start = page.getByRole('button', { name: /^(Start round|Continue round)$/ });
    if (completedOnEntry) {
      await start.waitFor({ state: 'visible', timeout: 5000 });
      await clickTask(start, 'Start or continue curriculum questions');
      await page.locator('#quest-prompt').waitFor({ state: 'visible', timeout: 10000 });
    } else if (await start.count() && await start.isVisible()) {
      await clickTask(start, 'Start or continue curriculum questions');
      await page.locator('#quest-prompt').waitFor({ state: 'visible', timeout: 10000 });
    } else {
      await page.locator('#quest-prompt').waitFor({ state: 'visible', timeout: 10000 });
    }
    await returnTaskTop();
  };
  const roundByVisiblePrompt = (module, band, prompt) => {
    const matches = module.rounds[band].filter((round) => round.prompt.trim() === prompt.trim());
    if (matches.length !== 1) throw new Error(`Visible prompt did not map uniquely to authored ${module.id}/${band} source: ${JSON.stringify({ prompt, matches: matches.map((round) => round.id) })}`);
    return matches[0];
  };
  const answerLabel = (round) => {
    if (round.type === 'continent' || round.type === 'country' || round.type === 'ocean') {
      const name = PLAN.mapNames[round.answer];
      if (!name) throw new Error(`No authored map label for ${round.answer}`);
      return name;
    }
    return (round.options || []).find((option) => option.id === round.answer)?.label;
  };
  const chooseLabel = async (label, context = '.quest-play-stage') => {
    const locator = page.locator(context).getByRole('button', { name: `Choose ${label}`, exact: true });
    await clickTask(locator, `Choose visible answer ${label}`);
  };
  const chooseInvestigationPrediction = async (label) => {
    const locator = page.locator('.quest-play-stage').getByRole('button').filter({ hasText: label }).first();
    await clickTask(locator, `Choose visible prediction ${label}`);
  };
  const checkRetryHeld = async (round, priorProgress, model) => {
    await page.locator('.quest-feedback-card.is-retry').waitFor({ state: 'visible', timeout: 5000 });
    const prompt = (await page.locator('#quest-prompt').innerText()).trim();
    if (prompt !== round.prompt.trim()) throw new Error(`Wrong answer changed the question in ${round.id}`);
    const progress = (await page.locator('.quest-round-progress').innerText()).replace(/\s+/g, ' ').trim();
    if (progress !== priorProgress) throw new Error(`Wrong retry advanced ${model}: before=${priorProgress}, after=${progress}`);
    coverage.wrongRetry += 1;
    return { prompt, progress };
  };
  const performWrongOnce = async (round) => {
    if (round.type === 'sequence') {
      const ordered = [...round.items].sort((a, b) => a.order - b.order);
      if (ordered.length < 2) return null;
      await chooseLabel(ordered.at(-1).label);
    } else if (round.type === 'route') {
      const wrong = ['north', 'east', 'south', 'west'].find((direction) => direction !== round.path[0]);
      const labels = { north: 'N ↑', east: 'E →', south: 'S ↓', west: 'W ←' };
      await clickTask(page.getByRole('button', { name: labels[wrong], exact: true }), `Wrong route step ${wrong}`);
    } else if (round.type === 'investigation') {
      if (!(await page.getByText('Observation', { exact: true }).count())) {
        const prediction = round.predictions[0];
        await chooseInvestigationPrediction(prediction.label);
      }
      const wrong = round.options.find((option) => option.id !== round.answer);
      await chooseLabel(wrong.label);
    } else if (round.type === 'continent' || round.type === 'country' || round.type === 'ocean') {
      const wrongId = [...Object.keys(PLAN.mapNames)].find((id) => id !== round.answer && (round.type === 'ocean' ? ['pacific', 'atlantic', 'indian', 'southern', 'arctic'].includes(id) : !['pacific', 'atlantic', 'indian', 'southern', 'arctic'].includes(id)));
      await clickTask(page.getByRole('button', { name: `Choose ${PLAN.mapNames[wrongId]}`, exact: true }), `Wrong map choice for ${round.id}`);
    } else {
      const wrong = round.options.find((option) => option.id !== round.answer);
      if (!wrong) return null;
      await chooseLabel(wrong.label);
    }
    return true;
  };
  const playRound = async (module, band, round, { allowReload = false, armHistoryFault = false, armCompletionFault = false } = {}) => {
    const progressLocator = page.locator('.quest-round-progress');
    const priorProgress = (await progressLocator.innerText()).replace(/\s+/g, ' ').trim();
    const alreadyCorrect = await page.locator('.quest-feedback-card.is-correct').count();
    const freshRound = !alreadyCorrect;
    let wrongAttemptPerformed = false;
    if (freshRound) {
      if (await performWrongOnce(round)) {
        await checkRetryHeld(round, priorProgress, round.type);
        wrongAttemptPerformed = true;
      }
      if (round.type === 'investigation') {
        if (!(await page.getByText('Observation', { exact: true }).count())) await chooseInvestigationPrediction(round.predictions[0].label);
        const observation = page.locator('.quest-play-stage').getByText(round.observation, { exact: true });
        await observation.waitFor({ state: 'visible', timeout: 5000 });
        if (allowReload) {
          const beforePrediction = await page.locator('.quest-play-stage').innerText();
          await enterCurriculum({ reload: true });
          const afterPrediction = await page.locator('.quest-play-stage').innerText();
          if (!afterPrediction.includes(round.observation) || !afterPrediction.includes('What does the observation tell us?')) throw new Error('Investigation prediction/observation did not restore after reload.');
          coverage.reloads.push({ kind: 'investigation-open-question', module: module.id, band, prompt: round.prompt, persistedObservation: true, beforeChars: beforePrediction.length, afterChars: afterPrediction.length });
        }
        const wrong = round.options.find((option) => option.id !== round.answer);
        if (wrong && !wrongAttemptPerformed) {
          const before = (await progressLocator.innerText()).replace(/\s+/g, ' ').trim();
          await chooseLabel(wrong.label);
          await checkRetryHeld(round, before, 'investigation conclusion');
          if (!(await page.getByText(round.observation, { exact: true }).count())) throw new Error('Wrong investigation conclusion lost the observation.');
        }
        await chooseLabel(round.options.find((option) => option.id === round.answer).label);
      } else if (round.type === 'sequence') {
        const items = [...round.items].sort((a, b) => a.order - b.order);
        for (const item of items) await chooseLabel(item.label);
      } else if (round.type === 'route') {
        const labels = { north: 'N ↑', east: 'E →', south: 'S ↓', west: 'W ←' };
        for (const direction of round.path) await clickTask(page.getByRole('button', { name: labels[direction], exact: true }), `Route step ${direction}`);
      } else {
        await chooseLabel(answerLabel(round));
      }
    }
    await page.locator('.quest-feedback-card.is-correct').waitFor({ state: 'visible', timeout: 8000 });
    const fact = (await page.locator('.quest-fact-copy').innerText()).trim();
    if (fact !== round.explanation.trim()) throw new Error(`Held fact mismatch for ${round.id}`);
    const typeCounts = freshRound ? coverage.roundTypes : coverage.restoredRoundTypes;
    typeCounts[round.type] = (typeCounts[round.type] || 0) + 1;

    if (allowReload && freshRound && round.type !== 'investigation') {
      const promptBefore = (await page.locator('#quest-prompt').innerText()).trim();
      const buttonBefore = round.id;
      await enterCurriculum({ reload: true });
      const promptAfter = (await page.locator('#quest-prompt').innerText()).trim();
      const factAfter = (await page.locator('.quest-fact-copy').innerText()).trim();
      if (promptAfter !== promptBefore || factAfter !== fact || !await page.getByRole('button', { name: /^(Next question|Finish run)$/ }).isVisible()) {
        throw new Error(`Held Curriculum fact failed to restore through reload for ${round.id}`);
      }
      coverage.reloads.push({ kind: 'held-fact', module: module.id, band, roundId: buttonBefore, prompt: promptBefore, preserved: true });
    }

    if (freshRound && coverage.audio.length === 0) {
      const audioButton = page.getByRole('button', { name: /^Hear fact:/ }).first();
      if (await audioButton.count() && await audioButton.isVisible()) {
        const turnSoundOn = page.getByRole('button', { name: 'Turn sound on', exact: true });
        const startedMuted = await turnSoundOn.count() > 0 && await turnSoundOn.isVisible();
        soundPreferenceToRestore = startedMuted;
        let audioProof = null;
        try {
          if (startedMuted) await clickTask(turnSoundOn, 'Temporarily enable sound for the packaged fact check');
          await page.waitForFunction(() => [...document.querySelectorAll('button[aria-label^="Hear fact:"]')].some((button) => !button.disabled), null, { timeout: 5000 });
          if (!round.audioClip) throw new Error(`No exact packaged fact clip is mapped for ${round.id}.`);
          const expectedClip = new URL(round.audioClip, ORIGIN);
          const before = await mediaSnapshot();
          await clickTask(audioButton, 'Play packaged Curriculum fact');
          const existingElementIds = before.map((row) => row.id);
          const playbackIdHandle = await page.waitForFunction(({ expectedPath, existingElementIds }) => (window.__pair10CurriculumMediaRowsV1 || []).find((row) => {
            if (existingElementIds.includes(row.id)) return false;
            const src = row.element.currentSrc || row.element.src || row.src;
            if (!src) return false;
            const clipPath = new URL(src, location.origin).pathname;
            const playing = row.events.some((event) => event.type === 'playing');
            const advanced = row.events.some((event) => event.type === 'timeupdate' && event.currentTime > 0)
              || row.events.some((event) => event.type === 'ended' && event.currentTime > 0);
            return clipPath === expectedPath && playing && advanced;
          })?.id || false, { expectedPath: expectedClip.pathname, existingElementIds }, { timeout: 8000 });
          const playedElementId = await playbackIdHandle.jsonValue();
          const after = await mediaSnapshot();
          const played = after.find((row) => row.id === playedElementId && row.src && new URL(row.src, ORIGIN).origin === expectedClip.origin && new URL(row.src, ORIGIN).pathname === expectedClip.pathname);
          const heardPlaying = played?.events.some((event) => event.type === 'playing');
          const advancedOrEnded = played?.events.some((event) => event.type === 'timeupdate' && event.currentTime > 0)
            || played?.events.some((event) => event.type === 'ended' && event.currentTime > 0);
          if (!played || !heardPlaying || !advancedOrEnded) throw new Error(`Exact packaged fact clip did not play and advance: expected=${expectedClip.pathname}, observed=${JSON.stringify(played?.events || [])}`);
          const activeBeforeMute = await page.evaluate(({ expectedPath, playedElementId }) => {
            const row = (window.__pair10CurriculumMediaRowsV1 || []).find((candidate) => {
              if (candidate.id !== playedElementId) return false;
              const src = candidate.element.currentSrc || candidate.element.src || candidate.src;
              return src && new URL(src, location.origin).pathname === expectedPath;
            });
            return Boolean(row && !row.element.paused && !row.element.ended && row.element.currentTime > 0);
          }, { expectedPath: expectedClip.pathname, playedElementId });
          if (!activeBeforeMute) throw new Error(`The exact fact clip was not active at the mute check: ${expectedClip.pathname}`);
          const toggle = page.getByRole('button', { name: 'Turn sound off', exact: true });
          audioCancellationInProgress = true;
          await clickTask(toggle, 'Mute Curriculum audio');
          await page.waitForTimeout(200);
          audioCancellationInProgress = false;
          const afterMute = await mediaSnapshot();
          const latest = afterMute.find((row) => row.id === played.id);
          if (!latest || !latest.paused || latest.currentTime > 0.05) throw new Error('Muting did not stop and reset the active Curriculum clip.');
          audioProof = { path: expectedClip.pathname, played: true, playingEvent: heardPlaying, advancedOrEnded, activeAtMute: activeBeforeMute, mutedStopped: true, initiallyMuted: startedMuted };
        } finally {
          audioCancellationInProgress = false;
          try { await restoreSoundPreference(); }
          catch (error) { diagnostics.soundRestoreErrors.push(String(error?.message || error)); }
        }
        const preferenceRestored = soundPreferenceToRestore === null;
        if (!preferenceRestored) throw new Error('The packaged audio check did not restore the child’s original sound preference.');
        if (audioProof) coverage.audio.push({ ...audioProof, preferenceRestored });
      }
    }

    let retryTransaction = null;
    let historyBefore = null;
    let previousHistoryTransaction = null;
    let historyKey = null;
    if (armHistoryFault && roundCursorIsFirst(priorProgress)) {
      const key = `amari_curriculum_history_transaction_v1_${module.id}_${band}`;
      historyKey = `amari_curriculum_recent_v1_${module.id}_${band}`;
      historyBefore = await getRaw(historyKey);
      previousHistoryTransaction = await getRaw(key);
      await armStorageFault(page, { key, mode: 'throw-before-write' });
    }
    const isLast = /Question\s+5\s+of\s+5/.test(priorProgress);
    const nextLabel = isLast ? 'Finish run' : 'Next question';
    const next = page.getByRole('button', { name: nextLabel, exact: true });
    const nextBefore = await measure(next, `Held-fact ${nextLabel}`);
    const beforeNextPrompt = (await page.locator('#quest-prompt').innerText()).trim();
    if (armCompletionFault && isLast) await armStorageFault(page, { key: 'amari_curriculum_completion_receipts_v1', mode: 'stale-readback' });
    await next.click();
    if (armHistoryFault && roundCursorIsFirst(priorProgress)) {
      const retry = page.getByRole('button', { name: 'Retry save', exact: true });
      await retry.waitFor({ state: 'visible', timeout: 5000 });
      const stillHeld = (await page.locator('.quest-fact-copy').innerText()).trim();
      if (stillHeld !== fact || (await page.locator('#quest-prompt').innerText()).trim() !== beforeNextPrompt) throw new Error('History-write failure did not preserve the same held fact/round.');
      const fault = await page.evaluate(() => window.__pair10CurriculumLastFaultV1 || null);
      if (!fault?.consumed || fault.key !== `amari_curriculum_history_transaction_v1_${module.id}_${band}`) throw new Error(`Expected one bounded history write fault; observed key=${fault?.key || 'missing'}, mode=${fault?.mode || 'missing'}, consumed=${Boolean(fault?.consumed)}.`);
      if (await getRaw(`amari_curriculum_history_transaction_v1_${module.id}_${band}`) !== previousHistoryTransaction) throw new Error('The failed history write changed the prior transaction before Retry.');
      if (await getRaw(historyKey) !== historyBefore) throw new Error('The failed history write changed recent history before Retry.');
      await clickTask(retry, 'Retry held Curriculum history transaction');
      await page.waitForTimeout(100);
      const appliedTransaction = JSON.parse(await getRaw(`amari_curriculum_history_transaction_v1_${module.id}_${band}`) || 'null');
      if (!appliedTransaction || appliedTransaction.status !== 'applied' || appliedTransaction.moduleId !== module.id || appliedTransaction.difficulty !== band || appliedTransaction.roundId !== round.id) throw new Error(`History Retry did not durably apply the held ${module.id}/${band}/${round.id} transaction.`);
      const historyAfter = JSON.parse(await getRaw(`amari_curriculum_recent_v1_${module.id}_${band}`) || 'null');
      const attemptedTransaction = JSON.parse(fault.attemptedValue || 'null');
      const expectedHistory = attemptedTransaction?.historyNext;
      if (!Array.isArray(historyAfter) || JSON.stringify(historyAfter) !== JSON.stringify(expectedHistory)) throw new Error('History Retry did not apply exactly the pending transaction’s next history.');
      if (fault.beforeRaw !== previousHistoryTransaction || !attemptedTransaction || attemptedTransaction.status !== 'pending'
        || attemptedTransaction.transactionId !== appliedTransaction.transactionId
        || JSON.stringify(attemptedTransaction.historyNext) !== JSON.stringify(appliedTransaction.historyNext)) {
        throw new Error('History Retry did not reuse the exact attempted transaction.');
      }
      coverage.nativeFaults.push({ kind: 'history-write-retry', key: fault.key, sameTransactionIdAfterRetry: true, committedWrite: fault.committedWrite, retryAction: 'Retry save', exactRoundPreserved: true, priorTransactionPreservedUntilRetry: fault.beforeRaw === previousHistoryTransaction, priorHistoryPreservedUntilRetry: true, oneHistoryApplied: true });
      retryTransaction = fault.key;
    }
    if (armCompletionFault && isLast) {
      const retry = page.getByRole('button', { name: 'Retry save', exact: true });
      await retry.waitFor({ state: 'visible', timeout: 5000 });
      const heldFact = (await page.locator('.quest-fact-copy').innerText()).trim();
      if (heldFact !== fact || (await page.locator('#quest-prompt').innerText()).trim() !== beforeNextPrompt) throw new Error('Completion readback failure did not preserve the same final fact and question.');
      const receiptFault = await page.evaluate(() => window.__pair10CurriculumLastFaultV1 || null);
      if (!receiptFault?.consumed || !receiptFault.committedWrite || receiptFault.key !== 'amari_curriculum_completion_receipts_v1') throw new Error(`Expected one completion receipt write/readback fault; got key=${receiptFault?.key || 'missing'}, mode=${receiptFault?.mode || 'missing'}, consumed=${Boolean(receiptFault?.consumed)}, committed=${Boolean(receiptFault?.committedWrite)}.`);
      const pending = await caseReceipt(module.id, band);
      if (pending.receipt?.status !== 'pending') throw new Error(`Completion readback failure did not retain its pending receipt: ${JSON.stringify(pending.receipt)}`);
      const rewardBeforeRetry = rewardSummary(await storageSnapshot());
      await armStorageFault(page, { key: 'amari_rewards_v2', mode: 'throw-before-write' });
      await clickTask(retry, 'Retry Curriculum receipt and parent claim');
      await retry.waitFor({ state: 'visible', timeout: 5000 });
      const rewardDuringFailure = rewardSummary(await storageSnapshot());
      if (rewardDuringFailure.points !== rewardBeforeRetry.points) throw new Error('Failed parent claim changed points before Retry.');
      const parentFault = await page.evaluate(() => window.__pair10CurriculumLastFaultV1 || null);
      if (!parentFault?.consumed || parentFault.key !== 'amari_rewards_v2' || parentFault.mode !== 'throw-before-write') throw new Error(`Expected the parent write fault; got key=${parentFault?.key || 'missing'}, mode=${parentFault?.mode || 'missing'}, consumed=${Boolean(parentFault?.consumed)}.`);
      await clickTask(page.getByRole('button', { name: 'Retry save', exact: true }), 'Retry the same Curriculum parent claim');
      await page.getByRole('heading', { name: 'You finished this discovery run!', exact: true }).waitFor({ state: 'visible', timeout: 10000 });
      faultProofs.push({ kind: 'receipt-readback-and-parent-write-retry', receipt: await summarizeStorageFault(receiptFault), parentFault: await summarizeStorageFault(parentFault), sameBand: `${module.id}:${band}`, pendingRetained: true, rewardUnchangedUntilRetry: true, oneClaimAfterRetry: true });
    }
    return { round: round.id, type: round.type, prompt: round.prompt, fact, priorProgress, freshlyAnswered: freshRound, actionRect: nextBefore, retryTransaction };
  };

  function roundCursorIsFirst(progressText) { return /Question\s+1\s+of\s+5/.test(progressText); }

  const runBand = async (module, band, { faults = false, reloadFirstFact = false, purpose = 'required' } = {}) => {
    const receiptBefore = await caseReceipt(module.id, band);
    const eligible = !receiptBefore.receipt && !receiptBefore.badgePresent;
    if (faults && eligible) faultEligibilityObserved = true;
    await selectModuleBand(module, band);
    await startOrResume();
    const moduleRows = [];
    for (let position = 0; position < 5; position += 1) {
      const completed = page.getByRole('heading', { name: 'You finished this discovery run!', exact: true });
      if (await completed.count() && await completed.isVisible()) break;
      await page.locator('#quest-prompt').waitFor({ state: 'visible', timeout: 10000 });
      const prompt = (await page.locator('#quest-prompt').innerText()).trim();
      const round = roundByVisiblePrompt(module, band, prompt);
      const row = await playRound(module, band, round, {
        allowReload: (reloadFirstFact && position === 0 && round.type !== 'investigation')
          || (reloadFirstFact && round.type === 'investigation' && coverage.reloads.length === 0),
        armHistoryFault: faults && !coverage.nativeFaults.some((fault) => fault.kind === 'history-write-retry') && position === 0,
        armCompletionFault: faults && eligible && !faultProofs.some((fault) => fault.kind === 'receipt-readback-and-parent-write-retry'),
      });
      moduleRows.push(row);
    }
    const currentReceipt = await caseReceipt(module.id, band);
    await page.getByRole('heading', { name: 'You finished this discovery run!', exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    const freshQuestionCount = moduleRows.filter((question) => question.freshlyAnswered).length;
    const needsFreshReplay = purpose === 'required' && freshQuestionCount !== 5;
    const storedPurpose = needsFreshReplay ? 'resumed-recovery' : purpose;
    if (storedPurpose === 'required' && module.id === 'nature-lab' && band === 'challenge' && !finalRenderPath) {
      const entryTag = EXPECTED_ENTRY.split('/').pop().replace(/\.js$/, '');
      finalRenderPath = `${OUT}/${STAGE}-curriculum-${WIDTH}x${HEIGHT}-${entryTag}-${Date.now()}.jpg`;
      await page.screenshot({ path: finalRenderPath, type: 'jpeg', quality: 72, fullPage: false });
    }
    const receiptAfter = await caseReceipt(module.id, band);
    if (!receiptAfter.badgePresent) throw new Error(`Expected the ${module.id}:${band} badge after confirmed completion.`);
    if (eligible && receiptAfter.receipt?.status !== 'confirmed') throw new Error(`Fresh completion did not reach confirmed local receipt: ${JSON.stringify(receiptAfter.receipt)}`);
    rows.push({ kind: 'curriculum-module-band', purpose: storedPurpose, module: module.id, band, questions: moduleRows, questionCount: moduleRows.length, freshQuestionCount, eligibleBefore: eligible, receiptBefore: receiptBefore.receipt?.status || null, receiptAfter: receiptAfter.receipt?.status || null, badgePresent: receiptAfter.badgePresent });
    if (currentReceipt.receipt?.status === 'legacy' && receiptAfter.receipt?.status !== 'legacy') throw new Error('Legacy badge replay was not retained as a no-credit receipt.');
    if (needsFreshReplay) await runBand(module, band, { faults, reloadFirstFact, purpose: 'required' });
  };

  const ensureTypeObserved = async (moduleId, allowedBands, type, maxExtraRuns = 4) => {
    if ((coverage.roundTypes[type] || 0) > 0) return;
    const module = MODULES.find((item) => item.id === moduleId);
    for (let attempt = 0; attempt < maxExtraRuns; attempt += 1) {
      if ((coverage.roundTypes[type] || 0) > 0) return;
      const band = allowedBands[attempt % allowedBands.length];
      await runBand(module, band, { faults: false, reloadFirstFact: false, purpose: 'model-supplement' });
    }
    if (!(coverage.roundTypes[type] || 0)) throw new Error(`Normal replay did not surface required authored ${moduleId}/${type} interaction within ${maxExtraRuns} runs.`);
  };

  try {
    await page.setViewportSize({ width: WIDTH, height: HEIGHT });
    await page.goto(`${ORIGIN}/?qa_pair10_curriculum=${Date.now()}`);
    await page.waitForLoadState('domcontentloaded', { timeout: 20000 });
    await assertRuntime();
    await installMediaObserver();
    const before = await storageSnapshot();
    lastStorage = before;
    const initialWorld = await enterCurriculum({ alreadyLoaded: true });
    rows.push({ kind: 'normal-route', player: 'amari', world: 'Explore & Languages', initialModuleHeading: initialWorld });
    for (const module of MODULES) {
      for (const band of BANDS) {
        const firstCombo = module.id === 'continents' && band === 'starter';
        await runBand(module, band, { faults: true, reloadFirstFact: firstCombo });
      }
    }
    await ensureTypeObserved('continents', ['growing', 'challenge'], 'route', 4);
    await ensureTypeObserved('time-detectives', BANDS, 'sequence', 1);
    await ensureTypeObserved('nature-lab', ['growing', 'challenge'], 'investigation', 4);

    await clickTask(page.getByRole('button', { name: 'Back to learning world', exact: true }), 'Return before badge-read retry probe');
    await page.getByRole('heading', { name: 'Explore & Languages', exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    const badgeReadBefore = await getRaw('amari_curriculum_badges_v1');
    if (badgeReadBefore === null) throw new Error('Expected the completed Curriculum badge list before the read-retry probe.');
    await armStorageFault(page, { key: 'amari_curriculum_badges_v1', mode: 'throw-on-read', count: 2 });
    const curriculumCard = page.locator('.catalogue-game-card').filter({ hasText: 'Curriculum Quest' }).first();
    await clickNavigation(curriculumCard, 'Reopen Curriculum Quest for badge-read retry');
    await waitReady();
    const badgeDisclosure = page.locator('details.quest-badge-disclosure');
    if (await badgeDisclosure.getAttribute('open') === null) await clickNavigation(badgeDisclosure.locator('summary'), 'Show saved badge collection status');
    const badgeStatus = page.locator('.quest-badge-read-error');
    await badgeStatus.waitFor({ state: 'visible', timeout: 5000 });
    const badgeErrorCopy = (await badgeStatus.innerText()).replace(/\s+/g, ' ').trim();
    if (!badgeErrorCopy.includes('could not be read') || !badgeErrorCopy.includes('not being shown as empty')) throw new Error(`Unreadable badges were not explained without implying an empty collection: ${badgeErrorCopy}`);
    const retryBadgeRead = page.getByRole('button', { name: 'Retry badge read', exact: true });
    await retryBadgeRead.evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
    const retryBadgeRect = await measure(retryBadgeRead, 'Retry unreadable badge collection');
    const badgeFault = await page.evaluate(() => window.__pair10CurriculumLastFaultV1 || null);
    if (!badgeFault?.consumed || badgeFault.key !== 'amari_curriculum_badges_v1' || badgeFault.mode !== 'throw-on-read') throw new Error(`Expected the bounded badge read fault; got key=${badgeFault?.key || 'missing'}, mode=${badgeFault?.mode || 'missing'}, consumed=${Boolean(badgeFault?.consumed)}.`);
    await retryBadgeRead.click();
    await badgeStatus.waitFor({ state: 'detached', timeout: 5000 });
    const badgesAfterRetry = await getRaw('amari_curriculum_badges_v1');
    if (badgesAfterRetry !== badgeReadBefore) throw new Error('Badge read Retry changed the original collection bytes.');
    coverage.nativeFaults.push({ kind: 'badge-read-retry', key: badgeFault.key, failedReads: 2, retryLabel: 'Retry badge read', retryRect: retryBadgeRect.rect, rawPreserved: true, recoveredWithoutWrite: true });
    const retryResults = retryCoverage();
    if (faultEligibilityObserved && (retryResults.historyWriteRetry !== 'verified' || retryResults.receiptReadbackAndParentWriteRetry !== 'verified')) {
      throw new Error(`A naturally eligible Curriculum band did not complete its fault-retry checks: ${JSON.stringify(retryResults)}`);
    }

    const after = await storageSnapshot();
    const storageChanges = assertOnlyPairStorageChanged(before, after, 'Curriculum native run');
    const beforeRewards = rewardSummary(before);
    const afterRewards = rewardSummary(after);
    const pairTokens = new Set(MODULES.flatMap((module) => BANDS.map((band) => `dino:curriculum:${module.id}:${band}`)));
    for (const [token, amount] of Object.entries(beforeRewards.rewardClaims)) {
      if (afterRewards.rewardClaims[token] !== amount) throw new Error(`Existing reward claim changed: ${token}`);
    }
    const lostEarnedBadges = beforeRewards.badges.filter((badge) => !afterRewards.badges.includes(badge));
    if (lostEarnedBadges.length) throw new Error(`An existing earned sticker was removed: ${JSON.stringify(lostEarnedBadges)}`);
    const beforeCurriculumBadges = parse(before.raw.amari_curriculum_badges_v1, []);
    const afterCurriculumBadges = parse(after.raw.amari_curriculum_badges_v1, []);
    const lostCurriculumBadges = beforeCurriculumBadges.filter((badge) => !afterCurriculumBadges.includes(badge));
    if (lostCurriculumBadges.length) throw new Error(`An existing Curriculum badge was removed: ${JSON.stringify(lostCurriculumBadges)}`);
    const beforeReceiptRows = parse(before.raw.amari_curriculum_completion_receipts_v1, { completions: [] }).completions || [];
    const afterReceiptRows = parse(after.raw.amari_curriculum_completion_receipts_v1, { completions: [] }).completions || [];
    for (const oldReceipt of beforeReceiptRows) {
      const retained = afterReceiptRows.find((receipt) => receipt.moduleId === oldReceipt.moduleId && receipt.difficulty === oldReceipt.difficulty);
      if (JSON.stringify(retained) !== JSON.stringify(oldReceipt)) throw new Error(`An existing Curriculum completion receipt changed: ${oldReceipt.moduleId}:${oldReceipt.difficulty}`);
    }
    const newClaims = [...pairTokens].filter((token) => beforeRewards.rewardClaims[token] === undefined && afterRewards.rewardClaims[token] !== undefined);
    if (newClaims.some((token) => afterRewards.rewardClaims[token] !== 1)) throw new Error(`Curriculum parent claim amount must be one actual point: ${JSON.stringify(newClaims.map((token) => [token, afterRewards.rewardClaims[token]]))}`);
    const expectedRewardDelta = newClaims.length;
    if (afterRewards.points - beforeRewards.points !== expectedRewardDelta) throw new Error(`Unexpected Curriculum point delta: ${afterRewards.points - beforeRewards.points}, expected ${expectedRewardDelta}`);
    const worldmapGamesBefore = Number(beforeRewards.gamesPlayed.worldmap || 0);
    const worldmapGamesAfter = Number(afterRewards.gamesPlayed.worldmap || 0);
    if (worldmapGamesAfter - worldmapGamesBefore !== expectedRewardDelta) throw new Error(`Curriculum parent game count delta mismatch: ${worldmapGamesAfter - worldmapGamesBefore}`);
    const changedSiblingGameCounts = [...new Set([...Object.keys(beforeRewards.gamesPlayed), ...Object.keys(afterRewards.gamesPlayed)])]
      .filter((gameId) => gameId !== 'worldmap' && beforeRewards.gamesPlayed[gameId] !== afterRewards.gamesPlayed[gameId]);
    if (changedSiblingGameCounts.length) throw new Error(`An unrelated game count changed: ${JSON.stringify(changedSiblingGameCounts)}`);
    const missingRequired = ['continent', 'route', 'sequence', 'investigation'].filter((type) => !coverage.roundTypes[type]);
    if (missingRequired.length) throw new Error(`Missing actual-control Curriculum model coverage: ${missingRequired.join(', ')}`);
    const requiredRows = rows.filter((row) => row.kind === 'curriculum-module-band' && row.purpose === 'required');
    if (requiredRows.length !== 9 || requiredRows.some((row) => row.freshQuestionCount !== 5)) throw new Error(`Each required Curriculum module/band needs five newly answered questions: ${JSON.stringify(requiredRows.map(({ module, band, freshQuestionCount }) => ({ module, band, freshQuestionCount })))}`);
    if (!coverage.audio.length) throw new Error('No packaged Curriculum audio playback sample was recorded.');
    const parentReturn = page.getByRole('button', { name: 'Back to learning world', exact: true });
    await clickTask(parentReturn, 'Return to Explore & Languages parent');
    await page.getByRole('heading', { name: 'Explore & Languages', exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    const worldBackHome = page.getByRole('button', { name: 'Back to home', exact: true });
    await clickNavigation(worldBackHome, 'Return from Explore & Languages to home');
    await page.getByRole('heading', { name: 'Hi Amari!', exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    const parentBadgeReadBefore = await getRaw('amari_curriculum_badges_v1');
    if (parentBadgeReadBefore === null) throw new Error('Expected the Curriculum badge list before the parent Stickers read-retry probe.');
    const savedBadgeIds = parse(parentBadgeReadBefore, null);
    if (!Array.isArray(savedBadgeIds)) throw new Error('The Curriculum badge bytes are not a valid saved collection before the parent Stickers probe.');
    await armStorageFault(page, { key: 'amari_curriculum_badges_v1', mode: 'throw-on-read', count: 1 });
    await clickNavigation(page.getByRole('button', { name: 'Stickers', exact: true }), 'Open parent Stickers collection');
    const parentBadgeSection = page.locator('section[aria-label="Curriculum explorer badges"]');
    const parentBadgeStatus = parentBadgeSection.getByRole('status');
    await parentBadgeStatus.waitFor({ state: 'visible', timeout: 5000 });
    const parentBadgeErrorCopy = (await parentBadgeStatus.innerText()).replace(/\s+/g, ' ').trim();
    if (!parentBadgeErrorCopy.includes('Your saved badges could not be checked') || !parentBadgeErrorCopy.includes('Retry to show your collection')) {
      throw new Error(`Parent Stickers did not explain the unreadable saved collection: ${parentBadgeErrorCopy}`);
    }
    if (await parentBadgeSection.locator('.curriculum-badge-grid').count() !== 0
      || await parentBadgeSection.getByText(/\b0\s*\/\s*9\s+collected\b/i).count() !== 0) {
      throw new Error('Parent Stickers implied an empty Curriculum collection while its storage was unreadable.');
    }
    const parentBadgeFault = await page.evaluate(() => window.__pair10CurriculumLastFaultV1 || null);
    if (!parentBadgeFault?.consumed || parentBadgeFault.key !== 'amari_curriculum_badges_v1' || parentBadgeFault.mode !== 'throw-on-read') {
      throw new Error(`Expected one bounded parent Stickers badge read fault; got key=${parentBadgeFault?.key || 'missing'}, mode=${parentBadgeFault?.mode || 'missing'}, consumed=${Boolean(parentBadgeFault?.consumed)}.`);
    }
    const retryParentBadges = parentBadgeSection.getByRole('button', { name: 'Retry saved badges', exact: true });
    await retryParentBadges.evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
    const retryParentBadgesRect = await measure(retryParentBadges, 'Retry parent Stickers collection read');
    const beforeParentBadgeRetry = await storageSnapshot();
    await retryParentBadges.click();
    await parentBadgeStatus.waitFor({ state: 'detached', timeout: 5000 });
    const parentBadgesAfterRetry = await getRaw('amari_curriculum_badges_v1');
    if (parentBadgesAfterRetry !== parentBadgeReadBefore) throw new Error('Parent Stickers Retry changed the original Curriculum badge bytes.');
    const earnedCountAfterRetry = new Set(savedBadgeIds.filter((id) => MODULES.some((module) => BANDS.some((band) => id === `${module.id}:${band}`)))).size;
    const parentBadgeCollection = parentBadgeSection.locator('.curriculum-collection-heading span');
    const restoredBadgeCount = (await parentBadgeCollection.innerText()).replace(/\s+/g, ' ').trim();
    if (restoredBadgeCount !== `${earnedCountAfterRetry} / 9 collected`) throw new Error(`Parent Stickers Retry did not restore the saved collection count: ${restoredBadgeCount}`);
    const afterParentBadgeRetry = await storageSnapshot();
    const parentRetryChangedKeys = changedKeys(beforeParentBadgeRetry.hashes, afterParentBadgeRetry.hashes);
    if (parentRetryChangedKeys.length) throw new Error(`Parent Stickers read Retry wrote storage: ${JSON.stringify(parentRetryChangedKeys)}`);
    coverage.nativeFaults.push({ kind: 'parent-stickers-badge-read-retry', key: parentBadgeFault.key, retryLabel: 'Retry saved badges', retryRect: retryParentBadgesRect.rect, unavailableNotEmpty: true, restoredBadgeCount, originalBytesPreserved: true, noStorageWrite: true });
    retryResults.parentStickersReadRetry = 'verified';
    await clickNavigation(page.getByRole('button', { name: 'Back to home', exact: true }), 'Return from Stickers to home');
    await page.getByRole('heading', { name: 'Hi Amari!', exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    await clickNavigation(page.locator('.discovery-world-card').filter({ hasText: 'Explore & Languages' }).first(), 'Return to Explore & Languages from home');
    await page.getByRole('heading', { name: 'Explore & Languages', exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    if (diagnostics.providerAttempts.length || diagnostics.pageErrors.length || diagnostics.consoleErrors.length || diagnostics.requestErrors.length || diagnostics.responseErrors.length || diagnostics.soundRestoreErrors.length) {
      throw new Error(`Browser/provider/network diagnostics were not clean: ${JSON.stringify(diagnostics)}`);
    }
    return {
      passed: true,
      stage: STAGE,
      origin: ORIGIN,
      player: 'amari',
      viewport: `${WIDTH}x${HEIGHT}`,
      entryIdentity,
      namespace,
      sourceScope: 'Amari Explore & Languages only; Askia is storage-isolation coverage, not a normal-route game player',
      rows,
      moduleBandRunCount: rows.filter((row) => row.kind === 'curriculum-module-band' && row.purpose === 'required').length,
      modelSupplementRunCount: rows.filter((row) => row.kind === 'curriculum-module-band' && row.purpose === 'model-supplement').length,
      questionCount: rows.filter((row) => row.kind === 'curriculum-module-band').reduce((sum, row) => sum + row.questionCount, 0),
      freshQuestionCount: rows.filter((row) => row.kind === 'curriculum-module-band').reduce((sum, row) => sum + row.freshQuestionCount, 0),
      requiredQuestionCount: requiredRows.reduce((sum, row) => sum + row.freshQuestionCount, 0),
      roundTypeCounts: coverage.roundTypes,
      restoredRoundTypeCounts: coverage.restoredRoundTypes,
      wrongRetryCount: coverage.wrongRetry,
      reloadProofs: coverage.reloads,
      audioProofs: coverage.audio,
      faultProofs,
      retryCoverage: retryResults,
      storageChanges,
      rewardDelta: afterRewards.points - beforeRewards.points,
      newCurriculumClaims: newClaims,
      diagnostics,
      screenshotPath,
      finalRenderPath,
    };
  } catch (error) {
    if (soundPreferenceToRestore !== null) {
      try { await restoreSoundPreference(); }
      catch (restoreError) { diagnostics.soundRestoreErrors.push(String(restoreError?.message || restoreError)); }
    }
    try {
      screenshotPath = `${OUT}/failure-curriculum-${STAGE}-${WIDTH}x${HEIGHT}-${Date.now()}.jpg`;
      await page.screenshot({ path: screenshotPath, type: 'jpeg', quality: 70, fullPage: false });
    } catch {}
    let currentStorage = null;
    try { currentStorage = await storageSnapshot(); } catch {}
    return {
      passed: false,
      stage: STAGE,
      origin: ORIGIN,
      player: 'amari',
      viewport: `${WIDTH}x${HEIGHT}`,
      entryIdentity,
      namespace,
      rows,
      moduleBandRunCount: rows.filter((row) => row.kind === 'curriculum-module-band' && row.purpose === 'required').length,
      modelSupplementRunCount: rows.filter((row) => row.kind === 'curriculum-module-band' && row.purpose === 'model-supplement').length,
      questionCount: rows.filter((row) => row.kind === 'curriculum-module-band').reduce((sum, row) => sum + row.questionCount, 0),
      freshQuestionCount: rows.filter((row) => row.kind === 'curriculum-module-band').reduce((sum, row) => sum + row.freshQuestionCount, 0),
      requiredQuestionCount: rows.filter((row) => row.kind === 'curriculum-module-band' && row.purpose === 'required').reduce((sum, row) => sum + row.freshQuestionCount, 0),
      roundTypeCounts: coverage.roundTypes,
      restoredRoundTypeCounts: coverage.restoredRoundTypes,
      wrongRetryCount: coverage.wrongRetry,
      reloadProofs: coverage.reloads,
      audioProofs: coverage.audio,
      faultProofs,
      retryCoverage: retryCoverage(),
      changedStorageKeys: lastStorage && currentStorage ? changedKeys(lastStorage.hashes, currentStorage.hashes) : [],
      screenshotPath,
      diagnostics,
      finalRenderPath,
      error: String(error?.stack || error).slice(-5000),
    };
  } finally {
    try { await page.evaluate(() => window.__pair10CurriculumStorageFaultV1?.disarm?.()); } catch {}
    try { await page.evaluate(() => window.__pair10CurriculumMediaDisposeV1?.()); } catch {}
    try { await page.unroute('**/*', providerGuard); } catch {}
    page.off('pageerror', onPageError);
    page.off('console', onConsole);
    page.off('requestfailed', onRequestFailed);
    page.off('response', onResponse);
  }
}
