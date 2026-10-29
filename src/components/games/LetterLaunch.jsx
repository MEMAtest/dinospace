import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { getPraise } from '../../utils.js';
import { PracticeProgress, SoundToggle } from '../shared/index.jsx';
import { makeLearningEvent, getTaughtGraphemes } from '../../data/literacy.js';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';
import {
  buildLetterLaunchRound, letterLaunchClueCaption, letterLaunchExplanation,
  letterLaunchNextSoundPrompt, letterLaunchPromptFor, letterLaunchRandomFor,
  letterLaunchTargetForPlayer,
} from '../../data/letterLaunch.js';
import {
  commitLetterLaunchChapter, markLetterLaunchRewardClaimed,
  pendingLetterLaunchRewards, readLetterLaunchProgress,
} from '../../data/letterLaunchProgress.js';
import {
  inspectChapterBadges, saveChapterBadgeStrict, LETTER_LAUNCH_CHAPTER_BADGES,
} from '../../data/chapterBadges.js';
import { rewardClaimToken } from '../../data/playerRewards.js';
import { playerStorageKey } from '../../data/players.js';
import { getOfflineVoiceClip } from '../../data/offlineVoice.js';
import rocketArt from '../../assets/little/fuel-rocket.webp';
import launchWorld from '../../assets/little/bg-fuelup.webp';
import './letterLaunch.css';

