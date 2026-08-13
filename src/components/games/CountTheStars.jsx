import { useState, useEffect, useRef } from 'react';
import { Home } from 'lucide-react';
import { COUNT_LEVELS } from '../../data/index.js';
import { pickRandom, shuffle, getPraise } from '../../utils.js';
import { PracticeProgress, SoundToggle } from '../shared/index.jsx';
import { getDifficultyIndex, useGameDifficulty } from '../../hooks/useGameDifficulty.js';

const BACKGROUND_STARS = Array.from({ length: 20 }, (_, index) => ({
  id: `background-star-${index}`,
  size: 1 + (index % 3),
  top: `${(index * 37) % 100}%`,
  left: `${(index * 61) % 100}%`,
  delay: `${index % 4}s`,
}));

const makeCountingRound = (level) => {
  const count = Math.floor(Math.random() * level.max) + 1;
  const emoji = pickRandom(['⭐', '🌟', '💫', '✨', '🌙', '☀️', '🪐', '🔮']);
  return {
    count,
    items: Array.from({ length: count }, (_, index) => ({
      id: index,
      emoji,
      x: 10 + ((index * 31 + count * 13) % 75),
      y: 10 + ((index * 17 + count * 19) % 65),
      size: 0.9 + ((index + count) % 3) * 0.2,
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

const CountTheStars = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent }) => {
  const difficulty = useGameDifficulty('counting');
  const [levelIndex, setLevelIndex] = useState(() => getDifficultyIndex(difficulty));
  const level = COUNT_LEVELS[levelIndex];
  const [round, setRound] = useState(() => makeCountingRound(COUNT_LEVELS[0]));
  const [tapped, setTapped] = useState([]);
  const [phase, setPhase] = useState('count');
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);
  const [shake, setShake] = useState(false);
  const [skillRun, setSkillRun] = useState(0);
  const [locked, setLocked] = useState(false);
  const timeoutRef = useRef(null);
  const [hadMistake, setHadMistake] = useState(false);
  const { items, count: target } = round;

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const startRound = (nextLevelIndex = levelIndex) => {
    setRound(makeCountingRound(COUNT_LEVELS[nextLevelIndex]));
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
  }, [difficulty]); // eslint-disable-line react-hooks/exhaustive-deps

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
      setTimeout(() => speak(`How many did you count?`), 500);
    }
  };

  const handleAnswer = (ans) => {
    if (locked) return;
    if (ans === target) {
      const praise = getPraise();
      setFeedback(praise);
      setLocked(true);
      const nextStreak = streak + 1;
      playSfx('success');
      speak(praise);
      onCelebrate(praise, 4, 200);
      onGameEvent?.('counting', 'answer_correct', { skill: 'counting', item: target, response: ans, expected: target, correct: true, firstAttempt: !hadMistake, independent: true, difficulty });
      setStreak(nextStreak);
      setSkillRun((current) => Math.min(current + 1, 5));
      timeoutRef.current = setTimeout(() => {
        if (nextStreak % 5 === 0 && levelIndex < COUNT_LEVELS.length - 1) {
          const nextLevelIndex = levelIndex + 1;
          setLevelIndex(nextLevelIndex);
          playSfx('levelup');
          startRound(nextLevelIndex);
        } else {
          startRound();
        }
      }, 1100);
    } else {
      setHadMistake(true);
      setShake(true);
      playSfx('wrong');
      speak('Not quite, try again!');
      setFeedback('Try again!');
      timeoutRef.current = setTimeout(() => { setFeedback(''); setShake(false); }, 800);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {BACKGROUND_STARS.map((star) => (
          <div key={star.id} className="absolute bg-white rounded-full animate-pulse" style={{ width: star.size, height: star.size, top: star.top, left: star.left, animationDelay: star.delay }} />
        ))}
      </div>
      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white/20 p-3 rounded-full shadow-lg hover:scale-110 transition-transform" aria-label="Back to all games"><Home className="text-white" /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-white">Count the Stars</h2>
          <p className="text-white/60 font-semibold">{level.emoji} {level.name} · Streak: {streak}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10">
        <PracticeProgress skill="Count each object once" completed={skillRun} accent="indigo" />
        <div className="relative mb-4 h-[390px] w-full max-w-3xl rounded-[2.5rem] border-4 border-white/15 bg-white/5 shadow-[inset_0_0_50px_rgba(168,85,247,.18),0_20px_45px_rgba(0,0,0,.25)]">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTapItem(item.id)}
              className={`absolute transition-all duration-300 ${tapped.includes(item.id) ? 'scale-125 opacity-60' : 'hover:scale-110'}`}
              style={{ left: `${item.x}%`, top: `${item.y}%`, fontSize: `${item.size * 3.2}rem` }}
            >
              {item.emoji}
              {tapped.includes(item.id) && <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-black rounded-full w-6 h-6 flex items-center justify-center">{tapped.indexOf(item.id) + 1}</span>}
            </button>
          ))}
        </div>
        {phase === 'count' && <p className="text-white/80 text-xl font-semibold">Tap each one! {tapped.length}/{target}</p>}
        {phase === 'answer' && (
          <div className={`text-center ${shake ? 'animate-shake' : ''}`}>
            <p className="text-white text-xl font-bold mb-4">How many did you count?</p>
            <div className="flex gap-4 justify-center">
              {options.map((n) => (
                <button key={n} disabled={locked} onClick={() => handleAnswer(n)} className="w-16 h-16 bg-yellow-400 text-black text-2xl font-black rounded-2xl shadow-lg active:translate-y-1 transition-all disabled:opacity-60">{n}</button>
              ))}
            </div>
          </div>
        )}
        {feedback && <div className="mt-4 text-3xl font-black text-yellow-300 animate-bounce">{feedback}</div>}
      </div>
    </div>
  );
};

export default CountTheStars;
