// The spoken example is deliberately different from the answer picture.
// It gives a reliable phoneme model without identifying the matching card.
export const FIRST_SOUND_EXAMPLES = Object.freeze({
  a: 'ant', b: 'bus', c: 'cup', d: 'duck', e: 'egg',
  f: 'fan', g: 'gate', h: 'hen', i: 'ink', j: 'jam',
  k: 'king', l: 'lamp', m: 'mouse', n: 'net', o: 'ostrich',
  p: 'pen', qu: 'quick', r: 'rain', s: 'sock', t: 'top',
  u: 'up', v: 'van', w: 'window', y: 'yellow', z: 'zip',
});

export const firstSoundPrompt = (sound) => {
  const example = FIRST_SOUND_EXAMPLES[sound.toLowerCase()];
  if (!example) throw new Error(`No first-sound example for ${sound}`);
  return `Listen to ${example}. Which picture starts with the same sound?`;
};
