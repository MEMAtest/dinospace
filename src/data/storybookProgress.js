const SAVED_ASSET_STEPS = new Set(['cover', 'image', 'narration']);

// Stage names describe the item currently being generated. Checklist completion
// instead follows persisted picture/recording counts, so starting narration
// for the cover cannot imply that every page illustration has been saved.
export const isStoryGenerationStepComplete = (step, progress = {}) => {
  const pageCount = Math.max(0, Number(progress.pageCount) || 0);
  const expectedAssets = pageCount + 1; // cover plus one asset for every page
  if (step === 'planning') return Boolean(progress.title) || SAVED_ASSET_STEPS.has(progress.stage) || progress.stage === 'complete';
  if (step === 'cover') return Number(progress.imagesReady || 0) >= 1;
  if (step === 'image') return Number(progress.imagesReady || 0) >= expectedAssets;
  if (step === 'narration') return Number(progress.audioReady || 0) >= expectedAssets;
  return false;
};
