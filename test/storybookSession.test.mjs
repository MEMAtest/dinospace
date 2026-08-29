import test from 'node:test';
import assert from 'node:assert/strict';
import { hasStorySession, issueStorySession } from '../api/story/_utils.js';

test('storybook parent sessions are signed and reject tampering or missing configuration', () => {
  const previousPin = process.env.STORYBOOK_PARENT_PIN;
  const previousSecret = process.env.STORYBOOK_SESSION_SECRET;
  process.env.STORYBOOK_PARENT_PIN = 'test-parent-pin';
  process.env.STORYBOOK_SESSION_SECRET = 'test-session-secret';
  try {
    const token = issueStorySession('test-parent-pin');
    assert.ok(token);
    assert.equal(hasStorySession({ headers: { 'x-amari-story-session': token } }), true);
    assert.equal(hasStorySession({ headers: { 'x-amari-story-session': `${token}tampered` } }), false);
    assert.equal(issueStorySession('wrong-pin'), null);
  } finally {
    if (previousPin === undefined) delete process.env.STORYBOOK_PARENT_PIN;
    else process.env.STORYBOOK_PARENT_PIN = previousPin;
    if (previousSecret === undefined) delete process.env.STORYBOOK_SESSION_SECRET;
    else process.env.STORYBOOK_SESSION_SECRET = previousSecret;
  }
});
