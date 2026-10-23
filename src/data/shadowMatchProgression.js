import { DINO_NAMES } from './littleGames.js';

// Scoped to Shadow Match: other dinosaur games keep their existing roster.
export const SHADOW_DINO_KINDS = Object.freeze([
  'trex', 'trike', 'stego', 'bronto', 'ptero', 'ankylo',
  'spino', 'para', 'allo', 'dillo', 'carno', 'cory',
]);
export const SHADOW_DINO_NAMES = Object.freeze({ ...DINO_NAMES,
  spino: 'Spinosaurus', para: 'Parasaurolophus', allo: 'Allosaurus',
  dillo: 'Dilophosaurus', carno: 'Carnotaurus', cory: 'Corythosaurus',
});
export const SHADOW_FACTS = Object.freeze({
  trex: 'T. rex had short arms and powerful jaws.',
  trike: 'Triceratops had three horns and a large bony frill.',
  stego: 'Stegosaurus had bony plates along its back. Their exact purpose is still being studied.',
  bronto: 'Brachiosaurus had front legs longer than its back legs.',
  ptero: 'Pterodactyl was a flying reptile, not a dinosaur.',
  ankylo: 'Ankylosaurus had bony armor and a heavy club at the end of its tail.',
  spino: 'Spinosaurus had a tall sail on its back. Scientists still study what it was for.',
  para: 'Parasaurolophus had a long hollow head crest. It may have helped make sounds.',
  allo: 'Allosaurus was a meat-eating dinosaur with small horns above its eyes.',
  dillo: 'Dilophosaurus had two bony crests on its head.',
  carno: 'Carnotaurus had two horns on top of its head and very small arms.',
  cory: 'Corythosaurus was a duck-billed dinosaur with a helmet-shaped head crest.',
});
// Reuse reviewed, already packaged recordings; no run-time provider fallback.
export const shadowSpokenLine = kind => kind === 'ptero' ? DINO_NAMES.ptero : SHADOW_FACTS[kind];
export const SHADOW_FEATURES = Object.freeze({
  trex: 'Look at the big head and tiny arms.', trike: 'Look at the three horns and wide frill.',
  stego: 'Look at the back plates and spiky tail.', bronto: 'Look at the long neck and four legs.',
  ptero: 'Look at the wide wings and pointed head.', ankylo: 'Look at the low body and tail club.',
  spino: 'Look at the sail and long narrow snout.', para: 'Look at the long backward head crest.',
  allo: 'Look at the brow ridges and longer arms.', dillo: 'Look at the two head crests.',
  carno: 'Look at the two horns and tiny arms.', cory: 'Look at the rounded helmet crest.',
});
const FAMILY = { trex: 'hunter', allo: 'hunter', carno: 'hunter', dillo: 'hunter', spino: 'hunter', para: 'duckbill', cory: 'duckbill', trike: 'armoured', stego: 'armoured', ankylo: 'armoured' };
const CLOSEST = { trex: ['allo', 'carno'], allo: ['trex', 'carno'], carno: ['allo', 'trex'], dillo: ['allo', 'carno'], spino: ['allo', 'dillo'], para: ['cory'], cory: ['para'], stego: ['ankylo'], ankylo: ['stego', 'trike'], trike: ['ankylo'] };
const shuffle = (items, random) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy;
};
export const shadowSimilarKinds = (target, kinds) => kinds.filter(kind => kind !== target && FAMILY[target] && FAMILY[kind] === FAMILY[target]);

export const makeShadowChoices = (target, kinds, count, similar = false, random = Math.random) => {
  const preferred = (CLOSEST[target] || []).filter(kind => kinds.includes(kind));
  const close = similar ? shuffle(preferred.length ? preferred : shadowSimilarKinds(target, kinds), random).slice(0, 1) : [];
  const remaining = shuffle(kinds.filter(kind => kind !== target && !close.includes(kind)), random);
  return shuffle([target, ...close, ...remaining.slice(0, count - 1 - close.length)], random);
};

export const createShadowTargetQueue = (config, previous, random = Math.random) => {
  const kinds = SHADOW_DINO_KINDS.slice(0, config.kinds);
  // Each newly introduced creature is a target in this run, not just a decoy.
  const introduced = kinds.slice(config.previousKinds || 0);
  let pool = [...shuffle(introduced, random), ...shuffle(kinds.filter(kind => !introduced.includes(kind)), random)];
  const queue = [];
  while (queue.length < config.choices.length) {
    if (!pool.length) pool = shuffle(kinds, random);
    let index = pool.findIndex(kind => kind !== (queue.at(-1) || previous));
    if (index < 0) index = 0;
    queue.push(pool.splice(index, 1)[0]);
  }
  return queue;
};
