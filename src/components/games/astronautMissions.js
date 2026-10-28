export const ASTRONAUT_MISSION_GROUPS = [
  { id: 'launch-lab', title: 'Launch Lab', eyebrow: 'MISSION 01 · START HERE', description: 'Observe patterns, explain what you notice, and apply your ideas to numbers, shapes and your body.', categoryIds: ['numbers', 'shapes', 'body'], recommended: true },
  { id: 'earth-life', title: 'Earth & Life', eyebrow: 'MISSION 02', description: 'Observe animals and dinosaurs, explain what makes them different, and apply your clues.', categoryIds: ['animals', 'dinosaurs'] },
  { id: 'space-explorers', title: 'Space Explorers', eyebrow: 'MISSION 03', description: 'Observe our solar system and space pioneers, explain a discovery, then apply it.', categoryIds: ['space', 'heroes'] },
];

const LEARNING_FACTS = {
  'How many fingers on one hand?': 'Most people have five fingers on each hand, including the thumb.', 'How many days in a week?': 'A week has seven days, from Monday through Sunday.', 'How many legs does a spider have?': 'Spiders are arachnids, and adult spiders have eight legs.', 'How many wheels on a car?': 'Most everyday cars have four wheels touching the road.', 'How many months in a year?': 'A year is divided into twelve months.', 'How many eyes do you have?': 'People usually have two eyes that work together to help us see.',
  'Which shape has 3 sides?': 'A triangle has three straight sides and three corners.', 'Which shape is round?': 'A circle is round and has no straight sides or corners.', 'Which shape has 4 equal sides?': 'A square has four equal sides and four right-angle corners.', 'A football is shaped like a...': 'A sphere is round in every direction, like a ball.', 'What shape is a dice?': 'A standard die is a cube with six square faces.', 'Which shape has 5 points?': 'A five-pointed star has five points around its outline.',
  'Which animal is the King of the Jungle?': 'The lion is sometimes called “king of the jungle”, but lions usually live in grasslands.', 'Which animal has a long trunk?': 'An elephant uses its trunk to smell, breathe, drink and pick things up.', 'Which animal says "Moo"?': 'Cows are grown-up female cattle; their familiar call is a moo.', 'Which animal can fly?': 'Eagles are birds. Their large wings help them soar on air currents.', 'Which is the tallest animal?': 'A giraffe’s long neck helps it reach leaves high in trees.', 'Which animal lives in the sea?': 'Dolphins are mammals that breathe air at the surface and live in water.', 'Which animal is the fastest on land?': 'Cheetahs can sprint faster than other land animals over short distances.',
  'What organ pumps blood around your body?': 'The heart is a strong muscle that pumps blood around the body.', 'What do you use to breathe?': 'Your lungs take oxygen from the air when you breathe in.', 'What do you think with?': 'The brain helps you think, remember, feel and control your body.', 'What covers your whole body?': 'Skin protects your body and helps you feel touch, heat and cold.', 'What helps you chew food?': 'Teeth bite and chew food into smaller pieces.', 'What do you use to hear sounds?': 'Your ears collect sound and send signals to your brain.',
  'What is the closest star to Earth?': 'The Sun is a star. It looks bigger and brighter because it is much closer than other stars.', 'How many planets in our solar system?': 'There are eight planets orbiting the Sun in our solar system.', 'What planet are we on?': 'Earth is the planet where people, animals and plants live.', 'Which planet has beautiful rings?': 'Saturn’s rings are made mostly of pieces of ice and rock.', 'What do astronauts wear in space?': 'A spacesuit supplies air and helps protect an astronaut in space.', 'Which planet is called the Red Planet?': 'Mars looks rusty red because iron-rich dust covers much of its surface.', 'What pulls things down to the ground?': 'Gravity is a force that pulls objects toward Earth.',
  'Which dinosaur had tiny arms?': 'Tyrannosaurus rex had two very small arms and two powerful legs.', 'Which dinosaur had 3 horns?': 'Triceratops had three horns on its head and a large bony frill.', 'Which dinosaur had plates on its back?': 'Stegosaurus had rows of large plates along its back.', 'Which prehistoric reptile could fly?': 'Pterosaurs were flying reptiles; they were not dinosaurs.', 'What did dinosaurs hatch from?': 'Dinosaurs hatched from eggs, just as many animals do today.', 'Are non-bird dinosaurs still alive today?': 'Non-bird dinosaurs are extinct, but modern birds are living dinosaur relatives.',
};

