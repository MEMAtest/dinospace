async page => {
 const failures=[],responses=[],provider=[];
 const fail=r=>failures.push({url:r.url(),error:r.failure()?.errorText});
 const response=r=>{if(r.status()>=400)responses.push({url:r.url(),status:r.status()})};
 page.on('requestfailed',fail);page.on('response',response);
 await page.unroute('**/api/**'); await page.route('**/api/**',r=>{provider.push(r.request().url());return r.fulfill({status:403,body:'QA guard'})});
 try {
  if(!page.url().includes('/world/creative'))throw Error('Expected Creative Lab after the full run');
  await page.waitForLoadState('networkidle',{timeout:15000});
  const before=await page.evaluate(()=>[...document.images].filter(i=>{let r=i.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.width>0}).map(i=>({url:i.currentSrc,ok:i.complete&&i.naturalWidth>0})));
  await page.getByRole('button',{name:'Back to home'}).click();
  await page.getByRole('heading',{name:'Choose a world',exact:true}).waitFor();
  await page.waitForLoadState('networkidle',{timeout:15000});
  await page.locator('.discovery-world-card').filter({hasText:'Creative Lab'}).click();
  await page.getByRole('heading',{name:'Creative Lab',exact:true}).waitFor();
  await page.waitForFunction(() => [...document.images].filter(i=>{const r=i.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.width>0}).every(i=>i.complete&&i.naturalWidth>0), null, {timeout:15000});
  await page.waitForLoadState('networkidle',{timeout:15000});
  const after=await page.evaluate(()=>[...document.images].filter(i=>{let r=i.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.width>0}).map(i=>({url:i.currentSrc,ok:i.complete&&i.naturalWidth>0})));
  return {passed:before.length>0&&after.length>0&&before.every(x=>x.ok)&&after.every(x=>x.ok)&&!failures.length&&!responses.length&&!provider.length,before,after,failures,responses,provider};
 } finally {page.off('requestfailed',fail);page.off('response',response)}
}
