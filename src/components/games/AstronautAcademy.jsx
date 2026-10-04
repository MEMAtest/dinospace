import { useEffect, useState } from 'react';
import { Batch6BaseCss, Batch6Chrome, ChapterMap, FactPanel, useBatch6Journey } from './Batch6Journey.jsx';
import { ASTRONAUT_MISSIONS, BATCH6_BANDS, readBatch6Progress, validateAstronautMission } from '../../data/batch6Games.js';
import AstronautAcademyAskia from './AstronautAcademyAskia.jsx';
import astronautRobotArt from '../../assets/landing/amari-astronaut-robot.png';
import { speakBatch6, astronautClueNarration } from '../../data/batch6Narration.js';

const copy={starter:'Space science: observe the Sun, Moon and Mars; learn simple tools.',growing:'Mission engineering: protect and power a spacecraft.',challenge:'Review missions: use evidence to plan a space mission.'};
const chapterNames={starter:'Space science',growing:'Mission engineering',challenge:'Review missions'};
const MissionClueVisual=({missionId})=>{
  if(missionId==='earth-rotation')return <svg className="mx-auto mt-3 block w-full max-w-64" viewBox="0 0 240 112" role="img" aria-label="A lamp shines on a globe. One side is bright and one side is dark; an arrow curves around the globe.">
    <defs><clipPath id="day-night-globe"><circle cx="126" cy="57" r="35"/></clipPath><marker id="day-night-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7z" fill="#4338ca"/></marker></defs>
    <circle cx="39" cy="57" r="20" fill="#facc15" stroke="#ca8a04" strokeWidth="2"/><path d="M39 24v-9M39 99v-9M6 57h-5M77 57h-5M16 34l-7-7M69 81l-7-7M62 34l7-7M9 81l7-7" stroke="#ca8a04" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="126" cy="57" r="35" fill="#2563eb"/><g clipPath="url(#day-night-globe)"><path d="M126 22h40v70h-40z" fill="#172554"/><path d="M103 45l14-8 7 9-6 6 7 5-12 7-8-7zM130 67l12-6 8 9-8 7-11-3z" fill="#65a30d"/></g><circle cx="126" cy="57" r="35" fill="none" stroke="#1e3a8a" strokeWidth="2"/>
    <path d="M101 20a46 46 0 0 1 61 10" fill="none" stroke="#4338ca" strokeWidth="3" markerEnd="url(#day-night-arrow)"/><text x="126" y="105" textAnchor="middle" fontSize="12" fill="#334155">daylight and darkness</text>
  </svg>;
  if(missionId==='venus-rotation')return <svg className="mx-auto mt-3 block w-full max-w-72" viewBox="0 0 280 116" role="img" aria-label="Two labeled planets with curved arrows to compare their turning directions.">
    <defs><marker id="planet-turn-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7z" fill="#4338ca"/></marker><marker id="venus-turn-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7z" fill="#c2410c"/></marker></defs>
    <circle cx="76" cy="49" r="22" fill="#60a5fa" stroke="#1e40af" strokeWidth="2"/><path d="M52 37a31 31 0 0 1 47 3" fill="none" stroke="#4338ca" strokeWidth="3" markerEnd="url(#planet-turn-arrow)"/>
    <circle cx="204" cy="49" r="22" fill="#fbbf24" stroke="#b45309" strokeWidth="2"/><path d="M228 37a31 31 0 0 0-47 3" fill="none" stroke="#c2410c" strokeWidth="3" markerEnd="url(#venus-turn-arrow)"/>
    <text x="76" y="91" textAnchor="middle" fontSize="12" fill="#334155">Most planets</text><text x="204" y="91" textAnchor="middle" fontSize="12" fill="#334155">Venus</text><text x="140" y="110" textAnchor="middle" fontSize="11" fill="#475569">Compare the arrows</text>
  </svg>;
  return null;
};
const getMissionPool=(chapter,playerId)=>{
  const base=ASTRONAUT_MISSIONS[chapter].filter(validateAstronautMission);
  const progress=readBatch6Progress('astronaut',playerId);
  const all=Object.values(ASTRONAUT_MISSIONS).flat().filter(validateAstronautMission);
  const missed=new Set(progress.missed||[]);
  const reviews=[...missed].map((id)=>all.find((item)=>item.id===id)).filter(Boolean).map((item)=>({...item,id:`review-${item.id}`,review:true,signature:item.id}));
  return [...base.filter((item)=>!missed.has(item.id)),...reviews];
};
const AstronautAcademy=(props)=>!props.littleMode?<AstronautAcademyAmari {...props}/>:<AstronautAcademyAskia {...props}/>;
const AstronautAcademyAmari=(props)=>{
  const {playerId,onGameEvent,onCelebrate,speak,playSfx,onBack,cancelNarration,soundOn,onToggleSound,onPhaseChange}=props;
  const journey=useBatch6Journey({gameId:'astronaut',playerId,onGameEvent,onCelebrate,speak,playSfx,onBack,cancelNarration,onPhaseChange});
  const [wrong,setWrong]=useState(false);
  const [hinted,setHinted]=useState(false);
  const [passport,setPassport]=useState(false);
  const band=BATCH6_BANDS.find((item)=>item.id===journey.chapter);
  const mission=journey.run?.queue[journey.run.index];
  const feedback=journey.run?.feedback;
  // Clear question-local feedback and the one-use clue on Next.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(()=>{setWrong(false);setHinted(false);},[journey.run?.index,journey.chapter]);
  useEffect(()=>{if(mission&&!feedback)speakBatch6(speak,mission.q);},[mission,feedback,speak]);
  const answer=(choice)=>{
    if(!mission||feedback)return;
    const correct=choice===mission.answer;
    journey.markAttempt(mission,correct);
    if(correct){
      setWrong(false);
      const prefix=mission.review?'You remembered this from before. ':'';
      if(mission.review)journey.resolveMissed(mission.id.replace(/^review-/,''));
      journey.reveal(mission,true,`${prefix}You matched the question to a mission fact.`,mission.fact,choice);
      speakBatch6(speak,`${prefix}${mission.fact}`);
    }else{
      journey.addMissed(mission.review?mission.id.replace(/^review-/,''):mission.id);
      setWrong(true);
      speakBatch6(speak,'Good try. Use the picture clues, then try another answer.');
    }
  };
  const hint=()=>{if(hinted||feedback)return;setHinted(true);journey.hint('clue');speakBatch6(speak,astronautClueNarration(mission));};
  const start=(id)=>journey.start(id,getMissionPool(id,playerId),6);
  return <><Batch6BaseCss/><Batch6Chrome title="Astronaut Academy" subtitle={band?chapterNames[band.id]:'Mission control'} onBack={journey.back} soundOn={soundOn} onToggleSound={onToggleSound} leaveOpen={journey.leaveOpen} onLeave={journey.leave} onKeep={journey.keep} illustration={<img src={astronautRobotArt} alt="" className="batch6-hero-art" />} progress={mission&&!feedback?.complete?{current:journey.run.index+1,total:journey.run.queue.length}:null} onReplay={mission&&!feedback?()=>{cancelNarration?.();speakBatch6(speak,mission.q);}:undefined} saveFailed={journey.run?.feedback?.saveFailed}>
    {!journey.run&&!passport&&<><ChapterMap title="Mission map" chapters={BATCH6_BANDS.map((item)=>({...item,name:chapterNames[item.id],subtitle:copy[item.id]}))} completed={journey.progress.completed} bestStars={journey.progress.bestStars} onStart={start} onBack={onBack}/><div className="batch6-actions"><button className="batch6-secondary" onClick={()=>setPassport(true)}>Open discovery passport ({journey.progress.facts.length} facts)</button></div></>}
    {passport&&!journey.run&&<section className="batch6-card"><h2 className="batch6-question">Discovery passport</h2><p className="text-center text-slate-700">Facts stay here after you leave and return.</p>{journey.progress.facts.length?journey.progress.facts.map((fact,index)=><FactPanel key={`${fact}-${index}`} fact={fact} explanation="A discovery from a completed mission."/>):<p className="mt-6 text-center">Complete a mission to collect your first fact card.</p>}<div className="batch6-actions"><button className="batch6-primary" onClick={()=>setPassport(false)}>Back to mission map</button></div></section>}
    {mission&&!feedback?.complete&&<section className="batch6-card"><div className="batch6-mission-icon" aria-hidden="true">{mission.icon}</div><p className="text-center"><span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-black text-indigo-900">{mission.review?'Review mission':mission.kind==='science'?'Space science':'Mission engineering'}</span></p><h2 className="batch6-question">{mission.q}</h2><div className="batch6-options">{mission.options.map((choice,index)=><button className="batch6-option" key={`${mission.id}-${index}`} onClick={()=>answer(choice)}>{choice}</button>)}</div>{wrong&&<p className="batch6-feedback text-amber-800" role="status">Good try. Use the clue and choose again. A missed idea can return in a later mission run.</p>}<div className="batch6-actions"><button className="batch6-secondary" disabled={hinted||Boolean(feedback)} onClick={hint}>Mission clue</button></div>{hinted&&!feedback&&<div className="batch6-feedback" role="status"><p>Mission clue: {mission.clue}</p><MissionClueVisual missionId={mission.id.replace(/^review-/,'')}/></div>}{feedback&&<><FactPanel explanation={feedback.explanation} fact={feedback.fact} source={mission.source}/><div className="batch6-actions"><button className="batch6-primary" onClick={journey.next}>Next mission</button></div></>}</section>}
    {journey.run?.feedback?.complete&&<section className="batch6-card text-center"><div className="text-5xl">🛰️</div><h2 className="batch6-question">Mission chapter complete!</h2><p className="text-2xl text-amber-600">{'★'.repeat(journey.run.feedback.stars)}{'☆'.repeat(3-journey.run.feedback.stars)}</p><p>Six missions completed. Your fact cards are saved in the passport.</p><FactPanel explanation="You observed space and designed ways for explorers to travel safely." fact="Each mission began with a question and ended with a discovery."/><div className="batch6-actions"><button className="batch6-primary" onClick={journey.toMap}>Mission map</button><button className="batch6-secondary" onClick={()=>start(journey.chapter)}>Play again</button><button className="batch6-secondary" onClick={()=>{journey.toMap();setPassport(true);}}>Open passport</button></div></section>}
  </Batch6Chrome></>;
};
export default AstronautAcademy;
