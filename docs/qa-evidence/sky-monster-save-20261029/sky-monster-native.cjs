// Pair 14 actual-visible-control acceptance driver. Caller supplies the active
// Playwright page; this module never opens a browser or writes app storage.
const createIntegrationNative = require('./integration-native.cjs');

const button = (page, name) => page.getByRole('button', { name, exact: true });
const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
const visibleText = async locator => clean(await locator.innerText());
const MATH_EPISODES = [
  { id: 'count-garden', title: 'Count to 10' },
  { id: 'number-workshop', title: 'Add and Take Away' },
  { id: 'story-bridge', title: 'Monster Story Problems' },
];
async function soundState(page) {
  const control = page.getByRole('button', { name: /^Turn sound (on|off)$/ }).first();
  if (!await control.count()) return null;
  return (await control.getAttribute('aria-label')) === 'Turn sound off';
}
async function setSound(page, helper, wanted) {
  const current = await soundState(page);
  if (current === null || current === wanted) return current;
  await helper.clickControl(button(page, current ? 'Turn sound off' : 'Turn sound on'), { label: wanted ? 'Enable packaged sound for acceptance' : 'Restore original sound preference' });
  return soundState(page);
}
const sha256 = async page => page.evaluate(async () => {
  const rows = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i); if (key === null) continue;
    const raw = localStorage.getItem(key) ?? '';
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
    rows.push([key, { bytes: new TextEncoder().encode(raw).length, sha256: [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, '0')).join('') }]);
  }
  return Object.fromEntries(rows);
});

async function clickNavigation(page, helper, locator, label) {
  if (await locator.count() !== 1 || !await locator.isVisible()) throw new Error(`${label} is not uniquely visible`);
  await locator.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'nearest' }));
  return helper.clickControl(locator, { label });
}
async function selectAmariAtHome(page, helper, expectedGame = null) {
  await helper.installGuards();
  await page.waitForFunction(() => window.__amariQaNamespaced === true, null, { timeout: 2000 });
  const player = page.getByRole('button', { name: /Age 6\+.*Amari/ }).first();
  const chooser = page.getByRole('heading', { name: 'Choose a world', exact: true });
  const gameTitles = expectedGame ? [expectedGame] : ['Sky Shapes', 'Monster Math'];
  const surfaces = [
    player.waitFor({ state: 'visible', timeout: 2000 }).then(() => 'player-chooser'),
    chooser.waitFor({ state: 'visible', timeout: 2000 }).then(() => 'world-chooser'),
  ];
  for (const title of gameTitles) surfaces.push(page.getByRole('heading', { name: title, exact: true }).first().waitFor({ state: 'visible', timeout: 2000 }).then(() => `game-intro:${title}`));
  const initialSurface = await Promise.race(surfaces).catch(() => { throw new Error('Normal Amari chooser or the expected game intro did not mount after bounded navigation/reload'); });
  if (initialSurface === 'player-chooser') await clickNavigation(page, helper, player, 'Choose Amari in the normal player picker');
  if (initialSurface === 'player-chooser') await chooser.waitFor({ state: 'visible', timeout: 2000 });
  if (initialSurface === 'world-chooser') await chooser.waitFor({ state: 'visible', timeout: 2000 });
  return { ...(await helper.assertRuntime()), initialSurface };
}
async function ensureReloadedGameIntro(page, helper, title, world) {
  const surface = await selectAmariAtHome(page, helper, title);
  if (surface.initialSurface !== `game-intro:${title}`) await enterGame(page, helper, title, world);
  await page.getByRole('heading', { name: title, exact: true }).waitFor({ state: 'visible', timeout: 2000 });
  return surface;
}
async function enterQaHome(page, helper, origin, width, height) {
  await helper.installGuards();
  await page.setViewportSize({ width, height });
  await page.goto(`${origin}/?qa_pair14_sky_monster=${Date.now()}#/home`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  return selectAmariAtHome(page, helper);
}
async function returnHomeIfNeeded(page, helper) {
  const chooser = page.getByRole('heading', { name: 'Choose a world', exact: true });
  if (await chooser.count() && await chooser.isVisible()) return;
  const home = button(page, 'Back to home');
  await clickNavigation(page, helper, home, 'Return to normal world chooser');
  await chooser.waitFor({ timeout: 2000 });
}
async function enterGame(page, helper, title, world) {
  await returnHomeIfNeeded(page, helper);
  const worldCard = page.locator('.discovery-world-card').filter({ hasText: world });
  await clickNavigation(page, helper, worldCard, `${world} world`);
  const catalogueCard = page.locator('.catalogue-game-card').filter({ hasText: title });
  await clickNavigation(page, helper, catalogueCard, `${title} catalogue entry`);
  await catalogueCard.waitFor({ state: 'hidden', timeout: 2000 });
  await page.locator('main:visible').first().waitFor({ timeout: 2000 });
}
async function leaveGame(page, helper, title, world) {
  const headerBack = button(page, 'Back to learning world');
  const doneBack = button(page, 'Back to world');
  const leave = await headerBack.count() === 1 && await headerBack.isVisible()
    ? headerBack
    : await doneBack.count() === 1 && await doneBack.isVisible() ? doneBack : null;
  if (!leave) throw new Error(`${title} has no visible, uniquely selectable parent-return control`);
  await helper.clickLeave(leave, { label: `${title} return to world` });
  await page.getByRole('heading', { name: world, exact: true }).waitFor({ timeout: 2000 });
  await page.locator('.discovery-world-page').getByText(title, { exact: true }).waitFor({ timeout: 2000 });
}

async function gameSnapshot(page, key) {
  return page.evaluate(name => {
    const raw = localStorage.getItem(name);
    let value = null; try { value = raw === null ? null : JSON.parse(raw); } catch { /* retained below */ }
    return { raw, value, malformed: raw !== null && value === null };
  }, key);
}
async function armStorageFault(page, mode, key) {
  return page.evaluate(({ mode, key }) => {
    if (window.__pair14StorageFault) throw new Error('Pair 14 storage fault is already armed');
    const proto = Storage.prototype;
    const state = { mode, key, fired: false, didSet: false, originalGetItem: proto.getItem, originalSetItem: proto.setItem };
    proto.setItem = function (name, value) {
      if (this === window.localStorage && state.mode === 'write' && name === state.key && !state.fired) { state.fired = true; throw new Error('Synthetic Pair 14 local progress write failure'); }
      const result = state.originalSetItem.call(this, name, value);
      if (this === window.localStorage && state.mode === 'readback' && name === state.key) state.didSet = true;
      return result;
    };
    proto.getItem = function (name) {
      if (this === window.localStorage && state.mode === 'readback' && state.didSet && name === state.key && !state.fired) { state.fired = true; return '__pair14_unconfirmed_readback__'; }
      return state.originalGetItem.call(this, name);
    };
    window.__pair14StorageFault = state;
    return { mode, key };
  }, { mode, key });
}
async function restoreStorageFault(page) {
  return page.evaluate(() => {
    const state = window.__pair14StorageFault;
    if (!state) return { restored: true, armed: false };
    Storage.prototype.getItem = state.originalGetItem;
    Storage.prototype.setItem = state.originalSetItem;
    delete window.__pair14StorageFault;
    return { restored: true, fired: state.fired, didSet: state.didSet, mode: state.mode, key: state.key };
  });
}
async function runFaultedClick(page, helper, locator, mode, key, label) {
  await armStorageFault(page, mode, key);
  let state;
  try { await helper.clickControl(locator, { label }); }
  finally { state = await restoreStorageFault(page); }
  if (!state?.fired) throw new Error(`${label}: ${mode} fault did not reach exact key ${key}`);
  return state;
}
async function parentRewardSnapshot(page) {
  return page.evaluate(() => {
    const key = 'qa_rewards_20261024_amari_rewards_v2';
    const raw = localStorage.getItem(key);
    let value = null; try { value = raw === null ? null : JSON.parse(raw); } catch { /* keep raw evidence */ }
    return { key, raw, points: Number(value?.points) || 0, rewardClaims: value?.rewardClaims || {} };
  });
}
async function parentFaultRecovery(page, helper, initialRetryLocator, recoveryRetryLocator, label, claims) {
  // The namespace shim maps this app-facing logical key to the synthetic QA key.
  const key = 'amari_rewards_v2';
  const expectedClaims = Array.isArray(claims) ? claims : [claims];
  if (!expectedClaims.length || expectedClaims.some(item => !item?.token || !Number.isInteger(item.delta) || item.delta < 1)) throw new Error(`${label}: no positive pending parent receipts were supplied`);
  const before = await parentRewardSnapshot(page);
  const preclaimed = expectedClaims.filter(item => Number(before.rewardClaims?.[item.token] || 0) === item.delta);
  if (expectedClaims.some(item => !preclaimed.includes(item) && Number(before.rewardClaims?.[item.token] || 0) !== 0)) throw new Error(`${label}: an expected receipt token has an unexpected preexisting parent amount`);
  const toPay = expectedClaims.filter(item => !preclaimed.includes(item));
  if (!toPay.length) {
    await helper.clickControl(initialRetryLocator, { label: `${label}: confirm already-persisted parent rewards` });
    const final = await parentRewardSnapshot(page);
    if (final.raw !== before.raw) throw new Error(`${label}: confirming preexisting parent rewards changed the global record`);
    return { faultExercised: false, reason: 'All natural receipt tokens were already present in the parent record; visible Retry confirmed them without a new parent write.', initialPoints: before.points, finalPoints: final.points, exactClaims: expectedClaims, retryIdempotent: true };
  }
  const expectedDelta = toPay.reduce((sum, item) => sum + item.delta, 0);
  const write = await runFaultedClick(page, helper, initialRetryLocator, 'write', key, `${label}: block parent receipt write`);
  if ((await parentRewardSnapshot(page)).raw !== before.raw) throw new Error(`${label}: blocked parent write changed the reward record`);
  const retryLocator = typeof recoveryRetryLocator === 'function' ? recoveryRetryLocator() : recoveryRetryLocator;
  await retryLocator.waitFor({ state: 'visible', timeout: 2000 });
  const readback = await runFaultedClick(page, helper, retryLocator, 'readback', key, `${label}: hide committed parent readback`);
  if (!readback.didSet) throw new Error(`${label}: parent readback fault did not follow a committed write`);
  await retryLocator.waitFor({ state: 'visible', timeout: 2000 });
  const committed = await parentRewardSnapshot(page);
  const changedTokens = [...new Set([...Object.keys(before.rewardClaims), ...Object.keys(committed.rewardClaims)])].filter(token => Number(before.rewardClaims[token] || 0) !== Number(committed.rewardClaims[token] || 0));
  const paidAtReadback = toPay.filter(item => Number(committed.rewardClaims?.[item.token] || 0) === Number(before.rewardClaims?.[item.token] || 0) + item.delta);
  const changedOutsideExpected = changedTokens.filter(token => !expectedClaims.some(item => item.token === token));
  const unpaidChanged = changedTokens.filter(token => !paidAtReadback.some(item => item.token === token));
  const paidDeltaAtReadback = paidAtReadback.reduce((sum, item) => sum + item.delta, 0);
  if (!paidAtReadback.length || changedOutsideExpected.length || unpaidChanged.length || committed.points !== before.points + paidDeltaAtReadback
    || expectedClaims.some(item => !paidAtReadback.includes(item) && Number(committed.rewardClaims?.[item.token] || 0) !== Number(before.rewardClaims?.[item.token] || 0))) {
    throw new Error(`${label}: parent readback fault committed an unexpected receipt subset`);
  }
  await helper.clickControl(retryLocator, { label: `${label}: confirm the same parent reward after restoring storage` });
  const final = await parentRewardSnapshot(page);
  const finalChangedTokens = [...new Set([...Object.keys(committed.rewardClaims), ...Object.keys(final.rewardClaims)])].filter(token => Number(committed.rewardClaims[token] || 0) !== Number(final.rewardClaims[token] || 0));
  const unpaidAfterReadback = toPay.filter(item => !paidAtReadback.includes(item));
  const expectedFinalChanges = unpaidAfterReadback.map(item => item.token).sort();
  if (JSON.stringify(finalChangedTokens.sort()) !== JSON.stringify(expectedFinalChanges)
    || final.points !== before.points + expectedDelta
    || expectedClaims.some(item => Number(final.rewardClaims?.[item.token] || 0) !== (preclaimed.includes(item) ? item.delta : Number(before.rewardClaims?.[item.token] || 0) + item.delta))) {
    throw new Error(`${label}: final parent retry duplicated, lost, or added an unexpected saved reward`);
  }
  return { write, readback, initialPoints: before.points, readbackPoints: committed.points, readbackConfirmedClaims: paidAtReadback, finalPoints: final.points, exactClaims: expectedClaims, exactDelta: expectedDelta, retryIdempotent: true };
}
async function waitForHiddenText(page, text, timeout = 2000) {
  const locator = page.getByRole('status').filter({ hasText: text }).first();
  if (await locator.count()) await locator.waitFor({ state: 'hidden', timeout });
}
async function waitForClaimedMathReceipt(page, receiptId, timeout = 2000) {
  await page.waitForFunction(id => {
    try { return JSON.parse(localStorage.getItem('amari_monster_math_progress_v1') || 'null')?.rewardReceipts?.[id]?.claimed === true; }
    catch { return false; }
  }, receiptId, { timeout, polling: 100 });
}
async function waitForClaimedSkyReceipt(page, receiptId, timeout = 2000) {
  await page.waitForFunction(id => {
    try { return JSON.parse(localStorage.getItem('amari_sky_shapes_progress_v1') || 'null')?.rewardReceipts?.find(item => item.id === id)?.parentClaimed === true; }
    catch { return false; }
  }, receiptId, { timeout, polling: 100 });
}
function changedStorage(before, after, allowed) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const changed = [...keys].filter(key => before[key]?.sha256 !== after[key]?.sha256 || before[key]?.bytes !== after[key]?.bytes).sort();
  const normalized = key => key.replace(/^qa_rewards_20261024_/, '');
  return { changed, unexpected: changed.filter(key => !allowed.includes(normalized(key))), unchanged: [...keys].filter(key => !changed.includes(key)).sort() };
}
function assertExpectedStorage(before, after, allowed) {
  const delta = changedStorage(before, after, allowed);
  if (delta.unexpected.length) throw new Error(`Unexpected stored-key changes: ${JSON.stringify(delta.unexpected)}`);
  return delta;
}

