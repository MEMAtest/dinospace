/* global Buffer, process */

const MAX_TEXT_LENGTH = 420;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 45;
const requestBuckets = new Map();
const ALLOWED_APP_ORIGINS = new Set([
  'https://dinospace-eight.vercel.app',
  'https://dinospace-memas-projects-23a0001d.vercel.app',
  'https://dinospace-git-main-memas-projects-23a0001d.vercel.app',
  'http://localhost',
  'https://localhost',
  'capacitor://localhost',
]);

const applyCors = (request, response) => {
  const origin = request.headers.origin;
  if (origin && ALLOWED_APP_ORIGINS.has(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
};

const getClientId = (request) => {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim();
  return request.socket?.remoteAddress || 'unknown';
};

const canGenerateVoice = (clientId) => {
  const now = Date.now();
  const current = requestBuckets.get(clientId);
  if (!current || now - current.startedAt >= RATE_LIMIT_WINDOW_MS) {
    requestBuckets.set(clientId, { startedAt: now, count: 1 });
    return true;
  }
  if (current.count >= MAX_REQUESTS_PER_WINDOW) return false;
  current.count += 1;
  return true;
};

const respondJson = (response, status, body) => {
  response.setHeader('Cache-Control', 'no-store');
  response.status(status).json(body);
};

export default async function handler(request, response) {
  applyCors(request, response);
  if (request.method === 'OPTIONS') {
    response.status(204).end();
    return;
  }

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    respondJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const requestedLanguage = payloadLanguage(request.body);
  const voiceId = requestedLanguage === 'de'
    ? (process.env.ELEVENLABS_GERMAN_VOICE_ID || process.env.ELEVENLABS_VOICE_ID)
    : process.env.ELEVENLABS_VOICE_ID;
  if (!apiKey || !voiceId) {
    response.status(204).end();
    return;
  }

  const clientId = getClientId(request);
  if (!canGenerateVoice(clientId)) {
    respondJson(response, 429, { error: 'Please try the voice again shortly' });
    return;
  }

  let payload = request.body;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch {
      respondJson(response, 400, { error: 'Invalid request' });
      return;
    }
  }

  const rawText = typeof payload?.text === 'string' ? payload.text : '';
  const text = rawText
    .split('')
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text || text.length > MAX_TEXT_LENGTH) {
    respondJson(response, 400, { error: 'Voice text must be between 1 and 420 characters' });
    return;
  }

  try {
    const url = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`);
    url.searchParams.set('output_format', 'mp3_44100_128');
    const providerResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2',
      }),
    });

    if (!providerResponse.ok) {
      respondJson(response, 502, { error: 'Premium voice is temporarily unavailable' });
      return;
    }

    const audio = Buffer.from(await providerResponse.arrayBuffer());
    if (!audio.length) {
      respondJson(response, 502, { error: 'Premium voice returned no audio' });
      return;
    }

    response.setHeader('Content-Type', providerResponse.headers.get('content-type') || 'audio/mpeg');
    response.setHeader('Content-Length', String(audio.length));
    response.setHeader('Cache-Control', 'private, no-store');
    response.setHeader('X-Amari-Voice-Provider', 'elevenlabs');
    response.status(200).send(audio);
  } catch {
    respondJson(response, 502, { error: 'Premium voice is temporarily unavailable' });
  }
}

function payloadLanguage(rawPayload) {
  let payload = rawPayload;
  if (typeof payload === 'string') {
    try { payload = JSON.parse(payload); } catch { return 'en'; }
  }
  return typeof payload?.language === 'string' ? payload.language.toLowerCase().split('-')[0] : 'en';
}
