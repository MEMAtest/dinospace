import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Headphones } from 'lucide-react';
import { CONTINENTS, CURRICULUM_MODULES, getCurriculumModule, OCEANS } from '../../data/curriculumModules.js';
import { CURRICULUM_LESSON_COPY, getCurriculumVoiceClip } from '../../data/curriculumVoice.js';
import { getPraise } from '../../utils.js';
import { getRecommendedDifficulty } from '../../data/learningProgress.js';
import { createCurriculumQueue, createCurriculumReplayQueue, makeCurriculumSeed, shuffleCurriculumAnswers } from '../../data/curriculumQueue.js';
import { inspectCurriculumPreferences, inspectCurriculumSession, loadCurriculumPreferences, loadCurriculumSession, saveCurriculumPreferences, saveCurriculumSession } from '../../data/curriculumSession.js';
import { FocusMenu } from '../shared/FocusMenu.jsx';
import continentMap from '../../assets/curriculum/continent-map.svg';
import natureSpecimens from '../../assets/curriculum/nature-specimens.webp';
import historyClues from '../../assets/curriculum/history-clues.webp';
import robinArt from '../../assets/curriculum/robin.webp';
import guideCharacters from '../../assets/curriculum/guides.webp';
import { inspectCurriculumBadges } from '../../data/curriculumBadges.js';
import { commitCurriculumHistory, finishCurriculumPath, inspectCurriculumHistory } from '../../data/curriculumProgress.js';
import { CurriculumBadgeCollection } from '../shared/CurriculumBadges.jsx';
import './CurriculumQuest.css';

const DIFFICULTY_LABELS = { starter: 'Starter', growing: 'Growing', challenge: 'Challenge' };
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
const PackagedAudioButton = ({ text, label = 'Hear', soundOn, compact = false }) => {
  const logHint = useContext(CurriculumHintContext);
  const clip = getCurriculumVoiceClip(text);
  const audioRef = useRef(null);
  const playbackGeneration = useRef(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (soundOn) return;
    playbackGeneration.current += 1;
    const audio = audioRef.current;
    audioRef.current = null;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      try { audio.currentTime = 0; } catch { /* the browser may not have loaded metadata */ }
    }
    Promise.resolve().then(() => setPlaying(false));
  }, [soundOn]);
  useEffect(() => () => {
    playbackGeneration.current += 1;
    audioRef.current?.pause();
    audioRef.current = null;
  }, []);
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
    const generation = playbackGeneration.current + 1;
    playbackGeneration.current = generation;
    audioRef.current?.pause();
    const audio = new Audio(clip);
    audio.preload = 'auto';
    audioRef.current = audio;
    audio.onended = () => { if (playbackGeneration.current === generation) setPlaying(false); };
    audio.onerror = () => { if (playbackGeneration.current === generation) setPlaying(false); };
    setPlaying(true);
    audio.play().then(() => {
      if (playbackGeneration.current !== generation || audioRef.current !== audio) audio.pause();
    }).catch(() => { if (playbackGeneration.current === generation) setPlaying(false); });
  };
  const isPlaying = playing && soundOn;
  return <button type="button" onClick={play} disabled={!soundOn} className={`inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-indigo-200 bg-white px-3 py-2 text-xs font-black text-indigo-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-50 ${compact ? 'quest-audio-compact' : ''}`} aria-label={`${label}: ${text}`} title={`${label}: ${text}`}><Headphones size={16} className={isPlaying ? 'animate-pulse' : ''} aria-hidden="true" /><span className={compact ? 'sr-only' : undefined}>{isPlaying ? 'Playing' : label}</span></button>;
};

