import test from 'node:test';
import assert from 'node:assert/strict';
import { clockAngles, createTimeRun, createNumberLineRun, isValidTimeRun, isValidNumberLineRun, timeLabel } from '../src/data/timeLineAdventure.js';
import { getTimeLineProgress, normalizeTimeLineProgress, rememberTimeLineRun, saveTimeLineRun, timeLineProgressKey } from '../src/data/timeLineProgress.js';

const store=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),set:(k,v)=>m.set(k,v)};};
test('clock angle and label model covers all 48 allowed hour/minute pairs and twelve-hour wrap',()=>{
 for(const minute of [0,15,30,45]) for(let hour=1;hour<=12;hour++) { const time={hour,minute}; const angle=clockAngles(time); assert.equal(angle.hour,(hour%12)*30+minute*.5);assert.equal(angle.minute,minute*6);assert.ok(timeLabel(time).length>0); }
 assert.equal(timeLabel({hour:12,minute:45}),'quarter to 1');assert.equal(timeLabel({hour:11,minute:45}),'quarter to 12');assert.equal(clockAngles({hour:12,minute:30}).hour,15);
});
test('seeded clock missions stay distinct, have one unique valid answer and set/read models',()=>{
 for(let chapter=0;chapter<3;chapter++)for(let seed=1;seed<=50;seed++){const run=createTimeRun({chapter,seed});assert.equal(isValidTimeRun(run,chapter),true);assert.equal(new Set(run.map(q=>q.id)).size,6);for(const q of run){assert.ok(q.explanation);if(q.type==='read'){assert.equal(new Set(q.options.map(timeLabel)).size,4);assert.equal(q.options.filter(t=>t.hour===q.target.hour&&t.minute===q.target.minute).length,1);}else assert.equal(q.type,'set');}}
 assert.deepEqual(createTimeRun({chapter:2,seed:14}),createTimeRun({chapter:2,seed:14}));assert.notDeepEqual(createTimeRun({chapter:2,seed:14}),createTimeRun({chapter:2,seed:15}));
});
test('number line missions keep equations, hops, landings, comparisons and answer choices aligned',()=>{
 for(let chapter=0;chapter<3;chapter++)for(let seed=1;seed<=80;seed++){const run=createNumberLineRun({chapter,seed});assert.equal(isValidNumberLineRun(run,chapter),true);assert.equal(new Set(run.map(q=>q.id)).size,6);for(const q of run){assert.ok(q.options.includes(q.answer));if(q.type==='hop')assert.equal(q.a+q.direction*q.b,q.answer);if(q.type==='missing')assert.equal(q.start+q.hops,q.end);if(q.type==='compare'){assert.equal(q.start1+q.hops1,q.end1);assert.equal(q.start2+q.hops2,q.end2);}}}
 assert.deepEqual(createNumberLineRun({chapter:1,seed:12}),createNumberLineRun({chapter:1,seed:12}));assert.notDeepEqual(createNumberLineRun({chapter:1,seed:12}),createNumberLineRun({chapter:1,seed:13}));
});
test('time and number line progress is child scoped, contiguous, rejects corruption, orphaned and future credit',()=>{
 const storage=store();const t0=createTimeRun({chapter:0,seed:3});assert.equal(saveTimeLineRun('timeteller','a',1,createTimeRun({chapter:1,seed:2}),3,storage),null);const saved=saveTimeLineRun('timeteller','a',0,t0,3,storage);assert.equal(saved.awardedStars,3);assert.equal(saved.progress.unlockedChapter,1);assert.equal(saveTimeLineRun('timeteller','a',0,t0,2,storage).awardedStars,0);assert.equal(getTimeLineProgress('timeteller','b',storage).completedChapterIds.length,0);
 const n0=createNumberLineRun({chapter:0,seed:4});assert.equal(saveTimeLineRun('numberline','a',0,n0,2,storage).awardedStars,2);assert.equal(getTimeLineProgress('numberline','a',storage).unlockedChapter,1);
 storage.set(timeLineProgressKey('timeteller','bad'),JSON.stringify({version:1,completedChapterIds:['daily-routines'],bestStars:{'daily-routines':3},unlockedChapter:99,recentQuestionIds:{8:['orphan']}}));const clean=getTimeLineProgress('timeteller','bad',storage);assert.deepEqual(clean.completedChapterIds,[]);assert.deepEqual(clean.bestStars,{});assert.equal(clean.unlockedChapter,0);assert.deepEqual(clean.recentQuestionIds,{});
 assert.equal(saveTimeLineRun('numberline','a',0,[...n0.slice(0,5),{...n0[5],options:[1,1,2]}],1,storage),null);
 assert.equal(saveTimeLineRun('numberline','a',0,[...n0.slice(0,5),{...n0[5],id:'made-up',answer:200}],1,storage),null);
 assert.equal(normalizeTimeLineProgress({version:1,completedChapterIds:['daily-routines','past-and-to'],bestStars:{'daily-routines':2,'past-and-to':3}},'timeteller').completedChapterIds.length,0);
 storage.set(timeLineProgressKey('numberline','recent-bad'),JSON.stringify({version:1,completedChapterIds:[],recentQuestionIds:{0:['invented','hop:99:1:9','hop:2:1:3']}}));assert.deepEqual(getTimeLineProgress('numberline','recent-bad',storage).recentQuestionIds,{0:['hop:2:1:3']});
 const storedRun=createNumberLineRun({chapter:0,seed:987});rememberTimeLineRun('numberline','abandoned',0,storedRun,storage);assert.equal(getTimeLineProgress('numberline','abandoned',storage).recentQuestionIds[0].length,6);
 const invalidTime=createTimeRun({chapter:0,seed:14});assert.equal(isValidTimeRun([...invalidTime.slice(0,5),{...invalidTime[5],target:{hour:13,minute:0}}],0),false);
 const invalidOptions=createTimeRun({chapter:1,seed:17});assert.equal(isValidTimeRun([...invalidOptions.slice(0,5),{...invalidOptions[5],options:[...invalidOptions[5].options.slice(0,3),{hour:13,minute:90}]}],1),false);
});
