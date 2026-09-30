import assert from 'node:assert/strict';
import test from 'node:test';
import { createCurriculumQueue } from '../src/data/curriculumQueue.js';
import { getCurriculumModule } from '../src/data/curriculumModules.js';

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
