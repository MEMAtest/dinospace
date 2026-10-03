import { useEffect, useState } from 'react';
import { Batch6BaseCss, Batch6Chrome, ChapterMap, FactPanel, useBatch6Journey } from './Batch6Journey.jsx';
import { BATCH6_BANDS, PATTERN_MISSIONS } from '../../data/batch6Games.js';
import { speakBatch6 } from '../../data/batch6Narration.js';
import PatternParadeAskia from './PatternParadeAskia.jsx';
import patternParadeArt from '../../assets/game-scenes/pattern-parade.webp';

const bandText = { starter:'Repeat it: spot the two-part or three-part unit.', growing:'Change the rule: follow colours, sounds and growing steps.', challenge:'Growing festival: explain a rule with more than one step.' };
const chapterNames = { starter:'Repeat it', growing:'Change the rule', challenge:'Growing festival' };
const PatternParade=(props)=>props.littleMode?<PatternParadeAmari {...props}/>:<PatternParadeAskia {...props}/>;
const PatternParadeAmari=(props)=>{
  const { playerId, onGameEvent, onCelebrate, speak, onBack, cancelNarration, soundOn, onToggleSound, onPhaseChange } = props;
  const journey = useBatch6Journey({ gameId:'pattern', playerId, onGameEvent, onCelebrate, speak, onBack, cancelNarration, onPhaseChange });
  const [mistake, setMistake] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const band = BATCH6_BANDS.find((item) => item.id === journey.chapter);
  const mission = journey.run?.queue[journey.run.index];
  const makeDisplay = (value) => {
    if (!mission || mission.modality === 'picture rule') return value;
    const units = [...mission.symbolTokens].sort((a,b)=>b.length-a.length);
    const sounds = ['👏','🥁','🔔','🪇','🎺','🪈','🎹','🎸','🪘','🪕','📯','🪗']; const moves = ['⬆️','➡️','⬇️','⬅️','↗️','↘️','↙️','↖️','⤴️','⤵️','↔️','↕️'];
    return units.reduce((text,unit,index)=>text.replaceAll(unit,(mission.modality==='sound rule'?sounds:moves)[index%3]),value);
  };
  // Reset per-question controls when the frozen queue advances.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMistake(false); setHintUsed(false); }, [journey.run?.index, journey.chapter]);
  useEffect(() => { if (mission && !journey.run?.feedback) speakBatch6(speak, `Pattern mission. ${mission.label}. What comes next?`); }, [mission, journey.run?.feedback, speak]);
  const choose = (answer) => {
    if (!mission || journey.run.feedback) return;
    const correct = answer === mission.answer;
    journey.markAttempt(mission, correct);
    if (correct) {
      journey.reveal(mission, true, `That is the ${mission.rule} rule. ${mission.label}.`, mission.fact, answer);
      speakBatch6(speak, `Yes. ${mission.label}. ${mission.fact}`);
    } else { setMistake(true); speakBatch6(speak, 'Good try. Look at the whole repeating part, then try again.'); }
  };
  const hint = () => { if(hintUsed||journey.run?.feedback)return;setHintUsed(true);journey.hint('lesson');speakBatch6(speak, `Look at the first ${mission.rule==='ABC'?'three':'two'} places. What part repeats?`); };
  return <><Batch6BaseCss /><Batch6Chrome title="Pattern Parade" subtitle={band ? chapterNames[band.id] : 'Festival of patterns'} onBack={journey.back} soundOn={soundOn} onToggleSound={onToggleSound} leaveOpen={journey.leaveOpen} onLeave={journey.leave} onKeep={journey.keep} illustration={<img src={patternParadeArt} alt="" className="batch6-hero-art" />} progress={mission && !journey.run.feedback?.complete ? { current: journey.run.index + 1, total: journey.run.queue.length } : null} onReplay={mission&&!journey.run.feedback?()=>{cancelNarration?.();speakBatch6(speak,`Pattern mission. ${mission.label}. What comes next?`);}:undefined} saveFailed={journey.run?.feedback?.saveFailed}>
    {!journey.run && <ChapterMap title="Choose a pattern chapter" chapters={BATCH6_BANDS.map((item) => ({ ...item, name:chapterNames[item.id], subtitle:bandText[item.id] }))} completed={journey.progress.completed} bestStars={journey.progress.bestStars} onStart={(id) => journey.start(id, PATTERN_MISSIONS[id], 6)} onBack={onBack} />}
    {mission && !journey.run.feedback?.complete && <section className="batch6-card" aria-live="polite"><div className="text-center"><span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-black text-indigo-900">{mission.modality || (mission.rule === 'growing' ? 'movement rule' : 'picture rule')}</span></div><h2 className="batch6-question">{mission.label}: what comes next?</h2><div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3" aria-label="Pattern sequence">{mission.sequence.map((token,index)=><span key={`${mission.signature}-${index}`} className={`grid min-h-14 min-w-14 place-items-center rounded-2xl border-2 p-2 text-3xl sm:min-h-16 sm:min-w-16 ${token === '?' ? 'border-dashed border-violet-500 bg-violet-50' : 'border-amber-200 bg-amber-50'}`}>{token === '?' ? token : makeDisplay(token)}</span>)}</div>{mission.modality === 'sound rule' && <p className="mt-3 text-center font-bold text-indigo-800">Tap a choice, then say the sound pattern aloud.</p>}{mission.modality === 'movement rule' && <p className="mt-3 text-center font-bold text-indigo-800">Follow the moving steps: up, across, then down.</p>}<div className="batch6-options mt-6">{mission.options.map((option,index)=><button key={`${option}-${index}`} className="batch6-option" onClick={()=>choose(option)}>{makeDisplay(option)}</button>)}</div><div className="batch6-actions"><button className="batch6-secondary" disabled={hintUsed||Boolean(journey.run.feedback)} onClick={hint}>Use a clue</button></div>{mistake && <p className="batch6-feedback text-amber-800" role="status">Try the whole pattern from the start. Your answer stays yours to change.</p>}{journey.run.feedback && <><FactPanel explanation={journey.run.feedback.explanation} fact={journey.run.feedback.fact} /><div className="batch6-actions"><button className="batch6-primary" onClick={journey.next}>Next pattern</button></div></>}</section>}
    {journey.run?.feedback?.complete && <section className="batch6-card text-center"><div className="text-5xl">🎉</div><h2 className="batch6-question">Festival chapter complete!</h2><p className="text-2xl text-amber-600" aria-label={`${journey.run.feedback.stars} stars`}>{'★'.repeat(journey.run.feedback.stars)}{'☆'.repeat(3-journey.run.feedback.stars)}</p><p>Every pattern had a rule you could explain.</p><FactPanel explanation="You looked for the part that repeats or grows." fact="Patterns help us predict what may come next." /><div className="batch6-actions"><button className="batch6-primary" onClick={journey.toMap}>Chapter map</button><button className="batch6-secondary" onClick={()=>journey.start(journey.chapter,PATTERN_MISSIONS[journey.chapter],6)}>Play again</button></div></section>}
  </Batch6Chrome></>;
};
export default PatternParade;
