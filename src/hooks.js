import { useCallback, useEffect, useRef } from 'react';

const FRIENDLY_VOICE_NAMES = [
  'Samantha (Enhanced)',
  'Ava (Premium)',
  'Ava (Enhanced)',
  'Samantha',
  'Ava',
  'Victoria',
  'Google UK English Female',
  'Google US English',
  'Karen',
  'Moira',
  'Zoe',
  'Allison',
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

let hadUserGesture = false;
if (typeof window !== 'undefined') {
  const markGesture = () => { hadUserGesture = true; };
  window.addEventListener('pointerdown', markGesture, { once: true });
  window.addEventListener('keydown', markGesture, { once: true });
}

export const useSfx = (enabled) => {
  const ctxRef = useRef(null);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const getCtx = useCallback(() => {
    if (!hadUserGesture) return null;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }, []);

  const playTone = useCallback((ctx, { freq, duration, start = 0, type = 'sine', gain = 0.18, soft = false }) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.value = 0.0001;

    osc.connect(amp);
    amp.connect(ctx.destination);

    const startAt = now + start;
    const attack = soft ? 0.05 : 0.02;
    osc.start(startAt);
    amp.gain.exponentialRampToValueAtTime(gain, startAt + attack);
    // Natural release tail instead of abrupt cutoff
    amp.gain.exponentialRampToValueAtTime(gain * 0.3, startAt + duration);
    amp.gain.exponentialRampToValueAtTime(0.0001, startAt + duration + 0.1);
    osc.stop(startAt + duration + 0.12);
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
    amp.gain.exponentialRampToValueAtTime(gain * 0.3, startAt + duration);
    amp.gain.exponentialRampToValueAtTime(0.0001, startAt + duration + 0.1);
    osc.stop(startAt + duration + 0.12);
  }, []);

  // Procedural reverb for big celebrations
  const createReverb = useCallback((ctx, wetAmount = 0.2) => {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * 0.4;
    const impulse = ctx.createBuffer(2, length, sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }
    const convolver = ctx.createConvolver();
    convolver.buffer = impulse;
    const wet = ctx.createGain();
    wet.gain.value = wetAmount;
    const dry = ctx.createGain();
    dry.gain.value = 1;
    convolver.connect(wet);
    wet.connect(ctx.destination);
    dry.connect(ctx.destination);
    return { input: dry, reverbInput: convolver };
  }, []);

  const playToneThrough = useCallback((ctx, dest, { freq, duration, start = 0, type = 'sine', gain = 0.18, soft = false }) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.value = 0.0001;

    osc.connect(amp);
    amp.connect(dest);

    const startAt = now + start;
    const attack = soft ? 0.05 : 0.02;
    osc.start(startAt);
    amp.gain.exponentialRampToValueAtTime(gain, startAt + attack);
    amp.gain.exponentialRampToValueAtTime(gain * 0.3, startAt + duration);
    amp.gain.exponentialRampToValueAtTime(0.0001, startAt + duration + 0.1);
    osc.stop(startAt + duration + 0.12);
  }, []);

  return useCallback(
    (name) => {
      if (!enabledRef.current) return;
      const ctx = getCtx();
      if (!ctx) return;

      if (name === 'click') {
        playTone(ctx, { freq: 520, duration: 0.12, gain: 0.12, type: 'triangle' });
      }

      if (name === 'pop') {
        playTone(ctx, { freq: 880, duration: 0.12, gain: 0.18, type: 'square' });
        playTone(ctx, { freq: 660, duration: 0.08, gain: 0.12, start: 0.04, type: 'square' });
      }

      if (name === 'chime') {
        playTone(ctx, { freq: 784, duration: 0.18, gain: 0.16, soft: true });
        playTone(ctx, { freq: 1046, duration: 0.18, gain: 0.14, start: 0.12, soft: true });
      }

      if (name === 'success') {
        // Root notes with sub-octave for fullness
        playTone(ctx, { freq: 523, duration: 0.15, gain: 0.14, soft: true });
        playTone(ctx, { freq: 261, duration: 0.15, gain: 0.06, soft: true }); // sub-octave
        playTone(ctx, { freq: 526, duration: 0.15, gain: 0.07, soft: true }); // detuned copy
        playTone(ctx, { freq: 659, duration: 0.15, gain: 0.14, start: 0.12, soft: true });
        playTone(ctx, { freq: 663, duration: 0.15, gain: 0.07, start: 0.12, soft: true }); // detuned
        playTone(ctx, { freq: 784, duration: 0.2, gain: 0.16, start: 0.24, soft: true });
        playTone(ctx, { freq: 788, duration: 0.2, gain: 0.08, start: 0.24, soft: true }); // detuned
        // Shimmer at end
        playTone(ctx, { freq: 1568, duration: 0.12, gain: 0.06, start: 0.36, type: 'triangle', soft: true });
      }

      if (name === 'oops') {
        playTone(ctx, { freq: 220, duration: 0.18, gain: 0.12, type: 'sine', soft: true });
      }

      if (name === 'swish') {
        playSweep(ctx, { from: 900, to: 320, duration: 0.25, gain: 0.14 });
      }

      if (name === 'flip') {
        playTone(ctx, { freq: 620, duration: 0.08, gain: 0.12, type: 'triangle' });
      }

      if (name === 'sparkle') {
        playTone(ctx, { freq: 880, duration: 0.12, gain: 0.15, type: 'sine', soft: true });
        playTone(ctx, { freq: 1320, duration: 0.16, gain: 0.12, start: 0.08, type: 'triangle', soft: true });
      }

      if (name === 'launch') {
        playSweep(ctx, { from: 300, to: 1200, duration: 0.4, gain: 0.2, type: 'sawtooth' });
        playTone(ctx, { freq: 960, duration: 0.08, gain: 0.1, start: 0.2, type: 'square' });
      }

      if (name === 'whoosh') {
        playSweep(ctx, { from: 1400, to: 180, duration: 0.5, gain: 0.2, type: 'sine' });
      }

      if (name === 'levelup') {
        // Detuned unison for warmth
        playTone(ctx, { freq: 523, duration: 0.1, gain: 0.15, soft: true });
        playTone(ctx, { freq: 527, duration: 0.1, gain: 0.07, soft: true });
        playTone(ctx, { freq: 659, duration: 0.1, gain: 0.15, start: 0.1, soft: true });
        playTone(ctx, { freq: 663, duration: 0.1, gain: 0.07, start: 0.1, soft: true });
        playTone(ctx, { freq: 784, duration: 0.1, gain: 0.15, start: 0.2, soft: true });
        playTone(ctx, { freq: 788, duration: 0.1, gain: 0.07, start: 0.2, soft: true });
        playTone(ctx, { freq: 1047, duration: 0.25, gain: 0.18, start: 0.3, soft: true });
        playTone(ctx, { freq: 1051, duration: 0.25, gain: 0.09, start: 0.3, soft: true });
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
        playTone(ctx, { freq: 280, duration: 0.15, gain: 0.12, type: 'sine', soft: true });
        playTone(ctx, { freq: 220, duration: 0.2, gain: 0.1, start: 0.12, type: 'sine', soft: true });
      }

      if (name === 'complete') {
        // Rich complete sound with sub-octave and detuned copies + reverb
        try {
          const reverb = createReverb(ctx, 0.2);
          playToneThrough(ctx, reverb.input, { freq: 523, duration: 0.12, gain: 0.14, soft: true });
          playToneThrough(ctx, reverb.reverbInput, { freq: 523, duration: 0.12, gain: 0.14, soft: true });
          playToneThrough(ctx, reverb.input, { freq: 261, duration: 0.12, gain: 0.06, soft: true }); // sub
          playToneThrough(ctx, reverb.input, { freq: 659, duration: 0.12, gain: 0.14, start: 0.1, soft: true });
          playToneThrough(ctx, reverb.reverbInput, { freq: 659, duration: 0.12, gain: 0.14, start: 0.1, soft: true });
          playToneThrough(ctx, reverb.input, { freq: 784, duration: 0.12, gain: 0.14, start: 0.2, soft: true });
          playToneThrough(ctx, reverb.reverbInput, { freq: 784, duration: 0.12, gain: 0.14, start: 0.2, soft: true });
          playToneThrough(ctx, reverb.input, { freq: 1047, duration: 0.3, gain: 0.18, start: 0.3, soft: true });
          playToneThrough(ctx, reverb.reverbInput, { freq: 1047, duration: 0.3, gain: 0.18, start: 0.3, soft: true });
          playToneThrough(ctx, reverb.input, { freq: 1318, duration: 0.35, gain: 0.16, start: 0.5, soft: true });
          playToneThrough(ctx, reverb.reverbInput, { freq: 1318, duration: 0.35, gain: 0.16, start: 0.5, soft: true });
          playToneThrough(ctx, reverb.input, { freq: 659, duration: 0.35, gain: 0.05, start: 0.5, soft: true }); // sub
        } catch {
          // Fallback without reverb
          playTone(ctx, { freq: 523, duration: 0.12, gain: 0.14, soft: true });
          playTone(ctx, { freq: 659, duration: 0.12, gain: 0.14, start: 0.1, soft: true });
          playTone(ctx, { freq: 784, duration: 0.12, gain: 0.14, start: 0.2, soft: true });
          playTone(ctx, { freq: 1047, duration: 0.3, gain: 0.18, start: 0.3, soft: true });
          playTone(ctx, { freq: 1318, duration: 0.35, gain: 0.16, start: 0.5, soft: true });
        }
      }

      if (name === 'confetti') {
        playSweep(ctx, { from: 600, to: 1400, duration: 0.3, gain: 0.12, type: 'triangle' });
        playTone(ctx, { freq: 1200, duration: 0.1, gain: 0.1, start: 0.15, type: 'sine', soft: true });
        playTone(ctx, { freq: 1500, duration: 0.08, gain: 0.08, start: 0.22, type: 'sine', soft: true });
      }

      if (name === 'levelup-big') {
        // Big level-up with reverb and detuned unison
        try {
          const reverb = createReverb(ctx, 0.2);
          playToneThrough(ctx, reverb.input, { freq: 523, duration: 0.1, gain: 0.15, soft: true });
          playToneThrough(ctx, reverb.reverbInput, { freq: 523, duration: 0.1, gain: 0.15, soft: true });
          playToneThrough(ctx, reverb.input, { freq: 527, duration: 0.1, gain: 0.07, soft: true });
          playToneThrough(ctx, reverb.input, { freq: 659, duration: 0.1, gain: 0.15, start: 0.08, soft: true });
          playToneThrough(ctx, reverb.reverbInput, { freq: 659, duration: 0.1, gain: 0.15, start: 0.08, soft: true });
          playToneThrough(ctx, reverb.input, { freq: 784, duration: 0.1, gain: 0.15, start: 0.16, soft: true });
          playToneThrough(ctx, reverb.reverbInput, { freq: 784, duration: 0.1, gain: 0.15, start: 0.16, soft: true });
          playToneThrough(ctx, reverb.input, { freq: 1047, duration: 0.12, gain: 0.16, start: 0.24, soft: true });
          playToneThrough(ctx, reverb.reverbInput, { freq: 1047, duration: 0.12, gain: 0.16, start: 0.24, soft: true });
          playToneThrough(ctx, reverb.input, { freq: 1318, duration: 0.15, gain: 0.17, start: 0.34, soft: true });
          playToneThrough(ctx, reverb.reverbInput, { freq: 1318, duration: 0.15, gain: 0.17, start: 0.34, soft: true });
          playToneThrough(ctx, reverb.input, { freq: 1568, duration: 0.3, gain: 0.2, start: 0.46, soft: true });
          playToneThrough(ctx, reverb.reverbInput, { freq: 1568, duration: 0.3, gain: 0.2, start: 0.46, soft: true });
          playToneThrough(ctx, reverb.input, { freq: 1572, duration: 0.3, gain: 0.1, start: 0.46, soft: true });
        } catch {
          playTone(ctx, { freq: 523, duration: 0.1, gain: 0.15, soft: true });
          playTone(ctx, { freq: 659, duration: 0.1, gain: 0.15, start: 0.08, soft: true });
          playTone(ctx, { freq: 784, duration: 0.1, gain: 0.15, start: 0.16, soft: true });
          playTone(ctx, { freq: 1047, duration: 0.12, gain: 0.16, start: 0.24, soft: true });
          playTone(ctx, { freq: 1318, duration: 0.15, gain: 0.17, start: 0.34, soft: true });
          playTone(ctx, { freq: 1568, duration: 0.3, gain: 0.2, start: 0.46, soft: true });
        }
      }

      if (name === 'card-flip') {
        playTone(ctx, { freq: 700, duration: 0.06, gain: 0.1, type: 'triangle' });
        playTone(ctx, { freq: 900, duration: 0.06, gain: 0.08, start: 0.04, type: 'triangle' });
      }

      if (name === 'combo') {
        playSweep(ctx, { from: 800, to: 1600, duration: 0.2, gain: 0.14, type: 'triangle' });
        playTone(ctx, { freq: 1600, duration: 0.15, gain: 0.12, start: 0.15, type: 'sine', soft: true });
      }

      // Chess piece placement — short wooden thunk
      if (name === 'chess-move') {
        playTone(ctx, { freq: 180, duration: 0.06, gain: 0.15, type: 'sine' });
        playTone(ctx, { freq: 120, duration: 0.08, gain: 0.10, type: 'triangle', start: 0.01 });
      }
    },
    [getCtx, playSweep, playTone, createReverb, playToneThrough],
  );
};

