import { useCallback, useEffect, useState } from 'react';
import {
  getLearningSnapshot,
  setActivePhase,
  setDifficultyOverride,
  subscribeLearningProgress,
  toggleTaughtSound,
} from '../data/learningProgress.js';

export const useLearningProgress = () => {
  const [snapshot, setSnapshot] = useState(() => getLearningSnapshot());
  const refresh = useCallback(() => setSnapshot(getLearningSnapshot()), []);

  useEffect(() => subscribeLearningProgress(refresh), [refresh]);

  return {
    ...snapshot,
    setPhase: setActivePhase,
    toggleSound: toggleTaughtSound,
    setDifficulty: setDifficultyOverride,
    refresh,
  };
};
