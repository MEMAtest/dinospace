async page => {
const origin=QA_ORIGIN, root=origin+'/?reward-qa='+Date.now(); await page.setViewportSize({width:390,height:844});const errors=[],providers=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});await page.route('**/api/**',r=>{providers.push(r.request().url());return r.fulfill({status:403,body:'QA provider guard'})});
await page.addInitScript(()=>{
 if(window.__rewardQaStorage)return;window.__rewardQaStorage=true;
 for(const method of ['getItem','setItem','removeItem']){
  const original=Storage.prototype[method];Storage.prototype[method]=function(key,...args){return original.call(this,/^(amari_|askia_)/.test(key)?'qa_rewards_20261024_'+key:key,...args)};
 }
});
await page.goto(root+'#/' );
// Dedicated synthetic namespace; real and earlier QA keys are never reset.
await page.evaluate(()=>{if(!localStorage.getItem('amari_points'))localStorage.setItem('amari_points','8')});
await page.getByRole('button',{name:/Age 6\+.*Amari/}).click();
const rows=[];
for(const game of ['addition','subtraction','counting']){
 await page.goto(root+'#/play/'+game);
 if(game==='counting')await page.getByRole('button',{name:'Start next survey',exact:true}).click();
 else { await page.getByRole('button',{name:/Chapter 1/i}).click();await page.getByRole('button',{name:game==='addition'?'Start Put Groups Together':'Start Take Away',exact:true}).click(); }
 for(let i=0;i<6;i++){
  let answer;
  if(game==='counting'){
   const board=page.getByRole('group',{name:/^Counting board for/});await board.waitFor();const objects=board.getByRole('button');answer=await objects.count();for(let j=0;j<answer;j++)await objects.nth(j).click();await page.getByRole('button',{name:String(answer),exact:true}).click();
  }else{
   const eq=await page.locator('[aria-label^="Equation:"]').innerText();const [a,b]=eq.match(/\d+/g).map(Number);answer=game==='addition'?a+b:a-b;await page.getByRole('button',{name:'Answer '+answer,exact:true}).click();
  }
  if(i<5)await page.getByRole('button',{name:game==='counting'?'Next':'Next question',exact:true}).click();
 }
 // Intentionally skip final Next: completion and rewards must already be durable.
 await page.getByRole('button',{name:game==='counting'?'Next':'Finish chapter',exact:true}).waitFor();
 const key=game==='counting'?'amari_amari_count_the_stars_batch3_v1':'amari_'+game+'_progress_v1';
 const before=await page.evaluate(k=>({progress:JSON.parse(localStorage.getItem(k)),rewards:JSON.parse(localStorage.getItem('amari_rewards_v2'))}),key);
 if((before.progress.completedChapterIds||before.progress.completedEpisodeIds).length!==1)throw Error('Final answer did not save '+game);
 if(!before.rewards||before.rewards.earnedStickerIds.length===0)throw Error('Sticker not saved');
 await page.reload();
 const after=await page.evaluate(k=>({progress:JSON.parse(localStorage.getItem(k)),rewards:JSON.parse(localStorage.getItem('amari_rewards_v2'))}),key);
 if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Reload changed earned records '+game);
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Overflow');
 rows.push({game,finalNextSkipped:true,completion:after.progress,rewards:after.rewards,reloadRetained:true});
}
await page.getByRole('button',{name:'Stickers',exact:true}).click();const shelf=await page.locator('body').innerText();if(!shelf.includes('Collected'))throw Error('Badges not visible');if(errors.length||providers.length)throw Error(JSON.stringify({errors,providers}));return{origin,rows,shelf,errors,providers};
}