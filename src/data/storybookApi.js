import { validateStoryOutline, validateStoryRequest } from './storybookValidation.js';

const configuredBase = import.meta.env.VITE_STORY_API_URL || '/api/story';
export const STORY_API_BASE = configuredBase.replace(/\/$/, '');

const request = async (path, body, options = {}) => {
  const response = await fetch(`${STORY_API_BASE}/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(options.session ? { 'X-Amari-Story-Session': options.session } : {}), ...(options.headers || {}) }, body: JSON.stringify(body), signal: options.signal,
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try { message = (await response.json()).error || message; } catch { /* retain status */ }
    throw new Error(message);
  }
  return response;
};

export const createStorySession = async (signal) => {
  const response = await request('session', {}, { signal });
  const body = await response.json();
  if (!body.session) throw new Error('Parent session could not be created');
  return body.session;
};

export const createStoryOutline = async (input, session, signal) => {
  const validated = validateStoryRequest(input);
  const response = await request('outline', validated, { session, signal });
  const outline = await response.json();
  return validateStoryOutline(outline, { ageBand: validated.ageBand });
};

export const createStoryImage = async ({ prompt, referenceImage }, session, signal) => {
  const response = await request('image', { prompt, referenceImage }, { session, signal });
  if (response.headers.get('x-amari-image-provider') !== 'openrouter') {
    throw new Error('Illustration provider could not be verified');
  }
  const blob = await response.blob();
  if (!blob.size) throw new Error('Illustration returned no data');
  return blob;
};

export const createStoryNarration = async ({ text, previousText, nextText }, session, signal) => {
  const response = await request('narration', { text, previousText, nextText }, { session, signal });
  if (response.headers.get('x-amari-voice-provider') !== 'elevenlabs') {
    throw new Error('Narration provider could not be verified');
  }
  const blob = await response.blob();
  if (!blob.size) throw new Error('Narration returned no data');
  return blob;
};
