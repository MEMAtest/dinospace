import test from 'node:test';
import assert from 'node:assert/strict';
import { applyCors, hasStorySession, isAllowedOrigin, issueStorySession } from '../api/story/_utils.js';

test('storybook sessions require no PIN, remain signed and reject tampering', () => {
  const previousSecret = process.env.STORYBOOK_SESSION_SECRET;
  process.env.STORYBOOK_SESSION_SECRET = 'test-session-secret';
  try {
    const token = issueStorySession();
    assert.ok(token);
    assert.equal(hasStorySession({ headers: { 'x-amari-story-session': token } }), true);
    assert.equal(hasStorySession({ headers: { 'x-amari-story-session': `${token}tampered` } }), false);
  } finally {
    if (previousSecret === undefined) delete process.env.STORYBOOK_SESSION_SECRET;
    else process.env.STORYBOOK_SESSION_SECRET = previousSecret;
  }
});

test('storybook service accepts the opaque Android WebView origin but rejects arbitrary sites', () => {
  assert.equal(isAllowedOrigin({ headers: { origin: 'null' } }), true);
  assert.equal(isAllowedOrigin({ headers: { origin: 'https://untrusted.example' } }), false);
});

test('opaque Android WebView preflight receives the required CORS headers', () => {
  const headers = new Map();
  applyCors(
    { method: 'OPTIONS', headers: { origin: 'null' } },
    { setHeader: (key, value) => headers.set(key, value) },
  );
  assert.equal(headers.get('Access-Control-Allow-Origin'), 'null');
  assert.match(headers.get('Access-Control-Allow-Methods'), /POST/);
  assert.match(headers.get('Access-Control-Allow-Headers'), /X-Amari-Story-Session/);
});
