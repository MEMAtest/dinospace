import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, RotateCcw, Volume2 } from 'lucide-react';
import { getPraise, saveSafe, shuffle } from '../../utils.js';
import { getOfflineVoiceClip } from '../../data/offlineVoice.js';
import { DECODABLE_CAPTIONS, getTaughtGraphemes, LITERACY_PROFILE_KEY, makeLearningEvent } from '../../data/literacy.js';
import { appendSpellingRecent, decodableSpellingWords, spellingLevelWords, makeSpellingQueue, qualifiesForIndependentSpelling, spellingAttemptAttribution, spellingCaptionSegments, spellingSessionMode, SPELLING_PREANSWER_CUES, SPELLING_RECENT_KEY, SPELLING_WORD_ART, spellingTrickyWordsForPhase } from '../../data/spellingStudio.js';
import { commitSpellingAttempt, commitSpellingWritingSample, readSpellingProgress } from '../../data/spellingProgress.js';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';
import { SoundToggle } from '../shared/index.jsx';
import classroomScene from '../../assets/game-scenes/spelling-studio.webp';
import './amariScenes.css';

const LETTER_BANK = ['s', 'a', 't', 'p', 'i', 'n', 'm', 'd', 'g', 'o', 'c', 'k', 'e', 'u', 'r', 'h', 'b', 'f', 'l', 'sh', 'ch', 'th', 'ai', 'ee', 'oa', 'oo'];

const speakPackaged = (speak, text, segments = [text]) => {
  if (typeof speak !== 'function' || !text || !Array.isArray(segments) || segments.length === 0
    || segments.some((segment) => !getOfflineVoiceClip(segment, 'en-US'))
    || segments.join(' ') !== text) return false;
  speak(text, { premium: false, segments });
  return true;
};

