import { useCallback, useEffect, useRef } from 'react';

const FRIENDLY_VOICE_NAMES = [
  'Samantha',
  'Victoria',
  'Ava',
  'Allison',
  'Google US English',
  'Google UK English Female',
  'Karen',
  'Moira',
  'Zoe',
];

const pickFriendlyVoice = (voices, lang) => {
  if (!voices || voices.length === 0) return null;
  const langPrefix = lang?.split('-')[0]?.toLowerCase();
  const matching = langPrefix
    ? voices.filter((voice) => voice.lang?.toLowerCase().startsWith(langPrefix))
    : voices;
  const pool = matching.length ? matching : voices;
  const friendly = pool.find((voice) =>
    FRIENDLY_VOICE_NAMES.some((name) => voice.name.toLowerCase().includes(name.toLowerCase())),
  );
  const gentle = pool.find((voice) => /female|child|junior/i.test(voice.name));
  return friendly || gentle || pool[0];
};

export const useSfx = (enabled) => {
  const ctxRef = useRef(null);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const playTone = useCallback((ctx, { freq, duration, start = 0, type = 'sine', gain = 0.18 }) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.value = 0.0001;

    osc.connect(amp);
    amp.connect(ctx.destination);

    const startAt = now + start;
    osc.start(startAt);
    amp.gain.exponentialRampToValueAtTime(gain, startAt + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    osc.stop(startAt + duration + 0.02);
  }, []);

  const playSweep = useCallback((ctx, { from, to, duration, start = 0, type = 'triangle', gain = 0.14 }) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(from, now + start);
    osc.frequency.exponentialRampToValueAtTime(to, now + start + duration);

    amp.gain.value = 0.0001;
    osc.connect(amp);
    amp.connect(ctx.destination);

    const startAt = now + start;
    osc.start(startAt);
    amp.gain.exponentialRampToValueAtTime(gain, startAt + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    osc.stop(startAt + duration + 0.02);
  }, []);

  return useCallback(
    (name) => {
      if (!enabledRef.current) return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      if (!ctxRef.current) {
        ctxRef.current = new AudioContext();
      }

      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      if (name === 'click') {
        playTone(ctx, { freq: 520, duration: 0.12, gain: 0.12, type: 'triangle' });
      }

      if (name === 'pop') {
        playTone(ctx, { freq: 880, duration: 0.12, gain: 0.18, type: 'square' });
        playTone(ctx, { freq: 660, duration: 0.08, gain: 0.12, start: 0.04, type: 'square' });
      }

      if (name === 'chime') {
        playTone(ctx, { freq: 784, duration: 0.18, gain: 0.16 });
        playTone(ctx, { freq: 1046, duration: 0.18, gain: 0.14, start: 0.12 });
      }

      if (name === 'success') {
        playTone(ctx, { freq: 523, duration: 0.12, gain: 0.16 });
        playTone(ctx, { freq: 659, duration: 0.12, gain: 0.16, start: 0.12 });
        playTone(ctx, { freq: 784, duration: 0.16, gain: 0.16, start: 0.24 });
      }

      if (name === 'oops') {
        playTone(ctx, { freq: 220, duration: 0.18, gain: 0.12, type: 'sine' });
      }

      if (name === 'swish') {
        playSweep(ctx, { from: 900, to: 320, duration: 0.25, gain: 0.14 });
      }

      if (name === 'flip') {
        playTone(ctx, { freq: 620, duration: 0.08, gain: 0.12, type: 'triangle' });
      }

      if (name === 'sparkle') {
        playTone(ctx, { freq: 880, duration: 0.12, gain: 0.15, type: 'sine' });
        playTone(ctx, { freq: 1320, duration: 0.16, gain: 0.12, start: 0.08, type: 'triangle' });
      }

      if (name === 'launch') {
        playSweep(ctx, { from: 300, to: 1200, duration: 0.4, gain: 0.2, type: 'sawtooth' });
        playTone(ctx, { freq: 960, duration: 0.08, gain: 0.1, start: 0.2, type: 'square' });
      }

      if (name === 'whoosh') {
        playSweep(ctx, { from: 1400, to: 180, duration: 0.5, gain: 0.2, type: 'sine' });
      }

      if (name === 'levelup') {
        playTone(ctx, { freq: 523, duration: 0.1, gain: 0.15 });
        playTone(ctx, { freq: 659, duration: 0.1, gain: 0.15, start: 0.1 });
        playTone(ctx, { freq: 784, duration: 0.1, gain: 0.15, start: 0.2 });
        playTone(ctx, { freq: 1047, duration: 0.25, gain: 0.18, start: 0.3 });
      }

      if (name === 'streak') {
        playTone(ctx, { freq: 660, duration: 0.08, gain: 0.12 });
        playTone(ctx, { freq: 880, duration: 0.08, gain: 0.14, start: 0.06 });
        playTone(ctx, { freq: 1100, duration: 0.12, gain: 0.16, start: 0.12 });
        playSweep(ctx, { from: 1100, to: 1400, duration: 0.15, gain: 0.12, start: 0.2 });
      }

      if (name === 'tap') {
        playTone(ctx, { freq: 440, duration: 0.06, gain: 0.1, type: 'triangle' });
      }

      if (name === 'countdown') {
        playTone(ctx, { freq: 800, duration: 0.15, gain: 0.12, type: 'square' });
      }

      if (name === 'wrong') {
        playTone(ctx, { freq: 280, duration: 0.15, gain: 0.12, type: 'sine' });
        playTone(ctx, { freq: 220, duration: 0.2, gain: 0.1, start: 0.12, type: 'sine' });
      }

      if (name === 'complete') {
        playTone(ctx, { freq: 523, duration: 0.12, gain: 0.14 });
        playTone(ctx, { freq: 659, duration: 0.12, gain: 0.14, start: 0.1 });
        playTone(ctx, { freq: 784, duration: 0.12, gain: 0.14, start: 0.2 });
        playTone(ctx, { freq: 1047, duration: 0.3, gain: 0.18, start: 0.3 });
        playTone(ctx, { freq: 1318, duration: 0.35, gain: 0.16, start: 0.5 });
      }

      if (name === 'confetti') {
        playSweep(ctx, { from: 600, to: 1400, duration: 0.3, gain: 0.12, type: 'triangle' });
        playTone(ctx, { freq: 1200, duration: 0.1, gain: 0.1, start: 0.15, type: 'sine' });
        playTone(ctx, { freq: 1500, duration: 0.08, gain: 0.08, start: 0.22, type: 'sine' });
      }

      if (name === 'levelup-big') {
        playTone(ctx, { freq: 523, duration: 0.1, gain: 0.15 });
        playTone(ctx, { freq: 659, duration: 0.1, gain: 0.15, start: 0.08 });
        playTone(ctx, { freq: 784, duration: 0.1, gain: 0.15, start: 0.16 });
        playTone(ctx, { freq: 1047, duration: 0.12, gain: 0.16, start: 0.24 });
        playTone(ctx, { freq: 1318, duration: 0.15, gain: 0.17, start: 0.34 });
        playTone(ctx, { freq: 1568, duration: 0.3, gain: 0.2, start: 0.46 });
      }

      if (name === 'card-flip') {
        playTone(ctx, { freq: 700, duration: 0.06, gain: 0.1, type: 'triangle' });
        playTone(ctx, { freq: 900, duration: 0.06, gain: 0.08, start: 0.04, type: 'triangle' });
      }

      if (name === 'combo') {
        playSweep(ctx, { from: 800, to: 1600, duration: 0.2, gain: 0.14, type: 'triangle' });
        playTone(ctx, { freq: 1600, duration: 0.15, gain: 0.12, start: 0.15, type: 'sine' });
      }
    },
    [playSweep, playTone],
  );
};

