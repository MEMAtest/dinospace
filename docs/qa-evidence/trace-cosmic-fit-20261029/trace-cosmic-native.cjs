async page => {
  const origin = __ORIGIN__;
  const expectedEntry = __ENTRY__;
  const width = __WIDTH__;
  const height = __HEIGHT__;
  const game = __GAME__;
  const expectedRuntime = __RUNTIME__;
  const TRACE_GUIDES = __TRACE_GUIDES__;
  const localRequire = id => {
    const source = __MODULES__[id];
    if (typeof source !== 'string') throw new Error(`Missing inline helper module ${id}`);
    const module = { exports: {} };
    new Function('require', 'module', 'exports', source)(localRequire, module, module.exports);
    return module.exports;
  };
  const createIntegrationNative = localRequire('./integration-native.cjs');
  const helper = createIntegrationNative(page, {
    origin,
    expectedEntry,
    minimumTargetSize: 44,
    allowedCommonStorageKeys: [
      'amari_game_diagnostics_v1', 'amari_game_lifecycle_diagnostics_v1',
      'amari_learning_attempts_v1', 'amari_skill_mastery_v1',
      'amari_rewards_v2', 'amari_games_played', 'amari_chapter_badges_v1',
    ],
  });
  const rows = [];
  const diagnostics = { runtimeErrors: null, providerAttempts: [], changedKeys: [], unexpectedKeys: [] };
  const logical = key => `qa_rewards_20261024_${key}`;
  const readRaw = key => page.evaluate(k => localStorage.getItem(k), logical(key));
  const exactlyOne = async (locator, label) => {
    if (await locator.count() !== 1 || !await locator.isVisible()) throw new Error(`${label} is missing or not uniquely visible`);
    return locator;
  };
  const visibleNavClick = async (locator, label, waitFor) => {
    await exactlyOne(locator, label);
    await locator.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
    return helper.clickControl(locator, { label, heading: waitFor });
  };
  const exactButton = name => page.getByRole('button', { name, exact: true });
  const gameTitle = game === 'trace' ? 'Letter Trace' : 'Cosmic Tic-Tac-Toe';
  const world = game === 'trace' ? 'Read & Write' : 'Thinking & Play';
  const worldRoute = game === 'trace' ? 'read-write' : 'thinking';
  const progressKeys = game === 'trace'
    ? ['amari_letter_trace_progress_v1']
    : ['amari_cosmic_tactics_v1', 'amari_cosmic_freeplay_v1'];
  let initialSound = null;
  let soundControl = null;
  let baselineStorage = null;
  let entryIdentity = null;
  let restoredSound = null;
  await page.setViewportSize({ width, height });

  const soundStatus = async () => {
    soundControl = game === 'trace'
      ? page.getByRole('button', { name: /^Sound (on|off)$/, exact: false })
      : page.getByRole('button', { name: /^Turn sound (on|off)$/, exact: false });
    await exactlyOne(soundControl, 'Visible sound toggle');
    const label = await soundControl.getAttribute('aria-label');
    return game === 'trace' ? label === 'Sound on' : label === 'Turn sound off';
  };
  const setSound = async wanted => {
    const current = await soundStatus();
    if (current !== wanted) {
      const label = game === 'trace'
        ? `Sound ${current ? 'on' : 'off'}`
        : `Turn sound ${wanted ? 'on' : 'off'}`;
      await helper.clickControl(page.getByRole('button', { name: label, exact: true }), { label: wanted ? 'Enable packaged narration' : 'Restore original sound preference' });
    }
    if (await soundStatus() !== wanted) throw new Error(`Sound preference did not change to ${wanted}`);
  };
  const restoreSoundInGame = async () => {
    if (initialSound === null) return;
    await setSound(initialSound);
    restoredSound = await soundStatus();
  };
  const assertGameSurface = async () => {
    const value = await helper.assertRuntime();
    if (value.entry !== expectedEntry) throw new Error(`Expected compiled entry ${expectedEntry}, saw ${value.entry}`);
    entryIdentity = value.entry;
    const measured = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }));
    if (measured.width !== width || measured.height !== height) throw new Error(`Unexpected viewport ${JSON.stringify(measured)}`);
    return value;
  };
  const chooseProfileIfNeeded = async () => {
    await page.waitForFunction(() => {
      const visible = element => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && getComputedStyle(element).visibility !== 'hidden';
      };
      const chooser = [...document.querySelectorAll('button')].some(button => visible(button) && /Age 6\+[\s\S]*Amari/.test(button.innerText));
      const headings = [...document.querySelectorAll('h1,h2')].filter(visible).map(element => element.textContent.trim());
      const activeRoutes = document.querySelector('.discovery-world-card,.catalogue-game-card,main.trace-intro-main,main.cosmic-mission-layout');
      return chooser || headings.some(text => text === 'Hi Amari!' || text === 'Choose a world' || text === 'Make letters come to life' || text === 'Think one move ahead') || Boolean(activeRoutes);
    }, null, { timeout: 10000 });
    const chooser = page.getByRole('button', { name: /Age 6\+.*Amari/ }).first();
    if (await chooser.count() && await chooser.isVisible()) await helper.clickControl(chooser, { label: 'Choose Amari through the visible profile picker' });
  };
  const openWorldAndGameFromVisibleNavigation = async () => {
    const introName = game === 'trace' ? 'Make letters come to life' : 'Think one move ahead';
    const intro = page.getByRole('heading', { name: introName, exact: true });
    const worldCard = page.locator('.discovery-world-card').filter({ hasText: world });
    const gameCard = page.locator('.catalogue-game-card').filter({ hasText: gameTitle });
    await page.waitForFunction(({ introName, world, gameTitle }) => {
      const visible = element => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && getComputedStyle(element).visibility !== 'hidden';
      };
      const headings = [...document.querySelectorAll('h1,h2')].filter(visible).map(element => element.textContent.trim());
      const cards = [...document.querySelectorAll('.discovery-world-card,.catalogue-game-card')].filter(visible);
      return headings.includes(introName) || headings.includes('Choose a world')
        || cards.some(card => card.matches('.discovery-world-card') && card.innerText.includes(world))
        || cards.some(card => card.matches('.catalogue-game-card') && card.innerText.includes(gameTitle));
    }, { introName, world, gameTitle }, { timeout: 10000 });
    if (await intro.count() && await intro.isVisible()) return;
    if (await worldCard.count() && await worldCard.isVisible()) {
      await visibleNavClick(worldCard, `Open normal ${world} world card`);
    }
    if (await intro.count() && await intro.isVisible()) return;
    await gameCard.waitFor({ state: 'visible', timeout: 10000 });
    await visibleNavClick(gameCard, `Open normal ${gameTitle} catalogue card`);
    await intro.waitFor({ state: 'visible', timeout: 10000 });
  };
  const enterNormalGame = async () => {
    await page.goto(`${origin}/?trace-cosmic-fit=${Date.now()}`);
    await helper.installGuards();
    await assertGameSurface();
    await chooseProfileIfNeeded();
    await openWorldAndGameFromVisibleNavigation();
    const title = game === 'trace' ? 'Make letters come to life' : 'Think one move ahead';
    await page.getByRole('heading', { name: title, exact: true }).waitFor({ timeout: 10000 });
    const runtime = await assertGameSurface();
    initialSound = await soundStatus();
    if (!initialSound) await setSound(true);
    return runtime;
  };
  const assertPageHasNoOverflow = async label => {
    const result = await page.evaluate(async () => {
      const visible = [...document.images].filter(image => {
        const rect = image.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.bottom >= 0 && rect.right >= 0 && rect.top <= innerHeight && rect.left <= innerWidth;
      });
      const decoded = await Promise.all(visible.map(async image => {
        try {
          if (typeof image.decode === 'function') await image.decode();
          return image.naturalWidth > 0 ? null : image.currentSrc || image.src;
        } catch { return image.currentSrc || image.src; }
      }));
      return {
        viewport: { width: innerWidth, height: innerHeight },
        document: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        visibleImageCount: visible.length,
        brokenImages: decoded.filter(Boolean),
      };
    });
    if (result.horizontalOverflow || result.brokenImages.length) throw new Error(`${label} has overflow or broken art: ${JSON.stringify(result)}`);
    return result;
  };
  const assertCanvasInViewport = async canvas => {
    const result = await canvas.evaluate(element => {
      const rect = element.getBoundingClientRect();
      const ctx = element.getContext('2d');
      const image = ctx.getImageData(0, 0, element.width, element.height);
      let blueGuidePixels = 0;
      for (let index = 0; index < image.data.length; index += 4) {
        const r = image.data[index], g = image.data[index + 1], b = image.data[index + 2], alpha = image.data[index + 3];
        if (alpha > 100 && b > 120 && b > r * 1.25 && b > g * 1.05) blueGuidePixels += 1;
      }
      return {
        rect: { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height },
        viewport: { width: innerWidth, height: innerHeight },
        blueGuidePixels,
        centerHit: document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2) === element,
      };
    });
    if (result.rect.x < 0 || result.rect.y < 0 || result.rect.right > result.viewport.width || result.rect.bottom > result.viewport.height || !result.centerHit || result.blueGuidePixels < 100) {
      throw new Error(`Visible Letter Trace guide/canvas failed viewport check: ${JSON.stringify(result)}`);
    }
    return result;
  };
  const drawVisibleGuide = async (canvas, letter) => {
    const normalized = TRACE_GUIDES[letter];
    if (!normalized) throw new Error(`No authored visible-guide route for displayed letter ${letter}`);
    const box = await canvas.boundingBox();
    if (!box) throw new Error(`Guide canvas for ${letter} has no bounding box`);
    const scale = Math.min(box.width, box.height) * 0.86;
    const left = (box.width - scale) / 2;
    const top = (box.height - scale) / 2 + 8;
    const toScreen = stroke => stroke.map(([x, y]) => ({ x: box.x + left + x * scale, y: box.y + top + y * scale }));
    for (const stroke of normalized) {
      const points = toScreen(stroke);
      const first = points[0];
      await page.mouse.move(first.x, first.y);
      await page.mouse.down();
      let previous = first;
      for (const point of points.slice(1)) {
        const distance = Math.hypot(point.x - previous.x, point.y - previous.y);
        await page.mouse.move(point.x, point.y, { steps: Math.max(2, Math.ceil(distance / 4)) });
        previous = point;
      }
      await page.mouse.up();
    }
  };
  const traceOneRound = async (level, round, { recordBeforeFinishReload = false, recordKind = 'trace-round' } = {}) => {
    const main = page.locator('main.trace-round-main');
    await main.waitFor({ state: 'visible' });
    const letter = await main.getAttribute('data-trace-letter');
    if (!letter) throw new Error('Letter Trace has no visible data-trace-letter on the current round');
    const canvas = main.locator('canvas[aria-label]');
    await canvas.waitFor({ state: 'visible' });
    const canvasGeometry = await assertCanvasInViewport(canvas);
    const progress = page.getByRole('progressbar', { name: 'Letter path progress', exact: true });
    const check = page.getByRole('button', { name: level === 2 ? 'Find the word →' : 'Check shape', exact: true });
    await helper.measureControl(check, `Trace chapter ${level + 1} Check for ${letter}`);
    if (await check.isEnabled()) throw new Error(`Check became enabled before tracing ${letter}`);
    if (round === 0) {
      const before = await readRaw('amari_letter_trace_progress_v1');
      const demoButton = page.getByRole('button', { name: 'Watch this stroke', exact: true });
      await helper.clickControl(demoButton, { label: `Play the visible ${letter} stroke demonstration` });
      const centroid = () => canvas.evaluate(element => {
        const { data, width } = element.getContext('2d').getImageData(0, 0, element.width, element.height);
        let x = 0, y = 0, count = 0;
        for (let index = 0; index < data.length; index += 4) {
          if (data[index] > 220 && data[index + 1] > 70 && data[index + 1] < 155 && data[index + 2] < 90 && data[index + 3] > 180) {
            x += (index / 4) % width; y += Math.floor(index / 4 / width); count += 1;
          }
        }
        return count ? { x: x / count, y: y / count, count } : null;
      });
      await page.waitForTimeout(300);
      const a = await centroid();
      await page.waitForTimeout(420);
      const b = await centroid();
      if (!a || !b || Math.hypot(a.x - b.x, a.y - b.y) < 3) throw new Error(`The ${letter} demonstration did not visibly move along its guide`);
      await page.waitForTimeout(1200); // the source demo runs for 1.8 seconds; let it finish before pointer input
      if (await progress.getAttribute('aria-valuenow') !== '0') throw new Error(`The ${letter} demonstration advanced trace progress`);
      if (before !== await readRaw('amari_letter_trace_progress_v1')) throw new Error(`The ${letter} demonstration changed saved mastery/progress`);
    }
    if (round === 0) {
      const box = await canvas.boundingBox();
      await page.mouse.click(box.x + 4, box.y + 4);
      if (await progress.getAttribute('aria-valuenow') !== '0' || await check.isEnabled()) throw new Error(`Off-guide start was accepted for ${letter}`);
    }
    await drawVisibleGuide(canvas, letter);
    if (await progress.getAttribute('aria-valuenow') !== '100' || !await check.isEnabled()) {
      throw new Error(`Visible authored guide did not complete ${letter}: progress=${await progress.getAttribute('aria-valuenow')}`);
    }
    await helper.clickControl(check, { label: `${level === 2 ? 'Transfer traced sound to word choice' : 'Check traced letter'} ${letter}` });
    let selectedWord = null;
    let wrongWord = null;
    if (level === 2) {
      const wordTask = page.getByRole('region', { name: 'Choose the word that starts with this sound', exact: true });
      await wordTask.waitFor({ state: 'visible' });
      const prompt = (await wordTask.innerText()).toLowerCase();
      if (!prompt.includes(letter.toLowerCase())) throw new Error(`Word transfer prompt does not match traced sound ${letter}: ${prompt}`);
      const choices = wordTask.getByRole('button');
      const names = await choices.evaluateAll(elements => elements.map(element => (element.getAttribute('aria-label') || element.innerText || '').trim()));
      selectedWord = names.find(name => name[0]?.toLowerCase() === letter.toLowerCase());
      if (!selectedWord) throw new Error(`No visible word choice begins with the displayed sound ${letter}: ${JSON.stringify(names)}`);
      if (round === 0) {
        wrongWord = names.find(name => name[0]?.toLowerCase() !== letter.toLowerCase());
        if (!wrongWord) throw new Error('No distinct visible wrong word was available for the transfer retry check');
        await helper.clickControl(wordTask.getByRole('button', { name: wrongWord, exact: true }), { label: `Try visible wrong word ${wrongWord}` });
        if (!await wordTask.isVisible() || !(await wordTask.innerText()).toLowerCase().includes(letter.toLowerCase())) throw new Error('Wrong word choice discarded the visible trace/sound question');
      }
      await helper.clickControl(wordTask.getByRole('button', { name: selectedWord, exact: true }), { label: `Choose visible matching word ${selectedWord}` });
    }
    const held = page.getByRole('region', { name: 'Completed letter', exact: true });
    await held.waitFor({ state: 'visible' });
    const heldText = (await held.innerText()).trim();
    if (!heldText) throw new Error(`Letter ${letter} completed without held learning feedback`);
    const hear = held.getByRole('button', { name: 'Hear explanation', exact: true });
    const hearGeometry = await helper.measureControl(hear, `Letter ${letter} held explanation replay`);
    let audio = null;
    if (round === 0) audio = await helper.observePackagedPlayback(hear, `Letter Trace ${letter} explanation`);
    const next = held.getByRole('button', { name: round === 7 ? 'Finish chapter →' : 'Next letter →', exact: true });
    const nextGeometry = await helper.measureControl(next, round === 7 ? 'Letter Trace Finish chapter' : 'Letter Trace Next letter');
    const savedRaw = await readRaw('amari_letter_trace_progress_v1');
    const record = { level, round, letter, canvasGeometry, selectedWord, wrongWord, heldText, hearGeometry, nextGeometry, audio, savedRawBytes: savedRaw?.length ?? 0 };
    if (recordBeforeFinishReload) {
      const beforeProgressRaw = await readRaw('amari_letter_trace_progress_v1');
      await page.reload();
      await helper.installGuards();
      await assertGameSurface();
      await chooseProfileIfNeeded();
      const afterProgressRaw = await readRaw('amari_letter_trace_progress_v1');
      if (beforeProgressRaw !== afterProgressRaw) throw new Error('Reload before chapter Finish changed the saved Letter Trace record');
      await openWorldAndGameFromVisibleNavigation();
      const introTitle = page.getByRole('heading', { name: 'Make letters come to life', exact: true });
      await introTitle.waitFor({ state: 'visible' });
      if (!await soundStatus()) await setSound(true);
      record.reloadBeforeFinish = { saved: true, progressBytesUnchanged: true, introRestored: true };
      // Restart the already-saved chapter through its visible Start control so
      // the end-of-chapter review and following chapter remain normal UI flows.
      const startAgain = page.getByRole('button', { name: 'Start Trace and read →', exact: true });
      await helper.clickControl(startAgain, { label: 'Resume the just-saved Trace and read chapter through its visible Start action' });
      const replayedLetters = [];
      for (let replayRound = 0; replayRound < 8; replayRound += 1) {
        const replayed = await traceOneRound(2, replayRound, { recordKind: 'trace-pre-finish-replay' });
        replayedLetters.push(replayed.letter.toLowerCase());
      }
      await page.getByRole('heading', { name: 'Trace and read complete!', exact: true }).waitFor({ state: 'visible' });
      record.replayedLetters = replayedLetters;
    }
    rows.push({ kind: recordKind, ...record });
    if (!recordBeforeFinishReload) await helper.clickControl(next, { label: round === 7 ? 'Finish the completed Letter Trace chapter' : 'Advance to next Letter Trace item' });
    if (round < 7) await page.locator('main.trace-round-main').waitFor({ state: 'visible' });
    return record;
  };
  const runTrace = async () => {
    const levels = ['Follow the path', 'Big and little', 'Trace and read'];
    const initialRaw = await readRaw('amari_letter_trace_progress_v1');
    const seenByLevel = [new Set(), new Set(), new Set()];
    let picker = page.getByText('Choose another chapter', { exact: true });
    const current = await page.locator('.trace-selected-copy h2').innerText();
    if (current !== levels[0]) {
      await visibleNavClick(picker, 'Open the visible Letter Trace chapter picker');
      const choices = page.getByRole('group', { name: 'Other trace chapters', exact: true });
      const first = choices.getByRole('button', { name: 'Follow the path', exact: true });
      await visibleNavClick(first, 'Select unlocked Follow the path chapter');
    }
    for (let level = 0; level < 3; level += 1) {
      if (level > 0) {
        const startNext = page.getByRole('button', { name: `Next chapter: ${levels[level]} →`, exact: true });
        if (await startNext.count() && await startNext.isVisible()) {
          await helper.clickControl(startNext, { label: `Start ${levels[level]} from the saved completion screen` });
        } else {
          await page.getByRole('heading', { name: 'Make letters come to life', exact: true }).waitFor({ state: 'visible' });
          const chapterPicker = page.getByText('Choose another chapter', { exact: true });
          await visibleNavClick(chapterPicker, 'Open chapter picker for the next unlocked level');
          await visibleNavClick(page.getByRole('group', { name: 'Other trace chapters', exact: true }).getByRole('button', { name: levels[level], exact: true }), `Select unlocked ${levels[level]} chapter`);
          await helper.clickControl(page.getByRole('button', { name: `Start ${levels[level]} →`, exact: true }), { label: `Start ${levels[level]} chapter` });
        }
      } else {
        await helper.clickControl(page.getByRole('button', { name: 'Start Follow the path →', exact: true }), { label: 'Start Follow the path chapter' });
      }
      for (let round = 0; round < 8; round += 1) {
        const result = await traceOneRound(level, round, { recordBeforeFinishReload: level === 2 && round === 7 });
        seenByLevel[level].add(result.letter.toLowerCase());
        if (result.replayedLetters) result.replayedLetters.forEach(letter => seenByLevel[level].add(letter));
        if (result.reloadBeforeFinish) break;
      }
      if (seenByLevel[level].size < 8) throw new Error(`Trace chapter ${level + 1} repeated a letter: ${JSON.stringify([...seenByLevel[level]])}`);
      if (level < 2) await page.getByRole('heading', { name: `${levels[level]} complete!`, exact: true }).waitFor({ state: 'visible' });
    }
    if (await page.getByRole('heading', { name: 'Trace and read complete!', exact: true }).count() === 0) await page.getByRole('heading', { name: 'Trace and read complete!', exact: true }).waitFor({ state: 'visible' });
    const finalSnapshot = await helper.snapshotStorage();
    const storage = helper.assertStorageChanges(baselineStorage, finalSnapshot, { allowedKeys: [...progressKeys, 'amari_rewards_v2', 'amari_games_played', 'amari_chapter_badges_v1'] });
    diagnostics.changedKeys = storage.changed;
    diagnostics.unexpectedKeys = storage.unexpected;
    if (storage.unexpected.length) throw new Error(`Letter Trace changed unrelated storage: ${JSON.stringify(storage.unexpected)}`);
    await assertPageHasNoOverflow('Letter Trace complete review');
    const screenshot = `${__OUTPUT__}/${origin.startsWith('https:') ? 'production' : 'native'}-final-trace-${width}x${height}.jpg`;
    await page.screenshot({ path: screenshot, type: 'jpeg', quality: 72, fullPage: false });
    await restoreSoundInGame();
    await helper.clickControl(page.getByRole('button', { name: 'Back to world', exact: true }), { label: 'Return from completed Letter Trace to its world' });
    await page.getByRole('heading', { name: world, exact: true }).waitFor({ state: 'visible' });
    await page.locator('.catalogue-game-card').filter({ hasText: gameTitle }).waitFor({ state: 'visible' });
    if (!page.url().endsWith(`#/world/${worldRoute}`)) throw new Error(`Letter Trace returned to incorrect parent ${page.url()}`);
    return { game: 'trace', responses: rows.filter(row => row.kind === 'trace-round').length, rows, baselineRawBytes: initialRaw?.length ?? 0, storage, finalRender: screenshot, returnedTo: page.url() };
  };

  const boardState = async () => page.getByRole('gridcell').evaluateAll(elements => elements.map(element => {
    const label = element.getAttribute('aria-label') || '';
    return label.includes(', Dino') ? 'X' : label.includes(', Rocket') ? 'O' : null;
  }));
  const lineTriples = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const immediateMoves = (state, mark) => state.flatMap((value, index) => {
    if (value !== null) return [];
    const next = [...state]; next[index] = mark;
    return lineTriples.some(line => line.every(position => next[position] === mark)) ? [index] : [];
  });
  const forkMoves = state => state.flatMap((value, index) => {
    if (value !== null) return [];
    const next = [...state]; next[index] = 'X';
    return immediateMoves(next, 'X').length >= 2 ? [index] : [];
  });
  const tacticTargets = (state, tactic) => {
    if (tactic === 'Make a line') return immediateMoves(state, 'X');
    if (tactic === 'Block the Rocket') {
      const threatened = immediateMoves(state, 'O');
      return threatened.filter(index => {
        const next = [...state]; next[index] = 'X';
        return immediateMoves(next, 'O').length === 0;
      });
    }
    return forkMoves(state);
  };
  const tacticHeader = page.locator('main').filter({ has: page.getByRole('grid', { name: 'Cosmic three by three board', exact: true }) }).getByRole('heading').first();
  const solveTacticBoard = async (chapter, round, useKeyboardHint) => {
    const board = page.getByRole('grid', { name: 'Cosmic three by three board', exact: true });
    await board.waitFor({ state: 'visible' });
    const title = await tacticHeader.innerText();
    if (title !== chapter) throw new Error(`Displayed tactic title ${title} does not match route ${chapter}`);
    const state = await boardState();
    const boardGeometry = await helper.measureControl(board, `${chapter} lesson board`);
    const signature = state.map(value => value || '-').join('');
    const targetList = tacticTargets(state, chapter);
    if (!targetList.length) throw new Error(`No valid visible ${chapter} move in rendered board ${signature}`);
    let target = targetList[0];
    const cells = page.getByRole('gridcell');
    const wrong = state.findIndex((value, index) => value === null && !targetList.includes(index));
    if (wrong < 0) throw new Error(`No wrong empty square for retry in displayed ${chapter} board`);
    const wrongCell = cells.nth(wrong);
    await helper.clickControl(wrongCell, { label: `Try a non-solution square on ${chapter} board ${round + 1}` });
    if (JSON.stringify(await boardState()) !== JSON.stringify(state)) throw new Error(`Wrong ${chapter} move changed the board instead of holding a retry`);
    const retryText = await page.getByRole('status').filter({ hasText: 'Try another empty square. Your board stays the same.' }).innerText().catch(() => '');
    if (!retryText.includes('board stays the same')) throw new Error(`Wrong ${chapter} move did not expose same-board retry feedback`);
    let hintUsed = false;
    if (round === 0) {
      const hint = exactButton('Show hint');
      await helper.clickControl(hint, { label: `Reveal one-use ${chapter} board clue` });
      if (!(await exactButton('Hint used').isDisabled())) throw new Error(`${chapter} hint was not marked used`);
      const markedSquares = await cells.evaluateAll(elements => elements.flatMap((element, index) => (element.getAttribute('aria-label') || '').includes(', hint') ? [index] : []));
      if (markedSquares.length !== 1 || !targetList.includes(markedSquares[0])) throw new Error(`Visible clue did not identify one modeled ${chapter} solution square: ${JSON.stringify(markedSquares)}`);
      target = markedSquares[0];
      hintUsed = true;
    }
    const targetLabel = await cells.nth(target).getAttribute('aria-label');
    const targetGeometry = await helper.measureControl(cells.nth(target), `${chapter} visible target cell ${target + 1}`);
    if (useKeyboardHint) {
      await cells.nth(target).focus();
      await page.keyboard.press('Enter');
    } else {
      await cells.nth(target).click();
    }
    const nextState = await boardState();
    if (nextState[target] !== 'X' || nextState.filter(Boolean).length !== state.filter(Boolean).length + 1) throw new Error(`${chapter} answer was not rendered at its selected visible square`);
    const explained = page.getByRole('region', { name: 'Tactic explained', exact: true });
    await explained.waitFor({ state: 'visible' });
    const heldText = (await explained.innerText()).trim();
    const expectedPaths = chapter === 'Find a fork' ? 2 : 1;
    const pathCount = await page.locator('[data-tactic-path]').count();
    if (pathCount !== expectedPaths) throw new Error(`${chapter} explanation showed ${pathCount} visible path(s), expected ${expectedPaths}`);
    const audioControl = explained.getByRole('button', { name: 'Hear explanation', exact: true });
    const audioGeometry = await helper.measureControl(audioControl, `${chapter} held audio replay`);
    const audio = round === 0 ? await helper.observePackagedPlayback(audioControl, `${chapter} tactic explanation`) : null;
    const nextLabel = round === 2 ? 'Finish chapter →' : 'Next tactic board →';
    const next = explained.getByRole('button', { name: nextLabel, exact: true });
    const nextGeometry = await helper.measureControl(next, `${chapter} ${nextLabel}`);
    if (round === 2) {
      const raw = await readRaw('amari_cosmic_tactics_v1');
      if (!raw) throw new Error(`${chapter} final correct move did not persist its mission record before Finish`);
    }
    const imageStatus = await assertPageHasNoOverflow(`${chapter} held board`);
    const record = { chapter, round, visibleBoard: state, visibleTargets: targetList, chosenTarget: target, targetLabel, boardGeometry, targetGeometry, hintUsed, retryText, heldText, pathCount, audioGeometry, nextLabel, nextGeometry, audio, imageStatus };
    await helper.clickControl(next, { label: `Continue ${chapter} board by its explicit ${nextLabel}` });
    return record;
  };
  const runCosmic = async () => {
    const beforeTactics = await readRaw('amari_cosmic_tactics_v1');
    const beforeFree = await readRaw('amari_cosmic_freeplay_v1');
    const chapterTitles = ['Make a line', 'Block the Rocket', 'Find a fork'];
    const allBoards = [];
    for (let chapterIndex = 0; chapterIndex < chapterTitles.length; chapterIndex += 1) {
      const chapter = chapterTitles[chapterIndex];
      if (chapterIndex === 0) {
        const card = page.getByRole('button', { name: /^Make a line, / }).first();
        await visibleNavClick(card, 'Start first visible Cosmic tactic chapter');
      } else {
        const nextChapter = page.getByRole('button', { name: `Next lesson: ${chapter} →`, exact: true });
        await helper.clickControl(nextChapter, { label: `Open ${chapter} from previous chapter completion` });
      }
      const countLabel = page.locator('main').getByText(/Board 1 of \d+/).first();
      await countLabel.waitFor({ state: 'visible' });
      const amount = Number(/Board 1 of (\d+)/i.exec(await countLabel.innerText())?.[1]);
      if (!Number.isInteger(amount) || amount < 1 || amount > 3) throw new Error(`Unexpected displayed ${chapter} route size ${amount}`);
      const runBoards = [];
      for (let round = 0; round < amount; round += 1) {
        const boardRow = await solveTacticBoard(chapter, round, round === 1);
        runBoards.push(boardRow);
        allBoards.push(boardRow);
        rows.push({ kind: 'tactic-board', ...boardRow });
      }
      if (new Set(runBoards.map(row => row.visibleBoard.map(value => value || '-').join(''))).size < amount) throw new Error(`${chapter} reused a board layout within the visible run`);
      await page.getByRole('heading', { name: `${chapter} complete!`, exact: true }).waitFor({ state: 'visible' });
      if (amount < 3) {
        await helper.clickControl(exactButton('Replay chapter'), { label: `Replay all three ${chapter} boards after completing its remaining saved boards` });
        const replayBoards = [];
        for (let round = 0; round < 3; round += 1) {
          const boardRow = await solveTacticBoard(chapter, round, round === 1);
          replayBoards.push(boardRow);
          allBoards.push(boardRow);
          rows.push({ kind: 'tactic-board-replay', ...boardRow });
        }
        if (new Set(replayBoards.map(row => row.visibleBoard.map(value => value || '-').join(''))).size !== 3) throw new Error(`${chapter} replay did not show three distinct visible board layouts`);
        await page.getByRole('heading', { name: `${chapter} complete!`, exact: true }).waitFor({ state: 'visible' });
      }
      if (chapterIndex === 2) {
        const stored = await readRaw('amari_cosmic_tactics_v1');
        if (!stored) throw new Error('Final tactic result is absent from saved progress at chapter completion');
        const mapButton = exactButton('Choose another chapter');
        await helper.clickControl(mapButton, { label: 'Open tactic map after final chapter' });
      }
    }
    const mapSummary = await page.getByRole('heading', { name: 'Think one move ahead', exact: true }).innerText();
    if (!mapSummary) throw new Error('Cosmic chapter map did not return after lessons');
    const map = page.locator('main').filter({ has: page.getByRole('heading', { name: 'Think one move ahead', exact: true }) });
    const gameOptions = map.locator('details').filter({ hasText: 'Play a whole game' });
    await visibleNavClick(gameOptions.locator('summary'), 'Open optional Cosmic whole-game mode');
    await helper.clickControl(exactButton('Play Nova Bot'), { label: 'Start one optional free-play turn against Nova Bot' });
    const grid = page.getByRole('grid', { name: 'Cosmic three by three board', exact: true });
    await grid.waitFor({ state: 'visible' });
    const initial = await boardState();
    const empty = initial.findIndex(value => value === null);
    if (initial.filter(Boolean).length !== 0 || empty < 0) throw new Error(`Free-play board did not start empty: ${initial}`);
    const boardBox = await grid.boundingBox();
    if (!boardBox || boardBox.x < 0 || boardBox.y < 0 || boardBox.x + boardBox.width > width || boardBox.y + boardBox.height > height) throw new Error(`Free-play board does not fit ${width}x${height}: ${JSON.stringify(boardBox)}`);
    await helper.clickControl(page.getByRole('gridcell').nth(empty), { label: 'Place one visible legal Dino free-play move' });
    await page.waitForFunction(() => [...document.querySelectorAll('[role="gridcell"]')].filter(cell => /, (Dino|Rocket)$/.test(cell.getAttribute('aria-label') || '')).length === 2, null, { timeout: 5000 });
    const afterBot = await boardState();
    if (afterBot.filter(Boolean).length !== 2 || afterBot.filter(value => value === 'X').length !== 1 || afterBot.filter(value => value === 'O').length !== 1) throw new Error(`Nova Bot did not make exactly one legal response: ${afterBot}`);
    const boardGeometry = { x: boardBox.x, y: boardBox.y, width: boardBox.width, height: boardBox.height, right: boardBox.x + boardBox.width, bottom: boardBox.y + boardBox.height };
    rows.push({ kind: 'cosmic-freeplay', initial, afterHumanAndBot: afterBot, boardGeometry });
    await visibleNavClick(exactButton('Back to chapters'), 'Open free-play leave confirmation');
    const leaveDialog = page.getByRole('alertdialog', { name: 'Leave this board?' });
    await leaveDialog.waitFor({ state: 'visible' });
    await helper.clickControl(leaveDialog.getByRole('button', { name: 'Leave board', exact: true }), { label: 'Leave optional free-play board through its confirmation' });
    await page.getByRole('heading', { name: 'Think one move ahead', exact: true }).waitFor({ state: 'visible' });
    await restoreSoundInGame();
    await helper.clickControl(page.getByRole('button', { name: 'Back to learning world', exact: true }), { label: 'Return from Cosmic chapter map to Thinking & Play' });
    await page.getByRole('heading', { name: world, exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('.catalogue-game-card').filter({ hasText: gameTitle }).waitFor({ state: 'visible', timeout: 10000 });
    if (!page.url().endsWith(`#/world/${worldRoute}`)) throw new Error(`Cosmic did not return to Thinking & Play: ${page.url()}`);
    const afterTactics = await readRaw('amari_cosmic_tactics_v1');
    const afterFree = await readRaw('amari_cosmic_freeplay_v1');
    if (!afterTactics) throw new Error('Cosmic did not preserve mission progress');
    if (beforeFree !== afterFree) throw new Error('An unfinished optional free-play turn was incorrectly counted as a result');
    const afterSnapshot = await helper.snapshotStorage();
    const storage = helper.assertStorageChanges(baselineStorage, afterSnapshot, { allowedKeys: [...progressKeys, 'amari_rewards_v2', 'amari_games_played', 'amari_chapter_badges_v1'] });
    diagnostics.changedKeys = storage.changed;
    diagnostics.unexpectedKeys = storage.unexpected;
    if (storage.unexpected.length) throw new Error(`Cosmic Tic-Tac-Toe changed unrelated storage: ${JSON.stringify(storage.unexpected)}`);
    await assertPageHasNoOverflow('Cosmic parent world');
    const screenshot = `${__OUTPUT__}/${origin.startsWith('https:') ? 'production' : 'native'}-final-cosmic-${width}x${height}.jpg`;
    await page.screenshot({ path: screenshot, type: 'jpeg', quality: 72, fullPage: false });
    return { game: 'tictactoe', solvedBoards: allBoards.length, rows: allBoards, freePlay: rows.find(row => row.kind === 'cosmic-freeplay'), initialTacticsBytes: beforeTactics?.length ?? 0, finalTacticsBytes: afterTactics.length, incompleteFreePlayUnscored: beforeFree === afterFree, storage, finalRender: screenshot, returnedTo: page.url() };
  };

  let result = null;
  try {
    if (!['trace', 'tictactoe'].includes(game)) throw new Error(`Unsupported game lane ${game}`);
    await helper.installGuards();
    const runtime = await enterNormalGame();
    baselineStorage = await helper.snapshotStorage();
    result = game === 'trace' ? await runTrace() : await runCosmic();
    diagnostics.runtimeErrors = helper.assertNoRuntimeErrors();
    diagnostics.providerAttempts = [...helper.diagnostics.providerAttempts];
    helper.assertNoProviderAttempts();
    if (runtime.origin !== new URL(origin).origin || runtime.entry !== expectedEntry) throw new Error('Runtime origin/entry identity changed during the flow');
    result = { passed: true, origin, viewport: { width, height }, game, expectedRuntime, entryIdentity, initialSound, ...result, diagnostics };
  } catch (error) {
    result = {
      passed: false, origin, viewport: { width, height }, game, expectedRuntime,
      entryIdentity, initialSound, rows: rows.slice(), diagnostics,
      failure: { message: String(error?.message || error), stack: String(error?.stack || '').slice(0, 5000) },
    };
    try { result.render = `${__OUTPUT__}/failure-${game}-${width}x${height}-${Date.now()}.jpg`; await page.screenshot({ path: result.render, type: 'jpeg', quality: 65 }); }
    catch (captureError) { diagnostics.renderCaptureError = String(captureError?.message || captureError); }
    diagnostics.providerAttempts = [...helper.diagnostics.providerAttempts];
    diagnostics.runtimeErrors = { pageErrors: [...helper.diagnostics.pageErrors], consoleErrors: [...helper.diagnostics.consoleErrors], requestErrors: [...helper.diagnostics.requestErrors], responseErrors: [...helper.diagnostics.responseErrors] };
  } finally {
    try {
      if (initialSound !== null && await page.getByRole('button', { name: game === 'trace' ? /^Sound (on|off)$/ : /^Turn sound (on|off)$/ }).count()) await restoreSoundInGame();
    } catch (error) { diagnostics.soundRestoreError = String(error?.message || error); }
    await helper.dispose();
  }
  result.finalSound = restoredSound;
  result.soundRestored = initialSound === null || restoredSound === initialSound;
  result.diagnostics = diagnostics;
  if (!result.soundRestored) result.passed = false;
  return result;
}
