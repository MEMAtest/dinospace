import { useState, useEffect, useRef } from 'react';
import { Home } from 'lucide-react';
import { CHESS_PIECES, CHESS_PUZZLES, PIECE_DEMO_MOVES, MOVE_PRAISE } from '../../data/index.js';
import { SoundToggle } from '../shared/index.jsx';
import { getPraise, pickRandom, computeValidMoves } from '../../utils.js';

// Floating chess background decoration — deterministic positions seeded by index
const FLOAT_PIECES = ['♔', '♕', '♖', '♗', '♘', '♙', '♚', '♛', '♜', '♝', '♞', '♟'];
const FLOAT_ITEMS = FLOAT_PIECES.map((piece, i) => ({
  piece,
  left: `${(i * 8.3 + (((i * 17 + 3) % 11) / 11) * 5) % 100}%`,
  top: `${(i * 7.7 + (((i * 13 + 7) % 11) / 11) * 8) % 95}%`,
  size: `${(((i * 19 + 5) % 11) / 11) * 1.2 + 1.6}rem`,
  delay: `${i * 0.5}s`,
  anim: i % 2 === 0 ? 'animate-drift-left' : 'animate-drift-right',
}));
const ChessBackground = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {FLOAT_ITEMS.map((it, i) => (
      <span
        key={i}
        className={`absolute opacity-[0.04] ${it.anim}`}
        style={{ left: it.left, top: it.top, fontSize: it.size, animationDelay: it.delay }}
      >{it.piece}</span>
    ))}
  </div>
);