const CurriculumMap = ({ round, selected, onPick = () => {}, disabled, showLabels = false }) => {
  const answerItems = answerItemsForRound(round);
  const isOceanRound = round.type === 'ocean';
  return (
    <>
      <div className="relative mx-auto h-[22rem] w-full max-w-3xl overflow-hidden rounded-[2rem] border-4 border-sky-200 bg-[#38bde4] shadow-inner" data-quest-map="" aria-label="A simplified world map, not to scale">
        <img src={continentMap} alt="" className="absolute inset-0 h-full w-full object-fill" aria-hidden="true" />
        <div className="absolute inset-0">
          {!isOceanRound && CONTINENTS.map(continent => {
            const style = { left: continent.position.left, top: continent.position.top };
            if (showLabels) return <span key={continent.id} className="quest-focus-map-label" style={style}>{continent.name}</span>;
            return <button key={continent.id} type="button" disabled={disabled} onClick={() => onPick(continent.id)}
              aria-label={`Choose ${continent.name}`} style={style}
              className={`quest-focus-marker ${selected === continent.id ? 'is-picked' : ''}`}>
              <span aria-hidden="true">📍</span>
            </button>;
          })}
          {isOceanRound && OCEANS.map((ocean) => (
            <button
              key={ocean.id}
              type="button"
              onClick={() => onPick(ocean.id)}
              disabled={disabled}
              aria-label={`Choose ${ocean.name}`}
              className={`quest-focus-marker quest-ocean-marker ${selected === ocean.id ? 'is-picked' : ''}`}
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
      <div className="quest-sequence-summary mb-4 flex flex-wrap justify-center gap-2" aria-label="Sequence so far" aria-live="polite">
        {sequence.map((item, index) => <span key={item.id} className="rounded-full bg-amber-500 px-3 py-2 text-sm font-black text-white">{index + 1}. {item.label}</span>)}
      </div>
      <p className="mb-3 text-center text-sm font-black text-amber-900">{next ? `Choose the next clue (${sequence.length + 1} of ${round.items.length}).` : 'Sequence complete!'}</p>
      <div className="quest-sequence-grid grid gap-3 sm:grid-cols-3">
        {round.items.filter((item) => !sequence.some((chosen) => chosen.id === item.id)).map((item) => (
          <div key={item.id} className="quest-sequence-option flex flex-col items-center gap-2 rounded-3xl border-4 border-amber-200 bg-white p-2 shadow-lg">
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
    <div className="quest-route-card mx-auto w-full max-w-xl rounded-3xl border-4 border-sky-200 bg-sky-100 p-4 shadow-inner">
      <div className="mb-3 flex items-center justify-between text-sm font-black text-sky-900"><span>↑ N</span><span>Treasure map</span><span>{step}/{round.path.length} moves</span></div>
      <div className="quest-route-body">
      <div className="quest-route-map mx-auto grid max-w-sm grid-cols-3 gap-2" aria-label="A three by three treasure map">
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
    </div>
  );
};

const InvestigationRound = ({ round, prediction, onPredict, onConclude, disabled, selected, soundOn }) => (
  <div className="mx-auto w-full max-w-3xl">
    {!prediction ? (
      <div className="quest-investigation-predictions grid gap-3 sm:grid-cols-2">
        {round.predictions.map((option) => <div key={option.id} className="flex flex-col items-center gap-2 rounded-3xl border-4 border-emerald-200 bg-white p-2 shadow-lg"><button type="button" onClick={() => onPredict(option.id)} disabled={disabled} className="min-h-20 w-full rounded-2xl p-2 text-center"><span className="block text-4xl">{option.emoji}</span><strong className="mt-2 block text-sm font-black">{option.label}</strong></button></div>)}
      </div>
    ) : (
      <>
        <div className="quest-investigation-observation rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-4 text-center"><p className="text-xs font-black uppercase tracking-wider text-emerald-700">Observation</p><div className="quest-investigation-observation-row"><p className="font-bold text-slate-700">{round.observation}</p>{soundOn && <PackagedAudioButton compact text={round.observation} label="Hear observation" soundOn={soundOn} />}</div></div>
        <h3 className="quest-investigation-question my-4 text-center text-xl font-black text-slate-900">What does the observation tell us?</h3>
        <ChoiceRound round={round} onPick={onConclude} disabled={disabled} selected={selected} />
      </>
    )}
  </div>
);

const LessonVisual = ({ module, round }) => {
  if (module.id === 'continents') {
    return <div className="quest-lesson-visual quest-map-lesson"><p className="quest-model-instruction"><strong>Learn:</strong> explore the continent labels and ocean names. The map is simplified and not to scale.</p><CurriculumMap round={{ type: 'continent', answer: '' }} selected="" disabled showLabels /><div className="quest-ocean-guide"><span className="quest-guide-heading">🌊 Explore the oceans</span><div>{OCEANS.map((ocean) => <span key={ocean.id}>{ocean.name}</span>)}</div></div></div>;
  }
  if (module.id === 'time-detectives') {
    const clues = [{ id: 'letter', emoji: '✉️', label: 'Letter' }, { id: 'old-photo', emoji: '📷', label: 'Photograph' }, { id: 'telephone', emoji: '☎️', label: 'Telephone' }, { id: 'smartphone', emoji: '📱', label: 'Smartphone' }];
    return <div className="quest-lesson-visual quest-timeline-lesson"><span className="quest-guide-character quest-detective-guide" style={{ backgroundImage: `url(${guideCharacters})` }} aria-hidden="true" /><div className="quest-scene-kicker">🔎 Clues from the past</div><p className="quest-model-instruction"><strong>Learn:</strong> look at how clues and objects change. In Try, put only the clues named in the question in order.</p><div className="quest-timeline" aria-label="Examples of clues from different times">{clues.map((clue) => <div key={clue.id} className="quest-timeline-item"><span className="quest-timeline-art"><ChoiceArt item={clue} /></span><strong>{clue.label}</strong></div>)}</div><p>Explore how clues and objects change over time.</p></div>;
  }
  const choices = round.options || [{ id: 'oak', emoji: '🌳', label: 'Oak tree' }, { id: 'robin', emoji: '🐦', label: 'Robin' }, { id: 'frog', emoji: '🐸', label: 'Frog' }, { id: 'cat', emoji: '🐈', label: 'Cat' }];
  return <div className="quest-lesson-visual quest-nature-lesson"><span className="quest-guide-character quest-owl-guide" style={{ backgroundImage: `url(${guideCharacters})` }} aria-hidden="true" /><div className="quest-scene-kicker">🔬 Look closely</div><p className="quest-model-instruction"><strong>Learn:</strong> study the examples. In Try, make a prediction or choose an answer from the observation.</p><div className="quest-specimens">{choices.slice(0, 4).map((choice) => <div className="quest-specimen" key={choice.id}><ChoiceArt item={choice} /><strong>{choice.label}</strong></div>)}</div><p>Look for ways living things are alike or different.</p></div>;
};

const CurriculumQuest = ({ onBack, onLaunchGame, playSfx, soundOn, onToggleSound, onCelebrate, onGameEvent, onPhaseChange, playerId, initialModule }) => {
  const [moduleId, setModuleId] = useState(() => initialCurriculumModule(initialModule, playerId));
  const [panel, setPanel] = useState(null);
  const [lessonWord, setLessonWord] = useState('');
  const badgeCache = useRef(new Map());
  const [badgeView, setBadgeView] = useState(() => {
    const result = inspectCurriculumBadges(playerId);
    const readable = result.status === 'record' || result.status === 'empty';
    return { playerId, badges: readable ? result.badges : [], status: readable ? 'ready' : result.status };
  });
  const [persistenceIssue, setPersistenceIssue] = useState(null);
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
  const [readySessionKey, setReadySessionKey] = useState('');
  const sessionOwner = useRef('');
  const skipFirstSessionWrite = useRef('');
  const pendingSessionRef = useRef(null);
  const currentBadgeView = badgeView.playerId === playerId
    ? badgeView
    : { playerId, badges: badgeCache.current.get(playerId) || [], status: badgeCache.current.has(playerId) ? 'checking' : 'loading' };
  const activeModule = getCurriculumModule(moduleId);
  const rounds = activeModule.rounds[difficulty] || activeModule.rounds.starter;
  const round = rounds[roundIndex % rounds.length];
  // Keep answer positions stable on a retry, but shuffle them for each new question.
  const shuffledOptions = useMemo(() => round.options ? shuffleCurriculumAnswers(round.options, queueSeed, roundCursor) : [], [round, roundCursor, queueSeed]);

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
    const result = inspectCurriculumBadges(playerId);
    if (result.status === 'record' || result.status === 'empty') {
      badgeCache.current.set(playerId, result.badges);
      setBadgeView({ playerId, badges: result.badges, status: 'ready' });
    } else {
      setBadgeView((current) => ({
        playerId,
        badges: current.playerId === playerId ? current.badges : badgeCache.current.get(playerId) || [],
        status: result.status,
      }));
    }
  }, [playerId]);

  const retryBadgeRead = () => {
    const result = inspectCurriculumBadges(playerId);
    if (result.status === 'record' || result.status === 'empty') {
      badgeCache.current.set(playerId, result.badges);
      setBadgeView({ playerId, badges: result.badges, status: 'ready' });
    } else {
      setBadgeView((current) => ({
        playerId,
        badges: current.playerId === playerId ? current.badges : badgeCache.current.get(playerId) || [],
        status: result.status,
      }));
    }
  };

  const sessionSnapshot = useCallback((patch = {}) => ({
    difficulty, seed: queueSeed, order: roundOrder, cursor: roundCursor,
    complete: queueComplete, lessonOpen, locked, selected, feedback, feedbackVoice,
    mistakes, sequence: sequence.map((item) => item.id), routeStep, prediction,
    ...patch,
  }), [difficulty, queueSeed, roundOrder, roundCursor, queueComplete, lessonOpen, locked, selected, feedback, feedbackVoice, mistakes, sequence, routeStep, prediction]);
  const persistSession = useCallback((snapshot) => saveCurriculumSession(curriculumStorage(), playerId, moduleId, rounds, snapshot), [playerId, moduleId, rounds]);
  const holdSaveFailure = useCallback((type, snapshot, result) => {
    pendingSessionRef.current = snapshot || null;
    setPersistenceIssue({ type, snapshot, status: result?.status || 'unconfirmed' });
    return false;
  }, []);
  const persistOrHold = useCallback((type, snapshot) => {
    const result = persistSession(snapshot);
    if (result.status !== 'saved') return holdSaveFailure(type, snapshot, result);
    pendingSessionRef.current = null;
    setPersistenceIssue((current) => current?.type === type || current?.type === 'session' ? null : current);
    return true;
  }, [persistSession, holdSaveFailure]);

  useEffect(() => {
    const sessionKey = `${playerId || 'amari'}:${moduleId}:${difficulty}`;
    sessionOwner.current = sessionKey;
    skipFirstSessionWrite.current = sessionKey;
    const seed = makeCurriculumSeed();
    const historyState = inspectCurriculumHistory(curriculumStorage(), playerId, moduleId, difficulty);
    recentRoundIds.current = historyState.status === 'record' || historyState.status === 'empty' ? historyState.ids : [];
    const sessionState = inspectCurriculumSession(curriculumStorage(), playerId, moduleId, rounds, difficulty);
    const savedSession = sessionState.status === 'record' ? loadCurriculumSession(curriculumStorage(), playerId, moduleId, rounds, difficulty) : null;
    if (savedSession) {
      setPersistenceIssue(historyState.status === 'record' || historyState.status === 'empty' ? null : { type: 'history-read', status: historyState.status });
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
      setReadySessionKey(sessionKey);
      return;
    }
    setSessionResumed(false);
    const nextOrder = createCurriculumQueue(rounds, moduleId, seed, recentRoundIds.current);
    setQueueSeed(seed);
    setRoundOrder(nextOrder);
    setRoundCursor(0);
    setQueueComplete(false);
    resetRound(nextOrder[0] ?? 0, true);
    const initialSnapshot = {
      difficulty, seed, order: nextOrder, cursor: 0, complete: false, lessonOpen: true,
      locked: false, selected: '', feedback: '', feedbackVoice: '', mistakes: 0,
      sequence: [], routeStep: 0, prediction: '',
    };
    if (sessionState.status === 'empty' && (historyState.status === 'record' || historyState.status === 'empty')) {
      const saved = saveCurriculumSession(curriculumStorage(), playerId, moduleId, rounds, initialSnapshot);
      if (saved.status === 'saved') setPersistenceIssue(null);
      else holdSaveFailure('session', initialSnapshot, saved);
    } else {
      setPersistenceIssue({ type: sessionState.status === 'empty' ? 'history-read' : 'session-read', status: sessionState.status === 'empty' ? historyState.status : sessionState.status, snapshot: initialSnapshot });
    }
    setReadySessionKey(sessionKey);
  }, [difficulty, moduleId, playerId, rounds, resetRound, holdSaveFailure]);

  useEffect(() => {
    const sessionKey = `${playerId || 'amari'}:${moduleId}:${difficulty}`;
    if (readySessionKey !== sessionKey) return;
    onPhaseChange?.(queueComplete ? 'finish' : lessonOpen ? 'start' : 'play');
  }, [difficulty, lessonOpen, moduleId, onPhaseChange, playerId, queueComplete, readySessionKey]);

  useEffect(() => {
    const preferenceState = inspectCurriculumPreferences(curriculumStorage(), playerId);
    if (preferenceState.status === 'record' || preferenceState.status === 'empty') {
      const saved = saveCurriculumPreferences(curriculumStorage(), playerId, moduleId, difficulty);
      if (saved.status !== 'saved') setPersistenceIssue({ type: 'preferences', status: saved.status });
    } else setPersistenceIssue({ type: 'preferences', status: preferenceState.status });
  }, [difficulty, moduleId, playerId]);

  useEffect(() => {
    const sessionKey = `${playerId || 'amari'}:${moduleId}:${difficulty}`;
    if (!queueSeed || !roundOrder.length || sessionOwner.current !== sessionKey) return;
    if (skipFirstSessionWrite.current === sessionKey) {
      skipFirstSessionWrite.current = '';
      return;
    }
    const snapshot = sessionSnapshot();
    const saved = persistSession(snapshot);
    if (saved.status === 'saved') {
      setPersistenceIssue((current) => current?.type === 'session' ? null : current);
      pendingSessionRef.current = null;
    } else holdSaveFailure('session', snapshot, saved);
  }, [difficulty, moduleId, playerId, queueSeed, roundOrder, roundCursor, queueComplete, lessonOpen, locked, selected, feedback, feedbackVoice, mistakes, sequence, routeStep, prediction, sessionSnapshot, persistSession, holdSaveFailure]);

  const finishQueue = () => {
    const result = finishCurriculumPath(curriculumStorage(), playerId, moduleId, difficulty, getPraise(), onCelebrate);
    if (result.status !== 'saved') return holdSaveFailure(`completion-${result.status}`, sessionSnapshot(), { status: result.detail || 'unconfirmed' });
    badgeCache.current.set(playerId, result.badges);
    setBadgeView({ playerId, badges: result.badges, status: 'ready' });
    setPersistenceIssue(null);
    setSessionResumed(false);
    setQueueComplete(true);
    onGameEvent?.(difficultyGameId, 'level_complete', {
      module: moduleId,
      difficulty,
      seed: queueSeed,
      round: roundCursor,
      rounds: roundOrder.length,
    });
    return true;
  };

  const advance = () => {
    if (!locked) return;
    if (!persistOrHold('session', sessionSnapshot())) return;
    const transactionId = `curriculum:${moduleId}:${difficulty}:${queueSeed}:${roundCursor}:${round.id}`;
    const historyResult = commitCurriculumHistory(curriculumStorage(), playerId, moduleId, difficulty, transactionId, round.id);
    if (historyResult.status !== 'saved') return holdSaveFailure('history-advance', sessionSnapshot(), historyResult);
    recentRoundIds.current = historyResult.history;
    let nextCursor = roundCursor + 1;
    if (nextCursor >= roundOrder.length) {
      finishQueue();
      return;
    }
    setPersistenceIssue(null);
    setSessionResumed(false);
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
    if (persistenceIssue) return;
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
    if (persistenceIssue) return;
    requestAnimationFrame(() => document.getElementById('quest-prompt')?.focus({ preventScroll: true }));
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
    if (locked || persistenceIssue) return;
    setLocked(true);
    setSelected(answerId);
    const item = answerItemsForRound(round).find((candidate) => candidate.id === answerId);
    setFeedback(round.explanation);
    playSfx('success');
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
    if (locked || persistenceIssue) return;
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
    if (locked || persistenceIssue) return;
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
    if (persistenceIssue) return;
    setPrediction(answerId);
    setFeedback('');
    setFeedbackVoice('');
    playSfx('tap');
  };

  const handleInvestigationConclusion = (answerId) => {
    if (persistenceIssue) return;
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

  const retryPersistence = () => {
    if (!persistenceIssue) return;
    if (persistenceIssue.type === 'history-advance' || persistenceIssue.type.startsWith('completion-')) {
      advance();
      return;
    }
    if (persistenceIssue.type === 'preferences') {
      const result = saveCurriculumPreferences(curriculumStorage(), playerId, moduleId, difficulty);
      if (result.status === 'saved') setPersistenceIssue(null);
      else setPersistenceIssue({ type: 'preferences', status: result.status });
      return;
    }
    if (persistenceIssue.type === 'history-read') {
      const result = inspectCurriculumHistory(curriculumStorage(), playerId, moduleId, difficulty);
      if (result.status === 'record' || result.status === 'empty') {
        recentRoundIds.current = result.ids;
        const snapshot = pendingSessionRef.current || persistenceIssue.snapshot;
        if (snapshot) {
          const saved = persistSession(snapshot);
          if (saved.status !== 'saved') return holdSaveFailure('session', snapshot, saved);
          pendingSessionRef.current = null;
        }
        setPersistenceIssue(null);
      } else setPersistenceIssue({ type: 'history-read', status: result.status });
      return;
    }
    if (persistenceIssue.type === 'session-read') {
      const result = inspectCurriculumSession(curriculumStorage(), playerId, moduleId, rounds, difficulty);
      if (result.status === 'empty') {
        const snapshot = pendingSessionRef.current || persistenceIssue.snapshot;
        if (snapshot && persistOrHold('session', snapshot)) setPersistenceIssue(null);
      } else setPersistenceIssue({ type: 'session-read', status: result.status });
      return;
    }
    const snapshot = pendingSessionRef.current || persistenceIssue.snapshot || sessionSnapshot();
    const result = persistSession(snapshot);
    if (result.status === 'saved') {
      pendingSessionRef.current = null;
      setPersistenceIssue(null);
    } else setPersistenceIssue({ ...persistenceIssue, status: result.status });
  };

  // Do not briefly render the default Africa/Start screen while a saved fact
  // or a different module is being restored. Effects commit the whole session.
  if (readySessionKey !== `${playerId || 'amari'}:${moduleId}:${difficulty}`) {
    return <main className="grid min-h-[60vh] place-items-center p-6"><p role="status" className="rounded-2xl bg-white p-5 font-bold text-slate-700">Getting your discovery run ready…</p></main>;
  }

  const positiveRouteFeedback = !locked && round.type === 'route' && feedback.startsWith('Good move:');
  const mapRound = activeModule.id === 'continents' && ['continent', 'country', 'ocean'].includes(round.type);
  const choiceRound = ['evidence', 'classify', 'map-key', 'direction', 'feature', 'uk-place'].includes(round.type) ? round : null;
  const closePanel = () => setPanel(null);
  const leaveQuest = () => {
    onGameEvent?.(difficultyGameId, 'leave', { module: moduleId, difficulty, seed: queueSeed, round: roundCursor });
    onBack?.();
  };
  const selectModule = module => {
    const savedDifficulty = loadCurriculumPreferences(curriculumStorage(), playerId).difficulties[module.id];
    playSfx('click');
    setDifficulty(savedDifficulty || getRecommendedDifficulty(`worldmap-${module.id}`));
    setModuleId(module.id);
    closePanel();
  };
  const options = [
    ...CURRICULUM_MODULES.filter(module => module.id !== moduleId).map(module => ({
      label: module.title, description: module.subtitle, action: () => selectModule(module),
    })),
    ...Object.entries(DIFFICULTY_LABELS).filter(([band]) => band !== difficulty).map(([band, label]) => ({
      label: `${label} level`, action: () => { setDifficulty(band); closePanel(); },
    })),
    { label: 'Lesson notes', action: () => { setLessonWord(activeModule.vocabulary[0] || ''); setPanel('notes'); } },
    { label: 'Saved badges', action: () => setPanel('badges') },
    ...(activeModule.id === 'time-detectives' && onLaunchGame
      ? [{ label: 'Practise telling the time', action: () => onLaunchGame('timeteller') }] : []),
    { label: soundOn ? 'Turn sound off' : 'Turn sound on', action: () => { onToggleSound?.(); closePanel(); } },
    { label: 'Back to Explore & Languages', action: leaveQuest },
  ];

  return <CurriculumHintContext.Provider value={logAudioHint}>
    <div className={`focus-game curriculum-quest quest-focus quest-${moduleId}`} data-board-focus="" data-quest-round={round.id} data-quest-module={moduleId}>
      <main className={`focus-game-body${panel || queueComplete ? ' is-menu' : ''}`}>
        <header className="focus-game-heading">
          <p>Curriculum Quest · {DIFFICULTY_LABELS[difficulty]}</p>
          <h1>{panel === 'notes' ? 'Lesson notes' : panel === 'badges' ? 'Saved badges' : activeModule.title}</h1>
        </header>
        {panel === 'options' ? <FocusMenu choices={options} onBack={closePanel} /> : panel === 'notes' ? <>
          <p className="focus-game-message">{CURRICULUM_LESSON_COPY[moduleId]}</p>
          <div className="focus-game-menu">
            <label htmlFor="quest-vocabulary">Explore a word</label>
            <select id="quest-vocabulary" value={lessonWord} onChange={event => setLessonWord(event.target.value)}>
              {activeModule.vocabulary.slice(0, 4).map(word => <option key={word}>{word}</option>)}
            </select>
            {soundOn && <PackagedAudioButton text={lessonWord} label="Hear word" soundOn />}
            {soundOn && <PackagedAudioButton text={CURRICULUM_LESSON_COPY[moduleId]} label="Hear lesson" soundOn />}
            <button type="button" className="focus-game-button" onClick={closePanel}>Back to the quest</button>
          </div>
        </> : panel === 'badges' ? <>
          {currentBadgeView.status === 'ready'
            ? <CurriculumBadgeCollection playerId={playerId} module={moduleId} earned={currentBadgeView.badges} />
            : <p className="focus-game-message" role="status">{currentBadgeView.badges.length ? 'Some badges from this visit are available. The saved collection could not be checked.' : 'The saved badge collection could not be read.'}</p>}
          <div className="focus-game-actions mt-3">
            {currentBadgeView.status !== 'ready' && <button type="button" onClick={retryBadgeRead} className="focus-game-button is-primary">Retry badge read</button>}
            <button type="button" className="focus-game-button" onClick={closePanel}>Back to the quest</button>
          </div>
        </> : <>
          {persistenceIssue && <div className="quest-save-alert" role="alert">
            <strong>{['session-read', 'history-read', 'preferences'].includes(persistenceIssue.type)
              ? 'Your saved learning data could not be read safely.'
              : 'This step has not been safely saved yet.'}</strong>
            <span>Keep this page open and retry before continuing.</span>
            <button type="button" onClick={retryPersistence} className="focus-game-button is-primary">Retry save</button>
          </div>}
          {queueComplete ? <>
            <h2 className="text-xl font-extrabold">Discovery run complete!</h2>
            <p className="focus-game-message">You explored {roundOrder.length} questions. Your badge is in Stickers.</p>
            <div className="focus-game-actions">
              {!persistenceIssue && <button type="button" onClick={replayQueue} className="focus-game-button is-primary">Play this level again</button>}
              <button type="button" className="focus-game-button" onClick={() => setPanel('options')}>Options</button>
              <button type="button" className="focus-game-button" onClick={leaveQuest}>Finish</button>
            </div>
          </> : lessonOpen ? <>
            <div className="quest-lesson-grid">
              <LessonVisual module={activeModule} round={round} />
            </div>
            <div className="focus-game-actions mt-3">
              {!persistenceIssue && <button type="button" onClick={startQuestion} className="focus-game-button is-primary">{sessionResumed ? 'Continue round' : 'Start round'}</button>}
              <button type="button" className="focus-game-button" onClick={() => setPanel('options')}>Options</button>
              <button type="button" className="focus-game-button" onClick={leaveQuest}>Back</button>
            </div>
          </> : <section className="quest-play-stage" aria-labelledby="quest-prompt">
            <p className="quest-focus-progress">Question {roundCursor + 1} of {roundOrder.length || Math.min(5, rounds.length)}</p>
            <h2 id="quest-prompt" className="quest-focus-prompt" tabIndex={-1}>{round.prompt}</h2>
            {!locked && !(round.type === 'investigation' && prediction) && <p className="focus-game-message">{roundHelpFor(round)}</p>}
            {!locked && <div className="quest-focus-board" aria-label="Play area">
              {mapRound && <CurriculumMap round={round} selected={selected} onPick={handlePick} disabled={Boolean(persistenceIssue)} showLabels={round.type === 'ocean'} />}
              {choiceRound && <ChoiceRound round={{ ...choiceRound, options: shuffledOptions }} onPick={handlePick} disabled={Boolean(persistenceIssue)} selected={selected} />}
              {round.type === 'sequence' && <SequenceRound round={round} sequence={sequence} onPick={handlePick} disabled={Boolean(persistenceIssue)} />}
              {round.type === 'route' && <RouteRound round={round} step={routeStep} onMove={handleRouteMove} disabled={Boolean(persistenceIssue)} />}
              {round.type === 'investigation' && <InvestigationRound round={round} prediction={prediction} onPredict={handlePrediction} onConclude={handleInvestigationConclusion} disabled={Boolean(persistenceIssue)} selected={selected} soundOn={soundOn && !persistenceIssue} />}
            </div>}
            <div aria-live="polite">
              {feedback && <p className={locked || positiveRouteFeedback ? 'pattern-focus-explanation' : 'focus-game-message'}>{feedback}</p>}
            </div>
            <div className="focus-game-actions mt-3">
              {!persistenceIssue && locked && <button type="button" onClick={advance} className="focus-game-button is-primary">{roundCursor + 1 >= roundOrder.length ? 'Finish run' : 'Next question'}</button>}
              {soundOn && !persistenceIssue && <PackagedAudioButton
                text={locked ? round.explanation : feedbackVoice || round.prompt}
                label={locked ? 'Hear fact' : feedbackVoice ? 'Hear clue' : 'Hear prompt'} soundOn />}
              <button type="button" className="focus-game-button" onClick={() => setPanel('options')}>Options</button>
            </div>
          </section>}
        </>}
      </main>
    </div>
  </CurriculumHintContext.Provider>;
};

export default CurriculumQuest;
