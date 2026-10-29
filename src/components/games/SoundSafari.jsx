import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Volume2, Lightbulb, RotateCcw, Check, ChevronRight } from 'lucide-react';
import { SoundToggle } from '../shared/index.jsx';
import { getTaughtGraphemes, makeLearningEvent } from '../../data/literacy.js';
import { getOfflineVoiceClip } from '../../data/offlineVoice.js';
import { rewardClaimToken } from '../../data/playerRewards.js';
import {
  buildRoundOptions, buildSegmentChoices, buildSoundSafariRun, getSoundSafariAttemptQuality,
  SOUND_SAFARI_BLEND_PROMPT, SOUND_SAFARI_CHAPTERS, SOUND_SAFARI_PHONEME_AUDIO, SOUND_SAFARI_PHONEME_KEYS,
} from '../../data/soundSafariAdventure.js';
import {
  getPendingSoundSafariRewardReceiptsStrict, getSoundSafariProgressStrict,
  markSoundSafariRewardReceiptClaimedStrict, pendingSoundSafariRewardReceipts,
  recordSoundSafariChapterCompletionStrict,
} from '../../data/soundSafariProgress.js';
import safariScene from '../../assets/game-scenes/sound-safari.webp';
import './amariScenes.css';

const sayPackaged = (speak, text) => {
  if (!getOfflineVoiceClip(text)) return false;
  speak(text, { premium: false, segments: [text] });
  return true;
};

