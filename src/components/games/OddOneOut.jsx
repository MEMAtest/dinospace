import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Home } from 'lucide-react';
import { ODD_ONE_OUT_ROUNDS } from '../../data/index.js';
import { pickRandom, shuffle } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';

const OddOneOut = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [roundIndex, setRoundIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const round = ODD_ONE_OUT_ROUNDS[roundIndex % ODD_ONE_OUT_ROUNDS.length];
  const shuffledItems = useMemo(() => shuffle(round.items), [round]);

  useEffect(() => {
    setFeedback('');
    speak(`Which one does not belong? ${round.hint}`);
  }, [roundIndex, round.hint, speak]);

  const handlePick = (item) => {
    if (item === round.odd) {
      const praise = getPraise();
      setFeedback(`${praise} ${item} is the odd one out!`);
      setScore((s) => s + 1);
      playSfx('success');
      speak(`${praise} ${item} doesn't belong with the ${round.category}!`);
      onCelebrate(praise, 8, 200);
      setTimeout(() => setRoundIndex((i) => i + 1), 2000);
    } else {
      setShake(true);
      playSfx('wrong');
      setFeedback(`${round.hint}`);
      setTimeout(() => { setShake(false); setFeedback(''); }, 1200);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-lime-100 via-yellow-100 to-lime-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 right-8 w-40 h-40 bg-white/70 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-lime-200/60 rounded-full blur-3xl" />
      </div>
      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform" aria-label="Go back to menu"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-lime-700">Odd One Out</h2>
          <p className="text-lime-700/70 font-semibold">Score: {score}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10">
        <p className="text-2xl font-bold text-slate-700 mb-2">Which one doesn't belong?</p>
        <p className="text-slate-500 font-semibold mb-8">{round.hint}</p>
        <div className={`grid grid-cols-2 gap-6 w-full max-w-sm ${shake ? 'animate-shake' : ''}`}>
          {shuffledItems.map((item, i) => (
            <button key={`${item}-${i}`} onClick={() => handlePick(item)}
              className="aspect-square bg-white rounded-3xl shadow-xl border-4 border-lime-200 flex items-center justify-center text-7xl hover:-translate-y-2 active:translate-y-1 transition-all">{item}</button>
          ))}
        </div>
        {feedback && <div className="mt-6 text-xl font-black text-lime-700 animate-bounce text-center">{feedback}</div>}
      </div>
    </div>
  );
};

export default OddOneOut;
