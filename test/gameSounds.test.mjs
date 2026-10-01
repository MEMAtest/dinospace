import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { GAME_SOUND_CUES, getGameSoundCue, selectGameSoundCue } from '../src/data/gameSounds.js';

const sourceFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(absolute);
    return /\.(jsx?|tsx?)$/.test(entry.name) ? [absolute] : [];
  }));
  return nested.flat();
};

test('every statically called playSfx cue has a procedural definition', async () => {
  const files = await sourceFiles(new URL('../src', import.meta.url).pathname);
  const contents = await Promise.all(files.map((file) => readFile(file, 'utf8')));
  const calledNames = new Set(contents.flatMap((text) => [...text.matchAll(/playSfx\??\(\s*['"]([^'"]+)['"]\s*\)/g)].map((match) => match[1])));

  assert.ok(calledNames.size > 0);
  for (const name of calledNames) assert.ok(getGameSoundCue(name), `missing cue definition for ${name}`);
});

test('all legacy cue names remain defined with bounded, gentle oscillator plans', () => {
  const legacyNames = [
    'click', 'pop', 'chime', 'success', 'oops', 'swish', 'flip', 'sparkle', 'launch',
    'welcome', 'roar', 'splash', 'whoosh', 'levelup', 'streak', 'tap', 'countdown',
    'wrong', 'complete', 'confetti', 'levelup-big', 'card-flip', 'combo', 'chess-move',
  ];

  for (const name of legacyNames) {
    const cue = getGameSoundCue(name);
    assert.ok(cue, `${name} stays supported`);
    assert.ok(cue.notes.length >= 1 && cue.notes.length <= 6, `${name} uses a small voice count`);
    for (const note of cue.notes) {
      assert.ok(note.start >= 0 && note.duration > 0 && note.duration <= 0.4);
      assert.ok(note.gain > 0 && note.gain <= 0.13);
      assert.ok(['sine', 'triangle'].includes(note.waveform), `${name} avoids harsh waveforms`);
      if (note.kind === 'tone') assert.ok(Number.isFinite(note.frequency) && note.frequency > 0);
      else {
        assert.ok(note.kind === 'sweep');
        assert.ok(Number.isFinite(note.from) && note.from > 0);
        assert.ok(Number.isFinite(note.to) && note.to > 0);
      }
    }
  }
});

test('progress and success rise in a major key, with a distinct larger finish fanfare', () => {
  const pitches = (name) => GAME_SOUND_CUES[name].notes.map((note) => note.frequency);
  assert.deepEqual(pitches('pop'), [587.33, 783.99]);
  assert.deepEqual(pitches('success'), [523.25, 659.25, 783.99]);
  assert.ok(pitches('complete').length > pitches('success').length);
  assert.ok(GAME_SOUND_CUES.complete.notes.at(-1).duration > GAME_SOUND_CUES.success.notes.at(-1).duration);
  assert.ok(GAME_SOUND_CUES['levelup-big'].priority > GAME_SOUND_CUES.success.priority);
});

test('same-turn coalescing preserves the most meaningful cue over taps and transitions', () => {
  assert.equal(selectGameSoundCue(['tap', 'launch', 'success']), 'success');
  assert.equal(selectGameSoundCue(['click', 'levelup-big', 'complete']), 'complete');
  assert.equal(selectGameSoundCue(['success', 'complete', 'tap']), 'complete');
  assert.equal(selectGameSoundCue(['unknown', 'click']), 'click');
  assert.equal(selectGameSoundCue(['unknown']), null);
});