const CHAPTERS = Object.freeze([
  { id: 'letters-sound-scout', title: 'Word sound finder', subtitle: 'Hear a word and find the letter at its start.', badge: 'Sound Scout' },
  { id: 'letters-first-sound-finder', title: 'New word explorer', subtitle: 'Find the first sound in a taught, decodable word.', badge: 'First Sound Finder' },
  { id: 'letters-letter-match-maker', title: 'Big and little letters', subtitle: 'Match a little letter to its capital shape.', badge: 'Letter Match Maker' },
  { id: 'letters-cvc-blender', title: 'Build and read a word', subtitle: 'Blend taught sounds, then try longer decodable words when ready.', badge: 'CVC Word Builder' },
]);
const PHASE_LABELS = ['Word sound finder', 'New word explorer', 'Big and little letters', 'Build and read a word'];
const WORLD_BACKGROUND_STYLE = {
  backgroundImage: `linear-gradient(180deg, rgba(6,14,70,.66), rgba(6,14,70,.16) 55%, rgba(6,14,70,.36)), url(${launchWorld})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};
const historyKey = (playerId, level) => playerStorageKey(playerId, `letter_launch_recent_v1_${level}`);
const loadRecentKeys = (playerId, level) => {
  try {
    const value = JSON.parse(globalThis.localStorage?.getItem(historyKey(playerId, level)) || '[]');
    return Array.isArray(value) ? value.filter((item) => typeof item === 'string').slice(-8) : [];
  } catch { return []; }
};
const saveRecentKeys = (playerId, level, values) => {
  try { globalThis.localStorage?.setItem(historyKey(playerId, level), JSON.stringify(values.slice(-8))); } catch { /* optional variety history */ }
};
const newAttemptId = () => {
  try { return globalThis.crypto?.randomUUID?.() || `letter-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
  catch { return `letter-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
};
const newRunSeed = () => {
  try {
    const values = new Uint32Array(1);
    globalThis.crypto?.getRandomValues?.(values);
    if (values[0]) return values[0];
  } catch { /* use the local fallback below */ }
  return (Math.floor(Math.random() * 0x100000000) >>> 0) || 1;
};
const earnedIdsFromState = (state) => new Set(state?.progress?.completedChapterIds || []);

const LetterLaunch = ({
  onBack, playSfx, soundOn, onToggleSound, speak, cancelNarration, onCelebrate,
  onGameEvent, onPhaseChange, playerId = 'amari', littleMode = false,
}) => {
  const difficulty = useGameDifficulty('letters');
  const [progressState, setProgressState] = useState(() => readLetterLaunchProgress(playerId));
  const [phase, setPhase] = useState('menu');
  const [chapterIndex, setChapterIndex] = useState(0);
  const [round, setRound] = useState(null);
  const [runSeed, setRunSeed] = useState(0);
  const [roundCount, setRoundCount] = useState(0);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [mistake, setMistake] = useState(false);
  const [held, setHeld] = useState(false);
  const [chapterSaved, setChapterSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimRetryBusy, setClaimRetryBusy] = useState(false);
  const roundState = useRef(null);
  const attemptRef = useRef(null);
  const answeredRef = useRef(false);
  const nextButtonRef = useRef(null);
  const retryButtonRef = useRef(null);
  const finishHeadingRef = useRef(null);
  const lastEventRoundRef = useRef(null);
  const reconciledPlayerRef = useRef(null);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState(() => {
    const inspected = inspectChapterBadges(playerId, 'letters');
    return inspected.status === 'record' || inspected.status === 'empty' ? inspected.earnedChapterIds : [];
  });

  const chapter = CHAPTERS[chapterIndex];
  const targetCount = letterLaunchTargetForPlayer(chapterIndex, littleMode);
  const completedIds = earnedIdsFromState(progressState);
  const unlockedIndex = progressState?.ok ? progressState.progress.unlockedChapterIndex : -1;
  const selectedSoundSet = useMemo(() => getTaughtGraphemes(), []);
  const promptText = round ? letterLaunchPromptFor(round) : '';
  const canReplayPrompt = Boolean(promptText && speak && getOfflineVoiceClip(promptText, 'en-US'));
  const nextSoundText = round?.kind === 'build-word' ? letterLaunchNextSoundPrompt(round.target.graphemes[selectedTiles.length]) : '';
  const canHearNextSound = Boolean(nextSoundText && speak && getOfflineVoiceClip(nextSoundText, 'en-US'));
  const targetWordText = round?.kind === 'build-word' ? round.target.word.toLowerCase() : '';
  const canHearTargetWord = Boolean(targetWordText && speak && getOfflineVoiceClip(targetWordText, 'en-US'));
  const options = round?.kind === 'build-word' ? round.tiles : round?.options || [];
  const columns = options.length <= 2 ? 'grid-cols-2' : options.length <= 3 ? 'grid-cols-3' : options.length <= 4 ? 'grid-cols-4' : 'grid-cols-3 sm:grid-cols-6';

  const setSessionPhase = useCallback((nextPhase) => { setPhase(nextPhase); }, []);

  const refreshProgress = useCallback(() => {
    const next = readLetterLaunchProgress(playerId);
    setProgressState(next);
    const inspected = inspectChapterBadges(playerId, 'letters');
    if (inspected.status === 'record' || inspected.status === 'empty') setEarnedBadgeIds(inspected.earnedChapterIds);
    return next;
  }, [playerId]);

  const sayExact = useCallback((text) => {
    if (!soundOn || !speak || !text || !getOfflineVoiceClip(text, 'en-US')) return false;
    cancelNarration?.();
    speak(text, { premium: false, segments: [text] });
    return true;
  }, [cancelNarration, soundOn, speak]);

  const retryPendingClaims = useCallback(() => {
    if (claimRetryBusy) return false;
    const current = readLetterLaunchProgress(playerId);
    if (!current.ok) {
      setClaimError(current.error || 'Saved chapter claims could not be checked.');
      return false;
    }
    setClaimRetryBusy(true);
    setClaimError('');
    // A played legacy chapter can have a confirmed completion without a new
    // reward receipt. Recover its badge too, while keeping reward calls below
    // restricted to durable pending receipts. Unlock high-water is not proof.
    for (const chapterId of current.storedProgress.completedChapterIds) {
      const index = CHAPTERS.findIndex(({ id }) => id === chapterId);
      const badge = saveChapterBadgeStrict(playerId, 'letters', index);
      if (badge.status !== 'saved') {
        setClaimError('A completed chapter badge could not be confirmed. Retry to finish saving it.');
        setClaimRetryBusy(false);
        return false;
      }
      setEarnedBadgeIds(badge.earnedChapterIds);
    }
    const pending = pendingLetterLaunchRewards(current.storedProgress);
    for (const receipt of pending) {
      const index = CHAPTERS.findIndex(({ id }) => id === receipt.chapterId);
      const badge = saveChapterBadgeStrict(playerId, 'letters', index);
      if (badge.status !== 'saved') {
        setClaimError('The saved chapter badge could not be confirmed. Retry to finish saving this result.');
        setClaimRetryBusy(false);
        return false;
      }
      setEarnedBadgeIds(badge.earnedChapterIds);
      let parent;
      try {
        parent = onCelebrate?.('Chapter complete!', receipt.rewardDelta * 4, 0, 'letters', {
          quiet: true,
          rewardToken: rewardClaimToken('letters', receipt.transactionId),
        });
      } catch { parent = null; }
      if (parent?.persisted !== true) {
        setClaimError('The chapter is saved, but its reward could not be confirmed. Retry the same save.');
        setClaimRetryBusy(false);
        return false;
      }
      const marked = markLetterLaunchRewardClaimed(playerId, receipt.transactionId);
      if (!marked.ok) {
        setClaimError(marked.error || 'The saved reward could not be confirmed. Retry this same save.');
        setClaimRetryBusy(false);
        return false;
      }
    }
    setClaimRetryBusy(false);
    setClaimError('');
    refreshProgress();
    return true;
  }, [claimRetryBusy, onCelebrate, playerId, refreshProgress]);

  useEffect(() => { onPhaseChange?.(phase); }, [onPhaseChange, phase]);

  useEffect(() => {
    if (!soundOn) cancelNarration?.();
  }, [cancelNarration, soundOn]);

  useEffect(() => {
    const identity = String(playerId || 'amari');
    if (reconciledPlayerRef.current === identity) return;
    reconciledPlayerRef.current = identity;
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      const loaded = readLetterLaunchProgress(playerId);
      if (loaded.ok && (pendingLetterLaunchRewards(loaded.storedProgress).length > 0
        || loaded.storedProgress.completedChapterIds.length > 0)) retryPendingClaims();
    });
    return () => { active = false; };
  }, [playerId, retryPendingClaims]);

  useEffect(() => {
    if (phase !== 'play' || !round || round.kind === 'unavailable') return;
    if (!soundOn) return;
    sayExact(promptText);
  }, [phase, round, promptText, sayExact, soundOn]);

  useEffect(() => {
    if (phase !== 'play' || !round || lastEventRoundRef.current === round) return;
    lastEventRoundRef.current = round;
    onGameEvent?.('letters', roundCount === 0 ? 'start' : 'question', {
      chapter: chapter.id,
      round: roundCount,
      seed: runSeed,
      targetCount,
    });
  }, [chapter?.id, onGameEvent, phase, round, roundCount, runSeed, targetCount]);

  useEffect(() => {
    if (phase === 'play' && held && (chapterIndex >= 0) && (chapterSaved || saveError)) {
      (chapterSaved ? finishHeadingRef : retryButtonRef).current?.focus?.({ preventScroll: true });
    }
  }, [chapterIndex, chapterSaved, held, phase, saveError]);

  const exitToMenu = () => {
    cancelNarration?.();
    setSessionPhase('menu');
    setRound(null);
    setHeld(false);
    setFeedback('');
    setChapterSaved(false);
    setSaveError('');
    attemptRef.current = null;
  };

  const leaveGame = () => {
    cancelNarration?.();
    onGameEvent?.('letters', 'leave', { chapter: chapter?.id || 'menu', round: roundCount, seed: runSeed });
    onBack?.();
  };

  const beginChapter = (index) => {
    if (!progressState?.ok || index > progressState.progress.unlockedChapterIndex || pendingLetterLaunchRewards(progressState.storedProgress).length > 0 || claimError) return;
    // Chapter cards can be lower down the menu. Start each lesson at its top
    // so the clue, audio switch and choices are visible on a small screen.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const recent = loadRecentKeys(playerId, index);
    const seed = newRunSeed();
    const target = buildLetterLaunchRound(index, recent, letterLaunchRandomFor(seed, 0), 0, selectedSoundSet);
    setChapterIndex(index);
    setRunSeed(seed);
    setRoundCount(0);
    setSelectedTiles([]);
    setFeedback('');
    setMistake(false);
    setHeld(false);
    setChapterSaved(false);
    setSaveError('');
    setHintUsed(false);
    setSaving(false);
    attemptRef.current = newAttemptId();
    roundState.current = { taught: new Set(selectedSoundSet), history: recent, seed };
    answeredRef.current = false;
    lastEventRoundRef.current = null;
    setRound(target);
    setSessionPhase('play');
    playSfx?.('launch');
  };

  const completeChapter = useCallback((index) => {
    if (saving) return false;
    const attemptId = attemptRef.current || newAttemptId();
    attemptRef.current = attemptId;
    setSaving(true);
    setSaveError('');
    const local = commitLetterLaunchChapter(playerId, index, attemptId);
    if (!local.ok) {
      setSaveError(local.error || 'Chapter progress could not be saved. Retry this same result.');
      setSaving(false);
      return false;
    }
    setProgressState(readLetterLaunchProgress(playerId));

    const badge = saveChapterBadgeStrict(playerId, 'letters', index);
    if (badge.status !== 'saved') {
      setSaveError('Your chapter is saved, but its badge could not be confirmed. Retry this same result.');
      setSaving(false);
      return false;
    }
    setEarnedBadgeIds(badge.earnedChapterIds);

    if (local.receipt) {
      let parent;
      try {
        parent = onCelebrate?.('Chapter complete!', local.receipt.rewardDelta * 4, 0, 'letters', {
          quiet: true,
          rewardToken: rewardClaimToken('letters', local.receipt.transactionId),
        });
      } catch { parent = null; }
      if (parent?.persisted !== true) {
        setSaveError('Your chapter is saved, but its reward could not be confirmed. Retry this same result.');
        setSaving(false);
        return false;
      }
      const marked = markLetterLaunchRewardClaimed(playerId, local.receipt.transactionId);
      if (!marked.ok) {
        setSaveError(marked.error || 'The saved reward could not be confirmed. Retry this same result.');
        setSaving(false);
        return false;
      }
      setProgressState(readLetterLaunchProgress(playerId));
    }
    setChapterSaved(true);
    setSaveError('');
    setSaving(false);
    playSfx?.('complete');
    onGameEvent?.('letters', 'chapter_complete', { chapter: CHAPTERS[index].id, seed: runSeed, rounds: targetCount });
    return true;
  }, [onCelebrate, onGameEvent, playerId, playSfx, runSeed, saving, targetCount]);

  const acceptAnswer = (response) => {
    if (answeredRef.current || held || !round) return;
    answeredRef.current = true;
    const nextCount = roundCount + 1;
    const finalRound = nextCount >= targetCount;
    const skill = round.kind === 'build-word' ? 'cvc-blending'
      : round.kind === 'case-match' ? 'letter-cases' : chapterIndex === 0 ? 'letter-sounds' : 'initial-sounds';
    const explanation = letterLaunchExplanation(round);
    setFeedback(`${getPraise()} ${explanation}`);
    setHeld(true);
    setRoundCount(nextCount);
    if (roundState.current) {
      roundState.current.history = [...roundState.current.history, round.key].slice(-8);
      saveRecentKeys(playerId, chapterIndex, roundState.current.history);
    }
    onGameEvent?.('letters', 'answer_correct', {
      skill,
      item: round.key,
      response,
      correct: true,
      firstAttempt: !mistake,
      independent: !mistake && !hintUsed,
      difficulty,
      chapter: chapter.id,
      round: roundCount,
      seed: runSeed,
    });
    onGameEvent?.('letters', 'learning_attempt', makeLearningEvent({ skill, item: round.key, response, correct: true, firstTry: !mistake && !hintUsed, difficulty }));
    playSfx?.('success');
    if (finalRound) completeChapter(chapterIndex);
  };

  const handlePick = (option) => {
    if (!round || held || answeredRef.current) return;
    cancelNarration?.();
    if (round.kind === 'build-word') {
      const expected = round.target.graphemes[selectedTiles.length];
      if (option.grapheme !== expected) {
        onGameEvent?.('letters', 'answer_attempt', { chapter: chapter.id, round: roundCount, seed: runSeed, firstAttempt: !mistake });
        setMistake(true);
        setFeedback(`Look at the next sound in ${round.target.word.toLowerCase()}. Try that sound again.`);
        playSfx?.('oops');
        return;
      }
      const nextTiles = [...selectedTiles, option.grapheme];
      setSelectedTiles(nextTiles);
      if (nextTiles.length === round.target.graphemes.length) acceptAnswer(nextTiles.join(''));
      else {
        setFeedback('Good. Now choose the next sound.');
        playSfx?.('tap');
      }
      return;
    }
    const optionKey = (option.grapheme || option.letter).toLowerCase();
    const expectedKey = (round.target.grapheme || round.target.letter).toLowerCase();
    if (optionKey === expectedKey) acceptAnswer(optionKey);
    else {
      onGameEvent?.('letters', 'answer_attempt', { chapter: chapter.id, round: roundCount, seed: runSeed, firstAttempt: !mistake });
      setMistake(true);
      setFeedback(round.kind === 'case-match'
        ? `Look at little ${round.target.letter.toLowerCase()} again. Which capital letter matches its shape?`
        : `Not quite. Listen for the first sound in ${round.target.word} again.`);
      playSfx?.('oops');
    }
  };

  const replayClue = () => {
    setHintUsed(true);
    onGameEvent?.('letters', 'hint', { chapter: chapter.id, round: roundCount, seed: runSeed, hintType: 'replay_clue' });
    sayExact(promptText);
  };

  const hearNextSound = () => {
    if (!canHearNextSound) return;
    setHintUsed(true);
    onGameEvent?.('letters', 'hint', { chapter: chapter.id, round: roundCount, seed: runSeed, hintType: 'audio_help' });
    sayExact(nextSoundText);
  };

  const hearTargetWord = () => {
    if (!canHearTargetWord) return;
    setHintUsed(true);
    onGameEvent?.('letters', 'hint', { chapter: chapter.id, round: roundCount, seed: runSeed, hintType: 'whole_word_replay' });
    sayExact(targetWordText);
  };

  const nextMission = () => {
    if (!held || !round) return;
    if (chapterSaved) {
      setSessionPhase('review');
      setRound(null);
      return;
    }
    if (saveError) return;
    const state = roundState.current;
    const nextRecent = state?.history || loadRecentKeys(playerId, chapterIndex);
    setRound(buildLetterLaunchRound(chapterIndex, nextRecent, letterLaunchRandomFor(runSeed, roundCount), roundCount, state?.taught));
    setFeedback('');
    setHeld(false);
    setChapterSaved(false);
    setMistake(false);
    setHintUsed(false);
    setSelectedTiles([]);
    answeredRef.current = false;
    lastEventRoundRef.current = null;
  };

  const retrySave = () => {
    if (saving || !held || !round || roundCount < targetCount) return;
    completeChapter(chapterIndex);
  };

  const available = progressState?.ok === true;
  const pendingClaims = progressState?.ok ? pendingLetterLaunchRewards(progressState.storedProgress) : [];
  const completedBadgeIds = earnedBadgeIds;

  if (phase === 'menu' || phase === 'review') {
    return <main className="letter-launch letter-launch-menu min-h-screen text-white" style={WORLD_BACKGROUND_STYLE} data-letter-phase={phase}>
      <header className="letter-launch-header">
        <button type="button" onClick={leaveGame} aria-label="Back to learning world" className="letter-launch-back"><ArrowLeft /></button>
        <div className="text-center"><h1>Letter Launch</h1><p>Four letter missions · sound first, then build and read.</p></div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </header>
      <section className="letter-launch-menu-content">
        {phase === 'review' && <div className="letter-launch-review" role="status">
          <h2 ref={finishHeadingRef} tabIndex={-1}>Chapter saved: {CHAPTERS[chapterIndex].badge}</h2>
          <p>{LETTER_LAUNCH_CHAPTER_BADGES[chapterIndex]?.description}</p>
          <button type="button" onClick={() => { setSessionPhase('menu'); refreshProgress(); }} className="letter-launch-primary">Choose another chapter</button>
        </div>}
        {!available && <div className="letter-launch-alert" role="alert"><p>{progressState?.error || 'Saved Letter Launch progress could not be checked.'}</p><button type="button" onClick={refreshProgress}>Retry progress check</button></div>}
        {available && claimError && <div className="letter-launch-alert" role="alert"><p>{claimError}</p><button type="button" disabled={claimRetryBusy} onClick={retryPendingClaims}>{claimRetryBusy ? 'Retrying…' : 'Retry saved reward'}</button></div>}
        {available && pendingClaims.length > 0 && !claimError && <div className="letter-launch-alert" role="status"><p>A saved chapter reward needs confirmation.</p><button type="button" disabled={claimRetryBusy} onClick={retryPendingClaims}>{claimRetryBusy ? 'Retrying…' : 'Confirm saved reward'}</button></div>}
        <div className="letter-launch-chapters" aria-label="Letter Launch chapters">
          {CHAPTERS.map((item, index) => {
            const complete = completedIds.has(item.id);
            const unlocked = available && index <= unlockedIndex;
            const badgeEarned = completedBadgeIds.includes(item.id);
            const legacyNoReward = available && index <= (progressState.legacy?.rewardCeiling ?? -1) && !complete;
            return <article key={item.id} className={`letter-launch-chapter ${unlocked ? '' : 'is-locked'}`}>
              <div className="letter-launch-chapter-number">{index + 1}</div>
              <div className="letter-launch-chapter-copy"><p>Chapter {index + 1}{complete ? ' · Complete' : ''}</p><h2>{item.title}</h2><p>{item.subtitle}</p></div>
              {badgeEarned && <span className="letter-launch-badge" aria-label={`${item.badge} badge earned`}>★ {item.badge}</span>}
              <button type="button" disabled={!unlocked || !available || pendingClaims.length > 0 || Boolean(claimError)} onClick={() => beginChapter(index)} className="letter-launch-primary">
                {complete ? 'Replay · no reward' : legacyNoReward ? 'Play · no reward' : unlocked ? 'Start chapter' : 'Finish earlier chapter'}
              </button>
            </article>;
          })}
        </div>
        <p className="letter-launch-menu-note">Your chapter progress and badge save when you finish. Each chapter rewards once; replays are for practice.</p>
      </section>
    </main>;
  }

  if (!round || round.kind === 'unavailable') return <div className="letter-launch letter-launch-unavailable" data-letter-chapter={chapter.id}>
    <h1>This chapter needs a taught letter sound.</h1><p>Ask a grown-up to select taught sounds in the Phonics learning profile, then retry this progress check.</p>
    <button type="button" onClick={exitToMenu} className="letter-launch-primary">Choose another chapter</button>
  </div>;

  const isFinal = roundCount >= targetCount;
  return <main className="letter-launch letter-launch-play" style={WORLD_BACKGROUND_STYLE} data-letter-chapter={chapter.id} data-letter-phase="play" data-run-seed={runSeed}>
    <header className="letter-launch-header">
      <button type="button" onClick={exitToMenu} aria-label="Choose a chapter" className="letter-launch-back"><ArrowLeft /></button>
      <div className="text-center"><h1>Letter Launch</h1><p>{chapter.title} · {Math.min(roundCount + (held ? 0 : 1), targetCount)} of {targetCount}</p></div>
      <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
    </header>
    <section className="letter-launch-task">
      <PracticeProgress skill={PHASE_LABELS[chapterIndex]} completed={Math.min(roundCount, targetCount)} target={targetCount} accent="sky" className="letter-launch-progress" />
      <div className="letter-launch-panel">
        <p className="letter-launch-kicker">{round.kind === 'build-word' ? 'Blend the sounds' : round.kind === 'case-match' ? 'Big and little letters' : chapterIndex === 0 ? 'Name and sound' : 'Find the first sound'}</p>
        <div className="letter-launch-clue" aria-label={round.kind === 'case-match' ? `Little letter ${round.target.letter.toLowerCase()}` : round.kind !== 'case-match' ? `Picture clue for ${round.target.word}` : 'Listen to the word'}>
          {round.kind === 'case-match' ? <span>{round.target.letter.toLowerCase()}</span> : round.target.emoji}
        </div>
        {['letter-sound', 'first-sound'].includes(round.kind) && <p className="letter-launch-caption">{round.target.word}</p>}
        {letterLaunchClueCaption(round) && <p className="letter-launch-caption">{letterLaunchClueCaption(round)}</p>}
        <p className="letter-launch-instruction">{round.kind === 'build-word'
          ? 'Choose one sound tile at a time to build the word.'
          : round.kind === 'case-match'
            ? 'This is the little letter. Choose its matching capital.'
            : chapterIndex === 0
              ? 'A letter has a name and can spell a sound. Listen to the word; find the starting letter.'
              : 'Say the word slowly. Choose the letter or letter team that spells its first sound.'}</p>

        <div className="letter-launch-audio-row">
          <button type="button" disabled={!canReplayPrompt || !soundOn} onClick={replayClue} aria-label={canReplayPrompt ? 'Hear the clue again' : 'Recorded clue unavailable'} className="letter-launch-audio"><Volume2 size={20} /> Hear the clue again</button>
          {canHearTargetWord && <button type="button" disabled={!soundOn} onClick={hearTargetWord} aria-label="Hear the whole word" className="letter-launch-audio"><Volume2 size={20} /> Hear the whole word</button>}
          {!canReplayPrompt && <span className="letter-launch-audio-note">Read the clue and choose the matching sound.</span>}
        </div>
        <div className={`letter-launch-stage ${held ? 'is-launching' : ''}`} aria-hidden="true">
          <div className="letter-launch-runway" /><img src={rocketArt} alt="" className="letter-launch-rocket" />
          <span className="letter-launch-flame">🔥</span><span className="letter-launch-sparks">✨ ✨</span>
        </div>
      </div>

      {round.kind === 'build-word' && <div className="letter-launch-slots" aria-label={`${selectedTiles.length} of ${round.target.graphemes.length} sounds placed`}>
        {round.target.graphemes.map((_, index) => <span key={`${round.key}-slot-${index}`} className="letter-launch-slot">{selectedTiles[index]?.toUpperCase() || '·'}</span>)}
        {canHearNextSound && <button type="button" disabled={held || selectedTiles.length >= round.target.graphemes.length || !soundOn} onClick={hearNextSound} className="letter-launch-audio"><Volume2 size={18} /> Hear next sound</button>}
      </div>}
      <div className={`letter-launch-options ${columns}`}>
        {options.map((option) => {
          const buildWord = round.kind === 'build-word';
          const key = buildWord ? option.grapheme : option.letter;
          const chosen = buildWord && selectedTiles.includes(option.grapheme);
          return <button key={buildWord ? option.id : key} type="button" onClick={() => handlePick(option)} disabled={held || chosen} className="letter-launch-choice">{buildWord ? option.grapheme.toUpperCase() : key}</button>;
        })}
      </div>
      {feedback && <div className="letter-launch-feedback" role="status" aria-live="polite">{feedback}</div>}
      {saveError && <div className="letter-launch-alert" role="alert"><p>{saveError}</p><button ref={retryButtonRef} type="button" disabled={saving} onClick={retrySave}>{saving ? 'Saving…' : 'Retry save'}</button></div>}
      {held && !saveError && !chapterSaved && <button ref={nextButtonRef} type="button" onClick={nextMission} className="letter-launch-primary">Next mission</button>}
      {chapterSaved && <section className="letter-launch-review" aria-labelledby="letter-launch-finish-title">
        <h2 ref={finishHeadingRef} id="letter-launch-finish-title" tabIndex={-1}>{CHAPTERS[chapterIndex].badge} saved!</h2>
        <button type="button" onClick={() => { setSessionPhase('review'); setRound(null); }} className="letter-launch-primary">Finish chapter</button>
      </section>}
      {isFinal && saving && <p role="status" className="letter-launch-save-status">Saving your chapter and badge…</p>}
    </section>
  </main>;
};

export default LetterLaunch;
