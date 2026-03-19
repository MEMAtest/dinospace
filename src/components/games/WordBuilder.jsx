import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Home } from 'lucide-react';
import { WORD_BUILDER_WORDS } from '../../data/index.js';
import { pickRandom, shuffle } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';

const WordBuilder = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [typed, setTyped] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [scrambled, setScrambled] = useState([]);
  const word = WORD_BUILDER_WORDS[wordIndex];

  useEffect(() => {
    const letters = word.word.split('').map((l, i) => ({ letter: l, id: `${l}-${i}` }));
    setScrambled(shuffle(letters));
    setTyped([]);
    setFeedback('');
    speak(`Spell the word: ${word.word}. ${word.hint}`);
  }, [wordIndex, word, speak]);

  const handleLetterTap = (item) => {
    const next = [...typed, item];
    setTyped(next);
    setScrambled((prev) => prev.filter((s) => s.id !== item.id));
    playSfx('tap');
    speak(item.letter);
    if (next.length === word.word.length) {
      const spelled = next.map((t) => t.letter).join('');
      if (spelled === word.word) {
        const praise = getPraise();
        setFeedback(praise);
        setScore((s) => s + 1);
        playSfx('success');
        speak(`${word.word}! ${praise}`);
        onCelebrate(praise, 8, 300);
        setTimeout(() => setWordIndex((i) => (i + 1) % WORD_BUILDER_WORDS.length), 2000);
      } else {
        setShake(true);
        playSfx('wrong');
        setFeedback('Oops! Try again');
        setTimeout(() => {
          setShake(false);
          setFeedback('');
          const letters = word.word.split('').map((l, i) => ({ letter: l, id: `${l}-${i}` }));
          setScrambled(shuffle(letters));
          setTyped([]);
        }, 1200);
      }
    }
  };

  const handleUndo = () => {
    if (typed.length === 0) return;
    const last = typed[typed.length - 1];
    setTyped((prev) => prev.slice(0, -1));
    setScrambled((prev) => [...prev, last]);
    playSfx('click');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cyan-100 via-sky-100 to-blue-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 right-8 w-40 h-40 bg-white/70 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-200/60 rounded-full blur-3xl" />
      </div>
      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform" aria-label="Go back to menu"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-cyan-700">Word Builder</h2>
          <p className="text-cyan-700/70 font-semibold">Words: {score}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10">
        <div className="text-7xl mb-4">{word.emoji}</div>
        <p className="text-slate-600 font-semibold mb-2">{word.hint}</p>
        <button onClick={() => speak(`Spell ${word.word}. ${word.hint}`)} className="mb-4 text-cyan-600 font-semibold">🔊 Hear the word</button>
        <div className={`flex gap-3 mb-8 ${shake ? 'animate-shake' : ''}`}>
          {word.word.split('').map((_, i) => (
            <div key={i} className={`w-16 h-16 rounded-2xl border-4 flex items-center justify-center text-3xl font-black transition-all ${typed[i] ? 'bg-cyan-500 text-white border-cyan-600 scale-110' : 'bg-white border-dashed border-slate-300 text-slate-300'}`}>
              {typed[i]?.letter || ''}
            </div>
          ))}
        </div>
        <div className="flex gap-3 flex-wrap justify-center mb-4">
          {scrambled.map((item) => (
            <button key={item.id} onClick={() => handleLetterTap(item)}
              className="w-16 h-16 bg-white text-cyan-700 text-3xl font-black rounded-2xl shadow-lg border-4 border-cyan-200 hover:-translate-y-1 active:translate-y-1 transition-all">{item.letter}</button>
          ))}
        </div>
        {typed.length > 0 && (
          <button onClick={handleUndo} className="text-cyan-600 font-bold text-sm">↩️ Undo</button>
        )}
        {feedback && <div className="mt-4 text-2xl font-black text-cyan-600 animate-bounce">{feedback}</div>}
      </div>
    </div>
  );
};

export default WordBuilder;
