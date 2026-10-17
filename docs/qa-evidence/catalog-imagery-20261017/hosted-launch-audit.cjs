async page => {
 const base='https://dinospace-ah6zt73dv-memas-projects-23a0001d.vercel.app/?launchqa='+Date.now();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/voice**',r=>r.fulfill({status:403,body:'QA guard'}));await page.route('**/api/story**',r=>r.fulfill({status:403,body:'QA guard'}));
 await page.goto(base+'#/');await page.getByRole('button',{name:/Age 6\+ Amari/}).click();
 const rows=[];
 for(const width of [1440,390]){
 await page.setViewportSize({width,height:1000});
 for(const [world,id] of [['Read & Write','letters'],['Maths Missions','counting'],['Explore & Languages','solar'],['Creative Lab','codecadets'],['Thinking & Play','memory']]){
 await page.locator('.discovery-world-card').filter({hasText:world}).click();
 await page.locator('.catalogue-game-card').first().click();
 await page.locator('[data-discovery-game="'+id+'"]').waitFor();
 await page.locator('.discovery-game-content').getByRole('button').first().waitFor();
 const artwork=page.locator('.catalogue-welcome-art .catalogue-game-art');
 if(await artwork.count()) await artwork.evaluate(i=>i.decode());
 rows.push({world,id,width,url:page.url(),...(await page.evaluate(()=>({documentWidth:document.documentElement.scrollWidth,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)})))});
 if(id==='letters') await page.screenshot({path:'output/playwright/catalog-v3/welcome-'+width+'.png',fullPage:true});
 await page.getByRole('button',{name:'Worlds',exact:true}).click();
 const leave=page.getByRole('button',{name:'Back to world',exact:true});
 await Promise.race([page.getByRole('heading',{name:world,exact:true}).waitFor(),leave.waitFor()]);
 if(await leave.isVisible())await leave.click();
 await page.getByRole('heading',{name:world,exact:true}).waitFor();
 await page.getByRole('button',{name:'Back to home',exact:true}).click();
 }
 }
 return {rows,pageErrors:errors};
}
