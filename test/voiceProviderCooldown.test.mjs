import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import { getOfflineVoiceClip } from '../src/data/offlineVoice.js';
import {
  chooseVoiceSource,
  createVoiceProviderCooldown,
  getVoiceCooldownDuration,
  VOICE_429_COOLDOWN_MS,
  VOICE_MAX_COOLDOWN_MS,
  VOICE_TEMPORARY_COOLDOWN_MS,
} from '../src/data/voiceProviderCooldown.js';

test('429 cooldown honors Retry-After seconds and dates, with a bounded duration', () => {
  const now = Date.UTC(2026, 9, 2, 12, 0, 0);
  assert.equal(getVoiceCooldownDuration({ status: 429 }, now), VOICE_429_COOLDOWN_MS);
  assert.equal(getVoiceCooldownDuration({ status: 429, retryAfter: '12' }, now), 12_000);
  assert.equal(getVoiceCooldownDuration({ status: 429, retryAfter: new Date(now + 20_000).toUTCString() }, now), 20_000);
  assert.equal(getVoiceCooldownDuration({ status: 429, retryAfter: '900' }, now), VOICE_MAX_COOLDOWN_MS);
  assert.equal(getVoiceCooldownDuration({ status: 429, retryAfter: 'not-a-date' }, now), VOICE_429_COOLDOWN_MS);
});

test('temporary provider and network failures cool down; permanent client errors do not', () => {
  assert.equal(getVoiceCooldownDuration({ status: 503 }, 0), VOICE_TEMPORARY_COOLDOWN_MS);
  assert.equal(getVoiceCooldownDuration({ status: 0 }, 0), VOICE_TEMPORARY_COOLDOWN_MS);
  assert.equal(getVoiceCooldownDuration({ status: 204 }, 0), VOICE_TEMPORARY_COOLDOWN_MS);
  assert.equal(getVoiceCooldownDuration({ status: 400 }, 0), 0);
  assert.equal(getVoiceCooldownDuration({ status: 401 }, 0), 0);
});

test('cooldown reads actual Response status and Retry-After headers', () => {
  const now = 10_000;
  const responseDuration = (response) => getVoiceCooldownDuration({
    status: response.status,
    retryAfter: response.headers.get('Retry-After'),
  }, now);
  assert.equal(responseDuration(new Response('', { status: 429, headers: { 'Retry-After': '25' } })), 25_000);
  assert.equal(responseDuration(new Response('', { status: 503, headers: { 'Retry-After': '3' } })), 3_000);
  assert.equal(responseDuration(new Response(null, { status: 204, headers: { 'Retry-After': '30' } })), 30_000);
  assert.equal(responseDuration(new Response('', { status: 502 })), VOICE_TEMPORARY_COOLDOWN_MS);
  assert.equal(responseDuration(new Response('', { status: 400 })), 0);
});

test('session cooldown expires on the injected clock and never shortens an active limit', () => {
  let now = 10_000;
  const cooldown = createVoiceProviderCooldown(() => now);
  assert.equal(cooldown.isCoolingDown(), false);
  cooldown.recordFailure({ status: 429, retryAfter: '60' });
  assert.equal(cooldown.remainingMs(), 60_000);
  assert.equal(cooldown.reason, 'rate-limited');
  cooldown.recordFailure({ status: 503, retryAfter: '2' });
  assert.equal(cooldown.remainingMs(), 60_000);
  now += 59_999;
  assert.equal(cooldown.isCoolingDown(), true);
  now += 1;
  assert.equal(cooldown.isCoolingDown(), false);
  assert.equal(cooldown.remainingMs(), 0);
});

test('packaged and cached narration stay available during a provider cooldown', () => {
  assert.equal(chooseVoiceSource({ packagedClip: '/audio/en/fixed.mp3', premiumRequested: true, dynamicAvailable: true, coolingDown: true }), 'packaged');
  assert.equal(chooseVoiceSource({ premiumRequested: true, dynamicAvailable: true, cachedAudio: new Blob(['clip']), coolingDown: true }), 'cache');
  assert.equal(chooseVoiceSource({ premiumRequested: true, dynamicAvailable: true, coolingDown: true }), 'cooldown');
  assert.equal(chooseVoiceSource({ premiumRequested: true, dynamicAvailable: false, coolingDown: false }), 'unavailable');
});

test('useVoice stops repeat dynamic requests after 429 while still playing a packaged clip', async () => {
  const priorEnv = process.env.VITE_ELEVENLABS_ENABLED;
  const priorWindow = globalThis.window;
  const priorDocument = globalThis.document;
  const priorAudio = globalThis.Audio;
  process.env.VITE_ELEVENLABS_ENABLED = 'true';

  let requests = 0;
  const played = [];
  globalThis.window = {
    fetch: async () => {
      requests += 1;
      return new Response('', { status: 429, headers: { 'Retry-After': '60' } });
    },
    navigator: { onLine: true },
    localStorage: { removeItem() {}, setItem() {} },
    addEventListener() {},
  };
  globalThis.document = { addEventListener() {}, removeEventListener() {} };
  globalThis.Audio = class FakeAudio {
    constructor(src) { this.src = src; played.push(src); }
    play() { return Promise.resolve(); }
    pause() {}
  };

  const vite = await createServer({
    configFile: new URL('../vite.config.js', import.meta.url).pathname,
    mode: 'production',
    define: {
      'import.meta.env.DEV': 'false',
      'import.meta.env.VITE_ELEVENLABS_ENABLED': '"true"',
    },
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
    logLevel: 'error',
  });
  try {
    const [{ default: React }, { renderToString }, { useVoice }] = await Promise.all([
      import('react'),
      import('react-dom/server'),
      vite.ssrLoadModule('/src/hooks.js'),
    ]);
    let voice;
    const Capture = () => { voice = useVoice(true); return React.createElement('span'); };
    renderToString(React.createElement(Capture));

    voice.speak('A dynamic prompt that is not packaged.');
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(requests, 1);

    voice.speak('Another dynamic prompt that is not packaged.');
    assert.equal(requests, 1, 'cooldown must suppress the next missing-clip request');

    const packagedText = 'Welcome Amari! Your next learning adventure is ready.';
    assert.ok(getOfflineVoiceClip(packagedText));
    voice.speak(packagedText);
    assert.equal(requests, 1);
    assert.ok(played.some((src) => src === getOfflineVoiceClip(packagedText)));
  } finally {
    await vite.close();
    if (priorEnv === undefined) delete process.env.VITE_ELEVENLABS_ENABLED;
    else process.env.VITE_ELEVENLABS_ENABLED = priorEnv;
    if (priorWindow === undefined) delete globalThis.window;
    else globalThis.window = priorWindow;
    if (priorDocument === undefined) delete globalThis.document;
    else globalThis.document = priorDocument;
    if (priorAudio === undefined) delete globalThis.Audio;
    else globalThis.Audio = priorAudio;
  }
});
