import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import { OFFLINE_VOICE_CORPUS } from '../scripts/offline-voice-corpus.mjs';
import { getOfflineVoiceClip } from '../src/data/offlineVoice.js';

const findPackagedPair = () => {
  const clips = OFFLINE_VOICE_CORPUS.filter(({ lang, text }) => lang === 'en-US' && getOfflineVoiceClip(text, lang));
  for (let left = 0; left < clips.length; left += 1) {
    for (let right = left + 1; right < clips.length; right += 1) {
      const segments = [clips[left].text, clips[right].text];
      if (!getOfflineVoiceClip(segments.join(' '), 'en-US')) return segments;
    }
  }
  throw new Error('Expected two packaged lines without a packaged combined sentence');
};

const withVoice = async (run) => {
  const priorEnv = process.env.VITE_ELEVENLABS_ENABLED;
  const priorWindow = globalThis.window;
  const priorDocument = globalThis.document;
  const priorAudio = globalThis.Audio;
  process.env.VITE_ELEVENLABS_ENABLED = 'true';

  const requests = [];
  const audios = [];
  const documentListeners = new Map();
  globalThis.window = {
    fetch: async (...args) => {
      requests.push(args);
      return new Response('', { status: 429, headers: { 'Retry-After': '60' } });
    },
    navigator: { onLine: true },
    localStorage: { removeItem() {}, setItem() {} },
    addEventListener() {},
  };
  globalThis.document = {
    addEventListener(name, callback) { documentListeners.set(name, callback); },
    removeEventListener(name, callback) {
      if (documentListeners.get(name) === callback) documentListeners.delete(name);
    },
  };
  globalThis.Audio = class FakeAudio {
    constructor(src) {
      this.src = src;
      this.onended = null;
      this.onerror = null;
      this.paused = false;
      audios.push(this);
    }
    play() { this.paused = false; return Promise.resolve(); }
    pause() { this.paused = true; }
    end() { this.onended?.(); }
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
    await run({ voice, requests, audios, documentListeners });
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
};

test('segmented packaged narration plays clips in order and remains available during provider cooldown', async () => {
  await withVoice(async ({ voice, requests, audios }) => {
    const segments = findPackagedPair();
    const spokenLine = segments.join(' ');

    voice.speak('A dynamic prompt absent from the packaged corpus.');
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(requests.length, 1, 'the test establishes a real 429 cooldown');

    voice.speak(spokenLine, { segments });
    assert.equal(audios.length, 1);
    assert.equal(audios[0].src, getOfflineVoiceClip(segments[0]));
    assert.equal(requests.length, 1, 'packaged segments do not call the provider during cooldown');

    audios[0].end();
    assert.equal(audios.length, 2);
    assert.equal(audios[1].src, getOfflineVoiceClip(segments[1]));
    audios[1].end();
    assert.equal(audios.length, 2, 'the sequence stops after its final segment');
  });
});

test('missing or mismatched segments fail closed without partial playback or provider requests', async () => {
  await withVoice(async ({ voice, requests, audios }) => {
    const segments = findPackagedPair();
    const missingText = 'This line is intentionally absent from the verified manifest.';
    voice.speak(`${segments[0]} ${missingText}`, { segments: [segments[0], missingText] });
    voice.speak(segments.join(' '), { segments: [segments[0]] });
    assert.equal(audios.length, 0);
    assert.equal(requests.length, 0);
  });
});

test('an exact full-line packaged clip takes priority over supplied segments', async () => {
  await withVoice(async ({ voice, requests, audios }) => {
    const wholeLine = OFFLINE_VOICE_CORPUS.find(({ lang, text }) => lang === 'en-US' && getOfflineVoiceClip(text, lang));
    assert.ok(wholeLine);
    voice.speak(wholeLine.text, { segments: ['this is not the supplied line'] });
    assert.equal(audios.length, 1);
    assert.equal(audios[0].src, getOfflineVoiceClip(wholeLine.text));
    assert.equal(requests.length, 0);
  });
});

test('a new prompt cancels the prior sequence and its stale ended handler', async () => {
  await withVoice(async ({ voice, audios }) => {
    const segments = findPackagedPair();
    voice.speak(segments.join(' '), { segments });
    const firstSegment = audios[0];

    const replacement = OFFLINE_VOICE_CORPUS.find(({ lang, text }) => lang === 'en-US'
      && getOfflineVoiceClip(text, lang)
      && !segments.includes(text));
    voice.speak(replacement.text);
    assert.equal(firstSegment.paused, true);
    const replacementCount = audios.length;
    firstSegment.end();
    assert.equal(audios.length, replacementCount, 'stale ended events cannot advance the old sequence');
    assert.equal(audios.at(-1).src, getOfflineVoiceClip(replacement.text));
  });
});

test('a browser gesture retries the current segment before advancing', async () => {
  await withVoice(async ({ voice, audios, documentListeners }) => {
    const segments = findPackagedPair();
    const originalPlay = globalThis.Audio.prototype.play;
    let blockFirstPlay = true;
    globalThis.Audio.prototype.play = function play() {
      if (blockFirstPlay) {
        blockFirstPlay = false;
        return Promise.reject(Object.assign(new Error('gesture required'), { name: 'NotAllowedError' }));
      }
      return originalPlay.call(this);
    };
    try {
      voice.speak(segments.join(' '), { segments });
      await new Promise((resolve) => setTimeout(resolve, 0));
      assert.equal(audios.length, 1);
      const retry = documentListeners.get('pointerdown');
      assert.equal(typeof retry, 'function');
      retry();
      await new Promise((resolve) => setTimeout(resolve, 0));
      assert.equal(audios.length, 2);
      assert.equal(audios[0].src, getOfflineVoiceClip(segments[0]));
      assert.equal(audios[1].src, getOfflineVoiceClip(segments[0]), 'gesture retries the same segment');
      audios[1].end();
      assert.equal(audios.length, 3);
      assert.equal(audios[2].src, getOfflineVoiceClip(segments[1]));
    } finally {
      globalThis.Audio.prototype.play = originalPlay;
    }
  });
});
