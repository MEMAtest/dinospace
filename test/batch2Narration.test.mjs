import test from 'node:test';
import assert from 'node:assert/strict';
import { BATCH2_VOICE_CORPUS_BY_GAME, BATCH2_VOICE_LINES, monsterMathNarration, puzzlePopNarration, skyShapeNarration, spotDifferenceNarration, speakPackagedBatch2Line } from '../src/data/batch2Narration.js';
import { PUZZLE_POP_CHAPTERS } from '../src/data/puzzlePopBatch2.js';
import { SPOT_DIFFERENCE_CHAPTERS, SPOT_DIFFERENCE_SCENES } from '../src/data/spotDifferenceBatch2.js';
import { SKY_SHAPE_MISSIONS } from '../src/data/skyShapes.js';
import { MONSTER_QUESTION_POOLS } from '../src/data/monsterMathEpisodes.js';
import { voiceClipKey } from '../src/data/voiceKey.js';

test('all fixed authored Batch 2 narration lines enter the finite offline voice corpus', () => {
  assert.ok(BATCH2_VOICE_LINES.length > 0);
  const keys = BATCH2_VOICE_LINES.map((line) => voiceClipKey(line, 'en-US'));
  assert.equal(new Set(keys).size, BATCH2_VOICE_LINES.length, 'each corpus line has a unique normalized clip key');
});

test('fixed Batch 2 lines request packaged-only playback while the clip inventory is incomplete', () => {
  let call;
  speakPackagedBatch2Line((...args) => { call = args; }, 'A fixed authored line.');
  assert.equal(call[0], 'A fixed authored line.');
  assert.deepEqual(call[1], { segments: ['A fixed authored line.'] });
});

test('Puzzle Pop and Spot the Difference runtime builders agree with corpus text', () => {
  const corpus = new Set(BATCH2_VOICE_LINES);
  PUZZLE_POP_CHAPTERS.forEach((chapter) => chapter.scenes.forEach((scene) => {
    [puzzlePopNarration.start(chapter, scene), puzzlePopNarration.prompt(scene), puzzlePopNarration.completed(scene), puzzlePopNarration.next(scene)].forEach((line) => assert.ok(corpus.has(line), line));
  }));
  for (let piece = 1; piece <= 25; piece += 1) assert.ok(corpus.has(puzzlePopNarration.hint(piece)));
  SPOT_DIFFERENCE_SCENES.forEach((scene) => {
    const chapter = SPOT_DIFFERENCE_CHAPTERS[scene.chapterIndex];
    [spotDifferenceNarration.start(chapter, scene), spotDifferenceNarration.completed(scene), spotDifferenceNarration.next(scene), spotDifferenceNarration.prompt(scene)].forEach((line) => assert.ok(corpus.has(line), line));
    scene.differences.forEach(({ x, y }) => assert.ok(corpus.has(spotDifferenceNarration.hint(x, y))));
  });
});

test('Sky and Monster Math spoken prompts, hints, retries, and explanations are covered', () => {
  const corpus = new Set(BATCH2_VOICE_LINES);
  assert.ok(corpus.has(skyShapeNarration.choose));
  SKY_SHAPE_MISSIONS.forEach((mission) => {
    assert.ok(corpus.has(skyShapeNarration.prompt(mission.episodeIndex + 1, mission)));
    assert.ok(corpus.has(skyShapeNarration.replay(mission)));
    assert.ok(corpus.has(skyShapeNarration.completed(mission)));
    for (let pathIndex = 0; pathIndex < mission.paths.length; pathIndex += 1) assert.ok(corpus.has(skyShapeNarration.hint(pathIndex, 0)));
  });
  MONSTER_QUESTION_POOLS.flat().forEach((question) => {
    const scripts = [
      [question.prompt, monsterMathNarration.promptSegments(question)],
      [question.clue, monsterMathNarration.clueSegments(question)],
      [monsterMathNarration.retry(question), monsterMathNarration.retrySegments(question)],
      [question.explanation, monsterMathNarration.explanationSegments(question)],
    ];
    scripts.forEach(([line, segments]) => {
      assert.equal(segments.join(' '), line, `segments must reassemble exactly: ${line}`);
      segments.forEach((segment) => assert.ok(corpus.has(segment), segment));
    });
  });
});

test('Monster story narration reuses scaffolds with intact quantity phrases', () => {
  const add = MONSTER_QUESTION_POOLS[2].find(({ id }) => id === 'story:add:mira-shells:2:3');
  assert.deepEqual(monsterMathNarration.promptSegments(add), [
    'Mira has', '2 shells.', 'Mira finds', '3 more.', 'How many shells are there now?',
  ]);
  assert.deepEqual(monsterMathNarration.explanationSegments(add), [
    'Mira had', '2 shells.', 'Mira found', '3 more.', 'Now there are', '5 shells.',
  ]);

  const subtract = MONSTER_QUESTION_POOLS[2].find(({ id }) => id === 'story:subtract:mira-shells:3:1');
  assert.deepEqual(monsterMathNarration.promptSegments(subtract), [
    'Mira has', '3 shells.', 'Mira gives', '1 shell away.', 'How many are left?',
  ]);
  assert.ok(monsterMathNarration.promptSegments(add).every((segment) => !/^\d+[.!?]?$/.test(segment)), 'never split quantity phrases into bare number clips');
});

test('batch2-only offline voice generator dry run reports finite inventory without generation', async () => {
  const { spawnSync } = await import('node:child_process');
  const { fileURLToPath } = await import('node:url');
  const scriptPath = fileURLToPath(new URL('../scripts/generate-batch1-offline-voices.mjs', import.meta.url));
  const result = spawnSync(process.execPath, [scriptPath, '--batch2-only', '--dry-run', '--max-calls=1'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout.trim());
  assert.equal(report.batch2Only, true);
  assert.equal(report.dryRun, true);
  assert.equal(report.requested, BATCH2_VOICE_LINES.length);
  assert.equal(report.pending + report.ready, report.requested);
  assert.equal(report.maxCalls, 1);
  assert.deepEqual(Object.keys(report.breakdown).sort(), ['batch2MonsterMath', 'batch2PuzzlePop', 'batch2SkyShapes', 'batch2SpotDifference'].sort());
  assert.deepEqual(Object.keys(BATCH2_VOICE_CORPUS_BY_GAME).sort(), ['monsterMath', 'puzzlePop', 'skyShapes', 'spotDifference'].sort());

  const readiness = spawnSync(process.execPath, [scriptPath, '--batch2-only', '--check-ready'], { encoding: 'utf8' });
  const readinessReport = JSON.parse(readiness.stdout.trim());
  assert.equal(readiness.status, readinessReport.pending > 0 ? 1 : 0, 'release gate must reject incomplete physical clip coverage');
  assert.equal(readinessReport.requested, report.requested);
});
