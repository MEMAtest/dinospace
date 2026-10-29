// Caller-supplied Playwright page only. Run through the already-leased
// amari-targeted-contained session; this callback never creates a browser,
// context, tab, storage seed, answer, badge, or progress record.
async page => {
  const ORIGIN = __ORIGIN__;
  const EXPECTED_ENTRY = __EXPECTED_ENTRY__;
  const WIDTH = __WIDTH__;
  const HEIGHT = __HEIGHT__;
  const FLOW = __FLOW__;
  const FAULT_PLAN = __FAULT_PLAN__;
  const OUTPUT = __OUTPUT__;
  const VIEW = `${WIDTH}x${HEIGHT}`;
  const rows = [];
  const failures = [];
  const pageErrors = [];
  const consoleErrors = [];
  const failedRequests = [];
  const failedResponses = [];
  const providerAttempts = [];
  const providerRoute = async route => {
    const url = route.request().url();
    if (/\/api\/|elevenlabs|openai|text-to-speech|story-provider/i.test(url)) {
      providerAttempts.push(url);
      await route.fulfill({ status: 403, contentType: 'text/plain', body: 'Pair11 synthetic QA provider guard' });
      return;
    }
    await route.continue();
  };
  let entryIdentity = null;
  let startingUrl = null;
  let baseline = null;
  let lastStorage = null;
  let initialSound = null;
  const onPageError = error => pageErrors.push(String(error?.message || error));
  const onConsole = message => { if (message.type() === 'error') consoleErrors.push(message.text()); };
  const onRequest = request => { if (/\/api\/|elevenlabs|text-to-speech|story-provider/i.test(request.url())) providerAttempts.push(request.url()); };
  const onRequestFailed = request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText || 'request failed' });
  const onResponse = response => { if (response.status() >= 400) failedResponses.push({ url: response.url(), status: response.status() }); };
  page.on('pageerror', onPageError);
  page.on('console', onConsole);
  page.on('request', onRequest);
  page.on('requestfailed', onRequestFailed);
  page.on('response', onResponse);

  const assert = (condition, message, evidence = null) => {
    if (!condition) throw Object.assign(new Error(message), { evidence });
  };
  const wait = ms => page.waitForTimeout(ms);
  const digestText = async value => page.evaluate(async text => {
    const bytes = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return { bytes: bytes.length, sha256: [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('') };
  }, value);
  const snapshotStorage = async () => page.evaluate(async () => {
    const snapshot = {};
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key === null) continue;
      const value = localStorage.getItem(key);
      const bytes = new TextEncoder().encode(value ?? '');
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      snapshot[key] = { bytes: bytes.length, sha256: [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('') };
    }
    return snapshot;
  });
  const readRewardState = async () => page.evaluate(() => {
    const raw = localStorage.getItem('amari_rewards_v2');
    const value = raw === null ? {} : JSON.parse(raw);
    const read = key => { try { return JSON.parse(localStorage.getItem(key) ?? 'null'); } catch { return null; } };
    const games = { ...(value.gamesPlayed || {}) };
    const oldGames = read('amari_games_played');
    if (oldGames && typeof oldGames === 'object') for (const [id, count] of Object.entries(oldGames)) games[id] = Math.max(games[id] || 0, count || 0);
    return {
      points: Math.max(value.points || 0, read('amari_points') || 0),
      gamesPlayed: games,
      earnedStickerIds: [...new Set([...(value.earnedStickerIds || []), ...(read('amari_earned_sticker_ids_v1') || [])])],
      rewardClaims: value.rewardClaims || {},
    };
  });
  const storageChanges = (before, after) => {
    const keys = [...new Set([...Object.keys(before || {}), ...Object.keys(after || {})])].sort();
    return keys.filter(key => before?.[key]?.sha256 !== after?.[key]?.sha256 || before?.[key]?.bytes !== after?.[key]?.bytes);
  };
  const physicalToLogical = key => key.replace(/^qa_rewards_20261024_/, '');
  const assertOnlyKeys = (before, after, allow) => {
    const changed = storageChanges(before, after).map(physicalToLogical);
    const unexpected = changed.filter(key => !allow.some(rule => rule.endsWith('*') ? key.startsWith(rule.slice(0, -1)) : key === rule));
    assert(unexpected.length === 0, `Unexpected storage changes: ${JSON.stringify(unexpected)}`, { changed });
    return { changed, unexpected };
  };
  const assertRuntime = async () => {
    const actual = await page.evaluate(() => ({
      origin: location.origin,
      namespaced: window.__amariQaNamespaced === true,
      entry: document.querySelector('script[type="module"][src]')?.getAttribute('src') || null,
      viewport: { width: innerWidth, height: innerHeight },
    }));
    assert(actual.origin === new URL(ORIGIN).origin, `Unexpected origin ${actual.origin}`);
    assert(actual.namespaced, 'Retained Amari QA namespace is not installed');
    assert(actual.entry === EXPECTED_ENTRY, `Compiled entry mismatch: ${actual.entry} expected ${EXPECTED_ENTRY}`);
    assert(actual.viewport.width === WIDTH && actual.viewport.height === HEIGHT, `Viewport mismatch: ${JSON.stringify(actual.viewport)}`);
    entryIdentity = actual.entry;
    return actual;
  };
  const mediaObserver = () => {
    if (window.__pair11MediaObserverV1) return;
    const originalPlay = HTMLMediaElement.prototype.play;
    const records = [];
    const byElement = new WeakMap();
    const listenersByElement = new WeakMap();
    let nextId = 0;
    const recordEvent = (media, type) => {
      const row = byElement.get(media);
      if (!row) return;
      row.src = media.currentSrc || media.src || row.src;
      row.events.push({ type, time: Number(media.currentTime) || 0, duration: Number.isFinite(media.duration) ? media.duration : null, at: performance.now() });
      if (row.events.length > 48) row.events.shift();
    };
    HTMLMediaElement.prototype.play = function (...args) {
      let row = byElement.get(this);
      if (!row) {
        row = { id: `media-${++nextId}`, src: this.currentSrc || this.src || '', events: [], element: this };
        byElement.set(this, row);
        const listeners = [];
        for (const type of ['play', 'playing', 'timeupdate', 'pause', 'ended', 'error']) {
          const listener = () => recordEvent(this, type);
          this.addEventListener(type, listener);
          listeners.push([type, listener]);
        }
        listenersByElement.set(this, listeners);
        records.push(row);
        if (records.length > 64) {
          const old = records.shift();
          for (const [type, listener] of listenersByElement.get(old.element) || []) old.element.removeEventListener(type, listener);
          listenersByElement.delete(old.element);
          byElement.delete(old.element);
        }
      }
      row.src = this.currentSrc || this.src || row.src;
      row.events.push({ type: 'play-call', time: Number(this.currentTime) || 0, duration: Number.isFinite(this.duration) ? this.duration : null, at: performance.now() });
      if (row.events.length > 48) row.events.shift();
      return originalPlay.apply(this, args);
    };
    window.__pair11MediaRowsV1 = records;
    window.__pair11MediaObserverV1 = {
      originalPlay,
      wrapper: HTMLMediaElement.prototype.play,
      dispose() {
        for (const row of records) {
          for (const [type, listener] of listenersByElement.get(row.element) || []) row.element.removeEventListener(type, listener);
        }
        if (HTMLMediaElement.prototype.play === this.wrapper) HTMLMediaElement.prototype.play = originalPlay;
        delete window.__pair11MediaRowsV1;
        delete window.__pair11MediaObserverV1;
      },
    };
  };
  const installMediaObserver = async () => page.evaluate(mediaObserver);
  const mediaSnapshot = async () => page.evaluate(() => (window.__pair11MediaRowsV1 || []).map(row => ({
    id: row.id,
    src: row.src,
    path: (() => { try { return new URL(row.src, location.href).pathname; } catch { return ''; } })(),
    paused: row.element.paused,
    ended: row.element.ended,
    currentTime: Number(row.element.currentTime) || 0,
    duration: Number.isFinite(row.element.duration) ? row.element.duration : null,
    events: row.events.slice(),
  })));
  const measure = async (locator, label, minimum = 44) => {
    assert(await locator.count() === 1 && await locator.isVisible(), `${label} is not uniquely visible`);
    const value = await locator.evaluate(element => {
      const r = element.getBoundingClientRect();
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const hit = document.elementFromPoint(x, y);
      return { rect: { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height }, viewport: { width: innerWidth, height: innerHeight }, centerHit: Boolean(hit && (hit === element || element.contains(hit))) };
    });
    assert(value.rect.x >= 0 && value.rect.y >= 0 && value.rect.right <= value.viewport.width && value.rect.bottom <= value.viewport.height, `${label} is not fully within viewport: ${JSON.stringify(value)}`);
    assert(value.rect.width >= minimum && value.rect.height >= minimum && value.centerHit, `${label} is too small or center is occluded: ${JSON.stringify(value)}`);
    return value;
  };
  const click = async (locator, label, options = {}) => {
    const geometry = await measure(locator, label, options.minimum ?? 44);
    await locator.click();
    if (options.waitFor) await options.waitFor.waitFor({ state: 'visible', timeout: options.timeout || 10000 });
    return geometry;
  };
  const clickNavigation = async (locator, label, options = {}) => {
    assert(await locator.count() === 1 && await locator.isVisible(), `${label} is not uniquely visible for navigation`);
    await locator.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'nearest' }));
    return click(locator, label, options);
  };
  const digestReport = async () => ({ pageErrors: pageErrors.slice(-30), consoleErrors: consoleErrors.slice(-30), failedRequests: failedRequests.slice(-30), failedResponses: failedResponses.slice(-30), providerAttempts: providerAttempts.slice(-30) });
  const currentAudio = async (baselineIds = []) => (await mediaSnapshot()).filter(row => !baselineIds.includes(row.id)).at(-1) || null;
  const waitAudioStarted = async (beforeIds, timeout = 8000) => {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const row = await currentAudio(beforeIds);
      if (row && row.path.startsWith('/audio/') && row.events.some(event => ['playing', 'timeupdate'].includes(event.type))) return row;
      await wait(100);
    }
    throw new Error('No exact packaged audio playback was observed after the visible Hear action');
  };
  const waitAudioStopped = async (id, timeout = 5000) => {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const row = (await mediaSnapshot()).find(item => item.id === id);
      if (row && (row.paused || row.ended)) return row;
      await wait(100);
    }
    throw new Error(`Packaged audio ${id} continued after mute/leave`);
  };
  const waitAudioAdvanced = async (id, baseline, timeout = 4000) => {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const row = (await mediaSnapshot()).find(item => item.id === id);
      if (row) {
        const positiveEvent = row.events.find(event =>
          event.at > baseline.lastEventAt &&
          ['timeupdate', 'ended'].includes(event.type) &&
          event.time > baseline.currentTime
        );
        if (row.currentTime > baseline.currentTime + 0.005) {
          return { row, proof: 'currentTime-advanced' };
        }
        if (positiveEvent) return { row, proof: `fresh-${positiveEvent.type}` };
      }
      await wait(100);
    }
    throw new Error(`Exact packaged audio element ${id} did not show positive playback progress within ${timeout}ms`);
  };
  const soundState = async () => (await page.getByRole('button', { name: /Turn sound (on|off)/ }).first().getAttribute('aria-label')) === 'Turn sound off';
  const setSound = async wanted => {
    const current = await soundState();
    if (current !== wanted) await click(page.getByRole('button', { name: wanted ? 'Turn sound on' : 'Turn sound off', exact: true }), wanted ? 'Enable packaged audio' : 'Restore original muted preference');
  };

  const chooseAmari = async () => {
    const chooser = page.getByRole('button', { name: /Age 6\+ Amari/ }).first();
    if (await chooser.count() && await chooser.isVisible()) {
      await click(chooser, 'Choose visible Amari profile');
      await page.getByRole('heading', { name: 'Choose a world', exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    }
  };
  const openWorld = async world => {
    const home = page.getByRole('heading', { name: 'Choose a world', exact: true });
    if (await home.count() && await home.isVisible()) {
      const card = page.locator('.discovery-world-card').filter({ hasText: world }).first();
      await clickNavigation(card, `Open ${world} from Amari home`, { waitFor: page.getByRole('heading', { name: world, exact: true }) });
    }
    await page.getByRole('heading', { name: world, exact: true }).waitFor({ state: 'visible', timeout: 10000 });
  };
  const launchCatalogueCard = async (name, world) => {
    await openWorld(world);
    const card = page.locator('.catalogue-game-card').filter({ hasText: name }).first();
    await clickNavigation(card, `Open ${name} catalogue card`, { waitFor: page.getByRole('heading', { name, exact: true }) });
    await page.getByRole('heading', { name, exact: true }).waitFor({ state: 'visible', timeout: 10000 });
  };

  const WORD_GRAPHEMES = {
    SAT: ['s','a','t'], PAT: ['p','a','t'], PIN: ['p','i','n'], TIN: ['t','i','n'], MAP: ['m','a','p'], TAP: ['t','a','p'],
    DOG: ['d','o','g'], LOG: ['l','o','g'], CAT: ['c','a','t'], KID: ['k','i','d'], HEN: ['h','e','n'], RED: ['r','e','d'],
    FISH: ['f','i','sh'], CHIP: ['ch','i','p'], SHIP: ['sh','i','p'], RAIN: ['r','ai','n'], FEET: ['f','ee','t'], BOAT: ['b','oa','t'], MOON: ['m','oo','n'],
  };
  const FIRST_WORD_INITIAL = { APPLE:'A', BALL:'B', CAT:'C', DOG:'D', EGG:'E', FISH:'F', GOAT:'G', HAT:'H', INSECT:'I', JAM:'J', KITE:'K', LION:'L', MOON:'M', NET:'N', OCTOPUS:'O', PIG:'P', QUEEN:'Q', RED:'R', SUN:'S', TOP:'T', UP:'U', VAN:'V', WEB:'W', YAK:'Y', ZIP:'Z' };
  const answerFromVisibleLetterClue = async () => {
    const clue = page.locator('.letter-launch-clue');
    const label = await clue.getAttribute('aria-label') || '';
    if (label.startsWith('Little letter ')) return { type: 'case', answer: label.slice('Little letter '.length).trim().toUpperCase(), clue: label };
    if (label.startsWith('Picture clue for ')) {
      const word = label.slice('Picture clue for '.length).trim().toUpperCase();
      const chapter = await page.locator('.letter-launch-play').getAttribute('data-letter-chapter');
      if (chapter === 'letters-sound-scout') {
        const answer = FIRST_WORD_INITIAL[word];
        if (!answer) throw new Error(`Visible word caption ${word} is not in the public letter-name/sound mapping`);
        return { type: 'initial', answer, word, clue: label };
      }
      const graphemes = WORD_GRAPHEMES[word];
      if (!graphemes) throw new Error(`Visible picture clue ${word} is not in the authored public grapheme map`);
      return { type: chapter === 'letters-cvc-blender' ? 'build' : 'initial', answer: chapter === 'letters-cvc-blender' ? graphemes : graphemes[0].toUpperCase(), word, graphemes, clue: label };
    }
    throw new Error(`Unknown visible Letter Launch clue: ${label}`);
  };
  const solveLetterRound = async ({ wrongOnce = false } = {}) => {
    const config = await answerFromVisibleLetterClue();
    const header = page.locator('.letter-launch-header p').first();
    const beforeHeader = (await header.innerText()).trim();
    const feedback = page.locator('.letter-launch-feedback[role="status"]');
    const beforeCursor = beforeHeader.match(/(\d+) of (\d+)/);
    if (!beforeCursor) throw new Error(`Could not read visible Letter Launch round cursor: ${beforeHeader}`);
    const finalBeforeAnswer = Number(beforeCursor[1]) === Number(beforeCursor[2]);
    let wrong = null;
    if (wrongOnce) {
      const options = page.locator('.letter-launch-choice');
      const labels = await options.evaluateAll(items => items.map(item => item.innerText.trim()));
      const expected = config.type === 'build' ? config.answer[0].toUpperCase() : String(config.answer);
      wrong = labels.find(label => label.toUpperCase() !== expected.toUpperCase());
      if (!wrong) throw new Error('No visible wrong option is available for retry test');
      await click(page.getByRole('button', { name: wrong, exact: true }), 'Visible wrong answer for held retry');
      await feedback.waitFor({ state: 'visible', timeout: 5000 });
      const afterWrongClue = await page.locator('.letter-launch-clue').getAttribute('aria-label');
      const afterWrongHeader = (await header.innerText()).trim();
      assert(afterWrongClue === config.clue && afterWrongHeader === beforeHeader, 'Wrong answer advanced or changed the Letter Launch prompt', { beforeHeader, afterWrongHeader, beforeClue: config.clue, afterWrongClue });
    }
    const clickAnswer = async label => click(page.getByRole('button', { name: label, exact: true }), `Correct visible tile ${label}`);
    if (config.type === 'build') {
      for (const grapheme of config.graphemes) await clickAnswer(grapheme.toUpperCase());
    } else await clickAnswer(String(config.answer));
    await feedback.waitFor({ state: 'visible', timeout: 5000 });
    const row = { clue: config.clue, answerMethod: config.type, answer: config.answer, roundHeaderBefore: beforeHeader, roundHeaderAfter: (await header.innerText()).trim(), final: finalBeforeAnswer, wrongOption: wrong, heldFeedback: (await feedback.innerText()).trim() };
    if (!row.final) {
      const next = page.getByRole('button', { name: 'Next mission', exact: true });
      await click(next, 'Held Next mission');
      await page.waitForFunction(clue => document.querySelector('.letter-launch-clue')?.getAttribute('aria-label') !== clue, config.clue, { timeout: 7000 });
    }
    return row;
  };

  const armStorageFault = async (key, mode) => page.evaluate(({ key, mode }) => {
    if (window.__amariQaNamespaced !== true) throw new Error('Refusing Pair11 fault without the namespace guard');
    if (!['amari_letter_launch_progress_v1', 'amari_chapter_badges_v1', 'amari_rewards_v2'].includes(key)) throw new Error(`Key is outside Pair11 allowlist: ${key}`);
    if (!['throw-before-write', 'stale-readback'].includes(mode)) throw new Error(`Unsupported bounded Pair11 fault mode ${mode}`);
    if (window.__pair11StorageFaultV1) throw new Error('A Pair11 fault is already armed');
    const proto = Storage.prototype, originalSet = proto.setItem, originalGet = proto.getItem, storage = localStorage;
    const beforeRaw = originalGet.call(storage, key);
    const fault = { key, mode, beforeRaw, consumed: false, committedWrite: false };
    let setWrapper, getWrapper;
    const restore = () => {
      if (proto.setItem === setWrapper) proto.setItem = originalSet;
      if (proto.getItem === getWrapper) proto.getItem = originalGet;
      window.__pair11LastStorageFaultV1 = { key, mode, beforeRaw, consumed: fault.consumed, committedWrite: fault.committedWrite };
      delete window.__pair11StorageFaultV1;
    };
    setWrapper = function(candidateKey, value) {
      if (candidateKey !== key || fault.consumed) return originalSet.call(this, candidateKey, value);
      fault.consumed = true;
      if (mode === 'throw-before-write') { restore(); throw new DOMException('Bounded Pair11 QA write failure', 'QuotaExceededError'); }
      originalSet.call(this, candidateKey, value); fault.committedWrite = true;
      getWrapper = function(readKey) { if (readKey !== key) return originalGet.call(this, readKey); restore(); return beforeRaw; };
      proto.getItem = getWrapper;
      return undefined;
    };
    proto.setItem = setWrapper;
    window.__pair11StorageFaultV1 = { ...fault, restore };
    return { armed: true, key, mode, hadPriorRecord: beforeRaw !== null };
  }, { key, mode });
  const faultLast = async () => page.evaluate(() => window.__pair11LastStorageFaultV1 || null);
  const readChapterReceipt = async chapterId => page.evaluate(id => {
    try {
      const saved = JSON.parse(localStorage.getItem('amari_letter_launch_progress_v1') || 'null');
      return saved?.chapterReceipts?.find(receipt => receipt.chapterId === id) || null;
    } catch { return null; }
  }, chapterId);
  const faultStorageKey = mode => ({
    local: 'amari_letter_launch_progress_v1',
    badge: 'amari_chapter_badges_v1',
    parent: 'amari_rewards_v2',
  })[mode] || null;

  const runLetterLaunch = async () => {
    await chooseAmari();
    await launchCatalogueCard('Letter Launch', 'Read & Write');
    baseline = await snapshotStorage();
    const startingRewards = await readRewardState();
    const chapterRows = [];
    const awardRows = [];
    const faultRows = [];
    for (let index = 0; index < 4; index += 1) {
      await page.locator('.letter-launch-chapters article').nth(index).waitFor({ state: 'visible', timeout: 10000 });
      const article = page.locator('.letter-launch-chapters article').nth(index);
      const title = (await article.locator('h2').innerText()).trim();
      const action = article.getByRole('button');
      const actionText = (await action.innerText()).trim();
      const requestedFault = FAULT_PLAN[index] || null;
      if (actionText === 'Finish earlier chapter') {
        chapterRows.push({ index, title, skipped: true, reason: 'Not unlocked by ordinary visible progression; no state injection used' });
        continue;
      }
      let faultAttempt = null;
      let faultSkippedReason = requestedFault && actionText !== 'Start chapter'
        ? `Chapter action was ${actionText}; it was not naturally reward-eligible. No progress was reset.` : null;
      const beforeChapter = await snapshotStorage();
      const rewardsBefore = await readRewardState();
      const visibleAction = actionText;
      await clickNavigation(action, `Open chapter ${index + 1}: ${title}`, { waitFor: page.locator(`.letter-launch-play[data-letter-phase="play"][data-letter-chapter]`) });
      const chapterId = await page.locator('.letter-launch-play').getAttribute('data-letter-chapter');
      const expectedTotal = [6, 6, 7, 8][index];
      const targetVisible = (await page.locator('.letter-launch-header p').innerText()).trim();
      if (!targetVisible.includes(`of ${expectedTotal}`)) throw new Error(`Chapter ${index + 1} target count mismatch: ${targetVisible}`);
      const soundBefore = await soundState();
      if (!soundBefore) await setSound(true);
      const replay = page.getByRole('button', { name: 'Hear the clue again', exact: true });
      if (await replay.count() && await replay.isEnabled()) {
        const beforeMedia = (await mediaSnapshot()).map(row => row.id);
        await click(replay, 'Play exact packaged Letter Launch clue');
        const playing = await waitAudioStarted(beforeMedia);
        const timeBefore = playing.currentTime;
        await wait(250);
        const progressed = (await mediaSnapshot()).find(row => row.id === playing.id);
        assert(progressed && progressed.currentTime > timeBefore, 'Packaged Letter Launch clip did not advance');
        await setSound(false);
        const stopped = await waitAudioStopped(playing.id);
        rows.push({ kind: 'letters-audio', chapterId, srcPath: playing.path, elapsed: progressed.currentTime - timeBefore, stoppedByMute: stopped.paused || stopped.ended });
      } else rows.push({ kind: 'letters-audio-guidance', chapterId, available: false, visibleText: (await page.locator('.letter-launch-audio-note').innerText().catch(() => '')).trim() });
      await setSound(soundBefore);

      const rounds = [];
      let wrongDone = false;
      while (rounds.length < expectedTotal) {
        const faultEligibleUi = actionText === 'Start chapter' && Boolean(requestedFault);
        const lastRound = rounds.length + 1 === expectedTotal;
        if (faultEligibleUi && lastRound && !faultAttempt) {
          const key = faultStorageKey(requestedFault === 'chain' ? 'local' : requestedFault);
          if (!key) throw new Error(`Unknown Pair11 fault mode ${requestedFault}`);
          faultAttempt = await armStorageFault(key, 'stale-readback');
        }
        const round = await solveLetterRound({ wrongOnce: !wrongDone });
        if (round.wrongOption) wrongDone = true;
        rounds.push(round);
        rows.push({ kind: 'letter-round', chapterIndex: index, chapterId, round });
        if (round.final) break;
      }
      let retry = null;
      if (requestedFault && faultAttempt) {
        const alert = page.getByRole('alert');
        await alert.waitFor({ state: 'visible', timeout: 10000 });
        const retryButton = alert.getByRole('button', { name: 'Retry save', exact: true });
        const heldClue = await page.locator('.letter-launch-clue').getAttribute('aria-label');
        const heldHeader = (await page.locator('.letter-launch-header p').first().innerText()).trim();
        if (requestedFault === 'chain') {
          retry = { mode: 'chain', heldClue, heldHeader, stages: [] };
          const stages = ['local', 'badge', 'parent'];
          let transactionId = null;
          for (let stageIndex = 0; stageIndex < stages.length; stageIndex += 1) {
            const stage = stages[stageIndex];
            await alert.waitFor({ state: 'visible', timeout: 10000 });
            const currentClue = await page.locator('.letter-launch-clue').getAttribute('aria-label');
            const currentHeader = (await page.locator('.letter-launch-header p').first().innerText()).trim();
            assert(currentClue === heldClue && currentHeader === heldHeader, `Held Letter Launch attempt changed before ${stage} Retry`, { heldClue, currentClue, heldHeader, currentHeader });
            const receipt = await readChapterReceipt(chapterId);
            if (transactionId === null && receipt?.transactionId) transactionId = receipt.transactionId;
            if (stageIndex === 0) assert(Boolean(transactionId), 'Local stale-readback did not leave a readable chapter transaction for same-result Retry', { chapterId, receipt });
            if (transactionId && receipt?.transactionId) assert(receipt.transactionId === transactionId, `${stage} retry replaced the held Letter Launch transaction`, { transactionId, receipt });
            const currentFault = await faultLast();
            assert(currentFault?.consumed === true && currentFault.key === faultStorageKey(stage), `The ${stage} storage fault did not reach the same held completion`, { stage, currentFault, receipt });
            await measure(retryButton, `Held Letter Launch ${stage} Retry`);
            const stageRecord = {
              stage,
              fault: currentFault,
              receipt: receipt ? { transactionId: receipt.transactionId, rewardDelta: receipt.rewardDelta, parentClaimed: receipt.parentClaimed } : null,
              heldClue: currentClue,
              heldHeader: currentHeader,
              message: (await alert.innerText()).trim(),
            };
            const nextStage = stages[stageIndex + 1];
            if (nextStage) stageRecord.nextFaultArmed = await armStorageFault(faultStorageKey(nextStage), 'stale-readback');
            const loggedStage = { kind: 'letter-save-fault-stage', chapterIndex: index, chapterId, transactionId, stage: stageRecord };
            rows.push(loggedStage);
            retry.stages.push(stageRecord);
            const beforeRetry = await snapshotStorage();
            await click(retryButton, `Retry same Letter Launch result after ${stage} failure`);
            if (nextStage) {
              await alert.waitFor({ state: 'visible', timeout: 10000 });
              const afterRetryClue = await page.locator('.letter-launch-clue').getAttribute('aria-label');
              const afterRetryHeader = (await page.locator('.letter-launch-header p').first().innerText()).trim();
              assert(afterRetryClue === heldClue && afterRetryHeader === heldHeader, `${stage} Retry changed the Letter Launch task before ${nextStage} failure`, { heldClue, afterRetryClue, heldHeader, afterRetryHeader });
              stageRecord.retryStorageChanged = storageChanges(beforeRetry, await snapshotStorage()).map(physicalToLogical);
              loggedStage.retryStorageChanged = stageRecord.retryStorageChanged;
            } else {
              await page.getByRole('button', { name: 'Finish chapter', exact: true }).waitFor({ state: 'visible', timeout: 10000 });
              stageRecord.retryStorageChanged = storageChanges(beforeRetry, await snapshotStorage()).map(physicalToLogical);
              stageRecord.finalReceipt = await readChapterReceipt(chapterId);
              assert(stageRecord.finalReceipt?.transactionId === transactionId && stageRecord.finalReceipt?.parentClaimed === true, 'Final chained Retry did not confirm the same parent receipt', { transactionId, finalReceipt: stageRecord.finalReceipt });
              loggedStage.retryStorageChanged = stageRecord.retryStorageChanged;
              loggedStage.finalReceipt = { transactionId: stageRecord.finalReceipt.transactionId, rewardDelta: stageRecord.finalReceipt.rewardDelta, parentClaimed: stageRecord.finalReceipt.parentClaimed };
            }
          }
          retry.transactionId = transactionId;
          faultRows.push({ index, chapterId, requestedFault, ...retry });
        } else {
          await measure(retryButton, 'Held Letter Launch save Retry');
          retry = { heldClue, message: (await alert.innerText()).trim() };
          const beforeRetry = await snapshotStorage();
          await click(retryButton, 'Retry same Letter Launch chapter result');
          await page.getByRole('button', { name: 'Finish chapter', exact: true }).waitFor({ state: 'visible', timeout: 10000 });
          retry.fault = await faultLast();
          retry.storageChanged = storageChanges(beforeRetry, await snapshotStorage()).map(physicalToLogical);
          assert(retry.fault?.consumed === true, 'Configured Letter Launch fault was not consumed', retry);
          faultRows.push({ index, chapterId, requestedFault, ...retry });
        }
      }
      const finish = page.getByRole('button', { name: 'Finish chapter', exact: true });
      await click(finish, `Finish saved Letter Launch chapter ${index + 1}`, { waitFor: page.locator('.letter-launch-menu[data-letter-phase="review"]') });
      await page.getByRole('button', { name: 'Choose another chapter', exact: true }).waitFor({ state: 'visible', timeout: 5000 });
      const afterChapter = await snapshotStorage();
      const changed = storageChanges(beforeChapter, afterChapter).map(physicalToLogical);
      const chapterProgressRaw = await page.evaluate(() => localStorage.getItem('amari_letter_launch_progress_v1'));
      let chapterProgress = null;
      try { chapterProgress = chapterProgressRaw ? JSON.parse(chapterProgressRaw) : null; } catch { /* report raw digest only */ }
      const chapterTransaction = chapterProgress?.chapterReceipts?.find(receipt => receipt.chapterId === chapterId) || null;
      const rewardsAfter = await readRewardState();
      const newLetterClaims = Object.keys(rewardsAfter.rewardClaims).filter(key => key.startsWith('dino:letters:') && rewardsBefore.rewardClaims[key] === undefined);
      const expectedRewardDelta = visibleAction === 'Start chapter' ? 1 : 0;
      const pointDelta = rewardsAfter.points - rewardsBefore.points;
      const playDelta = (rewardsAfter.gamesPlayed.letters || 0) - (rewardsBefore.gamesPlayed.letters || 0);
      assert(pointDelta === expectedRewardDelta && playDelta === expectedRewardDelta && newLetterClaims.length === expectedRewardDelta,
        `Unexpected Letter Launch reward delta for ${chapterId}: expected ${expectedRewardDelta}, saw ${pointDelta} points, ${playDelta} plays, ${newLetterClaims.length} new claims`,
        { visibleAction, pointDelta, playDelta, newLetterClaims, transaction: chapterTransaction });
      chapterRows.push({ index, chapterId, title, visibleStartAction: visibleAction, targetRounds: expectedTotal, actualRounds: rounds.length, wrongRetry: rounds.some(round => round.wrongOption), faultSkippedReason, rounds, retry, rewardCheck: { expectedRewardDelta, pointDelta, playDelta, newLetterClaims }, transaction: chapterTransaction ? { transactionId: chapterTransaction.transactionId, rewardDelta: chapterTransaction.rewardDelta, parentClaimed: chapterTransaction.parentClaimed } : null, changedKeys: changed });
      rows.push({kind: 'letter-chapter-completion', chapterId, visibleStartAction: visibleAction, actualRounds: rounds.length, rewardCheck: {expectedRewardDelta, pointDelta, playDelta, newLetterClaims}, retry, transaction: chapterTransaction ? {transactionId: chapterTransaction.transactionId, parentClaimed: chapterTransaction.parentClaimed} : null});
      awardRows.push({ chapterId, transaction: chapterTransaction });
      await click(page.getByRole('button', { name: 'Choose another chapter', exact: true }), 'Return to Letter Launch chapter menu');
      await page.locator('.letter-launch-chapters article').nth(index).waitFor({ state: 'visible', timeout: 10000 });
      if (index === 0 && rows.some(row => row.kind === 'letters-audio')) {
        const play = page.locator('.letter-launch-chapters article').nth(index + 1).getByRole('button');
        if (await play.isEnabled()) {
          await clickNavigation(play, 'Open next Letter Launch chapter for leave-cancellation check', { waitFor: page.locator('.letter-launch-play') });
          const beforeMedia = (await mediaSnapshot()).map(row => row.id);
          const replay = page.getByRole('button', { name: 'Hear the clue again', exact: true });
          if (await replay.count() && await replay.isEnabled()) {
            await click(replay, 'Start packaged audio before leaving Letter Launch');
            const active = await waitAudioStarted(beforeMedia);
            await click(page.getByRole('button', { name: 'Choose a chapter', exact: true }), 'Leave active round for chapter menu');
            const stopped = await waitAudioStopped(active.id);
            rows.push({ kind: 'letters-audio-leave', srcPath: active.path, stopped: stopped.paused || stopped.ended });
          } else await click(page.getByRole('button', { name: 'Choose a chapter', exact: true }), 'Return to chapter menu');
          await page.locator('.letter-launch-menu').waitFor({ state: 'visible', timeout: 5000 });
          await click(page.getByRole('button', { name: 'Back to learning world', exact: true }), 'Return to Read & Write parent');
          await page.getByRole('heading', { name: 'Read & Write', exact: true }).waitFor({ state: 'visible', timeout: 10000 });
          await launchCatalogueCard('Letter Launch', 'Read & Write');
          await page.locator('.letter-launch-chapters article').nth(index + 1).waitFor({ state: 'visible', timeout: 10000 });
        }
      }
    }
    const after = await snapshotStorage();
    const expectedChanges = assertOnlyKeys(baseline, after, [
      'amari_letter_launch_progress_v1', 'amari_chapter_badges_v1', 'amari_rewards_v2',
      'amari_letter_launch_recent_v1_*', 'amari_game_diagnostics_v1', 'amari_game_lifecycle_diagnostics_v1',
      'amari_learning_attempts_v1', 'amari_skill_mastery_v1', 'amari_spelling_progress_v1',
      'amari_points', 'amari_earned_sticker_ids_v1', 'amari_games_played',
      'amari_challenge_progress', 'amari_challenge_done',
    ]);
    const endingRewards = await readRewardState();
    const nonLetterGamesBefore = Object.fromEntries(Object.entries(startingRewards.gamesPlayed).filter(([game]) => game !== 'letters'));
    const nonLetterGamesAfter = Object.fromEntries(Object.entries(endingRewards.gamesPlayed).filter(([game]) => game !== 'letters'));
    const nonLetterClaimsBefore = Object.fromEntries(Object.entries(startingRewards.rewardClaims).filter(([key]) => !key.startsWith('dino:letters:')));
    const nonLetterClaimsAfter = Object.fromEntries(Object.entries(endingRewards.rewardClaims).filter(([key]) => !key.startsWith('dino:letters:')));
    assert(JSON.stringify(nonLetterGamesBefore) === JSON.stringify(nonLetterGamesAfter), 'Letter Launch changed another game count', { nonLetterGamesBefore, nonLetterGamesAfter });
    assert(JSON.stringify(nonLetterClaimsBefore) === JSON.stringify(nonLetterClaimsAfter), 'Letter Launch changed another game reward claim', { nonLetterClaimsBefore, nonLetterClaimsAfter });
    assert(startingRewards.earnedStickerIds.every(id => endingRewards.earnedStickerIds.includes(id)), 'Letter Launch removed an existing reward sticker');
    const finalRender = `${OUTPUT}/native-letters-${VIEW}-${EXPECTED_ENTRY.split('/').at(-1).replace('.js','')}.jpg`;
    await page.screenshot({ path: finalRender, type: 'jpeg', quality: 65, fullPage: false });
    return { chapters: chapterRows, expectedChanges, finalRender, originalSoundRestored: true, faultPlan: FAULT_PLAN, faults: faultRows, rewards: { starting: startingRewards, ending: endingRewards, chapters: awardRows } };
  };

  const runFactFinder = async () => {
    await chooseAmari();
    await launchCatalogueCard('Fact Finder', 'Explore & Languages');
    await installMediaObserver();
    baseline = await snapshotStorage();
    const originalSound = await soundState();
    const categories = [
      ['Everything', 34], ['Animals', 16], ['Dinosaurs', 5], ['Space', 9], ['Nature', 4],
    ];
    const categoryRows = [];
    for (const [name, expected] of categories) {
      await clickNavigation(page.getByRole('group', { name: 'Filter topics by category' }).getByRole('button', { name, exact: true }), `Filter Fact Finder category ${name}`);
      const countText = (await page.locator('.fact-finder-count').innerText()).trim();
      const count = Number.parseInt(countText, 10);
      assert(count === expected, `Fact Finder ${name} count ${count}, expected ${expected}`);
      categoryRows.push({ name, count });
    }
    const search = page.getByRole('searchbox', { name: 'Search topics' });
    await click(page.getByRole('group', { name: 'Filter topics by category' }).getByRole('button', { name: 'Everything', exact: true }), 'Reset Fact Finder category');
    await search.fill('  T. REX  ');
    let results = await page.locator('ul[aria-label="Topics"] li button').allTextContents();
    assert(results.some(text => /Tyrannosaurus rex/i.test(text)), 'Case/space-normalized T. rex alias did not find its article', { results });
    await search.fill('túlíp');
    results = await page.locator('ul[aria-label="Topics"] li button').allTextContents();
    assert(results.some(text => /Tulip/i.test(text)), 'Diacritic-normalized tulip query failed', { results });
    await search.fill('ladybug');
    results = await page.locator('ul[aria-label="Topics"] li button').allTextContents();
    assert(results.some(text => /Ladybird/i.test(text)), 'Ladybug alias did not find Ladybird', { results });
    await search.fill('definitely-no-topic-pair11');
    await page.getByRole('status').filter({ hasText: 'No topics match that search' }).waitFor({ state: 'visible', timeout: 5000 });
    await search.fill('');
    await click(page.getByRole('button', { name: 'Everything', exact: true }), 'Clear Fact Finder filter');
    const articleCases = [
      { name: 'Mercury', category: 'Space', expectedFact: /smallest planet/i, explore: 'Explore in Solar System Explorer' },
      { name: 'Bee', category: 'Animals', expectedFact: /nectar and pollen/i, explore: 'Explore in Nature Lab' },
      { name: 'Tyrannosaurus rex', category: 'Dinosaurs', expectedFact: /meat-eating dinosaur/i, explore: 'Explore in Dino Detective' },
      { name: 'Tulip', category: 'Nature', expectedFact: /flowering plant/i, explore: 'Explore in Nature Lab' },
    ];
    const articleRows = [];
    for (const item of articleCases) {
      await click(page.getByRole('button', { name: item.category, exact: true }), `Select ${item.category} category for ${item.name}`);
      const topic = page.locator('ul[aria-label="Topics"] li button').filter({ hasText: item.name }).first();
      await clickNavigation(topic, `Open Fact Finder article ${item.name}`, { waitFor: page.locator('.fact-finder-detail') });
      const title = page.getByRole('heading', { level: 2, name: item.name, exact: true });
      const focus = await page.evaluate(() => document.activeElement?.id || document.activeElement?.textContent?.trim() || '');
      assert(focus === 'fact-finder-title', `Article ${item.name} did not focus its title`, { focus });
      const factText = (await page.locator('.fact-finder-facts').innerText()).trim();
      assert(item.expectedFact.test(factText), `Article text mismatch for ${item.name}`, { factText });
      const image = page.locator('.fact-finder-art-image');
      if (await image.count()) {
        await page.waitForFunction(img => img.complete && img.naturalWidth > 0, await image.elementHandle(), { timeout: 10000 });
        const identity = await image.evaluate(img => ({ src: new URL(img.currentSrc || img.src).pathname, alt: img.alt, width: img.naturalWidth }));
        articleRows.push({ name: item.name, image: identity });
      } else articleRows.push({ name: item.name, art: 'authored Dino SVG' });
      const source = page.locator('.fact-finder-source a');
      assert(await source.count() === 1 && (await source.getAttribute('href')).startsWith('https://'), `${item.name} source link is missing or not direct HTTPS`);
      const back = page.getByRole('button', { name: 'Back to topics', exact: true });
      await click(back, `Return from ${item.name} article`, { waitFor: page.locator('ul[aria-label="Topics"]') });
      await page.waitForFunction(name => document.activeElement?.textContent?.trim().includes(name), item.name, { timeout: 3000 });
      const focusAfter = await page.evaluate(() => document.activeElement?.innerText?.trim() || '');
      assert(focusAfter.includes(item.name), `Back to topics did not restore focus to ${item.name}`, { focusAfter });
    }
    await click(page.getByRole('button', { name: 'Space', exact: true }), 'Open Space category for audio check');
    const mercury = page.locator('ul[aria-label="Topics"] li button').filter({ hasText: 'Mercury' }).first();
    await click(mercury, 'Open Mercury article for packaged audio check', { waitFor: page.locator('.fact-finder-detail') });
    const audioButtons = page.locator('.fact-finder-facts button[aria-label^="Hear fact:"]');
    const audioCount = await audioButtons.count();
    const soundBefore = await soundState();
    if (!soundBefore) await setSound(true);
    const audioRows = [];
    if (audioCount) {
      const firstAudio = audioButtons.nth(0);
      const beforeIds = (await mediaSnapshot()).map(row => row.id);
      await clickNavigation(firstAudio, 'Play exact packaged Fact Finder fact clip');
      const first = await waitAudioStarted(beforeIds);
      const progressBefore = { currentTime: first.currentTime, lastEventAt: Math.max(0, ...first.events.map(event => event.at)) };
      const advancement = await waitAudioAdvanced(first.id, progressBefore, 4000);
      const firstAfter = advancement.row;
      assert(first.path.startsWith('/audio/'), 'Fact Finder clip was not an exact packaged audio path', { first });
      audioRows.push({ id: first.id, path: first.path, advancedBy: firstAfter.currentTime - progressBefore.currentTime, proof: advancement.proof, waitedAtMostMs: 4000 });
      if (audioCount > 1) {
        const secondBefore = (await mediaSnapshot()).map(row => row.id);
        await click(audioButtons.nth(1), 'Play second packaged Fact Finder fact clip');
        const second = await waitAudioStarted(secondBefore);
        const stoppedFirst = await waitAudioStopped(first.id);
        audioRows.push({ id: second.id, path: second.path, firstStopped: stoppedFirst.paused || stoppedFirst.ended });
      }
      const current = (await mediaSnapshot()).find(row => !row.paused && row.path.startsWith('/audio/'));
      if (current) {
        await setSound(false);
        const stopped = await waitAudioStopped(current.id);
        audioRows.push({ mutedId: current.id, stoppedByMute: stopped.paused || stopped.ended });
      }
    }
    await setSound(originalSound);
    const beeSearch = page.getByRole('button', { name: 'Back to topics', exact: true });
    await click(beeSearch, 'Return from Mercury audio article');
    await click(page.getByRole('button', { name: 'Animals', exact: true }), 'Open Animals category for no-clip example');
    await clickNavigation(page.locator('ul[aria-label="Topics"] li button').filter({ hasText: 'Bee' }).first(), 'Open Bee no-clip article');
    const beeAudio = await page.locator('.fact-finder-facts button[aria-label^="Hear fact:"]').count();
    assert(beeAudio === 0, 'Bee should show written guidance because source inventory has no exact packaged fact clip', { beeAudio });
    rows.push({ kind: 'factfinder-no-clip', topic: 'Bee', hearFactButtonCount: beeAudio, visibleFactText: await page.locator('.fact-finder-facts').innerText() });
    const noWriteSnapshot = await snapshotStorage();
    const noWriteChanges = assertOnlyKeys(baseline, noWriteSnapshot, []);
    const finalRender = `${OUTPUT}/native-factfinder-${VIEW}-${EXPECTED_ENTRY.split('/').at(-1).replace('.js','')}.jpg`;
    await click(page.getByRole('button', { name: 'Back to topics', exact: true }), 'Return to Fact Finder topics before Explore routes');
    await click(page.getByRole('button', { name: 'Space', exact: true }), 'Open Space category for unmount-cancellation check');
    await clickNavigation(page.locator('ul[aria-label="Topics"] li button').filter({ hasText: 'Mercury' }).first(), 'Open Mercury for unmount-cancellation check', { waitFor: page.locator('.fact-finder-detail') });
    const leaveAudioButton = page.locator('.fact-finder-facts button[aria-label^="Hear fact:"]').first();
    if (await leaveAudioButton.count() && await leaveAudioButton.isVisible()) {
      if (!await soundState()) await setSound(true);
      const beforeIds = (await mediaSnapshot()).map(row => row.id);
      await clickNavigation(leaveAudioButton, 'Start exact packaged clip before leaving Fact Finder');
      const active = await waitAudioStarted(beforeIds);
      await clickNavigation(page.getByRole('button', { name: 'Worlds', exact: true }), 'Leave Fact Finder article for Explore parent');
      const stopped = await waitAudioStopped(active.id);
      rows.push({ kind: 'factfinder-audio-leave', id: active.id, path: active.path, stopped: stopped.paused || stopped.ended });
      await page.getByRole('heading', { name: 'Explore & Languages', exact: true }).waitFor({ state: 'visible', timeout: 10000 });
      await launchCatalogueCard('Fact Finder', 'Explore & Languages');
      await click(page.getByRole('button', { name: 'Everything', exact: true }), 'Return to all Fact Finder topics');
    } else rows.push({ kind: 'factfinder-audio-leave', skipped: true, reason: 'No exact clip control was available to start' });
    await setSound(originalSound);
    const afterAudioLeave = await snapshotStorage();
    assertOnlyKeys(baseline, afterAudioLeave, []);
    await page.screenshot({ path: finalRender, type: 'jpeg', quality: 65, fullPage: false });
    const exploreCases = [
      { topic: 'Tulip', category: 'Nature', button: 'Explore in Nature Lab', url: /\/play\/worldmap\/nature-lab$/, heading: 'Nature Lab' },
      { topic: 'Tyrannosaurus rex', category: 'Dinosaurs', button: 'Explore in Dino Detective', url: /\/play\/dino$/, heading: 'Dino Detective' },
      { topic: 'Mercury', category: 'Space', button: 'Explore in Solar System Explorer', url: /\/play\/solar$/, heading: 'Solar System Explorer' },
    ];
    const exploreRows = [];
    for (const item of exploreCases) {
      await click(page.getByRole('button', { name: item.category, exact: true }), `Select ${item.category} for Explore route`);
      const entryButton = page.locator('ul[aria-label="Topics"] li button').filter({ hasText: item.topic }).first();
      await clickNavigation(entryButton, `Open ${item.topic} article for Explore route`);
      await page.getByRole('heading', { name: item.topic, exact: true }).waitFor({ state: 'visible', timeout: 5000 });
      const explore = page.getByRole('button', { name: item.button, exact: true });
      await clickNavigation(explore, `${item.topic} Explore action`, { url: item.url, timeout: 15000 });
      await page.getByRole('heading', { name: item.heading, exact: true }).waitFor({ state: 'visible', timeout: 15000 });
      const hash = await page.evaluate(() => location.hash);
      assert(item.url.test(hash), `Explore from ${item.topic} launched wrong route: ${hash}`);
      if (item.topic === 'Tulip') assert(hash.includes('/nature-lab'), 'Nature article did not pass explicit Nature Lab module', { hash });
      exploreRows.push({ topic: item.topic, hash, heading: item.heading });
      await click(page.getByRole('button', { name: 'Worlds', exact: true }), `Return from ${item.heading} using normal Worlds navigation`);
      const leaveDialog = page.getByRole('dialog', { name: 'Leave the game?' });
      if (await leaveDialog.count() && await leaveDialog.isVisible()) {
        const destination = leaveDialog.getByRole('button', { name: 'Back to world', exact: true });
        await click(destination, 'Confirm return to parent world');
      }
      await page.getByRole('heading', { name: 'Explore & Languages', exact: true }).waitFor({ state: 'visible', timeout: 10000 });
      await launchCatalogueCard('Fact Finder', 'Explore & Languages');
    }
    const afterRoutes = await snapshotStorage();
    const routeChanges = storageChanges(noWriteSnapshot, afterRoutes).map(physicalToLogical);
    const expectedRecent = routeChanges.filter(key => key === 'amari_recent_games_v1' || key === 'amari_recent_games');
    const moduleKey = '(continents|nature-lab|time-detectives)';
    const bandKey = '(starter|growing|challenge)';
    const expectedCurriculumRouteKey = new RegExp(`^amari_curriculum_(?:preferences_v1|(?:session|recent)_v1_${moduleKey}_${bandKey})$`);
    const allowedRouteKeys = routeChanges.filter(key => expectedRecent.includes(key) || expectedCurriculumRouteKey.test(key) || ['amari_game_diagnostics_v1', 'amari_game_lifecycle_diagnostics_v1'].includes(key));
    const unexpectedRouteChanges = routeChanges.filter(key => !allowedRouteKeys.includes(key));
    const forbiddenRewardOrProgressWrites = routeChanges.filter(key => /(?:reward|points|sticker|badge|completion|progress|mastery|learning_attempt|game_levels)/i.test(key) && !expectedCurriculumRouteKey.test(key));
    assert(unexpectedRouteChanges.length === 0, 'Explore routes changed storage beyond the app recent-game navigation record', { routeChanges, unexpectedRouteChanges });
    assert(forbiddenRewardOrProgressWrites.length === 0, 'Fact Finder Explore changed reward or game progress storage', { routeChanges, forbiddenRewardOrProgressWrites });
    return { categories: categoryRows, searchAliases: ['T. REX', 'túlíp', 'ladybug'], articleRows, audioRows, beeAudioCount: beeAudio, noWriteChanges, exploreRows, routeChanges, allowedRouteKeys, forbiddenRewardOrProgressWrites, finalRender };
  };

  let flowResult = null;
  try {
    assert(['letters', 'factfinder'].includes(FLOW), `Unknown Pair11 flow ${FLOW}`);
    await page.setViewportSize({ width: WIDTH, height: HEIGHT });
    await page.route('**/*', providerRoute);
    await page.goto(`${ORIGIN}/?qa_pair11_${FLOW}=${Date.now()}-${WIDTH}-${HEIGHT}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    startingUrl = page.url();
    await assertRuntime();
    await chooseAmari();
    await installMediaObserver();
    initialSound = await soundState().catch(() => null);
    baseline = await snapshotStorage();
    flowResult = FLOW === 'letters' ? await runLetterLaunch() : await runFactFinder();
    flowResult.initialSound = initialSound;
    flowResult.finalSound = await soundState().catch(() => null);
  } catch (error) {
    failures.push({ message: String(error?.message || error), evidence: error?.evidence || null, stack: String(error?.stack || '').slice(0, 5000), partialRows: rows.slice(-100) });
  } finally {
    try { await page.evaluate(() => window.__pair11StorageFaultV1?.restore?.()); } catch { /* no fault is armed or the page navigated */ }
    try { if (initialSound !== null) await setSound(initialSound); } catch { /* restore only if the sound control remains on the current page */ }
    try { await page.evaluate(() => window.__pair11MediaObserverV1?.dispose?.()); } catch { /* page may have navigated */ }
    try { lastStorage = await snapshotStorage(); } catch { lastStorage = null; }
    page.off('pageerror', onPageError);
    page.off('console', onConsole);
    page.off('request', onRequest);
    page.off('requestfailed', onRequestFailed);
    page.off('response', onResponse);
    try { await page.unroute('**/*', providerRoute); } catch { /* leave caller's page usable */ }
  }
  return {
    passed: failures.length === 0 && providerAttempts.length === 0 && pageErrors.length === 0 && consoleErrors.length === 0 && failedRequests.length === 0 && failedResponses.length === 0,
    flow: FLOW,
    stage: __STAGE__,
    origin: ORIGIN,
    viewport: { width: WIDTH, height: HEIGHT },
    entryIdentity,
    startingUrl,
    flowResult,
    rows,
    failures,
    errors: await digestReport(),
    baselineRawDigestSummary: baseline,
    finalRawDigestSummary: lastStorage,
  };
}
