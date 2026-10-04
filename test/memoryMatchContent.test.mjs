import test from 'node:test';
import assert from 'node:assert/strict';
import { MEMORY_LEVELS } from '../src/data/index.js';
import { MEMORY_CARD_ILLUSTRATIONS, MEMORY_CARD_CONTEXT_ILLUSTRATIONS, MEMORY_CARD_LABELS, MEMORY_STRATEGY_LINES, memoryCardIllustration, memoryCardLabel, memoryIllustrationAudit, memoryNarrationLines } from '../src/data/memoryMatchContent.js';
import { memoryStrategy } from '../src/data/batch7Progress.js';

test('the Memory Match redesign preserves all canonical levels and pair counts', () => {
  assert.deepEqual(MEMORY_LEVELS.map(({ id }) => id), [
    'forest', 'ocean', 'space', 'party', 'dinos', 'vehicles', 'food', 'astronaut', 'garden', 'cosmic-challenge',
  ]);
  assert.deepEqual(MEMORY_LEVELS.map(({ emojis }) => emojis.length), [4, 8, 10, 12, 13, 14, 15, 16, 17, 18]);
  for (const level of MEMORY_LEVELS) {
    assert.equal(new Set(level.emojis).size, level.emojis.length, `${level.name} has duplicate pictures`);
    assert.equal(new Set(level.emojis.map((emoji) => memoryCardLabel(emoji, level.id))).size, level.emojis.length, `${level.name} has cards with indistinguishable names`);
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
  assert.deepEqual(['🌙', '🌑', '🌕'].map((emoji) => memoryCardLabel(emoji)), ['moon', 'new moon', 'full moon']);
});

test('every authored Memory narration names the displayed strategy or visible card', () => {
  const lines = memoryNarrationLines(MEMORY_LEVELS);
  assert.ok(MEMORY_STRATEGY_LINES.every((line) => lines.includes(line)));
  assert.ok([0, 1, 2].every((index) => MEMORY_STRATEGY_LINES.includes(memoryStrategy(index, false))));
  assert.ok(MEMORY_STRATEGY_LINES.includes(memoryStrategy(2, true)));
  assert.ok(!lines.some((line) => /^You found the picture\./i.test(line)));
  for (const level of MEMORY_LEVELS) {
    for (const emoji of level.emojis) {
      const label = memoryCardLabel(emoji, level.id);
      assert.ok(lines.includes(`You found the ${label}. Remember where it is.`));
      assert.ok(lines.includes(`You matched the ${label} pair.`));
    }
  }
});

test('Memory illustration inventory distinguishes each authored crop and reports unillustrated tokens', () => {
  const audit = memoryIllustrationAudit(MEMORY_LEVELS);
  assert.equal(audit.length, new Set(MEMORY_LEVELS.flatMap(({ emojis }) => emojis)).size);
  assert.deepEqual(Object.keys(MEMORY_CARD_ILLUSTRATIONS), ['🐶', '🦊', '🥚', '🌋', '🪐', '🌙', '☄️', '🛰️', '🌍', '🌕', '🌑', '☀️', '🌱', '🌳', '🌿', '🍄', '🦕', '🦖', '🚀', '🚒', '🚗', '🐵', '🐸', '🐳', '🐬', '🦈', '🐢', '🍎', '🍌', '🍇', '🍉', '🛸', '👽', '🌌', '🔭']);
  assert.notEqual(MEMORY_CARD_ILLUSTRATIONS['🦕'].asset, MEMORY_CARD_ILLUSTRATIONS['🦖'].asset);
  assert.equal(MEMORY_CARD_ILLUSTRATIONS['🐵'].asset, MEMORY_CARD_ILLUSTRATIONS['🐸'].asset);
  assert.notEqual(MEMORY_CARD_ILLUSTRATIONS['🐵'].crop, MEMORY_CARD_ILLUSTRATIONS['🐸'].crop);
  for (const emoji of ['🐶', '🦊', '🥚', '🌋', '🪐', '🌙', '☄️', '🛰️', '🌍', '🌕', '🌑', '☀️', '🌱', '🌳', '🌿', '🍄', '🐳', '🐬', '🦈', '🐢', '🍎', '🍌', '🍇', '🍉']) {
    const entry = audit.find((item) => item.emoji === emoji);
    assert.ok(entry, `${emoji} should remain on an authored Amari board`);
    assert.ok(entry.illustration?.asset, `${emoji} should use matching generated or reviewed art`);
  }
  const newPremiumTokens = ['🐶', '🦊', '🥚', '🌋', '🪐', '🌙', '☄️', '🛰️', '🌍', '🌕', '🌑', '☀️', '🌱', '🌳', '🌿', '🍄', '🐳', '🐬', '🦈', '🐢', '🍎', '🍌', '🍇', '🍉', '🛸', '👽', '🌌', '🔭'];
  assert.equal(new Set(newPremiumTokens.map((emoji) => MEMORY_CARD_ILLUSTRATIONS[emoji].asset)).size, newPremiumTokens.length);
  assert.deepEqual(['🐳', '🐬', '🦈', '🐢'].map((emoji) => memoryCardLabel(emoji)), ['whale', 'dolphin', 'shark', 'turtle']);
  assert.ok(['🐳', '🦈', '🐢'].every((emoji) => MEMORY_CARD_ILLUSTRATIONS[emoji].className === 'memory-card-art-image memory-card-art-ocean'));
  assert.equal(MEMORY_CARD_ILLUSTRATIONS['🐬'].className, 'memory-card-art-image memory-card-art-ocean memory-card-art-dolphin');
  assert.deepEqual(['🍎', '🍌', '🍇', '🍉'].map((emoji) => memoryCardLabel(emoji)), ['apple', 'banana', 'grapes', 'watermelon']);
  assert.deepEqual(['🛸', '👽', '🌌', '🔭'].map((emoji) => memoryCardLabel(emoji)), ['flying saucer', 'alien', 'galaxy', 'telescope']);
  assert.deepEqual(['🛸', '👽', '🌌', '🔭'].map((emoji) => MEMORY_CARD_ILLUSTRATIONS[emoji].asset), [
    'memory-match/flying-saucer-v1-card.webp',
    'memory-match/alien-v1-card.webp',
    'memory-match/galaxy-v1-card.webp',
    'memory-match/telescope-v1-card.webp',
  ]);
  assert.ok(audit.some(({ emoji, labels }) => emoji === '🦷' && labels.includes('dinosaur tooth') && !MEMORY_CARD_ILLUSTRATIONS[emoji]));
});

test('ocean and pond fish use distinct board-specific art while preserving the shared token and labels', () => {
  assert.deepEqual(Object.keys(MEMORY_CARD_CONTEXT_ILLUSTRATIONS), ['ocean', 'garden']);
  assert.equal(memoryCardLabel('🐟', 'ocean'), 'fish');
  assert.equal(memoryCardLabel('🐟', 'garden'), 'pond fish');
  assert.equal(memoryCardIllustration('🐟', 'ocean')?.asset, 'memory-match/ocean-fish-v1-card.webp');
  assert.equal(memoryCardIllustration('🐟', 'garden')?.asset, 'memory-match/pond-fish-v1-card.webp');
  assert.notEqual(memoryCardIllustration('🐟', 'ocean')?.asset, memoryCardIllustration('🐟', 'garden')?.asset);
  assert.equal(memoryCardIllustration('🐟', 'party'), null);
  const fishAudit = memoryIllustrationAudit(MEMORY_LEVELS).find(({ emoji }) => emoji === '🐟');
  assert.deepEqual(fishAudit.illustration.contexts.map(({ levelId, asset }) => [levelId, asset]), [
    ['ocean', 'memory-match/ocean-fish-v1-card.webp'],
    ['garden', 'memory-match/pond-fish-v1-card.webp'],
  ]);
  for (const [emoji, species, label] of [['🪼', 'jellyfish', 'jellyfish'], ['🦀', 'crab', 'crab'], ['🦑', 'squid', 'squid']]) {
    assert.equal(memoryCardLabel(emoji, 'ocean'), label);
    assert.equal(memoryCardIllustration(emoji, 'ocean')?.asset, `memory-match/${species}-v1-card.webp`);
  }
  assert.equal(new Set(['🐟', '🪼', '🦀', '🦑'].map((emoji) => memoryCardIllustration(emoji, 'ocean')?.asset)).size, 4);
});
