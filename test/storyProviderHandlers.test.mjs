import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import imageHandler from '../api/story/image.js';
import outlineHandler from '../api/story/outline.js';
import { issueStorySession } from '../api/story/_utils.js';

const savedEnv = {};
for (const key of ['STORYBOOK_SESSION_SECRET', 'OPENROUTER_API_KEY', 'OPENROUTER_IMAGE_MODEL', 'OPENROUTER_IMAGE_FALLBACK_MODEL', 'OPENROUTER_STORY_MODEL', 'OPENROUTER_STORY_FALLBACK_MODEL']) {
  savedEnv[key] = process.env[key];
}
const originalFetch = globalThis.fetch;
let requestNumber = 0;

const mockEndpoints = (body) => {
  const request = new EventEmitter();
  request.aborted = false;
  request.method = 'POST';
  request.headers = { origin: 'http://localhost:5173', 'x-amari-story-session': issueStorySession() };
  request.socket = { remoteAddress: `mocked-handler-${++requestNumber}` };
  request.body = body;
  const response = new EventEmitter();
  response.headers = {};
  response.writableEnded = false;
  response.destroyed = false;
  response.statusCode = 200;
  response.setHeader = (name, value) => { response.headers[name] = value; };
  response.status = (status) => { response.statusCode = status; return response; };
  response.json = (value) => { response.body = value; response.writableEnded = true; response.emit('finish'); return response; };
  response.send = (value) => { response.body = value; response.writableEnded = true; response.emit('finish'); return response; };
  return { request, response };
};

const withMockEnvironment = async (operation) => {
  process.env.STORYBOOK_SESSION_SECRET = 'test-only-storybook-cancellation-secret';
  process.env.OPENROUTER_API_KEY = 'test-only-provider-key';
  process.env.OPENROUTER_IMAGE_MODEL = 'primary/test-model';
  process.env.OPENROUTER_IMAGE_FALLBACK_MODEL = 'fallback/test-model';
  process.env.OPENROUTER_STORY_MODEL = 'primary/test-model';
  process.env.OPENROUTER_STORY_FALLBACK_MODEL = 'fallback/test-model';
  try { await operation(); } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of Object.entries(savedEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
};

test('image handler aborts a pending provider body on disconnect and skips fallback and response writes', async () => {
  await withMockEnvironment(async () => {
    const { request, response } = mockEndpoints({ prompt: 'A friendly moon rover' });
    const calls = [];
    globalThis.fetch = async (_url, options) => {
      calls.push(options);
      return {
        ok: true,
        json: () => new Promise((resolve, reject) => {
          options.signal.addEventListener('abort', () => reject(options.signal.reason), { once: true });
        }),
      };
    };
    const running = imageHandler(request, response);
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(calls.length, 1, 'primary image request should be in progress');
    assert.equal(calls[0].signal.aborted, false);
    response.emit('close');
    await running;
    assert.equal(calls[0].signal.aborted, true);
    assert.equal(calls.length, 1, 'a disconnected primary request must not start fallback');
    assert.equal(response.headers['X-Amari-Provider-Attempts'], '1');
    assert.equal(response.body, undefined, 'a disconnected response must not be written');
    assert.equal(response.headers['Access-Control-Expose-Headers'].includes('X-Amari-Provider-Attempts'), true);
  });
});

test('image handler reports one primary provider attempt on success', async () => {
  await withMockEnvironment(async () => {
    const { request, response } = mockEndpoints({ prompt: 'A friendly moon rover' });
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      return { ok: true, json: async () => ({ data: [{ b64_json: 'YQ==', media_type: 'image/png' }] }) };
    };
    await imageHandler(request, response);
    assert.equal(calls, 1);
    assert.equal(response.statusCode, 200);
    assert.equal(response.headers['X-Amari-Provider-Attempts'], '1');
  });
});

test('outline fallback reuses the primary signal and remains inside its single request deadline', async () => {
  await withMockEnvironment(async () => {
    const { request, response } = mockEndpoints({ topic: 'A kind dinosaur', ageBand: '3-4', style: '3d' });
    const calls = [];
    const pages = Array.from({ length: 6 }, (_, index) => ({
      pageNumber: index + 1,
      text: 'A dinosaur walks through a sunny garden with a friend. They notice flowers, soft leaves, and a tiny path. Together they discover something new and share a moment.',
      imagePrompt: `A friendly dinosaur explores garden scene ${index + 1}`,
    }));
    const outline = { title: 'A Garden Discovery', summary: 'A dinosaur and a friend discover a garden together.', characters: [{ name: 'Dino', visualDescription: 'A green friendly dinosaur' }], coverPrompt: 'Dino in a garden', pages };
    globalThis.fetch = async (_url, options) => {
      calls.push(options);
      if (calls.length === 1) return { ok: false, status: 503 };
      return { ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify(outline) } }] }) };
    };
    await outlineHandler(request, response);
    assert.equal(calls.length, 2, 'one retryable failure should make one fallback request');
    assert.equal(response.headers['X-Amari-Provider-Attempts'], '2');
    assert.equal(calls[0].signal, calls[1].signal, 'primary and fallback must share one deadline signal');
    assert.equal(calls[0].signal.aborted, false);
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.title, outline.title);
  });
});
