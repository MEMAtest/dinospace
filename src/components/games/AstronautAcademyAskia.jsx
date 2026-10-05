import { useState, useEffect, useCallback, useRef } from 'react';
import { Home, ArrowLeft } from 'lucide-react';
import { ASTRONAUT_PROFILES, ASTRONAUT_CATEGORIES } from '../../data/index.js';
import { getPraise, shuffle } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';

const SPACE_STARS = Array.from({ length: 30 }, (_, index) => ({
  id: index,
  w: 1 + (index % 3),
  top: `${(index * 29) % 100}%`,
  left: `${(index * 47) % 100}%`,
  delay: `${index % 4}s`,
}));

const AstronautImage = ({ profile, size = 80, className = '' }) => {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!profile) return null;

  if (failed) {
    return (
      <div className={`rounded-full flex items-center justify-center bg-indigo-800 border-4 border-white/30 ${className}`} style={{ width: size, height: size }}>
        <span style={{ fontSize: size * 0.5 }}>{profile.emoji}</span>
      </div>
    );
  }

  return (
    <div className={`relative rounded-full overflow-hidden border-4 border-white/30 ${className}`} style={{ width: size, height: size }}>
      {!loaded && <div className="absolute inset-0 bg-indigo-700 animate-pulse rounded-full" />}
      <img
        src={profile.imageUrl}
        alt={profile.name}
        loading="lazy"
        className="w-full h-full object-cover rounded-full"
        onError={() => setFailed(true)}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

const SpaceStars = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {SPACE_STARS.map((s) => (
        <div key={s.id} className="absolute bg-white rounded-full animate-pulse" style={{ width: s.w, height: s.w, top: s.top, left: s.left, animationDelay: s.delay }} />
      ))}
    </div>
  );
};

const RocketProgress = ({ current, total }) => {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="relative w-full h-8 flex items-center px-2 my-2">
      <span className="text-xl flex-shrink-0">🌍</span>
      <div className="flex-1 mx-2 relative h-1">
        <div className="absolute inset-0 border-t-2 border-dashed border-white/30" />
        <div className="absolute top-1/2 -translate-y-1/2 transition-all duration-600 ease-out" style={{ left: `${Math.min(pct, 100)}%` }}>
          <span className="text-xl inline-block" style={{ transform: 'rotate(15deg)' }}>🚀</span>
        </div>
      </div>
      <span className="text-xl flex-shrink-0">🌕</span>
    </div>
  );
};

// Starter mode shows the answer plus two others. Shuffle once when the
// question is set so the answer is not always first and does not jump around
// on re-render.
const buildQuestionOptions = (question, difficulty) => {
  if (!question) return [];
  if (difficulty !== 'starter') return question.options;
  const others = shuffle(question.options.filter((opt) => opt.text !== question.answer)).slice(0, 2);
  return shuffle(question.options.filter((opt) => opt.text === question.answer).concat(others));
};

const DidYouKnowOverlay = ({ profile, onDone, speak }) => {
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  }, [onDone]);

  useEffect(() => {
    if (!profile) return;
    speak(`Did you know? ${profile.funFact}`);
    const timer = setTimeout(finish, 6000);
    return () => clearTimeout(timer);
  }, [profile, speak, finish]);

  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={finish}>
      <div className="bg-gradient-to-b from-indigo-700 to-purple-800 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl animate-scale-in mx-4">
        <div className="flex justify-center mb-3">
          <AstronautImage profile={profile} size={120} className="border-yellow-300 shadow-xl" />
        </div>
        <p className="text-yellow-300 font-bold text-lg mb-1">Did you know?</p>
        <p className="text-white font-bold text-base mb-2">{profile.name} {profile.flag}</p>
        <p className="text-white/80 text-sm">{profile.funFact}</p>
        <button type="button" onClick={finish} className="mt-4 rounded-full bg-white/20 px-5 py-2 text-sm font-bold text-white">Tap to continue</button>
      </div>
    </div>
  );
};

