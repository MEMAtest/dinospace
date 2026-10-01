const tone = (frequency, start, duration, gain = 0.11, waveform = 'sine') => ({
  kind: 'tone', frequency, start, duration, gain, waveform,
});

const sweep = (from, to, start, duration, gain = 0.1, waveform = 'triangle') => ({
  kind: 'sweep', from, to, start, duration, gain, waveform,
});

const arpeggio = (frequencies, { gap = 0.095, duration = 0.145, gain = 0.11, lastDuration = duration, waveform = 'sine' } = {}) => frequencies.map((frequency, index) => tone(
  frequency,
  index * gap,
  index === frequencies.length - 1 ? lastDuration : duration,
  gain,
  index === frequencies.length - 1 ? 'triangle' : waveform,
));

const cue = (priority, notes) => Object.freeze({
  priority,
  notes: Object.freeze(notes.map((note) => Object.freeze(note))),
});

const successNotes = arpeggio([523.25, 659.25, 783.99], { gain: 0.12 });
const gentleWrongNotes = [tone(440, 0, 0.11, 0.07), tone(349.23, 0.12, 0.13, 0.065, 'triangle')];

// Small, fully procedural cues. All oscillators pass through the hook's master
// gain, so muting also silences notes which have already been scheduled.
export const GAME_SOUND_CUES = Object.freeze({
  click: cue(0, [tone(659.25, 0, 0.045, 0.045, 'triangle')]),
  tap: cue(0, [tone(587.33, 0, 0.05, 0.05, 'triangle')]),
  'chess-move': cue(0.2, [tone(196, 0, 0.075, 0.07), tone(293.66, 0.015, 0.085, 0.045, 'triangle')]),
  flip: cue(0.25, [tone(587.33, 0, 0.06, 0.06, 'triangle'), tone(783.99, 0.045, 0.07, 0.055)]),
  'card-flip': cue(0.25, [tone(659.25, 0, 0.055, 0.06, 'triangle'), tone(880, 0.045, 0.07, 0.05)]),
  pop: cue(0.3, [tone(587.33, 0, 0.075, 0.06), tone(783.99, 0.065, 0.11, 0.075, 'triangle')]),
  chime: cue(0.4, arpeggio([783.99, 987.77], { gap: 0.1, duration: 0.16, gain: 0.085 })),
  sparkle: cue(0.5, arpeggio([880, 1046.5, 1318.51], { gap: 0.075, duration: 0.12, gain: 0.065 })),
  swish: cue(0.3, [sweep(760, 420, 0, 0.18, 0.055)]),
  whoosh: cue(0.35, [sweep(1046.5, 392, 0, 0.23, 0.065, 'sine')]),
  launch: cue(0.6, [sweep(392, 783.99, 0, 0.26, 0.075), tone(987.77, 0.2, 0.09, 0.055, 'triangle')]),
  welcome: cue(0.65, arpeggio([392, 493.88, 587.33], { gap: 0.11, duration: 0.2, lastDuration: 0.25, gain: 0.07 })),
  roar: cue(0.4, [sweep(196, 130.81, 0, 0.28, 0.06, 'triangle'), sweep(261.63, 174.61, 0.06, 0.22, 0.035, 'sine')]),
  splash: cue(0.35, [sweep(987.77, 329.63, 0, 0.19, 0.05), tone(261.63, 0.04, 0.12, 0.04)]),
  countdown: cue(0.3, [tone(783.99, 0, 0.095, 0.06, 'triangle')]),
  confetti: cue(0.7, [sweep(523.25, 1046.5, 0, 0.21, 0.055), ...arpeggio([783.99, 1046.5], { gap: 0.09, duration: 0.11, gain: 0.05 })]),
  combo: cue(1.5, arpeggio([659.25, 783.99, 987.77], { gap: 0.075, duration: 0.11, gain: 0.08 })),
  streak: cue(1.6, arpeggio([587.33, 783.99, 987.77, 1174.66], { gap: 0.075, duration: 0.11, gain: 0.075 })),
  wrong: cue(1, gentleWrongNotes),
  oops: cue(1, gentleWrongNotes.map((note) => ({ ...note, gain: note.gain * 0.78 }))),
  success: cue(3, successNotes),
  levelup: cue(4, arpeggio([523.25, 659.25, 783.99, 1046.5], { gap: 0.085, duration: 0.13, lastDuration: 0.22, gain: 0.1 })),
  'levelup-big': cue(5, arpeggio([523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98], { gap: 0.09, duration: 0.14, lastDuration: 0.3, gain: 0.095 })),
  complete: cue(6, arpeggio([523.25, 659.25, 783.99, 1046.5, 1318.51], { gap: 0.12, duration: 0.18, lastDuration: 0.38, gain: 0.09 })),
});

export const getGameSoundCue = (name) => GAME_SOUND_CUES[name] || null;

// Calls made in one event turn are coalesced to the most meaningful cue. This
// keeps success/fanfare above adjacent tap, launch, and reward sounds.
export const selectGameSoundCue = (names = []) => names
  .map((name, index) => ({ name, index, cue: getGameSoundCue(name) }))
  .filter(({ cue: found }) => found)
  .sort((a, b) => b.cue.priority - a.cue.priority || b.index - a.index)[0]?.name || null;
