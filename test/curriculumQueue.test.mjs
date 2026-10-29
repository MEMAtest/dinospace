import assert from 'node:assert/strict';
import test from 'node:test';
import { createCurriculumQueue, createCurriculumReplayQueue } from '../src/data/curriculumQueue.js';
import { CURRICULUM_MODULES, getCurriculumModule } from '../src/data/curriculumModules.js';

test('history queues are deterministic, unique and keep authored learning order', () => {
  const rounds = getCurriculumModule('time-detectives').rounds.starter;
  const queue = createCurriculumQueue(rounds, 'time-detectives', 42);
  assert.deepEqual(queue, createCurriculumQueue(rounds, 'time-detectives', 42));
  assert.deepEqual(queue, rounds.map((_, index) => index));
  assert.equal(new Set(queue).size, queue.length);
});

test('geography queues vary their first question across session seeds', () => {
  const rounds = getCurriculumModule('continents').rounds.starter;
  const firstRoundIds = new Set(Array.from({ length: 20 }, (_, seed) => rounds[createCurriculumQueue(rounds, 'continents', seed + 1)[0]].id));
  assert.ok(firstRoundIds.size > 1, 'the run must not start with one hard-coded continent prompt');
  assert.ok(![...firstRoundIds].every((id) => id === 'continent-africa'));
});

test('nature queues vary their first question across session seeds', () => {
  const rounds = getCurriculumModule('nature').rounds.starter;
  const firstRoundIds = new Set(Array.from({ length: 20 }, (_, seed) => rounds[createCurriculumQueue(rounds, 'nature', seed + 1)[0]].id));
  assert.ok(firstRoundIds.size > 1, 'nature should not always open on one preferred specimen');
});

test('Nature Lab queues include an unseen investigation across seeds when one is eligible', () => {
  const rounds = getCurriculumModule('nature-lab').rounds.challenge;
  const investigations = rounds.filter(({ type }) => type === 'investigation');
  const recent = rounds.filter((round, index) => round.type !== 'investigation' && index % 4 === 0).map(({ id }) => id);
  const selectedInvestigations = new Set();
  for (let seed = 1; seed <= 40; seed += 1) {
    const queue = createCurriculumQueue(rounds, 'nature-lab', seed, recent);
    assert.equal(queue.length, 5);
    assert.equal(new Set(queue).size, 5);
    assert.ok(queue.every((index) => !recent.includes(rounds[index].id)));
    const chosen = queue.map((index) => rounds[index]).find(({ type }) => type === 'investigation');
    assert.ok(chosen, `seed ${seed} should include an unseen investigation`);
    selectedInvestigations.add(chosen.id);
  }
  assert.ok(selectedInvestigations.size > 1, 'the investigation choice should vary by seed');
  assert.equal(investigations.length, 3);
});

test('Nature Lab does not force a recent Growing investigation into a new run', () => {
  const rounds = getCurriculumModule('nature-lab').rounds.growing;
  const investigation = rounds.find(({ type }) => type === 'investigation');
  assert.ok(investigation);
  const recent = [investigation.id];
  for (let seed = 1; seed <= 24; seed += 1) {
    const queue = createCurriculumQueue(rounds, 'nature-lab', seed, recent);
    assert.equal(queue.length, 5);
    assert.equal(new Set(queue).size, 5);
    assert.ok(queue.every((index) => rounds[index].id !== investigation.id), `seed ${seed} must not force a recent investigation`);
  }
});

test('Nature Lab replay queues preserve eligible investigation variety and uniqueness', () => {
  const rounds = getCurriculumModule('nature-lab').rounds.challenge;
  const first = createCurriculumQueue(rounds, 'nature-lab', 18);
  const recent = first.map((index) => rounds[index].id);
  const eligibleInvestigations = rounds.filter(({ type, id }) => type === 'investigation' && !recent.includes(id));
  assert.ok(eligibleInvestigations.length);
  for (let seed = 1; seed <= 24; seed += 1) {
    const queue = createCurriculumReplayQueue(rounds, 'nature-lab', seed, recent, first);
    assert.equal(queue.length, 5);
    assert.equal(new Set(queue).size, 5);
    assert.ok(queue.every((index) => !recent.includes(rounds[index].id)));
    assert.notDeepEqual(queue, first);
    assert.ok(queue.some((index) => rounds[index].type === 'investigation'));
  }
});

