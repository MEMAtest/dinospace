import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Lightbulb, RotateCcw, Volume2 } from 'lucide-react';
import { BATCH5_NARRATION, BATCH5_SPELLING_BANDS } from '../../data/batch5Literacy.js';
import { createSpellingRun, getEligibleSpellingWords } from '../../data/batch5LiteracyPools.js';
import { getBatch5LiteracyProgress, recordBatch5LiteracyCompletion, rememberBatch5LiteracyRun } from '../../data/batch5LiteracyProgress.js';
import { DECODABLE_CAPTIONS, getAvailableTrickyWords, getTaughtGraphemes, makeLearningEvent, WRITING_SAMPLES_KEY } from '../../data/literacy.js';
import { loadSaved, saveSafe } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';
import { useAmariPhonemeAudio } from './useAmariPhonemeAudio.js';
import { batch5AttemptMetrics } from './batch5AttemptMetrics.js';

const LEGACY_WORD_PROGRESS_KEY = 'amari_spelling_progress_v1';
const noop = () => {};
const randomSeed = () => globalThis.crypto?.getRandomValues ? globalThis.crypto.getRandomValues(new Uint32Array(1))[0] || 1 : Math.floor(Math.random() * 0xffffffff) || 1;
const positionLabel = (item) => item.length === 1 ? 'sound' : 'sounds';
const phonemeLabel = (item) => ({ 'th-voiced': 'th as in this', 'th-unvoiced': 'th as in thin', 'oo-long': 'oo as in moon', 'oo-short': 'oo as in book' }[item] || item);
const promptFor = (index) => index === 0 ? BATCH5_NARRATION.prompts[5] : index === 1 ? BATCH5_NARRATION.instruction[4] : BATCH5_NARRATION.instruction[3];

