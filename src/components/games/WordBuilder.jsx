import { useEffect, useMemo, useState } from 'react';
import { Check, Home, RotateCcw, Volume2 } from 'lucide-react';
import { getPraise, loadSaved, saveSafe, shuffle } from '../../utils.js';
import { DECODABLE_CAPTIONS, getAvailableTrickyWords, getAvailableWords, getTaughtGraphemes, makeLearningEvent, WRITING_SAMPLES_KEY } from '../../data/literacy.js';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';
import { PracticeProgress, SoundToggle } from '../shared/index.jsx';

const PROGRESS_KEY = 'amari_spelling_progress_v1';
const LETTER_BANK = ['s', 'a', 't', 'p', 'i', 'n', 'm', 'd', 'g', 'o', 'c', 'k', 'e', 'u', 'r', 'h', 'b', 'f', 'l', 'sh', 'ch', 'th', 'ai', 'ee', 'oa', 'oo'];

const MODES = [
  { id: 'copy', label: 'Learn it', short: 'See and build', icon: '👀' },
  { id: 'missing', label: 'Sound gap', short: 'Find one sound', icon: '👂' },
  { id: 'spell', label: 'Spell it', short: 'Hear and build', icon: '✍️' },
  { id: 'tricky', label: 'Tricky words', short: 'Remember by heart', icon: '⭐' },
  { id: 'caption', label: 'Write it', short: 'Copy a caption', icon: '📝' },
];

const makeTiles = (graphemes, distractors = 0) => {
  const extras = shuffle(LETTER_BANK.filter((letter) => !graphemes.includes(letter))).slice(0, distractors);
  return shuffle([...graphemes, ...extras].map((letter, index) => ({ letter, id: `${letter}-${index}` })));
};

const makeMissingOptions = (graphemes, missingIndex) => {
  const answer = graphemes[missingIndex];
  const decoys = shuffle(LETTER_BANK.filter((letter) => letter !== answer)).slice(0, 3);
  return shuffle([answer, ...decoys]);
};

