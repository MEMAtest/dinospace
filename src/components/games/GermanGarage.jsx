import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, CarFront, Volume2, Wrench } from 'lucide-react';
import { GERMAN_MATCH_MODES } from '../../data/index.js';
import { getGermanAudioPath } from '../../data/germanAudio.js';
import { buildSeededGermanRound, loadGermanTargetHistory, saveGermanTargetHistory, germanHistoryMode, rememberGermanTarget, germanTranslation } from '../../data/germanLearning.js';
import { SoundToggle } from '../shared/index.jsx';
import emptyGarage from '../../assets/german-garage/empty-garage.png';
import friendlyCar from '../../assets/german-garage/friendly-car.png';
import garageScene from '../../assets/german-garage/scenes/garage.webp';
import numbersScene from '../../assets/german-garage/scenes/numbers.webp';
import animalsScene from '../../assets/german-garage/scenes/animals.webp';
import shapesScene from '../../assets/german-garage/scenes/shapes.webp';
import foodsScene from '../../assets/german-garage/scenes/foods.webp';
import vehiclesScene from '../../assets/german-garage/scenes/vehicles.webp';
import bodyScene from '../../assets/german-garage/scenes/body.webp';
import greetingsScene from '../../assets/german-garage/scenes/greetings.webp';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';

const TAB_ICONS = {
  paint: '🎨', park: '🏠', numbers: '🔢', animals: '🐯', shapes: '⭐', foods: '🍎',
  vehicles: '🚙', parts: '🛠️', directions: '🧭', body: '✋', greetings: '💬',
};

const MODE_COPY = {
  paint: { mission: 'FARBEN-MISSION', instruction: 'Find the colour', helper: 'Tap the matching paint colour' },
  park: { mission: 'GARAGEN-MISSION', instruction: 'Choose the garage', helper: 'Tap the matching coloured garage door' },
  numbers: { mission: 'ZAHLEN-MISSION', instruction: 'Find the number', helper: 'Listen, then choose the number' },
  animals: { mission: 'TIER-MISSION', instruction: 'Find the animal', helper: 'Which animal did you hear?' },
  shapes: { mission: 'FORMEN-MISSION', instruction: 'Match the shape', helper: 'Choose the matching shape' },
  foods: { mission: 'ESSEN-MISSION', instruction: 'Pack the snack', helper: 'Choose the named food' },
  vehicles: { mission: 'FAHRZEUG-MISSION', instruction: 'Choose the vehicle', helper: 'Which vehicle did you hear?' },
  parts: { mission: 'AUTOTEILE-MISSION', instruction: 'Find the car part', helper: 'Listen, then choose the matching car part.' },
  directions: { mission: 'RICHTUNGS-MISSION', instruction: 'Guide the car', helper: 'Listen to the German direction and choose its meaning.' },
  body: { mission: 'KÖRPER-MISSION', instruction: 'Touch the body part', helper: 'Choose the named body part' },
  greetings: { mission: 'GRÜSSE-MISSION', instruction: 'Choose the word', helper: 'Listen to the German greeting' },
};

const MODE_SCENES = {
  park: garageScene,
  numbers: numbersScene,
  animals: animalsScene,
  shapes: shapesScene,
  foods: foodsScene,
  vehicles: vehiclesScene,
  parts: vehiclesScene,
  directions: garageScene,
  body: bodyScene,
  greetings: greetingsScene,
};

