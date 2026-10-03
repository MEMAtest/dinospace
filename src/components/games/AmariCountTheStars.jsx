import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Home, Lightbulb, Volume2 } from 'lucide-react';
import { SoundToggle } from '../shared/index.jsx';
import { countAnswerNarration, countCorrectNarration } from '../../data/batch3Narration.js';
import {
  COUNT_CONSTELLATION_PAGES, COUNT_THE_STARS_EPISODES, COUNT_THE_STARS_NARRATION,
  createCountRunSeed, createCountTheStarsRun,
} from '../../data/countTheStarsBatch3.js';
import {
  getCountTheStarsProgress, recordCountTheStarsCompletion, rememberCountTheStarsRun, recentCountQuestionIds,
} from '../../data/countTheStarsProgress.js';

const praiseFor = (stars) => stars === 3 ? 'Brilliant counting!' : stars === 2 ? 'Great counting!' : 'You kept counting!';
const pluralOf = (noun) => noun.endsWith('y') ? `${noun.slice(0, -1)}ies` : `${noun}s`;

const CountMotif = ({ kind, accent }) => {
  const common = { fill: accent, stroke: '#fff7d6', strokeWidth: 1.8, strokeLinejoin: 'round', strokeLinecap: 'round' };
  let art;
  switch (kind) {
    case 'firefly': art = <><ellipse cx="24" cy="25" rx="7" ry="10" {...common}/><ellipse cx="15" cy="19" rx="7" ry="4" fill="#e0f2fe" stroke="#fff" strokeWidth="1.5"/><ellipse cx="33" cy="19" rx="7" ry="4" fill="#e0f2fe" stroke="#fff" strokeWidth="1.5"/><circle cx="24" cy="30" r="5" fill="#fff7b1"/><path d="M18 37l-4 4m16-4 4 4" stroke="#fff7d6" strokeWidth="2"/></>; break;
    case 'berry': art = <><path d="M24 11c-3-6 2-8 7-8-1 5-3 8-7 8Z" fill="#86efac" stroke="#fff7d6" strokeWidth="1.5"/><circle cx="16" cy="25" r="9" {...common}/><circle cx="31" cy="25" r="9" {...common}/><circle cx="24" cy="34" r="8" {...common}/><circle cx="13" cy="23" r="1" fill="#fff"/><circle cx="30" cy="22" r="1" fill="#fff"/></>; break;
    case 'comet-seed': art = <><path d="M6 27 18 20 16 31 7 38m4-22 12 5" fill="none" stroke="#fde68a" strokeWidth="3" strokeLinecap="round"/><path d="m30 7 4 11 11 4-11 4-4 12-4-12-11-4 11-4Z" {...common}/></>; break;
    case 'planet': art = <><ellipse cx="24" cy="25" rx="21" ry="8" fill="none" stroke="#fef3c7" strokeWidth="3" transform="rotate(-23 24 25)"/><circle cx="24" cy="24" r="12" {...common}/><path d="M18 18q6-4 12 0" fill="none" stroke="#fff" strokeWidth="1.5"/></>; break;
    case 'rocket-light': art = <><path d="M24 5c8 6 11 15 9 26l-9 8-9-8C13 20 16 11 24 5Z" {...common}/><circle cx="24" cy="20" r="4" fill="#dbeafe" stroke="#fff" strokeWidth="1.5"/><path d="m15 27-7 8 9-2m17-6 7 8-9-2m-8 6-3 7 4-2 4 2-3-7" fill="#fb7185" stroke="#fff7d6" strokeWidth="1.5"/></>; break;
    case 'star-cluster': art = <><path d="m24 5 5 12 13 1-10 8 3 13-11-7-11 7 3-13-10-8 13-1Z" {...common}/><circle cx="8" cy="10" r="2" fill="#fff"/><circle cx="40" cy="12" r="2" fill="#fff"/><circle cx="40" cy="37" r="2" fill="#fff"/></>; break;
    case 'satellite-bolt': art = <><path d="m24 5 13 7v14l-13 7-13-7V12Z" {...common}/><path d="M19 33h10v11H19z" {...common}/><path d="M20 36h8m-8 4h8M21 17h6m-3-3v6" fill="none" stroke="#1e3a8a" strokeWidth="2"/></>; break;
    case 'moon-rock': art = <><path d="m5 31 5-17 11-8 15 6 7 18-10 11H15Z" {...common}/><circle cx="17" cy="20" r="3" fill="#94a3b8"/><circle cx="31" cy="29" r="4" fill="#94a3b8"/><circle cx="27" cy="14" r="2" fill="#94a3b8"/></>; break;
    case 'observatory-window': art = <><path d="M9 6h30v36H9z" rx="4" {...common}/><path d="M24 7v34M10 24h28" stroke="#fff" strokeWidth="2"/><path d="M15 13h5m10 0h4M15 31h5m10 0h4" stroke="#fff7d6" strokeWidth="2"/></>; break;
    case 'meteor': art = <><path d="M5 30 25 23M8 38l18-6M10 21l10-3" fill="none" stroke="#fef3c7" strokeWidth="2.5" strokeLinecap="round"/><path d="m34 5 4 12 9 5-10 4-5 11-4-11-10-4 10-5Z" {...common}/><circle cx="37" cy="20" r="2" fill="#fff"/></>; break;
    case 'ring-stone': art = <><ellipse cx="24" cy="26" rx="21" ry="8" fill="none" stroke="#fef3c7" strokeWidth="3" transform="rotate(28 24 26)"/><path d="m24 10 9 10-9 19-9-19Z" {...common}/><path d="m15 20 9 3 9-3m-9 3v16" fill="none" stroke="#fff" strokeWidth="1.5"/></>; break;
    case 'solar-panel': art = <><rect x="4" y="14" width="14" height="19" rx="2" {...common}/><rect x="30" y="14" width="14" height="19" rx="2" {...common}/><path d="M11 15v17M4 23h14m19-8v17m-7-9h14M18 24h12m-6-7v14" stroke="#1e3a8a" strokeWidth="1.5"/><circle cx="24" cy="24" r="5" fill="#fef08a" stroke="#fff" strokeWidth="1.5"/></>; break;
    case 'nebula': art = <><circle cx="16" cy="25" r="10" {...common}/><circle cx="26" cy="18" r="11" {...common}/><circle cx="34" cy="27" r="9" {...common}/><circle cx="22" cy="29" r="10" fill={accent} stroke="#fff7d6" strokeWidth="1.8"/><circle cx="12" cy="12" r="2" fill="#fff"/><circle cx="39" cy="10" r="2" fill="#fff"/></>; break;
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
  const [progress, setProgress] = useState(() => getCountTheStarsProgress(playerId));
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
  const answerPanelRef = useRef(null);

  const episode = COUNT_THE_STARS_EPISODES[episodeIndex] || COUNT_THE_STARS_EPISODES[0];
  const round = run?.rounds[roundIndex] || null;
  const layoutDescription = !round ? '' : episodeIndex === 2 && round.count > 10 && round.layoutVariant === 'grouped'
    ? 'two visible groups'
    : round.layoutVariant === 'orbit' && round.count <= 5 ? 'scattered one by one' : 'organized rows or an array';

  useEffect(() => { onPhaseChange?.(phase === 'map' || phase === 'collection' ? 'map' : phase === 'complete' ? 'complete' : 'play'); }, [onPhaseChange, phase]);
  useEffect(() => {
    if (phase !== 'answer' || !window.matchMedia('(max-width: 640px)').matches) return;
    const frame = window.requestAnimationFrame(() => answerPanelRef.current?.scrollIntoView({
      block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    }));
    return () => window.cancelAnimationFrame(frame);
  }, [phase]);
  useEffect(() => () => cancelNarration(), [cancelNarration]);

  const startEpisode = (index) => {
    if (index > progress.unlockedEpisode) return;
    cancelNarration();
    const selectedEpisode = COUNT_THE_STARS_EPISODES[index];
    const seed = createCountRunSeed();
    const nextRun = createCountTheStarsRun(index, seed, recentCountQuestionIds(playerId, index));
    if (!nextRun) return;
    rememberCountTheStarsRun(playerId, index, nextRun.rounds.map(({ id }) => id));
    setProgress(getCountTheStarsProgress(playerId));
    setEpisodeIndex(index);
    setRun(nextRun);
    setRoundIndex(0);
    setTappedIds([]);
    setRoundHadMistake(false);
    setRoundHadHint(false);
    setMistakeCount(0);
    setHintCount(0);
    setHintText('');
    setLastResult(null);
    setFeedback('Tap each object once, then choose how many you counted.');
    setPhase('count');
    if (progress.completedEpisodeIds.includes(selectedEpisode.id)) onGameEvent?.('counting', 'replay', { level: index, round: 0, seed, difficulty: selectedEpisode.band });
    onGameEvent?.('counting', 'start', { level: index, round: 0, seed, difficulty: selectedEpisode.band });
    onGameEvent?.('counting', 'question', { level: index, round: 1, seed, difficulty: selectedEpisode.band });
    speak(COUNT_THE_STARS_NARRATION.instruction, { premium: false, segments: [COUNT_THE_STARS_NARRATION.instruction] });
    playSfx('launch');
  };

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
    setPhase('fact');
    const narration = countCorrectNarration(praiseFor(firstAttempt && !roundHadHint ? 3 : 2), round.explanation);
    speak(narration.text, { premium: false, segments: narration.segments });
    playSfx('success');
  };

  const showCountingClue = () => {
    if (!round || roundHadHint || !['count', 'answer'].includes(phase)) return;
    const clue = episodeIndex === 2 && round.count > 5
      ? COUNT_THE_STARS_NARRATION.hints[0]
      : round.layoutVariant === 'orbit' && round.count <= 5
        ? COUNT_THE_STARS_NARRATION.hints[1]
        : COUNT_THE_STARS_NARRATION.hints[2];
    setRoundHadHint(true);
    setHintCount((count) => count + 1);
    setHintText(clue);
    onGameEvent?.('counting', 'hint', { level: episodeIndex, round: roundIndex + 1, seed: run.seed, hints: 1, hintType: 'counting_strategy', difficulty: episode.band });
    speak(clue, { premium: false, segments: [clue] });
  };

  const advance = () => {
    if (phase !== 'fact' || !run) return;
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
    const stars = mistakeCount === 0 && hintCount === 0 ? 3 : mistakeCount <= 2 ? 2 : 1;
    const completion = recordCountTheStarsCompletion(playerId, episodeIndex, stars, run.rounds.map(({ id }) => id));
    setLastResult(completion);
    if (completion) {
      setProgress(completion.progress);
      onGameEvent?.('counting', 'level_complete', { level: episodeIndex, round: run.rounds.length, seed: run.seed, firstAttempt: mistakeCount === 0, hints: hintCount, difficulty: episode.band });
      if (completion.awardedStars > 0) onCelebrate(`${episode.name} constellation complete!`, completion.awardedStars * 4, 0);
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

      {phase === 'map' && <main className="mx-auto mt-5 max-w-5xl rounded-[2rem] border border-white/20 bg-white/10 p-4 shadow-2xl sm:p-7">
        <p className="mx-auto max-w-2xl text-center text-sm font-bold text-indigo-100 sm:text-base">Count one object at a time. Collected totals light up a constellation page.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {COUNT_THE_STARS_EPISODES.map((entry, index) => {
            const unlocked = index <= progress.unlockedEpisode;
            const complete = progress.completedEpisodeIds.includes(entry.id);
            return <article key={entry.id} className={`rounded-3xl border-2 p-4 ${unlocked ? 'border-white/45 bg-indigo-900/70' : 'border-white/10 bg-black/20 opacity-65'}`}>
              <ConstellationArt page={{ id: entry.pageId, name: `${entry.name} Constellation` }} />
              <h2 className="mt-2 text-xl font-black">{entry.name}</h2>
              <p className="mt-1 text-sm font-semibold text-indigo-100">Count from {entry.min} to {entry.max}. Six rounds · {entry.band} band.</p>
              <p className="mt-2 text-sm font-bold text-amber-100">{entry.skill}</p>
              <button type="button" disabled={!unlocked} onClick={() => startEpisode(index)} className="mt-4 min-h-14 w-full rounded-2xl bg-amber-300 px-4 py-3 font-black text-indigo-950 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-white">{!unlocked ? 'Locked' : complete ? 'Replay survey' : 'Start survey'}</button>
              {complete && <p className="mt-2 text-sm font-bold text-emerald-200">Best: {progress.bestStars[entry.id] || 0} stars</p>}
            </article>;
          })}
        </div>
        <button type="button" onClick={openCollection} className="mx-auto mt-5 flex min-h-14 items-center gap-2 rounded-2xl bg-white/15 px-5 font-black"><BookOpen /> Constellation book ({progress.earnedConstellationPageIds.length}/3)</button>
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
        <section className={`rounded-[2rem] border-2 border-white/30 bg-gradient-to-br ${round.scene.backdrop} p-4 shadow-2xl sm:p-6`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><p className="text-xs font-black uppercase tracking-widest text-white/70">{episode.name} · {episode.band}</p><h2 className="text-2xl font-black sm:text-3xl">{round.scene.title}</h2></div>
            <div aria-hidden="true" className="text-4xl">{round.scene.decoration}</div>
          </div>
          <p className="mt-2 rounded-xl bg-black/20 px-3 py-2 text-sm font-bold text-white/90">{episode.strategy}</p>
          <div className="relative mx-auto mt-4 aspect-square w-full max-w-[440px] rounded-3xl border border-white/25 bg-black/15" data-layout-variant={round.layoutVariant} role="group" aria-label={`Counting board for ${round.scene.title}; ${layoutDescription}`}>
            {round.objects.map((object, index) => {
              const countedIndex = tappedIds.indexOf(object.id);
              return <button key={object.id} type="button" aria-pressed={countedIndex >= 0} disabled={phase !== 'count'} onClick={() => handleTapObject(object.id)} aria-label={`${round.scene.noun} ${index + 1}${countedIndex >= 0 ? `, counted number ${countedIndex + 1}` : ', not counted yet'}`} style={{ left: `${object.x}%`, top: `${object.y}%` }} className={`absolute grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border-2 p-0 shadow-lg transition focus-visible:z-10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-200 ${countedIndex >= 0 ? 'border-yellow-100 bg-yellow-200/30 opacity-75' : 'border-white/20 bg-white/10 hover:scale-105'} disabled:cursor-default`}>
                <CountMotif kind={round.scene.motif} accent={round.scene.accent} />
                {countedIndex >= 0 && <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full border border-slate-900 bg-yellow-300 text-xs font-black text-slate-950">{countedIndex + 1}</span>}
              </button>;
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-black/20 px-3 py-2">
            <p className="font-black" aria-live="polite">{phase === 'count' ? (tappedIds.length ? `Counted ${tappedIds.length} object${tappedIds.length === 1 ? '' : 's'}.` : 'Tap each object once to count it.') : phase === 'answer' ? COUNT_THE_STARS_NARRATION.countQuestion : 'Count complete'}</p>
            <div className="flex flex-wrap gap-2"><button type="button" onClick={() => speak(COUNT_THE_STARS_NARRATION.instruction, { premium: false, segments: [COUNT_THE_STARS_NARRATION.instruction] })} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white/15 px-3 font-black"><Volume2 size={18} /> Hear instructions</button><button type="button" disabled={roundHadHint || phase === 'fact'} onClick={showCountingClue} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-amber-300 px-3 font-black text-indigo-950 disabled:opacity-50"><Lightbulb size={18} /> Show a clue</button></div>
          </div>
          {hintText && <p className="mt-2 rounded-xl border border-amber-100/50 bg-amber-200/15 px-3 py-2 text-sm font-bold" role="status" aria-live="polite">{hintText}</p>}
          {phase === 'answer' && <div ref={answerPanelRef} className="mt-4 rounded-2xl border border-white/20 bg-black/20 p-3 text-center">
            <p className="mb-3 text-lg font-black">How many {round.count === 1 ? round.scene.noun : pluralOf(round.scene.noun)} did you count?</p>
            <div className="flex flex-wrap justify-center gap-3">{round.options.map((option) => <button key={option} type="button" onClick={() => handleAnswer(option)} className="min-h-16 min-w-16 rounded-2xl bg-amber-300 px-4 text-2xl font-black text-slate-950 shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-white">{option}</button>)}</div>
            {feedback && <p className="mt-3 font-bold text-amber-100" role="status" aria-live="polite">{feedback}</p>}
          </div>}
          {phase === 'fact' && <div className="mt-4 rounded-2xl border-2 border-emerald-200/70 bg-emerald-950/50 p-4 text-center" role="status" aria-live="polite">
            <p className="text-xl font-black text-emerald-100">{feedback}</p>
            <p className="mt-2 text-lg font-bold">{round.explanation}</p>
            <button type="button" onClick={advance} className="mt-4 min-h-14 rounded-2xl bg-amber-300 px-8 py-3 text-lg font-black text-slate-950">Next</button>
          </div>}
        </section>
      </main>}

      {phase === 'complete' && <main className="mx-auto mt-5 max-w-2xl rounded-[2rem] border-2 border-amber-200/60 bg-indigo-900/90 p-6 text-center shadow-2xl sm:p-10">
        <ConstellationArt page={COUNT_CONSTELLATION_PAGES.find(({ episodeId }) => episodeId === episode.id)} locked={!lastResult?.newlyEarnedPage} />
        <h2 className="mt-2 text-3xl font-black">{episode.name} complete!</h2>
        <p className="mt-3 text-lg font-bold">{COUNT_THE_STARS_NARRATION.episodeComplete}</p>
        {lastResult?.newlyEarnedPage && <p className="mt-3 rounded-2xl bg-amber-200 p-4 font-black text-indigo-950">Constellation page earned: {episode.name} Constellation</p>}
        <p className="mt-2 font-bold text-amber-100">Best: {lastResult?.progress.bestStars[episode.id] || progress.bestStars[episode.id] || 0} stars</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3"><button type="button" onClick={() => { cancelNarration(); setPhase('map'); }} className="min-h-14 rounded-2xl bg-white px-6 font-black text-indigo-950">Survey map</button><button type="button" onClick={openCollection} className="min-h-14 rounded-2xl bg-amber-300 px-6 font-black text-indigo-950">Constellation book</button></div>
      </main>}
    </div>
  );
};

export default AmariCountTheStars;
