import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Home, Lightbulb, Volume2 } from 'lucide-react';
import { SoundToggle } from '../shared/index.jsx';
import { countAnswerNarration, countCorrectNarration } from '../../data/batch3Narration.js';
import {
  COUNT_CONSTELLATION_PAGES, COUNT_THE_STARS_EPISODES, COUNT_THE_STARS_NARRATION,
  createCountRunSeed, createCountTheStarsRun, getCountQuestionArrangement, getCountQuestionStrategy,
} from '../../data/countTheStarsBatch3.js';
import {
  getCountTheStarsProgressStrict, recordCountTheStarsCompletionStrict, rememberCountTheStarsRunStrict,
  getCountTheStarsPendingReceiptsStrict, markCountTheStarsReceiptClaimedStrict,
} from '../../data/countTheStarsProgress.js';
import { rewardClaimToken } from '../../data/playerRewards.js';

const praiseFor = (stars) => stars === 3 ? 'Brilliant counting!' : stars === 2 ? 'Great counting!' : 'You kept counting!';
const pluralOf = (noun) => noun.endsWith('y') ? `${noun.slice(0, -1)}ies` : `${noun}s`;

const CountMotif = ({ kind, accent }) => {
  const common = { fill: accent, stroke: '#fff7d6', strokeWidth: 1.8, strokeLinejoin: 'round', strokeLinecap: 'round' };
  let art;
  switch (kind) {
    case 'firefly': art = <><ellipse cx="24" cy="25" rx="7" ry="10" {...common}/><ellipse cx="15" cy="19" rx="7" ry="4" fill="#e0f2fe" stroke="#fff" strokeWidth="1.5"/><ellipse cx="33" cy="19" rx="7" ry="4" fill="#e0f2fe" stroke="#fff" strokeWidth="1.5"/><circle cx="24" cy="30" r="5" fill="#fff7b1"/><path d="M18 37l-4 4m16-4 4 4" stroke="#fff7d6" strokeWidth="2"/></>; break;
    case 'berry': art = <><path d="M24 11c-3-6 2-8 7-8-1 5-3 8-7 8Z" fill="#86efac" stroke="#fff7d6" strokeWidth="1.5"/><path d="M24 16c-3-5-12-4-13 4-1 9 8 18 13 22 5-4 14-13 13-22-1-8-10-9-13-4Z" {...common}/><circle cx="19" cy="25" r="1.2" fill="#fff"/><circle cx="29" cy="25" r="1.2" fill="#fff"/><circle cx="24" cy="33" r="1.2" fill="#fff"/></>; break;
    case 'comet-seed': art = <><path d="M6 27 18 20 16 31 7 38m4-22 12 5" fill="none" stroke="#fde68a" strokeWidth="3" strokeLinecap="round"/><path d="m30 7 4 11 11 4-11 4-4 12-4-12-11-4 11-4Z" {...common}/></>; break;
    case 'planet': art = <><ellipse cx="24" cy="25" rx="21" ry="8" fill="none" stroke="#fef3c7" strokeWidth="3" transform="rotate(-23 24 25)"/><circle cx="24" cy="24" r="12" {...common}/><path d="M18 18q6-4 12 0" fill="none" stroke="#fff" strokeWidth="1.5"/></>; break;
    case 'rocket-light': art = <><path d="M24 5c8 6 11 15 9 26l-9 8-9-8C13 20 16 11 24 5Z" {...common}/><circle cx="24" cy="20" r="4" fill="#dbeafe" stroke="#fff" strokeWidth="1.5"/><path d="m15 27-7 8 9-2m17-6 7 8-9-2m-8 6-3 7 4-2 4 2-3-7" fill="#fb7185" stroke="#fff7d6" strokeWidth="1.5"/></>; break;
    case 'star-cluster': art = <path d="m24 5 5 12 13 1-10 8 3 13-11-7-11 7 3-13-10-8 13-1Z" {...common}/>; break;
    case 'satellite-bolt': art = <><path d="m24 5 13 7v14l-13 7-13-7V12Z" {...common}/><path d="M19 33h10v11H19z" {...common}/><path d="M20 36h8m-8 4h8M21 17h6m-3-3v6" fill="none" stroke="#1e3a8a" strokeWidth="2"/></>; break;
    case 'moon-rock': art = <><path d="m5 31 5-17 11-8 15 6 7 18-10 11H15Z" {...common}/><circle cx="17" cy="20" r="3" fill="#94a3b8"/><circle cx="31" cy="29" r="4" fill="#94a3b8"/><circle cx="27" cy="14" r="2" fill="#94a3b8"/></>; break;
    case 'observatory-window': art = <><path d="M9 6h30v36H9z" rx="4" {...common}/><path d="M24 7v34M10 24h28" stroke="#fff" strokeWidth="2"/><path d="M15 13h5m10 0h4M15 31h5m10 0h4" stroke="#fff7d6" strokeWidth="2"/></>; break;
    case 'meteor': art = <><path d="M5 36 23 25m-13 1 9-6" fill="none" stroke="#fef3c7" strokeWidth="3" strokeLinecap="round"/><path d="m31 7 4 11 10 5-10 4-5 12-4-12-10-4 10-5Z" {...common}/></>; break;
    case 'ring-stone': art = <><ellipse cx="24" cy="26" rx="21" ry="8" fill="none" stroke="#fef3c7" strokeWidth="3" transform="rotate(28 24 26)"/><path d="m24 10 9 10-9 19-9-19Z" {...common}/><path d="m15 20 9 3 9-3m-9 3v16" fill="none" stroke="#fff" strokeWidth="1.5"/></>; break;
    case 'solar-panel': art = <><rect x="8" y="7" width="32" height="34" rx="4" fill="#0c4a6e" stroke="#fff7d6" strokeWidth="2"/><rect x="11" y="10" width="26" height="28" rx="2" fill={accent}/><path d="M19.7 10v28M28.3 10v28M11 19.3h26M11 28.7h26" stroke="#1e3a8a" strokeWidth="1.5"/><path d="M13 12h5M13 14h3" stroke="#e0f2fe" strokeWidth="1.5" strokeLinecap="round"/></>; break;
    case 'nebula': art = <><circle cx="24" cy="24" r="20" fill={accent} opacity=".22"/><circle cx="24" cy="24" r="13" {...common}/><path d="M17 19q2-4 6-4" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></>; break;
    case 'crater-gem': art = <><path d="m24 5 17 12-8 24H15L7 17Z" {...common}/><path d="m7 17 17 8 17-8M24 25v16m-9-24 9 8 9-8" fill="none" stroke="#fff" strokeWidth="1.7"/><circle cx="24" cy="25" r="3" fill="#0e7490" stroke="#fff" strokeWidth="1.3"/></>; break;
    case 'map-star': art = <><path d="m5 12 12-6 14 6 12-6v32l-12 6-14-6-12 6Z" {...common}/><path d="M17 7v30m14-25v30m-14-18 14 6" fill="none" stroke="#fff" strokeWidth="1.5"/><path d="m25 14 2.5 5 5.5.8-4 3.8 1 5.4-5-2.7-5 2.7 1-5.4-4-3.8 5.5-.8Z" fill="#fef08a" stroke="#fff" strokeWidth="1.4"/></>; break;
    default: art = <circle cx="24" cy="24" r="17" {...common}/>;
  }
  return <svg aria-hidden="true" viewBox="0 0 48 48" className="h-9 w-9 drop-shadow sm:h-10 sm:w-10">{art}</svg>;
};

