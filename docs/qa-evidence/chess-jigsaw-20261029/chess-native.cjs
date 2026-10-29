async page => {
  const ORIGIN = __ORIGIN__;
  const WIDTH = __WIDTH__;
  const HEIGHT = __HEIGHT__;
  const EXPECTED_ENTRY = __EXPECTED_ENTRY__;
  const PLAN = __PLAN__;
  const OUT = __OUT__;
  const VIEW = `${WIDTH}x${HEIGHT}`;
  const CHESS_KEY = 'amari_chess_game_v1';
  const LESSON_KEY = 'amari_chess_explorers_progress_v1:amari';
  const REWARD_KEY = 'amari_rewards_v2';
  const REWARD_MIRRORS = ['amari_points', 'amari_games_played', 'amari_earned_sticker_ids_v1'];
  const ALLOWED_STORAGE = new Set([CHESS_KEY, REWARD_KEY, ...REWARD_MIRRORS, 'amari_recent_games']);
  const rows = [], completedOpeningCases = [], failures = [], coverageLimitations = [], providerAttempts = [], responseFailures = [], requestFailures = [], pageErrors = [], consoleErrors = [];
  let entryIdentity = null, namespace = false, activeFault = null, screenshotPath = null;
  const onError = error => pageErrors.push(String(error?.message || error));
  const onConsole = message => { if (message.type() === 'error') consoleErrors.push(message.text()); };
  const onRequest = request => { if (/\/api\/|elevenlabs|openai|text-to-speech|story-provider/i.test(request.url())) providerAttempts.push(request.url()); };
  const onRequestFailed = request => requestFailures.push({ url: request.url(), error: request.failure()?.errorText || 'request failed' });
  const onResponse = response => { if (response.status() >= 400 && !/\/api\//i.test(response.url())) responseFailures.push({ status: response.status(), url: response.url() }); };
  page.on('pageerror', onError); page.on('console', onConsole); page.on('request', onRequest); page.on('requestfailed', onRequestFailed); page.on('response', onResponse);
  const providerGuard = async route => {
    if (/\/api\/|elevenlabs|openai|text-to-speech|story-provider/i.test(route.request().url())) {
      providerAttempts.push(route.request().url());
      await route.fulfill({ status: 403, contentType: 'text/plain', body: 'Provider blocked by retained-profile QA' });
    } else await route.continue();
  };
  await page.route('**/*', providerGuard);

  const wait = ms => page.waitForTimeout(ms);
  const raw = key => page.evaluate(storageKey => {
    try { return localStorage.getItem(storageKey); } catch (error) { return `!STORAGE_ERROR:${error.name}`; }
  }, key);
  const json = async key => {
    const value = await raw(key);
    if (value?.startsWith('!STORAGE_ERROR:')) throw new Error(`Could not read local storage ${key}`);
    try { return value === null ? null : JSON.parse(value); } catch { throw new Error(`Malformed JSON in ${key}`); }
  };
  const hashSnapshot = async () => page.evaluate(async () => {
    const snapshot = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const physicalKey = localStorage.key(i); if (physicalKey === null) continue;
      const key = physicalKey.startsWith('qa_rewards_20261024_') ? physicalKey.slice('qa_rewards_20261024_'.length) : physicalKey;
      if (Object.prototype.hasOwnProperty.call(snapshot, key)) throw new Error(`Duplicate logical storage key after QA namespace normalization: ${key}`);
      const value = localStorage.getItem(physicalKey); const bytes = new TextEncoder().encode(value ?? '');
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      snapshot[key] = { physicalKey, bytes: bytes.length, sha256: [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, '0')).join('') };
    }
    return snapshot;
  });
  const compareSnapshots = (before, after) => {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    const changed = [...keys].filter(key => before[key]?.sha256 !== after[key]?.sha256 || before[key]?.bytes !== after[key]?.bytes).sort();
    return { changed, unexpected: changed.filter(key => !ALLOWED_STORAGE.has(key)) };
  };
  const assertRuntime = async () => {
    const actual = await page.evaluate(() => ({
      origin: location.origin,
      namespaced: window.__amariQaNamespaced === true,
      entry: document.querySelector('script[type="module"][src]')?.getAttribute('src') || null,
      viewport: { width: innerWidth, height: innerHeight },
    }));
    if (actual.origin !== new URL(ORIGIN).origin) throw new Error(`Unexpected origin ${actual.origin}`);
    if (!actual.namespaced) throw new Error('Retained-profile namespace guard missing; stop before app interaction.');
    if (!actual.entry || !actual.entry.includes(EXPECTED_ENTRY)) throw new Error(`Compiled entry mismatch: ${actual.entry}; expected ${EXPECTED_ENTRY}`);
    if (actual.viewport.width !== WIDTH || actual.viewport.height !== HEIGHT) throw new Error(`Viewport mismatch: ${JSON.stringify(actual.viewport)}`);
    namespace = true; entryIdentity = actual.entry;
    return actual;
  };
  const measure = async (label, locator, min = 44) => {
    if (await locator.count() !== 1 || !await locator.isVisible()) throw new Error(`${label} is missing or not uniquely visible`);
    const result = await locator.evaluate(element => {
      const r = element.getBoundingClientRect();
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const hit = document.elementFromPoint(x, y);
      return {
        label: (element.getAttribute('aria-label') || element.innerText || element.textContent || '').trim(),
        rect: { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height },
        viewport: { width: innerWidth, height: innerHeight },
        centerHit: Boolean(hit && (hit === element || element.contains(hit))),
      };
    });
    rows.push({ kind: 'control-geometry', label, ...result });
    const r = result.rect;
    if (r.width < min || r.height < min || r.x < 0 || r.y < 0 || r.right > WIDTH || r.bottom > HEIGHT || !result.centerHit) {
      throw new Error(`${label} is undersized, offscreen or center-covered: ${JSON.stringify(result)}`);
    }
    return result;
  };
  const assertBoardGeometry = async label => {
    const result = await page.locator('.chess-play-board').evaluate(board => {
      const boardRect = board.getBoundingClientRect();
      const cells = [...board.querySelectorAll('[role="gridcell"]')].map(cell => {
        const r = cell.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, hit = document.elementFromPoint(x, y);
        return { aria: cell.getAttribute('aria-label'), x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height, hit: Boolean(hit && (hit === cell || cell.contains(hit))) };
      });
      return {
        board: { x: boardRect.x, y: boardRect.y, right: boardRect.right, bottom: boardRect.bottom, width: boardRect.width, height: boardRect.height },
        cells, viewport: { width: innerWidth, height: innerHeight },
      };
    });
    rows.push({ kind: 'board-geometry', label, board: result.board, squareCount: result.cells.length,
      minCellWidth: Math.min(...result.cells.map(cell => cell.width)), minCellHeight: Math.min(...result.cells.map(cell => cell.height)) });
    if (result.cells.length !== 64) throw new Error(`${label} rendered ${result.cells.length} squares instead of 64`);
    if (result.board.x < 0 || result.board.y < 0 || result.board.right > WIDTH || result.board.bottom > HEIGHT) throw new Error(`${label} board is outside viewport: ${JSON.stringify(result.board)}`);
    const invalid = result.cells.filter(cell => cell.width < 44 || cell.height < 44 || cell.x < 0 || cell.y < 0 || cell.right > WIDTH || cell.bottom > HEIGHT || !cell.hit);
    if (invalid.length) throw new Error(`${label} has an offscreen/covered/sub-44px square: ${JSON.stringify(invalid.slice(0, 3))}`);
    return result;
  };
  const parseFenPlacement = fen => {
    const result = {};
    const ranks = fen.split(' ')[0].split('/');
    const names = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
    ranks.forEach((rankText, row) => {
      let file = 0;
      for (const symbol of rankText) {
        if (/\d/.test(symbol)) { file += Number(symbol); continue; }
        const square = `${String.fromCharCode(97 + file)}${8 - row}`;
        result[square] = `${symbol === symbol.toUpperCase() ? 'White' : 'Black'} ${names[symbol.toLowerCase()]}`;
        file += 1;
      }
    });
    return result;
  };
  const readRenderedPosition = async () => {
    const actual = await page.locator('.chess-play-board [role="gridcell"]').evaluateAll(cells => {
      const map = {};
      for (const cell of cells) {
        const text = cell.getAttribute('aria-label') || '';
        const match = text.match(/^([a-h][1-8]),\s*(.*)$/);
        if (!match) throw new Error(`Unreadable visible chess square label: ${text}`);
        map[match[1]] = match[2].startsWith('empty square') ? null : match[2].split(',')[0];
      }
      return map;
    });
    return actual;
  };
  const assertRenderedPosition = async (fen, label) => {
    const actual = await readRenderedPosition();
    const expected = parseFenPlacement(fen);
    const mismatch = [];
    for (const file of 'abcdefgh') for (let rank = 1; rank <= 8; rank += 1) {
      const square = `${file}${rank}`;
      if ((actual[square] || null) !== (expected[square] || null)) mismatch.push({ square, actual: actual[square] || null, expected: expected[square] || null });
    }
    rows.push({ kind: 'visible-position', label, fenPlacement: fen.split(' ')[0], pieces: Object.keys(expected).length, mismatchCount: mismatch.length });
    if (mismatch.length) throw new Error(`${label} does not match the expected visible board: ${JSON.stringify(mismatch.slice(0, 8))}`);
    return { pieces: Object.keys(expected).length, mismatchCount: 0 };
  };
  const assertSavedBoardMatchesVisible = async label => {
    const saved = await json(CHESS_KEY);
    if (!saved?.match?.fen) throw new Error(`${label} has no saved chess match to compare with the visible board.`);
    const actual = await readRenderedPosition();
    const expected = parseFenPlacement(saved.match.fen);
    const mismatch = [];
    for (const file of 'abcdefgh') for (let rank = 1; rank <= 8; rank += 1) {
      const notation = `${file}${rank}`;
      if ((actual[notation] || null) !== (expected[notation] || null)) mismatch.push({ square: notation, actual: actual[notation] || null, saved: expected[notation] || null });
    }
    rows.push({ kind: 'visible-board-saved-state', label, plies: saved.match.history.length, fenPlacement: saved.match.fen.split(' ')[0], mismatchCount: mismatch.length });
    if (mismatch.length) throw new Error(`${label} rendered board differs from its saved FEN: ${JSON.stringify(mismatch.slice(0, 8))}`);
    return saved.match;
  };
  const square = notation => page.locator(`[role="gridcell"][aria-label^="${notation},"]`);
  const verifyPlanState = async (step, label, difficulty) => {
    const savedMatch = difficulty === 'beginner' ? null : await assertSavedBoardMatchesVisible(label);
    if (difficulty === 'beginner') await assertRenderedPosition(step.fen, label);
    const lastMove = difficulty === 'beginner' ? step.move : savedMatch?.history?.at(-1);
    const highlighted = lastMove ? await square(lastMove.from).getAttribute('aria-label') : null;
    const other = lastMove ? await square(lastMove.to).getAttribute('aria-label') : null;
    if (step.side !== 'human' && step.status.gameOver) throw new Error('Unexpected terminal computer move in the opening plan.');
    if (step.side === 'computer' && !highlighted?.includes('last move')) throw new Error(`${label} last-move marker missing on visible source square ${lastMove?.from}`);
    if (step.side === 'computer' && !other?.includes('last move')) throw new Error(`${label} last-move marker missing on visible target square ${lastMove?.to}`);
    const turnName = step.status.turn === 'w' ? 'White' : 'Black';
    if (!step.status.gameOver && step.side === 'computer') {
      const statusText = (await page.locator('.chess-match-status strong').innerText()).trim();
      if (!statusText.includes(`${turnName} to move`)) throw new Error(`${label} wrong visible turn status: ${statusText}`);
    }
  };
  const moveThroughBoard = async (move, { keyboard = false, label = 'human move' } = {}) => {
    const from = square(move.from), to = square(move.to);
    await measure(`${label} source ${move.from}`, from);
    await from.click();
    const fromLabel = await from.getAttribute('aria-label');
    if (!fromLabel?.includes('selected')) throw new Error(`${label}: selected piece was not visibly marked at ${move.from}`);
    const targetLabel = await to.getAttribute('aria-label');
    if (!targetLabel?.includes('legal move') && !targetLabel?.includes('legal capture')) throw new Error(`${label}: destination ${move.to} was not visibly offered as legal (${targetLabel})`);
    await measure(`${label} target ${move.to}`, to);
    if (keyboard) { await to.focus(); await to.press('Enter'); } else await to.click();
  };
  const waitForHumanTurn = async (humanColor, timeout = 5000) => {
    const text = `${humanColor === 'white' ? 'White' : 'Black'} to move`;
    await page.waitForFunction(expected => document.querySelector('.chess-match-status strong')?.textContent.includes(expected), text, { timeout });
  };
  const activeBoard = () => page.locator('.chess-play-board[role="grid"]');
  const clickMeasured = async (label, locator, minimum = 44) => { const geometry = await measure(label, locator, minimum); await locator.click(); return geometry; };
  const clickNavigation = async (label, locator) => {
    await locator.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
    await locator.waitFor({ state: 'visible', timeout: 5000 });
    return clickMeasured(label, locator);
  };
  const captureVisibleMoveList = async label => {
    const toggle = page.getByRole('button', { name: 'Moves', exact: true });
    await toggle.scrollIntoViewIfNeeded();
    await measure(`${label} open saved move list`, toggle);
    await toggle.click();
    const items = await page.locator('.chess-move-list li').allInnerTexts();
    if (!items.length) throw new Error(`${label} saved move list was not visible or contained no moves.`);
    await measure(`${label} close saved move list`, toggle);
    await toggle.click();
    rows.push({ kind: 'visible-move-list', label, items });
    return items;
  };
  const chooseAmariIfPrompted = async () => {
    const card = page.locator('.discovery-intro-card--amari');
    if (!await card.count() || !await card.isVisible()) return false;
    const age = (await card.locator('.discovery-intro-age').innerText()).trim();
    if (age !== 'Age 6+') throw new Error(`Amari chooser did not identify the Age 6+ profile: ${age}`);
    await clickNavigation('Choose Amari (Age 6+) after app reload', card);
    await page.getByRole('heading', { name: 'Hi Amari!', exact: true }).waitFor({ timeout: 10000 });
    rows.push({ kind: 'normal-player-selection', player: 'amari', ageLabel: age });
    return true;
  };
  const effectiveRewardState = async () => {
    const canonical = await json(REWARD_KEY) || {};
    const pointMirror = await json(REWARD_MIRRORS[0]);
    const gameMirror = await json(REWARD_MIRRORS[1]);
    const stickerMirror = await json(REWARD_MIRRORS[2]);
    const gamesPlayed = { ...(canonical.gamesPlayed || {}) };
    for (const [id, count] of Object.entries(gameMirror || {})) gamesPlayed[id] = Math.max(gamesPlayed[id] || 0, count || 0);
    const earnedStickerIds = [...new Set([...(canonical.earnedStickerIds || []), ...(stickerMirror || [])])];
    return {
      points: Math.max(canonical.points || 0, pointMirror || 0),
      gamesPlayed,
      earnedStickerIds,
      rewardClaims: canonical.rewardClaims || {},
      canonical,
      mirrors: { points: pointMirror, gamesPlayed: gameMirror, earnedStickerIds: stickerMirror },
    };
  };
  const stableValue = value => Array.isArray(value) ? value.map(stableValue)
    : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stableValue(value[key])]))
      : value;
  const sameJson = (left, right) => JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right));
  const withoutGame = (record, game) => Object.fromEntries(Object.entries(record || {}).filter(([key]) => key !== game).sort(([a], [b]) => a.localeCompare(b)));
  const isChessClaimKey = key => key.startsWith('chess:') || key.startsWith('dino:chess:');
  const normalizedChessClaims = record => {
    const normalized = {};
    for (const [key, value] of Object.entries(record || {})) {
      if (!isChessClaimKey(key)) continue;
      const id = key.startsWith('dino:chess:') ? key.slice('dino:chess:'.length) : key.slice('chess:'.length);
      if (Object.prototype.hasOwnProperty.call(normalized, id) && normalized[id] !== value) throw new Error(`Conflicting legacy/current Chess reward aliases for ${id}`);
      normalized[id] = value;
    }
    return Object.fromEntries(Object.entries(normalized).sort(([a], [b]) => a.localeCompare(b)));
  };
  const chessClaimValue = (record, id) => record?.[`dino:chess:${id}`] ?? record?.[`chess:${id}`] ?? null;
  const withoutChessClaims = record => Object.fromEntries(Object.entries(record || {}).filter(([key]) => !isChessClaimKey(key)).sort(([a], [b]) => a.localeCompare(b)));
  const enterChessMenu = async () => {
    const chessHeading = page.locator('h1').filter({ hasText: 'Chess Explorers' }).first();
    if (await chessHeading.count() && await chessHeading.isVisible()) return;
    const worldHeading = page.getByRole('heading', { name: 'Choose a world', exact: true });
    if (await worldHeading.count() && await worldHeading.isVisible()) {
      const thinking = page.locator('.discovery-world-card').filter({ hasText: 'Thinking & Play' }).first();
      await clickNavigation('Thinking & Play world', thinking);
    }
    const gameCard = page.locator('.catalogue-game-card').filter({ hasText: 'Chess Explorers' }).first();
    await gameCard.waitFor({ timeout: 12000 });
    await clickNavigation('Chess Explorers catalogue card', gameCard);
    await page.getByRole('heading', { name: /Chess Explorers/ }).waitFor({ timeout: 10000 });
  };
  const openFullGame = async () => {
    if (await activeBoard().count() && await activeBoard().isVisible()) return;
    await enterChessMenu();
    const fullGame = page.getByRole('button', { name: /Play a full game vs computer/ });
    await clickMeasured('Play full game vs computer', fullGame);
    await page.waitForFunction(() => Boolean(document.querySelector('.chess-play-board')
      || [...document.querySelectorAll('button')].some(button => button.textContent.trim() === 'Beginner' && button.offsetParent !== null)), null, { timeout: 10000 });
    if (!await activeBoard().count() || !await activeBoard().isVisible()) {
      await page.getByRole('heading', { name: /Chess vs computer/ }).waitFor({ timeout: 10000 });
      await page.getByRole('button', { name: 'Beginner', exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    }
  };
  const setChoices = async (difficulty, humanColor) => {
    const difficultyButton = page.getByRole('button', { name: difficulty === 'beginner' ? 'Beginner' : difficulty === 'growing' ? 'Growing' : 'Challenge', exact: true });
    const colorButton = page.getByRole('button', { name: `Play ${humanColor}`, exact: true });
    await difficultyButton.waitFor({ state: 'visible', timeout: 10000 });
    await colorButton.waitFor({ state: 'visible', timeout: 10000 });
    await clickMeasured(`Select ${difficulty} difficulty`, difficultyButton);
    await clickMeasured(`Select human ${humanColor}`, colorButton);
  };
  const resumeWithMismatchedSelectors = async ({ label, savedColor, chooseColor, chooseDifficulty }) => {
    await page.reload(); await assertRuntime(); await chooseAmariIfPrompted(); await openFullGame();
    if (await activeBoard().count() && await activeBoard().isVisible()) {
      await clickMeasured(`${label}: open New Game confirmation`, page.getByRole('button', { name: 'New game', exact: true }));
      const dialog = page.getByRole('alertdialog', { name: 'Start a new game?' });
      await clickMeasured(`${label}: keep saved match`, dialog.getByRole('button', { name: 'Keep saved game', exact: true }));
    }
    const saved = await json(CHESS_KEY);
    if (!saved?.match || saved.match.result || saved.match.humanColor !== savedColor) throw new Error(`${label}: expected the existing unfinished ${savedColor} game before changing selectors.`);
    const savedMatch = { ...saved.match };
    await setChoices(chooseDifficulty, chooseColor);
    const selectedDifficulty = page.getByRole('button', { name: chooseDifficulty === 'beginner' ? 'Beginner' : chooseDifficulty === 'growing' ? 'Growing' : 'Challenge', exact: true });
    const selectedColor = page.getByRole('button', { name: `Play ${chooseColor}`, exact: true });
    if (await selectedDifficulty.getAttribute('aria-pressed') !== 'true' || await selectedColor.getAttribute('aria-pressed') !== 'true') {
      throw new Error(`${label}: requested selector mismatch did not become active before Resume.`);
    }
    const resume = page.getByRole('button', { name: 'Resume saved game', exact: true });
    await clickMeasured(`${label}: resume saved game after changing selectors`, resume);
    await activeBoard().waitFor({ timeout: 10000 });
    await assertBoardGeometry(`${label}: resumed board`);
    await assertRenderedPosition(savedMatch.fen, `${label}: saved board restored`);
    const boardLabel = await activeBoard().getAttribute('aria-label');
    const resumedDifficulty = (await page.locator('.chess-header-level').innerText()).trim().toLowerCase();
    const expectedOrientation = `Chess board. ${savedMatch.humanColor === 'white' ? 'White' : 'Black'} at bottom`;
    if (boardLabel !== expectedOrientation || resumedDifficulty !== savedMatch.difficulty) {
      throw new Error(`${label}: Resume retained selector state instead of the saved configuration: ${JSON.stringify({ boardLabel, resumedDifficulty, savedColor: savedMatch.humanColor, savedDifficulty: savedMatch.difficulty })}`);
    }
    await waitForHumanTurn(savedMatch.humanColor, 7000);
    rows.push({ kind: 'resume-restores-saved-settings', label, matchId: savedMatch.id, savedColor: savedMatch.humanColor, chosenColor: chooseColor, resumedColor: savedMatch.humanColor, savedDifficulty: savedMatch.difficulty, chosenDifficulty: chooseDifficulty, resumedDifficulty, savedPlyCount: savedMatch.history.length, boardMatchesSavedPosition: true });
    return saved;
  };
  const confirmStart = async () => {
    const start = page.getByRole('button', { name: /^(Start game|New game)$/ }).first();
    await clickMeasured('Start or replace game', start);
    const dialog = page.getByRole('alertdialog', { name: 'Start a new game?' });
    if (await dialog.count() && await dialog.isVisible()) {
      const confirm = dialog.getByRole('button', { name: 'Start new game', exact: true });
      await clickMeasured('Confirm new game', confirm);
    }
    await activeBoard().waitFor({ timeout: 10000 });
    await assertBoardGeometry('new-game board');
  };
  const prepareNewConfig = async (difficulty, humanColor) => {
    if (await activeBoard().count() && await activeBoard().isVisible()) {
      const newGame = page.getByRole('button', { name: 'New game', exact: true });
      await clickMeasured('Open New Game confirmation', newGame);
      const dialog = page.getByRole('alertdialog', { name: 'Start a new game?' });
      const keep = dialog.getByRole('button', { name: 'Keep saved game', exact: true });
      await clickMeasured('Keep saved game before selecting a new setup', keep);
    }
    await setChoices(difficulty, humanColor);
    await confirmStart();
  };
  const completeOpeningCase = async (item, index) => {
    await prepareNewConfig(item.difficulty, item.humanColor);
    await page.getByRole('status').waitFor({ timeout: 10000 });
    for (let stepIndex = 0; stepIndex < item.sequence.length; stepIndex += 1) {
      const step = item.sequence[stepIndex];
      if (step.side === 'human') {
        if (index === 0 && stepIndex === 0) {
          const beforePosition = await readRenderedPosition();
          const beforeChess = await raw(CHESS_KEY), beforeReward = await raw(REWARD_KEY);
          const e2 = square('e2'), e5 = square('e5');
          await measure('illegal-move source e2', e2); await e2.click();
          await measure('illegal-move target e5', e5);
          const label = await e5.getAttribute('aria-label');
          if (label?.includes('legal move') || label?.includes('legal capture')) throw new Error('e2-e5 was incorrectly highlighted legal.');
          await e5.click();
          const feedback = await page.locator('.chess-live-message').innerText();
          if (!/not legal/i.test(feedback)) throw new Error(`Illegal-move retry feedback missing: ${feedback}`);
          const afterPosition = await readRenderedPosition();
          if (JSON.stringify(beforePosition) !== JSON.stringify(afterPosition) || beforeChess !== await raw(CHESS_KEY) || beforeReward !== await raw(REWARD_KEY)) throw new Error('The illegal move changed the board or saved progress/reward.');
          rows.push({ kind: 'illegal-move-retry', from: 'e2', attempted: 'e5', feedback, boardUnchanged: true, progressUnchanged: true, rewardUnchanged: true });
          await e2.click(); // Clear the source selection after the invalid attempt.
          await moveThroughBoard(step.move, { keyboard: true, label: 'keyboard move' });
        } else await moveThroughBoard(step.move, { label: `${item.difficulty}/${item.humanColor} move` });
        await verifyPlanState(step, `opening case ${item.difficulty}/${item.humanColor} ply ${stepIndex + 1}`, item.difficulty);
        if (step.status.gameOver) continue;
        const next = item.sequence[stepIndex + 1];
        if (next?.side === 'computer' && item.difficulty === 'challenge' && item.humanColor === 'black') {
          await page.waitForFunction(() => document.querySelector('.chess-match-status strong')?.textContent.includes('Computer thinking'), null, { timeout: 5000 });
            const beforeSaved = await json(CHESS_KEY);
            const beforeMatch = beforeSaved?.match;
            const visibleBeforeLeave = await assertSavedBoardMatchesVisible('Challenge Black position before leaving during computer thinking');
            if (!beforeMatch || visibleBeforeLeave.fen !== beforeMatch.fen) throw new Error('Saved Challenge position changed before leave was requested.');
            const leave = page.getByRole('button', { name: 'Lessons', exact: true });
            await clickMeasured('Leave while computer thinks', leave);
            await page.getByRole('heading', { name: /Chess Explorers/ }).waitFor({ timeout: 10000 });
            await wait(1400);
            const afterSaved = await json(CHESS_KEY);
            const active = afterSaved?.match;
            if (!active || active.fen !== beforeMatch.fen || JSON.stringify(active.history) !== JSON.stringify(beforeMatch.history)) throw new Error(`A stale computer result changed the saved board after leaving: before ${beforeMatch?.fen || 'no match'}, after ${active?.fen || 'no match'}`);
            rows.push({ kind: 'computer-cancel-on-leave', difficulty: item.difficulty, humanColor: item.humanColor, observedThinking: true, savedBefore: beforeSaved?.match?.fen || null, savedAfter: active.fen, staleMoveCommitted: false });
            completedOpeningCases.push({ difficulty: item.difficulty, humanColor: item.humanColor, plies: stepIndex + 1, interruptedDuringComputerTurn: true, finalSavedFen: active.fen, history: beforeMatch.history });
            return { leftDuringComputer: true };
        }
      } else {
        await waitForHumanTurn(item.humanColor);
        await verifyPlanState(step, `computer reply ${item.difficulty}/${item.humanColor} ply ${stepIndex + 1}`, item.difficulty);
      }
    }
    const visibleMoves = await captureVisibleMoveList(`${item.difficulty}/${item.humanColor}`);
    const saved = await json(CHESS_KEY);
    if (!saved?.match || saved.match.history.length !== item.sequence.length) throw new Error(`Saved move count differs after ${item.difficulty}/${item.humanColor} opening`);
    completedOpeningCases.push({ difficulty: item.difficulty, humanColor: item.humanColor, plies: saved.match.history.length, fen: saved.match.fen, history: saved.match.history, visibleMoves });
    if (index === 0) {
      const resumed = await resumeWithMismatchedSelectors({ label: 'saved White game', savedColor: 'white', chooseColor: 'black', chooseDifficulty: 'challenge' });
      await assertRenderedPosition(item.sequence.at(-1).fen, 'resumed opening position');
      rows.push({ kind: 'reload-resume', difficulty: item.difficulty, humanColor: item.humanColor, moves: saved.match.history.length, restoredVisibleBoard: true });

      const newGame = page.getByRole('button', { name: 'New game', exact: true });
      await clickMeasured('Open replacement confirmation', newGame);
      const dialog = page.getByRole('alertdialog', { name: 'Start a new game?' });
      await clickMeasured('Keep saved game after cancel', dialog.getByRole('button', { name: 'Keep saved game', exact: true }));
      await clickMeasured('Resume after canceled replacement', page.getByRole('button', { name: 'Resume saved game', exact: true }));
      await assertRenderedPosition(item.sequence.at(-1).fen, 'board preserved after canceling New Game');
      await clickMeasured('Undo one human/computer turn', page.getByRole('button', { name: 'Undo turn', exact: true }));
      await assertRenderedPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', 'undo restored the starting position');
      const undone = await json(CHESS_KEY);
      if (undone.match.history.length !== 0) throw new Error('Undo did not remove the White move and computer reply as one pair.');
      rows.push({ kind: 'undo-white', restoredPlyCount: undone.match.history.length, fen: undone.match.fen });
      if (resumed.match.id !== saved.match.id) throw new Error('Resume changed the saved White game identity.');
    }
    if (index === 1 && item.humanColor === 'black') {
      await resumeWithMismatchedSelectors({ label: 'saved Black game', savedColor: 'black', chooseColor: 'white', chooseDifficulty: 'challenge' });
    }
    if (item.humanColor === 'black' && item.difficulty === 'beginner') {
      const undo = page.getByRole('button', { name: 'Undo turn', exact: true });
      await clickMeasured('Undo Black human/computer turn', undo);
      const expectedOpening = item.sequence[0].fen;
      await assertRenderedPosition(expectedOpening, 'Black undo retained the computer opening');
      const undone = await json(CHESS_KEY);
      if (undone.match.history.length !== 1) throw new Error(`Black undo should retain only the computer opening, got ${undone.match.history.length} plies`);
      rows.push({ kind: 'undo-black', restoredPlyCount: 1, fen: undone.match.fen });
    }
    return { leftDuringComputer: false };
  };
  const storageFault = async (method, target, behavior) => {
    const result = await page.evaluate(({ methodName, targetKey, type }) => {
      const store = window.localStorage;
      const descriptors = Object.fromEntries(['setItem', 'getItem'].map(name => [name, Object.getOwnPropertyDescriptor(store, name)]));
      const originals = Object.fromEntries(['setItem', 'getItem'].map(name => [name, store[name]]));
      const original = originals[methodName];
      if (typeof original !== 'function') return { ok: false, error: 'storage method unavailable' };
      let fired = false, wroteTarget = false;
      const targetMatches = key => String(key) === targetKey || String(key).endsWith(targetKey) || String(key).includes(targetKey);
      const restore = () => {
        for (const name of methodName === 'getItem' && type === 'readback' ? ['setItem', 'getItem'] : [methodName]) {
          try { if (descriptors[name]) Object.defineProperty(store, name, descriptors[name]); else delete store[name]; } catch {}
          if (store[name] !== originals[name]) {
            try { const prototype = Object.getPrototypeOf(store); if (prototype?.[name]) prototype[name] = prototype[name].__chessOriginal || prototype[name]; } catch {}
          }
        }
      };
      const replacementFor = name => function (...args) {
        const key = args[0], originalMethod = originals[name];
        if (type === 'readback' && methodName === 'getItem' && name === 'setItem' && targetMatches(key)) {
          const response = originalMethod.apply(store, args); wroteTarget = true; return response;
        }
        if (!fired && name === methodName && targetMatches(key) && (type !== 'readback' || (name === 'getItem' && wroteTarget))) {
          fired = true; restore();
          window.__chessNativeFaults = window.__chessNativeFaults || [];
          window.__chessNativeFaults.push({ type, methodName, targetKey, fired: true });
          if (type === 'readback') throw new DOMException('QA readback fault', 'SecurityError');
          throw new DOMException('QA one-write fault', 'QuotaExceededError');
        }
        return originalMethod.apply(store, args);
      };
      const targets = methodName === 'getItem' && type === 'readback' ? ['setItem', 'getItem'] : [methodName];
      try { for (const name of targets) Object.defineProperty(store, name, { configurable: true, writable: true, value: replacementFor(name) }); }
      catch { return { ok: false, error: 'Could not install one-operation storage fault on this retained namespace wrapper.' }; }
      if (targets.some(name => store[name] === originals[name])) return { ok: false, error: 'Storage wrapper did not retain the one-operation fault.' };
      window.__chessNativeFaultRestore = restore;
      return { ok: true, methodName, targetKey, type };
    }, { methodName: method, targetKey: target, type: behavior });
    activeFault = result.ok ? { target, method, behavior } : null;
    rows.push({ kind: 'storage-fault-armed', ...result });
    return result;
  };
  const restoreFault = async () => {
    if (!activeFault) return;
    await page.evaluate(() => window.__chessNativeFaultRestore?.());
    activeFault = null;
  };
  const waitForRetryButton = async name => {
    const button = page.getByRole('button', { name, exact: true });
    await button.waitFor({ timeout: 10000 });
    await measure(name, button);
    return button;
  };
  const retryAndWaitForTurn = async (humanColor, label) => {
    const retry = await waitForRetryButton('Retry save');
    const before = await json(CHESS_KEY), rewardBefore = await raw(REWARD_KEY);
    await retry.click();
    await waitForHumanTurn(humanColor, 7000);
    const after = await json(CHESS_KEY);
    rows.push({ kind: label, retryWorked: true, beforePlyCount: before?.match?.history?.length ?? null, afterPlyCount: after?.match?.history?.length ?? null, rewardRawUnchanged: rewardBefore === await raw(REWARD_KEY) });
  };

  let baseline = null, lessonBaseline = null, initialProgress = null, initialReward = null;
  try {
    await page.setViewportSize({ width: WIDTH, height: HEIGHT });
    await page.goto(`${ORIGIN}/?qa_chess_native=${Date.now()}#/`);
    await assertRuntime();
    await chooseAmariIfPrompted();
    if (await page.getByRole('heading', { name: 'Hi Askia!', exact: true }).count()) throw new Error('Chess native protocol requires the existing Amari profile, but Askia is active. Do not switch profiles for the run.');
    baseline = await hashSnapshot();
    lessonBaseline = await raw(LESSON_KEY);
    initialProgress = await json(CHESS_KEY);
    initialReward = await effectiveRewardState();
    const entryProgress = initialProgress || { rewardedDifficulties: [], completionReceipts: [] };
    rows.push({ kind: 'baseline', entryIdentity, viewport: VIEW, chessRecordPresent: initialProgress !== null, rewardedDifficulties: entryProgress.rewardedDifficulties || [], priorReceiptCount: entryProgress.completionReceipts?.length || 0, rewardPoints: initialReward.points, existingChessClaims: Object.keys(initialReward.rewardClaims || {}).length, protectedOtherGameCounts: withoutGame(initialReward.gamesPlayed, 'chess'), protectedOtherGameClaims: withoutChessClaims(initialReward.rewardClaims) });

    await enterChessMenu();
    await openFullGame();
    for (let index = 0; index < PLAN.openings.length; index += 1) {
      const item = PLAN.openings[index];
      const result = await completeOpeningCase(item, index);
      if (result.leftDuringComputer) {
        const back = page.getByRole('button', { name: 'Back to Thinking & Play', exact: true });
        await clickMeasured('Return from Chess Explorers to Thinking & Play', back);
        await page.getByRole('heading', { name: 'Thinking & Play', exact: true }).waitFor({ timeout: 10000 });
        await enterChessMenu();
        await openFullGame();
        break;
      }
    }

    // Full legal game: deterministic local Beginner replies to a normal Scholar's Mate plan.
    // The plan was generated offline from chess.js + this AI source; browser state is never seeded.
    const full = PLAN.scholarMate;
    await prepareNewConfig('beginner', 'white');
    const fullBaseline = { chess: await raw(CHESS_KEY), reward: await raw(REWARD_KEY), chessJson: await json(CHESS_KEY), rewardState: await effectiveRewardState() };
    const eligibleForFirstBeginnerReward = !fullBaseline.chessJson?.rewardedDifficulties?.includes('beginner');
    rows.push({ kind: 'terminal-game-start', plan: 'normal-start deterministic Beginner Scholar’s Mate', positiveRewardEligible: eligibleForFirstBeginnerReward, initialSavedPlyCount: fullBaseline.chessJson?.match?.history?.length ?? null });

    // Exercise a real write failure while saving the first legal human move.
    await storageFault('setItem', CHESS_KEY, 'write');
    const first = full[0]; await moveThroughBoard(first.move, { keyboard: true, label: 'Scholar mate first move' });
    await page.getByRole('button', { name: 'Retry save', exact: true }).waitFor({ timeout: 10000 });
    await restoreFault();
    const heldAfterWriteFailure = { chess: await raw(CHESS_KEY), reward: await raw(REWARD_KEY) };
    if (heldAfterWriteFailure.chess !== fullBaseline.chess || heldAfterWriteFailure.reward !== fullBaseline.reward) throw new Error('A blocked first-move save changed canonical progress or reward bytes before Retry.');
    rows.push({ kind: 'held-write-failure', terminalBoardNotYet: true, boardMatchesHumanMove: await assertRenderedPosition(first.fen, 'held e4 after blocked write'), savedBytesUnchanged: true, noRewardClaim: true });
    await retryAndWaitForTurn('white', 'first-move-write-retry');
    await assertRenderedPosition(full[1].fen, 'first computer reply after write Retry');

    // A successful set followed by failed readback must be recognized by the identical move retry.
    const secondHuman = full[2];
    await storageFault('getItem', CHESS_KEY, 'readback');
    await moveThroughBoard(secondHuman.move, { label: 'Scholar mate queen move' });
    await page.getByRole('button', { name: 'Retry save', exact: true }).waitFor({ timeout: 10000 });
    await restoreFault();
    const committedButUnconfirmed = await json(CHESS_KEY);
    if (committedButUnconfirmed.match?.fen !== secondHuman.fen) throw new Error('Readback-fault probe did not preserve the committed queen move in storage.');
    const retry = await waitForRetryButton('Retry save'); await retry.click();
    await waitForHumanTurn('white', 7000);
    await assertRenderedPosition(full[3].fen, 'computer reply after committed-readback Retry');
    rows.push({ kind: 'readback-recovery', visibleRetry: true, committedTargetWasPresent: true, recoveredVisibleFen: full[3].fen, aiRepliedOnce: true });

    for (let index = 4; index < full.length - 1; index += 1) {
      const step = full[index];
      if (step.side === 'human') {
        await moveThroughBoard(step.move, { label: `Scholar mate ply ${index + 1}` });
        await assertRenderedPosition(step.fen, `Scholar mate after human ply ${index + 1}`);
      } else {
        await waitForHumanTurn('white', 7000);
        await assertRenderedPosition(step.fen, `Scholar mate after computer ply ${index + 1}`);
      }
    }

    const terminal = full.at(-1);
    if (eligibleForFirstBeginnerReward) {
      const armed = await storageFault('setItem', REWARD_KEY, 'parent-write');
      rows.push({ kind: 'parent-fault-eligibility', attempted: true, armed: armed.ok, reason: armed.error || null });
      if (!armed.ok) coverageLimitations.push({ gate: 'positive-parent-retry', status: 'unavailable', reason: armed.error || 'Could not arm the one-operation reward storage failure on the retained QA namespace.' });
    }
    await moveThroughBoard(terminal.move, { label: 'Scholar mate checkmating move' });
    await page.locator('.chess-match-status strong').filter({ hasText: 'Black is checkmated. White wins.' }).waitFor({ state: 'visible', timeout: 10000 });
    await assertBoardGeometry('held checkmate board');
    await assertRenderedPosition(terminal.fen, 'held final checkmate position');
    const finalStatus = await page.locator('.chess-match-status strong').innerText();
    if (finalStatus.trim() !== 'Black is checkmated. White wins.') throw new Error(`Checkmate status is wrong: ${finalStatus}`);
    await page.waitForFunction(key => {
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || 'null');
        return parsed?.match?.status?.reason === 'checkmate' && parsed.match.result?.outcome === 'win';
      } catch { return false; }
    }, CHESS_KEY, { timeout: 12000 });
    const completedRecord = await json(CHESS_KEY);
    if (!completedRecord?.match?.result || completedRecord.match.status.reason !== 'checkmate') throw new Error('Terminal result/receipt was not durably saved.');
    let parentRetryObserved = false;
    if (eligibleForFirstBeginnerReward && activeFault) {
      const retryReward = page.getByRole('button', { name: /^(Retry reward confirmation|Retry save)$/ });
      await retryReward.waitFor({ timeout: 10000 });
      await measure('Retry parent claim', retryReward);
      const rewardUnchanged = fullBaseline.reward === await raw(REWARD_KEY);
      if (!rewardUnchanged) throw new Error('Reward storage changed during the blocked parent claim.');
      const receipt = completedRecord.completionReceipts?.find(item => item.id === completedRecord.match.id);
      if (!receipt || receipt.rewardDelta !== 1 || receipt.parentClaimed) throw new Error('The positive local receipt was not held for Retry after the parent write fault.');
      await restoreFault();
      await retryReward.click();
      await retryReward.waitFor({ state: 'detached', timeout: 10000 });
      const claimedReward = await json(REWARD_KEY);
      if (!chessClaimValue(claimedReward?.rewardClaims, receipt.id)) throw new Error('The stable Chess reward token did not persist on Retry.');
      const effectiveAfterRetry = await effectiveRewardState();
      if (effectiveAfterRetry.points !== fullBaseline.rewardState.points + 1) throw new Error(`Expected one actual point after Retry, got ${effectiveAfterRetry.points}`);
      rows.push({ kind: 'positive-parent-retry', receiptId: receipt.id, token: `dino:chess:${receipt.id}`, blockedRewardBytesPreserved: rewardUnchanged, persistedPoints: effectiveAfterRetry.points, exactlyOnePoint: true });
      parentRetryObserved = true;
    } else if (eligibleForFirstBeginnerReward) {
      const claimedReward = await json(REWARD_KEY);
      if (!chessClaimValue(claimedReward?.rewardClaims, completedRecord.match.id)
        || (await effectiveRewardState()).points !== fullBaseline.rewardState.points + 1) {
        throw new Error('Positive Beginner completion did not persist one parent reward after the fault hook was unavailable.');
      }
      rows.push({ kind: 'positive-parent-claim-fault-unavailable', receiptId: completedRecord.match.id, pointsAfter: claimedReward.points });
    } else {
      const afterReward = await effectiveRewardState();
      if (afterReward.points !== fullBaseline.rewardState.points) throw new Error('A previously rewarded Beginner replay farmed another point.');
      rows.push({ kind: 'beginner-replay-has-no-positive-receipt', pointsBefore: fullBaseline.rewardState.points, pointsAfter: afterReward.points });
    }

    const finish = page.getByRole('button', { name: 'Finish game', exact: true });
    await clickMeasured('Finish after held checkmate review', finish);
    const reviewBoard = page.getByRole('button', { name: 'Review final board', exact: true });
    await clickMeasured('Review completed final board', reviewBoard);
    await assertBoardGeometry('reviewed terminal board');
    await assertRenderedPosition(terminal.fen, 'review final board');

    // Replay the naturally completed line; difficulty completion is already recorded and points cannot farm.
    const pointsAfterFirst = (await effectiveRewardState()).points;
    await prepareNewConfig('beginner', 'white');
    for (let index = 0; index < full.length; index += 1) {
      const step = full[index];
      if (step.side === 'human') {
        await moveThroughBoard(step.move, { label: `Beginner replay ply ${index + 1}` });
        await assertRenderedPosition(step.fen, `Beginner replay after ply ${index + 1}`);
      } else {
        await waitForHumanTurn('white', 7000);
        await assertRenderedPosition(step.fen, `Beginner replay after computer ply ${index + 1}`);
      }
    }
    await page.locator('.chess-match-status strong').filter({ hasText: 'Black is checkmated. White wins.' }).waitFor({ state: 'visible', timeout: 10000 });
    const pointsAfterReplay = (await effectiveRewardState()).points;
    if (pointsAfterReplay !== pointsAfterFirst) throw new Error('Replaying Beginner Scholar’s Mate added reward points.');
    const replayedRecord = await json(CHESS_KEY);
    if (replayedRecord.completionReceipts?.length !== completedRecord.completionReceipts?.length) throw new Error('A later same-difficulty completion created another positive receipt.');
    rows.push({ kind: 'zero-farm-replay', game: 'complete Beginner Scholar’s Mate', pointsBefore: pointsAfterFirst, pointsAfter: pointsAfterReplay, receiptCountBefore: completedRecord.completionReceipts?.length || 0, receiptCountAfter: replayedRecord.completionReceipts?.length || 0 });

    const finishReplay = page.getByRole('button', { name: 'Finish game', exact: true });
    await clickMeasured('Finish replay', finishReplay);
    const lessons = page.getByRole('button', { name: 'Lessons', exact: true });
    await clickMeasured('Return to Chess Explorers lessons', lessons);
    await page.getByRole('heading', { name: /Chess Explorers/ }).waitFor({ timeout: 10000 });
    const parent = page.getByRole('button', { name: 'Back to Thinking & Play', exact: true });
    await clickMeasured('Return to the exact Thinking & Play parent', parent);
    await page.getByRole('heading', { name: 'Thinking & Play', exact: true }).waitFor({ timeout: 10000 });

    const after = await hashSnapshot();
    const storageDiff = compareSnapshots(baseline, after);
    if (storageDiff.unexpected.length) throw new Error(`Unrelated storage keys changed: ${JSON.stringify(storageDiff.unexpected)}`);
    if (lessonBaseline !== await raw(LESSON_KEY)) throw new Error('Existing Chess Explorers lesson progress changed during full-game journeys.');
    const finalProgress = await json(CHESS_KEY), finalReward = await effectiveRewardState();
    const finalReceiptCount = finalProgress?.completionReceipts?.length || 0;
    const currentBeginnerClaim = Object.keys(normalizedChessClaims(finalReward?.rewardClaims)).length;
    if (!sameJson(withoutGame(initialReward.gamesPlayed, 'chess'), withoutGame(finalReward.gamesPlayed, 'chess'))) throw new Error('A prior non-Chess game count changed during the Chess run.');
    if (!sameJson(withoutChessClaims(initialReward.rewardClaims), withoutChessClaims(finalReward.rewardClaims))) throw new Error('A prior non-Chess reward claim changed during the Chess run.');
    if (!initialReward.earnedStickerIds.every(id => finalReward.earnedStickerIds.includes(id))) throw new Error('A previously earned sticker disappeared during the Chess run.');
    const changedRewardMirrors = REWARD_MIRRORS.filter(key => storageDiff.changed.includes(key));
    const mirrorValues = { amari_points: finalReward.points, amari_games_played: finalReward.gamesPlayed, amari_earned_sticker_ids_v1: finalReward.earnedStickerIds };
    for (const key of changedRewardMirrors) {
      if (!sameJson(await json(key), mirrorValues[key])) throw new Error(`Changed reward mirror ${key} does not match the canonical reward record.`);
    }
    rows.push({ kind: 'protected-storage', allowedChanged: storageDiff.changed, unexpected: storageDiff.unexpected, lessonProgressHashUnchanged: true, priorOtherGameCountsUnchanged: true, priorOtherGameClaimsUnchanged: true, priorEarnedStickersRetained: true, changedRewardMirrorsMatchCanonical: changedRewardMirrors, finalReceipts: finalReceiptCount, chessRewardClaims: currentBeginnerClaim });
    if (providerAttempts.length || responseFailures.length || requestFailures.length || pageErrors.length || consoleErrors.length) throw new Error(`Provider/runtime/network errors: ${JSON.stringify({ providerAttempts, responseFailures, requestFailures, pageErrors, consoleErrors })}`);
    return {
      passed: coverageLimitations.length === 0, stage: __STAGE__, origin: ORIGIN, player: 'amari', viewport: VIEW, entryIdentity, namespace,
      completedOpeningCases, openingCaseCount: completedOpeningCases.length, scholarMateHumanMoves: 4, scholarMateComputerMoves: 3,
      checkmate: finalProgress?.match?.status?.reason === 'checkmate', scholarMateFen: finalProgress?.match?.fen || null,
      scholarMateHistory: finalProgress?.match?.history || [], parentRetryObserved, coverageLimitations, rows, failures, providerAttempts, responseFailures, requestFailures, pageErrors, consoleErrors, storageDiff,
    };
  } catch (error) {
    await restoreFault();
    failures.push({ message: error?.message || String(error), stack: error?.stack || null });
    try {
      screenshotPath = `${OUT}/failure-chess-${__STAGE__}-${WIDTH}x${HEIGHT}-${Date.now()}.jpg`;
      await page.screenshot({ path: screenshotPath, type: 'jpeg', quality: 60, fullPage: false });
    } catch {}
    return {
      passed: false, stage: __STAGE__, origin: ORIGIN, player: 'amari', viewport: VIEW, entryIdentity, namespace,
      completedOpeningCases, openingCaseCount: completedOpeningCases.length, rows, failures, screenshotPath,
      coverageLimitations, providerAttempts, responseFailures, requestFailures, pageErrors, consoleErrors,
    };
  } finally {
    await restoreFault();
    try { await page.unroute('**/*', providerGuard); } catch {}
    page.off('pageerror', onError); page.off('console', onConsole); page.off('request', onRequest); page.off('requestfailed', onRequestFailed); page.off('response', onResponse);
  }
}
