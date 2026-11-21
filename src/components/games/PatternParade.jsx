import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FocusMenu } from '../shared/FocusMenu.jsx';
import { PATTERN_CHAPTERS, PATTERN_INTRO_RULE, PATTERN_RUN_LENGTH, PATTERN_SHAPES, createPatternRun, seededPatternRunSeed } from '../../data/patternAdventure.js';
import { completePatternChapter, isPatternChapterUnlocked, readPatternProgress, rememberPatternRun } from '../../data/patternAdventureProgress.js';
import { getOfflineVoiceClip } from '../../data/offlineVoice.js';

const noop = () => {};
const PROMPT = 'What comes next? Look for the rule.';

function PatternShape({ token, size = 40, count = 1 }) {
  const item = PATTERN_SHAPES[token];
  if (!item) return null;
  const paths = {
    star: <polygon points="50,7 61,37 94,38 68,58 78,91 50,72 22,91 32,58 6,38 39,37" />,
    leaf: <path d="M18 72C15 35 43 10 84 16c2 40-23 68-62 56l38-39" />,
    diamond: <polygon points="50,5 92,50 50,95 8,50" />,
    sun: <><circle cx="50" cy="50" r="24" /><path d="M50 4v14m0 64v14M4 50h14m64 0h14M17 17l10 10m46 46 10 10m0-66L73 27M27 73 17 83" fill="none" stroke={item.color} strokeWidth="9" strokeLinecap="round" /></>,
    drum: <><ellipse cx="50" cy="27" rx="34" ry="13" /><path d="M16 27v44c0 8 15 15 34 15s34-7 34-15V27M16 45c0 8 15 14 34 14s34-6 34-14" fill="none" stroke="#633d53" strokeWidth="5" /><path d="M32 27v44m36-44v44" stroke="#fff" strokeWidth="4" opacity=".8" /></>,
  };
  return <span className="inline-flex flex-wrap items-center justify-center" role="img" aria-label={`${count} ${item.name}${count === 1 ? '' : 's'}`}>
    {Array.from({ length: count }, (_, index) => <svg key={index} aria-hidden="true" width={size} height={size} viewBox="0 0 100 100" className="shrink-0" style={{ fill: item.color }}>
      {item.shape === 'circle' && <circle cx="50" cy="50" r="41" />}
      {item.shape === 'square' && <rect x="10" y="10" width="80" height="80" rx="13" />}
      {paths[item.shape]}
    </svg>)}
  </span>;
}

