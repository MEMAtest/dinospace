async page => {
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Open saved program',exact:true}).click();
 await page.getByRole('button',{name:'Run program',exact:true}).click();
 await page.getByText('Mission complete! Repeat ran the same move three times using one block.',{exact:true}).waitFor();
 const small=await page.getByRole('button').evaluateAll(buttons=>buttons.filter(b=>!b.disabled).map(b=>({text:b.textContent,w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height})).filter(b=>b.w<48||b.h<48));
 if(small.length)throw new Error('Small targets '+JSON.stringify(small));
 await page.screenshot({path:'output/playwright/amari-rehearsal/coding-final-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Writing Desk',exact:true}).click();
 await page.getByRole('button',{name:'Open saved document',exact:true}).click();
 await page.getByRole('textbox',{name:'Your document'}).getByRole('heading',{name:'Mars Mission'}).waitFor();
 await page.getByRole('textbox',{name:'Your document'}).locator('img').click(); await page.keyboard.press('Backspace');
 await page.getByRole('combobox',{name:'Picture planet',exact:true}).selectOption('Mars');
 await page.getByRole('button',{name:'Add Mars picture',exact:true}).click();
 await page.getByRole('textbox',{name:'Your document'}).locator('img[alt="Mars from the Solar System"]').waitFor();
 await page.getByRole('button',{name:'Save document',exact:true}).click();
 const downloading=page.waitForEvent('download');await page.getByRole('button',{name:'Download Word document',exact:true}).click();await (await downloading).saveAs('output/playwright/amari-rehearsal/Amari-Mars-Postcard-final.docx');
 const button=page.getByRole('button',{name:'Save document',exact:true});await button.hover();
 const contrast=await button.evaluate(b=>({color:getComputedStyle(b).color,background:getComputedStyle(b).backgroundColor}));
 if(contrast.background!=='rgb(6, 93, 102)'||contrast.color!=='rgb(255, 255, 255)')throw new Error('Save contrast regression '+JSON.stringify(contrast));
 await page.screenshot({path:'output/playwright/amari-rehearsal/writing-final-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'output/playwright/amari-rehearsal/writing-final-desktop.png',fullPage:true});
}
