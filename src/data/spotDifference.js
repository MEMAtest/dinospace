// Paired-scene specifications for Spot the Difference. The changed objects are
// rendered as part of Picture B; they are not answer markers, so children must
// compare the two scenes rather than hunt for a pre-drawn target.
export const SPOT_DIFFERENCE_ROUNDS = Object.freeze({
  starter: Object.freeze({
    id: 'superhero-city-starter',
    title: 'Superhero City',
    foundLabel: 'Find 2 changes',
    differences: Object.freeze([
      { id: 'tower-flag', label: 'the flag on the tower', x: 22.4, y: 8.2, hitRadius: 7, normalVisual: 'flag-normal', visual: 'flag' },
      { id: 'hero-badge', label: 'the standing hero badge', x: 36.6, y: 52.2, hitRadius: 8, normalVisual: 'heart', visual: 'star' },
    ]),
  }),
  growing: Object.freeze({
    id: 'superhero-city-growing',
    title: 'Superhero City',
    foundLabel: 'Find 3 changes',
    differences: Object.freeze([
      { id: 'tower-bolt', label: 'the tower ornament', x: 22.4, y: 8.2, hitRadius: 7, normalVisual: 'star', visual: 'bolt' },
      { id: 'hero-badge', label: 'the standing hero badge', x: 36.6, y: 52.2, hitRadius: 8, normalVisual: 'heart', visual: 'star' },
      { id: 'flying-mask', label: 'the flying hero mask', x: 59.6, y: 17.2, hitRadius: 8, normalVisual: 'mask-normal', visual: 'mask' },
    ]),
  }),
  challenge: Object.freeze({
    id: 'superhero-city-challenge',
    title: 'Superhero City',
    foundLabel: 'Find 4 changes',
    differences: Object.freeze([
      { id: 'tower-bolt', label: 'the tower ornament', x: 22.4, y: 8.2, hitRadius: 7, normalVisual: 'star', visual: 'bolt' },
      { id: 'hero-badge', label: 'the standing hero badge', x: 36.6, y: 52.2, hitRadius: 8, normalVisual: 'heart', visual: 'star' },
      { id: 'flying-mask', label: 'the flying hero mask', x: 59.6, y: 17.2, hitRadius: 8, normalVisual: 'mask-normal', visual: 'mask' },
      { id: 'window-moon', label: 'the moon in the window', x: 83, y: 71, hitRadius: 9, normalVisual: 'sun', visual: 'moon' },
    ]),
  }),
});

export const spotRoundForDifficulty = (difficulty = 'starter') =>
  SPOT_DIFFERENCE_ROUNDS[difficulty] || SPOT_DIFFERENCE_ROUNDS.starter;
