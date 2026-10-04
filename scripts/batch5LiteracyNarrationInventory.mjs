import { BATCH5_NARRATION, BATCH5_SOUND_SAFARI_CHAPTERS, BATCH5_SPELLING_WORDS, PURE_PHONEME_CLIP_PATHS } from '../src/data/batch5Literacy.js';
import { DECODABLE_CAPTIONS, TRICKY_WORDS } from '../src/data/literacy.js';
import { voiceClipKey } from '../src/data/voiceKey.js';
import { createSoundSafariPool, getSoundSafariMinimalPairDefinitions } from '../src/data/batch5LiteracyPools.js';
import { SOUND_SAFARI_DEFAULT_TAUGHT, SOUND_SAFARI_PICTURE_WORDS_BY_CHAPTER } from '../src/data/batch5SoundSafariPictureWords.js';
import { soundSafariHintSpeechSegments, soundSafariPrompt, soundSafariRetryText, soundSafariSpokenFeedback } from '../src/data/batch5SoundSafariNarration.js';

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
const baselineUniqueTextCount = texts.size;
const baselineSequenceCount = sequences.length;
const soundSafariGroups = {
  wholeWordMinimalPair: new Set(),
  promptsAndRetry: new Set(),
  afterAnswerFeedback: new Set(),
  chapter3WordHints: new Set(),
};
const soundSafariSequences = [];
const addSafariSequence = (group, segments) => {
  const clean = segments.map((segment) => String(segment).replace(/\s+/g, ' ').trim());
  if (!clean.length || clean.some((segment) => !segment)) throw new Error('Sound Safari narration sequence needs exact non-empty segments');
  clean.forEach((text) => { soundSafariGroups[group].add(text); addText(text); });
  const joined = clean.join(' ');
  soundSafariGroups[group].add(joined);
  addText(joined);
  soundSafariSequences.push(clean);
};
const phase2MatchAndPair = createSoundSafariPool(0, SOUND_SAFARI_DEFAULT_TAUGHT.phase2);
const phase2Blend = createSoundSafariPool(1, SOUND_SAFARI_DEFAULT_TAUGHT.phase2);
const phase3Blend = createSoundSafariPool(1, SOUND_SAFARI_DEFAULT_TAUGHT.phase3);
const phase3Positions = createSoundSafariPool(2, SOUND_SAFARI_DEFAULT_TAUGHT.phase3);
const phase2FirstSoundClips = phase2MatchAndPair.filter(({ type }) => type === 'match').map(({ id, target }) => Object.freeze({ questionId: id, word: target.word, phonemes: Object.freeze([target.phonemes[0]]) }));
const phase3BlendClips = phase3Blend.map(({ id, target }) => Object.freeze({ questionId: id, word: target.word, phonemes: Object.freeze([...target.phonemes]) }));
const soundSafariPhonemeKeys = Object.freeze([...new Set([...phase2FirstSoundClips, ...phase3BlendClips].flatMap(({ phonemes }) => phonemes))].sort());
for (const question of [...phase2MatchAndPair, ...phase2Blend, ...phase3Blend, ...phase3Positions]) {
  const prompt = soundSafariPrompt(question);
  const retry = soundSafariRetryText(question);
  addText(prompt);
  addText(retry);
  soundSafariGroups.promptsAndRetry.add(prompt);
  soundSafariGroups.promptsAndRetry.add(retry);
  if (question.type === 'minimalPair') addSafariSequence('wholeWordMinimalPair', soundSafariHintSpeechSegments(question));
  if (question.type === 'segment') addSafariSequence('chapter3WordHints', soundSafariHintSpeechSegments(question));
  const spoken = soundSafariSpokenFeedback(question);
  addSafariSequence('afterAnswerFeedback', spoken.segments);
}
const minimalPairWordIds = [...new Set(getSoundSafariMinimalPairDefinitions().flatMap(({ wordIds }) => wordIds))].sort();
const wordById = new Map([...BATCH5_SPELLING_WORDS, ...SOUND_SAFARI_PICTURE_WORDS_BY_CHAPTER.flat()].map((item) => [item.id, item]));
for (const id of minimalPairWordIds) {
  const text = wordById.get(id)?.word;
  if (!text) throw new Error(`Minimal-pair recording source word is missing: ${id}`);
  addSafariSequence('wholeWordMinimalPair', [text]);
}
soundSafariSequences.forEach((segments) => sequences.push(segments));
const phrases = [...texts].sort();
const items = phrases.map((text) => {
  const key = voiceClipKey(text, 'en-US');
  return Object.freeze({ text, key, path: `/audio/en/${key}-matilda.mp3` });
});
const phonemes = Object.entries(PURE_PHONEME_CLIP_PATHS).map(([phoneme, path]) => Object.freeze({ phoneme, path }));
export const buildBatch5LiteracyNarrationInventory = () => Object.freeze({
  baselineUniqueTextCount,
  baselineSequenceCount,
  items: Object.freeze(items),
  phonemes: Object.freeze(phonemes),
  sequences: Object.freeze(sequences.map((segments) => Object.freeze([...segments]))),
  soundSafari: Object.freeze({
    wholeWordRecordingIds: Object.freeze(minimalPairWordIds),
    phase2MatchQuestionCount: phase2MatchAndPair.filter(({ type }) => type === 'match').length,
    phase2MinimalPairDirectionCount: phase2MatchAndPair.filter(({ type }) => type === 'minimalPair').length,
    phase2BlendQuestionCount: phase2Blend.length,
    phase3BlendQuestionCount: phase3Blend.length,
    phase3PositionQuestionCount: phase3Positions.length,
    purePhonemeKeysUsed: soundSafariPhonemeKeys,
    purePhonemeSequences: Object.freeze({ firstSoundHints: Object.freeze(phase2FirstSoundClips), phase3BlendQuestions: Object.freeze(phase3BlendClips) }),
    spokenTextGroups: Object.freeze(Object.fromEntries(Object.entries(soundSafariGroups).map(([group, groupTexts]) => [group, Object.freeze([...groupTexts].sort())]))),
  }),
});
