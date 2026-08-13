import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Home, Lightbulb, RotateCcw, ShieldCheck, Sparkles, Volume2 } from 'lucide-react';
import { SoundToggle } from '../shared/index.jsx';
import DinoIcon from '../shared/DinoIcon.jsx';
import { getAvailableWords, makeLearningEvent } from '../../data/literacy.js';
import { loadSaved, shuffle } from '../../utils.js';

const MAX_MISTAKES = 6;
const SPELLING_PROGRESS_KEY = 'amari_spelling_progress_v1';

const DinoHangman = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent }) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [roundState, setRoundState] = useState('playing');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [rescues, setRescues] = useState(0);
  const completedWordRef = useRef('');
  const nextRoundTimerRef = useRef(null);

  const practiceWords = useMemo(() => {
    const available = getAvailableWords();
    const progress = loadSaved(SPELLING_PROGRESS_KEY, {});
    const practised = available.filter((item) => progress[item.word]?.attempts > 0);
    const pool = practised.length >= 3 ? practised : available.slice(0, 6);
    return pool.map((item) => ({ ...item, clue: item.hint, category: `${item.family} word family` }));
  }, []);
  const word = practiceWords[wordIndex % practiceWords.length];
  const wordLetters = useMemo(() => [...new Set(word.word.split(''))], [word.word]);
  const wrongLetters = useMemo(
    () => guessedLetters.filter((letter) => !word.word.includes(letter)),
    [guessedLetters, word.word],
  );
  const shieldsLeft = MAX_MISTAKES - wrongLetters.length;
  const isRoundOver = roundState !== 'playing';
  const keyboardLetters = useMemo(() => {
    const answerLetters = [...new Set(word.word)];
    const decoys = shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter((letter) => !answerLetters.includes(letter))).slice(0, Math.max(5, 12 - answerLetters.length));
    return shuffle([...answerLetters, ...decoys]);
  }, [word.word]);

  const startNextRound = useCallback((withSound = true) => {
    if (nextRoundTimerRef.current) {
      clearTimeout(nextRoundTimerRef.current);
      nextRoundTimerRef.current = null;
    }
    completedWordRef.current = '';
    setGuessedLetters([]);
    setHintsUsed(0);
    setRoundState('playing');
    setWordIndex((index) => (index + 1) % practiceWords.length);
    if (withSound) playSfx('swish');
  }, [playSfx, practiceWords.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      speak(`Dino Hangman. ${word.category}. ${word.clue}`);
    }, 60);
    return () => clearTimeout(timer);
  }, [speak, word.category, word.clue, wordIndex]);

  useEffect(() => () => {
    if (nextRoundTimerRef.current) clearTimeout(nextRoundTimerRef.current);
  }, []);

  const finishRound = useCallback((result, usedHint) => {
    if (completedWordRef.current === word.word) return;
    completedWordRef.current = word.word;
    setRoundState(result);

    if (result === 'won') {
      const stars = usedHint ? 6 : 8;
      setRescues((count) => count + 1);
      playSfx('complete');
      speak(usedHint
        ? `Great rescue! The word is ${word.word}.`
        : `Perfect rescue! The word is ${word.word}.`);
      onGameEvent?.('hangman', 'word_completed');
      onGameEvent?.('hangman', 'learning_attempt', makeLearningEvent({
        skill: 'known-word-consolidation', item: word.word, response: word.word, correct: true,
        firstTry: wrongLetters.length === 0, hints: usedHint ? 1 : 0, difficulty: 'practice',
        extra: { masteryEligible: false, family: word.family },
      }));
      onCelebrate(usedHint ? 'Word rescued!' : 'Perfect word rescue!', stars, 0, 'hangman');
    } else {
      playSfx('oops');
      speak(`That was a tricky one. The word was ${word.word}. Let us try another!`);
    }

    nextRoundTimerRef.current = setTimeout(() => startNextRound(false), 1350);
  }, [onCelebrate, onGameEvent, playSfx, speak, startNextRound, word.family, word.word, wrongLetters.length]);

  const chooseLetter = useCallback((letter, { fromHint = false } = {}) => {
    if (roundState !== 'playing' || guessedLetters.includes(letter)) return;

    const nextGuessed = [...guessedLetters, letter];
    setGuessedLetters(nextGuessed);

    if (word.word.includes(letter)) {
      const solved = wordLetters.every((wordLetter) => nextGuessed.includes(wordLetter));
      if (solved) {
        finishRound('won', hintsUsed > 0 || fromHint);
      } else {
        playSfx(fromHint ? 'sparkle' : 'pop');
        if (!fromHint) speak(`Yes! ${letter} is in the word.`);
      }
      return;
    }

    const nextMistakes = nextGuessed.filter((guess) => !word.word.includes(guess)).length;
    if (nextMistakes >= MAX_MISTAKES) {
      finishRound('lost', hintsUsed > 0);
      return;
    }

    playSfx('oops');
    speak(`Not this time. You have ${MAX_MISTAKES - nextMistakes} shields left.`);
  }, [finishRound, guessedLetters, hintsUsed, playSfx, roundState, speak, word.word, wordLetters]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const letter = event.key.toUpperCase();
      if (/^[A-Z]$/.test(letter) && keyboardLetters.includes(letter)) {
        event.preventDefault();
        chooseLetter(letter);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [chooseLetter, keyboardLetters]);

  const useHint = () => {
    if (roundState !== 'playing' || hintsUsed >= 1) return;
    const letterToReveal = wordLetters.find((letter) => !guessedLetters.includes(letter));
    if (!letterToReveal) return;
    setHintsUsed(1);
    playSfx('sparkle');
    speak('A star has revealed a letter.');
    chooseLetter(letterToReveal, { fromHint: true });
  };

  const hearClue = () => {
    playSfx('click');
    speak(`${word.category}. ${word.clue}`);
  };

  const statusMessage = roundState === 'won'
    ? 'Word rescued!'
    : roundState === 'lost'
      ? `The word was ${word.word}`
      : `${shieldsLeft} shield${shieldsLeft === 1 ? '' : 's'} left`;

  return (
    <div className="h-screen overflow-hidden bg-[#07132f] text-white relative">
      <div className="absolute inset-0 ttt-starfield pointer-events-none" />
      <div className="absolute -top-32 right-[-7rem] h-96 w-96 rounded-full bg-fuchsia-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 -left-24 h-[28rem] w-[28rem] rounded-full bg-cyan-400/15 blur-3xl pointer-events-none" />

      <header className="relative z-20 flex items-center justify-between gap-3 px-4 sm:px-7 pt-4">
        <button onClick={onBack} className="game-icon-button" aria-label="Back to all games">
          <Home />
        </button>
        <div className="min-w-0 text-center">
          <div className="text-xs sm:text-sm uppercase tracking-[0.24em] text-fuchsia-200 font-bold">Letter rescue mission</div>
          <h1 className="text-2xl sm:text-4xl font-black">Dino Hangman</h1>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} className="!bg-white/15 !text-white" />
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl gap-4 px-4 pb-3 pt-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.95fr)] lg:items-center">
        <section className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl lg:p-5 xl:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-fuchsia-400/20 text-3xl">{word.emoji}</div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-200">{word.category}</p>
                <p className="text-lg font-black" aria-live="polite">{statusMessage}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-black/20 px-4 py-2 text-right">
              <p className="text-xs font-bold uppercase tracking-wide text-white/55">Words rescued</p>
              <p className="text-2xl font-black text-amber-300">{rescues} ⭐</p>
            </div>
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-slate-950/45 p-4 sm:p-6">
            <div className="flex items-end justify-center gap-1.5 sm:gap-3" aria-label={`Word has ${word.word.length} letters`}>
              {word.word.split('').map((letter, index) => {
                const isVisible = guessedLetters.includes(letter) || isRoundOver;
                return (
                  <div
                    key={`${letter}-${index}`}
                    className={`grid h-14 w-10 place-items-center rounded-xl border-b-4 text-2xl font-black sm:h-20 sm:w-14 sm:text-4xl ${
                      isVisible ? 'border-fuchsia-300 bg-white text-slate-900 animate-pop-in' : 'border-white/50 bg-white/10 text-transparent'
                    }`}
                    aria-label={isVisible ? `Letter ${letter}` : `Letter ${index + 1}, hidden`}
                  >
                    {isVisible ? letter : '•'}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button onClick={hearClue} className="ttt-action !bg-white/15 !px-4 !py-2.5">
              <Volume2 size={19} /> Hear clue
            </button>
            <button
              onClick={useHint}
              disabled={hintsUsed >= 1 || isRoundOver}
              className="ttt-action !bg-amber-300/15 !px-4 !py-2.5 disabled:opacity-40"
            >
              <Lightbulb size={19} /> {hintsUsed ? 'Hint used' : 'Use a star hint'}
            </button>
            <button onClick={() => startNextRound()} className="ttt-action !bg-white/10 !px-4 !py-2.5">
              <RotateCcw size={19} /> New word
            </button>
          </div>

          <div className="mt-6" role="group" aria-label="Helpful letter choices">
            <p className="mb-3 text-center text-sm font-bold text-cyan-100">Choose from these helpful letters</p>
              <div className="mx-auto grid max-w-2xl grid-cols-6 gap-2">
                {keyboardLetters.map((letter) => {
                  const guessed = guessedLetters.includes(letter);
                  const correct = guessed && word.word.includes(letter);
                  const wrong = guessed && !correct;
                  return (
                    <button
                      key={letter}
                      onClick={() => chooseLetter(letter)}
                      disabled={guessed || isRoundOver}
                      className={`grid min-h-12 place-items-center rounded-xl border text-lg font-black transition sm:min-h-14 sm:text-xl ${
                        correct
                          ? 'border-emerald-300 bg-emerald-400 text-emerald-950'
                          : wrong
                            ? 'border-rose-400/30 bg-rose-500/25 text-rose-100 line-through'
                            : 'border-white/15 bg-white/10 text-white hover:-translate-y-0.5 hover:border-fuchsia-300/70 hover:bg-white/15 active:translate-y-0 disabled:cursor-default'
                      }`}
                      aria-label={`${letter}${guessed ? correct ? ', correct letter' : ', not in the word' : ''}`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
          </div>
        </section>

        <aside className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl lg:p-5 xl:p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Dino shield bay</p>
              <h2 className="mt-1 text-2xl font-black">Keep Dino safe!</h2>
            </div>
            <DinoIcon species="trex" size={86} className="animate-bounce-slow" />
          </div>

          <div className="mt-5 rounded-[1.75rem] border border-white/10 bg-slate-950/35 p-5">
            <div className="flex items-center justify-between text-sm font-bold text-white/70">
              <span>Comet shields</span>
              <span>{wrongLetters.length}/{MAX_MISTAKES} used</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3" aria-label={`${shieldsLeft} of ${MAX_MISTAKES} comet shields remaining`}>
              {Array.from({ length: MAX_MISTAKES }, (_, index) => {
                const hasBeenHit = index < wrongLetters.length;
                return (
                  <div
                    key={index}
                    className={`grid aspect-square place-items-center rounded-2xl border text-3xl transition ${
                      hasBeenHit ? 'border-rose-400/25 bg-rose-500/15 grayscale' : 'border-cyan-300/40 bg-cyan-300/15 shadow-[0_0_18px_rgba(103,232,249,0.12)]'
                    }`}
                    aria-label={hasBeenHit ? `Shield ${index + 1} used` : `Shield ${index + 1} ready`}
                  >
                    {hasBeenHit ? '💥' : '🛡️'}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-black/20 p-4 text-sm text-white/75">
            <div className="flex items-center gap-2 text-white"><ShieldCheck size={19} className="text-cyan-300" /><strong>How to play</strong></div>
            <p className="mt-2">Choose letters to uncover the secret word. Each wrong letter uses one shield. A star hint reveals one letter.</p>
          </div>

          {wrongLetters.length > 0 && (
            <div className="mt-4 rounded-2xl border border-rose-300/15 bg-rose-500/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-200">Try different letters</p>
              <p className="mt-2 text-xl font-black tracking-[0.3em] text-white">{wrongLetters.join(' ')}</p>
            </div>
          )}

          {roundState === 'won' && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-300/40 bg-amber-300/15 p-4 text-amber-50 animate-scale-in">
              <Sparkles className="text-amber-300" />
              <p className="font-black">Dino says: brilliant spelling!</p>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};

export default DinoHangman;