function SvgWordPicture({ item }) {
  const w = item.word.toLowerCase();
  const stroke = '#263449';
  const base = <>
    <ellipse cx="60" cy="80" rx="37" ry="5" fill="#dce8dc" />
    {w === 'insect' && <><path d="M25 72q33-29 75-35M60 59l-15-18m23 13 20-19M48 66 35 58m31 3 17 9" fill="none" stroke="#54875a" strokeWidth="5" strokeLinecap="round"/><ellipse cx="60" cy="51" rx="19" ry="22" fill="#db6258" stroke={stroke} strokeWidth="3"/><path d="M60 30v42" stroke={stroke} strokeWidth="2"/><circle cx="51" cy="44" r="3" fill={stroke}/><circle cx="69" cy="44" r="3" fill={stroke}/><circle cx="51" cy="58" r="3" fill={stroke}/><circle cx="69" cy="58" r="3" fill={stroke}/><circle cx="60" cy="26" r="8" fill="#394657"/><path d="m56 20-6-8m14 8 6-8m-20 5-5 2m28-2 5 2" stroke={stroke} strokeWidth="2" strokeLinecap="round"/></>}
    {w === 'in' && <><rect x="28" y="26" width="64" height="48" rx="4" fill="#e5b76b" stroke={stroke} strokeWidth="3" /><circle cx="61" cy="49" r="13" fill="#ef7d55" stroke={stroke} strokeWidth="2" /><path d="M28 36h64" stroke="#b77e3f" strokeWidth="3" /></>}
    {w === 'ant' && <><path d="M36 47 26 36m16 11 2-15m28 15 11-11M43 59 31 72m23-12-5 15m21-15 8 15m1-15 13 12" stroke={stroke} strokeWidth="3" strokeLinecap="round"/><circle cx="44" cy="51" r="10" fill="#be5944"/><circle cx="63" cy="51" r="13" fill="#cc6a4d"/><circle cx="82" cy="51" r="9" fill="#a7473b"/><circle cx="85" cy="48" r="1.8" fill="white"/></>}
    {['sit','sits','sat'].includes(w) && <><rect x="73" y="49" width="25" height="6" rx="2" fill="#aa744e"/><path d="M77 55v22m17-22v22M60 37v20h19" fill="none" stroke="#aa744e" strokeWidth="5"/><circle cx="46" cy="28" r="11" fill="#e8b48d"/><path d="M46 39v20l18 1m-18-1L36 75m28-15 10 14" fill="none" stroke="#487f9c" strokeWidth="8" strokeLinecap="round"/></>}
    {['sip','sips'].includes(w) && <><path d="M36 39h47l-5 35H42z" fill="#8ed1d5" stroke={stroke} strokeWidth="3"/><path d="M60 39 70 20h7" fill="none" stroke="#dc7650" strokeWidth="4"/><path d="M83 48h8a8 8 0 0 1 0 16h-9" fill="none" stroke={stroke} strokeWidth="3"/><path d="M44 52h31" stroke="white" strokeWidth="3"/></>}
    {['tip','tips'].includes(w) && <><path d="m34 70 31-36 7 23-38 15z" fill="#e4aa59" stroke={stroke} strokeWidth="3"/><path d="m71 57 16-17m-17 17 3-24m-3 24 20-5" stroke={stroke} strokeWidth="3" strokeLinecap="round"/></>}
    {['pit','pits'].includes(w) && <><path d="M22 49h76l-14 23H37z" fill="#9b633e" stroke={stroke} strokeWidth="3"/><path d="M35 49q25 35 50 0" fill="#563f35"/><path d="M27 43h66" stroke="#7ca567" strokeWidth="6" strokeLinecap="round"/></>}
    {['pin','pins'].includes(w) && <><path d="m41 67 35-40" stroke="#758391" strokeWidth="7" strokeLinecap="round"/><circle cx="80" cy="23" r="9" fill="#e16f62" stroke={stroke} strokeWidth="2"/><path d="m38 70-5 8" stroke="#394657" strokeWidth="3"/></>}
    {['tin','tins'].includes(w) && <><path d="M37 31q22-12 46 0v43q-24 12-46 0z" fill="#b9c8d0" stroke={stroke} strokeWidth="3"/><ellipse cx="60" cy="31" rx="23" ry="7" fill="#e1eaed" stroke={stroke} strokeWidth="3"/><path d="M39 40h42" stroke="#8ba3ad" strokeWidth="3"/></>}
    {['tap','taps'].includes(w) && <><path d="M34 42h50v11H60v17H47V53H34z" fill="#a8bac4" stroke={stroke} strokeWidth="3"/><path d="M50 37V28h27v9M62 68q-5 8 0 12 6-4 0-12" fill="#69bfd3" stroke="#438ca0" strokeWidth="2"/></>}
    {['nap'].includes(w) && <><path d="M29 48h62v26H29z" fill="#8bb9d4" stroke={stroke} strokeWidth="3"/><ellipse cx="48" cy="47" rx="18" ry="12" fill="#f5e6c6" stroke={stroke} strokeWidth="2"/><circle cx="52" cy="42" r="9" fill="#e8b48d"/><path d="M57 47h31" stroke="#f5e6c6" strokeWidth="8"/><path d="M72 30q8-12 18-1m-3-11q7-9 13 0" fill="none" stroke="#e5bb59" strokeWidth="3" strokeLinecap="round"/></>}
    {['pan','pans'].includes(w) && <><ellipse cx="55" cy="52" rx="28" ry="19" fill="#7b8b99" stroke={stroke} strokeWidth="3"/><path d="M80 48h23v8H80" fill="#596c7a" stroke={stroke} strokeWidth="3"/><ellipse cx="55" cy="50" rx="20" ry="12" fill="#f1ce79"/></>}
    {['pat','pats'].includes(w) && <><path d="M31 61q10-8 20 0l12 12H31z" fill="#dbad8d" stroke={stroke} strokeWidth="2"/><path d="M45 60V34q0-7 6-7t6 7v18m0 2V30q0-7 6-7t6 7v25m0 1V35q0-6 6-6t6 6v23m0 3q10-9 14-1l-4 15H55" fill="#e8b48d" stroke={stroke} strokeWidth="2"/><circle cx="94" cy="64" r="12" fill="#d89061"/><path d="m87 55-5-7m13 5 4-8" stroke={stroke} strokeWidth="3"/></>}
    {['sap'].includes(w) && <><path d="M47 73V35h25v38" fill="#936040" stroke={stroke} strokeWidth="3"/><path d="M58 38 35 24m23 17 27-20m-26 5 1-15" stroke="#5c9863" strokeWidth="7" strokeLinecap="round"/><path d="M82 50q9 11 0 14-9-3 0-14" fill="#e7b54e"/></>}
    {['nip'].includes(w) && <><path d="M28 58q19-18 39 0-20 25-39 0" fill="#da8b6b" stroke={stroke} strokeWidth="3"/><path d="M68 58q16-22 31-4-8 19-31 4" fill="#c86b54" stroke={stroke} strokeWidth="3"/><path d="M56 58h16" stroke="white" strokeWidth="3"/></>}
    {['nit','nits'].includes(w) && <><path d="M29 58q31-30 62 0" fill="none" stroke="#493d3b" strokeWidth="13"/><ellipse cx="52" cy="45" rx="5" ry="8" fill="#dfaa50" stroke={stroke} strokeWidth="2"/><ellipse cx="72" cy="39" rx="5" ry="8" fill="#dfaa50" stroke={stroke} strokeWidth="2"/><ellipse cx="83" cy="52" rx="5" ry="8" fill="#dfaa50" stroke={stroke} strokeWidth="2"/></>}
    {w === 'pip' && <><circle cx="60" cy="54" r="29" fill="#ed9a61" stroke={stroke} strokeWidth="3"/><path d="M60 25v58M31 54h58M40 34l40 40m0-40L40 74" stroke="#fff0ce" strokeWidth="4"/><ellipse cx="50" cy="45" rx="3" ry="6" fill="#6f5135"/><ellipse cx="69" cy="61" rx="3" ry="6" fill="#6f5135"/><ellipse cx="69" cy="43" rx="3" ry="6" fill="#6f5135"/><path d="M59 25q5-10 14-8" stroke="#6d9a55" strokeWidth="4"/></>}
    {['snip'].includes(w) && <><circle cx="39" cy="65" r="10" fill="none" stroke="#71838e" strokeWidth="5"/><circle cx="59" cy="65" r="10" fill="none" stroke="#71838e" strokeWidth="5"/><path d="m46 59 37-33M53 59 28 31" stroke="#d77862" strokeWidth="4"/><path d="M78 26h18v28H78z" fill="#f2da99" stroke={stroke} strokeWidth="2"/></>}
    {['snap','snaps'].includes(w) && <><path d="M42 75V44q0-5 5-5t5 5v10V30q0-5 5-5t5 5v24V34q0-5 5-5t5 5v22V40q0-5 5-5t5 5v25q-8 16-22 16-12 0-18-6" fill="#e4b494" stroke={stroke} strokeWidth="2"/><path d="m87 23 4-8m5 10 8-4" stroke="#e7b958" strokeWidth="3" strokeLinecap="round"/></>}
    {['spin','spins'].includes(w) && <><path d="M60 19v13" stroke={stroke} strokeWidth="5"/><path d="M60 31q-31 17-26 32 7 20 26 22 19-2 26-22 5-15-26-32" fill="#e86e60" stroke={stroke} strokeWidth="3"/><path d="M39 62h42" stroke="#f6d27e" strokeWidth="5"/><circle cx="60" cy="62" r="7" fill="#5b8baf"/></>}
    {['spit','spits'].includes(w) && <><circle cx="52" cy="36" r="17" fill="#e8b48d"/><path d="M36 32q16-23 33 0" fill="#394657"/><path d="M52 53v24m0-13-19 15m19-15 20 15" stroke="#5887a0" strokeWidth="8" strokeLinecap="round"/><path d="M73 48q12 9 2 14-11-2-2-14" fill="#84cfdd"/></>}
    {w === 'pants' && <><path d="M37 30h46l6 40-18 7-11-20-10 20-18-7z" fill="#e58e9d" stroke={stroke} strokeWidth="3"/><path d="m60 31 1 24m-1 0-20 15m20-15 21 15" fill="none" stroke="#b85f77" strokeWidth="3"/><path d="M38 35h46" stroke="#f4c4cc" strokeWidth="4"/></>}
    {['satin'].includes(w) && <><path d="M26 38q21-18 42 0t28 0v34q-24 15-45 0T26 72z" fill="#bfa4d7" stroke={stroke} strokeWidth="3"/><path d="M30 47q27 18 59 0m-59 12q27 18 59 0" fill="none" stroke="#e6d7f3" strokeWidth="4"/></>}
  </>;
  return <svg viewBox="0 0 120 92" className="h-16 w-full max-w-24 sm:h-24 sm:max-w-36" aria-hidden="true" focusable="false">{base}</svg>;
}

