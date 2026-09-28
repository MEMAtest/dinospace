import { useCallback, useEffect, useRef, useState } from 'react';
import { Headphones, Home, Map, RotateCcw, Sparkles, Compass, ArrowRight } from 'lucide-react';
import { CONTINENTS, CURRICULUM_MODULES, getCurriculumModule, OCEANS, YEAR_ONE_JOURNEY } from '../../data/curriculumModules.js';
import { CURRICULUM_LESSON_COPY, getCurriculumVoiceClip } from '../../data/curriculumVoice.js';
import { getPraise } from '../../utils.js';
import { PracticeProgress, SoundToggle } from '../shared/index.jsx';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';
import geographyWorld from '../../assets/curriculum/geography-world.webp';
import historyWorld from '../../assets/curriculum/history-world.webp';
import natureWorld from '../../assets/curriculum/nature-world.webp';
import continentMap from '../../assets/curriculum/continent-map.svg';
import natureSpecimens from '../../assets/curriculum/nature-specimens.webp';
import historyClues from '../../assets/curriculum/history-clues.webp';
import robinArt from '../../assets/curriculum/robin.webp';
import guideCharacters from '../../assets/curriculum/guides.webp';
import './CurriculumQuest.css';

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

const ChoiceArt = ({ item }) => {
  if (item.id === 'robin') return <img className="quest-choice-art" src={robinArt} alt="" aria-hidden="true" />;
  const sprite = ['lizard', 'cat'].includes(item.id) ? natureSpecimens : ['letter', 'telephone', 'smartphone'].includes(item.id) ? historyClues : null;
  if (sprite) return <span className={`quest-choice-art quest-sprite quest-sprite-${item.id}`} style={{ backgroundImage: `url(${sprite})` }} aria-hidden="true" />;
  return <span className="quest-choice-emoji" aria-hidden="true">{item.emoji}</span>;
};

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
        <img src={continentMap} alt="" className="absolute inset-0 h-full w-full object-fill" aria-hidden="true" />
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

