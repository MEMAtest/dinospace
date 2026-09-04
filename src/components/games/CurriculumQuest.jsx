import { useCallback, useEffect, useRef, useState } from 'react';
import { Headphones, Home, Map, RotateCcw, Sparkles } from 'lucide-react';
import { CONTINENTS, CURRICULUM_MODULES, getCurriculumModule, OCEANS, YEAR_ONE_JOURNEY } from '../../data/curriculumModules.js';
import { CURRICULUM_LESSON_COPY, getCurriculumVoiceClip } from '../../data/curriculumVoice.js';
import { getPraise } from '../../utils.js';
import { PracticeProgress, SoundToggle } from '../shared/index.jsx';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';

const DIFFICULTY_LABELS = { starter: 'Starter', growing: 'Growing', challenge: 'Challenge' };
const ACCENT_BADGE_CLASSES = {
  sky: 'bg-sky-100 text-sky-800',
  amber: 'bg-amber-100 text-amber-800',
  emerald: 'bg-emerald-100 text-emerald-800',
};

const ROUND_HELP = Object.freeze({
  continent: 'Tap the labelled continent where the place is.',
  country: 'Tap the labelled continent where this country belongs.',
  ocean: 'Tap the labelled ocean that matches the clue.',
  sequence: 'Tap the clues in order, starting with the oldest.',
  route: 'Use the N, E, S and W buttons to move the boat one square at a time.',
  investigation: 'Make a prediction, then compare it with the observation.',
  default: 'Look at each choice, then tap the answer that best fits the clue.',
});

const roundHelpFor = (round) => ROUND_HELP[round.type] || ROUND_HELP.default;

const shuffledIndexes = (length, avoidIndex = -1) => {
  const indexes = Array.from({ length }, (_, index) => index);
  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }
  if (indexes.length > 1 && indexes[0] === avoidIndex) [indexes[0], indexes[1]] = [indexes[1], indexes[0]];
  return indexes;
};

const skillForRound = (module, round) => {
  if (module.id === 'continents') {
    if (round.type === 'ocean') return 'geography:ocean-names';
    if (round.type === 'country') return 'geography:country-location';
    if (round.type === 'map-key') return 'geography:map-key';
    if (round.type === 'direction') return 'geography:directions';
    if (round.type === 'route') return 'geography:directions';
    if (round.type === 'uk-place') return 'geography:uk-places';
    if (round.type === 'feature') return 'geography:features';
    return 'geography:continents';
  }
  if (module.id === 'time-detectives') return round.type === 'evidence' ? 'history:evidence' : 'history:chronology';
  if (round.type === 'investigation' || round.id.includes('enquiry')) return 'science:enquiry';
  return round.id.includes('plant') ? 'science:plants'
    : round.id.includes('material') ? 'science:materials'
      : round.id.includes('season') ? 'science:seasons' : 'science:classification';
};

const answerItemsForRound = (round) => {
  if (round.type === 'continent' || round.type === 'country') return CONTINENTS;
  if (round.type === 'ocean') return OCEANS;
  return round.options || round.items || [];
};

const wrongFeedbackFor = (round) => round.wrongFeedback
  || (round.type === 'country' ? 'A country is a place inside a continent. Look at the map positions and try again.' : 'Good detective work. Look closely and try another answer.');

// Deliberately resolves only reviewed, packaged ElevenLabs clips. Missing
// entries render no control; there is no browser/device speech fallback.
const PackagedAudioButton = ({ text, label = 'Hear', soundOn }) => {
  const clip = getCurriculumVoiceClip(text);
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => () => { audioRef.current?.pause(); audioRef.current = null; }, []);
  if (!clip) return null;
  const play = () => {
    if (!soundOn) return;
    audioRef.current?.pause();
    const audio = new Audio(clip);
    audio.preload = 'auto';
    audioRef.current = audio;
    audio.onended = () => setPlaying(false);
    audio.onerror = () => setPlaying(false);
    setPlaying(true);
    audio.play().catch(() => setPlaying(false));
  };
  return <button type="button" onClick={play} disabled={!soundOn} className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-indigo-200 bg-white px-3 py-2 text-xs font-black text-indigo-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-50" aria-label={`${label}: ${text}`}><Headphones size={16} className={playing ? 'animate-pulse' : ''} />{playing ? 'Playing' : label}</button>;
};

