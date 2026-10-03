import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Lightbulb, Volume2 } from 'lucide-react';
import { BATCH5_NARRATION, BATCH5_SOUND_SAFARI_CHAPTERS } from '../../data/batch5Literacy.js';
import { createSoundSafariPool, createSoundSafariRun } from '../../data/batch5LiteracyPools.js';
import { getBatch5LiteracyProgress, recordBatch5LiteracyCompletion, rememberBatch5LiteracyRun } from '../../data/batch5LiteracyProgress.js';
import { getTaughtGraphemes } from '../../data/literacy.js';
import { SoundToggle } from '../shared/index.jsx';
import { useAmariPhonemeAudio } from './useAmariPhonemeAudio.js';

const noop = () => {};
const randomSeed = () => globalThis.crypto?.getRandomValues ? globalThis.crypto.getRandomValues(new Uint32Array(1))[0] || 1 : Math.floor(Math.random() * 0xffffffff) || 1;
const soundLabel = (phoneme) => ({ 'th-voiced': 'th as in this', 'th-unvoiced': 'th as in thin', 'oo-long': 'oo as in moon', 'oo-short': 'oo as in book' }[phoneme] || phoneme);
const promptFor = (question) => question.type === 'match' ? BATCH5_NARRATION.prompts[0]
  : question.type === 'blend' ? BATCH5_NARRATION.prompts[1]
    : `Listen to the word. Which sound do you hear at the ${question.position}?`;
const praiseFor = (question) => question.type === 'match' ? BATCH5_NARRATION.praise[0]
  : question.type === 'blend' ? BATCH5_NARRATION.praise[3] : BATCH5_NARRATION.praise[2];

