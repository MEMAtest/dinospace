async page => {
 const origin=QA_ORIGIN,width=VIEW_WIDTH,game=QA_GAME, guides=TRACE_GUIDES;
 const rows=[],errors=[],consoleErrors=[],providers=[],badAssets=[];
 page.setDefaultTimeout(12000);page.setDefaultNavigationTimeout(45000);
 await page.setViewportSize({width,height:900});
 await page.unroute('**/api/**');await page.route('**/api/**',r=>{providers.push(r.request().url());return r.fulfill({status:403,body:'Synthetic tracing/tactics guard'})});
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});page.on('response',r=>{if(r.status()>=400&&/\/(art|audio)\//.test(r.url()))badAssets.push({url:r.url(),status:r.status()})});
 await page.addInitScript(()=>{if(window.__ttAudioInstalled)return;window.__ttAudioInstalled=true;window.__ttAudio=[];const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(...args){const row={src:this.src,playing:false,element:this};this.addEventListener('playing',()=>row.playing=true,{once:true});window.__ttAudio.push(row);return play.apply(this,args)}});
 const root=origin+'/?trace-tactics-qa='+Date.now();
 await page.goto(root+'#/');await page.getByRole('button',{name:/Age 6\+.*Amari/}).click();const entry=await page.locator('script[type=module][src]').getAttribute('src');if(entry!==QA_EXPECTED_ENTRY)throw Error('Stale app entry '+entry);
 const store=key=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),key);
 const before=await store(game==='trace'?'amari_letter_trace_progress_v1':'amari_cosmic_tactics_v1');
 const world=game==='trace'?'read-write':'thinking';
 const enter=async()=>{await page.goto(root+'#/world/'+world);await page.getByRole('button').filter({has:page.getByRole('heading',{name:game==='trace'?'Letter Trace':'Cosmic Tic-Tac-Toe',exact:true})}).click();await page.getByRole('heading',{name:game==='trace'?'Make letters come to life':'Think one move ahead',exact:true}).waitFor()};
 await enter();
 const sound=page.getByRole('button',{name:game==='trace'?'Sound off':'Turn sound on',exact:true});if(await sound.count())await sound.click();
 const layout=async()=>{await page.waitForFunction(()=>[...document.images].every(i=>i.complete));const s=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,badImages:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src)}));const small=await page.locator('main button:visible,main summary:visible').evaluateAll(es=>es.map(e=>({text:e.innerText,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})).filter(e=>e.w<48||e.h<48));if(s.overflow||s.badImages.length||small.length)throw Error('Layout '+JSON.stringify({s,small}));return s};
 const audio=async()=>{const n=await page.evaluate(()=>window.__ttAudio.length);await page.getByRole('button',{name:'Hear explanation',exact:true}).click();await page.waitForFunction(n=>window.__ttAudio.slice(n).some(r=>r.playing&&r.element.currentTime>.15),n);return page.evaluate(n=>window.__ttAudio.slice(n).filter(r=>r.playing).map(r=>({src:r.src,time:r.element.currentTime})),n)};
 const shot=async suffix=>{if(QA_SCREENSHOTS)await page.screenshot({path:'output/playwright/trace-tactics-'+game+'-'+width+suffix+'.jpg',type:'jpeg',quality:78,fullPage:true})};
 if(game==='trace'){
 const titles=['Follow the path','Big and little','Trace and read'];
 for(let level=0;level<3;level++){
  if(level===0){await page.getByRole('button',{name:titles[level],exact:true}).click();await page.getByRole('button',{name:'Start '+titles[level]+' →',exact:true}).click()}
  const seen=new Set(),cases=new Set();
  for(let round=0;round<8;round++){
   await page.locator('canvas').waitFor();const letter=await page.locator('main[data-trace-letter]').getAttribute('data-trace-letter');if(seen.has(letter.toLowerCase()))throw Error('Repeated letter');seen.add(letter.toLowerCase());cases.add(letter===letter.toUpperCase()?'upper':'lower');
   const canvas=page.locator('canvas');const normalized=guides[letter];if(!normalized)throw Error('No guide '+letter);
   const keyboard=round===1;
   let demo=null;
   if(round===0){
    await page.waitForTimeout(400);const rewards=await store('amari_rewards_v2');await page.getByRole('button',{name:'Watch this stroke',exact:true}).click();
    const centroid=()=>canvas.evaluate(c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height);let x=0,y=0,n=0;for(let i=0;i<d.data.length;i+=4)if(d.data[i]>230&&d.data[i+1]>70&&d.data[i+1]<150&&d.data[i+2]<60){x+=(i/4)%c.width;y+=Math.floor(i/4/c.width);n++}return n?{x:x/n,y:y/n}:null});
    await page.waitForTimeout(220);const a=await centroid();await page.waitForTimeout(520);const b=await centroid();if(!a||!b||Math.hypot(a.x-b.x,a.y-b.y)<8)throw Error('Demo did not visibly move');if(await page.getByRole('progressbar').getAttribute('aria-valuenow')!=='0')throw Error('Demo advanced trace');if(JSON.stringify(rewards)!==JSON.stringify(await store('amari_rewards_v2')))throw Error('Demo rewarded');demo={a,b};
    await shot('-guide');
   }
   await canvas.scrollIntoViewIfNeeded();let box=await canvas.boundingBox();const scale=Math.min(box.width,box.height)*.86,left=(box.width-scale)/2,top=(box.height-scale)/2+8;
   const points=stroke=>stroke.map(([x,y])=>({x:box.x+left+x*scale,y:box.y+top+y*scale}));
   if(round===0){ // An unfinished stroke and an off-path start must not pass.
    const p=points(normalized[0]);await page.mouse.move(p[0].x,p[0].y);await page.mouse.down();await page.mouse.move((p[0].x+p[1].x)/2,(p[0].y+p[1].y)/2);await page.mouse.up();
    if(await page.getByRole('progressbar').getAttribute('aria-valuenow')!=='0')throw Error('Interrupted stroke kept partial progress');
    await page.mouse.click(box.x+5,box.y+5);if(await page.getByRole('progressbar').getAttribute('aria-valuenow')!=='0')throw Error('Off-path accepted');
    if(width===390){const c=await page.context().newCDPSession(page);await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p[0],id:1}]});await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2,id:1}]});await c.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await c.send('Emulation.setTouchEmulationEnabled',{enabled:false});await c.detach();if(await page.getByRole('progressbar').getAttribute('aria-valuenow')!=='0'||!(await page.locator('main').innerText()).includes('Touch stopped.'))throw Error('Cancelled touch retained unfinished stroke')}

   }
   const masteryBefore=(await store('amari_letter_trace_progress_v1'))?.amari?.masteredLetters||[];
   if(keyboard){await page.getByText('More tracing tools',{exact:true}).click();await page.getByRole('button',{name:'Use keyboard',exact:true}).click();await canvas.focus();for(const stroke of normalized){await page.keyboard.press('Space');for(let j=1;j<stroke.length;j++)await page.keyboard.press('ArrowRight');await page.keyboard.press('Space')}await page.getByRole('button',{name:'Use touch or mouse',exact:true}).click();}
   else{
    let c=null;if(width===390){c=await page.context().newCDPSession(page);await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1})}
    for(const stroke of normalized){const p=points(stroke);if(c){await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p[0],id:1}]});for(let j=1;j<p.length;j++)await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...p[j],id:1}]});await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}else{await page.mouse.move(p[0].x,p[0].y);await page.mouse.down();for(let j=1;j<p.length;j++)await page.mouse.move(p[j].x,p[j].y,{steps:2});await page.mouse.up()}}
    if(c){await c.send('Emulation.setTouchEmulationEnabled',{enabled:false});await c.detach()}
   }
   const check=page.getByRole('button',{name:level===2?'Find the word →':'Check shape',exact:true});if(!await check.isEnabled())throw Error('Trace not ready '+letter+' '+await page.locator('main').innerText());await check.click();
   let word=null;if(level===2){if(await canvas.count())throw Error('Word step still has canvas');const choices=page.getByRole('region',{name:'Choose the word that starts with this sound'}).getByRole('button');const names=await choices.evaluateAll(es=>es.map(e=>e.getAttribute('aria-label')));word=names.find(w=>w[0].toLowerCase()===letter.toLowerCase());if(round===0){await page.getByRole('button',{name:names.find(w=>w!==word),exact:true}).click();if(await page.getByRole('region',{name:'Completed letter'}).count())throw Error('Wrong word passed')}await page.getByRole('button',{name:word,exact:true}).click()}
   await page.getByRole('region',{name:'Completed letter'}).waitFor();if(keyboard&&JSON.stringify(masteryBefore)!==JSON.stringify((await store('amari_letter_trace_progress_v1'))?.amari?.masteredLetters||[]))throw Error('Keyboard toggle granted handwriting mastery');
   const played=round===0?await audio():[];if(round===0){await page.waitForTimeout(350);if(await page.locator('main').getAttribute('data-trace-letter')!==letter)throw Error('Auto advanced');await layout()}
   if(round===7){const saved=await store('amari_letter_trace_progress_v1');if(!saved.amari.completedLevels.includes(level))throw Error('Not saved before Finish')}
   rows.push({level,round,letter,input:keyboard?'keyboard then pointer-toggle':width===390?'touch':'mouse',word,demo,dotStrokes:normalized.filter(s=>s.every(p=>p[0]===s[0][0]&&p[1]===s[0][1])).length,audio:played});if(level===0&&round===7){const earned=await store('amari_letter_trace_progress_v1');await page.reload();await page.getByRole('heading',{name:'Make letters come to life',exact:true}).waitFor();if(JSON.stringify(earned)!==JSON.stringify(await store('amari_letter_trace_progress_v1')))throw Error('Reload before Finish lost trace badge');continue}await page.getByRole('button',{name:round===7?'Finish chapter →':'Next letter →',exact:true}).click();
  }
  if(seen.size!==8||level===1&&cases.size!==2)throw Error('Chapter variety failed');
  if(level===0){await page.getByRole('button',{name:titles[1],exact:true}).click();await page.getByRole('button',{name:'Start '+titles[1]+' →',exact:true}).click()}else{await page.getByRole('heading',{name:titles[level]+' complete!',exact:true}).waitFor();if(level<2)await page.getByRole('button',{name:'Next chapter: '+titles[level+1]+' →',exact:true}).click()}
 }
 await shot('-complete');const saved=await store('amari_letter_trace_progress_v1');await page.reload();await page.getByRole('heading',{name:'Make letters come to life'}).waitFor();if(JSON.stringify(saved)!==JSON.stringify(await store('amari_letter_trace_progress_v1')))throw Error('Trace reload lost records');await page.getByRole('button',{name:'Back to learning world',exact:true}).click();if(!page.url().endsWith('#/world/read-write'))throw Error('Wrong trace parent');
 }else{
 const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
 const board=()=>page.getByRole('gridcell').evaluateAll(es=>es.map(e=>{const t=e.getAttribute('aria-label');return t.includes(', Dino')?'X':t.includes(', Rocket')?'O':null}));
 const wins=(b,m)=>lines.some(l=>l.every(i=>b[i]===m));
 const threats=(b,m)=>b.flatMap((v,i)=>{if(v)return[];const n=[...b];n[i]=m;return wins(n,m)?[i]:[]});
 const titles=['Make a line','Block the Rocket','Find a fork'];
 for(let level=0;level<3;level++){
  if(level===0)await page.getByRole('button',{name:/^Make a line, /}).click();const seen=new Set();
  for(let round=0;round<3;round++){
   await page.getByRole('grid').waitFor();const b=await board(),key=b.join('-');if(seen.has(key))throw Error('Repeated tactic board');seen.add(key);
   const valid=level===0?threats(b,'X'):level===1?threats(b,'O'):b.flatMap((v,i)=>{if(v)return[];const n=[...b];n[i]='X';return threats(n,'X').length>=2?[i]:[]});const target=valid[0];
   if(round===0){const wrong=b.findIndex((v,i)=>!v&&!valid.includes(i));await page.getByRole('gridcell').nth(wrong).click();if(JSON.stringify(await board())!==JSON.stringify(b))throw Error('Wrong move changed board');if(!await page.getByRole('gridcell').nth(target).isEnabled())throw Error('Wrong move froze retry');await shot('-task')}
   if(round===1){await page.getByRole('button',{name:'Show hint',exact:true}).click();if(await page.getByRole('button',{name:'Hint used',exact:true}).isEnabled())throw Error('Hint reusable');await page.getByRole('gridcell').nth(target).focus();await page.keyboard.press('Enter')}else await page.getByRole('gridcell').nth(target).click();
   await page.getByRole('region',{name:'Tactic explained'}).waitFor();if(!(await page.locator('main').innerText()).includes('Your move worked. Look at the highlighted board.'))throw Error('Solved board retained input instruction');const paths=await page.locator('[data-tactic-path]').count();if(paths!==(level===2?2:1))throw Error('Wrong explained path count');const played=round===0?await audio():[];
   if(round===0){await page.waitForTimeout(300);await layout();if(!await page.getByRole('region',{name:'Tactic explained'}).count())throw Error('Explanation disappeared');if(level===2)await shot('-fork')}
   if(round===2){const saved=await store('amari_cosmic_tactics_v1');if(saved.amari.completedMissionIds[level].length!==3)throw Error('Mission not saved before Finish')}
   rows.push({level,round,board:b,target,paths,audio:played});if(level===0&&round===2){const earned=await store('amari_cosmic_tactics_v1');await page.reload();await page.getByRole('heading',{name:'Think one move ahead',exact:true}).waitFor();if(JSON.stringify(earned)!==JSON.stringify(await store('amari_cosmic_tactics_v1')))throw Error('Reload before Finish lost tactics badge');continue}await page.getByRole('button',{name:round===2?'Finish chapter →':'Next tactic board →',exact:true}).click();
  }
  if(level===0)await page.getByRole('button',{name:/^Block the Rocket, /}).click();else{await page.getByRole('heading',{name:titles[level]+' complete!',exact:true}).waitFor();if(level<2)await page.getByRole('button',{name:'Next lesson: '+titles[level+1]+' →',exact:true}).click()}
 }
 await page.getByRole('button',{name:'Choose what to play →',exact:true}).click();await page.getByText('Play a whole game',{exact:true}).click();await page.getByRole('button',{name:'Two players',exact:true}).click();
 const scoresBefore=await store('amari_cosmic_freeplay_v1');
 for(const [outcome,moves] of [['win',[0,3,1,4,2]],['loss',[0,3,1,4,8,5]],['draw',[0,1,2,4,3,5,7,6,8]]]){
  for(const move of moves)await page.getByRole('gridcell').nth(move).click();await page.getByRole('button',{name:'New board',exact:true}).waitFor();const frozen=await board();if(await page.getByRole('gridcell').filter({hasText:'empty'}).count())throw Error('Unexpected terminal');rows.push({free:outcome,board:frozen,scores:await store('amari_cosmic_freeplay_v1')});await page.getByRole('button',{name:'New board',exact:true}).click();if((await board()).some(Boolean))throw Error('New board not empty');
 }
 const scores=await store('amari_cosmic_freeplay_v1');for(const k of ['X','O','draws'])if(scores.amari[k]!==((scoresBefore?.amari?.[k])||0)+1)throw Error('Saved totals incorrect '+k);
 await page.getByRole('button',{name:'Scout bot',exact:true}).click();await page.getByRole('gridcell').nth(4).click();await page.waitForFunction(()=>[...document.querySelectorAll('[role=gridcell]')].some(e=>e.getAttribute('aria-label').includes(', Rocket')));if((await board()).filter(Boolean).length!==2)throw Error('Scout turn not one legal move');await page.getByRole('button',{name:'Captain bot',exact:true}).click();await page.getByRole('gridcell').nth(0).click();await page.getByRole('button',{name:'Leave game board',exact:true}).click();const paused=await board();await page.waitForTimeout(750);if(JSON.stringify(paused)!==JSON.stringify(await board()))throw Error('Bot moved behind leave dialog');await page.getByRole('button',{name:'Keep playing',exact:true}).click();await page.waitForFunction(()=>[...document.querySelectorAll('[role=gridcell]')].some(e=>e.getAttribute('aria-label').includes(', Rocket')));
 await page.getByRole('button',{name:'Leave game board',exact:true}).click();await page.getByRole('button',{name:'Leave board',exact:true}).click();const saved=await store('amari_cosmic_tactics_v1');await page.reload();await page.getByRole('heading',{name:'Think one move ahead'}).waitFor();if(JSON.stringify(saved)!==JSON.stringify(await store('amari_cosmic_tactics_v1'))||JSON.stringify(scores)!==JSON.stringify(await store('amari_cosmic_freeplay_v1')))throw Error('Reload lost tactic or totals');await page.getByRole('button',{name:'Back to learning world',exact:true}).click();if(!page.url().endsWith('#/world/thinking'))throw Error('Wrong tactics parent');
 }
 await page.goto(root+'#/stickers');const shelf=page.getByRole('region',{name:game==='trace'?'Letter Trace chapters':'Cosmic tactic badges',exact:true});await shelf.waitFor();if(!((await shelf.innerText()).includes('3 / 3 collected')))throw Error('Earned chapter shelf missing');const shelfLabels=await shelf.getByRole('listitem').evaluateAll(es=>es.map(e=>e.getAttribute('aria-label')));if(shelfLabels.some(s=>!s.endsWith(': collected')))throw Error('Uncollected earned badge');await page.reload();await shelf.waitFor();if(!((await shelf.innerText()).includes('3 / 3 collected')))throw Error('Shelf lost on reload');await page.goto(root+'#/world/'+world);
 const cacheKeys=await page.evaluate(()=>caches.keys());if(!cacheKeys.includes('amari-discovery-v34')||await page.getByRole('status',{name:'Game update available',exact:true}).count())throw Error('Current worker/update notice mismatch '+JSON.stringify(cacheKeys));
 if(errors.length||consoleErrors.length||providers.length||badAssets.length)throw Error('Runtime '+JSON.stringify({errors,consoleErrors,providers,badAssets}));
 return {origin,width,game,entry,runtimeExpected:QA_RUNTIME,cacheKeys,at:new Date().toISOString(),passed:true,before,rows,shelfLabels,errors,consoleErrors,providers,badAssets,after:await store(game==='trace'?'amari_letter_trace_progress_v1':'amari_cosmic_tactics_v1'),url:page.url()};
}
