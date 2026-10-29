// Count the Stars + Addition Adventure visible-control driver. The caller
// supplies the already leased page; no browser, storage state, or answer queue
// is created or injected here.
const createIntegrationNative = require('./integration-native.cjs');
const btn = (page, name) => page.getByRole('button', { name, exact: true });
const text = async locator => String(await locator.innerText()).replace(/\s+/g, ' ').trim();
const COUNT_KEY = 'amari_amari_count_the_stars_batch3_v1';
const ADD_KEY = 'amari_addition_progress_v1';
const COMMON = ['amari_game_diagnostics_v1','amari_game_lifecycle_diagnostics_v1','amari_learning_attempts_v1','amari_skill_mastery_v1','amari-sound-on','amari_points','amari_earned_sticker_ids_v1','amari_games_played','amari_recent_games','amari_rewards_v2'];
const chapters = ['Put Groups Together','Number Bonds','Addition Stories'];

function assert(condition, message) { if (!condition) throw new Error(message); }
async function clickNav(page, h, locator, label) {
  assert(await locator.count() === 1 && await locator.isVisible(), `${label} is not a unique visible control`);
  await locator.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'nearest' }));
  return h.clickControl(locator, { label });
}
async function soundState(page) {
  const b = page.getByRole('button', { name: /^Turn sound (on|off)$/ }).first();
  return await b.count() ? (await b.getAttribute('aria-label')) === 'Turn sound off' : null;
}
async function setSound(page, h, wanted) {
  const current = await soundState(page);
  if (current === null || current === wanted) return current;
  await h.clickControl(btn(page, current ? 'Turn sound off' : 'Turn sound on'), { label: wanted ? 'Enable packaged sound for acceptance' : 'Restore original sound preference' });
  return soundState(page);
}
async function navHome(page, h, origin, width, height) {
  await h.installGuards();
  await page.setViewportSize({ width, height });
  await page.goto(`${origin}/?qa_count_add=${Date.now()}#/home`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await h.installGuards(); // Media observation is document-local and must be installed after navigation.
  await page.waitForFunction(() => window.__amariQaNamespaced === true, null, { timeout: 2000 });
  const chooser = page.getByRole('heading', { name: 'Choose a world', exact: true });
  const player = page.getByRole('button', { name: /Age 6\+.*Amari/ }).first();
  const landed = await Promise.race([
    chooser.waitFor({ state: 'visible', timeout: 2000 }).then(() => 'world'),
    player.waitFor({ state: 'visible', timeout: 2000 }).then(() => 'player'),
  ]).catch(() => { throw new Error('Normal Amari chooser did not mount after namespaced navigation'); });
  if (landed === 'player') { await clickNav(page, h, player, 'Choose Amari in the normal player picker'); await chooser.waitFor({ timeout: 2000 }); }
  return { ...(await h.assertRuntime()), landed };
}
async function returnHomeIfNeeded(page, h) {
  const chooser = page.getByRole('heading', { name: 'Choose a world', exact: true });
  if (await chooser.count() && await chooser.isVisible()) return;
  const home = btn(page, 'Back to home');
  await clickNav(page, h, home, 'Return to the normal world chooser');
  await chooser.waitFor({ timeout: 2000 });
}
async function enterGame(page, h, title) {
  await returnHomeIfNeeded(page, h);
  const world = page.locator('.discovery-world-card').filter({ hasText: 'Maths Missions' });
  await clickNav(page, h, world, 'Maths Missions world');
  const card = page.locator('.catalogue-game-card').filter({ hasText: title });
  await clickNav(page, h, card, `${title} catalogue entry`);
  await page.getByRole('heading', { name: title, exact: true }).waitFor({ state: 'visible', timeout: 2000 });
}
async function ensureCountIntroAfterReload(page, h) {
  const countTitle = page.getByRole('heading', { name: 'Count the Stars', exact: true }).first();
  const chooser = page.getByRole('heading', { name: 'Choose a world', exact: true });
  const player = page.getByRole('button', { name: /Age 6\+.*Amari/ }).first();
  const worldTitle = page.getByRole('heading', { name: 'Maths Missions', exact: true });
  const deadline = Date.now() + 2500; let surface = null;
  while (Date.now() < deadline && !surface) {
    if (await countTitle.count() && await countTitle.isVisible().catch(() => false)) surface = 'game';
    else if (await chooser.count() && await chooser.isVisible().catch(() => false)) surface = 'chooser';
    else if (await player.count() && await player.isVisible().catch(() => false)) surface = 'player';
    else if (await worldTitle.count() && await worldTitle.isVisible().catch(() => false)) surface = 'world';
    else await page.waitForTimeout(60);
  }
  assert(surface, 'Count intro did not reload to a normal Amari route surface');
  if (surface === 'player') { await clickNav(page, h, player, 'Choose Amari after Count pending-receipt reload'); await chooser.waitFor({ timeout: 2000 }); surface = 'chooser'; }
  if (surface === 'chooser') {
    const world = page.locator('.discovery-world-card').filter({ hasText: 'Maths Missions' });
    await clickNav(page, h, world, 'Open Maths Missions after Count receipt reload'); surface = 'world';
  }
  if (surface === 'world') {
    const card = page.locator('.catalogue-game-card').filter({ hasText: 'Count the Stars' });
    await clickNav(page, h, card, 'Re-enter Count through catalogue after reload');
    await countTitle.waitFor({ timeout: 2000 });
  }
  await h.assertRuntime();
  return surface;
}
async function ensureAdditionIntroAfterReload(page, h) {
  const menu = page.locator('[data-addition-menu]');
  const chooser = page.getByRole('heading', { name: 'Choose a world', exact: true });
  const player = page.getByRole('button', { name: /Age 6\+.*Amari/ }).first();
  const worldTitle = page.getByRole('heading', { name: 'Maths Missions', exact: true });
  const deadline = Date.now() + 2500; let surface = null;
  while (Date.now() < deadline && !surface) {
    if (await menu.count() && await menu.isVisible().catch(() => false)) surface = 'game';
    else if (await chooser.count() && await chooser.isVisible().catch(() => false)) surface = 'chooser';
    else if (await player.count() && await player.isVisible().catch(() => false)) surface = 'player';
    else if (await worldTitle.count() && await worldTitle.isVisible().catch(() => false)) surface = 'world';
    else await page.waitForTimeout(60);
  }
  assert(surface, 'Addition intro did not reload to a normal Amari route surface');
  if (surface === 'player') { await clickNav(page, h, player, 'Choose Amari after Addition pending-receipt reload'); await chooser.waitFor({ timeout: 2000 }); surface = 'chooser'; }
  if (surface === 'chooser') {
    const world = page.locator('.discovery-world-card').filter({ hasText: 'Maths Missions' });
    await clickNav(page, h, world, 'Open Maths Missions after Addition receipt reload'); surface = 'world';
  }
  if (surface === 'world') {
    const card = page.locator('.catalogue-game-card').filter({ hasText: 'Addition Adventure' });
    await clickNav(page, h, card, 'Re-enter Addition through catalogue after reload');
    await menu.waitFor({ state: 'visible', timeout: 2000 });
  }
  await h.assertRuntime();
  return surface;
}
async function leaveGame(page, h, title) {
  const back = page.getByRole('button', { name: 'Back to Maths Missions', exact: true });
  await h.clickLeave(back, { label: `${title} parent return` });
  await page.locator('.discovery-world-page').getByText(title, { exact: true }).waitFor({ timeout: 2000 });
  await page.getByRole('heading', { name: 'Maths Missions', exact: true }).waitFor({ timeout: 2000 });
}
async function answerButton(page, value) {
  const group = page.getByRole('group', { name: 'Choose the answer', exact: true });
  const loc = group.getByRole('button', { name: `Answer ${value}`, exact: true });
  assert(await loc.count() === 1 && await loc.isVisible(), `Visible answer ${value} was not found`);
  return loc;
}
async function waitText(page, locator, prior, label, ms = 2000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await locator.count() && await locator.isVisible().catch(() => false)) {
      const next = await text(locator);
      if (next && next !== prior) return next;
    }
    await page.waitForTimeout(60);
  }
  throw new Error(`${label} did not change within ${ms}ms`);
}
async function waitEnabled(page, locator, label, ms = 2000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await locator.count() && await locator.isVisible().catch(() => false) && await locator.isEnabled().catch(() => false)) return;
    await page.waitForTimeout(60);
  }
  throw new Error(`${label} did not become enabled within ${ms}ms`);
}
async function arithmeticAnswer(prompt, equation, groups) {
  const nums = (prompt.match(/\d+/g) || []).map(Number);
  if (groups.length === 2) {
    const labels = await Promise.all(groups.map(g => g.getAttribute('aria-label')));
    const counts = labels.map(label => Number((label || '').match(/, (\d+) /)?.[1]));
    if (counts.every(Number.isFinite)) return counts[0] + counts[1];
  }
  if (/and what number make/i.test(prompt) && nums.length >= 2) return nums[1] - nums[0];
  if (/\b(gets|more|together|altogether|now)\b/i.test(prompt) && nums.length >= 2) return nums[0] + nums[1];
  const eqNums = (equation.match(/\d+/g) || []).map(Number);
  if (equation.includes('?') && eqNums.length >= 2) {
    if (/^\d+ \+ \? = \d+$/.test(equation)) return eqNums[1] - eqNums[0];
    if (/^\d+ \+ \d+ = \?$/.test(equation)) return eqNums[0] + eqNums[1];
  }
  throw new Error(`Cannot derive answer from the visible Addition model: ${prompt} / ${equation}`);
}
async function countQuestion(page, h, row, { wrong = false, clue = false, recount = false, audio = false } = {}) {
  const board = page.getByRole('group', { name: /^Counting board for / });
  assert(await board.count() === 1 && await board.isVisible(), 'Visible counting board missing');
  const objects = board.getByRole('button', { name: /, not counted yet$/ });
  const n = await objects.count();
  assert(n >= 1 && n <= 20, `Unexpected rendered count model size ${n}`);
  row.modelCount = n;
  await h.measureControl(board, 'Count model board');
  if (audio) {
    const heard = await h.observePackagedPlayback(btn(page, 'Hear instructions'), 'Count Hear instructions');
    row.audio = heard;
  }
  if (clue) await h.clickControl(btn(page, 'Show a clue'), { label: 'Use visible count strategy clue' });
  for (let i = 0; i < n; i++) await h.clickControl(board.getByRole('button', { name: /, not counted yet$/ }).first(), { label: `Count visible object ${i + 1}` });
  const countPrompt = page.getByText(/^How many .+ did you count\?$/).first();
  await countPrompt.waitFor({ state: 'visible', timeout: 2000 });
  const correct = page.getByRole('button', { name: String(n), exact: true });
  if (wrong) {
    const opts = countPrompt.locator('..').getByRole('button').filter({ hasText: /^\d+$/ });
    const values = [];
    for (let i = 0; i < await opts.count(); i++) { const t = (await text(opts.nth(i))); if (/^\d+$/.test(t)) values.push(t); }
    const wrongButton = page.getByRole('button', { name: values.find(v => Number(v) !== n), exact: true }).first();
    await h.clickControl(wrongButton, { label: 'Record a visible incorrect count before retry' });
    assert(await countPrompt.isVisible() && await board.getByRole('button', { name: /, not counted yet$/ }).count() === 0 && await board.getByRole('button').count() === n, 'Wrong count advanced or replaced the visible counted model');
    row.wrongRetry = true;
  }
  if (recount) {
    await h.clickControl(btn(page, 'Recount from 1 · uses a clue'), { label: 'Use the visible recount recovery' });
    for (let i = 0; i < n; i++) await h.clickControl(board.getByRole('button', { name: /, not counted yet$/ }).first(), { label: `Recount visible object ${i + 1}` });
    row.recount = true;
  }
  const correctAnswer = correct.last();
  if (row.faultSequence) {
    const sequence = [];
    const boardIdentity = await board.evaluate(el => ({ episode: el.dataset.countEpisode, question: el.dataset.countQuestion, seed: el.dataset.runSeed }));
    let fault = await runFaultClick(page, h, correctAnswer, 'write', COUNT_KEY, 'Count held survey result write fault');
    sequence.push({ stage: 'local-write', ...fault }); row.faultRecovery = { boardIdentity, retries: sequence };
    let retry = btn(page, 'Retry saving survey');
    await waitEnabled(page, retry, 'Count held result retry after local write failure');
    fault = await runFaultClick(page, h, retry, 'readback', COUNT_KEY, 'Count held survey result readback fault');
    sequence.push({ stage: 'local-readback', ...fault }); row.faultRecovery = { boardIdentity, retries: sequence };
    retry = btn(page, 'Retry saving survey');
    await waitEnabled(page, retry, 'Count held result retry after local readback failure');
    fault = await runFaultClick(page, h, retry, 'write', 'amari_rewards_v2', 'Count parent reward write fault');
    sequence.push({ stage: 'parent-write', ...fault }); row.faultRecovery = { boardIdentity, retries: sequence };
    retry = btn(page, 'Retry saved stars');
    await waitEnabled(page, retry, 'Count held result retry after parent write failure');
    fault = await runFaultClick(page, h, retry, 'readback', 'amari_rewards_v2', 'Count parent reward readback fault');
    sequence.push({ stage: 'parent-readback', ...fault }); row.faultRecovery = { boardIdentity, retries: sequence };
    retry = btn(page, 'Retry saved stars');
    await waitEnabled(page, retry, 'Count held result retry after parent readback failure');
    const pending = await snapshot(page, COUNT_KEY);
    const receipt = (pending.value?.rewardReceipts || []).find(item => item.id.startsWith(`${boardIdentity.episode}:best:`) && item.claimed === false);
    assert(receipt && receipt.rewardDelta > 0, 'No natural positive pending Count receipt was available for reload recovery');
    assert(receipt.rewardDelta === row.expectedRewardDelta, `Count receipt delta ${receipt.rewardDelta} did not match visible three-star improvement ${row.expectedRewardDelta}`);
    const parentAtReload = await parentRecord(page);
    const token = `dino:counting:${receipt.id}`;
    assert(Number(parentAtReload.claims?.[token] || 0) === receipt.rewardDelta, 'Count parent readback fault did not leave the exact positive reward committed');
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
    await h.installGuards();
    await ensureCountIntroAfterReload(page, h);
    await page.waitForFunction(({ key, id }) => {
      try { return JSON.parse(localStorage.getItem(key) || 'null')?.rewardReceipts?.find(item => item.id === id)?.claimed === true; }
      catch { return false; }
    }, { key: COUNT_KEY, id: receipt.id }, { timeout: 3000, polling: 100 });
    const parentAfterReload = await parentRecord(page);
    const recovered = await snapshot(page, COUNT_KEY);
    assert(Number(parentAfterReload.claims?.[token] || 0) === receipt.rewardDelta
      && parentAfterReload.points === parentAtReload.points, 'Count intro reload paid the already committed reward twice or changed its amount');
    row.faultRecovery = { boardIdentity, retries: sequence, heldFact: true,
      pendingReloadRecovery: { receiptId: receipt.id, rewardDelta: receipt.rewardDelta, token,
        parentAmountBeforeReload: parentAtReload.claims[token], parentAmountAfterReload: parentAfterReload.claims[token],
        pointsBeforeReload: parentAtReload.points, pointsAfterReload: parentAfterReload.points,
        claimedAfterReload: recovered.value.rewardReceipts.find(item => item.id === receipt.id)?.claimed === true } };
    row.answered = true;
    return;
  } else await h.clickControl(correctAnswer, { label: 'Select count from the rendered object model' });
  await waitEnabled(page, btn(page, 'Next'), 'Count explanation Next');
  await h.clickControl(btn(page, 'Hear explanation'), { label: 'Replay visible counting explanation' });
  const next = btn(page, 'Next'); await h.clickControl(next, { label: 'Advance after count explanation' });
  row.answered = true;
}
async function visibleModelBounds(locator, label) {
  assert(await locator.count() === 1 && await locator.isVisible(), `${label} is missing`);
  const geometry = await locator.evaluate(el => { const r=el.getBoundingClientRect();return { label:el.getAttribute('aria-label')||'',rect:{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom},viewport:{width:innerWidth,height:innerHeight} }; });
  const r=geometry.rect,v=geometry.viewport;
  assert(r.width>0 && r.height>0 && r.x>=0 && r.y>=0 && r.right<=v.width && r.bottom<=v.height, `${label} is not wholly visible: ${JSON.stringify(geometry)}`);
  return geometry;
}
async function additionQuestion(page, h, row, { wrong = false, hint = false, modelToggle = false, audio = false } = {}) {
  const promptLoc = page.locator('main p[aria-live="polite"]').first();
  await promptLoc.waitFor({ state: 'visible', timeout: 2000 });
  const prompt = await text(promptLoc);
  const equationLoc = page.locator('main p[aria-label^="Equation:"]').first();
  const equation = (await equationLoc.getAttribute('aria-label') || '').replace(/^Equation:\s*/, '');
  const groups = [];
  const first = page.getByRole('group', { name: /^First group,/ });
  const second = page.getByRole('group', { name: /^Second group,/ });
  if (await first.count() && await first.isVisible() && await second.count() && await second.isVisible()) groups.push(first, second);
  const value = await arithmeticAnswer(prompt, equation, groups);
  row.prompt = prompt; row.equation = equation; row.answerFromVisible = value;
  assert(await equationLoc.count() === 1 && await equationLoc.isVisible(), 'Visible Addition equation/model is missing');
  row.modelGeometries = [];
  if (groups.length) for (const group of groups) row.modelGeometries.push(await visibleModelBounds(group, 'Visible addition object group'));
  else {
    const whole = page.getByRole('group', { name: /^Whole, \d+ counters$/ }).first();
    const known = page.getByRole('group', { name: /^Known part, \d+ counters$/ }).first();
    if (await whole.count()) row.modelGeometries.push(await visibleModelBounds(whole, 'Visible number-bond whole model'));
    if (await known.count()) row.modelGeometries.push(await visibleModelBounds(known, 'Visible number-bond known part model'));
  }
  if (audio) row.audio = await h.observePackagedPlayback(btn(page, 'Hear question'), 'Addition Hear question');
  if (hint) { await h.clickControl(btn(page, 'Use one hint'), { label: 'Use visible addition clue' }); row.hint = true; }
  if (modelToggle && groups.length === 2) {
    await h.clickControl(btn(page, 'Bring the groups together'), { label: 'Join the two visible addition groups' });
    await h.clickControl(btn(page, 'Split the groups apart'), { label: 'Split the visible addition groups' });
    row.joinSplit = true;
  }
  if (wrong) {
    const choices = page.getByRole('group', { name: 'Choose the answer', exact: true }).getByRole('button', { name: /^Answer \d+$/ });
    let wrongChoice = null;
    for (let i = 0; i < await choices.count(); i++) {
      const candidate = choices.nth(i); const label = await candidate.getAttribute('aria-label');
      if (Number((label || '').replace('Answer ', '')) !== value) { wrongChoice = candidate; break; }
    }
    assert(wrongChoice, 'No visible incorrect answer choice was available');
    await h.clickControl(wrongChoice, { label: 'Record a visible incorrect addition answer before retry' });
    assert(await text(promptLoc) === prompt, 'Wrong addition answer advanced the visible question');
    row.wrongRetry = true;
  }
  const correct = await answerButton(page, value);
  await h.clickControl(correct, { label: 'Choose answer from the visible arithmetic model' });
  const explanation = page.getByRole('button', { name: 'Hear explanation again', exact: true });
  await explanation.waitFor({ state: 'visible', timeout: 2000 });
  await h.clickControl(explanation, { label: 'Replay visible worked explanation' });
  if (row.index === 5) {
    const finish = btn(page, 'Finish chapter');
    await waitEnabled(page, finish, 'Addition held explanation Finish chapter');
    if (row.faultSequence === 'completion-chain') {
      const sequence = [];
      const questionId = await page.locator('[data-addition-question]').getAttribute('data-addition-question');
      let fault = await runFaultClick(page, h, finish, 'write', ADD_KEY, 'Addition held result write fault');
      sequence.push({ stage: 'local-write', ...fault }); row.faultRecovery = sequence;
      const retry = page.locator('[data-addition-result-retry]');
      await waitEnabled(page, retry, 'Addition retry after local write failure');
      assert(await page.locator('[data-addition-question]').getAttribute('data-addition-question') === questionId, 'The held Addition result changed questions after local write failure');
      await h.measureControl(page.getByRole('button', { name: 'Hear explanation again', exact: true }), 'Held Addition explanation during save recovery');
      assert(await page.getByRole('alert').isVisible(), 'Addition save failure did not expose an alert');
      fault = await runFaultClick(page, h, retry, 'readback', ADD_KEY, 'Addition held result readback fault');
      sequence.push({ stage: 'local-readback', ...fault }); row.faultRecovery = sequence;
      await waitEnabled(page, retry, 'Addition retry after local readback failure');
      assert(await page.locator('[data-addition-question]').getAttribute('data-addition-question') === questionId, 'The held Addition result changed after local readback failure');
      const localPending = await snapshot(page, ADD_KEY);
      const localReceipt = Object.values(localPending.value?.rewardReceipts || {}).find(item => item.chapterId === row.chapterId && item.claimed === false && item.rewardDelta > 0);
      assert(localReceipt && localReceipt.rewardDelta === row.expectedRewardDelta,
        'Addition held result did not preserve its exact natural pending receipt after local readback recovery');
      row.faultReceipt = { id: localReceipt.id, rewardDelta: localReceipt.rewardDelta };
      fault = await runFaultClick(page, h, retry, 'write', 'amari_rewards_v2', 'Addition parent reward write fault');
      sequence.push({ stage: 'parent-write', ...fault }); row.faultRecovery = sequence;
      await waitEnabled(page, retry, 'Addition retry after parent write failure');
      fault = await runFaultClick(page, h, retry, 'readback', 'amari_rewards_v2', 'Addition parent reward readback fault');
      sequence.push({ stage: 'parent-readback', ...fault }); row.faultRecovery = sequence;
      await waitEnabled(page, retry, 'Addition retry after parent readback failure');
      await h.clickControl(retry, { label: 'Retry the same held Addition result after storage recovery' });
      await page.locator('[data-addition-phase="done"]').waitFor({ state: 'visible', timeout: 4000 });
      row.faultRecovery = sequence;
    } else if (row.faultSequence === 'pending-reload') {
      const questionId = await page.locator('[data-addition-question]').getAttribute('data-addition-question');
      const before = await parentRecord(page);
      const fault = await runFaultClick(page, h, finish, 'write', 'amari_rewards_v2', 'Addition pending receipt parent write fault');
      const pending = await snapshot(page, ADD_KEY);
      const receipt = Object.values(pending.value?.rewardReceipts || {}).find(item => item.chapterId === row.chapterId && item.claimed === false && item.rewardDelta > 0);
      assert(receipt, 'Addition parent fault did not create a natural positive pending receipt');
      assert(receipt.rewardDelta === row.expectedRewardDelta, `Addition receipt delta ${receipt.rewardDelta} did not match visible three-star improvement ${row.expectedRewardDelta}`);
      const token = `dino:addition:${receipt.id}`;
      assert(Number(before.claims?.[token] || 0) === 0, 'Addition pending receipt token was already claimed before reload');
      const afterFault = await parentRecord(page);
      assert(afterFault.raw === before.raw, 'Addition parent write fault changed the parent record');
      assert(await page.locator('[data-addition-question]').getAttribute('data-addition-question') === questionId, 'Addition held result changed after parent write failure');
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
      await h.installGuards();
      await page.waitForFunction(() => window.__amariQaNamespaced === true, null, { timeout: 2000 });
      await ensureAdditionIntroAfterReload(page, h);
      await page.waitForFunction(({ key, id }) => {
        try { return JSON.parse(localStorage.getItem(key) || 'null')?.rewardReceipts?.[id]?.claimed === true; }
        catch { return false; }
      }, { key: ADD_KEY, id: receipt.id }, { timeout: 3000, polling: 100 });
      const recovered = await parentRecord(page);
      const recoveredProgress = await snapshot(page, ADD_KEY);
      assert(Number(recovered.claims?.[token] || 0) === receipt.rewardDelta
        && recovered.points === before.points + receipt.rewardDelta,
      'Addition intro reload did not claim the natural receipt exactly once at its star delta');
      assert(recoveredProgress.value?.rewardReceipts?.[receipt.id]?.claimed === true, 'Addition receipt marker was not confirmed after intro reload');
      row.faultRecovery = { stage: 'pending-parent-write-reload', fault, receiptId: receipt.id,
        rewardDelta: receipt.rewardDelta, token, parentBefore: { points: before.points, amount: Number(before.claims?.[token] || 0) },
        parentAfterFault: { points: afterFault.points, amount: Number(afterFault.claims?.[token] || 0) },
        parentAfterReload: { points: recovered.points, amount: Number(recovered.claims?.[token] || 0) }, claimedAfterReload: true };
      row.pendingReloadRecovery = true;
      row.answered = true;
      row.completionSurface = 'Addition intro after same-page pending receipt recovery';
      return;
    } else {
      await h.clickControl(finish, { label: 'Finish the six-question Addition result after its held explanation' });
      const done = page.locator('[data-addition-phase="done"]');
      await done.waitFor({ state: 'visible', timeout: 4000 });
    }
    row.completionSurface = await text(page.locator('[data-addition-result]'));
  } else {
    const next = btn(page, 'Next question');
    await waitEnabled(page, next, 'Addition Next question');
    await h.clickControl(next, { label: 'Advance after held explanation' });
  }
  row.answered = true;
}
async function armStorageFault(page, mode, key) {
  return page.evaluate(({ mode, key }) => {
    if (window.__countAddFaultV1) throw Error('Count + Addition storage fault already armed');
    const proto = Storage.prototype;
    const state = { mode, key, fired: false, didSet: false, originalGet: proto.getItem, originalSet: proto.setItem };
    proto.setItem = function(name, value) {
      if (this === window.localStorage && name === state.key && mode === 'write' && !state.fired) {
        state.fired = true; throw Error('Synthetic Count + Addition localStorage write failure');
      }
      const output = state.originalSet.call(this, name, value);
      if (this === window.localStorage && name === state.key && mode === 'readback') state.didSet = true;
      return output;
    };
    proto.getItem = function(name) {
      if (this === window.localStorage && name === state.key && mode === 'readback' && state.didSet) {
        state.fired = true; return '__count_add_unconfirmed_readback__';
      }
      return state.originalGet.call(this, name);
    };
    window.__countAddFaultV1 = state;
    return { mode, key };
  }, { mode, key });
}
async function restoreStorageFault(page) {
  return page.evaluate(() => {
    const state = window.__countAddFaultV1;
    if (!state) return { restored: true, armed: false };
    Storage.prototype.getItem = state.originalGet; Storage.prototype.setItem = state.originalSet;
    delete window.__countAddFaultV1;
    return { restored: true, fired: state.fired, didSet: state.didSet, mode: state.mode, key: state.key };
  });
}
async function runFaultClick(page, h, locator, mode, key, label) {
  await armStorageFault(page, mode, key);
  let state;
  try { await h.clickControl(locator, { label }); }
  finally { state = await restoreStorageFault(page); }
  assert(state?.fired, `${label} did not hit its exact logical storage key`);
  return state;
}
async function chooseCountEpisode(page, h, index, { faults = false, result } = {}) {
  const details = page.locator('main details').first();
  if (await details.count()) {
    if (!(await details.evaluate(el => el.open))) await clickNav(page, h, details.locator('summary'), 'Open the secondary Count survey picker');
    const names = ['Star Garden','Constellation Workshop','Galaxy Survey'];
    const option = details.getByRole('button', { name: new RegExp(`^${names[index]}(?: ·|$)`) });
    await clickNav(page, h, option, `Select naturally unlocked Count survey ${names[index]}`);
  }
  const start = btn(page, 'Start selected survey');
  const replay = btn(page, 'Replay selected survey');
  const control = await replay.count() && await replay.isVisible() ? replay : start;
  if (faults && index === 0 && !result.faultCases?.countStartWrite) {
    const fault = await runFaultClick(page, h, control, 'write', COUNT_KEY, 'Count same-queue survey start write fault');
    result.faultCases = { ...(result.faultCases || {}), countStartWrite: { ...fault, retriedSameQueue: false } };
    const retry = btn(page, 'Retry saving survey');
    await waitEnabled(page, retry, 'Count same-queue start retry');
    await h.clickControl(retry, { label: 'Retry the same Count survey queue after write recovery' });
    const board = page.getByRole('group', { name: /^Counting board for / });
    await board.waitFor({ state: 'visible', timeout: 2000 });
    const visibleRun = await board.evaluate(el => ({ questionId: el.dataset.countQuestion, seed: el.dataset.runSeed, episodeId: el.dataset.countEpisode }));
    const stored = await snapshot(page, COUNT_KEY);
    const queueIds = stored.value?.recentQuestionIds?.['0'] || [];
    assert(queueIds.includes(visibleRun.questionId), 'Count Retry did not start the naturally persisted question queue');
    result.faultCases.countStartWrite = { ...result.faultCases.countStartWrite, retriedSameQueue: true, visibleRun, queueIds };
    return;
  }
  await waitEnabled(page, control, 'Count selected survey start');
  await h.clickControl(control, { label: `Start selected Count survey ${index + 1}` });
}
async function chooseAdditionChapter(page, h, index, { start = true } = {}) {
  const names = chapters;
  const details = page.locator('[data-addition-menu] details').first();
  if (await details.count()) {
    if (!(await details.evaluate(el => el.open))) await clickNav(page, h, details.locator('summary'), 'Open the secondary Addition chapter picker');
    const option = details.getByRole('button', { name: new RegExp(`Chapter ${index + 1}.*${names[index]}`, 'i') });
    await clickNav(page, h, option, `Select naturally unlocked ${names[index]}`);
  }
  const primary = page.locator('[data-addition-start]');
  await waitEnabled(page, primary, 'Addition primary start');
  if (!start) return primary;
  const label = await text(primary);
  assert(label === `Start ${names[index]}` || label === `Replay ${names[index]}` || label === 'Retry saving this chapter',
    `Selected Addition chapter ${index + 1} has unexpected primary label ${label}`);
  await h.clickControl(primary, { label: `Start selected Addition chapter ${names[index]}` });
}
function parentRecord(page) {
  return page.evaluate(() => {
    const key = 'qa_rewards_20261024_amari_rewards_v2'; const raw = localStorage.getItem(key); let value = null;
    try { value = raw === null ? null : JSON.parse(raw); } catch {}
    return { key, raw, points: Number(value?.points) || 0, claims: value?.rewardClaims || {} };
  });
}
async function snapshot(page, key) {
  return page.evaluate(name => { const raw = localStorage.getItem(name); let value = null; try { value = raw === null ? null : JSON.parse(raw); } catch {} return { raw, value }; }, key);
}
function receiptRows(game, progress) {
  if (game === 'count') return (progress?.rewardReceipts || []).map(r => ({ ...r, token: `dino:counting:${r.id}` }));
  return Object.values(progress?.rewardReceipts || {}).map(r => ({ ...r, token: `dino:addition:${r.id}` }));
}
async function checkRewards(page, game, progress, before) {
  const parent = await parentRecord(page);
  const rows = receiptRows(game, progress);
  const expectedTokens = rows.map(r => r.token).sort();
  const beforeClaims = before.claims || {};
  const afterClaims = parent.claims || {};
  const newlyClaimed = [];
  for (const row of rows) {
    assert(row.claimed === true, `${game} receipt ${row.id} has no confirmed local claim marker`);
    const amount = Number(afterClaims[row.token] || 0);
    assert(amount === row.rewardDelta, `${game} parent token ${row.token} does not equal the star delta after the parent scaling adapter`);
    if (Number(beforeClaims[row.token] || 0) !== amount) newlyClaimed.push({ token: row.token, from: Number(beforeClaims[row.token] || 0), to: amount });
  }
  const changedTokens = [...new Set([...Object.keys(beforeClaims), ...Object.keys(afterClaims)])].filter(k => Number(beforeClaims[k] || 0) !== Number(afterClaims[k] || 0)).sort();
  assert(changedTokens.every(k => expectedTokens.includes(k)), `${game} changed an unrelated parent reward claim: ${changedTokens.filter(k => !expectedTokens.includes(k)).join(', ')}`);
  const paidDelta = newlyClaimed.reduce((sum, row) => sum + row.to - row.from, 0);
  assert(parent.points === before.points + paidDelta, `${game} parent point total does not match exact newly claimed receipt deltas`);
  return { receiptCount: rows.length, receipts: rows.map(({ id, rewardDelta, claimed, token }) => ({ id, rewardDelta, claimed, token })), beforePoints: before.points, afterPoints: parent.points, changedTokens, newlyClaimed };
}
async function runGame(page, h, game, result, options) {
  const title = game === 'count' ? 'Count the Stars' : 'Addition Adventure';
  await enterGame(page, h, title);
  const initialSound = await soundState(page);
  (result.soundOriginals ||= {})[game] = initialSound;
  if (initialSound === false) await setSound(page, h, true);
  const key = game === 'count' ? COUNT_KEY : ADD_KEY;
  const allowed = [...COMMON, key];
  const before = await h.snapshotStorage();
  const rewardsBefore = await parentRecord(page);
  const gameRows = [];
  let countFaultPlan = null;
  if (game === 'count') {
    const initial = await snapshot(page, COUNT_KEY);
    const value = initial.value;
    const episodeIds = ['star-garden', 'constellation-workshop', 'galaxy-survey'];
    const strictShape = value === null || (value?.version === 1 && Array.isArray(value.completedEpisodeIds)
      && value.bestStars && typeof value.bestStars === 'object' && !Array.isArray(value.bestStars));
    assert(strictShape, 'Count strict progress snapshot is invalid; fault eligibility cannot be inferred safely');
    const completed = value?.completedEpisodeIds || [];
    const bestStars = value?.bestStars || {};
    const material = episodeIds.map((id, index) => ({ id, index, oldStars: Number(bestStars[id] || 0), completed: completed.includes(id) }))
      .filter(episode => !episode.completed || (episode.oldStars >= 1 && episode.oldStars < 3));
    countFaultPlan = { completionChapter: material[0]?.index ?? null,
      material: material.map(({ id, index, oldStars, completed: wasCompleted }) => ({ id, index, oldStars, completed: wasCompleted })) };
    result.faultEligibility = { ...(result.faultEligibility || {}), count: countFaultPlan };
  }
  let additionFaultPlan = null;
  if (game === 'addition') {
    const initial = await snapshot(page, ADD_KEY);
    const value = initial.value;
    const chapterIds = ['groups', 'bonds', 'stories'];
    const strictShape = value === null || (value?.version === 1 && Array.isArray(value.completedChapterIds)
      && value.bestStars && typeof value.bestStars === 'object' && !Array.isArray(value.bestStars));
    assert(strictShape, 'Addition strict progress snapshot is invalid; fault eligibility cannot be inferred safely');
    const completed = value?.completedChapterIds || [];
    const bestStars = value?.bestStars || {};
    const material = chapterIds.map((id, index) => ({ id, index, oldStars: Number(bestStars[id] || 0), completed: completed.includes(id) }))
      .filter(chapter => !chapter.completed || (chapter.oldStars >= 1 && chapter.oldStars < 3));
    additionFaultPlan = { startChapter: Math.min(completed.length, 2), completionChapter: material[0]?.index ?? null,
      pendingReloadChapter: material.find(chapter => chapter.index > (material[0]?.index ?? -1))?.index ?? null,
      material: material.map(({ id, index, oldStars, completed: wasCompleted }) => ({ id, index, oldStars, completed: wasCompleted })) };
    result.faultEligibility = { ...(result.faultEligibility || {}), addition: additionFaultPlan };
  }
  if (game === 'count') {
    for (let chapter = 0; chapter < 3; chapter++) {
      await chooseCountEpisode(page, h, chapter, { faults: options.faults, result });
      for (let i = 0; i < 6; i++) {
        const row = { game, chapter: chapter + 1, index: i, replay: false,
          faultSequence: Boolean(options.faults && chapter === countFaultPlan?.completionChapter && i === 5) };
        row.currentRunStars = 3;
        row.expectedRewardDelta = 3 - (countFaultPlan?.material.find(item => item.index === chapter)?.oldStars || 0);
        gameRows.push(row); result.rows.push(row);
        await countQuestion(page, h, row, { audio: i === 0 });
        if (row.faultRecovery) result.faultCases = { ...(result.faultCases || {}), countCompletion: row.faultRecovery };
      }
      const reloadRecovered = Boolean(result.rows[result.rows.length - 1]?.faultRecovery?.pendingReloadRecovery);
      if (!reloadRecovered) {
        const done = page.getByRole('heading', { name: /complete!$/ }).first();
        await done.waitFor({ state: 'visible', timeout: 2000 });
        await h.measureControl(btn(page, 'Survey map'), 'Count completion map control');
        await h.clickControl(btn(page, 'Survey map'), { label: 'Return to Count survey map' });
      }
      await chooseCountEpisode(page, h, chapter);
      for (let q = 0; q < 6; q++) { const row = { game, chapter: chapter + 1, index: q, replay: true, currentRunStars: 1 }; gameRows.push(row); result.rows.push(row); await countQuestion(page, h, row, { wrong: true, clue: q === 0, recount: q === 0 }); }
      await page.getByRole('heading', { name: /complete!$/ }).waitFor({ timeout: 2000 });
      await h.clickControl(btn(page, 'Survey map'), { label: 'Return after lower Count replay' });
    }
  } else {
    for (let chapter = 0; chapter < 3; chapter++) {
      const start = await chooseAdditionChapter(page, h, chapter, { start: false });
      if (options.faults && chapter === additionFaultPlan.startChapter && !result.faultCases?.additionStartWrite) {
        const fault = await runFaultClick(page, h, start, 'write', ADD_KEY, 'Addition same-queue start write fault');
        result.faultCases = { ...(result.faultCases || {}), additionStartWrite: { ...fault, retriedSameQueue: false } };
        await waitEnabled(page, start, 'Addition same-queue start retry');
        assert(await text(start) === 'Retry saving this chapter', 'Addition did not preserve the same started question queue for Retry');
        await h.clickControl(start, { label: 'Retry the same Addition chapter queue after write recovery' });
        await page.locator('[data-addition-phase="play"]').waitFor({ state: 'visible', timeout: 2000 });
        const visibleRun = await page.locator('[data-addition-phase="play"]').evaluate(el => ({ questionId: el.dataset.additionQuestion, seed: el.dataset.additionRunSeed }));
        const stored = await snapshot(page, ADD_KEY);
        const queueIds = stored.value?.recentQuestionIds?.[String(additionFaultPlan.startChapter)] || [];
        assert(queueIds.includes(visibleRun.questionId), 'Addition Retry did not start the naturally persisted question queue');
        result.faultCases.additionStartWrite = { ...result.faultCases.additionStartWrite, retriedSameQueue: true, visibleRun, queueIds };
      } else {
        await h.clickControl(start, { label: `Start selected Addition chapter ${chapters[chapter]}` });
      }
      for (let replay = 0; replay < 2; replay++) {
        for (let i = 0; i < 6; i++) {
          const row = { game, chapter: chapter + 1, chapterId: ['groups','bonds','stories'][chapter], index: i, replay: replay === 1 };
          const materialOldStars = additionFaultPlan?.material.find(item => item.index === chapter)?.oldStars || 0;
          const cleanForMaterialImprovement = chapter === additionFaultPlan?.completionChapter && materialOldStars === 2;
          row.currentRunStars = replay === 1 ? 1 : 3;
          row.expectedRewardDelta = 3 - materialOldStars;
          gameRows.push(row); result.rows.push(row);
          row.faultSequence = options.faults && replay === 0 && i === 5
            ? (chapter === additionFaultPlan?.completionChapter ? 'completion-chain'
              : chapter === additionFaultPlan?.pendingReloadChapter ? 'pending-reload' : false)
            : false;
          const injectNormalWrong = replay === 1 || (i === 0 && !cleanForMaterialImprovement);
          await additionQuestion(page, h, row, { wrong: injectNormalWrong, hint: i === 0 && replay === 0 && !cleanForMaterialImprovement, modelToggle: i === 0 && replay === 0, audio: i === 0 && replay === 0 });
          if (row.faultRecovery) {
            if (Array.isArray(row.faultRecovery)) result.faultCases = { ...(result.faultCases || {}), additionCompletionChain: row.faultRecovery };
            else if (row.pendingReloadRecovery) result.faultCases = { ...(result.faultCases || {}), additionPendingReload: row.faultRecovery };
          }
        }
        const pendingReload = Boolean(gameRows[gameRows.length - 1]?.pendingReloadRecovery);
        if (!pendingReload) await page.getByRole('button', { name: /^Continue$/ }).waitFor({ state: 'visible', timeout: 2000 });
        if (replay === 0) {
          if (pendingReload) {
            const primary = await chooseAdditionChapter(page, h, chapter, { start: false });
            await h.clickControl(primary, { label: `Replay ${chapters[chapter]} from its intro after pending-receipt reload` });
          } else await h.clickControl(page.getByRole('button', { name: new RegExp(`^Replay ${chapters[chapter]}$`) }), { label: `Replay ${chapters[chapter]} for lower-rating proof` });
        }
        else {
          await h.clickControl(btn(page, 'Continue'), { label: 'Continue after lower addition replay' });
          if (chapter < 2) {
            await chooseAdditionChapter(page, h, chapter + 1, { start: false });
          }
        }
      }
    }
  }
  if (initialSound !== null) await setSound(page, h, initialSound);
  const after = await h.snapshotStorage();
  const storage = h.assertStorageChanges(before, after, { allowedKeys: allowed });
  const saved = await snapshot(page, key);
  assert(saved.raw !== null && saved.value, `${game} progress was not saved in ${key}`);
  const rewards = await checkRewards(page, game, saved.value, rewardsBefore);
  result.games[game] = { title, key, rowCount: gameRows.length, savedProgress: saved.value, storage, rewards };
  await leaveGame(page, h, title);
}
module.exports = async function runCountAddition(page, { origin, expectedEntry, width, height, failurePath, faults = false } = {}) {
  const helper = createIntegrationNative(page, { origin, expectedEntry, allowedCommonStorageKeys: COMMON });
  page.setDefaultTimeout(2000);
  const controlAudit = { checked: 0, minimumWidth: Infinity, minimumHeight: Infinity, allCenterHits: true, allInsideViewport: true, labelCounts: {} };
  const recordGeometry = (geometry, label) => {
    if (!geometry) return;
    controlAudit.checked += 1;
    controlAudit.minimumWidth = Math.min(controlAudit.minimumWidth, geometry.rect.width);
    controlAudit.minimumHeight = Math.min(controlAudit.minimumHeight, geometry.rect.height);
    controlAudit.allCenterHits &&= Boolean(geometry.centerHit) && geometry.pointerEvents !== 'none';
    controlAudit.allInsideViewport &&= geometry.rect.x >= 0 && geometry.rect.y >= 0
      && geometry.rect.right <= geometry.viewport.width && geometry.rect.bottom <= geometry.viewport.height;
    const key = String(label || 'control').replace(/\s+/g, ' ').slice(0, 90);
    controlAudit.labelCounts[key] = (controlAudit.labelCounts[key] || 0) + 1;
  };
  const click = helper.clickControl.bind(helper);
  helper.clickControl = async (locator, options = {}) => {
    const outcome = await click(locator, options); recordGeometry(outcome.geometry, options.label); return outcome;
  };
  const measure = helper.measureControl.bind(helper);
  helper.measureControl = async (locator, label) => { const geometry = await measure(locator, label); recordGeometry(geometry, label); return geometry; };
  const result = { passed: false, origin, viewport: `${width}x${height}`, rows: [], games: {}, runtime: null, errors: null, providerAttempts: [] };
  try {
    result.runtime = await navHome(page, helper, origin, width, height);
    await runGame(page, helper, 'count', result, { faults });
    await runGame(page, helper, 'addition', result, { faults });
    const countSaved = await snapshot(page, COUNT_KEY); const additionSaved = await snapshot(page, ADD_KEY); const parentSaved = await parentRecord(page);
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
    await helper.installGuards();
    await page.waitForFunction(() => window.__amariQaNamespaced === true, null, { timeout: 2000 });
    await helper.assertRuntime();
    const countAfterReload = await snapshot(page, COUNT_KEY); const additionAfterReload = await snapshot(page, ADD_KEY); const parentAfterReload = await parentRecord(page);
    assert(countSaved.raw === countAfterReload.raw, 'Count saved record changed or disappeared on final reload');
    assert(additionSaved.raw === additionAfterReload.raw, 'Addition saved record changed or disappeared on final reload');
    assert(parentSaved.raw === parentAfterReload.raw, 'Parent reward record changed or disappeared on final reload');
    result.reloadPersistence = { countRawIdentical: true, additionRawIdentical: true, parentRawIdentical: true,
      countCompleted: countAfterReload.value?.completedEpisodeIds || [], additionCompleted: additionAfterReload.value?.completedChapterIds || [] };
    helper.assertNoProviderAttempts(); helper.assertNoRuntimeErrors();
    controlAudit.minimumWidth = Number.isFinite(controlAudit.minimumWidth) ? controlAudit.minimumWidth : null;
    controlAudit.minimumHeight = Number.isFinite(controlAudit.minimumHeight) ? controlAudit.minimumHeight : null;
    result.controlAudit = controlAudit;
    result.errors = helper.diagnostics; result.providerAttempts = helper.diagnostics.providerAttempts;
    if (faults) {
      assert(result.faultCases?.countStartWrite?.retriedSameQueue, 'Count natural queue write/retry branch was not captured');
      if (result.faultEligibility?.count?.completionChapter !== null) {
        assert(result.faultCases?.countCompletion?.pendingReloadRecovery?.claimedAfterReload, 'Count pending-receipt reload recovery was not completed for a naturally material episode');
      } else result.faultCases = { ...(result.faultCases || {}), countCompletionUnexercised: 'No naturally material Count episode has a positive star delta at the supplied saved-progress snapshot.' };
      assert(result.faultCases?.additionStartWrite?.retriedSameQueue, 'Addition natural queue write/retry branch was not captured');
      if (result.faultEligibility?.addition?.completionChapter !== null) {
        assert(Array.isArray(result.faultCases?.additionCompletionChain) && result.faultCases.additionCompletionChain.length === 4,
          'Addition held-result local and parent write/readback retry chain was not completed for a naturally material chapter');
      } else result.faultCases = { ...(result.faultCases || {}), additionCompletionChainUnexercised: 'No naturally material chapter has a positive delta at the supplied saved-progress snapshot.' };
      if (result.faultEligibility?.addition?.pendingReloadChapter !== null) {
        assert(result.faultCases?.additionPendingReload?.claimedAfterReload, 'Addition pending receipt reload recovery was not completed for a second naturally material chapter');
      } else result.faultCases = { ...(result.faultCases || {}), additionPendingReloadUnexercised: 'No second naturally material chapter was available for a distinct pending-receipt reload.' };
    }
    result.passed = result.rows.length === 72 && controlAudit.checked > 0
      && controlAudit.minimumWidth >= 44 && controlAudit.minimumHeight >= 44
      && controlAudit.allCenterHits && controlAudit.allInsideViewport;
    if (!result.passed) throw new Error(`Expected 72 question rows, found ${result.rows.length}`);
    return result;
  } catch (error) {
    result.failure = { message: String(error?.message || error), stack: String(error?.stack || '').split('\n').slice(0, 8).join('\n') };
    try { if (failurePath) await page.screenshot({ path: failurePath, type: 'jpeg', quality: 55, fullPage: false, timeout: 2500 }); } catch {}
    result.errors = helper.diagnostics; result.providerAttempts = helper.diagnostics.providerAttempts;
    controlAudit.minimumWidth = Number.isFinite(controlAudit.minimumWidth) ? controlAudit.minimumWidth : null;
    controlAudit.minimumHeight = Number.isFinite(controlAudit.minimumHeight) ? controlAudit.minimumHeight : null;
    result.controlAudit = controlAudit;
    return result;
  } finally {
    for (const [game, initial] of Object.entries(result.soundOriginals || {})) {
      if (initial === null) continue;
      try { await setSound(page, helper, initial); } catch { (result.soundRestoreFailures ||= []).push(game); }
    }
    try { await helper.dispose(); } catch {}
    page.setDefaultTimeout(30000);
  }
};
