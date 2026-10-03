import test from 'node:test';
import assert from 'node:assert/strict';
import { createAdditionRun, createSubtractionRun, isValidArithmeticRun } from '../src/data/arithmeticAdventure.js';
import { arithmeticProgressKey, getArithmeticProgress, normalizeArithmeticProgress, saveArithmeticRun } from '../src/data/arithmeticProgress.js';

const store = () => { const data = new Map(); return { getItem: k => data.get(k) ?? null, setItem: (k,v) => data.set(k,v), set(k,v) { data.set(k,v); } }; };
for (const game of ['addition', 'subtraction']) test(`${game}: seeded runs have six distinct bounded valid models and unique shuffled choices`, () => {
  const make = game === 'addition' ? createAdditionRun : createSubtractionRun;
  for (let chapter = 0; chapter < 3; chapter++) for (let seed = 1; seed <= 20; seed++) {
    const run = make({ chapter, seed }); assert.equal(isValidArithmeticRun(run, game, chapter), true); assert.equal(new Set(run.map(q=>q.id)).size, 6);
    for (const q of run) { assert.equal(q.options.length, 4); assert.equal(new Set(q.options).size, 4); assert.equal(q.options.filter(n=>n===q.answer).length, 1); assert.ok(q.answer >= 0 && q.answer <= (chapter ? 20 : 10));
      if (game === 'addition') { assert.equal(q.type === 'bond' ? q.a + q.b === q.total : q.a + q.b === q.answer, true); if (q.type === 'groups') assert.ok(q.a + q.b <= 10); }
      else if (q.type === 'compare') assert.equal(Math.abs(q.a-q.b), q.answer); else { assert.equal(q.a-q.b, q.answer); assert.ok(q.b <= q.a); }
    }
  }
  assert.deepEqual(make({ chapter: 1, seed: 42 }), make({ chapter: 1, seed: 42 }));
  assert.notDeepEqual(make({ chapter: 1, seed: 42 }), make({ chapter: 1, seed: 43 }));
});

test('addition includes empty groups, zero totals, bonds and held context-specific stories', () => {
  const run = createAdditionRun({ chapter: 0, seed: 300 });
  // Pool invariants are checked across deterministic seeds so edge cases are not dependent on one sample.
  const all = Array.from({length:100},(_,i)=>createAdditionRun({chapter:0,seed:i+1})).flat();
  assert.ok(all.some(q=>q.a===0)); assert.ok(all.some(q=>q.b===0)); assert.ok(all.some(q=>q.answer===0));
  assert.ok(run.every(q=>q.type==='groups' && q.explanation.length>0));
  const bonds = createAdditionRun({chapter:1,seed:14}); assert.ok(bonds.every(q=>q.type==='bond' && q.total===q.a+q.b));
  const stories = createAdditionRun({chapter:2,seed:23}); assert.ok(stories.every(q=>q.type==='story' && q.prompt.includes('has')));
});

test('subtraction includes zero/equality and comparison is a distinct unmatched model', () => {
  const sample = createSubtractionRun({ chapter: 1, seed: 5 }); assert.ok(sample.every(q=>q.type==='compare'));
  const all = Array.from({length:100},(_,i)=>createSubtractionRun({chapter:0,seed:i+1})).flat();
  assert.ok(all.some(q=>q.a===0 && q.b===0)); assert.ok(all.some(q=>q.a===q.b));
  assert.ok(sample.every(q=>q.explanation.includes('unpaired')));
  const stories = createSubtractionRun({chapter:2,seed:80}); assert.ok(stories.every(q=>q.type==='story' && q.a>=q.b));
});

test('progress is child scoped, contiguous, rejects corrupted and locked chapter awards, and never inflates stars', () => {
  const storage = store(); const first = createAdditionRun({chapter:0,seed:1}); const second = createAdditionRun({chapter:1,seed:2});
  assert.equal(saveArithmeticRun('addition','child-a',1,second,3,storage), null);
  const earned = saveArithmeticRun('addition','child-a',0,first,3,storage); assert.equal(earned.awardedStars,3); assert.equal(earned.progress.unlockedChapter,1);
  assert.equal(saveArithmeticRun('addition','child-a',0,first,2,storage).awardedStars,0);
  assert.equal(getArithmeticProgress('addition','child-b',storage).completedChapterIds.length,0);
  storage.set(arithmeticProgressKey('addition','child-corrupt'), JSON.stringify({version:1,completedChapterIds:['stories'],bestStars:{stories:3},unlockedChapter:99,recentQuestionIds:{9:['orphan']}}));
  const clean = getArithmeticProgress('addition','child-corrupt',storage); assert.deepEqual(clean.completedChapterIds,[]); assert.deepEqual(clean.bestStars,{}); assert.equal(clean.unlockedChapter,0); assert.deepEqual(clean.recentQuestionIds,{});
  const normalized = normalizeArithmeticProgress({version:1,completedChapterIds:['groups','stories'],bestStars:{groups:2,stories:3},unlockedChapter:2},'addition');
  assert.deepEqual(normalized.completedChapterIds,['groups']); assert.deepEqual(normalized.bestStars,{groups:2}); assert.equal(normalized.unlockedChapter,1);
  assert.equal(saveArithmeticRun('addition','child-a',1,[...second.slice(0,5),{...second[5], options:[second[5].answer,second[5].answer,1,2]}],1,storage),null);
});

