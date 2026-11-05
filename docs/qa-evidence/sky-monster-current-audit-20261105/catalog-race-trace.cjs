async page => {
 const log=[],inflight=new Map(),prefix='/art/catalog-v3/';
 const req=r=>{if(r.url().includes(prefix)){inflight.set(r,{url:r.url(),startUrl:page.url(),t:Date.now()});log.push({kind:'start',url:r.url(),route:page.url(),t:Date.now()})}};
 const end=r=>{if(inflight.has(r))log.push({kind:'end',url:r.url(),route:page.url(),t:Date.now()})};
 const bad=r=>{if(inflight.has(r))log.push({kind:'fail',url:r.url(),route:page.url(),startUrl:inflight.get(r).startUrl,error:r.failure()?.errorText,t:Date.now()})};
 page.on('request',req);page.on('requestfinished',end);page.on('requestfailed',bad);
 try {
  if(!page.url().includes('#/home'))throw Error('Expected home after prior navigation probe');
  for(let i=0;i<3;i++){
   await page.locator('.discovery-world-card').filter({hasText:'Creative Lab'}).click();
   await page.getByRole('heading',{name:'Creative Lab',exact:true}).waitFor();
   const c=page.locator('.catalogue-game-card').filter({hasText:'Sky Shapes'});await c.scrollIntoViewIfNeeded();await c.click();
   await page.getByRole('button',{name:'Back to learning world'}).waitFor();await page.getByRole('button',{name:'Back to learning world'}).click();
   await page.getByRole('heading',{name:'Creative Lab',exact:true}).waitFor();await page.getByRole('button',{name:'Back to home'}).click();
   await page.getByRole('heading',{name:'Choose a world',exact:true}).waitFor();
  }
  await page.waitForTimeout(2000);return {log,failures:log.filter(x=>x.kind==='fail'),finish:page.url()};
 } finally {page.off('request',req);page.off('requestfinished',end);page.off('requestfailed',bad)}
}
