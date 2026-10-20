import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Headphones, ArrowLeft, RotateCcw, Sparkles, Compass, ArrowRight, Clock3 } from 'lucide-react';
import { CONTINENTS, CURRICULUM_MODULES, getCurriculumModule, OCEANS } from '../../data/curriculumModules.js';
import { CURRICULUM_LESSON_COPY, getCurriculumVoiceClip } from '../../data/curriculumVoice.js';
import { getPraise } from '../../utils.js';
import { getRecommendedDifficulty } from '../../data/learningProgress.js';
import { createCurriculumQueue, createCurriculumReplayQueue, makeCurriculumSeed, shuffleCurriculumAnswers } from '../../data/curriculumQueue.js';
import { loadCurriculumPreferences, loadCurriculumSession, saveCurriculumPreferences, saveCurriculumSession } from '../../data/curriculumSession.js';
import { SoundToggle } from '../shared/index.jsx';
import geographyWorld from '../../assets/curriculum/geography-world.webp';
import historyWorld from '../../assets/curriculum/history-world.webp';
import natureWorld from '../../assets/curriculum/nature-world.webp';
import continentMap from '../../assets/curriculum/continent-map.svg';
import natureSpecimens from '../../assets/curriculum/nature-specimens.webp';
import historyClues from '../../assets/curriculum/history-clues.webp';
import robinArt from '../../assets/curriculum/robin.webp';
import guideCharacters from '../../assets/curriculum/guides.webp';
import { CURRICULUM_BADGES, loadCurriculumBadges, awardCurriculumBadge } from '../../data/curriculumBadges.js';
import { CurriculumBadge, CurriculumBadgeCollection } from '../shared/CurriculumBadges.jsx';
import './CurriculumQuest.css';

const DIFFICULTY_LABELS = { starter: 'Starter', growing: 'Growing', challenge: 'Challenge' };
const ACCENT_BADGE_CLASSES = {
  sky: 'bg-sky-100 text-sky-800',
  amber: 'bg-amber-100 text-amber-800',
  emerald: 'bg-emerald-100 text-emerald-800',
};

const ROUND_HELP = Object.freeze({
  continent: 'Tap the map pin where this continent is.',
  country: 'Tap the map pin for the continent where this country belongs.',
  ocean: 'Tap the labelled ocean that matches the clue.',
  sequence: 'Tap the clues in order, starting with the oldest.',
  route: 'Use the N, E, S and W buttons to move the boat one square at a time.',
  investigation: 'Make a prediction, then compare it with the observation.',
  default: 'Look at each choice, then tap the answer that best fits the clue.',
});

const roundHelpFor = (round) => ROUND_HELP[round.type] || ROUND_HELP.default;

const CurriculumHintContext = createContext(() => {});

const queueHistoryKey = (playerId, moduleId, difficulty) => `${playerId || 'amari'}_curriculum_recent_v1_${moduleId}_${difficulty}`;
const loadQueueHistory = (playerId, moduleId, difficulty) => {
  try {
    const history = JSON.parse(window.localStorage.getItem(queueHistoryKey(playerId, moduleId, difficulty)) || '[]');
    return Array.isArray(history) ? history.filter((id) => typeof id === 'string').slice(-8) : [];
  } catch { return []; }
};
const saveQueueHistory = (playerId, moduleId, difficulty, history) => {
  try { window.localStorage.setItem(queueHistoryKey(playerId, moduleId, difficulty), JSON.stringify(history.slice(-8))); } catch { /* progress storage is optional */ }
};