export const useVoice = (enabled) => {
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  return useCallback((text, { lang = 'en-US', rate = 0.92, pitch = 1.18 } = {}) => {
    if (!enabledRef.current) return;
    if (!text) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    const preferred = pickFriendlyVoice(voices, lang);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1;
    if (preferred) utterance.voice = preferred;

    synth.cancel();
    synth.speak(utterance);
  }, []);
};

export const useAmbientMusic = (enabled) => {
  const ctxRef = useRef(null);
  const nodesRef = useRef(null);

  useEffect(() => {
    const stop = () => {
      if (!nodesRef.current) return;
      const { nodes, master, filter } = nodesRef.current;
      nodes.forEach((node) => {
        try {
          node.osc.stop();
          node.lfo.stop();
        } catch (err) {
          // ignore
        }
        node.osc.disconnect();
        node.lfo.disconnect();
        node.gain.disconnect();
        node.lfoGain.disconnect();
      });
      master.disconnect();
      filter.disconnect();
      nodesRef.current = null;
    };

    if (!enabled) {
      stop();
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    if (!ctxRef.current) ctxRef.current = new AudioContext();
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    if (nodesRef.current) return;

    const master = ctx.createGain();
    master.gain.value = 0.03;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 700;
    master.connect(filter);
    filter.connect(ctx.destination);

    const freqs = [220, 277.18, 329.63];
    const nodes = freqs.map((freq, index) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      gain.gain.value = 0.08;

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.03 + index * 0.015;

      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.02;

      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      osc.connect(gain);
      gain.connect(master);

      osc.start();
      lfo.start();

      return { osc, gain, lfo, lfoGain };
    });

    nodesRef.current = { nodes, master, filter };

    return stop;
  }, [enabled]);
};

