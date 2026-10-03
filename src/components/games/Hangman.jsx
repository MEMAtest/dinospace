import { useEffect, useMemo, useState } from 'react';
import { Batch6BaseCss, Batch6Chrome, ChapterMap, FactPanel, useBatch6Journey } from './Batch6Journey.jsx';
import { BATCH6_BANDS, HANGMAN_WORDS_BY_BAND, validateTaughtWord } from '../../data/batch6Games.js';
import { getLearningProfile } from '../../data/learningProgress.js';
import { speakBatch6 } from '../../data/batch6Narration.js';
import HangmanAskia from './HangmanAskia.jsx';
import DinoIcon from '../shared/DinoIcon.jsx';

const chapterCopy = { starter:'Word-family rescue: listen for the same ending sound.', growing:'Picture-clue rescue: connect a picture with a taught word.', challenge:'Independent rescue: longer words with consonant blends.' };
const chapterNames = { starter:'Word-family rescue', growing:'Picture-clue rescue', challenge:'Independent rescue' };
const ALPHABET='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const DinoHangman = (props) => !props.littleMode ? <DinoHangmanAmari {...props} /> : <HangmanAskia {...props} />;
const DinoHangmanAmari = (props) => {
  const { playerId, onGameEvent, onCelebrate, speak, onBack, cancelNarration, soundOn, onToggleSound, onPhaseChange } = props;
  const journey = useBatch6Journey({ gameId:'hangman', playerId, onGameEvent, onCelebrate, speak, onBack, cancelNarration, onPhaseChange });
  const taught = useMemo(() => getLearningProfile().selectedSounds, []);
  const eligible = useMemo(() => Object.fromEntries(BATCH6_BANDS.map((band) => [band.id, HANGMAN_WORDS_BY_BAND[band.id].filter((item) => validateTaughtWord(item, taught))])), [taught]);
  const [guessed, setGuessed] = useState([]);
  const [hintUsed, setHintUsed] = useState(false);
  const [hintText, setHintText] = useState('');
  const band = BATCH6_BANDS.find((item) => item.id === journey.chapter);
  const mission = journey.run?.queue[journey.run.index];
  const feedback = journey.run?.feedback;
  // Reset guesses and clues only after the child advances to another frozen word.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setGuessed([]); setHintUsed(false); setHintText(''); }, [journey.run?.index, journey.chapter]);
  useEffect(() => { if (mission && !feedback) speakBatch6(speak, `Dinosaur word rescue. ${mission.clue}`); }, [mission, feedback, speak]);
  const chooseLetter = (letter) => {
    if (!mission || feedback || localMisses >= 6 || guessed.includes(letter)) return;
    setGuessed((current) => [...current, letter]);
    if (mission.word.includes(letter)) {
      if ([...mission.word].every((part) => part === letter || guessed.includes(part))) {
        const attempt = { ...mission, answer:mission.word };
        journey.markAttempt(attempt, true);
        journey.reveal(attempt, true, `You rescued ${mission.word}! You used the letters to build the word.`, mission.fact, mission.word);
      }
    } else {
      journey.markAttempt({ ...mission, answer:mission.word }, false);
      journey.addMissed(mission.id);
      // Track visible mistakes locally in this frozen word; retry never moves the queue.
      setLocalMisses((count) => count + 1);
    }
  };
  const [localMisses, setLocalMisses] = useState(0);
  // Rescue supplies are scoped to the current word and reset on Next.
  useEffect(() => { setLocalMisses(0); }, [journey.run?.index, journey.chapter]);
  const usePictureHint = () => { if (hintUsed || feedback) return; journey.hint('clue'); setHintUsed(true); setHintText(`Picture clue: ${mission.clue} The word starts with ${mission.word[0]}.`); };
  const useLetterHint = () => { if (hintUsed || feedback) return; journey.hint('audio_help'); setHintUsed(true); const next = [...mission.word].find((letter) => !guessed.includes(letter)); if (next) { setHintText(`Letter clue: find ${next}. Tap that letter when you find it.`); speakBatch6(speak, `Find the letter ${next.toLowerCase()}.`); } };
  const retry = () => { setLocalMisses(0); setGuessed([]); setHintUsed(false); setHintText(''); };
  return <><Batch6BaseCss /><Batch6Chrome title="Dino Hangman" subtitle={band ? chapterNames[band.id] : 'Rescue a word'} onBack={journey.back} soundOn={soundOn} onToggleSound={onToggleSound} leaveOpen={journey.leaveOpen} onLeave={journey.leave} onKeep={journey.keep} illustration={<DinoIcon species="trex" size={94} />} progress={mission && !feedback?.complete ? { current:journey.run.index+1,total:journey.run.queue.length } : null} onReplay={mission&&!feedback?()=>{cancelNarration?.();speakBatch6(speak,`Dinosaur word rescue. ${mission.clue}`);}:undefined} saveFailed={journey.run?.feedback?.saveFailed}>
    {!journey.run && <ChapterMap title="Choose a word rescue" chapters={BATCH6_BANDS.map((item) => ({...item,name:chapterNames[item.id],subtitle:chapterCopy[item.id]}))} completed={journey.progress.completed} bestStars={journey.progress.bestStars} disabled={Object.fromEntries(BATCH6_BANDS.map((item) => [item.id, eligible[item.id].length < 6 ? `Needs 6 taught-sound words; ${eligible[item.id].length} are ready.` : '']))} onStart={(id) => journey.start(id,eligible[id].map((word)=>({...word,letters:ALPHABET})),6)} onBack={onBack} />}
    {mission && !feedback?.complete && <section className="batch6-card"><div className="batch6-mission-icon" aria-hidden="true">{mission.emoji}</div><p className="text-center font-bold text-violet-800">{journey.chapter === 'challenge' ? `Beginning blend: ${mission.family}-` : `Word family: -${mission.family}`} </p><h2 className="batch6-question">Rescue the word. {mission.clue}</h2><div className="batch6-hangword" aria-label="Word letters">{[...mission.word].map((letter,index)=><span key={`${mission.id}-${index}`} className="min-w-8 border-b-4 border-indigo-500 text-center">{guessed.includes(letter)||feedback ? letter : '＿'}</span>)}</div><p className="text-center font-bold text-indigo-900">{6-localMisses} rescue supplies left</p><div className="batch6-letter-grid">{mission.letters.map((letter)=><button key={letter} className="batch6-letter" disabled={guessed.includes(letter)||localMisses>=6||feedback} aria-label={`Guess ${letter}`} onClick={()=>chooseLetter(letter)}>{letter}</button>)}</div><div className="batch6-actions"><button className="batch6-secondary" disabled={hintUsed||Boolean(feedback)} onClick={usePictureHint}>🖼 Picture clue</button><button className="batch6-secondary" disabled={hintUsed||Boolean(feedback)} onClick={useLetterHint}>🔊 Letter clue</button></div>{hintText && <p className="batch6-feedback" role="status">{hintText}</p>}{localMisses>=6 && !feedback && <div className="batch6-retry" role="alert"><p className="basis-full text-center font-extrabold text-amber-800">The dino is safe. Try this word again when you are ready.</p><button className="batch6-primary" onClick={retry}>Try word again</button></div>}{feedback && <><p className="batch6-feedback">Dino rescued!</p><FactPanel explanation={feedback.explanation} fact={feedback.fact} /><div className="batch6-actions"><button className="batch6-primary" onClick={()=>{setLocalMisses(0);setGuessed([]);setHintText('');setHintUsed(false);journey.next();}}>Next word</button></div></>}</section>}
    {feedback?.complete && <section className="batch6-card text-center"><div className="text-5xl">🦕</div><h2 className="batch6-question">Word rescue complete!</h2><p className="text-2xl text-amber-600">{'★'.repeat(feedback.stars)}{'☆'.repeat(3-feedback.stars)}</p><FactPanel explanation="You used letters and sounds to rescue each word." fact={journey.chapter === 'challenge' ? 'A consonant blend keeps each sound: say the sounds in order, then blend the word.' : 'A word family shares an ending spelling and sound pattern.'} /><div className="batch6-actions"><button className="batch6-primary" onClick={journey.toMap}>Chapter map</button><button className="batch6-secondary" onClick={()=>journey.start(journey.chapter,eligible[journey.chapter].map((word)=>({...word,letters:ALPHABET})),6)}>Play again</button></div></section>}
  </Batch6Chrome></>;
};
export default DinoHangman;
