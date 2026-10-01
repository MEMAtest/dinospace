import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getOfflineVoiceClip } from './data/offlineVoice.js';
import { getGameSoundCue, selectGameSoundCue } from './data/gameSounds.js';

let hadUserGesture = false;
if (typeof window !== 'undefined') {
  const markGesture = () => { hadUserGesture = true; };
  window.addEventListener('pointerdown', markGesture, { once: true });
  window.addEventListener('keydown', markGesture, { once: true });
}

export const useSfx = (enabled) => {
  const ctxRef = useRef(null);
  const masterGainRef = useRef(null);
  const voicesRef = useRef(new Set());
  const pendingCuesRef = useRef([]);
  const pendingFlushRef = useRef(false);
  const cueQueueVersionRef = useRef(0);
  const activeCueRef = useRef(null);
  const lastCueRef = useRef({ name: null, at: -Infinity });
  const enabledRef = useRef(enabled);

  useLayoutEffect(() => {
    enabledRef.current = enabled;
    const ctx = ctxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(enabled ? 0.55 : 0, now);
    if (!enabled) {
      cueQueueVersionRef.current += 1;
      pendingCuesRef.current = [];
      pendingFlushRef.current = false;
      voicesRef.current.forEach((voice) => {
        try { voice.stop(now); } catch { /* already ended */ }
      });
      voicesRef.current.clear();
      activeCueRef.current = null;
    }
  }, [enabled]);

  const getCtx = useCallback(() => {
    if (!enabledRef.current || !hadUserGesture) return null;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!ctxRef.current) {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      const compressor = ctx.createDynamicsCompressor();
      master.gain.value = 0.55;
      compressor.threshold.value = -20;
      compressor.knee.value = 16;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.004;
      compressor.release.value = 0.16;
      master.connect(compressor);
      compressor.connect(ctx.destination);
      ctxRef.current = ctx;
      masterGainRef.current = master;
    }
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
    return ctx;
  }, []);

  const scheduleNote = useCallback((ctx, note) => {
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();
    const startAt = ctx.currentTime + note.start;
    oscillator.type = note.waveform;
    if (note.kind === 'sweep') {
      oscillator.frequency.setValueAtTime(note.from, startAt);
      oscillator.frequency.exponentialRampToValueAtTime(note.to, startAt + note.duration);
    } else {
      oscillator.frequency.value = note.frequency;
    }
    envelope.gain.setValueAtTime(0.0001, startAt);
    envelope.gain.exponentialRampToValueAtTime(note.gain, startAt + 0.018);
    envelope.gain.exponentialRampToValueAtTime(note.gain * 0.24, startAt + note.duration);
    envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + note.duration + 0.075);
    oscillator.connect(envelope);
    envelope.connect(masterGainRef.current);
    oscillator.start(startAt);
    oscillator.stop(startAt + note.duration + 0.09);
    voicesRef.current.add(oscillator);
    oscillator.addEventListener('ended', () => {
      voicesRef.current.delete(oscillator);
      oscillator.disconnect();
      envelope.disconnect();
    }, { once: true });
  }, []);

  useEffect(() => () => {
    enabledRef.current = false;
    cueQueueVersionRef.current += 1;
    pendingFlushRef.current = false;
    activeCueRef.current = null;
    const ctx = ctxRef.current;
    voicesRef.current.forEach((voice) => {
      try { voice.stop(); } catch { /* already ended */ }
    });
    voicesRef.current.clear();
    pendingCuesRef.current = [];
    ctxRef.current = null;
    masterGainRef.current = null;
    if (ctx && ctx.state !== 'closed') void ctx.close().catch(() => {});
  }, []);

  return useCallback((name) => {
    if (!getGameSoundCue(name)) return;
    pendingCuesRef.current.push(name);
    if (pendingFlushRef.current) return;
    pendingFlushRef.current = true;
    const queueVersion = cueQueueVersionRef.current;
    queueMicrotask(() => {
      if (queueVersion !== cueQueueVersionRef.current) return;
      pendingFlushRef.current = false;
      const names = pendingCuesRef.current;
      pendingCuesRef.current = [];
      if (!enabledRef.current) return;
      const selectedName = selectGameSoundCue(names);
      const selectedCue = getGameSoundCue(selectedName);
      if (!selectedCue) return;
      const ctx = getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const activeCue = activeCueRef.current;
      if (activeCue && now < activeCue.until) {
        if (selectedCue.priority <= activeCue.priority) return;
        voicesRef.current.forEach((voice) => {
          try { voice.stop(now); } catch { /* already ended */ }
        });
        voicesRef.current.clear();
      }
      const lastCue = lastCueRef.current;
      if (lastCue.name === selectedName && now - lastCue.at < 0.075) return;
      lastCueRef.current = { name: selectedName, at: now };
      const endAfter = Math.max(...selectedCue.notes.map(({ start, duration }) => start + duration + 0.09));
      activeCueRef.current = { name: selectedName, priority: selectedCue.priority, until: now + endAfter };
      selectedCue.notes.forEach((note) => scheduleNote(ctx, note));
    });
  }, [getCtx, scheduleNote]);
};