export const useVoice = (enabled) => {
  const enabledRef = useRef(enabled);
  const voiceRef = useRef(null);
  const queueRef = useRef(null); // tracks pending sentence timeouts

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // Cache voice selection — voices load async on many browsers
  useEffect(() => {
    const synth = typeof window !== 'undefined' && window.speechSynthesis;
    if (!synth) return;

    const updateVoice = () => {
      const voices = synth.getVoices();
      voiceRef.current = pickFriendlyVoice(voices, 'en-US');
    };

    updateVoice();
    synth.addEventListener('voiceschanged', updateVoice);
    return () => synth.removeEventListener('voiceschanged', updateVoice);
  }, []);

  return useCallback((text, { lang = 'en-US', rate = 0.75, pitch = 1.28 } = {}) => {
    if (!enabledRef.current) return;
    if (!text) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const synth = window.speechSynthesis;

    // Cancel any in-flight speech and pending queued sentences
    synth.cancel();
    if (queueRef.current) {
      clearTimeout(queueRef.current);
      queueRef.current = null;
    }

    // Split text into sentences for natural pauses
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    const doSpeak = () => {
      // Re-check voice — may have loaded since initial mount
      if (!voiceRef.current) {
        voiceRef.current = pickFriendlyVoice(synth.getVoices(), lang);
      }
      const preferred = voiceRef.current;

      const speakSentence = (index) => {
        if (index >= sentences.length) return;

        const utterance = new SpeechSynthesisUtterance(sentences[index].trim());
        utterance.lang = lang;
        // Slight random variation per sentence to prevent monotony
        utterance.rate = rate + (Math.random() * 0.06 - 0.03);
        utterance.pitch = pitch;
        utterance.volume = 1;
        if (preferred) utterance.voice = preferred;

        utterance.onend = () => {
          if (index < sentences.length - 1) {
            // 350ms breathing pause between sentences
            queueRef.current = setTimeout(() => speakSentence(index + 1), 350);
          }
        };

        synth.speak(utterance);
      };

      speakSentence(0);
    };

    // If voices haven't loaded yet, wait briefly for them
    if (!voiceRef.current && synth.getVoices().length === 0) {
      const onReady = () => {
        voiceRef.current = pickFriendlyVoice(synth.getVoices(), lang);
        doSpeak();
      };
      synth.addEventListener('voiceschanged', onReady, { once: true });
      // Fallback — if voiceschanged never fires, speak anyway after 300ms
      queueRef.current = setTimeout(() => {
        synth.removeEventListener('voiceschanged', onReady);
        doSpeak();
      }, 300);
    } else {
      doSpeak();
    }
  }, []);
};

