import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { OFFLINE_VOICE_CORPUS } from '../scripts/offline-voice-corpus.mjs';
import { getOfflineVoiceClip } from '../src/data/offlineVoice.js';
import { OFFLINE_VOICE_MANIFEST } from '../src/data/offlineVoiceManifest.js';

test('every reviewed app narration prompt has a packaged ElevenLabs clip', () => {
  const missing = OFFLINE_VOICE_CORPUS.filter(({ key }) => {
    const clip = OFFLINE_VOICE_MANIFEST[key];
    return !clip || !existsSync(`public${clip}`);
  });
  assert.equal(missing.length, 0, `Missing packaged clips: ${missing.slice(0, 5).map(({ text }) => text).join(', ')}`);
});

test('the welcome uses its packaged Matilda narration', () => {
  const clip = getOfflineVoiceClip('Welcome Amari! Your next learning adventure is ready.', 'en-US');
  assert.equal(clip, '/audio/en/ae6ea92c-matilda.mp3');
  assert.equal(existsSync(`public${clip}`), true);
});