const HeroesGallery = ({ onBack, playSfx, speak, soundOn, onToggleSound }) => {
  const [flippedCards, setFlippedCards] = useState({});

  const handleFlip = (profileId) => {
    const profile = ASTRONAUT_PROFILES.find((p) => p.id === profileId);
    setFlippedCards((prev) => {
      const isFlipped = !prev[profileId];
      if (isFlipped && profile) {
        playSfx('card-flip');
        speak(profile.funFact);
      }
      return { ...prev, [profileId]: isFlipped };
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      <SpaceStars />
      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="game-icon-button !bg-white/20 !text-white" aria-label="Back to Astronaut Academy missions"><ArrowLeft strokeWidth={3} /></button>
        <h2 className="text-2xl font-black text-white">🔭 Space Heroes</h2>
        {onToggleSound ? <SoundToggle soundOn={soundOn} onToggle={onToggleSound} className="!bg-white/20 !text-white" /> : <div className="w-12" />}
      </div>
      <div className="flex-1 flex flex-col items-center px-4 pb-8 z-10 overflow-y-auto">
        <p className="text-white/70 text-sm font-semibold mt-2 mb-4">Tap a card to learn!</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-3xl">
          {ASTRONAUT_PROFILES.map((profile) => {
            const isFlipped = flippedCards[profile.id] || false;
            return (
              <div key={profile.id} style={{ perspective: '900px' }}>
                <button
                  onClick={() => handleFlip(profile.id)}
                  className="relative w-full"
                  style={{ aspectRatio: '4/5' }}
                >
                  <div
                    className="absolute inset-0 transition-transform duration-[600ms] ease-in-out"
                    style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                  >
                    {/* Front face */}
                    <div
                      className="absolute inset-0 bg-gradient-to-b from-indigo-800 to-purple-900 rounded-2xl border-2 border-white/20 flex flex-col items-center justify-center p-3 shadow-lg"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <AstronautImage profile={profile} size={100} className="border-white/30 shadow-lg mb-2" />
                      <p className="text-white font-bold text-sm">{profile.name}</p>
                      <p className="text-lg">{profile.flag}</p>
                    </div>
                    {/* Back face */}
                    <div
                      className="absolute inset-0 bg-gradient-to-b from-amber-600 to-orange-700 rounded-2xl border-2 border-white/20 flex flex-col items-center justify-center p-3 shadow-lg"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <span className="text-5xl mb-2">{profile.achievementEmoji}</span>
                      <p className="text-white font-bold text-sm text-center leading-tight">{profile.achievement}</p>
                      <span className="mt-2 bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{profile.year}</span>
                      <p className="text-lg mt-1">{profile.flag}</p>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const AstronautAcademy = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent }) => {
  const difficulty = useGameDifficulty('astronaut');
  const [catIndex, setCatIndex] = useState(null);
  const [mode, setMode] = useState(null); // 'quiz' | 'gallery'
  const [qIndex, setQIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [didYouKnow, setDidYouKnow] = useState(null);
  const [combo, setCombo] = useState(0);
  const [correctProfiles, setCorrectProfiles] = useState([]);
  const [hadMistake, setHadMistake] = useState(false);
  const [questionOptions, setQuestionOptions] = useState([]);
  const timersRef = useRef([]);

  const cat = catIndex !== null ? ASTRONAUT_CATEGORIES[catIndex] : null;
  const question = cat ? cat.items[qIndex] : null;
  const isHeroes = cat?.id === 'heroes';

  useEffect(() => {
    if (question) speak(question.q);
  }, [question, speak]);

  useEffect(() => () => timersRef.current.forEach((id) => clearTimeout(id)), []);

  const goToQuestion = useCallback((category, index) => {
    setQIndex(index);
    setHadMistake(false);
    setQuestionOptions(buildQuestionOptions(category.items[index], difficulty));
  }, [difficulty]);

  const handlePick = (opt) => {
    if (!question || feedback) return;
    if (opt.text === question.answer) {
      const praise = getPraise();
      setFeedback(praise);
      setExplanation('');
      playSfx('success');
      const newCombo = combo + 1;
      setCombo(newCombo);
      setScore((prev) => prev + 1);
      onCelebrate(praise, 6, 200);
      onGameEvent?.('astronaut', 'answer_correct', { skill: `astronaut-${cat.id}`, item: question.q, response: opt.text, expected: question.answer, correct: true, firstAttempt: !hadMistake, independent: true, difficulty });

      if (newCombo >= 3) {
        playSfx('combo');
      }

      // Space Heroes: show "Did You Know?" with profile
      const profile = isHeroes && question.astronaut
        ? ASTRONAUT_PROFILES.find((p) => p.id === question.astronaut)
        : null;

      if (profile) {
        setCorrectProfiles((prev) => prev.includes(profile.id) ? prev : [...prev, profile.id]);
        timersRef.current.push(setTimeout(() => {
          setFeedback('');
          setDidYouKnow(profile);
        }, 800));
      } else {
        speak(praise);
        timersRef.current.push(setTimeout(() => {
          setFeedback('');
          if (qIndex + 1 < cat.items.length) {
            goToQuestion(cat, qIndex + 1);
          } else {
            playSfx('levelup-big');
            setDone(true);
          }
        }, 1500));
      }
    } else {
      setHadMistake(true);
      setShake(true);
      setCombo(0);
      playSfx('wrong');
      const correctOpt = question.options.find((o) => o.text === question.answer);
      const explainText = `The answer is ${question.answer}!`;
      setExplanation(`${correctOpt?.visual || ''} ${explainText}`);
      speak(explainText);
      setFeedback('Not quite!');
      timersRef.current.push(setTimeout(() => { setShake(false); setFeedback(''); setExplanation(''); }, 2500));
    }
  };

  const handleDidYouKnowDone = useCallback(() => {
    setDidYouKnow(null);
    if (cat && qIndex + 1 < cat.items.length) {
      goToQuestion(cat, qIndex + 1);
    } else {
      playSfx('levelup-big');
      setDone(true);
    }
  }, [cat, qIndex, playSfx, goToQuestion]);

  const handleReset = () => {
    setCatIndex(null);
    setMode(null);
    setQIndex(0);
    setScore(0);
    setDone(false);
    setFeedback('');
    setExplanation('');
    setDidYouKnow(null);
    setCombo(0);
    setCorrectProfiles([]);
    setHadMistake(false);
  };

  const handleSelectCategory = (index) => {
    const selectedCat = ASTRONAUT_CATEGORIES[index];
    if (selectedCat.id === 'heroes') {
      setCatIndex(index);
      setMode(null); // show chooser
    } else {
      setCatIndex(index);
      setMode('quiz');
    }
    goToQuestion(selectedCat, 0);
    setScore(0);
    setDone(false);
    setCombo(0);
    setCorrectProfiles([]);
    playSfx('click');
  };

  // Mission select screen
  if (catIndex === null) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
        <SpaceStars />
        <div className="flex items-center justify-between px-4 pt-4 z-20">
          <button onClick={onBack} className="game-icon-button !bg-white/20 !text-white" aria-label="Back to home"><Home className="text-white" /></button>
          <h2 className="text-3xl font-black text-white">👨‍🚀 Astronaut Academy</h2>
          <SoundToggle soundOn={soundOn} onToggle={onToggleSound} className="!bg-white/20 !text-white" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10">
          <p className="text-white/80 text-xl font-semibold mb-8">Pick a mission!</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-3xl">
            {ASTRONAUT_CATEGORIES.map((c, i) => (
              <button
                key={c.id}
                onClick={() => handleSelectCategory(i)}
                className={`backdrop-blur-sm border-2 rounded-3xl p-6 text-center hover:-translate-y-1 transition-all ${
                  c.id === 'heroes'
                    ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-400/40 animate-glow-pulse'
                    : 'bg-white/10 border-white/20 hover:bg-white/20'
                }`}
              >
                <div className="text-5xl mb-3">{c.emoji}</div>
                <h3 className="text-xl font-black text-white">{c.name}</h3>
                <p className="text-white/60 text-sm mt-1">{c.items.length} questions · {difficulty}</p>
                {c.id === 'heroes' && <span className="inline-block mt-2 bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-0.5 rounded-full">✨ NEW</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Space Heroes mode chooser (Quiz or Explore)
  if (isHeroes && mode === null) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
        <SpaceStars />
        <div className="flex items-center justify-between px-4 pt-4 z-20">
          <button onClick={handleReset} className="game-icon-button !bg-white/20 !text-white" aria-label="Back to Astronaut Academy missions"><ArrowLeft strokeWidth={3} /></button>
          <h2 className="text-2xl font-black text-white">👨‍🚀 Space Heroes</h2>
          <SoundToggle soundOn={soundOn} onToggle={onToggleSound} className="!bg-white/20 !text-white" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10 gap-6">
          <p className="text-white/80 text-lg font-semibold">Quiz or Explore?</p>
          <div className="flex gap-6 flex-wrap justify-center">
            <button
              onClick={() => { setMode('quiz'); playSfx('launch'); speak('Quiz time!'); }}
              className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-3xl p-8 text-center hover:bg-white/20 transition-all hover:-translate-y-1 w-44"
            >
              <div className="text-6xl mb-3">🎯</div>
              <h3 className="text-xl font-black text-white">Quiz</h3>
              <p className="text-white/50 text-xs mt-1">Test your knowledge!</p>
            </button>
            <button
              onClick={() => { setMode('gallery'); playSfx('sparkle'); speak('Explore the heroes!'); }}
              className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-3xl p-8 text-center hover:bg-white/20 transition-all hover:-translate-y-1 w-44"
            >
              <div className="text-6xl mb-3">🔭</div>
              <h3 className="text-xl font-black text-white">Explore</h3>
              <p className="text-white/50 text-xs mt-1">Meet the heroes!</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Gallery mode
  if (mode === 'gallery') {
    return <HeroesGallery onBack={handleReset} playSfx={playSfx} speak={speak} soundOn={soundOn} onToggleSound={onToggleSound} />;
  }

  // Completion screen
  if (done) {
    const completedProfiles = correctProfiles.map((id) => ASTRONAUT_PROFILES.find((p) => p.id === id)).filter(Boolean);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
        <SpaceStars />
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center z-10 max-w-md mx-4">
          <div className="text-6xl mb-4 animate-bounce-slow">🏆</div>
          <h2 className="text-3xl font-black text-white mb-2">Mission Complete!</h2>
          <p className="text-white/80 text-xl mb-1">{cat.name}</p>
          <p className="text-yellow-300 text-2xl font-black mb-4">{score}/{cat.items.length} correct</p>

          {isHeroes && completedProfiles.length > 0 && (
            <div className="mb-4">
              <p className="text-white/60 text-sm mb-2">Heroes you learned about:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {completedProfiles.map((profile) => (
                  <div key={profile.id} className="relative">
                    <AstronautImage profile={profile} size={48} className="border-green-400" />
                    <span className="absolute -bottom-1 -right-1 text-sm">✅</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button onClick={handleReset} className="bg-indigo-500 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:bg-indigo-600 transition">New Mission</button>
            <button onClick={onBack} className="bg-white/20 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:bg-white/30 transition">Home</button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz screen
  const profile = isHeroes && question?.astronaut ? ASTRONAUT_PROFILES.find((p) => p.id === question.astronaut) : null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      <SpaceStars />
      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={handleReset} className="game-icon-button !bg-white/20 !text-white" aria-label="Back to Astronaut Academy missions"><ArrowLeft strokeWidth={3} /></button>
        <div className="text-center flex-1 mx-2">
          <h2 className="text-xl font-black text-white">{cat.emoji} {cat.name}</h2>
          <RocketProgress current={qIndex} total={cat.items.length} />
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      {/* Combo indicator */}
      {combo >= 2 && (
        <div className="text-center z-20 animate-count-up">
          <span className="text-2xl font-black text-yellow-300">
            {combo >= 4 ? '🔥'.repeat(combo) : '⚡'.repeat(combo)} {combo}!
          </span>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10">
        <div className={`bg-white/10 backdrop-blur-sm rounded-3xl p-8 max-w-lg w-full text-center ${shake ? 'animate-shake' : ''} ${combo >= 3 ? 'shadow-[0_0_30px_rgba(234,179,8,0.3)]' : ''}`}>
          <div className="flex items-center justify-center gap-3 mb-2">
            {isHeroes && profile && (
              <AstronautImage profile={profile} size={64} className="border-white/30 shadow-purple-500/30 shadow-lg" />
            )}
            <span className="text-5xl">{question.visual || '👨‍🚀'}</span>
          </div>
          <h3 className="text-2xl font-black text-white mb-6">{question.q}</h3>
          <div className="grid grid-cols-2 gap-4">
            {questionOptions.map((opt, index) => (
              <button
                key={opt.text}
                onClick={() => { playSfx('tap'); handlePick(opt); }}
                className="bg-white/10 border-2 border-white/20 text-white font-bold py-4 px-3 rounded-2xl hover:bg-white/30 active:translate-y-1 transition-all flex flex-col items-center gap-1 animate-bounce-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <span className="text-4xl">{opt.visual}</span>
                <span className="text-base">{opt.text}</span>
              </button>
            ))}
          </div>
        </div>
        {feedback && <div className="mt-4 text-3xl font-black text-yellow-300 animate-bounce">{feedback}</div>}
        {explanation && <div className="mt-2 text-xl font-bold text-white/80 bg-white/10 rounded-2xl px-6 py-3">{explanation}</div>}
      </div>

      {didYouKnow && (
        <DidYouKnowOverlay profile={didYouKnow} onDone={handleDidYouKnowDone} speak={speak} />
      )}
    </div>
  );
};

export { AstronautImage, SpaceStars, RocketProgress, DidYouKnowOverlay, HeroesGallery };
export default AstronautAcademy;
