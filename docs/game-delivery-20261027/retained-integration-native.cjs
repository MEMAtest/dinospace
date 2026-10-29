// Bounded retained-game integration runner. The caller supplies an already
// leased Playwright page; it loads title-specific visible-control recipes and never creates
// a browser, changes storage directly, or imports hidden game answer state.
const createIntegrationNative = require('./integration-native.cjs');
const VISUAL_EXERCISES = require('./retained-visual-exercises.cjs');

function defaultExercises() {
  let maths = {};
  try {
    const source = require('./retained-maths-exercises.cjs');
    maths = source.mathExerciseFactories || source.MATH_EXERCISES || {};
  } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND' || !String(error.message).includes('retained-maths-exercises.cjs')) throw error;
  }
  return { ...VISUAL_EXERCISES, ...maths };
}

const RETAINED_LANES = Object.freeze([
  { id: 'trace', title: 'Letter Trace', world: 'Read & Write', allowedKeys: ['amari_letter_trace_progress_v1'] },
  { id: 'tictactoe', title: 'Cosmic Tic-Tac-Toe', world: 'Thinking & Play', allowedKeys: ['amari_cosmic_tactics_v1'] },
  { id: 'puzzle', title: 'Puzzle Pop', world: 'Creative Lab', allowedKeys: ['amari_puzzle_pop_batch2_v1'] },
  { id: 'spot', title: 'Spot the Difference', world: 'Thinking & Play', allowedKeys: ['amari_spot_difference_batch2_v1'] },
  { id: 'jet', title: 'Sky Shapes', world: 'Creative Lab', allowedKeys: ['amari_sky_shapes_progress_v1'] },
  { id: 'math', title: 'Monster Math', world: 'Maths Missions', allowedKeys: ['amari_monster_math_progress_v1'] },
  { id: 'counting', title: 'Count the Stars', world: 'Maths Missions', allowedKeys: ['amari_amari_count_the_stars_batch3_v1'] },
  { id: 'addition', title: 'Addition Adventure', world: 'Maths Missions', allowedKeys: ['amari_addition_progress_v1'] },
  { id: 'subtraction', title: 'Subtraction Station', world: 'Maths Missions', allowedKeys: ['amari_subtraction_progress_v1'] },
  { id: 'numberline', title: 'Number Line Jump', world: 'Maths Missions', allowedKeys: ['amari_numberline_progress_v1'] },
  { id: 'timeteller', title: 'Time Teller', world: 'Maths Missions', allowedKeys: ['amari_timeteller_progress_v1'] },
  { id: 'phonics', title: 'Sound Safari', world: 'Read & Write', allowedKeys: ['amari_sound_safari_adventure_v1'] },
  { id: 'colormix', title: 'Colour Mixing Lab', world: 'Creative Lab', allowedKeys: ['amari_colour_lab_adventure_v1:amari'] },
  { id: 'shadowmatch', title: 'Shadow Match', world: 'Thinking & Play', allowedKeys: ['amari_little_progress'] },
]);

const worldButton = (page, title) => page.locator('.discovery-world-card').filter({ hasText: title });
const gameButton = (page, title) => page.locator('.catalogue-game-card').filter({ hasText: title });
const exactButton = (page, name) => page.getByRole('button', { name, exact: true });

