// Full actual-control layout matrix for the Pair 13 visual games.
// Caller supplies the existing leased Playwright page. All game answers are
// discovered through visible controls, hints, and visible region labels.
const createIntegrationNative = require('./integration-native.cjs');

const PUZZLE_CHAPTERS = [
  { id: 'starter', name: 'Picture Pioneers', pieces: 9, sceneIds: ['dino-park', 'river-valley', 'moon-camp', 'robin-tree'] },
  { id: 'growing', name: 'Curious Constructors', pieces: 16, sceneIds: ['hero-city', 'treehouse-robots', 'sound-safari', 'pattern-festival'] },
  { id: 'challenge', name: 'Detail Detectives', pieces: 25, sceneIds: ['time-observatory', 'world-explorer', 'history-hall', 'nature-lab'] },
];
const SPOT_CHAPTERS = [
  { id: 'starter', name: 'Bright-Eyed Beginners', changes: 3, hints: 2, sceneIds: ['spot-1', 'spot-2', 'spot-3', 'spot-4'] },
  { id: 'growing', name: 'Curious Comparers', changes: 5, hints: 2, sceneIds: ['spot-5', 'spot-6', 'spot-7', 'spot-8'] },
  { id: 'challenge', name: 'Super Spotters', changes: 7, hints: 2, sceneIds: ['spot-9', 'spot-10', 'spot-11', 'spot-12'] },
];

const esc = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const button = (page, name) => page.getByRole('button', { name, exact: true });
const visibleButton = (page, re) => page.getByRole('button', { name: re }).first();
const spotGameHeader = page => page.locator('header').filter({ has: page.getByRole('heading', { name: 'Spot the Difference', exact: true }) });

async function settleImages(page) {
  await page.waitForFunction(async () => {
    const images = [...document.querySelectorAll('main img')];
    await Promise.all(images.map(image => image.decode().catch(() => null)));
    return images.every(image => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0);
  }, null, { timeout: 12000 });
  return page.locator('main img').evaluateAll(images => images.map(image => ({
    alt: image.alt || '', src: image.currentSrc || image.src,
    width: image.naturalWidth, height: image.naturalHeight,
  })));
}

async function clickNavigation(page, helper, locator, label) {
  if (await locator.count() !== 1 || !await locator.isVisible()) throw new Error(`${label} is not uniquely visible`);
  await locator.evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'nearest' }));
  return helper.clickControl(locator, { label });
}

async function returnHomeIfNeeded(page, helper) {
  const chooser = page.getByRole('heading', { name: 'Choose a world', exact: true });
  if (await chooser.count() && await chooser.isVisible()) return;
  const home = button(page, 'Back to home');
  await clickNavigation(page, helper, home, 'Return from the prior parent world to the normal world chooser');
  await chooser.waitFor({ timeout: 10000 });
}

async function enterGame(page, helper, title, world) {
  await returnHomeIfNeeded(page, helper);
  const worldCard = page.locator('.discovery-world-card').filter({ hasText: world });
  await clickNavigation(page, helper, worldCard, `${world} world`);
  const catalogueCard = page.locator('.catalogue-game-card').filter({ hasText: title });
  await clickNavigation(page, helper, catalogueCard, `${title} catalogue entry`);
  await catalogueCard.waitFor({ state: 'hidden', timeout: 10000 });
  await page.locator('main:visible').first().waitFor({ timeout: 10000 });
}

async function leaveGame(page, helper, title, world) {
  const back = button(page, 'Back to learning world');
  const click = await helper.clickLeave(back, { label: `${title} return to its parent world` });
  await page.getByRole('heading', { name: world, exact: true }).waitFor({ timeout: 10000 });
  await page.locator('.discovery-world-page').getByText(title, { exact: true }).waitFor({ timeout: 5000 });
  return click;
}

async function soundState(page) {
  const control = page.getByRole('button', { name: /^Turn sound (on|off)$/ }).first();
  if (!await control.count()) return null;
  const label = await control.getAttribute('aria-label');
  return label === 'Turn sound off';
}

async function setSound(page, helper, wanted) {
  const current = await soundState(page);
  if (current === null || current === wanted) return current;
  const control = button(page, current ? 'Turn sound off' : 'Turn sound on');
  await helper.clickControl(control, { label: wanted ? 'Enable packaged sound' : 'Restore sound preference' });
  return soundState(page);
}

async function rewardSnapshot(page) {
  return page.evaluate(() => {
    const prefix = 'qa_rewards_20261024_';
    const key = `${prefix}amari_rewards_v2`;
    const raw = localStorage.getItem(key);
    if (raw === null) return { present: false, rawBytes: 0 };
    try {
      const value = JSON.parse(raw);
      return {
        present: true,
        points: Number(value.points) || 0,
        gamesPlayed: value.gamesPlayed || {},
        rewardClaims: value.rewardClaims || {},
        earnedStickerCount: Array.isArray(value.earnedStickerIds) ? value.earnedStickerIds.length : 0,
      };
    } catch { return { present: true, malformed: true, rawBytes: new TextEncoder().encode(raw).length }; }
  });
}

async function readLogicalKey(page, key) {
  return page.evaluate(name => localStorage.getItem(name), key);
}

async function armStorageFault(page, mode, key) {
  return page.evaluate(({ mode, key }) => {
    if (window.__pair13StorageFaultV1) throw new Error('A Pair 13 storage fault is already armed');
    const prototype = Storage.prototype;
    const state = { mode, key, fired: false, didSet: false, originalGetItem: prototype.getItem, originalSetItem: prototype.setItem };
    prototype.setItem = function (name, value) {
      if (state.mode === 'write' && name === state.key && !state.fired) {
        state.fired = true;
        throw new Error('Synthetic Pair 13 storage write failure');
      }
      const result = state.originalSetItem.call(this, name, value);
      if (state.mode === 'readback' && name === state.key) state.didSet = true;
      return result;
    };
    prototype.getItem = function (name) {
      if (state.mode === 'readback' && state.didSet && name === state.key && !state.fired) {
        state.fired = true;
        return '__pair13_unconfirmed_readback__';
      }
      return state.originalGetItem.call(this, name);
    };
    window.__pair13StorageFaultV1 = state;
    return { mode, key };
  }, { mode, key });
}

async function restoreStorageFault(page) {
  return page.evaluate(() => {
    const state = window.__pair13StorageFaultV1;
    if (!state) return { restored: true, armed: false };
    Storage.prototype.getItem = state.originalGetItem;
    Storage.prototype.setItem = state.originalSetItem;
    delete window.__pair13StorageFaultV1;
    return { restored: true, fired: state.fired, didSet: state.didSet, mode: state.mode, key: state.key };
  });
}

async function clickWithStorageFault(page, locator, helper, mode, key, label) {
  await armStorageFault(page, mode, key);
  let result;
  try {
    await helper.clickControl(locator, { label });
  } finally {
    result = await restoreStorageFault(page);
  }
  if (!result?.fired) throw new Error(`${label}: requested ${mode} fault did not reach ${key}`);
  return result;
}

async function puzzleProgressSnapshot(page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem('amari_puzzle_pop_batch2_v1');
    if (raw === null) return { raw: null, value: null };
    try { return { raw, value: JSON.parse(raw) }; }
    catch { return { raw, value: null, malformed: true }; }
  });
}

