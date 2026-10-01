import assert from 'node:assert/strict';
import test from 'node:test';
import { createCurriculumQueue } from '../src/data/curriculumQueue.js';
import { CURRICULUM_MODULES, getCurriculumModule } from '../src/data/curriculumModules.js';

test('curriculum queues are finite, seeded, unique, and begin with a teaching round', () => {
  const rounds = getCurriculumModule('time-detectives').rounds.starter;
  const queue = createCurriculumQueue(rounds, 'time-detectives', 42, [], true);
  assert.deepEqual(queue, createCurriculumQueue(rounds, 'time-detectives', 42, [], true));
  assert.equal(queue.length, rounds.length);
  assert.equal(new Set(queue).size, queue.length);
  assert.equal(rounds[queue[0]].id, 'history-communication');
});

test('curriculum queue avoids recent rounds when enough unseen rounds can fill it', () => {
  const rounds = getCurriculumModule('continents').rounds.challenge;
  const recent = rounds.slice(0, 5).map(({ id }) => id);
  const queue = createCurriculumQueue(rounds, 'continents', 17, recent);
  assert.equal(queue.length, 5);
  assert.ok(queue.every((index) => !recent.includes(rounds[index].id)));
});

test('short queues finish unseen questions before revisiting old material', () => {
  const rounds = getCurriculumModule('continents').rounds.starter;
  const recent = rounds.slice(0, 5).map(({ id }) => id);
  const queue = createCurriculumQueue(rounds, 'continents', 17, recent, true);
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
