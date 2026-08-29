/* global process */

import { allowRequest, applyCors, clientId, issueStorySession, isAllowedOrigin, respondJson } from './_utils.js';

export default async function handler(request, response) {
  applyCors(request, response);
  if (!isAllowedOrigin(request)) return respondJson(response, 403, { error: 'Story creation is only available inside Amari Discovery' });
  // A small number of Android WebViews reject an otherwise-valid 204
  // preflight. A 200 empty response is accepted by modern and older clients.
  if (request.method === 'OPTIONS') return response.status(200).end();
  if (request.method !== 'POST') { response.setHeader('Allow', 'POST'); return respondJson(response, 405, { error: 'Method not allowed' }); }
  if (!allowRequest(clientId(request))) return respondJson(response, 429, { error: 'Please try again shortly' });
  const token = issueStorySession();
  if (!process.env.STORYBOOK_SESSION_SECRET || !token) return respondJson(response, 503, { error: 'Story creation is not configured' });
  return respondJson(response, 200, { session: token, expiresIn: 1800 });
}