const constellationPoints = {
  'constellation-star-garden': [[12, 44], [29, 20], [45, 47], [66, 17], [86, 42]],
  'constellation-workshop': [[9, 24], [27, 45], [44, 16], [60, 43], [80, 19], [90, 51], [40, 62]],
  'galaxy-survey': [[50, 7], [75, 15], [91, 37], [81, 60], [61, 79], [36, 77], [13, 56], [15, 31], [39, 17]],
};
const ConstellationArt = ({ page, locked = false }) => {
  const points = constellationPoints[page.id] || constellationPoints['constellation-star-garden'];
  const lines = points.map((point, index) => `${point.join(',')} ${points[(index + 1) % points.length].join(',')}`).join(' ');
  return <svg viewBox="0 0 100 90" role="img" aria-label={`${page.name} star map`} className={`mx-auto h-20 w-24 ${locked ? 'opacity-45' : ''}`}>
    <polyline points={lines} fill="none" stroke={locked ? '#94a3b8' : '#fde68a'} strokeWidth="1.8" strokeLinejoin="round"/>
    {points.map(([x, y], index) => <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}><path d="m0-6 1.7 4 4.3 1-3.3 2.8 1 4.2L0 4-3.7 6l1-4.2L-6-1l4.3-1Z" fill={locked ? '#64748b' : index % 2 ? '#fef3c7' : '#fbbf24'} stroke={locked ? '#94a3b8' : '#fff7d6'} strokeWidth=".8"/></g>)}
  </svg>;
};

