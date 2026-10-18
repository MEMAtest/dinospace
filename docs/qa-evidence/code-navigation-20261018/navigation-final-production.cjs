async page=>{
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/api/voice**',r=>r.fulfill({status:403,body:'QA guard'}));await page.route('**/api/story**',r=>r.fulfill({status:403,body:'QA guard'}));await page.goto('https://dinospace-eight.vercel.app/?navigation-proof='+Date.now()+'#/');await page.getByRole('button',{name:/Age 6\+ Amari/}).click();await page.locator('.discovery-world-card').filter({hasText:'Creative Lab'}).click();await page.locator('.catalogue-game-card').filter({hasText:'Code Cadets'}).click();await page.getByRole('button',{name:'Start my first mission →',exact:true}).click();
const rows=[];
for(const width of [390,1440]){
 await page.setViewportSize({width,height:844});await page.evaluate(()=>scrollTo(0,0));
 // The complete mission rehearsal left a saved program, so changing missions is safe.
 await page.getByRole('navigation',{name:'Coding missions'}).getByRole('button',{name:'2 · Fix the wrong turn',exact:true}).click();
 await page.getByText('Pip must go up two squares, then right two squares to the flag.',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Need a clue?',exact:true}).click();await page.getByText('Watch block 2. Follow the green path up two squares, turn right at the marked corner, then move two squares to the flag.',{exact:true}).waitFor();await page.getByRole('button',{name:'Hide clue',exact:true}).click();
 const tabs=await page.locator('.cc-mission-nav button').evaluateAll(xs=>xs.map(x=>({label:x.textContent,width:x.getBoundingClientRect().width,height:x.getBoundingClientRect().height})));
 if(tabs.some(t=>t.height<44||t.width<44))throw Error('Small navigation targets');
 if(await page.locator('.cc-square.is-corner .cc-tile-label').innerText()!=='Turn')throw Error('Missing corner');
 if(await page.locator('.cc-route-arrow').allTextContents().then(xs=>xs.join(''))!=='→→↑')throw Error('Wrong route arrows');
 await page.screenshot({path:'output/playwright/code-navigation-20261018/navigation-entry-'+width+'.png',fullPage:true});
 await page.getByRole('button',{name:'▶ Try the supplied code',exact:true}).click();
 await page.getByRole('button',{name:'Change block 2 to Forward',exact:true}).waitFor({state:'visible'});
 await page.getByText('Fix this: Pip turns too early',{exact:true}).waitFor();
 await page.waitForTimeout(350);
 const action=await page.locator('.cc-next-action').boundingBox();if(action.y<0||action.y+action.height>844)throw Error('Repair action lost after running '+JSON.stringify(action));
 await page.screenshot({path:'output/playwright/code-navigation-20261018/navigation-repair-'+width+'.png',fullPage:true});
 await page.getByRole('button',{name:'Change block 2 to Forward',exact:true}).click();await page.getByText('Put the turn here',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Add Turn Right at block 3',exact:true}).click();await page.getByRole('button',{name:'▶ Run corrected program',exact:true}).click();
 await page.getByRole('button',{name:'Next mission →',exact:true}).waitFor();await page.waitForTimeout(350);
 const success=await page.locator('.cc-success').boundingBox();if(success.y<0||success.y+success.height>844)throw Error('Next mission lost '+JSON.stringify(success));
 await page.getByRole('button',{name:'Next mission →',exact:true}).click();await page.getByRole('heading',{name:'Collect the sample',exact:true}).waitFor();
 await page.getByRole('navigation',{name:'Coding missions'}).getByRole('button',{name:'1 · Reach the flag',exact:true}).click();await page.getByRole('heading',{name:'Reach the flag',exact:true}).waitFor();
 const metric=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)}));if(metric.width!==metric.scrollWidth||metric.broken.length)throw Error(JSON.stringify(metric));rows.push({width,tabs,repairVisibleAfterRun:true,nextVisibleAfterSuccess:true,missionTabsWork:true,...metric});
}
return {rows,pageErrors:errors};
}
