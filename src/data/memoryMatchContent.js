export const MEMORY_CARD_LABELS = Object.freeze({
  '🐶': 'dog', '🐱': 'cat', '🦊': 'fox', '🐸': 'frog', '🐵': 'monkey', '🦄': 'unicorn',
  '🐙': 'octopus', '🐳': 'whale', '🐬': 'dolphin', '🦈': 'shark', '🐢': 'turtle', '🪼': 'jellyfish',
  '🦀': 'crab', '🦑': 'squid', '🐟': 'fish', '🚀': 'rocket', '🛸': 'flying saucer', '🌟': 'glowing star',
  '🌙': 'moon', '🌑': 'new moon', '🌕': 'full moon', '🪐': 'ringed planet', '☄️': 'comet', '⭐️': 'star',
  '☀️': 'Sun', '🌞': 'Sun with a face',
  '🛰️': 'satellite', '👽': 'alien', '🌌': 'galaxy', '🎈': 'balloon', '🎉': 'party popper', '🥳': 'party face',
  '🎂': 'cake', '🍭': 'lolly', '🍩': 'doughnut', '🧁': 'cupcake', '🍓': 'strawberry', '🍕': 'pizza',
  '🍟': 'chips', '🍉': 'watermelon', '🍬': 'sweet', '🦕': 'long-neck dinosaur', '🦖': 'T-rex', '🦴': 'bone',
  '🌋': 'volcano', '🥚': 'egg', '🪨': 'rock', '🌿': 'leaf', '🚗': 'car', '✈️': 'aeroplane',
  '🚂': 'steam train', '🚆': 'passenger train', '🚁': 'helicopter', '🏎️': 'racing car', '🚒': 'fire engine',
  '🚤': 'speedboat', '🛵': 'scooter', '🚲': 'bicycle', '🚌': 'bus', '🚜': 'tractor', '🚦': 'traffic light',
  '🍎': 'apple', '🍌': 'banana', '🍇': 'grapes', '🥕': 'carrot', '🧀': 'cheese', '🍪': 'biscuit',
  '🥤': 'drink', '🌽': 'corn', '👨‍🚀': 'suited astronaut', '🧑‍🚀': 'waving astronaut', '🌍': 'Earth',
  '🔭': 'telescope', '🌠': 'shooting star', '🐾': 'dinosaur footprints', '🪺': 'dinosaur nest',
  '🦷': 'tooth', '⛏️': 'fossil dig pick', '🌳': 'tree', '🌱': 'seedling', '⛰️': 'mountain',
  '🦆': 'duck', '🪷': 'water lily', '🐌': 'snail', '🐝': 'bee', '🦋': 'butterfly', '🐞': 'ladybird',
  '🐛': 'caterpillar', '🪱': 'worm', '🐜': 'ant', '🕷️': 'spider', '🌷': 'tulip', '🍄': 'mushroom',
  '🐮': 'cow', '🐷': 'pig', '🔴': 'red circle', '🔵': 'blue circle', '🟡': 'yellow circle', '🟢': 'green circle',
});

const CONTEXTUAL_LABELS = Object.freeze({
  dinos: { '🪨': 'fossil dig rock', '🦷': 'dinosaur tooth' },
  garden: { '🐟': 'pond fish' },
  astronaut: { '🪨': 'moon rock' },
  'cosmic-challenge': { '🪨': 'moon rock' },
});