const WordBuilder = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent }) => {
  const difficulty = useGameDifficulty('words');
  const [mode, setMode] = useState(() => difficulty === 'challenge' ? 'spell' : difficulty === 'growing' ? 'missing' : 'copy');
  const [wordIndex, setWordIndex] = useState(0);
  const [typed, setTyped] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [skillRun, setSkillRun] = useState(0);
  const [locked, setLocked] = useState(false);
  const [hadMistake, setHadMistake] = useState(false);
  const [progress, setProgress] = useState(() => loadSaved(PROGRESS_KEY, {}));

  const regularWords = useMemo(() => getAvailableWords(), []);
  const trickyWords = useMemo(() => getAvailableTrickyWords(), []);
  const words = mode === 'tricky' ? trickyWords : regularWords;
  const word = words[wordIndex % words.length];
  const missingIndex = wordIndex % word.graphemes.length;
  const [tiles, setTiles] = useState(() => makeTiles(getAvailableWords()[0].graphemes));
  const [captionText, setCaptionText] = useState('');
  const [captionSaved, setCaptionSaved] = useState(false);
  const captions = useMemo(() => {
    const taught = getTaughtGraphemes();
    const eligible = DECODABLE_CAPTIONS.filter((caption) => caption.needs.every((sound) => taught.has(sound)));
    return eligible.length ? eligible : DECODABLE_CAPTIONS.slice(0, 1);
  }, []);
  const caption = captions[wordIndex % captions.length];
  const missingOptions = useMemo(
    () => makeMissingOptions(word.graphemes, missingIndex),
    [word.graphemes, missingIndex],
  );

  const masteredWords = Object.values(progress).filter((item) => item?.independentDays?.length >= 2).length;

  useEffect(() => {
    if (mode === 'caption') speak(`Read and copy: ${caption.text}`);
    else speak(`Spell the word: ${word.word}. ${word.hint}`);
  }, [caption.text, mode, word.word, word.hint, speak]);

  const resetRound = (nextIndex = wordIndex, nextMode = mode) => {
    const selectedWords = nextMode === 'tricky' ? trickyWords : regularWords;
    const nextWord = selectedWords[nextIndex % selectedWords.length];
    setWordIndex(nextIndex % selectedWords.length);
    setTyped([]);
    setFeedback('');
    setLocked(false);
    setHadMistake(false);
    setCaptionText('');
    setCaptionSaved(false);
    setTiles(makeTiles(nextWord.graphemes, ['spell', 'tricky'].includes(nextMode) ? 3 : 0));
  };

  const chooseMode = (nextMode) => {
    setMode(nextMode);
    setScore(0);
    setSkillRun(0);
    resetRound(0, nextMode);
    playSfx('click');
  };

  const recordSuccess = () => {
    const praise = getPraise();
    const independent = ['spell', 'tricky'].includes(mode) && !hadMistake;
    const previous = progress[word.word] || { attempts: 0, independentFirstTry: 0, independentDays: [], needsPractice: 0 };
    const today = new Date().toISOString().slice(0, 10);
    const independentDays = independent && !previous.independentDays?.includes(today)
      ? [...(previous.independentDays || []), today]
      : (previous.independentDays || []);
    const nextProgress = {
      ...progress,
      [word.word]: {
        attempts: previous.attempts + 1,
        independentFirstTry: previous.independentFirstTry + (independent ? 1 : 0),
        independentDays,
        needsPractice: previous.needsPractice + (hadMistake ? 1 : 0),
        lastMode: mode,
        lastSeen: today,
      },
    };
    setProgress(nextProgress);
    saveSafe(PROGRESS_KEY, nextProgress);
    setFeedback(independent ? `${praise} First try!` : praise);
    setScore((current) => current + 1);
    setSkillRun((current) => Math.min(current + 1, 5));
    setLocked(true);
    playSfx('success');
    speak(`${word.word}! Super!`);
    onCelebrate(praise, independent ? 5 : 4, 300);
    onGameEvent?.('words', 'answer_correct');
    onGameEvent?.('words', 'learning_attempt', makeLearningEvent({
      skill: mode === 'missing' ? 'phoneme-gap' : mode === 'copy' ? 'supported-spelling' : mode === 'tricky' ? 'tricky-word-spelling' : 'independent-spelling',
      item: word.word,
      response: word.word,
      correct: true,
      firstTry: !hadMistake,
      difficulty: mode === 'copy' ? 'starter' : mode === 'missing' ? 'growing' : 'challenge',
      extra: { family: word.family, phase: word.phase },
    }));
  };

  const handleLetterTap = (item) => {
    if (locked) return;
    const expected = word.graphemes[typed.length];
    if (item.letter !== expected) {
      setHadMistake(true);
      setFeedback(mode === 'copy' ? `The next letter is ${expected}` : 'Say the word slowly and listen for the next sound.');
      playSfx('wrong');
      speak(mode === 'copy' ? expected : `Spell ${word.word}. ${word.hint}`);
      return;
    }

    const next = [...typed, item];
    setTyped(next);
    setTiles((previous) => previous.filter((tile) => tile.id !== item.id));
    setFeedback('');
    playSfx('tap');
    if (next.length === word.graphemes.length) recordSuccess();
  };

  const handleMissingSound = (letter) => {
    if (locked) return;
    if (letter !== word.graphemes[missingIndex]) {
      setHadMistake(true);
      setFeedback('Say the word slowly and listen again.');
      playSfx('wrong');
      speak(`Spell ${word.word}. ${word.hint}`);
      return;
    }
    playSfx('tap');
    recordSuccess();
  };

  const handleUndo = () => {
    if (typed.length === 0 || locked) return;
    const last = typed[typed.length - 1];
    setTyped((previous) => previous.slice(0, -1));
    setTiles((previous) => shuffle([...previous, last]));
    playSfx('click');
  };

  const nextWord = () => resetRound((wordIndex + 1) % words.length);

  const saveWritingSample = () => {
    const response = captionText.trim();
    if (!response) {
      setFeedback('Write something first. It does not need to be perfect.');
      return;
    }
    const samples = loadSaved(WRITING_SAMPLES_KEY, []);
    const sample = { prompt: caption.text, response, savedAt: new Date().toISOString(), reviewed: false };
    saveSafe(WRITING_SAMPLES_KEY, [...samples.slice(-19), sample]);
    setCaptionSaved(true);
    setFeedback('Saved for your grown-up to see!');
    playSfx('success');
    onCelebrate('Writing saved!', 3, 200);
    onGameEvent?.('words', 'learning_attempt', makeLearningEvent({
      skill: 'caption-writing', item: caption.text, response, correct: null, firstTry: true,
      difficulty: caption.phase === 2 ? 'growing' : 'challenge', extra: { savedForReview: true },
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-100 via-sky-100 to-blue-200 text-slate-800">
      <header className="relative z-20 flex items-center justify-between gap-3 px-4 pt-4">
        <button onClick={onBack} className="rounded-full bg-white p-3 shadow-lg transition hover:scale-105" aria-label="Back to all games"><Home /></button>
        <div className="text-center">
          <h2 className="text-2xl font-black text-cyan-800 sm:text-3xl">Spelling Studio</h2>
          <p className="text-sm font-bold text-cyan-700">{masteredWords} words secure · {score} today</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-3 pb-8">
        <div className="mt-3 grid w-full max-w-3xl grid-cols-2 gap-2 rounded-2xl bg-white/70 p-2 shadow-sm sm:grid-cols-5" aria-label="Spelling level">
          {MODES.map((item) => (
            <button
              key={item.id}
              onClick={() => chooseMode(item.id)}
              aria-pressed={mode === item.id}
              className={`min-h-16 rounded-xl px-2 py-2 text-sm font-black transition ${mode === item.id ? 'bg-cyan-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-cyan-50'}`}
            >
              <span className="mr-1" aria-hidden="true">{item.icon}</span>{item.label}
              <span className={`mt-0.5 block text-[11px] font-bold ${mode === item.id ? 'text-cyan-100' : 'text-slate-400'}`}>{item.short}</span>
            </button>
          ))}
        </div>

        <PracticeProgress
          skill={mode === 'copy' ? 'Build a word with support' : mode === 'missing' ? 'Hear the missing sound' : mode === 'tricky' ? 'Remember a tricky word' : mode === 'caption' ? 'Read and copy a caption' : 'Spell independently'}
          completed={skillRun}
          accent="cyan"
          className="max-w-xl"
        />

        <section className="mt-3 w-full max-w-2xl rounded-3xl border-4 border-white bg-white/75 p-4 text-center shadow-xl sm:p-6">
          {mode === 'caption' ? (
            <>
              <p className="text-xs font-black uppercase tracking-widest text-cyan-700">Read it, say it, write it</p>
              <p className="mt-3 rounded-2xl bg-cyan-50 p-4 text-2xl font-black text-cyan-900">{caption.text}</p>
              <button onClick={() => speak(`Read and copy: ${caption.text}`)} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-cyan-100 px-4 font-black text-cyan-800"><Volume2 size={19} /> Hear the caption</button>
              <textarea value={captionText} onChange={(event) => { setCaptionText(event.target.value); setCaptionSaved(false); }} rows={3} placeholder="Type or copy the caption here" className="mt-5 w-full rounded-2xl border-4 border-cyan-200 bg-white p-4 text-xl font-black uppercase text-slate-800 outline-none focus:border-cyan-500" aria-label="Writing sample" />
              <p className="mt-2 text-xs font-bold text-slate-500">This is saved as a writing sample for a grown-up to review. The app does not pretend to grade handwriting.</p>
              <button onClick={saveWritingSample} disabled={captionSaved} className="mt-4 min-h-12 rounded-xl bg-emerald-500 px-6 font-black text-white shadow-lg disabled:opacity-60">{captionSaved ? 'Saved!' : 'Save my writing'}</button>
            </>
          ) : <>
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-cyan-50 text-6xl shadow-inner" aria-label={word.hint}>{word.emoji}</div>
          <p className="mt-3 text-lg font-bold text-slate-700">{word.hint}</p>
          <button onClick={() => speak(`Spell ${word.word}. ${word.hint}`)} className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-full bg-cyan-100 px-4 font-black text-cyan-800">
            <Volume2 size={19} /> Hear the word
          </button>

          {mode === 'copy' && (
            <div className="mt-3" aria-label={`Word to copy: ${word.word}`}>
              <p className="text-xs font-black uppercase tracking-widest text-cyan-700">Look, say, build</p>
              <p className="mt-1 text-3xl font-black tracking-[0.28em] text-cyan-800">{word.word}</p>
            </div>
          )}

          <div className="mt-5 flex justify-center gap-2 sm:gap-3" aria-label="Word spaces">
            {word.graphemes.map((letter, index) => {
              const shown = mode === 'missing' ? (index === missingIndex ? (locked ? letter : '') : letter) : typed[index]?.letter;
              return (
                <div key={`${letter}-${index}`} className={`grid h-14 w-14 place-items-center rounded-xl border-4 text-2xl font-black sm:h-16 sm:w-16 sm:text-3xl ${shown ? 'border-cyan-600 bg-cyan-500 text-white' : 'border-dashed border-cyan-200 bg-white text-cyan-200'}`}>
                  {shown || '•'}
                </div>
              );
            })}
          </div>

          {mode === 'missing' ? (
            <div className="mt-5 flex flex-wrap justify-center gap-3" aria-label="Choose the missing sound">
              {missingOptions.map((letter) => (
                <button key={letter} disabled={locked} onClick={() => handleMissingSound(letter)} className="grid h-16 w-16 place-items-center rounded-2xl border-4 border-cyan-200 bg-white text-3xl font-black text-cyan-800 shadow-md transition hover:-translate-y-1 disabled:opacity-60">
                  {letter}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-5 flex flex-wrap justify-center gap-3" aria-label="Letter tiles">
              {tiles.map((item) => (
                <button key={item.id} disabled={locked} onClick={() => handleLetterTap(item)} className="grid h-16 w-16 place-items-center rounded-2xl border-4 border-cyan-200 bg-white text-3xl font-black text-cyan-800 shadow-md transition hover:-translate-y-1 disabled:opacity-60">
                  {item.letter}
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 min-h-12" aria-live="polite">
            {feedback && <p className={`text-lg font-black ${locked ? 'text-emerald-600' : 'text-amber-700'}`}>{feedback}</p>}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {!locked && mode !== 'missing' && typed.length > 0 && (
              <button onClick={handleUndo} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 font-black text-cyan-700 shadow"><RotateCcw size={18} /> Undo</button>
            )}
            {locked && (
              <button onClick={nextWord} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-emerald-500 px-6 font-black text-white shadow-lg transition hover:bg-emerald-600"><Check size={20} /> Next word</button>
            )}
          </div>
          </>}
        </section>

        <p className="mt-3 max-w-xl text-center text-xs font-bold text-cyan-800/70">
          A word becomes secure after independent first-try spelling on two different days. Supported practice still helps, but does not count as mastery.
        </p>
      </main>
    </div>
  );
};

export default WordBuilder;
