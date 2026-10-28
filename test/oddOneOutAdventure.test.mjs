import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ODD_ONE_OUT_CHAPTERS, ODD_ONE_OUT_NARRATION, ODD_ONE_OUT_ROUNDS,
  ODD_ONE_OUT_ROUNDS_BY_CHAPTER, seededOddOneOutRun,
} from '../src/data/oddOneOutAdventure.js';
import {
  ODD_ONE_OUT_PROGRESS_VERSION, normalizeOddOneOutProgress, oddOneOutProgressKey, readOddOneOutProgress,
  recordOddOneOutRound, recentOddOneOutRoundIds,
} from '../src/data/oddOneOutProgress.js';

const oddOneOutComponentSource = readFileSync(new URL('../src/components/games/OddOneOut.jsx', import.meta.url), 'utf8');

const memoryStorage = () => {
  const values = new Map();
  return {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, String(value)); },
    values,
  };
};

test('adventure has three named chapters with six unique rounds apiece', () => {
  assert.equal(ODD_ONE_OUT_CHAPTERS.length, 3);
  assert.deepEqual(ODD_ONE_OUT_CHAPTERS.map(({ id }) => id), ['things-and-places', 'look-and-notice', 'little-rules']);
  assert.equal(ODD_ONE_OUT_ROUNDS.length, 18);
  assert.equal(new Set(ODD_ONE_OUT_ROUNDS.map(({ id }) => id)).size, 18);
  for (const chapter of ODD_ONE_OUT_CHAPTERS) {
    assert.equal(ODD_ONE_OUT_ROUNDS_BY_CHAPTER[chapter.id].length, 6);
  }
});

test('every round has four unique choices, an explicit property, a valid odd item and one because answer', () => {
  for (const round of ODD_ONE_OUT_ROUNDS) {
    assert.ok(round.property.length > 15, `${round.id} states a useful property`);
    assert.equal(round.items.length, 4, round.id);
    assert.equal(new Set(round.items.map(({ id }) => id)).size, 4, round.id);
    assert.ok(round.items.some(({ id }) => id === round.oddItemId), round.id);
    assert.ok(round.because.endsWith('.'), round.id);
    assert.ok(round.fact.endsWith('.'), round.id);
    assert.equal(round.choices.filter(({ correct }) => correct).length, 1, round.id);
    assert.equal(round.choices.find(({ correct }) => correct).text, `Because ${round.because}`, round.id);
    assert.ok(round.choices.every(({ text }) => typeof text === 'string' && text.length > 12), round.id);
    assert.ok(round.choices.find(({ correct }) => correct).text.startsWith('Because '), round.id);
    assert.equal(round.choices.length, 3, round.id);
    assert.equal(new Set(round.choices.map(({ text }) => text)).size, 3, round.id);
    assert.ok(round.prompt.includes(round.property), round.id);
  }
  assert.equal(ODD_ONE_OUT_NARRATION.length, 53);
  assert.equal(new Set(ODD_ONE_OUT_NARRATION.map(({ text }) => text)).size, 53, 'the finite narration inventory is deduplicated by exact text');
});

test('rule examples have the declared exception and all four option records stay together', () => {
  const byId = Object.fromEntries(ODD_ONE_OUT_ROUNDS.map((round) => [round.id, round]));
  assert.equal(byId['semantic-fruit'].oddItemId, 'carrot');
  assert.equal(byId['visual-colour'].items.find(({ id }) => id === byId['visual-colour'].oddItemId).color, 'red');
  assert.equal(byId['rule-dots'].items.find(({ id }) => id === byId['rule-dots'].oddItemId).count, 3);
  assert.equal(byId['rule-letters'].items.find(({ id }) => id === byId['rule-letters'].oddItemId).text, 'CAT');
  assert.equal(byId['visual-sides'].explanation, byId['rule-shapes'].explanation, 'the same accurate triangle recording supports both classification scenes');
  assert.equal(byId['rule-even'].items.find(({ id }) => id === byId['rule-even'].oddItemId).value, 5);
});