const AmariCountTheStars = ({ onBack, playSfx = () => {}, speak = () => {}, cancelNarration = () => {}, soundOn, onToggleSound, onCelebrate = () => {}, onGameEvent, onPhaseChange, playerId = 'amari' }) => {
  const [progressState, setProgressState] = useState(() => getCountTheStarsProgressStrict(playerId));
  const [phase, setPhase] = useState('map');
  const [episodeIndex, setEpisodeIndex] = useState(0);
  const [run, setRun] = useState(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [tappedIds, setTappedIds] = useState([]);
  const [roundHadMistake, setRoundHadMistake] = useState(false);
  const [roundHadHint, setRoundHadHint] = useState(false);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [hintCount, setHintCount] = useState(0);
  const [hintText, setHintText] = useState('');
  const [feedback, setFeedback] = useState('Choose an unlocked star survey to begin.');
  const [lastResult, setLastResult] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [pendingStart, setPendingStart] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(() => {
    const initial = getCountTheStarsProgressStrict(playerId);
    return initial.ok ? initial.progress.unlockedEpisode : 0;
  });
  const [selectedEpisodeDetails, setSelectedEpisodeDetails] = useState(false);
  const [receiptBusy, setReceiptBusy] = useState(false);
  const [receiptError, setReceiptError] = useState('');
  const receiptBusyRef = useRef(false);
  const [completionSaved, setCompletionSaved] = useState(false);
  const [completionReady, setCompletionReady] = useState(false);
  const completionRef = useRef(null);
  const progress = progressState.progress || { unlockedEpisode: 0, completedEpisodeIds: [], bestStars: {}, earnedConstellationPageIds: [], rewardReceipts: [], recentQuestionIds: {} };

  const episode = COUNT_THE_STARS_EPISODES[episodeIndex] || COUNT_THE_STARS_EPISODES[0];
  const round = run?.rounds[roundIndex] || null;
  const arrangement = getCountQuestionArrangement(round);
  const strategy = getCountQuestionStrategy(round, episode);
  const layoutDescription = arrangement === 'split-groups' ? 'two visible groups'
    : arrangement === 'scattered' ? 'scattered one by one'
      : arrangement === 'array' ? 'organized rows or an array' : '';

  useEffect(() => { onPhaseChange?.(phase === 'map' || phase === 'collection' ? 'map' : phase === 'complete' ? 'complete' : 'play'); }, [onPhaseChange, phase]);
  useEffect(() => () => cancelNarration(), [cancelNarration]);

  const refreshProgress = () => {
    const result = getCountTheStarsProgressStrict(playerId);
    setProgressState(result);
    return result;
  };

  const drainReceipts = async () => {
    if (receiptBusyRef.current) return false;
    receiptBusyRef.current = true;
    setReceiptBusy(true);
    setReceiptError('');
    try {
      const pending = getCountTheStarsPendingReceiptsStrict(playerId);
      if (!pending.ok) { setReceiptError(pending.error || 'Saved stars could not be checked.'); return false; }
      setProgressState({ ok: true, progress: pending.progress });
      for (const receipt of pending.receipts) {
        let parentResult;
        try {
          parentResult = await onCelebrate(`${COUNT_THE_STARS_EPISODES.find(({ id }) => receipt.id.startsWith(`${id}:`))?.name || 'Survey'} stars saved`, receipt.rewardDelta * 4, 0, 'counting', { quiet: true, rewardToken: rewardClaimToken('counting', receipt.id) });
        } catch { parentResult = null; }
        if (parentResult?.persisted !== true) { setReceiptError('Your stars are waiting to sync. Retry saved stars.'); return false; }
        const marked = markCountTheStarsReceiptClaimedStrict(playerId, receipt.id);
        if (!marked.ok) { setReceiptError(marked.error || 'Your stars were saved, but the receipt needs a retry.'); return false; }
        setProgressState({ ok: true, progress: marked.progress });
      }
      setReceiptError('');
      return true;
    } finally { receiptBusyRef.current = false; setReceiptBusy(false); }
  };

  useEffect(() => {
    if (phase === 'map' && progressState.ok) void drainReceipts();
    // Pending receipts are read again after an explicit retry; avoid rerunning the drain for each state write.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, progressState.ok]);

  const beginSavedRun = (index, nextRun) => {
    const selectedEpisode = COUNT_THE_STARS_EPISODES[index];
    setPendingStart(null);
    setSaveMessage('');
    setProgressState({ ok: true, progress: nextRun.savedProgress });
    setEpisodeIndex(index);
    setRun(nextRun.run);
    setRoundIndex(0);
    setTappedIds([]);
    setRoundHadMistake(false);
    setRoundHadHint(false);
    setMistakeCount(0);
    setHintCount(0);
    setHintText('');
    setLastResult(null);
    completionRef.current = null;
    setCompletionSaved(false);
    setCompletionReady(false);
    setFeedback('Tap each object once, then choose how many you counted.');
    setPhase('count');
    if (progress.completedEpisodeIds.includes(selectedEpisode.id)) onGameEvent?.('counting', 'replay', { level: index, round: 0, seed: nextRun.run.seed, difficulty: selectedEpisode.band });
    onGameEvent?.('counting', 'start', { level: index, round: 0, seed: nextRun.run.seed, difficulty: selectedEpisode.band });
    onGameEvent?.('counting', 'question', { level: index, round: 1, seed: nextRun.run.seed, difficulty: selectedEpisode.band });
    speak(COUNT_THE_STARS_NARRATION.instruction, { premium: false, segments: [COUNT_THE_STARS_NARRATION.instruction] });
    playSfx('launch');
  };

  const prepareEpisode = (index, preserved = null) => {
    if (index > progress.unlockedEpisode) return;
    cancelNarration();
    const currentProgress = refreshProgress();
    if (!currentProgress.ok || index > currentProgress.progress.unlockedEpisode) { setSaveMessage('Saved surveys could not be checked. Retry before starting.'); return; }
    const pendingRewards = getCountTheStarsPendingReceiptsStrict(playerId);
    if (!pendingRewards.ok) { setReceiptError(pendingRewards.error || 'Saved stars could not be checked.'); return; }
    if (pendingRewards.receipts.length) {
      setSelectedEpisode(index);
      setReceiptError('Sync saved stars before starting another survey.');
      void drainReceipts();
      return;
    }
    const seed = preserved?.seed ?? createCountRunSeed();
    const nextRun = preserved?.run ?? createCountTheStarsRun(index, seed, currentProgress.progress.recentQuestionIds[index] || []);
    if (!nextRun) return;
    const saved = rememberCountTheStarsRunStrict(playerId, index, nextRun.rounds.map(({ id }) => id));
    if (!saved.ok) {
      setPendingStart({ index, seed, run: nextRun });
      setSaveMessage('Your survey is ready, but its progress could not be saved. Retry saving survey.');
      setSelectedEpisode(index);
      setPhase('map');
      return;
    }
    beginSavedRun(index, { run: nextRun, seed, savedProgress: saved.progress });
  };

  const startEpisode = (index) => prepareEpisode(index);
  const retryStart = () => pendingStart && prepareEpisode(pendingStart.index, pendingStart);

  const handleTapObject = (objectId) => {
    if (phase !== 'count' || !round || tappedIds.includes(objectId)) return;
    const nextTapped = [...tappedIds, objectId];
    setTappedIds(nextTapped);
    playSfx('tap');
    if (nextTapped.length === round.count) {
      setPhase('answer');
      setFeedback(COUNT_THE_STARS_NARRATION.countQuestion);
      const narration = countAnswerNarration(nextTapped.length);
      speak(narration.text, { premium: false, segments: narration.segments });
    } else {
      speak(String(nextTapped.length), { premium: false, segments: [String(nextTapped.length)] });
    }
  };

  const saveCompletedSurvey = async () => {
    const stars = mistakeCount === 0 && hintCount === 0 ? 3 : mistakeCount <= 2 ? 2 : 1;
    let completion = completionRef.current;
    if (!completion?.localSaved) {
      const priorDraft = completion?.draft || {
        newlyCompleted: !progress.completedEpisodeIds.includes(episode.id),
        newlyEarnedPage: !progress.completedEpisodeIds.includes(episode.id) && !progress.earnedConstellationPageIds.includes(episode.pageId),
      };
      completionRef.current = { draft: priorDraft, localSaved: false };
      const result = recordCountTheStarsCompletionStrict(playerId, episodeIndex, stars, run.rounds.map(({ id }) => id));
      if (!result.ok) {
        setCompletionSaved(false);
        setCompletionReady(false);
        setSaveMessage(result.error || 'The survey result could not be saved.');
        setLastResult({ pending: true, stars });
        return false;
      }
      completion = { ...result, newlyCompleted: result.newlyCompleted || priorDraft.newlyCompleted, newlyEarnedPage: result.newlyEarnedPage || priorDraft.newlyEarnedPage, draft: priorDraft, localSaved: true };
      completionRef.current = completion;
      setLastResult(completion);
      setProgressState({ ok: true, progress: result.progress });
      setCompletionSaved(true);
      if (result.newlyCompleted && episodeIndex < COUNT_THE_STARS_EPISODES.length - 1) setSelectedEpisode(episodeIndex + 1);
      onGameEvent?.('counting', 'level_complete', { level: episodeIndex, round: run.rounds.length, seed: run.seed, firstAttempt: mistakeCount === 0, hints: hintCount, difficulty: episode.band });
    }
    const claimsConfirmed = await drainReceipts();
    const refreshed = getCountTheStarsPendingReceiptsStrict(playerId);
    const noPending = refreshed.ok && refreshed.receipts.length === 0;
    setCompletionReady(Boolean(claimsConfirmed && noPending));
    setSaveMessage(noPending ? '' : 'Your survey is saved. Retry saved stars to finish syncing.');
    return Boolean(claimsConfirmed && noPending);
  };

  const retryCompletion = () => { if (phase === 'fact' && completionRef.current) void saveCompletedSurvey(); else if (phase === 'fact') void saveCompletedSurvey(); };

  const handleAnswer = (answer) => {
    if (!round || phase !== 'answer') return;
    if (answer !== round.count) {
      setRoundHadMistake(true);
      setMistakeCount((count) => count + 1);
      setFeedback(COUNT_THE_STARS_NARRATION.recountClue);
      onGameEvent?.('counting', 'answer_attempt', { level: episodeIndex, round: roundIndex + 1, seed: run.seed, correct: false, firstAttempt: !roundHadMistake, hints: Number(roundHadHint) });
      speak(COUNT_THE_STARS_NARRATION.recountClue, { premium: false, segments: [COUNT_THE_STARS_NARRATION.recountClue] });
      playSfx('wrong');
      return;
    }
    const firstAttempt = !roundHadMistake;
    onGameEvent?.('counting', 'answer_attempt', { level: episodeIndex, round: roundIndex + 1, seed: run.seed, correct: true, firstAttempt, hints: Number(roundHadHint) });
    onGameEvent?.('counting', 'answer_correct', { level: episodeIndex, round: roundIndex + 1, seed: run.seed, firstAttempt, hints: Number(roundHadHint), difficulty: episode.band });
    setFeedback(praiseFor(firstAttempt && !roundHadHint ? 3 : 2));
    setHintText('');
    setPhase('fact');
    const narration = countCorrectNarration(praiseFor(firstAttempt && !roundHadHint ? 3 : 2), round.explanation);
    speak(narration.text, { premium: false, segments: narration.segments });
    playSfx('success');
    if (roundIndex === run.rounds.length - 1) void saveCompletedSurvey();
  };

  const showCountingClue = () => {
    if (!round || roundHadHint || !['count', 'answer'].includes(phase)) return;
    const clue = COUNT_THE_STARS_NARRATION.hints[
      arrangement === 'split-groups' ? 0 : arrangement === 'scattered' ? 1 : 2
    ];
    setRoundHadHint(true);
    setHintCount((count) => count + 1);
    setHintText(clue);
    onGameEvent?.('counting', 'hint', { level: episodeIndex, round: roundIndex + 1, seed: run.seed, hints: 1, hintType: 'counting_strategy', difficulty: episode.band });
    speak(clue, { premium: false, segments: [clue] });
  };

  const restartCount = () => {
    if (!round || phase !== 'answer') return;
    setTappedIds([]);
    setRoundHadHint(true);
    setHintCount((count) => count + 1);
    setHintText('Start again at 1. A recount uses one clue; your answer mistakes stay the same.');
    setFeedback('Tap each object once, then choose the total again.');
    setPhase('count');
    speak(COUNT_THE_STARS_NARRATION.instruction, { premium: false, segments: [COUNT_THE_STARS_NARRATION.instruction] });
  };

  const replayFact = () => {
    if (!round || phase !== 'fact') return;
    const narration = countCorrectNarration(praiseFor(!roundHadMistake && !roundHadHint ? 3 : 2), round.explanation);
    speak(narration.text, { premium: false, segments: narration.segments });
  };

  const advance = () => {
    if (phase !== 'fact' || !run) return;
    if (roundIndex === run.rounds.length - 1 && !completionReady) return;
    cancelNarration();
    if (roundIndex < run.rounds.length - 1) {
      const nextIndex = roundIndex + 1;
      setRoundIndex(nextIndex);
      setTappedIds([]);
      setRoundHadMistake(false);
      setRoundHadHint(false);
      setHintText('');
      setFeedback(`Round ${nextIndex + 1} of ${run.rounds.length}. Tap each object once.`);
      setPhase('count');
      onGameEvent?.('counting', 'question', { level: episodeIndex, round: nextIndex + 1, seed: run.seed, difficulty: episode.band });
      speak(COUNT_THE_STARS_NARRATION.instruction, { premium: false, segments: [COUNT_THE_STARS_NARRATION.instruction] });
      return;
    }
    setPhase('complete');
    setFeedback(COUNT_THE_STARS_NARRATION.episodeComplete);
    speak(COUNT_THE_STARS_NARRATION.episodeComplete, { premium: false, segments: [COUNT_THE_STARS_NARRATION.episodeComplete] });
  };

  const leaveGame = () => {
    cancelNarration();
    if (run) onGameEvent?.('counting', 'leave', { level: episodeIndex, round: roundIndex + 1, seed: run.seed, difficulty: episode.band });
    onBack?.();
  };

  const openCollection = () => { cancelNarration(); setPhase('collection'); };

  return (
    <div className="min-h-[100dvh] overflow-y-auto bg-gradient-to-b from-slate-950 via-indigo-950 to-violet-950 px-3 pb-8 pt-3 text-white sm:px-6 sm:pt-5">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-2 rounded-3xl border border-white/20 bg-white/10 p-3 shadow-xl">
        <button type="button" onClick={leaveGame} className="game-icon-button shrink-0 !bg-white/20 !text-white" aria-label="Back to Maths Missions"><Home /></button>
        <div className="min-w-0 text-center"><h1 className="text-xl font-black sm:text-3xl">Count the Stars</h1><p className="text-xs font-bold text-indigo-100 sm:text-sm">{episode.name}{run && phase !== 'map' && phase !== 'collection' ? ` · Round ${roundIndex + 1} of 6` : ''}</p></div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </header>

      {phase === 'map' && <main className="mx-auto mt-3 max-w-5xl rounded-[2rem] border border-white/20 bg-white/10 p-3 shadow-2xl sm:mt-5 sm:p-7">
        <section className="rounded-3xl border-2 border-amber-200 bg-indigo-900/90 p-4 text-center shadow-xl sm:p-6">
          <p className="text-xs font-black uppercase tracking-widest text-amber-200">Your next survey</p>
          <h2 className="mt-1 text-2xl font-black sm:text-3xl">{COUNT_THE_STARS_EPISODES[selectedEpisode]?.name}</h2>
          <p className="mt-1 text-sm font-bold text-indigo-100">Count {COUNT_THE_STARS_EPISODES[selectedEpisode]?.min} to {COUNT_THE_STARS_EPISODES[selectedEpisode]?.max} objects in six star scenes.</p>
          <p className="mt-2 text-sm font-bold text-amber-100">{COUNT_THE_STARS_EPISODES[selectedEpisode]?.skill}</p>
          <button type="button" disabled={selectedEpisode > progress.unlockedEpisode || !progressState.ok || receiptBusy || Boolean(pendingStart)} onClick={() => startEpisode(selectedEpisode)} className="mt-3 min-h-14 w-full rounded-2xl bg-amber-300 px-4 py-3 font-black text-indigo-950 disabled:opacity-50">{progress.completedEpisodeIds.includes(COUNT_THE_STARS_EPISODES[selectedEpisode]?.id) ? 'Replay selected survey' : 'Start selected survey'}</button>
          {pendingStart && <button type="button" onClick={retryStart} className="mt-2 min-h-12 w-full rounded-2xl bg-white px-4 font-black text-indigo-950">Retry saving survey</button>}
          {(saveMessage || receiptError || !progressState.ok) && <p role="status" className="mt-3 rounded-xl border border-amber-200/50 bg-black/25 p-3 text-sm font-bold text-amber-100">{saveMessage || receiptError || 'Saved progress could not be checked.'}</p>}
          {receiptError && <button type="button" disabled={receiptBusy} onClick={() => void drainReceipts()} className="mt-2 min-h-12 w-full rounded-2xl bg-white px-4 font-black text-indigo-950 disabled:opacity-50">Retry saved stars</button>}
          {!progressState.ok && <button type="button" onClick={() => { const refreshed = refreshProgress(); if (refreshed.ok) { setSaveMessage(''); setReceiptError(''); } }} className="mt-2 min-h-12 w-full rounded-2xl bg-white/15 px-4 font-black">Retry reading saved surveys</button>}
        </section>
        <details className="mt-3 rounded-2xl border border-white/20 bg-black/20 p-3" open={selectedEpisodeDetails} onToggle={(event) => setSelectedEpisodeDetails(event.currentTarget.open)}>
          <summary className="min-h-12 cursor-pointer content-center font-black">Choose another survey</summary>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {COUNT_THE_STARS_EPISODES.map((entry, index) => {
              const unlocked = index <= progress.unlockedEpisode;
              const complete = progress.completedEpisodeIds.includes(entry.id);
              return <button key={entry.id} type="button" disabled={!unlocked} aria-pressed={selectedEpisode === index} onClick={() => { setSelectedEpisode(index); setSelectedEpisodeDetails(false); }} className="min-h-14 rounded-xl border border-white/25 bg-indigo-900/70 p-2 text-left font-bold disabled:opacity-50">
                {entry.name} · {entry.min}–{entry.max}{complete ? ` · Best ${progress.bestStars[entry.id] || 0} stars` : !unlocked ? ' · Locked' : ''}
              </button>;
            })}
          </div>
        </details>
        <button type="button" onClick={openCollection} className="mx-auto mt-3 flex min-h-12 items-center gap-2 rounded-2xl bg-white/15 px-5 font-black"><BookOpen /> Constellation book ({progress.earnedConstellationPageIds.length}/3)</button>
      </main>}

      {phase === 'collection' && <main className="mx-auto mt-5 max-w-4xl rounded-[2rem] border border-white/20 bg-white/10 p-5 shadow-2xl sm:p-8">
        <h2 className="text-center text-2xl font-black sm:text-3xl">Constellation book</h2>
        <p className="mt-2 text-center font-semibold text-indigo-100">Pages light up after all six rounds in a survey are finished.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {COUNT_CONSTELLATION_PAGES.map((page) => {
            const earned = progress.earnedConstellationPageIds.includes(page.id);
            return <div key={page.id} className={`rounded-2xl border p-4 text-center ${earned ? 'border-amber-200 bg-indigo-800/80' : 'border-white/15 bg-black/20 opacity-60'}`} aria-label={`${page.name}, ${earned ? 'earned' : 'locked'}`}>
              <ConstellationArt page={page} locked={!earned} /><p className="mt-2 font-black">{page.name}</p><p className="text-sm font-bold">{earned ? 'Earned' : 'Locked'}</p>
            </div>;
          })}
        </div>
        <button type="button" onClick={() => { cancelNarration(); setPhase('map'); }} className="mx-auto mt-5 block min-h-14 rounded-2xl bg-white px-6 font-black text-indigo-950">Back to surveys</button>
      </main>}

      {(phase === 'count' || phase === 'answer' || phase === 'fact') && round && <main className="mx-auto mt-4 max-w-4xl">
        <section className={`rounded-[2rem] border-2 border-white/30 bg-gradient-to-br ${round.scene.backdrop} p-2 shadow-2xl sm:p-6`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><p className="text-xs font-black uppercase tracking-widest text-white/70">{episode.name} · {episode.band}</p><h2 className="text-2xl font-black sm:text-3xl">{round.scene.title}</h2></div>
          </div>
          <p className="mt-1 rounded-xl bg-black/20 px-3 py-1.5 text-xs font-bold text-white/90 sm:mt-2 sm:py-2 sm:text-sm">{strategy}</p>
          <div className="relative mx-auto mt-2 aspect-square w-full max-w-[288px] rounded-3xl border border-white/25 bg-black/15 sm:mt-4 sm:max-w-[440px]" data-layout-variant={round.layoutVariant} data-count-episode={episode.id} data-count-question={round.id} data-run-seed={run.seed} data-round-index={roundIndex + 1} role="group" aria-label={`Counting board for ${round.scene.title}; ${layoutDescription}`}>
            {round.objects.map((object) => {
              const countedIndex = tappedIds.indexOf(object.id);
              return <button key={object.id} type="button" aria-pressed={countedIndex >= 0} disabled={phase !== 'count'} onClick={() => handleTapObject(object.id)} aria-label={`${round.scene.noun}${countedIndex >= 0 ? `, counted as ${countedIndex + 1}` : ', not counted yet'}`} style={{ left: `${object.x}%`, top: `${object.y}%` }} className={`absolute grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border-2 p-0 shadow-lg transition focus-visible:z-10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-200 sm:h-14 sm:w-14 ${countedIndex >= 0 ? 'border-yellow-100 bg-yellow-200/30 opacity-75' : 'border-white/20 bg-white/10 hover:scale-105'} disabled:cursor-default`}>
                <CountMotif kind={round.scene.motif} accent={round.scene.accent} />
                {countedIndex >= 0 && <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full border border-slate-900 bg-yellow-300 text-xs font-black text-slate-950">{countedIndex + 1}</span>}
              </button>;
            })}
          </div>
          {phase !== 'fact' && <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-black/20 px-3 py-2 sm:mt-3">
            <p className="font-black" aria-live="polite">{phase === 'count' ? (tappedIds.length ? `Counted ${tappedIds.length} object${tappedIds.length === 1 ? '' : 's'}.` : 'Tap each object once to count it.') : phase === 'answer' ? COUNT_THE_STARS_NARRATION.countQuestion : 'Count complete'}</p>
            <div className="flex flex-wrap gap-2"><button type="button" onClick={() => speak(COUNT_THE_STARS_NARRATION.instruction, { premium: false, segments: [COUNT_THE_STARS_NARRATION.instruction] })} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white/15 px-3 font-black"><Volume2 size={18} /> Hear instructions</button><button type="button" disabled={roundHadHint || phase === 'fact'} onClick={showCountingClue} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-amber-300 px-3 font-black text-indigo-950 disabled:opacity-50"><Lightbulb size={18} /> Show a clue</button></div>
          </div>}
          {hintText && <p className="mt-2 rounded-xl border border-amber-100/50 bg-amber-200/15 px-3 py-2 text-sm font-bold" role="status" aria-live="polite">{hintText}</p>}
          {phase === 'answer' && <div className="mt-2 rounded-2xl border border-white/20 bg-black/20 p-2 text-center sm:mt-4 sm:p-3">
            <p className="mb-2 text-base font-black sm:mb-3 sm:text-lg">How many {pluralOf(round.scene.noun)} did you count?</p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">{round.options.map((option) => <button key={option} type="button" onClick={() => handleAnswer(option)} className="min-h-16 min-w-16 rounded-2xl bg-amber-300 px-4 text-2xl font-black text-slate-950 shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-white">{option}</button>)}</div>
            <button type="button" onClick={restartCount} className="mt-3 min-h-12 rounded-xl bg-white/15 px-4 font-black text-white underline decoration-white/70 underline-offset-4 focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-200">Recount from 1 · uses a clue</button>
            {feedback && <p className="mt-3 font-bold text-amber-100" role="status" aria-live="polite">{feedback}</p>}
          </div>}
          {phase === 'fact' && <div className="mt-4 rounded-2xl border-2 border-emerald-200/70 bg-emerald-950/50 p-4 text-center" role="status" aria-live="polite">
            <p className="text-xl font-black text-emerald-100">{feedback}</p>
            <p className="mt-2 text-lg font-bold">{round.explanation}</p>
            <button type="button" onClick={replayFact} className="mt-4 min-h-12 rounded-xl bg-white/15 px-5 font-black text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-200">Hear explanation</button>
            {roundIndex === run.rounds.length - 1 && !completionReady && <div className="mx-auto mt-3 max-w-xl rounded-xl border border-amber-200/60 bg-black/25 p-3 text-left">
              <p className="font-bold text-amber-100" role="status">{saveMessage || receiptError || (completionSaved ? 'Your survey is saved. Stars still need to sync.' : 'Saving your survey…')}</p>
              <button type="button" disabled={receiptBusy} onClick={retryCompletion} className="mt-2 min-h-12 w-full rounded-xl bg-white px-4 font-black text-indigo-950 disabled:opacity-50">{completionSaved ? 'Retry saved stars' : 'Retry saving survey'}</button>
            </div>}
            <button type="button" disabled={roundIndex === run.rounds.length - 1 && !completionReady} onClick={advance} className="mt-4 min-h-14 rounded-2xl bg-amber-300 px-8 py-3 text-lg font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
          </div>}
        </section>
      </main>}

      {phase === 'complete' && <main className="mx-auto mt-5 max-w-2xl rounded-[2rem] border-2 border-amber-200/60 bg-indigo-900/90 p-6 text-center shadow-2xl sm:p-10">
        <ConstellationArt page={COUNT_CONSTELLATION_PAGES.find(({ episodeId }) => episodeId === episode.id)} locked={!(lastResult?.progress.earnedConstellationPageIds || progress.earnedConstellationPageIds).includes(episode.pageId)} />
        <h2 className="mt-2 text-3xl font-black">{episode.name} complete!</h2>
        <p className="mt-3 text-lg font-bold">{COUNT_THE_STARS_NARRATION.episodeComplete}</p>
        {lastResult?.newlyEarnedPage && <p className="mt-3 rounded-2xl bg-amber-200 p-4 font-black text-indigo-950">Constellation page earned: {episode.name} Constellation</p>}
        <p className="mt-2 font-bold text-amber-100">Best: {lastResult?.progress.bestStars[episode.id] || progress.bestStars[episode.id] || 0} stars</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">{episodeIndex < COUNT_THE_STARS_EPISODES.length - 1 && <button type="button" onClick={() => startEpisode(episodeIndex + 1)} className="min-h-14 rounded-2xl bg-amber-300 px-6 font-black text-indigo-950">Next survey: {COUNT_THE_STARS_EPISODES[episodeIndex + 1].name}</button>}<button type="button" onClick={() => { cancelNarration(); setPhase('map'); }} className="min-h-14 rounded-2xl bg-white px-6 font-black text-indigo-950">Survey map</button><button type="button" onClick={openCollection} className="min-h-14 rounded-2xl bg-white/15 px-6 font-black text-white">Constellation book</button></div>
      </main>}
    </div>
  );
};

export default AmariCountTheStars;
