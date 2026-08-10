import { useEffect, useMemo, useState } from 'react';
import { Home, Star, Volume2 } from 'lucide-react';
import { GERMAN_COLORS, GERMAN_MATCH_MODES, GERMAN_NUMBERS } from '../../data/index.js';
import { buildMatchRound } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';
import garageScene from '../../assets/german-garage/paint-car.png';
import emptyGarage from '../../assets/german-garage/empty-garage.png';
import friendlyCar from '../../assets/german-garage/friendly-car.png';

const TAB_ICONS = {
  paint: '🎨', park: '🏠', numbers: '🔢', animals: '🐯', shapes: '⭐', foods: '🍎',
  vehicles: '🚙', body: '✋', greetings: '💬',
};

const MODE_COPY = {
  paint: { mission: 'FARBEN-MISSION', instruction: 'Find the colour', helper: 'Tap the matching paint colour' },
  park: { mission: 'GARAGEN-MISSION', instruction: 'Choose the garage', helper: 'Drive to the matching colour door' },
  numbers: { mission: 'ZAHLEN-MISSION', instruction: 'Find the number', helper: 'Listen, then choose the number' },
  animals: { mission: 'TIER-MISSION', instruction: 'Find the animal', helper: 'Which animal did you hear?' },
  shapes: { mission: 'FORMEN-MISSION', instruction: 'Match the shape', helper: 'Choose the matching shape' },
  foods: { mission: 'ESSEN-MISSION', instruction: 'Pack the snack', helper: 'Choose the named food' },
  vehicles: { mission: 'FAHRZEUG-MISSION', instruction: 'Choose the vehicle', helper: 'Which vehicle did you hear?' },
  body: { mission: 'KÖRPER-MISSION', instruction: 'Touch the body part', helper: 'Choose the named body part' },
  greetings: { mission: 'GRÜSSE-MISSION', instruction: 'Choose the word', helper: 'Listen to the German greeting' },
};