const curriculumStorage = () => {
  try { return window.localStorage; } catch { return null; }
};
const initialCurriculumModule = (initialModule, playerId) => {
  if (CURRICULUM_MODULES.some((module) => module.id === initialModule)) return initialModule;
  const savedModule = loadCurriculumPreferences(curriculumStorage(), playerId).moduleId;
  return CURRICULUM_MODULES.some((module) => module.id === savedModule) ? savedModule : 'continents';
};
const initialCurriculumDifficulty = (moduleId, playerId) => {
  const savedDifficulty = loadCurriculumPreferences(curriculumStorage(), playerId).difficulties[moduleId];
  return savedDifficulty || getRecommendedDifficulty(`worldmap-${moduleId}`);
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
  || (round.type === 'country' ? 'A country is a place inside a continent. Look at where it sits on the world map, then try again.'
    : round.type === 'continent' ? 'Use the outlines and position of each land shape on the world map. Which one is the clue asking for?'
      : round.type === 'ocean' ? 'Look at where the ocean sits around the continents, then try again.'
        : 'Good detective work. Look closely and try another answer.');

const ChoiceArt = ({ item }) => {
  if (item.id === 'robin') return <img className="quest-choice-art" src={robinArt} alt="" aria-hidden="true" />;
  const sprite = ['lizard', 'cat'].includes(item.id) ? natureSpecimens : ['letter', 'telephone', 'smartphone'].includes(item.id) ? historyClues : null;
  if (sprite) return <span className={`quest-choice-art quest-sprite quest-sprite-${item.id}`} style={{ backgroundImage: `url(${sprite})` }} aria-hidden="true" />;
  return <span className="quest-choice-emoji" aria-hidden="true">{item.emoji}</span>;
};

// Deliberately resolves only reviewed, packaged ElevenLabs clips. Missing
// entries render no control; there is no browser/device speech fallback.
const PackagedAudioButton = ({ text, label = 'Hear', soundOn }) => {
  const logHint = useContext(CurriculumHintContext);
  const clip = getCurriculumVoiceClip(text);
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => () => { audioRef.current?.pause(); audioRef.current = null; }, []);
  if (!clip) return null;
  const play = () => {
    if (!soundOn) return;
    const hintType = label === 'Hear why' ? 'explanation'
      : label === 'Hear prompt' ? 'prompt'
        : label === 'Hear lesson' ? 'lesson'
          : label === 'Hear instructions' ? 'instructions'
            : label === 'Hear feedback' || label === 'Hear praise' ? 'feedback'
              : label === 'Hear observation' ? 'observation'
                : label === 'Hear word' ? 'vocabulary'
                  : 'audio_help';
    logHint(hintType);
    audioRef.current?.pause();
    const audio = new Audio(clip);
    audio.preload = 'auto';
    audioRef.current = audio;
    audio.onended = () => setPlaying(false);
    audio.onerror = () => setPlaying(false);
    setPlaying(true);
    audio.play().catch(() => setPlaying(false));
  };
  return <button type="button" onClick={play} disabled={!soundOn} className="inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-indigo-200 bg-white px-3 py-2 text-xs font-black text-indigo-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-50" aria-label={`${label}: ${text}`}><Headphones size={16} className={playing ? 'animate-pulse' : ''} />{playing ? 'Playing' : label}</button>;
};

