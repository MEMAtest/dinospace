import { useEffect, useRef, useState } from 'react';
import { MISSIONS, BLOCKS, expandProgram, startRover, advanceRover, judgeRover } from './rover.js';
import { loadProject, saveProject } from './storage.js';

export default function CodeCadets({ player, registerDirty }) {
 const saved=useRef(loadProject(player,'code'));
 const [missionIndex,setMissionIndex]=useState(0),mission=MISSIONS[missionIndex];
 const [program,setProgram]=useState(MISSIONS[0].initial),[history,setHistory]=useState([]);
 const [rover,setRover]=useState(()=>startRover(MISSIONS[0]));
 const [running,setRunning]=useState(false),[active,setActive]=useState(-1),[message,setMessage]=useState('Choose blocks, predict the route, then press Run or Step.');
 const [title,setTitle]=useState('My rover mission'),[dirty,setDirty]=useState(false),[status,setStatus]=useState(saved.current?'A saved program is ready to open.':'Not saved yet.'),[tip,setTip]=useState(false);
 const stageRef=useRef(null);
 const timer=useRef(null),execution=useRef({step:0,state:startRover(mission)});
 const stop=()=>{clearTimeout(timer.current);setRunning(false);};
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 useEffect(()=>{registerDirty(()=>dirty);return()=>registerDirty(null);},[dirty,registerDirty]);
 useEffect(()=>{const f=e=>{if(dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',f);return()=>window.removeEventListener('beforeunload',f);},[dirty]);
 const reset=()=>{stop();const state=startRover(mission);execution.current={step:0,state};setRover(state);setActive(-1);};
 const edit=next=>{reset();setHistory(h=>[...h.slice(-49),program]);setProgram(next);setDirty(true);setMessage('Program changed. Predict what will happen, then try it.');};
 const selectMission=index=>{
  if(dirty&&!window.confirm('This program has unsaved changes. Switch missions without saving?'))return;
  stop();const state=startRover(MISSIONS[index]);setMissionIndex(index);setProgram([...MISSIONS[index].initial]);setRover(state);execution.current={step:0,state};setActive(-1);setHistory([]);setDirty(false);setTip(false);setMessage('Build or repair the program, then test your idea.');
 };
 const executeOne=()=>{
  const instructions=expandProgram(program);const current=execution.current;
  if(current.step>=instructions.length)return true;
  const instruction=instructions[current.step];setActive(instruction.block);
  const result=advanceRover(current.state,instruction,mission);execution.current={step:current.step+1,state:result.state};setRover(result.state);
  if(result.error){setMessage(result.error);setRunning(false);return true;}
  if(execution.current.step===instructions.length){setMessage(judgeRover(result.state,mission,program).message);setRunning(false);return true;}
  setMessage(`Running block ${instruction.block+1}: ${BLOCKS[program[instruction.block]]}.`);return false;
 };
 const run=()=>{
  if(!program.length){setMessage('Add an instruction first.');return;}
  reset();if(window.innerWidth<800)stageRef.current?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});setRunning(true);const tick=()=>{if(!executeOne())timer.current=setTimeout(tick,650);};timer.current=setTimeout(tick,100);
 };
 const step=()=>{
  if(!program.length){setMessage('Add an instruction first.');return;}
  if(execution.current.step>=expandProgram(program).length){const state=startRover(mission);execution.current={step:0,state};}
  executeOne();
 };
 const save=()=>{
  const ok=saveProject(player,'code',{title,missionIndex,program});
  setStatus(ok?'Program saved on this device.':'Could not save. Keep this page open and try again.');if(ok){saved.current={title,missionIndex,program};setDirty(false);}
 };
 const open=()=>{
  const value=loadProject(player,'code');if(!value){setStatus('No saved program for this explorer.');return;}
  if(dirty&&!window.confirm('Open the saved program and replace these unsaved changes?'))return;
  try{expandProgram(value.program);if(!MISSIONS[value.missionIndex])throw Error();}catch{setStatus('This saved program could not be opened.');return;}
  stop();setTitle(value.title);setMissionIndex(value.missionIndex);setProgram(value.program);setHistory([]);const state=startRover(MISSIONS[value.missionIndex]);execution.current={step:0,state};setRover(state);setActive(-1);setDirty(false);setStatus('Saved program opened.');
 };
 return <section aria-labelledby="code-title">
  <div className="section-heading"><div><p className="eyebrow">Think · Build · Test · Improve</p><h1 id="code-title">Code Cadets</h1></div><div className="skill-pill">{mission.skill}</div></div>
  <nav className="mission-tabs" aria-label="Coding missions">{MISSIONS.map((m,i)=><button key={m.id} aria-current={i===missionIndex?'step':undefined} onClick={()=>selectMission(i)}>{m.title}</button>)}</nav>
  <p className="mission-prompt">{mission.prompt}</p>
  <div className="code-layout"><div ref={stageRef} className="panel stage-panel">
   <div className="rover-grid" role="img" aria-label={`Rover at column ${rover.x+1}, row ${rover.y+1}, facing ${['north','east','south','west'][rover.direction]}. Flag at column ${mission.goal.x+1}, row ${mission.goal.y+1}.`}>
    {Array.from({length:25},(_,i)=>{const x=i%5,y=Math.floor(i/5),here=rover.x===x&&rover.y===y,goal=mission.goal.x===x&&mission.goal.y===y,sample=mission.sample?.x===x&&mission.sample?.y===y;
     return <div key={i} className={`grid-square ${rover.trail.includes(`${x},${y}`)?'visited':''}`} aria-hidden="true"><span className="square-coord">{x+1},{y+1}</span>{goal&&<span className="flag">⚑</span>}{sample&&!rover.collected&&<span className="sample">◆</span>}{here&&<span className="rover" style={{transform:`rotate(${rover.direction*90}deg)`}}>▲</span>}</div>;})}
   </div>
   <p className="stage-caption">▲ Rover · ⚑ Finish · ◆ Rock sample {rover.collected?'· Sample collected!':''}</p>
   <p role="status" className="feedback">{message}</p>
   <div className="toolbar"><button className="primary" onClick={run} disabled={running}>▶ Run</button><button onClick={step} disabled={running}>Step</button><button onClick={()=>{stop();setMessage('Stopped. Your program is still here. Run starts again from the base.');}} disabled={!running}>Stop</button><button onClick={()=>{reset();setMessage('Rover back at the start. Your program is unchanged.');}}>Reset rover</button></div>
   <button className="text-button" onClick={()=>setTip(!tip)} aria-expanded={tip}>Need a clue?</button>{tip&&<p className="tip">{mission.tip}</p>}
  </div><div className="panel program-panel">
   <h2>Your program</h2><p>Tap a block to add it. The rover reads from top to bottom.</p>
   <div className="block-palette">{Object.entries(BLOCKS).map(([op,label])=><button key={op} className={`block block-${op}`} disabled={running||program.length>=24} onClick={()=>edit([...program,op])}>Add {label}</button>)}</div>
   <ol className="program-list" aria-label="Instruction sequence">{program.map((op,i)=><li key={i} className={active===i?'active-block':''}><strong>{BLOCKS[op]}</strong><div><button aria-label={`Move block ${i+1} earlier`} disabled={running||i===0} onClick={()=>{const p=[...program];[p[i-1],p[i]]=[p[i],p[i-1]];edit(p);}}>↑</button><button aria-label={`Move block ${i+1} later`} disabled={running||i===program.length-1} onClick={()=>{const p=[...program];[p[i+1],p[i]]=[p[i],p[i+1]];edit(p);}}>↓</button><button aria-label={`Remove block ${i+1}`} disabled={running} onClick={()=>edit(program.filter((_,j)=>j!==i))}>×</button></div></li>)}</ol>
   {!program.length&&<p className="empty-state">Your first instruction goes here.</p>}
   <div className="toolbar"><button disabled={running||!history.length} onClick={()=>{reset();setProgram(history.at(-1));setHistory(h=>h.slice(0,-1));setDirty(true);}}>Undo edit</button><button disabled={running||!program.length} onClick={()=>edit([])}>Clear blocks</button></div>
   <button className="primary" disabled={running} onClick={run}>Run program</button><label className="field-label">Program name<input value={title} maxLength={60} onChange={e=>{setTitle(e.target.value);setDirty(true);}}/></label>
   <div className="toolbar"><button onClick={save}>Save program</button><button onClick={open}>Open saved program</button></div><p role="status" className="save-status">{status}{dirty?' · Unsaved changes':''}</p>
  </div></div>
 </section>;
}
