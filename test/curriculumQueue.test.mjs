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

test('nature queues also vary their first investigation across session seeds', () => {
  const rounds = getCurriculumModule('nature').rounds.starter;
  const firstRoundIds = new Set(Array.from({ length: 20 }, (_, seed) => rounds[createCurriculumQueue(rounds, 'nature', seed + 1)[0]].id));
  assert.ok(firstRoundIds.size > 1, 'nature should not always open on one preferred specimen');
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
