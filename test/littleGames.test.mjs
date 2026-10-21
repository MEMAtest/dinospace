import test from 'node:test';
import assert from 'node:assert/strict';
import {
  chooseLittleDinoRound, DINO_NAMES, JIGSAW_SCENES, LITTLE_LEVELS, LITTLE_VOICE_LINES, RESCUE_ANIMALS, ROCKET_COLOURS,
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
  assert.deepEqual(jig.map(({ grids }) => grids.map(pieces)), [
    [2, 2, 2, 2], [4, 4, 4, 4], [8, 8, 8, 8], [8, 8, 12, 12], [12, 12, 12, 12],
  ], 'Askia jigsaw grows through clear 2, 4, 8 and 12 piece steps');
  jig.forEach((config) => {
    assert.ok(config.scenes <= JIGSAW_SCENES.length);
    assert.ok(config.scenes >= config.grids.length, 'each run has enough scenes to avoid repeating a picture');
  });
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
  assert.deepEqual(LITTLE_LEVELS.dino.map(({ rounds }) => rounds), [5, 5, 6, 6, 7], 'dinosaur searches start with five picks and grow');
  assert.equal(new Set(LITTLE_LEVELS.dino.map(({ rounds, spots, trail }) => `${rounds}-${spots}-${trail}`)).size, 5, 'each Dino Detective level changes the search');
  assert.ok(levelRounds('dino', LITTLE_LEVELS.dino.at(-1)) > levelRounds('dino', LITTLE_LEVELS.dino[0]));
});

test('Askia dinosaur searches vary species and hiding places without immediate target repeats', () => {
  const firstPlay = Array.from({ length: 6 }, (_, round) => chooseLittleDinoRound(round, 1, 3, 6, 214));
  const sameRun = Array.from({ length: 6 }, (_, round) => chooseLittleDinoRound(round, 1, 3, 6, 214));
  const nextRun = Array.from({ length: 6 }, (_, round) => chooseLittleDinoRound(round, 2, 3, 6, 214));
  const nextVisit = Array.from({ length: 6 }, (_, round) => chooseLittleDinoRound(round, 1, 3, 6, 9001));
  assert.deepEqual(firstPlay, sameRun, 'the mounted run keeps stable targets across rerenders');
  assert.ok(firstPlay.every((choice) => choice.targetIndex >= 0 && choice.targetIndex < 3));
  assert.ok(firstPlay.every((choice, index) => index === 0 || choice.targetIndex !== firstPlay[index - 1].targetIndex));
  assert.notDeepEqual(firstPlay, nextRun, 'a replay changes the target pattern');
  assert.notDeepEqual(firstPlay, nextVisit, 'a remounted visit changes the opening even when playId resets');
  assert.equal(new Set(firstPlay.map(({ speciesIndex }) => speciesIndex)).size, 6, 'a six-pick run meets all six dinosaur kinds');
  assert.equal(new Set(nextVisit.map(({ speciesIndex }) => speciesIndex)).size, 6, 'species do not repeat within one six-pick run');
  assert.equal(chooseLittleDinoRound(-1, 1, 3, 6, 214), null);
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
  assert.equal(recordLittleResult('askia', 'fuelup', false, 1, storage).level, 1, 'a hard round never removes an unlocked level');
  assert.equal(getLittleLevel('amari', 'fuelup', true, storage), 2, 'older child starts at level 3');
  store.set('amari_little_progress', JSON.stringify({ dinojigsaw: { level: 4, plays: 7, best: 3 } }));
  assert.equal(getLittleLevel('amari', 'dinojigsaw', true, storage), 4, 'existing Amari jigsaw progress remains at the same five-level index');
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
  assert.deepEqual(parentRoute({ name: 'game', id: 'math' }), { name: 'world', id: 'maths' });
  assert.deepEqual(parentRoute({ name: 'home' }), { name: 'welcome' });
  assert.equal(parentRoute({ name: 'welcome' }), null);
});

test('older games have distinct levels with saved child-specific progress', async () => {
  const { GAME_SESSIONS, sessionStars, sessionTarget } = await import('../src/data/gameSessions.js');
  const { SESSION_LEVELS, ASKIA_PATTERN_INDEXES, levelsForSession, getGameLevel, saveGameLevel } = await import('../src/data/sessionLevels.js');
  const { LEARNING_WORLDS } = await import('../src/data/learningWorlds.js');
  const allGames = new Set(LEARNING_WORLDS.flatMap((world) => world.gameIds));
  Object.entries(GAME_SESSIONS).forEach(([id, rule]) => {
    assert.ok(allGames.has(id), id);
    assert.ok(rule.target >= 1 && rule.how, id);
    assert.ok(sessionTarget(rule, true) <= rule.target, id);
    assert.ok(levelsForSession(id, false).length >= 2, `${id} needs more than one level`);
  });
  ['solar', 'astronaut', 'worldmap', 'storybooks', 'chess', 'memory', 'puzzle'].forEach((id) => assert.equal(GAME_SESSIONS[id], undefined, id));
  assert.deepEqual(levelsForSession('timeteller', false).map((level) => level.name), ['O’clock', 'Half past', 'Quarter hours']);
  assert.deepEqual(levelsForSession('counting', true).map((level) => level.countMax), [3, 5, 7]);
  assert.equal(new Set(ASKIA_PATTERN_INDEXES.flat()).size, ASKIA_PATTERN_INDEXES.flat().length, 'Askia patterns change between levels');
  Object.entries(SESSION_LEVELS).forEach(([id, levels]) => {
    assert.equal(new Set(levels.map((level) => level.name)).size, levels.length, `${id} level names must differ`);
    if (levels.every((level) => level.band)) {
      const bands = levels.map((level) => level.band);
      assert.ok(bands.every((band, index) => index === 0 || ['starter', 'growing', 'challenge'].indexOf(band) >= ['starter', 'growing', 'challenge'].indexOf(bands[index - 1])), `${id} difficulty bands must not regress`);
      if (!['letters', 'words'].includes(id)) assert.equal(new Set(bands).size, levels.length, `${id} levels must change question band`);
    }
  });
  const { spellingLevelWords } = await import('../src/data/spellingStudio.js');
  const { DEFAULT_TAUGHT_GRAPHEMES } = await import('../src/data/literacy.js');
  for (const [level, length] of [[3, 4], [4, 5], [5, 6]]) {
    const pool = spellingLevelWords(level, new Set(DEFAULT_TAUGHT_GRAPHEMES));
    assert.ok(pool.length >= SESSION_LEVELS.words[level].target);
    assert.ok(pool.every((word) => word.word.length >= length), 'later spelling stages increase actual word length');
  }
  assert.equal(levelsForSession('timeteller', true).length, 0, 'Askia has no clock game');
  const data = new Map();
  const storage = { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  saveGameLevel('amari', 'timeteller', 1, 1, storage);
  assert.deepEqual(getGameLevel('amari', 'timeteller', 3, storage), { current: 1, unlocked: 1 });
  assert.deepEqual(getGameLevel('askia', 'timeteller', 3, storage), { current: 0, unlocked: 0 });
  assert.equal(sessionStars(8, 8), 3);
  assert.equal(sessionStars(5, 8), 2);
  assert.equal(sessionStars(2, 8), 1);
});