async function waitEnabled(locator, label, timeout = 2000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (await locator.isVisible().catch(() => false) && await locator.isEnabled().catch(() => false)) return;
    await locator.page().waitForTimeout(100);
  }
  throw new Error(`${label} did not enable in time`);
}
function numberList(text) { return [...text.matchAll(/\d+/g)].map(m => Number(m[0])); }
async function answerForMath(page, prompt) {
  const values = numberList(prompt);
  if (/take away|gives? .* away|how many .* left/i.test(prompt)) {
    if (values.length < 2) throw new Error(`Cannot derive visible subtraction answer: ${prompt}`);
    return values[0] - values[1];
  }
  if (/plus|finds? .* more|how many .* now|altogether/i.test(prompt)) {
    if (values.length < 2) throw new Error(`Cannot derive visible addition answer: ${prompt}`);
    return values[0] + values[1];
  }
  if (/how many/i.test(prompt)) {
    const model = page.getByRole('group', { name: 'Counting pictures', exact: true });
    if (await model.count() !== 1 || !await model.isVisible().catch(() => false)) throw new Error(`Monster Math count wording has no visible Counting pictures model or arithmetic operation: ${prompt}`);
    const count = await model.getByRole('img').count();
    if (!count) throw new Error('Monster Math count question has no visible picture model');
    return count;
  }
  throw new Error(`Unrecognized visible Monster Math prompt: ${prompt}`);
}
async function guidedReadout(page) {
  const readout = page.getByText(/^At \d+\. (?:\d+ jumps? to go|All jumps done)\.$/).first();
  if (await readout.count() !== 1 || !await readout.isVisible().catch(() => false)) return null;
  const text = await visibleText(readout);
  const match = text.match(/^At (\d+)\. (?:(\d+) jumps? to go|All jumps done)\.$/);
  return match ? { text, position: Number(match[1]), remaining: match[2] === undefined ? 0 : Number(match[2]), locator: readout } : null;
}
async function measureGuidedReadout(readout, label) {
  const geometry = await readout.locator.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return { text: (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim(), rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom }, viewport: { width: innerWidth, height: innerHeight } };
  });
  const { rect, viewport } = geometry;
  if (!geometry.text || rect.width <= 0 || rect.height <= 0 || rect.x < 0 || rect.y < 0 || rect.right > viewport.width || rect.bottom > viewport.height) {
    throw new Error(`${label} is not visibly contained in the viewport: ${JSON.stringify(geometry)}`);
  }
  return geometry;
}
async function waitGuidedReadoutChange(page, previousText) {
  const deadline = Date.now() + 2000;
  while (Date.now() < deadline) {
    const current = await guidedReadout(page);
    if (current && current.text !== previousText) return current;
    await page.waitForTimeout(50);
  }
  throw new Error(`Monster Math guided readout did not change within 2 seconds after a visible step (was ${previousText})`);
}
async function exerciseGuidedJumps(page, helper, answerOptions, episodeNo, questionNo) {
  const tryJumps = button(page, 'Try the jumps');
  if (await tryJumps.count() !== 1 || !await tryJumps.isVisible()) throw new Error('Visible number-line question did not expose Try the jumps');
  const clueGeometry = await helper.measureControl(tryJumps, `Monster Math episode ${episodeNo} question ${questionNo} Try the jumps`);
  await helper.clickControl(tryJumps, { label: `Reveal guided number-line steps for episode ${episodeNo} question ${questionNo}` });
  let current = await guidedReadout(page);
  if (!current || current.remaining < 1 || current.remaining > 20) throw new Error('Visible guided number-line readout is missing or exceeds the 20-step budget');
  const stepButton = page.getByRole('button', { name: /^Jump one step (forward|back)$/ });
  const restartButton = button(page, 'Start again');
  if (await stepButton.count() !== 1 || !await stepButton.isVisible()) throw new Error('Guided number-line step control is missing');
  const stepGeometry = await helper.measureControl(stepButton, `Monster Math episode ${episodeNo} question ${questionNo} Jump one step`);
  const answerGeometries = [];
  for (let i = 0; i < await answerOptions.count(); i += 1) {
    answerGeometries.push(await helper.measureControl(answerOptions.nth(i), `Monster Math guided answer option ${i + 1}`));
  }
  const label = await visibleText(stepButton);
  const direction = label.endsWith('forward') ? 1 : label.endsWith('back') ? -1 : 0;
  if (!direction) throw new Error(`Guided step direction is not visible in the control copy: ${label}`);
  const reads = [current.text];
  const readoutGeometries = [await measureGuidedReadout(current, 'Monster Math guided starting readout')];
  let steps = 0;
  while (current.remaining > 0 && steps < 20) {
    const before = current;
    await helper.clickControl(stepButton, { label: `Take guided number-line step ${steps + 1}` });
    current = await waitGuidedReadoutChange(page, before.text);
    if (current.remaining !== before.remaining - 1 || current.position !== before.position + direction) throw new Error(`Guided number-line readout did not advance one ${direction > 0 ? 'forward' : 'backward'} step: ${before.text} → ${current.text}`);
    reads.push(current.text);
    readoutGeometries.push(await measureGuidedReadout(current, `Monster Math guided readout after step ${steps + 1}`));
    steps += 1;
    if (steps === 1 && await restartButton.count() === 1 && await restartButton.isVisible()) {
      await helper.measureControl(restartButton, `Monster Math episode ${episodeNo} question ${questionNo} Start again after one visible step`);
    }
  }
  if (current.remaining !== 0 || !/All jumps done\.$/.test(current.text)) throw new Error('Guided number-line did not visibly finish within 20 actual steps');
  const finalAnswerGeometries = [];
  for (let i = 0; i < await answerOptions.count(); i += 1) {
    finalAnswerGeometries.push(await helper.measureControl(answerOptions.nth(i), `Monster Math guided final answer option ${i + 1}`));
  }
  return { clueGeometry, stepGeometry, answerGeometries, finalAnswerGeometries, stepLabel: label, steps, readouts: reads, readoutGeometries, completed: true };
}
async function mathTaskIdentity(promptLocator, modelLocator) {
  const prompt = await visibleText(promptLocator);
  const model = await modelLocator.evaluate(element => ({
    label: element.getAttribute('aria-label') || '',
    text: (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim(),
    pictures: [...element.querySelectorAll('[role="img"]')].map(item => item.getAttribute('aria-label') || item.textContent || ''),
  }));
  return `${prompt}|${model.label}|${model.text}|${model.pictures.join(',')}`;
}
async function exerciseMonsterQuestion(page, helper, episodeNo, questionNo, faults, evidence, parentFaultEligible = false, pendingReloadEligible = false, wrongRetry = true) {
  const episodeMeta = MATH_EPISODES[episodeNo - 1];
  if (!episodeMeta) throw new Error(`Monster Math episode ${episodeNo} is outside the authored episode map`);
  const promptLocator = page.locator('main h2[aria-live="polite"]').first();
  await promptLocator.waitFor({ state: 'visible', timeout: 2000 });
  const prompt = await visibleText(promptLocator);
  const answer = await answerForMath(page, prompt);
  // The prompt text itself is the stable semantic task identity; validate the
  // picture or ten-frame model from visible DOM and rendered geometry only.
  const countPictures = page.getByRole('group', { name: 'Counting pictures', exact: true });
  const numberLineTitle = page.getByText('Number line · follow each jump', { exact: true });
  const isNumberLine = await numberLineTitle.count() === 1 && await numberLineTitle.isVisible().catch(() => false);
  const numberLinePanel = page.locator('main > div > div').filter({ has: numberLineTitle });
  const isCountPictures = /how many/i.test(prompt) && await countPictures.count() === 1 && await countPictures.isVisible().catch(() => false);
  const modelLocator = isNumberLine && await numberLinePanel.count() === 1
    ? numberLinePanel
    : isCountPictures ? countPictures
      : page.locator('[aria-label*="counters"], [aria-label*="counters;"], [aria-label*="counter"]').first();
  if (await modelLocator.count() !== 1) throw new Error(`Question ${questionNo}: visible answer model is not unique`);
  const identity = await mathTaskIdentity(promptLocator, modelLocator);
  const modelGeometry = await helper.measureControl(modelLocator, `Monster Math episode ${episodeNo} question ${questionNo} model`);
  const options = page.getByRole('group', { name: 'Choose the answer', exact: true }).getByRole('button');
  if (await options.count() !== 4) throw new Error(`Question ${questionNo}: expected four visible answer options`);
  const optionRows = [];
  let wrong = null, correct = null;
  for (let i = 0; i < await options.count(); i += 1) {
    const item = options.nth(i); const text = await visibleText(item);
    const geometry = await helper.measureControl(item, `Monster Math option ${text}`);
    optionRows.push({ text, geometry });
    if (Number(text) === answer) correct = item;
    else if (!wrong) wrong = item;
  }
  if (!wrong || !correct) throw new Error(`Question ${questionNo}: visible options do not contain a distractor and model answer ${answer}`);
  const guidedCandidate = episodeNo === 3 && !wrongRetry && isNumberLine && !evidence.guidedJump?.attempted;
  const useWrongRetry = wrongRetry || guidedCandidate || (episodeNo === 3 && questionNo === 6 && !evidence.guidedJump?.attempted);
  let retryText = '';
  if (useWrongRetry) {
    await helper.clickControl(wrong, { label: `Monster Math episode ${episodeNo} question ${questionNo} wrong answer` });
    if (await mathTaskIdentity(promptLocator, modelLocator) !== identity) throw new Error(`Episode ${episodeNo} question ${questionNo} advanced after the wrong answer`);
    retryText = await visibleText(page.locator('main').getByText('Not yet. Try the clue, then count the model again.', { exact: true }));
    if (!retryText) throw new Error(`Episode ${episodeNo} question ${questionNo} did not show retry feedback`);
  }
  let guidedJump = null;
  if (guidedCandidate) {
    evidence.guidedJump = { attempted: true, exercised: false, episode: episodeNo, question: questionNo, prompt: identity };
    try {
      guidedJump = await exerciseGuidedJumps(page, helper, options, episodeNo, questionNo);
      evidence.guidedJump = { ...evidence.guidedJump, ...guidedJump, exercised: true };
    } catch (error) {
      evidence.guidedJump.failure = String(error?.message || error);
      throw error;
    }
  } else if (episodeNo === 3 && questionNo === 6 && !evidence.guidedJump?.attempted && !isNumberLine) {
    evidence.guidedJump = { attempted: false, exercised: false, reason: 'No visible number-line model appeared in the chapter before its sixth question; that final question retained the chapter’s single wrong retry.' };
  }
  const audio = await helper.observePackagedPlayback(button(page, 'Hear the question again'), `Monster Math episode ${episodeNo} question ${questionNo} narration`);
  await helper.clickControl(correct, { label: `Monster Math episode ${episodeNo} question ${questionNo} model answer` });
  const held = page.locator('main p').filter({ hasText: /./ }).last();
  await held.waitFor({ state: 'visible', timeout: 2000 });
  const next = page.getByRole('button', { name: /^(Next question|Finish episode)$/ });
  await waitEnabled(next, `Monster Math episode ${episodeNo} question ${questionNo} held Next`, 4000);
  const nextGeometry = await helper.measureControl(next, `Monster Math episode ${episodeNo} question ${questionNo} held Next`);
  const explanation = await visibleText(held);
  if (!explanation || (retryText && explanation === retryText)) throw new Error(`Episode ${episodeNo} question ${questionNo} missing held explanation`);
  let faultEvidence = null;
  let parentRewardRecovery = null;
  let pendingReloadRecovery = null;
  if (faults && parentFaultEligible && questionNo === 6) {
    const before = await gameSnapshot(page, 'amari_monster_math_progress_v1');
    const write = await runFaultedClick(page, helper, next, 'write', 'amari_monster_math_progress_v1', 'Monster Math held final answer with local progress write blocked');
    const retry = button(page, 'Retry saving this result');
    await retry.waitFor({ state: 'visible', timeout: 2000 });
    const held = await helper.measureControl(retry, 'Monster Math held completion Retry');
    const writeAfter = await gameSnapshot(page, 'amari_monster_math_progress_v1');
    if (writeAfter.raw !== before.raw) throw new Error('Monster Math blocked write changed the saved game record');
    const readback = await runFaultedClick(page, helper, retry, 'readback', 'amari_monster_math_progress_v1', 'Monster Math held final result with committed readback hidden');
    if (!readback.didSet) throw new Error('Monster Math readback fault did not follow a committed local write');
    await button(page, 'Retry saving this result').waitFor({ state: 'visible', timeout: 2000 });
    const committed = await gameSnapshot(page, 'amari_monster_math_progress_v1');
    if (committed.raw === before.raw) throw new Error('Monster Math readback fault did not commit the held result');
    const retryAfterReadback = button(page, 'Retry saving this result');
    if (parentFaultEligible) {
      const pendingClaims = Object.values(committed.value?.rewardReceipts || {}).filter(receipt => !receipt.claimed).map(receipt => ({ token: `dino:math:${receipt.id}`, delta: receipt.rewardDelta }));
      const rewardRecovery = await parentFaultRecovery(page, helper, retryAfterReadback, retryAfterReadback, `Monster Math ${episodeMeta.id}`, pendingClaims);
      parentRewardRecovery = rewardRecovery;
      faultEvidence = { write, readback, heldRetryGeometry: held, writeFailureStorageUnchanged: true, committedReadbackFailureHeld: true, finalRetryConfirmed: true, parentRewardRecovery };
      evidence.monsterFaults = faultEvidence;
      await page.getByText('Six questions complete', { exact: true }).waitFor({ state: 'visible', timeout: 2000 });
      const episodeWasEarned = (before.value?.completedEpisodeIds || []).includes(episodeMeta.id)
        || Number(before.value?.bestStars?.[episodeMeta.id]) > 0
        || Number(before.value?.unlockedEpisode || 0) > episodeNo - 1;
      const expectedBadge = episodeWasEarned ? 'Progress is saved. Replay to practise again.' : 'New episode badge saved for this child.';
      if (await page.getByText(expectedBadge, { exact: true }).count() !== 1) throw new Error('Monster Math parent-claim retry did not retain the expected episode completion status');
      faultEvidence.expectedBadgeStatus = expectedBadge;
      evidence.monsterFaults = faultEvidence;
    } else {
      await helper.clickControl(retryAfterReadback, { label: 'Confirm the same Monster Math result after restoring storage' });
    }
    if (!faultEvidence) faultEvidence = { write, readback, heldRetryGeometry: held, writeFailureStorageUnchanged: true, committedReadbackFailureHeld: true, finalRetryConfirmed: true, ...(parentRewardRecovery ? { parentRewardRecovery } : {}) };
    evidence.monsterFaults = faultEvidence;
  } else if (faults && pendingReloadEligible && questionNo === 6) {
    const progressKey = 'amari_monster_math_progress_v1';
    const pre = await gameSnapshot(page, progressKey);
    const episodeId = episodeMeta.id;
    const oldBest = Number(pre.value?.bestStars?.[episodeId]) || 0;
    const expectedDelta = Math.max(0, 3 - oldBest);
    const receiptId = `${episodeId}:best:3`;
    const parentBefore = await parentRewardSnapshot(page);
    if (expectedDelta > 0 && !pre.value?.rewardReceipts?.[receiptId]) {
      const token = `dino:math:${receiptId}`;
      const write = await runFaultedClick(page, helper, next, 'write', 'amari_rewards_v2', `Monster Math naturally earned ${episodeId} reward held for reload recovery`);
      const retry = button(page, 'Retry saving this result');
      await retry.waitFor({ state: 'visible', timeout: 2000 });
      const pending = await gameSnapshot(page, progressKey);
      const receipt = pending.value?.rewardReceipts?.[receiptId];
      if (!receipt || receipt.claimed !== false || receipt.rewardDelta !== expectedDelta) throw new Error('Monster Math did not persist the natural pending receipt before reload recovery');
      const parentDuringFailure = await parentRewardSnapshot(page);
      if (parentDuringFailure.raw !== parentBefore.raw) throw new Error('Monster Math blocked parent write changed the reward record');
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
      const reloadSurface = await ensureReloadedGameIntro(page, helper, 'Monster Math', 'Maths Missions');
      await waitForClaimedMathReceipt(page, receiptId);
      const recovered = await gameSnapshot(page, progressKey);
      const recoveredReceipt = recovered.value?.rewardReceipts?.[receiptId];
      const parentAfterReload = await parentRewardSnapshot(page);
      if (!recoveredReceipt?.claimed) throw new Error('Monster Math startup did not confirm the natural pending receipt after reload');
      if (parentAfterReload.points !== parentBefore.points + expectedDelta || Number(parentAfterReload.rewardClaims?.[token]) !== expectedDelta) throw new Error('Monster Math startup recovery did not apply exactly one matching parent reward');
      pendingReloadRecovery = { exercised: true, fault: write, reloadSurface: reloadSurface.initialSurface, receiptId, token, rewardDelta: expectedDelta, preReloadClaimed: receipt.claimed, postReloadClaimed: recoveredReceipt.claimed, pointsBefore: parentBefore.points, pointsAfter: parentAfterReload.points, startupDrainIdempotent: true };
      evidence.monsterPendingReloadRecovery = pendingReloadRecovery;
      faultEvidence = { pendingReloadRecovery };
      evidence.monsterFaults = faultEvidence;
    } else {
      await helper.clickControl(next, { label: 'Finish the naturally ineligible Monster Math episode without forcing a receipt' });
      evidence.monsterPendingReloadRecovery = { exercised: false, reason: 'No natural positive-delta receipt was eligible for the reload recovery fault lane.' };
    }
  } else {
    await helper.clickControl(next, { label: `Monster Math episode ${episodeNo} question ${questionNo} explicit Next` });
  }
  const row = { episode: episodeNo, question: questionNo, prompt: identity, answer, modelGeometry, options: optionRows, wrongRetryRetained: useWrongRetry, wrongRetry: useWrongRetry ? { promptRetained: true, feedback: retryText } : null, ...(guidedJump ? { guidedJump } : {}), audio: { packaged: true, events: audio.events.map(({ pathname, events }) => ({ pathname, events: events.map(e => e.type) })) }, heldExplanation: explanation, heldNextGeometry: nextGeometry, ...(faultEvidence ? { faultRecovery: faultEvidence } : {}) };
  if (questionNo < 6) {
    await promptLocator.waitFor({ state: 'visible', timeout: 2000 });
    const nextIdentity = await mathTaskIdentity(promptLocator, modelLocator);
    if (!nextIdentity || nextIdentity === identity) throw new Error(`Episode ${episodeNo} question ${questionNo} Next did not produce a distinct question`);
    row.nextTaskIdentity = nextIdentity;
  } else {
    if (!pendingReloadRecovery) await page.getByText('Six questions complete', { exact: true }).waitFor({ state: 'visible', timeout: 2000 });
    row.episodeComplete = true;
  }
  if (pendingReloadRecovery) row.pendingReloadRecovery = pendingReloadRecovery;
  return row;
}
async function chooseEpisode(page, helper, episodeNo) {
  const authored = MATH_EPISODES[episodeNo - 1];
  if (!authored) throw new Error(`Monster Math episode ${episodeNo} is outside the authored episode map`);
  const disclosure = page.locator('main details[aria-label="Episode choices"]');
  if (await disclosure.count() && !await disclosure.evaluate(el => el.open)) {
    await clickNavigation(page, helper, disclosure.locator('summary'), `Open secondary Monster Math episode choices for episode ${episodeNo}`);
  }
  const cards = disclosure.getByRole('button');
  let candidate = null;
  for (let i = 0; i < await cards.count(); i += 1) {
    const item = cards.nth(i); const text = await visibleText(item);
    if (new RegExp(`Episode ${episodeNo} ·`, 'i').test(text) && text.includes(authored.title)) { candidate = item; break; }
  }
  if (!candidate) throw new Error(`Monster Math episode ${episodeNo} map card is missing`);
  if (!await candidate.isEnabled()) throw new Error(`Monster Math episode ${episodeNo} is locked; natural progression cannot reach it`);
  await clickNavigation(page, helper, candidate, `Select naturally available Monster Math episode ${episodeNo}`);
  return authored;
}
async function runMonster(page, helper, evidence, faults = false) {
  await enterGame(page, helper, 'Monster Math', 'Maths Missions');
  const originalSound = await soundState(page);
  if (originalSound === null) throw new Error('Monster Math intro sound control is missing');
  if (await setSound(page, helper, true) !== true) throw new Error('Packaged audio could not be enabled through the visible sound control');
  evidence.soundPreference = { original: originalSound, enabledForAudio: true };
  const key = 'amari_monster_math_progress_v1';
  const initial = await gameSnapshot(page, key);
  if (initial.malformed) throw new Error('Monster Math progress is malformed at intro');
  const initialValue = initial.value || {};
  await waitForHiddenText(page, 'Checking saved episode rewards');
  const pendingBeforeIntroDrain = Object.values(initialValue.rewardReceipts || {}).filter(receipt => !receipt.claimed);
  for (const receipt of pendingBeforeIntroDrain) await waitForClaimedMathReceipt(page, receipt.id);
  const settledIntro = await gameSnapshot(page, key);
  const pendingAtIntro = Object.values(settledIntro.value?.rewardReceipts || {}).filter(receipt => !receipt.claimed);
  if (pendingAtIntro.length) throw new Error(`Monster Math intro left ${pendingAtIntro.length} natural pending reward receipt(s) undrained`);
  evidence.initialMonsterMath = { present: initial.raw !== null, unlockedEpisode: initialValue.unlockedEpisode ?? 0, completedEpisodeIds: initialValue.completedEpisodeIds || [], bestStars: initialValue.bestStars || {}, pendingBeforeIntroDrain: pendingBeforeIntroDrain.length, rewardReceipts: initialValue.rewardReceipts || {} };
  const rows = []; evidence.monsterMathRows = rows;
  const completedAtIntro = new Set(initialValue.completedEpisodeIds || []);
  const materialEpisodes = MATH_EPISODES.map((item, index) => ({
    ...item,
    episodeNo: index + 1,
    delta: Math.max(0, 3 - (Number(initialValue.bestStars?.[item.id]) || 0)),
    alreadyCompleted: completedAtIntro.has(item.id) || Number(initialValue.bestStars?.[item.id]) > 0,
  })).filter(item => item.delta > 0).sort((left, right) => Number(left.alreadyCompleted) - Number(right.alreadyCompleted) || left.episodeNo - right.episodeNo);
  const localParentFaultEpisode = faults ? materialEpisodes[0]?.episodeNo ?? null : null;
  const pendingReloadEpisode = faults ? materialEpisodes[1]?.episodeNo ?? null : null;
  evidence.monsterFaultEligibility = { naturallyMaterialEpisodes: materialEpisodes, localAndParentFaultEpisode: localParentFaultEpisode, pendingReloadEpisode };
  if (faults && localParentFaultEpisode === null) evidence.monsterFaults = { exercised: false, reason: 'No naturally incomplete or below-three-star episode can earn a positive delta for the local and parent fault chain.' };
  if (faults && pendingReloadEpisode === null) evidence.monsterPendingReloadRecovery = { exercised: false, reason: 'No second naturally incomplete or below-three-star episode can earn a positive delta for reload recovery.' };
  const runAndRetainQuestion = async (episode, q, useFaults, parentFaultEligible, pendingReloadEligible, wrongRetry) => {
    try {
      const row = await exerciseMonsterQuestion(page, helper, episode, q, useFaults, evidence, parentFaultEligible, pendingReloadEligible, wrongRetry);
      rows.push(row);
      return row;
    } catch (error) {
      rows.push({ episode, question: q, partial: true, failure: String(error?.message || error) });
      throw error;
    }
  };
  for (let episode = 1; episode <= 3; episode += 1) {
    if (episode > 1) {
      const map = button(page, 'Episode map');
      await helper.clickControl(map, { label: `Open Monster Math episode map after episode ${episode - 1}` });
    }
    const episodeMeta = await chooseEpisode(page, helper, episode);
    const start = page.getByRole('button', { name: /^(Start six questions|Replay this episode)$/ });
    await waitEnabled(start, `Monster Math episode ${episode} start after pending-reward drain`);
    if (faults && episode === 1 && !evidence.monsterIntroFaults) {
      const beforeStart = await gameSnapshot(page, key);
      const writeFault = await runFaultedClick(page, helper, start, 'write', key, 'Monster Math intro start with question-queue save blocked');
      const retryStart = button(page, 'Retry saving this episode');
      await retryStart.waitFor({ state: 'visible', timeout: 2000 });
      const retryGeometry = await helper.measureControl(retryStart, 'Monster Math intro held queue Retry');
      const afterFailedStart = await gameSnapshot(page, key);
      if (afterFailedStart.raw !== beforeStart.raw) throw new Error('Monster Math failed intro start changed saved progress');
      if (await page.locator('main h2[aria-live="polite"]').isVisible().catch(() => false)) throw new Error('Monster Math began the unsaved question queue before its Retry');
      await helper.clickControl(retryStart, { label: 'Retry the same held Monster Math episode queue' });
      await page.locator('main h2[aria-live="polite"]').waitFor({ state: 'visible', timeout: 2000 });
      evidence.monsterIntroFaults = { writeFault, retryGeometry, failedStartStorageUnchanged: true, didNotAutoplay: true, sameVisibleRetryStarted: true };
    } else {
      await helper.clickControl(start, { label: `Start Monster Math episode ${episode}` });
    }
    const parentFaultEligible = faults && episode === localParentFaultEpisode;
    const pendingReloadEligible = faults && episode === pendingReloadEpisode;
    let pendingReloadRecovered = false;
    for (let q = 1; q <= 6; q += 1) {
      const questionRow = await runAndRetainQuestion(episode, q, faults, parentFaultEligible, pendingReloadEligible, episode === 3 ? false : q === 1);
      if (questionRow.pendingReloadRecovery?.exercised) pendingReloadRecovered = true;
    }
    const replayBefore = await gameSnapshot(page, key);
    const parentBefore = await parentRewardSnapshot(page);
    if (pendingReloadRecovered) {
      await chooseEpisode(page, helper, episode);
    } else {
      const episodeMap = button(page, 'Episode map');
      await helper.clickControl(episodeMap, { label: `Open Monster Math map to verify equal-or-lower replay for episode ${episode}` });
    }
    const replayCard = page.getByRole('button', { name: new RegExp(`^Episode ${episode} ·`) }).filter({ hasText: episodeMeta.title });
    const replayDisclosure = page.locator('main details[aria-label="Episode choices"]');
    if (await replayDisclosure.count() && !await replayDisclosure.evaluate(el => el.open)) {
      await clickNavigation(page, helper, replayDisclosure.locator('summary'), `Open Monster Math map choices for replay of episode ${episode}`);
    }
    await clickNavigation(page, helper, replayCard, `Select naturally completed Monster Math episode ${episode} for no-award replay`);
    const expectedBeforeReplay = Number(replayBefore.value?.bestStars?.[episodeMeta.id]) || 0;
    if (expectedBeforeReplay < 3) throw new Error(`Monster Math episode ${episode} normal run did not produce the three-star cap needed for an equal/lower replay: ${expectedBeforeReplay}`);
    await helper.clickControl(page.getByRole('button', { name: 'Replay this episode', exact: true }), { label: `Replay Monster Math episode ${episode} at one-star lower rating` });
    for (let q = 1; q <= 6; q += 1) await runAndRetainQuestion(episode, q, false, false, false, true);
    await page.getByText('Progress is saved. Replay to practise again.', { exact: true }).waitFor({ state: 'visible', timeout: 2000 });
    const replayAfter = await gameSnapshot(page, key);
    const parentAfter = await parentRewardSnapshot(page);
    if (parentAfter.points !== parentBefore.points || JSON.stringify(parentAfter.rewardClaims) !== JSON.stringify(parentBefore.rewardClaims)) throw new Error(`Monster Math episode ${episode} equal/lower replay changed parent rewards`);
    if (JSON.stringify(replayAfter.value?.rewardReceipts) !== JSON.stringify(replayBefore.value?.rewardReceipts)) throw new Error(`Monster Math episode ${episode} equal/lower replay changed reward receipts`);
    const replayStars = Number(replayAfter.value?.bestStars?.[episodeMeta.id]) || 0;
    if (replayStars !== expectedBeforeReplay) throw new Error(`Monster Math episode ${episode} lower replay lost its three-star best`);
    evidence[`monsterReplay${episode}`] = { pointsBefore: parentBefore.points, pointsAfter: parentAfter.points, parentClaimsUnchanged: true, rewardReceiptsUnchanged: true, bestStarsBefore: expectedBeforeReplay, replayStars: 1, retainedBestStars: replayStars };
  }
  const after = await gameSnapshot(page, key);
  if (!after.value || after.malformed) throw new Error('Monster Math persisted progress missing or malformed after all episodes');
  const parent = await parentRewardSnapshot(page);
  const mathReceipts = Object.values(after.value.rewardReceipts || {});
  for (const receipt of mathReceipts) {
    if (!receipt.claimed || !Number.isInteger(receipt.rewardDelta) || receipt.rewardDelta < 1 || receipt.id !== `${receipt.episodeId}:best:${receipt.bestStars}`) throw new Error(`Monster Math receipt is missing strict local claim confirmation: ${JSON.stringify(receipt)}`);
    if (Number(parent.rewardClaims?.[`dino:math:${receipt.id}`]) !== receipt.rewardDelta) throw new Error(`Monster Math parent claim missing or has the wrong positive delta for ${receipt.id}`);
  }
  const completeIds = ['count-garden', 'number-workshop', 'story-bridge'];
  for (const id of completeIds) if (!after.value.completedEpisodeIds?.includes(id)) throw new Error(`Monster Math episode receipt missing for ${id}`);
  evidence.monsterMathPersisted = { completedEpisodeIds: after.value.completedEpisodeIds, bestStars: after.value.bestStars, rewardReceipts: after.value.rewardReceipts, parentClaimsMatch: true, rawBytes: new TextEncoder().encode(after.raw).length };
  return { initial, after, originalSound };
}

const SKY_VISIBLE_NAME_TO_ID = Object.freeze({
  'Round Sun': 'sky-circle', 'Mountain Peak': 'sky-triangle', 'Window Cloud': 'sky-square', Kite: 'sky-diamond',
  'Heart Balloon': 'sky-heart', 'Bright Star': 'sky-star', 'Cloud House': 'sky-house', 'Puffy Cloud': 'sky-cloud',
  'Rocket Ship': 'sky-rocket', 'Winged Jet': 'sky-airplane', 'Sky Castle': 'sky-castle', 'Moon Observatory': 'sky-observatory',
});
async function traceVisibleSky(page, svg, helper, episodeNo, missionNo, faults, evidence, preexistingCompletedIds) {
  const identity = await svg.getAttribute('aria-label');
  const visibleMissionName = (identity?.match(/^Tracing board for (.+?)\./) || [])[1];
  const visibleMissionId = SKY_VISIBLE_NAME_TO_ID[visibleMissionName];
  if (!visibleMissionId) throw new Error(`Sky Shapes visible mission identity is not mapped: ${identity}`);
  const parentFaultEligible = faults && !preexistingCompletedIds.includes(visibleMissionId);
  const heading = await visibleText(page.locator('main').locator('div').filter({ hasText: /Flight \d+\/\d+/ }).first()).catch(() => '');
  const geometry = await helper.measureControl(svg, `Sky Shapes episode ${episodeNo} mission ${missionNo} tracing model`);
  const progress = page.getByRole('progressbar').first();
  const beforeProgress = await progress.getAttribute('aria-valuenow').catch(() => null);
  const box = await svg.boundingBox();
  if (!box) throw new Error('Sky Shapes visible route has no bounding box');
  const paths = svg.locator('polyline[stroke="rgba(255,255,255,.92)"]');
  const count = await paths.count();
  if (!count) throw new Error('Sky Shapes visible route has no ordered dotted guidance path');
  const view = await svg.evaluate(el => ({ width: el.viewBox.baseVal.width, height: el.viewBox.baseVal.height }));
  const scale = Math.min(box.width / view.width, box.height / view.height);
  const left = box.x + (box.width - view.width * scale) / 2, top = box.y + (box.height - view.height * scale) / 2;
  const pointRows = [];
  let allVisiblePoints = 0;
  for (let i = 0; i < count; i += 1) {
    const text = await paths.nth(i).getAttribute('points');
    const points = String(text || '').trim().split(/\s+/).map(item => item.split(',').map(Number));
    if (points.length < 3 || points.some(p => p.length !== 2 || p.some(n => !Number.isFinite(n)))) throw new Error(`Sky Shapes path ${i + 1} has invalid visible points`);
    allVisiblePoints += points.length;
    if (allVisiblePoints > 200) throw new Error('Sky Shapes mission exceeded the 200-visible-point interaction budget');
    pointRows.push(points.map(([x,y]) => ({ x: left + x * scale, y: top + y * scale })));
  }
  // Exercise actual pointer rejection first: one miss must not change route/task.
  const first = pointRows[0][0];
  const corners = [
    { x: box.x + 3, y: box.y + 3 }, { x: box.x + box.width - 3, y: box.y + 3 },
    { x: box.x + 3, y: box.y + box.height - 3 }, { x: box.x + box.width - 3, y: box.y + box.height - 3 },
  ].sort((a,b) => Math.hypot(b.x - first.x, b.y - first.y) - Math.hypot(a.x - first.x, a.y - first.y));
  const wrongStart = corners[0];
  const guideTolerance = episodeNo === 1 ? 82 : episodeNo === 2 ? 68 : 56;
  if (Math.hypot(wrongStart.x - first.x, wrongStart.y - first.y) <= guideTolerance * scale * 1.35) throw new Error('Sky Shapes has no visible in-board off-guide retry point');
  await page.mouse.move(wrongStart.x, wrongStart.y); await page.mouse.down(); await page.mouse.move(wrongStart.x + (wrongStart.x < first.x ? 4 : -4), wrongStart.y + (wrongStart.y < first.y ? 4 : -4)); await page.mouse.up();
  if (await svg.getAttribute('aria-label') !== identity) throw new Error('Sky Shapes wrong-start retry changed mission identity');
  const afterMiss = await progress.getAttribute('aria-valuenow').catch(() => null);
  if (beforeProgress !== null && afterMiss !== beforeProgress) throw new Error('Sky Shapes wrong-start attempt advanced route progress');
  // The drawing gesture follows each authored visible path in order.
  let faultEvidence = null;
  for (let pathNo = 0; pathNo < pointRows.length; pathNo += 1) {
    const points = pointRows[pathNo];
    await page.mouse.move(points[0].x, points[0].y); await page.mouse.down();
    for (let pointNo = 1; pointNo < points.length; pointNo += 1) {
      const isFinalStroke = pathNo === pointRows.length - 1 && pointNo === points.length - 1;
      let faultBeforeWrite = null;
      if (faults && episodeNo === 1 && missionNo === 1 && isFinalStroke) {
        faultBeforeWrite = await gameSnapshot(page, 'amari_sky_shapes_progress_v1');
        await armStorageFault(page, 'write', 'amari_sky_shapes_progress_v1');
      }
      try { await page.mouse.move(points[pointNo].x, points[pointNo].y, { steps: 2 }); }
      finally {
        if (faults && episodeNo === 1 && missionNo === 1 && isFinalStroke) {
          const write = await restoreStorageFault(page);
          await page.mouse.up();
          if (!write.fired) throw new Error('Sky Shapes local write fault did not reach its progress key');
          const beforeRetry = await gameSnapshot(page, 'amari_sky_shapes_progress_v1');
          if (beforeRetry.raw !== faultBeforeWrite.raw) throw new Error('Sky Shapes blocked write changed the local progress record');
          const retry = button(page, 'Retry saving flight');
          await retry.waitFor({ state: 'visible', timeout: 2000 });
          const retryGeometry = await helper.measureControl(retry, 'Sky Shapes held flight Retry');
          const nextWhileHeld = page.getByRole('button', { name: /^(Next mission|Complete this sky)$/ });
          if (await nextWhileHeld.isEnabled()) throw new Error('Sky Shapes exposed an enabled Next during failed local save');
          const readbackFault = await runFaultedClick(page, helper, retry, 'readback', 'amari_sky_shapes_progress_v1', 'Sky Shapes held flight with committed local readback hidden');
          if (!readbackFault.didSet) throw new Error('Sky Shapes readback fault did not follow an actual committed local write');
          await retry.waitFor({ state: 'visible', timeout: 2000 });
          const committed = await gameSnapshot(page, 'amari_sky_shapes_progress_v1');
          // An equal/lower replay may serialize exactly the same durable record.
          // didSet plus the held readback error proves the committed-write boundary.
          const localRetry = button(page, 'Retry saving flight');
          let parentReward = null;
          if (parentFaultEligible) {
            const receipt = committed.value?.rewardReceipts?.find(item => item.kind === 'mission' && item.missionId === visibleMissionId);
            if (!receipt || receipt.rewardDelta <= 0) throw new Error('Naturally eligible Sky Shapes mission has no positive local receipt');
            const pendingClaims = committed.value.rewardReceipts.filter(item => !item.parentClaimed).map(item => ({ token: `dino:jet:${item.id}`, delta: item.rewardDelta }));
            parentReward = await parentFaultRecovery(
              page, helper, localRetry, () => button(page, 'Retry saved stars'), `Sky Shapes ${visibleMissionId}`, pendingClaims,
            );
            const after = await gameSnapshot(page, 'amari_sky_shapes_progress_v1');
            for (const claim of pendingClaims) {
              const receiptId = claim.token.slice('dino:jet:'.length);
              const finalReceipt = after.value?.rewardReceipts?.find(item => item.id === receiptId);
              if (!finalReceipt?.parentClaimed) throw new Error(`Sky Shapes parent receipt retry did not confirm its local claimed marker for ${receiptId}`);
            }
          } else {
            await helper.clickControl(localRetry, { label: 'Confirm the same Sky Shapes flight after restoring storage' });
          }
          faultEvidence = { write, readback: readbackFault, committedRecordChanged: committed.raw !== beforeRetry.raw, retryGeometry, heldWrite: true, committedReadbackFailureHeld: true, ...(parentReward ? { parentRewardRecovery: parentReward } : {}), finalRetryConfirmed: true };
          evidence.skyFaults = faultEvidence;
        }
      }
    }
    await page.mouse.up();
  }
  const status = page.getByRole('status').filter({ hasText: /route accuracy|Keyboard-guided completion/ }).first();
  await status.waitFor({ timeout: 2000 });
  const resultText = await visibleText(status);
  if (/Keyboard-guided completion/i.test(resultText)) throw new Error('Sky Shapes completion used keyboard-guided practice; pointer accuracy lane is required');
  const audio = await helper.observePackagedPlayback(button(page, 'Hear mission again'), `Sky Shapes episode ${episodeNo} mission ${missionNo} narration`);
  const explanation = await visibleText(page.getByRole('status').filter({ hasText: 'Shape idea:' }));
  if (!explanation.includes('Shape idea:')) throw new Error(`Sky Shapes mission ${missionNo} lacks held shape explanation`);
  const next = page.getByRole('button', { name: /^(Next mission|Complete this sky)$/ });
  const nextGeometry = await helper.measureControl(next, `Sky Shapes episode ${episodeNo} mission ${missionNo} held Next`);
  const label = await next.innerText();
  await helper.clickControl(next, { label: `Advance Sky Shapes episode ${episodeNo} mission ${missionNo}` });
  return { taskIdentity: identity, missionId: visibleMissionId, heading, wrongRetryRetained: true, traceMode: 'pointer-following-visible-route', accuracyText: resultText, keyboardGuided: false, shapeExplanation: explanation, audio: { packaged: true, events: audio.events.map(({ pathname, events }) => ({ pathname, events: events.map(e => e.type) })) }, heldNextGeometry: nextGeometry, nextLabel: clean(label), final: /Complete this sky/.test(label), missionGeometry: geometry, ...(faultEvidence ? { faultRecovery: faultEvidence } : {}) };
}
async function traceSkyQueue(page, helper, episode, cycle, rows, faults, evidence, preexistingCompletedIds) {
  const flightCount = await page.getByText(/^Flight 1\/\d+$/).innerText();
  const total = Number(flightCount.match(/\/(\d+)/)?.[1]);
  if (!Number.isInteger(total) || total < 1 || total > 4) throw new Error(`Sky Shapes sky ${episode} cycle ${cycle} exposed invalid visible queue length ${total}`);
  const missionIds = new Set();
  let previous = '';
  for (let mission = 1; mission <= total; mission += 1) {
    const svg = page.locator('svg[role="application"][aria-label^="Tracing board for "]');
    await svg.waitFor({ state: 'visible', timeout: 2000 });
    const current = await svg.getAttribute('aria-label');
    if (!current || current === previous) throw new Error(`Sky Shapes mission ${mission} identity is missing or repeated after Next`);
    const injectFault = faults && !evidence.skyFaults && episode === 1 && mission === 1;
    const retained = { episode, cycle, mission, taskIdentity: current, partial: true };
    rows.push(retained);
    const row = await traceVisibleSky(page, svg, helper, episode, mission, injectFault, evidence, preexistingCompletedIds);
    Object.assign(retained, row, { partial: false });
    missionIds.add(row.missionId);
    previous = current;
    if (mission < total) {
      await page.getByText(new RegExp(`^Flight ${mission + 1}/${total}$`)).waitFor({ timeout: 2000 });
      const nextSvg = page.locator('svg[role="application"][aria-label^="Tracing board for "]');
      await nextSvg.waitFor({ timeout: 2000 });
      const nextIdentity = await nextSvg.getAttribute('aria-label');
      if (!nextIdentity || nextIdentity === current) throw new Error(`Sky Shapes episode ${episode} mission identity did not change after Next`);
      retained.nextTaskIdentity = nextIdentity;
    } else {
    await page.getByText(/^(starter|growing|challenge) sky complete$/i).waitFor({ state: 'visible', timeout: 2000 });
    }
  }
  return [...missionIds];
}

async function selectSkyCard(page, helper, episode, label) {
  const disclosure = page.locator('main details').filter({ hasText: 'Choose another sky' }).first();
  if (await disclosure.count() !== 1) throw new Error('Sky Shapes secondary sky picker is missing');
  if (!await disclosure.evaluate(element => element.open)) {
    await clickNavigation(page, helper, disclosure.locator('summary'), `${label}: open secondary sky choices`);
  }
  const card = disclosure.getByRole('button', { name: new RegExp(`^Sky ${episode} ·`) });
  if (await card.count() !== 1 || !await card.isEnabled()) throw new Error(`Sky Shapes sky ${episode} is not naturally available`);
  await clickNavigation(page, helper, card, `${label}: select visible Sky ${episode}`);
}

async function runSky(page, helper, evidence, faults = false) {
  await enterGame(page, helper, 'Sky Shapes', 'Creative Lab');
  const key = 'amari_sky_shapes_progress_v1';
  const initial = await gameSnapshot(page, key);
  if (initial.malformed) throw new Error('Sky Shapes progress is malformed at map');
  const initialValue = initial.value || {};
  const pendingBeforeIntroDrain = (initialValue.rewardReceipts || []).filter(receipt => !receipt.parentClaimed);
  for (const receipt of pendingBeforeIntroDrain) await waitForClaimedSkyReceipt(page, receipt.id);
  evidence.initialSkyShapes = { present: initial.raw !== null, unlockedEpisode: initialValue.unlockedEpisode ?? 0, completedMissionIds: initialValue.completedMissionIds || [], completedEpisodeIds: initialValue.completedEpisodeIds || [], bestMissionStars: initialValue.bestMissionStars || {} };
  const rows = []; evidence.skyRows = rows;
  for (let episode = 1; episode <= 3; episode += 1) {
    if (episode > 1) {
      const map = button(page, 'Sky map');
      if (await map.count() === 1 && await map.isVisible()) await helper.clickControl(map, { label: `Open Sky Shapes map after sky ${episode - 1}` });
    }
    await selectSkyCard(page, helper, episode, 'Normal Sky Shapes journey');
    const episodeIds = ['sky-circle','sky-triangle','sky-square','sky-diamond','sky-heart','sky-star','sky-house','sky-cloud','sky-rocket','sky-airplane','sky-castle','sky-observatory'].slice((episode-1)*4, episode*4);
    const progressAtStart = await gameSnapshot(page, key);
    if (!progressAtStart.value) throw new Error(`Sky Shapes sky ${episode} progress could not be parsed before Start`);
    const start = page.getByRole('button', { name: /^(Start|Replay) this sky$/ });
    await waitEnabled(start, `Sky Shapes sky ${episode} start after receipt drain`);
    const settledIntro = await gameSnapshot(page, key);
    const pendingAtIntro = (settledIntro.value?.rewardReceipts || []).filter(receipt => !receipt.parentClaimed);
    if (pendingAtIntro.length) throw new Error(`Sky Shapes intro left ${pendingAtIntro.length} natural reward receipt(s) unclaimed`);
    if (episode === 1) evidence.skyIntroDrain = { pendingBeforeDrain: pendingBeforeIntroDrain.length, pendingAfterDrain: pendingAtIntro.length, allParentClaimsConfirmed: true };
    if (faults && episode === 1 && !evidence.skyStartFaults) {
      const beforeStart = await gameSnapshot(page, key);
      const writeFault = await runFaultedClick(page, helper, start, 'write', key, 'Sky Shapes intro start with mission-queue save blocked');
      const retryStart = button(page, 'Retry saving this sky');
      await retryStart.waitFor({ state: 'visible', timeout: 2000 });
      const retryGeometry = await helper.measureControl(retryStart, 'Sky Shapes intro held queue Retry');
      const afterFailedStart = await gameSnapshot(page, key);
      if (afterFailedStart.raw !== beforeStart.raw) throw new Error('Sky Shapes failed intro start changed saved progress');
      if (await page.locator('svg[role="application"][aria-label^="Tracing board for "]').count()) throw new Error('Sky Shapes mounted an unsaved route before its Retry');
      await helper.clickControl(retryStart, { label: 'Retry the same held Sky Shapes mission queue' });
      await page.locator('svg[role="application"][aria-label^="Tracing board for "]').waitFor({ state: 'visible', timeout: 2000 });
      evidence.skyStartFaults = { writeFault, retryGeometry, failedStartStorageUnchanged: true, didNotAutoplay: true, sameVisibleRetryStarted: true };
    } else {
      await helper.clickControl(start, { label: `Start Sky Shapes sky ${episode}` });
    }
    const cycleOneIds = new Set(await traceSkyQueue(page, helper, episode, 1, rows, faults, evidence, initialValue.completedMissionIds || []));
    if (cycleOneIds.size < 4) {
      await helper.clickControl(button(page, 'Sky map'), { label: `Open Sky Shapes map after naturally finishing the remaining routes in sky ${episode}` });
      await selectSkyCard(page, helper, episode, 'Complete Sky Shapes queue replay');
      const replay = button(page, 'Replay this sky');
      await waitEnabled(replay, `Sky Shapes sky ${episode} replay after all route receipts are complete`);
      await helper.clickControl(replay, { label: `Run all four visible missions for Sky Shapes sky ${episode}` });
      const cycleTwoIds = await traceSkyQueue(page, helper, episode, 2, rows, faults, evidence, initialValue.completedMissionIds || []);
      for (const id of cycleTwoIds) cycleOneIds.add(id);
    }
    if (cycleOneIds.size !== 4) throw new Error(`Sky Shapes sky ${episode} visible mission coverage was ${cycleOneIds.size}/4`);
  }
  const after = await gameSnapshot(page, key);
  if (!after.value || after.malformed) throw new Error('Sky Shapes persisted progress missing or malformed after all skies');
  const parent = await parentRewardSnapshot(page);
  for (const receipt of after.value.rewardReceipts || []) {
    if (!receipt.parentClaimed || !Number.isInteger(receipt.rewardDelta) || receipt.rewardDelta < 1) throw new Error(`Sky Shapes receipt is missing strict local claim confirmation: ${JSON.stringify(receipt)}`);
    if (Number(parent.rewardClaims?.[`dino:jet:${receipt.id}`]) !== receipt.rewardDelta) throw new Error(`Sky Shapes parent claim missing or has the wrong positive delta for ${receipt.id}`);
  }
  const firstSkyIds = ['sky-circle', 'sky-triangle', 'sky-square', 'sky-diamond'];
  const firstSkyBest = firstSkyIds.map(id => Number(after.value.bestMissionStars?.[id]) || 0);
  if (firstSkyBest.every(stars => stars === 3)) {
    const replayBefore = await gameSnapshot(page, key);
    const parentBefore = await parentRewardSnapshot(page);
    await helper.clickControl(button(page, 'Sky map'), { label: 'Open Sky Shapes map for capped equal-or-lower replay' });
    await selectSkyCard(page, helper, 1, 'Capped Sky Shapes replay');
    await helper.clickControl(button(page, 'Replay this sky'), { label: 'Replay Sky 1 at the existing three-star cap' });
    evidence.skyReplayRows = [];
    for (let mission = 1; mission <= 4; mission += 1) {
      const svg = page.locator('svg[role="application"][aria-label^="Tracing board for "]');
      await svg.waitFor({ state: 'visible', timeout: 2000 });
      const row = await traceVisibleSky(page, svg, helper, 1, mission, false, evidence, initialValue.completedMissionIds || []);
      evidence.skyReplayRows.push(row);
      if (mission < 4) {
        await page.getByText(new RegExp(`^Flight ${mission + 1}/4$`)).waitFor({ timeout: 2000 });
        const nextIdentity = await page.locator('svg[role="application"][aria-label^="Tracing board for "]').getAttribute('aria-label');
        if (nextIdentity === row.taskIdentity) throw new Error('Sky Shapes capped replay did not advance to a new mission identity');
      }
    }
    const replayAfter = await gameSnapshot(page, key);
    const parentAfter = await parentRewardSnapshot(page);
    if (parentAfter.points !== parentBefore.points || JSON.stringify(parentAfter.rewardClaims) !== JSON.stringify(parentBefore.rewardClaims)) throw new Error('Sky Shapes equal/lower capped replay changed parent rewards');
    if (JSON.stringify(replayAfter.value.bestMissionStars) !== JSON.stringify(replayBefore.value.bestMissionStars)) throw new Error('Sky Shapes equal/lower capped replay changed best mission ratings');
    if (JSON.stringify(replayAfter.value.rewardReceipts) !== JSON.stringify(replayBefore.value.rewardReceipts)) throw new Error('Sky Shapes equal/lower capped replay changed reward receipts');
    evidence.skyReplay = { eligible: true, existingBestMissionStars: firstSkyBest, pointsBefore: parentBefore.points, pointsAfter: parentAfter.points, parentClaimsUnchanged: true, bestStarsUnchanged: true, rewardReceiptsUnchanged: true };
  } else {
    evidence.skyReplay = { eligible: false, reason: 'No naturally completed first-sky record reached the 3-star cap in the normal route; no progress was altered to create replay eligibility.', existingBestMissionStars: firstSkyBest };
  }
  const missions = rows.map(row => (row.taskIdentity.match(/Tracing board for (.+?)\./) || [])[1]).filter(Boolean);
  if (new Set(missions).size < 10) throw new Error(`Sky Shapes mission identity diversity too low: ${new Set(missions).size}`);
  evidence.skyPersisted = { completedMissionIds: after.value.completedMissionIds, completedEpisodeIds: after.value.completedEpisodeIds, bestMissionStars: after.value.bestMissionStars, rawBytes: new TextEncoder().encode(after.raw).length };
  return { initial, after };
}

async function exerciseSkyKeyboardAndTouch(page, helper, evidence) {
  await helper.clickControl(button(page, 'Sky map'), { label: 'Open Sky Shapes map for the separate keyboard/touch modality sample' });
  await selectSkyCard(page, helper, 1, 'Keyboard and touch input sample');
  const replay = button(page, 'Replay this sky');
  await waitEnabled(replay, 'Sky Shapes replay start after receipt recovery');
  await helper.clickControl(replay, { label: 'Start first sky keyboard/touch replay' });

  const firstSvg = page.locator('svg[role="application"][aria-label^="Tracing board for "]');
  await firstSvg.waitFor({ state: 'visible', timeout: 2000 });
  const firstIdentity = await firstSvg.getAttribute('aria-label');
  const firstName = (firstIdentity?.match(/^Tracing board for (.+?)\./) || [])[1];
  const firstMissionId = SKY_VISIBLE_NAME_TO_ID[firstName];
  if (!firstMissionId) throw new Error(`Keyboard sample mission identity is unmapped: ${firstIdentity}`);
  await helper.measureControl(firstSvg, 'Sky Shapes keyboard-guided tracing model');
  const beforeKeyboard = await gameSnapshot(page, 'amari_sky_shapes_progress_v1');
  const parentBeforeKeyboard = await parentRewardSnapshot(page);
  const initialAccuracy = beforeKeyboard.value?.bestAccuracy?.[firstMissionId] ?? null;
  const priorStars = Number(beforeKeyboard.value?.bestMissionStars?.[firstMissionId]) || 0;
  if (priorStars < 1) throw new Error('Keyboard participation sample lacks a naturally completed mission with a lower/equal one-star bound');
  await firstSvg.focus();
  await page.keyboard.press('Enter');
  let keyboardStatus = '';
  const keyboardDeadline = Date.now() + 2000;
  const completionStatus = page.getByRole('status').filter({ hasText: /route accuracy|Keyboard-guided completion/ }).first();
  for (let step = 0; step < 30 && Date.now() < keyboardDeadline; step += 1) {
    if (await completionStatus.count() === 1 && await completionStatus.isVisible().catch(() => false)) keyboardStatus = await visibleText(completionStatus);
    if (/Keyboard-guided completion/i.test(keyboardStatus)) break;
    await page.keyboard.press('Space');
    await page.waitForTimeout(60);
  }
  if (await completionStatus.count() === 1 && await completionStatus.isVisible().catch(() => false)) keyboardStatus = await visibleText(completionStatus);
  if (keyboardStatus !== 'Keyboard-guided completion · 1 participation star.') throw new Error(`Sky Shapes keyboard alternative was not explicit or did not report one participation star: ${keyboardStatus}`);
  const afterKeyboard = await gameSnapshot(page, 'amari_sky_shapes_progress_v1');
  const parentAfterKeyboard = await parentRewardSnapshot(page);
  if (JSON.stringify(afterKeyboard.value?.bestAccuracy || {}) !== JSON.stringify(beforeKeyboard.value?.bestAccuracy || {})) throw new Error('Keyboard-guided completion wrote pen-trace accuracy');
  if ((Number(afterKeyboard.value?.bestMissionStars?.[firstMissionId]) || 0) > priorStars) throw new Error('One-star keyboard practice improved an existing best flight rating');
  if (parentAfterKeyboard.points !== parentBeforeKeyboard.points || JSON.stringify(parentAfterKeyboard.rewardClaims) !== JSON.stringify(parentBeforeKeyboard.rewardClaims)) throw new Error('One-star keyboard participation changed parent rewards on an equal/lower replay');
  const keyboardNext = button(page, 'Next mission');
  await waitEnabled(keyboardNext, 'Sky Shapes keyboard completion Next');
  const keyboardNextGeometry = await helper.measureControl(keyboardNext, 'Sky Shapes keyboard completion Next');
  await helper.clickControl(keyboardNext, { label: 'Continue from the one-star keyboard participation sample' });

  const touchSvg = page.locator('svg[role="application"][aria-label^="Tracing board for "]');
  await touchSvg.waitFor({ state: 'visible', timeout: 2000 });
  const touchIdentity = await touchSvg.getAttribute('aria-label');
  const touchName = (touchIdentity?.match(/^Tracing board for (.+?)\./) || [])[1];
  const touchMissionId = SKY_VISIBLE_NAME_TO_ID[touchName];
  if (!touchMissionId || touchMissionId === firstMissionId) throw new Error('Sky Shapes touch sample did not advance to a distinct mission');
  const touchGeometry = await helper.measureControl(touchSvg, 'Sky Shapes emulated-touch tracing model');
  const box = await touchSvg.boundingBox();
  if (!box) throw new Error('Sky Shapes touch model has no visible bounds');
  const viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }));
  const view = await touchSvg.evaluate(el => ({ width: el.viewBox.baseVal.width, height: el.viewBox.baseVal.height }));
  const scale = Math.min(box.width / view.width, box.height / view.height);
  const left = box.x + (box.width - view.width * scale) / 2, top = box.y + (box.height - view.height * scale) / 2;
  const paths = touchSvg.locator('polyline[stroke="rgba(255,255,255,.92)"]');
  if (!await paths.count()) throw new Error('Sky Shapes touch mission has no visible ordered route');
  const touchBefore = await gameSnapshot(page, 'amari_sky_shapes_progress_v1');
  const parentBeforeTouch = await parentRewardSnapshot(page);
  const touchPriorStars = Number(touchBefore.value?.bestMissionStars?.[touchMissionId]) || 0;
  const touchPriorComplete = (touchBefore.value?.completedMissionIds || []).includes(touchMissionId);
  const touchPriorReceiptIds = new Set((touchBefore.value?.rewardReceipts || []).map(item => item.id));
  const client = await page.context().newCDPSession(page);
  let touchEvents = 0;
  try {
    await client.send('Emulation.setTouchEmulationEnabled', { enabled: true, configuration: 'mobile' });
    for (let pathIndex = 0; pathIndex < await paths.count(); pathIndex += 1) {
      const source = String(await paths.nth(pathIndex).getAttribute('points') || '').trim().split(/\s+/).map(item => item.split(',').map(Number));
      if (source.length < 3 || source.length > 200) throw new Error('Sky Shapes touch route is outside the 3–200 visible-point budget');
      const mapped = source.map(([x,y]) => ({ x: left + x * scale, y: top + y * scale }));
      if (mapped.length < 3 || mapped.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y) || p.x < 0 || p.y < 0 || p.x > viewport.width || p.y > viewport.height)) throw new Error('Sky Shapes touch route contains invalid or off-viewport visible points');
      await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...mapped[0], id: 19 }] }); touchEvents += 1;
      for (let i = 1; i < mapped.length; i += 1) {
        const from = mapped[i - 1], to = mapped[i];
        for (let sample = 1; sample <= 2; sample += 1) {
          await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + (to.x - from.x) * sample / 2, y: from.y + (to.y - from.y) * sample / 2, id: 19 }] }); touchEvents += 1;
        }
      }
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); touchEvents += 1;
    }
  } finally {
    await client.send('Emulation.setTouchEmulationEnabled', { enabled: false }).catch(() => {});
    await client.detach().catch(() => {});
  }
  const touchStatus = page.getByRole('status').filter({ hasText: /route accuracy|Keyboard-guided completion/ }).first();
  await touchStatus.waitFor({ timeout: 2000 });
  const touchResultText = await visibleText(touchStatus);
  if (!/\d+% route accuracy/.test(touchResultText) || /Keyboard-guided/i.test(touchResultText)) throw new Error(`Emulated touch route was not reported as pen-trace accuracy: ${touchResultText}`);
  const afterTouch = await gameSnapshot(page, 'amari_sky_shapes_progress_v1');
  const parentAfterTouch = await parentRewardSnapshot(page);
  for (const receipt of afterTouch.value?.rewardReceipts || []) {
    if (!receipt.parentClaimed || Number(parentAfterTouch.rewardClaims?.[`dino:jet:${receipt.id}`]) !== receipt.rewardDelta) throw new Error(`Emulated touch left an unconfirmed or mismatched positive receipt: ${receipt.id}`);
  }
  const touchStars = Number((touchResultText.match(/(\d+) of 3 accuracy stars/) || [])[1]);
  if (!Number.isInteger(touchStars) || touchStars < 1 || touchStars > 3) throw new Error('Touch accuracy result has no visible star rating');
  const touchExpectedDelta = touchPriorComplete ? (touchPriorStars > 0 ? Math.max(0, touchStars - touchPriorStars) : 0) : touchStars;
  const touchNewReceipts = (afterTouch.value?.rewardReceipts || []).filter(item => !touchPriorReceiptIds.has(item.id));
  // This modality sample follows a complete first sky, so an episode bonus cannot be newly earned.
  if (touchNewReceipts.some(item => item.kind !== 'mission' || item.missionId !== touchMissionId)
    || touchNewReceipts.reduce((sum, item) => sum + item.rewardDelta, 0) !== touchExpectedDelta
    || (touchExpectedDelta === 0 && touchNewReceipts.length !== 0)
    || (touchExpectedDelta > 0 && touchNewReceipts.length !== 1)) throw new Error('Touch replay created unexpected reward receipts');
  const touchExpectedClaims = { ...parentBeforeTouch.rewardClaims };
  for (const receipt of touchNewReceipts) {
    const token = `dino:jet:${receipt.id}`;
    if (Number(touchExpectedClaims[token] || 0) !== 0) throw new Error('Touch improvement reused an existing parent receipt');
    touchExpectedClaims[token] = receipt.rewardDelta;
  }
  const orderedClaims = claims => JSON.stringify(Object.entries(claims).sort(([a], [b]) => a.localeCompare(b)));
  if (parentAfterTouch.points !== parentBeforeTouch.points + touchExpectedDelta
    || orderedClaims(parentAfterTouch.rewardClaims) !== orderedClaims(touchExpectedClaims)) throw new Error('Touch replay changed parent rewards beyond its exact earned improvement');
  const touchRewardInvariant = { priorBestStars: touchPriorStars, resultStars: touchStars, expectedDelta: touchExpectedDelta, pointsBefore: parentBeforeTouch.points, pointsAfter: parentAfterTouch.points, newReceipts: touchNewReceipts.map(item => ({ id: item.id, delta: item.rewardDelta })), exactParentClaims: true, equalOrLowerUnchanged: touchExpectedDelta === 0 };
  const touchAudio = await helper.observePackagedPlayback(button(page, 'Hear mission again'), 'Sky Shapes emulated-touch mission packaged narration');
  const touchExplanation = await visibleText(page.getByRole('status').filter({ hasText: 'Shape idea:' }));
  const next = page.getByRole('button', { name: /^(Next mission|Complete this sky)$/ });
  if (await next.isDisabled()) throw new Error('Sky Shapes touch completion exposed Next before save confirmation');
  const nextGeometry = await helper.measureControl(next, 'Sky Shapes emulated-touch completion Next');
  evidence.skyInputModalities = {
    keyboard: { taskIdentity: firstIdentity, status: keyboardStatus, participationStars: 1, accuracyWritten: false, priorBestStars: priorStars, bestStarsUnchanged: true, nextGeometry: keyboardNextGeometry },
    touch: { taskIdentity: touchIdentity, mode: 'emulated Chromium touch via CDP on the supplied page', touchEvents, geometry: touchGeometry, status: touchResultText, rewardInvariant: touchRewardInvariant, packagedAudio: Boolean(touchAudio.packaged), heldExplanation: touchExplanation, nextGeometry, nextLabel: clean(await next.innerText()) },
    physicalDeviceTouchCertified: false,
  };
}

