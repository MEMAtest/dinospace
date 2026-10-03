import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ASTRONAUT_MISSIONS, BATCH6_PROGRESS_KEY, CHESS_PUZZLES, HANGMAN_WORDS_BY_BAND,
  PATTERN_MISSIONS, chessLegalMoves, isSafeChessCapture, makeFreshQueue, makeQueue, seededRandom, seededShuffle,
  readBatch6Progress, saveBatch6Run, validateAstronautMission,
  chessPieceAttacks, validateChessPuzzle, validatePatternMission, validateTaughtWord,
} from '../src/data/batch6Games.js';
import { PHASE_SOUNDS } from '../src/data/learningProgress.js';
import { BATCH6_SPOKEN_PHRASES, speakBatch6 } from '../src/data/batch6Narration.js';

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  failWrites = false;
  setItem(key, value) { if (this.failWrites) throw new Error('storage disabled'); this.values.set(key, String(value)); }
}

test('Pattern Parade has six validated missions per run, with distinct full signatures and rules', () => {
  for (const missions of Object.values(PATTERN_MISSIONS)) {
    assert.ok(missions.length >= 48, 'at least eight six-question runs are available before pool exhaustion');
    assert.equal(new Set(missions.map((mission) => mission.signature)).size, missions.length);
    assert.ok(missions.every(validatePatternMission));
    assert.equal(missions.filter((mission) => ['AB', 'AAB', 'ABB', 'ABC', 'growing'].includes(mission.rule)).length, missions.length);
    const queue = makeQueue(missions, 6, 714);
    assert.equal(queue.length, 6);
    assert.equal(new Set(queue.map((mission) => mission.signature)).size, 6);
  }
  const alternate = PATTERN_MISSIONS.challenge.find((mission)=>mission.growthRule==='alternate');
  assert.equal(validatePatternMission(alternate),true);
  assert.equal(validatePatternMission({...alternate,answer:'🔴🔵🟡🟢'}),false,'growing answers follow the explicitly alternating token rule');
  assert.ok(PATTERN_MISSIONS.challenge.slice(6).every((mission)=>!/(red|blue|dino|rocket|star|moon)/i.test(`${mission.label} ${mission.fact}`)),'remixes use label/fact wording that does not claim a hidden palette');
  const previous = globalThis.localStorage;
  globalThis.localStorage = new MemoryStorage();
  try {
    const recent = new Set();
    for (let run = 1; run <= 8; run += 1) {
      const queue = makeFreshQueue('pattern','eight-runs',PATTERN_MISSIONS.starter,6,run*714,(item)=>item.signature);
      assert.equal(queue.length, 6);
      assert.ok(queue.every((item)=>!recent.has(item.signature)));
      queue.forEach((item)=>recent.add(item.signature));
    }
  } finally {
    if (previous === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previous;
  }
});

test('Dino Hangman only offers words whose complete authored graphemes were taught', () => {
  const taught = PHASE_SOUNDS[2];
  assert.ok(HANGMAN_WORDS_BY_BAND.starter.filter((entry) => validateTaughtWord(entry, taught)).length >= 6);
  assert.ok(HANGMAN_WORDS_BY_BAND.growing.filter((entry) => validateTaughtWord(entry, taught)).length >= 6);
  assert.ok(HANGMAN_WORDS_BY_BAND.challenge.filter((entry) => validateTaughtWord(entry, taught)).length >= 6);
  assert.equal(validateTaughtWord({word:'SHIP',graphemes:['sh','i','p']}, taught), false, 'untaught /sh/ cannot be split into two taught letters');
  assert.equal(validateTaughtWord({word:'MOON',graphemes:['m','oo','n']}, taught), false, 'untaught /oo/ cannot fall back to individual letters');
  assert.equal(validateTaughtWord(HANGMAN_WORDS_BY_BAND.challenge.find((entry)=>entry.word==='CLAP'), taught), true, 'a consonant blend can use its individually taught graphemes');
  const eligibleWords = HANGMAN_WORDS_BY_BAND.starter.filter((entry) => validateTaughtWord(entry, taught));
  assert.ok(eligibleWords.every((entry)=>!entry.id.includes(entry.word)),'diagnostic identifiers do not expose the answer word');
  const playerId=`sound-reader-${Date.now()}`;
  const previous=globalThis.localStorage;
  globalThis.localStorage=new MemoryStorage();
  try {
    const firstRun = makeFreshQueue('hangman',playerId,eligibleWords,6,91,(entry)=>entry.signature);
    const nextRun = makeFreshQueue('hangman',playerId,eligibleWords,6,92,(entry)=>entry.signature);
    assert.equal(firstRun.some((entry)=>nextRun.some((next)=>next.id===entry.id)),false,'word queue history avoids immediate repeats when eligible words remain');
  } finally {
    if(previous===undefined) delete globalThis.localStorage;
    else globalThis.localStorage=previous;
  }
});

test('Chess chapter puzzles have one legal, reachable objective and safe captures', () => {
  for (const [band, puzzles] of Object.entries(CHESS_PUZZLES)) {
    assert.ok(puzzles.length >= 10);
    assert.ok(puzzles.every((puzzle) => puzzle.band === band && validateChessPuzzle(puzzle, 5)));
  }
  const blockedRook = { piece:'rook', from:[4,0], target:[4,4], board:[{piece:'pawn',color:'white',at:[4,2]}] };
  assert.equal(chessLegalMoves(blockedRook,5).some(([row,col])=>row===4&&col===4),false);
  const defended = { band:'growing', piece:'rook', from:[4,2], target:[2,2], objective:'Capture safely', board:[{piece:'pawn',color:'black',at:[2,2]},{piece:'rook',color:'black',at:[2,4]}] };
  assert.equal(isSafeChessCapture(defended),false);
  assert.equal(validateChessPuzzle(defended,5),false);
  assert.equal(chessPieceAttacks('pawn',[3,2],[2,1],[],5,'white'),true);
  assert.equal(chessPieceAttacks('pawn',[3,2],[4,1],[],5,'white'),false,'white pawn attacks point toward decreasing board rows');
  assert.equal(chessPieceAttacks('pawn',[1,2],[2,1],[],5,'black'),true);
  assert.equal(chessPieceAttacks('pawn',[1,2],[0,1],[],5,'black'),false,'black pawn attacks point toward increasing board rows');
});

test('Astronaut Academy missions rotate seeded options and retain primary NASA/ESA attribution', () => {
  for (const missions of Object.values(ASTRONAUT_MISSIONS)) {
    assert.ok(missions.length >= 12);
    assert.ok(missions.every(validateAstronautMission));
    assert.ok(missions.every((mission) => new Set(mission.options).size === mission.options.length));
  }
  const mission = ASTRONAUT_MISSIONS.starter[0];
  const first = seededShuffle(mission.options, seededRandom(42));
  const repeat = seededShuffle(mission.options, seededRandom(42));
  assert.deepEqual(first, repeat);
  assert.notDeepEqual(first, seededShuffle(mission.options, seededRandom(3)));
  assert.match(mission.source, /^https:\/\/(science\.nasa\.gov|www\.nasa\.gov)\//);
});

test('Batch 6 narration has a finite phrase inventory and requests packaged-only playback', () => {
  assert.ok(BATCH6_SPOKEN_PHRASES.length > 100);
  let call;
  assert.equal(speakBatch6((...args) => { call = args; }, BATCH6_SPOKEN_PHRASES[0]), true);
  assert.deepEqual(call, [BATCH6_SPOKEN_PHRASES[0], { premium:false }]);
  assert.equal(speakBatch6(() => assert.fail('unknown phrases must not be sent'), 'a child supplied phrase'), false);
});

test('Batch 6 storage isolates players and credits only completed best-star deltas', () => {
  const previous = globalThis.localStorage;
  const storage = new MemoryStorage();
  globalThis.localStorage = storage;
  try {
    const itemIds=PATTERN_MISSIONS.starter.slice(0,6).map((mission)=>mission.id);
    const completion={queueLength:6,completedCount:6,itemIds};
    const facts=PATTERN_MISSIONS.starter.slice(0,6).map((mission)=>mission.fact);
    assert.deepEqual(saveBatch6Run('pattern', 'child-a', 'starter', 2, facts, [], [], completion), {saved:true,delta:2});
    assert.deepEqual(saveBatch6Run('pattern', 'child-a', 'starter', 1, facts, [], [], completion), {saved:true,delta:0});
    assert.deepEqual(saveBatch6Run('pattern', 'child-a', 'starter', 3, [PATTERN_MISSIONS.starter[6].fact], [], [], completion), {saved:true,delta:1});
    assert.deepEqual(saveBatch6Run('pattern','child-a','starter',3,facts,[],[],{...completion,completedCount:5}),{saved:false,delta:0});
    assert.deepEqual(saveBatch6Run('pattern','child-a','starter',3,facts,[],[],{...completion,itemIds:['untrusted',...itemIds.slice(1)]}),{saved:false,delta:0});
    assert.deepEqual(saveBatch6Run('story','child-a','starter',3,facts,[],[],completion),{saved:false,delta:0});
    assert.deepEqual(saveBatch6Run('pattern','child-a','starter',4,facts,[],[],completion),{saved:false,delta:0});
    assert.deepEqual(saveBatch6Run('pattern','child-a','starter',3,['untrusted answer text'],[],[],completion),{saved:true,delta:0});
    assert.equal(readBatch6Progress('pattern', 'child-a').bestStars.starter, 3);
    assert.deepEqual(readBatch6Progress('pattern', 'child-a').facts, [...new Set([...facts,PATTERN_MISSIONS.starter[6].fact])]);
    assert.deepEqual(readBatch6Progress('pattern', 'child-a').completed, ['starter']);
    assert.equal(readBatch6Progress('pattern', 'child-a').badges.includes('pattern_starter_badge_v1'), true);
    assert.deepEqual(readBatch6Progress('pattern', 'child-b').completed, []);
    assert.ok(storage.getItem(BATCH6_PROGRESS_KEY));
    const pool = Array.from({length:12},(_,index)=>({id:`item-${index}`}));
    const a = makeFreshQueue('pattern','child-a',pool,6,91);
    const b = makeFreshQueue('pattern','child-a',pool,6,91);
    assert.equal(a.some((item)=>b.some((other)=>other.id===item.id)),false);
    storage.failWrites=true;
    assert.deepEqual(saveBatch6Run('pattern','child-a','starter',3,facts,[],[],completion),{saved:false,delta:0},'storage failure is distinct from a saved run with zero new stars');
  } finally {
    if (previous === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previous;
  }
});
