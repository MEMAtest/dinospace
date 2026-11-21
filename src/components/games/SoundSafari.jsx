import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FocusMenu } from '../shared/FocusMenu.jsx';
import { getTaughtGraphemes, makeLearningEvent } from '../../data/literacy.js';
import { rewardClaimToken } from '../../data/playerRewards.js';
import {
  buildRoundOptions, buildSegmentChoices, buildSoundSafariRun, getSoundSafariAttemptQuality, getSoundSafariVoiceClip,
  SOUND_SAFARI_BLEND_PROMPT, SOUND_SAFARI_CHAPTERS, SOUND_SAFARI_PHONEME_AUDIO, SOUND_SAFARI_PHONEME_KEYS,
} from '../../data/soundSafariAdventure.js';
import {
  getPendingSoundSafariRewardReceiptsStrict, getSoundSafariProgressStrict,
  markSoundSafariRewardReceiptClaimedStrict, pendingSoundSafariRewardReceipts,
  recordSoundSafariChapterCompletionStrict,
} from '../../data/soundSafariProgress.js';
import safariPictures from '../../assets/sound-safari/word-pictures-v1.webp';

// One consistent illustration sheet; each cell depicts the corresponding word.
const PICTURE_ORDER = ['ant', 'sit', 'sip', 'tip', 'pit', 'pin', 'tin', 'tap', 'nap', 'pan', 'pat', 'sap', 'pip', 'snip', 'snap', 'spin', 'pants', 'insect'];
function SvgWordPicture({ item }) {
  const index = PICTURE_ORDER.indexOf(item.word.toLowerCase());
  if (index < 0) return null;
  return <span aria-hidden="true" className="mx-auto block aspect-square w-[min(100%,10rem)] rounded-lg" style={{ backgroundImage: `url("${safariPictures}")`, backgroundSize: '300% 600%', backgroundPosition: `${(index % 3) * 50}% ${Math.floor(index / 3) * 20}%` }} />;
}