async function eligiblePuzzleRewardChapter(page) {
  const snapshot = await puzzleProgressSnapshot(page);
  const child = snapshot.value?.children?.amari || {};
  const completed = new Set(Array.isArray(child.completedSceneIds) ? child.completedSceneIds : []);
  const receipts = child.chapterReceipts || {};
  const index = PUZZLE_CHAPTERS.findIndex(chapter => !chapter.sceneIds.every(id => completed.has(id)) && !receipts[chapter.id]);
  return index < 0 ? { index: null, reason: 'No naturally incomplete chapter without an existing receipt; no reward eligibility was created.' } : { index, chapterId: PUZZLE_CHAPTERS[index].id };
}

async function eligibleSpotRewardChapter(page) {
  const snapshot = await page.evaluate(() => {
    const raw = localStorage.getItem('amari_spot_difference_batch2_v1');
    if (raw === null) return null;
    try { return JSON.parse(raw); } catch { return null; }
  });
  const child = snapshot?.children?.amari || {};
  const completed = new Set(Array.isArray(child.completedSceneIds) ? child.completedSceneIds : []);
  const receipts = child.chapterReceipts || {};
  const index = SPOT_CHAPTERS.findIndex(chapter => !chapter.sceneIds.every(id => completed.has(id)) && !receipts[chapter.id]);
  return index < 0 ? { index: null, reason: 'No naturally incomplete Spot chapter without an existing receipt; no reward eligibility was created.' } : { index, chapterId: SPOT_CHAPTERS[index].id };
}

async function isNaturalChapterCompletionTransition(page, game, chapter, sceneIndex) {
  const snapshot = game === 'puzzle' ? await puzzleProgressSnapshot(page) : await page.evaluate(() => {
    const raw = localStorage.getItem('amari_spot_difference_batch2_v1');
    try { return { raw, value: raw === null ? null : JSON.parse(raw) }; } catch { return { raw, value: null }; }
  });
  const child = snapshot.value?.children?.amari || {};
  const queue = game === 'puzzle' ? child.lastSceneQueue : child.lastQueue;
  const sceneId = Array.isArray(queue) ? queue[sceneIndex] : null;
  if (!chapter.sceneIds.includes(sceneId)) return false;
  const completed = new Set(Array.isArray(child.completedSceneIds) ? child.completedSceneIds : []);
  if (completed.has(sceneId) || child.chapterReceipts?.[chapter.id]) return false;
  return chapter.sceneIds.every(id => completed.has(id) || id === sceneId);
}

async function checkPendingSceneSave(page, helper, title, beforeRaw, expectedImageUrl) {
  await page.getByRole('button', { name: 'Retry saving this picture', exact: true }).waitFor({ timeout: 5000 });
  const panel = page.locator('.puzzle-completion-panel');
  if (!(await panel.innerText()).includes('Picture fact:')) throw new Error(`${title}: held picture fact disappeared during save failure`);
  const heading = panel.locator('h2');
  if (!(await heading.innerText()).includes(title)) throw new Error(`${title}: held completion title changed during save failure`);
  const completedImage = page.locator('img[alt^="Completed puzzle:"]');
  if (await completedImage.count() !== 1 || !await completedImage.isVisible()) throw new Error(`${title}: visible completed-picture feedback is missing during save failure`);
  const imageState = await completedImage.evaluate(image => ({
    alt: image.alt,
    src: image.currentSrc || image.src,
    complete: image.complete,
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight,
    rect: (() => { const box = image.getBoundingClientRect(); return { x: box.x, y: box.y, width: box.width, height: box.height }; })(),
  }));
  if (!imageState.alt.trim() || imageState.src !== expectedImageUrl || !imageState.complete || imageState.naturalWidth < 1 || imageState.naturalHeight < 1
      || imageState.rect.width < 1 || imageState.rect.height < 1) throw new Error(`${title}: completed picture is not decoded, visible, and matched to the held scene`);
  const loosePieces = page.getByRole('group', { name: 'Picture piece tray' }).getByRole('button', { name: /^Choose loose piece / });
  if (await loosePieces.count() !== 0) throw new Error(`${title}: loose pieces reappeared on the held completion screen`);
  const next = button(page, 'Next picture');
  if (await next.count() !== 1 || !await next.isDisabled()) throw new Error(`${title}: Next picture must remain disabled while local progress is unconfirmed`);
  const saved = await puzzleProgressSnapshot(page);
  if (saved.raw !== beforeRaw) throw new Error(`${title}: failed progress write changed the stored record`);
  const retry = button(page, 'Retry saving this picture');
  const retryGeometry = await helper.measureControl(retry, `${title} Retry saving this picture`);
  return { retryGeometry, completedImage: imageState, imageMatchesActiveScene: true, heldTitle: true, heldFact: true, noLoosePieces: true, storageUnchanged: true, nextDisabled: true };
}

async function exercisePuzzleWriteAndReadbackFaults(page, helper, title, destination, expectedImageUrl) {
  const beforeWrite = await puzzleProgressSnapshot(page);
  const writeFault = await clickWithStorageFault(page, button(page, destination), helper, 'write', 'amari_puzzle_pop_batch2_v1', `${title}: final piece with blocked progress write`);
  const heldWrite = await checkPendingSceneSave(page, helper, title, beforeWrite.raw, expectedImageUrl);

  const retry = button(page, 'Retry saving this picture');
  const readbackFault = await clickWithStorageFault(page, retry, helper, 'readback', 'amari_puzzle_pop_batch2_v1', `${title}: retry with committed progress readback blocked`);
  if (!readbackFault.didSet) throw new Error(`${title}: progress readback fault did not follow a committed write`);
  await page.getByRole('button', { name: 'Retry saving this picture', exact: true }).waitFor({ timeout: 5000 });
  const committedButUnconfirmed = await puzzleProgressSnapshot(page);
  if (committedButUnconfirmed.raw === beforeWrite.raw) throw new Error(`${title}: readback fault did not commit the held scene before reporting unconfirmed`);
  const heldReadback = await checkPendingSceneSave(page, helper, title, committedButUnconfirmed.raw, expectedImageUrl);

  await helper.clickControl(button(page, 'Retry saving this picture'), { label: `${title}: confirm the same pending scene after restoring storage` });
  await page.getByRole('button', { name: 'Next picture', exact: true }).waitFor({ timeout: 5000 });
  const afterRetry = await puzzleProgressSnapshot(page);
  if (afterRetry.raw !== committedButUnconfirmed.raw) throw new Error(`${title}: final retry changed an already committed scene instead of confirming it idempotently`);
  return { exercised: true, writeFault, heldWrite, readbackFault, heldReadback, finalRetryConfirmed: true, finalRecordStable: true };
}

async function rewardRawSnapshot(page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem('amari_rewards_v2');
    let value = null;
    try { value = raw === null ? null : JSON.parse(raw); } catch { /* returned as malformed evidence */ }
    return { raw, value };
  });
}