const CurriculumMap = ({ round, selected, onPick = () => {}, disabled, showLabels = false }) => {
  const answerItems = answerItemsForRound(round);
  const isOceanRound = round.type === 'ocean';
  return (
    <>
      <div className="relative mx-auto h-[22rem] w-full max-w-3xl overflow-hidden rounded-[2rem] border-4 border-sky-200 bg-[#38bde4] shadow-inner" aria-label="A simplified labelled world map, not to scale">
        <img src={continentMap} alt="" className="absolute inset-0 h-full w-full object-fill" aria-hidden="true" />
        <div className="absolute inset-0">
          {!isOceanRound && CONTINENTS.map((continent) => (
            <button
              key={continent.id}
              type="button"
              disabled={disabled || isOceanRound}
              onClick={() => onPick(continent.id)}
              aria-label={`Choose ${continent.name}`}
              className={`absolute flex min-h-12 min-w-[4.8rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-xl border-2 px-1 py-1 text-center text-[10px] font-black shadow-md transition hover:scale-105 active:scale-95 disabled:cursor-default disabled:opacity-100 disabled:hover:scale-100 ${selected === continent.id ? 'border-white bg-slate-950 text-white ring-4 ring-white/70' : 'border-slate-700/30 bg-white/95 text-slate-800'}`}
              style={{ left: continent.position.left, top: continent.position.top }}
            >
              {showLabels ? <><span className="text-base leading-none" aria-hidden="true">{continent.emoji}</span><span className="max-w-[5.4rem] leading-tight">{continent.name}</span></> : <span className="text-lg leading-none" aria-hidden="true">📍</span>}
            </button>
          ))}
          {isOceanRound && OCEANS.map((ocean) => (
            <button
              key={ocean.id}
              type="button"
              onClick={() => onPick(ocean.id)}
              disabled={disabled}
              aria-label={`Choose ${ocean.name}`}
              className={`quest-ocean-marker absolute flex min-h-12 min-w-[5.8rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-xl border-2 px-1 py-1 text-center text-[9px] font-black shadow-md transition hover:scale-105 active:scale-95 disabled:cursor-default disabled:opacity-100 ${selected === ocean.id ? 'border-white bg-slate-950 text-white ring-4 ring-white/70' : 'border-white/70 bg-sky-950/80 text-white'}`}
              style={{ left: ocean.position.left, top: ocean.position.top }}
            >
              {showLabels ? <><span className="text-base leading-none" aria-hidden="true">{ocean.emoji}</span><span className="max-w-[6.2rem] leading-tight">{ocean.name}</span></> : <span className="text-lg leading-none" aria-hidden="true">🌊</span>}
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
      {!showLabels && round.type === 'continent' && <p className="mx-auto mt-3 max-w-2xl rounded-2xl bg-sky-50 px-4 py-3 text-center text-sm font-bold text-sky-900">Use the labelled learning map you explored, then choose the matching place.</p>}
      {disabled && selected === round.answer && <div className="mx-auto mt-3 flex max-w-3xl flex-wrap justify-center gap-2" aria-label="Country examples">
        {answerItems.filter((item) => item.id === round.answer && item.examples).flatMap((item) => item.examples.slice(0, 2).map((example) => <span key={`${item.id}-${example}`} className="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-slate-600">{example} · {item.name}</span>))}
      </div>}
    </>
  );
};

const ChoiceRound = ({ round, onPick, disabled, selected }) => (
  <div className="quest-answer-grid mx-auto grid w-full max-w-3xl gap-3 sm:grid-cols-3" aria-label="Answer choices">
    {(round.options || []).map((option) => (
      <div key={option.id} className={`quest-answer-card flex flex-col items-center gap-2 rounded-3xl border-4 p-2 shadow-lg ${disabled && selected === option.id ? 'border-emerald-400 bg-emerald-50' : selected === option.id ? 'border-rose-300 bg-rose-50' : 'border-amber-200 bg-white'}`}>
        <button type="button" onClick={() => onPick(option.id)} disabled={disabled} aria-label={`Choose ${option.label}`} aria-pressed={selected === option.id} className="min-h-20 w-full rounded-2xl px-2 py-2 text-center transition hover:-translate-y-1 active:translate-y-0 disabled:opacity-70">
          <ChoiceArt item={option} />
          <strong className="mt-1 block text-sm font-black text-slate-800">{option.label}</strong>
        </button>
      </div>
    ))}
  </div>
);

const SequenceRound = ({ round, sequence, onPick, disabled }) => {
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
        {round.predictions.map((option) => <div key={option.id} className="flex flex-col items-center gap-2 rounded-3xl border-4 border-emerald-200 bg-white p-2 shadow-lg"><button type="button" onClick={() => onPredict(option.id)} className="min-h-20 w-full rounded-2xl p-2 text-center"><span className="block text-4xl">{option.emoji}</span><strong className="mt-2 block text-sm font-black">{option.label}</strong></button></div>)}
      </div>
    ) : (
      <>
        <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-4 text-center"><p className="text-xs font-black uppercase tracking-wider text-emerald-700">Observation</p><p className="mt-2 font-bold text-slate-700">{round.observation}</p><div className="mt-3"><PackagedAudioButton text={round.observation} label="Hear observation" soundOn={soundOn} /></div></div>
        <h3 className="my-4 text-center text-xl font-black text-slate-900">What does the observation tell us?</h3>
        <ChoiceRound round={round} onPick={onConclude} disabled={disabled} selected={selected} />
      </>
    )}
  </div>
);

const LessonVisual = ({ module, round }) => {
  if (module.id === 'continents') {
    return <div className="quest-lesson-visual quest-map-lesson"><CurriculumMap round={{ type: 'continent', answer: '' }} selected="" disabled showLabels /><div className="quest-ocean-guide"><span className="quest-guide-heading">🌊 Explore the oceans</span><div>{OCEANS.map((ocean) => <span key={ocean.id}>{ocean.name}</span>)}</div></div></div>;
  }
  if (module.id === 'time-detectives') {
    const clues = [{ id: 'letter', emoji: '✉️', label: 'Letter' }, { id: 'old-photo', emoji: '📷', label: 'Photograph' }, { id: 'telephone', emoji: '☎️', label: 'Telephone' }, { id: 'smartphone', emoji: '📱', label: 'Smartphone' }];
    return <div className="quest-lesson-visual quest-timeline-lesson"><span className="quest-guide-character quest-detective-guide" style={{ backgroundImage: `url(${guideCharacters})` }} aria-hidden="true" /><div className="quest-scene-kicker">🔎 Clues from the past</div><div className="quest-timeline" aria-label="Historical clues in time order">{clues.map((clue, index) => <div key={clue.id} className="quest-timeline-item"><span className="quest-timeline-art"><ChoiceArt item={clue} /></span><strong>{clue.label}</strong><small>{index + 1}</small></div>)}</div><p>Explore how clues and objects change over time.</p></div>;
  }
  const choices = round.options || [{ id: 'oak', emoji: '🌳', label: 'Oak tree' }, { id: 'robin', emoji: '🐦', label: 'Robin' }, { id: 'frog', emoji: '🐸', label: 'Frog' }, { id: 'cat', emoji: '🐈', label: 'Cat' }];
  return <div className="quest-lesson-visual quest-nature-lesson"><span className="quest-guide-character quest-owl-guide" style={{ backgroundImage: `url(${guideCharacters})` }} aria-hidden="true" /><div className="quest-scene-kicker">🔬 Look closely</div><div className="quest-specimens">{choices.slice(0, 4).map((choice) => <div className="quest-specimen" key={choice.id}><ChoiceArt item={choice} /><strong>{choice.label}</strong></div>)}</div><p>Look for ways living things are alike or different.</p></div>;
};

const ExplorerWords = ({ module, soundOn, onLaunchGame }) => <details className="quest-extra-learning">
  <summary>Explore words and lesson notes</summary>
  <div className="quest-extra-learning-content">
    <div className="quest-extra-audio"><PackagedAudioButton text={CURRICULUM_LESSON_COPY[module.id]} label="Hear lesson" soundOn={soundOn} />{module.id === 'time-detectives' && onLaunchGame && <button type="button" onClick={() => onLaunchGame('timeteller')} className="quest-related-game"><Clock3 size={17} /> Practise telling the time</button>}</div>
    <div className="quest-word-list">{module.vocabulary.slice(0, 4).map((word) => <div key={word} className="quest-word"><strong>{word}</strong><PackagedAudioButton text={word} label="Hear word" soundOn={soundOn} /></div>)}</div>
    <p className="quest-lesson-copy">{CURRICULUM_LESSON_COPY[module.id]}</p>
  </div>
</details>;

const CurriculumQuest = ({ onBack, onLaunchGame, playSfx, soundOn, onToggleSound, onCelebrate, onGameEvent, playerId, initialModule }) => {
  const [moduleId, setModuleId] = useState(() => initialCurriculumModule(initialModule, playerId));
  const [earnedBadges, setEarnedBadges] = useState(() => loadCurriculumBadges(playerId));
  const difficultyGameId = `worldmap-${moduleId}`;
  // Keep one difficulty band for the whole module run. Learning evidence may
  // recommend a harder band after a few answers, but switching bands mid-run
  // must not send the learner back to the first question.
  const [difficulty, setDifficulty] = useState(() => initialCurriculumDifficulty(initialCurriculumModule(initialModule, playerId), playerId));
  const [roundIndex, setRoundIndex] = useState(0);
  const [roundOrder, setRoundOrder] = useState([]);
  const [roundCursor, setRoundCursor] = useState(0);
  const [queueSeed, setQueueSeed] = useState(0);
  const [queueComplete, setQueueComplete] = useState(false);
  const recentRoundIds = useRef([]);
  const [mistakes, setMistakes] = useState(0);
  const [sequence, setSequence] = useState([]);
  const [selected, setSelected] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackVoice, setFeedbackVoice] = useState('');
  const [locked, setLocked] = useState(false);
  const [lessonOpen, setLessonOpen] = useState(true);
  const [routeStep, setRouteStep] = useState(0);
  const [prediction, setPrediction] = useState('');
  const [sessionResumed, setSessionResumed] = useState(false);
  const sessionOwner = useRef('');
  const skipFirstSessionWrite = useRef('');
  const activeModule = getCurriculumModule(moduleId);
  const rounds = activeModule.rounds[difficulty] || activeModule.rounds.starter;
  const round = rounds[roundIndex % rounds.length];
  // Keep answer positions stable on a retry, but shuffle them for each new question.
  const shuffledOptions = useMemo(() => round.options ? shuffleCurriculumAnswers(round.options, queueSeed, roundCursor) : [], [round, roundCursor, queueSeed]);
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
    const sessionKey = `${playerId || 'amari'}:${moduleId}:${difficulty}`;
    sessionOwner.current = sessionKey;
    skipFirstSessionWrite.current = sessionKey;
    const seed = makeCurriculumSeed();
    recentRoundIds.current = loadQueueHistory(playerId, moduleId, difficulty);
    const savedSession = loadCurriculumSession(curriculumStorage(), playerId, moduleId, rounds, difficulty);
    if (savedSession) {
      setSessionResumed(!savedSession.complete);
      const nextRoundIndex = savedSession.order[savedSession.cursor] ?? 0;
      const currentRound = rounds[nextRoundIndex];
      setQueueSeed(savedSession.seed);
      setRoundOrder(savedSession.order);
      setRoundCursor(savedSession.cursor);
      setQueueComplete(savedSession.complete);
      setRoundIndex(nextRoundIndex);
      setMistakes(savedSession.mistakes);
      setSequence(savedSession.sequence.map((id) => currentRound.items?.find((item) => item.id === id)).filter(Boolean));
      setSelected(savedSession.selected);
      setFeedback(savedSession.feedback);
      setFeedbackVoice(savedSession.feedbackVoice);
      setLocked(savedSession.locked);
      setLessonOpen(savedSession.lessonOpen);
      setRouteStep(savedSession.routeStep);
      setPrediction(savedSession.prediction);
      return;
    }
    setSessionResumed(false);
    const nextOrder = createCurriculumQueue(rounds, moduleId, seed, recentRoundIds.current);
    setQueueSeed(seed);
    setRoundOrder(nextOrder);
    setRoundCursor(0);
    setQueueComplete(false);
    resetRound(nextOrder[0] ?? 0, true);
    saveCurriculumSession(curriculumStorage(), playerId, moduleId, {
      difficulty, seed, order: nextOrder, cursor: 0, complete: false, lessonOpen: true,
      locked: false, selected: '', feedback: '', feedbackVoice: '', mistakes: 0,
      sequence: [], routeStep: 0, prediction: '',
    });
  }, [difficulty, moduleId, playerId, rounds, resetRound]);

  useEffect(() => {
    saveCurriculumPreferences(curriculumStorage(), playerId, moduleId, difficulty);
  }, [difficulty, moduleId, playerId]);

  useEffect(() => {
    const sessionKey = `${playerId || 'amari'}:${moduleId}:${difficulty}`;
    if (!queueSeed || !roundOrder.length || sessionOwner.current !== sessionKey) return;
    if (skipFirstSessionWrite.current === sessionKey) {
      skipFirstSessionWrite.current = '';
      return;
    }
    saveCurriculumSession(curriculumStorage(), playerId, moduleId, {
      difficulty,
      seed: queueSeed,
      order: roundOrder,
      cursor: roundCursor,
      complete: queueComplete,
      lessonOpen,
      locked,
      selected,
      feedback,
      feedbackVoice,
      mistakes,
      sequence: sequence.map((item) => item.id),
      routeStep,
      prediction,
    });
  }, [difficulty, moduleId, playerId, queueSeed, roundOrder, roundCursor, queueComplete, lessonOpen, locked, selected, feedback, feedbackVoice, mistakes, sequence, routeStep, prediction]);

  const advance = () => {
    if (!locked) return;
    setSessionResumed(false);
    const history = [...recentRoundIds.current, round.id].slice(-8);
    recentRoundIds.current = history;
    saveQueueHistory(playerId, moduleId, difficulty, history);
    let nextCursor = roundCursor + 1;
    if (nextCursor >= roundOrder.length) {
      setEarnedBadges(awardCurriculumBadge(playerId, moduleId, difficulty));
      setQueueComplete(true);
      onGameEvent?.(difficultyGameId, 'level_complete', {
        module: moduleId,
        difficulty,
        seed: queueSeed,
        round: roundCursor,
        rounds: roundOrder.length,
      });
      return;
    }
    const nextIndex = roundOrder[nextCursor] ?? 0;
    setRoundCursor(nextCursor);
    resetRound(nextIndex);
    onGameEvent?.(difficultyGameId, 'question', {
      module: moduleId,
      difficulty,
      seed: queueSeed,
      round: nextCursor,
    });
  };

  const replayQueue = () => {
    const seed = makeCurriculumSeed();
    const nextOrder = createCurriculumReplayQueue(rounds, moduleId, seed, recentRoundIds.current, roundOrder);
    setSessionResumed(false);
    setQueueSeed(seed);
    setRoundOrder(nextOrder);
    setRoundCursor(0);
    setQueueComplete(false);
    resetRound(nextOrder[0] ?? 0, true);
    onGameEvent?.(difficultyGameId, 'replay', { module: moduleId, difficulty, seed, round: 0 });
  };

  const startQuestion = () => {
    setSessionResumed(false);
    setLessonOpen(false);
    onGameEvent?.(difficultyGameId, 'start', { module: moduleId, difficulty, seed: queueSeed, round: roundCursor });
    onGameEvent?.(difficultyGameId, 'question', { module: moduleId, difficulty, seed: queueSeed, round: roundCursor });
  };


  const logAudioHint = useCallback((hintType) => {
    onGameEvent?.(difficultyGameId, 'hint', {
      module: moduleId,
      difficulty,
      seed: queueSeed,
      round: roundCursor,
      hintType,
    });
  }, [difficulty, difficultyGameId, moduleId, onGameEvent, queueSeed, roundCursor]);

  const completeRound = (answerId, response) => {
    if (locked) return;
    setLocked(true);
    setSelected(answerId);
    const item = answerItemsForRound(round).find((candidate) => candidate.id === answerId);
    const praise = getPraise();
    setFeedback(round.explanation);
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
      seed: queueSeed,
      round: roundCursor,
    });
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
      seed: queueSeed,
      round: roundCursor,
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
    setFeedback('');
    setFeedbackVoice('');
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
    <CurriculumHintContext.Provider value={logAudioHint}>
    <div className={`curriculum-quest quest-${activeModule.id}`} style={{ '--quest-world': `url(${worldArt})` }}>
      <header className="quest-header">
        <button type="button" onClick={() => { onGameEvent?.(difficultyGameId, 'leave', { module: moduleId, difficulty, seed: queueSeed, round: roundCursor }); onBack(); }} className="quest-round-button" aria-label="Back to learning world"><ArrowLeft size={23} /></button>
        <div className="quest-heading"><p>Curriculum Quest · Module {moduleNumber}</p><h1><span aria-hidden="true">{activeModule.icon}</span> {activeModule.title}</h1><span>{activeModule.subtitle}</span></div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} className="quest-round-button" />
      </header>

      <main className="quest-main">
        <details className="quest-stage-picker">
          <summary>Choose a topic or level</summary>
          <div className="quest-stage-picker-content">
            <nav className="quest-modules" aria-label="Curriculum modules">
              {CURRICULUM_MODULES.map((module) => (
                <button key={module.id} type="button" onClick={() => { playSfx('click'); const savedDifficulty = loadCurriculumPreferences(curriculumStorage(), playerId).difficulties[module.id]; setDifficulty(savedDifficulty || getRecommendedDifficulty(`worldmap-${module.id}`)); setModuleId(module.id); }} aria-pressed={module.id === activeModule.id} className="quest-module-tab">
                  <span className="quest-module-icon" aria-hidden="true">{module.icon}</span><span><strong>{module.title}</strong><small>{module.subtitle}</small></span><ArrowRight className="quest-tab-arrow" size={18} />
                </button>
              ))}
            </nav>
            <label className="quest-level-select">Choose a level
              <select aria-label="Choose a level" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
                {Object.entries(DIFFICULTY_LABELS).map(([band, label]) => <option key={band} value={band}>{label}</option>)}
              </select>
            </label>
          </div>
        </details>

        {queueComplete ? (
          <section className="quest-paper text-center" aria-labelledby="quest-complete">
            <span className={`quest-year-badge ${ACCENT_BADGE_CLASSES[accent]}`}>{DIFFICULTY_LABELS[difficulty]} path complete</span>
            <h2 id="quest-complete" className="mt-4 text-3xl font-black text-slate-900">You finished this discovery run!</h2>
            <p className="mx-auto mt-2 max-w-xl text-lg font-bold text-slate-700">You explored {roundOrder.length} questions in {activeModule.title}. Choose a level to practise it again.</p>
            <div className="mx-auto mt-5 max-w-xs"><CurriculumBadge badge={CURRICULUM_BADGES.find((badge) => badge.module === moduleId && badge.band === difficulty)} earned /><p className="mt-3 font-bold text-indigo-800">Your badge is saved in your sticker collection.</p></div>
            <div className="mt-5 flex flex-wrap justify-center gap-3" aria-label="Choose a curriculum level">
              {Object.keys(DIFFICULTY_LABELS).map((band) => <button key={band} type="button" onClick={() => { if (band === difficulty) replayQueue(); else setDifficulty(band); }} aria-pressed={band === difficulty} className={`min-h-12 rounded-full border-2 px-5 font-black ${band === difficulty ? 'border-indigo-700 bg-indigo-700 text-white' : 'border-indigo-200 bg-white text-indigo-800'}`}>{DIFFICULTY_LABELS[band]}</button>)}
            </div>
            <button type="button" onClick={replayQueue} className="quest-start mt-6"><RotateCcw size={18} /> Restart this level</button>
          </section>
        ) : (
        <section className="quest-paper" aria-labelledby="quest-prompt">
          {lessonOpen ? (
            <div className="quest-learn-stage">
              <p className="quest-stage-label">Learn</p>
              <h2 id="quest-prompt">Explore {activeModule.title}</h2>
              <div className="quest-learn-intro-row"><p className="quest-learn-intro">{sessionResumed ? 'Your saved round is ready to continue.' : 'Take a look around, then start your first round when you’re ready.'}</p><div className="quest-actions quest-learn-actions"><button type="button" onClick={startQuestion} className="quest-start"><Sparkles size={19} /> {sessionResumed ? 'Continue round' : 'Start round'} <ArrowRight size={18} /></button></div></div>
              <div className="quest-lesson-grid"><LessonVisual module={activeModule} round={round} /><ExplorerWords module={activeModule} soundOn={soundOn} onLaunchGame={onLaunchGame} /></div>
            </div>
          ) : (
            <div className="quest-play-stage">
              <div className="quest-round-progress" aria-label={`Question ${roundCursor + 1} of ${roundOrder.length || Math.min(5, rounds.length)}`}>
                <div><span>{locked ? 'Fact' : 'Play'}</span><strong>Question {roundCursor + 1} of {roundOrder.length || Math.min(5, rounds.length)}</strong></div>
                <div className="quest-round-track" role="progressbar" aria-label="Discovery run progress" aria-valuemin="0" aria-valuemax={roundOrder.length || Math.min(5, rounds.length)} aria-valuenow={roundCursor + (locked ? 1 : 0)}><span style={{ width: `${((roundCursor + (locked ? 1 : 0)) / (roundOrder.length || Math.min(5, rounds.length))) * 100}%` }} /></div>
              </div>
              {sessionResumed && <p className="quest-resume-note" role="status">Saved round restored. Your answer and fact are here.</p>}
              <div className="quest-prompt-row"><h2 id="quest-prompt">{round.prompt}</h2>{!locked && <PackagedAudioButton text={round.prompt} label="Hear prompt" soundOn={soundOn} />}</div>
              {!locked && <p className="quest-help"><Compass size={18} />{roundHelpFor(round)}</p>}
              {!locked && <>
                {mapRound && <CurriculumMap round={round} selected={selected} onPick={handlePick} disabled={locked} showLabels={round.type === 'ocean'} />}
                {choiceRound && <ChoiceRound round={{ ...choiceRound, options: shuffledOptions }} onPick={handlePick} disabled={locked} selected={selected} />}
                {round.type === 'sequence' && <SequenceRound round={round} sequence={sequence} onPick={handlePick} disabled={locked} />}
                {round.type === 'route' && <RouteRound round={round} step={routeStep} onMove={handleRouteMove} disabled={locked} />}
                {round.type === 'investigation' && <InvestigationRound round={round} prediction={prediction} onPredict={handlePrediction} onConclude={handleInvestigationConclusion} disabled={locked} selected={selected} soundOn={soundOn} />}
              </>}
              <div className="quest-feedback" aria-live="polite">{feedback && <div className={`quest-feedback-card ${locked ? 'is-correct' : 'is-retry'}`}><p><span className="quest-fact-heading"><Sparkles size={23} />{locked ? 'Explorer fact' : 'Try again'}</span><span className="quest-fact-copy">{feedback}</span></p>{locked ? <><PackagedAudioButton text={round.explanation} label="Hear fact" soundOn={soundOn} /><button type="button" onClick={advance} className="quest-continue">{roundCursor + 1 >= roundOrder.length ? 'Finish run' : 'Next question'} <ArrowRight size={16} /></button></> : <PackagedAudioButton text={feedbackVoice} label="Hear clue" soundOn={soundOn} />}</div>}</div>
            </div>
          )}
        </section>
        )}
        <details className="quest-badge-disclosure"><summary>View saved badges</summary><CurriculumBadgeCollection playerId={playerId} module={moduleId} earned={earnedBadges} /></details>
      </main>
    </div>
    </CurriculumHintContext.Provider>
  );
};

export default CurriculumQuest;
