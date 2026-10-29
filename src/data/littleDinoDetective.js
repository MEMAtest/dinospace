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
