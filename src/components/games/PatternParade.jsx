import { useState, useEffect } from 'react';
import { Home } from 'lucide-react';
import { PATTERN_TOKENS } from '../../data/index.js';
import { pickRandom, shuffle, getPraise } from '../../utils.js';
import { PracticeProgress, SoundToggle } from '../shared/index.jsx';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';
import { numberPatternPoolForDifficulty, patternPoolForDifficulty } from '../../data/gameDifficulty.js';

const makeEmojiRound = (difficulty) => {
  const allPatterns = patternPoolForDifficulty(difficulty);
  const pattern = pickRandom(allPatterns);
  const decoys = shuffle(PATTERN_TOKENS.filter((token) => token !== pattern.answer)).slice(0, 2);
  return { ...pattern, options: shuffle([pattern.answer, ...decoys]) };
};

const PatternParade = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent }) => {
  const difficulty = useGameDifficulty('pattern');
  const [mode, setMode] = useState('emoji');
  const [round, setRound] = useState(() => makeEmojiRound(difficulty));
  const [numRound, setNumRound] = useState(() => pickRandom(numberPatternPoolForDifficulty(difficulty)));
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);
  const [shake, setShake] = useState(false);
  const [skillRun, setSkillRun] = useState(0);
  const [locked, setLocked] = useState(false);

  const nextRound = (nextMode = mode) => {
    if (nextMode === 'emoji') {
      setRound(makeEmojiRound(difficulty));
    } else {
      setNumRound(pickRandom(numberPatternPoolForDifficulty(difficulty)));
    }
    setFeedback('');
    setLocked(false);
    setSkillRun((current) => current >= 5 ? 0 : current);
  };

  useEffect(() => {
    // Reset the current round when the adaptive band changes so advanced
    // patterns cannot leak into a starter round (or vice versa).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    nextRound(mode);
  }, [difficulty]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentLabel = mode === 'emoji' ? round.label : numRound.label;

  useEffect(() => {
    speak(`What comes next? ${currentLabel}`);
  }, [currentLabel, speak]);

  const handlePick = (option) => {
    if (locked) return;
    const correctAnswer = mode === 'emoji' ? round.answer : numRound.answer;
    if (option === correctAnswer) {
      const praise = getPraise();
      const rule = mode === 'emoji' ? round.rule : numRound.rule;
      setFeedback(`${praise} Rule: ${rule}`);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setSkillRun((current) => Math.min(current + 1, 5));
      setLocked(true);
      playSfx('sparkle');
      if (newStreak >= 3) playSfx('combo');
      onCelebrate(newStreak === 5 ? 'Five in a row — Super Star bonus!' : praise, newStreak === 5 ? 14 : 4, 250);
      onGameEvent?.('pattern', 'answer_correct');
      speak(`The rule is ${rule}`);
      setTimeout(nextRound, 2200);
    } else {
      setFeedback('Try again!');
      setShake(true);
      setStreak(0);
      playSfx('oops');
      setTimeout(() => setShake(false), 450);
    }
  };

  const currentOptions = mode === 'emoji' ? round.options : numRound.options;
  const currentSequence = mode === 'emoji' ? round.sequence : numRound.sequence;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-100 via-yellow-100 to-amber-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-8 w-52 h-32 bg-white/60 rounded-full blur-2xl" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-amber-300/40 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform" aria-label="Back to all games"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-amber-700">Pattern Parade</h2>
          <p className="text-amber-700/70 font-semibold">Streak: {streak}</p>
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

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 relative z-10">
        <PracticeProgress skill={mode === 'emoji' ? 'Spot the repeating pattern' : 'Find the number rule'} completed={skillRun} accent="amber" />
        <div className="flex gap-2 mb-4">
          {[{ id: 'emoji', label: '🔷 Shapes' }, { id: 'number', label: '🔢 Numbers' }].map((m) => (
            <button key={m.id} onClick={() => { setMode(m.id); nextRound(m.id); playSfx('click'); }}
              className={`px-4 py-2 rounded-full font-bold text-sm ${mode === m.id ? 'bg-amber-600 text-white' : 'bg-white text-amber-700'}`}>{m.label}</button>
          ))}
        </div>

        <button onClick={() => speak(`What comes next? ${currentLabel}`)} className="mb-4 text-amber-700 font-semibold">🔊 Hear the pattern</button>

        <div className={`mb-5 w-full max-w-4xl rounded-[2.5rem] border-4 border-amber-200 bg-white/90 p-8 shadow-xl ${shake ? 'animate-shake' : ''}`}>
          <div className="flex items-center justify-center gap-5 text-5xl flex-wrap">
            {currentSequence.map((token, index) => (
              <div key={`${token}-${index}`} className="flex h-16 w-16 items-center justify-center font-black">{token}</div>
            ))}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-dashed border-amber-300 text-3xl">?</div>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap justify-center">
          {currentOptions.map((option) => (
            <button key={option} disabled={locked} onClick={() => handlePick(option)}
              className="flex h-24 w-28 items-center justify-center rounded-3xl border-4 border-amber-200 bg-white text-5xl font-black shadow-lg transition hover:-translate-y-1">{option}</button>
          ))}
        </div>

        {feedback && <div className="mt-4 max-w-xl rounded-2xl bg-white/90 px-5 py-3 text-center text-xl font-bold text-amber-700 shadow-md" aria-live="polite">{feedback}</div>}
      </div>
    </div>
  );
};

export default PatternParade;
