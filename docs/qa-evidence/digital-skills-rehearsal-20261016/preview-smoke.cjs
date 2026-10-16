async page => {
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/voice**',r=>r.fulfill({status:403,body:'QA guard'}));await page.route('**/api/story/**',r=>r.fulfill({status:403,body:'QA guard'}));
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('https://dinospace-evbwxb7ws-memas-projects-23a0001d.vercel.app/rehearsal/index.html');
 await page.getByRole('button',{name:/Start coding/}).click();
 for(let i=0;i<3;i++)await page.getByRole('button',{name:'Add ↑ Forward',exact:true}).click();
 await page.getByRole('button',{name:'Run program',exact:true}).click();
 await page.getByText('Mission complete! The rover followed your instructions in order.',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Save program',exact:true}).click();
 await page.getByRole('button',{name:'Writing Desk',exact:true}).click();
 await page.getByRole('button',{name:'Heading',exact:true}).click();await page.getByRole('textbox',{name:'Your document',exact:true}).fill('My Mars Journey');await page.keyboard.press('Enter');await page.keyboard.type('I programmed a rover to reach the flag.');
 await page.getByRole('combobox',{name:'Picture planet',exact:true}).selectOption('Mars');await page.getByRole('button',{name:'Add Mars picture',exact:true}).click();await page.getByRole('textbox',{name:'Your document'}).locator('img').waitFor();
 await page.getByRole('button',{name:'Save document',exact:true}).click();
 await page.getByRole('button',{name:'Code Cadets',exact:true}).click();await page.getByRole('button',{name:'Open saved program',exact:true}).click();
 if(await page.getByRole('list',{name:'Instruction sequence'}).getByRole('listitem').count()!==3)throw Error('Saved program missing');
 await page.getByRole('button',{name:'Writing Desk',exact:true}).click();await page.getByRole('button',{name:'Open saved document',exact:true}).click();await page.getByRole('heading',{name:'My Mars Journey',exact:true}).waitFor();
 const downloading=page.waitForEvent('download');await page.getByRole('button',{name:'Download Word document',exact:true}).click();await(await downloading).saveAs('output/playwright/amari-rehearsal/preview-postcard.docx');
 for(const width of [1440,390]){await page.setViewportSize({width,height:1000});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Overflow '+width);await page.screenshot({path:`output/playwright/amari-rehearsal/preview-writing-${width}.png`,fullPage:true});}
 if(errors.length)throw Error(errors.join('\n'));
}
