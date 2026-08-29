/* global Buffer, process */

import { allowRequest, applyCors, clientId, hasStorySession, isAllowedOrigin, parseBody, respondJson } from './_utils.js';

const MAX_TEXT = 420;

export default async function handler(request, response) {
  applyCors(request, response);
  if (!isAllowedOrigin(request)) return respondJson(response, 403, { error: 'Story narration is only available inside Amari Discovery' });
  if (request.method === 'OPTIONS') return response.status(204).end();
  if (!hasStorySession(request)) return respondJson(response, 401, { error: 'A parent session is required' });
  if (request.method !== 'POST') { response.setHeader('Allow', 'POST'); return respondJson(response, 405, { error: 'Method not allowed' }); }
  if (!allowRequest(clientId(request))) return respondJson(response, 429, { error: 'Please try story creation again shortly' });
  const body = parseBody(request.body);
  const text = typeof body.text === 'string' ? body.text.replace(/\s+/g, ' ').trim() : '';
  const previousText = typeof body.previousText === 'string' ? body.previousText.slice(0, MAX_TEXT) : '';
  const nextText = typeof body.nextText === 'string' ? body.nextText.slice(0, MAX_TEXT) : '';
  if (!text || text.length > MAX_TEXT) return respondJson(response, 400, { error: 'Narration text must be between 1 and 420 characters' });
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_STORY_VOICE_ID || process.env.ELEVENLABS_ENGLISH_VOICE_ID || process.env.ELEVENLABS_VOICE_ID;
  if (!apiKey || !voiceId) return respondJson(response, 503, { error: 'Story narration is not configured' });
  try {
    const url = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`);
    url.searchParams.set('output_format', 'mp3_44100_128');
    const providerResponse = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey }, signal: AbortSignal.timeout(90_000),
      body: JSON.stringify({ text, model_id: process.env.ELEVENLABS_STORY_MODEL_ID || 'eleven_v3', ...(process.env.ELEVENLABS_STORY_MODEL_ID === 'eleven_multilingual_v2' ? { previous_text: previousText || undefined, next_text: nextText || undefined } : {}), voice_settings: { stability: 0.44, similarity_boost: 0.78, style: 0.12, use_speaker_boost: true, speed: 0.93 } }),
    });
    if (!providerResponse.ok) return respondJson(response, 502, { error: 'Narration provider is temporarily unavailable' });
    const audio = Buffer.from(await providerResponse.arrayBuffer());
    if (!audio.length) return respondJson(response, 502, { error: 'Narration provider returned no audio' });
    response.setHeader('Content-Type', 'audio/mpeg'); response.setHeader('Content-Length', String(audio.length)); response.setHeader('Cache-Control', 'private, no-store'); response.setHeader('X-Amari-Voice-Provider', 'elevenlabs');
    return response.status(200).send(audio);
  } catch { return respondJson(response, 502, { error: 'Narration could not be created. Please retry this page.' }); }
}
