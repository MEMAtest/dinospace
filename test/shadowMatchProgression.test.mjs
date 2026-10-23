import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { LITTLE_LEVELS } from '../src/data/littleGames.js';
import { getOfflineVoiceClip } from '../src/data/offlineVoice.js';
import { SHADOW_DINO_KINDS, SHADOW_DINO_NAMES, SHADOW_FACTS, createShadowTargetQueue, makeShadowChoices, shadowSimilarKinds, shadowSpokenLine } from '../src/data/shadowMatchProgression.js';
const randomFor = seed => () => { seed = (Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296; };
test('Shadow Match grows its own roster through 3,6,8,10,12 without changing other games',()=>{
 assert.equal(SHADOW_DINO_KINDS.length,12);assert.equal(new Set(SHADOW_DINO_KINDS).size,12);
 assert.deepEqual(LITTLE_LEVELS.shadowmatch.map(c=>c.kinds),[3,6,8,10,12]);
 assert.deepEqual(LITTLE_LEVELS.shadowmatch.map(c=>Math.max(...c.choices)),[2,3,4,4,6]);
 assert.equal(LITTLE_LEVELS.shadowmatch.at(-1).mirror,true);
});
test('new creatures are targets in each run and target queues avoid boundary repeats',()=>{
 for(let seed=1;seed<=200;seed++)for(const config of LITTLE_LEVELS.shadowmatch){
  const kinds=SHADOW_DINO_KINDS.slice(0,config.kinds);const previous=kinds[0];const queue=createShadowTargetQueue(config,previous,randomFor(seed));
  assert.equal(queue.length,config.choices.length);assert.notEqual(queue[0],previous);
  for(const kind of kinds.slice(config.previousKinds))assert.ok(queue.includes(kind),kind);
  for(let i=1;i<queue.length;i++)assert.notEqual(queue[i],queue[i-1]);
  assert.equal(new Set(queue.slice(0,Math.min(kinds.length,queue.length))).size,Math.min(kinds.length,queue.length));
 }
});
test('each choice set contains the exact target once and later levels include a similar silhouette',()=>{
 for(let seed=1;seed<=100;seed++)for(const config of LITTLE_LEVELS.shadowmatch)for(const target of SHADOW_DINO_KINDS.slice(0,config.kinds))for(const count of new Set(config.choices)){
  const kinds=SHADOW_DINO_KINDS.slice(0,config.kinds);const options=makeShadowChoices(target,kinds,count,config.similar,randomFor(seed));
  assert.equal(options.length,count);assert.equal(new Set(options).size,count);assert.equal(options.filter(k=>k===target).length,1);
  if(config.similar&&shadowSimilarKinds(target,kinds).length)assert.ok(options.some(k=>shadowSimilarKinds(target,kinds).includes(k)));
 }
});
test('every creature has clear content and an existing physical packaged recording',()=>{
 for(const kind of SHADOW_DINO_KINDS){assert.ok(SHADOW_DINO_NAMES[kind]);assert.ok(SHADOW_FACTS[kind]);const clip=getOfflineVoiceClip(shadowSpokenLine(kind));assert.ok(clip,kind);assert.ok(existsSync('public'+clip),kind);}
 assert.match(SHADOW_FACTS.ptero,/not a dinosaur/);
});
test('the final new species get genuinely close alternatives, not just unrelated shapes',()=>{
 for(let seed=1;seed<=100;seed++){
  assert.ok(makeShadowChoices('cory',SHADOW_DINO_KINDS,6,true,randomFor(seed)).includes('para'));
  assert.ok(makeShadowChoices('carno',SHADOW_DINO_KINDS,6,true,randomFor(seed)).some(kind=>kind==='allo'||kind==='trex'));
 }
});
