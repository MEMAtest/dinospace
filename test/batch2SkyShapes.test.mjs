import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SKY_SHAPE_EPISODES, SKY_SHAPE_MISSIONS, skyAccuracyStars, skyLearningAttemptDetail, skyMissionQueueForEpisode, skyTraceProgressPercent, tracePointsForOutline,
} from '../src/data/skyShapes.js';
import { GAME_DIAGNOSTICS_KEY, recordGameDiagnostic } from '../src/data/gameDiagnostics.js';
import {
  getSkyShapesProgress, recordSkyEpisodeReward, recordSkyMissionCompletion, rememberSkyMissionQueue,
} from '../src/data/skyShapesProgress.js';

const memoryStorage = () => {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
};

test('Sky Shapes defines twelve useful missions across three named tracing skies', () => {
  assert.equal(SKY_SHAPE_EPISODES.length, 3);
  assert.deepEqual(SKY_SHAPE_EPISODES.map((episode) => episode.missions.length), [4, 4, 4]);
  assert.equal(SKY_SHAPE_MISSIONS.length, 12);
  assert.deepEqual(SKY_SHAPE_EPISODES.map((episode) => episode.title), ['Cloud Meadow', 'Rainbow Ridge', 'Aurora Station']);
  assert.equal(SKY_SHAPE_MISSIONS.slice(0, 4).every((mission) => mission.paths.length === 1), true);
  assert.equal(SKY_SHAPE_MISSIONS.slice(8).every((mission) => mission.paths.length >= 3), true);
  assert.equal(new Set(SKY_SHAPE_MISSIONS.map((mission) => mission.id)).size, 12);
});

test('every tracing outline has a sampled path with the correct start dot and a meaningful end', () => {
  for (const mission of SKY_SHAPE_MISSIONS) {
    for (const outline of mission.paths) {
      const points = tracePointsForOutline(outline);
      assert.ok(points.length >= 8, `${mission.id}:${outline.id} should be traceable`);
      assert.deepEqual(points[0], outline.points[0]);
      assert.deepEqual(points.at(-1), outline.closed ? outline.points[0] : outline.points.at(-1));
      assert.ok(points.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= 1000 && y >= 0 && y <= 650));
    }
  }
});

test('Sky Shapes progress reaches 100 percent when the final route point is accepted', () => {
  const guidePaths = [Array.from({ length: 101 }, (_, index) => [index, 0])];
  assert.equal(skyTraceProgressPercent(guidePaths, 0, 100), 99);
  assert.equal(skyTraceProgressPercent(guidePaths, 0, 100, true), 100);
  assert.equal(skyTraceProgressPercent([], 0, 0, true), 0);
});

test('Sky Shapes queues are seed-stable, varied, and unique within each sky run', () => {
  for (let episodeIndex = 0; episodeIndex < 3; episodeIndex += 1) {
    const queueA = skyMissionQueueForEpisode(episodeIndex, 71234);
    const queueB = skyMissionQueueForEpisode(episodeIndex, 71234);
    assert.deepEqual(queueA.map((mission) => mission.id), queueB.map((mission) => mission.id));
    assert.equal(queueA.length, 4);
    assert.equal(new Set(queueA.map((mission) => mission.id)).size, 4);
    const queueC = skyMissionQueueForEpisode(episodeIndex, 71235);
    assert.notDeepEqual(queueA.map((mission) => mission.id), queueC.map((mission) => mission.id));
  }
  assert.equal(skyAccuracyStars(100), 3);
  assert.equal(skyAccuracyStars(90), 2);
  assert.equal(skyAccuracyStars(60), 1);
});

test('replaying a completed sky cannot repeat the exact previous four-mission order', () => {
  for (let episodeIndex = 0; episodeIndex < SKY_SHAPE_EPISODES.length; episodeIndex += 1) {
    const previous = skyMissionQueueForEpisode(episodeIndex, 71234).map((mission) => mission.id);
    for (const seed of [71234, 71235, 1, 0xabcdef01]) {
      const replay = skyMissionQueueForEpisode(episodeIndex, seed, previous).map((mission) => mission.id);
      assert.equal(replay.length, 4);
      assert.equal(new Set(replay).size, 4);
      assert.notDeepEqual(replay, previous, `episode ${episodeIndex} seed ${seed}`);
    }
  }
});

test('Sky Shapes learning-attempt diagnostics retain numeric run identity without mission copy', () => {
  const storage = memoryStorage();
  const detail = skyLearningAttemptDetail({
    level: 2, round: 3, seed: 82341, difficulty: 'challenge', missionId: 'sky-castle',
    accuracy: 96, firstAttempt: true, hints: 0,
  });
  assert.equal(recordGameDiagnostic('jet', 'learning_attempt', detail, storage), true);
  const [event] = JSON.parse(storage.getItem(GAME_DIAGNOSTICS_KEY));
  assert.deepEqual(event, {
    at: event.at, game: 'jet', event: 'learning_attempt', level: 2, round: 3, seed: 82341, difficulty: 'challenge', firstAttempt: true,
  });
});

test('Sky Shapes saves mission accuracy and episode rewards per child, unlocking only after all four missions', () => {
  const storage = memoryStorage();
  const episode = SKY_SHAPE_EPISODES[0];
  assert.equal(getSkyShapesProgress('amari', storage).unlockedEpisode, 0);
  for (const [index, mission] of episode.missions.entries()) {
    const result = recordSkyMissionCompletion('amari', mission.id, 90 + index, 2, storage);
    assert.equal(result.newlyCompletedMission, true);
    assert.equal(result.episodeComplete, index === episode.missions.length - 1);
  }
  const saved = getSkyShapesProgress('amari', storage);
  assert.equal(saved.unlockedEpisode, 1);
  assert.deepEqual(saved.completedEpisodeIds, [episode.id]);
  assert.equal(saved.bestAccuracy[episode.missions[2].id], 92);
  assert.equal(recordSkyEpisodeReward('amari', episode.id, 2, storage).improved, true);
  assert.equal(getSkyShapesProgress('askia', storage).unlockedEpisode, 0);
  assert.equal(recordSkyMissionCompletion('amari', 'unknown', 100, 3, storage), null);
});

test('Sky Shapes remembers only valid recent mission identifiers', () => {
  const storage = memoryStorage();
  const ids = SKY_SHAPE_EPISODES.flatMap((episode) => episode.missions.map((mission) => mission.id));
  rememberSkyMissionQueue('amari', [...ids, 'untrusted-id'], storage);
  const saved = getSkyShapesProgress('amari', storage);
  assert.deepEqual(saved.recentMissionIds, ids.slice(-8));
});
