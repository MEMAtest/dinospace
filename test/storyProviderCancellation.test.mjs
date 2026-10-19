import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createStoryProviderSignal, isStoryProviderCancelled } from '../api/story/_utils.js';

const endpoints = () => {
  const request = new EventEmitter();
  request.aborted = false;
  const response = new EventEmitter();
  response.writableEnded = false;
  response.destroyed = false;
  return { request, response };
};

test('provider signal aborts for an explicitly aborted request', () => {
  const { request, response } = endpoints();
  const provider = createStoryProviderSignal(request, response, 1000);
  request.emit('aborted');
  assert.equal(provider.signal.aborted, true);
  assert.equal(provider.clientDisconnected(), true);
  assert.equal(isStoryProviderCancelled(new Error('fetch aborted'), provider.signal), true);
  provider.cleanup();
});

test('provider signal treats early response close as disconnect, not normal finish', () => {
  const early = endpoints();
  const interrupted = createStoryProviderSignal(early.request, early.response, 1000);
  early.response.emit('close');
  assert.equal(interrupted.signal.aborted, true);
  assert.equal(interrupted.clientDisconnected(), true);
  interrupted.cleanup();

  const finished = endpoints();
  const completed = createStoryProviderSignal(finished.request, finished.response, 1000);
  finished.response.writableEnded = true;
  finished.response.emit('finish');
  finished.response.emit('close');
  assert.equal(completed.signal.aborted, false);
  assert.equal(completed.clientDisconnected(), false);
  assert.equal(finished.response.listenerCount('close'), 0);
});

test('provider signal keeps a bounded timeout until the route consumes its response body', async () => {
  const { request, response } = endpoints();
  const provider = createStoryProviderSignal(request, response, 15);
  // The route retains this same signal while awaiting response.json(), text(),
  // or arrayBuffer(); the deadline therefore covers body consumption too.
  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.equal(provider.signal.aborted, true);
  assert.equal(provider.clientDisconnected(), false);
  assert.equal(isStoryProviderCancelled(Object.assign(new Error('timed out'), { name: 'TimeoutError' }), provider.signal), true);
  provider.cleanup();
});
