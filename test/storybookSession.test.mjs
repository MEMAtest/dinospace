import test from 'node:test';
import assert from 'node:assert/strict';
import { hasStorySession, issueStorySession } from '../api/story/_utils.js';

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