const SoundSafari = ({ onBack, playSfx = () => {}, soundOn, onToggleSound, speak = () => {}, cancelNarration = () => {}, onCelebrate = () => {}, onGameEvent, onPhaseChange, onReviewComplete, sessionTarget = 0, playerId = 'amari', phonemeAudio = SOUND_SAFARI_PHONEME_AUDIO }) => {
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
    audio.ontimeupdate = () => { if (audio.currentTime >= 0.05) heardRoundRef.current.add(`${round.id}:${sound}`); };
    audio.onended = () => { if (phonemeAudioRef.current === audio) phonemeAudioRef.current = null; };
    audio.onerror = () => { if (phonemeAudioRef.current === audio) phonemeAudioRef.current = null; setVisualPractice(true); };
    audio.play().catch(() => { if (phonemeAudioRef.current === audio) phonemeAudioRef.current = null; setVisualPractice(true); });
  };

  const playExplanation = () => {
    if (!round || !chapter || !soundOn) { setVisualPractice(true); return; }
    const answerWord = chapter.id === 'listen' ? round.pictureWord : round.word;
    const wordClip = getOfflineVoiceClip(answerWord.word);
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
      audio.onerror = () => { if (phonemeAudioRef.current === audio) phonemeAudioRef.current = null; setVisualPractice(true); };
      audio.play().catch(() => { if (phonemeAudioRef.current === audio) phonemeAudioRef.current = null; setVisualPractice(true); });
    };
    playNext();
  };
  const explanationWord = chapter?.id === 'listen' ? round?.pictureWord : round?.word;
  const explanationAudioReady = Boolean(soundOn && chapter && round && getOfflineVoiceClip(explanationWord.word)
    && (chapter.id === 'listen' ? phonemeAudio?.[round.target.sound] : round.word.phonemes.every((sound) => phonemeAudio?.[sound])));
  const masteryAudioReady = Boolean(soundOn && chapter && round && getOfflineVoiceClip(explanationWord.word)
    && (chapter.id === 'listen' ? phonemeAudio?.[round.target.sound] : round.word.phonemes.every((sound) => phonemeAudio?.[sound])));
  const hasHeardTarget = () => chapter.id === 'segment'
    ? heardRoundRef.current.has(`${round.id}:word`)
    : (chapter.id === 'listen' ? [round.target.sound] : round.word.phonemes).every((sound) => heardRoundRef.current.has(`${round.id}:${sound}`));

  const playWordPrompt = () => {
    if (!soundOn || !promptClipText) { setVisualPractice(true); return; }
    cancelNarration();
    stopPhonemeAudio();
    if (chapter.id === 'segment') {
      const source = getOfflineVoiceClip(promptClipText);
      if (!source) { setVisualPractice(true); return; }
      const audio = new Audio(source);
      phonemeAudioRef.current = audio;
      audio.ontimeupdate = () => { if (audio.currentTime >= 0.05) heardRoundRef.current.add(`${round.id}:word`); };
      audio.onended = () => { if (phonemeAudioRef.current === audio) phonemeAudioRef.current = null; };
      audio.onerror = () => { setVisualPractice(true); };
      audio.play().catch(() => { setVisualPractice(true); });
    } else sayPackaged(speak, promptClipText);
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
        <h1 className="text-xl font-black text-emerald-950 sm:text-2xl">Choose a sound mission</h1>
        <p className="mt-1 text-sm text-slate-600">Each mission has six short challenges. New missions open as you finish them.</p>
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
        {(visualPractice || !soundOn) && <p role="status" className="mt-2 rounded-xl bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900 sm:mt-3 sm:px-3 sm:py-2 sm:text-sm">Visual practice: sound was muted or unavailable, so this answer will be marked assisted.</p>}
        {feedback?.kind !== 'correct' && <><div className="mt-2 flex flex-wrap items-center justify-center gap-1 rounded-2xl bg-slate-50 p-2 text-center sm:mt-4 sm:gap-2 sm:p-4">
          {chapter.id === 'listen' && <><p className="w-full text-base font-bold leading-tight text-slate-800 sm:text-lg">Which picture begins with this sound?</p><button type="button" disabled={!phonemeAudio?.[round.target.sound] || !soundOn} onClick={() => playPhoneme(round.target.sound)} className={`${button} border-emerald-200 bg-white text-emerald-800`}>Hear /{round.target.sound}/</button> {!feedback && <button type="button" disabled={usedClue} onClick={useClue} className={`${button} border-amber-200 bg-amber-50 text-amber-900`}><Lightbulb size={18} className="mr-2 inline" />{usedClue ? 'Clue used' : 'Use one clue'}</button>}</>}
          {chapter.id === 'blend' && <><p className="w-full text-base font-bold leading-tight text-slate-800 sm:text-lg">Tap each sound from left to right. Then choose the matching picture.</p><div className="flex flex-wrap justify-center gap-1 sm:gap-2">{round.word.phonemes.map((sound, index) => <button type="button" disabled={Boolean(feedback) || index > blendStep} onClick={() => chooseBlendTile(index, sound)} aria-label={`Hear sound ${index + 1}`} aria-pressed={index < blendStep} className={`${button} min-h-12 min-w-12 border-emerald-300 bg-white px-3 py-2 text-lg text-emerald-800 sm:min-h-14 sm:min-w-14 sm:text-xl ${index === blendStep ? 'ring-2 ring-emerald-400' : ''}`} key={`${sound}-${index}`}>{index + 1}</button>)}</div> {!feedback && <button type="button" disabled={usedClue} onClick={useClue} className={`${button} border-amber-200 bg-amber-50 text-amber-900`}><Lightbulb size={18} className="mr-2 inline" />{usedClue ? 'Clue used' : 'Use one clue'}</button>}</>}
          {chapter.id === 'segment' && <><p className="w-full text-base font-bold leading-tight text-slate-800 sm:text-lg">Listen to the picture word. Tap its sounds from first to last.</p><figure className="w-full" aria-label={`Picture clue for ${round.word.word.toLowerCase()}`}><SvgWordPicture item={round.word} /><figcaption className="text-xs font-bold text-slate-700 sm:text-sm">{round.word.word.toLowerCase()}</figcaption></figure><div className="flex min-h-12 items-center gap-1" aria-live="polite">{selectedSounds.map((id) => { const sound = segmentChoices.find((item) => item.id === id)?.sound; return <span className="rounded-xl bg-emerald-100 px-2 py-1 text-lg font-black text-emerald-800 sm:px-4 sm:py-2 sm:text-xl" key={id}>{sound}</span>; })}</div>{!feedback && <button type="button" disabled={usedClue} onClick={useClue} className={`${button} border-amber-200 bg-amber-50 text-amber-900`}><Lightbulb size={18} className="mr-2 inline" />{usedClue ? 'Clue used' : 'Use one clue'}</button>}</>}
          {promptClipText && <button type="button" disabled={!getOfflineVoiceClip(promptClipText)} onClick={playWordPrompt} className={`${button} mt-1 border-blue-200 bg-white text-blue-800`}><Volume2 size={19} className="mr-2 inline" />Hear {chapter.id === 'blend' ? 'instructions' : 'the word again'}</button>}
          {clueText && <p className="w-full rounded-xl bg-amber-50 p-2 text-center text-sm font-bold text-amber-950 sm:p-3" role="status">{clueText}</p>}
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
