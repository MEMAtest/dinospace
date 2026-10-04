import { arithmeticNarrationSegments } from './arithmeticAdventure.js';
import { timeLabel } from './timeLineAdventure.js';

export const TIME_TELLER_NARRATION = Object.freeze({
  lesson: 'The short red hand shows the hour. The long blue hand shows the minutes. The hour hand moves between numbers.',
});

export const arithmeticBatch4NarrationSegments = (game, question, field = 'prompt') =>
  arithmeticNarrationSegments(question && typeof question === 'object' ? { ...question, game } : question, field);

export const timeNarrationSegments = (question, field = 'prompt') => {
  if (typeof question === 'string') return question === TIME_TELLER_NARRATION.lesson ? [question] : [];
  if (!question || typeof question !== 'object') return [];
  const { prompt, target, routine, type } = question;
  const minute = target?.minute;
  const handPosition = minute === 0 ? '12' : minute === 15 ? '3' : minute === 30 ? '6' : '9';
  const hourPosition = minute ? 'moving between numbers' : 'on the hour number';
  let chunks;
  if (field === 'clue') chunks = [question.clue];
  else if (field === 'explanation' && target) chunks = [`${timeLabel(target)} means the minute hand points to ${handPosition},`, `and the hour hand is ${hourPosition}.${routine ? ` This routine is in the ${routine[1]}.` : ''}`];
  else if (field === 'prompt' && type === 'set' && routine) chunks = [`Set the clock to ${timeLabel(target)},`, `${routine[0]} time in the ${routine[1]}.`];
  else if (field === 'prompt' && routine) chunks = [`It is the ${routine[1]} and ${routine[0]} is happening.`, 'What time is shown on the clock?'];
  else chunks = [prompt];
  return chunks.every((text) => typeof text === 'string') && chunks.join(' ') === question[field] ? chunks : [];
};

export const numberLineNarrationSegments = (question, field = 'prompt') => {
  if (!question || typeof question !== 'object') return [];
  const { type } = question;
  let chunks;
  if (field === 'clue') chunks = [question.clue];
  else if (field === 'explanation' && type === 'hop') chunks = [`${question.a} ${question.direction > 0 ? '+' : '−'} ${question.b} = ${question.answer}.`, `The frog moved ${question.b} hop${question.b === 1 ? '' : 's'} and landed on ${question.answer}.`];
  else if (field === 'explanation' && type === 'missing') chunks = [`${question.start} + ${question.hops} = ${question.end};`, `the missing number is ${question.answer}.`];
  else if (field === 'explanation' && type === 'compare') chunks = [`A moved ${question.hops1} space${question.hops1 === 1 ? '' : 's'} and landed on ${question.end1}.`, `B moved ${question.hops2} space${question.hops2 === 1 ? '' : 's'} and landed on ${question.end2}.`, question.answer === 'same' ? 'They are the same.' : `${question.answer} is ${question.compare === 'farther' ? 'farther' : 'larger'}.`];
  else if (field === 'prompt' && type === 'hop') chunks = [`Start at ${question.a}.`, `Hop ${question.b} ${question.direction > 0 ? 'forward' : 'back'}.`, 'Where do you land?'];
  else if (field === 'prompt' && type === 'missing') chunks = [`${question.prompt.split('. ')[0]}.`, question.prompt.slice(question.prompt.indexOf('. ') + 2)];
  else if (field === 'prompt' && type === 'compare') chunks = ['Compare the journeys.', `Frog A starts at ${question.start1} and lands on ${question.end1}.`, `Frog B starts at ${question.start2} and lands on ${question.end2}.`, question.compare === 'farther' ? 'Which frog travelled farther?' : 'Which frog landed on the larger number?'];
  else return [];
  const exactText = field === 'prompt' && type === 'compare'
    ? chunks.join(' ')
    : question[field];
  return chunks.every((text) => typeof text === 'string') && chunks.join(' ') === exactText ? chunks : [];
};

export const numberLineNarrationText = (question) => question?.type === 'compare'
  ? numberLineNarrationSegments(question).join(' ')
  : question?.prompt || '';
