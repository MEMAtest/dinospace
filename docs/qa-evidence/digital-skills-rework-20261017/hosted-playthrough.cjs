async page=>{
 await page.route('**/api/voice**',r=>r.fulfill({status:403,body:'QA guard'}));await page.route('**/api/story/**',r=>r.fulfill({status:403,body:'QA guard'}));
 await page.setViewportSize({width:390,height:844});
 await page.goto('https://dinospace-wczh2z4ss-memas-projects-23a0001d.vercel.app/rehearsal/index.html');
{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.getByRole('button',{name:'Code Cadets',exact:true}).click();await page.getByRole('button',{name:'Start my first mission →'}).click();
 await page.screenshot({path:'output/playwright/amari-rework-20261017/code-guided-mobile.png',fullPage:true});
 for(let i=0;i<3;i++)await page.getByRole('button',{name:'Add one Forward →',exact:true}).click();
 await page.getByRole('button',{name:'Run my first program →'}).click();await page.getByText('Mission complete! The rover followed your instructions in order.',{exact:true}).waitFor();
 await page.screenshot({path:'output/playwright/amari-rework-20261017/code-sequence-complete.png',fullPage:true});
 await page.getByRole('button',{name:'Next mission →'}).click();
 await page.getByRole('button',{name:'Run program',exact:true}).click();await page.getByText('The rover stopped before reaching the flag. Step through your program and check each move.',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Add Forward',exact:true}).click();
 for(const n of [5,4,3])await page.getByRole('button',{name:`Move block ${n} earlier`,exact:true}).click();
 await page.getByRole('button',{name:'Run program',exact:true}).click();await page.getByText('Mission complete! Moving the turn changed the route. You debugged a program.',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Next mission →'}).click();
 for(const name of ['Add 3 × Forward','Add ↷ Turn right','Add 3 × Forward','Add ◆ Collect'])await page.getByRole('button',{name,exact:true}).click();
 await page.getByRole('button',{name:'Run program',exact:true}).click();await page.getByText('Mission complete! Repeat ran the same move three times using one block.',{exact:true}).waitFor();
 await page.getByText('Name, save or open my program',{exact:true}).click();await page.getByRole('textbox',{name:'Program name',exact:true}).fill('Pip sample rescue');await page.getByRole('button',{name:'Save program',exact:true}).click();
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'output/playwright/amari-rework-20261017/code-repeat-desktop.png',fullPage:true});
 if(errors.length)throw Error(errors.join('\n'));
}
{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.getByRole('button',{name:'Writing Desk',exact:true}).click();await page.getByRole('button',{name:'Mars',exact:true}).click();await page.getByRole('button',{name:'Make my Mars postcard →'}).click();
 await page.getByRole('textbox',{name:'Your document',exact:true}).locator('h1').click({position:{x:20,y:20}});await page.keyboard.type('Hello from Mars!');
 await page.getByRole('button',{name:'Next: write my message →'}).click();await page.keyboard.type('I can see red rocks and a huge volcano.');
 await page.getByRole('button',{name:'Next: decorate my postcard →'}).click();await page.getByRole('button',{name:'Add Mars picture',exact:true}).first().click();await page.getByRole('textbox',{name:'Your document'}).locator('img').waitFor();await page.getByRole('button',{name:'Next: save & share →'}).click();
 await page.getByText('More writing tools · bold and layout',{exact:true}).click();
 const heading=page.getByRole('textbox',{name:'Your document'}).getByRole('heading',{name:'Hello from Mars!',exact:true});await heading.dblclick({position:{x:20,y:20}});await page.getByRole('button',{name:'Bold',exact:true}).click();if(!await heading.locator('strong').count())throw Error('Selected word not bold');await page.getByRole('button',{name:'Undo',exact:true}).click();await page.getByRole('button',{name:'Redo',exact:true}).click();
 await page.getByRole('button',{name:'Save document',exact:true}).click();await page.getByRole('button',{name:'Code Cadets',exact:true}).click();await page.getByRole('button',{name:'Start my first mission →'}).waitFor();await page.getByRole('button',{name:'Open saved program',exact:true}).click();await page.getByRole('heading',{name:'Code Cadets',exact:true}).waitFor();await page.getByRole('button',{name:'Writing Desk',exact:true}).click();await page.getByRole('button',{name:'Open saved document',exact:true}).click();await page.getByRole('heading',{name:'Hello from Mars!',exact:true}).waitFor();
 await page.getByRole('textbox',{name:'Your document'}).getByText('I can see red rocks and a huge volcano.',{exact:true}).waitFor();
 const d=page.waitForEvent('download');await page.getByRole('button',{name:'Download Word document',exact:true}).click();await(await d).saveAs('output/playwright/amari-rework-20261017/Mars-postcard.docx');
 for(const width of [1440,390]){await page.setViewportSize({width,height:1000});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Writing overflow');await page.screenshot({path:`output/playwright/amari-rework-20261017/writing-complete-${width}.png`,fullPage:true});}
 if(errors.length)throw Error(errors.join('\n'));}
await page.getByRole('button',{name:'✦ Discovery HQ Digital Skills Studio'}).click();await page.getByRole('link',{name:/Explore the planets/}).click();await page.getByRole('button',{name:/Age 6\+ Amari/}).click();
{
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
}