import { useState, useEffect, useCallback } from 'react';
import { Home } from 'lucide-react';
import { buildLetterRound, getPraise } from '../../utils.js';
import { PracticeProgress, SoundToggle } from '../shared/index.jsx';

const LetterLaunch = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent }) => {
  const [round, setRound] = useState(buildLetterRound);
  const [launching, setLaunching] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [stars, setStars] = useState(0);
  const [skillRun, setSkillRun] = useState(0);

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
    setSkillRun((current) => current >= 5 ? 0 : current);
  };

  const handlePick = (option) => {
    if (option.letter === round.target.letter) {
      const praise = getPraise();
      setLaunching(true);
      setFeedback(praise);
      setStars((prev) => prev + 1);
      setSkillRun((current) => Math.min(current + 1, 5));
      playSfx('launch');
      playSfx('success');
      onCelebrate(praise, 4, 250);
      onGameEvent?.('letters', 'answer_correct');
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
        <PracticeProgress skill="Match a letter to its sound" completed={skillRun} accent="sky" />
        <div className="mb-5 w-full max-w-2xl rounded-[2.5rem] border-4 border-sky-200 bg-white/90 p-7 text-center shadow-xl">
          <p className="text-slate-500 mb-2 font-bold uppercase tracking-wider">Launch Mission</p>
          <div className="text-7xl font-black text-sky-700 mb-2">{round.target.letter}</div>
          <div className="text-2xl font-bold text-slate-700">
            {round.target.word} {round.target.emoji}
          </div>
          <button onClick={sayPrompt} className="mt-4 text-sky-600 font-semibold">
            🔊 Hear the letter
          </button>
        </div>

        <div className="grid w-full max-w-2xl grid-cols-4 gap-4">
          {round.options.map((option) => (
            <button
              key={option.letter}
              onClick={() => handlePick(option)}
              className="rounded-3xl border-4 border-sky-200 bg-white py-7 text-4xl font-black text-slate-800 shadow-lg transition hover:-translate-y-1"
            >
              {option.letter}
            </button>
          ))}
        </div>

        {feedback && <div className="mt-4 text-xl font-bold text-indigo-500 animate-bounce">{feedback}</div>}

        <div className="relative mt-4 h-32 w-full max-w-2xl">
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
