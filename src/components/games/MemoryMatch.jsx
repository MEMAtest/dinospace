import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { ArrowLeft, Sparkles, Star, Volume2 } from 'lucide-react';
import { MEMORY_LEVELS } from '../../data/index.js';
import { memoryCardLabel, memoryCardIllustration, MEMORY_CARD_ILLUSTRATIONS, MEMORY_CARD_CONTEXT_ILLUSTRATIONS } from '../../data/memoryMatchContent.js';
import { getPraise, loadSaved, saveSafe } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';
import { getGameLevel, nextGameLevelIndex, saveGameLevel } from '../../data/sessionLevels.js';
import askiaScene from '../../assets/game-scenes/askia-memory-treehouse.webp';
import askiaArt from '../../assets/little/askia-detective.webp';
import rocketArt from '../../assets/little/fuel-rocket.webp';
import fireEngineArt from '../../assets/little/rescue-firetruck.webp';
import trexArt from '../../assets/little/detective-trex.webp';
import brontoArt from '../../assets/little/detective-bronto.webp';
import friendlyCarArt from '../../assets/german-garage/friendly-car.png';
import dogArt from '../../assets/memory-match/dog-v1.webp';
import foxArt from '../../assets/memory-match/fox-v1.webp';
import partyBalloonArt from '../../assets/memory-match/party-balloon-v1-card.webp';
import partyPopperArt from '../../assets/memory-match/party-popper-v1-card.webp';
import partyFaceArt from '../../assets/memory-match/party-face-v1-card.webp';
import partyCakeArt from '../../assets/memory-match/party-cake-v1-card.webp';
import lollyArt from '../../assets/memory-match/lolly-v1-card.webp';
import chipsArt from '../../assets/memory-match/chips-v1-card.webp';
import wrappedSweetArt from '../../assets/memory-match/wrapped-sweet-v1-card.webp';
import foodCarrotArt from '../../assets/memory-match/food-carrot-v1-card.webp';
import foodCornArt from '../../assets/memory-match/food-corn-v1-card.webp';
import foodBiscuitArt from '../../assets/memory-match/food-biscuit-v1-card.webp';
import foodCheeseArt from '../../assets/memory-match/food-cheese-v1-card.webp';
import foodDrinkArt from '../../assets/memory-match/drink-v1-card.webp';
import dinosaurEggArt from '../../assets/memory-match/dinosaur-egg-v1.webp';
import dinosaurNestArt from '../../assets/memory-match/dinosaur-nest-v1-card.webp';
import volcanoArt from '../../assets/memory-match/volcano-v1.webp';
import ringedPlanetArt from '../../assets/memory-match/ringed-planet-v1-card.webp';
import crescentMoonArt from '../../assets/memory-match/crescent-moon-v1-card.webp';
import cometArt from '../../assets/memory-match/comet-v1-card.webp';
import satelliteArt from '../../assets/memory-match/satellite-v1-card.webp';
import earthArt from '../../assets/memory-match/earth-v1-card.webp';
import fullMoonArt from '../../assets/memory-match/full-moon-v1-card.webp';
import newMoonArt from '../../assets/memory-match/new-moon-v1-card.webp';
import sunArt from '../../assets/memory-match/sun-v1-card.webp';
import seedlingArt from '../../assets/memory-match/seedling-v1-card.webp';
import treeArt from '../../assets/memory-match/tree-v1-card.webp';
import leafSprigArt from '../../assets/memory-match/leaf-sprig-v1-card.webp';
import mushroomArt from '../../assets/memory-match/mushroom-v1-card.webp';
import duckArt from '../../assets/memory-match/duck-v1-card.webp';
import waterLilyArt from '../../assets/memory-match/water-lily-v1-card.webp';
import tulipArt from '../../assets/memory-match/tulip-v1-card.webp';
import mountainArt from '../../assets/memory-match/mountain-v1-card.webp';
import whaleArt from '../../assets/memory-match/whale-v1-card.webp';
import dolphinArt from '../../assets/memory-match/dolphin-v1-card.webp';
import sharkArt from '../../assets/memory-match/shark-v1-card.webp';
import turtleArt from '../../assets/memory-match/turtle-v1-card.webp';
import appleArt from '../../assets/memory-match/apple-v1-card.webp';
import bananaArt from '../../assets/memory-match/banana-v1-card.webp';
import grapesArt from '../../assets/memory-match/grapes-v1-card.webp';
import watermelonArt from '../../assets/memory-match/watermelon-v1-card.webp';
import flyingSaucerArt from '../../assets/memory-match/flying-saucer-v1-card.webp';
import alienArt from '../../assets/memory-match/alien-v1-card.webp';
import galaxyArt from '../../assets/memory-match/galaxy-v1-card.webp';
import telescopeArt from '../../assets/memory-match/telescope-v1-card.webp';
import starArt from '../../assets/memory-match/star-v1-card.webp';
import glowingStarArt from '../../assets/memory-match/glowing-star-v1-card.webp';
import shootingStarArt from '../../assets/memory-match/shooting-star-v1-card.webp';
import sunFaceArt from '../../assets/memory-match/sun-face-v1-card.webp';
import aeroplaneArt from '../../assets/memory-match/aeroplane-v1-card.webp';
import helicopterArt from '../../assets/memory-match/helicopter-v1-card.webp';
import steamTrainArt from '../../assets/memory-match/steam-train-v1-card.webp';
import passengerTrainArt from '../../assets/memory-match/passenger-train-v1-card.webp';
import busArt from '../../assets/memory-match/bus-v1-card.webp';
import tractorArt from '../../assets/memory-match/tractor-v1-card.webp';
import bicycleArt from '../../assets/memory-match/bicycle-v1-card.webp';
import scooterArt from '../../assets/memory-match/scooter-v1-card.webp';
import racingCarArt from '../../assets/memory-match/racing-car-v1-card.webp';
import speedboatArt from '../../assets/memory-match/speedboat-v1-card.webp';
import strawberryArt from '../../assets/memory-match/strawberry-v1-card.webp';
import pizzaArt from '../../assets/memory-match/pizza-v1-card.webp';
import doughnutArt from '../../assets/memory-match/doughnut-v1-card.webp';
import cupcakeArt from '../../assets/memory-match/cupcake-v1-card.webp';
import isolatedFrogArt from '../../assets/memory-match/isolated-frog-v1-card.webp';
import isolatedMonkeyArt from '../../assets/memory-match/isolated-monkey-v1-card.webp';
import astronautAmariArt from '../../assets/memory-match/astronaut-amari-v1-card.webp';
import moonRockArt from '../../assets/memory-match/moon-rock-v1-card.webp';
import fossilBoneArt from '../../assets/memory-match/fossil-bone-v1-card.webp';
import dinosaurToothArt from '../../assets/memory-match/dinosaur-tooth-v1-card.webp';
import fossilDigPickArt from '../../assets/memory-match/fossil-dig-pick-v1-card.webp';
import fossilRockArt from '../../assets/memory-match/fossil-rock-v1-card.webp';
import gardenBeeArt from '../../assets/memory-match/garden-bee-v1-card.webp';
import gardenButterflyArt from '../../assets/memory-match/garden-butterfly-v1-card.webp';
import gardenLadybirdArt from '../../assets/memory-match/garden-ladybird-v1-card.webp';
import gardenSnailArt from '../../assets/memory-match/garden-snail-v1-card.webp';
import gardenCaterpillarArt from '../../assets/memory-match/garden-caterpillar-v1-card.webp';
import gardenEarthwormArt from '../../assets/memory-match/garden-earthworm-v1-card.webp';
import gardenAntArt from '../../assets/memory-match/garden-ant-v1-card.webp';
import gardenSpiderArt from '../../assets/memory-match/garden-spider-v1-card.webp';
import jellyfishArt from '../../assets/memory-match/jellyfish-v1-card.webp';
import crabArt from '../../assets/memory-match/crab-v1-card.webp';
import squidArt from '../../assets/memory-match/squid-v1-card.webp';
import oceanFishArt from '../../assets/memory-match/ocean-fish-v1-card.webp';
import pondFishArt from '../../assets/memory-match/pond-fish-v1-card.webp';
import memoryCoachArt from '../../assets/little/askia-detective.webp';
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