module.exports = async function runSkyMonster(page, options) {
  const { origin, expectedEntry, width, height } = options;
  const helper = createIntegrationNative(page, { origin, expectedEntry, minimumTargetSize: 44, allowedCommonStorageKeys: [
    'amari_game_diagnostics_v1', 'amari_game_lifecycle_diagnostics_v1', 'amari_learning_attempts_v1',
    'amari_skill_mastery_v1', 'amari-sound-on', 'amari_points', 'amari_earned_sticker_ids_v1',
    'amari_games_played', 'amari_recent_games', 'amari_rewards_v2',
  ] });
  const evidence = { passed: false, origin, viewport: `${width}x${height}`, lanes: [], errors: [] };
  try {
    page.setDefaultTimeout(2000);
    evidence.runtime = await enterQaHome(page, helper, origin, width, height);
    const before = await sha256(page);
    const math = await runMonster(page, helper, evidence, options.faults === true);
    await leaveGame(page, helper, 'Monster Math', 'Maths Missions');
    const sky = await runSky(page, helper, evidence, options.faults === true);
    await exerciseSkyKeyboardAndTouch(page, helper, evidence);
    sky.after = await gameSnapshot(page, 'amari_sky_shapes_progress_v1');
    evidence.skyPersistedAfterInputSamples = { completedMissionIds: sky.after.value?.completedMissionIds || [], completedEpisodeIds: sky.after.value?.completedEpisodeIds || [], rewardReceipts: sky.after.value?.rewardReceipts || [], rawBytes: new TextEncoder().encode(sky.after.raw || '').length };
    const originalSound = math.originalSound;
    const restoredSound = await setSound(page, helper, originalSound);
    if (restoredSound !== originalSound) throw new Error('Original sound preference was not restored through the visible control');
    evidence.soundRestoration = { original: originalSound, restored: restoredSound, viaVisibleControl: true };
    await leaveGame(page, helper, 'Sky Shapes', 'Creative Lab');
    const after = await sha256(page);
    const overflow = await page.evaluate(() => ({ viewport: { width: innerWidth, height: innerHeight }, document: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight }, horizontalOverflow: document.documentElement.scrollWidth > innerWidth }));
    if (overflow.horizontalOverflow) throw new Error(`Unexpected horizontal overflow: ${JSON.stringify(overflow)}`);
    evidence.overflow = overflow;
    const allowed = [
      'amari_monster_math_progress_v1', 'amari_sky_shapes_progress_v1', 'amari_rewards_v2',
      'amari_points', 'amari_games_played', 'amari_earned_sticker_ids_v1', 'amari_recent_games',
      'amari_game_diagnostics_v1', 'amari_game_lifecycle_diagnostics_v1', 'amari_learning_attempts_v1',
      'amari_skill_mastery_v1', 'amari-sound-on',
    ];
    const storage = assertExpectedStorage(before, after, allowed);
    if (storage.changed.some(key => !allowed.includes(key.replace(/^qa_rewards_20261024_/, '')))) throw new Error('Unexpected saved storage key changed');
    evidence.storage = storage;
    evidence.keyDigestsAfterReload = await reloadAndVerify(page, helper, expectedEntry, math.after, sky.after);
    helper.assertNoProviderAttempts();
    evidence.providerAttempts = [];
    evidence.runtimeErrors = helper.assertNoRuntimeErrors();
    evidence.passed = true;
    return evidence;
  } catch (error) {
    evidence.failure = { message: String(error?.message || error), stack: String(error?.stack || '').split('\n').slice(0, 8) };
    if (options.failurePath) {
      try { await page.screenshot({ path: options.failurePath, type: 'jpeg', quality: 72, fullPage: false, timeout: 8000 }); evidence.failureScreenshot = options.failurePath; }
      catch (captureError) { evidence.failureScreenshotError = String(captureError?.message || captureError); }
    }
    evidence.passed = false;
    return evidence;
  } finally {
    if (evidence.soundPreference && !evidence.soundRestoration) {
      try {
        const original = evidence.soundPreference.original;
        if (await soundState(page) === null) {
          await enterQaHome(page, helper, origin, width, height);
          await enterGame(page, helper, 'Monster Math', 'Maths Missions');
        }
        const restored = await setSound(page, helper, original);
        evidence.soundRestorationOnFailure = { original, restored, viaVisibleControl: restored === original };
      } catch (restoreError) {
        evidence.soundRestorationOnFailure = { original: evidence.soundPreference.original, error: String(restoreError?.message || restoreError) };
      }
    }
    await helper.dispose().catch(() => {});
  }
};

