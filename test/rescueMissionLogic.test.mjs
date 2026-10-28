import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bindRescuePauseCancellation, buildFireMissionTargets, buildLadderMissionTargets, exactRescueSegments,
} from '../src/components/little/games/rescueMissionLogic.js';
import { pairRoundAttribution } from '../src/components/little/games/pairAttemptAttribution.js';
import { LITTLE_LEVELS, LITTLE_LINES, RESCUE_ANIMALS, rescueDone, rescueFloorPrompt, rescuePrompt } from '../src/data/littleGames.js';
import { getOfflineVoiceClip } from '../src/data/offlineVoice.js';

test('Fire Rescue target plans are stable, count-correct and distinct across equal-count rounds', () => {
  const spots = Array.from({ length: 6 }, (_, id) => ({ id }));
  const counts = [1, 1, 2, 2, 3, 3, 4, 4, 5, 6];
  const first = buildFireMissionTargets(spots, counts, 4);
  assert.deepEqual(buildFireMissionTargets(spots, counts, 4), first);
  assert.deepEqual(first.map((round) => round.length), counts);
  first.forEach((round) => assert.equal(new Set(round.map((spot) => spot.id)).size, round.length));
  for (let round = 1; round < counts.length; round += 1) {
    if (counts[round] === counts[round - 1] && counts[round] < spots.length) {
      assert.notDeepEqual(first[round].map((spot) => spot.id).sort(), first[round - 1].map((spot) => spot.id).sort());
    }
  }
  const rotated = buildFireMissionTargets(spots, counts, 5);
  assert.notDeepEqual(rotated[0].map((spot) => spot.id), first[0].map((spot) => spot.id));
  const all = new Set(Array.from({ length: spots.length }, (_, ordinal) => buildFireMissionTargets(spots, [1], ordinal)[0][0].id));
  assert.equal(all.size, spots.length);
});

test('Ladder Rescue plans cover floors and animals, freeze targets per round and rotate on replays', () => {
  const animals = ['kitten', 'puppy', 'bunny', 'chick', 'panda'].map((id) => ({ id }));
  const first = buildLadderMissionTargets(animals, 3, 5, 8);
  assert.deepEqual(buildLadderMissionTargets(animals, 3, 5, 8), first);
  assert.deepEqual(first.slice(0, 3).map((round) => round.targetFloor).sort(), [1, 2, 3]);
  assert.deepEqual(first.map((round) => round.animals[round.targetFloor - 1].id), ['puppy', 'bunny', 'chick', 'panda', 'kitten']);
  first.forEach((round) => assert.equal(new Set(round.animals.map((animal) => animal.id)).size, round.animals.length));
  const replay = buildLadderMissionTargets(animals, 3, 5, 9);
  assert.notDeepEqual(
    replay.map((round) => `${round.targetFloor}:${round.animals[round.targetFloor - 1].id}`),
    first.map((round) => `${round.targetFloor}:${round.animals[round.targetFloor - 1].id}`),
  );
  assert.equal(buildLadderMissionTargets(animals, 8, 2, 0)[0].animals.length, animals.length);
  assert.deepEqual(buildLadderMissionTargets(animals, 3, -1, 0), []);
  const animalFloorPairs = new Set();
  for (let ordinal = 0; ordinal < animals.length; ordinal += 1) {
    for (const mission of buildLadderMissionTargets(animals, animals.length, animals.length, ordinal)) {
      animalFloorPairs.add(`${mission.animals[mission.targetFloor - 1].id}:${mission.targetFloor}`);
    }
  }
  assert.equal(animalFloorPairs.size, animals.length * animals.length, 'every animal can be rescued from every floor over normal replays');
});

