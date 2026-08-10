import { useState, useEffect } from 'react';
import { Eye, Home, Lightbulb } from 'lucide-react';
import { JIGSAW_PUZZLES, PUZZLE_TILES } from '../../data/index.js';
import { shuffle, getPraise } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';

const makePuzzleState = (puzzle) => {
  const total = puzzle.grid * puzzle.grid;
  return {
    placed: Array(total).fill(null),
    tray: shuffle(puzzle.pieces.slice(0, total).map((emoji, index) => ({ id: `piece-${index}`, emoji, correctSlot: index }))),
  };
};

const PuzzlePlay = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent }) => {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzle = JIGSAW_PUZZLES[puzzleIndex];

  const [state, setState] = useState(() => makePuzzleState(JIGSAW_PUZZLES[0]));
  const [dragging, setDragging] = useState(null);
  const [solved, setSolved] = useState(false);
  const [moves, setMoves] = useState(0);
  const [completionMessage, setCompletionMessage] = useState('');

  useEffect(() => {
    speak(`Drag the pieces to build the ${puzzle.name} picture!`);
  }, [puzzle.name, speak]);

  const checkSolved = (placed) => placed.every((p, i) => p && p.correctSlot === i);

  const handleDragStart = (piece, source) => {
    setDragging({ piece, source });
    playSfx('click');
  };

  const handleDrop = (slotIndex) => {
    if (!dragging) return;
    if (dragging.piece.correctSlot !== slotIndex) {
      setCompletionMessage('That piece has a different picture spot. Try its matching shadow!');
      playSfx('oops');
      setDragging(null);
      return;
    }
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

      playSfx('sparkle');
      setMoves((m) => m + 1);

      if (checkSolved(next.placed)) {
        const praise = getPraise();
        setSolved(true);
        setCompletionMessage(praise);
        playSfx('success');
        onCelebrate(praise, 6, 300);
        onGameEvent?.('puzzle', 'level_completed');
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

  const startPuzzle = (nextIndex) => {
    setPuzzleIndex(nextIndex);
    setState(makePuzzleState(JIGSAW_PUZZLES[nextIndex]));
    setDragging(null);
    setSolved(false);
    setMoves(0);
    setCompletionMessage('');
  };

  const handleNextPuzzle = () => {
    startPuzzle((puzzleIndex + 1) % JIGSAW_PUZZLES.length);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-100 via-yellow-50 to-emerald-100 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 right-8 w-40 h-40 bg-white/70 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-200/60 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-orange-700 drop-shadow-sm">Puzzle Pop</h2>
          <p className="text-orange-700/70 font-semibold">{puzzle.name} · Moves: {moves}</p>
          <p className="text-orange-700/50 text-sm">{puzzleIndex + 1}/{JIGSAW_PUZZLES.length}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 grid w-full max-w-6xl mx-auto items-center gap-5 px-4 pb-6 pt-4 relative z-10 lg:grid-cols-[minmax(220px,0.55fr)_minmax(360px,1fr)]">
        <aside className="rounded-[2rem] border-4 border-white bg-white/80 p-4 shadow-xl backdrop-blur">
          <div className="mb-3 flex items-center gap-2 font-black text-orange-700"><Eye size={20} /> Picture preview</div>
          <div className="grid gap-1 rounded-2xl bg-gradient-to-br from-sky-200 via-emerald-100 to-amber-100 p-3" style={{ gridTemplateColumns: `repeat(${puzzle.grid}, minmax(0, 1fr))` }}>
            {puzzle.pieces.slice(0, puzzle.grid * puzzle.grid).map((emoji, index) => (
              <div key={`${emoji}-${index}`} className="flex aspect-square items-center justify-center rounded-xl bg-white/55 text-2xl sm:text-3xl">{emoji}</div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-900">
            <p className="text-base font-black">How to play</p>
            <p>1. Tap a picture piece.</p>
            <p>2. Find the same pale picture.</p>
            <p>3. Tap its space to place it.</p>
          </div>
        </aside>

        <section className="flex min-w-0 flex-col gap-4">
          <p className="rounded-full bg-white/80 px-4 py-2 text-center font-black text-orange-700 shadow-md">
            {dragging ? `🎯 Now find the matching ${dragging.piece.emoji} shadow` : 'Tap a piece, then match its picture shadow'}
          </p>

        <div className="grid gap-2 w-full max-w-md mx-auto rounded-[2rem] border-4 border-white bg-white/60 p-3 shadow-xl" style={{ gridTemplateColumns: `repeat(${puzzle.grid}, minmax(0, 1fr))` }}>
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
                      ? dragging.piece.correctSlot === index
                        ? 'border-dashed border-orange-500 bg-orange-100 animate-pulse ring-4 ring-orange-200'
                        : 'border-dashed border-amber-200 bg-white/55'
                      : 'border-dashed border-amber-300 bg-white/65'
                } ${!piece && dragging ? 'hover:bg-orange-200/60 hover:border-orange-500' : ''}`}
              >
                {piece ? piece.emoji : <span className="text-3xl opacity-20 grayscale sm:text-4xl" aria-hidden="true">{puzzle.pieces[index]}</span>}
              </button>
            );
          })}
        </div>

        <div
          className="bg-white/80 rounded-3xl p-4 w-full max-w-xl mx-auto min-h-[112px] border-4 border-white shadow-lg"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropBack}
        >
          <p className="text-center text-sm font-black text-slate-600 mb-2">Pieces tray · choose one</p>
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
            const emptySlot = state.placed.findIndex((p) => !p);
            const correctPiece = state.tray.find((p) => p.correctSlot === emptySlot) || state.tray[0];
            if (correctPiece && emptySlot >= 0) {
              playSfx('sparkle');
              speak(`Try putting a piece in slot ${emptySlot + 1}`);
            }
          }} className="mx-auto flex items-center gap-2 bg-white text-orange-600 font-black px-5 py-2 rounded-full shadow-md hover:bg-orange-50 transition text-sm"><Lightbulb size={17} /> Show me a hint</button>
        )}

        {solved && (
          <div className="bg-white/90 p-6 rounded-3xl shadow-xl text-center">
            <div className="text-5xl mb-2">🎉</div>
            <h3 className="text-2xl font-black text-orange-700">{completionMessage}</h3>
            <div className="flex gap-4 justify-center mt-3">
              <button onClick={handleNextPuzzle} className="text-orange-600 font-semibold">Next puzzle</button>
              <button onClick={() => startPuzzle(puzzleIndex)} className="text-orange-600 font-semibold">Replay</button>
            </div>
          </div>
        )}
        {!solved && completionMessage && <p className="text-center text-sm font-black text-rose-600" aria-live="polite">{completionMessage}</p>}
        </section>
      </div>
    </div>
  );
};

export default PuzzlePlay;
