import { useState, useEffect, useRef } from 'react';
import { COUNT_LEVELS } from '../../data/index.js';
import { pickRandom, shuffle, getPraise } from '../../utils.js';
import { FocusMenu } from '../shared/FocusMenu.jsx';
import { getDifficultyIndex, useGameDifficulty } from '../../hooks/useGameDifficulty.js';

const makeCountingRound = (level) => {
  const count = Math.floor(Math.random() * level.max) + 1;
  const emoji = pickRandom(['⭐', '🌟']);
  // Use a loose grid instead of independent random coordinates. This keeps
  // the targets distinct on a phone as well as on a tablet, while the small
  // jitter stops every round feeling identical.
  const columns = Math.min(5, Math.max(2, Math.ceil(Math.sqrt(count * 1.35))));
  const rows = Math.ceil(count / columns);
  return {
    count,
    items: Array.from({ length: count }, (_, index) => ({
      id: index,
      emoji,
      x: 12 + ((index % columns) * (76 / Math.max(columns - 1, 1))) + ((index * 7) % 5 - 2),
      y: 16 + (Math.floor(index / columns) * (60 / Math.max(rows - 1, 1))) + ((index * 11) % 5 - 2),
    })),
  };
};

const makeCountOptions = (target) => {
  const candidates = [target];
  for (let offset = 1; candidates.length < 4; offset += 1) {
    if (target - offset >= 1) candidates.push(target - offset);
    if (candidates.length < 4) candidates.push(target + offset);
  }
  return shuffle(candidates);
};

