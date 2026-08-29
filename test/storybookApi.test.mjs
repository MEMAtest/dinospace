import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveStoryApiBase } from '../src/data/storybookApi.js';

test('storybook API uses the hosted endpoint when no explicit route is provided', () => {
  assert.equal(
    resolveStoryApiBase(''),
    'https://dinospace-eight.vercel.app/api/story',
  );
  assert.equal(
    resolveStoryApiBase(''),
    'https://dinospace-eight.vercel.app/api/story',
  );
  assert.equal(
    resolveStoryApiBase(''),
    'https://dinospace-eight.vercel.app/api/story',
  );
});

test('storybook API honours explicit configuration', () => {
  assert.equal(
    resolveStoryApiBase(''),
    'https://dinospace-eight.vercel.app/api/story',
  );
  assert.equal(
    resolveStoryApiBase('https://example.test/api/story/'),
    'https://example.test/api/story',
  );
});
