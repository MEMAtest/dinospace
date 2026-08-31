import { useState, useEffect, useMemo } from 'react';
import { Home } from 'lucide-react';
import { ODD_ONE_OUT_ROUNDS } from '../../data/index.js';
import { shuffle, getPraise } from '../../utils.js';
import { PracticeProgress, SoundToggle } from '../shared/index.jsx';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';
import { oddOneOutRoundIndexes } from '../../data/gameDifficulty.js';

const OddOneOut = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent }) => {
  const difficulty = useGameDifficulty('oddoneout');
  const [roundIndex, setRoundIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [skillRun, setSkillRun] = useState(0);
  const [locked, setLocked] = useState(false);
  const [whyOptions, setWhyOptions] = useState([]);
  const [askingWhy, setAskingWhy] = useState(false);
  const bandIndexes = oddOneOutRoundIndexes(difficulty);
  const round = ODD_ONE_OUT_ROUNDS[bandIndexes[roundIndex % bandIndexes.length]];
  const shuffledItems = useMemo(() => shuffle(round.items), [round]);

  useEffect(() => {
    speak(`Which one does not belong? ${round.hint}`);
  }, [roundIndex, round.hint, speak]);

  const nextRound = () => {
    setRoundIndex((index) => (index + 1) % bandIndexes.length);
    setFeedback('');
    setLocked(false);
    setAskingWhy(false);
    setWhyOptions([]);
    setSkillRun((current) => current >= 5 ? 0 : current);
  };

  const handlePick = (item) => {
    if (locked) return;
    if (item === round.odd) {
      setLocked(true);
      setAskingWhy(true);
      setWhyOptions(shuffle([round.hint, 'It is the only one with a different colour.', 'It is the only one that cannot be grouped with the others.']));
      setFeedback(`${item} is the odd one out! Now tell me why.`);
      playSfx('sparkle');
      speak(`Good spotting. Why does ${item} not belong?`);
    } else {
      setShake(true);
      playSfx('wrong');
      setFeedback('Not that one. Compare all four and try again.');
      setTimeout(() => { setShake(false); setFeedback(''); }, 1200);
    }
  };

  const handleWhy = (reason) => {
    if (!askingWhy) return;
    if (reason !== round.hint) {
      setFeedback('Look again: what do the other three have in common?');
      playSfx('wrong');
      return;
    }
    const praise = getPraise();
    setAskingWhy(false);
    setFeedback(`${praise} ${round.hint}`);
    setScore((s) => s + 1);
    setSkillRun((current) => Math.min(current + 1, 5));
    playSfx('success');
    speak(`${praise} ${round.hint}`);
    onCelebrate(praise, 4, 200);
    onGameEvent?.('oddoneout', 'answer_correct', { skill: 'classification-and-reasoning', item: round.odd, response: reason, expected: round.hint, correct: true, firstAttempt: true, independent: true });
    setTimeout(nextRound, 1250);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-lime-100 via-yellow-100 to-lime-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 right-8 w-40 h-40 bg-white/70 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-lime-200/60 rounded-full blur-3xl" />
      </div>
      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform" aria-label="Go back to menu"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-lime-700">Odd One Out</h2>
          <p className="text-lime-700/70 font-semibold">Score: {score}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>
      <div className="min-h-0 flex-1 flex flex-col items-center justify-center px-4 pb-4 z-10">
        <PracticeProgress skill="Sort by category and explain why" completed={skillRun} accent="lime" />
        <p className="text-2xl font-bold text-slate-700 mb-2">Which one doesn't belong?</p>
        <p className="text-slate-500 font-semibold mb-4">{askingWhy ? 'Choose the reason that explains your answer.' : 'Look at all four, then choose the one that does not belong.'}</p>
        <div className={`grid w-full max-w-xl grid-cols-2 gap-4 ${shake ? 'animate-shake' : ''}`}>
          {shuffledItems.map((item, i) => (
            <button key={`${item}-${i}`} onClick={() => handlePick(item)} disabled={locked}
              className="aspect-[4/3] bg-white rounded-3xl shadow-xl border-4 border-lime-200 flex items-center justify-center text-8xl hover:-translate-y-2 active:translate-y-1 transition-all">{item}</button>
          ))}
        </div>
        {askingWhy && (
          <div className="mt-4 grid w-full max-w-xl gap-2 sm:grid-cols-3" aria-label="Choose why the item does not belong">
            {whyOptions.map((reason) => (
              <button key={reason} onClick={() => handleWhy(reason)} className="rounded-2xl border-4 border-lime-200 bg-white px-3 py-3 text-sm font-black text-lime-800 shadow-md transition hover:-translate-y-1">{reason}</button>
            ))}
          </div>
        )}
        {feedback && <div className="mt-6 text-xl font-black text-lime-700 animate-bounce text-center">{feedback}</div>}
      </div>
    </div>
  );
};

export default OddOneOut;