async function exercisePuzzleRewardFaultChain(page, helper, chapter, destination, chapterIndex, sceneIndex) {
  const receiptId = `${chapter.id}:complete`;
  const rewardToken = `dino:puzzle:${receiptId}`;
  const beforeParent = await rewardRawSnapshot(page);
  if (beforeParent.value?.rewardClaims?.[rewardToken] !== undefined) throw new Error(`${chapter.name}: parent receipt token already exists; fault eligibility was not fresh`);
  const writeFault = await clickWithStorageFault(page, button(page, destination), helper, 'write', 'amari_rewards_v2', `${chapter.name}: final scene with parent reward write blocked`);
  await page.getByRole('button', { name: 'Retry saving stars', exact: true }).waitFor({ timeout: 5000 });
  const heldNextName = sceneIndex < 3 ? 'Next picture' : chapterIndex < 2 ? 'Next chapter' : 'See chapter reward';
  const heldNext = button(page, heldNextName);
  if (await heldNext.count() !== 1 || !await heldNext.isDisabled()) throw new Error(`${chapter.name}: Next chapter must stay disabled while the parent reward claim is pending`);
  const afterFailedWrite = await rewardRawSnapshot(page);
  if (afterFailedWrite.raw !== beforeParent.raw) throw new Error(`${chapter.name}: blocked parent reward write changed the reward record`);
  const pendingProgress = await puzzleProgressSnapshot(page);
  if (pendingProgress.value?.children?.amari?.chapterReceipts?.[chapter.id]?.claimed !== false) throw new Error(`${chapter.name}: locally committed receipt was not pending after parent write failure`);

  const readbackFault = await clickWithStorageFault(page, button(page, 'Retry saving stars'), helper, 'readback', 'amari_rewards_v2', `${chapter.name}: retry with committed parent reward readback blocked`);
  if (!readbackFault.didSet) throw new Error(`${chapter.name}: parent readback fault did not follow a committed reward write`);
  await page.getByRole('button', { name: 'Retry saving stars', exact: true }).waitFor({ timeout: 5000 });
  const committedButUnconfirmed = await rewardRawSnapshot(page);
  if (committedButUnconfirmed.raw === beforeParent.raw) throw new Error(`${chapter.name}: blocked reward readback did not preserve a committed parent claim`);
  const unconfirmedValue = committedButUnconfirmed.value;
  if (unconfirmedValue?.rewardClaims?.[rewardToken] !== 2) throw new Error(`${chapter.name}: expected one 2-point claim under ${rewardToken}`);

  await helper.clickControl(button(page, 'Retry saving stars'), { label: `${chapter.name}: retry the same parent reward receipt` });
  await page.getByRole('button', { name: heldNextName, exact: true }).waitFor({ timeout: 5000 });
  const afterRetry = await rewardRawSnapshot(page);
  const puzzleProgress = await puzzleProgressSnapshot(page);
  const localReceipt = puzzleProgress.value?.children?.amari?.chapterReceipts?.[chapter.id];
  if (!localReceipt?.claimed || localReceipt.id !== receiptId) throw new Error(`${chapter.name}: local reward receipt was not confirmed after parent retry`);
  if (afterRetry.value?.rewardClaims?.[rewardToken] !== 2) throw new Error(`${chapter.name}: parent retry did not retain the exact two-point receipt`);
  if ((afterRetry.value?.points || 0) - (beforeParent.value?.points || 0) !== 2) throw new Error(`${chapter.name}: retry did not award exactly two parent points`);
  if ((afterRetry.value?.gamesPlayed?.puzzle || 0) - (beforeParent.value?.gamesPlayed?.puzzle || 0) !== 1) throw new Error(`${chapter.name}: the same parent receipt was counted more than once`);
  return {
    exercised: true, chapter: chapter.name, receiptId, rewardToken, writeFault, readbackFault,
    parentWriteUnchanged: true, committedButUnconfirmed: true, localReceiptClaimed: true,
    pointsBefore: beforeParent.value?.points || 0, pointsAfter: afterRetry.value?.points || 0,
    pointsDelta: afterRetry.value.points - (beforeParent.value?.points || 0),
    parentClaimCountBefore: Object.keys(beforeParent.value?.rewardClaims || {}).length,
    parentClaimCountAfter: Object.keys(afterRetry.value?.rewardClaims || {}).length,
  };
}

async function checkPendingSpotSave(page, helper, title, beforeRaw) {
  await page.getByRole('button', { name: 'Retry save', exact: true }).waitFor({ timeout: 5000 });
  const held = page.locator('section[aria-live="polite"]').filter({ has: page.getByText('Picture fact:', { exact: false }) }).first();
  if (!await held.count() || !(await held.innerText()).includes('Picture fact:')) throw new Error(`${title}: held Spot fact disappeared during save failure`);
  if (!(await held.innerText()).includes(`${title} pair complete!`)) throw new Error(`${title}: the completed Spot pair changed during save failure`);
  if (await button(page, 'Next picture').count() !== 0) throw new Error(`${title}: Next picture appeared before the pair save was confirmed`);
  const saved = await page.evaluate(() => localStorage.getItem('amari_spot_difference_batch2_v1'));
  if (saved !== beforeRaw) throw new Error(`${title}: failed Spot progress write changed the stored record`);
  const retryGeometry = await helper.measureControl(button(page, 'Retry save'), `${title} Retry save`);
  return { storageUnchanged: true, heldFactRetained: true, nextAbsent: true, retryGeometry };
}

async function exerciseSpotWriteAndReadbackFaults(page, helper, title, target) {
  const beforeWrite = await page.evaluate(() => localStorage.getItem('amari_spot_difference_batch2_v1'));
  const writeFault = await clickWithStorageFault(page, target, helper, 'write', 'amari_spot_difference_batch2_v1', `${title}: final found difference with blocked progress write`);
  const heldWrite = await checkPendingSpotSave(page, helper, title, beforeWrite);
  const readbackFault = await clickWithStorageFault(page, button(page, 'Retry save'), helper, 'readback', 'amari_spot_difference_batch2_v1', `${title}: retry with committed Spot readback blocked`);
  if (!readbackFault.didSet) throw new Error(`${title}: Spot readback fault did not follow a committed progress write`);
  await page.getByRole('button', { name: 'Retry save', exact: true }).waitFor({ timeout: 5000 });
  const committed = await page.evaluate(() => localStorage.getItem('amari_spot_difference_batch2_v1'));
  if (committed === beforeWrite) throw new Error(`${title}: Spot readback fault did not retain a committed pair`);
  const heldReadback = await checkPendingSpotSave(page, helper, title, committed);
  await helper.clickControl(button(page, 'Retry save'), { label: `${title}: confirm the same Spot pair after restoring storage` });
  await page.getByRole('button', { name: 'Next picture', exact: true }).waitFor({ timeout: 5000 });
  const afterRetry = await page.evaluate(() => localStorage.getItem('amari_spot_difference_batch2_v1'));
  if (afterRetry !== committed) throw new Error(`${title}: Spot Retry changed a pair already committed during the readback fault`);
  return { exercised: true, writeFault, heldWrite, readbackFault, heldReadback, finalRetryConfirmed: true, finalRecordStable: true };
}

