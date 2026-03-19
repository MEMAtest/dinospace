import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Home } from 'lucide-react';
import { JIGSAW_PUZZLES, PUZZLE_TILES } from '../../data/index.js';
import { isPuzzleSolved, buildPuzzleTiles } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';

const PuzzlePlay = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzle = JIGSAW_PUZZLES[puzzleIndex];
  const total = puzzle.grid * puzzle.grid;

  const initPieces = useCallback(() => {
    const placed = Array(total).fill(null);
    const tray = shuffle(puzzle.pieces.slice(0, total).map((emoji, i) => ({ id: `piece-${i}`, emoji, correctSlot: i })));
    return { placed, tray };
  }, [puzzle, total]);

  const [state, setState] = useState(initPieces);
  const [dragging, setDragging] = useState(null);
  const [solved, setSolved] = useState(false);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    setState(initPieces());
    setSolved(false);
    setMoves(0);
    setDragging(null);
    speak(`Drag the pieces to build the ${puzzle.name} picture!`);
  }, [initPieces, puzzle.name, speak]);

  const checkSolved = (placed) => placed.every((p, i) => p && p.correctSlot === i);

  const handleDragStart = (piece, source) => {
    setDragging({ piece, source });
    playSfx('click');
  };

  const handleDrop = (slotIndex) => {
    if (!dragging) return;
    setState((prev) => {
      const next = { placed: [...prev.placed], tray: [...prev.tray] };
      const existingPiece = next.placed[slotIndex];

      if (dragging.source === 'tray') {
        next.tray = next.tray.filter((p) => p.id !== dragging.piece.id);
        if (existingPiece) next.tray.push(existingPiece);
      } else {
        next.placed[dragging.source] = existingPiece || null;
      }
      next.placed[slotIndex] = dragging.piece;

      if (dragging.piece.correctSlot === slotIndex) playSfx('sparkle');
      setMoves((m) => m + 1);

      if (checkSolved(next.placed)) {
        setSolved(true);
        playSfx('success');
        onCelebrate(getPraise(), 15, 300);
        speak('Amazing! You finished the puzzle!');
      }
      return next;
    });
    setDragging(null);
  };

  const handleDropBack = () => {
    if (!dragging || dragging.source === 'tray') { setDragging(null); return; }
    setState((prev) => {
      const next = { placed: [...prev.placed], tray: [...prev.tray] };
      next.placed[dragging.source] = null;
      next.tray.push(dragging.piece);
      return next;
    });
    setDragging(null);
  };

  const handleTouchStart = (piece, source, e) => {
    e.preventDefault();
    handleDragStart(piece, source);
  };

  const handleSlotClick = (slotIndex) => {
    if (dragging) {
      handleDrop(slotIndex);
    } else if (state.placed[slotIndex]) {
      handleDragStart(state.placed[slotIndex], slotIndex);
    }
  };

  const handleTrayPieceClick = (piece) => {
    if (dragging && dragging.source === 'tray' && dragging.piece.id === piece.id) {
      setDragging(null);
    } else {
      handleDragStart(piece, 'tray');
    }
  };

  const handleNextPuzzle = () => {
    setPuzzleIndex((prev) => (prev + 1) % JIGSAW_PUZZLES.length);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-yellow-100 via-orange-100 to-yellow-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 right-8 w-40 h-40 bg-white/70 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-200/60 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-orange-700">Puzzle Pop</h2>
          <p className="text-orange-700/70 font-semibold">{puzzle.name} · Moves: {moves}</p>
          <p className="text-orange-700/50 text-sm">{puzzleIndex + 1}/{JIGSAW_PUZZLES.length}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-4 relative z-10 gap-6">
        <p className="text-orange-700/70 font-semibold text-center">
          {dragging ? '🎯 Tap a slot to place the piece!' : 'Tap a piece, then tap where it goes!'}
        </p>

        <div className="grid gap-2 w-full max-w-sm mx-auto" style={{ gridTemplateColumns: `repeat(${puzzle.grid}, minmax(0, 1fr))` }}>
          {state.placed.map((piece, index) => {
            const isCorrect = piece && piece.correctSlot === index;
            return (
              <button
                key={`slot-${index}`}
                onClick={() => handleSlotClick(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(index)}
                className={`aspect-square rounded-2xl text-4xl flex items-center justify-center border-4 transition-all ${
                  piece
                    ? isCorrect
                      ? 'border-green-400 bg-green-50 shadow-lg'
                      : 'border-orange-300 bg-orange-50 shadow-md'
                    : dragging
                      ? 'border-dashed border-orange-400 bg-orange-100/50 animate-pulse'
                      : 'border-dashed border-slate-300 bg-white/60'
                } ${!piece && dragging ? 'hover:bg-orange-200/60 hover:border-orange-500' : ''}`}
              >
                {piece ? piece.emoji : <span className="text-slate-300 text-lg">{index + 1}</span>}
              </button>
            );
          })}
        </div>

        <div
          className="bg-white/70 rounded-3xl p-4 w-full max-w-sm mx-auto min-h-[80px]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropBack}
        >
          <p className="text-center text-sm font-semibold text-slate-500 mb-2">Pieces Tray</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {state.tray.map((piece) => (
              <button
                key={piece.id}
                draggable
                onDragStart={() => handleDragStart(piece, 'tray')}
                onTouchStart={(e) => handleTouchStart(piece, 'tray', e)}
                onClick={() => handleTrayPieceClick(piece)}
                className={`w-16 h-16 rounded-2xl text-3xl flex items-center justify-center border-4 transition-all cursor-grab active:cursor-grabbing ${
                  dragging && dragging.piece.id === piece.id
                    ? 'border-orange-500 bg-orange-200 scale-110 shadow-xl'
                    : 'border-white bg-white shadow-md hover:shadow-lg hover:-translate-y-1'
                }`}
              >
                {piece.emoji}
              </button>
            ))}
            {state.tray.length === 0 && !solved && <p className="text-slate-400 text-sm">All pieces placed!</p>}
          </div>
        </div>

        {!solved && (
          <button onClick={() => {
            const emptySlot = state.placed.findIndex((p) => !p || p.correctSlot !== state.placed.indexOf(p));
            const correctPiece = state.tray.find((p) => p.correctSlot === emptySlot) || state.tray[0];
            if (correctPiece && emptySlot >= 0) {
              playSfx('sparkle');
              speak(`Try putting a piece in slot ${emptySlot + 1}`);
            }
          }} className="bg-white/80 text-orange-600 font-bold px-5 py-2 rounded-full shadow-md hover:bg-white transition text-sm">💡 Hint</button>
        )}

        {solved && (
          <div className="bg-white/90 p-6 rounded-3xl shadow-xl text-center">
            <div className="text-5xl mb-2">🎉</div>
            <h3 className="text-2xl font-black text-orange-700">{getPraise()}</h3>
            <div className="flex gap-4 justify-center mt-3">
              <button onClick={handleNextPuzzle} className="text-orange-600 font-semibold">Next puzzle</button>
              <button onClick={() => { setState(initPieces()); setSolved(false); setMoves(0); }} className="text-orange-600 font-semibold">Replay</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PuzzlePlay;
