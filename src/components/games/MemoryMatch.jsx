import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Star, Volume2 } from 'lucide-react';
import { MEMORY_LEVELS } from '../../data/index.js';
import { getPraise, loadSaved, saveSafe } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';
import { getGameLevel, nextGameLevelIndex, saveGameLevel } from '../../data/sessionLevels.js';
import askiaScene from '../../assets/game-scenes/askia-memory-treehouse.webp';
import askiaArt from '../../assets/little/askia-detective.webp';
import rocketArt from '../../assets/little/fuel-rocket.webp';
import fireEngineArt from '../../assets/little/rescue-firetruck.webp';
import trexArt from '../../assets/little/detective-trex.webp';
import './memoryMatch.css';
import { buildSeededMemoryDeck, memoryStrategy, readMemoryPassport, completeMemoryBoard } from '../../data/batch7Progress.js';
const makeDeck = (level) => buildSeededMemoryDeck(level, crypto.getRandomValues(new Uint32Array(1))[0]);

const ASKIA_MEMORY_LEVELS = [
  { id: 'askia-friends', name: 'Meet the Friends', emojis: ['🦕', '🚀', '🚒'], columns: 3 },
  { id: 'askia-stars', name: 'Star Pairs', emojis: ['🦕', '🚀', '🚒', '⭐️'], columns: 4 },
  { id: 'askia-nature', name: 'Nature Friends', emojis: ['🌿', '🥚', '🦕', '⭐️'], columns: 4 },
  { id: 'askia-rescue', name: 'Rescue Pairs', emojis: ['🚒', '🐶', '🐱', '🚀', '🦕'], columns: 5 },
  { id: 'askia-dino', name: 'Dino Challenge', emojis: ['🦕', '🚀', '🚒', '⭐️', '🦖', '🥚'], columns: 4 },
];

const ASKIA_CARD_ART = {
  '🦕': askiaArt,
  '🚀': rocketArt,
  '🚒': fireEngineArt,
  '🦖': trexArt,
};

const CARD_NAMES = {
  '🐶': 'dog', '🦊': 'fox', '🐸': 'frog', '🐵': 'monkey', '🦄': 'unicorn', '🐙': 'octopus',
  '🐳': 'whale', '🐬': 'dolphin', '🦈': 'shark', '🐢': 'turtle', '🪼': 'jellyfish', '🦀': 'crab',
  '🦑': 'squid', '🐟': 'fish', '🚀': 'rocket', '🛸': 'flying saucer', '🌟': 'glowing star',
  '🌙': 'moon', '🪐': 'ringed planet', '☄️': 'comet', '⭐️': 'star', '🛰️': 'satellite',
  '👽': 'alien', '🌌': 'galaxy', '🎈': 'balloon', '🎉': 'party popper', '🥳': 'party face',
  '🎂': 'cake', '🍭': 'lolly', '🍩': 'doughnut', '🧁': 'cupcake', '🍓': 'strawberry',
  '🍕': 'pizza', '🍟': 'chips', '🍉': 'watermelon', '🍬': 'sweet', '🦕': 'long-neck dinosaur',
  '🦖': 'T-rex', '🦴': 'bone', '🌋': 'volcano', '🥚': 'egg', '🪨': 'rock', '🌿': 'leaf',
  '🚗': 'car', '✈️': 'aeroplane', '🚂': 'train', '🚁': 'helicopter', '🏎️': 'racing car',
  '🚒': 'fire engine', '🍎': 'apple', '🍌': 'banana', '🍇': 'grapes', '🥕': 'carrot',
  '🧀': 'cheese', '🍪': 'biscuit', '🥤': 'drink', '🌽': 'corn', '👨‍🚀': 'astronaut',
  '🌍': 'Earth', '🔭': 'telescope',
};

const cardName = (emoji) => CARD_NAMES[emoji] || 'picture';

