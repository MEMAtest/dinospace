import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DINO_NAMES, FIRE_COUNTS, FUEL_NUMBERS, JIGSAW_GRIDS, JIGSAW_SCENES, LADDER_FLOORS, LITTLE_VOICE_LINES,
  RESCUE_ANIMALS, ROCKET_BUILD_ROUNDS, SHADOW_CHOICES, fuelPrompt, rescuePrompt,
} from '../src/data/littleGames.js';
import { PENDING_VOICE_CORPUS, OFFLINE_VOICE_CORPUS } from '../scripts/offline-voice-corpus.mjs';
import { voiceClipKey, normalizeVoiceText } from '../src/data/voiceKey.js';
import { PLAYERS, getPlayer, isLittleExplorer, playerStorageKey } from '../src/data/players.js';
import { parentRoute, parseRoute, routeHash } from '../src/navigation.js';

test('every little-explorer line is queued for narration', () => {
  const keys = new Set([...OFFLINE_VOICE_CORPUS, ...PENDING_VOICE_CORPUS].map((item) => item.key));
  LITTLE_VOICE_LINES.forEach((line) => {
    assert.ok(keys.has(voiceClipKey(normalizeVoiceText(line), 'en-US')), line);
  });
  assert.ok(LITTLE_VOICE_LINES.includes(fuelPrompt(3)));
  assert.ok(LITTLE_VOICE_LINES.includes(rescuePrompt(RESCUE_ANIMALS[0])));
});

test('little rounds stay gentle and big rounds step up', () => {
  const pieces = ([c, r]) => c * r;
  assert.equal(pieces(JIGSAW_GRIDS.little[0]), 2);
  assert.ok(Math.max(...JIGSAW_GRIDS.little.map(pieces)) <= 6);
  assert.ok(Math.max(...JIGSAW_GRIDS.big.map(pieces)) > Math.max(...JIGSAW_GRIDS.little.map(pieces)));
  assert.ok(Math.max(...FUEL_NUMBERS.little) <= 5);
  assert.ok(Math.max(...FIRE_COUNTS.little) <= 3);
  assert.ok(SHADOW_CHOICES.little.every((n) => n <= 3));
  assert.ok(LADDER_FLOORS.little <= RESCUE_ANIMALS.length && LADDER_FLOORS.big <= RESCUE_ANIMALS.length);
  assert.ok(ROCKET_BUILD_ROUNDS.little[0].length <= 2);
  assert.ok(Math.max(...SHADOW_CHOICES.big) <= Object.keys(DINO_NAMES).length);
  JIGSAW_SCENES.forEach((scene) => assert.ok(DINO_NAMES[scene.dino], scene.id));
});

test("each child keeps separate progress, and Amari's original keys are kept", () => {
  assert.deepEqual(PLAYERS.map((p) => p.id), ['amari', 'askia']);
  assert.equal(playerStorageKey('amari', 'points'), 'amari_points');
  assert.equal(playerStorageKey('askia', 'points'), 'askia_points');
  assert.equal(isLittleExplorer('askia'), true);
  assert.equal(isLittleExplorer(getPlayer('amari')), false);
});

test('hash routes round-trip and back always has somewhere to go', () => {
  ['#/', '#/home', '#/world/maths', '#/play/fuelup', '#/stickers', '#/grownups'].forEach((hash) => {
    assert.equal(routeHash(parseRoute(hash)), hash);
  });
  assert.deepEqual(parseRoute(''), { name: 'welcome' });
  assert.deepEqual(parseRoute('#/nonsense'), { name: 'home' });
  assert.deepEqual(parentRoute({ name: 'game', id: 'math' }), { name: 'home' });
  assert.deepEqual(parentRoute({ name: 'home' }), { name: 'welcome' });
  assert.equal(parentRoute({ name: 'welcome' }), null);
});