const VOICE_MODE_STORAGE_KEY = 'amari_voice_mode_v4';
const PREVIOUS_VOICE_MODE_STORAGE_KEY = 'amari_voice_mode_v3';
const LEGACY_VOICE_MODE_STORAGE_KEY = 'amari_voice_mode';
const MAX_PREMIUM_VOICE_CACHE = 24;
// Packaged ElevenLabs clips are part of every web and Android build. The env
// flag controls only generation of a clip that is not already bundled.
const DYNAMIC_VOICE_ENABLED = import.meta.env.VITE_ELEVENLABS_ENABLED === 'true';
const PACKAGED_NARRATOR_ENABLED = true;
// The browser build keeps this same-origin. The Android wrapper supplies the
// production URL because its WebView has no local Vercel function server.
const VOICE_API_URL = import.meta.env.VITE_VOICE_API_URL || '/api/voice';

const getStoredVoiceMode = () => {
  try {
    // The packaged narrator is mandatory. Clear every historic Device choice
    // so an upgraded Android/PWA install cannot keep the robotic system voice.
    window.localStorage.removeItem(VOICE_MODE_STORAGE_KEY);
    window.localStorage.removeItem(PREVIOUS_VOICE_MODE_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_VOICE_MODE_STORAGE_KEY);
    return 'premium';
  } catch {
    return 'premium';
  }
};

const getIsInstalled = () => {
  if (typeof window === 'undefined') return false;
  return Boolean(window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator.standalone);
};

const getIsAppleMobile = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(window.navigator.userAgent || '');
};

