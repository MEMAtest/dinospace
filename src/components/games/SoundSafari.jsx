import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Volume2, Lightbulb, RotateCcw, Check, ChevronRight } from 'lucide-react';
import { SoundToggle } from '../shared/index.jsx';
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
import safariScene from '../../assets/game-scenes/sound-safari.webp';
import safariPictures from '../../assets/sound-safari/word-pictures-v1.webp';
import './amariScenes.css';

// One consistent illustration sheet; each cell depicts the corresponding word.
const PICTURE_ORDER = ['ant', 'sit', 'sip', 'tip', 'pit', 'pin', 'tin', 'tap', 'nap', 'pan', 'pat', 'sap', 'pip', 'snip', 'snap', 'spin', 'pants', 'insect'];
function SvgWordPicture({ item }) {
  const index = PICTURE_ORDER.indexOf(item.word.toLowerCase());
  if (index < 0) return null;
  return <span aria-hidden="true" className="mx-auto block h-16 w-16 rounded-xl sm:h-24 sm:w-24" style={{ backgroundImage: `url("${safariPictures}")`, backgroundSize: '300% 600%', backgroundPosition: `${(index % 3) * 50}% ${Math.floor(index / 3) * 20}%` }} />;
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
  const [showReplay, setShowReplay] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [chapterResult, setChapterResult] = useState(null);
  const [completionError, setCompletionError] = useState('');
  const [completionPending, setCompletionPending] = useState(false);
  const [rewardDrainError, setRewardDrainError] = useState('');
  const [rewardDrainPending, setRewardDrainPending] = useState(false);
  const [startPending, setStartPending] = useState(false);
  const [startError, setStartError] = useState('');
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
  const promptClipText = chapter?.id === 'blend' ? SOUND_SAFARI_BLEND_PROMPT : chapter?.id === 'segment' ? round?.word.word : '';

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
    phonemeAudioRef.current?.pause();
    phonemeAudioRef.current = null;
  }, []);
  const reportPhonemeAudioFailure = (audio, error) => {
    const aborted = error?.name === 'AbortError' || audio.error?.code === 1;
    if (phonemeAudioRef.current !== audio || aborted) return;
    phonemeAudioRef.current = null;
    setVisualPractice(true);
  };
  const phase = chapterResult ? 'finish' : chapterIndex === null ? 'intro' : 'play';
  useEffect(() => { onPhaseChange?.(phase); }, [onPhaseChange, phase]);
  useEffect(() => () => { cancelNarration(); stopPhonemeAudio(); }, [cancelNarration, stopPhonemeAudio]);
  useEffect(() => { if (!soundOn) { cancelNarration(); stopPhonemeAudio(); } }, [soundOn, cancelNarration, stopPhonemeAudio]);
  useEffect(() => {
    lifecycleRef.current += 1;
    const generation = lifecycleRef.current;
    cancelNarrationRef.current();
    stopPhonemeAudio();
    setChapterIndex(null); setChapterResult(null); setFeedback(null); setCompletionError('');
    setActiveRun(null); setStartError(''); setStartPending(false); startBusyRef.current = false;
    setRoundIndex(0); setBlendStep(0); setSelectedSounds([]); setWrong(false); setUsedClue(false); setClueText(''); setVisualPractice(false); setShowReplay(false);
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

  const playPhoneme = (sound) => {
    const source = phonemeAudio?.[sound];
    if (!source || !soundOn) {
      if (!source || !soundOn) setVisualPractice(true);
      return;
    }
    cancelNarration();
    stopPhonemeAudio();
    const audio = new Audio(source);
    phonemeAudioRef.current = audio;
    audio.ontimeupdate = () => { if (phonemeAudioRef.current === audio && audio.currentTime >= 0.05) heardRoundRef.current.add(`${round.id}:${sound}`); };
    audio.onended = () => { if (phonemeAudioRef.current === audio) phonemeAudioRef.current = null; };
    audio.onerror = () => reportPhonemeAudioFailure(audio);
    audio.play().catch((error) => reportPhonemeAudioFailure(audio, error));
  };

  const playExplanation = () => {
    if (!round || !chapter || !soundOn) { setVisualPractice(true); return; }
    const answerWord = chapter.id === 'listen' ? round.pictureWord : round.word;
    const wordClip = getSoundSafariVoiceClip(answerWord.word);
    const phonemeClips = (chapter.id === 'listen' ? [round.target.sound] : round.word.phonemes).map((sound) => phonemeAudio?.[sound]).filter(Boolean);
    if (!wordClip || phonemeClips.length !== (chapter.id === 'listen' ? 1 : round.word.phonemes.length)) { setVisualPractice(true); return; }
    const sequence = chapter.id === 'segment' ? [wordClip, ...phonemeClips] : [...phonemeClips, wordClip];
    cancelNarration();
    stopPhonemeAudio();
    let index = 0;
    const playNext = () => {
      if (index >= sequence.length) return;
      const audio = new Audio(sequence[index]);
      index += 1;
      phonemeAudioRef.current = audio;
      audio.onended = () => { if (phonemeAudioRef.current === audio) { phonemeAudioRef.current = null; playNext(); } };
      audio.onerror = () => reportPhonemeAudioFailure(audio);
      audio.play().catch((error) => reportPhonemeAudioFailure(audio, error));
    };
    playNext();
  };
  const explanationWord = chapter?.id === 'listen' ? round?.pictureWord : round?.word;
  const explanationAudioReady = Boolean(soundOn && chapter && round && getSoundSafariVoiceClip(explanationWord.word)
    && (chapter.id === 'listen' ? phonemeAudio?.[round.target.sound] : round.word.phonemes.every((sound) => phonemeAudio?.[sound])));
  const masteryAudioReady = Boolean(soundOn && chapter && round && getSoundSafariVoiceClip(explanationWord.word)
    && (chapter.id === 'listen' ? phonemeAudio?.[round.target.sound] : round.word.phonemes.every((sound) => phonemeAudio?.[sound])));
  const hasHeardTarget = () => chapter.id === 'segment'
    ? heardRoundRef.current.has(`${round.id}:word`)
    : (chapter.id === 'listen' ? [round.target.sound] : round.word.phonemes).every((sound) => heardRoundRef.current.has(`${round.id}:${sound}`));

  const playWordPrompt = () => {
    if (!soundOn || !promptClipText) { setVisualPractice(true); return; }
    cancelNarration();
    stopPhonemeAudio();
    const source = getSoundSafariVoiceClip(promptClipText);
    if (!source) { setVisualPractice(true); return; }
    const audio = new Audio(source);
    phonemeAudioRef.current = audio;
    audio.ontimeupdate = () => { if (chapter.id === 'segment' && phonemeAudioRef.current === audio && audio.currentTime >= 0.05) heardRoundRef.current.add(`${round.id}:word`); };
    audio.onended = () => { if (phonemeAudioRef.current === audio) phonemeAudioRef.current = null; };
    audio.onerror = () => reportPhonemeAudioFailure(audio);
    audio.play().catch((error) => reportPhonemeAudioFailure(audio, error));
  };

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
      setShowReplay(false);
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
    const quality = getSoundSafariAttemptQuality({ firstAttempt: !wrong, usedClue, soundOn, visualPractice, audioReady: masteryAudioReady && hasHeardTarget() });
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
      const quality = getSoundSafariAttemptQuality({ firstAttempt: !wrong, usedClue, soundOn, visualPractice, audioReady: masteryAudioReady && hasHeardTarget() });
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
    if (!soundOn || !phonemeAudio?.[sound]) setVisualPractice(true);
    if (index === blendStep) setBlendStep((current) => current + 1);
  };
  const useClue = () => {
    if (usedClue || feedback) return;
    setUsedClue(true);
    const first = chapter.id === 'listen' ? round.target.sound : round.word.phonemes[0];
    setClueText(`The first sound is /${first}/.`);
    if (!soundOn || !phonemeAudio?.[first]) setVisualPractice(true);
    else playPhoneme(first);
  };

  const panel = 'rounded-3xl border border-emerald-100 bg-white/95 shadow-lg';
  const button = 'min-h-12 rounded-2xl border-2 px-4 py-3 text-base font-bold transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 disabled:cursor-not-allowed disabled:opacity-50';
  return <div className="amari-scene flex min-h-screen flex-col" style={{ '--scene-image': `url("${safariScene}")` }}>
    <header className="amari-scene-header relative z-20">
      <button type="button" onClick={() => { cancelNarration(); stopPhonemeAudio(); onBack?.(); }} className="game-icon-button min-h-12 min-w-12" aria-label="Back to home"><ArrowLeft /></button>
      <div className="amari-scene-title"><h2 className="text-lg sm:text-2xl">Sound Safari</h2><p className="text-xs text-sky-100">Listen · blend · pull sounds apart</p></div>
      <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
    </header>
    <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-start px-2 py-2 sm:justify-center sm:px-8 sm:py-5">
      {chapterIndex === null && !chapterResult && <section className={`${panel} mx-auto w-full max-w-2xl p-4 sm:p-7`}>
        <div className="flex items-center gap-3">
          <img src="/art/catalog-v3/game-phonics.webp" alt="" aria-hidden="true" className="h-16 w-20 shrink-0 object-contain sm:h-20 sm:w-24" />
          <div className="min-w-0"><h1 className="text-xl font-black text-emerald-950 sm:text-2xl">Choose a sound mission</h1>
          <p className="mt-1 text-sm text-slate-600">Each mission has six short challenges. New missions open as you finish them.</p></div>
        </div>
        {!progressState.ok && <div role="alert" className="mt-3 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm font-bold text-rose-950"><p>Saved chapter progress could not be checked, so missions stay locked.</p><button type="button" onClick={retryProgressRead} disabled={rewardDrainPending} className={`${button} mt-2 border-rose-700 bg-white text-rose-950`}>{rewardDrainPending ? 'Checking saved progress…' : 'Retry saved progress'}</button></div>}
        {progressState.ok && (rewardDrainError || pendingSoundSafariRewardReceipts(progress.rewardReceipts ? progress : null).length > 0) && <div role="alert" className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-bold text-amber-950"><p>{rewardDrainError || 'A chapter reward still needs confirmation before continuing.'}</p><button type="button" onClick={retryProgressRead} disabled={rewardDrainPending} className={`${button} mt-2 border-amber-700 bg-white text-amber-950`}>{rewardDrainPending ? 'Checking chapter rewards…' : 'Retry reward confirmation'}</button></div>}
        {startError && <p role="alert" className="mt-3 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm font-bold text-rose-950">{startError}</p>}
        {!run.ready && <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-amber-900" role="status">Sound clips and taught sounds must be ready before this safari can open.</p>}
        <div className="mt-4 grid gap-2 sm:mt-5 sm:grid-cols-3 sm:gap-3">{SOUND_SAFARI_CHAPTERS.map((item, index) => {
          const locked = !progressState.ok || startPending || rewardDrainPending || Boolean(rewardDrainError) || index > progress.unlockedChapter || !run.ready;
          return <button key={item.id} type="button" disabled={locked} onClick={() => void startChapter(index)} className={`${button} text-left ${locked ? 'border-slate-200 bg-slate-100 text-slate-400' : 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'}`}>
            <span className="block text-xs font-black uppercase tracking-wide">Chapter {index + 1} {progress.completedChapterIds.includes(item.id) ? '✓' : ''}</span><span className="mt-1 block">{startPending ? 'Checking saved progress…' : item.title}</span>
          </button>;
        })}</div>
      </section>}
      {chapterResult && <section className={`${panel} mx-auto w-full max-w-xl p-6 text-center`}>
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Check size={32} /></div>
        <h1 className="text-2xl font-black text-emerald-950">Chapter complete!</h1>
        <p className="mt-2 text-slate-700">You finished “{chapterResult.chapter.title}”. {chapterResult.newlyEarned ? 'Your chapter reward is saved.' : 'This chapter was already completed, so replay added no reward.'}</p>
        <button type="button" className={`${button} mt-6 border-emerald-700 bg-emerald-700 px-8 text-white`} onClick={() => { setChapterResult(null); if (sessionTarget > 0) onReviewComplete?.(); }}>Choose next chapter <ChevronRight className="ml-2 inline" size={18} /></button>
      </section>}
      {round && chapter && <section data-safari-round={round.id} aria-label="Sound mission" className={`${panel} mx-auto w-full max-w-3xl p-2 sm:p-7`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><p className="text-xs font-black uppercase tracking-wide text-emerald-700">Chapter {chapterIndex + 1} · Challenge {roundIndex + 1} of 6</p><h1 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">{chapter.title}</h1></div>
          <div className="flex gap-1" aria-label={`${roundIndex + 1} of 6 challenges`} role="status">{chapter.rounds.map((item, index) => <span key={item.id} className={`h-2 w-5 rounded-full ${index <= roundIndex ? 'bg-emerald-500' : 'bg-slate-200'}`} />)}</div>
        </div>
        {roundIndex === 0 && feedback?.kind !== 'correct' && <p className="mt-2 hidden rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-950 sm:block">{chapter.intro}</p>}
        {(visualPractice || !soundOn) && <p role="status" className="mt-1 rounded-xl bg-amber-50 px-2 py-0.5 text-xs font-semibold leading-tight text-amber-900 sm:mt-3 sm:px-3 sm:py-2 sm:text-sm"><span className="sm:hidden">Visual practice · assisted</span><span className="hidden sm:inline">Visual practice: sound was muted or unavailable, so this answer will be marked assisted.</span></p>}
        {feedback?.kind !== 'correct' && <><div className="mt-2 flex flex-wrap items-center justify-center gap-1 rounded-2xl bg-slate-50 p-2 text-center sm:mt-4 sm:gap-2 sm:p-4">
          {chapter.id === 'listen' && <><p className="w-full text-base font-bold leading-tight text-slate-800 sm:text-lg">Which picture begins with this sound?</p><button type="button" disabled={!phonemeAudio?.[round.target.sound] || !soundOn} onClick={() => playPhoneme(round.target.sound)} className={`${button} border-emerald-200 bg-white text-emerald-800`}>Hear /{round.target.sound}/</button> {!feedback && <button type="button" disabled={usedClue} onClick={useClue} className={`${button} border-amber-200 bg-amber-50 text-amber-900`}><Lightbulb size={18} className="mr-2 inline" />{usedClue ? 'Clue used' : 'Use one clue'}</button>}</>}
          {chapter.id === 'blend' && <><p className="w-full text-base font-bold leading-tight text-slate-800 sm:text-lg">Tap each sound from left to right. Then choose the matching picture.</p><div className="flex flex-wrap justify-center gap-1 sm:gap-2">{round.word.phonemes.map((sound, index) => <button type="button" disabled={Boolean(feedback) || index > blendStep} onClick={() => chooseBlendTile(index, sound)} aria-label={`Hear sound ${index + 1}`} aria-pressed={index < blendStep} className={`${button} min-h-12 min-w-12 border-emerald-300 bg-white px-3 py-2 text-lg text-emerald-800 sm:min-h-14 sm:min-w-14 sm:text-xl ${index === blendStep ? 'ring-2 ring-emerald-400' : ''}`} key={`${sound}-${index}`}>{index + 1}</button>)}</div> {!feedback && <button type="button" disabled={usedClue} onClick={useClue} className={`${button} border-amber-200 bg-amber-50 text-amber-900`}><Lightbulb size={18} className="mr-2 inline" />{usedClue ? 'Clue used' : 'Use one clue'}</button>}</>}
          {chapter.id === 'segment' && <><p className="w-full text-base font-bold leading-tight text-slate-800 sm:text-lg">Listen to the picture word. Tap its sounds from first to last.</p><figure className="w-full" aria-label={`Picture clue for ${round.word.word.toLowerCase()}`}><SvgWordPicture item={round.word} /><figcaption className="text-xs font-bold text-slate-700 sm:text-sm">{round.word.word.toLowerCase()}</figcaption></figure><div className="flex min-h-12 items-center gap-1" aria-live="polite">{selectedSounds.map((id) => { const sound = segmentChoices.find((item) => item.id === id)?.sound; return <span className="rounded-xl bg-emerald-100 px-2 py-1 text-lg font-black text-emerald-800 sm:px-4 sm:py-2 sm:text-xl" key={id}>{sound}</span>; })}</div>{!feedback && <button type="button" disabled={usedClue} onClick={useClue} className={`${button} border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 sm:px-4 sm:py-3 sm:text-base`}><Lightbulb size={18} className="mr-1 inline" />{usedClue ? <span role="status" className="text-sm">First sound: /{round.word.phonemes[0]}/</span> : 'Use one clue'}</button>}</>}
          {promptClipText && <button type="button" disabled={!getSoundSafariVoiceClip(promptClipText)} onClick={playWordPrompt} className={`${button} mt-1 border-blue-200 bg-white text-blue-800`}><Volume2 size={19} className="mr-2 inline" />Hear {chapter.id === 'blend' ? 'instructions' : 'the word again'}</button>}
          {clueText && chapter.id !== 'segment' && <p className="w-full rounded-xl bg-amber-50 p-2 text-center text-sm font-bold text-amber-950 sm:p-3" role="status">{clueText}</p>}
        </div>
        {chapter.id === 'segment' ? <>
          <div className="mt-2 grid grid-cols-3 gap-1 sm:mt-4 sm:grid-cols-3 sm:gap-3">{segmentChoices.map((choice) => <button type="button" key={choice.id} disabled={Boolean(feedback)} onClick={() => chooseSound(choice)} aria-pressed={selectedSounds.includes(choice.id)} aria-label={`Hear /${choice.sound}/ and add it`} className={`${button} min-h-12 border-slate-200 bg-white px-2 py-2 text-sm text-slate-800 hover:border-emerald-300 sm:text-base ${selectedSounds.includes(choice.id) ? 'border-emerald-600 bg-emerald-100 text-emerald-900' : ''}`}>/{choice.sound}/</button>)}</div>
          {!feedback && <button type="button" disabled={selectedSounds.length !== round.word.phonemes.length} onClick={submitSegments} className={`${button} mt-2 w-full border-emerald-700 bg-emerald-700 text-white sm:mt-3`}>Check sounds</button>}
        </> : (chapter.id === 'blend' ? blendStep === round.word.phonemes.length : true) && <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-4 sm:grid-cols-4 sm:gap-3">{options.map((option, index) => <button type="button" key={option.id} disabled={Boolean(feedback)} onClick={() => answer(option)} data-word={option.id} aria-label={`Picture choice ${index + 1}: ${option.word.toLowerCase()}`} className={`${button} min-h-[5.5rem] border-emerald-200 bg-white px-1 py-1 text-left hover:border-emerald-500 hover:bg-emerald-50 sm:min-h-32 sm:px-4 sm:py-3`}><SvgWordPicture item={option} /></button>)}</div>}
        </>}
        {feedback && <div className={`mt-2 rounded-2xl p-2 text-sm ${feedback.kind === 'correct' ? 'bg-emerald-50 text-emerald-950' : 'bg-amber-50 text-amber-950'} sm:mt-4 sm:p-4 sm:text-base`} aria-live="polite">
          {feedback.kind === 'correct' && <div className="mx-auto mb-1 flex max-w-24 justify-center rounded-2xl bg-white p-1 sm:mb-3 sm:max-w-48 sm:p-3"><SvgWordPicture item={chapter.id === 'listen' ? round.pictureWord : round.word} /></div>}
          <p className="font-bold">{feedback.text}</p>
          {feedback.kind === 'correct' && completionError && roundIndex === 5 && <div className="mt-3 rounded-xl border-2 border-rose-300 bg-white p-3 text-sm" role="alert"><p>{completionError}</p><button type="button" onClick={retryChapterSave} disabled={completionPending} className={`${button} mt-2 border-rose-700 bg-rose-700 text-white`}>{completionPending ? 'Saving chapter…' : completionError.includes('reward') || completionError.includes('rewards') ? 'Retry reward confirmation' : 'Retry saving this chapter'}</button></div>}
          {feedback.kind === 'correct' ? <div className="mt-2 flex flex-wrap gap-1 sm:mt-3 sm:gap-2"><button type="button" onClick={() => setShowReplay((shown) => !shown)} aria-expanded={showReplay} className={`${button} border-emerald-200 bg-white px-2 py-2 text-sm text-emerald-900 sm:px-4 sm:py-3 sm:text-base`}><RotateCcw size={17} className="mr-1 inline" />Read explanation again</button><button type="button" disabled={!explanationAudioReady} onClick={playExplanation} className={`${button} border-emerald-200 bg-white px-2 py-2 text-sm text-emerald-900 sm:px-4 sm:py-3 sm:text-base`}><Volume2 size={17} className="mr-1 inline" />Hear sounds and word</button><button type="button" disabled={completionPending || Boolean(completionError && roundIndex === 5)} onClick={moveNext} className={`${button} border-emerald-700 bg-emerald-700 px-2 py-2 text-sm text-white sm:px-4 sm:py-3 sm:text-base`}>{roundIndex === 5 ? 'Finish chapter' : 'Next challenge'} <ChevronRight className="ml-1 inline" size={18} /></button></div> : <button type="button" onClick={() => { setFeedback(null); setSelectedSounds([]); setBlendStep(0); setWrong(true); }} className={`${button} mt-2 border-amber-300 bg-white px-2 py-2 text-sm text-amber-900 sm:mt-3 sm:px-4 sm:py-3 sm:text-base`}>Try this challenge again</button>}
          {showReplay && feedback.kind === 'correct' && <p className="mt-3 rounded-xl border border-emerald-200 bg-white p-3" role="status">{feedback.text}</p>}
        </div>}
        {!feedback && chapter.id === 'segment' && <p className="sr-only">Choose sounds above, then check your answer.</p>}
      </section>}
      {chapterIndex !== null && <button type="button" disabled={Boolean(completionError) || completionPending} onClick={() => { cancelNarration(); stopPhonemeAudio(); setActiveRun(null); setChapterIndex(null); setFeedback(null); }} className="mx-auto mt-4 min-h-12 rounded-xl px-4 text-sm font-bold text-white underline underline-offset-4 focus-visible:outline focus-visible:outline-4 focus-visible:outline-white disabled:opacity-50">Back to chapters</button>}
    </main>
  </div>;
};

export default SoundSafari;
