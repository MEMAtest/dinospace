import test from 'node:test';import assert from 'node:assert/strict';
import { MISSIONS,expandProgram,startRover,advanceRover,judgeRover } from '../src/rehearsal/rover.js';
import { saveProject,loadProject } from '../src/rehearsal/storage.js';
const run=(i,program)=>{let state=startRover(MISSIONS[i]);for(const instruction of expandProgram(program)){const result=advanceRover(state,instruction,MISSIONS[i]);if(result.error)return result;state=result.state;}return {state,...judgeRover(state,MISSIONS[i],program)};};
test('child programs solve the three distinct missions; the supplied bug fails before a real edit',()=>{
 assert.equal(run(0,['forward','forward','forward']).complete,true);
 assert.equal(run(1,MISSIONS[1].initial).complete,false);
 assert.equal(run(1,['forward','forward','right','forward','forward']).complete,true);
 assert.equal(run(2,['repeat3','right','repeat3','collect']).complete,true);
 assert.equal(run(2,['repeat3','right','repeat3']).complete,false);
 assert.equal(run(2,['forward','forward','forward','right','forward','forward','forward','collect']).complete,false);
});
test('repeat semantics match three ordinary moves, with block tracing; boundaries and commands are bounded',()=>{
 const a=run(0,['repeat3']),b=run(0,['forward','forward','forward']);assert.deepEqual(a.state,b.state);
 assert.deepEqual(expandProgram(['repeat3']).map(i=>i.block),[0,0,0]);
 assert.match(run(0,Array(6).fill('forward')).error,/leave the training area/);
 assert.throws(()=>expandProgram(Array(25).fill('forward')));assert.throws(()=>expandProgram(['eval']));
});
test('saved work is child-scoped, versioned and failure-aware',()=>{
 const memory=new Map(),storage={setItem:(k,v)=>memory.set(k,v),getItem:k=>memory.get(k)};
 const project={title:'My mission',program:['forward'],missionIndex:0};assert.equal(saveProject('amari','code',project,storage),true);
 assert.equal(loadProject('guest','code',storage),null);assert.equal(loadProject('amari','writing',storage),null);
 assert.deepEqual(loadProject('amari','code',storage),{...project,version:1});
 assert.equal(saveProject('amari','code',project,{setItem(){throw Error('full');}}),false);
 assert.equal(loadProject('amari','code',{getItem(){return '{bad';}}),null);
});
