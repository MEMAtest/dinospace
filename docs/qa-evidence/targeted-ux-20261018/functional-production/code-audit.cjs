async page=>{
const errors=[],dialogs=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>dialogs.push(d.type()));
await page.route('**/api/voice**',r=>r.fulfill({status:403,body:'QA guard'}));await page.route('**/api/story**',r=>r.fulfill({status:403,body:'QA guard'}));
await page.goto('https://dinospace-eight.vercel.app/?code-rehearsal='+Date.now()+'#/');await page.getByRole('button',{name:/Age 6\+ Amari/}).click();await page.locator('.discovery-world-card').filter({hasText:'Creative Lab'}).click();await page.locator('.catalogue-game-card').filter({hasText:'Code Cadets'}).click();await page.getByRole('button',{name:'Start my first mission →',exact:true}).click();const rows=[];
for(const width of [390,1440]){
 await page.setViewportSize({width,height:844});await page.evaluate(()=>scrollTo(0,0));
 const initial=await page.locator('.cc-main-action').boundingBox();if(initial.y+initial.height>844)throw Error('First action below viewport '+JSON.stringify(initial));
 await page.screenshot({path:'output/playwright/targeted-ux-production-20261018/code-start-'+width+'.png',fullPage:true});
 for(let i=1;i<=3;i++)await page.getByRole('button',{name:`↑ Add Forward · ${i} of 3`,exact:true}).click();
 await page.getByRole('button',{name:'▶ Run my first program',exact:true}).click();await page.getByRole('button',{name:'Next mission →',exact:true}).waitFor();
 await page.getByRole('button',{name:'Next mission →',exact:true}).click();await page.getByRole('button',{name:'▶ Try the supplied code',exact:true}).click();await page.getByRole('button',{name:'Change block 2 to Forward',exact:true}).waitFor();
 await page.getByRole('button',{name:'Change block 2 to Forward',exact:true}).click();await page.getByRole('button',{name:'Add Turn Right at block 3',exact:true}).click();await page.getByRole('button',{name:'▶ Run corrected program',exact:true}).click();await page.getByRole('button',{name:'Next mission →',exact:true}).waitFor();
 await page.screenshot({path:'output/playwright/targeted-ux-production-20261018/code-debug-success-'+width+'.png',fullPage:true});await page.getByRole('button',{name:'Next mission →',exact:true}).click();
 for(let i=0;i<8;i++){const action=page.locator('.cc-main-action');const label=await action.innerText();if(!/Add (Forward|Turn Right|Collect)/.test(label))throw Error('Unexpected scaffold '+label);await action.click();}
 await page.getByRole('button',{name:'▶ Run my program',exact:true}).click();await page.getByRole('button',{name:'Replace 3 Forward moves with Repeat',exact:true}).waitFor();
 for(let i=0;i<2;i++)await page.getByRole('button',{name:'Replace 3 Forward moves with Repeat',exact:true}).click();
 if(await page.getByRole('list',{name:"Pip's instruction sequence"}).getByRole('listitem').count()!==4)throw Error('Not four blocks');
 await page.getByRole('button',{name:'▶ Run my program',exact:true}).click();await page.getByText('You finished all three missions!',{exact:true}).waitFor();
 await page.screenshot({path:'output/playwright/targeted-ux-production-20261018/code-all-complete-'+width+'.png',fullPage:true});
 await page.getByText('More tools, choose a mission, save or open code',{exact:true}).click();await page.getByRole('textbox',{name:'Program name',exact:true}).fill('QA Pip compact repeat');await page.getByRole('button',{name:'Save program',exact:true}).click();await page.getByText('Program saved on this device.',{exact:true}).waitFor();
 const metrics=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)}));if(metrics.scrollWidth>width||metrics.broken.length)throw Error(JSON.stringify(metrics));rows.push({width,completedMissions:3,savedBlocks:4,...metrics});
 if(width===390){await page.getByRole('button',{name:'1 · Reach the flag',exact:true}).click();await page.getByText('More tools, choose a mission, save or open code',{exact:true}).click();}
}
await page.getByRole('navigation',{name:'Discovery navigation'}).getByRole('button',{name:'Worlds',exact:true}).click();const world=page.locator('.catalogue-game-card').filter({hasText:'Code Cadets'});const stay=page.getByRole('button',{name:'Keep playing',exact:true});await Promise.race([world.waitFor(),stay.waitFor()]);if(await stay.isVisible())await page.getByRole('button',{name:'Back to world',exact:true}).click();await world.click();await page.getByRole('button',{name:'Open saved program',exact:true}).click();
const reopened=await page.getByRole('list',{name:"Pip's instruction sequence"}).getByRole('listitem').count();if(reopened!==4)throw Error('Saved code lost');if(dialogs.length)throw Error('Unexpected browser dialogs '+dialogs.join());
await page.getByRole('button',{name:'▶ Run my program',exact:true}).click();await page.getByText('You finished all three missions!',{exact:true}).waitFor();
return {rows,reopenedBlocks:reopened,pageErrors:errors,unexpectedDialogs:dialogs};
}
