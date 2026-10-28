async page=>{
const ORIGIN = '__ORIGIN__';
const PLAYER = '__PLAYER__';
const GAME = '__GAME__';
const WIDTH = Number('__WIDTH__');
const HEIGHT = 844;
const EXPECTED_ENTRY = '__EXPECTED_ENTRY__';
const EXPECTED_LEVELS = GAME === 'rocketbuilder'
  ? [
    [['nose'], ['nose', 'fins']],
    [['nose', 'fins'], ['nose', 'window', 'fins']],
    [['nose', 'window', 'fins'], ['nose', 'window', 'fins', 'flame'], ['nose', 'window', 'fins', 'flame']],
    [['nose', 'window', 'fins', 'flame'], ['nose', 'window', 'fins', 'flame'], ['body', 'nose', 'window', 'fins', 'flame']],
    [['body', 'nose', 'window', 'fins', 'flame'], ['body', 'nose', 'window', 'fins', 'flame'], ['body', 'nose', 'window', 'fins', 'flame']],
  ]
  : [3, 4, 5, 5, 5];
const ROCKET_DROP_ZONES = {
  nose: [78, 20, 44, 60], window: [85, 118, 30, 30], body: [84, 165, 32, 47],
  fins: [18, 188, 48, 48], flame: [82, 256, 36, 32],
};
const ROCKET_AUTHORED_CENTERS = { body: [100, 152], nose: [100, 54], window: [100, 136], fins: [100, 202], flame: [100, 256] };
const screenshots = {
  rocketbuilder: `/Users/omosanya_main/Documents/Codex/2026-09-26/x20-time-detectives-now-uses-clearer/work/dinospace-b7-memory-cumulative-20261006/docs/qa-evidence/rocket-fuel-20261028/native-rocket-level5-${PLAYER}-${WIDTH}.png`,
  rocketFinished: `/Users/omosanya_main/Documents/Codex/2026-09-26/x20-time-detectives-now-uses-clearer/work/dinospace-b7-memory-cumulative-20261006/docs/qa-evidence/rocket-fuel-20261028/native-rocket-finished-${PLAYER}-${WIDTH}.png`,
  fuelup: `/Users/omosanya_main/Documents/Codex/2026-09-26/x20-time-detectives-now-uses-clearer/work/dinospace-b7-memory-cumulative-20261006/docs/qa-evidence/rocket-fuel-20261028/native-fuel-level5-${PLAYER}-${WIDTH}.png`,
};
const progressKey = `${PLAYER}_little_progress`;
const rewardKey = `${PLAYER}_rewards_v2`;
const otherPlayer = PLAYER === 'askia' ? 'amari' : 'askia';
const otherProgressKey = `${otherPlayer}_little_progress`;
const otherRewardKey = `${otherPlayer}_rewards_v2`;
const rows = [];
const completedLevelRuns = [];
const failures = [];
const providerRequests = [];
const failedResources = [];
const pageErrors = [];
const consoleErrors = [];
const omittedLevelFive = [];
let faultInjected = false;
let screenshotTaken = false;
let baseline = null;
let mediaEvents = [];
let entryIdentity = null;
let soundWasOn = null;
let startingGameRecord = null;
let startingLegacyRewardThrough = -1;
const levelBestHistory = {};
const onPageError = (error) => pageErrors.push(error.message);
const onConsole = (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); };
const onRequest = (request) => { if (/\/api\//.test(request.url())) providerRequests.push(request.url()); };
const onResponse = (response) => {
  if (response.status() >= 400 && !/\/api\//.test(response.url())) failedResources.push({ status: response.status(), url: response.url() });
};
page.on('pageerror', onPageError);
page.on('console', onConsole);
page.on('request', onRequest);
page.on('response', onResponse);

const readLocalRecord = async (key) => page.evaluate((storageKey) => {
  try { return JSON.parse(window.localStorage.getItem(storageKey) || 'null'); } catch { return null; }
}, key);
const mediaTracker = () => {
  if (window.__pair5DirectMediaV2) return;
  window.__pair5DirectMediaV2 = true;
  window.__pair5MediaEventsV2 = [];
  const originalPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (...args) {
    for (const type of ['play', 'playing', 'timeupdate', 'pause', 'ended', 'error']) {
      this.addEventListener(type, () => window.__pair5MediaEventsV2.push({ type, src: this.currentSrc || this.src || '' }), { once: true });
    }
    return originalPlay.apply(this, args);
  };
};
const waitForRound = async (value) => page.waitForFunction((expected) => (
  Number(document.querySelector('[aria-label="Rounds done"]')?.getAttribute('aria-valuenow')) === expected
), value, { timeout: 12000 });
const checkRenderedAssets = async () => page.evaluate(async () => {
  const imageResults = await Promise.all([...document.images].map(async (image) => {
    try { await image.decode(); return { src: image.currentSrc, ok: image.naturalWidth > 0 && image.naturalHeight > 0 }; }
    catch { return { src: image.currentSrc || image.src, ok: false }; }
  }));
  const spriteUrls = [...new Set([...document.querySelectorAll('svg image')].map((node) => node.href?.baseVal).filter(Boolean))];
  const spriteResults = await Promise.all(spriteUrls.map((src) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ src, ok: image.naturalWidth > 0 && image.naturalHeight > 0 });
    image.onerror = () => resolve({ src, ok: false });
    image.src = src;
    if (image.complete) resolve({ src, ok: image.naturalWidth > 0 && image.naturalHeight > 0 });
  })));
  return { images: imageResults, sprites: spriteResults };
});
const enterGame = async () => {
  await page.addInitScript(mediaTracker);
  await page.goto(`${ORIGIN}/?qa_pair5=${PLAYER}-${GAME}-${WIDTH}#/`);
  const namespaced = await page.evaluate(() => window.__amariQaNamespaced === true);
  if (!namespaced) throw new Error('Retained-profile storage namespace guard is missing');
  const ageButton = page.getByRole('button', { name: PLAYER === 'askia' ? /Age 3\+.*Askia/ : /Age 6\+.*Amari/ });
  let chooserVisible = false;
  try { await ageButton.waitFor({ state: 'visible', timeout: 2500 }); chooserVisible = true; } catch {}
  if (chooserVisible) await ageButton.click();
  else {
    await page.getByRole('heading', { name: 'Choose a world', exact: true }).waitFor({ timeout: 10000 });
    const current = page.getByRole('button', { name: /is playing.*(?:Change player|Tap to change player)/ });
    await current.waitFor({ timeout: 10000 });
    if (await current.count()) {
      const name = await current.getAttribute('aria-label');
      if (!name?.toLowerCase().includes(PLAYER)) {
        await current.click();
        await page.getByRole('button', { name: PLAYER === 'askia' ? /Age 3\+.*Askia/ : /Age 6\+.*Amari/ }).click();
      }
    }
  }
  await page.getByRole('heading', { name: 'Choose a world', exact: true }).waitFor({ timeout: 10000 });
  const currentSoundOn = Boolean(await page.getByRole('button', { name: 'Turn sound off', exact: true }).count());
  if (soundWasOn === null) soundWasOn = currentSoundOn;
  if (!currentSoundOn) await page.getByRole('button', { name: 'Turn sound on', exact: true }).click();
  const title = GAME === 'rocketbuilder' ? 'Rocket Builder' : 'Fuel Up';
  if (PLAYER === 'askia') {
    const world = page.getByRole('heading', { name: 'Rocket World', exact: true });
    await world.waitFor();
    await page.getByRole('button', { name: `Play ${title}`, exact: true }).click();
  } else {
    const world = GAME === 'rocketbuilder' ? 'Creative Lab' : 'Maths Missions';
    await page.locator('.discovery-world-card').filter({ hasText: world }).click();
    await page.locator('.catalogue-game-card').filter({ hasText: title }).click();
  }
  await page.getByRole('button', { name: `Play ${title}` }).waitFor();
};
const probeFuelLeaveCancellation = async (levelIndex) => {
  const beforeProgress = await readLocalRecord(progressKey);
  const beforeRewards = await readLocalRecord(rewardKey);
  await startSelectedLevel(levelIndex);
  const prompt = page.getByRole('button', { name: /Hear again: put \d+ in the rocket/ });
  await prompt.waitFor();
  const beforeMedia = await page.evaluate(() => window.__pair5MediaEventsV2?.length || 0);
  await prompt.click();
  await page.waitForFunction((before) => window.__pair5MediaEventsV2?.slice(before).some((event) => event.type === 'playing' || event.type === 'play'), beforeMedia, { timeout: 6000 });
  await page.getByRole('button', { name: 'Go home', exact: true }).click();
  let leaveBranch = 'direct home navigation';
  const leaveDialog = page.getByRole('heading', { name: 'Leave the game?', exact: true });
  try {
    await leaveDialog.waitFor({ state: 'visible', timeout: 1200 });
    leaveBranch = 'Leave the game confirmation → Back to home';
    await page.getByRole('button', { name: 'Back to home', exact: true }).click();
  } catch {}
  await page.getByRole('heading', { name: 'Hi Askia!', exact: true }).waitFor({ timeout: 10000 });
  await page.getByRole('heading', { name: 'Choose a world', exact: true }).waitFor({ timeout: 10000 });
  await page.waitForFunction((before) => window.__pair5MediaEventsV2?.slice(before).some((event) => event.type === 'pause' || event.type === 'ended'), beforeMedia, { timeout: 5000 });
  const afterProgress = await readLocalRecord(progressKey);
  const afterRewards = await readLocalRecord(rewardKey);
  if (JSON.stringify(beforeProgress) !== JSON.stringify(afterProgress)) throw new Error('Leaving Fuel before completion changed the saved progress record');
  if (JSON.stringify(beforeRewards) !== JSON.stringify(afterRewards)) throw new Error('Leaving Fuel before completion changed saved rewards');
  mediaEvents = await page.evaluate(() => window.__pair5MediaEventsV2 || []);
  rows.push({ game: GAME, player: PLAYER, level: levelIndex + 1, leaveBranch, parentRoute: page.url(), audioLeaveCancellation: 'normal home navigation paused or ended the packaged prompt; incomplete round left progress/rewards unchanged' });
  await enterGame();
};
const selectedLevel = async (levelIndex) => {
  const selector = page.getByRole('button', { name: `Practice level ${levelIndex + 1}`, exact: true });
  await selector.waitFor();
  if ((await selector.getAttribute('aria-pressed')) !== 'true') await selector.click();
  const state = await selector.getAttribute('aria-pressed');
  if (state !== 'true') throw new Error(`Level ${levelIndex + 1} was not selected`);
};
const startSelectedLevel = async (levelIndex) => {
  await selectedLevel(levelIndex);
  const title = GAME === 'rocketbuilder' ? 'Rocket Builder' : 'Fuel Up';
  const startTitle = page.getByRole('button', { name: `Play ${title}`, exact: true });
  if (await startTitle.count()) {
    await startTitle.click();
    return;
  }
  await page.getByRole('button', { name: new RegExp(`^(Play|Next) level ${levelIndex + 1}$`) }).click();
};
const rocketTargetName = (part) => ({
  body: 'rocket body', nose: 'nose cone', window: 'window', fins: 'left fin', flame: 'engine flame',
})[part];
const pointerTarget = async (part, { authoredCenter = false } = {}) => page.locator('svg[aria-label="Your rocket assembly outline"]').evaluate((svg, target) => {
  const rect = svg.getBoundingClientRect();
  const [x, y] = target.authoredCenter ? target.center : target.zone.slice(0, 2).map((value, index) => value + target.zone[index + 2] / 2);
  return { x: rect.left + (x / 200) * rect.width, y: rect.top + (y / 300) * rect.height };
}, { authoredCenter, center: ROCKET_AUTHORED_CENTERS[part], zone: ROCKET_DROP_ZONES[part] });
const dragRocketPart = async (piece, part, options = {}) => {
  const source = await piece.boundingBox();
  const target = await pointerTarget(part, options);
  if (!source || !target) throw new Error(`Rocket pointer bounds unavailable for ${part}`);
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x, target.y, { steps: 8 });
  await page.mouse.up();
};
const dragFuelCan = async (canId) => {
  const can = page.getByRole('button', { name: `Fuel can ${canId + 1}`, exact: true });
  const source = await can.boundingBox();
  const target = await page.locator('img[alt="Rocket waiting for fuel"]').boundingBox();
  if (!source || !target) throw new Error('Fuel can or rocket drop bounds were unavailable');
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 8 });
  await page.mouse.up();
};
const placeRocketPart = async (part, { injectWrong = false, mode = 'keyboard', authoredCenter = false, level = null } = {}) => {
  const label = ({ body: 'rocket body', nose: 'nose cone', window: 'window', fins: 'fins', flame: 'engine flame' })[part];
  const piece = page.getByRole('button', { name: `Rocket ${label}`, exact: true });
  await piece.waitFor();
  if (injectWrong) {
    await piece.focus();
    await piece.press('Enter');
    const summary = page.getByText('Choose an outline target', { exact: true });
    await summary.click();
    const wrongTarget = part === 'nose' ? 'rocket body' : 'nose cone';
    await page.getByText(`Try the ${wrongTarget} target`, { exact: true }).click();
    const alert = page.getByRole('alert').filter({ hasText: label });
    await alert.waitFor({ state: 'visible' });
    if (level === 5) {
      const alertBox = await alert.boundingBox();
      const boardBox = await page.locator('div[role="presentation"]').boundingBox();
      if (!alertBox || !boardBox || alertBox.x < boardBox.x || alertBox.y < boardBox.y
        || alertBox.x + alertBox.width > boardBox.x + boardBox.width
        || alertBox.y + alertBox.height > boardBox.y + boardBox.height) {
        throw new Error(`Level 5 wrong-placement guidance is not visible inside the fixed rocket board: ${JSON.stringify({ alertBox, boardBox })}`);
      }
      if (!(await piece.count())) throw new Error('Wrong placement consumed the selected Level 5 part before the retry');
      rows.push({ level, part, heldWrongFeedback: 'readable alert remained visible inside the board with the piece still available for its correct retry', alertBox, boardBox });
    }
    if (!(await piece.count())) throw new Error('Wrong target consumed the selected part');
  }
  if (mode === 'drag') {
    await dragRocketPart(piece, part, { authoredCenter });
  } else if (mode === 'tap-outline') {
    await piece.click();
    const target = await pointerTarget(part, { authoredCenter });
    await page.mouse.click(target.x, target.y);
  } else {
    if (!injectWrong) await piece.focus();
    if (!injectWrong) await piece.press('Enter');
    const summary = page.getByText('Choose an outline target', { exact: true });
    const details = page.locator('details').filter({ has: summary });
    if (!(await details.evaluate((element) => element.open))) await summary.click();
    await page.getByText(`Try the ${rocketTargetName(part)} target`, { exact: true }).click();
  }
};
const runRocketLevel = async (levelIndex, { capture = false, faultOnFinish = false, wrongOnce = false, wrongFinalCenter = false } = {}) => {
  await startSelectedLevel(levelIndex);
  const rounds = EXPECTED_LEVELS[levelIndex];
  let beforeBlockedProgress = null;
  let beforeBlockedRewards = null;
  for (let roundIndex = 0; roundIndex < rounds.length; roundIndex += 1) {
    await waitForRound(roundIndex);
    const parts = rounds[roundIndex];
    if (levelIndex === 4 && capture && !screenshotTaken) {
      await page.getByRole('button', { name: `Rocket ${({ body: 'rocket body', nose: 'nose cone', window: 'window', fins: 'fins', flame: 'engine flame' })[parts[0]]}`, exact: true }).waitFor();
      const summary = page.getByText('Choose an outline target', { exact: true });
      await summary.click();
      const boxes = await page.evaluate(() => {
        const board = document.querySelector('div[role="presentation"]');
        const details = [...document.querySelectorAll('details')].find((element) => element.textContent.includes('Choose an outline target'));
        const tray = details?.parentElement;
        const rect = (node) => { const { x, y, width, height, right, bottom } = node.getBoundingClientRect(); return { x, y, width, height, right, bottom }; };
        return { width: innerWidth, height: innerHeight, documentWidth: document.documentElement.scrollWidth, board: board && rect(board), tray: tray && rect(tray), parts: tray?.querySelectorAll('[data-part]').length || 0, firstPart: tray?.querySelector('[data-part]') && rect(tray.querySelector('[data-part]')) };
      });
      const renderedAssets = await checkRenderedAssets();
      boxes.renderedAssets = renderedAssets;
      if ([...renderedAssets.images, ...renderedAssets.sprites].some((asset) => !asset.ok)) throw new Error(`A rendered Rocket image or sprite did not decode: ${JSON.stringify(renderedAssets)}`);
      if (boxes.documentWidth > boxes.width) throw new Error(`Level 5 Rocket layout overflows horizontally: ${JSON.stringify(boxes)}`);
      if (!boxes.board || !boxes.tray || boxes.board.right > boxes.width || boxes.tray.right > boxes.width) throw new Error(`Level 5 Rocket board or tray is outside viewport: ${JSON.stringify(boxes)}`);
      if (boxes.parts !== 5) throw new Error(`Level 5 Rocket tray did not show all 5 parts: ${JSON.stringify(boxes)}`);
      if (boxes.board.y >= boxes.height || boxes.tray.y >= boxes.height || !boxes.firstPart || boxes.firstPart.y >= boxes.height) throw new Error(`Level 5 Rocket board and at least one source part are not simultaneously reachable: ${JSON.stringify(boxes)}`);
      if (renderedAssets.sprites.length !== 5) throw new Error(`Expected all 5 illustrated Rocket sprites, observed ${renderedAssets.sprites.length}`);
      await page.screenshot({ path: screenshots.rocketbuilder, fullPage: false });
      screenshotTaken = true;
      rows.push({ level: 5, viewport: WIDTH, screenshot: screenshots.rocketbuilder, layout: boxes, stage: 'five-part board before first placement' });
      await summary.click();
    }
    if (faultOnFinish && roundIndex === rounds.length - 1 && !faultInjected) {
      beforeBlockedProgress = await readLocalRecord(progressKey);
      beforeBlockedRewards = await readLocalRecord(rewardKey);
      await page.evaluate(() => {
        const original = Storage.prototype.setItem;
        let armed = true;
        Storage.prototype.setItem = function setItemWithOneBlockedProgressWrite(key, value) {
          if (armed && String(key).includes('_little_progress')) {
            armed = false;
            throw new DOMException('simulated temporary quota failure for QA', 'QuotaExceededError');
          }
          return original.call(this, key, value);
        };
        window.__pair5RestoreStorage = () => { Storage.prototype.setItem = original; };
      });
      faultInjected = true;
    }
    for (let partIndex = 0; partIndex < parts.length; partIndex += 1) {
      const isWrong = (wrongOnce && levelIndex === 0 && roundIndex === 0 && partIndex === 0)
        || (wrongFinalCenter && levelIndex === 4 && roundIndex === 0 && parts[partIndex] === 'body');
      const authoredCenter = levelIndex === 4 && ['body', 'fins'].includes(parts[partIndex]);
      const mode = authoredCenter
        ? 'drag'
        : levelIndex === 0 && roundIndex === 0 && partIndex === 0
        ? 'drag'
        : levelIndex === 0 && roundIndex === 1 && partIndex === 0 ? 'tap-outline' : 'keyboard';
      await placeRocketPart(parts[partIndex], { injectWrong: isWrong, mode, authoredCenter, level: levelIndex + 1 });
      if (isWrong) rows.push({ level: levelIndex + 1, round: 1, wrongRetry: 'held part remained selectable; accessible wrong-target explanation shown' });
      if (mode === 'drag' || mode === 'tap-outline') rows.push({ level: levelIndex + 1, round: roundIndex + 1, part: parts[partIndex], input: authoredCenter ? 'pointer drag to whole visible ghost center' : mode, targetCenter: authoredCenter ? ROCKET_AUTHORED_CENTERS[parts[partIndex]] : null, response: 'accepted in the authored target' });
    }
    if (roundIndex + 1 < rounds.length) await waitForRound(roundIndex + 1);
    else if (faultOnFinish) {
      await page.getByRole('heading', { name: 'Your result is ready, but it is not saved yet.' }).waitFor({ timeout: 12000 });
      const heldProgress = await readLocalRecord(progressKey);
      const heldRewards = await readLocalRecord(rewardKey);
      if (JSON.stringify(heldProgress) !== JSON.stringify(beforeBlockedProgress)) throw new Error('Failed progress write changed the saved child map before Retry');
      if (JSON.stringify(heldRewards) !== JSON.stringify(beforeBlockedRewards)) throw new Error('Failed progress write awarded points before Retry');
      await page.evaluate(() => window.__pair5RestoreStorage?.());
      await page.getByRole('button', { name: 'Retry saving this result' }).click();
      await page.getByRole('heading', { name: /Well done/ }).waitFor();
      const retryProgress = await readLocalRecord(progressKey);
      const retryRewards = await readLocalRecord(rewardKey);
      const beforeGame = beforeBlockedProgress?.[GAME];
      const retryGame = retryProgress?.[GAME];
      const playsBefore = beforeGame?.plays || 0;
      const rewardBefore = beforeBlockedRewards?.points || 0;
      if (retryGame?.plays !== playsBefore + 1) throw new Error(`Retry did not commit exactly one play: ${playsBefore} -> ${retryGame?.plays}`);
      if ((retryRewards?.points || 0) - rewardBefore !== (retryGame?.pairRewardPoints || 0)) throw new Error('Reward write after Retry did not match the saved completion delta');
      rows.push({ level: levelIndex + 1, blockedWriteRetry: 'pre-Retry progress and reward snapshots unchanged; Retry saved one play and its matching reward delta' });
    } else await page.getByRole('heading', { name: /Well done/ }).waitFor({ timeout: 12000 });
  }
  const progress = await readLocalRecord(progressKey);
  const rewards = await readLocalRecord(rewardKey);
  const gameRecord = progress?.[GAME];
  const expectedSelectedLevel = gameRecord?.pairLevelUp ? levelIndex + 1 : levelIndex;
  const activeAfter = await page.getByRole('button', { name: `Practice level ${expectedSelectedLevel + 1}`, exact: true }).getAttribute('aria-pressed');
  const hadLevelBest = Object.hasOwn(levelBestHistory, levelIndex);
  const runMode = hadLevelBest ? 'replay' : (levelIndex <= startingLegacyRewardThrough ? 'untracked legacy level' : 'first tracked visit');
  rows.push({
    game: GAME, player: PLAYER, viewport: WIDTH, level: levelIndex + 1, rounds: rounds.length,
    mode: runMode,
    selectedLevelAfterResult: expectedSelectedLevel + 1, selectedCorrectly: activeAfter === 'true',
    savedHighestLevel: (gameRecord?.level ?? -1) + 1, plays: gameRecord?.plays, bestStars: gameRecord?.best,
    levelBestStars: gameRecord?.pairBestByLevel?.[levelIndex], legacyRewardThrough: gameRecord?.pairLegacyRewardThrough,
    rewardDelta: gameRecord?.pairRewardPoints, points: rewards?.points,
  });
  if (levelIndex === 4 && capture && !pageErrors.length && !failedResources.length) {
    const renderedAssets = await checkRenderedAssets();
    if ([...renderedAssets.images, ...renderedAssets.sprites].some((asset) => !asset.ok) || renderedAssets.sprites.length !== 5) {
      throw new Error(`Completed Rocket art did not decode all five illustrated parts: ${JSON.stringify(renderedAssets)}`);
    }
    await page.screenshot({ path: screenshots.rocketFinished, fullPage: false });
    rows.push({ level: 5, viewport: WIDTH, screenshot: screenshots.rocketFinished, stage: 'finished Level 5 with composed raster rocket artwork', renderedAssets });
  }
  levelBestHistory[levelIndex] = gameRecord?.pairBestByLevel?.[levelIndex] ?? gameRecord?.best ?? 0;
  completedLevelRuns.push({ game: GAME, player: PLAYER, viewport: WIDTH, level: levelIndex + 1, rounds: rounds.length, mode: runMode });
  if (activeAfter !== 'true') throw new Error(`Played level ${levelIndex + 1} did not remain selected for the next UI action`);
  if (runMode === 'replay' && gameRecord?.pairRewardPoints !== 0) throw new Error(`Replay of level ${levelIndex + 1} awarded points again`);
  if (runMode === 'untracked legacy level' && gameRecord?.pairRewardPoints !== 0) throw new Error(`Legacy level ${levelIndex + 1} replay awarded duplicate points`);
  if (runMode === 'first tracked visit' && gameRecord?.pairBestByLevel?.[levelIndex] === 3 && gameRecord?.pairRewardPoints !== 8) throw new Error(`First perfect level ${levelIndex + 1} did not award 8 points`);
};
const runFuelLevel = async (levelIndex, { capture = false, wrongOnce = false, replayAudio = false, muteCompletion = false } = {}) => {
  await startSelectedLevel(levelIndex);
  const roundCount = EXPECTED_LEVELS[levelIndex];
  const targets = [];
  let correctionDone = false;
  for (let roundIndex = 0; roundIndex < roundCount; roundIndex += 1) {
    let advancedDuringAudio = false;
    const prompt = page.getByRole('button', { name: /Hear again: put \d+ in the rocket/ });
    await prompt.waitFor();
    const label = await prompt.getAttribute('aria-label');
    const target = Number(label.match(/put (\d+) in the rocket/)[1]);
    targets.push(target);
    const countText = page.getByText(/^Count: \d+ of \d+$/);
    await countText.waitFor();
    if (muteCompletion && roundIndex === 0) {
      const soundOff = page.getByRole('button', { name: 'Turn sound off', exact: true });
      if (await soundOff.count()) await soundOff.click();
    }
    if (levelIndex === 4 && capture && !screenshotTaken) {
      const renderedAssets = await checkRenderedAssets();
      const boxes = await page.evaluate(() => {
        const prompt = document.querySelector('button[aria-label^="Hear again: put"]');
        const cans = [...document.querySelectorAll('button[aria-label^="Fuel can "]')];
        const rect = (node) => { const { x, y, width, height, right, bottom } = node.getBoundingClientRect(); return { x, y, width, height, right, bottom }; };
        return { width: innerWidth, height: innerHeight, documentWidth: document.documentElement.scrollWidth, prompt: prompt && rect(prompt), cans: cans.map(rect) };
      });
      boxes.renderedAssets = renderedAssets;
      if ([...renderedAssets.images, ...renderedAssets.sprites].some((asset) => !asset.ok)) throw new Error(`A rendered Fuel image or sprite did not decode: ${JSON.stringify(renderedAssets)}`);
      if (boxes.documentWidth > boxes.width || boxes.cans.some((box) => box.right > boxes.width || box.bottom > boxes.height)) throw new Error(`Level 5 Fuel controls overflow or are unreachable: ${JSON.stringify(boxes)}`);
      await page.screenshot({ path: screenshots.fuelup, fullPage: false });
      screenshotTaken = true;
      rows.push({ level: 5, viewport: WIDTH, screenshot: screenshots.fuelup, layout: boxes, stage: 'counting tray visible before first selection' });
    }
    let alreadyCounted = false;
    if (wrongOnce && levelIndex === 2 && !correctionDone) {
      if (PLAYER === 'askia' && roundIndex === 0) {
        await page.getByRole('button', { name: 'Fuel can 1', exact: true }).click();
        await page.getByRole('button', { name: 'Launch the rocket', exact: true }).click();
        await page.getByRole('alert').waitFor();
        if ((await countText.innerText()) !== `Count: 1 of ${target}`) throw new Error('Underfill retry did not retain the counted can');
        await page.getByRole('button', { name: 'Undo last fuel can', exact: true }).click();
        if ((await countText.innerText()) !== `Count: 0 of ${target}`) throw new Error('Undo did not restore zero after underfill');
        rows.push({ level: levelIndex + 1, round: 1, underfillRetry: 'count held with guidance; Undo restored zero before recount' });
        correctionDone = true;
      } else if (target < 5) {
        for (let canIndex = 0; canIndex <= target; canIndex += 1) await page.getByRole('button', { name: `Fuel can ${canIndex + 1}`, exact: true }).click();
        await page.getByRole('button', { name: 'Launch the rocket', exact: true }).click();
        await page.getByRole('alert').waitFor();
        if ((await countText.innerText()) !== `Count: ${target + 1} of ${target}`) throw new Error('Overfill retry did not retain the over-count');
        await page.getByRole('button', { name: 'Undo last fuel can', exact: true }).click();
        if ((await countText.innerText()) !== `Count: ${target} of ${target}`) throw new Error('Undo did not return over-count to target');
        rows.push({ level: levelIndex + 1, round: roundIndex + 1, overfillRetry: 'over-count explanation held the cans; Undo returned the count to the target' });
        correctionDone = true;
        alreadyCounted = true;
      }
    }
    let firstCanDragged = false;
    if (!alreadyCounted && levelIndex === 0 && roundIndex === 0) {
      await dragFuelCan(0);
      firstCanDragged = true;
      if ((await countText.innerText()) !== `Count: 1 of ${target}`) throw new Error('Fuel can pointer drop did not add one can');
      rows.push({ level: 1, round: 1, input: 'pointer drag', response: 'one can counted by dropping on the rocket' });
    }
    if (!alreadyCounted) for (let canIndex = firstCanDragged ? 1 : 0; canIndex < target; canIndex += 1) await page.getByRole('button', { name: `Fuel can ${canIndex + 1}`, exact: true }).click();
    if (levelIndex < 2) await page.getByRole('group', { name: 'Fuel count review' }).waitFor({ timeout: 12000 });
    else {
      await page.getByRole('button', { name: 'Launch the rocket', exact: true }).click();
      await page.getByRole('group', { name: 'Fuel count review' }).waitFor({ timeout: 12000 });
    }
    const replayNumber = page.getByRole('button', { name: /Hear the number \d+ again/ });
    if (replayAudio && roundIndex === 0) {
      await replayNumber.waitFor();
      if (muteCompletion) await page.getByRole('button', { name: 'Turn sound on', exact: true }).click();
      const beforeMedia = await page.evaluate(() => window.__pair5MediaEventsV2?.length || 0);
      await replayNumber.click();
      await page.waitForFunction((before) => window.__pair5MediaEventsV2?.slice(before).some((event) => event.type === 'playing' || event.type === 'play'), beforeMedia, { timeout: 6000 });
      await page.getByRole('button', { name: 'Turn sound off', exact: true }).click();
      await page.waitForFunction((before) => window.__pair5MediaEventsV2?.slice(before).some((event) => event.type === 'pause'), beforeMedia, { timeout: 4000 });
      await page.getByRole('button', { name: 'Turn sound on', exact: true }).click();
      const beforeNext = await page.evaluate(() => window.__pair5MediaEventsV2?.length || 0);
      await replayNumber.click();
      await page.waitForFunction((before) => window.__pair5MediaEventsV2?.slice(before).some((event) => event.type === 'playing' || event.type === 'play'), beforeNext, { timeout: 6000 });
      await page.getByRole('button', { name: roundIndex + 1 < roundCount ? 'Next round' : 'Finish game', exact: true }).click();
      await page.waitForFunction((before) => window.__pair5MediaEventsV2?.slice(before).some((event) => event.type === 'pause' || event.type === 'ended'), beforeNext, { timeout: 5000 });
      mediaEvents = await page.evaluate(() => window.__pair5MediaEventsV2 || []);
      advancedDuringAudio = true;
      rows.push({ level: levelIndex + 1, packagedNumberReplay: 'exact packaged number replay produced HTMLMediaElement playback', mute: 'pause event observed after sound toggle', nextCancellation: 'pause or ended observed on ordinary Next' });
    }
    const nextName = roundIndex + 1 < roundCount ? 'Next round' : 'Finish game';
    if (!advancedDuringAudio) await page.getByRole('button', { name: nextName, exact: true }).click();
  }
  await page.getByRole('heading', { name: /Well done/ }).waitFor({ timeout: 12000 });
  if (wrongOnce && levelIndex === 2 && !correctionDone) throw new Error('No overfill-capable Level 3 target appeared for correction verification');
  const sequence = targets;
  if (levelIndex === 4) {
    const unseen = [5, 6, 7, 8, 9, 10].filter((number) => !sequence.includes(number));
    if (unseen.length !== 1) throw new Error(`Level 5 target pool did not omit exactly one number: ${sequence}`);
    omittedLevelFive.push(unseen[0]);
  }
  const progress = await readLocalRecord(progressKey);
  const rewards = await readLocalRecord(rewardKey);
  const gameRecord = progress?.[GAME];
  const expectedSelectedLevel = gameRecord?.pairLevelUp ? levelIndex + 1 : levelIndex;
  const activeAfter = await page.getByRole('button', { name: `Practice level ${expectedSelectedLevel + 1}`, exact: true }).getAttribute('aria-pressed');
  const hadLevelBest = Object.hasOwn(levelBestHistory, levelIndex);
  const runMode = hadLevelBest ? 'replay' : (levelIndex <= startingLegacyRewardThrough ? 'untracked legacy level' : 'first tracked visit');
  rows.push({
    game: GAME, player: PLAYER, viewport: WIDTH, level: levelIndex + 1, rounds: roundCount, targets: sequence,
    mode: runMode,
    selectedLevelAfterResult: expectedSelectedLevel + 1, selectedCorrectly: activeAfter === 'true',
    savedHighestLevel: (gameRecord?.level ?? -1) + 1, plays: gameRecord?.plays, bestStars: gameRecord?.best,
    levelBestStars: gameRecord?.pairBestByLevel?.[levelIndex], legacyRewardThrough: gameRecord?.pairLegacyRewardThrough,
    rewardDelta: gameRecord?.pairRewardPoints, points: rewards?.points,
  });
  levelBestHistory[levelIndex] = gameRecord?.pairBestByLevel?.[levelIndex] ?? gameRecord?.best ?? 0;
  completedLevelRuns.push({ game: GAME, player: PLAYER, viewport: WIDTH, level: levelIndex + 1, rounds: roundCount, mode: runMode });
  if (activeAfter !== 'true') throw new Error(`Played level ${levelIndex + 1} did not remain selected for the next UI action`);
  if (runMode === 'replay' && gameRecord?.pairRewardPoints !== 0) throw new Error(`Replay of level ${levelIndex + 1} awarded points again`);
  if (runMode === 'untracked legacy level' && gameRecord?.pairRewardPoints !== 0) throw new Error(`Legacy level ${levelIndex + 1} replay awarded duplicate points`);
  if (runMode === 'first tracked visit' && gameRecord?.pairBestByLevel?.[levelIndex] === 3 && gameRecord?.pairRewardPoints !== 8) throw new Error(`First perfect level ${levelIndex + 1} did not award 8 points`);
};