const CountTheStars = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent, onReviewComplete, littleMode = false, sessionLevel = 0, sessionTarget, sessionSaveError }) => {
  const difficulty = useGameDifficulty('counting');
  const [levelIndex, setLevelIndex] = useState(() => getDifficultyIndex(difficulty));
  const littleMax = [3, 5, 7][sessionLevel] || 3;
  const [round, setRound] = useState(() => makeCountingRound(littleMode ? { max: littleMax } : COUNT_LEVELS[getDifficultyIndex(difficulty)]));
  const [tapped, setTapped] = useState([]);
  const [phase, setPhase] = useState('count');
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [skillRun, setSkillRun] = useState(0);
  const [locked, setLocked] = useState(false);
  const timeoutRef = useRef(null);
  const [hadMistake, setHadMistake] = useState(false);
  const { items, count: target } = round;

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const startRound = (nextLevelIndex = levelIndex) => {
    setRound(makeCountingRound(littleMode ? { max: littleMax } : COUNT_LEVELS[nextLevelIndex]));
    setTapped([]);
    setPhase('count');
    setOptions([]);
    setFeedback('');
    setLocked(false);
    setHadMistake(false);
    setSkillRun((current) => current >= 5 ? 0 : current);
  };

  useEffect(() => {
    const nextLevelIndex = getDifficultyIndex(difficulty);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLevelIndex(nextLevelIndex);
    startRound(nextLevelIndex);
  }, [difficulty, littleMode, sessionLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase === 'count') speak('Tap each star to count them!');
  }, [phase, speak]);

  const handleTapItem = (id) => {
    if (phase !== 'count' || tapped.includes(id)) return;
    const next = [...tapped, id];
    setTapped(next);
    playSfx('tap');
    speak(`${next.length}`);
    if (next.length === target) {
      setPhase('answer');
      setOptions(makeCountOptions(target));
      timeoutRef.current = setTimeout(() => speak('How many did you count?'), 400);
    }
  };

  const handleAnswer = (ans) => {
    if (locked) return;
    clearTimeout(timeoutRef.current);
    if (ans === target) {
      const praise = getPraise();
      setFeedback(praise);
      setLocked(true);
      const nextStreak = streak + 1;
      playSfx('success');
      speak(praise);
      onCelebrate(nextStreak === 5 ? 'Five in a row — Super Star bonus!' : praise, nextStreak === 5 ? 14 : 4, 200);
      onGameEvent?.('counting', 'answer_correct', { skill: 'counting', item: target, response: ans, expected: target, correct: true, firstAttempt: !hadMistake, independent: !hadMistake, difficulty, deferFinish: Boolean(onReviewComplete) });
      setStreak(nextStreak);
      setSkillRun((current) => Math.min(current + 1, 5));
    } else {
      setHadMistake(true);
      setStreak(0);
      playSfx('wrong');
      speak('Not quite, try again!');
      setFeedback('Try again. Count each star once.');
    }
  };

  const finalReview = Boolean(sessionTarget && skillRun >= sessionTarget);
  const showNext = () => {
    if (finalReview) { onReviewComplete?.(); return; }
    if (!littleMode && streak > 0 && streak % 5 === 0 && levelIndex < COUNT_LEVELS.length - 1) {
      const nextLevel = levelIndex + 1;
      setLevelIndex(nextLevel);
      playSfx('levelup');
      startRound(nextLevel);
    } else {
      startRound();
    }
  };
  const resetCount = () => {
    clearTimeout(timeoutRef.current);
    setPhase('count');
    setTapped([]);
    setOptions([]);
    setFeedback('');
  };
  const closeOptions = () => setOptionsOpen(false);
  const menuOptions = [
    ...(soundOn && !locked ? [{
      label: phase === 'count' ? 'Hear how to count' : 'Hear the question',
      action: () => { closeOptions(); speak(phase === 'count' ? 'Tap each star to count them!' : 'How many did you count?'); },
    }] : []),
    { label: soundOn ? 'Turn sound off' : 'Turn sound on', action: () => { clearTimeout(timeoutRef.current); onToggleSound?.(); closeOptions(); } },
    { label: littleMode ? 'Go home' : 'Back to Maths Missions', action: onBack },
  ];

  return <div className="focus-game little-stars-focus" data-board-focus="">
    <main className={`focus-game-body${optionsOpen ? ' is-menu' : ''}`}>
      <header className="focus-game-heading">
        {!optionsOpen && <p>Count the Stars</p>}
        <h1>{optionsOpen ? 'Count the Stars' : locked ? `You counted ${target}!` : phase === 'answer' ? 'How many did you count?' : 'Tap each star'}</h1>
      </header>
      {optionsOpen ? <FocusMenu choices={menuOptions} onBack={closeOptions} /> : <>
        <div className="little-stars-board" aria-label="Counting board">
          {items.map(item => {
            const count = tapped.indexOf(item.id) + 1;
            return <button key={item.id} type="button" onClick={() => handleTapItem(item.id)}
              aria-label={`Object ${item.id + 1}${count ? `, counted ${count}` : ''}`} aria-pressed={Boolean(count)}
              disabled={phase !== 'count'} style={{ left: `${item.x}%`, top: `${item.y}%` }}>
              <span aria-hidden="true">{item.emoji}</span>{count > 0 && <span className="little-stars-number" aria-hidden="true">{count}</span>}
            </button>;
          })}
        </div>
        {phase === 'count' && <p className="focus-game-message" aria-live="polite">{tapped.length} counted</p>}
        {phase === 'answer' && !locked && <div className="little-stars-choices" aria-label="Choose how many">
          {options.map(number => <button key={number} type="button" className="focus-game-button" onClick={() => handleAnswer(number)}>{number}</button>)}
        </div>}
        {feedback && <p className={locked ? 'pattern-focus-explanation' : 'focus-game-message'} role="status">{locked ? `There ${target === 1 ? 'is 1 object' : `are ${target} stars`}. Count each one once.` : feedback}</p>}
        {sessionSaveError && <p className="focus-game-message" role="alert">{sessionSaveError}</p>}
        <div className="focus-game-actions mt-3">
          {locked ? <button type="button" className="focus-game-button is-primary" onClick={showNext}>{sessionSaveError ? 'Retry save' : finalReview ? 'Finish level' : 'Next round'}</button>
            : phase === 'answer' && <button type="button" className="focus-game-button" onClick={resetCount}>Count again</button>}
          <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
        </div>
      </>}
    </main>
  </div>;
};

export default CountTheStars;
