async page => {
  const origin = 'https://dinospace.netlify.app';
  const expectedEntry = '/assets/arcade-mei6ziro.js';
  const screenshotPath = __SCREENSHOT_PATH__;
  const errors = { providerAttempts: [], pageErrors: [], consoleErrors: [], requestErrors: [], responseErrors: [] };
  const onPageError = error => errors.pageErrors.push(String(error?.message || error));
  const onConsole = message => { if (message.type() === 'error') errors.consoleErrors.push(message.text()); };
  const onRequestFailed = request => errors.requestErrors.push({ url: request.url(), error: request.failure()?.errorText || 'request failed' });
  const onResponse = response => { if (response.status() >= 400) errors.responseErrors.push({ url: response.url(), status: response.status() }); };
  const providerGuard = async route => {
    const url = route.request().url();
    if (/(?:\/api\/|elevenlabs|openai|text-to-speech|story-provider)/i.test(url)) {
      errors.providerAttempts.push(url);
      await route.fulfill({ status: 403, contentType: 'text/plain', body: 'Blocked by German render supplement guard' });
      return;
    }
    await route.continue();
  };
  page.on('pageerror', onPageError);
  page.on('console', onConsole);
  page.on('requestfailed', onRequestFailed);
  page.on('response', onResponse);
  const visible = async locator => await locator.count() === 1 && await locator.isVisible();
  const measure = async locator => {
    if (!await visible(locator)) throw new Error('Expected control is not uniquely visible.');
    const info = await locator.evaluate(element => {
      const rect = element.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return { text: (element.getAttribute('aria-label') || element.innerText || element.textContent || '').trim(), rect: rect.toJSON(), centerHit: Boolean(hit && (hit === element || element.contains(hit))), viewport: { width: innerWidth, height: innerHeight } };
    });
    const { x, y, right, bottom, width, height } = info.rect;
    if (width < 44 || height < 44 || x < 0 || y < 0 || right > 390 || bottom > 740 || !info.centerHit) throw new Error(`Control does not fit or receive its center hit: ${JSON.stringify(info)}`);
    return info;
  };
  const click = async locator => {
    const info = await measure(locator);
    const { x, y, right, bottom, width, height } = info.rect;
    if (width < 44 || height < 44 || x < 0 || y < 0 || right > 390 || bottom > 740 || !info.centerHit) throw new Error(`Navigation control does not fit or receive its center hit: ${JSON.stringify(info)}`);
    await locator.click();
    return info;
  };
  const snapshot = async () => page.evaluate(() => ({
    chapter: localStorage.getItem('amari_german_chapter_progress_v1'),
    legacy: localStorage.getItem('amari_game_levels_v1'),
    rewards: localStorage.getItem('amari_rewards_v2'),
    points: localStorage.getItem('amari_points'),
    gamesPlayed: localStorage.getItem('amari_games_played'),
    recentGames: localStorage.getItem('amari_recent_games'),
  }));
  let baseline = null;
  let finalState = null;
  let screenshot = null;
  let identity = null;
  let originalSoundOn = null;
  let restoredParent = false;
  try {
    await page.route('**/*', providerGuard);
    await page.setViewportSize({ width: 390, height: 740 });
    await page.goto(`${origin}/?qa_pair10_german_render=${Date.now()}`);
    await page.waitForLoadState('domcontentloaded', { timeout: 20000 });
    identity = await page.evaluate(() => ({
      origin: location.origin,
      entry: document.querySelector('script[type="module"][src]')?.getAttribute('src') || null,
      namespaced: window.__amariQaNamespaced === true,
      width: innerWidth,
      height: innerHeight,
    }));
    if (identity.origin !== origin || identity.entry !== expectedEntry || !identity.namespaced || identity.width !== 390 || identity.height !== 740) {
      throw new Error(`Published runtime identity did not match: ${JSON.stringify(identity)}`);
    }
    const profileCard = page.locator('.discovery-intro-card--amari');
    if (await profileCard.count() && await profileCard.isVisible()) {
      const age = (await profileCard.locator('.discovery-intro-age').innerText()).trim();
      if (age !== 'Age 6+') throw new Error(`Expected Amari Age 6+, found ${age}`);
      await click(profileCard);
    }
    const home = page.getByRole('heading', { name: 'Choose a world', exact: true });
    await home.waitFor({ state: 'visible', timeout: 15000 });
    const world = page.locator('.discovery-world-card').filter({ hasText: 'Explore & Languages' }).first();
    await world.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
    await click(world);
    await page.getByRole('heading', { name: 'Explore & Languages', exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    const catalogue = page.locator('.catalogue-game-card').filter({ hasText: 'German Garage' }).first();
    await catalogue.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
    await click(catalogue);
    await page.getByRole('heading', { name: 'German Garage', exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    originalSoundOn = await page.getByRole('button', { name: 'Turn sound off', exact: true }).count() ? true
      : await page.getByRole('button', { name: 'Turn sound on', exact: true }).count() ? false : null;
    if (originalSoundOn === null) throw new Error('Could not inspect German Garage sound state from its visible toggle.');
    baseline = await snapshot();
    const directionCard = page.locator('.german-garage-page article').filter({ has: page.getByRole('heading', { level: 2, name: 'Direction Driver', exact: true }) });
    if (await directionCard.getByRole('button', { name: 'Replay · no reward', exact: true }).count() !== 1) throw new Error('Direction Driver was not already completed; render supplement will not create eligibility or a new completion.');
    const replay = directionCard.getByRole('button', { name: 'Replay · no reward', exact: true });
    await replay.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
    await click(replay);
    const startRoutes = page.getByRole('button', { name: 'Start the driving routes', exact: true });
    await startRoutes.waitFor({ state: 'visible', timeout: 8000 });
    await click(startRoutes);
    await page.locator('.german-garage-page[data-german-chapter="direction-driver"][data-german-route]').waitFor({ state: 'visible', timeout: 8000 });
    const routeId = await page.locator('.german-garage-page').getAttribute('data-german-route');
    if (!routeId) throw new Error('Normal Direction Driver route board did not expose a route.');
    const routeLabel = await page.locator('.german-garage-page main').innerText();
    if (!routeLabel.toLowerCase().includes('route 1 of 7')) throw new Error('The normal route board did not render its visible first-route prompt.');
    const actions = [];
    for (const name of ['Move left', 'Move right', 'Move forward', 'Move back', 'Slow', 'Stop']) {
      const action = page.getByRole('button', { name, exact: true });
      actions.push(await measure(action));
    }
    const held = await page.getByRole('button', { name: 'Choose chapter', exact: true });
    const soundStateDuring = originalSoundOn;
    screenshot = screenshotPath;
    await page.screenshot({ path: screenshotPath, type: 'jpeg', quality: 78, fullPage: false });
    await click(held);
    await page.getByRole('heading', { name: 'German Garage', exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    const parent = page.getByRole('button', { name: 'Back to learning world', exact: true });
    await click(parent);
    await page.getByRole('heading', { name: 'Explore & Languages', exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    restoredParent = true;
    finalState = await snapshot();
    if (finalState.chapter !== baseline.chapter || finalState.legacy !== baseline.legacy || finalState.rewards !== baseline.rewards || finalState.points !== baseline.points || finalState.gamesPlayed !== baseline.gamesPlayed || finalState.recentGames !== baseline.recentGames) {
      throw new Error('Direction Driver render supplement changed progress, legacy levels, recent games, points, or reward records.');
    }
    if (errors.providerAttempts.length || errors.pageErrors.length || errors.consoleErrors.length || errors.requestErrors.length || errors.responseErrors.length) {
      throw new Error(`Unexpected browser errors during the representative render: ${JSON.stringify(errors)}`);
    }
    return { passed: true, origin, entryIdentity: identity.entry, viewport: `${identity.width}x${identity.height}`, player: 'Amari', world: 'Explore & Languages', game: 'German Garage', chapter: 'Direction Driver', routeId, routePrompt: routeLabel.replace(/\s+/g, ' ').trim(), actionControls: actions, screenshot, soundOnBefore: originalSoundOn, soundOnDuring: soundStateDuring, soundUnchanged: true, noProgressOrRewardDelta: true, returnedToParent: restoredParent, errors };
  } catch (error) {
    return { passed: false, origin, entryIdentity: identity?.entry || null, viewport: '390x740', player: 'Amari', chapter: 'Direction Driver', routeId: await page.locator('.german-garage-page').getAttribute('data-german-route').catch(() => null), screenshot, soundOnBefore: originalSoundOn, returnedToParent: restoredParent, errors, error: String(error?.stack || error).slice(-4000) };
  } finally {
    await page.unroute('**/*', providerGuard).catch(() => {});
    page.off('pageerror', onPageError);
    page.off('console', onConsole);
    page.off('requestfailed', onRequestFailed);
    page.off('response', onResponse);
  }
}
