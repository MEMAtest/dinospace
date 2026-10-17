async page=>{
 const base='https://dinospace-kux3a41gk-memas-projects-23a0001d.vercel.app/?designqa='+Date.now();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/api/voice**',r=>r.fulfill({status:403,body:'QA guard'}));await page.route('**/api/story**',r=>r.fulfill({status:403,body:'QA guard'}));
 await page.goto(base+'#/');await page.getByRole('button',{name:/Age 6\+ Amari/}).click();await page.getByText('Choose a world',{exact:true}).waitFor();
 const ids=['codecadets','writingdesk','tictactoe','hangman','dino','jet','solar','german','math','letters','memory','pattern','spot','puzzle','trace','phonics','addition','subtraction','astronaut','worldmap','counting','words','storybooks','colormix','oddoneout','timeteller','numberline','chess'];const rows=[];
 for(const id of ids){
  const offset=errors.length;await page.goto(base+'#/play/'+id);const ready=page.locator(`[data-discovery-game="${id}"]`);const choice=await Promise.race([ready.waitFor().then(()=>true),page.getByRole('button',{name:'Keep playing',exact:true}).waitFor().then(()=>false)]);if(!choice){await page.getByRole('button',{name:/^Back to world$/i}).click();await page.goto(base+'#/play/'+id);await ready.waitFor();}await page.locator('.discovery-game-content').getByRole('button').first().waitFor();
  for(const width of [1440,390]){await page.setViewportSize({width,height:1000});await page.waitForFunction(()=>[...document.images].every(i=>i.complete));const metrics=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.alt)}));rows.push({id,...metrics,pageErrors:errors.slice(offset)});}
 }
 return rows;
}
