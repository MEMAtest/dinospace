const normalize = (text) => String(text || '').replace(/\s+/g, ' ').trim().toLowerCase();

const ENGLISH_CLIPS = {
  'welcome amari! your next learning adventure is ready.': '/audio/en/welcome-amari-matilda.mp3',
  'hello explorer! your next learning adventure is ready.': '/audio/en/hello-explorer-matilda.mp3',
  'trace the circle. follow the glowing flight path.': '/audio/en/sky-circle-matilda.mp3',
  'trace the square. follow the glowing flight path.': '/audio/en/sky-square-matilda.mp3',
  'trace the triangle. follow the glowing flight path.': '/audio/en/sky-triangle-matilda.mp3',
  'trace the diamond. follow the glowing flight path.': '/audio/en/sky-diamond-matilda.mp3',
  'trace the star. follow the glowing flight path.': '/audio/en/sky-star-matilda.mp3',
  'trace the heart. follow the glowing flight path.': '/audio/en/sky-heart-matilda.mp3',
  'all six shapes are complete. you are a sky shape superstar!': '/audio/en/sky-complete-matilda.mp3',
};

export const getOfflineVoiceClip = (text, lang = 'en-US') => {
  if (!String(lang).toLowerCase().startsWith('en')) return null;
  return ENGLISH_CLIPS[normalize(text)] || null;
};