try {
  await page.setViewportSize({ width: WIDTH, height: HEIGHT });
  await enterGame();
  entryIdentity = await page.evaluate(async () => {
    const markup = await (await fetch('/')).text();
    return markup.match(/src="([^"]*arcade[^"]+\.js)"/)?.[1] || null;
  });
  if (entryIdentity !== EXPECTED_ENTRY) throw new Error(`Served candidate entry mismatch: ${entryIdentity}; expected ${EXPECTED_ENTRY}`);
  const savedProgress = await readLocalRecord(progressKey);
  const otherProgress = await readLocalRecord(otherProgressKey);
  const savedRewards = await readLocalRecord(rewardKey);
  const otherRewards = await readLocalRecord(otherRewardKey);
  baseline = { currentPlayerLittleProgress: savedProgress, currentPlayerRewards: savedRewards, otherPlayer, otherPlayerLittleProgress: otherProgress, otherPlayerRewards: otherRewards, soundWasOn };
  const saved = savedProgress?.[GAME];
  startingGameRecord = saved || null;
  startingLegacyRewardThrough = Number.isInteger(saved?.pairLegacyRewardThrough)
    ? saved.pairLegacyRewardThrough
    : (saved && !saved.pairBestByLevel ? saved.level : -1);
  for (const [level, best] of Object.entries(saved?.pairBestByLevel || {})) levelBestHistory[Number(level)] = best;
  const floor = PLAYER === 'askia' ? 0 : 2;
  const savedHigh = Math.max(floor, saved?.level ?? floor);
  const levelsToRun = WIDTH === 390
    ? [...Array.from({ length: savedHigh - floor + 1 }, (_, offset) => floor + offset), ...Array.from({ length: 4 - savedHigh }, (_, offset) => savedHigh + offset + 1)]
    : Array.from({ length: 4 - floor + 1 }, (_, offset) => floor + offset);
  if (saved?.level != null && saved.level < floor) throw new Error(`Existing child record is below age floor and must not be overwritten: ${saved.level}`);
  if (PLAYER === 'amari') {
    if ((await page.getByRole('button', { name: 'Practice level 1', exact: true }).count())
      || (await page.getByRole('button', { name: 'Practice level 2', exact: true }).count())) throw new Error('Amari was offered a level below the existing age floor');
    const heading = await page.locator('main').innerText();
    if (!heading.includes(`Level ${savedHigh + 1} of 5`)) throw new Error(`Amari did not resume from the existing age-floor/highest level: ${heading.slice(0, 300)}`);
  }
  for (const levelIndex of levelsToRun) {
    if (GAME === 'rocketbuilder') {
      await runRocketLevel(levelIndex, {
        capture: PLAYER === 'askia' && levelIndex === 4,
        wrongOnce: PLAYER === 'askia' && WIDTH === 390 && levelIndex === 0,
        wrongFinalCenter: PLAYER === 'askia' && WIDTH === 390 && levelIndex === 4,
        faultOnFinish: PLAYER === 'askia' && WIDTH === 390 && levelIndex === 0,
      });
    } else {
      if (PLAYER === 'askia' && WIDTH === 1440 && levelIndex === 4) await probeFuelLeaveCancellation(levelIndex);
      await runFuelLevel(levelIndex, {
        capture: PLAYER === 'askia' && levelIndex === 4,
        wrongOnce: PLAYER === 'amari' && WIDTH === 390 && levelIndex === 2,
        replayAudio: PLAYER === 'askia' && WIDTH === 390 && levelIndex === 4,
        muteCompletion: PLAYER === 'askia' && WIDTH === 390 && levelIndex === 4,
      });
    }
    if (GAME === 'rocketbuilder' && levelIndex === 4 && PLAYER === 'askia' && WIDTH === 1440) {
      const chosen = await page.getByRole('button', { name: 'Practice level 5', exact: true }).getAttribute('aria-pressed');
      const action = await page.getByRole('button', { name: /^(Play|Next) level 5$/ }).getAttribute('aria-label');
      if (chosen !== 'true' || !/^(Play|Next) level 5$/.test(action || '')) throw new Error(`Practice selector/action label mismatch: ${chosen}/${action}`);
    }
  }
  const finalRecord = await readLocalRecord(progressKey);
  const finalOtherProgress = await readLocalRecord(otherProgressKey);
  const finalOtherRewards = await readLocalRecord(otherRewardKey);
  const nonPairChanges = Object.keys({ ...(savedProgress || {}), ...(finalRecord || {}) })
    .filter((id) => !['rocketbuilder', 'fuelup'].includes(id)
      && JSON.stringify(savedProgress?.[id] ?? null) !== JSON.stringify(finalRecord?.[id] ?? null));
  if (nonPairChanges.length) failures.push({ message: 'Unrelated little-game records changed', ids: nonPairChanges });
  const otherPairGame = GAME === 'rocketbuilder' ? 'fuelup' : 'rocketbuilder';
  if (JSON.stringify(savedProgress?.[otherPairGame] ?? null) !== JSON.stringify(finalRecord?.[otherPairGame] ?? null)) {
    failures.push({ message: `The other Pair 5 record (${otherPairGame}) changed during ${GAME}` });
  }
  if (JSON.stringify(otherProgress) !== JSON.stringify(finalOtherProgress)) failures.push({ message: `Other child ${otherPlayer} progress changed during ${PLAYER} run` });
  if (JSON.stringify(otherRewards) !== JSON.stringify(finalOtherRewards)) failures.push({ message: `Other child ${otherPlayer} rewards changed during ${PLAYER} run` });
  if (GAME === 'fuelup' && omittedLevelFive.length !== 1) throw new Error('The highest-level target rotation did not run');
  if (PLAYER === 'amari' && WIDTH === 390 && GAME === 'fuelup' && !rows.some((row) => row.overfillRetry)) throw new Error('Amari did not complete an overfill/Undo correction');
  if (GAME === 'fuelup' && WIDTH === 390) {
    if (soundWasOn === false && await page.getByRole('button', { name: 'Turn sound off', exact: true }).count()) {
      await page.getByRole('button', { name: 'Turn sound off', exact: true }).click();
    }
    await page.getByRole('main').getByRole('button', { name: 'Go home', exact: true }).click();
    if (PLAYER === 'askia') await page.getByRole('heading', { name: 'Hi Askia!', exact: true }).waitFor();
    else await page.getByRole('heading', { name: GAME === 'rocketbuilder' ? 'Creative Lab' : 'Maths Missions', exact: true }).waitFor();
    rows.push({ game: GAME, player: PLAYER, viewport: WIDTH, leftToParentBeforeReopen: true });
  }
  if (!(GAME === 'fuelup' && WIDTH === 390)) {
    if (soundWasOn === false && await page.getByRole('button', { name: 'Turn sound off', exact: true }).count()) {
      await page.getByRole('button', { name: 'Turn sound off', exact: true }).click();
    }
    await page.getByRole('main').getByRole('button', { name: 'Go home', exact: true }).click();
    if (PLAYER === 'askia') await page.getByRole('heading', { name: 'Hi Askia!', exact: true }).waitFor({ timeout: 10000 });
    else await page.getByRole('heading', { name: GAME === 'rocketbuilder' ? 'Creative Lab' : 'Maths Missions', exact: true }).waitFor({ timeout: 10000 });
    rows.push({ game: GAME, player: PLAYER, viewport: WIDTH, parentReturn: PLAYER === 'askia' ? 'Askia home' : GAME === 'rocketbuilder' ? 'Creative Lab' : 'Maths Missions' });
  }
  if (pageErrors.length || consoleErrors.length || failedResources.length || providerRequests.length) {
    failures.push({ pageErrors, consoleErrors, failedResources, providerRequests });
  }
  if (completedLevelRuns.some((run) => !rows.some((row) => row.game === run.game && row.level === run.level && row.viewport === run.viewport))) {
    failures.push({ message: 'A full level-run row was not retained' });
  }
  mediaEvents = mediaEvents.length ? mediaEvents : await page.evaluate(() => window.__pair5MediaEventsV2 || []);
} catch (error) {
  try { await page.evaluate(() => window.__pair5RestoreStorage?.()); } catch {}
  try { mediaEvents = await page.evaluate(() => window.__pair5MediaEventsV2 || []); } catch {}
  failures.push({ message: String(error?.message || error), stack: error?.stack || null });
}
page.off('pageerror', onPageError);
page.off('console', onConsole);
page.off('request', onRequest);
page.off('response', onResponse);
return {
  passed: failures.length === 0,
  origin: ORIGIN,
  player: PLAYER,
  game: GAME,
  viewport: WIDTH,
  entryIdentity,
  expectedEntry: EXPECTED_ENTRY,
  namespaced: true,
  baseline,
  completedLevelRuns,
  levelRunCount: completedLevelRuns.length,
  mediaEvents,
  rows,
  omittedLevelFive,
  providerRequests,
  pageErrors,
  consoleErrors,
  failedResources,
  failures,
};
}
