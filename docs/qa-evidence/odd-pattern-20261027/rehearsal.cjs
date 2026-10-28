async page => {
 COMMON_HELPERS
 const origin=QA_ORIGIN,width=QA_WIDTH,kind=QA_GAME,content=QA_CONTENT,audioRequired=QA_AUDIO,stage=QA_STAGE,rows=[];
 const state=await prepare(page,origin,width);await page.goto(state.root+'#/world/thinking');const title=kind==='odd'?'Odd One Out':'Pattern Parade';await page.getByRole('button').filter({has:page.getByRole('heading',{name:title,exact:true})}).click();
 const sound=page.getByRole('button',{name:audioRequired?'Turn sound on':'Turn sound off',exact:true});if(await sound.count())await sound.click();
 const key=kind==='odd'?'amari_oddoneout_progress_v1':'amari_pattern_adventure_v2:amari';
 const snapshot=()=>page.evaluate(key=>({progress:JSON.parse(localStorage.getItem(key)||'null'),reward:localStorage.getItem('amari_rewards_v2')}),key);
 const initial=await snapshot(),allSeen=new Set();
 for(let ci=0;ci<3;ci++){
  const chapter=content.chapters[ci],repetitions=kind==='odd'?1:2;
  if(kind==='pattern')await page.getByRole('button').filter({hasText:new RegExp('^'+(ci+1)+'\\. '+chapter.title)}).click();
  if(kind==='odd')await page.getByRole('button',{name:new RegExp('Chapter '+(ci+1)+' .*'+chapter.title)}).click();else await page.getByRole('button',{name:'Start '+chapter.title,exact:true}).click();
  const chapterSeen=new Set();
  for(let run=0;run<repetitions;run++){
   const seen=new Set();
   for(let ri=0;ri<6;ri++){
    const node=page.locator(kind==='odd'?'[data-odd-round]':'[data-pattern-round]');await node.waitFor();const id=await node.getAttribute(kind==='odd'?'data-odd-round':'data-pattern-round');const m=content.rounds.find(r=>r.id===id);if(!m||seen.has(id))throw Error('Unknown/repeated mission '+id);seen.add(id);allSeen.add(id);chapterSeen.add(id);
    if(kind==='odd'&&id==='visual-colour'){const blueKite=page.getByRole('button',{name:'Choose Blue kite',exact:true});if(await blueKite.locator('svg path[fill="#4c91c6"]').count()===0)throw Error('Blue kite is not visibly blue');await page.screenshot({path:'docs/qa-evidence/odd-pattern-20261027/'+stage+'-colour-feature-'+width+'.jpg',type:'jpeg',quality:77,fullPage:true});}
    if(kind==='odd'){
     if(ri===0&&run===0){await page.getByRole('button',{name:'Choose '+m.items.find(i=>i.id!==m.oddItemId).label,exact:true}).first().click();if(await page.getByRole('button',{name:/Next round|See chapter results/}).count())throw Error('Wrong item advanced');}
     await page.getByRole('button',{name:'Choose '+m.items.find(i=>i.id===m.oddItemId).label,exact:true}).click();
     if(ri===0&&run===0){await page.getByRole('button',{name:m.choices.find(r=>!r.correct).text,exact:true}).click();await page.getByRole('button',{name:'Use a clue',exact:true}).click();}
     await page.getByRole('button',{name:m.choices.find(r=>r.correct).text,exact:true}).focus();await page.keyboard.press('Enter');
    }else{
     const answerLabel=m.kind==='growing'?m.answer+' '+content.shapes[m.token].name+'s':content.shapes[m.answer].name;
     if(ri===0&&run===0){await page.locator('button[data-pattern-choice]').filter({hasNotText:answerLabel}).first().click();if(await page.getByRole('button',{name:/^(Next|Finish chapter)$/}).count())throw Error('Wrong pattern advanced');await page.getByRole('button',{name:'One clue',exact:true}).click();}
     await page.getByRole('button',{name:answerLabel,exact:true}).focus();await page.keyboard.press('Enter');
    }

    let advanceAudioIndex=null;
    const next=page.getByRole('button',{name:kind==='odd'?(ri===5?'See chapter results':'Next round'):(ri===5?'Finish chapter':'Next'),exact:true});await next.waitFor();await page.waitForFunction(()=>/^(Next|Next round|Finish chapter|See chapter results)$/.test(document.activeElement?.textContent.trim()));
    if(ri===0){await page.waitForTimeout(300);if(!await next.isVisible())throw Error('Explanation not held');
     if(audioRequired){const before=await page.evaluate(()=>window.__reasoningQaMediaV2.length);const replay=page.getByRole('button',{name:kind==='odd'?'Hear explanation again':'Replay spoken rule',exact:true});await replay.click();await page.waitForFunction(n=>window.__reasoningQaMediaV2.slice(n).some(r=>r.ended&&r.advanced),before,{timeout:20000});const muteIndex=await page.evaluate(()=>window.__reasoningQaMediaV2.length);await replay.click();await page.waitForFunction(n=>window.__reasoningQaMediaV2[n]?.started,muteIndex,{timeout:10000});await page.getByRole('button',{name:'Turn sound off',exact:true}).click();await page.waitForFunction(n=>window.__reasoningQaMediaV2[n]?.paused||window.__reasoningQaMediaV2[n]?.ended,muteIndex);if(!await replay.isDisabled())throw Error('Mute left replay enabled');await page.getByRole('button',{name:'Turn sound on',exact:true}).click();advanceAudioIndex=await page.evaluate(()=>window.__reasoningQaMediaV2.length);await replay.click();await page.waitForFunction(n=>window.__reasoningQaMediaV2[n]?.started,advanceAudioIndex,{timeout:10000});}
     const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,bad:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),short:[...document.querySelectorAll('[data-odd-round] button,[data-pattern-round] button')].filter(b=>b.getBoundingClientRect().height>0&&b.getBoundingClientRect().height<48).map(b=>b.textContent)}));if(layout.overflow||layout.bad.length||layout.short.length)throw Error(JSON.stringify(layout));if(ci===1&&run===0)await page.screenshot({path:'docs/qa-evidence/odd-pattern-20261027/'+stage+'-'+kind+'-'+width+'.jpg',type:'jpeg',quality:77,fullPage:true});
    }
    if(ri===5){const saved=await snapshot();if(!saved.progress?.completedChapterIds.includes(chapter.id))throw Error('Chapter not saved before final Next');}
    rows.push({chapter:chapter.id,id,run,round:ri,kind:m.kind||'sorting',held:true});await next.click();if(advanceAudioIndex!==null)await page.waitForFunction(n=>window.__reasoningQaMediaV2[n]?.paused||window.__reasoningQaMediaV2[n]?.ended,advanceAudioIndex);
   }
   if(kind==='pattern'&&run+1<repetitions)await page.getByRole('button',{name:'Replay '+chapter.title,exact:true}).click();
  }
  if(kind==='pattern'&&chapterSeen.size!==content.rounds.filter(m=>m.chapterId===chapter.id).length)throw Error('Authored pool coverage incomplete '+chapter.id);
  if(ci<2){await page.getByRole('button',{name:kind==='odd'?'Continue to '+content.chapters[ci+1].title:'Next chapter: '+content.chapters[ci+1].title,exact:true}).click();}
 }
 const earned=await snapshot(),media=await page.evaluate(()=>window.__reasoningQaMediaV2);await page.reload();if(JSON.stringify(earned)!==JSON.stringify(await snapshot()))throw Error('Saved records/rewards lost after reload');
 await page.getByRole('button',{name:kind==='odd'?'Back to home':'Back to parent world',exact:true}).click();await page.getByRole('heading',{name:'Thinking & Play',exact:true}).waitFor();await page.getByRole('button',{name:'Back to home',exact:true}).click();await page.getByRole('button',{name:/Stickers/}).click();const shelf=page.getByRole('region',{name:kind==='odd'?'Sorting discoveries':'Pattern festival badges',exact:true});await shelf.waitFor();if(!(await shelf.innerText()).includes('3 / 3 collected'))throw Error('Collection missing');await page.reload();if(JSON.stringify(earned)!==JSON.stringify(await snapshot()))throw Error('Collection visit mutated reward');
 if(state.errors.length||state.consoleErrors.length||state.failedAssets.length||state.providers.length)throw Error(JSON.stringify(state));
 const runtime=await page.evaluate(()=>({entry:document.querySelector('script[type=module][src]')?.getAttribute('src')}));const worker=page.context().serviceWorkers().find(w=>w.url()===origin+'/sw.js');runtime.activeCache=worker?await worker.evaluate('CACHE_NAME'):null;
 return{passed:true,scope:audioRequired?'Functional and packaged playback':'Preliminary functional only; audio approval pending',origin,width,kind,runtime,rows,uniqueMissions:allSeen.size,chapterCount:earned.progress.completedChapterIds.length,initialChapterCount:initial.progress?.completedChapterIds.length||0,rewardBefore:JSON.parse(initial.reward||'{}').points||0,rewardAfter:JSON.parse(earned.reward||'{}').points||0,retainedAfterReload:true,collection:true,audio:{required:audioRequired,startedAndAdvanced:media.filter(m=>m.started&&m.advanced).length,muteAndNextCancellation:audioRequired},errors:state.errors,consoleErrors:state.consoleErrors,providers:state.providers,failedAssets:state.failedAssets};
}
