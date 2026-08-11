import { OFFLINE_VOICE_MANIFEST } from './offlineVoiceManifest.js';
import { normalizeVoiceText, voiceClipKey } from './voiceKey.js';

export const getOfflineVoiceClip = (text, lang = 'en-US') => {
  const normalized = normalizeVoiceText(text);
  if (!normalized) return null;
  return OFFLINE_VOICE_MANIFEST[voiceClipKey(normalized, lang)] || null;
};
