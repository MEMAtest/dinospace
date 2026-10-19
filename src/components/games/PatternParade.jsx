import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { PATTERN_ROUNDS, PATTERN_TOKENS } from '../../data/index.js';
import { pickRandom, shuffle, getPraise } from '../../utils.js';
import { PracticeProgress, SoundToggle } from '../shared/index.jsx';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';
import { numberPatternPoolForDifficulty, patternPoolForDifficulty } from '../../data/gameDifficulty.js';
import { ASKIA_PATTERN_INDEXES } from '../../data/sessionLevels.js';
import paradeScene from '../../assets/game-scenes/pattern-parade.webp';
import './amariScenes.css';

const makeEmojiRound = (difficulty, littleMode = false, sessionLevel = 0) => {
  // Askia's three levels change the repeating rule, while staying with
  // familiar pictures and spoken prompts.
  const allPatterns = littleMode
    ? ASKIA_PATTERN_INDEXES[sessionLevel % ASKIA_PATTERN_INDEXES.length].map((index) => PATTERN_ROUNDS[index])
    : patternPoolForDifficulty(difficulty);
  const pattern = pickRandom(allPatterns);
  const decoys = shuffle(PATTERN_TOKENS.filter((token) => token !== pattern.answer)).slice(0, 2);
  return { ...pattern, options: shuffle([pattern.answer, ...decoys]) };
};

