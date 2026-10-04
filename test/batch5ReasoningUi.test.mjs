import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { COLOUR_CHAPTERS, COLOUR_RECIPES, COLOUR_SWATCHES, COLOUR_TASKS, makeColourRun, markColourAnswer, validateColourMission } from '../src/data/batch5Colour.js';
import { makeOddRun, markOddAnswer, ODD_CHAPTERS, ODD_RULES, validateOddMission } from '../src/data/batch5Reasoning.js';
import { buildBatch5ReasoningNarrationInventory } from '../scripts/batch5ReasoningNarrationInventory.mjs';
import { batch5AttemptMetrics } from '../src/components/games/batch5AttemptMetrics.js';
import { LEARNING_STORAGE_KEYS, recordLegacyGameEvent } from '../src/data/learningProgress.js';

const projectFile = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('colour model has explicit named equal-part recipes and every seed yields six unique answerable missions', () => {
  assert.deepEqual(COLOUR_RECIPES.map(({ partsFirst, partsSecond }) => [partsFirst, partsSecond]), COLOUR_RECIPES.map(() => [1, 1]));
  for (const recipe of COLOUR_RECIPES) assert.ok(COLOUR_SWATCHES[recipe.first] && COLOUR_SWATCHES[recipe.second] && COLOUR_SWATCHES[recipe.result]);
  for (let chapter = 0; chapter < 3; chapter += 1) for (let seed = 1; seed <= 150; seed += 1) {
    const run = makeColourRun({ chapter, seed });
    assert.equal(run.missions.length, 6);
    assert.equal(new Set(run.missions.map((mission) => mission.id)).size, 6);
    for (const mission of run.missions) {
      assert.ok(validateColourMission(mission));
      assert.equal(mission.choices.filter((choice) => markColourAnswer(mission, choice).correct).length, 1);
    }
  }
});

test('Odd One Out seed freezes the named property, exactly one odd picture and one valid because answer', () => {
  for (let chapter = 0; chapter < 3; chapter += 1) for (let seed = 1; seed <= 180; seed += 1) {
    const run = makeOddRun({ chapter, seed });
    assert.equal(run.missions.length, 6);
    assert.equal(new Set(run.missions.map((mission) => mission.ruleId)).size, 6);
    for (const mission of run.missions) {
      assert.ok(validateOddMission(mission));
      const rule = ODD_RULES.find((entry) => entry.id === mission.ruleId);
      assert.equal(mission.choices.filter((choice) => !rule.predicate(choice)).length, 1);
      assert.equal(mission.reasons.filter((reason) => markOddAnswer(mission, mission.answerId, reason.id).correct).length, 1);
      for (const choice of mission.choices.filter((entry) => entry.id !== mission.answerId)) assert.ok(rule.predicate(choice));
    }
  }
});

test('reasoning voice inventory covers every runtime authored prompt, label, fact and exact explanation sequence', () => {
  const inventory = buildBatch5ReasoningNarrationInventory();
  const texts = new Set(inventory.items.map((item) => item.text));
  assert.ok(inventory.items.length > 100);
  for (const chapter of [...COLOUR_CHAPTERS, ...ODD_CHAPTERS]) assert.ok(texts.has(chapter.title));
  for (const task of COLOUR_TASKS) { assert.ok(texts.has(task.prompt)); assert.ok(texts.has(task.fact)); }
  for (const rule of ODD_RULES) {
    assert.ok(texts.has(rule.property));
    for (const candidate of rule.candidates) assert.ok(texts.has(candidate.label));
    for (const reason of rule.reasons) assert.ok(texts.has(reason));
  }
  for (const sequence of inventory.sequences) { assert.ok(sequence.every((segment) => texts.has(segment))); assert.ok(texts.has(sequence.join(' '))); }
});

test('firstAttempt excludes prior mistakes while independent also excludes hints through the actual learning adapter', () => {
  assert.deepEqual(batch5AttemptMetrics(false, 0), { firstAttempt: true, independent: true });
  assert.deepEqual(batch5AttemptMetrics(false, 1), { firstAttempt: true, independent: false });
  assert.deepEqual(batch5AttemptMetrics(true, 0), { firstAttempt: false, independent: false });

  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  recordLegacyGameEvent('colormix', 'answer_correct', { skill: 'colour-recipe', item: 'predict:orange', correct: true, ...batch5AttemptMetrics(false, 1), hints: 1 }, storage);
  const attempts = JSON.parse(values.get(LEARNING_STORAGE_KEYS.attempts));
  assert.equal(attempts.length, 1);
  assert.equal(attempts[0].correct, true);
  assert.equal(attempts[0].firstAttempt, true);
  assert.equal(attempts[0].independent, false);
  assert.equal(attempts[0].hints, 1);
});

