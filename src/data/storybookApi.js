import { pagesForAgeBand, validateStoryOutline, validateStoryRequest } from './storybookValidation.js';

const HOSTED_STORY_API = 'https://dinospace-eight.vercel.app/api/story';

export const resolveStoryApiBase = (configuredBase) => {
  if (configuredBase) return configuredBase.replace(/\/$/, '');
  // Keep this endpoint explicit for every build.  A relative `/api/story` URL
  // is correct in a fresh web tab but resolves to an unavailable local server
  // in some installed/PWA shells and can leave a stale client reporting 404.
  return HOSTED_STORY_API;
};

export const STORY_API_BASE = resolveStoryApiBase(
  import.meta.env?.VITE_STORY_API_URL,
  typeof window === 'undefined' ? undefined : window.location,
);

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
  return validateStoryOutline(outline, { ageBand: validated.ageBand, expectedPageCount: pagesForAgeBand(validated.ageBand) });
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