const ChoiceRound = ({ round, onPick, disabled, selected, soundOn }) => (
  <div className="quest-answer-grid mx-auto grid w-full max-w-3xl gap-3 sm:grid-cols-3" aria-label="Answer choices">
    {(round.options || []).map((option) => (
      <div key={option.id} className={`quest-answer-card flex flex-col items-center gap-2 rounded-3xl border-4 p-2 shadow-lg ${disabled && selected === option.id ? 'border-emerald-400 bg-emerald-50' : selected === option.id ? 'border-rose-300 bg-rose-50' : 'border-amber-200 bg-white'}`}>
        <button type="button" onClick={() => onPick(option.id)} disabled={disabled} aria-label={`Choose ${option.label}`} aria-pressed={selected === option.id} className="min-h-20 w-full rounded-2xl px-2 py-2 text-center transition hover:-translate-y-1 active:translate-y-0 disabled:opacity-70">
          <ChoiceArt item={option} />
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
            <button type="button" onClick={() => onPick(item.id)} disabled={disabled || sequence.some((chosen) => chosen.id === item.id)} aria-label={`Choose ${item.label}`} className="min-h-24 w-full rounded-2xl px-2 py-2 text-center transition hover:-translate-y-1 active:translate-y-0 disabled:opacity-45">
              <ChoiceArt item={item} />
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

const InvestigationRound = ({ round, prediction, onPredict, onConclude, disabled, selected, soundOn }) => (
  <div className="mx-auto w-full max-w-3xl">
    {!prediction ? (
      <div className="grid gap-3 sm:grid-cols-2">
        {round.predictions.map((option) => <div key={option.id} className="flex flex-col items-center gap-2 rounded-3xl border-4 border-emerald-200 bg-white p-2 shadow-lg"><button type="button" onClick={() => onPredict(option.id)} className="min-h-20 w-full rounded-2xl p-2 text-center"><span className="block text-4xl">{option.emoji}</span><strong className="mt-2 block text-sm font-black">{option.label}</strong></button><PackagedAudioButton text={option.label} label="Hear choice" soundOn={soundOn} /></div>)}
      </div>
    ) : (
      <>
        <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-4 text-center"><p className="text-xs font-black uppercase tracking-wider text-emerald-700">Observation</p><p className="mt-2 font-bold text-slate-700">{round.observation}</p><div className="mt-3"><PackagedAudioButton text={round.observation} label="Hear observation" soundOn={soundOn} /></div></div>
        <h3 className="my-4 text-center text-xl font-black text-slate-900">What does the observation tell us?</h3>
        <ChoiceRound round={round} onPick={onConclude} disabled={disabled} selected={selected} soundOn={soundOn} />
      </>
    )}
  </div>
);

const LessonVisual = ({ module, round, soundOn }) => {
  if (module.id === 'continents') {
    return <div className="quest-lesson-visual quest-map-lesson"><CurriculumMap round={{ type: 'continent', answer: '' }} selected="" disabled showLabels /><div className="quest-ocean-guide"><span className="quest-guide-heading">🌊 Explore the oceans</span><div>{OCEANS.map((ocean) => <span key={ocean.id}>{ocean.name}</span>)}</div></div></div>;
  }
  if (module.id === 'time-detectives') {
    const clues = round.type === 'sequence' ? [...round.items].sort((a, b) => a.order - b.order) : [{ id: 'old-photo', emoji: '📷', label: 'Photograph' }, { id: 'letter', emoji: '✉️', label: 'Letter' }, { id: 'telephone', emoji: '☎️', label: 'Telephone' }, { id: 'smartphone', emoji: '📱', label: 'Today' }];
    return <div className="quest-lesson-visual quest-timeline-lesson"><span className="quest-guide-character quest-detective-guide" style={{ backgroundImage: `url(${guideCharacters})` }} aria-hidden="true" /><div className="quest-scene-kicker">🔎 Clues from the past</div><div className="quest-timeline" aria-label="Historical clues in time order">{clues.map((clue, index) => <div key={clue.id} className="quest-timeline-item"><span className="quest-timeline-art"><ChoiceArt item={clue} /></span><strong>{clue.label}</strong><small>{index + 1}</small></div>)}</div><p>Look at each clue. What came first?</p></div>;
  }
  const choices = round.options || [{ id: 'oak', emoji: '🌳', label: 'Oak tree' }, { id: 'robin', emoji: '🐦', label: 'Robin' }, { id: 'frog', emoji: '🐸', label: 'Frog' }, { id: 'cat', emoji: '🐈', label: 'Cat' }];
  return <div className="quest-lesson-visual quest-nature-lesson"><span className="quest-guide-character quest-owl-guide" style={{ backgroundImage: `url(${guideCharacters})` }} aria-hidden="true" /><div className="quest-scene-kicker">🔬 Look closely</div><div className="quest-specimens">{choices.slice(0, 4).map((choice) => <div className="quest-specimen" key={choice.id}><ChoiceArt item={choice} /><strong>{choice.label}</strong><PackagedAudioButton text={choice.label} label="Hear choice" soundOn={soundOn} /></div>)}</div><p>Observe each one before you choose.</p></div>;
};

const ExplorerWords = ({ module, soundOn }) => <aside className="quest-words"><p className="quest-small-label">Learn &amp; explore</p><h3>Your explorer words</h3><div className="quest-word-list">{module.vocabulary.slice(0, 4).map((word) => <div key={word} className="quest-word"><strong>{word}</strong><PackagedAudioButton text={word} label="Hear word" soundOn={soundOn} /></div>)}</div><p className="quest-lesson-copy">{CURRICULUM_LESSON_COPY[module.id]}</p><div className="quest-topic-list" aria-label="Related Year 1 school topics">{YEAR_ONE_JOURNEY.filter((entry) => module.schoolTopics.includes(entry.unit)).map((entry) => <span key={entry.term}>{entry.term} · {entry.unit}</span>)}</div></aside>;

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
  const advanceTimerRef = useRef(null);
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
    const firstRound = moduleId === 'time-detectives' ? rounds.findIndex((item) => item.id === 'history-communication') : moduleId === 'nature-lab' ? rounds.findIndex((item) => item.id === 'science-animal-bird') : rounds.findIndex((item) => item.id === 'continent-africa');
    if (firstRound >= 0) { const position = nextOrder.indexOf(firstRound); [nextOrder[0], nextOrder[position]] = [nextOrder[position], nextOrder[0]]; }
    setRoundOrder(nextOrder);
    setRoundCursor(0);
    setSkillRun(0);
    resetRound(nextOrder[0] ?? 0, true);
    return () => clearTimeout(advanceTimerRef.current);
  }, [difficulty, moduleId, rounds, resetRound]);

  const advance = () => {
    let nextOrder = roundOrder;
    let nextCursor = roundCursor + 1;
    if (!nextOrder.length || nextCursor >= nextOrder.length) {
      nextOrder = shuffledIndexes(rounds.length, roundIndex);
      nextCursor = 0;
      setRoundOrder(nextOrder);
    }
    const nextIndex = nextOrder[nextCursor] ?? 0;
    setSkillRun((current) => current >= 5 ? 0 : Math.min(current + 1, 5));
    advanceTimerRef.current = setTimeout(() => { setRoundCursor(nextCursor); resetRound(nextIndex); }, 1250);
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
      setSelected(answerId);
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

  const worldArt = activeModule.id === 'continents' ? geographyWorld : activeModule.id === 'time-detectives' ? historyWorld : natureWorld;

  return (
    <div className={`curriculum-quest quest-${activeModule.id}`} style={{ '--quest-world': `url(${worldArt})` }}>
      <header className="quest-header">
        <button type="button" onClick={onBack} className="quest-round-button" aria-label="Back to home"><Home size={23} /></button>
        <div className="quest-heading"><p>Curriculum Quest · Module {moduleNumber}</p><h1><span aria-hidden="true">{activeModule.icon}</span> {activeModule.title}</h1><span>{activeModule.subtitle}</span></div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} className="quest-round-button" />
      </header>

      <main className="quest-main">
        <nav className="quest-modules" aria-label="Curriculum modules">
          {CURRICULUM_MODULES.map((module) => (
            <button key={module.id} type="button" onClick={(event) => { playSfx('click'); setModuleId(module.id); event.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); }} aria-pressed={module.id === activeModule.id} className="quest-module-tab">
              <span className="quest-module-icon" aria-hidden="true">{module.icon}</span><span><strong>{module.title}</strong><small>{module.subtitle}</small></span><ArrowRight className="quest-tab-arrow" size={18} />
            </button>
          ))}
        </nav>

        <section className="quest-paper" aria-labelledby="quest-prompt">
          <div className="quest-status-row"><span className={`quest-year-badge ${ACCENT_BADGE_CLASSES[accent]}`}>Year 1 discovery</span><PracticeProgress skill={skillForRound(activeModule, round)} completed={skillRun} accent={accent} className="quest-progress" /><button type="button" onClick={() => { clearTimeout(advanceTimerRef.current); resetRound(roundIndex); }} className="quest-retry"><RotateCcw size={16} /> Try this round again</button></div>
          <div className="quest-prompt-row"><h2 id="quest-prompt">{round.prompt}</h2><PackagedAudioButton text={round.prompt} label="Hear prompt" soundOn={soundOn} /></div>
          <div className="quest-round-note"><span>Round {roundCursor + 1} of {rounds.length} · Learn first, then try it independently.</span><PackagedAudioButton text="Learn first, then try it independently." label="Hear instructions" soundOn={soundOn} /></div>

          {lessonOpen ? (
            <div className="quest-lesson">
              <div className="quest-lesson-grid"><LessonVisual module={activeModule} round={round} soundOn={soundOn} /><ExplorerWords module={activeModule} soundOn={soundOn} /></div>
              <div className="quest-actions"><PackagedAudioButton text={CURRICULUM_LESSON_COPY[activeModule.id]} label="Hear lesson" soundOn={soundOn} /><button type="button" onClick={() => setLessonOpen(false)} className="quest-start"><Sparkles size={19} /> Start this round <ArrowRight size={18} /></button></div>
            </div>
          ) : (
            <div className="quest-play-area">
              <p className="quest-help"><Compass size={18} />{roundHelpFor(round)}</p>
              {mapRound && <CurriculumMap round={round} selected={selected} onPick={handlePick} disabled={locked} soundOn={soundOn} />}
              {choiceRound && <ChoiceRound round={choiceRound} onPick={handlePick} disabled={locked} selected={selected} soundOn={soundOn} />}
              {round.type === 'sequence' && <SequenceRound round={round} sequence={sequence} onPick={handlePick} disabled={locked} soundOn={soundOn} />}
              {round.type === 'route' && <RouteRound round={round} step={routeStep} onMove={handleRouteMove} disabled={locked} />}
              {round.type === 'investigation' && <InvestigationRound round={round} prediction={prediction} onPredict={handlePrediction} onConclude={handleInvestigationConclusion} disabled={locked} selected={selected} soundOn={soundOn} />}
              <ExplorerWords module={activeModule} soundOn={soundOn} />
            </div>
          )}
          <div className="quest-feedback" aria-live="polite">{feedback && <div className={`quest-feedback-card ${locked ? 'is-correct' : 'is-retry'}`}><p><Sparkles className="mr-1 inline" size={17} /><span className="mr-2 rounded-full bg-white/75 px-2 py-1 text-xs uppercase tracking-wide">{locked ? 'Correct' : 'Try again'}</span>{feedback}</p><PackagedAudioButton text={feedbackVoice} label={locked ? 'Hear praise' : 'Hear feedback'} soundOn={soundOn} />{locked && <PackagedAudioButton text={round.explanation} label="Hear why" soundOn={soundOn} />}</div>}</div>
        </section>
      </main>
    </div>
  );
};

export default CurriculumQuest;
