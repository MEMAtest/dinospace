import { useState, useEffect } from 'react';
import { Home } from 'lucide-react';
import { DINO_LEVELS } from '../../data/index.js';
import { buildDinos, getPraise } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';
import { getDifficultyIndex, useGameDifficulty } from '../../hooks/useGameDifficulty.js';
import DinoIcon from '../shared/DinoIcon.jsx';
import dinoPark from '../../assets/puzzle-pop/dino-park.jpg';

const DinoDetective = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent }) => {
  const difficulty = useGameDifficulty('dino');
  const [levelIndex, setLevelIndex] = useState(() => getDifficultyIndex(difficulty));
  const level = DINO_LEVELS[levelIndex];
  const [dinos, setDinos] = useState(() => buildDinos(level));
  const [foundDino, setFoundDino] = useState(null);
  const [pendingReward, setPendingReward] = useState(null);
  const foundCount = dinos.filter((dino) => !dino.hidden).length;

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

  const loadLevel = (nextIndex) => {
    setLevelIndex(nextIndex);
    setDinos(buildDinos(DINO_LEVELS[nextIndex]));
    setFoundDino(null);
    setPendingReward(null);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLevel(getDifficultyIndex(difficulty));
  }, [difficulty]);

  const handleChooseLevel = (event) => {
    const nextIndex = Number(event.target.value);
    if (nextIndex === levelIndex) return;
    loadLevel(nextIndex);
    speak(`Welcome to ${DINO_LEVELS[nextIndex].name}. ${DINO_LEVELS[nextIndex].hint}`);
  };

  const handleNextLevel = () => {
    onCelebrate(getPraise(), 10, 200);
    onGameEvent?.('dino', 'level_completed');
    const nextIndex = levelIndex < DINO_LEVELS.length - 1 ? levelIndex + 1 : 0;
    loadLevel(nextIndex);
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
          aria-label="Back to all games"
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
        <label className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-green-900/10 bg-white/75 px-4 py-2 text-sm font-bold text-green-900 shadow-sm">
          <span>Choose a dino world</span>
          <select
            aria-label="Choose a dinosaur world"
            className="max-w-40 bg-transparent font-black outline-none"
            onChange={handleChooseLevel}
            value={levelIndex}
          >
            {DINO_LEVELS.map((world, index) => (
              <option key={world.id} value={index}>{index + 1}. {world.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex-1 relative z-10 mt-3 overflow-hidden border-t-4 border-white/70 shadow-[inset_0_10px_30px_rgba(6,78,59,.2)]">
        <img src={dinoPark} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-100/5 via-transparent to-emerald-950/20" />

        {dinos.map((dino, i) => (
          <button
            key={dino.id}
            onClick={() => handleFind(i)}
            className="absolute transition-all duration-500 focus:outline-none"
            style={{ left: `${dino.x}%`, top: `${dino.y}%` }}
          >
            {dino.hidden ? (
              <div className="relative grid h-24 w-28 place-items-center animate-wiggle rounded-[50%] border-4 border-emerald-100/70 bg-emerald-700/90 shadow-[0_12px_24px_rgba(6,78,59,.35)] backdrop-blur-sm">
                <span className="text-6xl drop-shadow-lg" aria-hidden="true">🌿</span>
                <span className="absolute -right-1 -top-2 grid h-7 w-7 place-items-center rounded-full bg-amber-300 text-sm font-black text-emerald-950 shadow-md">?</span>
              </div>
            ) : (
              <div className="animate-pop-in drop-shadow-2xl transform hover:scale-110 transition-transform">
                <DinoIcon species={dino.species} size={64} />
              </div>
            )}
          </button>
        ))}
      </div>

      {foundDino && (
        <div className="absolute inset-0 bg-black/40 z-30 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-orange-50 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border-4 border-orange-200 animate-scale-in">
            <div className="mb-4 flex justify-center"><DinoIcon species={foundDino.species} size={164} /></div>
            <h3 className="text-3xl font-black text-orange-500 mb-2">{foundDino.name}</h3>
            <div className="bg-white p-4 rounded-xl border-2 border-orange-100 mb-6">
              <p className="text-lg text-slate-700 font-medium">"{foundDino.fact}"</p>
            </div>
            <button
              onClick={() => {
                if (pendingReward) {
                  onCelebrate(getPraise(), pendingReward, 200);
                }
                if (allFound) {
                  speak('Du hast alle gefunden. Super!', { lang: 'de-DE', rate: 0.9, pitch: 1.05 });
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

      {allFound && !foundDino && (
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
