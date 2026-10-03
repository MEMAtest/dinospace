import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ASTRONAUT_MISSIONS, BATCH6_PROGRESS_KEY, CHESS_PUZZLES, HANGMAN_WORDS_BY_BAND, distinctBatch6FactLines,
  PATTERN_MISSIONS, chessLegalMoves, getChessMoveTransition, isSafeChessCapture, makeFreshQueue, seededRandom, seededShuffle,
  readBatch6Progress, saveBatch6Run, validateAstronautMission,
  chessPieceAttacks, patternContentSignature, patternDisplayTerm, patternMovementCue, validateChessPuzzle, validatePatternMission, validateTaughtWord,
} from '../src/data/batch6Games.js';
import { PHASE_SOUNDS } from '../src/data/learningProgress.js';
import { BATCH6_SPOKEN_PHRASES, speakBatch6, patternClueNarration, chessClueNarration, astronautClueNarration } from '../src/data/batch6Narration.js';

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  failWrites = false;
  setItem(key, value) { if (this.failWrites) throw new Error('storage disabled'); this.values.set(key, String(value)); }
}

test('Pattern Parade has six validated missions per run, unique rendered choices, and no semantic repeats', () => {
  const previous = globalThis.localStorage;
  globalThis.localStorage = new MemoryStorage();
  try {
    for (const [band,missions] of Object.entries(PATTERN_MISSIONS)) {
      assert.ok(missions.length >= 48, 'at least eight six-question runs are available before pool exhaustion');
      assert.equal(new Set(missions.map((mission) => mission.signature)).size, missions.length);
      assert.ok(missions.every(validatePatternMission));
      assert.ok(missions.every((mission) => new Set(mission.options.map((option) => patternDisplayTerm(mission, option))).size === 4), 'sound and movement choices stay visually distinct');
      assert.ok(missions.every((mission) => mission.options.filter((option) => patternDisplayTerm(mission, option) === patternDisplayTerm(mission, mission.answer)).length === 1), 'only the authored correct answer has the correct visible label');
      const contentSignatures = missions.map(patternContentSignature);
      assert.ok(new Set(contentSignatures).size >= 48, 'the finite pool contains at least eight runs of semantic content');
      assert.ok(contentSignatures.every((signature) => /^pattern-content-[a-f0-9]{16}$/.test(signature)), 'content history stores opaque signatures rather than answer text');
      assert.equal(missions.filter((mission) => ['AB', 'AAB', 'ABB', 'ABC', 'growing'].includes(mission.rule)).length, missions.length);
      const seen = new Set();
      for (let run = 1; run <= 8; run += 1) {
        const queue = makeFreshQueue('pattern',`${band}-eight-runs`,missions,6,run*714,patternContentSignature);
        assert.equal(queue.length, 6);
        const signatures = queue.map(patternContentSignature);
        assert.equal(new Set(signatures).size, 6, 'a run never repeats the same visible semantic pattern');
        assert.ok(signatures.every((signature) => !seen.has(signature)), 'a later run avoids earlier content while unseen items remain');
        signatures.forEach((signature) => seen.add(signature));
      }
    }
  } finally {
    if (previous === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previous;
  }
  const alternate = PATTERN_MISSIONS.challenge.find((mission)=>mission.growthRule==='alternate');
  assert.equal(validatePatternMission(alternate),true);
  assert.equal(validatePatternMission({...alternate,answer:'🔴🔵🟡🟢'}),false,'growing answers follow the explicitly alternating token rule');
  const movingAlternate = PATTERN_MISSIONS.growing.find((mission) => mission.rule==='growing' && mission.growthRule==='alternate' && mission.modality==='movement rule');
  const movementCue = patternMovementCue(movingAlternate);
  assert.match(movementCue,/Each step adds one arrow, alternating .+ then .+\./);
  assert.notEqual(movementCue,'Follow the moving steps: up, across, then down.');
  assert.ok(PATTERN_MISSIONS.challenge.slice(6).every((mission)=>!/(red|blue|dino|rocket|star|moon)/i.test(`${mission.label} ${mission.fact}`)),'remixes use label/fact wording that does not claim a hidden palette');
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
  const kingD3 = CHESS_PUZZLES.starter.find((puzzle) => puzzle.id === 'king-neighbour');
  assert.deepEqual(kingD3.from,[2,3]);
  assert.deepEqual(kingD3.target,[3,3]);
  const selectedPiece = getChessMoveTransition(kingD3,false,kingD3.from,5);
  assert.deepEqual(selectedPiece,{kind:'select',selected:true,attempted:false,clearFeedback:true},'selecting king d3 is not a wrong-goal attempt');
  const destinationBeforeSelection = getChessMoveTransition(kingD3,false,kingD3.target,5);
  assert.equal(destinationBeforeSelection.kind,'ignore');
  assert.equal(destinationBeforeSelection.attempted,false);
  const wrongMove = getChessMoveTransition(kingD3,selectedPiece.selected,[1,3],5);
  assert.equal(wrongMove.kind,'wrong');
  assert.equal(wrongMove.selected,true,'the piece remains selected after an incorrect destination');
  const solvedMove = getChessMoveTransition(kingD3,wrongMove.selected,kingD3.target,5);
  assert.equal(solvedMove.kind,'correct');
  assert.equal(solvedMove.clearFeedback,true,'a correct d2 move clears stale wrong-goal feedback');
  assert.equal(solvedMove.selected,false);
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

test('Batch 6 fact panels suppress a repeated fact and retain distinct explanations', () => {
  const fact='Rover cameras help map nearby terrain.';
  assert.deepEqual(distinctBatch6FactLines(fact,` ${fact} `),[{text:fact,kind:'explanation'}]);
  assert.deepEqual(distinctBatch6FactLines('You matched the mission clue.',fact),[
    {text:'You matched the mission clue.',kind:'explanation'},
    {text:fact,kind:'fact'},
  ]);
  assert.deepEqual(distinctBatch6FactLines('',fact),[{text:fact,kind:'fact'}]);
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

// Every authored clue must be playable, including remixed patterns and review missions.
test('Batch 6 finite narration allowlist covers current clues and legal-move feedback', () => {
  const clues = [
    ...Object.values(PATTERN_MISSIONS).flat().map(patternClueNarration),
    ...Object.values(CHESS_PUZZLES).flat().map(chessClueNarration),
    ...Object.values(ASTRONAUT_MISSIONS).flat().map(astronautClueNarration),
    'That square is a legal move, but the puzzle asks for the marked goal. Try again.',
    ...[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map((letter) => `Find the letter ${letter.toLowerCase()}.`),
  ];
  for (const clue of clues) {
    let called = false;
    assert.equal(speakBatch6(() => { called = true; }, clue), true, clue);
    assert.equal(called, true, clue);
  }
  for (const rule of ['AAB', 'ABB', 'ABC']) {
    const clue = patternClueNarration({ rule });
    assert.match(clue, /first three places/);
  }
  assert.match(patternClueNarration({ rule: 'AB' }), /first two places/);
  assert.equal(speakBatch6(() => assert.fail('untrusted content must remain rejected'), 'Mission clue. untrusted child text'), false);
});
