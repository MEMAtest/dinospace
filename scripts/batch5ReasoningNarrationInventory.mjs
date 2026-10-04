import { COLOUR_CHAPTERS, COLOUR_MODEL, COLOUR_RECIPES, COLOUR_SWATCHES, COLOUR_TASKS, colourChoiceLabel } from '../src/data/batch5Colour.js';
import { ODD_CHAPTERS, ODD_RULES } from '../src/data/batch5Reasoning.js';

const texts = new Set();
const sequences = [];
const addText = (text) => { if (typeof text === 'string' && text.trim()) texts.add(text); };
const addSequence = (segments) => {
  const clean = segments.map((part) => String(part).replace(/\s+/g, ' ').trim());
  if (!clean.length || clean.some((part) => !part)) throw new Error('Narration sequences need non-empty exact segments');
  sequences.push(clean);
  clean.forEach(addText);
  addText(clean.join(' '));
};

addText(COLOUR_MODEL.note);
for (const chapter of COLOUR_CHAPTERS) addText(chapter.title);
for (const swatch of Object.values(COLOUR_SWATCHES)) addText(swatch.label);
for (const task of COLOUR_TASKS) {
  addText(task.prompt);
  addText(task.fact);
  if (task.chapter === 2) for (const choice of task.choices) addText(colourChoiceLabel(task, choice));
}
for (const recipe of COLOUR_RECIPES) {
  addText(`${COLOUR_SWATCHES[recipe.first].label} + ${COLOUR_SWATCHES[recipe.second].label}`);
}

for (const chapter of ODD_CHAPTERS) addText(chapter.title);
for (const rule of ODD_RULES) {
  addText(rule.property);
  addText(rule.explanation);
  for (const candidate of rule.candidates) addText(candidate.label);
  for (const reason of rule.reasons) {
    addText(reason);
    addSequence([rule.explanation, reason]);
  }
}

const items = [...texts].sort().map((text) => Object.freeze({ text }));
export const buildBatch5ReasoningNarrationInventory = () => Object.freeze({
  items: Object.freeze(items),
  sequences: Object.freeze(sequences.map((sequence) => Object.freeze([...sequence]))),
});