async function exerciseSpotRewardFaultChain(page, helper, chapter, chapterIndex, pairIndex, target) {
  const receiptId = `${chapter.id}:complete`;
  const rewardToken = `dino:spot:${receiptId}`;
  const beforeParent = await rewardRawSnapshot(page);
  if (beforeParent.value?.rewardClaims?.[rewardToken] !== undefined) throw new Error(`${chapter.name}: Spot parent receipt token already exists; fault eligibility was not fresh`);
  const writeFault = await clickWithStorageFault(page, target, helper, 'write', 'amari_rewards_v2', `${chapter.name}: final pair with parent Spot reward write blocked`);
  await page.getByRole('button', { name: 'Retry save', exact: true }).waitFor({ timeout: 5000 });
  const nextName = pairIndex < 3 ? 'Next picture' : chapterIndex < 2 ? 'Next chapter' : 'Replay chapter';
  if (await button(page, nextName).count() !== 0) throw new Error(`${chapter.name}: ${nextName} appeared before parent Spot reward confirmation`);
  const afterFailedWrite = await rewardRawSnapshot(page);
  if (afterFailedWrite.raw !== beforeParent.raw) throw new Error(`${chapter.name}: blocked parent Spot reward write changed the reward record`);
  const pendingLocal = await page.evaluate(() => {
    const raw = localStorage.getItem('amari_spot_difference_batch2_v1');
    try { return JSON.parse(raw)?.children?.amari?.chapterReceipts || {}; } catch { return {}; }
  });
  if (pendingLocal[chapter.id]?.claimed !== false) throw new Error(`${chapter.name}: Spot chapter receipt was not pending after parent write failure`);

  const readbackFault = await clickWithStorageFault(page, button(page, 'Retry save'), helper, 'readback', 'amari_rewards_v2', `${chapter.name}: retry with committed Spot reward readback blocked`);
  if (!readbackFault.didSet) throw new Error(`${chapter.name}: Spot parent readback fault did not follow a committed reward write`);
  await page.getByRole('button', { name: 'Retry save', exact: true }).waitFor({ timeout: 5000 });
  const unconfirmed = await rewardRawSnapshot(page);
  if (unconfirmed.raw === beforeParent.raw || unconfirmed.value?.rewardClaims?.[rewardToken] !== 2) throw new Error(`${chapter.name}: committed-but-unconfirmed Spot reward did not hold the exact token and two points`);
  await helper.clickControl(button(page, 'Retry save'), { label: `${chapter.name}: confirm the same Spot reward receipt` });
  await button(page, nextName).waitFor({ timeout: 5000 });
  const afterRetry = await rewardRawSnapshot(page);
  const localAfter = await page.evaluate(() => {
    const raw = localStorage.getItem('amari_spot_difference_batch2_v1');
    try { return JSON.parse(raw)?.children?.amari?.chapterReceipts || {}; } catch { return {}; }
  });
  if (localAfter[chapter.id]?.id !== receiptId || localAfter[chapter.id]?.claimed !== true) throw new Error(`${chapter.name}: Spot receipt was not marked claimed after parent Retry`);
  if (afterRetry.value?.rewardClaims?.[rewardToken] !== 2 || (afterRetry.value?.points || 0) - (beforeParent.value?.points || 0) !== 2) throw new Error(`${chapter.name}: Spot parent Retry did not result in exactly one two-point claim`);
  if ((afterRetry.value?.gamesPlayed?.spot || 0) - (beforeParent.value?.gamesPlayed?.spot || 0) !== 1) throw new Error(`${chapter.name}: Spot reward retry counted the same receipt more than once`);
  return { exercised: true, chapter: chapter.name, receiptId, rewardToken, writeFault, readbackFault, localReceiptClaimed: true, pointsBefore: beforeParent.value?.points || 0, pointsAfter: afterRetry.value?.points || 0, pointsDelta: (afterRetry.value?.points || 0) - (beforeParent.value?.points || 0), parentClaimCountBefore: Object.keys(beforeParent.value?.rewardClaims || {}).length, parentClaimCountAfter: Object.keys(afterRetry.value?.rewardClaims || {}).length };
}

async function choosePuzzleChapter(page, helper, chapter) {
  const selected = page.locator('.puzzle-intro-title');
  if ((await selected.innerText()).trim() !== chapter.name) {
    const details = page.locator('details.puzzle-chapter-picker');
    if (await details.getAttribute('open') === null) {
      await clickNavigation(page, helper, page.getByText('Choose another chapter', { exact: true }), 'Open Puzzle Pop chapter selector');
    }
    const option = button(page, new RegExp(`^${esc(chapter.name)}$`));
    await clickNavigation(page, helper, option, `Select ${chapter.name}`);
    await page.waitForFunction(name => document.querySelector('.puzzle-intro-title')?.textContent?.trim() === name, chapter.name);
  }
}

async function startPuzzleChapter(page, helper, chapter) {
  const start = visibleButton(page, /^(Start chapter|Replay chapter)$/);
  await helper.clickControl(start, { label: `Start ${chapter.name}` });
  await page.getByRole('grid', { name: `${Math.sqrt(chapter.pieces)} by ${Math.sqrt(chapter.pieces)} puzzle board`, exact: true }).waitFor({ timeout: 10000 });
  await settleImages(page);
}

