import { BATCH5_NARRATION, BATCH5_SOUND_SAFARI_CHAPTERS, BATCH5_SPELLING_WORDS, PURE_PHONEME_CLIP_PATHS } from '../src/data/batch5Literacy.js';
import { DECODABLE_CAPTIONS, TRICKY_WORDS } from '../src/data/literacy.js';
import { voiceClipKey } from '../src/data/voiceKey.js';

const texts = new Set();
const sequences = [];
const addText = (text) => { if (typeof text === 'string' && text.trim()) texts.add(text); };
const addSequence = (segments) => {
  const clean = segments.map((segment) => String(segment).replace(/\s+/g, ' ').trim());
  if (!clean.length || clean.some((segment) => !segment)) throw new Error('Narration sequence must contain non-empty exact segments');
  sequences.push(clean);
  clean.forEach(addText);
  addText(clean.join(' '));
};
Object.values(BATCH5_NARRATION).forEach((value) => Array.isArray(value) ? value.forEach((text) => addSequence([text])) : addSequence([value]));
for (const item of BATCH5_SPELLING_WORDS) {
  addText(item.word);
  addText(item.clue);
  addSequence([BATCH5_NARRATION.praise[1], `The word is ${item.word}.`]);
  addSequence([BATCH5_NARRATION.praise[0], `The word is ${item.word}.`]);
  addSequence([BATCH5_NARRATION.praise[3], `The word is ${item.word}.`]);
}
addSequence([BATCH5_NARRATION.praise[2], 'You found the sound.']);
for (const position of ['first', 'middle', 'last']) addText(`Listen to the word. Which sound do you hear at the ${position}?`);
addText('Build the word that matches the picture.');
addText('Which sound do you hear first?');
addText('Which sound do you hear in the middle?');
addText('Which sound do you hear at the end?');
for (const item of BATCH5_SOUND_SAFARI_CHAPTERS) addText(item.title);
for (const item of TRICKY_WORDS) addText(item.word.toLowerCase());
for (const item of DECODABLE_CAPTIONS) {
  addText(item.text);
  addSequence(['Read and copy:', item.text]);
  addText(`Read and copy: ${item.text}`);
}
for (const segments of sequences) {
  if (segments.join(' ') !== segments.map((segment) => segment.replace(/\s+/g, ' ').trim()).join(' ')) throw new Error('Narration sequence does not join exactly');
}
const phrases = [...texts].sort();
const items = phrases.map((text) => {
  const key = voiceClipKey(text, 'en-US');
  return Object.freeze({ text, key, path: `/audio/en/${key}-matilda.mp3` });
});
const phonemes = Object.entries(PURE_PHONEME_CLIP_PATHS).map(([phoneme, path]) => Object.freeze({ phoneme, path }));
export const buildBatch5LiteracyNarrationInventory = () => Object.freeze({ items: Object.freeze(items), phonemes: Object.freeze(phonemes), sequences: Object.freeze(sequences.map((segments) => Object.freeze([...segments]))) });
