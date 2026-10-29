// Paste these declarations before the main `async page => { ... }` callback in
// the retained-profile native matrix. `levelIndex` is zero-based. The helper
// uses only visible game controls and browser input; callbacks are optional
// matrix hooks, not answer/progress injection.
const FIRE_ROUND_COUNTS = [
  [1, 1, 2],
  [1, 2, 2, 3],
  [2, 2, 3, 3, 3],
  [3, 3, 4, 4, 5],
  [4, 4, 5, 5, 6],
];

const fireDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fireScene(page) {
  const scene = page.getByRole('application', { name: /Hold and aim water at the flames/ });
  await scene.waitFor({ state: 'visible' });
  return scene;
}

async function burningFireRows(page) {
  const scene = await fireScene(page);
  const markers = scene.locator('[data-fire="burning"]');
  const count = await markers.count();
  const rows = [];
  for (let index = 0; index < count; index += 1) {
    const marker = markers.nth(index);
    if (!(await marker.isVisible())) continue;
    const progress = marker.getByRole('progressbar');
    const label = await progress.getAttribute('aria-label');
    const match = label?.match(/^Fire (\d+) spray progress$/);
    if (!match) throw new Error(`Missing named spray progress for visible fire: ${label}`);
    const position = await marker.evaluate((element) => ({
      x: Number.parseFloat(element.style.left),
      y: Number.parseFloat(element.style.top),
    }));
    rows.push({ marker, progress, fireNumber: Number(match[1]), ...position });
  }
  return { scene, rows };
}

async function assertFireGuidanceClear(page) {
  const scene = await fireScene(page);
  const guidance = scene.locator('[role="status"][aria-live="polite"]');
  await guidance.waitFor({ state: 'visible' });
  const guideBox = await guidance.boundingBox();
  if (!guideBox) throw new Error('Fire guidance has no visible box');
  const { rows } = await burningFireRows(page);
  const collisions = [];
  for (const fire of rows) {
    const box = await fire.marker.boundingBox();
    if (!box) throw new Error(`Burning fire ${fire.fireNumber} has no visible box`);
    const intersects = guideBox.x < box.x + box.width
      && guideBox.x + guideBox.width > box.x
      && guideBox.y < box.y + box.height
      && guideBox.y + guideBox.height > box.y;
    if (intersects) collisions.push({ fire: fire.fireNumber, guidance: guideBox, target: box });
  }
  if (collisions.length) throw new Error(`Fire guidance covers a live target: ${JSON.stringify(collisions)}`);
  return { guidance: guideBox, liveTargetsChecked: rows.length };
}

async function fireTargetPoint(page, fire) {
  const scene = await fireScene(page);
  const box = await scene.boundingBox();
  if (!box || !Number.isFinite(fire.x) || !Number.isFinite(fire.y)) throw new Error('Could not locate the visible fire target');
  // These are the authored target coordinates on the visible scene element.
  return { x: box.x + box.width * fire.x / 100, y: box.y + box.height * fire.y / 100 };
}

async function waitForFireProgress(page, fireNumber, prior, timeout = 2500) {
  await page.waitForFunction(({ number, value }) => {
    const bar = [...document.querySelectorAll('[role="progressbar"]')]
      .find((element) => element.getAttribute('aria-label') === `Fire ${number} spray progress`);
    return bar && Number(bar.getAttribute('aria-valuenow')) > value;
  }, { number: fireNumber, value: prior }, { timeout });
}

async function waitForFireOut(page, fireNumber, timeout = 3500) {
  await page.waitForFunction((number) => [...document.querySelectorAll('[data-fire="out"] [role="progressbar"]')]
    .some((element) => element.getAttribute('aria-label') === `Fire ${number} spray progress`), fireNumber, { timeout });
}

async function holdFireWithPointer(page, fire) {
  const before = Number(await fire.progress.getAttribute('aria-valuenow'));
  const point = await fireTargetPoint(page, fire);
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  try {
    await waitForFireProgress(page, fire.fireNumber, before);
    await waitForFireOut(page, fire.fireNumber, 3500);
  } finally {
    await page.mouse.up();
  }
  return { fire: fire.fireNumber, input: 'mouse-hold', progressObserved: true };
}

