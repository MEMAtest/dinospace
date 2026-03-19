import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Home } from 'lucide-react';
import { COUNT_LEVELS, VISUAL_EMOJIS } from '../../data/index.js';
import { pickRandom, shuffle } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';

const CountTheStars = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = COUNT_LEVELS[levelIndex];
  const [items, setItems] = useState([]);
  const [tapped, setTapped] = useState([]);
  const [target, setTarget] = useState(0);
  const [phase, setPhase] = useState('count');
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);
  const [shake, setShake] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const generateRound = useCallback(() => {
    const count = Math.ceil(Math.random() * level.max) + 1;
    const emojis = ['⭐', '🌟', '💫', '✨', '🌙', '☀️', '🪐', '🔮'];
    const emoji = pickRandom(emojis);
    const newItems = Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji,
      x: 10 + Math.random() * 75,
      y: 10 + Math.random() * 65,
      size: 0.8 + Math.random() * 0.6,
    }));
    setItems(newItems);
    setTarget(count);
    setTapped([]);
    setPhase('count');
    setFeedback('');
  }, [level.max]);

  useEffect(() => { generateRound(); }, [generateRound, levelIndex]);

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
      setTimeout(() => speak(`How many did you count?`), 500);
    }
  };

  const options = useMemo(() => {
    if (phase !== 'answer') return [];
    const set = new Set([target]);
    while (set.size < 4) {
      const delta = Math.ceil(Math.random() * 3);
      const sign = Math.random() > 0.5 ? 1 : -1;
      set.add(Math.max(1, target + sign * delta));
    }
    return shuffle(Array.from(set));
  }, [target, phase]);

  const handleAnswer = (ans) => {
    if (ans === target) {
      const praise = getPraise();
      setFeedback(praise);
      playSfx('success');
      speak(praise);
      onCelebrate(praise, 6, 200);
      setStreak((s) => {
        const next = s + 1;
        timeoutRef.current = setTimeout(() => {
          if (next > 0 && next % 5 === 0 && levelIndex < COUNT_LEVELS.length - 1) {
            setLevelIndex((p) => p + 1);
            playSfx('levelup');
          } else {
            generateRound();
          }
        }, 1800);
        return next;
      });
    } else {
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
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="absolute bg-white rounded-full animate-pulse" style={{ width: Math.random() * 2 + 1, height: Math.random() * 2 + 1, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s` }} />
        ))}
      </div>
      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white/20 p-3 rounded-full shadow-lg hover:scale-110 transition-transform"><Home className="text-white" /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-white">Count the Stars</h2>
          <p className="text-white/60 font-semibold">{level.emoji} {level.name} · Streak: {streak}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10">
        <div className="relative w-full max-w-md aspect-square bg-white/5 rounded-3xl border-2 border-white/10 mb-6">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTapItem(item.id)}
              className={`absolute transition-all duration-300 ${tapped.includes(item.id) ? 'scale-125 opacity-60' : 'hover:scale-110'}`}
              style={{ left: `${item.x}%`, top: `${item.y}%`, fontSize: `${item.size * 2.5}rem` }}
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
                <button key={n} onClick={() => handleAnswer(n)} className="w-16 h-16 bg-yellow-400 text-black text-2xl font-black rounded-2xl shadow-lg active:translate-y-1 transition-all">{n}</button>
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