const GermanGarage = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [mode, setMode] = useState('paint');
  const [paintRound, setPaintRound] = useState(() => buildMatchRound(GERMAN_COLORS));
  const [parkRound, setParkRound] = useState(() => buildMatchRound(GERMAN_COLORS));
  const [matchRound, setMatchRound] = useState(() => buildMatchRound(GERMAN_NUMBERS));
  const [feedback, setFeedback] = useState('');
  const [stars, setStars] = useState(0);
  const [paintedColour, setPaintedColour] = useState(null);

  const matchMode = GERMAN_MATCH_MODES.find((entry) => entry.id === mode);
  const round = mode === 'paint' ? paintRound : mode === 'park' ? parkRound : matchRound;
  const copy = MODE_COPY[mode];
  const modeTabs = useMemo(() => [
    { id: 'paint', label: 'Farben' },
    { id: 'park', label: 'Garage' },
    ...GERMAN_MATCH_MODES.map(({ id, label }) => ({ id, label })),
  ], []);

  const narration = useMemo(() => {
    if (!round?.target) return '';
    if (mode === 'paint') return `Finde die Farbe ${round.target.name}.`;
    if (mode === 'park') return `Fahre zum Tor mit der Farbe ${round.target.name}.`;
    return `Zeig mir ${round.target.name}.`;
  }, [mode, round]);

  useEffect(() => {
    if (narration) speak(narration, { lang: 'de-DE', rate: 0.82, pitch: 1 });
  }, [narration, speak]);

  const makeNextRound = () => {
    setFeedback('');
    setPaintedColour(null);
    if (mode === 'paint') setPaintRound(buildMatchRound(GERMAN_COLORS));
    else if (mode === 'park') setParkRound(buildMatchRound(GERMAN_COLORS));
    else if (matchMode) setMatchRound(buildMatchRound(matchMode.items));
  };

  const choose = (option) => {
    if (mode === 'paint') setPaintedColour(option);
    if (option.name !== round.target.name) {
      setFeedback('Noch einmal — try again!');
      playSfx('oops');
      speak(narration, { lang: 'de-DE', rate: 0.78, pitch: 1 });
      return;
    }
    setFeedback('Richtig! Great listening!');
    setStars((value) => Math.min(10, value + 1));
    playSfx('success');
    speak(`Richtig! ${round.target.name}.`, { lang: 'de-DE', rate: 0.82, pitch: 1 });
    onCelebrate('Richtig!', 4, 120);
    window.setTimeout(makeNextRound, 850);
  };

  const selectMode = (nextMode) => {
    setMode(nextMode);
    setFeedback('');
    setPaintedColour(null);
    const nextMatchMode = GERMAN_MATCH_MODES.find((entry) => entry.id === nextMode);
    if (nextMode === 'paint') setPaintRound(buildMatchRound(GERMAN_COLORS));
    else if (nextMode === 'park') setParkRound(buildMatchRound(GERMAN_COLORS));
    else if (nextMatchMode) setMatchRound(buildMatchRound(nextMatchMode.items));
    playSfx('click');
  };

  const renderOption = (option) => {
    const isColour = mode === 'paint' || mode === 'park';
    return (
      <button
        key={`${mode}-${option.name}`}
        onClick={() => choose(option)}
        className="group min-h-28 rounded-[1.6rem] border-4 border-white bg-white p-3 text-center shadow-[0_7px_0_rgba(148,92,20,0.18),0_13px_28px_rgba(148,92,20,0.12)] transition hover:-translate-y-1 active:translate-y-1 active:shadow-none"
        aria-label={option.name}
      >
        {isColour ? (
          <span className="mx-auto mb-2 block h-14 w-14 rounded-2xl border-4 border-black/5 shadow-inner" style={{ backgroundColor: option.hex }} />
        ) : (
          <span className="mb-2 block text-5xl transition-transform group-hover:scale-110">{option.emoji}</span>
        )}
        <span className="text-base font-black text-slate-800 sm:text-lg">{option.name}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#fff5dc] text-slate-900">
      <header className="relative z-20 flex items-center gap-3 px-3 pt-3 sm:px-5">
        <button onClick={onBack} className="game-icon-button !bg-amber-400 !text-white" aria-label="Back to games"><Home /></button>
        <nav className="flex flex-1 gap-1 overflow-x-auto rounded-[1.7rem] border-2 border-amber-100 bg-white/90 p-1.5 shadow-lg no-scrollbar" aria-label="German Garage lessons">
          {modeTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => selectMode(tab.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-black transition sm:text-sm ${mode === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-700 hover:bg-amber-50'}`}
              aria-pressed={mode === tab.id}
            >
              <span>{TAB_ICONS[tab.id]}</span>{tab.label}
            </button>
          ))}
        </nav>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-8 pt-4">
        <div className="mb-3 flex w-full items-center justify-between gap-3">
          <div className="rounded-2xl bg-white px-4 py-2 shadow-md">
            <div className="flex items-center gap-2 font-black text-amber-600"><Star fill="currentColor" size={20} /> {stars} / 10</div>
            <div className="mt-1 h-2 w-28 overflow-hidden rounded-full bg-amber-100"><div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${stars * 10}%` }} /></div>
          </div>
          <div className="flex-1 rounded-[2rem] border-4 border-white bg-white/95 px-4 py-3 text-center shadow-xl sm:px-8">
            <p className="text-xs font-black tracking-[0.18em] text-blue-500">{copy.mission}</p>
            <p className="text-xl font-black text-slate-800 sm:text-3xl">{copy.instruction}…</p>
            <div className="flex items-center justify-center gap-2">
              <strong className="text-3xl font-black text-blue-600 sm:text-5xl">{round.target.name}</strong>
              <button onClick={() => speak(narration, { lang: 'de-DE', rate: 0.82, pitch: 1 })} className="rounded-full bg-blue-600 p-3 text-white shadow-md" aria-label={`Hear ${round.target.name} in German`}><Volume2 /></button>
            </div>
          </div>
        </div>

        <section className="relative h-52 w-full overflow-hidden rounded-[2rem] border-4 border-white shadow-xl sm:h-80">
          <img src={mode === 'paint' ? emptyGarage : garageScene} alt="Bright and welcoming German learning garage" className="h-full w-full object-cover object-center" />
          {mode === 'paint' && (
            <div className="absolute inset-0 flex items-center justify-center pt-2" aria-live="polite">
              <div className="relative h-[92%] w-[62%] max-w-[620px]">
                <img src={friendlyCar} alt={paintedColour ? `The car is now ${paintedColour.name}` : 'Friendly white car ready to be painted'} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_18px_18px_rgba(15,23,42,.32)]" />
                {paintedColour && (
                  <div
                    className="absolute inset-0 transition-all duration-300"
                    style={{
                      backgroundColor: paintedColour.hex,
                      WebkitMaskImage: `url(${friendlyCar})`,
                      maskImage: `url(${friendlyCar})`,
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskPosition: 'center',
                      WebkitMaskSize: 'contain',
                      maskSize: 'contain',
                      mixBlendMode: 'multiply',
                      opacity: 0.72,
                    }}
                  />
                )}
              </div>
              {paintedColour && <span className="absolute right-4 top-4 rounded-full border-2 border-white bg-slate-900/75 px-4 py-2 text-sm font-black text-white shadow-lg">Painted {paintedColour.name}</span>}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/65 to-transparent px-5 pb-4 pt-12 text-center text-sm font-bold text-white sm:text-base">{copy.helper}</div>
        </section>

        <div className="mt-4 grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {round.options.map(renderOption)}
        </div>
        <div className={`mt-4 min-h-8 text-center text-lg font-black ${feedback.startsWith('Richtig') ? 'text-emerald-600' : 'text-rose-600'}`} aria-live="polite">{feedback}</div>
      </main>
    </div>
  );
};

export default GermanGarage;
