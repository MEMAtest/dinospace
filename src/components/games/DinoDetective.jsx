import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Home } from 'lucide-react';
import { DINO_LEVELS } from '../../data/index.js';
import { buildDinos } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';

const DinoDetective = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = DINO_LEVELS[levelIndex];
  const [dinos, setDinos] = useState(() => buildDinos(level));
  const [foundDino, setFoundDino] = useState(null);
  const [pendingReward, setPendingReward] = useState(null);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const foundCount = dinos.filter((dino) => !dino.hidden).length;

  useEffect(() => {
    setDinos(buildDinos(level));
    setFoundDino(null);
    setPendingReward(null);
    setShowLevelComplete(false);
  }, [level]);

  const handleFind = (index) => {
    setDinos((prev) => {
      if (!prev[index].hidden) return prev;
      const next = prev.map((dino, i) => (i === index ? { ...dino, hidden: false } : dino));
      setFoundDino(next[index]);
      setPendingReward(4);
      playSfx('pop');
      if (next.every((dino) => !dino.hidden)) {
        setTimeout(() => playSfx('success'), 250);
      }
      return next;
    });
  };

  const allFound = dinos.every((dino) => !dino.hidden);

  useEffect(() => {
    if (foundDino) {
      speak(`You found ${foundDino.name}. ${foundDino.fact}`);
    }
  }, [foundDino, speak]);

  useEffect(() => {
    if (allFound && !foundDino) {
      speak('Du hast alle gefunden. Super!', { lang: 'de-DE', rate: 0.9, pitch: 1.05 });
      setShowLevelComplete(true);
    }
  }, [allFound, foundDino, speak]);

  const handleNextLevel = () => {
    onCelebrate(getPraise(), 10, 200);
    if (levelIndex < DINO_LEVELS.length - 1) {
      setLevelIndex((prev) => prev + 1);
    } else {
      setLevelIndex(0);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-200 via-green-200 to-green-300 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-8 w-24 h-24 bg-yellow-200 rounded-full blur-xl opacity-70" />
        <div className="absolute top-0 right-0 w-52 h-40 bg-white/60 rounded-[50%] blur-2xl" />
        <div className="absolute top-16 left-1/2 w-40 h-28 bg-white/40 rounded-[50%] blur-xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button
          onClick={onBack}
          className="bg-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Home />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-black text-green-900 drop-shadow-sm">{level.name}</h2>
          <p className="text-green-900/80 font-semibold">
            Level {levelIndex + 1} / {DINO_LEVELS.length} · Found {foundCount} / {dinos.length}
          </p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="z-10 text-center mt-2 px-4">
        <p className="text-green-900 font-medium">{level.hint}</p>
      </div>

      <div className="flex-1 relative z-10">
        <div className="absolute bottom-0 w-full h-28 bg-emerald-700" />
        <div className="absolute bottom-12 left-[-10%] w-64 h-32 bg-emerald-600 rounded-full opacity-90" />
        <div className="absolute bottom-16 right-[-5%] w-72 h-36 bg-emerald-800 rounded-full opacity-90" />
        <div className="absolute bottom-8 left-1/3 w-52 h-24 bg-emerald-700 rounded-full opacity-90" />

        {dinos.map((dino, i) => (
          <button
            key={dino.id}
            onClick={() => handleFind(i)}
            className="absolute transition-all duration-500 focus:outline-none"
            style={{ left: `${dino.x}%`, top: `${dino.y}%` }}
          >
            {dino.hidden ? (
              <div className="relative w-28 h-24 animate-wiggle">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-16 bg-emerald-700 rounded-full shadow-lg" />
                <div className="absolute bottom-6 left-1 w-14 h-12 bg-emerald-600 rounded-full" />
                <div className="absolute bottom-5 right-1 w-16 h-12 bg-emerald-500 rounded-full" />
                <div className="absolute bottom-2 left-8 w-10 h-10 bg-emerald-600 rounded-full" />
                <span className="absolute inset-0 flex items-center justify-center text-3xl opacity-40">🌿</span>
              </div>
            ) : (
              <div className="text-6xl animate-pop-in drop-shadow-2xl transform hover:scale-110 transition-transform">
                {dino.emoji}
              </div>
            )}
          </button>
        ))}
      </div>

      {foundDino && (
        <div className="absolute inset-0 bg-black/40 z-30 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-orange-50 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border-4 border-orange-200 animate-scale-in">
            <div className="text-8xl mb-4">{foundDino.emoji}</div>
            <h3 className="text-3xl font-black text-orange-500 mb-2">{foundDino.name}</h3>
            <div className="bg-white p-4 rounded-xl border-2 border-orange-100 mb-6">
              <p className="text-lg text-slate-700 font-medium">"{foundDino.fact}"</p>
            </div>
            <button
              onClick={() => {
                if (pendingReward) {
                  onCelebrate(getPraise(), pendingReward, 200);
                }
                setPendingReward(null);
                setFoundDino(null);
              }}
              className="bg-blue-500 text-white w-full py-4 rounded-2xl text-xl font-bold shadow-lg hover:bg-blue-600"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {showLevelComplete && !foundDino && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 p-8 rounded-3xl text-center shadow-xl animate-bounce pointer-events-auto">
            <div className="text-6xl mb-2">🏆</div>
            <h2 className="text-3xl font-bold text-green-600">{getPraise()}</h2>
            <p className="text-slate-600 font-semibold mt-2">Level geschafft!</p>
            <button
              onClick={handleNextLevel}
              className="mt-4 text-blue-500 font-bold underline"
            >
              {levelIndex < DINO_LEVELS.length - 1 ? 'Next Level' : 'Play Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DinoDetective;
