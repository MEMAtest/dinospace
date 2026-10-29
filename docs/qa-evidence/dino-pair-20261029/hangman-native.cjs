async page => {
  // Normal-UI Hangman QA. This callback never reads React internals or writes
  // answers, seeds, progress, unlocks, or rewards. The optional clue map is a
  // test-side reader for visible clue text; every answer is entered as letters.
  const ORIGIN = __ORIGIN__;
  const PLAYER = __PLAYER__;
  const WIDTH = __WIDTH__;
  const HEIGHT = __HEIGHT__;
  const EXPECTED_ENTRY = __EXPECTED_ENTRY__;
  const ENTRY_TAG = EXPECTED_ENTRY.split('/').at(-1).replace(/^arcade-/, '').replace(/\.js$/, '').replace(/[^A-Za-z0-9_-]/g, '_');
  const EVIDENCE_PREFIX = ORIGIN.includes('localhost') ? 'hangman-fresh' : ORIGIN.includes('127.0.0.1') ? 'hangman-native' : 'hangman-production';
  const STAGE = __STAGE__;
  const VISIBLE_CLUE_MAP = __VISIBLE_CLUE_MAP__;
  const EXPECTED_TARGETS = [3, 3, 6, 4];
  const LEVEL_NAMES = ['First words', 'Four-letter rescue', 'Five-letter rescue', 'Long-word rescue'];
  const OTHER_PLAYER = PLAYER === 'askia' ? 'amari' : 'askia';
  const canonicalKey = `amari_hangman_progress_v1:${PLAYER}`;
  const siblingHangmanKey = `amari_hangman_progress_v1:${OTHER_PLAYER}`;
  const legacyKey = `${PLAYER}_game_levels_v1`;
  const rewardKey = `${PLAYER}_rewards_v2`;
  const otherLittleKey = `${OTHER_PLAYER}_little_progress`;
  const ownLittleKey = `${PLAYER}_little_progress`;
  const siblingRewardKey = `${OTHER_PLAYER}_rewards_v2`;
  const rows = [];
  const failures = [];
  const pageErrors = [];
  const consoleErrors = [];
  const resourceFailures = [];
  const requestFailures = [];
  const apiRequests = [];
  let brokenImages = [];
  let entryIdentity = null;
  let initialSnapshot = {};
  let activeFault = false;
  let initialDiagnostics = [];
  let initialDiagnosticIds = new Set();
  let previousBest = [];
  let plannedScores = [];
  let plannedDeltas = [];
  let localFaultIndex = null;
  let parentFaultIndex = null;

  const onPageError = error => pageErrors.push(error.message);
  const onRequest = request => { if (/\/api\//i.test(request.url())) apiRequests.push(request.url()); };
  const onConsole = message => { if (message.type() === 'error') consoleErrors.push(message.text()); };
  const onRequestFailed = request => { if (!/\/api\//i.test(request.url())) requestFailures.push({ url: request.url(), error: request.failure()?.errorText || 'unknown' }); };
  const onResponse = response => { if (response.status() >= 400 && !/\/api\//i.test(response.url())) resourceFailures.push({ url: response.url(), status: response.status() }); };
  page.on('pageerror', onPageError);
  page.on('request', onRequest);
  page.on('console', onConsole);
  page.on('requestfailed', onRequestFailed);
  page.on('response', onResponse);

  const localRead = async key => page.evaluate(storageKey => {
    try { return window.localStorage.getItem(storageKey); } catch { return null; }
  }, key);
  const localJson = async key => {
    const raw = await localRead(key);
    try { return raw === null ? null : JSON.parse(raw); } catch { return { invalidRaw: raw }; }
  };
  const visibleText = async locator => (await locator.innerText()).replace(/\s+/g, ' ').trim();
  const measure = async (label, locator) => {
    const result = await locator.evaluate(element => {
      const rect = element.getBoundingClientRect();
      const x = Math.max(0, Math.min(innerWidth - 1, rect.left + rect.width / 2));
      const y = Math.max(0, Math.min(innerHeight - 1, rect.top + rect.height / 2));
      const top = document.elementFromPoint(x, y);
      const visible = rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight
        && rect.right > 0 && rect.left < innerWidth && Boolean(top && (top === element || element.contains(top)));
      const centerHit = Boolean(top && (top === element || element.contains(top)));
      const fullyInViewport = rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom <= innerHeight
        && rect.left >= 0 && rect.right <= innerWidth;
      return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height), bottom: Math.round(rect.bottom), visible, fullyInViewport, centerHit, minHeight: Math.round(rect.height) };
    });
    rows.push({ kind: 'control-geometry', label, ...result });
    return result;
  };
  const assertPrimary = async (label, locator) => {
    const result = await measure(label, locator);
    if (result.width < 48 || result.height < 48) throw new Error(`${label} is smaller than 48px (${result.width}×${result.height})`);
    if (!result.fullyInViewport || !result.centerHit) throw new Error(`${label} is not fully inside the viewport or its center is obscured: ${JSON.stringify(result)}`);
    return result;
  };
  const installMediaObserver = async () => page.evaluate(() => {
    if (window.__hangmanQaMediaObserver) return;
    window.__hangmanQaMediaObserver = true;
    window.__hangmanQaMedia = [];
    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...args) {
      if (!window.__hangmanQaMedia.includes(this)) window.__hangmanQaMedia.push(this);
      for (const eventName of ['play', 'playing', 'pause', 'ended', 'error']) {
        this.addEventListener(eventName, () => window.__hangmanQaMediaEvents.push({ eventName, src: this.currentSrc || this.src || '' }), { once: true });
      }
      return originalPlay.apply(this, args);
    };
    window.__hangmanQaMediaEvents = [];
  });
  const latestMediaState = async () => page.evaluate(() => {
    const media = window.__hangmanQaMedia || [];
    const last = media.at(-1);
    return { count: media.length, paused: last?.paused ?? null, ended: last?.ended ?? null, currentTime: last?.currentTime ?? null, events: window.__hangmanQaMediaEvents || [] };
  });
  const faultSetItem = async key => {
    await page.evaluate(target => {
      if (Storage.prototype.__hangmanQaOriginalSetItem) throw new Error('A Hangman QA storage fault is already armed');
      const original = Storage.prototype.setItem;
      Storage.prototype.__hangmanQaOriginalSetItem = original;
      window.__hangmanQaFaultHit = 0;
      Storage.prototype.setItem = function (name, value) {
        if (name === target) { window.__hangmanQaFaultHit += 1; throw new DOMException('Injected one-key Hangman QA write failure', 'QuotaExceededError'); }
        return original.call(this, name, value);
      };
    }, key);
    activeFault = true;
  };
  const restoreSetItem = async () => {
    await page.evaluate(() => {
      const original = Storage.prototype.__hangmanQaOriginalSetItem;
      const originalGet = Storage.prototype.__hangmanQaOriginalGetItem;
      if (original) Storage.prototype.setItem = original;
      if (originalGet) Storage.prototype.getItem = originalGet;
      delete Storage.prototype.__hangmanQaOriginalSetItem;
      delete Storage.prototype.__hangmanQaOriginalGetItem;
    });
    activeFault = false;
  };
  const faultReadbackOnce = async key => {
    await page.evaluate(target => {
      if (Storage.prototype.__hangmanQaOriginalSetItem || Storage.prototype.__hangmanQaOriginalGetItem) throw new Error('A Hangman QA storage fault is already armed');
      const originalGet = Storage.prototype.getItem;
      const originalSet = Storage.prototype.setItem;
      Storage.prototype.__hangmanQaOriginalGetItem = originalGet;
      Storage.prototype.__hangmanQaOriginalSetItem = originalSet;
      window.__hangmanQaAfterTargetWrite = false;
      window.__hangmanQaFaultHit = 0;
      Storage.prototype.setItem = function (name, value) {
        const result = originalSet.call(this, name, value);
        if (name === target) window.__hangmanQaAfterTargetWrite = true;
        return result;
      };
      Storage.prototype.getItem = function (name) {
        if (name === target && window.__hangmanQaAfterTargetWrite && window.__hangmanQaFaultHit === 0) {
          window.__hangmanQaFaultHit += 1;
          return null;
        }
        return originalGet.call(this, name);
      };
    }, key);
    activeFault = true;
  };
  const readFaultCount = async () => page.evaluate(() => window.__hangmanQaFaultHit || 0);
  const snapshotProtected = async () => page.evaluate(({ legacy, ownLittle, siblingLittle, siblingReward, siblingHangman }) => {
    const keys = Object.keys(localStorage).filter(key => /chess|game_levels_v1/i.test(key));
    for (const key of [legacy, ownLittle, siblingLittle, siblingReward, siblingHangman]) if (!keys.includes(key)) keys.push(key);
    return Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)]));
  }, { legacy: legacyKey, ownLittle: ownLittleKey, siblingLittle: otherLittleKey, siblingReward: siblingRewardKey, siblingHangman: siblingHangmanKey });
  const compareProtected = async () => {
    const now = await snapshotProtected();
    const changed = Object.keys(initialSnapshot).filter(key => initialSnapshot[key] !== now[key]);
    rows.push({ kind: 'protected-storage', legacyUnchanged: initialSnapshot[legacyKey] === now[legacyKey], siblingAndChessKeysUnchanged: changed.length === 0, changedKeys: changed });
    if (changed.length) throw new Error(`Hangman changed protected legacy/sibling/Chess storage: ${changed.join(', ')}`);
  };
  const readClueCard = async () => {
    const game = page.locator('[data-hangman-phase="play"]');
    const clueNode = game.locator('main section p[class*="bg-cyan-100/10"]');
    const clue = await visibleText(clueNode);
    const board = game.locator('[aria-label^="Word has "]');
    const boardLabel = await board.getAttribute('aria-label');
    const length = Number(boardLabel?.match(/\d+/)?.[0]);
    if (!clue || !Number.isInteger(length) || length < 3 || length > 7) throw new Error('Could not read the visible clue and word length from the game UI');
    const meta = await game.locator('main section p[class*="tracking-[0.2em]"]').first().innerText().catch(() => '');
    const category = meta.split('·').slice(1).join('·').trim();
    const emoji = await game.locator('main section div.grid[class*="h-11"][class*="w-11"]').first().innerText().catch(() => '');
    const captionGeometry = await clueNode.evaluate(element => {
      const box = element.getBoundingClientRect();
      return { x: Math.round(box.x), y: Math.round(box.y), width: Math.round(box.width), height: Math.round(box.height), bottom: Math.round(box.bottom), visible: box.bottom > 0 && box.top < innerHeight };
    });
    rows.push({ kind: 'visible-clue-caption', clue, length, category, emoji, geometry: captionGeometry });
    return { clue, length, category, emoji, board, game };
  };
  const solveVisibleClue = async () => {
    const { clue, length, category, emoji, board, game } = await readClueCard();
    const key = `${clue}||${category}||${emoji}||${length}`;
    let resolved = VISIBLE_CLUE_MAP[key] ?? VISIBLE_CLUE_MAP[clue];
    if (Array.isArray(resolved)) resolved = resolved.find(word => typeof word === 'string' && word.length === length);
    const answer = String(resolved || '').toUpperCase();
    if (!new RegExp(`^[A-Z]{${length}}$`).test(answer)) throw new Error(`No test-side answer for visible ${length}-letter clue: ${JSON.stringify(clue)}`);
    return { clue, length, category, emoji, answer, board, game };
  };
  const readTiles = async board => board.locator('div').allTextContents();
  const answerIsVisible = async (board, answer) => {
    const tiles = (await readTiles(board)).map(value => value.trim());
    return tiles.join('') === answer;
  };
  const letterButton = (game, letter) => game.getByRole('group', { name: 'Helpful letter choices' }).getByRole('button', { name: new RegExp(`^${letter}(?:,|$)`) });
  const clickLetter = async (game, letter) => {
    const button = letterButton(game, letter);
    if (!await button.count() || !await button.isEnabled()) throw new Error(`Visible letter control ${letter} is unavailable`);
    await button.click();
  };
  const enterAnswerThroughControls = async ({ game, answer, hint = false }) => {
    if (hint) {
      const hintButton = game.getByRole('button', { name: 'Reveal one letter' });
      await assertPrimary('one-letter hint', hintButton);
      await hintButton.click();
      await game.locator('[role="status"][aria-label*="counts as helped"]').waitFor({ state: 'visible', timeout: 3000 });
    }
    const unique = [...new Set(answer)];
    const enabled = [];
    for (const letter of unique) if (await letterButton(game, letter).isEnabled()) enabled.push(letter);
    if (enabled.length) await page.keyboard.press(enabled.shift());
    for (const letter of enabled) if (await letterButton(game, letter).isEnabled()) await clickLetter(game, letter);
    await game.getByText('Word rescued!', { exact: true }).waitFor({ state: 'visible', timeout: 5000 });
  };
  const resolveWrongAndRetry = async () => {
    const item = await solveVisibleClue();
    const shownLetters = await item.game.getByRole('group', { name: 'Helpful letter choices' }).getByRole('button').allTextContents();
    const wrong = shownLetters.map(letter => letter.trim()).filter(letter => /^[A-Z]$/.test(letter) && !item.answer.includes(letter)).slice(0, 6);
    if (wrong.length !== 6) throw new Error('Could not assemble six visible wrong-letter choices');
    for (const letter of wrong) await clickLetter(item.game, letter);
    await item.game.getByText(`The word was ${item.answer}`, { exact: true }).waitFor({ state: 'visible', timeout: 5000 });
    if (!await answerIsVisible(item.board, item.answer)) throw new Error('The lost-word answer was not held on the board');
    const retry = item.game.getByRole('button', { name: 'Try this word again', exact: true });
    await assertPrimary('same-word Retry', retry);
    const beforeRetry = await measure('held-loss-board', item.board);
    await retry.click();
    const after = await readClueCard();
    if (after.clue !== item.clue || after.length !== item.length) throw new Error('Retry did not preserve the same visible word/clue');
    if ((await readTiles(after.board)).some(value => value.trim() !== '•')) throw new Error('Retry did not reset the same word to hidden letters');
    rows.push({ kind: 'wrong-answer-retry', clueLength: item.length, heldAnswerVisibleBeforeRetry: true, sameClueAfterRetry: true, heldBoardGeometry: beforeRetry });
    await enterAnswerThroughControls({ game: after.game, answer: item.answer });
    return item.answer;
  };
  const hearAndCancelAudio = async () => {
    const game = page.locator('[data-hangman-phase="play"]');
    const hear = game.getByRole('button', { name: 'Hear the word', exact: true });
    if (!await hear.count()) return false;
    await assertPrimary('Hear the word', hear);
    await hear.click();
    await page.waitForTimeout(120);
    const playing = await latestMediaState();
    const soundOff = page.getByRole('button', { name: 'Turn sound off', exact: true });
    if (await soundOff.count()) {
      await soundOff.click();
      const afterMute = await latestMediaState();
      if (playing.count > 0 && afterMute.paused !== true) throw new Error('Mute did not pause the exact packaged Hangman recording');
      rows.push({ kind: 'audio-mute-cancel', exactClipObserved: playing.count > 0, pausedAfterMute: afterMute.paused });
      await page.getByRole('button', { name: 'Turn sound on', exact: true }).click();
      const hearAgain = game.getByRole('button', { name: 'Hear the word', exact: true });
      if (await hearAgain.count()) {
        await hearAgain.click();
        await page.waitForTimeout(80);
        const skip = game.getByRole('button', { name: 'Skip word', exact: true });
        if (await skip.count()) {
          await skip.click();
          const afterSkip = await latestMediaState();
          rows.push({ kind: 'audio-next-cancel', pausedAfterNext: afterSkip.paused });
          if (afterSkip.paused !== true) throw new Error('Next word did not cancel the current packaged recording');
        }
      }
    }
    return true;
  };
  const openHangmanFromWorld = async () => {
    const title = page.getByRole('heading', { name: 'Dino Hangman', exact: true });
    if (await page.locator('[data-hangman-phase="play"], [data-hangman-phase="finish"]').count()) {
      const levelMap = page.getByRole('button', { name: 'Level map', exact: true });
      if (await levelMap.count()) await levelMap.click();
      await title.waitFor({ state: 'visible', timeout: 5000 });
      return;
    }
    if (await page.locator('[data-hangman-phase="intro"], [data-hangman-phase="finish"]').count()) return;
    const backToLearningWorld = page.getByRole('button', { name: 'Back to learning world', exact: true });
    if (await backToLearningWorld.count()) {
      await backToLearningWorld.click();
      const leaveDialog = page.getByRole('dialog', { name: 'Leave the game?' });
      if (await leaveDialog.count()) await leaveDialog.getByRole('button', { name: 'Back to world', exact: true }).click();
    }
    const readWriteHeading = page.getByRole('heading', { name: 'Read & Write', exact: true });
    if (!await readWriteHeading.count()) {
      const backToHome = page.getByRole('button', { name: 'Back to home', exact: true });
      if (await backToHome.count()) await backToHome.click();
      const worldCard = page.getByRole('button', { name: /Read & Write/ });
      if (await worldCard.count()) await worldCard.first().click();
    }
    await readWriteHeading.waitFor({ state: 'visible', timeout: 10000 });
    await page.getByRole('button', { name: /Dino Hangman/ }).first().click();
    await title.waitFor({ state: 'visible', timeout: 10000 });
  };
  const startLevel = async index => {
    const menuButton = page.getByRole('button', { name: new RegExp(`^${index + 1}\\. ${LEVEL_NAMES[index]}`) });
    if (!await menuButton.count()) throw new Error(`Level ${index + 1} menu entry is missing`);
    if (!await menuButton.isEnabled()) throw new Error(`Level ${index + 1} did not unlock in order`);
    await menuButton.scrollIntoViewIfNeeded();
    const start = page.getByRole('button', { name: new RegExp(`^Start ${LEVEL_NAMES[index]} →$`) });
    if (!await start.count() || !await start.isVisible().catch(() => false)) { await menuButton.click(); }
    await assertPrimary(`level-${index + 1}-start`, start);
    const geometry = await page.evaluate((buttonName) => {
      const button = [...document.querySelectorAll('button')].find(node => node.textContent?.trim().startsWith(buttonName));
      if (!button) return null;
      const rect = button.getBoundingClientRect();
      return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height), bottom: Math.round(rect.bottom), viewportHeight: innerHeight };
    }, `${index + 1}. ${LEVEL_NAMES[index]}`);
    rows.push({ kind: 'level-menu', level: index + 1, name: LEVEL_NAMES[index], target: EXPECTED_TARGETS[index], geometry });
    await start.click();
    await page.locator(`[data-hangman-phase="play"][data-hangman-level="${['first-words', 'four-letter-rescue', 'five-letter-rescue', 'long-word-rescue'][index]}"]`).waitFor({ timeout: 5000 });
    const rescued = page.getByText(new RegExp(`^0/${EXPECTED_TARGETS[index]} ⭐$`));
    await rescued.waitFor({ timeout: 3000 });
    const activeGame = page.locator('[data-hangman-phase="play"]');
    if (index === 3) {
      const geometry = await activeGame.evaluate(root => {
        const group = root.querySelector('[aria-label="Helpful letter choices"]');
        const buttons = [...(group?.querySelectorAll('button') || [])];
        const boxes = buttons.map(button => {
          const rect = button.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          const hit = document.elementFromPoint(x, y);
          return { letter: button.textContent.trim(), x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height), bottom: Math.round(rect.bottom), fullyInViewport: rect.top >= 0 && rect.bottom <= innerHeight, centerHit: Boolean(hit && (hit === button || button.contains(hit))) };
        });
        const rect = group?.getBoundingClientRect();
        const clue = root.querySelector('p.min-h-11')?.getBoundingClientRect();
        const word = root.querySelector('[aria-label^="Word has "]')?.getBoundingClientRect();
        return {
          count: buttons.length,
          uniqueKeys: new Set(buttons.map(button => button.textContent.trim())).size,
          minWidth: boxes.length ? Math.min(...boxes.map(box => box.width)) : 0,
          minHeight: boxes.length ? Math.min(...boxes.map(box => box.height)) : 0,
          allKeysFullyInViewport: boxes.length === 26 && boxes.every(box => box.fullyInViewport),
          allKeyCentersHitTestToButtons: boxes.length === 26 && boxes.every(box => box.centerHit),
          dailyMissionHudCount: document.querySelectorAll('[title="Match 3 letters"]').length,
          clue: clue ? { top: Math.round(clue.top), bottom: Math.round(clue.bottom), visible: clue.top >= 0 && clue.bottom <= innerHeight } : null,
          word: word ? { top: Math.round(word.top), bottom: Math.round(word.bottom), visible: word.top >= 0 && word.bottom <= innerHeight } : null,
          grid: rect ? { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height), bottom: Math.round(rect.bottom) } : null,
          rowCount: new Set(boxes.map(box => box.y)).size,
          maxKeyBottom: boxes.length ? Math.max(...boxes.map(box => box.bottom)) : 0,
          viewport: { width: innerWidth, height: innerHeight, documentWidth: document.documentElement.scrollWidth, scrollY },
        };
      });
      rows.push({ kind: 'full-keyboard-geometry', level: index + 1, ...geometry });
      await page.screenshot({ path: `/Users/omosanya_main/Documents/Codex/2026-09-26/x20-time-detectives-now-uses-clearer/work/dinospace-b7-memory-cumulative-20261006/docs/qa-evidence/dino-pair-20261029/${EVIDENCE_PREFIX}-active-${WIDTH}-${ENTRY_TAG}.jpg`, type: 'jpeg', quality: 72 });
      if (geometry.count !== 26 || geometry.uniqueKeys !== 26 || geometry.minWidth < 44 || geometry.minHeight < 44 || !geometry.allKeysFullyInViewport || !geometry.allKeyCentersHitTestToButtons || geometry.dailyMissionHudCount !== 0 || geometry.viewport.documentWidth > geometry.viewport.width || geometry.viewport.scrollY !== 0 || !geometry.clue?.visible || !geometry.word?.visible) throw new Error(`Full letter keyboard does not meet 26-key 44px unobstructed viewport criteria: ${JSON.stringify(geometry)}`);
      const reachability = { kind: 'keyboard-click-reachability', level: index + 1, expected: 26, tested: [] };
      rows.push(reachability);
      for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
        await clickLetter(activeGame, letter);
        reachability.tested.push(letter);
        const advance = activeGame.getByRole('button', { name: /^(Skip word|Next word)$/ }).first();
        await advance.click();
        await page.waitForTimeout(40);
      }
      reachability.passed = reachability.tested.length === 26 && new Set(reachability.tested).size === 26;
      if (!reachability.passed) throw new Error(`Only ${reachability.tested.length} unique letter keys passed real click checks.`);
    }
    return activeGame;
  };
  const goToMapWhenNeeded = async () => {
    if (await page.locator('[data-hangman-phase="finish"]').count()) await page.getByRole('button', { name: 'Level map', exact: true }).click();
    await page.getByRole('heading', { name: 'Dino Hangman', exact: true }).waitFor({ timeout: 5000 });
  };
  const finishCurrentLevel = async (index, { failHangmanWrite = false, failParentReward = false, rewardRecovery = 'reopen', expectedRewardDelta = null } = {}) => {
    let reopenedAfterRewardFailure = false;
    const button = page.getByRole('button', { name: 'Finish level', exact: true });
    await button.waitFor({ state: 'visible', timeout: 5000 });
    await assertPrimary(`level-${index + 1}-held-finish`, button);
    const game = page.locator('[data-hangman-phase="play"]');
    const held = await solveVisibleClue();
    if (!await answerIsVisible(held.board, held.answer)) throw new Error('Final solved answer was not held before Finish level');
    const beforeSaved = await localRead(canonicalKey);
    if (failHangmanWrite) await faultSetItem(canonicalKey);
    else if (failParentReward) await faultSetItem(rewardKey);
    try {
      await button.click();
      if (failHangmanWrite || failParentReward) {
        await game.getByRole('alert').waitFor({ state: 'visible', timeout: 5000 });
        const hits = await readFaultCount();
        if (hits < 1) throw new Error('The expected one-key write failure was not exercised');
        if (failHangmanWrite) {
          const after = await localRead(canonicalKey);
          if (after !== beforeSaved) throw new Error('Failed local commit changed the Hangman record');
          if (await page.locator('[data-hangman-phase="finish"]').count()) throw new Error('Hangman showed a saved completion after its write failed');
        }
        if (failParentReward) {
          const saved = await localJson(canonicalKey);
          if (!saved?.completedLevels?.includes(index)) throw new Error('Local Hangman result was not saved before parent reward Retry');
        }
        rows.push({ kind: failHangmanWrite ? 'progress-write-failure-held' : 'parent-reward-failure-held', level: index + 1, resultHeld: true, writeFaults: hits });
      }
    } finally {
      if (activeFault) await restoreSetItem();
    }
    if (failHangmanWrite) {
      let retry = page.getByRole('button', { name: 'Retry save level', exact: true });
      await assertPrimary('progress-save-Retry', retry);
      await faultReadbackOnce(canonicalKey);
      try {
        await retry.click();
        await page.waitForFunction(() => window.__hangmanQaFaultHit === 1, null, { timeout: 5000 });
        await page.getByRole('alert').waitFor({ state: 'visible', timeout: 5000 });
        const hits = await readFaultCount();
        if (hits !== 1) throw new Error('The canonical readback fault was not exercised exactly once');
        const partial = await localJson(canonicalKey);
        if (!Object.values(partial?.transactions || {}).some(transaction => transaction.levelIndex === index && transaction.rewardDelta > 0)) throw new Error('The readback-failed write did not retain its original transaction for Retry');
        rows.push({ kind: 'progress-readback-failure-held', level: index + 1, transactionRetainedForRetry: true });
      } finally {
        if (activeFault) await restoreSetItem();
      }
      retry = page.getByRole('button', { name: 'Retry save level', exact: true });
      await assertPrimary('progress-readback-Retry', retry);
      if (failParentReward) {
        await faultSetItem(rewardKey);
        try {
          await retry.click();
          await page.getByRole('alert').waitFor({ state: 'visible', timeout: 5000 });
          if (await readFaultCount() < 1) throw new Error('Parent reward write failure was not exercised after local recovery');
          const saved = await localJson(canonicalKey);
          if (!saved?.completedLevels?.includes(index)) throw new Error('Hangman result was not saved before parent reward Retry');
          rows.push({ kind: 'parent-reward-failure-held', level: index + 1, resultHeld: true, localTransactionAlreadySaved: true });
        } finally {
          if (activeFault) await restoreSetItem();
        }
      } else {
        await retry.click();
      }
    }
    if (failParentReward) {
      const retry = page.getByRole('button', { name: 'Retry save level', exact: true });
      const retryGeometry = await assertPrimary('parent-reward-Retry', retry);
      const levelMapGeometry = await measure('parent-reward-Level-map-row-peer', game.getByRole('button', { name: 'Level map', exact: true }));
      const sameRow = retryGeometry.y < levelMapGeometry.bottom && retryGeometry.bottom > levelMapGeometry.y;
      rows.push({ kind: 'parent-reward-retry-primary-row', level: index + 1, retry: retryGeometry, levelMap: levelMapGeometry, sameRow });
      if (!sameRow) throw new Error('Parent reward Retry is not in the visible primary utility row with Level map');
      if (rewardRecovery === 'click-retry') {
        const beforeRetry = await localJson(rewardKey);
        await retry.click();
        const saved = await localJson(canonicalKey);
        const transaction = Object.entries(saved?.transactions || {}).reverse().find(([, value]) => value.levelIndex === index && value.rewardDelta > 0);
        if (!transaction) throw new Error('Parent retry did not retain the positive local transaction');
        if (expectedRewardDelta !== null && transaction[1].rewardDelta !== expectedRewardDelta) throw new Error(`Parent Retry transaction was ${transaction[1].rewardDelta}; expected ${expectedRewardDelta}`);
        const token = `hangman:${transaction[0]}`;
        await page.waitForFunction(({ key, claim }) => {
          try { const rewards = JSON.parse(localStorage.getItem(key) || 'null'); return Boolean(rewards?.rewardClaims?.[claim]); } catch { return false; }
        }, { key: rewardKey, claim: token }, { timeout: 10000 });
        const afterRetry = await localJson(rewardKey);
        const pointDelta = Number(afterRetry.points || 0) - Number(beforeRetry.points || 0);
        const claimAmount = afterRetry.rewardClaims?.[token];
        if (claimAmount !== transaction[1].rewardDelta) throw new Error(`Parent Retry claim ${token} was ${claimAmount}; expected ${transaction[1].rewardDelta}`);
        if (expectedRewardDelta !== null && pointDelta !== expectedRewardDelta) throw new Error(`Parent Retry awarded ${pointDelta} points; expected ${expectedRewardDelta}`);
        rows.push({ kind: 'parent-reward-retry-recovery', level: index + 1, retryCount: 1, stableToken: token, transactionDelta: transaction[1].rewardDelta, claimAmount, parentPointDelta: pointDelta, savedCompletionBeforeReward: saved.completedLevels?.includes(index) === true });
        return;
      }
      // Leave and re-enter using the visible parent-world route; mount recovery
      // retries the same persisted transaction and reward token.
      await game.getByRole('button', { name: 'Back to home', exact: true }).click();
      await page.getByRole('button', { name: /Dino Hangman/ }).first().click();
      await page.getByRole('heading', { name: 'Dino Hangman', exact: true }).waitFor({ timeout: 10000 });
      reopenedAfterRewardFailure = true;
      const saved = await localJson(canonicalKey);
      const transaction = Object.entries(saved?.transactions || {}).reverse().find(([, value]) => value.levelIndex === index && value.rewardDelta > 0);
      if (!transaction) throw new Error('A positive saved transaction was not available for reward recovery');
      const token = `hangman:${transaction[0]}`;
      await page.waitForFunction(({ key, claim }) => {
        try { const rewards = JSON.parse(localStorage.getItem(key) || 'null'); return Boolean(rewards?.rewardClaims?.[claim]); } catch { return false; }
      }, { key: rewardKey, claim: token }, { timeout: 10000 });
      const afterRecovery = await localJson(rewardKey);
      if (afterRecovery.rewardClaims?.[token] !== transaction[1].rewardDelta) throw new Error(`Recovered parent reward claim ${token} does not equal its local transaction delta`);
      const recoveredSnapshot = { points: afterRecovery.points, plays: afterRecovery.gamesPlayed?.hangman || 0, claim: afterRecovery.rewardClaims?.[token] };
      // Re-enter once more; receipt recovery must be idempotent and add zero.
      await page.getByRole('button', { name: 'Back to home', exact: true }).click();
      await page.getByRole('heading', { name: 'Read & Write', exact: true }).waitFor({ timeout: 10000 });
      await page.getByRole('button', { name: /Dino Hangman/ }).first().click();
      await page.getByRole('heading', { name: 'Dino Hangman', exact: true }).waitFor({ timeout: 10000 });
      await page.waitForTimeout(200);
      const afterReplay = await localJson(rewardKey);
      if (afterReplay.points !== recoveredSnapshot.points || (afterReplay.gamesPlayed?.hangman || 0) !== recoveredSnapshot.plays || afterReplay.rewardClaims?.[token] !== recoveredSnapshot.claim) throw new Error('Repeated stable-token receipt increased parent rewards twice');
      rows.push({ kind: 'parent-reward-recovery', level: index + 1, stableToken: token, claim: recoveredSnapshot.claim, pointsAfterRecovery: recoveredSnapshot.points, gamesPlayedAfterRecovery: recoveredSnapshot.plays, replayAddedZero: true });
    }
    if (reopenedAfterRewardFailure) return;
    await page.getByRole('heading', { name: new RegExp(`^${LEVEL_NAMES[index]} complete$`) }).waitFor({ state: 'visible', timeout: 10000 });
    const resultGeometry = await page.evaluate(() => {
      const target = document.querySelector('[data-hangman-phase="finish"]');
      if (!target) return null;
      const box = target.getBoundingClientRect();
      return { x: Math.round(box.x), y: Math.round(box.y), width: Math.round(box.width), height: Math.round(box.height), bottom: Math.round(box.bottom), fullyInViewport: box.top >= 0 && box.bottom <= innerHeight, documentHeight: document.documentElement.scrollHeight, viewportHeight: innerHeight };
    });
    rows.push({ kind: 'held-level-result', level: index + 1, target: EXPECTED_TARGETS[index], geometry: resultGeometry });
    const mapButton = page.getByRole('button', { name: 'Level map', exact: true });
    const nextButton = page.getByRole('button', { name: /^(Next level →|Next game →)$/ }).first();
    const mapGeometry = await assertPrimary(`level-${index + 1}-saved-result-Level-map`, mapButton);
    const nextGeometry = await assertPrimary(`level-${index + 1}-saved-result-Next`, nextButton);
    rows.push({ kind: 'saved-result-navigation-geometry', level: index + 1, result: resultGeometry, levelMap: mapGeometry, next: nextGeometry });
    if (index === 3 && EVIDENCE_PREFIX !== 'hangman-production') await page.screenshot({ path: `/Users/omosanya_main/Documents/Codex/2026-09-26/x20-time-detectives-now-uses-clearer/work/dinospace-b7-memory-cumulative-20261006/docs/qa-evidence/dino-pair-20261029/${EVIDENCE_PREFIX}-finish-${WIDTH}-${ENTRY_TAG}.jpg`, type: 'jpeg', quality: 72, fullPage: false });
  };
  const playLevel = async (index, options = {}) => {
    let game = await startLevel(index);
    const rescues = [];
    const levelRescuedWords = new Set();
    for (let roundIndex = 0; roundIndex < EXPECTED_TARGETS[index]; roundIndex += 1) {
      if (index === 0 && roundIndex === 0 && options.audioProbe) {
        let available = await game.getByRole('button', { name: 'Hear the word', exact: true }).count();
        let checked = 0;
        while (!available && checked < 24) {
          const skip = game.getByRole('button', { name: 'Skip word', exact: true });
          if (!await skip.count()) break;
          await skip.click(); checked += 1;
          available = await game.getByRole('button', { name: 'Hear the word', exact: true }).count();
        }
        if (available) {
          const audioTested = await hearAndCancelAudio();
          rows.push({ kind: 'audio-packaged-availability', exactVisibleClipAvailable: audioTested, scannedSkippedWords: checked });
          const currentHear = game.getByRole('button', { name: 'Hear the word', exact: true });
          if (await currentHear.count()) {
            await currentHear.click();
            await game.getByRole('button', { name: 'Back to home', exact: true }).click();
            const leaveDialog = page.getByRole('dialog', { name: 'Leave the game?' });
            if (await leaveDialog.count()) await leaveDialog.getByRole('button', { name: 'Back to world', exact: true }).click();
            await page.getByRole('heading', { name: 'Read & Write', exact: true }).waitFor({ timeout: 10000 });
            const pausedAfterLeave = await page.evaluate(() => window.__hangmanQaMedia?.at(-1)?.paused ?? null);
            if (pausedAfterLeave !== true) throw new Error('Leaving Hangman did not cancel the current packaged recording');
            rows.push({ kind: 'audio-leave-cancel', pausedAfterLeave });
            await openHangmanFromWorld();
            game = await startLevel(index);
          }
      } else rows.push({ kind: 'audio-packaged-availability', exactVisibleClipAvailable: false, captionVisible: await game.getByText(/Use the clue and choose letters/).count() > 0, scannedSkippedWords: checked });
      }
      let rescuedWord;
      if (index === 0 && roundIndex === 0 && options.lossRetry) {
        rescuedWord = await resolveWrongAndRetry();
      } else {
        const item = await solveVisibleClue();
        if (index === 0 && roundIndex === 1 && options.useHint) await enterAnswerThroughControls({ game: item.game, answer: item.answer, hint: true });
        else await enterAnswerThroughControls({ game: item.game, answer: item.answer });
        rescuedWord = item.answer;
      }
      levelRescuedWords.add(rescuedWord);
      if (levelRescuedWords.size !== roundIndex + 1) throw new Error(`Level ${index + 1} did not rescue a distinct visible word for round ${roundIndex + 1}`);
      const status = await visibleText(game.getByText(/^\d+\/\d+ ⭐$/));
      const rescued = Number(status.match(/^(\d+)/)?.[1]);
      rescues.push(rescued);
      if (rescued !== roundIndex + 1) throw new Error(`Level ${index + 1} rescue counter expected ${roundIndex + 1}, got ${status}`);
      if (roundIndex < EXPECTED_TARGETS[index] - 1) {
        const next = game.getByRole('button', { name: 'Next word', exact: true });
        await assertPrimary(`level-${index + 1}-next-word-${roundIndex + 1}`, next);
        await next.click();
      }
    }
    rows.push({ kind: 'level-target-reached', level: index + 1, target: EXPECTED_TARGETS[index], rescued: rescues, uniqueVisibleWordCount: levelRescuedWords.size });
    const expectedDelta = plannedDeltas[index];
    const failHangmanWrite = expectedDelta > 0 && index === localFaultIndex;
    const failParentReward = expectedDelta > 0 && index === parentFaultIndex;
    rows.push({ kind: 'level-replay-reward-delta', level: index + 1, priorBest: previousBest[index], plannedScore: plannedScores[index], expectedDelta, injectedLocalFailure: failHangmanWrite, injectedParentRewardFailure: failParentReward });
    await finishCurrentLevel(index, { failHangmanWrite, failParentReward, rewardRecovery: options.rewardRecovery || 'reopen', expectedRewardDelta: options.expectedRewardDelta ?? null });
  };

  try {
    if (PLAYER !== 'amari') throw new Error('This Hangman route is only available in Amari’s Read & Write world.');
    await page.setViewportSize({ width: WIDTH, height: HEIGHT });
    await page.goto(`${ORIGIN}/?qa_pair7_hangman_native=${Date.now()}#/home`, { waitUntil: 'domcontentloaded' });
    if (page.url().startsWith(ORIGIN) === false) throw new Error(`Native page is not on the expected origin: ${page.url()}`);
    await installMediaObserver();
    entryIdentity = await page.evaluate(() => [...document.scripts].map(script => script.src).find(src => /arcade/i.test(src)) || [...document.scripts].map(script => script.src).find(Boolean) || null);
    if (!entryIdentity || new URL(entryIdentity, page.url()).pathname !== new URL(EXPECTED_ENTRY, page.url()).pathname) throw new Error(`Candidate entry mismatch: ${entryIdentity}; expected ${EXPECTED_ENTRY}`);
    const chooseAmari = page.getByRole('button', { name: /Age 6\+ Amari/ }).first();
    if (await chooseAmari.count()) {
      await chooseAmari.click();
      await page.getByRole('button', { name: /is playing\. Tap to change player/ }).waitFor({ state: 'visible', timeout: 10000 });
    }
    const profilePlayer = page.getByRole('button', { name: /is playing\. Tap to change player/ }).first();
    const playerLabel = await profilePlayer.getAttribute('aria-label').catch(() => '');
    const visiblePlayer = playerLabel.match(/^(amari|askia)/i)?.[1] || await page.locator('header strong').first().innerText().catch(() => '');
    if (visiblePlayer.trim().toLowerCase() !== PLAYER) {
      const backHome = page.getByRole('button', { name: 'Back to home', exact: true });
      if (await backHome.count()) await backHome.click();
      const homeProfile = page.getByRole('button', { name: /is playing\. Tap to change player/ }).first();
      const homeLabel = await homeProfile.getAttribute('aria-label').catch(() => '');
      const confirmedPlayer = homeLabel.match(/^(amari|askia)/i)?.[1] || visiblePlayer;
      if (confirmedPlayer.trim().toLowerCase() !== PLAYER) throw new Error(`The selected child does not match ${PLAYER}: ${confirmedPlayer}`);
    }
    await openHangmanFromWorld();
    initialSnapshot = await snapshotProtected();
    const legacyRaw = initialSnapshot[legacyKey] ?? null;
    const initialProgress = await localJson(canonicalKey);
    const legacy = (() => { try { return legacyRaw === null ? null : JSON.parse(legacyRaw); } catch { return null; } })();
    const legacyHangman = legacy?.hangman && Number.isInteger(legacy.hangman.unlocked) ? legacy.hangman : null;
    previousBest = EXPECTED_TARGETS.map((_, index) => Math.max(
      Number.isInteger(initialProgress?.bestPointsByLevel?.[index]) ? initialProgress.bestPointsByLevel[index] : 0,
      legacyHangman && index <= legacyHangman.unlocked ? 6 : 0,
    ));
    plannedScores = STAGE === 'clean-reward-retry' ? [6, 6, 6, 6] : [2, 6, 6, 6];
    plannedDeltas = plannedScores.map((score, index) => Math.max(0, score - previousBest[index]));
    const positiveIndexes = plannedDeltas.map((delta, index) => delta > 0 ? index : -1).filter(index => index >= 0);
    localFaultIndex = STAGE === 'clean-reward-retry' ? null : positiveIndexes[0] ?? null;
    parentFaultIndex = STAGE === 'clean-reward-retry' ? (plannedDeltas[0] > 0 ? 0 : null) : positiveIndexes[1] ?? localFaultIndex;
    rows.push({ kind: 'replay-baseline', previousBest, plannedScores, plannedDeltas, legacyRewardCeiling: legacyHangman ? legacyHangman.unlocked : null, faultPlan: { localFailureLevel: localFaultIndex === null ? null : localFaultIndex + 1, parentRewardFailureLevel: parentFaultIndex === null ? null : parentFaultIndex + 1, skipped: plannedDeltas.every(delta => delta === 0) ? 'No positive improvement delta remains in the saved bests.' : null } });
    initialDiagnostics = await localJson('amari_game_diagnostics_v1');
    initialDiagnosticIds = new Set((Array.isArray(initialDiagnostics) ? initialDiagnostics : []).map(event => `${event.at || ''}|${event.game}|${event.event}`));
    const menuButtons = page.getByRole('button', { name: /^\d\. (First words|Four-letter rescue|Five-letter rescue|Long-word rescue)/ });
    if (await menuButtons.count() !== 4) throw new Error('The visible Hangman level map does not contain four named routes');
    for (let i = 0; i < 4; i += 1) {
      const button = page.getByRole('button', { name: new RegExp(`^${i + 1}\\. ${LEVEL_NAMES[i]}`) });
      const enabled = await button.isEnabled();
      if (i === 0 && !enabled) throw new Error('The first Hangman level is not available');
      if (i > 0 && enabled) {
        for (let prior = 0; prior < i; prior += 1) {
          if (!await page.getByRole('button', { name: new RegExp(`^${prior + 1}\\. ${LEVEL_NAMES[prior]}`) }).isEnabled()) throw new Error('Hangman unlocks are not a completed prefix');
        }
      }
      await measure(`level-map-${i + 1}`, button);
    }
    await assertPrimary('selected-level-start', page.getByRole('button', { name: /^Start .+ →$/ }));
    rows.push({ kind: 'initial-map', player: PLAYER, width: WIDTH, height: HEIGHT, levels: LEVEL_NAMES.map((name, index) => ({ name, target: EXPECTED_TARGETS[index] })), protectedKeys: Object.keys(initialSnapshot).length });
    if (STAGE === 'geometry') {
      const result = { passed: true, stage: STAGE, player: PLAYER, origin: ORIGIN, width: WIDTH, height: HEIGHT, entryIdentity, rows, errors: [], pageErrors, apiRequests };
      page.off('pageerror', onPageError); page.off('request', onRequest); page.off('console', onConsole); page.off('requestfailed', onRequestFailed); page.off('response', onResponse); return result;
    }
    if (STAGE === 'level2-preflight') {
      const levelTwo = page.getByRole('button', { name: new RegExp(`^2\\. ${LEVEL_NAMES[1]}`) });
      if (!await levelTwo.isEnabled()) throw new Error('Level 2 is not unlocked for the saved-navigation geometry preflight');
      await levelTwo.scrollIntoViewIfNeeded();
      await assertPrimary('level2-map-selection', levelTwo);
      await levelTwo.click();
      const start = page.getByRole('button', { name: /^Start Four-letter rescue →$/ });
      const startGeometry = await assertPrimary('level2-selected-Start', start);
      await start.click();
      await page.locator('[data-hangman-phase="play"][data-hangman-level="four-letter-rescue"]').waitFor({ state: 'visible', timeout: 5000 });
      rows.push({ kind: 'level2-start-preflight', selectedLevel: 2, start: startGeometry, enteredCorrectMission: true, answerStateUntouched: true });
      const result = { passed: failures.length === 0, stage: STAGE, player: PLAYER, origin: ORIGIN, width: WIDTH, height: HEIGHT, entryIdentity, rows, errors: failures, pageErrors, consoleErrors, resourceFailures, requestFailures, apiRequests };
      page.off('pageerror', onPageError); page.off('request', onRequest); page.off('console', onConsole); page.off('requestfailed', onRequestFailed); page.off('response', onResponse); return result;
    }
    if (!VISIBLE_CLUE_MAP || typeof VISIBLE_CLUE_MAP !== 'object' || !Object.keys(VISIBLE_CLUE_MAP).length) throw new Error('Full stage needs a test-side visible-clue map; answers will still be entered only through visible letter controls.');
    if (STAGE === 'clean-reward-retry') {
      if (previousBest[0] !== 2 || plannedDeltas[0] !== 4 || parentFaultIndex !== 0) throw new Error(`Clean retry diagnostic requires an existing first-level best of 2 and a positive 4-point improvement; found best=${previousBest[0]} delta=${plannedDeltas[0]}`);
      const beforeRewards = await localJson(rewardKey);
      await playLevel(0, { rewardRecovery: 'click-retry', expectedRewardDelta: 4 });
      const afterProgress = await localJson(canonicalKey);
      const afterRewards = await localJson(rewardKey);
      const transaction = Object.entries(afterProgress?.transactions || {}).reverse().find(([, value]) => value.levelIndex === 0 && value.rewardDelta === 4);
      if (!transaction || afterProgress.bestPointsByLevel?.[0] !== 6) throw new Error('Clean Retry did not persist the expected best of 6 and a 4-point transaction');
      if ((afterRewards.points - beforeRewards.points) !== 4) throw new Error('Clean Retry parent reward total did not increase by exactly 4');
      rows.push({ kind: 'clean-reward-retry-result', level: 1, priorBest: 2, newBest: 6, durableRewardDelta: transaction[1].rewardDelta, parentPointDelta: afterRewards.points - beforeRewards.points, retryCount: 1 });
      await page.getByRole('heading', { name: /^First words complete$/ }).waitFor({ state: 'visible', timeout: 5000 });
      const resultTarget = page.locator('[data-hangman-phase="finish"]');
      const resultGeometry = await resultTarget.evaluate(target => {
        const box = target.getBoundingClientRect();
        return { x: Math.round(box.x), y: Math.round(box.y), width: Math.round(box.width), height: Math.round(box.height), bottom: Math.round(box.bottom), fullyInViewport: box.top >= 0 && box.bottom <= innerHeight, viewportHeight: innerHeight };
      });
      const mapGeometry = await assertPrimary('clean-retry-saved-result-Level-map', page.getByRole('button', { name: 'Level map', exact: true }));
      const nextGeometry = await assertPrimary('clean-retry-saved-result-Next', page.getByRole('button', { name: 'Next level →', exact: true }));
      rows.push({ kind: 'saved-result-navigation-geometry', level: 1, result: resultGeometry, levelMap: mapGeometry, next: nextGeometry });
      await compareProtected();
      if (apiRequests.length) throw new Error(`Hangman requested a provider/API route: ${apiRequests[0]}`);
      brokenImages = await page.evaluate(async () => {
        await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
        return [...document.images].filter(image => image.complete && !image.naturalWidth).map(image => image.currentSrc || image.src);
      });
      rows.push({ kind: 'resource-integrity', brokenImages, failedRequests: requestFailures, failedResponses: resourceFailures, pageErrors, consoleErrors, apiRequests });
      if (pageErrors.length || consoleErrors.length || resourceFailures.length || requestFailures.length || brokenImages.length) throw new Error('Clean reward Retry had page, console, image, request, or resource errors.');
      const result = { passed: failures.length === 0, stage: STAGE, player: PLAYER, origin: ORIGIN, width: WIDTH, height: HEIGHT, entryIdentity, completedLevels: afterProgress.completedLevels, targets: EXPECTED_TARGETS, transactionCount: Object.keys(afterProgress.transactions || {}).length, rows, errors: failures, pageErrors, consoleErrors, resourceFailures, requestFailures, brokenImages, apiRequests };
      page.off('pageerror', onPageError); page.off('request', onRequest); page.off('console', onConsole); page.off('requestfailed', onRequestFailed); page.off('response', onResponse); return result;
    }
    await playLevel(0, { audioProbe: true, lossRetry: true, useHint: true });
    await goToMapWhenNeeded();
    await playLevel(1);
    await goToMapWhenNeeded();
    await playLevel(2);
    await goToMapWhenNeeded();
    await playLevel(3);
    if (localFaultIndex === null) rows.push({ kind: 'reward-fault-tests-skipped', reason: 'All planned scores are equal to or below saved bests; no positive reward delta is available.' });
    const progress = await localJson(canonicalKey);
    if (JSON.stringify(progress.completedLevels) !== JSON.stringify([0, 1, 2, 3])) throw new Error(`Four level completions were not saved in order: ${JSON.stringify(progress.completedLevels)}`);
    const diagnostics = await localJson('amari_game_diagnostics_v1');
    const learning = (Array.isArray(diagnostics) ? diagnostics : []).filter(event => event.game === 'hangman' && event.event === 'learning_attempt' && !initialDiagnosticIds.has(`${event.at || ''}|${event.game}|${event.event}`));
    const assistedEvidence = learning.some(event => event.hints === 1 && event.masteryEligible === false);
    if (!assistedEvidence) throw new Error('Visible one-letter help did not produce truthful assisted, non-mastery learning evidence');
    const positiveTransaction = Object.entries(progress.transactions || {}).reverse().find(([, transaction]) => transaction.rewardDelta > 0);
    if (positiveTransaction) {
      const token = `hangman:${positiveTransaction[0]}`;
      await page.getByRole('button', { name: 'Back to home', exact: true }).click();
      await page.getByRole('heading', { name: 'Read & Write', exact: true }).waitFor({ timeout: 10000 });
      await page.getByRole('button', { name: /Dino Hangman/ }).first().click();
      await page.getByRole('heading', { name: 'Dino Hangman', exact: true }).waitFor({ timeout: 10000 });
      await page.waitForFunction(({ key, claim }) => {
        try { const rewards = JSON.parse(localStorage.getItem(key) || 'null'); return Boolean(rewards?.rewardClaims?.[claim]); } catch { return false; }
      }, { key: rewardKey, claim: token }, { timeout: 10000 });
      const firstRecovery = await localJson(rewardKey);
      await page.getByRole('button', { name: 'Back to home', exact: true }).click();
      await page.getByRole('heading', { name: 'Read & Write', exact: true }).waitFor({ timeout: 10000 });
      await page.getByRole('button', { name: /Dino Hangman/ }).first().click();
      await page.getByRole('heading', { name: 'Dino Hangman', exact: true }).waitFor({ timeout: 10000 });
      await page.waitForTimeout(160);
      const secondRecovery = await localJson(rewardKey);
      if (secondRecovery.points !== firstRecovery.points || (secondRecovery.gamesPlayed?.hangman || 0) !== (firstRecovery.gamesPlayed?.hangman || 0) || secondRecovery.rewardClaims?.[token] !== firstRecovery.rewardClaims?.[token]) throw new Error('Stable Hangman reward receipt changed again on another reentry');
      rows.push({ kind: 'stable-reward-reentry', stableToken: token, pointsAfterFirstRecovery: firstRecovery.points, playsAfterFirstRecovery: firstRecovery.gamesPlayed?.hangman || 0, duplicateReentryAddedZero: true });
    } else rows.push({ kind: 'stable-reward-reentry-skipped', reason: 'No positive new Hangman attempt receipt exists; legacy history is never auto-awarded.' });
    await compareProtected();
    if (apiRequests.length) throw new Error(`Hangman requested a provider/API route: ${apiRequests[0]}`);
    brokenImages = await page.evaluate(async () => {
      await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
      return [...document.images].filter(image => image.complete && !image.naturalWidth).map(image => image.currentSrc || image.src);
    });
    rows.push({ kind: 'resource-integrity', brokenImages, failedRequests: requestFailures, failedResponses: resourceFailures, pageErrors, consoleErrors, apiRequests });
    if (pageErrors.length || consoleErrors.length || resourceFailures.length || brokenImages.length) throw new Error('Native Hangman run had page, console, image, or resource errors.');
    const result = { passed: failures.length === 0, stage: STAGE, player: PLAYER, origin: ORIGIN, width: WIDTH, height: HEIGHT, entryIdentity, completedLevels: progress.completedLevels, targets: EXPECTED_TARGETS, transactionCount: Object.keys(progress.transactions || {}).length, assistedEvidence, legacyBytesPreserved: initialSnapshot[legacyKey] === (await localRead(legacyKey)), protectedKeysUnchanged: true, rows, errors: failures, pageErrors, consoleErrors, resourceFailures, requestFailures, brokenImages, apiRequests };
    page.off('pageerror', onPageError); page.off('request', onRequest); page.off('console', onConsole); page.off('requestfailed', onRequestFailed); page.off('response', onResponse); return result;
  } catch (error) {
    failures.push({ message: error?.message || String(error), stack: error?.stack || null, rows: rows.length });
    if (activeFault) { try { await restoreSetItem(); } catch {} }
    try { brokenImages = await page.evaluate(() => [...document.images].filter(image => image.complete && !image.naturalWidth).map(image => image.currentSrc || image.src)); } catch { /* page may have navigated away */ }
    page.off('pageerror', onPageError); page.off('request', onRequest); page.off('console', onConsole); page.off('requestfailed', onRequestFailed); page.off('response', onResponse);
    return { passed: false, stage: STAGE, player: PLAYER, origin: ORIGIN, width: WIDTH, height: HEIGHT, entryIdentity, rows, errors: failures, pageErrors, consoleErrors, resourceFailures, requestFailures, brokenImages, apiRequests };
  }
}