const PatternParade = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent, onReviewComplete, sessionTarget = 0, littleMode = false, sessionLevel = 0 }) => {
  const currentDifficulty = useGameDifficulty('pattern');
  const [difficulty] = useState(currentDifficulty);
  const [mode, setMode] = useState('emoji');
  const [round, setRound] = useState(() => makeEmojiRound(difficulty, littleMode, sessionLevel));
  const [numRound, setNumRound] = useState(() => pickRandom(numberPatternPoolForDifficulty(difficulty)));
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [shake, setShake] = useState(false);
  const [skillRun, setSkillRun] = useState(0);
  const [locked, setLocked] = useState(false);
  const [hadMistake, setHadMistake] = useState(false);
  const modeRef = useRef(mode);

  const nextRound = (nextMode = mode) => {
    if (nextMode === 'emoji') {
      setRound(makeEmojiRound(difficulty, littleMode, sessionLevel));
    } else {
      setNumRound(pickRandom(numberPatternPoolForDifficulty(difficulty)));
    }
    setFeedback('');
    setLocked(false);
    setHadMistake(false);
    setSkillRun((current) => current >= 5 ? 0 : current);
  };

  useEffect(() => {
    // A level or Askia mode change starts a fresh question from the run's
    // frozen difficulty pool.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    nextRound(mode);
  }, [littleMode, sessionLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentLabel = mode === 'emoji' ? round.label : numRound.label;
  const progressTarget = sessionTarget || 5;
  const progressCompleted = sessionTarget > 0 ? completedCount : skillRun;

  useEffect(() => {
    speak(`What comes next? ${currentLabel}`);
  }, [currentLabel, speak]);

  const handlePick = (option) => {
    if (locked) return;
    const correctAnswer = mode === 'emoji' ? round.answer : numRound.answer;
    const attempt = { skill: 'pattern', item: currentLabel, response: option, expected: correctAnswer, firstAttempt: !hadMistake, independent: !hadMistake, hints: 0, difficulty };
    if (option === correctAnswer) {
      const praise = getPraise();
      const rule = mode === 'emoji' ? round.rule : numRound.rule;
      setFeedback(`${praise} Rule: ${rule}`);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setSkillRun((current) => Math.min(current + 1, 5));
      setCompletedCount((current) => current + 1);
      setLocked(true);
      playSfx('sparkle');
      if (newStreak >= 3) playSfx('combo');
      onCelebrate(newStreak === 5 ? 'Five in a row — Super Star bonus!' : praise, newStreak === 5 ? 14 : 4, 250);
      onGameEvent?.('pattern', 'answer_correct', { ...attempt, correct: true, deferFinish: sessionTarget > 0 && completedCount + 1 >= sessionTarget });
      speak(`The rule is ${rule}`);
    } else {
      onGameEvent?.('pattern', 'answer_wrong', { ...attempt, correct: false });
      setHadMistake(true);
      setFeedback('Try again!');
      setShake(true);
      setStreak(0);
      playSfx('oops');
      setTimeout(() => setShake(false), 450);
    }
  };

  const handleNext = () => {
    if (sessionTarget > 0 && completedCount >= sessionTarget) onReviewComplete?.();
    else nextRound(modeRef.current);
  };

  const currentOptions = mode === 'emoji' ? round.options : numRound.options;
  const currentSequence = mode === 'emoji' ? round.sequence : numRound.sequence;

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden ${littleMode ? 'bg-gradient-to-b from-amber-100 via-yellow-100 to-amber-200' : 'amari-scene'}`} style={littleMode ? undefined : { '--scene-image': `url("${paradeScene}")` }}>

      <div className="amari-scene-header z-20">
        <button onClick={onBack} className="game-icon-button" aria-label="Back to home"><ArrowLeft /></button>
        <div className={littleMode ? 'text-center' : 'amari-scene-title'}>
          <h2 className={littleMode ? 'text-3xl font-black text-amber-700' : 'text-lg sm:text-2xl'}>⭐ Pattern Parade</h2>
          {!littleMode && <p className="text-xs text-sky-100">Streak: {streak}</p>}
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      {streak >= 2 && (
        <div className="text-center z-20 animate-count-up">
          <span className="text-2xl font-black text-amber-600">
            {streak >= 4 ? '🔥'.repeat(streak) : '⚡'.repeat(streak)} {streak}!
          </span>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-3 pb-6 relative z-10">
        {sessionTarget > 0
          ? <p className="mb-4 rounded-full bg-white/80 px-4 py-2 text-sm font-black text-amber-800" aria-live="polite">Answers completed: {completedCount} of {sessionTarget}</p>
          : !littleMode && <div className="rounded-full bg-white/90 px-3 shadow-lg"><PracticeProgress skill={mode === 'emoji' ? 'Spot the repeating pattern' : 'Find the number rule'} completed={progressCompleted} target={progressTarget} accent="amber" /></div>}
        <div className={`mb-4 flex gap-2 ${littleMode ? 'hidden' : ''}`}>
          {[{ id: 'emoji', label: '🔷 Shapes' }, { id: 'number', label: '🔢 Numbers' }].map((m) => (
            <button key={m.id} disabled={locked} onClick={() => { modeRef.current = m.id; setMode(m.id); nextRound(m.id); playSfx('click'); }}
              className={`min-h-11 rounded-full border-2 border-white px-4 py-2 text-sm font-black shadow-lg disabled:cursor-not-allowed disabled:opacity-50 ${mode === m.id ? 'bg-amber-600 text-white' : 'bg-white text-amber-700'}`}>{m.label}</button>
          ))}
        </div>

        <button onClick={() => speak(`What comes next? ${currentLabel}`)} className="amari-scene-prompt mb-4 inline-flex min-h-14 items-center gap-2 px-5 text-xl"><Volume2 size={22} /> What comes next?</button>

        <div className={`amari-scene-card mb-5 w-full max-w-4xl p-3 sm:p-7 ${shake ? 'animate-shake' : ''}`}>
          <div className="flex items-center justify-center gap-1.5 text-4xl sm:gap-3 sm:text-5xl flex-wrap">
            {currentSequence.map((token, index) => (
              <div key={`${token}-${index}`} className="amari-choice flex h-14 w-14 items-center justify-center font-black sm:h-20 sm:w-20">{token}</div>
            ))}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-dashed border-amber-400 bg-yellow-50 text-4xl font-black text-purple-600 sm:h-20 sm:w-20">?</div>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap justify-center">
          {currentOptions.map((option) => (
            <button key={option} disabled={locked} onClick={() => handlePick(option)}
              className="amari-choice flex h-20 w-24 items-center justify-center text-5xl sm:h-24 sm:w-28">{option}</button>
          ))}
        </div>

        {feedback && <div className="amari-scene-card mt-4 max-w-xl px-5 py-3 text-center text-lg font-black text-blue-900" aria-live="polite">{feedback}</div>}
        {locked && <button type="button" onClick={handleNext} className="mt-4 rounded-full bg-amber-600 px-10 py-3 text-lg font-black text-white shadow-lg hover:bg-amber-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-indigo-700">Next</button>}
      </div>
    </div>
  );
};

export default PatternParade;