const CurriculumMap = ({ round, selected, onPick = () => {}, disabled, showLabels = false, soundOn }) => {
  const answerItems = answerItemsForRound(round);
  const isOceanRound = round.type === 'ocean';
  return (
    <>
      <div className="relative mx-auto h-[22rem] w-full max-w-3xl overflow-hidden rounded-[2rem] border-4 border-sky-200 bg-[#38bde4] shadow-inner" aria-label="A simplified labelled world map, not to scale">
        <svg viewBox="0 0 900 440" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <g fill="none" stroke="#bae6fd" strokeWidth="2" strokeDasharray="8 10" opacity=".7">
            <path d="M0 110H900M0 220H900M0 330H900M150 0V440M300 0V440M450 0V440M600 0V440M750 0V440" />
          </g>
          <path d="M82 101c18-35 62-46 104-39l40 26 30 3 17 27-29 27-22 33-46-6-32 23-35-27-34-12-12-28Z" fill="#78b968" stroke="#3d8059" strokeWidth="5" strokeLinejoin="round" />
          <path d="M266 226l31-19 29 18 14 34-15 35-13 58-24 29-20-43-11-48-18-19 11-29Z" fill="#f49a5b" stroke="#3d8059" strokeWidth="5" strokeLinejoin="round" />
          <path d="M438 91l26-17 25 7 15 19-20 23-29 9-20-17Z" fill="#66a9ed" stroke="#3d8059" strokeWidth="5" strokeLinejoin="round" />
          <path d="M450 148l34-18 35 19 19 43-12 50-24 40-31-14-27-44-5-40Z" fill="#fb923c" stroke="#3d8059" strokeWidth="5" strokeLinejoin="round" />
          <path d="M513 81l50-25 63 5 43 19 55 4 54 34-15 44-56 2-35 21-42-8-29 20-43-27-20-32Z" fill="#a78bfa" stroke="#3d8059" strokeWidth="5" strokeLinejoin="round" />
          <path d="M686 260l51-9 62 28 38 30-27 30-59-6-40-22-35-5Z" fill="#facc15" stroke="#3d8059" strokeWidth="5" strokeLinejoin="round" />
          <path d="M305 378c82-17 183-17 284 0l-18 25-90 10-107-7Z" fill="#bfdbfe" stroke="#3d8059" strokeWidth="5" strokeLinejoin="round" />
          <path d="M0 411H900" stroke="#e0f2fe" strokeWidth="5" opacity=".9" />
        </svg>
        <div className="absolute inset-0">
          {CONTINENTS.map((continent) => (
            <button
              key={continent.id}
              type="button"
              disabled={disabled || isOceanRound}
              onClick={() => onPick(continent.id)}
              aria-label={`Choose ${continent.name}`}
              className={`absolute flex min-h-12 min-w-[4.8rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-xl border-2 px-1 py-1 text-center text-[10px] font-black shadow-md transition hover:scale-105 active:scale-95 disabled:cursor-default disabled:opacity-100 disabled:hover:scale-100 ${selected === continent.id ? 'border-white bg-slate-950 text-white ring-4 ring-white/70' : 'border-slate-700/30 bg-white/95 text-slate-800'}`}
              style={{ left: continent.position.left, top: continent.position.top }}
            >
              <span className="text-base leading-none" aria-hidden="true">{continent.emoji}</span>
              <span className="max-w-[5.4rem] leading-tight">{continent.name}</span>
            </button>
          ))}
          {isOceanRound && OCEANS.map((ocean) => (
            <button
              key={ocean.id}
              type="button"
              onClick={() => onPick(ocean.id)}
              disabled={disabled}
              aria-label={`Choose ${ocean.name}`}
              className={`absolute flex min-h-11 min-w-[5.8rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-xl border-2 px-1 py-1 text-center text-[9px] font-black shadow-md transition hover:scale-105 active:scale-95 disabled:cursor-default disabled:opacity-100 ${selected === ocean.id ? 'border-white bg-slate-950 text-white ring-4 ring-white/70' : 'border-white/70 bg-sky-950/80 text-white'}`}
              style={{ left: ocean.position.left, top: ocean.position.top }}
            >
              <span className="text-base leading-none" aria-hidden="true">{ocean.emoji}</span>
              <span className="max-w-[6.2rem] leading-tight">{ocean.name}</span>
            </button>
          ))}
        </div>
        <span className="absolute left-3 top-3 rounded-xl bg-white/85 px-2 py-1 text-xs font-black text-sky-900" aria-label="North arrow">↑ N</span>
        <span className="absolute bottom-2 right-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-sky-900">Land shapes · not to scale</span>
      </div>
      {!isOceanRound && round.type === 'country' && (
        <p className="mx-auto mt-3 max-w-2xl rounded-2xl bg-sky-50 px-4 py-3 text-center text-sm font-bold text-sky-900">Tap the continent where this country belongs.</p>
      )}
      {isOceanRound && <p className="mx-auto mt-3 max-w-2xl rounded-2xl bg-sky-50 px-4 py-3 text-center text-sm font-bold text-sky-900">Tap an ocean marker on the map.</p>}
      {round.type === 'continent' && <p className="mx-auto mt-3 max-w-2xl rounded-2xl bg-sky-50 px-4 py-3 text-center text-sm font-bold text-sky-900">Use the labelled learning map you explored, then choose the matching place.</p>}
      {!showLabels && <div className="mx-auto mt-3 flex max-w-3xl flex-wrap justify-center gap-2" aria-label="Hear map choices">{answerItems.map((item) => <PackagedAudioButton key={`hear-${item.id}`} text={item.name} label={`Hear ${item.name}`} soundOn={soundOn} />)}</div>}
      {disabled && selected === round.answer && <div className="mx-auto mt-3 flex max-w-3xl flex-wrap justify-center gap-2" aria-label="Country examples">
        {answerItems.filter((item) => item.id === round.answer && item.examples).flatMap((item) => item.examples.slice(0, 2).map((example) => <span key={`${item.id}-${example}`} className="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-slate-600">{example} · {item.name}</span>))}
      </div>}
    </>
  );
};

