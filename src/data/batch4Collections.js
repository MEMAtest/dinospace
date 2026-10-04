import { ARITHMETIC_CHAPTERS, SUBTRACTION_CHAPTERS } from './arithmeticAdventure.js';
import { getArithmeticProgress } from './arithmeticProgress.js';
import { TIME_CHAPTERS, NUMBER_LINE_CHAPTERS } from './timeLineAdventure.js';
import { getTimeLineProgress } from './timeLineProgress.js';

const definitions = [
  { id: 'addition', title: 'Addition discoveries', chapters: ARITHMETIC_CHAPTERS, read: getArithmeticProgress },
  { id: 'subtraction', title: 'Subtraction discoveries', chapters: SUBTRACTION_CHAPTERS, read: getArithmeticProgress },
  { id: 'timeteller', title: 'Clock explorer badges', chapters: TIME_CHAPTERS, read: getTimeLineProgress },
  { id: 'numberline', title: 'Number line journeys', chapters: NUMBER_LINE_CHAPTERS, read: getTimeLineProgress },
];

// The shelf reads completed records for this child; opening it grants nothing.
export const getBatch4Collections = (playerId, storage) => definitions.map(({ id, title, chapters, read }) => {
  let progress;
  try { progress = read(id, playerId, storage); } catch { progress = {}; }
  return {
    id, title,
    entries: chapters.map((chapter, index) => ({
      id: `${id}:${chapter.id}`, name: chapter.title, variant: index,
      earned: (progress.completedChapterIds || []).includes(chapter.id)
        && (progress.bestStars?.[chapter.id] || 0) >= 1,
    })),
  };
});