// Only art with a confirmed semantic match is listed here. Similar cards keep
// their own art token or remain clearly named emoji until matching artwork is
// available.
export const MEMORY_CARD_ILLUSTRATIONS = Object.freeze({
  '🐶': Object.freeze({ asset: 'memory-match/dog-v1.webp' }),
  '🦊': Object.freeze({ asset: 'memory-match/fox-v1.webp' }),
  '🎈': Object.freeze({ asset: 'memory-match/party-balloon-v1-card.webp' }),
  '🎉': Object.freeze({ asset: 'memory-match/party-popper-v1-card.webp' }),
  '🎂': Object.freeze({ asset: 'memory-match/party-cake-v1-card.webp' }),
  '🍬': Object.freeze({ asset: 'memory-match/wrapped-sweet-v1-card.webp' }),
  '🥕': Object.freeze({ asset: 'memory-match/food-carrot-v1-card.webp' }),
  '🌽': Object.freeze({ asset: 'memory-match/food-corn-v1-card.webp' }),
  '🍪': Object.freeze({ asset: 'memory-match/food-biscuit-v1-card.webp' }),
  '🧀': Object.freeze({ asset: 'memory-match/food-cheese-v1-card.webp' }),
  '🥚': Object.freeze({ asset: 'memory-match/dinosaur-egg-v1.webp' }),
  '🌋': Object.freeze({ asset: 'memory-match/volcano-v1.webp' }),
  '🪐': Object.freeze({ asset: 'memory-match/ringed-planet-v1-card.webp' }),
  '🌙': Object.freeze({ asset: 'memory-match/crescent-moon-v1-card.webp' }),
  '☄️': Object.freeze({ asset: 'memory-match/comet-v1-card.webp' }),
  '🛰️': Object.freeze({ asset: 'memory-match/satellite-v1-card.webp' }),
  '🌍': Object.freeze({ asset: 'memory-match/earth-v1-card.webp' }),
  '🌕': Object.freeze({ asset: 'memory-match/full-moon-v1-card.webp' }),
  '🌑': Object.freeze({ asset: 'memory-match/new-moon-v1-card.webp' }),
  '☀️': Object.freeze({ asset: 'memory-match/sun-v1-card.webp' }),
  '🌱': Object.freeze({ asset: 'memory-match/seedling-v1-card.webp' }),
  '🌳': Object.freeze({ asset: 'memory-match/tree-v1-card.webp' }),
  '🌿': Object.freeze({ asset: 'memory-match/leaf-sprig-v1-card.webp' }),
  '🍄': Object.freeze({ asset: 'memory-match/mushroom-v1-card.webp' }),
  '🦕': Object.freeze({ asset: 'little/detective-bronto.webp' }),
  '🦖': Object.freeze({ asset: 'little/detective-trex.webp' }),
  '🚀': Object.freeze({ asset: 'little/fuel-rocket.webp' }),
  '🚒': Object.freeze({ asset: 'little/rescue-firetruck.webp' }),
  '🚗': Object.freeze({ asset: 'german-garage/friendly-car.png' }),
  '🐵': Object.freeze({ asset: 'memory-match/isolated-monkey-v1-card.webp' }),
  '🐸': Object.freeze({ asset: 'memory-match/isolated-frog-v1-card.webp' }),
  '🐳': Object.freeze({ asset: 'memory-match/whale-v1-card.webp', className: 'memory-card-art-image memory-card-art-ocean' }),
  '🐬': Object.freeze({ asset: 'memory-match/dolphin-v1-card.webp', className: 'memory-card-art-image memory-card-art-ocean memory-card-art-dolphin' }),
  '🦈': Object.freeze({ asset: 'memory-match/shark-v1-card.webp', className: 'memory-card-art-image memory-card-art-ocean' }),
  '🐢': Object.freeze({ asset: 'memory-match/turtle-v1-card.webp', className: 'memory-card-art-image memory-card-art-ocean' }),
  '🍎': Object.freeze({ asset: 'memory-match/apple-v1-card.webp' }),
  '🍌': Object.freeze({ asset: 'memory-match/banana-v1-card.webp' }),
  '🍇': Object.freeze({ asset: 'memory-match/grapes-v1-card.webp' }),
  '🍉': Object.freeze({ asset: 'memory-match/watermelon-v1-card.webp' }),
  '🛸': Object.freeze({ asset: 'memory-match/flying-saucer-v1-card.webp' }),
  '👽': Object.freeze({ asset: 'memory-match/alien-v1-card.webp' }),
  '🌌': Object.freeze({ asset: 'memory-match/galaxy-v1-card.webp' }),
  '🔭': Object.freeze({ asset: 'memory-match/telescope-v1-card.webp' }),
  '⭐️': Object.freeze({ asset: 'memory-match/star-v1-card.webp' }),
  '🌟': Object.freeze({ asset: 'memory-match/glowing-star-v1-card.webp' }),
  '🌠': Object.freeze({ asset: 'memory-match/shooting-star-v1-card.webp' }),
  '🌞': Object.freeze({ asset: 'memory-match/sun-face-v1-card.webp' }),
  '✈️': Object.freeze({ asset: 'memory-match/aeroplane-v1-card.webp' }),
  '🚁': Object.freeze({ asset: 'memory-match/helicopter-v1-card.webp' }),
  '🚂': Object.freeze({ asset: 'memory-match/steam-train-v1-card.webp' }),
  '🚆': Object.freeze({ asset: 'memory-match/passenger-train-v1-card.webp' }),
  '🍓': Object.freeze({ asset: 'memory-match/strawberry-v1-card.webp' }),
  '🍕': Object.freeze({ asset: 'memory-match/pizza-v1-card.webp' }),
  '🍩': Object.freeze({ asset: 'memory-match/doughnut-v1-card.webp' }),
  '🧁': Object.freeze({ asset: 'memory-match/cupcake-v1-card.webp' }),
  '👨‍🚀': Object.freeze({ asset: 'memory-match/astronaut-amari-v1-card.webp' }),
  '🦴': Object.freeze({ asset: 'memory-match/fossil-bone-v1-card.webp' }),
  '🦷': Object.freeze({ asset: 'memory-match/dinosaur-tooth-v1-card.webp' }),
  '⛏️': Object.freeze({ asset: 'memory-match/fossil-dig-pick-v1-card.webp' }),
  '🐝': Object.freeze({ asset: 'memory-match/garden-bee-v1-card.webp' }),
  '🦋': Object.freeze({ asset: 'memory-match/garden-butterfly-v1-card.webp' }),
  '🐞': Object.freeze({ asset: 'memory-match/garden-ladybird-v1-card.webp' }),
  '🐌': Object.freeze({ asset: 'memory-match/garden-snail-v1-card.webp' }),
  '🐛': Object.freeze({ asset: 'memory-match/garden-caterpillar-v1-card.webp' }),
  '🪱': Object.freeze({ asset: 'memory-match/garden-earthworm-v1-card.webp' }),
  '🐜': Object.freeze({ asset: 'memory-match/garden-ant-v1-card.webp' }),
  '🕷️': Object.freeze({ asset: 'memory-match/garden-spider-v1-card.webp' }),
  '🚌': Object.freeze({ asset: 'memory-match/bus-v1-card.webp' }),
  '🚜': Object.freeze({ asset: 'memory-match/tractor-v1-card.webp' }),
  '🚲': Object.freeze({ asset: 'memory-match/bicycle-v1-card.webp' }),
  '🛵': Object.freeze({ asset: 'memory-match/scooter-v1-card.webp' }),
});