const newSpellingAttemptId = () => {
  try { return globalThis.crypto?.randomUUID?.() || `spelling-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
  catch { return `spelling-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
};

const MODES = [
  { id: 'copy', label: 'Learn it', short: 'See and build', icon: '👀' },
  { id: 'missing', label: 'Sound gap', short: 'Find one sound', icon: '👂' },
  { id: 'spell', label: 'Spell it', short: 'Hear and build', icon: '✍️' },
  { id: 'tricky', label: 'Tricky words', short: 'Remember by heart', icon: '⭐' },
  { id: 'caption', label: 'Write it', short: 'Copy a caption', icon: '📝' },
];

const makeTiles = (graphemes, distractors = 0, taught = getTaughtGraphemes()) => {
  const extras = shuffle(LETTER_BANK.filter((letter) => taught.has(letter) && !graphemes.includes(letter))).slice(0, distractors);
  return shuffle([...graphemes, ...extras].map((letter, index) => ({ letter, id: `${letter}-${index}` })));
};

const makeMissingOptions = (graphemes, missingIndex, taught = getTaughtGraphemes()) => {
  const answer = graphemes[missingIndex];
  const decoys = shuffle(LETTER_BANK.filter((letter) => taught.has(letter) && letter !== answer)).slice(0, 3);
  return shuffle([answer, ...decoys]);
};

const STAGE_NAMES = ['Copy the word', 'Find the missing sound', 'Build the whole word', 'Four-letter explorer', 'Five-letter builder', 'Long-word challenge'];
const WordBuilder = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent, sessionTarget = 0, sessionLevel = 0, onReviewComplete, sessionSaveError = '', sessionSaving = false, initialPracticeMode, hideOptionalPractice = false, suppressPracticeRewards = false }) => {
  const difficulty = useGameDifficulty('words');
  const [runDifficulty] = useState(difficulty);
  const [selectedMode, setSelectedMode] = useState(() => initialPracticeMode || (runDifficulty === 'challenge' ? 'spell' : runDifficulty === 'growing' ? 'missing' : 'copy'));
  const mode = sessionTarget > 0 ? spellingSessionMode(sessionLevel) : selectedMode;
  const [run] = useState(() => {
    const taught = getTaughtGraphemes();
    const seed = Math.floor(Math.random() * 0xFFFFFFFF);
    const eligible = sessionTarget > 0 ? spellingLevelWords(sessionLevel, taught) : decodableSpellingWords(taught);
    let recent = [];
    try {
      const savedRecent = JSON.parse(globalThis.localStorage?.getItem(SPELLING_RECENT_KEY) || '[]');
      recent = Array.isArray(savedRecent) ? savedRecent : [];
    } catch { /* start with no recent words */ }
    return { taught, seed, queue: makeSpellingQueue(eligible, { seed, recent }) };
  });
  const { taught, seed: runSeed, queue } = run;
  const [runActivePhase] = useState(() => {
    try { return Number(JSON.parse(globalThis.localStorage?.getItem(LITERACY_PROFILE_KEY) || '{}').activePhase) === 3 ? 3 : 2; }
    catch { return 2; }
  });
  const [optionalMode, setOptionalMode] = useState(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [typed, setTyped] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [stageProgress, setStageProgress] = useState({ level: sessionLevel, count: 0 });
  const [locked, setLocked] = useState(false);
  const [hadMistake, setHadMistake] = useState(false);
  const [usedTeachingHint, setUsedTeachingHint] = useState(false);
  const [savedProgress, setSavedProgress] = useState(() => readSpellingProgress());
  const progress = savedProgress.progress;
  const [pendingSave, setPendingSave] = useState(null);
  const pendingSaveRef = useRef(null);
  const finalizedAttemptRef = useRef(null);
  const [pendingCaptionSave, setPendingCaptionSave] = useState(null);
  const pendingCaptionSaveRef = useRef(null);
  const finalizedCaptionRef = useRef(null);
  const stageCount = stageProgress.level === sessionLevel ? stageProgress.count : 0;

  const regularWords = queue;
  const trickyWords = useMemo(() => spellingTrickyWordsForPhase(runActivePhase), [runActivePhase]);
  const words = mode === 'tricky' ? trickyWords : regularWords;
  const word = useMemo(() => words.length ? words[wordIndex % words.length] : { word: '', graphemes: [], emoji: '🔒', hint: '' }, [words, wordIndex]);
  const preAnswerCue = word.cue || SPELLING_PREANSWER_CUES[word.word] || 'Think about what you can hear and see.';
  const mayNameAnswer = mode === 'copy' || locked;
  const artworkDescription = mayNameAnswer
    ? (word.word === 'TAN' ? 'A light tan colour swatch' : SPELLING_WORD_ART[word.word]?.alt || word.hint)
    : preAnswerCue;
  const missingIndex = word.graphemes.length ? wordIndex % word.graphemes.length : 0;
  const [tiles, setTiles] = useState(() => makeTiles(queue[0]?.graphemes || [], mode === 'spell' ? 3 : 0, taught));
  const [captionText, setCaptionText] = useState('');
  const [captionSaved, setCaptionSaved] = useState(false);
  const captions = useMemo(() => {
    const eligible = DECODABLE_CAPTIONS.filter((caption) => caption.needs.every((sound) => taught.has(sound)));
    return eligible;
  }, [taught]);
  const caption = captions.length ? captions[wordIndex % captions.length] : null;
  const captionSegments = useMemo(
    () => caption ? spellingCaptionSegments(caption.text, (segment) => Boolean(getOfflineVoiceClip(segment, 'en-US'))) : null,
    [caption],
  );
  const missingOptions = useMemo(
    () => makeMissingOptions(word.graphemes, missingIndex, taught),
    [word.graphemes, missingIndex, taught],
  );
  const startedRef = useRef(false);
  const sceneRef = useRef('');

  const masteredWords = Object.values(progress).filter((item) => item?.independentDays?.length >= 2).length;

  useEffect(() => {
    if (!onGameEvent) return;
    const level = sessionTarget > 0 ? sessionLevel : 0;
    const round = stageCount + 1;
    const difficultyName = mode === 'copy' ? 'starter' : mode === 'missing' ? 'growing' : 'challenge';
    if (!startedRef.current) {
      onGameEvent('words', 'start', { level, round, seed: runSeed, difficulty: difficultyName });
      startedRef.current = true;
    }
    const sceneKey = `${mode}:${wordIndex}`;
    if (sceneRef.current !== sceneKey) {
      onGameEvent('words', 'scene', { level, round, seed: runSeed, difficulty: difficultyName, scene: mode });
      onGameEvent('words', 'question', { level, round, seed: runSeed, difficulty: difficultyName });
      sceneRef.current = sceneKey;
    }
  }, [mode, onGameEvent, runSeed, sessionLevel, sessionTarget, stageCount, wordIndex]);

  useEffect(() => {
    if (!words.length) return;
    if (mode === 'caption' && caption && captionSegments) speakPackaged(speak, captionSegments.join(' '), captionSegments);
    else if (mode !== 'caption') speakPackaged(speak, word.word);
  }, [caption, captionSegments, mode, word.word, speak, words.length]);

  const resetRound = (nextIndex = wordIndex, nextMode = mode) => {
    const selectedWords = nextMode === 'tricky' ? trickyWords : regularWords;
    if (!selectedWords.length) return;
    const nextWord = selectedWords[nextIndex % selectedWords.length];
    setWordIndex(nextIndex % selectedWords.length);
    setTyped([]);
    setFeedback('');
    setLocked(false);
    setHadMistake(false);
    setUsedTeachingHint(false);
    setCaptionText('');
    setCaptionSaved(false);
    setTiles(makeTiles(nextWord.graphemes, ['spell', 'tricky'].includes(nextMode) ? 3 : 0, taught));
  };

  const chooseMode = (nextMode) => {
    if (sessionTarget > 0 || locked) return;
    setSelectedMode(nextMode);
    resetRound(0, nextMode);
    playSfx('click');
  };

  const rememberWord = (item) => {
    try {
      const recent = JSON.parse(globalThis.localStorage?.getItem(SPELLING_RECENT_KEY) || '[]');
      saveSafe(SPELLING_RECENT_KEY, appendSpellingRecent(Array.isArray(recent) ? recent : [], item.word));
    } catch { /* practice remains usable when storage is unavailable */ }
  };

  useEffect(() => { if (words.length && mode !== 'caption' && mode !== 'tricky') rememberWord(word); }, [mode, word, words.length]);

  const finishCommittedSuccess = (attempt, committedProgress) => {
    if (!attempt || finalizedAttemptRef.current === attempt.transactionId) return;
    finalizedAttemptRef.current = attempt.transactionId;
    pendingSaveRef.current = null;
    setPendingSave(null);
    setSavedProgress({ ok: true, progress: committedProgress, reason: null });
    const praise = getPraise();
    const teaching = attempt.mode === 'missing'
      ? `The missing sound is ${attempt.missingSound}. ${attempt.word.hint}`
      : `You built ${attempt.word.word.toLowerCase()} from ${attempt.word.graphemes.join(' · ')}. ${attempt.word.hint}`;
    setFeedback(attempt.independent ? `${praise} First try! ${teaching}` : `${praise} ${teaching}`);
    setScore((current) => current + 1);
    setStageProgress((current) => ({ level: sessionLevel, count: (current.level === sessionLevel ? current.count : 0) + 1 }));
    setLocked(true);
    playSfx('success');
    speakPackaged(speak, 'Super!');
    if (sessionTarget === 0 && !suppressPracticeRewards) onCelebrate?.(praise, attempt.independent ? 5 : 4, 300);
    onGameEvent?.('words', 'answer_attempt', { level: sessionTarget > 0 ? sessionLevel : 0, round: stageCount + 1, seed: runSeed, difficulty: attempt.mode, correct: true, firstAttempt: attempt.firstAttempt });
    onGameEvent?.('words', 'answer_correct', { level: sessionTarget > 0 ? sessionLevel : 0, round: stageCount + 1, seed: runSeed, difficulty: attempt.mode, correct: true, firstAttempt: attempt.firstAttempt, deferFinish: sessionTarget > 0 && stageCount + 1 >= sessionTarget });
    const learningAttempt = makeLearningEvent({
      skill: attempt.mode === 'missing' ? 'phoneme-gap' : attempt.mode === 'copy' ? 'supported-spelling' : attempt.mode === 'tricky' ? 'tricky-word-spelling' : 'independent-spelling',
      item: attempt.word.word,
      response: attempt.word.word,
      correct: true,
      firstTry: attempt.firstAttempt,
      hints: attempt.usedTeachingHint ? 1 : 0,
      difficulty: attempt.mode === 'copy' ? 'starter' : attempt.mode === 'missing' ? 'growing' : 'challenge',
      extra: {
        family: attempt.word.family,
        phase: attempt.word.phase,
        wordLength: attempt.word.word.length,
        masteryEligible: spellingAttemptAttribution(attempt).masteryEligible,
      },
    });
    learningAttempt.independent = attempt.independent;
    onGameEvent?.('words', 'learning_attempt', learningAttempt);
  };

  const retrySpellingSave = () => {
    const attempt = pendingSaveRef.current;
    if (!attempt) return;
    const result = commitSpellingAttempt(undefined, { ...attempt, word: attempt.word.word });
    if (!result.ok) {
      setFeedback('Your answer is right, but the progress save still needs help. Keep this screen open and try again.');
      return;
    }
    finishCommittedSuccess(attempt, result.progress);
  };

  const recordSuccess = () => {
    if (pendingSaveRef.current) return;
    const firstAttempt = !hadMistake && !usedTeachingHint;
    const independent = qualifiesForIndependentSpelling({ mode, hadMistake, usedTeachingHint });
    const attempt = {
      word,
      mode,
      missingSound: word.graphemes[missingIndex],
      transactionId: newSpellingAttemptId(),
      independent,
      hadMistake,
      usedTeachingHint,
      firstAttempt,
      today: new Date().toISOString().slice(0, 10),
    };
    pendingSaveRef.current = attempt;
    setPendingSave(attempt);
    setLocked(true);
    const result = commitSpellingAttempt(undefined, { ...attempt, word: attempt.word.word });
    if (!result.ok) {
      setFeedback('Your answer is right, but the progress save could not be confirmed. Retry to keep this word and stage progress.');
      return;
    }
    finishCommittedSuccess(attempt, result.progress);
  };

  const showTeachingHint = () => {
    if (locked || usedTeachingHint) return;
    setUsedTeachingHint(true);
    setFeedback('Here is a clue. Try building the word from its sounds.');
    onGameEvent?.('words', 'hint', { level: sessionTarget > 0 ? sessionLevel : 0, round: stageCount + 1, seed: runSeed, difficulty: mode, hintType: 'meaning_cue' });
  };

  const handleLetterTap = (item) => {
    if (locked) return;
    const expected = word.graphemes[typed.length];
    if (item.letter !== expected) {
      onGameEvent?.('words', 'answer_attempt', { level: sessionTarget > 0 ? sessionLevel : 0, round: stageCount + 1, seed: runSeed, difficulty: mode, correct: false, firstAttempt: !hadMistake && !usedTeachingHint });
      setHadMistake(true);
      setFeedback(mode === 'copy' ? `The next letter is ${expected}` : 'Say the word slowly and listen for the next sound.');
      playSfx('wrong');
      speakPackaged(speak, mode === 'copy' ? expected : word.word);
      return;
    }

    const next = [...typed, item];
    setTyped(next);
    setTiles((previous) => previous.filter((tile) => tile.id !== item.id));
    setFeedback('');
    playSfx('tap');
    if (next.length === word.graphemes.length) recordSuccess();
  };

  const handleMissingSound = (letter) => {
    if (locked) return;
    if (letter !== word.graphemes[missingIndex]) {
      onGameEvent?.('words', 'answer_attempt', { level: sessionTarget > 0 ? sessionLevel : 0, round: stageCount + 1, seed: runSeed, difficulty: mode, correct: false, firstAttempt: !hadMistake && !usedTeachingHint });
      setHadMistake(true);
      setFeedback('Say the word slowly and listen again.');
      playSfx('wrong');
      speakPackaged(speak, word.word);
      return;
    }
    playSfx('tap');
    recordSuccess();
  };

  const handleUndo = () => {
    if (typed.length === 0 || locked) return;
    const last = typed[typed.length - 1];
    setTyped((previous) => previous.slice(0, -1));
    setTiles((previous) => shuffle([...previous, last]));
    playSfx('click');
  };

  const nextWord = () => {
    if (sessionTarget > 0 && stageCount >= sessionTarget) { onReviewComplete?.(); return; }
    const nextIndex = (wordIndex + 1) % words.length;
    rememberWord(words[nextIndex]);
    resetRound(nextIndex);
  };

  const finishCaptionSave = (sample) => {
    if (!sample || finalizedCaptionRef.current === sample.id) return;
    finalizedCaptionRef.current = sample.id;
    pendingCaptionSaveRef.current = null;
    setPendingCaptionSave(null);
    setCaptionSaved(true);
    setFeedback('Saved for your grown-up to see! This writing sample is not graded.');
    playSfx('success');
    if (sessionTarget === 0 && !suppressPracticeRewards) onCelebrate?.('Writing saved!', 3, 200);
    onGameEvent?.('words', 'learning_attempt', makeLearningEvent({
      skill: 'caption-writing', item: sample.prompt, response: sample.response, correct: null, firstTry: true,
      difficulty: caption?.phase === 2 ? 'growing' : 'challenge', extra: { savedForReview: true, masteryEligible: false },
    }));
  };

  const retryCaptionSave = () => {
    const sample = pendingCaptionSaveRef.current;
    if (!sample) return;
    const result = commitSpellingWritingSample(undefined, sample);
    if (!result.ok) {
      setFeedback('This writing sample is not saved yet. Keep it here and try again.');
      return;
    }
    finishCaptionSave(sample);
  };

  const saveWritingSample = () => {
    if (!caption) return;
    if (pendingCaptionSaveRef.current) return;
    const response = captionText.trim();
    if (!response) {
      setFeedback('Write something first. It does not need to be perfect.');
      return;
    }
    const sample = { id: newSpellingAttemptId(), prompt: caption.text, response, savedAt: new Date().toISOString(), reviewed: false };
    pendingCaptionSaveRef.current = sample;
    setPendingCaptionSave(sample);
    const result = commitSpellingWritingSample(undefined, sample);
    if (!result.ok) {
      setFeedback('This writing sample could not be confirmed as saved. Retry to keep this draft for your grown-up.');
      return;
    }
    finishCaptionSave(sample);
  };

  const leave = () => {
    onGameEvent?.('words', 'leave', { level: sessionTarget > 0 ? sessionLevel : 0, round: stageCount + 1, seed: runSeed, difficulty: mode });
    onBack?.();
  };

  const replayWord = () => {
    onGameEvent?.('words', 'hint', { level: sessionTarget > 0 ? sessionLevel : 0, round: stageCount + 1, seed: runSeed, difficulty: mode, hintType: 'replay_word' });
    speakPackaged(speak, word.word);
  };

  const replayCaption = () => {
    onGameEvent?.('words', 'hint', { level: sessionTarget > 0 ? sessionLevel : 0, round: stageCount + 1, seed: runSeed, difficulty: mode, hintType: 'replay_caption' });
    if (captionSegments) speakPackaged(speak, captionSegments.join(' '), captionSegments);
  };

  if (optionalMode) {
    return <WordBuilder
      onBack={() => setOptionalMode(null)} playSfx={playSfx} soundOn={soundOn} onToggleSound={onToggleSound}
      speak={speak} onCelebrate={onCelebrate} initialPracticeMode={optionalMode} hideOptionalPractice
      suppressPracticeRewards={suppressPracticeRewards || sessionTarget > 0}
    />;
  }

  return (
    <div className="amari-scene spelling-studio text-slate-800" style={{ '--scene-image': `url("${classroomScene}")` }}>
      <header className="amari-scene-header relative z-20">
        <button onClick={leave} className="game-icon-button" aria-label="Back to home"><ArrowLeft /></button>
        <div className="amari-scene-title">
          <h2 className="text-lg sm:text-2xl">✏️ Spelling Studio</h2>
          <p className="text-xs text-sky-100">{savedProgress.ok ? `${masteredWords} words secure` : 'Saved word progress unavailable'}{sessionTarget > 0 ? '' : savedProgress.ok ? ` · ${score} today` : ''}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-3 pb-8">
        <div className={`mt-3 flex w-full max-w-3xl gap-2 overflow-x-auto rounded-2xl bg-white/90 p-2 shadow-lg ${sessionTarget > 0 ? 'sm:grid sm:grid-cols-3' : 'sm:grid sm:grid-cols-5'}`} aria-label="Spelling practice modes">
          {(sessionTarget > 0 ? MODES.slice(0, 3) : MODES).map((item) => (
            <button
              key={item.id}
              onClick={() => chooseMode(item.id)}
              disabled={sessionTarget > 0 || locked}
              aria-pressed={mode === item.id}
              className={`min-h-12 min-w-24 shrink-0 rounded-xl px-2 py-2 text-xs font-black transition sm:min-h-16 sm:min-w-0 sm:text-sm ${mode === item.id ? 'bg-cyan-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-cyan-50'}`}
            >
              <span className="mr-1" aria-hidden="true">{item.icon}</span>{item.label}
              <span className={`mt-0.5 hidden text-[11px] font-bold sm:block ${mode === item.id ? 'text-cyan-100' : 'text-slate-400'}`}>{item.short}</span>
            </button>
          ))}
        </div>

        {sessionTarget > 0
          ? <p className="mt-3 rounded-full bg-white/90 px-4 py-2 text-sm font-black text-cyan-900" aria-live="polite">{STAGE_NAMES[Math.min(sessionLevel, STAGE_NAMES.length - 1)]}: {stageCount} of {sessionTarget} words</p>
          : <p className="mt-3 rounded-full bg-white/90 px-4 py-2 text-sm font-black text-cyan-900" aria-live="polite">{score} words completed</p>}

        <section className="amari-scene-card mt-3 w-full max-w-2xl p-4 text-center sm:p-6">
          {mode === 'caption' && !caption ? (
            <div className="rounded-2xl bg-amber-50 p-6 text-lg font-bold text-amber-900" role="status">
              No caption uses only this learner’s selected sounds yet. Choose more taught sounds in grown-up settings to unlock this activity.
            </div>
          ) : !words.length ? (
            <div className="rounded-2xl bg-amber-50 p-6 text-lg font-bold text-amber-900" role="status">
              There are no spelling words made only from the sounds selected for this learner yet. Ask a grown-up to choose more taught sounds, then come back.
            </div>
          ) : mode === 'caption' ? (
            <>
              <p className="text-xs font-black uppercase tracking-widest text-cyan-700">Read it, say it, write it</p>
              <p className="mt-3 rounded-2xl bg-cyan-50 p-4 text-2xl font-black text-cyan-900">{caption.text}</p>
              <button onClick={replayCaption} disabled={!captionSegments} aria-label={captionSegments ? 'Hear the caption' : 'No packaged caption recording available'} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-cyan-100 px-4 font-black text-cyan-800 disabled:opacity-50"><Volume2 size={19} /> {captionSegments ? 'Hear the caption' : 'Read the caption on screen'}</button>
              <textarea value={captionText} onChange={(event) => { setCaptionText(event.target.value); setCaptionSaved(false); }} disabled={Boolean(pendingCaptionSave)} rows={3} placeholder="Type or copy the caption here" className="mt-5 w-full rounded-2xl border-4 border-cyan-200 bg-white p-4 text-xl font-black uppercase text-slate-800 outline-none focus:border-cyan-500 disabled:opacity-70" aria-label="Writing sample" />
              <p className="mt-2 text-xs font-bold text-slate-500">This is saved as a writing sample for a grown-up to review. The app does not pretend to grade handwriting.</p>
              {pendingCaptionSave
                ? <button type="button" onClick={retryCaptionSave} className="mt-4 min-h-12 rounded-xl bg-amber-500 px-6 font-black text-white shadow-lg"><RotateCcw size={18} className="mr-2 inline" />Retry saving writing</button>
                : <button onClick={saveWritingSample} disabled={captionSaved} className="mt-4 min-h-12 rounded-xl bg-emerald-500 px-6 font-black text-white shadow-lg disabled:opacity-60">{captionSaved ? 'Saved!' : 'Save my writing'}</button>}
            </>
          ) : <>
          <div className="spelling-word-cue">
          <div className="spelling-word-art mx-auto grid h-28 w-36 place-items-center rounded-3xl bg-cyan-50 text-6xl shadow-inner sm:h-32 sm:w-40">
            {SPELLING_WORD_ART[word.word]
              ? <img src={SPELLING_WORD_ART[word.word].src} alt={artworkDescription} className="h-full w-full object-contain p-1" />
              : word.word === 'TAN' ? <span role="img" aria-label={artworkDescription} className="block h-20 w-20 rounded-2xl border-2 border-white" style={{ backgroundColor: '#d2b48c' }} />
                : <span role="img" aria-label={artworkDescription}>{word.emoji}</span>}
          </div>
          <div className="spelling-word-teaching">
          {mode === 'copy'
            ? <p className="mt-3 text-lg font-bold text-slate-700">{word.hint}</p>
            : <div className="mt-3 min-h-12">
              {usedTeachingHint
                ? <p className="text-lg font-bold text-slate-700">{preAnswerCue}</p>
                : <p className="text-sm font-bold text-slate-600">Listen to the word. Ask for a clue if you need one.</p>}
              <button type="button" onClick={showTeachingHint} disabled={locked || usedTeachingHint} className="mt-2 min-h-11 rounded-full bg-amber-100 px-4 font-black text-amber-950 disabled:opacity-60">{usedTeachingHint ? 'Clue shown' : 'Show a clue'}</button>
            </div>}
          <button onClick={replayWord} className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-full bg-cyan-100 px-4 font-black text-cyan-800">
            <Volume2 size={19} /> Hear the word
          </button>

          {mode === 'copy' && (
            <div className="mt-3" aria-label={`Word to copy: ${word.word}`}>
              <p className="text-xs font-black uppercase tracking-widest text-cyan-700">Look, say, build</p>
              <p className="mt-1 text-3xl font-black tracking-[0.28em] text-cyan-800">{word.word}</p>
            </div>
          )}

          </div>
          </div>
          <div className="spelling-word-spaces mt-5 flex flex-wrap justify-center gap-1 sm:gap-3" aria-label="Word spaces">
            {word.graphemes.map((letter, index) => {
              const shown = mode === 'missing' ? (index === missingIndex ? (locked ? letter : '') : letter) : typed[index]?.letter;
              return (
                <div key={`${letter}-${index}`} className={`grid h-12 w-9 place-items-center rounded-xl border-4 text-xl font-black shadow-md sm:h-16 sm:w-16 sm:text-3xl ${shown ? 'border-blue-700 bg-blue-500 text-white' : 'border-dashed border-blue-300 bg-white text-blue-300'}`}>
                  {shown || '•'}
                </div>
              );
            })}
          </div>

          {mode === 'missing' ? (
            <div className="mt-5 flex flex-wrap justify-center gap-3" aria-label="Choose the missing sound">
              {missingOptions.map((letter) => (
                <button key={letter} disabled={locked} onClick={() => handleMissingSound(letter)} className="amari-choice grid h-16 w-16 place-items-center text-3xl disabled:opacity-60">
                  {letter}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-5 flex flex-wrap justify-center gap-3" aria-label="Letter tiles">
              {tiles.map((item) => (
                <button key={item.id} disabled={locked} onClick={() => handleLetterTap(item)} className="amari-choice grid h-16 w-16 place-items-center text-3xl disabled:opacity-60">
                  {item.letter}
                </button>
              ))}
            </div>
          )}

          <div className="spelling-word-feedback mt-4 min-h-12" aria-live="polite">
            {feedback && <p className={`text-lg font-black ${locked ? 'text-emerald-600' : 'text-amber-700'}`}>{feedback}</p>}
            {sessionSaveError && <p role="alert" className="mt-2 text-sm font-black text-rose-700">{sessionSaveError}</p>}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {!locked && mode !== 'missing' && typed.length > 0 && (
              <button onClick={handleUndo} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 font-black text-cyan-700 shadow"><RotateCcw size={18} /> Undo</button>
            )}
            {locked && (
              pendingSave
                ? <button type="button" onClick={retrySpellingSave} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-amber-500 px-6 font-black text-white shadow-lg"><RotateCcw size={18} /> Retry saving word</button>
                : <button onClick={nextWord} disabled={sessionTarget > 0 && stageCount >= sessionTarget && sessionSaving} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-emerald-500 px-6 font-black text-white shadow-lg transition hover:bg-emerald-600 disabled:opacity-60"><Check size={20} /> {sessionTarget > 0 && stageCount >= sessionTarget ? (sessionSaveError ? 'Retry saving level' : 'Finish stage') : 'Next word'}</button>
            )}
          </div>
          </>}
        </section>

        <p className="mt-3 max-w-xl rounded-xl bg-white/90 p-2 text-center text-xs font-bold text-cyan-900">
          Keep practising! Try spelling the word again another day.
        </p>
        {sessionTarget > 0 && !hideOptionalPractice && (
          <details className="mt-3 w-full max-w-2xl rounded-xl bg-white/90 p-3 text-cyan-950">
            <summary className="cursor-pointer font-black">Optional practice (does not change this stage)</summary>
            <div className="mt-3 flex flex-wrap gap-2">
              {MODES.slice(3).map((item) => <button key={item.id} disabled={locked} onClick={() => setOptionalMode(item.id)} className="min-h-11 rounded-lg bg-cyan-100 px-4 font-black text-cyan-900 disabled:opacity-50">{item.label}</button>)}
            </div>
          </details>
        )}
      </main>
    </div>
  );
};

export default WordBuilder;
