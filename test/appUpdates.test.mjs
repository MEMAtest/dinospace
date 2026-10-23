import test from 'node:test';
import assert from 'node:assert/strict';
import { moduleEntryFromHtml, observeAppRelease } from '../src/appUpdates.js';

const tick = () => new Promise(resolve => setImmediate(resolve));
const html = name => `<script type="module" crossorigin src="/assets/${name}.js"></script>`;
const environment = fetchHtml => {
  const win = new EventTarget(); let poll; let cleared = false;
  win.setInterval = callback => { poll = callback; return 17; };
  win.clearInterval = id => { assert.equal(id, 17); cleared = true; };
  const doc = new EventTarget();doc.visibilityState = 'visible';let notices = 0;
  const stop = observeAppRelease({ currentEntry: '/assets/current.js', baseUrl: 'https://example.test/#/home', windowTarget: win, documentTarget: doc, fetchHtml, onUpdate: () => notices++ });
  return { win, doc, stop, poll: () => poll(), count: () => notices, cleared: () => cleared };
};

test('entry extraction ignores images, inline and non-module scripts and handles attribute order', () => {
  assert.equal(moduleEntryFromHtml('<img src="old.png"><script src="legacy.js"></script>'+html('current')), '/assets/current.js');
  assert.equal(moduleEntryFromHtml("<script src='new.js' type='module'></script>"), 'new.js');
  assert.equal(moduleEntryFromHtml('<script type="module">console.log(1)</script>'), null);
});

test('same release is quiet; a new release notifies once without reloading or changing data', async () => {
  let body = html('current');const calls=[];
  const env = environment(async (url, options) => { calls.push({url,options});return {ok:true,text:async()=>body}; });
  await tick();assert.equal(env.count(),0);body=html('next');env.win.dispatchEvent(new Event('focus'));await tick();assert.equal(env.count(),1);
  env.poll();env.win.dispatchEvent(new Event('focus'));await tick();assert.equal(env.count(),1);assert.equal(calls.length,2);
  assert.equal(calls[0].url,'https://example.test/index.html');assert.equal(calls[0].options.cache,'no-store');env.stop();assert.equal(env.cleared(),true);
});

test('hidden tabs wait for visibility and disposed in-flight checks never notify', async () => {
  let finish;const env=environment(()=>new Promise(resolve=>{finish=resolve}));env.doc.visibilityState='hidden';env.poll();env.stop();finish({ok:true,text:async()=>html('next')});await tick();assert.equal(env.count(),0);
  let calls=0;const hiddenWin=new EventTarget();hiddenWin.setInterval=()=>1;hiddenWin.clearInterval=()=>{};const doc=new EventTarget();doc.visibilityState='hidden';let notices=0;
  const stop=observeAppRelease({currentEntry:'/assets/current.js',baseUrl:'https://example.test/',windowTarget:hiddenWin,documentTarget:doc,fetchHtml:async()=>{calls++;return{ok:true,text:async()=>html('next')}},onUpdate:()=>notices++});await tick();assert.equal(calls,0);doc.visibilityState='visible';doc.dispatchEvent(new Event('visibilitychange'));await tick();assert.equal(notices,1);stop();
});

test('network failures, invalid HTML and cross-origin entries cannot trigger a false update', async () => {
  const values=[new Error('offline'),'', '<script type="module" src="https://elsewhere.test/app.js"></script>'];let index=0;
  const env=environment(async()=>{const value=values[index++];if(value instanceof Error)throw value;return{ok:true,text:async()=>value}});await tick();await env.poll();await env.poll();assert.equal(env.count(),0);env.stop();
});
