export const STORYBOOK_AGE_BANDS = Object.freeze(['3-4', '5-6', '7-8']);
export const STORYBOOK_STYLES = Object.freeze(['3d', 'painted-2d', 'realistic']);
export const MAX_STORY_TOPIC_LENGTH = 500;

export const wordCount = (value) => String(value || '').trim().split(/\s+/).filter(Boolean).length;

export const wordsForAgeBand = (ageBand) => ({
  '3-4': { min: 12, max: 28 },
  '5-6': { min: 20, max: 40 },
  '7-8': { min: 35, max: 60 },
}[ageBand] || { min: 20, max: 40 });

export const validateStoryOutline = (outline, { ageBand = '5-6', expectedPageCount = 10 } = {}) => {
  if (!outline || typeof outline !== 'object') throw new Error('Story outline must be an object');
  if (typeof outline.title !== 'string' || !outline.title.trim() || outline.title.length > 120) throw new Error('Story title is invalid');
  if (typeof outline.summary !== 'string' || !outline.summary.trim() || outline.summary.length > 600) throw new Error('Story summary is invalid');
  if (!Array.isArray(outline.characters) || outline.characters.length < 1 || outline.characters.length > 5) throw new Error('Story characters are invalid');
  if (!Array.isArray(outline.pages) || outline.pages.length !== expectedPageCount) throw new Error(`Story must contain exactly ${expectedPageCount} pages`);
  const range = wordsForAgeBand(ageBand);
  outline.pages.forEach((page, index) => {
    if (!page || page.pageNumber !== index + 1) throw new Error(`Page ${index + 1} has an invalid number`);
    if (typeof page.text !== 'string' || wordCount(page.text) < range.min || wordCount(page.text) > range.max) {
      throw new Error(`Page ${index + 1} must contain ${range.min}-${range.max} words`);
    }
    if (typeof page.imagePrompt !== 'string' || !page.imagePrompt.trim() || page.imagePrompt.length > 5000) throw new Error(`Page ${index + 1} image prompt is invalid`);
  });
  return outline;
};

export const validateStoryRequest = ({ topic, ageBand, style }) => {
  if (typeof topic !== 'string' || !topic.trim() || topic.length > MAX_STORY_TOPIC_LENGTH) throw new Error('Topic must be between 1 and 500 characters');
  if (!STORYBOOK_AGE_BANDS.includes(ageBand)) throw new Error('Age band is invalid');
  if (!STORYBOOK_STYLES.includes(style)) throw new Error('Visual style is invalid');
  return { topic: topic.trim(), ageBand, style };
};

