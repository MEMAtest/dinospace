import { useState, useEffect, useMemo, useCallback } from 'react';
import { Home } from 'lucide-react';
import { PHONICS_ITEMS } from '../../data/index.js';
import { pickRandom, shuffle, getPraise } from '../../utils.js';
import { getAvailableWords, getTaughtGraphemes, makeLearningEvent } from '../../data/literacy.js';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';
import { SoundToggle } from '../shared/index.jsx';

const SoundSafari = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent }) => {
  const difficulty = useGameDifficulty('phonics');
  const phonicsItems = useMemo(() => {
    const taught = getTaughtGraphemes();
    const items = PHONICS_ITEMS.filter((item) => taught.has(item.letter.toLowerCase()));
    return items.length >= 3 ? items : PHONICS_ITEMS.slice(0, 6);
  }, []);
  const blendWords = useMemo(() => getAvailableWords().map((item) => ({ ...item, letters: item.graphemes })), []);
  const buildMatchRound = useCallback(() => {
    const target = pickRandom(phonicsItems);
    const distractors = difficulty === 'starter' ? 1 : difficulty === 'challenge' ? 3 : 2;
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

  const sayPrompt = useCallback(() => {
    if (safariMode === 'match') {
      speak(`Listen to ${round.target.word}. Which picture starts with the same sound as ${round.target.word}?`);
    } else {
      speak(`Say each sound, then blend the word. What word does this make?`);
    }
  }, [round.target, safariMode, speak]);

  useEffect(() => { sayPrompt(); }, [sayPrompt]);

  const nextRound = () => {
    if (safariMode === 'match') setRound(buildMatchRound());
    else { setBlendRound(pickRandom(blendWords)); setBlendStep(0); }
    setFeedback('');
    setHadMistake(false);
  };

  const handlePick = (option) => {
    if (option.letter === round.target.letter) {
      const praise = getPraise();
      setFeedback(praise);
      setScore((prev) => prev + 1);
      playSfx('success');
      onCelebrate(praise, 6, 250);
      onGameEvent?.('phonics', 'answer_correct');
      onGameEvent?.('phonics', 'learning_attempt', makeLearningEvent({ skill: 'phoneme-recognition', item: round.target.sound, response: option.word, correct: true, firstTry: !hadMistake }));
      setTimeout(nextRound, 1400);
    } else {
      setHadMistake(true);
      setFeedback('Try again!');
      setShake(true);
      playSfx('oops');
      setTimeout(() => setShake(false), 450);
    }
  };

  const handleBlendLetterTap = (idx) => {
    if (idx !== blendStep) return;
    playSfx('tap');
    setBlendStep(idx + 1);
    if (idx + 1 >= blendRound.letters.length) {
      setTimeout(() => speak(`${blendRound.word}!`), 600);
    }
  };

  const blendOptions = useMemo(() => {
    if (safariMode !== 'blend') return [];
    const decoys = shuffle(blendWords.filter((w) => w.word !== blendRound.word)).slice(0, 2);
    return shuffle([blendRound, ...decoys]);
  }, [blendRound, blendWords, safariMode]);

  const handleBlendAnswer = (w) => {
    if (w.word === blendRound.word) {
      const praise = getPraise();
      setFeedback(praise);
      setScore((prev) => prev + 1);
      playSfx('success');
      onCelebrate(praise, 8, 250);
      onGameEvent?.('phonics', 'answer_correct');
      onGameEvent?.('phonics', 'learning_attempt', makeLearningEvent({ skill: 'oral-blending', item: blendRound.word, response: w.word, correct: true, firstTry: !hadMistake, difficulty: blendRound.phase === 3 ? 'growing' : 'starter' }));
      setTimeout(nextRound, 1400);
    } else {
      setHadMistake(true);
      setFeedback('Try again!');
      setShake(true);
      playSfx('oops');
      setTimeout(() => setShake(false), 450);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-100 via-lime-100 to-emerald-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-6 right-6 w-48 h-32 bg-white/70 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-lime-200/60 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform" aria-label="Back to all games"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-emerald-700">Sound Safari</h2>
          <p className="text-emerald-700/70 font-semibold">Score: {score}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 relative z-10">
        <div className="flex gap-2 mb-4">
          {[{ id: 'match', label: '🔤 Letter Match' }, { id: 'blend', label: '🧩 Blend It' }].map((m) => (
            <button key={m.id} onClick={() => { setSafariMode(m.id); nextRound(); playSfx('click'); }}
              className={`px-4 py-2 rounded-full font-bold text-sm ${safariMode === m.id ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700'}`}>{m.label}</button>
          ))}
        </div>

        {safariMode === 'match' && (
          <>
            <div className={`bg-white/90 rounded-3xl p-6 shadow-xl border-4 border-emerald-200 mb-6 text-center ${shake ? 'animate-shake' : ''}`}>
              <div className="text-slate-500 uppercase tracking-wide text-xs font-bold">Listen</div>
              <div className="text-5xl font-black text-emerald-700 mt-2">{round.target.sound.toLowerCase()}</div>
              <div className="text-lg font-semibold text-slate-600">{round.target.word} starts with {round.target.sound.toLowerCase()}.</div>
              <button onClick={sayPrompt} className="mt-3 text-emerald-600 font-semibold">🔊 Hear the word</button>
            </div>
            <div className={`grid gap-4 w-full max-w-lg ${round.options.length >= 4 ? 'grid-cols-2 sm:grid-cols-4' : round.options.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {round.options.map((option) => (
                <button key={option.word} onClick={() => handlePick(option)} className="bg-white rounded-3xl p-4 shadow-lg border-4 border-emerald-200 hover:-translate-y-1 transition">
                  <div className="text-4xl mb-2">{option.emoji}</div>
                  <div className="text-lg font-black text-emerald-700">{option.word}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {safariMode === 'blend' && (
          <>
            <div className={`bg-white/90 rounded-3xl p-6 shadow-xl border-4 border-emerald-200 mb-6 text-center ${shake ? 'animate-shake' : ''}`}>
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
                <div className="text-2xl font-black text-emerald-600 mt-2">What word is it? {blendRound.emoji}</div>
              )}
              <button onClick={sayPrompt} className="mt-3 text-emerald-600 font-semibold">🔊 Hear the instruction</button>
            </div>
            {blendStep >= blendRound.letters.length && (
              <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
                {blendOptions.map((w) => (
                  <button key={w.word} onClick={() => handleBlendAnswer(w)} className="bg-white rounded-3xl p-4 shadow-lg border-4 border-emerald-200 hover:-translate-y-1 transition">
                    <div className="text-4xl mb-2">{w.emoji}</div>
                    <div className="text-lg font-black text-emerald-700">{w.word}</div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {feedback && <div className="mt-4 text-xl font-bold text-emerald-700 animate-bounce">{feedback}</div>}
      </div>
    </div>
  );
};

export default SoundSafari;