test('curriculum queues avoid recent rounds when enough unseen rounds can fill it', () => {
  const rounds = getCurriculumModule('continents').rounds.challenge;
  const recent = rounds.slice(0, 5).map(({ id }) => id);
  const queue = createCurriculumQueue(rounds, 'continents', 17, recent);
  assert.equal(queue.length, 5);
  assert.ok(queue.every((index) => !recent.includes(rounds[index].id)));
});

test('short queues finish unseen questions before revisiting old material', () => {
  const rounds = getCurriculumModule('continents').rounds.starter;
  const recent = rounds.slice(0, 5).map(({ id }) => id);
  const queue = createCurriculumQueue(rounds, 'continents', 17, recent);
  assert.equal(queue.length, 5);
  assert.equal(new Set(queue).size, 5);
  assert.ok(queue.slice(0, 4).every((index) => !recent.includes(rounds[index].id)));
  assert.equal(rounds[queue[4]].id, recent[0]);
});

test('each Curriculum band has enough distinct prompts for a five-question discovery run', () => {
  for (const module of CURRICULUM_MODULES) {
    for (const [band, rounds] of Object.entries(module.rounds)) {
      assert.ok(rounds.length >= 5, `${module.id}/${band} needs at least five prompts`);
      assert.equal(createCurriculumQueue(rounds, module.id, 42).length, 5);
    }
  }
});

test('completed geography rounds replay in varied seeded orders without an immediate repeat', () => {
  const rounds = getCurriculumModule('continents').rounds.starter;
  const recent = rounds.map(({ id }) => id);
  const orders = new Set();
  for (let seed = 1; seed <= 20; seed += 1) {
    const order = createCurriculumQueue(rounds, 'continents', seed, recent);
    assert.deepEqual(order, createCurriculumQueue(rounds, 'continents', seed, recent));
    assert.equal(new Set(order).size, 5);
    assert.notEqual(rounds[order[0]].id, recent.at(-1));
    orders.add(order.join(','));
  }
  assert.ok(orders.size > 5, 'geography replay must vary by seed');
});

test('restarting geography avoids replaying the exact completed run, even on a seed collision', () => {
  const rounds = getCurriculumModule('continents').rounds.starter;
  const completedOrder = createCurriculumQueue(rounds, 'continents', 17);
  const restartedOrder = createCurriculumReplayQueue(rounds, 'continents', 17, rounds.map(({ id }) => id), completedOrder);
  assert.notDeepEqual(restartedOrder, completedOrder);
  assert.deepEqual([...restartedOrder].sort((left, right) => left - right), [...completedOrder].sort((left, right) => left - right));
});

test('history queues stay in authored order when unseen rounds are mixed with revisits', () => {
  const rounds = getCurriculumModule('time-detectives').rounds.growing;
  const recent = rounds.slice(0, 5).map(({ id }) => id);
  const queue = createCurriculumQueue(rounds, 'time-detectives', 19, recent);
  assert.equal(queue.length, 5);
  assert.deepEqual(queue, [...queue].sort((left, right) => left - right));
  assert.ok(queue.some((index) => !recent.includes(rounds[index].id)));
});

 test('explicit history replays vary question order without changing chronology answers', () => {
 const rounds = getCurriculumModule('time-detectives').rounds.starter;
 const first = createCurriculumQueue(rounds, 'time-detectives', 10);
 const variants = new Set();
 const before = JSON.stringify(rounds);
 for (let seed = 1; seed <= 12; seed++) {
 const next = createCurriculumReplayQueue(rounds, 'time-detectives', seed, rounds.map(r => r.id), first);
 assert.equal(next.length, first.length);
 assert.notDeepEqual(next, first);
 assert.equal(new Set(next).size, next.length);
 variants.add(next.join(','));
 }
 assert.ok(variants.size > 1);
 assert.equal(JSON.stringify(rounds), before);
 });