const TRANSFER_PROJECTS = Object.freeze({
  'launch-lab': { questionId: 'shapes:1', id: 'rocket-window', name: 'Rocket window', prompt: 'Choose a round shape for the rocket window, then place it in the frame.', actionLabel: 'Place in rocket window', slotLabel: 'Window shape' },
  'earth-life': { questionId: 'animals:5', id: 'sea-research-map', name: 'Sea-life map', prompt: 'Choose the sea animal for the research map, then place it on the map.', actionLabel: 'Place on research map', slotLabel: 'Map animal' },
  'space-explorers': { questionId: 'space:4', id: 'moonwalk-kit', name: 'Moonwalk kit', prompt: 'Choose the gear astronauts wear in space, then pack it in the moonwalk kit.', actionLabel: 'Pack in moonwalk kit', slotLabel: 'Kit gear' },
});

const shuffle = (items, random) => {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i -= 1) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
};

export function createSeededRandom(seed) {
  let state = (Number(seed) >>> 0) || 1;
  return () => { state = (state + 0x6D2B79F5) >>> 0; let value = state; value = Math.imul(value ^ (value >>> 15), value | 1); value ^= value + Math.imul(value ^ (value >>> 7), value | 61); return ((value ^ (value >>> 14)) >>> 0) / 4294967296; };
}

export function createAstronautSeed() {
  let value;
  try {
    const values = new Uint32Array(1);
    if (globalThis.crypto?.getRandomValues) { globalThis.crypto.getRandomValues(values); value = values[0]; }
    else value = Math.floor(Math.random() * 0x100000000);
  } catch { value = Math.floor(Math.random() * 0x100000000); }
  return value || 1;
}

export function buildAstronautMissions(categories) {
  const byId = new Map(categories.map((category) => [category.id, category]));
  return ASTRONAUT_MISSION_GROUPS.map((mission) => ({ ...mission, questions: mission.categoryIds.flatMap((categoryId) => {
    const category = byId.get(categoryId);
    return (category?.items ?? []).map((question, index) => ({ ...question, sourceCategory: category, questionId: `${category.id}:${index}`, conceptId: `${category.id}:${index}`, learningFact: LEARNING_FACTS[question.q] ?? null }));
  }), transferProject: TRANSFER_PROJECTS[mission.id] }));
}

export function createAstronautRun(mission, previousQuestionIds = [], random = Math.random, missedQuestionIds = []) {
  const previous = new Set(previousQuestionIds);
  const missed = new Set(missedQuestionIds);
  const categoryCount = mission.categoryIds.length;
  const targets = Object.fromEntries(mission.categoryIds.map((id) => [id, 6 / categoryCount]));
  const project = mission.questions.find((question) => question.questionId === mission.transferProject?.questionId);
  // This authored transfer task intentionally returns as the final task on replay; the other five rotate around recent history.
  if (project) targets[project.sourceCategory.id] -= 1;
  const selected = project ? [project] : [];
  for (const categoryId of mission.categoryIds) {
    const pool = mission.questions.filter((q) => q.sourceCategory.id === categoryId);
    const target = targets[categoryId];
    if (!target) continue;
    const projectId = project?.questionId;
    const unusedPool = pool.filter((q) => q.questionId !== projectId);
    const review = shuffle(unusedPool.filter((q) => missed.has(q.conceptId)), random);
    const recentFree = shuffle(unusedPool.filter((q) => !previous.has(q.questionId) && !missed.has(q.conceptId)), random);
    const usedInRun = new Set(selected.map((q) => q.questionId));
    const pickedReview = review.filter((q) => !usedInRun.has(q.questionId)).slice(0, target);
    selected.push(...pickedReview);
    const remaining = target - pickedReview.length;
    const pickedFresh = recentFree.filter((q) => !usedInRun.has(q.questionId) && !pickedReview.some((r) => r.questionId === q.questionId)).slice(0, remaining);
    selected.push(...pickedFresh);
    if (pickedFresh.length + pickedReview.length < target) {
      const taken = new Set(selected.map((q) => q.questionId));
      // Once the wider recent window is exhausted, return to the oldest seen
      // questions before repeating the immediately preceding mission.
      const fallback = shuffle(unusedPool.filter((q) => !taken.has(q.questionId)), random)
        .sort((a, b) => previousQuestionIds.indexOf(a.questionId) - previousQuestionIds.indexOf(b.questionId));
      selected.push(...fallback.slice(0, target - pickedFresh.length - pickedReview.length));
    }
  }
  const projectQuestion = selected.find((question) => question.questionId === project?.questionId);
  const ordinaryQuestions = shuffle(selected.filter((question) => question !== projectQuestion), random);
  return [...ordinaryQuestions, ...(projectQuestion ? [{ ...projectQuestion, transferProject: mission.transferProject }] : [])];
}

export function createAstronautOptions(question, difficulty, random = Math.random) {
  if (!question) return [];
  if (difficulty === 'starter') {
    const answer = question.options.filter((option) => option.text === question.answer);
    return shuffle(answer.concat(shuffle(question.options.filter((option) => option.text !== question.answer), random).slice(0, 2)), random);
  }
  return shuffle(question.options, random);
}