async function puzzleScene(page, helper, chapter, chapterIndex, sceneIndex, rows, faultPlan) {
  const title = (await page.locator('header p').first().innerText()).trim();
  if (!title) throw new Error(`Puzzle chapter ${chapterIndex + 1}, scene ${sceneIndex + 1} has no visible title`);
  const expectedImageUrl = await page.locator('.puzzle-piece-tray img').first().evaluate(image => image.currentSrc || image.src);
  const board = page.getByRole('grid', { name: `${Math.sqrt(chapter.pieces)} by ${Math.sqrt(chapter.pieces)} puzzle board`, exact: true });
  const initialCells = page.locator('button[aria-label^="Puzzle space "]');
  const initialTray = page.getByRole('group', { name: 'Picture piece tray' }).getByRole('button', { name: /^Choose loose piece / });
  if (await initialCells.count() !== chapter.pieces || await initialTray.count() !== chapter.pieces) {
    throw new Error(`${title}: expected ${chapter.pieces} visible cells and loose pieces`);
  }
  const cells = await initialCells.evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect();
    const point = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return { width: rect.width, height: rect.height, inViewport: rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight, centerHit: point === element || element.contains(point) };
  }));
  if (cells.some(cell => cell.width < 48 || cell.height < 48 || !cell.inViewport || !cell.centerHit)) {
    throw new Error(`${title}: puzzle cells fail 48px/viewport/hit geometry: ${JSON.stringify(cells.filter(cell => cell.width < 48 || cell.height < 48 || !cell.inViewport || !cell.centerHit))}`);
  }
  const loose = await initialTray.evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom };
  }));
  if (loose.some(cell => cell.width < 48 || cell.height < 48)) throw new Error(`${title}: loose piece buttons fall below 48px`);

  let wrongRetry = false;
  let audio = null;
  let placed = 0;
  let placementActions = 0;
  while (placed < chapter.pieces) {
    if (placementActions >= chapter.pieces) throw new Error(`${title}: placement loop exceeded its ${chapter.pieces}-action bound at ${placed}/${chapter.pieces}`);
    placementActions += 1;
    const priorPlaced = placed;
    const hint = visibleButton(page, /^(Hint|Show a piece mapping)$/);
    await helper.clickControl(hint, { label: `${title}: reveal one piece mapping` });
    const hinted = page.getByRole('button', { name: /^Puzzle space \d+, empty, hint space$/ });
    await hinted.waitFor({ timeout: 5000 });
    if (await hinted.count() !== 1) throw new Error(`${title}: Hint must identify exactly one empty destination`);
    const destinationName = await hinted.getAttribute('aria-label');
    const destinationIndex = Number(destinationName.match(/Puzzle space (\d+)/)?.[1]);
    if (!destinationIndex) throw new Error(`${title}: hinted destination has no visible index`);

    if (!wrongRetry && sceneIndex === 0) {
      const alternatives = await page.locator('button[aria-label^="Puzzle space "][aria-label*="empty"]')
        .evaluateAll(elements => elements.map(element => element.getAttribute('aria-label')));
      const wrongLabel = alternatives.find(label => Number(label.match(/Puzzle space (\d+)/)?.[1]) !== destinationIndex);
      if (!wrongLabel) throw new Error(`${title}: no other empty space for wrong-placement retry`);
      const wrong = button(page, wrongLabel);
      await helper.clickControl(wrong, { label: `${title}: wrong placement` });
      await page.getByText(/Not there yet\. Compare/, { exact: false }).waitFor({ timeout: 3000 });
      const looseAfterWrong = await page.getByRole('group', { name: 'Picture piece tray' }).getByRole('button', { name: /^Choose loose piece / }).count();
      if ((await page.locator('header p').first().innerText()).trim() !== title
          || looseAfterWrong !== chapter.pieces - placed) {
        throw new Error(`${title}: wrong placement did not hold the same picture and piece tray`);
      }
      wrongRetry = true;
    }

    const destination = `Puzzle space ${destinationIndex}, empty, hint space`;
    const target = button(page, destination);
    const lastPiece = placed === chapter.pieces - 1;
    if (faultPlan.enabled && lastPiece && chapterIndex === 0 && sceneIndex === 0 && !faultPlan.localProgress) {
      faultPlan.localProgress = await exercisePuzzleWriteAndReadbackFaults(page, helper, title, destination, expectedImageUrl);
    } else if (faultPlan.enabled && lastPiece && !faultPlan.parentReward
        && !(chapterIndex === 0 && sceneIndex === 0 && faultPlan.localProgress)
        && await isNaturalChapterCompletionTransition(page, 'puzzle', chapter, sceneIndex)) {
      faultPlan.parentReward = await exercisePuzzleRewardFaultChain(page, helper, chapter, destination, chapterIndex, sceneIndex);
    } else {
      await helper.clickControl(target, { label: `${title}: place the hinted piece at its visible destination` });
    }
    const expectedPlaced = priorPlaced + 1;
    if (expectedPlaced < chapter.pieces) {
      await page.waitForFunction(previous => document.querySelectorAll('button[aria-label^="Puzzle space "][aria-label$="piece in place"]').length !== previous, priorPlaced, { timeout: 2000 }).catch(() => null);
      const visiblePlaced = await page.locator('button[aria-label^="Puzzle space "][aria-label$="piece in place"]').count();
      if (visiblePlaced !== expectedPlaced) {
        throw new Error(`${title}: placement control "${destination}" failed to advance exactly one piece; prior=${priorPlaced}, after=${visiblePlaced}, expected=${expectedPlaced}`);
      }
    } else {
      try { await page.locator('.puzzle-completion-panel').waitFor({ state: 'visible', timeout: 2000 }); }
      catch {
        const visiblePlaced = await page.locator('button[aria-label^="Puzzle space "][aria-label$="piece in place"]').count();
        throw new Error(`${title}: final placement control "${destination}" did not reach the held completion panel; prior=${priorPlaced}, after=${visiblePlaced}, expected=${expectedPlaced} or completion screen`);
      }
    }
    placed += 1;
  }

  const held = page.locator('section[aria-live="polite"]').filter({ has: page.getByText('Picture fact:', { exact: false }) }).first();
  await held.waitFor({ timeout: 7000 });
  const fact = (await held.innerText()).trim();
  if (!fact.includes('Picture fact:')) throw new Error(`${title}: held picture fact is missing`);
  if (sceneIndex === 0) audio = await helper.observePackagedPlayback(button(page, 'Hear fact again'), `${title} packaged picture fact`);
  const nextName = sceneIndex === 3 ? (chapterIndex < 2 ? 'Next chapter' : 'See chapter reward') : 'Next picture';
  const next = button(page, nextName);
  const nextGeometry = await helper.measureControl(next, `${title} ${nextName}`);
  rows.push({ chapter: chapter.name, scene: sceneIndex + 1, title, pieces: chapter.pieces, wrongRetry, heldFact: fact, next: nextName, nextGeometry, audio });
  if (sceneIndex === 3 && chapterIndex === 2) {
    await helper.clickControl(next, { label: 'Open the final Puzzle Pop chapter reward' });
    await page.getByRole('heading', { name: /Detail Detectives complete!/, exact: true }).waitFor({ timeout: 5000 });
  } else {
    await helper.clickControl(next, { label: `${title}: explicit ${nextName}` });
    if (sceneIndex < 3) await page.waitForFunction(previous => document.querySelector('.puzzle-preview-title')?.textContent?.trim() !== previous, title, { timeout: 5000 });
    else await page.locator('.puzzle-intro-title').waitFor({ timeout: 5000 });
  }
  return { title, wrongRetry, nextName, nextGeometry, audio, faultEvidence: (faultPlan.localProgress && chapterIndex === 0 && sceneIndex === 0 ? faultPlan.localProgress : null) || (faultPlan.parentReward?.chapter === chapter.name ? faultPlan.parentReward : null) };
}

async function runPuzzle(page, helper, { faults = false } = {}) {
  const rows = [];
  const seen = new Map();
  const eligibility = faults ? await eligiblePuzzleRewardChapter(page) : { index: null, reason: 'Fault mode disabled.' };
  const faultPlan = { enabled: faults, parentChapterIndex: eligibility.index, localProgress: null, parentReward: null };
  for (let chapterIndex = 0; chapterIndex < PUZZLE_CHAPTERS.length; chapterIndex += 1) {
    const chapter = PUZZLE_CHAPTERS[chapterIndex];
    await choosePuzzleChapter(page, helper, chapter);
    await startPuzzleChapter(page, helper, chapter);
    const titles = [];
    for (let sceneIndex = 0; sceneIndex < 4; sceneIndex += 1) {
      const result = await puzzleScene(page, helper, chapter, chapterIndex, sceneIndex, rows, faultPlan);
      titles.push(result.title);
    }
    if (new Set(titles).size !== 4) throw new Error(`${chapter.name}: expected four distinct visible scene titles`);
    seen.set(chapter.name, titles);
    if (chapterIndex < 2) await page.locator('.puzzle-intro-title').waitFor({ timeout: 5000 });
  }
  if (rows.length !== 12 || rows.reduce((sum, row) => sum + row.pieces, 0) !== 200) throw new Error('Puzzle matrix did not cover all 12 scenes and 200 placements');
  return { taskIdentity: 'Puzzle Pop: all 3 chapters and 12 visible scene titles', wrongRetryRetained: rows.filter(row => row.wrongRetry).length === 3, transition: 'held', heldExplanation: 'Final picture facts were visible on each scene-complete surface.', heldNextGeometry: rows.map(row => row.nextGeometry), puzzleRows: rows, uniqueSceneTitles: Object.fromEntries(seen), placements: rows.reduce((sum, row) => sum + row.pieces, 0), faultChecks: { enabled: faults, localProgress: faultPlan.localProgress || { exercised: false, reason: 'The local 9-piece first scene was not reached.' }, parentRewardEligibility: eligibility, parentReward: faultPlan.parentReward || { exercised: false, reason: faults ? eligibility.reason : 'Fault mode disabled.' } }, allowedKeys: ['amari_puzzle_pop_batch2_v1'] };
}

async function pickSpotChapter(page, helper, chapter) {
  let selected = await page.locator('main').first().innerText();
  if (!selected.includes(chapter.name)) {
    const details = page.locator('main details').first();
    if (await details.count() && await details.getAttribute('open') === null) {
      await clickNavigation(page, helper, page.getByText('Choose another chapter', { exact: true }), 'Open Spot the Difference chapter selector');
    }
    const option = page.getByRole('button').filter({ hasText: chapter.name }).first();
    await clickNavigation(page, helper, option, `Select ${chapter.name}`);
  }
}

