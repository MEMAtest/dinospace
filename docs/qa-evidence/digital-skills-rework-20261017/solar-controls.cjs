async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.getByRole('heading',{name:'Meet Earth up close',exact:true}).waitFor();
 await page.locator('[data-planet-models="9"]').waitFor();
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});const canvas=page.locator('canvas');await canvas.scrollIntoViewIfNeeded();
  await page.screenshot({path:`output/playwright/amari-rework-20261017/solar-close-earth-${width}.png`,fullPage:true});
  const box=await canvas.boundingBox();await page.mouse.move(box.x+box.width/2,Math.max(10,box.y+box.height/2));const before=await page.evaluate(()=>scrollY);await page.mouse.wheel(0,550);await page.waitForFunction(y=>scrollY>y+100,before);
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Solar horizontal overflow');
  await page.getByRole('button',{name:'Rotate planet right',exact:true}).click();await page.getByRole('button',{name:'Tilt planet up',exact:true}).click();await page.getByRole('button',{name:'Zoom in on planet',exact:true}).click();await page.getByRole('button',{name:'Zoom out from planet',exact:true}).click();
 }
 await page.getByRole('button',{name:'Centre Earth',exact:true}).click();
 await page.locator('canvas').scrollIntoViewIfNeeded();await page.locator('canvas').screenshot({path:'output/playwright/amari-rework-20261017/earth-before-drag.png'});
 await page.getByRole('button',{name:'Drag to inspect',exact:true}).click();await page.locator('canvas').scrollIntoViewIfNeeded();const b=await page.locator('canvas').boundingBox();await page.mouse.move(b.x+b.width*.65,b.y+b.height*.55);await page.mouse.down();await page.mouse.move(b.x+b.width*.3,b.y+b.height*.55,{steps:16});await page.mouse.up();await page.locator('canvas').screenshot({path:'output/playwright/amari-rework-20261017/earth-after-drag.png'});
 await page.getByRole('button',{name:'Done moving · scroll page',exact:true}).click();
 if(await page.locator('canvas').evaluate(c=>getComputedStyle(c).touchAction)!=='pan-y')throw Error('Touch scroll not restored');
 const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});await page.locator('canvas').scrollIntoViewIfNeeded();const t=await page.locator('canvas').boundingBox();const y0=await page.evaluate(()=>scrollY),x=t.x+t.width*.5,y=Math.min(800,t.y+t.height*.75);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-i*25}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForFunction(v=>scrollY>v+80,y0);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:false});await cdp.detach();
 await page.getByRole('button',{name:'Saturn',exact:true}).click();await page.getByRole('heading',{name:'Meet Saturn up close'}).waitFor();await page.locator('canvas').scrollIntoViewIfNeeded();await page.screenshot({path:'output/playwright/amari-rework-20261017/saturn-mobile.png',fullPage:true});await page.getByRole('button',{name:'See whole Solar System',exact:true}).click();await page.locator('canvas').screenshot({path:'output/playwright/amari-rework-20261017/solar-angled-overview.png'});
 if(errors.length)throw Error(errors.join('\n'));
}
