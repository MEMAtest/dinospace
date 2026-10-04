import test from 'node:test';
import assert from 'node:assert/strict';
import { BATCH3_VOICE_CORPUS_BY_GAME, countAnswerNarration, countCorrectNarration, dinoFoundNarration } from '../src/data/batch3Narration.js';
import { COUNT_THE_STARS_NARRATION, COUNT_THE_STARS_EPISODES } from '../src/data/countTheStarsBatch3.js';
import { DINO_DETECTIVE_NARRATION, DINO_DETECTIVE_WORLDS, createDinoDetectiveRun } from '../src/data/dinoDetectiveBatch3.js';

const has = (game, text) => BATCH3_VOICE_CORPUS_BY_GAME[game].includes(text);

test('counting sequences join to exact packaged count and question clips', () => {
  for (let count = 1; count <= 20; count += 1) {
    const line = countAnswerNarration(count);
    assert.equal(line.text, `${count} ${COUNT_THE_STARS_NARRATION.countQuestion}`);
    assert.deepEqual(line.segments, [String(count), COUNT_THE_STARS_NARRATION.countQuestion]);
    assert.ok(line.segments.every((segment) => has('counting', segment)));
  }
});

test('count praise and every authored explanation form packaged exact sequences', () => {
  for (const praise of COUNT_THE_STARS_NARRATION.praises) {
    assert.ok(has('counting', praise));
    for (const episode of COUNT_THE_STARS_EPISODES) {
      for (const scene of episode.scenes) {
        for (let count = episode.min; count <= episode.max; count += 1) {
          const explanation = COUNT_THE_STARS_NARRATION.explanations.find((line) => line === `There ${count === 1 ? 'is' : 'are'} ${count} ${count === 1 ? scene.noun : scene.noun.endsWith('y') ? `${scene.noun.slice(0, -1)}ies` : `${scene.noun}s`}. You counted each one once.`);
          assert.ok(explanation, `missing authored explanation for ${scene.noun} ${count}`);
          const line = countCorrectNarration(praise, explanation);
          assert.equal(line.text, line.segments.join(' '));
          assert.ok(line.segments.every((segment) => has('counting', segment)));
        }
      }
    }
  }
});

test('Dino instruction, wrong, completion, world facts, world hints and directional clues are packaged', () => {
  for (const text of [DINO_DETECTIVE_NARRATION.instruction, DINO_DETECTIVE_NARRATION.wrong, DINO_DETECTIVE_NARRATION.complete, ...DINO_DETECTIVE_NARRATION.worldLines, ...DINO_DETECTIVE_NARRATION.clueDirections.map((direction) => `Look in the ${direction} spot.`)]) {
    assert.ok(has('dino', text), `missing packaged Dino line: ${text}`);
  }
  for (const world of DINO_DETECTIVE_WORLDS) {
    const line = dinoFoundNarration(world);
    assert.equal(line.segments[0], DINO_DETECTIVE_NARRATION.found);
    assert.equal(line.text, line.segments.join(' '));
    assert.ok(line.segments.every((segment) => has('dino', segment)));
    const run = createDinoDetectiveRun(world.index, 8);
    for (const round of run.rounds) assert.ok(has('dino', round.hintText));
  }
});

test('wetland and cave facts use concrete age-6 wording while preserving the science', () => {
  const swamp = DINO_DETECTIVE_WORLDS.find(({ id }) => id === 'swamp');
  const cave = DINO_DETECTIVE_WORLDS.find(({ id }) => id === 'cave');
  assert.equal(swamp.sceneFact, 'A wetland is a place where the ground stays very wet. Some wetlands dry out for part of the year.');
  assert.equal(cave.sceneFact, 'Water can slowly dissolve (wear away) limestone rock and help caves form.');
  assert.ok(has('dino', swamp.sceneFact));
  assert.ok(has('dino', cave.sceneFact));
});