async function spotImages(page, helper, mobile) {
  const viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }));
  const tabs = page.getByRole('group', { name: 'Choose picture to compare' });
  if (mobile) {
    const a = button(page, 'Picture A · Compare');
    const b = button(page, 'Picture B · Find changes');
    await helper.measureControl(a, 'Spot Picture A tab');
    await helper.measureControl(b, 'Spot Picture B tab');
    await helper.clickControl(a, { label: 'Show Picture A for direct comparison' });
    const aPanel = page.getByRole('tabpanel', { name: 'Picture A · Compare', exact: true });
    await aPanel.waitFor({ state: 'visible' });
    const aRect = await aPanel.locator('img').boundingBox();
    await helper.clickControl(b, { label: 'Show Picture B to find changes' });
    const bPanel = page.getByRole('tabpanel', { name: 'Picture B · Find changes here', exact: true });
    await bPanel.waitFor({ state: 'visible' });
    const bRect = await bPanel.locator('img').boundingBox();
    if (!aRect || !bRect || aRect.x < 0 || aRect.y < 0 || aRect.x + aRect.width > viewport.width || aRect.y + aRect.height > viewport.height
        || bRect.x < 0 || bRect.y < 0 || bRect.x + bRect.width > viewport.width || bRect.y + bRect.height > viewport.height
        || Math.abs(aRect.width - bRect.width) > 1 || Math.abs(aRect.height - bRect.height) > 1) {
      throw new Error(`Phone A/B pictures do not use matching image geometry: A=${JSON.stringify(aRect)} B=${JSON.stringify(bRect)}`);
    }
    return { mode: 'phone-tabs', aRect, bRect, tabsVisible: true };
  }
  const aPanel = page.getByRole('tabpanel', { name: 'Picture A · Compare', exact: true });
  const bPanel = page.getByRole('tabpanel', { name: 'Picture B · Find changes here', exact: true });
  if (!await aPanel.isVisible() || !await bPanel.isVisible()) throw new Error('Desktop must show both Spot pictures side by side');
  const [aRect, bRect] = await Promise.all([aPanel.locator('img').boundingBox(), bPanel.locator('img').boundingBox()]);
  if (!aRect || !bRect || aRect.x < 0 || bRect.x < 0 || aRect.y < 0 || bRect.y < 0
      || aRect.x + aRect.width > viewport.width || bRect.x + bRect.width > viewport.width
      || aRect.y + aRect.height > viewport.height || bRect.y + bRect.height > viewport.height
      || aRect.x >= bRect.x || Math.abs(aRect.y - bRect.y) > 8 || Math.abs(aRect.height - bRect.height) > 12) {
    throw new Error(`Desktop A/B pair geometry is not aligned side by side: A=${JSON.stringify(aRect)} B=${JSON.stringify(bRect)}`);
  }
  return { mode: 'desktop-side-by-side', aRect, bRect, tabsVisible: await tabs.count() > 0 };
}

async function missPoint(page, search) {
  const data = await page.evaluate(() => {
    const image = document.querySelector('[role="tabpanel"][aria-label^="Picture B"] .relative.w-full.overflow-hidden');
    if (!image) return null;
    const rect = image.getBoundingClientRect();
    const targets = [...image.querySelectorAll('button[aria-label^="Check "]')].map(button => {
      const box = button.getBoundingClientRect();
      return { x: box.left + box.width / 2, y: box.top + box.height / 2, r: Math.max(box.width, box.height) / 2 + 6 };
    });
    const candidates = [];
    for (const fy of [.12, .24, .36, .5, .64, .76, .88]) for (const fx of [.08, .2, .35, .5, .65, .8, .92]) {
      const x = rect.left + rect.width * fx, y = rect.top + rect.height * fy;
      if (targets.every(target => Math.hypot(target.x - x, target.y - y) > target.r + 5)) candidates.push({ x: rect.width * fx, y: rect.height * fy, clientX: x, clientY: y });
    }
    return candidates[0] || null;
  });
  if (!data) throw new Error('Could not identify a blank visible point in Picture B away from public target controls');
  return data;
}