async function holdFireWithKeyboard(page, fire) {
  const button = page.getByRole('button', { name: `Hold Space or Enter to spray fire ${fire.fireNumber}`, exact: true });
  const before = Number(await fire.progress.getAttribute('aria-valuenow'));
  await button.focus();
  await page.keyboard.down('Space');
  try {
    await waitForFireProgress(page, fire.fireNumber, before);
    await waitForFireOut(page, fire.fireNumber, 3500);
  } finally {
    await page.keyboard.up('Space');
  }
  return { fire: fire.fireNumber, input: 'keyboard-space-hold', progressObserved: true };
}

async function proveFireTouchCancel(page, fire) {
  const cdp = await page.context().newCDPSession(page);
  const point = await fireTargetPoint(page, fire);
  await page.evaluate(() => {
    window.__rescueFirePointerCancelEvents = [];
    document.addEventListener('pointercancel', (event) => {
      window.__rescueFirePointerCancelEvents.push({ pointerType: event.pointerType, target: event.target?.getAttribute?.('role') || event.target?.tagName });
    }, true);
  });
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  try {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...point, id: 1 }] });
    await page.waitForTimeout(180);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
    await page.waitForFunction(() => window.__rescueFirePointerCancelEvents?.some((event) => event.pointerType === 'touch'));
    const stoppedAt = Number(await fire.progress.getAttribute('aria-valuenow'));
    await page.waitForTimeout(350);
    const after = Number(await fire.progress.getAttribute('aria-valuenow'));
    if (after >= 100 || after - stoppedAt > 2) throw new Error(`Touch cancel did not stop held spray (${stoppedAt} to ${after})`);
    return { fire: fire.fireNumber, pointerCancel: true, progressStableAfterCancel: true, stoppedAt, after };
  } finally {
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: false }).catch(() => {});
    await cdp.detach().catch(() => {});
  }
}

async function proveFireLifecycleFreeze(page, fire) {
  const cdp = await page.context().newCDPSession(page);
  const point = await fireTargetPoint(page, fire);
  await page.evaluate(() => {
    if (window.__rescueFireLifecycleProof) return;
    const proof = window.__rescueFireLifecycleProof = { rafCount: 0, events: [] };
    for (const type of ['freeze', 'resume', 'visibilitychange', 'pagehide', 'pageshow', 'blur', 'focus']) {
      const target = type === 'blur' || type === 'focus' ? window : document;
      target.addEventListener(type, () => proof.events.push({ type, at: performance.now(), visibility: document.visibilityState, focused: document.hasFocus?.() ?? null, rafCount: proof.rafCount }));
    }
    const tick = (at) => { proof.rafCount += 1; proof.lastRaf = at; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  const before = Number(await fire.progress.getAttribute('aria-valuenow'));
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  let windowId = null;
  let originalBounds = null;
  let minimized = false;
  try {
    await waitForFireProgress(page, fire.fireNumber, before, 2000);
    const heldProgress = Number(await fire.progress.getAttribute('aria-valuenow'));
    const rafBefore = await page.evaluate(() => window.__rescueFireLifecycleProof?.rafCount ?? null);
    const targetWindow = await cdp.send('Browser.getWindowForTarget');
    windowId = targetWindow.windowId;
    originalBounds = await cdp.send('Browser.getWindowBounds', { windowId });
    if (originalBounds.bounds.windowState !== 'minimized') {
      await cdp.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'minimized' } });
      minimized = true;
      await fireDelay(1500);
      await cdp.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'normal' } });
      if (originalBounds.bounds.windowState === 'normal') {
        await cdp.send('Browser.setWindowBounds', { windowId, bounds: {
          windowState: 'normal',
          left: originalBounds.bounds.left,
          top: originalBounds.bounds.top,
          width: originalBounds.bounds.width,
          height: originalBounds.bounds.height,
        } });
      } else {
        await cdp.send('Browser.setWindowBounds', { windowId, bounds: { windowState: originalBounds.bounds.windowState } });
      }
      minimized = false;
      await page.mouse.up();
      await page.waitForTimeout(120);
      const after = await page.evaluate((number) => {
        const bar = [...document.querySelectorAll('[role="progressbar"]')]
          .find((element) => element.getAttribute('aria-label') === `Fire ${number} spray progress`);
        const events = window.__rescueFireLifecycleProof?.events || [];
        const hiddenEvent = events.find((event) => (event.type === 'visibilitychange' && event.visibility === 'hidden') || (event.type === 'blur' && event.focused === false));
        const restoredEvent = events.find((event) => (event.type === 'visibilitychange' && event.visibility === 'visible') || (event.type === 'focus' && event.focused === true));
        return {
          visibility: document.visibilityState,
          focused: document.hasFocus?.() ?? null,
          progress: bar ? Number(bar.getAttribute('aria-valuenow')) : null,
          targetState: bar?.closest('[data-fire]')?.getAttribute('data-fire') || null,
          rafCount: window.__rescueFireLifecycleProof?.rafCount ?? null,
          lifecycle: events,
          hiddenEvent: hiddenEvent || null,
          restoredEvent: restoredEvent || null,
        };
      }, fire.fireNumber);
      if (!after.hiddenEvent) {
        return { fire: fire.fireNumber, lifecycle: 'headless window minimize produced no document visibility or blur event; hidden-state test unsupported', before, heldProgress, rafBefore, after, supported: false };
      }
      if (after.progress == null || after.progress >= 100 || after.progress - heldProgress > 18) {
        throw new Error(`Fire spray advanced while the existing QA window was hidden/minimized: ${JSON.stringify({ before, heldProgress, after })}`);
      }
      return { fire: fire.fireNumber, lifecycle: 'existing headless QA window minimized and restored (actual visibility/blur observed)', before, heldProgress, after, boundedDelta: true, supported: true };
    }
    return { fire: fire.fireNumber, lifecycle: 'existing QA window was already minimized; no window state changed', before, heldProgress, rafBefore, supported: false };
  } finally {
    if (minimized && windowId != null && originalBounds) {
      await cdp.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'normal' } }).catch(() => {});
      if (originalBounds.bounds.windowState === 'normal') {
        await cdp.send('Browser.setWindowBounds', { windowId, bounds: {
          windowState: 'normal',
          left: originalBounds.bounds.left,
          top: originalBounds.bounds.top,
          width: originalBounds.bounds.width,
          height: originalBounds.bounds.height,
        } }).catch(() => {});
      } else {
        await cdp.send('Browser.setWindowBounds', { windowId, bounds: { windowState: originalBounds.bounds.windowState } }).catch(() => {});
      }
    }
    await page.mouse.up().catch(() => {});
    await cdp.detach().catch(() => {});
  }
}

