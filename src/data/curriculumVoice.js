import { CONTINENTS, CURRICULUM_MODULES, OCEANS } from './curriculumModules.js';
import { getOfflineVoiceClip } from './offlineVoice.js';
import { normalizeVoiceText, voiceClipKey } from './voiceKey.js';

export const CURRICULUM_LESSON_COPY = Object.freeze({
  continents: 'A continent is a large area of land. An ocean is a huge area of salt water. A country is a place where people live. A map helps us find places.',
  'time-detectives': 'The past is what happened before now. Evidence is a clue that helps us learn. A sequence puts events in order.',
  'nature-lab': 'Scientists observe, sort and classify. Plants and animals are living things; materials are what objects are made from; seasons bring different weather.',
});

const collectVoiceText = () => {
  const text = new Set([
    'Learn and explore.',
    'Make a choice, then explain what you found.',
    'Learn by exploring, sorting and spotting useful clues.',
    'Learn first, then try it independently.',
    'A prediction is an idea, not a wrong answer.',
    'Prediction saved. Now compare it with the observation. A prediction is an idea, not a wrong answer.',
    'Good move.',
    'Not quite. Which clue is older? Try again.',
    'A country is a place inside a continent. Look at the map positions and try again.',
    'Good detective work. Look closely and try another answer.',
    ...Object.values(CURRICULUM_LESSON_COPY),
    ...CONTINENTS.map((item) => item.name),
    ...OCEANS.map((item) => item.name),
  ]);
  CURRICULUM_MODULES.forEach((module) => {
    module.vocabulary.forEach((word) => text.add(word));
    Object.values(module.rounds).flat().forEach((round) => {
      text.add(round.prompt);
      text.add(round.explanation);
      if (round.observation) text.add(round.observation);
      if (round.wrongFeedback) text.add(round.wrongFeedback);
      (round.options || []).forEach((option) => text.add(option.label));
      (round.items || []).forEach((item) => text.add(item.label));
      (round.predictions || []).forEach((prediction) => text.add(prediction.label));
    });
  });
  return Object.freeze([...text]);
};

export const CURRICULUM_VOICE_TEXTS = collectVoiceText();

// The generation script consumes this derived corpus, so a later approved
// ElevenLabs run can resume from the same module registry without maintaining
// a second hand-copied list of prompts.
export const CURRICULUM_VOICE_CORPUS = Object.freeze(CURRICULUM_VOICE_TEXTS.map((text) => ({
  text: normalizeVoiceText(text),
  lang: 'en-US',
  key: voiceClipKey(text, 'en-US'),
})));

export const getCurriculumVoiceClip = (text) => getOfflineVoiceClip(text, 'en-US');

export const getMissingCurriculumVoiceTexts = () => CURRICULUM_VOICE_TEXTS.filter((text) => !getCurriculumVoiceClip(text));

export const getMissingCurriculumVoiceAssets = () => CURRICULUM_VOICE_CORPUS
  .filter(({ text }) => !getCurriculumVoiceClip(text))
  .map(({ key, text }) => ({ key, text, path: `/audio/en/${key}-matilda.mp3` }));