const SoundSafari = ({ onBack, playSfx = () => {}, soundOn, onToggleSound, cancelNarration = () => {}, onCelebrate = () => {}, onGameEvent, onPhaseChange, onReviewComplete, sessionTarget = 0, playerId = 'amari', phonemeAudio = SOUND_SAFARI_PHONEME_AUDIO }) => {
  const [progressState, setProgressState] = useState(() => getSoundSafariProgressStrict(playerId));
  const progress = progressState.progress || { version: 1, unlockedChapter: 0, completedChapterIds: [], earnedChapterIds: [], recentRoundIds: [], rewardReceipts: {} };
  const [activeRun, setActiveRun] = useState(null);
  const [chapterIndex, setChapterIndex] = useState(null);
  const [runNumber, setRunNumber] = useState(1);
  const [roundIndex, setRoundIndex] = useState(0);
  const [blendStep, setBlendStep] = useState(0);
  const [selectedSounds, setSelectedSounds] = useState([]);
  const [wrong, setWrong] = useState(false);
  const [usedClue, setUsedClue] = useState(false);
  const [clueText, setClueText] = useState('');
  const [visualPractice, setVisualPractice] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [audioNote, setAudioNote] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [chapterResult, setChapterResult] = useState(null);
  const [completionError, setCompletionError] = useState('');
  const [completionPending, setCompletionPending] = useState(false);
  const [rewardDrainError, setRewardDrainError] = useState('');
  const [rewardDrainPending, setRewardDrainPending] = useState(false);
  const [startPending, setStartPending] = useState(false);
  const [startError, setStartError] = useState('');
  const headingRef = useRef(null);
  const nextRef = useRef(null);
  const startBusyRef = useRef(false);
  const pendingCompletionRef = useRef(null);
  const completionBusyRef = useRef(false);
  const drainBusyRef = useRef(false);
  const drainRequestRef = useRef(0);
  const lifecycleRef = useRef(0);
  const onCelebrateRef = useRef(onCelebrate);
  const cancelNarrationRef = useRef(cancelNarration);
  const phonemeAudioRef = useRef(null);
  const answeredRoundRef = useRef(new Set());
  const heardRoundRef = useRef(new Set());

  const taughtGraphemes = useMemo(() => [...getTaughtGraphemes()], []);
  const supportedKeys = useMemo(() => SOUND_SAFARI_PHONEME_KEYS.filter((sound) => Boolean(phonemeAudio?.[sound])), [phonemeAudio]);
  const run = useMemo(() => buildSoundSafariRun({ taughtGraphemes, supportedKeys, recentIds: progress.recentRoundIds, seed: runNumber }), [taughtGraphemes, supportedKeys, progress.recentRoundIds, runNumber]);
  const currentRun = activeRun || run;
  const chapter = chapterIndex === null ? null : currentRun.chapters[chapterIndex];
  const round = chapter?.rounds[roundIndex] ?? null;
  const options = useMemo(() => round && chapter?.id !== 'segment' ? buildRoundOptions(round, chapter, runNumber * 79 + roundIndex, taughtGraphemes, supportedKeys) : [], [round, chapter, runNumber, roundIndex, taughtGraphemes, supportedKeys]);
  const segmentChoices = useMemo(() => round && chapter?.id === 'segment' ? buildSegmentChoices(round.word, runNumber * 89 + roundIndex, taughtGraphemes, supportedKeys) : [], [round, chapter, runNumber, roundIndex, taughtGraphemes, supportedKeys]);
  const promptClip = getSoundSafariVoiceClip(chapter?.id === 'blend' ? SOUND_SAFARI_BLEND_PROMPT : chapter?.id === 'segment' ? round?.word.word : '');
  const showVisualPrompt = visualPractice || !soundOn;

  onCelebrateRef.current = onCelebrate;
  cancelNarrationRef.current = cancelNarration;
  const claimReceipt = useCallback(async (receipt, generation = lifecycleRef.current) => {
    let parentResult;
    try {
      parentResult = await Promise.resolve(onCelebrateRef.current(
        'Chapter complete!', receipt.rewardDelta * 4, 0, 'phonics',
        { quiet: true, rewardToken: rewardClaimToken('phonics', receipt.id) },
      ));
    } catch { return { ok: false, error: 'The chapter reward could not be confirmed. Retry to check it again.' }; }
    if (generation !== lifecycleRef.current) return { ok: false, cancelled: true };
    if (parentResult?.persisted !== true) return { ok: false, error: 'The chapter reward could not be confirmed. Retry to check it again.' };
    const marked = markSoundSafariRewardReceiptClaimedStrict(playerId, receipt.id);
    if (!marked.ok) return { ok: false, error: 'The chapter reward is saved but still needs confirmation. Retry to check it again.' };
    setProgressState({ ok: true, status: 'record', progress: marked.progress });
    return { ok: true, progress: marked.progress };
  }, [playerId]);
  const drainPendingRewards = useCallback(async () => {
    if (drainBusyRef.current) return false;
    drainBusyRef.current = true;
    const requestId = ++drainRequestRef.current;
    setRewardDrainPending(true);
    setRewardDrainError('');
    const generation = lifecycleRef.current;
    try {
      const loaded = getPendingSoundSafariRewardReceiptsStrict(playerId);
      if (!loaded.ok) {
        setProgressState(loaded);
        setRewardDrainError('Saved chapter rewards could not be checked. Retry to keep chapters safely locked.');
        return false;
      }
      setProgressState(loaded);
      for (const receipt of loaded.receipts) {
        const claimed = await claimReceipt(receipt, generation);
        if (!claimed.ok) {
          if (!claimed.cancelled) setRewardDrainError(claimed.error);
          return false;
        }
      }
      const confirmed = getSoundSafariProgressStrict(playerId);
      if (!confirmed.ok) {
        setProgressState(confirmed);
        setRewardDrainError('Saved chapter progress could not be checked. Retry before continuing.');
        return false;
      }
      setProgressState(confirmed);
      setRewardDrainError('');
      return true;
    } finally {
      if (requestId === drainRequestRef.current) {
        drainBusyRef.current = false;
        if (generation === lifecycleRef.current) setRewardDrainPending(false);
      }
    }
  }, [claimReceipt, playerId]);

  const stopPhonemeAudio = useCallback(() => {
    const audio = phonemeAudioRef.current;
    phonemeAudioRef.current = null;
    audio?.pause();
  }, []);
  const phase = chapterResult ? 'finish' : chapterIndex === null ? 'intro' : 'play';
  useEffect(() => { onPhaseChange?.(phase); }, [onPhaseChange, phase]);
  useEffect(() => { if (!optionsOpen) headingRef.current?.focus({ preventScroll: true }); }, [phase, round?.id, optionsOpen]);
  useEffect(() => { if (feedback) nextRef.current?.focus({ preventScroll: true }); }, [feedback, completionError]);
  useEffect(() => () => { cancelNarrationRef.current(); stopPhonemeAudio(); }, [stopPhonemeAudio]);
  useEffect(() => {
    if (soundOn) return;
    cancelNarrationRef.current();
    stopPhonemeAudio();
    // Keep the visual disclosure for the rest of the unanswered round.
    if (round && feedback?.kind !== 'correct') setVisualPractice(true);
  }, [soundOn, round, feedback?.kind, stopPhonemeAudio]);
  useEffect(() => {
    lifecycleRef.current += 1;
    const generation = lifecycleRef.current;
    cancelNarrationRef.current();
    stopPhonemeAudio();
    setOptionsOpen(false); setChapterIndex(null); setChapterResult(null); setFeedback(null); setCompletionError('');
    setActiveRun(null); setStartError(''); setStartPending(false); startBusyRef.current = false;
    setRoundIndex(0); setBlendStep(0); setSelectedSounds([]); setWrong(false); setUsedClue(false); setClueText(''); setVisualPractice(false); setAudioNote('');
    setCompletionPending(false); setRewardDrainPending(false);
    pendingCompletionRef.current = null;
    answeredRoundRef.current.clear(); heardRoundRef.current.clear();
    setCompletionError(''); setRewardDrainError(''); setProgressState(getSoundSafariProgressStrict(playerId));
    const loaded = getPendingSoundSafariRewardReceiptsStrict(playerId);
    if (loaded.ok && pendingSoundSafariRewardReceipts(loaded.progress).length) void drainPendingRewards();
    return () => {
      if (lifecycleRef.current === generation) {
        lifecycleRef.current += 1;
        drainRequestRef.current += 1;
        drainBusyRef.current = false;
      }
    };
  }, [drainPendingRewards, playerId, stopPhonemeAudio]);

  const playClip = (source, { heardKey, onEnded, onFailure } = {}) => {
    const reportFailure = onFailure || (() => setVisualPractice(true));
    if (!source || !soundOn) {
      reportFailure();
      return;
    }
    let audio;
    const fail = () => {
      if (audio && phonemeAudioRef.current !== audio) return;
      stopPhonemeAudio();
      reportFailure();
    };
    try {
      audio = new Audio(source);
      phonemeAudioRef.current = audio;
      audio.ontimeupdate = () => {
        if (heardKey && phonemeAudioRef.current === audio && audio.currentTime >= 0.05) heardRoundRef.current.add(heardKey);
      };
      audio.onended = () => {
        if (phonemeAudioRef.current !== audio) return;
        if (heardKey) heardRoundRef.current.add(heardKey);
        phonemeAudioRef.current = null;
        onEnded?.();
      };
      audio.onerror = fail;
      audio.play().catch(fail);
    } catch {
      fail();
    }
  };

  const startClip = (source, options) => {
    cancelNarration();
    stopPhonemeAudio();
    playClip(source, options);
  };

  const playPhoneme = (sound) => startClip(phonemeAudio?.[sound], { heardKey: `${round.id}:${sound}` });

  const explanationWord = chapter?.id === 'listen' ? round?.pictureWord : round?.word;
  const explanationAudioReady = Boolean(soundOn && chapter && round && getSoundSafariVoiceClip(explanationWord.word)
    && (chapter.id === 'listen' ? phonemeAudio?.[round.target.sound] : round.word.phonemes.every((sound) => phonemeAudio?.[sound])));
  const playExplanation = () => {
    if (!explanationAudioReady) return;
    const wordClip = getSoundSafariVoiceClip(explanationWord.word);
    const sounds = chapter.id === 'listen' ? [round.target.sound] : round.word.phonemes;
    const phonemeClips = sounds.map((sound) => phonemeAudio[sound]);
    const sequence = chapter.id === 'segment' ? [wordClip, ...phonemeClips] : [...phonemeClips, wordClip];
    const playNext = (index) => {
      if (index >= sequence.length) return;
      playClip(sequence[index], {
        onEnded: () => playNext(index + 1),
        onFailure: () => setAudioNote('The recording could not play. Read the explanation above.'),
      });
    };
    cancelNarration();
    stopPhonemeAudio();
    playNext(0);
  };
  const hasHeardTarget = () => chapter.id === 'segment'
    ? heardRoundRef.current.has(`${round.id}:word`)
    : (chapter.id === 'listen' ? [round.target.sound] : round.word.phonemes).every((sound) => heardRoundRef.current.has(`${round.id}:${sound}`));

  const playWordPrompt = () => startClip(promptClip, { heardKey: chapter.id === 'segment' ? `${round.id}:word` : undefined });

  const startChapter = async (index) => {
    if (startBusyRef.current || rewardDrainError || rewardDrainPending) return;
    startBusyRef.current = true;
    setStartPending(true);
    setStartError('');
    try {
      const initial = getPendingSoundSafariRewardReceiptsStrict(playerId);
      if (!initial.ok) {
        setProgressState(initial);
        setStartError('Saved chapter progress could not be checked. Retry before starting.');
        return;
      }
      if (initial.receipts.length && !(await drainPendingRewards())) {
        setStartError('A chapter reward must be confirmed before starting the next mission. Retry reward confirmation.');
        return;
      }
      const fresh = getPendingSoundSafariRewardReceiptsStrict(playerId);
      if (!fresh.ok) {
        setProgressState(fresh);
        setStartError('Saved chapter progress could not be checked. Retry before starting.');
        return;
      }
      setProgressState(fresh);
      if (fresh.receipts.length) {
        setStartError('A chapter reward must be confirmed before starting the next mission. Retry reward confirmation.');
        return;
      }
      if (index > fresh.progress.unlockedChapter) {
        setStartError('Finish the previous chapter first.');
        return;
      }
      const nextRunNumber = runNumber + 1;
      const snapshot = buildSoundSafariRun({ taughtGraphemes, supportedKeys, recentIds: fresh.progress.recentRoundIds, seed: nextRunNumber });
      if (!snapshot.ready) {
        setStartError('The required taught sounds and packaged clips are not ready yet.');
        return;
      }
      setRunNumber(nextRunNumber);
      setOptionsOpen(false);
      setAudioNote('');
      setActiveRun(snapshot);
      setChapterIndex(index);
      setRoundIndex(0);
      setBlendStep(0);
      setFeedback(null);
      setChapterResult(null);
      setCompletionError('');
      pendingCompletionRef.current = null;
      setSelectedSounds([]);
      setUsedClue(false);
      setClueText('');
      setWrong(false);
      setVisualPractice(false);
      answeredRoundRef.current.clear();
      heardRoundRef.current.clear();
      playSfx('click');
      onGameEvent?.('phonics', 'start', { level: index, seed: nextRunNumber, difficulty: SOUND_SAFARI_CHAPTERS[index].id });
    } finally {
      startBusyRef.current = false;
      setStartPending(false);
    }
  };
  const moveNext = () => {
    cancelNarration();
    stopPhonemeAudio();
    if (roundIndex < 5) {
      setRoundIndex((index) => index + 1);
      setSelectedSounds([]);
      setBlendStep(0);
      setWrong(false);
      setUsedClue(false);
      setClueText('');
      setVisualPractice(false);
      setFeedback(null);
      setAudioNote('');
      return;
    }
    const draft = pendingCompletionRef.current;
    if (draft) void finishChapter(draft);
  };
  const finishChapter = async (draft = pendingCompletionRef.current) => {
    if (!draft || completionBusyRef.current) return;
    completionBusyRef.current = true;
    setCompletionPending(true);
    setCompletionError('');
    try {
      const saved = recordSoundSafariChapterCompletionStrict(playerId, draft.chapter.id, draft.roundIds);
      if (!saved.ok) {
        draft.newlyCompleted ||= Boolean(saved.eligibleReward);
        draft.receiptId = saved.receipt?.id || draft.receiptId;
        setCompletionError(saved.error || 'Your chapter could not be saved. Retry this same chapter.');
        return;
      }
      setProgressState({ ok: true, status: 'record', progress: saved.progress });
      draft.newlyCompleted ||= Boolean(saved.newlyCompleted);
      draft.receiptId = saved.receipt?.id || draft.receiptId;
      if (saved.receipt) {
        const claimed = await claimReceipt(saved.receipt);
        if (claimed.cancelled) return;
        if (!claimed.ok) {
          setCompletionError(claimed.error || 'The chapter reward is waiting for confirmation. Retry.');
          return;
        }
      }
      const final = getSoundSafariProgressStrict(playerId);
      if (!final.ok) {
        setCompletionError('Your saved chapter could not be confirmed. Retry this same chapter.');
        return;
      }
      setProgressState(final);
      const persistedReceipt = draft.receiptId ? final.progress.rewardReceipts[draft.receiptId] : null;
      if (persistedReceipt && !persistedReceipt.claimed) {
        setCompletionError('The chapter reward is waiting for confirmation. Retry.');
        return;
      }
      setChapterResult({ chapter: draft.chapter, roundIds: draft.roundIds, newlyEarned: Boolean(draft.newlyCompleted), persisted: true });
      setChapterIndex(null);
      setActiveRun(null);
      setFeedback(null);
      pendingCompletionRef.current = null;
    } finally { completionBusyRef.current = false; setCompletionPending(false); }
  };
  const retryChapterSave = () => { if (pendingCompletionRef.current) void finishChapter(pendingCompletionRef.current); };
  const retryProgressRead = () => { void drainPendingRewards(); };
  const correctChoice = (option) => chapter?.id === 'listen' ? option.id === round.pictureWord.id : option.id === round.word.id;
  const answer = (option) => {
    if (feedback || answeredRoundRef.current.has(round.id)) return;
    if (!correctChoice(option)) {
      setWrong(true);
      setFeedback({ kind: 'wrong', text: 'Nearly! Have another look and try this same challenge again.' });
      playSfx('oops');
      onGameEvent?.('phonics', 'answer_incorrect', { skill: chapter.skill, item: round.id, response: option.id, expected: chapter.id === 'listen' ? round.target.sound : round.word.id, correct: false });
      return;
    }
    answeredRoundRef.current.add(round.id);
    const explanation = chapter.id === 'listen'
      ? `${option.word} begins with /${round.target.sound}/. The first sound matches.`
      : chapter.id === 'blend'
        ? `${round.word.phonemes.join(' · ')} slide together to make ${round.word.word.toLowerCase()}.`
        : `${round.word.word.toLowerCase()} has ${round.word.phonemes.length} sounds: ${round.word.phonemes.join(', ')}.`;
    setFeedback({ kind: 'correct', text: explanation });
    playSfx('success');
    if (roundIndex === 5) pendingCompletionRef.current = {
      chapter, roundIds: chapter.rounds.map((item) => item.id), newlyCompleted: false,
    };
    const quality = getSoundSafariAttemptQuality({ firstAttempt: !wrong, usedClue, soundOn, visualPractice, audioReady: explanationAudioReady && hasHeardTarget() });
    onGameEvent?.('phonics', 'answer_correct', { skill: chapter.skill, item: round.id, response: option.id, expected: chapter.id === 'listen' ? round.target.sound : round.word.id, correct: true, firstAttempt: !wrong, independent: quality.independent, assisted: quality.assisted, deferFinish: sessionTarget > 0 && roundIndex + 1 >= sessionTarget });
    onGameEvent?.('phonics', 'learning_attempt', makeLearningEvent({ skill: chapter.skill, item: round.id, response: option.id, correct: true, firstTry: quality.independent, hints: usedClue ? 1 : 0, extra: { assisted: quality.assisted } }));
  };
  const submitSegments = () => {
    const expected = round.word.phonemes;
    const sounds = selectedSounds.map((id) => segmentChoices.find((choice) => choice.id === id)?.sound).filter(Boolean);
    if (sounds.length !== expected.length || sounds.some((sound, index) => sound !== expected[index])) {
      setWrong(true);
      setFeedback({ kind: 'wrong', text: 'Nearly! Say the word slowly and listen for each sound.' });
      playSfx('oops');
      onGameEvent?.('phonics', 'answer_incorrect', { skill: chapter.skill, item: round.id, response: sounds.join(' '), expected: expected.join(' '), correct: false });
      const quality = getSoundSafariAttemptQuality({ firstAttempt: !wrong, usedClue, soundOn, visualPractice, audioReady: explanationAudioReady && hasHeardTarget() });
      onGameEvent?.('phonics', 'learning_attempt', makeLearningEvent({ skill: chapter.skill, item: round.id, response: sounds.join(' '), correct: false, firstTry: !wrong, hints: usedClue ? 1 : 0, extra: { assisted: quality.assisted } }));
      return;
    }
    answer(round.word);
  };
  const chooseSound = (choice) => {
    if (feedback) return;
    playPhoneme(choice.sound);
    if (selectedSounds.includes(choice.id)) setSelectedSounds((items) => items.filter((id) => id !== choice.id));
    else if (selectedSounds.length < round.word.phonemes.length) setSelectedSounds((items) => [...items, choice.id]);
  };
  const chooseBlendTile = (index, sound) => {
    if (feedback || index > blendStep) return;
    playPhoneme(sound);
    if (index === blendStep) setBlendStep((current) => current + 1);
  };
  const revealClue = () => {
    if (usedClue || feedback) return;
    setUsedClue(true);
    const first = chapter.id === 'listen' ? round.target.sound : round.word.phonemes[0];
    setClueText(`The first sound is /${first}/.`);
    if (soundOn) playPhoneme(first);
  };

  const openOptions = () => setOptionsOpen(true);
  const closeOptions = () => setOptionsOpen(false);
  const leave = () => { cancelNarration(); stopPhonemeAudio(); onBack?.(); };
  const backToChapters = () => {
    cancelNarration();
    stopPhonemeAudio();
    closeOptions();
    setActiveRun(null);
    setChapterIndex(null);
    setChapterResult(null);
    setFeedback(null);
    setAudioNote('');
    if (chapterResult && sessionTarget > 0) onReviewComplete?.();
  };
  const retryRound = () => { setFeedback(null); setSelectedSounds([]); setBlendStep(0); setWrong(true); };
  const pendingRewards = progressState.ok && pendingSoundSafariRewardReceipts(progress).length > 0;
  const progressError = !progressState.ok ? 'Saved chapter progress could not be checked.' : rewardDrainError || (pendingRewards ? 'Confirm your saved reward before continuing.' : '');
  const canStart = !progressError && !rewardDrainPending && !startPending && run.ready;
  const nextChapterIndex = progress.unlockedChapter;
  const nextChapter = SOUND_SAFARI_CHAPTERS[nextChapterIndex];
  const replay = progress.completedChapterIds.includes(nextChapter.id);
  const nextLabel = replay ? `Replay: ${nextChapter.title}` : chapterResult ? `Next: ${nextChapter.title}` : `Start: ${nextChapter.title}`;
  const soundChoice = { label: soundOn ? 'Turn sound off' : 'Turn sound on', action: () => { closeOptions(); onToggleSound?.(); } };
  const chapterChoices = SOUND_SAFARI_CHAPTERS.map((item, index) => {
    const complete = progress.completedChapterIds.includes(item.id);
    return {
      label: `${item.title}${index > progress.unlockedChapter ? ' · Locked' : complete ? ' · Complete' : ''}`,
      action: () => void startChapter(index),
      button: `${complete ? 'Replay' : 'Start'}: ${item.title}`,
      description: item.intro,
      disabled: !canStart || index > progress.unlockedChapter,
    };
  });
  const playChoices = [
    ...(!feedback && !usedClue && (chapter?.id === 'segment' || !showVisualPrompt) ? [{ label: 'Use one clue', action: () => { closeOptions(); revealClue(); } }] : []),
    ...(chapter?.id === 'blend' && promptClip && soundOn && !feedback ? [{ label: 'Hear instructions', action: () => { closeOptions(); playWordPrompt(); } }] : []),
    soundChoice,
    { label: 'Back to chapters', action: backToChapters },
    { label: 'Back to Read & Write', action: leave },
  ];
  const listen = chapter?.id === 'listen';
  const blend = chapter?.id === 'blend';
  const segment = chapter?.id === 'segment';
  const correct = feedback?.kind === 'correct';
  const menu = !round;
  const showPictures = listen || blend && blendStep === round?.word.phonemes.length;
  const instruction = listen
    ? showVisualPrompt ? `Which picture begins with /${round.target.sound}/?` : 'Which picture begins with this sound?'
    : blend ? showPictures ? 'Choose the picture for the word.' : 'Tap each sound from left to right.'
      : showVisualPrompt ? 'Tap the sounds in this word.' : 'Hear the word, then tap its sounds.';
  const audioPrompt = listen ? 'Hear the sound' : 'Hear the word';
  const canHear = soundOn && (listen ? phonemeAudio?.[round?.target.sound] : segment && promptClip);

  return <div className="focus-game" data-board-focus="" data-safari-round={menu ? undefined : round.id}>
    <main className={`focus-game-body ${menu || optionsOpen ? 'is-menu' : ''}`}>
      <header className="focus-game-heading">
        {!menu && <p>Sound Safari · {chapter.title} · {roundIndex + 1} of 6</p>}
        <h1 ref={headingRef} tabIndex={-1}>{chapterResult ? 'Chapter complete!' : menu ? 'Sound Safari' : instruction}</h1>
      </header>
      {optionsOpen ? <FocusMenu choices={menu ? [...chapterChoices, soundChoice] : playChoices} onBack={closeOptions} /> : menu ? <>
        {chapterResult && <p className="focus-game-message" role="status">{chapterResult.chapter.title} saved.</p>}
        {progressError || startError ? <p className="focus-game-message" role="alert">{progressError || startError}</p> : <p className="focus-game-message">{nextChapter.intro}</p>}
        {!run.ready && <p className="focus-game-message">Ask a grown-up to check the taught sounds and recordings.</p>}
        <div className="focus-game-actions">
          {progressError ? <button type="button" className="focus-game-button is-primary" disabled={rewardDrainPending} onClick={retryProgressRead}>{!progressState.ok ? 'Retry saved progress' : 'Retry reward confirmation'}</button>
            : <button type="button" className="focus-game-button is-primary" disabled={!canStart} onClick={() => { if (chapterResult && sessionTarget > 0) backToChapters(); else void startChapter(nextChapterIndex); }}>{startPending ? 'Opening chapter…' : nextLabel}</button>}
          <button type="button" className="focus-game-button" onClick={openOptions}>Options</button>
          <button type="button" className="focus-game-button" onClick={leave}>Back to Read & Write</button>
        </div>
      </> : <>
        {showVisualPrompt && !feedback && <p className="text-sm font-semibold text-slate-700">Visual practice · assisted</p>}
        {!feedback && <>
          {canHear && <div className="focus-game-actions my-3"><button type="button" className="focus-game-button is-primary" onClick={listen ? () => playPhoneme(round.target.sound) : playWordPrompt}>{audioPrompt}</button></div>}
          {blend && !showPictures && <div className="my-3 grid grid-cols-3 gap-2" aria-label="Blend tiles">
            {round.word.phonemes.map((sound, index) => <button type="button" key={`${sound}-${index}`} disabled={index > blendStep} onClick={() => chooseBlendTile(index, sound)} aria-label={showVisualPrompt ? `Sound ${index + 1}: ${sound}` : `Hear sound ${index + 1}`} aria-pressed={index < blendStep} className={`focus-game-button min-w-0 text-lg ${index === blendStep ? 'ring-2 ring-teal-700' : ''}`}>{showVisualPrompt ? sound : index + 1}</button>)}
          </div>}
          {segment && <>
            <figure className="mx-auto my-3 w-28 text-center sm:w-36" aria-label={showVisualPrompt ? 'Picture and word for this challenge' : 'Picture for this challenge'}>
              <SvgWordPicture item={round.word} />
              {showVisualPrompt && <figcaption className="font-bold">{round.word.word.toLowerCase()}</figcaption>}
            </figure>
            <div className="my-3 flex min-h-9 flex-wrap justify-center gap-2" aria-label="Selected sounds" aria-live="polite">
              {selectedSounds.map(id => <span key={id} className="rounded-lg bg-teal-100 px-3 py-1 font-bold">{segmentChoices.find(item => item.id === id)?.sound}</span>)}
            </div>
            <div className="my-3 grid grid-cols-3 gap-2" aria-label="Sound tiles">{segmentChoices.map(choice => <button type="button" key={choice.id} onClick={() => chooseSound(choice)} aria-pressed={selectedSounds.includes(choice.id)} aria-label={soundOn ? `Hear /${choice.sound}/ and add it` : `Add /${choice.sound}/`} className={`focus-game-button min-w-0 ${selectedSounds.includes(choice.id) ? '!bg-teal-100' : ''}`}>/{choice.sound}/</button>)}</div>
          </>}
          {showPictures && <div className="my-3 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Picture choices">
            {options.map((option, index) => <button type="button" key={option.id} onClick={() => answer(option)} data-word={option.id} aria-label={`Picture choice ${index + 1}: ${option.word.toLowerCase()}`} className="focus-game-button min-w-0 px-2 py-2"><SvgWordPicture item={option} /></button>)}
          </div>}
          {clueText && <p className="focus-game-message" role="status">{clueText}</p>}
        </>}
        {correct && <div className="mx-auto mb-2 w-28 sm:w-36"><SvgWordPicture item={listen ? round.pictureWord : round.word} /></div>}
        {feedback && <p className="focus-game-message" role="status">{feedback.text}</p>}
        {completionError && <p className="focus-game-message" role="alert">{completionError}</p>}
        {audioNote && <p role="status">{audioNote}</p>}
        <div className="focus-game-actions">
          {completionError ? <button ref={nextRef} type="button" disabled={completionPending} onClick={retryChapterSave} className="focus-game-button is-primary">Retry saving this chapter</button>
            : correct ? <button ref={nextRef} type="button" disabled={completionPending} onClick={moveNext} className="focus-game-button is-primary">{completionPending ? 'Saving…' : roundIndex === 5 ? 'Finish chapter' : 'Next challenge'}</button>
              : feedback ? <button ref={nextRef} type="button" onClick={retryRound} className="focus-game-button is-primary">Try again</button>
                : segment && <button type="button" disabled={selectedSounds.length !== round.word.phonemes.length} onClick={submitSegments} className="focus-game-button is-primary">Check sounds</button>}
          {correct && explanationAudioReady && !completionError && !completionPending && <button type="button" onClick={playExplanation} className="focus-game-button">Hear sounds and word</button>}
          {!completionError && !completionPending && <button type="button" onClick={openOptions} className="focus-game-button">Options</button>}
        </div>
      </>}
    </main>
  </div>;
};

export default SoundSafari;
