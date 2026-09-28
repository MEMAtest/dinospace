import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { buildLetterRound, getPraise } from '../../utils.js';
import { PracticeProgress, SoundToggle } from '../shared/index.jsx';
import { getTaughtGraphemes, makeLearningEvent } from '../../data/literacy.js';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';
import rocketArt from '../../assets/little/fuel-rocket.webp';
import './letterLaunch.css';

const buildTaughtLetterRound = () => {
  const taught = getTaughtGraphemes();
  let candidate = buildLetterRound();
  for (let count = 0; count < 30 && !taught.has(candidate.target.letter.toLowerCase()); count += 1) candidate = buildLetterRound();
  return candidate;
};

const LetterLaunch = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent, sessionLevel = 0 }) => {
  const difficulty = useGameDifficulty('letters');
  const [round, setRound] = useState(buildTaughtLetterRound);
  const [launching, setLaunching] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [stars, setStars] = useState(0);
  const [skillRun, setSkillRun] = useState(0);
  const [hadMistake, setHadMistake] = useState(false);
  const answeredRef = useRef(false);
  const nextRoundTimerRef = useRef(null);

  const promptText = sessionLevel === 0
    ? `Find the letter ${round.target.letter}. ${round.target.letter} is for ${round.target.word}.`
    : sessionLevel === 1
      ? `Which letter starts the word ${round.target.word}? Listen: ${round.target.word}.`
      : `Find the capital letter that matches little ${round.target.letter.toLowerCase()}.`;
  const optionCount = difficulty === 'starter' ? 2 : difficulty === 'growing' ? 3 : 4;
  // Keep the target plus distractors, but in the round's shuffled order so the
  // right answer is not always in the first slot.
  const chosenLetters = new Set([round.target, ...round.options.filter((option) => option.letter !== round.target.letter)].slice(0, optionCount).map((option) => option.letter));
  const visibleOptions = round.options.some((option) => option.letter === round.target.letter)
    ? round.options.filter((option) => chosenLetters.has(option.letter))
    : [round.target, ...round.options.filter((option) => chosenLetters.has(option.letter) && option.letter !== round.target.letter)];

  const sayPrompt = useCallback(() => {
    speak(promptText);
  }, [promptText, speak]);

  useEffect(() => {
    sayPrompt();
  }, [sayPrompt]);

  useEffect(() => () => clearTimeout(nextRoundTimerRef.current), []);

  const nextRound = () => {
    nextRoundTimerRef.current = null;
    answeredRef.current = false;
    setRound(buildTaughtLetterRound());
    setLaunching(false);
    setFeedback('');
    setHadMistake(false);
    setSkillRun((current) => current >= 5 ? 0 : current);
  };

  const handlePick = (option) => {
    if (answeredRef.current) return;
    if (option.letter === round.target.letter) {
      answeredRef.current = true;
      const praise = getPraise();
      setLaunching(true);
      setFeedback(praise);
      setStars((prev) => prev + 1);
      setSkillRun((current) => Math.min(current + 1, 5));
      playSfx('launch');
      playSfx('success');
      onCelebrate(praise, 4, 250);
      onGameEvent?.('letters', 'answer_correct');
      onGameEvent?.('letters', 'learning_attempt', makeLearningEvent({ skill: 'grapheme-recognition', item: round.target.letter.toLowerCase(), response: option.letter.toLowerCase(), correct: true, firstTry: !hadMistake }));
      nextRoundTimerRef.current = setTimeout(nextRound, 1400);
    } else {
      setHadMistake(true);
      setFeedback('Try again!');
      playSfx('oops');
    }
  };

  return (
    <div className="letter-launch min-h-screen flex flex-col bg-gradient-to-b from-[#060e46] via-[#153e9c] to-[#8ddcff] relative overflow-hidden text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-44 h-24 bg-white/70 rounded-full blur-2xl animate-drift-left" />
        <div className="absolute top-24 right-6 w-52 h-28 bg-white/70 rounded-full blur-2xl animate-drift-right" />
        <div className="absolute bottom-20 left-6 w-64 h-32 bg-white/60 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button
          onClick={onBack}
          className="game-icon-button"
          aria-label="Back to learning world"
        >
          <ArrowLeft />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-black text-white sm:text-3xl">Letter Launch</h2>
          <p className="font-semibold text-cyan-100">⭐ {stars} · Level {sessionLevel + 1}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 relative z-10">
        <PracticeProgress skill={['Hear the letter', 'Find the first sound', 'Match big and little letters'][sessionLevel] || 'Letter mission'} completed={skillRun} accent="sky" />
        <div className="letter-launch-panel mb-5 w-full max-w-2xl rounded-[2.5rem] border-4 border-cyan-200 bg-white/95 p-5 text-center text-slate-900 shadow-xl sm:p-7">
          <p className="mb-2 font-black uppercase tracking-wider text-blue-600">{['Listen and choose', 'What sound starts this?', 'Match the big letter'][sessionLevel] || 'Launch mission'}</p>
          <div className="letter-launch-clue" aria-label={sessionLevel === 2 ? `Little letter ${round.target.letter.toLowerCase()}` : round.target.word}>
            {sessionLevel === 2 ? round.target.letter.toLowerCase() : round.target.emoji}
          </div>
          <p className="mb-1 text-lg font-bold text-slate-700">{sessionLevel === 0 ? 'Listen for the letter' : sessionLevel === 1 ? 'Listen to the word, then choose its first letter' : 'Choose its capital letter'}</p>
          <button onClick={sayPrompt} className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-full bg-blue-600 px-5 font-black text-white shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300">
            <Volume2 size={22} /> Hear the clue again
          </button>
        </div>

        <div className={`grid w-full max-w-2xl gap-4 ${optionCount === 2 ? 'grid-cols-2' : optionCount === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
          {visibleOptions.map((option) => (
            <button
              key={option.letter}
              onClick={() => handlePick(option)}
              className="letter-launch-choice rounded-3xl border-4 border-cyan-200 bg-white py-6 text-4xl font-black text-blue-800 shadow-lg transition hover:-translate-y-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300"
            >
              {option.letter}
            </button>
          ))}
        </div>

        {feedback && <div className="mt-4 text-xl font-bold text-indigo-500 animate-bounce">{feedback}</div>}

        <div className="relative mt-4 h-32 w-full max-w-2xl">
          <div className="absolute bottom-0 w-full h-10 bg-sky-300/70 rounded-full" />
          <img
            src={rocketArt}
            alt=""
            className="absolute bottom-6 left-6 h-24 w-24 object-contain transition-transform duration-1000"
            style={{
              transform: launching ? 'translate(220px, -120px) rotate(-10deg)' : 'translate(0, 0)',
            }}
          />
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
