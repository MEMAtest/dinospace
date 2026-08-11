const normalize = (text) => String(text || '').replace(/\s+/g, ' ').trim().toLowerCase();

const ENGLISH_CLIPS = {
  'welcome amari! your next learning adventure is ready.': '/audio/en/welcome-amari.mp3',
  'hello explorer! your next learning adventure is ready.': '/audio/en/hello-explorer.mp3',
  'trace the circle. follow the glowing flight path.': '/audio/en/sky-circle.mp3',
  'trace the square. follow the glowing flight path.': '/audio/en/sky-square.mp3',
  'trace the triangle. follow the glowing flight path.': '/audio/en/sky-triangle.mp3',
  'trace the diamond. follow the glowing flight path.': '/audio/en/sky-diamond.mp3',
  'trace the star. follow the glowing flight path.': '/audio/en/sky-star.mp3',
  'trace the heart. follow the glowing flight path.': '/audio/en/sky-heart.mp3',
  'all six shapes are complete. you are a sky shape superstar!': '/audio/en/sky-complete.mp3',
};

export const getOfflineVoiceClip = (text, lang = 'en-US') => {
  if (!String(lang).toLowerCase().startsWith('en')) return null;
  return ENGLISH_CLIPS[normalize(text)] || null;
};

