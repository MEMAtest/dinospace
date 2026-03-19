import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Home } from 'lucide-react';
import { ADVANCED_PATTERN_ROUNDS, NUMBER_PATTERN_ROUNDS } from '../../data/index.js';
import { pickRandom, shuffle, buildPatternRound } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';

const PatternParade = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [mode, setMode] = useState('emoji');
  const [round, setRound] = useState(buildPatternRound);
  const [numRound, setNumRound] = useState(() => pickRandom(NUMBER_PATTERN_ROUNDS));
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);
  const [shake, setShake] = useState(false);

  const nextRound = () => {
    if (mode === 'emoji') {
      const allPatterns = [...PATTERN_ROUNDS, ...ADVANCED_PATTERN_ROUNDS];
      const r = pickRandom(allPatterns);
      const decoys = shuffle(PATTERN_TOKENS.filter((t) => t !== r.answer)).slice(0, 2);
      setRound({ ...r, options: shuffle([r.answer, ...decoys]) });
    } else {
      setNumRound(pickRandom(NUMBER_PATTERN_ROUNDS));
    }
    setFeedback('');
  };

  const currentLabel = mode === 'emoji' ? round.label : numRound.label;

  useEffect(() => {
    speak(`What comes next? ${currentLabel}`);
  }, [currentLabel, speak]);

  const handlePick = (option) => {
    const correctAnswer = mode === 'emoji' ? round.answer : numRound.answer;
    if (option === correctAnswer) {
      const praise = getPraise();
      setFeedback(praise);
      const newStreak = streak + 1;
      setStreak(newStreak);
      playSfx('sparkle');
      if (newStreak >= 3) playSfx('combo');
      onCelebrate(praise, 6, 250);
      setTimeout(nextRound, 1400);
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
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"><Home /></button>
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
        <div className="flex gap-2 mb-4">
          {[{ id: 'emoji', label: '🔷 Shapes' }, { id: 'number', label: '🔢 Numbers' }].map((m) => (
            <button key={m.id} onClick={() => { setMode(m.id); nextRound(); playSfx('click'); }}
              className={`px-4 py-2 rounded-full font-bold text-sm ${mode === m.id ? 'bg-amber-600 text-white' : 'bg-white text-amber-700'}`}>{m.label}</button>
          ))}
        </div>

        <button onClick={() => speak(`What comes next? ${currentLabel}`)} className="mb-4 text-amber-700 font-semibold">🔊 Hear the pattern</button>

        <div className={`bg-white/90 rounded-3xl p-6 shadow-xl border-4 border-amber-200 mb-6 ${shake ? 'animate-shake' : ''}`}>
          <div className="flex items-center gap-4 text-4xl flex-wrap justify-center">
            {currentSequence.map((token, index) => (
              <div key={`${token}-${index}`} className="w-12 h-12 flex items-center justify-center font-black">{token}</div>
            ))}
            <div className="w-12 h-12 rounded-2xl border-4 border-dashed border-amber-300 flex items-center justify-center text-2xl">?</div>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap justify-center">
          {currentOptions.map((option) => (
            <button key={option} onClick={() => handlePick(option)}
              className="w-20 h-20 bg-white text-4xl font-black rounded-3xl shadow-lg border-4 border-amber-200 hover:-translate-y-1 transition flex items-center justify-center">{option}</button>
          ))}
        </div>

        {feedback && <div className="mt-4 text-xl font-bold text-amber-700 animate-bounce">{feedback}</div>}
      </div>
    </div>
  );
};

export default PatternParade;