module.exports.prepareSkyPendingReload = async function prepareSkyPendingReload(page, options) {
  const { origin, expectedEntry, width, height } = options;
  if (width !== 390 || height !== 740 || options.faults !== true) throw new Error('Sky pending-reload preparation requires the 390×740 fault lane');
  const helper = createIntegrationNative(page, { origin, expectedEntry, minimumTargetSize: 44, allowedCommonStorageKeys: [
    'amari_game_diagnostics_v1', 'amari_game_lifecycle_diagnostics_v1', 'amari_learning_attempts_v1',
    'amari_skill_mastery_v1', 'amari-sound-on', 'amari_points', 'amari_earned_sticker_ids_v1',
    'amari_games_played', 'amari_recent_games', 'amari_rewards_v2',
  ] });
  const evidence = { passed: false, mode: 'prepare-sky-pending', origin, viewport: '390x740', providerAttempts: [], errors: [] };
  try {
    page.setDefaultTimeout(2000);
    evidence.runtime = await enterQaHome(page, helper, origin, width, height);
    const storageBefore = await helper.snapshotStorage();
    await enterGame(page, helper, 'Sky Shapes', 'Creative Lab');
    const progressKey = 'amari_sky_shapes_progress_v1';
    const beforeStart = await gameSnapshot(page, progressKey);
    if (beforeStart.malformed) throw new Error('Sky Shapes strict progress is malformed for pending-reload preparation');
    const progressAtIntro = beforeStart.value || {};
    for (const receipt of (progressAtIntro.rewardReceipts || []).filter(item => !item.parentClaimed)) await waitForClaimedSkyReceipt(page, receipt.id);
    const settledBeforeStart = await gameSnapshot(page, progressKey);
    const settledProgress = settledBeforeStart.value || {};
    if ((settledProgress.rewardReceipts || []).some(item => !item.parentClaimed)) throw new Error('Sky Shapes had a natural pending receipt that did not drain before preparation');
    const skyOneIds = ['sky-circle', 'sky-triangle', 'sky-square', 'sky-diamond'];
    const completedBefore = settledProgress.completedMissionIds || [];
    const missionIdTargets = skyOneIds.filter(id => !completedBefore.includes(id) && !(Number(settledProgress.bestMissionStars?.[id]) > 0));
    evidence.targetEligibility = { completedMissionIds: completedBefore, zeroStarUnfinishedSkyOneIds: missionIdTargets };
    if (!missionIdTargets.length) {
      evidence.pendingReloadRecovery = { exercised: false, reason: 'Sky 1 has no naturally unfinished zero-star mission to earn a positive keyboard participation receipt.' };
      await leaveGame(page, helper, 'Sky Shapes', 'Creative Lab');
      await returnHomeIfNeeded(page, helper);
      evidence.storage = helper.assertStorageChanges(storageBefore, await helper.snapshotStorage(), { allowedKeys: [] });
      helper.assertNoProviderAttempts();
      evidence.runtimeErrors = helper.assertNoRuntimeErrors();
      evidence.passed = true;
      return evidence;
    }
    await selectSkyCard(page, helper, 1, 'Natural Sky Shapes pending-reload preparation');
    const start = page.getByRole('button', { name: /^(Start|Replay) this sky$/ });
    await waitEnabled(start, 'Sky 1 primary start for pending-reload preparation');
    await helper.clickControl(start, { label: 'Start the remaining naturally unfinished Sky 1 missions' });
    const svg = page.locator('svg[role="application"][aria-label^="Tracing board for "]');
    await svg.waitFor({ state: 'visible', timeout: 2000 });
    const identity = await svg.getAttribute('aria-label');
    const missionName = (identity?.match(/^Tracing board for (.+?)\./) || [])[1];
    const missionId = SKY_VISIBLE_NAME_TO_ID[missionName];
    if (!missionId || !missionIdTargets.includes(missionId)) {
      evidence.pendingReloadRecovery = { exercised: false, reason: `The naturally queued first mission ${identity || '(unavailable)'} was not a zero-star unfinished Sky 1 target.` };
      await leaveGame(page, helper, 'Sky Shapes', 'Creative Lab');
      await returnHomeIfNeeded(page, helper);
      evidence.storage = helper.assertStorageChanges(storageBefore, await helper.snapshotStorage(), { allowedKeys: ['amari_sky_shapes_progress_v1'] });
      helper.assertNoProviderAttempts();
      evidence.runtimeErrors = helper.assertNoRuntimeErrors();
      evidence.passed = true;
      return evidence;
    }
    const visibleQueue = await visibleText(page.getByText(/^Flight 1\/\d+$/));
    const queueLength = Number(visibleQueue.match(/\/(\d+)/)?.[1]);
    if (!Number.isInteger(queueLength) || queueLength < 1) {
      evidence.pendingReloadRecovery = { exercised: false, reason: 'The naturally queued Sky 1 mission count is unavailable or invalid.' };
      await leaveGame(page, helper, 'Sky Shapes', 'Creative Lab');
      await returnHomeIfNeeded(page, helper);
      evidence.storage = helper.assertStorageChanges(storageBefore, await helper.snapshotStorage(), { allowedKeys: ['amari_sky_shapes_progress_v1'] });
      helper.assertNoProviderAttempts();
      evidence.runtimeErrors = helper.assertNoRuntimeErrors();
      evidence.passed = true;
      return evidence;
    }
    const modelGeometry = await helper.measureControl(svg, 'Sky Shapes keyboard pending-reload mission model');
    const paths = svg.locator('polyline[stroke="rgba(255,255,255,.92)"]');
    if (await paths.count() !== 1) {
      evidence.pendingReloadRecovery = { exercised: false, reason: `Natural target ${missionId} has ${await paths.count()} visible route paths; the bounded preparation requires exactly one.` };
      await leaveGame(page, helper, 'Sky Shapes', 'Creative Lab');
      await returnHomeIfNeeded(page, helper);
      evidence.storage = helper.assertStorageChanges(storageBefore, await helper.snapshotStorage(), { allowedKeys: ['amari_sky_shapes_progress_v1'] });
      helper.assertNoProviderAttempts();
      evidence.runtimeErrors = helper.assertNoRuntimeErrors();
      evidence.passed = true;
      return evidence;
    }
    const progressBeforeKeyboard = await gameSnapshot(page, progressKey);
    const parentBefore = await parentRewardSnapshot(page);
    const beforeAccuracy = { ...(progressBeforeKeyboard.value.bestAccuracy || {}) };
    await armStorageFault(page, 'write', 'amari_rewards_v2');
    let faultState;
    try {
      await svg.focus();
      await page.keyboard.press('Enter');
      const keyLoopDeadline = Date.now() + 2000;
      for (let step = 0; step < 30 && Date.now() < keyLoopDeadline; step += 1) {
        const statusLocator = page.getByRole('status').filter({ hasText: /route accuracy|Keyboard-guided completion/ }).first();
        const status = await statusLocator.count() === 1 && await statusLocator.isVisible().catch(() => false) ? await visibleText(statusLocator) : '';
        const fired = await page.evaluate(() => Boolean(window.__pair14StorageFault?.fired));
        if (/Keyboard-guided completion/i.test(status) && fired) break;
        await page.keyboard.press('Space');
      }
      await page.waitForFunction(() => Boolean(window.__pair14StorageFault?.fired), null, { timeout: 2000, polling: 50 });
    } finally {
      faultState = await restoreStorageFault(page);
    }
    if (!faultState?.fired || faultState.key !== 'amari_rewards_v2') throw new Error('Sky Shapes preparation did not intercept the exact logical parent reward write');
    const keyboardStatus = await visibleText(page.getByRole('status').filter({ hasText: /Keyboard-guided completion/ }).first());
    if (keyboardStatus !== 'Keyboard-guided completion · 1 participation star.') throw new Error(`Sky Shapes preparation was not a one-star keyboard completion: ${keyboardStatus}`);
    const retry = button(page, 'Retry saved stars');
    await retry.waitFor({ state: 'visible', timeout: 2000 });
    const retryGeometry = await helper.measureControl(retry, 'Sky Shapes pending parent receipt Retry saved stars');
    const pendingLocal = await gameSnapshot(page, progressKey);
    const priorReceiptIds = new Set((progressBeforeKeyboard.value.rewardReceipts || []).map(item => item.id));
    const newReceipts = (pendingLocal.value?.rewardReceipts || []).filter(receipt => !priorReceiptIds.has(receipt.id));
    const missionReceipt = newReceipts.find(receipt => receipt.kind === 'mission' && receipt.missionId === missionId);
    const episodeReceipt = newReceipts.find(receipt => receipt.kind === 'episode' && receipt.episodeId === 'cloud-meadow');
    if (!missionReceipt || missionReceipt.rewardDelta !== 1 || missionReceipt.parentClaimed !== false) throw new Error('Sky Shapes keyboard completion did not leave its new one-star pending mission receipt');
    if (queueLength === 1 && (!episodeReceipt || episodeReceipt.rewardDelta !== 2 || episodeReceipt.parentClaimed !== false)) throw new Error('Final naturally queued Sky 1 mission did not leave the expected pending two-star episode receipt');
    if (queueLength > 1 && episodeReceipt) throw new Error('Non-final Sky 1 keyboard mission unexpectedly created an episode receipt');
    const expectedReceipts = queueLength === 1 ? [missionReceipt, episodeReceipt] : [missionReceipt];
    if (newReceipts.length !== expectedReceipts.length || newReceipts.some(receipt => !expectedReceipts.some(expected => expected.id === receipt.id))) throw new Error('Sky Shapes preparation created an unexpected set of pending receipts');
    const expectedClaims = expectedReceipts.map(receipt => ({ receiptId: receipt.id, token: `dino:jet:${receipt.id}`, delta: receipt.rewardDelta }));
    const parentDuringFailure = await parentRewardSnapshot(page);
    if (parentDuringFailure.raw !== parentBefore.raw) throw new Error('Sky Shapes injected parent write failure changed the synthetic reward record');
    if (JSON.stringify(pendingLocal.value?.bestAccuracy || {}) !== JSON.stringify(beforeAccuracy)) throw new Error('Sky Shapes keyboard preparation wrote pen-trace accuracy');
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
    const reloadSurface = await ensureReloadedGameIntro(page, helper, 'Sky Shapes', 'Creative Lab');
    for (const receipt of expectedReceipts) await waitForClaimedSkyReceipt(page, receipt.id);
    const recoveredLocal = await gameSnapshot(page, progressKey);
    const recoveredReceipts = expectedReceipts.map(receipt => recoveredLocal.value?.rewardReceipts?.find(item => item.id === receipt.id));
    const parentAfterReload = await parentRewardSnapshot(page);
    if (recoveredReceipts.some(receipt => !receipt?.parentClaimed)) throw new Error('Sky Shapes intro did not confirm every natural pending receipt after reload');
    for (const claim of expectedClaims) {
      if (Number(parentBefore.rewardClaims?.[claim.token] || 0) !== 0 || Number(parentAfterReload.rewardClaims?.[claim.token]) !== claim.delta) throw new Error(`Sky Shapes intro recovery did not apply the exact parent claim ${claim.token}`);
    }
    if (parentAfterReload.points !== parentBefore.points + expectedClaims.reduce((total, claim) => total + claim.delta, 0)) throw new Error('Sky Shapes intro recovery applied an unexpected total reward delta');
    if (JSON.stringify(recoveredLocal.value?.bestAccuracy || {}) !== JSON.stringify(beforeAccuracy)) throw new Error('Sky Shapes pending-receipt recovery changed pen-trace accuracy');
    const storage = helper.assertStorageChanges(storageBefore, await helper.snapshotStorage(), { allowedKeys: ['amari_sky_shapes_progress_v1', 'amari_rewards_v2'] });
    if (storage.changed.includes('amari_monster_math_progress_v1')) throw new Error('Sky Shapes pending-reload lane changed the protected Monster Math progress key');
    evidence.pendingReloadRecovery = { exercised: true, missionId, queueLength, reloadSurface: reloadSurface.initialSurface, receipts: expectedClaims.map(claim => ({ id: claim.receiptId, token: claim.token, delta: claim.delta })), keyboardStatus, modelGeometry, retryGeometry, parentWriteFault: faultState, allLocalReceiptsPendingBeforeReload: true, parentUnchangedBeforeReload: true, localMarkersConfirmedAfterReload: true, parentPointsBefore: parentBefore.points, parentPointsAfter: parentAfterReload.points, totalNaturalDelta: expectedClaims.reduce((total, claim) => total + claim.delta, 0), everyParentClaimExactlyOnce: true, penTraceAccuracyUnchanged: true, protectedSiblingKeysUnchanged: true, storage };
    await leaveGame(page, helper, 'Sky Shapes', 'Creative Lab');
    await returnHomeIfNeeded(page, helper);
    helper.assertNoProviderAttempts();
    evidence.runtimeErrors = helper.assertNoRuntimeErrors();
    evidence.passed = true;
    return evidence;
  } catch (error) {
    evidence.failure = { message: String(error?.message || error), stack: String(error?.stack || '').split('\n').slice(0, 8) };
    if (options.failurePath) {
      try { await page.screenshot({ path: options.failurePath, type: 'jpeg', quality: 72, fullPage: false, timeout: 8000 }); evidence.failureScreenshot = options.failurePath; }
      catch (captureError) { evidence.failureScreenshotError = String(captureError?.message || captureError); }
    }
    evidence.passed = false;
    return evidence;
  } finally {
    await helper.dispose().catch(() => {});
  }
};

async function reloadAndVerify(page, helper, expectedEntry, mathAfter, skyAfter) {
  const url = page.url();
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
  await selectAmariAtHome(page, helper);
  const result = await page.evaluate(({ mathRaw, skyRaw }) => ({
    mathMatches: localStorage.getItem('amari_monster_math_progress_v1') === mathRaw,
    skyMatches: localStorage.getItem('amari_sky_shapes_progress_v1') === skyRaw,
    mathBytes: new TextEncoder().encode(localStorage.getItem('amari_monster_math_progress_v1') || '').length,
    skyBytes: new TextEncoder().encode(localStorage.getItem('amari_sky_shapes_progress_v1') || '').length,
  }), { mathRaw: mathAfter.raw, skyRaw: skyAfter.raw });
  if (!result.mathMatches || !result.skyMatches) throw new Error('Earned game records did not survive full reload');
  return { ...result, urlAfterReload: url, runtime: await helper.assertRuntime() };
}
