import test from 'node:test';
import assert from 'node:assert/strict';
import { withStoryRequestTimeout } from '../src/data/storybookRequest.js';

test('story request timeout aborts work and rejects within its bound', async () => {
  let aborted = false;
  await assert.rejects(
    withStoryRequestTimeout((signal) => new Promise(() => signal.addEventListener('abort', () => { aborted = true; })), {
      timeoutMs: 10,
      label: 'Outline',
    }),
    (error) => error.name === 'TimeoutError' && /Outline/.test(error.message),
  );
  assert.equal(aborted, true);
});

test('story request caller cancellation is forwarded and remains an abort', async () => {
  const controller = new AbortController();
  const pending = withStoryRequestTimeout((signal) => new Promise((_, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('cancelled', 'AbortError')));
  }), { signal: controller.signal, timeoutMs: 1000 });
  controller.abort();
  await assert.rejects(pending, (error) => error.name === 'AbortError');
});

test('the same request deadline covers delayed response body parsing', async () => {
  let signalWasAborted = false;
  const pending = withStoryRequestTimeout(async (signal) => {
    const response = { json: () => new Promise(() => signal.addEventListener('abort', () => { signalWasAborted = true; })) };
    return response.json();
  }, { timeoutMs: 10, label: 'Story outline' });
  await assert.rejects(pending, (error) => error.name === 'TimeoutError');
  assert.equal(signalWasAborted, true);
});