test('rescue mission plans cover authored level counts and all referenced narration is exact packaged audio', () => {
  const fireCounts = LITTLE_LEVELS.firerescue.map((level) => level.fires);
  const ladderRounds = LITTLE_LEVELS.ladder.map((level) => level.rounds);
  assert.deepEqual(fireCounts, [[1, 1, 2], [1, 2, 2, 3], [2, 2, 3, 3, 3], [3, 3, 4, 4, 5], [4, 4, 5, 5, 6]]);
  assert.deepEqual(ladderRounds, [3, 4, 5, 5, 5]);
  assert.deepEqual(pairRoundAttribution({ mistakes: 1 }), { firstAttempt: false, independent: false, hints: 0 });
  assert.deepEqual(pairRoundAttribution({ hintExposed: true }), { firstAttempt: true, independent: false, hints: 1 });
  const lines = [
    LITTLE_LINES.fireIntro, LITTLE_LINES.fireStart, LITTLE_LINES.fireDone,
    LITTLE_LINES.ladderIntro, LITTLE_LINES.ladderWrong,
    ...RESCUE_ANIMALS.flatMap((animal) => [rescuePrompt(animal), rescueDone(animal)]),
    ...Array.from({ length: 5 }, (_, index) => rescueFloorPrompt(index + 1)),
    ...Array.from({ length: 6 }, (_, index) => String(index + 1)),
  ];
  lines.filter(Boolean).forEach((line) => assert.ok(getOfflineVoiceClip(line, 'en-US'), `exact en-US clip exists for: ${line}`));
});

test('Fire pause binding stops held spray on actual blur, hidden visibility, freeze and resume events, then cleans up', () => {
  const documentTarget = new EventTarget();
  const windowTarget = new EventTarget();
  let visibilityState = 'visible';
  let hasFocus = true;
  Object.defineProperties(documentTarget, {
    visibilityState: { get: () => visibilityState },
    hasFocus: { value: () => hasFocus },
  });
  let held = true;
  let stopCalls = 0;
  const stop = () => { held = false; stopCalls += 1; };
  const cleanup = bindRescuePauseCancellation(documentTarget, windowTarget, stop);
  documentTarget.dispatchEvent(new Event('visibilitychange'));
  assert.equal(held, true, 'a visible, focused page does not cancel');
  visibilityState = 'hidden';
  documentTarget.dispatchEvent(new Event('visibilitychange'));
  assert.equal(held, false, 'a real hidden visibility state cancels');
  held = true;
  visibilityState = 'visible';
  hasFocus = false;
  documentTarget.dispatchEvent(new Event('visibilitychange'));
  assert.equal(held, false, 'a page that has lost focus cancels even if visibility reports visible');
  held = true;
  hasFocus = true;
  windowTarget.dispatchEvent(new Event('blur'));
  assert.equal(held, false, 'window blur cancels');
  held = true;
  documentTarget.dispatchEvent(new Event('freeze'));
  assert.equal(held, false, 'page freeze cancels');
  held = true;
  documentTarget.dispatchEvent(new Event('resume'));
  assert.equal(held, false, 'page resume cannot revive a held gesture');
  const callsBeforeCleanup = stopCalls;
  cleanup();
  held = true;
  documentTarget.dispatchEvent(new Event('freeze'));
  documentTarget.dispatchEvent(new Event('resume'));
  windowTarget.dispatchEvent(new Event('blur'));
  visibilityState = 'hidden';
  documentTarget.dispatchEvent(new Event('visibilitychange'));
  assert.equal(held, true, 'cleanup removes every listener');
  assert.equal(stopCalls, callsBeforeCleanup);
});

test('Fire narration accepts exact packaged single and chained clips, and fails closed for gaps or mismatches', () => {
  const hasClip = (line) => Boolean(getOfflineVoiceClip(line, 'en-US'));
  assert.deepEqual(exactRescueSegments(LITTLE_LINES.fireDone, undefined, hasClip), [LITTLE_LINES.fireDone]);
  for (let count = 1; count <= 6; count += 1) {
    const text = `${count} ${LITTLE_LINES.fireDone}`;
    assert.deepEqual(exactRescueSegments(text, { segments: [String(count), LITTLE_LINES.fireDone] }, hasClip), [String(count), LITTLE_LINES.fireDone]);
  }
  assert.equal(exactRescueSegments('', undefined, hasClip), null);
  assert.equal(exactRescueSegments('6 All the fires are out!', { segments: ['6', 'Different line'] }, hasClip), null);
  assert.equal(exactRescueSegments('6 All the fires are out!', { segments: ['6', 'All the fires are out!'] }, (line) => line === '6'), null);
  assert.equal(exactRescueSegments('6 All the fires are out!', { segments: ['', LITTLE_LINES.fireDone] }, hasClip), null);
  assert.equal(exactRescueSegments('6 All the fires are out!', { segments: [] }, hasClip), null);
});
