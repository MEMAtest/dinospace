export const littleDinoTrailStrength = (config, clearerTrail = false) => (
  clearerTrail && config?.trail !== 'bright' ? 'bright' : config?.trail || 'bright'
);

export const littleDinoCanAskForClearerTrail = (config, clearerTrail = false) => (
  Boolean(config && config.trail !== 'bright' && !clearerTrail)
);

// Inspecting the footprint is the required baseline mechanic. Only an
// optional clearer-trail action is counted as assistance.
export const littleDinoAttribution = ({ wrongAttempts = 0, optionalClues = 0 } = {}) => ({
  firstAttempt: wrongAttempts === 0,
  independent: wrongAttempts === 0 && optionalClues === 0,
  hints: optionalClues,
});

export const DETECTIVE_HABITATS = Object.freeze({
  forest: { name: 'Fern Forest', cover: 'leaves', mark: '🌿' },
  river: { name: 'Waterfall River', cover: 'reeds', mark: '🌾', art: 'jigsaw-lake-v1' },
  canyon: { name: 'Red Rock Canyon', cover: 'rocks', mark: '🪨', art: 'jigsaw-canyon-v1' },
});

// Interleave the three habitats so a short run still visits each one.
export const DETECTIVE_ROSTER = Object.freeze([
  { id: 'trike', habitat: 'forest' },
  { id: 'spino', habitat: 'river', name: 'Spinosaurus' },
  { id: 'trex', habitat: 'canyon' },
  { id: 'stego', habitat: 'forest' },
  { id: 'bronto', habitat: 'river' },
  { id: 'ptero', habitat: 'canyon' },
  { id: 'ankylo', habitat: 'forest' },
  { id: 'cory', habitat: 'river', name: 'Corythosaurus' },
  { id: 'dillo', habitat: 'canyon', name: 'Dilophosaurus' },
  { id: 'para', habitat: 'forest', name: 'Parasaurolophus' },
  { id: 'allo', habitat: 'river', name: 'Allosaurus' },
  { id: 'carno', habitat: 'canyon', name: 'Carnotaurus' },
]);

const FEATURE_CLUES = [
  { feature: 'three horns', answer: 'trike', other: 'stego' },
  { feature: 'a sail on its back', answer: 'spino', other: 'trex' },
  { feature: 'plates on its back', answer: 'stego', other: 'bronto' },
  { feature: 'a club tail', answer: 'ankylo', other: 'trike' },
  { feature: 'a long neck', answer: 'bronto', other: 'spino' },
  { feature: 'wings', answer: 'ptero', other: 'ankylo' },
];

export function detectiveFieldActivities(speciesIndex, round, spotCount) {
  const tracks = 1 + (round % (spotCount === 2 ? 3 : 4));
  const otherCount = tracks === 4 ? 3 : tracks + 1;
  const clue = FEATURE_CLUES[speciesIndex % FEATURE_CLUES.length];
  const ordered = (first, second) => (Math.floor(speciesIndex / 2) + round) % 2 ? [second, first] : [first, second];
  return {
    tracks,
    counts: ordered(tracks, otherCount),
    clue,
    pictures: ordered(clue.answer, clue.other),
  };
}
