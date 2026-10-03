import { COUNT_THE_STARS_NARRATION } from './countTheStarsBatch3.js';
import { DINO_DETECTIVE_NARRATION } from './dinoDetectiveBatch3.js';
import { AMARI_TRACE_NARRATION } from './letterTraceLearning.js';
import { COSMIC_CHAPTERS, COSMIC_TACTIC_NARRATION } from './cosmicTactics.js';
import { normalizeVoiceText, voiceClipKey } from './voiceKey.js';

const strings = (value) => typeof value === 'string' ? [value]
  : Array.isArray(value) ? value.flatMap(strings)
    : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];
const unique = (lines) => Object.freeze([...new Set(lines.map(normalizeVoiceText).filter(Boolean))].sort());

// An enumerable, finite packaging plan. This module never requests generation
// or treats file coverage as an audible-quality verdict.
export const BATCH3_VOICE_CORPUS_BY_GAME = Object.freeze({
  counting: unique(strings(COUNT_THE_STARS_NARRATION)),
  dino: unique([
    DINO_DETECTIVE_NARRATION.instruction, DINO_DETECTIVE_NARRATION.wrong,
    DINO_DETECTIVE_NARRATION.found, DINO_DETECTIVE_NARRATION.complete,
    ...DINO_DETECTIVE_NARRATION.worldLines,
    ...DINO_DETECTIVE_NARRATION.clueDirections.map((direction) => `Look in the ${direction} spot.`),
  ]),
  trace: unique(AMARI_TRACE_NARRATION),
  tictactoe: unique([...COSMIC_TACTIC_NARRATION, ...COSMIC_CHAPTERS.map(({ instruction }) => instruction)]),
});

export const BATCH3_VOICE_ITEMS = Object.freeze(unique(Object.values(BATCH3_VOICE_CORPUS_BY_GAME).flat()).map((text) => {
  const key = voiceClipKey(text);
  return Object.freeze({ text, key, path: `/audio/en/${key}-matilda.mp3` });
}));
