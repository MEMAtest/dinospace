import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/voice.js';

test('voice rate limit reports remaining cooldown and never calls provider after exhaustion', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.ELEVENLABS_API_KEY;
  const originalVoice = process.env.ELEVENLABS_ENGLISH_VOICE_ID;
  let providerCalls = 0;
  const response = () => ({
    headers: {},
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; },
    send(body) { this.body = body; },
    end() {},
  });
  process.env.ELEVENLABS_API_KEY = 'unit-test-only';
  process.env.ELEVENLABS_ENGLISH_VOICE_ID = 'unit-test-only';
  globalThis.fetch = async () => {
    providerCalls += 1;
    return new Response(new Uint8Array(1200), { headers: { 'content-type': 'audio/mpeg' } });
  };
  const request = {
    method: 'POST',
    headers: { origin: 'https://dinospace-eight.vercel.app', 'x-forwarded-for': 'unit-rate-limit-client' },
    body: { text: 'A unit test line.', language: 'en' },
  };
  try {
    for (let index = 0; index < 45; index += 1) {
      const result = response();
      await handler(request, result);
      assert.equal(result.statusCode, 200);
    }
    const limited = response();
    await handler(request, limited);
    assert.equal(limited.statusCode, 429);
    const seconds = Number(limited.headers['retry-after']);
    assert.ok(seconds >= 1 && seconds <= 300);
    assert.match(limited.headers['access-control-expose-headers'], /Retry-After/);
    assert.equal(providerCalls, 45);
    assert.equal(limited.headers['cache-control'], 'no-store');
    const repeat = response();
    await handler(request, repeat);
    assert.equal(repeat.statusCode, 429);
    assert.equal(providerCalls, 45);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.ELEVENLABS_API_KEY;
    else process.env.ELEVENLABS_API_KEY = originalKey;
    if (originalVoice === undefined) delete process.env.ELEVENLABS_ENGLISH_VOICE_ID;
    else process.env.ELEVENLABS_ENGLISH_VOICE_ID = originalVoice;
  }
});
