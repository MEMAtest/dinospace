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
    setSkillRun((current) => current >= 5 ? 0 : current);
  };

  const handlePick = (item) => {
    if (locked) return;
    if (item === round.odd) {
      const praise = getPraise();
      setFeedback(`${praise} ${item} is the odd one out!`);
      setScore((s) => s + 1);
      setSkillRun((current) => Math.min(current + 1, 5));
      setLocked(true);
      playSfx('success');
      speak(`${praise} ${item} doesn't belong with the ${round.category}!`);
      onCelebrate(praise, 4, 200);
      onGameEvent?.('oddoneout', 'answer_correct');
      setTimeout(nextRound, 1100);
    } else {
      setShake(true);
      playSfx('wrong');
      setFeedback(`${round.hint}`);
      setTimeout(() => { setShake(false); setFeedback(''); }, 1200);
    }
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
        <p className="text-slate-500 font-semibold mb-4">{round.hint}</p>
        <div className={`grid w-full max-w-xl grid-cols-2 gap-4 ${shake ? 'animate-shake' : ''}`}>
          {shuffledItems.map((item, i) => (
            <button key={`${item}-${i}`} onClick={() => handlePick(item)} disabled={locked}
              className="aspect-[4/3] bg-white rounded-3xl shadow-xl border-4 border-lime-200 flex items-center justify-center text-8xl hover:-translate-y-2 active:translate-y-1 transition-all">{item}</button>
          ))}
        </div>
        {feedback && <div className="mt-6 text-xl font-black text-lime-700 animate-bounce text-center">{feedback}</div>}
      </div>
    </div>
  );
};

export default OddOneOut;
