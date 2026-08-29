/* global Buffer, process */

import { allowRequest, applyCors, clientId, hasStorySession, isAllowedOrigin, parseBody, respondJson, validImageReference } from './_utils.js';

const imageWithModel = async (model, provider, prompt, referenceImage, apiKey) => {
  const payload = { model, prompt, n: 1, resolution: '2K', aspect_ratio: '4:3', provider: { only: [provider], allow_fallbacks: false } };
  if (referenceImage) payload.input_references = [{ type: 'image_url', image_url: { url: referenceImage } }];
  const result = await fetch('https://openrouter.ai/api/v1/images', {
    method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://dinospace-eight.vercel.app', 'X-Title': 'Amari Discovery Storybook Studio' },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(120_000),
  });
  if (!result.ok) throw new Error('Image provider failed');
  const body = await result.json();
  const encoded = body.data?.[0]?.b64_json;
  if (!encoded) throw new Error('Image provider returned no image');
  return { bytes: Buffer.from(encoded, 'base64'), mediaType: body.data[0].media_type || 'image/png', model };
};

export default async function handler(request, response) {
  applyCors(request, response);
  if (!isAllowedOrigin(request)) return respondJson(response, 403, { error: 'Story images are only available inside Amari Discovery' });
  if (request.method === 'OPTIONS') return response.status(204).end();
  if (!hasStorySession(request)) return respondJson(response, 401, { error: 'A parent session is required' });
  if (request.method !== 'POST') { response.setHeader('Allow', 'POST'); return respondJson(response, 405, { error: 'Method not allowed' }); }
  if (!allowRequest(clientId(request))) return respondJson(response, 429, { error: 'Please try story creation again shortly' });
  const body = parseBody(request.body);
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  const referenceImage = body.referenceImage || '';
  if (!prompt || prompt.length > 8000 || (referenceImage && !validImageReference(referenceImage))) return respondJson(response, 400, { error: 'Image request is invalid' });
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return respondJson(response, 503, { error: 'Story images are not configured' });
  try {
    const primary = process.env.OPENROUTER_IMAGE_MODEL || 'bytedance-seed/seedream-5-0-lite';
    let image;
    try { image = await imageWithModel(primary, 'seed', prompt, referenceImage, apiKey); } catch {
      image = await imageWithModel(process.env.OPENROUTER_IMAGE_FALLBACK_MODEL || 'qwen/qwen-image-3', 'alibaba', prompt, referenceImage, apiKey);
    }
    response.setHeader('Cache-Control', 'private, no-store');
    response.setHeader('Content-Type', image.mediaType);
    response.setHeader('Content-Length', String(image.bytes.length));
    response.setHeader('X-Amari-Image-Provider', 'openrouter');
    response.setHeader('X-Amari-Image-Model', image.model);
    return response.status(200).send(image.bytes);
  } catch { return respondJson(response, 502, { error: 'Illustration could not be created. Please retry this page.' }); }
}
