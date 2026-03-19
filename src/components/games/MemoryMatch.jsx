import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Home } from 'lucide-react';
import { MEMORY_LEVELS } from '../../data/index.js';
import { buildMemoryDeck } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';

const MemoryMatch = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = MEMORY_LEVELS[levelIndex];
  const [deck, setDeck] = useState(() => buildMemoryDeck(level));
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [timer, setTimer] = useState(0);
  const [bestTimes, setBestTimes] = useState(() => loadSaved('amari_memory_best', {}));
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [levelIndex]);

  const matches = deck.filter((card) => card.matched).length / 2;

  useEffect(() => {
    setDeck(buildMemoryDeck(level));
    setFlipped([]);
    setMoves(0);
    setLocked(false);
    setShowLevelComplete(false);
    setTimer(0);
  }, [level]);

  useEffect(() => {
    speak(`Memory level ${levelIndex + 1}. ${level.name}.`);
  }, [levelIndex, level.name, speak]);

  useEffect(() => {
    if (matches === level.emojis.length && !showLevelComplete) {
      clearInterval(timerRef.current);
      const praise = getPraise();
      speak('You matched them all. Fantastic memory!');
      playSfx('success');
      setShowLevelComplete(true);
      onCelebrate(praise, 12, 300);
      const best = bestTimes[level.id];
      if (!best || timer < best) {
        setBestTimes((prev) => {
          const next = { ...prev, [level.id]: timer };
          saveSafe('amari_memory_best', next);
          return next;
        });
      }
    }
  }, [matches, level.emojis.length, level.id, onCelebrate, playSfx, showLevelComplete, speak, timer, bestTimes]);

  const handleFlip = (index) => {
    if (locked) return;
    setDeck((prev) => {
      if (prev[index].flipped || prev[index].matched) return prev;
      const next = prev.map((card, i) => (i === index ? { ...card, flipped: true } : card));
      return next;
    });
    setFlipped((prev) => (prev.includes(index) ? prev : [...prev, index]));
    playSfx('flip');
  };

  useEffect(() => {
    if (flipped.length !== 2) return;
    const [first, second] = flipped;
    setLocked(true);
    setMoves((prev) => prev + 1);

    if (deck[first].emoji === deck[second].emoji) {
      setDeck((prev) =>
        prev.map((card, i) =>
          i === first || i === second ? { ...card, matched: true } : card,
        ),
      );
      setFlipped([]);
      setLocked(false);
      playSfx('sparkle');
      onCelebrate(getPraise(), 4, 200);
    } else {
      setTimeout(() => {
        setDeck((prev) =>
          prev.map((card, i) =>
            i === first || i === second ? { ...card, flipped: false } : card,
          ),
        );
        setFlipped([]);
        setLocked(false);
        playSfx('oops');
      }, 700);
    }
  }, [deck, flipped, onCelebrate, playSfx]);

  const handleNextLevel = () => {
    const nextIndex = levelIndex < MEMORY_LEVELS.length - 1 ? levelIndex + 1 : 0;
    setLevelIndex(nextIndex);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-100 via-pink-100 to-rose-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 right-8 w-40 h-40 bg-white/70 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-200/60 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button
          onClick={onBack}
          className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Home />
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-rose-600">Memory Match</h2>
          <p className="text-rose-600/70 font-semibold">
            Level {levelIndex + 1}/{MEMORY_LEVELS.length} · {level.name}
          </p>
          <p className="text-rose-600/70 font-semibold">
            Matches: {matches} · Moves: {moves} · ⏱️ {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
            {bestTimes[level.id] ? ` · Best: ${Math.floor(bestTimes[level.id] / 60)}:${String(bestTimes[level.id] % 60).padStart(2, '0')}` : ''}
          </p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 relative z-10">
        <button
          onClick={() => speak('Find the matching pairs.')}
          className="mb-4 text-rose-600 font-semibold"
        >
          🔊 Hear the mission
        </button>

        <div
          className="grid gap-4 w-full max-w-3xl"
          style={{ gridTemplateColumns: `repeat(${level.columns}, minmax(0, 1fr))` }}
        >
          {deck.map((card, index) => {
            const isFaceUp = card.flipped || card.matched;
            return (
              <div key={card.id} style={{ perspective: '900px' }}>
                <button onClick={() => handleFlip(index)} className="relative w-full aspect-square">
                  <div
                    className="absolute inset-0 transition-transform duration-500"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isFaceUp ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                    <div
                      className="absolute inset-0 bg-white rounded-2xl border-4 border-rose-200 shadow-lg flex items-center justify-center text-3xl"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      🌈
                    </div>
                    <div
                      className="absolute inset-0 bg-rose-500 rounded-2xl border-4 border-rose-200 shadow-lg flex items-center justify-center text-4xl"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      {card.emoji}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {showLevelComplete && (
          <div className="mt-6 bg-white/90 p-6 rounded-3xl shadow-xl text-center">
            <div className="text-5xl mb-2">🎉</div>
            <h3 className="text-2xl font-black text-rose-600">{getPraise()}</h3>
            <button onClick={handleNextLevel} className="mt-3 text-rose-600 font-semibold">
              {levelIndex < MEMORY_LEVELS.length - 1 ? 'Next level' : 'Play again'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryMatch;
