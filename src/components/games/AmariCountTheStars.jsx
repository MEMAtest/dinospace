import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Home, Volume2 } from 'lucide-react';
import { SoundToggle } from '../shared/index.jsx';
import {
  COUNT_CONSTELLATION_PAGES, COUNT_THE_STARS_EPISODES, COUNT_THE_STARS_NARRATION,
  createCountRunSeed, createCountTheStarsRun, recentCountQuestionIds,
} from '../../data/countTheStarsBatch3.js';
import {
  getCountTheStarsProgress, recordCountTheStarsCompletion, rememberCountTheStarsRun,
} from '../../data/countTheStarsProgress.js';

const praiseFor = (stars) => stars === 3 ? 'Brilliant counting!' : stars === 2 ? 'Great counting!' : 'You kept counting!';
const pluralOf = (noun) => noun.endsWith('y') ? `${noun.slice(0, -1)}ies` : `${noun}s`;

const speakLocally = (text, enabled) => {
  if (!enabled || typeof window === 'undefined' || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
  window.speechSynthesis.cancel();
  const utterance = new window.SpeechSynthesisUtterance(text);
  utterance.lang = 'en-GB';
  window.speechSynthesis.speak(utterance);
};

const AmariCountTheStars = ({ onBack, playSfx = () => {}, soundOn, onToggleSound, onCelebrate = () => {}, onGameEvent, onPhaseChange, playerId = 'amari' }) => {
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
  const [feedback, setFeedback] = useState('Choose an unlocked star survey to begin.');
  const [lastResult, setLastResult] = useState(null);

  const episode = COUNT_THE_STARS_EPISODES[episodeIndex] || COUNT_THE_STARS_EPISODES[0];
  const round = run?.rounds[roundIndex] || null;

  useEffect(() => { onPhaseChange?.(phase === 'map' || phase === 'collection' ? 'map' : phase === 'complete' ? 'complete' : 'play'); }, [onPhaseChange, phase]);

  const startEpisode = (index) => {
    if (index > progress.unlockedEpisode) return;
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
    setLastResult(null);
    setFeedback('Tap each object once, then choose how many you counted.');
    setPhase('count');
    if (progress.completedEpisodeIds.includes(selectedEpisode.id)) onGameEvent?.('counting', 'replay', { level: index, round: 0, seed, difficulty: selectedEpisode.band });
    onGameEvent?.('counting', 'start', { level: index, round: 0, seed, difficulty: selectedEpisode.band });
    onGameEvent?.('counting', 'question', { level: index, round: 1, seed, difficulty: selectedEpisode.band });
    speakLocally(COUNT_THE_STARS_NARRATION.instruction, soundOn);
    playSfx('launch');
  };

  const handleTapObject = (objectId) => {
    if (phase !== 'count' || !round || tappedIds.includes(objectId)) return;
    const nextTapped = [...tappedIds, objectId];
    setTappedIds(nextTapped);
    playSfx('tap');
    speakLocally(String(nextTapped.length), soundOn);
    if (nextTapped.length === round.count) {
      setPhase('answer');
      setFeedback(COUNT_THE_STARS_NARRATION.countQuestion);
      speakLocally(COUNT_THE_STARS_NARRATION.countQuestion, soundOn);
    }
  };

  const handleAnswer = (answer) => {
    if (!round || phase !== 'answer') return;
    if (answer !== round.count) {
      setRoundHadMistake(true);
      setMistakeCount((count) => count + 1);
      setFeedback(COUNT_THE_STARS_NARRATION.recountClue);
      onGameEvent?.('counting', 'answer_attempt', { level: episodeIndex, round: roundIndex + 1, seed: run.seed, correct: false, firstAttempt: !roundHadMistake, hints: Number(roundHadHint) });
      speakLocally(COUNT_THE_STARS_NARRATION.recountClue, soundOn);
      playSfx('wrong');
      return;
    }
    const firstAttempt = !roundHadMistake;
    onGameEvent?.('counting', 'answer_attempt', { level: episodeIndex, round: roundIndex + 1, seed: run.seed, correct: true, firstAttempt, hints: Number(roundHadHint) });
    onGameEvent?.('counting', 'answer_correct', { level: episodeIndex, round: roundIndex + 1, seed: run.seed, firstAttempt, hints: Number(roundHadHint), difficulty: episode.band });
    setFeedback(praiseFor(firstAttempt && !roundHadHint ? 3 : 2));
    setPhase('fact');
    speakLocally(`${praiseFor(firstAttempt && !roundHadHint ? 3 : 2)} ${round.explanation}`, soundOn);
    playSfx('success');
  };

  const advance = () => {
    if (phase !== 'fact' || !run) return;
    if (roundIndex < run.rounds.length - 1) {
      const nextIndex = roundIndex + 1;
      setRoundIndex(nextIndex);
      setTappedIds([]);
      setRoundHadMistake(false);
      setRoundHadHint(false);
      setFeedback(`Round ${nextIndex + 1} of ${run.rounds.length}. Tap each object once.`);
      setPhase('count');
      onGameEvent?.('counting', 'question', { level: episodeIndex, round: nextIndex + 1, seed: run.seed, difficulty: episode.band });
      speakLocally(COUNT_THE_STARS_NARRATION.instruction, soundOn);
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
    speakLocally(COUNT_THE_STARS_NARRATION.episodeComplete, soundOn);
  };

  const leaveGame = () => {
    if (run) onGameEvent?.('counting', 'leave', { level: episodeIndex, round: roundIndex + 1, seed: run.seed, difficulty: episode.band });
    onBack?.();
  };

  const openCollection = () => setPhase('collection');

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
              <div className="text-4xl" aria-hidden="true">{entry.pageMark}</div>
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
              <div className="text-5xl" aria-hidden="true">{earned ? page.mark : '🔒'}</div><p className="mt-2 font-black">{page.name}</p><p className="text-sm font-bold">{earned ? 'Earned' : 'Locked'}</p>
            </div>;
          })}
        </div>
        <button type="button" onClick={() => setPhase('map')} className="mx-auto mt-5 block min-h-14 rounded-2xl bg-white px-6 font-black text-indigo-950">Back to surveys</button>
      </main>}

      {(phase === 'count' || phase === 'answer' || phase === 'fact') && round && <main className="mx-auto mt-4 max-w-4xl">
        <section className={`rounded-[2rem] border-2 border-white/30 bg-gradient-to-br ${round.scene.backdrop} p-4 shadow-2xl sm:p-6`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><p className="text-xs font-black uppercase tracking-widest text-white/70">{episode.name} · {episode.band}</p><h2 className="text-2xl font-black sm:text-3xl">{round.scene.title}</h2></div>
            <div aria-hidden="true" className="text-4xl">{round.scene.decoration}</div>
          </div>
          <p className="mt-2 rounded-xl bg-black/20 px-3 py-2 text-sm font-bold text-white/90">{episode.strategy}</p>
          <div className="mt-4 grid grid-cols-[repeat(5,minmax(0,1fr))] gap-1 rounded-3xl border border-white/25 bg-black/15 p-2 sm:gap-2 sm:p-4" aria-label={`Counting board for ${round.scene.title}`}>
            {round.objects.map((object, index) => {
              const countedIndex = tappedIds.indexOf(object.id);
              return <button key={object.id} type="button" aria-pressed={countedIndex >= 0} disabled={phase !== 'count'} onClick={() => handleTapObject(object.id)} aria-label={`${round.scene.noun} ${index + 1}${countedIndex >= 0 ? `, counted number ${countedIndex + 1}` : ', not counted yet'}`} className={`relative grid aspect-square min-h-[56px] min-w-[56px] place-items-center rounded-2xl border-2 p-0 text-3xl shadow-lg transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-200 sm:text-4xl ${countedIndex >= 0 ? 'border-yellow-100 bg-yellow-200/30 opacity-75' : 'border-white/20 bg-white/10 hover:scale-105'} disabled:cursor-default`}>
                <span aria-hidden="true">{round.scene.emoji}</span>
                {countedIndex >= 0 && <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full border border-slate-900 bg-yellow-300 text-xs font-black text-slate-950">{countedIndex + 1}</span>}
              </button>;
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-black/20 px-3 py-2">
            <p className="font-black" aria-live="polite">{phase === 'count' ? `Counted ${tappedIds.length} of ${round.count}` : phase === 'answer' ? COUNT_THE_STARS_NARRATION.countQuestion : 'Count complete'}</p>
            <button type="button" onClick={() => speakLocally(COUNT_THE_STARS_NARRATION.instruction, soundOn)} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white/15 px-4 font-black"><Volume2 size={18} /> Hear instructions</button>
          </div>
          {phase === 'answer' && <div className="mt-4 rounded-2xl border border-white/20 bg-black/20 p-3 text-center">
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
        <div className="text-6xl" aria-hidden="true">{lastResult?.newlyEarnedPage ? episode.pageMark : '🌟'}</div>
        <h2 className="mt-2 text-3xl font-black">{episode.name} complete!</h2>
        <p className="mt-3 text-lg font-bold">{COUNT_THE_STARS_NARRATION.episodeComplete}</p>
        {lastResult?.newlyEarnedPage && <p className="mt-3 rounded-2xl bg-amber-200 p-4 font-black text-indigo-950">Constellation page earned: {episode.name} Constellation</p>}
        <p className="mt-2 font-bold text-amber-100">Best: {lastResult?.progress.bestStars[episode.id] || progress.bestStars[episode.id] || 0} stars</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3"><button type="button" onClick={() => setPhase('map')} className="min-h-14 rounded-2xl bg-white px-6 font-black text-indigo-950">Survey map</button><button type="button" onClick={openCollection} className="min-h-14 rounded-2xl bg-amber-300 px-6 font-black text-indigo-950">Constellation book</button></div>
      </main>}
    </div>
  );
};

export default AmariCountTheStars;
