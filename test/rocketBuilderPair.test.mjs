import test from 'node:test';
import assert from 'node:assert/strict';
import { LITTLE_LINES, ROCKET_COLOURS, rocketColourPrompt } from '../src/data/littleGames.js';
import { getOfflineVoiceClip } from '../src/data/offlineVoice.js';
import { pairRoundAttribution } from '../src/components/little/games/pairAttemptAttribution.js';
import {
  ROCKET_DROP_ZONES, ROCKET_DROP_TOLERANCE, expandedRocketDropZone,
  rocketPartAcceptsPoint, rocketPartCenter, rocketPartPlacementFeedback, rocketTargetMatchesPart, rocketZonesOverlap, speakPackagedOnly,
} from '../src/components/little/games/rocketBuilderLogic.js';

test('keyboard placement coordinates target the center of each authored rocket part drop zone', () => {
  const rect = { left: 100, top: 50, width: 200, height: 300 };
  assert.deepEqual(rocketPartCenter([50, 20, 100, 60], rect), { x: 200, y: 100 });
  assert.equal(rocketPartCenter([0, 0, 1, 1], { left: 0, top: 0, width: 0, height: 10 }), null);
  assert.equal(rocketPartCenter(null, rect), null);

  for (const [partId, zones] of Object.entries(ROCKET_DROP_ZONES)) {
    for (const zone of zones) {
      const center = rocketPartCenter(zone, rect);
      assert.ok(rocketPartAcceptsPoint(partId, center, rect), `${partId} keyboard center must land in one of its own pointer zones`);
    }
  }
});

test('all five visible authored part centers accept pointer placement, including body and composite fin centers', () => {
  const rect = { left: 0, top: 0, width: 200, height: 300 };
  // Centers of the five authored ROCKET_PARTS boxes in VehicleArt.jsx.
  const centers = { body: { x: 100, y: 152 }, nose: { x: 100, y: 54 }, window: { x: 100, y: 136 }, fins: { x: 100, y: 202 }, flame: { x: 100, y: 256 } };
  for (const [partId, center] of Object.entries(centers)) {
    assert.ok(rocketPartAcceptsPoint(partId, center, rect), `${partId} visible center should be a valid pointer target`);
  }
  assert.equal(rocketPartAcceptsPoint('nose', centers.body, rect), false, 'nose on body center remains a wrong placement');
  assert.equal(rocketPartAcceptsPoint('nose', rocketPartCenter(ROCKET_DROP_ZONES.fins[0], rect), rect), false, 'nose on fin remains a wrong placement');
  assert.equal(rocketPartAcceptsPoint('nose', centers.flame, rect), false, 'nose on flame remains a wrong placement');
});

test('named keyboard outline controls reject a target that does not match the selected part', () => {
  assert.equal(rocketTargetMatchesPart('body', 'body'), true);
  assert.equal(rocketTargetMatchesPart('fins', 'fins'), true);
  assert.equal(rocketTargetMatchesPart('nose', 'body'), false);
});

test('expanded Rocket Builder pointer targets do not overlap', () => {
  const zones = Object.entries(ROCKET_DROP_ZONES).flatMap(([partId, entries]) => entries.map((zone) => ({ partId, zone: expandedRocketDropZone(zone) })));
  for (let first = 0; first < zones.length; first += 1) {
    for (let second = first + 1; second < zones.length; second += 1) {
      assert.equal(rocketZonesOverlap(zones[first].zone, zones[second].zone), false, `${zones[first].partId} must not overlap ${zones[second].partId} with ${ROCKET_DROP_TOLERANCE}-unit tolerance`);
    }
  }
});

test('a nose drop in the body or window target is rejected', () => {
  const rect = { left: 0, top: 0, width: 200, height: 300 };
  for (const wrongPart of ['body', 'window']) {
    const wrongTarget = rocketPartCenter(ROCKET_DROP_ZONES[wrongPart][0], rect);
    assert.equal(rocketPartAcceptsPoint('nose', wrongTarget, rect), false, `nose must not be accepted in the ${wrongPart} target`);
  }
});

test('wrong placement feedback explains the matching rocket location and remains text', () => {
  assert.equal(rocketPartPlacementFeedback('nose', 'Nose cone'), 'Nose cone is not in its outline. The nose cone belongs at the top.');
  assert.equal(rocketPartPlacementFeedback('flame', 'Engine flame'), 'Engine flame is not in its outline. The engine flame belongs underneath the rocket.');
});

test('Rocket Builder speech uses only an exact packaged clip and disables premium generation', () => {
  const requested = [];
  assert.equal(speakPackagedOnly((...args) => requested.push(args), 'Build the red rocket!', (line) => Boolean(getOfflineVoiceClip(line, 'en-US'))), true);
  assert.deepEqual(requested, [['Build the red rocket!', { premium: false, segments: ['Build the red rocket!'] }]]);
  assert.equal(speakPackagedOnly((...args) => requested.push(args), 'No such authored line', () => false), false);
  assert.equal(requested.length, 1);
});

test('all current Rocket Builder narration lines are present in the packaged voice inventory', () => {
  const lines = [...new Set([
    LITTLE_LINES.rocketIntro,
    ...LITTLE_LINES.countdown,
    ...ROCKET_COLOURS.map(rocketColourPrompt),
    LITTLE_LINES.finish,
    LITTLE_LINES.levelUp,
    LITTLE_LINES.newSticker,
  ])];
  for (const line of lines) assert.ok(getOfflineVoiceClip(line, 'en-US'), line);
});

test('Pair 5 attribution separates wrong attempts from visible hint exposure', () => {
  assert.deepEqual(pairRoundAttribution(), { firstAttempt: true, independent: true, hints: 0 });
  assert.deepEqual(pairRoundAttribution({ hintExposed: true }), { firstAttempt: true, independent: false, hints: 1 });
  assert.deepEqual(pairRoundAttribution({ mistakes: 1 }), { firstAttempt: false, independent: false, hints: 0 });
  assert.deepEqual(pairRoundAttribution({ mistakes: 2, hintExposed: true }), { firstAttempt: false, independent: false, hints: 1 });
});