export const useVoice = (enabled) => {
  const enabledRef = useRef(enabled);
  const queueRef = useRef(null);
  const premiumRequestRef = useRef(null);
  const premiumRequestKeyRef = useRef(null);
  const premiumAudioRef = useRef(null);
  const premiumAudioUrlRef = useRef(null);
  const pendingPremiumGestureCleanupRef = useRef(null);
  const premiumCacheRef = useRef(new Map());
  const voiceModeRef = useRef('premium');
  const [voiceMode, setVoiceModeState] = useState(getStoredVoiceMode);
  const [premiumStatus, setPremiumStatus] = useState('unknown');

  const stopPremiumPlayback = useCallback(() => {
    if (premiumAudioRef.current) {
      premiumAudioRef.current.pause();
      premiumAudioRef.current.currentTime = 0;
      premiumAudioRef.current = null;
    }
    if (premiumAudioUrlRef.current) {
      URL.revokeObjectURL(premiumAudioUrlRef.current);
      premiumAudioUrlRef.current = null;
    }
  }, []);

  const clearPendingPremiumGesture = useCallback(() => {
    pendingPremiumGestureCleanupRef.current?.();
    pendingPremiumGestureCleanupRef.current = null;
  }, []);

  const cancelPremiumVoice = useCallback(() => {
    clearPendingPremiumGesture();
    if (premiumRequestRef.current) {
      premiumRequestRef.current.abort();
      premiumRequestRef.current = null;
    }
    premiumRequestKeyRef.current = null;
    stopPremiumPlayback();
  }, [clearPendingPremiumGesture, stopPremiumPlayback]);

  useEffect(() => {
    enabledRef.current = enabled;
    if (!enabled) {
      cancelPremiumVoice();
    }
  }, [cancelPremiumVoice, enabled]);

  useEffect(() => {
    voiceModeRef.current = voiceMode;
    try {
      window.localStorage.setItem(VOICE_MODE_STORAGE_KEY, voiceMode);
    } catch {
      // Voice preference is optional; private browsing may not allow storage.
    }
  }, [voiceMode]);

  useEffect(() => () => {
    cancelPremiumVoice();
    if (queueRef.current) clearTimeout(queueRef.current);
  }, [cancelPremiumVoice]);

  const setVoiceMode = useCallback((nextMode) => {
    if (nextMode !== 'premium') return;
    setVoiceModeState('premium');
    setPremiumStatus('unknown');
  }, []);

  const speak = useCallback((rawText, options = {}) => {
    if (!enabledRef.current || !rawText) return;
    const text = String(rawText).replace(/\s+/g, ' ').trim();
    if (!text) return;

    const { lang = 'en-US', premium = true } = options;
    const requestKey = `${lang}:${text}`;
    if (premiumRequestRef.current && premiumRequestKeyRef.current === requestKey) return;
    cancelPremiumVoice();
    if (queueRef.current) {
      clearTimeout(queueRef.current);
      queueRef.current = null;
    }

    const canUsePremium = premium
      && voiceModeRef.current !== 'device'
      && !import.meta.env.DEV
      && DYNAMIC_VOICE_ENABLED
      && typeof window !== 'undefined'
      && typeof window.fetch === 'function'
      && window.navigator.onLine !== false;

    const handlePremiumFailure = () => {
      setPremiumStatus('unavailable');
    };

    const cacheKey = requestKey;
    const waitForPremiumGesture = (audioBlob) => {
      clearPendingPremiumGesture();

      const retry = () => {
        clearPendingPremiumGesture();
        playPremiumAudio(audioBlob);
      };
      document.addEventListener('pointerdown', retry, { once: true });
      document.addEventListener('keydown', retry, { once: true });
      pendingPremiumGestureCleanupRef.current = () => {
        document.removeEventListener('pointerdown', retry);
        document.removeEventListener('keydown', retry);
      };
    };
    const playPremiumAudio = (audioBlob) => {
      if (!enabledRef.current) return;

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      premiumAudioRef.current = audio;
      premiumAudioUrlRef.current = audioUrl;
      audio.onended = () => {
        if (premiumAudioRef.current === audio) {
          premiumAudioRef.current = null;
          URL.revokeObjectURL(audioUrl);
          if (premiumAudioUrlRef.current === audioUrl) premiumAudioUrlRef.current = null;
        }
      };
      audio.onerror = () => {
        if (!hadUserGesture) {
          audio.onerror = null;
          audio.pause();
          if (premiumAudioRef.current === audio) premiumAudioRef.current = null;
          URL.revokeObjectURL(audioUrl);
          if (premiumAudioUrlRef.current === audioUrl) premiumAudioUrlRef.current = null;
          waitForPremiumGesture(audioBlob);
        } else {
          handlePremiumFailure();
        }
      };
      const playback = audio.play();
      if (playback?.catch) {
        playback.catch((error) => {
          if (error?.name !== 'NotAllowedError' && hadUserGesture) {
            handlePremiumFailure();
            return;
          }

          // Mobile browsers can block automatic playback. Keep the ElevenLabs
          // audio and retry it on the first real tap/key press.
          audio.onerror = null;
          audio.pause();
          if (premiumAudioRef.current === audio) premiumAudioRef.current = null;
          URL.revokeObjectURL(audioUrl);
          if (premiumAudioUrlRef.current === audioUrl) premiumAudioUrlRef.current = null;
          waitForPremiumGesture(audioBlob);
        });
      }
    };

    const offlineClipUrl = getOfflineVoiceClip(text, lang);
    if (offlineClipUrl) {
      setPremiumStatus('loading');
      // Play from the packaged URL during the same tap that requested it.
      // Fetching into a Blob first can lose mobile/Fire WebView user activation
      // and leave narration silent until a later, unrelated tap.
      const audio = new Audio(offlineClipUrl);
      premiumAudioRef.current = audio;
      audio.onended = () => {
        if (premiumAudioRef.current === audio) premiumAudioRef.current = null;
      };
      audio.onerror = handlePremiumFailure;
      const playback = audio.play();
      playback?.then(() => setPremiumStatus('ready')).catch((error) => {
        if (error?.name === 'NotAllowedError') {
          const retry = () => {
            clearPendingPremiumGesture();
            audio.play()
              .then(() => setPremiumStatus('ready'))
              .catch(handlePremiumFailure);
          };
          document.addEventListener('pointerdown', retry, { once: true });
          document.addEventListener('keydown', retry, { once: true });
          pendingPremiumGestureCleanupRef.current = () => {
            document.removeEventListener('pointerdown', retry);
            document.removeEventListener('keydown', retry);
          };
          return;
        }
        handlePremiumFailure();
      });
      return;
    }

    if (!premium) {
      setPremiumStatus('unavailable');
      return;
    }

    if (!canUsePremium) {
      // Dynamic narration still needs the service. Fixed welcome and game
      // prompts above remain available from the bundled ElevenLabs clips.
      setPremiumStatus('unavailable');
      return;
    }

    const cachedAudio = premiumCacheRef.current.get(cacheKey);
    if (cachedAudio) {
      setPremiumStatus('ready');
      playPremiumAudio(cachedAudio);
      return;
    }

    setPremiumStatus('loading');
    const controller = new AbortController();
    premiumRequestRef.current = controller;
    premiumRequestKeyRef.current = requestKey;
    window.fetch(VOICE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: lang.split('-')[0] }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 204) return null;
        if (response.headers.get('x-amari-voice-provider') !== 'elevenlabs') {
          throw new Error('Voice provider could not be verified');
        }
        if (!response.ok) throw new Error(`Voice request failed (${response.status})`);
        const audioBlob = await response.blob();
        if (!audioBlob.size) throw new Error('Voice request returned no audio');
        return audioBlob;
      })
      .then((audioBlob) => {
        if (controller.signal.aborted) return;
        if (!audioBlob) {
          premiumRequestRef.current = null;
          premiumRequestKeyRef.current = null;
          handlePremiumFailure();
          return;
        }
        premiumRequestRef.current = null;
        premiumRequestKeyRef.current = null;
        setPremiumStatus('ready');
        if (premiumCacheRef.current.size >= MAX_PREMIUM_VOICE_CACHE) {
          premiumCacheRef.current.delete(premiumCacheRef.current.keys().next().value);
        }
        premiumCacheRef.current.set(cacheKey, audioBlob);
        playPremiumAudio(audioBlob);
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return;
        premiumRequestRef.current = null;
        premiumRequestKeyRef.current = null;
        handlePremiumFailure();
      });
  }, [cancelPremiumVoice, clearPendingPremiumGesture]);

  return { speak, voiceMode, setVoiceMode, premiumStatus, premiumEnabled: PACKAGED_NARRATOR_ENABLED };
};

export const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(getIsInstalled);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isAppleMobile] = useState(getIsAppleMobile);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const displayMode = window.matchMedia?.('(display-mode: standalone)');
    const syncInstalledState = () => setIsInstalled(getIsInstalled());

    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };
    const onInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      setIsInstalling(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    displayMode?.addEventListener?.('change', syncInstalledState);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      displayMode?.removeEventListener?.('change', syncInstalledState);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    setIsInstalling(true);
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstalling(false);
    if (choice?.outcome === 'accepted') setIsInstalled(true);
    return choice?.outcome === 'accepted';
  }, [deferredPrompt]);

  return {
    canInstall: Boolean(deferredPrompt),
    install,
    isAppleMobile,
    isInstalled,
    isInstalling,
  };
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
