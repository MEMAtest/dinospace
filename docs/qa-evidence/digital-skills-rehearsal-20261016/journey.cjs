async page => {
 await page.getByRole('navigation',{name:'Continue your discovery'}).waitFor();
 for(const width of [1440,390]){await page.setViewportSize({width,height:1000});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Journey overflow');await page.screenshot({path:`output/playwright/amari-rehearsal/journey-solar-${width}.png`,fullPage:true});}
 await page.getByRole('link',{name:'Next: Code Cadets →',exact:true}).click();await page.getByRole('heading',{name:'Code Cadets',exact:true}).waitFor();
 await page.getByRole('button',{name:'Writing Desk',exact:true}).click();await page.getByRole('heading',{name:'My Writing Desk',exact:true}).waitFor();
}
