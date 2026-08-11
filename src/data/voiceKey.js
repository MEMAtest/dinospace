export const normalizeVoiceText = (text) => String(text || '').replace(/\s+/g, ' ').trim();

export const voiceClipKey = (text, lang = 'en-US') => {
  const input = `${String(lang).toLowerCase().split('-')[0]}:${normalizeVoiceText(text).toLowerCase()}`;
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
};
