import assert from 'node:assert/strict';
import test from 'node:test';
import { buildLetterLaunchRound, CASE_CONFUSABLES, letterLaunchClueCaption, letterLaunchExplanation, letterLaunchNextSoundPrompt, letterLaunchPromptFor, letterLaunchSessionTarget, letterLaunchTargetForPlayer, letterLaunchRandomFor, LETTER_LAUNCH_PROMPT_CORPUS } from '../src/data/letterLaunch.js';
import { getTaughtGraphemes, LITERACY_PROFILE_KEY, PHASE_WORDS } from '../src/data/literacy.js';
import { SESSION_LEVELS } from '../src/data/sessionLevels.js';
import { getOfflineVoiceClip } from '../src/data/offlineVoice.js';

test('Letter Launch has four distinct bands with age-appropriate round targets', () => {
  assert.deepEqual([0, 1, 2, 3].map(letterLaunchSessionTarget), [6, 6, 7, 8]);
  assert.deepEqual([0, 1, 2, 3].map((level) => letterLaunchTargetForPlayer(level, true)), [4, 4, 5, 5]);
  assert.deepEqual([0, 1, 2, 3].map((level) => letterLaunchTargetForPlayer(level, false)), [6, 6, 7, 8]);
  assert.deepEqual(SESSION_LEVELS.letters.map(({ target }) => target), [0, 1, 2, 3].map(letterLaunchSessionTarget));
  assert.deepEqual([0, 1, 2, 3].map((level) => buildLetterLaunchRound(level).kind), ['letter-sound', 'first-sound', 'case-match', 'build-word']);
});

test('Letter Launch distractors are unique and contain the valid answer', () => {
  [0, 1, 2].forEach((level) => {
    const round = buildLetterLaunchRound(level, [], () => 0.3);
    assert.ok(round.options.some((option) => option.letter.toLowerCase() === round.target.letter.toLowerCase()));
    assert.equal(new Set(round.options.map((option) => option.letter)).size, round.options.length);
  });
});

test('seeded Letter Launch runs reproduce questions and choices without recent repeats', () => {
  const run = (seed, level) => {
    let history = [];
    const rounds = [];
    for (let cursor = 0; cursor < letterLaunchSessionTarget(level); cursor += 1) {
      const round = buildLetterLaunchRound(level, history, letterLaunchRandomFor(seed, cursor));
      assert.ok(!history.includes(round.key));
      history = [...history, round.key].slice(-8);
      rounds.push(round);
    }
    return rounds;
  };
  for (let level = 0; level < 4; level += 1) {
    assert.deepEqual(run(1729, level), run(1729, level));
    const signatures = new Set(Array.from({ length: 10 }, (_, seed) => JSON.stringify(run(seed, level))));
    assert.equal(signatures.size, 10, `level ${level} should have distinct seeded runs`);
  }
});

test('Letter Launch uses taught graphemes and assembles fully decodable short words', () => {
  const taught = getTaughtGraphemes();
  for (let seed = 0; seed < 20; seed += 1) {
    const round = buildLetterLaunchRound(3, [], () => (seed * 0.137) % 1);
    assert.equal(round.kind, 'build-word');
    assert.equal(round.target.graphemes.length, 3);
    assert.ok([3, 4].includes(round.target.word.length));
    assert.ok(round.target.graphemes.every((sound) => taught.has(sound.toLowerCase())));
    assert.ok(round.tiles.length >= 3);
    assert.ok(round.tiles.every((tile) => taught.has(tile.grapheme.toLowerCase())));
    assert.match(letterLaunchExplanation(round), /blended/);
  }
});

test('seeded answer positions are reasonably balanced across all four Letter Launch bands', () => {
  const limits = [
    { choices: 2, min: 240, max: 360 },
    { choices: 3, min: 140, max: 260 },
    { choices: 4, min: 105, max: 195 },
    { choices: 6, min: 65, max: 135 },
  ];
  for (let level = 0; level < limits.length; level += 1) {
    const { choices, min, max } = limits[level];
    const counts = Array(choices).fill(0);
    for (let seed = 1; seed <= 600; seed += 1) {
      const round = buildLetterLaunchRound(level, [], letterLaunchRandomFor(seed, 0));
      const correctPosition = round.kind === 'build-word'
        ? round.tiles.findIndex((tile) => tile.grapheme === round.target.graphemes[0])
        : round.options.findIndex((option) => option.letter.toLowerCase() === round.target.letter.toLowerCase());
      assert.ok(correctPosition >= 0, `seed ${seed}, level ${level} must have a visible correct answer`);
      counts[correctPosition] += 1;
    }
    counts.forEach((count, position) => {
      assert.ok(count >= min && count <= max, `level ${level}, position ${position}: ${count} of 600`);
    });
  }
});

