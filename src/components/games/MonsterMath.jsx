import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, Lightbulb, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { SoundToggle } from '../shared/index.jsx';
import { monsterMathNarration } from '../../data/batch2Narration.js';
import {
  createMonsterMathRun, createMonsterRunSeed, MONSTER_MATH_EPISODES,
  monsterCountResultText, monsterCountVisualLabels, monsterNumberLineStep, monsterNumberLineValues, numberLineInstruction, tenFrameAccessibleLabel, tenFrameCellModel, tenFrameModelTeaching,
} from '../../data/monsterMathEpisodes.js';
import {
  getMonsterMathProgress, recentMonsterQuestionIds, recordMonsterEpisodeCompletion, rememberMonsterMathRun,
  monsterMathRewardCallbackUnits,
} from '../../data/monsterMathProgress.js';

const STARS_FOR = (firstTryCount) => firstTryCount >= 5 ? 3 : firstTryCount >= 3 ? 2 : 1;
const tokenColors = ['bg-amber-500', 'bg-sky-500'];

const EpisodeTile = ({ episode, index, progress, selected, disabled, onSelect }) => {
  const complete = progress.completedEpisodeIds.includes(episode.id);
  return (
    <button type="button" onClick={onSelect} disabled={disabled} aria-pressed={selected} className={`min-h-24 rounded-3xl border-4 p-4 text-left shadow-md transition ${selected ? 'border-orange-300 bg-orange-800 text-white' : disabled ? 'border-white/40 bg-white/50 text-slate-500' : 'border-white bg-white/90 text-slate-900 hover:-translate-y-0.5'}`}>
      <span className="block text-xs font-black uppercase tracking-widest">Episode {index + 1} · {episode.band}</span>
      <strong className="mt-1 block text-lg">{complete ? '✓ ' : ''}{episode.title}</strong>
      <span className="mt-1 block text-sm font-bold">{episode.subtitle}</span>
    </button>
  );
};

