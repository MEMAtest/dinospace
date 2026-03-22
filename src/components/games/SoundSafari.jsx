import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Home } from 'lucide-react';
import { BLEND_WORDS } from '../../data/index.js';
import { pickRandom, shuffle, buildPhonicsRound, getPraise } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';

const SoundSafari = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [safariMode, setSafariMode] = useState('match');
  const [round, setRound] = useState(buildPhonicsRound);
  const [blendRound, setBlendRound] = useState(() => pickRandom(BLEND_WORDS));
  const [blendStep, setBlendStep] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);

  const sayPrompt = useCallback(() => {
    if (safariMode === 'match') {
      speak(`Which one starts with ${round.target.letter}? ${round.target.letter} says ${round.target.sound}.`);
    } else {
      const blendText = blendRound.letters.join(', ');
      speak(`Blend the sounds: ${blendText}. What word does it make?`);
    }
  }, [round.target?.letter, round.target?.sound, blendRound, safariMode, speak]);

  useEffect(() => { sayPrompt(); }, [sayPrompt]);

  const nextRound = () => {
    if (safariMode === 'match') setRound(buildPhonicsRound());
    else { setBlendRound(pickRandom(BLEND_WORDS)); setBlendStep(0); }
    setFeedback('');
  };

  const handlePick = (option) => {
    if (option.letter === round.target.letter) {
      const praise = getPraise();
      setFeedback(praise);
      setScore((prev) => prev + 1);
      playSfx('success');
      onCelebrate(praise, 6, 250);
      setTimeout(nextRound, 1400);
    } else {
      setFeedback('Try again!');
      setShake(true);
      playSfx('oops');
      setTimeout(() => setShake(false), 450);
    }
  };

  const handleBlendLetterTap = (idx) => {
    if (idx !== blendStep) return;
    playSfx('tap');
    speak(blendRound.letters[idx]);
    setBlendStep(idx + 1);
    if (idx + 1 >= blendRound.letters.length) {
      setTimeout(() => speak(`${blendRound.word}!`), 600);
    }
  };

  const blendOptions = useMemo(() => {
    if (safariMode !== 'blend') return [];
    const decoys = shuffle(BLEND_WORDS.filter((w) => w.word !== blendRound.word)).slice(0, 2);
    return shuffle([blendRound, ...decoys]);
  }, [blendRound, safariMode]);

  const handleBlendAnswer = (w) => {
    if (w.word === blendRound.word) {
      const praise = getPraise();
      setFeedback(praise);
      setScore((prev) => prev + 1);
      playSfx('success');
      onCelebrate(praise, 8, 250);
      setTimeout(nextRound, 1400);
    } else {
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
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"><Home /></button>
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
              <div className="text-5xl font-black text-emerald-700 mt-2">{round.target.letter}</div>
              <div className="text-lg font-semibold text-slate-600">says &quot;{round.target.sound}&quot;</div>
              <button onClick={sayPrompt} className="mt-3 text-emerald-600 font-semibold">🔊 Hear the sound</button>
            </div>
            <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
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
              <div className="text-slate-500 uppercase tracking-wide text-xs font-bold mb-3">Tap each letter to hear it</div>
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
              <button onClick={sayPrompt} className="mt-3 text-emerald-600 font-semibold">🔊 Hear the sounds</button>
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
