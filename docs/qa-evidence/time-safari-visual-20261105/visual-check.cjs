async page => {
 await page.setViewportSize({width:390,height:740});
 if(await page.getByRole('heading',{name:'Sound Safari',exact:true}).count())await page.getByRole('button',{name:'Back to home'}).click();
 const read=page.getByRole('heading',{name:'Read & Write',exact:true});if(await read.count())await page.getByRole('button',{name:'Back to home'}).click();
 const world=page.locator('.discovery-world-card').filter({hasText:'Maths Missions'});await world.scrollIntoViewIfNeeded();await world.click();
 const time=page.locator('.catalogue-game-card').filter({hasText:'Time Teller'});await time.scrollIntoViewIfNeeded();await time.click();
 const owl=page.locator('[data-timeteller-menu] img[src="/art/catalog-v3/game-timeteller.webp"]');await owl.waitFor();await page.locator('[data-timeteller-start]:not(:disabled)').waitFor();await page.waitForFunction(()=>{const i=document.querySelector('[data-timeteller-menu] img');return i?.complete&&i.naturalWidth>0});await page.screenshot({path:'/tmp/amari-time-v67.png'});
 const a=await page.evaluate(()=>{let el=document.querySelector('[data-timeteller-start]'),r=el.getBoundingClientRect();return {height:r.height,bottom:r.bottom,hit:el.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)),overflow:document.documentElement.scrollWidth>innerWidth}});
 await page.getByRole('button',{name:'Back',exact:true}).click();await page.getByRole('button',{name:'Back to home'}).click();
 const readWorld=page.locator('.discovery-world-card').filter({hasText:'Read & Write'});await readWorld.scrollIntoViewIfNeeded();await readWorld.click();
 const sound=page.locator('.catalogue-game-card').filter({hasText:'Sound Safari'});await sound.scrollIntoViewIfNeeded();await sound.click();
 const lion=page.locator('img[src="/art/catalog-v3/game-phonics.webp"]');await lion.waitFor();await page.waitForTimeout(1200);await page.waitForFunction(()=>{const i=document.querySelector('img[src="/art/catalog-v3/game-phonics.webp"]');return i?.complete&&i.naturalWidth>0});await page.screenshot({path:'/tmp/amari-safari-v67.png'});
 const b=await page.getByRole('button',{name:/Listen for a sound/}).evaluate(el=>{const r=el.getBoundingClientRect();return {height:r.height,bottom:r.bottom,hit:el.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)),overflow:document.documentElement.scrollWidth>innerWidth}});
 return {passed:[a,b].every(x=>x.height>=44&&x.hit&&!x.overflow&&x.bottom<=740),time:a,safari:b};
}