const ChoiceRound = ({ round, onPick, disabled, soundOn }) => (
  <div className="mx-auto grid w-full max-w-3xl gap-3 sm:grid-cols-3" aria-label="Answer choices">
    {(round.options || []).map((option) => (
      <div key={option.id} className="flex flex-col items-center gap-2 rounded-3xl border-4 border-amber-200 bg-white p-2 shadow-lg">
        <button type="button" onClick={() => onPick(option.id)} disabled={disabled} className="min-h-20 w-full rounded-2xl px-2 py-2 text-center transition hover:-translate-y-1 active:translate-y-0 disabled:opacity-70">
          <span className="block text-4xl">{option.emoji}</span>
          <strong className="mt-1 block text-sm font-black text-slate-800">{option.label}</strong>
        </button>
        <PackagedAudioButton text={option.label} label="Hear choice" soundOn={soundOn} />
      </div>
    ))}
  </div>
);

const SequenceRound = ({ round, sequence, onPick, disabled, soundOn }) => {
  const next = [...round.items].sort((a, b) => a.order - b.order)[sequence.length];
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-4 flex flex-wrap justify-center gap-2" aria-label="Sequence so far">
        {sequence.map((item, index) => <span key={item.id} className="rounded-full bg-amber-500 px-3 py-2 text-sm font-black text-white">{index + 1}. {item.label}</span>)}
      </div>
      <p className="mb-3 text-center text-sm font-black text-amber-900">{next ? `Choose the next clue (${sequence.length + 1} of ${round.items.length}).` : 'Sequence complete!'}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {round.items.map((item) => (
          <div key={item.id} className="flex flex-col items-center gap-2 rounded-3xl border-4 border-amber-200 bg-white p-2 shadow-lg">
            <button type="button" onClick={() => onPick(item.id)} disabled={disabled || sequence.some((chosen) => chosen.id === item.id)} className="min-h-24 w-full rounded-2xl px-2 py-2 text-center transition hover:-translate-y-1 active:translate-y-0 disabled:opacity-45">
              <span className="block text-4xl">{item.emoji}</span>
              <strong className="mt-1 block text-sm font-black text-slate-800">{item.label}</strong>
            </button>
            <PackagedAudioButton text={item.label} label="Hear choice" soundOn={soundOn} />
          </div>
        ))}
      </div>
    </div>
  );
};

