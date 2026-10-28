import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeChessMove, attackedBySide, CHESS_ADVENTURES, CHESS_CHAPTERS, chessMoveIsLegal, chessPieceAttacks, getChessPuzzleMoveAnalysis, isChessSquare, isSquareAttackedAfterKingMove, seededChessRun } from '../src/data/chessAdventure.js';
import { completeChessChapter, readChessProgress, recordChessRun } from '../src/data/chessProgress.js';

const store = () => { const data = new Map(); return { getItem: (k) => data.get(k) ?? null, setItem: (k,v) => data.set(k,v), keys: () => data.keys() }; };

test('three five-puzzle chapters have fixed seeded runs and all stated goals are reachable', () => {
  for (const chapter of CHESS_CHAPTERS) {
    const authored = CHESS_ADVENTURES.filter((p) => p.chapterId === chapter.id);
    assert.equal(authored.length, 5, `${chapter.id} chapter size`);
    const runA = seededChessRun(chapter.id, 987, []);
    assert.equal(runA.length, 5);
    assert.deepEqual(runA.map(({id})=>id), seededChessRun(chapter.id, 987, []).map(({id})=>id));
    assert.equal(new Set(runA.map(({id})=>id)).size, 5);
    const replay = seededChessRun(chapter.id, 987, [runA.at(-1).id]);
    assert.notEqual(replay[0].id, runA.at(-1).id, 'avoid immediate run-boundary repeat');
  }
  for (const puzzle of CHESS_ADVENTURES) {
    assert.equal(new Set(puzzle.pieces.map(({at})=>at.join('-'))).size,puzzle.pieces.length,`${puzzle.id} has unique piece squares`);
    const valid = puzzle.goalSquares.every((goal) => {
      if (puzzle.kind === 'safe-capture') return analyzeChessMove(puzzle, goal).legal && analyzeChessMove(puzzle, goal).safe;
      if (puzzle.kind === 'king-safety') return chessMoveIsLegal('king', puzzle.from, goal, puzzle.pieces) && !isSquareAttackedAfterKingMove(puzzle, goal);
      return chessMoveIsLegal(puzzle.piece, puzzle.from, goal, puzzle.pieces);
    });
    assert.ok(valid, `invalid authored goal: ${puzzle.id}`);
    assert.ok(getChessPuzzleMoveAnalysis(puzzle).some((result)=>result.solvesGoal),`${puzzle.id} has no solvable cell`);
  }
  assert.equal(CHESS_ADVENTURES.length,15);
});

test('movement rules cover sliding blockers, knight jumps, pawn forward and diagonal capture', () => {
  const friend = (id,type,at) => ({id,type,side:'white',at});
  const enemy = (id,type,at) => ({id,type,side:'black',at});
  assert.equal(chessMoveIsLegal('rook',[3,0],[3,3],[friend('block','pawn',[3,2])]), false);
  assert.equal(chessMoveIsLegal('rook',[3,0],[3,2],[friend('own','pawn',[3,2])],{capture:true}), false);
  assert.equal(chessMoveIsLegal('rook',[3,0],[3,2],[enemy('foe','pawn',[3,2])],{capture:true}), true);
  assert.equal(chessMoveIsLegal('rook',[3,0],[3,4],[enemy('path-block','pawn',[3,2]),enemy('target','pawn',[3,4])],{capture:true}), false);
  assert.equal(chessMoveIsLegal('bishop',[4,0],[1,3],[friend('block','pawn',[3,1])]), false);
  assert.equal(chessMoveIsLegal('bishop',[4,0],[1,3],[enemy('block','pawn',[3,1]),enemy('target','pawn',[1,3])],{capture:true}), false);
  assert.equal(chessMoveIsLegal('knight',[4,2],[2,3],[friend('block','pawn',[3,2])]), true);
  assert.equal(chessMoveIsLegal('knight',[4,2],[2,3],[friend('own','pawn',[2,3])]), false);
  assert.equal(chessMoveIsLegal('pawn',[4,2],[3,2]), true);
  assert.equal(chessMoveIsLegal('pawn',[4,2],[3,3]), false);
  assert.equal(chessMoveIsLegal('pawn',[4,2],[3,3],[enemy('target','pawn',[3,3])],{capture:true}), true);
  assert.equal(chessMoveIsLegal('pawn',[4,2],[3,1],[enemy('target','pawn',[3,1])],{capture:true}), true);
  assert.equal(chessMoveIsLegal('pawn',[4,2],[3,2],[enemy('target','pawn',[3,2])],{capture:true}), false);
  assert.equal(chessMoveIsLegal('pawn',[1,2],[0,3],[enemy('target','pawn',[0,3])],{side:'black',capture:true}), false);
  assert.equal(chessMoveIsLegal('pawn',[1,2],[2,1],[friend('target','pawn',[2,1])],{side:'black',capture:true}), true);
  assert.equal(chessMoveIsLegal('queen',[3,3],[-1,3]), false);
  assert.equal(isChessSquare([6,0]),false);
  assert.deepEqual(seededChessRun('movement',0).map(({id})=>id),seededChessRun('movement',0).map(({id})=>id));
});

