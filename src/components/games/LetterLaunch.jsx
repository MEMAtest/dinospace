import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Home } from 'lucide-react';
import { buildLetterRound, getPraise } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';

const LetterLaunch = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [round, setRound] = useState(buildLetterRound);
  const [launching, setLaunching] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [stars, setStars] = useState(0);

  const promptText = `${round.target.letter}. ${round.target.letter} is for ${round.target.word}.`;

  const sayPrompt = useCallback(() => {
    speak(`Find the letter ${promptText}`);
  }, [promptText, speak]);

  useEffect(() => {
    sayPrompt();
  }, [sayPrompt]);

  const nextRound = () => {
    setRound(buildLetterRound());
    setLaunching(false);
    setFeedback('');
  };

  const handlePick = (option) => {
    if (option.letter === round.target.letter) {
      const praise = getPraise();
      setLaunching(true);
      setFeedback(praise);
      setStars((prev) => prev + 1);
      playSfx('launch');
      playSfx('success');
      onCelebrate(praise, 6, 250);
      setTimeout(nextRound, 1400);
    } else {
      setFeedback('Try again!');
      playSfx('oops');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-200 via-sky-100 to-indigo-100 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-44 h-24 bg-white/70 rounded-full blur-2xl animate-drift-left" />
        <div className="absolute top-24 right-6 w-52 h-28 bg-white/70 rounded-full blur-2xl animate-drift-right" />
        <div className="absolute bottom-20 left-6 w-64 h-32 bg-white/60 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button
          onClick={onBack}
          className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Home />
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-sky-700">Letter Launch</h2>
          <p className="text-sky-700/70 font-semibold">Stars: {stars}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 relative z-10">
        <div className="bg-white/90 p-6 rounded-3xl shadow-xl border-4 border-sky-200 text-center mb-6 w-full max-w-md">
          <p className="text-slate-500 mb-2 font-bold uppercase tracking-wider">Launch Mission</p>
          <div className="text-7xl font-black text-sky-700 mb-2">{round.target.letter}</div>
          <div className="text-2xl font-bold text-slate-700">
            {round.target.word} {round.target.emoji}
          </div>
          <button onClick={sayPrompt} className="mt-4 text-sky-600 font-semibold">
            🔊 Hear the letter
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {round.options.map((option) => (
            <button
              key={option.letter}
              onClick={() => handlePick(option)}
              className="bg-white text-slate-800 text-4xl font-black rounded-3xl py-6 shadow-lg border-4 border-sky-200 hover:-translate-y-1 transition"
            >
              {option.letter}
            </button>
          ))}
        </div>

        {feedback && <div className="mt-4 text-xl font-bold text-indigo-500 animate-bounce">{feedback}</div>}

        <div className="relative w-full max-w-md h-40 mt-6">
          <div className="absolute bottom-0 w-full h-10 bg-sky-300/70 rounded-full" />
          <div
            className="absolute bottom-6 left-6 text-6xl transition-transform duration-1000"
            style={{
              transform: launching ? 'translate(220px, -120px) rotate(-10deg)' : 'translate(0, 0)',
            }}
          >
            🚀
          </div>
          <div
            className={`absolute bottom-24 right-12 text-3xl transition-opacity duration-500 ${
              launching ? 'opacity-100' : 'opacity-0'
            }`}
          >
            ✨✨
          </div>
        </div>
      </div>
    </div>
  );
};

export default LetterLaunch;