const MEMORY_ASSET_BY_PATH = {
  'memory-match/dog-v1.webp': dogArt,
  'memory-match/fox-v1.webp': foxArt,
  'memory-match/party-balloon-v1-card.webp': partyBalloonArt,
  'memory-match/party-popper-v1-card.webp': partyPopperArt,
  'memory-match/party-face-v1-card.webp': partyFaceArt,
  'memory-match/party-cake-v1-card.webp': partyCakeArt,
  'memory-match/lolly-v1-card.webp': lollyArt,
  'memory-match/chips-v1-card.webp': chipsArt,
  'memory-match/wrapped-sweet-v1-card.webp': wrappedSweetArt,
  'memory-match/food-carrot-v1-card.webp': foodCarrotArt,
  'memory-match/food-corn-v1-card.webp': foodCornArt,
  'memory-match/food-biscuit-v1-card.webp': foodBiscuitArt,
  'memory-match/food-cheese-v1-card.webp': foodCheeseArt,
  'memory-match/drink-v1-card.webp': foodDrinkArt,
  'memory-match/dinosaur-egg-v1.webp': dinosaurEggArt,
  'memory-match/dinosaur-nest-v1-card.webp': dinosaurNestArt,
  'memory-match/volcano-v1.webp': volcanoArt,
  'memory-match/ringed-planet-v1-card.webp': ringedPlanetArt,
  'memory-match/crescent-moon-v1-card.webp': crescentMoonArt,
  'memory-match/comet-v1-card.webp': cometArt,
  'memory-match/satellite-v1-card.webp': satelliteArt,
  'memory-match/earth-v1-card.webp': earthArt,
  'memory-match/full-moon-v1-card.webp': fullMoonArt,
  'memory-match/new-moon-v1-card.webp': newMoonArt,
  'memory-match/sun-v1-card.webp': sunArt,
  'memory-match/seedling-v1-card.webp': seedlingArt,
  'memory-match/tree-v1-card.webp': treeArt,
  'memory-match/leaf-sprig-v1-card.webp': leafSprigArt,
  'memory-match/mushroom-v1-card.webp': mushroomArt,
  'memory-match/duck-v1-card.webp': duckArt,
  'memory-match/water-lily-v1-card.webp': waterLilyArt,
  'memory-match/tulip-v1-card.webp': tulipArt,
  'memory-match/mountain-v1-card.webp': mountainArt,
  'memory-match/whale-v1-card.webp': whaleArt,
  'memory-match/dolphin-v1-card.webp': dolphinArt,
  'memory-match/shark-v1-card.webp': sharkArt,
  'memory-match/turtle-v1-card.webp': turtleArt,
  'memory-match/apple-v1-card.webp': appleArt,
  'memory-match/banana-v1-card.webp': bananaArt,
  'memory-match/grapes-v1-card.webp': grapesArt,
  'memory-match/watermelon-v1-card.webp': watermelonArt,
  'memory-match/flying-saucer-v1-card.webp': flyingSaucerArt,
  'memory-match/alien-v1-card.webp': alienArt,
  'memory-match/galaxy-v1-card.webp': galaxyArt,
  'memory-match/telescope-v1-card.webp': telescopeArt,
  'memory-match/star-v1-card.webp': starArt,
  'memory-match/glowing-star-v1-card.webp': glowingStarArt,
  'memory-match/shooting-star-v1-card.webp': shootingStarArt,
  'memory-match/sun-face-v1-card.webp': sunFaceArt,
  'memory-match/aeroplane-v1-card.webp': aeroplaneArt,
  'memory-match/helicopter-v1-card.webp': helicopterArt,
  'memory-match/steam-train-v1-card.webp': steamTrainArt,
  'memory-match/passenger-train-v1-card.webp': passengerTrainArt,
  'memory-match/bus-v1-card.webp': busArt,
  'memory-match/tractor-v1-card.webp': tractorArt,
  'memory-match/bicycle-v1-card.webp': bicycleArt,
  'memory-match/scooter-v1-card.webp': scooterArt,
  'memory-match/racing-car-v1-card.webp': racingCarArt,
  'memory-match/speedboat-v1-card.webp': speedboatArt,
  'memory-match/strawberry-v1-card.webp': strawberryArt,
  'memory-match/pizza-v1-card.webp': pizzaArt,
  'memory-match/doughnut-v1-card.webp': doughnutArt,
  'memory-match/cupcake-v1-card.webp': cupcakeArt,
  'memory-match/isolated-frog-v1-card.webp': isolatedFrogArt,
  'memory-match/isolated-monkey-v1-card.webp': isolatedMonkeyArt,
  'memory-match/astronaut-amari-v1-card.webp': astronautAmariArt,
  'memory-match/moon-rock-v1-card.webp': moonRockArt,
  'memory-match/fossil-bone-v1-card.webp': fossilBoneArt,
  'memory-match/dinosaur-tooth-v1-card.webp': dinosaurToothArt,
  'memory-match/fossil-dig-pick-v1-card.webp': fossilDigPickArt,
  'memory-match/fossil-rock-v1-card.webp': fossilRockArt,
  'memory-match/garden-bee-v1-card.webp': gardenBeeArt,
  'memory-match/garden-butterfly-v1-card.webp': gardenButterflyArt,
  'memory-match/garden-ladybird-v1-card.webp': gardenLadybirdArt,
  'memory-match/garden-snail-v1-card.webp': gardenSnailArt,
  'memory-match/garden-caterpillar-v1-card.webp': gardenCaterpillarArt,
  'memory-match/garden-earthworm-v1-card.webp': gardenEarthwormArt,
  'memory-match/garden-ant-v1-card.webp': gardenAntArt,
  'memory-match/garden-spider-v1-card.webp': gardenSpiderArt,
  'memory-match/jellyfish-v1-card.webp': jellyfishArt,
  'memory-match/crab-v1-card.webp': crabArt,
  'memory-match/squid-v1-card.webp': squidArt,
  'memory-match/ocean-fish-v1-card.webp': oceanFishArt,
  'memory-match/pond-fish-v1-card.webp': pondFishArt,
  'little/detective-bronto.webp': brontoArt,
  'little/detective-trex.webp': trexArt,
  'little/fuel-rocket.webp': rocketArt,
  'little/rescue-firetruck.webp': fireEngineArt,
  'german-garage/friendly-car.png': friendlyCarArt,
};
const AMARI_CARD_ART = Object.fromEntries(Object.entries(MEMORY_CARD_ILLUSTRATIONS).map(([emoji, art]) => [
  emoji,
  { type: 'image', src: MEMORY_ASSET_BY_PATH[art.asset], className: art.className || 'memory-card-art-image' },
]));
const AMARI_CONTEXT_CARD_ART = Object.fromEntries(Object.entries(MEMORY_CARD_CONTEXT_ILLUSTRATIONS).map(([levelId, cards]) => [
  levelId,
  Object.fromEntries(Object.entries(cards).map(([emoji, art]) => [
    emoji,
    { type: 'image', src: MEMORY_ASSET_BY_PATH[art.asset], className: art.className || 'memory-card-art-image' },
  ])),
]));
const amariCardArt = (emoji, levelId) => AMARI_CONTEXT_CARD_ART[levelId]?.[emoji] || AMARI_CARD_ART[emoji];

