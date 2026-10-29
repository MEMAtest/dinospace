// One-round Shadow Match touch check. Caller supplies the existing leased page.
const createIntegrationNative = require('./integration-native.cjs');
const btn = (page, name) => page.getByRole('button', { name, exact: true });
const text = async locator => String(await locator.innerText()).replace(/\s+/g, ' ').trim();
function ok(condition, message) { if (!condition) throw new Error(message); }

async function waitVisible(page, locator, label, timeout = 5000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await locator.count() && await locator.isVisible().catch(() => false)) return;
    await page.waitForTimeout(60);
  }
  throw new Error(`${label} did not become visible within ${timeout}ms`);
}

async function clickNavigation(helper, locator, label) {
  ok(await locator.count() === 1 && await locator.isVisible(), `${label} is not uniquely visible`);
  await locator.evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'nearest' }));
  return helper.clickControl(locator, { label });
}

async function soundState(page) {
  const toggle = page.getByRole('button', { name: /^Turn sound (on|off)$/ }).first();
  if (!await toggle.count()) return null;
  const label = await toggle.getAttribute('aria-label');
  return label === 'Turn sound off' ? true : label === 'Turn sound on' ? false : null;
}

async function setSound(page, helper, wanted) {
  const current = await soundState(page);
  if (current === null || current === wanted) return current;
  await helper.clickControl(btn(page, current ? 'Turn sound off' : 'Turn sound on'), {
    label: wanted ? 'Enable Shadow Match packaged audio' : 'Restore original sound preference',
  });
  return soundState(page);
}

async function normalAmariHome(page, helper, origin, width, height) {
  // Install the provider guard before navigating, then the document observers
  // again after the full navigation (the media observer is document-local).
  await helper.installGuards();
  await page.setViewportSize({ width, height });
  await page.goto(`${origin}/?qa_pair18_shadow_touch=${Date.now()}#/home`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await helper.installGuards();
  await page.waitForFunction(() => window.__amariQaNamespaced === true, null, { timeout: 5000 });
  const intro = btn(page, '🔊 Who is playing today?');
  const chip = page.getByRole('button', { name: /is playing\. (Tap to change player|Change player)/ }).first();
  if (await intro.count() && await intro.isVisible()) {
    const amariCard = page.locator('.discovery-intro-card').filter({ hasText: 'Amari' });
    await clickNavigation(helper, amariCard, 'Choose Amari through the visible player card');
  } else if (await chip.count() && await chip.isVisible()) {
    const current = /Askia/i.test(await chip.getAttribute('aria-label') || '') ? 'askia' : 'amari';
    if (current !== 'amari') {
      await clickNavigation(helper, chip, 'Open the visible player chooser');
      await waitVisible(page, intro, 'Ordinary player chooser');
      const amariCard = page.locator('.discovery-intro-card').filter({ hasText: 'Amari' });
      await clickNavigation(helper, amariCard, 'Choose Amari through the visible player card');
    }
  }
  await waitVisible(page, page.getByRole('heading', { name: 'Choose a world', exact: true }), 'Amari world chooser');
  return helper.assertRuntime();
}

async function keySnapshot(page) {
  return page.evaluate(() => Object.fromEntries([
    'amari_little_progress', 'askia_little_progress',
    'amari_rewards_v2', 'askia_rewards_v2',
  ].map(key => [key, localStorage.getItem(key)])));
}

function sameSnapshot(before, after) {
  return Object.keys(before).every(key => before[key] === after[key]);
}

async function touchPath(client, from, to, terminal, steps = 8) {
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...from, id: 1 }] });
  for (let step = 1; step <= steps; step += 1) {
    const ratio = step / steps;
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ id: 1, x: from.x + (to.x - from.x) * ratio, y: from.y + (to.y - from.y) * ratio }],
    });
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  await client.send('Input.dispatchTouchEvent', { type: terminal, touchPoints: [] });
}

