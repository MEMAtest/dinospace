export const ASTRONAUT_MISSION_GROUPS = [
  {
    id: 'launch-lab',
    title: 'Launch Lab',
    eyebrow: 'MISSION 01 · START HERE',
    description: 'Warm up with numbers, shapes and how your body works.',
    categoryIds: ['numbers', 'shapes', 'body'],
    recommended: true,
  },
  {
    id: 'earth-life',
    title: 'Earth & Life',
    eyebrow: 'MISSION 02',
    description: 'Meet amazing animals and discover the world of dinosaurs.',
    categoryIds: ['animals', 'dinosaurs'],
  },
  {
    id: 'space-explorers',
    title: 'Space Explorers',
    eyebrow: 'MISSION 03',
    description: 'Explore our solar system and meet real space pioneers.',
    categoryIds: ['space', 'heroes'],
  },
];

const LEARNING_FACTS = {
  'How many fingers on one hand?': 'Most people have five fingers on each hand, including the thumb.',
  'How many days in a week?': 'A week has seven days, from Monday through Sunday.',
  'How many legs does a spider have?': 'Spiders are arachnids, and adult spiders have eight legs.',
  'How many wheels on a car?': 'Most everyday cars have four wheels touching the road.',
  'How many months in a year?': 'A year is divided into twelve months.',
  'How many eyes do you have?': 'People usually have two eyes that work together to help us see.',
  'Which shape has 3 sides?': 'A triangle has three straight sides and three corners.',
  'Which shape is round?': 'A circle is round and has no straight sides or corners.',
  'Which shape has 4 equal sides?': 'A square has four equal sides and four right-angle corners.',
  'A football is shaped like a...': 'A sphere is round in every direction, like a ball.',
  'What shape is a dice?': 'A standard die is a cube with six square faces.',
  'Which shape has 5 points?': 'A five-pointed star has five points around its outline.',
  'Which animal is the King of the Jungle?': 'The lion is sometimes called “king of the jungle”, but lions usually live in grasslands.',
  'Which animal has a long trunk?': 'An elephant uses its trunk to smell, breathe, drink and pick things up.',
  'Which animal says "Moo"?': 'Cows are grown-up female cattle; their familiar call is a moo.',
  'Which animal can fly?': 'Eagles are birds. Their large wings help them soar on air currents.',
  'Which is the tallest animal?': 'A giraffe’s long neck helps it reach leaves high in trees.',
  'Which animal lives in the sea?': 'Dolphins are mammals that breathe air at the surface and live in water.',
  'Which animal is the fastest on land?': 'Cheetahs can sprint faster than other land animals over short distances.',
  'What organ pumps blood around your body?': 'The heart is a strong muscle that pumps blood around the body.',
  'What do you use to breathe?': 'Your lungs take oxygen from the air when you breathe in.',
  'What do you think with?': 'The brain helps you think, remember, feel and control your body.',
  'What covers your whole body?': 'Skin protects your body and helps you feel touch, heat and cold.',
  'What helps you chew food?': 'Teeth bite and chew food into smaller pieces.',
  'What do you use to hear sounds?': 'Your ears collect sound and send signals to your brain.',
  'What is the closest star to Earth?': 'The Sun is a star. It looks bigger and brighter because it is much closer than other stars.',
  'How many planets in our solar system?': 'There are eight planets orbiting the Sun in our solar system.',
  'What planet are we on?': 'Earth is the planet where people, animals and plants live.',
  'Which planet has beautiful rings?': 'Saturn’s rings are made mostly of pieces of ice and rock.',
  'What do astronauts wear in space?': 'A spacesuit supplies air and helps protect an astronaut in space.',
  'Which planet is called the Red Planet?': 'Mars looks rusty red because iron-rich dust covers much of its surface.',
  'What pulls things down to the ground?': 'Gravity is a force that pulls objects toward Earth.',
  'Which dinosaur had tiny arms?': 'Tyrannosaurus rex had two very small arms and two powerful legs.',
  'Which dinosaur had 3 horns?': 'Triceratops had three horns on its head and a large bony frill.',
  'Which dinosaur had plates on its back?': 'Stegosaurus had rows of large plates along its back.',
  'Which prehistoric reptile could fly?': 'Pterosaurs were flying reptiles; they were not dinosaurs.',
  'What did dinosaurs hatch from?': 'Dinosaurs hatched from eggs, just as many animals do today.',
  'Are non-bird dinosaurs still alive today?': 'Non-bird dinosaurs are extinct, but modern birds are living dinosaur relatives.',
};

function shuffled(items, random) {
  const result = items.slice();
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function buildAstronautMissions(categories) {
  const byId = new Map(categories.map((category) => [category.id, category]));

  return ASTRONAUT_MISSION_GROUPS.map((mission) => ({
    ...mission,
    questions: mission.categoryIds.flatMap((categoryId) => {
      const category = byId.get(categoryId);
      return (category?.items ?? []).map((question, index) => ({
        ...question,
        sourceCategory: category,
        questionId: `${category.id}:${index}`,
        learningFact: LEARNING_FACTS[question.q] ?? null,
      }));
    }),
  }));
}

export function createAstronautRun(mission, previousQuestionIds = [], random = Math.random) {
  const lastRun = new Set(previousQuestionIds);
  const categoryOrder = shuffled(mission.categoryIds, random);
  const baseCount = Math.floor(5 / categoryOrder.length);
  let remainder = 5 % categoryOrder.length;
  const selected = [];

  categoryOrder.forEach((categoryId) => {
    const categoryQuestions = mission.questions.filter((question) => question.sourceCategory.id === categoryId);
    const freshQuestions = shuffled(categoryQuestions.filter((question) => !lastRun.has(question.questionId)), random);
    const targetCount = baseCount + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    const availableQuestions = freshQuestions.length >= targetCount
      ? freshQuestions
      : shuffled(categoryQuestions, random);
    selected.push(...availableQuestions.slice(0, targetCount));
  });

  return shuffled(selected, random);
}

export function createAstronautOptions(question, difficulty, random = Math.random) {
  if (!question) return [];
  if (difficulty !== 'starter') return shuffled(question.options, random);
  const answer = question.options.filter((option) => option.text === question.answer);
  const distractors = shuffled(question.options.filter((option) => option.text !== question.answer), random).slice(0, 2);
  return shuffled(answer.concat(distractors), random);
}
