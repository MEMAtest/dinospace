import { COUNT_CONSTELLATION_PAGES, COUNT_THE_STARS_EPISODES } from './countTheStarsBatch3.js';
import { getCountTheStarsProgress } from './countTheStarsProgress.js';
import { DINO_DETECTIVE_WORLDS } from './dinoDetectiveBatch3.js';
import { getDinoDetectiveProgress } from './dinoDetectiveProgress.js';
import { LETTER_TRACE_LEVELS, getLetterTraceProgress } from './letterTraceLearning.js';
import { COSMIC_BOARDS_PER_CHAPTER, COSMIC_CHAPTERS, getCosmicProgress } from './cosmicTactics.js';

const safely = (read) => { try { return read() || {}; } catch { return {}; } };

// Read the same child-scoped game records used by completion screens. Opening
// the shelf never awards a badge or changes progress.
export const getBatch3Collections = (playerId, storage) => {
  const counting = safely(() => getCountTheStarsProgress(playerId, storage));
  const dino = safely(() => getDinoDetectiveProgress(playerId, storage));
  const trace = safely(() => getLetterTraceProgress(playerId, storage));
  const cosmic = safely(() => getCosmicProgress(playerId, storage));
  return [
    {
      id: 'counting', title: 'Constellation pages',
      entries: COUNT_CONSTELLATION_PAGES.map((page, index) => ({
        id: page.id, name: page.name, art: 'constellation', variant: index,
        earned: (counting.earnedConstellationPageIds || []).includes(page.id)
          && (counting.completedEpisodeIds || []).includes(COUNT_THE_STARS_EPISODES[index].id),
      })),
    },
    {
      id: 'trace', title: 'Letter Trace chapters',
      entries: LETTER_TRACE_LEVELS.map((level, index) => ({
        id: level.id, name: level.title, art: 'trace', variant: index,
        earned: (trace.completedLevels || []).includes(index),
      })),
    },
    {
      id: 'tictactoe', title: 'Cosmic tactic badges',
      entries: COSMIC_CHAPTERS.map((chapter, index) => ({
        id: chapter.id, name: chapter.title, art: 'tactic', variant: index,
        earned: (cosmic.badges || []).includes(chapter.id)
          && (cosmic.completedByChapter || [])[index] === COSMIC_BOARDS_PER_CHAPTER,
      })),
    },
    {
      id: 'dino', title: 'Dino world discoveries',
      entries: DINO_DETECTIVE_WORLDS.map((world) => ({
        id: world.stickerId, name: world.stickerName, art: 'dino', species: world.targetSpecies,
        earned: (dino.earnedWorldStickerIds || []).includes(world.stickerId)
          && (dino.completedWorldIds || []).includes(world.id),
      })),
    },
  ];
};
