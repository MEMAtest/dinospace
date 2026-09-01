import { useEffect, useMemo, useState } from 'react';
import { Eye, Home, Lightbulb, RotateCcw } from 'lucide-react';
import { getPraise, shuffle } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';
import { getDifficultyIndex, useGameDifficulty } from '../../hooks/useGameDifficulty.js';
import dinoPark from '../../assets/puzzle-pop/dino-park.jpg';
import dinoRiver from '../../assets/puzzle-pop/dino-river.svg';
import dinoMoon from '../../assets/puzzle-pop/dino-moon.svg';

const LEVELS = [
  { name: 'Dino Park Starter', grid: 2, scene: { title: 'Dino Park', image: dinoPark, alt: 'Friendly dinosaurs in a sunny park', helper: 'Match the big, easy picture pieces.' } },
  { name: 'River Valley Explorer', grid: 3, scene: { title: 'River Valley', image: dinoRiver, alt: 'A friendly dinosaur beside a sparkling river', helper: 'Look for the river, hills and dinosaur details.' } },
  { name: 'Moon Camp Champion', grid: 4, scene: { title: 'Moon Camp', image: dinoMoon, alt: 'A friendly dinosaur exploring a moon camp', helper: 'Use edges and tiny details to solve this tricky scene.' } },
];

const makePieces = (grid) => shuffle(
  Array.from({ length: grid * grid }, (_, correctSlot) => ({ id: `piece-${correctSlot}`, correctSlot })),
);

const tileStyle = (slot, grid, image) => {
  const column = slot % grid;
  const row = Math.floor(slot / grid);
  const axis = grid - 1;
  return {
    backgroundImage: `url(${image})`,
    backgroundSize: `${grid * 100}% ${grid * 100}%`,
    backgroundPosition: `${(column / axis) * 100}% ${(row / axis) * 100}%`,
  };
};

