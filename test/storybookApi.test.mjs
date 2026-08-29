import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveStoryApiBase } from '../src/data/storybookApi.js';

test('storybook API uses the hosted endpoint inside packaged Android shells', () => {
  assert.equal(
    resolveStoryApiBase('', { origin: 'http://localhost', protocol: 'http:' }),
    'https://dinospace-eight.vercel.app/api/story',
  );
  assert.equal(
    resolveStoryApiBase('', { origin: 'https://localhost', protocol: 'https:' }),
    'https://dinospace-eight.vercel.app/api/story',
  );
  assert.equal(
    resolveStoryApiBase('', { origin: 'capacitor://localhost', protocol: 'capacitor:' }),
    'https://dinospace-eight.vercel.app/api/story',
  );
});

test('storybook API remains same-origin on the web and honours explicit configuration', () => {
  assert.equal(
    resolveStoryApiBase('', { origin: 'https://dinospace-eight.vercel.app', protocol: 'https:' }),
    '/api/story',
  );
  assert.equal(
    resolveStoryApiBase('https://example.test/api/story/', { origin: 'http://localhost', protocol: 'http:' }),
    'https://example.test/api/story',
  );
});
