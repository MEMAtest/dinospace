async page=>{
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.getByRole('navigation',{name:'Discovery navigation'}).getByRole('button',{name:'Home',exact:true}).click();
const choice=await Promise.race([page.getByText('Choose a world',{exact:true}).waitFor().then(()=>true),page.getByRole('button',{name:'Keep playing',exact:true}).waitFor().then(()=>false)]);
if(!choice)await page.getByRole('button',{name:'Back to home',exact:true}).click();
await page.locator('.discovery-world-card').filter({hasText:'Creative Lab'}).click();
await page.locator('.catalogue-game-card').filter({hasText:'Code Cadets'}).click();
await page.getByRole('button',{name:'Open saved program',exact:true}).click();
const blocks=await page.getByRole('list',{name:'Instruction sequence'}).getByRole('listitem').count();if(blocks!==4)throw Error('Saved sample program missing');
await page.screenshot({path:'output/playwright/catalog-production-20261017/reopened-code-390.png',fullPage:true});
return {savedProgramReopened:true,blocks,pageErrors:errors,bundles:await page.locator('script[src]').evaluateAll(s=>s.map(x=>x.src))};
}