// Mini 4x4 board for animated move demo in Learn mode
const MoveDemo = ({ piece }) => {
  const demoMoves = PIECE_DEMO_MOVES[piece.id] || [];
  const movesRef = useRef(demoMoves);
  movesRef.current = demoMoves;
  const [moveIdx, setMoveIdx] = useState(-1); // -1 = at center
  const center = [2, 2];
  const boardSize = 4;
  const trailRef = useRef(new Set());

  useEffect(() => {
    setMoveIdx(-1);
    trailRef.current = new Set();
    const moves = movesRef.current;
    if (moves.length === 0) return;
    let idx = 0;
    const timer = setInterval(() => {
      const m = movesRef.current;
      if (idx >= m.length) {
        trailRef.current = new Set();
        setMoveIdx(-1);
        idx = 0;
        return;
      }
      setMoveIdx(idx);
      trailRef.current.add(`${m[idx][0]}-${m[idx][1]}`);
      idx++;
    }, 2000);
    return () => clearInterval(timer);
  }, [piece.id]);

  const currentPos = moveIdx >= 0 && moveIdx < demoMoves.length ? demoMoves[moveIdx] : center;

  return (
    <div className="mt-4 flex justify-center">
      <div className="relative grid gap-0.5" style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)`, width: 140, height: 140 }}>
        {Array.from({ length: boardSize * boardSize }, (_, idx) => {
          const r = Math.floor(idx / boardSize);
          const c = idx % boardSize;
          const isLight = (r + c) % 2 === 0;
          const isTrail = trailRef.current.has(`${r}-${c}`);
          return (
            <div
              key={idx}
              className={`aspect-square rounded-sm flex items-center justify-center text-xs transition-all duration-300 ${
                isTrail ? 'bg-amber-300/60' : isLight ? 'bg-amber-100' : 'bg-amber-600/20'
              }`}
            />
          );
        })}
        {/* Animated piece overlay */}
        <div
          className="absolute text-2xl transition-all duration-600 ease-in-out z-10"
          style={{
            transform: `translate(${currentPos[1] * (140 / boardSize) + 2}px, ${currentPos[0] * (140 / boardSize) + 1}px)`,
            width: 140 / boardSize,
            height: 140 / boardSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transitionDuration: '0.6s',
          }}
        >
          {piece.white}
        </div>
      </div>
    </div>
  );
};

const ChessExplorers = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [mode, setMode] = useState(null); // 'learn' | 'puzzle' | 'practice'
  const [pieceIndex, setPieceIndex] = useState(0);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [tappedCells, setTappedCells] = useState({});
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCells, setWrongCells] = useState({});
  const [correctCells, setCorrectCells] = useState({});
  const [puzzleDone, setPuzzleDone] = useState(false);
  const [streak, setStreak] = useState(0);

  // Practice mode state
  const [practicePos, setPracticePos] = useState([3, 3]);
  const [practiceMoves, setPracticeMoves] = useState(0);
  const [practiceDone, setPracticeDone] = useState(false);

  const piece = CHESS_PIECES[pieceIndex];
  const puzzle = CHESS_PUZZLES[puzzleIndex];
  const currentLevel = puzzle?.level || 1;

  // Voice on mode mount
  useEffect(() => {
    if (mode === null) speak("Let's learn chess!");
  }, [mode, speak]);

  // Learn mode
  if (mode === 'learn') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 relative overflow-hidden">
        <ChessBackground />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-8 right-8 w-40 h-40 bg-amber-200/60 rounded-full blur-3xl" />
        </div>
        <div className="flex items-center justify-between px-4 pt-4 z-20">
          <button onClick={() => setMode(null)} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"><Home /></button>
          <h2 className="text-2xl font-black text-amber-800">♟ Meet the Pieces</h2>
          <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10">
          {/* Upgraded learn card with gradient + depth + piece-color glow */}
          <div
            className="bg-gradient-to-b from-white to-amber-50/80 rounded-3xl p-8 shadow-xl max-w-sm w-full text-center"
            style={{ border: `4px solid ${piece.color}`, boxShadow: `0 8px 32px ${piece.color}30, 0 4px 12px rgba(0,0,0,0.08)` }}
          >
            <div className="text-8xl mb-2">{piece.white}</div>
            <h3 className="text-3xl font-black" style={{ color: piece.color }}>{piece.name}</h3>
            <p className="text-slate-600 font-semibold text-lg mt-1">{piece.desc}</p>
            <div className="mt-4 bg-slate-50 rounded-2xl p-4 border-2 border-slate-200">
              <span className="text-2xl mr-2">{piece.moveEmoji}</span>
              <span className="text-lg font-bold text-slate-700">{piece.move}</span>
            </div>
            {/* Animated Move Demo */}
            <MoveDemo piece={piece} />
            <button
              onClick={() => { playSfx('sparkle'); speak(`The ${piece.name}. ${piece.desc} It moves ${piece.move}.`); }}
              className="mt-4 text-amber-700 font-semibold"
            >🔊 Hear about it</button>
          </div>
          {/* Piece selector with hover glow + bounce */}
          <div className="flex gap-3 mt-6 flex-wrap justify-center">
            {CHESS_PIECES.map((p, i) => (
              <button
                key={p.id}
                onClick={() => {
                  setPieceIndex(i);
                  playSfx('click');
                  speak(`${p.name}. ${p.desc}`);
                }}
                className={`w-16 h-16 rounded-2xl text-3xl flex items-center justify-center border-4 transition-all duration-200 ${
                  i === pieceIndex
                    ? 'border-amber-400 bg-amber-50 scale-115 animate-piece-bounce'
                    : 'border-slate-200 bg-white hover:scale-105 hover:border-amber-300/60'
                }`}
                style={i === pieceIndex ? { boxShadow: `0 0 16px ${p.color}50` } : {}}
              >{p.white}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Practice mode ("Move It!")
  if (mode === 'practice') {
    const boardSize = 6;
    const validMoves = computeValidMoves(piece.id, practicePos, boardSize);
    const validSet = new Set(validMoves.map(([r, c]) => `${r}-${c}`));

    const handlePracticeTap = (r, c) => {
      if (practiceDone) return;
      const key = `${r}-${c}`;
      if (!validSet.has(key)) return; // Only valid cells are tappable

      playSfx('chess-move');
      const newMoves = practiceMoves + 1;
      setPracticePos([r, c]);
      setPracticeMoves(newMoves);
      speak(pickRandom(MOVE_PRAISE));
      onCelebrate(pickRandom(MOVE_PRAISE), 3, 150);

      if (newMoves >= 5) {
        setPracticeDone(true);
        playSfx('levelup-big');
        speak('Amazing! You made five moves!');
        onCelebrate('Amazing!', 10, 300);
      }
    };

    const resetPractice = (newPieceIdx) => {
      if (newPieceIdx !== undefined) setPieceIndex(newPieceIdx);
      setPracticePos([3, 3]);
      setPracticeMoves(0);
      setPracticeDone(false);
    };

    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 via-violet-50 to-purple-100 relative overflow-hidden">
        <ChessBackground />
        <div className="flex items-center justify-between px-4 pt-4 z-20">
          <button onClick={() => setMode(null)} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"><Home /></button>
          <div className="text-center">
            <h2 className="text-2xl font-black text-purple-800">🏃 Move the {piece.name}!</h2>
            <p className="text-purple-700/60 text-sm font-semibold">{piece.move}</p>
          </div>
          <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-2 z-20">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full transition-all ${i < practiceMoves ? 'bg-purple-500 scale-110' : 'bg-purple-200'}`} />
          ))}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10">
          {!practiceDone && <p className="text-purple-800 font-bold text-lg mb-3">Tap the glowing squares!</p>}

          <div className="grid gap-1 mx-auto" style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`, width: 'min(360px, 90vw)' }}>
            {Array.from({ length: boardSize * boardSize }, (_, idx) => {
              const r = Math.floor(idx / boardSize);
              const c = idx % boardSize;
              const isPiece = r === practicePos[0] && c === practicePos[1];
              const key = `${r}-${c}`;
              const isLight = (r + c) % 2 === 0;
              const isValid = validSet.has(key);

              return (
                <button
                  key={key}
                  onClick={() => handlePracticeTap(r, c)}
                  disabled={!isValid && !isPiece}
                  className={`aspect-square rounded-lg flex items-center justify-center text-2xl font-bold transition-all ${
                    isPiece
                      ? 'bg-purple-300 shadow-lg border-2 border-purple-500'
                      : isValid && !practiceDone
                      ? 'animate-cell-pulse bg-amber-300/50 border-2 border-amber-400/60 hover:bg-amber-400/60 cursor-pointer'
                      : isLight
                      ? 'bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-200'
                      : 'bg-gradient-to-br from-amber-600/25 to-amber-700/30 border border-amber-300/40'
                  }`}
                  style={
                    isLight && !isPiece && !isValid
                      ? { boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)' }
                      : !isLight && !isPiece && !isValid
                      ? { boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.08)' }
                      : {}
                  }
                >
                  {isPiece ? piece.white : ''}
                </button>
              );
            })}
          </div>

          {/* Piece selector for practice */}
          <div className="flex gap-2 mt-4 flex-wrap justify-center">
            {CHESS_PIECES.map((p, i) => (
              <button
                key={p.id}
                onClick={() => { resetPractice(i); playSfx('click'); speak(`Try the ${p.name}! ${p.move}.`); }}
                className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center border-3 transition-all ${
                  i === pieceIndex ? 'border-purple-400 bg-purple-50 scale-110' : 'border-slate-200 bg-white hover:scale-105'
                }`}
              >{p.white}</button>
            ))}
          </div>

          {practiceDone && (
            <div className="mt-4 bg-white/90 p-4 rounded-2xl shadow-lg text-center animate-scale-in">
              <div className="text-4xl mb-1">🎉</div>
              <p className="text-lg font-black text-purple-700">You did it!</p>
              <div className="flex gap-3 mt-3 justify-center">
                <button onClick={() => resetPractice()} className="bg-purple-500 text-white font-bold px-5 py-2 rounded-full shadow hover:bg-purple-600 transition">
                  Again!
                </button>
                <button onClick={() => {
                  const next = (pieceIndex + 1) % CHESS_PIECES.length;
                  resetPractice(next);
                  speak(`Try the ${CHESS_PIECES[next].name}!`);
                }} className="bg-amber-500 text-white font-bold px-5 py-2 rounded-full shadow hover:bg-amber-600 transition">
                  Next Piece
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Puzzle mode
  if (mode === 'puzzle') {
    const pieceData = CHESS_PIECES.find((p) => p.id === puzzle.piece);
    const boardSize = 6;
    const isValid = (r, c) => puzzle.validMoves.some(([vr, vc]) => vr === r && vc === c);

    const handleCellTap = (r, c) => {
      if (puzzleDone) return;
      const key = `${r}-${c}`;
      if (r === puzzle.pos[0] && c === puzzle.pos[1]) return;
      if (tappedCells[key]) return;

      if (isValid(r, c)) {
        setTappedCells((prev) => ({ ...prev, [key]: true }));
        setCorrectCells((prev) => ({ ...prev, [key]: true }));
        setCorrectCount((prev) => prev + 1);
        const newStreak = streak + 1;
        setStreak(newStreak);
        playSfx('chess-move');
        if (newStreak >= 3) playSfx('combo');
        onCelebrate(getPraise(), 4, 200);

        // Clear correct animation after a short time
        setTimeout(() => setCorrectCells((prev) => { const next = { ...prev }; delete next[key]; return next; }), 500);

        const newTapped = { ...tappedCells, [key]: true };
        if (puzzle.validMoves.every(([vr, vc]) => newTapped[`${vr}-${vc}`])) {
          setPuzzleDone(true);
          playSfx('levelup-big');
          speak(`You found all the moves! The ${pieceData.name} is happy!`);
          onCelebrate('Amazing!', 10, 300);
        }
      } else {
        setWrongCells((prev) => ({ ...prev, [key]: true }));
        setStreak(0);
        playSfx('oops');
        setTimeout(() => setWrongCells((prev) => { const next = { ...prev }; delete next[key]; return next; }), 600);
      }
    };

    const nextPuzzle = () => {
      setPuzzleIndex((prev) => (prev + 1) % CHESS_PUZZLES.length);
      setTappedCells({});
      setCorrectCount(0);
      setWrongCells({});
      setCorrectCells({});
      setPuzzleDone(false);
      const nextP = CHESS_PUZZLES[(puzzleIndex + 1) % CHESS_PUZZLES.length];
      const nextPiece = CHESS_PIECES.find((p) => p.id === nextP.piece);
      speak(`${nextPiece.name}! ${nextP.q}`);
    };

    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 via-teal-50 to-emerald-100 relative overflow-hidden">
        <ChessBackground />
        <div className="flex items-center justify-between px-4 pt-4 z-20">
          <button onClick={() => setMode(null)} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"><Home /></button>
          <div className="text-center">
            <h2 className="text-2xl font-black text-emerald-800">{pieceData.moveEmoji} {pieceData.name} Moves</h2>
            <p className="text-emerald-700/60 text-sm font-semibold">Puzzle {puzzleIndex + 1}/{CHESS_PUZZLES.length}</p>
          </div>
          <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
        </div>

        {/* Level progress dots */}
        <div className="flex justify-center gap-1.5 mt-1 z-20">
          {CHESS_PUZZLES.map((_, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${
              i < puzzleIndex ? 'bg-emerald-500' : i === puzzleIndex ? 'bg-emerald-400 scale-125' : 'bg-emerald-200'
            }`} />
          ))}
        </div>

        {/* Level badge */}
        <div className="text-center mt-1 z-20">
          <span className={`text-xs font-black px-3 py-0.5 rounded-full ${
            currentLevel === 1 ? 'bg-green-200 text-green-800' : currentLevel === 2 ? 'bg-blue-200 text-blue-800' : 'bg-amber-200 text-amber-800'
          }`}>
            {currentLevel === 1 ? 'Beginner' : currentLevel === 2 ? 'Explorer' : 'Champion'}
          </span>
        </div>

        {streak >= 2 && (
          <div className="text-center z-20 animate-count-up">
            <span className="text-2xl font-black text-emerald-600">
              {streak >= 4 ? '🔥'.repeat(streak) : '⚡'.repeat(streak)} {streak}!
            </span>
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10">
          <p className="text-emerald-800 font-bold text-lg mb-3">{puzzle.q}</p>
          <p className="text-emerald-700/60 text-sm font-semibold mb-4">{pieceData.move}</p>

          <div className="grid gap-1 mx-auto" style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`, width: 'min(360px, 90vw)' }}>
            {Array.from({ length: boardSize * boardSize }, (_, idx) => {
              const r = Math.floor(idx / boardSize);
              const c = idx % boardSize;
              const isPiece = r === puzzle.pos[0] && c === puzzle.pos[1];
              const key = `${r}-${c}`;
              const isLight = (r + c) % 2 === 0;
              const tapped = tappedCells[key];
              const wrong = wrongCells[key];
              const justCorrect = correctCells[key];

              return (
                <button
                  key={key}
                  onClick={() => handleCellTap(r, c)}
                  className={`aspect-square rounded-lg flex items-center justify-center text-2xl font-bold transition-all ${
                    isPiece ? 'bg-amber-300 shadow-lg border-2 border-amber-500'
                    : tapped && justCorrect ? 'bg-green-300 border-2 border-green-500 animate-cell-correct'
                    : tapped ? 'bg-green-300 border-2 border-green-500'
                    : wrong ? 'bg-red-300 animate-shake border-2 border-red-400'
                    : isLight ? 'bg-gradient-to-br from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 border border-amber-200'
                    : 'bg-gradient-to-br from-amber-600/25 to-amber-700/30 hover:from-amber-600/35 hover:to-amber-700/40 border border-amber-300/40'
                  }`}
                  style={
                    isLight && !isPiece && !tapped && !wrong
                      ? { boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)' }
                      : !isLight && !isPiece && !tapped && !wrong
                      ? { boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.08)' }
                      : {}
                  }
                >
                  {isPiece ? pieceData.white : tapped ? '✓' : ''}
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-sm font-semibold text-emerald-700/70">
            Found: {correctCount}/{puzzle.validMoves.length}
          </p>

          {puzzleDone && (
            <div className="mt-4 bg-white/90 p-4 rounded-2xl shadow-lg text-center animate-scale-in">
              <div className="text-4xl mb-1">🎉</div>
              <p className="text-lg font-black text-emerald-700">{getPraise()}</p>
              <button onClick={nextPuzzle} className="mt-2 bg-emerald-500 text-white font-bold px-6 py-2 rounded-full shadow hover:bg-emerald-600 transition">
                Next Puzzle
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mode chooser
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 relative overflow-hidden">
      <ChessBackground />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 right-8 w-40 h-40 bg-amber-200/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-200/60 rounded-full blur-3xl" />
      </div>
      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"><Home /></button>
        <h2 className="text-3xl font-black text-amber-800">♟ Chess Explorers</h2>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10 gap-6">
        <div className="flex gap-3 text-6xl mb-2">
          <span>♔</span><span>♞</span><span>♜</span>
        </div>
        <p className="text-amber-800/80 text-lg font-semibold">Learn chess!</p>
        <div className="flex gap-5 flex-wrap justify-center">
          <button
            onClick={() => { setMode('learn'); playSfx('sparkle'); speak('Meet the chess pieces!'); }}
            className="bg-white border-4 border-amber-200 rounded-3xl p-8 text-center hover:-translate-y-1 transition-all shadow-lg w-40"
          >
            <div className="text-5xl mb-3">♔</div>
            <h3 className="text-xl font-black text-amber-800">Learn</h3>
            <p className="text-amber-700/50 text-xs mt-1">Meet the pieces!</p>
          </button>
          <button
            onClick={() => { setMode('puzzle'); setPuzzleIndex(0); setTappedCells({}); setCorrectCount(0); setCorrectCells({}); setPuzzleDone(false); setStreak(0); playSfx('launch'); speak('Find where the piece can move!'); }}
            className="bg-white border-4 border-emerald-200 rounded-3xl p-8 text-center hover:-translate-y-1 transition-all shadow-lg w-40"
          >
            <div className="text-5xl mb-3">🧩</div>
            <h3 className="text-xl font-black text-emerald-800">Puzzles</h3>
            <p className="text-emerald-700/50 text-xs mt-1">Tap where it goes!</p>
          </button>
          <button
            onClick={() => {
              setMode('practice');
              setPracticePos([3, 3]);
              setPracticeMoves(0);
              setPracticeDone(false);
              setPieceIndex(0);
              playSfx('sparkle');
              speak('Move the pieces! Tap the glowing squares!');
            }}
            className="bg-white border-4 border-purple-200 rounded-3xl p-8 text-center hover:-translate-y-1 transition-all shadow-lg w-40"
          >
            <div className="text-5xl mb-3">🏃</div>
            <h3 className="text-xl font-black text-purple-800">Move It!</h3>
            <p className="text-purple-700/50 text-xs mt-1">Slide the pieces!</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChessExplorers;