async function spotPair(page, helper, chapter, chapterIndex, pairIndex, rows, mobile, faultPlan) {
  const titleLocator = page.locator('section.mb-2 p').first();
  const title = (await titleLocator.innerText()).split(' · ')[0].trim();
  if (!title) throw new Error(`Spot ${chapter.name} pair ${pairIndex + 1} has no visible title`);
  await settleImages(page);
  const imageLayout = await spotImages(page, helper, mobile);
  const regionTargets = page.getByRole('button', { name: /^Check (left|middle|right) (top|middle|bottom) detail$/ });
  if (await regionTargets.count() !== chapter.changes) throw new Error(`${title}: expected ${chapter.changes} public region controls, got ${await regionTargets.count()}`);
  const targetGeometry = [];
  for (let index = 0; index < await regionTargets.count(); index += 1) {
    targetGeometry.push(await helper.measureControl(regionTargets.nth(index), `${title} region control ${index + 1}`));
  }
  if (targetGeometry.some(row => row.rect.width < 48 || row.rect.height < 48)) throw new Error(`${title}: region control is under 48px`);
  for (let left = 0; left < targetGeometry.length; left += 1) for (let right = left + 1; right < targetGeometry.length; right += 1) {
    const a = targetGeometry[left].rect, b = targetGeometry[right].rect;
    if (a.x < b.right && a.right > b.x && a.y < b.bottom && a.bottom > b.y) {
      throw new Error(`${title}: public region targets overlap: ${JSON.stringify({ a: a.text, b: b.text, aRect: a, bRect: b })}`);
    }
  }

  let wrongRetry = false;
  if (pairIndex === 0) {
    const search = button(page, 'Search Picture B for a change');
    const point = await missPoint(page, search);
    const headerBefore = (await spotGameHeader(page).innerText()).trim();
    const hit = await search.evaluate((element, point) => {
      const rect = element.getBoundingClientRect();
      const x = rect.left + point.x, y = rect.top + point.y;
      const target = document.elementFromPoint(x, y);
      return { rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom }, viewport: { width: innerWidth, height: innerHeight }, x, y, hit: target === element || element.contains(target) };
    }, point);
    if (hit.rect.x < 0 || hit.rect.y < 0 || hit.rect.right > hit.viewport.width || hit.rect.bottom > hit.viewport.height || !hit.hit) {
      throw new Error(`${title}: blank-point search control does not fit or receive pointer input: ${JSON.stringify(hit)}`);
    }
    await search.click({ position: { x: point.x, y: point.y } });
    await page.getByText('Not that spot yet. Compare the same area in Picture A.', { exact: true }).waitFor({ timeout: 3000 });
    const headerAfter = (await spotGameHeader(page).innerText()).trim();
    if (headerAfter !== headerBefore) throw new Error(`${title}: wrong pixel tap advanced or changed the pair`);
    wrongRetry = true;
  }

  let audio = null;
  if (pairIndex === 0) audio = await helper.observePackagedPlayback(button(page, 'Hear clue'), `${title} packaged clue`);
  let usedHints = 0;
  let foundCount = 0;
  let faultEvidence = null;
  let targetActions = 0;
  while (foundCount < chapter.changes) {
    if (targetActions >= chapter.changes) throw new Error(`${title}: Spot target loop exceeded its ${chapter.changes}-action bound at ${foundCount}/${chapter.changes}`);
    targetActions += 1;
    const priorFound = foundCount;
    let target;
    if (usedHints < chapter.hints) {
      const hint = visibleButton(page, /^(Hint \d+|Magnifier \d+ left)$/);
      await helper.clickControl(hint, { label: `${title}: use visible magnifier ${usedHints + 1} of 2` });
      const highlighted = page.locator('button.animate-pulse[aria-label^="Check "]');
      await highlighted.waitFor({ timeout: 3000 });
      if (await highlighted.count() !== 1) throw new Error(`${title}: magnifier must identify one public region control`);
      target = highlighted;
      usedHints += 1;
    } else {
      const targets = page.getByRole('button', { name: /^Check (left|middle|right) (top|middle|bottom) detail$/ });
      if (!await targets.count()) throw new Error(`${title}: no public region control remains after two hints`);
      target = targets.first();
    }
    const finalDifference = foundCount === chapter.changes - 1;
    const targetName = await target.getAttribute('aria-label') || 'visible Spot target';
    if (faultPlan.enabled && finalDifference && chapterIndex === 0 && pairIndex === 0 && !faultPlan.localProgress) {
      faultEvidence = await exerciseSpotWriteAndReadbackFaults(page, helper, title, target);
      faultPlan.localProgress = faultEvidence;
    } else if (faultPlan.enabled && finalDifference && !faultPlan.parentReward
        && !(chapterIndex === 0 && pairIndex === 0 && faultPlan.localProgress)
        && await isNaturalChapterCompletionTransition(page, 'spot', chapter, pairIndex)) {
      faultEvidence = await exerciseSpotRewardFaultChain(page, helper, chapter, chapterIndex, pairIndex, target);
      faultPlan.parentReward = faultEvidence;
    } else {
      await helper.clickControl(target, { label: usedHints <= chapter.hints ? `${title}: inspect the visible Picture B target` : `${title}: check the next accessible Picture B detail` });
    }
    await page.waitForFunction(prior => {
      const header = [...document.querySelectorAll('header')].find(element => element.querySelector('h1')?.textContent?.trim() === 'Spot the Difference');
      const match = header?.innerText?.match(/Pair \d+ of 4 · (\d+)\/(\d+)/);
      return match && Number(match[1]) !== prior;
    }, priorFound, { timeout: 2000 }).catch(() => null);
    const header = (await spotGameHeader(page).innerText()).trim();
    const match = header.match(/Pair \d+ of 4 · (\d+)\/(\d+)/);
    const afterFound = match ? Number(match[1]) : null;
    if (afterFound !== priorFound + 1) throw new Error(`${title}: Spot control "${targetName}" failed to advance exactly one change; prior=${priorFound}, after=${afterFound ?? 'unavailable'}, expected=${priorFound + 1}`);
    foundCount = afterFound;
  }
  const disabledHint = visibleButton(page, /^(Hint 0|Magnifier 0 left)$/);
  if (await disabledHint.count() && !await disabledHint.isDisabled()) throw new Error(`${title}: more than two magnifiers can be used on one pair`);
  const held = page.locator('section[aria-live="polite"]').filter({ has: page.getByText('Picture fact:', { exact: false }) }).first();
  await held.waitFor({ timeout: 5000 });
  const fact = (await held.innerText()).trim();
  if (!fact.includes('Picture fact:')) throw new Error(`${title}: completed pair did not hold its fact`);
  if (pairIndex === 0) audio = await helper.observePackagedPlayback(button(page, 'Hear fact again'), `${title} packaged picture fact`);
  const nextName = pairIndex === 3 ? (chapterIndex < 2 ? 'Next chapter' : 'Replay chapter') : 'Next picture';
  const next = button(page, nextName);
  const nextGeometry = await helper.measureControl(next, `${title} ${nextName}`);
  rows.push({ chapter: chapter.name, pair: pairIndex + 1, title, changes: chapter.changes, wrongRetry, usedHints, fact, next: nextName, nextGeometry, targetGeometry, imageLayout, audio, faultEvidence });
  if (pairIndex === 3) {
    // Leave each chapter's final held result here. runSpot owns the single
    // visible Next chapter click at the first two chapter boundaries; the
    // final chapter remains on its held replay screen.
    return { title, wrongRetry, nextName, nextGeometry, audio };
  }
  await helper.clickControl(next, { label: `${title}: explicit ${nextName}` });
  await page.getByRole('button', { name: 'Search Picture B for a change', exact: true }).waitFor({ timeout: 5000 });
  return { title, wrongRetry, nextName, nextGeometry, audio };
}

async function runSpot(page, helper, mobile, { faults = false } = {}) {
  const rows = [];
  const seen = {};
  const eligibility = faults ? await eligibleSpotRewardChapter(page) : { index: null, reason: 'Fault mode disabled.' };
  const faultPlan = { enabled: faults, parentChapterIndex: eligibility.index, localProgress: null, parentReward: null };
  for (let chapterIndex = 0; chapterIndex < SPOT_CHAPTERS.length; chapterIndex += 1) {
    const chapter = SPOT_CHAPTERS[chapterIndex];
    await pickSpotChapter(page, helper, chapter);
    const start = visibleButton(page, /^(Start .+|Replay chapter)$/);
    await helper.clickControl(start, { label: `Start ${chapter.name}` });
    await button(page, 'Search Picture B for a change').waitFor({ timeout: 10000 });
    const titles = [];
    for (let pairIndex = 0; pairIndex < 4; pairIndex += 1) {
      let result;
      try {
        result = await spotPair(page, helper, chapter, chapterIndex, pairIndex, rows, mobile, faultPlan);
      } catch (error) {
        error.partialSpotRows = [...rows];
        error.partialSpotFaultChecks = { enabled: faults, localProgress: faultPlan.localProgress, parentRewardEligibility: eligibility, parentReward: faultPlan.parentReward };
        throw error;
      }
      titles.push(result.title);
      if (pairIndex === 3 && chapterIndex < 2) {
        const next = button(page, 'Next chapter');
        await helper.clickControl(next, { label: `${chapter.name}: open the next chapter` });
        await page.getByRole('heading', { name: 'Twelve picture pairs. Three chapters.', exact: true }).waitFor({ timeout: 5000 });
      }
    }
    if (new Set(titles).size !== 4) throw new Error(`${chapter.name}: expected four distinct visible pair titles`);
    seen[chapter.name] = titles;
  }
  if (rows.length !== 12) throw new Error(`Spot matrix covered ${rows.length} pairs instead of 12`);
  return { taskIdentity: 'Spot the Difference: all 3 chapters and 12 visible pair titles', wrongRetryRetained: rows.filter(row => row.wrongRetry).length === 3, transition: 'held', heldExplanation: 'Final pair facts remained on screen with the explicit replay action.', heldNextGeometry: rows.map(row => row.nextGeometry), spotRows: rows, uniquePairTitles: seen, foundChanges: rows.reduce((sum, row) => sum + row.changes, 0), faultChecks: { enabled: faults, localProgress: faultPlan.localProgress || { exercised: false, reason: 'The first 3-difference pair was not reached.' }, parentRewardEligibility: eligibility, parentReward: faultPlan.parentReward || { exercised: false, reason: faults ? eligibility.reason : 'Fault mode disabled.' } }, allowedKeys: ['amari_spot_difference_batch2_v1'] };
}

