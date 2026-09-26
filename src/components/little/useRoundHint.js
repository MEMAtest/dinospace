import { useCallback, useEffect, useRef, useState } from 'react';

const INTRO_DELAY_MS = 1300;
const IDLE_MS = 8000;

// When to show the "show me" hand in a round:
//  - at the start of the first round (a demo), until the child touches;
//  - after two mistakes in the round;
//  - after eight quiet seconds.
export const useRoundHint = ({ demo = false } = {}) => {
  const [mistakes, setMistakes] = useState(0);
  const [intro, setIntro] = useState(false);
  const [idle, setIdle] = useState(false);
  const [touched, setTouched] = useState(false);
  const idleTimer = useRef(null);

  useEffect(() => {
    const introTimer = demo ? setTimeout(() => setIntro(true), INTRO_DELAY_MS) : null;
    idleTimer.current = setTimeout(() => setIdle(true), IDLE_MS);
    return () => {
      clearTimeout(introTimer);
      clearTimeout(idleTimer.current);
    };
  }, [demo]);

  const touch = useCallback(() => {
    setTouched(true);
    setIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), IDLE_MS);
  }, []);

  const mistake = useCallback(() => {
    setMistakes((count) => count + 1);
    touch();
  }, [touch]);

  return {
    showHint: (intro && !touched) || mistakes >= 2 || idle,
    strongHint: mistakes >= 2,
    mistakes,
    mistake,
    touch,
  };
};
