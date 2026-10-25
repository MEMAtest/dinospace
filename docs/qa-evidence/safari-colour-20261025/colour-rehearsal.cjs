async page => {
 const origin=QA_ORIGIN,width=QA_WIDTH,missions=QA_MISSIONS,rows=[],errors=[],consoleErrors=[],providers=[];
 page.setDefaultTimeout(12000);await page.setViewportSize({width,height:900});
 await page.unroute('**/api/**');await page.route('**/api/**',r=>{providers.push(r.request().url());return r.fulfill({status:403,body:'Synthetic QA provider guard'});});
 await page.addInitScript(()=>{if(window.__qaAudioTagged)return;window.__qaAudioTagged=true;window.__qaMedia=[];const original=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(...args){const row={tag:'safari-colour-v2',src:this.currentSrc||this.src,started:false,advanced:false,ended:false};window.__qaMedia.push(row);this.addEventListener('playing',()=>row.started=true);this.addEventListener('timeupdate',()=>{if(this.currentTime>0.05)row.advanced=true;});this.addEventListener('ended',()=>row.ended=true);return original.apply(this,args);};});
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
 const root=origin+'/?colour-acceptance='+Date.now();await page.goto(root+'#/');await page.getByRole('button',{name:/Age 6\+.*Amari/}).click();await page.goto(root+'#/world/creative');await page.getByRole('button').filter({has:page.getByRole('heading',{name:'Colour Mixing Lab',exact:true})}).click();
 const sound=page.getByRole('button',{name:'Turn sound on',exact:true});if(await sound.count())await sound.click();
 const snapshot=()=>page.evaluate(()=>({progress:JSON.parse(localStorage.getItem('amari_colour_lab_adventure_v1:amari')||'null'),rewards:localStorage.getItem('amari_rewards_v2')}));
 const runtime=await page.evaluate(async()=>({entry:document.querySelector('script[type=module][src]')?.getAttribute('src'),worker:(await navigator.serviceWorker?.getRegistration())?.active?.scriptURL||null}));const initial=await snapshot();
 const labTitles=['Paint Mixer','Light & Shade','Colour Makers'];
 const checkLayout=async()=>{await page.waitForFunction(()=>[...document.images].every(i=>i.complete));return page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,badImages:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src)}));};
 for(let lab=0;lab<3;lab++){
  if(lab>0)await page.getByRole('button',{name:'Start '+labTitles[lab],exact:true}).click();
  await page.getByRole('button',{name:'Start '+labTitles[lab],exact:true}).click();
  const seen=new Set();
  for(let ri=0;ri<6;ri++){
   const article=page.getByRole('article',{name:'Paint mission',exact:true});await article.waitFor();const id=await article.getAttribute('data-colour-mission'),m=missions.find(m=>m.id===id);if(!m||seen.has(id))throw Error('Unknown/repeated mission '+id);seen.add(id);
   let scoops=Object.fromEntries(m.ingredients.map((c,i)=>[c,Number(m.proportions[i].match(/\d+/)[0])]));
   const add=async amounts=>{for(const [paint,n]of Object.entries(amounts))for(let i=0;i<n;i++)await page.getByRole('button',{name:'Add '+paint+' paint',exact:true}).click();};
   if(lab===2){
    if(ri===0){const wrongCard=m.recipeChoices.find(c=>c.color!==m.answer);await page.getByRole('button',{name:'Recipe: '+Object.entries(wrongCard.scoops).map(([n,c])=>c+' '+n).join(' + '),exact:true}).click();await add(wrongCard.scoops);await page.getByRole('button',{name:'Mix',exact:true}).click();if(await page.getByRole('button',{name:/^(Next mix|Finish chapter)$/}).count())throw Error('Wrong transfer recipe passed');await page.getByRole('button',{name:'Empty bowl',exact:true}).click();}
    const card=m.recipeChoices.find(c=>c.color===m.answer);scoops=card.scoops;await page.getByRole('button',{name:'Recipe: '+Object.entries(scoops).map(([n,c])=>c+' '+n).join(' + '),exact:true}).click();
   }
   await add(scoops);
   const bowl=page.locator('[aria-label="Paints in mixing bowl"]'),total=Object.values(scoops).reduce((a,b)=>a+b,0);if(await bowl.locator('[aria-label$=" scoop"]').count()!==total)throw Error('Scoop model mismatch '+id);
   if(ri===0&&lab<2){await page.getByRole('button',{name:'Empty bowl',exact:true}).click();if(await bowl.locator('[aria-label$=" scoop"]').count())throw Error('Empty bowl did not clear');await add(scoops);}
   await page.getByRole('button',{name:'Mix',exact:true}).click();
   if(lab<2){if(ri===0){await page.getByRole('button',{name:'Choose '+m.options.find(o=>o!==m.answer),exact:true}).click();if(await page.getByRole('button',{name:/^(Next mix|Finish chapter)$/}).count())throw Error('Wrong naming answer passed');await page.getByRole('button',{name:'One clue',exact:true}).click();}
    await page.getByRole('button',{name:'Choose '+m.answer,exact:true}).focus();await page.keyboard.press('Enter');
   }
   const next=page.getByRole('button',{name:ri===5?'Finish chapter':'Next mix',exact:true});await next.waitFor();
   if(ri===0){const before=await page.evaluate(()=>window.__qaMedia.length);await page.getByRole('button',{name:'Hear explanation again',exact:true}).click();await page.waitForFunction(n=>window.__qaMedia.slice(n).some(x=>x.ended&&x.advanced),before,{timeout:18000});if(!await next.isVisible())throw Error('Worked answer auto advanced');const l=await checkLayout();if(l.overflow||l.badImages.length)throw Error('Layout '+JSON.stringify(l));if(lab===0)await page.screenshot({path:'docs/qa-evidence/safari-colour-20261025/local-colour-'+width+'.jpg',type:'jpeg',quality:78,fullPage:true});}
   if(ri===5){const saved=await snapshot();if(!saved.progress?.chapters.includes(m.lab))throw Error('Chapter not saved before Finish '+m.lab);}
   rows.push({lab:labTitles[lab],id,scoops,total,answer:m.answer,held:true});await next.click();
  }
 }
 const earned=await snapshot(),media=await page.evaluate(()=>window.__qaMedia.filter(x=>x.tag==='safari-colour-v2'));await page.reload();await page.getByRole('button',{name:'Start Paint Mixer',exact:true}).waitFor();if(JSON.stringify(earned)!==JSON.stringify(await snapshot()))throw Error('Records lost after reload');
 await page.getByRole('button',{name:'Back to home',exact:true}).click();if(await page.getByRole('dialog',{name:'Leave the game?',exact:true}).count())await page.getByRole('button',{name:'Back to world',exact:true}).click();await page.getByRole('heading',{name:'Creative Lab',exact:true}).waitFor();
 if(errors.length||consoleErrors.length||providers.length)throw Error(JSON.stringify({errors,consoleErrors,providers}));
 if(await page.getByRole('status',{name:'Game update available',exact:true}).count())throw Error('Unexpected stale release notice');return{passed:true,origin,width,runtime,game:'Colour Mixing Lab',rows,initialChapterCount:initial.progress?.chapters.length||0,finalChapterCount:earned.progress.chapters.length,retainedAfterReload:true,parentNavigation:true,audio:{startedAndAdvanced:media.filter(x=>x.started&&x.advanced).length,completedReplayExplanations:3,packaged:media.every(x=>!x.src||x.src.includes('/audio/'))},errors,consoleErrors,providers};
}
