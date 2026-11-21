import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FocusMenu } from '../shared/FocusMenu.jsx';
import rescueDinoArt from '../../assets/little/detective-trex.webp';
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
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(() => progress.currentLevel);
  const [clueOnly, setClueOnly] = useState(false);
  useLayoutEffect(() => { window.scrollTo(0, 0); }, [phase, selectedLevel]);
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

  const revealHint = () => {
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

  const closeOptions = () => setOptionsOpen(false);
  const nextLevel = HANGMAN_LEVELS[selectedLevel + 1];
  const canStart = index => unlocked(index) && poolForLevel(index).length >= HANGMAN_LEVELS[index].target;
  const openLevel = index => { closeOptions(); startLevel(index); };
  const audioAvailable = Boolean(wordAudio && soundOn && (!clueOnly || isRoundOver));
  const options = [
    ...(phase === 'intro' ? HANGMAN_LEVELS.map((item, index) => ({
      label: item.name, description: completed(index) ? 'Level saved. Replay these words.' : item.description,
      disabled: !canStart(index), button: 'Start rescue', action: () => openLevel(index),
    })) : []),
    ...(phase === 'intro' ? [
      { label: clueOnly ? 'Turn clue-only mode off' : 'Turn clue-only mode on', description: 'In clue-only mode, listen to the recording after answering.', action: () => { setClueOnly(value => !value); closeOptions(); } },
    ] : []),
    ...(phase === 'play' && !isRoundOver ? [
      ...(round.hintsUsed < 1 ? [{ label: 'Reveal one letter', action: () => { closeOptions(); revealHint(); } }] : []),
      { label: 'Skip word', action: () => { closeOptions(); startNextWord(); } },
    ] : []),
    ...(phase === 'play' && round.roundState === 'lost' ? [{ label: 'Next word', action: () => { closeOptions(); startNextWord(); } }] : []),
    ...(phase === 'finish' ? [{ label: 'Replay level', action: () => openLevel(selectedLevel) }] : []),
    ...(phase !== 'intro' ? [{ label: 'Choose a level', action: () => { closeOptions(); goToLevelMap(); } }] : []),
    { label: soundOn ? 'Turn sound off' : 'Turn sound on', action: () => { onToggleSound?.(); closeOptions(); } },
    { label: 'Back to Read & Write', action: onBack },
  ];

  if (phase !== 'play' || optionsOpen || !practiceWords.length || practiceWords.length < level.target) return <div className="focus-game hangman-focus" data-board-focus="" data-hangman-level={level.id} data-hangman-phase={phase}>
    <main className="focus-game-body is-menu" tabIndex={phase === 'finish' ? -1 : undefined} ref={phase === 'finish' ? successRef : undefined}>
      <header className="focus-game-heading"><h1>{phase === 'finish' && !optionsOpen ? `${level.name} complete!` : 'Dino Hangman'}</h1></header>
      {optionsOpen ? <FocusMenu key={phase} choices={options} onBack={closeOptions} /> : phase === 'intro' ? <>
        <p className="focus-game-message">Read the clue. Choose letters to rescue the word.</p>
        {!progress.persistenceSafe && <p role="status" className="focus-game-message">Saved progress is unavailable. You can still practise the first level.</p>}
        {pendingReward && <p role="alert" className="focus-game-message">A saved level reward needs confirmation.</p>}
        <div className="focus-game-actions">
          {pendingReward ? <button type="button" className="focus-game-button is-primary" onClick={retryPendingReward}>Retry saved reward</button>
            : <button type="button" className="focus-game-button is-primary" disabled={!canStart(selectedLevel)} onClick={() => openLevel(selectedLevel)}>Start: {level.name}</button>}
          <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
          <button type="button" className="focus-game-button" onClick={onBack}>Back</button>
        </div>
      </> : phase === 'finish' ? <>
        <p className="focus-game-message">{saveStatus || 'Your rescue level is saved.'} You rescued {runStats.rescued} words.</p>
        {lastRewardDelta > 0 && <p className="focus-game-message">{lastRewardDelta} reward points added.</p>}
        <div className="focus-game-actions">
          {nextLevel && canStart(selectedLevel + 1) ? <button type="button" className="focus-game-button is-primary" onClick={() => openLevel(selectedLevel + 1)}>Next: {nextLevel.name}</button>
            : !nextLevel && onNextGame && <button type="button" className="focus-game-button is-primary" onClick={onNextGame}>Next game</button>}
          <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
          <button type="button" className="focus-game-button" onClick={onBack}>Finish</button>
        </div>
      </> : <>
        <p className="focus-game-message">Choose an earlier level or add taught sounds in Grown-ups.</p>
        <button type="button" className="focus-game-button" onClick={goToLevelMap}>Back to levels</button>
      </>}
    </main>
  </div>;

  return <div className="focus-game hangman-focus" data-board-focus="" data-hangman-level={level.id} data-hangman-phase="play" data-hangman-seed={runSeed}>
    <main className="focus-game-body">
      <header className="focus-game-heading">
        <p>Dino Hangman · {runStats.rescued} of {level.target} rescued · {shieldsLeft} shields left</p>
        <h1>{round.roundState === 'won' ? 'Word rescued!' : round.roundState === 'lost' ? 'Try the word again' : 'Rescue the word'}</h1>
      </header>
      <div className="hangman-focus-clue">
        <span aria-hidden="true">{word.emoji}</span>
        <p>{word.clue}</p>
        <img src={rescueDinoArt} alt="" aria-hidden="true" />
      </div>
      <p role="status" className="focus-game-message">{isRoundOver ? `The word was ${word.word}.` : statusMessage}</p>
      {hintFeedback && <p className="focus-game-message" role="status">{hintFeedback}</p>}
      <div className="spelling-focus-spaces" aria-label={`Word has ${word.word.length} letters`}>
        {word.word.split('').map((letter, index) => {
          const visible = guessedLetters.includes(letter) || isRoundOver;
          return <span key={index} data-filled={visible} aria-label={visible ? `Letter ${letter}` : `Letter ${index + 1}, hidden`}>{visible ? letter : '•'}</span>;
        })}
      </div>
      {!isRoundOver && <div className="hangman-focus-keyboard" aria-label="Letter keyboard">
        {keyboardLetters.map(letter => {
          const guessed = guessedLetters.includes(letter);
          const correct = guessed && word.word.includes(letter);
          return <button key={letter} type="button" onClick={() => chooseLetter(letter)} disabled={guessed || awaitingLevelFinish}
            data-guess={guessed ? correct ? 'correct' : 'wrong' : undefined}
            aria-label={`${letter}${guessed ? correct ? ', correct letter' : ', not in the word' : ''}`}>{letter}</button>;
        })}
      </div>}
      {saveFailed && <p className="focus-game-message" role="alert">{saveStatus}</p>}
      <div className="focus-game-actions mt-3">
        {round.roundState === 'lost' && <button type="button" className="focus-game-button is-primary" onClick={retryWord}>Try this word again</button>}
        {round.roundState === 'won' && (awaitingLevelFinish
          ? <button type="button" className="focus-game-button is-primary" onClick={finishLevel}>{saveFailed ? 'Retry save level' : 'Finish level'}</button>
          : <button type="button" className="focus-game-button is-primary" onClick={startNextWord}>Next word</button>)}
        {audioAvailable && <button type="button" className="focus-game-button" onClick={playWordAudio}>Hear the word</button>}
        <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
      </div>
    </main>
  </div>;
};

const DinoHangman = props => <HangmanExperience key={props.playerId || 'amari'} {...props} />;

export default DinoHangman;
