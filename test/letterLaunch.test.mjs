import assert from 'node:assert/strict';
import test from 'node:test';
import { buildLetterLaunchRound, letterLaunchExplanation, letterLaunchNextSoundPrompt, letterLaunchPromptFor, letterLaunchSessionTarget, LETTER_LAUNCH_PROMPT_CORPUS } from '../src/data/letterLaunch.js';
import { getTaughtGraphemes, LITERACY_PROFILE_KEY } from '../src/data/literacy.js';

test('Letter Launch has four distinct bands with age-appropriate round targets', () => {
  assert.deepEqual([0, 1, 2, 3].map(letterLaunchSessionTarget), [5, 6, 7, 8]);
  assert.deepEqual([0, 1, 2, 3].map((level) => buildLetterLaunchRound(level).kind), ['letter-sound', 'first-sound', 'case-match', 'build-word']);
});

test('Letter Launch distractors are unique and contain the valid answer', () => {
  [0, 1, 2].forEach((level) => {
    const round = buildLetterLaunchRound(level, [], () => 0.3);
    assert.ok(round.options.some((option) => option.letter.toLowerCase() === round.target.letter.toLowerCase()));
    assert.equal(new Set(round.options.map((option) => option.letter)).size, round.options.length);
  });
});

test('Letter Launch uses taught sounds and assembles fully decodable CVC words', () => {
  const taught = getTaughtGraphemes();
  for (let seed = 0; seed < 20; seed += 1) {
    const round = buildLetterLaunchRound(3, [], () => (seed * 0.137) % 1);
    assert.equal(round.kind, 'build-word');
    assert.equal(round.target.graphemes.length, 3);
    assert.ok(round.target.graphemes.every((sound) => taught.has(sound.toLowerCase())));
    assert.ok(round.tiles.length >= 3);
    assert.ok(round.tiles.every((tile) => taught.has(tile.grapheme.toLowerCase())));
    assert.match(letterLaunchExplanation(round), /blended/);
  }
});

test('Letter Launch avoids repeating completed targets until the available pool cycles', () => {
  [0, 1, 2, 3].forEach((level) => {
    const seen = [];
    for (let index = 0; index < 8; index += 1) {
      const round = buildLetterLaunchRound(level, seen, () => 0);
      seen.push(round.key);
    }
    assert.equal(new Set(seen).size, seen.length);
  });
});

test('Letter Launch safely falls back when the taught sounds cannot make a CVC word', () => {
  const previousStorage = globalThis.localStorage;
  globalThis.localStorage = {
    getItem: (key) => key === LITERACY_PROFILE_KEY ? JSON.stringify({ selectedSounds: ['s', 'a'] }) : null,
  };
  try {
    const round = buildLetterLaunchRound(3, [], () => 0);
    const taught = getTaughtGraphemes();
    assert.notEqual(round.kind, 'build-word');
    assert.ok(round.options.length > 0);
    assert.ok(round.options.every((option) => taught.has(option.letter.toLowerCase())));
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  }
});

test('offline voice corpus contains every reachable round prompt and next CVC sound cue', () => {
  const prompts = new Set(LETTER_LAUNCH_PROMPT_CORPUS);
  for (let level = 0; level < 4; level += 1) {
    const seen = [];
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const round = buildLetterLaunchRound(level, seen, () => 0.23);
      if (round.kind === 'unavailable' || seen.includes(round.key)) break;
      assert.ok(prompts.has(letterLaunchPromptFor(round)), `level ${level}: ${letterLaunchPromptFor(round)}`);
      if (round.kind === 'build-word') {
        round.target.graphemes.forEach((sound) => assert.ok(prompts.has(letterLaunchNextSoundPrompt(sound)), `missing next-sound cue for ${sound}`));
      }
      seen.push(round.key);
    }
  }
  assert.ok(LETTER_LAUNCH_PROMPT_CORPUS.every((prompt) => !prompt.includes('/')), 'spoken prompts use modeled words, not IPA slashes');
});
