async page => {
 COMMON_HELPERS
 const origin=QA_ORIGIN,width=QA_WIDTH,content=QA_CONTENT,audioRequired=QA_AUDIO,stage=QA_STAGE,rows=[];
 const state=await prepare(page,origin,width,'askia');await page.getByRole('button',{name:'Play Pattern Parade',exact:true}).click();
 const sound=page.getByRole('button',{name:audioRequired?'Turn sound on':'Turn sound off',exact:true});if(await sound.count())await sound.click();
 const key='amari_pattern_adventure_v2:askia';
 const snapshot=()=>page.evaluate(key=>({progress:JSON.parse(localStorage.getItem(key)||'null'),reward:localStorage.getItem('askia_rewards_v2'),other:localStorage.getItem('amari_pattern_adventure_v2:amari')}),key);
 const initial=await snapshot(),allSeen=new Set();let failedSaveRecovered=false;
 for(let ci=0;ci<3;ci++){
  const chapter=content.chapters[ci];await page.getByRole('button',{name:'Chapter '+(ci+1)+': '+chapter.title,exact:true}).click();await page.getByRole('button',{name:'Start '+chapter.title,exact:true}).click();
  const chapterSeen=new Set();
  for(let run=0;run<2;run++){
   const seen=new Set();
   for(let ri=0;ri<6;ri++){
    const node=page.locator('[data-pattern-round]');await node.waitFor();const id=await node.getAttribute('data-pattern-round');const m=content.rounds.find(r=>r.id===id);if(!m||seen.has(id))throw Error('Unknown/repeated mission '+id);seen.add(id);allSeen.add(id);chapterSeen.add(id);
    const answerLabel=m.kind==='growing'?m.answer+' '+content.shapes[m.token].name+'s':content.shapes[m.answer].name;
    if(ri===0&&run===0){await page.locator('button[data-pattern-choice]').filter({hasNotText:answerLabel}).first().click();if(await page.getByRole('button',{name:/^(Next|Finish chapter)$/}).count())throw Error('Wrong pattern advanced');await page.getByRole('button',{name:'One clue',exact:true}).click();}
    const failFinal=ci===0&&run===0&&ri===5&&!initial.progress?.completedChapterIds?.includes(chapter.id);
    if(failFinal)await page.evaluate(key=>{const original=Storage.prototype.setItem;window.__qaPatternBlock=true;Storage.prototype.setItem=function(candidate,...args){if(candidate===key&&window.__qaPatternBlock)throw new DOMException('Synthetic save fault','QuotaExceededError');return original.call(this,candidate,...args);};},key);
    await page.getByRole('button',{name:answerLabel,exact:true}).focus();await page.keyboard.press('Enter');
    const next=page.getByRole('button',{name:ri===5?'Finish chapter':'Next',exact:true});await next.waitFor();await page.waitForFunction(()=>/^(Next|Next round|Finish chapter|See chapter results)$/.test(document.activeElement?.textContent.trim()));
    if(ri===0){await page.waitForTimeout(300);if(!await next.isVisible())throw Error('Explanation not held');
     if(audioRequired){const before=await page.evaluate(()=>window.__reasoningQaMediaV2.length);await page.getByRole('button',{name:'Replay spoken rule',exact:true}).click();await page.waitForFunction(n=>window.__reasoningQaMediaV2.slice(n).some(r=>r.ended&&r.advanced),before,{timeout:20000});}
     const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,bad:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),short:[...document.querySelectorAll('[data-pattern-round] button')].filter(b=>b.getBoundingClientRect().height>0&&b.getBoundingClientRect().height<48).map(b=>b.textContent)}));if(layout.overflow||layout.bad.length||layout.short.length)throw Error(JSON.stringify(layout));if(ci===1&&run===0)await page.screenshot({path:'docs/qa-evidence/odd-pattern-20261027/'+stage+'-little-'+width+'.jpg',type:'jpeg',quality:77,fullPage:true});
    }
    if(ri===5){const saved=await snapshot();if(failFinal){if(saved.progress?.completedChapterIds.includes(chapter.id)||saved.reward!==initial.reward)throw Error('Failed write granted badge/reward');}else if(!saved.progress?.completedChapterIds.includes(chapter.id))throw Error('Chapter not saved before Finish');}
    rows.push({chapter:chapter.id,id,run,round:ri,kind:m.kind,held:true});await next.click();
    if(failFinal){await page.getByRole('heading',{name:'Chapter save needed',exact:true}).waitFor();await page.evaluate(()=>{window.__qaPatternBlock=false;});await page.getByRole('button',{name:'Retry saving chapter',exact:true}).click();if(!(await snapshot()).progress.completedChapterIds.includes(chapter.id))throw Error('Save retry failed');failedSaveRecovered=true;}
   }
   if(run===0)await page.getByRole('button',{name:'Replay '+chapter.title,exact:true}).click();
  }
  if(chapterSeen.size!==8)throw Error('Incomplete chapter coverage');if(ci<2)await page.getByRole('button',{name:'Next chapter: '+content.chapters[ci+1].title,exact:true}).click();
 }
 const earned=await snapshot(),media=await page.evaluate(()=>window.__reasoningQaMediaV2);if(earned.other!==initial.other)throw Error('Other child progress changed');await page.reload();if(JSON.stringify(earned)!==JSON.stringify(await snapshot()))throw Error('Saved progress lost');
 await page.getByRole('button',{name:'Back to home',exact:true}).click();await page.getByRole('heading',{name:'Hi Askia!',exact:true}).waitFor();await page.getByRole('button',{name:'My stickers',exact:true}).click();const shelf=page.getByRole('region',{name:'Pattern festival badges',exact:true});await shelf.waitFor();if(!(await shelf.innerText()).includes('3 / 3 collected'))throw Error('Collection missing');if(await page.getByRole('region',{name:'Sorting discoveries',exact:true}).count())throw Error('Unplayable sorting collection shown');await page.reload();if(JSON.stringify(earned)!==JSON.stringify(await snapshot()))throw Error('Collection mutated progress');
 if(state.errors.length||state.consoleErrors.length||state.failedAssets.length||state.providers.length)throw Error(JSON.stringify(state));
 return{passed:true,origin,width,kind:'little-pattern',rows,uniqueMissions:allSeen.size,chapterCount:earned.progress.completedChapterIds.length,initialChapterCount:initial.progress?.completedChapterIds.length||0,failedSaveRecovered,otherChildUnchanged:true,retainedAfterReload:true,collection:true,audio:{required:audioRequired,startedAndAdvanced:media.filter(m=>m.started&&m.advanced).length},errors:state.errors,consoleErrors:state.consoleErrors,providers:state.providers,failedAssets:state.failedAssets,runtime:{entry:await page.evaluate(()=>document.querySelector('script[type=module][src]')?.getAttribute('src'))}};
}
