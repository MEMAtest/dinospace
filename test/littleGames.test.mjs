import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DINO_NAMES, JIGSAW_SCENES, LITTLE_LEVELS, LITTLE_VOICE_LINES, RESCUE_ANIMALS, ROCKET_COLOURS,
  fuelPrompt, levelRounds, rescuePrompt, starsForMistakes,
} from '../src/data/littleGames.js';
import { getLittleLevel, recordLittleResult } from '../src/data/littleProgress.js';
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

test('every little game has five levels that get harder and never exceed its content', () => {
  const pieces = ([c, r]) => c * r;
  Object.entries(LITTLE_LEVELS).forEach(([gameId, levels]) => {
    assert.equal(levels.length, 5, gameId);
    levels.forEach((config) => assert.ok(levelRounds(gameId, config) >= 2, gameId));
  });
  const jig = LITTLE_LEVELS.dinojigsaw;
  assert.equal(pieces(jig[0].grids[0]), 2);
  assert.ok(Math.max(...jig[4].grids.map(pieces)) > Math.max(...jig[0].grids.map(pieces)));
  jig.forEach((config) => assert.ok(config.scenes <= JIGSAW_SCENES.length));
  LITTLE_LEVELS.shadowmatch.forEach((config) => {
    assert.ok(config.kinds <= Object.keys(DINO_NAMES).length);
    assert.ok(Math.max(...config.choices) <= config.kinds);
  });
  LITTLE_LEVELS.rocketbuilder.forEach((config) => assert.ok(config.colours <= ROCKET_COLOURS.length));
  assert.ok(Math.max(...LITTLE_LEVELS.fuelup[0].numbers) <= 3);
  assert.ok(Math.max(...LITTLE_LEVELS.fuelup[4].numbers) <= 10);
  assert.ok(Math.max(...LITTLE_LEVELS.firerescue[0].fires) <= 2);
  LITTLE_LEVELS.ladder.forEach((config) => assert.ok(config.floors <= RESCUE_ANIMALS.length));
  assert.equal(LITTLE_LEVELS.dino[0].spots, 2, 'Askia starts with two hiding places');
  assert.equal(LITTLE_LEVELS.dino.at(-1).spots, 3, 'later searches have more hiding places');
  assert.ok(levelRounds('dino', LITTLE_LEVELS.dino.at(-1)) > levelRounds('dino', LITTLE_LEVELS.dino[0]));
});

test('stars and levels move with how the game went', () => {
  assert.equal(starsForMistakes(0), 3);
  assert.equal(starsForMistakes(3), 2);
  assert.equal(starsForMistakes(9), 1);
  const store = new Map();
  const storage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
  assert.equal(getLittleLevel('askia', 'fuelup', false, storage), 0);
  assert.equal(recordLittleResult('askia', 'fuelup', false, 3, storage).levelUp, true);
  assert.equal(getLittleLevel('askia', 'fuelup', false, storage), 1);
  assert.equal(recordLittleResult('askia', 'fuelup', false, 2, storage).level, 1);
  assert.equal(recordLittleResult('askia', 'fuelup', false, 1, storage).level, 0);
  assert.equal(recordLittleResult('askia', 'fuelup', false, 1, storage).level, 0, 'never below the start level');
  assert.equal(getLittleLevel('amari', 'fuelup', true, storage), 2, 'older child starts at level 3');
  for (let i = 0; i < 8; i += 1) recordLittleResult('askia', 'ladder', false, 3, storage);
  assert.equal(getLittleLevel('askia', 'ladder', false, storage), 4, 'capped at the top level');
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

test('older games get short sessions that end, with honest stars', async () => {
  const { GAME_SESSIONS, sessionStars, sessionTarget } = await import('../src/data/gameSessions.js');
  const { LEARNING_WORLDS } = await import('../src/data/learningWorlds.js');
  const allGames = new Set(LEARNING_WORLDS.flatMap((world) => world.gameIds));
  Object.entries(GAME_SESSIONS).forEach(([id, rule]) => {
    assert.ok(allGames.has(id), id);
    assert.ok(rule.target >= 1 && rule.how, id);
    assert.ok(sessionTarget(rule, true) <= rule.target, id);
  });
  ['solar', 'astronaut', 'worldmap', 'storybooks', 'chess'].forEach((id) => assert.equal(GAME_SESSIONS[id], undefined, id));
  assert.equal(sessionStars(8, 8), 3);
  assert.equal(sessionStars(5, 8), 2);
  assert.equal(sessionStars(2, 8), 1);
});
