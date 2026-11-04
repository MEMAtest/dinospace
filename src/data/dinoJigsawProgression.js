import { DINO_NAMES, LITTLE_LEVELS } from './littleGames.js';

export const JIGSAW_LEVELS = LITTLE_LEVELS.dinojigsaw;

export const jigsawPieceCount = (grid) => (
  Array.isArray(grid) && grid.length === 2 && grid.every((side) => Number.isInteger(side) && side > 0)
    ? grid[0] * grid[1]
    : 0
);

export const jigsawGuideMode = (level) => (level <= 0 ? 'full' : 'on-demand');
export const jigsawAllowsAutomaticHint = (level) => level < 2;

// Reveal the newly unlocked picture first, then rotate the remaining pictures
// between plays without repeating one within the same level.
export const jigsawSceneForRound = (scenes, shuffledScenes, unlockedCount, round, playId = 1, newlyUnlocked = true) => {
  const unlocked = scenes.slice(0, unlockedCount);
  const newest = unlocked[unlocked.length - 1];
  if (!newlyUnlocked) {
    const pool = shuffledScenes.filter((scene) => unlocked.includes(scene));
    return pool.length ? pool[(round + Math.max(0, playId - 1)) % pool.length] : newest;
  }
  if (!newest || round <= 0) return newest;
  const others = shuffledScenes.filter((scene) => unlocked.includes(scene) && scene !== newest);
  return others.length ? others[(round - 1 + Math.max(0, playId - 1)) % others.length] : newest;
};

export const jigsawTaskLine = (scene) => `Build the ${DINO_NAMES[scene?.dino] || 'dinosaur'}.`;

export const jigsawReviewLine = (scene) => `You matched each piece to its space by looking for picture parts that fit together. This is the ${DINO_NAMES[scene?.dino] || 'dinosaur'} picture.`;

export const jigsawPlacementIsCorrect = (pieceId, slotIndex, placed = []) => (
  Number.isInteger(pieceId) && Number.isInteger(slotIndex) && pieceId === slotIndex && !placed.includes(slotIndex)
);

export const jigsawCompletionCredit = ({ wrongAttempts = 0, usedPictureClue = false, usedAutoHint = false, starterGuideShown = false } = {}) => {
  const hints = Number(usedPictureClue) + Number(usedAutoHint) + Number(starterGuideShown);
  const assisted = hints > 0;
  return {
    firstAttempt: wrongAttempts === 0 && !assisted,
    independent: !assisted,
    hints,
  };
};