const MemoryMatch = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent, playerId, littleMode = false, onPhaseChange }) => {
  const levels = littleMode ? ASKIA_MEMORY_LEVELS : MEMORY_LEVELS;
  const [levelIndex, setLevelIndex] = useState(() => getGameLevel(playerId, 'memory', levels.length).current);
  const difficulty = littleMode ? 'starter' : ['starter', 'growing', 'challenge'][Math.min(levelIndex, 2)];
  const level = levels[levelIndex];
  const [deck, setDeck] = useState(() => makeDeck(level));
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [completionMessage, setCompletionMessage] = useState('');
  const [timer, setTimer] = useState(0);
  const [bestTimes, setBestTimes] = useState(() => loadSaved(`${playerId}_memory_best`, {}));
  const [runId, setRunId] = useState(0);
  const [previousEfficient, setPreviousEfficient] = useState(() => (readMemoryPassport(playerId, levels)[level.id]?.bestMoves || Infinity) <= level.emojis.length * 2);
  const [strategy, setStrategy] = useState(() => memoryStrategy(levelIndex, (readMemoryPassport(playerId, levels)[level.id]?.bestMoves || Infinity) <= level.emojis.length * 2));
  const [passport, setPassport] = useState(() => readMemoryPassport(playerId, levels));
  const [saveWarning, setSaveWarning] = useState('');
  const timerRef = useRef(null);
  const mismatchRef = useRef(null);
  const completePanelRef = useRef(null);

  useEffect(() => () => clearTimeout(mismatchRef.current), []);
  useEffect(() => { onPhaseChange?.(showLevelComplete ? 'done' : 'play'); }, [onPhaseChange, showLevelComplete]);

  // One timer per play-through: restarts on every startLevel (runId) and stops once the level is complete.
  useEffect(() => {
    if (showLevelComplete) return undefined;
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [runId, showLevelComplete]);

  useEffect(() => {
    if (showLevelComplete) completePanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [showLevelComplete]);

  const matches = deck.filter((card) => card.matched).length / 2;

  useEffect(() => {
    speak('Find the matching pairs.');
  }, [levelIndex, level.name, littleMode, speak]);

  const finishLevel = (finalMatches, finalMoves) => {
    clearInterval(timerRef.current);
    const praise = getPraise();
    speak('You matched them all. Fantastic memory!');
    playSfx('success');
    setCompletionMessage(praise);
    setShowLevelComplete(true);
    const nextIndex = Math.min(levelIndex + 1, levels.length - 1);
    const saved = getGameLevel(playerId, 'memory', levels.length);
    saveGameLevel(playerId, 'memory', nextIndex, Math.max(saved.unlocked, nextIndex));
    if (littleMode) onCelebrate(praise, 6, 300);
    else {
      const completed = completeMemoryBoard(playerId, levels, level.id, finalMoves);
      setPassport(completed.passport);
      setSaveWarning(completed.persisted ? '' : 'This board is complete, but could not be saved on this device.');
      if (completed.awardedStars > 0) onCelebrate(praise, completed.awardedStars * 4, 300);
    }
    // Near-perfect recall: perfect-memory play averages ~1.6 moves per pair, so allow up to 2 per pair.
    const efficient = finalMoves <= level.emojis.length * 2;
    setPreviousEfficient(efficient);
    onGameEvent?.('memory', 'level_completed', {
      skill: 'working-memory',
      item: level.id,
      response: `${finalMatches}/${level.emojis.length}`,
      correct: true,
      firstAttempt: efficient,
      independent: efficient,
      difficulty,
      moves: finalMoves,
      seconds: timer,
    });
    const best = bestTimes[level.id];
    if (!littleMode && (!best || timer < best)) {
      setBestTimes((prev) => {
        const next = { ...prev, [level.id]: timer };
        saveSafe(`${playerId}_memory_best`, next);
        return next;
      });
    }
  };

  const handleFlip = (index) => {
    if (locked) return;
    if (deck[index].flipped || deck[index].matched || flipped.includes(index)) return;
    const nextFlipped = [...flipped, index];
    setDeck((prev) => prev.map((card, cardIndex) => (cardIndex === index ? { ...card, flipped: true } : card)));
    playSfx('flip');
    if (nextFlipped.length < 2) {
      setFlipped(nextFlipped);
      speak(`You found a ${cardName(deck[index].emoji)}. Remember where it is.`);
      return;
    }

    const [first, second] = nextFlipped;
    setLocked(true);
    setMoves((previous) => previous + 1);
    if (deck[first].emoji === deck[second].emoji) {
      setDeck((prev) =>
        prev.map((card, cardIndex) =>
          cardIndex === first || cardIndex === second ? { ...card, matched: true } : card,
        ),
      );
      setFlipped([]);
      setLocked(false);
      playSfx('sparkle');
      speak(`A pair of ${cardName(deck[first].emoji)}s!`);
      if (littleMode) onCelebrate(getPraise(), 4, 200);
      if (matches + 1 === level.emojis.length) finishLevel(matches + 1, moves + 1);
    } else {
      mismatchRef.current = setTimeout(() => {
        setDeck((prev) =>
          prev.map((card, cardIndex) =>
            cardIndex === first || cardIndex === second ? { ...card, flipped: false } : card,
          ),
        );
        setFlipped([]);
        setLocked(false);
        playSfx('oops');
        speak('Those pictures are different. Try to remember where each one is.');
      }, littleMode ? 1500 : 700);
    }
  };

  const startLevel = (nextIndex) => {
    clearTimeout(mismatchRef.current);
    const nextLevel = levels[nextIndex];
    setLevelIndex(nextIndex);
    setStrategy(memoryStrategy(nextIndex, previousEfficient));
    const saved = getGameLevel(playerId, 'memory', levels.length);
    saveGameLevel(playerId, 'memory', nextIndex, saved.unlocked);
    setDeck(makeDeck(nextLevel));
    setFlipped([]);
    setMoves(0);
    setLocked(false);
    setShowLevelComplete(false);
    setCompletionMessage('');
    setTimer(0);
    setRunId((value) => value + 1);
  };

  const handleNextLevel = () => {
    startLevel(nextGameLevelIndex(levelIndex, levels.length));
  };

  const renderCard = (card, index) => {
    const isFaceUp = card.flipped || card.matched;
    return (
      <div key={card.id} style={{ perspective: '900px' }}>
        <button
          type="button"
          onClick={() => handleFlip(index)}
          disabled={card.matched || locked}
          aria-label={isFaceUp ? `${cardName(card.emoji)} card${card.matched ? ', matched' : ''}` : `Face-down memory card ${index + 1}`}
          className={littleMode ? `memory-little-card ${card.matched ? 'is-matched' : ''}` : 'relative min-h-12 w-full aspect-square'}
        >
          <div
            className={littleMode ? 'memory-little-card-inner' : 'absolute inset-0 transition-transform duration-500'}
            style={{
              transformStyle: 'preserve-3d',
              transform: isFaceUp ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            <div
              className={littleMode ? 'memory-little-card-back' : 'absolute inset-0 bg-white rounded-2xl border-4 border-rose-200 shadow-lg flex items-center justify-center text-3xl'}
              style={{ backfaceVisibility: 'hidden' }}
            >
              {littleMode ? <span aria-hidden="true" className="memory-little-paw">✦</span> : '🧠'}
            </div>
            <div
              aria-hidden={!isFaceUp}
              className={littleMode ? 'memory-little-card-front' : 'absolute inset-0 bg-rose-500 rounded-2xl border-4 border-rose-200 shadow-lg flex items-center justify-center text-4xl'}
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              {littleMode && ASKIA_CARD_ART[card.emoji]
                ? <img src={ASKIA_CARD_ART[card.emoji]} alt="" draggable="false" />
                : littleMode && card.emoji === '⭐️'
                  ? <Star aria-hidden="true" className="memory-little-star-art" fill="currentColor" />
                  : card.emoji}
            </div>
          </div>
        </button>
      </div>
    );
  };

  if (littleMode) return (
    <div className="memory-little" style={{ '--memory-scene': `url("${askiaScene}")` }}>
      <header className="memory-little-header">
        <button onClick={onBack} className="game-icon-button" aria-label="Back to home"><ArrowLeft /></button>
        <div className="memory-little-heading"><h2>Memory Match</h2><span>{level.name}</span></div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </header>

      <main className="memory-little-main">
        <div className="memory-little-guide">
          <img src={askiaArt} alt="Askia the dinosaur" />
          <button type="button" onClick={() => speak('Find the matching pairs.')} className="memory-little-bubble">
            <Volume2 size={24} aria-hidden="true" />
            <span>Find the pairs!</span>
          </button>
        </div>

        <div className="memory-little-panel">
          <div className="memory-little-status">
            <div className="memory-little-progress" aria-label={`Board ${levelIndex + 1} of ${levels.length}`}>
              {levels.map((entry, index) => <button type="button" key={entry.id} disabled={index > getGameLevel(playerId, 'memory', levels.length).unlocked} onClick={() => startLevel(index)} aria-label={`Board ${index + 1}: ${entry.name}`} aria-current={index === levelIndex ? 'step' : undefined}><Star fill={index <= levelIndex ? 'currentColor' : 'none'} className={index <= levelIndex ? 'earned' : ''} aria-hidden="true" /></button>)}
            </div>
            <div className="memory-little-count" role="status">{matches} / {level.emojis.length} pairs</div>
          </div>
          <div className="memory-little-grid" style={{ '--memory-columns': level.columns }}>
            {deck.map(renderCard)}
          </div>
          <p className="memory-little-tip">Tap two cards to find a match.</p>
        </div>

        {showLevelComplete && (
          <div ref={completePanelRef} className="memory-little-complete" role="status">
            <Star fill="currentColor" aria-hidden="true" />
            <h3>{completionMessage}</h3>
            <p>You found every pair!</p>
            <button onClick={handleNextLevel}>{levelIndex < levels.length - 1 ? 'Next board' : 'Replay this board'} →</button>
          </div>
        )}
      </main>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-100 via-pink-100 to-rose-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 right-8 w-40 h-40 bg-white/70 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-200/60 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button
          onClick={onBack}
          className="game-icon-button"
          aria-label="Back to Thinking and Play"
        >
          <ArrowLeft />
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-rose-600">Memory Match</h2>
          {!littleMode && <p className="text-rose-600/70 font-semibold">
            Level {levelIndex + 1}/{levels.length} · {level.name}
          </p>}
          <p className={`text-rose-600/70 font-semibold ${littleMode ? 'hidden' : ''}`}>
            Matches: {matches} · Moves: {moves} · ⏱️ {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
            {bestTimes[level.id] ? ` · Best: ${Math.floor(bestTimes[level.id] / 60)}:${String(bestTimes[level.id] % 60).padStart(2, '0')}` : ''}
          </p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 relative z-10">
        <button
          onClick={() => speak('Find the matching pairs.')}
          className="mb-4 text-rose-600 font-semibold"
        >
          🔊 Hear the mission
        </button>
        <p className={`mb-4 max-w-xl rounded-full bg-white/70 px-5 py-2 text-center text-sm font-bold text-rose-700 ${littleMode ? 'hidden' : ''}`} role="status">
          {strategy}
        </p>
        <div className="mb-4 flex flex-wrap justify-center gap-2" aria-label="Memory levels">
          {levels.map((entry, index) => <button type="button" key={entry.id} disabled={index > getGameLevel(playerId, 'memory', levels.length).unlocked} onClick={() => startLevel(index)} aria-label={`Level ${index + 1}: ${entry.name}`} aria-current={index === levelIndex ? 'step' : undefined} className={`grid h-12 w-12 place-items-center rounded-full border-2 font-black ${index === levelIndex ? 'border-rose-700 bg-rose-500 text-white' : index > getGameLevel(playerId, 'memory', levels.length).unlocked ? 'border-slate-200 bg-slate-100 text-slate-400' : 'border-amber-300 bg-white text-rose-700'}`}>{index + 1}</button>)}
        </div>

        <div className="memory-board grid gap-4 w-full max-w-3xl" style={{ '--memory-columns': level.columns }}>
          {deck.map(renderCard)}
        </div>
        <p className="mt-3 font-bold text-rose-700" aria-label="Memory passport">Memory passport: {Object.keys(passport).length}/{levels.length} board stickers collected</p>
        {saveWarning && <p role="status" className="mt-2 rounded-xl bg-white p-3 text-rose-800">{saveWarning}</p>}

        {showLevelComplete && (
          <div ref={completePanelRef} className="mt-6 bg-white/90 p-6 rounded-3xl shadow-xl text-center">
            <Star className="mx-auto mb-2 h-12 w-12 text-amber-500" fill="currentColor" aria-hidden="true" />
            <h3 className="text-2xl font-black text-rose-600">{completionMessage}</h3>
            <p className="mt-2 font-bold text-rose-700">Memory explorer: recalling a picture’s place helps you find its partner. Next time, try a row-by-row scan.</p>
            <button onClick={handleNextLevel} className="mt-4 min-h-14 w-full rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-8 py-4 text-2xl font-black text-white shadow-lg transition hover:scale-105 active:scale-95">
              {levelIndex < levels.length - 1 ? `Next level: ${levels[levelIndex + 1].name}` : 'Replay this level'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryMatch;
