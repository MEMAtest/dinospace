import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Home, ArrowRight } from 'lucide-react';
import { PLANETS } from '../../data/index.js';
import { pickRandom, shadeColor, createPlanetStyle } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';

const PlanetBall = ({ planet, onClick }) => {
  const style = createPlanetStyle(planet);

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group flex-shrink-0 focus:outline-none"
    >
      <div className="relative rounded-full overflow-hidden" style={style}>
        <div className="absolute inset-0 rounded-full" />
        <div className="absolute top-2 left-4 w-3 h-3 bg-white/60 rounded-full" />
        {planet.ring && (
          <div
            className="absolute inset-[-12px] rounded-full border-4 opacity-70 skew-x-12 scale-x-150"
            style={{ borderColor: planet.ringColor || 'rgba(255,255,255,0.6)' }}
          />
        )}
      </div>
      <span className="font-bold text-sm text-white/90 group-hover:text-white">{planet.name}</span>
    </button>
  );
};

const SolarSystem = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [activeFact, setActiveFact] = useState(null);
  const stars = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() > 0.85 ? 3 : 2,
      })),
    [],
  );

  useEffect(() => {
    if (!selectedPlanet) {
      setActiveFact(null);
      return;
    }
    speak(
      `${selectedPlanet.name}. ${selectedPlanet.subtitle}. ${selectedPlanet.facts[0]} ${selectedPlanet.facts[1]}`,
    );
  }, [selectedPlanet, speak]);

  const handleFact = (fact) => {
    setActiveFact(fact);
    playSfx('sparkle');
    speak(`Fun fact. ${fact}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white p-4 relative overflow-hidden">
      <div className="flex justify-between items-center mb-4 z-10">
        <button
          onClick={onBack}
          className="bg-white/20 p-2 rounded-full hover:bg-white/40 transition"
        >
          <Home />
        </button>
        <h2 className="text-2xl font-bold text-yellow-300 font-comic">Space Explorer</h2>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} className="bg-white/20 text-white" />
      </div>

      <div className="absolute inset-0 opacity-50 pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size * 2}px`,
              height: `${star.size * 2}px`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 right-[-20%] w-96 h-96 bg-indigo-500/30 blur-3xl rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-400/30 blur-3xl rounded-full" />
      </div>

      <div className="flex-1 overflow-x-auto flex items-center gap-6 px-8 no-scrollbar z-10 pb-8">
        <div className="flex-shrink-0 w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold shadow-[0_0_80px_rgba(250,204,21,0.9)]">
          SUN
        </div>
        {PLANETS.map((planet) => (
          <PlanetBall
            key={planet.name}
            planet={planet}
            onClick={() => {
              playSfx('chime');
              setSelectedPlanet(planet);
            }}
          />
        ))}
      </div>

      {selectedPlanet && (
        <div className="absolute bottom-0 left-0 right-0 bg-white text-slate-900 p-6 rounded-t-3xl shadow-2xl animate-bounce-up z-20">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-indigo-600 mb-1">{selectedPlanet.name}</h3>
            <p className="text-slate-500 font-semibold mb-4">{selectedPlanet.subtitle}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {selectedPlanet.stats.map((stat) => (
              <div key={stat.label} className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
                <div className="text-xl">{stat.emoji}</div>
                <div className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</div>
                <div className="font-bold text-slate-700">{stat.value}</div>
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-slate-500 font-semibold mb-2">
            Tap a fact to hear it!
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedPlanet.facts.map((fact) => (
              <button
                key={fact}
                onClick={() => handleFact(fact)}
                className={`px-3 py-2 rounded-2xl border-2 text-sm font-semibold transition ${
                  activeFact === fact
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                {fact}
              </button>
            ))}
          </div>
          {activeFact && (
            <div className="text-center text-indigo-600 font-bold mb-4">✨ {activeFact}</div>
          )}
          <button
            onClick={() => {
              onCelebrate(undefined, 4);
              setSelectedPlanet(null);
            }}
            className={`${THEME.primary} text-white w-full py-3 rounded-full font-bold text-xl ${THEME.button} hover:bg-blue-600`}
          >
            Awesome!
          </button>
        </div>
      )}
    </div>
  );
};

export { PlanetBall };
export default SolarSystem;