module.exports = async function runShadowTouchCheck(page, { origin, expectedEntry, width, height, failurePath } = {}) {
  if (width !== 390 || height !== 740) throw new TypeError('Shadow touch check is restricted to 390x740');
  const helper = createIntegrationNative(page, { origin, expectedEntry, minimumTargetSize: 44 });
  page.setDefaultTimeout(2500);
  const out = {
    passed: false, origin, viewport: { width, height }, expectedEntry,
    touch: { enabled: false, emulation: 'Chromium CDP touch emulation; not physical-device certification', cancelRejected: false, dragMatched: false },
    stages: [], providerAttempts: [],
  };
  let client = null;
  let originalSound = null;
  let soundRestored = null;
  try {
    out.runtime = await normalAmariHome(page, helper, origin, width, height);
    await clickNavigation(helper, page.locator('.discovery-world-card').filter({ hasText: 'Thinking & Play' }), 'Open Thinking & Play');
    const shadowCard = page.locator('.catalogue-game-card').filter({ hasText: 'Shadow Match' });
    await clickNavigation(helper, shadowCard, 'Open Shadow Match from the Amari catalogue');
    const playScreen = btn(page, 'Play Shadow Match');
    await waitVisible(page, playScreen, 'Shadow Match level screen');

    const practice = btn(page, 'Practice level 5');
    await waitVisible(page, practice, 'Highest naturally available Amari level');
    ok(await practice.isEnabled(), 'Amari level 5 is not naturally unlocked in the visible menu');
    if (await practice.getAttribute('aria-pressed') !== 'true') {
      out.stages.push({ levelSelection: await helper.clickControl(practice, { label: 'Select naturally unlocked Shadow Match Level 5' }) });
    }
    originalSound = await soundState(page);
    ok(typeof originalSound === 'boolean', 'Visible sound preference control is unavailable');
    if (!originalSound) {
      soundRestored = await setSound(page, helper, true);
      ok(soundRestored === true, 'Could not turn packaged Shadow Match audio on through the visible control');
    }
    const before = await keySnapshot(page);
    const parentBefore = await helper.snapshotStorage();
    const play = btn(page, 'Play Shadow Match');
    out.stages.push({ start: await helper.clickControl(play, { label: 'Start selected Shadow Match Level 5' }) });

    const active = page.locator('[data-little-game="shadowmatch"][data-little-phase="play"]');
    await waitVisible(page, active, 'Shadow Match Level 5 play phase');
    const target = page.getByRole('button', { name: / — drag to its shadow$/ }).first();
    await waitVisible(page, target, 'Visible named Shadow Match target');
    const targetLabel = await target.getAttribute('aria-label');
    const targetImage = target.locator('img').first();
    ok(await targetImage.count() === 1 && await targetImage.isVisible(), 'Visible target art is missing');
    const targetSrc = await targetImage.evaluate(image => image.currentSrc || image.src);
    const options = page.getByRole('button', { name: /^Shadow option \d+$/ });
    const optionRows = [];
    for (let index = 0; index < await options.count(); index += 1) {
      const option = options.nth(index);
      const geometry = await helper.measureControl(option, `Visible Shadow Match option ${index + 1}`);
      const image = option.locator('img').first();
      ok(await image.count() === 1 && await image.isVisible(), `Option ${index + 1} art is missing`);
      optionRows.push({ button: option, index, src: await image.evaluate(element => element.currentSrc || element.src), geometry });
    }
    const matches = optionRows.filter(row => row.src === targetSrc);
    ok(matches.length === 1, `Visible target image matched ${matches.length} option images; expected exactly one`);
    const correct = matches[0];
    const wrong = optionRows.find(row => row.src !== targetSrc);
    ok(wrong, 'No visibly distinct wrong Shadow Match option was available');
    const targetGeometry = await helper.measureControl(target, 'Visible Shadow Match drag source');
    out.target = { visibleName: targetLabel, image: targetSrc, sourceGeometry: targetGeometry, options: optionRows.map(({ index, src, geometry }) => ({ index: index + 1, image: src, geometry })) };

    await helper.clickControl(wrong.button, { label: 'Choose a visibly different Shadow Match option' });
    await waitVisible(page, page.getByRole('status').filter({ hasText: /Not this one yet/ }), 'Wrong-shadow feedback');
    ok(await target.getAttribute('aria-label') === targetLabel, 'Wrong option changed the visible target instead of retaining the challenge');
    ok(await targetImage.evaluate(image => image.currentSrc || image.src) === targetSrc, 'Wrong option changed the visible target art');
    out.wrongAttemptRetainedSameTarget = true;

    client = await page.context().newCDPSession(page);
    await client.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
    out.touch.enabled = true;
    await page.evaluate(() => {
      window.__pair18ShadowTouchEvents = [];
      for (const type of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) {
        document.addEventListener(type, event => window.__pair18ShadowTouchEvents.push({
          type, pointerType: event.pointerType, x: event.clientX, y: event.clientY,
          button: event.target.closest('button')?.getAttribute('aria-label') || null,
        }), true);
      }
    });
    const center = async locator => {
      const box = await locator.boundingBox();
      ok(box && box.width >= 44 && box.height >= 44, 'Touch target geometry fell below 44px');
      ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= width && box.y + box.height <= height, 'Touch target is outside the phone viewport');
      return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    };
    const from = await center(target), to = await center(correct.button);
    const next = btn(page, 'Next match →');
    const progress = page.getByRole('progressbar', { name: 'Rounds done' });
    const progressBeforeCancel = await progress.getAttribute('aria-valuenow');
    await touchPath(client, from, { x: from.x + (to.x - from.x) * 0.5, y: from.y + (to.y - from.y) * 0.5 }, 'touchCancel', 4);
    await page.waitForTimeout(300);
    ok(!(await next.count() && await next.isVisible()), 'Cancelled touch was incorrectly credited');
    ok(await target.getAttribute('aria-label') === targetLabel, 'Cancelled touch changed the visible target');
    ok(await progress.getAttribute('aria-valuenow') === progressBeforeCancel, 'Cancelled touch changed Shadow Match progress');
    const cancelEvents = await page.evaluate(() => window.__pair18ShadowTouchEvents || []);
    out.touch.cancelPointerEventObserved = cancelEvents.some(event => event.pointerType === 'touch' && event.type === 'pointercancel');
    ok(out.touch.cancelPointerEventObserved, 'CDP touchCancel did not reach the game as pointercancel');
    out.touch.cancelRejected = true;
    out.touch.cancelInput = 'Input.dispatchTouchEvent touchCancel';

    await touchPath(client, from, to, 'touchEnd', 8);
    await waitVisible(page, next, 'Held fact after real touch drag', 2200);
    out.touch.dragMatched = true;
    const progressAtHeldFact = await progress.getAttribute('aria-valuenow');
    out.touch.events = await page.evaluate(() => window.__pair18ShadowTouchEvents || []);
    ok(out.touch.events.some(event => event.pointerType === 'touch' && event.type === 'pointerdown'), 'No touch pointerdown reached the game');
    ok(out.touch.events.some(event => event.pointerType === 'touch' && event.type === 'pointerup'), 'No touch pointerup reached the game');
    out.heldFact = (await active.innerText()).trim().slice(0, 600);

    const hear = btn(page, targetLabel.replace(/ — drag to its shadow$/, '') === 'Pterodactyl' ? 'Hear the name again' : 'Hear the fact again');
    out.packagedAudio = await helper.observePackagedPlayback(hear, 'Hear held Shadow Match fact');
    out.nextGeometry = await helper.measureControl(next, 'Held-fact Next match control');
    ok(await progress.getAttribute('aria-valuenow') === progressAtHeldFact, 'Playing the held fact advanced Shadow Match progress');

    const leave = btn(page, 'Go home').last();
    out.parentReturn = await helper.clickLeave(leave, { label: 'Leave Shadow Match while the fact remains held' });
    await waitVisible(page, page.getByRole('heading', { name: 'Thinking & Play', exact: true }), 'Amari parent after leaving held fact');
    soundRestored = await setSound(page, helper, originalSound);
    ok(soundRestored === originalSound, 'Original sound preference did not restore through its visible control');
    out.sound = { original: originalSound, restored: soundRestored };
    const after = await keySnapshot(page);
    const allAfter = await helper.snapshotStorage();
    out.persistence = {
      gameAndRewardKeysUnchanged: sameSnapshot(before, after),
      before, after,
      parentPointsAndClaimsUnchanged: ['amari_rewards_v2', 'askia_rewards_v2'].every(key => parentBefore[key]?.sha256 === allAfter[key]?.sha256 && parentBefore[key]?.bytes === allAfter[key]?.bytes),
    };
    ok(out.persistence.gameAndRewardKeysUnchanged, 'Shadow progress or either player reward record changed before Next');
    ok(out.persistence.parentPointsAndClaimsUnchanged, 'Parent reward storage changed before Next');
    ok(await soundState(page) === originalSound, 'Sound preference did not remain restored after parent return');
    helper.assertNoProviderAttempts();
    out.errors = helper.assertNoRuntimeErrors();
    out.providerAttempts = [...helper.diagnostics.providerAttempts];
    out.passed = true;
    return out;
  } catch (error) {
    out.failure = { message: String(error?.message || error), stack: String(error?.stack || '').split('\n').slice(0, 8).join('\n') };
    try { await page.screenshot({ path: failurePath, type: 'jpeg', quality: 55, fullPage: false, timeout: 2500 }); out.failure.screenshot = failurePath; } catch {}
    out.providerAttempts = [...helper.diagnostics.providerAttempts];
    out.errors = { ...helper.diagnostics };
    return out;
  } finally {
    if (client) {
      await client.send('Emulation.setTouchEmulationEnabled', { enabled: false }).catch(() => {});
      out.touch.enabled = false;
      await client.detach().catch(() => {});
    }
    try {
      if (originalSound !== null && await soundState(page) !== originalSound) await setSound(page, helper, originalSound);
    } catch {}
    await helper.dispose().catch(() => {});
    page.setDefaultTimeout(30000);
  }
};
