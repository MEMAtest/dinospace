import { getCanonicalArithmeticQuestionPool } from '../src/data/arithmeticAdventure.js';
import { getCanonicalTimeQuestionPool } from '../src/data/timeLineAdventure.js';
import { arithmeticBatch4NarrationSegments, numberLineNarrationSegments, numberLineNarrationText, timeNarrationSegments, TIME_TELLER_NARRATION } from '../src/data/batch4Narration.js';
import { voiceClipKey } from '../src/data/voiceKey.js';

const fields = ['prompt', 'clue', 'explanation'];
const corpora = { addition: new Set(), subtraction: new Set(), time: new Set(), numberLine: new Set() };
const add = (game, source, parts) => {
  if (!parts.length || parts.join(' ') !== source) throw new Error(`${game} narration does not rejoin exactly: ${source}`);
  if (parts.some((part) => part.trim().split(/\s+/).length < 2)) throw new Error(`${game} narration has a word-sized clip: ${source}`);
  parts.forEach((part) => corpora[game].add(part));
};
let arithmeticQuestions = 0;
for (const game of ['addition', 'subtraction']) for (let chapter = 0; chapter < 3; chapter += 1) {
  for (const q of getCanonicalArithmeticQuestionPool(game, chapter)) {
    arithmeticQuestions += 1;
    for (const field of fields) add(game, q[field], arithmeticBatch4NarrationSegments(game, q, field));
  }
}
let timeQuestions = 0;
for (let chapter = 0; chapter < 3; chapter += 1) for (const q of getCanonicalTimeQuestionPool(chapter)) {
  timeQuestions += 1;
  for (const field of fields) add('time', q[field], timeNarrationSegments(q, field));
}
add('time', TIME_TELLER_NARRATION.lesson, timeNarrationSegments(TIME_TELLER_NARRATION.lesson));
let numberLineQuestions = 0;
for (let start = 0; start <= 10; start += 1) for (const direction of [1, -1]) {
  const maxHops = direction > 0 ? 10 - start : start;
  for (let hops = 1; hops <= maxHops; hops += 1) {
    const answer = start + direction * hops;
    const q = { type: 'hop', a: start, b: hops, direction, answer, prompt: `Start at ${start}. Hop ${hops} ${direction > 0 ? 'forward' : 'back'}. Where do you land?`, clue: 'Move one number for each hop.', explanation: `${start} ${direction > 0 ? '+' : '−'} ${hops} = ${answer}. The frog moved ${hops} hop${hops === 1 ? '' : 's'} and landed on ${answer}.` };
    numberLineQuestions += 1;
    for (const field of fields) add('numberLine', q[field], numberLineNarrationSegments(q, field));
  }
}
for (let start = 0; start < 20; start += 1) for (let hops = 1; start + hops <= 20; hops += 1) for (let missing = 0; missing <= 2; missing += 1) {
  const end = start + hops; const answer = [start, hops, end][missing];
  const q = { type: 'missing', start, hops, end, missing, answer, prompt: missing === 0 ? `? + ${hops} = ${end}. Which number is the start?` : missing === 1 ? `${start} + ? = ${end}. How many hops?` : `${start} + ${hops} = ?. Where do you land?`, clue: missing === 0 ? 'Start at the landing number and count back one space for each hop.' : missing === 1 ? 'Count the spaces from the starting number to the landing number.' : 'Start at the starting number and count forward one space for each hop.', explanation: `${start} + ${hops} = ${end}; the missing number is ${answer}.` };
  numberLineQuestions += 1;
  for (const field of fields) add('numberLine', q[field], numberLineNarrationSegments(q, field));
}
const pairs = [];
for (let start = 0; start < 20; start += 1) for (let hops = 1; start + hops <= 20; hops += 1) pairs.push({ start, hops, end: start + hops });
for (const compare of ['larger', 'farther']) for (const a of pairs) for (const b of pairs) {
  const valueA = compare === 'farther' ? a.hops : a.end; const valueB = compare === 'farther' ? b.hops : b.end;
  const answer = valueA === valueB ? 'same' : valueA > valueB ? 'A' : 'B';
  const prompt = `Which frog ${compare === 'farther' ? 'travelled farther' : 'landed on the larger number'}: A (${a.start} to ${a.end}) or B (${b.start} to ${b.end})?`;
  const q = { type: 'compare', compare, start1: a.start, hops1: a.hops, end1: a.end, start2: b.start, hops2: b.hops, end2: b.end, answer, prompt, clue: compare === 'farther' ? 'Compare how many spaces each frog moved.' : 'Compare the two landing numbers.', explanation: `A moved ${a.hops} spaces and landed on ${a.end}. B moved ${b.hops} spaces and landed on ${b.end}. ${answer === 'same' ? 'They are the same.' : `${answer} is ${compare === 'farther' ? 'farther' : 'larger'}.`}` };
  numberLineQuestions += 1;
  add('numberLine', numberLineNarrationText(q), numberLineNarrationSegments(q, 'prompt'));
  for (const field of ['clue', 'explanation']) add('numberLine', q[field], numberLineNarrationSegments(q, field));
}
const corpusByGame = Object.fromEntries(Object.entries(corpora).map(([game, values]) => [game, Object.freeze([...values].sort())]));
const uniqueTexts = [...new Set(Object.values(corpusByGame).flat())].sort();
const items = uniqueTexts.map((text) => { const key = voiceClipKey(text, 'en-US'); return Object.freeze({ text, key, path: `/audio/en/${key}-matilda.mp3` }); });
export const buildBatch4VoiceInventory = () => Object.freeze({
  coverage: Object.freeze({ arithmeticQuestions, timeQuestions, numberLineQuestions, timeChapters: 3, numberLineChapters: 3 }),
  corpusByGame: Object.freeze(corpusByGame),
  items: Object.freeze(items),
});
