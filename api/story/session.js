/* global process */

import { allowRequest, applyCors, clientId, issueStorySession, isAllowedOrigin, parseBody, respondJson } from './_utils.js';

export default async function handler(request, response) {
  applyCors(request, response);
  if (!isAllowedOrigin(request)) return respondJson(response, 403, { error: 'Story creation is only available inside Amari Discovery' });
  if (request.method === 'OPTIONS') return response.status(204).end();
  if (request.method !== 'POST') { response.setHeader('Allow', 'POST'); return respondJson(response, 405, { error: 'Method not allowed' }); }
  if (!allowRequest(clientId(request))) return respondJson(response, 429, { error: 'Please try again shortly' });
  const body = parseBody(request.body);
  const token = issueStorySession(body.parentPin);
  if (!process.env.STORYBOOK_PARENT_PIN || !process.env.STORYBOOK_SESSION_SECRET) return respondJson(response, 503, { error: 'Parent access is not configured' });
  if (!token) return respondJson(response, 403, { error: 'That parent PIN is not correct' });
  return respondJson(response, 200, { session: token, expiresIn: 1800 });
}
