// Authored answer metadata for the actual-control driver. This is read from
// source at runner time; it is never written into the browser or app storage.
import { CURRICULUM_MODULES, CONTINENTS, OCEANS } from '../../../src/data/curriculumModules.js';
import { getCurriculumVoiceClip } from '../../../src/data/curriculumVoice.js';

const modules = CURRICULUM_MODULES.map(({ id, title, rounds }) => ({
  id,
  title,
  rounds: Object.fromEntries(Object.entries(rounds).map(([band, items]) => [band, items.map((round) => ({
    id: round.id,
    type: round.type,
    prompt: round.prompt,
    answer: round.answer ?? null,
    explanation: round.explanation,
    audioClip: getCurriculumVoiceClip(round.explanation) || null,
    wrongFeedback: round.wrongFeedback || '',
    observation: round.observation || '',
    predictions: round.predictions || [],
    options: round.options || [],
    items: round.items || [],
    path: round.path || [],
    start: round.start || null,
    target: round.target || null,
    blocked: round.blocked || [],
  }))])),
}));

const mapNames = Object.fromEntries([...CONTINENTS, ...OCEANS].map(({ id, name }) => [id, name]));
process.stdout.write(JSON.stringify({ modules, mapNames }));