// Keep context-specific illustrations scoped to their board so one symbol can
// represent different real-world objects without showing misleading art.
export const MEMORY_CARD_CONTEXT_ILLUSTRATIONS = Object.freeze({
  dinos: Object.freeze({
    '🪨': Object.freeze({ asset: 'memory-match/fossil-rock-v1-card.webp' }),
  }),
  ocean: Object.freeze({
    '🐟': Object.freeze({ asset: 'memory-match/ocean-fish-v1-card.webp', className: 'memory-card-art-image memory-card-art-ocean' }),
    '🪼': Object.freeze({ asset: 'memory-match/jellyfish-v1-card.webp', className: 'memory-card-art-image memory-card-art-ocean' }),
    '🦀': Object.freeze({ asset: 'memory-match/crab-v1-card.webp', className: 'memory-card-art-image memory-card-art-ocean' }),
    '🦑': Object.freeze({ asset: 'memory-match/squid-v1-card.webp', className: 'memory-card-art-image memory-card-art-ocean' }),
  }),
  garden: Object.freeze({
    '🐟': Object.freeze({ asset: 'memory-match/pond-fish-v1-card.webp', className: 'memory-card-art-image memory-card-art-ocean' }),
    '🐸': Object.freeze({ asset: 'memory-match/isolated-frog-v1-card.webp' }),
  }),
  astronaut: Object.freeze({
    '🪨': Object.freeze({ asset: 'memory-match/moon-rock-v1-card.webp' }),
  }),
  'cosmic-challenge': Object.freeze({
    '🪨': Object.freeze({ asset: 'memory-match/moon-rock-v1-card.webp' }),
  }),
});

export function memoryCardIllustration(emoji, levelId) {
  return MEMORY_CARD_CONTEXT_ILLUSTRATIONS[levelId]?.[emoji] || MEMORY_CARD_ILLUSTRATIONS[emoji] || null;
}

export function memoryCardLabel(emoji, levelId) {
  return CONTEXTUAL_LABELS[levelId]?.[emoji] || MEMORY_CARD_LABELS[emoji] || 'unlabelled card';
}

export const MEMORY_STRATEGY_LINES = Object.freeze([
  'Scan one row at a time. Say the picture and remember its place before turning another card.',
  'Group nearby cards in your mind. When a picture returns, recall the place where you saw its partner.',
  'Try recalling both places before you turn the second card. Keep the same board until every pair is found.',
]);

export function memoryNarrationLines(levels) {
  const cardLines = levels.flatMap((level) => [...new Set(level.emojis)].flatMap((emoji) => {
    const label = memoryCardLabel(emoji, level.id);
    return [`You found the ${label}. Remember where it is.`, `You matched the ${label} pair.`];
  }));
  return [...new Set([
    ...MEMORY_STRATEGY_LINES,
    ...cardLines,
    'Those pictures are different. Try to remember where each one is.',
    'You matched them all. Fantastic memory!',
  ])];
}

export function memoryIllustrationAudit(levels) {
  const usages = new Map();
  levels.forEach((level) => level.emojis.forEach((emoji) => {
    if (!usages.has(emoji)) usages.set(emoji, []);
    usages.get(emoji).push({
      levelId: level.id,
      label: memoryCardLabel(emoji, level.id),
      illustration: memoryCardIllustration(emoji, level.id),
    });
  }));
  return [...usages.entries()].map(([emoji, boards]) => {
    const globalIllustration = MEMORY_CARD_ILLUSTRATIONS[emoji] || null;
    const contextualIllustrations = boards.map(({ levelId, illustration }) => ({ levelId, ...illustration }));
    const contextComplete = contextualIllustrations.every(({ asset }) => Boolean(asset));
    return {
      emoji,
      labels: [...new Set(boards.map(({ label }) => label))],
      boards: boards.map(({ levelId }) => levelId),
      illustration: globalIllustration || (contextComplete ? { contexts: contextualIllustrations } : null),
      illustrationsByBoard: contextualIllustrations,
    };
  }).sort((a, b) => a.emoji.localeCompare(b.emoji));
}
