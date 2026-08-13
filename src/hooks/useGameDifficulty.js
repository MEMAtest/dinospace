import { useEffect, useState } from 'react';
import { getRecommendedDifficulty, subscribeLearningProgress } from '../data/learningProgress.js';

export const DIFFICULTY_INDEX = Object.freeze({ starter: 0, growing: 1, challenge: 2 });

export const getDifficultyIndex = (band) => DIFFICULTY_INDEX[band] ?? 0;

export const useGameDifficulty = (gameId) => {
  const [band, setBand] = useState(() => getRecommendedDifficulty(gameId));

  useEffect(() => subscribeLearningProgress(() => setBand(getRecommendedDifficulty(gameId))), [gameId]);

  return band;
};
