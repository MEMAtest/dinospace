import test from 'node:test';
import assert from 'node:assert/strict';
import { DINO_DETECTIVE_WORLDS, DINO_SEARCH_SPOTS, createDinoDetectiveRun, dinoSearchTargetsAreSafe, getDinoCluePlan } from '../src/data/dinoDetectiveBatch3.js';

test('twelve worlds form three four-world bands with safe five-round seeded runs', () => {
  assert.equal(DINO_DETECTIVE_WORLDS.length, 12);
  assert.equal(new Set(DINO_DETECTIVE_WORLDS.map(({ targetSpecies }) => targetSpecies)).size, 12);
  assert.ok(DINO_DETECTIVE_WORLDS.every(({ targetSpecies }) => !['ptero', 'elasmo', 'mosa'].includes(targetSpecies)));
  assert.equal(new Set(DINO_DETECTIVE_WORLDS.map(({ sceneFact }) => sceneFact)).size, 12);
  assert.ok(DINO_DETECTIVE_WORLDS.every(({ targetFact, sceneFact }) => targetFact.length > 15 && sceneFact.length > 15));
  assert.deepEqual(DINO_DETECTIVE_WORLDS.map((world) => world.bandId), Array(4).fill('starter').concat(Array(4).fill('growing'), Array(4).fill('challenge')));
  assert.ok(dinoSearchTargetsAreSafe(DINO_SEARCH_SPOTS, 330, 340, 64));
  for (let world = 0; world < 12; world += 1) {
    const a = createDinoDetectiveRun(world, 8421);
    const b = createDinoDetectiveRun(world, 8421);
    assert.deepEqual(a.rounds, b.rounds);
    assert.equal(new Set(a.rounds.map(({ targetSpotId }) => targetSpotId)).size, 5);
    assert.equal(a.rounds.length, 5);
  }
});

test('recent five-spot layouts are avoided when an alternative exists', () => {
  const first = createDinoDetectiveRun(0, 9);
  const second = createDinoDetectiveRun(0, 9, [first.signature]);
  assert.notEqual(second.signature, first.signature);
});

test('search clues reveal graduated evidence by band and hold exact direction until requested', () => {
  const run = createDinoDetectiveRun(0, 17);
  const round = run.rounds[0];
  const starter = getDinoCluePlan(0, 0, round);
  assert.equal(starter.trail, 'full');
  assert.equal(starter.revealTarget, false);
  assert.equal(getDinoCluePlan(0, 1, round).exactText, round.hintText);

  const growing = getDinoCluePlan(1, 0, round);
  assert.equal(growing.trail, 'partial');
  assert.equal(growing.revealTarget, false);
  const growingFirst = getDinoCluePlan(1, 1, round);
  assert.match(growingFirst.regionText, /upper|lower/);
  assert.equal(growingFirst.exactText, '');
  const growingSecond = getDinoCluePlan(1, 2, round);
  assert.equal(growingSecond.trail, 'full');
  assert.equal(growingSecond.revealTarget, true);
  assert.equal(growingSecond.exactText, round.hintText);

  const challenge = getDinoCluePlan(2, 0, round);
  assert.equal(challenge.trail, 'none');
  assert.equal(challenge.revealTarget, false);
  assert.match(challenge.baselineText, /^Search the (upper|lower) row, toward the (left|middle|right)\.$/);
  assert.equal(challenge.baselineText, getDinoCluePlan(2, 1, round).baselineText);
  assert.equal(getDinoCluePlan(2, 1, round).trail, 'partial');
  assert.equal(getDinoCluePlan(2, 2, round).exactText, round.hintText);
  assert.equal(getDinoCluePlan(3, 0, round), null);
});
