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
  '🥤': 'drink', '🌽': 'corn', '👨‍🚀': 'astronaut in a white suit', '🧑‍🚀': 'astronaut waving', '🌍': 'Earth',
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

export function memoryCardLabel(emoji, levelId) {
  return CONTEXTUAL_LABELS[levelId]?.[emoji] || MEMORY_CARD_LABELS[emoji] || 'unlabelled card';
}
