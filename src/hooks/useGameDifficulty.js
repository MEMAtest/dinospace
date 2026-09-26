import { createContext, useContext, useEffect, useState } from 'react';
import { getRecommendedDifficulty, subscribeLearningProgress } from '../data/learningProgress.js';

export const DIFFICULTY_INDEX = Object.freeze({ starter: 0, growing: 1, challenge: 2 });

export const getDifficultyIndex = (band) => DIFFICULTY_INDEX[band] ?? 0;

// The little-explorer profile pins every game to its gentlest band, so a
// younger sibling never inherits an older child's adaptive difficulty.
export const ForcedDifficultyContext = createContext(null);

export const useGameDifficulty = (gameId) => {
  const forced = useContext(ForcedDifficultyContext);
  const [band, setBand] = useState(() => getRecommendedDifficulty(gameId));

  useEffect(() => subscribeLearningProgress(() => setBand(getRecommendedDifficulty(gameId))), [gameId]);

  return forced || band;
};
