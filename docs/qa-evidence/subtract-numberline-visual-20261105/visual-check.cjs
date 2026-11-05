async page => {
 await page.setViewportSize({width:390,height:740});
 const card=page.locator('.catalogue-game-card').filter({hasText:'Subtraction Station'});await card.scrollIntoViewIfNeeded();await card.click();
 const sub=page.locator('[data-subtraction-menu] img[src="/art/catalog-v3/game-subtraction.webp"]');await sub.waitFor();await page.waitForFunction(()=>{const i=document.querySelector('[data-subtraction-menu] img');return i?.complete&&i.naturalWidth>0});
 await page.screenshot({path:'/tmp/amari-sub-v66.png'});
 const a=await page.evaluate(()=>{const el=document.querySelector('[data-subtraction-start]'),r=el.getBoundingClientRect();return {width:r.width,height:r.height,bottom:r.bottom,hit:el.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)),overflow:document.documentElement.scrollWidth>innerWidth}});
 await page.getByRole('button',{name:'Back to Maths Missions'}).click();
 const line=page.locator('.catalogue-game-card').filter({hasText:'Number Line Jump'});await line.scrollIntoViewIfNeeded();await line.click();
 const frog=page.locator('[data-numberline-menu] section img').first();await frog.waitFor();await page.waitForFunction(()=>{const i=document.querySelector('[data-numberline-menu] section img');return i?.complete&&i.naturalWidth>0});
 await page.screenshot({path:'/tmp/amari-line-v66.png'});
 const b=await page.evaluate(()=>{const el=document.querySelector('[data-numberline-start]'),r=el.getBoundingClientRect();return {width:r.width,height:r.height,bottom:r.bottom,hit:el.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)),overflow:document.documentElement.scrollWidth>innerWidth}});
 return {passed:[a,b].every(x=>x.height>=44&&x.hit&&!x.overflow&&x.bottom<=740),subtraction:a,numberline:b};
}