const PatternParade = ({ onBack = noop, playSfx = noop, speak = noop, soundOn, onToggleSound, cancelNarration = noop, onCelebrate = noop, onGameEvent, onPhaseChange, playerId = 'amari', littleMode = false }) => {
  const [progressState, setProgressState] = useState(() => ({ playerId, progress: readPatternProgress(playerId) }));
  const progress = progressState.playerId === playerId ? progressState.progress : readPatternProgress(playerId);
  const storeProgress = (value) => setProgressState({ playerId, progress: value });
  const [phase, setPhase] = useState('intro');
  const [selectionState, setSelectionState] = useState(() => ({ playerId, index: Math.min(2, readPatternProgress(playerId).unlockedChapterIndex) }));
  const selectedChapter = selectionState.playerId === playerId ? selectionState.index : Math.min(2, progress.unlockedChapterIndex);
  const setSelectedChapter = (index) => setSelectionState({ playerId, index });
  const [run, setRun] = useState(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [answerState, setAnswerState] = useState(null);
  const [hadMistake, setHadMistake] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [assistedCount, setAssistedCount] = useState(0);
  const [result, setResult] = useState(null);
  const awardShownRef = useRef(false);
  const lastSceneKeyRef = useRef(null);
  const advanceRef = useRef(null);

  const chapter = PATTERN_CHAPTERS[selectedChapter];
  const round = run?.rounds[roundIndex];
  const liveChapterIndex = useMemo(() => PATTERN_CHAPTERS.findIndex(({ id }) => id === run?.chapterId), [run]);

  useEffect(() => { onPhaseChange?.(phase); }, [onPhaseChange, phase]);
  useEffect(() => () => cancelNarration(), [cancelNarration]);
  useEffect(() => { if (!soundOn) cancelNarration(); }, [cancelNarration, soundOn]);
  useEffect(() => { if (phase === 'play' && answerState === 'correct') advanceRef.current?.focus(); }, [answerState, phase]);

  const playExactNarration = useCallback((text) => {
    if (!soundOn || !text || !getOfflineVoiceClip(text)) return false;
    cancelNarration();
    speak(text, { premium: false, segments: [text] });
    return true;
  }, [cancelNarration, soundOn, speak]);
  const hasClip = (text) => Boolean(getOfflineVoiceClip(text));

  useEffect(() => {
    if (phase === 'play' && round) playExactNarration(PROMPT);
  }, [phase, round, playExactNarration]);

  useEffect(() => {
    if (phase !== 'play' || !round || !run) return;
    const sceneKey = `${run.seed}:${roundIndex}:${round.id}`;
    if (lastSceneKeyRef.current === sceneKey) return;
    lastSceneKeyRef.current = sceneKey;
    onGameEvent?.('pattern', 'scene', { level: liveChapterIndex, round: roundIndex, seed: run.seed, item: round.id });
  }, [liveChapterIndex, onGameEvent, phase, round, roundIndex, run]);

  const startChapter = (index = selectedChapter, replay = false) => {
    const target = PATTERN_CHAPTERS[index];
    if (!target || !isPatternChapterUnlocked(progress, index)) return;
    cancelNarration();
    const seed = seededPatternRunSeed();
    const made = createPatternRun(target.id, seed, progress.recentMissionIds, PATTERN_RUN_LENGTH);
    if (!made) return;
    lastSceneKeyRef.current = null;
    rememberPatternRun(playerId, target.id, made.rounds.map(({ id }) => id));
    storeProgress(readPatternProgress(playerId));
    setRun(made);
    setSelectedChapter(index);
    setRoundIndex(0);
    setAnswerState(null);
    setHadMistake(false);
    setHintUsed(false);
    setHintShown(false);
    setOptionsOpen(false);
    setAssistedCount(0);
    setResult(null);
    awardShownRef.current = false;
    setPhase('play');
    playSfx('click');
    onGameEvent?.('pattern', replay ? 'replay' : 'start', { level: index, round: 0, seed: made.seed, item: made.rounds[0]?.id });
  };

  const revealHint = () => {
    if (!round || hintUsed || answerState === 'correct') return;
    setHintUsed(true);
    setHadMistake(true);
    setHintShown(true);
    setAssistedCount((current) => current + 1);
    cancelNarration();
    playExactNarration(round.clue);
    onGameEvent?.('pattern', 'hint', { level: liveChapterIndex, round: roundIndex, seed: run.seed, item: round.id, hintType: 'clue', hints: 1 });
    playSfx('click');
  };

  const handleAnswer = (choice) => {
    if (!round || answerState === 'correct') return;
    if (choice !== round.answer) {
      cancelNarration();
      setHadMistake(true);
      setAnswerState('wrong');
      onGameEvent?.('pattern', 'answer_wrong', { level: liveChapterIndex, round: roundIndex, seed: run.seed, item: round.id, response: choice, correct: false, firstAttempt: !hadMistake, independent: !hadMistake });
      playSfx('oops');
      return;
    }
    const isLast = roundIndex === run.rounds.length - 1;
    cancelNarration();
    setAnswerState('correct');
    onGameEvent?.('pattern', 'answer_correct', { level: liveChapterIndex, round: roundIndex, seed: run.seed, item: round.id, response: choice, correct: true, firstAttempt: !hadMistake, independent: !hadMistake, assisted: hintUsed });
    playSfx('sparkle');
    playExactNarration(round.rule);
    if (isLast) {
      // This write happens in the same turn as the final correct choice,
      // before the Finish state is rendered.
      const completion = completePatternChapter(playerId, chapter.id, run.rounds.map(({ id }) => id));
      if (completion) {
        storeProgress(completion);
        setResult({ newlyCompleted: completion.newlyCompleted, persisted: completion.persisted, assisted: assistedCount, finalRule: round.rule, missionIds: run.rounds.map(({ id }) => id) });
        if (completion.newlyCompleted && completion.persisted && !awardShownRef.current) {
          awardShownRef.current = true;
          onCelebrate(`${chapter.title} complete!`, 4, 0, 'pattern', { quiet: true });
        }
      }
      onGameEvent?.('pattern', 'level_complete', { level: liveChapterIndex, round: roundIndex, seed: run.seed, item: round.id, assistedRounds: assistedCount });
    }
  };

  const nextRound = () => {
    if (!round || answerState !== 'correct') return;
    cancelNarration();
    if (roundIndex < run.rounds.length - 1) {
      setRoundIndex((index) => index + 1);
      setAnswerState(null);
      setHadMistake(false);
      setHintUsed(false);
      setHintShown(false);
      setOptionsOpen(false);
      return;
    }
    setPhase('finish');
  };

  const retryChapterSave = () => {
    if (!result || result.persisted) return;
    const completion = completePatternChapter(playerId, chapter.id, result.missionIds);
    if (!completion) return;
    storeProgress(completion);
    setResult((current) => ({ ...current, newlyCompleted: completion.newlyCompleted, persisted: completion.persisted }));
    if (completion.newlyCompleted && completion.persisted && !awardShownRef.current) {
      awardShownRef.current = true;
      onCelebrate(`${chapter.title} complete!`, 4, 0, 'pattern', { quiet: true });
    }
  };

  const leave = () => {
    cancelNarration();
    onGameEvent?.('pattern', 'leave', { level: run ? liveChapterIndex : selectedChapter, round: roundIndex, seed: run?.seed, item: round?.id });
    onBack?.();
  };

  const selection = (token) => {
    if (round?.kind === 'growing') return <><PatternShape token={round.token} size={31} count={token} /><span className="mt-1 text-sm font-black text-slate-700">{token} in the group</span></>;
    return <><PatternShape token={token} size={50} /><span className="mt-1 text-sm font-black text-slate-700">{PATTERN_SHAPES[token]?.name}</span></>;
  };

  const openOptions = () => { cancelNarration(); setOptionsOpen(true); };
  const closeOptions = () => setOptionsOpen(false);
  const audioChoice = (label, line) => ({ label, action: () => { closeOptions(); playExactNarration(line); } });
  const isPlaying = phase === 'play' && round;
  const nextChapter = PATTERN_CHAPTERS[liveChapterIndex + 1];
  const exitChoice = { label: littleMode ? 'Back to home' : 'Back to Thinking & Play', action: leave };
  const options = [
    ...(phase === 'intro' ? [
      ...PATTERN_CHAPTERS.map((item, index) => ({
        label: item.title,
        description: progress.completedChapterIds.includes(item.id) ? 'Badge earned. Replay for practice.' : item.subtitle,
        disabled: !isPatternChapterUnlocked(progress, index),
        button: 'Start chapter',
        action: () => startChapter(index),
      })),
      { label: 'How patterns work', description: PATTERN_INTRO_RULE, button: 'Back to Pattern Parade', action: () => { closeOptions(); playExactNarration(PATTERN_INTRO_RULE); } },
    ] : []),
    ...(isPlaying && answerState !== 'correct' ? [
      ...(!hintUsed ? [{ label: 'Show clue', action: () => { closeOptions(); revealHint(); } }] : []),
      { label: 'How patterns work', description: PATTERN_INTRO_RULE, button: 'Back to the pattern', action: () => { closeOptions(); playExactNarration(PATTERN_INTRO_RULE); } },
      ...(soundOn && hasClip(PROMPT) ? [audioChoice('Hear the question', PROMPT)] : []),
      ...(hintShown && soundOn && hasClip(round.clue) ? [audioChoice('Hear the clue', round.clue)] : []),
    ] : []),
    ...(isPlaying && answerState === 'correct' && soundOn && hasClip(round.rule) ? [audioChoice('Hear the rule', round.rule)] : []),
    ...(phase === 'finish' ? [
      { label: `Replay ${chapter.title}`, action: () => startChapter(selectedChapter, true) },
      { label: 'Choose a chapter', action: () => { setSelectedChapter(Math.min(PATTERN_CHAPTERS.length - 1, progress.unlockedChapterIndex)); setPhase('intro'); } },
    ] : []),
    { label: soundOn ? 'Turn sound off' : 'Turn sound on', action: () => { closeOptions(); onToggleSound?.(); } },
    exitChoice,
  ];

  return <div className="focus-game pattern-focused" data-board-focus="">
    <main className={`focus-game-body${optionsOpen || !isPlaying ? ' is-menu' : ''}`} data-pattern-round={isPlaying ? round.id : undefined}>
      <header className="focus-game-heading">
        {isPlaying && !optionsOpen && <p>Pattern Parade · {chapter.title} · {roundIndex + 1} of {run.rounds.length}</p>}
        <h1>{isPlaying && !optionsOpen ? answerState === 'correct' ? 'You found it!' : 'What comes next?' : 'Pattern Parade'}</h1>
      </header>
      {optionsOpen ? <FocusMenu key={phase} choices={options} onBack={closeOptions} /> : <>
        {phase === 'intro' && <>
          <p className="focus-game-message">Look at the pictures. Find what comes next.</p>
          {littleMode && <div className="pattern-focus-example" aria-hidden="true"><PatternShape token="coral" size={42} /><PatternShape token="gold" size={42} /><PatternShape token="coral" size={42} /><span>?</span></div>}
          <div className="focus-game-actions">
            <button type="button" className="focus-game-button is-primary" onClick={() => startChapter(selectedChapter)}>Start: {chapter.title}</button>
            <button type="button" className="focus-game-button" onClick={openOptions}>Options</button>
            <button type="button" className="focus-game-button" onClick={leave}>Back</button>
          </div>
        </>}
        {isPlaying && <>
          <div className="pattern-focus-sequence" aria-label={round.kind === 'growing' ? 'Growing groups' : 'Repeating pattern'}>
            {round.sequence.map((value, index) => <div className="pattern-focus-token" key={index}>
              {round.kind === 'growing' ? <><PatternShape token={round.token} size={30} count={value} /><span>{value} shapes</span></> : <PatternShape token={value} size={54} />}
            </div>)}
            <div className={`pattern-focus-token ${answerState === 'correct' ? 'is-answer' : 'is-missing'}`} aria-label={answerState === 'correct' ? 'Correct next step' : 'Missing next step'}>
              {answerState !== 'correct' ? '?' : round.kind === 'growing'
                ? <><PatternShape token={round.token} size={30} count={round.answer} /><span>{round.answer} shapes</span></>
                : <PatternShape token={round.answer} size={54} />}
            </div>
          </div>
          {answerState !== 'correct' && <div className="pattern-focus-answers" role="group" aria-label="Choose what comes next">
            {round.options.map(value => {
              const label = round.kind === 'growing' ? `${value} ${PATTERN_SHAPES[round.token].name}s` : PATTERN_SHAPES[value]?.name;
              return <button type="button" key={value} data-pattern-choice={label} aria-label={label} onClick={() => handleAnswer(value)}>{selection(value)}</button>;
            })}
          </div>}
          {answerState === 'wrong' && <p className="focus-game-message" role="status">Try another picture. Look at the shapes in order.</p>}
          {hintShown && answerState !== 'correct' && <p className="focus-game-message" role="status">{round.clue}</p>}
          {answerState === 'correct' && <div className="pattern-focus-explanation" role="status"><strong>{round.rule}</strong>{hintUsed && <p>Clue used · assisted practice</p>}</div>}
          <div className="focus-game-actions mt-4">
            {answerState === 'correct' && <button ref={advanceRef} type="button" className="focus-game-button is-primary" onClick={nextRound}>{roundIndex === run.rounds.length - 1 ? 'Finish chapter' : 'Next pattern'}</button>}
            <button type="button" className="focus-game-button" onClick={openOptions}>Options</button>
          </div>
        </>}
        {phase === 'finish' && <>
          <h2 className="text-xl font-black">{result && !result.persisted ? 'Save your chapter' : `${chapter.title} finished!`}</h2>
          <p className="focus-game-message" role={result && !result.persisted ? 'alert' : 'status'}>{result && !result.persisted ? 'Your progress is ready to save. Try again.' : 'You solved all six patterns. Your progress is saved.'}</p>
          {result?.finalRule && <p className="pattern-focus-explanation">{result.finalRule}</p>}
          <div className="focus-game-actions mt-4">
            {result && !result.persisted
              ? <button type="button" className="focus-game-button is-primary" onClick={retryChapterSave}>Retry saving chapter</button>
              : <>
                {nextChapter && isPatternChapterUnlocked(progress, liveChapterIndex + 1) && <button type="button" className="focus-game-button is-primary" onClick={() => startChapter(liveChapterIndex + 1)}>Next: {nextChapter.title}</button>}
                <button type="button" className="focus-game-button" onClick={openOptions}>Options</button>
                <button type="button" className="focus-game-button" onClick={leave}>Finish</button>
              </>}
          </div>
        </>}
      </>}
    </main>
  </div>;
};

export default PatternParade;
