export const MISSIONS = [
 {id:'first-route',title:'1 · Reach the flag',skill:'Sequence',prompt:'Build a program to move the rover to the flag.',tip:'Put Forward blocks in order, then Step through them one at a time.',start:{x:0,y:2,direction:1},goal:{x:3,y:2},initial:[]},
 {id:'debug-turn',title:'2 · Fix the wrong turn',skill:'Debug',prompt:'This program turns too soon. Try it, find the mistake, then edit it.',tip:'Watch where block 2 turns. The flag is two squares north of the start.',start:{x:0,y:4,direction:0},goal:{x:2,y:2},initial:['forward','right','forward','forward']},
 {id:'repeat-rescue',title:'3 · Collect the sample',skill:'Repeat',prompt:'Reach the sample, collect it, and use a Repeat block to shorten your program.',tip:'Three Forward steps can be replaced by one Repeat 3 × Forward block.',start:{x:0,y:4,direction:0},goal:{x:3,y:1},sample:{x:3,y:1},repeat:true,initial:[]},
];
export const BLOCKS = {forward:'↑ Forward',left:'↶ Turn left',right:'↷ Turn right',collect:'◆ Collect',repeat3:'3 × Forward'};
export function expandProgram(program){
 if(!Array.isArray(program)||program.length>24||program.some(p=>!Object.hasOwn(BLOCKS,p)))throw new Error('Choose up to 24 instruction blocks.');
 return program.flatMap((op,block)=>op==='repeat3'?Array.from({length:3},()=>({op:'forward',block})): [{op,block}]);
}
export function startRover(mission){return {...mission.start,collected:false,trail:[`${mission.start.x},${mission.start.y}`]};}
export function advanceRover(state,instruction,mission){
 const next={...state,trail:[...state.trail]};
 if(instruction.op==='left')next.direction=(state.direction+3)%4;
 if(instruction.op==='right')next.direction=(state.direction+1)%4;
 if(instruction.op==='collect'){
  if(!mission.sample||next.x!==mission.sample.x||next.y!==mission.sample.y)return {state:next,error:'The sample is on the diamond square. Move there before Collect.'};
  next.collected=true;
 }
 if(instruction.op==='forward'){
  const [dx,dy]=[[0,-1],[1,0],[0,1],[-1,0]][next.direction];
  if(next.x+dx<0||next.x+dx>4||next.y+dy<0||next.y+dy>4)return {state:next,error:`Block ${instruction.block+1} would leave the training area. Try a turn or remove a Forward.`};
  next.x+=dx;next.y+=dy;next.trail.push(`${next.x},${next.y}`);
 }
 return {state:next};
}
export function judgeRover(state,mission,program){
 if(state.x!==mission.goal.x||state.y!==mission.goal.y)return {complete:false,message:'The rover stopped before reaching the flag. Step through your program and check each move.'};
 if(mission.sample&&!state.collected)return {complete:false,message:'You reached the sample. Add Collect after arriving on the diamond square.'};
 if(mission.repeat&&!program.includes('repeat3'))return {complete:false,message:'Your route works! Now replace three Forward steps with Repeat 3 × Forward.'};
 return {complete:true,message:mission.repeat?'Mission complete! Repeat ran the same move three times using one block.':mission.id==='debug-turn'?'Mission complete! Moving the turn changed the route. You debugged a program.':'Mission complete! The rover followed your instructions in order.'};
}