export const useAmbientMusic = (enabled) => {
  const ctxRef = useRef(null);
  const nodesRef = useRef(null);
  const wantsPlayRef = useRef(false);

  useEffect(() => {
    const stop = () => {
      if (!nodesRef.current) return;
      const { nodes, master, filter } = nodesRef.current;
      nodes.forEach((node) => {
        try { node.osc.stop(); node.lfo.stop(); } catch { /* ignore */ }
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
      wantsPlayRef.current = false;
      stop();
      return;
    }

    wantsPlayRef.current = true;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const startNodes = (ctx) => {
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
    };

    // Defer AudioContext creation until a user gesture to avoid browser warnings
    const startMusic = () => {
      if (!wantsPlayRef.current) return;
      if (!ctxRef.current) ctxRef.current = new AudioCtx();
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      startNodes(ctx);
      // Remove listener once started
      document.removeEventListener('pointerdown', startMusic);
      document.removeEventListener('keydown', startMusic);
    };

    // If context already exists (user already interacted), start immediately
    if (ctxRef.current) {
      startMusic();
    } else {
      document.addEventListener('pointerdown', startMusic, { once: true });
      document.addEventListener('keydown', startMusic, { once: true });
    }

    return () => {
      document.removeEventListener('pointerdown', startMusic);
      document.removeEventListener('keydown', startMusic);
      stop();
    };
  }, [enabled]);
};