const cardName = (emoji, levelId) => memoryCardLabel(emoji, levelId);
const spokenCardName = (emoji, levelId) => cardName(emoji, levelId);
const speakMemory = (speak, text) => speak(text, { premium: false });
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
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [levelIndex]);
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
    if (littleMode) speak('Find the matching pairs.');
    else speakMemory(speak, strategy);
  }, [levelIndex, level.name, littleMode, speak, strategy]);

  const finishLevel = (finalMatches, finalMoves) => {
    clearInterval(timerRef.current);
    const praise = getPraise();
    if (littleMode) speak('You matched them all. Fantastic memory!');
    else speakMemory(speak, 'You matched them all. Fantastic memory!');
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
      if (littleMode) speak('Find the matching pairs.');
      else speakMemory(speak, `You found the ${spokenCardName(deck[index].emoji, level.id)}. Remember where it is.`);
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
      if (littleMode) speak('Find the matching pairs.');
      else speakMemory(speak, `You matched the ${spokenCardName(deck[first].emoji, level.id)} pair.`);
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
        if (littleMode) speak('Those pictures are different. Try to remember where each one is.');
        else speakMemory(speak, 'Those pictures are different. Try to remember where each one is.');
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
    const art = memoryCardIllustration(card.emoji, level.id) ? amariCardArt(card.emoji, level.id) : null;
    return (
      <div key={card.id} style={{ perspective: '900px' }}>
        <button
          type="button"
          onClick={() => handleFlip(index)}
          disabled={card.matched || locked}
          aria-label={isFaceUp ? `${cardName(card.emoji, level.id)} card${card.matched ? ', matched' : ''}` : `Face-down memory card ${index + 1}`}
          className={littleMode ? `memory-little-card ${card.matched ? 'is-matched' : ''}` : `memory-card ${card.matched ? 'is-matched' : ''}`}
        >
          <div
            className={littleMode ? 'memory-little-card-inner' : 'memory-card-inner'}
            style={{
              transformStyle: 'preserve-3d',
              transform: isFaceUp ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            <div
              className={littleMode ? 'memory-little-card-back' : 'memory-card-side memory-card-back'}
              style={{ backfaceVisibility: 'hidden' }}
            >
              {littleMode ? <span aria-hidden="true" className="memory-little-paw">✦</span> : <><span className="memory-card-back-mark" aria-hidden="true">{level.cardMark || '✦'}</span><span className="memory-card-back-label" aria-hidden="true">AMARI</span></>}
            </div>
            <div
              aria-hidden={!isFaceUp}
              className={littleMode ? 'memory-little-card-front' : 'memory-card-side memory-card-front'}
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              {littleMode ? (ASKIA_CARD_ART[card.emoji]
                ? <img src={ASKIA_CARD_ART[card.emoji]} alt="" draggable="false" />
                : card.emoji === '⭐️'
                  ? <Star aria-hidden="true" className="memory-little-star-art" fill="currentColor" />
              : card.emoji) : isFaceUp ? <><span className="memory-card-art" aria-hidden="true">{art
                ? <img className={art.className} src={art.src} alt="" draggable="false" decoding="async" />
                : card.emoji}</span><span className="memory-card-label" aria-hidden="true">{cardName(card.emoji, level.id)}</span></> : null}
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
    <div className="memory-match-app" data-theme={level.scene || level.id}>
      <div className="memory-atmosphere" aria-hidden="true" />
      <header className="memory-topbar">
        <button
          onClick={onBack}
          className="game-icon-button"
          aria-label="Back to Thinking and Play"
        >
          <ArrowLeft />
        </button>
        <div className="memory-title-block">
          <span className="memory-eyebrow">AMARI’S MEMORY QUEST</span>
          <h2>Memory Match</h2>
          <p>Level {levelIndex + 1} of {levels.length}<span aria-hidden="true"> · </span><strong>{level.name}</strong></p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </header>

      <main className="memory-main">
        <section className="memory-coach" aria-label="Memory strategy">
          <div className="memory-coach-avatar"><img src={memoryCoachArt} alt="" /></div>
          <div className="memory-coach-copy">
            <span className="memory-coach-kicker"><Sparkles size={15} aria-hidden="true" /> YOUR MEMORY TIP</span>
            <p role="status">{strategy}</p>
          </div>
          <button type="button" onClick={() => speakMemory(speak, strategy)} className="memory-repeat-button" aria-label="Repeat the memory tip"><Volume2 size={21} aria-hidden="true" /></button>
        </section>

        <section className="memory-play-area" aria-label={`${level.name} memory board`}>
          <div className="memory-play-heading">
            <div className="memory-level-nav" aria-label="Memory levels">
              {levels.map((entry, index) => <button type="button" key={entry.id} disabled={index > getGameLevel(playerId, 'memory', levels.length).unlocked} onClick={() => startLevel(index)} aria-label={`Level ${index + 1}: ${entry.name}`} aria-current={index === levelIndex ? 'step' : undefined} className="memory-level-step">{index + 1}</button>)}
            </div>
            <div className="memory-stats" aria-label="Round statistics">
              <span><strong>{matches}</strong><small>PAIRS</small></span>
              <span><strong>{moves}</strong><small>MOVES</small></span>
              <span><strong>{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</strong><small>TIME</small></span>
              {bestTimes[level.id] && <span><strong>{Math.floor(bestTimes[level.id] / 60)}:{String(bestTimes[level.id] % 60).padStart(2, '0')}</strong><small>BEST</small></span>}
            </div>
          </div>

          <div className="memory-board" style={{ '--memory-columns': level.columns }}>
            {deck.map(renderCard)}
          </div>
          <div className="memory-board-footer">
            <p aria-label="Memory passport"><Star fill="currentColor" aria-hidden="true" />{Object.keys(passport).length}/{levels.length} board stickers collected</p>
          </div>
        </section>
        {saveWarning && <p role="status" className="memory-save-warning">{saveWarning}</p>}

        {showLevelComplete && (
          <div ref={completePanelRef} className="memory-complete-panel">
            <Star className="mx-auto mb-2 h-12 w-12 text-amber-500" fill="currentColor" aria-hidden="true" />
            <h3>{completionMessage}</h3>
            <p>Memory explorer: recalling a picture’s place helps you find its partner. Next time, try a row-by-row scan.</p>
            <button onClick={handleNextLevel}>
              {levelIndex < levels.length - 1 ? `Next level: ${levels[levelIndex + 1].name}` : 'Replay this level'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MemoryMatch;
