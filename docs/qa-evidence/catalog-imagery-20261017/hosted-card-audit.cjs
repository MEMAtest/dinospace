async page => {
 const base='https://dinospace-ah6zt73dv-memas-projects-23a0001d.vercel.app/';
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/voice**',r=>r.fulfill({status:403,body:'QA guard'}));
 await page.route('**/api/story**',r=>r.fulfill({status:403,body:'QA guard'}));
 await page.goto(base+'?catalogqa='+Date.now()+'#/');
 await page.getByRole('button',{name:/Age 6\+ Amari/}).click();
 const rows=[];
 const worlds=['Read & Write','Maths Missions','Explore & Languages','Creative Lab','Thinking & Play'];
 for (const width of [1440,390]) {
  await page.setViewportSize({width,height:1000});
  await page.getByText('Choose a world',{exact:true}).waitFor();
  for(const img of await page.locator('.discovery-world-icon img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());}
  await page.locator('#worlds-heading').scrollIntoViewIfNeeded();
  rows.push(await page.evaluate(()=>({kind:'home',width:innerWidth,documentWidth:document.documentElement.scrollWidth,worldImages:[...document.querySelectorAll('.discovery-world-icon img')].map(i=>({src:i.getAttribute('src'),ok:i.complete&&i.naturalWidth>0}))})));
  await page.screenshot({path:'output/playwright/catalog-v3/home-'+width+'.png',fullPage:true});
  for(const title of worlds) {
   await page.locator('.discovery-world-card').filter({hasText:title}).click();
   await page.getByRole('heading',{name:title,exact:true}).waitFor();
   for(const img of await page.locator('.catalogue-game-art').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());}
   const metrics=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,images:[...document.querySelectorAll('.catalogue-game-art')].map(i=>({src:i.getAttribute('src'),ok:i.complete&&i.naturalWidth>0,width:i.getBoundingClientRect().width,height:i.getBoundingClientRect().height})),clippedTitles:[...document.querySelectorAll('.catalogue-game-card h2')].filter(i=>i.scrollWidth>i.clientWidth+1).map(i=>i.textContent)}));
   rows.push({kind:'world',title,...metrics});
   await page.screenshot({path:'output/playwright/catalog-v3/'+title.replace(/[^a-z]/gi,'').toLowerCase()+'-'+width+'.png',fullPage:true});
   const favorite=page.getByRole('button',{name:/^Add .* to favourites$/}).first();if(await favorite.count()){const name=await favorite.getAttribute('aria-label');await favorite.click();await page.getByRole('button',{name:name.replace(/^Add /,'Remove ').replace(/ to favourites$/,' from favourites'),exact:true}).click();}
   await page.getByRole('button',{name:'Back to home',exact:true}).click();
   await page.getByText('Choose a world',{exact:true}).waitFor();
  }
 }
 return {rows,pageErrors:errors};
}
