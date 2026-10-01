import { normalizeVoiceText, voiceClipKey } from './voiceKey.js';
import { CURATED_STORYBOOK_LEARNING_BATCH1 } from './storybookCuratedBatch1.js';

const BUILT_IN_COMPREHENSION = {
  'rex-missing-moon-map': [
    { prompt: 'What had Rex lost?', answer: 'His star map', choices: ['His star map', 'His space boots', 'Pip the robot'], clue: 'Rex reached into his pocket, but it was empty.', why: 'Rex had lost the star map that showed the way home.' },
    { prompt: 'What clue did Pip spot?', answer: 'A sparkly corner by a crater', choices: ['A sparkly corner by a crater', 'A light inside the rocket', 'A trail of blue flowers'], clue: 'Pip saw something shiny near a big Moon crater.', why: 'Pip spotted a sparkly map corner near the crater.' },
    { prompt: 'How did Rex and Pip get the map back?', answer: 'They worked together', choices: ['They worked together', 'Rex reached alone', 'They waited for the wind'], clue: 'Rex used his strength and Pip used a gripper.', why: 'Rex held Pip safely out so Pip could catch the map corner.' },
  ],
  'luna-whispering-forest': [
    { prompt: 'Where did the whisper lead the friends?', answer: 'An old hollow tree', choices: ['An old hollow tree', 'A river bridge', 'A tall mountain'], clue: 'A soft blue light glowed from somewhere among the tree roots.', why: 'The friends followed the whisper to an ancient hollow tree.' },
    { prompt: 'What had trapped the wind sprite?', answer: 'A heavy branch', choices: ['A heavy branch', 'A glass jar', 'A pile of leaves'], clue: 'The sprite was under something that had fallen.', why: 'A heavy branch had fallen on the tiny wind sprite.' },
    { prompt: 'What happened after the friends freed the sprite?', answer: 'Flowers bloomed and leaves shimmered', choices: ['Flowers bloomed and leaves shimmered', 'The river dried up', 'The tree fell down'], clue: 'The sprite flew through the woods and left a lovely change behind.', why: 'The grateful sprite made flowers bloom and leaves shimmer.' },
  ],
  'nia-great-river-journey': [
    { prompt: 'What litter did Nia find by the river?', answer: 'An old sack and empty bottles', choices: ['An old sack and empty bottles', 'A broken boat and a net', 'A lost shoe and a hat'], clue: 'The rubbish was caught among the reeds.', why: 'Nia saw an old sack and empty bottles at the water’s edge.' },
    { prompt: 'Who would collect the litter?', answer: 'The park rangers', choices: ['The park rangers', 'The kingfishers', 'The elephant calves'], clue: 'Aunt Amara said to place it safely on dry ground.', why: 'The animals put the litter on dry ground for the park rangers.' },
    { prompt: 'Why did Nia want to keep the river clean?', answer: 'Many animals need its water', choices: ['Many animals need its water', 'Only elephants drink there', 'The river makes the stars shine'], clue: 'Nia met animals who lived by or drank from the river.', why: 'Hippos, kingfishers, buffalo and elephants all need clean water.' },
  ],
};

export const STORYBOOK_COMPREHENSION = {
  ...BUILT_IN_COMPREHENSION,
  ...Object.fromEntries(Object.entries(CURATED_STORYBOOK_LEARNING_BATCH1).map(([slug, book]) => [slug, book.comprehension])),
};

const BUILT_IN_WORD_HELP = {
  'rex-missing-moon-map': [['crater', 'a big bowl-shaped hole on the Moon'], ['gripper', 'a small hand or claw that can hold things'], ['crumpled', 'wrinkled from being bent or squeezed']],
  'luna-whispering-forest': [['hollow', 'an empty space inside a tree'], ['sprite', 'a tiny magical creature'], ['shimmer', 'to shine with a soft, moving light']],
  'nia-great-river-journey': [['shallows', 'the part of a river where the water is not deep'], ['litter', 'rubbish left where it does not belong'], ['ranger', 'a person who helps care for a park and its animals']],
};

export const STORYBOOK_WORD_HELP = {
  ...BUILT_IN_WORD_HELP,
  ...Object.fromEntries(Object.entries(CURATED_STORYBOOK_LEARNING_BATCH1).map(([slug, book]) => [
    slug,
    book.wordHelp.map(({ word, meaning }) => [word, meaning]),
  ])),
};

export const createComprehensionSeed = () => {
  try {
    if (globalThis.crypto?.getRandomValues) {
      return globalThis.crypto.getRandomValues(new Uint32Array(1))[0];
    }
  } catch {
    // Use the standard pseudorandom source in older or restricted browsers.
  }
  return Math.floor(Math.random() * 0x100000000);
};

export const createComprehensionRandom = (seed) => {
  let state = Number(seed) >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 0x100000000;
  };
};

export const shuffledComprehension = (slug, random = Math.random) => {
  const questions = (STORYBOOK_COMPREHENSION[slug] || []).map((item) => {
    const choices = [...item.choices];
    for (let index = choices.length - 1; index > 0; index -= 1) {
      const target = Math.floor(random() * (index + 1));
      [choices[index], choices[target]] = [choices[target], choices[index]];
    }
    return { ...item, choices };
  });
  for (let index = questions.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [questions[index], questions[target]] = [questions[target], questions[index]];
  }
  return questions;
};

const learningVoiceTexts = [...new Set([
  ...Object.values(STORYBOOK_COMPREHENSION).flatMap((questions) => questions.flatMap((question) => [
    question.prompt, ...question.choices, question.clue, question.why,
  ])),
  ...Object.values(STORYBOOK_WORD_HELP).flatMap((words) => words.map(([, meaning]) => meaning)),
].map(normalizeVoiceText).filter(Boolean))];

export const STORYBOOK_LEARNING_VOICE_CORPUS = learningVoiceTexts.map((text) => ({
  text,
  lang: 'en-US',
  key: voiceClipKey(text, 'en-US'),
})).sort((a, b) => a.key.localeCompare(b.key));
