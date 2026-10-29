import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { analyzeChessMove, analyzeKingMove, attackedBySide, CHESS_ADVENTURES, CHESS_AUDIO_LINES, CHESS_CHAPTERS, CHESS_PIECES, chessMoveIsLegal, chessSquare, getChessPuzzleMoveAnalysis, seededChessRun } from '../../data/chessAdventure.js';
import { completeChessChapter, readChessProgress, recordChessRun } from '../../data/chessProgress.js';
import { getOfflineVoiceClip } from '../../data/offlineVoice.js';
import { SoundToggle } from '../shared/index.jsx';
import { makeLearningEvent } from '../../data/literacy.js';
import ChessGame from './ChessGame.jsx';

export default function ChessExplorers({ onBack = () => {}, playSfx = () => {}, soundOn, onToggleSound, cancelNarration = () => {}, onCelebrate = () => {}, onGameEvent, onPhaseChange, playerId = 'amari' }) {
  const [mode, setMode] = useState('menu');
  const [progress, setProgress] = useState(() => readChessProgress(playerId));
  const [chapterIndex, setChapterIndex] = useState(0);
  const [run, setRun] = useState([]);
  const [runSeed, setRunSeed] = useState(null);
  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const [solvedAt, setSolvedAt] = useState(null);
  const [helpUsed, setHelpUsed] = useState(false);
  const [hadMistake, setHadMistake] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [chapterSaved, setChapterSaved] = useState(false);
  const [message, setMessage] = useState('');
  const [practicePiece, setPracticePiece] = useState(CHESS_PIECES[0]);
  const [practiceFrom, setPracticeFrom] = useState([4, 2]);
  const focusNext = useRef(null);
  const audioRef = useRef(null);
  const audioGeneration = useRef(0);
  const puzzle = run[index];
  const chapter = CHESS_CHAPTERS[chapterIndex];
  const phase = mode === 'finish' || saveFailed ? 'finish' : mode === 'menu' ? 'intro' : 'play';
  useEffect(() => { if (mode !== 'full-game') onPhaseChange?.(phase); }, [mode, phase, onPhaseChange]);
  useEffect(() => { setProgress(readChessProgress(playerId)); }, [playerId]);
  useEffect(() => { if (!soundOn) { audioGeneration.current += 1; if (audioRef.current) { audioRef.current.onended = null; audioRef.current.pause?.(); } audioRef.current = null; cancelNarration(); } }, [soundOn, cancelNarration]);
  useEffect(() => () => { audioGeneration.current += 1; if (audioRef.current) { audioRef.current.onended = null; audioRef.current.pause?.(); } audioRef.current = null; cancelNarration(); }, [cancelNarration]);

  const stopVoice = () => { audioGeneration.current += 1; if (audioRef.current) { audioRef.current.onended = null; audioRef.current.pause?.(); } audioRef.current = null; cancelNarration(); };
  const toggleSound = () => { stopVoice(); onToggleSound?.(); };
  const replay = (lines) => {
    stopVoice();
    if (!soundOn) return;
    const clips = lines.map((line) => getOfflineVoiceClip(line, 'en-US'));
    if (clips.some((clip) => !clip)) return;
    let clipIndex = 0; const generation = audioGeneration.current;
    const playNext = () => { if (generation !== audioGeneration.current || clipIndex >= clips.length) return; const audio = new Audio(clips[clipIndex++]); audioRef.current = audio; audio.onended = playNext; audio.play().catch(() => {}); };
    playNext();
  };
  const begin = (nextChapterIndex, seed = (globalThis.crypto?.getRandomValues?.(new Uint32Array(1))?.[0] ?? Math.floor(Math.random() * 0x100000000)) >>> 0) => {
    stopVoice();
    const selectedChapter = CHESS_CHAPTERS[nextChapterIndex];
    const nextRun = seededChessRun(selectedChapter.id, seed, progress.recentPuzzleIds);
    setRunSeed(Number(seed) >>> 0);
    setChapterIndex(nextChapterIndex); setRun(nextRun); setIndex(0); setSolved(false); setSolvedAt(null); setChapterSaved(false); setMessage(''); setHelpUsed(false); setHadMistake(false); setSaveFailed(false); setMode('play');
    recordChessRun(playerId, selectedChapter.id, nextRun.map((p) => p.id));
    replay([CHESS_AUDIO_LINES[nextRun[0].piece].prompt, CHESS_AUDIO_LINES[nextRun[0].piece].rule]);
  };
  const finishChapter = () => {
    const result = completeChessChapter(playerId, chapter.id);
    if (!result?.persisted) { setSaveFailed(true); setMessage('Your badge could not be saved. Try again to save it before finishing.'); return; }
    setProgress(result); setChapterSaved(true); if (saveFailed) setMessage('Badge saved. The final puzzle explanation remains below.'); setSaveFailed(false);
    if (result.newlyCompleted) { onCelebrate('Chapter badge earned!', 4, 0, 'chess', { quiet: true }); onGameEvent?.('chess', 'chapter_complete', { chapterId: chapter.id }); }
    focusNext.current?.focus();
  };
  const recordCorrect = (to) => {
    onGameEvent?.('chess', 'answer_correct', { diagnosticOnly: true, seed: runSeed, level: chapterIndex, round: index, item: puzzle.id, correct: true, firstAttempt: !helpUsed && !hadMistake, independent: !helpUsed && !hadMistake });
    onGameEvent?.('chess', 'learning_attempt', makeLearningEvent({ skill: puzzle.kind === 'safe-capture' ? 'chess-safe-capture' : puzzle.kind === 'king-safety' ? 'chess-king-safety' : 'chess-movement', item: puzzle.id, response: `${chessSquare(puzzle.from)} to ${chessSquare(to)}`, correct: true, firstTry: !helpUsed && !hadMistake, hints: helpUsed ? 1 : 0, difficulty: ['starter', 'growing', 'challenge'][chapterIndex], extra: { seed: runSeed, level: chapterIndex, round: index } }));
  };
  const giveFeedback = (feedback) => { setHadMistake(true); setMessage(feedback); };
  const solve = (r, c) => {
    if (solved || !puzzle) return;
    const to = [r, c], occupant = puzzle.pieces.find((piece) => piece.at[0] === r && piece.at[1] === c);
    if (puzzle.kind === 'safe-capture') {
      const analysis = analyzeChessMove(puzzle, to);
      if (analysis.legal && !analysis.capture) { giveFeedback('That is a legal move, but the goal is to capture a safe opposing piece.'); return; }
      if (!analysis.legal) { giveFeedback(occupant?.side === 'white' ? 'That is your own piece. You cannot capture it, and it blocks the path.' : 'That square is not a reachable opposing piece for this capture; occupied pieces can block the path.'); return; }
      if (!analysis.safe) { giveFeedback(`That is a legal capture, but it is unsafe: ${analysis.attackedBy.map((piece) => piece.type).join(' and ')} attacks the landing square after the capture.`); return; }
      setSolved(true); setSolvedAt(to); setMessage(`Safe capture: ${chessSquare(puzzle.from)} → ${chessSquare(to)}.`); playSfx('chess-move'); recordCorrect(to); if (index === run.length - 1) finishChapter(); return;
    }
    if (puzzle.kind === 'king-safety') {
      const analysis = analyzeKingMove(puzzle, to);
      if (!analysis.legal) { giveFeedback(occupant?.side === 'white' ? 'That square is occupied by your own piece.' : 'The king moves only one square in any direction.'); return; }
      if (!analysis.safe) { giveFeedback(`That square is still attacked by the black ${analysis.attackedBy.map((piece) => piece.type).join(' and ')} after the move. Choose a safe neighboring square.`); return; }
      setSolved(true); setSolvedAt(to); setMessage(`Safe king move: ${chessSquare(puzzle.from)} → ${chessSquare(to)}.`); playSfx('chess-move'); recordCorrect(to); if (index === run.length - 1) finishChapter(); return;
    }
    const [fr, fc] = puzzle.from;
    if (r === fr && c === fc) { giveFeedback('That square is already occupied by your piece. Choose a different square.'); return; }
    const legal = chessMoveIsLegal(puzzle.piece, puzzle.from, to, puzzle.pieces, { side: 'white' });
    if (!legal && occupant?.side === 'black' && chessMoveIsLegal(puzzle.piece, puzzle.from, to, puzzle.pieces, { side: 'white', capture: true })) { giveFeedback('That is a legal capture, but the goal is to move to the empty marked square.'); return; }
    if (!legal && occupant?.side === 'white') { giveFeedback('That is your own piece. It blocks sliding paths and you cannot land on or capture it.'); return; }
    if (!legal) { giveFeedback('That square is not reachable by this piece. Check its movement rule and any blockers.'); return; }
    if (!puzzle.goalSquares.some((square) => square[0] === r && square[1] === c)) { giveFeedback('That is a legal move, but it does not meet the stated goal. Try the highlighted square.'); return; }
    setSolved(true); setSolvedAt(to); setMessage(`Solved: ${chessSquare(puzzle.from)} → ${chessSquare(to)}.`); playSfx('chess-move');
    recordCorrect(to);
    if (index === run.length - 1) finishChapter();
  };
  const advance = () => {
    stopVoice();
    if (index === run.length - 1) { if (chapterSaved) setMode('finish'); else finishChapter(); return; }
    const nextIndex = index + 1; setIndex(nextIndex); setSolved(false); setSolvedAt(null); setHelpUsed(false); setHadMistake(false); setMessage(''); replay([CHESS_AUDIO_LINES[run[nextIndex].piece].prompt, CHESS_AUDIO_LINES[run[nextIndex].piece].rule]);
  };
  const backMenu = () => { stopVoice(); setMode('menu'); setSaveFailed(false); setMessage(''); setProgress(readChessProgress(playerId)); };

  const shell = 'min-h-screen flex flex-col bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 px-3 pb-6';
  const header = (title, back = backMenu) => <header className="flex items-center justify-between gap-2 py-3"><button type="button" className="game-icon-button" onClick={back} aria-label="Back to chapters"><ArrowLeft /></button><h1 className="text-xl sm:text-2xl font-black text-amber-900 text-center">{title}</h1><SoundToggle soundOn={soundOn} onToggle={toggleSound} /></header>;
  const audioButton = (lines) => { const available = lines.every((line) => getOfflineVoiceClip(line, 'en-US')); const label = lines.length > 1 ? 'Replay recorded piece prompt and rule' : 'Replay recorded piece rule'; return <button type="button" className="min-h-12 rounded-full border-2 border-amber-400 bg-white px-4 py-2 font-bold text-amber-900" onClick={() => replay(lines)} disabled={!soundOn || !available} aria-label={!soundOn ? 'Narration muted' : available ? label : 'Recorded guidance unavailable'}>{!soundOn ? 'Narration muted' : available ? lines.length > 1 ? '🔊 Replay recorded prompt & rule' : '🔊 Replay recorded rule' : 'Recorded guidance unavailable'}</button>; };

  if (mode === 'full-game') return <ChessGame playerId={playerId} onBack={() => { stopVoice(); setMode('menu'); }} onPhaseChange={onPhaseChange} onCelebrate={onCelebrate} playSfx={playSfx} />;

  if (mode === 'menu') return <main className={`${shell} items-center`}>
    <header className="w-full flex items-center justify-between py-3"><button className="game-icon-button" onClick={onBack} aria-label="Back to Thinking & Play"><ArrowLeft /></button><h1 className="text-2xl sm:text-3xl font-black text-amber-900">♟ Chess Explorers</h1><SoundToggle soundOn={soundOn} onToggle={toggleSound} /></header>
    <div className="w-full max-w-3xl text-center"><p className="text-lg font-bold text-amber-900">Explore how pieces move and make simple captures.</p><p className="mt-2 text-sm text-amber-950">Start with movement, then learn captures and help a king escape an attack.</p>
      <button type="button" onClick={() => { stopVoice(); setMode('full-game'); }} className="mt-4 flex min-h-16 w-full items-center justify-center gap-3 rounded-3xl border-4 border-purple-800 bg-purple-700 px-5 py-4 text-xl font-black text-white shadow-lg"><span aria-hidden="true">♟</span> Play a full game vs computer <span aria-hidden="true">→</span></button>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">{CHESS_CHAPTERS.map((item, i) => { const unlocked = i <= progress.unlockedChapterIndex; return <button key={item.id} disabled={!unlocked} onClick={() => begin(i)} className="rounded-3xl border-4 border-amber-200 bg-white p-5 text-left shadow-lg disabled:opacity-50"><span className="text-3xl">{progress.completedChapterIds.includes(item.id) ? '🏅' : ['♘', '♖', '🧩'][i]}</span><span className="mt-2 block text-lg font-black text-amber-900">{item.title}</span><span className="mt-1 block text-sm text-amber-800">{item.intro}</span><span className="mt-2 block font-bold">{progress.completedChapterIds.includes(item.id) ? 'Badge earned · Replay' : unlocked ? 'Start five puzzles' : 'Complete the previous chapter to unlock'}</span></button>; })}</div>
      <div className="mt-4 flex flex-wrap justify-center gap-3"><button onClick={() => { setMode('pieces'); setPracticePiece(CHESS_PIECES[0]); }} className="min-h-12 rounded-full bg-purple-700 px-5 py-3 font-black text-white">Meet the pieces</button><button onClick={() => { setPracticePiece(CHESS_PIECES[0]); setPracticeFrom([4,2]); setMode('practice'); }} className="min-h-12 rounded-full bg-purple-700 px-5 py-3 font-black text-white">Move It! practice</button></div>
    </div>
  </main>;

  if (mode === 'pieces') { const piece = practicePiece; return <main className={`${shell} items-center`}>{header('Meet the pieces')}<section className="w-full max-w-lg rounded-3xl bg-white p-6 text-center shadow-xl"><div className="text-7xl" aria-hidden="true">{piece.glyph}</div><h2 className="text-3xl font-black text-amber-900">{piece.name}</h2><p className="mt-2 text-lg font-semibold">{piece.rule}</p><div className="mt-4 flex flex-wrap justify-center gap-2">{CHESS_PIECES.map((p) => <button key={p.id} onClick={() => { stopVoice(); setPracticePiece(p); }} aria-pressed={p.id === piece.id} className="min-h-12 min-w-12 rounded-xl border-2 border-amber-300 p-2 text-3xl" aria-label={`Choose ${p.name}`}>{p.glyph}</button>)}</div><div className="mt-4">{audioButton([CHESS_AUDIO_LINES[piece.id].rule])}</div></section></main>; }

  if (mode === 'finish') return <main className={`${shell} items-center`}>{header('Chapter complete')}<section className="m-auto max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl"><div className="text-6xl">🏅</div><h2 className="mt-2 text-2xl font-black text-amber-900">{chapter.title} badge earned</h2><p className="mt-2">You solved all five puzzles. Your chapter badge is saved.</p><button ref={focusNext} autoFocus onClick={backMenu} className="mt-5 rounded-full bg-amber-600 px-6 py-3 font-black text-white">Back to chapters</button></section></main>;

  if (mode === 'practice') {
    const legalSquares = Array.from({ length: 36 }, (_, n) => [Math.floor(n/6), n%6]).filter((to) => chessMoveIsLegal(practicePiece.id, practiceFrom, to));
    return <main className={`${shell} items-center`}>{header('Move It! practice')}<p className="mb-3 text-center font-bold">Practice has no chapter reward. {practicePiece.rule}</p><div className="mb-3 flex flex-wrap justify-center gap-2">{CHESS_PIECES.map((p) => <button key={p.id} aria-label={`Choose ${p.name} for practice`} onClick={() => { stopVoice(); setPracticePiece(p); setPracticeFrom([4,2]); }} aria-pressed={p.id === practicePiece.id} className="min-h-12 min-w-12 rounded-lg border-2 border-amber-300 bg-white px-2 py-1 text-2xl">{p.glyph}</button>)}</div><div className="grid w-[min(90vw,420px)] grid-cols-6 gap-1" role="group" aria-label={`${practicePiece.name} practice board, six by six`}>
      {Array.from({length:36},(_,n)=>{const r=Math.floor(n/6),c=n%6,from=r===practiceFrom[0]&&c===practiceFrom[1],legal=legalSquares.some(([a,b])=>a===r&&b===c);return <button key={n} onClick={()=>legal&&setPracticeFrom([r,c])} disabled={!legal} aria-label={`${chessSquare([r,c])} ${from?`${practicePiece.name} is here`:legal?'legal move':'square'}`} className={`aspect-square min-w-0 rounded-md text-2xl ${from?'bg-purple-300':legal?'bg-amber-300':'bg-amber-100'} ${legal?'cursor-pointer':''}`}>{from?practicePiece.glyph:''}</button>;})}</div><p role="status" className="mt-3">Tap a gold square to move. Try another piece whenever you like.</p><button type="button" onClick={() => { stopVoice(); setPracticeFrom([4,2]); }} className="mt-3 min-h-12 rounded-xl border-2 border-purple-300 bg-white px-4 font-bold text-purple-900">Reset practice board</button>
    </main>;
  }

  if (!puzzle) return <main className={shell}>{header('Chess Explorers')}</main>;
  const prompt = [CHESS_AUDIO_LINES[puzzle.piece].prompt, CHESS_AUDIO_LINES[puzzle.piece].rule];
  const isSolvedPath = (r, c) => {
    if (!solved) return false;
    if ((r === puzzle.from[0] && c === puzzle.from[1]) || (r === solvedAt?.[0] && c === solvedAt?.[1])) return true;
    if (!solvedAt) return false;
    const [dr, dc] = [solvedAt[0] - puzzle.from[0], solvedAt[1] - puzzle.from[1]];
    if (puzzle.piece === 'knight' || puzzle.piece === 'king' || puzzle.piece === 'pawn') return false;
    const aligned = puzzle.piece === 'rook' ? dr === 0 || dc === 0 : puzzle.piece === 'bishop' ? Math.abs(dr) === Math.abs(dc) : dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);
    if (!aligned) return false;
    const steps = Math.max(Math.abs(dr), Math.abs(dc));
    for (let step = 1; step < steps; step += 1) if (r === puzzle.from[0] + Math.sign(dr) * step && c === puzzle.from[1] + Math.sign(dc) * step) return true;
    return false;
  };
  const goalAt = (r,c) => puzzle.goalSquares.some(([gr,gc]) => gr===r && gc===c);
  const isAttackPath = (r,c,attacker,target) => {
    if (attacker.at[0]===r&&attacker.at[1]===c) return true;
    if (target[0]===r&&target[1]===c) return true;
    if (['knight','pawn','king'].includes(attacker.type)) return false;
    const dr=target[0]-attacker.at[0],dc=target[1]-attacker.at[1];
    const aligned=attacker.type==='rook'?dr===0||dc===0:attacker.type==='bishop'?Math.abs(dr)===Math.abs(dc):dr===0||dc===0||Math.abs(dr)===Math.abs(dc);
    if(!aligned)return false;
    const steps=Math.max(Math.abs(dr),Math.abs(dc));
    for(let i=1;i<steps;i+=1)if(r===attacker.at[0]+Math.sign(dr)*i&&c===attacker.at[1]+Math.sign(dc)*i)return true;
    return false;
  };
  const showTeaching = helpUsed || hadMistake || solved;
  const outcomes = getChessPuzzleMoveAnalysis(puzzle);
  const currentAttackers = puzzle.kind === 'king-safety' ? attackedBySide(puzzle.from, 'black', puzzle.pieces) : [];
  const dangerModels = showTeaching ? outcomes.filter((result) => result.legal && !result.safe && (puzzle.kind === 'king-safety' || result.capture)).map((result) => ({ target: result.square, attackers: result.attackedBy })) : [];
  if (currentAttackers.length) dangerModels.push({ target: puzzle.from, attackers: currentAttackers });
  return <main className={`${shell} items-center`}>
    {header(chapter.title)}
    <section data-chess-puzzle={puzzle.id} data-run-seed={runSeed} className="w-full max-w-xl text-center"><p className="text-sm font-bold text-amber-900">Puzzle {index+1} of {run.length} · Simplified 6×6 board</p><h2 className="mt-2 text-xl font-black text-slate-900">{puzzle.objective}</h2><p className="mt-2 text-sm font-semibold text-slate-800">{CHESS_PIECES.find((p)=>p.id===puzzle.piece).rule}</p><p className="mt-1 text-sm text-slate-700">Light pieces are yours. Dark pieces are opponents. {puzzle.kind === 'move' ? 'Find the named square.' : puzzle.kind === 'king-safety' ? 'Keep your king away from the rook’s line.' : 'Look for a capture the other enemies cannot attack.'}</p><details className="mx-auto mt-2 max-w-lg rounded-xl border border-amber-200 bg-white/80 px-3 text-left"><summary className="flex min-h-12 cursor-pointer items-center font-bold text-amber-900">How these small boards work</summary><p className="pb-3 text-sm">Friendly pieces block sliding paths and cannot be captured; knights can jump. Here, pawns take one forward step or capture on either forward diagonal. A capture is safe when no other displayed enemy attacks the landing square afterward. A king cannot enter a shown attacked square. These six-by-six positions omit full turns, the pawn’s opening double step, castling, en passant, promotion and checkmate.</p></details><div className="mt-3 flex justify-center gap-2">{audioButton(prompt)}<button type="button" disabled={helpUsed||solved} onClick={()=>{setHelpUsed(true);setMessage(puzzle.explanation); replay([CHESS_AUDIO_LINES[puzzle.piece].rule]);}} className="min-h-12 rounded-full border-2 border-purple-400 bg-white px-4 py-2 font-bold text-purple-900 disabled:opacity-50">{helpUsed?'Clue used':'One-use clue'}</button></div>
      <div className="relative mx-auto mt-4 grid w-[min(90vw,420px)] grid-cols-6 gap-1" role="group" aria-label={`${CHESS_PIECES.find((p)=>p.id===puzzle.piece).name} board, six by six squares`}>
        {outcomes.map((analysis, n) => {
          const [r,c] = analysis.square;
          const from = r === puzzle.from[0] && c === puzzle.from[1];
          const movedHere = solved && r === solvedAt?.[0] && c === solvedAt?.[1];
          const occupant = puzzle.pieces.find((piece) => piece.at[0] === r && piece.at[1] === c);
          const goal = goalAt(r,c);
          const showGoal = goal && (puzzle.kind === 'move' || showTeaching);
          const path = isSolvedPath(r,c);
          const danger = analysis.legal && !analysis.safe && (puzzle.kind === 'king-safety' || analysis.capture);
          const showDanger = (showTeaching && danger) || (from && currentAttackers.length > 0);
          const attackPath = dangerModels.some((model) => model.attackers.some((attacker) => isAttackPath(r,c,attacker,model.target)));
          const movingHere = movedHere || (!solved && from);
          const glyph = movingHere ? CHESS_PIECES.find((piece) => piece.id === puzzle.piece).glyph : occupant && !movedHere ? (occupant.side === 'white' ? CHESS_PIECES.find((piece) => piece.id === occupant.type)?.glyph : ({king:'♚',queen:'♛',rook:'♜',bishop:'♝',knight:'♞',pawn:'♟'})[occupant.type]) : solved && from ? '·' : '';
          const label = movingHere ? `, your ${puzzle.piece} is here` : solved && from ? ', starting square' : occupant ? `, ${occupant.side === 'white' ? 'your' : 'opposing'} ${occupant.type}` : '';
          return <button key={n} type="button" disabled={solved} onClick={() => solve(r,c)} data-square={`${r},${c}`} aria-label={`${chessSquare(analysis.square)} square${label}${showDanger ? ', attacked square' : ''}${attackPath ? ', attack path' : ''}${path ? ', solved path' : ''}`} className={`relative aspect-square min-w-0 rounded-md border text-2xl sm:text-3xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-1 focus-visible:outline-blue-700 ${(r+c)%2 ? 'bg-amber-700/30' : 'bg-amber-100'} ${path ? 'bg-emerald-300' : showDanger ? 'ring-4 ring-red-600 bg-red-100' : showGoal && !solved ? 'ring-4 ring-emerald-500' : attackPath ? 'bg-red-200' : showTeaching && analysis.legal && !solved ? 'bg-amber-300' : ''}`}>
            <span className="absolute left-0.5 top-0 text-[10px] font-bold text-slate-800">{chessSquare(analysis.square)}</span><span style={{ fontSize: 32, lineHeight: 1 }} aria-hidden="true">{glyph}</span>{showGoal && !solved && <span className="absolute bottom-0 right-0 text-[9px] font-black text-emerald-950">GOAL</span>}{showDanger && !solved && <span className="absolute bottom-0 left-0 text-[9px] font-black text-red-900">ATTACK</span>}
          </button>;
        })}
      </div>
      <p aria-live="polite" role="status" className="mt-3 min-h-12 font-semibold text-slate-900">{message||'Choose a square. Wrong tries leave this same board in place.'}</p>
      {solved&&!saveFailed&&<div className="mt-3 rounded-2xl bg-white p-4 shadow"><p className="font-bold">{puzzle.explanation}</p>{index===run.length-1&&chapterSaved&&<p className="mt-2 font-bold text-emerald-900">Mission badge saved.</p>}<button ref={focusNext} autoFocus onClick={advance} className="mt-3 min-h-12 rounded-full bg-emerald-700 px-6 py-3 font-black text-white">{index===run.length-1?'Finish chapter':'Next puzzle'}</button></div>}
      {saveFailed&&<div className="mt-3 rounded-2xl border-2 border-red-400 bg-white p-4" role="alert"><p className="font-bold text-red-900">{message}</p><button ref={focusNext} autoFocus onClick={finishChapter} className="mt-2 min-h-12 rounded-full bg-red-700 px-5 py-2 font-bold text-white">Retry save</button></div>}
    </section>
  </main>;
}
