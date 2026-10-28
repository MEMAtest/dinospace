import test from 'node:test';
import assert from 'node:assert/strict';
import { expandProgram } from '../src/rehearsal/rover.js';
import { nextGuidedMissionInstruction, nextRepeatMissionInstruction, findForwardTriple, replaceForwardTriple, repeatMissionStage } from '../src/rehearsal/codeCadetsFlow.js';

test('guided missions add only the next authored block and independent missions never reveal one', () => {
  const guide=['forward','right','collect'];
  assert.equal(nextGuidedMissionInstruction([],guide),'forward');
  assert.equal(nextGuidedMissionInstruction(['forward'],guide),'right');
  assert.equal(nextGuidedMissionInstruction(['forward','right','collect'],guide),null);
  assert.equal(nextGuidedMissionInstruction(['right'],guide),null);
  assert.equal(nextGuidedMissionInstruction([],undefined),null);
});

test('repeat mission guidance builds the full route in order', () => {
  const program = [];
  const expected = ['forward', 'forward', 'forward', 'right', 'forward', 'forward', 'forward', 'collect'];
  while (nextRepeatMissionInstruction(program)) program.push(nextRepeatMissionInstruction(program));
  assert.deepEqual(program, expected);
  assert.equal(nextRepeatMissionInstruction(program), null);
});

test('worked Repeat blocks preserve the route and produce a four-block program', () => {
  const route = ['forward', 'forward', 'forward', 'right', 'forward', 'forward', 'forward', 'collect'];
  const once = replaceForwardTriple(route);
  const twice = replaceForwardTriple(once);

  assert.equal(findForwardTriple(route), 0);
  assert.equal(findForwardTriple(once), 2);
  assert.deepEqual(twice, ['repeat3', 'right', 'repeat3', 'collect']);
  assert.deepEqual(
    expandProgram(twice).map(instruction => instruction.op),
    expandProgram(route).map(instruction => instruction.op),
  );
  assert.equal(replaceForwardTriple(twice), null);
});

test('repeat mission advances from building to both replacements and then Run', () => {
  const route = ['forward', 'forward', 'forward', 'right', 'forward', 'forward', 'forward', 'collect'];
  assert.deepEqual(repeatMissionStage(route, false), { stage: 'build', next: null });

  const once = replaceForwardTriple(route);
  assert.equal(once.length, 6);
  assert.deepEqual(repeatMissionStage(once, true), { stage: 'replace', next: null });

  const twice = replaceForwardTriple(once);
  assert.deepEqual(twice, ['repeat3', 'right', 'repeat3', 'collect']);
  assert.deepEqual(repeatMissionStage(twice, true), { stage: 'run', next: null });
  // Reopening this saved four-block program must land on Run as well.
  assert.deepEqual(repeatMissionStage([...twice], true), { stage: 'run', next: null });
});