module.exports = async function runPuzzleSpotFit(page, { origin, expectedEntry, width, height, failurePath, faults = false } = {}) {
  const mobile = width <= 639;
  const helper = createIntegrationNative(page, { origin, expectedEntry, minimumTargetSize: 44, allowedCommonStorageKeys: ['amari_game_diagnostics_v1', 'amari_game_lifecycle_diagnostics_v1', 'amari_learning_attempts_v1', 'amari_skill_mastery_v1', 'amari-sound-on', 'amari_points', 'amari_earned_sticker_ids_v1', 'amari_games_played'] });
  const result = { origin, expectedEntry, viewport: { width, height }, faultsEnabled: faults, passed: false, lanes: [], failures: [] };
  let originalSound = null;
  try {
    await helper.installGuards();
    await page.setViewportSize({ width, height });
    await page.goto(`${origin}/?qa_pair13_fit=${Date.now()}#/?screen=home`, { waitUntil: 'domcontentloaded' });
    await helper.installGuards();
    await page.waitForFunction(() => window.__amariQaNamespaced === true, null, { timeout: 10000 });
    result.runtime = await helper.assertRuntime();
    const player = page.getByRole('button', { name: /Age 6\+.*Amari/ }).first();
    const worldChooser = page.getByRole('heading', { name: 'Choose a world', exact: true });
    const initialSurface = await Promise.race([
      player.waitFor({ state: 'visible', timeout: 10000 }).then(() => 'player-chooser'),
      worldChooser.waitFor({ state: 'visible', timeout: 10000 }).then(() => 'world-chooser'),
    ]).catch(() => { throw new Error('Timed out waiting for either the normal player chooser or the world chooser to mount'); });
    if (initialSurface === 'player-chooser') await clickNavigation(page, helper, player, 'Choose Amari in the normal player picker');
    await page.getByRole('heading', { name: 'Choose a world', exact: true }).waitFor({ timeout: 10000 });
    originalSound = await soundState(page);
    result.originalSound = originalSound;
    result.baselineStorage = await helper.snapshotStorage();
    result.rewardsBefore = await rewardSnapshot(page);
    await setSound(page, helper, true);

    await enterGame(page, helper, 'Puzzle Pop', 'Creative Lab');
    const puzzleRows = await runPuzzle(page, helper, { faults });
    await leaveGame(page, helper, 'Puzzle Pop', 'Creative Lab');
    const puzzleAfter = await helper.snapshotStorage();
    const puzzleStorage = helper.assertStorageChanges(result.baselineStorage, puzzleAfter, { allowedKeys: ['amari_puzzle_pop_batch2_v1', 'amari_recent_games', 'amari_rewards_v2', 'amari_points', 'amari_earned_sticker_ids_v1', 'amari_games_played', 'amari_game_diagnostics_v1', 'amari_game_lifecycle_diagnostics_v1', 'amari_learning_attempts_v1', 'amari_skill_mastery_v1'] });
    if (puzzleStorage.unexpected.length) throw new Error(`Puzzle Pop changed out-of-scope records: ${JSON.stringify(puzzleStorage.unexpected)}`);
    result.lanes.push({ id: 'puzzle', ...puzzleRows, storage: puzzleStorage, parentReturned: true });
    result.rewardsAfterPuzzle = await rewardSnapshot(page);

    await enterGame(page, helper, 'Spot the Difference', 'Thinking & Play');
    const spotRows = await runSpot(page, helper, mobile, { faults });
    const spotStorage = helper.assertStorageChanges(puzzleAfter, await helper.snapshotStorage(), { allowedKeys: ['amari_spot_difference_batch2_v1', 'amari_recent_games', 'amari_rewards_v2', 'amari_points', 'amari_earned_sticker_ids_v1', 'amari_games_played', 'amari_game_diagnostics_v1', 'amari_game_lifecycle_diagnostics_v1', 'amari_learning_attempts_v1', 'amari_skill_mastery_v1'] });
    if (spotStorage.unexpected.length) throw new Error(`Spot the Difference changed out-of-scope records: ${JSON.stringify(spotStorage.unexpected)}`);
    result.lanes.push({ id: 'spot', ...spotRows, storage: spotStorage, parentReturned: false });
    result.rewardsAfterSpot = await rewardSnapshot(page);
    result.rewardDeltas = {
      puzzle: {
        points: result.rewardsAfterPuzzle.points - result.rewardsBefore.points,
        gamesPlayed: (result.rewardsAfterPuzzle.gamesPlayed?.puzzle || 0) - (result.rewardsBefore.gamesPlayed?.puzzle || 0),
        claimCount: Object.keys(result.rewardsAfterPuzzle.rewardClaims || {}).length - Object.keys(result.rewardsBefore.rewardClaims || {}).length,
      },
      spot: {
        points: result.rewardsAfterSpot.points - result.rewardsAfterPuzzle.points,
        gamesPlayed: (result.rewardsAfterSpot.gamesPlayed?.spot || 0) - (result.rewardsAfterPuzzle.gamesPlayed?.spot || 0),
        claimCount: Object.keys(result.rewardsAfterSpot.rewardClaims || {}).length - Object.keys(result.rewardsAfterPuzzle.rewardClaims || {}).length,
      },
    };
    result.finalStorage = await helper.snapshotStorage();
    result.providerAttempts = [...helper.diagnostics.providerAttempts];
    helper.assertNoProviderAttempts();
    result.errors = helper.assertNoRuntimeErrors();
    result.passed = result.lanes.length === 2
      && result.lanes[0].puzzleRows.length === 12 && result.lanes[0].placements === 200
      && result.lanes[1].spotRows.length === 12 && result.lanes[1].foundChanges === 60;
    if (faults) {
      const faultLanePassed = lane => lane.faultChecks?.localProgress?.exercised === true
        && (lane.faultChecks.parentRewardEligibility.index === null || lane.faultChecks.parentReward?.exercised === true);
      if (!faultLanePassed(result.lanes[0]) || !faultLanePassed(result.lanes[1])) {
        result.passed = false;
        throw new Error('Opt-in 390px fault checks did not complete for each local-save path and naturally eligible parent receipt');
      }
    }
    if (!result.passed) throw new Error('Pair 13 matrix did not cover all 12+12 authored scenes and required piece/change counts');
    await leaveGame(page, helper, 'Spot the Difference', 'Thinking & Play');
    result.lanes[1].parentReturned = true;
    return result;
  } catch (error) {
    result.passed = false;
    result.failure = { message: String(error?.message || error), completedLanes: result.lanes.map(lane => lane.id), puzzleRows: result.lanes.find(lane => lane.id === 'puzzle')?.puzzleRows?.length || 0, spotRows: result.lanes.find(lane => lane.id === 'spot')?.spotRows?.length || 0 };
    if (Array.isArray(error?.partialSpotRows)) {
      result.failure.partialSpotRows = error.partialSpotRows;
      result.failure.partialSpotFaultChecks = error.partialSpotFaultChecks || null;
    }
    if (failurePath) {
      try { await page.screenshot({ path: failurePath, type: 'jpeg', quality: 65 }); result.failure.render = failurePath; }
      catch (captureError) { result.failure.renderError = String(captureError?.message || captureError); }
    }
    result.providerAttempts = [...helper.diagnostics.providerAttempts];
    result.errors = { ...helper.diagnostics };
    return result;
  } finally {
    try { if (originalSound !== null) await setSound(page, helper, originalSound); }
    catch (error) { result.soundRestoreError = String(error?.message || error); result.passed = false; }
    await helper.dispose();
  }
};
