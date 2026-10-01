import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { getPraise } from '../../utils.js';
import { PracticeProgress, SoundToggle } from '../shared/index.jsx';
import { makeLearningEvent } from '../../data/literacy.js';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';
import { buildLetterLaunchRound, letterLaunchExplanation, letterLaunchNextSoundPrompt, letterLaunchPromptFor, letterLaunchSessionTarget, letterLaunchRandomFor } from '../../data/letterLaunch.js';
import rocketArt from '../../assets/little/fuel-rocket.webp';
import launchWorld from '../../assets/little/bg-fuelup.webp';
import './letterLaunch.css';

const historyKey = (playerId, level) => `${playerId || 'amari'}_letter_launch_recent_v1_${level}`;
const loadRecentKeys = (playerId, level) => {
  try {
    const value = JSON.parse(window.localStorage.getItem(historyKey(playerId, level)) || '[]');
    return Array.isArray(value) ? value.filter((item) => typeof item === 'string').slice(-8) : [];
  } catch { return []; }
};
const saveRecentKeys = (playerId, level, values) => {
  try { window.localStorage.setItem(historyKey(playerId, level), JSON.stringify(values.slice(-8))); } catch { /* progress storage is optional */ }
};

const LetterLaunch = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent, onReviewComplete, playerId, sessionLevel = 0 }) => {
  const difficulty = useGameDifficulty('letters');
  const [runSeed] = useState(() => Math.floor(Math.random() * 4294967296));
  const [recentKeys, setRecentKeys] = useState(() => loadRecentKeys(playerId, sessionLevel));
  const [round, setRound] = useState(() => buildLetterLaunchRound(sessionLevel, loadRecentKeys(playerId, sessionLevel), letterLaunchRandomFor(runSeed)));
  const [launching, setLaunching] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [roundCount, setRoundCount] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [skillRun, setSkillRun] = useState(0);
  const [hadMistake, setHadMistake] = useState(false);
  const [pendingAdvance, setPendingAdvance] = useState(false);
  const answeredRef = useRef(false);
  const loggedRoundRef = useRef(null);
  const levelTarget = letterLaunchSessionTarget(sessionLevel);
  const promptText = round.kind === 'unavailable' ? '' : letterLaunchPromptFor(round);
  const optionCount = round.kind === 'build-word' ? round.tiles.length : round.options.length;
  const optionColumns = optionCount <= 2 ? 'grid-cols-2' : optionCount <= 3 ? 'grid-cols-3' : 'grid-cols-4';

  const sayPrompt = useCallback(() => {
    speak(promptText);
  }, [promptText, speak]);

  useEffect(() => {
    sayPrompt();
  }, [sayPrompt]);

  useEffect(() => {
    if (loggedRoundRef.current === round) return;
    loggedRoundRef.current = round;
    if (roundCount === 0) onGameEvent?.('letters', 'start', { level: sessionLevel, round: 0, seed: runSeed });
    onGameEvent?.('letters', 'question', { level: sessionLevel, round: roundCount, seed: runSeed });
  }, [round, roundCount, onGameEvent, sessionLevel, runSeed]);

  const acceptAnswer = (response) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    const praise = getPraise();
    const nextCount = roundCount + 1;
    const finalRound = nextCount >= levelTarget;
    const expected = round.kind === 'build-word' ? round.target.word : round.target.letter.toLowerCase();
    const skill = round.kind === 'build-word' ? 'cvc-blending'
      : round.kind === 'case-match' ? 'letter-cases'
        : sessionLevel === 0 ? 'letter-sounds' : 'initial-sounds';
    setLaunching(true);
    setFeedback(`${praise} ${letterLaunchExplanation(round)}`);
    setPendingAdvance(true);
    setRoundCount(nextCount);
    setSkillRun(nextCount);
    playSfx('launch');
    playSfx('success');
    onCelebrate(praise, 4, 250);
    onGameEvent?.('letters', 'answer_correct', {
      skill,
      item: round.key,
      response,
      expected,
      correct: true,
      firstAttempt: !hadMistake,
      independent: !hadMistake,
      difficulty,
      level: sessionLevel,
      round: roundCount,
      seed: runSeed,
      deferFinish: finalRound,
    });
    onGameEvent?.('letters', 'learning_attempt', makeLearningEvent({ skill, item: round.key, response, correct: true, firstTry: !hadMistake, difficulty }));
  };

  const handlePick = (option) => {
    if (answeredRef.current || pendingAdvance) return;
    if (round.kind === 'build-word') {
      const expected = round.target.graphemes[selectedLetters.length];
      if (option.grapheme !== expected) {
        onGameEvent?.('letters', 'answer_attempt', { level: sessionLevel, round: roundCount, seed: runSeed, firstAttempt: !hadMistake });
        setHadMistake(true);
        setFeedback(`Listen for /${expected}/, the next sound in ${round.target.word.toLowerCase()}. Try again.`);
        playSfx('oops');
        return;
      }
      const nextLetters = [...selectedLetters, option.grapheme];
      setSelectedLetters(nextLetters);
      if (nextLetters.length === round.target.graphemes.length) acceptAnswer(nextLetters.join(''));
      else {
        setFeedback('Good. Now choose the next sound.');
        playSfx('tap');
      }
      return;
    }
    if (option.letter.toLowerCase() === round.target.letter.toLowerCase()) {
      acceptAnswer(option.letter.toLowerCase());
    } else {
      onGameEvent?.('letters', 'answer_attempt', { level: sessionLevel, round: roundCount, seed: runSeed, firstAttempt: !hadMistake });
      setHadMistake(true);
      setFeedback(round.kind === 'case-match'
        ? `Look at little ${round.target.letter.toLowerCase()} again. Which capital letter matches its shape?`
        : `Not quite. Listen for the first sound in ${round.target.word} again.`);
      playSfx('oops');
    }
  };

  const advance = () => {
    if (!pendingAdvance) return;
    // Store every completed target, including the last one in a level. The
    // history must survive the GameSession remount that follows review.
    const nextRecentKeys = [...recentKeys, round.key].slice(-8);
    setRecentKeys(nextRecentKeys);
    saveRecentKeys(playerId, sessionLevel, nextRecentKeys);
    if (roundCount >= levelTarget) {
      onReviewComplete?.();
      return;
    }
    setRound(buildLetterLaunchRound(sessionLevel, nextRecentKeys, letterLaunchRandomFor(runSeed, roundCount)));
    answeredRef.current = false;
    setLaunching(false);
    setFeedback('');
    setHadMistake(false);
    setPendingAdvance(false);
    setSelectedLetters([]);
  };

  if (round.kind === 'unavailable') return (
    <div className="letter-launch min-h-screen flex flex-col items-center justify-center gap-5 bg-gradient-to-b from-[#060e46] via-[#153e9c] to-[#8ddcff] px-5 text-center text-white">
      <h1 className="text-3xl font-black">This letter level needs a taught single letter sound.</h1>
      <p className="max-w-lg text-lg font-semibold">Choose at least one taught sound in the Phonics learning profile, then come back to Letter Launch.</p>
      <button type="button" onClick={onBack} className="min-h-14 rounded-full bg-amber-400 px-8 font-black text-slate-950">Back to learning world</button>
    </div>
  );

  return (
    <div className="letter-launch min-h-screen flex flex-col relative overflow-hidden text-white" style={{ backgroundImage: `linear-gradient(180deg, rgba(6,14,70,.6), rgba(6,14,70,.12) 55%, rgba(6,14,70,.35)), url(${launchWorld})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-44 h-24 bg-cyan-200/10 rounded-full blur-2xl animate-drift-left" />
        <div className="absolute top-24 right-6 w-52 h-28 bg-purple-200/10 rounded-full blur-2xl animate-drift-right" />
        <div className="absolute bottom-20 left-6 w-64 h-32 bg-amber-200/10 rounded-full blur-3xl" />
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
          <p className="font-semibold text-cyan-100">Level {sessionLevel + 1} · {Math.min(roundCount + 1, levelTarget)} of {levelTarget}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 relative z-10">
        <PracticeProgress skill={['Hear the letter', 'Find the first sound', 'Match big and little letters', 'Blend the sounds'][sessionLevel] || 'Letter mission'} completed={skillRun} target={levelTarget} accent="sky" />
        <div className="letter-launch-panel mb-5 w-full max-w-2xl rounded-[2.5rem] border-4 border-cyan-200 bg-white/95 p-5 text-center text-slate-900 shadow-xl sm:p-7">
          <p className="mb-2 font-black uppercase tracking-wider text-blue-600">{round.kind === 'build-word' ? 'Blend a word' : round.kind === 'case-match' ? 'Big and little letters' : sessionLevel === 0 ? 'Listen and launch' : 'First sound mission'}</p>
          <div className="letter-launch-clue" aria-label={round.kind === 'case-match' ? `Little letter ${round.target.letter.toLowerCase()}` : round.kind === 'letter-sound' ? 'Listen for the sound' : `Picture clue for ${round.target.word}`}>
            {round.kind === 'case-match' ? round.target.letter.toLowerCase() : round.kind === 'letter-sound' ? '👂' : round.target.emoji}
          </div>
          <p className="mb-1 text-lg font-bold text-slate-700">{round.kind === 'build-word' ? 'Choose the sounds in order to build the word' : round.kind === 'case-match' ? 'Choose its capital letter' : sessionLevel === 0 ? 'Listen to the word and find its first letter' : 'Listen for the first sound, then choose its letter'}</p>
          <button onClick={sayPrompt} className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-full bg-blue-600 px-5 font-black text-white shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300">
            <Volume2 size={22} /> Hear the clue again
          </button>
        </div>

        {round.kind === 'build-word' && <div className="mb-4 flex flex-wrap items-center justify-center gap-2" aria-label={`${selectedLetters.length} of ${round.target.graphemes.length} sounds placed`}>
          {round.target.graphemes.map((_, index) => <span key={`${round.key}-slot-${index}`} className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-dashed border-blue-400 bg-sky-50 text-3xl font-black text-blue-800">{selectedLetters[index]?.toUpperCase() || '·'}</span>)}
          <button type="button" onClick={() => speak(letterLaunchNextSoundPrompt(round.target.graphemes[selectedLetters.length]))} disabled={selectedLetters.length >= round.target.graphemes.length} className="ml-2 inline-flex min-h-12 items-center gap-2 rounded-full bg-blue-600 px-4 font-black text-white disabled:opacity-50"><Volume2 size={20} /> Hear next sound</button>
        </div>}
        <div className={`grid w-full max-w-2xl gap-4 ${optionColumns}`}>
          {(round.kind === 'build-word' ? round.tiles : round.options).map((option) => {
            const label = round.kind === 'build-word' ? option.grapheme.toUpperCase() : option.letter;
            const chosen = round.kind === 'build-word' && selectedLetters.includes(option.grapheme);
            return <button
              key={round.kind === 'build-word' ? option.id : option.letter}
              onClick={() => handlePick(option)}
              disabled={pendingAdvance || chosen}
              className="letter-launch-choice rounded-3xl border-4 border-cyan-200 bg-white py-6 text-4xl font-black text-blue-800 shadow-lg transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300"
            >{label}</button>;
          })}
        </div>

        {feedback && <div className="mt-4 w-full max-w-2xl rounded-2xl border-2 border-cyan-200 bg-white/95 p-4 text-center text-lg font-bold text-indigo-700 shadow-md" aria-live="polite">{feedback}</div>}
        {pendingAdvance && <button type="button" onClick={advance} className="mt-3 min-h-14 rounded-full bg-amber-400 px-8 font-black text-slate-950 shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-blue-700">{roundCount >= levelTarget ? 'Finish level' : 'Next mission'}</button>}

        <div className="pointer-events-none relative mt-4 h-48 w-full max-w-2xl overflow-hidden" aria-hidden="true">
          <div className="absolute bottom-0 w-full h-10 bg-sky-300/70 rounded-full" />
          <img
            src={rocketArt}
            alt=""
            className="absolute bottom-6 left-6 h-24 w-24 object-contain transition-transform duration-1000"
            style={{
              transform: launching ? 'translate(160px, -64px) rotate(-10deg)' : 'translate(0, 0)',
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