test('every art id reachable from round data has an explicit SVG branch and no text placeholder fallback', () => {
  const reachableArtIds = new Set(ODD_ONE_OUT_ROUNDS.flatMap(({ items }) => items.map(({ art }) => art)));
  const explicitBranchIds = new Set([...oddOneOutComponentSource.matchAll(/art === '([^']+)'/g)].map(([, id]) => id));
  for (const [, groupedIds] of oddOneOutComponentSource.matchAll(/\[([^\]]+)\]\.includes\(art\)/g)) {
    for (const [, id] of groupedIds.matchAll(/'([^']+)'/g)) explicitBranchIds.add(id);
  }
  assert.deepEqual([...reachableArtIds].filter((id) => !explicitBranchIds.has(id)), []);
  assert.match(oddOneOutComponentSource, /else throw new Error\(`Odd One Out has no illustration for art id:/);
  assert.doesNotMatch(oddOneOutComponentSource, /String\(art\)\.slice/);
  assert.match(oddOneOutComponentSource, /art === 'kite'\) image = <><path[^\n]+fill=\{fill\}/);
  assert.match(oddOneOutComponentSource, /type === 'fish' \? fill[^\n]+fill=\{type === 'fish' \? fill/);
});

test('seeded run freezes round, card, and because ordering and avoids an eligible recent first round', () => {
  const chapterId = ODD_ONE_OUT_CHAPTERS[0].id;
  const runA = seededOddOneOutRun(chapterId, 42, []);
  const runB = seededOddOneOutRun(chapterId, 42, []);
  assert.deepEqual(runA.map(({ id, options, choices }) => ({ id, options: options.map((item) => item.id), choices: choices.map((choice) => choice.id) })), runB.map(({ id, options, choices }) => ({ id, options: options.map((item) => item.id), choices: choices.map((choice) => choice.id) })));
  assert.equal(new Set(runA.map(({ id }) => id)).size, 6);
  for (const question of runA) {
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options.map(({ id }) => id)).size, 4);
    assert.equal(question.choices.filter(({ correct }) => correct).length, 1);
  }
  const avoided = seededOddOneOutRun(chapterId, 42, [runA[0].id]);
  assert.notEqual(avoided[0].id, runA[0].id);
});

test('progress is player-scoped, validates loaded values, and does not unlock from partial chapter work', () => {
  const storage = memoryStorage();
  const chapter = ODD_ONE_OUT_CHAPTERS[0];
  const rounds = ODD_ONE_OUT_ROUNDS_BY_CHAPTER[chapter.id];
  const result = recordOddOneOutRound('player-a', chapter.id, rounds[0].id, storage);
  assert.equal(result.persisted, true);
  assert.equal(result.newlyCompletedChapter, false);
  assert.equal(result.unlockedChapter, chapter.id);
  assert.equal(readOddOneOutProgress('player-b', storage).completedRoundIds.length, 0);
  assert.deepEqual(recentOddOneOutRoundIds(chapter.id, 'player-a', storage), [rounds[0].id]);
  recordOddOneOutRound('player-a', chapter.id, rounds[0].id, storage);
  assert.deepEqual(recentOddOneOutRoundIds(chapter.id, 'player-a', storage), [rounds[0].id, rounds[0].id], 'recent history retains repeated replay order');
  const polluted = normalizeOddOneOutProgress({ version: ODD_ONE_OUT_PROGRESS_VERSION, completedRoundIds: [rounds[0].id, 'not-a-round', 7], completedChapterIds: ['bad'], unlockedChapter: 'little-rules' });
  assert.deepEqual(polluted.completedRoundIds, [rounds[0].id]);
  assert.deepEqual(polluted.completedChapterIds, []);
  assert.equal(polluted.unlockedChapter, chapter.id);
  assert.equal(oddOneOutProgressKey('player-a'), 'player-a_oddoneout_progress_v1');
});

test('only completion of every chapter round unlocks the next chapter, and repeat awards are idempotent', () => {
  const storage = memoryStorage();
  const [first, second] = ODD_ONE_OUT_CHAPTERS;
  const chapterRounds = ODD_ONE_OUT_ROUNDS_BY_CHAPTER[first.id];
  let last;
  for (const round of chapterRounds) last = recordOddOneOutRound('amari', first.id, round.id, storage, { independent: false });
  assert.equal(last.persisted, true);
  assert.equal(last.newlyCompletedChapter, true);
  assert.equal(last.unlockedChapter, second.id);
  assert.deepEqual(last.bestStars[first.id], 2, 'assisted/retried chapter completion does not claim three-star mastery');
  const replayResult = recordOddOneOutRound('amari', first.id, chapterRounds[0].id, storage);
  assert.equal(replayResult.newlyCompletedChapter, false);
  assert.equal(replayResult.unlockedChapter, second.id);
  assert.equal(readOddOneOutProgress('amari', storage).completedRoundIds.length, 6);
  const locked = recordOddOneOutRound('amari', ODD_ONE_OUT_CHAPTERS[2].id, ODD_ONE_OUT_ROUNDS_BY_CHAPTER[ODD_ONE_OUT_CHAPTERS[2].id][0].id, storage, { independent: true });
  assert.equal(locked.persisted, false, 'later chapter writes are rejected until earlier chapters unlock them');
});

test('three-star mastery requires an independent, unassisted first answer on every chapter round', () => {
  const storage = memoryStorage();
  const chapter = ODD_ONE_OUT_CHAPTERS[0];
  const rounds = ODD_ONE_OUT_ROUNDS_BY_CHAPTER[chapter.id];
  for (const round of rounds) recordOddOneOutRound('independent-player', chapter.id, round.id, storage, { independent: true });
  assert.equal(readOddOneOutProgress('independent-player', storage).bestStars[chapter.id], 3);
});

test('storage read and write failures return safe defaults and never claim a save', () => {
  const brokenRead = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.equal(readOddOneOutProgress('amari', brokenRead).completedRoundIds.length, 0);
  const round = ODD_ONE_OUT_ROUNDS[0];
  const result = recordOddOneOutRound('amari', round.chapterId, round.id, brokenRead);
  assert.equal(result.persisted, false);
  assert.equal(result.newlyCompletedChapter, false);
  assert.equal(readOddOneOutProgress('amari', brokenRead).completedRoundIds.length, 0);
});