export default function AmariSpellingStudio({ onBack = noop, playSfx = noop, soundOn = true, onToggleSound = noop, speak = noop, cancelNarration = noop, onCelebrate = noop, onGameEvent = noop, onPhaseChange = noop, playerId = 'amari' }) {
  const [progress, setProgress] = useState(() => getBatch5LiteracyProgress('spelling', playerId));
  const [chapterIndex, setChapterIndex] = useState(() => getBatch5LiteracyProgress('spelling', playerId).unlockedChapter);
  const [stage, setStage] = useState('start');
  const [seed, setSeed] = useState(0);
  const [poolIds, setPoolIds] = useState([]);
  const [run, setRun] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [availableTiles, setAvailableTiles] = useState([]);
  const [typed, setTyped] = useState([]);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [hintVisible, setHintVisible] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [attempted, setAttempted] = useState(false);
  const [results, setResults] = useState([]);
  const [poolMessage, setPoolMessage] = useState('');
  const [extraMode, setExtraMode] = useState('');
  const [extraIndex, setExtraIndex] = useState(0);
  const [captionText, setCaptionText] = useState('');
  const [captionSaved, setCaptionSaved] = useState(false);
  const [legacyProgress, setLegacyProgress] = useState(() => playerId === 'amari' ? loadSaved(LEGACY_WORD_PROGRESS_KEY, {}) : {});
  const [writingSamples, setWritingSamples] = useState(() => playerId === 'amari' ? loadSaved(WRITING_SAMPLES_KEY, []) : []);
  const cancelRef = useRef(cancelNarration);
  useEffect(() => { cancelRef.current = cancelNarration; }, [cancelNarration]);
  const { play: playPhonemes, cancelAll: stopNarration, missingClip } = useAmariPhonemeAudio({ soundOn, cancelNarration: () => cancelRef.current?.() });
  const question = run[cursor];
  const band = BATCH5_SPELLING_BANDS[chapterIndex];
  useEffect(() => { onPhaseChange(stage === 'play' ? 'play' : stage === 'finish' ? 'done' : 'start'); }, [stage, onPhaseChange]);
  const visibleTaught = useMemo(() => [...getTaughtGraphemes()], []);
  const potentialPool = useMemo(() => getEligibleSpellingWords(chapterIndex, visibleTaught), [chapterIndex, visibleTaught]);
  const trickyWords = useMemo(() => playerId === 'amari' ? getAvailableTrickyWords() : [], [playerId]);
  const captions = useMemo(() => DECODABLE_CAPTIONS.filter((caption) => caption.needs.every((sound) => visibleTaught.includes(sound))), [visibleTaught]);
  const currentCaption = captions.length ? captions[extraIndex % captions.length] : null;
  const currentTricky = trickyWords.length ? trickyWords[extraIndex % trickyWords.length] : null;

  const tell = useCallback((text, segments = [text]) => speak?.(text, { premium: false, segments }), [speak]);
  const clearAnswer = (item) => { setAvailableTiles(item.tiles); setTyped([]); setLocked(false); setFeedback(''); setHintVisible(false); setHintCount(0); setAttempted(false); };
  const start = (index = chapterIndex, replay = false) => {
    stopNarration();
    const taught = [...getTaughtGraphemes()];
    const chapterPool = getEligibleSpellingWords(index, taught);
    if (chapterPool.length < 20) {
      setPoolMessage('This chapter needs at least 20 words you can make with the sounds you have learned. Ask your grown-up to choose more sounds in Phonics settings, then come back.');
      return;
    }
    const nextSeed = randomSeed();
    const recent = getBatch5LiteracyProgress('spelling', playerId).recentQuestionIds[index] || [];
    const nextRun = createSpellingRun(index, taught, nextSeed, recent);
    if (nextRun.length !== 6) {
      setPoolMessage('There are not enough words using your learned sounds to make six questions yet. Ask your grown-up to check the Phonics settings.');
      return;
    }
    const allIds = chapterPool.map(({ id }) => `spell:${id}`);
    rememberBatch5LiteracyRun('spelling', index, nextRun.map(({ id }) => id), allIds, playerId);
    setProgress(getBatch5LiteracyProgress('spelling', playerId));
    setPoolIds(allIds);
    setChapterIndex(index);
    setSeed(nextSeed);
    setRun(nextRun);
    setCursor(0);
    setResults([]);
    setPoolMessage('');
    clearAnswer(nextRun[0]);
    setExtraMode('');
    setStage('play');
    onGameEvent?.('words', replay ? 'replay' : 'start', { level: index, seed: nextSeed });
    playSfx('click');
  };

  useEffect(() => {
    if (stage === 'play' && question) onGameEvent?.('words', 'question', { level: chapterIndex, round: cursor, seed });
  }, [stage, question, chapterIndex, cursor, seed, onGameEvent]);

  const speakPrompt = () => {
    const text = promptFor(chapterIndex);
    tell(text);
  };
  const correctAnswer = () => {
    if (locked) return;
    const { firstAttempt: firstTry, independent } = batch5AttemptMetrics(attempted, hintCount);
    setLocked(true);
    setFeedback(BATCH5_NARRATION.praise[1]);
    setResults((previous) => { const next = [...previous]; next[cursor] = { id: question.id, firstTry, hintCount }; return next; });
    const wordFact = `The word is ${question.target.word}.`;
    tell(`${BATCH5_NARRATION.praise[1]} ${wordFact}`, [BATCH5_NARRATION.praise[1], wordFact]);
    onGameEvent?.('words', 'answer_correct', { level: chapterIndex, round: cursor, seed, skill: chapterIndex === 0 ? 'supported-spelling' : chapterIndex === 1 ? 'phoneme-gap' : 'independent-spelling', item: question.target.word, response: question.target.word, expected: question.target.word, difficulty: BATCH5_SPELLING_BANDS[chapterIndex].id, correct: true, firstTry, firstAttempt: firstTry, independent, hints: hintCount });
    playSfx('success');
  };
  const rejectAnswer = () => {
    setAttempted(true);
    setFeedback(BATCH5_NARRATION.retry[1]);
    tell(BATCH5_NARRATION.retry[1]);
    onGameEvent?.('words', 'answer_wrong', { level: chapterIndex, round: cursor, seed, skill: chapterIndex === 0 ? 'supported-spelling' : chapterIndex === 1 ? 'phoneme-gap' : 'independent-spelling', item: question.target.word, response: 'incorrect-build', expected: question.target.word, correct: false, ...batch5AttemptMetrics(attempted, hintCount), hints: hintCount });
    playSfx('wrong');
  };
  const chooseTile = (tile) => {
    if (locked) return;
    const nextIndex = typed.length;
    if (tile.grapheme !== question.target.graphemes[nextIndex]) { rejectAnswer(); return; }
    const next = [...typed, tile];
    setTyped(next);
    setAvailableTiles((items) => items.filter((item) => item.id !== tile.id));
    setFeedback('');
    playSfx('tap');
    if (next.length === question.target.graphemes.length) correctAnswer();
  };
  const chooseMissingSound = (grapheme) => {
    if (locked) return;
    if (grapheme !== question.target.graphemes[question.missingIndex]) { rejectAnswer(); return; }
    setTyped([{ grapheme: question.target.graphemes[question.missingIndex] }]);
    correctAnswer();
  };
  const hint = () => {
    if (locked) return;
    setHintVisible(true);
    setHintCount((count) => count + 1);
    onGameEvent?.('words', 'hint', { level: chapterIndex, round: cursor, seed, hints: hintCount + 1, hintType: 'clue' });
    playPhonemes(question.target.phonemes);
  };
  const next = () => {
    if (!locked) return;
    stopNarration();
    if (cursor < 5) {
      const nextQuestion = run[cursor + 1];
      setCursor((value) => value + 1);
      clearAnswer(nextQuestion);
      return;
    }
    const cleanCount = results.filter((item) => item?.firstTry && item.hintCount === 0).length;
    const stars = cleanCount >= 5 ? 3 : cleanCount >= 3 ? 2 : 1;
    const completion = recordBatch5LiteracyCompletion('spelling', chapterIndex, stars, run.map(({ id }) => id), poolIds, playerId);
    if (completion) {
      setProgress(getBatch5LiteracyProgress('spelling', playerId));
      if (completion.awardedStars > 0) onCelebrate('Spelling Studio chapter badge!', completion.awardedStars * 4, 150, 'literacy');
    }
    setFeedback(`${BATCH5_NARRATION.praise[1]} You earned ${stars} ${stars === 1 ? 'star' : 'stars'}.`);
    setStage('finish');
    onGameEvent?.('words', 'level_complete', { level: chapterIndex, seed, stars });
  };

  const startExtras = (mode) => { stopNarration(); setExtraMode(mode); setExtraIndex(0); setCaptionText(''); setCaptionSaved(false); setStage('extras'); };
  const advanceExtra = () => { stopNarration(); setExtraIndex((value) => value + 1); setCaptionText(''); setCaptionSaved(false); };
  const recordTrickyPractice = () => {
    if (!currentTricky) return;
    const today = new Date().toISOString().slice(0, 10);
    const old = legacyProgress[currentTricky.word] || { attempts: 0, independentFirstTry: 0, independentDays: [], needsPractice: 0 };
    const nextProgress = { ...legacyProgress, [currentTricky.word]: { ...old, attempts: old.attempts + 1, independentFirstTry: old.independentFirstTry + 1, independentDays: old.independentDays.includes(today) ? old.independentDays : [...old.independentDays, today], lastMode: 'tricky', lastSeen: today } };
    setLegacyProgress(nextProgress);
    saveSafe(LEGACY_WORD_PROGRESS_KEY, nextProgress);
    onGameEvent?.('words', 'learning_attempt', makeLearningEvent({ skill: 'tricky-word-practice', item: 'tricky-word-practice', response: 'practised', correct: true, firstTry: true, difficulty: currentTricky.phase === 3 ? 'challenge' : 'starter' }));
    setFeedback('Practice saved. Keep using the word in a sentence.');
    playSfx('success');
  };
  const saveCaption = () => {
    if (!currentCaption || !captionText.trim()) { setFeedback('Write something first. It does not need to be perfect.'); return; }
    const sample = { prompt: currentCaption.text, response: captionText.trim(), savedAt: new Date().toISOString(), reviewed: false };
    const nextSamples = [...writingSamples.slice(-19), sample];
    setWritingSamples(nextSamples);
    saveSafe(WRITING_SAMPLES_KEY, nextSamples);
    setCaptionSaved(true);
    setFeedback('Saved for your grown-up to see. The app does not pretend to grade handwriting.');
    playSfx('success');
    onGameEvent?.('words', 'learning_attempt', makeLearningEvent({ skill: 'caption-writing', item: currentCaption.id || 'caption-practice', response: 'saved-for-review', correct: null, firstTry: true, extra: { savedForReview: true } }));
  };

  if (playerId !== 'amari') return null;
  if (stage === 'start' || stage === 'finish') return <div className="amari-scene flex flex-col" aria-label="Amari Spelling Studio">
    <header className="amari-scene-header relative z-20"><button type="button" onClick={onBack} className="game-icon-button" aria-label="Back to learning world"><ArrowLeft /></button><div className="amari-scene-title"><h1 className="text-lg font-black sm:text-2xl">Spelling Studio</h1><p className="text-xs text-sky-100">Spelling practice · {progress.completedChapterIds.length} of 3 badges earned</p></div><SoundToggle soundOn={soundOn} onToggle={onToggleSound} /></header>
    <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-4 py-6 text-center">
      <p className="max-w-2xl rounded-2xl bg-white/90 p-4 font-bold">Use the sounds you have learned to build each word. Each chapter has six words. Your finished word stays here until you tap Next.</p>
      <div className="mt-4 grid w-full gap-3 sm:grid-cols-3">{BATCH5_SPELLING_BANDS.map((item, index) => <button key={item.id} type="button" disabled={index > progress.unlockedChapter} onClick={() => { setChapterIndex(index); setPoolMessage(''); }} aria-pressed={chapterIndex === index} className={`min-h-20 rounded-2xl border-2 p-3 text-left font-black disabled:opacity-40 ${chapterIndex === index ? 'border-cyan-700 bg-cyan-100' : 'border-white bg-white/90'}`}><span className="block text-xs uppercase">Chapter {index + 1} {progress.completedChapterIds.includes(index) ? '· Badge earned' : index > progress.unlockedChapter ? '· Locked' : ''}</span>{item.title}<span className="mt-1 block text-xs font-semibold">{item.skill}</span>{progress.bestStars[index] ? <span className="block text-xs">Best: {'★'.repeat(progress.bestStars[index])}</span> : null}</button>)}</div>
      <p className="mt-4 rounded-xl bg-white/90 p-3">This chapter has {potentialPool.length} words you can make with your learned sounds. It needs at least 20.</p>
      {poolMessage && <p role="status" className="mt-3 rounded-xl bg-amber-100 p-3 font-bold">{poolMessage}</p>}
      {stage === 'finish' ? <><p className="mt-5 text-2xl font-black">Chapter complete!</p><p className="mt-2 font-semibold">Replay with a new order or continue to the next chapter.</p><button type="button" onClick={() => start(chapterIndex, true)} className="mt-4 min-h-12 rounded-xl bg-cyan-700 px-6 font-black text-white">Replay chapter</button>{progress.unlockedChapter > chapterIndex && <button type="button" onClick={() => { setStage('start'); setChapterIndex(progress.unlockedChapter); }} className="mt-3 min-h-12 rounded-xl bg-white px-6 font-black">Next chapter</button>}</> : <button type="button" onClick={() => start(chapterIndex)} className="mt-5 min-h-14 w-full max-w-lg rounded-2xl bg-cyan-800 text-lg font-black text-white">Start {band?.title}</button>}
      <div className="mt-6 grid w-full gap-3 sm:grid-cols-2"><button type="button" onClick={() => startExtras('tricky')} className="min-h-12 rounded-xl bg-white font-black shadow">Extra practice: tricky words</button><button type="button" onClick={() => startExtras('caption')} className="min-h-12 rounded-xl bg-white font-black shadow">Extra practice: captions</button></div>
    </main></div>;

  if (stage === 'extras') return <div className="amari-scene flex flex-col" aria-label="Extra spelling practice"><header className="amari-scene-header relative z-20"><button type="button" onClick={() => { stopNarration(); setStage('start'); setExtraMode(''); }} className="game-icon-button" aria-label="Back to spelling chapters"><ArrowLeft /></button><div className="amari-scene-title"><h1 className="text-lg font-black">{extraMode === 'tricky' ? 'Tricky word practice' : 'Caption practice'}</h1><p className="text-xs text-sky-100">Extras do not change chapter stars</p></div><SoundToggle soundOn={soundOn} onToggle={onToggleSound} /></header><main className="relative z-10 mx-auto w-full max-w-2xl flex-1 px-4 py-6 text-center">
    {extraMode === 'tricky' ? currentTricky ? <section className="amari-scene-card p-5"><p className="text-xs font-black uppercase">Remember this word by heart</p><p className="mt-3 text-5xl font-black tracking-widest">{currentTricky.word}</p><p className="mt-2 font-semibold">This word is tricky. Look, say it, and use it in a sentence.</p><button type="button" onClick={() => tell(currentTricky.word, [currentTricky.word])} className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-xl bg-cyan-100 px-4 font-black"><Volume2 size={18} /> Hear the word</button><button type="button" onClick={recordTrickyPractice} className="mt-4 min-h-12 w-full rounded-xl bg-cyan-700 font-black text-white">I practised this word</button>{feedback && <p role="status" className="mt-3 font-bold">{feedback}</p>}<button type="button" onClick={advanceExtra} className="mt-3 min-h-12 w-full rounded-xl bg-white font-black">Next tricky word</button></section> : <p className="rounded-xl bg-white p-4 font-bold">No tricky words are available for the current taught phase.</p> : currentCaption ? <section className="amari-scene-card p-5"><p className="text-xs font-black uppercase">Read it, say it, write it</p><p className="mt-3 rounded-2xl bg-cyan-50 p-4 text-2xl font-black">{currentCaption.text}</p><button type="button" onClick={() => tell(`Read and copy: ${currentCaption.text}`, [`Read and copy:`, currentCaption.text])} className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-xl bg-cyan-100 px-4 font-black"><Volume2 size={18} /> Hear the caption</button><textarea value={captionText} onChange={(event) => { setCaptionText(event.target.value); setCaptionSaved(false); }} rows={3} aria-label="Writing sample" placeholder="Write or copy the caption here" className="mt-4 w-full rounded-xl border-2 border-cyan-300 bg-white p-3 text-lg font-bold" /><p className="mt-2 text-sm font-semibold">This is saved for a grown-up to review. The app does not grade handwriting.</p><button type="button" onClick={saveCaption} disabled={captionSaved} className="mt-3 min-h-12 rounded-xl bg-emerald-700 px-5 font-black text-white disabled:opacity-50">{captionSaved ? 'Saved' : 'Save my writing'}</button>{feedback && <p role="status" className="mt-3 font-bold">{feedback}</p>}<button type="button" onClick={advanceExtra} className="mt-3 min-h-12 w-full rounded-xl bg-white font-black">Next caption</button></section> : <p className="rounded-xl bg-white p-4 font-bold">No caption uses only the sounds currently marked as taught. Ask your grown-up to check Phonics settings.</p>}
  </main></div>;

  const prompt = promptFor(chapterIndex);
  return <div className="amari-scene flex flex-col" aria-label="Amari Spelling Studio"><header className="amari-scene-header relative z-20"><button type="button" onClick={onBack} className="game-icon-button" aria-label="Back to learning world"><ArrowLeft /></button><div className="amari-scene-title"><p className="text-xs font-black uppercase">Chapter {chapterIndex + 1} · Word {cursor + 1} of 6</p><h1 className="text-lg font-black sm:text-2xl">{band.title}</h1></div><SoundToggle soundOn={soundOn} onToggle={onToggleSound} /></header>
    <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-4 py-5 text-center"><section className="amari-scene-card w-full p-5"><p className="text-xl font-black">{prompt}</p><button type="button" onClick={speakPrompt} className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-xl bg-blue-700 px-4 font-black text-white"><Volume2 size={19} /> Hear instructions</button><button type="button" onClick={() => tell(question.target.clue, [question.target.clue])} className="ml-2 mt-3 inline-flex min-h-12 items-center gap-2 rounded-xl bg-cyan-100 px-4 font-black"><Volume2 size={19} /> Hear picture clue</button><div className="mt-4 grid h-24 w-24 place-items-center rounded-3xl bg-cyan-50 text-6xl shadow-inner" aria-hidden="true">{question.target.emoji}</div><p className="mt-3 font-bold">{question.target.clue}</p>
      {chapterIndex === 0 && <><p className="mt-3 text-3xl font-black tracking-[0.25em]">{question.target.word}</p><p className="mt-2 text-sm font-bold">Look, say the sounds, then build the word.</p></>}
      {chapterIndex === 1 && <><div className="mt-5 flex justify-center gap-2">{question.target.graphemes.map((grapheme, index) => <span key={index} className="grid h-12 w-12 place-items-center rounded-xl border-2 border-cyan-500 bg-white text-xl font-black">{index === question.missingIndex && !locked ? '•' : grapheme}</span>)}</div><p className="mt-3 font-bold">Choose the letters for the missing sound.</p></>}
      {chapterIndex === 2 && <><div className="mt-5 flex justify-center gap-2">{question.target.graphemes.map((_, index) => <span key={index} className="grid h-12 w-12 place-items-center rounded-xl border-2 border-dashed border-cyan-500 bg-white text-xl font-black">{typed[index]?.grapheme || '•'}</span>)}</div><p className="mt-3 font-bold">Build the whole word one sound at a time.</p></>}
    </section>
    {chapterIndex === 1 ? <div className="mt-4 grid w-full grid-cols-2 gap-3 sm:grid-cols-4" role="group" aria-label="Choose the letters for the missing sound">{question.missingOptions.map((item) => <button key={item} type="button" disabled={locked} onClick={() => chooseMissingSound(item)} className="min-h-14 rounded-2xl bg-cyan-700 text-2xl font-black text-white disabled:opacity-60">{item}</button>)}</div> : <div className="mt-4 flex w-full flex-wrap justify-center gap-3" role="group" aria-label="Tiles for building the word">{availableTiles.map((item) => <button key={item.id} type="button" disabled={locked} onClick={() => chooseTile(item)} className="min-h-14 min-w-14 rounded-xl bg-cyan-700 px-4 text-2xl font-black text-white shadow disabled:opacity-50">{item.grapheme}</button>)}</div>}
    {feedback && <div role="status" className={`mt-4 w-full rounded-xl p-4 text-lg font-black ${locked ? 'bg-emerald-100' : 'bg-amber-100'}`}>{feedback}{locked && <><p className="mt-2 text-base font-semibold">{question.target.word.toUpperCase()} has {question.target.phonemes.length} {positionLabel(question.target.phonemes)}.</p><div className="mt-2 flex flex-wrap justify-center gap-2" aria-label="Sound sequence">{question.target.phonemes.map((phoneme, index) => <span key={`${phoneme}-${index}`} className="rounded-lg bg-white px-3 py-2 text-sm font-black">/{phonemeLabel(phoneme)}/</span>)}</div></>}</div>}
    {hintVisible && <p className="mt-2 rounded-xl bg-white/90 p-3 font-semibold">{chapterIndex === 0 ? 'Look at the model word. Copy each box in order, even if the same letters appear again.' : chapterIndex === 1 ? 'Listen to each sound in order and notice where the gap is.' : 'Say the picture word slowly. Choose one sound for each place.'}</p>}
    {missingClip && <p role="status" className="mt-2 rounded-lg bg-amber-100 p-2 text-sm font-bold">The recording for /{missingClip}/ is not packaged yet.</p>}
    {!locked && <button type="button" onClick={hint} className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-amber-500 bg-white px-5 font-black"><Lightbulb size={19} /> Hear sounds as a hint</button>}
    {locked && <button type="button" onClick={next} className="mt-5 min-h-14 w-full rounded-2xl bg-cyan-800 text-lg font-black text-white">{cursor === 5 ? 'Finish chapter' : 'Next word'}</button>}
    {chapterIndex === 0 && <p className="mt-2 inline-flex items-center gap-2 text-sm font-bold"><RotateCcw size={15} /> Repeated letters use separate tiles.</p>}
  </main></div>;
}
