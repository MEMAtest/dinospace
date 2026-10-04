import { useCallback, useEffect, useRef, useState } from 'react';
import { PURE_PHONEME_CLIP_PATHS } from '../../data/batch5Literacy.js';

export const useAmariPhonemeAudio = ({ soundOn, cancelNarration }) => {
  const audioRef = useRef(null);
  const generationRef = useRef(0);
  const cancelRef = useRef(cancelNarration);
  const [missingClip, setMissingClip] = useState('');
  useEffect(() => { cancelRef.current = cancelNarration; }, [cancelNarration]);
  const stop = useCallback(() => {
    generationRef.current += 1;
    const audio = audioRef.current;
    audioRef.current = null;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.removeAttribute('src');
    }
  }, []);
  const cancelAll = useCallback(() => {
    cancelRef.current?.();
    stop();
  }, [stop]);
  const play = useCallback((phonemes) => {
    cancelAll();
    setMissingClip('');
    if (!soundOn) return false;
    const sequence = Array.isArray(phonemes) ? phonemes : [phonemes];
    const token = generationRef.current;
    let index = 0;
    const next = () => {
      if (generationRef.current !== token || index >= sequence.length) return;
      const phoneme = sequence[index++];
      const path = PURE_PHONEME_CLIP_PATHS[phoneme];
      if (!path || typeof window === 'undefined' || typeof window.Audio !== 'function') {
        setMissingClip(phoneme || 'sound');
        return;
      }
      const audio = new window.Audio(path);
      audioRef.current = audio;
      audio.onended = next;
      audio.onerror = () => { if (generationRef.current === token) setMissingClip(phoneme); };
      const playback = audio.play();
      playback?.catch?.(() => { if (generationRef.current === token) setMissingClip(phoneme); });
    };
    next();
    return true;
  }, [cancelAll, soundOn]);
  useEffect(() => { if (!soundOn) cancelAll(); }, [soundOn, cancelAll]);
  useEffect(() => () => cancelAll(), [cancelAll]);
  return { play, cancelAll, missingClip };
};