const DIRECTION_DELTAS = {
  north: [-1, 0],
  east: [0, 1],
  south: [1, 0],
  west: [0, -1],
};

const RouteRound = ({ round, step, onMove, disabled }) => {
  const visited = [round.start];
  round.path.slice(0, step).forEach((direction) => {
    const previous = visited.at(-1);
    const [rowDelta, colDelta] = DIRECTION_DELTAS[direction];
    visited.push({ row: previous.row + rowDelta, col: previous.col + colDelta });
  });
  const position = visited.at(-1);
  return (
    <div className="mx-auto w-full max-w-xl rounded-3xl border-4 border-sky-200 bg-sky-100 p-4 shadow-inner">
      <div className="mb-3 flex items-center justify-between text-sm font-black text-sky-900"><span>↑ N</span><span>Treasure map</span><span>{step}/{round.path.length} moves</span></div>
      <div className="mx-auto grid max-w-sm grid-cols-3 gap-2" aria-label="A three by three treasure map">
        {Array.from({ length: 9 }, (_, index) => {
          const row = Math.floor(index / 3);
          const col = index % 3;
          const key = `${row}-${col}`;
          const isBoat = position.row === row && position.col === col;
          const isTarget = round.target.row === row && round.target.col === col;
          const isBlocked = round.blocked.includes(key);
          return <div key={key} className={`flex aspect-square min-h-14 items-center justify-center rounded-2xl border-2 text-3xl ${isBlocked ? 'border-blue-300 bg-blue-500' : 'border-amber-200 bg-amber-50'}`} aria-label={isBoat ? 'Boat position' : isTarget ? 'Treasure' : isBlocked ? 'Water' : 'Open route'}>{isBoat ? '⛵' : isTarget ? '🎁' : isBlocked ? '🌊' : '·'}</div>;
        })}
      </div>
      <div className="mx-auto mt-4 grid max-w-xs grid-cols-3 gap-2">
        <span />
        <button type="button" disabled={disabled} onClick={() => onMove('north')} className="min-h-12 rounded-2xl bg-white font-black text-sky-900 shadow">N ↑</button>
        <span />
        <button type="button" disabled={disabled} onClick={() => onMove('west')} className="min-h-12 rounded-2xl bg-white font-black text-sky-900 shadow">W ←</button>
        <button type="button" disabled={disabled} onClick={() => onMove('south')} className="min-h-12 rounded-2xl bg-white font-black text-sky-900 shadow">S ↓</button>
        <button type="button" disabled={disabled} onClick={() => onMove('east')} className="min-h-12 rounded-2xl bg-white font-black text-sky-900 shadow">E →</button>
      </div>
    </div>
  );
};

const InvestigationRound = ({ round, prediction, onPredict, onConclude, disabled, soundOn }) => (
  <div className="mx-auto w-full max-w-3xl">
    {!prediction ? (
      <div className="grid gap-3 sm:grid-cols-2">
        {round.predictions.map((option) => <div key={option.id} className="flex flex-col items-center gap-2 rounded-3xl border-4 border-emerald-200 bg-white p-2 shadow-lg"><button type="button" onClick={() => onPredict(option.id)} className="min-h-20 w-full rounded-2xl p-2 text-center"><span className="block text-4xl">{option.emoji}</span><strong className="mt-2 block text-sm font-black">{option.label}</strong></button><PackagedAudioButton text={option.label} label="Hear choice" soundOn={soundOn} /></div>)}
      </div>
    ) : (
      <>
        <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-4 text-center"><p className="text-xs font-black uppercase tracking-wider text-emerald-700">Observation</p><p className="mt-2 font-bold text-slate-700">{round.observation}</p><div className="mt-3"><PackagedAudioButton text={round.observation} label="Hear observation" soundOn={soundOn} /></div></div>
        <h3 className="my-4 text-center text-xl font-black text-slate-900">What does the observation tell us?</h3>
        <ChoiceRound round={round} onPick={onConclude} disabled={disabled} soundOn={soundOn} />
      </>
    )}
  </div>
);

