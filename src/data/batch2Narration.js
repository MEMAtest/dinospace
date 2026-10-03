import { PUZZLE_POP_CHAPTERS } from './puzzlePopBatch2.js';
import { SPOT_DIFFERENCE_CHAPTERS, SPOT_DIFFERENCE_SCENES } from './spotDifferenceBatch2.js';
import { SKY_SHAPE_MISSIONS, SKY_SHAPE_TEACHING } from './skyShapes.js';
import { MONSTER_QUESTION_POOLS } from './monsterMathEpisodes.js';

export const puzzlePopNarration = Object.freeze({
  start: (chapter, scene) => `Puzzle Pop. ${chapter.name}. ${chapter.skill} Build the ${scene.title} picture.`,
  prompt: (scene) => `Build the ${scene.title} picture. Choose a piece, then tap its matching space.`,
  completed: (scene) => `Picture complete. ${scene.fact}`,
  hint: (pieceNumber) => `Piece ${pieceNumber} goes in the glowing space.`,
  next: (scene) => `Next picture. Build ${scene.title}. ${scene.helper || 'Compare each piece with the preview.'}`,
});

export const spotDifferenceNarration = Object.freeze({
  start: (chapter, scene) => `Spot the difference. ${chapter.name}. Compare ${scene.title}. Find ${scene.differences.length} changes.`,
  completed: (scene) => `You found every change. ${scene.fact}`,
  hint: (x, y) => `Look near the ${x < 35 ? 'left' : x > 65 ? 'right' : 'middle'} ${y < 35 ? 'top' : y > 65 ? 'bottom' : 'area'} of Picture B.`,
  next: (scene) => `Next pair. ${scene.title}. Find ${scene.differences.length} changes.`,
  prompt: (scene) => `Find ${scene.differences.length} changes in ${scene.title}. Tap the changed detail in Picture B.`,
});

export const skyShapeNarration = Object.freeze({
  choose: 'Choose a sky. Start each outline at its green dot and follow the glowing route.',
  prompt: (episodeNumber, mission) => `Sky ${episodeNumber}. Trace the ${mission.name}. Start at the green dot.`,
  completed: (mission) => `Great job tracing the ${mission.name}! You followed every glowing path.`,
  completionSegments: (mission) => [skyShapeNarration.completed(mission), SKY_SHAPE_TEACHING[mission.id].explanation],
  hint: (pathIndex, cursorIndex) => pathIndex === 0 && cursorIndex === 0
    ? 'Begin at green one, then follow the glowing dots in order.'
    : 'Continue at the next green dot. Stay close to the bright line.',
  replay: (mission) => `Trace the ${mission.name}. Start at the green dot and follow the glowing route.`,
});

const sentenceSegments = (text) => text.split(/(?<=[.!?])\s+/).filter(Boolean);
const quantityPhraseSegments = (sentence) => {
  const subjectQuantity = sentence.match(/^(.+?\b(?:has|had|starts with|finds|found|gives)) (.+[.!?])$/);
  if (subjectQuantity) return [subjectQuantity[1], subjectQuantity[2]];
  const resultQuantity = sentence.match(/^(Now there (?:is|are)) (.+[.!?])$/);
  if (resultQuantity) return [resultQuantity[1], resultQuantity[2]];
  return [sentence];
};
const questionSegments = (question, text) => sentenceSegments(text).flatMap((sentence) => (
  question.kind.startsWith('word-') ? quantityPhraseSegments(sentence) : [sentence]
));

export const speakPackagedBatch2Line = (speak, text) => speak(text, { segments: [text] });

export const monsterMathNarration = Object.freeze({
  retry: (question) => `Try again. ${question.clue}`,
  promptSegments: (question) => questionSegments(question, question.prompt),
  clueSegments: (question) => sentenceSegments(question.clue),
  retrySegments: (question) => ['Try again.', ...sentenceSegments(question.clue)],
  explanationSegments: (question) => questionSegments(question, question.explanation),
});

const batch2NarrationGroups = {
  puzzlePop: new Set(),
  spotDifference: new Set(),
  skyShapes: new Set(),
  monsterMath: new Set(),
};
const addLine = (group, line) => { if (line) batch2NarrationGroups[group].add(line); };

PUZZLE_POP_CHAPTERS.forEach((chapter) => chapter.scenes.forEach((scene) => {
  addLine('puzzlePop', puzzlePopNarration.start(chapter, scene));
  addLine('puzzlePop', puzzlePopNarration.prompt(scene));
  addLine('puzzlePop', puzzlePopNarration.completed(scene));
  addLine('puzzlePop', puzzlePopNarration.next(scene));
}));
for (let piece = 1; piece <= 25; piece += 1) addLine('puzzlePop', puzzlePopNarration.hint(piece));

SPOT_DIFFERENCE_SCENES.forEach((scene) => {
  const chapter = SPOT_DIFFERENCE_CHAPTERS[scene.chapterIndex];
  addLine('spotDifference', spotDifferenceNarration.start(chapter, scene));
  addLine('spotDifference', spotDifferenceNarration.completed(scene));
  addLine('spotDifference', spotDifferenceNarration.next(scene));
  addLine('spotDifference', spotDifferenceNarration.prompt(scene));
  scene.differences.forEach(({ x, y }) => addLine('spotDifference', spotDifferenceNarration.hint(x, y)));
});

addLine('skyShapes', skyShapeNarration.choose);
SKY_SHAPE_MISSIONS.forEach((mission) => {
  addLine('skyShapes', skyShapeNarration.prompt(mission.episodeIndex + 1, mission));
  addLine('skyShapes', skyShapeNarration.replay(mission));
  addLine('skyShapes', skyShapeNarration.completed(mission));
  addLine('skyShapes', SKY_SHAPE_TEACHING[mission.id].explanation);
  for (let pathIndex = 0; pathIndex < mission.paths.length; pathIndex += 1) {
    addLine('skyShapes', skyShapeNarration.hint(pathIndex, 0));
    if (pathIndex > 0) addLine('skyShapes', skyShapeNarration.hint(pathIndex, 1));
  }
});

MONSTER_QUESTION_POOLS.flat().forEach((question) => {
  [
    ...monsterMathNarration.promptSegments(question),
    ...monsterMathNarration.clueSegments(question),
    ...monsterMathNarration.retrySegments(question),
    ...monsterMathNarration.explanationSegments(question),
  ].forEach((line) => addLine('monsterMath', line));
});

export const BATCH2_VOICE_CORPUS_BY_GAME = Object.freeze(Object.fromEntries(Object.entries(batch2NarrationGroups)
  .map(([game, lines]) => [game, Object.freeze([...lines].sort((left, right) => left.localeCompare(right)))])));
export const BATCH2_VOICE_LINES = Object.freeze([...new Set(Object.values(BATCH2_VOICE_CORPUS_BY_GAME).flat())]
  .sort((left, right) => left.localeCompare(right)));
