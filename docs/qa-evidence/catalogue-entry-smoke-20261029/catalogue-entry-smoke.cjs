// Caller-supplied Playwright page only. Catalogue entry/return smoke, not
// gameplay acceptance. No browser, context, tab, answer, or storage writes.
async page => {
  const ORIGIN = __ORIGIN__;
  const EXPECTED_ENTRY = __EXPECTED_ENTRY__;
  const WIDTH = __WIDTH__;
  const HEIGHT = __HEIGHT__;
  const PLAYER = __PLAYER__;
  const IDS = __IDS__;
  const rows = [];
  const failures = [];
  const pageErrors = [];
  const consoleErrors = [];
  const failedRequests = [];
  const failedResponses = [];
  const providerAttempts = [];
  const onPageError = error => pageErrors.push(String(error?.message || error));
  const onConsole = message => { if (message.type() === 'error') consoleErrors.push(message.text()); };
  const onRequestFailed = request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText || 'request failed' });
  const onResponse = response => { if (response.status() >= 400) failedResponses.push({ url: response.url(), status: response.status() }); };
  const providerRoute = async route => {
    const url = route.request().url();
    if (/\/api\/|elevenlabs|openai|text-to-speech|story-provider/i.test(url)) {
      providerAttempts.push(url);
      await route.fulfill({ status: 403, contentType: 'text/plain', body: 'Catalogue smoke provider guard' });
      return;
    }
    await route.continue();
  };
  let entryIdentity = null;
  let runtime = null;
  let baselineStorage = null;
  let finalStorage = null;

  const assert = (condition, message, evidence = null) => {
    if (!condition) throw Object.assign(new Error(message), { evidence });
  };
  const logicalKey = key => key.replace(/^qa_rewards_20261024_/, '');
  const snapshotStorage = async () => page.evaluate(async () => {
    const result = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key === null) continue;
      const raw = localStorage.getItem(key) ?? '';
      const bytes = new TextEncoder().encode(raw);
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      result[key] = { bytes: bytes.length, sha256: [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, '0')).join('') };
    }
    return result;
  });
  const changedKeys = (before, after) => [...new Set([...Object.keys(before || {}), ...Object.keys(after || {})])]
    .filter(key => before?.[key]?.sha256 !== after?.[key]?.sha256 || before?.[key]?.bytes !== after?.[key]?.bytes)
    .map(logicalKey).sort();
  const rewardSnapshot = async () => page.evaluate(() => {
    const result = {};
    const players = ['amari', 'askia'];
    const suffixes = ['rewards_v2', 'points', 'games_played', 'earned_sticker_ids_v1', 'little_progress'];
    for (const player of players) for (const suffix of suffixes) {
      const key = `${player}_${suffix}`;
      const raw = localStorage.getItem(key);
      if (raw !== null) result[key] = raw;
    }
    return result;
  });
  const actualRuntime = async () => page.evaluate(() => ({
    origin: location.origin,
    entry: document.querySelector('script[type="module"][src]')?.getAttribute('src') || null,
    namespaced: window.__amariQaNamespaced === true,
    viewport: { width: innerWidth, height: innerHeight },
  }));
  const checkRuntime = async () => {
    const runtime = await actualRuntime();
    assert(runtime.origin === new URL(ORIGIN).origin, `Unexpected origin ${runtime.origin}`);
    assert(runtime.entry === EXPECTED_ENTRY, `Entry mismatch ${runtime.entry}; expected ${EXPECTED_ENTRY}`);
    assert(runtime.namespaced, 'Retained QA namespace guard is missing');
    assert(runtime.viewport.width === WIDTH && runtime.viewport.height === HEIGHT, `Viewport mismatch: ${JSON.stringify(runtime.viewport)}`);
    entryIdentity = runtime.entry;
    return runtime;
  };
  const measure = async (locator, label, min = 44) => {
    assert(await locator.count() === 1 && await locator.isVisible(), `${label} is not uniquely visible`);
    const geometry = await locator.evaluate(element => {
      const r = element.getBoundingClientRect();
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const hit = document.elementFromPoint(x, y);
      return {
        rect: { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height },
        viewport: { width: innerWidth, height: innerHeight },
        centerHit: Boolean(hit && (hit === element || element.contains(hit))),
      };
    });
    assert(geometry.rect.x >= 0 && geometry.rect.y >= 0 && geometry.rect.right <= geometry.viewport.width && geometry.rect.bottom <= geometry.viewport.height,
      `${label} is outside the viewport: ${JSON.stringify(geometry)}`);
    assert(geometry.rect.width >= min && geometry.rect.height >= min && geometry.centerHit,
      `${label} is too small or occluded: ${JSON.stringify(geometry)}`);
    return geometry;
  };
  const click = async (locator, label, options = {}) => {
    const geometry = await measure(locator, label, options.min || 44);
    await locator.click();
    if (options.waitFor) await options.waitFor.waitFor({ state: 'visible', timeout: options.timeout || 10000 });
    return geometry;
  };
  const clickNavigation = async (locator, label, options = {}) => {
    assert(await locator.count() === 1 && await locator.isVisible(), `${label} is not uniquely visible for navigation`);
    await locator.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'nearest' }));
    return click(locator, label, options);
  };
  const decodeImage = async locator => {
    if (await locator.count() !== 1) return null;
    await locator.evaluate(image => image.decode());
    const result = await locator.evaluate(image => ({ src: image.currentSrc || image.src, alt: image.alt || '', width: image.naturalWidth, height: image.naturalHeight, complete: image.complete }));
    assert(result.complete && result.width > 0 && result.height > 0, `Catalogue portrait failed to load: ${JSON.stringify(result)}`);
    return result;
  };
  const inspectEntrySurface = async title => {
    const main = page.locator('main:visible, [data-little-game]:visible').first();
    await main.waitFor({ state: 'visible', timeout: 12000 });
    const content = await main.innerText().catch(() => '');
    assert(content.trim().length > 0, `${title} route mounted an empty main surface`);
    const heading = await main.locator('h1:visible').first().innerText().catch(() => '');
    await page.waitForFunction(() => [...document.querySelectorAll('main img')].filter(image => {
      const r = image.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }).every(image => image.complete), null, { timeout: 10000 });
    const visibleImages = await main.evaluate(element => [...element.querySelectorAll('img')].filter(image => {
      const r = image.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }).map(image => ({ src: image.currentSrc || image.src, alt: image.alt || '', width: image.naturalWidth, height: image.naturalHeight, complete: image.complete })));
    const broken = visibleImages.filter(image => !image.complete || image.width <= 0 || image.height <= 0);
    assert(broken.length === 0, `${title} entry has a broken visible image`, { visibleImages, broken });
    return { mainText: content.trim().slice(0, 240), h1: heading.trim() || null, visibleImages };
  };
  const chooser = async () => {
    const intro = page.locator('.discovery-intro-card--amari, .discovery-intro-card--askia');
    const desiredHome = PLAYER === 'askia' ? page.locator('#askia-home') : page.getByRole('heading', { name: 'Choose a world', exact: true });
    const alreadyHome = await desiredHome.count() && await desiredHome.isVisible();
    if (alreadyHome) return;
    const chipMatchesProfile = async locator => {
      const label = await locator.getAttribute('aria-label') || '';
      return PLAYER === 'askia' ? /^Askia\b/.test(label) : /^Amari\b/.test(label);
    };
    const wrongPlayerChip = page.getByRole('button', { name: /is playing\. (?:Tap to change player|Change player)/i }).first();
    if (await wrongPlayerChip.count() && await wrongPlayerChip.isVisible() && !await chipMatchesProfile(wrongPlayerChip)) {
      await click(wrongPlayerChip, 'Switch to requested catalogue profile');
    }
    if (!(await intro.count()) && !(await desiredHome.count() && await desiredHome.isVisible())) {
      const homeButton = page.getByRole('button', { name: 'Discovery HQ home', exact: true });
      if (await homeButton.count() && await homeButton.isVisible()) {
        await click(homeButton, 'Return to home before choosing profile');
        await resolveLeaveDialog('Back to home');
      } else {
        const pageBackHome = page.getByRole('button', { name: 'Back to home', exact: true }).first();
        const littleHome = page.getByRole('button', { name: 'Go home', exact: true }).first();
        if (await pageBackHome.count() && await pageBackHome.isVisible()) {
          await click(pageBackHome, 'Return from world page to home before choosing profile');
          await resolveLeaveDialog('Back to home');
        } else if (await littleHome.count() && await littleHome.isVisible()) {
          await click(littleHome, 'Return from Askia game to home before choosing profile');
          await resolveLeaveDialog('Back to home');
        }
      }
    }
    const chipAfterReturn = page.getByRole('button', { name: /is playing\. (?:Tap to change player|Change player)/i }).first();
    if (await chipAfterReturn.count() && await chipAfterReturn.isVisible() && !await chipMatchesProfile(chipAfterReturn)) {
      await click(chipAfterReturn, 'Switch to requested profile through the visible player chip');
    }
    const desiredIntroCard = page.locator(PLAYER === 'askia' ? '.discovery-intro-card--askia' : '.discovery-intro-card--amari');
    if (await desiredIntroCard.count() && await desiredIntroCard.isVisible()) {
      await click(desiredIntroCard, `Choose ${PLAYER} through the normal profile picker`);
    }
    if (PLAYER === 'askia') await page.locator('#askia-home h1').filter({ hasText: 'Hi Askia!' }).waitFor({ state: 'visible', timeout: 12000 });
    else await page.getByRole('heading', { name: 'Choose a world', exact: true }).waitFor({ state: 'visible', timeout: 12000 });
  };
  const resolveLeaveDialog = async (requestedDestination = null) => {
    const dialog = page.getByRole('dialog', { name: 'Leave the game?', exact: true });
    if (!await dialog.count() || !await dialog.isVisible()) return { dialogShown: false, destination: null };
    const destinationName = requestedDestination || (PLAYER === 'askia' ? 'Back to home' : 'Back to world');
    const destination = dialog.getByRole('button', { name: destinationName, exact: true });
    const geometry = await click(destination, `Confirm active-screen return to ${destinationName}`);
    return { dialogShown: true, destination: destinationName, geometry };
  };
  const enterAmari = async lane => {
    const onHome = await page.getByRole('heading', { name: 'Choose a world', exact: true }).count();
    const onTargetWorld = await page.getByRole('heading', { name: lane.world, exact: true }).count();
    if (!onHome && !onTargetWorld) await returnToHome();
    const worldCard = page.locator('.discovery-world-card').filter({ hasText: lane.world }).first();
    if (await page.getByRole('heading', { name: lane.world, exact: true }).count() === 0) {
      await clickNavigation(worldCard, `${lane.world} world card`, { waitFor: page.getByRole('heading', { name: lane.world, exact: true }) });
    }
    const card = page.locator('.catalogue-game-card').filter({ hasText: lane.title });
    assert(await card.count() === 1, `Normal Amari catalogue is missing ${lane.title} in ${lane.world}`);
    await card.scrollIntoViewIfNeeded();
    const portrait = await decodeImage(card.locator('img.catalogue-game-art'));
    const cardGeometry = await clickNavigation(card, `Open Amari ${lane.title} card`);
    await card.waitFor({ state: 'hidden', timeout: 12000 });
    await page.locator('.discovery-game-surface main:visible, .discovery-game-surface [data-little-game]:visible').first().waitFor({ state: 'visible', timeout: 12000 });
    const entry = await inspectEntrySurface(lane.title);
    const rewardBefore = await rewardSnapshot();
    const storageBefore = await snapshotStorage();
    const worlds = page.getByRole('button', { name: 'Worlds', exact: true });
    await click(worlds, `Return from Amari ${lane.title} to ${lane.world}`);
    const leave = await resolveLeaveDialog();
    await page.getByRole('heading', { name: lane.world, exact: true }).waitFor({ state: 'visible', timeout: 12000 });
    const storageAfter = await snapshotStorage();
    const rewardAfter = await rewardSnapshot();
    assert(JSON.stringify(rewardBefore) === JSON.stringify(rewardAfter), `${lane.title} changed reward state during entry/return smoke`, { rewardBefore, rewardAfter });
    return {
      ...lane,
      entry,
      cataloguePortrait: portrait,
      cardGeometry,
      returnedTo: lane.world,
      leave,
      storageChanges: changedKeys(storageBefore, storageAfter),
      rewardStateUnchanged: true,
    };
  };
  const askiaWorldSection = title => ({
    'Dino Jigsaw': 'Dino World', 'Shadow Match': 'Dino World', 'Dino Detective': 'Dino World',
    'Rocket Builder': 'Rocket World', 'Fuel Up': 'Rocket World', 'Count the Stars': 'Rocket World',
    'Fire Truck Rescue': 'Rescue World', 'Ladder Rescue': 'Rescue World',
    'Memory Match': 'Little Thinkers', 'Pattern Parade': 'Little Thinkers',
  })[title];
  const enterAskia = async lane => {
    const world = askiaWorldSection(lane.title);
    assert(world, `No normal Askia menu mapping is declared for ${lane.title}`);
    const section = page.locator('.askia-world').filter({ has: page.getByRole('heading', { name: world, exact: true }) });
    const launch = section.getByRole('button', { name: `Play ${lane.title}`, exact: true });
    assert(await launch.count() === 1, `${lane.title} is not present in Askia's normal ${world} menu`);
    await launch.scrollIntoViewIfNeeded();
    let portrait = await decodeImage(launch.locator('img').first());
    if (!portrait) portrait = await decodeImage(section.locator('.askia-world__scene img').first());
    const cardGeometry = await clickNavigation(launch, `Open Askia ${lane.title} from ${world}`);
    await page.locator('main:visible, [data-little-game]:visible').first().waitFor({ state: 'visible', timeout: 12000 });
    const entry = await inspectEntrySurface(lane.title);
    const rewardBefore = await rewardSnapshot();
    const storageBefore = await snapshotStorage();
    const homeAction = page.getByRole('button', { name: 'Go home', exact: true }).first();
    const backAction = page.getByRole('button', { name: 'Back to home', exact: true }).first();
    const action = await homeAction.count() && await homeAction.isVisible() ? homeAction : backAction;
    const leaveGeometry = await click(action, `Return from Askia ${lane.title} to home`);
    await resolveLeaveDialog();
    await page.locator('#askia-home').waitFor({ state: 'visible', timeout: 12000 });
    const returnedSection = page.locator('.askia-world').filter({ has: page.getByRole('heading', { name: world, exact: true }) });
    await returnedSection.waitFor({ state: 'visible', timeout: 10000 });
    const exactGameButton = returnedSection.getByRole('button', { name: `Play ${lane.title}`, exact: true });
    assert(await exactGameButton.count() === 1 && await exactGameButton.isVisible(), `Askia did not return to ${world} with ${lane.title} available`);
    const storageAfter = await snapshotStorage();
    const rewardAfter = await rewardSnapshot();
    assert(JSON.stringify(rewardBefore) === JSON.stringify(rewardAfter), `${lane.title} changed reward state during Askia entry/return smoke`, { rewardBefore, rewardAfter });
    return { ...lane, world, entry, cataloguePortrait: portrait, cardGeometry, leaveGeometry, returnedTo: world, storageChanges: changedKeys(storageBefore, storageAfter), rewardStateUnchanged: true };
  };

  const AMARI_LANES = [
    { scope: 'retained', id: 'trace', title: 'Letter Trace', world: 'Read & Write' },
    { scope: 'retained', id: 'phonics', title: 'Sound Safari', world: 'Read & Write' },
    { scope: 'retained', id: 'counting', title: 'Count the Stars', world: 'Maths Missions' },
    { scope: 'retained', id: 'addition', title: 'Addition Adventure', world: 'Maths Missions' },
    { scope: 'retained', id: 'subtraction', title: 'Subtraction Station', world: 'Maths Missions' },
    { scope: 'retained', id: 'math', title: 'Monster Math', world: 'Maths Missions' },
    { scope: 'retained', id: 'numberline', title: 'Number Line Jump', world: 'Maths Missions' },
    { scope: 'retained', id: 'timeteller', title: 'Time Teller', world: 'Maths Missions' },
    { scope: 'retained', id: 'jet', title: 'Sky Shapes', world: 'Creative Lab' },
    { scope: 'retained', id: 'colormix', title: 'Colour Mixing Lab', world: 'Creative Lab' },
    { scope: 'retained', id: 'puzzle', title: 'Puzzle Pop', world: 'Creative Lab' },
    { scope: 'retained', id: 'shadowmatch', title: 'Shadow Match', world: 'Thinking & Play' },
    { scope: 'retained', id: 'spot', title: 'Spot the Difference', world: 'Thinking & Play' },
    { scope: 'retained', id: 'tictactoe', title: 'Cosmic Tic-Tac-Toe', world: 'Thinking & Play' },
    { pair: 1, id: 'oddoneout', title: 'Odd One Out', world: 'Thinking & Play' },
    { pair: 1, id: 'pattern', title: 'Pattern Parade', world: 'Thinking & Play' },
    { pair: 2, id: 'astronaut', title: 'Astronaut Academy', world: 'Explore & Languages' },
    { pair: 2, id: 'chess', title: 'Chess Explorers', world: 'Thinking & Play' },
    { pair: 3, id: 'codecadets', title: 'Code Cadets', world: 'Creative Lab' },
    { pair: 3, id: 'writingdesk', title: 'My Writing Desk', world: 'Creative Lab' },
    { pair: 4, id: 'solar', title: 'Solar System', world: 'Explore & Languages' },
    { pair: 4, id: 'memory', title: 'Memory Match', world: 'Thinking & Play' },
    { pair: 5, id: 'rocketbuilder', title: 'Rocket Builder', world: 'Creative Lab' },
    { pair: 5, id: 'fuelup', title: 'Fuel Up', world: 'Maths Missions' },
    { pair: 6, id: 'firerescue', title: 'Fire Truck Rescue', world: 'Maths Missions' },
    { pair: 6, id: 'ladder', title: 'Ladder Rescue', world: 'Thinking & Play' },
    { pair: 7, id: 'dino', title: 'Dino Detective', world: 'Explore & Languages' },
    { pair: 7, id: 'hangman', title: 'Dino Hangman', world: 'Read & Write' },
    { pair: 8, id: 'storybooks', title: 'Storybook Studio', world: 'Read & Write' },
    { pair: 8, id: 'words', title: 'Spelling Studio', world: 'Read & Write' },
    { pair: 9, id: 'dinojigsaw', title: 'Dino Jigsaw', world: 'Creative Lab' },
    { pair: 10, id: 'worldmap', title: 'Curriculum Quest', world: 'Explore & Languages' },
    { pair: 10, id: 'german', title: 'German Garage', world: 'Explore & Languages' },
    { pair: 11, id: 'letters', title: 'Letter Launch', world: 'Read & Write' },
    { pair: 11, id: 'factfinder', title: 'Fact Finder', world: 'Explore & Languages', factFinderPriorFullAcceptance: true },
  ];
  const ASKIA_LANES = [
    { scope: 'retained', id: 'shadowmatch', title: 'Shadow Match' },
    { scope: 'retained', id: 'counting', title: 'Count the Stars' },
    { pair: 9, id: 'dinojigsaw', title: 'Dino Jigsaw' },
    { pair: 5, id: 'rocketbuilder', title: 'Rocket Builder' },
    { pair: 7, id: 'dino', title: 'Dino Detective' },
    { pair: 5, id: 'fuelup', title: 'Fuel Up' },
    { pair: 6, id: 'firerescue', title: 'Fire Truck Rescue' },
    { pair: 6, id: 'ladder', title: 'Ladder Rescue' },
    { pair: 4, id: 'memory', title: 'Memory Match' },
    { pair: 1, id: 'pattern', title: 'Pattern Parade' },
  ];

  const returnToHome = async () => {
    if (PLAYER === 'amari') {
      if (await page.getByRole('heading', { name: 'Choose a world', exact: true }).count()) return;
      const homeButton = page.getByRole('button', { name: 'Home', exact: true }).first();
      if (await homeButton.count() && await homeButton.isVisible()) {
        await click(homeButton, 'Return to Amari home');
        await resolveLeaveDialog('Back to home');
      } else {
        const backHome = page.getByRole('button', { name: 'Back to home', exact: true }).first();
        await click(backHome, 'Return from Amari world page to home');
      }
      await page.getByRole('heading', { name: 'Choose a world', exact: true }).waitFor({ state: 'visible', timeout: 12000 });
      return;
    }
    if (await page.locator('#askia-home').count()) return;
    const action = page.getByRole('button', { name: 'Go home', exact: true }).first();
    const back = page.getByRole('button', { name: 'Back to home', exact: true }).first();
    await click(await action.count() && await action.isVisible() ? action : back, 'Return to Askia home');
    await resolveLeaveDialog();
    await page.locator('#askia-home').waitFor({ state: 'visible', timeout: 12000 });
  };
  const processLanes = async lanes => {
    for (const lane of lanes) {
      const beforeReward = await rewardSnapshot();
      const row = PLAYER === 'amari' ? await enterAmari(lane) : await enterAskia(lane);
      const afterReward = await rewardSnapshot();
      assert(JSON.stringify(beforeReward) === JSON.stringify(afterReward), `${lane.title} changed a reward claim around its route`, { beforeReward, afterReward });
      rows.push(row);
      await checkRuntime();
    }
  };

  page.on('pageerror', onPageError);
  page.on('console', onConsole);
  page.on('requestfailed', onRequestFailed);
  page.on('response', onResponse);
  try {
    assert(['amari', 'askia'].includes(PLAYER), `Unknown profile: ${PLAYER}`);
    assert(PLAYER === 'amari' ? IDS === 'all' : IDS === 'normal', 'IDs selector must be all for Amari or normal for Askia');
    const selectedLanes = PLAYER === 'amari' ? AMARI_LANES : ASKIA_LANES;
    assert(new Set(selectedLanes.map(lane => lane.id)).size === selectedLanes.length, 'Catalogue route list contains duplicate IDs');
    assert(PLAYER === 'amari'
      ? selectedLanes.length === 35 && selectedLanes.filter(lane => Number.isInteger(lane.pair)).length === 21 && selectedLanes.filter(lane => lane.scope === 'retained').length === 14
      : selectedLanes.length === 10 && selectedLanes.filter(lane => Number.isInteger(lane.pair)).length === 8 && selectedLanes.filter(lane => lane.scope === 'retained').length === 2,
    'Catalogue route inventory does not match the source-reconciled scope');
    await page.route('**/*', providerRoute);
    await page.setViewportSize({ width: WIDTH, height: HEIGHT });
    runtime = await checkRuntime();
    baselineStorage = await snapshotStorage();
    await chooser();
    await returnToHome();
    if (PLAYER === 'amari') await processLanes(AMARI_LANES);
    else await processLanes(ASKIA_LANES);
    await returnToHome();
    const expectedRows = PLAYER === 'amari' ? AMARI_LANES.length : ASKIA_LANES.length;
    assert(rows.length === expectedRows, `Completed ${rows.length} catalogue entries, expected ${expectedRows}`);
  } catch (error) {
    failures.push({ message: String(error?.message || error), evidence: error?.evidence || null, stack: String(error?.stack || '').slice(0, 4000), completedIds: rows.map(row => row.id) });
  } finally {
    try { finalStorage = await snapshotStorage(); } catch { finalStorage = null; }
    page.off('pageerror', onPageError);
    page.off('console', onConsole);
    page.off('requestfailed', onRequestFailed);
    page.off('response', onResponse);
    try { await page.unroute('**/*', providerRoute); } catch { /* keep caller page usable */ }
  }
  return {
    scope: 'normal catalogue entry, rendered art/error check, and exact parent return only; not game acceptance',
    passed: failures.length === 0 && providerAttempts.length === 0 && pageErrors.length === 0 && consoleErrors.length === 0 && failedRequests.length === 0 && failedResponses.length === 0,
    profile: PLAYER,
    origin: ORIGIN,
    viewport: { width: WIDTH, height: HEIGHT },
    expectedEntry: EXPECTED_ENTRY,
    entryIdentity,
    runtime,
    requestedIds: IDS,
    catalogueActivitiesCovered: PLAYER === 'amari' ? AMARI_LANES.length : ASKIA_LANES.length,
    pairActivitiesCovered: (PLAYER === 'amari' ? AMARI_LANES : ASKIA_LANES).filter(lane => Number.isInteger(lane.pair)).length,
    retainedActivitiesCovered: (PLAYER === 'amari' ? AMARI_LANES : ASKIA_LANES).filter(lane => lane.scope === 'retained').length,
    rows,
    failures,
    storage: { baselineKeys: baselineStorage ? Object.keys(baselineStorage).length : null, finalKeys: finalStorage ? Object.keys(finalStorage).length : null, changedKeys: changedKeys(baselineStorage, finalStorage) },
    pageErrors: pageErrors.slice(-25),
    consoleErrors: consoleErrors.slice(-25),
    failedRequests: failedRequests.slice(-25),
    failedResponses: failedResponses.slice(-25),
    providerAttempts: providerAttempts.slice(-25),
  };
};
