import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, ChevronRight, Lightbulb, RotateCcw, Volume2 } from 'lucide-react';
import { SoundToggle } from '../shared/index.jsx';
import { PATTERN_CHAPTERS, PATTERN_INTRO_RULE, PATTERN_RUN_LENGTH, PATTERN_SHAPES, createPatternRun, seededPatternRunSeed } from '../../data/patternAdventure.js';
import { completePatternChapter, isPatternChapterUnlocked, readPatternProgress, rememberPatternRun } from '../../data/patternAdventureProgress.js';
import { getOfflineVoiceClip } from '../../data/offlineVoice.js';
import paradeScene from '../../assets/game-scenes/pattern-parade.webp';
import './amariScenes.css';

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

function ChapterCard({ chapter, index, selected, done, locked, onClick }) {
  return <button type="button" onClick={onClick} disabled={locked} aria-pressed={selected} className={`min-h-28 rounded-3xl border-4 p-4 text-left shadow transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 ${selected ? 'border-amber-500 bg-amber-50' : 'border-white bg-white/95 hover:border-amber-200'}`}>
    <span className="flex items-center justify-between gap-2"><span className="text-xl font-black text-indigo-950">{index + 1}. {chapter.title}</span><span aria-label={done ? 'Completed' : locked ? 'Locked' : 'Ready'}>{done ? '🏅' : locked ? '🔒' : '🎉'}</span></span>
    <span className="mt-2 block text-sm font-bold text-slate-700">{chapter.subtitle}</span>
    <span className="mt-1 block text-xs font-semibold text-slate-600">{done ? 'Complete · replay anytime' : locked ? 'Finish the previous chapter to unlock' : 'Six festival clues'}</span>
  </button>;
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
  const [helpOpen, setHelpOpen] = useState(false);
  const [ruleReplay, setRuleReplay] = useState(false);
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
    setHelpOpen(false);
    setRuleReplay(false);
    setAssistedCount(0);
    setResult(null);
    awardShownRef.current = false;
    setPhase('play');
    playSfx('click');
    onGameEvent?.('pattern', replay ? 'replay' : 'start', { level: index, round: 0, seed: made.seed, item: made.rounds[0]?.id });
  };

  const useHint = () => {
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
      setHelpOpen(false);
      setRuleReplay(false);
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

  return <div className={`min-h-[100dvh] flex flex-col overflow-x-hidden bg-gradient-to-b from-amber-100 via-sky-100 to-indigo-200 text-slate-900 ${littleMode ? '' : 'amari-scene'}`} style={littleMode ? undefined : { '--scene-image': `url("${paradeScene}")` }}>
    <header className="amari-scene-header z-20">
      <button type="button" onClick={leave} className="game-icon-button !min-h-12 !min-w-12" aria-label={littleMode ? 'Back to home' : 'Back to parent world'}><ArrowLeft /></button>
      <div className="amari-scene-title text-center"><h1 className="text-lg font-black sm:text-2xl">Pattern Parade</h1>{phase === 'play' && <p className="text-xs text-sky-100">{chapter.title} · Clue {roundIndex + 1} of 6</p>}</div>
      <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
    </header>

    {phase === 'intro' && <main className="z-10 mx-auto w-full max-w-5xl px-3 pb-8 pt-5 sm:px-6">
      <section className="rounded-[2rem] bg-white/95 p-5 shadow-xl sm:p-7">
        <p className="text-center text-lg font-bold text-slate-700">Find what repeats or grows. Each chapter has six clues. Your choice stays here until you press Next.</p>
        <div className="mx-auto mt-4 max-w-3xl rounded-2xl border-2 border-indigo-100 bg-indigo-50 p-4 text-center">
          <p className="font-black text-indigo-950">A pattern follows a rule.</p>
          <p className="mt-1">Look for a group of shapes that comes back in the same order.</p>
          <button type="button" disabled={!soundOn || !hasClip(PATTERN_INTRO_RULE)} onClick={() => playExactNarration(PATTERN_INTRO_RULE)} className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-4 font-black text-indigo-800 disabled:cursor-not-allowed disabled:opacity-60" aria-label={hasClip(PATTERN_INTRO_RULE) ? 'Replay spoken pattern rule' : 'Rule audio not packaged; read the rule'}><Volume2 size={18} />{hasClip(PATTERN_INTRO_RULE) ? 'Replay spoken rule' : 'Audio unavailable · read rule'}</button>
          <button type="button" className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-xl px-4 font-black text-indigo-800 underline" onClick={() => { setHelpOpen((open) => !open); playSfx('click'); }}><BookOpen size={19} />{helpOpen ? 'Hide the rule' : 'Show the rule again'}</button>
          {helpOpen && <p className="mt-2 rounded-xl bg-white p-3 text-left font-semibold" role="status">For example: circle, square, circle, square. The same two-shape group returns. Look for the group, then find the next shape.</p>}
        </div>
        {!littleMode && <div className="mt-5 grid gap-3 sm:grid-cols-3">{PATTERN_CHAPTERS.map((item, index) => <ChapterCard key={item.id} chapter={item} index={index} selected={selectedChapter === index} done={progress.completedChapterIds.includes(item.id)} locked={!isPatternChapterUnlocked(progress, index)} onClick={() => { setSelectedChapter(index); playSfx('click'); }} />)}</div>}
        {littleMode && <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-center"><p className="font-black">{chapter.title}</p><p>{chapter.skill}</p><p className="mt-2 text-sm">Six short clues, one at a time.</p><div className="mt-3 grid grid-cols-3 gap-2">{PATTERN_CHAPTERS.map((item, index) => <button type="button" key={item.id} disabled={!isPatternChapterUnlocked(progress, index)} aria-pressed={selectedChapter === index} aria-label={`Chapter ${index + 1}: ${item.title}`} onClick={() => { setSelectedChapter(index); playSfx('click'); }} className={`flex min-h-20 min-w-0 flex-col items-center justify-center rounded-2xl border-2 px-1 py-2 font-black disabled:opacity-40 ${selectedChapter === index ? 'border-indigo-700 bg-indigo-50' : 'border-white bg-white'}`}><PatternShape token={['coral', 'gold', 'drum'][index]} size={32} /><span className="mt-1 text-xs">{index + 1} {progress.completedChapterIds.includes(item.id) ? '✓' : ''}</span></button>)}</div></div>}
        <button type="button" disabled={!isPatternChapterUnlocked(progress, selectedChapter)} onClick={() => startChapter(selectedChapter)} className="mt-5 min-h-14 w-full rounded-2xl bg-indigo-700 px-5 text-lg font-black text-white shadow-lg hover:bg-indigo-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:cursor-not-allowed disabled:opacity-60">Start {chapter?.title}</button>
      </section>
    </main>}

    {phase === 'play' && round && <main data-pattern-round={round.id} className="z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-3 pb-6 pt-3 sm:px-6">
      <div className="mb-3 flex w-full max-w-3xl flex-wrap items-center justify-between gap-2 rounded-full bg-white/95 px-4 py-2 shadow"><span className="font-black text-indigo-950">{chapter.title}</span><span className="font-bold text-slate-700">Clue {roundIndex + 1} / 6</span></div>
      <div className="amari-scene-card w-full max-w-4xl rounded-[2rem] p-4 shadow-xl sm:p-6">
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2" aria-label={`${round.kind === 'growing' ? 'Growing groups' : 'Repeating pattern'}, question mark shows the missing next step`}>
          {round.kind === 'repeat' ? round.sequence.map((token, index) => <div key={`${token}-${index}`} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 shadow-sm sm:h-16 sm:w-16"><PatternShape token={token} size={36} /></div>) : round.sequence.map((count) => <div key={count} className="flex min-h-20 min-w-16 flex-col items-center justify-center rounded-2xl bg-white/90 px-1 py-2 shadow-sm sm:min-h-24 sm:min-w-20"><PatternShape token={round.token} size={23} count={count} /><span className="font-black text-slate-700">{count} shapes</span></div>)}
          {answerState === 'correct' ? <div className="flex min-h-12 min-w-12 flex-col items-center justify-center rounded-2xl border-4 border-emerald-600 bg-emerald-50 p-1 sm:min-h-16 sm:min-w-16" aria-label="Correct next step"><PatternShape token={round.kind === 'growing' ? round.token : round.answer} size={round.kind === 'growing' ? 23 : 36} count={round.kind === 'growing' ? round.answer : 1} />{round.kind === 'growing' && <span className="font-black">{round.answer} shapes</span>}</div> : <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-dashed border-amber-500 bg-amber-50 text-3xl font-black text-indigo-700 sm:h-16 sm:w-16" aria-label="What comes next?">?</div>}
        </div>
      </div>
      {answerState !== 'correct' && <div className="amari-scene-prompt mt-3 flex min-h-14 flex-wrap items-center justify-center gap-2 px-4 py-2 text-center text-lg"><span>What comes next? Look for the rule.</span><button type="button" disabled={!soundOn || !hasClip(PROMPT)} onClick={() => playExactNarration(PROMPT)} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white/80 px-3 text-sm font-black text-indigo-800 disabled:cursor-not-allowed disabled:opacity-60" aria-label={hasClip(PROMPT) ? 'Replay spoken prompt' : 'Prompt audio not packaged; read the prompt'}><Volume2 size={18} />{hasClip(PROMPT) ? 'Replay prompt' : 'Audio unavailable · read prompt'}</button></div>}
      {!soundOn && <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-950" role="status">Sound is off. Follow the pictures and read the pattern rule on screen.</p>}
      {answerState !== 'correct' && <div className="mt-4 grid w-full max-w-2xl grid-cols-3 gap-2 sm:gap-4" role="group" aria-label="Choose what comes next">
        {round.options.map((option) => <button type="button" key={option} data-pattern-choice={round.kind === 'growing' ? `${option} ${PATTERN_SHAPES[round.token].name}s` : PATTERN_SHAPES[option]?.name} disabled={answerState === 'correct'} onClick={() => handleAnswer(option)} className={`amari-choice flex min-h-[76px] flex-col items-center justify-center rounded-2xl border-4 border-white bg-white p-2 shadow-lg transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 disabled:cursor-default disabled:opacity-80 sm:min-h-24 ${answerState === 'wrong' ? 'animate-shake' : ''}`} aria-label={round.kind === 'growing' ? `${option} ${PATTERN_SHAPES[round.token].name}s` : PATTERN_SHAPES[option]?.name}>{selection(option)}</button>)}
      </div>}
      {answerState === 'wrong' && <div className="mt-3 w-full max-w-2xl rounded-2xl border-2 border-amber-300 bg-white p-3 text-center font-black text-indigo-950" role="status">Not quite. Look at the order again, then try another choice.</div>}
      {hintShown && answerState !== 'correct' && <div className="mt-3 w-full max-w-2xl rounded-2xl border-2 border-amber-300 bg-amber-50 p-3 text-center font-bold text-indigo-950" role="status"><p>{round.clue} This clue counts as help for this round.</p><button type="button" disabled={!soundOn || !hasClip(round.clue)} onClick={() => playExactNarration(round.clue)} className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-indigo-800 disabled:cursor-not-allowed disabled:opacity-60" aria-label={hasClip(round.clue) ? 'Replay spoken clue' : 'Clue audio not packaged; read the clue'}><Volume2 size={18} />{hasClip(round.clue) ? 'Replay clue audio' : 'Audio unavailable · read clue'}</button></div>}
      {answerState === 'correct' && <div className="mt-3 w-full max-w-2xl rounded-2xl border-2 border-emerald-300 bg-white p-4 text-center shadow" role="status"><p className="text-lg font-black text-emerald-900">You found it!</p>{hintUsed && <p className="mt-1 text-sm font-bold text-slate-600">Clue used · assisted practice</p>}<p className="mt-1 font-bold text-slate-800">Rule: {round.rule}</p><div className="mt-2 flex flex-wrap justify-center gap-2"><button type="button" disabled={!soundOn || !hasClip(round.rule)} onClick={() => playExactNarration(round.rule)} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-emerald-50 px-4 font-black text-indigo-800 disabled:cursor-not-allowed disabled:opacity-60" aria-label={hasClip(round.rule) ? 'Replay spoken rule' : 'Rule audio not packaged; read the rule'}><Volume2 size={18} />{hasClip(round.rule) ? 'Replay rule audio' : 'Audio unavailable · read rule'}</button><button type="button" onClick={() => setRuleReplay(true)} className="inline-flex min-h-12 items-center gap-2 rounded-xl px-4 font-black text-indigo-800 underline"><BookOpen size={18} />Show rule again</button></div>{ruleReplay && <p className="mt-2 rounded-xl bg-emerald-50 p-3 font-bold" aria-live="polite">{round.rule}</p>}</div>}
      {answerState !== 'correct' && <div className="mt-3 flex flex-wrap justify-center gap-2"><button type="button" onClick={useHint} disabled={hintUsed} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-4 font-black text-indigo-800 shadow disabled:opacity-60"><Lightbulb size={19} />{hintUsed ? 'Clue used' : 'One clue'}</button><button type="button" onClick={() => setHelpOpen((open) => !open)} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-4 font-black text-indigo-800 shadow"><BookOpen size={19} />{helpOpen ? 'Hide rule' : 'Explain patterns'}</button></div>}
      {helpOpen && answerState !== 'correct' && <p className="mt-2 max-w-2xl rounded-2xl bg-white/95 p-3 text-center font-semibold" role="status">A repeating pattern has a group that comes back in the same order. A growing pattern adds one more shape each time.</p>}
      {answerState === 'correct' && <button ref={advanceRef} type="button" onClick={nextRound} className="mt-4 inline-flex min-h-14 min-w-44 items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-6 text-lg font-black text-white shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-indigo-700">{roundIndex === run.rounds.length - 1 ? 'Finish chapter' : 'Next'} <ChevronRight /></button>}
    </main>}

    {phase === 'finish' && <main className="z-10 mx-auto mt-6 w-full max-w-2xl px-3 pb-8 sm:px-6"><section className="rounded-[2rem] bg-white p-6 text-center shadow-2xl sm:p-8">
      <div className="text-6xl" aria-hidden="true">{result?.newlyCompleted && result.persisted ? '🏅' : '🎉'}</div><h2 className="mt-2 text-3xl font-black text-indigo-950">{result && !result.persisted ? 'Chapter save needed' : `${chapter.title} finished!`}</h2>
      <p className="mt-3 text-lg font-bold">{result && !result.persisted ? 'All six clues are correct, but this chapter is not saved yet.' : result?.newlyCompleted ? 'Chapter badge earned!' : progress.completedChapterIds.includes(chapter.id) ? 'Chapter complete. You can practise it again.' : 'Your answers are in. Replay to try this chapter again.'}</p>
      {result && <p className="mt-2 text-slate-700">{result.assisted ? `${result.assisted} clue${result.assisted === 1 ? '' : 's'} used` : 'You solved every clue without a teaching clue.'}</p>}
      {result && !result.persisted && <div className="mt-3 rounded-xl bg-amber-50 p-3 font-bold text-amber-900"><p>This device could not save the chapter just now. Your progress is not recorded yet.</p><button type="button" onClick={retryChapterSave} className="mt-2 min-h-12 rounded-xl bg-amber-200 px-4 font-black text-amber-950">Retry saving chapter</button></div>}
      {result?.finalRule && <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-left"><p className="font-black text-emerald-900">Last pattern rule</p><p className="mt-1 font-semibold">{result.finalRule}</p></div>}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => { setSelectedChapter(0); setPhase('intro'); }} className="min-h-14 rounded-2xl bg-white px-5 font-black text-indigo-800 ring-2 ring-indigo-700">{liveChapterIndex === 2 ? 'All chapters' : 'Choose chapter'}</button>
        <button type="button" onClick={() => startChapter(selectedChapter, true)} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 font-black text-indigo-950"><RotateCcw size={18} />Replay {chapter.title}</button>
        {liveChapterIndex >= 0 && liveChapterIndex < 2 && progress.unlockedChapterIndex > liveChapterIndex && <button type="button" onClick={() => { setSelectedChapter(liveChapterIndex + 1); setPhase('intro'); }} className="min-h-14 rounded-2xl bg-indigo-700 px-5 font-black text-white">Next chapter: {PATTERN_CHAPTERS[liveChapterIndex + 1].title}</button>}
        <button type="button" onClick={leave} className="min-h-14 rounded-2xl bg-slate-800 px-5 font-black text-white">Finish and return</button>
      </div>
    </section></main>}
  </div>;
};

export default PatternParade;
