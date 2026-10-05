export const batch5AttemptMetrics = (hadWrongAttempt, hintCount = 0) => {
  const firstAttempt = !hadWrongAttempt;
  return { firstAttempt, independent: firstAttempt && hintCount === 0 };
};
