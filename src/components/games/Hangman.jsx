import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Home, Lightbulb, RotateCcw, ShieldCheck, Sparkles, Volume2 } from 'lucide-react';
import { SoundToggle } from '../shared/index.jsx';
import DinoIcon from '../shared/DinoIcon.jsx';
import { getTaughtGraphemes, makeLearningEvent } from '../../data/literacy.js';
import { getOfflineVoiceClip } from '../../data/offlineVoice.js';
import { hangmanLettersForLevel, HANGMAN_LEVELS, hangmanWordsForLevel, makeHangmanQueue, makeHangmanSeed, markHangmanWordRescued, nextHangmanWordIndex } from '../../data/hangmanLevels.js';
import { commitHangmanLevel, hangmanPointsForRun, isHangmanLevelUnlocked, positiveHangmanRewardTransactions, readHangmanProgress, rememberHangmanWord } from '../../data/hangmanProgress.js';

const MAX_MISTAKES = 6;
const freshRound = () => ({ guessedLetters: [], roundState: 'playing', hintsUsed: 0, hadMistake: false, repeated: false });

const HangmanExperience = ({ onBack, onNextGame, onPhaseChange, playSfx = () => {}, soundOn = true, onToggleSound = () => {}, cancelNarration = () => {}, onCelebrate = () => {}, onGameEvent = () => {}, playerId = 'amari' }) => {
  const [progress, setProgress] = useState(() => readHangmanProgress(playerId));
  const [recentWords, setRecentWords] = useState(() => progress.recentWordsByLevel[progress.currentLevel] || []);
  const [phase, setPhase] = useState('intro');
  const [selectedLevel, setSelectedLevel] = useState(() => progress.currentLevel);
  const [runSeed, setRunSeed] = useState(() => makeHangmanSeed());
  const [wordIndex, setWordIndex] = useState(0);
  const [round, setRound] = useState(freshRound);
  const [runStats, setRunStats] = useState({ rescued: 0, firstTry: 0 });
  const [awaitingLevelFinish, setAwaitingLevelFinish] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [hintFeedback, setHintFeedback] = useState('');
  const [lastRewardDelta, setLastRewardDelta] = useState(null);
  const [pendingReward, setPendingReward] = useState(null);
  const taughtSounds = useMemo(() => getTaughtGraphemes(), []);
  const completedWordRef = useRef('');
  const rescuedWordIdsRef = useRef(new Set());
  const audioRef = useRef(null);
  const cancelNarrationRef = useRef(cancelNarration);
  const successRef = useRef(null);
  const runAttemptIdRef = useRef('');
  const finishingRef = useRef(false);
  const completionEventsRef = useRef(new Set());
  useEffect(() => { cancelNarrationRef.current = cancelNarration; }, [cancelNarration]);
  const stopWordAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) { audio.onended = null; audio.pause?.(); audioRef.current = null; }
    cancelNarrationRef.current();
  }, []);

  const level = HANGMAN_LEVELS[selectedLevel];
  const practiceWords = useMemo(() => makeHangmanQueue(selectedLevel, taughtSounds, { seed: runSeed, recent: recentWords }), [selectedLevel, runSeed, taughtSounds, recentWords]);
  const word = practiceWords[wordIndex] || { id: '', word: '', family: '', category: '', clue: '', emoji: '🔒' };
  const wordLetters = useMemo(() => [...new Set(word.word.split(''))], [word.word]);
  const guessedLetters = round.guessedLetters;
  const wrongLetters = useMemo(() => guessedLetters.filter((letter) => !word.word.includes(letter)), [guessedLetters, word.word]);
  const shieldsLeft = MAX_MISTAKES - wrongLetters.length;
  const isRoundOver = round.roundState !== 'playing';
  const wordAudio = useMemo(() => word.word ? getOfflineVoiceClip(word.word, 'en-US') : null, [word.word]);
  const keyboardLetters = useMemo(() => hangmanLettersForLevel(word.word, selectedLevel), [word.word, selectedLevel]);
  const poolForLevel = (index) => hangmanWordsForLevel(index, getTaughtGraphemes());
  const unlocked = (index) => isHangmanLevelUnlocked(progress, index);
  const completed = (index) => progress.completedLevels.includes(index);

  useEffect(() => { onPhaseChange?.(phase); }, [onPhaseChange, phase]);
  useEffect(() => { if (phase === 'finish') successRef.current?.focus({ preventScroll: true }); }, [phase]);
  useEffect(() => { if (!soundOn) stopWordAudio(); }, [soundOn, stopWordAudio]);
  useEffect(() => () => { audioRef.current?.pause?.(); audioRef.current && (audioRef.current.onended = null); audioRef.current = null; cancelNarrationRef.current(); }, []);

  const claimReward = useCallback((transactionId, rewardDelta) => onCelebrate('Dino level saved!', rewardDelta * 4, 0, 'hangman', { quiet: true, rewardToken: `hangman:${transactionId}` }), [onCelebrate]);
  const reconcileSavedRewards = useCallback((savedProgress) => {
    for (const transaction of positiveHangmanRewardTransactions(savedProgress)) {
      const receipt = claimReward(transaction.transactionId, transaction.rewardDelta);
      if (!receipt?.persisted) {
        setPendingReward(transaction);
        return false;
      }
    }
    setPendingReward(null);
    return true;
  }, [claimReward]);
  useEffect(() => {
    const savedProgress = readHangmanProgress(playerId);
    const timer = setTimeout(() => reconcileSavedRewards(savedProgress), 0);
    return () => clearTimeout(timer);
  }, [playerId, reconcileSavedRewards]);

  const playWordAudio = useCallback(() => {
    stopWordAudio();
    if (!soundOn || !wordAudio) return;
    const audio = new Audio(wordAudio);
    audioRef.current = audio;
    audio.onended = () => { if (audioRef.current === audio) audioRef.current = null; };
    audio.play().catch(() => { if (audioRef.current === audio) audioRef.current = null; });
  }, [soundOn, stopWordAudio, wordAudio]);

  const startLevel = (index) => {
    const nextLevel = HANGMAN_LEVELS[index];
    const nextWords = poolForLevel(index);
    if (!nextLevel || !unlocked(index) || nextWords.length < nextLevel.target) return;
    stopWordAudio();
    window.scrollTo(0, 0);
    const nextProgress = readHangmanProgress(playerId);
    setRecentWords(nextProgress.recentWordsByLevel[index] || []);
    setProgress(nextProgress); setSelectedLevel(index); setRunSeed(makeHangmanSeed()); setWordIndex(0);
    rescuedWordIdsRef.current = new Set();
    setRound(freshRound()); setRunStats({ rescued: 0, firstTry: 0 }); setAwaitingLevelFinish(false); setSaveFailed(false); setSaveStatus(''); setLastRewardDelta(null); finishingRef.current = false;
    runAttemptIdRef.current = `${nextLevel.id}-${makeHangmanSeed()}`;
    setPhase('play');
  };

  const goToLevelMap = () => {
    window.scrollTo(0, 0);
    stopWordAudio(); setPhase('intro'); setAwaitingLevelFinish(false); setSaveFailed(false);
    const savedProgress = readHangmanProgress(playerId);
    setProgress(savedProgress);
    reconcileSavedRewards(savedProgress);
  };

  const startNextWord = () => {
    if (!practiceWords.length || awaitingLevelFinish) return;
    stopWordAudio();
    if (word.word) {
      const recent = rememberHangmanWord(playerId, selectedLevel, word.word);
      if (recent.persisted) setProgress(recent);
    }
    completedWordRef.current = '';
    setHintFeedback('');
    setRound(freshRound());
    setWordIndex((index) => nextHangmanWordIndex(practiceWords, index, rescuedWordIdsRef.current));
    if (soundOn) playSfx('swish');
  };

  const retryWord = () => {
    if (round.roundState !== 'lost') return;
    stopWordAudio(); completedWordRef.current = '';
    setRound({ ...freshRound(), hadMistake: true, hintsUsed: round.hintsUsed });
    if (soundOn) playSfx('launch');
  };

  const finishLevel = () => {
    if (!awaitingLevelFinish || finishingRef.current) return;
    finishingRef.current = true;
    stopWordAudio();
    const points = hangmanPointsForRun(runStats.firstTry, level.target);
    const result = commitHangmanLevel(playerId, selectedLevel, points, undefined, runAttemptIdRef.current);
    if (!result.persisted) {
      finishingRef.current = false; setSaveFailed(true); setSaveStatus(result.error || 'Progress could not be verified. Retry before finishing this level.');
      return;
    }
    if (result.rewardDelta > 0) {
      const receipt = claimReward(runAttemptIdRef.current, result.rewardDelta);
      if (!receipt?.persisted) {
        finishingRef.current = false;
        setPendingReward({ transactionId: runAttemptIdRef.current, levelIndex: selectedLevel, rewardDelta: result.rewardDelta });
        setSaveFailed(true); setSaveStatus('The level result is saved, but its reward could not be confirmed. Retry before leaving this result.');
        return;
      }
    }
    setPendingReward(null);
    setProgress(result); setSaveFailed(false); setSaveStatus(result.rewardDelta > 0 ? 'Level and reward saved. Your best score is recorded.' : 'Level saved. Your previous best stays in place.');
    setLastRewardDelta(result.rewardDelta); setAwaitingLevelFinish(false); setPhase('finish');
    if (!completionEventsRef.current.has(runAttemptIdRef.current)) {
      completionEventsRef.current.add(runAttemptIdRef.current);
      onGameEvent?.('hangman', 'level_completed', { levelId: level.id, levelIndex: selectedLevel, attemptId: runAttemptIdRef.current, rescued: runStats.rescued, firstTryRescues: runStats.firstTry, points, replay: !result.newlyCompleted, rewardDelta: result.rewardDelta });
    }
  };

  const retryPendingReward = () => {
    if (!pendingReward) return;
    const receipt = claimReward(pendingReward.transactionId, pendingReward.rewardDelta);
    if (receipt?.persisted) {
      setPendingReward(null);
      setSaveFailed(false);
      setSaveStatus('Saved reward confirmed.');
      if (phase === 'play' && awaitingLevelFinish) finishLevel();
    } else {
      setSaveStatus('Saved level is safe. Reward storage still needs a successful Retry.');
    }
  };

  const chooseLetter = useCallback((letter, { fromHint = false } = {}) => {
    if (round.roundState !== 'playing' || guessedLetters.includes(letter) || !word.word) return;
    const nextGuessed = [...guessedLetters, letter];
    setRound((current) => ({ ...current, guessedLetters: nextGuessed }));
    if (word.word.includes(letter)) {
      const solved = wordLetters.every((wordLetter) => nextGuessed.includes(wordLetter));
      if (solved && completedWordRef.current !== word.id) {
        completedWordRef.current = word.id;
        const firstTry = wrongLetters.length === 0 && round.hintsUsed === 0 && !fromHint && !round.hadMistake;
        const hints = round.hintsUsed || fromHint ? 1 : 0;
        const rescue = markHangmanWordRescued(rescuedWordIdsRef.current, word.id);
        rescuedWordIdsRef.current = rescue.rescuedWordIds;
        if (rescue.alreadyRescued) {
          setRound((current) => ({ ...current, roundState: 'won', repeated: true }));
          if (soundOn) playSfx('click');
          playWordAudio();
          const replay = progress.completedLevels.includes(selectedLevel);
          onGameEvent('hangman', 'word_repeated', { levelId: level.id, levelIndex: selectedLevel, attemptId: runAttemptIdRef.current, wordId: word.id, firstAttempt: firstTry, hints, replay, masteryEligible: false });
          onGameEvent('hangman', 'learning_attempt', makeLearningEvent({
            skill: 'known-word-consolidation', item: word.word, response: word.word, correct: true,
            firstTry, hints, difficulty: 'practice',
            extra: { masteryEligible: false, rescuedThisRun: false, family: word.family, levelId: level.id, category: word.category },
          }));
          return;
        }
        const nextStats = { rescued: runStats.rescued + 1, firstTry: runStats.firstTry + (firstTry ? 1 : 0) };
        setRunStats(nextStats); setRound((current) => ({ ...current, roundState: 'won' }));
        if (soundOn) playSfx('complete');
        playWordAudio();
        const replay = progress.completedLevels.includes(selectedLevel);
        onGameEvent('hangman', 'word_completed', { levelId: level.id, levelIndex: selectedLevel, attemptId: runAttemptIdRef.current, wordId: word.id, rescued: nextStats.rescued, firstAttempt: firstTry, hints, replay, masteryEligible: false });
        onGameEvent('hangman', 'learning_attempt', makeLearningEvent({
          skill: 'known-word-consolidation', item: word.word, response: word.word, correct: true,
          firstTry, hints, difficulty: 'practice',
          extra: { masteryEligible: false, family: word.family, levelId: level.id, category: word.category },
        }));
        if (nextStats.rescued >= level.target) setAwaitingLevelFinish(true);
      } else if (!solved) {
        if (soundOn) playSfx(fromHint ? 'sparkle' : 'pop');
      }
      return;
    }
    const nextMistakes = nextGuessed.filter((guess) => !word.word.includes(guess)).length;
    if (nextMistakes >= MAX_MISTAKES) {
      setRound((current) => ({ ...current, guessedLetters: nextGuessed, roundState: 'lost', hadMistake: true }));
      if (soundOn) playSfx('oops');
      onGameEvent('hangman', 'word_missed', { levelId: level.id, levelIndex: selectedLevel, attemptId: runAttemptIdRef.current, wordId: word.id, mistakes: nextMistakes, hints: round.hintsUsed, masteryEligible: false });
    } else {
      setRound((current) => ({ ...current, hadMistake: true }));
      if (soundOn) playSfx('oops');
    }
  }, [completedWordRef, guessedLetters, level, onGameEvent, playSfx, playWordAudio, progress.completedLevels, round, runStats, selectedLevel, soundOn, word.id, word.word, word.category, word.family, wordLetters, wrongLetters]);

  const useHint = () => {
    if (round.roundState !== 'playing' || round.hintsUsed >= 1) return;
    const letterToReveal = wordLetters.find((letter) => !guessedLetters.includes(letter));
    if (!letterToReveal) return;
    setRound((current) => ({ ...current, hintsUsed: 1 }));
    setHintFeedback('Star hint: one hidden letter is now revealed. This round counts as helped.');
    if (soundOn) playSfx('sparkle');
    chooseLetter(letterToReveal, { fromHint: true });
  };

  useEffect(() => {
    if (phase !== 'play') return undefined;
    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const letter = event.key.toUpperCase();
      if (/^[A-Z]$/.test(letter) && keyboardLetters.includes(letter)) {
        event.preventDefault(); chooseLetter(letter);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [chooseLetter, keyboardLetters, phase]);

  const statusMessage = round.roundState === 'won' ? round.repeated ? 'Word already rescued' : 'Word rescued!' : round.roundState === 'lost' ? `The word was ${word.word}` : `${shieldsLeft} shield${shieldsLeft === 1 ? '' : 's'} left`;

  if (phase === 'intro') return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-[#07132f] px-4 pb-8 pt-4 text-white">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <button onClick={onBack} className="game-icon-button" aria-label="Back to home"><Home /></button>
        <div className="min-w-0 text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-200">Letter rescue mission</p><h1 className="text-2xl font-black sm:text-4xl">Dino Hangman</h1></div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} className="!bg-white/15 !text-white" />
      </header>
      <main className="mx-auto mt-3 grid max-w-5xl gap-5 lg:mt-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)]">
        <section className="rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur-xl sm:p-7">
          <div className="flex items-center gap-4"><DinoIcon species="trex" size={80} /><div><p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-200">Choose your rescue</p><h2 className="text-2xl font-black">Four levels of word clues</h2></div></div>
          <p className="mt-4 text-white/80">Use the picture and meaning clue, then choose letters. Longer words unlock as you rescue words. Only words made from the selected taught sounds appear.</p>
          {!progress.persistenceSafe && <p className="mt-3 rounded-xl border border-amber-200/40 bg-amber-100/10 p-3 text-sm font-bold text-amber-100" role="status">Saved progress cannot be checked safely. You can practise the first level, but rewards and unlocks are paused until saved data can be verified.</p>}
          {pendingReward && <div className="mt-3 rounded-xl border border-rose-200/40 bg-rose-100/10 p-3 text-sm font-bold text-rose-50" role="alert"><p>A saved level reward still needs confirmation. Retry it before leaving this game.</p><button onClick={retryPendingReward} className="mt-2 min-h-12 rounded-xl bg-white px-4 font-black text-slate-900">Retry saved reward</button></div>}
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-lime-200/30 bg-lime-200/10 p-3 sm:p-4">
            <button type="button" onClick={() => startLevel(selectedLevel)} disabled={!unlocked(selectedLevel) || poolForLevel(selectedLevel).length < HANGMAN_LEVELS[selectedLevel].target} className="min-h-14 rounded-2xl bg-gradient-to-b from-lime-400 to-green-600 px-5 font-black text-white shadow-[0_5px_0_#166534] disabled:cursor-not-allowed disabled:opacity-40">Start {HANGMAN_LEVELS[selectedLevel].name} →</button>
            <p className="min-w-0 flex-1 text-sm text-white/80"><strong className="text-white">{HANGMAN_LEVELS[selectedLevel].lengthLabel} · rescue {HANGMAN_LEVELS[selectedLevel].target}</strong><br />Progress saves separately for each child. Replaying keeps your best score.</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2" aria-label="Hangman levels">
            {HANGMAN_LEVELS.map((item, index) => {
              const levelWords = poolForLevel(index);
              const isUnlocked = unlocked(index);
              const isCompleted = completed(index);
              return <button key={item.id} type="button" disabled={!isUnlocked || levelWords.length < item.target} onClick={() => setSelectedLevel(index)} aria-pressed={selectedLevel === index} className={`min-h-28 rounded-2xl border p-4 text-left transition ${selectedLevel === index ? 'border-fuchsia-200 bg-fuchsia-300/20 ring-2 ring-fuchsia-200' : isUnlocked ? 'border-white/20 bg-black/15 hover:bg-white/10' : 'cursor-not-allowed border-white/10 bg-black/20 opacity-55'}`}>
                <span className="flex items-center justify-between gap-2"><strong className="text-lg">{index + 1}. {item.name}</strong><span>{isCompleted ? '✓ Complete' : isUnlocked ? 'Unlocked' : '🔒 Locked'}</span></span>
                <span className="mt-1 block font-bold text-cyan-100">{item.lengthLabel} · rescue {item.target}</span>
                <span className="mt-1 block text-sm text-white/75">{levelWords.length < item.target ? 'Choose more taught sounds to build this word pool.' : item.description}</span>
              </button>;
            })}
          </div>
        </section>
        <aside className="flex flex-col justify-center rounded-[2rem] border border-white/15 bg-slate-950/35 p-6">
          <div className="flex items-center justify-between"><h2 className="text-2xl font-black">How to play</h2><ShieldCheck className="text-cyan-300" size={28} /></div>
          <ol className="mt-4 list-inside list-decimal space-y-3 text-white/80"><li>Read the clue or hear the recorded word when a clip is available.</li><li>Pick a letter. A wrong guess uses one of six shields.</li><li>A star can reveal one letter. It lowers the first-try score.</li><li>After each result, choose New word or Finish level. The answer stays visible.</li></ol>
          <p className="mt-4 rounded-xl bg-cyan-100/10 p-3 text-sm font-bold text-cyan-50">Selected sounds are checked before every word is shown.</p>
        </aside>
      </main>
    </div>
  );

  if (!practiceWords.length || practiceWords.length < level.target) return <div className="min-h-[100dvh] bg-slate-950 p-6 text-white"><h1 className="text-2xl font-black">More sounds needed</h1><p className="my-4">There are not enough words at this level using the sounds selected in Grown-ups. Choose an earlier level or review the sound selection together.</p><button className="min-h-12 rounded-xl bg-white px-5 text-slate-900" onClick={goToLevelMap}>Back to levels</button></div>;

  if (phase === 'finish') return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-[#07132f] px-4 pb-8 pt-4 text-white" data-hangman-level={level.id} data-hangman-phase="finish">
      <header className="mx-auto flex max-w-4xl items-center justify-between gap-3"><button onClick={onBack} className="game-icon-button" aria-label="Back to home"><Home /></button><div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-200">Dino Hangman</p><h1 className="text-2xl font-black">{level.name} complete</h1></div><SoundToggle soundOn={soundOn} onToggle={onToggleSound} className="!bg-white/15 !text-white" /></header>
      <main className="mx-auto mt-8 max-w-xl rounded-[2rem] border border-white/15 bg-white/10 p-6 text-center shadow-2xl" tabIndex={-1} ref={successRef}>
        <DinoIcon species="trex" size={112} className="mx-auto" /><Sparkles className="mx-auto mt-2 text-amber-300" size={32} />
        <h2 className="mt-3 text-3xl font-black">{saveStatus || 'Your level result is saved.'}</h2>
        <p className="mt-3 text-white/80">You rescued {runStats.rescued} words. First-try rescues: {runStats.firstTry} of {runStats.rescued}.</p>
        <p className="mt-2 font-bold text-amber-200">{lastRewardDelta > 0 ? `${lastRewardDelta} reward points added to this level’s best.` : 'No new points this time. Your saved best remains.'}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3"><button onClick={goToLevelMap} className="min-h-12 rounded-xl bg-white/15 px-5 font-black">Level map</button>{selectedLevel < HANGMAN_LEVELS.length - 1 && unlocked(selectedLevel + 1) && <button onClick={() => startLevel(selectedLevel + 1)} className="min-h-12 rounded-xl bg-lime-500 px-5 font-black">Next level →</button>}{selectedLevel === HANGMAN_LEVELS.length - 1 && onNextGame && <button onClick={onNextGame} className="min-h-12 rounded-xl bg-lime-500 px-5 font-black">Next game →</button>}</div>
      </main>
    </div>
  );

  return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-[#07132f] text-white relative" data-hangman-level={level.id} data-hangman-phase="play" data-hangman-seed={runSeed}>
      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pt-2 sm:px-7 sm:pt-4">
        <button onClick={onBack} className="game-icon-button" aria-label="Back to home"><Home /></button>
        <div className="min-w-0 text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-fuchsia-200">Level {selectedLevel + 1} of {HANGMAN_LEVELS.length} · {level.lengthLabel}</p><h1 className="text-2xl font-black sm:text-4xl">Dino Hangman</h1></div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} className="!bg-white/15 !text-white" />
      </header>
      <main className="relative z-10 mx-auto grid max-w-6xl gap-3 px-2 pb-5 pt-2 sm:gap-4 sm:px-4 sm:pb-8 sm:pt-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,.95fr)] lg:items-start">
        <section className="rounded-[1.5rem] border border-white/15 bg-white/10 p-2 shadow-2xl backdrop-blur-xl sm:rounded-[2rem] sm:p-5 xl:p-7">
          <div className="flex flex-nowrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-fuchsia-400/20 text-2xl">{word.emoji}</div><div className="min-w-0"><p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-fuchsia-200 sm:text-xs sm:tracking-[0.2em]">{level.lengthLabel} · {word.category}</p><p className="text-base font-black sm:text-lg" aria-live="polite">{statusMessage}</p></div></div>
            <div className="flex items-center gap-2 rounded-xl bg-black/20 px-2 py-1.5 sm:gap-4 sm:rounded-2xl sm:px-4 sm:py-2">
              <p className="text-sm font-black text-amber-300" aria-label={`${runStats.rescued} of ${level.target} rescued`}>{runStats.rescued}/{level.target} ⭐</p>
              <p className="text-sm font-bold text-cyan-100" aria-label={`${shieldsLeft} of ${MAX_MISTAKES} shields remaining`}>🛡️ {shieldsLeft}/{MAX_MISTAKES}</p>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-3"><p className="min-h-11 min-w-0 flex-1 rounded-xl bg-cyan-100/10 p-2.5 font-bold leading-snug text-cyan-50 sm:min-h-12 sm:rounded-2xl sm:p-3">{word.clue}</p>{wordAudio ? <button aria-label="Hear the word" onClick={playWordAudio} disabled={!soundOn} className="min-h-12 shrink-0 rounded-xl bg-white/15 px-3 font-black disabled:opacity-50"><Volume2 size={18} className="mr-1 inline" />Hear</button> : <p className="max-w-36 rounded-xl bg-white/5 px-2 py-2 text-xs leading-tight text-white/60">Use the clue and choose letters.</p>}</div>
          {hintFeedback && <p className="mt-2 rounded-xl bg-amber-200/10 px-2 py-1 text-xs font-bold text-amber-100 sm:p-3 sm:text-sm" role="status" aria-label={hintFeedback}><span aria-hidden="true">Hint: one letter revealed · helped</span></p>}
          <div className="mt-2 rounded-2xl border border-white/10 bg-slate-950/45 p-2 sm:mt-4 sm:rounded-[1.75rem] sm:p-6"><div className="flex flex-wrap items-end justify-center gap-1 sm:gap-3" aria-label={`Word has ${word.word.length} letters`}>{word.word.split('').map((letter, index) => {
            const visible = guessedLetters.includes(letter) || round.roundState !== 'playing';
            return <div key={`${letter}-${index}`} className={`grid h-11 w-8 place-items-center rounded-lg border-b-4 text-xl font-black sm:h-20 sm:w-14 sm:rounded-xl sm:text-4xl ${visible ? 'border-fuchsia-300 bg-white text-slate-900' : 'border-white/50 bg-white/10 text-transparent'}`} aria-label={visible ? `Letter ${letter}` : `Letter ${index + 1}, hidden`}>{visible ? letter : '•'}</div>;
          })}</div></div>
          {round.roundState !== 'playing' && <p className={`mt-2 rounded-xl p-2 text-sm font-bold sm:p-3 ${round.roundState === 'won' ? 'bg-emerald-300/15 text-emerald-50' : 'bg-rose-500/15 text-rose-50'}`} role="status">{round.roundState === 'won' ? round.repeated ? `Already rescued: ${word.word}. Choose a different word. ${word.clue}` : `Word rescued: ${word.word}. ${word.clue}` : `The word was ${word.word}. ${word.clue}`}</p>}
          <div className="mt-2 flex flex-nowrap items-center justify-center gap-1.5 sm:mt-4 sm:flex-wrap sm:gap-2">
            <button aria-label="Reveal one letter" onClick={useHint} disabled={round.hintsUsed >= 1 || isRoundOver} className="min-h-12 min-w-0 rounded-xl bg-amber-300/15 px-2 font-black disabled:opacity-40 sm:px-4"><Lightbulb size={18} className="mr-1 inline" /><span className="sm:hidden">{round.hintsUsed ? 'Used' : 'Hint'}</span><span className="hidden sm:inline">{round.hintsUsed ? 'Star used' : 'Reveal one letter'}</span></button>
            <button aria-label="Level map" onClick={goToLevelMap} className="min-h-12 min-w-0 rounded-xl bg-white/10 px-2 font-black sm:px-4"><ArrowLeft size={18} className="mr-1 inline" /><span className="sm:hidden">Levels</span><span className="hidden sm:inline">Level map</span></button>
            {round.roundState === 'lost' && <button aria-label="Try this word again" onClick={retryWord} className="min-h-12 min-w-0 rounded-xl bg-rose-400/20 px-2 font-black sm:px-4"><span className="sm:hidden">Retry</span><span className="hidden sm:inline">Try this word again</span></button>}
            {round.roundState === 'won' && awaitingLevelFinish && <button aria-label={saveFailed ? 'Retry save level' : 'Finish level'} onClick={finishLevel} className="min-h-12 min-w-0 rounded-xl bg-lime-500 px-3 font-black sm:px-5"><span className="sm:hidden">{saveFailed ? 'Retry' : 'Finish'}</span><span className="hidden sm:inline">{saveFailed ? 'Retry save level' : 'Finish level →'}</span></button>}
            {round.roundState === 'won' && !awaitingLevelFinish && <button aria-label="Next word" onClick={startNextWord} className="min-h-12 min-w-0 rounded-xl bg-white/15 px-2 font-black sm:px-4"><RotateCcw size={18} className="mr-1 inline" /><span className="sm:hidden">Next</span><span className="hidden sm:inline">Next word</span></button>}
            {round.roundState === 'lost' && <button aria-label="Next word" onClick={startNextWord} className="min-h-12 min-w-0 rounded-xl bg-white/15 px-2 font-black sm:px-4"><span className="sm:hidden">Next</span><span className="hidden sm:inline">Next word</span></button>}
            {round.roundState === 'playing' && <button aria-label="Skip word" onClick={startNextWord} className="min-h-12 min-w-0 rounded-xl bg-white/10 px-2 font-black sm:px-4"><span className="sm:hidden">Skip</span><span className="hidden sm:inline">Skip word</span></button>}
          </div>
          {saveFailed && <p className="mt-2 rounded-xl border border-rose-300/40 bg-rose-500/15 p-2 text-sm font-bold" role="alert">{saveStatus} Your result is still here. Choose Retry above.</p>}
          {awaitingLevelFinish && !saveFailed && <p className="mt-3 rounded-xl bg-emerald-300/15 p-3 font-bold text-emerald-50" role="status">Your last word is safe here. Read the clue and explanation, then choose Finish level.</p>}
          {round.roundState === 'playing' && <div className="mt-2 sm:mt-5" role="group" aria-label="Helpful letter choices"><p className="mb-2 text-center text-xs font-bold text-cyan-100 sm:mb-3 sm:text-sm">Choose a letter — wrong guesses use one shield</p><div className="mx-auto grid w-full max-w-2xl grid-cols-7 gap-1 sm:grid-cols-9 sm:gap-2">{keyboardLetters.map((letter) => {
            const guessed = guessedLetters.includes(letter); const correct = guessed && word.word.includes(letter); const wrong = guessed && !correct;
            return <button key={letter} type="button" onClick={() => chooseLetter(letter)} disabled={guessed || isRoundOver || awaitingLevelFinish} className={`grid min-h-11 min-w-11 place-items-center rounded-lg border px-0 text-base font-black transition sm:min-h-14 sm:min-w-14 sm:rounded-xl sm:px-1 sm:text-xl ${correct ? 'border-emerald-300 bg-emerald-400 text-emerald-950' : wrong ? 'border-rose-400/30 bg-rose-500/25 text-rose-100 line-through' : 'border-white/15 bg-white/10 text-white hover:border-fuchsia-300/70 hover:bg-white/15 disabled:cursor-default'}`} aria-label={`${letter}${guessed ? correct ? ', correct letter' : ', not in the word' : ''}`}>{letter}</button>;
          })}</div></div>}
        </section>
        <aside className="hidden rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl lg:block lg:p-6">
          <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Dino shield bay</p><h2 className="mt-1 text-2xl font-black">Keep Dino safe!</h2></div><DinoIcon species="trex" size={78} className="animate-bounce-slow" /></div>
          <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4"><div className="flex items-center justify-between text-sm font-bold text-white/70"><span>Comet shields</span><span>{wrongLetters.length}/{MAX_MISTAKES} used</span></div><div className="mt-3 grid grid-cols-3 gap-3" aria-label={`${shieldsLeft} of ${MAX_MISTAKES} comet shields remaining`}>{Array.from({ length: MAX_MISTAKES }, (_, index) => {
            const hit = index < wrongLetters.length;
            return <div key={index} className={`grid aspect-square place-items-center rounded-2xl border text-3xl transition ${hit ? 'border-rose-400/25 bg-rose-500/15 grayscale' : 'border-cyan-300/40 bg-cyan-300/15 shadow-[0_0_18px_rgba(103,232,249,0.12)]'}`} aria-label={hit ? `Shield ${index + 1} used` : `Shield ${index + 1} ready`}>{hit ? '💥' : '🛡️'}</div>;
          })}</div></div>
          {wrongLetters.length > 0 && <div className="mt-4 rounded-2xl border border-rose-300/15 bg-rose-500/10 p-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-rose-200">Try different letters</p><p className="mt-2 text-xl font-black tracking-[0.3em] text-white">{wrongLetters.join(' ')}</p></div>}
          {round.roundState === 'won' && <div className="mt-4 rounded-2xl border border-amber-300/40 bg-amber-300/15 p-4 text-amber-50" role="status"><p className="font-black">{round.repeated ? 'Already rescued in this level.' : 'Dino says: brilliant spelling!'}</p><p className="mt-1 text-sm">{awaitingLevelFinish ? 'This was the last rescue for this level. Your answer stays visible until you finish.' : 'Your word stays visible until you choose another word.'}</p></div>}
          {round.roundState === 'lost' && <div className="mt-4 rounded-2xl border border-rose-300/40 bg-rose-500/15 p-4 text-white" role="status"><p className="font-black">Dino showed you the word: {word.word}</p><p className="mt-1 text-sm">Try it again or choose another word. Your answer stays on screen.</p></div>}
          <div className="mt-4 rounded-2xl bg-black/20 p-4 text-sm text-white/75"><div className="flex items-center gap-2 text-white"><ShieldCheck size={19} className="text-cyan-300" /><strong>How to play</strong></div><p className="mt-2">Use the meaning clue or a recorded word when available. Each wrong letter uses one shield. A star reveals one letter, but it lowers the first-try score.</p></div>
        </aside>
      </main>
    </div>
  );
};

const DinoHangman = (props) => <HangmanExperience key={props.playerId || 'amari'} {...props} />;

export default DinoHangman;
