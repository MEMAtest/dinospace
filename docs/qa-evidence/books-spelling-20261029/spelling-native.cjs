async page => {
  const ORIGIN = __ORIGIN__;
  const WIDTH = __WIDTH__;
  const HEIGHT = __HEIGHT__;
  const START_LEVEL = __START_LEVEL__;
  const EXPECTED_ENTRY = __EXPECTED_ENTRY__;
  const CLUE_MAP = __CLUE_MAP__;
  const OUT = __OUT__;
  const VIEW = `${WIDTH}x${HEIGHT}`;
  const LEVELS = [
    { name: 'Copy the word', target: 5, mode: 'copy' },
    { name: 'Find the missing sound', target: 6, mode: 'missing' },
    { name: 'Build the whole word', target: 7, mode: 'spell' },
    { name: 'Four-letter explorer', target: 3, mode: 'spell', length: 4 },
    { name: 'Five-letter builder', target: 6, mode: 'spell', length: 5 },
    { name: 'Long-word challenge', target: 4, mode: 'spell', minLength: 6, maxLength: 7 },
  ];
  const LEGACY_KEY = 'amari_game_levels_v1';
  const WORDS_KEY = 'amari_words_session_progress_v1:amari';
  const SPELLING_KEY = 'amari_spelling_progress_v1';
  const REWARD_KEY = 'amari_rewards_v2';
  const WRITING_KEY = 'amari_writing_samples_v1';
  const RECENT_KEY = 'amari_spelling_recent_v1';
  const DIAGNOSTIC_KEY = 'amari_game_diagnostics_v1';
  const LIFECYCLE_KEY = 'amari_game_lifecycle_diagnostics_v1';
  const LEARNING_ATTEMPTS_KEY = 'amari_learning_attempts_v1';
  const SIBLING = 'askia';
  const rows = [], failures = [], pageErrors = [], consoleErrors = [], failedResources = [], failedRequests = [], providerRequests = [];
  const touchedSpellingWords = new Set();
  let entryIdentity = null, activeFault = false;
  const onPageError = error => pageErrors.push(String(error.message || error));
  const onConsole = message => { if (message.type() === 'error') consoleErrors.push(message.text()); };
  const onResponse = response => { if (response.status() >= 400) failedResources.push({ status: response.status(), url: response.url() }); };
  const onFailed = request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText || 'unknown' });
  const onRequest = request => { if (/\/api\//i.test(request.url())) providerRequests.push(request.url()); };
  page.on('pageerror', onPageError); page.on('console', onConsole); page.on('response', onResponse); page.on('requestfailed', onFailed); page.on('request', onRequest);
  await page.setViewportSize({ width: WIDTH, height: HEIGHT });
  const actualViewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }));
  if (actualViewport.width !== WIDTH || actualViewport.height !== HEIGHT) throw new Error(`Requested viewport ${WIDTH}x${HEIGHT}, got ${actualViewport.width}x${actualViewport.height}`);

  const raw = key => page.evaluate(name => {
    try { return localStorage.getItem(name); } catch (error) { return `!STORAGE_ERROR:${error.name}`; }
  }, key);
  const json = async key => {
    const value = await raw(key);
    if (value?.startsWith('!STORAGE_ERROR:')) throw new Error(`Could not read storage key ${key}`);
    try { return value === null ? null : JSON.parse(value); } catch { throw new Error(`Malformed JSON in ${key}`); }
  };
  const snapshot = async () => ({
    legacy: await raw(LEGACY_KEY), words: await raw(WORDS_KEY), spelling: await raw(SPELLING_KEY),
    rewards: await raw(REWARD_KEY), writing: await raw(WRITING_KEY), recent: await raw(RECENT_KEY),
    diagnostics: await raw(DIAGNOSTIC_KEY), lifecycle: await raw(LIFECYCLE_KEY), learningAttempts: await raw(LEARNING_ATTEMPTS_KEY),
    ownLittle: await raw('amari_little_progress'), siblingLittle: await raw(`${SIBLING}_little_progress`),
    siblingWords: await raw(`amari_words_session_progress_v1:${SIBLING}`), siblingRewards: await raw(`${SIBLING}_rewards_v2`),
  });
  const summarizeSnapshot = async value => page.evaluate(async snapshotValue => {
    const result = {};
    for (const [key, rawValue] of Object.entries(snapshotValue || {})) {
      if (rawValue === null) { result[key] = { present: false }; continue; }
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawValue));
      const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
      result[key] = { present: true, bytes: new TextEncoder().encode(rawValue).length, sha256: hash };
    }
    return result;
  }, value);
  const assertNamespace = async () => {
    if (!await page.evaluate(() => window.__amariQaNamespaced === true)) throw new Error('Retained-profile namespace guard is missing');
  };
  const assertEntry = async () => {
    entryIdentity = await page.locator('script[type="module"][src]').first().getAttribute('src');
    if (!entryIdentity || !entryIdentity.includes(EXPECTED_ENTRY)) throw new Error(`Compiled entry mismatch: ${entryIdentity}; expected ${EXPECTED_ENTRY}`);
  };
  const installMedia = async () => page.addInitScript(() => {
    if (window.__spellingDirectMediaV1) return;
    window.__spellingDirectMediaV1 = true;
    window.__spellingMediaEventsV1 = [];
    const seen = new WeakSet(), original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...args) {
      if (!seen.has(this)) {
        seen.add(this);
        for (const type of ['play', 'playing', 'timeupdate', 'pause', 'ended', 'error']) this.addEventListener(type, () => {
          window.__spellingMediaEventsV1.push({ type, src: this.currentSrc || this.src || '', time: this.currentTime, duration: this.duration });
        });
      }
      return original.apply(this, args);
    };
  });
  const mediaEvents = () => page.evaluate(() => window.__spellingMediaEventsV1 || []);
  const measure = async (label, locator) => {
    const geometry = await locator.evaluate(element => {
      const r = element.getBoundingClientRect();
      const x = Math.max(0, Math.min(innerWidth - 1, r.left + r.width / 2));
      const y = Math.max(0, Math.min(innerHeight - 1, r.top + r.height / 2));
      const hit = document.elementFromPoint(x, y);
      return {
        rect: { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height },
        viewport: { width: innerWidth, height: innerHeight },
        centerHit: Boolean(hit && (hit === element || element.contains(hit))),
        inViewport: r.width > 0 && r.height > 0 && r.x >= 0 && r.y >= 0 && r.right <= innerWidth && r.bottom <= innerHeight,
      };
    });
    const row = { kind: 'control-geometry', label, ...geometry };
    rows.push(row);
    if (!geometry.inViewport || !geometry.centerHit) throw new Error(`${label} is outside the viewport or its center is covered: ${JSON.stringify(row)}`);
    if (geometry.rect.width < 44 || geometry.rect.height < 44) throw new Error(`${label} is below the 44px touch target: ${JSON.stringify(row)}`);
    return geometry;
  };
  const measureReadable = async (label, locator) => {
    const geometry = await locator.evaluate(element => {
      const r = element.getBoundingClientRect();
      return { rect: { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height }, viewport: { width: innerWidth, height: innerHeight }, visible: r.width > 0 && r.height > 0 && r.x >= 0 && r.y >= 0 && r.right <= innerWidth && r.bottom <= innerHeight };
    });
    rows.push({ kind: 'readable-content-geometry', label, ...geometry });
    if (!geometry.visible) throw new Error(`${label} is clipped or outside the viewport: ${JSON.stringify(geometry)}`);
    return geometry;
  };
  const scrollOptionalIntoView = async (label, locator) => {
    const before = await locator.boundingBox();
    const initialScrollY = await page.evaluate(() => window.scrollY);
    let scrolled = false;
    if (!before || before.y < 0 || before.y + before.height > HEIGHT) {
      await locator.scrollIntoViewIfNeeded();
      scrolled = true;
    }
    const finalScrollY = await page.evaluate(() => window.scrollY);
    rows.push({ kind: 'optional-practice-scroll', label, scrolled, initialRect: before, initialScrollY, finalScrollY });
  };
  const measureOptionalTarget = async (label, locator) => {
    await scrollOptionalIntoView(label, locator);
    return measure(label, locator);
  };
  const returnToActiveCard = async label => {
    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.move(WIDTH / 2, HEIGHT / 2);
    await page.mouse.wheel(0, -Math.max(HEIGHT, 900));
    await page.waitForTimeout(150);
    const after = await page.evaluate(() => window.scrollY);
    rows.push({ kind: 'optional-practice-return-scroll', label, before, after });
  };
  const parseWords = async () => {
    const progress = await json(WORDS_KEY);
    const legacy = await json(LEGACY_KEY);
    const legacyWords = legacy?.words;
    const legacyRewardThrough = Number.isInteger(progress?.legacyRewardThrough)
      ? progress.legacyRewardThrough
      : legacyWords && Number.isInteger(legacyWords.unlocked) ? legacyWords.unlocked : -1;
    return { progress, legacy, legacyWords, legacyRewardThrough };
  };
  const pointPlan = async () => {
    const { progress, legacyRewardThrough } = await parseWords();
    const points = LEVELS.map(() => 6);
    return {
      oldBest: LEVELS.map((_, index) => progress?.bestPointsByLevel?.[String(index)] ?? progress?.bestPointsByLevel?.[index] ?? 0),
      legacyRewardThrough,
      plannedPoints: points,
      plannedDelta: points.map((score, index) => index <= legacyRewardThrough ? 0 : Math.max(0, score - (progress?.bestPointsByLevel?.[String(index)] ?? progress?.bestPointsByLevel?.[index] ?? 0))),
    };
  };
  const mapFromVisiblePrompt = async (mode) => {
    const card = page.locator('section.amari-scene-card');
    if (mode === 'copy') {
      const visible = card.locator('[aria-label^="Word to copy: "]');
      const label = await visible.getAttribute('aria-label');
      const answer = label?.replace(/^Word to copy: /, '').trim().toUpperCase();
      const graphemes = Object.values(CLUE_MAP).find(letters => letters.join('').toUpperCase() === answer);
      if (!answer || !graphemes) throw new Error(`Could not derive visible copy word graphemes: ${label}`);
      return { answer, graphemes, clue: label, method: 'visible copy word' };
    }
    const accessibleCues = await card.locator('img[alt], [role="img"][aria-label]').evaluateAll(items => items.map(item => item.getAttribute('alt') || item.getAttribute('aria-label') || '').filter(Boolean));
    const cue = accessibleCues.find(text => Object.hasOwn(CLUE_MAP, text));
    if (!cue) throw new Error(`No authored clue-map match for visible accessible cue: ${JSON.stringify(accessibleCues)}`);
    const graphemes = CLUE_MAP[cue];
    return { answer: graphemes.join('').toUpperCase(), graphemes, clue: cue, method: 'visible accessible picture clue' };
  };
  const currentMode = async () => {
    const selected = page.locator('[aria-label="Spelling practice modes"] button[aria-pressed="true"]');
    return (await selected.innerText()).trim().split('\n')[0].toLowerCase();
  };
  const assertStageGeometry = async (stageIndex, expectedMode, expectedSpaceCount) => {
    const modes = page.locator('[aria-label="Spelling practice modes"]');
    const selected = modes.locator('button[aria-pressed="true"]');
    await measure('selected mode', selected);
    const modeName = await currentMode();
    if (!modeName.toLowerCase().includes(expectedMode === 'copy' ? 'learn it' : expectedMode === 'missing' ? 'sound gap' : 'spell it')) throw new Error(`Level ${stageIndex + 1} mode mismatch: ${modeName}`);
    const wordSpaces = page.locator('[aria-label="Word spaces"]');
    const spaceCount = await wordSpaces.locator('div').count();
    if (spaceCount < 1 || spaceCount !== expectedSpaceCount) throw new Error(`Visible grapheme spaces do not match the visible clue at level ${stageIndex + 1}: ${spaceCount} spaces vs ${expectedSpaceCount} clue graphemes`);
    const controls = expectedMode === 'missing'
      ? page.locator('[aria-label="Choose the missing sound"] button')
      : page.locator('[aria-label="Letter tiles"] button');
    const count = await controls.count();
    if (expectedMode === 'missing' ? count < 1 : count < spaceCount) throw new Error(`Level ${stageIndex + 1} has too few visible answer controls for its mode`);
    const controlsGeometry = await controls.evaluateAll(items => items.map(item => {
      const r = item.getBoundingClientRect();
      const x = Math.max(0, Math.min(innerWidth - 1, r.left + r.width / 2)), y = Math.max(0, Math.min(innerHeight - 1, r.top + r.height / 2));
      const hit = document.elementFromPoint(x, y);
      return { label: item.innerText.trim(), x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height, centerHit: Boolean(hit && (hit === item || item.contains(hit))), inViewport: r.x >= 0 && r.y >= 0 && r.right <= innerWidth && r.bottom <= innerHeight };
    }));
    if (controlsGeometry.some(item => item.width < 44 || item.height < 44 || !item.centerHit || !item.inViewport)) throw new Error(`Level ${stageIndex + 1} has an undersized, obscured, or offscreen letter control: ${JSON.stringify(controlsGeometry)}`);
    await measure('hear the word', page.getByRole('button', { name: 'Hear the word', exact: true }));
    if (expectedMode !== 'copy') await measure('show clue', page.getByRole('button', { name: 'Show a clue', exact: true }));
    return { modeName, graphemeSpaces: spaceCount, controls: controlsGeometry };
  };
  const tileButton = letter => page.locator('[aria-label="Letter tiles"]').getByRole('button', { name: letter, exact: true }).first();
  const typeVisibleAnswer = async (expectedMode, expected, { wrong = false, perWordFault = null } = {}) => {
    const card = page.locator('section.amari-scene-card');
    if (expectedMode === 'missing') {
      const spaces = await card.locator('[aria-label="Word spaces"] div').evaluateAll(items => items.map(item => item.innerText.trim()));
      const missingAt = spaces.findIndex(text => !text || text === '•');
      if (missingAt < 0) throw new Error('Missing-sound stage did not expose one blank sound space');
      const options = card.locator('[aria-label="Choose the missing sound"] button');
      if (wrong) {
        const bad = options.filter({ hasNotText: expected.graphemes[missingAt] }).first();
        if (!await bad.count()) throw new Error('Missing-sound board did not offer a wrong retry choice');
        await measure('wrong missing-sound option', bad); await bad.click();
        const feedback = card.getByText('Say the word slowly and listen again.', { exact: true });
        await feedback.waitFor({ timeout: 4000 }); await measureReadable('wrong missing-sound feedback', feedback);
        const retained = await mapFromVisiblePrompt(expectedMode);
        if (retained.answer !== expected.answer) throw new Error('Wrong missing-sound choice changed the held word');
        rows.push({ kind: 'wrong-answer-held-word', mode: expectedMode, clue: expected.clue, heldWordLength: spaces.length });
      }
      const choice = options.filter({ hasText: expected.graphemes[missingAt] }).first();
      await measure('missing-sound answer', choice); await choice.click();
      return;
    }

    if (wrong) {
      const badLetter = expected.graphemes.find(letter => letter !== expected.graphemes[0]);
      if (!badLetter) throw new Error('No distinct first-letter wrong choice available');
      const bad = tileButton(badLetter);
      if (!await bad.count()) throw new Error(`Wrong tile ${badLetter} is not visible`);
      const tileCountBefore = await card.locator('[aria-label="Letter tiles"] button').count();
      await measure('wrong spelling tile', bad); await bad.click();
      const feedback = expectedMode === 'copy' ? `The next letter is ${expected.graphemes[0]}` : 'Say the word slowly and listen for the next sound.';
      const feedbackLocator = card.getByText(feedback, { exact: true });
      await feedbackLocator.waitFor({ timeout: 4000 }); await measureReadable('wrong spelling feedback', feedbackLocator);
      if (await card.locator('[aria-label="Letter tiles"] button').count() !== tileCountBefore) throw new Error('Wrong tile was consumed instead of held for retry');
      const retained = await mapFromVisiblePrompt(expectedMode);
      if (retained.answer !== expected.answer) throw new Error('Wrong letter changed the held spelling clue');
      rows.push({ kind: 'wrong-answer-held-word', mode: expectedMode, clue: expected.clue, wrongTile: badLetter, tileCountBefore });
    }
    for (let index = 0; index < expected.graphemes.length; index += 1) {
      if (perWordFault && index === expected.graphemes.length - 1) await armFault(SPELLING_KEY, perWordFault);
      const tile = tileButton(expected.graphemes[index]);
      await tile.waitFor({ state: 'visible', timeout: 4000 });
      await measure('letter tile answer', tile); await tile.click();
      if (perWordFault && index === expected.graphemes.length - 1) {
        const retryWord = page.getByRole('button', { name: 'Retry saving word', exact: true });
        await retryWord.waitFor({ state: 'visible', timeout: 5000 });
        await measure('per-word save Retry', retryWord);
        await restoreFault();
        await retryWord.click();
        rows.push({ kind: 'per-word-save-retry', fault: perWordFault, visibleRetry: true, sameWordHeld: true });
      }
    }
    await card.getByRole('button', { name: /^(Next word|Finish stage)$/ }).waitFor({ state: 'visible', timeout: 8000 });
  };
  const armFault = async (targetKey, kind) => {
    await page.evaluate(({ targetKey, kind }) => {
      if (window.__spellingFaultRestore) throw new Error('A Spelling QA storage fault is already armed');
      const originalSet = Storage.prototype.setItem, originalGet = Storage.prototype.getItem;
      window.__spellingFaultHit = 0;
      window.__spellingFaultAfterWrite = false;
      Storage.prototype.setItem = function (key, value) {
        if (key === targetKey && kind === 'write' && window.__spellingFaultHit === 0) {
          window.__spellingFaultHit += 1;
          throw new DOMException('One-shot Spelling QA write failure', 'QuotaExceededError');
        }
        const result = originalSet.call(this, key, value);
        if (key === targetKey && kind === 'readback') window.__spellingFaultAfterWrite = true;
        if (key === targetKey && kind === 'parent' && window.__spellingFaultHit === 0) {
          window.__spellingFaultHit += 1;
          throw new DOMException('One-shot committed-but-unconfirmed parent reward failure', 'QuotaExceededError');
        }
        return result;
      };
      if (kind === 'readback') Storage.prototype.getItem = function (key) {
        if (key === targetKey && window.__spellingFaultAfterWrite && window.__spellingFaultHit === 0) {
          window.__spellingFaultHit += 1;
          return null;
        }
        return originalGet.call(this, key);
      };
      window.__spellingFaultRestore = () => { Storage.prototype.setItem = originalSet; Storage.prototype.getItem = originalGet; delete window.__spellingFaultRestore; };
    }, { targetKey, kind });
    activeFault = true;
  };
  const restoreFault = async () => {
    await page.evaluate(() => window.__spellingFaultRestore?.());
    activeFault = false;
  };
  const soundProbe = async () => {
    const before = (await mediaEvents()).length;
    const hear = page.getByRole('button', { name: 'Hear the word', exact: true });
    await hear.click();
    await page.waitForFunction(({ before }) => (window.__spellingMediaEventsV1 || []).slice(before).some(event => ['play', 'playing'].includes(event.type) && /\/audio\//.test(event.src)), { before }, { timeout: 10000 });
    const started = (await mediaEvents()).slice(before).find(event => ['play', 'playing'].includes(event.type) && /\/audio\//.test(event.src));
    if (!started) throw new Error('No exact packaged audio element started');
    const mute = page.getByRole('button', { name: 'Turn sound off', exact: true });
    await mute.click();
    await page.waitForFunction(({ before, src }) => (window.__spellingMediaEventsV1 || []).slice(before).some(event => event.src === src && ['pause', 'ended'].includes(event.type)), { before, src: started.src }, { timeout: 5000 });
    const stopped = (await mediaEvents()).slice(before).find(event => event.src === started.src && ['pause', 'ended'].includes(event.type));
    if (!started.src.includes('/audio/')) throw new Error(`Narration was not an exact packaged audio asset: ${started.src}`);
    if (stopped.type !== 'pause') throw new Error(`Mute did not pause the active packaged clip; observed ${stopped.type}`);
    await page.getByRole('button', { name: 'Turn sound on', exact: true }).click();
    return { source: started.src, packagedAudio: true, stoppedByMute: stopped.type };
  };
  const chooseAmariAndOpen = async () => {
    await installMedia();
    await page.goto(`${ORIGIN}/?qa_spelling=${Date.now()}-${WIDTH}-${HEIGHT}#/`);
    await assertNamespace(); await assertEntry();
    const choose = page.getByRole('button', { name: /Age 6\+ Amari/ }).first();
    if (await choose.count() && await choose.isVisible()) await choose.click();
    await page.locator('.discovery-world-card').filter({ hasText: 'Read & Write' }).click();
    await page.getByRole('heading', { name: 'Read & Write', exact: true }).waitFor({ timeout: 10000 });
  };
  const openOptional = async (label, mode) => {
    const summary = page.getByText('Optional practice (does not change this stage)', { exact: true });
    await scrollOptionalIntoView('optional practice disclosure', summary);
    await measureReadable('optional practice disclosure', summary);
    await summary.click();
    const launch = page.getByRole('button', { name: label, exact: true });
    await measureOptionalTarget(`optional practice ${label}`, launch); await launch.click();
    if (mode === 'tricky') {
      const expected = await mapFromVisiblePrompt('spell');
      touchedSpellingWords.add(expected.graphemes.join('').toUpperCase());
      const spaces = await page.locator('[aria-label="Word spaces"] div').count();
      const tileLabels = await page.locator('[aria-label="Letter tiles"] button').evaluateAll(items => items.map(item => item.innerText.trim().toLowerCase()));
      if (spaces !== expected.graphemes.length || expected.graphemes.some(letter => !tileLabels.includes(letter))) throw new Error('Optional Tricky Words does not expose the visible clue graphemes for practice');
      await typeVisibleAnswer('spell', expected);
      const back = page.getByRole('button', { name: 'Back to home', exact: true });
      await measureOptionalTarget('return from optional tricky practice', back); await back.click();
      await page.getByText(/Copy the word: 0 of 5 words/).waitFor({ timeout: 5000 });
      await returnToActiveCard('parent stage after tricky practice');
    } else {
      const samplesBefore = await json(WRITING_KEY) || [];
      const caption = (await page.locator('section.amari-scene-card > p.mt-3').first().innerText()).trim();
      const field = page.getByRole('textbox', { name: 'Writing sample', exact: true });
      await field.fill(caption);
      const saveWriting = page.getByRole('button', { name: 'Save my writing', exact: true });
      await measureOptionalTarget('save optional caption writing', saveWriting); await saveWriting.click();
      await page.getByRole('button', { name: 'Saved!', exact: true }).waitFor({ state: 'visible', timeout: 5000 });
      const samplesAfter = await json(WRITING_KEY) || [];
      if (samplesAfter.length !== samplesBefore.length + 1 || samplesBefore.some(sample => !samplesAfter.some(saved => saved.id === sample.id))) throw new Error('Caption practice did not preserve prior samples and add exactly one visible writing sample');
      const back = page.getByRole('button', { name: 'Back to home', exact: true });
      await measureOptionalTarget('return from optional caption writing', back); await back.click();
      await page.getByText(/Copy the word: 0 of 5 words/).waitFor({ timeout: 5000 });
      await returnToActiveCard('parent stage after caption practice');
    }
  };
  const runStage = async (index, config) => {
    const start = page.getByRole('button', { name: `Play Spelling Studio level ${index + 1}`, exact: true });
    // The start menu launches the first stage, while the normal “Next level”
    // result action launches later stages directly. Accept either actual UI
    // state; never click a hidden/stale start control after Next has started it.
    if (await start.count() && await start.isVisible()) {
      await measure(`level-${index + 1}-start`, start); await start.click();
    }
    const mode = LEVELS[index].mode;
    await page.getByText(new RegExp(`${LEVELS[index].name}: 0 of ${LEVELS[index].target} words`)).waitFor({ timeout: 8000 });
    const stageRow = { kind: 'stage-start', level: index + 1, target: LEVELS[index].target, expectedMode: mode, observedMode: await currentMode(), words: [] };
    if (index === 0) {
      const beforeOptional = { progress: await raw(WORDS_KEY), rewards: await raw(REWARD_KEY) };
      await openOptional('Tricky words', 'tricky');
      await openOptional('Write it', 'caption');
      if (await raw(WORDS_KEY) !== beforeOptional.progress || await raw(REWARD_KEY) !== beforeOptional.rewards) throw new Error('Optional practice advanced or rewarded the parent session');
      rows.push({ kind: 'optional-practice-isolation', trickyAndCaption: true, parentStageAndRewardsUnchanged: true });
    }
    if (index === 0) {
      const audio = await soundProbe();
      rows.push({ kind: 'packaged-audio-mute', ...audio });
    }
    const seen = new Set();
    for (let round = 0; round < LEVELS[index].target; round += 1) {
      const indicator = page.getByText(new RegExp(`${LEVELS[index].name}: ${round} of ${LEVELS[index].target} words`));
      await indicator.waitFor({ timeout: 10000 }); await measureReadable('stage progress cue', indicator);
      const answer = await mapFromVisiblePrompt(mode);
      const geometry = await assertStageGeometry(index, mode, answer.graphemes.length);
      const word = answer.graphemes.join('').toUpperCase();
      touchedSpellingWords.add(word);
      if (seen.has(word)) throw new Error(`Repeated word ${word} in level ${index + 1}`);
      seen.add(word);
      const spellingBefore = await json(SPELLING_KEY) || {};
      const priorAttempts = Number.isInteger(spellingBefore[word]?.attempts) ? spellingBefore[word].attempts : 0;
      if (LEVELS[index].length && word.length !== LEVELS[index].length) throw new Error(`Level ${index + 1} expected a ${LEVELS[index].length}-letter word, saw ${word.length} (${word})`);
      if ((LEVELS[index].minLength && word.length < LEVELS[index].minLength) || (LEVELS[index].maxLength && word.length > LEVELS[index].maxLength)) throw new Error(`Level 6 expected a 6–7-letter word, saw ${word.length} (${word})`);
      const perWordFault = index === 0 && round === 0 ? 'write' : index === 0 && round === 1 ? 'readback' : null;
      const wrong = index === 1 && round === 0;
      if (index === 2 && round === 0) {
        await page.getByRole('button', { name: 'Show a clue', exact: true }).click();
        await measureReadable('visible teaching clue', page.getByText(answer.clue, { exact: true }));
      }
      await typeVisibleAnswer(mode, answer, { wrong, perWordFault });
      const spellingAfter = await json(SPELLING_KEY) || {};
      if (spellingAfter[word]?.attempts !== priorAttempts + 1) throw new Error(`Word ${word} did not commit exactly one attempt after UI Retry`);
      const row = { round: round + 1, word, graphemes: answer.graphemes, clue: answer.clue, answerMethod: answer.method, wrongRetry: wrong, teachingClue: index === 2 && round === 0, layout: geometry };
      stageRow.words.push(row);
      if (round < LEVELS[index].target - 1) {
        const nextWord = page.getByRole('button', { name: 'Next word', exact: true });
        await measure('next word', nextWord); await nextWord.click();
      }
    }
    const finish = page.getByRole('button', { name: 'Finish stage', exact: true });
    await measure('finish stage', finish);
    let stageFault = index === 1 ? 'write' : index === 2 ? 'readback' : null;
    if (stageFault) await armFault(WORDS_KEY, stageFault);
    const parentExpectedDelta = config.expectedDelta[index];
    const parentFault = index === config.parentFaultIndex && parentExpectedDelta > 0;
    if (!stageFault && parentFault) await armFault(REWARD_KEY, 'parent');
    await finish.click();
    if (stageFault) {
      const retry = page.getByRole('button', { name: 'Retry saving level', exact: true });
      await retry.waitFor({ timeout: 5000 }); await measure('session save Retry', retry);
      await restoreFault();
      if (parentFault) await armFault(REWARD_KEY, 'parent');
      await retry.click();
      rows.push({ kind: 'session-save-retry', level: index + 1, fault: stageFault, sameHeldFactsAndFinalWord: true });
    }
    if (parentFault) {
      const retry = page.getByRole('button', { name: 'Retry saving level', exact: true });
      await retry.waitFor({ timeout: 5000 }); await measure('parent reward Retry', retry);
      await restoreFault(); await retry.click();
      rows.push({ kind: 'parent-reward-retry', level: index + 1, positiveExpectedDelta: parentExpectedDelta, sameAttemptAndClaimToken: true });
    } else if (stageFault) await restoreFault();
    await page.getByText(new RegExp(`Level ${index + 1} complete: ${LEVELS[index].name}`)).waitFor({ timeout: 12000 });
    const progress = await json(WORDS_KEY);
    if (!progress || !Array.isArray(progress.completedLevels) || !progress.completedLevels.includes(index)) throw new Error(`Level ${index + 1} has no verified durable completion`);
    const transaction = Object.entries(progress.transactions || {}).reverse().find(([, receipt]) => receipt.levelIndex === index && receipt.points === 6);
    if (!transaction) throw new Error(`Level ${index + 1} has no canonical stage transaction at the planned score`);
    const rewardDelta = transaction[1].rewardDelta;
    if (rewardDelta !== config.expectedDelta[index]) throw new Error(`Level ${index + 1} reward delta expected ${config.expectedDelta[index]} but saved ${rewardDelta}`);
    const rewards = await json(REWARD_KEY) || {};
    const token = `words:${transaction[0]}`;
    if (rewardDelta > 0 && rewards.rewardClaims?.[token] !== rewardDelta) throw new Error(`Missing parent reward claim ${token}=${rewardDelta}`);
    if (rewardDelta === 0 && rewards.rewardClaims?.[token] !== undefined) throw new Error(`Unexpected replay reward claim for ${token}`);
    const resultNext = index < LEVELS.length - 1 ? page.getByRole('button', { name: 'Next level', exact: true }) : page.getByRole('button', { name: 'World', exact: true });
    await measure(index < LEVELS.length - 1 ? 'next level' : 'world after final level', resultNext);
    rows.push({ kind: 'stage-complete', level: index + 1, score: 6, rewardDelta, transactionId: transaction[0], token: rewardDelta > 0 ? token : null, noDuplicateClaim: true, uniqueWords: seen.size, target: LEVELS[index].target, words: stageRow.words });
    completedLevelRuns.push({ level: index + 1, rounds: LEVELS[index].target, points: 6, rewardDelta });
    return { stageRow };
  };

  let completedLevelRuns = [], baseline = null, baselineSummary = null, initialWords = null, runConfig = null;
  try {
    await chooseAmariAndOpen();
    baseline = await snapshot();
    baselineSummary = await summarizeSnapshot(baseline);
    initialWords = await parseWords();
    runConfig = await pointPlan();
    const parentFaultIndex = runConfig.plannedDelta.findIndex(delta => delta > 0);
    runConfig.expectedDelta = runConfig.plannedDelta;
    runConfig.parentFaultIndex = parentFaultIndex;
    rows.push({ kind: 'baseline', entryIdentity, wordsProgressStatus: initialWords.progress ? 'canonical' : 'fresh-or-legacy', legacyRewardThrough: runConfig.legacyRewardThrough, oldBest: runConfig.oldBest, plannedPoints: runConfig.plannedPoints, expectedDelta: runConfig.expectedDelta, positiveParentFaultLevel: parentFaultIndex < 0 ? null : parentFaultIndex + 1 });
    await page.locator('.catalogue-game-card').filter({ hasText: 'Spelling Studio' }).click();
    await page.getByRole('heading', { name: 'Spelling Studio', exact: true }).waitFor({ timeout: 10000 });
    await page.getByRole('button', { name: /^Play Spelling Studio level [1-6]$/ }).waitFor({ timeout: 10000 });
    await assertNamespace(); await assertEntry();
    const levelButtons = page.getByRole('button', { name: /^Level [1-6]:/ });
    const expectedUnlocked = Math.max(0, Math.min(5, initialWords.progress?.unlockedLevel ?? initialWords.legacyWords?.unlocked ?? 0));
    const expectedSelectorCount = expectedUnlocked > 0 ? 6 : 0;
    if (await levelButtons.count() !== expectedSelectorCount) throw new Error(`Expected ${expectedSelectorCount} visible level selectors for saved prefix ${expectedUnlocked + 1}, found ${await levelButtons.count()}`);
    if (expectedSelectorCount) {
      for (let index = 0; index <= expectedUnlocked; index += 1) {
        const selector = page.getByRole('button', { name: new RegExp(`^Level ${index + 1}: ${LEVELS[index].name}`) });
        if (!await selector.count()) throw new Error(`Level selector ${index + 1} missing`);
        const enabled = await selector.isEnabled();
        if (!enabled) throw new Error(`Previously unlocked level ${index + 1} is disabled`);
      }
    }
    if (expectedUnlocked < 5 && expectedSelectorCount) {
      const nextLocked = page.getByRole('button', { name: new RegExp(`^Level ${expectedUnlocked + 2}:`) });
      if (!await nextLocked.count() || await nextLocked.isEnabled()) throw new Error('Next incomplete stage is not correctly locked');
    }
    if (!Number.isInteger(START_LEVEL) || START_LEVEL < 0 || START_LEVEL >= LEVELS.length) throw new Error(`Invalid harness start level: ${START_LEVEL}`);
    if (expectedSelectorCount) {
      if (START_LEVEL > expectedUnlocked) throw new Error(`Harness resume level ${START_LEVEL + 1} exceeds saved unlocked level ${expectedUnlocked + 1}`);
      const selectedSelector = page.getByRole('button', { name: new RegExp(`^Level ${START_LEVEL + 1}: ${LEVELS[START_LEVEL].name}`) });
      await measure(`select level ${START_LEVEL + 1} for normal progression`, selectedSelector);
      await selectedSelector.click();
    }
    const initialStart = page.getByRole('button', { name: `Play Spelling Studio level ${START_LEVEL + 1}`, exact: true });
    await initialStart.waitFor({ state: 'visible', timeout: 10000 });
    await measure(`start level ${START_LEVEL + 1}`, initialStart);
    for (let index = START_LEVEL; index < LEVELS.length; index += 1) {
      if (index > START_LEVEL) {
        const next = page.getByRole('button', { name: 'Next level', exact: true });
        await measure(`launch level ${index + 1}`, next);
        await next.click();
      }
      await runStage(index, runConfig);
    }

    const finalProgress = await json(WORDS_KEY);
    if (JSON.stringify(finalProgress.completedLevels) !== JSON.stringify([0, 1, 2, 3, 4, 5])) throw new Error(`Session completed levels are not the six-stage prefix: ${JSON.stringify(finalProgress.completedLevels)}`);
    const after = await snapshot();
    if (after.legacy !== baseline.legacy) throw new Error('Words session changed the legacy game-level bytes');
    if (after.siblingLittle !== baseline.siblingLittle || after.siblingWords !== baseline.siblingWords || after.siblingRewards !== baseline.siblingRewards) throw new Error('Spelling session changed sibling-player progress or rewards');
    if (after.ownLittle !== baseline.ownLittle) throw new Error('Amari Little-game data changed during Spelling session');
    const beforeRewards = baseline.rewards ? JSON.parse(baseline.rewards) : {};
    const afterRewards = after.rewards ? JSON.parse(after.rewards) : {};
    const excludeWordsClaims = value => Object.fromEntries(Object.entries(value || {}).filter(([token]) => !token.startsWith('words:')));
    const excludeWordsPlayed = value => { const copy = { ...(value || {}) }; delete copy.words; return copy; };
    if (JSON.stringify(excludeWordsClaims(beforeRewards.rewardClaims)) !== JSON.stringify(excludeWordsClaims(afterRewards.rewardClaims))) throw new Error('Prior non-words reward claims changed');
    if (JSON.stringify(excludeWordsPlayed(beforeRewards.gamesPlayed)) !== JSON.stringify(excludeWordsPlayed(afterRewards.gamesPlayed))) throw new Error('Prior non-words game counts changed');
    const addedPositive = Object.entries(finalProgress.transactions || {}).filter(([id, entry]) => entry.rewardDelta > 0 && beforeRewards.rewardClaims?.[`words:${id}`] !== entry.rewardDelta);
    const totalExpected = addedPositive.reduce((sum, [, entry]) => sum + entry.rewardDelta, 0);
    if ((afterRewards.points || 0) - (beforeRewards.points || 0) !== totalExpected) throw new Error('Parent point total delta does not match newly claimed durable spelling rewards');
    for (const [id, entry] of addedPositive) if (afterRewards.rewardClaims?.[`words:${id}`] !== entry.rewardDelta) throw new Error(`Missing final parent claim words:${id}`);
    if ((afterRewards.gamesPlayed?.words || 0) - (beforeRewards.gamesPlayed?.words || 0) !== addedPositive.length) throw new Error('A replay or Retry changed the words game count outside the positive reward claim set');
    const spellingBefore = baseline.spelling ? JSON.parse(baseline.spelling) : {};
    const spellingAfter = after.spelling ? JSON.parse(after.spelling) : {};
    const attemptFields = new Set(['attempts', 'independentFirstTry', 'independentDays', 'needsPractice', 'lastMode', 'lastSeen', 'spellingTransactionIds']);
    for (const word of new Set([...Object.keys(spellingBefore), ...Object.keys(spellingAfter)])) {
      if (!touchedSpellingWords.has(word)) {
        if (JSON.stringify(spellingBefore[word]) !== JSON.stringify(spellingAfter[word])) throw new Error(`Spelling changed unrelated saved word row ${word}`);
        continue;
      }
      const oldUnknown = Object.fromEntries(Object.entries(spellingBefore[word] || {}).filter(([field]) => !attemptFields.has(field)));
      const newUnknown = Object.fromEntries(Object.entries(spellingAfter[word] || {}).filter(([field]) => !attemptFields.has(field)));
      if (JSON.stringify(oldUnknown) !== JSON.stringify(newUnknown)) throw new Error(`Spelling changed unknown saved metadata for ${word}`);
    }
    rows.push({ kind: 'protected-and-rewards', legacyGameLevelsBytePreserved: true, siblingDataPreserved: true, otherGameCountsAndClaimsPreserved: true, newlyEarnedPositiveTransactions: addedPositive.length, rewardDeltaTotal: totalExpected });

    const replayBeforeWords = await json(WORDS_KEY), replayBeforeRewards = await json(REWARD_KEY);
    await page.getByRole('button', { name: 'World', exact: true }).click();
    await page.getByRole('heading', { name: 'Read & Write', exact: true }).waitFor({ timeout: 10000 });
    await page.locator('.catalogue-game-card').filter({ hasText: 'Spelling Studio' }).click();
    await page.getByRole('heading', { name: 'Spelling Studio', exact: true }).waitFor({ timeout: 10000 });
    await assertNamespace(); await assertEntry();
    const levelOne = page.getByRole('button', { name: /^Level 1: Copy the word/ });
    await measure('replay-level-one-selector', levelOne); await levelOne.click();
    const replayStart = page.getByRole('button', { name: 'Play Spelling Studio level 1', exact: true });
    await measure('replay-level-one-start', replayStart); await replayStart.click();
    await page.getByText(new RegExp(`${LEVELS[0].name}: 0 of ${LEVELS[0].target} words`)).waitFor({ timeout: 8000 });
    const replayAudio = await soundProbe();
    rows.push({ kind: 'packaged-audio-mute', replay: true, ...replayAudio });
    for (let round = 0; round < LEVELS[0].target; round += 1) {
      const answer = await mapFromVisiblePrompt('copy');
      await assertStageGeometry(0, 'copy', answer.graphemes.length);
      touchedSpellingWords.add(answer.graphemes.join('').toUpperCase());
      const perWordFault = round === 0 ? 'write' : round === 1 ? 'readback' : null;
      await typeVisibleAnswer('copy', answer, { perWordFault });
      if (round < LEVELS[0].target - 1) {
        const nextWord = page.getByRole('button', { name: 'Next word', exact: true });
        await measure('replay next word', nextWord); await nextWord.click();
      }
    }
    await page.getByRole('button', { name: 'Finish stage', exact: true }).click();
    await page.getByText(new RegExp(`Level 1 complete: ${LEVELS[0].name}`)).waitFor({ timeout: 10000 });
    const replayAfterWords = await json(WORDS_KEY), replayAfterRewards = await json(REWARD_KEY);
    const replayReceipt = Object.entries(replayAfterWords.transactions || {}).find(([id, item]) => !Object.hasOwn(replayBeforeWords.transactions || {}, id) && item.levelIndex === 0);
    if (!replayReceipt || replayReceipt[1].rewardDelta !== 0) throw new Error('Level 1 replay did not persist a zero-delta transaction');
    if (replayAfterRewards.points !== replayBeforeRewards.points || (replayAfterRewards.gamesPlayed?.words || 0) !== (replayBeforeRewards.gamesPlayed?.words || 0)) throw new Error('Zero-delta replay changed parent points or words play count');
    if (replayAfterRewards.rewardClaims?.[`words:${replayReceipt[0]}`] !== undefined) throw new Error('Zero-delta replay created a parent reward claim');
    rows.push({ kind: 'zero-delta-stage-replay', level: 1, transactionId: replayReceipt[0], rewardDelta: 0, pointsStable: true, playCountStable: true });

    await page.getByRole('button', { name: 'World', exact: true }).click();
    await page.getByRole('heading', { name: 'Read & Write', exact: true }).waitFor({ timeout: 10000 });
    await page.locator('.catalogue-game-card').filter({ hasText: 'Spelling Studio' }).click();
    await page.getByRole('heading', { name: 'Spelling Studio', exact: true }).waitFor({ timeout: 10000 });
    await assertNamespace(); await assertEntry();
    const replayButton = page.getByRole('button', { name: 'Play Spelling Studio level 6', exact: true });
    await measure('re-entry level 6', replayButton); await replayButton.click();
    await page.getByText(new RegExp(`${LEVELS[5].name}: 0 of ${LEVELS[5].target} words`)).waitFor({ timeout: 8000 });
    const mediaBeforeLeave = (await mediaEvents()).length;
    await page.getByRole('button', { name: 'Hear the word', exact: true }).click();
    await page.waitForFunction(({ before }) => (window.__spellingMediaEventsV1 || []).slice(before).some(event => ['play', 'playing'].includes(event.type) && /\/audio\//.test(event.src)), { before: mediaBeforeLeave }, { timeout: 10000 });
    const leavingClip = (await mediaEvents()).slice(mediaBeforeLeave).find(event => ['play', 'playing'].includes(event.type) && /\/audio\//.test(event.src));
    await page.getByRole('button', { name: 'Back to home', exact: true }).click();
    let leavePath = 'direct';
    try {
      await page.getByRole('heading', { name: 'Leave the game?', exact: true }).waitFor({ state: 'visible', timeout: 1200 });
      leavePath = 'confirmation';
      await page.getByRole('button', { name: /Back to world|Back to home/ }).click();
    } catch { /* the app may take the normal direct leave branch */ }
    await page.getByRole('heading', { name: 'Read & Write', exact: true }).waitFor({ timeout: 10000 });
    await page.waitForFunction(({ before, src }) => (window.__spellingMediaEventsV1 || []).slice(before).some(event => event.src === src && ['pause', 'ended'].includes(event.type)), { before: mediaBeforeLeave, src: leavingClip.src }, { timeout: 5000 });
    const leaveEvent = (await mediaEvents()).slice(mediaBeforeLeave).find(event => event.src === leavingClip.src && ['pause', 'ended'].includes(event.type));
    if (leaveEvent?.type !== 'pause') throw new Error(`Leaving Spelling did not cancel narration with pause: ${JSON.stringify(leaveEvent)}`);
    rows.push({ kind: 'leave-audio-cancel', path: leavePath, exactPackagedSource: leavingClip.src, stoppedBy: leaveEvent.type });

    await page.locator('.catalogue-game-card').filter({ hasText: 'Spelling Studio' }).click();
    await page.getByRole('heading', { name: 'Spelling Studio', exact: true }).waitFor({ timeout: 10000 });
    await assertNamespace(); await assertEntry();
    const reloadedProgress = await json(WORDS_KEY), reloadedRewards = await json(REWARD_KEY);
    if (JSON.stringify(reloadedProgress.completedLevels) !== JSON.stringify(finalProgress.completedLevels)) throw new Error('Spelling session completion changed on ordinary leave/reopen');
    if (JSON.stringify(reloadedRewards.rewardClaims) !== JSON.stringify(afterRewards.rewardClaims) || reloadedRewards.points !== afterRewards.points) throw new Error('Reward replay/re-entry changed the saved claims or points');
    rows.push({ kind: 'reopen-replay-idempotency', levels: reloadedProgress.completedLevels.length, pointsStable: true, claimsStable: true });

    const images = await page.evaluate(async () => {
      await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
      return [...document.images].filter(image => !image.complete || !image.naturalWidth).map(image => image.currentSrc || image.src);
    });
    rows.push({ kind: 'integrity', brokenImages: images, failedResources, failedRequests, pageErrors, consoleErrors, providerRequests });
    if (images.length || failedResources.length || failedRequests.length || pageErrors.length || consoleErrors.length || providerRequests.length) throw new Error('Spelling run had an image/resource/console/page/provider error');
    const screenshot = `${OUT}/native-spelling-${VIEW}-${EXPECTED_ENTRY.split('/').at(-1).replace(/[^a-z0-9.-]/gi, '_')}.jpg`;
    await page.screenshot({ path: screenshot, type: 'jpeg', quality: 68, fullPage: false });
    rows.push({ kind: 'final-render', screenshot });
    return { passed: true, origin: ORIGIN, viewport: { width: WIDTH, height: HEIGHT }, entryIdentity, namespaceVerified: true, startLevel: START_LEVEL + 1, baseline: baselineSummary, stageTargets: LEVELS.map(level => level.target), completedLevelRuns, responses: completedLevelRuns.reduce((sum, level) => sum + level.rounds, 0), zeroDeltaReplayResponses: LEVELS[0].target, rows, failures, pageErrors, consoleErrors, failedResources, failedRequests, providerRequests };
  } catch (error) {
    if (activeFault) { try { await restoreFault(); } catch { /* preserve the original terminal error */ } }
    try {
      const image = `${OUT}/failure-spelling-${VIEW}-${Date.now()}.jpg`;
      await page.screenshot({ path: image, type: 'jpeg', quality: 68, fullPage: false });
      failures.push({ screenshot: image });
    } catch { /* browser may be navigating */ }
    failures.push({ message: String(error?.message || error), stack: error?.stack || null, completedLevelRuns: completedLevelRuns.length, rows: rows.length });
    return { passed: false, origin: ORIGIN, viewport: { width: WIDTH, height: HEIGHT }, entryIdentity, namespaceVerified: true, startLevel: START_LEVEL + 1, baseline: baselineSummary, completedLevelRuns, responses: completedLevelRuns.reduce((sum, level) => sum + level.rounds, 0), rows, failures, pageErrors, consoleErrors, failedResources, failedRequests, providerRequests };
  } finally {
    page.off('pageerror', onPageError); page.off('console', onConsole); page.off('response', onResponse); page.off('requestfailed', onFailed); page.off('request', onRequest);
  }
}
