import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Home } from 'lucide-react';
import { CHESS_PIECES, CHESS_PUZZLES } from '../../data/index.js';
import { SoundToggle } from '../shared/index.jsx';

const ChessExplorers = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [mode, setMode] = useState(null); // 'learn' | 'puzzle'
  const [pieceIndex, setPieceIndex] = useState(0);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [tappedCells, setTappedCells] = useState({});
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCells, setWrongCells] = useState({});
  const [puzzleDone, setPuzzleDone] = useState(false);
  const [streak, setStreak] = useState(0);

  const piece = CHESS_PIECES[pieceIndex];
  const puzzle = CHESS_PUZZLES[puzzleIndex];

  // Learn mode
  if (mode === 'learn') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-8 right-8 w-40 h-40 bg-amber-200/60 rounded-full blur-3xl" />
        </div>
        <div className="flex items-center justify-between px-4 pt-4 z-20">
          <button onClick={() => setMode(null)} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"><Home /></button>
          <h2 className="text-2xl font-black text-amber-800">♟ Meet the Pieces</h2>
          <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10">
          <div className="bg-white rounded-3xl p-8 shadow-xl border-4 max-w-sm w-full text-center" style={{ borderColor: piece.color }}>
            <div className="text-8xl mb-2">{piece.white}</div>
            <h3 className="text-3xl font-black" style={{ color: piece.color }}>{piece.name}</h3>
            <p className="text-slate-600 font-semibold text-lg mt-1">{piece.desc}</p>
            <div className="mt-4 bg-slate-50 rounded-2xl p-4 border-2 border-slate-200">
              <span className="text-2xl mr-2">{piece.moveEmoji}</span>
              <span className="text-lg font-bold text-slate-700">{piece.move}</span>
            </div>
            <button
              onClick={() => { playSfx('sparkle'); speak(`The ${piece.name}. ${piece.desc} It moves ${piece.move}.`); }}
              className="mt-4 text-amber-700 font-semibold"
            >🔊 Hear about it</button>
          </div>
          <div className="flex gap-3 mt-6 flex-wrap justify-center">
            {CHESS_PIECES.map((p, i) => (
              <button
                key={p.id}
                onClick={() => { setPieceIndex(i); playSfx('click'); speak(`${p.name}. ${p.desc}`); }}
                className={`w-14 h-14 rounded-2xl text-3xl flex items-center justify-center border-4 transition-all ${
                  i === pieceIndex ? 'border-amber-400 bg-amber-50 scale-110 shadow-lg' : 'border-slate-200 bg-white'
                }`}
              >{p.white}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Puzzle mode
  if (mode === 'puzzle') {
    const pieceData = CHESS_PIECES.find((p) => p.id === puzzle.piece);
    const boardSize = 6;
    const isValid = (r, c) => puzzle.validMoves.some(([vr, vc]) => vr === r && vc === c);
    const allFound = puzzle.validMoves.every(([vr, vc]) => tappedCells[`${vr}-${vc}`]);

    const handleCellTap = (r, c) => {
      if (puzzleDone) return;
      const key = `${r}-${c}`;
      if (r === puzzle.pos[0] && c === puzzle.pos[1]) return;
      if (tappedCells[key]) return;

      if (isValid(r, c)) {
        setTappedCells((prev) => ({ ...prev, [key]: true }));
        setCorrectCount((prev) => prev + 1);
        const newStreak = streak + 1;
        setStreak(newStreak);
        playSfx('sparkle');
        if (newStreak >= 3) playSfx('combo');
        onCelebrate(getPraise(), 4, 200);

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
      setPuzzleDone(false);
    };

    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 via-teal-50 to-emerald-100 relative overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 z-20">
          <button onClick={() => setMode(null)} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"><Home /></button>
          <div className="text-center">
            <h2 className="text-2xl font-black text-emerald-800">{pieceData.moveEmoji} {pieceData.name} Moves</h2>
            <p className="text-emerald-700/60 text-sm font-semibold">Puzzle {puzzleIndex + 1}/{CHESS_PUZZLES.length}</p>
          </div>
          <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
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

              return (
                <button
                  key={key}
                  onClick={() => handleCellTap(r, c)}
                  className={`aspect-square rounded-lg flex items-center justify-center text-2xl font-bold transition-all ${
                    isPiece ? 'bg-amber-300 shadow-lg border-2 border-amber-500'
                    : tapped ? 'bg-green-300 border-2 border-green-500 scale-95'
                    : wrong ? 'bg-red-300 animate-shake border-2 border-red-400'
                    : isLight ? 'bg-amber-100 hover:bg-amber-200 border border-amber-200'
                    : 'bg-amber-700/20 hover:bg-amber-700/30 border border-amber-300/40'
                  }`}
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
            <div className="mt-4 bg-white/90 p-4 rounded-2xl shadow-lg text-center">
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
        <div className="flex gap-6 flex-wrap justify-center">
          <button
            onClick={() => { setMode('learn'); playSfx('sparkle'); speak('Meet the chess pieces!'); }}
            className="bg-white border-4 border-amber-200 rounded-3xl p-8 text-center hover:-translate-y-1 transition-all shadow-lg w-44"
          >
            <div className="text-6xl mb-3">♔</div>
            <h3 className="text-xl font-black text-amber-800">Learn</h3>
            <p className="text-amber-700/50 text-xs mt-1">Meet the pieces!</p>
          </button>
          <button
            onClick={() => { setMode('puzzle'); setPuzzleIndex(0); setTappedCells({}); setCorrectCount(0); setPuzzleDone(false); setStreak(0); playSfx('launch'); speak('Find where the piece can move!'); }}
            className="bg-white border-4 border-emerald-200 rounded-3xl p-8 text-center hover:-translate-y-1 transition-all shadow-lg w-44"
          >
            <div className="text-6xl mb-3">🧩</div>
            <h3 className="text-xl font-black text-emerald-800">Puzzles</h3>
            <p className="text-emerald-700/50 text-xs mt-1">Tap where it goes!</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChessExplorers;