test('CVC generator only emits targets and tiles made from the selected taught graphemes', () => {
  const previousStorage = globalThis.localStorage;
  const profiles = [
    ['s', 'a', 't', 'p', 'i', 'n', 'm', 'd', 'g', 'o', 'c', 'k'],
    ['s', 'a', 't', 'p', 'i', 'n', 'm', 'd', 'g', 'o', 'c', 'k', 'e', 'u', 'r', 'h', 'b', 'f', 'l'],
    ['s', 'a', 't', 'p', 'i', 'n', 'm', 'd', 'g', 'o', 'c', 'k', 'e', 'u', 'r', 'h', 'b', 'f', 'l', 'j', 'v', 'w', 'x', 'y', 'z'],
    ['s', 'a', 't', 'p', 'i', 'n', 'm', 'd', 'g', 'o', 'c', 'k', 'ch', 'sh', 'th', 'ng', 'ai', 'ee', 'igh', 'oa', 'oo', 'ar', 'or', 'ur', 'ow', 'oi', 'ear', 'air', 'er'],
  ];
  try {
    for (const selectedSounds of profiles) {
      globalThis.localStorage = {
        getItem: (key) => key === LITERACY_PROFILE_KEY ? JSON.stringify({ selectedSounds }) : null,
      };
      const taught = new Set(selectedSounds);
      let sawDecodable = false;
      for (let seed = 1; seed <= 80; seed += 1) {
        const round = buildLetterLaunchRound(3, [], letterLaunchRandomFor(seed, 0));
        if (round.kind !== 'build-word') continue;
        sawDecodable = true;
        assert.equal(round.target.graphemes.length, 3);
        assert.ok([3, 4].includes(round.target.word.length));
        assert.ok(round.target.graphemes.every((sound) => taught.has(sound.toLowerCase())), `${round.target.word} uses only taught sounds`);
        assert.ok(round.tiles.every((tile) => taught.has(tile.grapheme.toLowerCase())), `tiles for ${round.target.word} use only taught sounds`);
      }
      if (selectedSounds.includes('c') && selectedSounds.includes('a') && selectedSounds.includes('t')) {
        assert.equal(sawDecodable, true, 'a profile with taught C-A-T sounds should produce decodable rounds');
      }
    }
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  }
});

test('the final transfer introduces four-letter decodable words after CVC practice when graphemes are taught', () => {
  const previousStorage = globalThis.localStorage;
  const selectedSounds = ['s', 'a', 't', 'p', 'i', 'n', 'm', 'd', 'g', 'o', 'c', 'k', 'e', 'u', 'r', 'h', 'b', 'f', 'l', 'ch', 'sh', 'th', 'ng', 'ai', 'ee', 'oa', 'oo'];
  globalThis.localStorage = { getItem: (key) => key === LITERACY_PROFILE_KEY ? JSON.stringify({ selectedSounds }) : null };
  try {
    const taught = new Set(selectedSounds);
    const early = buildLetterLaunchRound(3, [], letterLaunchRandomFor(88, 0), 0, taught);
    const transfer = buildLetterLaunchRound(3, [], letterLaunchRandomFor(88, 3), 3, taught);
    assert.equal(early.kind, 'build-word');
    assert.equal(early.target.word.length, 3);
    assert.equal(transfer.kind, 'build-word');
    assert.equal(transfer.target.word.length, 4);
    assert.ok(transfer.target.graphemes.every((grapheme) => taught.has(grapheme)));
    assert.ok(getOfflineVoiceClip(transfer.target.word.toLowerCase()), `missing whole-word recording for ${transfer.target.word}`);
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  }
});

test('every authored four-letter transfer has an exact packaged whole-word recording', () => {
  const transferWords = PHASE_WORDS.filter(({ word }) => word.length === 4);
  assert.deepEqual(transferWords.map(({ word }) => word), ['FISH', 'CHIP', 'SHIP', 'RAIN', 'FEET', 'BOAT', 'MOON']);
  for (const { word } of transferWords) assert.ok(getOfflineVoiceClip(word.toLowerCase()), `missing whole-word audio for ${word}`);
});

test('case matching supplies a taught shape-confusable distractor where one is available', () => {
  const taught = new Set(getTaughtGraphemes());
  let covered = false;
  for (let seed = 1; seed <= 100; seed += 1) {
    const round = buildLetterLaunchRound(2, [], letterLaunchRandomFor(seed), 0, taught);
    if (round.target.letter !== 'B') continue;
    covered = true;
    assert.ok(round.options.some(({ letter }) => CASE_CONFUSABLES.B.includes(letter)));
    break;
  }
  assert.equal(covered, true, 'seeded coverage should include a B/distractor comparison');
});

test('SAT picture clue explains the action instead of presenting only a chair', () => {
  assert.equal(letterLaunchClueCaption({ target: { word: 'SAT' } }), 'She sat down on the chair.');
  assert.equal(letterLaunchClueCaption({ target: { word: 'CAT' } }), '');
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
        round.target.graphemes.forEach((sound) => {
          const nextPrompt = letterLaunchNextSoundPrompt(sound);
          if (nextPrompt) assert.ok(prompts.has(nextPrompt), `missing next-sound cue for ${sound}`);
        });
      }
      seen.push(round.key);
    }
  }
  assert.ok(LETTER_LAUNCH_PROMPT_CORPUS.every((prompt) => !prompt.includes('/')), 'spoken prompts use modeled words, not IPA slashes');
});