async function clickCatalogueCard(page, helper, locator, label) {
  if (await locator.count() !== 1 || !await locator.isVisible()) {
    throw new Error(`${label} is not a unique visible catalogue card`);
  }
  // Catalogue cards are secondary navigation. Scroll only this card into view,
  // then require the shared helper's strict size, viewport, and center-hit gate.
  await locator.evaluate(e=>e.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'}));
  return helper.clickControl(locator, { label });
}

async function enterVisibleGame(page, helper, lane) {
  let homeWorld = worldButton(page, lane.world);
  if (await homeWorld.count() !== 1 || !await homeWorld.isVisible()) {
    const home = page.getByRole('button', { name: 'Home', exact: true });
    const backHome = exactButton(page, 'Back to home');
    if (await home.count() === 1 && await home.isVisible()) {
      await helper.clickControl(home, { label: 'Return to world selection' });
    } else if (await backHome.count() === 1 && await backHome.isVisible()) {
      await helper.clickControl(backHome, { label: 'Return to world selection' });
    }
    await page.getByRole('heading', { name: 'Choose a world', exact: true }).waitFor({ timeout: 8000 });
    homeWorld = worldButton(page, lane.world);
  }
  if (await homeWorld.count() !== 1 || !await homeWorld.isVisible()) throw new Error(`World card ${lane.world} is not visibly available`);
  await clickCatalogueCard(page, helper, homeWorld, `${lane.world} world card`);
  const card = gameButton(page, lane.title);
  if (await card.count() !== 1 || !await card.isVisible()) {
    throw new Error(`Normal visible catalogue route for ${lane.title} was not found`);
  }
  await clickCatalogueCard(page, helper, card, `${lane.title} game card`);
  // Many retained components use a child-friendly activity title instead of
  // repeating the catalogue title. Confirm the visible game card leaves the
  // screen, then wait for the rendered activity surface rather than guessing
  // an internal title string.
  await card.waitFor({ state: 'hidden', timeout: 10000 });
  await page.locator('main:visible, [data-little-game]:visible').first().waitFor({ timeout: 10000 });
}

async function returnToVisibleWorld(page, helper, lane) {
  const control = exactButton(page, 'Worlds');
  if (await control.count() !== 1 || !await control.isVisible()) throw new Error(`${lane.title} has no visible parent Worlds control`);
  await helper.clickLeave(control, { label: `${lane.title} parent navigation` });
  const world = worldButton(page, lane.world);
  const card = gameButton(page, lane.title);
  await Promise.race([
    world.first().waitFor({ state: 'visible', timeout: 8000 }),
    card.first().waitFor({ state: 'visible', timeout: 8000 }),
  ]).catch(() => { throw new Error(`${lane.title} did not return to its normal parent catalogue`); });
}

function validateExercise(lane, exercise) {
  if (!exercise || typeof exercise !== 'object') throw new TypeError(`Missing visible-control exercise for ${lane.id}`);
  if (typeof exercise.runVisibleSample === 'function') return;
  for (const field of ['taskIdentity', 'wrongControl', 'retryAnchor', 'modelControl', 'heldNext', 'heldRegion', 'afterNextAnchor']) {
    if (!exercise[field]) throw new TypeError(`${lane.id} exercise must supply ${field}`);
  }
}

async function horizontalLayout(page,title){const layout=await page.evaluate(()=>({viewportWidth:innerWidth,documentWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth}));if(Math.max(layout.documentWidth,layout.bodyWidth)>layout.viewportWidth+1)throw Error(title+' has horizontal page overflow '+JSON.stringify(layout));return {...layout,noHorizontalOverflow:true};}

async function runLaneSample(page, helper, lane, exercise) {
  validateExercise(lane, exercise);
  const before = await helper.snapshotStorage();
  if (typeof exercise.runVisibleSample === 'function') {
    const sample = await exercise.runVisibleSample();
    for (const field of ['taskIdentity', 'wrongRetryRetained']) {
      if (!sample?.[field]) throw new Error(`${lane.title} did not prove ${field}`);
    }
    if (sample.transition === 'held' && (!sample.heldExplanation || !sample.heldNextGeometry)) {
      throw new Error(`${lane.title} did not prove its held explanation and Next control`);
    }
    if (sample.audio?.checked && !sample.audio.packaged) throw new Error(`${lane.title} replay did not produce packaged audio`);
    const after = await helper.snapshotStorage();
    const storage = helper.assertStorageChanges(before, after, {
      allowedKeys: [...new Set([...lane.allowedKeys, ...(sample.allowedKeys || [])])],
      allowedPrefixes: sample.allowedPrefixes || [],
    });
    if (storage.unexpected.length) throw new Error(`${lane.title} changed records outside its declared scope`);
    return { id: lane.id, title: lane.title, ...sample, storage, layout: await horizontalLayout(page,lane.title) };
  }
  const taskIdentity = await exercise.taskIdentity();
  if (typeof taskIdentity !== 'string' || !taskIdentity.trim()) throw new Error(`${lane.id} task identity must come from visible prompt content`);

  await helper.clickControl(exercise.wrongControl, { label: `${lane.title} first wrong attempt` });
  const retryStillVisible = await exercise.retryAnchor.isVisible();
  const retryIdentity = await exercise.taskIdentity();
  if (!retryStillVisible || retryIdentity !== taskIdentity) throw new Error(`${lane.title} wrong attempt did not preserve the same visible task for retry`);

  await helper.clickControl(exercise.modelControl, { label: `${lane.title} model-based correct action` });
  const heldNextGeometry = await helper.measureControl(exercise.heldNext, `${lane.title} held Next`);
  const heldText = await exercise.heldRegion.innerText().catch(() => '');
  if (!heldText.trim()) throw new Error(`${lane.title} correct action did not hold its explanation visibly`);

  let audio = { checked: false, events: [] };
  if (exercise.audioControl) {
    const beforeAudio = await helper.audioEvents();
    await helper.clickControl(exercise.audioControl, { label: `${lane.title} exact replay control` });
    await page.waitForTimeout(exercise.audioWaitMs ?? 350);
    const afterAudio = await helper.audioEvents();
    const newEvents = afterAudio.filter(row => !beforeAudio.some(old => old.src === row.src && old.events.length === row.events.length));
    audio = { checked: true, events: newEvents, packaged: newEvents.length > 0 && newEvents.every(row => row.packaged) };
    if (!audio.packaged) throw new Error(`${lane.title} replay did not produce a newly observed packaged audio event`);
  }

  await helper.clickControl(exercise.heldNext, { label: `${lane.title} explicit Next` });
  if (!await exercise.afterNextAnchor.isVisible()) {
    throw new Error(`${lane.title} explicit Next did not advance to the expected visible task`);
  }

  const afterAction = await helper.snapshotStorage();
  const storage = helper.assertStorageChanges(before, afterAction, {
    allowedKeys: [...new Set([...lane.allowedKeys, ...(exercise.allowedKeys || [])])],
    allowedPrefixes: exercise.allowedPrefixes || [],
  });
  if (storage.unexpected.length) throw new Error(`${lane.title} changed records outside its declared scope`);
  return {
    id: lane.id,
    title: lane.title,
    taskIdentity,
    layout: await horizontalLayout(page,lane.title),
    wrongRetryRetained: true,
    heldExplanation: exercise.heldRegion ? heldText.trim() : null,
    heldNextGeometry,
    audio,
    storage,
  };
}

module.exports = async function runRetainedIntegration(page, {
  origin,
  expectedEntry,
  viewport,
  exercises,
  lanes = RETAINED_LANES,
} = {}) {
  if (!viewport || !Number.isFinite(viewport.width) || !Number.isFinite(viewport.height)) {
    throw new TypeError('Pass the measured viewport dimensions');
  }
  exercises ||= defaultExercises();
  if (!exercises || typeof exercises !== 'object') throw new TypeError('Pass visible-control exercise callbacks keyed by lane id');
  const helper = createIntegrationNative(page, { origin, expectedEntry, minimumTargetSize: 44, allowedCommonStorageKeys: ['amari_game_diagnostics_v1', 'amari_game_lifecycle_diagnostics_v1', 'amari_learning_attempts_v1', 'amari_skill_mastery_v1'] });
  const report = {
    scope: 'bounded retained-game actual-control integration smoke; not full lane acceptance',
    viewport,
    origin,
    expectedEntry,
    lanes: [],
    providerAttempts: [],
    errors: null,
  };
  try {
    await helper.installGuards();
    report.runtime = await helper.assertRuntime();
    const measuredViewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }));
    if (measuredViewport.width !== viewport.width || measuredViewport.height !== viewport.height) {
      throw new Error(`Viewport mismatch: expected ${JSON.stringify(viewport)}, got ${JSON.stringify(measuredViewport)}`);
    }
    report.baselineStorage = await helper.snapshotStorage();
    for (const lane of lanes) {
      await enterVisibleGame(page, helper, lane);
      const exerciseFactory = exercises[lane.id];
      const exercise = typeof exerciseFactory === 'function'
        ? await exerciseFactory({ page, helper, lane })
        : exerciseFactory;
      const sample = await runLaneSample(page, helper, lane, exercise);
      await returnToVisibleWorld(page, helper, lane);
      report.lanes.push({ ...sample, parentReturned: true });
    }
    report.finalStorage = await helper.snapshotStorage();
    report.providerAttempts = [...helper.diagnostics.providerAttempts];
    helper.assertNoProviderAttempts();
    report.errors = helper.assertNoRuntimeErrors();
    report.passed = report.lanes.length === lanes.length;
    return report;
  } catch (error) {
    report.passed = false;
    report.failure = { message: String(error?.message || error), completedLaneIds: report.lanes.map(row => row.id) };
    report.providerAttempts = [...helper.diagnostics.providerAttempts];
    report.errors = { ...helper.diagnostics };
    throw Object.assign(error, { retainedIntegrationPartial: report });
  } finally {
    await helper.dispose();
  }
};

module.exports.RETAINED_LANES = RETAINED_LANES;
module.exports.defaultExercises = defaultExercises;
