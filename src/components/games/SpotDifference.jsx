import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Home } from 'lucide-react';
import { SPOT_LEVELS } from '../../data/index.js';
import { getPraise } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';

const SpotDifference = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = SPOT_LEVELS[levelIndex];
  const [found, setFound] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [showComplete, setShowComplete] = useState(false);
  const differenceIndices = useMemo(
    () => Object.keys(level.diffs).map((key) => Number(key)),
    [level.diffs],
  );

  useEffect(() => {
    setFound([]);
    setFeedback('');
    setShowComplete(false);
    speak(`Spot the differences. ${level.name}.`);
  }, [level, speak]);

  const handleTap = (index) => {
    if (showComplete) return;
    if (found.includes(index)) return;
    if (differenceIndices.includes(index)) {
      const nextFound = [...found, index];
      setFound(nextFound);
      playSfx('sparkle');
      setFeedback('Gefunden!');
      if (nextFound.length === differenceIndices.length) {
        const praise = getPraise();
        setShowComplete(true);
        onCelebrate(praise, 10, 250);
        speak(`${praise} Alle Unterschiede gefunden!`, { lang: 'de-DE', rate: 0.9, pitch: 1.05 });
      }
    } else {
      setFeedback('Nope!');
      playSfx('oops');
    }
  };

  const handleNext = () => {
    if (levelIndex < SPOT_LEVELS.length - 1) {
      setLevelIndex((prev) => prev + 1);
    } else {
      setLevelIndex(0);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-100 via-slate-100 to-indigo-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-6 right-6 w-40 h-40 bg-white/70 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-200/60 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button
          onClick={onBack}
          className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Home />
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-indigo-700">Spot the Difference</h2>
          <p className="text-indigo-700/70 font-semibold">
            {level.name} · Found {found.length}/{differenceIndices.length}
          </p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 relative z-10">
        <p className="text-indigo-700 font-semibold mb-4">{level.hint}</p>

        <div className="grid grid-cols-2 gap-6 w-full max-w-3xl">
          {[0, 1].map((sceneIndex) => (
            <div
              key={sceneIndex}
              className="bg-white/90 rounded-3xl border-4 border-indigo-200 shadow-xl p-4"
            >
              <div className="grid grid-cols-3 gap-3">
                {level.base.map((item, index) => {
                  const isFound = found.includes(index) && sceneIndex === 1;
                  const badge =
                    sceneIndex === 0
                      ? level.badge
                      : level.diffs[index] || level.badge;
                  return (
                    <button
                      key={`${sceneIndex}-${index}`}
                      onClick={() => sceneIndex === 1 && handleTap(index)}
                      disabled={sceneIndex === 0}
                      className={`w-20 h-20 rounded-2xl text-3xl flex items-center justify-center border-4 transition ${
                        isFound ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <span className="relative">
                        {item}
                        <span className="absolute -top-2 -right-3 text-xs">{badge}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {feedback && <div className="mt-4 text-xl font-bold text-indigo-700 animate-bounce">{feedback}</div>}

        {showComplete && (
          <div className="mt-6 bg-white/90 p-6 rounded-3xl shadow-xl text-center">
            <div className="text-5xl mb-2">🎉</div>
            <h3 className="text-2xl font-black text-indigo-700">{getPraise()}</h3>
            <button onClick={handleNext} className="mt-3 text-indigo-600 font-semibold">
              Next scene
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotDifference;