const CurriculumQuest = ({ onBack, playSfx, soundOn, onToggleSound, onCelebrate, onGameEvent }) => {
  const [moduleId, setModuleId] = useState('continents');
  const difficultyGameId = `worldmap-${moduleId}`;
  const difficulty = useGameDifficulty(difficultyGameId);
  const [roundIndex, setRoundIndex] = useState(0);
  const [roundOrder, setRoundOrder] = useState([]);
  const [roundCursor, setRoundCursor] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [sequence, setSequence] = useState([]);
  const [selected, setSelected] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackVoice, setFeedbackVoice] = useState('');
  const [skillRun, setSkillRun] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lessonOpen, setLessonOpen] = useState(true);
  const [routeStep, setRouteStep] = useState(0);
  const [prediction, setPrediction] = useState('');
  const activeModule = getCurriculumModule(moduleId);
  const rounds = activeModule.rounds[difficulty] || activeModule.rounds.starter;
  const round = rounds[roundIndex % rounds.length];
  const moduleNumber = CURRICULUM_MODULES.findIndex((item) => item.id === activeModule.id) + 1;

  const resetRound = useCallback((nextIndex = 0, showLesson = false) => {
    setRoundIndex(nextIndex);
    setMistakes(0);
    setSequence([]);
    setSelected('');
    setFeedback('');
    setFeedbackVoice('');
    setLocked(false);
    setLessonOpen(showLesson);
    setRouteStep(0);
    setPrediction('');
  }, []);

  useEffect(() => {
    // Difficulty is derived from recent learning evidence, not play counters.
    const nextOrder = shuffledIndexes(rounds.length);
    setRoundOrder(nextOrder);
    setRoundCursor(0);
    setSkillRun(0);
    resetRound(nextOrder[0] ?? 0, true);
  }, [difficulty, moduleId, rounds.length, resetRound]);

  const advance = () => {
    let nextOrder = roundOrder;
    let nextCursor = roundCursor + 1;
    if (!nextOrder.length || nextCursor >= nextOrder.length) {
      nextOrder = shuffledIndexes(rounds.length, roundIndex);
      nextCursor = 0;
      setRoundOrder(nextOrder);
    }
    const nextIndex = nextOrder[nextCursor] ?? 0;
    setRoundCursor(nextCursor);
    setSkillRun((current) => current >= 5 ? 0 : Math.min(current + 1, 5));
    setTimeout(() => resetRound(nextIndex), 850);
  };

  const completeRound = (answerId, response) => {
    if (locked) return;
    setLocked(true);
    setSelected(answerId);
    const item = answerItemsForRound(round).find((candidate) => candidate.id === answerId);
    const praise = getPraise();
    setFeedback(`${praise} ${round.explanation}`);
    setFeedbackVoice(praise);
    playSfx('success');
    onCelebrate(praise, round.type === 'sequence' ? 6 : 4, 150);
    onGameEvent?.(difficultyGameId, 'answer_correct', {
      skill: skillForRound(activeModule, round),
      item: round.id,
      response: response || item?.name || answerId,
      expected: round.type === 'sequence' ? [...round.items].sort((a, b) => a.order - b.order).map((entry) => entry.id).join(' → ') : round.type === 'route' ? round.path.join(' → ') : round.answer,
      correct: true,
      firstAttempt: mistakes === 0,
      hints: 0,
      independent: mistakes === 0,
      difficulty,
      module: activeModule.id,
    });
    advance();
  };

  const recordIncorrect = (answerId, expected = round.answer) => {
    onGameEvent?.(difficultyGameId, 'answer_attempt', {
      skill: skillForRound(activeModule, round),
      item: round.id,
      response: answerId,
      expected,
      correct: false,
      firstAttempt: mistakes === 0,
      hints: 0,
      independent: false,
      difficulty,
      module: activeModule.id,
    });
  };

  const handlePick = (answerId) => {
    if (locked) return;
    if (round.type === 'sequence') {
      const expected = [...round.items].sort((a, b) => a.order - b.order)[sequence.length];
      if (answerId !== expected?.id) {
        recordIncorrect(answerId, expected?.id);
        setMistakes((current) => current + 1);
        setFeedback('Not quite. Which clue is older? Try again.');
        setFeedbackVoice('Not quite. Which clue is older? Try again.');
        playSfx('wrong');
        return;
      }
      const next = [...sequence, round.items.find((item) => item.id === answerId)];
      setSequence(next);
      playSfx('tap');
      if (next.length === round.items.length) completeRound(answerId, next.map((item) => item.id).join(' → '));
      return;
    }
    if (answerId !== round.answer) {
      recordIncorrect(answerId, round.answer);
      setMistakes((current) => current + 1);
      setSelected(answerId);
      setFeedback(wrongFeedbackFor(round));
      setFeedbackVoice(wrongFeedbackFor(round));
      playSfx('wrong');
      return;
    }
    completeRound(answerId);
  };

  const handleRouteMove = (direction) => {
    if (locked) return;
    const expected = round.path[routeStep];
    if (direction !== expected) {
      recordIncorrect(direction, expected);
      setMistakes((current) => current + 1);
      setFeedback(round.wrongFeedback);
      setFeedbackVoice(round.wrongFeedback);
      playSfx('wrong');
      return;
    }
    const nextStep = routeStep + 1;
    setRouteStep(nextStep);
    playSfx('tap');
    setFeedback(`Good move: ${direction}.`);
    setFeedbackVoice('Good move.');
    if (nextStep === round.path.length) completeRound(direction, round.path.join(' → '));
  };

  const handlePrediction = (answerId) => {
    setPrediction(answerId);
    setFeedback('Prediction saved. Now compare it with the observation. A prediction is an idea, not a wrong answer.');
    setFeedbackVoice('Prediction saved. Now compare it with the observation. A prediction is an idea, not a wrong answer.');
    playSfx('tap');
  };

  const handleInvestigationConclusion = (answerId) => {
    if (answerId !== round.answer) {
      recordIncorrect(answerId, round.answer);
      setMistakes((current) => current + 1);
      setFeedback(round.wrongFeedback);
      setFeedbackVoice(round.wrongFeedback);
      playSfx('wrong');
      return;
    }
    completeRound(answerId, `prediction:${prediction}; conclusion:${answerId}`);
  };

  const mapRound = activeModule.id === 'continents' && ['continent', 'country', 'ocean'].includes(round.type);
  const accent = activeModule.id === 'continents' ? 'sky' : activeModule.id === 'time-detectives' ? 'amber' : 'emerald';
  const choiceRound = ['evidence', 'classify', 'map-key', 'direction', 'feature', 'uk-place'].includes(round.type) ? round : null;

  return (
    <div className={`min-h-screen w-full bg-gradient-to-b ${activeModule.id === 'continents' ? 'from-sky-100 via-cyan-50 to-indigo-100' : activeModule.id === 'time-detectives' ? 'from-amber-100 via-orange-50 to-yellow-100' : 'from-emerald-100 via-lime-50 to-teal-100'} px-4 pb-8`}>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 py-4">
        <button type="button" onClick={onBack} className="rounded-full bg-white p-3 shadow-lg transition hover:scale-105" aria-label="Back to all games"><Home /></button>
        <div className="text-center"><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Curriculum Quest · Module {moduleNumber}</p><h1 className="text-2xl font-black text-slate-900 sm:text-4xl">{activeModule.icon} {activeModule.title}</h1><p className="text-sm font-bold text-slate-600">{DIFFICULTY_LABELS[difficulty]} · {activeModule.subtitle}</p></div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </header>

      <main className="mx-auto w-full max-w-6xl">
        <nav className="mb-5 grid gap-2 rounded-3xl border border-white/80 bg-white/75 p-2 shadow-lg sm:grid-cols-3" aria-label="Curriculum modules">
          {CURRICULUM_MODULES.map((module) => (
            <button key={module.id} type="button" onClick={() => { playSfx('click'); setModuleId(module.id); }} aria-pressed={module.id === activeModule.id} className={`flex min-h-14 items-center gap-3 rounded-2xl px-4 py-2 text-left transition ${module.id === activeModule.id ? `bg-gradient-to-r ${module.colour} text-white shadow-md` : 'bg-white/80 text-slate-700 hover:bg-white'}`}>
              <span className="text-2xl">{module.icon}</span><span><strong className="block text-sm font-black">{module.title}</strong><span className={`text-xs font-bold ${module.id === activeModule.id ? 'text-white/85' : 'text-slate-500'}`}>{module.subtitle}</span></span>
            </button>
          ))}
        </nav>

        <section className="rounded-[2.2rem] border-2 border-white/90 bg-white/70 p-4 shadow-[0_18px_45px_rgba(15,23,42,.12)] backdrop-blur sm:p-7" aria-labelledby="quest-prompt">
          <div className="flex flex-wrap items-center justify-between gap-3"><span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${ACCENT_BADGE_CLASSES[accent]}`}>Year 1 discovery</span><button type="button" onClick={() => resetRound(roundIndex)} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-slate-600 shadow-sm"><RotateCcw size={15} /> Try this round again</button></div>
          <PracticeProgress skill={skillForRound(activeModule, round)} completed={skillRun} accent={accent} />
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2"><h2 id="quest-prompt" className="text-center text-2xl font-black text-slate-900 sm:text-3xl">{round.prompt}</h2><PackagedAudioButton text={round.prompt} label="Hear prompt" soundOn={soundOn} /></div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-center text-sm font-bold text-slate-600"><span>Round {roundCursor + 1} of {rounds.length} · Learn first, then try it independently.</span><PackagedAudioButton text="Learn first, then try it independently." label="Hear instructions" soundOn={soundOn} /></div>

          {lessonOpen ? (
            <div className="mx-auto mt-5 max-w-2xl rounded-3xl border-2 border-indigo-100 bg-indigo-50/80 p-5 text-center">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Learn &amp; explore</p>
              <h3 className="mt-1 text-2xl font-black text-slate-900">Your explorer words</h3>
              <div className="mt-4 flex flex-wrap justify-center gap-2">{activeModule.vocabulary.slice(0, 4).map((word) => <div key={word} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-black text-indigo-800 shadow-sm"><span>{word}</span><PackagedAudioButton text={word} label="Hear word" soundOn={soundOn} /></div>)}</div>
              <p className="mt-4 text-sm font-bold leading-relaxed text-slate-600">{CURRICULUM_LESSON_COPY[activeModule.id]}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2" aria-label="Related Year 1 school topics">{YEAR_ONE_JOURNEY.filter((entry) => activeModule.schoolTopics.includes(entry.unit)).map((entry) => <span key={entry.term} className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-800">{entry.term} · {entry.unit}</span>)}</div>
              {activeModule.id === 'continents' && <div className="mt-5"><CurriculumMap round={{ type: 'continent', answer: '' }} selected="" disabled showLabels /><div className="mt-3 flex flex-wrap justify-center gap-2">{OCEANS.map((ocean) => <span key={ocean.id} className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-900">{ocean.name}</span>)}</div></div>}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2"><PackagedAudioButton text={CURRICULUM_LESSON_COPY[activeModule.id]} label="Hear lesson" soundOn={soundOn} /><button type="button" onClick={() => setLessonOpen(false)} className="mt-1 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-black text-white shadow-lg transition hover:-translate-y-0.5"><Sparkles size={18} /> Start this round</button></div>
            </div>
          ) : (
            <div className="mt-5">
              <p className="mx-auto mb-4 max-w-2xl rounded-2xl bg-white/80 px-4 py-3 text-center text-sm font-black text-slate-700">{roundHelpFor(round)}</p>
              {mapRound && <CurriculumMap round={round} selected={selected} onPick={handlePick} disabled={locked} soundOn={soundOn} />}
              {choiceRound && <ChoiceRound round={choiceRound} onPick={handlePick} disabled={locked} soundOn={soundOn} />}
              {round.type === 'sequence' && <SequenceRound round={round} sequence={sequence} onPick={handlePick} disabled={locked} soundOn={soundOn} />}
              {round.type === 'route' && <RouteRound round={round} step={routeStep} onMove={handleRouteMove} disabled={locked} />}
              {round.type === 'investigation' && <InvestigationRound round={round} prediction={prediction} onPredict={handlePrediction} onConclude={handleInvestigationConclusion} disabled={locked} soundOn={soundOn} />}
            </div>
          )}
          <div className="mt-5 min-h-14 text-center" aria-live="polite">{feedback && <div className={`mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black ${locked ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}><p><Sparkles className="mr-1 inline" size={17} />{feedback}</p><PackagedAudioButton text={feedbackVoice} label={locked ? 'Hear praise' : 'Hear feedback'} soundOn={soundOn} />{locked && <PackagedAudioButton text={round.explanation} label="Hear why" soundOn={soundOn} />}</div>}</div>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs font-black text-slate-500"><Map size={15} /> Learn by exploring, sorting and spotting useful clues.</div>
        </section>
      </main>
    </div>
  );
};

export default CurriculumQuest;
