import { BATCH5_NARRATION } from './batch5Literacy.js';
import { soundSafariSoundLabel } from './batch5SoundSafariLabels.js';

export const soundSafariPrompt = (question) => question.type === 'match' ? BATCH5_NARRATION.prompts[0]
  : question.type === 'blend' ? BATCH5_NARRATION.prompts[1]
    : question.type === 'minimalPair' ? question.prompt
      : `Listen to the word. Which sound do you hear at the ${question.position}?`;

export const soundSafariPraise = (question) => question.type === 'match' ? BATCH5_NARRATION.praise[0]
  : question.type === 'blend' ? BATCH5_NARRATION.praise[3]
    : question.type === 'minimalPair' ? BATCH5_NARRATION.praise[0] : BATCH5_NARRATION.praise[2];

export const soundSafariHintText = (question) => question.type === 'match' ? BATCH5_NARRATION.hints[2]
  : question.type === 'blend' ? BATCH5_NARRATION.hints[0]
    : question.type === 'minimalPair' ? 'Listen to the whole word again, then choose the picture that matches.'
      : `Say ${question.target.word} slowly, then listen for the ${question.position} sound.`;

export const soundSafariVisibleAnswerFact = (question) => question.type === 'match'
  ? `The word ${question.target.word} starts with the ${soundSafariSoundLabel(question.answerId)}.`
  : question.type === 'blend' ? `You blended the sounds to say ${question.target.word}.`
    : question.type === 'minimalPair' ? question.afterAnswer
      : `The ${question.position} sound is the ${soundSafariSoundLabel(question.answerId)}.`;

// Spoken and visible post-answer feedback share the same concise instructional fact.
export const soundSafariSpokenFact = (question) => soundSafariVisibleAnswerFact(question);

export const soundSafariSpokenFeedback = (question) => {
  const segments = [soundSafariPraise(question), soundSafariSpokenFact(question)];
  return Object.freeze({ segments: Object.freeze(segments), text: segments.join(' ') });
};

export const soundSafariRetryText = (question) => question.type === 'minimalPair' ? BATCH5_NARRATION.retry[1] : BATCH5_NARRATION.retry[0];
export const soundSafariHintSpeechSegments = (question) => Object.freeze([question.target.word]);
