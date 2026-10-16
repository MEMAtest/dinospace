async page => {
 await page.getByRole('button',{name:'Code Cadets',exact:true}).click();await page.getByRole('button',{name:'Open saved program',exact:true}).click();await page.getByRole('button',{name:'Run program',exact:true}).click();await page.getByText('Mission complete! The rover followed your instructions in order.',{exact:true}).waitFor();
 await page.screenshot({path:'output/playwright/amari-rehearsal/preview-coding-390.png',fullPage:true});
 await page.getByRole('button',{name:'✦ Discovery HQ Digital Skills Studio'}).click();await page.getByRole('link',{name:/Explore the planets/}).click();await page.getByRole('button',{name:/Age 6\+ Amari/}).click();await page.getByRole('navigation',{name:'Continue your discovery'}).waitFor();
 await page.getByRole('button',{name:'Mars',exact:true}).click();await page.getByRole('heading',{name:'Mars',exact:true}).waitFor();
 await page.screenshot({path:'output/playwright/amari-rehearsal/preview-solar-390.png',fullPage:true});
 await page.getByRole('link',{name:'Write a discovery report →',exact:true}).click();await page.getByRole('heading',{name:'My Writing Desk',exact:true}).waitFor();await page.getByRole('button',{name:'Open saved document',exact:true}).click();await page.getByRole('heading',{name:'My Mars Journey',exact:true}).waitFor();
}
