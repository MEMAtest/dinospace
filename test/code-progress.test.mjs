import test from 'node:test';
import assert from 'node:assert/strict';
import { codeAttemptAttribution, completeCodeMission, codeProgressStorageKey, isCodeMissionUnlocked, readCodeProgress, saveCodeDraft } from '../src/rehearsal/codeProgress.js';
import { CHAPTERS, MISSION_BY_ID, MISSION_ORDER, MISSIONS, simulateProgram } from '../src/rehearsal/rover.js';
import solutions from '../tmp/code-cadets-solutions.json' with { type: 'json' };

const memoryStore = () => { const map = new Map(); return { getItem: (key) => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), map }; };

test('three chapters contain four authored missions each while the legacy first three ids stay addressable', () => {
  assert.equal(MISSION_ORDER.length, 12);
  assert.equal(CHAPTERS.length, 3);
  assert.deepEqual(CHAPTERS.map(({ missionIds }) => missionIds.length), [4, 4, 4]);
  assert.deepEqual(MISSIONS.slice(0, 3).map(({ id }) => id), ['first-route', 'debug-turn', 'repeat-rescue']);
  assert.equal(MISSION_BY_ID['sequence-independent'].guidedBlocks, undefined);
  assert.ok(MISSION_BY_ID['debug-turn'].initial.length > 0);
  assert.ok(MISSION_BY_ID['repeat-rescue'].guidedBlocks.includes('repeat3'));
});

test('every authored QA program solves through the actual interpreter and constraints', () => {
  assert.deepEqual(Object.keys(solutions).sort(), [...MISSION_ORDER].sort());
  for (const id of MISSION_ORDER) {
    const result = simulateProgram(id, solutions[id]);
    assert.equal(result.complete, true, `${id}: ${result.message}`);
  }
});

test('attribution distinguishes manual use of a guided-capable mission from actual help', () => {
  assert.deepEqual(codeAttemptAttribution({ guidedUsed: false, helpUsed: false }), { assisted: false, guidedUsed: false, helpUsed: false, mode: 'independent' });
  assert.deepEqual(codeAttemptAttribution({ guidedUsed: true, helpUsed: false }), { assisted: true, guidedUsed: true, helpUsed: false, mode: 'guided' });
  assert.deepEqual(codeAttemptAttribution({ guidedUsed: false, helpUsed: true }), { assisted: true, guidedUsed: false, helpUsed: true, mode: 'assisted' });
  assert.deepEqual(codeAttemptAttribution({ guidedUsed: true, helpUsed: true }), { assisted: true, guidedUsed: true, helpUsed: true, mode: 'guided' });
});

test('drafts recover per child and malformed or locked writes are rejected', () => {
  const storage = memoryStore();
  assert.equal(saveCodeDraft('amari', 'first-route', ['forward', 'forward'], 'My route', true, storage).persisted, true);
  assert.deepEqual(readCodeProgress('amari', storage).missionDrafts['first-route'], { program: ['forward', 'forward'], title: 'My route', helpUsed: true, guidedUsed: false });
  assert.equal(saveCodeDraft('amari', 'first-route', ['forward', 'forward'], 'My route', true, storage, { guidedUsed: true }).persisted, true);
  assert.equal(readCodeProgress('amari', storage).missionDrafts['first-route'].guidedUsed, true);
  // Older callers omit guidedUsed; their updates preserve the recorded attribution.
  assert.equal(saveCodeDraft('amari', 'first-route', ['forward'], 'My route', true, storage).persisted, true);
  assert.equal(readCodeProgress('amari', storage).missionDrafts['first-route'].guidedUsed, true);
  assert.equal(readCodeProgress('guest', storage).missionDrafts['first-route'], undefined);
  assert.equal(saveCodeDraft('amari', 'first-route', ['eval'], 'bad', false, storage).persisted, false);
  assert.equal(saveCodeDraft('amari', 'first-route', Array(25).fill('forward'), 'too long', false, storage).persisted, false);
  assert.equal(saveCodeDraft('amari', 'debug-turn', ['forward'], 'locked', false, storage).persisted, false);
  assert.equal(saveCodeDraft('amari', 'debug-turn', ['forward'], 'legacy open', false, storage, { allowLocked: true }).persisted, true);
  assert.ok([...storage.map.keys()].every((key) => key.startsWith('amari_code_cadets_progress_v1:')));
  assert.match(codeProgressStorageKey('amari'), /^amari_code_cadets_progress_v1:/);
});