const GermanGarage = ({ onBack, playSfx, soundOn, onToggleSound, onCelebrate, onGameEvent, onReviewComplete, playerId, sessionLevel = 0 }) => {
  const difficulty = useGameDifficulty('german');
  const optionCount = difficulty === 'starter' ? 3 : difficulty === 'growing' ? 4 : 6;
  const levelTarget = [5, 6, 7][sessionLevel] || 5;
  const [runSeed] = useState(() => Math.floor(Math.random() * 4294967296));
  const [completedHistory] = useState(() => loadGermanTargetHistory(playerId));
  const [initialRounds] = useState(() => {
    let cursor = 0;
    const create = (roundMode) => buildSeededGermanRound(roundMode, completedHistory[germanHistoryMode(roundMode)] || [], optionCount, runSeed, cursor++);
    const practiceMode = sessionLevel === 1 ? 'vehicles' : sessionLevel === 2 ? 'directions' : 'numbers';
    const paint = create('paint');
    const park = create('park');
    const match = create(practiceMode);
    const activeMode = sessionLevel === 0 ? 'paint' : practiceMode;
    // Only the visible question belongs in shown history. Unused initial state
    // for another tab must not push completed words out of the recent window.
    const activeRound = sessionLevel === 0 ? paint : match;
    return { history: rememberGermanTarget(completedHistory, activeMode, activeRound.target.name), paint, park, match };
  });
  const recentTargetsRef = useRef(initialRounds.history);
  const completedTargetsRef = useRef(completedHistory);
  const questionCursorRef = useRef(3);
  const loggedRoundRef = useRef(null);
  const [mode, setMode] = useState(sessionLevel === 1 ? 'vehicles' : sessionLevel === 2 ? 'directions' : 'paint');
  const [paintRound, setPaintRound] = useState(initialRounds.paint);
  const [parkRound, setParkRound] = useState(initialRounds.park);
  const [matchRound, setMatchRound] = useState(initialRounds.match);
  const [feedback, setFeedback] = useState('');
  const [roundCount, setRoundCount] = useState(0);
  const [pendingRound, setPendingRound] = useState(null);
  const [showMorePractice, setShowMorePractice] = useState(false);
  const [paintedColour, setPaintedColour] = useState(null);
  const [failedImages, setFailedImages] = useState([]);
  const germanAudioRef = useRef(null);
  const hadMistakeRef = useRef(false);
  const answeredRef = useRef(false);

  const round = mode === 'paint' ? paintRound : mode === 'park' ? parkRound : matchRound;
  const copy = MODE_COPY[mode];
  const sceneImage = mode === 'paint' ? emptyGarage : MODE_SCENES[mode];
  const imageFailed = (src) => failedImages.includes(src);
  const markImageFailed = (src) => setFailedImages((current) => current.includes(src) ? current : [...current, src]);
  const coreTabs = useMemo(() => {
    if (sessionLevel === 1) return [{ id: 'vehicles', label: 'Fahrzeuge' }, { id: 'parts', label: 'Autoteile' }];
    if (sessionLevel === 2) return [{ id: 'directions', label: 'Richtungen' }];
    return [{ id: 'paint', label: 'Farben' }, { id: 'park', label: 'Garage' }];
  }, [sessionLevel]);
  const moreTabs = useMemo(() => [
    { id: 'parts', label: 'Autoteile' }, { id: 'directions', label: 'Richtungen' },
    ...GERMAN_MATCH_MODES.map(({ id, label }) => ({ id, label })),
    { id: 'paint', label: 'Farben' }, { id: 'park', label: 'Garage' },
  ].filter((tab) => !coreTabs.some((core) => core.id === tab.id)), [coreTabs]);
  const modeTabs = [...coreTabs, ...(showMorePractice ? moreTabs : [])];

  const playGermanTerm = useCallback((term) => {
    const audioPath = getGermanAudioPath(term);
    if (!soundOn || !audioPath) return;
    germanAudioRef.current?.pause();
    const audio = new Audio(audioPath);
    germanAudioRef.current = audio;
    audio.play().catch(() => {
      // Browsers may block automatic playback. The visible speaker button
      // gives the child a user-initiated retry without using computer speech.
    });
  }, [soundOn]);

  useEffect(() => {
    if (round?.target?.name) playGermanTerm(round.target.name);
  }, [mode, playGermanTerm, round?.target?.name]);

  useEffect(() => () => {
    germanAudioRef.current?.pause();
  }, []);

  const makeNextRound = (roundMode) => {
    const recent = recentTargetsRef.current[germanHistoryMode(roundMode)] || [];
    const next = buildSeededGermanRound(roundMode, recent, optionCount, runSeed, questionCursorRef.current++);
    recentTargetsRef.current = rememberGermanTarget(recentTargetsRef.current, roundMode, next.target.name);
    answeredRef.current = false;
    setFeedback('');
    hadMistakeRef.current = false;
    setPendingRound(null);
    setPaintedColour(null);
    if (roundMode === 'paint') setPaintRound(next);
    else if (roundMode === 'park') setParkRound(next);
    else setMatchRound(next);
  };

  useEffect(() => {
    if (loggedRoundRef.current === round) return;
    if (!loggedRoundRef.current) onGameEvent?.('german', 'start', { level: sessionLevel, round: 0, seed: runSeed });
    loggedRoundRef.current = round;
    onGameEvent?.('german', 'question', { level: sessionLevel, round: roundCount, seed: round.seed, difficulty });
  }, [round, roundCount, runSeed, sessionLevel, difficulty, onGameEvent]);

  const choose = (option) => {
    if (answeredRef.current || pendingRound) return;
    if (option.name !== round.target.name) {
      onGameEvent?.('german', 'answer_attempt', { level: sessionLevel, round: roundCount, seed: round.seed, firstAttempt: !hadMistakeRef.current });
      hadMistakeRef.current = true;
      setFeedback('Not quite. Hear the word again, then choose the matching picture.');
      playSfx('oops');
      playGermanTerm(round.target.name);
      return;
    }
    answeredRef.current = true;
    if (mode === 'paint') setPaintedColour(option);
    const translation = germanTranslation(mode, round.target.name);
    const extraPractice = !coreTabs.some((tab) => tab.id === mode);
    const nextCount = roundCount + (extraPractice ? 0 : 1);
    const isFinalRound = !extraPractice && nextCount >= levelTarget;
    const answerEvent = {
      skill: `german-${mode}`,
      item: round.target.name,
      response: option.name,
      expected: round.target.name,
      correct: true,
      firstAttempt: !hadMistakeRef.current,
      independent: !hadMistakeRef.current,
      difficulty,
      level: sessionLevel,
      round: roundCount,
      seed: round.seed,
      deferFinish: isFinalRound,
    };
    completedTargetsRef.current = rememberGermanTarget(completedTargetsRef.current, mode, round.target.name);
    saveGermanTargetHistory(playerId, completedTargetsRef.current);
    setRoundCount(nextCount);
    setPendingRound({ mode, final: isFinalRound });
    setFeedback(`Richtig! ${round.target.name} means ${translation}.`);
    playSfx('success');
    playGermanTerm(round.target.name);
    onCelebrate(`Richtig! ${translation}.`, 4, 120);
    onGameEvent?.('german', extraPractice ? 'practice_correct' : 'answer_correct', answerEvent);
  };

  const advanceAfterReview = () => {
    if (!pendingRound) return;
    playSfx('click');
    if (pendingRound.final) {
      onReviewComplete?.();
      return;
    }
    const coreModes = sessionLevel === 0 ? ['paint', 'park'] : sessionLevel === 1 ? ['vehicles', 'parts'] : ['directions'];
    const nextMode = coreModes.includes(pendingRound.mode)
      ? coreModes[(coreModes.indexOf(pendingRound.mode) + 1) % coreModes.length]
      : coreModes[roundCount % coreModes.length];
    setMode(nextMode);
    makeNextRound(nextMode);
  };

  const selectMode = (nextMode) => {
    if (pendingRound) return;
    answeredRef.current = false;
    setMode(nextMode);
    setFeedback('');
    setPaintedColour(null);
    hadMistakeRef.current = false;
    const recent = recentTargetsRef.current[germanHistoryMode(nextMode)] || [];
    const next = buildSeededGermanRound(nextMode, recent, optionCount, runSeed, questionCursorRef.current++);
    recentTargetsRef.current = rememberGermanTarget(recentTargetsRef.current, nextMode, next.target.name);
    if (nextMode === 'paint') setPaintRound(next);
    else if (nextMode === 'park') setParkRound(next);
    else setMatchRound(next);
    playSfx('click');
  };

  const renderOption = (option) => {
    const isColour = mode === 'paint';
    return (
      <button
        key={`${mode}-${option.name}`}
        onClick={() => choose(option)}
        disabled={Boolean(pendingRound)}
        className="group min-h-28 rounded-[1.6rem] border-4 border-white bg-white p-3 text-center shadow-[0_7px_0_rgba(148,92,20,0.18),0_13px_28px_rgba(148,92,20,0.12)] transition hover:-translate-y-1 active:translate-y-1 active:shadow-none"
        aria-label={germanTranslation(mode, option.name)}
      >
        {mode === 'park' ? (
          <span className="mx-auto mb-2 block w-20 overflow-hidden rounded-xl border-4 border-slate-200 bg-amber-50 shadow-md" aria-hidden="true">
            <span className="block bg-slate-700 py-1 text-lg leading-none">🏠</span>
            <span className="block h-12 border-t-4 border-white/80" style={{ backgroundColor: option.hex, backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,.22) 0 3px, transparent 3px 12px)' }} />
          </span>
        ) : isColour ? (
          <span className="mx-auto mb-2 block h-14 w-14 rounded-2xl border-4 border-black/5 shadow-inner" style={{ backgroundColor: option.hex }} />
        ) : (
          <span className="mb-2 block text-5xl transition-transform group-hover:scale-110">{option.emoji}</span>
        )}
        <span className="text-base font-black text-slate-800 sm:text-lg">{germanTranslation(mode, option.name)}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#fff5dc] text-slate-900">
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-3 pt-3 sm:px-5">
        <button onClick={() => { onGameEvent?.('german', 'leave', { level: sessionLevel, round: roundCount, seed: round?.seed, difficulty }); onBack(); }} className="game-icon-button !bg-amber-400 !text-white" aria-label="Back to learning world"><ArrowLeft /></button>
        <nav className={`order-last grid w-full ${modeTabs.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-1 rounded-[1.7rem] border-2 border-amber-100 bg-white/90 p-1.5 shadow-lg sm:order-none sm:flex sm:w-auto sm:flex-1 sm:flex-wrap`} aria-label="German Garage lessons">
          {modeTabs.map((tab) => (
            <button
              key={tab.id}
              disabled={Boolean(pendingRound)}
              onClick={(event) => {
                selectMode(tab.id);
                event.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              }}
              className={`flex min-h-12 shrink-0 items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm ${mode === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-700 hover:bg-amber-50'}`}
              aria-pressed={mode === tab.id}
            >
              <span>{TAB_ICONS[tab.id]}</span>{tab.label}
            </button>
          ))}
        </nav>
        <button type="button" onClick={() => setShowMorePractice((open) => !open)} disabled={Boolean(pendingRound)} aria-expanded={showMorePractice} className="min-h-12 shrink-0 rounded-full border-2 border-amber-200 bg-white px-3 text-xs font-black text-slate-700 disabled:opacity-50 sm:text-sm">{showMorePractice ? 'Less' : 'More practice'}</button>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-8 pt-4">
        {!coreTabs.some((tab) => tab.id === mode) && <p className="mb-3 rounded-full bg-amber-100 px-4 py-2 font-bold text-amber-900">Extra practice · your level stays where you left it.</p>}
        <div className="mb-3 flex w-full items-center justify-between gap-3">
          <div className="rounded-2xl bg-white px-4 py-2 shadow-md" aria-label={`Level ${sessionLevel + 1}, round ${Math.min(roundCount + 1, levelTarget)} of ${levelTarget}`}>
            <div className="flex items-center gap-2 font-black text-amber-600"><span aria-hidden="true">⭐</span> Level {sessionLevel + 1} · {Math.min(roundCount + 1, levelTarget)} / {levelTarget}</div>
            <div className="mt-1 h-2 w-28 overflow-hidden rounded-full bg-amber-100"><div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${(roundCount / levelTarget) * 100}%` }} /></div>
          </div>
          <div className="flex-1 rounded-[2rem] border-4 border-white bg-white/95 px-4 py-3 text-center shadow-xl sm:px-8">
            <p className="text-xs font-black tracking-[0.18em] text-blue-500">{copy.mission}</p>
            <p className="text-xl font-black text-slate-800 sm:text-3xl">{copy.instruction}…</p>
            <div className="flex items-center justify-center gap-2">
                <strong className="text-xl font-black text-blue-600 sm:text-2xl">Listen to the German clue</strong>
                <button onClick={() => { onGameEvent?.('german', 'hint', { level: sessionLevel, round: roundCount, seed: round.seed, difficulty, hintType: 'replay_clue' }); playGermanTerm(round.target.name); }} className="rounded-full bg-blue-600 p-3 text-white shadow-md" aria-label="Replay the German clue"><Volume2 /></button>
              </div>
          </div>
        </div>

        <section className="relative h-52 w-full overflow-hidden rounded-[2rem] border-4 border-white shadow-xl sm:h-80">
          {imageFailed(sceneImage)
            ? <div role="img" aria-label={`${copy.mission.toLowerCase()} illustrated learning scene`} className="flex h-full w-full items-center justify-around bg-gradient-to-b from-sky-200 via-amber-100 to-orange-200 text-blue-700"><Wrench size={64} /><span className="text-6xl" aria-hidden="true">🏠</span><CarFront size={92} /></div>
            : <img src={sceneImage} onError={() => markImageFailed(sceneImage)} alt={`${copy.mission.toLowerCase()} illustrated learning scene`} className="h-full w-full object-cover object-center" />}
          {mode === 'paint' && (
            <div className="absolute inset-0 flex items-center justify-center pt-2" aria-live="polite">
              <div className="relative h-[92%] w-[62%] max-w-[620px]">
                {imageFailed(friendlyCar)
                  ? <div role="img" aria-label={paintedColour ? `The car is now ${paintedColour.name}` : 'Friendly white car ready to be painted'} className="absolute inset-0 grid place-items-center text-slate-700 drop-shadow-xl"><CarFront size={150} fill={paintedColour?.hex || '#fff'} strokeWidth={2.5} /></div>
                  : <img src={friendlyCar} onError={() => markImageFailed(friendlyCar)} alt={paintedColour ? `The car is now ${paintedColour.name}` : 'Friendly white car ready to be painted'} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_18px_18px_rgba(15,23,42,.32)]" />}
                {paintedColour && !imageFailed(friendlyCar) && (
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
        <div className={`mt-4 min-h-8 text-center text-lg font-black ${feedback.startsWith('Richtig') ? 'text-emerald-700' : 'text-rose-700'}`} aria-live="polite">{feedback}</div>
        {pendingRound && <div className="mt-2 flex w-full max-w-md flex-col items-center gap-2 rounded-2xl border-2 border-emerald-200 bg-white/95 p-4 text-center shadow-lg" role="status">
          <p className="font-bold text-slate-700">{round.target.name} means <strong>{round.translation || germanTranslation(mode, round.target.name)}</strong> in English.</p>
          <button type="button" onClick={advanceAfterReview} className="min-h-12 rounded-full bg-emerald-600 px-6 font-black text-white shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300">{pendingRound.final ? 'Finish level' : 'Next word'}</button>
        </div>}
      </main>
    </div>
  );
};

export default GermanGarage;