async function fireRound(page, roundIndex, expectedCount, opts = {}) {
  await opts.waitForRound?.(expectedCount, { page, roundIndex });
  const { rows: initialRows } = await burningFireRows(page);
  if (initialRows.length !== expectedCount) {
    throw new Error(`Fire round ${roundIndex + 1}: expected ${expectedCount} visible flames; found ${initialRows.length}`);
  }
  await opts.onSceneLayout?.({ page, roundIndex, expectedCount, scene: await fireScene(page) });
  await assertFireGuidanceClear(page);
  const actions = [];
  const evidence = { round: roundIndex + 1, expectedCount, initialVisibleTargets: initialRows.length };

  if (roundIndex === 0 && opts.firstRoundDiagnostics !== false) {
    // The first authored hand demo should be visible before the deliberate miss.
    const hand = page.locator('.animate-hand-hold');
    await hand.waitFor({ state: 'visible', timeout: 5000 });
    const scene = await fireScene(page);
    const sceneBox = await scene.boundingBox();
    if (!sceneBox) throw new Error('Fire scene has no visible bounds for empty-aim check');
    const emptyPoint = { x: sceneBox.x + sceneBox.width * 0.35, y: sceneBox.y + sceneBox.height * 0.55 };
    await page.mouse.move(emptyPoint.x, emptyPoint.y);
    await page.mouse.down();
    await page.waitForTimeout(900);
    await page.mouse.up();
    const guidance = scene.locator('[role="status"][aria-live="polite"]');
    await guidance.getByText('Keep the water on the flame. Hold to spray.', { exact: true }).waitFor({ state: 'visible' });
    const missedAimProgress = await Promise.all(initialRows.map((row) => row.progress.getAttribute('aria-valuenow')));
    if (missedAimProgress.some((value) => Number(value) !== 0)) throw new Error('Empty aim changed fire progress');
    evidence.handHintSeenBeforeMiss = true;
    evidence.emptyAimKeptTargetsUnchanged = true;
    evidence.guidanceGeometry = await assertFireGuidanceClear(page);

    actions.push(await proveFireTouchCancel(page, initialRows[0]));
    actions.push(await proveFireLifecycleFreeze(page, initialRows[0]));
    evidence.touchCancel = actions[0];
    evidence.lifecycleFreeze = actions[1];
  }

  await opts.injectWrong?.({ page, roundIndex, expectedCount, actions });

  let usedKeyboard = false;
  while (true) {
    const review = page.getByRole('group', { name: 'Fire rescue review', exact: true });
    if (await review.isVisible().catch(() => false)) break;
    const { rows } = await burningFireRows(page);
    if (!rows.length) break;
    const fire = rows[0];
    if (roundIndex === 0 && !usedKeyboard) {
      actions.push(await holdFireWithKeyboard(page, fire));
      usedKeyboard = true;
    } else {
      actions.push(await holdFireWithPointer(page, fire));
    }
    const recapVisible = await review.isVisible().catch(() => false);
    if (recapVisible) break;
    const { rows: remaining } = await burningFireRows(page);
    if (!remaining.length) break;
    await assertFireGuidanceClear(page);
  }

  const review = page.locator('section[aria-label="Round complete"]');
  await review.waitFor({ state: 'visible', timeout: 5000 });
  const reviewText = await review.innerText();
  if (!new RegExp(`You put out all ${expectedCount} ${expectedCount === 1 ? 'fire' : 'fires'}\\.`).test(reviewText)) {
    throw new Error(`Held recap did not confirm ${expectedCount} fires: ${reviewText}`);
  }
  evidence.reviewVisible = true;
  evidence.reviewText = reviewText;
  evidence.targetActions = actions;
  await opts.onReview?.({ page, roundIndex, expectedCount, evidence });
  await opts.capture?.({ page, levelIndex: opts.levelIndex, roundIndex, stage: 'round-review', evidence });

  return { review, evidence };
}

