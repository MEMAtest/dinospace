import test from 'node:test';
import assert from 'node:assert/strict';
import { makeColourRun } from '../src/data/batch5Colour.js';
import { makeOddRun } from '../src/data/batch5Reasoning.js';
import { completeReasoningRun, getReasoningProgress } from '../src/data/batch5ReasoningProgress.js';
const memory = () => { const data = new Map(); return { getItem: (key) => data.get(key), setItem: (key, value) => data.set(key, value) }; };
const resultsFor = (run, firstTry = true) => run.missions.map(({ id }) => ({ id, correct: true, firstTry, hints: firstTry ? 0 : 1 }));
for (const [game, maker] of [['colormix', makeColourRun], ['oddoneout', makeOddRun]]) {
  test(`${game}: only completed canonical unlocked runs persist, best-star deltas and sibling isolation`, () => {
    const storage = memory();
    const locked = maker({ chapter: 2, seed: 1 });
    assert.equal(completeReasoningRun({ game, run: locked, results: resultsFor(locked) }, storage), null);
    const run = maker({ chapter: 0, seed: 2 });
    assert.equal(completeReasoningRun({ game, run, results: resultsFor(run).slice(0, 5) }, storage), null);
    assert.equal(completeReasoningRun({ game, run, results: resultsFor(run), playerId: 'askia' }, storage), null);
    const assisted = completeReasoningRun({ game, run, results: resultsFor(run, false) }, storage);
    assert.equal(assisted.awardedStars, 1); assert.equal(assisted.progress.unlocked, 1); assert.equal(assisted.persisted, true);
    assert.equal(completeReasoningRun({ game, run, results: resultsFor(run) }, storage).awardedStars, 2);
    assert.equal(completeReasoningRun({ game, run, results: resultsFor(run) }, storage).awardedStars, 0);
    assert.equal(getReasoningProgress(game, 'amari', storage).bestStars[0], 3);
    assert.deepEqual(getReasoningProgress(game, 'askia', storage).completed, []);
    const broken = { ...run, missions: run.missions.map((entry, index) => index ? entry : { ...entry, answer: 'invented', answerId: 'invented' }) };
    assert.equal(completeReasoningRun({ game, run: broken, results: resultsFor(broken) }, storage), null);
  });
}
test('palette only saves completed canonical design targets and storage failure is explicit', () => {
  const storage = memory();
  const run = makeColourRun({ chapter: 1, seed: 12 });
  assert.equal(completeReasoningRun({ game: 'colormix', run, results: resultsFor(run) }, storage), null);
  const start = makeColourRun({ chapter: 0, seed: 2 });
  completeReasoningRun({ game: 'colormix', run: start, results: resultsFor(start) }, storage);
  completeReasoningRun({ game: 'colormix', run, results: resultsFor(run) }, storage);
  assert.ok(getReasoningProgress('colormix', 'amari', storage).palettes.length > 0);
  const failure = { getItem: () => null, setItem: () => { throw new Error('full'); } };
  assert.equal(completeReasoningRun({ game: 'colormix', run: start, results: resultsFor(start) }, failure).persisted, false);
});
