import test from 'node:test';
import assert from 'node:assert/strict';
import { MEMORY_LEVELS } from '../src/data/index.js';
import { MEMORY_CARD_LABELS, memoryCardLabel } from '../src/data/memoryMatchContent.js';

test('the Memory Match redesign preserves all canonical levels and pair counts', () => {
  assert.deepEqual(MEMORY_LEVELS.map(({ id }) => id), [
    'forest', 'ocean', 'space', 'party', 'dinos', 'vehicles', 'food', 'astronaut', 'garden', 'cosmic-challenge',
  ]);
  assert.deepEqual(MEMORY_LEVELS.map(({ emojis }) => emojis.length), [4, 8, 10, 12, 13, 14, 15, 16, 17, 18]);
  for (const level of MEMORY_LEVELS) {
    assert.equal(new Set(level.emojis).size, level.emojis.length, `${level.name} has duplicate pictures`);
    for (const emoji of level.emojis) {
      assert.ok(MEMORY_CARD_LABELS[emoji], `${level.name} has no picture label for ${emoji}`);
      assert.notEqual(memoryCardLabel(emoji, level.id), 'unlabelled card');
    }
  }
});

test('late Memory Match boards stay within their named picture themes', () => {
  const byId = Object.fromEntries(MEMORY_LEVELS.map((level) => [level.id, level]));
  assert.equal(byId.dinos.name, 'Dinosaur Discovery');
  assert.ok(byId.dinos.emojis.includes('🦷') && byId.dinos.emojis.includes('⛏️'));
  assert.ok(!byId.dinos.emojis.some((emoji) => ['🚀', '🛸', '🪐', '☄️'].includes(emoji)));

  assert.equal(byId.vehicles.name, 'All Kinds of Vehicles');
  assert.ok(byId.vehicles.emojis.every((emoji) => /car|train|aeroplane|helicopter|fire engine|speedboat|scooter|bicycle|bus|tractor|rocket|flying saucer/.test(MEMORY_CARD_LABELS[emoji])));

  assert.equal(byId.astronaut.name, 'Astronaut Mission');
  assert.equal(byId.astronaut.emojis.filter((emoji) => ['👨‍🚀', '🧑‍🚀'].includes(emoji)).length, 1);
  assert.ok(!byId.astronaut.emojis.some((emoji) => ['🐬', '🐳', '🦈'].includes(emoji)));
  assert.equal(memoryCardLabel('🪨', 'astronaut'), 'moon rock');
  assert.equal(memoryCardLabel('🪨', 'dinos'), 'fossil dig rock');

  assert.equal(byId.garden.name, 'Garden & Pond Life');
  assert.ok(byId.garden.emojis.includes('🪷') && byId.garden.emojis.includes('🐝') && byId.garden.emojis.includes('🐸'));
  assert.ok(!byId.garden.emojis.some((emoji) => ['🐵', '🐶', '🦊', '🐳', '🐬', '🦈', '🦕', '🦖', '🥚'].includes(emoji)));

  assert.equal(byId['cosmic-challenge'].name, 'Galaxy Challenge');
  assert.ok(!byId['cosmic-challenge'].emojis.some((emoji) => ['🐬', '🐳', '🦈', '🎈', '🎉'].includes(emoji)));
});

test('visually similar vehicles and moon objects have distinct teaching labels', () => {
  assert.notEqual(MEMORY_CARD_LABELS['🚂'], MEMORY_CARD_LABELS['🚆']);
  assert.notEqual(MEMORY_CARD_LABELS['🌙'], MEMORY_CARD_LABELS['🌑']);
  assert.notEqual(MEMORY_CARD_LABELS['🌑'], MEMORY_CARD_LABELS['🌕']);
});