const CounterModel = ({ question, locked, animationCount, showHint, clueShown, guidedSteps, onStep, onResetSteps }) => {
  const model = question.model;
  if (model.type === 'count') {
    const accessibleLabels = monsterCountVisualLabels(model);
    return (
      <div className="rounded-3xl border-4 border-amber-200 bg-white p-4 shadow-md">
        <p className="mb-3 text-center text-sm font-black uppercase tracking-widest text-amber-700">Count each picture once</p>
        <div role="group" aria-label={accessibleLabels.group} className="mx-auto grid max-w-[22rem] grid-cols-5 justify-items-center gap-2">
          {Array.from({ length: model.count }, (_, index) => <span key={index} role="img" aria-label={accessibleLabels.picture} className={`grid h-12 w-12 place-items-center rounded-2xl ${locked && animationCount > index ? 'bg-emerald-100' : 'bg-amber-50'} text-3xl shadow-sm`}>{model.emoji}</span>)}
        </div>
        {locked && <p className="mt-3 text-center text-lg font-black text-emerald-700" aria-live="polite">{monsterCountResultText(model.count)}</p>}
      </div>
    );
  }

  if (model.type === 'ten-frame') {
    const cells = tenFrameCellModel(question, { locked, animationCount });
    return (
      <div className="rounded-3xl border-4 border-orange-200 bg-white p-3 shadow-md sm:p-4">
        <p className="mb-2 text-center text-sm font-black uppercase tracking-widest text-orange-700">Two ten frames · count the counters</p>
        <div className="mx-auto grid max-w-[34rem] grid-cols-10 gap-1 rounded-2xl bg-orange-100 p-2" aria-label={tenFrameAccessibleLabel(model, locked)}>
          {cells.map((cell) => {
            const color = cell.group === 'more' ? tokenColors[1] : tokenColors[0];
            return <span key={cell.index} className={`grid aspect-square min-h-5 place-items-center rounded-full border-2 border-white ${cell.visible ? color : 'bg-white'} ${cell.removed ? 'scale-75 opacity-35' : ''} ${cell.counted && !cell.removed ? 'ring-2 ring-emerald-400' : ''}`} aria-hidden="true">{cell.removed ? <span className="text-xs font-black text-white">✓</span> : null}</span>;
          })}
        </div>
        <p className="mt-2 text-center text-lg font-black text-slate-800" aria-live="polite">{model.first} {model.operation === 'add' ? '+' : '−'} {model.second} = {locked ? model.answer : '?'}</p>
        {tenFrameModelTeaching(model, locked, clueShown) && <p className="text-center text-sm font-bold text-emerald-700">{tenFrameModelTeaching(model, locked, clueShown)}</p>}
      </div>
    );
  }

  const start = model.first;
  const end = locked ? model.answer : null;
  const guided = showHint && !locked ? monsterNumberLineStep(model, guidedSteps) : null;
  const values = monsterNumberLineValues(model);
  return (
    <div className="rounded-3xl border-4 border-indigo-200 bg-white p-3 shadow-md sm:p-4">
      <p className="mb-3 text-center text-sm font-black uppercase tracking-widest text-indigo-700">Number line · follow each jump</p>
      <div className="relative mx-auto max-w-3xl overflow-hidden px-1 pb-2 pt-4">
        <div className="absolute left-2 right-2 top-8 h-1.5 rounded-full bg-indigo-200" />
        <div className="relative grid" style={{ gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))` }}>
          {values.map((value) => {
            const atStart = value === start;
            const atEnd = locked && value === end;
            const atGuidedPoint = guided && value === guided.position;
            const inJump = locked && (model.operation === 'add' ? value > start && value <= end : value < start && value >= end);
            return <div key={value} className="relative flex min-w-0 flex-col items-center gap-1 text-[10px] font-black sm:text-xs">
              {atStart && !atGuidedPoint && <span className="z-10 grid h-5 w-5 place-items-center rounded-full bg-sky-600 text-white" aria-label="Starting point">●</span>}
              {atGuidedPoint && <span className="z-10 grid h-6 w-6 place-items-center rounded-full bg-amber-500 text-white" aria-label={`Current position ${guided.position}`}>●</span>}
              {atEnd && <span className="z-10 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white" aria-label="Answer point">✓</span>}
              {inJump && !atEnd && !atGuidedPoint && <span className="z-10 grid h-5 w-5 place-items-center rounded-full bg-indigo-400 text-white" aria-hidden="true">{model.emoji}</span>}
              {!atStart && !atEnd && !inJump && !atGuidedPoint && <span className="h-5" />}
              <span className={`${atEnd ? 'rounded bg-emerald-100 px-1 text-emerald-800' : atStart ? 'text-sky-800' : 'text-slate-500'}`}>{value}</span>
            </div>;
          })}
        </div>
      </div>
      <p className="mt-1 text-center text-lg font-black text-slate-800" aria-live="polite">{numberLineInstruction(model, locked)}</p>
      {guided && <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={onStep} disabled={guided.remaining === 0} className="min-h-12 rounded-xl bg-amber-500 px-4 font-black text-amber-950 disabled:cursor-not-allowed disabled:opacity-50">Jump one step {model.operation === 'add' ? 'forward' : 'back'}</button>
        <button type="button" onClick={onResetSteps} disabled={guided.completed === 0} className="min-h-12 rounded-xl bg-slate-200 px-4 font-black text-slate-900 disabled:cursor-not-allowed disabled:opacity-50">Start again</button>
        <p className="w-full text-center font-bold text-amber-950" aria-live="polite">At {guided.position}. {guided.remaining ? `${guided.remaining} ${guided.remaining === 1 ? 'jump' : 'jumps'} to go.` : 'All jumps done.'}</p>
      </div>}
    </div>
  );
};

const MonsterMath = ({ onBack, playSfx = () => {}, soundOn, onToggleSound, speak = () => {}, onCelebrate = () => {}, onGameEvent, onPhaseChange, playerId = 'amari' }) => {
  const [progress, setProgress] = useState(() => getMonsterMathProgress(playerId));
  const [episodeIndex, setEpisodeIndex] = useState(() => getMonsterMathProgress(playerId).unlockedEpisode);
  const [phase, setPhase] = useState('start');
  const [runSeed, setRunSeed] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [locked, setLocked] = useState(false);
  const [hadMistake, setHadMistake] = useState(false);
  const [hadHint, setHadHint] = useState(false);
  const [guidedSteps, setGuidedSteps] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [animationCount, setAnimationCount] = useState(0);
  const [animationDone, setAnimationDone] = useState(false);
  const [feedback, setFeedback] = useState('Choose an episode, then start your six-question run.');
  const [showHint, setShowHint] = useState(false);
  const [newEpisodeBadge, setNewEpisodeBadge] = useState(false);
  const [runStars, setRunStars] = useState(1);
  const questionAnnouncementRef = useRef('');
  const animationTimerRef = useRef(null);

  const episode = MONSTER_MATH_EPISODES[episodeIndex] || MONSTER_MATH_EPISODES[0];
  const question = rounds[roundIndex] || null;

  useEffect(() => { onPhaseChange?.(phase); }, [onPhaseChange, phase]);

  useLayoutEffect(() => {
    if (phase === 'play') window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [phase]);

  useEffect(() => () => clearInterval(animationTimerRef.current), []);

  useEffect(() => {
    if (phase !== 'play' || !question || !Number.isSafeInteger(runSeed)) return;
    const key = `${runSeed}:${roundIndex}`;
    if (questionAnnouncementRef.current === key) return;
    questionAnnouncementRef.current = key;
    onGameEvent?.('math', 'question', { level: episodeIndex, round: roundIndex, seed: runSeed, difficulty: episode.band });
    speak(question.prompt, { segments: monsterMathNarration.promptSegments(question) });
  }, [episode.band, episodeIndex, onGameEvent, phase, question, roundIndex, runSeed, speak]);

  const startEpisode = (selectedIndex = episodeIndex) => {
    const chosen = MONSTER_MATH_EPISODES[selectedIndex];
    const seed = createMonsterRunSeed();
    const recent = recentMonsterQuestionIds(playerId, selectedIndex);
    const queue = createMonsterMathRun({ episodeIndex: selectedIndex, seed, recentQuestionIds: recent });
    rememberMonsterMathRun(playerId, selectedIndex, queue.map((item) => item.id));
    questionAnnouncementRef.current = '';
    setProgress(getMonsterMathProgress(playerId));
    setEpisodeIndex(selectedIndex);
    setRunSeed(seed);
    setRounds(queue);
    setRoundIndex(0);
    setLocked(false);
    setHadMistake(false);
    setHadHint(false);
    setGuidedSteps(0);
    setFirstTryCount(0);
    setAnimationCount(0);
    setAnimationDone(false);
    setShowHint(false);
    setNewEpisodeBadge(false);
    setPhase('play');
    setFeedback('');
    playSfx('launch');
    if (getMonsterMathProgress(playerId).completedEpisodeIds.includes(chosen.id)) {
      onGameEvent?.('math', 'replay', { level: selectedIndex, round: 0, seed, difficulty: chosen.band });
    }
    onGameEvent?.('math', 'start', { level: selectedIndex, round: 0, seed, difficulty: chosen.band });
  };

  const animateAnswer = (target) => {
    clearInterval(animationTimerRef.current);
    setAnimationCount(0);
    setAnimationDone(false);
    let count = 0;
    const interval = window.setInterval(() => {
      count += 1;
      setAnimationCount(count);
      playSfx('tap');
      if (count >= target) {
        clearInterval(interval);
        animationTimerRef.current = null;
        setAnimationDone(true);
      }
    }, 130);
    animationTimerRef.current = interval;
  };

  const checkAnswer = (answer) => {
    if (!question || locked) return;
    if (answer !== question.answer) {
      setHadMistake(true);
      setShowHint(hadHint && question.model.type === 'number-line');
      setFeedback('Not yet. Try the clue, then count the model again.');
      onGameEvent?.('math', 'answer_attempt', { level: episodeIndex, round: roundIndex, seed: runSeed, firstAttempt: !hadMistake, difficulty: episode.band });
      playSfx('wrong');
      speak(monsterMathNarration.retry(question), { segments: monsterMathNarration.retrySegments(question) });
      return;
    }
    const independent = !hadMistake && !hadHint;
    setLocked(true);
    setGuidedSteps(0);
    setShowHint(false);
    setFeedback(question.explanation);
    setFirstTryCount((count) => count + (independent ? 1 : 0));
    setAnimationCount(0);
    setAnimationDone(false);
    onGameEvent?.('math', 'answer_correct', {
      level: episodeIndex, round: roundIndex, seed: runSeed, difficulty: episode.band,
      skill: episode.skill, item: question.id, response: answer, expected: question.answer,
      correct: true, firstAttempt: independent, independent, hints: hadHint ? 1 : 0,
    });
    playSfx('success');
    speak(question.explanation, { segments: monsterMathNarration.explanationSegments(question) });
    animateAnswer(question.answer);
  };

  const replayPrompt = () => {
    if (!question) return;
    onGameEvent?.('math', 'hint', { level: episodeIndex, round: roundIndex, seed: runSeed, difficulty: episode.band, hintType: 'replay_clue' });
    speak(question.prompt, { segments: monsterMathNarration.promptSegments(question) });
  };

  const requestHint = () => {
    if (!question || locked) return;
    setHadHint(true);
    setShowHint(true);
    setFeedback(question.clue);
    onGameEvent?.('math', 'hint', { level: episodeIndex, round: roundIndex, seed: runSeed, difficulty: episode.band, hintType: 'clue' });
    speak(question.clue, { segments: monsterMathNarration.clueSegments(question) });
  };

  const nextQuestion = () => {
    if (!locked || !animationDone) return;
    if (roundIndex < rounds.length - 1) {
      setRoundIndex((index) => index + 1);
      setLocked(false);
      setHadMistake(false);
      setHadHint(false);
      setGuidedSteps(0);
      setAnimationCount(0);
      setAnimationDone(false);
      setShowHint(false);
      setFeedback('');
      return;
    }
    const stars = STARS_FOR(firstTryCount);
    const completion = recordMonsterEpisodeCompletion(playerId, episodeIndex, stars, rounds.map((item) => item.id));
    if (!completion) return;
    setProgress(completion.progress);
    setRunStars(stars);
    setNewEpisodeBadge(completion.newlyCompleted);
    onGameEvent?.('math', 'level_complete', { level: episodeIndex, round: rounds.length - 1, seed: runSeed, difficulty: episode.band });
    if (completion.awardedStars > 0) onCelebrate(`${episode.title} complete!`, monsterMathRewardCallbackUnits(completion.awardedStars), 0, 'math');
    setFeedback(`${episode.title} complete. You got ${stars} ${stars === 1 ? 'star' : 'stars'} for this run.`);
    playSfx('complete');
    setPhase('done');
  };

  const leaveGame = () => {
    if (phase === 'play' && Number.isSafeInteger(runSeed)) onGameEvent?.('math', 'leave', { level: episodeIndex, round: roundIndex, seed: runSeed, difficulty: episode.band });
    onBack?.();
  };

  const replayRun = () => startEpisode(episodeIndex);

  if (phase === 'start') {
    return (
      <div className="min-h-[100dvh] overflow-y-auto bg-gradient-to-b from-orange-100 via-amber-100 to-orange-200 px-3 pb-8 pt-3 text-slate-900 sm:px-6">
        <header className="mx-auto flex max-w-5xl items-center justify-between rounded-3xl border-2 border-white/80 bg-white/90 p-3 shadow-xl">
          <button type="button" onClick={leaveGame} className="game-icon-button !bg-orange-700 !text-white" aria-label="Back to learning world"><ArrowLeft /></button>
          <div className="text-center"><p className="text-xs font-black uppercase tracking-widest text-orange-700">Three visual episodes · six questions each</p><h1 className="text-2xl font-black sm:text-4xl">Monster Math</h1></div>
          <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
        </header>
        <main className="mx-auto mt-5 max-w-5xl">
          <p className="mx-auto mb-4 max-w-2xl rounded-2xl bg-white/85 px-4 py-3 text-center text-base font-bold text-orange-950 sm:text-lg">Count the pictures, move counters, and solve a short story. Every answer stays on screen until you choose Next.</p>
          <div className="grid gap-3 md:grid-cols-3">
            {MONSTER_MATH_EPISODES.map((entry, index) => <EpisodeTile key={entry.id} episode={entry} index={index} progress={progress} selected={episodeIndex === index} disabled={index > progress.unlockedEpisode} onSelect={() => setEpisodeIndex(index)} />)}
          </div>
          <section className="mt-5 rounded-[2rem] border-4 border-white/80 bg-white/90 p-4 shadow-xl sm:p-6">
            <p className="text-xs font-black uppercase tracking-widest text-orange-700">{episode.band} episode</p>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">{episode.title}</h2>
            <p className="mt-2 font-bold text-slate-700">{episode.subtitle}</p>
            <div className="mt-4 flex flex-wrap gap-2" aria-label="Episode completion rewards">
              {MONSTER_MATH_EPISODES.map((entry, index) => <span key={entry.id} className={`rounded-full px-3 py-1 text-sm font-black ${progress.bestStars[entry.id] ? 'bg-amber-200 text-amber-950' : 'bg-slate-100 text-slate-500'}`}>{index + 1}. {entry.title} {progress.bestStars[entry.id] ? `${'★'.repeat(progress.bestStars[entry.id])}` : index > progress.unlockedEpisode ? 'locked' : 'not earned yet'}</span>)}
            </div>
            <button type="button" onClick={() => startEpisode(episodeIndex)} className="mt-5 min-h-16 w-full rounded-2xl bg-orange-700 px-6 py-3 text-lg font-black text-white shadow-[0_6px_0_#9a3412] hover:bg-orange-800 active:translate-y-1 active:shadow-none">{progress.completedEpisodeIds.includes(episode.id) ? 'Replay this episode' : 'Start six questions'}</button>
          </section>
        </main>
      </div>
    );
  }

  if (phase === 'done') {
    const nextEpisode = Math.min(MONSTER_MATH_EPISODES.length - 1, episodeIndex + 1);
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-gradient-to-b from-orange-950 via-amber-800 to-red-900 p-4 text-center text-white">
        <section className="w-full max-w-xl rounded-[2.5rem] border-4 border-white/70 bg-white/95 p-6 text-slate-900 shadow-2xl sm:p-9">
          <div className="text-6xl" aria-hidden="true">{newEpisodeBadge ? '🏅' : '👾'}</div>
          <p className="mt-2 text-xs font-black uppercase tracking-widest text-orange-700">Six questions complete</p>
          <h1 className="mt-1 text-3xl font-black">{episode.title}</h1>
          <p className="mt-3 text-lg font-bold text-slate-700">{firstTryCount} of 6 correct without a mistake or clue</p>
          <div className="mt-3 flex justify-center gap-2 text-4xl" aria-label={`${runStars} of 3 stars`}>{Array.from({ length: 3 }, (_, index) => <span key={index} aria-hidden="true" className={index < runStars ? 'text-amber-400' : 'text-slate-200'}>★</span>)}</div>
          <p className="mt-3 rounded-2xl bg-orange-50 p-3 font-bold text-orange-900">{newEpisodeBadge ? 'New episode badge saved for this child.' : 'Progress is saved. Replay to practise again.'}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => { setPhase('start'); setProgress(getMonsterMathProgress(playerId)); }} className="min-h-14 rounded-2xl bg-orange-700 px-5 font-black text-white">Episode map</button>
            <button type="button" onClick={replayRun} className="min-h-14 rounded-2xl bg-indigo-600 px-5 font-black text-white"><RotateCcw size={18} className="mr-1 inline" />Replay episode</button>
            {nextEpisode > episodeIndex && progress.unlockedEpisode >= nextEpisode && <button type="button" onClick={() => startEpisode(nextEpisode)} className="min-h-14 rounded-2xl bg-emerald-600 px-5 font-black text-white">Next episode</button>}
            <button type="button" onClick={leaveGame} className="min-h-14 rounded-2xl bg-amber-400 px-5 font-black text-amber-950">Back to world</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] overflow-y-auto bg-gradient-to-b from-orange-100 via-amber-50 to-red-100 px-2 pb-8 pt-2 text-slate-900 sm:px-5 sm:pt-4">
      <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 rounded-3xl border-2 border-white/80 bg-white/90 p-2.5 shadow-lg sm:flex-nowrap sm:gap-4 sm:p-3">
        <button type="button" onClick={leaveGame} className="game-icon-button shrink-0 !bg-orange-700 !text-white" aria-label="Back to learning world"><ArrowLeft /></button>
        <div className="order-1 w-full min-w-0 text-center sm:order-none sm:w-auto sm:flex-1"><p className="text-[10px] font-black uppercase leading-snug tracking-widest text-orange-700 sm:text-xs">Episode {episodeIndex + 1} · {episode.title}</p><h1 className="text-xl font-black sm:text-2xl">Monster Math</h1></div>
        <span className="shrink-0 rounded-full bg-orange-100 px-2 py-1 text-xs font-black sm:px-3 sm:text-sm">Question {roundIndex + 1}/6</span>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </header>

      <main className="mx-auto mt-3 flex max-w-5xl flex-col gap-3 sm:mt-5 sm:gap-4">
        <div className="flex items-center gap-3 rounded-2xl bg-white/85 px-3 py-2 shadow-sm"><div className="h-3 flex-1 overflow-hidden rounded-full bg-orange-100"><div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500 transition-all" style={{ width: `${((roundIndex + (locked ? 1 : 0)) / rounds.length) * 100}%` }} /></div><span className="text-xs font-black text-orange-900">{roundIndex + (locked ? 1 : 0)}/{rounds.length}</span></div>
        <section className="rounded-[2rem] border-4 border-white/80 bg-white/95 p-4 text-center shadow-xl sm:p-6">
          <p className="text-xs font-black uppercase tracking-widest text-orange-700">{episode.skill}</p>
          <h2 className="mx-auto mt-2 max-w-3xl text-xl font-black leading-snug text-slate-900 sm:text-3xl" aria-live="polite">{question?.prompt}</h2>
          <button type="button" onClick={replayPrompt} className="mt-3 min-h-12 rounded-full bg-indigo-100 px-5 py-2 font-black text-indigo-900"><Volume2 size={18} className="mr-1 inline" />Hear the question again</button>
        </section>

        <div className="grid gap-3 lg:grid-cols-[1.2fr_.8fr] lg:items-stretch">
          <CounterModel
            question={question}
            locked={locked}
            animationCount={animationCount}
            showHint={showHint && question?.model.type === 'number-line'}
            clueShown={hadHint}
            guidedSteps={guidedSteps}
            onStep={() => setGuidedSteps((steps) => monsterNumberLineStep(question.model, steps).completed + 1)}
            onResetSteps={() => setGuidedSteps(0)}
          />
          <section className="flex flex-col justify-center rounded-3xl border-4 border-white/80 bg-white/90 p-4 shadow-md sm:p-5">
            <p className="mb-3 text-center text-sm font-black uppercase tracking-widest text-orange-700">Choose the answer</p>
            <div className="grid grid-cols-2 gap-3">
              {question?.options.map((option) => <button key={option} type="button" disabled={locked} onClick={() => checkAnswer(option)} className="min-h-16 rounded-2xl border-4 border-white bg-sky-600 text-3xl font-black text-white shadow-[0_5px_0_#075985] transition hover:bg-sky-700 active:translate-y-1 active:shadow-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 disabled:opacity-55">{option}</button>)}
            </div>
            <button type="button" onClick={requestHint} disabled={locked || hadHint} className="mt-3 min-h-12 rounded-xl bg-amber-200 px-4 py-2 font-black text-amber-950 disabled:opacity-55"><Lightbulb size={18} className="mr-1 inline" />{hadHint ? 'Clue shown' : question?.model.type === 'number-line' ? 'Try the jumps' : 'Show me a clue'}</button>
          </section>
        </div>

        <section className="rounded-3xl border-2 border-white bg-white/90 p-4 text-center shadow-md" aria-live="polite">
          <p className={`min-h-8 text-base font-black sm:text-lg ${locked ? 'text-emerald-800' : 'text-orange-900'}`}>{feedback || (showHint ? question?.clue : 'Count the picture or follow the model, then choose.')}</p>
          {locked && <button type="button" disabled={!animationDone} onClick={nextQuestion} className="mt-3 min-h-14 rounded-2xl bg-emerald-600 px-7 py-3 text-lg font-black text-white shadow-[0_5px_0_#047857] active:translate-y-1 active:shadow-none disabled:cursor-wait disabled:bg-slate-400 disabled:shadow-none">{animationDone ? roundIndex + 1 < rounds.length ? 'Next question' : 'Finish episode' : 'Watch the counters…'}</button>}
        </section>
      </main>
    </div>
  );
};

export default MonsterMath;
