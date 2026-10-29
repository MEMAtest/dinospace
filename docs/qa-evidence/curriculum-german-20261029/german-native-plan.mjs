// Authored German labels, translations, route commands, and clip paths for
// visible-control QA. This plan is read from source and never written into the
// app or browser storage. Recheck chapter selectors/counts after source freeze.
import { GERMAN_MODE_ITEMS, germanTranslation } from '../../../src/data/germanLearning.js';
import { GERMAN_DRIVE_COMMANDS, GERMAN_DRIVE_ROUTES } from '../../../src/data/germanRouteFlow.js';
import { GERMAN_AUDIO_SLUGS, getGermanAudioPath } from '../../../src/data/germanAudio.js';
import { GERMAN_CHAPTER_IDS } from '../../../src/data/germanChapterProgress.js';
import { GERMAN_MATCH_MODES } from '../../../src/data/index.js';
import { statSync } from 'node:fs';
import { resolve } from 'node:path';

const chapterTitles = ['Colour Painter', 'Vehicle Workshop', 'Direction Driver'];
const chapterGoals = [5, 6, 7];
const chapterModes = [['paint', 'park'], ['vehicles', 'parts'], ['directions']];
const chapters = GERMAN_CHAPTER_IDS.map((id, index) => ({
  id,
  title: chapterTitles[index],
  goal: chapterGoals[index],
  modes: chapterModes[index],
}));
const audioFiles = Object.entries(GERMAN_AUDIO_SLUGS).map(([term, slug]) => {
  const path = getGermanAudioPath(term);
  const localFile = resolve('public', path.slice(1));
  const bytes = statSync(localFile).size;
  return { term, slug, path, bytes };
});
if (audioFiles.length !== 72 || new Set(audioFiles.map(({ path }) => path)).size !== audioFiles.length) {
  throw new Error(`Expected 72 unique packaged German clips, found ${audioFiles.length}`);
}
const practiceMenuLabels = {
  paint: 'Farben · paint',
  park: 'Garage · park',
  ...Object.fromEntries(GERMAN_MATCH_MODES.map(({ id, label }) => [id, `${label} · practice`])),
  parts: 'Autoteile · parts',
  directions: 'Richtungen · directions',
};

const modes = Object.fromEntries(Object.entries(GERMAN_MODE_ITEMS).map(([mode, items]) => [mode, items.map((item) => ({
  name: item.name,
  translation: germanTranslation(mode, item.name),
  audioPath: getGermanAudioPath(item.name),
  ...(item.hex ? { hex: item.hex } : {}),
}))]));

process.stdout.write(JSON.stringify({
  chapters,
  practiceMenuLabels,
  modes,
  commands: GERMAN_DRIVE_COMMANDS,
  actionForCommand: {
    Links: 'Move left',
    Rechts: 'Move right',
    Geradeaus: 'Move forward',
    Zurück: 'Move back',
    Langsam: 'Slow',
    Halt: 'Stop',
  },
  routes: GERMAN_DRIVE_ROUTES,
  audioSlugs: GERMAN_AUDIO_SLUGS,
  audioFiles,
}));