async function runRescueFireLevel(page, levelIndex, opts = {}) {
  if (!Number.isInteger(levelIndex) || levelIndex < 0 || levelIndex >= FIRE_ROUND_COUNTS.length) {
    throw new Error(`Invalid zero-based Fire Truck Rescue level index: ${levelIndex}`);
  }
  if (opts.startSelectedLevel) {
    await opts.startSelectedLevel(levelIndex, 'Fire Truck Rescue');
  } else {
    const practice = page.getByRole('button', { name: `Practice level ${levelIndex + 1}`, exact: true });
    if (await practice.count()) await practice.click();
    const startButton = page.getByRole('button', { name: 'Play Fire Truck Rescue', exact: true });
    if (await startButton.count()) await startButton.click();
    else await page.getByRole('button', { name: `Play level ${levelIndex + 1}`, exact: true }).click();
  }

  const roundCounts = FIRE_ROUND_COUNTS[levelIndex];
  await fireScene(page);
  const roundTrack = page.getByRole('progressbar', { name: 'Rounds done' });
  const roundsMaximum = Number(await roundTrack.getAttribute('aria-valuemax'));
  if (roundsMaximum !== roundCounts.length) throw new Error(`Level ${levelIndex + 1} expected ${roundCounts.length} rounds, shell shows ${roundsMaximum}`);
  await opts.capture?.({ page, levelIndex, stage: 'fire-level-start', targetCount: roundCounts[0] });

  const rows = [];
  const targetActions = [];
  for (let roundIndex = 0; roundIndex < roundCounts.length; roundIndex += 1) {
    if (roundIndex > 0) {
      await page.getByRole('button', { name: 'Next round', exact: true }).click();
      await fireScene(page);
    }
    const { review, evidence } = await fireRound(page, roundIndex, roundCounts[roundIndex], {
      ...opts,
      levelIndex,
    });
    rows.push(evidence);
    targetActions.push(...evidence.targetActions);
    if (roundIndex + 1 === roundCounts.length) {
      await opts.onBeforeFinish?.({ page, levelIndex, roundIndex, expectedCount: roundCounts[roundIndex], review, rows });
      await page.getByRole('button', { name: 'Finish game', exact: true }).click();
    }
  }
  return { level: levelIndex + 1, rounds: rows.length, targetActions, rows };
}