export default function AmariSoundSafari({ onBack = noop, playSfx = noop, soundOn = true, onToggleSound = noop, speak = noop, cancelNarration = noop, onCelebrate = noop, onGameEvent = noop, playerId = 'amari' }) {
  const [progress, setProgress] = useState(() => getBatch5LiteracyProgress('soundSafari', playerId));
  const [chapterIndex, setChapterIndex] = useState(() => getBatch5LiteracyProgress('soundSafari', playerId).unlockedChapter);
  const [stage, setStage] = useState('start');
  const [seed, setSeed] = useState(0);
  const [poolIds, setPoolIds] = useState([]);
  const [run, setRun] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [hintVisible, setHintVisible] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [attempted, setAttempted] = useState(false);
  const [results, setResults] = useState([]);
  const [poolMessage, setPoolMessage] = useState('');
  const cancelRef = useRef(cancelNarration);
  useEffect(() => { cancelRef.current = cancelNarration; }, [cancelNarration]);
  const { play: playPhonemes, cancelAll: stopNarration, missingClip } = useAmariPhonemeAudio({ soundOn, cancelNarration: () => cancelRef.current?.() });
  const question = run[cursor];
  const chapter = BATCH5_SOUND_SAFARI_CHAPTERS[chapterIndex];
  const visibleTaught = useMemo(() => [...getTaughtGraphemes()], []);
  const potentialPool = useMemo(() => createSoundSafariPool(chapterIndex, visibleTaught), [chapterIndex, visibleTaught]);

  const tell = useCallback((text, segments = [text]) => speak?.(text, { premium: false, segments }), [speak]);
  const clearAnswer = () => { setLocked(false); setFeedback(''); setHintVisible(false); setHintCount(0); setAttempted(false); };
  const start = (index = chapterIndex, replay = false) => {
    stopNarration();
    const taught = [...getTaughtGraphemes()];
    const chapterPool = createSoundSafariPool(index, taught);
    if (chapterPool.length < 20) {
      setPoolMessage('This chapter needs at least 20 decodable sound questions. Ask your grown-up to choose more taught sounds in Phonics settings, then return.');
      return;
    }
    const nextSeed = randomSeed();
    const recent = getBatch5LiteracyProgress('soundSafari', playerId).recentQuestionIds[index] || [];
    const nextRun = createSoundSafariRun(index, taught, nextSeed, recent);
    if (nextRun.length !== 6) {
      setPoolMessage('There are not enough decodable questions for this chapter yet. Ask your grown-up to check the taught sounds.');
      return;
    }
    const allIds = chapterPool.map(({ id }) => id);
    rememberBatch5LiteracyRun('soundSafari', index, nextRun.map(({ id }) => id), allIds, playerId);
    setProgress(getBatch5LiteracyProgress('soundSafari', playerId));
    setPoolIds(allIds);
    setChapterIndex(index);
    setSeed(nextSeed);
    setRun(nextRun);
    setCursor(0);
    setResults([]);
    setPoolMessage('');
    clearAnswer();
    setStage('play');
    onGameEvent?.('soundSafari', replay ? 'replay' : 'start', { level: index, seed: nextSeed });
    playSfx('click');
  };

  useEffect(() => {
    if (stage === 'play' && question) onGameEvent?.('soundSafari', 'question', { level: chapterIndex, round: cursor, seed });
  }, [stage, question, chapterIndex, cursor, seed, onGameEvent]);

  const answer = (option) => {
    if (!question || locked) return;
    const correct = question.type === 'match' ? option.firstSound === question.answerId
      : question.type === 'blend' ? option.id === question.answerId : option === question.answerId;
    setAttempted(true);
    if (!correct) {
      setFeedback(BATCH5_NARRATION.retry[0]);
      tell(BATCH5_NARRATION.retry[0]);
      setResults((previous) => previous.map((item, index) => index === cursor ? { ...item, firstTry: false } : item));
      onGameEvent?.('soundSafari', 'answer_wrong', { level: chapterIndex, round: cursor, seed });
      playSfx('wrong');
      return;
    }
    setLocked(true);
    setFeedback(praiseFor(question));
    setResults((previous) => {
      const next = [...previous];
      next[cursor] = { id: question.id, firstTry: !attempted && hintCount === 0, hintCount };
      return next;
    });
    const fact = question.type === 'match' ? `The word is ${question.target.word}.`
      : question.type === 'blend' ? `The word is ${question.target.word}.` : 'You found the sound.';
    tell(`${praiseFor(question)} ${fact}`, [praiseFor(question), fact]);
    onGameEvent?.('soundSafari', 'answer_correct', { level: chapterIndex, round: cursor, seed, correct: true, firstTry: !attempted && hintCount === 0 });
    playSfx('success');
  };

  const hint = () => {
    if (!question || locked) return;
    setHintVisible(true);
    setHintCount((value) => value + 1);
    setResults((previous) => {
      const next = [...previous];
      next[cursor] = { ...(next[cursor] || { id: question.id, firstTry: !attempted }), id: question.id, hintCount: (next[cursor]?.hintCount || 0) + 1 };
      return next;
    });
    if (question.type === 'match') playPhonemes(question.target.phonemes[0]);
    else if (question.type === 'blend') playPhonemes(question.target.phonemes);
    else tell(question.target.word, [question.target.word]);
    onGameEvent?.('soundSafari', 'hint', { level: chapterIndex, round: cursor, seed });
  };

  const next = () => {
    if (!locked) return;
    stopNarration();
    if (cursor < 5) {
      setCursor((value) => value + 1);
      clearAnswer();
      return;
    }
    const clean = results.filter((item) => item?.firstTry && item.hintCount === 0).length;
    const stars = clean >= 5 ? 3 : clean >= 3 ? 2 : 1;
    const completion = recordBatch5LiteracyCompletion('soundSafari', chapterIndex, stars, run.map(({ id }) => id), poolIds, playerId);
    if (completion) {
      setProgress(getBatch5LiteracyProgress('soundSafari', playerId));
      if (completion.awardedStars > 0) onCelebrate('Sound Safari chapter badge!', completion.awardedStars * 4, 150, 'literacy');
    }
    setFeedback(`${BATCH5_NARRATION.praise[1]} You earned ${stars} ${stars === 1 ? 'star' : 'stars'}.`);
    setStage('finish');
    onGameEvent?.('soundSafari', 'level_complete', { level: chapterIndex, seed, stars });
  };

  if (playerId !== 'amari') return null;
  if (stage === 'start' || stage === 'finish') return <div className="amari-scene flex flex-col" aria-label="Amari Sound Safari">
    <header className="amari-scene-header relative z-20"><button type="button" onClick={onBack} className="game-icon-button" aria-label="Back to learning world"><ArrowLeft /></button><div className="amari-scene-title"><h1 className="text-lg font-black sm:text-2xl">Sound Safari</h1><p className="text-xs text-sky-100">{progress.completedChapterIds.length} of 3 chapters earned</p></div><SoundToggle soundOn={soundOn} onToggle={onToggleSound} /></header>
    <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-4 py-6 text-center">
      <p className="max-w-2xl rounded-2xl bg-white/90 p-4 font-bold">Hear taught speech sounds, blend them into words, and find sounds in spoken words. A sound is a speech sound, not a letter name.</p>
      <div className="mt-4 grid w-full gap-3 sm:grid-cols-3">{BATCH5_SOUND_SAFARI_CHAPTERS.map((item, index) => <button key={item.id} type="button" disabled={index > progress.unlockedChapter} onClick={() => { setChapterIndex(index); setPoolMessage(''); }} aria-pressed={chapterIndex === index} className={`min-h-20 rounded-2xl border-2 p-3 text-left font-black disabled:opacity-40 ${chapterIndex === index ? 'border-emerald-700 bg-emerald-100' : 'border-white bg-white/90'}`}><span className="block text-xs uppercase">Chapter {index + 1} {progress.completedChapterIds.includes(index) ? '· Badge earned' : index > progress.unlockedChapter ? '· Locked' : ''}</span>{item.title}<span className="mt-1 block text-xs font-semibold">{item.skill}</span>{progress.bestStars[index] ? <span className="block text-xs">Best: {'★'.repeat(progress.bestStars[index])}</span> : null}</button>)}</div>
      <p className="mt-4 rounded-xl bg-white/90 p-3">This chapter has {potentialPool.length} taught-sound questions available. It needs at least 20.</p>
      {poolMessage && <p role="status" className="mt-3 rounded-xl bg-amber-100 p-3 font-bold">{poolMessage}</p>}
      {stage === 'finish' ? <><p className="mt-5 text-2xl font-black">Chapter complete!</p><p className="mt-2 font-semibold">Your fact stays here. Replay with a new question order or continue when you are ready.</p><button type="button" onClick={() => start(chapterIndex, true)} className="mt-4 min-h-12 rounded-xl bg-emerald-700 px-6 font-black text-white">Replay chapter</button>{progress.unlockedChapter > chapterIndex && <button type="button" onClick={() => { setStage('start'); setChapterIndex(progress.unlockedChapter); }} className="mt-3 min-h-12 rounded-xl bg-white px-6 font-black">Next chapter</button>}</> : <button type="button" onClick={() => start(chapterIndex)} className="mt-5 min-h-14 w-full max-w-lg rounded-2xl bg-emerald-800 text-lg font-black text-white">Start {chapter?.title}</button>}
    </main></div>;

  const prompt = promptFor(question);
  const hintText = question.type === 'match' ? BATCH5_NARRATION.hints[2] : question.type === 'blend' ? BATCH5_NARRATION.hints[0] : `Say ${question.target.word} slowly, then listen for the ${question.position} sound.`;
  return <div className="amari-scene flex flex-col" aria-label="Amari Sound Safari">
    <header className="amari-scene-header relative z-20"><button type="button" onClick={onBack} className="game-icon-button" aria-label="Back to learning world"><ArrowLeft /></button><div className="amari-scene-title"><p className="text-xs font-black uppercase">Chapter {chapterIndex + 1} · Question {cursor + 1} of 6</p><h1 className="text-lg font-black sm:text-2xl">{chapter.title}</h1></div><SoundToggle soundOn={soundOn} onToggle={onToggleSound} /></header>
    <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-4 py-6 text-center">
      <section className="amari-scene-card w-full p-5"><p className="text-xl font-black">{prompt}</p><button type="button" onClick={() => tell(prompt)} className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-xl bg-blue-700 px-4 font-black text-white"><Volume2 size={19} /> Hear instructions</button>
        {question.type === 'match' && <button type="button" disabled={!soundOn} onClick={() => playPhonemes(question.target.phonemes[0])} className="ml-2 mt-3 inline-flex min-h-12 items-center gap-2 rounded-xl bg-amber-300 px-4 font-black text-slate-900 disabled:opacity-50"><Volume2 size={19} /> Hear the pure sound</button>}
        {question.type === 'blend' && <><div className="my-5 flex justify-center gap-3">{question.phonemes.map((_, index) => <span key={index} className="grid h-14 w-14 place-items-center rounded-2xl border-4 border-emerald-500 bg-white text-2xl font-black" aria-label={`Sound ${index + 1}`}>●</span>)}</div><button type="button" disabled={!soundOn} onClick={() => playPhonemes(question.phonemes)} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-amber-300 px-4 font-black"><Volume2 size={19} /> Hear each sound</button></>}
        {question.type === 'segment' && <><p className="mt-4 text-6xl" aria-hidden="true">{question.target.emoji}</p><p className="mt-2 font-bold">{question.target.clue}</p><button type="button" onClick={() => tell(question.target.word, [question.target.word])} className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-xl bg-amber-300 px-4 font-black"><Volume2 size={19} /> Hear the word</button></>}
      </section>
      {question.type !== 'segment' ? <div className="mt-4 grid w-full grid-cols-2 gap-3 sm:grid-cols-4" role="group" aria-label="Choose a picture">{question.options.map((option) => <button key={option.id} type="button" disabled={locked} onClick={() => answer(option)} aria-label={`Picture option ${option.word}`} className="amari-choice flex min-h-28 flex-col items-center justify-center p-3 disabled:opacity-60"><span className="text-5xl" aria-hidden="true">{option.emoji}</span></button>)}</div> : <div className="mt-4 grid w-full grid-cols-2 gap-3 sm:grid-cols-4" role="group" aria-label="Choose the speech sound">{question.options.map((option) => <button key={option} type="button" disabled={locked} onClick={() => answer(option)} aria-label={`Sound ${soundLabel(option)}`} className="min-h-14 rounded-2xl bg-white text-xl font-black shadow disabled:opacity-60">/{soundLabel(option)}/</button>)}</div>}
      {feedback && <p role="status" className={`mt-4 w-full rounded-xl p-4 text-lg font-black ${locked ? 'bg-emerald-100' : 'bg-amber-100'}`}>{feedback}{locked && <span className="mt-2 block text-base font-semibold">{question.type === 'match' ? `The word ${question.target.word} starts with /${soundLabel(question.answerId)}/.` : question.type === 'blend' ? `You blended the sounds to say ${question.target.word}.` : `The ${question.position} sound is /${soundLabel(question.answerId)}/.`}</span>}</p>}
      {missingClip && <p role="status" className="mt-2 rounded-lg bg-amber-100 p-2 text-sm font-bold">The recording for /{soundLabel(missingClip)}/ is not packaged yet.</p>}
      {hintVisible && <p className="mt-2 rounded-xl bg-white/90 p-3 font-semibold">{hintText}</p>}
      {!locked && <button type="button" onClick={hint} className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-amber-500 bg-white px-5 font-black"><Lightbulb size={19} /> Use a hint</button>}
      {locked && <button type="button" onClick={next} className="mt-5 min-h-14 w-full rounded-2xl bg-emerald-800 text-lg font-black text-white">{cursor === 5 ? 'Finish chapter' : 'Next question'}</button>}
    </main></div>;
}
