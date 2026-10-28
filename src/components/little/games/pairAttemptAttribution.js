// Keep round reports honest: a wrong attempt affects firstAttempt, while a
// visible hint affects independent even if the child solves on the first try.
export const pairRoundAttribution = ({ mistakes = 0, hintExposed = false } = {}) => ({
  firstAttempt: mistakes === 0,
  independent: mistakes === 0 && !hintExposed,
  hints: hintExposed ? 1 : 0,
});