test('colour result visuals and saved palette use mixResult rather than a selected missing ingredient', async () => {
  const source = await projectFile('../src/components/games/AmariColorMixingLab.jsx');
  assert.ok(source.includes('Beaker colour={locked ? displayedMixResult : null}'));
  assert.ok(source.includes('recipeForResult(displayedMixResult)'));
  assert.ok(source.includes('Your mixed colours and their classroom recipes stay in the saved palette.'));
  assert.ok(source.includes('Choose an addition'));
  assert.ok(source.includes('{mission.clue}'));
  for (const task of COLOUR_TASKS.filter((entry) => entry.mixResult && entry.first && !entry.second)) {
    assert.ok(task.answer !== task.mixResult || task.id.startsWith('change:'), `task ${task.id} should exercise an input distinct from its result`);
  }
});

test('all four Amari Batch 5 screens report parent session phases on stage changes', async () => {
  const paths = ['AmariColorMixingLab.jsx', 'AmariOddOneOut.jsx', 'AmariSoundSafari.jsx', 'AmariSpellingStudio.jsx'];
  for (const path of paths) {
    const source = await projectFile(`../src/components/games/${path}`);
    assert.ok(source.includes('onPhaseChange = noop'), `${path} should accept an optional phase callback`);
    assert.ok(source.includes("stage === 'play' ? 'play' : stage === 'finish' ? 'done' : 'start'"), `${path} should classify map/start and finish states`);
    assert.ok(source.includes('[stage, onPhaseChange]'), `${path} should notify only when the phase or callback changes`);
  }
});

test('Amari chapter routing preserves Askia catalog components, skips wrapper duplication and passes cancellation', async () => {
  const [app, catalog] = await Promise.all([
    projectFile('../src/App.jsx'), projectFile('../src/gameCatalog.jsx'),
  ]);
  assert.ok(app.includes('!little && currentGame.amariComponent ? currentGame.amariComponent'));
  assert.ok(app.includes('cancelNarration: voice.cancel'));
  assert.ok(app.includes('ownsGameProgression(currentGame.id, little)'));
  for (const [id, legacy, amari] of [
    ['phonics', 'component: SoundSafari', 'amariComponent: AmariSoundSafari'],
    ['words', 'component: WordBuilder', 'amariComponent: AmariSpellingStudio'],
    ['colormix', 'component: ColorMixingLab', 'amariComponent: AmariColorMixingLab'],
    ['oddoneout', 'component: OddOneOut', 'amariComponent: AmariOddOneOut'],
  ]) {
    assert.ok(catalog.includes(`id: '${id}'`));
    assert.ok(catalog.includes(legacy));
    assert.ok(catalog.includes(amari));
  }
  const literacy = await projectFile('../src/components/games/AmariSpellingStudio.jsx');
  assert.ok(literacy.includes("onGameEvent?.('words', 'answer_correct'"));
  assert.ok(!literacy.includes("onGameEvent?.('spelling',"));
  assert.ok(!literacy.includes("onGameEvent?.('words', 'learning_attempt', makeLearningEvent({ skill: chapterIndex"));
});

test('reasoning UIs use finite packaged-only narration, chapter completion rewards and reduced-motion animation rules', async () => {
  const [colour, odd, css, inventoryScript] = await Promise.all([
    projectFile('../src/components/games/AmariColorMixingLab.jsx'), projectFile('../src/components/games/AmariOddOneOut.jsx'),
    projectFile('../src/components/games/batch5ReasoningGames.css'), projectFile('../scripts/check-batch5-reasoning-readiness.mjs'),
  ]);
  for (const source of [colour, odd]) {
    assert.ok(source.includes('premium: false'));
    assert.ok(source.includes('cancelRef.current'));
    assert.ok(source.includes('completeReasoningRun'));
    assert.ok(source.includes('completion.awardedStars > 0'));
    assert.ok(source.includes('onGameEvent?.'));
    assert.ok(!source.includes('speechSynthesis'));
    assert.ok(!source.includes('fetch('));
  }
  assert.ok(colour.includes("'colormix'"));
  assert.ok(odd.includes("'oddoneout'"));
  assert.ok(odd.includes('Because…'));
  assert.ok(colour.includes('DesignArt'));
  assert.ok(css.includes('prefers-reduced-motion: reduce'));
  assert.ok(inventoryScript.includes('Read-only local-source inventory'));
});
