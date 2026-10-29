import test from 'node:test';
import assert from 'node:assert/strict';
import { DINO_NAMES, JIGSAW_SCENES, LITTLE_LEVELS } from '../src/data/littleGames.js';
import {
  JIGSAW_LEVELS, jigsawCompletionCredit, jigsawGuideMode, jigsawPlacementIsCorrect,
  jigsawReviewLine, jigsawTaskLine, jigsawPieceCount,
} from '../src/data/dinoJigsawProgression.js';

test('keeps saved level indexes and the established two, four, eight and twelve piece progression', () => {
  assert.equal(JIGSAW_LEVELS, LITTLE_LEVELS.dinojigsaw);
  assert.deepEqual(JIGSAW_LEVELS.map(({ grids }) => grids.map(jigsawPieceCount)), [
    [2, 2, 2, 2], [4, 4, 4, 4], [8, 8, 8, 8], [8, 8, 12, 12], [12, 12, 12, 12],
  ]);
  assert.deepEqual(JIGSAW_LEVELS.map(({ scenes }) => scenes), [4, 4, 4, 5, 6]);
  assert.deepEqual(JIGSAW_LEVELS.map(({ grids }) => grids.length), [4, 4, 4, 4, 4]);
});

test('later levels use six distinct authored dinosaur scene targets and switch to an optional picture clue', () => {
  assert.equal(JIGSAW_SCENES.length, 6);
  assert.equal(new Set(JIGSAW_SCENES.map(({ id }) => id)).size, 6);
  assert.equal(new Set(JIGSAW_SCENES.map(({ dino }) => dino)).size, 6);
  assert.deepEqual(JIGSAW_SCENES.map(({ dino }) => DINO_NAMES[dino]), [
    'T-rex', 'Brachiosaurus', 'Triceratops', 'Pterodactyl', 'Stegosaurus', 'Ankylosaurus',
  ]);
  JIGSAW_LEVELS.forEach(({ scenes, grids }) => assert.ok(scenes >= grids.length));
  assert.equal(jigsawGuideMode(0), 'full');
  assert.equal(jigsawGuideMode(1), 'on-demand');
  assert.equal(jigsawGuideMode(4), 'on-demand');
});

test('task and held review name the picture without asserting unsupported dinosaur facts', () => {
  const pterodactyl = JIGSAW_SCENES.find(({ dino }) => dino === 'ptero');
  assert.equal(jigsawTaskLine(pterodactyl), 'Build the Pterodactyl.');
  assert.equal(jigsawReviewLine(pterodactyl), 'You matched each piece to its space by looking for picture parts that fit together. This is the Pterodactyl picture.');
  assert.equal(jigsawTaskLine(null), 'Build the dinosaur.');
});

test('wrong placements remain retryable; hints are reflected in round-credit flags', () => {
  const solvedSlots = [0, 2];
  assert.equal(jigsawPlacementIsCorrect(1, 0, solvedSlots), false);
  assert.equal(jigsawPlacementIsCorrect(1, 1, solvedSlots), true, 'same piece can be tried in its matching empty space');
  assert.equal(jigsawPlacementIsCorrect(1, 2, solvedSlots), false, 'occupied spaces cannot accept another piece');
  assert.deepEqual(jigsawCompletionCredit(), { firstAttempt: true, independent: true, hints: 0 });
  assert.deepEqual(jigsawCompletionCredit({ wrongAttempts: 1 }), { firstAttempt: false, independent: true, hints: 0 });
  assert.deepEqual(jigsawCompletionCredit({ usedPictureClue: true }), { firstAttempt: false, independent: false, hints: 1 });
  assert.deepEqual(jigsawCompletionCredit({ usedAutoHint: true }), { firstAttempt: false, independent: false, hints: 1 });
  assert.deepEqual(jigsawCompletionCredit({ starterGuideShown: true }), { firstAttempt: false, independent: false, hints: 1 });
  assert.deepEqual(jigsawCompletionCredit({ wrongAttempts: 1, usedAutoHint: true, starterGuideShown: true }), { firstAttempt: false, independent: false, hints: 2 });
  assert.deepEqual(jigsawCompletionCredit({ usedPictureClue: true, usedAutoHint: true }), { firstAttempt: false, independent: false, hints: 2 });
});


test('eight- and twelve-piece stages wait for requested help instead of automatically revealing placements', async () => {
  const { jigsawAllowsAutomaticHint } = await import('../src/data/dinoJigsawProgression.js');
  assert.equal(jigsawAllowsAutomaticHint(0), true);
  assert.equal(jigsawAllowsAutomaticHint(1), true);
  for (const level of [2,3,4]) assert.equal(jigsawAllowsAutomaticHint(level), false);
});
