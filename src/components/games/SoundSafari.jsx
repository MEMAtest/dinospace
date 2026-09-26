import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { PHONICS_ITEMS } from '../../data/index.js';
import { pickRandom, shuffle, getPraise } from '../../utils.js';
import { getAvailableWords, getTaughtGraphemes, makeLearningEvent } from '../../data/literacy.js';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';
import { firstSoundPrompt } from '../../data/phonicsPrompts.js';
import { SoundToggle } from '../shared/index.jsx';
import safariScene from '../../assets/game-scenes/sound-safari.webp';
import './amariScenes.css';

const SoundSafari = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent }) => {
  const difficulty = useGameDifficulty('phonics');
  const phonicsItems = useMemo(() => {
    const taught = getTaughtGraphemes();
    const items = PHONICS_ITEMS.filter((item) => item.letter !== 'X' && taught.has(item.letter.toLowerCase()));
    return items.length >= 3 ? items : PHONICS_ITEMS.slice(0, 6);
  }, []);
  const blendWords = useMemo(() => getAvailableWords().map((item) => ({ ...item, letters: item.graphemes })), []);
  const buildMatchRound = useCallback(() => {
    const target = pickRandom(phonicsItems);
    const distractors = difficulty === 'starter' ? 2 : 3;
    return { target, options: shuffle([target, ...shuffle(phonicsItems.filter((item) => item.letter !== target.letter)).slice(0, distractors)]) };
  }, [difficulty, phonicsItems]);
  const [safariMode, setSafariMode] = useState(() => difficulty === 'challenge' ? 'blend' : 'match');
  const [round, setRound] = useState(buildMatchRound);
  const [blendRound, setBlendRound] = useState(() => pickRandom(blendWords));
  const [blendStep, setBlendStep] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [hadMistake, setHadMistake] = useState(false);
  const answeredRef = useRef(false);
  const nextRoundTimerRef = useRef(null);
  const timersRef = useRef([]);

  const sayPrompt = useCallback(() => {
    if (safariMode === 'match') {
      speak(firstSoundPrompt(round.target.sound));
    } else {
      speak(`Say each sound, then blend the word. What word does this make?`);
    }
  }, [round.target, safariMode, speak]);

  useEffect(() => { sayPrompt(); }, [sayPrompt]);

  useEffect(() => () => {
    clearTimeout(nextRoundTimerRef.current);
    timersRef.current.forEach((id) => clearTimeout(id));
  }, []);

  const later = (callback, delay) => {
    timersRef.current.push(setTimeout(callback, delay));
  };

  const scheduleNextRound = () => {
    const roundMode = safariMode;
    nextRoundTimerRef.current = setTimeout(() => nextRound(roundMode), 1400);
  };

  const nextRound = (mode = safariMode) => {
    clearTimeout(nextRoundTimerRef.current);
    nextRoundTimerRef.current = null;
    answeredRef.current = false;
    if (mode === 'match') setRound(buildMatchRound());
    else { setBlendRound(pickRandom(blendWords)); setBlendStep(0); }
    setFeedback('');
    setHadMistake(false);
  };

  const handlePick = (option) => {
    if (answeredRef.current) return;
    if (option.letter === round.target.letter) {
      answeredRef.current = true;
      const praise = getPraise();
      setFeedback(`${praise} ${option.word} starts with ${round.target.sound}.`);
      setScore((prev) => prev + 1);
      playSfx('success');
      onCelebrate(praise, 6, 250);
      onGameEvent?.('phonics', 'answer_correct');
      onGameEvent?.('phonics', 'learning_attempt', makeLearningEvent({ skill: 'phoneme-recognition', item: round.target.sound, response: option.word, correct: true, firstTry: !hadMistake }));
      scheduleNextRound();
    } else {
      setHadMistake(true);
      setFeedback('Try again!');
      setShake(true);
      playSfx('oops');
      later(() => setShake(false), 450);
    }
  };

  const handleBlendLetterTap = (idx) => {
    if (idx !== blendStep) return;
    playSfx('tap');
    setBlendStep(idx + 1);
    if (idx + 1 >= blendRound.letters.length) {
      later(() => speak(`${blendRound.word}!`), 600);
    }
  };

  const blendOptions = useMemo(() => {
    if (safariMode !== 'blend') return [];
    const decoys = shuffle(blendWords.filter((w) => w.word !== blendRound.word)).slice(0, 2);
    return shuffle([blendRound, ...decoys]);
  }, [blendRound, blendWords, safariMode]);

  const handleBlendAnswer = (w) => {
    if (answeredRef.current) return;
    if (w.word === blendRound.word) {
      answeredRef.current = true;
      const praise = getPraise();
      setFeedback(`${praise} The word is ${w.word}.`);
      setScore((prev) => prev + 1);
      playSfx('success');
      onCelebrate(praise, 8, 250);
      onGameEvent?.('phonics', 'answer_correct');
      onGameEvent?.('phonics', 'learning_attempt', makeLearningEvent({ skill: 'oral-blending', item: blendRound.word, response: w.word, correct: true, firstTry: !hadMistake, difficulty: blendRound.phase === 3 ? 'growing' : 'starter' }));
      scheduleNextRound();
    } else {
      setHadMistake(true);
      setFeedback('Try again!');
      setShake(true);
      playSfx('oops');
      later(() => setShake(false), 450);
    }
  };

  return (
    <div className="amari-scene flex flex-col" style={{ '--scene-image': `url("${safariScene}")` }}>
      <div className="amari-scene-header relative z-20">
        <button onClick={onBack} className="game-icon-button" aria-label="Back to home"><ArrowLeft /></button>
        <div className="amari-scene-title">
          <h2 className="text-lg sm:text-2xl">🌿 Sound Safari</h2>
          <p className="text-xs text-sky-100">⭐ {score} {score === 1 ? 'star' : 'stars'}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-3 pb-6 relative z-10">
        <div className="flex gap-2 mb-4">
          {[{ id: 'match', label: '🔤 Letter Match' }, { id: 'blend', label: '🧩 Blend It' }].map((m) => (
            <button key={m.id} onClick={() => { setSafariMode(m.id); nextRound(m.id); playSfx('click'); }}
              className={`min-h-11 px-4 py-2 rounded-full border-2 border-white font-black text-sm shadow-lg ${safariMode === m.id ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700'}`}>{m.label}</button>
          ))}
        </div>

        {safariMode === 'match' && (
          <>
            <div className={`amari-scene-prompt mb-5 w-full max-w-lg p-4 text-center ${shake ? 'animate-shake' : ''}`}>
              <div className="text-xl sm:text-2xl">Which picture starts with <span className="text-blue-600">/{round.target.sound.toLowerCase()}/</span>?</div>
              <button onClick={sayPrompt} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-blue-600 px-4 text-white shadow-md"><Volume2 size={20} /> Hear the sound</button>
            </div>
            <div className={`grid gap-4 w-full max-w-lg ${round.options.length >= 4 ? 'grid-cols-2 sm:grid-cols-4' : round.options.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {round.options.map((option) => (
                <button key={option.word} onClick={() => handlePick(option)} aria-label={option.word} className="amari-choice flex min-h-28 flex-col items-center justify-center p-3 hover:-translate-y-1">
                  <div className="text-6xl drop-shadow-lg">{option.emoji}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {safariMode === 'blend' && (
          <>
            <div className={`amari-scene-card mb-6 p-6 text-center ${shake ? 'animate-shake' : ''}`}>
              <div className="text-slate-500 uppercase tracking-wide text-xs font-bold mb-3">Tap each sound from left to right</div>
              <div className="flex items-center gap-3 justify-center mb-3">
                {blendRound.letters.map((l, i) => (
                  <button key={i} onClick={() => handleBlendLetterTap(i)}
                    className={`w-16 h-16 rounded-2xl text-3xl font-black flex items-center justify-center border-4 transition-all ${
                      i < blendStep ? 'bg-emerald-500 text-white border-emerald-600 scale-110' : i === blendStep ? 'bg-emerald-100 border-emerald-400 animate-pulse text-emerald-700' : 'bg-white border-slate-200 text-slate-400'
                    }`}>{l.toUpperCase()}</button>
                ))}
              </div>
              {blendStep >= blendRound.letters.length && (
                <div className="text-2xl font-black text-emerald-600 mt-2">What word is it? Choose the picture.</div>
              )}
              <button onClick={sayPrompt} className="mt-3 text-emerald-600 font-semibold">🔊 Hear the instruction</button>
            </div>
            {blendStep >= blendRound.letters.length && (
              <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
                {blendOptions.map((w) => (
                  <button key={w.word} onClick={() => handleBlendAnswer(w)} aria-label={w.word} className="amari-choice min-h-28 p-3">
                    <div className="text-5xl mb-2">{w.emoji}</div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {feedback && <div className="amari-scene-card mt-4 px-4 py-2 text-center text-lg font-black text-emerald-700" aria-live="polite">{feedback}</div>}
      </div>
    </div>
  );
};

export default SoundSafari;
