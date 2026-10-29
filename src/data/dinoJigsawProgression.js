import { DINO_NAMES, LITTLE_LEVELS } from './littleGames.js';

export const JIGSAW_LEVELS = LITTLE_LEVELS.dinojigsaw;

export const jigsawPieceCount = (grid) => (
  Array.isArray(grid) && grid.length === 2 && grid.every((side) => Number.isInteger(side) && side > 0)
    ? grid[0] * grid[1]
    : 0
);

export const jigsawGuideMode = (level) => (level <= 0 ? 'full' : 'on-demand');
export const jigsawAllowsAutomaticHint = (level) => level < 2;

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
