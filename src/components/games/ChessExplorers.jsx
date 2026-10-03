import { useEffect, useMemo, useState } from 'react';
import { Batch6BaseCss, Batch6Chrome, ChapterMap, FactPanel, useBatch6Journey } from './Batch6Journey.jsx';
import { BATCH6_BANDS, CHESS_PUZZLES, chessLegalMoves, isSafeChessCapture, validateChessPuzzle } from '../../data/batch6Games.js';
import ChessExplorersAskia from './ChessExplorersAskia.jsx';
import KidPopIcon from '../shared/KidPopIcon.jsx';
import { speakBatch6 } from '../../data/batch6Narration.js';

const pieceFaces={rook:'♖',bishop:'♗',knight:'♘',queen:'♕',king:'♔',pawn:'♙'};
const chapterCopy={starter:'Piece moves: rook, bishop, knight, queen and king.',growing:'Safe captures: capture a marked pawn only when its square is safe.',challenge:'Mini-puzzles: use a clear path and one stated goal.'};
const chapterNames={starter:'Piece moves',growing:'Safe captures',challenge:'Mini-puzzles'};
const ChessExplorers=(props)=>!props.littleMode?<ChessExplorersAmari {...props}/>:<ChessExplorersAskia {...props}/>;
const ChessExplorersAmari=(props)=>{
  const {playerId,onGameEvent,onCelebrate,speak,onBack,cancelNarration,soundOn,onToggleSound,onPhaseChange}=props;
  const journey=useBatch6Journey({gameId:'chess',playerId,onGameEvent,onCelebrate,speak,onBack,cancelNarration,onPhaseChange});
  const [wrong,setWrong]=useState(false);
  const [hinted,setHinted]=useState(false);
  const band=BATCH6_BANDS.find((item)=>item.id===journey.chapter);
  const mission=journey.run?.queue[journey.run.index];
  const legalMoves=useMemo(()=>mission?chessLegalMoves(mission,5):[],[mission]);
  const hasFact=journey.run?.feedback;
  // Clear only question-local feedback and the one-use clue on Next.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(()=>{setWrong(false);setHinted(false);},[journey.run?.index,journey.chapter]);
  useEffect(()=>{if(mission&&!hasFact)speakBatch6(speak,mission.objective);},[mission,hasFact,speak]);
  const pieceAt=(row,col)=>{
    if(mission.from[0]===row&&mission.from[1]===col) return pieceFaces[mission.piece];
    const other=mission.board.find((item)=>item.at[0]===row&&item.at[1]===col);
    return other?`${other.color==='white'?'♙':'♟'}`:null;
  };
  const choose=(row,col)=>{
    if(hasFact)return;
    const legal=legalMoves.some(([r,c])=>r===row&&c===col);
    const target=row===mission.target[0]&&col===mission.target[1];
    if(!legal||!target){
      setWrong(true);
      journey.markAttempt(mission,false);
      if(legal)speakBatch6(speak,'That square is a legal move, but the puzzle asks for the marked goal. Try again.');
      else speakBatch6(speak,'That move does not follow this piece’s rule. Look for a green destination.');
      return;
    }
    if(journey.chapter==='growing'&&!isSafeChessCapture(mission,[row,col])){setWrong(true);speakBatch6(speak,'A safe capture lands on a square the other pieces do not attack. Try again.');return;}
    const validated=validateChessPuzzle(mission,5);
    journey.markAttempt(mission,validated);
    if(validated){
      const pieceName=mission.piece[0].toUpperCase()+mission.piece.slice(1);
      journey.reveal(mission,true,`${pieceName} move solved: ${mission.objective}`,mission.fact,`${row},${col}`);
      speakBatch6(speak,`${pieceName} move solved. ${mission.objective}`);
    }else setWrong(true);
  };
  const useHint=()=>{if(hinted||hasFact)return;setHinted(true);journey.hint('lesson');speakBatch6(speak,`The ${mission.piece} starts on the blue square. Find its legal path to the gold star.`);};
  return <><Batch6BaseCss/><Batch6Chrome title="Chess Explorers" subtitle={band?chapterNames[band.id]:'Mini-board missions'} onBack={journey.back} soundOn={soundOn} onToggleSound={onToggleSound} leaveOpen={journey.leaveOpen} onLeave={journey.leave} onKeep={journey.keep} illustration={<KidPopIcon kind="chess" label="Chess piece" />} progress={mission&&!hasFact?.complete?{current:journey.run.index+1,total:journey.run.queue.length}:null} onReplay={mission&&!hasFact?()=>{cancelNarration?.();speakBatch6(speak,mission.objective);}:undefined} saveFailed={journey.run?.feedback?.saveFailed}>
    {!journey.run&&<ChapterMap title="Choose a chess chapter" chapters={BATCH6_BANDS.map((item)=>({...item,name:chapterNames[item.id],subtitle:chapterCopy[item.id]}))} completed={journey.progress.completed} bestStars={journey.progress.bestStars} onStart={(id)=>journey.start(id,CHESS_PUZZLES[id].filter((puzzle)=>validateChessPuzzle(puzzle,5)),5)} onBack={onBack}/>}
    {mission&&!hasFact?.complete&&<section className="batch6-card"><h2 className="batch6-question">{mission.objective}</h2><p className="text-center text-sm text-slate-600">Mini-board rules: rooks move straight; bishops diagonally; queens both ways; knights jump in an L; kings move one square. Pieces cannot jump through blockers. Pawns move forward and capture one square diagonally; this board uses them as capture targets. There is no check, castling or promotion.</p><div className="batch6-board" role="grid" aria-label="Five by five chess practice board">{Array.from({length:25},(_,index)=>{const row=Math.floor(index/5),col=index%5;const face=pieceAt(row,col);const from=mission.from[0]===row&&mission.from[1]===col;const goal=mission.target[0]===row&&mission.target[1]===col;const legal=legalMoves.some(([r,c])=>r===row&&c===col);return <button key={`${row}-${col}`} role="gridcell" aria-label={`${String.fromCharCode(97+col)}${5-row}${face?`, ${face}`:''}${goal?', goal':''}`} disabled={Boolean(hasFact)} className={`batch6-square ${(row+col)%2===0?'light':'dark'} ${legal?'legal':''} ${from?'selected':''}`} onClick={()=>choose(row,col)}>{goal&&!face?'⭐':face||''}{goal&&face&&<span className="batch6-goal-marker" aria-hidden="true">★</span>}</button>;})}</div><div className="batch6-actions"><button className="batch6-secondary" disabled={hinted||Boolean(hasFact)} onClick={useHint}>Show a clue</button></div>{wrong&&<p className="batch6-feedback text-amber-800" role="status">That is not the one-step goal. Green squares show legal moves; the star shows this puzzle’s goal.</p>}{hasFact&&<><FactPanel explanation={hasFact.explanation} fact={hasFact.fact}/><div className="batch6-actions"><button className="batch6-primary" onClick={journey.next}>Next puzzle</button></div></>}</section>}
    {journey.run?.feedback?.complete&&<section className="batch6-card text-center"><div className="text-5xl">♟️</div><h2 className="batch6-question">Chess chapter complete!</h2><p className="text-2xl text-amber-600">{'★'.repeat(journey.run.feedback.stars)}{'☆'.repeat(3-journey.run.feedback.stars)}</p><FactPanel explanation="Each puzzle had one clear goal and a rule for the piece." fact="A legal move follows the piece’s movement rule and respects blockers."/><div className="batch6-actions"><button className="batch6-primary" onClick={journey.toMap}>Chapter map</button><button className="batch6-secondary" onClick={()=>journey.start(journey.chapter,CHESS_PUZZLES[journey.chapter].filter((p)=>validateChessPuzzle(p,5)),5)}>Play again</button></div></section>}
  </Batch6Chrome></>;
};
export default ChessExplorers;
