import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Home } from 'lucide-react';
import { GERMAN_COLORS, GERMAN_MATCH_MODES } from '../../data/index.js';
import { pickRandom, shuffle, getPraise, buildParkRound, buildMatchRound } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';

const GermanGarage = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [mode, setMode] = useState('paint');
  const [targetColor, setTargetColor] = useState(() => pickRandom(GERMAN_COLORS));
  const [painted, setPainted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [parkRound, setParkRound] = useState(buildParkRound);
  const [parkFeedback, setParkFeedback] = useState('');
  const [matchRound, setMatchRound] = useState(() => buildMatchRound(GERMAN_NUMBERS));
  const [matchFeedback, setMatchFeedback] = useState('');

  const matchMode = GERMAN_MATCH_MODES.find((entry) => entry.id === mode);
  const modeTabs = [
    { id: 'paint', label: 'Farben' },
    { id: 'park', label: 'Garage' },
    ...GERMAN_MATCH_MODES.map((entry) => ({ id: entry.id, label: entry.label })),
  ];

  useEffect(() => {
    if (mode === 'paint') {
      speak(`Finde ${targetColor.name}`, { lang: 'de-DE', rate: 0.85, pitch: 1.05 });
      return;
    }
    if (mode === 'park') {
      speak(`Parke in ${parkRound.target.name}`, { lang: 'de-DE', rate: 0.85, pitch: 1.05 });
      return;
    }
    if (matchMode) {
      speak(`${matchMode.prompt} ${matchRound.target.name}`, {
        lang: 'de-DE',
        rate: 0.85,
        pitch: 1.05,
      });
    }
  }, [mode, targetColor.name, parkRound.target.name, matchMode, matchRound.target?.name, speak]);

  useEffect(() => {
    if (!matchMode) return;
    setMatchRound(buildMatchRound(matchMode.items));
    setMatchFeedback('');
  }, [matchMode]);

  const nextPaint = () => {
    const next = pickRandom(GERMAN_COLORS);
    setTargetColor(next);
    setPainted(false);
    setFeedback('');
  };

  const nextPark = () => {
    setParkRound(buildParkRound());
    setParkFeedback('');
  };

  const nextMatch = () => {
    if (!matchMode) return;
    setMatchRound(buildMatchRound(matchMode.items));
    setMatchFeedback('');
  };

  const handlePaint = (colorObj) => {
    if (colorObj.name === targetColor.name) {
      const praise = getPraise();
      setPainted(true);
      setFeedback(praise);
      playSfx('success');
      onCelebrate(praise, 5, 200);
      setTimeout(nextPaint, 1600);
    } else {
      setFeedback('Try again!');
      playSfx('oops');
    }
  };

  const handlePark = (colorObj) => {
    if (colorObj.name === parkRound.target.name) {
      const praise = getPraise();
      setParkFeedback(praise);
      playSfx('success');
      onCelebrate(praise, 6, 200);
      setTimeout(nextPark, 1500);
    } else {
      setParkFeedback('Nope, try the other garage!');
      playSfx('oops');
    }
  };

  const handleMatchPick = (option) => {
    if (!matchMode) return;
    if (option.name === matchRound.target.name) {
      const praise = getPraise();
      setMatchFeedback(praise);
      playSfx('success');
      onCelebrate(praise, 5, 200);
      setTimeout(nextMatch, 1400);
    } else {
      setMatchFeedback('Nochmal!');
      playSfx('oops');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 via-slate-100 to-orange-100 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 right-10 w-52 h-52 bg-orange-200/60 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-0 w-60 h-60 bg-blue-200/40 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button
          onClick={onBack}
          className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Home />
        </button>
        <div className="flex gap-2 bg-white/80 p-1 rounded-full shadow-sm overflow-x-auto no-scrollbar">
          {modeTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setMode(tab.id);
                playSfx('click');
              }}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${
                mode === tab.id ? 'bg-blue-500 text-white' : 'text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-slate-200 text-center mb-8 w-full max-w-md">
          <p className="text-slate-500 mb-2 font-bold uppercase tracking-wider">
            {mode === 'paint' && 'Mechanic Mission'}
            {mode === 'park' && 'Garage Mission'}
            {matchMode && `${matchMode.label} Mission`}
          </p>
          <h2 className="text-3xl font-black text-slate-800 mb-2">
            {mode === 'paint' && 'Paint the Car...'}
            {mode === 'park' && 'Park the Car...'}
            {matchMode && `Finde ${matchRound.target?.name}`}
          </h2>
          <div className="text-4xl font-black text-blue-600 mb-2">
            {mode === 'paint' && targetColor.name}
            {mode === 'park' && parkRound.target.name}
            {matchMode && matchRound.target?.emoji}
          </div>
          {mode === 'paint' && feedback && (
            <div className="text-xl font-bold text-green-500 animate-bounce">{feedback}</div>
          )}
          {mode === 'park' && parkFeedback && (
            <div className="text-xl font-bold text-green-500 animate-bounce">{parkFeedback}</div>
          )}
          {matchMode && matchFeedback && (
            <div className="text-xl font-bold text-green-500 animate-bounce">{matchFeedback}</div>
          )}
        </div>

        {mode === 'paint' && (
          <>
            <div className="relative w-72 h-36 mb-10">
              <div className="absolute inset-0 bg-slate-200 rounded-3xl border-4 border-slate-300 shadow-inner" />
              <div
                className="absolute bottom-4 left-6 right-6 h-20 rounded-2xl shadow-lg transition-colors duration-500"
                style={{ backgroundColor: painted ? targetColor.hex : '#cbd5e1' }}
              />
              <div
                className="absolute bottom-20 left-16 right-16 h-16 rounded-t-full transition-colors duration-500"
                style={{ backgroundColor: painted ? targetColor.hex : '#cbd5e1' }}
              />
              <div className="absolute -bottom-4 left-12 w-12 h-12 bg-slate-800 rounded-full border-4 border-slate-300" />
              <div className="absolute -bottom-4 right-12 w-12 h-12 bg-slate-800 rounded-full border-4 border-slate-300" />
              <div className="absolute bottom-16 left-12 text-4xl animate-bounce-slow">🐯</div>
            </div>

            <div className="grid grid-cols-5 gap-3 w-full max-w-xl">
              {GERMAN_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handlePaint(color)}
                  className="flex flex-col items-center gap-2 group focus:outline-none"
                >
                  <div
                    className="w-14 h-20 rounded-xl shadow-md border-b-4 border-black/10 group-active:scale-95 transition-transform relative overflow-hidden group-hover:brightness-110"
                    style={{ backgroundColor: color.hex }}
                  >
                    <div className="absolute top-0 w-full h-4 bg-white/20" />
                    <div className="absolute bottom-2 right-2 text-white/50">
                      <Palette size={14} />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-600">{color.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {mode === 'park' && (
          <div className="w-full max-w-3xl flex flex-col items-center gap-6">
            <div className="text-6xl">🚗</div>
            <div
              className="w-60 h-20 rounded-3xl shadow-lg border-4 border-white"
              style={{ backgroundColor: parkRound.target.hex }}
            />
            <div className="grid grid-cols-2 gap-6 w-full">
              {parkRound.options.map((option) => (
                <button
                  key={option.name}
                  onClick={() => handlePark(option)}
                  className="group relative bg-white rounded-3xl p-4 shadow-lg border-4 border-slate-200 hover:-translate-y-1 transition"
                >
                  <div className="text-sm font-bold text-slate-500 mb-2">Garage</div>
                  <div className="text-2xl font-black text-slate-700 mb-3">{option.name}</div>
                  <div className="h-24 rounded-2xl border-4 border-slate-200 overflow-hidden relative">
                    <div className="absolute inset-0" style={{ backgroundColor: option.hex }} />
                    <div className="absolute inset-x-4 top-4 h-2 bg-white/30 rounded-full" />
                    <div className="absolute inset-x-4 top-10 h-2 bg-white/30 rounded-full" />
                    <div className="absolute inset-x-4 top-16 h-2 bg-white/30 rounded-full" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {matchMode && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-2xl">
            {matchRound.options.map((option) => (
              <button
                key={`${mode}-${option.name}`}
                onClick={() => handleMatchPick(option)}
                className="bg-white rounded-3xl p-4 shadow-lg border-4 border-slate-200 hover:-translate-y-1 transition"
              >
                <div className="text-4xl mb-2">{option.emoji}</div>
                <div className="text-lg font-black text-slate-700">{option.name}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GermanGarage;