const PuzzlePlay = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent }) => {
  const difficulty = useGameDifficulty('puzzle');
  const [levelIndex, setLevelIndex] = useState(() => getDifficultyIndex(difficulty));
  const level = LEVELS[levelIndex];
  const [tray, setTray] = useState(() => makePieces(LEVELS[0].grid));
  const [placed, setPlaced] = useState(() => Array(LEVELS[0].grid ** 2).fill(null));
  const [selected, setSelected] = useState(null);
  const [moves, setMoves] = useState(0);
  const [message, setMessage] = useState('Choose a picture piece below.');
  const [wrongSlot, setWrongSlot] = useState(null);
  const [wrongPiece, setWrongPiece] = useState(null);
  const solved = placed.every(Boolean);

  const progress = useMemo(() => placed.filter(Boolean).length, [placed]);

  useEffect(() => {
    speak(`Build the ${level.scene.title} picture. Choose a piece, then tap its matching place.`);
  }, [level.name, level.scene.title, speak]);

  const resetLevel = (nextIndex = levelIndex) => {
    const nextLevel = LEVELS[nextIndex];
    setLevelIndex(nextIndex);
    setTray(makePieces(nextLevel.grid));
    setPlaced(Array(nextLevel.grid ** 2).fill(null));
    setSelected(null);
    setMoves(0);
    setWrongSlot(null);
    setWrongPiece(null);
    setMessage('Choose a picture piece below.');
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resetLevel(getDifficultyIndex(difficulty));
  }, [difficulty]); // eslint-disable-line react-hooks/exhaustive-deps

  const choosePiece = (piece) => {
    setSelected(piece);
    setMessage('Piece selected — find its matching space.');
    playSfx('click');
  };

  const placePiece = (slotIndex) => {
    if (!selected) {
      setMessage('Choose a picture piece from the tray first.');
      return;
    }
    setMoves((value) => value + 1);
    if (selected.correctSlot !== slotIndex) {
      setWrongSlot(slotIndex);
      setWrongPiece(selected.id);
      setMessage(`Not there yet — compare the edges with the ${level.scene.title} preview.`);
      playSfx('oops');
      window.setTimeout(() => {
        setWrongSlot(null);
        setWrongPiece(null);
      }, 500);
      return;
    }

    const nextPlaced = [...placed];
    nextPlaced[slotIndex] = selected;
    const nextTray = tray.filter((piece) => piece.id !== selected.id);
    setPlaced(nextPlaced);
    setTray(nextTray);
    setSelected(null);
    playSfx('sparkle');

    if (nextPlaced.every(Boolean)) {
      const praise = getPraise();
      setMessage(`${praise} The ${level.scene.title} is complete!`);
      playSfx('success');
      onCelebrate(praise, 6, 180);
      onGameEvent?.('puzzle', 'level_completed');
      speak(praise);
    } else {
      setMessage(`Great fit! ${nextPlaced.filter(Boolean).length} of ${nextPlaced.length} pieces placed.`);
    }
  };

  const showHint = () => {
    const nextPiece = selected || tray[0];
    if (!nextPiece) return;
    setSelected(nextPiece);
    setMessage(`Hint: piece ${nextPiece.correctSlot + 1} belongs in the glowing space.`);
    speak(`Piece ${nextPiece.correctSlot + 1} goes in the glowing space.`);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-amber-100 via-yellow-50 to-emerald-100 text-slate-800">
      <header className="flex items-center justify-between px-4 pt-3">
        <button onClick={onBack} className="game-icon-button" aria-label="Back to all games"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-orange-700">Puzzle Pop</h2>
          <p className="font-bold text-orange-700/70">{level.name} · Moves {moves} · {progress}/{placed.length}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-4 pt-3 lg:grid-cols-[minmax(250px,.52fr)_minmax(500px,1fr)]">
        <aside className="rounded-[2rem] border-4 border-white bg-white/80 p-3 shadow-xl backdrop-blur">
          <div className="mb-2 flex items-center justify-between font-black text-orange-700">
            <span className="flex items-center gap-2"><Eye size={20} /> Picture preview</span>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs">Look here</span>
          </div>
          <img src={level.scene.image} alt={`Completed ${level.scene.alt} picture preview`} className="aspect-[4/3] w-full rounded-2xl object-cover shadow-md" />
          <div className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-center text-sm font-black text-emerald-800">{level.scene.helper}</div>
          <div className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-950">
            <p className="font-black">How to play</p>
            <p>1. Tap a real picture piece.</p>
            <p>2. Compare it with the preview.</p>
            <p>3. Tap where that piece belongs.</p>
          </div>
        </aside>

        <section className="flex min-w-0 flex-col gap-3">
          <p className="rounded-full bg-white/90 px-4 py-2 text-center font-black text-orange-700 shadow-md" aria-live="polite">{message}</p>

          <div
            className="grid aspect-[4/3] w-full max-w-[555px] gap-1.5 self-center overflow-hidden rounded-[2rem] border-4 border-white bg-amber-50 p-2 shadow-xl"
            style={{ gridTemplateColumns: `repeat(${level.grid}, minmax(0, 1fr))` }}
            aria-label={`${level.grid} by ${level.grid} dinosaur picture puzzle board`}
          >
            {placed.map((piece, slotIndex) => {
              const isHint = selected?.correctSlot === slotIndex;
              return (
                <button
                  key={`slot-${slotIndex}`}
                  onClick={() => placePiece(slotIndex)}
                  className={`relative overflow-hidden rounded-xl border-2 transition ${wrongSlot === slotIndex ? 'animate-shake border-red-500 bg-red-100 ring-4 ring-red-200' : piece ? 'border-white shadow-inner' : isHint ? 'animate-pulse border-orange-500 bg-orange-100 ring-4 ring-orange-200' : 'border-dashed border-amber-300 bg-white/70'}`}
                  aria-label={piece ? `Picture piece ${slotIndex + 1} placed` : `Empty picture space ${slotIndex + 1}`}
                >
                  {piece ? (
                    <span className="absolute inset-0 bg-cover" style={tileStyle(piece.correctSlot, level.grid, level.scene.image)} />
                  ) : (
                    <span className="grid h-full place-items-center text-3xl font-black text-amber-300">{slotIndex + 1}</span>
                  )}
                </button>
              );
            })}
          </div>

          {!solved ? (
            <div className="rounded-[1.6rem] border-4 border-white bg-white/85 p-3 shadow-lg">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-black text-slate-700">Picture pieces</p>
                <button onClick={showHint} className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-black text-orange-700"><Lightbulb size={16} /> Hint</button>
              </div>
              <div className={`grid gap-2 ${level.grid === 2 ? 'grid-cols-4' : 'grid-cols-5 sm:grid-cols-9'}`}>
                {tray.map((piece) => (
                  <button
                    key={piece.id}
                    onClick={() => choosePiece(piece)}
                    className={`relative aspect-[4/3] overflow-hidden rounded-xl border-4 bg-white shadow-md transition hover:-translate-y-1 ${selected?.id === piece.id ? 'scale-105 border-orange-500 ring-4 ring-orange-200' : 'border-white'}`}
                    aria-label={`Choose picture piece ${piece.correctSlot + 1}`}
                  >
                    <span className="absolute inset-0 bg-cover" style={tileStyle(piece.correctSlot, level.grid, level.scene.image)} />
                    <span className="sr-only">{wrongPiece === piece.id ? 'Try comparing this piece with the preview.' : ''}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 rounded-3xl bg-white/90 p-4 shadow-xl">
              <span className="text-4xl">🎉</span>
              <button onClick={() => resetLevel((levelIndex + 1) % LEVELS.length)} className="rounded-2xl bg-orange-500 px-5 py-3 font-black text-white shadow-lg">Next puzzle</button>
              <button onClick={() => resetLevel(levelIndex)} className="game-icon-button !text-orange-600" aria-label="Replay this puzzle"><RotateCcw /></button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default PuzzlePlay;