test('safe-capture puzzles contain a safe answer and a reachable defended decoy', () => {
  const capturePuzzles=CHESS_ADVENTURES.filter((p)=>p.kind==='safe-capture');
  assert.equal(capturePuzzles.length,5);
  for(const puzzle of capturePuzzles){
    assert.ok(puzzle.pieces.some((p)=>p.id==='safe-target'&&p.side==='black'));
    assert.ok(puzzle.pieces.some((p)=>p.id==='unsafe-target'&&p.side==='black'));
    assert.ok(puzzle.pieces.some((p)=>p.side==='white'), `${puzzle.id} needs friendly occupancy`);
    for(const goal of puzzle.goalSquares){const result=analyzeChessMove(puzzle,goal);assert.equal(result.legal,true,puzzle.id);assert.equal(result.safe,true,puzzle.id);}
    const decoy=puzzle.pieces.find((p)=>p.id==='unsafe-target');
    const result=analyzeChessMove(puzzle,decoy.at);
    assert.equal(result.legal,true,puzzle.id);assert.equal(result.safe,false,puzzle.id);assert.ok(result.attackedBy.length>0,puzzle.id);
  }
});

test('attacks respect blockers, pawn attack diagonals, and king safety after moving', () => {
  const rook={id:'r',type:'rook',side:'black',at:[0,0]};
  assert.equal(chessPieceAttacks(rook,[0,5],[rook,{id:'screen',type:'pawn',side:'white',at:[0,2]}]),false);
  assert.equal(chessPieceAttacks(rook,[0,5],[rook]),true);
  const bp={id:'bp',type:'pawn',side:'black',at:[2,2]};
  assert.equal(chessPieceAttacks(bp,[3,1],[bp]),true);
  assert.equal(chessPieceAttacks(bp,[3,2],[bp]),false);
  assert.equal(attackedBySide([3,3],'black',[{id:'tower',type:'rook',side:'black',at:[0,3]}]).length,1);
  const kingPuzzle=CHESS_ADVENTURES.find((p)=>p.kind==='king-safety');
  assert.equal(isSquareAttackedAfterKingMove(kingPuzzle,[4,3]),true);
  assert.equal(isSquareAttackedAfterKingMove(kingPuzzle,[4,2]),false);
  assert.ok(attackedBySide(kingPuzzle.from,'black',kingPuzzle.pieces).length>0,'king starts in a real rook attack');
  const exposedCapture={piece:'rook',from:[3,0],pieces:[{id:'target',type:'pawn',side:'black',at:[3,2]},{id:'defender',type:'rook',side:'black',at:[3,5]}]};
  const afterTargetRemoval=analyzeChessMove(exposedCapture,[3,2]);
  assert.equal(afterTargetRemoval.legal,true);assert.equal(afterTargetRemoval.safe,false);assert.deepEqual(afterTargetRemoval.attackedBy.map(({id})=>id),['defender']);
});

test('progress validates per-child runs, contiguous unlocks, idempotent awards and failed writes', () => {
  const storage = store();
  assert.equal(recordChessRun('a','movement',['move-rook'],storage).persisted,false);
  const run = CHESS_ADVENTURES.filter((p)=>p.chapterId==='movement').map((p)=>p.id);
  assert.equal(recordChessRun('a','movement',run,storage).persisted,true);
  const earned = completeChessChapter('a','movement',storage);
  assert.equal(earned.persisted,true); assert.equal(earned.newlyCompleted,true);
  assert.equal(earned.unlockedChapterIndex,1);
  assert.equal(completeChessChapter('a','movement',storage).newlyCompleted,false);
  assert.equal(completeChessChapter('a','mini-puzzles',storage).persisted,false);
  assert.deepEqual(readChessProgress('b',storage).completedChapterIds,[]);
  const broken = {getItem(){return null;},setItem(){throw new Error('quota');}};
  assert.equal(completeChessChapter('c','movement',broken).persisted,false);
  assert.ok([...storage.keys()].every((key)=>key.startsWith('amari_chess_explorers_progress_v1:')));
});