test('completion boundary rejects wrong programs and locked missions without unlocking or awarding', () => {
  const storage = memoryStore();
  const wrong = completeCodeMission('child-a', 'first-route', ['forward'], 'wrong', false, storage);
  assert.equal(wrong.valid, false);
  assert.equal(wrong.persisted, false);
  assert.deepEqual(readCodeProgress('child-a', storage).completedMissionIds, []);
  const locked = completeCodeMission('child-a', 'debug-turn', solutions['debug-turn'], 'locked', false, storage);
  assert.equal(locked.valid, false);
  assert.deepEqual(readCodeProgress('child-a', storage).completedMissionIds, []);
});

test('valid completion unlocks in order, accepts another goal-reaching route, and awards chapters once', () => {
  const storage = memoryStore();
  const first = completeCodeMission('child-a', 'first-route', solutions['first-route'], 'first', false, storage);
  assert.equal(first.persisted, true); assert.equal(first.newlyCompleted, true); assert.equal(first.newlyCompletedChapterId, null);
  assert.equal(first.unlockedMissionIndex, 1); assert.equal(isCodeMissionUnlocked(first, 'sequence-detour'), true); assert.equal(isCodeMissionUnlocked(first, 'debug-turn'), false);
  assert.equal(completeCodeMission('child-a', 'first-route', solutions['first-route'], 'first', false, storage).newlyCompleted, false);
  assert.equal(completeCodeMission('child-a', 'first-route', solutions['first-route'], 'guided route', false, storage, { guidedUsed: true }).persisted, true);
  assert.equal(readCodeProgress('child-a', storage).missionDrafts['first-route'].guidedUsed, true);

  // An alternate route reaches the same flag and must be accepted by the persistence boundary.
  // Travel around the south side of the wall instead of the authored north route.
  const alternate = ['right', 'forward', 'left', 'forward', 'forward', 'forward', 'forward', 'left', 'forward'];
  const alternateResult = simulateProgram('sequence-detour', alternate);
  assert.equal(alternateResult.complete, true, alternateResult.message);

  for (const id of CHAPTERS[0].missionIds.slice(1)) {
    if (id === 'sequence-detour') {
      const result = completeCodeMission('child-a', id, alternate, 'alternate route', false, storage);
      assert.equal(result.valid, true);
      assert.equal(result.persisted, true);
      continue;
    }
    const result = completeCodeMission('child-a', id, solutions[id], 'authored', false, storage);
    assert.equal(result.persisted, true, `${id}: ${result.message}`);
  }
  const completeChapter = readCodeProgress('child-a', storage);
  assert.deepEqual(completeChapter.completedChapterIds, ['sequence']);
  assert.equal(completeCodeMission('child-a', 'sequence-independent', solutions['sequence-independent'], 'replay', false, storage).newlyCompletedChapterId, null);
  assert.deepEqual(readCodeProgress('child-b', storage).completedMissionIds, []);
});

test('failed durable writes award nothing and preserve the previous unlocked state', () => {
  const broken = { getItem: () => null, setItem() { throw new Error('quota'); } };
  const failed = completeCodeMission('other', 'first-route', solutions['first-route'], 'no reward', false, broken);
  assert.equal(failed.valid, true);
  assert.equal(failed.persisted, false);
  assert.equal(failed.newlyCompleted, false);
  assert.deepEqual(failed.completedMissionIds, []);
});
